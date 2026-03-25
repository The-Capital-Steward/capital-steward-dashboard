"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ResponsiveContainer, ScatterChart, Scatter, Cell,
  CartesianGrid, XAxis, YAxis,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type SnapshotRow = {
  symbol: string;
  oal_label: string | null;
  risk_bucket_within_oal: string | null;
  axis1_pct: number | null;
  axis2_pct: number | null;
  axis3_pct: number | null;
  composite_score: number | null;
  composite_bucket: string | null;
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

type CohortGridRow    = { axis2_bucket: string; cells: CohortGridCell[] };
type CohortGridPanel  = { panel: string; rows: CohortGridRow[] };
type CohortGridMeta   = { horizon_months: number; x_axis_labels: string[]; panels: string[]; observation_count: number; formation_month_min: string | null; formation_month_max: string | null; min_count_for_display: number };
type CohortGridPayload = { metadata: CohortGridMeta; panels: CohortGridPanel[] };

type QuintileBacktest = {
  summary: {
    bottom: { median_12m_return: number; hit_rate: number; percentiles: { p10: number; p25: number; p50: number; p75: number; p90: number } };
    middle: { median_12m_return: number; hit_rate: number; percentiles: { p10: number; p25: number; p50: number; p75: number; p90: number } };
    top:    { median_12m_return: number; hit_rate: number; percentiles: { p10: number; p25: number; p50: number; p75: number; p90: number } };
  };
  formation_series: { month: string; structural_spread: number }[];
};

type IndexFreq    = { curve: { month: string; value: number }[]; stats: { annualized_return: number; hit_rate: number; terminal_value: number } };
type IndexBacktest = {
  results: {
    tcs150:       { frequencies: { monthly: IndexFreq } };
    sapphire50:   { frequencies: { monthly: IndexFreq } };
    total_market: { frequencies: { monthly: IndexFreq } };
  };
};

type CohortMetric = "median_return" | "mean_return" | "hit_rate";

const AXIS3_ORDER = ["Very High", "High", "Moderate", "Low", "Very Low"] as const;

// ─── Layer Tag ────────────────────────────────────────────────────────────────
// Visual disclosure of what type of output each component represents.

const LAYER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  MEASURED:    { bg: "#EBF5FB", text: "#1A5276", border: "#AED6F1" },
  DERIVED:     { bg: "#EAF4FB", text: "#1F618D", border: "#85C1E9" },
  HEURISTIC:   { bg: "#FEF9E7", text: "#7D6608", border: "#F9E79F" },
  NARRATIVE:   { bg: "#FDF2F8", text: "#76448A", border: "#D7BDE2" },
};

function LayerTag({ type }: { type: "MEASURED" | "DERIVED" | "HEURISTIC" | "NARRATIVE" }) {
  const c = LAYER_COLORS[type];
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: "0.12em",
      padding: "2px 8px", borderRadius: 4,
      backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {type}
    </span>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, layer, children, note }: {
  title: string;
  layer: "MEASURED" | "DERIVED" | "HEURISTIC" | "NARRATIVE";
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, borderBottom: "1px solid #ddd", paddingBottom: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>{title}</span>
        <LayerTag type={layer} />
      </div>
      {note && (
        <p style={{ fontSize: 12, color: "#111", marginBottom: 12, lineHeight: 1.6 }}>{note}</p>
      )}
      {children}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bucketColor(bucket: string | null | undefined): string {
  // Pure blue → red gradient across risk spectrum
  const m: Record<string, string> = {
    "Very Low":  "#2471A3",
    "Low":       "#5B9BD5",
    "Moderate":  "#888888",
    "High":      "#E07040",
    "Very High": "#C0392B",
  };
  return m[bucket ?? ""] ?? "#222";
}

function fmtPct(v: number | null, signed = false): string {
  if (v == null) return "—";
  const p = (v * 100).toFixed(1);
  return signed ? (v >= 0 ? `+${p}%` : `${p}%`) : `${p}%`;
}

function fmtRisk(v: number | null): string {
  if (v == null) return "—";
  return `${Math.round(v * 100)}th pct`;
}

function returnColor(v: number | null, suppressed: boolean): string {
  if (suppressed || v == null) return "#e8e8e8";
  if (v <= -0.12) return "#c0392b";
  if (v <= -0.03) return "#e67e22";
  if (v < 0.03)   return "#bbb";
  if (v < 0.12)   return "#27ae60";
  return "#1a7a4a";
}

// ─── Scatter Map ──────────────────────────────────────────────────────────────

// Defined outside ScatterMap — stable module-level ref required for Framer Motion to persist animation
interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: {
    composite_bucket: string | null;
    pulse: number | null;
  };
}

// Pulse durations map to opacity transitions via Framer Motion
// Framer Motion animates independently of React render cycle — survives remounts
const OPACITY_MAP: Record<number, [number, number]> = {
  3883: [0.9, 0.2],
  2400: [0.9, 0.2],
  1483: [0.9, 0.2],
   917: [0.9, 0.2],
};

function CustomDot({ cx = 0, cy = 0, payload }: CustomDotProps) {
  const color = bucketColor(payload?.composite_bucket);
  const dur = payload?.pulse ?? null;
  const opacities = dur ? OPACITY_MAP[dur] : null;

  if (!dur || !opacities) {
    return <circle cx={cx} cy={cy} r={2} fill={color} opacity={0.5} />;
  }

  return (
    <g>
      <motion.circle
        cx={cx} cy={cy} r={2}
        fill={color}
        initial={false}
        animate={{ opacity: [opacities[0], opacities[1], opacities[0]] }}
        transition={{
          duration: dur / 1000,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      />
    </g>
  );
}

function ScatterMap({ data }: { data: SnapshotRow[] }) {
  const points = useMemo(() => data
    .filter(r => r.axis1_pct != null && r.axis2_pct != null)
    .map(r => {
      const bucket = r.composite_bucket ?? "Moderate";
      const pulseMap: Record<string, number | null> = {
        "Very Low":  null,
        "Low":       3883,
        "Moderate":  2400,
        "High":      1483,
        "Very High":  917,
      };
      return {
        x: Math.min(1, Math.max(0, (r.axis2_pct as number) + ((r.axis3_pct ?? 0.5) - 0.5) * 0.08)),
        y: r.axis1_pct as number,
        symbol: r.symbol,
        oal_label: r.oal_label,
        composite_bucket: bucket,
        pulse: pulseMap[bucket],
      };
    }), [data]);

  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { bucket: "Very Low",  pulse: "stable",      color: "#2471A3" },
          { bucket: "Low",       pulse: "steady",      color: "#5B9BD5" },
          { bucket: "Moderate",  pulse: "active",      color: "#888888" },
          { bucket: "High",      pulse: "strained",    color: "#E07040" },
          { bucket: "Very High", pulse: "critical",    color: "#C0392B" },
        ].map(({ bucket, pulse, color }) => (
          <div key={bucket} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width={10} height={10}>
              <circle cx={5} cy={5} r={3} fill={color} opacity={0.8} />
            </svg>
            <span style={{ fontSize: 11, color: "#222" }}>{bucket}</span>
            <span style={{ fontSize: 10, color: "#888" }}>({pulse})</span>
          </div>
        ))}
      </div>
      <div style={{ height: 520, contain: "layout" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 12, bottom: 28, left: 48 }}>
            <CartesianGrid stroke="#ebebeb" />
            <XAxis
              type="number" dataKey="x" domain={[0, 1]}
              label={{ value: "Trajectory Risk →", position: "insideBottom", offset: -10, fontSize: 11, fill: "#222" }}
              tick={{ fontSize: 10, fill: "#444" }}
              axisLine={{ stroke: "#ccc" }} tickLine={{ stroke: "#ccc" }}
              isAnimationActive={false}
            />
            <YAxis
              type="number" dataKey="y" domain={[0, 1]}
              label={{ value: "Anchor Risk ↑", angle: -90, position: "insideLeft", offset: 12, fontSize: 11, fill: "#222" }}
              tick={{ fontSize: 10, fill: "#444" }}
              axisLine={{ stroke: "#ccc" }} tickLine={{ stroke: "#ccc" }}
              isAnimationActive={false}
            />
            <Scatter data={points} shape={(props: CustomDotProps) => <CustomDot {...props} />} isAnimationActive={false}>
              {points.map((_, i) => <Cell key={i} fill="transparent" />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


// ─── Cohort Grid ──────────────────────────────────────────────────────────────

function CohortGrid({ cohortGrid }: { cohortGrid: CohortGridPayload }) {
  const [selectedPanel, setSelectedPanel] = useState("Very High");
  const [metric, setMetric] = useState<CohortMetric>("median_return");
  const axis3Dir = useRef<"forward" | "back">("forward");

  const handlePanel = useCallback((p: string) => {
    const curr = AXIS3_ORDER.indexOf(selectedPanel as typeof AXIS3_ORDER[number]);
    const next = AXIS3_ORDER.indexOf(p as typeof AXIS3_ORDER[number]);
    axis3Dir.current = next > curr ? "forward" : "back";
    setSelectedPanel(p);
  }, [selectedPanel]);

  const activePanel = cohortGrid.panels.find(p => p.panel === selectedPanel);

  const fmtMetric = (cell: CohortGridCell) => {
    if (cell.suppressed) return "—";
    const v = cell[metric];
    if (v == null) return "—";
    if (metric === "hit_rate") return `${(v * 100).toFixed(1)}%`;
    return `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%`;
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#111" }}>Financing Risk panel:</span>
        {AXIS3_ORDER.map(p => (
          <button key={p} onClick={() => handlePanel(p)} style={{
            fontSize: 11, padding: "3px 10px", borderRadius: 4, cursor: "pointer",
            border: "1px solid #ccc",
            backgroundColor: selectedPanel === p ? "#111" : "#fff",
            color: selectedPanel === p ? "#fff" : "#333",
          }}>{p}</button>
        ))}
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {(["median_return", "mean_return", "hit_rate"] as CohortMetric[]).map(m => (
            <button key={m} onClick={() => setMetric(m)} style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 4, cursor: "pointer",
              border: "1px solid #ccc",
              backgroundColor: metric === m ? "#333" : "#fff",
              color: metric === m ? "#fff" : "#333",
            }}>{m.replace("_", " ")}</button>
          ))}
        </span>
      </div>

      <div style={{ fontSize: 11, color: "#111", marginBottom: 8 }}>
        {cohortGrid.metadata.observation_count.toLocaleString()} observations ·{" "}
        {cohortGrid.metadata.formation_month_min} – {cohortGrid.metadata.formation_month_max} ·{" "}
        {cohortGrid.metadata.horizon_months}M forward horizon · Interest-bearing universe only
      </div>

      <div style={{ overflowX: "auto" }}>
        <AnimatePresence mode="wait">
          {activePanel && (
            <motion.div key={selectedPanel}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "6px 8px", textAlign: "left", color: "#111", fontWeight: 500, borderBottom: "1px solid #ddd" }}>Trajectory ↓ / Anchor →</th>
                    {cohortGrid.metadata.x_axis_labels.map(l => (
                      <th key={l} style={{ padding: "6px 8px", textAlign: "center", color: "#111", fontWeight: 500, borderBottom: "1px solid #ddd" }}>{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activePanel.rows.map(row => (
                    <tr key={row.axis2_bucket}>
                      <td style={{ padding: "6px 8px", color: "#222", fontWeight: 500, borderBottom: "1px solid #f0f0f0", whiteSpace: "nowrap" }}>{row.axis2_bucket}</td>
                      {row.cells.map(cell => {
                        const v = cell.suppressed ? null : cell[metric];
                        const colorVal = metric === "hit_rate" ? ((v as number ?? 0) - 0.5) * 2 : v as number;
                        return (
                          <td key={cell.axis1_bucket} style={{
                            padding: "6px 4px", textAlign: "center", borderBottom: "1px solid #f0f0f0",
                            backgroundColor: returnColor(colorVal, cell.suppressed),
                            color: "#fff", fontWeight: 500,
                          }}
                            title={`N=${cell.count} · median ${fmtPct(cell.median_return, true)} · hit rate ${fmtPct(cell.hit_rate)}`}
                          >
                            <div>{fmtMetric(cell)}</div>
                            <div style={{ fontSize: 9, opacity: 0.8 }}>N={cell.count.toLocaleString()}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p style={{ fontSize: 11, color: "#222", marginTop: 8 }}>
        Dataset boundary: excludes ~16% of universe (no-interest firms). Structural risk for those firms is undefined, not low.
      </p>
    </div>
  );
}

// ─── Index Performance Chart ──────────────────────────────────────────────────

function IndexChart({ data }: { data: IndexBacktest }) {
  const tcs150  = data.results.tcs150.frequencies.monthly;
  const sap50   = data.results.sapphire50.frequencies.monthly;
  const total   = data.results.total_market.frequencies.monthly;

  const W = 720; const H = 240; const PAD = 36;

  const allVals = [
    ...tcs150.curve.map(d => d.value),
    ...sap50.curve.map(d => d.value),
    ...total.curve.map(d => d.value),
  ];
  const gMin = Math.min(...allVals) * 0.97;
  const gMax = Math.max(...allVals) * 1.03;
  const n = tcs150.curve.length;
  const xS = (i: number) => PAD + (i / (n - 1)) * (W - PAD * 2);
  const yS = (v: number) => PAD + (1 - (v - gMin) / (gMax - gMin)) * (H - PAD * 2);

  const buildPath = (curve: { month: string; value: number }[]) =>
    curve.map((d, i) => `${i === 0 ? "M" : "L"} ${xS(i).toFixed(1)} ${yS(d.value).toFixed(1)}`).join(" ");

  const y100 = yS(100);
  const step = Math.floor(n / 6);
  const xLabels = tcs150.curve.filter((_, i) => i % step === 0 || i === n - 1).map((d, _, arr) => {
    const idx = tcs150.curve.indexOf(d);
    return { x: xS(idx), label: d.month.slice(0, 7) };
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 24, marginBottom: 12, flexWrap: "wrap" }}>
        {[
          { label: "TCS Total Market", ret: total.stats.annualized_return, color: "#222" },
          { label: "TCS-150 Composite", ret: tcs150.stats.annualized_return, color: "#2471A3" },
          { label: "TCS Sapphire 50 (paid)", ret: sap50.stats.annualized_return, color: "#1a7a4a" },
        ].map(({ label, ret, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 2, backgroundColor: color }} />
            <span style={{ fontSize: 12, color: "#111" }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: ret >= 0 ? "#1a7a4a" : "#c0392b" }}>
              {ret >= 0 ? "+" : ""}{(ret * 100).toFixed(1)}% ann.
            </span>
          </div>
        ))}
      </div>
      <div style={{ border: "1px solid #e0e0e0", borderRadius: 6, backgroundColor: "#fafafa", padding: 8 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
          {[0.25, 0.5, 0.75].map(t => (
            <line key={t} x1={PAD} y1={PAD + t * (H - PAD * 2)} x2={W - PAD} y2={PAD + t * (H - PAD * 2)} stroke="#e8e8e8" strokeWidth="0.5" />
          ))}
          <line x1={PAD} y1={y100} x2={W - PAD} y2={y100} stroke="#ccc" strokeWidth="0.75" strokeDasharray="4 4" />
          <text x={PAD - 4} y={y100 + 3} textAnchor="end" fontSize="8" fill="#555">100</text>
          <path d={buildPath(total.curve)} fill="none" stroke="#555" strokeWidth="1.5" strokeDasharray="5 3" />
          <path d={buildPath(sap50.curve)} fill="none" stroke="#1a7a4a" strokeWidth="1.5" strokeOpacity="0.4" />
          <path d={buildPath(tcs150.curve)} fill="none" stroke="#2471A3" strokeWidth="2" />
          {xLabels.map(({ x, label }) => (
            <text key={label} x={x} y={H - 4} textAnchor="middle" fontSize="8" fill="#222">{label}</text>
          ))}
        </svg>
      </div>
      <p style={{ fontSize: 11, color: "#222", marginTop: 8 }}>
        Historical rules-based simulation. Monthly rebalance. Equal-weighted median return per period. Indexed to 100. Does not account for transaction costs. Not investment advice.
      </p>
    </div>
  );
}

// ─── Validation Panels ────────────────────────────────────────────────────────

function ValidationPanels({ data }: { data: QuintileBacktest }) {
  const { bottom, middle, top } = data.summary;
  const zones = [
    { label: "Low risk",  color: "#1a7a4a", stats: bottom },
    { label: "Moderate",  color: "#222",    stats: middle },
    { label: "High risk", color: "#c0392b", stats: top    },
  ];

  const spreadSeries = data.formation_series.filter(d => d.structural_spread != null);
  const SW = 640; const SH = 100; const SP = 16;
  const sVals = spreadSeries.map(d => d.structural_spread);
  const sMin = Math.min(...sVals, 0) - 2;
  const sMax = Math.max(...sVals) + 2;
  const xS = (i: number) => SP + (i / (spreadSeries.length - 1)) * (SW - SP * 2);
  const yS = (v: number) => SP + (1 - (v - sMin) / (sMax - sMin)) * (SH - SP * 2);
  const spreadPath = spreadSeries.map((d, i) => `${i === 0 ? "M" : "L"} ${xS(i).toFixed(1)} ${yS(d.structural_spread).toFixed(1)}`).join(" ");
  const zeroY = yS(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Hit rate */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#111", marginBottom: 8 }}>Hit rate — share of formation windows with positive 12-month returns</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {zones.map(({ label, color, stats }) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span style={{ color }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{(stats.hit_rate * 100).toFixed(1)}%</span>
              </div>
              <div style={{ height: 20, backgroundColor: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(stats.hit_rate / 0.70 * 100).toFixed(0)}%`, backgroundColor: color, opacity: 0.8 }} />
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "#222", marginTop: 6 }}>86 independent 12-month formation windows · interest-bearing universe · 2018–2025</p>
      </div>

      {/* Return distribution */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#111", marginBottom: 8 }}>Return distribution — P10 / P25 / median / P75 / P90</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {zones.map(({ label, color, stats }) => {
            const { p10, p25, p50, p75, p90 } = stats.percentiles;
            const SMIN = -0.60; const SMAX = 0.40;
            const toX = (v: number) => Math.max(0, Math.min(100, ((v - SMIN) / (SMAX - SMIN)) * 100));
            const zX = toX(0);
            return (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color }}>{label}</span>
                  <span style={{ color: "#222" }}>P10 {(p10 * 100).toFixed(0)}% · median {p50 >= 0 ? "+" : ""}{(p50 * 100).toFixed(1)}% · P90 +{(p90 * 100).toFixed(0)}%</span>
                </div>
                <div style={{ position: "relative", height: 18, backgroundColor: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, height: "100%", left: `${toX(p10)}%`, width: `${toX(p90) - toX(p10)}%`, backgroundColor: color, opacity: 0.15 }} />
                  <div style={{ position: "absolute", top: 0, height: "100%", left: `${toX(p25)}%`, width: `${toX(p75) - toX(p25)}%`, backgroundColor: color, opacity: 0.4 }} />
                  <div style={{ position: "absolute", top: 0, height: "100%", width: 2, left: `${toX(p50)}%`, backgroundColor: color }} />
                  <div style={{ position: "absolute", top: 0, height: "100%", width: 1, left: `${zX}%`, backgroundColor: "#555" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spread over time */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#111", marginBottom: 8 }}>Structural spread over time — Low minus High risk median return</div>
        <div style={{ border: "1px solid #e0e0e0", borderRadius: 4, backgroundColor: "#fafafa", padding: 8 }}>
          <svg viewBox={`0 0 ${SW} ${SH}`} style={{ width: "100%", height: "auto" }}>
            <line x1={SP} y1={zeroY} x2={SW - SP} y2={zeroY} stroke="#ccc" strokeWidth="0.75" strokeDasharray="4 3" />
            {spreadPath && <>
              <path d={`${spreadPath} L ${SW - SP} ${zeroY} L ${SP} ${zeroY} Z`} fill="#2471A3" fillOpacity="0.1" />
              <path d={spreadPath} fill="none" stroke="#2471A3" strokeWidth="1.5" />
            </>}
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Snapshot Table ───────────────────────────────────────────────────────────

function SnapshotTable({ data }: { data: SnapshotRow[] }) {
  const [search, setSearch] = useState("");
  const [oalFilter, setOalFilter] = useState("All");
  const [bucketFilter, setBucketFilter] = useState("All");

  const filtered = useMemo(() => data.filter(r => {
    if (oalFilter !== "All" && r.oal_label !== oalFilter) return false;
    if (bucketFilter !== "All" && r.composite_bucket !== bucketFilter) return false;
    if (search && !r.symbol.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [data, search, oalFilter, bucketFilter]);

  const oalOptions = ["All", "FCF", "Net Income", "EBIT", "Revenue", "Non-viable"];
  const bucketOptions = ["All", "Very Low", "Low", "Moderate", "High", "Very High"];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ticker..."
          style={{ padding: "4px 8px", fontSize: 12, border: "1px solid #ccc", borderRadius: 4, width: 140 }} />
        <select value={oalFilter} onChange={e => setOalFilter(e.target.value)}
          style={{ padding: "4px 8px", fontSize: 12, border: "1px solid #ccc", borderRadius: 4 }}>
          {oalOptions.map(o => <option key={o}>{o}</option>)}
        </select>
        <select value={bucketFilter} onChange={e => setBucketFilter(e.target.value)}
          style={{ padding: "4px 8px", fontSize: 12, border: "1px solid #ccc", borderRadius: 4 }}>
          {bucketOptions.map(b => <option key={b}>{b}</option>)}
        </select>
        <span style={{ fontSize: 11, color: "#222", alignSelf: "center" }}>{filtered.length.toLocaleString()} companies</span>
      </div>
      <div style={{ overflowX: "auto", maxHeight: 480, overflowY: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
          <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f8f8" }}>
            <tr>
              {["Symbol", "OAL", "Anchor Risk", "Trajectory Risk", "Financing Risk", "Composite Bucket"].map(h => (
                <th key={h} style={{ padding: "6px 10px", textAlign: "left", borderBottom: "1px solid #ddd", fontWeight: 600, color: "#222", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.symbol} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "5px 10px", fontWeight: 600 }}>{row.symbol}</td>
                <td style={{ padding: "5px 10px", color: "#333" }}>{row.oal_label}</td>
                <td style={{ padding: "5px 10px", color: "#333" }}>{fmtRisk(row.axis1_pct)}</td>
                <td style={{ padding: "5px 10px", color: "#333" }}>{fmtRisk(row.axis2_pct)}</td>
                <td style={{ padding: "5px 10px", color: "#333" }}>{row.axis3_pct == null ? "—" : fmtRisk(row.axis3_pct)}</td>
                <td style={{ padding: "5px 10px" }}>
                  <span style={{ color: bucketColor(row.composite_bucket), fontWeight: 600 }}>{row.composite_bucket}</span>
                  <span style={{ color: "#333", fontSize: 11, marginLeft: 6 }}>{fmtRisk(row.composite_score)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DevPage() {
  const [snapshot, setSnapshot]     = useState<SnapshotRow[]>([]);
  const [cohortGrid, setCohortGrid] = useState<CohortGridPayload | null>(null);
  const [quintile, setQuintile]     = useState<QuintileBacktest | null>(null);
  const [indexData, setIndexData]   = useState<IndexBacktest | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/osmr_snapshot.json").then(r => r.json()),
      fetch("/data/historical_cohort_grids.json").then(r => r.json()),
      fetch("/data/quintile_backtest.json").then(r => r.json()),
      fetch("/data/index_backtest.json").then(r => r.json()),
    ])
      .then(([snap, grids, quint, idx]) => {
        setSnapshot(snap);
        setCohortGrid(grids);
        setQuintile(quint);
        setIndexData(idx);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 40, color: "#111" }}>
      Loading...
    </div>
  );

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", backgroundColor: "#fff", color: "#111", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48, borderBottom: "2px solid #111", paddingBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#222", textTransform: "uppercase", marginBottom: 8 }}>
            The Capital Steward · OSMR Framework · Audit Surface
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 12px" }}>Platform Audit — Dev Build</h1>
          <p style={{ fontSize: 14, color: "#222", lineHeight: 1.7, maxWidth: 720, margin: "0 0 16px" }}>
            OSMR applies first-principle structural reasoning to equity analysis. It tests the hypothesis that companies grounded in operational reality outperform those whose valuations rest on narrative. Multiple years of data confirm this. The framework is now a validated theory of structural fragility.
          </p>
          {/* Layer key */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(["MEASURED", "DERIVED", "HEURISTIC", "NARRATIVE"] as const).map(t => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <LayerTag type={t} />
                <span style={{ fontSize: 11, color: "#111" }}>
                  {t === "MEASURED"  && "Raw axes, percentiles, cohort stats"}
                  {t === "DERIVED"   && "Bucket assignments, rankings, thresholds"}
                  {t === "HEURISTIC" && "Interpretive classifications"}
                  {t === "NARRATIVE" && "Generated text explanations"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Animation smoke test — remove once confirmed working */}
        <div style={{ marginBottom: 32, padding: 16, border: "1px solid #ddd", borderRadius: 4 }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>Animation smoke test — if these pulse, Framer Motion works in this environment</div>
          <svg width={300} height={40}>
            {[
              { cx: 30,  dur: 3883, color: "#2471A3", label: "3883ms" },
              { cx: 90,  dur: 2400, color: "#5B9BD5", label: "2400ms" },
              { cx: 150, dur: 1483, color: "#E07040", label: "1483ms" },
              { cx: 210, dur: 917,  color: "#C0392B", label: "917ms"  },
              { cx: 270, dur: null, color: "#888",    label: "static" },
            ].map(({ cx, dur, color, label }) => (
              <g key={cx}>
                {dur ? (
                  <motion.circle
                    cx={cx} cy={20} r={6}
                    fill={color}
                    initial={false}
                    animate={{ opacity: [0.9, 0.1, 0.9] }}
                    transition={{ duration: dur / 1000, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                  />
                ) : (
                  <circle cx={cx} cy={20} r={6} fill={color} opacity={0.5} />
                )}
                <text x={cx} y={36} textAnchor="middle" fontSize={8} fill="#888">{label}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Section 1 — Scatter Map */}
        <Section title="OSMR Structural Map of U.S.-Listed Equities" layer="MEASURED"
          note="Each point is a U.S.-listed equity. X = Trajectory Risk (Axis 2 percentile). Y = Anchor Risk (Axis 1 percentile). Pulse rate = Financing Risk (Axis 3). Color = Composite structural risk bucket. All positions are direct model output — no interpretation applied.">
          <ScatterMap data={snapshot} />
        </Section>

        {/* Section 2 — Snapshot Table */}
        <Section title="Current Snapshot Table" layer="DERIVED"
          note="Companies ranked by composite score. Composite = weighted average of three axis percentiles (37.5% Anchor, 37.5% Trajectory, 25% Financing). Bucket assignment derived from composite percentile. Axis values shown as rounded percentiles — model resolution does not support decimal precision.">
          <SnapshotTable data={snapshot} />
        </Section>

        {/* Section 3 — Index Performance */}
        {indexData && (
          <Section title="Structural Index Performance" layer="MEASURED"
            note="Three rules-based indexes drawn from the same eligible population (interest-bearing, valid composite score, 12-month price history). No look-ahead bias — constituents selected from formation-month snapshot only. TCS Total Market = full eligible universe, no structural filter. TCS-150 = lowest 150 composite scores. Sapphire 50 = Very Low on all three axes, top 50 by composite. All equal-weighted median return, monthly rebalance.">
            <IndexChart data={indexData} />
          </Section>
        )}

        {/* Section 4 — Validation Panels */}
        {quintile && (
          <Section title="Structural Zone Validation" layer="MEASURED"
            note="86 independent 12-month formation windows. Each window: form portfolio from structural zone, measure return over next 12 months. No sequential compounding. Low = bottom composite quintile. Moderate = middle quintile. High = top composite quintile. All interest-bearing universe.">
            <ValidationPanels data={quintile} />
          </Section>
        )}

        {/* Section 5 — Cohort Grid */}
        {cohortGrid && (
          <Section title="Historical Cohort Outcomes" layer="MEASURED"
            note="260,549 observations. 2018–2025. Interest-bearing universe only (~84% of scored universe). 5 panels × 5 × 5 = 75 cells per panel. Each cell = companies in that structural zone at formation date, measured 12 months forward. Median return shown by default. Suppressed cells have fewer than minimum observations.">
            <CohortGrid cohortGrid={cohortGrid} />
          </Section>
        )}

        <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid #ddd", fontSize: 11, color: "#222" }}>
          The Capital Steward, LLC · thecapitalsteward.com · For informational purposes only. Not investment advice.
        </div>

      </div>
    </div>
  );
}
