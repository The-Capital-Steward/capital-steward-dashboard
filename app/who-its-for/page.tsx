'use client'

// FONT: same globals.css import (Syne + IBM Plex Mono + Instrument Serif)
// File goes to: app/who-its-for/page.tsx

import Link from "next/link"
import { ArrowRight } from "lucide-react"

const E = {
  bg: "#0E0D0B", bg2: "#131210", bg3: "#181614",
  bdr: "#272420", bdr2: "#33302A",
  text: "#EDE9E0", body: "#A89E8E", muted: "#554E44", dim: "#3A3530",
  gold: "#C5A24A", gatm: "rgba(197,162,74,0.04)",
  pos: "#5A9870", neg: "#B85C4A",
  mono: "'IBM Plex Mono','Courier New',monospace",
  sans: "'Syne',system-ui,sans-serif",
  serif: "'Instrument Serif',Georgia,serif",
}

const s = (x: object) => x as React.CSSProperties

const B = ({ ch }: { ch: React.ReactNode }) => (
  <p style={s({ fontFamily: E.sans, fontSize: 14, lineHeight: 1.85, color: E.body, marginBottom: 16 })}>{ch}</p>
)

export default function WhoItsFor() {
  return (
    <main style={s({ minHeight: "100vh", background: E.bg, color: E.text, fontFamily: E.sans })}>

      {/* ── NAV ── */}
      <nav style={s({
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 44px", height: 52,
        background: E.bg, borderBottom: `1px solid ${E.bdr}`,
      })}>
        <Link href="/" style={s({ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9.5, fontWeight: 400, letterSpacing: "0.32em", textTransform: "uppercase" as const, color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 17, color: E.gold, marginLeft: 8 })}>Steward</span>
        </Link>
        <div style={s({ display: "flex", alignItems: "center" })}>
          {[
            { label: "Who It's For", href: "/who-its-for" },
            { label: "Methodology",    href: "/osmr-methodology" },
            { label: "Where It Belongs",     href: "/where-it-belongs" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={s({
              fontFamily: E.sans, fontSize: 10.5, fontWeight: 600,
              color: href === "/who-its-for" ? E.gold : E.muted,
              padding: "0 16px", borderLeft: `1px solid ${E.bdr}`,
              textDecoration: "none", height: 52, display: "flex", alignItems: "center",
            })}>
              {label}
            </Link>
          ))}
          <Link href="/platform" style={s({ fontFamily: E.sans, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "8px 20px", background: E.gold, color: "#060504", textDecoration: "none", marginLeft: 20 })}>
            Platform
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={s({ padding: "80px 44px 72px", borderBottom: `1px solid ${E.bdr}`, maxWidth: 820 })}>
        <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.gold, marginBottom: 16 })}>Who It's For</p>
        <h1 style={s({ fontFamily: E.sans, fontSize: "clamp(36px,5vw,58px)", fontWeight: 800, lineHeight: 1.0, color: E.text, letterSpacing: "-0.04em", marginBottom: 28 })}>
          The investor<br />this was
          <em style={s({ fontStyle: "italic", fontFamily: E.serif, fontWeight: 400, color: E.gold, fontSize: "clamp(40px,5.5vw,62px)", letterSpacing: "-0.02em" })}> built for.</em>
        </h1>
        <p style={s({ fontFamily: E.sans, fontSize: 16, lineHeight: 1.8, color: E.body, maxWidth: 600 })}>
          Most financial research is shaped by what the publisher is selling. This one isn't. Here is an honest account of what The Capital Steward is, who it's for, and what it is trying — and not trying — to do.
        </p>
      </div>

      {/* ── BODY ── */}
      <div style={s({ display: "grid", gridTemplateColumns: "1fr 360px", borderBottom: `1px solid ${E.bdr}` })}>

        {/* Main column */}
        <div style={s({ borderRight: `1px solid ${E.bdr}` })}>

          {/* Block 1 — The problem */}
          <div style={s({ padding: "52px 44px", borderBottom: `1px solid ${E.bdr}` })}>
            <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 14 })}>01 — The problem</p>
            <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 800, lineHeight: 1.15, color: E.text, letterSpacing: "-0.03em", marginBottom: 20 })}>
              Financial publishing has an incentive problem that most people sense but few name directly.
            </h2>
            <B ch="The model works like this: you produce analysis, you distribute it, you build an audience, and that audience is the product you sell to advertisers or to people who want to reach investors with their own messages. The analysis is the vehicle. The audience is the asset." />
            <B ch="This structure doesn't require anyone to lie. It just rewards certain kinds of analysis over others. Confident analysis. Actionable analysis. Analysis that makes readers feel like they have an edge. Analysis that confirms existing beliefs, because readers who feel validated keep subscribing." />
            <B ch="The result is a financial media ecosystem optimized for engagement rather than truth. Not because the people inside it are dishonest — most of them aren't — but because the incentives point in a different direction than accuracy. A framework that says 'the data is ambiguous and you should be cautious' doesn't build an audience. A framework that says 'here's your next big opportunity' does." />

            {/* Pull quote */}
            <div style={s({ borderLeft: `2px solid ${E.gold}`, padding: "16px 22px", margin: "28px 0", background: E.gatm })}>
              <p style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 17, lineHeight: 1.7, color: E.text })}>
                "The distortion is in the system, not necessarily in the people. That distinction matters. It means the problem is structural — and structural problems require structural solutions."
              </p>
            </div>

            <B ch="The Capital Steward is a structural solution. It has no advertisers. It has no assets under management. It does not run a portfolio whose performance depends on its recommendations. It has no relationship with the companies it scores. The analysis is shaped entirely by what the data shows — because there is no other force acting on it." />
          </div>

          {/* Block 2 — What we believe */}
          <div style={s({ padding: "52px 44px", borderBottom: `1px solid ${E.bdr}`, background: E.gatm })}>
            <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 14 })}>02 — What we believe</p>
            <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 800, lineHeight: 1.15, color: E.text, letterSpacing: "-0.03em", marginBottom: 20 })}>
              Markets price narrative. Structure is what narratives eventually have to answer to.
            </h2>
            <B ch="Every stock price is a statement of belief about the future. Every valuation multiple is the market's current price for a story about what a company will eventually demonstrate. Some of those stories are well-grounded — the company has already demonstrated most of what its valuation requires. Others are not — the valuation depends entirely on the market continuing to believe something the company has not yet shown." />
            <B ch="This gap — between what a company has demonstrated and what its valuation requires — is where structural investment risk accumulates. It is not always visible in price. It can persist for years while a narrative holds. But it is always there, and it eventually has to reconcile." />
            <B ch="The framework we built measures that gap. Not to predict when it will reconcile — that is not knowable — but to make it visible, to quantify it, and to put it in the hands of investors who would rather know than not know." />
          </div>

          {/* Block 3 — The foundation */}
          <div style={s({ padding: "52px 44px" })}>
            <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 14 })}>03 — The foundation</p>
            <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 800, lineHeight: 1.15, color: E.text, letterSpacing: "-0.03em", marginBottom: 20 })}>
              Stewardship is about conformity to reality.
            </h2>
            <B ch="The name is not incidental. Stewardship — in the oldest and most serious sense — means careful, faithful management of something entrusted to you. For investors, that means capital. For us, it means the analysis we produce and the trust of the people who use it." />
            <B ch="We believe the work must conform to truth as much as it possibly can. That means median over mean when the mean would mislead. It means disclosing prominently that 68.5% of Very High classifications do not produce severe losses in 12 months — not in a footnote, but in the main text. It means saying 'the data is ambiguous' when the data is ambiguous, even when a confident answer would be more compelling." />
            <B ch="It means building a system that is honest about what it can and cannot do — and designing every piece of copy, every chart, and every disclosure to reflect that standard." />

            {/* Principle block */}
            <div style={s({ border: `1px solid ${E.bdr2}`, background: E.bg2, padding: "24px", marginTop: 28 })}>
              <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 16 })}>What this means in practice</p>
              <div style={s({ display: "flex", flexDirection: "column", gap: 0 })}>
                {[
                  { principle: "Median over mean", reason: "The mean in our highest-risk bucket is +12.6%. The median is −0.8%. We report the median." },
                  { principle: "Limitations disclosed prominently", reason: "Not in fine print. The false positive rate, the regime dependence, the open questions — in the main text." },
                  { principle: "No forward-state language", reason: "The platform describes structural conditions that exist now. It does not predict what will happen next." },
                  { principle: "No overclaiming", reason: "The signal is Modest full-period. We say so. The empirical record supports the framework. We say that too." },
                  { principle: "No narratives about narratives", reason: "We measure structure. We don't editorialize about which companies deserve their valuations." },
                ].map(({ principle, reason }, i) => (
                  <div key={principle} style={s({ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, padding: "14px 0", borderBottom: i < 4 ? `1px solid rgba(255,255,255,0.04)` : "none" })}>
                    <div style={s({ fontFamily: E.sans, fontSize: 12.5, fontWeight: 700, color: E.text })}>{principle}</div>
                    <div style={s({ fontFamily: E.sans, fontSize: 12.5, lineHeight: 1.65, color: E.body })}>{reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div style={s({ padding: "40px 32px" })}>

          {/* What this is not */}
          <div style={s({ marginBottom: 32, paddingBottom: 32, borderBottom: `1px solid ${E.bdr}` })}>
            <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 14 })}>What this is not</p>
            {[
              "Investment advice",
              "A stock picking service",
              "A prediction engine",
              "A replacement for your process",
              "Affiliated with any company we score",
            ].map((item, i) => (
              <div key={item} style={s({ display: "flex", gap: 10, alignItems: "baseline", padding: "8px 0", borderBottom: i < 4 ? `1px solid rgba(255,255,255,0.03)` : "none" })}>
                <div style={s({ fontFamily: E.mono, fontSize: 10, color: E.dim, flexShrink: 0 })}>—</div>
                <span style={s({ fontFamily: E.sans, fontSize: 12.5, color: E.muted })}>{item}</span>
              </div>
            ))}
          </div>

          {/* The empirical record */}
          <div style={s({ marginBottom: 32, paddingBottom: 32, borderBottom: `1px solid ${E.bdr}` })}>
            <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 14 })}>The empirical record</p>
            <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.78, color: E.body, marginBottom: 16 })}>The framework has been validated against 289,737 observations across 17 years. The results:</p>
            {[
              { label: "Factor-adj. L/S alpha", val: "+21.0%", note: "t = +4.80" },
              { label: "FCF vs Revenue spread", val: "+26.6pp", note: "All regimes" },
              { label: "Very High loss rate",   val: "~2×",    note: "vs universe" },
              { label: "Exclusion premium",     val: "+4.6pp", note: "Long-only" },
            ].map(({ label, val, note }) => (
              <div key={label} style={s({ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.03)` })}>
                <span style={s({ fontFamily: E.sans, fontSize: 12, color: E.body })}>{label}</span>
                <div style={s({ textAlign: "right" })}>
                  <span style={s({ fontFamily: E.mono, fontSize: 13, fontWeight: 500, color: E.gold })}>{val}</span>
                  <span style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, marginLeft: 8 })}>{note}</span>
                </div>
              </div>
            ))}
            <Link href="/osmr-methodology" style={s({ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: E.mono, fontSize: 9.5, color: E.gold, textDecoration: "none", marginTop: 14 })}>
              Full methodology <ArrowRight size={12} />
            </Link>
          </div>

          {/* Foundational principle */}
          <div style={s({ border: `1px solid ${E.bdr2}`, borderTop: `2px solid ${E.gold}`, background: E.gatm, padding: "20px" })}>
            <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 12 })}>Foundational principle</p>
            <p style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15, lineHeight: 1.75, color: E.text })}>
              "The work must conform to truth as much as possible and cohere with wise stewardship of capital. This is not a constraint on the work — it is the reason the work matters."
            </p>
          </div>

        </div>
      </div>

      {/* ── CTA ── */}
      <div style={s({ padding: "64px 44px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 40, borderBottom: `1px solid ${E.bdr}` })}>
        <div style={s({ maxWidth: 520 })}>
          <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(22px,3vw,32px)", fontWeight: 800, color: E.text, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 12 })}>
            If you recognize yourself in this, the platform is open.
          </h2>
          <p style={s({ fontFamily: E.sans, fontSize: 14, color: E.body, lineHeight: 1.75 })}>
            ~5,200 U.S. equities. Two independently validated dimensions of structural risk. Updated weekly. No narrative inflation.
          </p>
        </div>
        <div style={s({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 })}>
          <Link href="/platform" style={s({ fontFamily: E.sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "13px 28px", background: E.gold, color: "#060504", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 })}>
            Open Platform <ArrowRight size={14} />
          </Link>
          <Link href="/osmr-methodology" style={s({ fontFamily: E.sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, padding: "11px 22px", background: "transparent", color: E.muted, border: `1px solid ${E.bdr2}`, textDecoration: "none", textAlign: "center" as const })}>
            Read the Methodology
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={s({ padding: "28px 44px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 })}>
        <Link href="/" style={s({ textDecoration: "none", display: "flex", alignItems: "baseline" })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase" as const, color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15, color: E.gold, marginLeft: 6 })}>Steward</span>
        </Link>
        <div style={s({ display: "flex", gap: 20 })}>
          {[
            { label: "Methodology", href: "/osmr-methodology" },
            { label: "Where It Belongs",  href: "/where-it-belongs" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={s({ fontFamily: E.sans, fontSize: 11, color: E.muted, textDecoration: "none" })}>{label}</Link>
          ))}
        </div>
        <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>© 2026 The Capital Steward, LLC · Not investment advice</p>
      </div>

    </main>
  )
}