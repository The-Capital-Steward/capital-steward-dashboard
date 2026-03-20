"use client";

import Link from "next/link";
import { Waypoints, CheckCircle2, Circle } from "lucide-react";

const completed = [
  "Full-universe OSMR scoring — all three axes",
  "Operational Anchor Ladder (OAL) classification",
  "Global valuation pressure with anchor depth penalty",
  "Trajectory consistency scoring across all OAL levels",
  "Financing fragility ladder",
  "Composite Structural Risk score",
  "Historical cohort grids — 309,000+ observations, 12M horizon",
  "Three-panel cohort outcomes by financing fragility",
  "Active Risk Cluster — top structural stress names",
  "Weekly snapshot refresh cadence",
];

const remaining = [
  "Company-level structural drilldowns",
  "Interpretive signal and regime context layers",
  "Tiered access and subscription infrastructure",
  "Downloadable monthly structural report",
  "Market structure analytics — options and spreads layer",
];

export default function PlatformPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A1F3D] text-white">

      {/* ── Animated orbital background ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large slow ring */}
        <div
          className="absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full border border-[#1E3A5F]"
          style={{ animation: "spin 40s linear infinite" }}
        />
        {/* Counter-rotating medium ring */}
        <div
          className="absolute -right-16 -top-16 h-[380px] w-[380px] rounded-full border border-[#162E4A]"
          style={{ animation: "spin 28s linear infinite reverse" }}
        />
        {/* Bottom-left ring */}
        <div
          className="absolute -bottom-24 -left-24 h-[340px] w-[340px] rounded-full border border-[#1A3352]"
          style={{ animation: "spin 52s linear infinite" }}
        />
        {/* Dashed orbit ring */}
        <div
          className="absolute -left-20 top-1/3 h-[260px] w-[260px] rounded-full border border-dashed border-[#1E3A5F]"
          style={{ animation: "spin 34s linear infinite reverse" }}
        />
        {/* Center glow */}
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0D2847] opacity-40 blur-3xl" />
        {/* Orbiting dots — outer */}
        <div
          className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2"
          style={{ animation: "spin 18s linear infinite" }}
        >
          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-[#244636]" />
          <div className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#1E3A5F]" />
        </div>
        {/* Orbiting dot — inner */}
        <div
          className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2"
          style={{ animation: "spin 26s linear infinite reverse" }}
        >
          <div className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#C9D8CD]" />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">

        {/* Badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1E3A5F] bg-[#0D2847] px-4 py-2 text-sm text-[#A9BEDF]"
          style={{ animation: "fadeUp 0.6s ease both" }}
        >
          <Waypoints className="h-4 w-4" />
          Platform Access
        </div>

        {/* Headline */}
        <h1
          className="tcs-heading max-w-3xl text-center text-5xl font-semibold leading-tight text-white md:text-6xl"
          style={{ animation: "fadeUp 0.6s ease 0.1s both" }}
        >
          Platform access is not yet public.
        </h1>

        {/* Body */}
        <p
          className="mt-6 max-w-2xl text-center text-lg leading-8 text-[#A9BEDF]"
          style={{ animation: "fadeUp 0.6s ease 0.2s both" }}
        >
          The core infrastructure is built. What remains is access design,
          interpretive layers, and company-level drilldowns. Most of the
          hard work is done.
        </p>

        {/* Build status grid */}
        <div
          className="mt-12 w-full max-w-3xl"
          style={{ animation: "fadeUp 0.6s ease 0.3s both" }}
        >
          <div className="grid gap-5 md:grid-cols-2">

            {/* Completed column */}
            <div className="rounded-2xl border border-[#1E3A5F] bg-[#0D2847] p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#6DAE8B]" />
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#6DAE8B]">
                  Completed
                </div>
              </div>
              <ul className="space-y-2.5">
                {completed.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6DAE8B]" />
                    <span className="text-[13px] leading-5 text-[#A9BEDF]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Remaining + progress column */}
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl border border-[#1E3A5F] bg-[#0D2847] p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full bg-[#A9BEDF]"
                    style={{ animation: "pulse 2s ease-in-out infinite" }}
                  />
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#A9BEDF]">
                    In Progress
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {remaining.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#41506A]" />
                      <span className="text-[13px] leading-5 text-[#7E8A96]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Progress bar */}
              <div className="rounded-2xl border border-[#1E3A5F] bg-[#0D2847] p-6">
                <div className="mb-3 flex items-center justify-between text-xs text-[#A9BEDF]">
                  <span className="font-medium uppercase tracking-[0.18em]">Build progress</span>
                  <span className="font-medium text-white">67%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#0A1F3D]">
                  <div
                    className="h-full rounded-full bg-[#6DAE8B]"
                    style={{
                      width: "67%",
                      animation: "growWidth 1.2s ease 0.6s both",
                    }}
                  />
                </div>
                <p className="mt-3 text-[12px] leading-5 text-[#7E8A96]">
                  10 of 15 milestones complete. Core analytical engine and
                  historical cohort infrastructure are live.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* CTAs */}
        <div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{ animation: "fadeUp 0.6s ease 0.45s both" }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-[#203754] bg-[#0D2847] px-6 py-3.5 text-sm font-medium text-[#E8EDF5] transition hover:border-[#C9D8CD] hover:bg-[#0A1F3D]"
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

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes growWidth {
          from { width: 0%; }
          to { width: 67%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </main>
  );
}