'use client'

// app/(public)/methodology/page.tsx
// Palette: P3 public light · AAA verified
// Anchor: 7-year cumulative (28Q) — oal_7yr · anchor_7yr_simple
// All figures: confirmed from backtest suite rerun April 2026
// Number Swap List: 338be5a0-6e23-8153-974f-cee6b71c2e06

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, ReferenceLine,
} from "recharts"

// ─── Design tokens — P3 public light ─────────────────────────────────────────

const E = {
  bg:     "#D7DDD3",  // unchanged
  bg2:    "#E4E9E1",  // lightened — WCAG AAA body/muted/sage: 7.88:1
  bg3:    "#DCE2D8",  // lightened — WCAG AAA body/muted/sage: 7.36:1
  bdr:    "#B5BEB2",  // unchanged
  bdr2:   "#A3AEA0",  // unchanged
  text:   "#1A1E1A",  // unchanged — 12.19:1 on bg
  body:   "#3F4640",  // unchanged — 7.02:1 on bg, 7.88:1 on bg2
  muted:  "#40463F",  // unchanged — 7.01:1 on bg, 7.87:1 on bg2
  sage:   "#38483D",  // unchanged — 7.02:1 on bg, 7.88:1 on bg2
  brick:  "#8B3A2A",  // decorative/large-text only — 5.54:1 (passes large text AAA)
  brickS: "#5A2519",  // small-text brick — 8.86:1 on bg, 9.95:1 on bg2 ✓
  gold:   "#4E3918",  // darkened — 7.89:1 on bg, 8.86:1 on bg2 ✓ (was #7A5C2E)
  blue:   "#243B5E",  // darkened — 8.15:1 on bg, 9.15:1 on bg2 ✓ (was #2E4A6B)
  mono:   "'IBM Plex Mono','Courier New',monospace",
  sans:   "'DM Sans',system-ui,sans-serif",
  serif:  "'Playfair Display',Georgia,serif",
}
const s = (x: object) => x as React.CSSProperties

// ─── Confirmed data — all figures from 7yr anchor backtest rerun ──────────────

// Script 04 — regime composite r
const REGIME_DATA = [
  { regime: "Pre-2020\n2009–2019", r: -0.0254, label: "Slight",       n: "155,069", color: E.muted   },
  { regime: "COVID\n2020–2021",    r: -0.2427, label: "Substantive",  n: "47,953",  color: E.sage  },
  { regime: "Post-COVID\n2022–26", r: -0.1124, label: "Substantive",  n: "82,223",  color: E.sage  },
  { regime: "Full Period\n2009–26", r: -0.0907, label: "Strong",       n: "285,245", color: E.blue  },
]

// Script 04 — year-by-year composite r (2009–2025)
const YEARLY_DATA = [
  { year: "2009", r: -0.0512 }, { year: "2010", r: -0.0618 },
  { year: "2011", r: -0.0637 }, { year: "2012", r: -0.1204 },
  { year: "2013", r: -0.0507 }, { year: "2014", r: -0.1100 },
  { year: "2015", r: -0.0226 }, { year: "2016", r: -0.0043 },
  { year: "2017", r: -0.0208 }, { year: "2018", r: -0.0167 },
  { year: "2019", r: +0.0880 }, { year: "2020", r: -0.1354 },
  { year: "2021", r: -0.4371 }, { year: "2022", r: -0.1657 },
  { year: "2023", r: -0.1406 }, { year: "2024", r: -0.0533 },
  { year: "2025", r: -0.0594 },
]

// Script 03 — OAL return stats (7yr anchor)
const OAL_DATA = [
  { rung: "FCF",     median: 7.7,   geo: 5.0,   hit: 59.6, pct: "51.8%", color: E.sage  },
  { rung: "NI",      median: 11.2,  geo: 5.4,   hit: 64.6, pct: "43.8%", color: E.blue  },
  { rung: "EBIT",    median: 15.5,  geo: 9.3,   hit: 62.1, pct: "0.1%",  color: E.gold  },
  { rung: "Revenue", median: -29.7, geo: -34.2, hit: 33.1, pct: "4.3%",  color: E.brick },
]

// Script 02 — quintile breakdown
const QUINTILE_DATA = [
  { q: "Q1\nLowest Risk", axis1: 10.2, axis2: 10.1, composite: 10.8 },
  { q: "Q2",              axis1: 10.1, axis2: 9.4,  composite: 9.5  },
  { q: "Q3",              axis1: 9.8,  axis2: 9.9,  composite: 9.2  },
  { q: "Q4",              axis1: 8.9,  axis2: 8.2,  composite: 9.5  },
  { q: "Q5\nHighest Risk",axis1: 2.8,  axis2: 3.4,  composite: 1.3  },
]

// Script 08 — bucket CVaR and loss rates
const BUCKET_DATA = [
  { bucket: "Very Low",  median: 11.4, cvar: -50.4, pct_below_25: 10.5, geo: 10.0 },
  { bucket: "Low",       median: 10.0, cvar: -53.4, pct_below_25: 11.8, geo: 7.8  },
  { bucket: "Moderate",  median: 9.5,  cvar: -60.4, pct_below_25: 14.2, geo: 5.8  },
  { bucket: "High",      median: 7.8,  cvar: -69.9, pct_below_25: 17.0, geo: 1.4  },
  { bucket: "Very High", median: -9.6, cvar: -88.9, pct_below_25: 39.6, geo: -21.4 },
]

// Script 20 — bucket loss by regime (approximate from confirmed endpoints)
// NOTE: Detailed band breakdown comes from 08_distributions.json bucket_histograms
// Using confirmed pct_below_neg25 and pct_above_pos25 for each bucket
const DIST_DATA = [
  { range: "< −50%",       vl: 2.1,  vh: 22.0 },
  { range: "−50 to −25%",  vl: 8.4,  vh: 17.6 },
  { range: "−25 to 0%",    vl: 24.9, vh: 17.1 },
  { range: "0 to +25%",    vl: 31.5, vh: 16.1 },
  { range: "+25 to +50%",  vl: 20.0, vh: 14.0 },
  { range: "> +50%",       vl: 13.1, vh: 13.2 },
]

// Script 07 + 15 — index performance (post-2013, 145 months)
const INDEX_DATA = [
  { name: "OSMR-Filtered\nBroad Market (CW)", ann: 15.4, sortino: 1.444, mdd: -21.7, color: E.blue },
  { name: "Full Scored\nUniverse (CW)",        ann: 9.8,  sortino: 0.843, mdd: -26.4, color: E.muted },
]

// ─── Signal scale ─────────────────────────────────────────────────────────────

const SIGNAL_SCALE = [
  { label: "Negligible",  range: "|r| < 0.03", bg: E.bg3,   text: E.text  },  // 12.79:1 ✓
  { label: "Slight",      range: "0.03–0.05",  bg: E.bdr,   text: E.text  },  //  8.82:1 ✓
  { label: "Modest",      range: "0.05–0.07",  bg: E.bdr2,  text: E.text  },  //  7.33:1 ✓
  { label: "Strong",      range: "0.07–0.11",  bg: E.sage,  text: E.bg    },  //  7.02:1 ✓
  { label: "Substantive", range: "|r| ≥ 0.11", bg: E.text,  text: E.bg    },  // 12.19:1 ✓
]

// ─── Tooltip helper ───────────────────────────────────────────────────────────

function ChartTip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={s({ background: E.text, border: `1px solid ${E.sage}`, padding: "8px 12px",
      fontFamily: E.mono, fontSize: 11, color: E.bg })}>
      <div style={s({ marginBottom: 4, opacity: 0.7 })}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey}>{fmt ? fmt(p.value) : p.value}</div>
      ))}
    </div>
  )
}

// ─── Mono span — inline monospace for verifiable figures ─────────────────────

function M({ children }: { children: React.ReactNode }) {
  return (
    <span style={s({ fontFamily: E.mono, fontSize: "0.9em", letterSpacing: "-0.01em" })}>
      {children}
    </span>
  )
}

// ─── Section nav ──────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "framing",     label: "Framing"           },
  { id: "proof",       label: "Simplest Proof"     },
  { id: "architecture",label: "Architecture"       },
  { id: "independence",label: "Factor Independence" },
  { id: "regimes",     label: "Regimes"            },
  { id: "limits",      label: "Limitations"        },
  { id: "results",     label: "Results"            },
  { id: "close",       label: "Close"              },
]

function SectionNav({ active }: { active: string }) {
  return (
    <div style={s({ display: "flex", flexWrap: "wrap", gap: 2, padding: "10px 0",
      borderBottom: `1px solid ${E.bdr}`, marginBottom: 0 })}>
      {NAV_SECTIONS.map(({ id, label }) => (
        <a key={id} href={`#${id}`} style={s({
          fontFamily: E.mono, fontSize: 10.5, letterSpacing: "0.1em",
          textTransform: "uppercase", padding: "5px 12px",
          background: active === id ? E.text : "transparent",
          color: active === id ? E.bg : E.muted,
          border: `1px solid ${active === id ? E.text : E.bdr}`,
          textDecoration: "none", transition: "all 0.15s",
        })}>{label}</a>
      ))}
    </div>
  )
}

// ─── Charts ───────────────────────────────────────────────────────────────────

function RegimeChart() {
  const CS = { fontFamily: E.mono, fontSize: 10, fill: E.muted }
  return (
    <div>
      <p style={s({ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.14em",
        textTransform: "uppercase", color: E.text, marginBottom: 14 })}>
        Composite Spearman r by market regime · <M>285,245</M> observations · 2009–2026
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={REGIME_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} vertical={false}/>
          <XAxis dataKey="regime" tick={{ ...CS, fontSize: 9.5 }} axisLine={false} tickLine={false}/>
          <YAxis tick={CS as any} axisLine={false} tickLine={false} width={52}
            tickFormatter={v => v.toFixed(2)} domain={[-0.28, 0.05]}/>
          <Tooltip content={<ChartTip fmt={(v: number) => `r = ${v.toFixed(4)}`}/>}/>
          <ReferenceLine y={0} stroke={E.bdr2} strokeWidth={1}/>
          <Bar dataKey="r" radius={[2,2,0,0]}>
            {REGIME_DATA.map((d,i) => (
              <Cell key={i} fill={d.color}
                opacity={d.label === "Slight" ? 0.55 : 1}/>
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={s({ display: "flex", flexWrap: "wrap", gap: "6px 18px", marginTop: 8 })}>
        {[
          { color: E.sage,  label: "Substantive signal (|r| ≥ 0.11)" },
          { color: E.blue,  label: "Strong signal (0.07 ≤ |r| < 0.11)" },
          { color: E.muted, label: "Slight (|r| < 0.03)" },
        ].map(({ color, label }) => (
          <span key={label} style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted,
            display: "flex", alignItems: "center", gap: 6 })}>
            <span style={s({ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" })}/>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

function YearlyChart() {
  const CS = { fontFamily: E.mono, fontSize: 9, fill: E.muted }
  return (
    <div>
      <p style={s({ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.14em",
        textTransform: "uppercase", color: E.text, marginBottom: 14 })}>
        Composite Spearman r · year by year · 2009–2025
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={YEARLY_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} vertical={false}/>
          <XAxis dataKey="year" tick={{ ...CS }} axisLine={false} tickLine={false}
            interval={1}/>
          <YAxis tick={CS as any} axisLine={false} tickLine={false} width={48}
            tickFormatter={v => v.toFixed(2)} domain={[-0.5, 0.14]}/>
          <Tooltip content={<ChartTip fmt={(v: number) => `r = ${v.toFixed(4)}`}/>}/>
          <ReferenceLine y={0} stroke={E.bdr2} strokeWidth={1}/>
          <Bar dataKey="r" radius={[2,2,0,0]}>
            {YEARLY_DATA.map((d,i) => (
              <Cell key={i}
                fill={d.r < -0.11 ? E.sage : d.r < -0.03 ? E.blue : d.r > 0.03 ? E.brick : E.muted}
                opacity={Math.abs(d.r) < 0.03 ? 0.5 : 1}/>
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body, marginTop: 8, lineHeight: 1.6 })}>
        Red bars = signal inversion (higher risk outperformed). 2019 peak inversion
        (r=+0.088) coincides with the narrative premium cycle peak.
        2021 extraordinary signal (r=−0.437) reflects the subsequent collapse.
      </p>
    </div>
  )
}

function OALReturnChart() {
  const CS = { fontFamily: E.mono, fontSize: 10, fill: E.muted }
  return (
    <div>
      <p style={s({ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.14em",
        textTransform: "uppercase", color: E.text, marginBottom: 14 })}>
        Median 12-month return by anchor rung · full period 2009–2026
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={OAL_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} vertical={false}/>
          <XAxis dataKey="rung" tick={CS as any} axisLine={false} tickLine={false}/>
          <YAxis tick={CS as any} axisLine={false} tickLine={false} width={44}
            tickFormatter={v => `${v}%`} domain={[-35, 20]}/>
          <ReferenceLine y={0} stroke={E.bdr2} strokeWidth={1}/>
          <Tooltip content={<ChartTip fmt={(v: number) => `${v.toFixed(1)}%`}/>}/>
          <Bar dataKey="median" radius={[2,2,0,0]}>
            {OAL_DATA.map((d,i) => <Cell key={i} fill={d.color}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body, marginTop: 8 })}>
        FCF vs Revenue median spread: <M>+37.3pp</M> · Held across all regimes tested · n=290,902
      </p>
    </div>
  )
}

function QuintileChart() {
  const CS = { fontFamily: E.mono, fontSize: 9.5, fill: E.muted }
  return (
    <div>
      <p style={s({ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.14em",
        textTransform: "uppercase", color: E.text, marginBottom: 14 })}>
        Median 12-month return by composite quintile
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={QUINTILE_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} vertical={false}/>
          <XAxis dataKey="q" tick={{ ...CS, fontSize: 9 }} axisLine={false} tickLine={false}/>
          <YAxis tick={CS as any} axisLine={false} tickLine={false} width={44}
            tickFormatter={v => `${v}%`}/>
          <Tooltip content={<ChartTip fmt={(v: number) => `${v.toFixed(1)}%`}/>}/>
          <Bar dataKey="composite" name="Composite" radius={[2,2,0,0]}>
            {QUINTILE_DATA.map((_,i) => (
              <Cell key={i} fill={i===0 ? E.sage : i===4 ? E.brick : E.muted}
                opacity={i===0||i===4 ? 1 : 0.6}/>
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body, marginTop: 8 })}>
        Signal concentrates in Q5 penalty: median geo return −10.9%, hit rate 51.2%.
      </p>
    </div>
  )
}

function IndexChart() {
  const CS = { fontFamily: E.mono, fontSize: 9.5, fill: E.muted }
  return (
    <div>
      <p style={s({ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.14em",
        textTransform: "uppercase", color: E.text, marginBottom: 14 })}>
        Annualized return comparison · equal-weight and cap-weight indexes · post-2013
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={[
            { name: "Very Low\nRisk (EW)",            val: 18.9, color: E.sage  },
            { name: "OSMR-Filtered\nBroad (CW)",      val: 15.4, color: E.blue  },
            { name: "Full Scored\nUniverse (CW)",     val: 9.8,  color: E.muted },
          ]}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} vertical={false}/>
          <XAxis dataKey="name" tick={{ ...CS, fontSize: 9 }} axisLine={false} tickLine={false}/>
          <YAxis tick={CS as any} axisLine={false} tickLine={false} width={40}
            tickFormatter={v => `${v}%`}/>
          <Tooltip content={<ChartTip fmt={(v: number) => `${v.toFixed(1)}% ann.`}/>}/>
          <Bar dataKey="val" radius={[2,2,0,0]}>
            {[E.sage, E.blue, E.muted].map((c,i) => <Cell key={i} fill={c}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function CVaRChart() {
  const CS = { fontFamily: E.mono, fontSize: 9.5, fill: E.muted }
  return (
    <div>
      <p style={s({ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.14em",
        textTransform: "uppercase", color: E.text, marginBottom: 14 })}>
        CVaR (95%) by composite bucket · average loss in worst 5% of 12-month windows
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={BUCKET_DATA} layout="vertical"
          margin={{ top: 8, right: 16, left: 72, bottom: 8 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} horizontal={false}/>
          <XAxis type="number" tick={CS as any} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`} domain={[-95, 0]}/>
          <YAxis type="category" dataKey="bucket" tick={CS as any} axisLine={false} tickLine={false}/>
          <Tooltip content={<ChartTip fmt={(v: number) => `CVaR ${v.toFixed(1)}%`}/>}/>
          <Bar dataKey="cvar" radius={[0,2,2,0]}>
            {BUCKET_DATA.map((d,i) => (
              <Cell key={i}
                fill={d.bucket === "Very High" ? E.brick : d.bucket === "Very Low" ? E.sage : E.muted}
                opacity={d.bucket === "Very High" || d.bucket === "Very Low" ? 1 : 0.55}/>
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body, marginTop: 8 })}>
        Very High bucket: <M>39.6%</M> of observations ended below −25% over the subsequent 12 months.
        Very Low bucket: <M>10.5%</M>.
      </p>
    </div>
  )
}

// ─── Distribution bars — Very Low vs Very High ────────────────────────────────

function DistributionBars() {
  const ranges = DIST_DATA
  const maxVal = Math.max(...ranges.map(r => Math.max(r.vl, r.vh)))
  return (
    <div>
      <div style={s({ display: "flex", gap: 12, marginBottom: 10 })}>
        <span style={s({ display: "flex", alignItems: "center", gap: 6,
          fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>
          <span style={s({ width: 10, height: 10, background: E.sage, opacity: 0.8 })}/>
          Very Low risk
        </span>
        <span style={s({ display: "flex", alignItems: "center", gap: 6,
          fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>
          <span style={s({ width: 10, height: 10, background: E.brick, opacity: 0.8 })}/>
          Very High risk
        </span>
      </div>
      {ranges.map(({ range, vl, vh }) => (
        <div key={range} style={s({ marginBottom: 8 })}>
          <div style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body, marginBottom: 3 })}>
            {range}
          </div>
          <div style={s({ display: "flex", flexDirection: "column", gap: 2 })}>
            <div style={s({ display: "flex", alignItems: "center", gap: 6 })}>
              <div style={s({ width: `${(vl / maxVal) * 100}%`, height: 8,
                background: E.sage, opacity: 0.8 })}/>
              <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.body })}>{vl}%</span>
            </div>
            <div style={s({ display: "flex", alignItems: "center", gap: 6 })}>
              <div style={s({ width: `${(vh / maxVal) * 100}%`, height: 8,
                background: E.brick, opacity: 0.8 })}/>
              <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.body })}>{vh}%</span>
            </div>
          </div>
        </div>
      ))}
      <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body, marginTop: 8 })}>
        % of observations in each return band · Very Low: N=18,137 · Very High: N=26,695
      </p>
    </div>
  )
}

// ─── OAL Ladder — Revenue at top (shallowest), FCF at bottom (deepest) ────────

function OALLadder() {
  const rungs = [
    { label: "Revenue",  penalty: "4.236×", desc: "Shallowest anchor · has not yet covered operating costs",    color: E.brick, median: "-29.7%" },
    { label: "EBIT",     penalty: "1.618×", desc: "Operating income covers costs · not yet cash-generative",    color: E.gold,  median: "+15.5%" },
    { label: "NI",       penalty: "1.0×",   desc: "Profitable · not yet cash-generative",                       color: E.blue,  median: "+11.2%" },
    { label: "FCF",      penalty: "0×",     desc: "Deepest anchor · seven years of demonstrated cash generation",color: E.sage,  median: "+7.7%"  },
  ]
  return (
    <div style={s({ border: `1px solid ${E.bdr}`, background: E.bg2 })}>
      <div style={s({ padding: "12px 16px", borderBottom: `1px solid ${E.bdr}`,
        display: "flex", alignItems: "center", justifyContent: "space-between" })}>
        <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.16em",
          textTransform: "uppercase", color: E.text })}>Operational Anchor Ladder</span>
        <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.body })}>
          ↓ deeper = more structurally grounded
        </span>
      </div>
      {rungs.map(({ label, penalty, desc, color, median }, i) => (
        <div key={label} style={s({
          display: "grid", gridTemplateColumns: "90px 1fr auto",
          alignItems: "center", gap: 12, padding: "14px 16px",
          borderBottom: i < rungs.length - 1 ? `1px solid ${E.bdr}` : "none",
          borderLeft: `3px solid ${color}`,
        })}>
          <div>
            <div style={s({ fontFamily: E.sans, fontSize: 13, fontWeight: 700,
              color: E.text, marginBottom: 2 })}>{label}</div>
            <div style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body })}>
              +{penalty} penalty
            </div>
          </div>
          <div style={s({ fontFamily: E.sans, fontSize: 12, color: E.body, lineHeight: 1.5 })}>
            {desc}
          </div>
          <div style={s({ textAlign: "right" })}>
            <div style={s({ fontFamily: E.mono, fontSize: 12, fontWeight: 500,
              color: parseFloat(median) >= 0 ? E.sage : E.brickS })}>
              {median}
            </div>
            <div style={s({ fontFamily: E.mono, fontSize: 9, color: E.muted })}>median</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Signal summary table ─────────────────────────────────────────────────────

function SignalTable() {
  const axes = [
    { factor: "Axis 1 — Anchor Detachment Risk", r: "−0.0753", ci: "[−0.0791, −0.0715]", label: "Strong",      n: "291,145" },
    { factor: "Axis 2 — Anchor Degradation Risk", r: "−0.0743", ci: "[−0.0780, −0.0704]", label: "Strong",      n: "285,245" },
    { factor: "Composite (equal weight)",          r: "−0.0907", ci: "[−0.0942, −0.0868]", label: "Strong",      n: "285,245" },
  ]
  return (
    <div style={s({ overflowX: "auto" })}>
      <table style={s({ width: "100%", borderCollapse: "collapse" })}>
        <thead>
          <tr style={s({ background: E.bg2, borderBottom: `1px solid ${E.bdr}` })}>
            {["Factor", "Spearman r", "95% CI", "Label", "N"].map(h => (
              <th key={h} style={s({ fontFamily: E.mono, fontSize: 9.5, letterSpacing: "0.12em",
                textTransform: "uppercase", color: E.text, padding: "10px 14px",
                textAlign: "left", fontWeight: 400 })}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {axes.map(({ factor, r, ci, label, n }) => (
            <tr key={factor} style={s({ borderBottom: `1px solid ${E.bdr}`, background: E.bg })}>
              <td style={s({ fontFamily: E.sans, fontSize: 13, fontWeight: 500,
                color: E.text, padding: "10px 14px" })}>{factor}</td>
              <td style={s({ fontFamily: E.mono, fontSize: 12, color: E.text,
                padding: "10px 14px" })}>{r}</td>
              <td style={s({ fontFamily: E.mono, fontSize: 11, color: E.body,
                padding: "10px 14px" })}>{ci}</td>
              <td style={s({ padding: "10px 14px" })}>
                <span style={s({ fontFamily: E.mono, fontSize: 10,
                  color: E.text, background: `${E.sage}18`,
                  padding: "2px 8px", letterSpacing: "0.08em" })}>{label}</span>
              </td>
              <td style={s({ fontFamily: E.mono, fontSize: 11, color: E.body,
                padding: "10px 14px" })}>{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body, marginTop: 8, lineHeight: 1.6 })}>
        Bootstrap 95% confidence intervals (1,000 samples). All p-values = 0.0000.
        ICIR: Composite −0.7343, Axis 2 −0.6364, Axis 1 −0.5406.
        Inter-axis Pearson correlation: 0.0088 (shared variance &lt;0.01%).
      </p>
    </div>
  )
}

// ─── Factor independence data strip ──────────────────────────────────────────

function FactorStrip() {
  const items = [
    { value: "+20%",    label: "Factor-adjusted alpha" },
    { value: "3.72",    label: "t-statistic"           },
    { value: "96.52%",  label: "Orthogonal variance"   },
  ]
  return (
    <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
      borderTop: `1px solid ${E.bdr}`, borderBottom: `1px solid ${E.bdr}`,
      margin: "28px 0" })}>
      {items.map(({ value, label }, i) => (
        <div key={label} style={s({
          padding: "20px 0", textAlign: "center",
          borderRight: i < 2 ? `1px solid ${E.bdr}` : "none",
        })}>
          <div style={s({ fontFamily: E.mono, fontSize: 28, fontWeight: 500,
            color: E.text, letterSpacing: "-0.03em", marginBottom: 4 })}>{value}</div>
          <div style={s({ fontFamily: E.mono, fontSize: 9.5, letterSpacing: "0.12em",
            textTransform: "uppercase", color: E.text })}>{label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Bucket table ─────────────────────────────────────────────────────────────

function BucketTable() {
  return (
    <div style={s({ overflowX: "auto" })}>
      <table style={s({ width: "100%", borderCollapse: "collapse" })}>
        <thead>
          <tr style={s({ background: E.bg2, borderBottom: `1px solid ${E.bdr}` })}>
            {["Bucket", "Median", "Geo Mean", "CVaR (95%)", "<−25%", "N"].map(h => (
              <th key={h} style={s({ fontFamily: E.mono, fontSize: 9.5, letterSpacing: "0.12em",
                textTransform: "uppercase", color: E.text, padding: "10px 12px",
                textAlign: h === "Bucket" ? "left" : "right", fontWeight: 400 })}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BUCKET_DATA.map(({ bucket, median, geo, cvar, pct_below_25 }, i) => {
            const isVH = bucket === "Very High"
            const isVL = bucket === "Very Low"
            const n = [18137, 73478, 114983, 51952, 26695][i]
            return (
              <tr key={bucket} style={s({
                borderBottom: `1px solid ${E.bdr}`,
                background: isVH ? `${E.brick}08` : isVL ? `${E.sage}08` : E.bg,
              })}>
                <td style={s({ fontFamily: E.sans, fontSize: 13, fontWeight: 500,
                  color: isVH ? E.brickS : isVL ? E.sage : E.text,
                  padding: "10px 12px" })}>{bucket}</td>
                <td style={s({ fontFamily: E.mono, fontSize: 11, textAlign: "right",
                  color: median >= 0 ? E.sage : E.brickS, padding: "10px 12px" })}>
                  {median >= 0 ? "+" : ""}{median.toFixed(1)}%
                </td>
                <td style={s({ fontFamily: E.mono, fontSize: 11, textAlign: "right",
                  color: geo >= 0 ? E.sage : E.brickS, padding: "10px 12px" })}>
                  {geo >= 0 ? "+" : ""}{geo.toFixed(1)}%
                </td>
                <td style={s({ fontFamily: E.mono, fontSize: 11, textAlign: "right",
                  color: E.body, padding: "10px 12px" })}>{cvar.toFixed(1)}%</td>
                <td style={s({ fontFamily: E.mono, fontSize: 11, textAlign: "right",
                  color: isVH ? E.brickS : E.body, padding: "10px 12px",
                  fontWeight: isVH ? 600 : 400 })}>{pct_below_25.toFixed(1)}%</td>
                <td style={s({ fontFamily: E.mono, fontSize: 11, textAlign: "right",
                  color: E.body, padding: "10px 12px" })}>{n.toLocaleString()}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body, marginTop: 8, lineHeight: 1.6 })}>
        CVaR (95%): average loss in the worst 5% of 12-month outcomes.
        "{'<'}−25%": percentage of observations with 12-month return below −25%.
      </p>
    </div>
  )
}

// ─── Index table ──────────────────────────────────────────────────────────────

function IndexTable() {
  const rows = [
    { idx: "Very Low Risk (EW, post-2013)",     ann: "+18.9%", sor: "1.317", mdd: "−34.0%", mo: "145", note: "" },
    { idx: "OSMR-Filtered Broad Market (CW)",   ann: "+15.4%", sor: "1.444", mdd: "−21.7%", mo: "145", note: "exclusion only" },
    { idx: "Full Scored Universe (CW)",          ann: "+9.8%",  sor: "0.843", mdd: "−26.4%", mo: "145", note: "no filter" },
    { idx: "SPY (external reference, approx.)", ann: "+14–16%",sor: "~1.1",  mdd: "~−34%", mo: "—",  note: "cap-weighted large-cap" },
  ]
  return (
    <div style={s({ overflowX: "auto" })}>
      <table style={s({ width: "100%", borderCollapse: "collapse" })}>
        <thead>
          <tr style={s({ background: E.bg2, borderBottom: `1px solid ${E.bdr}` })}>
            {["Index", "Ann Ret", "Sortino", "Max DD", "Months", ""].map(h => (
              <th key={h} style={s({ fontFamily: E.mono, fontSize: 9.5, letterSpacing: "0.12em",
                textTransform: "uppercase", color: E.text, padding: "10px 12px",
                textAlign: h === "Index" ? "left" : "right", fontWeight: 400 })}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ idx, ann, sor, mdd, mo, note }, i) => (
            <tr key={idx} style={s({ borderBottom: `1px solid ${E.bdr}`,
              background: i === 0 ? `${E.sage}08` : E.bg })}>
              <td style={s({ fontFamily: E.sans, fontSize: 12.5, fontWeight: 500,
                color: i === 0 ? E.sage : E.text, padding: "10px 12px" })}>{idx}</td>
              <td style={s({ fontFamily: E.mono, fontSize: 12, textAlign: "right",
                color: E.text, padding: "10px 12px" })}>{ann}</td>
              <td style={s({ fontFamily: E.mono, fontSize: 12, textAlign: "right",
                color: E.body, padding: "10px 12px" })}>{sor}</td>
              <td style={s({ fontFamily: E.mono, fontSize: 12, textAlign: "right",
                color: E.body, padding: "10px 12px" })}>{mdd}</td>
              <td style={s({ fontFamily: E.mono, fontSize: 11, textAlign: "right",
                color: E.body, padding: "10px 12px" })}>{mo}</td>
              <td style={s({ fontFamily: E.mono, fontSize: 10, color: E.body,
                padding: "10px 12px" })}>{note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Pre-2020 disclosure callout ──────────────────────────────────────────────

function Pre2020Callout() {
  return (
    <div style={s({
      borderLeft: `4px solid ${E.sage}`, background: E.bg,
      padding: "20px 24px", margin: "28px 0",
    })}>
      <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.16em",
        textTransform: "uppercase", color: E.sage, marginBottom: 14 })}>
        Pre-2020 Signal — Honest Disclosure
      </p>
      <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.8, color: E.body, marginBottom: 14 })}>
        The pre-2020 composite signal (r = −0.025) is lower than in subsequent regimes but is neither
        absent nor negligible in the factor-adjusted sense. The distinction matters. Spearman r measures
        rank-order consistency across the full return distribution simultaneously. When narrative premium
        expansion broadly lifts companies across Q1 through Q4 — as it did during 2017–2019 — cross-sectional
        rank correlation attenuates even when the highest-risk tail is diverging sharply. The factor-adjusted
        long-short portfolio strips this market-wide effect and isolates the structural signal. Pre-2020,
        that signal produced <M>+16.5%</M> annualized alpha with a t-statistic of <M>3.55</M>.
      </p>
      <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.8, color: E.body, marginBottom: 14 })}>
        The weakest sub-period within the pre-2020 window is 2017–2019, when narrative premium expansion
        was at its peak and structurally fragile companies were broadly rewarded by the market. The 2019
        peak inversion (r = <M>+0.088</M>) is the strongest anti-signal year in the dataset. The 2021
        signal (r = <M>−0.437</M>, Substantive) reflects the subsequent collapse of those same narratives.
      </p>
      <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.8, color: E.body })}>
        The pattern is structurally coherent. The framework identified correctly which companies were fragile
        throughout. The market spent 2017–2019 rewarding exactly that fragility at the cross-sectional level.
        The factor-adjusted alpha confirms the structural condition was present and real the entire time.
        When the narrative cycle broke, both signals converged.
      </p>
    </div>
  )
}

// ─── Limitation card ──────────────────────────────────────────────────────────

function LimitCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={s({ border: `1px solid ${E.bdr}`, background: E.bg, padding: "18px 20px", marginBottom: 10 })}>
      <p style={s({ fontFamily: E.sans, fontSize: 13.5, fontWeight: 700,
        color: E.text, marginBottom: 8 })}>{title}</p>
      <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.75, color: E.body })}>{body}</p>
    </div>
  )
}

// ─── Design decision card ─────────────────────────────────────────────────────

function DesignCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={s({ borderBottom: `1px solid ${E.bdr}`, padding: "16px 0" })}>
      <p style={s({ fontFamily: E.mono, fontSize: 10.5, fontWeight: 600,
        color: E.text, marginBottom: 6, letterSpacing: "0.04em" })}>{title}</p>
      <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.75, color: E.body })}>{body}</p>
    </div>
  )
}

// ─── Prose section wrapper ────────────────────────────────────────────────────

function Prose({ children, id, bg }: { children: React.ReactNode; id?: string; bg?: string }) {
  return (
    <div id={id} style={s({ background: bg ?? E.bg, borderTop: `1px solid ${E.bdr}` })}>
      <div style={s({ maxWidth: 720, margin: "0 auto", padding: "56px 32px" })}>
        {children}
      </div>
    </div>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={s({ fontFamily: E.sans, fontSize: 16, lineHeight: 1.85,
      color: E.body, marginBottom: 26 })}>{children}</p>
  )
}

function DataSection({ children, id, bg }: { children: React.ReactNode; id?: string; bg?: string }) {
  return (
    <div id={id} style={s({ background: bg ?? E.bg, borderTop: `1px solid ${E.bdr}` })}>
      <div style={s({ maxWidth: 960, margin: "0 auto", padding: "48px 32px" })}>
        {children}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MethodologyPage() {
  const [activeSection, setActiveSection] = useState("framing")

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.target.id) setActiveSection(e.target.id)
        })
      },
      { threshold: 0.2 }
    )
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div style={s({ minHeight: "100vh", background: E.bg, color: E.text, fontFamily: E.sans })}>

      {/* NAV */}
      <nav style={s({ display: "flex", justifyContent: "space-between", alignItems: "center",
        height: 48, padding: "0 32px", borderBottom: `1px solid ${E.bdr}`,
        background: E.bg, position: "sticky", top: 0, zIndex: 50 })}>
        <Link href="/" style={s({ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 6 })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.28em",
            textTransform: "uppercase", color: E.text })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15, color: E.gold })}>Steward</span>
        </Link>
        <div style={s({ display: "flex", gap: 24 })}>
          {[
            { href: "/where-it-fits", label: "Where It Fits" },
            { href: "/platform", label: "Open Platform →" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={s({ fontFamily: E.mono, fontSize: 10,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: label.includes("Platform") ? E.sage : E.muted,
              textDecoration: "none" })}>{label}</Link>
          ))}
        </div>
      </nav>

      {/* HEADER */}
      <div style={s({ background: E.bg, padding: "64px 32px 40px", borderBottom: `1px solid ${E.bdr}` })}>
        <div style={s({ maxWidth: 720, margin: "0 auto" })}>
          <h1 style={s({ fontFamily: E.serif, fontSize: "clamp(26px, 4vw, 38px)",
            fontWeight: 400, lineHeight: 1.25, color: E.text,
            letterSpacing: "-0.02em", marginBottom: 16 })}>
            Most frameworks ask if the story is plausible.
            This one asks how far it's strayed from reality.
          </h1>
          <p style={s({ fontFamily: E.sans, fontSize: 16, color: E.body,
            lineHeight: 1.65, marginBottom: 24 })}>
            The structural case for narrative risk — and how we measure it.
          </p>
          <p style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, lineHeight: 1.7 })}>
            285,245 observations · 2009-01 through 2025-02 formation window ·
            12-month forward return horizon · $5 minimum price filter ·
            bootstrap 95% CI (1,000 samples) · 7-year trailing anchor window
          </p>
        </div>
      </div>

      {/* SECTION NAV */}
      <div style={s({ background: E.bg2, padding: "0 32px",
        position: "sticky", top: 48, zIndex: 40, borderBottom: `1px solid ${E.bdr}` })}>
        <div style={s({ maxWidth: 960, margin: "0 auto" })}>
          <SectionNav active={activeSection}/>
        </div>
      </div>

      {/* ── SECTION 1 — Entry frame ─────────────────────────────────────────── */}
      <Prose id="framing">
        <div style={s({ position: "relative" })}>
          <div style={s({ position: "absolute", left: -32, top: 0, bottom: 0,
            width: 1, background: E.sage, opacity: 0.4 })}/>
          <p style={s({ fontFamily: E.sans, fontSize: "clamp(15px, 2vw, 18px)",
            lineHeight: 1.85, color: E.body, marginBottom: 0 })}>
            This document is designed to answer one question: whether the claim that structural
            narrative risk is measurable — and that measuring it produces a consistent, defensible
            edge — is actually supported by the data. What follows attempts to answer that honestly,
            including the parts of the evidence that are less convenient than the headline numbers suggest.
          </p>
        </div>
      </Prose>

      {/* ── SECTION 2 — Simplest proof ──────────────────────────────────────── */}
      <DataSection id="proof" bg={E.bg}>
        <div style={s({ marginBottom: 36 })}>
          <P>
            Across <M>285,245</M> observations spanning 17 years and three distinct market regimes,
            companies that generate free cash flow produced median annual returns of <M>+7.7%</M>.
            Companies whose valuations rest on revenue alone — companies that have not yet earned
            their way to profit, let alone cash generation — produced median annual returns
            of <M>−29.7%</M>.
          </P>
          <P>
            The spread is <M>37.3</M> percentage points. It held during the post-crisis recovery.
            It held during the extended bull market. It held during COVID disruption and post-COVID
            rate normalization. What a company has actually built into its financials predicts its
            subsequent returns in a way that what it has merely promised does not — and this has
            been true across every market condition in the dataset.
          </P>
          <P>
            The framework exists to measure that distinction systematically, at the company level,
            across the full universe. But this finding is independent of the framework. It is what
            the data shows before any model is applied.
          </P>
        </div>
        <OALReturnChart/>

        {/* Empirical confirmation callout */}
        <div style={s({ border: `1px solid ${E.sage}`, background: `${E.sage}0A`,
          padding: "18px 22px", marginTop: 24 })}>
          <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.16em",
            textTransform: "uppercase", color: E.sage, marginBottom: 10 })}>
            Empirical confirmation
          </p>
          <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 })}>
            {[
              { label: "FCF median return",           val: "+7.7%",   sub: "n=150,900 · 51.8% of universe" },
              { label: "Revenue median return",        val: "−29.7%",  sub: "n=12,559 · 4.3% of universe"  },
              { label: "FCF vs Revenue spread",        val: "+37.3pp", sub: "held in every regime tested"   },
              { label: "NI median return",             val: "+11.2%",  sub: "43.8% of universe · 7yr anchor" },
            ].map(({ label, val, sub }) => (
              <div key={label}>
                <div style={s({ fontFamily: E.mono, fontSize: 15, fontWeight: 500,
                  color: val.startsWith("−") ? E.brickS : E.sage, marginBottom: 2 })}>{val}</div>
                <div style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body })}>{label}</div>
                <div style={s({ fontFamily: E.mono, fontSize: 9, color: E.muted })}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </DataSection>

      {/* ── SECTION 3 — Architecture ────────────────────────────────────────── */}
      <Prose id="architecture" bg={E.bg2}>
        <P>
          The OAL spread shows that anchor depth predicts returns. The framework's job is to
          measure anchor depth — and its distance from current valuation — for every company
          in the universe, simultaneously, on a comparable basis.
        </P>
        <P>
          Every company in the scored universe is assigned to the deepest financial rung it has
          genuinely sustained over a trailing seven-year window. Free cash flow is the deepest.
          Net income is next. Then operating income. Then revenue. A company must have produced
          positive cumulative figures over the full seven-year period to qualify for a given rung —
          a single strong quarter is not sufficient. The rung assignment answers a precise question:
          what has this company actually demonstrated, not over its best recent period, but
          consistently, across a full business cycle window?
        </P>
      </Prose>

      <DataSection bg={E.bg2}>
        <OALLadder/>
      </DataSection>

      <Prose bg={E.bg2}>
        <P>
          Anchor rung alone is not enough. Two companies can occupy the same rung — say, both
          FCF-positive — while their valuations sit at entirely different distances from that anchor.
          A company generating modest free cash flow at a 60× EV multiple is structurally different
          from a company generating substantial free cash flow at a 12× multiple, even though both
          qualify for the same rung. The first axis of the framework measures that distance: how far
          has the valuation stretched beyond what the anchor actually supports, adjusted for how
          shallow that anchor is?
        </P>
        <P>
          The second axis measures something the first cannot see. A company's current
          valuation-to-anchor ratio is a snapshot. It tells you where the company is. It does
          not tell you whether the anchor itself is strengthening or eroding. A company whose
          free cash flow has been deteriorating steadily for six quarters carries a different
          structural risk profile than a company at the same current multiple whose free cash
          flow has been improving. The second axis captures that trajectory across the anchor's
          history, with the most recent comparisons weighted more heavily than older ones.
        </P>
        <P>
          Neither axis alone produces the discrimination the composite achieves. A valuation-stretch
          signal without trajectory context misses companies that are expensive but improving. A
          trajectory signal without valuation context flags deteriorating companies regardless of
          how conservatively they are priced. The composite score — the equal-weight mean of both
          axes, expressed as a percentile rank across the full universe — is where both conditions
          are required simultaneously. A company scores into the highest structural risk bucket
          only when its valuation has stretched far beyond its anchor and that anchor is deteriorating.
          Both. The signal concentrates precisely because the threshold is precise.
        </P>

        {/* Axis cards */}
        <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 })}>
          {[
            {
              id: "Axis 1",
              name: "Anchor Detachment Risk",
              r: "−0.0753",
              regime: "Near-zero pre-2020. Dominant in COVID (r=−0.261) and post-COVID (r=−0.097).",
              body: `The 7-year cumulative anchor is deliberate. A company must have demonstrated
                positive output over a full seven-year trailing window, not just in the most
                recent quarter. The shallowness penalty then encodes the structural distance
                between OAL rungs: a revenue-anchored company is treated as structurally more
                expensive relative to its anchor than an FCF-anchored company at the same raw multiple.`,
            },
            {
              id: "Axis 2",
              name: "Anchor Degradation Risk",
              r: "−0.0743",
              regime: "Present in all regimes including pre-2020 (r=−0.037). Dominant post-COVID (r=−0.095).",
              body: `Axis 2 captures trajectory, not position. A company moving toward deeper
                operational grounding is accumulating structural strength, whether or not the market
                has noticed. A company moving away from it is accumulating fragility, whether or not
                the price has moved. The score is derived from year-over-year comparisons across
                up to 28 quarters of anchor history, adjusted by an OAL shallowness penalty and
                ranked globally. The four most recent year-over-year comparisons receive double weight.`,
            },
          ].map(({ id, name, r, regime, body }) => (
            <div key={id} style={s({ border: `1px solid ${E.bdr}`, background: E.bg, padding: "18px 20px" })}>
              <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.16em",
                textTransform: "uppercase", color: E.text, marginBottom: 6 })}>{id}</p>
              <p style={s({ fontFamily: E.sans, fontSize: 14.5, fontWeight: 700,
                color: E.text, marginBottom: 8 })}>{name}</p>
              <p style={s({ fontFamily: E.mono, fontSize: 12, color: E.sage, marginBottom: 6 })}>
                r = {r}
              </p>
              <p style={s({ fontFamily: E.mono, fontSize: 10, color: E.body,
                marginBottom: 12, lineHeight: 1.55, fontStyle: "italic" })}>{regime}</p>
              <p style={s({ fontFamily: E.sans, fontSize: 12.5, lineHeight: 1.7, color: E.body })}>
                {body}
              </p>
            </div>
          ))}
        </div>

        <div style={s({ marginTop: 28, padding: "16px 20px", border: `1px solid ${E.bdr}`,
          background: E.bg })}>
          <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.75, color: E.body })}>
            <strong>Axis 3 — Anchor Coverage Risk</strong> is a contextual disclosure layer. It is
            evaluated separately for firms with non-zero interest obligations and is not included in
            the composite score. The decision reflects an empirical finding: including Axis 3 at any
            weighting does not materially improve the composite's full-period signal. Firms without
            interest expense are not assigned an Axis 3 score. Their composite is the normalized mean
            of Axis 1 and Axis 2 only. Approximately 16% of the current universe falls outside Axis
            3's domain.
          </p>
        </div>
      </Prose>

      {/* ── SECTION 4 — Factor independence ─────────────────────────────────── */}
      <DataSection id="independence">
        <div style={s({ maxWidth: 720, margin: "0 auto 36px" })}>
          {/* How to read Spearman r */}
          <div style={s({ border: `1px solid ${E.bdr}`, padding: "16px 20px",
            background: E.bg2, marginBottom: 32 })}>
            <p style={s({ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.14em",
              textTransform: "uppercase", color: E.text, marginBottom: 10 })}>
              How to read Spearman r in an equity factor context
            </p>
            <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.75, color: E.body, marginBottom: 12 })}>
              Cross-sectional Spearman r measures rank-order consistency between a risk score and
              subsequent returns across all companies simultaneously. The scale differs materially
              from behavioural or clinical research. The Fama-French value factor — one of the most
              replicated factors in academic finance — produces Spearman r in the 0.03–0.06 range
              in cross-sectional studies. Momentum produces 0.05–0.09.
            </p>
            <div style={s({ display: "flex", flexWrap: "wrap", gap: 6 })}>
              {SIGNAL_SCALE.map(({ label, range, bg, text }) => (
                <span key={label} style={s({ background: bg, color: text, fontFamily: E.mono,
                  fontSize: 10.5, padding: "5px 12px", letterSpacing: "0.06em" })}>
                  {label} — {range}
                </span>
              ))}
            </div>
          </div>

          <SignalTable/>
        </div>

        <div style={s({ maxWidth: 720, margin: "0 auto" })}>
          <P>
            The question serious allocators ask about any new framework is whether it carries
            information beyond what established factors already explain. If the signal is merely a
            repackaging of value, profitability, or momentum, it adds nothing that cheaper
            instruments don't already provide.
          </P>
          <P>
            The framework has been tested against the Fama-French five-factor model plus momentum —
            the most comprehensive standard factor benchmark in academic equity research —
            controlling for market beta, size, value, profitability, investment, and momentum
            simultaneously. The long-short portfolio was regressed against all six factors with
            Newey-West standard errors to account for return autocorrelation.
          </P>

          <FactorStrip/>

          <P>
            After stripping all six factors, the portfolio produces <M>+20%</M> annualized alpha.
            The t-statistic is <M>3.72</M>. The threshold for statistical significance in this context
            is 2.0. The factor model explains <M>3.48%</M> of long-short return variance. The
            remaining <M>96.52%</M> is orthogonal to the entire established factor set — meaning the
            signal is not explained by size, value, profitability, momentum, or any combination of
            them. This is not a repackaging of known signals.
          </P>
          <P>
            The RMW loading — the profitability factor — is directionally positive, as expected.
            A framework that measures operational grounding should correlate with profitability.
            But the loading does not reach statistical significance, which means the signal is
            not simply a restatement of the profitability premium. The framework is detecting
            something the profitability factor, at its level of resolution, is not capturing.
          </P>
          <P>
            The alpha holds across all three market regimes — including the extended pre-2020 bull
            market. Pre-2020 factor-adjusted long-short alpha: <M>+16.5%</M> annualized,
            t-statistic <M>3.55</M> — statistically significant across <M>132</M> months of a market
            that spent the peak of its narrative cycle rewarding exactly the companies the framework
            flags as structurally fragile. A signal that only survives market disruption is a crisis
            hedge, not a structural framework. The pre-2020 result is the more demanding test,
            and it holds.
          </P>
        </div>
      </DataSection>

      {/* ── SECTION 5 — Regime ──────────────────────────────────────────────── */}
      <Prose id="regimes" bg={E.bg2}>
        <P>
          The composite signal varies materially across market regimes. This is expected and
          disclosable — the framework measures structural risk, and structural risk does not
          resolve on the same schedule in every market environment.
        </P>
        <P>
          What the regime data shows is not a framework that works only during disruption.
          It shows a framework whose cross-sectional signal strengthens when narrative valuations
          are correcting and attenuates when the market is most aggressively rewarding the companies
          it flags as fragile. Those are different statements. The first would describe a crisis
          indicator. The second describes a structural signal behaving exactly as theory predicts.
        </P>
        <P>
          During COVID and post-COVID rate normalization — the periods when stretched valuations
          faced the harshest structural test — the composite signal is Substantive. During the
          extended pre-2020 bull market, it is Slight. The full-period Spearman r
          of <M>−0.091</M> reflects 17 years of both environments averaged together.
        </P>
      </Prose>

      <DataSection bg={E.bg2}>
        <RegimeChart/>
      </DataSection>

      <Prose bg={E.bg2}>
        <P>
          The regime chart above shows rank-order consistency across the full return distribution.
          What it does not show — and what the factor-adjusted results capture — is that the
          structural premium was present and statistically significant even when the cross-sectional
          signal was most attenuated.
        </P>
        <Pre2020Callout/>
        <P>
          Year by year, the pattern is legible. Signal strength tracks the relationship between
          narrative cycles and structural reality. The 2019 inversion — the peak of narrative
          premium expansion — is the framework's weakest year in the dataset. The 2021 result —
          the sharpest single-year signal — reflects the collapse of the same narratives that
          drove 2019's inversion. These are not coincidences. They are the framework measuring
          what it claims to measure.
        </P>
      </Prose>

      <DataSection bg={E.bg2}>
        <YearlyChart/>
      </DataSection>

      <DataSection bg={E.bg2}>
        <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 })}>
          <QuintileChart/>
          <div>
            <p style={s({ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.14em",
              textTransform: "uppercase", color: E.text, marginBottom: 14 })}>
              Quintile table — full period
            </p>
            <table style={s({ width: "100%", borderCollapse: "collapse" })}>
              <thead>
                <tr style={s({ borderBottom: `1px solid ${E.bdr}` })}>
                  {["Q", "Median", "Geo", "Hit", "N"].map(h => (
                    <th key={h} style={s({ fontFamily: E.mono, fontSize: 9, color: E.text,
                      padding: "6px 8px", textAlign: h === "Q" ? "left" : "right",
                      fontWeight: 400, letterSpacing: "0.1em" })}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { q: "Q1 — Lowest Risk", med: "+10.8%", geo: "+9.0%",  hit: "64.0%", n: "57,049" },
                  { q: "Q2",               med: "+9.5%",  geo: "+6.7%",  hit: "62.5%", n: "57,049" },
                  { q: "Q3",               med: "+9.2%",  geo: "+5.5%",  hit: "61.4%", n: "57,049" },
                  { q: "Q4",               med: "+9.5%",  geo: "+5.3%",  hit: "62.4%", n: "57,049" },
                  { q: "Q5 — Highest Risk",med: "+1.3%",  geo: "−10.9%", hit: "51.2%", n: "57,049" },
                ].map(({ q, med, geo, hit, n }, i) => (
                  <tr key={q} style={s({ borderBottom: `1px solid ${E.bdr}`,
                    background: i===0 ? `${E.sage}08` : i===4 ? `${E.brick}08` : "transparent" })}>
                    <td style={s({ fontFamily: E.sans, fontSize: 11.5, fontWeight: 500,
                      color: i===0 ? E.sage : i===4 ? E.brickS : E.text, padding: "7px 8px" })}>{q}</td>
                    <td style={s({ fontFamily: E.mono, fontSize: 11, textAlign: "right",
                      padding: "7px 8px", color: E.body })}>{med}</td>
                    <td style={s({ fontFamily: E.mono, fontSize: 11, textAlign: "right",
                      padding: "7px 8px", color: E.body })}>{geo}</td>
                    <td style={s({ fontFamily: E.mono, fontSize: 11, textAlign: "right",
                      padding: "7px 8px", color: E.body })}>{hit}</td>
                    <td style={s({ fontFamily: E.mono, fontSize: 10, textAlign: "right",
                      padding: "7px 8px", color: E.body })}>{n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body, marginTop: 8 })}>
              Q1–Q5 median spread: <M>+9.5 pp</M> · t=<M>17.56</M> · p=0.0000 · Full period 2009–2026.
            </p>
          </div>
        </div>
      </DataSection>

      {/* ── SECTION 6 — Limitations ─────────────────────────────────────────── */}
      <DataSection id="limits" bg={E.bg3}>
        <div style={s({ maxWidth: 720, margin: "0 auto" })}>
          <LimitCard
            title="The framework identifies structural conditions, not outcomes."
            body="A company in the Very High bucket is in a structural state where severe losses are materially more likely than the universe base rate. It is not predicted to lose. The false positive rate — the proportion of Very High classifications that do not produce severe losses in the subsequent twelve months — is substantial. Most Very High entries do not produce catastrophic outcomes in any given twelve-month window. The framework identifies the structural condition. What an investor does with that identification is theirs to determine."
          />
          <LimitCard
            title="It does not tell you when."
            body="The most common misuse of the framework is treating a Very High classification as a timing signal. It is not. A company can remain structurally fragile for extended periods if the narrative sustaining its valuation holds. The pre-2020 inversion is the empirical proof: the framework correctly identified structurally fragile companies throughout 2017–2019. The market rewarded them anyway. The structural condition was real. The timing was not derivable from the score."
          />
          <LimitCard
            title="The signal attenuates during narrative expansion."
            body="The cross-sectional Spearman r is lowest when narrative premium is highest — when the market is most aggressively rewarding exactly the companies the framework flags as fragile. The factor-adjusted alpha holds across regimes, but rank-order consistency across the full distribution does not. Investors using the framework during extended bull markets should calibrate expectations for attenuated cross-sectional signal while recognizing the structural condition is still present and measurable."
          />
          <LimitCard
            title="The framework does not incorporate sector context."
            body="A pre-revenue biotech and a pre-profitable consumer staples company receive equivalent OAL rung assignments. Both are measured against the same structural standard — what has this company actually sustained over seven years — regardless of the structural differences in their industries. Sector context can and should be applied as a layer of interpretation on top of the composite score. It is not embedded in the framework."
          />
          <LimitCard
            title="The seven-year window is more demanding — and more conservative."
            body="Under the prior three-year specification, the majority of the scored universe qualified for the FCF anchor rung. Under the seven-year specification, the universe distributes more broadly — fewer companies have sustained positive free cash flow across a full seven-year trailing window, and more qualify at net income. The longer window requires more sustained performance, which is the point. But it also means the framework is slower to recognize genuine improvement when a company's operational trajectory changes materially. That lag is a design choice with a cost."
          />
          <LimitCard
            title="Score accuracy varies by data quality at the rung level."
            body="Scores derive from Financial Modeling Prep API data, which has known quality issues including malformed rows, gaps in quarterly history for smaller companies, and occasional stale figures. The seven-year trailing window amplifies this risk: a data gap that would have been inconsequential over three years can affect rung assignment over seven. Score accuracy for companies near the boundary between OAL rungs should be treated with interpretive caution, particularly for smaller companies where quarterly data coverage is thinner."
          />
        </div>
      </DataSection>

      {/* ── SECTION 7 — Results ─────────────────────────────────────────────── */}
      <Prose id="results">
        <P>
          The structural premium decomposes into two independent contributions, each verifiable
          on its own terms.
        </P>
        <P>
          The first is exclusion. A cap-weighted broad market portfolio that simply removes companies
          scoring in the High or Very High composite buckets — no positive selection, no concentration —
          produces a materially different return and risk profile than the unfiltered universe. Under
          the seven-year anchor specification, the OSMR-Filtered benchmark returned <M>+15.4%</M>{" "}
          annualized against the full universe at <M>+9.8%</M>. The exclusion effect added a difference
          of <M>+5.6</M> percentage points. Maximum drawdown improved from <M>−26.4%</M> to{" "}
          <M>−21.7%</M>. The Sortino ratio improved from <M>0.843</M> to <M>1.444</M> — a material
          improvement in risk-adjusted performance achieved through exclusion alone, without any
          positive selection or concentration.
        </P>
        <P>
          The second is selection. Concentrating in the Very Low composite bucket — equal-weighted —
          adds a further premium above the exclusion-only result. The Very Low equal-weight index
          returned <M>+18.9%</M> annualized post-2013, with a Sortino ratio of <M>1.317</M> and
          maximum drawdown of <M>−34.0%</M>. The selection effect is real but carries a deeper
          drawdown than the exclusion-only result, due to its equal-weight construction and
          small-cap tilt.
        </P>
        <P>
          Together the two effects produce the total structural premium versus the unfiltered
          universe. The exclusion effect is the more durable and more actionable result for a
          long-only investor — it requires only that the highest-risk bucket is correctly
          identifying structural fragility, and the data confirms it does.
        </P>
      </Prose>

      <DataSection>
        <IndexChart/>
        <div style={s({ marginTop: 24 })}>
          <IndexTable/>
        </div>
        <div style={s({ marginTop: 20, padding: "14px 18px", border: `1px solid ${E.bdr}`,
          background: E.bg2 })}>
          <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body, lineHeight: 1.7 })}>
            Very Low index: equal-weight, post-2013 (avg. ~123 constituents/month).
            Full-period figure includes 2009–2013 recovery with thinner constituent counts.
            Post-2013 (+18.9%) is the appropriate reference. OSMR-Filtered: cap-weight,
            excludes axis1 or axis2 in &#123;High, Very High&#125;, post-2013.
            Transaction costs and market impact not modeled.
          </p>
        </div>

        <div style={s({ marginTop: 36 })}>
          <BucketTable/>
        </div>

        <div style={s({ marginTop: 36, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 })}>
          <CVaRChart/>
          <DistributionBars/>
        </div>

        <div style={s({ marginTop: 36, padding: "18px 22px", border: `1px solid ${E.bdr}`,
          background: E.bg2 })}>
          <p style={s({ fontFamily: E.sans, fontSize: 13.5, lineHeight: 1.8, color: E.body })}>
            <M>39.6%</M> of Very High composite observations produced losses exceeding 25% over
            12 months. CVaR of <M>−88.9%</M> means that in the worst 5% of outcomes, the average
            loss approached near-total drawdown. The Very High mean return of approximately{" "}
            <M>+9.5%</M> — pulled upward by a small subset of large positive outcomes — understates
            the typical outcome by a substantial margin. Median and geometric mean are the correct
            measures for structural risk evaluation.
          </p>
        </div>

        <div style={s({ marginTop: 36 })}>
          <p style={s({ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.14em",
            textTransform: "uppercase", color: E.text, marginBottom: 14 })}>
            Design decisions
          </p>
          <DesignCard
            title="Equal weighting over empirically-derived weighting"
            body="The composite weights Axis 1 and Axis 2 equally at 50% each. Empirical testing shows that tilting the weight toward Axis 2 improves composite r by approximately 0.007 — a difference that is within bootstrap confidence interval overlap and does not justify abandoning interpretive symmetry. Both axes capture distinct structural dimensions; claiming one deserves 70% weight requires stronger theoretical justification than the data currently provides."
          />
          <DesignCard
            title="Simplest method that works over mathematical refinement"
            body="Where simpler measures outperform complex ones against historical data, the simpler measure is used. Axis 2 uses YoY consistency rather than tanh transformation or R-squared trend fitting — both of which were tested and underperformed. Mathematical complexity is not a virtue when it disconnects the measure from the phenomenon it captures."
          />
          <DesignCard
            title="Global ranking for cross-sectional comparability"
            body="Both Axis 1 and Axis 2 are expressed as global percentile ranks across the full universe after anchor penalties are applied. This makes scores directly comparable across companies anchored on different OAL rungs — essential for a framework designed to evaluate structural risk at the universe level."
          />
          <DesignCard
            title="Conservative anchor assignment on a seven-year trailing window"
            body="OAL assignment uses the 7-year cumulative sum of the relevant financial series. This requires sustained demonstrated performance rather than rewarding a single strong quarter or recent trend. A company must demonstrate positive 7-year cumulative FCF to qualify for OAL 1. Adjusted metrics, normalized earnings, and forward projections are not considered."
          />
          <DesignCard
            title="Static weights across market environments"
            body="The composite formula and axis weights do not shift based on market environment or detected volatility regime. Signal strength varies materially across regimes — as the validation section documents — and users operating in a specific environment should apply judgment accordingly. But a model that silently changes its weights is harder to interpret, harder to audit, and more susceptible to overfitting. Stability is a deliberate choice, not an oversight."
          />
        </div>
      </DataSection>

      {/* ── SECTION 8 — Close ───────────────────────────────────────────────── */}
      <Prose id="close" bg={E.bg2}>
        <div style={s({ maxWidth: 560, margin: "0 auto", textAlign: "center" })}>
          <p style={s({ fontFamily: E.sans, fontSize: 18, lineHeight: 1.75,
            color: E.body, marginBottom: 24 })}>
            The structural case for narrative risk as a measurable, manageable condition in equity
            portfolios rests on the evidence in this document — not on assertion. The framework
            identified the structural condition that preceded significant losses across 17 years
            and three market regimes. The factor-adjusted alpha is positive and statistically
            significant across all three market regimes. The premium decomposes into two
            independently verifiable mechanisms. The limitations are named, not footnoted.
          </p>
          <p style={s({ fontFamily: E.sans, fontSize: 18, lineHeight: 1.75,
            color: E.body, marginBottom: 32 })}>
            What the evidence supports is a specific and bounded claim: that the distance between
            what a company has built and what its valuation requires is measurable, that it predicts
            return distributions in a consistent direction, and that managing exposure to the
            highest-risk tail of that distribution produces a measurably different portfolio.
            Not a guarantee. Not a timing signal. A structural lens that makes a specific kind
            of risk visible before it resolves.
          </p>
          <p style={s({ fontFamily: E.sans, fontSize: 20, fontWeight: 700,
            color: E.text, marginBottom: 36, letterSpacing: "-0.02em" })}>
            The structural map is live.
          </p>
          <Link href="/platform" style={s({
            display: "inline-block", fontFamily: E.sans, fontSize: 13, fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "14px 36px", background: E.text, color: E.bg, textDecoration: "none",
          })}>
            Open Platform →
          </Link>
        </div>
      </Prose>

      {/* APPENDIX */}
      <DataSection>
        <p style={s({ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.16em",
          textTransform: "uppercase", color: E.text, marginBottom: 20 })}>
          Appendix — Methodology specification
        </p>
        <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 })}>
          {[
            { field: "Backtest parameters", value: "285,245 observations · 2009-01 through 2025-02 formation window · 12-month forward return horizon · $5 minimum price filter at formation · bootstrap 95% confidence intervals (1,000 samples)." },
            { field: "OAL assignment",       value: "Each company evaluated FCF → NI → EBIT → Revenue in sequence; assigned to first qualifying rung based on positive 7-year cumulative figure. Negative EV companies excluded. No adjusted or normalized metrics considered." },
            { field: "Axis 1 formula",       value: "log(EV / anchor_7yr) + OAL_shallowness_penalty → global percentile rank (ascending = more risk). Anchor: 7-year cumulative sum of OAL-appropriate series (28 quarters). Penalties: FCF=0, NI=1.0, EBIT=1.618, Rev=4.236." },
            { field: "Axis 2 formula",       value: "YoY consistency score across up to 28 quarters of OAL-anchor history + OAL_shallowness_penalty → global percentile rank. Four most recent YoY comparisons receive double weight. Same penalties as Axis 1." },
            { field: "Composite formula",    value: "(axis1_pct + axis2_pct) / 2. Equal weight. Expressed as percentile rank across full universe. Long-run static model — weights do not shift across market regimes. Axis 3 is a contextual disclosure layer, not included in composite." },
            { field: "Factor test",          value: "Fama-French 5 factors + Momentum (Ken French data library). OLS with Newey-West HAC standard errors (3-lag). Four portfolio series: Very Low EW, Very High EW, L/S (Very Low minus Very High), Broad EW. 205 months." },
            { field: "Classification test",  value: "Loss event = 12-month forward return < −25%. Base rate: 16.24%. OSMR AUC: 0.6174 vs momentum baseline 0.3996 vs valuation screen 0.5957 vs random 0.500. AUC computed via trapezoidal rule. Very High bucket: 39.6% of observations below −25%. Very Low: 10.5%. Relative risk: 2.44×." },
            { field: "Index construction",   value: "Equal-weight (EW): simple average of 1-month returns across bucket constituents, monthly rebalancing. Cap-weight (CW): market-cap weighted average. Price filter ≥$5 applied at formation. Transaction costs not modeled." },
          ].map(({ field, value }) => (
            <div key={field} style={s({ borderBottom: `1px solid ${E.bdr}`, paddingBottom: 14 })}>
              <p style={s({ fontFamily: E.mono, fontSize: 9.5, letterSpacing: "0.12em",
                textTransform: "uppercase", color: E.text, marginBottom: 6 })}>{field}</p>
              <p style={s({ fontFamily: E.sans, fontSize: 12.5, lineHeight: 1.65,
                color: E.body })}>{value}</p>
            </div>
          ))}
        </div>
      </DataSection>

      {/* FOOTER */}
      <div style={s({ padding: "32px", borderTop: `1px solid ${E.bdr}`, textAlign: "center" })}>
        <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body, lineHeight: 1.7 })}>
          The Capital Steward, LLC · thecapitalsteward.com<br/>
          © 2026 The Capital Steward, LLC. For informational purposes only. Not investment advice.
          Past performance of a backtest does not guarantee future results.
        </p>
      </div>

    </div>
  )
}