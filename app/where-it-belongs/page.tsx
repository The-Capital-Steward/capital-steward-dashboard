'use client'

// FONT: same globals.css import (Syne + IBM Plex Mono + Instrument Serif)
// File goes to: app/where-it-belongs/page.tsx

import Link from "next/link"
import { ArrowRight } from "lucide-react"

const E = {
  bg: "#0E0D0B", bg2: "#131210", bg3: "#181614",
  bdr: "#272420", bdr2: "#33302A",
  text: "#EDE9E0", body: "#A89E8E", muted: "#554E44", dim: "#3A3530",
  gold: "#C5A24A", gatm: "rgba(197,162,74,0.04)",
  pos: "#5A9870", neg: "#B85C4A", amber: "#D4952A",
  mono: "'IBM Plex Mono','Courier New',monospace",
  sans: "'Syne',system-ui,sans-serif",
  serif: "'Instrument Serif',Georgia,serif",
}

const s = (x: object) => x as React.CSSProperties

const Ey = ({ c }: { c: string }) => (
  <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.gold, marginBottom: 10 })}>{c}</p>
)

const SH = ({ ch }: { ch: React.ReactNode }) => (
  <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 800, lineHeight: 1.15, color: E.text, letterSpacing: "-0.03em", marginBottom: 18 })}>{ch}</h2>
)

const B = ({ ch }: { ch: React.ReactNode }) => (
  <p style={s({ fontFamily: E.sans, fontSize: 13.5, lineHeight: 1.82, color: E.body, marginBottom: 14 })}>{ch}</p>
)

const Div = () => (
  <div style={s({ height: 1, background: E.bdr, margin: "0" })} />
)

export default function HowToUseOSMR() {
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
            <Link key={href} href={href} style={s({ fontFamily: E.sans, fontSize: 10.5, fontWeight: 600, color: href === "/where-it-belongs" ? E.gold : E.muted, padding: "0 16px", borderLeft: `1px solid ${E.bdr}`, textDecoration: "none", height: 52, display: "flex", alignItems: "center" })}>
              {label}
            </Link>
          ))}
          <Link href="/platform" style={s({ fontFamily: E.sans, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "8px 20px", background: E.gold, color: "#060504", textDecoration: "none", marginLeft: 20 })}>
            Platform
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr}`, padding: "72px 44px 64px" })}>
        <div style={s({ maxWidth: 760 })}>
          <Ey c="Where It Belongs" />
          <h1 style={s({ fontFamily: E.sans, fontSize: "clamp(36px,5vw,56px)", fontWeight: 800, lineHeight: 1.0, color: E.text, letterSpacing: "-0.04em", marginBottom: 24 })}>
            A governance layer for<br />
            <em style={s({ fontStyle: "italic", fontFamily: E.serif, fontWeight: 400, color: E.gold, fontSize: "clamp(40px,5.5vw,60px)", letterSpacing: "-0.02em" })}>what you already do.</em>
          </h1>
          <p style={s({ fontFamily: E.sans, fontSize: 15, lineHeight: 1.8, color: E.body, maxWidth: 580, marginBottom: 12 })}>
            This framework is not a replacement for fundamental analysis. It is a structural pre-screening layer — a way of knowing, before you look closely at anything, whether the universe you're examining is worth examining.
          </p>
          <p style={s({ fontFamily: E.sans, fontSize: 15, lineHeight: 1.8, color: E.body, maxWidth: 580 })}>
            What it produces is not a recommendation. It is structural context — and serious investors have always made better decisions with more of it.
          </p>
        </div>
      </div>

      {/* ── SECTION I: WHERE IT FITS ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr}` })}>
        <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr" })}>

          {/* Left */}
          <div style={s({ padding: "52px 44px", borderRight: `1px solid ${E.bdr}` })}>
            <Ey c="Section I" />
            <SH ch="Where it fits in an existing process." />
            <B ch="Most investment processes already have a research workflow. You identify candidates, you analyze them, you size positions, you monitor them. OSMR doesn't replace any of those steps — it sits upstream of all of them." />
            <B ch="Think of it as the structural map you consult before you decide where to look. The universe of ~5,200 scored equities tells you, at a glance, where the structural conditions are favorable and where they're not. That's worth knowing before you spend time on company-specific research." />
            <B ch="An investor who enters a Very High structural risk position isn't necessarily wrong. They may have specific insight into why the narrative will hold. But they should enter with open eyes — knowing that the empirical base rate for severe losses in that zone is approximately 2× the universe average." />

            {/* Process diagram */}
            <div style={s({ marginTop: 28, border: `1px solid ${E.bdr}`, background: E.bg2 })}>
              <div style={s({ padding: "12px 16px", borderBottom: `1px solid ${E.bdr}` })}>
                <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted })}>Where OSMR enters the process</p>
              </div>
              {[
                { step: "01", label: "Structural screening", desc: "Use the market map to identify zones worth examining. Filter by composite bucket and OAL rung.", highlight: true },
                { step: "02", label: "Company-specific research", desc: "Your existing analytical process. OSMR provides structural context, not a substitute.", highlight: false },
                { step: "03", label: "Structural validation", desc: "Before entry: check the company's cohort. Understand the historical return distribution in that zone.", highlight: true },
                { step: "04", label: "Position sizing", desc: "Let structural context inform exposure. Not a sizing rule — context for an honest sizing decision.", highlight: false },
                { step: "05", label: "Ongoing monitoring", desc: "Watch trajectory. A deteriorating anchor is structural information that belongs in any review.", highlight: true },
              ].map(({ step, label, desc, highlight }) => (
                <div key={step} style={s({ display: "flex", gap: 16, padding: "14px 16px", borderBottom: `1px solid rgba(255,255,255,0.025)`, background: highlight ? E.gatm : "transparent" })}>
                  <div style={s({ fontFamily: E.mono, fontSize: 9, color: highlight ? E.gold : E.dim, opacity: 0.8, flexShrink: 0, marginTop: 1 })}>{step}</div>
                  <div>
                    <div style={s({ fontFamily: E.sans, fontSize: 12.5, fontWeight: 700, color: highlight ? E.text : E.muted, marginBottom: 3 })}>{label}</div>
                    <div style={s({ fontFamily: E.sans, fontSize: 12, lineHeight: 1.65, color: E.muted })}>{desc}</div>
                  </div>
                  {highlight && <div style={s({ marginLeft: "auto", flexShrink: 0, fontFamily: E.mono, fontSize: 8.5, color: E.gold, opacity: 0.6, alignSelf: "center" })}>OSMR</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div style={s({ padding: "52px 44px" })}>
            <Ey c="The three uses" />
            <SH ch="Screen. Validate. Monitor." />

            <div style={s({ display: "flex", flexDirection: "column", gap: 2, marginBottom: 32 })}>
              {[
                {
                  num: "01",
                  title: "Screen",
                  body: "The structural market map gives you a cross-sectional view of where structural risk is concentrated and where it's absent across the full U.S. equity universe. Filter by composite bucket or OAL rung to identify the zones worth your research time.",
                  detail: "290K+ observations · updated weekly",
                },
                {
                  num: "02",
                  title: "Validate",
                  body: "Before entering a position, check the company's structural profile against its cohort history. What has happened to companies in the same structural zone over a 12-month forward horizon? That record is part of the information a serious investor considers.",
                  detail: "Cohort grids by structural zone",
                },
                {
                  num: "03",
                  title: "Monitor",
                  body: "Structural risk is not static. A company's anchor trajectory can deteriorate between entries and exits. Weekly score updates make that trajectory visible before it becomes consensus. Monthly recalibrations rebuild the full structural picture.",
                  detail: "Weekly snapshots · monthly recalibration",
                },
              ].map(({ num, title, body, detail }) => (
                <div key={num} style={s({ border: `1px solid ${E.bdr}`, background: E.bg2, padding: "20px" })}>
                  <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 })}>
                    <div style={s({ display: "flex", gap: 12, alignItems: "baseline" })}>
                      <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.gold, opacity: 0.6, letterSpacing: "0.1em" })}>{num}</span>
                      <span style={s({ fontFamily: E.sans, fontSize: 15, fontWeight: 800, color: E.text, letterSpacing: "-0.02em" })}>{title}</span>
                    </div>
                    <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.muted })}>{detail}</span>
                  </div>
                  <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.75, color: E.body })}>{body}</p>
                </div>
              ))}
            </div>

            {/* Honest caveat */}
            <div style={s({ border: `1px solid ${E.bdr2}`, background: E.gatm, padding: "18px 20px" })}>
              <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 8 })}>What this is not</p>
              <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                {[
                  "Not a buy or sell signal system",
                  "Not a replacement for fundamental analysis",
                  "Not a timing tool — it identifies structural conditions, not when they resolve",
                  "Not a guarantee — 68.5% of Very High entries do not produce severe losses in 12 months",
                ].map(item => (
                  <div key={item} style={s({ display: "flex", gap: 10, alignItems: "baseline" })}>
                    <div style={s({ width: 4, height: 4, borderRadius: "50%", background: E.muted, flexShrink: 0, marginTop: 6 })} />
                    <span style={s({ fontFamily: E.sans, fontSize: 12.5, color: E.body, lineHeight: 1.6 })}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION II: READING THE SIGNAL ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr}`, background: E.bg2 })}>
        <div style={s({ padding: "52px 44px 0" })}>
          <Ey c="Section II" />
          <SH ch="Reading the structural signal." />
          <p style={s({ fontFamily: E.sans, fontSize: 14, lineHeight: 1.8, color: E.body, maxWidth: 620, marginBottom: 36 })}>
            Each composite bucket describes a structural condition — not a predicted outcome. Here is what each state tells you structurally, and what it explicitly does not tell you.
          </p>
        </div>

        {/* Signal states table */}
        <div style={s({ borderTop: `1px solid ${E.bdr}` })}>

          {/* Header */}
          <div style={s({ display: "grid", gridTemplateColumns: "140px 1fr 1fr", borderBottom: `1px solid ${E.bdr}`, background: E.bg3 })}>
            {["State", "What it tells you structurally", "What it does not tell you"].map((h, i) => (
              <div key={h} style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, padding: "10px 20px", borderRight: i < 2 ? `1px solid ${E.bdr}` : "none" })}>{h}</div>
            ))}
          </div>

          {[
            {
              state: "Very High",
              color: E.neg,
              tells: "Valuation is extended far beyond demonstrated output. The anchor is shallow or deteriorating. The empirical base rate for severe loss (>−25% over 12 months) is approximately 2× the universe average across all market regimes.",
              doesnt: "That a loss is imminent, or that the company is a bad business. 68.5% of Very High entries do not produce severe losses in 12 months. The narrative sustaining the valuation may hold for an extended period.",
              bg: "rgba(184,92,74,0.03)",
            },
            {
              state: "High",
              color: "#A05050",
              tells: "Above-average structural risk. The anchor is shallower than the universe median, or the trajectory is showing early deterioration. Worth monitoring closely if held.",
              doesnt: "That the company is overvalued by conventional measures, or that it cannot perform. Many High-rated companies produce positive returns.",
              bg: "transparent",
            },
            {
              state: "Moderate",
              color: E.muted,
              tells: "Population center. No strong structural signal in either direction. The company is neither unusually well-anchored nor unusually narrative-dependent.",
              doesnt: "That the company is safe. Moderate companies can deteriorate rapidly if anchor metrics weaken in the next earnings cycle.",
              bg: "transparent",
            },
            {
              state: "Low",
              color: "#3E6B4F",
              tells: "Below-average structural risk. The anchor is deeper than the universe median, and the trajectory is stable or improving. Favorable structural conditions for further research.",
              doesnt: "That the company will outperform. Low structural risk is not a return guarantee — many factors outside the framework's scope determine returns.",
              bg: "transparent",
            },
            {
              state: "Very Low",
              color: E.pos,
              tells: "Deep anchor, improving trajectory. Median 12-month return in this bucket is +10.4%. Hit rate 62.4%. CVaR −52.7% vs −85.1% for Very High. Favorable conditions on every structural dimension the framework measures.",
              doesnt: "That every Very Low company is a buy. 37.6% of Very Low entries still produced negative 12-month returns. The framework identifies structural conditions — the rest is yours to determine.",
              bg: "rgba(90,152,112,0.03)",
            },
          ].map(({ state, color, tells, doesnt, bg }, i) => (
            <div key={state} style={s({ display: "grid", gridTemplateColumns: "140px 1fr 1fr", borderBottom: i < 4 ? `1px solid ${E.bdr}` : "none", background: bg })}>
              <div style={s({ padding: "20px", borderRight: `1px solid ${E.bdr}`, display: "flex", alignItems: "flex-start", gap: 10 })}>
                <div style={s({ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 5 })} />
                <span style={s({ fontFamily: E.sans, fontSize: 13, fontWeight: 700, color: E.text })}>{state}</span>
              </div>
              <div style={s({ padding: "20px", borderRight: `1px solid ${E.bdr}` })}>
                <p style={s({ fontFamily: E.sans, fontSize: 12.5, lineHeight: 1.72, color: E.body })}>{tells}</p>
              </div>
              <div style={s({ padding: "20px" })}>
                <p style={s({ fontFamily: E.sans, fontSize: 12.5, lineHeight: 1.72, color: E.muted })}>{doesnt}</p>
              </div>
            </div>
          ))}
        </div>

        {/* OAL note */}
        <div style={s({ padding: "24px 44px", borderTop: `1px solid ${E.bdr}` })}>
          <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, lineHeight: 1.65 })}>
            OAL assignment matters independently of the composite score.
            A Revenue-anchored company in Very Low composite is still more narrative-dependent than an FCF-anchored company at the same score.
            The OAL rung tells you what the company has demonstrated. The composite score tells you how that demonstration compares to its current valuation and trajectory.
          </p>
        </div>
      </div>

      {/* ── SECTION III: CADENCE ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr}` })}>
        <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr" })}>

          <div style={s({ padding: "52px 44px", borderRight: `1px solid ${E.bdr}` })}>
            <Ey c="Section III" />
            <SH ch="A suggested review cadence." />
            <B ch="This is not a mechanical decision rule. It is the kind of review structure that makes the framework useful in practice — the questions worth asking at each stage of the process." />
            <B ch="The framework updates weekly for price-sensitive components and monthly for the full structural pipeline. A review cadence that matches that update frequency gets the most out of the signal." />

            <div style={s({ marginTop: 4, display: "flex", flexDirection: "column", gap: 2 })}>
              {[
                {
                  when: "Before entry",
                  questions: [
                    "What composite bucket does this company occupy?",
                    "What is its OAL rung — what has it actually demonstrated?",
                    "Is the trajectory improving or deteriorating?",
                    "What does the cohort return history look like in this structural zone?",
                  ],
                },
                {
                  when: "Weekly",
                  questions: [
                    "Have any positions under consideration moved to a higher structural risk zone?",
                    "Is the trajectory of held positions stable?",
                  ],
                },
                {
                  when: "Monthly",
                  questions: [
                    "Has the composite score of any held position shifted materially from entry?",
                    "Has any position's OAL rung changed — meaning its demonstrated anchor has improved or weakened?",
                    "Are there new entrants to the Very Low bucket worth examining?",
                  ],
                },
                {
                  when: "After deterioration",
                  questions: [
                    "When a held position's anchor trajectory weakens, what does the updated structural profile show?",
                    "How does the current structural context compare to the context at entry?",
                    "What does the cohort history say about companies in this zone?",
                  ],
                },
              ].map(({ when, questions }) => (
                <div key={when} style={s({ border: `1px solid ${E.bdr}`, background: E.bg2 })}>
                  <div style={s({ padding: "12px 16px", borderBottom: `1px solid ${E.bdr}`, display: "flex", alignItems: "center", gap: 10 })}>
                    <span style={s({ fontFamily: E.mono, fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: E.gold, background: "rgba(197,162,74,0.08)", border: "1px solid rgba(197,162,74,0.18)", padding: "2px 8px" })}>{when}</span>
                  </div>
                  <div style={s({ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 })}>
                    {questions.map(q => (
                      <div key={q} style={s({ display: "flex", gap: 10, alignItems: "baseline" })}>
                        <div style={s({ fontFamily: E.mono, fontSize: 10, color: E.muted, flexShrink: 0 })}>—</div>
                        <span style={s({ fontFamily: E.sans, fontSize: 12.5, lineHeight: 1.65, color: E.body })}>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, lineHeight: 1.65, marginTop: 16 })}>
              No exit thresholds or position triggers are embedded in the framework.
              Those decisions depend on mandate, time horizon, and context the framework cannot observe.
            </p>
          </div>

          {/* Right: trajectory note + what serious investors do */}
          <div style={s({ padding: "52px 44px" })}>
            <Ey c="On trajectory" />
            <SH ch="Trajectory is often more important than position." />
            <B ch="A company in High structural risk with an improving trajectory — moving toward FCF generation from an EBIT anchor — is accumulating structural strength. The composite score will reflect that improvement over time, before the market necessarily does." />
            <B ch="A company in Low structural risk with a deteriorating trajectory is a different situation than its composite score alone suggests. The score reflects where it is. The trajectory reflects where it's going." />
            <B ch="This is why the two-axis design matters. Axis 1 and Axis 2 are not redundant — they are measuring two different dimensions of the same structural condition, and they can point in different directions." />

            <div style={s({ marginTop: 28, border: `1px solid ${E.bdr}`, background: E.bg2 })}>
              <div style={s({ padding: "12px 16px", borderBottom: `1px solid ${E.bdr}` })}>
                <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted })}>Four structural conditions worth distinguishing</p>
              </div>
              {[
                { label: "Deep anchor · improving trajectory",    desc: "The best structural condition. Worth examining regardless of current score.", tag: "Favorable" },
                { label: "Deep anchor · deteriorating trajectory",desc: "A potential early warning. The score may still look good; the trend does not.", tag: "Watch" },
                { label: "Shallow anchor · improving trajectory", desc: "Moving in the right direction. The narrative load is decreasing.", tag: "Improving" },
                { label: "Shallow anchor · deteriorating trajectory", desc: "The highest-risk structural condition the framework identifies.", tag: "Elevated" },
              ].map(({ label, desc, tag }) => (
                <div key={label} style={s({ padding: "14px 16px", borderBottom: `1px solid rgba(255,255,255,0.025)`, display: "flex", justifyContent: "space-between", gap: 16 })}>
                  <div>
                    <div style={s({ fontFamily: E.sans, fontSize: 12.5, fontWeight: 700, color: E.text, marginBottom: 4 })}>{label}</div>
                    <div style={s({ fontFamily: E.sans, fontSize: 12, lineHeight: 1.6, color: E.muted })}>{desc}</div>
                  </div>
                  <div style={s({
                    fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase" as const,
                    color: tag === "Favorable" ? E.pos : tag === "Elevated" ? E.neg : tag === "Improving" ? E.gold : E.amber,
                    flexShrink: 0, alignSelf: "flex-start", marginTop: 2,
                  })}>{tag}</div>
                </div>
              ))}
            </div>

            <div style={s({ marginTop: 28 })}>
              <Ey c="On the false positive rate" />
              <div style={s({ border: `1px solid ${E.bdr2}`, background: E.gatm, padding: "18px 20px" })}>
                <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.75, color: E.body, marginBottom: 10 })}>
                  68.5% of Very High classifications do not produce severe losses in the subsequent 12 months. This is not a flaw in the framework — it is the correct way to understand it.
                </p>
                <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.75, color: E.body })}>
                  The framework identifies a structural condition associated with elevated loss probability. It does not predict which companies in that condition will experience a loss, or when. The base rate is the information. What an investor does with it is theirs to determine.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── CTA ── */}
      <div style={s({ padding: "64px 44px", borderBottom: `1px solid ${E.bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 40 })}>
        <div style={s({ maxWidth: 520 })}>
          <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 14 })}>Platform access</p>
          <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(22px,3vw,32px)", fontWeight: 800, color: E.text, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 12 })}>
            The structural map is live now.
          </h2>
          <p style={s({ fontFamily: E.sans, fontSize: 14, color: E.body, lineHeight: 1.75 })}>
            ~5,200 U.S. equities scored across two independently validated dimensions of structural risk. Updated weekly. What's described on this page is accessible now.
          </p>
        </div>
        <div style={s({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 })}>
          <div style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.muted, textAlign: "right" })}>
            <span style={s({ color: E.text, fontSize: 20, fontWeight: 500 })}>$159</span> / month
            <span style={s({ color: E.dim, margin: "0 8px" })}>·</span>
            <span style={s({ color: E.text, fontSize: 20, fontWeight: 500 })}>$1,479</span> / year
          </div>
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
        <Link href="/" style={s({ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase" as const, color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15, color: E.gold, marginLeft: 6 })}>Steward</span>
        </Link>
        <div style={s({ display: "flex", gap: 20 })}>
          {[
            { label: "Who It's For", href: "/who-its-for" },
            { label: "Methodology",    href: "/osmr-methodology" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={s({ fontFamily: E.sans, fontSize: 11, color: E.muted, textDecoration: "none" })}>{label}</Link>
          ))}
        </div>
        <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>© 2026 The Capital Steward, LLC · Not investment advice</p>
      </div>

    </main>
  )
}