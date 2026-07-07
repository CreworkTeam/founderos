import { NextRequest, NextResponse } from "next/server";
import { sendFullReportEmail } from "@/lib/resend";
import { generateReportPdf } from "@/lib/generateReportPdf";
import { prisma } from "@/lib/prisma";
import { CORS_HEADERS, corsOptions } from "@/lib/cors";
import type { ReportA, ReportB, ReportC } from "@/types";

export async function OPTIONS() {
  return corsOptions();
}

export async function POST(req: NextRequest) {
  try {
    const { email, sessionId } = await req.json();

    if (!email || !sessionId) {
      return NextResponse.json(
        { error: "email and sessionId are required" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const lead = await prisma.lead.findUnique({ where: { sessionId } });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found for sessionId" },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    if (!lead.reportA || !lead.reportB || !lead.reportC) {
      return NextResponse.json(
        { error: "Reports not fully generated yet for this session" },
        { status: 409, headers: CORS_HEADERS },
      );
    }

    if (
      lead.reportASource === "mock_fallback" ||
      lead.reportBSource === "mock_fallback" ||
      lead.reportCSource === "mock_fallback"
    ) {
      return NextResponse.json(
        { error: "Report generation incomplete — retry later" },
        { status: 409, headers: CORS_HEADERS },
      );
    }

    const pdfBuffer = await generateReportPdf({
      reportA: lead.reportA as unknown as ReportA,
      reportB: lead.reportB as unknown as ReportB,
      reportC: lead.reportC as unknown as ReportC,
      ideaTitle: lead.q2 ?? "Your startup idea",
    });

    await sendFullReportEmail({
      to: email,
      ideaSummary: lead.q2 ?? "Your startup idea",
      pdfBuffer,
    });

    return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("[send-report]", err);
    return NextResponse.json(
      { error: "Failed to send report" },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
