import { ArrowRight } from "lucide-react";
import Link from "next/link";

function AnchorLadder() {
  const rungs = [
    { label: "FCF", desc: "Free cash flow", isFirst: true, isDashed: false },
    { label: "NI", desc: "Net income", isFirst: false, isDashed: false },
    { label: "EBIT", desc: "Operating income", isFirst: false, isDashed: false },
    { label: "Revenue", desc: "Sales only", isFirst: false, isDashed: false },
    { label: "Narrative", desc: "No operational anchor", isFirst: false, isDashed: true },
  ];

  return (
    /* Ladder: rounded-[1rem], darker border, no shadow, p-10 */
    <div className="my-8 rounded-[1rem] border border-[#D1D5DB] bg-white p-10">
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#5B6472]">
        Operational Anchor Ladder
      </p>
      <p className="mt-1 mb-4 text-[11px] font-medium text-[#6B7280]">
        Strongest support → most narrative-dependent
      </p>

      {/* Desktop: horizontal */}
      <div className="hidden md:flex md:items-stretch md:gap-1.5">
        {rungs.map((rung, i) => (
          <div key={rung.label} className="flex flex-1 items-center">
            <div className={`flex-1 rounded-md px-4 py-3.5 ${
              rung.isDashed
                ? "border border-dashed border-[#DDE0DC] bg-[#FAFAF8]"
                : rung.isFirst
                ? "border border-[#B8CFC0] bg-[#E8EFE9]"
                : "border border-[#D0D4D0] bg-[#F4F5F3]"
            }`}>
              <div className={`text-[15px] font-semibold tracking-tight ${
                rung.isDashed ? "text-[#B0B8C4]" : rung.isFirst ? "text-[#1E3D2B]" : "text-[#0A1F3D]"
              }`}>{rung.label}</div>
              <div className="mt-0.5 text-[11px] leading-4 text-[#9CA3AF]">{rung.desc}</div>
            </div>
            {i < rungs.length - 1 && (
              <div className="mx-1.5 shrink-0">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="#A0AAB4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="flex flex-col gap-2 md:hidden">
        {rungs.map((rung, i) => (
          <div key={rung.label}>
            {i > 0 && (
              <div className="flex justify-center py-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2v8M3 7l3 3 3-3" stroke="#A0AAB4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <div className={`rounded-md px-4 py-3.5 ${
              rung.isDashed
                ? "border border-dashed border-[#DDE0DC] bg-[#FAFAF8]"
                : rung.isFirst
                ? "border border-[#B8CFC0] bg-[#E8EFE9]"
                : "border border-[#D0D4D0] bg-[#F4F5F3]"
            }`}>
              <div className={`text-[15px] font-semibold tracking-tight ${
                rung.isDashed ? "text-[#B0B8C4]" : rung.isFirst ? "text-[#1E3D2B]" : "text-[#0A1F3D]"
              }`}>{rung.label}</div>
              <div className="mt-0.5 text-[11px] leading-4 text-[#9CA3AF]">{rung.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Emphasis block 1 */}
      <div className="mt-8 rounded-md bg-[#E6E9E5] px-6 py-4">
        <p className="tcs-heading text-[1.1rem] font-semibold leading-snug tracking-tight text-[#0A1F3D] md:text-[1.2rem]">
          Each step up increases narrative dependence — and structural risk.
        </p>
      </div>
    </div>
  );
}

export default function HowWeSeeMarketsPage() {
  return (
    <main className="min-h-screen bg-[#F1F3F0] text-[#1E2228]">

      {/* ── Hero ── */}
      <section className="border-b border-[#D0D4CF]">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#244636]">
            How We See Markets
          </p>
          <h1 className="tcs-heading mt-5 max-w-3xl text-5xl font-semibold leading-[1.03] tracking-tight text-[#0A1F3D] md:text-6xl">
            Markets price narratives.
            <br />
            We measure the structure beneath them.
          </h1>
          <p className="mt-7 max-w-xl text-[18px] leading-[1.75] text-[#4F5968]">
            Most analysis begins with stories. We begin with structure.
          </p>
        </div>
      </section>

      {/* ── Condition + Mechanism + Implication — CONTAINED ── */}
      <section className="border-b border-[#D0D4CF]">
        <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">

          {/* Section container — card presence matching homepage weight */}
          <div className="rounded-[1.25rem] border border-[#D0D4CF] bg-white px-10 py-12">

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A92A0]">
              The condition
            </p>
            <p className="mt-4 text-[17px] leading-[1.8] text-[#4F5968] md:text-[18px]">
              Markets are driven as much by perception as by operating reality. The
              financials participants choose to focus on are selected because they
              better support a narrative — not because they represent the firm's
              economic reality.
            </p>

            <p className="mt-12 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5B6472]">
              The mechanism
            </p>
            <p className="mt-4 text-[17px] leading-[1.8] text-[#4F5968] md:text-[18px]">
              A company will point to the deepest operational anchor it can credibly
              claim. If it can justify its valuation with free cash flow, it will. If
              it cannot, it ascends the financial statement — to earnings, to operating
              income, to revenue — until it finds a metric the market will accept.
              Each step up the ladder lengthens the narrative bridge between price
              and economic reality.
            </p>

            <AnchorLadder />

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A92A0]">
              The implication
            </p>
            <p className="mt-4 text-[17px] leading-[1.8] text-[#4F5968] md:text-[18px]">
              The Capital Steward exists to measure that bridge — and to identify
              where it has grown too long to hold.
            </p>

            {/* Emphasis block 2 — heaviest visual moment on the page */}
            <div className="my-16 rounded-lg bg-[#0A1F3D] px-12 py-14 text-center">
              <p className="tcs-heading text-2xl font-semibold leading-snug text-white md:text-3xl">
                The market does not move from truth to price.
                <br />
                It moves from narrative to price.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Section spacer */}
      <div className="h-16 md:h-20" />

      {/* ── The problem — CONTAINED ── */}
      <section className="border-b border-[#D0D4CF]">
        <div className="mx-auto max-w-4xl px-6 pb-14 md:pb-20">

          {/* Section container */}
          <div className="rounded-[1.25rem] border border-[#D0D4CF] bg-white px-10 py-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A92A0]">
              The problem
            </p>
            <h2 className="tcs-heading mt-4 text-3xl font-semibold leading-tight tracking-tight text-[#0A1F3D] md:text-[2.35rem]">
              The failure is not a lack of data.
              <br />
              It is a lack of structure.
            </h2>

            <p className="mt-8 text-[17px] leading-[1.8] text-[#4F5968] md:text-[18px]">
              Modern market analysis fragments reality into quarterly earnings,
              revenue growth rates, and macro overlays. None of it explains whether
              a company is structurally durable or fragile. Markets rarely break
              because of a single data point — they break when fragility accumulates
              beneath the surface, justified through narrative until the narrative
              no longer holds.
            </p>

            <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A92A0]">
              Where fragility hides
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                { text: "Valuations persist despite weakening operational anchors." },
                { text: "Profitability masks deteriorating cash generation." },
                { text: "Balance sheets quietly absorb risk until they cannot." },
              ].map(({ text }) => (
                <div key={text} className="rounded-md border border-[#D0D4CF] bg-[#F4F5F3] p-5">
                  <p className="text-[13.5px] leading-[1.65] text-[#4F5968]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Transition band before dark section */}
      <div className="h-12 border-t border-[#C9D8CD] bg-gradient-to-b from-[#F1F3F0] to-[#E9ECE7]" />

      {/* ── Framework — DARK BAND ── */}
      <section className="border-b border-[#0A1830] bg-[#071629]">
        <div className="mx-auto max-w-4xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5B6472]">
              Framework
            </p>
            <h2 className="tcs-heading mt-4 text-3xl font-semibold leading-tight tracking-tight text-white md:text-[2.35rem]">
              Three structural dimensions — all anchored to the same operational foundation.
            </h2>
            <p className="mt-6 text-[17px] leading-[1.8] text-[#8DAFC8]">
              Every company is evaluated on how deeply its valuation is anchored to
              real operational output, whether that anchor is improving or
              deteriorating, and whether the firm can service its obligations from it.
              Every dimension speaks to the same anchor throughout.
            </p>

            <div className="mt-14 space-y-6">
              {[
                {
                  num: "I",
                  eyebrow: "How deep is the operational support behind the valuation?",
                  title: "Operational Anchor Risk",
                  body: "How far is the valuation from what the company has actually demonstrated? The further the reach — from FCF toward revenue — the longer and more fragile the narrative bridge.",
                },
                {
                  num: "II",
                  eyebrow: "Is that operational foundation improving or deteriorating?",
                  title: "Operational Trajectory Risk",
                  body: "Is the operational anchor improving or deteriorating? A firm moving toward demonstrated cash generation is shortening its narrative bridge. A firm deteriorating is lengthening it.",
                },
                {
                  num: "III",
                  eyebrow: "Can the firm meet its obligations from actual operational output?",
                  title: "Operational Financing Risk",
                  body: "Can the firm service its obligations from its actual operational output? A gap between what is owed and what can be produced creates structural exposure — regardless of the narrative surrounding the balance sheet.",
                },
              ].map(({ num, eyebrow, title, body }) => (
                <div key={num} className="rounded-lg border border-[#1A3354] bg-[#0C2240] p-8">
                  <div className="flex items-start gap-5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C9D8CD] bg-[#E8EFE9] text-xs font-semibold text-[#1E3D2B]">
                      {num}
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6A8FB0]">
                        {eyebrow}
                      </div>
                      <h3 className="tcs-heading mt-2.5 text-xl font-semibold tracking-tight text-white">
                        {title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-[1.75] text-[#8DAFC8]">
                        {body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing conviction ── */}
      <section className="border-b border-[#D0D4CF]">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-24">
          <article className="mx-auto max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A92A0]">
              Conviction
            </p>
            <h2 className="tcs-heading mt-4 text-3xl font-semibold leading-tight tracking-tight text-[#0A1F3D] md:text-[2.35rem]">
              Narratives are constrained by structure.
            </h2>

            <div className="mt-7 space-y-6 text-[17px] leading-[1.8] text-[#4F5968] md:text-[18px]">
              <p>
                Markets will always be driven by narratives in the short term. But
                narratives are constrained by structure. Valuations must ultimately
                reconcile with operating reality. Cash generation cannot be substituted
                indefinitely. Financial obligations must be met.
              </p>
              <p>
                A company with robust, deep operational anchoring does not need
                narrative to justify its price. Structure eventually speaks for itself.
              </p>
            </div>

            <div className="my-10 border-l-2 border-[#244636] pl-6">
              <p className="tcs-heading text-[1.45rem] font-semibold leading-snug tracking-tight text-[#0A1F3D] md:text-[1.65rem]">
                The purpose of this platform is not to chase narratives.
                <br />
                It is to map the conditions that determine which companies endure.
              </p>
            </div>

            <div className="mt-10 border-l-2 border-[#244636] pl-6">
              <p className="tcs-heading text-2xl font-semibold leading-tight text-[#0A1F3D]">
                Structure determines what narratives can survive.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ── Bridge to framework ── */}
      <section className="border-b border-[#D0D4CF] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-14 md:py-18">
          <article className="mx-auto max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A92A0]">
              The Measurement
            </p>
            <h2 className="tcs-heading mt-4 text-3xl font-semibold leading-tight tracking-tight text-[#0A1F3D] md:text-[2.35rem]">
              How we actually do it.
            </h2>

            <p className="mt-7 text-[17px] leading-[1.8] text-[#4F5968] md:text-[18px]">
              The three dimensions above are not abstractions. Each is a precise,
              quantifiable measurement applied to every company in the U.S. equity
              universe — roughly 4,800 companies, updated on a monthly cadence. The
              full methodology is written to be read by someone who wants to evaluate
              the framework rigorously, not just use it. If that is you, it is worth
              the time.
            </p>

            <p className="mt-7 text-[15px] leading-7 text-[#4F5968]">
              If you want to see how this is measured in full —
            </p>

            <div className="mt-5">
              <Link
                href="/the-osmr-framework"
                className="inline-flex items-center gap-2.5 rounded-lg border border-[#0A1F3D] bg-[#0A1F3D] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#153761]"
              >
                How We Measure Structural Risk
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </div>
      </section>

    </main>
  );
}