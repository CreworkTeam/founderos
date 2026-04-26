import type { ReportSection } from './types'

type SidebarProps = {
  section: ReportSection
  setSection: (section: ReportSection) => void
  ideaText: string
}

type HeaderProps = {
  section: ReportSection
}

export function GateOverlay() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backdropFilter: 'blur(4px)',
        background: 'linear-gradient(to bottom, rgba(248,246,241,0.1) 0%, rgba(248,246,241,0.85) 55%, rgba(248,246,241,0.96) 100%)',
      }}
    />
  )
}

export function ReportSidebar({ section, setSection, ideaText }: SidebarProps) {
  const sectionItems: Array<{ key: ReportSection; label: string }> = [
    { key: 'validate', label: 'Is there demand?' },
    { key: 'scope', label: 'What to build?' },
    { key: 'plan', label: 'How to start?' },
  ]

  const onThisPageItems: Record<ReportSection, string[]> = {
    validate: ['Keyword trends', 'Community signals', 'Competitors', 'Week 1 checklist'],
    scope: ['Your core loop', 'Feature matrix', 'Tech stack', 'How to get first users'],
    plan: ['Tech stack', 'North star metric', 'Unit economics', '28-day roadmap'],
  }

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-55 border-r border-[#e8e6e0] bg-white px-4 py-6 lg:flex lg:flex-col">
      <div className="mb-6 px-1 text-[13px] font-semibold">Founder OS <span className="font-normal text-[#6b6860]">by Crework</span></div>
      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#a8a59f]">Your report</p>
      {sectionItems.map((item) => (
        <button
          key={item.key}
          onClick={() => setSection(item.key)}
          className={`mb-1 w-full rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${section === item.key ? 'bg-[#f7f6f3] font-medium text-[#1a1917]' : 'text-[#6b6860] hover:bg-[#f7f6f3]'}`}
        >
          {item.label}
        </button>
      ))}

      <div className="my-4 h-px bg-[#e8e6e0]" />
      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#a8a59f]">On this page</p>
      {onThisPageItems[section].map((item) => (
        <p key={item} className="mb-1 rounded-md px-2 py-1.5 text-[12px] text-[#6b6860]">{item}</p>
      ))}

      <div className="mt-auto">
        <div className="my-3 h-px bg-[#e8e6e0]" />
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#a8a59f]">Your idea</p>
        <div className="rounded-md bg-[#f7f6f3] p-2 text-[12px] text-[#1a1917] leading-relaxed">{ideaText}</div>
      </div>
    </aside>
  )
}

export function ReportMobileNav({ section, setSection }: { section: ReportSection; setSection: (section: ReportSection) => void }) {
  const sectionItems: Array<{ key: ReportSection; label: string }> = [
    { key: 'validate', label: 'Validate' },
    { key: 'scope', label: 'Scope' },
    { key: 'plan', label: 'Plan' },
  ]

  return (
    <div className="mb-5 grid grid-cols-3 gap-2 rounded-lg border border-[#e8e6e0] bg-white p-2 lg:hidden">
      {sectionItems.map((item) => (
        <button
          key={item.key}
          onClick={() => setSection(item.key)}
          className={`rounded-md px-2 py-2 text-[12px] font-medium transition-colors ${section === item.key ? 'bg-[#1a1917] text-white' : 'text-[#6b6860] hover:bg-[#f7f6f3]'}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function ReportHeader({ section }: HeaderProps) {
  const serifFontClass = 'font-[family-name:var(--font-instrument-serif)]'

  return (
    <header className="mb-10 border-b border-[#e8e6e0] pb-7">
      <p className="mb-3 text-[11px] text-[#9e9b93]">
        Founder OS -&gt; {section === 'validate' ? 'Is there demand?' : section === 'scope' ? 'What to build?' : 'How to start?'}
      </p>
      <h1
        className="mb-2 text-[31px] leading-[1.22] tracking-[-0.01em]"
        style={section === 'scope' ? undefined : { fontFamily: 'Georgia, serif' }}
      >
        {section === 'validate' && 'Strong demand signals for your startup idea'}
        {section === 'scope' && (
          <>
            <span className="block text-[52px] leading-[1.04]">Here's your v1.</span>
              <span className={`block text-[68px] font-normal italic leading-[0.92] tracking-[-0.018em] text-[#5b5750] ${serifFontClass}`}>Everything else is v2.</span>
          </>
        )}
        {section === 'plan' && 'Build your V1.'}
      </h1>
      <p className="max-w-160 text-[14px] leading-[1.7] text-[#5a574f]">
        {section === 'validate' && 'We scanned keyword trends and community conversations to find real evidence that people want what you are building.'}
        {section === 'scope' && 'This section maps your core loop, the features to prioritize, and what to defer so your first release is shippable.'}
        {section === 'plan' && 'Now that you know what to build, this section covers the tech stack to go with, the metrics to optimise from day 1, and a 28-day plan to go from idea to a real product.'}
      </p>
    </header>
  )
}

export function ReportLoading() {
  return (
    <div className="mb-8 rounded-xl border border-[#e8e6e0] bg-white px-5 py-4 text-[13px] text-[#6b6860]">
      Building your report sections...
    </div>
  )
}

export function EmailGateCard({
  gateEmail,
  setGateEmail,
  gateError,
  gateLoading,
  submitEmailGate,
}: {
  gateEmail: string
  setGateEmail: (value: string) => void
  gateError: string
  gateLoading: boolean
  submitEmailGate: () => void
}) {
  return (
    <div className="mb-10 rounded-xl border border-[#d1cec7] bg-[#fffbeb] p-5">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#92400e]">Unlock full report</p>
      <h3 className="mb-2 text-[18px] font-semibold">Get Scope + Plan access instantly</h3>
      <p className="mb-4 max-w-160 text-[13px] leading-6 text-[#6b6860]">
        Enter your email to continue reading the full report with precise build scope and a practical launch plan.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={gateEmail}
          onChange={(event) => setGateEmail(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && submitEmailGate()}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-[#d1cec7] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#1a1917]"
        />
        <button
          type="button"
          disabled={gateLoading}
          onClick={submitEmailGate}
          className="rounded-lg bg-[#1a1917] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#333] disabled:opacity-50"
        >
          {gateLoading ? 'Unlocking...' : 'Unlock full report'}
        </button>
      </div>
      {gateError ? <p className="mt-2 text-[12px] text-[#991b1b]">{gateError}</p> : null}
    </div>
  )
}
