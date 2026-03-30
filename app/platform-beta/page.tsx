'use client'

// File: app/platform-beta/page.tsx
// Auth: Clerk — unauthenticated → /platform
// Data: /public/data/*.json (static, no API routes)
// Tier: free = signed in, subscription != 'active'
//       paid = subscription === 'active'

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Search, Filter } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts"

// ─── Design tokens ─────────────────────────────────────────────────────────────

const E = {
  bg:   "#0E0D0B", bg2: "#131210", bg3: "#181614",
  bdr:  "#272420", bdr2: "#33302A",
  text: "#EDE9E0", body: "#A89E8E", muted: "#6B6458", dim: "#3A3530",
  gold: "#C5A24A", gatm: "rgba(197,162,74,0.04)",
  pos:  "#5A9870", posSoft: "#3E6B4F",
  neg:  "#B85C4A", negSoft: "#A05050",
  blue: "#4A7AA8",
  mono: "'IBM Plex Mono','Courier New',monospace",
  sans: "'Syne',system-ui,sans-serif",
  serif:"'Instrument Serif',Georgia,serif",
}
const s = (x: object) => x as React.CSSProperties

// ─── Types ─────────────────────────────────────────────────────────────────────

type SnapshotRow = {
  symbol: string
  oal_label: string | null
  risk_bucket_within_oal: string | null
  axis1_pct: number | null
  axis2_pct: number | null
  axis2_prev_pct?: number | null   // prior month — drives pulse
  axis2_plot?: number | null
  composite_score: number | null
  composite_bucket: string | null
  market_cap?: number | null       // USD — drives dot size
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

// ─── Constants ─────────────────────────────────────────────────────────────────

const BUCKET_ORDER = ["Very Low","Low","Moderate","High","Very High"]
const OAL_ORDER    = ["FCF","Net Income","EBIT","Revenue","Non-viable"]
const TABS = [
  { id:"market-map", label:"Market Map"   },
  { id:"snapshot",   label:"Snapshot"     },
  { id:"anchors",    label:"Anchor Structure" },
  { id:"history",    label:"History"      },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt       = (v: number | null, d = 1) => v == null || isNaN(v) ? "—" : `${(v*100).toFixed(d)}%`
const fmtSigned = (v: number | null) => v == null || isNaN(v) ? "—" : `${v>=0?"+":""}${(v*100).toFixed(1)}%`
const fmtPct    = (v: number | null) => v == null || isNaN(v) ? "—" : `${Math.round(v*100)}th`
const fmtNum    = (v: number | null) => v == null || isNaN(v) ? "—" : v.toLocaleString()

function pctToBucket(p: number | null): string {
  if (p == null) return "—"
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
  if (v <= -0.12) return "#e8806e"; if (v <= -0.03) return "#c47850"
  if (v <   0.03) return E.body;    if (v <   0.12) return "#7cc89d"
  return E.pos
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
    ? "Trajectory is deteriorating while valuation is already highly stretched — an escalation profile. The narrative bridge is lengthening as the operational anchor weakens."
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

// ─── Interpretive layer helpers ────────────────────────────────────────────────

function interpretDist(data: SnapshotRow[]) {
  if (!data.length) return { headline:"—", body:"No data.", tone:"moderate" as const, consequence:"" }
  const n   = data.length
  const vh  = data.filter(r => r.composite_bucket === "Very High")
  const vhN = vh.length
  // OAL composition of Very High — revenue-anchored % is the signal
  // A Very High bucket dominated by revenue-anchored companies means
  // maximum narrative risk: shallowest anchor + worst composite
  const vhRev = vh.filter(r => r.oal_label === "Revenue").length
  const vhRevPct = vhN > 0 ? Math.round(vhRev / vhN * 100) : 0
  const vhFcf = vh.filter(r => r.oal_label === "FCF").length
  const vhFcfPct = vhN > 0 ? Math.round(vhFcf / vhN * 100) : 0
  // Very High as share of total — 20% is the structural baseline (quintile definition)
  // Deviations above 20% mean filters are concentrating risk; below means filtering it out
  const vhSharePct = Math.round(vhN / n * 100)
  // Improving trajectory within Very High — companies moving toward lower risk
  const vhImproving = vh.filter(r => (r.axis2_pct ?? 1) < 0.5).length
  const vhImprovingPct = vhN > 0 ? Math.round(vhImproving / vhN * 100) : 0

  if (vhRevPct >= 65) return { tone:"elevated" as const,
    headline:`${vhRevPct}% of Very High companies are revenue-anchored`,
    body:`The highest-risk bucket is dominated by companies whose valuations rest on the shallowest possible anchor. Revenue-anchored companies in Very High composite carry maximum narrative dependence — valuation is not supported by earnings, operating income, or cash flow.`,
    consequence:`The empirical median return for revenue-anchored companies is −16.7% over 12 months. This is not the bucket that produces false positives.` }

  if (vhRevPct >= 50) return { tone:"elevated" as const,
    headline:`${vhRevPct}% of Very High companies are revenue-anchored — ${vhFcfPct}% are FCF-positive`,
    body:`The Very High bucket is split: more than half are revenue-anchored companies with no demonstrated path to cash generation at current valuations. The ${vhFcfPct}% that are FCF-anchored in Very High carry valuation stretch as their primary risk, not anchor shallowness.`,
    consequence:`These are structurally different risk profiles within the same bucket. The OAL rung in the drilldown distinguishes them.` }

  if (vhImprovingPct >= 40) return { tone:"moderate" as const,
    headline:`${vhImprovingPct}% of Very High companies show improving operational trajectory`,
    body:`A meaningful share of the highest-risk bucket is moving in the right direction — their operational anchors are strengthening on a trailing basis. These companies carry elevated composite risk from valuation stretch, but the trajectory signal is constructive.`,
    consequence:`Improving trajectory within Very High is a potential early indicator of composite score improvement in subsequent months.` }

  return { tone:"moderate" as const,
    headline:`Very High bucket: ${vhRevPct}% revenue-anchored, ${vhFcfPct}% FCF-anchored`,
    body:`The composition of the highest-risk bucket reflects a mix of anchor depths. Revenue-anchored companies carry the weakest structural foundation; FCF-anchored names in Very High are primarily stretched on valuation, not anchor shallowness.`,
    consequence:`OAL rung is the primary differentiator within the Very High bucket — it distinguishes narrative risk from valuation stretch.` }
}

function interpretTraj(data: SnapshotRow[], tone: string) {
  const sc = data.filter(r => r.axis2_pct != null)
  if (!sc.length) return { headline:"Trajectory data unavailable", body:"", direction:"mixed" as const, consequence:"" }
  // The meaningful signal is NOT position (axis2 > 0.5 is always ~50% by construction)
  // It's the extremes: companies in the worst trajectory quartile (top 25%)
  // and the intersection of worst trajectory + worst composite (compound risk)
  const sevDet = sc.filter(r => (r.axis2_pct ?? 0) >= 0.75).length  // severe deterioration
  const sevDetPct = Math.round(sevDet / sc.length * 100)
  const vhSevDet = data.filter(r =>
    r.composite_bucket === "Very High" && (r.axis2_pct ?? 0) >= 0.75
  ).length
  const vhN = data.filter(r => r.composite_bucket === "Very High").length
  const vhSevDetPct = vhN > 0 ? Math.round(vhSevDet / vhN * 100) : 0
  // FCF-anchored companies with deteriorating trajectory — canary signal
  // These are structurally sound companies whose anchor is weakening
  const fcfDet = data.filter(r =>
    r.oal_label === "FCF" && (r.axis2_pct ?? 0) >= 0.6
  ).length
  const fcfN = data.filter(r => r.oal_label === "FCF").length
  const fcfDetPct = fcfN > 0 ? Math.round(fcfDet / fcfN * 100) : 0

  if (vhSevDetPct >= 60) return { direction:"deteriorating" as const,
    headline:`${vhSevDetPct}% of Very High companies are in severe trajectory deterioration`,
    body:`The majority of the highest-risk bucket is not just structurally fragile — their operational anchors are actively weakening. Severe deterioration (top quartile of Axis 2) combined with Very High composite is the most compound structural risk state the framework identifies.`,
    consequence: tone === "elevated"
      ? `Compound risk: elevated distribution and accelerating deterioration together. This is the escalation signal.`
      : `Trajectory is accelerating within the risk cluster even as the broader distribution is contained.` }

  if (fcfDetPct >= 20) return { direction:"deteriorating" as const,
    headline:`${fcfDetPct}% of FCF-anchored companies show deteriorating trajectory`,
    body:`A notable share of the deepest-anchored companies in the universe are showing trajectory weakening — their free cash flow generation is declining on a trailing basis. FCF deterioration is an early structural warning because it precedes OAL rung changes.`,
    consequence:`If trajectory deterioration persists, these companies may slip from FCF to Net Income anchoring in subsequent months, increasing their composite risk score.` }

  if (sevDetPct <= 18) return { direction:"improving" as const,
    headline:`Severe trajectory deterioration is below baseline — ${sevDetPct}% of universe`,
    body:`Fewer companies than the structural baseline are showing acute anchor weakening. The top quartile of Axis 2 — representing the most rapidly deteriorating operational profiles — is relatively unpopulated.`,
    consequence:`Below-baseline severe deterioration reduces the near-term compound risk signal. The constellation should show fewer gold pulse rings than typical.` }

  return { direction:"mixed" as const,
    headline:`${sevDetPct}% of universe in severe trajectory deterioration · ${vhSevDetPct}% of Very High`,
    body:`Severe anchor deterioration is distributed across the universe at roughly baseline levels. Within the Very High bucket, ${vhSevDetPct}% are in acute trajectory decline — the rest carry valuation stretch as their primary risk without active operational weakening.`,
    consequence:`The trajectory signal is most useful at the company level under these conditions. Scan the constellation for gold pulse rings — those companies are actively deteriorating.` }
}

// ─── Temporal bar ──────────────────────────────────────────────────────────────

function TemporalBar({ manifest }: { manifest: HistoryManifestRow[] }) {
  const st = useMemo(() => {
    if (!manifest.length) return { formLabel:"—", nextLabel:"—", days: null }
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
        `Snapshot · ${st.formLabel}`,
        `Next recalibration · ${st.nextLabel}`,
        st.days == null ? "—" : st.days === 0 ? "Recalibrating today" : `${st.days} days remaining`,
      ].map((t,i) => (
        <span key={i} style={s({ fontFamily:E.mono, fontSize:9.5, color: i===2&&near ? E.pos : E.muted })}>{t}</span>
      ))}
    </div>
  )
}

// ─── KPI strip ─────────────────────────────────────────────────────────────────

function KPIStrip({ stats, isPaid }: {
  stats: { veryHigh:number; vhRevPct:number; vhFcfPct:number; severeDet:number; fcfImproving:number; total:number; fcfAnchored:number }
  isPaid: boolean
}) {
  const kpis = [
    { label:"Very High Risk",        val:stats.veryHigh,      note:"Revenue-anchored: " + stats.vhRevPct + "% · FCF-anchored: " + stats.vhFcfPct + "%", color:E.neg,  paid:false },
    { label:"Severe Deterioration",  val:stats.severeDet,     note:"Top quartile Axis 2 · anchor actively weakening",  color:E.neg,  paid:false },
    { label:"FCF · Improving",       val:stats.fcfImproving,  note:"Deepest anchor + strengthening trajectory",        color:E.pos,  paid:false },
    { label:"FCF Anchored",          val:stats.fcfAnchored,   note:"Deepest demonstrated anchor · full universe",      color:E.pos,  paid:true  },
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

// ─── Interpretive layer ────────────────────────────────────────────────────────

function InterpretiveLayer({ data }: { data: SnapshotRow[] }) {
  const dist = useMemo(() => interpretDist(data), [data])
  const traj = useMemo(() => interpretTraj(data, dist.tone), [data, dist.tone])
  const toneColor: Record<string,string> = { elevated:E.neg, moderate:E.body }
  const dirColor: Record<string,string>  = { deteriorating:E.neg, improving:E.pos, mixed:E.body }
  const cards = [
    {
      ey:"Distribution · System State",
      color: toneColor[dist.tone] ?? E.body,
      head: dist.tone==="elevated" ? "Structural stress is broadly elevated"
          : "Structural risk is mixed",
      body: dist.body,
      consequence: dist.consequence,
    },
    {
      ey:"Trajectory · System State",
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
        Current Market Interpretation · Start here
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

// ─── Constellation map (canvas + SVG overlay) ──────────────────────────────────

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

const PAD = { t:36, r:16, b:56, l:56 }

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
      // Deterministic jitter from symbol hash — breaks vertical streaking
      // Jitter magnitude scales inversely with axis2 score:
      // low trajectory risk (left side) gets strong jitter to break columns
      // high trajectory risk (right side) is already dispersed — minimal jitter
      let hash = 0
      for (let i = 0; i < r.symbol.length; i++) hash = (hash * 31 + r.symbol.charCodeAt(i)) >>> 0
      const a2 = r.axis2_pct as number
      const jitterScale = 0.055 * (1 - a2) + 0.008  // 0.063 at left, 0.008 at right
      const jx = ((hash & 0xFF) / 255 - 0.5) * jitterScale
      const jy = (((hash >> 8) & 0xFF) / 255 - 0.5) * 0.022
      return {
        row: r,
        cx: PAD.l + Math.min(1, Math.max(0, a2 + jx)) * pw,
        cy: PAD.t + (1 - Math.min(1, Math.max(0, (r.axis1_pct as number) + jy))) * ph,
        r:  dotRadius(r.market_cap),
        color, rgb: hexRgb(color),
        pulse: deterioration(r),
        phase: ((hash >> 16) & 0xFF) / 255 * Math.PI * 2,
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

        // Pulse ring — trajectory deterioration only
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

      {/* SVG overlay — labels only, never clips dots */}
      <svg viewBox={`0 0 ${dims.w} ${dims.h}`} width={dims.w} height={dims.h}
        style={{ position:"absolute", top:0, left:0, pointerEvents:"none", overflow:"visible" }}>

        {/* Axis titles */}
        <text x={PAD.l + pw/2} y={dims.h - 6} textAnchor="middle"
          fontFamily={E.mono} fontSize={10} fill={E.muted} letterSpacing="0.16em">
          TRAJECTORY RISK →
        </text>
        <text x={14} y={PAD.t + ph/2} textAnchor="middle"
          fontFamily={E.mono} fontSize={10} fill={E.muted} letterSpacing="0.16em"
          transform={`rotate(-90,14,${PAD.t+ph/2})`}>
          ANCHOR RISK ↑
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

        {/* Quadrant labels — in padding zones, never overlap dots */}
        <text x={PAD.l} y={PAD.t-8} fontFamily={E.mono} fontSize={9} fill={E.pos} opacity={0.65}>
          Improving · Stretched
        </text>
        <text x={PAD.l+pw} y={PAD.t-8} textAnchor="end"
          fontFamily={E.mono} fontSize={9} fill={E.neg} opacity={0.85}>
          Most fragile ↗
        </text>
        <text x={PAD.l} y={PAD.t+ph+28} fontFamily={E.mono} fontSize={9} fill={E.pos} opacity={0.65}>
          Anchored · Improving
        </text>

        {/* Pulse legend — below plot in bottom padding */}
        <g transform={`translate(${PAD.l+pw}, ${PAD.t+ph+28})`}>
          <circle cx={-168} cy={0} r={4} fill={E.gold} opacity={0.9}/>
          <circle cx={-168} cy={0} r={10} fill="none" stroke={E.gold} strokeWidth={1} opacity={0.3}/>
          <text x={-158} y={4} fontFamily={E.mono} fontSize={9} fill={E.muted} textAnchor="start">
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
      minWidth:192, boxShadow:"0 4px 28px rgba(0,0,0,0.7)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
        <span style={{ fontFamily:E.sans, fontSize:15, fontWeight:800, color:E.text, letterSpacing:"-0.02em" }}>{row.symbol}</span>
        <span style={{ fontFamily:E.mono, fontSize:10, fontWeight:500, color, marginLeft:10 }}>{row.composite_bucket}</span>
      </div>
      {[
        ["OAL",       row.oal_label ?? "—"],
        ["Anchor",    fmtPct(row.axis1_pct)],
        ["Trajectory",fmtPct(row.axis2_pct)],
        ["Composite", fmtPct(row.composite_score)],
      ].map(([k,v]) => (
        <div key={k} style={{ display:"flex", justifyContent:"space-between", gap:16, marginBottom:3 }}>
          <span style={{ fontFamily:E.mono, fontSize:10, color:E.muted }}>{k}</span>
          <span style={{ fontFamily:E.mono, fontSize:10, color:E.body }}>{v}</span>
        </div>
      ))}
      {det > 0 && (
        <div style={{ marginTop:6, paddingTop:6, borderTop:`1px solid ${E.bdr}`,
          fontFamily:E.mono, fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase" as const, color:E.gold }}>
          ↓ Trajectory deteriorating
        </div>
      )}
    </div>
  )
}

// ─── Active risk cluster ────────────────────────────────────────────────────────

function ActiveRiskCluster({ data, onSelect }: { data:SnapshotRow[]; onSelect:(r:SnapshotRow)=>void }) {
  const top = useMemo(() =>
    [...data].filter(r=>r.composite_score!=null)
      .sort((a,b)=>(b.composite_score??0)-(a.composite_score??0)).slice(0,12), [data])
  return (
    <div style={s({ padding:"18px 24px", borderBottom:`1px solid ${E.bdr}` })}>
      <div style={s({ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 })}>
        <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.2em", textTransform:"uppercase", color:E.muted })}>
          Highest Structural Risk · Top {top.length} under active filters
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

// ─── Cohort grid ───────────────────────────────────────────────────────────────

function CohortGrid({ grid, isPaid }: { grid:CohortGrid; isPaid:boolean }) {
  const [metric, setMetric] = useState<CohortMetric>("median_return")
  // Two-axis model: use first panel only
  const panel = grid.panels[0]

  const fmtCell = (c:CohortGridCell) => {
    if (c.suppressed) return "—"
    const v = c[metric]; if (v==null) return "—"
    if (metric==="hit_rate") return `${(v*100).toFixed(1)}%`
    return `${v>=0?"+":""}${(v*100).toFixed(1)}%`
  }

  return (
    <div>
      {/* Metric switcher */}
      <div style={s({ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 })}>
        <div style={s({ display:"flex", flexWrap:"wrap", gap:"4px 12px" })}>
          {[
            { bg:"#4a1212", label:"Strong loss (<−12%)" },
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
                  Trajectory ↓ / Anchor →
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
                        title={`Median: ${fmtSigned(cell.median_return)} · Hit rate: ${fmt(cell.hit_rate)} · N=${cell.count}`}>
                        <div style={s({ height:54, display:"flex", flexDirection:"column",
                          alignItems:"center", justifyContent:"center",
                          background:returnHeatBg(cv,cell.suppressed),
                          border: strong?`2px solid rgba(255,255,255,0.32)`:`1px solid ${E.bdr}` })}>
                          <div style={s({ fontFamily:E.mono, fontSize:11, fontWeight:500, color:returnHeatText(cv,cell.suppressed) })}>
                            {fmtCell(cell)}
                          </div>
                          {skew!=="none" && metric==="mean_return" && (
                            <div style={s({ fontFamily:E.mono, fontSize:8.5, color:skew==="right"?E.pos:E.neg, marginTop:1 })}>
                              {skew==="right"?"▲ skewed":"▼ skewed"}
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
        Outlined cells = |return| &gt; 15% — strongest historical signal zones. Interest-bearing companies only (~84% of universe). Historical analysis — does not predict individual returns.
      </p>
    </div>
  )
}

// ─── Company drilldown ─────────────────────────────────────────────────────────

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
        : (company.axis2_pct??0) >= 0.4 ? "Operational trajectory is mixed — no clear directional signal."
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
          <div style={s({ fontFamily:E.mono, fontSize:10, color:E.muted, marginTop:2 })}>{company.oal_label ?? "—"}</div>
          {det > 0 && (
            <div style={s({ marginTop:6, fontFamily:E.mono, fontSize:9, letterSpacing:"0.12em",
              textTransform:"uppercase", color:E.gold })}>↓ Trajectory deteriorating</div>
          )}
        </div>
        <div style={s({ textAlign:"right" })}>
          <div style={s({ fontFamily:E.sans, fontSize:14, fontWeight:700, color:bucketColor(company.composite_bucket) })}>
            {company.composite_bucket}
          </div>
          <div style={s({ fontFamily:E.mono, fontSize:9.5, color:E.muted })}>{fmtPct(company.composite_score)} pct · higher = more risk</div>
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
                <span style={s({ fontFamily:E.mono, fontSize:9.5, fontWeight:500, color:bucketColor(bucket) })}>{bucket} · {fmtPct(pct)}</span>
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
            Anchor {a1} · Trajectory {a2} · 12-month forward horizon
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
                {skewDir(cohortCell)==="right" && ` Mean is materially higher (${fmtSigned(cohortCell.mean_return)}) — right-skewed by a small number of large winners.`}
                {skewDir(cohortCell)==="left"  && ` Mean is materially lower (${fmtSigned(cohortCell.mean_return)}) — left-skewed by outsized losses.`}
              </p>
            </>
          ) : (
            <p style={s({ fontFamily:E.mono, fontSize:10.5, color:E.muted })}>
              {cohortCell?.suppressed ? "Cell suppressed — insufficient observations." : "No cohort match found for this structural profile."}
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
            background:E.gold, color:"#060504", textDecoration:"none", display:"inline-block" })}>
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

// ─── Snapshot table ────────────────────────────────────────────────────────────

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
              {[
                { h:"Symbol",       sub:""                    },
                { h:"OAL",          sub:"anchor depth"        },
                { h:"Anchor Risk",  sub:"↑ higher = worse"   },
                { h:"Trajectory",   sub:"↑ higher = worse"   },
                { h:"Composite",    sub:"overall risk"        },
              ].map(({ h, sub }) => (
                <th key={h} style={s({ fontFamily:E.mono, fontSize:9, letterSpacing:"0.14em",
                  textTransform:"uppercase", color:E.muted, padding:"8px 10px", textAlign:"left", fontWeight:400 })}>
                  <div>{h}</div>
                  {sub && <div style={s({ fontSize:8, letterSpacing:"0.08em", color:E.dim, marginTop:1, textTransform:"none", fontWeight:400 })}>{sub}</div>}
                </th>
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
                <td style={s({ fontFamily:E.mono, fontSize:11, padding:"7px 10px",
                  color: row.oal_label==="FCF"?E.pos : row.oal_label==="Revenue"?E.neg : E.body })}>
                  {row.oal_label}
                </td>
                <td style={s({ fontFamily:E.mono, fontSize:11, padding:"7px 10px",
                  color: (row.axis1_pct??0)>=0.8?E.neg:(row.axis1_pct??0)>=0.6?"#c47850":(row.axis1_pct??0)<0.3?E.pos:E.body })}>
                  {fmtPct(row.axis1_pct)}
                </td>
                <td style={s({ fontFamily:E.mono, fontSize:11, padding:"7px 10px",
                  color: (row.axis2_pct??0)>=0.8?E.neg:(row.axis2_pct??0)>=0.6?"#c47850":(row.axis2_pct??0)<0.3?E.pos:E.body })}>
                  {fmtPct(row.axis2_pct)}
                </td>
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

// ─── Anchor structure tab ──────────────────────────────────────────────────────

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
            narrative dependence — and structural risk.
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
                    row.oal_label==="FCF"?"#5A9870":
                    row.oal_label==="Net Income"?"#4A7AA8":
                    row.oal_label==="EBIT"?"#C5A24A":
                    row.oal_label==="Revenue"?"#B85C4A": E.muted
                  } opacity={0.85}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={s({ padding:"10px 20px", borderTop:`1px solid ${E.bdr}` })}>
          <p style={s({ fontFamily:E.mono, fontSize:9.5, color:E.muted })}>
            FCF vs Revenue median return spread: +26.6pp · Held across all regimes tested
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
                {["Anchor","Companies","Median Anchor Risk","Median Composite Risk"].map(h => (
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
                  <td style={s({ fontFamily:E.mono, fontSize:11, color:E.body, padding:"7px 8px" })}>{row.median_axis1==null?"—":fmtPct(row.median_axis1)+"th"}</td>
                  <td style={s({ fontFamily:E.mono, fontSize:11, color:E.body, padding:"7px 8px" })}>{row.median_composite==null?"—":fmtPct(row.median_composite)+"th"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── History tab ───────────────────────────────────────────────────────────────

function HistoryTab({ manifest }: { manifest:HistoryManifestRow[] }) {
  return (
    <div style={s({ border:`1px solid ${E.bdr}`, background:E.bg2 })}>
      <div style={s({ padding:"16px 20px", borderBottom:`1px solid ${E.bdr}` })}>
        <p style={s({ fontFamily:E.mono, fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase",
          color:E.muted, marginBottom:4 })}>Historical Coverage</p>
        <p style={s({ fontFamily:E.sans, fontSize:12.5, color:E.body, lineHeight:1.65 })}>
          Archived monthly structural snapshots. Each month is a formation state from which
          12-month forward returns were measured — the empirical basis of the cohort grids.
        </p>
      </div>
      <div style={s({ overflowX:"auto" })}>
        <table style={s({ width:"100%", borderCollapse:"collapse" })}>
          <thead>
            <tr style={s({ background:E.bg3, borderBottom:`1px solid ${E.bdr}` })}>
              {["Formation Month","Companies Scored","OAL Coverage","Status"].map(h => (
                <th key={h} style={s({ fontFamily:E.mono, fontSize:9, letterSpacing:"0.14em",
                  textTransform:"uppercase", color:E.muted, padding:"8px 14px", textAlign:"left", fontWeight:400 })}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {manifest.map(row => (
              <tr key={row.month} style={s({ borderBottom:`1px solid rgba(255,255,255,0.025)` })}>
                <td style={s({ fontFamily:E.mono, fontSize:11.5, fontWeight:500, color:E.text, padding:"7px 14px" })}>{row.month}</td>
                <td style={s({ fontFamily:E.mono, fontSize:11, color:E.body, padding:"7px 14px" })}>{row.has_oal_scores===false?"—":fmtNum(row.oal_scores_rows)}</td>
                <td style={s({ fontFamily:E.mono, fontSize:11, color:E.body, padding:"7px 14px" })}>{row.has_oal_summary===false?"—":fmtNum(row.oal_summary_rows)}</td>
                <td style={s({ fontFamily:E.mono, fontSize:11, padding:"7px 14px",
                  color: row.has_structural_snapshot===false ? E.neg : E.pos })}>
                  {row.has_structural_snapshot===false ? "Missing" : "Complete"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

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

  const stats = useMemo(() => {
    const vh = filtered.filter(r => r.composite_bucket==="Very High")
    const vhN = vh.length
    const vhRev = vh.filter(r => r.oal_label==="Revenue").length
    const vhFcf = vh.filter(r => r.oal_label==="FCF").length
    return {
      veryHigh:     vhN,
      vhRevPct:     vhN > 0 ? Math.round(vhRev/vhN*100) : 0,
      vhFcfPct:     vhN > 0 ? Math.round(vhFcf/vhN*100) : 0,
      severeDet:    filtered.filter(r => (r.axis2_pct??0) >= 0.75).length,
      fcfImproving: filtered.filter(r => r.oal_label==="FCF" && (r.axis2_pct??1) < 0.4).length,
      total:        filtered.length,
      fcfAnchored:  filtered.filter(r => r.oal_label==="FCF").length,
    }
  }, [filtered])

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
          <span style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.18em", textTransform:"uppercase", color:E.muted })}>Live · Mar 2026</span>
          {!isPaid && (
            <a href="/platform/subscribe" style={s({ fontFamily:E.sans, fontSize:9.5, fontWeight:700,
              letterSpacing:"0.08em", textTransform:"uppercase", padding:"5px 12px",
              background:E.gold, color:"#060504", textDecoration:"none", marginLeft:10 })}>Upgrade</a>
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

          {/* ── MARKET MAP ── */}
          {tab==="market-map" && (
            <div>
              <InterpretiveLayer data={filtered}/>
              <div style={s({ padding:"20px 24px", borderBottom:`1px solid ${E.bdr}` })}>
                <div style={s({ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 })}>
                  <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.2em", textTransform:"uppercase", color:E.muted })}>
                    Structural Constellation
                  </p>
                  <span style={s({ fontFamily:E.mono, fontSize:9, color:E.dim })}>
                    X = Trajectory Risk · Y = Anchor Risk · Color = Composite bucket
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
                    · Dot size = market cap · Click dot to inspect
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
                      {fmtNum(cohortGrid.metadata.observation_count)} obs · {cohortGrid.metadata.horizon_months}M forward
                    </span>
                  </div>
                  <p style={s({ fontFamily:E.sans, fontSize:12, color:E.body, marginBottom:14, lineHeight:1.65 })}>
                    How companies in each structural zone have historically performed. The bottom-right cells — high anchor risk, high trajectory risk — carry the strongest signal.
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
                        The full cohort grid — {fmtNum(cohortGrid.metadata.observation_count)} observations across {cohortGrid.metadata.horizon_months}-month forward horizons — is available with a paid subscription.
                      </p>
                      <a href="/platform/subscribe" style={s({ fontFamily:E.sans, fontSize:11, fontWeight:700,
                        letterSpacing:"0.08em", textTransform:"uppercase", padding:"10px 20px",
                        background:E.gold, color:"#060504", textDecoration:"none", display:"inline-block" })}>
                        Subscribe to Access
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── SNAPSHOT ── */}
          {tab==="snapshot" && (
            <div style={s({ padding:"20px 24px" })}>
              <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.2em", textTransform:"uppercase", color:E.muted, marginBottom:6 })}>Current Snapshot</p>
              <p style={s({ fontFamily:E.sans, fontSize:12, color:E.body, marginBottom:14, lineHeight:1.65 })}>
                Full structural profile for each company under active filters. Click any row to inspect.
              </p>
              <SnapshotTable data={filtered} onSelect={setSelected}/>
            </div>
          )}

          {/* ── ANCHOR STRUCTURE ── */}
          {tab==="anchors" && (
            <div style={s({ padding:"20px 24px" })}>
              <p style={s({ fontFamily:E.mono, fontSize:8.5, letterSpacing:"0.2em", textTransform:"uppercase", color:E.muted, marginBottom:6 })}>Anchor Structure</p>
              <p style={s({ fontFamily:E.sans, fontSize:12, color:E.body, marginBottom:14, lineHeight:1.65 })}>
                Distribution across levels of demonstrated operational output. Anchor depth is the most durable signal in the framework — the FCF–Revenue spread of +26.6pp held across all regimes tested.
              </p>
              <AnchorTab oalSummary={oalSummary}/>
            </div>
          )}

          {/* ── HISTORY ── */}
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
              The Capital Steward, LLC · thecapitalsteward.com<br/>
              © 2026 The Capital Steward, LLC. For informational purposes only. Not investment advice.
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