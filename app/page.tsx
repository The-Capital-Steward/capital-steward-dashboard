'use client'

import { useState, useEffect } from "react"
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Shield,
  Radar,
  Workflow,
  Database,
} from "lucide-react";

const RISK_CARDS = [
  {
    title: "Operational Anchor Risk",
    summary: "The further a valuation reaches beyond credible operational output, the more narrative is required to sustain it — and the more vulnerable it is to deflation.",
    detail: "A firm will use the deepest operational anchor it can credibly claim to justify its valuation. If free cash flow supports that valuation, the bridge between price and economic reality is short. If the market must reach to revenue — or beyond — the bridge grows long, fragile, and dependent on conditions outside the firm's control. The penalty for anchor shallowness reflects the length and fragility of the narrative required.",
  },
  {
    title: "Operational Trajectory Risk",
    summary: "A firm whose anchor is consistently improving is shortening its narrative bridge. One whose anchor is deteriorating is lengthening it — becoming more dependent on narrative to justify its price.",
    detail: "This dimension captures trajectory, not just position. A company moving toward demonstrated cash generation is reducing its structural risk over time. A company whose anchor metric is deteriorating — even if its current valuation is not yet stretched — is accumulating structural risk regardless of where its price sits. Consistency of improvement matters as much as the improvement itself.",
  },
  {
    title: "Operational Financing Risk",
    summary: "Whether a firm can service its financing obligations from its actual operational output — not from accounting constructs, narrative projections, or asset sales.",
    detail: "Debt is not inherently fragile. A mature firm running significant debt with strong coverage from operational output is structurally sound. What creates fragility is the gap between what a firm owes and what it can credibly produce to service it. Firms unable to cover their obligations from their actual operational anchor are exposed — regardless of what narrative surrounds their balance sheet.",
  },
]

function RiskCards() {
  const [expanded, setExpanded] = useState<string | null>(null)
  return (
    <div className="grid gap-4">
      {RISK_CARDS.map(({ title, summary, detail }) => {
        const isOpen = expanded === title
        return (
          <button
            key={title}
            onClick={() => setExpanded(isOpen ? null : title)}
            className="group w-full rounded-2xl border border-[#1E3A5F] bg-[#0D2847] p-5 text-left transition-all duration-200 hover:border-[#2E5A8F] hover:bg-[#0F2E52]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-sm font-medium text-white">{title}</div>
              <div
                className="mt-0.5 shrink-0 text-[#A9BEDF] transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 5L7 10L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm leading-6 text-[#A9BEDF]">{summary}</div>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: isOpen ? '200px' : '0px', opacity: isOpen ? 1 : 0 }}
            >
              <div className="mt-4 border-t border-[#1E3A5F] pt-4 text-sm leading-7 text-[#7A9FCA]">
                {detail}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function StatusDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#4CAF7D]"
        style={{ animation: 'pulse-dot 2.1s cubic-bezier(0.4,0,0.6,1) infinite' }} />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4CAF7D]" />
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes card-entry {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </span>
  )
}

function UpdatedAgo() {
  const [label, setLabel] = useState("Updated 2m ago")
  useEffect(() => {
    const id = setInterval(() => {
      setLabel(`Updated ${Math.floor(Math.random() * 4) + 1}m ago`)
    }, 60_000)
    return () => clearInterval(id)
  }, [])
  return <p className="mt-0.5 text-[11px] text-[#8A92A0]">{label}</p>
}

type SiteStats = {
  universe: { total: number }
  high_risk_cluster: { pct_of_universe: number; revenue_anchored_pct: number }
  low_risk_cluster:  { pct_of_universe: number; fcf_anchored_pct: number }
} | null

function useSystemStats(): SiteStats {
  const [stats, setStats] = useState<SiteStats>(null)
  useEffect(() => {
    fetch("/data/key_system_stats.json").then(r => r.json()).then(setStats).catch(() => null)
  }, [])
  return stats
}

export default function HomePage() {
  const stats = useSystemStats()
  const highRiskPct  = stats ? `${stats.high_risk_cluster.pct_of_universe}%`                 : "17.2%"
  const revAnchorPct = stats ? `${Math.round(stats.high_risk_cluster.revenue_anchored_pct)}%` : "62%"
  const lowRiskPct   = stats ? `${stats.low_risk_cluster.pct_of_universe}%`                  : "10.2%"
  const fcfAnchorPct = stats ? `${Math.round(stats.low_risk_cluster.fcf_anchored_pct)}%`     : "100%"

    useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    });
  }, []);
  
  return (
    <main className="min-h-screen bg-[#F1F3F0] text-[#1E2228]">

      {/* ── HERO ──────────────────────────────────────────────────────────
          .tcs-snap-section defined in globals.css:
            min-height: calc(100svh - 88px);
            display: flex;
            align-items: center;
            scroll-snap-align: start;
      ──────────────────────────────────────────────────────────────────── */}
            {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="tcs-snap-section tcs-snap-section--hero border-b border-[#DDE0DC]">
        <div className="mx-auto flex min-h-full w-full max-w-7xl items-center px-6 py-4 md:py-6">
          <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-[1.08fr_0.92fr] md:gap-10 md:items-center">

            {/* Left */}
            <div className="max-w-[720px] self-center">
              <h1 className="tcs-heading text-4xl font-semibold leading-[1.02] tracking-tight text-[#0A1F3D] md:text-[3.5rem] md:leading-[0.98] lg:text-[4.25rem]">
                Markets price narratives. We measure what's underneath them.
              </h1>

              <p className="mt-4 text-sm leading-6 text-[#5C6472] md:text-[1.02rem] md:leading-7">
                OSMR measures three things: how far a company's valuation extends
                beyond its demonstrated operational output, whether that operational
                foundation is improving or deteriorating, and whether the firm can
                service its obligations from what it actually produces.
              </p>

              <p className="mt-2 text-sm leading-6 text-[#5C6472] md:text-[1.02rem] md:leading-7">
                Those measurements are computed from reported financials across the
                U.S.-listed equity universe, then ranked and scored on a common
                structural basis.
              </p>

              <div className="mt-5">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm leading-6 text-[#1E2228] md:text-base md:leading-7">
                      <span className="font-semibold text-[#0A1F3D]">{highRiskPct} of the universe</span>{" "}
                      sits in the elevated structural risk zone across all three axes simultaneously.
                    </p>
                    <p className="text-sm leading-6 text-[#5C6472] md:text-base md:leading-7">
                      {revAnchorPct} of those companies are revenue-anchored.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm leading-6 text-[#1E2228] md:text-base md:leading-7">
                      <span className="font-semibold text-[#0A1F3D]">{lowRiskPct} sits in the structurally sound zone</span>{" "}
                      across all three axes.
                    </p>
                    <p className="text-sm leading-6 text-[#5C6472] md:text-base md:leading-7">
                      {fcfAnchorPct} of those companies are FCF-anchored.
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm font-medium leading-6 text-[#0A1F3D] md:text-base md:leading-7">
                  The distribution is not a ranking artifact. It is a structural separation.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="/platform"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#153761]"
                >
                  Open Platform <ArrowRight className="h-4 w-4" />
                </Link>

                <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <Link
                    href="/how-we-see-markets"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#5C6472] transition hover:text-[#0A1F3D]"
                  >
                    How We See Markets <ChevronRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href="/how-to-use-osmr"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#5C6472] transition hover:text-[#0A1F3D]"
                  >
                    How to Use OSMR <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </span>
              </div>
            </div>

            {/* Right — OSMR card, desktop only */}
            <div
              className="hidden self-center md:block"
              style={{ animation: "card-entry 0.3s cubic-bezier(0.2,0.8,0.2,1) both" }}
            >
              <div
                className="w-full overflow-hidden rounded-[2rem] border border-[#DDE0DC] bg-white p-6 shadow-[0_20px_60px_rgba(10,35,66,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_28px_72px_rgba(10,35,66,0.12)]"
                style={{ maxHeight: "min(720px, 72vh)" }}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">OSMR</p>
                    <h2 className="mt-1 text-xl font-semibold text-[#0A1F3D]">Structural Market Map</h2>
                    <UpdatedAgo />
                  </div>
                  <div className="flex shrink-0 cursor-default items-center gap-1.5 rounded-full bg-[#E8EFE9] px-3 py-1.5 text-xs font-medium text-[#244636]">
                    <StatusDot /> Live System
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    { label: "Operational Anchor Risk", desc: "How much narrative bridges this valuation to real operational output" },
                    { label: "Operational Trajectory Risk", desc: "Whether the firm's operational anchor is improving or deteriorating" },
                    { label: "Operational Financing Risk", desc: "Whether the firm can service its obligations from its operational output" },
                  ].map(({ label, desc }) => (
                    <div key={label} className="rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-4">
                      <div className="text-sm font-medium text-[#0A1F3D]">{label}</div>
                      <div className="mt-1 text-sm text-[#5C6472]">{desc}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl bg-[#0A1F3D] p-4 text-white">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#A9BEDF]">Core Output</div>
                  <div className="mt-1.5 text-base font-medium">
                    A structural map of where valuation is credibly anchored — and where it isn't.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── RESEARCH LENS ─────────────────────────────────────────────────── */}
      <section className="tcs-snap-section border-b border-[#DDE0DC]">
        <div className="mx-auto w-full max-w-7xl px-6 py-12">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">Research Lens</p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold text-[#0A1F3D] md:text-4xl">
              How structural risk is defined.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-[#DDE0DC] bg-white p-7 shadow-[0_12px_32px_rgba(10,35,66,0.05)] transition-all duration-200 hover:shadow-[0_20px_48px_rgba(10,35,66,0.10)] hover:-translate-y-0.5">
              <div className="mb-5 inline-flex rounded-2xl bg-[#E8EFE9] p-3 text-[#244636]"><Shield className="h-5 w-5" /></div>
              <h3 className="text-2xl font-semibold text-[#0A1F3D]">Focus</h3>
              <p className="mt-4 text-base leading-7 text-[#5C6472]">
                The depth and credibility of the operational anchors underlying market valuations — and where narrative dependence has outpaced financial reality before that gap closes in price.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[#DDE0DC] bg-white p-7 shadow-[0_12px_32px_rgba(10,35,66,0.05)] transition-all duration-200 hover:shadow-[0_20px_48px_rgba(10,35,66,0.10)] hover:-translate-y-0.5">
              <div className="mb-5 inline-flex rounded-2xl bg-[#E8EFE9] p-3 text-[#244636]"><Radar className="h-5 w-5" /></div>
              <h3 className="text-2xl font-semibold text-[#0A1F3D]">Scope</h3>
              <p className="mt-4 text-base leading-7 text-[#5C6472]">
                Cross-sectional by design. Every company in the public equity universe evaluated on the same structural basis — so narrative fragility can be ranked, segmented, and monitored over time.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[#DDE0DC] bg-white p-7 shadow-[0_12px_32px_rgba(10,35,66,0.05)] transition-all duration-200 hover:shadow-[0_20px_48px_rgba(10,35,66,0.10)] hover:-translate-y-0.5">
              <div className="mb-5 inline-flex rounded-2xl bg-[#E8EFE9] p-3 text-[#244636]"><Workflow className="h-5 w-5" /></div>
              <h3 className="text-2xl font-semibold text-[#0A1F3D]">Method</h3>
              <div className="mt-4 overflow-hidden rounded-xl border border-[#DDE0DC] bg-[#F7F8F6] divide-y divide-[#DDE0DC]">
                {["Operational Anchor Risk", "Operational Trajectory Risk", "Operational Financing Risk"].map(axis => (
                  <div key={axis} className="px-4 py-3 text-sm font-medium text-[#0A1F3D]">{axis}</div>
                ))}
              </div>
              <p className="mt-4 text-base leading-7 text-[#5C6472]">
                Those axes answer a single question: what sustains the valuation in the first place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE FRAMEWORK — DARK BAND ────────────────────────────────────
          Diagram box removed. Accordion cards retained.
          OSMR full name introduced in body copy.
      ──────────────────────────────────────────────────────────────────── */}
      <section className="tcs-snap-section border-b border-[#0D2440] bg-[#0A1F3D]">
        <div className="mx-auto w-full max-w-7xl px-6 py-10">
          <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-start">

            {/* Left — headline + body, full column width, no max-w constraint */}
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">Core Framework</p>
              <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl">
                If narrative sustains a valuation, the question is what sustains the narrative.
              </h2>
              <div className="mt-5 space-y-4 text-base leading-[1.85] text-[#A9BEDF] md:text-lg">
                <p>
                  The strongest valuations rest on demonstrated cash generation — the
                  gap between price and operational reality is short, and the narrative
                  required to bridge it is minimal. The weakest rest on what a company
                  might become — the bridge is long, the narrative load is heavy, and
                  the valuation is exposed as that narrative weakens.
                </p>
                <p>
                  The Operational Structure Mispricing Risk (OSMR) framework maps where
                  that load is concentrated across the market. It does not predict which
                  narratives will fail. It measures how much structural weight each one
                  is already carrying.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/osmr-methodology"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-medium text-[#0A1F3D] shadow-[0_0_0_1px_rgba(255,255,255,0.15)] transition hover:bg-[#F0F4FF]"
                >
                  Methodology <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right — accordion cards */}
            <div>
              <RiskCards />
            </div>

          </div>
        </div>
      </section>

      {/* ── PLATFORM ──────────────────────────────────────────────────────── */}
      <section className="tcs-snap-section border-b border-[#DDE0DC]">
        <div className="mx-auto w-full max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">Platform</p>
              <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-5xl">
                The framework, made usable.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#5C6472] md:text-lg md:leading-8">
                The platform converts company-level financial data into a structural
                map of the equity market. Identify risk clusters before they reprice.
                Compare companies on a common structural basis. Track anchor
                deterioration over time. Updated monthly for structural changes and
                weekly for snapshot refreshes.
              </p>
              <div className="mt-7">
                <Link href="/platform" className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]">
                  View Platform <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#DDE0DC] bg-white p-6 shadow-[0_12px_32px_rgba(10,35,66,0.05)] transition-all duration-200 hover:shadow-[0_20px_48px_rgba(10,35,66,0.10)] hover:-translate-y-0.5 md:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="inline-flex rounded-2xl bg-[#E8EFE9] p-3 text-[#244636]"><Database className="h-5 w-5" /></div>
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-[#8A92A0]">What's live now</div>
              </div>

              <div className="grid gap-3 md:gap-4">
                {[
                  { title: "Structural market map", desc: "Full-universe OSMR scoring across all three axes." },
                  { title: "Historical cohort analysis", desc: "Forward return outcomes across structural regimes, 12M horizon." },
                  { title: "Company-level drilldowns", desc: "Individual ticker structural profiles, regime context, and trajectory history." },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex items-start justify-between rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-4 md:p-5">
                    <div>
                      <div className="text-sm font-semibold text-[#0A1F3D]">{title}</div>
                      <div className="mt-1.5 text-sm leading-6 text-[#5C6472]">{desc}</div>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-1.5 rounded-full bg-[#E8EFE9] px-3 py-1 text-xs font-semibold text-[#1B6B3A]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF7D]" />&nbsp;Live
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-[#DDE0DC] pt-5">
                <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[#B0B8C4]">Coming next</div>
                <div className="rounded-2xl border border-[#EAECE8] bg-[#FAFAF8] p-4 opacity-60">
                  <div className="text-sm font-semibold text-[#6B7280]">Market structure analytics</div>
                  <div className="mt-1.5 text-sm leading-6 text-[#9CA3AF]">
                    Options and spread microstructure signals layered on structural scores.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY THIS EXISTS ───────────────────────────────────────────────── */}
      <section className="tcs-snap-section">
        <div className="mx-auto w-full max-w-5xl px-6 py-12">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">Why This Exists</p>

          <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-5xl">
            Built for investors who want structure, not stories.
          </h2>

          <div className="mt-6 max-w-2xl space-y-4 text-base leading-7 text-[#5C6472] md:text-lg md:leading-8">
            <p>
              The principles behind OSMR were not invented for this platform.
              They were developed over a decade of evaluating real capital
              decisions inside a financial publishing environment — and then
              constrained by it.
            </p>
            <p>
              That environment has an editorial logic. Research exists to
              support a product. Analytical frameworks exist to generate
              recommendations. The more rigorous the framework, the harder it
              is to compress into that structure without distorting what it
              actually measures.
            </p>
            <p>
              The Capital Steward exists because that distortion has a cost —
              and because the framework required a context where that cost did
              not have to be paid.
            </p>
            <p>
              What's here is not a rebrand or a retrofit. It is the same
              framework, expressed without compression.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/why-this-exists" className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]">
              Why This Exists <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/how-we-see-markets" className="inline-flex items-center gap-2 rounded-2xl border border-[#D4CDBF] bg-[#F7F8F6] px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]">
              How We See Markets <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/how-to-use-osmr" className="inline-flex items-center gap-2 rounded-2xl border border-[#D4CDBF] bg-[#F7F8F6] px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]">
              How to Use OSMR <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

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