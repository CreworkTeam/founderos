import { Tilt } from "@/components/motion-primitives/tilt";

type HeroBlueprintCardProps = {
  headingFontClass: string;
  bodyFontClass: string;
  monoFontClass: string;
};

export function HeroBlueprintCard({
  headingFontClass,
  bodyFontClass,
  monoFontClass,
}: HeroBlueprintCardProps) {
  return (
    <Tilt
      rotationFactor={8}
      isRevese
      className="mx-auto mt-2 w-full max-w-110 sm:max-w-130 lg:mt-0 lg:max-w-160 lg:self-center lg:justify-self-end"
    >
      <div className="relative overflow-hidden rounded-3xl bg-[#0C0C0C] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_20px_48px_-8px_rgba(0,0,0,0.45)]">
        {/* Glass edge shimmer */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />

        {/* Warm ambient glow */}
        <div className="pointer-events-none absolute -bottom-10 left-1/2 h-36 w-64 -translate-x-1/2 rounded-full bg-[#FFB59B]/[0.14] blur-3xl" />

        <div className="relative flex flex-col gap-3">
          <div className="flex flex-col">
            {/* Before card */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
              <div className="bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(255,255,255,0.005))] px-5 pb-8 pt-5">
                <div
                  className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-white/30 ${monoFontClass}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  Before
                </div>
                <p
                  className={`mt-2 text-[14px] font-medium leading-snug text-white/55 ${headingFontClass}`}
                >
                  A good idea sitting in your head
                </p>
                <p
                  className={`mt-1 text-[12px] leading-relaxed text-white/28 ${bodyFontClass}`}
                >
                  No clarity on what to build, what it costs, or where to start
                </p>
              </div>
            </div>

            {/* Animated arrow — overlaps both cards via negative margins */}
            <div className="relative z-10 -my-5 flex items-center justify-center">
              <svg
                width="24"
                height="46"
                viewBox="0 0 24 46"
                fill="none"
                overflow="visible"
              >
                <defs>
                  <filter
                    id="blueprint-glow"
                    x="-120%"
                    y="-30%"
                    width="340%"
                    height="160%"
                  >
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Organic S-curve dashed line */}
                <path
                  d="M12 0 C11 9, 13 18, 12 30"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray="3 4.5"
                  strokeOpacity="0.3"
                  filter="url(#blueprint-glow)"
                  className="arrow-flow"
                />

                {/* Arrowhead */}
                <path
                  d="M4 27 L12 38 L20 27"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.7"
                  filter="url(#blueprint-glow)"
                  className="arrow-bob"
                />
              </svg>
            </div>

            {/* After card */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
              <div className="bg-[linear-gradient(145deg,rgba(255,181,155,0.09),rgba(255,181,155,0.015))] px-5 pb-5 pt-8">
                <div
                  className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#FFB59B] ${monoFontClass}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FFB59B] shadow-[0_0_8px_rgba(255,181,155,0.75)]" />
                  After
                </div>
                <p
                  className={`mt-2 text-[14px] font-semibold leading-snug text-white ${headingFontClass}`}
                >
                  A launch-ready blueprint in 2 minutes
                </p>
                <p
                  className={`mt-1 text-[12px] leading-relaxed text-white/45 ${bodyFontClass}`}
                >
                  What to build, how much it costs, and exactly what to do next
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "2 min", label: "Full blueprint", accent: true },
              { value: "Free", label: "No sign up", accent: false },
              { value: "5 steps", label: "Idea to launch", accent: false },
            ].map(({ value, label, accent }) => (
              <div
                key={value}
                className={`rounded-xl border border-white/[0.08] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
                  accent
                    ? "bg-[linear-gradient(145deg,rgba(255,181,155,0.1),rgba(255,181,155,0.02))]"
                    : "bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]"
                }`}
              >
                <p
                  className={`text-[20px] font-bold leading-none ${accent ? "text-[#FFB59B]" : "text-white"} ${headingFontClass}`}
                >
                  {value}
                </p>
                <p
                  className={`mt-1.5 text-[10px] leading-tight text-white/30 ${bodyFontClass}`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Tilt>
  );
}
