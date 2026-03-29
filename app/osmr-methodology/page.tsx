'use client'

// FONT SETUP — add to app/globals.css BEFORE all other styles:
// @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap');

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, ResponsiveContainer } from "recharts"

const REGIME_DATA = [
  { regime: "Pre-2020\n2009–2019", r: -0.0013, label: "Negligible",  color: "#3A3530" },
  { regime: "COVID\n2020–2021",    r: -0.1454, label: "Substantive", color: "#5A9870" },
  { regime: "Post-COVID\n2022–26", r: -0.0913, label: "Substantive", color: "#5A9870" },
  { regime: "Full Period\n2009–26", r: -0.0518, label: "Modest",     color: "#C5A24A" },
]
const OAL_RETURN_DATA = [
  { rung: "FCF",     median: 9.8,   color: "#5A9870" },
  { rung: "NI",      median: 4.0,   color: "#4A7AA8" },
  { rung: "EBIT",    median: 2.5,   color: "#C5A24A" },
  { rung: "Revenue", median: -16.7, color: "#B85C4A" },
]
const QUINTILE_DATA = [
  { q: "Q1\nLowest",  composite: 9.8 },
  { q: "Q2",          composite: 9.6 },
  { q: "Q3",          composite: 9.0 },
  { q: "Q4",          composite: 9.8 },
  { q: "Q5\nHighest", composite: 4.9 },
]
const YEAR_DATA = [
  { year: "09", r: -0.0358 }, { year: "10", r: -0.0600 }, { year: "11", r: -0.0103 },
  { year: "12", r: -0.0649 }, { year: "13", r: -0.0368 }, { year: "14", r: -0.0186 },
  { year: "15", r: -0.0327 }, { year: "16", r: -0.0493 }, { year: "17", r: -0.0032 },
  { year: "18", r: +0.0075 }, { year: "19", r: +0.0779 }, { year: "20", r: -0.0715 },
  { year: "21", r: -0.2684 }, { year: "22", r: -0.1173 }, { year: "23", r: -0.1230 },
  { year: "24", r: -0.0435 }, { year: "25", r: -0.0801 },
]
const BUCKET_DATA = [
  { bucket: "Very Low",  cvar: -52.7 },
  { bucket: "Low",       cvar: -56.8 },
  { bucket: "Moderate",  cvar: -66.5 },
  { bucket: "High",      cvar: -67.4 },
  { bucket: "Very High", cvar: -85.1 },
]
const REGIME_LOSS_DATA = [
  { regime: "Expansion",   vh: 34.6, all: 17.4, rel: 1.99 },
  { regime: "Neutral",     vh: 25.3, all: 16.6, rel: 1.52 },
  { regime: "Stress",      vh: 28.3, all: 13.9, rel: 2.04 },
  { regime: "All periods", vh: 30.3, all: 15.8, rel: 1.92 },
]

const E = {
  bg: "#0E0D0B", bg2: "#131210", bg3: "#181614",
  bdr: "#272420", bdr2: "#33302A",
  text: "#EDE9E0", body: "#A89E8E", muted: "#554E44", dim: "#3A3530",
  gold: "#C5A24A", gatm: "rgba(197,162,74,0.04)",
  pos: "#5A9870", neg: "#B85C4A", amber: "#D4952A", blue: "#4A7AA8",
  mono: "'IBM Plex Mono','Courier New',monospace",
  sans: "'Syne',system-ui,sans-serif",
  serif: "'Instrument Serif',Georgia,serif",
}

const CS = { fontSize: 10, fontFamily: "'IBM Plex Mono','Courier New',monospace", fill: "#554E44" }
const TT = { fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", borderColor: "#33302A", borderRadius: 2, background: "#131210", color: "#EDE9E0" }

function CL({ c }: { c: string }) {
  return <p style={{ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 16 }}>{c}</p>
}

function RegimeChart() {
  return <div>
    <CL c="Composite Spearman r · 289,737 obs · 2009–2026" />
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={REGIME_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 36 }} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} vertical={false} />
        <XAxis dataKey="regime" tick={CS} axisLine={false} tickLine={false} interval={0} />
        <YAxis tick={CS} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(2)} domain={[-0.18, 0.08]} width={34} />
        <ReferenceLine y={0} stroke={E.bdr2} strokeWidth={1} />
        <Tooltip formatter={(v: any) => [Number(v).toFixed(4), "Spearman r"]} contentStyle={TT} />
        <Bar dataKey="r" radius={[2, 2, 0, 0]}>
          {REGIME_DATA.map((d, i) => <Cell key={i} fill={d.color} opacity={d.label === "Negligible" ? 0.4 : 0.9} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
}

function YearChart() {
  return <div>
    <CL c="Composite Spearman r · year by year · 2009–2025" />
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={YEAR_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barCategoryGap="12%">
        <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} vertical={false} />
        <XAxis dataKey="year" tick={CS} axisLine={false} tickLine={false} />
        <YAxis tick={CS} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(2)} domain={[-0.32, 0.12]} width={34} />
        <ReferenceLine y={0} stroke={E.bdr2} strokeWidth={1} />
        <Tooltip formatter={(v: any) => [Number(v).toFixed(4), "Spearman r"]} contentStyle={TT} />
        <Bar dataKey="r" radius={[2, 2, 0, 0]}>
          {YEAR_DATA.map((d, i) => <Cell key={i} fill={d.r < -0.11 ? E.pos : d.r < -0.03 ? E.gold : d.r > 0.03 ? E.neg : E.dim} opacity={Math.abs(d.r) < 0.03 ? 0.35 : 0.88} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    <p style={{ fontFamily: E.mono, fontSize: 9.5, color: E.muted, lineHeight: 1.6, marginTop: 10 }}>Red bars = signal inversion. 2019 peak (r = +0.0779) marks the narrative expansion peak. 2021 (r = −0.2684) reflects its collapse.</p>
  </div>
}

function OALChart() {
  return <div>
    <CL c="Median 12-month return · by OAL anchor rung · 289,745 obs" />
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={OAL_RETURN_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} vertical={false} />
        <XAxis dataKey="rung" tick={CS} axisLine={false} tickLine={false} />
        <YAxis tick={CS} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[-24, 14]} width={34} />
        <ReferenceLine y={0} stroke={E.bdr2} strokeWidth={1} />
        <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, "Median"]} contentStyle={TT} />
        <Bar dataKey="median" radius={[2, 2, 0, 0]}>{OAL_RETURN_DATA.map((d, i) => <Cell key={i} fill={d.color} opacity={0.88} />)}</Bar>
      </BarChart>
    </ResponsiveContainer>
    <p style={{ fontFamily: E.mono, fontSize: 9.5, color: E.muted, marginTop: 10 }}>FCF vs Revenue spread: +26.6pp · Held across all regimes tested</p>
  </div>
}

function QuintChart() {
  return <div>
    <CL c="Median 12-month return · composite quintile · Q1 = lowest risk" />
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={QUINTILE_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} vertical={false} />
        <XAxis dataKey="q" tick={CS} axisLine={false} tickLine={false} />
        <YAxis tick={CS} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 13]} width={34} />
        <Tooltip contentStyle={TT} formatter={(v: any, n: any) => [`${Number(v).toFixed(1)}%`, n]} />
        <Bar dataKey="composite" name="Composite" fill={E.gold} radius={[2, 2, 0, 0]} opacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
    <p style={{ fontFamily: E.mono, fontSize: 9.5, color: E.muted, lineHeight: 1.6, marginTop: 10 }}>Signal concentrates in Q5: geo mean −4.3%, hit rate 55.5%. Q1–Q4 are largely undifferentiated.</p>
  </div>
}

function CVaRChart() {
  return <div>
    <CL c="CVaR (95%) · avg loss in worst 5% of 12-month windows" />
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={BUCKET_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} layout="vertical" barCategoryGap="22%">
        <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} horizontal={false} />
        <XAxis type="number" tick={CS} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[-100, 0]} />
        <YAxis type="category" dataKey="bucket" tick={{ ...CS, fill: E.body }} axisLine={false} tickLine={false} width={68} />
        <ReferenceLine x={0} stroke={E.bdr} />
        <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, "CVaR"]} contentStyle={TT} />
        <Bar dataKey="cvar" radius={[0, 2, 2, 0]}>
          {BUCKET_DATA.map((d, i) => <Cell key={i} opacity={0.88} fill={d.bucket === "Very Low" ? E.pos : d.bucket === "Low" ? "#3E6B4F" : d.bucket === "Moderate" ? E.dim : d.bucket === "High" ? "#A05050" : E.neg} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    <p style={{ fontFamily: E.mono, fontSize: 9.5, color: E.muted, marginTop: 10 }}>Very High: 30.3% of observations ended below −25% over 12 months. Very Low: 12.2%.</p>
  </div>
}

function DistChart() {
  const bands = [
    { range: "< −50%",      vl: 2.4,  vh: 16.7 },
    { range: "−50 to −25%", vl: 9.8,  vh: 13.6 },
    { range: "−25 to 0%",   vl: 25.4, vh: 29.4 },
    { range: "0 to +25%",   vl: 29.4, vh: 31.2 },
    { range: "+25 to +50%", vl: 20.4, vh: 5.9  },
    { range: "> +50%",      vl: 12.6, vh: 3.2  },
  ]
  const mx = 38
  return <div>
    <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
      {[{ c: E.pos, l: "Very Low composite" }, { c: E.neg, l: "Very High composite" }].map(({ c, l }) => (
        <span key={l} style={{ fontFamily: E.mono, fontSize: 10.5, color: E.body, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 10, height: 10, background: c, opacity: 0.85, borderRadius: 1 }} />{l}
        </span>
      ))}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {bands.map(({ range, vl, vh }) => (
        <div key={range} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: E.mono, fontSize: 10, color: E.muted, width: 110, textAlign: "right", flexShrink: 0 }}>{range}</div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ height: 11, borderRadius: 1, width: `${(vl / mx) * 100}%`, background: E.pos, opacity: 0.82 }} />
              <span style={{ fontFamily: E.mono, fontSize: 9.5, color: E.muted }}>{vl}%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ height: 11, borderRadius: 1, width: `${(vh / mx) * 100}%`, background: E.neg, opacity: 0.82 }} />
              <span style={{ fontFamily: E.mono, fontSize: 9.5, color: E.muted }}>{vh}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
    <p style={{ fontFamily: E.mono, fontSize: 9.5, color: E.muted, marginTop: 14 }}>% of observations in each return band · Very Low N=18,459 · Very High N=26,128</p>
  </div>
}

function PremiumDecomp() {
  const bars = [
    { l: "Full universe\n(cap-weighted)",       v: 9.8,  b: true  },
    { l: "OSMR-filtered\n(exclusion only, CW)", v: 14.4, b: false },
    { l: "Very Low only\n(post-2013, EW)",       v: 17.5, b: false },
  ]
  return <div>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 20, height: 130, marginBottom: 12 }}>
      {bars.map(({ l, v, b }) => (
        <div key={l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontFamily: E.mono, fontSize: 13, fontWeight: 500, color: b ? E.muted : E.gold }}>+{v}%</div>
          <div style={{ width: "100%", borderRadius: "2px 2px 0 0", height: `${(v / 20) * 100}px`, background: b ? E.bdr2 : E.gold, opacity: b ? 0.6 : 0.85 }} />
        </div>
      ))}
    </div>
    <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
      {bars.map(({ l }) => <div key={l} style={{ flex: 1, textAlign: "center", fontFamily: E.mono, fontSize: 9.5, color: E.muted, lineHeight: 1.5, whiteSpace: "pre-line" }}>{l}</div>)}
    </div>
    <div style={{ paddingTop: 16, borderTop: `1px solid ${E.bdr}` }}>
      {[["Exclusion effect (removing High/Very High)", "+4.6pp"], ["Selection effect (Very Low only, post-2013)", "+3.1pp"]].map(([l, v]) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between", fontFamily: E.mono, fontSize: 11, color: E.body, padding: "5px 0", borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
          <span>{l}</span><span style={{ color: E.pos, fontWeight: 500 }}>{v}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: E.mono, fontSize: 11, fontWeight: 500, color: E.text, padding: "10px 0 0", borderTop: `1px solid ${E.bdr}`, marginTop: 6 }}>
        <span>Total Very Low premium vs full universe</span><span style={{ color: E.gold }}>+7.7pp annualized</span>
      </div>
    </div>
    <p style={{ fontFamily: E.mono, fontSize: 9.5, color: E.muted, marginTop: 8 }}>Post-2013 · 145 months · transaction costs not modeled</p>
  </div>
}

const OAL_RUNGS = [
  { code: "FCF",  label: "Free Cash Flow", desc: "Positive 3-year cumulative FCF",   count: "~2,900", color: "#5A9870", bg: "rgba(90,152,112,0.08)",  border: "rgba(90,152,112,0.25)",  empirical: "+9.8% median · +6.1% geo · 62.7% hit rate", pct: "70%" },
  { code: "NI",   label: "Net Income",     desc: "Profitable but not FCF-positive",  count: "~622",   color: "#4A7AA8", bg: "rgba(74,122,168,0.08)",  border: "rgba(74,122,168,0.25)",  empirical: "+4.0% median · −5.7% geo · 54.6% hit rate", pct: "42%" },
  { code: "EBIT", label: "EBIT",           desc: "Operating income positive",        count: "~111",   color: "#C5A24A", bg: "rgba(197,162,74,0.08)",  border: "rgba(197,162,74,0.25)",  empirical: "+2.5% median · −0.3% geo · 52.3% hit rate", pct: "29%" },
  { code: "Rev",  label: "Revenue",        desc: "Cannot cover operating costs",     count: "~1,163", color: "#B85C4A", bg: "rgba(184,92,74,0.08)",   border: "rgba(184,92,74,0.25)",   empirical: "−16.7% median · −22.9% geo · 39.7% hit rate", pct: "6%" },
  { code: "—",    label: "Non-Viable",     desc: "Zero or negative revenue",         count: "~372",   color: "#554E44", bg: "transparent",             border: "#272420",                empirical: "Excluded", pct: "0%" },
]

const AXES = [
  { id: "axis1", label: "Axis 1", name: "Operational Anchor Risk", r: "−0.034", question: "How far does the valuation extend beyond demonstrated operational output?", body: `Axis 1 measures the distance between a company's Enterprise Value and its deepest credible operational anchor — adjusted for the shallowness of that anchor.\n\nThe formula: log(EV / 3-year cumulative anchor) + OAL_penalty → global percentile rank.\n\nThe 3-year cumulative anchor is deliberate. A company must have demonstrated positive free cash flow (or net income, EBIT, or revenue) over a full three-year trailing window, not just in the most recent quarter. The shallowness penalty encodes the structural distance between OAL rungs: a revenue-anchored company is treated as approximately 13.5× more expensive relative to its anchor than an FCF-anchored company at the same raw multiple.\n\nAxis 1 produces its strongest signal during periods of structural stress and dislocation. In calm bull markets where narrative valuations are broadly rewarded, the signal is attenuated — which is both expected and disclosed.` },
  { id: "axis2", label: "Axis 2", name: "Operational Trajectory Risk", r: "−0.056", question: "Is the operational foundation strengthening or eroding?", body: `Axis 2 captures trajectory, not position. A company moving toward demonstrated cash generation is shortening its narrative bridge. A company whose anchor metric is deteriorating is lengthening it — accumulating structural risk regardless of where its price currently sits.\n\nThe score is derived from year-over-year comparisons across up to 28 quarters of history, adjusted by an OAL shallowness penalty and ranked globally. The four most recent year-over-year comparisons receive double weight — current trajectory is more relevant to current structural risk than data from six years prior.\n\nAxis 2 is the stronger and more consistent signal across the validation period, carrying meaningful signal even in the pre-2020 decade where Axis 1 was near zero.\n\nDesign note: Year-over-year consistency outperformed tanh transformation and R-squared trend fitting in empirical validation. Mathematical sophistication is not a virtue when it disconnects the measure from the phenomenon it captures.` },
]

function AxisAccordion() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {AXES.map(({ id, label, name, r, question, body }) => {
        const isOpen = open === id
        return (
          <div key={id} style={{ border: `1px solid ${isOpen ? E.bdr2 : E.bdr}`, background: isOpen ? E.gatm : E.bg2, transition: "all 0.15s" }}>
            <button onClick={() => setOpen(isOpen ? null : id)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: E.muted }}>{label}</span>
                <span style={{ fontFamily: E.sans, fontSize: 14, fontWeight: 600, color: E.text }}>{name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: E.mono, fontSize: 10.5, color: isOpen ? E.gold : E.muted }}>r = {r}</span>
                <ChevronDown size={14} style={{ color: E.muted, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
              </div>
            </button>
            {isOpen && (
              <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${E.bdr}` }}>
                <p style={{ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.gold, marginTop: 16, marginBottom: 14 }}>{question}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {body.split("\n\n").map((para, i) => <p key={i} style={{ fontFamily: E.sans, fontSize: 13.5, color: E.body, lineHeight: 1.8 }}>{para}</p>)}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const SECTIONS = [
  { id: "framing", label: "Framing", num: "00" }, { id: "problem", label: "The Problem", num: "I" },
  { id: "oal", label: "Anchor Ladder", num: "II" }, { id: "axes", label: "The Axes", num: "III" },
  { id: "composite", label: "Composite", num: "IV" }, { id: "validation", label: "Validation", num: "V" },
  { id: "principles", label: "Principles", num: "VI" }, { id: "limitations", label: "Limitations", num: "VII" },
  { id: "conclusion", label: "Conclusion", num: "VIII" }, { id: "appendix", label: "Appendix", num: "—" },
]

const s = (x: object) => x as React.CSSProperties
const Ey = ({ c }: { c: string }) => <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: E.gold, marginBottom: 10 })}>{c}</p>
const SH = ({ ch }: { ch: React.ReactNode }) => <h2 style={s({ fontFamily: E.sans, fontSize: "clamp(22px,2.5vw,28px)", fontWeight: 800, lineHeight: 1.15, color: E.text, letterSpacing: "-0.03em", marginBottom: 18 })}>{ch}</h2>
const SubH = ({ ch }: { ch: string }) => <h3 style={s({ fontFamily: E.sans, fontSize: 16, fontWeight: 700, color: E.text, marginTop: 28, marginBottom: 10 })}>{ch}</h3>
const B = ({ ch, st }: { ch: React.ReactNode; st?: object }) => <p style={s({ fontFamily: E.sans, fontSize: 13.5, lineHeight: 1.82, color: E.body, marginBottom: 14, ...st })}>{ch}</p>
const Callout = ({ label, ch }: { label?: string; ch: string }) => (
  <div style={s({ borderLeft: `2px solid ${E.gold}`, background: E.gatm, padding: "18px 22px", margin: "20px 0" })}>
    {label && <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: E.gold, opacity: 0.6, marginBottom: 8 })}>{label}</p>}
    <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.75, color: E.text })}>{ch}</p>
  </div>
)
const NoteBox = ({ label, ch, bc = E.bdr2 }: { label?: string; ch: string; bc?: string }) => (
  <div style={s({ border: `1px solid ${bc}`, background: E.bg2, padding: "16px 20px", margin: "16px 0" })}>
    {label && <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: E.muted, marginBottom: 8 })}>{label}</p>}
    <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.75, color: E.body })}>{ch}</p>
  </div>
)
const CC = ({ ch }: { ch: React.ReactNode }) => <div style={s({ border: `1px solid ${E.bdr}`, background: E.bg2, padding: "20px 24px", margin: "16px 0" })}>{ch}</div>
const Div = () => <div style={s({ height: 1, background: E.bdr, margin: "52px 0" })} />

function DT({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div style={s({ border: `1px solid ${E.bdr}`, margin: "16px 0", overflow: "hidden" })}>
      <table style={s({ width: "100%", borderCollapse: "collapse", fontFamily: E.mono, fontSize: 11 })}>
        <thead>
          <tr style={s({ borderBottom: `1px solid ${E.bdr}`, background: E.bg2 })}>
            {headers.map((h, i) => <th key={i} style={s({ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: E.muted, padding: "10px 14px", textAlign: i === 0 ? "left" : "right", fontWeight: 400 })}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={s({ borderBottom: ri < rows.length - 1 ? `1px solid rgba(255,255,255,0.025)` : "none" })}>
              {row.map((cell, ci) => <td key={ci} style={s({ padding: "8px 14px", color: E.text, textAlign: ci === 0 ? "left" : "right", verticalAlign: "middle" })}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FG({ items }: { items: { label: string; val: string; note: string; vc?: string }[] }) {
  return (
    <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, border: `1px solid ${E.bdr}`, background: E.bdr, margin: "16px 0" })}>
      {items.map(({ label, val, note, vc }) => (
        <div key={label} style={s({ background: E.bg2, padding: "18px 20px" })}>
          <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: E.muted, marginBottom: 8 })}>{label}</p>
          <p style={s({ fontFamily: E.mono, fontSize: 26, fontWeight: 500, color: vc || E.text, lineHeight: 1, marginBottom: 6, letterSpacing: "-0.02em" })}>{val}</p>
          <p style={s({ fontFamily: E.sans, fontSize: 11, color: E.body, lineHeight: 1.5 })}>{note}</p>
        </div>
      ))}
    </div>
  )
}

function RBars({ items }: { items: { name: string; pct: string; val: string; w: number }[] }) {
  return (
    <div style={s({ margin: "14px 0" })}>
      {items.map(({ name, pct, val, w }) => (
        <div key={name} style={s({ display: "grid", gridTemplateColumns: "160px 1fr 60px", alignItems: "center", gap: 14, padding: "7px 0", borderBottom: `1px solid rgba(255,255,255,0.025)` })}>
          <div><span style={s({ fontFamily: E.sans, fontSize: 11.5, color: E.text, fontWeight: 600 })}>{name}</span><span style={s({ fontFamily: E.mono, fontSize: 9, color: E.muted, marginLeft: 6 })}>{pct}</span></div>
          <div style={s({ height: 2, background: E.bdr2, position: "relative" })}><div style={s({ position: "absolute", left: 0, top: 0, height: 2, width: `${w}%`, background: E.gold })} /></div>
          <div style={s({ fontFamily: E.mono, fontSize: 12, fontWeight: 500, color: E.gold, textAlign: "right" })}>{val}</div>
        </div>
      ))}
    </div>
  )
}

function AUCG({ items }: { items: { val: string; name: string; note: string; hi?: boolean }[] }) {
  return (
    <div style={s({ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, border: `1px solid ${E.bdr}`, background: E.bdr, margin: "14px 0" })}>
      {items.map(({ val, name, note, hi }) => (
        <div key={name} style={s({ background: E.bg2, padding: "16px", textAlign: "center" })}>
          <div style={s({ fontFamily: E.mono, fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", color: hi ? E.gold : E.muted, marginBottom: 4 })}>{val}</div>
          <div style={s({ fontFamily: E.sans, fontSize: 10, color: E.body, marginBottom: 3, fontWeight: 600 })}>{name}</div>
          <div style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>{note}</div>
        </div>
      ))}
    </div>
  )
}

function OQ({ title, ch }: { title: string; ch: React.ReactNode }) {
  return (
    <div style={s({ border: `1px solid ${E.bdr2}`, background: E.bg2, padding: "16px 20px", margin: "12px 0", display: "flex", gap: 14 })}>
      <div style={s({ fontFamily: E.mono, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: E.amber, background: "rgba(212,149,42,0.08)", border: "1px solid rgba(212,149,42,0.2)", padding: "3px 8px", whiteSpace: "nowrap", height: "fit-content", flexShrink: 0 })}>Open</div>
      <div><p style={s({ fontFamily: E.sans, fontSize: 12.5, fontWeight: 700, color: E.text, marginBottom: 6 })}>{title}</p><div style={s({ display: "flex", flexDirection: "column", gap: 8 })}>{ch}</div></div>
    </div>
  )
}

const P = (c: string) => <span style={{ color: E.pos, fontWeight: 500 }}>{c}</span>
const N = (c: string) => <span style={{ color: E.neg, fontWeight: 500 }}>{c}</span>
const G = (c: string) => <span style={{ color: E.gold, fontWeight: 500 }}>{c}</span>
const M = (c: string) => <span style={{ color: E.muted }}>{c}</span>

export default function OsmrMethodology() {
  const [active, setActive] = useState("framing")

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }) },
      { rootMargin: "-30% 0px -60% 0px" }
    )
    SECTIONS.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  return (
    <main style={s({ minHeight: "100vh", background: E.bg, color: E.text, fontFamily: E.sans })}>

      {/* HEADER */}
      <div style={s({ background: E.bg, borderBottom: `1px solid ${E.bdr}`, padding: "44px 44px 36px" })}>
        <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: E.muted, marginBottom: 20 })}>The Capital Steward · Methodology · 2026</p>
        <h1 style={s({ fontFamily: E.sans, fontSize: "clamp(36px,5vw,52px)", fontWeight: 800, lineHeight: 1.0, color: E.text, letterSpacing: "-0.04em", marginBottom: 18 })}>
          How We Measure<br />
          <em style={s({ fontStyle: "italic", fontFamily: E.serif, fontWeight: 400, color: E.gold, fontSize: "clamp(40px,5.5vw,56px)", letterSpacing: "-0.02em" })}>Structural Risk</em>
        </h1>
        <p style={s({ fontFamily: E.sans, fontSize: 14, lineHeight: 1.8, color: E.body, maxWidth: 520, marginBottom: 22 })}>
          Most valuation frameworks ask how much a company is worth. This one asks how well-grounded that valuation is in what the company has actually demonstrated. The gap between these questions is where structural investment risk accumulates — before it becomes visible in price.
        </p>
        <div style={s({ display: "flex", width: "fit-content", marginBottom: 22, border: `1px solid ${E.bdr}` })}>
          {["~5,200 U.S. equities · $5M ADV filter", "289,737 observations · 2009–2026"].map((t, i) => (
            <span key={i} style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, padding: "7px 14px", borderRight: i === 0 ? `1px solid ${E.bdr}` : "none" })}>{t}</span>
          ))}
        </div>
        <nav style={s({ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 20 })}>
          {SECTIONS.map(({ id, label }) => (
            <a key={id} href={`#${id}`} style={s({ fontFamily: E.sans, fontSize: 10.5, fontWeight: 600, color: active === id ? E.gold : E.muted, border: `1px solid ${active === id ? "rgba(197,162,74,0.3)" : E.bdr}`, background: active === id ? E.gatm : "transparent", padding: "5px 12px", cursor: "pointer", textDecoration: "none", transition: "all 0.12s" })}>{label}</a>
          ))}
        </nav>
        <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, lineHeight: 1.65, maxWidth: 580 })}>All quantitative figures reflect a recent snapshot of the dataset. Universe counts and observation totals are snapshot-dependent values. The dataset refreshes weekly; the full pipeline recalibrates monthly. Backtest results are historical and do not guarantee future outcomes.</p>
      </div>

      {/* BODY */}
      <div style={s({ maxWidth: 1100, margin: "0 auto", display: "flex" })}>

        {/* Sidebar */}
        <aside className="hidden xl:block" style={s({ width: 160, flexShrink: 0 })}>
          <div style={s({ position: "sticky", top: 0, padding: "32px 0", borderRight: `1px solid ${E.bdr}` })}>
            {SECTIONS.map(({ id, label, num }) => (
              <a key={id} href={`#${id}`} style={s({ display: "flex", alignItems: "baseline", gap: 10, padding: "7px 20px", textDecoration: "none", borderLeft: `2px solid ${active === id ? E.gold : "transparent"}`, background: active === id ? E.gatm : "transparent", transition: "all 0.12s" })}>
                <span style={s({ fontFamily: E.mono, fontSize: 8.5, color: E.dim, minWidth: 14 })}>{num}</span>
                <span style={s({ fontFamily: E.sans, fontSize: 10.5, color: active === id ? E.gold : E.muted, fontWeight: 600 })}>{label}</span>
              </a>
            ))}
          </div>
        </aside>

        <div style={s({ flex: 1, padding: "48px 44px", minWidth: 0 })}>

          {/* FRAMING */}
          <section id="framing" style={s({ marginBottom: 64 })}>
            <Ey c="Framing" />
            <SH ch="Most analysis begins with stories. We begin with structure." />
            <B ch="Markets are driven as much by perception as by operating reality. A company will point to the deepest operational anchor it can credibly claim. If it cannot justify its valuation with free cash flow, it ascends the financial statement — to earnings, to operating income, to revenue — until it finds a metric the market will accept. Each step up the ladder lengthens the narrative bridge between price and economic reality." />
            <B ch="The Capital Steward exists to measure that bridge. Narratives are constrained by structure. Valuations must ultimately reconcile with operating reality. Cash generation cannot be substituted indefinitely. Structure eventually speaks for itself." />
            <Callout label="Framework thesis" ch="OSMR applies first-principle structural reasoning to equity analysis. It tests the hypothesis that companies grounded in operational reality outperform those whose valuations rest on narrative. Multiple years of data confirm this. The framework is a validated theory of structural fragility." />
          </section>

          <Div />

          {/* THE PROBLEM */}
          <section id="problem" style={s({ marginBottom: 64 })}>
            <Ey c="Section I" />
            <SH ch="The Problem with Valuation" />
            <B ch="Every stock price is a statement of belief. When a market assigns a company an enterprise value of $10 billion, it is not recording a fact — it is expressing a judgment about what the company's future cash generation will justify. That judgment is, at its core, a narrative." />
            <B ch="This is not a criticism. Narrative is inseparable from valuation. Every multiple — price-to-earnings, EV-to-EBITDA, price-to-sales — is a present-value claim about future performance. The multiple is the price of believing the story. Standard valuation analysis focuses on whether the story is plausible. What it rarely asks is: what happens to the valuation if the story stops being believed? And how far is the story from anything the company has actually demonstrated?" />
            <Callout ch="There is a meaningful difference between a company valued at 40× free cash flow and a company valued at 40× revenue. Both trade at the same nominal multiple. But the first has demonstrated the ability to convert revenue into cash after all obligations. The second's valuation depends entirely on the market continuing to believe it will eventually do something it has not yet done." />
            <NoteBox label="A note on scope" ch="OSMR does not claim to identify mispriced securities or predict return outcomes. A company with very high structural risk may continue to appreciate for months or years if the narrative sustaining its valuation remains intact. The framework measures the structure of risk, not its timing — a distinction this document returns to throughout." />
          </section>

          <Div />

          {/* OAL */}
          <section id="oal" style={s({ marginBottom: 64 })}>
            <Ey c="Section II" />
            <SH ch="The Operational Anchor Ladder" />
            <B ch="The Operational Anchor Ladder (OAL) is the governance construct at the heart of OSMR. It answers a single question for every company in the universe: what is the deepest, most credible financial rung this company has actually demonstrated over the trailing three years?" />
            <B ch={<>The word <em>deepest</em> is deliberate. It refers not to the size of the financial figure but to its proximity to actual cash generation. Free cash flow is the deepest anchor because it represents what a company has genuinely produced after all capital requirements. Revenue is the shallowest anchor because it tells us only that the company sold something — not whether that sale moved it any closer to economic viability.</>} />

            <div style={s({ border: `1px solid ${E.bdr}`, margin: "24px 0" })}>
              <div style={s({ display: "grid", gridTemplateColumns: "44px 110px 1fr 150px", gap: 14, padding: "8px 14px", borderBottom: `1px solid ${E.bdr}`, background: E.bg2 })}>
                {["Code", "Anchor", "12-month median return", "Statistics"].map((h, i) => (
                  <span key={h} style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted, textAlign: i === 3 ? "right" : "left" })}>{h}</span>
                ))}
              </div>
              {OAL_RUNGS.map(({ code, label, desc, color, bg, border, empirical, pct }, i) => (
                <div key={code} style={s({ display: "grid", gridTemplateColumns: "44px 110px 1fr 150px", gap: 14, alignItems: "center", padding: "12px 14px", borderBottom: i < OAL_RUNGS.length - 1 ? `1px solid rgba(255,255,255,0.025)` : "none", opacity: code === "—" ? 0.28 : 1 })}>
                  <div style={s({ fontFamily: E.mono, fontSize: 9.5, fontWeight: 500, padding: "2px 5px", textAlign: "center", letterSpacing: "0.06em", color, background: bg, border: `1px solid ${border}` })}>{code}</div>
                  <div>
                    <div style={s({ fontFamily: E.sans, fontSize: 12.5, fontWeight: 700, color: E.text })}>{label}</div>
                    <div style={s({ fontFamily: E.mono, fontSize: 9, color: E.muted, marginTop: 2 })}>{desc}</div>
                  </div>
                  <div style={s({ position: "relative" })}>
                    <div style={s({ height: 2, background: E.bdr2 })} />
                    {code !== "—" && <div style={s({ position: "absolute", left: 0, top: 0, height: 2, background: color, opacity: 0.8, width: pct })} />}
                  </div>
                  <div style={s({ fontFamily: E.mono, fontSize: 10, textAlign: "right", color: E.body })}>
                    {code !== "—" && <span style={s({ display: "block", fontWeight: 500, color: code === "Rev" ? E.neg : E.pos })}>{empirical.split(" · ")[0]}</span>}
                    <span style={s({ fontSize: 9, color: E.muted })}>{code !== "—" ? empirical.split(" · ").slice(1).join(" · ") : "excluded"}</span>
                  </div>
                </div>
              ))}
              <div style={s({ padding: "10px 14px", borderTop: `1px solid ${E.bdr}`, background: E.bg2 })}>
                <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, textAlign: "center" })}>Each step up the ladder increases narrative dependence — and structural risk. FCF–Revenue spread: +26.6pp held across all regimes.</p>
              </div>
            </div>

            <CC ch={<OALChart />} />
            <Callout label="Empirical confirmation" ch="The 26.6pp spread between FCF median returns (+9.8%) and Revenue median returns (−16.7%) across 289,745 observations is stable across all market regimes tested. Anchor depth is the most durable signal in the framework. Cross-sectional factor analysis confirms: being in the NI anchor rung rather than FCF costs 10.7 percentage points of annual return (t = −10.113) after controlling for all axis scores, size, and standard factors." />

            <SubH ch="The Assignment Logic" />
            <B ch="Each company is evaluated against the OAL rungs in descending order — FCF first, then Net Income, then EBIT, then Revenue — and assigned to the first rung it qualifies for on a three-year cumulative basis. A 3-year window requires sustained demonstrated performance rather than rewarding a single anomalous quarter. Adjusted metrics, normalized earnings, and forward projections are not considered." />

            <SubH ch="The Shallowness Penalty" />
            <B ch="Two companies trading at the same enterprise value multiple are not comparably risky if they are anchored on different OAL rungs. The shallowness penalty encodes this: a proportional risk adjustment applied to the axis scores based on anchor depth. After adjustment, a revenue-anchor company is treated as approximately 13.5× more expensive relative to its anchor than an FCF-anchor company at the same raw multiple." />
            <B ch="The specific penalty values were derived from first-principles reasoning about the structural distance between rungs — calibrated before examining outcomes, which means the cohort separation is a genuine test rather than circular validation." />
          </section>

          <Div />

          {/* AXES */}
          <section id="axes" style={s({ marginBottom: 64 })}>
            <Ey c="Section III" />
            <SH ch="The Axes of Structural Risk" />
            <B ch="OSMR's two axes are not measuring different things. They are measuring different dimensions of the same structural condition: the relationship between a company's valuation and its operational reality. Both axes speak to the same OAL anchor throughout." />
            <B ch="Axis 1 asks: how stretched is the valuation relative to demonstrated output? Axis 2 asks: is that demonstrated output improving or deteriorating? Together they build a complete structural picture from two complementary angles. An important empirical finding: neither axis alone produces the discrimination the composite achieves. A standalone momentum proxy using only Axis 2 produced AUC below random (0.406 vs 0.500 baseline). The composite works because both signals triangulate the same underlying structural condition." />
            <div style={s({ marginTop: 24 })}><AxisAccordion /></div>
          </section>

          <Div />

          {/* COMPOSITE */}
          <section id="composite" style={s({ marginBottom: 64 })}>
            <Ey c="Section IV" />
            <SH ch="The Composite Score" />
            <B ch="The Composite Structural Risk score is the equal-weight mean of Axis 1 and Axis 2, expressed as a percentile rank across the full scored universe." />
            <div style={s({ background: E.bg2, borderLeft: `2px solid ${E.gold}`, padding: "16px 20px", margin: "18px 0" })}>
              <code style={s({ fontFamily: E.mono, fontSize: 16, color: E.gold, letterSpacing: "0.04em" })}>composite = (axis₁_pct + axis₂_pct) / 2</code>
            </div>
            <B ch="Axis 2 carries marginally stronger full-period signal (r = −0.056 vs −0.034), but tilting the weight toward Axis 2 improves composite r by approximately 0.006 — within bootstrap confidence interval overlap. Equal weighting is more interpretable, more stable, and less dependent on a specific historical window to justify." />
            <B ch="This is a long-run static model. Weights do not shift based on market regime or detected volatility environment. Stability is a deliberate choice — a model that silently changes its weights is harder to interpret and more susceptible to overfitting." />

            <div style={s({ margin: "20px 0" })}>
              <div style={s({ display: "flex", height: 3, gap: 1, marginBottom: 6 })}>
                {[{ bg: E.pos, op: 0.9 }, { bg: E.pos, op: 0.5 }, { bg: E.dim }, { bg: E.neg, op: 0.5 }, { bg: E.neg, op: 0.9 }].map((sc, i) => (
                  <div key={i} style={s({ flex: 1, background: sc.bg, opacity: sc.op || 1 })} />
                ))}
              </div>
              <div style={s({ display: "flex", justifyContent: "space-between", fontFamily: E.mono, fontSize: 9 })}>
                <span style={s({ color: E.pos })}>Very Low</span><span style={s({ color: E.muted })}>Low</span><span style={s({ color: E.muted })}>Moderate</span><span style={s({ color: E.muted })}>High</span><span style={s({ color: E.neg })}>Very High</span>
              </div>
            </div>

            <div style={s({ border: `1px solid ${E.bdr}`, margin: "16px 0" })}>
              <div style={s({ display: "grid", gridTemplateColumns: "120px 80px 1fr", background: E.bg2, borderBottom: `1px solid ${E.bdr}`, padding: "8px 14px" })}>
                {["Bucket", "Percentile", "Description"].map(h => <span key={h} style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted })}>{h}</span>)}
              </div>
              {[
                { bucket: "Very Low",  range: "0–20th",   desc: "Deepest anchors, improving trajectory",      color: E.pos },
                { bucket: "Low",       range: "20–40th",  desc: "Below-average structural risk",             color: "#3E6B4F" },
                { bucket: "Moderate",  range: "40–60th",  desc: "Population center",                        color: E.muted },
                { bucket: "High",      range: "60–80th",  desc: "Above-average structural risk",            color: "#A05050" },
                { bucket: "Very High", range: "80–100th", desc: "Shallow anchors, deteriorating trajectory", color: E.neg },
              ].map(({ bucket, range, desc, color }, i) => (
                <div key={bucket} style={s({ display: "grid", gridTemplateColumns: "120px 80px 1fr", padding: "10px 14px", borderBottom: i < 4 ? `1px solid rgba(255,255,255,0.025)` : "none" })}>
                  <div style={s({ display: "flex", alignItems: "center", gap: 8 })}>
                    <div style={s({ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 })} />
                    <span style={s({ fontFamily: E.sans, fontSize: 12, fontWeight: 600, color: E.text })}>{bucket}</span>
                  </div>
                  <span style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.muted })}>{range}</span>
                  <span style={s({ fontFamily: E.sans, fontSize: 12, color: E.body })}>{desc}</span>
                </div>
              ))}
            </div>
          </section>

          <Div />

          {/* VALIDATION */}
          <section id="validation" style={s({ marginBottom: 64 })}>
            <Ey c="Section V" />
            <SH ch="Empirical Validation" />
            <B ch="A scoring framework without empirical grounding is a hypothesis. OSMR has been validated against 289,737 historical observations across the U.S. equity universe from 2009 through 2026, spanning three distinct market regimes. The validation tests whether structural risk classifications produce measurably different distributions of subsequent 12-month returns." />

            <CC ch={<>
              <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted, marginBottom: 14 })}>How to read Spearman r in an equity factor context</p>
              <B ch="The Fama-French value factor produces r in the 0.03–0.06 range. Momentum produces 0.05–0.09." />
              <div style={s({ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4, marginTop: 14 })}>
                {[
                  { l: "Negligible", r: "|r| < 0.03",  bg: E.bg3,                        t: E.muted },
                  { l: "Slight",     r: "0.03–0.05",   bg: "rgba(74,122,168,0.15)",      t: E.blue },
                  { l: "Modest",     r: "0.05–0.07",   bg: "rgba(197,162,74,0.12)",      t: E.gold },
                  { l: "Strong",     r: "0.07–0.11",   bg: "rgba(90,152,112,0.15)",      t: E.pos },
                  { l: "Substantive",r: "|r| ≥ 0.11",  bg: E.pos,                        t: E.bg },
                ].map(({ l, r: rng, bg, t }) => (
                  <div key={l} style={s({ borderRadius: 2, padding: "10px 8px", textAlign: "center", background: bg })}>
                    <div style={s({ fontFamily: E.sans, fontSize: 10, fontWeight: 700, color: t })}>{l}</div>
                    <div style={s({ fontFamily: E.mono, fontSize: 9, color: t, opacity: 0.7, marginTop: 2 })}>{rng}</div>
                  </div>
                ))}
              </div>
            </>} />

            <SubH ch="Signal Summary" />
            <DT
              headers={["Factor", "Spearman r", "95% CI", "Label", "N"]}
              rows={[
                ["Axis 1 — Anchor Risk",     G("−0.0339"), M("[−0.038, −0.030]"), M("Slight"),  "289,745"],
                ["Axis 2 — Trajectory Risk", G("−0.0556"), M("[−0.059, −0.052]"), "Modest",      "289,737"],
                [<span style={{ color: E.text, fontWeight: 500 }}>Composite (equal weight)</span>, G("−0.0518"), M("[−0.056, −0.048]"), <span style={{ color: E.text, fontWeight: 500 }}>Modest</span>, "289,737"],
              ]}
            />
            <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, marginTop: 8 })}>Bootstrap 95% CI (1,000 samples). All p-values = 0.0000. ICIR: Composite −0.66 · Axis 2 −0.58 · Axis 1 −0.40.</p>

            <SubH ch="Signal by Market Regime" />
            <B ch="OSMR's signal is conditional on the market environment. In periods of structural stress and dislocation the signal is Substantive. In the extended pre-2020 bull market, the full-period cross-sectional signal is Negligible. This is the expected behavior of a framework that measures structural risk, not narrative momentum." />
            <CC ch={<RegimeChart />} />

            <NoteBox label="Pre-2020 regime — disclosure and reconciliation" ch="The pre-2020 composite signal (r = −0.001, Negligible) warrants specific attention. Breaking the decade into sub-windows: 2009–2012 produced Slight signal (r = −0.043). 2013–2016 produced Slight signal (r = −0.031). 2017–2019 produced a statistically significant inversion (r = +0.037) — the period when narrative premium expansion was at its peak. The 2019 peak inversion (r = +0.079) is the strongest anti-signal year in the dataset. The 2021 signal (r = −0.268, Substantive) reflects the subsequent collapse of those narratives." />
            <B ch="The Spearman r of −0.001 pre-2020 and factor-adjusted L/S alpha of +23.9% (t = +5.84) pre-2020 are compatible and both true. Spearman r measures rank-order consistency across the full return distribution. When Q1–Q4 are nearly identical in median returns, the rank correlation is dragged toward zero even when Q5 diverges sharply. The factor-adjusted long-short portfolio captures only the tail differential and bypasses the undifferentiated middle. The narrative independence premium exists at the extremes across all three regimes." />
            <CC ch={<YearChart />} />

            <SubH ch="Factor Independence" />
            <B ch="The central question any serious allocator asks about a new framework is whether it carries information beyond what established factors already explain. OSMR has been tested against the Fama-French five-factor model plus momentum — controlling for market, size, value, profitability, investment, and momentum simultaneously." />
            <FG items={[
              { label: "Annualized alpha", val: "+21.0%", note: "After stripping all six factors", vc: E.gold },
              { label: "t-statistic (alpha)", val: "+4.80", note: "Clears 2.0 threshold with margin. p = 0.000002" },
              { label: "R² (factor model)", val: "5.1%", note: "Factors explain 5.1% of L/S return variance", vc: E.muted },
              { label: "RMW loading", val: "+0.290", note: "t = +1.57 — directional but not significant", vc: E.muted },
            ]} />
            <Callout ch="The six-factor model explains 5.1% of long-short return variance. 94.9% is orthogonal to the entire FF5+Momentum factor set. The framework is not a repackaging of known factors. The RMW (profitability) loading is directionally expected but does not reach statistical significance — the signal is not driven by profitability alone." />
            <B ch="Regime stratification confirms the alpha is not concentrated in crisis periods. The factor-adjusted L/S return is positive and statistically significant pre-2020 (+23.9% annualized, t = +5.84, n = 132 months) and post-COVID (+20.0%, t = +2.15, n = 49 months). The full-period alpha reflects a consistent structural signal, not a crisis artifact." />

            {/* BOARD ADDITION 1 — Implementability caveat */}
            <NoteBox label="A note on implementability" ch="The L/S alpha figure above is a long-short portfolio construction result — a theoretical long in Very Low against a short in Very High, rebalanced monthly, with no transaction costs. It is not an implementable return estimate for a long-only strategy. A long-only filter produces different economics — the exclusion and selection effects documented below (+4.6pp and +3.1pp respectively) are the more relevant figures for long-only implementation. Signal persistence across sub-12-month holding horizons has not been formally tested and remains an open research question." />

            <SubH ch="Regime-Conditional Signal" />
            <B ch="The framework generates positive long-short alpha in all three ex ante regime classifications using a fully mechanical classifier — prior month's trailing 12-month market return. No forecasting required. Expansion encompasses 52.7% of the sample period and generates +14.5% annualized L/S return. The framework is not a crisis-only tool." />
            <DT
              headers={["Regime", "% of Months", "L/S Ann Return", "ICIR"]}
              rows={[
                ["Expansion (prior 12m > +10%)", "52.7%", P("+14.5%"), "−0.659"],
                ["Neutral (0% to +10%)",          "17.6%", P("+18.0%"), "−0.534"],
                ["Stress (prior 12m < 0%)",       "23.9%", P("+23.5%"), "−0.766"],
              ]}
            />
            <CC ch={<>
              <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted, marginBottom: 14 })}>Very High loss rates by regime · loss = 12m return &lt; −25%</p>
              <DT headers={["Regime", "VH loss rate", "Universe rate", "Relative risk"]}
                rows={REGIME_LOSS_DATA.map(({ regime, vh, all, rel }) => [regime, N(`${vh}%`), M(`${all}%`), <span style={{ color: E.text, fontWeight: 500 }}>{rel}×</span>])}
              />
              <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, lineHeight: 1.6, marginTop: 10 })}>Expansion absolute loss rate (34.6%) exceeds Stress (28.3%) because market recovery dynamics lift structurally fragile companies in stress periods. The relative risk (~2×) is consistent across all environments.</p>
            </>} />

            <SubH ch="Return Distribution by Structural Risk Quintile" />
            <B ch="The signal concentrates in the penalty applied to the highest-risk quintile. Q1 through Q4 are largely undifferentiated in median returns. The framework does not reliably identify which companies will outperform. What it reliably identifies is the structural condition under which companies are most likely to significantly underperform." />
            <CC ch={<QuintChart />} />
            <DT
              headers={["Quintile", "Median", "Geo Mean", "Hit Rate", "N"]}
              rows={[
                [P("Q1 — Lowest Risk"), "+9.8%", "+7.6%", "62.1%", "57,949"],
                ["Q2", "+9.6%", "+6.0%", "62.1%", "57,946"],
                ["Q3", "+9.0%", "+3.1%", "61.5%", "57,947"],
                ["Q4", "+9.8%", "+5.0%", "63.0%", "57,948"],
                [N("Q5 — Highest Risk"), "+4.9%", "−4.3%", "55.5%", "57,947"],
              ]}
            />
            {/* BOARD ADDITION 2 — Quintile threshold */}
            <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, lineHeight: 1.65, marginTop: 10 })}>Q1–Q5 median spread: +4.9pp · t = 10.646 · p = 0.0000 · Full period 2009–2026. The practical decision threshold is the Very High bucket. Q1–Q4 provide rank ordering within the lower-risk population but do not carry the distributional separation that makes the signal actionable.</p>

            <SubH ch="The Narrative Independence Premium" />
            <B ch="The framework's primary structural contribution is loss avoidance — specifically, the return to holding companies that are independent of the narratives required to sustain fragile valuations. The Very High composite bucket has a hit rate of 49.4% — meaning approximately half of Very High classifications produce positive 12-month returns. The framework identifies a structural risk state, not a predicted outcome. A company in Very High is in a condition where severe loss is approximately 2× more likely than the universe base rate." />
            <CC ch={<><p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted, marginBottom: 20 })}>Return distribution · Very Low vs Very High composite bucket</p><DistChart /></>} />

            <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, margin: "16px 0" })}>
              {[
                { label: "Very Low composite", color: E.pos, items: [["Median 12-month return", "+10.4%"], ["Geometric mean", "+8.6%"], ["Hit rate", "62.4%"], ["% outcomes below −25%", "12.2%"], ["CVaR (95th)", "−52.7%"], ["N", "18,459"]] },
                { label: "Very High composite", color: E.neg, items: [["Median 12-month return", "−0.8%"], ["Geometric mean", "−11.7%"], ["Hit rate", "49.4%"], ["% outcomes below −25%", "30.3%"], ["CVaR (95th)", "−85.1%"], ["N", "26,128"]] },
              ].map(({ label, color, items }) => (
                <div key={label} style={s({ border: `1px solid ${E.bdr}`, background: E.bg2, padding: 18 })}>
                  <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted, marginBottom: 14 })}>{label}</p>
                  {items.map(([k, v]) => (
                    <div key={k} style={s({ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid rgba(255,255,255,0.025)` })}>
                      <span style={s({ fontFamily: E.sans, fontSize: 12, color: E.body })}>{k}</span>
                      <span style={s({ fontFamily: E.mono, fontSize: 12, color, fontWeight: 500 })}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <Callout label="On using median" ch="In the highest-risk composite bucket, the mean return is +12.6% while the median is −0.8% and the geometric mean is −11.7%. A framework that reported mean as its primary metric would present this bucket as potentially attractive. The median and geometric mean tell the honest story. A small subset of large positive outcomes — structurally fragile companies that nevertheless succeeded — pulls the mean far from the typical outcome." />

            <AUCG items={[
              { val: "0.567", name: "OSMR composite",  note: "+6.7pp over random", hi: true },
              { val: "0.406", name: "Momentum proxy",  note: "Below random · composite required" },
              { val: "0.493", name: "Valuation alone", note: "Below random" },
            ]} />
            <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, lineHeight: 1.65, marginTop: 8 })}>At the top-20% threshold: precision 22.7% vs 15.8% base rate — 43% improvement over random. Median lead time: 2 months. False positive rate: 68.5%.</p>
            <CC ch={<CVaRChart />} />
            <DT
              headers={["Bucket", "Median", "Geo Mean", "CVaR (95%)", "< −25%", "N"]}
              rows={[
                [P("Very Low"),  "+10.4%", "+8.6%",  "−52.7%", "12.2%", "18,459"],
                ["Low",          "+9.6%",  "+7.0%",  "−56.8%", "13.3%", "69,636"],
                [M("Moderate"),  "+9.3%",  "+4.2%",  "−66.5%", "14.8%", "121,144"],
                [M("High"),      "+9.0%",  "+3.2%",  "−67.4%", "15.5%", "54,370"],
                [N("Very High"), "−0.8%",  "−11.7%", "−85.1%", "30.3%", "26,128"],
              ]}
            />

            <SubH ch="Portfolio-Level Results" />
            <B ch="Structural screening produces measurable portfolio-level effects. The premium decomposes into two independently verifiable contributions: an exclusion effect (removing structurally fragile companies) and a selection effect (concentrating in the lowest-risk bucket)." />
            <CC ch={<PremiumDecomp />} />
            <DT
              headers={["Index", "Ann Ret", "Sortino", "Max DD", "Months"]}
              rows={[
                ["Very Low Risk (EW, post-2013)",     G("+17.5%"), "1.261", "−34.3%", "145"],
                ["OSMR-Filtered Broad Market (CW)",   G("+14.4%"), "1.286", "−22.5%", "145"],
                ["Full Scored Universe (CW)",         "+9.8%",     "0.916", "−26.9%", "145"],
                ["SPY (external reference, approx.)", "+14–16%",   "~1.1",  "~−34%",  "—"  ],
              ]}
            />
          </section>

          <Div />

          {/* PRINCIPLES */}
          <section id="principles" style={s({ marginBottom: 64 })}>
            <Ey c="Section VI" />
            <SH ch="Design Principles" />
            <B ch="Every analytical framework makes design choices. These are not implementation details — they are the constraints that define what the framework is and is not allowed to claim." />
            <div style={s({ display: "flex", flexDirection: "column", gap: 2, marginTop: 20 })}>
              {[
                { title: "Equal weighting over empirically-derived weighting", body: "The composite weights Axis 1 and Axis 2 equally at 50% each. Axis 2 carries marginally stronger full-period signal (r = −0.056 vs −0.034), but tilting the weight toward Axis 2 improves composite r by approximately 0.006 — within bootstrap confidence interval overlap. Equal weighting is more interpretable, more stable, and less susceptible to window-specific optimization." },
                { title: "First-principles penalties, not optimized penalties", body: "The OAL shallowness penalty values were derived from structural reasoning about anchor distance before examining outcomes. This means the cohort separation is a genuine empirical test rather than circular validation. Their primary justification is structural integrity, not empirical maximization." },
                { title: "Empirical over mathematical sophistication", body: "Where simpler measures outperform complex ones, the simpler measure is used. Axis 2 uses YoY consistency rather than tanh transformation or R-squared trend fitting — both of which were tested and underperformed. Mathematical complexity is not a virtue when it disconnects the measure from the phenomenon it captures." },
                { title: "Median over mean as the default summary statistic", body: "Median is more resistant to outlier distortion and reports the central tendency honestly. Mean is shown as supplementary information with skew indicators when the gap exceeds 10 percentage points. This matters most precisely where it is most important: in the highest-risk cohort, where mean and median diverge dramatically." },
                { title: "Global ranking for cross-sectional comparability", body: "Both axes are expressed as global percentile ranks across the full universe after anchor penalties are applied. This makes scores directly comparable across companies anchored on different OAL rungs — essential for a framework designed to evaluate structural risk at the universe level." },
                { title: "Conservative anchor assignment on a trailing window", body: "OAL assignment uses the 3-year cumulative sum of the relevant financial series rather than trailing twelve months. This requires sustained demonstrated performance rather than rewarding a single strong quarter. Adjusted metrics, normalized earnings, and forward projections are not considered." },
                { title: "Static model — no regime adaptation", body: "The composite formula and axis weights do not shift based on market environment. Signal strength varies materially across regimes — as the validation section documents. A model that silently changes its weights is harder to interpret, harder to audit, and more susceptible to overfitting. Stability is a deliberate choice, not an oversight." },
              ].map(({ title, body }) => (
                <div key={title} style={s({ border: `1px solid ${E.bdr}`, background: E.bg2, padding: "18px 20px" })}>
                  <p style={s({ fontFamily: E.sans, fontSize: 13, fontWeight: 700, color: E.text, marginBottom: 8 })}>{title}</p>
                  <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.75, color: E.body })}>{body}</p>
                </div>
              ))}
            </div>
          </section>

          <Div />

          {/* LIMITATIONS */}
          <section id="limitations" style={s({ marginBottom: 64 })}>
            <Ey c="Section VII" />
            <SH ch="Known Limitations" />
            <B ch="Honest documentation of what this framework cannot do is as important as documenting what it can. The following limitations are not caveats offered defensively — they are boundaries that define the proper scope of interpretation." />
            {/* BOARD ADDITION 3 — Sandra's misuse paragraph */}
            <B ch="In practice, the most common misuse of this framework is treating Very High classifications as sell signals rather than structural risk flags. 68.5% of Very High entries do not produce severe losses in the subsequent 12 months. The framework does not tell you what to do. It tells you what structural condition a company is in." />

            <div style={s({ display: "flex", flexDirection: "column", gap: 2, marginTop: 20 })}>
              {[
                { title: "The framework is a risk state identifier, not a timing signal", body: "The framework cannot identify when a stretched valuation will correct, or when a deteriorating anchor will become visible to the market. A company can remain in Very High structural risk territory for extended periods — median Very High run length is 2 months before a loss event, but false positive sequences have the same median duration. The 68.5% false positive rate means approximately two-thirds of Very High classifications do not produce severe losses in the subsequent 12 months." },
                { title: "Signal is conditional on market regime", body: "The full-period composite Spearman r of −0.052 (Modest) reflects 17 years that include extended periods of near-zero cross-sectional signal. Pre-2020, the rank correlation is Negligible (r = −0.001). This reflects a full-distribution phenomenon: Q1–Q4 are undifferentiated in median returns pre-2020. The factor-adjusted tail premium is present in all regimes including pre-2020. Both statements are true." },
                { title: "Potential survivorship bias in pre-2020 data", body: "Companies that failed or were delisted before 2020 would almost certainly have scored in the Very High risk bucket. If those failures are underrepresented in the price history, the pre-2020 Q5 penalty is understated. The disclosed pre-2020 weakness is probably a conservative lower bound, not the true effect size." },
                { title: "The framework does not incorporate sector context", body: "A pre-revenue biotech and a pre-profitable consumer staples company both receive OAL 4 assignments. The framework treats them comparably because its mandate is cross-sectional structural risk assessment. Sector context can and should be applied as a layer of interpretation on top of OSMR scores. At the micro-cap level specifically, OAL 4 assignments may reflect genuine information inefficiency rather than narrative inflation — a distinction the framework does not make." },
                { title: "Monthly rebalancing implies non-trivial turnover", body: "The equal-weight and risk-weighted indexes rebalance monthly. Companies move across composite buckets as scores update — particularly around quarterly earnings releases. The backtest does not model the turnover costs associated with this movement. Quarterly rebalancing — not yet modeled — would reduce this friction meaningfully." },
                { title: "The framework reflects a single point in time", body: "Each snapshot is a static assessment based on three-year trailing figures and available price data. A company can move across OAL rungs and risk quintiles within a single quarter if its operational or market circumstances change materially. The platform refreshes weekly for price-sensitive components and monthly for the full structural pipeline." },
                { title: "No transaction cost or market impact modeling", body: "All index and backtest figures assume frictionless execution at month-end closing prices. Transaction costs, bid-ask spreads, and market impact are not modeled. For a broad universe with $5M ADV minimum, implementation frictions are manageable but not zero." },
                { title: "Underlying data quality is not fully characterized", body: "OSMR scores derive from Financial Modeling Prep (FMP) API data, which has known quality issues including malformed rows, gaps in quarterly history for smaller companies, and occasional stale figures. Score accuracy for companies in the lower OAL rungs should be treated with somewhat more interpretive caution than for FCF-anchored companies." },
              ].map(({ title, body }) => (
                <div key={title} style={s({ border: `1px solid ${E.bdr}`, background: "rgba(197,162,74,0.02)", padding: "16px 20px" })}>
                  <p style={s({ fontFamily: E.sans, fontSize: 13, fontWeight: 700, color: E.text, marginBottom: 8 })}>{title}</p>
                  <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.75, color: E.body })}>{body}</p>
                </div>
              ))}

              {/* BOARD ADDITIONS — Open questions */}
              <OQ title="Axis 2 cross-sectional decomposition — sign reversal" ch={
                <>
                  <p style={s({ fontFamily: E.sans, fontSize: 12.5, lineHeight: 1.7, color: E.body })}>In Fama-MacBeth cross-sectional regressions, Axis 2 carries a positive coefficient after controlling for Axis 1 (coef = +0.030, t = +2.428) — the opposite direction from the hypothesis. The most plausible mechanism: trajectory deterioration is partially mean-reverting at the individual stock level after controlling for current valuation. The composite works because both signals triangulate the same structural condition — neither works alone, as confirmed by the momentum baseline AUC of 0.406 (below random) when Axis 2 is used standalone.</p>
                  <p style={s({ fontFamily: E.sans, fontSize: 12.5, lineHeight: 1.7, color: E.body })}>This is an open question, not a refutation. The portfolio-level alpha (L/S +21.0%, t = +4.80) survives factor stripping with full confidence. Future sector-neutral and size-neutral portfolio testing will provide additional clarity.</p>
                </>
              } />

              <OQ title="Signal persistence across sub-12-month holding horizons" ch={
                <p style={s({ fontFamily: E.sans, fontSize: 12.5, lineHeight: 1.7, color: E.body })}>All validation in this document uses a 12-month forward return horizon. Whether the signal persists — or concentrates — at shorter intervals (1 month, 3 months, 6 months) has not been formally tested. It is unknown whether the factor-adjusted alpha is distributed across the holding period or concentrated near the rebalancing boundary. This distinction matters for implementation: a signal that decays rapidly after formation implies different rebalancing cadence requirements than one that accumulates gradually. Alpha decay testing is planned and will be disclosed when complete.</p>
              } />
            </div>
          </section>

          <Div />

          {/* CONCLUSION */}
          <section id="conclusion" style={s({ marginBottom: 64 })}>
            <Ey c="Section VIII" />
            <SH ch="Conclusion" />
            <B ch="OSMR was built on a specific conviction: most investors lack not information but framework — a disciplined way of asking what a company has actually demonstrated, and how far its valuation has strayed from that demonstration. The framework does not tell investors what to buy or sell. It identifies where narrative risk is concentrated, how stable the operational foundations beneath current valuations are, and whether the companies in their universe are moving toward or away from demonstrated economic viability." />
            <B ch="The empirical record across 289,737 observations and 17 years supports the core hypothesis. The signal is Modest in aggregate and Substantive during structural stress. Portfolio-level factor decomposition confirms the signal is not explained by known factors — after stripping all six factors, the long-short portfolio produces +21.0% annualized alpha (t = +4.80). The framework generates positive alpha in all three market regimes, including Expansion which accounts for 52.7% of the sample period. The OAL separation — FCF vs Revenue median spread of +26.6 percentage points — held across all regimes tested." />
            <B ch="The framework is a living system. Factor neutralization testing, quarterly rebalancing simulation, alpha decay analysis, and sector-neutral portfolio construction are planned and will be disclosed when complete. None of this is finished — but it is real, grounded in empirical performance across full market cycles, and designed to be honest about what it can and cannot tell us." />
            <Callout ch="Stewardship is about conformity to reality. The Capital Steward exists because investors are better served by honest structural thinking — even when that thinking produces ambiguous answers — than by confident narratives that obscure the distance between what a company is worth and what it has actually demonstrated." />
          </section>

          <Div />

          {/* APPENDIX */}
          <section id="appendix" style={s({ marginBottom: 64 })}>
            <Ey c="Appendix" />
            <SH ch="Methodology Summary" />
            <div style={s({ border: `1px solid ${E.bdr}`, overflow: "hidden" })}>
              <table style={s({ width: "100%", borderCollapse: "collapse" })}>
                <tbody>
                  {[
                    { f: "Universe",        v: "~5,200 U.S. equity securities. Data: FMP API. $5M minimum ADV · $50M minimum market cap applied before scoring. Refreshed weekly (snapshot) and monthly (full pipeline)." },
                    { f: "Backtest",        v: "289,737 observations · 2009-01 through 2025-02 formation window · 12-month forward return horizon · $5 minimum price filter at formation · bootstrap 95% CI (1,000 samples)." },
                    { f: "OAL Assignment",  v: "FCF → NI → EBIT → Revenue in sequence; assigned to first qualifying rung based on positive 3-year cumulative figure. Negative EV companies excluded. No adjusted or normalized metrics considered." },
                    { f: "Axis 1",          v: "log(EV / anchor_3yr) + OAL_shallowness_penalty → global percentile rank (ascending = more risk). Penalties: FCF=0, NI=1.0, EBIT=1.618, Rev=4.236." },
                    { f: "Axis 2",          v: "YoY consistency score across up to 28 quarters + OAL_shallowness_penalty → global percentile rank. Four most recent YoY comparisons receive double weight. 28-quarter window is a first-principles design choice, not empirically optimized." },
                    { f: "Composite",       v: "(axis1_pct + axis2_pct) / 2. Equal weight. Percentile rank across full universe. Long-run static model — weights do not shift across market regimes." },
                    { f: "Factor Analysis", v: "L/S portfolio (Very Low minus Very High) regressed on FF5 + Momentum: α = +21.0% annualized, t = +4.80, R² = 0.051. Pre-2020: α = +23.9%, t = +5.84. Post-COVID: α = +20.0%, t = +2.15." },
                    { f: "Classification",  v: "Binary classification of severe losses (12m return < −25%). OSMR AUC = 0.567 vs momentum baseline 0.406 (below random) vs valuation baseline 0.493. Top-20% threshold: precision 22.7% vs 15.8% base rate. False positive rate 68.5%. Median lead time 2 months." },
                    { f: "Bucket Labels",   v: "Very Low (0–20th pct) / Low (20–40th) / Moderate (40–60th) / High (60–80th) / Very High (80–100th). Higher bucket = more structural risk." },
                    { f: "Index Construction", v: "EW: simple average of 1-month returns, monthly rebalancing. CW: market-cap weighted average. Price filter ≥$5 at formation. Transaction costs and monthly turnover not modeled." },
                  ].map(({ f, v }, i) => (
                    <tr key={f} style={s({ borderBottom: i < 9 ? `1px solid rgba(255,255,255,0.03)` : "none" })}>
                      <td style={s({ fontFamily: E.sans, fontSize: 12.5, fontWeight: 700, color: E.text, padding: "14px 18px", verticalAlign: "top", whiteSpace: "nowrap", width: 150, background: E.bg2 })}>{f}</td>
                      <td style={s({ fontFamily: E.sans, fontSize: 12.5, color: E.body, padding: "14px 18px", lineHeight: 1.65, background: E.bg })}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CTA */}
          <div style={s({ borderTop: `2px solid ${E.gold}`, background: E.gatm, padding: "32px 0 0", marginTop: 48 })}>
            <h3 style={s({ fontFamily: E.sans, fontSize: 22, fontWeight: 800, color: E.text, letterSpacing: "-0.03em", marginBottom: 10 })}>The system is live.</h3>
            <p style={s({ fontFamily: E.sans, fontSize: 13, color: E.body, lineHeight: 1.75, marginBottom: 22, maxWidth: 480 })}>The structural map, cohort grids, and company profiles described here are updated on a weekly cadence and accessible in the platform now.</p>
            <div style={s({ display: "flex", flexWrap: "wrap", gap: 10 })}>
              <Link href="/platform" style={s({ fontFamily: E.sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "11px 24px", background: E.gold, color: "#060504", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 })}>
                Open Platform <ArrowRight size={14} />
              </Link>
              <Link href="/how-to-use-osmr" style={s({ fontFamily: E.sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "11px 20px", background: "transparent", color: E.muted, border: `1px solid ${E.bdr2}`, textDecoration: "none" })}>
                How to Use OSMR
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div style={s({ borderTop: `1px solid ${E.bdr}`, padding: "28px 44px", textAlign: "center" })}>
        <p style={s({ fontFamily: E.mono, fontSize: 10, color: E.muted, lineHeight: 1.7 })}>
          The Capital Steward, LLC · thecapitalsteward.com · inquiries@thecapitalsteward.com<br />
          © 2026 The Capital Steward, LLC. All rights reserved. For informational purposes only. Not investment advice.
        </p>
      </div>

    </main>
  )
}