'use client'

// File goes to: app/platform-beta/page.tsx
// Protected by middleware — unauthenticated users redirected to /platform
//
// TIER DETECTION:
//   Free:  useUser() → isSignedIn=true, publicMetadata.subscription != 'active'
//   Paid:  useUser() → isSignedIn=true, publicMetadata.subscription === 'active'
//
// DATA: reads from /public/data/*.json — no API routes needed

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Search, Filter, ChevronDown } from "lucide-react"
import {
  ResponsiveContainer, ScatterChart, Scatter, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar,
} from "recharts"

// ─── Design tokens ────────────────────────────────────────────────────────────

const E = {
  bg:   "#0E0D0B", bg2:  "#131210", bg3:  "#181614",
  bdr:  "#272420", bdr2: "#33302A",
  text: "#EDE9E0", body: "#A89E8E", muted: "#554E44", dim: "#3A3530",
  gold: "#C5A24A", gatm: "rgba(197,162,74,0.04)",
  pos:  "#5A9870", posSoft: "#3E6B4F",
  neg:  "#B85C4A", negSoft: "#A05050",
  blue: "#4A7AA8",
  mono: "'IBM Plex Mono','Courier New',monospace",
  sans: "'Syne',system-ui,sans-serif",
  serif: "'Instrument Serif',Georgia,serif",
}

const s = (x: object) => x as React.CSSProperties

// ─── Types ────────────────────────────────────────────────────────────────────

type SnapshotRow = {
  symbol: string
  oal_label: string | null
  risk_bucket_within_oal: string | null
  axis1_pct: number | null
  axis2_pct: number | null
  axis2_plot?: number | null
  axis3_pct: number | null
  composite_score: number | null
  composite_bucket: string | null
}

type OALSummaryRow = {
  oal_label: string
  n: number
  median_axis1: number | null
  median_axis3: number | null
  median_composite: number | null
}

type LiquiditySummaryRow = { bucket: string; count: number }

type HistoryManifestRow = {
  month: string
  oal_scores_rows: number | null
  oal_summary_rows: number | null
  structural_rows: number | null
  has_oal_scores?: boolean
  has_oal_summary?: boolean
  has_structural_snapshot?: boolean
}

type CohortGridCell = {
  count: number
  mean_return: number | null
  median_return: number | null
  hit_rate: number | null
  display_value: number | null
  suppressed: boolean
  axis1_bucket: string
  axis2_bucket: string
  axis3_bucket: string
}

type CohortGridRow = { axis2_bucket: string; cells: CohortGridCell[] }
type CohortGridPanel = { panel: string; rows: CohortGridRow[] }

type CohortGridMetadata = {
  horizon_months: number
  x_axis_labels: string[]
  y_axis_labels: string[]
  panels: string[]
  formation_month_min: string | null
  formation_month_max: string | null
  observation_count: number
  notes: string[]
  min_count_for_display: number
}

type HistoricalCohortGridPayload = {
  metadata: CohortGridMetadata
  panels: CohortGridPanel[]
}

type CohortMetric = "median_return" | "mean_return" | "hit_rate"

// ─── Constants ────────────────────────────────────────────────────────────────

const BUCKET_ORDER = ["Very Low", "Low", "Moderate", "High", "Very High"]
const OAL_ORDER = ["FCF", "Net Income", "EBIT", "Revenue", "Non-viable"]
const AXIS3_ORDER = ["Very High", "High", "Moderate", "Low", "Very Low"] as const
const TABS = [
  { id: "market-map",  label: "Market Map" },
  { id: "snapshot",    label: "Snapshot" },
  { id: "oal",         label: "OAL Structure" },
  { id: "financing",   label: "Financing Context" },
  { id: "history",     label: "History" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: number | null, decimals = 1): string {
  if (v == null || isNaN(v)) return "—"
  return `${(v * 100).toFixed(decimals)}%`
}
function fmtSigned(v: number | null): string {
  if (v == null || isNaN(v)) return "—"
  const p = (v * 100).toFixed(1)
  return v >= 0 ? `+${p}%` : `${p}%`
}
function fmtPct(v: number | null): string {
  if (v == null || isNaN(v)) return "—"
  return `${Math.round(v * 100)}th pct`
}
function fmtNum(v: number | null): string {
  if (v == null || isNaN(v)) return "—"
  return v.toLocaleString()
}
function pctToBucket(pct: number | null): string {
  if (pct == null) return "—"
  if (pct < 0.2) return "Very Low"
  if (pct < 0.4) return "Low"
  if (pct < 0.6) return "Moderate"
  if (pct < 0.8) return "High"
  return "Very High"
}
function axis3Panel(axis3_pct: number | null, panels?: string[]): string {
  const v = axis3_pct ?? 0.5
  if (panels && panels.length === 5) {
    if (v < 0.20) return panels[0]
    if (v < 0.40) return panels[1]
    if (v < 0.60) return panels[2]
    if (v < 0.80) return panels[3]
    return panels[4]
  }
  if (v < 0.20) return "Very Low"
  if (v < 0.40) return "Low"
  if (v < 0.60) return "Moderate"
  if (v < 0.80) return "High"
  return "Very High"
}
function bucketColor(bucket: string | null | undefined): string {
  const m: Record<string, string> = {
    "Very Low": E.pos, "Low": E.posSoft,
    "Moderate": E.dim, "High": E.negSoft, "Very High": E.neg,
  }
  return m[bucket ?? ""] ?? E.muted
}
function returnHeatBg(v: number | null, suppressed: boolean): string {
  if (suppressed || v == null) return E.bg3
  if (v <= -0.12) return "#4a1212"
  if (v <= -0.03) return "#3a1e12"
  if (v < 0.03)   return "#1e1c18"
  if (v < 0.12)   return "#122a1e"
  return "#0e2818"
}
function returnHeatText(v: number | null, suppressed: boolean): string {
  if (suppressed || v == null) return E.muted
  if (v <= -0.12) return "#e8806e"
  if (v <= -0.03) return "#c47850"
  if (v < 0.03)   return E.body
  if (v < 0.12)   return "#7cc89d"
  return E.pos
}
function skewSignal(cell: CohortGridCell): "right" | "left" | "none" {
  if (!cell.mean_return || !cell.median_return || cell.suppressed) return "none"
  const diff = cell.mean_return - cell.median_return
  if (diff > 0.10) return "right"
  if (diff < -0.10) return "left"
  return "none"
}
function findCohortCell(company: SnapshotRow, cohortGrid: HistoricalCohortGridPayload | null): CohortGridCell | null {
  if (!cohortGrid) return null
  const panels = cohortGrid.metadata.panels
  const panel = axis3Panel(company.axis3_pct, panels)
  const a1 = pctToBucket(company.axis1_pct)
  const a2 = pctToBucket(company.axis2_pct)
  const matchedPanel = cohortGrid.panels.find(p => p.panel === panel)
  if (!matchedPanel) return null
  const matchedRow = matchedPanel.rows.find(r => r.axis2_bucket === a2)
  if (!matchedRow) return null
  return matchedRow.cells.find(c => c.axis1_bucket === a1) ?? null
}
function narrateCompany(c: SnapshotRow) {
  const a1 = c.axis1_pct ?? 0.5
  const a2 = c.axis2_pct ?? 0.5
  const a3 = c.axis3_pct ?? 0.5
  const bucket = c.composite_bucket ?? "Moderate"
  const anchorRead = a1 >= 0.8 ? "severely elevated valuation relative to its operational anchor"
    : a1 >= 0.6 ? "elevated valuation relative to its operational anchor"
    : a1 >= 0.4 ? "moderate valuation stretch relative to its operational anchor"
    : "valuation that is well-supported by its operational anchor"
  const trajectoryRead = a2 >= 0.8 ? "rapidly deteriorating operational trajectory"
    : a2 >= 0.6 ? "deteriorating operational trajectory"
    : a2 >= 0.4 ? "mixed operational trajectory"
    : "improving operational trajectory"
  const drivers: string[] = []
  if (a1 >= 0.6) drivers.push("valuation stretch")
  if (a2 >= 0.6) drivers.push("deteriorating trajectory")
  if (a3 >= 0.6) drivers.push("financing strain")
  const driverStr = drivers.length > 0 ? `driven by ${drivers.join(" and ")}` : "with limited single-axis dominance"
  const headerRead = `${bucket} structural risk ${driverStr}.`
  const trajectoryProfile = a2 >= 0.8 && a1 >= 0.8
    ? "Trajectory is deteriorating while valuation is already highly stretched — an escalation profile. The narrative bridge is lengthening as the operational anchor weakens."
    : a2 >= 0.6 && a1 >= 0.6
    ? "Trajectory is deteriorating within an elevated risk profile. Structural pressure is accumulating on both the valuation and operational dimensions."
    : a2 >= 0.6
    ? "Trajectory is deteriorating. The operational anchor is weakening on a trailing basis, increasing the narrative dependence of the current valuation."
    : a2 < 0.4
    ? "Trajectory is improving. The operational anchor is strengthening on a trailing basis, which shortens the narrative bridge over time."
    : "Trajectory is mixed. No dominant directional bias is present on the operational anchor."
  const takeaway = bucket === "Very High"
    ? `This is a high structural risk profile. Valuation depends on ${anchorRead}, the company shows ${trajectoryRead}. Historical outcomes for similar structural profiles are unfavorable at the median.`
    : bucket === "High"
    ? `This is an elevated structural risk profile characterized by ${anchorRead} and ${trajectoryRead}. The combination warrants scrutiny before any capital commitment.`
    : bucket === "Moderate"
    ? `This profile shows ${anchorRead} with ${trajectoryRead}. Structural risk is present but not dominant. Company-level context matters here.`
    : `This profile shows ${anchorRead} with ${trajectoryRead}. Structural conditions are currently favorable relative to the broader universe.`
  return { headerRead, trajectoryProfile, takeaway }
}

// ─── Interpretive layer ───────────────────────────────────────────────────────

function interpretDistribution(data: SnapshotRow[]) {
  if (!data.length) return { headline: "—", body: "No data.", tone: "moderate" as const }
  const vhPct = data.filter(r => r.composite_bucket === "Very High").length / data.length
  const elevPct = data.filter(r => r.composite_bucket === "Very High" || r.composite_bucket === "High").length / data.length
  const resilPct = data.filter(r => r.composite_bucket === "Very Low" || r.composite_bucket === "Low").length / data.length
  if (vhPct >= 0.25) return {
    headline: `${Math.round(vhPct * 100)}% of the filtered universe is in the Very High composite bucket`,
    body: `An unusually high proportion of companies currently carry maximum structural risk. ${Math.round(elevPct * 100)}% are in the High or Very High bucket combined — structural fragility is broadly distributed, not isolated.`,
    consequence: `When fragility is this broadly distributed, sector or factor diversification provides limited structural protection.`,
    tone: "elevated" as const,
  }
  if (vhPct >= 0.15) return {
    headline: `${Math.round(vhPct * 100)}% of the filtered universe is in the Very High composite bucket`,
    body: `Structural risk is present but not dominant. ${Math.round(elevPct * 100)}% carry elevated composite risk, while ${Math.round(resilPct * 100)}% sit in the lower two buckets.`,
    consequence: `The distribution is mixed — elevated names warrant closer scrutiny, but lower-risk companies remain available within the same universe.`,
    tone: "moderate" as const,
  }
  return {
    headline: `${Math.round(vhPct * 100)}% of the filtered universe is in the Very High composite bucket`,
    body: `Structural risk is currently contained. The majority of companies are anchored at lower composite risk levels — ${Math.round(resilPct * 100)}% sit in the Very Low or Low bucket.`,
    consequence: `A contained distribution does not eliminate risk within individual names — company-level scrutiny remains warranted for any elevated name.`,
    tone: "subdued" as const,
  }
}

function interpretTrajectory(data: SnapshotRow[], tone: "elevated" | "moderate" | "subdued") {
  if (!data.length) return { headline: "—", body: "No data.", direction: "mixed" as const }
  const scorable = data.filter(r => r.axis2_pct != null)
  if (!scorable.length) return { headline: "Trajectory data unavailable", body: "", direction: "mixed" as const }
  const detPct = (scorable.filter(r => (r.axis2_pct ?? 0) > 0.5).length / scorable.length) * 100
  const impPct = (scorable.filter(r => (r.axis2_pct ?? 0) <= 0.5).length / scorable.length) * 100
  if (detPct >= 60) {
    const regime = detPct >= 60 && tone === "elevated" ? "escalation" : "accumulation"
    return {
      headline: `${Math.round(detPct)}% of scored companies show deteriorating operational trajectory`,
      body: `The majority of the filtered universe is in the upper half of Axis 2 — meaning their operational anchor metrics are weakening on a trailing basis.`,
      consequence: regime === "escalation"
        ? `Combined with elevated distribution: an escalation signal. Structural risk is both broadly present and actively accumulating.`
        : `Trajectory is deteriorating even in a contained distribution — structural risk is accumulating quietly. Early-stage accumulation is harder to see.`,
      direction: "deteriorating" as const,
    }
  }
  if (impPct >= 60) return {
    headline: `${Math.round(impPct)}% of scored companies show improving operational trajectory`,
    body: `The majority of the filtered universe is in the lower half of Axis 2 — meaning their operational anchor metrics are strengthening on a trailing basis.`,
    consequence: `A universe tilted toward improving trajectory carries lower structural risk over time, all else equal.`,
    direction: "improving" as const,
  }
  return {
    headline: `Trajectory is mixed — ${Math.round(detPct)}% deteriorating, ${Math.round(impPct)}% improving`,
    body: `The filtered universe is currently split between companies whose operational anchors are strengthening and those where they are weakening. No dominant directional bias is present.`,
    consequence: `Company-level analysis is more informative than aggregate positioning in a mixed trajectory environment.`,
    direction: "mixed" as const,
  }
}

// ─── Temporal bar ─────────────────────────────────────────────────────────────

function TemporalBar({ manifest }: { manifest: HistoryManifestRow[] }) {
  const state = useMemo(() => {
    if (!manifest.length) return { formationLabel: "—", nextLabel: "—", daysRemaining: null }
    const sorted = [...manifest].sort((a, b) => b.month.localeCompare(a.month))
    const latest = sorted[0].month
    const [year, month] = latest.split("-").map(Number)
    const nextRefresh = new Date(year, month, 1)
    const now = new Date()
    const daysRemaining = Math.max(0, Math.ceil((nextRefresh.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    return {
      formationLabel: new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      nextLabel: nextRefresh.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      daysRemaining,
    }
  }, [manifest])
  const approaching = state.daysRemaining != null && state.daysRemaining <= 7
  return (
    <div style={s({ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 20px", padding: "8px 28px", borderBottom: `1px solid ${E.bdr}`, background: E.bg2 })}>
      <span style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>
        Snapshot anchored to <strong style={s({ color: E.body })}>{state.formationLabel}</strong>
      </span>
      <span style={s({ color: E.bdr2, fontFamily: E.mono, fontSize: 9.5 })}>·</span>
      <span style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>
        Next recalibration <strong style={s({ color: E.body })}>{state.nextLabel}</strong>
      </span>
      <span style={s({ color: E.bdr2, fontFamily: E.mono, fontSize: 9.5 })}>·</span>
      <span style={s({ fontFamily: E.mono, fontSize: 9.5, color: approaching ? E.pos : E.muted })}>
        {state.daysRemaining == null ? "—" : state.daysRemaining === 0 ? "Recalibrating today" : `${state.daysRemaining} days remaining`}
      </span>
    </div>
  )
}

// ─── KPI strip ────────────────────────────────────────────────────────────────

function KPIStrip({ stats, isPaid }: {
  stats: { veryHigh: number; financing: number; total: number; fcfAnchored: number }
  isPaid: boolean
}) {
  const kpis = [
    { label: "Structural Stress",     val: stats.veryHigh,    note: "Very High composite bucket",      color: E.neg,  paid: false },
    { label: "Financing Stress",      val: stats.financing,   note: "Axis 3 ≥ 80th percentile",        color: E.text, paid: false },
    { label: "Active Universe",       val: stats.total,       note: "Under active filters",             color: E.text, paid: false },
    { label: "FCF Anchored",          val: stats.fcfAnchored, note: "Deepest operational anchor",       color: E.pos,  paid: true  },
  ]
  return (
    <div style={s({ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: `1px solid ${E.bdr}` })}>
      {kpis.map(({ label, val, note, color, paid }, i) => {
        const locked = paid && !isPaid
        return (
          <div key={label} style={s({ padding: "18px 22px", borderRight: i < 3 ? `1px solid ${E.bdr}` : "none", position: "relative" })}>
            <div style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted, marginBottom: 6 })}>{label}</div>
            {locked ? (
              <div style={s({ display: "flex", alignItems: "center", gap: 8 })}>
                <Lock size={14} style={{ color: E.muted }} />
                <span style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.muted, letterSpacing: "0.08em" })}>Paid subscribers</span>
              </div>
            ) : (
              <div style={s({ fontFamily: E.mono, fontSize: 26, fontWeight: 500, color, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 4 })}>
                {fmtNum(val)}
              </div>
            )}
            <div style={s({ fontFamily: E.mono, fontSize: 8.5, color: E.dim, marginTop: locked ? 6 : 0 })}>{note}</div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Interpretive Layer component ─────────────────────────────────────────────

function InterpretiveLayer({ data }: { data: SnapshotRow[] }) {
  const dist = useMemo(() => interpretDistribution(data), [data])
  const traj = useMemo(() => interpretTrajectory(data, dist.tone), [data, dist.tone])
  const toneColor = { elevated: E.neg, moderate: E.body, subdued: E.pos }
  const dirColor = { deteriorating: E.neg, improving: E.pos, mixed: E.body }
  return (
    <div style={s({ padding: "20px 24px", borderBottom: `1px solid ${E.bdr}`, background: E.gatm })}>
      <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.22em", textTransform: "uppercase", color: E.gold, marginBottom: 12 })}>
        Current Market Interpretation · Start here
      </p>
      <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 })}>
        {[
          { label: "Distribution", color: toneColor[dist.tone], headline: dist.tone === "elevated" ? "Risk is broadly elevated" : dist.tone === "subdued" ? "Risk is currently contained" : "Risk is present but mixed", body: `${dist.headline}. ${dist.body}`, consequence: (dist as any).consequence },
          { label: "Trajectory", color: dirColor[traj.direction], headline: traj.direction === "deteriorating" ? "Universe deteriorating in aggregate" : traj.direction === "improving" ? "Universe improving in aggregate" : "Trajectory is mixed", body: traj.body, consequence: (traj as any).consequence },
        ].map(({ label, color, headline, body, consequence }) => (
          <div key={label} style={s({ border: `1px solid ${E.bdr}`, background: E.bg2, padding: "14px" })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 })}>
              <span style={s({ fontFamily: E.mono, fontSize: 8px, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted })}>{label}</span>
              <span style={s({ fontFamily: E.mono, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: E.pos, background: "rgba(90,152,112,0.08)", padding: "1px 6px" })}>System State</span>
            </div>
            <div style={s({ fontFamily: E.sans, fontSize: 12, fontWeight: 700, color, marginBottom: 6, lineHeight: 1.2 })}>{headline}</div>
            <div style={s({ fontFamily: E.sans, fontSize: 12, lineHeight: 1.7, color: E.body, marginBottom: consequence ? 10 : 0 })}>{body}</div>
            {consequence && <div style={s({ fontFamily: E.sans, fontSize: 11.5, lineHeight: 1.65, color: E.muted, paddingTop: 8, borderTop: `1px solid ${E.bdr}` })}>{consequence}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Scatter Map ──────────────────────────────────────────────────────────────

const VB_W = 1000; const VB_H = 560
const VB_PAD = { top: 24, right: 12, bottom: 32, left: 44 }
const VB_PLOT_W = VB_W - VB_PAD.left - VB_PAD.right
const VB_PLOT_H = VB_H - VB_PAD.top - VB_PAD.bottom

function ScatterMap({ data, onSelect }: { data: SnapshotRow[]; onSelect: (r: SnapshotRow) => void }) {
  const points = useMemo(() => data
    .filter(r => r.axis1_pct != null && r.axis2_pct != null)
    .map(r => ({
      symbol: r.symbol,
      cx: VB_PAD.left + Math.min(1, Math.max(0, (r.axis2_pct as number) + ((r.axis3_pct ?? 0.5) - 0.5) * 0.06)) * VB_PLOT_W,
      cy: VB_PAD.top + (1 - (r.axis1_pct as number)) * VB_PLOT_H,
      color: bucketColor(r.composite_bucket),
      bucket: r.composite_bucket,
      row: r,
    })), [data])

  const gridTicks = [0, 0.25, 0.5, 0.75, 1.0]
  return (
    <div>
      <div style={s({ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginBottom: 12 })}>
        {["Very Low", "Low", "Moderate", "High", "Very High"].map(b => (
          <div key={b} style={s({ display: "flex", alignItems: "center", gap: 6 })}>
            <div style={s({ width: 8, height: 8, borderRadius: "50%", background: bucketColor(b), flexShrink: 0 })} />
            <span style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>{b}</span>
          </div>
        ))}
        <span style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.dim, marginLeft: 8 })}>Click any dot to open drilldown</span>
      </div>
      <div style={s({ border: `1px solid ${E.bdr}`, background: E.bg2, position: "relative" })}>
        <div style={s({ position: "absolute", top: 8, left: VB_PAD.left + 4, fontFamily: E.mono, fontSize: 9, color: E.pos, pointerEvents: "none" })}>Improving · Stretched</div>
        <div style={s({ position: "absolute", top: 8, right: 12, fontFamily: E.mono, fontSize: 9, color: E.neg, pointerEvents: "none" })}>Most fragile ↗</div>
        <div style={s({ position: "absolute", bottom: 36, left: VB_PAD.left + 4, fontFamily: E.mono, fontSize: 9, color: E.pos, pointerEvents: "none" })}>Improving · Supported</div>
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={s({ width: "100%", display: "block" })}>
          {gridTicks.map(t => (
            <g key={t}>
              <line x1={VB_PAD.left + t * VB_PLOT_W} y1={VB_PAD.top} x2={VB_PAD.left + t * VB_PLOT_W} y2={VB_PAD.top + VB_PLOT_H} stroke={E.bdr} strokeWidth={0.5} strokeDasharray={t === 0.5 ? "none" : "2 4"} />
              <line x1={VB_PAD.left} y1={VB_PAD.top + (1 - t) * VB_PLOT_H} x2={VB_PAD.left + VB_PLOT_W} y2={VB_PAD.top + (1 - t) * VB_PLOT_H} stroke={E.bdr} strokeWidth={0.5} strokeDasharray={t === 0.5 ? "none" : "2 4"} />
              <text x={VB_PAD.left + t * VB_PLOT_W} y={VB_H - 6} textAnchor="middle" fontFamily={E.mono} fontSize={11} fill={E.muted}>{t.toFixed(2)}</text>
              <text x={VB_PAD.left - 6} y={VB_PAD.top + (1 - t) * VB_PLOT_H + 4} textAnchor="end" fontFamily={E.mono} fontSize={11} fill={E.muted}>{t.toFixed(2)}</text>
            </g>
          ))}
          <rect x={VB_PAD.left} y={VB_PAD.top} width={VB_PLOT_W} height={VB_PLOT_H} fill="none" stroke={E.bdr2} strokeWidth={1} />
          <text x={VB_PAD.left + VB_PLOT_W / 2} y={VB_H - 2} textAnchor="middle" fontFamily={E.mono} fontSize={12} fill={E.muted}>Trajectory Risk →</text>
          <text x={14} y={VB_PAD.top + VB_PLOT_H / 2} textAnchor="middle" fontFamily={E.mono} fontSize={12} fill={E.muted} transform={`rotate(-90,14,${VB_PAD.top + VB_PLOT_H / 2})`}>Anchor Risk ↑</text>
          <defs><clipPath id="scat-clip"><rect x={VB_PAD.left} y={VB_PAD.top} width={VB_PLOT_W} height={VB_PLOT_H} /></clipPath></defs>
          <g clipPath="url(#scat-clip)">
            {points.map(pt => (
              <circle
                key={pt.symbol} cx={pt.cx} cy={pt.cy} r={3.5}
                fill={pt.color} opacity={0.82}
                style={s({ cursor: "pointer" })}
                onClick={() => onSelect(pt.row)}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}

// ─── Cohort Grid ──────────────────────────────────────────────────────────────

function CohortGrid({ cohortGrid, isPaid }: { cohortGrid: HistoricalCohortGridPayload; isPaid: boolean }) {
  const [panel, setPanel] = useState("Very High")
  const [metric, setMetric] = useState<CohortMetric>("median_return")
  const axis3Dir = useRef<"forward" | "back">("forward")

  const handlePanel = useCallback((p: string) => {
    const ci = AXIS3_ORDER.indexOf(panel as any)
    const ni = AXIS3_ORDER.indexOf(p as any)
    axis3Dir.current = ni > ci ? "forward" : "back"
    setPanel(p)
  }, [panel])

  const activePanel = cohortGrid.panels.find(p => p.panel === panel)

  const fmtCell = (cell: CohortGridCell) => {
    if (cell.suppressed) return "—"
    const v = cell[metric]
    if (v == null) return "—"
    if (metric === "hit_rate") return `${(v * 100).toFixed(1)}%`
    return `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`
  }

  return (
    <div>
      <div style={s({ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12, alignItems: "center" })}>
        <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.muted })}>Financing Risk panel:</span>
        {AXIS3_ORDER.map(p => (
          <button key={p} onClick={() => handlePanel(p)} style={s({
            fontFamily: E.mono, fontSize: 9.5, padding: "4px 11px", cursor: "pointer",
            border: `1px solid ${panel === p ? bucketColor(p) : E.bdr}`,
            background: panel === p ? `${bucketColor(p)}14` : "transparent",
            color: panel === p ? bucketColor(p) : E.muted,
            transition: "all 0.12s",
          })}>{p}</button>
        ))}
        <div style={s({ marginLeft: "auto", display: "flex", gap: 4 })}>
          {(["median_return", "mean_return", "hit_rate"] as CohortMetric[]).map(m => (
            <button key={m} onClick={() => setMetric(m)} style={s({
              fontFamily: E.mono, fontSize: 9.5, padding: "4px 10px", cursor: "pointer",
              border: `1px solid ${metric === m ? E.bdr2 : E.bdr}`,
              background: metric === m ? E.bg2 : "transparent",
              color: metric === m ? E.body : E.muted,
            })}>
              {m === "median_return" ? "Median" : m === "mean_return" ? "Mean" : "Hit Rate"}
            </button>
          ))}
        </div>
      </div>

      {/* Color legend */}
      <div style={s({ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginBottom: 12 })}>
        {[
          { label: "Strong Negative (<−12%)", color: "#4a1212" },
          { label: "Mild Negative",            color: "#3a1e12" },
          { label: "Neutral",                  color: "#1e1c18" },
          { label: "Mild Positive",            color: "#122a1e" },
          { label: "Strong Positive (>+12%)", color: "#0e2818" },
        ].map(({ label, color }) => (
          <div key={label} style={s({ display: "flex", alignItems: "center", gap: 5 })}>
            <div style={s({ width: 10, height: 10, background: color, border: `1px solid ${E.bdr}`, flexShrink: 0 })} />
            <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.muted })}>{label}</span>
          </div>
        ))}
      </div>

      <div style={s({ overflowX: "auto" })}>
        <AnimatePresence mode="wait">
          {activePanel && (
            <motion.div key={panel}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}>
              <table style={s({ borderCollapse: "collapse", width: "100%", minWidth: 520 })}>
                <thead>
                  <tr>
                    <th style={s({ fontFamily: E.mono, fontSize: 8.5, color: E.muted, padding: "6px 10px", textAlign: "left", borderBottom: `1px solid ${E.bdr}`, fontWeight: 400 })}>
                      <span style={s({ color: E.dim })}>Traj ↓</span> / <span style={s({ color: E.dim })}>Anchor →</span>
                    </th>
                    {cohortGrid.metadata.x_axis_labels.map(l => (
                      <th key={l} style={s({ fontFamily: E.mono, fontSize: 8.5, color: E.muted, padding: "6px 8px", textAlign: "center", borderBottom: `1px solid ${E.bdr}`, fontWeight: 400 })}>{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activePanel.rows.map(row => (
                    <tr key={row.axis2_bucket}>
                      <td style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.body, padding: "4px 10px", borderBottom: `1px solid rgba(255,255,255,0.025)`, whiteSpace: "nowrap" })}>{row.axis2_bucket}</td>
                      {row.cells.map(cell => {
                        const v = cell.suppressed ? null : cell[metric]
                        const colorVal = metric === "hit_rate" ? ((v as number ?? 0) - 0.5) * 2 : v as number
                        const isStrong = !cell.suppressed && metric !== "hit_rate" && v != null && Math.abs(v) > 0.15
                        const skew = skewSignal(cell)
                        return (
                          <td key={cell.axis1_bucket} style={s({
                            padding: 2, borderBottom: `1px solid rgba(255,255,255,0.025)`,
                          })}
                            title={`Median: ${fmtSigned(cell.median_return)} · Hit rate: ${fmt(cell.hit_rate)} · N=${cell.count}`}>
                            <div style={s({
                              height: 52, display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center",
                              background: returnHeatBg(colorVal, cell.suppressed),
                              border: isStrong ? `2px solid rgba(255,255,255,0.35)` : `1px solid ${E.bdr}`,
                            })}>
                              <div style={s({ fontFamily: E.mono, fontSize: 11, fontWeight: 500, color: returnHeatText(colorVal, cell.suppressed) })}>
                                {fmtCell(cell)}
                              </div>
                              {skew !== "none" && metric === "mean_return" && (
                                <div style={s({ fontFamily: E.mono, fontSize: 8.5, color: skew === "right" ? E.pos : E.neg, marginTop: 1 })}>
                                  {skew === "right" ? "▲ skewed" : "▼ skewed"}
                                </div>
                              )}
                              <div style={s({ fontFamily: E.mono, fontSize: 8.5, color: "rgba(255,255,255,0.35)", marginTop: 1 })}>N={fmtNum(cell.count)}</div>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, marginTop: 10, lineHeight: 1.6 })}>
        Dataset boundary: excludes ~16% of universe (no-interest firms). Structural risk for those firms is undefined, not low.
        Outlined cells = |return| &gt; 15%. Historical analysis — does not predict individual company returns.
      </p>
    </div>
  )
}

// ─── Company Drilldown ────────────────────────────────────────────────────────

function Drilldown({ company, cohortGrid, isPaid, onClose }: {
  company: SnapshotRow
  cohortGrid: HistoricalCohortGridPayload | null
  isPaid: boolean
  onClose: () => void
}) {
  const narrative = narrateCompany(company)
  const cohortCell = findCohortCell(company, cohortGrid)
  const a1 = pctToBucket(company.axis1_pct)
  const a2 = pctToBucket(company.axis2_pct)
  const a3 = pctToBucket(company.axis3_pct)
  const panel = axis3Panel(company.axis3_pct, cohortGrid?.metadata.panels)

  const axes = [
    {
      label: "Operational Anchor Risk", bucket: a1, pct: company.axis1_pct,
      interp: (company.axis1_pct ?? 0) >= 0.8 ? "Valuation is severely elevated relative to demonstrated operating output. The narrative bridge is very long."
        : (company.axis1_pct ?? 0) >= 0.6 ? "Valuation is elevated relative to demonstrated operating output."
        : (company.axis1_pct ?? 0) >= 0.4 ? "Valuation stretch is moderate. Operational support is partial."
        : "Valuation is well-supported by demonstrated operational output.",
    },
    {
      label: "Operational Trajectory Risk", bucket: a2, pct: company.axis2_pct,
      interp: (company.axis2_pct ?? 0) >= 0.8 ? "Operational anchor is weakening rapidly on a trailing basis."
        : (company.axis2_pct ?? 0) >= 0.6 ? "Operational anchor is deteriorating on a trailing basis."
        : (company.axis2_pct ?? 0) >= 0.4 ? "Operational trajectory is mixed — no clear directional signal."
        : "Operational anchor is strengthening on a trailing basis.",
    },
    {
      label: "Operational Financing Risk", bucket: a3, pct: company.axis3_pct,
      interp: company.axis3_pct == null ? "This company carries no interest-bearing debt. Financing risk is undefined, not low."
        : (company.axis3_pct ?? 0) >= 0.8 ? "Balance sheet flexibility is severely constrained."
        : (company.axis3_pct ?? 0) >= 0.6 ? "Financing pressure is meaningful."
        : (company.axis3_pct ?? 0) >= 0.4 ? "Financing exposure is moderate."
        : "Balance sheet flexibility is sufficient.",
    },
  ]

  return (
    <div style={s({ height: "100%", overflowY: "auto", background: E.bg2 })}>
      <div style={s({ padding: "16px", borderBottom: `1px solid ${E.bdr}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" })}>
        <div>
          <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted, marginBottom: 4 })}>Company Drilldown</p>
          <div style={s({ fontFamily: E.sans, fontSize: 22, fontWeight: 800, color: E.text, letterSpacing: "-0.03em" })}>{company.symbol}</div>
          <div style={s({ fontFamily: E.mono, fontSize: 10, color: E.muted, marginTop: 2 })}>{company.oal_label ?? "—"}</div>
        </div>
        <div style={s({ textAlign: "right" })}>
          <div style={s({ fontFamily: E.sans, fontSize: 14, fontWeight: 700, color: bucketColor(company.composite_bucket) })}>{company.composite_bucket}</div>
          <div style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>{fmtPct(company.composite_score)}</div>
          <button onClick={onClose} style={s({ fontFamily: E.mono, fontSize: 9, color: E.muted, background: "none", border: `1px solid ${E.bdr}`, padding: "3px 8px", cursor: "pointer", marginTop: 8 })}>Close</button>
        </div>
      </div>

      <div style={s({ padding: "16px", borderBottom: `1px solid ${E.bdr}` })}>
        <div style={s({ fontFamily: E.sans, fontSize: 12, lineHeight: 1.7, color: E.body, background: E.bg3, border: `1px solid ${E.bdr}`, padding: "10px 12px" })}>{narrative.headerRead}</div>
      </div>

      <div style={s({ padding: "16px", borderBottom: `1px solid ${E.bdr}` })}>
        <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: E.muted, marginBottom: 12 })}>Axis Breakdown</p>
        <div style={s({ display: "flex", flexDirection: "column", gap: 12 })}>
          {axes.map(({ label, bucket, pct, interp }) => (
            <div key={label}>
              <div style={s({ display: "flex", justifyContent: "space-between", marginBottom: 4 })}>
                <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: E.muted })}>{label}</span>
                <span style={s({ fontFamily: E.mono, fontSize: 9.5, color: bucketColor(bucket), fontWeight: 500 })}>{bucket}</span>
              </div>
              <div style={s({ height: 2, background: E.bdr2, marginBottom: 6, position: "relative" })}>
                <div style={s({ position: "absolute", left: 0, top: 0, height: 2, width: `${(pct ?? 0) * 100}%`, background: bucketColor(bucket) })} />
              </div>
              <p style={s({ fontFamily: E.sans, fontSize: 11.5, lineHeight: 1.65, color: E.muted })}>{interp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cohort match */}
      {isPaid ? (
        <div style={s({ padding: "16px", borderBottom: `1px solid ${E.bdr}` })}>
          <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: E.muted, marginBottom: 10 })}>Historical Cohort Match</p>
          <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.dim, marginBottom: 10, lineHeight: 1.5 })}>
            {panel} · Anchor {a1} · Trajectory {a2}
          </p>
          {cohortCell && !cohortCell.suppressed ? (
            <div>
              <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 10 })}>
                {[
                  { label: "Median Return", val: fmtSigned(cohortCell.median_return) },
                  { label: "Hit Rate",      val: fmt(cohortCell.hit_rate) },
                  { label: "Observations", val: fmtNum(cohortCell.count) },
                ].map(({ label, val }) => (
                  <div key={label} style={s({ background: E.bg3, border: `1px solid ${E.bdr}`, padding: "10px 8px", textAlign: "center" })}>
                    <div style={s({ fontFamily: E.mono, fontSize: 14, fontWeight: 500, color: E.text })}>{val}</div>
                    <div style={s({ fontFamily: E.mono, fontSize: 8.5, color: E.muted, marginTop: 2 })}>{label}</div>
                  </div>
                ))}
              </div>
              <p style={s({ fontFamily: E.sans, fontSize: 11.5, lineHeight: 1.65, color: E.body })}>
                Companies in similar structural states have historically produced <strong style={s({ color: E.text })}>{fmtSigned(cohortCell.median_return)}</strong> median returns over {cohortGrid?.metadata.horizon_months ?? 12} months, with a <strong style={s({ color: E.text })}>{fmt(cohortCell.hit_rate)}</strong> hit rate.
                {skewSignal(cohortCell) === "right" && ` Mean is materially higher (${fmtSigned(cohortCell.mean_return)}) — distribution is right-skewed by a small number of large winners.`}
                {skewSignal(cohortCell) === "left" && ` Mean is materially lower (${fmtSigned(cohortCell.mean_return)}) — distribution is left-skewed by outsized losses.`}
              </p>
            </div>
          ) : (
            <p style={s({ fontFamily: E.mono, fontSize: 10.5, color: E.muted })}>
              {cohortCell?.suppressed ? "Cohort cell suppressed — insufficient observations." : "No cohort match found for this structural profile."}
            </p>
          )}
        </div>
      ) : (
        <div style={s({ padding: "16px", borderBottom: `1px solid ${E.bdr}`, background: E.gatm })}>
          <div style={s({ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 })}>
            <Lock size={13} style={{ color: E.gold }} />
            <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: E.gold })}>Paid Subscribers</p>
          </div>
          <p style={s({ fontFamily: E.sans, fontSize: 12, lineHeight: 1.65, color: E.body, marginBottom: 10 })}>Historical cohort data showing how companies in this structural profile have performed over 12-month forward horizons is available with a paid subscription.</p>
          <a href="/platform/subscribe" style={s({ fontFamily: E.sans, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 16px", background: E.gold, color: "#060504", textDecoration: "none", display: "inline-block" })}>Upgrade to Full Access</a>
        </div>
      )}

      <div style={s({ padding: "16px" })}>
        <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 })}>
          <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: E.muted })}>Trajectory Context</p>
          <span style={s({ fontFamily: E.mono, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: E.muted, background: "rgba(85,78,68,0.12)", padding: "2px 6px" })}>Interpretive</span>
        </div>
        <div style={s({ background: E.bg3, border: `1px solid ${E.bdr}`, padding: "12px" })}>
          <p style={s({ fontFamily: E.sans, fontSize: 12, lineHeight: 1.7, color: E.body, marginBottom: 10 })}>{narrative.trajectoryProfile}</p>
          <div style={s({ paddingTop: 10, borderTop: `1px solid ${E.bdr}` })}>
            <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 })}>
              <span style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: E.pos })}>Structural Takeaway</span>
              <span style={s({ fontFamily: E.mono, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: E.muted, background: "rgba(85,78,68,0.12)", padding: "2px 6px" })}>Interpretive</span>
            </div>
            <p style={s({ fontFamily: E.sans, fontSize: 12, lineHeight: 1.7, color: E.body })}>{narrative.takeaway}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Active Risk Cluster ──────────────────────────────────────────────────────

function ActiveRiskCluster({ data, onSelect }: { data: SnapshotRow[]; onSelect: (r: SnapshotRow) => void }) {
  const topRisk = useMemo(() =>
    [...data].filter(r => r.composite_score != null)
      .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
      .slice(0, 12), [data])
  return (
    <div style={s({ padding: "20px 24px", borderBottom: `1px solid ${E.bdr}` })}>
      <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 })}>
        <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: E.muted })}>Active Risk Cluster</p>
        <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.dim })}>Top {topRisk.length} by composite</span>
      </div>
      <p style={s({ fontFamily: E.sans, fontSize: 12, color: E.body, marginBottom: 10, lineHeight: 1.6 })}>Highest structural risk under active filters. Click to open drilldown.</p>
      <div style={s({ display: "flex", flexWrap: "wrap", gap: 4 })}>
        {topRisk.map(row => {
          const isVH = row.composite_bucket === "Very High"
          return (
            <div key={row.symbol} onClick={() => onSelect(row)} style={s({
              display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", cursor: "pointer",
              border: `1px solid ${isVH ? "rgba(184,92,74,0.4)" : E.bdr}`,
              background: isVH ? "rgba(184,92,74,0.08)" : "transparent",
              transition: "all 0.12s",
            })}>
              <span style={s({ fontFamily: E.mono, fontSize: 11.5, fontWeight: 500, color: E.text })}>{row.symbol}</span>
              <span style={s({ fontFamily: E.mono, fontSize: 9, color: bucketColor(row.composite_bucket) })}>{row.composite_bucket}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Snapshot Table ───────────────────────────────────────────────────────────

function SnapshotTable({ data, isPaid, onSelect }: {
  data: SnapshotRow[]
  isPaid: boolean
  onSelect: (r: SnapshotRow) => void
}) {
  const [search, setSearch] = useState("")
  const [oalF, setOalF] = useState("All")
  const [bucketF, setBucketF] = useState("All")

  const filtered = useMemo(() => data.filter(r => {
    if (oalF !== "All" && r.oal_label !== oalF) return false
    if (bucketF !== "All" && r.composite_bucket !== bucketF) return false
    if (search && !r.symbol.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [data, search, oalF, bucketF])

  return (
    <div>
      <div style={s({ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" })}>
        <div style={s({ position: "relative" })}>
          <Search size={12} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: E.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ticker"
            style={s({ fontFamily: E.mono, fontSize: 11, padding: "6px 8px 6px 24px", background: E.bg2, border: `1px solid ${E.bdr}`, color: E.text, outline: "none", width: 140 })} />
        </div>
        <select value={oalF} onChange={e => setOalF(e.target.value)}
          style={s({ fontFamily: E.mono, fontSize: 11, padding: "6px 8px", background: E.bg2, border: `1px solid ${E.bdr}`, color: E.body, outline: "none" })}>
          <option value="All">All OALs</option>
          {OAL_ORDER.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={bucketF} onChange={e => setBucketF(e.target.value)}
          style={s({ fontFamily: E.mono, fontSize: 11, padding: "6px 8px", background: E.bg2, border: `1px solid ${E.bdr}`, color: E.body, outline: "none" })}>
          <option value="All">All Buckets</option>
          {BUCKET_ORDER.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <span style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, marginLeft: "auto" })}>{fmtNum(filtered.length)} companies</span>
      </div>
      <div style={s({ overflowX: "auto" })}>
        <table style={s({ width: "100%", borderCollapse: "collapse", minWidth: 500 })}>
          <thead>
            <tr style={s({ background: E.bg2, borderBottom: `1px solid ${E.bdr}` })}>
              {["Symbol", "OAL", "Anchor Risk", "Trajectory", "Financing", "Composite"].map(h => (
                <th key={h} style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: E.muted, padding: "8px 10px", textAlign: "left", fontWeight: 400 })}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.symbol} onClick={() => onSelect(row)} style={s({ borderBottom: `1px solid rgba(255,255,255,0.025)`, cursor: "pointer" })}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = E.gatm}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <td style={s({ fontFamily: E.mono, fontSize: 12, fontWeight: 500, color: E.text, padding: "7px 10px" })}>{row.symbol}</td>
                <td style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, padding: "7px 10px" })}>{row.oal_label}</td>
                <td style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, padding: "7px 10px" })}>{fmtPct(row.axis1_pct)}</td>
                <td style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, padding: "7px 10px" })}>{fmtPct(row.axis2_pct)}</td>
                <td style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, padding: "7px 10px" })}>{row.axis3_pct == null ? "—" : fmtPct(row.axis3_pct)}</td>
                <td style={s({ padding: "7px 10px" })}>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, fontWeight: 500, color: bucketColor(row.composite_bucket), padding: "2px 7px", border: `1px solid ${bucketColor(row.composite_bucket)}30`, background: `${bucketColor(row.composite_bucket)}10` })}>
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

// ─── OAL Structure Tab ────────────────────────────────────────────────────────

function OALTab({ oalSummary }: { oalSummary: OALSummaryRow[] }) {
  const CS = { fontFamily: E.mono, fontSize: 10, fill: E.muted }
  return (
    <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 })}>
      <div style={s({ border: `1px solid ${E.bdr}`, background: E.bg2 })}>
        <div style={s({ padding: "16px 20px", borderBottom: `1px solid ${E.bdr}` })}>
          <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted, marginBottom: 4 })}>OAL Distribution</p>
          <p style={s({ fontFamily: E.sans, fontSize: 12, color: E.body, lineHeight: 1.6 })}>Companies by deepest qualifying financial anchor. Each step up the ladder increases narrative dependence.</p>
        </div>
        <div style={s({ padding: "16px 20px", height: 280 })}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={oalSummary} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} vertical={false} />
              <XAxis dataKey="oal_label" tick={CS as any} axisLine={false} tickLine={false} />
              <YAxis tick={CS as any} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: E.bg2, border: `1px solid ${E.bdr2}`, fontFamily: E.mono, fontSize: 11, color: E.text, borderRadius: 0 }} />
              <Bar dataKey="n" radius={[2, 2, 0, 0]}>
                {oalSummary.map((row, i) => (
                  <Cell key={i} fill={
                    row.oal_label === "FCF" ? E.pos :
                    row.oal_label === "Net Income" ? E.blue :
                    row.oal_label === "EBIT" ? E.gold :
                    row.oal_label === "Revenue" ? E.neg : E.muted
                  } opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={s({ border: `1px solid ${E.bdr}`, background: E.bg2 })}>
        <div style={s({ padding: "16px 20px", borderBottom: `1px solid ${E.bdr}` })}>
          <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted, marginBottom: 4 })}>Median Axis Scores by OAL</p>
          <p style={s({ fontFamily: E.sans, fontSize: 12, color: E.body, lineHeight: 1.6 })}>Median anchor, financing, and composite scores across OAL levels — where structural pressure deepens.</p>
        </div>
        <div style={s({ padding: "16px 20px" })}>
          <table style={s({ width: "100%", borderCollapse: "collapse" })}>
            <thead>
              <tr style={s({ borderBottom: `1px solid ${E.bdr}` })}>
                {["OAL", "Count", "Anchor Risk", "Financing Risk", "Composite"].map(h => (
                  <th key={h} style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: E.muted, padding: "6px 8px", textAlign: "left", fontWeight: 400 })}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {oalSummary.map(row => (
                <tr key={row.oal_label} style={s({ borderBottom: `1px solid rgba(255,255,255,0.025)` })}>
                  <td style={s({ fontFamily: E.mono, fontSize: 11.5, fontWeight: 500, color: E.text, padding: "7px 8px" })}>{row.oal_label}</td>
                  <td style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, padding: "7px 8px" })}>{fmtNum(row.n)}</td>
                  <td style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, padding: "7px 8px" })}>{row.median_axis1 == null ? "—" : fmtPct(row.median_axis1)}</td>
                  <td style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, padding: "7px 8px" })}>{row.median_axis3 == null ? "—" : fmtPct(row.median_axis3)}</td>
                  <td style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, padding: "7px 8px" })}>{row.median_composite == null ? "—" : fmtPct(row.median_composite)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Financing Tab ────────────────────────────────────────────────────────────

function FinancingTab({ liquiditySummary }: { liquiditySummary: LiquiditySummaryRow[] }) {
  const CS = { fontFamily: E.mono, fontSize: 10, fill: E.muted }
  return (
    <div style={s({ border: `1px solid ${E.bdr}`, background: E.bg2 })}>
      <div style={s({ padding: "16px 20px", borderBottom: `1px solid ${E.bdr}` })}>
        <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted, marginBottom: 4 })}>Financing Context</p>
        <p style={s({ fontFamily: E.sans, fontSize: 12, color: E.body, lineHeight: 1.6 })}>Balance sheet flexibility and financing strain across the current filtered universe. Context for how much runway companies have to allow their structural narrative to play out.</p>
      </div>
      <div style={s({ padding: "16px 20px", height: 300 })}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={liquiditySummary} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="2 4" stroke={E.bdr} vertical={false} />
            <XAxis dataKey="bucket" tick={CS as any} axisLine={false} tickLine={false} />
            <YAxis tick={CS as any} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ background: E.bg2, border: `1px solid ${E.bdr2}`, fontFamily: E.mono, fontSize: 11, color: E.text, borderRadius: 0 }} />
            <Bar dataKey="count" fill={E.pos} opacity={0.85} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── History Tab ──────────────────────────────────────────────────────────────

function HistoryTab({ manifest }: { manifest: HistoryManifestRow[] }) {
  return (
    <div style={s({ border: `1px solid ${E.bdr}`, background: E.bg2 })}>
      <div style={s({ padding: "16px 20px", borderBottom: `1px solid ${E.bdr}` })}>
        <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted, marginBottom: 4 })}>Historical Coverage</p>
        <p style={s({ fontFamily: E.sans, fontSize: 12, color: E.body, lineHeight: 1.6 })}>Archived monthly structural snapshots. Each month is a formation state from which forward returns were measured.</p>
      </div>
      <div style={s({ overflowX: "auto" })}>
        <table style={s({ width: "100%", borderCollapse: "collapse" })}>
          <thead>
            <tr style={s({ background: E.bg3, borderBottom: `1px solid ${E.bdr}` })}>
              {["Month", "OAL Scores", "OAL Summary", "Structural Snapshot"].map(h => (
                <th key={h} style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: E.muted, padding: "8px 14px", textAlign: "left", fontWeight: 400 })}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {manifest.map(row => (
              <tr key={row.month} style={s({ borderBottom: `1px solid rgba(255,255,255,0.025)` })}>
                <td style={s({ fontFamily: E.mono, fontSize: 11.5, fontWeight: 500, color: E.text, padding: "7px 14px" })}>{row.month}</td>
                <td style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, padding: "7px 14px" })}>{row.has_oal_scores === false ? "—" : fmtNum(row.oal_scores_rows)}</td>
                <td style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, padding: "7px 14px" })}>{row.has_oal_summary === false ? "—" : fmtNum(row.oal_summary_rows)}</td>
                <td style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, padding: "7px 14px" })}>{row.has_structural_snapshot === false ? "—" : fmtNum(row.structural_rows)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function PlatformBeta() {
  const { user, isSignedIn } = useUser()
  const isPaid = isSignedIn && user?.publicMetadata?.subscription === "active"

  const [snapshot, setSnapshot] = useState<SnapshotRow[]>([])
  const [oalSummary, setOalSummary] = useState<OALSummaryRow[]>([])
  const [liquiditySummary, setLiquiditySummary] = useState<LiquiditySummaryRow[]>([])
  const [manifest, setManifest] = useState<HistoryManifestRow[]>([])
  const [cohortGrid, setCohortGrid] = useState<HistoricalCohortGridPayload | null>(null)
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState("market-map")
  const [selectedOAL, setSelectedOAL] = useState("All")
  const [selectedBucket, setSelectedBucket] = useState("All")
  const [search, setSearch] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<SnapshotRow | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/data/osmr_snapshot.json").then(r => r.json()),
      fetch("/data/oal_summary.json").then(r => r.json()),
      fetch("/data/liquidity_summary.json").then(r => r.json()),
      fetch("/data/history_manifest.json").then(r => r.json()),
      fetch("/data/historical_cohort_grids.json").then(r => r.json()),
    ])
      .then(([snap, oal, liq, hist, grids]) => {
        setSnapshot(snap)
        setOalSummary(oal)
        setLiquiditySummary(liq)
        setManifest(hist)
        setCohortGrid(grids)
        setLoading(false)
      })
      .catch(err => { console.error(err); setLoading(false) })
  }, [])

  const filtered = useMemo(() => snapshot.filter(r => {
    if (selectedOAL !== "All" && r.oal_label !== selectedOAL) return false
    if (selectedBucket !== "All" && r.composite_bucket !== selectedBucket) return false
    if (search && !r.symbol.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [snapshot, selectedOAL, selectedBucket, search])

  const stats = useMemo(() => ({
    veryHigh: filtered.filter(r => r.composite_bucket === "Very High").length,
    financing: filtered.filter(r => (r.axis3_pct ?? 0) >= 0.8).length,
    total: filtered.length,
    fcfAnchored: filtered.filter(r => r.oal_label === "FCF").length,
  }), [filtered])

  if (loading) return (
    <div style={s({ minHeight: "100vh", background: E.bg, display: "flex", alignItems: "center", justifyContent: "center" })}>
      <div style={s({ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: E.muted })}>Loading structural data...</div>
    </div>
  )

  return (
    <div style={s({ minHeight: "100vh", background: E.bg, color: E.text, fontFamily: E.sans })}>

      {/* NAV */}
      <nav style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", height: 48, padding: "0 28px", borderBottom: `1px solid ${E.bdr}`, background: E.bg, position: "sticky", top: 0, zIndex: 50 })}>
        <a href="/" style={s({ textDecoration: "none", display: "flex", alignItems: "baseline" })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15, color: E.gold, marginLeft: 6 })}>Steward</span>
        </a>
        <div style={s({ display: "flex", alignItems: "center", gap: 0 })}>
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={s({
              fontFamily: E.mono, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
              color: activeTab === id ? E.gold : E.muted,
              padding: "0 14px", height: 48, background: "none", border: "none",
              borderBottom: `2px solid ${activeTab === id ? E.gold : "transparent"}`,
              borderLeft: `1px solid ${E.bdr}`, cursor: "pointer",
            })}>{label}</button>
          ))}
        </div>
        <div style={s({ display: "flex", alignItems: "center", gap: 8 })}>
          <div style={s({ width: 5, height: 5, borderRadius: "50%", background: E.gold, animation: "pulse 2.5s ease-in-out infinite" })} />
          <span style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: E.muted })}>Live · Mar 2026</span>
          {!isPaid && (
            <a href="/platform/subscribe" style={s({ fontFamily: E.sans, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 12px", background: E.gold, color: "#060504", textDecoration: "none", marginLeft: 10 })}>Upgrade</a>
          )}
        </div>
      </nav>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      {/* TEMPORAL BAR */}
      <TemporalBar manifest={manifest} />

      {/* KPI STRIP */}
      <KPIStrip stats={stats} isPaid={isPaid ?? false} />

      {/* GLOBAL FILTERS */}
      <div style={s({ display: "flex", alignItems: "center", gap: 8, padding: "10px 28px", borderBottom: `1px solid ${E.bdr}`, background: E.bg2, flexWrap: "wrap" })}>
        <Filter size={12} style={{ color: E.muted }} />
        <span style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: E.muted, marginRight: 4 })}>Filters</span>
        <div style={s({ position: "relative" })}>
          <Search size={11} style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", color: E.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ticker"
            style={s({ fontFamily: E.mono, fontSize: 10.5, padding: "5px 8px 5px 22px", background: E.bg, border: `1px solid ${E.bdr}`, color: E.text, outline: "none", width: 110 })} />
        </div>
        <select value={selectedOAL} onChange={e => setSelectedOAL(e.target.value)}
          style={s({ fontFamily: E.mono, fontSize: 10.5, padding: "5px 8px", background: E.bg, border: `1px solid ${E.bdr}`, color: E.body, outline: "none" })}>
          <option value="All">All OALs</option>
          {OAL_ORDER.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={selectedBucket} onChange={e => setSelectedBucket(e.target.value)}
          style={s({ fontFamily: E.mono, fontSize: 10.5, padding: "5px 8px", background: E.bg, border: `1px solid ${E.bdr}`, color: E.body, outline: "none" })}>
          <option value="All">All Buckets</option>
          {BUCKET_ORDER.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <button onClick={() => { setSearch(""); setSelectedOAL("All"); setSelectedBucket("All") }}
          style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, background: "none", border: `1px solid ${E.bdr}`, padding: "5px 10px", cursor: "pointer" })}>
          Clear
        </button>
        <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.dim, marginLeft: "auto" })}>{fmtNum(filtered.length)} companies</span>
      </div>

      {/* MAIN + SIDEBAR LAYOUT */}
      <div style={s({ display: "grid", gridTemplateColumns: selectedCompany ? "1fr 320px" : "1fr", minHeight: "calc(100vh - 200px)" })}>

        {/* MAIN CONTENT */}
        <div style={s({ borderRight: selectedCompany ? `1px solid ${E.bdr}` : "none" })}>

          {/* ── MARKET MAP TAB ── */}
          {activeTab === "market-map" && (
            <div>
              <InterpretiveLayer data={filtered} />

              <div style={s({ padding: "20px 24px", borderBottom: `1px solid ${E.bdr}` })}>
                <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: E.muted, marginBottom: 6 })}>Three-Axis Structural Map</p>
                <p style={s({ fontFamily: E.sans, fontSize: 12, color: E.body, marginBottom: 14, lineHeight: 1.6 })}>X = Trajectory Risk · Y = Anchor Risk · Color = Composite · Click any dot to open drilldown</p>
                <ScatterMap data={filtered} onSelect={setSelectedCompany} />
              </div>

              <ActiveRiskCluster data={filtered} onSelect={setSelectedCompany} />

              {cohortGrid && (
                <div style={s({ padding: "20px 24px", borderBottom: `1px solid ${E.bdr}` })}>
                  <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 })}>
                    <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: E.muted })}>Historical Cohort Outcomes</p>
                    <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.dim })}>{fmtNum(cohortGrid.metadata.observation_count)} obs · {cohortGrid.metadata.horizon_months}M forward</span>
                  </div>
                  <p style={s({ fontFamily: E.sans, fontSize: 12, color: E.body, marginBottom: 14, lineHeight: 1.6 })}>
                    How companies in similar structural states have historically performed. Start by scanning the bottom-right of each panel — where anchor risk and trajectory risk are both highest.
                  </p>
                  {isPaid
                    ? <CohortGrid cohortGrid={cohortGrid} isPaid={isPaid} />
                    : (
                      <div style={s({ border: `1px solid ${E.bdr}`, background: E.gatm, padding: "24px" })}>
                        <div style={s({ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 })}>
                          <Lock size={14} style={{ color: E.gold }} />
                          <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: E.gold })}>Paid Subscribers</span>
                        </div>
                        <p style={s({ fontFamily: E.sans, fontSize: 13, color: E.body, lineHeight: 1.75, marginBottom: 14 })}>
                          The full cohort grid — {fmtNum(cohortGrid.metadata.observation_count)} observations across {cohortGrid.metadata.horizon_months}-month forward horizons — is available with a paid subscription.
                          Free users can see the market map and snapshot. Cohort grids require a paid account.
                        </p>
                        <a href="/platform/subscribe" style={s({ fontFamily: E.sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 20px", background: E.gold, color: "#060504", textDecoration: "none", display: "inline-block" })}>
                          Subscribe to Access
                        </a>
                      </div>
                    )
                  }
                </div>
              )}
            </div>
          )}

          {/* ── SNAPSHOT TAB ── */}
          {activeTab === "snapshot" && (
            <div style={s({ padding: "20px 24px" })}>
              <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: E.muted, marginBottom: 6 })}>Current Snapshot</p>
              <p style={s({ fontFamily: E.sans, fontSize: 12, color: E.body, marginBottom: 14, lineHeight: 1.6 })}>Full structural profile for each company under active filters. Click any row to open drilldown.</p>
              <SnapshotTable data={filtered} isPaid={isPaid ?? false} onSelect={setSelectedCompany} />
            </div>
          )}

          {/* ── OAL TAB ── */}
          {activeTab === "oal" && (
            <div style={s({ padding: "20px 24px" })}>
              <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: E.muted, marginBottom: 6 })}>Operational Anchor Structure</p>
              <p style={s({ fontFamily: E.sans, fontSize: 12, color: E.body, marginBottom: 14, lineHeight: 1.6 })}>Distribution across levels of demonstrated operating support — from FCF-anchored companies at the deepest end to revenue-only at the shallowest.</p>
              <OALTab oalSummary={oalSummary} />
            </div>
          )}

          {/* ── FINANCING TAB ── */}
          {activeTab === "financing" && (
            <div style={s({ padding: "20px 24px" })}>
              <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: E.muted, marginBottom: 6 })}>Financing Context</p>
              <p style={s({ fontFamily: E.sans, fontSize: 12, color: E.body, marginBottom: 14, lineHeight: 1.6 })}>Balance sheet flexibility and financing strain across the current filtered universe.</p>
              <FinancingTab liquiditySummary={liquiditySummary} />
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === "history" && (
            <div style={s({ padding: "20px 24px" })}>
              <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: E.muted, marginBottom: 6 })}>Historical Coverage</p>
              <p style={s({ fontFamily: E.sans, fontSize: 12, color: E.body, marginBottom: 14, lineHeight: 1.6 })}>Archived monthly structural snapshots available in the system. Each month is a formation state from which forward returns were measured.</p>
              <HistoryTab manifest={manifest} />
            </div>
          )}

          {/* FOOTER */}
          <div style={s({ padding: "24px 28px", borderTop: `1px solid ${E.bdr}`, textAlign: "center" })}>
            <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, lineHeight: 1.7 })}>
              The Capital Steward, LLC · thecapitalsteward.com<br />
              © 2026 The Capital Steward, LLC. For informational purposes only. Not investment advice.
            </p>
          </div>
        </div>

        {/* SIDEBAR DRILLDOWN */}
        {selectedCompany && (
          <Drilldown
            company={selectedCompany}
            cohortGrid={cohortGrid}
            isPaid={isPaid ?? false}
            onClose={() => setSelectedCompany(null)}
          />
        )}
      </div>

    </div>
  )
}