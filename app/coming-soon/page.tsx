import Link from "next/link";
import { Waypoints } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen bg-[#0A1F3D] text-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">

        {/* Platform badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1E3A5F] bg-[#0D2847] px-4 py-2 text-sm text-[#A9BEDF]">
          <Waypoints className="h-4 w-4" />
          Platform Access
        </div>

        {/* Headline */}
        <h1 className="tcs-heading max-w-3xl text-5xl font-semibold leading-tight text-white md:text-6xl">
          Platform access is not yet public.
        </h1>

        {/* Body */}
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#A9BEDF]">
          The platform is being refined before broader release. The next version will
          deepen cohort analysis, improve interpretability, and strengthen the clarity
          of the structural map.
        </p>

        {/* Current focus card */}
        <div className="mt-10 w-full max-w-md rounded-2xl border border-[#1E3A5F] bg-[#0D2847] px-6 py-6 text-left">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
            Current focus
          </div>
          <ul className="mt-4 space-y-3">
            {[
              "Historical cohort analysis",
              "Regime-based hit-rate and median views",
              "Cleaner company and regime drilldowns",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] text-[#E8EDF5]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#244636]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#203754] bg-[#0D2847] px-6 py-3.5 text-sm font-medium text-[#E8EDF5] transition hover:bg-[#0A1F3D] hover:border-[#C9D8CD]"
          >
            Back to Home
          </Link>
          <a
            href="mailto:research@thecapitalsteward.com?subject=Request%20Early%20Access"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#C9D8CD] bg-[#E8EFE9] px-6 py-3.5 text-sm font-medium text-[#244636] transition hover:bg-[#D4E8D8]"
          >
            Request Early Access
          </a>
        </div>

      </div>
    </main>
  );
}