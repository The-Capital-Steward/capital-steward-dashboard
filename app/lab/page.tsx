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
  if (
    cell.mean_return == null ||
    cell.median_return == null ||
    cell.suppressed
  ) return "none";
  const diff = cell.mean_return - cell.median_return;
  if (diff > 0.10) return "right";
  if (diff < -0.10) return "left";
  return "none";
}

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
      fetch("/data/osmr_snapshot.json").then((res) => {
        if (!res.ok) throw new Error(`Failed to load snapshot: ${res.status}`);
        return res.json();
      }),
      fetch("/data/oal_summary.json").then((res) => {
        if (!res.ok) throw new Error(`Failed to load oal summary: ${res.status}`);
        return res.json();
      }),
      fetch("/data/liquidity_summary.json").then((res) => {
        if (!res.ok) throw new Error(`Failed to load liquidity summary: ${res.status}`);
        return res.json();
      }),
      fetch("/data/history_manifest.json").then((res) => {
        if (!res.ok) throw new Error(`Failed to load history manifest: ${res.status}`);
        return res.json();
      }),
      fetch("/data/historical_cohort_grids.json").then((res) => {
        if (!res.ok) throw new Error(`Failed to load historical cohort grids: ${res.status}`);
        return res.json();
      }),
    ])
      .then(([snapshot, oal, liquidity, history, grids]) => {
        setSnapshotData(snapshot);
        setOALSummary(oal);
        setLiquiditySummary(liquidity);
        setHistoryManifest(history);
        setCohortGrid(grids);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return snapshotData.filter((row) => {
      const matchOAL = selectedOAL === "All" || row.oal_label === selectedOAL;
      const matchBucket = selectedBucket === "All" || row.composite_bucket === selectedBucket;
      const matchSearch = !search || row.symbol.toLowerCase().includes(search.toLowerCase());
      return matchOAL && matchBucket && matchSearch;
    });
  }, [snapshotData, selectedOAL, selectedBucket, search]);

  const topRisk = useMemo(() => {
    return [...filtered]
      .filter((r) => r.composite_score != null)
      .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
      .slice(0, 12);
  }, [filtered]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const avgComposite =
      total > 0
        ? filtered.reduce((acc, row) => acc + (row.composite_score ?? 0), 0) / total
        : null;
    const veryHigh = filtered.filter((r) => r.composite_bucket === "Very High").length;
    const fragile = filtered.filter((r) => (r.axis3_pct ?? 0) >= 0.8).length;
    return { total, avgComposite, veryHigh, fragile };
  }, [filtered]);

  const scatterData = useMemo(
    () =>
      filtered
        .filter((row) => row.axis1_pct != null && row.axis2_pct != null)
        .map((row) => ({
          x: row.axis1_pct as number,
          y: row.axis2_plot ?? row.axis2_pct ?? 0.5,
          z: row.axis3_pct,
          symbol: row.symbol,
          oal_label: row.oal_label,
          composite_bucket: row.composite_bucket,
        })),
    [filtered]
  );

  const clearFilters = () => {
    setSelectedOAL("All");
    setSelectedBucket("All");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[#0A1F3D] text-[#EAF0F2]">
      <div className="mx-auto max-w-7xl px-6 py-10">
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
            <Badge variant="outline" className="rounded-full border-[#203754] text-[#7E8A96]">
              Platform Preview
            </Badge>
          </div>

          <h1 className="tcs-heading text-5xl font-semibold leading-tight text-white md:text-6xl">
            A structural map of the equity market.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#B8C3CC]">
            The OSMR system maps structural fragility, resilience, and valuation pressure
            across the equity universe—and links those states to real historical cohort outcomes.
          </p>
        </motion.div>

        {/* Start Here — green left border via inline style to avoid Tailwind conflict */}
        <Card
          className="mb-10 rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20"
          style={{ borderLeft: "2px solid #244636" }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Start Here</CardTitle>
            <CardDescription className="text-[#B8C3CC]">
              OSMR (Operational Structure Mispricing Risk) is a framework for identifying
              structural imbalances across the corporate economy.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
              <div className="mb-2 font-medium text-white">Market Map</div>
              <div className="text-sm leading-6 text-[#B8C3CC]">
                See where structural risk is concentrated right now.
              </div>
            </div>
            <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
              <div className="mb-2 font-medium text-white">Risk List</div>
              <div className="text-sm leading-6 text-[#B8C3CC]">
                Identify the names currently carrying the greatest structural stress.
              </div>
            </div>
            <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
              <div className="mb-2 font-medium text-white">Cohort Outcomes</div>
              <div className="text-sm leading-6 text-[#B8C3CC]">
                See how similar structural states have behaved historically.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-10 rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#B8C3CC]" />
                  <CardTitle className="text-white">Global Filters</CardTitle>
                </div>
                <CardDescription className="text-[#B8C3CC]">
                  Apply filters across the market map, cohort outcomes, snapshot table,
                  and supporting diagnostics.
                </CardDescription>
                <div className="mt-3 text-sm text-[#7E8A96]">
                  OAL = Operational Anchor Ladder, the system used to group companies by operating support.
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
                  onChange={(e) => setSearch(e.target.value)}
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
                  {oalOrder.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                <SelectTrigger className="rounded-2xl border-[#203754] bg-[#0D2138] text-white">
                  <SelectValue placeholder="Composite Bucket" />
                </SelectTrigger>
                <SelectContent className="border-[#203754] bg-[#0D2138] text-white">
                  <SelectItem value="All">All Composite Buckets</SelectItem>
                  {bucketOrder.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* KPI strip */}
        <div className="mb-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-3xl border border-[#3E8E6A]/35 bg-[#112A47] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B8C3CC]">High Structural Risk</CardDescription>
              <CardTitle className="text-3xl text-white">
                {loading ? "…" : formatNum(stats.veryHigh)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7E8A96]">
              Primary concentration of structural risk under the active filters.
            </CardContent>
          </Card>
          <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B8C3CC]">Elevated Financing Fragility</CardDescription>
              <CardTitle className="text-3xl text-white">
                {loading ? "…" : formatNum(stats.fragile)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7E8A96]">
              Names currently exposed to the highest financing strain.
            </CardContent>
          </Card>
          <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B8C3CC]">Universe Covered</CardDescription>
              <CardTitle className="text-3xl text-white">
                {loading ? "…" : formatNum(stats.total)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7E8A96]">
              Companies currently represented under the active filters.
            </CardContent>
          </Card>
          <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B8C3CC]">Average Composite Risk</CardDescription>
              <CardTitle className="text-3xl text-white">
                {loading ? "…" : formatPct(stats.avgComposite)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7E8A96]">
              Average structural risk across the filtered universe.
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="market-map" className="space-y-10">
          <TabsList className="flex w-full gap-2 border-b border-[#203754] bg-transparent p-0">
            {[
              ["market-map", "Market Map"],
              ["snapshot", "Snapshot"],
              ["oal", "OAL Structure"],
              ["liquidity", "Liquidity"],
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

          <TabsContent value="market-map" className="space-y-8">

            {/* Interpretive layer placeholder */}
            <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white">Interpretive Layer</CardTitle>
                <CardDescription className="text-[#B8C3CC]">
                  This layer will surface current structural signals, directional positioning,
                  and regime-level context once the data-driven insight engine is active.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
                  <div className="mb-2 text-sm uppercase tracking-[0.14em] text-[#7E8A96]">Structural Signal</div>
                  <div className="text-sm leading-6 text-[#B8C3CC]">
                    Will summarize what the current market state implies under the active filters.
                  </div>
                </div>
                <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
                  <div className="mb-2 text-sm uppercase tracking-[0.14em] text-[#7E8A96]">Structural Positioning</div>
                  <div className="text-sm leading-6 text-[#B8C3CC]">
                    Will distinguish favorable, unfavorable, and mixed structural zones.
                  </div>
                </div>
                <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
                  <div className="mb-2 text-sm uppercase tracking-[0.14em] text-[#7E8A96]">Decision Layer</div>
                  <div className="text-sm leading-6 text-[#B8C3CC]">
                    Will guide focus areas and regime interpretation once the signal engine is live.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market map section header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Layers3 className="h-5 w-5 text-[#B8C3CC]" />
                <h2 className="text-xl font-semibold text-white">Current Structural State of the Market</h2>
              </div>
              <div className="max-w-4xl text-sm leading-7 text-[#B8C3CC]">
                The market map shows where structural risk is concentrated now, how companies are
                positioned by valuation pressure and cash-generation trajectory, and where current
                structural stress is clustering under the active filters.
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-white">Three-Axis Structural Map</CardTitle>
                  <CardDescription className="text-[#B8C3CC]">
                    Each point is a company positioned by valuation pressure and cash-generation
                    trajectory, with color showing composite structural risk.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex h-[460px] items-center justify-center text-[#7E8A96]">
                      Loading current snapshot...
                    </div>
                  ) : (
                    <div className="h-[460px] w-full">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#B8C3CC]">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="rounded-full border border-[#203754] bg-[#0D2138] px-3 py-1">
                            Valuation Pressure →
                          </div>
                          <div className="rounded-full border border-[#203754] bg-[#0D2138] px-3 py-1">
                            Cash-Generation Trajectory ↑
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[#7E8A96]">Composite Risk:</span>
                          {["Very Low", "Low", "Moderate", "High", "Very High"].map((bucket) => (
                            <span key={bucket} className="inline-flex items-center gap-1 text-[11px]">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: compositeColor(bucket) }}
                              />
                              {bucket}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                          <CartesianGrid stroke={COLORS.border} />
                          <XAxis
                            type="number"
                            dataKey="x"
                            domain={[0, 1]}
                            tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                            axisLine={{ stroke: COLORS.border }}
                            tickLine={{ stroke: COLORS.border }}
                          />
                          <YAxis
                            type="number"
                            dataKey="y"
                            domain={[0, 1]}
                            tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                            axisLine={{ stroke: COLORS.border }}
                            tickLine={{ stroke: COLORS.border }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: COLORS.inset,
                              border: `1px solid ${COLORS.border}`,
                              borderRadius: 16,
                              color: COLORS.text,
                            }}
                            labelStyle={{ color: COLORS.text }}
                          />
                          <Scatter data={scatterData}>
                            {scatterData.map((entry, idx) => (
                              <Cell key={idx} fill={compositeColor(entry.composite_bucket)} />
                            ))}
                          </Scatter>
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#B8C3CC]" />
                    <CardTitle className="text-white">Active Risk Cluster</CardTitle>
                  </div>
                  <CardDescription className="text-[#B8C3CC]">
                    These names are currently registering the greatest structural stress under the active filters.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topRisk.map((row) => (
                    <div
                      key={row.symbol}
                      className="flex items-center justify-between rounded-xl border border-[#203754] bg-[#0D2138] px-4 py-3 transition hover:border-[#41506A]"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{row.symbol}</span>
                        <span className="text-xs text-[#7E8A96]">
                          {row.oal_label} • {row.risk_bucket_within_oal}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="border-[#203754]"
                          style={{ color: compositeColor(row.composite_bucket) }}
                        >
                          {row.composite_bucket}
                        </Badge>
                        <span className="font-mono text-sm text-white">
                          {row.composite_score?.toFixed(3)}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Cohort Outcomes */}
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
              <div className="max-w-4xl text-sm leading-7 text-[#B8C3CC]">
                This section shows how similar structural states have performed over time—linking current
                positioning to real historical outcomes.
              </div>
            </div>

            <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white">How to Read This</CardTitle>
                <CardDescription className="text-[#B8C3CC]">
                  Each cell shows how stocks in that structural state performed after formation month-end.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm leading-7 md:grid-cols-5">
                <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
                  <div className="mb-2 font-medium text-white">What it shows</div>
                  <div className="text-[#B8C3CC]">Historical outcomes for similar structural states.</div>
                </div>
                <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
                  <div className="mb-2 font-medium text-white">Columns</div>
                  <div className="text-[#B8C3CC]">Valuation pressure (Axis I).</div>
                </div>
                <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
                  <div className="mb-2 font-medium text-white">Rows</div>
                  <div className="text-[#B8C3CC]">Cash-generation trajectory (Axis II).</div>
                </div>
                <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
                  <div className="mb-2 font-medium text-white">Panels</div>
                  <div className="text-[#B8C3CC]">Financing fragility regime (Axis III).</div>
                </div>
                <div className="rounded-2xl border border-[#203754] bg-[#0D2138] p-4">
                  <div className="mb-2 font-medium text-white">Color + N</div>
                  <div className="text-[#B8C3CC]">Outcome strength and cohort sample size.</div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="text-sm text-[#B8C3CC]">Choose how cohort performance is measured.</div>
              {cohortMetric === "mean_return" && (
                <div className="text-xs text-[#7E8A96]">
                  Mean returns are sensitive to outliers. Cells marked ▲ or ▼ have median returns
                  that differ materially — hover for context.
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
                          active
                            ? "border-[#41506A] bg-[#0D2138] text-white"
                            : "border-[#203754] bg-[#0D2138] text-[#B8C3CC] hover:bg-[#112A47]"
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
                  ].map((item) => (
                    <div key={item.label} className="inline-flex items-center gap-2 text-[#B8C3CC]">
                      <span
                        className="h-3 w-3 rounded-sm border border-[#203754]"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              {cohortGrid?.panels.map((panel) => (
                <Card
                  key={panel.panel}
                  className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20"
                >
                  <CardHeader>
                    <CardTitle className="text-white">{panel.panel}</CardTitle>
                    <CardDescription className="text-[#B8C3CC]">
                      {cohortMetricLabel(cohortMetric)} over forward {cohortGrid.metadata.horizon_months}M
                      by Axis I × Axis II state.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-[auto_repeat(5,minmax(0,1fr))] gap-2 text-xs">
                      <div />
                      {cohortGrid.metadata.x_axis_labels.map((c) => (
                        <div key={c} className="text-center text-[#7E8A96]">{c}</div>
                      ))}
                      {panel.rows.map((row) => (
                        <React.Fragment key={`${panel.panel}-${row.axis2_bucket}`}>
                          <div className="flex items-center pr-2 text-[#7E8A96]">
                            {row.axis2_bucket}
                          </div>
                          {row.cells.map((cell) => {
                            const visibleValue = getCohortMetricValue(cell, cohortMetric);
                            const colorValue =
                              cohortMetric === "hit_rate"
                                ? ((visibleValue ?? 0) - 0.5) * 2
                                : visibleValue;
                            return (
                              <div
                                key={`${panel.panel}-${row.axis2_bucket}-${cell.axis1_bucket}`}
                                className="flex h-16 flex-col items-center justify-center rounded-2xl border border-[#203754] px-1 text-white"
                                style={{ backgroundColor: returnHeatColor(colorValue, cell.suppressed) }}
                                title={[
                                  `Panel: ${cell.axis3_panel}`,
                                  `Axis II: ${cell.axis2_bucket}`,
                                  `Axis I: ${cell.axis1_bucket}`,
                                  `Mean Return: ${formatPctSigned(cell.mean_return)}`,
                                  `Median Return: ${formatPctSigned(cell.median_return)}`,
                                  `Hit Rate: ${formatPct(cell.hit_rate)}`,
                                  `Count: ${formatNum(cell.count)}`,
                                  cell.suppressed
                                    ? `Suppressed: count < ${cohortGrid.metadata.min_count_for_display}`
                                    : null,
                                  cohortMetric === "mean_return" && skewSignal(cell) === "right"
                                    ? `Median: ${formatPctSigned(cell.median_return)} — mean inflated by high-return outliers`
                                    : null,
                                  cohortMetric === "mean_return" && skewSignal(cell) === "left"
                                    ? `Median: ${formatPctSigned(cell.median_return)} — mean dragged down by large losses`
                                    : null,
                                ].filter(Boolean).join(" | ")}
                              >
                                <div className="text-[11px] font-medium">
                                  {formatCohortMetric(visibleValue, cohortMetric)}
                                </div>
                                {cohortMetric === "mean_return" && (() => {
                                  const skew = skewSignal(cell);
                                  if (skew === "none") return null;
                                  return (
                                    <div
                                      className="mt-0.5 text-[9px] font-medium"
                                      style={{
                                        color: skew === "right"
                                          ? COLORS.positiveSoft
                                          : COLORS.negativeSoft,
                                      }}
                                    >
                                      {skew === "right" ? "▲ skewed" : "▼ skewed"}
                                    </div>
                                  );
                                })()}
                                <div className="mt-0.5 text-[10px] text-[#EAF0F2]/80">
                                  N={formatNum(cell.count)}
                                </div>
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

            {/* Cohort Insight Layer placeholder — CardContent included to prevent padding gap */}
            <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white">Cohort Insight Layer</CardTitle>
                <CardDescription className="text-[#B8C3CC]">
                  This panel will surface data-driven historical pattern summaries once cohort
                  interpretation is generated directly from the live outcome surfaces.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border border-[#203754] bg-[#0D2138] px-5 py-4 text-sm text-[#7E8A96]">
                  Insight generation is not yet active. Patterns will appear here once the signal engine is live.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="snapshot" className="space-y-6">
            <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white">Current Snapshot</CardTitle>
                <CardDescription className="text-[#B8C3CC]">
                  Detailed structural state for each company in the current snapshot. "Valuation Bucket"
                  refers to Axis I within-OAL ranking, not total composite risk.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 text-sm leading-7 text-[#B8C3CC]">
                  Use this table to inspect the full structural profile of each company in the current snapshot.
                </div>
                <div className="overflow-hidden rounded-2xl border border-[#203754]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#203754] bg-[#0D2138]">
                        <TableHead className="text-[#B8C3CC]">Symbol</TableHead>
                        <TableHead className="text-[#B8C3CC]">OAL</TableHead>
                        <TableHead className="text-[#B8C3CC]">Axis I</TableHead>
                        <TableHead className="text-[#B8C3CC]">Axis II</TableHead>
                        <TableHead className="text-[#B8C3CC]">Axis III</TableHead>
                        <TableHead className="text-[#B8C3CC]">Composite</TableHead>
                        <TableHead className="text-[#B8C3CC]">Valuation Bucket</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((row) => (
                        <TableRow key={row.symbol} className="border-[#203754] hover:bg-[#0D2138]/70">
                          <TableCell className="font-medium text-white">{row.symbol}</TableCell>
                          <TableCell className="text-[#EAF0F2]">{row.oal_label}</TableCell>
                          <TableCell className="text-[#EAF0F2]">
                            {row.axis1_pct?.toFixed(3) ?? "—"}
                          </TableCell>
                          <TableCell className="text-[#EAF0F2]">
                            {row.axis2_pct == null ? "—" : row.axis2_pct.toFixed(3)}
                          </TableCell>
                          <TableCell className="text-[#EAF0F2]">
                            {row.axis3_pct?.toFixed(3) ?? "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">
                                {row.composite_score?.toFixed(3) ?? "—"}
                              </span>
                              <Badge
                                variant="outline"
                                className="border-[#203754] text-[#B8C3CC]"
                                style={{ backgroundColor: `${compositeColor(row.composite_bucket)}22` }}
                              >
                                {row.composite_bucket}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#EAF0F2]">
                            {row.risk_bucket_within_oal ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                  <div className="mb-6 text-sm leading-7 text-[#B8C3CC]">
                    Shows how companies are distributed across operating support levels within the current regime.
                  </div>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={oalSummary} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                        <CartesianGrid stroke={COLORS.border} vertical={false} />
                        <XAxis
                          dataKey="oal_label"
                          tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                          axisLine={{ stroke: COLORS.border }}
                          tickLine={{ stroke: COLORS.border }}
                        />
                        <YAxis
                          tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                          axisLine={{ stroke: COLORS.border }}
                          tickLine={{ stroke: COLORS.border }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: COLORS.inset,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 16,
                            color: COLORS.text,
                          }}
                        />
                        <Bar dataKey="n" radius={[12, 12, 0, 0]} fill={COLORS.positiveSoft} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-white">Operational Anchor Summary</CardTitle>
                  <CardDescription className="text-[#B8C3CC]">
                    Summary derived from the current structural snapshot.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-2xl border border-[#203754]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#203754] bg-[#0D2138]">
                          <TableHead className="text-[#B8C3CC]">OAL</TableHead>
                          <TableHead className="text-[#B8C3CC]">Count</TableHead>
                          <TableHead className="text-[#B8C3CC]">Median Axis I</TableHead>
                          <TableHead className="text-[#B8C3CC]">Median Axis III</TableHead>
                          <TableHead className="text-[#B8C3CC]">Median Composite</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {oalSummary.map((row) => (
                          <TableRow key={row.oal_label} className="border-[#203754]">
                            <TableCell className="font-medium text-white">{row.oal_label}</TableCell>
                            <TableCell className="text-[#EAF0F2]">{formatNum(row.n)}</TableCell>
                            <TableCell className="text-[#EAF0F2]">
                              {row.median_axis1 == null ? "—" : row.median_axis1.toFixed(3)}
                            </TableCell>
                            <TableCell className="text-[#EAF0F2]">
                              {row.median_axis3 == null ? "—" : row.median_axis3.toFixed(3)}
                            </TableCell>
                            <TableCell className="text-[#EAF0F2]">
                              {row.median_composite == null ? "—" : row.median_composite.toFixed(3)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="liquidity" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#B8C3CC]" />
                    <CardTitle className="text-white">Liquidity Distribution</CardTitle>
                  </div>
                  <CardDescription className="text-[#B8C3CC]">
                    Liquidity summary from the current structural state snapshot.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 text-sm leading-7 text-[#B8C3CC]">
                    Provides context on capital access and balance sheet flexibility across the current structural state.
                  </div>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={liquiditySummary} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                        <CartesianGrid stroke={COLORS.border} vertical={false} />
                        <XAxis
                          dataKey="bucket"
                          tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                          axisLine={{ stroke: COLORS.border }}
                          tickLine={{ stroke: COLORS.border }}
                        />
                        <YAxis
                          tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                          axisLine={{ stroke: COLORS.border }}
                          tickLine={{ stroke: COLORS.border }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: COLORS.inset,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 16,
                            color: COLORS.text,
                          }}
                        />
                        <Bar dataKey="count" radius={[12, 12, 0, 0]} fill={COLORS.positiveSoft} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-white">System Notes</CardTitle>
                  <CardDescription className="text-[#B8C3CC]">
                    Current state of the platform's structural diagnostics layer.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-[#EAF0F2]">
                  <p>
                    <span className="font-medium text-white">1.</span> The market map, OAL summary,
                    liquidity distribution, and cohort return grids are live.
                  </p>
                  <p>
                    <span className="font-medium text-white">2.</span> Global filters apply
                    consistently across all tabs.
                  </p>
                  <p>
                    <span className="font-medium text-white">3.</span> The cohort grid toggle lets
                    you compare mean, median, and hit-rate surfaces for cross-validation.
                  </p>
                  <p>
                    <span className="font-medium text-white">4.</span> Upcoming expansion includes
                    ticker drilldowns, regime history views, and monthly publication workflows.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-5 w-5 text-[#B8C3CC]" />
                    <CardTitle className="text-white">Historical Coverage</CardTitle>
                  </div>
                  <CardDescription className="text-[#B8C3CC]">
                    Archived monthly structural snapshots currently available in the system.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 text-sm leading-7 text-[#B8C3CC]">
                    Defines the time coverage used to generate cohort outcomes and structural comparisons.
                  </div>
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
                        {historyManifest.map((row) => (
                          <TableRow key={row.month} className="border-[#203754]">
                            <TableCell className="font-medium text-white">{row.month}</TableCell>
                            <TableCell className="text-[#EAF0F2]">
                              {row.has_oal_scores === false ? "—" : formatNum(row.oal_scores_rows)}
                            </TableCell>
                            <TableCell className="text-[#EAF0F2]">
                              {row.has_oal_summary === false ? "—" : formatNum(row.oal_summary_rows)}
                            </TableCell>
                            <TableCell className="text-[#EAF0F2]">
                              {row.has_structural_snapshot === false ? "—" : formatNum(row.structural_rows)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-[#203754] bg-[#102642] shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-white">About Historical Coverage</CardTitle>
                  <CardDescription className="text-[#B8C3CC]">
                    How the platform's historical layer supports structural comparison over time.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-[#EAF0F2]">
                  <p>
                    <span className="font-medium text-white">1.</span> Archived monthly structural states
                    define the platform's historical coverage window.
                  </p>
                  <p>
                    <span className="font-medium text-white">2.</span> Cohort outcomes are calculated
                    from real formation-month states and forward returns.
                  </p>
                  <p>
                    <span className="font-medium text-white">3.</span> This historical layer supports
                    regime comparison across valuation, trajectory, and financing fragility.
                  </p>
                  <p>
                    <span className="font-medium text-white">4.</span> Historical coverage provides the
                    foundation for future drilldowns and regime history views.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}