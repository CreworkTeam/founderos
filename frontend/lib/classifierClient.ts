// Browser-safe keyword classifier (no Node.js imports)

type Archetype =
  | "marketplace"
  | "saas_tool"
  | "consumer_app"
  | "ai_wrapper"
  | "b2b_platform"
  | "community"
  | "ecommerce"
  | "developer_tool";

const KEYWORD_MAP: Record<Archetype, string[]> = {
  marketplace: [
    "marketplace",
    "connect buyers",
    "connect sellers",
    "two-sided",
    "gig",
    "freelance platform",
    "booking platform",
    "hire",
    "on-demand",
  ],
  saas_tool: [
    "saas",
    "dashboard",
    "manage",
    "track",
    "automate",
    "workflow",
    "tool for",
    "software",
    "platform for",
    "crm",
    "analytics",
    "reporting",
    "invoice",
    "billing",
    "scheduling",
    "productivity",
  ],
  consumer_app: [
    "app for",
    "personal",
    "habit",
    "social",
    "dating",
    "fitness",
    "health",
    "lifestyle",
    "consumer",
    "people can",
    "users can",
    "everyone",
  ],
  ai_wrapper: [
    "ai",
    "gpt",
    "llm",
    "chatbot",
    "generate",
    "summarize",
    "write",
    "automate with ai",
    "powered by ai",
    "artificial intelligence",
    "machine learning",
    "openai",
    "claude",
  ],
  b2b_platform: [
    "b2b",
    "enterprise",
    "teams",
    "companies",
    "businesses",
    "corporate",
    "organisation",
    "organization",
    "client management",
    "agency",
    "white-label",
  ],
  community: [
    "community",
    "forum",
    "network",
    "connect people",
    "members",
    "group",
    "niche community",
    "online community",
    "discord",
    "circle",
  ],
  ecommerce: [
    "sell",
    "store",
    "shop",
    "product",
    "ecommerce",
    "e-commerce",
    "dropship",
    "physical",
    "merchandise",
    "buy and sell",
    "purchase",
  ],
  developer_tool: [
    "developer",
    "api",
    "sdk",
    "open source",
    "library",
    "cli",
    "devops",
    "coding",
    "github",
    "deploy",
    "infrastructure",
    "backend",
    "frontend tool",
  ],
};

const ARCHETYPE_LABELS: Record<Archetype, string> = {
  marketplace: "MARKETPLACE",
  saas_tool: "SAAS TOOL",
  consumer_app: "CONSUMER APP",
  ai_wrapper: "AI PRODUCT",
  b2b_platform: "B2B PLATFORM",
  community: "COMMUNITY",
  ecommerce: "E-COMMERCE",
  developer_tool: "DEV TOOL",
};

export function classifyIdea(idea: string): {
  archetype: Archetype;
  label: string;
} {
  const lower = idea.toLowerCase();
  const scores: Record<Archetype, number> = {
    marketplace: 0,
    saas_tool: 0,
    consumer_app: 0,
    ai_wrapper: 0,
    b2b_platform: 0,
    community: 0,
    ecommerce: 0,
    developer_tool: 0,
  };

  for (const [arch, keywords] of Object.entries(KEYWORD_MAP) as [
    Archetype,
    string[],
  ][]) {
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`\\b${escaped}\\b`, "i");
      if (pattern.test(lower)) scores[arch]++;
    }
  }

  let best: Archetype = "saas_tool";
  let bestScore = -1;
  for (const [arch, score] of Object.entries(scores) as [Archetype, number][]) {
    if (score > bestScore) {
      bestScore = score;
      best = arch;
    }
  }

  return { archetype: best, label: ARCHETYPE_LABELS[best] };
}
