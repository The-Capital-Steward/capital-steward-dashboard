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
            Markets price through narrative.
            <br />
            We measure the structure beneath it.
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
              Markets are psychosocial systems. The financials participants choose to
              focus on are selected because they more easily support a narrative —
              not because they most honestly represent the firm's economic reality.
            </p>
            <p>
              A company will point to the deepest operational anchor it can credibly
              claim. If it can justify its valuation with free cash flow, it will. If
              it cannot, it ascends the financial statement — to earnings, to operating
              income, to revenue — until it finds a metric the market will accept.
              Each step up the ladder lengthens the narrative bridge between price
              and economic reality.
            </p>
            <p>
              The Capital Steward exists to measure that bridge — and to identify
              where it has grown too long to hold.
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
                misinterpreted, and often justified through narrative until the narrative
                no longer holds. The same mechanisms that inflate a valuation can
                deflate it, and the deflation is rarely slower than the inflation.
              </p>
            </div>

            {/* Pattern cards */}
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  label: "Pattern one",
                  text: "Valuations persist despite weakening operational anchors.",
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

      {/* ── Structural approach ── */}
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
                be evaluated based on how deeply their valuation is anchored to real
                operational output — and how much narrative is required to bridge the gap.
              </p>
              <p>
                This requires moving away from isolated metrics and toward a system that
                captures the quality of the anchor, whether that anchor is improving or
                deteriorating over time, and whether the firm can service its obligations
                from that anchor.
              </p>
              <p>
                To do this, we evaluate companies across three structural dimensions.
                Every dimension speaks to the same operational anchor throughout.
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
              The three structural dimensions
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
                      Operational Anchor Risk
                    </div>
                    <h3 className="tcs-heading mt-2 text-xl font-semibold text-white">
                      Narrative Bridge Risk
                    </h3>
                    <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#A9BEDF]">
                      <p>
                        A firm will use the deepest operational anchor it can credibly
                        claim to justify its valuation. If free cash flow supports that
                        valuation, the bridge between price and economic reality is short.
                        If the market must reach to revenue — or beyond — the bridge grows
                        long, fragile, and dependent on conditions outside the firm's control.
                      </p>
                      <p>
                        We measure the length of that bridge by comparing enterprise value
                        to the firm's deepest credible anchor, adjusted for the reliability
                        of that anchor. FCF is the most credible anchor because it is the
                        hardest to sustain. Revenue is the least credible because it is the
                        easiest. The penalty for anchor shallowness reflects the length and
                        fragility of the narrative required.
                      </p>
                      <p>
                        This creates a measurable gradient of valuation fragility —
                        not a judgment on whether the stock is mispriced today, but a
                        structural assessment of how vulnerable its price is to narrative
                        deflation.
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
                      Operational Trajectory Risk
                    </div>
                    <h3 className="tcs-heading mt-2 text-xl font-semibold text-white">
                      Narrative Durability Risk
                    </h3>
                    <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#A9BEDF]">
                      <p>
                        A firm whose anchor is consistently improving is shortening its
                        narrative bridge over time — it is becoming more grounded. A firm
                        whose anchor is deteriorating is lengthening it — becoming more
                        dependent on narrative to sustain its valuation.
                      </p>
                      <p>
                        We measure this by evaluating the YoY consistency of the firm's
                        anchor metric across the trailing 28 quarters, weighted toward
                        recency. The same penalty structure applies as in Axis I: a
                        Revenue company demonstrating consistent revenue growth receives
                        less credit than an FCF company demonstrating consistent FCF
                        growth, because the signal is weaker and easier to sustain
                        without genuine operational progress.
                      </p>
                      <p>
                        Durable anchor improvement signals a shortening narrative bridge.
                        Deterioration signals a lengthening one.
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
                      Operational Financing Risk
                    </div>
                    <h3 className="tcs-heading mt-2 text-xl font-semibold text-white">
                      Obligation Risk
                    </h3>
                    <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#A9BEDF]">
                      <p>
                        Debt is not inherently fragile. A mature firm running significant
                        debt with strong FCF coverage is structurally sound — the
                        obligations are justified by the cash generation capacity. What
                        creates fragility is the gap between what a firm owes and what it
                        can credibly produce to service it.
                      </p>
                      <p>
                        We evaluate interest coverage using the same operational anchor
                        the firm is assigned to throughout the framework. A firm anchored
                        to FCF is evaluated on FCF coverage. A firm anchored to EBIT is
                        evaluated on EBIT coverage. The same anchor speaks to the same
                        obligation — consistently, without substitution.
                      </p>
                      <p>
                        Companies unable to service obligations from their actual
                        operational output are structurally exposed — regardless of what
                        narrative surrounds their balance sheet.
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
                By scoring every company on the same three-axis framework, we can rank
                firms by structural fragility and resilience, identify where narrative
                dependence is most concentrated, and observe how these distributions
                shift over time. Historical cohort analysis links current structural
                states to real forward return outcomes — grounding the framework in
                empirical evidence, not theory.
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
                    text: "Where narrative dependence has outpaced financial reality — before that gap closes in price.",
                  },
                  {
                    label: "Monitor",
                    text: "How these structural distributions shift over time and across market regimes.",
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

      {/* ── Closing conviction ── */}
      <section className="border-b border-[#DDE0DC]">
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
              <p>
                A company with robust, deep operational anchoring does not need narrative
                to justify its price. The CEO does not need cult charisma. The firm
                simply needs to generate real economic output consistently, profitably,
                and in a growing way. Structure eventually speaks for itself.
              </p>
            </div>

            <div className="my-10 border-l-2 border-[#244636] pl-6">
              <p className="tcs-heading text-2xl font-semibold leading-tight text-[#0A1F3D] md:text-[2rem]">
                The purpose of this platform is not to chase narratives.
                <br />
                It is to map the conditions that determine which companies endure.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── Bridge to framework — NEW SECTION ── */}
      <section className="border-b border-[#DDE0DC] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              The Measurement
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-[2.35rem]">
              How we actually do it.
            </h2>

            <div className="mt-6 space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              <p>
                The three dimensions above are not abstractions. Each is a precise,
                quantifiable measurement applied to every company in the U.S. equity
                universe — roughly 4,800 companies, updated on a monthly cadence.
              </p>
              <p>
                The full methodology — how the Operational Anchor Ladder assigns each
                company to its deepest credible anchor, how the shallowness penalties
                are structured and why, how YoY consistency outperformed more
                mathematically sophisticated alternatives in cohort validation, and
                what 270,618 historical observations tell us about the relationship
                between structural risk and forward return distributions — is documented
                in full.
              </p>
              <p>
                It is written to be read by someone who wants to evaluate the framework
                honestly, not just use it. If that is you, it is worth the time.
              </p>
            </div>

            <div className="mt-10">
              <Link
                href="/the-osmr-framework"
                className="inline-flex items-center gap-2.5 rounded-2xl border border-[#0A1F3D] bg-[#0A1F3D] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]"
              >
                How We Measure Structural Risk
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* ── Final CTAs ── */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-3xl">
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