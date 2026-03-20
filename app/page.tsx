import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Shield,
  Radar,
  Workflow,
  Database,
  Waypoints,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F1F3F0] text-[#1E2228]">

      {/* ── Hero ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-28">
          <div className="max-w-3xl">
            <h1 className="tcs-heading text-5xl font-semibold leading-[1.02] tracking-tight text-[#0A1F3D] md:text-7xl">
              Structural Intelligence for Serious Investors
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#5C6472] md:text-xl">
              The Capital Steward measures how deeply a company's valuation is
              anchored to real operational output — and how much narrative it
              requires to sustain it.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/platform"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]"
              >
                Open Platform
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/our-philosophy"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#D4CDBF] bg-white px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]"
              >
                Our Philosophy
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Focus / Scope / Method cards */}
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#DDE0DC] bg-white px-4 py-4 shadow-[0_10px_25px_rgba(10,35,66,0.04)]">
                <div className="text-xs uppercase tracking-[0.18em] text-[#8A92A0]">Focus</div>
                <div className="mt-2 text-sm font-medium text-[#0A1F3D]">Operational anchor depth</div>
              </div>
              <div className="rounded-2xl border border-[#DDE0DC] bg-white px-4 py-4 shadow-[0_10px_25px_rgba(10,35,66,0.04)]">
                <div className="text-xs uppercase tracking-[0.18em] text-[#8A92A0]">Scope</div>
                <div className="mt-2 text-sm font-medium text-[#0A1F3D]">Full equity universe</div>
              </div>
              <div className="rounded-2xl border border-[#DDE0DC] bg-white px-4 py-4 shadow-[0_10px_25px_rgba(10,35,66,0.04)]">
                <div className="text-xs uppercase tracking-[0.18em] text-[#8A92A0]">Method</div>
                <div className="mt-2 text-sm font-medium text-[#0A1F3D]">Three-axis structural model</div>
              </div>
            </div>
          </div>

          {/* OSMR preview card */}
          <div className="flex items-center">
            <div className="w-full rounded-[2rem] border border-[#DDE0DC] bg-white p-6 shadow-[0_20px_60px_rgba(10,35,66,0.08)] md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">OSMR</p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#0A1F3D]">Structural Market Map</h2>
                </div>
                <div className="rounded-full bg-[#ECEDE7] px-3 py-1 text-xs font-medium text-[#5B665E]">
                  Research Preview
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-4">
                  <div className="text-sm font-medium text-[#0A1F3D]">Operational Anchor Risk</div>
                  <div className="mt-1 text-sm text-[#5C6472]">
                    How much narrative bridges this valuation to real operational output
                  </div>
                </div>
                <div className="rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-4">
                  <div className="text-sm font-medium text-[#0A1F3D]">Operational Trajectory Risk</div>
                  <div className="mt-1 text-sm text-[#5C6472]">
                    Whether the firm's operational anchor is improving or deteriorating
                  </div>
                </div>
                <div className="rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-4">
                  <div className="text-sm font-medium text-[#0A1F3D]">Operational Financing Risk</div>
                  <div className="mt-1 text-sm text-[#5C6472]">
                    Whether the firm can service its obligations from its operational output
                  </div>
                </div>
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
              The lens behind the system.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <Shield className="h-5 w-5" />,
                title: "Focus",
                body: "We study the depth and credibility of the operational anchors underlying market valuations. The goal is to identify where narrative dependence has outpaced financial reality — before that gap closes in price.",
              },
              {
                icon: <Radar className="h-5 w-5" />,
                title: "Scope",
                body: "Our work is cross-sectional by design, built to compare firms across the public equity universe on a common structural basis. That makes narrative fragility easier to rank, segment, and monitor over time.",
              },
              {
                icon: <Workflow className="h-5 w-5" />,
                title: "Method",
                body: "OSMR evaluates firms across three axes — Operational Anchor Risk, Operational Trajectory Risk, and Operational Financing Risk — to map where structural resilience and structural fragility are concentrated.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="rounded-[1.75rem] border border-[#DDE0DC] bg-white p-7 shadow-[0_12px_32px_rgba(10,35,66,0.05)]"
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
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-18 md:grid-cols-[0.95fr_1.05fr] md:py-22">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
              Core Framework
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-white md:text-5xl">
              Markets price assets through narrative. OSMR measures the structure beneath it.
            </h2>
          </div>

          <div className="space-y-6">
            <p className="text-lg leading-8 text-[#A9BEDF]">
              Most valuations rest on a narrative bridge between what a company
              actually produces and what the market believes it will. The deeper
              the operational anchor, the shorter that bridge. The shallower the
              anchor, the more narrative is required — and the more vulnerable
              the valuation is to deflation when that narrative weakens.
            </p>

            {/* OSMR Axis Diagram */}
            <div className="rounded-[1.75rem] border border-[#1E3A5F] bg-[#0D2847] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="inline-flex rounded-2xl bg-[#0A1F3D] p-3 text-[#244636]">
                  <Waypoints className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium uppercase tracking-[0.14em] text-[#A9BEDF]">
                  OSMR Framework
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div className="rounded-2xl border border-[#1E3A5F] bg-[#0A1F3D] p-5">
                  <div className="text-sm font-medium text-white">Operational Anchor Risk</div>
                  <div className="mt-1 text-sm text-[#A9BEDF]">
                    Valuation vs. credible operational output
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="rounded-full border border-[#C9D8CD] bg-[#E8EFE9] px-4 py-2 text-sm font-medium text-[#244636]">
                    OSMR
                  </div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[#A9BEDF]">
                    Three-axis structure
                  </div>
                </div>

                <div className="rounded-2xl border border-[#1E3A5F] bg-[#0A1F3D] p-5">
                  <div className="text-sm font-medium text-white">Operational Financing Risk</div>
                  <div className="mt-1 text-sm text-[#A9BEDF]">
                    Obligation coverage from operational output
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#1E3A5F] bg-[#0A1F3D] p-5">
                <div className="text-sm font-medium text-white">Operational Trajectory Risk</div>
                <div className="mt-1 text-sm text-[#A9BEDF]">
                  Whether the anchor is improving or deteriorating over time
                </div>
              </div>
            </div>

            {/* Philosophical risk type cards */}
            <div className="grid gap-4">
              {[
                {
                  title: "Narrative Bridge Risk",
                  body: "The further a valuation reaches beyond credible operational output, the more narrative is required to sustain it — and the more vulnerable it is to deflation.",
                },
                {
                  title: "Narrative Durability Risk",
                  body: "A firm whose anchor is consistently improving is shortening its narrative bridge. One whose anchor is deteriorating is lengthening it — becoming more dependent on narrative to justify its price.",
                },
                {
                  title: "Obligation Risk",
                  body: "Whether a firm can service its financing obligations from its actual operational output — not from accounting constructs, narrative projections, or asset sales.",
                },
              ].map(({ title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[#1E3A5F] bg-[#0D2847] p-5"
                >
                  <div className="text-sm font-medium text-white">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-[#A9BEDF]">{body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-18 md:grid-cols-[1.05fr_0.95fr] md:py-22">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">Platform</p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-5xl">
              Institutional-Grade Decision Infrastructure
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5C6472]">
              The platform converts company-level financial data into a structural map
              of the equity market — enabling cross-sectional diagnostics, historical
              cohort analysis, and company-level structural drilldowns.
            </p>
            <div className="mt-8">
              <Link
                href="/platform"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]"
              >
                View Platform Status
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#DDE0DC] bg-white p-7 shadow-[0_12px_32px_rgba(10,35,66,0.05)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="inline-flex rounded-2xl bg-[#E8EFE9] p-3 text-[#244636]">
                <Database className="h-5 w-5" />
              </div>
              <div className="text-sm font-medium uppercase tracking-[0.14em] text-[#8A92A0]">
                Platform Roadmap
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-start justify-between rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-5">
                <div>
                  <div className="text-sm font-medium text-[#0A1F3D]">Structural market map</div>
                  <div className="mt-1 text-sm text-[#5C6472]">
                    Full-universe OSMR scoring across all three axes.
                  </div>
                </div>
                <div className="ml-4 shrink-0 rounded-full bg-[#E8EFE9] px-3 py-1 text-xs font-medium text-[#244636]">
                  Live
                </div>
              </div>

              <div className="flex items-start justify-between rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-5">
                <div>
                  <div className="text-sm font-medium text-[#0A1F3D]">Historical cohort analysis</div>
                  <div className="mt-1 text-sm text-[#5C6472]">
                    Forward return outcomes across structural regimes, 12M horizon.
                  </div>
                </div>
                <div className="ml-4 shrink-0 rounded-full bg-[#E8EFE9] px-3 py-1 text-xs font-medium text-[#244636]">
                  Live
                </div>
              </div>

              <div className="flex items-start justify-between rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-5">
                <div>
                  <div className="text-sm font-medium text-[#0A1F3D]">Company-level drilldowns</div>
                  <div className="mt-1 text-sm text-[#5C6472]">
                    Individual ticker structural profiles, regime context, trajectory history.
                  </div>
                </div>
                <div className="ml-4 shrink-0 rounded-full bg-[#ECEDE7] px-3 py-1 text-xs font-medium text-[#5B665E]">
                  Coming Next
                </div>
              </div>

              <div className="flex items-start justify-between rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-5">
                <div>
                  <div className="text-sm font-medium text-[#0A1F3D]">Market structure analytics</div>
                  <div className="mt-1 text-sm text-[#5C6472]">
                    Options and spread microstructure signals layered on structural scores.
                  </div>
                </div>
                <div className="ml-4 shrink-0 rounded-full bg-[#ECEDE7] px-3 py-1 text-xs font-medium text-[#5B665E]">
                  Planned
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-18 md:py-22">
          <div className="rounded-[2rem] border border-[#DDE0DC] bg-white p-8 shadow-[0_12px_32px_rgba(10,35,66,0.05)] md:p-10">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
                  Our Story
                </p>
                <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-5xl">
                  Why The Capital Steward exists.
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5C6472]">
                  This platform was built on a simple conviction: most financial
                  analysis is downstream of narrative, not upstream of it. The
                  Capital Steward is a space to think structurally — honestly,
                  without the incentive distortions that shape how most financial
                  information gets packaged and sold.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 md:justify-end">
                <Link
                  href="/our-story"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]"
                >
                  Read Our Story
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/our-philosophy"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#D4CDBF] bg-[#F7F8F6] px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]"
                >
                  Our Philosophy
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}