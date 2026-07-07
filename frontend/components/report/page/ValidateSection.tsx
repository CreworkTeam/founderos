import { useState } from "react";
import { VolumeBar } from "@/components/report/ReportSections";
import type { ReportA } from "@/types";
import { EmailGateCard, GateOverlay } from "./shared";
import { FeedPost, moodColor } from "./types";

type PlatformFilter = "all" | FeedPost["platform"];

const scoreTooltips = {
  overall:
    "A weighted average of demand, community activity, and competition. 8–10 = strong market fit. 5–7 = worth exploring. Below 5 = consider a different angle.",
  searchDemand:
    "Estimated monthly search volume for keywords related to your idea. 8+ means high organic pull from the market. Below 5 means you may need to create demand first.",
  communityDensity:
    "Volume of real discussions about this problem on Reddit, Twitter, Indie Hackers, and LinkedIn. 8+ = vocal, engaged audience. Lower = quieter, niche community.",
  competitionIntensity:
    "How crowded the market already is. 5–7 is healthy — enough validation, room to differentiate. 8+ means you need a strong, specific angle to stand out.",
};

type ValidateSectionProps = {
  reportA: ReportA | null;
  validationMetrics: {
    searchDemand: number;
    communityDensity: number;
    competitionIntensity: number;
    overall: number;
  };
  filteredPosts: FeedPost[];
  platform: PlatformFilter;
  setPlatform: (value: PlatformFilter) => void;
  gateUnlocked: boolean;
  gateStep: "email" | "code";
  gateEmail: string;
  setGateEmail: (value: string) => void;
  gateCode: string;
  setGateCode: (value: string) => void;
  gateError: string;
  gateLoading: boolean;
  submitEmailGate: () => void;
  submitGateCode: () => void;
  resendGateCode: () => void;
  onContinueScope: () => void;
  keywordCanvasRef: (node: HTMLCanvasElement | null) => void;
  platformCanvasRef: (node: HTMLCanvasElement | null) => void;
  sentimentCanvasRef: (node: HTMLCanvasElement | null) => void;
  capturedEmail: string | null;
  downloadEmail: string;
  setDownloadEmail: (value: string) => void;
  downloadLoading: boolean;
  downloadSuccess: boolean;
  downloadError: string;
  onDownloadReport: () => void;
};

export function ValidateSection({
  reportA,
  validationMetrics,
  filteredPosts,
  platform,
  setPlatform,
  gateUnlocked,
  gateStep,
  gateEmail,
  setGateEmail,
  gateCode,
  setGateCode,
  gateError,
  gateLoading,
  submitEmailGate,
  submitGateCode,
  resendGateCode,
  onContinueScope,
  keywordCanvasRef,
  platformCanvasRef,
  sentimentCanvasRef,
  capturedEmail,
  downloadEmail,
  setDownloadEmail,
  downloadLoading,
  downloadSuccess,
  downloadError,
  onDownloadReport,
}: ValidateSectionProps) {
  const keywordNote = reportA?.keywordNote?.trim();
  const [showDownloadForm, setShowDownloadForm] = useState(false);

  const scoreCards = [
    {
      key: "overall" as const,
      label: "Overall Score",
      value: validationMetrics.overall,
      meta:
        validationMetrics.overall >= 8
          ? "Strong demand signal"
          : validationMetrics.overall >= 6
            ? "Moderate signal"
            : "Weak signal",
      color:
        validationMetrics.overall >= 7
          ? "text-[#2d6a4f]"
          : validationMetrics.overall >= 5
            ? "text-[#92400e]"
            : "text-[#dc2626]",
    },
    {
      key: "searchDemand" as const,
      label: "Search Demand",
      value: validationMetrics.searchDemand,
      meta:
        validationMetrics.searchDemand >= 8
          ? "High search volume"
          : validationMetrics.searchDemand >= 5
            ? "Moderate volume"
            : "Low volume",
      color:
        validationMetrics.searchDemand >= 7
          ? "text-[#2d6a4f]"
          : validationMetrics.searchDemand >= 5
            ? "text-[#92400e]"
            : "text-[#dc2626]",
    },
    {
      key: "communityDensity" as const,
      label: "Community Buzz",
      value: validationMetrics.communityDensity,
      meta:
        validationMetrics.communityDensity >= 8
          ? "Active discussions"
          : validationMetrics.communityDensity >= 5
            ? "Some activity"
            : "Quiet space",
      color:
        validationMetrics.communityDensity >= 7
          ? "text-[#2d6a4f]"
          : validationMetrics.communityDensity >= 5
            ? "text-[#92400e]"
            : "text-[#dc2626]",
    },
    {
      key: "competitionIntensity" as const,
      label: "Competition",
      value: validationMetrics.competitionIntensity,
      meta:
        validationMetrics.competitionIntensity >= 8
          ? "Crowded market"
          : validationMetrics.competitionIntensity >= 5
            ? "Moderate competition"
            : "Blue ocean",
      color:
        validationMetrics.competitionIntensity >= 8
          ? "text-[#dc2626]"
          : validationMetrics.competitionIntensity >= 5
            ? "text-[#92400e]"
            : "text-[#2d6a4f]",
    },
  ];

  return (
    <div>
      {/* Score cards */}
      <div className="mb-10 grid gap-3 md:grid-cols-4">
        {scoreCards.map((card) => (
          <div
            key={card.label}
            className="relative rounded-xl border border-[#e8e6e0] bg-white px-4 py-3.5"
          >
            {/* Info icon with tooltip */}
            <div className="group/info absolute right-3 top-3">
              <button
                type="button"
                className="flex h-4 w-4 items-center justify-center rounded-full border border-[#d1cec7] text-[9px] font-bold italic text-[#a8a59f] transition hover:border-[#9e9b93] hover:text-[#6b6860]"
                aria-label={`How ${card.label} is calculated`}
              >
                i
              </button>
              <div className="pointer-events-none absolute right-0 top-6 z-20 w-56 rounded-lg border border-[#e8e6e0] bg-white p-3 text-[11px] leading-[1.65] text-[#6b6860] opacity-0 shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-opacity group-hover/info:opacity-100">
                <span className="absolute -top-1.5 right-3 h-3 w-3 rotate-45 border-l border-t border-[#e8e6e0] bg-white" />
                {scoreTooltips[card.key]}
              </div>
            </div>

            <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[#a8a59f]">
              {card.label}
            </p>
            <p
              className={`mb-1 text-[30px] font-semibold leading-none ${card.color}`}
            >
              {card.value}
            </p>
            <p className="text-[11px] text-[#6b6860]">{card.meta}</p>
          </div>
        ))}
      </div>

      {/* Search interest chart */}
      <div className="mb-10">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-[#a8a59f]">
          Search interest over time
        </p>
        <div className="rounded-xl border border-[#e8e6e0] bg-white p-5">
          <h2 className="mb-1 text-[14px] font-semibold">
            How often people are searching for what you are building
          </h2>
          <p className="mb-5 text-[12px] text-[#6b6860]">
            Monthly search volume across related keywords.
          </p>
          <div className="mb-3 flex flex-wrap gap-3 text-[11px] text-[#6b6860]">
            {(reportA?.demandSignals?.slice(0, 3) ?? []).map((signal, idx) => (
              <span key={idx} className="inline-flex items-center gap-1">
                <span
                  className={`size-2 rounded-sm ${idx === 0 ? "bg-[#1a1917]" : idx === 1 ? "bg-[#9ca3af]" : "bg-[#d1cec7]"}`}
                />
                {signal.theme}
              </span>
            ))}
          </div>
          <div className="h-55">
            <canvas ref={keywordCanvasRef} />
          </div>
        </div>
      </div>

      {/* Live conversations */}
      <div className="mb-8">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-[#a8a59f]">
          Where people are talking about this
        </p>
        <div className="overflow-hidden rounded-xl border border-[#e8e6e0] bg-white">
          <div className="border-b border-[#e8e6e0] px-5 py-4">
            <h2 className="text-[14px] font-semibold">
              Live conversations happening right now
            </h2>
            <p className="text-[12px] text-[#6b6860]">
              Real posts from Reddit, Twitter, Indie Hackers, and LinkedIn.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 border-b border-[#e8e6e0] px-5 py-3">
            {[
              ["all", "All platforms"],
              ["reddit", "Reddit"],
              ["twitter", "Twitter / X"],
              ["ih", "Indie Hackers"],
              ["linkedin", "LinkedIn"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPlatform(id as PlatformFilter)}
                className={`rounded-md px-3 py-1.5 text-[12px] ${platform === id ? "border border-[#e8e6e0] bg-[#f0ede8] text-[#1a1917]" : "text-[#6b6860] hover:bg-[#f7f6f3]"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-3 px-5 py-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <a
                  key={`${post.platform}-${post.user}-${post.time}`}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border-b border-[#e8e6e0] pb-3 transition-colors last:border-b-0 last:pb-0 hover:bg-[#faf9f7] -mx-5 px-5 rounded-sm"
                >
                  <div className="mb-1 flex items-center gap-2 text-[11px] text-[#a8a59f]">
                    <span
                      className={`font-semibold ${post.platform === "reddit" ? "text-[#ff4500]" : post.platform === "twitter" ? "text-[#1d9bf0]" : post.platform === "ih" ? "text-[#0e7f6e]" : "text-[#0077b5]"}`}
                    >
                      {post.source}
                    </span>
                    <span>·</span>
                    <span>{post.user}</span>
                    <span className="ml-auto flex items-center gap-1">
                      {post.time}
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        className="text-[#d1cec7]"
                      >
                        <path
                          d="M2 8L8 2M8 2H4M8 2v4"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <p className="mb-2 text-[13px] leading-6">{post.text}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[#a8a59f]">
                    <span>{post.stats}</span>
                    <span className="inline-flex items-center gap-1">
                      <span
                        className={`size-2 rounded-full ${moodColor[post.mood]}`}
                      />
                      {post.mood}
                    </span>
                  </div>
                </a>
              ))
            ) : (
              <div className="rounded-lg border border-[#e8e6e0] bg-[#faf9f7] px-4 py-3 text-[12px] text-[#6b6860]">
                No live conversations found for this platform yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discussion & sentiment charts */}
      <div className="mb-10 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[#e8e6e0] bg-white p-5">
          <h2 className="mb-1 text-[14px] font-semibold">
            Discussion volume by platform
          </h2>
          <p className="mb-4 text-[12px] text-[#6b6860]">
            How many posts mention this problem across communities.
          </p>
          <div className="h-50">
            <canvas ref={platformCanvasRef} />
          </div>
        </div>
        <div className="rounded-xl border border-[#e8e6e0] bg-white p-5">
          <h2 className="mb-1 text-[14px] font-semibold">
            Sentiment breakdown
          </h2>
          <p className="mb-3 text-[12px] text-[#6b6860]">
            What emotion drives most of the conversation.
          </p>
          <div className="mb-2 flex flex-wrap gap-3 text-[11px] text-[#6b6860]">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-[#f87171]" />
              Pain / frustration
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-[#34d399]" />
              Wants a solution
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-[#60a5fa]" />
              Building one
            </span>
          </div>
          <div className="h-46.5">
            <canvas ref={sentimentCanvasRef} />
          </div>
        </div>
      </div>

      {/* Email gate */}
      {!gateUnlocked && (
        <EmailGateCard
          gateStep={gateStep}
          gateEmail={gateEmail}
          setGateEmail={setGateEmail}
          gateCode={gateCode}
          setGateCode={setGateCode}
          gateError={gateError}
          gateLoading={gateLoading}
          submitEmailGate={submitEmailGate}
          submitGateCode={submitGateCode}
          resendGateCode={resendGateCode}
        />
      )}

      {/* Gated content */}
      <div className="relative mb-10">
        <div
          className={`${!gateUnlocked ? "pointer-events-none select-none" : ""}`}
        >
          {/* Demand signals */}
          <div className="mb-8 rounded-xl border border-[#e8e6e0] bg-white p-5">
            <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#a8a59f]">
              What people are searching and paying for right now
            </p>
            <div className="space-y-3">
              {(reportA?.demandSignals ?? []).map((signal, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-[#f0ede8] px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1917]">
                      {signal.theme}
                    </p>
                    <p className="text-[12px] text-[#6b6860]">
                      {signal.intent}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <VolumeBar level={signal.estimatedVolume} />
                    <span className="text-[10px] uppercase text-[#9e9b93]">
                      {signal.estimatedVolume}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitors */}
          <div className="mb-8">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-[#a8a59f]">
              Who's already in this space
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {(reportA?.competitors ?? [])
                .slice(0, 3)
                .map((competitor, idx) => (
                  <article
                    key={idx}
                    className="overflow-hidden rounded-xl border border-[#e8e6e0] bg-white"
                  >
                    <div className="border-b border-[#e8e6e0] px-4 py-3">
                      <p className="text-[14px] font-semibold text-[#1a1917]">
                        {competitor.name}
                      </p>
                      <p className="mt-1 text-[12px] text-[#6b6860]">
                        {competitor.whatTheyDo}
                      </p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[#a8a59f]">
                        Gap they leave open
                      </p>
                      <p className="text-[12px] leading-5 text-[#1a1917]">
                        {competitor.gap}
                      </p>
                    </div>
                  </article>
                ))}
            </div>
          </div>

          {/* Opportunity callout */}
          <div className="mb-8 rounded-xl bg-[#1a1917] p-6 text-white">
            <p className="text-[14px] leading-7">
              <strong>The real opportunity:</strong>{" "}
              {keywordNote ||
                "Users are already searching for this solution. Your timing is good — the market is past early adopter stage and entering mainstream awareness."}
            </p>
          </div>
        </div>
        {!gateUnlocked && <GateOverlay />}
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onContinueScope}
          className="flex-1 rounded-lg bg-[#1a1917] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#333]"
        >
          Now decide what to build →
        </button>

        
      </div>
    </div>
  );
}
