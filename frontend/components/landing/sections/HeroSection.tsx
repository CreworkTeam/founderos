"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { roadmapSteps } from "../landing-data";
import { HeroBlueprintCard } from "./HeroBlueprintCard";
import { TextEffect } from "@/components/motion-primitives/text-effect";

type HeroSectionProps = {
  headingFontClass: string;
  serifFontClass: string;
  bodyFontClass: string;
  monoFontClass: string;
  uiFontClass: string;
};

export function HeroSection({
  headingFontClass,
  serifFontClass,
  bodyFontClass,
  monoFontClass,
  uiFontClass,
}: HeroSectionProps) {
  return (
    <section
      id="blueprint"
      className="mx-auto w-full max-w-300 px-4 pb-6 pt-5 sm:px-8 lg:pb-9 lg:pt-6"
    >
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,460px)_minmax(0,580px)] lg:justify-between">
        <div>
          <h1 className="max-w-full text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-[#020617] sm:max-w-130 sm:text-[32px] lg:text-[42px] lg:leading-[1.07]">
            <TextEffect
              per="word"
              as="span"
              preset="slide"
              className={headingFontClass}
            >
              From idea to launched product -
            </TextEffect>{" "}
            <TextEffect
              per="word"
              as="span"
              preset="slide"
              delay={0.3}
              className={`font-normal italic text-[#494740] ${serifFontClass}`}
            >
              without the guesswork.
            </TextEffect>
          </h1>

          <p
            className={`mt-3.5 max-w-full text-[14px] leading-[1.55] text-[#494740] sm:max-w-99.5 sm:text-[15px] ${bodyFontClass}`}
          >
            Our structured operating system bridges the gap between vision and
            execution for ambitious founders.
          </p>

          <div className="mt-6">
            <p
              className={`text-[10px] uppercase tracking-[0.18em] text-[#7A776F] ${monoFontClass}`}
            >
              The Roadmap
            </p>

            <ol className="mt-3.5 space-y-0.5">
              {roadmapSteps.map((step, index) => {
                const isActive = index === 0;
                const isLast = index === roadmapSteps.length - 1;

                return (
                  <li
                    key={step.title}
                    className="relative flex gap-4 pb-4.5 last:pb-0"
                  >
                    {!isLast ? (
                      <span className="absolute left-2.75 top-8 h-[calc(100%-10px)] w-px bg-[#CBC6BD]/70" />
                    ) : null}

                    <span
                      className={`z-10 mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-black text-white"
                          : "bg-[#E7E2D7] text-black"
                      } ${monoFontClass}`}
                    >
                      {index + 1}
                    </span>

                    <span className="block">
                      <span
                        className={`block text-[15px] font-bold leading-6 ${headingFontClass}`}
                      >
                        {step.title}
                      </span>
                      <span
                        className={`mt-0.5 block text-[12px] leading-5 text-[#494740]/85 ${bodyFontClass}`}
                      >
                        {step.description}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/quiz"
              className={`inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#020617] px-6.5 py-3 text-[14px] font-bold text-white transition hover:translate-x-px hover:bg-[#111827] sm:w-auto ${headingFontClass}`}
            >
              Start Your Blueprint
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <HeroBlueprintCard
          headingFontClass={headingFontClass}
          bodyFontClass={bodyFontClass}
          monoFontClass={monoFontClass}
        />
      </div>
    </section>
  );
}
