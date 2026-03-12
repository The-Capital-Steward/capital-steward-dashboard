"use client";

import React, { useMemo, useState } from "react";
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
import { Search, Shield, Layers3, Activity, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = {
  bg: "#0A1730",
  surface: "#10203D",
  panel: "#14284A",
  border: "#243A61",
  text: "#E8EDF5",
  textSecondary: "#B7C3D8",
  textMuted: "#7F90AD",
  accent: "#5E7FBE",
  accentSecondary: "#8EA7D8",
  anchor: "#35598F",
  positive: "#3E8E6A",
  positiveSoft: "#6DAE8B",
  negative: "#C94C4C",
};

const snapshotData = [
  { symbol: "AAPL", oal_label: "FCF", risk_bucket_within_oal: "High", liq_bucket: "Very High", axis1_pct: 0.79, axis2_pct: 0.28, axis3_pct: 0.06, composite_score: 0.38, composite_bucket: "Low" },
  { symbol: "NVDA", oal_label: "FCF", risk_bucket_within_oal: "Very High", liq_bucket: "Very High", axis1_pct: 0.96, axis2_pct: 0.41, axis3_pct: 0.02, composite_score: 0.46, composite_bucket: "Moderate" },
  { symbol: "UBER", oal_label: "FCF", risk_bucket_within_oal: "Moderate", liq_bucket: "Very High", axis1_pct: 0.45, axis2_pct: 0.0, axis3_pct: 0.31, composite_score: 0.25, composite_bucket: "Very Low" },
  { symbol: "DDOG", oal_label: "FCF", risk_bucket_within_oal: "High", liq_bucket: "Very High", axis1_pct: 0.83, axis2_pct: 0.0, axis3_pct: 0.18, composite_score: 0.34, composite_bucket: "Low" },
  { symbol: "AAL", oal_label: "Net Income", risk_bucket_within_oal: "Very High", liq_bucket: "Very High", axis1_pct: 0.96, axis2_pct: null, axis3_pct: 0.74, composite_score: 0.85, composite_bucket: "Very High" },
  { symbol: "ABNB", oal_label: "FCF", risk_bucket_within_oal: "High", liq_bucket: "Very High", axis1_pct: 0.72, axis2_pct: 0.07, axis3_pct: 0.01, composite_score: 0.27, composite_bucket: "Very Low" },
  { symbol: "ABCL", oal_label: "Revenue", risk_bucket_within_oal: "High", liq_bucket: "High", axis1_pct: 0.71, axis2_pct: null, axis3_pct: 1.0, composite_score: 0.86, composite_bucket: "Very High" },
  { symbol: "MRX", oal_label: "FCF", risk_bucket_within_oal: "Very Low", liq_bucket: "Low", axis1_pct: 0.04, axis2_pct: 0.0, axis3_pct: 0.12, composite_score: 0.05, composite_bucket: "Very Low" },
  { symbol: "IOT", oal_label: "FCF", risk_bucket_within_oal: "Very High", liq_bucket: "High", axis1_pct: 0.9, axis2_pct: 0.0, axis3_pct: 0.04, composite_score: 0.31, composite_bucket: "Low" },
  { symbol: "THRY", oal_label: "FCF", risk_bucket_within_oal: "Low", liq_bucket: "Moderate", axis1_pct: 0.22, axis2_pct: 1.0, axis3_pct: 0.21, composite_score: 0.48, composite_bucket: "Moderate" },
  { symbol: "AGNC", oal_label: "FCF", risk_bucket_within_oal: "Very High", liq_bucket: "High", axis1_pct: 0.96, axis2_pct: 0.99, axis3_pct: 0.55, composite_score: 0.83, composite_bucket: "Very High" },
  { symbol: "ABEO", oal_label: "Net Income", risk_bucket_within_oal: "Very Low", liq_bucket: "Low", axis1_pct: 0.06, axis2_pct: null, axis3_pct: 0.91, composite_score: 0.48, composite_bucket: "Moderate" },
];

const oalSummary = [
  { oal_label: "FCF", n: 2872, median_multiple: 19.8, median_axis3: 0.44, median_composite: 0.47 },
  { oal_label: "Net Income", n: 641, median_multiple: 27.7, median_axis3: 0.2, median_composite: 0.39 },
  { oal_label: "EBIT", n: 109, median_multiple: 52.5, median_axis3: 0.82, median_composite: 0.64 },
  { oal_label: "Revenue", n: 1168, median_multiple: 3.7, median_axis3: 1.0, median_composite: 0.66 },
  { oal_label: "Non-viable", n: 372, median_multiple: null, median_axis3: 1.0, median_composite: 1.0 },
];

const liquiditySummary = [
  { bucket: "Very Low", count: 1030 },
  { bucket: "Low", count: 1031 },
  { bucket: "Moderate", count: 1031 },
  { bucket: "High", count: 1031 },
  { bucket: "Very High", count: 1031 },
  { bucket: "No Data", count: 8 },
];

const heatmapRows = ["Very Weak", "Weak", "Neutral", "Strong", "Very Strong"];
const heatmapCols = ["Very Low", "Low", "Moderate", "High", "Very High"];
const heatmapPanels = {
  "Low Fragility": [
    [0.11, 0.09, 0.07, 0.04, 0.01],
    [0.13, 0.1, 0.08, 0.05, 0.02],
    [0.14, 0.12, 0.09, 0.04, 0.0],
    [0.16, 0.13, 0.1, 0.05, 0.01],
    [0.18, 0.15, 0.12, 0.07, 0.02],
  ],
  "Moderate Fragility": [
    [0.08, 0.06, 0.03, 0.0, -0.03],
    [0.09, 0.07, 0.04, 0.0, -0.04],
    [0.1, 0.08, 0.05, 0.01, -0.05],
    [0.11, 0.08, 0.04, -0.01, -0.06],
    [0.12, 0.09, 0.05, -0.02, -0.07],
  ],
  "High Fragility": [
    [0.03, 0.01, -0.02, -0.06, -0.11],
    [0.04, 0.01, -0.03, -0.07, -0.12],
    [0.05, 0.02, -0.04, -0.08, -0.14],
    [0.06, 0.02, -0.05, -0.09, -0.16],
    [0.07, 0.03, -0.05, -0.1, -0.18],
  ],
};

const bucketOrder = ["Very Low", "Low", "Moderate", "High", "Very High"];
const oalOrder = ["FCF", "Net Income", "EBIT", "Revenue", "Non-viable"];

function formatPct(v: number | null) {
  if (v == null || Number.isNaN(v)) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function formatNum(v: number | null) {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toLocaleString();
}

function heatColor(v: number | null) {
  if (v == null || Number.isNaN(v)) return "#20314F";
  if (v <= -0.15) return "#6E2D2D";
  if (v <= -0.1) return "#8B3838";
  if (v <= -0.05) return "#A84848";
  if (v < 0) return "#BC6464";
  if (v < 0.05) return "#475B7B";
  if (v < 0.1) return "#5E7FBE";
  if (v < 0.15) return "#6DAE8B";
  return "#3E8E6A";
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

export default function DashboardPage() {
  const [selectedOAL, setSelectedOAL] = useState("All");
  const [selectedBucket, setSelectedBucket] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return snapshotData.filter((row) => {
      const matchOAL = selectedOAL === "All" || row.oal_label === selectedOAL;
      const matchBucket = selectedBucket === "All" || row.composite_bucket === selectedBucket;
      const matchSearch = !search || row.symbol.toLowerCase().includes(search.toLowerCase());
      return matchOAL && matchBucket && matchSearch;
    });
  }, [selectedOAL, selectedBucket, search]);

  const topRisk = useMemo(() => {
    return [...filtered].sort((a, b) => b.composite_score - a.composite_score).slice(0, 12);
  }, [filtered]);

  const stats = useMemo(() => {
    const total = snapshotData.length;
    const avgComposite = snapshotData.reduce((acc, row) => acc + row.composite_score, 0) / total;
    const veryHigh = snapshotData.filter((r) => r.composite_bucket === "Very High").length;
    const fragile = snapshotData.filter((r) => r.axis3_pct >= 0.8).length;
    return { total, avgComposite, veryHigh, fragile };
  }, []);

  const scatterData = filtered.map((row) => ({
    x: row.axis1_pct,
    y: row.axis2_pct ?? 0.5,
    z: row.axis3_pct,
    symbol: row.symbol,
    oal_label: row.oal_label,
    composite_bucket: row.composite_bucket,
  }));

  return (
    <div className="min-h-screen bg-[#0A1730] text-[#E8EDF5]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge className="rounded-full border border-[#243A61] bg-[#10203D] px-3 py-1 text-[#B7C3D8] hover:bg-[#10203D]">
              OSMR Structural Risk Dashboard
            </Badge>
            <Badge variant="outline" className="rounded-full border-[#243A61] text-[#7F90AD]">
              Prototype
            </Badge>
          </div>
          <h1 className="tcs-heading max-w-4xl text-4xl font-semibold text-white md:text-5xl">
            A structural map of the equity market, built from operating anchors, cash trajectory, and financing fragility.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#B7C3D8] md:text-lg">
            This prototype turns the OSMR framework into an interactive research interface. The final production version should read directly from monthly snapshot files and historical cohort tables.
          </p>
        </motion.div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B7C3D8]">Universe Size</CardDescription>
              <CardTitle className="text-3xl text-white">{formatNum(stats.total)}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7F90AD]">
              Current snapshot rows in the structural map.
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B7C3D8]">Average Composite Risk</CardDescription>
              <CardTitle className="text-3xl text-white">{formatPct(stats.avgComposite)}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7F90AD]">
              Cross-sectional average of the composite structural risk score.
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B7C3D8]">Very High Composite</CardDescription>
              <CardTitle className="text-3xl text-white">{formatNum(stats.veryHigh)}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7F90AD]">
              Names currently sitting in the highest structural risk bucket.
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#B7C3D8]">High Financing Fragility</CardDescription>
              <CardTitle className="text-3xl text-white">{formatNum(stats.fragile)}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#7F90AD]">
              Names with financing fragility in the top quintile.
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="market-map" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-2xl border border-[#243A61] bg-[#10203D] p-2 md:grid-cols-4">
            <TabsTrigger value="market-map" className="rounded-xl data-[state=active]:bg-[#35598F] data-[state=active]:text-white">
              Market Map
            </TabsTrigger>
            <TabsTrigger value="snapshot" className="rounded-xl data-[state=active]:bg-[#35598F] data-[state=active]:text-white">
              Snapshot Table
            </TabsTrigger>
            <TabsTrigger value="oal" className="rounded-xl data-[state=active]:bg-[#35598F] data-[state=active]:text-white">
              OAL Structure
            </TabsTrigger>
            <TabsTrigger value="liquidity" className="rounded-xl data-[state=active]:bg-[#35598F] data-[state=active]:text-white">
              Liquidity
            </TabsTrigger>
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
                    Valuation pressure on the x-axis, FCF trajectory on the y-axis, financing fragility represented in hover data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <Card className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#B7C3D8]" />
                    <CardTitle className="text-white">Highest Composite Risk</CardTitle>
                  </div>
                  <CardDescription className="text-[#B7C3D8]">
                    Prototype list of names with the greatest structural risk according to the current composite score.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topRisk.map((row) => (
                    <div
                      key={row.symbol}
                      className="flex items-center justify-between rounded-2xl border border-[#243A61] bg-[#10203D] px-4 py-3"
                    >
                      <div>
                        <div className="font-medium text-white">{row.symbol}</div>
                        <div className="text-sm text-[#7F90AD]">
                          {row.oal_label} · {row.composite_bucket}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-[#B7C3D8]">Composite</div>
                        <div className="font-medium text-white">{row.composite_score.toFixed(3)}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              {Object.entries(heatmapPanels).map(([panelTitle, grid]) => (
                <Card key={panelTitle} className="rounded-3xl border border-[#243A61] bg-[#14284A] shadow-xl shadow-black/20">
                  <CardHeader>
                    <CardTitle className="text-white">{panelTitle}</CardTitle>
                    <CardDescription className="text-[#B7C3D8]">
                      Prototype forward-return heatmap by valuation pressure and trajectory bucket.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-[auto_repeat(5,minmax(0,1fr))] gap-2 text-xs">
                      <div />
                      {heatmapCols.map((c) => (
                        <div key={c} className="text-center text-[#7F90AD]">
                          {c}
                        </div>
                      ))}
                      {heatmapRows.map((r, rowIdx) => (
                        <React.Fragment key={r}>
                          <div className="flex items-center pr-2 text-[#7F90AD]">{r}</div>
                          {grid[rowIdx].map((v, colIdx) => (
                            <div
                              key={`${r}-${colIdx}`}
                              className="flex h-14 items-center justify-center rounded-2xl border border-[#243A61] font-medium text-white"
                              style={{ backgroundColor: heatColor(v) }}
                              title={`${panelTitle} | ${r} | ${heatmapCols[colIdx]} = ${formatPct(v)}`}
                            >
                              {formatPct(v)}
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
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <CardTitle className="text-white">Structural Snapshot Table</CardTitle>
                    <CardDescription className="text-[#B7C3D8]">
                      This table should eventually be populated directly from the monthly structural snapshot CSV generated by the pipeline.
                    </CardDescription>
                  </div>
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
                        <SelectItem value="All">All Buckets</SelectItem>
                        {bucketOrder.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-2xl border border-[#243A61]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#243A61] bg-[#10203D]">
                        <TableHead className="text-[#B7C3D8]">Symbol</TableHead>
                        <TableHead className="text-[#B7C3D8]">OAL</TableHead>
                        <TableHead className="text-[#B7C3D8]">Valuation</TableHead>
                        <TableHead className="text-[#B7C3D8]">Trajectory</TableHead>
                        <TableHead className="text-[#B7C3D8]">Fragility</TableHead>
                        <TableHead className="text-[#B7C3D8]">Composite</TableHead>
                        <TableHead className="text-[#B7C3D8]">Liquidity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((row) => (
                        <TableRow key={row.symbol} className="border-[#243A61]">
                          <TableCell className="font-medium text-white">{row.symbol}</TableCell>
                          <TableCell className="text-[#E8EDF5]">{row.oal_label}</TableCell>
                          <TableCell className="text-[#E8EDF5]">{row.axis1_pct.toFixed(3)}</TableCell>
                          <TableCell className="text-[#E8EDF5]">
                            {row.axis2_pct == null ? "—" : row.axis2_pct.toFixed(3)}
                          </TableCell>
                          <TableCell className="text-[#E8EDF5]">{row.axis3_pct.toFixed(3)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{row.composite_score.toFixed(3)}</span>
                              <Badge
                                variant="outline"
                                className="border-[#243A61] text-[#B7C3D8]"
                                style={{ backgroundColor: `${compositeColor(row.composite_bucket)}22` }}
                              >
                                {row.composite_bucket}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#E8EDF5]">{row.liq_bucket}</TableCell>
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
                    Operational Anchor Ladder distribution across the current snapshot.
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
                    Prototype summary card. Production version should render from the latest oal_summary output automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-2xl border border-[#243A61]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#243A61] bg-[#10203D]">
                          <TableHead className="text-[#B7C3D8]">OAL</TableHead>
                          <TableHead className="text-[#B7C3D8]">Count</TableHead>
                          <TableHead className="text-[#B7C3D8]">Median Multiple</TableHead>
                          <TableHead className="text-[#B7C3D8]">Median Fragility</TableHead>
                          <TableHead className="text-[#B7C3D8]">Median Composite</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {oalSummary.map((row) => (
                          <TableRow key={row.oal_label} className="border-[#243A61]">
                            <TableCell className="font-medium text-white">{row.oal_label}</TableCell>
                            <TableCell className="text-[#E8EDF5]">{formatNum(row.n)}</TableCell>
                            <TableCell className="text-[#E8EDF5]">
                              {row.median_multiple == null ? "—" : `${row.median_multiple.toFixed(1)}x`}
                            </TableCell>
                            <TableCell className="text-[#E8EDF5]">{row.median_axis3.toFixed(3)}</TableCell>
                            <TableCell className="text-[#E8EDF5]">{row.median_composite.toFixed(3)}</TableCell>
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
                    Full-universe ADV bucket counts. Liquidity is measured, not used as an early filter.
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
                    Suggested production wiring for the website version of this dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-[#E8EDF5]">
                  <p>
                    <span className="font-medium text-white">1.</span> Read the latest monthly snapshot from the structural pipeline rather than hardcoding data.
                  </p>
                  <p>
                    <span className="font-medium text-white">2.</span> Cache pre-aggregated cohort tables for heatmaps so the site stays fast.
                  </p>
                  <p>
                    <span className="font-medium text-white">3.</span> Export both HTML-ready JSON and SVG assets so the same research layer can power the dashboard, the PDF report, and the email summary.
                  </p>
                  <p>
                    <span className="font-medium text-white">4.</span> Keep the interface restrained: one primary market map, one cohort heatmap, one searchable table.
                  </p>
                  <div className="pt-2">
                    <Button className="rounded-2xl bg-[#5E7FBE] text-white hover:bg-[#4A6FA5]">
                      Next: wire live pipeline outputs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}