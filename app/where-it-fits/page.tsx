'use client'

// P3 palette · DM Sans · AAA corrected · File → app/where-it-fits/page.tsx

import Link from "next/link"
import { ArrowRight } from "lucide-react"

const E = {
  bg:    "#D7DDD3",
  bg2:   "#CBD2C7",
  bg3:   "#C4CCC0",
  bdr:   "#B7C1B4",
  bdr2:  "#A8B4A5",
  text:  "#313A34", // 8.50:1 AAA
  body:  "#3F4640", // 7.02:1 AAA
  muted: "#40463F", // 6.27:1 AA-large
  dim:   "#41453F", // 7.06:1 AAA
  gold:  "#715E37", // 4.52:1 AA-large display only
  gatm:  "rgba(56,72,61,0.06)",
  pos:   "#38483D", // 7.02:1 AAA
  neg:   "#633838", // 7.05:1 AAA
  brick: "#633838",
  sage:  "#38483D",
  amber: "#6B4F2A", // darkened for contrast
  mono:  "'IBM Plex Mono','Courier New',monospace",
  sans:  "'DM Sans',system-ui,sans-serif",
  serif: "'Playfair Display',Georgia,serif",
}

const s = (x: object) => x as React.CSSProperties

const Ey = ({ c }: { c: string }) => (
  <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 10 })}>{c}</p>
)

const SH = ({ ch }: { ch: React.ReactNode }) => (
  <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 800, lineHeight: 1.15, color: E.text, letterSpacing: "-0.02em", marginBottom: 18 })}>{ch}</h2>
)

const B = ({ ch }: { ch: React.ReactNode }) => (
  <p style={s({ fontFamily: E.sans, fontSize: 14, lineHeight: 1.85, color: E.body, marginBottom: 16 })}>{ch}</p>
)

export default function WhereItBelongs() {
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
            { label: "Who It's For",     href: "/who-its-for" },
            { label: "Methodology",      href: "/methodology" },
            { label: "Where It Fits", href: "/where-it-fits" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={s({
              fontFamily: E.sans, fontSize: 10.5, fontWeight: 600,
              color: href === "/where-it-fits" ? E.text : E.muted,
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
      <div style={s({ borderBottom: `1px solid ${E.bdr}`, padding: "72px 44px 64px" })}>
        <div style={s({ maxWidth: 760 })}>
          <Ey c="Where It Fits" />
          <h1 style={s({ fontFamily: E.sans, fontSize: "clamp(36px,5vw,56px)", fontWeight: 800, lineHeight: 1.05, color: E.text, letterSpacing: "-0.03em", marginBottom: 24 })}>
            A governance layer for
            <em style={s({ fontStyle: "italic", fontFamily: E.serif, fontWeight: 400, color: E.brick, fontSize: "clamp(40px,5.5vw,60px)", letterSpacing: "-0.01em" })}> what you already do.</em>
          </h1>
          <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.8, color: E.body, maxWidth: 580, marginBottom: 14 })}>
            This framework is not a replacement for fundamental analysis. It is a structural pre-screening layer — a way of knowing, before you look closely at anything, whether the universe you&apos;re examining is worth examining.
          </p>
          <p style={s({ fontFamily: E.sans, fontSize: 15.5, lineHeight: 1.8, color: E.body, maxWidth: 580 })}>
            What it produces is not a recommendation. It is structural context — and serious investors have always made better decisions with more of it.
          </p>
        </div>
      </div>

      {/* ── SECTION I ── */}
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
                <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted })}>Where OSMR enters the process</p>
              </div>
              {[
                { step: "01", label: "Structural screening",    desc: "Use the market map to identify zones worth examining. Filter by composite bucket and OAL rung.", highlight: true },
                { step: "02", label: "Company-specific research",desc: "Your existing analytical process. OSMR provides structural context, not a substitute.", highlight: false },
                { step: "03", label: "Structural validation",   desc: "Before entry: check the company's cohort. Understand the historical return distribution in that zone.", highlight: true },
                { step: "04", label: "Position sizing",         desc: "Let structural context inform exposure. Not a sizing rule — context for an honest sizing decision.", highlight: false },
                { step: "05", label: "Ongoing monitoring",      desc: "Watch trajectory. A deteriorating anchor is structural information that belongs in any review.", highlight: true },
              ].map(({ step, label, desc, highlight }) => (
                <div key={step} style={s({ display: "flex", gap: 16, padding: "14px 16px", borderBottom: `1px solid ${E.bdr}`, background: highlight ? E.gatm : "transparent" })}>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, color: highlight ? E.dim : E.muted, flexShrink: 0, marginTop: 1 })}>{step}</div>
                  <div style={s({ flex: 1 })}>
                    <div style={s({ fontFamily: E.sans, fontSize: 12.5, fontWeight: 700, color: E.text, marginBottom: 3 })}>{label}</div>
                    <div style={s({ fontFamily: E.sans, fontSize: 12, lineHeight: 1.65, color: E.body })}>{desc}</div>
                  </div>
                  {highlight && (
                    <div style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.muted, flexShrink: 0, alignSelf: "center" })}>OSMR</div>
                  )}
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
                  num: "01", title: "Screen",
                  body: "The structural market map gives you a cross-sectional view of where structural risk is concentrated and where it's absent across the full U.S. equity universe. Filter by composite bucket or OAL rung to identify the zones worth your research time.",
                  detail: "289,737 observations · updated weekly",
                },
                {
                  num: "02", title: "Validate",
                  body: "Before entering a position, check the company's structural profile against its cohort history. What has happened to companies in the same structural zone over a 12-month forward horizon? That record is part of the information a serious investor considers.",
                  detail: "Cohort grids by structural zone",
                },
                {
                  num: "03", title: "Monitor",
                  body: "Structural risk is not static. A company's anchor trajectory can deteriorate between entries and exits. Weekly score updates make that trajectory visible before it becomes consensus. Monthly recalibrations rebuild the full structural picture.",
                  detail: "Weekly snapshots · monthly recalibration",
                },
              ].map(({ num, title, body, detail }) => (
                <div key={num} style={s({ border: `1px solid ${E.bdr}`, background: E.bg2, padding: "20px" })}>
                  <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 })}>
                    <div style={s({ display: "flex", gap: 12, alignItems: "baseline" })}>
                      <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.muted, letterSpacing: "0.1em" })}>{num}</span>
                      <span style={s({ fontFamily: E.sans, fontSize: 15, fontWeight: 800, color: E.text, letterSpacing: "-0.02em" })}>{title}</span>
                    </div>
                    <span style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.muted })}>{detail}</span>
                  </div>
                  <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.75, color: E.body })}>{body}</p>
                </div>
              ))}
            </div>

            {/* Honest caveat */}
            <div style={s({ border: `1px solid ${E.bdr}`, background: E.gatm, padding: "18px 20px" })}>
              <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 10 })}>What this is not</p>
              <div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>
                {[
                  "Not a buy or sell signal system",
                  "Not a replacement for fundamental analysis",
                  "Not a timing tool — it identifies structural conditions, not when they resolve",
                  "Not a guarantee — 68.5% of Very High entries do not produce severe losses in 12 months",
                ].map(item => (
                  <div key={item} style={s({ display: "flex", gap: 10, alignItems: "baseline" })}>
                    <div style={s({ fontFamily: E.mono, fontSize: 10, color: E.muted, flexShrink: 0 })}>—</div>
                    <span style={s({ fontFamily: E.sans, fontSize: 12.5, color: E.body, lineHeight: 1.65 })}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION II ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr}`, background: E.bg2 })}>
        <div style={s({ padding: "52px 44px 0" })}>
          <Ey c="Section II" />
          <SH ch="Reading the structural signal." />
          <p style={s({ fontFamily: E.sans, fontSize: 14.5, lineHeight: 1.8, color: E.body, maxWidth: 620, marginBottom: 36 })}>
            Each composite bucket describes a structural condition — not a predicted outcome. Here is what each state tells you structurally, and what it explicitly does not tell you.
          </p>
        </div>

        {/* Signal states table */}
        <div style={s({ borderTop: `1px solid ${E.bdr}` })}>

          {/* Header */}
          <div style={s({ display: "grid", gridTemplateColumns: "140px 1fr 1fr", borderBottom: `1px solid ${E.bdr}`, background: E.bg3 })}>
            {["State", "What it tells you structurally", "What it does not tell you"].map((h, i) => (
              <div key={h} style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, padding: "10px 20px", borderRight: i < 2 ? `1px solid ${E.bdr}` : "none" })}>{h}</div>
            ))}
          </div>

          {[
            {
              state: "Very High", color: E.neg,
              tells: "Valuation is extended far beyond demonstrated output. The anchor is shallow or deteriorating. The empirical base rate for severe loss (>−25% over 12 months) is approximately 2× the universe average across all market regimes.",
              doesnt: "That a loss is imminent, or that the company is a bad business. 68.5% of Very High entries do not produce severe losses in 12 months. The narrative sustaining the valuation may hold for an extended period.",
              bg: "rgba(99,56,56,0.04)",
            },
            {
              state: "High", color: "#7A4848",
              tells: "Above-average structural risk. The anchor is shallower than the universe median, or the trajectory is showing early deterioration. Worth monitoring closely if held.",
              doesnt: "That the company is overvalued by conventional measures, or that it cannot perform. Many High-rated companies produce positive returns.",
              bg: "transparent",
            },
            {
              state: "Moderate", color: E.muted,
              tells: "Population center. No strong structural signal in either direction. The company is neither unusually well-anchored nor unusually narrative-dependent.",
              doesnt: "That the company is safe. Moderate companies can deteriorate rapidly if anchor metrics weaken in the next earnings cycle.",
              bg: "transparent",
            },
            {
              state: "Low", color: "#456050",
              tells: "Below-average structural risk. The anchor is deeper than the universe median, and the trajectory is stable or improving. Favorable structural conditions for further research.",
              doesnt: "That the company will outperform. Low structural risk is not a return guarantee — many factors outside the framework's scope determine returns.",
              bg: "transparent",
            },
            {
              state: "Very Low", color: E.sage,
              tells: "Deep anchor, improving trajectory. Median 12-month return in this bucket is +10.4%. Hit rate 62.4%. CVaR −52.7% vs −85.1% for Very High. Favorable conditions on every structural dimension the framework measures.",
              doesnt: "That every Very Low company is a buy. 37.6% of Very Low entries still produced negative 12-month returns. The framework identifies structural conditions — the rest is yours to determine.",
              bg: "rgba(56,72,61,0.04)",
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
                <p style={s({ fontFamily: E.sans, fontSize: 12.5, lineHeight: 1.72, color: E.body })}>{doesnt}</p>
              </div>
            </div>
          ))}
        </div>

        {/* OAL note */}
        <div style={s({ padding: "24px 44px", borderTop: `1px solid ${E.bdr}` })}>
          <p style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, lineHeight: 1.65 })}>
            OAL assignment matters independently of the composite score.
            A Revenue-anchored company in Very Low composite is still more narrative-dependent than an FCF-anchored company at the same score.
            The OAL rung tells you what the company has demonstrated. The composite score tells you how that demonstration compares to its current valuation and trajectory.
          </p>
        </div>
      </div>

      {/* ── SECTION III ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr}` })}>
        <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr" })}>

          {/* Left */}
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
                <div key={when} style={s({ border: `1px solid ${E.bdr}`, background: E.bg2, marginBottom: 2 })}>
                  <div style={s({ padding: "10px 16px", borderBottom: `1px solid ${E.bdr}`, display: "flex", alignItems: "center" })}>
                    <span style={s({
                      fontFamily: E.mono, fontSize: 10.5, fontWeight: 500,
                      letterSpacing: "0.12em", textTransform: "uppercase" as const,
                      color: E.text, background: E.bg3,
                      border: `1px solid ${E.bdr}`, padding: "2px 8px",
                    })}>{when}</span>
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

            <p style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, lineHeight: 1.65, marginTop: 16 })}>
              No exit thresholds or position triggers are embedded in the framework.
              Those decisions depend on mandate, time horizon, and context the framework cannot observe.
            </p>
          </div>

          {/* Right */}
          <div style={s({ padding: "52px 44px" })}>
            <Ey c="On trajectory" />
            <SH ch="Trajectory is often more important than position." />
            <B ch="A company in High structural risk with an improving trajectory — moving toward FCF generation from an EBIT anchor — is accumulating structural strength. The composite score will reflect that improvement over time, before the market necessarily does." />
            <B ch="A company in Low structural risk with a deteriorating trajectory is a different situation than its composite score alone suggests. The score reflects where it is. The trajectory reflects where it's going." />
            <B ch="This is why the two-axis design matters. Axis 1 and Axis 2 are not redundant — they are measuring two different dimensions of the same structural condition, and they can point in different directions." />

            <div style={s({ marginTop: 28, border: `1px solid ${E.bdr}`, background: E.bg2 })}>
              <div style={s({ padding: "12px 16px", borderBottom: `1px solid ${E.bdr}` })}>
                <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted })}>Four structural conditions worth distinguishing</p>
              </div>
              {[
                { label: "Deep anchor · improving trajectory",       desc: "The best structural condition. Worth examining regardless of current score.",          tag: "Favorable", tagColor: E.sage },
                { label: "Deep anchor · deteriorating trajectory",   desc: "A potential early warning. The score may still look good; the trend does not.",        tag: "Watch",     tagColor: E.amber },
                { label: "Shallow anchor · improving trajectory",    desc: "Moving in the right direction. The narrative load is decreasing.",                     tag: "Improving", tagColor: E.pos },
                { label: "Shallow anchor · deteriorating trajectory",desc: "The highest-risk structural condition the framework identifies.",                       tag: "Elevated",  tagColor: E.neg },
              ].map(({ label, desc, tag, tagColor }, i) => (
                <div key={label} style={s({ padding: "14px 16px", borderBottom: i < 3 ? `1px solid ${E.bdr}` : "none", display: "flex", justifyContent: "space-between", gap: 16 })}>
                  <div>
                    <div style={s({ fontFamily: E.sans, fontSize: 12.5, fontWeight: 700, color: E.text, marginBottom: 4 })}>{label}</div>
                    <div style={s({ fontFamily: E.sans, fontSize: 12, lineHeight: 1.6, color: E.body })}>{desc}</div>
                  </div>
                  <div style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: tagColor, flexShrink: 0, alignSelf: "flex-start", marginTop: 2 })}>{tag}</div>
                </div>
              ))}
            </div>

            <div style={s({ marginTop: 28 })}>
              <Ey c="On the false positive rate" />
              <div style={s({ border: `1px solid ${E.bdr}`, background: E.gatm, padding: "18px 20px" })}>
                <p style={s({ fontFamily: E.sans, fontSize: 13.5, lineHeight: 1.78, color: E.body, marginBottom: 12 })}>
                  68.5% of Very High classifications do not produce severe losses in the subsequent 12 months. This is not a flaw in the framework — it is the correct way to understand it.
                </p>
                <p style={s({ fontFamily: E.sans, fontSize: 13.5, lineHeight: 1.78, color: E.body })}>
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
          <p style={s({ fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 14 })}>Platform access</p>
          <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(22px,3vw,32px)", fontWeight: 800, color: E.text, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 })}>
            The structural map is live now.
          </h2>
          <p style={s({ fontFamily: E.sans, fontSize: 14.5, color: E.body, lineHeight: 1.75 })}>
            ~5,200 U.S. equities scored across two independently validated dimensions of structural risk. Updated weekly. What&apos;s described on this page is accessible now.
          </p>
        </div>
        <div style={s({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 })}>
          <div style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.body, textAlign: "right" as const })}>
            <span style={s({ color: E.text, fontSize: 20, fontWeight: 500 })}>$159</span> / month
            <span style={s({ color: E.muted, margin: "0 8px" })}>·</span>
            <span style={s({ color: E.text, fontSize: 20, fontWeight: 500 })}>$1,479</span> / year
          </div>
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
            Read the Methodology
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={s({ padding: "28px 44px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 })}>
        <Link href="/" style={s({ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase" as const, color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15, color: E.text, marginLeft: 6 })}>Steward</span>
        </Link>
        <div style={s({ display: "flex", gap: 20 })}>
          {[
            { label: "Who It's For", href: "/who-its-for" },
            { label: "Methodology",  href: "/methodology" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={s({ fontFamily: E.sans, fontSize: 11, color: E.muted, textDecoration: "none" })}>{label}</Link>
          ))}
        </div>
        <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>© 2026 The Capital Steward, LLC · Not investment advice</p>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .wib-grid { grid-template-columns: 1fr !important; }
          .wib-grid > div:first-child { border-right: none !important; border-bottom: 1px solid ${E.bdr}; }
          .wib-table { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .wib-cta { flex-direction: column !important; align-items: flex-start !important; }
          .wib-cta > div:last-child { align-items: flex-start !important; }
        }
      `}</style>

    </main>
  )
}