'use client'

// File: app/platform-beta/page.tsx
// Palette: P3 inverse dark · AAA corrected
// Auth: Clerk \u2014 unauthenticated \u2192 /platform
// Data: /public/data/*.json (static, no API routes)
// Tier: free = signed in, subscription != 'active'
//       paid = subscription === 'active'

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Search, Filter } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts"

// \u2500\u2500\u2500 Design tokens \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const E = {
  // Platform dark palette — P3 inverse · AAA verified on #181E19
  bg:      "#181E19", // deep sage-black
  bg2:     "#1F2820", // panel surface
  bg3:     "#253028", // card/inset
  bdr:     "#2E3B30", // subtle border
  bdr2:    "#3A4A3C", // stronger border
  text:    "#F0F4EF", // 15.25:1 AAA
  body:    "#B8C4B9", //  9.39:1 AAA
  muted:   "#97AC99", //  7.01:1 AAA
  dim:     "#8CAF96", //  7.01:1 AAA
  gold:    "#C6A24A", //  7.00:1 AAA  (display + normal text)
  gatm:    "rgba(108,182,134,0.05)",
  pos:     "#6CB686", //  7.00:1 AAA  (normal text)
  posSoft: "#4A8A60", //  decorative fill only
  neg:     "#CC6652", //  4.51:1 AA   (large text / display labels only)
  negSoft: "#8A3A2A", //  decorative fill only
  blue:    "#5A8EC0", //  decorative / chart use
  mono:    "'IBM Plex Mono','Courier New',monospace",
  sans:    "'DM Sans',system-ui,sans-serif",
  serif:   "'Playfair Display',Georgia,serif",
}
const s = (x: object) => x as React.CSSProperties

// \u2500\u2500\u2500 Types \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

type SnapshotRow = {
  symbol: string
  oal_label: string | null
  risk_bucket_within_oal: string | null
  axis1_pct: number | null
  axis2_pct: number | null
  axis2_prev_pct?: number | null   // prior month \u2014 drives pulse
  axis2_plot?: number | null
  composite_score: number | null
  composite_bucket: string | null
  market_cap?: number | null       // USD \u2014 drives dot size
}

type OALSummaryRow = {
  oal_label: string; n: number
  median_axis1: number | null; median_composite: number | null
}

type HistoryManifestRow = {
  month: string
  oal_scores_rows: number | null; oal_summary_rows: number | null; structural_rows: number | null
  has_oal_scores?: boolean; has_oal_summary?: boolean; has_structural_snapshot?: boolean
}

type CohortGridCell = {
  count: number; mean_return: number | null; median_return: number | null
  hit_rate: number | null; display_value: number | null; suppressed: boolean
  axis1_bucket: string; axis2_bucket: string; axis3_bucket: string
}
type CohortGridRow   = { axis2_bucket: string; cells: CohortGridCell[] }
type CohortGridPanel = { panel: string; rows: CohortGridRow[] }
type CohortGridMeta  = {
  horizon_months: number; x_axis_labels: string[]; y_axis_labels: string[]
  panels: string[]; formation_month_min: string | null; formation_month_max: string | null
  observation_count: number; notes: string[]; min_count_for_display: number
}
type CohortGrid = { metadata: CohortGridMeta; panels: CohortGridPanel[] }
type CohortMetric = "median_return" | "mean_return" | "hit_rate"

// \u2500\u2500\u2500 Constants \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const BUCKET_ORDER = ["Very Low","Low","Moderate","High","Very High"]
const OAL_ORDER    = ["FCF","Net Income","EBIT","Revenue","Non-viable"]
const TABS = [
  { id:"market-map", label:"Market Map"   },
  { id:"snapshot",   label:"Snapshot"     },
  { id:"anchors",    label:"Anchor Structure" },
  { id:"history",    label:"History"      },
]

// \u2500\u2500\u2500 Helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const fmt       = (v: number | null, d = 1) => v == null || isNaN(v) ? "\u2014" : `${(v*100).toFixed(d)}%`
const fmtSigned = (v: number | null) => v == null || isNaN(v) ? "\u2014" : `${v>=0?"+":""}${(v*100).toFixed(1)}%`
const fmtPct    = (v: number | null) => v == null || isNaN(v) ? "\u2014" : `${Math.round(v*100)}th`
const fmtNum    = (v: number | null) => v == null || isNaN(v) ? "\u2014" : v.toLocaleString()

function pctToBucket(p: number | null): string {
  if (p == null) return "\u2014"
  if (p < 0.2) return "Very Low"; if (p < 0.4) return "Low"
  if (p < 0.6) return "Moderate"; if (p < 0.8) return "High"
  return "Very High"
}

function bucketColor(b: string | null | undefined): string {
  return ({
    "Very Low": E.pos, "Low": E.posSoft,
    "Moderate": E.dim, "High": E.negSoft, "Very High": E.neg,
  } as Record<string,string>)[b ?? ""] ?? E.muted
}

function returnHeatBg(v: number | null, sup: boolean) {
  if (sup || v == null) return E.bg3
  if (v <= -0.12) return "#4a1212"; if (v <= -0.03) return "#3a1e12"
  if (v <   0.03) return "#1e1c18"; if (v <   0.12) return "#122a1e"
  return "#0e2818"
}
function returnHeatText(v: number | null, sup: boolean) {
  if (sup || v == null) return E.muted
  if (v <= -0.12) return "#FFB8A0"  // 9.10:1 AAA on #4a1212
  if (v <= -0.03) return "#EC9D6F"  // 7.00:1 AAA on #3a1e12
  if (v <   0.03) return E.body    // AAA on #1e1c18
  if (v <   0.12) return "#7CC89C"  // 7.70:1 AAA on #122a1e
  return "#70BE8B"                    // 7.06:1 AAA on #0e2818
}
function skewDir(c: CohortGridCell): "right"|"left"|"none" {
  if (!c.mean_return || !c.median_return || c.suppressed) return "none"
  const d = c.mean_return - c.median_return
  return d > 0.10 ? "right" : d < -0.10 ? "left" : "none"
}

function findCohortCell(row: SnapshotRow, grid: CohortGrid | null): CohortGridCell | null {
  if (!grid) return null
  const a1 = pctToBucket(row.axis1_pct)
  const a2 = pctToBucket(row.axis2_pct)
  // Two-axis: use first panel only (axis3 removed from composite)
  const panel = grid.panels[0]
  if (!panel) return null
  const gridRow = panel.rows.find(r => r.axis2_bucket === a2)
  return gridRow?.cells.find(c => c.axis1_bucket === a1) ?? null
}

function narrateCompany(c: SnapshotRow) {
  const a1 = c.axis1_pct ?? 0.5
  const a2 = c.axis2_pct ?? 0.5
  const bucket = c.composite_bucket ?? "Moderate"
  const anchorRead = a1 >= 0.8 ? "severely elevated valuation relative to its operational anchor"
    : a1 >= 0.6 ? "elevated valuation relative to its operational anchor"
    : a1 >= 0.4 ? "moderate valuation stretch relative to its operational anchor"
    : "valuation that is well-supported by its operational anchor"
  const trajectoryRead = a2 >= 0.8 ? "rapidly deteriorating operational trajectory"
    : a2 >= 0.6 ? "deteriorating operational trajectory"
    : a2 >= 0.4 ? "mixed operational trajectory"
    : "improving operational trajectory"
  const drivers = [
    a1 >= 0.6 && "valuation stretch",
    a2 >= 0.6 && "deteriorating trajectory",
  ].filter(Boolean) as string[]
  const driverStr = drivers.length ? `driven by ${drivers.join(" and ")}` : "with limited single-axis dominance"
  const headerRead = `${bucket} structural risk ${driverStr}.`
  const trajectoryProfile = a2 >= 0.8 && a1 >= 0.8
    ? "Trajectory is deteriorating while valuation is already highly stretched \u2014 an escalation profile. The narrative bridge is lengthening as the operational anchor weakens."
    : a2 >= 0.6 && a1 >= 0.6
    ? "Trajectory is deteriorating within an elevated risk profile. Structural pressure is accumulating on both the valuation and operational dimensions."
    : a2 >= 0.6
    ? "Trajectory is deteriorating. The operational anchor is weakening on a trailing basis, increasing the narrative dependence of the current valuation."
    : a2 < 0.4
    ? "Trajectory is improving. The operational anchor is strengthening on a trailing basis, shortening the narrative bridge over time."
    : "Trajectory is mixed. No dominant directional bias is present on the operational anchor."
  const takeaway = bucket === "Very High"
    ? `High structural risk profile. Valuation depends on ${anchorRead}, with ${trajectoryRead}. Historical outcomes for similar structural profiles are unfavorable at the median.`
    : bucket === "High"
    ? `Elevated structural risk characterized by ${anchorRead} and ${trajectoryRead}. Warrants scrutiny before any capital commitment.`
    : bucket === "Moderate"
    ? `${anchorRead} with ${trajectoryRead}. Structural risk is present but not dominant. Company-level context matters here.`
    : `${anchorRead} with ${trajectoryRead}. Structural conditions are favorable relative to the broader universe.`
  return { headerRead, trajectoryProfile, takeaway }
}

// \u2500\u2500\u2500 Interpretive layer helpers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function interpretDist(data: SnapshotRow[]) {
  if (!data.length) return { headline:"\u2014", body:"No data.", tone:"moderate" as const, consequence:"" }
  const n  = data.length
  const vh = data.filter(r => r.composite_bucket === "Very High").length / n
  const el = data.filter(r => r.composite_bucket === "Very High" || r.composite_bucket === "High").length / n
  const rs = data.filter(r => r.composite_bucket === "Very Low"  || r.composite_bucket === "Low").length / n
  if (vh >= 0.25) return { tone:"elevated" as const,
    headline:`${Math.round(vh*100)}% of the filtered universe is in the Very High bucket`,
    body:`${Math.round(el*100)}% carry High or Very High composite risk \u2014 structural fragility is broadly distributed.`,
    consequence:`Sector diversification provides limited structural protection when fragility is this widespread.` }
  if (vh >= 0.15) return { tone:"moderate" as const,
    headline:`${Math.round(vh*100)}% of the filtered universe is in the Very High bucket`,
    body:`${Math.round(el*100)}% carry elevated composite risk. ${Math.round(rs*100)}% sit in the lower two buckets.`,
    consequence:`Mixed distribution \u2014 elevated names warrant scrutiny, but lower-risk companies remain available.` }
  return { tone:"subdued" as const,
    headline:`${Math.round(vh*100)}% of the filtered universe is in the Very High bucket`,
    body:`Structural risk is contained. ${Math.round(rs*100)}% of companies sit in the Very Low or Low bucket.`,
    consequence:`Contained distribution does not eliminate individual-name risk \u2014 scrutiny remains warranted.` }
}

function interpretTraj(data: SnapshotRow[], tone: "elevated"|"moderate"|"subdued") {
  const sc = data.filter(r => r.axis2_pct != null)
  if (!sc.length) return { headline:"Trajectory data unavailable", body:"", direction:"mixed" as const, consequence:"" }
  const det = sc.filter(r => (r.axis2_pct ?? 0) > 0.5).length / sc.length * 100
  const imp = sc.filter(r => (r.axis2_pct ?? 0) <= 0.5).length / sc.length * 100
  if (det >= 60) return { direction:"deteriorating" as const,
    headline:`${Math.round(det)}% of scored companies show deteriorating operational trajectory`,
    body:`The majority of the filtered universe is in the upper half of Axis 2 \u2014 operational anchor metrics are weakening on a trailing basis.`,
    consequence: tone === "elevated"
      ? `Combined with elevated distribution: an escalation signal. Structural risk is both broadly present and actively accumulating.`
      : `Trajectory is deteriorating in a contained distribution \u2014 structural risk is accumulating quietly.` }
  if (imp >= 60) return { direction:"improving" as const,
    headline:`${Math.round(imp)}% of scored companies show improving operational trajectory`,
    body:`The majority of the filtered universe is in the lower half of Axis 2 \u2014 operational anchor metrics are strengthening on a trailing basis.`,
    consequence:`A universe tilted toward improving trajectory carries lower structural risk over time, all else equal.` }
  return { direction:"mixed" as const,
    headline:`Trajectory is mixed \u2014 ${Math.round(det)}% deteriorating, ${Math.round(imp)}% improving`,
    body:`No dominant directional bias. The filtered universe is split between strengthening and weakening operational anchors.`,
    consequence:`Company-level analysis is more informative than aggregate positioning in a mixed trajectory environment.` }
}

// \u2500\u2500\u2500 Temporal bar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function TemporalBar({ manifest }: { manifest: HistoryManifestRow[] }) {
  const st = useMemo(() => {
    if (!manifest.length) return { formLabel:"\u2014", nextLabel:"\u2014", days: null }
    const latest = [...manifest].sort((a,b) => b.month.localeCompare(a.month))[0].month
    const [y,m] = latest.split("-").map(Number)
    const next = new Date(y, m, 1)
    const days = Math.max(0, Math.ceil((next.getTime() - Date.now()) / 86400000))
    return {
      formLabel: new Date(y, m-1, 1).toLocaleDateString("en-US",{month:"short",year:"numeric"}),
      nextLabel: next.toLocaleDateString("en-US",{month:"short",year:"numeric"}),
      days,
    }
  }, [manifest])
  const near = st.days != null && st.days <= 7
  return (
    <div style={s({ display:"flex", flexWrap:"wrap", gap:"6px 20px", padding:"7px 28px", borderBottom:`1px solid ${E.bdr}`, background:E.bg2 })}>
      {[
        `Snapshot \u00b7 ${st.formLabel}`,
        `Next recalibration \u00b7 ${st.nextLabel}`,
        st.days == null ? "\u2014" : st.days === 0 ? "Recalibrating today" : `${st.days} days remaining`,
      ].map((t,i) => (
        <span key={i} style={s({ fontFamily:E.mono, fontSize:9.5, color: i===2&&near ? E.pos : E.muted })}>{t}</span>
      ))}
    </div>
  )
}

// \u2500\u2500\u2500 KPI strip \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function KPIStrip({ stats, isPaid }: {
  stats: { veryHigh:number; improving:number; total:number; fcfAnchored:number }
  isPaid: boolean
}) {
  const kpis = [
    { label:"Structural Stress",    val:stats.veryHigh,   note:"Companies in Very High composite",   color:E.neg,  paid:false },
    { label:"Improving Trajectory", val:stats.improving,  note:"Axis 2 below 40th pct \u00b7 strengthening", color:E.pos,  paid:false },
    { label:"Active Universe",      val:stats.total,      note:"Under active filters",               color:E.text, paid:false },
    { label:"FCF Anchored",         val:stats.fcfAnchored,note:"Deepest demonstrated anchor",        color:E.pos,  paid:true  },
  ]
  return (
    <div style={s({ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderBottom:`1px solid ${E.bdr}` })}>
      {kpis.map(({ label, val, note, color, paid }, i) => {
        const locked = paid && !isPaid
        return (
          <div key={label} style={s({ padding:"16px 22px", borderRight: i<3 ? `1px solid ${E.bdr}` : "none" })}>
            <div style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.18em", textTransform:"uppercase", color:E.muted, marginBottom:6 })}>{label}</div>
            {locked
              ? <div style={s({ display:"flex", alignItems:"center", gap:7, marginBottom:4 })}><Lock size={13} style={{color:E.muted}} /><span style={s({ fontFamily:E.mono, fontSize:10, color:E.muted })}>Paid subscribers</span></div>
              : <div style={s({ fontFamily:E.mono, fontSize:26, fontWeight:500, color, letterSpacing:"-0.02em", lineHeight:1, marginBottom:4 })}>{fmtNum(val)}</div>
            }
            <div style={s({ fontFamily:E.mono, fontSize:8.5, color:E.dim })}>{note}</div>
          </div>
        )
      })}
    </div>
  )
}

// \u2500\u2500\u2500 Interpretive layer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function InterpretiveLayer({ data }: { data: SnapshotRow[] }) {
  const dist = useMemo(() => interpretDist(data), [data])
  const traj = useMemo(() => interpretTraj(data, dist.tone), [data, dist.tone])
  const toneColor = { elevated:E.neg, moderate:E.body, subdued:E.pos }
  const dirColor  = { deteriorating:E.neg, improving:E.pos, mixed:E.body }
  const cards = [
    {
      ey:"Distribution \u00b7 System State",
      color: toneColor[dist.tone],
      head: dist.tone==="elevated" ? "Structural stress is broadly elevated"
          : dist.tone==="subdued"  ? "Structural risk is contained"
          : "Structural risk is present but mixed",
      body: dist.body,
      consequence: dist.consequence,
    },
    {
      ey:"Trajectory \u00b7 System State",
      color: dirColor[traj.direction],
      head: traj.direction==="deteriorating" ? "Universe deteriorating in aggregate"
          : traj.direction==="improving"     ? "Universe improving in aggregate"
          : "Trajectory is mixed",
      body: traj.body,
      consequence: traj.consequence,
    },
  ]
  return (
    <div style={s({ padding:"18px 24px", borderBottom:`1px solid ${E.bdr}`, background:E.gatm })}>
      <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.22em", textTransform:"uppercase", color:E.gold, marginBottom:10 })}>
        Current Market Interpretation \u00b7 Start here
      </p>
      <div style={s({ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 })}>
        {cards.map(({ ey, color, head, body, consequence }) => (
          <div key={ey} style={s({ border:`1px solid ${E.bdr}`, background:E.bg2, padding:"14px" })}>
            <div style={s({ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 })}>
              <span style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.16em", textTransform:"uppercase", color:E.muted })}>{ey}</span>
            </div>
            <div style={s({ fontFamily:E.sans, fontSize:12.5, fontWeight:700, color, marginBottom:6, lineHeight:1.2 })}>{head}</div>
            <div style={s({ fontFamily:E.sans, fontSize:12, lineHeight:1.72, color:E.body, marginBottom: consequence?8:0 })}>{body}</div>
            {consequence && <div style={s({ fontFamily:E.sans, fontSize:11.5, lineHeight:1.65, color:E.muted, paddingTop:8, borderTop:`1px solid ${E.bdr}` })}>{consequence}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// \u2500\u2500\u2500 Constellation map (canvas + SVG overlay) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function dotRadius(mc: number | null | undefined): number {
  if (!mc || mc <= 0) return 3
  return Math.max(2, Math.min(9, (Math.log10(mc) - 8) * 1.75))
}
function deterioration(row: SnapshotRow): number {
  if (row.axis2_prev_pct == null || row.axis2_pct == null) return 0
  const d = row.axis2_pct - row.axis2_prev_pct
  return d <= 0 ? 0 : Math.min(1, d * 8)
}
function hexRgb(h: string): [number,number,number] {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]
}

type Dot = {
  row: SnapshotRow; cx:number; cy:number; r:number
  color:string; rgb:[number,number,number]; pulse:number; phase:number
}

const PAD = { t:28, r:16, b:44, l:56 }

function ConstellationMap({ data, onSelect, selectedSymbol }: {
  data: SnapshotRow[]
  onSelect: (r:SnapshotRow) => void
  selectedSymbol?: string|null
}) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef       = useRef<number>(0)
  const dotsRef      = useRef<Dot[]>([])
  const dimsRef      = useRef({ w:800, h:480 })
  const [dims, setDims]   = useState({ w:800, h:480 })
  const [hovered, setHovered]   = useState<string|null>(null)
  const [tooltip, setTooltip]   = useState<{x:number;y:number;row:SnapshotRow}|null>(null)

  // Build dots
  const buildDots = useCallback((w:number, h:number, rows:SnapshotRow[]): Dot[] => {
    const pw = w - PAD.l - PAD.r
    const ph = h - PAD.t - PAD.b
    return rows.filter(r => r.axis1_pct!=null && r.axis2_pct!=null).map(r => {
      const color = bucketColor(r.composite_bucket)
      return {
        row: r,
        cx: PAD.l + (r.axis2_pct as number) * pw,
        cy: PAD.t + (1 - (r.axis1_pct as number)) * ph,
        r:  dotRadius(r.market_cap),
        color, rgb: hexRgb(color),
        pulse: deterioration(r),
        phase: Math.random() * Math.PI * 2,
      }
    })
  }, [])

  // Resize observer
  useEffect(() => {
    const el = containerRef.current; if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width
      const h = Math.max(440, Math.round(w * 0.56))
      setDims({ w, h }); dimsRef.current = { w, h }
    })
    ro.observe(el); return () => ro.disconnect()
  }, [])

  // Rebuild dots on data/dims change
  useEffect(() => { dotsRef.current = buildDots(dims.w, dims.h, data) }, [data, dims, buildDots])

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    let t = 0; let dpr = window.devicePixelRatio || 1

    const draw = () => {
      const { w, h } = dimsRef.current
      const pw = w - PAD.l - PAD.r; const ph = h - PAD.t - PAD.b
      if (canvas.width !== Math.round(w*dpr) || canvas.height !== Math.round(h*dpr)) {
        canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      ctx.clearRect(0,0,w,h)
      // Background
      ctx.fillStyle = E.bg2; ctx.fillRect(0,0,w,h)

      // Grid
      const ticks = [0.25, 0.5, 0.75]
      ticks.forEach(tk => {
        ctx.strokeStyle = E.bdr; ctx.lineWidth = 0.5
        ctx.setLineDash(tk===0.5 ? [] : [2,5])
        const gx = PAD.l + tk*pw; const gy = PAD.t + (1-tk)*ph
        ctx.beginPath(); ctx.moveTo(gx,PAD.t); ctx.lineTo(gx,PAD.t+ph); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(PAD.l,gy); ctx.lineTo(PAD.l+pw,gy); ctx.stroke()
      })
      ctx.setLineDash([])

      // Plot border
      ctx.strokeStyle = E.bdr2; ctx.lineWidth = 1
      ctx.strokeRect(PAD.l, PAD.t, pw, ph)

      // Sort: Very High on top
      const ORDER: Record<string,number> = {"Very Low":0,"Low":1,"Moderate":2,"High":3,"Very High":4}
      const dots = [...dotsRef.current].sort((a,b) => (ORDER[a.row.composite_bucket ?? ""] ?? 2) - (ORDER[b.row.composite_bucket ?? ""] ?? 2))

      t += 0.016
      const [pr,pg,pb] = hexRgb(E.gold)

      dots.forEach(dot => {
        const isSel = dot.row.symbol === selectedSymbol
        const isHov = dot.row.symbol === hovered
        const [r,g,b] = dot.rgb
        const alpha = dot.row.composite_bucket === "Moderate" ? 0.4 : 0.84

        // Pulse ring \u2014 trajectory deterioration only
        if (dot.pulse > 0) {
          const speed = 0.7 + dot.pulse * 1.6
          const prog  = (Math.sin((t*speed + dot.phase) % (Math.PI*2)) + 1) / 2
          const rRing = dot.r + prog*(9 + dot.pulse*9)
          const aRing = (1-prog) * dot.pulse * 0.6
          ctx.beginPath(); ctx.arc(dot.cx, dot.cy, rRing, 0, Math.PI*2)
          ctx.strokeStyle = `rgba(${pr},${pg},${pb},${aRing})`
          ctx.lineWidth = 1.5; ctx.stroke()
        }

        // Selection ring
        if (isSel) {
          ctx.beginPath(); ctx.arc(dot.cx, dot.cy, dot.r+5, 0, Math.PI*2)
          ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`; ctx.lineWidth=2; ctx.stroke()
        }

        // Hover halo
        if (isHov) {
          ctx.beginPath(); ctx.arc(dot.cx, dot.cy, dot.r+7, 0, Math.PI*2)
          ctx.fillStyle = `rgba(${r},${g},${b},0.14)`; ctx.fill()
        }

        // Main dot
        ctx.beginPath(); ctx.arc(dot.cx, dot.cy, isHov ? dot.r+1.5 : dot.r, 0, Math.PI*2)
        ctx.fillStyle = `rgba(${r},${g},${b},${isHov?1:alpha})`; ctx.fill()
      })

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [hovered, selectedSymbol])

  // Hit detection
  const findDot = useCallback((cx:number, cy:number): Dot|null => {
    const canvas = canvasRef.current; if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const mx = cx - rect.left; const my = cy - rect.top
    let best: Dot|null = null; let bestD = 14
    dotsRef.current.forEach(d => {
      const dist = Math.hypot(d.cx-mx, d.cy-my)
      if (dist < bestD) { bestD=dist; best=d }
    })
    return best
  }, [])

  const onMove  = useCallback((e:React.MouseEvent) => {
    const dot = findDot(e.clientX, e.clientY)
    setHovered(dot?.row.symbol ?? null)
    setTooltip(dot ? {x:e.clientX, y:e.clientY, row:dot.row} : null)
  }, [findDot])
  const onClick = useCallback((e:React.MouseEvent) => {
    const dot = findDot(e.clientX, e.clientY); if (dot) onSelect(dot.row)
  }, [findDot, onSelect])

  const pw = dims.w - PAD.l - PAD.r
  const ph = dims.h - PAD.t - PAD.b
  const axisTickVals = [0, 0.25, 0.5, 0.75, 1.0]

  return (
    <div ref={containerRef} style={{ position:"relative", width:"100%", userSelect:"none" }}>
      <canvas ref={canvasRef} width={dims.w} height={dims.h}
        style={{ display:"block", width:"100%", height:dims.h, cursor: hovered?"pointer":"default" }}
        onMouseMove={onMove} onClick={onClick}
        onMouseLeave={() => { setHovered(null); setTooltip(null) }}
      />

      {/* SVG overlay \u2014 labels only, never clips dots */}
      <svg viewBox={`0 0 ${dims.w} ${dims.h}`} width={dims.w} height={dims.h}
        style={{ position:"absolute", top:0, left:0, pointerEvents:"none", overflow:"visible" }}>

        {/* Axis titles */}
        <text x={PAD.l + pw/2} y={dims.h - 6} textAnchor="middle"
          fontFamily={E.mono} fontSize={10} fill={E.muted} letterSpacing="0.16em">
          TRAJECTORY RISK \u2192
        </text>
        <text x={14} y={PAD.t + ph/2} textAnchor="middle"
          fontFamily={E.mono} fontSize={10} fill={E.muted} letterSpacing="0.16em"
          transform={`rotate(-90,14,${PAD.t+ph/2})`}>
          ANCHOR RISK \u2191
        </text>

        {/* X ticks */}
        {axisTickVals.map(t => (
          <text key={`xt${t}`} x={PAD.l + t*pw} y={PAD.t+ph+16}
            textAnchor="middle" fontFamily={E.mono} fontSize={9} fill={E.muted}>
            {t.toFixed(2)}
          </text>
        ))}

        {/* Y ticks */}
        {axisTickVals.map(t => (
          <text key={`yt${t}`} x={PAD.l - 7} y={PAD.t+(1-t)*ph+3}
            textAnchor="end" fontFamily={E.mono} fontSize={9} fill={E.muted}>
            {t.toFixed(2)}
          </text>
        ))}

        {/* Quadrant labels \u2014 clear of data area */}
        <text x={PAD.l+6} y={PAD.t+13} fontFamily={E.mono} fontSize={9} fill={E.pos} opacity={0.65}>
          Improving \u00b7 Stretched
        </text>
        <text x={PAD.l+pw-6} y={PAD.t+13} textAnchor="end"
          fontFamily={E.mono} fontSize={9} fill={E.neg} opacity={0.85}>
          Most fragile \u2197
        </text>
        <text x={PAD.l+6} y={PAD.t+ph-8} fontFamily={E.mono} fontSize={9} fill={E.pos} opacity={0.65}>
          Anchored \u00b7 Improving
        </text>

        {/* Pulse legend */}
        <g transform={`translate(${PAD.l+pw-4}, ${PAD.t+ph-22})`}>
          <circle cx={-118} cy={0} r={4} fill={E.gold} opacity={0.9}/>
          <circle cx={-118} cy={0} r={10} fill="none" stroke={E.gold} strokeWidth={1} opacity={0.3}/>
          <text x={-108} y={4} fontFamily={E.mono} fontSize={9} fill={E.muted}>
            Gold ring = deteriorating trajectory
          </text>
        </g>
      </svg>

      {/* Dot tooltip */}
      {tooltip && <MapTooltip {...tooltip} containerRef={containerRef} />}
    </div>
  )
}

function MapTooltip({ row, x, y, containerRef }: {
  row:SnapshotRow; x:number; y:number; containerRef:React.RefObject<HTMLDivElement | null>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({x:0,y:0})
  useEffect(() => {
    const c = containerRef.current; const card = ref.current; if (!c||!card) return
    const rect = c.getBoundingClientRect()
    const tw = card.offsetWidth||200; const th = card.offsetHeight||120
    let lx = x - rect.left + 14; let ly = y - rect.top - 12
    if (lx+tw > rect.width-8) lx = x-rect.left-tw-14
    if (ly+th > rect.height-8) ly = rect.height-th-8
    setPos({ x:lx, y:Math.max(4,ly) })
  }, [x,y,containerRef])
  const det = deterioration(row)
  const color = bucketColor(row.composite_bucket)
  return (
    <div ref={ref} style={{ position:"absolute", left:pos.x, top:pos.y, background:E.bg,
      border:`1px solid ${E.bdr2}`, padding:"10px 14px", pointerEvents:"none", zIndex:50,
      minWidth:192, boxShadow:"0 4px 28px rgba(0,0,0,0.85)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
        <span style={{ fontFamily:E.sans, fontSize:15, fontWeight:800, color:E.text, letterSpacing:"-0.02em" }}>{row.symbol}</span>
        <span style={{ fontFamily:E.mono, fontSize:10, fontWeight:500, color, marginLeft:10 }}>{row.composite_bucket}</span>
      </div>
      {[
        ["OAL",       row.oal_label ?? "\u2014"],
        ["Anchor",    fmtPct(row.axis1_pct)+"th pct"],
        ["Trajectory",fmtPct(row.axis2_pct)+"th pct"],
        ["Composite", fmtPct(row.composite_score)+"th pct"],
      ].map(([k,v]) => (
        <div key={k} style={{ display:"flex", justifyContent:"space-between", gap:16, marginBottom:3 }}>
          <span style={{ fontFamily:E.mono, fontSize:10, color:E.muted }}>{k}</span>
          <span style={{ fontFamily:E.mono, fontSize:10, color:E.body }}>{v}</span>
        </div>
      ))}
      {det > 0 && (
        <div style={{ marginTop:6, paddingTop:6, borderTop:`1px solid ${E.bdr}`,
          fontFamily:E.mono, fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:E.gold }}>
          \u2193 Trajectory deteriorating
        </div>
      )}
    </div>
  )
}

// \u2500\u2500\u2500 Active risk cluster \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function ActiveRiskCluster({ data, onSelect }: { data:SnapshotRow[]; onSelect:(r:SnapshotRow)=>void }) {
  const top = useMemo(() =>
    [...data].filter(r=>r.composite_score!=null)
      .sort((a,b)=>(b.composite_score??0)-(a.composite_score??0)).slice(0,12), [data])
  return (
    <div style={s({ padding:"18px 24px", borderBottom:`1px solid ${E.bdr}` })}>
      <div style={s({ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 })}>
        <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.2em", textTransform:"uppercase", color:E.muted })}>
          Highest Structural Risk \u00b7 Top {top.length} under active filters
        </p>
        <span style={s({ fontFamily:E.mono, fontSize:9, color:E.dim })}>Click to open drilldown</span>
      </div>
      <div style={s({ display:"flex", flexWrap:"wrap", gap:4 })}>
        {top.map(row => {
          const isVH = row.composite_bucket === "Very High"
          return (
            <div key={row.symbol} onClick={() => onSelect(row)} style={s({
              display:"flex", alignItems:"center", gap:7, padding:"5px 10px", cursor:"pointer",
              border:`1px solid ${isVH?"rgba(184,92,74,0.4)":E.bdr}`,
              background: isVH?"rgba(184,92,74,0.07)":"transparent",
            })}>
              <span style={s({ fontFamily:E.mono, fontSize:11.5, fontWeight:500, color:E.text })}>{row.symbol}</span>
              <span style={s({ fontFamily:E.mono, fontSize:9, color:bucketColor(row.composite_bucket) })}>{row.composite_bucket}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// \u2500\u2500\u2500 Cohort grid \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function CohortGrid({ grid, isPaid }: { grid:CohortGrid; isPaid:boolean }) {
  const [metric, setMetric] = useState<CohortMetric>("median_return")
  // Two-axis model: use first panel only
  const panel = grid.panels[0]

  const fmtCell = (c:CohortGridCell) => {
    if (c.suppressed) return "\u2014"
    const v = c[metric]; if (v==null) return "\u2014"
    if (metric==="hit_rate") return `${(v*100).toFixed(1)}%`
    return `${v>=0?"+":""}${(v*100).toFixed(1)}%`
  }

  return (
    <div>
      {/* Metric switcher */}
      <div style={s({ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 })}>
        <div style={s({ display:"flex", flexWrap:"wrap", gap:"4px 12px" })}>
          {[
            { bg:"#4a1212", label:"Strong loss (<\u221212%)" },
            { bg:"#3a1e12", label:"Mild loss"           },
            { bg:"#1e1c18", label:"Neutral"             },
            { bg:"#122a1e", label:"Mild gain"           },
            { bg:"#0e2818", label:"Strong gain (>+12%)" },
          ].map(({bg,label}) => (
            <div key={label} style={s({ display:"flex", alignItems:"center", gap:5 })}>
              <div style={s({ width:9, height:9, background:bg, border:`1px solid ${E.bdr}`, flexShrink:0 })}/>
              <span style={s({ fontFamily:E.mono, fontSize:9, color:E.muted })}>{label}</span>
            </div>
          ))}
        </div>
        <div style={s({ display:"flex", gap:3 })}>
          {(["median_return","mean_return","hit_rate"] as CohortMetric[]).map(m => (
            <button key={m} onClick={() => setMetric(m)} style={s({
              fontFamily:E.mono, fontSize:9.5, padding:"4px 10px", cursor:"pointer",
              border:`1px solid ${metric===m ? E.bdr2 : E.bdr}`,
              background: metric===m ? E.bg2 : "transparent",
              color: metric===m ? E.body : E.muted,
            })}>
              {m==="median_return"?"Median":m==="mean_return"?"Mean":"Hit Rate"}
            </button>
          ))}
        </div>
      </div>

      <div style={s({ overflowX:"auto" })}>
        {panel && (
          <table style={s({ borderCollapse:"collapse", width:"100%", minWidth:520 })}>
            <thead>
              <tr>
                <th style={s({ fontFamily:E.mono, fontSize:9, color:E.muted, padding:"6px 10px",
                  textAlign:"left", borderBottom:`1px solid ${E.bdr}`, fontWeight:400 })}>
                  Trajectory \u2193 / Anchor \u2192
                </th>
                {grid.metadata.x_axis_labels.map(l => (
                  <th key={l} style={s({ fontFamily:E.mono, fontSize:9, color:E.muted,
                    padding:"6px 8px", textAlign:"center", borderBottom:`1px solid ${E.bdr}`, fontWeight:400 })}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {panel.rows.map(row => (
                <tr key={row.axis2_bucket}>
                  <td style={s({ fontFamily:E.mono, fontSize:9.5, color:E.body, padding:"3px 10px",
                    borderBottom:`1px solid rgba(255,255,255,0.025)`, whiteSpace:"nowrap" })}>{row.axis2_bucket}</td>
                  {row.cells.map(cell => {
                    const v = cell.suppressed ? null : cell[metric]
                    const cv = metric==="hit_rate" ? ((v as number??0)-0.5)*2 : v as number
                    const strong = !cell.suppressed && metric!=="hit_rate" && v!=null && Math.abs(v)>0.15
                    const skew = skewDir(cell)
                    return (
                      <td key={cell.axis1_bucket} style={s({ padding:2, borderBottom:`1px solid rgba(255,255,255,0.025)` })}
                        title={`Median: ${fmtSigned(cell.median_return)} \u00b7 Hit rate: ${fmt(cell.hit_rate)} \u00b7 N=${cell.count}`}>
                        <div style={s({ height:54, display:"flex", flexDirection:"column",
                          alignItems:"center", justifyContent:"center",
                          background:returnHeatBg(cv,cell.suppressed),
                          border: strong?`2px solid rgba(240,244,239,0.25)`:`1px solid ${E.bdr}` })}>
                          <div style={s({ fontFamily:E.mono, fontSize:11, fontWeight:500, color:returnHeatText(cv,cell.suppressed) })}>
                            {fmtCell(cell)}
                          </div>
                          {skew!=="none" && metric==="mean_return" && (
                            <div style={s({ fontFamily:E.mono, fontSize:8.5, color:skew==="right"?E.pos:E.neg, marginTop:1 })}>
                              {skew==="right"?"\u25b2 skewed":"\u25bc skewed"}
                            </div>
                          )}
                          <div style={s({ fontFamily:E.mono, fontSize:8.5, color:"rgba(255,255,255,0.3)", marginTop:1 })}>
                            N={fmtNum(cell.count)}
                          </div>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p style={s({ fontFamily:E.mono, fontSize:9.5, color:E.muted, marginTop:10, lineHeight:1.6 })}>
        Outlined cells = |return| &gt; 15%. Axis 3 removed from composite \u2014 cohort grid is two-axis.
        Historical analysis only \u2014 does not predict individual returns.
      </p>
    </div>
  )
}

// \u2500\u2500\u2500 Company drilldown \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function Drilldown({ company, grid, isPaid, onClose }: {
  company:SnapshotRow; grid:CohortGrid|null; isPaid:boolean; onClose:()=>void
}) {
  const { headerRead, trajectoryProfile, takeaway } = narrateCompany(company)
  const cohortCell = findCohortCell(company, grid)
  const a1 = pctToBucket(company.axis1_pct)
  const a2 = pctToBucket(company.axis2_pct)
  const det = deterioration(company)

  const axes = [
    {
      label:"Operational Anchor Risk", bucket:a1, pct:company.axis1_pct,
      interp: (company.axis1_pct??0) >= 0.8 ? "Valuation is severely elevated relative to demonstrated output. The narrative bridge is very long."
        : (company.axis1_pct??0) >= 0.6 ? "Valuation is elevated relative to demonstrated operating output."
        : (company.axis1_pct??0) >= 0.4 ? "Valuation stretch is moderate. Operational support is partial."
        : "Valuation is well-supported by demonstrated operational output.",
    },
    {
      label:"Operational Trajectory Risk", bucket:a2, pct:company.axis2_pct,
      interp: (company.axis2_pct??0) >= 0.8 ? "Operational anchor is weakening rapidly on a trailing basis."
        : (company.axis2_pct??0) >= 0.6 ? "Operational anchor is deteriorating on a trailing basis."
        : (company.axis2_pct??0) >= 0.4 ? "Operational trajectory is mixed \u2014 no clear directional signal."
        : "Operational anchor is strengthening on a trailing basis.",
    },
  ]

  return (
    <div style={s({ height:"100%", overflowY:"auto", background:E.bg2 })}>
      {/* Header */}
      <div style={s({ padding:"14px 16px", borderBottom:`1px solid ${E.bdr}`,
        display:"flex", justifyContent:"space-between", alignItems:"flex-start" })}>
        <div>
          <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.16em",
            textTransform:"uppercase", color:E.muted, marginBottom:4 })}>Company Drilldown</p>
          <div style={s({ fontFamily:E.sans, fontSize:22, fontWeight:800, color:E.text, letterSpacing:"-0.03em" })}>{company.symbol}</div>
          <div style={s({ fontFamily:E.mono, fontSize:10, color:E.muted, marginTop:2 })}>{company.oal_label ?? "\u2014"}</div>
          {det > 0 && (
            <div style={s({ marginTop:6, fontFamily:E.mono, fontSize:9, letterSpacing:"0.12em",
              textTransform:"uppercase", color:E.gold })}>\u2193 Trajectory deteriorating</div>
          )}
        </div>
        <div style={s({ textAlign:"right" })}>
          <div style={s({ fontFamily:E.sans, fontSize:14, fontWeight:700, color:bucketColor(company.composite_bucket) })}>
            {company.composite_bucket}
          </div>
          <div style={s({ fontFamily:E.mono, fontSize:9.5, color:E.muted })}>{fmtPct(company.composite_score)}th pct</div>
          <button onClick={onClose} style={s({ fontFamily:E.mono, fontSize:9, color:E.muted,
            background:"none", border:`1px solid ${E.bdr}`, padding:"3px 8px", cursor:"pointer", marginTop:8 })}>
            Close
          </button>
        </div>
      </div>

      {/* Narrative summary */}
      <div style={s({ padding:"14px 16px", borderBottom:`1px solid ${E.bdr}` })}>
        <div style={s({ fontFamily:E.sans, fontSize:12, lineHeight:1.72, color:E.body,
          background:E.bg3, border:`1px solid ${E.bdr}`, padding:"10px 12px" })}>{headerRead}</div>
      </div>

      {/* Axis breakdown */}
      <div style={s({ padding:"14px 16px", borderBottom:`1px solid ${E.bdr}` })}>
        <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.16em",
          textTransform:"uppercase", color:E.muted, marginBottom:12 })}>Axis Breakdown</p>
        <div style={s({ display:"flex", flexDirection:"column", gap:14 })}>
          {axes.map(({ label, bucket, pct, interp }) => (
            <div key={label}>
              <div style={s({ display:"flex", justifyContent:"space-between", marginBottom:4 })}>
                <span style={s({ fontFamily:E.mono, fontSize:9, letterSpacing:"0.1em",
                  textTransform:"uppercase", color:E.muted })}>{label}</span>
                <span style={s({ fontFamily:E.mono, fontSize:9.5, fontWeight:500, color:bucketColor(bucket) })}>{bucket} \u00b7 {fmtPct(pct)}th</span>
              </div>
              <div style={s({ height:2, background:E.bdr2, marginBottom:6, position:"relative" })}>
                <div style={s({ position:"absolute", left:0, top:0, height:2,
                  width:`${(pct??0)*100}%`, background:bucketColor(bucket) })}/>
              </div>
              <p style={s({ fontFamily:E.sans, fontSize:11.5, lineHeight:1.65, color:E.muted })}>{interp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cohort match */}
      {isPaid ? (
        <div style={s({ padding:"14px 16px", borderBottom:`1px solid ${E.bdr}` })}>
          <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.16em",
            textTransform:"uppercase", color:E.muted, marginBottom:8 })}>Historical Cohort Match</p>
          <p style={s({ fontFamily:E.mono, fontSize:9.5, color:E.dim, marginBottom:10, lineHeight:1.5 })}>
            Anchor {a1} \u00b7 Trajectory {a2} \u00b7 12-month forward horizon
          </p>
          {cohortCell && !cohortCell.suppressed ? (
            <>
              <div style={s({ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4, marginBottom:10 })}>
                {[
                  { label:"Median Return", val:fmtSigned(cohortCell.median_return) },
                  { label:"Hit Rate",      val:fmt(cohortCell.hit_rate) },
                  { label:"Observations", val:fmtNum(cohortCell.count) },
                ].map(({ label, val }) => (
                  <div key={label} style={s({ background:E.bg3, border:`1px solid ${E.bdr}`,
                    padding:"10px 8px", textAlign:"center" })}>
                    <div style={s({ fontFamily:E.mono, fontSize:14, fontWeight:500, color:E.text })}>{val}</div>
                    <div style={s({ fontFamily:E.mono, fontSize:8.5, color:E.muted, marginTop:2 })}>{label}</div>
                  </div>
                ))}
              </div>
              <p style={s({ fontFamily:E.sans, fontSize:11.5, lineHeight:1.65, color:E.body })}>
                Companies in this structural zone produced{" "}
                <strong style={s({ color:E.text })}>{fmtSigned(cohortCell.median_return)}</strong> median return
                over 12 months, with a{" "}
                <strong style={s({ color:E.text })}>{fmt(cohortCell.hit_rate)}</strong> hit rate.
                {skewDir(cohortCell)==="right" && ` Mean is materially higher (${fmtSigned(cohortCell.mean_return)}) \u2014 right-skewed by a small number of large winners.`}
                {skewDir(cohortCell)==="left"  && ` Mean is materially lower (${fmtSigned(cohortCell.mean_return)}) \u2014 left-skewed by outsized losses.`}
              </p>
            </>
          ) : (
            <p style={s({ fontFamily:E.mono, fontSize:10.5, color:E.muted })}>
              {cohortCell?.suppressed ? "Cell suppressed \u2014 insufficient observations." : "No cohort match found for this structural profile."}
            </p>
          )}
        </div>
      ) : (
        <div style={s({ padding:"14px 16px", borderBottom:`1px solid ${E.bdr}`, background:E.gatm })}>
          <div style={s({ display:"flex", alignItems:"center", gap:8, marginBottom:8 })}>
            <Lock size={13} style={{color:E.gold}}/>
            <p style={s({ fontFamily:E.mono, fontSize:9, letterSpacing:"0.16em",
              textTransform:"uppercase", color:E.gold })}>Paid Subscribers</p>
          </div>
          <p style={s({ fontFamily:E.sans, fontSize:12, lineHeight:1.65, color:E.body, marginBottom:10 })}>
            Historical cohort outcomes for this structural profile are available with a paid subscription.
          </p>
          <a href="/platform/subscribe" style={s({ fontFamily:E.sans, fontSize:10.5, fontWeight:700,
            letterSpacing:"0.08em", textTransform:"uppercase", padding:"8px 16px",
            background:E.gold, color:E.bg, textDecoration:"none", display:"inline-block" })}>
            Upgrade to Full Access
          </a>
        </div>
      )}

      {/* Trajectory context */}
      <div style={s({ padding:"14px 16px" })}>
        <div style={s({ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 })}>
          <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.16em",
            textTransform:"uppercase", color:E.muted })}>Trajectory Context</p>
          <span style={s({ fontFamily:E.mono, fontSize:8, letterSpacing:"0.12em",
            textTransform:"uppercase", color:E.muted, background:"rgba(107,100,88,0.1)", padding:"2px 6px" })}>Interpretive</span>
        </div>
        <div style={s({ background:E.bg3, border:`1px solid ${E.bdr}`, padding:"12px" })}>
          <p style={s({ fontFamily:E.sans, fontSize:12, lineHeight:1.72, color:E.body, marginBottom:10 })}>{trajectoryProfile}</p>
          <div style={s({ paddingTop:10, borderTop:`1px solid ${E.bdr}` })}>
            <div style={s({ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 })}>
              <span style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.12em",
                textTransform:"uppercase", color:E.pos })}>Structural Takeaway</span>
              <span style={s({ fontFamily:E.mono, fontSize:8, color:E.muted,
                background:"rgba(107,100,88,0.1)", padding:"2px 6px" })}>Interpretive</span>
            </div>
            <p style={s({ fontFamily:E.sans, fontSize:12, lineHeight:1.72, color:E.body })}>{takeaway}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// \u2500\u2500\u2500 Snapshot table \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function SnapshotTable({ data, onSelect }: { data:SnapshotRow[]; onSelect:(r:SnapshotRow)=>void }) {
  const [search, setSearch]   = useState("")
  const [oalF,   setOalF]     = useState("All")
  const [buckF,  setBuckF]    = useState("All")

  const filtered = useMemo(() => data.filter(r => {
    if (oalF!=="All" && r.oal_label!==oalF) return false
    if (buckF!=="All" && r.composite_bucket!==buckF) return false
    if (search && !r.symbol.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [data, search, oalF, buckF])

  return (
    <div>
      <div style={s({ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap", alignItems:"center" })}>
        <div style={s({ position:"relative" })}>
          <Search size={12} style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:E.muted}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search ticker"
            style={s({ fontFamily:E.mono, fontSize:11, padding:"6px 8px 6px 24px",
              background:E.bg2, border:`1px solid ${E.bdr}`, color:E.text, outline:"none", width:140 })}/>
        </div>
        <select value={oalF} onChange={e=>setOalF(e.target.value)}
          style={s({ fontFamily:E.mono, fontSize:11, padding:"6px 8px",
            background:E.bg2, border:`1px solid ${E.bdr}`, color:E.body, outline:"none" })}>
          <option value="All">All OALs</option>
          {OAL_ORDER.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={buckF} onChange={e=>setBuckF(e.target.value)}
          style={s({ fontFamily:E.mono, fontSize:11, padding:"6px 8px",
            background:E.bg2, border:`1px solid ${E.bdr}`, color:E.body, outline:"none" })}>
          <option value="All">All Buckets</option>
          {BUCKET_ORDER.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <span style={s({ fontFamily:E.mono, fontSize:9.5, color:E.muted, marginLeft:"auto" })}>{fmtNum(filtered.length)} companies</span>
      </div>
      <div style={s({ overflowX:"auto" })}>
        <table style={s({ width:"100%", borderCollapse:"collapse", minWidth:500 })}>
          <thead>
            <tr style={s({ background:E.bg2, borderBottom:`1px solid ${E.bdr}` })}>
              {["Symbol","OAL","Anchor Risk","Trajectory","Composite"].map(h => (
                <th key={h} style={s({ fontFamily:E.mono, fontSize:9, letterSpacing:"0.14em",
                  textTransform:"uppercase", color:E.muted, padding:"8px 10px", textAlign:"left", fontWeight:400 })}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.symbol} onClick={() => onSelect(row)}
                style={s({ borderBottom:`1px solid rgba(255,255,255,0.025)`, cursor:"pointer" })}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = E.gatm}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <td style={s({ fontFamily:E.mono, fontSize:12, fontWeight:500, color:E.text, padding:"7px 10px" })}>{row.symbol}</td>
                <td style={s({ fontFamily:E.mono, fontSize:11, color:E.body, padding:"7px 10px" })}>{row.oal_label}</td>
                <td style={s({ fontFamily:E.mono, fontSize:11, color:E.body, padding:"7px 10px" })}>{fmtPct(row.axis1_pct)}th</td>
                <td style={s({ fontFamily:E.mono, fontSize:11, color:E.body, padding:"7px 10px" })}>{fmtPct(row.axis2_pct)}th</td>
                <td style={s({ padding:"7px 10px" })}>
                  <span style={s({ fontFamily:E.mono, fontSize:11, fontWeight:500,
                    color:bucketColor(row.composite_bucket), padding:"2px 7px",
                    border:`1px solid ${bucketColor(row.composite_bucket)}30`,
                    background:`${bucketColor(row.composite_bucket)}10` })}>
                    {row.composite_bucket}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// \u2500\u2500\u2500 Anchor structure tab \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function AnchorTab({ oalSummary }: { oalSummary:OALSummaryRow[] }) {
  const CS = { fontFamily:E.mono, fontSize:10, fill:E.muted }
  return (
    <div style={s({ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 })}>
      <div style={s({ border:`1px solid ${E.bdr}`, background:E.bg2 })}>
        <div style={s({ padding:"16px 20px", borderBottom:`1px solid ${E.bdr}` })}>
          <p style={s({ fontFamily:E.mono, fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase",
            color:E.muted, marginBottom:4 })}>Anchor Distribution</p>
          <p style={s({ fontFamily:E.sans, fontSize:12.5, color:E.body, lineHeight:1.65 })}>
            Companies by deepest qualifying operational anchor. Each step toward Revenue increases
            narrative dependence \u2014 and structural risk.
          </p>
        </div>
        <div style={s({ padding:"16px 20px", height:280 })}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={oalSummary} margin={{top:4,right:8,left:0,bottom:4}} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} vertical={false}/>
              <XAxis dataKey="oal_label" tick={CS as any} axisLine={false} tickLine={false}/>
              <YAxis tick={CS as any} axisLine={false} tickLine={false} width={42}/>
              <Tooltip contentStyle={{background:E.bg2,border:`1px solid ${E.bdr2}`,
                fontFamily:E.mono,fontSize:11,color:E.text,borderRadius:0}}/>
              <Bar dataKey="n" radius={[2,2,0,0]}>
                {oalSummary.map((row,i) => (
                  <Cell key={i} fill={
                    row.oal_label==="FCF"?"#6CB686":
                    row.oal_label==="Net Income"?"#5A8EC0":
                    row.oal_label==="EBIT"?"#C6A24A":
                    row.oal_label==="Revenue"?"#CC6652": E.muted
                  } opacity={0.85}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={s({ padding:"10px 20px", borderTop:`1px solid ${E.bdr}` })}>
          <p style={s({ fontFamily:E.mono, fontSize:9.5, color:E.muted })}>
            FCF vs Revenue median return spread: +26.6pp \u00b7 Held across all regimes tested
          </p>
        </div>
      </div>

      <div style={s({ border:`1px solid ${E.bdr}`, background:E.bg2 })}>
        <div style={s({ padding:"16px 20px", borderBottom:`1px solid ${E.bdr}` })}>
          <p style={s({ fontFamily:E.mono, fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase",
            color:E.muted, marginBottom:4 })}>Median Scores by Anchor Level</p>
          <p style={s({ fontFamily:E.sans, fontSize:12.5, color:E.body, lineHeight:1.65 })}>
            Where structural pressure deepens as the anchor shallows.
          </p>
        </div>
        <div style={s({ padding:"16px 20px" })}>
          <table style={s({ width:"100%", borderCollapse:"collapse" })}>
            <thead>
              <tr style={s({ borderBottom:`1px solid ${E.bdr}` })}>
                {["Anchor","Count","Anchor Risk","Composite"].map(h => (
                  <th key={h} style={s({ fontFamily:E.mono, fontSize:9, letterSpacing:"0.14em",
                    textTransform:"uppercase", color:E.muted, padding:"6px 8px", textAlign:"left", fontWeight:400 })}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {oalSummary.map(row => (
                <tr key={row.oal_label} style={s({ borderBottom:`1px solid rgba(255,255,255,0.025)` })}>
                  <td style={s({ fontFamily:E.mono, fontSize:12, fontWeight:500, color:E.text, padding:"7px 8px" })}>{row.oal_label}</td>
                  <td style={s({ fontFamily:E.mono, fontSize:11, color:E.body, padding:"7px 8px" })}>{fmtNum(row.n)}</td>
                  <td style={s({ fontFamily:E.mono, fontSize:11, color:E.body, padding:"7px 8px" })}>{row.median_axis1==null?"\u2014":fmtPct(row.median_axis1)+"th"}</td>
                  <td style={s({ fontFamily:E.mono, fontSize:11, color:E.body, padding:"7px 8px" })}>{row.median_composite==null?"\u2014":fmtPct(row.median_composite)+"th"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// \u2500\u2500\u2500 History tab \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

function HistoryTab({ manifest }: { manifest:HistoryManifestRow[] }) {
  return (
    <div style={s({ border:`1px solid ${E.bdr}`, background:E.bg2 })}>
      <div style={s({ padding:"16px 20px", borderBottom:`1px solid ${E.bdr}` })}>
        <p style={s({ fontFamily:E.mono, fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase",
          color:E.muted, marginBottom:4 })}>Historical Coverage</p>
        <p style={s({ fontFamily:E.sans, fontSize:12.5, color:E.body, lineHeight:1.65 })}>
          Archived monthly structural snapshots. Each month is a formation state from which
          12-month forward returns were measured \u2014 the empirical basis of the cohort grids.
        </p>
      </div>
      <div style={s({ overflowX:"auto" })}>
        <table style={s({ width:"100%", borderCollapse:"collapse" })}>
          <thead>
            <tr style={s({ background:E.bg3, borderBottom:`1px solid ${E.bdr}` })}>
              {["Month","OAL Scores","OAL Summary","Structural Snapshot"].map(h => (
                <th key={h} style={s({ fontFamily:E.mono, fontSize:9, letterSpacing:"0.14em",
                  textTransform:"uppercase", color:E.muted, padding:"8px 14px", textAlign:"left", fontWeight:400 })}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {manifest.map(row => (
              <tr key={row.month} style={s({ borderBottom:`1px solid rgba(255,255,255,0.025)` })}>
                <td style={s({ fontFamily:E.mono, fontSize:11.5, fontWeight:500, color:E.text, padding:"7px 14px" })}>{row.month}</td>
                <td style={s({ fontFamily:E.mono, fontSize:11, color:E.body, padding:"7px 14px" })}>{row.has_oal_scores===false?"\u2014":fmtNum(row.oal_scores_rows)}</td>
                <td style={s({ fontFamily:E.mono, fontSize:11, color:E.body, padding:"7px 14px" })}>{row.has_oal_summary===false?"\u2014":fmtNum(row.oal_summary_rows)}</td>
                <td style={s({ fontFamily:E.mono, fontSize:11, color:E.body, padding:"7px 14px" })}>{row.has_structural_snapshot===false?"\u2014":fmtNum(row.structural_rows)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// \u2500\u2500\u2500 Page \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

export default function PlatformBeta() {
  const { user, isSignedIn } = useUser()
  const isPaid = !!(isSignedIn && user?.publicMetadata?.subscription === "active")

  const [snapshot,  setSnapshot]  = useState<SnapshotRow[]>([])
  const [oalSummary,setOalSummary]= useState<OALSummaryRow[]>([])
  const [manifest,  setManifest]  = useState<HistoryManifestRow[]>([])
  const [cohortGrid,setCohortGrid]= useState<CohortGrid|null>(null)
  const [loading,   setLoading]   = useState(true)

  const [tab,      setTab]      = useState("market-map")
  const [oalF,     setOalF]     = useState("All")
  const [buckF,    setBuckF]    = useState("All")
  const [search,   setSearch]   = useState("")
  const [selected, setSelected] = useState<SnapshotRow|null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/data/osmr_snapshot.json").then(r=>r.json()),
      fetch("/data/oal_summary.json").then(r=>r.json()),
      fetch("/data/history_manifest.json").then(r=>r.json()),
      fetch("/data/historical_cohort_grids.json").then(r=>r.json()),
    ]).then(([snap, oal, hist, grids]) => {
      setSnapshot(snap); setOalSummary(oal); setManifest(hist); setCohortGrid(grids)
      setLoading(false)
    }).catch(e => { console.error(e); setLoading(false) })
  }, [])

  const filtered = useMemo(() => snapshot.filter(r => {
    if (oalF!=="All" && r.oal_label!==oalF) return false
    if (buckF!=="All" && r.composite_bucket!==buckF) return false
    if (search && !r.symbol.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [snapshot, oalF, buckF, search])

  const stats = useMemo(() => ({
    veryHigh:    filtered.filter(r => r.composite_bucket==="Very High").length,
    improving:   filtered.filter(r => (r.axis2_pct??1) < 0.4).length,
    total:       filtered.length,
    fcfAnchored: filtered.filter(r => r.oal_label==="FCF").length,
  }), [filtered])

  if (loading) return (
    <div style={s({ minHeight:"100vh", background:E.bg, display:"flex", alignItems:"center", justifyContent:"center" })}>
      <div style={s({ fontFamily:E.mono, fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:E.muted })}>
        Loading structural data...
      </div>
    </div>
  )

  return (
    <div style={s({ minHeight:"100vh", background:E.bg, color:E.text, fontFamily:E.sans })}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      {/* NAV */}
      <nav style={s({ display:"flex", justifyContent:"space-between", alignItems:"center",
        height:48, padding:"0 28px", borderBottom:`1px solid ${E.bdr}`,
        background:E.bg, position:"sticky", top:0, zIndex:50 })}>
        <a href="/" style={s({ textDecoration:"none", display:"flex", alignItems:"baseline" })}>
          <span style={s({ fontFamily:E.mono, fontSize:9, letterSpacing:"0.32em", textTransform:"uppercase", color:E.muted })}>The Capital</span>
          <span style={s({ fontFamily:E.serif, fontStyle:"italic", fontSize:15, color:E.gold, marginLeft:6 })}>Steward</span>
        </a>
        <div style={s({ display:"flex", alignItems:"center" })}>
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)} style={s({
              fontFamily:E.mono, fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase",
              color: tab===id ? E.gold : E.muted,
              padding:"0 14px", height:48, background:"none", border:"none",
              borderBottom:`2px solid ${tab===id ? E.gold : "transparent"}`,
              borderLeft:`1px solid ${E.bdr}`, cursor:"pointer",
            })}>{label}</button>
          ))}
        </div>
        <div style={s({ display:"flex", alignItems:"center", gap:8 })}>
          <div style={s({ width:5, height:5, borderRadius:"50%", background:E.gold, animation:"pulse 2.5s ease-in-out infinite" })}/>
          <span style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.18em", textTransform:"uppercase", color:E.muted })}>Live \u00b7 Mar 2026</span>
          {!isPaid && (
            <a href="/platform/subscribe" style={s({ fontFamily:E.sans, fontSize:9.5, fontWeight:700,
              letterSpacing:"0.08em", textTransform:"uppercase", padding:"5px 12px",
              background:E.gold, color:E.bg, textDecoration:"none", marginLeft:10 })}>Upgrade</a>
          )}
        </div>
      </nav>

      {/* TEMPORAL BAR */}
      <TemporalBar manifest={manifest}/>

      {/* KPI STRIP */}
      <KPIStrip stats={stats} isPaid={isPaid}/>

      {/* GLOBAL FILTERS */}
      <div style={s({ display:"flex", alignItems:"center", gap:8, padding:"9px 28px",
        borderBottom:`1px solid ${E.bdr}`, background:E.bg2, flexWrap:"wrap" })}>
        <Filter size={12} style={{color:E.muted}}/>
        <span style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.16em",
          textTransform:"uppercase", color:E.muted, marginRight:4 })}>Filters</span>
        <div style={s({ position:"relative" })}>
          <Search size={11} style={{position:"absolute",left:7,top:"50%",transform:"translateY(-50%)",color:E.muted}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ticker"
            style={s({ fontFamily:E.mono, fontSize:10.5, padding:"5px 8px 5px 22px",
              background:E.bg, border:`1px solid ${E.bdr}`, color:E.text, outline:"none", width:110 })}/>
        </div>
        <select value={oalF} onChange={e=>setOalF(e.target.value)}
          style={s({ fontFamily:E.mono, fontSize:10.5, padding:"5px 8px",
            background:E.bg, border:`1px solid ${E.bdr}`, color:E.body, outline:"none" })}>
          <option value="All">All OALs</option>
          {OAL_ORDER.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={buckF} onChange={e=>setBuckF(e.target.value)}
          style={s({ fontFamily:E.mono, fontSize:10.5, padding:"5px 8px",
            background:E.bg, border:`1px solid ${E.bdr}`, color:E.body, outline:"none" })}>
          <option value="All">All Buckets</option>
          {BUCKET_ORDER.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <button onClick={() => { setSearch(""); setOalF("All"); setBuckF("All") }}
          style={s({ fontFamily:E.mono, fontSize:9.5, color:E.muted,
            background:"none", border:`1px solid ${E.bdr}`, padding:"5px 10px", cursor:"pointer" })}>
          Clear
        </button>
        <span style={s({ fontFamily:E.mono, fontSize:9, color:E.dim, marginLeft:"auto" })}>{fmtNum(filtered.length)} companies</span>
      </div>

      {/* MAIN + SIDEBAR */}
      <div style={s({ display:"grid", gridTemplateColumns: selected?"1fr 320px":"1fr", minHeight:"calc(100vh - 196px)" })}>
        <div style={s({ borderRight: selected?`1px solid ${E.bdr}`:"none" })}>

          {/* \u2500\u2500 MARKET MAP \u2500\u2500 */}
          {tab==="market-map" && (
            <div>
              <InterpretiveLayer data={filtered}/>
              <div style={s({ padding:"20px 24px", borderBottom:`1px solid ${E.bdr}` })}>
                <div style={s({ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 })}>
                  <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.2em", textTransform:"uppercase", color:E.muted })}>
                    Structural Constellation
                  </p>
                  <span style={s({ fontFamily:E.mono, fontSize:9, color:E.dim })}>
                    X = Trajectory Risk \u00b7 Y = Anchor Risk \u00b7 Color = Composite bucket
                  </span>
                </div>
                {/* Legend row */}
                <div style={s({ display:"flex", flexWrap:"wrap", gap:"6px 16px", marginBottom:12 })}>
                  {BUCKET_ORDER.map(b => (
                    <div key={b} style={s({ display:"flex", alignItems:"center", gap:6 })}>
                      <div style={s({ width:8, height:8, borderRadius:"50%", background:bucketColor(b), flexShrink:0 })}/>
                      <span style={s({ fontFamily:E.mono, fontSize:9.5, color:E.muted })}>{b}</span>
                    </div>
                  ))}
                  <span style={s({ fontFamily:E.mono, fontSize:9.5, color:E.dim, marginLeft:4 })}>
                    \u00b7 Dot size = market cap \u00b7 Click dot to inspect
                  </span>
                </div>
                <ConstellationMap
                  data={filtered}
                  onSelect={setSelected}
                  selectedSymbol={selected?.symbol}
                />
              </div>
              <ActiveRiskCluster data={filtered} onSelect={setSelected}/>
              {cohortGrid && (
                <div style={s({ padding:"20px 24px", borderBottom:`1px solid ${E.bdr}` })}>
                  <div style={s({ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 })}>
                    <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.2em", textTransform:"uppercase", color:E.muted })}>
                      Historical Cohort Outcomes
                    </p>
                    <span style={s({ fontFamily:E.mono, fontSize:9, color:E.dim })}>
                      {fmtNum(cohortGrid.metadata.observation_count)} obs \u00b7 {cohortGrid.metadata.horizon_months}M forward
                    </span>
                  </div>
                  <p style={s({ fontFamily:E.sans, fontSize:12, color:E.body, marginBottom:14, lineHeight:1.65 })}>
                    How companies in each structural zone have historically performed. The bottom-right cells \u2014 high anchor risk, high trajectory risk \u2014 carry the strongest signal.
                  </p>
                  {isPaid ? (
                    <CohortGrid grid={cohortGrid} isPaid={isPaid}/>
                  ) : (
                    <div style={s({ border:`1px solid ${E.bdr}`, background:E.gatm, padding:"24px" })}>
                      <div style={s({ display:"flex", alignItems:"center", gap:8, marginBottom:10 })}>
                        <Lock size={14} style={{color:E.gold}}/>
                        <span style={s({ fontFamily:E.mono, fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:E.gold })}>Paid Subscribers</span>
                      </div>
                      <p style={s({ fontFamily:E.sans, fontSize:13, color:E.body, lineHeight:1.75, marginBottom:14 })}>
                        The full cohort grid \u2014 {fmtNum(cohortGrid.metadata.observation_count)} observations across {cohortGrid.metadata.horizon_months}-month forward horizons \u2014 is available with a paid subscription.
                      </p>
                      <a href="/platform/subscribe" style={s({ fontFamily:E.sans, fontSize:11, fontWeight:700,
                        letterSpacing:"0.08em", textTransform:"uppercase", padding:"10px 20px",
                        background:E.gold, color:E.bg, textDecoration:"none", display:"inline-block" })}>
                        Subscribe to Access
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* \u2500\u2500 SNAPSHOT \u2500\u2500 */}
          {tab==="snapshot" && (
            <div style={s({ padding:"20px 24px" })}>
              <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.2em", textTransform:"uppercase", color:E.muted, marginBottom:6 })}>Current Snapshot</p>
              <p style={s({ fontFamily:E.sans, fontSize:12, color:E.body, marginBottom:14, lineHeight:1.65 })}>
                Full structural profile for each company under active filters. Click any row to inspect.
              </p>
              <SnapshotTable data={filtered} onSelect={setSelected}/>
            </div>
          )}

          {/* \u2500\u2500 ANCHOR STRUCTURE \u2500\u2500 */}
          {tab==="anchors" && (
            <div style={s({ padding:"20px 24px" })}>
              <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.2em", textTransform:"uppercase", color:E.muted, marginBottom:6 })}>Anchor Structure</p>
              <p style={s({ fontFamily:E.sans, fontSize:12, color:E.body, marginBottom:14, lineHeight:1.65 })}>
                Distribution across levels of demonstrated operational output. Anchor depth is the most durable signal in the framework \u2014 the FCF\u2013Revenue spread of +26.6pp held across all regimes tested.
              </p>
              <AnchorTab oalSummary={oalSummary}/>
            </div>
          )}

          {/* \u2500\u2500 HISTORY \u2500\u2500 */}
          {tab==="history" && (
            <div style={s({ padding:"20px 24px" })}>
              <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.2em", textTransform:"uppercase", color:E.muted, marginBottom:6 })}>Historical Coverage</p>
              <p style={s({ fontFamily:E.sans, fontSize:12, color:E.body, marginBottom:14, lineHeight:1.65 })}>
                Archived monthly structural snapshots. Each month is a formation state from which 12-month forward returns were measured.
              </p>
              <HistoryTab manifest={manifest}/>
            </div>
          )}

          {/* FOOTER */}
          <div style={s({ padding:"24px 28px", borderTop:`1px solid ${E.bdr}`, textAlign:"center" })}>
            <p style={s({ fontFamily:E.mono, fontSize:9.5, color:E.muted, lineHeight:1.7 })}>
              The Capital Steward, LLC \u00b7 thecapitalsteward.com<br/>
              \u00a9 2026 The Capital Steward, LLC. For informational purposes only. Not investment advice.
            </p>
          </div>
        </div>

        {/* DRILLDOWN SIDEBAR */}
        {selected && (
          <Drilldown
            company={selected}
            grid={cohortGrid}
            isPaid={isPaid}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  )
}