import type {
  Archetype,
  QuizAnswers,
  ReportA,
  ReportB,
  ReportC,
  RouteKey,
} from "@/types";
import { GEMINI_MODELS, geminiChatJson } from "@/lib/gemini";
import { parseReportA, parseReportB, parseReportC } from "@/lib/llmValidation";
import { z } from "zod";
import { getSocialThreads } from "@/lib/socialSearch";
export type LLMReportResult<T> = {
  report: T;
  modelArchetype: Archetype | null;
};

function quizContext(quiz: QuizAnswers): string {
  return `
- What problem does it solve: ${quiz.q1 ?? "not provided"}
- The startup idea: ${quiz.q2 ?? "not provided"}
- Target user / who has this problem: ${quiz.q3 ?? "not provided"}
- How users currently solve this (alternatives): ${quiz.q4 ?? "not provided"}
`.trim();
}

function reportSystemPrompt(route: RouteKey): string {
  if (route === "A") {
    return [
      "You are a startup analyst generating a demand validation report for a specific founder idea.",
      "Your job is to analyze the EXACT idea provided and return grounded, specific insights — not generic advice.",
      "Return exactly one JSON object with ONLY these top-level keys:",
      "archetype, demandSignals, communities, competitors, validationScore, blogLinks, keywordNote",
      "",
      "Field requirements:",
      "- archetype: one of marketplace|saas_tool|consumer_app|ai_wrapper|b2b_platform|community|ecommerce|developer_tool",
      "- demandSignals: 3-5 objects {theme, intent, estimatedVolume(low|moderate|high)}",
      '  * themes must be SPECIFIC to the idea (e.g. "find local football games" not "sports communities")',
      "  * intents must describe what real users search for related to THIS idea",
      "- communities: 4-6 objects {platform(Reddit|LinkedIn|Discord|Facebook|X|IndieHackers|Slack), name, description, whyItMatters, url?}",
      "  * these must be REAL communities where the target user of THIS idea hangs out",
      '  * name must be specific (e.g. "r/cscareerquestions" not just "Reddit")',
      "  * whyItMatters: one sentence connecting this community to THIS idea's specific problem — if you can't write a specific reason, drop the entry",
      "- competitors: 2-3 objects {name, whatTheyDo, gap, whyItMatters}",
      "  * name must be a REAL existing product, not made up",
      "  * gap must explain specifically what THIS idea does better",
      "  * whyItMatters: one sentence connecting this competitor to THIS idea's specific user problem",
      "- validationScore: {searchDemand:number(1-10), communityDensity:number(1-10), competitionIntensity:number(1-10), timing:number(1-10), overall:number(1-10)}",
      "  * overall is the average of the other 4 scores",
      "  * timing: is now the right time for this idea given current market/tech trends",
      "- blogLinks: 2-4 objects {label, url, context} — use real URLs only",
      "- keywordNote: specific SEO observation about THIS idea's search landscape",
      "  * MUST open with the strongest demand signal found — never lead with a caveat/hedge (bad: 'While direct search volume is moderate...'). State the strongest evidence first, then add nuance after.",
      "Do not include any extra keys. No generic advice. Every field must be specific to the idea.",
    ].join("\n");
  }

  if (route === "B") {
    return [
      "You are a startup product strategist generating an MVP scoping report for a specific founder idea.",
      "Your job is to define exactly what to build first — grounded in the idea, not generic.",
      "Return exactly one JSON object with ONLY these top-level keys:",
      "archetype, coreLoop, featurePriority, complexityLevel, complexityExplanation, techApproach, commonMistakes, aiTools, marketingPlan, blogLinks",
      "",
      "Field requirements:",
      "- archetype: one of marketplace|saas_tool|consumer_app|ai_wrapper|b2b_platform|community|ecommerce|developer_tool",
      "- coreLoop: string — the ONE action a user takes in this product that delivers value",
      '  * MUST describe user behavior, NOT technology (bad: "use React and Node.js", good: "user posts idea → gets matched with cofounders")',
      "  * Must be specific to THIS idea, 1-2 sentences max",
      "- featurePriority: 6-10 objects {name, why, group}",
      "  * group is one of: build_now (high need, low effort) | simplify (high need, high effort — recommend a no-code/buy alternative) | defer (low need, low effort) | skip (low need, high effort)",
      "  * ALL FOUR groups must have at least 1 item each — this is mandatory, not optional. If nothing genuinely fits skip, find the lowest-value/highest-effort feature and put it there anyway with honest reasoning",
      "  * when a feature is deferred instead of built now, the why field MUST state the concrete blocking reason (e.g. dependency, min users needed, sequencing) — not just 'less important'",
      "  * features must be specific to THIS idea's core loop",
      "- complexityLevel: Low|Medium|High",
      "- complexityExplanation: honest 1-2 sentence assessment of build difficulty for THIS idea specifically",
      '- techApproach: recommended stack for THIS idea with reasoning (e.g. "Next.js + Supabase because you need real-time and auth fast")',
      "- commonMistakes: 2-3 strings — mistakes founders of THIS type of product commonly make",
      "- aiTools: 2-4 objects {tool, useCase, url} — AI-native BUILDING tools (no-code/low-code app builders, AI coding assistants, or AI design tools) that help build the product faster",
      "  * Choose from or similar to: Lovable, Cursor, v0 by Vercel, Bolt, Replit Agent, Windsurf, Supabase AI, Base44",
      "- marketingPlan: {waitlistAdvice:string, communities:string[5], activeThreads:[{community,topic,suggestedComment}](5 items), weekOneChecklist:string[4-7]}",
      "- blogLinks: 2-4 objects {label, url, context}",
      "Do not include any extra keys.",
    ].join("\n");
  }

  return [
    "You are a startup technical advisor generating a build-readiness report for a specific founder idea.",
    "Your job is to give concrete, honest advice about whether and how to build this — specific to the idea.",
    "Return exactly one JSON object with ONLY these top-level keys:",
    "archetype, specItems, teamFit, roadmap, questionsToAskAgency, whatToBuildPlan, closingHeadline, blogLinks",
    "",
    "Field requirements:",
    "- archetype: one of marketplace|saas_tool|consumer_app|ai_wrapper|b2b_platform|community|ecommerce|developer_tool",
    "- specItems: objects {label, status(defined|needs_clarity|missing), note}",
    '  * label must be a real spec concern for THIS idea (e.g. "Payment split logic" not "Database")',
    "- teamFit: honest assessment of what technical skills this idea requires",
    "- roadmap: exactly 4 objects {week:number, title:string, deliverables:string[]}",
    "  * week 1, 2, 3, AND 4 must all be present — never omit week 4",
    '  * deliverables must be specific to THIS idea (not "Market research report")',
    "  * week 1 MUST be validation-only: talking to target users, no-code waitlist, posting in 1 relevant community, counting responses — NO technical build tasks (no auth, no dashboards, no code)",
    "  * technical build tasks start in week 2 at the earliest",
    "- closingHeadline: a short, human, motivating headline for the report's closing page — NOT a copy of the idea description. Speak to the founder directly (e.g. 'Your idea has legs. Let's build it.'). Max 8 words.",
    "- whatToBuildPlan: object with keys buildDecisions, northStarMetric, supportingKpis, unitEconomics, riskCallout, buildOrHire",
    "- buildDecisions: exactly 6 objects {group(build_first|build_v2|skip_for_now), title, body}",
    "  * decisions must be about THIS idea's actual features",
    "- northStarMetric: {metric, explanation, target, trackingNote}",
    "  * metric must be the ONE number that proves THIS idea is working",
    '  * target must include a specific number with timeframe (e.g. "500 active users in 90 days")',
    "- supportingKpis: exactly 3 objects {metric, explanation, threshold}",
    "  * leading indicators specific to THIS idea, distinct from the north star metric",
    '  * threshold must state a specific action trigger (e.g. "Below 20% = onboarding is broken")',
    "- buildOrHire: object {selfBuild, hire, ctaText, ctaUrl}",
    "  * selfBuild: {title, body} — honest 2-3 sentence path for a founder who has technical skills/time and isn't in a rush; mention relevant no-code/AI tools for THIS idea",
    "  * hire: {title, body, proofPoints} — path for a founder who lacks technical skills or wants this live in 4 weeks; body is 2-3 sentences; proofPoints: 4-6 strings, honest reasons to hire Crework Labs (4-week delivery, UX-first, affordable, full code ownership)",
    '  * ctaText: string, e.g. "Book a free 30-min scoping call"',
    '  * ctaUrl: exactly "https://calendly.com/creworklabs/30mins"',
    "- unitEconomics: object {title, description, points}",
    "  * title: string",
    "  * description: string",
    "  * points: array of EXACTLY 4 objects {commissionLabel, bookingsToTarget, artistsNeeded}",
    "  * commissionLabel: pricing tier label as a string (e.g. '$9/month' or '5% commission')",
    "  * bookingsToTarget: number — units/subscriptions needed to hit $1k MRR at that tier",
    "  * artistsNeeded: number — same as bookingsToTarget unless the model has a distinct supply-side actor",
    "  * ALL 4 points must include all 3 fields with non-null values. Do not omit any field.",
    "- riskCallout: {title, body} — the single biggest risk specific to THIS idea",
    "- blogLinks: 2-4 objects {label, url, context}",
    "Do not include any extra keys.",
  ].join("\n");
}

function reportUserPrompt(
  route: RouteKey,
  archetype: Archetype,
  quiz: QuizAnswers,
): string {
  return [
    `You are generating a Route ${route} report.`,
    `Archetype: ${archetype}`,
    "",
    "THE FOUNDER'S IDEA (use this for everything — every field must reference this idea):",
    quizContext(quiz),
    "",
    "Hard rules:",
    "- Every insight must be specific to this exact idea — no generic startup advice",
    "- Do not mention React, Node.js, or any tech stack in the coreLoop field",
    "- Do not use placeholder text, TBD, or lorem ipsum",
    "- All arrays must be non-empty",
    "- archetype field in output must exactly match: " + archetype,
    "- Return only a valid JSON object, no markdown, no explanation",
  ].join("\n");
}

export async function generateReportAWithLLM(
  archetype: Archetype,
  quiz: QuizAnswers,
): Promise<LLMReportResult<ReportA>> {
  const payload = await geminiChatJson({
    model: GEMINI_MODELS.report,
    systemPrompt: reportSystemPrompt("A"),
    userPrompt: reportUserPrompt("A", archetype, quiz),
    temperature: 0.1,
    maxTokens: 4096,
  });

  try {
    const parsed = parseReportA(payload);
    return {
      report: { ...parsed, archetype },
      modelArchetype: parsed.archetype,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid LLM payload for Report A: ${error.issues.map((i) => i.path.join(".")).join(", ")}`,
      );
    }
    throw error;
  }
}

export async function generateReportBWithLLM(
  archetype: Archetype,
  quiz: QuizAnswers,
): Promise<LLMReportResult<ReportB>> {
  const payload = await geminiChatJson({
    model: GEMINI_MODELS.report,
    systemPrompt: reportSystemPrompt("B"),
    userPrompt: reportUserPrompt("B", archetype, quiz),
    temperature: 0.1,
    maxTokens: 4096,
  });

  try {
    const parsed = parseReportB(payload);

    const idea = quiz.q2 || quiz.q1 || "";

    try {
      const realThreads = await getSocialThreads(idea);

      parsed.marketingPlan.activeThreads = realThreads;
    } catch (err) {
      console.error("Failed to fetch social threads", err);
    }

    return {
      report: { ...parsed, archetype },
      modelArchetype: parsed.archetype,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid LLM payload for Report B: ${error.issues.map((i) => i.path.join(".")).join(", ")}`,
      );
    }
    throw error;
  }
}

export async function generateReportCWithLLM(
  archetype: Archetype,
  quiz: QuizAnswers,
): Promise<LLMReportResult<ReportC>> {
  const payload = await geminiChatJson({
    model: GEMINI_MODELS.report,
    systemPrompt: reportSystemPrompt("C"),
    userPrompt: reportUserPrompt("C", archetype, quiz),
    temperature: 0.1,
    maxTokens: 20000,
  });

  try {
    const parsed = parseReportC(payload);
    return {
      report: { ...parsed, archetype },
      modelArchetype: parsed.archetype,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid LLM payload for Report C: ${error.issues.map((i) => i.path.join(".")).join(", ")}`,
      );
    }
    throw error;
  }
}
