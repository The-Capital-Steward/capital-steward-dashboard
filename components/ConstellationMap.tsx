'use client'

/**
 * ConstellationMap.tsx
 * 
 * Drop-in replacement for the Market Map section inside platform-beta/page.tsx
 * 
 * Props:
 *   data: SnapshotRow[]  — the filtered snapshot data
 *   onSelect: (row: SnapshotRow) => void  — opens drilldown
 * 
 * Architecture:
 *   - Canvas layer: all 5,200 dots + pulse rings (requestAnimationFrame loop)
 *   - SVG overlay: axis labels, quadrant labels, grid lines (static)
 *   - Hit detection: finds nearest dot to click within 12px radius
 * 
 * Pulse encoding:
 *   - Requires axis2_delta field (axis2_pct - axis2_prev_pct, positive = deteriorating)
 *   - If axis2_delta absent, pulse is disabled for that dot gracefully
 *   - Pulse speed ∝ deterioration rate. No pulse = stable/improving trajectory.
 * 
 * Dot sizing:
 *   - Requires market_cap field (USD)
 *   - Mapped logarithmically: $100M → 2px, $1T → 8px
 *   - Fallback: 3px uniform if market_cap absent
 * 
 * Viewport behavior:
 *   - ResizeObserver keeps canvas dimensions in sync with container
 *   - Aspect ratio 16:10, min-height 440px
 */

import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type SnapshotRow = {
  symbol: string
  oal_label: string | null
  axis1_pct: number | null
  axis2_pct: number | null
  axis2_prev_pct?: number | null   // prior month — enables pulse
  composite_score: number | null
  composite_bucket: string | null
  market_cap?: number | null       // USD — enables size encoding
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg:    "#0E0D0B",
  bg2:   "#131210",
  bdr:   "#272420",
  bdr2:  "#33302A",
  text:  "#EDE9E0",
  body:  "#A89E8E",
  muted: "#6B6458",
  dim:   "#3A3530",
  gold:  "#C5A24A",
  mono:  "'IBM Plex Mono','Courier New',monospace",
  sans:  "'Syne',system-ui,sans-serif",
  // Bucket colors (canvas-safe hex → parsed to rgba in drawDot)
  vl: "#5A9870",
  lo: "#3E6B4F",
  mo: "#3A3530",
  hi: "#A05050",
  vh: "#B85C4A",
  // Pulse ring for deteriorating trajectory
  pulse: "#C5A24A",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function bucketColor(bucket: string | null | undefined): string {
  const m: Record<string, string> = {
    "Very Low": C.vl, "Low": C.lo,
    "Moderate": C.mo, "High": C.hi, "Very High": C.vh,
  }
  return m[bucket ?? ""] ?? C.mo
}

function dotRadius(marketCap: number | null | undefined): number {
  if (!marketCap || marketCap <= 0) return 3
  // log scale: $100M=2, $1B=4, $10B=6, $100B=7.5, $1T=9
  const log = Math.log10(marketCap)
  const r = Math.max(2, Math.min(9, (log - 8) * 1.75))
  return r
}

function deteriorationRate(row: SnapshotRow): number {
  // Returns 0 if stable/improving, 0–1 if deteriorating
  if (row.axis2_prev_pct == null || row.axis2_pct == null) return 0
  const delta = row.axis2_pct - row.axis2_prev_pct
  if (delta <= 0) return 0 // improving or flat
  return Math.min(1, delta * 8) // 0.125+ deterioration → full pulse
}

// ─── Dot type ─────────────────────────────────────────────────────────────────

type Dot = {
  row: SnapshotRow
  cx: number  // canvas pixel x
  cy: number  // canvas pixel y
  r: number   // base radius
  color: string
  rgb: [number, number, number]
  pulse: number  // 0 = no pulse, 0–1 = pulse intensity
  phase: number  // animation phase offset (random)
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ConstellationMapProps {
  data: SnapshotRow[]
  onSelect: (row: SnapshotRow) => void
  selectedSymbol?: string | null
}

export function ConstellationMap({ data, onSelect, selectedSymbol }: ConstellationMapProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const svgRef      = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef      = useRef<number>(0)
  const dotsRef     = useRef<Dot[]>([])
  const dimsRef     = useRef({ w: 0, h: 0, padL: 52, padR: 20, padT: 20, padB: 40 })

  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; row: SnapshotRow } | null>(null)
  const [dims, setDims] = useState({ w: 800, h: 480 })

  // ── Build dot list ──────────────────────────────────────────────────────────

  const buildDots = useCallback((w: number, h: number, rows: SnapshotRow[]): Dot[] => {
    const { padL, padR, padT, padB } = dimsRef.current
    const plotW = w - padL - padR
    const plotH = h - padT - padB

    return rows
      .filter(r => r.axis1_pct != null && r.axis2_pct != null)
      .map(r => {
        const x2 = r.axis2_pct as number
        const x1 = r.axis1_pct as number
        // X = trajectory risk (0=low, 1=high), Y = anchor risk (0=low, 1=high, inverted on canvas)
        const cx = padL + x2 * plotW
        const cy = padT + (1 - x1) * plotH
        const color = bucketColor(r.composite_bucket)
        const pulseVal = deteriorationRate(r)
        return {
          row: r,
          cx, cy,
          r: dotRadius(r.market_cap),
          color,
          rgb: hexToRgb(color),
          pulse: pulseVal,
          phase: Math.random() * Math.PI * 2,
        }
      })
  }, [])

  // ── Resize observer ─────────────────────────────────────────────────────────

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      const h = Math.max(440, Math.round(width * 0.58))
      setDims({ w: width, h })
      dimsRef.current = { ...dimsRef.current, w: width, h }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ── Rebuild dots when data or dims change ───────────────────────────────────

  useEffect(() => {
    dotsRef.current = buildDots(dims.w, dims.h, data)
  }, [data, dims, buildDots])

  // ── Canvas render loop ──────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let t = 0

    const draw = () => {
      const { w, h, padL, padR, padT, padB } = dimsRef.current
      const dpr = window.devicePixelRatio || 1

      // Resize canvas if needed
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width  = Math.round(w * dpr)
        canvas.height = Math.round(h * dpr)
        ctx.scale(dpr, dpr)
      }

      ctx.clearRect(0, 0, w, h)

      // Background
      ctx.fillStyle = C.bg2
      ctx.fillRect(0, 0, w, h)

      // Grid lines
      const gridTicks = [0.2, 0.4, 0.6, 0.8]
      const plotW = w - padL - padR
      const plotH = h - padT - padB

      ctx.strokeStyle = C.bdr
      ctx.lineWidth = 0.5
      gridTicks.forEach(tick => {
        // Vertical
        const gx = padL + tick * plotW
        ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, padT + plotH); ctx.stroke()
        // Horizontal
        const gy = padT + (1 - tick) * plotH
        ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + plotW, gy); ctx.stroke()
      })

      // Center crosshairs (more visible)
      ctx.strokeStyle = C.bdr2
      ctx.lineWidth = 0.75
      const cx50 = padL + 0.5 * plotW
      const cy50 = padT + 0.5 * plotH
      ctx.setLineDash([3, 5])
      ctx.beginPath(); ctx.moveTo(cx50, padT); ctx.lineTo(cx50, padT + plotH); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(padL, cy50); ctx.lineTo(padL + plotW, cy50); ctx.stroke()
      ctx.setLineDash([])

      const dots = dotsRef.current
      t += 0.016 // ~60fps tick

      // Draw all dots — sorted so Very High renders on top
      const ORDER: Record<string,number> = {
        "Very Low": 0, "Low": 1, "Moderate": 2, "High": 3, "Very High": 4,
      }
      const sorted = [...dots].sort((a, b) => {
        const ao = ORDER[a.row.composite_bucket ?? ""] ?? 2
        const bo = ORDER[b.row.composite_bucket ?? ""] ?? 2
        return ao - bo
      })

      sorted.forEach(dot => {
        const isHovered  = dot.row.symbol === hoveredSymbol
        const isSelected = dot.row.symbol === selectedSymbol
        const [r, g, b]  = dot.rgb
        const baseAlpha  = dot.row.composite_bucket === "Moderate" ? 0.45 : 0.82

        // Pulse ring — only for deteriorating trajectory
        if (dot.pulse > 0) {
          const speed    = 0.8 + dot.pulse * 1.4  // faster = worse
          const phase    = (t * speed + dot.phase) % (Math.PI * 2)
          const progress = (Math.sin(phase) + 1) / 2
          const ringR    = dot.r + progress * (8 + dot.pulse * 8)
          const ringAlpha = (1 - progress) * dot.pulse * 0.55
          const [pr, pg, pb] = hexToRgb(C.pulse)

          ctx.beginPath()
          ctx.arc(dot.cx, dot.cy, ringR, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${pr},${pg},${pb},${ringAlpha})`
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Selection ring
        if (isSelected) {
          ctx.beginPath()
          ctx.arc(dot.cx, dot.cy, dot.r + 4, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${r},${g},${b},0.9)`
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Hover halo
        if (isHovered) {
          ctx.beginPath()
          ctx.arc(dot.cx, dot.cy, dot.r + 6, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${r},${g},${b},0.15)`
          ctx.fill()
        }

        // Main dot
        ctx.beginPath()
        ctx.arc(dot.cx, dot.cy, isHovered ? dot.r + 1.5 : dot.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${isHovered ? 1 : baseAlpha})`
        ctx.fill()
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [hoveredSymbol, selectedSymbol])

  // ── Hit detection ───────────────────────────────────────────────────────────

  const findDotAt = useCallback((clientX: number, clientY: number): Dot | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const mx = clientX - rect.left
    const my = clientY - rect.top

    let best: Dot | null = null
    let bestDist = 14 // max hit radius px

    dotsRef.current.forEach(dot => {
      const dist = Math.hypot(dot.cx - mx, dot.cy - my)
      if (dist < bestDist) { bestDist = dist; best = dot }
    })
    return best
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const dot = findDotAt(e.clientX, e.clientY)
    if (dot) {
      setHoveredSymbol(dot.row.symbol)
      setTooltip({ x: e.clientX, y: e.clientY, row: dot.row })
    } else {
      setHoveredSymbol(null)
      setTooltip(null)
    }
  }, [findDotAt])

  const handleClick = useCallback((e: React.MouseEvent) => {
    const dot = findDotAt(e.clientX, e.clientY)
    if (dot) onSelect(dot.row)
  }, [findDotAt, onSelect])

  const handleMouseLeave = useCallback(() => {
    setHoveredSymbol(null)
    setTooltip(null)
  }, [])

  // ── SVG axis labels ─────────────────────────────────────────────────────────

  const PAD = dimsRef.current
  const plotW = dims.w - PAD.padL - PAD.padR
  const plotH = dims.h - PAD.padT - PAD.padB

  const tickVals = [0, 0.25, 0.5, 0.75, 1.0]

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", userSelect: "none" }}>
      {/* Canvas layer */}
      <canvas
        ref={canvasRef}
        width={dims.w}
        height={dims.h}
        style={{
          display: "block",
          width: "100%",
          height: dims.h,
          cursor: hoveredSymbol ? "pointer" : "default",
        }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
      />

      {/* SVG overlay — axis labels and quadrant text only */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        width={dims.w}
        height={dims.h}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        {/* X-axis label */}
        <text
          x={PAD.padL + plotW / 2}
          y={dims.h - 4}
          textAnchor="middle"
          fontFamily={C.mono}
          fontSize={10}
          fill={C.muted}
          letterSpacing="0.16em"
        >
          TRAJECTORY RISK →
        </text>

        {/* Y-axis label */}
        <text
          x={12}
          y={PAD.padT + plotH / 2}
          textAnchor="middle"
          fontFamily={C.mono}
          fontSize={10}
          fill={C.muted}
          letterSpacing="0.16em"
          transform={`rotate(-90, 12, ${PAD.padT + plotH / 2})`}
        >
          ANCHOR RISK ↑
        </text>

        {/* X-axis ticks */}
        {tickVals.map(t => (
          <text
            key={`xt-${t}`}
            x={PAD.padL + t * plotW}
            y={PAD.padT + plotH + 14}
            textAnchor="middle"
            fontFamily={C.mono}
            fontSize={9}
            fill={C.muted}
          >
            {t.toFixed(2)}
          </text>
        ))}

        {/* Y-axis ticks */}
        {tickVals.map(t => (
          <text
            key={`yt-${t}`}
            x={PAD.padL - 6}
            y={PAD.padT + (1 - t) * plotH + 3}
            textAnchor="end"
            fontFamily={C.mono}
            fontSize={9}
            fill={C.muted}
          >
            {t.toFixed(2)}
          </text>
        ))}

        {/* Quadrant corner labels — outside data area */}
        <text x={PAD.padL + 6} y={PAD.padT + 14} fontFamily={C.mono} fontSize={9} fill={C.vl} opacity={0.7}>
          Stretched · Improving
        </text>
        <text x={PAD.padL + plotW - 6} y={PAD.padT + 14} fontFamily={C.mono} fontSize={9} fill={C.vh} opacity={0.85} textAnchor="end">
          Most fragile ↗
        </text>
        <text x={PAD.padL + 6} y={PAD.padT + plotH - 8} fontFamily={C.mono} fontSize={9} fill={C.vl} opacity={0.7}>
          Anchored · Improving
        </text>
        <text x={PAD.padL + plotW - 6} y={PAD.padT + plotH - 8} fontFamily={C.mono} fontSize={9} fill={C.vh} opacity={0.6} textAnchor="end">
          Shallow · Deteriorating
        </text>

        {/* Pulse legend */}
        <g transform={`translate(${PAD.padL + plotW - 6}, ${PAD.padT + plotH - 32})`}>
          <circle cx={-80} cy={0} r={4} fill={C.gold} opacity={0.85} />
          <circle cx={-80} cy={0} r={9} fill="none" stroke={C.gold} strokeWidth={1} opacity={0.35} />
          <text x={-70} y={4} fontFamily={C.mono} fontSize={9} fill={C.muted} textAnchor="start">
            Deteriorating trajectory
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <TooltipCard
          row={tooltip.row}
          clientX={tooltip.x}
          clientY={tooltip.y}
          containerRef={containerRef}
        />
      )}
    </div>
  )
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function TooltipCard({
  row, clientX, clientY, containerRef,
}: {
  row: SnapshotRow
  clientX: number
  clientY: number
  containerRef: React.RefObject<HTMLDivElement>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    const card = ref.current
    if (!container || !card) return
    const rect = container.getBoundingClientRect()
    const tw = card.offsetWidth || 200
    const th = card.offsetHeight || 120

    let x = clientX - rect.left + 14
    let y = clientY - rect.top - 12

    if (x + tw > rect.width - 8) x = clientX - rect.left - tw - 14
    if (y + th > rect.height - 8) y = rect.height - th - 8
    if (y < 0) y = 4

    setPos({ x, y })
  }, [clientX, clientY, containerRef])

  const det = deteriorationRate(row)
  const bucket = row.composite_bucket ?? "—"
  const color = ({
    "Very Low": C.vl, "Low": C.lo, "Moderate": C.muted,
    "High": "#A05050", "Very High": C.vh,
  } as Record<string, string>)[bucket] ?? C.muted

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        background: "#0E0D0B",
        border: `1px solid #33302A`,
        padding: "10px 14px",
        pointerEvents: "none",
        zIndex: 50,
        minWidth: 180,
        boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontFamily: C.sans, fontSize: 15, fontWeight: 800, color: "#EDE9E0", letterSpacing: "-0.02em" }}>
          {row.symbol}
        </span>
        <span style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 500, color, marginLeft: 10 }}>
          {bucket}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Row label="OAL" val={row.oal_label ?? "—"} />
        <Row label="Anchor Risk" val={row.axis1_pct != null ? `${Math.round(row.axis1_pct * 100)}th` : "—"} />
        <Row label="Trajectory" val={row.axis2_pct != null ? `${Math.round(row.axis2_pct * 100)}th` : "—"} />
        <Row label="Composite" val={row.composite_score != null ? `${Math.round(row.composite_score * 100)}th` : "—"} />
        {det > 0 && (
          <div style={{ marginTop: 4, paddingTop: 6, borderTop: "1px solid #272420" }}>
            <span style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: C.gold }}>
              ↓ Trajectory deteriorating
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, val }: { label: string; val: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
      <span style={{ fontFamily: C.mono, fontSize: 10, color: "#6B6458" }}>{label}</span>
      <span style={{ fontFamily: C.mono, fontSize: 10, color: "#A89E8E" }}>{val}</span>
    </div>
  )
}

export default ConstellationMap
