import { NextRequest, NextResponse } from "next/server";
import { getReportC } from "@/lib/reportGenerator";
import { generateReportCWithLLM } from "@/lib/llmReports";
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
      route: "C",
      archetype: body.archetype,
      quiz: body.quiz,
    });

    const cached = getCachedReport<ReturnType<typeof getReportC>>(cacheKey);
    if (cached) {
      console.info("[report/C] source=cache", {
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
      const { report, modelArchetype } = await generateReportCWithLLM(
        body.archetype,
        body.quiz,
      );

      if (modelArchetype && modelArchetype !== body.archetype) {
        console.warn("[report/C] archetype_mismatch", {
          requestedArchetype: body.archetype,
          modelArchetype,
          sessionId: sessionId ?? null,
        });
      }

      setCachedReport(cacheKey, report);
      if (sessionId) {
        await prisma.lead
          .update({
            where: { sessionId },
            data: { reportC: report, reportCSource: "llm" },
          })
          .catch((e) => console.error("[report/C] persist_failed", e));
      }
      console.info("[report/C] source=llm", {
        archetype: body.archetype,
        sessionId: sessionId ?? null,
      });
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
        "[report/C] LLM generation failed, using mock fallback:",
        error,
      );
      const fallback = getReportC(body.archetype);
      if (sessionId) {
        await prisma.lead
          .update({
            where: { sessionId },
            data: { reportC: fallback, reportCSource: "mock_fallback" },
          })
          .catch((e) => console.error("[report/C] persist_failed", e));
      }
      console.info("[report/C] source=mock_fallback", {
        archetype: body.archetype,
        sessionId: sessionId ?? null,
      });
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
      { error: "Failed to generate Route C report" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
