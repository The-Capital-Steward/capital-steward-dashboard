import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WhyThisExistsPage() {
  return (
    <main className="min-h-screen bg-[#F1F3F0] text-[#1E2228]">

      {/* ── Hero ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-4xl px-6 py-18 md:py-24">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#244636]">
            Why This Exists
          </p>

          <h1 className="tcs-heading mt-4 max-w-3xl text-5xl font-semibold leading-[1.03] tracking-tight text-[#0A1F3D] md:text-6xl">
            Built where rigorous analysis couldn't be published.
          </h1>

          <div className="mt-8 max-w-3xl border-l border-[#C9D8CD] pl-5">
            <p className="text-lg leading-8 text-[#5C6472] md:text-[19px]">
              If you have spent years consuming financial research and still feel like
              you are missing something structural — something that actually conforms
              to evidence — this page explains where that feeling comes from,
              and what this is built to address.
            </p>
          </div>
        </div>
      </section>

      {/* ── The environment ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              The context
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-[2.35rem]">
              Most financial research is built to be convincing.
            </h2>

            <div className="mt-8 space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              <p>
                Anthony Summers spent a decade inside one of the largest financial
                publishing organizations in the world. His job, formally, was research
                and strategy. In practice, he was building analytical infrastructure —
                the frameworks, the governance systems, the decision architecture that
                determined how capital got deployed and how strategies got approved or
                rejected before they ever reached a subscriber.
              </p>

              <p>
                The work described here was built inside a live institutional
                environment and tested against real capital decisions.
              </p>

              <p>
                The work was real. The environment it lived in — and still lives in —
                was not designed to reward it. The people generating investment ideas
                in most of these organizations are not analysts, portfolio managers,
                or researchers. They are marketing copywriters. Their job is not to
                test ideas against data or evidence. It is to produce persuasive
                narratives designed to capture attention and drive subscriptions.
              </p>
              <p>
                When genuine analytical leadership is absent, narrative becomes the
                product. Ideas are framed to sound compelling rather than to withstand
                scrutiny. If narrative-chasing produced durable investment outcomes,
                everyone would be rich. It doesn't. But encouraging people to believe
                it does has proven to be a very durable business model.
              </p>
              <p>
                Anthony understood this from the inside. He works within it. And for
                years, the tension between the quality of the analytical work he was
                doing and the environment it was produced for was something he managed
                rather than resolved.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── The turning point — DARK BAND ── */}
      <section className="border-b border-[#0D2440] bg-[#0A1F3D]">
        <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">
          <article className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
              The turning point
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-white md:text-[2.35rem]">
              The framework became too real to keep inside.
            </h2>

            <div className="mt-8 space-y-6 text-[17px] leading-8 text-[#A9BEDF] md:text-[18px]">
              <p>
                The Operational Structure Mispricing Risk framework did not begin as a
                platform idea. It began as a private attempt to answer a question
                Anthony had been circling for years: is there a systematic, rigorous
                way to measure how structurally grounded a company's valuation
                actually is?
              </p>
              <p>
                The further the work developed — the OAL governance construct, the
                three axes, the cohort validation against 270,618 historical
                observations — the clearer it became that the answer was yes. The
                framework was real. It was grounded in empirical evidence. It measured
                It measured something most analysis is not designed to surface.
              </p>
              <p>
                And it could not be expressed honestly inside a system built on the
                exact dynamics it was designed to measure.
              </p>
            </div>

            <div className="mt-10 rounded-[1.75rem] border border-[#203754] bg-[#0D2847] px-8 py-8">
              <p className="text-[17px] leading-8 text-white md:text-[18px]">
                A framework that measures how much narrative a company requires to
                justify its valuation cannot be published by an organization whose
                business model depends on narrative. The conflict is not incidental.
                It is structural.
              </p>
            </div>

            <div className="mt-8 space-y-6 text-[17px] leading-8 text-[#A9BEDF] md:text-[18px]">
              <p>
                That realization is what produced The Capital Steward. Not a desire to
                build a business, though that matters too. Not a critique of where
                Anthony has worked, which produced real skills and real clarity about
                what rigorous analysis requires. But a recognition that the work had
                outgrown its container — and that the only way to express it honestly
                was to build the right one alongside it.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── Who this is for ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              The reader
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-[2.35rem]">
              This is for investors who already suspect something is wrong.
            </h2>

            <div className="mt-8 space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              <p>
                Not investors who are new to markets and looking for an introduction.
                Not investors who are satisfied with the analysis they currently
                consume. This platform is built for the investor who has been paying
                attention long enough to notice that most financial research —
                however confident it sounds — is downstream of someone's incentive
                structure.
              </p>
              <p>
                That investor is not cynical. They still believe rigorous analysis is
                possible. They are looking for it. They have not found it in most of
                what gets published because most of what gets published was not
                designed to conform to evidence first. It was designed to be read
                first, shared first, acted on first. Analytical rigor, where it
                exists, is incidental.
              </p>
            </div>

            {/* Reader recognition cards */}
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  label: "They recognize",
                  text: "That the research they consume is shaped by what publishers can sell, not what the evidence actually supports.",
                },
                {
                  label: "They want",
                  text: "A framework they can actually trust — one grounded in what companies have demonstrated, not what they've promised.",
                },
                {
                  label: "They believe",
                  text: "They are capable of understanding rigorous analysis if someone would just present it honestly.",
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

            <div className="mt-8 space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              <p>
                The Capital Steward was built for that investor. The framework exists
                because the question it answers — how structurally grounded is this
                valuation, really? — is one most analysis is not incentivized to ask.
                The platform exists because the answer, applied systematically across
                the full equity universe, lets you see where risk is accumulating
                before it shows up in price.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── The governing principle ── */}
      <section className="border-b border-[#DDE0DC] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              The standard
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-[2.35rem]">
              Stewardship is the operating principle.
            </h2>

            <div className="mt-8 space-y-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              <p>
                The name is not incidental. Stewardship — of capital, of analysis, of
                the trust that a reader places in a framework they did not build
                themselves — is the governing standard for every decision made here.
              </p>
              <p>
                That means median over mean when mean would flatter the results. It
                means documenting limitations alongside findings. It means
                acknowledging when the framework cannot tell you something, rather
                than implying it can. It means building something honest about
                uncertainty, because uncertainty handled honestly is more useful to a serious
                investor than confident noise.
              </p>
              <p>
                This is not a platform built to predict. It is built to see clearly —
                and to make structural risk legible to anyone willing to look at it
                without an agenda attached to the outcome.
              </p>
            </div>

            <div className="my-10 border-l-2 border-[#244636] pl-6">
              <p className="tcs-heading text-2xl font-semibold leading-tight text-[#0A1F3D] md:text-[2rem]">
                The work must conform to truth as much as possible.
                <br />
                Everything else follows from that.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── CTAs ── */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-3xl">
            <p className="text-[17px] leading-8 text-[#4F5968] mb-8 md:text-[18px]">
              If you have felt the gap but haven't had a framework to measure it,
              that is exactly what this platform is built to give you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/the-osmr-framework"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#153761]"
              >
                How We Measure Structural Risk
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/platform"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#DDE0DC] bg-white px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]"
              >
                Open Platform
              </Link>
            </div>
          </article>
        </div>
      </section>

    </main>
  );
}