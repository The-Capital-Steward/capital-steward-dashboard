"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Search, Shield, Layers3, Activity, AlertTriangle, Clock3, Filter, Grid3X3 } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = {
  bg: "#0A1730",
  surface: "#10203D",
  panel: "#14284A",
  panelAlt: "#0F1F3C",
  border: "#243A61",
  text: "#E8EDF5",
  textSecondary: "#B7C3D8",
  textMuted: "#7F90AD",
  accent: "#5E7FBE",
  accentSecondary: "#8EA7D8",
  anchor: "#0A1730",
  positive: "#3E8E6A",
  positiveSoft: "#6DAE8B",
  negative: "#C94C4C",
};

type SnapshotRow = {
  symbol: string;
  oal_label: string | null;
  risk_bucket_within_oal: string | null;
  axis1_pct: number | null;
  axis2_pct: number | null;
  axis2_plot: number | null;
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
  has_oal_scores: boolean;
  has_oal_summary: boolean;
  has_structural_snapshot: boolean;
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
    Moderate: COLORS.accentSecondary,
    High: COLORS.accent,
    "Very High": COLORS.negative,
  };
  return colorMap[bucket ?? ""] ?? COLORS.textMuted;
}

function returnHeatColor(v: number | null, suppressed: boolean) {
  if (suppressed || v == null || Number.isNaN(v)) return "#20314F";
  if (v <= -0.25) return "#6E2D2D";
  if (v <= -0.15) return "#8B3838";
  if (v <= -0.08) return "#A84848";
  if (v < 0) return "#BC6464";
  if (v < 0.04) return "#475B7B";
  if (v < 0.08) return "#5E7FBE";
  if (v < 0.15) return "#6DAE8B";
  return "#3E8E6A";
}

export default function DashboardPage() {
  const [snapshotData, setSnapshotData] = useState<SnapshotRow[]>([]);
  const [oalSummary, setOALSummary] = useState<OALSummaryRow[]>([]);
  const [liquiditySummary, setLiquiditySummary] = useState<LiquiditySummaryRow[]>([]);
  const [historyManifest, setHistoryManifest] = useState<HistoryManifestRow[]>([]);
  const [cohortGrid, setCohortGrid] = useState<HistoricalCohortGridPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedOAL, setSelectedOAL] = useState("All");
  const [selectedBucket, setSelectedBucket] = useState("All");
  const [search, setSearch] = useState("");

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

  const scatterData = filtered.map((row) => ({
    x: row.axis1_pct,
    y: row.axis2_plot ?? 0.5,
    z: row.axis3_pct,
    symbol: row.symbol,
    oal_label: row.oal_label,
    composite_bucket: row.composite_bucket,
  }));

  const clearFilters = () => {
    setSelectedOAL("All");
    setSelectedBucket("All");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-[#0A1730] text-[#E8EDF5]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-12 max-w-5xl"
        >
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <Badge className="rounded-full border border-[#243A61] bg-[#10203D] px-3 py-1 text-[#B7C3D8] hover:bg-[#10203D]">
              OSMR Structural Risk Dashboard
            </Badge>
            <Badge variant="outline" className="rounded-full border-[#243A61] text-[#7F90AD]">
              Live Data
            </Badge>
          </div>

          <h1 className="tcs-heading text-5xl font-semibold leading-tight text-white md:text-6xl">
            Structural mapping of the corporate economy.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#B7C3D8]">
            The Capital Steward’s OSMR framework maps structural risk across the equity
            universe using operating anchors, free-cash-flow trajectory, and financing
            fragility.
          </p>
        </motion.div>

        <Card className="mb-10 rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#B7C3D8]" />
                  <CardTitle className="text-white">Global Filters</CardTitle>
                </div>
                <CardDescription className="text-[#B7C3D8]">
                  These controls apply across the full dashboard, including the market map, tables, and summary cards.
                </CardDescription>
              </div>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="rounded-2xl border-[#243A61] bg-transparent text-[#B7C3D8] hover:bg-[#10203D] hover:text-white"
              >
                Clear Filters
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#7F90AD]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search symbol"
                  className="rounded-2xl border-[#243A61] bg-[#10203D] pl-9 text-white placeholder:text-[#7F90AD]"
                />
              </div>

              <Select value={selectedOAL} onValueChange={setSelectedOAL}>
                <SelectTrigger className="rounded-2xl border-[#243A61] bg-[#10203D] text-white">
                  <SelectValue placeholder="OAL" />
                </SelectTrigger>
                <SelectContent className="border-[#243A61] bg-[#10203D] text-white">
                  <SelectItem value="All">All OALs</SelectItem>
                  {oalOrder.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                <SelectTrigger className="rounded-2xl border-[#243A61] bg-[#10203D] text-white">
                  <SelectValue placeholder="Composite Bucket" />
                </SelectTrigger>
                <SelectContent className="border-[#243A61] bg-[#10203D] text-white">
                  <SelectItem value="All">All Composite Buckets</SelectItem>
                  {bucketOrder.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B7C3D8]">Universe Plotted</CardDescription>
              <CardTitle className="text-3xl text-white">
                {loading ? "…" : formatNum(stats.total)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7F90AD]">
              Names currently in the filtered universe.
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B7C3D8]">Average Composite</CardDescription>
              <CardTitle className="text-3xl text-white">
                {loading ? "…" : formatPct(stats.avgComposite)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7F90AD]">
              Average composite score of the filtered cohort.
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B7C3D8]">Very High Composite</CardDescription>
              <CardTitle className="text-3xl text-white">
                {loading ? "…" : formatNum(stats.veryHigh)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7F90AD]">
              Names currently in the highest composite bucket.
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B7C3D8]">High Financing Fragility</CardDescription>
              <CardTitle className="text-3xl text-white">
                {loading ? "…" : formatNum(stats.fragile)}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7F90AD]">
              Filtered names with top-quintile Axis III fragility.
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="market-map" className="space-y-8">
          <TabsList className="flex w-full gap-2 border-b border-[#243A61] bg-transparent p-0">
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
                className="rounded-none border-b-2 border-transparent px-4 py-3 text-[#B7C3D8] data-[state=active]:border-[#5E7FBE] data-[state=active]:bg-[#F5F2EA] data-[state=active]:text-[#0A1730]"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="market-map" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Layers3 className="h-5 w-5 text-[#B7C3D8]" />
                    <CardTitle className="text-white">Three-Axis Structural Map</CardTitle>
                  </div>
                  <CardDescription className="text-[#B7C3D8]">
                    Valuation pressure on the x-axis, FCF trajectory on the y-axis, financing fragility encoded by composite bucket color.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex h-[420px] items-center justify-center text-[#7F90AD]">
                      Loading live snapshot...
                    </div>
                  ) : (
                    <div className="h-[420px] w-full">
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
                              backgroundColor: COLORS.surface,
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

              <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#B7C3D8]" />
                    <CardTitle className="text-white">Highest Composite Risk</CardTitle>
                  </div>
                  <CardDescription className="text-[#B7C3D8]">
                    Live list of names with the greatest structural risk according to the latest composite score.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topRisk.map((row) => (
                    <div
                      key={row.symbol}
                      className="flex items-center justify-between rounded-xl border border-[#243A61] bg-[#0F1F3C] px-4 py-3 transition hover:border-[#35598F]"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{row.symbol}</span>
                        <span className="text-xs text-[#7F90AD]">
                          {row.oal_label} • {row.risk_bucket_within_oal}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="border-[#243A61]"
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

            <div className="flex items-center gap-3">
              <Grid3X3 className="h-5 w-5 text-[#B7C3D8]" />
              <h2 className="text-xl font-semibold text-white">Historical Cohort Return Grid</h2>
              {cohortGrid?.metadata && (
                <Badge variant="outline" className="border-[#243A61] text-[#7F90AD]">
                  {cohortGrid.metadata.horizon_months}M Forward
                </Badge>
              )}
            </div>

            <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white">How to read the grids</CardTitle>
                <CardDescription className="text-[#B7C3D8]">
                  Each cell shows the historical average forward return for stocks that sat in that structural state at formation month-end.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3 text-sm leading-7">
                <div className="rounded-2xl border border-[#243A61] bg-[#10203D] p-4">
                  <div className="mb-2 font-medium text-white">Columns = Axis I</div>
                  <div className="text-[#B7C3D8]">Valuation Pressure within OAL, from Very Low to Very High.</div>
                </div>
                <div className="rounded-2xl border border-[#243A61] bg-[#10203D] p-4">
                  <div className="mb-2 font-medium text-white">Rows = Axis II</div>
                  <div className="text-[#B7C3D8]">Cash-Engine Trajectory, from Very Weak to Very Strong.</div>
                </div>
                <div className="rounded-2xl border border-[#243A61] bg-[#10203D] p-4">
                  <div className="mb-2 font-medium text-white">Panels = Axis III</div>
                  <div className="text-[#B7C3D8]">Financing Fragility regime: Low, Moderate, or High.</div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-3">
              {cohortGrid?.panels.map((panel) => (
                <Card key={panel.panel} className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
                  <CardHeader>
                    <CardTitle className="text-white">{panel.panel}</CardTitle>
                    <CardDescription className="text-[#B7C3D8]">
                      Mean forward {cohortGrid.metadata.horizon_months}M return by Axis I × Axis II state.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-[auto_repeat(5,minmax(0,1fr))] gap-2 text-xs">
                      <div />
                      {cohortGrid.metadata.x_axis_labels.map((c) => (
                        <div key={c} className="text-center text-[#7F90AD]">
                          {c}
                        </div>
                      ))}

                      {panel.rows.map((row) => (
                        <React.Fragment key={`${panel.panel}-${row.axis2_bucket}`}>
                          <div className="flex items-center pr-2 text-[#7F90AD]">{row.axis2_bucket}</div>
                          {row.cells.map((cell) => (
                            <div
                              key={`${panel.panel}-${row.axis2_bucket}-${cell.axis1_bucket}`}
                              className="flex h-16 flex-col items-center justify-center rounded-2xl border border-[#243A61] px-1 text-white"
                              style={{ backgroundColor: returnHeatColor(cell.display_value, cell.suppressed) }}
                              title={[
                                `Panel: ${cell.axis3_panel}`,
                                `Axis II: ${cell.axis2_bucket}`,
                                `Axis I: ${cell.axis1_bucket}`,
                                `Mean Return: ${formatPctSigned(cell.mean_return)}`,
                                `Median Return: ${formatPctSigned(cell.median_return)}`,
                                `Hit Rate: ${formatPct(cell.hit_rate)}`,
                                `Count: ${formatNum(cell.count)}`,
                                cell.suppressed ? `Suppressed: count < ${cohortGrid.metadata.min_count_for_display}` : null,
                              ]
                                .filter(Boolean)
                                .join(" | ")}
                            >
                              <div className="text-[11px] font-medium">
                                {cell.suppressed ? "—" : formatPctSigned(cell.display_value)}
                              </div>
                              <div className="mt-1 text-[10px] text-[#E8EDF5]/80">
                                N={formatNum(cell.count)}
                              </div>
                            </div>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="snapshot" className="space-y-6">
            <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-white">Structural Snapshot Table</CardTitle>
                <CardDescription className="text-[#B7C3D8]">
                  Live table from the latest exported structural snapshot. “Valuation Bucket” refers only to Axis I within-OAL ranking, not total composite risk.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-2xl border border-[#243A61]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#243A61] bg-[#10203D]">
                        <TableHead className="text-[#B7C3D8]">Symbol</TableHead>
                        <TableHead className="text-[#B7C3D8]">OAL</TableHead>
                        <TableHead className="text-[#B7C3D8]">Axis I</TableHead>
                        <TableHead className="text-[#B7C3D8]">Axis II</TableHead>
                        <TableHead className="text-[#B7C3D8]">Axis III</TableHead>
                        <TableHead className="text-[#B7C3D8]">Composite</TableHead>
                        <TableHead className="text-[#B7C3D8]">Valuation Bucket</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((row) => (
                        <TableRow key={row.symbol} className="border-[#243A61]">
                          <TableCell className="font-medium text-white">{row.symbol}</TableCell>
                          <TableCell className="text-[#E8EDF5]">{row.oal_label}</TableCell>
                          <TableCell className="text-[#E8EDF5]">{row.axis1_pct?.toFixed(3) ?? "—"}</TableCell>
                          <TableCell className="text-[#E8EDF5]">
                            {row.axis2_pct == null ? "—" : row.axis2_pct.toFixed(3)}
                          </TableCell>
                          <TableCell className="text-[#E8EDF5]">{row.axis3_pct?.toFixed(3) ?? "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">
                                {row.composite_score?.toFixed(3) ?? "—"}
                              </span>
                              <Badge
                                variant="outline"
                                className="border-[#243A61] text-[#B7C3D8]"
                                style={{ backgroundColor: `${compositeColor(row.composite_bucket)}22` }}
                              >
                                {row.composite_bucket}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#E8EDF5]">
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
              <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#B7C3D8]" />
                    <CardTitle className="text-white">OAL Cohort Structure</CardTitle>
                  </div>
                  <CardDescription className="text-[#B7C3D8]">
                    Live Operational Anchor Ladder distribution across the filtered snapshot.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={oalSummary} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                        <CartesianGrid stroke={COLORS.border} vertical={false} />
                        <XAxis dataKey="oal_label" tick={{ fill: COLORS.textSecondary, fontSize: 12 }} axisLine={{ stroke: COLORS.border }} tickLine={{ stroke: COLORS.border }} />
                        <YAxis tick={{ fill: COLORS.textSecondary, fontSize: 12 }} axisLine={{ stroke: COLORS.border }} tickLine={{ stroke: COLORS.border }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: COLORS.surface,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 16,
                            color: COLORS.text,
                          }}
                        />
                        <Bar dataKey="n" radius={[12, 12, 0, 0]} fill={COLORS.accent} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-white">OAL Summary Table</CardTitle>
                  <CardDescription className="text-[#B7C3D8]">
                    Summary derived from the live exported snapshot.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-2xl border border-[#243A61]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#243A61] bg-[#10203D]">
                          <TableHead className="text-[#B7C3D8]">OAL</TableHead>
                          <TableHead className="text-[#B7C3D8]">Count</TableHead>
                          <TableHead className="text-[#B7C3D8]">Median Axis I</TableHead>
                          <TableHead className="text-[#B7C3D8]">Median Axis III</TableHead>
                          <TableHead className="text-[#B7C3D8]">Median Composite</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {oalSummary.map((row) => (
                          <TableRow key={row.oal_label} className="border-[#243A61]">
                            <TableCell className="font-medium text-white">{row.oal_label}</TableCell>
                            <TableCell className="text-[#E8EDF5]">{formatNum(row.n)}</TableCell>
                            <TableCell className="text-[#E8EDF5]">
                              {row.median_axis1 == null ? "—" : row.median_axis1.toFixed(3)}
                            </TableCell>
                            <TableCell className="text-[#E8EDF5]">
                              {row.median_axis3 == null ? "—" : row.median_axis3.toFixed(3)}
                            </TableCell>
                            <TableCell className="text-[#E8EDF5]">
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
              <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#B7C3D8]" />
                    <CardTitle className="text-white">Liquidity Distribution</CardTitle>
                  </div>
                  <CardDescription className="text-[#B7C3D8]">
                    Live liquidity summary exported from the structural state snapshot.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={liquiditySummary} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                        <CartesianGrid stroke={COLORS.border} vertical={false} />
                        <XAxis dataKey="bucket" tick={{ fill: COLORS.textSecondary, fontSize: 12 }} axisLine={{ stroke: COLORS.border }} tickLine={{ stroke: COLORS.border }} />
                        <YAxis tick={{ fill: COLORS.textSecondary, fontSize: 12 }} axisLine={{ stroke: COLORS.border }} tickLine={{ stroke: COLORS.border }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: COLORS.surface,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 16,
                            color: COLORS.text,
                          }}
                        />
                        <Bar dataKey="count" radius={[12, 12, 0, 0]} fill={COLORS.accentSecondary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-white">Implementation Notes</CardTitle>
                  <CardDescription className="text-[#B7C3D8]">
                    The dashboard is now reading from exported OSMR datasets.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-[#E8EDF5]">
                  <p>
                    <span className="font-medium text-white">1.</span> The market map, OAL summary, and liquidity distribution are now live.
                  </p>
                  <p>
                    <span className="font-medium text-white">2.</span> Global filters now apply consistently across tabs.
                  </p>
                  <p>
                    <span className="font-medium text-white">3.</span> The cohort return grids are now real historical outputs based on archived monthly states.
                  </p>
                  <p>
                    <span className="font-medium text-white">4.</span> The next big upgrade is ticker drilldowns and regime history views built on the same data layer.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-5 w-5 text-[#B7C3D8]" />
                    <CardTitle className="text-white">History Manifest</CardTitle>
                  </div>
                  <CardDescription className="text-[#B7C3D8]">
                    Stored monthly structural snapshots available to the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-2xl border border-[#243A61]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#243A61] bg-[#10203D]">
                          <TableHead className="text-[#B7C3D8]">Month</TableHead>
                          <TableHead className="text-[#B7C3D8]">OAL Scores</TableHead>
                          <TableHead className="text-[#B7C3D8]">OAL Summary</TableHead>
                          <TableHead className="text-[#B7C3D8]">Structural Snapshot</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyManifest.map((row) => (
                          <TableRow key={row.month} className="border-[#243A61]">
                            <TableCell className="font-medium text-white">{row.month}</TableCell>
                            <TableCell className="text-[#E8EDF5]">
                              {row.has_oal_scores ? formatNum(row.oal_scores_rows) : "—"}
                            </TableCell>
                            <TableCell className="text-[#E8EDF5]">
                              {row.has_oal_summary ? formatNum(row.oal_summary_rows) : "—"}
                            </TableCell>
                            <TableCell className="text-[#E8EDF5]">
                              {row.has_structural_snapshot ? formatNum(row.structural_rows) : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle className="text-white">History Status</CardTitle>
                  <CardDescription className="text-[#B7C3D8]">
                    Longitudinal research infrastructure is now active.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-[#E8EDF5]">
                  <p>
                    <span className="font-medium text-white">1.</span> The platform now tracks archived monthly structural states across the full backfill window.
                  </p>
                  <p>
                    <span className="font-medium text-white">2.</span> Historical cohort returns are now computed from real monthly formation states and forward returns.
                  </p>
                  <p>
                    <span className="font-medium text-white">3.</span> This gives you a true empirical regime surface across valuation, trajectory, and financing fragility.
                  </p>
                  <p>
                    <span className="font-medium text-white">4.</span> The next layer is company drilldowns, regime history pages, and monthly publication workflows.
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