type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

const REQUEST_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS ?? 45000);
const RETRY_ATTEMPTS = Number(process.env.LLM_RETRY_ATTEMPTS ?? 2);
const RETRY_BACKOFF_MS = Number(process.env.LLM_RETRY_BACKOFF_MS ?? 400);
const CIRCUIT_FAILURE_THRESHOLD = Number(
  process.env.LLM_CIRCUIT_FAILURE_THRESHOLD ?? 3,
);
const CIRCUIT_RESET_MS = Number(process.env.LLM_CIRCUIT_RESET_MS ?? 60000);

const circuitState: { consecutiveFailures: number; openedAt: number | null } = {
  consecutiveFailures: 0,
  openedAt: null,
};

export const GEMINI_MODELS = {
  report: "gemini-2.5-flash",
  classifier: "gemini-2.5-flash-lite",
} as const;

function isCircuitOpen(): boolean {
  if (circuitState.openedAt === null) return false;
  const elapsed = Date.now() - circuitState.openedAt;
  if (elapsed >= CIRCUIT_RESET_MS) {
    circuitState.openedAt = null;
    circuitState.consecutiveFailures = 0;
    return false;
  }
  return true;
}

function markSuccess(): void {
  circuitState.consecutiveFailures = 0;
  circuitState.openedAt = null;
}

function markFailure(): void {
  circuitState.consecutiveFailures += 1;
  if (circuitState.consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD) {
    circuitState.openedAt = Date.now();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safePreview(text: string, max = 600): string {
  return text.length <= max ? text : `${text.slice(0, max)}...`;
}

function logGeminiResponse(event: {
  model: string;
  attempt: number;
  success: boolean;
  status?: number;
  latencyMs: number;
  rawText?: string;
  error?: string;
}): void {
  const payload = {
    provider: "gemini",
    model: event.model,
    attempt: event.attempt,
    success: event.success,
    status: event.status,
    latencyMs: event.latencyMs,
    rawPreview: event.rawText ? safePreview(event.rawText) : undefined,
    error: event.error,
    circuitOpen: isCircuitOpen(),
    consecutiveFailures: circuitState.consecutiveFailures,
  };

  if (event.success) {
    console.info("[llm/gemini] response", payload);
  } else {
    console.warn("[llm/gemini] response_error", payload);
  }
}

function cleanJsonText(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch?.[1]) return fenceMatch[1].trim();
  return trimmed;
}

function extractLikelyJsonObject(text: string): string {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) return text.slice(first, last + 1);
  return text;
}

export function parseJsonObject(text: string): unknown {
  const cleaned = cleanJsonText(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const extracted = extractLikelyJsonObject(cleaned);
    return JSON.parse(extracted);
  }
}

export async function geminiChatJson(params: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<unknown> {
  if (isCircuitOpen()) {
    throw new Error("LLM circuit breaker is open");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${apiKey}`;

  const body = {
    systemInstruction: {
      parts: [
        {
          text: `${params.systemPrompt}\n\nReturn only valid JSON. No markdown. No explanation. No code blocks.`,
        },
      ],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: params.userPrompt }],
      },
    ],
    generationConfig: {
      temperature: params.temperature ?? 0.2,
      maxOutputTokens: params.maxTokens ?? 5000,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    const started = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        logGeminiResponse({
          model: params.model,
          attempt,
          success: false,
          status: res.status,
          latencyMs: Date.now() - started,
          rawText: text,
          error: `HTTP_${res.status}`,
        });
        throw new Error(`Gemini request failed: ${res.status} ${text}`);
      }

      const json = (await res.json()) as GeminiResponse;
      const raw = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!raw) {
        logGeminiResponse({
          model: params.model,
          attempt,
          success: false,
          status: res.status,
          latencyMs: Date.now() - started,
          error: "EMPTY_CONTENT",
        });
        throw new Error("Gemini returned empty content");
      }

      const parsed = parseJsonObject(raw);
      markSuccess();
      logGeminiResponse({
        model: params.model,
        attempt,
        success: true,
        status: res.status,
        latencyMs: Date.now() - started,
        rawText: raw,
      });

      clearTimeout(timeout);
      return parsed;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      logGeminiResponse({
        model: params.model,
        attempt,
        success: false,
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (attempt < RETRY_ATTEMPTS) {
        await sleep(RETRY_BACKOFF_MS * attempt);
      }
    }
  }

  markFailure();
  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini request failed");
}
