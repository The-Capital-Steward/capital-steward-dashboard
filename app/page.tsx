'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type SiteStats = {
  universe: { total: number }
  high_risk_cluster: { pct_of_universe: number; revenue_anchored_pct: number }
  low_risk_cluster: { pct_of_universe: number; fcf_anchored_pct: number }
  cohort_returns?: { total_observations: number }
} | null

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

function useSystemStats(): SiteStats {
  const [stats, setStats] = useState<SiteStats>(null)
  useEffect(() => {
    fetch("/data/key_system_stats.json")
      .then(r => r.json())
      .then(setStats)
      .catch(() => null)
  }, [])
  return stats
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS DOT
// ─────────────────────────────────────────────────────────────────────────────

function StatusDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4CAF7D] opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4CAF7D]" />
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RISK CARDS — dark band accordion
// ─────────────────────────────────────────────────────────────────────────────

const RISK_CARDS = [
  {
    title: "Anchor Risk",
    summary: "The further a valuation reaches beyond credible operational output, the more narrative is required to sustain it — and the more vulnerable it is to deflation.",
    detail: "A firm will use the deepest operational anchor it can credibly claim to justify its valuation. If free cash flow supports that valuation, the bridge between price and economic reality is short. If the market must reach to revenue — or beyond — the bridge grows long, fragile, and dependent on conditions outside the firm's control.",
  },
  {
    title: "Trajectory Risk",
    summary: "A firm whose anchor is consistently improving is shortening its narrative bridge. One whose anchor is deteriorating is lengthening it — regardless of where its price sits today.",
    detail: "This dimension captures trajectory, not just position. A company moving toward demonstrated cash generation is reducing its structural risk over time. A company whose anchor metric is deteriorating is accumulating structural risk regardless of where its price currently sits.",
  },
  {
    title: "Financing Risk",
    summary: "Whether a firm can service its financing obligations from its actual operational output — not from accounting constructs, narrative projections, or asset sales.",
    detail: "Debt is not inherently fragile. A mature firm running significant debt with strong coverage from operational output is structurally sound. What creates fragility is the gap between what a firm owes and what it can credibly produce to service it.",
  },
]

function RiskCards() {
  const [expanded, setExpanded] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-2">
      {RISK_CARDS.map(({ title, summary, detail }) => {
        const isOpen = expanded === title
        return (
          <button
            key={title}
            onClick={() => setExpanded(isOpen ? null : title)}
            className="w-full rounded-2xl border border-[#1E3A5F] bg-[#0D2847] p-5 text-left transition-all duration-200 hover:border-[#2E5A8F] hover:bg-[#0F2E52]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-[13px] font-semibold text-white">{title}</div>
              <svg
                width="13" height="13" viewBox="0 0 13 13" fill="none"
                className="mt-0.5 shrink-0 text-[#A9BEDF] transition-transform duration-200"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <path d="M2 5l4.5 4.5L11 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="mt-2 text-[13px] leading-[1.7] text-[#A9BEDF]">{summary}</p>
            {isOpen && (
              <p className="mt-4 border-t border-[#1E3A5F] pt-4 text-[13px] leading-[1.7] text-[#7A9FCA]">
                {detail}
              </p>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI STRIP
// Numbers locked from methodology page (290,902 obs · 2009–2026 backtest):
//   universe:     live from key_system_stats.json, fallback ~5,200
//   observations: live from key_system_stats.json, fallback 290,902
//   elevated:     live from key_system_stats.json, fallback 16.1%
//   spread:       +27.6pp — static, from validated backtest suite
// ─────────────────────────────────────────────────────────────────────────────

function KPIStrip({ stats }: { stats: SiteStats }) {
  const universe = stats
    ? stats.universe.total.toLocaleString()
    : "5,200"
  const observations = stats?.cohort_returns
    ? stats.cohort_returns.total_observations.toLocaleString()
    : "290,902"
  const elevatedPct = stats
    ? `${stats.high_risk_cluster.pct_of_universe}%`
    : "16.1%"

  return (
    <section className="border-b border-[#D0D4CF] bg-[#F1F3F0] px-6 py-11">
      <div className="mx-auto max-w-7xl">

        <div className="flex items-start">

          {/* Universe */}
          <div className="min-w-0 flex-1 pr-7">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A92A0]">
              Universe
            </p>
            <p className="font-serif text-[clamp(26px,3vw,42px)] font-normal leading-none tracking-[-0.015em] text-[#0A1F3D]">
              {universe}
            </p>
            <p className="mt-2 text-[12.5px] leading-[1.55] text-[#5C6472]">
              U.S.-listed equities scored across all three structural axes
            </p>
          </div>

          <div className="mx-1 w-px self-stretch bg-[#D0D4CF]" />

          {/* Observations */}
          <div className="min-w-0 flex-[1.2] px-7">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A92A0]">
              Cohort observations
            </p>
            <p className="font-serif text-[clamp(26px,3vw,42px)] font-normal leading-none tracking-[-0.015em] text-[#0A1F3D]">
              {observations}
            </p>
            <p className="mt-2 text-[12.5px] leading-[1.55] text-[#5C6472]">
              12-month formation windows · 2009–2026
            </p>
          </div>

          <div className="mx-1 w-px self-stretch bg-[#D0D4CF]" />

          {/* Elevated risk zone */}
          <div className="min-w-0 flex-1 px-7">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A92A0]">
              Elevated risk zone
            </p>
            <p className="font-serif text-[clamp(26px,3vw,42px)] font-normal leading-none tracking-[-0.015em] text-[#0A1F3D]">
              {elevatedPct}
            </p>
            <p className="mt-2 text-[12.5px] leading-[1.55] text-[#5C6472]">
              High / Very High across all three axes simultaneously
            </p>
          </div>

          <div className="mx-1 w-px self-stretch bg-[#D0D4CF]" />

          {/* FCF vs Revenue spread */}
          <div className="min-w-0 flex-[1.3] pl-7">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A92A0]">
              FCF vs Revenue · median spread
            </p>
            <p className="font-serif text-[clamp(26px,3vw,42px)] font-normal leading-none tracking-[-0.015em] text-[#1A4D32]">
              +27.6pp
            </p>
            <p className="mt-2 text-[12.5px] leading-[1.55] text-[#5C6472]">
              12-month return · held across all regimes tested
            </p>
          </div>

        </div>

        {/* Disclosure */}
        <p className="mt-7 border-t border-[#E4E7E2] pt-4 text-[10.5px] leading-[1.65] text-[#9CA5B0]">
          290,902 historical observations · 2009–2026 · $5M ADV liquidity filter · $5 minimum price at formation · 12-month forward return horizon · transaction costs not modeled. FCF vs Revenue spread: median 12-month return differential across all observations, confirmed stable across pre-2020, COVID, and post-COVID regimes.
        </p>

      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const stats = useSystemStats()

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual"
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById("home-top")
        if (!el) return
        const y = el.getBoundingClientRect().top + window.scrollY - 88
        window.scrollTo(0, Math.max(0, y))
      })
    })
  }, [])

  return (
    <main id="home-top" className="min-h-screen bg-[#F1F3F0] text-[#1E2228]">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14 md:items-center">

            {/* Left */}
            <div className="max-w-[680px]">

              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A92A0]">
                Structural Risk Research
              </p>

              <h1 className="font-serif text-[clamp(32px,4.2vw,56px)] font-normal leading-[1.04] tracking-[-0.018em] text-[#0A1F3D]">
                Markets price narratives.{" "}
                <br className="hidden md:block" />
                We measure what's underneath them.
              </h1>

              <div className="mt-6 flex flex-col gap-4">
                <p className="text-[16.5px] leading-[1.85] text-[#5C6472]">
                  The OSMR framework evaluates every U.S.-listed equity on three structural
                  dimensions: how far a valuation reaches beyond demonstrated operational output,
                  whether that foundation is improving or deteriorating, and whether the firm can
                  service its obligations from what it actually produces.
                </p>
                <p className="text-[16.5px] leading-[1.85] text-[#5C6472]">
                  Scores are derived from reported financials — not analyst estimates, not
                  narrative consensus. Ranked cross-sectionally so structural risk is comparable
                  across the universe.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="/platform"
                  className="inline-flex items-center gap-2 rounded-[13px] bg-[#0A1F3D] px-6 py-3.5 text-[13px] font-semibold text-white transition hover:bg-[#153761]"
                >
                  Open Platform <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/osmr-methodology"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5C6472] transition hover:text-[#0A1F3D]"
                >
                  Methodology <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/how-to-use-osmr"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5C6472] transition hover:text-[#0A1F3D]"
                >
                  How to Use OSMR <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

            </div>

            {/* Right — OSMR card, desktop only */}
            <div className="hidden md:block">
              <div className="w-full rounded-[28px] border border-[#DDE0DC] bg-white p-7 shadow-[0_16px_48px_rgba(10,35,66,0.07)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(10,35,66,0.11)]">

                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A92A0]">OSMR</p>
                    <p className="mt-1.5 font-serif text-[18px] font-normal text-[#0A1F3D]">Structural Market Map</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#C9D8CD] bg-[#E8EFE9] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#244636]">
                    <StatusDot /> Live
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {[
                    { label: "Anchor Risk",     desc: "How much narrative bridges this valuation to operational output" },
                    { label: "Trajectory Risk", desc: "Whether the operational foundation is improving or deteriorating" },
                    { label: "Financing Risk",  desc: "Whether obligations can be serviced from actual operational output" },
                  ].map(({ label, desc }) => (
                    <div key={label} className="rounded-xl border border-[#EAECE8] bg-[#F7F8F6] px-4 py-3.5">
                      <div className="text-[13px] font-semibold text-[#0A1F3D]">{label}</div>
                      <div className="mt-1 text-[12.5px] leading-[1.5] text-[#7A8390]">{desc}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[14px] bg-[#0A1F3D] px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A9FCA]">Framework output</p>
                  <p className="mt-2 text-[13px] leading-[1.65] text-[#D8E4EF]">
                    A structural map of where valuation is credibly anchored — and where it depends on conditions outside the firm's control.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── INFLECTION BRIDGE ─────────────────────────────────────────────── */}
      <div className="border-b border-[#D0D4CF] bg-[#F1F3F0] px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center gap-5">
          <div className="h-px flex-1 bg-[#D8DBD6]" />
          <p className="shrink-0 font-serif text-[13.5px] italic text-[#4A5568]">
            The distribution below is not a ranking artifact. It is a structural separation.
          </p>
          <div className="h-px flex-1 bg-[#D8DBD6]" />
        </div>
      </div>

      {/* ── KPI STRIP ─────────────────────────────────────────────────────── */}
      <KPIStrip stats={stats} />

      {/* ── RESEARCH LENS ─────────────────────────────────────────────────── */}
      <section className="border-b border-[#DDE0DC] px-6 py-16">
        <div className="mx-auto max-w-7xl">

          <div className="mb-10 max-w-lg">
            <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A92A0]">Research Lens</p>
            <h2 className="font-serif text-[clamp(24px,2.8vw,38px)] font-normal leading-[1.1] tracking-[-0.014em] text-[#0A1F3D]">
              Three questions. One structural score.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            {/* Focus */}
            <div className="rounded-[22px] border border-[#DDE0DC] bg-white p-7 shadow-[0_8px_24px_rgba(10,35,66,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(10,35,66,0.08)]">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6DAE8B]">Focus</p>
              <p className="font-serif text-[19px] font-normal leading-[1.2] tracking-[-0.01em] text-[#0A1F3D]">Anchor depth</p>
              <p className="mt-4 text-[14.5px] leading-[1.8] text-[#5C6472]">
                How far a valuation reaches beyond the operational output that credibly supports it — and how much narrative is required to bridge that gap.
              </p>
              <p className="mt-3 text-[14.5px] leading-[1.8] text-[#5C6472]">
                The deeper the anchor, the shorter the bridge. The shallower the anchor, the more the valuation depends on conditions the firm does not control.
              </p>
            </div>

            {/* Scope */}
            <div className="rounded-[22px] border border-[#DDE0DC] bg-white p-7 shadow-[0_8px_24px_rgba(10,35,66,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(10,35,66,0.08)]">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6DAE8B]">Scope</p>
              <p className="font-serif text-[19px] font-normal leading-[1.2] tracking-[-0.01em] text-[#0A1F3D]">Cross-sectional</p>
              <p className="mt-4 text-[14.5px] leading-[1.8] text-[#5C6472]">
                Every U.S.-listed equity evaluated on the same structural basis. Structural risk is not a property of individual companies in isolation — it is a relative measure.
              </p>
              <p className="mt-3 text-[14.5px] leading-[1.8] text-[#5C6472]">
                Rankings, not absolute scores. What matters is where each company sits in the distribution — not whether its multiple is high or low in the abstract.
              </p>
            </div>

            {/* Method */}
            <div className="rounded-[22px] border border-[#DDE0DC] bg-white p-7 shadow-[0_8px_24px_rgba(10,35,66,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(10,35,66,0.08)]">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6DAE8B]">Method</p>
              <p className="font-serif text-[19px] font-normal leading-[1.2] tracking-[-0.01em] text-[#0A1F3D]">Three axes</p>
              <div className="mt-4 flex flex-col gap-1.5">
                {["Anchor Risk", "Trajectory Risk", "Financing Risk"].map(axis => (
                  <div
                    key={axis}
                    className="rounded-md border border-[#C9D8CD] bg-[#E8EFE9] px-3 py-2 text-[12px] font-semibold text-[#244636]"
                  >
                    {axis}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[14.5px] leading-[1.8] text-[#5C6472]">
                Each axis scored independently, then composed into a single structural score. No axis hides behind the others.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── CORE FRAMEWORK — DARK BAND ────────────────────────────────────── */}
      <section className="border-b border-[#0D2440] bg-[#0A1F3D] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 md:items-start">

            {/* Left */}
            <div>
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7A9FCA]">Core Framework</p>
              <h2 className="font-serif text-[clamp(24px,2.8vw,38px)] font-normal leading-[1.1] tracking-[-0.014em] text-white">
                If narrative sustains a valuation, the question is what sustains the narrative.
              </h2>
              <div className="mt-6 flex flex-col gap-4">
                <p className="text-[15.5px] leading-[1.85] text-[#A9BEDF]">
                  The strongest valuations rest on demonstrated cash generation. The bridge between
                  price and operational reality is short — the narrative required to maintain it
                  is minimal.
                </p>
                <p className="text-[15.5px] leading-[1.85] text-[#A9BEDF]">
                  The weakest valuations rest on what a company might become. The bridge is long,
                  the narrative load is heavy, and the valuation is exposed as that narrative weakens.
                </p>
                <p className="text-[15.5px] leading-[1.85] text-[#A9BEDF]">
                  OSMR maps where that load is concentrated across the market. It does not predict
                  which narratives will fail. It measures how much structural weight each one is
                  already carrying.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/osmr-methodology"
                  className="inline-flex items-center gap-2 rounded-[13px] bg-white px-6 py-3.5 text-[13px] font-semibold text-[#0A1F3D] transition hover:bg-[#F0F4F8]"
                >
                  Methodology <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right — accordion */}
            <div>
              <RiskCards />
            </div>

          </div>
        </div>
      </section>

      {/* ── PLATFORM ──────────────────────────────────────────────────────── */}
      <section className="border-b border-[#DDE0DC] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">

            {/* Left */}
            <div>
              <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A92A0]">Platform</p>
              <h2 className="font-serif text-[clamp(24px,2.8vw,38px)] font-normal leading-[1.1] tracking-[-0.014em] text-[#0A1F3D]">
                The framework, made usable.
              </h2>
              <div className="mt-6 flex flex-col gap-4">
                <p className="text-[15.5px] leading-[1.85] text-[#5C6472]">
                  Company-level financial data converted into a structural map of the equity
                  universe. Identify risk clusters before they reprice. Compare companies on a
                  common structural basis. Track anchor deterioration over time.
                </p>
                <p className="text-[15.5px] leading-[1.85] text-[#5C6472]">
                  Updated monthly for structural changes. Weekly snapshot refreshes for active monitoring.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/platform"
                  className="inline-flex items-center gap-2 rounded-[13px] bg-[#0A1F3D] px-6 py-3.5 text-[13px] font-semibold text-white transition hover:bg-[#153761]"
                >
                  Open Platform <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right — feature card */}
            <div className="rounded-[22px] border border-[#DDE0DC] bg-white p-7 shadow-[0_8px_24px_rgba(10,35,66,0.04)]">

              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A92A0]">What's live now</p>

              <div className="flex flex-col gap-2">
                {[
                  { title: "Structural market map",      desc: "Full-universe OSMR scoring across all three axes." },
                  { title: "Historical cohort analysis", desc: "Forward return outcomes across structural regimes, 12M horizon." },
                  { title: "Company-level drilldowns",   desc: "Individual ticker structural profiles, regime context, trajectory history." },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex items-start justify-between gap-4 rounded-xl border border-[#EAECE8] bg-[#F7F8F6] px-4 py-3.5">
                    <div>
                      <div className="text-[13px] font-semibold text-[#0A1F3D]">{title}</div>
                      <div className="mt-1 text-[12.5px] leading-[1.5] text-[#6B7A8D]">{desc}</div>
                    </div>
                    <div className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-full border border-[#B6DEC4] bg-[#E3F2E9] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1B5E38]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3E9E6A]" />
                      Live
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-[#EAECE8] pt-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B0B8C4]">Coming next</p>
                <div className="rounded-xl border border-[#EAECE8] bg-[#FAFAF9] px-4 py-3.5 opacity-60">
                  <div className="text-[13px] font-semibold text-[#6B7280]">Market structure analytics</div>
                  <div className="mt-1 text-[12.5px] leading-[1.5] text-[#9CA3AF]">
                    Options and spread microstructure signals layered on structural scores.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── WHY THIS EXISTS ───────────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[680px]">

          <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A92A0]">Why This Exists</p>
          <h2 className="font-serif text-[clamp(24px,2.8vw,38px)] font-normal leading-[1.1] tracking-[-0.014em] text-[#0A1F3D]">
            Built for investors who want structure, not stories.
          </h2>

          <div className="mt-7 flex flex-col gap-5">
            <p className="text-[15.5px] leading-[1.85] text-[#5C6472]">
              Rigorous structural analysis requires one thing: that conclusions follow
              the evidence, not the incentive structure of the organization publishing them.
            </p>

            <blockquote className="border-l-2 border-[#C9D8CD] pl-5">
              <p className="text-[15.5px] leading-[1.85] text-[#3F4A58]">
                Most financial publishing does not meet that requirement. Research exists
                to support a product. The more rigorous the analysis, the harder it becomes
                to compress into a format optimized for subscriptions rather than truth.
              </p>
            </blockquote>

            <p className="text-[15.5px] leading-[1.85] text-[#5C6472]">
              The work behind this platform was developed inside that environment — and
              tested against real capital decisions throughout. A framework that measures
              how much narrative a company requires to justify its valuation cannot be
              published honestly by an organization whose business model depends on narrative.
            </p>
            <p className="text-[15.5px] leading-[1.85] text-[#5C6472]">
              The Capital Steward exists because that structural incompatibility left no
              other option. What's here is the same framework, expressed without distortion.
            </p>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/why-this-exists"
              className="inline-flex items-center gap-2 rounded-[13px] bg-[#0A1F3D] px-6 py-3.5 text-[13px] font-semibold text-white transition hover:bg-[#153761]"
            >
              Why This Exists <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/osmr-methodology"
              className="inline-flex items-center gap-2 rounded-[13px] border border-[#D4CDBF] bg-[#F7F8F6] px-5 py-3.5 text-[13px] font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]"
            >
              Methodology <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/how-to-use-osmr"
              className="inline-flex items-center gap-2 rounded-[13px] border border-[#D4CDBF] bg-[#F7F8F6] px-5 py-3.5 text-[13px] font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]"
            >
              How to Use OSMR <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <div className="border-t border-[#DDE0DC] py-6 text-center">
        <p className="text-[11px] leading-[1.8] text-[#B0B8C4]">
          The Capital Steward, LLC · thecapitalsteward.com · inquiries@thecapitalsteward.com
          <br />
          © 2026 The Capital Steward, LLC. All rights reserved. For informational purposes only. Not investment advice.
        </p>
      </div>

    </main>
  )
}