'use client'

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Cell, LineChart, Line, ResponsiveContainer, Legend
} from "recharts"

// ─────────────────────────────────────────────────────────────────────────────
// DATA — all numbers from validated backtest suite (290,902 obs, 2009–2026)
// ─────────────────────────────────────────────────────────────────────────────

const REGIME_DATA = [
  { regime: "Pre-2020\n2009–2019", r: -0.0016, label: "Negligible", n: "160,948", color: "#8A92A0" },
  { regime: "COVID\n2020–2021",    r: -0.1473, label: "Substantive", n: "47,821",  color: "#244636" },
  { regime: "Post-COVID\n2022–26", r: -0.0971, label: "Substantive", n: "82,133",  color: "#244636" },
  { regime: "Full Period\n2009–26", r: -0.0540, label: "Modest",      n: "290,902", color: "#2D5A8E" },
]

const OAL_RETURN_DATA = [
  { rung: "FCF",     median: 10.2,  geo: 7.2,  hit: 63.5, pct: "81.3%", color: "#244636" },
  { rung: "NI",      median: 7.6,   geo: 1.2,  hit: 59.9, pct: "4.3%",  color: "#2D5A8E" },
  { rung: "EBIT",    median: 0.6,   geo: -6.1, hit: 50.7, pct: "0.8%",  color: "#7A5C2E" },
  { rung: "Revenue", median: -17.3, geo: -24.5, hit: 39.5, pct: "7.6%", color: "#8B3A2A" },
]

const QUINTILE_DATA = [
  { q: "Q1\nLowest Risk", axis1: 9.0,  axis2: 9.6,  composite: 9.8 },
  { q: "Q2",              axis1: 10.3, axis2: 10.5, composite: 9.4 },
  { q: "Q3",              axis1: 10.2, axis2: 10.4, composite: 8.9 },
  { q: "Q4",              axis1: 8.8,  axis2: 8.9,  composite: 9.8 },
  { q: "Q5\nHighest Risk",axis1: 4.6,  axis2: 3.8,  composite: 4.6 },
]

const INDEX_DATA = [
  { name: "Very Low Risk\n(EW, post-2013)", ann: 17.7, sortino: 1.276, mdd: -34.3, color: "#244636" },
  { name: "OSMR-Filtered\nBroad Market (CW)", ann: 14.4, sortino: 1.290, mdd: -22.5, color: "#2D5A8E" },
  { name: "Full Scored\nUniverse (CW)", ann: 10.2, sortino: 0.916, mdd: -26.9, color: "#8A92A0" },
  { name: "SPY\n(approx.)", ann: 15.0, sortino: 1.1, mdd: -34.0, color: "#4F5968" },
]

const YEAR_DATA = [
  { year: "2009", r: -0.0356 },
  { year: "2010", r: -0.0597 },
  { year: "2011", r: -0.0101 },
  { year: "2012", r: -0.0646 },
  { year: "2013", r: -0.0365 },
  { year: "2014", r: -0.0178 },
  { year: "2015", r: -0.0319 },
  { year: "2016", r: -0.0490 },
  { year: "2017", r: -0.0043 },
  { year: "2018", r: +0.0054 },
  { year: "2019", r: +0.0764 },
  { year: "2020", r: -0.0734 },
  { year: "2021", r: -0.2703 },
  { year: "2022", r: -0.1200 },
  { year: "2023", r: -0.1284 },
  { year: "2024", r: -0.0519 },
  { year: "2025", r: -0.0903 },
]

const BUCKET_DATA = [
  { bucket: "Very Low",  median: 10.3, cvar: -53.0, pct_below_25: 12.3, geo: 8.5  },
  { bucket: "Low",       median: 9.6,  cvar: -57.2, pct_below_25: 13.4, geo: 6.9  },
  { bucket: "Moderate",  median: 9.2,  cvar: -67.5, pct_below_25: 15.0, geo: 3.8  },
  { bucket: "High",      median: 8.9,  cvar: -67.9, pct_below_25: 15.7, geo: 3.0  },
  { bucket: "Very High", median: -1.5, cvar: -86.2, pct_below_25: 31.1, geo: -13.1 },
]

// ─────────────────────────────────────────────────────────────────────────────
// CHART COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const CHART_STYLE = {
  fontSize: 11,
  fontFamily: "inherit",
  color: "#5C6472",
}

function RegimeChart() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0] mb-4">
        Composite Spearman r by market regime · 290,902 observations · 2009–2026
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={REGIME_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE0DC" vertical={false} />
          <XAxis
            dataKey="regime"
            tick={{ ...CHART_STYLE, fill: "#5C6472" }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ ...CHART_STYLE, fill: "#8A92A0" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v.toFixed(2)}
            domain={[-0.18, 0.10]}
          />
          <ReferenceLine y={0} stroke="#DDE0DC" strokeWidth={1} />
          <Tooltip
            formatter={(v) => [v != null ? Number(v).toFixed(4) : "—", "Spearman r"]}
            contentStyle={{ fontSize: 12, borderColor: "#DDE0DC", borderRadius: 8 }}
          />
          <Bar dataKey="r" radius={[4, 4, 0, 0]}>
            {REGIME_DATA.map((d, i) => (
              <Cell key={i} fill={d.color} opacity={d.label === "Negligible" ? 0.45 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#8A92A0]">
        <span><span className="inline-block w-2 h-2 rounded-sm bg-[#244636] mr-1.5" />Substantive signal (|r| ≥ 0.11)</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-[#2D5A8E] mr-1.5" />Modest signal (0.05 ≤ |r| &lt; 0.07)</span>
        <span><span className="inline-block w-2 h-2 rounded-sm bg-[#8A92A0] opacity-45 mr-1.5" />Negligible (|r| &lt; 0.03)</span>
      </div>
    </div>
  )
}

function YearByYearChart() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0] mb-4">
        Composite Spearman r · year by year · 2009–2025
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={YEAR_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE0DC" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ ...CHART_STYLE, fill: "#5C6472" }}
            axisLine={false}
            tickLine={false}
            interval={1}
          />
          <YAxis
            tick={{ ...CHART_STYLE, fill: "#8A92A0" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v.toFixed(2)}
            domain={[-0.32, 0.12]}
          />
          <ReferenceLine y={0} stroke="#DDE0DC" strokeWidth={1} />
          <Tooltip
            formatter={(v) => [v != null ? Number(v).toFixed(4) : "—", "Spearman r"]}
            contentStyle={{ fontSize: 12, borderColor: "#DDE0DC", borderRadius: 8 }}
          />
          <Bar dataKey="r" radius={[3, 3, 0, 0]}>
            {YEAR_DATA.map((d, i) => (
              <Cell
                key={i}
                fill={d.r < -0.11 ? "#244636" : d.r < -0.03 ? "#2D5A8E" : d.r > 0.03 ? "#8B3A2A" : "#8A92A0"}
                opacity={Math.abs(d.r) < 0.03 ? 0.45 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-[#8A92A0]">
        Red bars = signal inversion (higher risk outperformed). 2019 peak inversion (r=+0.0764) coincides with the narrative premium cycle peak.
        2021 extraordinary signal (r=−0.2703) reflects narrative collapse.
      </p>
    </div>
  )
}

function OALReturnChart() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0] mb-4">
        Median 12-month return by OAL rung · 2009–2025 · 274,610 observations
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={OAL_RETURN_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE0DC" vertical={false} />
          <XAxis dataKey="rung" tick={{ ...CHART_STYLE, fill: "#5C6472" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ ...CHART_STYLE, fill: "#8A92A0" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}%`}
            domain={[-30, 20]}
          />
          <ReferenceLine y={0} stroke="#DDE0DC" strokeWidth={1} />
          <Tooltip
            formatter={(v) => [v != null ? `${Number(v).toFixed(1)}%` : "—", "Median return"]}
            contentStyle={{ fontSize: 12, borderColor: "#DDE0DC", borderRadius: 8 }}
          />
          <Bar dataKey="median" radius={[4, 4, 0, 0]}>
            {OAL_RETURN_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-[#8A92A0]">
        FCF vs Revenue spread: +27.6 percentage points. Held across all regimes tested.
      </p>
    </div>
  )
}

function QuintileChart() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0] mb-4">
        Median 12-month return by composite quintile · Q1 = lowest structural risk
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={QUINTILE_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE0DC" vertical={false} />
          <XAxis dataKey="q" tick={{ ...CHART_STYLE, fill: "#5C6472" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ ...CHART_STYLE, fill: "#8A92A0" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}%`}
            domain={[0, 14]}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderColor: "#DDE0DC", borderRadius: 8 }}
            formatter={(v, name) => [v != null ? `${Number(v).toFixed(1)}%` : "—", name]}
          />
          <Bar dataKey="composite" name="Composite" fill="#0A1F3D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-[#8A92A0]">
        Signal concentrates in Q5 penalty: median geo return −5.2%, hit rate 55.1%.
        Q1–Q4 are largely undifferentiated — the framework is a loss-avoidance tool, not a return-optimization engine.
      </p>
    </div>
  )
}

function IndexComparisonChart() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0] mb-4">
        Annualized return comparison · equal-weight and cap-weight indexes · post-2013
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={INDEX_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE0DC" vertical={false} />
          <XAxis dataKey="name" tick={{ ...CHART_STYLE, fill: "#5C6472" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ ...CHART_STYLE, fill: "#8A92A0" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}%`}
            domain={[0, 22]}
          />
          <Tooltip
            formatter={(v) => [v != null ? `${Number(v).toFixed(1)}%` : "—", "Ann. return"]}
            contentStyle={{ fontSize: 12, borderColor: "#DDE0DC", borderRadius: 8 }}
          />
          <Bar dataKey="ann" radius={[4, 4, 0, 0]}>
            {INDEX_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function BucketRiskChart() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0] mb-4">
        CVaR (95%) by composite bucket · average loss in worst 5% of 12-month windows
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={BUCKET_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 8 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE0DC" horizontal={false} />
          <XAxis
            type="number"
            tick={{ ...CHART_STYLE, fill: "#8A92A0" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}%`}
            domain={[-100, 0]}
          />
          <YAxis
            type="category"
            dataKey="bucket"
            tick={{ ...CHART_STYLE, fill: "#5C6472" }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <ReferenceLine x={0} stroke="#DDE0DC" />
          <Tooltip
            formatter={(v) => [v != null ? `${Number(v).toFixed(1)}%` : "—", "CVaR (95%)"]}
            contentStyle={{ fontSize: 12, borderColor: "#DDE0DC", borderRadius: 8 }}
          />
          <Bar dataKey="cvar" radius={[0, 4, 4, 0]}>
            {BUCKET_DATA.map((d, i) => (
              <Cell
                key={i}
                fill={d.bucket === "Very Low" ? "#244636"
                    : d.bucket === "Low" ? "#3E6B4F"
                    : d.bucket === "Moderate" ? "#8A92A0"
                    : d.bucket === "High" ? "#BC6464"
                    : "#8B3A2A"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-[#8A92A0]">
        Very High bucket: 31.1% of observations ended below −25% over the subsequent 12 months.
        Very Low bucket: 12.3%.
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OAL DATA
// ─────────────────────────────────────────────────────────────────────────────

const OAL_RUNGS = [
  {
    code: "FCF",
    label: "OAL 1 — Free Cash Flow",
    desc: "Positive 3-year cumulative FCF · Deepest credible anchor",
    count: "~2,900 cos.",
    color: "#244636",
    bg: "#E8EFE9",
    border: "#C9D8CD",
    solid: true,
    empirical: "Median +10.2% · Geo mean +7.2% · Hit rate 63.5%",
  },
  {
    code: "NI",
    label: "OAL 2 — Net Income",
    desc: "Positive 3-year cumulative NI · Profitable but not FCF-positive",
    count: "~622 cos.",
    color: "#2D5A8E",
    bg: "#EAF0F8",
    border: "#C5D4E8",
    solid: true,
    empirical: "Median +7.6% · Geo mean +1.2% · Hit rate 59.9%",
  },
  {
    code: "EBIT",
    label: "OAL 3 — EBIT",
    desc: "Positive 3-year cumulative EBIT · Covers operations before interest & tax",
    count: "~111 cos.",
    color: "#7A5C2E",
    bg: "#F5EFE6",
    border: "#E0CEB0",
    solid: true,
    empirical: "Median +0.6% · Geo mean −6.1% · Hit rate 50.7%",
  },
  {
    code: "Rev",
    label: "OAL 4 — Revenue",
    desc: "Positive 3-year cumulative Revenue · Cannot cover operating costs",
    count: "~1,163 cos.",
    color: "#8B3A2A",
    bg: "#F8EEEC",
    border: "#E8C8C0",
    solid: true,
    empirical: "Median −17.3% · Geo mean −24.5% · Hit rate 39.5%",
  },
  {
    code: "—",
    label: "OAL 0 — Non-Viable",
    desc: "Zero or negative revenue · No credible anchor exists",
    count: "~372 cos.",
    color: "#8A92A0",
    bg: "#F1F3F0",
    border: "#DDE0DC",
    solid: false,
    empirical: "Excluded from scoring universe",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// AXIS ACCORDION
// ─────────────────────────────────────────────────────────────────────────────

const AXES = [
  {
    id: "axis1",
    label: "Axis 1",
    name: "Operational Anchor Risk",
    question: "How deep is the operational support behind the valuation?",
    body: `Axis 1 measures the distance between a company's current Enterprise Value and its deepest credible operational anchor, adjusted for the shallowness of that anchor.

The formula: log(EV / anchor_3yr) + OAL_penalty → global percentile rank.

The anchor is the 3-year cumulative sum of the OAL-appropriate financial series — not trailing twelve months. A 3-year window reduces the noise of a single anomalous quarter and requires sustained demonstrated performance. The logarithm compresses extreme multiples while preserving ordinal relationships. The shallowness penalty encodes structural distance between rungs: after adjustment, a revenue-anchor company is treated as approximately 13.5× more expensive relative to its anchor than an FCF-anchor company at the same raw multiple.

Axis 1 produces its strongest signal during periods of structural stress and dislocation. In calm bull markets where narrative valuations are broadly rewarded, the signal is attenuated — which is both expected and disclosed. The framework measures the structure of risk, not its timing.`,
  },
  {
    id: "axis2",
    label: "Axis 2",
    name: "Operational Trajectory Risk",
    question: "Is that operational foundation improving or deteriorating?",
    body: `Axis 2 captures trajectory, not position. A company moving toward demonstrated cash generation is shortening its narrative bridge. A company whose anchor metric is deteriorating is lengthening it — accumulating structural risk regardless of where its price currently sits.

The score is derived from year-over-year comparisons across up to 28 quarters of history, adjusted by an OAL shallowness penalty and ranked globally. The four most recent year-over-year comparisons receive double weight — current trajectory is more relevant to current structural risk than six-year-old data.

Axis 2 is the stronger and more consistent signal across the validation period. It produced meaningful signal even in the pre-2020 decade (Spearman r = −0.023) where Axis 1 was effectively zero — suggesting trajectory discriminates returns even in environments where valuation alone does not.

Design note: YoY consistency outperformed tanh transformation and R-squared trend fitting in empirical validation. The simpler measure was used. Mathematical sophistication is not a virtue when it disconnects the measure from the phenomenon it is trying to capture.`,
  },
  {
    id: "axis3",
    label: "Axis 3",
    name: "Operational Financing Risk",
    question: "Can the firm meet its obligations from actual operational output?",
    body: `Axis 3 assesses whether a firm can service its financing obligations from its actual operational output — not from accounting constructs, narrative projections, or asset sales.

Axis 3 is a disclosure layer. It is not included in the composite score. It is evaluated separately for firms with non-zero interest obligations, and presented as contextual information alongside the two-axis composite. This design choice reflects the empirical finding that adding Axis 3 to the composite does not materially improve signal strength — the two-axis composite (Axis 1 + Axis 2, equal weight) produces a Modest full-period Spearman r of −0.054. Including Axis 3 adds complexity without proportional signal benefit.

Firms without interest expense are not assigned an Axis 3 score. Financing risk is undefined in the absence of a financing structure. These firms are labeled "No Financing Structure" — this is a domain restriction, not a data quality decision. Their composite is the normalized mean of Axis 1 and Axis 2 only.

Debt is not inherently fragile. A mature firm running significant debt with strong operational coverage is structurally sound. What creates fragility is the gap between what a firm owes and what it can credibly produce to service it.`,
  },
]

function AxisAccordion() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="space-y-3">
      {AXES.map(({ id, label, name, question, body }) => {
        const isOpen = open === id
        return (
          <div key={id} className="rounded-xl border border-[#DDE0DC] bg-white overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : id)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#F7F8F6] transition"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0]">{label}</span>
                <span className="text-sm font-semibold text-[#0A1F3D]">{name}</span>
              </div>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-[#8A92A0] transition-transform"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-6 border-t border-[#DDE0DC]">
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-[#8A92A0]">{question}</p>
                <div className="mt-3 space-y-3 text-base leading-7 text-[#5C6472]">
                  {body.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION NAV
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "framing",     label: "Framing" },
  { id: "problem",     label: "The Problem" },
  { id: "oal",         label: "Anchor Ladder" },
  { id: "axes",        label: "The Axes" },
  { id: "composite",   label: "Composite Score" },
  { id: "validation",  label: "Validation" },
  { id: "principles",  label: "Design Principles" },
  { id: "limitations", label: "Limitations" },
  { id: "conclusion",  label: "Conclusion" },
  { id: "appendix",    label: "Appendix" },
]

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function OsmrMethodology() {
  return (
    <main className="min-h-screen bg-[#F1F3F0] text-[#1E2228]">

      {/* ── Document header ─────────────────────────────────────────────── */}
      <div className="border-b border-[#DDE0DC] bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
            The Capital Steward · Methodology · 2026
          </p>
          <h1 className="tcs-heading mt-3 text-4xl font-semibold leading-tight text-[#0A1F3D] md:text-5xl">
            How We Measure Structural Risk
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#5C6472]">
            Most valuation frameworks ask how much a company is worth. This one
            asks a different question: how well-grounded is that valuation in
            what the company has actually demonstrated? The gap between these two
            questions is where structural investment risk accumulates — before it
            becomes visible in price.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#8A92A0]">
            <span>~5,200 companies · current universe snapshot</span>
            <span>290,902 historical observations · 2009–2026</span>
            <span>$5M ADV liquidity filter applied</span>
          </div>

          <nav className="mt-8 flex flex-wrap gap-x-1 gap-y-1">
            {SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-lg border border-[#DDE0DC] bg-[#F7F8F6] px-3 py-1.5 text-xs font-medium text-[#5C6472] transition hover:border-[#244636] hover:text-[#0A1F3D]"
              >
                {label}
              </a>
            ))}
          </nav>

          <p className="mt-6 text-xs leading-5 text-[#8A92A0]">
            All quantitative figures reflect a recent snapshot of the dataset.
            Universe counts, OAL rung distributions, and observation totals are
            snapshot-dependent values, not permanent constants. The dataset
            refreshes weekly; the full structural pipeline recalibrates monthly.
            Backtest results are historical and do not guarantee future outcomes.
          </p>
        </div>
      </div>

      {/* ── Document body ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-6 py-14 space-y-16">

        {/* ── FRAMING ─────────────────────────────────────────────────────── */}
        <section id="framing">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Framing</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            Most analysis begins with stories. We begin with structure.
          </h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-[#5C6472]">
            <p>
              Markets are driven as much by perception as by operating reality.
              A company will point to the deepest operational anchor it can
              credibly claim. If it can justify its valuation with free cash
              flow, it will. If it cannot, it ascends the financial statement —
              to earnings, to operating income, to revenue — until it finds a
              metric the market will accept. Each step up the ladder lengthens
              the narrative bridge between price and economic reality.
            </p>
            <p>
              The Capital Steward exists to measure that bridge. Narratives are
              constrained by structure. Valuations must ultimately reconcile with
              operating reality. Cash generation cannot be substituted
              indefinitely. A company with robust, deep operational anchoring
              does not need narrative to justify its price. Structure eventually
              speaks for itself.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-[#DDE0DC] bg-[#0A1F3D] px-6 py-5">
            <p className="text-sm font-medium leading-7 text-[#A9BEDF]">
              OSMR applies first-principle structural reasoning to equity analysis.
              It tests the hypothesis that companies grounded in operational
              reality outperform those whose valuations rest on narrative.
              Multiple years of data confirm this. The framework is a validated
              theory of structural fragility.
            </p>
          </div>
        </section>

        <hr className="border-[#DDE0DC]" />

        {/* ── THE PROBLEM ─────────────────────────────────────────────────── */}
        <section id="problem">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Section I</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            The Problem with Valuation
          </h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-[#5C6472]">
            <p>
              Every stock price is a statement of belief. When a market assigns
              a company an enterprise value of $10 billion, it is not recording
              a fact — it is expressing a judgment about what the company's
              future cash generation will justify. That judgment is, at its
              core, a narrative.
            </p>
            <p>
              This is not a criticism. Narrative is inseparable from valuation.
              Every multiple — price-to-earnings, EV-to-EBITDA, price-to-sales
              — is a present-value claim about future performance. The multiple
              is the price of believing the story. Standard valuation analysis
              focuses on whether the story is plausible. What it rarely asks is:
              what happens to the valuation if the story stops being believed?
              And how far is the story from anything the company has actually
              demonstrated?
            </p>
          </div>

          <div className="mt-8 rounded-xl border-l-4 border-[#244636] bg-white px-6 py-5">
            <p className="text-sm font-medium text-[#0A1F3D] leading-6">
              There is a meaningful difference between a company valued at 40×
              free cash flow and a company valued at 40× revenue. Both trade at
              the same nominal multiple. But the first has demonstrated the
              ability to convert revenue into cash after all obligations. The
              second's valuation depends entirely on the market continuing to
              believe it will eventually do something it has not yet done.
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-[#DDE0DC] bg-[#0A1F3D] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A9BEDF] mb-2">
              A note on scope
            </p>
            <p className="text-sm leading-6 text-[#A9BEDF]">
              OSMR does not claim to identify mispriced securities or predict
              return outcomes. A company with very high structural risk may
              continue to appreciate for months or years if the narrative
              sustaining its valuation remains intact. The framework measures
              the structure of risk, not its timing — a distinction this
              document returns to throughout.
            </p>
          </div>
        </section>

        <hr className="border-[#DDE0DC]" />

        {/* ── OAL ─────────────────────────────────────────────────────────── */}
        <section id="oal">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Section II</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            The Operational Anchor Ladder
          </h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-[#5C6472]">
            <p>
              The Operational Anchor Ladder (OAL) is the governance construct
              at the heart of OSMR. It answers a single question for every
              company in the universe: what is the deepest, most credible
              financial rung this company has actually demonstrated over the
              trailing three years?
            </p>
            <p>
              The word <em>deepest</em> is deliberate. It refers not to the
              size of the financial figure but to its proximity to actual cash
              generation. Free cash flow is the deepest anchor because it
              represents what a company has genuinely produced after all
              capital requirements. Revenue is the shallowest anchor because
              it tells us only that the company sold something — not whether
              that sale moved it any closer to economic viability.
            </p>
          </div>

          {/* OAL ladder with empirical returns */}
          <div className="mt-8 rounded-xl border border-[#DDE0DC] bg-white overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-[#DDE0DC]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0]">
                Operational Anchor Ladder
              </p>
              <p className="mt-1 text-xs text-[#8A92A0]">
                Strongest support → most narrative-dependent · with 12-month historical return distributions
              </p>
            </div>
            <div>
              {OAL_RUNGS.map(({ code, label, desc, count, color, bg, border, solid, empirical }, i) => (
                <div key={code}>
                  <div
                    className={`px-6 py-4 ${!solid ? "opacity-60" : ""}`}
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <span
                          className="inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold shrink-0"
                          style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
                        >
                          {code}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-[#0A1F3D]">{label}</div>
                          <div className="text-xs text-[#8A92A0] mt-0.5">{desc}</div>
                        </div>
                      </div>
                      <span className="text-xs text-[#8A92A0] shrink-0 ml-4 text-right">
                        {count}
                      </span>
                    </div>
                    {solid && (
                      <p className="mt-2 ml-14 text-xs text-[#8A92A0]">{empirical}</p>
                    )}
                  </div>
                  {i < OAL_RUNGS.length - 1 && (
                    <div className="flex justify-center py-1 text-[#DDE0DC]">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-[#DDE0DC] bg-[#F7F8F6]">
              <p className="text-xs text-center text-[#5C6472]">
                Each step up the ladder increases narrative dependence — and structural risk.
                The FCF–Revenue spread of +27.6 percentage points held across all regimes tested.
              </p>
            </div>
          </div>

          {/* OAL return chart */}
          <div className="mt-6 rounded-xl border border-[#DDE0DC] bg-white px-6 py-5">
            <OALReturnChart />
          </div>

          <div className="mt-8 space-y-4 text-base leading-7 text-[#5C6472]">
            <h3 className="text-lg font-semibold text-[#0A1F3D]">The Assignment Logic</h3>
            <p>
              Each company is evaluated against the OAL rungs in descending
              order — FCF first, then Net Income, then EBIT, then Revenue —
              and assigned to the first rung it qualifies for on a three-year
              cumulative basis. A 3-year window requires sustained demonstrated
              performance rather than rewarding a single anomalous quarter.
              Adjusted metrics, normalized earnings, and forward projections
              are not considered.
            </p>

            <h3 className="text-lg font-semibold text-[#0A1F3D]">The Shallowness Penalty</h3>
            <p>
              Two companies trading at the same enterprise value multiple are
              not comparably risky if they are anchored on different OAL rungs.
              The shallowness penalty encodes this: a proportional risk
              adjustment applied to the axis scores based on anchor depth.
              After adjustment, a revenue-anchor company is treated as
              approximately 13.5× more expensive relative to its anchor than
              an FCF-anchor company at the same raw multiple.
            </p>
            <p>
              The specific penalty values were derived from first-principles
              reasoning about the structural distance between rungs — calibrated
              before examining outcomes, which means the cohort separation is a
              genuine test rather than circular validation. Empirical testing
              confirms the penalties are competitive with alternatives but not
              uniquely optimal — their primary justification is structural
              integrity, not empirical maximization.
            </p>
          </div>
        </section>

        <hr className="border-[#DDE0DC]" />

        {/* ── THE THREE AXES ───────────────────────────────────────────────── */}
        <section id="axes">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Section III</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            The Three Axes of Structural Risk
          </h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-[#5C6472]">
            <p>
              OSMR's three axes are not measuring different things. They are
              measuring different dimensions of the same structural condition:
              the relationship between a company's valuation and its operational
              reality. All three axes speak to the same OAL anchor throughout.
            </p>
            <p>
              Axis 1 asks: how stretched is the valuation relative to
              demonstrated output? Axis 2 asks: is that demonstrated output
              improving or deteriorating? Axis 3 asks: can the firm service its
              obligations from that output? Together they build a complete
              structural picture. Axis 3 is presented as a contextual disclosure
              layer, not incorporated into the composite score — see the
              Composite Score section for the rationale.
            </p>
          </div>

          <div className="mt-8">
            <AxisAccordion />
          </div>
        </section>

        <hr className="border-[#DDE0DC]" />

        {/* ── COMPOSITE SCORE ─────────────────────────────────────────────── */}
        <section id="composite">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Section IV</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            The Composite Score
          </h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-[#5C6472]">
            <p>
              The Composite Structural Risk score is the equal-weight mean of
              Axis 1 and Axis 2, expressed as a percentile rank across the
              full scored universe. The formula is:
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-[#DDE0DC] bg-[#F7F8F6] px-6 py-5 font-mono text-sm text-[#0A1F3D]">
            composite = (axis1_pct + axis2_pct) / 2
          </div>

          <div className="mt-6 space-y-4 text-base leading-7 text-[#5C6472]">
            <p>
              Axis 1 and Axis 2 each carry 50% weight. This equal weighting
              reflects a deliberate epistemological choice: both axes capture
              distinct structural dimensions with comparable empirical signal
              strength. Axis 2 carries slightly stronger full-period signal
              (Spearman r = −0.062 vs Axis 1 at −0.033), but the difference
              is within the range where overfitting risk exceeds the marginal
              signal gain from tilting. Equal weighting is more interpretable,
              more stable, and less dependent on a specific historical window
              to justify.
            </p>
            <p>
              Axis 3 is intentionally excluded from the composite. Empirical
              testing shows that adding Axis 3 to the composite does not
              materially improve signal strength — the two-axis composite
              produces a full-period Spearman r of −0.054, which is not
              improved by including a third axis at additional complexity cost.
              Axis 3 is retained as a structural disclosure layer, visible in
              the platform interface alongside the composite score.
            </p>
            <p>
              This is a long-run static model. The weights do not shift based
              on market regime or detected volatility environment. The
              tradeoff — suboptimal weights in any specific regime — is accepted
              in exchange for a system that is interpretable, consistent, and
              directly comparable across time.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-[#DDE0DC] bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-[#DDE0DC]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0]">
                Composite bucket labels
              </p>
            </div>
            <div className="divide-y divide-[#DDE0DC]">
              {[
                { bucket: "Very Low",  range: "0th – 20th percentile",  desc: "Lowest structural risk — deepest anchors, improving trajectory" },
                { bucket: "Low",       range: "20th – 40th percentile", desc: "Below-average structural risk" },
                { bucket: "Moderate",  range: "40th – 60th percentile", desc: "Average structural risk — population center" },
                { bucket: "High",      range: "60th – 80th percentile", desc: "Above-average structural risk" },
                { bucket: "Very High", range: "80th – 100th percentile", desc: "Highest structural risk — shallow anchors, deteriorating trajectory" },
              ].map(({ bucket, range, desc }) => (
                <div key={bucket} className="grid grid-cols-[120px_1fr_2fr] items-center gap-4 px-6 py-3 text-sm">
                  <span className="font-semibold text-[#0A1F3D]">{bucket}</span>
                  <span className="text-[#8A92A0] text-xs">{range}</span>
                  <span className="text-[#5C6472]">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-[#DDE0DC]" />

        {/* ── VALIDATION ──────────────────────────────────────────────────── */}
        <section id="validation">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Section V</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            Empirical Validation
          </h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-[#5C6472]">
            <p>
              A scoring framework without empirical grounding is a hypothesis.
              OSMR has been validated against 290,902 historical observations
              across the U.S. equity universe from 2009 through 2026, spanning
              three distinct market regimes. The validation tests whether
              structural risk classifications produce measurably different
              distributions of subsequent 12-month returns — which is a weaker
              and more honest claim than prediction.
            </p>
            <p>
              All observations apply a $5 minimum price filter at formation to
              eliminate penny stock artifacts. The backtest universe is the
              full scored population with $5M minimum average daily volume,
              rebalanced monthly at month-end closing prices. Transaction costs
              and market impact are not modeled.
            </p>
          </div>

          {/* Signal scale explainer */}
          <div className="mt-6 rounded-xl border border-[#DDE0DC] bg-[#F7F8F6] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0] mb-3">
              How to read Spearman r in an equity factor context
            </p>
            <p className="text-sm leading-6 text-[#5C6472] mb-3">
              Cross-sectional Spearman r measures rank-order consistency between
              a risk score and subsequent returns across all companies simultaneously.
              The scale differs materially from behavioral or clinical research.
              The Fama-French value factor — one of the most replicated factors
              in academic finance — produces Spearman r in the 0.03–0.06 range
              in cross-sectional studies. Momentum produces 0.05–0.09.
            </p>
            <div className="grid grid-cols-5 gap-1 text-center text-xs mt-3">
              {[
                { label: "Negligible", range: "|r| < 0.03", bg: "#F1F3F0", text: "#8A92A0" },
                { label: "Slight",     range: "0.03–0.05",  bg: "#EAF0F8", text: "#2D5A8E" },
                { label: "Modest",     range: "0.05–0.07",  bg: "#E8EFE9", text: "#244636" },
                { label: "Strong",     range: "0.07–0.11",  bg: "#C9D8CD", text: "#1A3A27" },
                { label: "Substantive",range: "|r| ≥ 0.11", bg: "#0A1F3D", text: "#A9BEDF" },
              ].map(({ label, range, bg, text }) => (
                <div key={label} className="rounded-lg py-2 px-1" style={{ backgroundColor: bg }}>
                  <div className="font-semibold" style={{ color: text }}>{label}</div>
                  <div className="mt-0.5 opacity-70" style={{ color: text }}>{range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Signal summary */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[#0A1F3D]">Signal Summary</h3>
            <div className="mt-4 overflow-hidden rounded-xl border border-[#DDE0DC]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DDE0DC] bg-[#F7F8F6]">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Factor</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Spearman r</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">95% CI</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Label</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">N</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE0DC]">
                  {[
                    { factor: "Axis 1 (Anchor Risk)",      r: "−0.0607", ci: "[−0.064, −0.057]", label: "Modest",      n: "292,112" },
                    { factor: "Axis 2 (Trajectory Risk)",  r: "−0.0619", ci: "[−0.066, −0.058]", label: "Modest",      n: "289,781" },
                    { factor: "Composite (equal weight)",  r: "−0.0540", ci: "[−0.058, −0.050]", label: "Modest",      n: "290,902" },
                  ].map(({ factor, r, ci, label, n }) => (
                    <tr key={factor} className="bg-white">
                      <td className="px-5 py-3 font-medium text-[#0A1F3D]">{factor}</td>
                      <td className="px-5 py-3 text-right font-mono text-[#244636]">{r}</td>
                      <td className="px-5 py-3 text-right text-[#8A92A0] text-xs">{ci}</td>
                      <td className="px-5 py-3 text-right text-[#5C6472]">{label}</td>
                      <td className="px-5 py-3 text-right text-[#8A92A0]">{n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[#8A92A0]">
              Bootstrap 95% confidence intervals (1,000 samples). All p-values = 0.0000.
              ICIR (Information Coefficient / Std): Composite −0.67, Axis 2 −0.66, Axis 1 −0.48.
            </p>
          </div>

          {/* Regime chart */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[#0A1F3D]">Signal by Market Regime</h3>
            <p className="mt-2 text-base leading-7 text-[#5C6472]">
              OSMR's signal is conditional on the market environment. In periods
              of structural stress and dislocation — COVID-era disruption,
              post-COVID rate normalization and multiple compression — the signal
              is Substantive. In the extended pre-2020 bull market, the full-period
              signal is Negligible. This is not a defect. It is the expected
              behavior of a framework that measures structural risk, not narrative
              momentum.
            </p>
            <div className="mt-6 rounded-xl border border-[#DDE0DC] bg-white px-6 py-5">
              <RegimeChart />
            </div>
          </div>

          {/* Pre-2020 disclosure */}
          <div className="mt-6 rounded-xl border-l-4 border-[#8A92A0] bg-white px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0] mb-2">
              Pre-2020 regime — honest disclosure
            </p>
            <p className="text-sm leading-6 text-[#5C6472]">
              The pre-2020 composite signal (r = −0.0016, Negligible) warrants
              specific attention. Breaking the decade into sub-windows: 2009–2012
              produced Modest signal (r = −0.042) during the post-crisis recovery.
              2013–2016 produced Slight signal (r = −0.031) during the early
              bull market. 2017–2019 produced a statistically significant
              <em> inversion</em> (r = +0.035) — the period when narrative premium
              expansion was at its peak and structurally fragile companies
              systematically outperformed. The 2019 peak inversion (r = +0.076)
              is the strongest anti-signal year in the dataset. The 2021
              signal (r = −0.270, Substantive) reflects the subsequent collapse
              of those same narratives.
            </p>
            <p className="mt-3 text-sm leading-6 text-[#5C6472]">
              The pattern is structurally coherent: the framework identified
              correctly which companies were fragile. The market spent
              2017–2019 rewarding exactly that fragility. Then it stopped.
            </p>
          </div>

          {/* Year-by-year chart */}
          <div className="mt-6 rounded-xl border border-[#DDE0DC] bg-white px-6 py-5">
            <YearByYearChart />
          </div>

          {/* Quintile evidence */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[#0A1F3D]">Return Distribution by Structural Risk Quintile</h3>
            <p className="mt-2 text-base leading-7 text-[#5C6472]">
              The signal concentrates in the penalty applied to the highest-risk
              quintile. Q1 through Q4 are largely undifferentiated in median
              returns — the framework is not reliably identifying which companies
              will outperform. What it reliably identifies is the structural
              conditions under which companies are most likely to
              significantly underperform.
            </p>
            <div className="mt-4 rounded-xl border border-[#DDE0DC] bg-white px-6 py-5">
              <QuintileChart />
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-[#DDE0DC]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DDE0DC] bg-[#F7F8F6]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Quintile</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Median</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Geo Mean</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Hit Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">N</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE0DC]">
                  {[
                    { q: "Q1 — Lowest Risk", med: "+9.8%",  geo: "+7.5%",  hit: "62.0%", n: "58,181", color: "#244636" },
                    { q: "Q2",               med: "+9.4%",  geo: "+5.7%",  hit: "61.9%", n: "58,180", color: "#5C6472" },
                    { q: "Q3",               med: "+8.9%",  geo: "+2.7%",  hit: "61.4%", n: "58,181", color: "#5C6472" },
                    { q: "Q4",               med: "+9.8%",  geo: "+4.8%",  hit: "62.9%", n: "58,180", color: "#5C6472" },
                    { q: "Q5 — Highest Risk",med: "+4.6%",  geo: "−5.2%",  hit: "55.1%", n: "58,180", color: "#8B3A2A" },
                  ].map(({ q, med, geo, hit, n, color }) => (
                    <tr key={q} className="bg-white">
                      <td className="px-4 py-3 font-medium" style={{ color }}>{q}</td>
                      <td className="px-4 py-3 text-right text-[#5C6472]">{med}</td>
                      <td className="px-4 py-3 text-right text-[#5C6472]">{geo}</td>
                      <td className="px-4 py-3 text-right text-[#5C6472]">{hit}</td>
                      <td className="px-4 py-3 text-right text-[#8A92A0]">{n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[#8A92A0]">
              Q1–Q5 median spread: +5.2 pp · t=4.785 · p=0.0000 · Full period 2009–2026.
            </p>
          </div>

          {/* Tail risk */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[#0A1F3D]">Tail Risk and Loss Concentration</h3>
            <p className="mt-2 text-base leading-7 text-[#5C6472]">
              The framework's primary structural contribution is loss avoidance,
              not return maximization. The difference between buckets is most
              visible in the left tail — in CVaR, in the concentration of
              severe losses, and in the frequency of negative outcomes.
            </p>
            <div className="mt-4 rounded-xl border border-[#DDE0DC] bg-white px-6 py-5">
              <BucketRiskChart />
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-[#DDE0DC]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DDE0DC] bg-[#F7F8F6]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Bucket</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Median</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Geo Mean</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">CVaR (95%)</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">&lt;−25%</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">N</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE0DC]">
                  {[
                    { b: "Very Low",  med: "+10.3%", geo: "+8.5%",  cvar: "−53.0%", pct: "12.3%", n: "18,481", c: "#244636" },
                    { b: "Low",       med: "+9.6%",  geo: "+6.9%",  cvar: "−57.2%", pct: "13.4%", n: "70,013", c: "#5C6472" },
                    { b: "Moderate",  med: "+9.2%",  geo: "+3.8%",  cvar: "−67.5%", pct: "15.0%", n: "121,692", c: "#5C6472" },
                    { b: "High",      med: "+8.9%",  geo: "+3.0%",  cvar: "−67.9%", pct: "15.7%", n: "54,345", c: "#5C6472" },
                    { b: "Very High", med: "−1.5%",  geo: "−13.1%", cvar: "−86.2%", pct: "31.1%", n: "26,371", c: "#8B3A2A" },
                  ].map(({ b, med, geo, cvar, pct, n, c }) => (
                    <tr key={b} className="bg-white">
                      <td className="px-4 py-3 font-medium" style={{ color: c }}>{b}</td>
                      <td className="px-4 py-3 text-right text-[#5C6472]">{med}</td>
                      <td className="px-4 py-3 text-right text-[#5C6472]">{geo}</td>
                      <td className="px-4 py-3 text-right text-[#5C6472]">{cvar}</td>
                      <td className="px-4 py-3 text-right text-[#5C6472]">{pct}</td>
                      <td className="px-4 py-3 text-right text-[#8A92A0]">{n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[#8A92A0]">
              CVaR (95%): average loss in the worst 5% of 12-month outcomes.
              "{'<'}−25%": percentage of observations with 12-month return below −25%.
            </p>
          </div>

          {/* Index performance */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-[#0A1F3D]">Index Performance</h3>
            <p className="mt-2 text-base leading-7 text-[#5C6472]">
              To translate distributional findings into portfolio-level terms,
              we constructed equal-weight and cap-weight indexes from the
              composite buckets, rebalanced monthly. All indexes apply the $5
              price filter. Results are shown post-2013 to control for thin
              constituent counts in the 2009–2013 recovery period, where the
              Very Low bucket averaged fewer than 50 companies per month.
            </p>

            <div className="mt-4 rounded-xl border border-[#DDE0DC] bg-white px-6 py-5">
              <IndexComparisonChart />
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-[#DDE0DC]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DDE0DC] bg-[#F7F8F6]">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Index</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Ann Ret</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Sortino</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Max DD</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#8A92A0]">Months</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE0DC]">
                  {[
                    { idx: "Very Low Risk (EW, post-2013)",       ann: "+17.7%", sor: "1.276", mdd: "−34.3%", mo: "145", note: "" },
                    { idx: "OSMR-Filtered Broad Market (CW)",     ann: "+14.4%", sor: "1.290", mdd: "−22.5%", mo: "145", note: "exclusion only" },
                    { idx: "Full Scored Universe (CW)",           ann: "+10.2%", sor: "0.916", mdd: "−26.9%", mo: "145", note: "no filter" },
                    { idx: "SPY (external reference, approx.)",  ann: "+14–16%", sor: "~1.1",  mdd: "~−34%", mo: "—",  note: "cap-weighted large-cap" },
                  ].map(({ idx, ann, sor, mdd, mo, note }) => (
                    <tr key={idx} className="bg-white">
                      <td className="px-4 py-3 text-[#0A1F3D]">
                        {idx}
                        {note && <span className="ml-2 text-xs text-[#8A92A0]">({note})</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[#244636]">{ann}</td>
                      <td className="px-4 py-3 text-right text-[#5C6472]">{sor}</td>
                      <td className="px-4 py-3 text-right text-[#5C6472]">{mdd}</td>
                      <td className="px-4 py-3 text-right text-[#8A92A0]">{mo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border-l-4 border-[#244636] bg-white px-6 py-4">
                <p className="text-sm leading-6 text-[#5C6472]">
                  <strong className="text-[#0A1F3D]">Premium decomposition.</strong>{" "}
                  The OSMR-Filtered Broad Market index — cap-weighted, excluding
                  all High and Very High companies on either axis, no positive
                  selection applied — produced +14.4% annualized vs the full
                  universe at +10.2%. Simply removing structurally fragile
                  companies added +4.2 percentage points. Positive selection
                  into the Very Low bucket added a further +3.3 percentage points.
                  The framework earns its premium through two independently
                  verifiable mechanisms.
                </p>
              </div>

              <div className="rounded-xl border-l-4 border-[#8A92A0] bg-white px-6 py-4">
                <p className="text-sm leading-6 text-[#5C6472]">
                  <strong className="text-[#0A1F3D]">SPY comparison.</strong>{" "}
                  Over the same period, SPY returned approximately 14–16%
                  annualized. The OSMR-Filtered index achieved comparable returns
                  (+14.4%) with a maximum drawdown of −22.5% versus SPY's
                  approximately −34% — a materially different path to a similar
                  destination. The Very Low index (+17.7%) exceeded SPY on raw
                  return but carries a deeper drawdown (−34.3%) due to its
                  equal-weight construction and small-cap tilt.
                </p>
              </div>

              <div className="rounded-xl border border-[#DDE0DC] bg-[#F7F8F6] px-6 py-4">
                <p className="text-xs text-[#8A92A0] leading-5">
                  <strong className="text-[#5C6472]">Methodology notes.</strong>{" "}
                  Very Low index: equal-weight, post-2013 (avg. 123 constituents/month).
                  Full-period figure (+25.1%) includes 2009–2013 recovery with
                  thin constituent counts (avg. &lt;50/month); post-2013 figure
                  (+17.7%) is the appropriate reference. OSMR-Filtered: cap-weight,
                  excludes axis1 or axis2 in {"{"}High, Very High{"}"},
                  avg. 559 constituents/month. Transaction costs not modeled.
                </p>
              </div>
            </div>
          </div>

          {/* Why median */}
          <div className="mt-8 space-y-4 text-base leading-7 text-[#5C6472]">
            <h3 className="text-lg font-semibold text-[#0A1F3D]">Why Median Is the Primary Metric</h3>
            <p>
              The decision to lead with median rather than mean is not merely
              statistical — it is philosophical. The median reports the outcome
              for a typical investor who held a typical security from this cohort
              for twelve months. The mean reports what they would have received
              if they had held the entire cohort in equal weight, including all
              extreme outcomes.
            </p>
            <p>
              In the highest-risk composite bucket, the mean return is +9.8%
              while the median is −1.5% and the geometric mean is −13.1%.
              A framework that reported mean as its primary metric would present
              this bucket as potentially attractive. The median and geometric
              mean tell the honest story: the typical outcome is negative, and
              compounding through this cohort destroys capital. Mean is shown
              with skew indicators when the gap is material, so readers can see
              both the central tendency and the distribution shape.
            </p>
          </div>
        </section>

        <hr className="border-[#DDE0DC]" />

        {/* ── DESIGN PRINCIPLES ────────────────────────────────────────────── */}
        <section id="principles">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Section VI</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            Design Principles
          </h2>
          <p className="mt-5 text-base leading-7 text-[#5C6472]">
            Every analytical framework makes design choices. These are not
            implementation details — they are the constraints that define what
            the framework is and is not allowed to claim.
          </p>

          <div className="mt-8 space-y-4">
            {[
              {
                title: "Equal weighting over empirically-derived weighting",
                body: "The composite weights Axis 1 and Axis 2 equally at 50% each. Axis 2 carries marginally stronger full-period signal, but empirical testing shows that tilting the weight toward Axis 2 (e.g., 30/70) improves composite r by approximately 0.007 — a difference that is within bootstrap confidence interval overlap and does not justify abandoning interpretive symmetry. Both axes capture distinct structural dimensions; claiming one deserves 70% weight requires stronger theoretical justification than the data currently provides.",
              },
              {
                title: "First-principles penalties, not optimized penalties",
                body: "The OAL shallowness penalty values were derived from structural reasoning about anchor distance before examining outcomes. This means the cohort separation is a genuine empirical test rather than circular validation. Empirical calibration confirms the penalties are competitive with alternatives (including flat no-penalty and exponential scaling) but not uniquely optimal — the differences are within CI overlap. Their primary justification is structural integrity.",
              },
              {
                title: "Empirical over mathematical sophistication",
                body: "Where simpler measures outperform complex ones against historical data, the simpler measure is used. Axis 2 uses YoY consistency rather than tanh transformation or R-squared trend fitting — both of which were tested and underperformed. Mathematical complexity is not a virtue when it disconnects the measure from the phenomenon it captures.",
              },
              {
                title: "Median over mean as the default summary statistic",
                body: "Median is more resistant to outlier distortion and reports the central tendency honestly. Mean is shown as supplementary information with skew indicators when the gap exceeds 10 percentage points. This prioritizes honest uncertainty over persuasive framing — and matters most precisely where it is most important: in the highest-risk cohort, where mean and median diverge dramatically.",
              },
              {
                title: "Global ranking for cross-sectional comparability",
                body: "Both Axis 1 and Axis 2 are expressed as global percentile ranks across the full universe after anchor penalties are applied. This makes scores directly comparable across companies anchored on different OAL rungs — essential for a framework designed to evaluate structural risk at the universe level.",
              },
              {
                title: "Conservative anchor assignment on a trailing window",
                body: "OAL assignment uses the 3-year cumulative sum of the relevant financial series rather than trailing twelve months. This requires sustained demonstrated performance rather than rewarding a single strong quarter. A company must demonstrate positive 3-year cumulative FCF to qualify for OAL 1. Adjusted metrics, normalized earnings, and forward projections are not considered.",
              },
              {
                title: "Static model — no regime adaptation",
                body: "The composite formula and axis weights do not shift based on market environment or detected volatility regime. Signal strength varies materially across regimes — as the validation section documents — and users operating in a specific environment should apply judgment accordingly. But a model that silently changes its weights is harder to interpret, harder to audit, and more susceptible to overfitting. Stability is a deliberate choice, not an oversight.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="rounded-xl border border-[#DDE0DC] bg-white px-6 py-5">
                <h4 className="text-sm font-semibold text-[#0A1F3D]">{title}</h4>
                <p className="mt-2 text-sm leading-6 text-[#5C6472]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-[#DDE0DC]" />

        {/* ── LIMITATIONS ──────────────────────────────────────────────────── */}
        <section id="limitations">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Section VII</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            Known Limitations
          </h2>
          <p className="mt-5 text-base leading-7 text-[#5C6472]">
            Honest documentation of what this framework cannot do is as
            important as documenting what it can. The following limitations
            are not caveats offered defensively — they are boundaries that
            define the proper scope of interpretation.
          </p>

          <div className="mt-8 space-y-4">
            {[
              {
                title: "OSMR measures structure, not timing",
                body: "The framework cannot identify when a stretched valuation will correct, or when a deteriorating anchor will become visible to the market. A company can remain in Very High structural risk territory for extended periods if the narrative sustaining it remains intact. The pre-2020 inversion period (2017–2019) is the empirical proof of this: the framework correctly identified structurally fragile companies; the market rewarded them anyway for approximately three years before reversing sharply.",
              },
              {
                title: "Signal is conditional on market regime",
                body: "The full-period composite Spearman r of −0.054 (Modest) reflects 17 years that include extended periods of near-zero signal. Pre-2020, the signal was Negligible at the composite level (r = −0.002). The framework is most informative during structural stress and dislocation — COVID, post-COVID rate normalization — and least informative during extended narrative expansion. Users should calibrate expectations accordingly.",
              },
              {
                title: "Potential survivorship bias in pre-2020 data",
                body: "Companies that failed or were delisted before 2020 would almost certainly have scored in the Very High risk bucket. If those failures are underrepresented in the price history, the pre-2020 Q5 penalty is understated — meaning the true pre-2020 signal is likely stronger than reported. The disclosed pre-2020 weakness is probably a conservative lower bound, not the true effect size.",
              },
              {
                title: "Axis 3 applies to the interest-bearing universe only",
                body: "Firms with no interest expense are not assigned an Axis 3 score. Financing risk is undefined in the absence of a financing structure. These firms are labeled 'No Financing Structure' — not assigned a low-risk score. Approximately 16% of the current universe falls outside Axis 3's domain. Their composite score is the normalized mean of Axis 1 and Axis 2. In practice, no-interest firms should be treated as a distinct category with higher uncertainty, not lower risk.",
              },
              {
                title: "The framework does not incorporate sector context",
                body: "A pre-revenue biotech and a pre-profitable consumer staples company both receive OAL 4 assignments. The framework treats them comparably because its mandate is cross-sectional structural risk assessment. Sector context can and should be applied as a layer of interpretation on top of OSMR scores, but it is not embedded in the framework.",
              },
              {
                title: "The framework reflects a single point in time",
                body: "Each snapshot is a static assessment based on three-year trailing figures and available price data. A company can move across OAL rungs and risk quintiles within a single quarter if its operational or market circumstances change materially. The platform refreshes weekly for price-sensitive components and monthly for the full structural pipeline.",
              },
              {
                title: "No transaction cost or market impact modeling",
                body: "All index and backtest figures assume frictionless execution at month-end closing prices. Transaction costs, bid-ask spreads, and market impact are not modeled. For a broad universe with $5M ADV minimum, implementation frictions are manageable but not zero — particularly in the Very Low bucket where constituent counts can be lower in stressed periods.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="rounded-xl border border-[#DDE0DC] bg-[#F7F8F6] px-6 py-5">
                <h4 className="text-sm font-semibold text-[#0A1F3D]">{title}</h4>
                <p className="mt-2 text-sm leading-6 text-[#5C6472]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-[#DDE0DC]" />

        {/* ── CONCLUSION ───────────────────────────────────────────────────── */}
        <section id="conclusion">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Section VIII</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            Conclusion
          </h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-[#5C6472]">
            <p>
              OSMR was built on a specific conviction: most investors lack not
              information but framework — a disciplined way of asking what a
              company has actually demonstrated, and how far its valuation has
              strayed from that demonstration. The framework does not tell
              investors what to buy or sell. It tells them where structural
              risk is concentrated, how stable the operational foundations
              beneath current valuations are, and whether the companies in
              their universe are moving toward or away from demonstrated
              economic viability.
            </p>
            <p>
              The empirical record across 290,902 observations and 17 years
              supports the core hypothesis. The signal is Modest in aggregate
              and Substantive during structural stress. The Very High composite
              bucket produces negative median 12-month returns (−1.5%) with
              a CVaR of −86.2%. Simply removing structurally fragile companies
              from a cap-weighted broad portfolio improved Sortino ratio and
              reduced maximum drawdown materially. The OAL separation —
              FCF vs Revenue median spread of +27.6 percentage points — held
              across all three market regimes tested.
            </p>
            <p>
              The framework is a living system. The backtest window is being
              extended. The penalty structure will be revisited as data
              accumulates. The platform is updated on a monthly and weekly
              cadence. None of this is finished — but it is real, it is
              grounded in empirical performance across full market cycles,
              and it is designed to be honest about what it can and cannot tell us.
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-[#DDE0DC] bg-[#0A1F3D] px-6 py-6">
            <p className="text-base leading-7 text-[#A9BEDF]">
              Stewardship is about conformity to reality. The Capital Steward
              exists because investors are better served by honest structural
              thinking — even when that thinking produces ambiguous answers —
              than by confident narratives that obscure the distance between
              what a company is worth and what it has actually demonstrated.
            </p>
          </div>
        </section>

        <hr className="border-[#DDE0DC]" />

        {/* ── APPENDIX ─────────────────────────────────────────────────────── */}
        <section id="appendix">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Appendix</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            Methodology Summary
          </h2>

          <div className="mt-6 overflow-hidden rounded-xl border border-[#DDE0DC]">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[#DDE0DC]">
                {[
                  {
                    field: "Universe",
                    value: "~5,200 U.S. equity securities (latest snapshot). Data: Financial Modeling Prep (FMP) API. $5M minimum average daily volume filter applied before scoring. Refreshed weekly (snapshot) and monthly (full pipeline).",
                  },
                  {
                    field: "Backtest",
                    value: "290,902 observations · 2009-01 through 2025-02 formation window · 12-month forward return horizon · $5 minimum price filter at formation · bootstrap 95% confidence intervals (1,000 samples).",
                  },
                  {
                    field: "OAL Assignment",
                    value: "Each company evaluated FCF → NI → EBIT → Revenue in sequence; assigned to first qualifying rung based on positive 3-year cumulative figure. Negative EV companies excluded. No adjusted or normalized metrics considered.",
                  },
                  {
                    field: "Axis 1 Formula",
                    value: "log(EV / anchor_3yr) + OAL_shallowness_penalty → global percentile rank (ascending = more risk). Anchor: 3-year cumulative sum of OAL-appropriate series (12 quarters). Penalties: FCF=0, NI=1.0, EBIT=1.618, Rev=4.236.",
                  },
                  {
                    field: "Axis 2 Formula",
                    value: "YoY consistency score across up to 28 quarters of OAL-anchor history + OAL_shallowness_penalty → global percentile rank. Four most recent YoY comparisons receive double weight. Same penalties as Axis 1.",
                  },
                  {
                    field: "Composite Score",
                    value: "(axis1_pct + axis2_pct) / 2. Equal weight. Expressed as percentile rank across full universe. Long-run static model — weights do not shift across market regimes. Axis 3 is a contextual disclosure layer, not included in composite.",
                  },
                  {
                    field: "Axis 3",
                    value: "Interest-bearing universe only. log(anchor / interest_expense) − OAL_penalty → global percentile rank within interest-bearing pool. Firms without interest expense labeled 'No Financing Structure' — excluded from ranking pool. Not included in composite.",
                  },
                  {
                    field: "Bucket Labels",
                    value: "Very Low (0–20th pct) / Low (20–40th) / Moderate (40–60th) / High (60–80th) / Very High (80–100th). Consistent across all axes. Higher bucket always means more structural risk.",
                  },
                  {
                    field: "Index Construction",
                    value: "Equal-weight (EW): simple average of 1-month returns across bucket constituents, monthly rebalancing. Cap-weight (CW): market-cap weighted average. Price filter ≥$5 applied at formation. Transaction costs not modeled.",
                  },
                ].map(({ field, value }) => (
                  <tr key={field} className="bg-white even:bg-[#F7F8F6]">
                    <td className="px-5 py-4 font-semibold text-[#0A1F3D] align-top whitespace-nowrap w-40">
                      {field}
                    </td>
                    <td className="px-5 py-4 text-[#5C6472] leading-6">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div className="rounded-[2rem] border border-[#DDE0DC] bg-white p-8 md:p-10">
          <h3 className="tcs-heading text-2xl font-semibold text-[#0A1F3D]">
            The system is live.
          </h3>
          <p className="mt-3 text-base leading-7 text-[#5C6472]">
            The structural map, cohort grids, and company profiles described
            here are updated on a weekly cadence and accessible in the
            platform now.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/platform"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#153761]"
            >
              Open Platform <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/how-to-use-osmr"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#D4CDBF] bg-[#F7F8F6] px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]"
            >
              How to Use OSMR
            </Link>
          </div>
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="border-t border-[#DDE0DC] py-6 text-center">
        <p className="text-[12px] leading-[1.8] text-[#aaa]">
          The Capital Steward, LLC · thecapitalsteward.com · inquiries@thecapitalsteward.com
          <br />
          © 2026 The Capital Steward, LLC. All rights reserved. For informational
          purposes only. Not investment advice.
        </p>
      </div>

    </main>
  )
}