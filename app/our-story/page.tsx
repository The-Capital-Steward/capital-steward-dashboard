export default function OurStoryPage() {
  return (
    <main className="min-h-screen bg-[#F1F3F0] text-[#1E2228]">

      {/* ── Hero ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-4xl px-6 py-18 md:py-24">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#244636]">
            Our Story
          </p>

          <h1 className="tcs-heading mt-4 max-w-3xl text-5xl font-semibold leading-[1.03] tracking-tight text-[#0A1F3D] md:text-6xl">
            Why The Capital Steward exists.
          </h1>

          <div className="mt-8 max-w-3xl border-l border-[#C9D8CD] pl-5">
            <p className="text-lg leading-8 text-[#5C6472] md:text-[19px]">
              The Capital Steward grew out of a long-standing conviction about how
              markets are studied — and how they are often misunderstood.
            </p>
          </div>
        </div>
      </section>

      {/* ── Origin + Thesis question ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-14">
          <article className="mx-auto max-w-3xl">
            <div className="space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              <p>
                Much of modern financial discourse revolves around narratives: the story
                of the moment, the theme of the quarter, the dominant interpretation of
                recent price movements. These narratives can be useful, but they also
                have a tendency to obscure the deeper forces shaping the market beneath
                the surface.
              </p>
              <p>
                The financials participants choose to focus on are rarely selected because
                they most honestly represent a company's economic reality. They are
                selected because they more easily support a narrative. The central
                question that eventually led to the creation of this platform was simple:
              </p>
            </div>

            {/* Thesis question */}
            <div className="my-12 rounded-2xl border border-[#DDE0DC] bg-[#F7F8F5] px-8 py-10">
              <p className="tcs-heading max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-[#0A1F3D] md:text-[2rem]">
                What if we focused less on the stories markets tell and more on the
                structures that produce them?
              </p>
            </div>

            <div className="space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              <p>
                Over time, it became clear that many of the most important market
                outcomes — both successes and failures — can be traced back to structural
                conditions that were visible long before they were widely recognized.
                Companies that appeared strong were sometimes fragile in ways that
                traditional analysis did not capture. Others that appeared risky were
                structurally resilient.
              </p>
              <p>
                The problem was not that the information was unavailable. The problem was
                that it was rarely organized in a way that made these structural dynamics
                easy to see.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── Structure over narrative ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-14">
          <article className="mx-auto max-w-3xl">
            <div className="pt-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
                Perspective
              </p>
              <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-[2.35rem]">
                Structure over narrative
              </h2>

              <div className="mt-6 space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
                <p>
                  The Capital Steward was created to explore a different approach to
                  market research — one that emphasizes{" "}
                  <span className="font-medium text-[#1E2228]">structure over narrative</span>{" "}
                  and{" "}
                  <span className="font-medium text-[#1E2228]">diagnosis over prediction</span>.
                </p>
                <p>
                  Rather than attempting to forecast market movements directly, the work
                  here focuses on identifying the conditions that make certain outcomes
                  more or less likely. That means examining how deeply a company's
                  valuation is anchored to real operational output — and how much
                  narrative it requires to bridge the gap.
                </p>
                <p>
                  When these dimensions are examined systematically across the full
                  equity universe, patterns begin to emerge. Certain combinations of
                  structural characteristics appear repeatedly in both the most durable
                  businesses and the most fragile ones. The goal of this work is to map
                  those patterns clearly and consistently.
                </p>
              </div>
            </div>

            {/* Manifesto */}
            <div className="my-10 border-l-2 border-[#244636] pl-6">
              <p className="tcs-heading text-2xl font-semibold leading-tight text-[#0A1F3D] md:text-[2rem]">
                The goal is not prediction.
                <br />
                The goal is clarity.
              </p>
            </div>

            <div className="space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              <p>
                When the structural foundations of companies are easier to see, investors
                are better equipped to understand where fragility may be building, where
                resilience may be underappreciated, and how shifts in the financial
                environment might affect different parts of the market.
              </p>
              <p>
                In that sense, this work is less about predicting what will happen
                tomorrow and more about improving the way we interpret what is already
                happening beneath the surface.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── Framework — DARK BAND ── */}
      <section className="border-b border-[#0D2440] bg-[#0A1F3D]">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
              Framework
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-white md:text-[2.35rem]">
              How the framework emerged
            </h2>

            <div className="mt-6 space-y-6 text-[17px] leading-8 text-[#A9BEDF] md:text-[18px]">
              <p>
                The analytical framework that underpins this platform developed gradually
                through years of studying corporate financial statements, capital
                allocation behavior, and the ways companies navigate changing financial
                conditions.
              </p>
              <p>
                Markets frequently reward compelling narratives long before they test the
                underlying economics of a business. A firm will point to the deepest
                operational anchor it can credibly claim — free cash flow, earnings,
                operating income, revenue — to justify its valuation to the market. When
                conditions remain favorable, this dynamic can persist for extended
                periods. But when the environment shifts, the structural foundations of a
                company become far more important than the narrative surrounding it.
              </p>
              <p>
                At those moments, differences that once seemed subtle can become decisive.
                Some companies prove remarkably resilient. Others discover that their
                apparent strength depended on conditions that were never guaranteed to
                last — and on narratives that no longer hold.
              </p>
              <p>
                The{" "}
                <span className="font-medium text-white">
                  Operational Structure Mispricing Risk (OSMR) framework
                </span>{" "}
                emerged as a way of capturing these dynamics systematically, organizing
                companies across three structural dimensions — each speaking to the same
                operational anchor throughout:
              </p>
            </div>

            {/* Axis cards */}
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {[
                {
                  axis: "Axis I",
                  sub: "Operational Anchor Risk",
                  detail: "How much narrative is required to bridge this valuation to real operational output.",
                },
                {
                  axis: "Axis II",
                  sub: "Operational Trajectory Risk",
                  detail: "Whether the firm's operational anchor is consistently improving or deteriorating.",
                },
                {
                  axis: "Axis III",
                  sub: "Operational Financing Risk",
                  detail: "Whether the firm can service its obligations from its operational output.",
                },
              ].map(({ axis, sub, detail }) => (
                <div
                  key={axis}
                  className="rounded-xl border border-[#203754] bg-[#0D2847] px-4 py-5"
                >
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
                    {axis}
                  </div>
                  <div className="mt-2 text-sm font-medium text-white">{sub}</div>
                  <div className="mt-3 text-xs leading-5 text-[#A9BEDF]">{detail}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-[17px] leading-8 text-[#A9BEDF] md:text-[18px]">
              <p>
                Together, these axes create a map of how structural risk and resilience
                are distributed across the market — and link current structural states
                to real historical forward return outcomes.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── The founder's conviction ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-14">
          <article className="mx-auto max-w-3xl">
            <div className="pt-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
                Origin
              </p>
              <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-[2.35rem]">
                The founder's conviction
              </h2>

              <div className="my-8 rounded-2xl border border-[#DDE0DC] bg-white px-6 py-6">
                <p className="text-[17px] leading-8 text-[#0A1F3D] md:text-[18px]">
                  Beneath the analytical framework is a simple governing conviction:
                  capital should be approached with stewardship, intellectual seriousness,
                  and a respect for what is actually true — not as an alternative to
                  wealth creation through equities, but as a wiser way of participating
                  in it.
                </p>
                <div className="mt-5 grid gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8A92A0] md:grid-cols-3">
                  <div>Stewardship over speculation</div>
                  <div>Structure over narrative</div>
                  <div>Honesty over convenience</div>
                </div>
              </div>

              <div className="space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
                <p>
                  The platform was founded by{" "}
                  <span className="font-medium text-[#1E2228]">Anthony Summers</span>,
                  whose interest in financial markets developed through years of studying
                  corporate financial statements, capital allocation behavior, and the
                  institutional dynamics that shape how financial information gets
                  packaged, sold, and consumed.
                </p>
                <p>
                  That experience produced a clear conviction: most financial analysis is
                  downstream of narrative, not upstream of it. The research that gets
                  published tends to confirm what investors already want to believe, or
                  what publishers can most easily sell. The Capital Steward was built as
                  a deliberate alternative — a space to think structurally, without those
                  incentive distortions.
                </p>
                <p>
                  This is not a platform built to predict. It is built to see clearly.
                  To organize what is already knowable in the financial statements into a
                  form that makes structural fragility and resilience visible — before
                  they become obvious in price.
                </p>
                <p className="font-medium text-[#1E2228]">
                  The founder's role is not simply to publish research, but to cultivate
                  a way of seeing the market that places wisdom above impulse, structure
                  above narrative, and disciplined judgment above easy conviction.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ── What this work is for ── */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-14">
          <article className="mx-auto max-w-3xl">
            <div className="pt-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
                Future
              </p>
              <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-[2.35rem]">
                What this work is for
              </h2>

              <div className="mt-6 space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
                <p>
                  Markets are complex systems, and no framework can fully capture that
                  complexity. The purpose of this platform is not to reduce the market to
                  a formula or to promise certainty about the future.
                </p>
                <p>
                  Over time the platform will continue to expand its analytical coverage,
                  improve its diagnostic tools, and deepen the ways structural information
                  is presented. But the core idea behind the project will remain the same:
                </p>
              </div>

              <div className="my-9 border-l-2 border-[#0A1F3D] pl-5">
                <p className="tcs-heading max-w-2xl text-2xl font-semibold leading-tight text-[#0A1F3D] md:text-[2rem]">
                  To help serious investors see the structural architecture of the market
                  more clearly.
                </p>
              </div>

              <div className="text-[17px] leading-8 text-[#0A1F3D] md:text-[18px]">
                <p>
                  Because when structure becomes visible, many things that once seemed
                  mysterious begin to make sense.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

    </main>
  );
}