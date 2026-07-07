import puppeteer from "puppeteer";
import { readFileSync } from "fs";
import path from "path";
import type { ReportA, ReportB, ReportC, FeaturePriorityGroup } from "@/types";

const LOGO_PATH = path.join(process.cwd(), "public", "logo-white.svg");
const LOGO_DATA_URI = `data:image/svg+xml;base64,${readFileSync(LOGO_PATH).toString("base64")}`;

const HEADER_FOOTER_BAR_HEIGHT = "24px";

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function scoreTier(score: number): {
  bg: string;
  border: string;
  text: string;
} {
  if (score >= 8) return { bg: "#eaf3ec", border: "#b5d6bf", text: "#1e5c38" };
  if (score >= 5) return { bg: "#fffbeb", border: "#fde68a", text: "#78350f" };
  return { bg: "#fff7f7", border: "#fecaca", text: "#7f1d1d" };
}

const FEATURE_GROUP_META: Record<
  FeaturePriorityGroup,
  { label: string; bg: string; border: string; text: string }
> = {
  build_now: {
    label: "Build Now",
    bg: "#eaf3ec",
    border: "#b5d6bf",
    text: "#1e5c38",
  },
  simplify: {
    label: "Simplify",
    bg: "#fffbeb",
    border: "#fde68a",
    text: "#78350f",
  },
  defer: {
    label: "Defer to V2",
    bg: "#eaf1ff",
    border: "#bfdbfe",
    text: "#1e3a5f",
  },
  skip: { label: "Skip", bg: "#fff7f7", border: "#fecaca", text: "#7f1d1d" },
};

function buildHtml(
  reportA: ReportA,
  reportB: ReportB,
  reportC: ReportC,
  ideaTitle: string,
): string {
  const score = reportA.validationScore.overall;
  const scoreColor = scoreTier(score);

  const featureGroups: FeaturePriorityGroup[] = [
    "build_now",
    "simplify",
    "defer",
    "skip",
  ];
  const grouped = featureGroups.map((g) => ({
    meta: FEATURE_GROUP_META[g],
    items: reportB.featurePriority.filter((f) => f.group === g),
  }));

  const kpis = reportC.whatToBuildPlan?.supportingKpis ?? [];
  const buildOrHire = reportC.whatToBuildPlan?.buildOrHire;

  return `
  <html><head><style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f7f6f3;
      color: #1a1917;
      margin: 0;
    }

    * { box-sizing: border-box; }
    .page { padding: 0 0 48px; }
    .content { padding: 0 50px; }

    .header-band { background: #1a1917; padding: 20px 50px; display: flex; align-items: center; margin-bottom: 32px; }
    .header-logo { height: 22px; width: auto; object-fit: contain; }

    h1 { font-size: 24px; color: #1a1917; margin: 0 0 4px; letter-spacing: -0.01em; }
    .subtitle { font-size: 13px; color: #6b6860; margin: 0 0 32px; }

    h2 { font-size: 11px; color: #9e9b93; margin-top: 32px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e4e0d8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
    h3 { font-size: 13px; color: #1a1917; margin: 16px 0 6px; font-weight: 600; }
    p, li { font-size: 12px; line-height: 1.65; color: #5a574f; }

    .row { display: flex; gap: 14px; margin: 8px 0; background: #ffffff; border: 1px solid #e4e0d8; border-radius: 8px; padding: 14px 18px; break-inside: avoid; page-break-inside: avoid; }
    .label { color: #9e9b93; width: 150px; flex-shrink: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; padding-top: 1px; }
    .value { font-size: 12px; color: #1a1917; line-height: 1.65; }
    .why { font-size: 11px; color: #6b6860; margin-top: 4px; font-style: italic; }

    .pill { display: block; background: #fffbeb; border: 1px solid #fde68a; color: #78350f; padding: 10px 14px; border-radius: 8px; margin: 6px 0; font-size: 12px; }

    .score-badge { display: inline-block; border: 1px solid; padding: 6px 16px; border-radius: 6px; font-size: 16px; font-weight: 700; }
    .score-breakdown { display: flex; gap: 8px; margin: 8px 0 0; flex-wrap: wrap; }
    .score-chip { display: flex; flex-direction: column; gap: 2px; border: 1px solid; border-radius: 6px; padding: 6px 12px; font-size: 10px; }
    .score-chip span { text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.75; }
    .score-chip b { font-size: 13px; }

    .week-card { background: #ffffff; border: 1px solid #e4e0d8; border-radius: 8px; padding: 14px 18px; margin: 8px 0; break-inside: avoid; page-break-inside: avoid; }
    .week-tag { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #1a1917; color: #fff; font-size: 10px; font-weight: 700; margin-right: 8px; }

    ul { margin: 4px 0 0; padding-left: 18px; }
    li { margin-bottom: 3px; }

    .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 8px 0; break-inside: avoid; page-break-inside: avoid; }
    .feature-card { border: 1px solid; border-radius: 8px; padding: 12px 14px; break-inside: avoid; page-break-inside: avoid; }
    .feature-card-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
    .feature-item { font-size: 11px; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(0,0,0,0.06); }
    .feature-item:last-child { border-bottom: none; margin-bottom: 0; }
    .feature-item-name { font-weight: 600; }
    .feature-item-why { color: #6b6860; font-size: 10px; }

    .kpi-card { background: #ffffff; border: 1px solid #e4e0d8; border-radius: 8px; padding: 14px 18px; margin: 8px 0; break-inside: avoid; page-break-inside: avoid; }
    .kpi-metric { font-size: 13px; font-weight: 700; color: #1a1917; }
    .kpi-threshold { display: inline-block; margin-top: 6px; background: #f0ede6; border-radius: 5px; padding: 4px 10px; font-size: 11px; color: #5a574f; }

    .decision-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 8px 0; align-items: start; break-inside: avoid; page-break-inside: avoid; }
    .decision-card { background: #ffffff; border: 1px solid #e4e0d8; border-radius: 10px; padding: 20px; break-inside: avoid; page-break-inside: avoid; }
    .cta-box { background: #1a1917; border-radius: 10px; padding: 24px; margin: 0; color: #fff; break-inside: avoid; page-break-inside: avoid; }
    .cta-box h3 { color: #fff; margin-top: 0; }
    .cta-proof { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
    .cta-proof span { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 5px; padding: 5px 10px; font-size: 11px; color: #fff; }
    .cta-link { display: inline-block; margin-top: 8px; background: #fff; color: #1a1917; font-weight: 700; font-size: 13px; padding: 10px 20px; border-radius: 6px; text-decoration: none; }

    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e4e0d8; font-size: 10px; color: #9e9b93; }

    .closing-page { page-break-before: always; background: #1a1917; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 60px; color: #fff; }
    .closing-page img { height: 26px; margin-bottom: 40px; }
    .closing-page h2 { color: #fff; border: none; font-size: 22px; text-transform: none; letter-spacing: normal; font-weight: 600; margin-bottom: 12px; }
    .closing-page p { color: rgba(255,255,255,0.6); font-size: 13px; max-width: 420px; margin-bottom: 28px; }
  </style></head>
  <body>
    <div class="page">
      <div class="content">
        <h1>${titleCase(ideaTitle)}</h1>
        <p class="subtitle">Full validation report — demand, scope, and build plan.</p>

        <h2>Is There Demand?</h2>
        <div class="row"><div class="label">Validation Score</div><div class="value"><span class="score-badge" style="background:${scoreColor.bg};border-color:${scoreColor.border};color:${scoreColor.text}">${score}/10</span></div></div>
        <div class="score-breakdown">
          ${[
            { label: "Demand", v: reportA.validationScore.searchDemand },
            { label: "Community", v: reportA.validationScore.communityDensity },
            {
              label: "Competition",
              v: reportA.validationScore.competitionIntensity,
            },
            { label: "Timing", v: reportA.validationScore.timing },
          ]
            .map((s) => {
              const c = scoreTier(s.v);
              return `<div class="score-chip" style="background:${c.bg};border-color:${c.border};color:${c.text}"><span>${s.label}</span><b>${s.v}/10</b></div>`;
            })
            .join("")}
        </div>
        <div class="row"><div class="label">Keyword Note</div><div class="value">${reportA.keywordNote}</div></div>
        <h3>Communities</h3>
        ${reportA.communities.map((c) => `<div class="row"><div class="label">${c.platform}</div><div class="value"><b>${c.name}</b> — ${c.description}<div class="why">Why this matters: ${c.whyItMatters}</div></div></div>`).join("")}
        <h3>Competitors</h3>
        ${reportA.competitors.map((c) => `<div class="row"><div class="label">${c.name}</div><div class="value">${c.whatTheyDo}<br/><span style="color:#9e9b93">Gap:</span> ${c.gap}<div class="why">Why this matters: ${c.whyItMatters}</div></div></div>`).join("")}

        <h2>What to Build?</h2>
        <div class="row"><div class="label">Core Loop</div><div class="value">${reportB.coreLoop}</div></div>
        <h3>Feature Priority Matrix</h3>
        <div class="feature-grid">
          ${grouped
            .map(
              (g) => `
            <div class="feature-card" style="background:${g.meta.bg};border-color:${g.meta.border}">
              <div class="feature-card-title" style="color:${g.meta.text}">${g.meta.label}</div>
              ${g.items
                .map(
                  (f) => `
                <div class="feature-item">
                  <div class="feature-item-name" style="color:${g.meta.text}">${f.name}</div>
                  <div class="feature-item-why">${f.why}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          `,
            )
            .join("")}
        </div>
        <h3>Tech Approach</h3>
        <p>${reportB.techApproach}</p>
        <h3>Common Mistakes</h3>
        ${reportB.commonMistakes.map((m) => `<div class="pill">${m}</div>`).join("")}

        <h2>How to Start: 28-Day Roadmap</h2>
        ${reportC.roadmap
          .map(
            (w) => `
          <div class="week-card">
            <h3 style="margin-top:0"><span class="week-tag">W${w.week}</span>${w.title}</h3>
            <ul>${w.deliverables.map((d) => `<li>${d}</li>`).join("")}</ul>
          </div>
        `,
          )
          .join("")}

        ${
          reportC.whatToBuildPlan
            ? `
          <h2>North Star Metric</h2>
          <div class="row"><div class="label">${reportC.whatToBuildPlan.northStarMetric.metric}</div><div class="value">${reportC.whatToBuildPlan.northStarMetric.explanation}<br/><b>${reportC.whatToBuildPlan.northStarMetric.target}</b></div></div>

          <h3>Supporting KPIs</h3>
          ${kpis
            .map(
              (k) => `
            <div class="kpi-card">
              <div class="kpi-metric">${k.metric}</div>
              <div class="value">${k.explanation}</div>
              <div class="kpi-threshold">${k.threshold}</div>
            </div>
          `,
            )
            .join("")}
        `
            : ""
        }

        ${
          buildOrHire
            ? `
          <h2>Build or Hire?</h2>
          <div class="decision-grid">
            <div class="decision-card">
              <h3>${buildOrHire.selfBuild.title}</h3>
              <p>${buildOrHire.selfBuild.body}</p>
            </div>
            <div class="cta-box">
              <h3>${buildOrHire.hire.title}</h3>
              <p style="color:rgba(255,255,255,0.7)">${buildOrHire.hire.body}</p>
              <div class="cta-proof">
                ${buildOrHire.hire.proofPoints.map((p) => `<span>${p}</span>`).join("")}
              </div>
              <a class="cta-link" href="${buildOrHire.ctaUrl}">${buildOrHire.ctaText} →</a>
            </div>
          </div>
        `
            : ""
        }
      </div>
    </div>

    <div class="closing-page">
      <img src="${LOGO_DATA_URI}" alt="Crework Labs" />
      <h2>${reportC.closingHeadline}</h2>
      <p>Crework Labs turns validated ideas into shipped products in 4 weeks. UX-first, full code ownership, no lock-in.</p>
      <a class="cta-link" href="${buildOrHire?.ctaUrl ?? "https://calendly.com/creworklabs/30mins"}">${buildOrHire?.ctaText ?? "Book a free 30-min scoping call"} →</a>
    </div>
  </body></html>`;
}

function buildHeaderTemplate(): string {
  return `
    <style>
      html, body { margin: 0; padding: 0; }
      * { box-sizing: border-box; }
    </style>
    <div style="
      width: 100%;
      height: 24px;
      margin: 0;
      margin-top:-24px;
      padding: 0 50px;
      background: #1a1917;
      display: flex;
      align-items: center;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    ">
      <img src="${LOGO_DATA_URI}" style="height: 14px; display: block;" />
    </div>
  `;
}

function buildFooterTemplate(): string {
  return `
    <style>
      html, body { margin: 0; padding: 0; }
      * { box-sizing: border-box; }
    </style>
    <div style="
      width: 100%;
      height: 24px;
      margin: 0;
      margin-bottom:-25px;
      padding: 0 50px;
      background: #1a1917;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #9e9b93;
      font-size: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    ">
      <span>crework-founderos.vercel.app</span>
      <span class="pageNumber"></span>
    </div>
  `;
}

export async function generateReportPdf(args: {
  reportA: ReportA;
  reportB: ReportB;
  reportC: ReportC;
  ideaTitle: string;
}): Promise<Buffer> {
  const html = buildHtml(
    args.reportA,
    args.reportB,
    args.reportC,
    args.ideaTitle,
  );

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: buildHeaderTemplate(),
    footerTemplate: buildFooterTemplate(),
    // Margins must equal the header/footer bar height exactly — Chromium
    // renders the templates inside this exact margin box, so any mismatch
    // shows up as either clipped content or blank whitespace.
    margin: {
      top: HEADER_FOOTER_BAR_HEIGHT,
      bottom: HEADER_FOOTER_BAR_HEIGHT,
      left: "0px",
      right: "0px",
    },
  });

  await browser.close();

  return Buffer.from(pdf);
}
