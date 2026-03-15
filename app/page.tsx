import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, Shield, Radar, Workflow } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F5F2EA] text-[#1E2228]">
      <header className="sticky top-0 z-50 border-b border-[#E3DED2] bg-[#F5F2EA]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl">
              <Image
                src="/tcs_logo.png"
                alt="The Capital Steward"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="tcs-heading text-2xl font-semibold tracking-tight text-[#0A2342] md:text-3xl">
              The Capital Steward
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#5C6472] md:flex">
            <Link href="/philosophy" className="transition hover:text-[#0A2342]">
              Our Philosophy
            </Link>
            <Link href="/coming-soon" className="transition hover:text-[#0A2342]">
              Our Platform
            </Link>
            <Link href="/story" className="transition hover:text-[#0A2342]">
              Our Story
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-[#E3DED2]">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-28">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.18em] text-[#4A6FA5]">
              Independent Market Intelligence
            </p>

            <h1 className="tcs-heading text-5xl font-semibold leading-[1.02] tracking-tight text-[#0A2342] md:text-7xl">
              Structural Market Intelligence for Serious Investors
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#5C6472] md:text-xl">
              The Capital Steward is an independent research platform built to identify where
              structural fragility, resilience, and valuation risk are concentrated across the
              equity market.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/coming-soon"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0A2342] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]"
              >
                Open Platform
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/philosophy"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#D4CDBF] bg-white px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#4A6FA5] hover:text-[#0A2342]"
              >
                Explore OSMR Framework
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full rounded-[2rem] border border-[#E3DED2] bg-white p-6 shadow-[0_20px_60px_rgba(10,35,66,0.08)] md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
                    OSMR
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#0A2342]">
                    Structural Risk Surface
                  </h2>
                </div>
                <div className="rounded-full bg-[#F5F2EA] px-3 py-1 text-xs font-medium text-[#4A6FA5]">
                  Research Preview
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-[#EAE5D8] bg-[#FBFAF7] p-4">
                  <div className="text-sm font-medium text-[#0A2342]">Axis I</div>
                  <div className="mt-1 text-sm text-[#5C6472]">
                    Valuation pressure within the operational anchor ladder
                  </div>
                </div>

                <div className="rounded-2xl border border-[#EAE5D8] bg-[#FBFAF7] p-4">
                  <div className="text-sm font-medium text-[#0A2342]">Axis II</div>
                  <div className="mt-1 text-sm text-[#5C6472]">
                    Cash-engine trajectory across time, not just static profitability
                  </div>
                </div>

                <div className="rounded-2xl border border-[#EAE5D8] bg-[#FBFAF7] p-4">
                  <div className="text-sm font-medium text-[#0A2342]">Axis III</div>
                  <div className="mt-1 text-sm text-[#5C6472]">
                    Financing fragility through debt-service resilience
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-[#0A2342] p-5 text-white">
                <div className="text-xs uppercase tracking-[0.18em] text-[#A9BEDF]">
                  Core Output
                </div>
                <div className="mt-2 text-lg font-medium">
                  A structural map of where resilience and fragility are concentrated across the
                  equity market.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E3DED2]">
        <div className="mx-auto max-w-7xl px-6 py-18 md:py-22">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              Research Lens
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold text-[#0A2342] md:text-4xl">
              Focus, scope, and method.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-[#E3DED2] bg-white p-7 shadow-[0_12px_32px_rgba(10,35,66,0.05)]">
              <div className="mb-5 inline-flex rounded-2xl bg-[#F5F2EA] p-3 text-[#4A6FA5]">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-semibold text-[#0A2342]">Focus</h3>
              <p className="mt-4 text-base leading-7 text-[#5C6472]">
                We study the underlying conditions that shape valuation, cash-flow durability, and
                financing resilience. The goal is to identify structural risk before it becomes
                obvious in market narratives.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[#E3DED2] bg-white p-7 shadow-[0_12px_32px_rgba(10,35,66,0.05)]">
              <div className="mb-5 inline-flex rounded-2xl bg-[#F5F2EA] p-3 text-[#4A6FA5]">
                <Radar className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-semibold text-[#0A2342]">Scope</h3>
              <p className="mt-4 text-base leading-7 text-[#5C6472]">
                Our work is cross-sectional by design, built to compare firms across the public
                equity market on a common structural basis. That makes fragility easier to rank,
                segment, and monitor over time.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-[#E3DED2] bg-white p-7 shadow-[0_12px_32px_rgba(10,35,66,0.05)]">
              <div className="mb-5 inline-flex rounded-2xl bg-[#F5F2EA] p-3 text-[#4A6FA5]">
                <Workflow className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-semibold text-[#0A2342]">Method</h3>
              <p className="mt-4 text-base leading-7 text-[#5C6472]">
                OSMR evaluates firms across valuation pressure, cash-engine trajectory, and
                financing fragility. Together, those three dimensions form a map of where
                resilience and risk are structurally concentrated.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E3DED2] bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-18 md:grid-cols-[0.95fr_1.05fr] md:py-22">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              Core Framework
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A2342] md:text-5xl">
              A three-axis model for mapping the structural fragility that underlies market
              valuations.
            </h2>
          </div>

          <div className="space-y-6">
            <p className="text-lg leading-8 text-[#5C6472]">
              The model ranks companies independently across valuation pressure, cash-engine
              trajectory, and financing fragility to identify where structural resilience and
              structural risk are concentrated.
            </p>

            <div className="grid gap-4">
              <div className="rounded-2xl border border-[#EAE5D8] bg-[#FBFAF7] p-5">
                <div className="text-sm font-medium text-[#0A2342]">
                  Narrative Fragility
                </div>
                <div className="mt-2 text-sm leading-6 text-[#5C6472]">
                  How far up the income statement the market must climb to justify valuation.
                </div>
              </div>

              <div className="rounded-2xl border border-[#EAE5D8] bg-[#FBFAF7] p-5">
                <div className="text-sm font-medium text-[#0A2342]">
                  Cash-Flow Fragility
                </div>
                <div className="mt-2 text-sm leading-6 text-[#5C6472]">
                  Whether cash generation is durable, deteriorating, or only superficially stable.
                </div>
              </div>

              <div className="rounded-2xl border border-[#EAE5D8] bg-[#FBFAF7] p-5">
                <div className="text-sm font-medium text-[#0A2342]">
                  Financing Fragility
                </div>
                <div className="mt-2 text-sm leading-6 text-[#5C6472]">
                  How resilient a firm is to tighter financial conditions and debt-service strain.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E3DED2]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-18 md:grid-cols-[1.05fr_0.95fr] md:py-22">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              Platform
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A2342] md:text-5xl">
              Institutional-Grade Research Infrastructure
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5C6472]">
              Our platform converts company-level financial data into a structural map of the
              equity market, enabling cross-sectional diagnostics, regime analysis, and
              company-level drilldowns.
            </p>

            <div className="mt-8">
              <Link
                href="/coming-soon"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0A2342] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]"
              >
                View Platform Status
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#E3DED2] bg-white p-7 shadow-[0_12px_32px_rgba(10,35,66,0.05)]">
            <div className="grid gap-4">
              <div className="flex items-start justify-between rounded-2xl border border-[#EAE5D8] bg-[#FBFAF7] p-5">
                <div>
                  <div className="text-sm font-medium text-[#0A2342]">Cross-sectional diagnostics</div>
                  <div className="mt-1 text-sm text-[#5C6472]">
                    Rank structural fragility across the equity universe.
                  </div>
                </div>
                <div className="rounded-full bg-[#EAF1FB] px-3 py-1 text-xs font-medium text-[#4A6FA5]">
                  Live
                </div>
              </div>

              <div className="flex items-start justify-between rounded-2xl border border-[#EAE5D8] bg-[#FBFAF7] p-5">
                <div>
                  <div className="text-sm font-medium text-[#0A2342]">Historical cohort analysis</div>
                  <div className="mt-1 text-sm text-[#5C6472]">
                    Compare forward outcomes across structural regimes.
                  </div>
                </div>
                <div className="rounded-full bg-[#EAF1FB] px-3 py-1 text-xs font-medium text-[#4A6FA5]">
                  In Build
                </div>
              </div>

              <div className="flex items-start justify-between rounded-2xl border border-[#EAE5D8] bg-[#FBFAF7] p-5">
                <div>
                  <div className="text-sm font-medium text-[#0A2342]">Company-level drilldowns</div>
                  <div className="mt-1 text-sm text-[#5C6472]">
                    Detailed entity pages, regime context, and research layers.
                  </div>
                </div>
                <div className="rounded-full bg-[#F3EFE6] px-3 py-1 text-xs font-medium text-[#8A92A0]">
                  Coming Next
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-18 md:py-22">
          <div className="rounded-[2rem] border border-[#E3DED2] bg-white p-8 shadow-[0_12px_32px_rgba(10,35,66,0.05)] md:p-10">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-end">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
                  Our Story
                </p>
                <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A2342] md:text-5xl">
                  Learn more about the origin of The Capital Steward.
                </h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5C6472]">
                  The platform grew out of a simple conviction: markets spend too much time
                  debating narratives and not enough time mapping structure. Read more about the
                  philosophy and perspective behind the work.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 md:justify-end">
                <Link
                  href="/story"
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#0A2342] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]"
                >
                  Read Our Story
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/philosophy"
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#D4CDBF] bg-[#FBFAF7] px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#4A6FA5] hover:text-[#0A2342]"
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