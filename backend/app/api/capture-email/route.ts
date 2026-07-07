import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CaptureEmailRequest, LeadTag, Q4Answer } from "@/types";
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:3000";
function deriveLeadTag(q4: Q4Answer | null): LeadTag {
  switch (q4) {
    case "waitlist":
      return "HOT";
    case "few_convos":
      return "WARM";
    default:
      return "NURTURE";
  }
}
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
export async function POST(req: NextRequest) {
  try {
    const body: CaptureEmailRequest = await req.json();

    if (!body.email || !body.email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }

    if (!body.sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 },
      );
    }

    const leadTag = deriveLeadTag(body.q4);

    try {
      await prisma.lead.upsert({
        where: { sessionId: body.sessionId },
        create: {
          sessionId: body.sessionId,
          email: body.email,
          archetype: body.archetype ?? null,
          q1: body.quiz.q1 ?? null,
          q2: body.quiz.q2 ?? null,
          q3: body.quiz.q3 ?? null,
          q4: body.quiz.q4 ?? null,
          leadTag,
          capturedAt: new Date(),
        },
        update: {
          email: body.email,
          archetype: body.archetype ?? null,
          q1: body.quiz.q1 ?? null,
          q2: body.quiz.q2 ?? null,
          q3: body.quiz.q3 ?? null,
          q4: body.quiz.q4 ?? null,
          leadTag,
          capturedAt: new Date(),
        },
      });
    } catch (dbError) {
      console.error("[capture-email] Prisma error:", dbError);
    }

    const res = NextResponse.json({ success: true, leadTag });
    res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    return res;
  } catch {
    return NextResponse.json(
      { error: "Failed to capture email" },
      { status: 500 },
    );
  }
}
