'use client'

// P3 palette · DM Sans · AAA corrected · File → app/who-its-for/page.tsx
// Revised: reader section added, Block 2 removed, pull quotes fixed,
//          sidebar affirmative added, CTA closing line isolated

import Link from "next/link"
import { ArrowRight } from "lucide-react"

const E = {
  bg:    "#D7DDD3",
  bg2:   "#CBD2C7",
  bg3:   "#C4CCC0",
  bdr:   "#B7C1B4",
  bdr2:  "#A8B4A5",
  text:  "#313A34",
  body:  "#3F4640",
  muted: "#40463F",
  dim:   "#41453F",
  gold:  "#715E37",
  gatm:  "rgba(56,72,61,0.06)",
  pos:   "#38483D",
  neg:   "#633838",
  brick: "#633838",
  sage:  "#38483D",
  mono:  "'IBM Plex Mono','Courier New',monospace",
  sans:  "'DM Sans',system-ui,sans-serif",
  serif: "'Playfair Display',Georgia,serif",
}

const s = (x: object) => x as React.CSSProperties

const B = ({ ch }: { ch: React.ReactNode }) => (
  <p style={s({ fontFamily: E.sans, fontSize: 14.5, lineHeight: 1.85, color: E.body, marginBottom: 18 })}>{ch}</p>
)

export default function WhoItsFor() {
  return (
    <main style={s({ minHeight: "100vh", background: E.bg, color: E.text, fontFamily: E.sans })}>

      {/* ── NAV ── */}
      <nav style={s({
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 44px", height: 52,
        background: "rgba(215,221,211,0.97)",
        borderBottom: `1px solid ${E.bdr}`,
        backdropFilter: "blur(12px)",
      })}>
        <Link href="/" style={s({ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9.5, fontWeight: 400, letterSpacing: "0.32em", textTransform: "uppercase" as const, color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 17, color: E.text, marginLeft: 8 })}>Steward</span>
        </Link>
        <div style={s({ display: "flex", alignItems: "center" })}>
          {[
            { label: "Who It's For",  href: "/who-its-for" },
            { label: "Methodology",   href: "/methodology" },
            { label: "Where It Fits", href: "/where-it-fits" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={s({
              fontFamily: E.sans, fontSize: 10.5, fontWeight: 600,
              color: href === "/who-its-for" ? E.text : E.muted,
              padding: "0 16px", borderLeft: `1px solid ${E.bdr}`,
              textDecoration: "none", height: 52,
              display: "flex", alignItems: "center", letterSpacing: "0.02em",
            })}>
              {label}
            </Link>
          ))}
          <Link href="/platform" style={s({
            fontFamily: E.sans, fontSize: 10.5, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase" as const,
            padding: "8px 20px", background: E.text, color: E.bg,
            textDecoration: "none", marginLeft: 20,
          })}>
            Platform
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={s({ padding: "80px 44px 72px", borderBottom: `1px solid ${E.bdr}`, maxWidth: 820 })}>
        <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 16 })}>Who It&apos;s For</p>
        <h1 style={s({ fontFamily: E.sans, fontSize: "clamp(36px,5vw,58px)", fontWeight: 800, lineHeight: 1.05, color: E.text, letterSpacing: "-0.03em", marginBottom: 28 })}>
          The investor this was
          <em style={s({ fontStyle: "italic", fontFamily: E.serif, fontWeight: 400, color: E.brick, fontSize: "clamp(40px,5.5vw,62px)", letterSpacing: "-0.01em" })}> built for.</em>
        </h1>
        <p style={s({ fontFamily: E.sans, fontSize: 16, lineHeight: 1.8, color: E.body, maxWidth: 600 })}>
          Most financial research is shaped by what the publisher is selling. This one isn&apos;t. Here is an honest account of what The Capital Steward is, who it&apos;s for, and what it is trying — and not trying — to do.
        </p>
      </div>

      {/* ── BODY ── */}
      <div style={s({ display: "grid", gridTemplateColumns: "1fr 360px", borderBottom: `1px solid ${E.bdr}` })}>

        {/* Main column */}
        <div style={s({ borderRight: `1px solid ${E.bdr}` })}>

          {/* Block 1 — The problem */}
          <div style={s({ padding: "52px 44px", borderBottom: `1px solid ${E.bdr}` })}>
            <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 14 })}>01 — The problem</p>
            <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 800, lineHeight: 1.15, color: E.text, letterSpacing: "-0.02em", marginBottom: 20 })}>
              Financial publishing has an incentive problem that most people sense but few name directly.
            </h2>
            <B ch="The model works like this: you produce analysis, you distribute it, you build an audience, and that audience is the product you sell to advertisers or to people who want to reach investors with their own messages. The analysis is the vehicle. The audience is the asset." />
            <B ch="This structure doesn't require anyone to lie. It just rewards certain kinds of analysis over others. Confident analysis. Actionable analysis. Analysis that makes readers feel like they have an edge. Analysis that confirms existing beliefs, because readers who feel validated keep subscribing." />
            <B ch="The result is a financial media ecosystem optimized for engagement rather than truth. Not because the people inside it are dishonest — most of them aren't — but because the incentives point in a different direction than accuracy. A framework that says 'the data is ambiguous and you should be cautious' doesn't build an audience. A framework that says 'here's your next big opportunity' does." />

            {/*
              REVISION 1 — Pull quote reformatted.
              Removed quotation marks. The voice is the platform's own.
              Displaying as a block statement, not an attributed quote.
            */}
            <div style={s({ borderLeft: `3px solid ${E.brick}`, padding: "16px 22px", margin: "28px 0", background: E.gatm })}>
              <p style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.75, color: E.text })}>
                The distortion is in the system, not necessarily in the people. That distinction matters. It means the problem is structural — and structural problems require structural solutions.
              </p>
            </div>

            <B ch="The Capital Steward is a structural solution. It has no advertisers. It has no assets under management. It does not run a portfolio whose performance depends on its recommendations. It has no relationship with the companies it scores. The analysis is shaped entirely by what the data shows — because there is no other force acting on it." />
          </div>

          {/*
            REVISION 2 — New reader-facing section inserted between 01 and 03.
            Draws from: loneliness of rigor, peer accountability, epistemic frustration.
            Earns the page title "Who It's For" by naming the reader directly.
            Block 2 "What We Believe" removed — it repeated methodology content
            at the wrong emotional moment and has been cut.
          */}
          <div style={s({ padding: "52px 44px", borderBottom: `1px solid ${E.bdr}`, background: E.gatm })}>
            <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 14 })}>02 — The investor</p>
            <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 800, lineHeight: 1.15, color: E.text, letterSpacing: "-0.02em", marginBottom: 20 })}>
              The investor this was built for already suspects something is structurally wrong with most of what they read.
            </h2>
            <B ch="They are not looking for tips. They are looking for a framework they can defend — to themselves, to a board, to an investment committee — because they understand that operating with a flawed lens compounds quietly over time in ways that eventually become visible." />
            <B ch="They have consumed financial research for years and still feel like they are missing something structural. The analysis they get is either too shallow to be useful or too incentivized to be trusted. They have learned to discount financial media at the pattern level, not just case by case." />
            <B ch="They have probably felt, at some point, like the only person in their circle asking these kinds of questions. They are not." />
          </div>

          {/* Block 3 — The foundation (renumbered to 03) */}
          <div style={s({ padding: "52px 44px" })}>
            <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 14 })}>03 — The foundation</p>
            <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 800, lineHeight: 1.15, color: E.text, letterSpacing: "-0.02em", marginBottom: 20 })}>
              Stewardship is about conformity to reality.
            </h2>
            <B ch="The name is not incidental. Stewardship — in the oldest and most serious sense — means careful, faithful management of something entrusted to you. For investors, that means capital. For us, it means the analysis we produce and the trust of the people who use it." />
            <B ch="We believe the work must conform to truth as much as it possibly can. That means median over mean when the mean would mislead. It means disclosing prominently that 68.5% of Very High classifications do not produce severe losses in 12 months — not in a footnote, but in the main text. It means saying 'the data is ambiguous' when the data is ambiguous, even when a confident answer would be more compelling." />
            <B ch="It means building a system that is honest about what it can and cannot do — and designing every piece of copy, every chart, and every disclosure to reflect that standard." />

            {/* Principle block */}
            <div style={s({ border: `1px solid ${E.bdr}`, background: E.bg2, padding: "24px", marginTop: 28 })}>
              <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 16 })}>What this means in practice</p>
              <div style={s({ display: "flex", flexDirection: "column" })}>
                {[
                  { principle: "Median over mean",              reason: "The mean in our highest-risk bucket is +12.6%. The median is −0.8%. We report the median." },
                  { principle: "Limitations prominently",       reason: "Not in fine print. The false positive rate, the regime dependence, the open questions — in the main text." },
                  { principle: "No forward-state language",     reason: "The platform describes structural conditions that exist now. It does not predict what will happen next." },
                  { principle: "No overclaiming",               reason: "The signal is Modest full-period. We say so. The empirical record supports the framework. We say that too." },
                  { principle: "No narratives about narratives",reason: "We measure structure. We don't editorialize about which companies deserve their valuations." },
                ].map(({ principle, reason }, i) => (
                  <div key={principle} style={s({ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, padding: "14px 0", borderBottom: i < 4 ? `1px solid ${E.bdr}` : "none" })}>
                    <div style={s({ fontFamily: E.sans, fontSize: 12.5, fontWeight: 700, color: E.text })}>{principle}</div>
                    <div style={s({ fontFamily: E.sans, fontSize: 12.5, lineHeight: 1.65, color: E.body })}>{reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div style={s({ padding: "40px 32px", background: E.bg2 })}>

          {/*
            REVISION 3 — "What This Is Not" sidebar gets a single affirmative
            line above the negatives. Reads as precision, not defensiveness.
          */}
          <div style={s({ marginBottom: 32, paddingBottom: 32, borderBottom: `1px solid ${E.bdr}` })}>
            <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 14 })}>What this is not</p>
            <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.7, color: E.text, fontWeight: 600, marginBottom: 14 })}>
              What it is: a structural lens for investors who already know how to think.
            </p>
            {[
              "Investment advice",
              "A stock picking service",
              "A prediction engine",
              "A replacement for your process",
              "Affiliated with any company we score",
            ].map((item, i) => (
              <div key={item} style={s({ display: "flex", gap: 10, alignItems: "baseline", padding: "9px 0", borderBottom: i < 4 ? `1px solid ${E.bdr}` : "none" })}>
                <div style={s({ fontFamily: E.mono, fontSize: 10, color: E.muted, flexShrink: 0 })}>—</div>
                <span style={s({ fontFamily: E.sans, fontSize: 12.5, color: E.body })}>{item}</span>
              </div>
            ))}
          </div>

          {/* The empirical record */}
          <div style={s({ marginBottom: 32, paddingBottom: 32, borderBottom: `1px solid ${E.bdr}` })}>
            <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 14 })}>The empirical record</p>
            <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.78, color: E.body, marginBottom: 16 })}>Validated across 289,737 observations · 17 years:</p>
            {[
              { label: "Factor-adj. L/S alpha", val: "+21.0%", note: "t = +4.80" },
              { label: "FCF vs Revenue spread", val: "+26.6pp", note: "All regimes" },
              { label: "Very High loss rate",   val: "~2×",    note: "vs universe" },
              { label: "Exclusion premium",     val: "+4.6pp", note: "Long-only" },
            ].map(({ label, val, note }) => (
              <div key={label} style={s({ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "9px 0", borderBottom: `1px solid ${E.bdr}` })}>
                <span style={s({ fontFamily: E.sans, fontSize: 12, color: E.body })}>{label}</span>
                <div style={s({ textAlign: "right" as const })}>
                  <span style={s({ fontFamily: E.mono, fontSize: 13, fontWeight: 500, color: E.text })}>{val}</span>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.muted, marginLeft: 8 })}>{note}</span>
                </div>
              </div>
            ))}
            <Link href="/methodology" style={s({ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: E.mono, fontSize: 11, color: E.text, textDecoration: "none", marginTop: 14 })}>
              Full methodology <ArrowRight size={12} />
            </Link>
          </div>

          {/*
            REVISION 4 — Foundational principle sidebar.
            Quotation marks removed. Explicit attribution added.
            Unattributed quotes implied an external source; this is the
            platform's own founding statement and should read as such.
          */}
          <div style={s({ border: `1px solid ${E.bdr}`, borderTop: `3px solid ${E.brick}`, background: E.bg, padding: "20px" })}>
            <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 12 })}>Foundational principle</p>
            <p style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15, lineHeight: 1.78, color: E.text, marginBottom: 12 })}>
              The work must conform to truth as much as possible and cohere with wise stewardship of capital. This is not a constraint on the work — it is the reason the work matters.
            </p>
            <p style={s({ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.12em", color: E.muted })}>— The Capital Steward, founding principle</p>
          </div>

        </div>
      </div>

      {/* ── CTA ── */}
      {/*
        REVISION 5 — Closing line isolated from platform specs.
        "If you recognize yourself in this, the platform is open." does more
        work as a standalone beat. Specs moved into a subordinate line below.
      */}
      <div style={s({ padding: "64px 44px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 40, borderBottom: `1px solid ${E.bdr}` })}>
        <div style={s({ maxWidth: 520 })}>
          <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(22px,3vw,32px)", fontWeight: 800, color: E.text, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 })}>
            If you recognize yourself in this, the platform is open.
          </h2>
          <p style={s({ fontFamily: E.mono, fontSize: 11.5, color: E.muted, lineHeight: 1.75, letterSpacing: "0.04em" })}>
            ~5,200 U.S. equities · Two independently validated dimensions of structural risk · Updated weekly
          </p>
        </div>
        <div style={s({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 })}>
          <Link href="/platform" style={s({
            fontFamily: E.sans, fontSize: 12, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase" as const,
            padding: "13px 28px", background: E.text, color: E.bg,
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
          })}>
            Open Platform <ArrowRight size={14} />
          </Link>
          <Link href="/methodology" style={s({
            fontFamily: E.sans, fontSize: 11, fontWeight: 600,
            letterSpacing: "0.06em", textTransform: "uppercase" as const,
            padding: "11px 22px", background: "transparent",
            color: E.body, border: `1px solid ${E.bdr}`,
            textDecoration: "none", textAlign: "center" as const,
          })}>
            Examine the Evidence
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={s({ padding: "28px 44px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 })}>
        <Link href="/" style={s({ textDecoration: "none", display: "flex", alignItems: "baseline" })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase" as const, color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15, color: E.text, marginLeft: 6 })}>Steward</span>
        </Link>
        <div style={s({ display: "flex", gap: 20 })}>
          {[
            { label: "Methodology",   href: "/methodology" },
            { label: "Where It Fits", href: "/where-it-fits" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={s({ fontFamily: E.sans, fontSize: 11, color: E.muted, textDecoration: "none" })}>{label}</Link>
          ))}
        </div>
        <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>© 2026 The Capital Steward, LLC · Not investment advice</p>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .wif-body { grid-template-columns: 1fr !important; }
          .wif-body > div:first-child { border-right: none !important; border-bottom: 1px solid ${E.bdr}; }
        }
        @media (max-width: 768px) {
          .wif-cta { flex-direction: column !important; align-items: flex-start !important; }
          .wif-cta > div:last-child { align-items: flex-start !important; }
        }
      `}</style>

    </main>
  )
}