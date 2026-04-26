'use client'

import type { ReportB, ReportC } from '@/types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { GateOverlay } from './shared'
import { AIToolLogo } from './tool-logos'

type PlanSectionProps = {
  reportB: ReportB | null
  reportC: ReportC | null
  gateUnlocked: boolean
  capturedEmail: string | null
  downloadEmail: string
  setDownloadEmail: (value: string) => void
  downloadLoading: boolean
  downloadSuccess: boolean
  downloadError: string
  onDownloadReport: () => void
}

export function PlanSection({
  reportB,
  reportC,
  gateUnlocked,
  capturedEmail,
  downloadEmail,
  setDownloadEmail,
  downloadLoading,
  downloadSuccess,
  downloadError,
  onDownloadReport,
}: PlanSectionProps) {
  const [showDownloadForm, setShowDownloadForm] = useState(false)
  const economicsCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const plan = reportC?.whatToBuildPlan

  const northStar = plan?.northStarMetric ?? {
    metric: 'Core action completed per user per week',
    explanation:
      'If users are completing the core action regularly, your product is working. Below your target, improve the experience before adding features.',
    target: 'Target: set based on your use case',
    trackingNote: 'Track from day 1',
  }

  const unitEconomics = plan?.unitEconomics ?? {
    title: 'How many bookings you need at different commission rates',
    description: 'At 10% commission, 200 bookings = 1k MRR.',
    points: [
      { commissionLabel: '5% commission', bookingsToTarget: 400, artistsNeeded: 40 },
      { commissionLabel: '10% commission', bookingsToTarget: 200, artistsNeeded: 20 },
      { commissionLabel: '15% commission', bookingsToTarget: 133, artistsNeeded: 14 },
      { commissionLabel: '20% commission', bookingsToTarget: 100, artistsNeeded: 10 },
    ],
  }

  const roadmapWeeks = useMemo(() => {
    if (reportC?.roadmap?.length) {
      return reportC.roadmap.slice(0, 4).map((week) => ({
        week: week.week,
        title: week.title,
        deliverables: week.deliverables,
      }))
    }
    return [
      {
        week: 1,
        title: 'Discover & validate',
        deliverables: [
          'Talk to 10 potential users',
          'Confirm the problem is real and urgent',
          'Define your core user persona',
        ],
      },
      {
        week: 2,
        title: 'Design & prototype',
        deliverables: [
          'Build a no-code or paper prototype',
          'Run 5 user tests and note every friction point',
          'Lock your core loop before writing code',
        ],
      },
      {
        week: 3,
        title: 'Build the core loop',
        deliverables: [
          'Code the smallest working version',
          'Get it in front of 3 real users',
          'Deploy to a live URL',
        ],
      },
      {
        week: 4,
        title: 'Ship & measure',
        deliverables: [
          'Track your north star metric from day 1',
          'Interview every active user this week',
          'Decide: iterate on retention or expand reach',
        ],
      },
    ]
  }, [reportC?.roadmap])

  const complexityColor = reportB?.complexityLevel === 'Low'
    ? { border: 'border-[#b5d6bf]', bg: 'bg-[#eaf3ec]', text: 'text-[#1e5c38]', dot: 'bg-[#1e5c38]' }
    : reportB?.complexityLevel === 'Medium'
    ? { border: 'border-[#fde68a]', bg: 'bg-[#fffbeb]', text: 'text-[#78350f]', dot: 'bg-[#78350f]' }
    : { border: 'border-[#fecaca]', bg: 'bg-[#fff7f7]', text: 'text-[#7f1d1d]', dot: 'bg-[#7f1d1d]' }

  const complexitySummary = reportB?.complexityExplanation ?? 'Your MVP has moderate implementation complexity. Keep scope tight and prioritize one core user outcome over breadth.'

  const isMarketplaceOrEcommerce = reportC?.archetype === 'marketplace' || reportC?.archetype === 'ecommerce'
  const primaryDatasetLabel = isMarketplaceOrEcommerce ? 'Bookings to reach $1k MRR' : 'Users needed for $1k MRR'
  const secondaryDatasetLabel = isMarketplaceOrEcommerce ? 'Suppliers needed' : 'Paying users needed'

  useEffect(() => {
    if (!economicsCanvasRef.current) return

    let chart: { destroy: () => void } | null = null
    let destroyed = false

    const buildChart = async () => {
      const chartModule = await import('chart.js/auto')
      const Chart = chartModule.default

      if (destroyed || !economicsCanvasRef.current) return

      chart = new Chart(economicsCanvasRef.current, {
        type: 'bar',
        data: {
          labels: unitEconomics.points.map((point) => point.commissionLabel),
          datasets: [
            {
              label: primaryDatasetLabel,
              data: unitEconomics.points.map((point) => point.bookingsToTarget),
              backgroundColor: '#1a1917',
              borderRadius: 6,
              borderSkipped: false,
            },
            {
              label: secondaryDatasetLabel,
              data: unitEconomics.points.map((point) => point.artistsNeeded),
              backgroundColor: '#d1cec7',
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                boxWidth: 10,
                boxHeight: 10,
                color: '#6b6860',
                font: { size: 11 },
                padding: 16,
              },
            },
          },
          scales: {
            x: {
              ticks: { color: '#a8a59f', font: { size: 11 } },
              grid: { display: false },
              border: { display: false },
            },
            y: {
              ticks: { color: '#a8a59f', font: { size: 11 } },
              grid: { color: '#e8e6e0', lineWidth: 0.5 },
              border: { display: false },
            },
          },
        },
      })
    }

    buildChart()

    return () => {
      destroyed = true
      if (chart) chart.destroy()
    }
  }, [primaryDatasetLabel, secondaryDatasetLabel, unitEconomics.points])

  const sectionClass = 'mb-9'

  return (
    <div className="relative">
      <div className={`${!gateUnlocked ? 'pointer-events-none select-none' : ''}`}>

        {/* Technical Complexity */}
        <div className="mb-3">
          <p className="mb-1 text-[10px] uppercase tracking-widest text-[#9e9b93]">Technical complexity</p>
          <p className="text-[13px] text-[#5a574f]">An honest read of build difficulty, stack choice, and mistakes to avoid.</p>
        </div>

        <div className="mb-3 overflow-hidden rounded-xl border border-[#e4e0d8] bg-white">
          <div className="border-b border-[#e4e0d8] px-5 py-4">
            <div className="flex flex-wrap items-start gap-4">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#9e9b93]">Complexity level</p>
                {reportB?.complexityLevel && (
                  <span className={`inline-flex items-center gap-2 rounded-[7px] ${complexityColor.border} ${complexityColor.bg} px-3 py-1.5 text-[14px] font-semibold ${complexityColor.text}`}>
                    <span className={`h-2 w-2 rounded-full ${complexityColor.dot}`} />
                    {reportB.complexityLevel}
                  </span>
                )}
              </div>
              <p className="flex-1 text-[13px] leading-7 text-[#5a574f]">{complexitySummary}</p>
            </div>
          </div>

          <div className="bg-[#1c1b18] px-5 py-4">
            <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-white/40">Suggested approach</p>
            <p className="mb-3 text-[12px] leading-6 text-white/80" style={{ fontFamily: 'var(--font-geist-mono)' }}>
              Next.js for frontend + Supabase for database, auth, and storage. Google Maps API for location. Cal.com embedded for booking. Vercel for hosting.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Next.js', 'Supabase', 'Google Maps API', 'Vercel', 'Tailwind CSS', 'Stripe'].map((tool) => (
                <span key={tool} className="rounded-[5px] border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] text-white/85" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Tools */}
        <div className="mb-3">
          <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[#9e9b93]">AI tools to build faster</p>
          <p className="mb-4 text-[13px] text-[#5a574f]">Ship your MVP in weeks, not months, with these AI-native tools.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(reportB?.aiTools && reportB.aiTools.length > 0
              ? reportB.aiTools
              : [
                  { tool: 'Lovable', useCase: 'Frontend-first, great for UI-heavy apps', url: 'https://lovable.dev' },
                  { tool: 'Cursor', useCase: 'AI code editor for full-stack builds', url: 'https://cursor.sh' },
                  { tool: 'v0 by Vercel', useCase: 'Generate UI components instantly', url: 'https://v0.dev' },
                  { tool: 'Bolt', useCase: 'Instant full-stack prototypes', url: 'https://bolt.new' },
                ]
            ).map(({ tool, useCase, url }) => (
              <a
                key={tool}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-xl border border-[#e4e0d8] bg-white p-4 no-underline transition-all hover:border-[#c8c4bc] hover:shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
              >
                <AIToolLogo tool={tool} url={url} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 truncate text-[13px] font-semibold text-[#1a1917]">{tool}</p>
                  <p className="text-[12px] leading-[1.5] text-[#6b6860]">{useCase}</p>
                </div>
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-[#d1cec7] transition-colors group-hover:text-[#1a1917]"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M2.5 11.5L11.5 2.5M11.5 2.5H6M11.5 2.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Common Mistakes */}
        <div className={sectionClass}>
          <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-[#9e9b93]">Common mistakes to avoid</p>
          <div className="space-y-2">
            {(reportB?.commonMistakes && reportB.commonMistakes.length > 0
              ? reportB.commonMistakes
              : [
                  'Building too many features before validating one clear core workflow with real users.',
                  'Delaying feedback loops until after launch instead of testing with users every week.',
                  'Over-engineering infrastructure before proving retention and willingness to pay.',
                ]
            ).map((mistake) => (
              <div key={mistake} className="flex items-start gap-3 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-4 py-3">
                <span className="mt-px text-[13px]">⚠</span>
                <p className="text-[13px] leading-6 text-[#78350f]">{mistake}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 h-px bg-[#e4e0d8]" />

        {/* North Star Metric */}
        <div className={sectionClass}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#a8a59f]">The one number that tells you it is working</p>
          <div className="rounded-xl border border-[#e8e6e0] bg-white p-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a8a59f]">Your north star metric</p>
            <h3 className="mb-1 text-[20px] font-semibold text-[#1a1917]">{northStar.metric}</h3>
            <p className="text-[13px] leading-6 text-[#6b6860]">{northStar.explanation}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-md bg-[#e8f5ee] px-3 py-2 text-[12px] font-medium text-[#2d6a4f]">{northStar.target}</span>
              <span className="rounded-md bg-[#f0ede8] px-3 py-2 text-[12px] font-medium text-[#6b6860]">{northStar.trackingNote}</span>
            </div>
          </div>
        </div>

        {/* Unit Economics */}
        <div className={sectionClass}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#a8a59f]">Your path to 1k MRR</p>
          <div className="rounded-xl border border-[#e8e6e0] bg-white p-5">
            <h3 className="mb-1 text-[14px] font-semibold text-[#1a1917]">{unitEconomics.title}</h3>
            <p className="mb-4 text-[12px] text-[#6b6860]">{unitEconomics.description}</p>
            <div className="h-70">
              <canvas ref={economicsCanvasRef} />
            </div>
          </div>
        </div>

        <div className="mb-8 h-px bg-[#e4e0d8]" />

        {/* 28-day Roadmap */}
        <div className={sectionClass}>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#a8a59f]">Your 28-day roadmap</p>
          <p className="mb-4 text-[13px] text-[#5a574f]">Four focused weeks from idea to a product real users can try.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {roadmapWeeks.map((week) => (
              <div key={week.week} className="rounded-xl border border-[#e8e6e0] bg-white p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a1917] text-[11px] font-semibold text-white">
                    W{week.week}
                  </span>
                  <h3 className="text-[14px] font-semibold text-[#1a1917]">{week.title}</h3>
                </div>
                <ul className="space-y-1.5">
                  {week.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12px] leading-[1.6] text-[#5a574f]">
                      <span className="mt-[4px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#d1cec7]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          {downloadSuccess ? (
            <div className="rounded-lg border border-[#b5d6bf] bg-[#eaf3ec] px-5 py-4 text-center">
              <p className="text-[14px] font-medium text-[#1e5c38]">Report sent! Check your inbox.</p>
              <p className="mt-1 text-[12px] text-[#2d6a4f]">We emailed your full report including the tech stack, metrics, and 28-day plan.</p>
            </div>
          ) : showDownloadForm && !capturedEmail ? (
            <div className="rounded-xl border border-[#e8e6e0] bg-white p-5">
              <p className="mb-3 text-[13px] font-medium text-[#1a1917]">Enter your email to receive the full report</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={downloadEmail}
                  onChange={(e) => setDownloadEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onDownloadReport()}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-[#d1cec7] bg-[#f8f6f1] px-4 py-3 text-[13px] outline-none focus:border-[#1a1917]"
                />
                <button
                  type="button"
                  disabled={downloadLoading}
                  onClick={onDownloadReport}
                  className="shrink-0 rounded-lg bg-[#1a1917] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#333] disabled:opacity-50"
                >
                  {downloadLoading ? 'Sending...' : 'Send report'}
                </button>
              </div>
              {downloadError && <p className="mt-2 text-[12px] text-[#991b1b]">{downloadError}</p>}
            </div>
          ) : (
            <button
              type="button"
              onClick={capturedEmail ? onDownloadReport : () => setShowDownloadForm(true)}
              disabled={downloadLoading}
              className="w-full rounded-lg bg-[#1a1917] px-5 py-3 text-center text-[14px] font-semibold text-white transition hover:bg-[#333] disabled:opacity-50"
            >
              {downloadLoading ? 'Sending...' : 'Download report →'}
            </button>
          )}

          <a
            href="https://cal.com/creworklabs"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-lg border border-[#d1cec7] bg-transparent px-5 py-3 text-center text-[14px] text-[#1a1917] transition hover:bg-[#f0ede8]"
          >
            Need help with building your idea? Book a call with Crework
          </a>
        </div>
      </div>
      {!gateUnlocked && <GateOverlay />}
    </div>
  )
}
