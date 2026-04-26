'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFounderStore } from '@/store/useFounderStore'
import { api } from '@/lib/api'
import { analytics } from '@/lib/analytics'
import { PlanSection } from '@/components/report/page/PlanSection'
import { ValidateSection } from '@/components/report/page/ValidateSection'
import { ReportHeader, ReportLoading, ReportMobileNav, ReportSidebar } from '@/components/report/page/shared'
import { toFeedPost, type FeedPost, type ReportSection } from '@/components/report/page/types'
import { ScopeSection } from '../../components/report/page/ScopeSection'

export default function ReportPage() {
  const [section, setSection] = useState<ReportSection>('validate')
  const [platform, setPlatform] = useState<'all' | FeedPost['platform']>('all')
  const [gateEmail, setGateEmail] = useState('')
  const [gateLoading, setGateLoading] = useState(false)
  const [gateError, setGateError] = useState('')
  const [loadingReports, setLoadingReports] = useState(false)
  const [loadingRouteA, setLoadingRouteA] = useState(false)
  const [loadingRouteB, setLoadingRouteB] = useState(false)
  const [loadingRouteC, setLoadingRouteC] = useState(false)
  const [downloadEmail, setDownloadEmail] = useState('')
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  const {
    sessionId,
    quiz,
    archetype,
    reports,
    email,
    setReport,
    setEmail,
    setLeadTag,
    persistToStorage,
  } = useFounderStore()

  const keywordCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const platformCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const sentimentCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const routeAKeyRef = useRef<string | null>(null)
  const routeBKeyRef = useRef<string | null>(null)
  const routeCKeyRef = useRef<string | null>(null)

  const activeArchetype = archetype
  const reportA = reports.A
  const reportB = reports.B
  const reportC = reports.C
  const gateUnlocked = Boolean(email)
  const requestKey = useMemo(
    () => JSON.stringify({ archetype: activeArchetype, q1: quiz.q1, q2: quiz.q2, q3: quiz.q3, q4: quiz.q4 }),
    [activeArchetype, quiz.q1, quiz.q2, quiz.q3, quiz.q4]
  )

  const generatedPosts = useMemo(() => {
    if (!reportB?.marketingPlan?.activeThreads?.length) return []
    return reportB.marketingPlan.activeThreads.slice(0, 8).map(toFeedPost)
  }, [reportB])

  const filteredPosts = useMemo(() => {
    if (platform === 'all') return generatedPosts
    return generatedPosts.filter((post) => post.platform === platform)
  }, [platform, generatedPosts])

  useEffect(() => {
    let cancelled = false

    async function loadReportA() {
      if (!activeArchetype) {
        setLoadingReports(true)
        return
      }

      if (routeAKeyRef.current === requestKey && reportA) return
      setLoadingReports(true)

      try {
        const body = { quiz, archetype: activeArchetype }
        setLoadingRouteA(true)
        const a = await api.reportA(body)
        if (cancelled) return
        setReport('A', a)
        routeAKeyRef.current = requestKey
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) {
          setLoadingReports(false)
          setLoadingRouteA(false)
        }
      }
    }

    loadReportA()

    return () => {
      cancelled = true
    }
  }, [reportA, quiz, activeArchetype, requestKey, setReport])

  useEffect(() => {
    let cancelled = false

    async function loadReportB() {
      if (!activeArchetype || !gateUnlocked) return
      if (section === 'validate') return
      if (routeBKeyRef.current === requestKey && reportB) return

      try {
        setLoadingRouteB(true)
        const body = { quiz, archetype: activeArchetype }
        const b = await api.reportB(body)
        if (cancelled) return
        setReport('B', b)
        routeBKeyRef.current = requestKey
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoadingRouteB(false)
      }
    }

    loadReportB()

    return () => {
      cancelled = true
    }
  }, [activeArchetype, gateUnlocked, section, reportB, quiz, requestKey, setReport])

  useEffect(() => {
    let cancelled = false

    async function loadReportC() {
      if (!activeArchetype || !gateUnlocked) return
      if (section !== 'plan') return
      if (routeCKeyRef.current === requestKey && reportC) return

      try {
        setLoadingRouteC(true)
        const body = { quiz, archetype: activeArchetype }
        const c = await api.reportC(body)
        if (cancelled) return
        setReport('C', c)
        routeCKeyRef.current = requestKey
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoadingRouteC(false)
      }
    }

    loadReportC()

    return () => {
      cancelled = true
    }
  }, [activeArchetype, gateUnlocked, section, reportC, quiz, requestKey, setReport])

  const handleDownloadReport = async () => {
    const emailToUse = (email || downloadEmail).trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToUse)) {
      setDownloadError('Please enter a valid email address.')
      return
    }
    setDownloadError('')
    setDownloadLoading(true)
    try {
      if (!email) {
        const { leadTag } = await api.captureEmail({ email: emailToUse, sessionId, quiz, archetype, q4: quiz.q4 })
        setEmail(emailToUse)
        setLeadTag(leadTag)
        persistToStorage()
      }
      await api.sendReport({ email: emailToUse, sessionId })
      setDownloadSuccess(true)
    } catch (err) {
      console.error(err)
      setDownloadError('Something went wrong. Please try again.')
    } finally {
      setDownloadLoading(false)
    }
  }

  const submitEmailGate = async () => {
    const normalized = gateEmail.trim().toLowerCase()
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)

    if (!validEmail) {
      setGateError('Please add a valid email to unlock the full report.')
      return
    }

    setGateError('')
    setGateLoading(true)
    try {
      const { leadTag } = await api.captureEmail({
        email: normalized,
        sessionId,
        quiz,
        archetype,
        q4: quiz.q4,
      })
      setEmail(normalized)
      setLeadTag(leadTag)
      persistToStorage()
      analytics.emailSubmitted(sessionId, 'A')
      analytics.reportUnlocked(sessionId, 'A')
    } catch (err) {
      console.error(err)
      setGateError('Something went wrong. Please try again.')
    } finally {
      setGateLoading(false)
    }
  }

  useEffect(() => {
    if (!reportA || section !== 'validate') return

    let destroyed = false
    const charts: Array<{ destroy: () => void }> = []

    const buildCharts = async () => {
      const chartModule = await import('chart.js/auto')
      const Chart = chartModule.default

      if (destroyed) return

      const axisLabelColor = '#a8a59f'
      const gridColor = '#e8e6e0'

      const keywordDatasets = (reportA.demandSignals.slice(0, 3).map((signal, idx) => {
        const volumeBase = signal.estimatedVolume === 'high' ? 60 : signal.estimatedVolume === 'moderate' ? 35 : 18
        const points = [0.74, 0.79, 0.83, 0.88, 0.94, 0.92, 0.98, 0.95, 0.91, 1.04, 1.12, 1.2].map((factor) =>
          Math.round(volumeBase * factor + idx * 2)
        )
        const styles = [
          { borderColor: '#1a1917', borderWidth: 2, pointRadius: 2.5, pointBackgroundColor: '#1a1917' },
          { borderColor: '#9ca3af', borderWidth: 1.5, pointRadius: 2, pointBackgroundColor: '#9ca3af' },
          { borderColor: '#d1cec7', borderWidth: 1.5, pointRadius: 2, pointBackgroundColor: '#d1cec7' },
        ]

        return {
          label: signal.theme,
          data: points,
          ...styles[idx] ?? styles[2],
          tension: 0.35,
        }
      }))

      const platformCounts = reportA.communities.reduce<Record<string, number>>((acc, community) => {
        acc[community.platform] = (acc[community.platform] ?? 0) + 1
        return acc
      }, {})

      const topPlatforms = Object.entries(platformCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      const chartPlatforms = topPlatforms.length > 0
        ? topPlatforms
        : [['Reddit', 1], ['LinkedIn', 1], ['X', 1], ['IndieHackers', 1], ['Discord', 1]]

      const score = reportA.validationScore
      const problemShare = Math.max(25, Math.min(65, Math.round(35 + (10 - score.overall) * 2.5)))
      const solutionShare = Math.max(20, Math.min(60, Math.round(30 + score.searchDemand * 2.2)))
      const buildShare = Math.max(8, 100 - problemShare - solutionShare)

      if (keywordCanvasRef.current) {
        charts.push(
          new Chart(keywordCanvasRef.current, {
            type: 'line',
            data: {
              // TODO: replace with dynamic keyword data when real API is integrated
              labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
              datasets: keywordDatasets,
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false },
              },
              scales: {
                x: {
                  ticks: { color: axisLabelColor, font: { size: 11 } },
                  grid: { color: gridColor, lineWidth: 0.5 },
                  border: { display: false },
                },
                y: {
                  ticks: { color: axisLabelColor, font: { size: 11 } },
                  grid: { color: gridColor, lineWidth: 0.5 },
                  border: { display: false },
                  title: {
                    display: true,
                    text: 'Search interest (0-100)',
                    color: axisLabelColor,
                    font: { size: 11 },
                  },
                },
              },
            },
          })
        )
      }

      if (platformCanvasRef.current) {
        charts.push(
          new Chart(platformCanvasRef.current, {
            type: 'bar',
            data: {
              labels: chartPlatforms.map(([name]) => name),
              datasets: [
                {
                  label: 'Posts',
                  data: chartPlatforms.map(([, count]) => count),
                  backgroundColor: ['#1a1917', '#444441', '#6b6860', '#a8a59f', '#d1cec7'],
                  borderRadius: 5,
                  borderSkipped: false,
                },
              ],
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (context) => ` ${context.raw} posts` } },
              },
              scales: {
                x: {
                  ticks: { color: axisLabelColor, font: { size: 11 } },
                  grid: { color: gridColor, lineWidth: 0.5 },
                  border: { display: false },
                },
                y: {
                  ticks: { color: axisLabelColor, font: { size: 11 } },
                  grid: { display: false },
                  border: { display: false },
                },
              },
            },
          })
        )
      }

      if (sentimentCanvasRef.current) {
        charts.push(
          new Chart(sentimentCanvasRef.current, {
            type: 'doughnut',
            data: {
              labels: ['Pain / frustration', 'Wants a solution', 'Building one'],
              datasets: [
                {
                  data: [problemShare, solutionShare, buildShare],
                  backgroundColor: ['#f87171', '#34d399', '#60a5fa'],
                  borderWidth: 0,
                  hoverOffset: 4,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '68%',
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (context) => ` ${context.raw}% of posts` } },
              },
            },
          })
        )
      }
    }

    buildCharts()

    return () => {
      destroyed = true
      charts.forEach((chart) => chart.destroy())
    }
  }, [reportA, section])

  const validationMetrics = reportA?.validationScore ?? {
    searchDemand: 10,
    communityDensity: 9,
    competitionIntensity: 8,
    overall: 9,
  }

  return (
    <main className="min-h-screen bg-[#f7f6f3] text-[#1a1917]">
      <div className="min-h-screen w-full">
        <ReportSidebar
          section={section}
          setSection={setSection}
          ideaText={quiz.q2 || 'Marketplace to discover nail artists nearby'}
        />

        <section className="w-full px-4 py-6 sm:px-5 md:px-6 md:py-8 lg:ml-55 lg:px-8">
          <div className="mx-50 max-w-190">
            <ReportMobileNav section={section} setSection={setSection} />
            <ReportHeader section={section} />

            {loadingReports && !reportA && <ReportLoading />}

            {loadingRouteA && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[#e4e0d8] bg-white px-3 py-2 text-[12px] text-[#6b6860]">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#1a1917]" />
                Generating Report A...
              </div>
            )}

            {!activeArchetype && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[#e4e0d8] bg-white px-3 py-2 text-[12px] text-[#6b6860]">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#1a1917]" />
                Waiting for archetype classification...
              </div>
            )}

            {section === 'validate' && (
              <ValidateSection
                reportA={reportA}
                validationMetrics={validationMetrics}
                filteredPosts={filteredPosts}
                platform={platform}
                setPlatform={setPlatform}
                gateUnlocked={gateUnlocked}
                gateEmail={gateEmail}
                setGateEmail={(value) => {
                  setGateEmail(value)
                  if (gateError) setGateError('')
                }}
                gateError={gateError}
                gateLoading={gateLoading}
                submitEmailGate={submitEmailGate}
                onContinueScope={() => setSection('scope')}
                keywordCanvasRef={(node) => { keywordCanvasRef.current = node }}
                platformCanvasRef={(node) => { platformCanvasRef.current = node }}
                sentimentCanvasRef={(node) => { sentimentCanvasRef.current = node }}
                capturedEmail={email}
                downloadEmail={downloadEmail}
                setDownloadEmail={(value) => { setDownloadEmail(value); if (downloadError) setDownloadError('') }}
                downloadLoading={downloadLoading}
                downloadSuccess={downloadSuccess}
                downloadError={downloadError}
                onDownloadReport={handleDownloadReport}
              />
            )}

            {section === 'scope' && (
              <>
                {loadingRouteB && !reportB && (
                  <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[#e4e0d8] bg-white px-3 py-2 text-[12px] text-[#6b6860]">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#1a1917]" />
                    Generating Report B...
                  </div>
                )}

                <ScopeSection
                  reportB={reportB}
                  gateUnlocked={gateUnlocked}
                  onContinuePlan={() => setSection('plan')}
                  onBackValidate={() => setSection('validate')}
                />
              </>
            )}

            {section === 'plan' && (
              <>
                {loadingRouteC && !reportC && (
                  <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-[#e4e0d8] bg-white px-3 py-2 text-[12px] text-[#6b6860]">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#1a1917]" />
                    Generating Report C...
                  </div>
                )}

                <PlanSection
                  reportB={reportB}
                  reportC={reportC}
                  gateUnlocked={gateUnlocked}
                  capturedEmail={email}
                  downloadEmail={downloadEmail}
                  setDownloadEmail={(value) => { setDownloadEmail(value); if (downloadError) setDownloadError('') }}
                  downloadLoading={downloadLoading}
                  downloadSuccess={downloadSuccess}
                  downloadError={downloadError}
                  onDownloadReport={handleDownloadReport}
                />
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
