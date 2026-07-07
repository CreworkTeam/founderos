import type { CommunityThread, ReportA, ReportB, ReportC } from "@/types";

export type ReportSection = "validate" | "scope" | "plan";

export type FeedPost = {
  platform: "reddit" | "twitter" | "ih" | "linkedin";
  source: string;
  user: string;
  time: string;
  text: string;
  stats: string;
  mood: "Pain" | "Wants solution" | "Building";
  url: string;
};

export const moodColor: Record<FeedPost["mood"], string> = {
  Pain: "bg-[#f87171]",
  "Wants solution": "bg-[#34d399]",
  Building: "bg-[#60a5fa]",
};

const platformRoots: Record<FeedPost["platform"], string> = {
  reddit: "https://reddit.com",
  twitter: "https://twitter.com",
  ih: "https://www.indiehackers.com",
  linkedin: "https://www.linkedin.com",
};

export const fallbackPosts: FeedPost[] = [
  {
    platform: "reddit",
    source: "r/beauty",
    user: "u/nailtech_lover",
    time: "3h ago",
    text: "Why is there still no good app to find nail artists in my city? Instagram is hard to search and Yelp mostly shows salons, not independents.",
    stats: "847 upvotes · 64 comments",
    mood: "Pain",
    url: "https://reddit.com/r/beauty",
  },
  {
    platform: "twitter",
    source: "Twitter / X",
    user: "@beautyfounder",
    time: "1d ago",
    text: "Built a simple tool for booking independent nail techs over the weekend. 3 paying customers already. The demand is clearly there.",
    stats: "332 likes · 28 replies",
    mood: "Building",
    url: "https://twitter.com",
  },
  {
    platform: "reddit",
    source: "r/Entrepreneur",
    user: "u/nail_mkt_idea",
    time: "2d ago",
    text: "Existing marketplaces are designed for salons, not independent artists. There is a real discoverability gap.",
    stats: "1.2k upvotes · 93 comments",
    mood: "Wants solution",
    url: "https://reddit.com/r/Entrepreneur",
  },
  {
    platform: "ih",
    source: "Indie Hackers",
    user: "bootstrapped_91",
    time: "3d ago",
    text: "We tried existing local beauty discovery tools. None fit freelancers. Might build this ourselves.",
    stats: "562 likes · 31 comments",
    mood: "Building",
    url: "https://www.indiehackers.com",
  },
  {
    platform: "linkedin",
    source: "LinkedIn",
    user: "@beauty_ops",
    time: "5d ago",
    text: "The independent beauty economy is growing fast, but tooling has not caught up for solo nail techs.",
    stats: "893 reactions · 47 comments",
    mood: "Wants solution",
    url: "https://www.linkedin.com",
  },
];

export function toFeedPost(thread: CommunityThread, index: number): FeedPost {
  const platformLower = thread.community.toLowerCase();
  const platform: FeedPost["platform"] =
    platformLower.includes("reddit") || thread.community.startsWith("r/")
      ? "reddit"
      : platformLower.includes("linkedin")
        ? "linkedin"
        : platformLower.includes("indie") || platformLower.includes("ih")
          ? "ih"
          : "twitter";

  const mood: FeedPost["mood"] =
    index % 3 === 0 ? "Pain" : index % 3 === 1 ? "Wants solution" : "Building";

  // Build the most specific URL possible from community name
  const url = thread.url ?? platformRoots[platform];

  return {
    platform,
    source: thread.community,
    time: "",
    stats: "",
    user: "",

    text: thread.suggestedComment,

    mood,
    url,
  };
}

export type ReportBundle = {
  reportA: ReportA | null;
  reportB: ReportB | null;
  reportC: ReportC | null;
};
