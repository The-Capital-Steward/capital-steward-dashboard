'use client'

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function WhyThisExists() {
  return (
    <main className="min-h-screen bg-[#F1F3F0] text-[#1E2228]">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="border-b border-[#DDE0DC] bg-white">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A92A0]">
            Why This Exists
          </p>
          <h1 className="tcs-heading mt-3 text-4xl font-semibold leading-tight text-[#0A1F3D] md:text-5xl">
            The framework could not exist where it was built.
          </h1>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-6 py-14 space-y-6 text-base leading-8 text-[#5C6472] md:text-lg md:leading-9">

        <p>
          Rigorous structural analysis requires one thing above all: that the
          conclusions follow the evidence, not the incentive structure of the
          organization publishing them.
        </p>

        <p>
          Most financial publishing does not meet that requirement. Research
          exists to support a product. Frameworks exist to generate
          recommendations. The more rigorous the analysis, the harder it becomes
          to compress into a format optimized for subscriptions rather than
          truth. That compression distorts what the analysis can honestly claim.
        </p>

        <p>
          The work behind this platform was developed over a decade inside that
          environment — and tested against real capital decisions throughout. The
          framework became sufficiently grounded, empirically validated, and
          structurally specific that honest expression of it required a different
          context entirely.
        </p>

        <p>
          A framework that measures how much narrative a company requires to
          justify its valuation cannot be published honestly by an organization
          whose business model depends on narrative. The conflict is not
          incidental. It is structural.
        </p>

        <p>
          The Capital Steward exists because that structural incompatibility left
          no other option. Not as a critique of where the work originated — that
          environment produced real skills and real clarity about what rigorous
          analysis requires. But as the only container in which the framework
          could be expressed without distortion.
        </p>

        {/* Conviction block */}
        <div className="my-10 rounded-xl border-l-4 border-[#244636] bg-white px-6 py-6">
          <p className="text-base leading-8 text-[#0A1F3D] md:text-lg md:leading-9">
            Stewardship — of capital, of analysis, of the trust a reader places
            in a framework they did not build — is the governing standard here.
            Median over mean when mean would flatter the results. Limitations
            documented alongside findings. Uncertainty expressed honestly, because
            honest uncertainty is more useful to a serious investor than confident
            noise.
          </p>
          <p className="mt-4 text-base font-semibold text-[#0A1F3D] md:text-lg">
            The work must conform to truth as much as possible.
            Everything else follows from that.
          </p>
        </div>

      </div>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-6 pb-16">
        <div className="rounded-[2rem] border border-[#DDE0DC] bg-white p-8 shadow-[0_12px_32px_rgba(10,35,66,0.05)]">
          <h2 className="tcs-heading text-2xl font-semibold text-[#0A1F3D]">
            If you have felt the gap, this is built to measure it.
          </h2>
          <p className="mt-3 text-base leading-7 text-[#5C6472]">
            The framework. The methodology. The platform. All of it built on
            the same principle: structure over narrative, evidence over
            persuasion.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/platform"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0A1F3D] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#153761]"
            >
              Open Platform <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/osmr-methodology"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#D4CDBF] bg-[#F7F8F6] px-6 py-3.5 text-sm font-medium text-[#1E2228] transition hover:border-[#244636] hover:text-[#0A1F3D]"
            >
              Methodology
            </Link>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-[#DDE0DC] py-6 text-center">
        <p className="text-[12px] leading-[1.8] text-[#aaa]">
          The Capital Steward, LLC · thecapitalsteward.com · inquiries@thecapitalsteward.com
          <br />
          © 2026 The Capital Steward, LLC. All rights reserved. For informational purposes only. Not investment advice.
        </p>
      </div>

    </main>
  )
}