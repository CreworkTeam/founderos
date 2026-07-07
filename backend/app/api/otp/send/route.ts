import { NextRequest, NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/resend";
import { otpStore } from "@/lib/otpStore";

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:3000";

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
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }

    const normalized = email.trim().toLowerCase();

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(normalized, { code, expiresAt });

    await sendOtpEmail({ to: normalized, code });

    const res = NextResponse.json({ success: true });
    res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    return res;
  } catch (err) {
    console.error("[otp/send]", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
