import { NextRequest, NextResponse } from "next/server";
import { PostHog } from "posthog-node";
import type { TrackEventRequest } from "@/types";
import { CORS_HEADERS, corsOptions } from "@/lib/cors";

export async function OPTIONS() {
  return corsOptions();
}

// Server-side PostHog client
// Initialised once, reused across requests
let posthog: PostHog | null = null;

function getPostHog(): PostHog {
  if (!posthog) {
    posthog = new PostHog(process.env.POSTHOG_API_KEY ?? "", {
      host: process.env.POSTHOG_HOST ?? "https://app.posthog.com",
      flushAt: 1, // flush immediately in serverless context
      flushInterval: 0,
    });
  }
  return posthog;
}

export async function POST(req: NextRequest) {
  try {
    const body: TrackEventRequest = await req.json();

    if (!body.event || !body.sessionId) {
      return NextResponse.json(
        { error: "event and sessionId are required" },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const ph = getPostHog();

    ph.capture({
      distinctId: body.sessionId,
      event: body.event,
      properties: {
        ...body.properties,
        source: "founder-os",
        environment: process.env.NODE_ENV,
      },
    });

    // Flush immediately — important in serverless/edge functions
    await ph.flush();

    return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
  } catch {
    // Analytics must never break the user experience
    return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
  }
}
