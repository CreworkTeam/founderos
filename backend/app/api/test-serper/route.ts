// app/api/test-serper/route.ts

import { getSocialThreads } from "@/lib/socialSearch";

export async function GET() {
  const data = await getSocialThreads("AI Sales Agent");

  return Response.json(data);
}
