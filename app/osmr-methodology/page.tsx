'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type OALRung = {
  id: string
  badge: string
  name: string
  desc: string
  count: string
  color: string
  textColor: string
  borderColor: string
  axis1: string
  axis2: string
  detail: string
}

type AxisTab = 'axis1' | 'axis2' | 'axis3'

type CohortCell = {
  med: string
  mean: string
  hr: string
  n: number
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const OAL_RUNGS: OALRung[] = [
  {
    id: 'fcf',
    badge: 'FCF',
    name: 'OAL 1 — Free Cash Flow',
    desc: 'Positive TTM FCF · Deepest credible anchor',
    count: '2,872 cos.',
    color: '#E8F5EE',
    textColor: '#1B6B3A',
    borderColor: '#C9D8CD',
    axis1: '',
    axis2: '',
    detail:
      'The deepest anchor. A company generating positive free cash flow has demonstrated the ability to produce actual cash after all operating and capital expenditures, taxes, and working capital changes. Valuation relative to FCF carries no shallowness penalty — it is the baseline against which all other rungs are measured.',
  },
  {
    id: 'ni',
    badge: 'NI',
    name: 'OAL 2 — Net Income',
    desc: 'Positive TTM Net Income · Profitable but not FCF-positive',
    count: '641 cos.',
    color: '#EEF3FA',
    textColor: '#1A4A8A',
    borderColor: '#C5D5E8',
    axis1: '',
    axis2: '',
    detail:
      'Profitable on an accounting basis but not yet demonstrating positive free cash flow. The gap between accounting profit and cash generation is itself a structural signal. A company assigned here has cleared the hurdle of profitability but has not yet proven it can convert that profit into cash.',
  },
  {
    id: 'ebit',
    badge: 'EBIT',
    name: 'OAL 3 — EBIT',
    desc: 'Positive TTM EBIT · Covers operations before interest & tax',
    count: '109 cos.',
    color: '#FBF3E8',
    textColor: '#7A4A0A',
    borderColor: '#E8D9C5',
    axis1: '',
    axis2: '',
    detail:
      'Covers operating expenses but is not profitable on a net income basis — interest expense and/or taxes consume operating profit. The financing layer becomes structurally significant at this rung.',
  },
  {
    id: 'rev',
    badge: 'Rev',
    name: 'OAL 4 — Revenue',
    desc: 'Positive TTM Revenue · Cannot cover operating costs',
    count: '1,168 cos.',
    color: '#FAF0EE',
    textColor: '#8A2A1A',
    borderColor: '#E8CFC9',
    axis1: '',
    axis2: '',
    detail:
      'Generates sales but cannot cover operating costs. Valuation depends entirely on the narrative of future profitability. After penalty adjustment, a revenue-anchor company is treated as approximately 13.5× more expensive relative to its anchor than an FCF-anchor company at the same raw multiple.',
  },
  {
    id: 'none',
    badge: '—',
    name: 'OAL 0 — Non-Viable',
    desc: 'Zero or negative revenue · No credible anchor exists',
    count: '372 cos.',
    color: '#F0F0F0',
    textColor: '#777777',
    borderColor: '#DDDDDD',
    axis1: '',
    axis2: '',
    detail:
      'No operational anchor of any kind. Any positive enterprise value assigned to these companies is pure narrative pricing. Excluded from OSMR ranking in most contexts.',
  },
]

const UNIVERSE_BARS = [
  { label: 'FCF (OAL 1)', count: 2872, total: 4790, color: '#6DAE8B' },
  { label: 'Net Income (OAL 2)', count: 641, total: 4790, color: '#7BA7CC' },
  { label: 'EBIT (OAL 3)', count: 109, total: 4790, color: '#C4A96B' },
  { label: 'Revenue (OAL 4)', count: 1168, total: 4790, color: '#E8A87C' },
  { label: 'Unanchored', count: 372, total: 4790, color: '#B0A8A0' },
]

const AXIS_LABELS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High']

const COHORT_DATA: CohortCell[][] = [
  [
    { med: '+8.2%', mean: '+9.1%', hr: '58%', n: 1842 },
    { med: '+7.4%', mean: '+8.3%', hr: '56%', n: 1654 },
    { med: '+6.8%', mean: '+9.2%', hr: '55%', n: 1421 },
    { med: '+5.9%', mean: '+14.1%', hr: '54%', n: 980 },
    { med: '+4.2%', mean: '+22.8%', hr: '52%', n: 612 },
  ],
  [
    { med: '+9.1%', mean: '+10.2%', hr: '59%', n: 1543 },
    { med: '+8.4%', mean: '+11.1%', hr: '57%', n: 1388 },
    { med: '+7.9%', mean: '+12.4%', hr: '56%', n: 1102 },
    { med: '+7.1%', mean: '+18.2%', hr: '55%', n: 821 },
    { med: '+5.8%', mean: '+31.4%', hr: '53%', n: 544 },
  ],
  [
    { med: '+10.2%', mean: '+11.8%', hr: '60%', n: 1244 },
    { med: '+9.6%', mean: '+13.2%', hr: '58%', n: 1088 },
    { med: '+9.1%', mean: '+16.8%', hr: '57%', n: 922 },
    { med: '+8.8%', mean: '+24.1%', hr: '56%', n: 701 },
    { med: '+7.2%', mean: '+38.8%', hr: '55%', n: 488 },
  ],
  [
    { med: '+11.4%', mean: '+13.2%', hr: '61%', n: 988 },
    { med: '+10.8%', mean: '+16.4%', hr: '60%', n: 844 },
    { med: '+10.4%', mean: '+21.2%', hr: '59%', n: 722 },
    { med: '+9.8%', mean: '+33.4%', hr: '58%', n: 566 },
    { med: '+8.9%', mean: '+52.1%', hr: '57%', n: 388 },
  ],
  [
    { med: '+12.8%', mean: '+18.4%', hr: '62%', n: 744 },
    { med: '+12.1%', mean: '+28.8%', hr: '62%', n: 622 },
    { med: '+11.8%', mean: '+41.2%', hr: '61%', n: 511 },
    { med: '+11.4%', mean: '+62.4%', hr: '61%', n: 388 },
    { med: '+12.1%', mean: '+92.7%', hr: '61%', n: 2059 },
  ],
]

const FINDINGS_TABLE = [
  { metric: 'Mean 12-month return', value: '+92.7%', interpretation: 'Dominated by a small number of large winners' },
  { metric: 'Median 12-month return', value: '+12.1%', interpretation: 'Typical outcome for the majority of observations' },
  { metric: 'Mean − Median gap', value: '+80.6 pp', interpretation: 'Extreme positive skew; fat-tailed distribution' },
  { metric: 'Hit rate', value: '61.4%', interpretation: 'Most observations had positive 12-month returns' },
  { metric: 'Observations (N)', value: '2,059', interpretation: 'Statistically robust sample' },
]

const DESIGN_CHOICES = [
  {
    title: 'Empirical over mathematical sophistication',
    body: 'Where simpler measures outperform complex ones against historical data, the simpler measure is used. This applies most directly to Axis 2, where YoY consistency outperformed tanh transformation and R-squared trend fitting. Mathematical complexity is not a virtue in itself — it becomes a vice when it disconnects the measure from the economic phenomenon it is trying to capture.',
  },
  {
    title: 'Median over mean as the default summary statistic',
    body: 'Median is more resistant to outlier distortion and reports the central tendency honestly. Mean is shown as supplementary information with skew indicators when the gap is material. This prioritizes honest uncertainty over persuasive framing.',
  },
  {
    title: 'Global ranking for cross-sectional comparability',
    body: 'Both Axis 1 and Axis 2 are expressed as global percentile ranks across the full universe after anchor penalties are applied. This makes scores comparable across companies anchored on different OAL rungs — essential for a framework designed to evaluate structural risk at the universe level.',
  },
  {
    title: 'Conservative anchor assignment',
    body: 'A company must demonstrate positive TTM performance at each rung to qualify for it. Adjusted metrics, normalized earnings, and forward projections are not considered. The framework assigns credit only for what has been demonstrated in the trailing period, using reported financials.',
  },
  {
    title: 'Double weight on recent trajectory',
    body: 'The four most recent year-over-year comparisons in Axis 2 receive double weight. What a company is doing now is more relevant to current structural risk than what it was doing six years ago. This is an empirical judgment — disclosed explicitly so readers can evaluate it.',
  },
]

const LIMITATIONS = [
  {
    title: 'OSMR measures structure, not timing',
    body: 'The framework cannot identify when a stretched valuation will correct, or when a deteriorating anchor will become visible to the market. A company can remain in Very High structural risk territory for extended periods if the narrative sustaining it remains intact.',
  },
  {
    title: 'The framework reflects a single point in time',
    body: 'Each snapshot is a static assessment based on trailing twelve-month figures and available price data. A company can move across OAL rungs and risk quintiles within a single quarter if its operational or market circumstances change materially.',
  },
  {
    title: 'Cohort validation is primarily OAL 1-anchored in its current form',
    body: 'The full cohort grid was built on FCF-anchored companies (OAL 1), which represent the largest and most historically stable cohort. Extension to OAL 2–4 companies is in progress. Until that work is complete, the empirical validation should be understood as most robust for the FCF-anchored universe.',
  },
  {
    title: 'Shallowness penalties are calibrated by judgment, not optimization',
    body: 'The specific penalty values were derived from first-principles reasoning about the structural distance between OAL rungs, not from optimization against historical returns. The calibration will be revisited as more historical data accumulates.',
  },
  {
    title: 'OSMR does not incorporate sector context',
    body: 'A biotech company pre-revenue and a consumer staples company pre-profitability occupy very different structural contexts, even if they share an OAL 4 assignment. The framework treats them comparably because its mandate is cross-sectional structural risk assessment. Sector context can and should be applied as a layer of interpretation, but it is not embedded in the scores.',
  },
]

const APPENDIX_ROWS = [
  { key: 'Universe', val: '~4,790 U.S. equity securities (latest universe snapshot). Data source: Financial Modeling Prep (FMP) API. Updated monthly (full pipeline) and weekly (snapshot refresh).' },
  { key: 'OAL Assignment', val: 'Each company evaluated FCF → NI → EBIT → Revenue in sequence; assigned to highest qualifying rung based on positive TTM figure. Negative EV companies excluded.' },
  { key: 'Axis 1 Formula', val: 'Log-transformed EV-to-anchor ratio, adjusted by an OAL shallowness penalty and ranked globally across the universe. Full penalty calibration reflected in platform scores.' },
  { key: 'Axis 2 Formula', val: 'Anchor consistency score derived from year-over-year comparisons across multiple years of quarterly history, adjusted by an OAL shallowness penalty and ranked globally. Recent trajectory receives double weight.' },
  { key: 'Axis 3', val: 'Three-tier financing risk assessment based on interest obligation coverage relative to operational output. No OAL shallowness penalty applied.' },
  { key: 'Composite Score', val: 'Mean of all available axis scores. Displayed as a percentile rank across the full universe.' },
  { key: 'Cohort Grid', val: '270,618 historical observations. 12-month forward horizon. 3 panels × 5 Axis 1 × 5 Axis 2 = 75 cells per panel. Rebuilt monthly; values reflect latest completed cycle. Default metric: median return.' },
]

// ─── Subcomponents ────────────────────────────────────────────────────────────

// MOVE 5: SectionLabel — larger, heavier, stronger signal
function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[12px] tracking-[0.18em] uppercase font-semibold mb-4" style={{ color: '#6DAE8B' }}>
      {children}
    </p>
  )
}

// MOVE 5: Dark blue restricted to Thesis only (not Callout)
function Thesis({ children, cite }: { children: string; cite?: string }) {
  return (
    <div
      className="relative rounded-xl px-8 py-7 my-10 overflow-hidden"
      style={{ background: '#0A1F3D' }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ background: '#6DAE8B' }}
      />
      <p className="text-[16px] leading-[1.9] italic" style={{ color: 'rgba(255,255,255,0.85)' }}>
        {children}
      </p>
      {cite && (
        <p className="text-[11px] mt-3 tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {cite}
        </p>
      )}
    </div>
  )
}

// MOVE 5: Callout stays light — NOT dark blue
function Callout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl px-6 py-5 my-8 border border-[#D0D4CF] bg-[#F4F5F3]">
      <p className="text-[10px] tracking-[1.5px] uppercase mb-2 font-semibold" style={{ color: '#6A7280' }}>
        {label}
      </p>
      <div className="text-[14px] leading-[1.8] text-[#4F5968]">{children}</div>
    </div>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-8">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left font-semibold text-[11px] tracking-[0.1em] uppercase text-white"
                style={{ background: '#0A1F3D' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#D0D4CF] hover:bg-[#F4F5F3] transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-[#4F5968] align-top leading-[1.7]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// MOVE 5: FindingCard stays dark — it's a key result, earns it
function FindingCard({ label, children }: { label: string; children: string }) {
  return (
    <div className="rounded-xl px-8 py-7 my-8" style={{ background: '#0A1F3D' }}>
      <p className="text-[10px] tracking-[1.5px] uppercase mb-3 font-semibold" style={{ color: '#6DAE8B' }}>
        {label}
      </p>
      <p className="text-[15px] leading-[1.85] italic" style={{ color: 'rgba(255,255,255,0.8)' }}>
        {children}
      </p>
    </div>
  )
}

// ─── OAL Ladder ───────────────────────────────────────────────────────────────

function OALLadder() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="my-10 flex flex-col gap-2">
      {OAL_RUNGS.map((r) => (
        <div key={r.id}>
          <button
            onClick={() => setOpen(open === r.id ? null : r.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border text-left transition-all ${
              open === r.id
                ? 'border-[#0A1F3D] bg-[#F4F5F3] rounded-b-none'
                : 'border-[#D0D4CF] bg-white hover:border-[#B0B8B4]'
            } ${r.id === 'none' ? 'opacity-60' : ''}`}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[12px] font-semibold shrink-0"
              style={{ background: r.color, color: r.textColor }}
            >
              {r.badge}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#0A1F3D]">{r.name}</p>
              <p className="text-[11px] text-[#6A7280] mt-0.5">{r.desc}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-[12px] text-[#8A92A0]">{r.count}</span>
            </div>
          </button>
          {open === r.id && (
            <div className="px-4 py-4 text-[13px] leading-[1.8] text-[#4F5968] bg-[#F4F5F3] border border-t-0 border-[#0A1F3D] rounded-b-xl">
              {r.detail}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Universe Bars ────────────────────────────────────────────────────────────

function UniverseBars() {
  return (
    <div className="my-8 flex flex-col gap-2.5">
      {UNIVERSE_BARS.map((d) => {
        const pct = Math.round((d.count / d.total) * 100)
        return (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-[11px] text-[#6A7280] w-28 text-right shrink-0">{d.label}</span>
            <div className="flex-1 h-7 bg-[#EAECE8] rounded-md overflow-hidden">
              <div
                className="h-full rounded-md flex items-center pl-3 text-[11px] font-semibold text-white transition-all duration-1000"
                style={{ width: `${pct}%`, background: d.color }}
              >
                {pct > 8 ? `${pct}%` : ''}
              </div>
            </div>
            <span className="text-[11px] text-[#8A92A0] w-11 text-right shrink-0">
              {d.count.toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Axis Tabs ────────────────────────────────────────────────────────────────

function AxisTabs() {
  const [active, setActive] = useState<AxisTab>('axis1')

  const CHIPS = [
    { color: '#E8F5EE', text: '#1B6B3A', border: '#C9D8CD', label: 'FCF' },
    { color: '#EEF3FA', text: '#1A4A8A', border: '#C5D5E8', label: 'NI' },
    { color: '#FBF3E8', text: '#7A4A0A', border: '#E8D9C5', label: 'EBIT' },
    { color: '#FAF0EE', text: '#8A2A1A', border: '#E8CFC9', label: 'Rev' },
  ]

  const penalties: Record<AxisTab, string[]> = {
    axis1: [],
    axis2: [],
    axis3: [],
  }

  return (
    <div className="my-8">
      {/* MOVE 4: Tabs feel like document navigation, not app chrome */}
      <div className="flex gap-0.5 border-b border-[#D0D4CF]">
        {(['axis1', 'axis2', 'axis3'] as AxisTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-3 text-[13px] border-b-2 -mb-px transition-all ${
              active === tab
                ? 'border-[#0A1F3D] text-[#0A1F3D] font-semibold'
                : 'border-transparent text-[#6A7280] hover:text-[#0A1F3D]'
            }`}
          >
            {tab === 'axis1' ? 'Axis 1 · Anchor Risk' : tab === 'axis2' ? 'Axis 2 · Trajectory Risk' : 'Axis 3 · Financing Risk'}
          </button>
        ))}
      </div>

      {active === 'axis1' && (
        <div className="pt-7">
          <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-4">
            <strong className="text-[#0A1F3D] font-semibold">What it measures.</strong> The distance between a
            company's current Enterprise Value and its deepest credible operational anchor, adjusted for the
            shallowness of that anchor.
          </p>
          {/* MOVE 4: Formula box darkened — "this is the math" */}
          <div className="rounded-lg px-5 py-4 font-mono text-[14px] my-5" style={{ background: '#0A1F3D', color: '#6DAE8B' }}>
            log(EV / anchor) + AXIS1_ANCHOR_PENALTY → global rank
          </div>
          <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-4">
            The logarithm compresses extreme multiples while preserving ordinal relationships and preventing
            outliers from distorting the global ranking.
          </p>
          <p className="text-[15px] leading-[1.85] text-[#4F5968]">
            <strong className="text-[#0A1F3D] font-semibold">Interpretation.</strong> Two companies can have
            identical raw multiples but very different Axis 1 scores if they are anchored on different OAL rungs.
          </p>
        </div>
      )}

      {active === 'axis2' && (
        <div className="pt-7">
          <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-4">
            <strong className="text-[#0A1F3D] font-semibold">What it measures.</strong> Whether the company's
            operational anchor is improving or deteriorating over time, and how consistently.
          </p>
          <div className="rounded-lg px-5 py-4 font-mono text-[14px] my-5" style={{ background: '#0A1F3D', color: '#6DAE8B' }}>
            (1 − consistency_score) + AXIS2_ANCHOR_PENALTY → global rank
          </div>
          <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-4">
            The consistency score is derived from year-over-year comparisons across multiple years of quarterly history.
            The four most recent YoY comparisons receive double weight — recent trajectory matters more than
            distant history.
          </p>
          <p className="text-[15px] leading-[1.85] text-[#4F5968]">
            <strong className="text-[#0A1F3D] font-semibold">Why YoY consistency?</strong> During development,
            this approach was tested against tanh transformation and R-squared trend fitting. YoY consistency
            outperformed both. The preference for empirical performance over mathematical sophistication is a
            deliberate design principle, not a simplification.
          </p>
        </div>
      )}

      {active === 'axis3' && (
        <div className="pt-7">
          <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-4">
            <strong className="text-[#0A1F3D] font-semibold">What it measures.</strong> Whether the company can
            service its financial obligations from its operational anchor. A company that cannot cover its
            interest expense from operating earnings is structurally dependent on external financing — which is
            itself a form of narrative dependence.
          </p>
          <div className="flex flex-col gap-1.5 my-5">
            {[
              { label: 'No interest (0.0)', desc: 'No meaningful interest-bearing obligations. Financing risk is negligible.', bg: '#F4F5F3', border: '#D0D4CF', tc: '#0A1F3D' },
              { label: 'Coverage ranked', desc: 'Inverted coverage ratio rank — lower coverage = higher risk score.', bg: '#F4F5F3', border: '#D0D4CF', tc: '#0A1F3D' },
              { label: 'Junk (1.0)', desc: 'Coverage falls below investment-grade thresholds. Interest consumes most or all of operating earnings.', bg: '#FAF0EE', border: '#E8CFC9', tc: '#8A2A1A' },
            ].map((tier) => (
              <div
                key={tier.label}
                className="flex gap-3 px-4 py-3 rounded-lg border text-[13px]"
                style={{ background: tier.bg, borderColor: tier.border }}
              >
                <span className="font-semibold w-32 shrink-0" style={{ color: tier.tc }}>{tier.label}</span>
                <span className="text-[#4F5968]">{tier.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-[15px] leading-[1.85] text-[#4F5968]">
            Axis 3 carries no OAL shallowness penalty — the coverage ratio already incorporates the operational
            reality of the anchor level.{' '}
            <strong className="text-[#0A1F3D] font-semibold">High Axis 3 risk adds a temporal dimension:</strong>{' '}
            the company may not have the financial runway to allow the narrative to play out.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Cohort Grid ──────────────────────────────────────────────────────────────

function CohortGrid() {
  const [selected, setSelected] = useState<{ ri: number; ci: number } | null>(null)

  function getCellBg(ri: number, ci: number) {
    if (ri === 4 && ci === 4) return '#0A1F3D'
    const intensity = (ri + ci) / 8
    const r = Math.round(240 + intensity * 15)
    const g = Math.round(240 - intensity * 80)
    const b = Math.round(240 - intensity * 80)
    return `rgb(${r},${g},${b})`
  }

  function getCellTextColor(ri: number, ci: number) {
    if (ri === 4 && ci === 4) return '#ffffff'
    const intensity = (ri + ci) / 8
    return intensity > 0.5 ? '#ffffff' : '#111111'
  }

  const sel = selected ? COHORT_DATA[selected.ri][selected.ci] : null
  const isHighRisk = selected?.ri === 4 && selected?.ci === 4

  return (
    // MOVE 3: grid gets more vertical breathing room
    <div className="my-10">
      <div className="overflow-x-auto">
        <div
          className="grid gap-1 min-w-[480px]"
          style={{ gridTemplateColumns: '80px repeat(5, 1fr)' }}
        >
          <div />
          {AXIS_LABELS.map((l) => (
            <div key={l} className="text-[9px] text-[#8A92A0] text-center px-1 py-1.5 tracking-wide uppercase">
              {l}
            </div>
          ))}

          {COHORT_DATA.map((row, ri) => (
            <>
              <div key={`label-${ri}`} className="text-[9px] text-[#8A92A0] flex items-center justify-end pr-2 uppercase tracking-wide">
                {AXIS_LABELS[ri]}
              </div>
              {row.map((cell, ci) => {
                const isSelected = selected?.ri === ri && selected?.ci === ci
                const isHighlight = ri === 4 && ci === 4
                return (
                  <button
                    key={`${ri}-${ci}`}
                    onClick={() => setSelected(isSelected ? null : { ri, ci })}
                    className="rounded-md py-2 px-1 text-center transition-all hover:scale-105 border"
                    style={{
                      background: getCellBg(ri, ci),
                      color: getCellTextColor(ri, ci),
                      borderColor: isSelected ? '#6DAE8B' : isHighlight ? '#6DAE8B' : 'transparent',
                      borderWidth: isSelected || isHighlight ? '1.5px' : '0.5px',
                    }}
                  >
                    <div className="text-[12px] font-semibold">{cell.med}</div>
                    <div className="text-[8px] mt-0.5 opacity-65">med</div>
                  </button>
                )
              })}
            </>
          ))}
        </div>
      </div>

      {sel && (
        <div className="mt-4 rounded-xl border border-[#D0D4CF] bg-[#F4F5F3] p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { val: sel.med, key: 'Median return' },
            { val: sel.mean, key: 'Mean return' },
            { val: sel.hr, key: 'Hit rate' },
            { val: sel.n.toLocaleString(), key: 'Observations' },
          ].map((stat) => (
            <div key={stat.key} className="text-center">
              <div className="text-[22px] font-semibold text-[#0A1F3D]">{stat.val}</div>
              <div className="text-[10px] text-[#8A92A0] mt-1 tracking-wide uppercase">{stat.key}</div>
            </div>
          ))}
          {isHighRisk && (
            <div className="col-span-2 sm:col-span-4 pt-3 border-t border-[#D0D4CF] text-[13px] text-[#4F5968] leading-[1.8]">
              <strong className="text-[#0A1F3D] font-semibold">Highest-risk cell.</strong> The +80.6pp mean/median
              gap reveals extreme positive skew. The typical outcome is modest; the fat tail exists in both
              directions. This is a risk characterization, not a return opportunity.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

// MOVE 4: About section removed — breaks document register
function Sidebar() {
  const sections = [
    { id: 'problem', num: 'I', label: 'The Problem with Valuation' },
    { id: 'oal', num: 'II', label: 'The Operational Anchor Ladder' },
    { id: 'axes', num: 'III', label: 'The Three Axes' },
    { id: 'validation', num: 'IV', label: 'Empirical Validation' },
    { id: 'principles', num: 'V', label: 'Design Principles' },
    { id: 'conclusion', num: 'VI', label: 'Conclusion' },
    { id: 'appendix', num: '—', label: 'Appendix' },
  ]

  const scroll = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <aside className="sticky top-6 flex flex-col gap-4">
      {/* KPIs */}
      <div className="rounded-xl border border-[#D0D4CF] bg-[#F4F5F3] p-5">
        <p className="text-[10px] tracking-[1.5px] uppercase text-[#8A92A0] font-semibold mb-4">Current Snapshot</p>
        <div className="flex flex-col gap-2.5">
          {[
            { label: 'Total companies', val: '4,790', color: '#0A1F3D' },
            { label: 'High structural risk', val: '872', color: '#8A2A1A' },
            { label: 'Elevated fin. fragility', val: '1,521', color: '#7A4A0A' },
            { label: 'Avg composite', val: '51.0%', color: '#0A1F3D' },
            { label: 'FCF-anchored', val: '2,872', color: '#244636' },
          ].map((kpi) => (
            <div key={kpi.label} className="flex items-baseline justify-between">
              <span className="text-[11px] text-[#6A7280]">{kpi.label}</span>
              <span className="text-[17px] font-semibold tabular-nums" style={{ color: kpi.color }}>
                {kpi.val}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[#8A92A0] mt-3">Values reflect most recent dataset refresh.</p>
      </div>

      {/* TOC — MOVE 4: plain chapter index, no border boxes */}
      <div className="rounded-xl border border-[#D0D4CF] bg-[#F4F5F3] p-5">
        <p className="text-[10px] tracking-[1.5px] uppercase text-[#8A92A0] font-semibold mb-4">Contents</p>
        <div className="flex flex-col">
          {sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => scroll(s.id)}
              className={`flex gap-2.5 text-left text-[12px] text-[#4F5968] py-2.5 hover:text-[#0A1F3D] transition-colors leading-snug ${
                i < sections.length - 1 ? 'border-b border-[#D0D4CF]' : ''
              }`}
            >
              <span className="text-[9px] text-[#B0B8C4] w-3.5 shrink-0 mt-0.5">{s.num}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OSMRMethodologyPage() {
  const scroll = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const NAV_SECTIONS = [
    { id: 'problem', label: 'I. The Problem' },
    { id: 'oal', label: 'II. The OAL' },
    { id: 'axes', label: 'III. The Axes' },
    { id: 'validation', label: 'IV. Validation' },
    { id: 'principles', label: 'V. Design Principles' },
    { id: 'conclusion', label: 'VI. Conclusion' },
    { id: 'appendix', label: 'Appendix' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#F1F3F0' }}>
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* ── Hero — MOVE 1: dominant, cover-page weight ── */}
        <div
          className="relative rounded-2xl px-12 py-20 md:py-24 mb-6 overflow-hidden"
          style={{ background: '#0A1F3D' }}
        >
          <div
            className="absolute -top-16 -right-16 w-80 h-80 rounded-full border pointer-events-none"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          />
          <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            The Capital Steward · Methodology · 2026
          </p>
          {/* MOVE 1: h1 significantly larger */}
          <h1 className="text-[44px] md:text-[52px] font-semibold leading-[1.05] mb-6 max-w-3xl tracking-tight" style={{ color: '#fff' }}>
            How We Measure{' '}
            <span style={{ color: '#6DAE8B' }}>Structural Risk</span>
          </h1>
          {/* MOVE 1: subhead wider, slightly larger */}
          <p className="text-[17px] leading-[1.9] max-w-2xl mb-12" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Most valuation frameworks ask how much a company is worth. This one asks a different question: how
            well-grounded is that valuation in what the company has actually demonstrated? The gap between
            these two questions is where structural investment risk accumulates before it becomes visible.
          </p>
          <div className="flex gap-8 text-[13px] flex-wrap" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span>
              <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Anthony Lee Summers</strong>
              {' · '}Founder, The Capital Steward
            </span>
            <span>
              <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>~4,800</strong> companies (current universe snapshot)
            </span>
            <span>
              <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>270,618+</strong> historical observations (latest build)
            </span>
          </div>
        </div>

        {/* MOVE 1: Hard divider — "you are now entering the document" */}
        <div className="h-px bg-[#D0D4CF] mb-6" />

        {/* Global snapshot qualifier — protects against staleness, signals live system */}
        <p className="text-[12px] text-[#8A92A0] mb-6 px-1">
          All quantitative figures reflect a recent snapshot of the dataset and are provided for illustrative purposes. The underlying dataset updates continuously.
        </p>

        {/* ── Nav — MOVE 4: chapter index, not app chrome ── */}
        <div className="flex flex-wrap gap-x-1 gap-y-1 items-center px-5 py-3 rounded-xl border border-[#D0D4CF] bg-white mb-10">
          <span className="text-[10px] tracking-[1.5px] uppercase text-[#B0B8C4] font-semibold mr-3">Sections</span>
          {NAV_SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scroll(s.id)}
              className="text-[12px] text-[#6A7280] px-3 py-1.5 rounded-md hover:text-[#0A1F3D] hover:bg-[#F4F5F3] transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-12 items-start">
          <main className="min-w-0">

            {/* ── Section I ── */}
            {/* MOVE 2: mb-20 throughout */}
            <section id="problem" className="mb-20">
              <SectionLabel>Section I</SectionLabel>
              <h2 className="text-[26px] font-semibold text-[#0A1F3D] leading-snug mb-5 tracking-tight">
                The Problem with Valuation
              </h2>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-5">
                Every stock price is a statement of belief. When a market assigns a company an enterprise value
                of $10 billion, it is not recording a fact — it is expressing a judgment about what the
                company's future cash generation will justify. That judgment is, at its core, a narrative.
              </p>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-5">
                This is not a criticism. Narrative is inseparable from valuation. No financial statement reports
                the future. Every multiple — price-to-earnings, EV-to-EBITDA, price-to-sales — is a
                present-value claim about future performance, and the specific future invoked is always a story:{' '}
                <em>
                  this company will grow its margins, capture its addressable market, convert its user base into
                  revenue, become cash flow positive within three years.
                </em>{' '}
                The multiple is the price of believing the story.
              </p>
              <p className="text-[15px] leading-[1.85] text-[#4F5968]">
                Standard valuation analysis typically focuses on whether the story is plausible and whether the
                price is fair given the story. What it rarely asks is: what happens to the valuation if the
                story stops being believed? And how far is the story from anything the company has actually
                demonstrated?
              </p>

              <h3 className="text-[18px] font-semibold text-[#0A1F3D] mt-10 mb-4 tracking-tight">The Structural Gap</h3>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-5">
                There is a meaningful difference between a company valued at 40× free cash flow and a company
                valued at 40× revenue. Both trade at the same nominal multiple. But the first company has
                already demonstrated the ability to convert revenue into cash after all obligations — it has{' '}
                <strong className="text-[#0A1F3D] font-semibold">earned</strong> the right to be valued on that
                output. The second company's valuation depends entirely on the market continuing to believe it
                will eventually do something it has not yet done.
              </p>

              <Thesis cite="— Core thesis, The Capital Steward">
                Markets price narratives, not fundamentals. The structural gap between what a company is valued
                at and what it has actually demonstrated — in cash flow, earnings, or revenue — is where
                investment risk accumulates before it becomes visible.
              </Thesis>

              <h3 className="text-[18px] font-semibold text-[#0A1F3D] mt-10 mb-4 tracking-tight">
                Where Existing Frameworks Fall Short
              </h3>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-5">
                Pure fundamental analysis assumes markets will eventually price fundamentals correctly. This is
                not wrong — but it is incomplete. It does not give the investor any way to assess how far a
                given company's valuation already is from reality, or how long the narrative sustaining that gap
                is likely to hold.
              </p>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-6">
                Technical analysis largely inverts the problem: it treats price action as the primary signal and
                asks what the market is doing, not what the company is doing. Price action reflects the
                narrative in motion. It does not measure the structural distance between the narrative and the
                operational reality beneath it.
              </p>

              <Callout label="A Note on Scope">
                OSMR does not claim to identify mispriced securities or predict return outcomes. A company with
                very high structural risk may continue to appreciate for months or years if the narrative
                sustaining its valuation remains intact. The framework measures the{' '}
                <strong>structure of risk</strong>, not its timing — a distinction this paper will return to
                throughout.
              </Callout>
            </section>

            <div className="h-px bg-[#D0D4CF] mb-20" />

            {/* ── Section II ── */}
            <section id="oal" className="mb-20">
              <SectionLabel>Section II</SectionLabel>
              <h2 className="text-[26px] font-semibold text-[#0A1F3D] leading-snug mb-5 tracking-tight">
                The Operational Anchor Ladder
              </h2>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-5">
                The Operational Anchor Ladder (OAL) is the governance construct at the heart of OSMR. It
                answers a single question for every company in the universe:{' '}
                <em>
                  what is the deepest, most credible financial rung this company has actually demonstrated?
                </em>
              </p>
              <p className="text-[15px] leading-[1.85] text-[#4F5968]">
                The word <em>deepest</em> is deliberate. It refers not to the size of the financial figure but
                to its proximity to actual cash generation. Free cash flow is the deepest anchor because it
                represents what a company has genuinely produced, with no accounting adjustments standing
                between the figure and real economic output. Revenue is the shallowest anchor because it tells
                us only that the company sold something, not whether that sale moved it any closer to economic
                viability.
              </p>

              <h3 className="text-[18px] font-semibold text-[#0A1F3D] mt-10 mb-3 tracking-tight">
                The Five Rungs — click to expand
              </h3>
              {/* MOVE 3 applies here too — OAL ladder framing */}
              <p className="text-[14px] text-[#6A7280] mb-2 leading-[1.7]">
                Each company is assigned to the deepest operational anchor it has demonstrated.
                This ladder governs how valuation is interpreted across the entire framework.
              </p>
              <OALLadder />

              <h3 className="text-[18px] font-semibold text-[#0A1F3D] mt-10 mb-4 tracking-tight">Universe Distribution</h3>
              <UniverseBars />

              <h3 className="text-[18px] font-semibold text-[#0A1F3D] mt-10 mb-4 tracking-tight">The Assignment Logic</h3>
              <p className="text-[15px] leading-[1.85] text-[#4F5968]">
                Each company is evaluated against the OAL rungs in descending order — FCF first, then Net
                Income, then EBIT, then Revenue — and assigned to the first rung it qualifies for. This is an
                intentionally conservative design. The framework assigns credit only for what has been
                demonstrated in the trailing period, using reported financials. Adjusted metrics, normalized
                earnings, and forward projections are not considered.
              </p>

              <h3 className="text-[18px] font-semibold text-[#0A1F3D] mt-10 mb-4 tracking-tight">The Shallowness Penalty</h3>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-5">
                The most important conceptual innovation in OSMR is the shallowness penalty: a proportional
                risk adjustment applied across two of the three axes based on the depth of a company's OAL
                assignment. Two companies trading at the same enterprise value multiple are not comparably risky
                if they are anchored on different OAL rungs. A company trading at 20× free cash flow is in a
                fundamentally different structural position than a company trading at 20× revenue.
              </p>

              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-5">
                The penalty increases proportionally as the anchor becomes shallower — from no penalty at FCF,
                through incremental adjustments at Net Income and EBIT, to the highest adjustment at Revenue.
                The effect is significant: after adjustment, a revenue-anchor company is treated as
                approximately 13.5× more expensive relative to its anchor than an FCF-anchor company at the
                same raw multiple. The specific calibration is reflected in platform scores.
              </p>

              <Callout label="Design Principle">
                The shallowness penalty encodes the core thesis: the further a company is from demonstrated
                cash generation, the more its valuation depends on narrative sustaining rather than reality
                compounding.{' '}
                <strong>Penalty is not punishment — it is structural information.</strong>
              </Callout>
            </section>

            <div className="h-px bg-[#D0D4CF] mb-20" />

            {/* ── Section III ── */}
            <section id="axes" className="mb-20">
              <SectionLabel>Section III</SectionLabel>
              <h2 className="text-[26px] font-semibold text-[#0A1F3D] leading-snug mb-5 tracking-tight">
                The Three Axes of Structural Risk
              </h2>
              <p className="text-[15px] leading-[1.85] text-[#4F5968]">
                OSMR's three axes are not measuring different things. They are measuring different dimensions of
                the same structural condition: the relationship between a company's valuation and its
                operational reality. All three axes speak to the same OAL anchor throughout. The Composite
                Structural Risk score is the mean of all available axes. Bucket labels are
                consistent across all axes: Very Low / Low / Moderate / High / Very High — where Very High
                always means more structural risk.
              </p>

              <AxisTabs />

              <h3 className="text-[18px] font-semibold text-[#0A1F3D] mt-10 mb-4 tracking-tight">
                Composite Structural Risk
              </h3>
              <p className="text-[15px] leading-[1.85] text-[#4F5968]">
                The Composite Structural Risk score is the mean of all available axis scores, expressed as a percentile rank across the universe. Current universe
                summary: High Structural Risk (top composite quintile) — 872 companies; Elevated Financing
                Fragility — 1,521 companies; Universe total — ~4,790; Average composite score — 51.0%.
              </p>
            </section>

            <div className="h-px bg-[#D0D4CF] mb-20" />

            {/* ── Section IV ── */}
            <section id="validation" className="mb-20">
              <SectionLabel>Section IV</SectionLabel>
              <h2 className="text-[26px] font-semibold text-[#0A1F3D] leading-snug mb-5 tracking-tight">
                Empirical Validation
              </h2>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-5">
                A scoring framework without empirical grounding is a hypothesis. OSMR has been validated
                against 270,618 historical observations spanning multiple market cycles, testing whether
                structural risk classifications have any measurable relationship with subsequent return
                distributions.
              </p>
              <p className="text-[15px] leading-[1.85] text-[#4F5968]">
                The validation does not attempt to demonstrate predictive precision. It examines whether
                different structural risk profiles produce meaningfully different distributions of subsequent
                outcomes — which is a weaker and more honest claim than prediction.
              </p>

              <h3 className="text-[18px] font-semibold text-[#0A1F3D] mt-10 mb-3 tracking-tight">Cohort Grid Structure</h3>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-3">
                The cohort grid maps 12-month forward returns against OSMR structural risk classifications: 3
                panels (Low / Moderate / High Fragility) × 5 Axis 1 buckets × 5 Axis 2 buckets = 75 cells per
                panel. Each cell displays median return (primary), mean return with skew indicators when
                |mean − median| exceeds 10 percentage points, hit rate, and observation count.
              </p>
              <p className="text-[14px] text-[#6A7280] mb-3 leading-[1.7]">
                The platform extends this analysis across multiple panels, time horizons, and cohort segmentations not shown here.
              </p>

              {/* Cohort grid elevated as result, not widget */}
              <h3 className="text-[18px] font-semibold text-[#0A1F3D] mt-10 mb-2 tracking-tight">
                The Empirical Output of the Framework
              </h3>
              <p className="text-[14px] text-[#6A7280] mb-1 leading-[1.7]">
                What the framework produces when applied across 270,618 historical observations.
                High Fragility panel shown. Click any cell to see full statistics.
              </p>
              <p className="text-[13px] text-[#8A92A0] mb-3">
                Illustrative subset of full cohort analysis available within the platform.
              </p>
              <CohortGrid />

              <h3 className="text-[18px] font-semibold text-[#0A1F3D] mt-10 mb-4 tracking-tight">
                The Mean/Median Gap: The Most Important Finding
              </h3>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-5">
                In the current dataset, the most analytically significant pattern appears at the highest-risk intersection: High
                Fragility / Very High Axis 1 / Very High Axis 2.
              </p>

              <DataTable
                headers={['Metric', 'Value', 'Interpretation']}
                rows={FINDINGS_TABLE.map((r) => [r.metric, r.value, r.interpretation])}
              />

              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-5">
                In the current sample, an 80.6 percentage point gap between mean and median reflects that this cohort's return
                distribution appears heavily fat-tailed: a small number of large winners dominate the mean, while
                the typical outcome is the median figure of +12.1%. A 61.4% hit rate sounds attractive in
                isolation, but it means that four in every ten companies in this cohort had negative 12-month
                returns.
              </p>

              <FindingCard label="Key Finding">
                The 80.6 percentage point mean/median gap in the highest-risk cohort is a characterization of
                structural risk, not an identification of return opportunity. Extreme positive skew reflects the
                lottery-ticket dynamics inherent in narrative-dependent valuation — a few large winners cannot
                be distinguished in advance from the majority of poor outcomes.
              </FindingCard>

              <h3 className="text-[18px] font-semibold text-[#0A1F3D] mt-10 mb-4 tracking-tight">
                Why Median Is the Primary Metric
              </h3>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-5">
                The decision to lead with median rather than mean is not merely statistical — it is
                philosophical. The median reports the outcome for a typical investor who held a typical security
                from this cohort for twelve months. The mean reports what they would have received if they had
                held the entire cohort in equal weight — which requires predicting, in advance, who the
                outliers are.
              </p>
              <p className="text-[15px] leading-[1.85] text-[#4F5968]">
                Using mean as the primary metric in a risk characterization framework would be dishonest. It
                would present the fat-tail outliers as if they were the central tendency, making the
                highest-risk cohort appear most attractive. The framework shows mean with skew indicators when
                the gap is material, so readers can see both the central tendency and the tail.
              </p>
            </section>

            <div className="h-px bg-[#D0D4CF] mb-20" />

            {/* ── Section V ── */}
            <section id="principles" className="mb-20">
              <SectionLabel>Section V</SectionLabel>
              <h2 className="text-[26px] font-semibold text-[#0A1F3D] leading-snug mb-5 tracking-tight">
                Design Principles and Limitations
              </h2>
              <p className="text-[15px] leading-[1.85] text-[#4F5968]">
                Every analytical framework makes design choices. The choices made in OSMR reflect a specific
                set of priorities — and carry specific limitations. Both deserve honest documentation.
              </p>

              {/* MOVE 5: Section intro elevates from documentation to philosophy */}
              <p className="text-[14px] text-[#6A7280] mt-4 leading-[1.75]">
                These are not implementation details. They are the constraints that define what the framework is allowed to claim.
              </p>

              <h3 className="text-[18px] font-semibold text-[#0A1F3D] mt-10 mb-5 tracking-tight">Explicit Design Choices</h3>
              <div className="flex flex-col">
                {DESIGN_CHOICES.map((d, i) => (
                  <div
                    key={d.title}
                    className={`py-5 ${i < DESIGN_CHOICES.length - 1 ? 'border-b border-[#D0D4CF]' : ''}`}
                  >
                    <p className="text-[15px] font-semibold text-[#0A1F3D] mb-2">{d.title}</p>
                    <p className="text-[14px] leading-[1.8] text-[#4F5968]">{d.body}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-[18px] font-semibold text-[#0A1F3D] mt-12 mb-5 tracking-tight">Known Limitations</h3>
              <div className="flex flex-col">
                {LIMITATIONS.map((l, i) => (
                  <div
                    key={l.title}
                    className={`py-5 ${i < LIMITATIONS.length - 1 ? 'border-b border-[#D0D4CF]' : ''}`}
                  >
                    <p className="text-[15px] font-semibold text-[#0A1F3D] mb-2">{l.title}</p>
                    <p className="text-[14px] leading-[1.8] text-[#4F5968]">{l.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="h-px bg-[#D0D4CF] mb-20" />

            {/* ── Section VI ── */}
            {/* MOVE 2: mt-16 before conclusion */}
            <section id="conclusion" className="mb-20">
              <SectionLabel>Section VI</SectionLabel>
              <h2 className="text-[26px] font-semibold text-[#0A1F3D] leading-snug mb-5 tracking-tight">Conclusion</h2>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-5">
                The Capital Steward was built on a simple conviction: that most investors lack not information
                but <em>framework</em> — a disciplined way of asking what a company has actually demonstrated,
                and how far its valuation has strayed from that demonstration. OSMR is the operational
                expression of that conviction.
              </p>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-5">
                The framework does not tell investors what to buy or sell. It tells them where structural risk
                is concentrated, how stable the operational foundations beneath current valuations are, and
                whether the companies in their universe are moving toward or away from demonstrated economic
                viability.
              </p>
              <p className="text-[15px] leading-[1.85] text-[#4F5968] mb-6">
                The framework is a living system. The OAL coverage is being extended. The cohort validation is
                being deepened. The penalty structure will be revisited as more historical data accumulates. The
                platform is updated monthly for structural changes and weekly for snapshot refreshes. None of
                this is finished — but it is real, it is grounded in empirical performance, and it is designed
                to be honest about what it can and cannot tell us.
              </p>

              {/* MOVE 5: final Thesis slightly larger */}
              <Thesis>
                Stewardship is about conformity to reality. The Capital Steward exists because we believe
                investors are better served by honest structural thinking — even when that thinking produces
                ambiguous answers — than by confident narratives that obscure the distance between what a
                company is worth and what it has actually demonstrated.
              </Thesis>
            </section>

            <div className="h-px bg-[#D0D4CF] mb-20" />

            {/* ── Appendix ── */}
            <section id="appendix" className="mb-14">
              <SectionLabel>Appendix</SectionLabel>
              <h2 className="text-[26px] font-semibold text-[#0A1F3D] leading-snug mb-7 tracking-tight">
                Methodology Summary
              </h2>
              <div className="flex flex-col">
                {APPENDIX_ROWS.map((row, i) => (
                  <div
                    key={row.key}
                    className={`flex gap-4 py-4 text-[13px] ${
                      i < APPENDIX_ROWS.length - 1 ? 'border-b border-[#D0D4CF]' : ''
                    }`}
                  >
                    <span className="font-semibold text-[#0A1F3D] w-36 shrink-0">{row.key}</span>
                    <span className="text-[#4F5968] leading-[1.7]">{row.val}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Footer ── */}
            <div className="pt-6 border-t border-[#D0D4CF] text-center">
              <p className="text-[12px] text-[#B0B8C4] leading-[1.8]">
                The Capital Steward, LLC · thecapitalsteward.com · inquiries@thecapitalsteward.com
                <br />
                © 2026 The Capital Steward, LLC. All rights reserved. For informational purposes only. Not
                investment advice.
              </p>
            </div>
          </main>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  )
}