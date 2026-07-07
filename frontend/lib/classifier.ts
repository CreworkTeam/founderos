const BLOCKED_KEYWORDS = [
  "human trafficking",
  "sex trafficking",
  "child exploitation",
  "csam",
  "drug",
  "drugs",
  "illegal substances",
  "fentanyl",
  "weapon",
  "weapons",
  "illegal weapons",
  "murder",
  "kill",
  "assassinate",
  "hitman",
  "murder for hire",
  "terrorist",
  "terrorism",
  "dark web",
];

export function getPolicyViolation(idea: string): string | null {
  const normalized = idea.toLowerCase().replace(/[^\w\s]/g, " ");

  for (const term of BLOCKED_KEYWORDS) {
    const regex = new RegExp(
      `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    );
    if (regex.test(normalized)) {
      return term;
    }
  }

  return null;
}
