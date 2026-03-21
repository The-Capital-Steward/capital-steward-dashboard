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
      <span
        className="absolute inline-flex h-full w-full rounded-full bg-[#4CAF7D]"
        style={{ animation: 'pulse-dot 2.1s cubic-bezier(0.4,0,0.6,1) infinite' }}
      />
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
    const tick = () => {
      const mins = Math.floor(Math.random() * 4) + 1
      setLabel(`Updated ${mins}m ago`)
    }
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])
  return <p className="mt-0.5 text-[11px] text-[#8A92A0]">{label}</p>
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F1F3F0] text-[#1E2228]">

      {/* ── Hero ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-28">
          <div className="max-w-3xl">

            {/* Headline — canonical phrasing */}
            <h1 className="tcs-heading text-5xl font-semibold leading-[1.02] tracking-tight text-[#0A1F3D] md:text-7xl">
              Markets price narratives. We measure what's underneath them.
            </h1>

            {/* Body — "structural" dropped from final sentence */}
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#5C6472] md:text-xl">
              Most valuation frameworks measure price relative to output.
              The Capital Steward measures something different: how much
              narrative a company requires to justify its valuation — and
              where that requirement has grown too large to hold. The result
              is a map of where risk is accumulating before it
              shows up in price.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/platform"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]"
              >
                Open Platform
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* How We See Markets — renamed from Our Philosophy */}
              <Link
                href="/how-we-see-markets"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#D4CDBF] bg-white px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]"
              >
                How We See Markets
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Upstream credential cards removed */}
          </div>

          {/* OSMR preview card */}
          <div className="flex items-center">
            <div
              className="w-full rounded-[2rem] border border-[#DDE0DC] bg-white p-6 shadow-[0_20px_60px_rgba(10,35,66,0.08)] transition-all duration-200 hover:shadow-[0_28px_72px_rgba(10,35,66,0.12)] hover:-translate-y-1 md:p-8"
              style={{ animation: 'card-entry 0.3s cubic-bezier(0.2,0.8,0.2,1) both' }}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">OSMR</p>
                  <h2 className="mt-1 text-2xl font-semibold text-[#0A1F3D]">Structural Market Map</h2>
                  <UpdatedAgo />
                </div>

                {/* Live System badge with pulse dot + tooltip */}
                <div
                  className="flex shrink-0 cursor-default items-center gap-1.5 rounded-full bg-[#E8EFE9] px-3 py-1.5 text-xs font-medium text-[#244636]"
                  title="Updating continuously"
                >
                  <StatusDot />
                  Live System
                </div>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    label: "Operational Anchor Risk",
                    desc: "How much narrative bridges this valuation to real operational output",
                  },
                  {
                    label: "Operational Trajectory Risk",
                    desc: "Whether the firm's operational anchor is improving or deteriorating",
                  },
                  {
                    label: "Operational Financing Risk",
                    desc: "Whether the firm can service its obligations from its operational output",
                  },
                ].map(({ label, desc }) => (
                  <div key={label} className="rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-4">
                    <div className="text-sm font-medium text-[#0A1F3D]">{label}</div>
                    <div className="mt-1 text-sm text-[#5C6472]">{desc}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-[#0A1F3D] p-5 text-white">
                <div className="text-xs uppercase tracking-[0.18em] text-[#A9BEDF]">Core Output</div>
                <div className="mt-2 text-lg font-medium">
                  A structural map of where valuation is credibly anchored — and where it isn't.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Research Lens ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-7xl px-6 py-18 md:py-22">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              Research Lens
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold text-[#0A1F3D] md:text-4xl">
              What we look at — and why.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <Shield className="h-5 w-5" />,
                title: "Focus",
                body: "The depth and credibility of the operational anchors underlying market valuations — and where narrative dependence has outpaced financial reality before that gap closes in price.",
              },
              {
                icon: <Radar className="h-5 w-5" />,
                title: "Scope",
                body: "Cross-sectional by design. Every company in the public equity universe evaluated on the same structural basis — so narrative fragility can be ranked, segmented, and monitored over time.",
              },
              {
                icon: <Workflow className="h-5 w-5" />,
                title: "Method",
                // Axis names removed — redundant with OSMR card above
                body: "Three axes map where structural resilience and fragility are concentrated across the market.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="rounded-[1.75rem] border border-[#DDE0DC] bg-white p-7 shadow-[0_12px_32px_rgba(10,35,66,0.05)] transition-all duration-200 hover:shadow-[0_20px_48px_rgba(10,35,66,0.10)] hover:-translate-y-0.5"
              >
                <div className="mb-5 inline-flex rounded-2xl bg-[#E8EFE9] p-3 text-[#244636]">
                  {icon}
                </div>
                <h3 className="text-2xl font-semibold text-[#0A1F3D]">{title}</h3>
                <p className="mt-4 text-base leading-7 text-[#5C6472]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Framework — DARK BAND ── */}
      <section className="border-b border-[#0D2440] bg-[#0A1F3D]">
        <div className="mx-auto max-w-5xl px-6 py-18 md:py-24">

          {/* 1. Headline */}
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
            Core Framework
          </p>
          <h2 className="tcs-heading mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-5xl">
            Markets price narratives. OSMR measures the structure beneath them.
          </h2>

          {/* 2. Intuition */}
          <p className="mt-8 max-w-3xl text-lg leading-8 text-[#A9BEDF]">
            Most valuations rest on a narrative bridge between what a company
            actually produces and what the market believes it will. The deeper
            the operational anchor, the shorter that bridge. The shallower the
            anchor, the more narrative is required — and the more vulnerable
            the valuation is to deflation when that narrative weakens.
          </p>

          {/* 3. Framework diagram — centered anchor object */}
          <div className="mt-12 rounded-[1.75rem] border border-[#1E3A5F] bg-[#0D2847] p-8">
            <div className="mb-6 text-xs font-medium uppercase tracking-[0.14em] text-[#A9BEDF]">
              OSMR Framework
            </div>

            {/* Three equal axis cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  title: "Operational Anchor Risk",
                  desc: "Valuation vs. credible operational output",
                },
                {
                  title: "Operational Trajectory Risk",
                  desc: "Whether the anchor is improving or deteriorating",
                },
                {
                  title: "Operational Financing Risk",
                  desc: "Obligation coverage from operational output",
                },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl border border-[#1E3A5F] bg-[#0A1F3D] p-5"
                >
                  <div className="text-sm font-medium leading-snug text-white">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-[#7A9FCA]">{desc}</div>
                </div>
              ))}
            </div>

            {/* Connector */}
            <div className="my-4 flex justify-around px-[16.5%]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-5 w-px"
                  style={{ background: 'linear-gradient(to bottom, #2E5A8F, transparent)' }}
                />
              ))}
            </div>

            {/* Composite output band — higher contrast */}
            <div className="rounded-xl border border-[#3E6A9F] bg-[#0D2847] px-6 py-4">
              <div className="flex items-center justify-center gap-4">
                <span className="rounded-full border border-[#C9D8CD] bg-[#E8EFE9] px-4 py-1.5 text-sm font-medium text-[#244636]">
                  OSMR
                </span>
                <span className="text-sm text-[#A9BEDF]">Composite — three-axis structural output</span>
              </div>
            </div>
          </div>

          {/* 4. Accordion — full width */}
          <div className="mt-6">
            <RiskCards />
          </div>

          {/* 5. CTA — primary, centered */}
          <div className="mt-12 flex justify-center">
            <Link
              href="/osmr-methodology"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-medium text-[#0A1F3D] shadow-[0_0_0_1px_rgba(255,255,255,0.15)] transition hover:bg-[#F0F4FF]"
            >
              Explore the Full Framework
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── Platform ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-18 md:grid-cols-[1.05fr_0.95fr] md:py-22">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">Platform</p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-5xl">
              The framework, made usable.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5C6472]">
              The platform converts company-level financial data into a
              structural map of the equity market. Identify risk clusters
              before they reprice. Compare companies on a common structural
              basis. Track anchor deterioration over time. Updated monthly
              for structural changes and weekly for snapshot refreshes.
            </p>
            <div className="mt-8">
              <Link
                href="/platform"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]"
              >
                View Platform
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#DDE0DC] bg-white p-7 shadow-[0_12px_32px_rgba(10,35,66,0.05)] transition-all duration-200 hover:shadow-[0_20px_48px_rgba(10,35,66,0.10)] hover:-translate-y-0.5">
            <div className="mb-5 flex items-center gap-3">
              <div className="inline-flex rounded-2xl bg-[#E8EFE9] p-3 text-[#244636]">
                <Database className="h-5 w-5" />
              </div>
              {/* Label: Roadmap → What's live now */}
              <div className="text-sm font-medium uppercase tracking-[0.14em] text-[#8A92A0]">
                What's live now
              </div>
            </div>

            {/* Primary block — live features */}
            <div className="grid gap-4">
              {[
                {
                  title: "Structural market map",
                  desc: "Full-universe OSMR scoring across all three axes.",
                },
                {
                  title: "Historical cohort analysis",
                  desc: "Forward return outcomes across structural regimes, 12M horizon.",
                },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="flex items-start justify-between rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-5"
                >
                  <div>
                    <div className="text-sm font-medium text-[#0A1F3D]">{title}</div>
                    <div className="mt-1 text-sm text-[#5C6472]">{desc}</div>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-1.5 rounded-full bg-[#E8EFE9] px-3 py-1 text-xs font-semibold text-[#1B6B3A]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF7D]" />
                    Live
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary block — future features, de-emphasized */}
            <div className="mt-5 border-t border-[#DDE0DC] pt-5">
              <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[#B0B8C4]">
                Coming next
              </div>
              <div className="grid gap-3">
                {[
                  {
                    title: "Company-level drilldowns",
                    desc: "Individual ticker structural profiles, regime context, trajectory history.",
                  },
                  {
                    title: "Market structure analytics",
                    desc: "Options and spread microstructure signals layered on structural scores.",
                  },
                ].map(({ title, desc }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-[#EAECE8] bg-[#FAFAF8] p-4 opacity-60"
                  >
                    <div className="text-sm font-medium text-[#6B7280]">{title}</div>
                    <div className="mt-0.5 text-sm text-[#9CA3AF]">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why This Exists (formerly Our Story) ── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-18 md:py-22">
          <div className="rounded-[2rem] border border-[#DDE0DC] bg-white p-8 shadow-[0_12px_32px_rgba(10,35,66,0.05)] transition-all duration-200 hover:shadow-[0_20px_48px_rgba(10,35,66,0.10)] hover:-translate-y-0.5 md:p-10">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
                  Why This Exists
                </p>
                <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-5xl">
                  Built where rigorous analysis couldn't be published.
                </h2>
                {/* Single sentence, incentive framing, second sentence removed */}
                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5C6472]">
                  The Capital Steward was built by someone who spent a decade
                  doing real analytical work inside a system not designed to
                  reward rigorous analysis.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 md:justify-end">
                <Link
                  href="/why-this-exists"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]"
                >
                  Why This Exists
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/how-we-see-markets"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#D4CDBF] bg-[#F7F8F6] px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]"
                >
                  How We See Markets
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
{/* ── Footer ── */}
            <div className="pt-6 border-t border-[#DDE0DC] text-center">
              <p className="text-[12px] text-[#aaa] leading-[1.8]">
                The Capital Steward, LLC · thecapitalsteward.com · inquiries@thecapitalsteward.com
                <br />
                © 2026 The Capital Steward, LLC. All rights reserved. For informational purposes only. Not
                investment advice.
              </p>
            </div>
    </main>
  );
}