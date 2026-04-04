'use client'

// app/page.tsx
// Homepage — The Capital Steward
// Palette: P3 public light · AAA verified
// Build brief: 338be5a0-6e23-8137-a8c3-c295bff5e894
// All figures confirmed from 7yr anchor backtest rerun April 2026

import React from "react"
import Link from "next/link"

// ─── Design tokens — P3 public light ─────────────────────────────────────────

const E = {
  bg:     "#D7DDD3",
  bg2:    "#E4E9E1",  // lightened for WCAG AAA
  bg3:    "#DCE2D8",  // lightened for WCAG AAA
  bdr:    "#B5BEB2",
  bdr2:   "#A3AEA0",
  text:   "#1A1E1A",
  body:   "#3F4640",
  muted:  "#40463F",
  sage:   "#38483D",
  brick:  "#8B3A2A",
  brickS: "#5A2519",  // darkened for WCAG AAA small text
  gold:   "#4E3918",  // darkened for WCAG AAA — was #7A5C2E
  mono:   "'IBM Plex Mono','Courier New',monospace",
  sans:   "'DM Sans',system-ui,sans-serif",
  serif:  "'Playfair Display',Georgia,serif",
}
const s = (x: object) => x as React.CSSProperties

// ─── Helpers ──────────────────────────────────────────────────────────────────

function M({ children }: { children: React.ReactNode }) {
  return (
    <span style={s({ fontFamily: E.mono, fontSize: "0.88em", letterSpacing: "-0.01em" })}>
      {children}
    </span>
  )
}

// ─── Stat tiles — confirmed figures from 7yr anchor backtest ──────────────────
// 285,245: composite obs with forward returns (scripts 01–08)
// +20%: factor-adjusted alpha from script 17 (was +21%)
// t = +3.72: from script 17 (was +4.80)
// ~2×: relative risk 2.44× — "approximately twice" remains accurate and defensible

const STAT_TILES = [
  {
    stat:  "285,245",
    label: "Historical observations",
    sub:   "2009–2026",
  },
  {
    stat:  "17yr",
    label: "Backtest period",
    sub:   "Across 3 market cycles",
  },
  {
    stat:  "+20%",
    label: "Factor-adjusted alpha",
    sub:   "t = +3.72",
  },
  {
    stat:  "~2.5×",
    label: "Severe loss frequency in flagged stocks",
    sub:   "vs. universe · all regimes",
  },
]

// ─── OAL Ladder — Revenue at top (shallowest), FCF at bottom (deepest) ────────

const OAL_RUNGS = [
  { label: "Revenue", desc: "Shallowest anchor",       color: E.brick,  penalty: "4.236×" },
  { label: "EBIT",    desc: "Operating income only",   color: E.gold,   penalty: "1.618×" },
  { label: "NI",      desc: "Profitable, not cash+",   color: E.muted,    penalty: "1.0×"   },
  { label: "FCF",     desc: "Deepest anchor",          color: E.sage,   penalty: "0×"     },
]

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav style={s({
      display: "flex", justifyContent: "space-between", alignItems: "center",
      height: 48, padding: "0 32px", borderBottom: `1px solid ${E.bdr}`,
      background: E.bg, position: "sticky", top: 0, zIndex: 50,
    })}>
      <div style={s({ display: "flex", alignItems: "baseline", gap: 6 })}>
        <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.28em",
          textTransform: "uppercase", color: E.muted })}>The Capital</span>
        <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15,
          color: E.gold })}>Steward</span>
      </div>
      <div style={s({ display: "flex", alignItems: "center", gap: 28 })}>
        {[
          { href: "/methodology", label: "Examine the Evidence" },
          { href: "/where-it-fits",label: "Where It Fits"       },
          { href: "/who-its-for",  label: "Who It's For"        },
        ].map(({ href, label }) => (
          <Link key={href} href={href} style={s({
            fontFamily: E.mono, fontSize: 10, letterSpacing: "0.1em",
            textTransform: "uppercase", color: E.muted, textDecoration: "none",
          })}>{label}</Link>
        ))}
        <Link href="/platform" style={s({
          fontFamily: E.mono, fontSize: 10, letterSpacing: "0.1em",
          textTransform: "uppercase", color: E.bg, background: E.text,
          padding: "6px 14px", textDecoration: "none",
        })}>Open Platform →</Link>
      </div>
    </nav>
  )
}

// ─── Status bar ───────────────────────────────────────────────────────────────

function StatusBar() {
  return (
    <div style={s({
      display: "flex", justifyContent: "center", padding: "8px 32px",
      borderBottom: `1px solid ${E.bdr}`, background: E.bg2,
    })}>
      <span style={s({ fontFamily: E.mono, fontSize: 9.5, letterSpacing: "0.18em",
        textTransform: "uppercase", color: E.muted, display: "flex",
        alignItems: "center", gap: 8 })}>
        <span style={s({ width: 5, height: 5, borderRadius: "50%",
          background: E.sage, display: "inline-block" })}/>
        System Live · ~5,200 Equities · Updated Weekly
      </span>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={s({
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "96px 32px 72px", background: E.bg,
      borderBottom: `1px solid ${E.bdr}`,
    })}>
      {/* Headline */}
      <h1 style={s({
        fontFamily: E.serif, fontWeight: 400, textAlign: "center",
        fontSize: "clamp(32px, 5.5vw, 58px)", lineHeight: 1.15,
        letterSpacing: "-0.025em", marginBottom: 28, maxWidth: 680,
      })}>
        <span style={s({ color: E.text })}>Markets value </span>
        <em style={s({ color: E.brick, fontStyle: "italic" })}>stories.</em>
        <br/>
        <span style={s({ color: E.text })}>We value </span>
        <span style={s({ color: E.sage })}>structure.</span>
      </h1>

      {/* Subhead */}
      <p style={s({
        fontFamily: E.sans, fontSize: "clamp(15px, 2vw, 18px)", lineHeight: 1.8,
        color: E.body, textAlign: "center", maxWidth: 580, marginBottom: 28,
      })}>
        Most valuation frameworks assume that equity markets price fundamentals.
        The structural question — whether a company's price reflects what it has
        actually produced operationally — rarely gets asked. It should be the
        first question.{" "}
        <span style={s({ display: "block", marginTop: 12 })}>
          That structural risk is measurable. Seventeen years of data say so.
        </span>
      </p>

      {/* Product definition line */}
      <p style={s({
        fontFamily: E.mono, fontSize: 11, color: E.muted, letterSpacing: "0.06em",
        marginBottom: 36, textAlign: "center",
      })}>
        A structural risk scoring system for ~5,200 U.S. equities — updated weekly,
        grounded in 17 years of validated data.
      </p>

      {/* CTAs */}
      <div style={s({ display: "flex", gap: 10, alignItems: "center" })}>
        <Link href="/platform" style={s({
          fontFamily: E.sans, fontSize: 13, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "13px 28px", background: E.text, color: E.bg,
          textDecoration: "none",
        })}>
          Open Platform →
        </Link>
        <Link href="/methodology" style={s({
          fontFamily: E.sans, fontSize: 13, fontWeight: 600,
          letterSpacing: "0.08em", textTransform: "uppercase",
          padding: "13px 28px", background: "transparent", color: E.body,
          border: `1px solid ${E.bdr2}`, textDecoration: "none",
        })}>
          Examine the Evidence
        </Link>
      </div>
    </section>
  )
}

// ─── Section 1 — The Structural Gap ──────────────────────────────────────────

function Section1() {
  // Option B: Left margin rule in sage at 40% opacity, full height of column, removes below 960px
  const emphasisStyle = s({
    fontWeight: 600,
    color: E.text,
  })

  return (
    <section style={s({ background: E.bg, borderBottom: `1px solid ${E.bdr}` })}>
      <div style={s({
        maxWidth: 720, margin: "0 auto", padding: "80px 32px",
        position: "relative",
      })}>
        {/* Option B — left margin rule */}
        <div style={s({
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 1, background: E.sage, opacity: 0.4,
          // Removed below 960px via media query — build team to add CSS
        })}/>

        <p style={s({
          fontFamily: E.sans, fontSize: "clamp(15px, 1.8vw, 17px)",
          lineHeight: 1.9, color: E.body, marginBottom: 28,
        })}>
          Every stock price is a statement of belief. The multiple — P/E, EV/EBITDA,
          P/S, whatever applies — is the market's current price for a story about
          what a company will eventually produce.
        </p>

        <p style={s({
          fontFamily: E.sans, fontSize: "clamp(15px, 1.8vw, 17px)",
          lineHeight: 1.9, color: E.body, marginBottom: 28,
        })}>
          Some of those stories are well-grounded. The company has already built
          most of what its valuation requires. Others depend entirely on the market
          continuing to believe something the company has not yet shown. The distance
          between those two conditions is not a matter of opinion.{" "}
          {/* Option A — typographic weight treatment on this sentence */}
          <span style={emphasisStyle}>
            It is a structural fact — and it is measurable.
          </span>
        </p>

        <p style={s({
          fontFamily: E.sans, fontSize: "clamp(15px, 1.8vw, 17px)",
          lineHeight: 1.9, color: E.body, marginBottom: 28,
        })}>
          Most valuation frameworks don't ask how wide that distance is. They ask
          whether the story is plausible. That's a different question, and answering
          it well doesn't answer the structural one.
        </p>

        <p style={s({
          fontFamily: E.sans, fontSize: "clamp(15px, 1.8vw, 17px)",
          lineHeight: 1.9, color: E.body,
        })}>
          Seventeen years of data across ~5,200 U.S. equities show that the
          structural question has a consistent answer. Companies grounded in
          operational reality — those whose valuations reflect what they have
          actually produced — behave differently from companies whose valuations
          rest on narrative.{" "}
          {/* Option A — typographic weight treatment on this sentence */}
          <span style={emphasisStyle}>
            Measurably, durably, across every market regime tested.
          </span>
        </p>
      </div>
    </section>
  )
}

// ─── Stat tile grid — moves to after Section 1 ────────────────────────────────

function StatTiles() {
  return (
    <section style={s({ borderBottom: `1px solid ${E.bdr}` })}>
      <div style={s({
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        background: E.bg2,
      })}>
        {STAT_TILES.map(({ stat, label, sub }, i) => (
          <div key={label} style={s({
            padding: "32px 28px",
            borderRight: i < 3 ? `1px solid ${E.bdr}` : "none",
          })}>
            <div style={s({
              fontFamily: E.mono, fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 500, color: E.text, letterSpacing: "-0.03em",
              lineHeight: 1, marginBottom: 8,
            })}>
              {stat}
            </div>
            <div style={s({
              fontFamily: E.sans, fontSize: 13, fontWeight: 500,
              color: E.body, marginBottom: 4, lineHeight: 1.4,
            })}>
              {label}
            </div>
            <div style={s({
              fontFamily: E.mono, fontSize: 10, color: E.muted,
              letterSpacing: "0.06em",
            })}>
              {sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Section 2 — The Evidence ─────────────────────────────────────────────────
// All figures confirmed from 7yr anchor backtest rerun:
// - 37.3pp FCF vs Revenue spread (script 03)
// - 285,245 observations (script 01-08)
// - +20% alpha, t=3.72 (script 17)
// - 3.48% R², 96.52% orthogonal (script 17)
// - 39.6% VH loss rate, 10.5% VL loss rate (scripts 18, 20)

function Section2() {
  return (
    <section style={s({
      background: E.bg, borderBottom: `1px solid ${E.bdr}`,
    })}>
      <div style={s({
        maxWidth: 720, margin: "0 auto", padding: "80px 32px",
      })}>
        <p style={s({
          fontFamily: E.mono, fontSize: 9.5, letterSpacing: "0.18em",
          textTransform: "uppercase", color: E.muted, marginBottom: 32,
        })}>
          The Evidence
        </p>

        <p style={s({
          fontFamily: E.sans, fontSize: "clamp(15px, 1.8vw, 17px)",
          lineHeight: 1.9, color: E.body, marginBottom: 28,
        })}>
          The most durable finding in the data is also the simplest. Companies that
          generate free cash flow outperform companies whose valuations rest on revenue
          alone by <M>37.3</M> percentage points in median annual returns — across{" "}
          <M>285,245</M> observations, held in every market regime tested. That spread
          is not a product of a particular period or a particular methodology. It is a
          structural fact about what operational cash generation is worth relative to
          the promise of it.
        </p>

        <p style={s({
          fontFamily: E.sans, fontSize: "clamp(15px, 1.8vw, 17px)",
          lineHeight: 1.9, color: E.body, marginBottom: 28,
        })}>
          The second question any serious allocator asks about a new framework is
          whether it carries information beyond what established factors already
          explain. This one has been tested against the Fama-French five-factor
          model plus momentum — controlling for market, size, value, profitability,
          investment, and momentum simultaneously. After stripping all six factors,
          the long-short portfolio produces <M>+20%</M> annualized alpha. The
          t-statistic is <M>3.72</M>. The factor model explains <M>3.48%</M> of
          long-short return variance. The remaining <M>96.52%</M> is orthogonal to
          the entire established factor set — meaning the signal is not explained
          by size, value, profitability, momentum, or any combination of them.
          This is not a repackaging of known signals.
        </p>

        <p style={s({
          fontFamily: E.sans, fontSize: "clamp(15px, 1.8vw, 17px)",
          lineHeight: 1.9, color: E.body,
        })}>
          The signal concentrates where it matters most. In the highest structural
          risk bucket, <M>39.6%</M> of observations ended more than <M>25%</M> below
          their starting price over a 12-month horizon. In the lowest risk bucket,
          that figure is <M>10.5%</M>. Companies flagged as structurally fragile
          incur severe losses at approximately 2.5 times the rate of the broad universe —
          across expansion, neutral, and stress regimes alike.
        </p>
      </div>
    </section>
  )
}

// ─── Section 3 — What It Produces ────────────────────────────────────────────

function Section3() {
  return (
    <section style={s({
      background: E.bg2, borderBottom: `1px solid ${E.bdr}`,
    })}>
      <div style={s({
        maxWidth: 720, margin: "0 auto", padding: "80px 32px",
      })}>
        <p style={s({
          fontFamily: E.mono, fontSize: 9.5, letterSpacing: "0.18em",
          textTransform: "uppercase", color: E.muted, marginBottom: 32,
        })}>
          What It Produces
        </p>

        <p style={s({
          fontFamily: E.sans, fontSize: "clamp(15px, 1.8vw, 17px)",
          lineHeight: 1.9, color: E.body, marginBottom: 28,
        })}>
          The platform scores approximately 5,200 U.S. equities across two
          independently validated dimensions of structural risk — how far a
          company's valuation has stretched beyond what it has actually produced,
          and whether that production is improving or deteriorating. Used alone,
          either misleads. Together, they locate the same structural condition
          from two directions.
        </p>

        <p style={s({
          fontFamily: E.sans, fontSize: "clamp(15px, 1.8vw, 17px)",
          lineHeight: 1.9, color: E.body, marginBottom: 40,
        })}>
          Every company in the universe receives an anchor rung — a designation
          of the deepest financial metric it has genuinely sustained over a trailing
          seven-year window. Free cash flow is the deepest. Revenue is the shallowest.
          The distance between where a company sits on that ladder and what its
          current valuation requires is the first dimension of structural risk.
        </p>

        {/* OAL Ladder — Revenue at top (shallowest), FCF at bottom (deepest) */}
        <div style={s({
          border: `1px solid ${E.bdr}`, background: E.bg,
          marginBottom: 40,
        })}>
          <div style={s({
            padding: "10px 16px", borderBottom: `1px solid ${E.bdr}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          })}>
            <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.16em",
              textTransform: "uppercase", color: E.muted })}>
              Operational Anchor Ladder
            </span>
            <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.muted })}>
              ↓ deeper = stronger structural anchor
            </span>
          </div>
          {OAL_RUNGS.map(({ label, desc, color, penalty }, i) => (
            <div key={label} style={s({
              display: "grid", gridTemplateColumns: "80px 1fr auto",
              alignItems: "center", gap: 12,
              padding: "14px 16px",
              borderBottom: i < OAL_RUNGS.length - 1 ? `1px solid ${E.bdr}` : "none",
              borderLeft: `3px solid ${color}`,
            })}>
              <span style={s({
                fontFamily: E.sans, fontSize: 13, fontWeight: 700, color: E.text,
              })}>
                {label}
              </span>
              <span style={s({
                fontFamily: E.sans, fontSize: 12.5, color: E.body,
              })}>
                {desc}
              </span>
              <span style={s({
                fontFamily: E.mono, fontSize: 10, color: E.muted, whiteSpace: "nowrap",
              })}>
                +{penalty} penalty
              </span>
            </div>
          ))}
        </div>

        <p style={s({
          fontFamily: E.sans, fontSize: "clamp(15px, 1.8vw, 17px)",
          lineHeight: 1.9, color: E.body, marginBottom: 28,
        })}>
          The second is trajectory. A company moving toward deeper operational
          grounding is accumulating structural strength, whether or not the market
          has noticed. A company moving away from it is accumulating fragility,
          whether or not the price has moved.
        </p>

        <p style={s({
          fontFamily: E.sans, fontSize: "clamp(15px, 1.8vw, 17px)",
          lineHeight: 1.9, color: E.body,
        })}>
          The composite score ranks every company against the full universe on both
          dimensions simultaneously. The result is a live map of where structural
          risk is concentrated and where it isn't — updated weekly, across the full
          breadth of the U.S. equity market.
        </p>
      </div>
    </section>
  )
}

// ─── Section 4 — The Close ────────────────────────────────────────────────────

function Section4() {
  return (
    <section style={s({ background: E.bg, borderBottom: `1px solid ${E.bdr}` })}>
      <div style={s({
        maxWidth: 560, margin: "0 auto", padding: "96px 32px",
        textAlign: "center",
      })}>

        <p style={s({
          fontFamily: E.sans, fontSize: "clamp(16px, 2vw, 20px)",
          lineHeight: 1.8, color: E.body, marginBottom: 20,
        })}>
          For a long time, the question was whether structural narrative risk —
          the distance between what a company has built and what its valuation
          requires — was systematically measurable at scale.
        </p>

        <p style={s({
          fontFamily: E.sans, fontSize: "clamp(16px, 2vw, 20px)",
          lineHeight: 1.8, color: E.body, marginBottom: 40,
        })}>
          The answer required a framework that could evaluate the full U.S. equity
          universe on a common structural basis — not sector by sector, not
          qualitatively, but quantitatively, simultaneously, and updated continuously.
        </p>

        {/* "It does now." — isolated, additional space above */}
        <p style={s({
          fontFamily: E.serif, fontStyle: "italic",
          fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 400,
          color: E.text, letterSpacing: "-0.02em",
          marginTop: 48, marginBottom: 48,
          lineHeight: 1.2,
        })}>
          It does now.
        </p>

        {/* CTAs — identical visual treatment to above-fold */}
        <div style={s({ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" })}>
          <Link href="/platform" style={s({
            fontFamily: E.sans, fontSize: 13, fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "13px 28px", background: E.text, color: E.bg,
            textDecoration: "none",
          })}>
            Open Platform →
          </Link>
          <Link href="/methodology" style={s({
            fontFamily: E.sans, fontSize: 13, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "13px 28px", background: "transparent", color: E.body,
            border: `1px solid ${E.bdr2}`, textDecoration: "none",
          })}>
            Examine the Evidence
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={s({
      padding: "28px 32px", borderTop: `1px solid ${E.bdr}`,
      background: E.bg2,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexWrap: "wrap", gap: 12,
    })}>
      <div style={s({ display: "flex", alignItems: "baseline", gap: 6 })}>
        <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.28em",
          textTransform: "uppercase", color: E.muted })}>The Capital</span>
        <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 14,
          color: E.gold })}>Steward</span>
      </div>
      <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, lineHeight: 1.7 })}>
        © 2026 The Capital Steward, LLC. For informational purposes only.
        Not investment advice.
      </p>
      <div style={s({ display: "flex", gap: 20 })}>
        {[
          { href: "/methodology",  label: "Evidence" },
          { href: "/where-it-fits",label: "Where It Fits" },
          { href: "/who-its-for",  label: "Who It's For" },
        ].map(({ href, label }) => (
          <Link key={href} href={href} style={s({
            fontFamily: E.mono, fontSize: 9.5, color: E.muted,
            textDecoration: "none", letterSpacing: "0.1em",
          })}>{label}</Link>
        ))}
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div style={s({ minHeight: "100vh", background: E.bg, color: E.text, fontFamily: E.sans })}>
      <Nav/>
      <StatusBar/>
      <Hero/>

      {/* Sequence per build brief:
          1. Section 1 — The Structural Gap
          2. Stat tile grid
          3. Section 2 — The Evidence
          4. Section 3 — What It Produces
          5. Section 4 — The Close
          6. Footer
      */}
      <Section1/>
      <StatTiles/>
      <Section2/>
      <Section3/>
      <Section4/>
      <Footer/>
    </div>
  )
}