'use client'

// FONT: DM Sans (sans) + IBM Plex Mono (mono) + Playfair Display (serif)
// File: app/page.tsx

import { useState, useEffect, useRef } from "react"
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

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = Date.now()
      const tick = () => {
        const progress = Math.min((Date.now() - start) / 1400, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        setVal(Math.round(ease * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

// ─── Mono numeral inline emphasis ─────────────────────────────────────────────
function Num({ children }: { children: React.ReactNode }) {
  return (
    <span style={s({ fontFamily: E.mono, fontSize: 17, color: E.text, letterSpacing: "-0.01em" })}>
      {children}
    </span>
  )
}

// ─── Anchor ladder visual ──────────────────────────────────────────────────────
const LADDER_RUNGS = [
  { code: "FCF",     label: "Free Cash Flow",   note: "Deepest anchor · zero penalty" },
  { code: "NI",      label: "Net Income",        note: "Profitable but not cash-positive · 1.0× penalty" },
  { code: "EBIT",    label: "Operating Income",  note: "Revenue covers operating costs · 1.618× penalty" },
  { code: "Revenue", label: "Revenue",           note: "Shallowest anchor · 4.236× penalty" },
]

function AnchorLadder() {
  return (
    <div style={s({ position: "relative", margin: "40px auto 36px", maxWidth: 400, paddingLeft: 28 })}>
      {/* Vertical rail */}
      <div style={s({ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: E.bdr })} />
      {LADDER_RUNGS.map(({ code, label, note }, i) => (
        <div key={code} style={s({ position: "relative", paddingBottom: i < LADDER_RUNGS.length - 1 ? 28 : 0 })}>
          {/* Horizontal rung tick */}
          <div style={s({ position: "absolute", left: -28, top: 7, width: 14, height: 2, background: E.bdr2 })} />
          <div style={s({ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 })}>
            <span style={s({ fontFamily: E.mono, fontSize: 11.5, fontWeight: 600, color: E.gold, letterSpacing: "0.06em", flexShrink: 0 })}>{code}</span>
            <span style={s({ fontFamily: E.sans, fontSize: 13, fontWeight: 600, color: E.text })}>{label}</span>
          </div>
          <div style={s({ fontFamily: E.mono, fontSize: 10, color: E.muted, letterSpacing: "0.04em", lineHeight: 1.5 })}>{note}</div>
        </div>
      ))}
    </div>
  )
}

export default function Homepage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <main style={s({ minHeight: "100vh", background: E.bg, color: E.text, fontFamily: E.sans })}>

      {/* ── NAV ── */}
      <nav style={s({
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 44px", height: 52,
        background: scrolled ? "rgba(215,221,211,0.95)" : E.bg,
        borderBottom: `1px solid ${scrolled ? E.bdr : "transparent"}`,
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.25s",
      })}>
        <Link href="/" style={s({ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9.5, fontWeight: 400, letterSpacing: "0.32em", textTransform: "uppercase", color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 17, color: E.gold, marginLeft: 8, letterSpacing: "0.01em" })}>Steward</span>
        </Link>
        <div style={s({ display: "flex", alignItems: "center" })}>
          {[
            { label: "Who It's For",  href: "/who-its-for" },
            { label: "Methodology",   href: "/methodology" },
            { label: "Where It Fits", href: "/where-it-fits" },
          ].map(({ label, href }) => (
            <Link key={href} href={href}
              style={s({ fontFamily: E.sans, fontSize: 10.5, fontWeight: 600, color: E.muted, padding: "0 16px", borderLeft: `1px solid ${E.bdr}`, textDecoration: "none", height: 52, display: "flex", alignItems: "center", letterSpacing: "0.02em", transition: "color 0.12s" })}
              onMouseEnter={e => (e.currentTarget.style.color = E.text)}
              onMouseLeave={e => (e.currentTarget.style.color = E.muted)}>
              {label}
            </Link>
          ))}
          <Link href="/platform"
            style={s({ fontFamily: E.sans, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 20px", background: E.text, color: E.bg, textDecoration: "none", marginLeft: 20, transition: "opacity 0.15s" })}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
            Platform
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={s({ position: "relative", overflow: "hidden", borderBottom: `1px solid ${E.bdr}` })}>
        <div style={s({
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(74,94,80,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(74,94,80,0.06) 1px,transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%,black 30%,transparent 100%)",
        })} />
        <div style={s({ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "96px 36px 80px", maxWidth: 720, margin: "0 auto" })}>
          <div style={s({ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 44 })}>
            <div style={s({ width: 4, height: 4, borderRadius: "50%", background: E.sage, boxShadow: "0 0 6px rgba(74,94,80,0.5)", animation: "pulse 2.5s ease-in-out infinite" })} />
            <span style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.24em", textTransform: "uppercase", color: E.muted })}>
              System live · ~5,200 equities · Updated weekly
            </span>
          </div>
          <h1 style={s({ fontFamily: E.sans, fontSize: "clamp(36px,5vw,60px)", fontWeight: 800, lineHeight: 1.1, color: E.text, letterSpacing: "-0.02em", marginBottom: 32 })}>
            Markets value <em style={s({ fontStyle: "italic", fontFamily: E.serif, fontWeight: 400, color: E.brick, fontSize: "clamp(38px,5.2vw,64px)", letterSpacing: "0.01em" })}>stories.</em><br />
            We value <span style={s({ color: E.sage })}>structure.</span>
          </h1>
          <div style={s({ maxWidth: 560, marginBottom: 44 })}>
            <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.78, color: E.body, marginBottom: 16 })}>
              Most valuation frameworks assume that equity markets price fundamentals. The structural question — whether a company&#39;s price reflects what it has actually demonstrated operationally — rarely gets asked. It should be the first question.
            </p>
            <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.78, color: E.text, fontWeight: 700 })}>
              That structural risk is measurable. Seventeen years of data say so.
            </p>
          </div>
          <div style={s({ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" })}>
            <Link href="/platform" style={s({ fontFamily: E.sans, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "13px 28px", background: E.text, color: E.bg, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 })}>
              Open Platform <ArrowRight size={14} />
            </Link>
            <Link href="/methodology" style={s({ fontFamily: E.sans, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "13px 24px", background: "transparent", color: E.body, border: `1px solid ${E.bdr}`, textDecoration: "none" })}>
              Examine the Evidence
            </Link>
          </div>
        </div>
      </div>

      {/* ── PROOF STRIP ── */}
      <div className="stats-grid" style={s({ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: `1px solid ${E.bdr}` })}>
        {[
          { val: null,   target: 289737, suffix: "",    prefix: "", label: "Historical observations",                           note: "2009–2026" },
          { val: null,   target: 17,     suffix: "yr",  prefix: "", label: "Backtest period",                                    note: "Across 3 market cycles" },
          { val: "+21%", target: 0,      suffix: "",    prefix: "", label: "Factor-adjusted alpha",                              note: "t = +4.80" },
          { val: "~2×",  target: 0,      suffix: "",    prefix: "", label: "Severe loss frequency in flagged stocks vs. universe", note: "all regimes" },
        ].map(({ val, target, suffix, prefix, label, note }, i) => (
          <div key={label} style={s({ padding: "24px 28px", borderRight: i < 3 ? `1px solid ${E.bdr}` : "none" })}>
            <div style={s({ fontFamily: E.mono, fontSize: 26, fontWeight: 500, color: i >= 2 ? E.gold : E.text, letterSpacing: "-0.03em", marginBottom: 4, lineHeight: 1 })}>
              {target > 0 ? <Counter target={target} suffix={suffix} prefix={prefix} /> : val}
            </div>
            <div style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted, marginBottom: 2 })}>{label}</div>
            <div style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.dim })}>{note}</div>
          </div>
        ))}
      </div>

      {/* ── SECTION 1: THE STRUCTURAL GAP ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr}` })}>
        <div className="prose-col" style={s({ maxWidth: 680, margin: "0 auto", padding: "88px 36px 80px" })}>
          <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.85, color: E.body, marginBottom: 28 })}>
            Every stock price is a statement of belief. The multiple — P/E, EV/EBITDA, P/S, whatever applies — is the market&#39;s current price for a story about what a company will eventually produce.
          </p>
          <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.85, color: E.body, marginBottom: 28 })}>
            Some of those stories are well-grounded. The company has already built most of what its valuation requires. Others depend entirely on the market continuing to believe something the company has not yet shown. The distance between those two conditions is not a matter of opinion. It is a structural fact — and it is measurable.
          </p>
          <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.85, color: E.body, marginBottom: 28 })}>
            Most valuation frameworks don&#39;t ask how wide that distance is. They ask whether the story is plausible. That&#39;s a different question, and answering it well doesn&#39;t answer the structural one.
          </p>
          <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.85, color: E.body })}>
            Seventeen years of data across ~<Num>5,200</Num> U.S. equities show that the structural question has a consistent answer. Companies grounded in operational reality — those whose valuations reflect what they have actually produced — behave differently from companies whose valuations rest on narrative. Measurably, durably, across every market regime tested.
          </p>
        </div>
      </div>

      {/* ── SECTION 2: THE EVIDENCE ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr}` })}>
        <div className="prose-col" style={s({ maxWidth: 680, margin: "0 auto", padding: "80px 36px" })}>
          <div style={s({ width: 32, height: 2, background: E.bdr, marginBottom: 44 })} />
          <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.85, color: E.body, marginBottom: 28 })}>
            The most durable finding in the data is also the simplest. Companies that generate free cash flow outperform companies whose valuations rest on revenue alone by <Num>26.6</Num> percentage points in median annual returns — across <Num>289,737</Num> observations, held in every market regime tested. That spread is not a product of a particular period or a particular methodology. It is a structural fact about what operational cash generation is worth relative to the promise of it.
          </p>
          <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.85, color: E.body, marginBottom: 28 })}>
            The second question any serious allocator asks about a new framework is whether it carries information beyond what established factors already explain. This one has been tested against the Fama-French five-factor model plus momentum — controlling for market, size, value, profitability, investment, and momentum simultaneously. After stripping all six factors, the long-short portfolio produces <Num>+21%</Num> annualized alpha. The t-statistic is <Num>4.80</Num>. The factor model explains <Num>5.1%</Num> of long-short return variance. The remaining <Num>94.9%</Num> is orthogonal to the entire established factor set — meaning the signal is not explained by size, value, profitability, momentum, or any combination of them. This is not a repackaging of known signals.
          </p>
          <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.85, color: E.body })}>
            The signal concentrates where it matters most. In the highest structural risk bucket, <Num>30.3%</Num> of observations ended more than <Num>25%</Num> below their starting price over a <Num>12</Num>-month horizon. In the lowest risk bucket, that figure is <Num>12.2%</Num>. Companies flagged as structurally fragile incur severe losses at approximately twice the rate of the broad universe — across expansion, neutral, and stress regimes alike.
          </p>
        </div>
      </div>

      {/* ── SECTION 3: WHAT IT PRODUCES ── */}
      <div style={s({ background: E.bg2, borderBottom: `1px solid ${E.bdr}` })}>
        <div className="prose-col" style={s({ maxWidth: 680, margin: "0 auto", padding: "80px 36px" })}>
          <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.85, color: E.body, marginBottom: 28 })}>
            The platform scores approximately <Num>5,200</Num> U.S. equities across two independently validated dimensions of structural risk — how far a company&#39;s valuation has stretched beyond what it has actually produced, and whether that production is improving or deteriorating. Used alone, either misleads. Together, they locate the same structural condition from two directions.
          </p>
          <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.85, color: E.body })}>
            Every company in the universe receives an anchor rung — a designation of the deepest financial metric it has genuinely sustained over a trailing three-year window. Free cash flow is the deepest. Revenue is the shallowest. The distance between where a company sits on that ladder and what its current valuation requires is the first dimension of structural risk.
          </p>

          <AnchorLadder />

          <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.85, color: E.body, marginBottom: 28 })}>
            The second is trajectory. A company moving toward deeper operational grounding is accumulating structural strength, whether or not the market has noticed. A company moving away from it is accumulating fragility, whether or not the price has moved.
          </p>
          <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.85, color: E.body })}>
            The composite score ranks every company against the full universe on both dimensions simultaneously. The result is a live map of where structural risk is concentrated and where it isn&#39;t — updated weekly, across the full breadth of the U.S. equity market.
          </p>
        </div>
      </div>

      {/* ── SECTION 4: THE CLOSE ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr}` })}>
        <div style={s({ maxWidth: 520, margin: "0 auto", padding: "112px 36px 96px", textAlign: "center" })}>
          <p style={s({ fontFamily: E.sans, fontSize: 22, fontWeight: 700, lineHeight: 1.6, color: E.text, margin: 0 })}>
            The question of whether a company&#39;s valuation is grounded in what it has actually built — or suspended above what it has only promised — is not a new question. It has just rarely had a rigorous answer.
          </p>
          <p style={s({ fontFamily: E.sans, fontSize: 28, fontWeight: 800, color: E.text, letterSpacing: "-0.02em", margin: 0, paddingTop: 52, paddingBottom: 52 })}>
            It does now.
          </p>
          <div style={s({ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" })}>
            <Link href="/platform" style={s({ fontFamily: E.sans, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "13px 28px", background: E.text, color: E.bg, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 })}>
              Open Platform <ArrowRight size={14} />
            </Link>
            <Link href="/methodology" style={s({ fontFamily: E.sans, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "13px 24px", background: "transparent", color: E.body, border: `1px solid ${E.bdr}`, textDecoration: "none" })}>
              Examine the Evidence
            </Link>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="site-footer" style={s({ padding: "28px 44px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 })}>
        <Link href="/" style={s({ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9, fontWeight: 400, letterSpacing: "0.28em", textTransform: "uppercase", color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15, color: E.gold, marginLeft: 6 })}>Steward</span>
        </Link>
        <div style={s({ display: "flex", gap: 20 })}>
          {[
            { label: "Who It's For",  href: "/who-its-for" },
            { label: "Methodology",   href: "/methodology" },
            { label: "Where It Fits", href: "/where-it-fits" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={s({ fontFamily: E.sans, fontSize: 11, color: E.muted, textDecoration: "none", padding: "8px 0", display: "inline-block" })}>{label}</Link>
          ))}
        </div>
        <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>© 2026 The Capital Steward, LLC · Not investment advice</p>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .stats-grid > div {
            border-right: none !important;
            border-bottom: 1px solid #B7C1B4;
          }
          .prose-col {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }

        .site-footer a {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          padding: 0 4px;
        }
      `}</style>

    </main>
  )
}