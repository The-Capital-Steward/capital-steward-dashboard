import { ArrowRight } from "lucide-react";
import Link from "next/link";

function AnchorLadder() {
  const rungs = [
    { label: "FCF", desc: "Free cash flow", isFirst: true, isLast: false, isDashed: false },
    { label: "NI", desc: "Net income", isFirst: false, isLast: false, isDashed: false },
    { label: "EBIT", desc: "Operating income", isFirst: false, isLast: false, isDashed: false },
    { label: "Revenue", desc: "Sales only", isFirst: false, isLast: false, isDashed: false },
    { label: "Narrative", desc: "No operational anchor", isFirst: false, isLast: true, isDashed: true },
  ];

  return (
    <div className="my-8 rounded-[1.75rem] border border-[#DDE0DC] bg-white p-7 shadow-[0_10px_30px_rgba(10,35,66,0.04)]">
      <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
        Operational Anchor Ladder
      </p>

      {/* Desktop: horizontal */}
      <div className="hidden md:flex md:items-stretch md:gap-1">
        {rungs.map((rung, i) => (
          <div key={rung.label} className="flex flex-1 items-center">
            <div
              className={`flex-1 rounded-xl px-4 py-3 ${
                rung.isDashed
                  ? "border border-dashed border-[#DDE0DC] bg-[#FAFAF8]"
                  : rung.isFirst
                  ? "border border-[#C9D8CD] bg-[#E8EFE9]"
                  : "border border-[#DDE0DC] bg-[#F7F8F6]"
              }`}
            >
              <div className={`text-sm font-semibold ${
                rung.isDashed ? "text-[#B0B8C4]" : rung.isFirst ? "text-[#244636]" : "text-[#0A1F3D]"
              }`}>
                {rung.label}
              </div>
              <div className="mt-0.5 text-[11px] leading-4 text-[#8A92A0]">{rung.desc}</div>
            </div>
            {i < rungs.length - 1 && (
              <div className="mx-1 shrink-0">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="#C9D8CD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <path d="M6 2v8M3 7l3 3 3-3" stroke="#C9D8CD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <div className={`rounded-xl px-4 py-3 ${
              rung.isDashed
                ? "border border-dashed border-[#DDE0DC] bg-[#FAFAF8]"
                : rung.isFirst
                ? "border border-[#C9D8CD] bg-[#E8EFE9]"
                : "border border-[#DDE0DC] bg-[#F7F8F6]"
            }`}>
              <div className={`text-sm font-semibold ${
                rung.isDashed ? "text-[#B0B8C4]" : rung.isFirst ? "text-[#244636]" : "text-[#0A1F3D]"
              }`}>
                {rung.label}
              </div>
              <div className="mt-0.5 text-[11px] leading-4 text-[#8A92A0]">{rung.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[12px] text-[#8A92A0]">
        Each step up increases narrative dependence — and structural risk.
      </p>
    </div>
  );
}

export default function HowWeSeeMarketsPage() {
  return (
    <main className="min-h-screen bg-[#F1F3F0] text-[#1E2228]">

      {/* ── Hero ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-4xl px-6 py-18 md:py-24">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#244636]">
            How We See Markets
          </p>
          <h1 className="tcs-heading mt-4 max-w-3xl text-5xl font-semibold leading-[1.03] tracking-tight text-[#0A1F3D] md:text-6xl">
            Most analysis begins with stories. We begin with structure.
          </h1>
        </div>
      </section>

      {/* ── The condition + mechanism + implication ── */}
      <section className="border-b border-[#DDE0DC]">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-2xl">

            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              The condition
            </p>
            <p className="mt-4 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              Markets are psychosocial systems. The financials participants choose to
              focus on are often selected because they better support a narrative —
              not because they always represent the firm's economic reality.
            </p>

            <p className="mt-10 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              The mechanism
            </p>
            <p className="mt-4 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              A company will point to the deepest operational anchor it can credibly
              claim. If it can justify its valuation with free cash flow, it will. If
              it cannot, it ascends the financial statement — to earnings, to operating
              income, to revenue — until it finds a metric the market will accept.
              Each step up the ladder lengthens the narrative bridge between price
              and economic reality.
            </p>

            <AnchorLadder />

            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              The implication
            </p>
            <p className="mt-4 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              The Capital Steward exists to measure that bridge — and to identify
              where it has grown too long to hold.
            </p>

            {/* Impact line */}
            <div className="my-10 border-l-2 border-[#0A1F3D] pl-6">
              <p className="tcs-heading text-xl font-semibold leading-tight text-[#0A1F3D] md:text-2xl">
                The market does not move from truth to price.
                <br />
                It moves from narrative to price.
              </p>
            </div>

          </article>
        </div>
      </section>

      {/* ── The problem — compressed ── */}
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

            <p className="mt-8 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              Modern market analysis fragments reality into isolated datapoints —
              quarterly earnings, revenue growth rates, macro overlays, analyst
              revisions. Each may be directionally useful. None explains whether a
              company is structurally durable or structurally fragile. Markets rarely
              break because of a single data point. They break when fragility
              accumulates beneath the surface, justified through narrative until the
              narrative no longer holds.
            </p>

            {/* Pattern cards — compressed */}
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {[
                { label: "Pattern one", text: "Valuations persist despite weakening operational anchors." },
                { label: "Pattern two", text: "Profitability masks deteriorating cash generation." },
                { label: "Pattern three", text: "Balance sheets quietly absorb risk until they cannot." },
              ].map(({ label, text }) => (
                <div key={label} className="rounded-2xl border border-[#DDE0DC] bg-[#F7F8F6] p-5">
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8A92A0]">{label}</div>
                  <p className="mt-3 text-sm leading-6 text-[#4F5968]">{text}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* ── Framework preview — light touch ── */}
      <section className="border-b border-[#0D2440] bg-[#0A1F3D]">
        <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
              Framework
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-white md:text-[2.35rem]">
              Three structural dimensions. One operational anchor.
            </h2>
            <p className="mt-6 text-[17px] leading-8 text-[#A9BEDF]">
              Every company is evaluated on how deeply its valuation is anchored to
              real operational output, whether that anchor is improving or
              deteriorating, and whether the firm can service its obligations from it.
              Every dimension speaks to the same anchor throughout.
            </p>

            <div className="mt-10 space-y-4">
              {[
                {
                  num: "I",
                  eyebrow: "Operational Anchor Risk",
                  title: "Narrative Bridge Risk",
                  body: "How far is the valuation from what the company has actually demonstrated? The further the reach — from FCF toward revenue — the longer and more fragile the narrative bridge.",
                },
                {
                  num: "II",
                  eyebrow: "Operational Trajectory Risk",
                  title: "Narrative Durability Risk",
                  body: "Is the operational anchor improving or deteriorating? A firm moving toward demonstrated cash generation is shortening its narrative bridge. A firm deteriorating is lengthening it.",
                },
                {
                  num: "III",
                  eyebrow: "Operational Financing Risk",
                  title: "Obligation Risk",
                  body: "Can the firm service its obligations from its actual operational output? A gap between what is owed and what can be produced creates structural exposure — regardless of the narrative surrounding the balance sheet.",
                },
              ].map(({ num, eyebrow, title, body }) => (
                <div key={num} className="rounded-[1.75rem] border border-[#203754] bg-[#0D2847] p-7">
                  <div className="flex items-start gap-5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C9D8CD] bg-[#E8EFE9] text-xs font-medium text-[#244636]">
                      {num}
                    </div>
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
                        {eyebrow}
                      </div>
                      <h3 className="tcs-heading mt-2 text-xl font-semibold text-white">
                        {title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-7 text-[#A9BEDF]">
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
                A company with robust, deep operational anchoring does not need
                narrative to justify its price. Structure eventually speaks for itself.
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

      {/* ── Bridge to framework ── */}
      <section className="border-b border-[#DDE0DC] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
          <article className="mx-auto max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
              The Measurement
            </p>
            <h2 className="tcs-heading mt-3 text-3xl font-semibold leading-tight text-[#0A1F3D] md:text-[2.35rem]">
              How we actually do it.
            </h2>

            <p className="mt-6 text-[17px] leading-8 text-[#4F5968] md:text-[18px]">
              The three dimensions above are not abstractions. Each is a precise,
              quantifiable measurement applied to every company in the U.S. equity
              universe — roughly 4,800 companies, updated on a monthly cadence. The
              full methodology is documented in full. It is written to be read by
              someone who wants to evaluate the framework rigorously, not just use it.
              If that is you, it is worth the time.
            </p>

            <div className="mt-8">
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
                href="/why-this-exists"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#DDE0DC] bg-white px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]"
              >
                Why This Exists
              </Link>
            </div>
          </article>
        </div>
      </section>

    </main>
  );
}