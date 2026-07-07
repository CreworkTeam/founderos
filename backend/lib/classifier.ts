import type { Archetype } from "@/types";

// ─── Keyword map ──────────────────────────────────────────────────────────────
// Each archetype has a set of trigger keywords.
// The archetype with the most keyword hits wins.
// Tie goes to the first match in priority order below.

const ARCHETYPE_KEYWORDS: Record<Archetype, string[]> = {
  marketplace: [
    "marketplace",
    "connect",
    "buyers",
    "sellers",
    "listing",
    "listings",
    "commission",
    "two-sided",
    "two sided",
    "platform for",
    "hire",
    "freelancer",
    "vendor",
    "supplier",
    "booking",
    "rent",
    "rental",
    "peer to peer",
    "p2p",
    "gig",
    "on-demand",
  ],
  ai_wrapper: [
    "ai",
    "llm",
    "gpt",
    "chatgpt",
    "claude",
    "gemini",
    "openai",
    "generate",
    "generated",
    "generative",
    "prompt",
    "automate with ai",
    "ai-powered",
    "ai powered",
    "machine learning",
    "ml model",
    "copilot",
    "assistant",
    "chatbot",
    "natural language",
  ],
  developer_tool: [
    "sdk",
    "api",
    "cli",
    "library",
    "package",
    "npm",
    "open source",
    "developer",
    "developers",
    "devs",
    "engineers",
    "infrastructure",
    "devops",
    "ci/cd",
    "pipeline",
    "debugging",
    "monitoring",
    "observability",
    "code",
    "coding",
    "deployment",
    "hosted",
    "self-hosted",
  ],
  ecommerce: [
    "sell",
    "selling",
    "shop",
    "store",
    "storefront",
    "product",
    "inventory",
    "shipping",
    "checkout",
    "cart",
    "physical",
    "digital product",
    "merchandise",
    "ecommerce",
    "e-commerce",
    "dropship",
    "wholesale",
    "retail",
  ],
  community: [
    "community",
    "network",
    "forum",
    "discussion",
    "members",
    "connect people",
    "group",
    "tribe",
    "club",
    "circle",
    "social network",
    "peer",
    "niche community",
    "online community",
    "discord",
    "slack community",
  ],
  consumer_app: [
    "habit",
    "daily",
    "personal",
    "gamification",
    "streak",
    "notification",
    "reminder",
    "lifestyle",
    "wellness",
    "fitness",
    "health",
    "social",
    "friends",
    "entertainment",
    "fun",
    "mobile app",
    "consumer",
    "individuals",
    "people who",
  ],
  b2b_platform: [
    "enterprise",
    "compliance",
    "procurement",
    "b2b",
    "business to business",
    "large teams",
    "organization",
    "organisation",
    "corporate",
    "contracts",
    "legal",
    "finance",
    "accounting",
    "hr ",
    "human resources",
    "onboarding employees",
    "crm",
    "erp",
    "saas for companies",
  ],
  saas_tool: [
    "dashboard",
    "workflow",
    "productivity",
    "automate",
    "automation",
    "manage",
    "management",
    "tool for",
    "software for",
    "platform",
    "track",
    "tracking",
    "analytics",
    "reporting",
    "collaborate",
    "collaboration",
    "small business",
    "startup",
    "teams",
    "project management",
    "task",
    "client",
    "agency",
  ],
};

// ─── Priority order ───────────────────────────────────────────────────────────
// If two archetypes score equally, the one earlier in this list wins.
// ai_wrapper and developer_tool are more specific so they rank higher.

const PRIORITY: Archetype[] = [
  "ai_wrapper",
  "developer_tool",
  "marketplace",
  "ecommerce",
  "community",
  "b2b_platform",
  "consumer_app",
  "saas_tool", // saas_tool is the catch-all — lowest priority
];
const BLOCKED_KEYWORDS = [
  "human trafficking",
  "sex trafficking",
  "child exploitation",
  "csam",

  "drug",
  "drugs",
  "illegal substances",
  "fentanyl",

  "weapon",
  "weapons",
  "illegal weapons",

  "murder",
  "kill",
  "assassinate",
  "hitman",
  "murder for hire",

  "terrorist",
  "terrorism",

  "dark web",
];

export function getPolicyViolation(idea: string): string | null {
  const normalized = idea.toLowerCase().replace(/[^\w\s]/g, " ");

  for (const term of BLOCKED_KEYWORDS) {
    const regex = new RegExp(
      `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    );

    if (regex.test(normalized)) {
      return term;
    }
  }

  return null;
}

export function canGenerateReport(idea: string): boolean {
  return (
    idea.trim().length > 0 &&
    !isLikelyGibberishIdea(idea) &&
    !getPolicyViolation(idea)
  );
}
// ─── Classifier ───────────────────────────────────────────────────────────────

export function classifyIdea(idea: string): Archetype {
  return classifyIdeaWithSignals(idea).archetype;
}

export function classifyIdeaWithSignals(idea: string): {
  archetype: Archetype;
  confidence: number;
  maxScore: number;
} {
  const normalised = idea.toLowerCase();

  const scores: Record<Archetype, number> = {
    marketplace: 0,
    ai_wrapper: 0,
    developer_tool: 0,
    ecommerce: 0,
    community: 0,
    consumer_app: 0,
    b2b_platform: 0,
    saas_tool: 0,
  };

  for (const [archetype, keywords] of Object.entries(ARCHETYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`\\b${escaped}\\b`, "i");
      if (pattern.test(normalised)) {
        scores[archetype as Archetype] += 1;
      }
    }
  }

  // Find the highest score
  const maxScore = Math.max(...Object.values(scores));

  // If nothing matched at all, default to saas_tool
  if (maxScore === 0) {
    return {
      archetype: "saas_tool",
      confidence: 0,
      maxScore,
    };
  }

  // Among archetypes with the max score, pick by priority order
  for (const archetype of PRIORITY) {
    if (scores[archetype] === maxScore) {
      const totalHits = Object.values(scores).reduce((a, b) => a + b, 0);
      const confidence = totalHits > 0 ? maxScore / totalHits : 0;
      return {
        archetype,
        confidence,
        maxScore,
      };
    }
  }

  return {
    archetype: "saas_tool",
    confidence: 0,
    maxScore,
  };
}

export function isLikelyGibberishIdea(idea: string): boolean {
  const value = idea.trim();
  if (value.length < 10) return true;

  const alpha = (value.match(/[a-z]/gi) ?? []).length;
  const vowels = (value.match(/[aeiou]/gi) ?? []).length;
  const digitsAndSymbols = (value.match(/[^a-z\s]/gi) ?? []).length;
  const words = value.split(/\s+/).filter(Boolean);

  const vowelRatio = alpha > 0 ? vowels / alpha : 0;
  const symbolRatio = value.length > 0 ? digitsAndSymbols / value.length : 1;

  const repeatedNoise = /(.)\1{5,}/.test(value);
  const tooFewWords = words.length <= 2 && value.length > 25;

  return (
    repeatedNoise || tooFewWords || vowelRatio < 0.15 || symbolRatio > 0.35
  );
}
export function containsAbusiveContent(idea: string): boolean {
  return getPolicyViolation(idea) !== null;
}
