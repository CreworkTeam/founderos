import {
  DM_Mono,
  Instrument_Serif,
  Inter,
  Manrope,
  Space_Grotesk,
} from "next/font/google";
import { LandingHeader } from "./sections/LandingHeader";
import { HeroSection } from "./sections/HeroSection";
import { ProblemSection } from "./sections/ProblemSection";
import { FinalCtaSection } from "./sections/FinalCtaSection";
import { LandingFooter } from "./sections/LandingFooter";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export function LandingPage() {
  const headingFontClass = "font-[family-name:var(--font-space-grotesk)]";
  const serifFontClass = "font-[family-name:var(--font-instrument-serif)]";
  const bodyFontClass = "font-[family-name:var(--font-manrope)]";
  const monoFontClass = "font-[family-name:var(--font-dm-mono)]";
  const uiFontClass = "font-[family-name:var(--font-inter)]";

  return (
    <main
      className={`${spaceGrotesk.variable} ${instrumentSerif.variable} ${manrope.variable} ${dmMono.variable} ${inter.variable} relative bg-[#FEF9ED] text-[#1D1C15]`}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(29,28,21,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(29,28,21,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10">
        <LandingHeader fontClass={headingFontClass} />

        <HeroSection
          headingFontClass={headingFontClass}
          serifFontClass={serifFontClass}
          bodyFontClass={bodyFontClass}
          monoFontClass={monoFontClass}
          uiFontClass={uiFontClass}
        />

        <ProblemSection
          headingFontClass={headingFontClass}
          bodyFontClass={bodyFontClass}
        />

        <FinalCtaSection
          headingFontClass={headingFontClass}
          serifFontClass={serifFontClass}
          bodyFontClass={bodyFontClass}
        />

        <LandingFooter
          headingFontClass={headingFontClass}
          bodyFontClass={bodyFontClass}
        />
      </div>
    </main>
  );
}
