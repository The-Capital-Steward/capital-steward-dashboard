"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Shield,
  Layers3,
  Activity,
  AlertTriangle,
  Clock3,
  Filter,
  Grid3X3,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COLORS = {
  bg: "#0A1F3D",
  panel: "#102642",
  card: "#112A47",
  inset: "#0D2138",
  border: "#203754",
  text: "#EAF0F2",
  textSecondary: "#B8C3CC",
  textMuted: "#7E8A96",
  accent: "#41506A",
  green: "#244636",
  greenSoft: "#E8EFE9",
  positive: "#3E8E6A",
  positiveSoft: "#6DAE8B",
  negative: "#8B3838",
  negativeSoft: "#BC6464",
  neutral: "#47566B",
  suppressed: "#20314F",
};

type SnapshotRow = {
  symbol: string;
  oal_label: string | null;
  risk_bucket_within_oal: string | null;
  axis1_pct: number | null;
  axis2_pct: number | null;
  axis2_plot?: number | null;
  axis3_pct: number | null;
  composite_score: number | null;
  composite_bucket: string | null;
};

type OALSummaryRow = {
  oal_label: string;
  n: number;
  median_axis1: number | null;
  median_axis3: number | null;
  median_composite: number | null;
};

type LiquiditySummaryRow = {
  bucket: string;
  count: number;
};

type HistoryManifestRow = {
  month: string;
  oal_scores_rows: number | null;
  oal_summary_rows: number | null;
  structural_rows: number | null;
  has_oal_scores?: boolean;
  has_oal_summary?: boolean;
  has_structural_snapshot?: boolean;
};

type CohortGridCell = {
  count: number;
  mean_return: number | null;
  median_return: number | null;
  hit_rate: number | null;
  display_value: number | null;
  suppressed: boolean;
  axis1_bucket: string;
  axis2_bucket: string;
  axis3_bucket: string;
};

type CohortGridRow = {
  axis2_bucket: string;
  cells: CohortGridCell[];
};

type CohortGridPanel = {
  panel: string;
  rows: CohortGridRow[];
};

type CohortGridMetadata = {
  horizon_months: number;
  formation_frequency: string;
  backend_price_frequency: string;
  cell_statistic: string;
  min_count_for_display: number;
  panel_dimension: string;
  column_dimension: string;
  row_dimension: string;
  x_axis_labels: string[];
  y_axis_labels: string[];
  panels: string[];
  formation_month_min: string | null;
  formation_month_max: string | null;
  observation_count: number;
  notes: string[];
};

type HistoricalCohortGridPayload = {
  metadata: CohortGridMetadata;
  panels: CohortGridPanel[];
};

type CohortMetric = "mean_return" | "median_return" | "hit_rate";

const bucketOrder = ["Very Low", "Low", "Moderate", "High", "Very High"];
const oalOrder = ["FCF", "Net Income", "EBIT", "Revenue", "Non-viable"];

function formatPct(v: number | null) {
  if (v == null || Number.isNaN(v)) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function formatPctSigned(v: number | null) {
  if (v == null || Number.isNaN(v)) return "—";
  const pct = v * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

function formatNum(v: number | null) {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toLocaleString();
}

function compositeColor(bucket: string | null | undefined) {
  const colorMap: Record<string, string> = {
    "Very Low": COLORS.positive,
    Low: COLORS.positiveSoft,
    Moderate: COLORS.accent,
    High: COLORS.negativeSoft,
    "Very High": COLORS.negative,
  };
  return colorMap[bucket ?? ""] ?? COLORS.textMuted;
}

function getCohortMetricValue(cell: CohortGridCell, metric: CohortMetric) {
  if (cell.suppressed) return null;
  return cell[metric];
}

function formatCohortMetric(value: number | null, metric: CohortMetric) {
  if (value == null || Number.isNaN(value)) return "—";
  if (metric === "hit_rate") return `${(value * 100).toFixed(1)}%`;
  const pct = value * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

function cohortMetricLabel(metric: CohortMetric) {
  if (metric === "mean_return") return "Mean Return";
  if (metric === "median_return") return "Median Return";
  return "Hit Rate";
}

function returnHeatColor(v: number | null, suppressed: boolean) {
  if (suppressed || v == null || Number.isNaN(v)) return COLORS.suppressed;
  if (v <= -0.12) return COLORS.negative;
  if (v <= -0.03) return COLORS.negativeSoft;
  if (v < 0.03) return COLORS.neutral;
  if (v < 0.12) return COLORS.positiveSoft;
  return COLORS.positive;
}

function skewSignal(cell: CohortGridCell): "right" | "left" | "none" {
  if (cell.mean_return == null || cell.median_return == null || cell.suppressed) return "none";
  const diff = cell.mean_return - cell.median_return;
  if (diff > 0.10) return "right";
  if (diff < -0.10) return "left";
  return "none";
}

// ─── KPI Delta Row ────────────────────────────────────────────────────────────
// Shows month-over-month directional change beneath each KPI.
// Absent (renders nothing) when previous value is null.
//
// DATA CONTRACT — pipeline must export prior-month KPI values into a JSON file,
// e.g. /data/osmr_snapshot_meta.json, with this shape:
//
//   {
//     "formation_date": "2026-02-01",
//     "prior_kpis": {
//       "very_high_count": 838,
//       "fragile_count": 1490,
//       "total_count": 4790,
//       "avg_composite": 0.508
//     }
//   }
//
// Then in PlatformPage:
//   const [snapshotMeta, setSnapshotMeta] = useState<SnapshotMeta | null>(null);
//   fetch("/data/osmr_snapshot_meta.json").then(...).then(setSnapshotMeta)
//
// And pass to KPIDelta:
//   previous={snapshotMeta?.prior_kpis.very_high_count ?? null}
//
// Until that file exists, all KPIDelta instances render nothing — clean degradation.

type KPIDeltaProps = {
  current: number | null;
  previous: number | null;
  higherIsBad: boolean;
  isDecimal?: boolean;
};

function KPIDelta({ current, previous, higherIsBad, isDecimal = false }: KPIDeltaProps) {
  if (current == null || previous == null) return null;

  const delta = current - previous;
  if (delta === 0) {
    return (
      <div className="mt-1.5 text-[11px] text-[#7E8A96]">
        Unchanged from last month
      </div>
    );
  }

  const isIncrease = delta > 0;
  // For stress metrics: increase = bad (red), decrease = good (green)
  const isAdverse = higherIsBad ? isIncrease : !isIncrease;
  const color = isAdverse ? "#BC6464" : "#6DAE8B";
  const arrow = isIncrease ? "↑" : "↓";

  const formattedDelta = isDecimal
    ? `${Math.abs(delta * 100).toFixed(1)}pp`
    : formatNum(Math.abs(Math.round(delta)));

  return (
    <div className="mt-1.5 text-[11px]" style={{ color }}>
      {arrow} {formattedDelta} from last month
    </div>
  );
}

// ─── Temporal Anchor Bar ──────────────────────────────────────────────────────
// Derives formation date and next recalibration date from the history manifest.
// Computes days remaining to next monthly recalibration client-side.
// Static text only — no animation. Brightness shifts at ≤7 days remaining.

type TemporalAnchorBarProps = {
  historyManifest: HistoryManifestRow[];
  loading: boolean;
};

function computeTemporalState(historyManifest: HistoryManifestRow[]): {
  formationLabel: string;
  nextRefreshLabel: string;
  daysRemaining: number | null;
} {
  if (historyManifest.length === 0) {
    return { formationLabel: "—", nextRefreshLabel: "—", daysRemaining: null };
  }

  // Most recent month in the manifest
  const sorted = [...historyManifest].sort((a, b) => b.month.localeCompare(a.month));
  const latest = sorted[0].month; // "YYYY-MM"

  const [year, month] = latest.split("-").map(Number);
  const formationDate = new Date(year, month - 1, 1);
  const nextRefresh = new Date(year, month, 1); // 1st of following month

  const now = new Date();
  const msRemaining = nextRefresh.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));

  const formationLabel = formationDate.toLocaleDateString("en-US", {
    month: "short", year: "numeric",
  });
  const nextRefreshLabel = nextRefresh.toLocaleDateString("en-US", {
    month: "short", year: "numeric",
  });

  return { formationLabel, nextRefreshLabel, daysRemaining };
}

function TemporalAnchorBar({ historyManifest, loading }: TemporalAnchorBarProps) {
  const { formationLabel, nextRefreshLabel, daysRemaining } = useMemo(
    () => computeTemporalState(historyManifest),
    [historyManifest]
  );

  // Approaching refresh: shift text brightness at ≤7 days — presence cue, not alarm
  const approachingRefresh = daysRemaining != null && daysRemaining <= 7;
  const textColor = approachingRefresh ? "#B8C3CC" : "#7E8A96";

  const daysLabel =
    daysRemaining == null ? "—" :
    daysRemaining === 0 ? "Recalibrating today" :
    daysRemaining === 1 ? "1 day remaining" :
    `${daysRemaining} days remaining`;

  if (loading) return null;

  return (
    <div
      className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border border-[#203754] bg-[#0D2138] px-5 py-2.5 text-[11px]"
      style={{ color: textColor }}
    >
      <span>
        <span className="text-[#7E8A96]">Current structural snapshot anchored to  </span>
        <span className="font-medium" style={{ color: approachingRefresh ? "#EAF0F2" : "#B8C3CC" }}>
          {formationLabel}
        </span>
      </span>
      <span className="text-[#203754]">·</span>
      <span>
        <span className="text-[#7E8A96]">Next scheduled recalibration  </span>
        <span className="font-medium" style={{ color: approachingRefresh ? "#EAF0F2" : "#B8C3CC" }}>
          {nextRefreshLabel}
        </span>
      </span>
      <span className="text-[#203754]">·</span>
      <span style={{ color: approachingRefresh ? "#6DAE8B" : textColor }}>
        {daysLabel}
      </span>
    </div>
  );
}

// ─── Company Drilldown ────────────────────────────────────────────────────────

type DrilldownProps = {
  company: SnapshotRow;
  allData: SnapshotRow[];
  cohortGrid: HistoricalCohortGridPayload | null;
  onClose: () => void;
};

// Map axis3_pct to the financing risk bucket label used in cohort grid.
// Uses the actual panel list from metadata when available (positional quintiles).
// Falls back to quintile breakpoints if not provided.
function axis3Panel(axis3_pct: number | null, panels?: string[]): string {
  const v = axis3_pct ?? 0.5;

  // If we have the actual panel list (5 quintile buckets), use positional mapping
  if (panels && panels.length === 5) {
    if (v < 0.20) return panels[0];
    if (v < 0.40) return panels[1];
    if (v < 0.60) return panels[2];
    if (v < 0.80) return panels[3];
    return panels[4];
  }

  // Fallback: standard quintile labels
  if (v < 0.20) return "Very Low";
  if (v < 0.40) return "Low";
  if (v < 0.60) return "Moderate";
  if (v < 0.80) return "High";
  return "Very High";
}

// Map a percentile score to a bucket label
function pctToBucket(pct: number | null): string {
  if (pct == null) return "—";
  if (pct < 0.2) return "Very Low";
  if (pct < 0.4) return "Low";
  if (pct < 0.6) return "Moderate";
  if (pct < 0.8) return "High";
  return "Very High";
}

// Find the cohort cell matching this company's structural position
function findCohortCell(
  company: SnapshotRow,
  cohortGrid: HistoricalCohortGridPayload | null
): CohortGridCell | null {
  if (!cohortGrid) return null;
  // Pass actual panel strings from metadata so axis3Panel uses live labels
  const panels = cohortGrid.metadata.panels;
  const panel = axis3Panel(company.axis3_pct, panels);
  const axis1Bucket = pctToBucket(company.axis1_pct);
  const axis2Bucket = pctToBucket(company.axis2_pct);

  const matchedPanel = cohortGrid.panels.find(p => p.panel === panel);
  if (!matchedPanel) return null;

  const matchedRow = matchedPanel.rows.find(r => r.axis2_bucket === axis2Bucket);
  if (!matchedRow) return null;

  return matchedRow.cells.find(c => c.axis1_bucket === axis1Bucket) ?? null;
}

// Generate deterministic structural narrative from axis scores
function narrateCompany(company: SnapshotRow): {
  headerRead: string;
  trajectoryProfile: string;
  takeaway: string;
} {
  const a1 = company.axis1_pct ?? 0.5;
  const a2 = company.axis2_pct ?? 0.5;
  const a3 = company.axis3_pct ?? 0.5;
  const bucket = company.composite_bucket ?? "Moderate";

  // Axis 1 driver description
  const anchorRead =
    a1 >= 0.8 ? "severely elevated valuation relative to its operational anchor" :
    a1 >= 0.6 ? "elevated valuation relative to its operational anchor" :
    a1 >= 0.4 ? "moderate valuation stretch relative to its operational anchor" :
    "valuation that is well-supported by its operational anchor";

  // Axis 2 driver description
  const trajectoryRead =
    a2 >= 0.8 ? "rapidly deteriorating operational trajectory" :
    a2 >= 0.6 ? "deteriorating operational trajectory" :
    a2 >= 0.4 ? "mixed operational trajectory" :
    "improving operational trajectory";

  // Axis 3 driver description
  const financingRead =
    a3 >= 0.8 ? "acute financing strain" :
    a3 >= 0.6 ? "meaningful financing pressure" :
    a3 >= 0.4 ? "moderate financing exposure" :
    "limited financing pressure";

  // Primary driver for header read
  const drivers: string[] = [];
  if (a1 >= 0.6) drivers.push("valuation stretch");
  if (a2 >= 0.6) drivers.push("deteriorating trajectory");
  if (a3 >= 0.6) drivers.push("financing strain");

  const driverStr = drivers.length > 0
    ? `driven by ${drivers.join(" and ")}`
    : "with limited single-axis dominance";

  const headerRead = `${bucket} structural risk ${driverStr}.`;

  // Trajectory profile
  const trajectoryProfile =
    a2 >= 0.8 && a1 >= 0.8
      ? "Trajectory is deteriorating while valuation is already highly stretched — an escalation profile. The narrative bridge is lengthening as the operational anchor weakens."
      : a2 >= 0.6 && a1 >= 0.6
      ? "Trajectory is deteriorating within an elevated risk profile. Structural pressure is accumulating on both the valuation and operational dimensions."
      : a2 >= 0.6
      ? "Trajectory is deteriorating. The operational anchor is weakening on a trailing basis, increasing the narrative dependence of the current valuation."
      : a2 < 0.4
      ? "Trajectory is improving. The operational anchor is strengthening on a trailing basis, which shortens the narrative bridge over time."
      : "Trajectory is mixed. No dominant directional bias is present on the operational anchor.";

  // Takeaway
  const takeaway =
    bucket === "Very High"
      ? `This is a high structural risk profile. Valuation depends on ${anchorRead}, the company shows ${trajectoryRead}, and carries ${financingRead}. Historical outcomes for similar structural profiles are unfavorable at the median.`
      : bucket === "High"
      ? `This is an elevated structural risk profile characterized by ${anchorRead} and ${trajectoryRead}. The combination warrants scrutiny before any capital commitment.`
      : bucket === "Moderate"
      ? `This profile shows ${anchorRead} with ${trajectoryRead}. Structural risk is present but not dominant. Company-level context matters here.`
      : `This profile shows ${anchorRead} with ${trajectoryRead}. Structural conditions are currently favorable relative to the broader universe.`;

  return { headerRead, trajectoryProfile, takeaway };
}

function CompanyDrilldown({ company, allData, cohortGrid, onClose }: DrilldownProps) {
  const narrative = narrateCompany(company);
  const cohortCell = findCohortCell(company, cohortGrid);
  const axis1Bucket = pctToBucket(company.axis1_pct);
  const axis2Bucket = pctToBucket(company.axis2_pct);
  const axis3Bucket = pctToBucket(company.axis3_pct);
  // Use live panel strings from metadata — same source as findCohortCell
  const panel = axis3Panel(company.axis3_pct, cohortGrid?.metadata.panels);

  // Position in active universe
  const scorable = allData.filter(r => r.composite_score != null);
  const rank = scorable.filter(r => (r.composite_score ?? 0) > (company.composite_score ?? 0)).length + 1;
  const topRiskPct = scorable.length > 0 ? Math.round((rank / scorable.length) * 100) : null;

  // Axis interpretation text
  const anchorInterp =
    (company.axis1_pct ?? 0) >= 0.8 ? "Valuation is severely elevated relative to demonstrated operating output. The narrative bridge is very long." :
    (company.axis1_pct ?? 0) >= 0.6 ? "Valuation is elevated relative to demonstrated operating output." :
    (company.axis1_pct ?? 0) >= 0.4 ? "Valuation stretch is moderate. Operational support is partial." :
    "Valuation is well-supported by demonstrated operational output.";

  const trajectoryInterp =
    (company.axis2_pct ?? 0) >= 0.8 ? "Operational anchor is weakening rapidly on a trailing basis." :
    (company.axis2_pct ?? 0) >= 0.6 ? "Operational anchor is deteriorating on a trailing basis." :
    (company.axis2_pct ?? 0) >= 0.4 ? "Operational trajectory is mixed — no clear directional signal." :
    "Operational anchor is strengthening on a trailing basis.";

  const financingInterp =
    (company.axis3_pct ?? 0) >= 0.8 ? "Balance sheet flexibility is severely constrained. Structural narrative depends on continued financing access." :
    (company.axis3_pct ?? 0) >= 0.6 ? "Financing pressure is meaningful. Obligation coverage leaves limited margin." :
    (company.axis3_pct ?? 0) >= 0.4 ? "Financing exposure is moderate." :
    "Balance sheet flexibility is sufficient. Financing risk is not a primary structural concern.";

  const axis2Direction = (company.axis2_pct ?? 0.5) > 0.5 ? "deteriorating" : "improving";
  const axis2DirectionColor = axis2Direction === "deteriorating" ? COLORS.negativeSoft : COLORS.positiveSoft;

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      {/* Panel — restrained entrance: short slide from right, opacity, no bounce */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative h-full w-full max-w-xl overflow-y-auto"
        style={{ background: "#071629", borderLeft: "1px solid #203754" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-[#203754] bg-[#0D2138] p-1.5 text-[#7E8A96] transition hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="px-7 py-8 space-y-6">

          {/* Layer transition — orients user within system hierarchy */}
          <p className="text-[11px] text-[#7E8A96] leading-[1.6]">
            This is the individual structural profile behind the market positioning you observed.
          </p>

          {/* ── Section 1: Header ── */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7E8A96] mb-2">
              Structural Profile
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold text-white">{company.symbol}</h2>
                <p className="mt-1 text-sm text-[#7E8A96]">{company.oal_label ?? "—"}</p>
              </div>
              <div className="text-right shrink-0">
                <div
                  className="text-lg font-semibold"
                  style={{ color: compositeColor(company.composite_bucket) }}
                >
                  {company.composite_bucket}
                </div>
                <div className="text-xs text-[#7E8A96]">
                  {company.composite_score != null ? company.composite_score.toFixed(3) : "—"}
                </div>
              </div>
            </div>
            {/* One-line structural read */}
            <div className="mt-4 rounded-xl border border-[#203754] bg-[#0A1F3D] px-4 py-3">
              <p className="text-[13px] leading-[1.7] text-[#B8C3CC]">{narrative.headerRead}</p>
            </div>
          </div>

          <div className="border-t border-[#203754]" />

          {/* ── Section 2: Three-Axis Breakdown ── */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7E8A96] mb-3">
              Axis Breakdown
            </div>
            <div className="space-y-3">

              {/* Anchor Risk */}
              <div className="rounded-xl border border-[#203754] bg-[#0A1F3D] px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7E8A96]">Operational Anchor Risk</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: compositeColor(axis1Bucket), backgroundColor: `${compositeColor(axis1Bucket)}20` }}
                  >
                    {axis1Bucket}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-1.5 flex-1 rounded-full bg-[#203754] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${((company.axis1_pct ?? 0) * 100).toFixed(0)}%`, backgroundColor: compositeColor(axis1Bucket) }}
                    />
                  </div>
                  <span className="text-xs text-[#7E8A96] shrink-0">
                    {company.axis1_pct != null ? `${(company.axis1_pct * 100).toFixed(0)}th pct` : "—"}
                  </span>
                </div>
                <p className="text-[12px] leading-[1.65] text-[#8DAFC8]">{anchorInterp}</p>
              </div>

              {/* Trajectory Risk */}
              <div className="rounded-xl border border-[#203754] bg-[#0A1F3D] px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7E8A96]">Operational Trajectory Risk</span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: axis2DirectionColor }}
                  >
                    {axis2Direction}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-1.5 flex-1 rounded-full bg-[#203754] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${((company.axis2_pct ?? 0) * 100).toFixed(0)}%`, backgroundColor: compositeColor(axis2Bucket) }}
                    />
                  </div>
                  <span className="text-xs text-[#7E8A96] shrink-0">
                    {company.axis2_pct != null ? `${(company.axis2_pct * 100).toFixed(0)}th pct` : "—"}
                  </span>
                </div>
                <p className="text-[12px] leading-[1.65] text-[#8DAFC8]">{trajectoryInterp}</p>
              </div>

              {/* Financing Risk */}
              <div className="rounded-xl border border-[#203754] bg-[#0A1F3D] px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7E8A96]">Operational Financing Risk</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: compositeColor(axis3Bucket), backgroundColor: `${compositeColor(axis3Bucket)}20` }}
                  >
                    {axis3Bucket}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-1.5 flex-1 rounded-full bg-[#203754] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${((company.axis3_pct ?? 0) * 100).toFixed(0)}%`, backgroundColor: compositeColor(axis3Bucket) }}
                    />
                  </div>
                  <span className="text-xs text-[#7E8A96] shrink-0">
                    {company.axis3_pct != null ? `${(company.axis3_pct * 100).toFixed(0)}th pct` : "—"}
                  </span>
                </div>
                <p className="text-[12px] leading-[1.65] text-[#8DAFC8]">{financingInterp}</p>
              </div>

            </div>
          </div>

          <div className="border-t border-[#203754]" />

          {/* ── Section 3: Position in Market ── */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7E8A96] mb-3">
              Position in Market
            </div>
            <div className="rounded-xl border border-[#203754] bg-[#0A1F3D] px-4 py-4">
              {topRiskPct != null ? (
                <p className="text-[13px] leading-[1.7] text-[#B8C3CC]">
                  This company ranks in the top{" "}
                  <span className="font-semibold text-white">{topRiskPct}%</span>{" "}
                  of structural risk in the active universe ({formatNum(scorable.length)} companies scored under active filters).
                </p>
              ) : (
                <p className="text-[13px] text-[#7E8A96]">Position data unavailable.</p>
              )}
              {company.risk_bucket_within_oal && (
                <p className="mt-2 text-[12px] text-[#7E8A96]">
                  Within {company.oal_label}: <span className="text-[#B8C3CC]">{company.risk_bucket_within_oal}</span> valuation bucket.
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-[#203754]" />

          {/* ── Section 4: Cohort Context ── */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7E8A96] mb-3">
              Historical Cohort Context
            </div>
            {cohortCell && !cohortCell.suppressed ? (
              <div className="rounded-xl border border-[#203754] bg-[#0A1F3D] px-4 py-4">
                <p className="mb-4 text-[12px] text-[#7E8A96]">
                  Matched to cohort: <span className="text-[#B8C3CC]">{panel}</span> ·{" "}
                  Anchor Risk <span className="text-[#B8C3CC]">{axis1Bucket}</span> ·{" "}
                  Trajectory Risk <span className="text-[#B8C3CC]">{axis2Bucket}</span> ·{" "}
                  Financing Risk <span className="text-[#B8C3CC]">{axis3Bucket}</span>
                </p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Median Return", value: formatPctSigned(cohortCell.median_return) },
                    { label: "Hit Rate", value: formatPct(cohortCell.hit_rate) },
                    { label: "Observations", value: formatNum(cohortCell.count) },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-lg border border-[#203754] bg-[#071629] px-3 py-3 text-center">
                      <div className="text-[17px] font-semibold text-white">{stat.value}</div>
                      <div className="mt-0.5 text-[9px] uppercase tracking-wide text-[#7E8A96]">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[12px] leading-[1.65] text-[#8DAFC8]">
                  Companies in similar structural states have historically produced{" "}
                  <span className="font-semibold text-white">{formatPctSigned(cohortCell.median_return)}</span>{" "}
                  median returns over {cohortGrid?.metadata.horizon_months ?? 12} months, with a{" "}
                  <span className="font-semibold text-white">{formatPct(cohortCell.hit_rate)}</span>{" "}
                  hit rate ({formatNum(cohortCell.count)} observations).
                  {skewSignal(cohortCell) === "right" && (
                    <> Mean is materially higher ({formatPctSigned(cohortCell.mean_return)}) — distribution is right-skewed by a small number of large winners.</>
                  )}
                  {skewSignal(cohortCell) === "left" && (
                    <> Mean is materially lower ({formatPctSigned(cohortCell.mean_return)}) — distribution is left-skewed by outsized losses in a subset of cases.</>
                  )}
                </p>
              </div>
            ) : cohortCell?.suppressed ? (
              <div className="rounded-xl border border-[#203754] bg-[#0A1F3D] px-4 py-4">
                <p className="text-[12px] text-[#7E8A96]">
                  Cohort cell suppressed — insufficient observations for this structural profile.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#203754] bg-[#0A1F3D] px-4 py-4">
                <p className="text-[12px] text-[#7E8A96]">
                  No cohort match found for this structural profile.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[#203754]" />

          {/* ── Section 5: Trajectory Context ── */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7E8A96] mb-3">
              Trajectory Context
            </div>
            <div className="rounded-xl border border-[#203754] bg-[#0A1F3D] px-4 py-4">
              <p className="text-[13px] leading-[1.7] text-[#B8C3CC]">{narrative.trajectoryProfile}</p>
            </div>
          </div>

          <div className="border-t border-[#203754]" />

          {/* ── Section 6: Structural Takeaway ── */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6DAE8B] mb-3">
              Structural Takeaway
            </div>
            <div
              className="rounded-xl px-5 py-5"
              style={{ background: "#0A1F3D", border: "1px solid #2E4D6A" }}
            >
              <p className="text-[13px] leading-[1.8] text-[#B8C3CC]">{narrative.takeaway}</p>
            </div>
          </div>

          {/* Bottom padding */}
          <div className="h-6" />

        </div>
      </motion.div>
    </div>
  );
}

// ─── Interpretive Layer ───────────────────────────────────────────────────────

type InterpretiveLayerProps = {
  data: SnapshotRow[];
  loading: boolean;
};

function interpretDistribution(data: SnapshotRow[]): {
  headline: string;
  body: string;
  consequence: string;
  tone: "elevated" | "moderate" | "subdued";
} {
  if (data.length === 0) return { headline: "—", body: "No data available under active filters.", consequence: "", tone: "moderate" };

  const veryHighCount = data.filter(r => r.composite_bucket === "Very High").length;
  const highCount = data.filter(r => r.composite_bucket === "High").length;
  const veryLowCount = data.filter(r => r.composite_bucket === "Very Low").length;
  const lowCount = data.filter(r => r.composite_bucket === "Low").length;

  const veryHighPct = veryHighCount / data.length;
  const elevatedPct = (veryHighCount + highCount) / data.length;
  const resilientPct = (veryLowCount + lowCount) / data.length;

  if (veryHighPct >= 0.25) {
    return {
      headline: `${(veryHighPct * 100).toFixed(0)}% of the filtered universe is in the Very High composite bucket`,
      body: `An unusually high proportion of companies currently carry maximum structural risk. ${(elevatedPct * 100).toFixed(0)}% are in the High or Very High bucket combined — structural fragility is broadly distributed, not isolated to a specific segment.`,
      consequence: `When fragility is this broadly distributed, sector or factor diversification provides limited structural protection. The risk is systemic across the filtered universe, not idiosyncratic.`,
      tone: "elevated",
    };
  }
  if (veryHighPct >= 0.15) {
    return {
      headline: `${(veryHighPct * 100).toFixed(0)}% of the filtered universe is in the Very High composite bucket`,
      body: `Structural risk is currently present but not dominant. ${(elevatedPct * 100).toFixed(0)}% carry elevated composite risk (High or Very High), while ${(resilientPct * 100).toFixed(0)}% sit in the lower two buckets.`,
      consequence: `The distribution is mixed — elevated names warrant closer scrutiny, but lower-risk companies remain available within the same universe as an alternative.`,
      tone: "moderate",
    };
  }
  return {
    headline: `${(veryHighPct * 100).toFixed(0)}% of the filtered universe is in the Very High composite bucket`,
    body: `Structural risk is currently contained. The majority of companies are anchored at lower composite risk levels — ${(resilientPct * 100).toFixed(0)}% sit in the Very Low or Low bucket.`,
    consequence: `A contained distribution does not eliminate structural risk within individual names — it means the aggregate exposure is lower. Company-level scrutiny remains warranted for any name in the elevated buckets.`,
    tone: "subdued",
  };
}

function interpretConcentration(data: SnapshotRow[]): {
  headline: string;
  body: string;
  consequence: string;
  clusterType: "valuation-stretch" | "financing-fragility" | "compound" | "none";
} {
  if (data.length === 0) return { headline: "—", body: "No data available under active filters.", consequence: "", clusterType: "none" };

  const elevated = data.filter(r => r.composite_bucket === "Very High" || r.composite_bucket === "High");

  if (elevated.length === 0) {
    return {
      headline: "No elevated-risk concentration under active filters",
      body: "The current filtered universe does not show meaningful clustering in the High or Very High composite buckets.",
      consequence: "Structural stress is not concentrated enough to warrant cluster-level focus. Individual name analysis applies.",
      clusterType: "none",
    };
  }

  const oalCounts: Record<string, number> = {};
  elevated.forEach(r => {
    const label = r.oal_label ?? "Unknown";
    oalCounts[label] = (oalCounts[label] ?? 0) + 1;
  });
  const topOAL = Object.entries(oalCounts).sort((a, b) => b[1] - a[1])[0];
  const topOALPct = ((topOAL[1] / elevated.length) * 100).toFixed(0);

  const avgAxis1 = elevated.reduce((s, r) => s + (r.axis1_pct ?? 0), 0) / elevated.length;
  const avgAxis3 = elevated.reduce((s, r) => s + (r.axis3_pct ?? 0), 0) / elevated.length;

  const axis1Elevated = avgAxis1 >= 0.65;
  const axis3Elevated = avgAxis3 >= 0.65;

  let clusterType: "valuation-stretch" | "financing-fragility" | "compound";
  let driverLabel: string;
  let consequence: string;

  if (axis1Elevated && axis3Elevated) {
    clusterType = "compound";
    driverLabel = "both Operational Anchor Risk and Operational Financing Risk";
    consequence = `Compound risk clusters — where valuation is stretched and financing is strained simultaneously — are the most structurally exposed. These names have limited margin of safety on both sides.`;
  } else if (axis1Elevated) {
    clusterType = "valuation-stretch";
    driverLabel = "Operational Anchor Risk";
    consequence = `Valuation-stretch clusters indicate overvaluation risk relative to demonstrated operational output. The primary concern is narrative dependence — if market confidence in future delivery weakens, repricing pressure follows.`;
  } else {
    clusterType = "financing-fragility";
    driverLabel = "Operational Financing Risk";
    consequence = `Financing-driven clusters indicate solvency exposure rather than overvaluation. These companies may be reasonably valued but are structurally dependent on continued market access to service obligations — a condition that can change quickly.`;
  }

  return {
    headline: `Elevated risk is most concentrated among ${topOAL[0]}-anchored companies`,
    body: `${topOALPct}% of the High and Very High composite companies are ${topOAL[0]}-anchored. The primary structural driver within this cluster is ${driverLabel}.`,
    consequence,
    clusterType,
  };
}

function interpretTrajectory(
  data: SnapshotRow[],
  distributionTone: "elevated" | "moderate" | "subdued"
): {
  headline: string;
  body: string;
  consequence: string;
  direction: "deteriorating" | "improving" | "mixed";
  regime: "escalation" | "stabilization" | "accumulation" | "health" | "mixed";
} {
  if (data.length === 0) return {
    headline: "—",
    body: "No data available under active filters.",
    consequence: "",
    direction: "mixed",
    regime: "mixed",
  };

  const scorable = data.filter(r => r.axis2_pct != null);
  if (scorable.length === 0) return {
    headline: "Trajectory data unavailable",
    body: "Axis II scores are not present in the current snapshot.",
    consequence: "",
    direction: "mixed",
    regime: "mixed",
  };

  const deteriorating = scorable.filter(r => (r.axis2_pct ?? 0) > 0.5).length;
  const improving = scorable.filter(r => (r.axis2_pct ?? 0) <= 0.5).length;
  const deterioratingPct = (deteriorating / scorable.length) * 100;
  const improvingPct = (improving / scorable.length) * 100;

  let regime: "escalation" | "stabilization" | "accumulation" | "health" | "mixed";
  if (deterioratingPct >= 60 && distributionTone === "elevated") {
    regime = "escalation";
  } else if (improvingPct >= 60 && distributionTone === "elevated") {
    regime = "stabilization";
  } else if (deterioratingPct >= 60 && distributionTone === "subdued") {
    regime = "accumulation";
  } else if (improvingPct >= 60 && distributionTone === "subdued") {
    regime = "health";
  } else {
    regime = "mixed";
  }

  const regimeConsequence: Record<typeof regime, string> = {
    escalation: `Combined with the current elevated distribution, this is an escalation signal — structural risk is both broadly present and actively accumulating. This regime historically precedes the widest dispersion in forward outcomes.`,
    stabilization: `Despite elevated current distribution, improving trajectory is a structural stabilization signal — fragility may be peaking rather than expanding. This does not eliminate current risk, but it changes its directional character.`,
    accumulation: `Even though current distribution appears contained, deteriorating trajectory means structural risk is accumulating quietly. Early-stage accumulation is harder to see and easier to underestimate.`,
    health: `Both distribution and trajectory are constructive — current risk is contained and the underlying anchors are strengthening. This is the most favorable structural regime in the system.`,
    mixed: `The interaction between current distribution and trajectory does not produce a clear regime signal. Structural conditions are heterogeneous — company-level analysis is more informative than aggregate positioning.`,
  };

  if (deterioratingPct >= 60) {
    return {
      headline: `${deterioratingPct.toFixed(0)}% of scored companies show deteriorating operational trajectory`,
      body: `The majority of the filtered universe is in the upper half of Axis II — meaning their operational anchor metrics are currently weakening on a trailing basis. Companies moving toward shallower anchors accumulate structural risk over time regardless of current valuation levels.`,
      consequence: regimeConsequence[regime],
      direction: "deteriorating",
      regime,
    };
  }
  if (improvingPct >= 60) {
    return {
      headline: `${improvingPct.toFixed(0)}% of scored companies show improving operational trajectory`,
      body: `The majority of the filtered universe is in the lower half of Axis II — meaning their operational anchor metrics are currently strengthening on a trailing basis. A universe tilted toward improving trajectory carries lower structural risk over time, all else equal.`,
      consequence: regimeConsequence[regime],
      direction: "improving",
      regime,
    };
  }
  return {
    headline: `Trajectory is mixed — ${deterioratingPct.toFixed(0)}% deteriorating, ${improvingPct.toFixed(0)}% improving`,
    body: `The filtered universe is currently split between companies whose operational anchors are strengthening and those where they are weakening. No dominant directional bias is present.`,
    consequence: regimeConsequence["mixed"],
    direction: "mixed",
    regime: "mixed",
  };
}

function InterpretiveLayer({ data, loading }: InterpretiveLayerProps) {
  const distribution = useMemo(() => interpretDistribution(data), [data]);
  const concentration = useMemo(() => interpretConcentration(data), [data]);
  const trajectory = useMemo(() => interpretTrajectory(data, distribution.tone), [data, distribution.tone]);

  const toneColor = {
    elevated: "#BC6464",
    moderate: "#B8C3CC",
    subdued: "#6DAE8B",
  };

  const directionColor = {
    deteriorating: "#BC6464",
    improving: "#6DAE8B",
    mixed: "#B8C3CC",
  };

  const regimeBadge: Record<string, { label: string; color: string }> = {
    escalation:    { label: "Escalation",        color: "#BC6464" },
    stabilization: { label: "Stabilization",     color: "#6DAE8B" },
    accumulation:  { label: "Accumulation",      color: "#E8A87C" },
    health:        { label: "Structural Health", color: "#6DAE8B" },
    mixed:         { label: "Mixed",             color: "#7E8A96" },
  };

  if (loading) {
    return (
      <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
        <CardHeader>
          <CardTitle className="text-white">Current Market Interpretation</CardTitle>
          <CardDescription className="text-[#B8C3CC]">Computing structural signals...</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border border-[#203754] bg-[#0D2138]" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const regime = regimeBadge[trajectory.regime];

  return (
    <Card
      className="rounded-3xl shadow-xl shadow-black/40"
      style={{
        borderLeft: "2px solid #3E8E6A",
        border: "1px solid #2E4D6A",
        background: "#061425",
        boxShadow: "0 0 0 1px rgba(62,142,106,0.15), 0 20px 40px rgba(0,0,0,0.4)",
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {/* Renamed: Interpretive Layer → Current Market Interpretation */}
            <CardTitle className="text-white">Current Market Interpretation</CardTitle>
            {/* Single non-predictive framing — no duplicate */}
            <CardDescription className="mt-1 text-[#B8C3CC]">
              The system's current read of market structure under the active filters. These describe current structural conditions. They do not forecast outcomes.
            </CardDescription>
            {/* Primacy instruction — first thing to consult on every session */}
            <p className="mt-2 text-[12px] font-medium text-[#6DAE8B]">
              Start here. This is the system's current read before you inspect the map or any company.
            </p>
          </div>
          {/* Regime badge */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#7E8A96]">Current Regime</div>
            <div
              className="rounded-full border px-5 py-2 text-base font-semibold"
              style={{ borderColor: `${regime.color}60`, color: regime.color, backgroundColor: `${regime.color}20` }}
            >
              {regime.label}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-2 md:grid-cols-3">

        {/* Distribution — staggered mount: panel 1 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0, ease: "easeOut" }}
          className="flex flex-col rounded-2xl border border-[#203754] bg-[#0A1F3D] p-4"
        >
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#7E8A96]">Distribution</div>
          <div className="mb-2 text-sm font-semibold leading-snug" style={{ color: toneColor[distribution.tone] }}>
            {distribution.tone === "elevated"
              ? "Risk is broadly elevated"
              : distribution.tone === "subdued"
              ? "Risk is currently contained"
              : "Risk is present but mixed"}
          </div>
          <div className="mb-3 text-[13px] leading-[1.7] text-[#B8C3CC]">
            {distribution.headline.toLowerCase().startsWith("—") ? distribution.body : `${distribution.headline}. ${distribution.body}`}
          </div>
          {distribution.consequence && (
            <div className="mt-auto border-t border-[#203754] pt-3 text-[12px] leading-[1.65] text-[#7E8A96]">
              {distribution.consequence}
            </div>
          )}
        </motion.div>

        {/* Concentration — staggered mount: panel 2 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
          className="flex flex-col rounded-2xl border border-[#203754] bg-[#0A1F3D] p-4"
        >
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#7E8A96]">Concentration</div>
          <div className="mb-2 text-sm font-semibold leading-snug text-[#EAF0F2]">
            {concentration.clusterType === "compound"
              ? "Compound risk — valuation and financing both strained"
              : concentration.clusterType === "valuation-stretch"
              ? "Valuation-stretch cluster dominant"
              : concentration.clusterType === "financing-fragility"
              ? "Financing-fragility cluster dominant"
              : "No elevated concentration"}
          </div>
          <div className="mb-3 text-[13px] leading-[1.7] text-[#B8C3CC]">{concentration.body}</div>
          {concentration.consequence && (
            <div className="mt-auto border-t border-[#203754] pt-3 text-[12px] leading-[1.65] text-[#7E8A96]">
              {concentration.consequence}
            </div>
          )}
        </motion.div>

        {/* Trajectory — staggered mount: panel 3 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.16, ease: "easeOut" }}
          className="flex flex-col rounded-2xl border border-[#203754] bg-[#0A1F3D] p-4"
        >
          <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#7E8A96]">Trajectory</div>
          <div className="mb-2 text-sm font-semibold leading-snug" style={{ color: directionColor[trajectory.direction] }}>
            {trajectory.direction === "deteriorating"
              ? "Universe is deteriorating in aggregate"
              : trajectory.direction === "improving"
              ? "Universe is improving in aggregate"
              : "Trajectory is mixed"}
          </div>
          <div className="mb-3 text-[13px] leading-[1.7] text-[#B8C3CC]">{trajectory.body}</div>
          {trajectory.consequence && (
            <div className="mt-auto border-t border-[#203754] pt-3 text-[12px] leading-[1.65] text-[#7E8A96]">
              {trajectory.consequence}
            </div>
          )}
        </motion.div>

      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlatformPage() {
  const [snapshotData, setSnapshotData] = useState<SnapshotRow[]>([]);
  const [oalSummary, setOALSummary] = useState<OALSummaryRow[]>([]);
  const [liquiditySummary, setLiquiditySummary] = useState<LiquiditySummaryRow[]>([]);
  const [historyManifest, setHistoryManifest] = useState<HistoryManifestRow[]>([]);
  const [cohortGrid, setCohortGrid] = useState<HistoricalCohortGridPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedOAL, setSelectedOAL] = useState("All");
  const [selectedBucket, setSelectedBucket] = useState("All");
  const [search, setSearch] = useState("");
  const [cohortMetric, setCohortMetric] = useState<CohortMetric>("median_return");
  const [selectedCompany, setSelectedCompany] = useState<SnapshotRow | null>(null);
  const [selectedAxis3, setSelectedAxis3] = useState("Very High");
  const axis3Direction = React.useRef<"forward" | "back">("forward");
  const [mapDecile, setMapDecile] = useState(1);
  const mapScrollLocked = React.useRef(false);
  const mapChartRef = React.useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapDims, setMapDims] = useState({ width: 800, height: 580 });

  useEffect(() => {
    Promise.all([
      fetch("/data/osmr_snapshot.json").then(res => { if (!res.ok) throw new Error(`snapshot: ${res.status}`); return res.json(); }),
      fetch("/data/oal_summary.json").then(res => { if (!res.ok) throw new Error(`oal summary: ${res.status}`); return res.json(); }),
      fetch("/data/liquidity_summary.json").then(res => { if (!res.ok) throw new Error(`liquidity: ${res.status}`); return res.json(); }),
      fetch("/data/history_manifest.json").then(res => { if (!res.ok) throw new Error(`history: ${res.status}`); return res.json(); }),
      fetch("/data/historical_cohort_grids.json").then(res => { if (!res.ok) throw new Error(`cohort grids: ${res.status}`); return res.json(); }),
    ])
      .then(([snapshot, oal, liquidity, history, grids]) => {
        setSnapshotData(snapshot);
        setOALSummary(oal);
        setLiquiditySummary(liquidity);
        setHistoryManifest(history);
        setCohortGrid(grids);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // Track map container dimensions for dot overlay coordinate mapping
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setMapDims({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [loading]);

  // Non-passive wheel listener on the map chart div — prevents page scroll.
  // Depends on `loading` so it attaches after the chart renders and the ref is populated.
  useEffect(() => {
    const el = mapChartRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (mapScrollLocked.current) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      setMapDecile(prev => Math.min(10, Math.max(1, prev + dir)));
      mapScrollLocked.current = true;
      setTimeout(() => { mapScrollLocked.current = false; }, 260);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [loading]);

  const filtered = useMemo(() => {
    return snapshotData.filter(row => {
      const matchOAL = selectedOAL === "All" || row.oal_label === selectedOAL;
      const matchBucket = selectedBucket === "All" || row.composite_bucket === selectedBucket;
      const matchSearch = !search || row.symbol.toLowerCase().includes(search.toLowerCase());
      return matchOAL && matchBucket && matchSearch;
    });
  }, [snapshotData, selectedOAL, selectedBucket, search]);

  const topRisk = useMemo(() => {
    return [...filtered]
      .filter(r => r.composite_score != null)
      .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
      .slice(0, 12);
  }, [filtered]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const avgComposite = total > 0
      ? filtered.reduce((acc, row) => acc + (row.composite_score ?? 0), 0) / total
      : null;
    const veryHigh = filtered.filter(r => r.composite_bucket === "Very High").length;
    const fragile = filtered.filter(r => (r.axis3_pct ?? 0) >= 0.8).length;
    return { total, avgComposite, veryHigh, fragile };
  }, [filtered]);

  const scatterData = useMemo(() => {
    const scorable = filtered.filter(row => row.axis1_pct != null && row.axis2_pct != null);

    return scorable.map(row => {
      const a3 = row.axis3_pct ?? 0.5;
      // Decile 1 = highest Axis III risk (0.9–1.0), decile 10 = lowest (0.0–0.1)
      const axis3_decile = Math.min(10, Math.max(1, 10 - Math.floor(a3 * 10)));

      // Axis III jitter on X axis — encodes Z depth as a subtle horizontal shadow.
      // High financing risk (surface, decile 1) nudges right.
      // Low financing risk (deep interior, decile 10) nudges left.
      // Loose correlation with Axis II breaks vertical stripes without being pure noise.
      const jitter = (a3 - 0.5) * 0.08; // range: -0.04 to +0.04

      return {
        x: Math.min(1, Math.max(0, (row.axis2_pct as number) + jitter)),
        y: row.axis1_pct as number,
        axis3_decile,
        axis3_pct: a3,
        symbol: row.symbol,
        oal_label: row.oal_label,
        composite_bucket: row.composite_bucket,
        composite_score: row.composite_score ?? 0.5,
      };
    });
  }, [filtered]);

  const clearFilters = () => { setSelectedOAL("All"); setSelectedBucket("All"); setSearch(""); };

  return (
    <div className="min-h-screen bg-[#0A1F3D] text-[#EAF0F2]">
      {/* Company Drilldown — renders as overlay when a company is selected */}
      {selectedCompany && (
        <CompanyDrilldown
          company={selectedCompany}
          allData={filtered}
          cohortGrid={cohortGrid}
          onClose={() => setSelectedCompany(null)}
        />
      )}
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 max-w-5xl"
        >
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Badge className="rounded-full border border-[#203754] bg-[#0D2138] px-3 py-1 text-[#B8C3CC] hover:bg-[#0D2138]">
              OSMR System
            </Badge>
            <Badge className="rounded-full border border-[#3E8E6A]/50 bg-[#3E8E6A]/10 px-3 py-1 text-[#6DAE8B] hover:bg-[#3E8E6A]/10">
              Live System
            </Badge>
          </div>

          <h1 className="tcs-heading text-5xl font-semibold leading-tight text-white md:text-6xl">
            A structural map of the equity market.
          </h1>

          {/* Action-oriented opening — tells user what to do, not just what the system is */}
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#B8C3CC]">
            Use this system to identify where structural risk is concentrated, isolate the companies driving it, and see how those conditions have historically resolved.
          </p>

          {/* Product authority line — establishes this as the operating surface */}
          <p className="mt-3 max-w-xl text-sm font-medium text-[#EAF0F2]">
            This is the live analytical surface of the system.
          </p>

          {/* Supporting notation — demoted visually */}
          <p className="mt-1.5 max-w-xl text-xs text-[#7E8A96]">
            Higher scores = higher structural fragility. Lower scores = stronger operating support.
          </p>

          {/* Axis translation block */}
          <div className="mt-5 inline-flex flex-wrap gap-x-6 gap-y-2 rounded-2xl border border-[#203754] bg-[#0D2138] px-5 py-3 text-[12px] text-[#7E8A96]">
            <span className="font-medium text-[#B8C3CC]">How to read this system:</span>
            <span><span className="text-[#EAF0F2]">Anchor Risk</span> = valuation vs real operating support</span>
            <span><span className="text-[#EAF0F2]">Trajectory Risk</span> = improving vs deteriorating</span>
            <span><span className="text-[#EAF0F2]">Financing Risk</span> = balance sheet pressure</span>
          </div>

          {/* System loop orientation — connects tabs to each other */}
          <p className="mt-4 max-w-3xl text-sm text-[#7E8A96]">
            The market map shows current positioning. The snapshot shows individual companies. The cohort grids show how similar structural states have historically performed.
          </p>
        </motion.div>

        {/* ── Temporal Anchor Bar ── */}
        <TemporalAnchorBar historyManifest={historyManifest} loading={loading} />

        {/* ── Start Here ── */}
        <Card
          className="mb-10 rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20"
          style={{ borderLeft: "2px solid #244636" }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Start Here</CardTitle>
            <CardDescription className="text-[#B8C3CC]">
              Follow this sequence on your first visit. Each step builds on the previous one.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#244636] text-[10px] font-semibold text-white">1</span>
                <div className="font-medium text-white">Market Map</div>
              </div>
              {/* Directive, not explanatory */}
              <div className="text-sm leading-6 text-[#B8C3CC]">
                Start here to see where structural risk is concentrated right now. The Current Market Interpretation gives you the system's read in plain language before you go to the map.
              </div>
            </div>
            <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#244636] text-[10px] font-semibold text-white">2</span>
                <div className="font-medium text-white">Snapshot</div>
              </div>
              {/* Causal: isolate the companies driving that risk */}
              <div className="text-sm leading-6 text-[#B8C3CC]">
                Use this to isolate the specific companies driving the risk you identified in the market map. Filter by anchor level or composite bucket to narrow your focus.
              </div>
            </div>
            <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#244636] text-[10px] font-semibold text-white">3</span>
                <div className="font-medium text-white">Cohort Grids</div>
              </div>
              {/* Closes the loop: how have these conditions historically resolved */}
              <div className="text-sm leading-6 text-[#B8C3CC]">
                Use the cohort grids in the Market Map tab to see how companies in similar structural states have historically resolved — 12-month forward returns by risk profile.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Global Filters ── */}
        <Card className="mb-10 rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#B8C3CC]" />
                  <CardTitle className="text-white">Global Filters</CardTitle>
                </div>
                {/* Explicit: filters redefine the system */}
                <CardDescription className="text-[#B8C3CC]">
                  Filters redefine the universe being analyzed. All outputs below — the map, cohort grids, snapshot, and supporting views — update accordingly.
                </CardDescription>
                <div className="mt-3 text-sm text-[#7E8A96]">
                  OAL = Operational Anchor Ladder — groups companies by the depth of their demonstrated operating support.
                </div>
              </div>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="rounded-2xl border-[#203754] bg-transparent text-[#B8C3CC] hover:bg-[#0D2138] hover:text-white"
              >
                Clear Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#7E8A96]" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search ticker"
                  className="rounded-2xl border-[#203754] bg-[#0D2138] pl-9 text-white placeholder:text-[#7E8A96]"
                />
              </div>
              <Select value={selectedOAL} onValueChange={setSelectedOAL}>
                <SelectTrigger className="rounded-2xl border-[#203754] bg-[#0D2138] text-white">
                  <SelectValue placeholder="OAL" />
                </SelectTrigger>
                <SelectContent className="border-[#203754] bg-[#0D2138] text-white">
                  <SelectItem value="All">All OALs</SelectItem>
                  {oalOrder.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                <SelectTrigger className="rounded-2xl border-[#203754] bg-[#0D2138] text-white">
                  <SelectValue placeholder="Composite Bucket" />
                </SelectTrigger>
                <SelectContent className="border-[#203754] bg-[#0D2138] text-white">
                  <SelectItem value="All">All Composite Buckets</SelectItem>
                  {bucketOrder.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ── KPI Strip ── */}
        <div className="mb-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-3xl bg-[#112A47] shadow-xl shadow-black/20" style={{ border: "1.5px solid rgba(62,142,106,0.55)" }}>
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B8C3CC]">Structural Stress</CardDescription>
              <CardTitle className="text-4xl text-white">
                {loading ? "…" : formatNum(stats.veryHigh)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7E8A96]">
              Companies in the Very High composite bucket under active filters.
              {/* Delta row — shown when prior-month export is available */}
              {/* Replace null below with prior-month veryHigh value when pipeline exports it */}
              <KPIDelta current={stats.veryHigh} previous={null} higherIsBad={true} />
            </CardContent>
          </Card>
          <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B8C3CC]">Financing Stress (Top Quintile)</CardDescription>
              <CardTitle className="text-3xl text-white">
                {loading ? "…" : formatNum(stats.fragile)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7E8A96]">
              Companies with Axis 3 at or above the 80th percentile — high obligation strain.
              <KPIDelta current={stats.fragile} previous={null} higherIsBad={true} />
            </CardContent>
          </Card>
          <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B8C3CC]">Active Universe</CardDescription>
              <CardTitle className="text-3xl text-white">
                {loading ? "…" : formatNum(stats.total)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7E8A96]">
              Companies currently scored under active filters.
              <KPIDelta current={stats.total} previous={null} higherIsBad={false} />
            </CardContent>
          </Card>
          <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B8C3CC]">Average Risk Level</CardDescription>
              <CardTitle className="text-3xl text-white">
                {loading ? "…" : formatPct(stats.avgComposite)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7E8A96]">
              Mean composite structural risk score across the filtered universe.
              <KPIDelta current={stats.avgComposite} previous={null} higherIsBad={true} isDecimal={true} />
            </CardContent>
          </Card>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="market-map" className="space-y-10">
          <TabsList className="flex w-full gap-2 border-b border-[#203754] bg-transparent p-0">
            {[
              ["market-map", "Market Map"],
              ["snapshot", "Snapshot"],
              ["oal", "OAL Structure"],
              ["liquidity", "Financing Context"],
              ["history", "History"],
            ].map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-none border-b-2 border-transparent px-4 py-3 text-[#B8C3CC] data-[state=active]:border-[#41506A] data-[state=active]:bg-[#0D2138] data-[state=active]:text-white"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <p className="text-[11px] text-[#7E8A96]">
            Every tab reflects the same structural model through a different analytical lens.
          </p>

          {/* ══════════════════════════════════════════════════════════════════
              MARKET MAP TAB
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="market-map" className="space-y-8">

            {/* Current Market Interpretation — top layer of the product */}
            <div className="mb-16 mt-2">
              <InterpretiveLayer data={filtered} loading={loading} />
            </div>

            {/* Divider + transition line — signals entry into the map layer */}
            <div className="border-t border-[#203754] pt-6">
              <p className="mb-5 text-sm text-[#7E8A96]">
                The map below shows the structural positioning behind this interpretation.
              </p>
            </div>

            {/* Section header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Layers3 className="h-5 w-5 text-[#B8C3CC]" />
                <h2 className="text-xl font-semibold text-white">Current State of the Market</h2>
              </div>
              <div className="max-w-4xl text-sm leading-7 text-[#B8C3CC]">
                The market map shows where risk is concentrated, how companies are positioned across the two primary axes, and where stress is clustering under the active filters.
              </div>
            </div>

            {/* ── Cube Map ── */}
            <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white">Three-Axis Structural Map</CardTitle>
                <CardDescription className="text-[#B8C3CC]">
                  <span className="text-[#EAF0F2]">X-axis</span> = Trajectory Risk (left = improving · right = deteriorating) ·{" "}
                  <span className="text-[#EAF0F2]">Y-axis</span> = Anchor Risk (bottom = supported · top = stretched) ·{" "}
                  <span className="text-[#EAF0F2]">Z-axis</span> = Financing Risk (scroll through 10 depth panels) ·{" "}
                  <span className="text-[#EAF0F2]">Color</span> = Composite Risk.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-1 text-[13px] text-[#B8C3CC]">
                  Each point is a company. Top-right = most fragile: maximum valuation stretch, worst trajectory. Scroll to move through financing risk depth panels.
                </p>
                <p className="mb-4 text-[12px] font-medium" style={{ color: "#BC6464" }}>
                  Front panel (decile 1) = highest financing strain. Scroll down to move deeper — toward lower financing risk.
                </p>

                {/* Color legend */}
                <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#B8C3CC]">
                  <span className="text-[#7E8A96]">Composite Risk (color):</span>
                  {["Very Low", "Low", "Moderate", "High", "Very High"].map(bucket => (
                    <span key={bucket} className="inline-flex items-center gap-1 text-[11px]">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: compositeColor(bucket) }} />
                      {bucket}
                    </span>
                  ))}
                  <span className="text-[#7E8A96] ml-2">Dot size = depth proximity to active panel</span>
                </div>

                {loading ? (
                  <div className="flex h-[600px] items-center justify-center text-[#7E8A96]">
                    Loading current snapshot...
                  </div>
                ) : (() => {
                  // Scrollbar pip color by decile position
                  const pipColor = (decile: number) =>
                    decile <= 2 ? COLORS.negative :
                    decile <= 4 ? COLORS.negativeSoft :
                    decile <= 6 ? "#B8C3CC" :
                    decile <= 8 ? COLORS.positiveSoft :
                    COLORS.positive;

                  return (
                    <div className="flex gap-4">

                      {/* ── Chart area — ref attached for non-passive wheel ── */}
                      <div
                        ref={mapChartRef}
                        className="relative flex-1"
                        style={{ height: 580, cursor: "default" }}
                        onTouchStart={e => {
                          const startY = e.touches[0].clientY;
                          const handleMove = (me: TouchEvent) => {
                            if (mapScrollLocked.current) return;
                            const dy = me.touches[0].clientY - startY;
                            if (Math.abs(dy) < 12) return;
                            const dir = dy < 0 ? 1 : -1;
                            setMapDecile(prev => Math.min(10, Math.max(1, prev + dir)));
                            mapScrollLocked.current = true;
                            setTimeout(() => { mapScrollLocked.current = false; }, 260);
                            document.removeEventListener("touchmove", handleMove);
                          };
                          document.addEventListener("touchmove", handleMove, { passive: true });
                        }}
                      >
                        {/* Quadrant labels */}
                        <div className="pointer-events-none absolute inset-0 z-10">
                          <div className="absolute left-[48px] top-[4px] text-[9px] text-[#7E8A96]">Improving · High anchor</div>
                          <div className="absolute right-[8px] top-[4px] text-right text-[9px] font-medium" style={{ color: "#BC6464" }}>Most fragile zone ↗</div>
                          <div className="absolute bottom-[28px] left-[48px] text-[9px] text-[#6DAE8B]">Improving · Supported</div>
                          <div className="absolute bottom-[28px] right-[8px] text-right text-[9px] text-[#7E8A96]">Deteriorating · Supported</div>
                        </div>

                        {/* Active panel label */}
                        <div className="pointer-events-none absolute left-[52px] top-[24px] z-20">
                          <div
                            className="rounded-lg border border-[#203754] bg-[#0A1F3D]/90 px-2.5 py-1 text-[10px] font-medium backdrop-blur-sm"
                            style={{ color: "#B8C3CC" }}
                          >
                            Financing Risk · Decile {mapDecile} of 10
                            <span className="ml-2" style={{ color: pipColor(mapDecile) }}>
                              {mapDecile <= 2 ? "Highest strain" : mapDecile >= 9 ? "Lowest strain" : ""}
                            </span>
                          </div>
                        </div>

                        {/* Recharts — axes, grid, tooltip only. No dots in Scatter. */}
                        <div ref={mapContainerRef} className="absolute inset-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 36, right: 12, bottom: 24, left: 40 }}>
                              <CartesianGrid stroke={COLORS.border} strokeOpacity={0.5} />
                              <XAxis
                                type="number" dataKey="x" domain={[0, 1]}
                                label={{ value: "Trajectory Risk →", position: "insideBottomRight", offset: -4, fill: COLORS.textMuted, fontSize: 11 }}
                                tick={{ fill: COLORS.textSecondary, fontSize: 11 }}
                                axisLine={{ stroke: COLORS.border }} tickLine={{ stroke: COLORS.border }}
                              />
                              <YAxis
                                type="number" dataKey="y" domain={[0, 1]}
                                label={{ value: "Anchor Risk ↑", angle: -90, position: "insideLeft", offset: 10, fill: COLORS.textMuted, fontSize: 11 }}
                                tick={{ fill: COLORS.textSecondary, fontSize: 11 }}
                                axisLine={{ stroke: COLORS.border }} tickLine={{ stroke: COLORS.border }}
                              />
                              <Tooltip
                                cursor={{ strokeDasharray: "3 3" }}
                                content={({ active, payload }) => {
                                  if (!active || !payload?.length) return null;
                                  const d = payload[0].payload;
                                  const dist = Math.abs(d.axis3_decile - mapDecile);
                                  if (dist > 1) return null;
                                  return (
                                    <div
                                      className="rounded-2xl px-3 py-2.5 text-xs"
                                      style={{ backgroundColor: COLORS.inset, border: `1px solid ${COLORS.border}`, color: COLORS.text }}
                                    >
                                      <div className="font-semibold text-white">{d.symbol}</div>
                                      <div className="mt-0.5 text-[11px]" style={{ color: COLORS.textSecondary }}>{d.oal_label}</div>
                                      <div className="mt-2 flex flex-col gap-0.5 text-[11px]">
                                        <span style={{ color: COLORS.textMuted }}>Trajectory Risk: <span className="text-[#EAF0F2]">{d.x != null ? `${(d.x * 100).toFixed(0)}th pct` : "—"}</span></span>
                                        <span style={{ color: COLORS.textMuted }}>Anchor Risk: <span className="text-[#EAF0F2]">{d.y != null ? `${(d.y * 100).toFixed(0)}th pct` : "—"}</span></span>
                                        <span style={{ color: COLORS.textMuted }}>Financing Decile: <span className="text-[#EAF0F2]">{d.axis3_decile} of 10</span></span>
                                        <span className="mt-1" style={{ color: compositeColor(d.composite_bucket) }}>Composite: {d.composite_bucket}</span>
                                      </div>
                                      <div className="mt-2 border-t border-[#203754] pt-1.5 text-[10px] text-[#7E8A96]">
                                        {dist === 0 ? "Click to open company detail." : "Click to jump to this depth panel."}
                                      </div>
                                    </div>
                                  );
                                }}
                              />
                              {/* Empty scatter — keeps tooltip hit detection working */}
                              <Scatter data={scatterData} fill="transparent" opacity={0}>
                                {scatterData.map((_, idx) => <Cell key={idx} />)}
                              </Scatter>
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>

                        {/* ── Animated dot overlay ──────────────────────────────
                            Positioned absolutely over the chart.
                            Chart margins: top=36 right=12 bottom=24 left=40
                            Plot area = container minus margins.
                            Data domain [0,1] maps linearly to plot area pixels.
                            Each circle has a stable key so framer-motion tracks
                            identity across mapDecile changes and springs r/opacity.
                        ─────────────────────────────────────────────────────── */}
                        <svg
                          className="pointer-events-none absolute inset-0 z-10"
                          width={mapDims.width}
                          height={mapDims.height}
                        >
                          {(() => {
                            const margin = { top: 36, right: 12, bottom: 24, left: 40 };
                            const plotW = mapDims.width  - margin.left - margin.right;
                            const plotH = mapDims.height - margin.top  - margin.bottom;
                            return scatterData.map(entry => {
                              const cx = margin.left + entry.x * plotW;
                              const cy = margin.top  + (1 - entry.y) * plotH;
                              const dist = Math.abs(entry.axis3_decile - mapDecile);
                              const targetR       = dist === 0 ? 5 : dist === 1 ? 3 : 1;
                              const targetOpacity = dist === 0 ? 0.92 : dist === 1 ? 0.45 : 0.12;
                              const clickable     = dist <= 1;
                              return (
                                <motion.circle
                                  key={entry.symbol}
                                  cx={cx}
                                  cy={cy}
                                  fill={compositeColor(entry.composite_bucket)}
                                  animate={{ r: targetR, opacity: targetOpacity }}
                                  transition={{ type: "spring", stiffness: 180, damping: 22 }}
                                  style={{
                                    cursor: clickable ? "pointer" : "default",
                                    pointerEvents: clickable ? "auto" : "none",
                                  }}
                                  onClick={() => {
                                    if (dist > 1) return;
                                    if (dist === 1) { setMapDecile(entry.axis3_decile); return; }
                                    const row = filtered.find(r => r.symbol === entry.symbol)
                                      ?? snapshotData.find(r => r.symbol === entry.symbol);
                                    if (row) setSelectedCompany(row);
                                  }}
                                />
                              );
                            });
                          })()}
                        </svg>
                      </div>

                      {/* ── Vertical depth scrollbar — heavier pips ── */}
                      <div
                        className="flex flex-col items-center shrink-0 rounded-2xl border border-[#203754] bg-[#0D2138] py-4 px-1"
                        style={{ width: 40, gap: 0 }}
                      >
                        {/* Label top */}
                        <div className="mb-2 text-[8px] font-semibold uppercase tracking-wide text-center leading-tight" style={{ color: COLORS.negative }}>
                          HI
                        </div>

                        {/* Connecting track line */}
                        <div className="relative flex flex-col items-center" style={{ gap: 0 }}>
                          {/* Background track */}
                          <div
                            className="absolute inset-x-0 mx-auto rounded-full"
                            style={{
                              width: 2,
                              top: 8,
                              bottom: 8,
                              backgroundColor: "#203754",
                              left: "50%",
                              transform: "translateX(-50%)",
                            }}
                          />

                          {Array.from({ length: 10 }, (_, i) => {
                            const decile = i + 1;
                            const isActive = decile === mapDecile;
                            const dist = Math.abs(decile - mapDecile);
                            const color = pipColor(decile);

                            return (
                              <button
                                key={decile}
                                onClick={() => setMapDecile(decile)}
                                className="relative flex items-center justify-center transition-all duration-200 z-10"
                                style={{ width: 40, height: 36 }}
                                title={`Decile ${decile}`}
                              >
                                <div
                                  className="rounded-full transition-all duration-200"
                                  style={{
                                    width:  isActive ? 16 : dist === 1 ? 10 : 6,
                                    height: isActive ? 16 : dist === 1 ? 10 : 6,
                                    backgroundColor: isActive ? color : dist === 1 ? color : "#344860",
                                    opacity: isActive ? 1 : dist === 1 ? 0.75 : 0.5,
                                    boxShadow: isActive
                                      ? `0 0 10px 3px ${color}60, 0 0 0 3px ${color}25`
                                      : "none",
                                    border: isActive ? `2px solid ${color}` : "none",
                                  }}
                                />
                              </button>
                            );
                          })}
                        </div>

                        {/* Label bottom */}
                        <div className="mt-2 text-[8px] font-semibold uppercase tracking-wide text-center leading-tight" style={{ color: COLORS.positive }}>
                          LO
                        </div>
                      </div>

                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Active Risk Cluster */}
            <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[#BC6464]" />
                    <CardTitle className="text-base text-white">Active Risk Cluster</CardTitle>
                  </div>
                  <span className="text-xs text-[#7E8A96]">Top {topRisk.length} by composite score</span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Causal framing with action directive */}
                <p className="mb-3 text-sm text-[#B8C3CC]">
                  These companies are currently driving the highest structural risk in the filtered universe. Use them as the first candidates for company detail and comparison.
                </p>
                <div className="flex flex-wrap gap-2">
                  {topRisk.map(row => {
                    const isVeryHigh = row.composite_bucket === "Very High";
                    return (
                      <div
                        key={row.symbol}
                        onClick={() => setSelectedCompany(row)}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-150 hover:opacity-90 hover:scale-[1.02] hover:shadow-md"
                        style={{
                          background: isVeryHigh ? "rgba(139,56,56,0.15)" : "#0D2138",
                          border: isVeryHigh ? "1px solid rgba(188,100,100,0.4)" : "1px solid #203754",
                        }}
                        title={`${row.symbol} · ${row.oal_label} · ${row.composite_bucket} · Score: ${row.composite_score?.toFixed(3)}`}
                      >
                        <span className="font-mono text-sm font-semibold text-white">{row.symbol}</span>
                        <span className="font-mono text-xs" style={{ color: isVeryHigh ? "#BC6464" : COLORS.textMuted }}>
                          {row.composite_score?.toFixed(3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[11px] text-[#7E8A96]">
                  Hover for OAL and bucket detail. Click any company to open company detail.
                </p>
              </CardContent>
            </Card>

            {/* ── Historical Cohort Outcomes ── */}
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Grid3X3 className="h-5 w-5 text-[#B8C3CC]" />
                <h2 className="text-xl font-semibold text-white">Historical Cohort Outcomes</h2>
                {cohortGrid?.metadata && (
                  <Badge variant="outline" className="border-[#203754] text-[#7E8A96]">
                    {cohortGrid.metadata.horizon_months}M Forward
                  </Badge>
                )}
              </div>
              {/* Observation timestamp — empirical authority visible on the surface */}
              {cohortGrid?.metadata && (
                <p className="text-[11px] text-[#7E8A96]">
                  {formatNum(cohortGrid.metadata.observation_count)} observations
                  {cohortGrid.metadata.formation_month_min && cohortGrid.metadata.formation_month_max && (
                    <> · Formation window: {cohortGrid.metadata.formation_month_min} – {cohortGrid.metadata.formation_month_max}</>
                  )}
                  {" "}· Updated monthly
                </p>
              )}
              {/* Two-line entry guidance */}
              <div className="max-w-3xl space-y-1">
                <p className="text-sm leading-6 text-[#B8C3CC]">
                  This shows how companies in similar structural states have historically performed over the forward period.
                </p>
                <p className="text-sm text-[#7E8A96]">
                  Start by scanning the bottom-right of each panel — where anchor risk and trajectory risk are both highest.
                </p>
              </div>
              {/* Epistemic constraint — what this data does not establish */}
              <p className="text-[11px] text-[#7E8A96]">
                Historical cohort outcomes describe distributional tendencies across structural profiles. They do not establish causation, predict individual company returns, or account for conditions outside the formation window.
              </p>
            </div>

            {/* Cohort legend */}
            <div className="rounded-2xl border border-[#203754] bg-[#0D2138] px-5 py-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#7E8A96]">
                <span className="font-medium text-[#B8C3CC]">How to read this:</span>
                <span><span className="text-[#EAF0F2]">Columns</span> = Anchor Risk — Very Low → Very High</span>
                <span><span className="text-[#EAF0F2]">Rows</span> = Trajectory Risk — Very Low → Very High</span>
                <span><span className="text-[#EAF0F2]">Panels</span> = Financing Risk</span>
                <span><span className="text-[#EAF0F2]">Outlined cells</span> = strongest outcome zones (|return| &gt; 15%)</span>
              </div>
              <div className="mt-2 text-[11px] text-[#7E8A96]">
                Focus on the bottom-right of each panel — where high anchor risk meets deteriorating trajectory.
              </div>
            </div>

            {/* Metric selector */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-[#B8C3CC]">Choose how cohort performance is measured.</div>
                  {/* One-line metric explanation */}
                  <div className="text-xs text-[#7E8A96]">
                    Median is the default — it reflects the typical outcome more honestly than the mean.
                  </div>
                </div>
              </div>

              {cohortMetric === "mean_return" && (
                <div className="text-xs text-[#7E8A96]">
                  Mean returns are sensitive to outliers. Cells marked ▲ or ▼ have median returns that differ materially — hover for context.
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    ["mean_return", "Mean"],
                    ["median_return", "Median"],
                    ["hit_rate", "Hit Rate"],
                  ].map(([value, label]) => {
                    const active = cohortMetric === value;
                    return (
                      <button
                        key={value}
                        onClick={() => setCohortMetric(value as CohortMetric)}
                        className={`rounded-2xl border px-4 py-2 text-sm transition ${
                          active ? "border-[#41506A] bg-[#0D2138] text-white" : "border-[#203754] bg-[#0D2138] text-[#B8C3CC] hover:bg-[#112A47]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {[
                    { label: "Strong Negative", color: COLORS.negative },
                    { label: "Mild Negative", color: COLORS.negativeSoft },
                    { label: "Neutral", color: COLORS.neutral },
                    { label: "Mild Positive", color: COLORS.positiveSoft },
                    { label: "Strong Positive", color: COLORS.positive },
                    { label: "Suppressed", color: COLORS.suppressed },
                  ].map(item => (
                    <div key={item.label} className="inline-flex items-center gap-2 text-[#B8C3CC]">
                      <span className="h-3 w-3 rounded-sm border border-[#203754]" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Cube Navigator — Five-Panel Financing Risk Selector ── */}
            {cohortGrid && (() => {
              const axis3Order = ["Very High", "High", "Moderate", "Low", "Very Low"];
              const activePanel = cohortGrid.panels.find(p => p.panel === selectedAxis3);

              // Directional animation variants — depth metaphor
              // forward = moving toward higher risk (going "deeper")
              // back = moving toward lower risk (coming "shallower")
              const variants = {
                enterForward:  { opacity: 0, scale: 0.96, z: -20 },
                enterBack:     { opacity: 0, scale: 1.04, z: 20 },
                center:        { opacity: 1, scale: 1,    z: 0 },
                exitForward:   { opacity: 0, scale: 1.04, z: 20 },
                exitBack:      { opacity: 0, scale: 0.96, z: -20 },
              };

              const handleSelectAxis3 = (bucket: string) => {
                const currentIdx = axis3Order.indexOf(selectedAxis3);
                const nextIdx    = axis3Order.indexOf(bucket);
                // Higher index = lower risk = deeper into the cube = forward
                axis3Direction.current = nextIdx > currentIdx ? "forward" : "back";
                setSelectedAxis3(bucket);
              };

              return (
                <div className="space-y-4">

                  {/* Selector + depth indicator */}
                  <div className="flex items-center gap-4">

                    {/* Depth indicator — five stacked lines */}
                    <div className="flex flex-col gap-[3px] shrink-0">
                      {axis3Order.map((b, i) => {
                        const activeIdx = axis3Order.indexOf(selectedAxis3);
                        const dist = Math.abs(i - activeIdx);
                        const opacity = dist === 0 ? 1 : dist === 1 ? 0.45 : 0.2;
                        return (
                          <div
                            key={b}
                            className="h-[3px] w-5 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor: "#6DAE8B",
                              opacity,
                              transform: dist === 0 ? "scaleX(1)" : `scaleX(${1 - dist * 0.15})`,
                              transformOrigin: "left",
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Quintile selector buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-[#7E8A96] mr-1">Financing Risk:</span>
                      {axis3Order.map(bucket => {
                        const active = selectedAxis3 === bucket;
                        return (
                          <button
                            key={bucket}
                            onClick={() => handleSelectAxis3(bucket)}
                            className="rounded-xl border px-3 py-1.5 text-[12px] font-medium transition-all duration-200"
                            style={{
                              borderColor: active ? compositeColor(bucket) : "#203754",
                              backgroundColor: active ? `${compositeColor(bucket)}18` : "#0D2138",
                              color: active ? compositeColor(bucket) : "#7E8A96",
                            }}
                          >
                            {bucket}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Single 5×5 panel with directional depth transition */}
                  <div style={{ perspective: "1200px" }}>
                    <AnimatePresence
                      mode="wait"
                      custom={axis3Direction.current}
                    >
                      {activePanel && (
                        <motion.div
                          key={selectedAxis3}
                          custom={axis3Direction.current}
                          variants={{
                            initial: (dir: string) => dir === "forward"
                              ? { opacity: 0, scale: 0.96 }
                              : { opacity: 0, scale: 1.04 },
                            animate: { opacity: 1, scale: 1 },
                            exit: (dir: string) => dir === "forward"
                              ? { opacity: 0, scale: 1.04 }
                              : { opacity: 0, scale: 0.96 },
                          }}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-white">
                                    Financing Risk — {activePanel.panel}
                                  </CardTitle>
                                  <CardDescription className="text-[#B8C3CC]">
                                    {cohortMetricLabel(cohortMetric)} over forward {cohortGrid.metadata.horizon_months}M.
                                    Cells outlined in white have |return| &gt; 15%.
                                  </CardDescription>
                                </div>
                                {/* Position in cube */}
                                <div className="text-right shrink-0">
                                  <div className="text-[10px] text-[#7E8A96] uppercase tracking-[0.15em]">Depth</div>
                                  <div className="text-sm font-semibold" style={{ color: compositeColor(selectedAxis3) }}>
                                    {axis3Order.indexOf(selectedAxis3) + 1} of {axis3Order.length}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-[90px_repeat(5,minmax(0,1fr))] gap-2 text-xs">
                                <div>
                                  <div className="text-[9px] text-[#7E8A96]">Trajectory ↓</div>
                                  <div className="text-[9px] text-[#7E8A96]">Anchor →</div>
                                </div>
                                {cohortGrid.metadata.x_axis_labels.map(c => (
                                  <div key={c} className="text-center">
                                    <div className="text-[10px] text-[#7E8A96]">{c}</div>
                                  </div>
                                ))}
                                {activePanel.rows.map(row => (
                                  <React.Fragment key={`${activePanel.panel}-${row.axis2_bucket}`}>
                                    <div className="flex items-center text-[10px] text-[#7E8A96]" style={{ minWidth: 90 }}>
                                      {row.axis2_bucket}
                                    </div>
                                    {row.cells.map(cell => {
                                      const visibleValue = getCohortMetricValue(cell, cohortMetric);
                                      const colorValue = cohortMetric === "hit_rate" ? ((visibleValue ?? 0) - 0.5) * 2 : visibleValue;
                                      const isStrongSignal = !cell.suppressed && cohortMetric !== "hit_rate" && visibleValue != null && Math.abs(visibleValue) > 0.15;
                                      return (
                                        <div
                                          key={`${activePanel.panel}-${row.axis2_bucket}-${cell.axis1_bucket}`}
                                          className="flex h-20 flex-col items-center justify-center rounded-2xl px-1 text-white transition-all"
                                          style={{
                                            backgroundColor: returnHeatColor(colorValue, cell.suppressed),
                                            border: isStrongSignal ? "1.5px solid rgba(255,255,255,0.5)" : "1px solid #203754",
                                          }}
                                          title={[
                                            `Financing Risk: ${cell.axis3_bucket}`,
                                            `Trajectory Risk: ${cell.axis2_bucket}`,
                                            `Anchor Risk: ${cell.axis1_bucket}`,
                                            `Mean Return: ${formatPctSigned(cell.mean_return)}`,
                                            `Median Return: ${formatPctSigned(cell.median_return)}`,
                                            `Hit Rate: ${formatPct(cell.hit_rate)}`,
                                            `Count: ${formatNum(cell.count)}`,
                                            cell.suppressed ? `Suppressed: count < ${cohortGrid.metadata.min_count_for_display}` : null,
                                            cohortMetric === "mean_return" && skewSignal(cell) === "right"
                                              ? `Median: ${formatPctSigned(cell.median_return)} — mean inflated by high-return outliers`
                                              : null,
                                            cohortMetric === "mean_return" && skewSignal(cell) === "left"
                                              ? `Median: ${formatPctSigned(cell.median_return)} — mean dragged down by large losses`
                                              : null,
                                          ].filter(Boolean).join(" | ")}
                                        >
                                          <div className="text-[12px] font-medium">{formatCohortMetric(visibleValue, cohortMetric)}</div>
                                          {cohortMetric === "mean_return" && (() => {
                                            const skew = skewSignal(cell);
                                            if (skew === "none") return null;
                                            return (
                                              <div className="mt-0.5 text-[9px] font-medium" style={{ color: skew === "right" ? COLORS.positiveSoft : COLORS.negativeSoft }}>
                                                {skew === "right" ? "▲ skewed" : "▼ skewed"}
                                              </div>
                                            );
                                          })()}
                                          <div className="mt-0.5 text-[10px] text-[#EAF0F2]/80">N={formatNum(cell.count)}</div>
                                        </div>
                                      );
                                    })}
                                  </React.Fragment>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              );
            })()}

            {/* Cohort Insight Layer — planned analytical module */}
            <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-white">Cohort Insight Layer</CardTitle>
                    <CardDescription className="mt-1 max-w-2xl text-[#B8C3CC]">
                      Automatically surfaces the strongest return zones, widest mean/median gaps, highest hit-rate concentrations, and most unstable structural configurations across the active cohort surface.
                    </CardDescription>
                  </div>
                  <Badge className="shrink-0 rounded-full border border-[#203754] bg-[#0D2138] px-3 py-1 text-[11px] text-[#7E8A96]">
                    In Development
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border border-[#203754] bg-[#0D2138] px-5 py-2.5 text-[12.5px] text-[#7E8A96]">
                  Pattern extraction layer is in development. This will surface 2–4 key structural signals under the active filters rather than requiring manual grid scanning.
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════
              SNAPSHOT TAB
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="snapshot" className="space-y-6">
            <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white">Current Snapshot</CardTitle>
                <CardDescription className="text-[#B8C3CC]">
                  Full structural profile for each company under the active filters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-1.5">
                  <p className="text-sm text-[#B8C3CC]">
                    Each row shows a company's full structural profile. Use the global filters to isolate specific risk profiles before scanning individual names.
                  </p>
                  <p className="text-sm font-medium text-[#6DAE8B]">
                    Start by filtering to a single OAL or composite bucket before scanning individual names.
                  </p>
                </div>
                <p className="mb-3 text-[11px] text-[#7E8A96]">
                  "Valuation Bucket" = Axis I within-OAL ranking, not total composite risk. Click any row to open company detail.
                </p>
                <div className="overflow-hidden rounded-2xl border border-[#203754]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#203754] bg-[#0D2138]">
                        <TableHead className="text-[#B8C3CC]">Symbol</TableHead>
                        <TableHead className="text-[#B8C3CC]">OAL</TableHead>
                        <TableHead className="text-[#B8C3CC]">Anchor Risk</TableHead>
                        <TableHead className="text-[#B8C3CC]">Trajectory Risk</TableHead>
                        <TableHead className="text-[#B8C3CC]">Financing Risk</TableHead>
                        <TableHead className="text-[#B8C3CC]">Composite</TableHead>
                        <TableHead className="text-[#B8C3CC]">Valuation Bucket</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(row => (
                        <TableRow
                          key={row.symbol}
                          onClick={() => setSelectedCompany(row)}
                          className="cursor-pointer border-[#203754] hover:bg-[#0D2138]/70"
                        >
                          <TableCell className="font-medium text-white">{row.symbol}</TableCell>
                          <TableCell className="text-[#EAF0F2]">{row.oal_label}</TableCell>
                          <TableCell className="text-[#EAF0F2]">{row.axis1_pct?.toFixed(3) ?? "—"}</TableCell>
                          <TableCell className="text-[#EAF0F2]">{row.axis2_pct == null ? "—" : row.axis2_pct.toFixed(3)}</TableCell>
                          <TableCell className="text-[#EAF0F2]">{row.axis3_pct?.toFixed(3) ?? "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{row.composite_score?.toFixed(3) ?? "—"}</span>
                              <Badge
                                variant="outline"
                                className="border-[#203754] text-[#B8C3CC]"
                                style={{ backgroundColor: `${compositeColor(row.composite_bucket)}22` }}
                              >
                                {row.composite_bucket}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#EAF0F2]">{row.risk_bucket_within_oal ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════
              OAL STRUCTURE TAB
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="oal" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#B8C3CC]" />
                    <CardTitle className="text-white">Operational Anchor Structure</CardTitle>
                  </div>
                  <CardDescription className="text-[#B8C3CC]">
                    Operational Anchor Ladder distribution across the filtered snapshot.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm leading-6 text-[#B8C3CC]">
                    This shows how the current universe is distributed across levels of demonstrated operating support — from FCF-anchored companies at the deepest end to revenue-only and unanchored companies at the shallowest.
                  </p>
                  <p className="mb-5 text-sm text-[#7E8A96]">
                    Use this tab when you want to understand whether the current market state is being driven by deeper or shallower operating support.
                  </p>
                  <div className="border-t border-[#203754] pt-4">
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={oalSummary} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                        <CartesianGrid stroke={COLORS.border} vertical={false} />
                        <XAxis dataKey="oal_label" tick={{ fill: COLORS.textSecondary, fontSize: 12 }} axisLine={{ stroke: COLORS.border }} tickLine={{ stroke: COLORS.border }} />
                        <YAxis tick={{ fill: COLORS.textSecondary, fontSize: 12 }} axisLine={{ stroke: COLORS.border }} tickLine={{ stroke: COLORS.border }} />
                        <Tooltip contentStyle={{ backgroundColor: COLORS.inset, border: `1px solid ${COLORS.border}`, borderRadius: 16, color: COLORS.text }} />
                        <Bar dataKey="n" radius={[12, 12, 0, 0]} fill={COLORS.positiveSoft} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-white">Operational Anchor Summary</CardTitle>
                  <CardDescription className="text-[#B8C3CC]">
                    Median axis scores by anchor level — showing how structural risk varies across the OAL.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-[#7E8A96]">
                    Compare median anchor, financing, and composite scores across OAL levels to see where structural pressure is deepest.
                  </p>
                  <div className="overflow-hidden rounded-2xl border border-[#203754]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#203754] bg-[#0D2138]">
                          <TableHead className="text-[#B8C3CC]">OAL</TableHead>
                          <TableHead className="text-[#B8C3CC]">Count</TableHead>
                          <TableHead className="text-[#B8C3CC]">Median Anchor Risk</TableHead>
                          <TableHead className="text-[#B8C3CC]">Median Financing Risk</TableHead>
                          <TableHead className="text-[#B8C3CC]">Median Composite</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {oalSummary.map(row => (
                          <TableRow key={row.oal_label} className="border-[#203754]">
                            <TableCell className="font-medium text-white">{row.oal_label}</TableCell>
                            <TableCell className="text-[#EAF0F2]">{formatNum(row.n)}</TableCell>
                            <TableCell className="text-[#EAF0F2]">{row.median_axis1 == null ? "—" : row.median_axis1.toFixed(3)}</TableCell>
                            <TableCell className="text-[#EAF0F2]">{row.median_axis3 == null ? "—" : row.median_axis3.toFixed(3)}</TableCell>
                            <TableCell className="text-[#EAF0F2]">{row.median_composite == null ? "—" : row.median_composite.toFixed(3)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════
              LIQUIDITY TAB
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="liquidity" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#B8C3CC]" />
                    <CardTitle className="text-white">Financing Context</CardTitle>
                  </div>
                  <CardDescription className="text-[#B8C3CC]">
                    Balance sheet flexibility and financing strain across the current filtered universe.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Framing line + why-open-now directive */}
                  <p className="mb-2 text-sm leading-6 text-[#B8C3CC]">
                    This shows how balance sheet flexibility is distributed across the current universe — context for how much financial runway companies have to allow their structural narrative to play out.
                  </p>
                  <p className="mb-5 text-sm text-[#7E8A96]">
                    Use this tab when financing strain may be the limiting factor on whether current narratives can continue.
                  </p>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={liquiditySummary} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                        <CartesianGrid stroke={COLORS.border} vertical={false} />
                        <XAxis dataKey="bucket" tick={{ fill: COLORS.textSecondary, fontSize: 12 }} axisLine={{ stroke: COLORS.border }} tickLine={{ stroke: COLORS.border }} />
                        <YAxis tick={{ fill: COLORS.textSecondary, fontSize: 12 }} axisLine={{ stroke: COLORS.border }} tickLine={{ stroke: COLORS.border }} />
                        <Tooltip contentStyle={{ backgroundColor: COLORS.inset, border: `1px solid ${COLORS.border}`, borderRadius: 16, color: COLORS.text }} />
                        <Bar dataKey="count" radius={[12, 12, 0, 0]} fill={COLORS.positiveSoft} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-white">What This View Adds</CardTitle>
                  <CardDescription className="text-[#B8C3CC]">
                    How the financing context extends structural analysis beyond risk scores alone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-[#EAF0F2]">
                  <p><span className="font-medium text-white">1.</span> The core structural layers — market map, anchor structure, financing context, and cohort outcomes — are fully active.</p>
                  <p><span className="font-medium text-white">2.</span> Global filters apply consistently across all tabs.</p>
                  <p><span className="font-medium text-white">3.</span> The cohort grid metric toggle lets you compare mean, median, and hit-rate surfaces for cross-validation.</p>
                  <p><span className="font-medium text-white">4.</span> Company drilldowns, regime history views, and advanced filtering extend this system further.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════
              HISTORY TAB
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="history" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-5 w-5 text-[#B8C3CC]" />
                    <CardTitle className="text-white">Historical Coverage</CardTitle>
                  </div>
                  <CardDescription className="text-[#B8C3CC]">
                    Archived monthly structural snapshots available in the system.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Framing line + why-open-now directive */}
                  <p className="mb-2 text-sm leading-6 text-[#B8C3CC]">
                    This shows the historical coverage used to evaluate structural outcomes and regime shifts. Each month represents a formation state from which forward returns were measured.
                  </p>
                  <p className="mb-5 text-sm text-[#7E8A96]">
                    Use this tab when you want to know how much historical depth is supporting the current market interpretation.
                  </p>
                  <div className="overflow-hidden rounded-2xl border border-[#203754]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#203754] bg-[#0D2138]">
                          <TableHead className="text-[#B8C3CC]">Month</TableHead>
                          <TableHead className="text-[#B8C3CC]">OAL Scores</TableHead>
                          <TableHead className="text-[#B8C3CC]">OAL Summary</TableHead>
                          <TableHead className="text-[#B8C3CC]">Structural Snapshot</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyManifest.map(row => (
                          <TableRow key={row.month} className="border-[#203754]">
                            <TableCell className="font-medium text-white">{row.month}</TableCell>
                            <TableCell className="text-[#EAF0F2]">{row.has_oal_scores === false ? "—" : formatNum(row.oal_scores_rows)}</TableCell>
                            <TableCell className="text-[#EAF0F2]">{row.has_oal_summary === false ? "—" : formatNum(row.oal_summary_rows)}</TableCell>
                            <TableCell className="text-[#EAF0F2]">{row.has_structural_snapshot === false ? "—" : formatNum(row.structural_rows)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-white">Why Historical Coverage Matters</CardTitle>
                  <CardDescription className="text-[#B8C3CC]">
                    What the historical layer enables — and how it connects to current structural analysis.
                  </CardDescription>
                  <p className="mt-1.5 text-xs text-[#7E8A96]">
                    This is the empirical foundation behind the cohort outcomes and regime interpretation.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-[#EAF0F2]">
                  <p><span className="font-medium text-white">1.</span> Archived monthly structural states define the platform's historical coverage window.</p>
                  <p><span className="font-medium text-white">2.</span> Cohort outcomes are calculated from real formation-month states and forward returns — not backtested with hindsight.</p>
                  <p><span className="font-medium text-white">3.</span> This historical layer supports regime comparison across valuation, trajectory, and financing fragility.</p>
                  <p><span className="font-medium text-white">4.</span> Regime history views extend this layer to show how structure evolves over time.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>

        {/* ── Footer ── */}
        <div className="mt-16 border-t border-[#203754] pt-8 text-center">
          <p className="text-[12px] leading-[1.8] text-[#7E8A96]">
            The Capital Steward, LLC · thecapitalsteward.com · inquiries@thecapitalsteward.com
            <br />
            © 2026 The Capital Steward, LLC. All rights reserved. For informational purposes only. Not investment advice.
          </p>
        </div>

      </div>
    </div>
  );
}