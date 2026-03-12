import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F5F2EA] text-[#1E2228]">
      <section className="border-b border-[#E3DED2]">
        <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-10 md:px-10 lg:px-12">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/tcs-logo.png"
                alt="The Capital Steward logo"
                className="h-12 w-12 rounded-sm object-contain"
              />
              <div className="leading-tight">
                <div className="text-xs uppercase tracking-[0.18em] text-[#8A92A0]">
                  The Capital Steward
                </div>
                <div className="text-sm text-[#5C6472]">
                  Structural Market Research
                </div>
              </div>
            </div>

            <nav className="hidden items-center gap-8 text-sm text-[#5C6472] md:flex">
              <a href="#framework" className="transition hover:text-[#0A1730]">
                Framework
              </a>
              <a href="#platform" className="transition hover:text-[#0A1730]">
                Platform
              </a>
              <a href="#philosophy" className="transition hover:text-[#0A1730]">
                Philosophy
              </a>
              <Link href="/dashboard" className="transition hover:text-[#0A1730]">
                Dashboard
              </Link>
            </nav>
          </header>

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center rounded-full border border-[#E3DED2] bg-white px-4 py-2 text-sm text-[#5C6472]">
                Independent Research Infrastructure
              </div>

              <h1 className="tcs-display max-w-4xl text-5xl font-semibold text-[#0A1730] md:text-7xl">
                Structural intelligence for capital allocation.
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-[#5C6472] md:text-xl">
                The Capital Steward is an independent research platform focused on
                structural corporate risk, valuation fragility, cash-engine
                trajectory, and financing resilience across the equity market.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-[#0A1730] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#10203D]"
                >
                  Enter Dashboard
                </Link>

                <a
                  href="#framework"
                  className="rounded-2xl border border-[#E3DED2] bg-white px-6 py-3 text-sm font-medium text-[#1E2228] transition hover:bg-[#F8F6F0]"
                >
                  Explore Framework
                </a>
              </div>

              <div className="mt-12 grid max-w-2xl gap-6 sm:grid-cols-3">
                <div>
                  <div className="text-sm uppercase tracking-[0.12em] text-[#8A92A0]">
                    Focus
                  </div>
                  <div className="mt-2 text-base text-[#1E2228]">
                    Structural market research
                  </div>
                </div>
                <div>
                  <div className="text-sm uppercase tracking-[0.12em] text-[#8A92A0]">
                    Scope
                  </div>
                  <div className="mt-2 text-base text-[#1E2228]">
                    Equity universe diagnostics
                  </div>
                </div>
                <div>
                  <div className="text-sm uppercase tracking-[0.12em] text-[#8A92A0]">
                    Method
                  </div>
                  <div className="mt-2 text-base text-[#1E2228]">
                    Three-axis structural framework
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-[#E3DED2] bg-white p-5 shadow-[0_18px_60px_rgba(10,23,48,0.06)]">
                <div className="rounded-[1.5rem] bg-[#0A1730] p-6 text-[#E8EDF5]">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-[#7F90AD]">
                        OSMR Snapshot
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        Structural Market Map
                      </div>
                    </div>
                    <div className="rounded-full border border-[#243A61] bg-[#10203D] px-3 py-1 text-xs text-[#B7C3D8]">
                      Live Prototype
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] border border-[#243A61] bg-[#10203D] p-4">
                    <div className="mb-4 flex items-center justify-between text-sm text-[#B7C3D8]">
                      <span>Valuation Pressure</span>
                      <span>Cash Trajectory</span>
                    </div>

                    <div className="relative h-[280px] overflow-hidden rounded-[1rem] border border-[#243A61] bg-[#0C1A33]">
                      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div key={i} className="border border-[#132747]" />
                        ))}
                      </div>

                      <div className="absolute left-1/2 top-0 h-full w-px bg-[#243A61]" />
                      <div className="absolute top-1/2 h-px w-full bg-[#243A61]" />

                      <div className="absolute left-[18%] top-[66%] h-3 w-3 rounded-full bg-[#3E8E6A]" />
                      <div className="absolute left-[29%] top-[58%] h-3 w-3 rounded-full bg-[#5E7FBE]" />
                      <div className="absolute left-[42%] top-[48%] h-3 w-3 rounded-full bg-[#8EA7D8]" />
                      <div className="absolute left-[57%] top-[36%] h-3 w-3 rounded-full bg-[#5E7FBE]" />
                      <div className="absolute left-[70%] top-[30%] h-3 w-3 rounded-full bg-[#C94C4C]" />
                      <div className="absolute left-[76%] top-[62%] h-3 w-3 rounded-full bg-[#C94C4C]" />
                      <div className="absolute left-[62%] top-[70%] h-3 w-3 rounded-full bg-[#8EA7D8]" />
                      <div className="absolute left-[24%] top-[31%] h-3 w-3 rounded-full bg-[#3E8E6A]" />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-[#243A61] bg-[#0C1A33] p-3">
                        <div className="text-xs uppercase tracking-[0.14em] text-[#7F90AD]">
                          Axis I
                        </div>
                        <div className="mt-2 text-sm text-[#E8EDF5]">
                          Valuation vs anchor
                        </div>
                      </div>
                      <div className="rounded-2xl border border-[#243A61] bg-[#0C1A33] p-3">
                        <div className="text-xs uppercase tracking-[0.14em] text-[#7F90AD]">
                          Axis II
                        </div>
                        <div className="mt-2 text-sm text-[#E8EDF5]">
                          Cash-engine trajectory
                        </div>
                      </div>
                      <div className="rounded-2xl border border-[#243A61] bg-[#0C1A33] p-3">
                        <div className="text-xs uppercase tracking-[0.14em] text-[#7F90AD]">
                          Axis III
                        </div>
                        <div className="mt-2 text-sm text-[#E8EDF5]">
                          Financing fragility
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[#8EA7D8]/20 blur-2xl" />
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#5E7FBE]/20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section id="framework" className="border-b border-[#E3DED2] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
          <div className="max-w-3xl">
            <div className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-[#8A92A0]">
              Core Framework
            </div>
            <h2 className="text-4xl font-semibold tracking-[-0.03em] text-[#0A1730] md:text-5xl">
              A three-axis model for mapping structural fragility.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5C6472]">
              The platform ranks companies independently across valuation pressure,
              free cash flow trajectory, and financing fragility to identify where
              resilience and risk are structurally concentrated.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-[#E3DED2] p-8">
              <div className="mb-4 text-sm uppercase tracking-[0.14em] text-[#8A92A0]">
                Axis I
              </div>
              <h3 className="text-2xl font-semibold text-[#0A1730]">
                Operational Fragility
              </h3>
              <p className="mt-4 leading-8 text-[#5C6472]">
                We measure how far up the income statement the market must climb to
                justify valuation, from free cash flow to revenue.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#E3DED2] p-8">
              <div className="mb-4 text-sm uppercase tracking-[0.14em] text-[#8A92A0]">
                Axis II
              </div>
              <h3 className="text-2xl font-semibold text-[#0A1730]">
                Cash-Engine Trajectory
              </h3>
              <p className="mt-4 leading-8 text-[#5C6472]">
                We evaluate whether free cash flow is strengthening or deteriorating
                over time, adjusting for scale and consistency rather than chasing
                raw extremes.
              </p>
            </div>

            <div className="rounded-[2rem] border border-[#E3DED2] p-8">
              <div className="mb-4 text-sm uppercase tracking-[0.14em] text-[#8A92A0]">
                Axis III
              </div>
              <h3 className="text-2xl font-semibold text-[#0A1730]">
                Financing Fragility
              </h3>
              <p className="mt-4 leading-8 text-[#5C6472]">
                We rank firms by how vulnerable their capital structure is to tighter
                financial conditions using a debt-service ladder rather than a single
                one-size-fits-all ratio.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="border-b border-[#E3DED2] bg-[#F5F2EA]">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <div className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-[#8A92A0]">
                Platform
              </div>
              <h2 className="text-4xl font-semibold tracking-[-0.03em] text-[#0A1730] md:text-5xl">
                Institutional-grade research infrastructure.
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#5C6472]">
                The dashboard converts company-level financial statements into a
                structural risk map of the equity market, enabling cross-sectional
                diagnostics, cohort analysis, and company-level drilldowns.
              </p>

              <div className="mt-10">
                <Link
                  href="/dashboard"
                  className="inline-flex rounded-2xl bg-[#35598F] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Open Dashboard
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#E3DED2] bg-white p-6 shadow-[0_18px_60px_rgba(10,23,48,0.05)]">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#E3DED2] p-5">
                  <div className="text-xs uppercase tracking-[0.14em] text-[#8A92A0]">
                    Market Map
                  </div>
                  <div className="mt-3 text-lg font-medium text-[#0A1730]">
                    Cross-sectional structural view
                  </div>
                </div>
                <div className="rounded-2xl border border-[#E3DED2] p-5">
                  <div className="text-xs uppercase tracking-[0.14em] text-[#8A92A0]">
                    Cohorts
                  </div>
                  <div className="mt-3 text-lg font-medium text-[#0A1730]">
                    Bucketed regime diagnostics
                  </div>
                </div>
                <div className="rounded-2xl border border-[#E3DED2] p-5">
                  <div className="text-xs uppercase tracking-[0.14em] text-[#8A92A0]">
                    Valuation Ladder
                  </div>
                  <div className="mt-3 text-lg font-medium text-[#0A1730]">
                    Anchor migration analysis
                  </div>
                </div>
                <div className="rounded-2xl border border-[#E3DED2] p-5">
                  <div className="text-xs uppercase tracking-[0.14em] text-[#8A92A0]">
                    Historical Engine
                  </div>
                  <div className="mt-3 text-lg font-medium text-[#0A1730]">
                    Longitudinal regime tracking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="philosophy" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-12">
          <div className="max-w-4xl">
            <div className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-[#8A92A0]">
              Research Philosophy
            </div>
            <h2 className="text-4xl font-semibold tracking-[-0.03em] text-[#0A1730] md:text-5xl">
              Markets spend a lot of time debating narratives. We are more interested in mapping structure.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#5C6472]">
              The Capital Steward is built to surface where structural resilience
              exists, where fragility is hiding, and how those conditions evolve
              across the corporate economy.
            </p>
          </div>

          <div className="mt-14 flex flex-col gap-6 border-t border-[#E3DED2] pt-8 text-sm text-[#8A92A0] md:flex-row md:items-center md:justify-between">
            <div>© The Capital Steward</div>
            <div className="flex gap-6">
              <Link href="/dashboard" className="transition hover:text-[#0A1730]">
                Dashboard
              </Link>
              <a href="#framework" className="transition hover:text-[#0A1730]">
                Framework
              </a>
              <a href="#platform" className="transition hover:text-[#0A1730]">
                Platform
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}