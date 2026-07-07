import { NextRequest, NextResponse } from "next/server";
import { getReportA } from "@/lib/reportGenerator";
import { generateReportAWithLLM } from "@/lib/llmReports";
import {
  buildReportCacheKey,
  getCachedReport,
  setCachedReport,
} from "@/lib/llmCache";
import { prisma } from "@/lib/prisma";
import { CORS_HEADERS, corsOptions } from "@/lib/cors";
import type { ReportRequest } from "@/types";

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const body: ReportRequest = await req.json();

    if (!body.archetype) {
      return NextResponse.json(
        { error: "archetype is required" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    if (!body.quiz) {
      return NextResponse.json(
        { error: "quiz is required" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const sessionId = (body as ReportRequest & { sessionId?: string })
      .sessionId;
    const cacheKey = buildReportCacheKey({
      route: "A",
      archetype: body.archetype,
      quiz: body.quiz,
    });

    const cached = getCachedReport<ReturnType<typeof getReportA>>(cacheKey);
    if (cached) {
      console.info("[report/A] source=cache", {
        archetype: body.archetype,
        sessionId: sessionId ?? null,
      });
      return NextResponse.json(
        {
          ...cached,
          source: "cache",
          requestedArchetype: body.archetype,
          modelArchetype: null,
          finalArchetype: body.archetype,
        },
        { headers: CORS_HEADERS },
      );
    }

    try {
      const { report, modelArchetype } = await generateReportAWithLLM(
        body.archetype,
        body.quiz,
      );

      if (modelArchetype && modelArchetype !== body.archetype) {
        console.warn("[report/A] archetype_mismatch", {
          requestedArchetype: body.archetype,
          modelArchetype,
          sessionId: sessionId ?? null,
        });
      }

      setCachedReport(cacheKey, report);
      console.info("[report/A] source=llm", {
        archetype: body.archetype,
        sessionId: sessionId ?? null,
      });
      if (sessionId) {
        await prisma.lead
          .upsert({
            where: { sessionId },
            update: { reportA: report, reportASource: "llm" },
            create: {
              sessionId,
              email: "",
              archetype: body.archetype,
              q1: body.quiz.q1,
              q2: body.quiz.q2,
              q3: body.quiz.q3,
              q4: body.quiz.q4,
              reportA: report,
              reportASource: "llm",
            },
          })
          .catch((e) => console.error("[report/A] persist_failed", e));
      }
      return NextResponse.json(
        {
          ...report,
          source: "llm",
          requestedArchetype: body.archetype,
          modelArchetype,
          finalArchetype: report.archetype,
        },
        { headers: CORS_HEADERS },
      );
    } catch (error) {
      console.error(
        "[report/A] LLM generation failed, using mock fallback:",
        error,
      );
      const fallback = getReportA(body.archetype);
      console.info("[report/A] source=mock_fallback", {
        archetype: body.archetype,
        sessionId: sessionId ?? null,
      });
      if (sessionId) {
        await prisma.lead
          .upsert({
            where: { sessionId },
            update: { reportA: fallback, reportASource: "mock_fallback" },
            create: {
              sessionId,
              email: "",
              archetype: body.archetype,
              q1: body.quiz.q1,
              q2: body.quiz.q2,
              q3: body.quiz.q3,
              q4: body.quiz.q4,
              reportA: fallback,
              reportASource: "mock_fallback",
            },
          })
          .catch((e) => console.error("[report/A] persist_failed", e));
      }
      return NextResponse.json(
        {
          ...fallback,
          source: "mock_fallback",
          requestedArchetype: body.archetype,
          modelArchetype: null,
          finalArchetype: fallback.archetype,
        },
        { headers: CORS_HEADERS },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to generate Route A report" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
