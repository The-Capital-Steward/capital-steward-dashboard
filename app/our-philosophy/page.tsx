import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OurPhilosophyPage() {
  return (
    <main className="min-h-screen bg-[#F1F3F0] text-[#1E2228]">

      {/* ── Hero ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-4xl px-6 py-18 md:py-24">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#244636]">
            Our Philosophy
          </p>

          <h1 className="tcs-heading mt-4 max-w-3xl text-5xl font-semibold leading-[1.03] tracking-tight text-[#0A1F3D] md:text-6xl">
            Markets debate narratives.
            <br />
            We map structure.
          </h1>

          <div className="mt-8 max-w-3xl border-l border-[#C9D8CD] pl-5">
            <p className="text-lg leading-8 text-[#5C6472] md:text-[19px]">
              Most market analysis begins with stories. We begin with structure.
            </p>
          </div>
        </div>
      </section>

      {/* ── Opening argument ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-3xl border-l border-[#C9D8CD] pl-5 space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
            <p>
              Valuations depend on underlying operating reality. Cash flows determine
              sustainability. Balance sheets define resilience under pressure.
            </p>
            <p>
              The Capital Steward exists to study those conditions directly—not as a
              complement to narrative analysis, but as an alternative foundation for
              understanding the market.
            </p>
          </article>
        </div>
      </section>

      {/* ── The problem ── */}
      <section className="border-b border-[#DDE0DC] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              The problem
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-[2.35rem]">
              The failure is not a lack of data.
              <br />
              It is a lack of structure.
            </h2>

            <div className="mt-8 space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              <p>
                Modern market analysis tends to fragment reality. Companies are evaluated
                through isolated datapoints — quarterly earnings, revenue growth rates,
                macro overlays, analyst revisions. Each may be directionally useful. None,
                in isolation, explains whether a company is structurally durable or
                structurally fragile.
              </p>
              <p>
                Markets rarely break because of a single data point. They break when
                fragility accumulates beneath the surface — often unnoticed, often
                misinterpreted, and often justified through narrative.
              </p>
            </div>

            {/* Pattern cards */}
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  label: "Pattern one",
                  text: "Valuations persist despite weakening fundamentals.",
                },
                {
                  label: "Pattern two",
                  text: "Profitability masks deteriorating cash generation.",
                },
                {
                  label: "Pattern three",
                  text: "Balance sheets quietly absorb risk until they cannot.",
                },
              ].map(({ label, text }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-5"
                >
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
                    {label}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#4F5968]">{text}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* ── Structural approach — bridge ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              The approach
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-[2.35rem]">
              A structural approach to market analysis
            </h2>

            <div className="mt-6 space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              <p>
                The Capital Steward is built around a different premise: companies should
                be evaluated based on the structural conditions that support—or fail to
                support—their valuation.
              </p>
              <p>
                This requires moving away from isolated metrics and toward a system that
                captures how valuation is justified, how cash is actually generated over
                time, and how financial obligations are sustained.
              </p>
              <p>
                To do this, we evaluate companies across three structural dimensions.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── Three pillars — DARK BAND ── */}
      <section className="border-b border-[#0D2440] bg-[#0A1F3D]">
        <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
              Framework
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-white md:text-[2.35rem]">
              The three structural pillars
            </h2>

            <div className="mt-10 space-y-6">

              {/* Pillar I */}
              <div className="rounded-[1.75rem] border border-[#203754] bg-[#0D2847] p-7">
                <div className="flex items-start gap-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C9D8CD] bg-[#E8EFE9] text-xs font-medium text-[#244636]">
                    I
                  </div>
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
                      Valuation Pressure
                    </div>
                    <h3 className="tcs-heading mt-2 text-xl font-semibold text-white">
                      Valuation anchor depth
                    </h3>
                    <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#A9BEDF]">
                      <p>
                        Valuation is not a single number. It is a relationship between
                        price and an underlying operating anchor.
                      </p>
                      <p>
                        The key question is: how far up the income statement must the
                        market climb to justify valuation? Companies supported by free
                        cash flow or earnings possess stronger anchors. Companies
                        requiring revenue-based justification — or lacking positive
                        operating anchors entirely — depend increasingly on narrative.
                      </p>
                      <p>
                        This creates a measurable gradient of valuation fragility.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pillar II */}
              <div className="rounded-[1.75rem] border border-[#203754] bg-[#0D2847] p-7">
                <div className="flex items-start gap-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C9D8CD] bg-[#E8EFE9] text-xs font-medium text-[#244636]">
                    II
                  </div>
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
                      Cash-Flow Fragility
                    </div>
                    <h3 className="tcs-heading mt-2 text-xl font-semibold text-white">
                      Free cash flow durability
                    </h3>
                    <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#A9BEDF]">
                      <p>
                        Profitability is not the same as cash generation. A company may
                        report earnings while producing inconsistent, deteriorating, or
                        structurally weak free cash flow.
                      </p>
                      <p>
                        The critical dimension is not a single period. It is behavior
                        across time — the consistency of cash production, the directional
                        trajectory of free cash flow, and the difference between stability
                        and deterioration.
                      </p>
                      <p>
                        Durable cash generation signals structural resilience. Unstable or
                        declining cash generation introduces fragility.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pillar III */}
              <div className="rounded-[1.75rem] border border-[#203754] bg-[#0D2847] p-7">
                <div className="flex items-start gap-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C9D8CD] bg-[#E8EFE9] text-xs font-medium text-[#244636]">
                    III
                  </div>
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
                      Financing Fragility
                    </div>
                    <h3 className="tcs-heading mt-2 text-xl font-semibold text-white">
                      Debt-service resilience
                    </h3>
                    <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#A9BEDF]">
                      <p>
                        A company's survival is not determined solely by operations. It is
                        also determined by its ability to meet financial obligations.
                      </p>
                      <p>
                        As financial conditions tighten, this dimension becomes
                        increasingly important. We evaluate the relationship between
                        operating earnings and interest expense, the margin of safety in
                        debt-service capacity, and vulnerability to changing credit
                        conditions.
                      </p>
                      <p>
                        Companies with weak coverage ratios are structurally exposed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Market structure ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              Market Structure
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-[2.35rem]">
              From company analysis to market structure
            </h2>

            <div className="mt-6 space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              <p>
                Most research evaluates companies individually. But structural fragility
                becomes more meaningful when viewed across the entire market.
              </p>
              <p>
                By evaluating companies along consistent structural dimensions, we can
                rank firms by fragility and resilience, identify concentrations of
                structural risk, and observe how these distributions evolve over time.
              </p>
              <p>
                This transforms analysis from isolated observations into a coherent
                market-wide diagnostic system. The result is not a collection of
                opinions. It is a structural map.
              </p>
            </div>

            {/* Output summary card */}
            <div className="mt-10 rounded-2xl border border-[#DDE0DC] bg-white p-7 shadow-[0_10px_30px_rgba(10,35,66,0.04)]">
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    label: "Rank",
                    text: "Firms by structural fragility and resilience across the equity universe.",
                  },
                  {
                    label: "Identify",
                    text: "Concentrations of structural risk before they become visible in price.",
                  },
                  {
                    label: "Monitor",
                    text: "How these structural distributions shift over time and across regimes.",
                  },
                ].map(({ label, text }) => (
                  <div key={label}>
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#244636]">
                      {label}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#5C6472]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ── Closing philosophy ── */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              Conviction
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-[2.35rem]">
              Narratives are constrained by structure.
            </h2>

            <div className="mt-6 space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              <p>
                Markets will always be driven by narratives in the short term. But
                narratives are constrained by structure. Valuations must ultimately
                reconcile with operating reality. Cash generation cannot be substituted
                indefinitely. Financial obligations must be met.
              </p>
            </div>

            <div className="my-10 border-l-2 border-[#244636] pl-6">
              <p className="tcs-heading text-2xl font-semibold leading-tight text-[#0A1F3D] md:text-[2rem]">
                The purpose of this platform is not to chase narratives.
                <br />
                It is to map the conditions that determine which companies endure.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/platform"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]"
              >
                Open Platform
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/our-story"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#DDE0DC] bg-white px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]"
              >
                Read Our Story
              </Link>
            </div>
          </article>
        </div>
      </section>

    </main>
  );
}