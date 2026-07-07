export const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" };

export function corsOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
