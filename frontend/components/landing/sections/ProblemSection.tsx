import { Blocks, SearchCheck, WalletCards } from 'lucide-react'
import { painCards } from '../landing-data'

type ProblemSectionProps = {
  headingFontClass: string
  bodyFontClass: string
}

const iconMap = [WalletCards, Blocks, SearchCheck]

export function ProblemSection({ headingFontClass, bodyFontClass }: ProblemSectionProps) {
  return (
    <section className="mx-auto mt-6 w-full max-w-300 rounded-3xl bg-black px-6 py-10 sm:px-9 lg:px-16 lg:py-14">
      <div className="max-w-190">
        <h2 className={`text-[34px] font-bold leading-[1.02] tracking-[-0.03em] text-white sm:text-[44px] ${headingFontClass}`}>
          Stop Building in the Dark.
        </h2>
        <p className={`mt-4 max-w-145 text-[16px] leading-7 text-[#868380] ${bodyFontClass}`}>
          Do not throw money at code before you have clarity. We provide the technical leverage you need to succeed.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {painCards.map((card, index) => {
          const Icon = iconMap[index]
          return (
            <article
              key={card.title}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))] p-5 shadow-[0px_0px_6px_0px_#00000040] transition-colors duration-300 hover:border-[#FFB59B]/30"
            >
              <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#FFB59B]/0 blur-2xl transition-colors duration-500 group-hover:bg-[#FFB59B]/10" />

              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#FFB59B]/20 bg-[#FFB59B]/10">
                <Icon className="h-5 w-5 text-[#FFB59B]" strokeWidth={1.8} />
              </div>
              <h3
                className={`mt-4 text-[22px] font-bold leading-7 text-white ${headingFontClass}`}
              >
                {card.title}
              </h3>
              <p
                className={`mt-2.5 text-[14px] leading-[1.62] text-[#A8A29E] ${bodyFontClass}`}
              >
                {card.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  )
}
