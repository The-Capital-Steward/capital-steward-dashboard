import Link from "next/link";
import { Construction, Hammer, Sparkles } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen bg-[#0A1730] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-[#243A61] bg-[#14284A] shadow-2xl shadow-black/30">
              <Construction className="h-14 w-14 text-[#8EA7D8]" />
            </div>
            <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#243A61] bg-[#10203D]">
              <Hammer className="h-5 w-5 text-[#B7C3D8]" />
            </div>
          </div>
        </div>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#243A61] bg-[#10203D] px-4 py-2 text-sm text-[#B7C3D8]">
          <Sparkles className="h-4 w-4" />
          The Capital Steward
        </div>

        <h1 className="tcs-heading max-w-3xl text-5xl font-semibold leading-tight text-white md:text-6xl">
          The dashboard is under construction.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#B7C3D8]">
          We’re building a more refined research experience for structural market analysis.
          The next release will include cleaner cohort analytics, better interpretability,
          and a more polished platform layer.
        </p>

        <div className="mt-10 rounded-3xl border border-[#243A61] bg-[#14284A] px-6 py-5 text-left shadow-xl shadow-black/20">
          <div className="text-sm uppercase tracking-[0.18em] text-[#7F90AD]">
            In progress
          </div>
          <ul className="mt-3 space-y-2 text-[#E8EDF5]">
            <li>Historical cohort analytics refinement</li>
            <li>Median and hit-rate regime views</li>
            <li>Cleaner company and regime drilldowns</li>
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-2xl border border-[#243A61] bg-[#14284A] px-5 py-3 text-[#E8EDF5] transition hover:bg-[#10203D]"
          >
            Back to Home
          </Link>

          <a
            href="mailto:research@thecapitalsteward.com"
            className="rounded-2xl bg-[#5E7FBE] px-5 py-3 text-white transition hover:bg-[#4A6FA5]"
          >
            Contact Research
          </a>
        </div>
      </div>
    </main>
  );
}