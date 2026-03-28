'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Cell, ResponsiveContainer,
} from "recharts"

// ─────────────────────────────────────────────────────────────────────────────
// FONTS — loaded via next/font or global CSS. Add to globals.css:
// @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap');
// Then set: --font-serif: 'DM Serif Display'; --font-sans: 'DM Sans';
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// DATA — all numbers from validated backtest suite (289,737 obs, 2009–2026)
// Sources: 02–09_summary · 17_factor_decomposition · 18_classification · 20_regime_signal
// Locked 2026-03
// ─────────────────────────────────────────────────────────────────────────────

const REGIME_DATA = [
  { regime: "Pre-2020\n2009–2019", r: -0.0013, label: "Negligible",  n: "160,705", color: "#8A92A0" },
  { regime: "COVID\n2020–2021",    r: -0.1454, label: "Substantive", n: "47,524",  color: "#244636" },
  { regime: "Post-COVID\n2022–26", r: -0.0913, label: "Substantive", n: "81,508",  color: "#244636" },
  { regime: "Full Period\n2009–26", r: -0.0518, label: "Modest",     n: "289,737", color: "#1B4080" },
]

const OAL_RETURN_DATA = [
  { rung: "FCF",     median: 9.8,   color: "#244636" },
  { rung: "NI",      median: 4.0,   color: "#1B4080" },
  { rung: "EBIT",    median: 2.5,   color: "#7A5C2E" },
  { rung: "Revenue", median: -16.7, color: "#8B3A2A" },
]

const QUINTILE_DATA = [
  { q: "Q1\nLowest",  composite: 9.8 },
  { q: "Q2",          composite: 9.6 },
  { q: "Q3",          composite: 9.0 },
  { q: "Q4",          composite: 9.8 },
  { q: "Q5\nHighest", composite: 4.9 },
]

const INDEX_DATA = [
  { name: "Very Low\n(EW, post-2013)",  ann: 17.5, color: "#244636" },
  { name: "OSMR-Filtered\n(CW)",        ann: 14.4, color: "#1B4080" },
  { name: "Full Universe\n(CW)",        ann: 9.8,  color: "#C4C8C0" },
  { name: "SPY\n(approx.)",             ann: 15.0, color: "#8A92A0" },
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

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const T = {
  navy:        "#0A1F3D",
  navyDeep:    "#071629",
  green:       "#244636",
  greenAccent: "#6DAE8B",
  greenSoft:   "#E8EFE9",
  cream:       "#F4F2EE",
  creamDark:   "#EDE9E2",
  border:      "#D8D4CC",
  muted:       "#8A92A0",
  body:        "#4A5260",
  ink:         "#1E2228",
  blue:        "#1B4080",
  rust:        "#8B3A2A",
  sand:        "#7A5C2E",
  white:       "#FFFFFF",
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED CHART STYLE
// ─────────────────────────────────────────────────────────────────────────────

const CS = { fontSize: 10.5, fontFamily: "'DM Sans', system-ui, sans-serif", color: T.body }

// ─────────────────────────────────────────────────────────────────────────────
// CHART COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function RegimeChart() {
  return (
    <div>
      <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }} className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8A92A0] mb-5">
        Composite Spearman r · 289,737 obs · 2009–2026
      </p>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={REGIME_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 36 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="2 4" stroke="#E0DCD4" vertical={false} />
          <XAxis dataKey="regime" tick={{ ...CS, fill: T.body, lineHeight: 1.4 }} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={{ ...CS, fill: T.muted }} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(2)} domain={[-0.18, 0.08]} width={36} />
          <ReferenceLine y={0} stroke={T.border} strokeWidth={1} />
          <Tooltip
            formatter={(v) => [v != null ? Number(v).toFixed(4) : "—", "Spearman r"]}
            contentStyle={{ fontSize: 11, fontFamily: "'DM Sans', system-ui", borderColor: T.border, borderRadius: 6, background: T.white, boxShadow: "0 4px 20px rgba(10,31,61,0.08)" }}
          />
          <Bar dataKey="r" radius={[3, 3, 0, 0]}>
            {REGIME_DATA.map((d, i) => <Cell key={i} fill={d.color} opacity={d.label === "Negligible" ? 0.35 : 0.9} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {[
          { color: T.green,  label: "Substantive  |r| ≥ 0.11" },
          { color: T.blue,   label: "Modest  0.05–0.07" },
          { color: T.muted,  label: "Negligible  |r| < 0.03", faint: true },
        ].map(({ color, label, faint }) => (
          <span key={label} style={{ fontFamily: "'DM Sans', system-ui" }} className="flex items-center gap-1.5 text-[10.5px] text-[#8A92A0]">
            <span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: color, opacity: faint ? 0.4 : 1 }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function YearByYearChart() {
  return (
    <div>
      <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }} className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8A92A0] mb-5">
        Composite Spearman r · year by year · 2009–2025
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={YEAR_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barCategoryGap="15%">
          <CartesianGrid strokeDasharray="2 4" stroke="#E0DCD4" vertical={false} />
          <XAxis dataKey="year" tick={{ ...CS, fill: T.body }} axisLine={false} tickLine={false} />
          <YAxis tick={{ ...CS, fill: T.muted }} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(2)} domain={[-0.32, 0.12]} width={36} />
          <ReferenceLine y={0} stroke={T.border} strokeWidth={1} />
          <Tooltip formatter={(v) => [v != null ? Number(v).toFixed(4) : "—", "Spearman r"]} contentStyle={{ fontSize: 11, fontFamily: "'DM Sans', system-ui", borderColor: T.border, borderRadius: 6, background: T.white, boxShadow: "0 4px 20px rgba(10,31,61,0.08)" }} />
          <Bar dataKey="r" radius={[2, 2, 0, 0]}>
            {YEAR_DATA.map((d, i) => (
              <Cell key={i}
                fill={d.r < -0.11 ? T.green : d.r < -0.03 ? T.blue : d.r > 0.03 ? T.rust : T.muted}
                opacity={Math.abs(d.r) < 0.03 ? 0.35 : 0.88}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontFamily: "'DM Sans', system-ui" }} className="mt-2.5 text-[10.5px] leading-5 text-[#8A92A0]">
        Red bars indicate signal inversion. 2019 peak inversion (r = +0.0779) marks the narrative premium expansion peak. 2021 signal (r = −0.2684) reflects its collapse.
      </p>
    </div>
  )
}

function OALReturnChart() {
  return (
    <div>
      <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }} className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8A92A0] mb-5">
        Median 12-month return · by OAL anchor rung · 289,745 obs
      </p>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={OAL_RETURN_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="2 4" stroke="#E0DCD4" vertical={false} />
          <XAxis dataKey="rung" tick={{ ...CS, fill: T.body }} axisLine={false} tickLine={false} />
          <YAxis tick={{ ...CS, fill: T.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[-24, 14]} width={36} />
          <ReferenceLine y={0} stroke={T.border} strokeWidth={1} />
          <Tooltip formatter={(v) => [v != null ? `${Number(v).toFixed(1)}%` : "—", "Median return"]} contentStyle={{ fontSize: 11, fontFamily: "'DM Sans', system-ui", borderColor: T.border, borderRadius: 6, background: T.white, boxShadow: "0 4px 20px rgba(10,31,61,0.08)" }} />
          <Bar dataKey="median" radius={[3, 3, 0, 0]}>
            {OAL_RETURN_DATA.map((d, i) => <Cell key={i} fill={d.color} opacity={0.88} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontFamily: "'DM Sans', system-ui" }} className="mt-2.5 text-[10.5px] text-[#8A92A0]">
        FCF vs Revenue spread: +26.6 percentage points. Held across all regimes tested.
      </p>
    </div>
  )
}

function QuintileChart() {
  return (
    <div>
      <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }} className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8A92A0] mb-5">
        Median 12-month return · by composite quintile · Q1 = lowest risk
      </p>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={QUINTILE_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="2 4" stroke="#E0DCD4" vertical={false} />
          <XAxis dataKey="q" tick={{ ...CS, fill: T.body }} axisLine={false} tickLine={false} />
          <YAxis tick={{ ...CS, fill: T.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 13]} width={36} />
          <Tooltip formatter={(v, name) => [v != null ? `${Number(v).toFixed(1)}%` : "—", name]} contentStyle={{ fontSize: 11, fontFamily: "'DM Sans', system-ui", borderColor: T.border, borderRadius: 6, background: T.white, boxShadow: "0 4px 20px rgba(10,31,61,0.08)" }} />
          <Bar dataKey="composite" name="Composite" fill={T.navy} radius={[3, 3, 0, 0]} opacity={0.88} />
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontFamily: "'DM Sans', system-ui" }} className="mt-2.5 text-[10.5px] leading-5 text-[#8A92A0]">
        Signal concentrates in Q5: geo mean −4.3%, hit rate 55.5%. Q1–Q4 are largely undifferentiated — the framework is a risk state identifier, not a return-optimization engine.
      </p>
    </div>
  )
}

function BucketRiskChart() {
  return (
    <div>
      <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }} className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#8A92A0] mb-5">
        CVaR (95%) · average loss in worst 5% of 12-month windows
      </p>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={BUCKET_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} layout="vertical" barCategoryGap="22%">
          <CartesianGrid strokeDasharray="2 4" stroke="#E0DCD4" horizontal={false} />
          <XAxis type="number" tick={{ ...CS, fill: T.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[-100, 0]} />
          <YAxis type="category" dataKey="bucket" tick={{ ...CS, fill: T.body }} axisLine={false} tickLine={false} width={72} />
          <ReferenceLine x={0} stroke={T.border} />
          <Tooltip formatter={(v) => [v != null ? `${Number(v).toFixed(1)}%` : "—", "CVaR (95%)"]} contentStyle={{ fontSize: 11, fontFamily: "'DM Sans', system-ui", borderColor: T.border, borderRadius: 6, background: T.white, boxShadow: "0 4px 20px rgba(10,31,61,0.08)" }} />
          <Bar dataKey="cvar" radius={[0, 3, 3, 0]}>
            {BUCKET_DATA.map((d, i) => (
              <Cell key={i} opacity={0.88} fill={
                d.bucket === "Very Low" ? T.green : d.bucket === "Low" ? "#3E6B4F" :
                d.bucket === "Moderate" ? T.muted : d.bucket === "High" ? "#BC6464" : T.rust
              } />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontFamily: "'DM Sans', system-ui" }} className="mt-2.5 text-[10.5px] text-[#8A92A0]">
        Very High bucket: 30.3% of observations ended below −25% over 12 months. Very Low: 12.2%.
      </p>
    </div>
  )
}

// Return band distribution
function DistributionChart() {
  const bands = [
    { range: "< −50%",      vl: 2.4,  vh: 16.7 },
    { range: "−50 to −25%", vl: 9.8,  vh: 13.6 },
    { range: "−25 to 0%",   vl: 25.4, vh: 29.4 },
    { range: "0 to +25%",   vl: 29.4, vh: 31.2 },
    { range: "+25 to +50%", vl: 20.4, vh: 5.9  },
    { range: "> +50%",      vl: 12.6, vh: 3.2  },
  ]
  const maxVal = 38
  return (
    <div>
      <div className="flex gap-5 mb-4">
        {[{ color: T.green, label: "Very Low composite" }, { color: T.rust, label: "Very High composite" }].map(({ color, label }) => (
          <div key={label} style={{ fontFamily: "'DM Sans', system-ui" }} className="flex items-center gap-1.5 text-xs text-[#4A5260]">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color, opacity: 0.85 }} />
            {label}
          </div>
        ))}
      </div>
      <div className="space-y-2.5">
        {bands.map(({ range, vl, vh }) => (
          <div key={range} className="flex items-center gap-3">
            <div style={{ fontFamily: "'DM Sans', system-ui" }} className="w-28 text-right text-[10.5px] text-[#8A92A0] shrink-0">{range}</div>
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <div className="h-3 rounded-sm transition-all" style={{ width: `${(vl / maxVal) * 100}%`, backgroundColor: T.green, opacity: 0.82 }} />
                <span style={{ fontFamily: "'DM Sans', system-ui" }} className="text-[10px] text-[#5C6472]">{vl}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 rounded-sm" style={{ width: `${(vh / maxVal) * 100}%`, backgroundColor: T.rust, opacity: 0.82 }} />
                <span style={{ fontFamily: "'DM Sans', system-ui" }} className="text-[10px] text-[#5C6472]">{vh}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: "'DM Sans', system-ui" }} className="text-[10.5px] text-[#8A92A0] mt-3.5">
        % of observations in each return band · Very Low N=18,459 · Very High N=26,128
      </p>
    </div>
  )
}

// Premium decomposition
function PremiumDecomposition() {
  const bars = [
    { label: "Full universe\n(cap-weighted)",       val: 9.8,  baseline: true  },
    { label: "OSMR-filtered\n(exclusion only, CW)", val: 14.4, baseline: false },
    { label: "Very Low only\n(post-2013, EW)",       val: 17.5, baseline: false },
  ]
  const max = 20
  return (
    <div>
      <div className="flex items-end gap-5 h-36 mb-4">
        {bars.map(({ label, val, baseline }) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
            <div style={{ fontFamily: "'DM Sans', system-ui", color: baseline ? T.muted : T.navy }} className="text-sm font-semibold">
              +{val}%
            </div>
            <div className="w-full rounded-t" style={{ height: `${(val / max) * 110}px`, backgroundColor: baseline ? "#D8D4CC" : T.greenAccent, opacity: baseline ? 0.7 : 0.9 }} />
          </div>
        ))}
      </div>
      <div className="flex gap-5">
        {bars.map(({ label }) => (
          <div key={label} style={{ fontFamily: "'DM Sans', system-ui" }} className="flex-1 text-center text-[10px] text-[#8A92A0] leading-tight whitespace-pre-line">{label}</div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-[#E0DCD4] space-y-2">
        {[
          { label: "Exclusion effect (removing High/Very High)", val: "+4.6pp" },
          { label: "Selection effect (Very Low only, post-2013)", val: "+3.1pp" },
        ].map(({ label, val }) => (
          <div key={label} style={{ fontFamily: "'DM Sans', system-ui" }} className="flex justify-between text-xs text-[#4A5260]">
            <span>{label}</span>
            <span className="font-semibold" style={{ color: T.green }}>{val}</span>
          </div>
        ))}
        <div style={{ fontFamily: "'DM Sans', system-ui", color: T.navy }} className="flex justify-between text-xs font-semibold pt-2 border-t border-[#E0DCD4]">
          <span>Total Very Low premium vs full universe</span>
          <span>+7.7pp annualized</span>
        </div>
      </div>
      <p style={{ fontFamily: "'DM Sans', system-ui" }} className="text-[10.5px] text-[#8A92A0] mt-2">
        Post-2013 · 145 months · transaction costs and turnover not modeled
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OAL RUNGS
// ─────────────────────────────────────────────────────────────────────────────

const OAL_RUNGS = [
  { code: "FCF",  label: "Free Cash Flow", desc: "Positive 3-year cumulative FCF", count: "~2,900", color: T.green,  bg: "#EBF2EC", border: "#C0D4C4", empirical: "+9.8% median · +6.1% geo · 62.7% hit rate" },
  { code: "NI",   label: "Net Income",     desc: "Profitable but not FCF-positive", count: "~622",   color: T.blue,   bg: "#EAF0F8", border: "#C0CDE8", empirical: "+4.0% median · −5.7% geo · 54.6% hit rate" },
  { code: "EBIT", label: "EBIT",           desc: "Operating income positive",       count: "~111",   color: T.sand,   bg: "#F5EFE6", border: "#DDD0B8", empirical: "+2.5% median · −0.3% geo · 52.3% hit rate" },
  { code: "Rev",  label: "Revenue",        desc: "Cannot cover operating costs",   count: "~1,163", color: T.rust,   bg: "#F8EDEB", border: "#E8C8C0", empirical: "−16.7% median · −22.9% geo · 39.7% hit rate" },
  { code: "—",    label: "Non-Viable",     desc: "Zero or negative revenue",       count: "~372",   color: T.muted,  bg: T.cream,   border: T.border,  empirical: "Excluded from scoring universe" },
]

// ─────────────────────────────────────────────────────────────────────────────
// AXIS ACCORDION
// ─────────────────────────────────────────────────────────────────────────────

const AXES = [
  {
    id: "axis1", label: "Axis 1", name: "Operational Anchor Risk", r: "−0.034",
    question: "How far does the valuation extend beyond demonstrated operational output?",
    body: `Axis 1 measures the distance between a company's Enterprise Value and its deepest credible operational anchor — adjusted for the shallowness of that anchor.

The formula: log(EV / 3-year cumulative anchor) + OAL_penalty → global percentile rank.

The 3-year cumulative anchor is deliberate. A company must have demonstrated positive free cash flow (or net income, EBIT, or revenue) over a full three-year trailing window, not just in the most recent quarter. The shallowness penalty encodes the structural distance between OAL rungs: a revenue-anchored company is treated as approximately 13.5× more expensive relative to its anchor than an FCF-anchored company at the same raw multiple.

Axis 1 produces its strongest signal during periods of structural stress and dislocation. In calm bull markets where narrative valuations are broadly rewarded, the signal is attenuated — which is both expected and disclosed.`,
  },
  {
    id: "axis2", label: "Axis 2", name: "Operational Trajectory Risk", r: "−0.056",
    question: "Is the operational foundation strengthening or eroding?",
    body: `Axis 2 captures trajectory, not position. A company moving toward demonstrated cash generation is shortening its narrative bridge. A company whose anchor metric is deteriorating is lengthening it — accumulating structural risk regardless of where its price currently sits.

The score is derived from year-over-year comparisons across up to 28 quarters of history, adjusted by an OAL shallowness penalty and ranked globally. The four most recent year-over-year comparisons receive double weight — current trajectory is more relevant to current structural risk than data from six years prior.

Axis 2 is the stronger and more consistent signal across the validation period, carrying meaningful signal even in the pre-2020 decade where Axis 1 was near zero.

Design note: Year-over-year consistency outperformed tanh transformation and R-squared trend fitting in empirical validation. Mathematical sophistication is not a virtue when it disconnects the measure from the phenomenon it captures.`,
  },
]

function AxisAccordion() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="space-y-2">
      {AXES.map(({ id, label, name, r, question, body }) => {
        const isOpen = open === id
        return (
          <div key={id} className="overflow-hidden transition-all" style={{ border: `1px solid ${isOpen ? "#C8D4C0" : T.border}`, borderRadius: 10, background: isOpen ? "#FAFAF8" : T.white }}>
            <button
              onClick={() => setOpen(isOpen ? null : id)}
              className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#F7F5F0]"
            >
              <div className="flex items-center gap-4">
                <span style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="text-[10px] font-semibold uppercase tracking-[0.18em]">{label}</span>
                <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: T.navy }} className="text-base font-normal">{name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: "'DM Sans', system-ui", color: isOpen ? T.green : T.muted }} className="text-[10.5px] hidden sm:block font-medium">r = {r}</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform" style={{ color: T.muted, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
              </div>
            </button>
            {isOpen && (
              <div className="px-6 pb-6 border-t" style={{ borderColor: "#E0DCD4" }}>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.greenAccent }} className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em]">{question}</p>
                <div className="mt-4 space-y-3.5">
                  {body.split("\n\n").map((para, i) => (
                    <p key={i} style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm">{para}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION NAV
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "framing",     label: "Framing",          num: "00" },
  { id: "problem",     label: "The Problem",       num: "I"  },
  { id: "oal",         label: "Anchor Ladder",     num: "II" },
  { id: "axes",        label: "The Axes",          num: "III"},
  { id: "composite",   label: "Composite Score",   num: "IV" },
  { id: "validation",  label: "Validation",        num: "V"  },
  { id: "principles",  label: "Design Principles", num: "VI" },
  { id: "limitations", label: "Limitations",       num: "VII"},
  { id: "conclusion",  label: "Conclusion",        num: "VIII"},
  { id: "appendix",    label: "Appendix",          num: "—"  },
]

// ─────────────────────────────────────────────────────────────────────────────
// REUSABLE PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function Eyebrow({ children, color = T.greenAccent }: { children: React.ReactNode; color?: string }) {
  return (
    <p style={{ fontFamily: "'DM Sans', system-ui", color, letterSpacing: "0.18em" }}
       className="text-[10px] font-semibold uppercase">
      {children}
    </p>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: T.navy }}
        className="mt-2 text-[1.75rem] leading-tight md:text-[2.1rem]">
      {children}
    </h2>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: T.navy }}
        className="text-xl mt-8 mb-2">
      {children}
    </h3>
  )
}

function Body({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.8 }}
       className={`text-[0.925rem] ${className}`}>
      {children}
    </p>
  )
}

function NavyBox({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl px-6 py-5" style={{ background: T.navy }}>
      {label && <p style={{ fontFamily: "'DM Sans', system-ui", color: "#7FA8CC", letterSpacing: "0.14em" }} className="text-[10px] font-semibold uppercase mb-2">{label}</p>}
      <p style={{ fontFamily: "'DM Sans', system-ui", color: "#B8CCE0", lineHeight: 1.75 }} className="text-sm">{children}</p>
    </div>
  )
}

function AccentBox({ children, borderColor = T.green }: { children: React.ReactNode; borderColor?: string }) {
  return (
    <div className="mt-6 rounded-xl px-6 py-5" style={{ borderLeft: `3px solid ${borderColor}`, background: T.white, boxShadow: "0 1px 6px rgba(10,31,61,0.04)" }}>
      {children}
    </div>
  )
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl ${className}`} style={{ border: `1px solid ${T.border}`, background: T.white, boxShadow: "0 1px 8px rgba(10,31,61,0.05)" }}>
      {children}
    </div>
  )
}

function OpenQuestionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl px-6 py-5" style={{ border: `1.5px solid ${T.border}`, background: T.white }}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 rounded px-2 py-0.5" style={{ background: T.cream }}>
          <span style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, letterSpacing: "0.12em" }} className="text-[9.5px] font-bold uppercase">Open Question</span>
        </div>
        <div>
          <h4 style={{ fontFamily: "'DM Sans', system-ui", color: T.navy }} className="text-sm font-semibold">{title}</h4>
          <div className="mt-2 space-y-2">{children}</div>
        </div>
      </div>
    </div>
  )
}

function TableSm({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${T.border}` }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.cream }}>
            {headers.map((h, i) => (
              <th key={i} style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, letterSpacing: "0.1em" }}
                  className={`px-4 py-3 text-[10px] font-semibold uppercase ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: T.border }}>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: T.white }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ fontFamily: "'DM Sans', system-ui", color: T.body }}
                    className={`px-4 py-3 text-sm ${ci === 0 ? "text-left" : "text-right"}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function OsmrMethodology() {
  const [activeSection, setActiveSection] = useState("framing")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) })
      },
      { rootMargin: "-30% 0px -60% 0px" }
    )
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <main className="min-h-screen" style={{ background: T.cream, color: T.ink }}>

      {/* ── Document header ─────────────────────────────────────────────── */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <div className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <Eyebrow>The Capital Steward · Methodology · 2026</Eyebrow>

          <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: T.navy }}
              className="mt-4 text-[2.4rem] leading-[1.15] md:text-[3.2rem]">
            How We Measure<br className="hidden md:block" /> Structural Risk
          </h1>

          <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.8 }}
             className="mt-6 text-[1.05rem] max-w-2xl">
            Most valuation frameworks ask how much a company is worth. This one
            asks a different question: how well-grounded is that valuation in
            what the company has actually demonstrated? The gap between these two
            questions is where structural investment risk accumulates — before it
            becomes visible in price.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
            {["~5,200 U.S. equities · $5M ADV filter · $50M market cap floor", "289,737 historical observations · 2009–2026"].map(s => (
              <span key={s} style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="text-[0.8rem]">{s}</span>
            ))}
          </div>

          {/* Section nav */}
          <nav className="mt-8 flex flex-wrap gap-1.5">
            {SECTIONS.map(({ id, label }) => (
              <a key={id} href={`#${id}`}
                 style={{
                   fontFamily: "'DM Sans', system-ui",
                   color: activeSection === id ? T.navy : T.body,
                   borderColor: activeSection === id ? "#B8CCAA" : T.border,
                   background: activeSection === id ? T.greenSoft : T.cream,
                 }}
                 className="rounded-lg border px-3 py-1.5 text-[10.5px] font-medium transition-all hover:border-[#B8CCAA] hover:bg-[#EBF2EC] hover:text-[#0A1F3D]">
                {label}
              </a>
            ))}
          </nav>

          <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, lineHeight: 1.65 }}
             className="mt-5 text-[10.5px] max-w-2xl">
            All quantitative figures reflect a recent snapshot of the dataset.
            Universe counts, OAL rung distributions, and observation totals are
            snapshot-dependent values, not permanent constants. The dataset
            refreshes weekly; the full structural pipeline recalibrates monthly.
            Backtest results are historical and do not guarantee future outcomes.
          </p>
        </div>
      </div>

      {/* ── Document body ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex gap-12">

          {/* Sticky sidebar — desktop only */}
          <aside className="hidden xl:block w-44 shrink-0">
            <div className="sticky top-8 space-y-0.5">
              {SECTIONS.map(({ id, label, num }) => (
                <a key={id} href={`#${id}`}
                   style={{
                     fontFamily: "'DM Sans', system-ui",
                     color: activeSection === id ? T.navy : T.muted,
                     borderLeft: `2px solid ${activeSection === id ? T.greenAccent : "transparent"}`,
                   }}
                   className="flex items-baseline gap-2.5 py-1.5 pl-3 pr-1 text-[11px] transition-all hover:text-[#0A1F3D]">
                  <span className="shrink-0 text-[9px] opacity-50 font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>{num}</span>
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-20">

            {/* ── FRAMING ───────────────────────────────────────────────── */}
            <section id="framing">
              <Eyebrow>Framing</Eyebrow>
              <SectionHeading>Most analysis begins with stories. We begin with structure.</SectionHeading>
              <div className="mt-5 space-y-4">
                <Body>
                  Markets are driven as much by perception as by operating reality.
                  A company will point to the deepest operational anchor it can
                  credibly claim. If it can justify its valuation with free cash
                  flow, it will. If it cannot, it ascends the financial statement —
                  to earnings, to operating income, to revenue — until it finds a
                  metric the market will accept. Each step up the ladder lengthens
                  the narrative bridge between price and economic reality.
                </Body>
                <Body>
                  The Capital Steward exists to measure that bridge. Narratives are
                  constrained by structure. Valuations must ultimately reconcile with
                  operating reality. Cash generation cannot be substituted
                  indefinitely. A company with robust, deep operational anchoring
                  does not need narrative to justify its price. Structure eventually
                  speaks for itself.
                </Body>
              </div>
              <NavyBox>
                OSMR applies first-principle structural reasoning to equity analysis.
                It tests the hypothesis that companies grounded in operational
                reality outperform those whose valuations rest on narrative.
                Multiple years of data confirm this. The framework is a validated
                theory of structural fragility.
              </NavyBox>
            </section>

            {/* ── THE PROBLEM ───────────────────────────────────────────── */}
            <section id="problem">
              <Eyebrow>Section I</Eyebrow>
              <SectionHeading>The Problem with Valuation</SectionHeading>
              <div className="mt-5 space-y-4">
                <Body>
                  Every stock price is a statement of belief. When a market assigns
                  a company an enterprise value of $10 billion, it is not recording
                  a fact — it is expressing a judgment about what the company's
                  future cash generation will justify. That judgment is, at its
                  core, a narrative.
                </Body>
                <Body>
                  This is not a criticism. Narrative is inseparable from valuation.
                  Every multiple — price-to-earnings, EV-to-EBITDA, price-to-sales
                  — is a present-value claim about future performance. The multiple
                  is the price of believing the story. Standard valuation analysis
                  focuses on whether the story is plausible. What it rarely asks is:
                  what happens to the valuation if the story stops being believed?
                  And how far is the story from anything the company has actually
                  demonstrated?
                </Body>
              </div>

              <AccentBox>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.navy, lineHeight: 1.7 }} className="text-sm font-medium">
                  There is a meaningful difference between a company valued at 40×
                  free cash flow and a company valued at 40× revenue. Both trade at
                  the same nominal multiple. But the first has demonstrated the
                  ability to convert revenue into cash after all obligations. The
                  second's valuation depends entirely on the market continuing to
                  believe it will eventually do something it has not yet done.
                </p>
              </AccentBox>

              <NavyBox label="A note on scope">
                OSMR does not claim to identify mispriced securities or predict
                return outcomes. A company with very high structural risk may
                continue to appreciate for months or years if the narrative
                sustaining its valuation remains intact. The framework measures
                the structure of risk, not its timing — a distinction this
                document returns to throughout.
              </NavyBox>
            </section>

            {/* ── OAL ───────────────────────────────────────────────────── */}
            <section id="oal">
              <Eyebrow>Section II</Eyebrow>
              <SectionHeading>The Operational Anchor Ladder</SectionHeading>
              <div className="mt-5 space-y-4">
                <Body>
                  The Operational Anchor Ladder (OAL) is the governance construct
                  at the heart of OSMR. It answers a single question for every
                  company in the universe: what is the deepest, most credible
                  financial rung this company has actually demonstrated over the
                  trailing three years?
                </Body>
                <Body>
                  The word <em>deepest</em> is deliberate. It refers not to the
                  size of the financial figure but to its proximity to actual cash
                  generation. Free cash flow is the deepest anchor because it
                  represents what a company has genuinely produced after all
                  capital requirements. Revenue is the shallowest anchor because
                  it tells us only that the company sold something — not whether
                  that sale moved it any closer to economic viability.
                </Body>
              </div>

              {/* OAL ladder */}
              <Card className="mt-8 overflow-hidden">
                <div className="px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                  <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, letterSpacing: "0.14em" }} className="text-[10px] font-semibold uppercase">Operational Anchor Ladder</p>
                  <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="mt-0.5 text-[10.5px]">Deepest anchor → most narrative-dependent · 12-month return distributions</p>
                </div>
                <div>
                  {OAL_RUNGS.map(({ code, label, desc, count, color, bg, border, empirical }, i) => (
                    <div key={code}>
                      <div className="px-6 py-4" style={{ borderLeft: `3px solid ${color}`, opacity: code === "—" ? 0.55 : 1 }}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <span style={{ fontFamily: "'DM Sans', system-ui", backgroundColor: bg, color, border: `1px solid ${border}` }}
                                  className="inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-[10.5px] font-bold shrink-0">
                              {code}
                            </span>
                            <div>
                              <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: T.navy }} className="text-sm">{label}</div>
                              <div style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="text-[10.5px] mt-0.5">{desc}</div>
                            </div>
                          </div>
                          <span style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="text-[10.5px] shrink-0 text-right">{count} cos.</span>
                        </div>
                        {code !== "—" && (
                          <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="mt-2 ml-[3.25rem] text-[10.5px]">{empirical}</p>
                        )}
                      </div>
                      {i < OAL_RUNGS.length - 1 && (
                        <div className="flex justify-center py-1" style={{ color: T.border }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="px-6 py-3 text-center" style={{ borderTop: `1px solid ${T.border}`, background: T.cream }}>
                  <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body }} className="text-[10.5px]">
                    Each step up the ladder increases narrative dependence — and structural risk. FCF–Revenue spread: +26.6pp held across all regimes.
                  </p>
                </div>
              </Card>

              {/* OAL chart */}
              <Card className="mt-5 px-6 py-5">
                <OALReturnChart />
              </Card>

              <AccentBox>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, letterSpacing: "0.14em" }} className="text-[10px] font-semibold uppercase mb-2">Empirical confirmation</p>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm">
                  The 26.6pp spread between FCF median returns (+9.8%) and Revenue
                  median returns (−16.7%) across 289,745 observations is stable across
                  all market regimes tested. Anchor depth is the most durable signal in the framework.
                </p>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm mt-2">
                  Cross-sectional factor analysis provides independent confirmation.
                  In Fama-MacBeth regressions, being in the NI anchor rung rather than FCF
                  costs 10.7 percentage points of annual return (t = −10.113),
                  after controlling for all axis scores, size, and standard factors.
                </p>
              </AccentBox>

              <SubHeading>The Assignment Logic</SubHeading>
              <Body>
                Each company is evaluated against the OAL rungs in descending
                order — FCF first, then Net Income, then EBIT, then Revenue —
                and assigned to the first rung it qualifies for on a three-year
                cumulative basis. A 3-year window requires sustained demonstrated
                performance rather than rewarding a single anomalous quarter.
                Adjusted metrics, normalized earnings, and forward projections
                are not considered.
              </Body>

              <SubHeading>The Shallowness Penalty</SubHeading>
              <Body>
                Two companies trading at the same enterprise value multiple are
                not comparably risky if they are anchored on different OAL rungs.
                The shallowness penalty encodes this: a proportional risk
                adjustment applied to the axis scores based on anchor depth.
                After adjustment, a revenue-anchor company is treated as
                approximately 13.5× more expensive relative to its anchor than
                an FCF-anchor company at the same raw multiple.
              </Body>
              <Body className="mt-3">
                The specific penalty values were derived from first-principles
                reasoning about the structural distance between rungs — calibrated
                before examining outcomes, which means the cohort separation is a
                genuine test rather than circular validation. Their primary justification
                is structural integrity, not empirical maximization.
              </Body>
            </section>

            {/* ── THE AXES ──────────────────────────────────────────────── */}
            <section id="axes">
              <Eyebrow>Section III</Eyebrow>
              <SectionHeading>The Axes of Structural Risk</SectionHeading>
              <div className="mt-5 space-y-4">
                <Body>
                  OSMR's two axes are not measuring different things. They are
                  measuring different dimensions of the same structural condition:
                  the relationship between a company's valuation and its operational
                  reality. Both axes speak to the same OAL anchor throughout.
                </Body>
                <Body>
                  Axis 1 asks: how stretched is the valuation relative to
                  demonstrated output? Axis 2 asks: is that demonstrated output
                  improving or deteriorating? Together they build a complete
                  structural picture from two complementary angles. An important
                  empirical finding: neither axis alone produces the discrimination
                  the composite achieves. A standalone momentum proxy using only
                  Axis 2 produced AUC below random (0.406 vs 0.500 baseline) as a
                  loss predictor. The composite works because both signals
                  triangulate the same underlying structural condition.
                </Body>
              </div>
              <div className="mt-8"><AxisAccordion /></div>
            </section>

            {/* ── COMPOSITE SCORE ───────────────────────────────────────── */}
            <section id="composite">
              <Eyebrow>Section IV</Eyebrow>
              <SectionHeading>The Composite Score</SectionHeading>
              <Body className="mt-5">
                The Composite Structural Risk score is the equal-weight mean of
                Axis 1 and Axis 2, expressed as a percentile rank across the
                full scored universe.
              </Body>

              <div className="mt-6 rounded-xl px-6 py-4" style={{ background: T.navy }}>
                <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: "#B8CCE0", fontSize: "1.25rem", letterSpacing: "0.02em" }}>
                  composite = (axis1_pct + axis2_pct) / 2
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <Body>
                  Axis 1 and Axis 2 each carry 50% weight. Axis 2 carries slightly
                  stronger full-period signal (Spearman r = −0.056 vs Axis 1 at −0.034),
                  but the difference is within bootstrap confidence interval overlap.
                  Equal weighting is more interpretable, more stable, and less dependent
                  on a specific historical window to justify.
                </Body>
                <Body>
                  This is a long-run static model. Weights do not shift based on
                  market regime or detected volatility environment. Stability is a
                  deliberate choice — a model that silently changes its weights is
                  harder to interpret and more susceptible to overfitting.
                </Body>
              </div>

              {/* Bucket labels */}
              <Card className="mt-6 overflow-hidden">
                <div className="px-5 py-3" style={{ borderBottom: `1px solid ${T.border}`, background: T.cream }}>
                  <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, letterSpacing: "0.14em" }} className="text-[10px] font-semibold uppercase">Composite bucket labels</p>
                </div>
                <div className="divide-y" style={{ borderColor: T.border }}>
                  {[
                    { bucket: "Very Low",  range: "0th–20th pct",   desc: "Deepest anchors, improving trajectory", accent: T.green },
                    { bucket: "Low",       range: "20th–40th pct",  desc: "Below-average structural risk",         accent: "#3E6B4F" },
                    { bucket: "Moderate",  range: "40th–60th pct",  desc: "Population center",                    accent: T.muted },
                    { bucket: "High",      range: "60th–80th pct",  desc: "Above-average structural risk",        accent: "#BC6464" },
                    { bucket: "Very High", range: "80th–100th pct", desc: "Shallow anchors, deteriorating trajectory", accent: T.rust },
                  ].map(({ bucket, range, desc, accent }) => (
                    <div key={bucket} className="flex items-center gap-4 px-5 py-3">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                      <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: T.navy }} className="text-sm w-28">{bucket}</span>
                      <span style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="text-[10.5px] w-28">{range}</span>
                      <span style={{ fontFamily: "'DM Sans', system-ui", color: T.body }} className="text-[10.5px]">{desc}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* ── VALIDATION ────────────────────────────────────────────── */}
            <section id="validation">
              <Eyebrow>Section V</Eyebrow>
              <SectionHeading>Empirical Validation</SectionHeading>
              <div className="mt-5 space-y-4">
                <Body>
                  A scoring framework without empirical grounding is a hypothesis.
                  OSMR has been validated against 289,737 historical observations
                  across the U.S. equity universe from 2009 through 2026, spanning
                  three distinct market regimes. The validation tests whether
                  structural risk classifications produce measurably different
                  distributions of subsequent 12-month returns — which is a weaker
                  and more honest claim than prediction.
                </Body>
                <Body>
                  All observations apply a $5 minimum price filter at formation.
                  The backtest universe applies $5M minimum average daily volume and
                  $50M minimum market capitalization, rebalanced monthly at
                  month-end closing prices. Transaction costs and market impact
                  are not modeled.
                </Body>
              </div>

              {/* r scale */}
              <Card className="mt-6 px-6 py-5">
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, letterSpacing: "0.14em" }} className="text-[10px] font-semibold uppercase mb-3">
                  How to read Spearman r in an equity factor context
                </p>
                <Body>
                  Cross-sectional Spearman r measures rank-order consistency between
                  a risk score and subsequent returns. The Fama-French value factor
                  produces r in the 0.03–0.06 range. Momentum produces 0.05–0.09.
                </Body>
                <div className="grid grid-cols-5 gap-1.5 mt-4">
                  {[
                    { label: "Negligible", range: "|r| < 0.03", bg: T.creamDark,   text: T.muted },
                    { label: "Slight",     range: "0.03–0.05",  bg: "#EAF0F8",     text: T.blue  },
                    { label: "Modest",     range: "0.05–0.07",  bg: T.greenSoft,   text: T.green },
                    { label: "Strong",     range: "0.07–0.11",  bg: "#C9D8CD",     text: "#1A3A27" },
                    { label: "Substantive",range: "|r| ≥ 0.11", bg: T.navy,        text: "#A9BEDF" },
                  ].map(({ label, range, bg, text }) => (
                    <div key={label} className="rounded-lg py-2.5 px-2 text-center" style={{ backgroundColor: bg }}>
                      <div style={{ fontFamily: "'DM Sans', system-ui", color: text }} className="text-[10px] font-semibold">{label}</div>
                      <div style={{ fontFamily: "'DM Sans', system-ui", color: text }} className="mt-0.5 text-[9.5px] opacity-70">{range}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Signal summary */}
              <SubHeading>Signal Summary</SubHeading>
              <TableSm
                headers={["Factor", "Spearman r", "95% CI", "Label", "N"]}
                rows={[
                  ["Axis 1 (Anchor Risk)",     <span style={{ fontFamily: "monospace", color: T.green }}>−0.0339</span>, "[−0.038, −0.030]", "Slight", "289,745"],
                  ["Axis 2 (Trajectory Risk)", <span style={{ fontFamily: "monospace", color: T.green }}>−0.0556</span>, "[−0.059, −0.052]", "Modest", "289,737"],
                  ["Composite (equal weight)", <span style={{ fontFamily: "monospace", color: T.green }}>−0.0518</span>, "[−0.056, −0.048]", "Modest", "289,737"],
                ]}
              />
              <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="mt-2 text-[10.5px]">
                Bootstrap 95% CI (1,000 samples). All p-values = 0.0000. ICIR: Composite −0.66 · Axis 2 −0.58 · Axis 1 −0.40.
              </p>

              {/* Regime chart */}
              <SubHeading>Signal by Market Regime</SubHeading>
              <Body>
                OSMR's signal is conditional on the market environment. In periods
                of structural stress and dislocation the signal is Substantive. In the
                extended pre-2020 bull market, the full-period cross-sectional signal
                is Negligible. This is the expected behavior of a framework that
                measures structural risk, not narrative momentum. The next section
                explains why Negligible Spearman r pre-2020 does not mean absent signal.
              </Body>
              <Card className="mt-5 px-6 py-5">
                <RegimeChart />
              </Card>

              {/* Pre-2020 disclosure */}
              <AccentBox borderColor={T.muted}>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, letterSpacing: "0.14em" }} className="text-[10px] font-semibold uppercase mb-2">Pre-2020 regime — honest disclosure and reconciliation</p>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm">
                  The pre-2020 composite signal (r = −0.001, Negligible) warrants specific attention.
                  Breaking the decade into sub-windows: 2009–2012 produced Slight signal (r = −0.043)
                  during the post-crisis recovery. 2013–2016 produced Slight signal (r = −0.031).
                  2017–2019 produced a statistically significant <em>inversion</em> (r = +0.037) — the period
                  when narrative premium expansion was at its peak. The 2019 peak inversion
                  (r = +0.079) is the strongest anti-signal year in the dataset. The 2021 signal
                  (r = −0.268, Substantive) reflects the subsequent collapse of those narratives.
                </p>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm mt-3">
                  The Spearman r of −0.001 pre-2020 and factor-adjusted L/S alpha of +23.9% (t = +5.84)
                  pre-2020 are compatible and both true. Spearman r measures rank-order consistency across
                  the full distribution. When Q1–Q4 are nearly identical in median returns, the rank
                  correlation is dragged toward zero even when Q5 diverges sharply. The factor-adjusted
                  long-short portfolio captures only the tail differential and bypasses the undifferentiated
                  middle. The narrative independence premium exists at the extremes across all three regimes.
                </p>
              </AccentBox>

              <Card className="mt-5 px-6 py-5">
                <YearByYearChart />
              </Card>

              {/* Factor Independence */}
              <SubHeading>Factor Independence</SubHeading>
              <Body>
                The central question any serious allocator asks about a new framework is
                whether it carries information beyond what established factors already
                explain. OSMR has been tested against the Fama-French five-factor model
                plus momentum — controlling for market, size, value, profitability,
                investment, and momentum simultaneously.
              </Body>

              <Card className="mt-5 overflow-hidden">
                <div className="px-6 py-3" style={{ borderBottom: `1px solid ${T.border}`, background: T.cream }}>
                  <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, letterSpacing: "0.14em" }} className="text-[10px] font-semibold uppercase">
                    L/S portfolio (Very Low minus Very High) · FF5 + Momentum regression
                  </p>
                </div>
                <div className="divide-y" style={{ borderColor: T.border }}>
                  {[
                    { label: "Annualized alpha",            val: "+21.0%",   note: "After stripping all six factors" },
                    { label: "t-statistic (alpha)",         val: "+4.80",    note: "Clears 2.0 threshold with margin" },
                    { label: "p-value",                     val: "0.000002", note: "" },
                    { label: "R² (factor model)",           val: "5.1%",     note: "Factors explain 5.1% of L/S return variance" },
                    { label: "RMW loading (profitability)", val: "+0.290",   note: "t = +1.57 — directional but not significant" },
                    { label: "N (months)",                  val: "205",      note: "" },
                  ].map(({ label, val, note }) => (
                    <div key={label} className="flex items-center justify-between px-6 py-3">
                      <span style={{ fontFamily: "'DM Sans', system-ui", color: T.body }} className="text-sm">{label}</span>
                      <div className="text-right">
                        <span style={{ fontFamily: "'DM Sans', system-ui", color: T.green }} className="text-sm font-semibold">{val}</span>
                        {note && <span style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="ml-3 text-[10.5px]">{note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <AccentBox>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm">
                  The six-factor model explains 5.1% of long-short return variance.
                  94.9% is orthogonal to the entire FF5+Momentum factor set. The
                  framework is not a repackaging of known factors. The RMW (profitability)
                  loading is directionally expected but does not reach statistical significance
                  — the signal is not driven by profitability alone.
                </p>
              </AccentBox>

              <Body className="mt-4">
                Regime stratification confirms the alpha is not concentrated in crisis periods.
                The factor-adjusted L/S return is positive and statistically significant pre-2020
                (+23.9% annualized, t = +5.84, n = 132 months) and post-COVID (+20.0%, t = +2.15,
                n = 49 months). The COVID window is statistically inconclusive at n = 24 months.
                The full-period alpha reflects a consistent structural signal, not a crisis artifact.
              </Body>

              <Card className="mt-5 px-6 py-5" style={{ background: "#F8F6F2" }}>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, letterSpacing: "0.14em" }} className="text-[10px] font-semibold uppercase mb-2">A note on implementability</p>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm">
                  The L/S alpha figure above is a long-short portfolio construction
                  result — a theoretical long in Very Low against a short in Very High,
                  rebalanced monthly, with no transaction costs. It is not an implementable
                  return estimate for a long-only strategy. A long-only filter produces different
                  economics — the exclusion and selection effects documented below (+4.6pp and
                  +3.1pp respectively) are the more relevant figures for long-only implementation.
                  Signal persistence across sub-12-month holding horizons has not been formally
                  tested and remains an open research question.
                </p>
              </Card>

              {/* Regime-conditional signal */}
              <SubHeading>Regime-Conditional Signal</SubHeading>
              <Body>
                The framework generates positive long-short alpha in all three ex ante regime
                classifications using a fully mechanical classifier — prior month's trailing
                12-month market return. No forecasting required. Expansion encompasses 52.7%
                of the sample period and generates +14.5% annualized L/S return. The framework
                is not a crisis-only tool.
              </Body>

              <TableSm
                headers={["Regime", "% of Months", "L/S Ann Return", "ICIR"]}
                rows={[
                  ["Expansion (prior 12m > +10%)", "52.7%", <span style={{ color: T.green }} className="font-medium">+14.5%</span>, "−0.659"],
                  ["Neutral (0% to +10%)",          "17.6%", <span style={{ color: T.green }} className="font-medium">+18.0%</span>, "−0.534"],
                  ["Stress (prior 12m < 0%)",       "23.9%", <span style={{ color: T.green }} className="font-medium">+23.5%</span>, "−0.766"],
                ]}
              />

              <Card className="mt-5 px-5 py-4" style={{ background: "#F8F6F2" }}>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, letterSpacing: "0.14em" }} className="text-[10px] font-semibold uppercase mb-3">Very High loss rates by regime</p>
                <TableSm
                  headers={["Regime", "VH loss rate", "Universe rate", "Relative risk"]}
                  rows={REGIME_LOSS_DATA.map(({ regime, vh, all, rel }) => [
                    regime,
                    <span style={{ color: T.rust }} className="font-medium">{vh}%</span>,
                    <span style={{ color: T.muted }}>{all}%</span>,
                    <span style={{ color: T.navy }} className="font-medium">{rel}×</span>,
                  ])}
                />
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="mt-2.5 text-[10.5px] leading-5">
                  Loss defined as 12-month return below −25%. The Expansion absolute loss rate (34.6%) exceeds
                  Stress (28.3%) because market recovery dynamics lift structurally fragile companies in stress
                  periods. The relative risk metric (~2×) is consistent across all environments.
                </p>
              </Card>

              {/* Quintile */}
              <SubHeading>Return Distribution by Structural Risk Quintile</SubHeading>
              <Body>
                The signal concentrates in the penalty applied to the highest-risk
                quintile. Q1 through Q4 are largely undifferentiated in median
                returns. The framework does not reliably identify which companies
                will outperform. What it reliably identifies is the structural
                condition under which companies are most likely to significantly
                underperform.
              </Body>
              <Card className="mt-4 px-6 py-5"><QuintileChart /></Card>
              <TableSm
                headers={["Quintile", "Median", "Geo Mean", "Hit Rate", "N"]}
                rows={[
                  [<span style={{ color: T.green }} className="font-medium">Q1 — Lowest Risk</span>, "+9.8%", "+7.6%", "62.1%", "57,949"],
                  ["Q2", "+9.6%", "+6.0%", "62.1%", "57,946"],
                  ["Q3", "+9.0%", "+3.1%", "61.5%", "57,947"],
                  ["Q4", "+9.8%", "+5.0%", "63.0%", "57,948"],
                  [<span style={{ color: T.rust }} className="font-medium">Q5 — Highest Risk</span>, "+4.9%", "−4.3%", "55.5%", "57,947"],
                ]}
              />
              <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="mt-2 text-[10.5px] leading-5">
                Q1–Q5 median spread: +4.9pp · t = 10.646 · p = 0.0000 · Full period 2009–2026.
                The practical decision threshold is the Very High bucket. Q1–Q4 provide rank ordering
                within the lower-risk population but do not carry the distributional separation that
                makes the signal actionable.
              </p>

              {/* Narrative independence premium */}
              <SubHeading>The Narrative Independence Premium</SubHeading>
              <Body>
                The framework's primary structural contribution is loss avoidance —
                specifically, the return to holding companies that are independent
                of the narratives required to sustain fragile valuations.
              </Body>
              <Body className="mt-3">
                An important precision: the Very High composite bucket has a hit rate of 49.4% —
                meaning approximately half of Very High classifications produce positive 12-month
                returns. The framework identifies a structural risk <em>state</em>, not a predicted
                outcome. A company in Very High is in a condition where severe loss is approximately
                2× more likely than the universe base rate. That is the correct and honest framing.
              </Body>

              <Card className="mt-5 px-6 py-5">
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, letterSpacing: "0.14em" }} className="text-[10px] font-semibold uppercase mb-5">
                  Return distribution · Very Low vs Very High composite bucket
                </p>
                <DistributionChart />
              </Card>

              {/* Comparison cards */}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Very Low composite",
                    items: [
                      { k: "Median 12-month return", v: "+10.4%" },
                      { k: "Geometric mean",          v: "+8.6%"  },
                      { k: "Hit rate",                v: "62.4%"  },
                      { k: "% outcomes below −25%",   v: "12.2%"  },
                      { k: "CVaR (95th)",              v: "−52.7%" },
                      { k: "N (observations)",         v: "18,459" },
                    ],
                    valColor: T.green,
                  },
                  {
                    label: "Very High composite",
                    items: [
                      { k: "Median 12-month return", v: "−0.8%"  },
                      { k: "Geometric mean",          v: "−11.7%" },
                      { k: "Hit rate",                v: "49.4%"  },
                      { k: "% outcomes below −25%",   v: "30.3%"  },
                      { k: "CVaR (95th)",              v: "−85.1%" },
                      { k: "N (observations)",         v: "26,128" },
                    ],
                    valColor: T.rust,
                  },
                ].map(({ label, items, valColor }) => (
                  <Card key={label} className="p-5">
                    <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, letterSpacing: "0.14em" }} className="text-[10px] font-semibold uppercase mb-3">{label}</p>
                    {items.map(({ k, v }) => (
                      <div key={k} className="flex justify-between py-1.5" style={{ borderBottom: `1px solid ${T.cream}` }}>
                        <span style={{ fontFamily: "'DM Sans', system-ui", color: T.body }} className="text-sm">{k}</span>
                        <span style={{ fontFamily: "'DM Sans', system-ui", color: valColor }} className="text-sm font-semibold">{v}</span>
                      </div>
                    ))}
                  </Card>
                ))}
              </div>

              <AccentBox borderColor={T.rust}>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm">
                  30.3% of Very High composite observations produced losses exceeding 25%
                  over 12 months. CVaR of −85.1% means that in the worst 5% of outcomes,
                  investors lost approximately 85 cents on every dollar. The arithmetic mean
                  — pulled upward by a small subset of large positive outcomes — would make
                  this cohort appear attractive. It is not used as the headline metric here.
                </p>
              </AccentBox>

              {/* AUC classification */}
              <Card className="mt-6 px-6 py-5">
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted, letterSpacing: "0.14em" }} className="text-[10px] font-semibold uppercase mb-4">
                  Loss classification accuracy (AUC) · loss = 12-month return below −25%
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "OSMR composite",              val: "0.567", note: "+6.7pp over random",           accent: T.green },
                    { label: "Momentum proxy (Axis 2 only)",val: "0.406", note: "Below random — composite required", accent: T.muted },
                    { label: "Valuation alone",             val: "0.493", note: "Below random",                  accent: T.muted },
                  ].map(({ label, val, note, accent }) => (
                    <div key={label} className="rounded-lg p-3.5 text-center" style={{ background: T.cream }}>
                      <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: accent }} className="text-xl">{val}</div>
                      <div style={{ fontFamily: "'DM Sans', system-ui", color: T.body }} className="text-[10.5px] font-medium mt-1 leading-tight">{label}</div>
                      <div style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="text-[9.5px] mt-1 leading-tight">{note}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="mt-3.5 text-[10.5px] leading-5">
                  At the top-20% threshold: precision 22.7% vs 15.8% base rate — 43% improvement over random.
                  Median lead time before loss events: 2 months. False positive rate: 68.5%.
                  These numbers reinforce the risk state framing: the framework is not an event predictor.
                </p>
              </Card>

              <Card className="mt-5 px-6 py-5"><BucketRiskChart /></Card>

              <TableSm
                headers={["Bucket", "Median", "Geo Mean", "CVaR (95%)", "< −25%", "N"]}
                rows={[
                  [<span style={{ color: T.green }} className="font-medium">Very Low</span>,  "+10.4%", "+8.6%",  "−52.7%", "12.2%", "18,459"],
                  ["Low",       "+9.6%",  "+7.0%",  "−56.8%", "13.3%", "69,636"],
                  ["Moderate",  "+9.3%",  "+4.2%",  "−66.5%", "14.8%", "121,144"],
                  ["High",      "+9.0%",  "+3.2%",  "−67.4%", "15.5%", "54,370"],
                  [<span style={{ color: T.rust }} className="font-medium">Very High</span>, "−0.8%",  "−11.7%", "−85.1%", "30.3%", "26,128"],
                ]}
              />

              {/* Portfolio-level results */}
              <SubHeading>Portfolio-Level Results</SubHeading>
              <Body>
                Structural screening produces measurable portfolio-level effects.
                The premium decomposes into two independently verifiable contributions:
                an exclusion effect (removing structurally fragile companies) and a
                selection effect (concentrating in the lowest-risk bucket).
              </Body>

              <Card className="mt-5 px-6 py-5"><PremiumDecomposition /></Card>

              <TableSm
                headers={["Index", "Ann Ret", "Sortino", "Max DD", "Months"]}
                rows={[
                  ["Very Low Risk (EW, post-2013)",      <span style={{ color: T.green }} className="font-medium">+17.5%</span>, "1.261", "−34.3%", "145"],
                  ["OSMR-Filtered Broad Market (CW)",    <span style={{ color: T.green }} className="font-medium">+14.4%</span>, "1.286", "−22.5%", "145"],
                  ["Full Scored Universe (CW)",          "+9.8%",  "0.916", "−26.9%", "145"],
                  ["SPY (external reference, approx.)", "+14–16%", "~1.1",  "~−34%",  "—"  ],
                ]}
              />

              <div className="mt-4 space-y-3">
                <AccentBox>
                  <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm">
                    <strong style={{ color: T.navy }}>Premium decomposition.</strong>{" "}
                    The OSMR-Filtered Broad Market index — cap-weighted, excluding all High and Very High
                    companies on either axis — produced +14.4% annualized vs the full universe at +9.8%.
                    Exclusion alone added +4.6 percentage points. Positive selection into the Very Low
                    bucket added a further +3.1 percentage points. Total premium: +7.7pp through two
                    independently verifiable mechanisms.
                  </p>
                </AccentBox>
                <AccentBox>
                  <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm">
                    <strong style={{ color: T.navy }}>Risk-weighting across the size spectrum.</strong>{" "}
                    Applying risk-weighted capital allocation within each market cap tier independently
                    shows the premium is monotonically inverse to cap size: Mega +0.3pp, Large +1.9pp,
                    Mid +2.7pp, Small +4.8pp over equal-weight. The structural signal adds value within
                    size tiers, not merely by tilting toward larger companies.
                  </p>
                </AccentBox>
                <AccentBox borderColor={T.muted}>
                  <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm">
                    <strong style={{ color: T.navy }}>SPY comparison.</strong>{" "}
                    The OSMR-Filtered index achieved +14.4% with a maximum drawdown of −22.5% versus
                    SPY's approximately −34% — a materially different path to a similar destination.
                    The Very Low index (+17.5%) exceeded SPY on raw return but carries a deeper drawdown
                    (−34.3%) due to its equal-weight construction and small-cap tilt.
                  </p>
                </AccentBox>
                <Card className="px-6 py-4" style={{ background: T.cream }}>
                  <p style={{ fontFamily: "'DM Sans', system-ui", color: T.muted }} className="text-[10.5px] leading-5">
                    <strong style={{ color: T.body }}>Methodology notes.</strong>{" "}
                    Very Low index: equal-weight, post-2013 (avg. 123 constituents/month). Full-period figure
                    (+24.8%) includes 2009–2013 recovery with thin constituent counts; post-2013 figure (+17.5%)
                    is the appropriate reference. OSMR-Filtered: cap-weight, excludes axis1 or axis2 in
                    {"{"}High, Very High{"}"}, avg. 559 constituents/month. Transaction costs not modeled.
                    Monthly turnover not modeled — see Limitations.
                  </p>
                </Card>
              </div>

              {/* Why median */}
              <SubHeading>Why Median Is the Primary Metric</SubHeading>
              <Body>
                The decision to lead with median rather than mean is not merely
                statistical — it is philosophical. The median reports the outcome
                for a typical investor who held a typical security from this cohort
                for twelve months. In the highest-risk composite bucket, the mean
                return is positive while the median is −0.8% and the geometric mean
                is −11.7%. A framework that reported mean as its primary metric
                would present this bucket as potentially attractive. The median and
                geometric mean tell the honest story.
              </Body>
            </section>

            {/* ── DESIGN PRINCIPLES ─────────────────────────────────────── */}
            <section id="principles">
              <Eyebrow>Section VI</Eyebrow>
              <SectionHeading>Design Principles</SectionHeading>
              <Body className="mt-5">
                Every analytical framework makes design choices. These are not
                implementation details — they are the constraints that define what
                the framework is and is not allowed to claim.
              </Body>

              <div className="mt-8 space-y-3">
                {[
                  {
                    title: "Equal weighting over empirically-derived weighting",
                    body: "The composite weights Axis 1 and Axis 2 equally at 50% each. Axis 2 carries marginally stronger full-period signal (r = −0.056 vs −0.034), but tilting the weight toward Axis 2 improves composite r by approximately 0.006 — within bootstrap confidence interval overlap. Equal weighting is more interpretable, more stable, and less susceptible to window-specific optimization.",
                  },
                  {
                    title: "First-principles penalties, not optimized penalties",
                    body: "The OAL shallowness penalty values were derived from structural reasoning about anchor distance before examining outcomes. This means the cohort separation is a genuine empirical test rather than circular validation. Their primary justification is structural integrity, not empirical maximization.",
                  },
                  {
                    title: "Empirical over mathematical sophistication",
                    body: "Where simpler measures outperform complex ones, the simpler measure is used. Axis 2 uses YoY consistency rather than tanh transformation or R-squared trend fitting — both of which were tested and underperformed. Mathematical complexity is not a virtue when it disconnects the measure from the phenomenon it captures.",
                  },
                  {
                    title: "Median over mean as the default summary statistic",
                    body: "Median is more resistant to outlier distortion and reports the central tendency honestly. Mean is shown as supplementary information with skew indicators when the gap exceeds 10 percentage points. This matters most precisely where it is most important: in the highest-risk cohort, where mean and median diverge dramatically.",
                  },
                  {
                    title: "Global ranking for cross-sectional comparability",
                    body: "Both axes are expressed as global percentile ranks across the full universe after anchor penalties are applied. This makes scores directly comparable across companies anchored on different OAL rungs — essential for a framework designed to evaluate structural risk at the universe level.",
                  },
                  {
                    title: "Conservative anchor assignment on a trailing window",
                    body: "OAL assignment uses the 3-year cumulative sum of the relevant financial series rather than trailing twelve months. This requires sustained demonstrated performance rather than rewarding a single strong quarter. Adjusted metrics, normalized earnings, and forward projections are not considered.",
                  },
                  {
                    title: "Static model — no regime adaptation",
                    body: "The composite formula and axis weights do not shift based on market environment. Signal strength varies materially across regimes — as the validation section documents. A model that silently changes its weights is harder to interpret, harder to audit, and more susceptible to overfitting. Stability is a deliberate choice, not an oversight.",
                  },
                ].map(({ title, body }) => (
                  <Card key={title} className="px-6 py-5">
                    <h4 style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: T.navy }} className="text-base">{title}</h4>
                    <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="mt-2 text-sm">{body}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* ── LIMITATIONS ───────────────────────────────────────────── */}
            <section id="limitations">
              <Eyebrow>Section VII</Eyebrow>
              <SectionHeading>Known Limitations</SectionHeading>
              <Body className="mt-5">
                Honest documentation of what this framework cannot do is as
                important as documenting what it can. The following limitations
                are not caveats offered defensively — they are boundaries that
                define the proper scope of interpretation.
              </Body>
              <Body className="mt-3">
                In practice, the most common misuse of this framework is treating Very High
                classifications as sell signals rather than structural risk flags. 68.5% of
                Very High entries do not produce severe losses in the subsequent 12 months.
                The framework does not tell you what to do. It tells you what structural
                condition a company is in.
              </Body>

              <div className="mt-8 space-y-3">
                {[
                  {
                    title: "The framework is a risk state identifier, not a timing signal",
                    body: "The framework cannot identify when a stretched valuation will correct, or when a deteriorating anchor will become visible to the market. A company can remain in Very High structural risk territory for extended periods — median Very High run length is 2 months before a loss event, but false positive sequences have the same median duration. The 68.5% false positive rate means approximately two-thirds of Very High classifications do not produce severe losses in the subsequent 12 months.",
                  },
                  {
                    title: "Signal is conditional on market regime",
                    body: "The full-period composite Spearman r of −0.052 (Modest) reflects 17 years that include extended periods of near-zero cross-sectional signal. Pre-2020, the rank correlation is Negligible (r = −0.001). This reflects a full-distribution phenomenon: Q1–Q4 are undifferentiated in median returns pre-2020. The factor-adjusted tail premium (Very Low vs Very High) is present in all regimes including pre-2020. Both statements are true.",
                  },
                  {
                    title: "Potential survivorship bias in pre-2020 data",
                    body: "Companies that failed or were delisted before 2020 would almost certainly have scored in the Very High risk bucket. If those failures are underrepresented in the price history, the pre-2020 Q5 penalty is understated. The disclosed pre-2020 weakness is probably a conservative lower bound, not the true effect size.",
                  },
                  {
                    title: "The framework does not incorporate sector context",
                    body: "A pre-revenue biotech and a pre-profitable consumer staples company both receive OAL 4 assignments. The framework treats them comparably because its mandate is cross-sectional structural risk assessment. Sector context can and should be applied as a layer of interpretation on top of OSMR scores. At the micro-cap level specifically, OAL 4 assignments may reflect genuine information inefficiency rather than narrative inflation — a distinction the framework does not make.",
                  },
                  {
                    title: "Monthly rebalancing implies non-trivial turnover",
                    body: "The equal-weight and risk-weighted indexes rebalance monthly. Companies move across composite buckets as scores update — particularly around quarterly earnings releases. The backtest does not model the turnover costs associated with this movement. Quarterly rebalancing — not yet modeled — would reduce this friction meaningfully.",
                  },
                  {
                    title: "The framework reflects a single point in time",
                    body: "Each snapshot is a static assessment based on three-year trailing figures and available price data. A company can move across OAL rungs and risk quintiles within a single quarter if its operational or market circumstances change materially. The platform refreshes weekly for price-sensitive components and monthly for the full structural pipeline.",
                  },
                  {
                    title: "No transaction cost or market impact modeling",
                    body: "All index and backtest figures assume frictionless execution at month-end closing prices. Transaction costs, bid-ask spreads, and market impact are not modeled. For a broad universe with $5M ADV minimum, implementation frictions are manageable but not zero.",
                  },
                  {
                    title: "Underlying data quality is not fully characterized",
                    body: "OSMR scores derive from Financial Modeling Prep (FMP) API data, which has known quality issues including malformed rows, gaps in quarterly history for smaller companies, and occasional stale figures. Score accuracy for companies in the lower OAL rungs should be treated with somewhat more interpretive caution than for FCF-anchored companies.",
                  },
                ].map(({ title, body }) => (
                  <div key={title} className="rounded-xl px-6 py-5" style={{ border: `1px solid ${T.border}`, background: "#F8F6F2" }}>
                    <h4 style={{ fontFamily: "'DM Sans', system-ui", color: T.navy }} className="text-sm font-semibold">{title}</h4>
                    <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="mt-2 text-sm">{body}</p>
                  </div>
                ))}

                <OpenQuestionBlock title="Axis 2 cross-sectional decomposition — sign reversal">
                  <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm">
                    In Fama-MacBeth cross-sectional regressions, Axis 2 carries a positive coefficient
                    after controlling for Axis 1 (coef = +0.030, t = +2.428) — the opposite direction
                    from the hypothesis. The most plausible mechanism: trajectory deterioration is
                    partially mean-reverting at the individual stock level after controlling for current
                    valuation. The composite works because both signals triangulate the same structural
                    condition — neither works alone, as confirmed by the momentum baseline AUC of 0.406
                    (below random) when Axis 2 is used standalone.
                  </p>
                  <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm">
                    This is an open question, not a refutation. The portfolio-level alpha (L/S +21.0%,
                    t = +4.80) survives factor stripping with full confidence. Future sector-neutral and
                    size-neutral portfolio testing will provide additional clarity.
                  </p>
                </OpenQuestionBlock>

                <OpenQuestionBlock title="Signal persistence across sub-12-month holding horizons">
                  <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.75 }} className="text-sm">
                    All validation uses a 12-month forward return horizon. Whether the signal persists —
                    or concentrates — at shorter intervals (1 month, 3 months, 6 months) has not been
                    formally tested. It is unknown whether the factor-adjusted alpha is distributed
                    across the holding period or concentrated near the rebalancing boundary. This
                    distinction matters for implementation: a signal that decays rapidly implies
                    different rebalancing cadence requirements than one that accumulates gradually.
                    Alpha decay testing is planned and will be disclosed when complete.
                  </p>
                </OpenQuestionBlock>
              </div>
            </section>

            {/* ── CONCLUSION ────────────────────────────────────────────── */}
            <section id="conclusion">
              <Eyebrow>Section VIII</Eyebrow>
              <SectionHeading>Conclusion</SectionHeading>
              <div className="mt-5 space-y-4">
                <Body>
                  OSMR was built on a specific conviction: most investors lack not
                  information but framework — a disciplined way of asking what a
                  company has actually demonstrated, and how far its valuation has
                  strayed from that demonstration. The framework does not tell
                  investors what to buy or sell. It identifies where narrative risk
                  is concentrated, how stable the operational foundations beneath
                  current valuations are, and whether the companies in their universe
                  are moving toward or away from demonstrated economic viability.
                </Body>
                <Body>
                  The empirical record across 289,737 observations and 17 years
                  supports the core hypothesis. The signal is Modest in aggregate
                  and Substantive during structural stress. Portfolio-level factor
                  decomposition confirms the signal is not explained by known factors
                  — after stripping all six factors, the long-short portfolio produces
                  +21.0% annualized alpha (t = +4.80). The framework generates positive
                  alpha in all three market regimes, including Expansion which accounts
                  for 52.7% of the sample period. The OAL separation — FCF vs Revenue
                  median spread of +26.6 percentage points — held across all regimes tested.
                </Body>
                <Body>
                  The framework is a living system. Factor neutralization testing,
                  quarterly rebalancing simulation, alpha decay analysis, and sector-neutral
                  portfolio construction are planned and will be disclosed when complete.
                  None of this is finished — but it is real, grounded in empirical
                  performance across full market cycles, and designed to be honest about
                  what it can and cannot tell us.
                </Body>
              </div>

              <NavyBox>
                Stewardship is about conformity to reality. The Capital Steward
                exists because investors are better served by honest structural
                thinking — even when that thinking produces ambiguous answers —
                than by confident narratives that obscure the distance between
                what a company is worth and what it has actually demonstrated.
              </NavyBox>
            </section>

            {/* ── APPENDIX ──────────────────────────────────────────────── */}
            <section id="appendix">
              <Eyebrow>Appendix</Eyebrow>
              <SectionHeading>Methodology Summary</SectionHeading>

              <div className="mt-6 overflow-hidden rounded-xl" style={{ border: `1px solid ${T.border}` }}>
                <table className="w-full text-sm">
                  <tbody className="divide-y" style={{ borderColor: T.border }}>
                    {[
                      { field: "Universe",       value: "~5,200 U.S. equity securities. Data: FMP API. $5M minimum ADV · $50M minimum market cap applied before scoring. Refreshed weekly (snapshot) and monthly (full pipeline)." },
                      { field: "Backtest",       value: "289,737 observations · 2009-01 through 2025-02 formation window · 12-month forward return horizon · $5 minimum price filter at formation · bootstrap 95% CI (1,000 samples)." },
                      { field: "OAL Assignment", value: "FCF → NI → EBIT → Revenue in sequence; assigned to first qualifying rung based on positive 3-year cumulative figure. Negative EV companies excluded. No adjusted or normalized metrics considered." },
                      { field: "Axis 1 Formula", value: "log(EV / anchor_3yr) + OAL_shallowness_penalty → global percentile rank (ascending = more risk). Penalties: FCF=0, NI=1.0, EBIT=1.618, Rev=4.236." },
                      { field: "Axis 2 Formula", value: "YoY consistency score across up to 28 quarters + OAL_shallowness_penalty → global percentile rank. Four most recent YoY comparisons receive double weight. 28-quarter window is a first-principles design choice, not empirically optimized." },
                      { field: "Composite Score",value: "(axis1_pct + axis2_pct) / 2. Equal weight. Percentile rank across full universe. Long-run static model — weights do not shift across market regimes." },
                      { field: "Factor Analysis",value: "L/S portfolio (Very Low minus Very High) regressed on FF5 + Momentum: α = +21.0% annualized, t = +4.80, R² = 0.051. Pre-2020: α = +23.9%, t = +5.84. Post-COVID: α = +20.0%, t = +2.15." },
                      { field: "Classification", value: "Binary classification of severe losses (12m return < −25%). OSMR AUC = 0.567 vs momentum baseline 0.406 (below random) vs valuation baseline 0.493. Top-20% threshold: precision 22.7% vs 15.8% base rate. False positive rate 68.5%. Median lead time 2 months." },
                      { field: "Bucket Labels",  value: "Very Low (0–20th pct) / Low (20–40th) / Moderate (40–60th) / High (60–80th) / Very High (80–100th). Higher bucket = more structural risk." },
                      { field: "Index Construction", value: "EW: simple average of 1-month returns, monthly rebalancing. CW: market-cap weighted average. Price filter ≥$5 at formation. Transaction costs and monthly turnover not modeled." },
                    ].map(({ field, value }) => (
                      <tr key={field} style={{ background: T.white }}>
                        <td style={{ fontFamily: "'DM Sans', system-ui", color: T.navy }} className="px-5 py-4 align-top whitespace-nowrap w-40 text-sm font-semibold">{field}</td>
                        <td style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.7 }} className="px-5 py-4 text-sm">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────────── */}
            <div className="rounded-[2rem] p-10" style={{ border: `1px solid ${T.border}`, background: T.white, boxShadow: "0 8px 40px rgba(10,31,61,0.06)" }}>
              <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", color: T.navy }} className="text-2xl">The system is live.</h3>
              <p style={{ fontFamily: "'DM Sans', system-ui", color: T.body, lineHeight: 1.8 }} className="mt-3 text-[0.925rem]">
                The structural map, cohort grids, and company profiles described
                here are updated on a weekly cadence and accessible in the
                platform now.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/platform"
                      style={{ fontFamily: "'DM Sans', system-ui", background: T.navy }}
                      className="inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-semibold text-white transition hover:opacity-90">
                  Open Platform <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/how-to-use-osmr"
                      style={{ fontFamily: "'DM Sans', system-ui", color: T.ink, border: `1px solid ${T.border}` }}
                      className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-medium transition hover:border-[#B8CCAA] hover:text-[#0A1F3D]">
                  How to Use OSMR
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: `1px solid ${T.border}` }} className="py-8 text-center">
        <p style={{ fontFamily: "'DM Sans', system-ui", color: "#AEAAA4" }} className="text-[11px] leading-6">
          The Capital Steward, LLC · thecapitalsteward.com · inquiries@thecapitalsteward.com
          <br />
          © 2026 The Capital Steward, LLC. All rights reserved. For informational purposes only. Not investment advice.
        </p>
      </div>

    </main>
  )
}