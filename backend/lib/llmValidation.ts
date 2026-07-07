import type { Archetype, ReportA, ReportB, ReportC } from "@/types";
import { z } from "zod";

const archetypeSchema = z.enum([
  "marketplace",
  "saas_tool",
  "consumer_app",
  "ai_wrapper",
  "b2b_platform",
  "community",
  "ecommerce",
  "developer_tool",
]);

const blogLinkSchema = z.object({
  label: z.string(),
  url: z.string().nullable().default(null),
  context: z.string(),
});

const reportASchema = z.object({
  archetype: archetypeSchema,
  demandSignals: z
    .array(
      z.object({
        theme: z.string(),
        intent: z.string(),
        estimatedVolume: z.enum(["low", "moderate", "high"]),
      }),
    )
    .min(1),
  communities: z
    .array(
      z.object({
        platform: z.string(),
        name: z.string(),
        description: z.string(),
        whyItMatters: z.string().default(""),
        url: z.string().nullable().optional(),
      }),
    )
    .min(1),
  competitors: z
    .array(
      z.object({
        name: z.string(),
        whatTheyDo: z.string(),
        gap: z.string(),
        whyItMatters: z.string().default(""),
      }),
    )
    .min(1),
  validationScore: z.object({
    searchDemand: z.number(),
    communityDensity: z.number(),
    competitionIntensity: z.number(),
    timing: z.number(),
    overall: z.number(),
  }),
  blogLinks: z.array(blogLinkSchema).optional().default([]),
  keywordNote: z.string(),
});

const reportBSchema = z.object({
  archetype: archetypeSchema,
  coreLoop: z.string(),
  featurePriority: z
    .array(
      z.object({
        name: z.string(),
        why: z.string(),
        group: z.enum(["build_now", "simplify", "defer", "skip"]),
      }),
    )
    .min(4)
    .superRefine((items, ctx) => {
      const groups = ["build_now", "simplify", "defer", "skip"] as const;
      for (const g of groups) {
        if (!items.some((i) => i.group === g)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `featurePriority missing group: ${g}`,
          });
        }
      }
    }),
  complexityLevel: z.enum(["Low", "Medium", "High"]),
  complexityExplanation: z.string(),
  techApproach: z.string(),
  commonMistakes: z.array(z.string()).min(1),
  aiTools: z
    .array(
      z.object({
        tool: z.string(),
        useCase: z.string(),
        url: z.string(),
      }),
    )
    .min(1),
  marketingPlan: z.object({
    waitlistAdvice: z.string(),
    communities: z.array(z.string()),
    activeThreads: z.array(
      z.object({
        community: z.string(),
        topic: z.string(),
        suggestedComment: z.string(),
        url: z.string().optional(),
      }),
    ),
    weekOneChecklist: z.array(z.string()),
  }),
  blogLinks: z.array(blogLinkSchema).optional().default([]),
});

const reportCSchema = z.object({
  archetype: archetypeSchema,
  specItems: z
    .array(
      z.object({
        label: z.string(),
        status: z.enum(["defined", "needs_clarity", "missing"]),
        note: z.string(),
      }),
    )
    .min(1),
  teamFit: z.string(),
  roadmap: z
    .array(
      z.object({
        week: z.number(),
        title: z.string(),
        deliverables: z.array(z.string()),
      }),
    )
    .min(1),
  questionsToAskAgency: z.array(z.string()).min(1),
  closingHeadline: z.string(),
  whatToBuildPlan: z
    .object({
      buildDecisions: z.array(
        z.object({
          group: z.enum(["build_first", "build_v2", "skip_for_now"]),
          title: z.string(),
          body: z.string(),
        }),
      ),
      northStarMetric: z.object({
        metric: z.string(),
        explanation: z.string(),
        target: z.string(),
        trackingNote: z.string(),
      }),
      supportingKpis: z
        .array(
          z.object({
            metric: z.string(),
            explanation: z.string(),
            threshold: z.string(),
          }),
        )
        .min(1),
      unitEconomics: z.object({
        title: z.string(),
        description: z.string(),
        points: z.array(
          z.object({
            commissionLabel: z.string(),
            bookingsToTarget: z.number(),
            artistsNeeded: z.number(),
          }),
        ),
      }),
      riskCallout: z.object({
        title: z.string(),
        body: z.string(),
      }),
      buildOrHire: z.object({
        selfBuild: z.object({ title: z.string(), body: z.string() }),
        hire: z.object({
          title: z.string(),
          body: z.string(),
          proofPoints: z.array(z.string()).min(1),
        }),
        ctaText: z
          .string()
          .nullable()
          .transform((v) => v || "Book a free 30-min scoping call"),
        ctaUrl: z
          .string()
          .nullable()
          .transform((v) => v || "https://calendly.com/creworklabs/30mins"),
      }),
    })
    .optional(),
  blogLinks: z.array(blogLinkSchema).optional().default([]),
});

const classifierPayloadSchema = z.object({
  archetype: archetypeSchema,
});

export function isArchetype(value: unknown): value is Archetype {
  return archetypeSchema.safeParse(value).success;
}

export function isValidReportA(value: unknown): value is ReportA {
  return reportASchema.safeParse(value).success;
}

export function isValidReportB(value: unknown): value is ReportB {
  return reportBSchema.safeParse(value).success;
}

export function isValidReportC(value: unknown): value is ReportC {
  return reportCSchema.safeParse(value).success;
}

export function isValidClassifierPayload(
  value: unknown,
): value is { archetype: Archetype } {
  return classifierPayloadSchema.safeParse(value).success;
}

export function parseReportA(value: unknown): ReportA {
  return reportASchema.parse(value);
}

export function parseReportB(value: unknown): ReportB {
  return reportBSchema.parse(value);
}

export function parseReportC(value: unknown): ReportC {
  return reportCSchema.parse(value);
}
