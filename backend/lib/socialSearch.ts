const SERPER_URL = "https://google.serper.dev/search";

export type SocialThread = {
  community: string;
  topic: string;
  suggestedComment: string;
  url: string;
};

async function searchSerper(query: string) {
  const response = await fetch(SERPER_URL, {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      num: 5,
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper failed: ${response.status}`);
  }

  return response.json();
}

export async function getSocialThreads(idea: string) {
  const queries = [
    `${idea} site:reddit.com`,
    `${idea} site:linkedin.com/posts`,
    `${idea} site:x.com`,
    `${idea} startup discussion`,
  ];

  const results = await Promise.all(
    queries.map((q) => searchSerper(q).catch(() => ({ organic: [] }))),
  );

  const threads: SocialThread[] = [];

  for (const result of results) {
    const organic = result.organic || [];

    for (const item of organic) {
      threads.push({
        community: detectCommunity(item.link),
        topic: item.title,
        suggestedComment: item.snippet || "",
        url: item.link,
      });
    }
  }

  const unique = Array.from(new Map(threads.map((t) => [t.url, t])).values());

  return unique.slice(0, 10);
}

function detectCommunity(url: string) {
  if (url.includes("reddit.com")) return "Reddit";
  if (url.includes("linkedin.com")) return "LinkedIn";
  if (url.includes("x.com")) return "X";
  if (url.includes("twitter.com")) return "X";
  return "Web";
}
