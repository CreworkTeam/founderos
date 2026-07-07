import { NextRequest, NextResponse } from "next/server";
import {
  classifyIdeaWithSignals,
  isLikelyGibberishIdea,
  containsAbusiveContent,
} from "@/lib/classifier";
import { GEMINI_MODELS, geminiChatJson } from "@/lib/gemini";
import { isValidClassifierPayload } from "@/lib/llmValidation";
import type { ClassifyRequest } from "@/types";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: ClassifyRequest = await req.json();
    const idea = body.idea?.trim() ?? "";

    if (!idea || idea.length < 10) {
      const res = NextResponse.json(
        { error: "Idea must be at least 10 characters" },
        { status: 400 },
      );
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    }

    if (isLikelyGibberishIdea(idea)) {
      const res = NextResponse.json(
        {
          error:
            "Idea is too unclear to classify. Please describe the MVP in plain language.",
        },
        { status: 422 },
      );
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    }
    if (containsAbusiveContent(idea)) {
      const res = NextResponse.json(
        {
          error:
            "This idea cannot be processed. Please describe a legitimate business idea.",
        },
        { status: 422 },
      );
      res.headers.set("Access-Control-Allow-Origin", "*");
      return res;
    }

    const jsResult = classifyIdeaWithSignals(idea);
    let archetype = jsResult.archetype;
    let source: "js" | "llm_fallback" | "js_fallback_after_llm_error" = "js";
    let usedLLMFallback = false;
    let fallbackReason: string | null = null;

    // Rare fallback: use LLM classifier only when JS confidence is low and idea is long/ambiguous.
    const shouldUseFallback = jsResult.confidence < 0.45 && idea.length > 70;
    if (shouldUseFallback && process.env.GEMINI_API_KEY) {
      try {
        const payload = await geminiChatJson({
          model: GEMINI_MODELS.classifier,
          systemPrompt:
            "Classify startup ideas into one archetype. Allowed values: marketplace, saas_tool, consumer_app, ai_wrapper, b2b_platform, community, ecommerce, developer_tool.",
          userPrompt: [
            "Classify this MVP idea into one archetype.",
            `Idea: ${idea}`,
            'Return JSON object: {"archetype":"..."}',
          ].join("\n"),
          temperature: 0,
          maxTokens: 120,
        });

        if (isValidClassifierPayload(payload)) {
          archetype = payload.archetype;
          source = "llm_fallback";
          usedLLMFallback = true;
          console.info("[classify] source=llm_fallback", {
            confidence: jsResult.confidence,
            maxScore: jsResult.maxScore,
          });
        }
      } catch (error) {
        source = "js_fallback_after_llm_error";
        fallbackReason =
          error instanceof Error ? error.message : "Unknown LLM fallback error";
        console.warn(
          "[classify] LLM fallback failed; using JS classifier:",
          error,
        );
        console.info("[classify] source=js_fallback_after_llm_error", {
          confidence: jsResult.confidence,
          maxScore: jsResult.maxScore,
        });
      }
    } else {
      console.info("[classify] source=js", {
        confidence: jsResult.confidence,
        maxScore: jsResult.maxScore,
      });
    }

    const response = {
      archetype,
      source,
      confidence: jsResult.confidence,
      usedLLMFallback,
      fallbackReason,
    };
    const res = NextResponse.json(response);
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  } catch {
    const res = NextResponse.json(
      { error: "Classification failed" },
      { status: 500 },
    );
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  }
}
