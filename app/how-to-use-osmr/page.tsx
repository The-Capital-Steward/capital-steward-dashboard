'use client'

import Link from "next/link"
import { ArrowRight, SlidersHorizontal, Activity, BarChart2 } from "lucide-react"

export default function HowToUseOSMR() {
  return (
    <main className="min-h-screen bg-[#F1F3F0] text-[#1E2228]">

      {/* ── HERO ──────────────────────────────────────────────────────────*/}
      <section className="tcs-snap-section border-b border-[#DDE0DC]">
        <div className="mx-auto w-full max-w-7xl px-6 py-10">
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
                How to Use OSMR
              </p>
              <h1 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-5xl">
                How OSMR is used in an investment process.
              </h1>
              <div className="mt-5 max-w-xl space-y-3 text-base leading-7 text-[#5C6472] md:text-lg md:leading-8">
                <p>
                  The system produces three views of market structure: a
                  full-universe map, cohort-level return data by structural
                  regime, and company-level profiles.
                </p>
                <p>
                  Each serves a different function — screening, monitoring,
                  and sizing.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/platform"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#153761]"
                >
                  Open Platform <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#DDE0DC] bg-white p-6 shadow-[0_20px_60px_rgba(10,35,66,0.08)] md:p-8">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
                Three Functions
              </p>
              <div className="mt-4 space-y-3">
                {[
                  {
                    icon: <SlidersHorizontal className="h-4 w-4" />,
                    label: "Screen",
                    desc: "Identify where structural risk is concentrated or absent across the universe.",
                  },
                  {
                    icon: <Activity className="h-4 w-4" />,
                    label: "Monitor",
                    desc: "Track anchor trajectory over time for positions under consideration or held.",
                  },
                  {
                    icon: <BarChart2 className="h-4 w-4" />,
                    label: "Size",
                    desc: "Let structural context inform how much exposure a position warrants.",
                  },
                ].map(({ icon, label, desc }) => (
                  <div
                    key={label}
                    className="flex items-start gap-4 rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-4"
                  >
                    <div className="mt-0.5 inline-flex shrink-0 rounded-xl bg-[#E8EFE9] p-2 text-[#244636]">
                      {icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#0A1F3D]">{label}</div>
                      <div className="mt-0.5 text-sm leading-6 text-[#5C6472]">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SCREEN ────────────────────────────────────────────────────────*/}
      <section className="tcs-snap-section border-b border-[#DDE0DC]">
        <div className="mx-auto w-full max-w-7xl px-6 py-10">
          <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-start">

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
                Function One
              </p>
              <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-4xl">
                Screen.
              </h2>
              <div className="mt-5 space-y-4 text-base leading-7 text-[#5C6472] md:leading-8">
                <p>
                  The structural market map scores the full U.S.-listed equity
                  universe across all three axes simultaneously. The result is a
                  cross-sectional view of where structural risk is concentrated
                  and where it is absent — updated weekly.
                </p>
                <p>
                  Composite bucket filters and OAL-level filters allow
                  segmentation by structural regime. The cohort return data
                  shows what has historically happened to companies in each
                  zone over a 12-month forward horizon — across 290,902
                  observations from 2009 through 2026.
                </p>
                <p>
                  This is where the process starts: not with a stock, but with
                  a structural map of the market. You identify the zones worth
                  examining before you examine anything inside them.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[#DDE0DC] bg-white p-6 shadow-[0_12px_32px_rgba(10,35,66,0.05)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#0A1F3D]">Market-level view</div>
                  <div className="rounded-full bg-[#E8EFE9] px-3 py-1 text-xs font-medium text-[#244636]">
                    All subscribers
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    "Full-universe structural map across all three axes",
                    "Cohort return data by structural regime",
                    "Composite bucket and OAL-level filters",
                    "Historical cohort trends over time",
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2.5 text-sm leading-6 text-[#5C6472]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4CAF7D]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#DDE0DC] bg-white p-6 shadow-[0_12px_32px_rgba(10,35,66,0.05)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-semibold text-[#0A1F3D]">Company-level resolution</div>
                  <div className="rounded-full border border-[#DDE0DC] bg-white px-3 py-1 text-xs font-medium text-[#5C6472]">
                    Paid subscribers
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    "Individual ticker structural profiles",
                    "Per-company axis scores and percentile rankings",
                    "Stock-level drilldown within cohort context",
                    "Anchor trajectory history by company",
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2.5 text-sm leading-6 text-[#5C6472]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0A1F3D]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── MONITOR ───────────────────────────────────────────────────────*/}
      <section className="tcs-snap-section border-b border-[#0D2440] bg-[#0A1F3D]">
        <div className="mx-auto w-full max-w-7xl px-6 py-10">
          <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-start">

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
                Function Two
              </p>
              <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl">
                Monitor.
              </h2>
              <div className="mt-5 space-y-4 text-base leading-7 text-[#A9BEDF] md:leading-8">
                <p>
                  Structural risk is not static. A company's anchor can improve
                  or deteriorate over time — and that trajectory is often visible
                  in the data before it shows up in price.
                </p>
                <p>
                  The platform tracks axis scores over time, so changes in
                  operational trajectory are visible across weekly snapshots and
                  monthly structural recalibrations. A position that was
                  structurally sound at entry may not remain so. A company
                  approaching FCF generation from a weaker anchor is moving in
                  the right direction — and that shift appears in the structural
                  data before it becomes consensus.
                </p>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  {
                    title: "Anchor trajectory",
                    desc: "Whether the firm's operational foundation is improving or deteriorating — not just where it stands today.",
                  },
                  {
                    title: "Regime changes",
                    desc: "When a company moves between structural risk zones — a signal that its narrative load is shifting in either direction.",
                  },
                  {
                    title: "Weekly snapshot refresh",
                    desc: "Scores update weekly so deterioration is visible before it reprices. Monthly recalibrations rebuild the full structural picture.",
                  },
                  {
                    title: "Historical context",
                    desc: "Where the company has been structurally, not just where it is. Trajectory without history is incomplete.",
                  },
                ].map(({ title, desc }) => (
                  <div key={title} className="rounded-2xl border border-[#1E3A5F] bg-[#0D2847] p-5">
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="mt-1.5 text-sm leading-6 text-[#7A9FCA]">{desc}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-[#1E3A5F] bg-[#071629] p-5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#A9BEDF]">
                  A repeatable review cadence
                </p>
                <div className="mt-3 space-y-2.5">
                  {[
                    {
                      cadence: "Weekly",
                      action: "Check snapshot refresh for trajectory changes in positions under consideration. Note any company that has moved to a higher structural risk zone.",
                    },
                    {
                      cadence: "Monthly",
                      action: "Review full structural recalibration. Revisit any position whose composite score has shifted materially from the time of entry.",
                    },
                    {
                      cadence: "Before entry",
                      action: "Screen the target company against its cohort. Understand which structural zone it occupies and what the historical return distribution looks like in that zone.",
                    },
                    {
                      cadence: "After deterioration",
                      action: "When a held position's anchor trajectory weakens, re-examine the sizing decision with updated structural context.",
                    },
                  ].map(({ cadence, action }) => (
                    <div key={cadence} className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 rounded-lg bg-[#0D2847] px-2.5 py-1 text-xs font-semibold text-[#A9BEDF]">
                        {cadence}
                      </span>
                      <span className="text-sm leading-6 text-[#7A9FCA]">{action}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-5 text-[#4A6A8A]">
                  This cadence is a suggested review structure, not a mechanical decision rule.
                  OSMR does not contain exit thresholds or position triggers — those decisions
                  depend on mandate and context the framework cannot observe.
                </p>
              </div>

              <p className="mt-4 text-xs leading-5 text-[#4A6A8A]">
                Watchlist functionality — tracking a defined set of companies against
                their structural evolution — is part of the platform roadmap.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── SIZE ──────────────────────────────────────────────────────────*/}
      <section className="tcs-snap-section border-b border-[#DDE0DC]">
        <div className="mx-auto w-full max-w-7xl px-6 py-10">
          <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-start">

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
                Function Three
              </p>
              <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-4xl">
                Size.
              </h2>
              <div className="mt-5 space-y-4 text-base leading-7 text-[#5C6472] md:leading-8">
                <p>
                  Structural risk scores do not determine position size. They
                  inform it. The data shows what has historically happened to
                  companies at each structural risk level — and that record is
                  part of the information available when sizing any position.
                </p>
                <p>
                  A company whose operational trajectory is deteriorating —
                  whose anchor is weakening rather than strengthening — sits
                  in a zone where the historical return distribution has been
                  consistently weak. That is not a prediction. It is structural
                  context that belongs in any honest sizing decision.
                </p>
                <p>
                  The platform makes that context visible. No sizing rules
                  are embedded in the framework. What the investor does with
                  the data is theirs to determine.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDE0DC] bg-white p-6 shadow-[0_12px_32px_rgba(10,35,66,0.05)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
                What the data shows
              </p>
              <p className="mt-2 text-sm text-[#5C6472]">
                Median 12-month forward returns by composite risk bucket.
                290,902 observations · 2009–2026 · $5M ADV liquidity filter.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  { label: "Very Low composite risk",  value: "+10.3%", color: "#244636", width: "78%",  negative: false },
                  { label: "Low composite risk",       value: "+9.6%",  color: "#6DAE8B", width: "70%",  negative: false },
                  { label: "Moderate composite risk",  value: "+9.2%",  color: "#8A92A0", width: "65%",  negative: false },
                  { label: "High composite risk",      value: "+8.9%",  color: "#C47B5F", width: "60%",  negative: false },
                  { label: "Very High composite risk", value: "−1.5%",  color: "#8B3A2A", width: "8%",   negative: true  },
                ].map(({ label, value, color, width, negative }) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-[#5C6472]">{label}</span>
                      <span className={`font-semibold ${negative ? "text-[#8B3A2A]" : "text-[#244636]"}`}>
                        {value}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#F1F3F0]">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width, backgroundColor: color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-[#DDE0DC] bg-[#F7F8F6] px-4 py-3">
                <p className="text-xs leading-5 text-[#8A92A0]">
                  The signal is concentrated in the Very High bucket — median returns
                  of −1.5% with a CVaR of −86.2% and 31.1% of observations below −25%.
                  Q1 through Q4 are largely undifferentiated on median return.
                  This is a loss-avoidance framework, not a return-optimization engine.
                  Past structural patterns do not guarantee future outcomes.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────*/}
      <section className="tcs-snap-section">
        <div className="mx-auto w-full max-w-5xl px-6 py-10">
          <div className="rounded-[2rem] border border-[#DDE0DC] bg-white p-8 shadow-[0_12px_32px_rgba(10,35,66,0.05)] md:p-12">

            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              The Platform
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-4xl">
              The system is live. The data is current.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5C6472] md:text-lg md:leading-8">
              The structural market map, cohort return grids, and company-level
              profiles are updated on a weekly cadence. What's described on this
              page is accessible now.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/platform"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#153761]"
              >
                Open Platform <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/osmr-methodology"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#D4CDBF] bg-[#F7F8F6] px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]"
              >
                Methodology
              </Link>
            </div>

          </div>

          <div className="mt-10 border-t border-[#DDE0DC] pt-6 text-center">
            <p className="text-[12px] leading-[1.8] text-[#aaa]">
              The Capital Steward, LLC · thecapitalsteward.com · inquiries@thecapitalsteward.com
              <br />
              © 2026 The Capital Steward, LLC. All rights reserved. For informational purposes only. Not investment advice.
            </p>
          </div>

        </div>
      </section>

    </main>
  )
}