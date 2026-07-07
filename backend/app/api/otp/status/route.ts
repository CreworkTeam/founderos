import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:3000";

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(req: NextRequest) {
  const email = req.cookies.get("verified_email")?.value;

  const res = NextResponse.json({
    verified: !!email,
    email: email ?? null,
  });

  res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.headers.set("Access-Control-Allow-Credentials", "true");

  return res;
}
