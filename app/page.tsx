'use client'

// FONT: same globals.css import (Syne + IBM Plex Mono + Playfair Display)
// File goes to: app/page.tsx

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const E = {
  bg: "#0E0D0B", bg2: "#131210", bg3: "#181614",
  bdr: "#272420", bdr2: "#33302A",
  text: "#EDE9E0", body: "#A89E8E", muted: "#AA9D91", dim: "#857B71",
  gold: "#C5A24A", gatm: "rgba(197,162,74,0.04)",
  pos: "#74A95C", neg: "#D9867C", blue: "#627EAA",
  mono: "'IBM Plex Mono','Courier New',monospace",
  sans: "'Syne',system-ui,sans-serif",
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

// ─── OAL inline bar (hero) ────────────────────────────────────────────────────
function HeroOALBar({ code, label, color, bg, border, pct, ret, delay }: {
  code: string; label: string; color: string; bg: string; border: string;
  pct: number; ret: string; delay: number
}) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      setTimeout(() => setWidth(pct), delay)
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [pct, delay])

  return (
    <div style={s({ display: "grid", gridTemplateColumns: "40px 1fr 60px", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.03)` })}>
      <div style={s({ fontFamily: E.mono, fontSize: 9, fontWeight: 500, padding: "2px 4px", textAlign: "center", color, background: bg, border: `1px solid ${border}`, letterSpacing: "0.05em" })}>{code}</div>
      <div ref={ref} style={s({ height: 2, background: E.bdr2, position: "relative" })}>
        <div style={s({ position: "absolute", left: 0, top: 0, height: 2, background: color, opacity: 0.85, width: `${width}%`, transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${delay}ms` })} />
      </div>
      <div style={s({ fontFamily: E.mono, fontSize: 12, fontWeight: 500, color, textAlign: "right" })}>{ret}</div>
    </div>
  )
}

const OAL_DATA = [
  { code: "FCF",  label: "Free Cash Flow", color: "#6DAE8B", bg: "rgba(116,169,92,0.09)",  border: "rgba(116,169,92,0.28)",  pct: 70, ret: "+9.8%" },
  { code: "NI",   label: "Net Income",     color: "#6B9EC4", bg: "rgba(98,126,170,0.09)",  border: "rgba(98,126,170,0.28)",  pct: 42, ret: "+4.0%" },
  { code: "EBIT", label: "EBIT",           color: "#D4B56A", bg: "rgba(197,162,74,0.09)",  border: "rgba(197,162,74,0.28)",  pct: 29, ret: "+2.5%" },
  { code: "Rev",  label: "Revenue",        color: "#D9867C", bg: "rgba(217,134,124,0.09)",   border: "rgba(217,134,124,0.28)",   pct: 6,  ret: "−16.7%" },
]

const RESULTS = [
  { metric: "Factor-adjusted L/S alpha (FF5 + Momentum)", val: "+21.0%", color: E.pos },
  { metric: "t-statistic on alpha",                        val: "+4.80",  color: E.text },
  { metric: "Very High loss rate vs universe",             val: "~2×",    color: E.neg },
  { metric: "FCF vs Revenue median spread",                val: "+26.6pp",color: E.pos },
  { metric: "Exclusion premium (long-only filter)",        val: "+4.6pp", color: E.pos },
  { metric: "Selection premium (Very Low only)",           val: "+3.1pp", color: E.pos },
]

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
        background: scrolled ? "rgba(14,13,11,0.95)" : E.bg,
        borderBottom: `1px solid ${scrolled ? E.bdr : "transparent"}`,
        backdropFilter: scrolled ? "blur(16px)" : "none",
        transition: "all 0.25s",
      })}>
        {/* Masthead wordmark */}
        <Link href="/" style={s({ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9.5, fontWeight: 400, letterSpacing: "0.32em", textTransform: "uppercase", color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 17, color: E.gold, marginLeft: 8, letterSpacing: "0.01em" })}>Steward</span>
        </Link>

        {/* Nav links */}
        <div style={s({ display: "flex", alignItems: "center" })}>
          {[
            { label: "Who It's For", href: "/who-its-for" },
            { label: "Methodology",    href: "/methodology" },
            { label: "Where It Belongs",     href: "/where-it-belongs" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={s({ fontFamily: E.sans, fontSize: 10.5, fontWeight: 600, color: E.muted, padding: "0 16px", borderLeft: `1px solid ${E.bdr}`, textDecoration: "none", height: 52, display: "flex", alignItems: "center", letterSpacing: "0.02em", transition: "color 0.12s" })}
              onMouseEnter={e => (e.currentTarget.style.color = E.text)}
              onMouseLeave={e => (e.currentTarget.style.color = E.muted)}>
              {label}
            </Link>
          ))}
          <Link href="/platform" style={s({ fontFamily: E.sans, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 20px", background: E.gold, color: "#060504", textDecoration: "none", marginLeft: 20, transition: "opacity 0.15s" })}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
            Platform
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={s({ position: "relative", overflow: "hidden", borderBottom: `1px solid ${E.bdr}` })}>

        {/* Grid texture */}
        <div style={s({
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(197,162,74,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(197,162,74,0.03) 1px,transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse 100% 100% at 30% 100%,black 20%,transparent 80%)",
        })} />

        {/* Radial glow behind headline */}
        <div style={s({ position: "absolute", top: 0, left: -100, width: 600, height: 500, background: "radial-gradient(ellipse at 30% 40%,rgba(197,162,74,0.05) 0%,transparent 65%)", pointerEvents: "none" })} />

        <div className="hero-grid" style={s({ position: "relative", display: "grid", gridTemplateColumns: "1fr 340px", minHeight: 480, borderRight: `1px solid ${E.bdr}` })}>

          {/* Left: headline + CTA */}
          <div style={s({ padding: "80px 52px 72px", borderRight: `1px solid ${E.bdr}`, display: "flex", flexDirection: "column", justifyContent: "flex-end" })}>

            {/* Live status */}
            <div style={s({ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 36, width: "fit-content" })}>
              <div style={s({ width: 4, height: 4, borderRadius: "50%", background: E.gold, boxShadow: "0 0 6px rgba(197,162,74,0.7)", animation: "pulse 2.5s ease-in-out infinite" })} />
              <span style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.24em", textTransform: "uppercase", color: E.muted })}>
                System live · ~5,200 equities · Updated weekly
              </span>
            </div>

            <h1 style={s({ fontFamily: E.sans, fontSize: "clamp(42px,5.5vw,68px)", fontWeight: 800, lineHeight: 1.15, color: E.text, letterSpacing: "-0.04em", marginBottom: 28 })}>
              Markets value <em style={s({ fontStyle: "italic", fontFamily: E.serif, fontWeight: 400, color: "#A05C5C", fontSize: "clamp(46px,6vw,74px)", letterSpacing: "0.01em", lineHeight: 1.15 })}>stories.</em><br />
              We value <em style={s({ fontStyle: "normal", color: "#74A95C" })}>structure.</em>
            </h1>

            <div style={s({ maxWidth: 480, marginBottom: 36 })}>
              <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.78, color: E.body, marginBottom: 14 })}>
                Most valuation frameworks assume markets price fundamentals. The structural question — whether a company's price reflects what it has actually demonstrated operationally — rarely gets asked. It should be the first question.
              </p>
              <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.78, color: E.body, marginBottom: 14 })}>
                That gap is measurable. Seventeen years of data say so.
              </p>
              <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.78, color: "#C8A862", fontWeight: 600 })}>
                We measure it.
              </p>
            </div>

            <div style={s({ display: "flex", flexWrap: "wrap", gap: 10 })}>
              <Link href="/platform" style={s({ fontFamily: E.sans, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "13px 28px", background: E.gold, color: "#060504", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 })}>
                Open Platform <ArrowRight size={14} />
              </Link>
              <Link href="/methodology" style={s({ fontFamily: E.sans, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "13px 24px", background: "transparent", color: E.muted, border: `1px solid ${E.bdr2}`, textDecoration: "none" })}>
                Read the Methodology
              </Link>
            </div>
          </div>

          {/* Right: OAL ladder — proof above the fold */}
          <div style={s({ padding: "48px 32px", background: E.bg2, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" })}>
            <div style={s({ marginBottom: 20 })}>
              <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: E.muted, marginBottom: 4 })}>Anchor depth → median return</p>
              <p style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.muted })}>289,745 obs · 2009–2026</p>
            </div>

            {OAL_DATA.map((bar, i) => (
              <HeroOALBar key={bar.code} {...bar} delay={i * 100} />
            ))}

            <div style={s({ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${E.bdr}` })}>
              <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "baseline" })}>
                <span style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.muted })}>FCF–Revenue spread</span>
                <span style={s({ fontFamily: E.mono, fontSize: 15, fontWeight: 500, color: E.pos })}>+26.6pp</span>
              </div>
              <p style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.muted, marginTop: 4 })}>Held across all market regimes tested</p>
            </div>

            {/* Ghost section number */}
            <div style={s({ position: "absolute", bottom: 16, right: 20, fontFamily: E.sans, fontSize: 80, fontWeight: 800, color: "rgba(197,162,74,0.04)", lineHeight: 1, pointerEvents: "none", userSelect: "none" })}>I</div>
          </div>
        </div>
      </div>

      {/* ── PROOF STRIP — key numbers ── */}
      <div className="stats-grid" style={s({ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: `1px solid ${E.bdr}` })}>
        {[
          { val: null, target: 289737, suffix: "", prefix: "",  label: "Historical observations",      note: "2009–2026" },
          { val: null, target: 17,     suffix: "yr",prefix: "", label: "Backtest period",               note: "3 market regimes" },
          { val: "+21%", target: 0,    suffix: "", prefix: "",  label: "Factor-adj. L/S alpha",         note: "t = +4.80" },
          { val: "~2×",  target: 0,   suffix: "", prefix: "",  label: "Very High loss rate",            note: "vs universe, all regimes" },
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

      {/* ── THREE DIMENSIONS ── */}
      <div className="axes-grid" style={s({ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderBottom: `1px solid ${E.bdr}` })}>
        {[
          {
            num: "Axis 01",
            r: "r = −0.034",
            title: "Anchor Risk",
            body: "Every company is assigned to its deepest qualifying financial anchor — FCF, Net Income, EBIT, or Revenue. The distance between that anchor and the current valuation, adjusted for anchor shallowness, is Axis 1.",
          },
          {
            num: "Axis 02",
            r: "r = −0.056",
            title: "Trajectory Risk",
            body: "A company moving toward demonstrated cash generation is shortening its narrative bridge. A company deteriorating is lengthening it — accumulating structural risk regardless of current price.",
          },
          {
            num: "Composite",
            r: "r = −0.052",
            title: "Structural Risk Score",
            body: "Equal-weight mean of both axes. Percentile rank across the full universe. Long-run static model. AUC 0.567 vs valuation alone at 0.493 (below random) for predicting severe losses.",
          },
        ].map(({ num, r, title, body }, i) => (
          <div key={num}
            style={s({ padding: "36px 32px", borderRight: i < 2 ? `1px solid ${E.bdr}` : "none", transition: "background 0.15s", cursor: "default" })}
            onMouseEnter={e => (e.currentTarget.style.background = E.gatm)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 })}>
              <span style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: E.gold, opacity: 0.7 })}>{num}</span>
              <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.muted })}>{r}</span>
            </div>
            <div style={s({ fontFamily: E.sans, fontSize: 17, fontWeight: 800, color: E.text, letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.15 })}>{title}</div>
            <div style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.78, color: E.body })}>{body}</div>
          </div>
        ))}
      </div>

      {/* ── SIGNAL SPLIT ── */}
      <div className="signal-grid" style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${E.bdr}` })}>

        {/* Left: what it is and isn't */}
        <div style={s({ padding: "48px 44px", borderRight: `1px solid ${E.bdr}` })}>
          <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: E.muted, marginBottom: 16 })}>The signal</p>
          <h2 style={s({ fontFamily: E.sans, fontSize: 24, fontWeight: 800, color: E.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16 })}>
            Not a prediction engine.<br />A structural state identifier.
          </h2>
          <p style={s({ fontFamily: E.sans, fontSize: 13.5, lineHeight: 1.8, color: E.body, marginBottom: 16 })}>
            The Very High composite bucket carries approximately 2× the severe loss rate of the full universe across all market regimes — including Expansion, which accounts for 52.7% of the sample period.
          </p>
          <p style={s({ fontFamily: E.sans, fontSize: 13.5, lineHeight: 1.8, color: E.body, marginBottom: 28 })}>
            The framework doesn't tell you what will happen. It tells you what structural condition a company is currently in. 68.5% of Very High entries do not produce severe losses in the subsequent 12 months — we disclose this prominently, not in fine print.
          </p>

          {/* Very Low vs Very High comparison */}
          <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 })}>
            {[
              { label: "Very Low composite",  med: "+10.4%", cvar: "−52.7%", below: "12.2%", color: E.pos },
              { label: "Very High composite", med: "−0.8%",  cvar: "−85.1%", below: "30.3%", color: E.neg },
            ].map(({ label, med, cvar, below, color }) => (
              <div key={label} style={s({ border: `1px solid ${E.bdr}`, background: E.bg2, padding: "16px" })}>
                <p style={s({ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: E.muted, marginBottom: 12 })}>{label}</p>
                {[["Median return", med], ["CVaR (95%)", cvar], ["< −25% rate", below]].map(([k, v]) => (
                  <div key={k} style={s({ marginBottom: 10 })}>
                    <div style={s({ fontFamily: E.mono, fontSize: 16, fontWeight: 500, color })}>{v}</div>
                    <div style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.muted, marginTop: 1 })}>{k}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right: empirical results */}
        <div style={s({ padding: "48px 44px", background: E.gatm })}>
          <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: E.muted, marginBottom: 24 })}>
            Key empirical results · 289,737 obs · 2009–2026
          </p>

          <div style={s({ display: "flex", flexDirection: "column", marginBottom: 36 })}>
            {RESULTS.map(({ metric, val, color }, i) => (
              <div key={metric} style={s({ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "11px 0", borderBottom: i < RESULTS.length - 1 ? `1px solid rgba(255,255,255,0.03)` : "none" })}>
                <span style={s({ fontFamily: E.sans, fontSize: 12.5, color: E.body, paddingRight: 12 })}>{metric}</span>
                <span style={s({ fontFamily: E.mono, fontSize: 15, fontWeight: 500, color, flexShrink: 0 })}>{val}</span>
              </div>
            ))}
          </div>

          {/* Regime bars */}
          <div>
            <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: E.muted, marginBottom: 14 })}>L/S alpha · positive in all three regimes</p>
            {[
              { name: "Expansion", note: "52.7% of months", val: "+14.5%", w: 62 },
              { name: "Neutral",   note: "17.6%",           val: "+18.0%", w: 77 },
              { name: "Stress",    note: "23.9%",           val: "+23.5%", w: 100 },
            ].map(({ name, note, val, w }) => (
              <div key={name} style={s({ display: "grid", gridTemplateColumns: "130px 1fr 56px", alignItems: "center", gap: 12, padding: "7px 0", borderBottom: `1px solid rgba(255,255,255,0.025)` })}>
                <div>
                  <span style={s({ fontFamily: E.sans, fontSize: 11.5, color: E.text, fontWeight: 600 })}>{name}</span>
                  <span style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.muted, marginLeft: 5 })}>{note}</span>
                </div>
                <div style={s({ height: 2, background: E.bdr2, position: "relative" })}>
                  <div style={s({ position: "absolute", left: 0, top: 0, height: 2, width: `${w}%`, background: E.gold })} />
                </div>
                <div style={s({ fontFamily: E.mono, fontSize: 11.5, fontWeight: 500, color: E.gold, textAlign: "right" })}>{val}</div>
              </div>
            ))}
          </div>

          <div style={s({ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${E.bdr}` })}>
            <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, lineHeight: 1.65 })}>Signal is Modest full-period (r = −0.052) and Substantive during structural stress (r = −0.145). Both numbers are honest.</p>
          </div>
        </div>
      </div>

      {/* ── THREE PRINCIPLES ── */}
      <div className="phil-grid" style={s({ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderBottom: `1px solid ${E.bdr}` })}>
        {[
          { num: "01", head: "Structure over narrative", body: "Most valuation frameworks ask how much a company is worth. We ask how well-grounded that valuation is in what the company has actually demonstrated. The gap between those questions is where structural risk accumulates." },
          { num: "02", head: "Honest about limitations", body: "68.5% of Very High classifications do not produce severe losses in 12 months. We disclose this prominently. The framework identifies structural conditions — not outcomes — and we write accordingly." },
          { num: "03", head: "No incentive distortion", body: "No advertisers. No sponsored research. No assets under management. The analysis is shaped entirely by what the data shows — not by what we are trying to sell or recommend." },
        ].map(({ num, head, body }, i) => (
          <div key={num} style={s({ padding: "36px 32px", borderRight: i < 2 ? `1px solid ${E.bdr}` : "none" })}>
            <div style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: E.gold, opacity: 0.4, marginBottom: 14 })}>{num}</div>
            <div style={s({ fontFamily: E.sans, fontSize: 16, fontWeight: 800, color: E.text, letterSpacing: "-0.02em", marginBottom: 10, lineHeight: 1.2 })}>{head}</div>
            <div style={s({ fontFamily: E.sans, fontSize: 12.5, lineHeight: 1.78, color: E.body })}>{body}</div>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="cta-grid" style={s({ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 40, padding: "56px 44px", borderBottom: `1px solid ${E.bdr}` })}>
        <div>
          <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: E.muted, marginBottom: 14 })}>Platform access</p>
          <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 800, color: E.text, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 12 })}>
            The structural map is live now.
          </h2>
          <p style={s({ fontFamily: E.sans, fontSize: 15, color: E.body, lineHeight: 1.75, maxWidth: 520 })}>
            ~5,200 U.S. equities scored across two independently validated dimensions of structural risk. Updated weekly. No narrative. No incentive distortion.
          </p>
        </div>
        <div style={s({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, flexShrink: 0 })}>
          <div style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.muted, textAlign: "right" })}>
            <span style={s({ color: E.text, fontSize: 22, fontWeight: 500 })}>$159</span>
            <span style={s({ margin: "0 6px" })}>/</span>month
            <span style={s({ color: E.dim, margin: "0 10px" })}>·</span>
            <span style={s({ color: E.text, fontSize: 22, fontWeight: 500 })}>$1,479</span>
            <span style={s({ margin: "0 6px" })}>/</span>year
          </div>
          <Link href="/platform/subscribe" style={s({ fontFamily: E.sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "14px 30px", background: E.gold, color: "#060504", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 })}>
            Subscribe to Access <ArrowRight size={14} />
          </Link>
          <Link href="/methodology" style={s({ fontFamily: E.sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "11px 22px", background: "transparent", color: E.muted, border: `1px solid ${E.bdr2}`, textDecoration: "none", textAlign: "center" })}>
            Read the Methodology First
          </Link>
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
            { label: "Who It's For", href: "/who-its-for" },
            { label: "Methodology",    href: "/methodology" },
            { label: "Where It Belongs",     href: "/where-it-belongs" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={s({ fontFamily: E.sans, fontSize: 11, color: E.muted, textDecoration: "none", padding: "8px 0", display: "inline-block" })}>{label}</Link>
          ))}
        </div>
        <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>© 2026 The Capital Steward, LLC · Not investment advice</p>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* ── Responsive breakpoints ── */

        /* Tablet: hero collapses to single column */
        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .hero-grid > div:last-child {
            border-right: none !important;
            border-top: 1px solid #272420;
          }
        }

        /* Mobile: all multi-column grids collapse */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .axes-grid,
          .signal-grid,
          .phil-grid,
          .cta-grid {
            grid-template-columns: 1fr !important;
          }
          /* Remove mid-grid right borders that become orphaned */
          .axes-grid > div,
          .signal-grid > div,
          .phil-grid > div {
            border-right: none !important;
            border-bottom: 1px solid #272420;
          }
        }

        /* Small mobile: proof strip goes single column */
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-grid > div {
            border-right: none !important;
            border-bottom: 1px solid #272420;
          }
        }

        /* Footer nav touch targets */
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