// ─── Archetypes ───────────────────────────────────────────────────────────────

export type Archetype =
  | "marketplace"
  | "saas_tool"
  | "consumer_app"
  | "ai_wrapper"
  | "b2b_platform"
  | "community"
  | "ecommerce"
  | "developer_tool";

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export type Q1Answer = "idea" | "validation" | "build";
export type Q3Answer = "consumer" | "smb" | "enterprise" | "developer";
export type Q4Answer = "exploring" | "few_convos" | "waitlist";
export type RouteKey = "A" | "B" | "C";
export type LeadTag = "HOT" | "WARM" | "NURTURE";

export type QuizAnswers = {
  q1: Q1Answer | null;
  q2: string;
  q3: Q3Answer | null;
  q4: Q4Answer | null;
};

// ─── Report A — Idea Validator ────────────────────────────────────────────────

export type DemandSignal = {
  theme: string; // e.g. "how to manage freelance invoices"
  intent: string; // e.g. "problem-aware, solution-seeking"
  estimatedVolume: "low" | "moderate" | "high";
};

export type Community = {
  platform: string;
  name: string; // e.g. "r/freelance"
  description: string; // one line: what people discuss there
  whyItMatters: string; // one sentence tying this to the specific idea
  url?: string | null;
};

export type Competitor = {
  name: string;
  whatTheyDo: string;
  gap: string; // "The gap they leave open:"
  whyItMatters: string; // one sentence tying this to the specific idea
};

export type ValidationScore = {
  searchDemand: number; // 1–10
  communityDensity: number; // 1–10
  competitionIntensity: number; // 1–10
  timing: number; // 1–10
  overall: number; // derived average of the 4
};

export type BlogLink = {
  label: string; // anchor text
  url: string | null;
  context: string; // one sentence explaining why this is relevant here
};

export type ReportA = {
  archetype: Archetype;
  demandSignals: DemandSignal[]; // 3–5 items
  communities: Community[]; // 4–6 items
  competitors: Competitor[]; // 2–3 items
  validationScore: ValidationScore;
  blogLinks: BlogLink[]; // contextual blog/substack links
  keywordNote: string; // estimated search demand narrative
};

// ─── Report B — MVP Scope Builder ────────────────────────────────────────────

export type FeaturePriorityGroup = "build_now" | "simplify" | "defer" | "skip";

export type FeaturePriorityItem = {
  name: string;
  why: string;
  group: FeaturePriorityGroup;
};

export type ComplexityLevel = "Low" | "Medium" | "High";

export type AIToolRecommendation = {
  tool: string; // e.g. "Lovable"
  useCase: string; // e.g. "Building your frontend without code"
  url: string;
};

export type MarketingAction = {
  action: string; // e.g. "Post in r/entrepreneur with this angle:"
  detail: string; // specific guidance or template
};

export type CommunityThread = {
  community: string;
  topic: string;
  suggestedComment: string;
  url?: string;
};

export type ReportB = {
  archetype: Archetype;
  featurePriority: FeaturePriorityItem[]; // 6-10 items across all 4 groups
  coreLoop: string; // exactly 2–3
  complexityLevel: ComplexityLevel;
  complexityExplanation: string; // plain English paragraph
  techApproach: string; // founder-friendly, no jargon
  commonMistakes: string[]; // 2–3 strings
  aiTools: AIToolRecommendation[]; // 2–3 relevant tools
  marketingPlan: {
    waitlistAdvice: string;
    communities: string[]; // 5 communities to join
    activeThreads: CommunityThread[]; // 5 threads with comment templates
    weekOneChecklist: string[]; // concrete sequential steps
  };
  blogLinks: BlogLink[];
};

// ─── Report C — Build Readiness Audit ────────────────────────────────────────

export type SpecItem = {
  label: string;
  status: "defined" | "needs_clarity" | "missing";
  note: string;
};

export type RoadmapWeek = {
  week: number;
  title: string;
  deliverables: string[];
};

export type BuildDecisionGroup = "build_first" | "build_v2" | "skip_for_now";

export type BuildDecisionItem = {
  group: BuildDecisionGroup;
  title: string;
  body: string;
};

export type UnitEconomicsPoint = {
  commissionLabel: string;
  bookingsToTarget: number;
  artistsNeeded: number;
};
export type SupportingKpi = {
  metric: string;
  explanation: string;
  threshold: string;
};

export type BuildOrHire = {
  selfBuild: { title: string; body: string };
  hire: { title: string; body: string; proofPoints: string[] };
  ctaText: string;
  ctaUrl: string;
};

export type WhatToBuildPlan = {
  buildDecisions: BuildDecisionItem[];
  northStarMetric: {
    metric: string;
    explanation: string;
    target: string;
    trackingNote: string;
  };
  supportingKpis: SupportingKpi[];
  unitEconomics: {
    title: string;
    description: string;
    points: UnitEconomicsPoint[];
  };
  riskCallout: {
    title: string;
    body: string;
  };
  buildOrHire: BuildOrHire;
};
export type ReportC = {
  archetype: Archetype;
  specItems: SpecItem[]; // completeness check
  teamFit: string; // plain English team recommendation
  roadmap: RoadmapWeek[]; // 3 weeks
  questionsToAskAgency: string[]; // exactly 5
  whatToBuildPlan?: WhatToBuildPlan;
  blogLinks: BlogLink[];
  closingHeadline: string;
};

// ─── Zustand Store ────────────────────────────────────────────────────────────

export type Reports = {
  A: ReportA | null;
  B: ReportB | null;
  C: ReportC | null;
};

export type SessionData = {
  sessionId: string;
  createdAt: string;
  quiz: QuizAnswers;
  archetype: Archetype | null;
  email: string | null;
  emailCapturedAt: string | null;
  budget: string | null;
  leadTag: LeadTag | null;
  routesGenerated: RouteKey[];
  reports: Reports;
};

export type FounderState = SessionData & {
  activeTab: RouteKey;
  // Actions
  setQ1: (val: Q1Answer) => void;
  setQ2: (val: string) => void;
  setQ3: (val: Q3Answer) => void;
  setQ4: (val: Q4Answer) => void;
  setArchetype: (val: Archetype) => void;
  setEmail: (val: string) => void;
  setBudget: (val: string) => void;
  setLeadTag: (val: LeadTag) => void;
  setReport: (route: RouteKey, data: ReportA | ReportB | ReportC) => void;
  setActiveTab: (tab: RouteKey) => void;
  markRouteGenerated: (route: RouteKey) => void;
  hydrateFromStorage: () => void;
  persistToStorage: () => void;
  reset: () => void;
};

// ─── API Request / Response shapes ───────────────────────────────────────────

export type ClassifyRequest = {
  idea: string;
};

export type ClassifyResponse = {
  archetype: Archetype;
};

export type ReportRequest = {
  quiz: QuizAnswers;
  archetype: Archetype;
};

export type CaptureEmailRequest = {
  email: string;
  sessionId: string;
  quiz: QuizAnswers;
  archetype: Archetype | null;
  q4: Q4Answer | null;
};

export type TrackEventRequest = {
  event: string;
  sessionId: string;
  properties?: Record<string, string | number | boolean | null>;
};
