type LandingFooterProps = {
  headingFontClass: string;
  bodyFontClass: string;
};

export function LandingFooter({
  headingFontClass,
  bodyFontClass,
}: LandingFooterProps) {
  return (
    <footer className="border-t border-[#E7E2D7] bg-[#F8F3E8] px-5 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto flex w-full max-w-300 flex-col items-center gap-5 text-center lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:text-left">
        <p
          className={`text-[24px] font-bold leading-none lg:justify-self-start ${headingFontClass}`}
        >
          Founder OS
        </p>

        <div
          className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-widest text-[#919191] lg:justify-self-center ${bodyFontClass}`}
        >
          <a
            href="https://www.creworklabs.com/#contact-us"
            className="transition hover:text-[#1D1C15]"
          >
            Contact
          </a>
          <a
            href="https://www.linkedin.com/school/creworklabss/"
            className="transition hover:text-[#1D1C15]"
          >
            LinkedIn
          </a>
        </div>

        <p
          className={`text-[11px] uppercase tracking-widest text-[#919191] lg:justify-self-end lg:text-right ${bodyFontClass}`}
        >
          © 2026 Founder OS. The Editorial Architect.
        </p>
      </div>
    </footer>
  );
}
