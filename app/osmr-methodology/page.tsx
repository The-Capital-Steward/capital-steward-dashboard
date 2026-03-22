'use client'

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"

// ── OAL ladder data ──────────────────────────────────────────────────────────
const OAL_RUNGS = [
  {
    code: "FCF",
    label: "OAL 1 — Free Cash Flow",
    desc: "Positive TTM FCF · Deepest credible anchor",
    count: "~2,900 cos.",
    color: "#244636",
    bg: "#E8EFE9",
    border: "#C9D8CD",
    solid: true,
  },
  {
    code: "NI",
    label: "OAL 2 — Net Income",
    desc: "Positive TTM Net Income · Profitable but not FCF-positive",
    count: "~622 cos.",
    color: "#2D5A8E",
    bg: "#EAF0F8",
    border: "#C5D4E8",
    solid: true,
  },
  {
    code: "EBIT",
    label: "OAL 3 — EBIT",
    desc: "Positive TTM EBIT · Covers operations before interest & tax",
    count: "~111 cos.",
    color: "#7A5C2E",
    bg: "#F5EFE6",
    border: "#E0CEB0",
    solid: true,
  },
  {
    code: "Rev",
    label: "OAL 4 — Revenue",
    desc: "Positive TTM Revenue · Cannot cover operating costs",
    count: "~1,163 cos.",
    color: "#8B3A2A",
    bg: "#F8EEEC",
    border: "#E8C8C0",
    solid: true,
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
  },
]

// ── Axis accordion ───────────────────────────────────────────────────────────
const AXES = [
  {
    id: "axis1",
    label: "Axis 1",
    name: "Operational Anchor Risk",
    question: "How deep is the operational support behind the valuation?",
    body: `Axis 1 measures the distance between a company's current Enterprise Value and its deepest credible operational anchor, adjusted for the shallowness of that anchor.

The formula: log(EV / anchor) + AXIS1_ANCHOR_PENALTY → global rank.

The logarithm compresses extreme multiples while preserving ordinal relationships and preventing outliers from distorting the global ranking. Two companies can have identical raw multiples but very different Axis 1 scores if they are anchored on different OAL rungs. The shallowness penalty encodes this: a revenue-anchor company is treated as approximately 13.5× more expensive relative to its anchor than an FCF-anchor company at the same raw multiple.`,
  },
  {
    id: "axis2",
    label: "Axis 2",
    name: "Operational Trajectory Risk",
    question: "Is that operational foundation improving or deteriorating?",
    body: `Axis 2 captures trajectory, not position. A company moving toward demonstrated cash generation is shortening its narrative bridge. A company whose anchor metric is deteriorating is lengthening it — accumulating structural risk regardless of where its price currently sits.

The score is derived from year-over-year comparisons across multiple years of quarterly history, adjusted by an OAL shallowness penalty and ranked globally. The four most recent year-over-year comparisons receive double weight — what a company is doing now is more relevant to current structural risk than what it was doing six years ago.

Design note: YoY consistency outperformed tanh transformation and R-squared trend fitting against historical data. The simpler measure was used. Mathematical complexity is not a virtue in itself.`,
  },
  {
    id: "axis3",
    label: "Axis 3",
    name: "Operational Financing Risk",
    question: "Can the firm meet its obligations from actual operational output?",
    body: `Axis 3 assesses whether a firm can service its financing obligations from its actual operational output — not from accounting constructs, narrative projections, or asset sales.

Debt is not inherently fragile. A mature firm running significant debt with strong operational coverage is structurally sound. What creates fragility is the gap between what a firm owes and what it can credibly produce to service it. Axis 3 measures that gap directly.

Three-tier financing risk assessment based on interest obligation coverage relative to operational output. No OAL shallowness penalty is applied to Axis 3 — financing fragility is assessed on its own terms.`,
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
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-6 border-t border-[#DDE0DC]">
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-[#8A92A0]">{question}</p>
                <div className="mt-3 space-y-3 text-base leading-7 text-[#5C6472] whitespace-pre-line">
                  {body.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Section index ────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "framing",     label: "Framing" },
  { id: "problem",     label: "The Problem" },
  { id: "oal",         label: "Operational Anchor Ladder" },
  { id: "axes",        label: "The Three Axes" },
  { id: "validation",  label: "Validation" },
  { id: "principles",  label: "Design Principles" },
  { id: "limitations", label: "Limitations" },
  { id: "conclusion",  label: "Conclusion" },
  { id: "appendix",    label: "Appendix" },
]

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
            asks a different question: how well-grounded is that valuation in what
            the company has actually demonstrated? The gap between these two
            questions is where structural investment risk accumulates before it
            becomes visible.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#8A92A0]">
            <span>~5,200 companies · current universe snapshot</span>
            <span>~270,000 historical observations</span>
          </div>

          {/* Section index */}
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
              The financials participants choose to focus on are selected because
              they better support a narrative — not because they represent the
              firm's economic reality. A company will point to the deepest
              operational anchor it can credibly claim. If it can justify its
              valuation with free cash flow, it will. If it cannot, it ascends the
              financial statement — to earnings, to operating income, to revenue —
              until it finds a metric the market will accept. Each step up the
              ladder lengthens the narrative bridge between price and economic
              reality.
            </p>
            <p>
              The Capital Steward exists to measure that bridge — and to identify
              where it has grown too long to hold. Narratives are constrained by
              structure. Valuations must ultimately reconcile with operating
              reality. Cash generation cannot be substituted indefinitely.
              Financial obligations must be met. A company with robust, deep
              operational anchoring does not need narrative to justify its price.
              Structure eventually speaks for itself.
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
              Every stock price is a statement of belief. When a market assigns a
              company an enterprise value of $10 billion, it is not recording a
              fact — it is expressing a judgment about what the company's future
              cash generation will justify. That judgment is, at its core, a
              narrative.
            </p>
            <p>
              This is not a criticism. Narrative is inseparable from valuation. No
              financial statement reports the future. Every multiple —
              price-to-earnings, EV-to-EBITDA, price-to-sales — is a
              present-value claim about future performance, and the specific future
              invoked is always a story. The multiple is the price of believing the
              story.
            </p>
            <p>
              Standard valuation analysis typically focuses on whether the story is
              plausible and whether the price is fair given the story. What it
              rarely asks is: what happens to the valuation if the story stops
              being believed? And how far is the story from anything the company
              has actually demonstrated?
            </p>
          </div>

          <div className="mt-8 rounded-xl border-l-4 border-[#244636] bg-white px-6 py-5">
            <p className="text-sm font-medium text-[#0A1F3D] leading-6">
              There is a meaningful difference between a company valued at 40×
              free cash flow and a company valued at 40× revenue. Both trade at
              the same nominal multiple. But the first has already demonstrated
              the ability to convert revenue into cash after all obligations. The
              second's valuation depends entirely on the market continuing to
              believe it will eventually do something it has not yet done.
            </p>
          </div>

          <div className="mt-8 space-y-4 text-base leading-7 text-[#5C6472]">
            <p>
              Pure fundamental analysis assumes markets will eventually price
              fundamentals correctly. This is not wrong — but it is incomplete. It
              does not give the investor any way to assess how far a given
              company's valuation already is from reality, or how long the
              narrative sustaining that gap is likely to hold.
            </p>
            <p>
              Technical analysis largely inverts the problem: it treats price
              action as the primary signal and asks what the market is doing, not
              what the company is doing. Price action reflects the narrative in
              motion. It does not measure the structural distance between the
              narrative and the operational reality beneath it.
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-[#DDE0DC] bg-[#F7F8F6] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0] mb-2">
              Where fragility hides
            </p>
            <ul className="space-y-2 text-sm leading-6 text-[#5C6472]">
              {[
                "Valuations persist despite weakening operational anchors.",
                "Profitability masks deteriorating cash generation.",
                "Balance sheets quietly absorb risk until they cannot.",
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6DAE8B]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-xl border border-[#DDE0DC] bg-[#0A1F3D] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A9BEDF] mb-2">
              A note on scope
            </p>
            <p className="text-sm leading-6 text-[#A9BEDF]">
              OSMR does not claim to identify mispriced securities or predict
              return outcomes. A company with very high structural risk may
              continue to appreciate for months or years if the narrative
              sustaining its valuation remains intact. The framework measures the
              structure of risk, not its timing — a distinction this document will
              return to throughout.
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
              The Operational Anchor Ladder (OAL) is the governance construct at
              the heart of OSMR. It answers a single question for every company in
              the universe: <em>what is the deepest, most credible financial rung
              this company has actually demonstrated?</em>
            </p>
            <p>
              The word <em>deepest</em> is deliberate. It refers not to the size
              of the financial figure but to its proximity to actual cash
              generation. Free cash flow is the deepest anchor because it
              represents what a company has genuinely produced, with no accounting
              adjustments standing between the figure and real economic output.
              Revenue is the shallowest anchor because it tells us only that the
              company sold something, not whether that sale moved it any closer to
              economic viability.
            </p>
          </div>

          {/* OAL ladder visual */}
          <div className="mt-8 rounded-xl border border-[#DDE0DC] bg-white overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-[#DDE0DC]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0]">
                Operational Anchor Ladder
              </p>
              <p className="mt-1 text-xs text-[#8A92A0]">
                Strongest support → most narrative-dependent
              </p>
            </div>
            <div>
              {OAL_RUNGS.map(({ code, label, desc, count, color, bg, border, solid }, i) => (
                <div key={code}>
                  <div
                    className={`flex items-center justify-between px-6 py-4 ${!solid ? 'opacity-60' : ''}`}
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-bold"
                        style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
                      >
                        {code}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-[#0A1F3D]">{label}</div>
                        <div className="text-xs text-[#8A92A0] mt-0.5">{desc}</div>
                      </div>
                    </div>
                    <span className="text-xs text-[#8A92A0] shrink-0 ml-4">{count}</span>
                  </div>
                  {i < OAL_RUNGS.length - 1 && (
                    <div className="flex justify-center py-1 text-[#DDE0DC]">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-[#DDE0DC] bg-[#F7F8F6]">
              <p className="text-xs text-center text-[#5C6472]">
                Each step up increases narrative dependence — and structural risk.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-base leading-7 text-[#5C6472]">
            <h3 className="text-lg font-semibold text-[#0A1F3D]">The Assignment Logic</h3>
            <p>
              Each company is evaluated against the OAL rungs in descending order
              — FCF first, then Net Income, then EBIT, then Revenue — and assigned
              to the first rung it qualifies for. This is an intentionally
              conservative design. The framework assigns credit only for what has
              been demonstrated in the trailing period, using reported financials.
              Adjusted metrics, normalized earnings, and forward projections are
              not considered.
            </p>

            <h3 className="text-lg font-semibold text-[#0A1F3D]">The Shallowness Penalty</h3>
            <p>
              The most important conceptual innovation in OSMR is the shallowness
              penalty: a proportional risk adjustment applied across two of the
              three axes based on the depth of a company's OAL assignment. Two
              companies trading at the same enterprise value multiple are not
              comparably risky if they are anchored on different OAL rungs.
            </p>
            <p>
              The penalty increases proportionally as the anchor becomes shallower
              — from no penalty at FCF, through incremental adjustments at Net
              Income and EBIT, to the highest adjustment at Revenue. After
              adjustment, a revenue-anchor company is treated as approximately
              13.5× more expensive relative to its anchor than an FCF-anchor
              company at the same raw multiple.
            </p>
          </div>

          <div className="mt-6 rounded-xl border-l-4 border-[#244636] bg-white px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0] mb-2">
              Design principle
            </p>
            <p className="text-sm leading-6 text-[#5C6472]">
              The shallowness penalty encodes the core thesis: the further a
              company is from demonstrated cash generation, the more its valuation
              depends on narrative sustaining rather than reality compounding.
              Penalty is not punishment — it is structural information.
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
              measuring different dimensions of the same structural condition: the
              relationship between a company's valuation and its operational
              reality. All three axes speak to the same OAL anchor throughout.
            </p>
            <p>
              The Composite Structural Risk score is the mean of all available
              axis scores, expressed as a percentile rank across the universe.
              Bucket labels are consistent across all axes: Very Low / Low /
              Moderate / High / Very High — where Very High always means more
              structural risk.
            </p>
          </div>

          <div className="mt-8">
            <AxisAccordion />
          </div>
        </section>

        <hr className="border-[#DDE0DC]" />

        {/* ── VALIDATION ──────────────────────────────────────────────────── */}
        <section id="validation">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Section IV</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            Empirical Validation
          </h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-[#5C6472]">
            <p>
              A scoring framework without empirical grounding is a hypothesis.
              OSMR has been validated against ~270,000 historical observations
              spanning multiple market cycles, testing whether structural risk
              classifications have any measurable relationship with subsequent
              return distributions.
            </p>
            <p>
              The validation does not attempt to demonstrate predictive precision.
              It examines whether different structural risk profiles produce
              meaningfully different distributions of subsequent outcomes — which
              is a weaker and more honest claim than prediction.
            </p>
          </div>

          <div className="mt-8 space-y-4 text-base leading-7 text-[#5C6472]">
            <h3 className="text-lg font-semibold text-[#0A1F3D]">Cohort Grid Structure</h3>
            <p>
              The cohort grid maps 12-month forward returns against OSMR
              structural risk classifications: 3 panels (Low / Moderate / High
              Fragility) × 5 Axis 1 buckets × 5 Axis 2 buckets = 75 cells per
              panel. Each cell displays median return (primary), mean return with
              skew indicators when |mean − median| exceeds 10 percentage points,
              hit rate, and observation count.
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-[#DDE0DC] bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-[#DDE0DC]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0]">
                Key finding — Mean/Median gap
              </p>
              <p className="mt-1 text-sm text-[#5C6472]">
                Highest-risk intersection: High Fragility / Very High Axis 1 / Very High Axis 2
              </p>
            </div>
            <div className="divide-y divide-[#DDE0DC]">
              {[
                { metric: "Mean 12-month return",   value: "+8.9%",  note: "Pulled upward by a subset of large positive outcomes" },
                { metric: "Median 12-month return",  value: "−7.8%", note: "Typical outcome for the majority of observations" },
                { metric: "Mean − Median gap",       value: "16.7 pp", note: "Positive skew; mean overstates the central tendency" },
                { metric: "Hit rate",                value: "42.1%",  note: "Majority of observations had negative 12-month returns" },
                { metric: "Observations (N)",        value: "3,169",  note: "Statistically robust sample" },
              ].map(({ metric, value, note }) => (
                <div key={metric} className="grid grid-cols-[1fr_auto_2fr] items-center gap-4 px-6 py-3 text-sm">
                  <span className="text-[#5C6472]">{metric}</span>
                  <span className="font-semibold text-[#0A1F3D]">{value}</span>
                  <span className="text-[#8A92A0]">{note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border-l-4 border-[#8B3A2A] bg-white px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A92A0] mb-2">
              Key finding
            </p>
            <p className="text-sm leading-6 text-[#5C6472]">
              The highest-risk cohort — High Fragility / Very High Axis 1 / Very
              High Axis 2 — produced a median 12-month return of −7.8% across
              3,169 observations, with only 42% of outcomes positive. The mean of
              +8.9% is pulled upward by a subset of large positive outcomes. Using
              mean as the headline figure here would be misleading — it would make
              the highest-risk cohort appear marginally attractive when the typical
              outcome was a loss.
            </p>
          </div>

          <div className="mt-8 space-y-4 text-base leading-7 text-[#5C6472]">
            <h3 className="text-lg font-semibold text-[#0A1F3D]">Why Median Is the Primary Metric</h3>
            <p>
              The decision to lead with median rather than mean is not merely
              statistical — it is philosophical. The median reports the outcome
              for a typical investor who held a typical security from this cohort
              for twelve months. The mean reports what they would have received if
              they had held the entire cohort in equal weight — which requires
              predicting, in advance, who the outliers are.
            </p>
            <p>
              In the highest-risk cohort, the mean is positive while the median is
              negative. A framework that reported mean as its primary metric would
              present this cohort as marginally worth holding. The median tells the
              honest story: most investors in this cohort lost money over the
              following twelve months. The framework shows mean with skew
              indicators when the gap is material, so readers can see both the
              central tendency and the tail.
            </p>
          </div>
        </section>

        <hr className="border-[#DDE0DC]" />

        {/* ── DESIGN PRINCIPLES ────────────────────────────────────────────── */}
        <section id="principles">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Section V</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            Design Principles
          </h2>
          <p className="mt-5 text-base leading-7 text-[#5C6472]">
            Every analytical framework makes design choices. The choices made in
            OSMR reflect a specific set of priorities. These are not implementation
            details — they are the constraints that define what the framework is
            allowed to claim.
          </p>

          <div className="mt-8 space-y-4">
            {[
              {
                title: "Empirical over mathematical sophistication",
                body: "Where simpler measures outperform complex ones against historical data, the simpler measure is used. This applies most directly to Axis 2, where YoY consistency outperformed tanh transformation and R-squared trend fitting. Mathematical complexity is not a virtue in itself — it becomes a vice when it disconnects the measure from the economic phenomenon it is trying to capture.",
              },
              {
                title: "Median over mean as the default summary statistic",
                body: "Median is more resistant to outlier distortion and reports the central tendency honestly. Mean is shown as supplementary information with skew indicators when the gap is material. This prioritizes honest uncertainty over persuasive framing.",
              },
              {
                title: "Global ranking for cross-sectional comparability",
                body: "Both Axis 1 and Axis 2 are expressed as global percentile ranks across the full universe after anchor penalties are applied. This makes scores comparable across companies anchored on different OAL rungs — essential for a framework designed to evaluate structural risk at the universe level.",
              },
              {
                title: "Conservative anchor assignment",
                body: "A company must demonstrate positive TTM performance at each rung to qualify for it. Adjusted metrics, normalized earnings, and forward projections are not considered. The framework assigns credit only for what has been demonstrated in the trailing period, using reported financials.",
              },
              {
                title: "Double weight on recent trajectory",
                body: "The four most recent year-over-year comparisons in Axis 2 receive double weight. What a company is doing now is more relevant to current structural risk than what it was doing six years ago. This is an empirical judgment — disclosed explicitly so readers can evaluate it.",
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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Section V — continued</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            Known Limitations
          </h2>
          <p className="mt-5 text-base leading-7 text-[#5C6472]">
            Honest documentation of what this framework cannot do is as important
            as documenting what it can.
          </p>

          <div className="mt-8 space-y-4">
            {[
              {
                title: "OSMR measures structure, not timing",
                body: "The framework cannot identify when a stretched valuation will correct, or when a deteriorating anchor will become visible to the market. A company can remain in Very High structural risk territory for extended periods if the narrative sustaining it remains intact.",
              },
              {
                title: "The framework reflects a single point in time",
                body: "Each snapshot is a static assessment based on trailing twelve-month figures and available price data. A company can move across OAL rungs and risk quintiles within a single quarter if its operational or market circumstances change materially.",
              },
              {
                title: "Cohort validation is primarily OAL 1-anchored in its current form",
                body: "The full cohort grid was built on FCF-anchored companies (OAL 1), which represent the largest and most historically stable cohort. Extension to OAL 2–4 companies is in progress. Until that work is complete, the empirical validation should be understood as most robust for the FCF-anchored universe.",
              },
              {
                title: "Shallowness penalties are calibrated by judgment, not optimization",
                body: "The specific penalty values were derived from first-principles reasoning about the structural distance between OAL rungs, not from optimization against historical returns. The calibration will be revisited as more historical data accumulates.",
              },
              {
                title: "OSMR does not incorporate sector context",
                body: "A biotech company pre-revenue and a consumer staples company pre-profitability occupy very different structural contexts, even if they share an OAL 4 assignment. The framework treats them comparably because its mandate is cross-sectional structural risk assessment. Sector context can and should be applied as a layer of interpretation, but it is not embedded in the scores.",
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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6DAE8B]">Section VI</p>
          <h2 className="tcs-heading mt-2 text-2xl font-semibold text-[#0A1F3D] md:text-3xl">
            Conclusion
          </h2>
          <div className="mt-5 space-y-4 text-base leading-7 text-[#5C6472]">
            <p>
              The Capital Steward was built on a simple conviction: that most
              investors lack not information but framework — a disciplined way of
              asking what a company has actually demonstrated, and how far its
              valuation has strayed from that demonstration. OSMR is the
              operational expression of that conviction.
            </p>
            <p>
              The framework does not tell investors what to buy or sell. It tells
              them where structural risk is concentrated, how stable the
              operational foundations beneath current valuations are, and whether
              the companies in their universe are moving toward or away from
              demonstrated economic viability.
            </p>
            <p>
              The framework is a living system. The OAL coverage is being
              extended. The cohort validation is being deepened. The penalty
              structure will be revisited as more historical data accumulates. The
              platform is updated monthly for structural changes and weekly for
              snapshot refreshes. None of this is finished — but it is real, it is
              grounded in empirical performance, and it is designed to be honest
              about what it can and cannot tell us.
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-[#DDE0DC] bg-[#0A1F3D] px-6 py-6">
            <p className="text-base leading-7 text-[#A9BEDF]">
              Stewardship is about conformity to reality. The Capital Steward
              exists because investors are better served by honest structural
              thinking — even when that thinking produces ambiguous answers —
              than by confident narratives that obscure the distance between what
              a company is worth and what it has actually demonstrated.
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
                    value: "~4,800 U.S. equity securities (latest snapshot). Data source: Financial Modeling Prep (FMP) API. Updated monthly (full pipeline) and weekly (snapshot refresh).",
                  },
                  {
                    field: "OAL Assignment",
                    value: "Each company evaluated FCF → NI → EBIT → Revenue in sequence; assigned to highest qualifying rung based on positive TTM figure. Negative EV companies excluded.",
                  },
                  {
                    field: "Axis 1 Formula",
                    value: "Log-transformed EV-to-anchor ratio, adjusted by an OAL shallowness penalty and ranked globally across the universe.",
                  },
                  {
                    field: "Axis 2 Formula",
                    value: "Anchor consistency score derived from year-over-year comparisons across multiple years of quarterly history, adjusted by an OAL shallowness penalty and ranked globally. Recent trajectory receives double weight.",
                  },
                  {
                    field: "Axis 3",
                    value: "Three-tier financing risk assessment based on interest obligation coverage relative to operational output. No OAL shallowness penalty applied.",
                  },
                  {
                    field: "Composite Score",
                    value: "Mean of all available axis scores. Displayed as a percentile rank across the full universe.",
                  },
                  {
                    field: "Cohort Grid",
                    value: "~270,000 historical observations. 12-month forward horizon. 3 panels × 5 Axis 1 × 5 Axis 2 = 75 cells per panel. Rebuilt monthly; values reflect latest completed cycle. Default metric: median return.",
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
            The structural map, cohort grids, and company profiles described here
            are updated on a weekly cadence and accessible in the platform now.
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
          © 2026 The Capital Steward, LLC. All rights reserved. For informational purposes only. Not investment advice.
        </p>
      </div>

    </main>
  )
}