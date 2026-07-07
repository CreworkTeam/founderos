import { NextRequest, NextResponse } from "next/server";
import { otpStore } from "@/lib/otpStore";

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:3000";

// ─── Re-use the same store instance ──────────────────────────────────────────
// Next.js hot-reload keeps module scope alive in dev, so this map is shared
// between send and verify as long as the server hasn't restarted.
//
// For production, replace with Redis or a DB-backed store.
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
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 },
      );
    }

    const normalized = email.trim().toLowerCase();
    const entry = otpStore.get(normalized);

    if (!entry) {
      return NextResponse.json(
        { error: "No OTP found for this email. Please request a new one." },
        { status: 400 },
      );
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(normalized);
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 },
      );
    }

    if (entry.code !== code.trim()) {
      return NextResponse.json(
        { error: "Incorrect code. Please try again." },
        { status: 400 },
      );
    }

    // Valid — clear it so it can't be reused
    otpStore.delete(normalized);

    const res = NextResponse.json({ success: true });
    res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.cookies.set("verified_email", normalized, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[otp/verify]", err);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 },
    );
  }
}
