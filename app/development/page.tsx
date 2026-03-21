"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
  axis3_panel: string;
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
              The system's current read of market structure under the active filters. These characterize conditions — they do not predict outcomes.
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

        {/* Distribution */}
        <div className="flex flex-col rounded-2xl border border-[#203754] bg-[#0A1F3D] p-4">
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
        </div>

        {/* Concentration */}
        <div className="flex flex-col rounded-2xl border border-[#203754] bg-[#0A1F3D] p-4">
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
        </div>

        {/* Trajectory */}
        <div className="flex flex-col rounded-2xl border border-[#203754] bg-[#0A1F3D] p-4">
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
        </div>

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
    const scores = scorable.map(r => r.composite_score ?? 0).sort((a, b) => b - a);
    const threshold = scores[Math.floor(scores.length * 0.2)] ?? 0;

    return scorable.map(row => {
      const a3 = row.axis3_pct ?? 0.5;
      let axis3_bucket: string;
      if (a3 < 0.2)      axis3_bucket = "Very Low";
      else if (a3 < 0.4) axis3_bucket = "Low";
      else if (a3 < 0.6) axis3_bucket = "Moderate";
      else if (a3 < 0.8) axis3_bucket = "High";
      else               axis3_bucket = "Very High";

      return {
        x: row.axis1_pct as number,
        y: row.axis2_pct as number,
        axis3_bucket,
        symbol: row.symbol,
        oal_label: row.oal_label,
        composite_bucket: row.composite_bucket,
        composite_score: row.composite_score,
        isTopRisk: (row.composite_score ?? 0) >= threshold,
      };
    });
  }, [filtered]);

  const clearFilters = () => { setSelectedOAL("All"); setSelectedBucket("All"); setSearch(""); };

  return (
    <div className="min-h-screen bg-[#0A1F3D] text-[#EAF0F2]">
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
            Use this system to identify where structural risk is concentrated, isolate the companies driving it, and understand how those conditions have historically resolved.
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
        {/* Labels tightened: more precise, less dashboard-y */}
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

            {/* Scatter plot */}
            <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white">Three-Axis Structural Map</CardTitle>
                <CardDescription className="text-[#B8C3CC]">
                  <span className="text-[#EAF0F2]">X-axis</span> = Operational Anchor Risk ·{" "}
                  <span className="text-[#EAF0F2]">Y-axis</span> = Operational Trajectory Risk (higher = worse) ·{" "}
                  <span className="text-[#EAF0F2]">Dot size</span> = Operational Financing Risk ·{" "}
                  <span className="text-[#EAF0F2]">Color</span> = Composite Risk.
                  Top 20% by composite score are highlighted; the rest are faded.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Entry orientation line — tells user where to look first */}
                <p className="mb-3 text-[13px] text-[#B8C3CC]">
                  Each point is a company. Start with the top-right — where valuation stretch and deteriorating trajectory are highest.
                </p>
                <p className="mb-1 text-[11px] text-[#7E8A96]">
                  Each point represents a company. Hover for detail.
                </p>
                <p className="mb-4 text-[12px] font-medium" style={{ color: "#BC6464" }}>
                  Top-right = most fragile: highest anchor risk + worst trajectory. Large dots in that zone also carry high financing strain — compound risk across all three axes.
                </p>

                {loading ? (
                  <div className="flex h-[600px] items-center justify-center text-[#7E8A96]">
                    Loading current snapshot...
                  </div>
                ) : (
                  <div className="h-[600px] w-full">
                    {/* Legend strip */}
                    <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#B8C3CC]">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[#7E8A96]">Composite Risk (color):</span>
                        {["Very Low", "Low", "Moderate", "High", "Very High"].map(bucket => (
                          <span key={bucket} className="inline-flex items-center gap-1 text-[11px]">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: compositeColor(bucket) }} />
                            {bucket}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-[#7E8A96]">
                        <span className="text-[#B8C3CC]">Financing Risk (size):</span>
                        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-[#7E8A96]" />Low</span>
                        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-[#7E8A96]" />Moderate</span>
                        <span className="inline-flex items-center gap-1.5"><span className="inline-block h-4 w-4 rounded-full bg-[#7E8A96]" />High</span>
                      </div>
                    </div>

                    <div className="relative h-[550px]">
                      {/* Quadrant labels */}
                      <div className="pointer-events-none absolute inset-0 z-10">
                        <div className="absolute left-[48px] top-[4px] text-[9px] text-[#7E8A96]">Low anchor · High trajectory risk</div>
                        <div className="absolute right-[8px] top-[4px] text-right text-[9px] font-medium" style={{ color: "#BC6464" }}>Most fragile zone ↗</div>
                        <div className="absolute bottom-[28px] left-[48px] text-[9px] text-[#6DAE8B]">Lowest risk zone</div>
                        <div className="absolute bottom-[28px] right-[8px] text-right text-[9px] text-[#7E8A96]">High anchor · Low trajectory risk</div>
                      </div>

                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
                          <CartesianGrid stroke={COLORS.border} />
                          <XAxis
                            type="number" dataKey="x" domain={[0, 1]}
                            label={{ value: "Anchor Risk →", position: "insideBottomRight", offset: -4, fill: COLORS.textMuted, fontSize: 11 }}
                            tick={{ fill: COLORS.textSecondary, fontSize: 11 }}
                            axisLine={{ stroke: COLORS.border }} tickLine={{ stroke: COLORS.border }}
                          />
                          <YAxis
                            type="number" dataKey="y" domain={[0, 1]}
                            label={{ value: "Trajectory Risk ↑", angle: -90, position: "insideLeft", offset: 10, fill: COLORS.textMuted, fontSize: 11 }}
                            tick={{ fill: COLORS.textSecondary, fontSize: 11 }}
                            axisLine={{ stroke: COLORS.border }} tickLine={{ stroke: COLORS.border }}
                          />
                          <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const d = payload[0].payload;
                              return (
                                <div
                                  className="rounded-2xl px-3 py-2.5 text-xs"
                                  style={{ backgroundColor: COLORS.inset, border: `1px solid ${COLORS.border}`, color: COLORS.text }}
                                >
                                  <div className="font-semibold text-white">{d.symbol}</div>
                                  <div className="mt-0.5 text-[11px]" style={{ color: COLORS.textSecondary }}>{d.oal_label}</div>
                                  <div className="mt-2 flex flex-col gap-0.5 text-[11px]">
                                    <span style={{ color: COLORS.textMuted }}>Anchor Risk: <span className="text-[#EAF0F2]">{d.x != null ? `${(d.x * 100).toFixed(0)}th pct` : "—"}</span></span>
                                    <span style={{ color: COLORS.textMuted }}>Trajectory Risk: <span className="text-[#EAF0F2]">{d.y != null ? `${(d.y * 100).toFixed(0)}th pct` : "—"}</span></span>
                                    <span style={{ color: COLORS.textMuted }}>Financing Risk: <span className="text-[#EAF0F2]">{d.axis3_bucket ?? "—"}</span></span>
                                    <span className="mt-1" style={{ color: compositeColor(d.composite_bucket) }}>Composite: {d.composite_bucket}</span>
                                  </div>
                                  <div className="mt-2 border-t border-[#203754] pt-1.5 text-[10px] text-[#7E8A96]">
                                    Company detail opens from this view.
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Scatter data={scatterData}>
                            {scatterData.map((entry, idx) => {
                              const sizeMap: Record<string, number> = {
                                "Very Low": 2, "Low": 3, "Moderate": 5, "High": 7, "Very High": 8,
                              };
                              const r = sizeMap[entry.axis3_bucket] ?? 4;
                              return (
                                <Cell
                                  key={idx}
                                  fill={compositeColor(entry.composite_bucket)}
                                  opacity={entry.isTopRisk ? 0.9 : 0.2}
                                  r={entry.isTopRisk ? r : Math.max(1.5, r * 0.6)}
                                  // cursor-pointer once drilldown is wired
                                  style={{ cursor: "pointer" }}
                                />
                              );
                            })}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
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
                  These companies are currently driving the highest structural risk in the filtered universe. Use them as the first candidates for drilldown and comparison.
                </p>
                <div className="flex flex-wrap gap-2">
                  {topRisk.map(row => {
                    const isVeryHigh = row.composite_bucket === "Very High";
                    return (
                      <div
                        key={row.symbol}
                        // cursor-pointer signals interactivity; drilldown wired in Phase 2
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
                  Hover for OAL and bucket detail.
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
              {/* Two-line entry guidance — how to read and where to start */}
              <div className="max-w-3xl space-y-1">
                <p className="text-sm leading-6 text-[#B8C3CC]">
                  This shows how companies in similar structural states have historically performed over the forward period.
                </p>
                <p className="text-sm text-[#7E8A96]">
                  Start by scanning the bottom-right of each panel — where anchor risk and trajectory risk are both highest.
                </p>
              </div>
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

            {/* Cohort panels */}
            <div className="grid gap-6 xl:grid-cols-3">
              {cohortGrid?.panels.map(panel => (
                <Card key={panel.panel} className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                  <CardHeader>
                    <CardTitle className="text-white">{panel.panel}</CardTitle>
                    <CardDescription className="text-[#B8C3CC]">
                      {cohortMetricLabel(cohortMetric)} over forward {cohortGrid.metadata.horizon_months}M.
                      Cells outlined in white have |return| &gt; 15% — strong signal zones.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-[80px_repeat(5,minmax(0,1fr))] gap-2 text-xs">
                      <div>
                        <div className="text-[9px] text-[#7E8A96]">Trajectory ↓</div>
                        <div className="text-[9px] text-[#7E8A96]">Anchor →</div>
                      </div>
                      {cohortGrid.metadata.x_axis_labels.map(c => (
                        <div key={c} className="text-center"><div className="text-[#7E8A96]">{c}</div></div>
                      ))}
                      {panel.rows.map(row => (
                        <React.Fragment key={`${panel.panel}-${row.axis2_bucket}`}>
                          <div className="flex items-center text-[#7E8A96]" style={{ minWidth: 80 }}>{row.axis2_bucket}</div>
                          {row.cells.map(cell => {
                            const visibleValue = getCohortMetricValue(cell, cohortMetric);
                            const colorValue = cohortMetric === "hit_rate" ? ((visibleValue ?? 0) - 0.5) * 2 : visibleValue;
                            const isStrongSignal = !cell.suppressed && cohortMetric !== "hit_rate" && visibleValue != null && Math.abs(visibleValue) > 0.15;
                            return (
                              <div
                                key={`${panel.panel}-${row.axis2_bucket}-${cell.axis1_bucket}`}
                                className="flex h-16 flex-col items-center justify-center rounded-2xl px-1 text-white transition-all"
                                style={{
                                  backgroundColor: returnHeatColor(colorValue, cell.suppressed),
                                  border: isStrongSignal ? "1.5px solid rgba(255,255,255,0.5)" : "1px solid #203754",
                                }}
                                title={[
                                  `Panel: ${cell.axis3_panel}`,
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
                                <div className="text-[11px] font-medium">{formatCohortMetric(visibleValue, cohortMetric)}</div>
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
              ))}
            </div>

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
                  "Valuation Bucket" = Axis I within-OAL ranking, not total composite risk. Company detail is accessed from this table.
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
                          // cursor-pointer and hover state signal future interactivity
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
                    How the liquidity view extends structural analysis beyond risk scores alone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-[#EAF0F2]">
                  <p><span className="font-medium text-white">1.</span> The market map, OAL summary, liquidity distribution, and cohort return grids are live.</p>
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