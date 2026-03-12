import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F5F2EA] text-[#1E2228]">
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-[#E3DED2] bg-white px-4 py-2 text-sm text-[#5C6472]">
            The Capital Steward
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-[#0A2342] md:text-7xl">
            Structural market research for serious investors.
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-[#5C6472] md:text-xl">
            The Capital Steward is a research platform focused on structural corporate risk,
            valuation fragility, cash-engine trajectory, and balance-sheet resilience across
            the equity market.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="rounded-2xl bg-[#0A2342] px-6 py-3 text-white transition hover:opacity-90"
            >
              Enter Dashboard
            </Link>

            <a
              href="#framework"
              className="rounded-2xl border border-[#E3DED2] bg-white px-6 py-3 text-[#1E2228] transition hover:bg-[#F8F6F0]"
            >
              Explore Framework
            </a>
          </div>
        </div>
      </section>

      <section id="framework" className="border-t border-[#E3DED2] bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-20 md:grid-cols-3">
          <div className="rounded-3xl border border-[#E3DED2] p-8">
            <div className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-[#8A92A0]">
              Axis I
            </div>
            <h2 className="text-2xl font-semibold text-[#0A2342]">
              Valuation vs Operating Anchor
            </h2>
            <p className="mt-4 leading-7 text-[#5C6472]">
              We measure how far up the income statement the market must climb to justify
              valuation, from free cash flow to revenue.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E3DED2] p-8">
            <div className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-[#8A92A0]">
              Axis II
            </div>
            <h2 className="text-2xl font-semibold text-[#0A2342]">
              Cash-Engine Trajectory
            </h2>
            <p className="mt-4 leading-7 text-[#5C6472]">
              We evaluate whether free cash flow is strengthening or deteriorating over time,
              adjusting for scale and consistency rather than chasing raw extremes.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E3DED2] p-8">
            <div className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-[#8A92A0]">
              Axis III
            </div>
            <h2 className="text-2xl font-semibold text-[#0A2342]">
              Financing Fragility
            </h2>
            <p className="mt-4 leading-7 text-[#5C6472]">
              We rank firms by how vulnerable their capital structure is to tighter financial
              conditions, using a debt-service ladder rather than a one-size-fits-all ratio.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[#E3DED2] bg-[#F5F2EA]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-[#8A92A0]">
              Research Philosophy
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-[#0A2342]">
              Markets spend a lot of time debating narratives. We are more interested in mapping structure.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#5C6472]">
              The platform is designed to surface where structural resilience exists, where
              fragility is hiding, and how those conditions evolve across the equity universe.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}