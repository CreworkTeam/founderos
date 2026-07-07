import type { Archetype, QuizAnswers, RouteKey } from "@/types";
import { createHash } from "crypto";

const DEFAULT_TTL_MS = 1000 * 60 * 20;
const CACHE_TTL_MS = Number(process.env.REPORT_CACHE_TTL_MS ?? DEFAULT_TTL_MS);

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

function hashQuiz(quiz: QuizAnswers): string {
  const stable = JSON.stringify({
    q1: quiz.q1 ?? null,
    q2: quiz.q2 ?? "",
    q3: quiz.q3 ?? null,
    q4: quiz.q4 ?? null,
  });
  return createHash("sha256").update(stable).digest("hex");
}

export function buildReportCacheKey(args: {
  route: RouteKey;
  archetype: Archetype;
  quiz: QuizAnswers;
}): string {
  return `${args.route}:${args.archetype}:${hashQuiz(args.quiz)}`;
}

export function getCachedReport<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value as T;
}

export function setCachedReport<T>(key: string, value: T): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}
