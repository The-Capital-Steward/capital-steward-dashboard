'use client'

// app/platform/page.tsx
// Full replacement — descent architecture per Build Brief & Architecture documents.
// Auth gate (Clerk): unchanged. Stripe: unchanged. Data: synthetic → swap live OSMR.
// D3 v7 loaded from CDN. Force simulation: tick(400) synchronous.
// app/platform-beta → deprecated.

import { useEffect, useRef, useState } from 'react'
import { useUser, SignIn, SignUp } from '@clerk/nextjs'
import Link from 'next/link'

// ─── Design tokens ─────────────────────────────────────────────────────────────

const E = {
  bg:    '#0A0907',
  bg2:   '#0E0C0A',
  bg3:   '#131210',
  bdr:   '#161410',
  bdr2:  '#1E1C18',
  bdr3:  '#272420',
  text:  '#EDE9E0',
  body:  '#A89E8E',
  muted: '#554E44',
  dim:   '#3A3530',
  ghost: '#2A2520',
  gold:  '#C5A24A',
  VL:    '#5A9870',
  L:     '#4B8A70',
  M:     '#9E8A70',
  H:     '#C07050',
  VH:    '#C5524A',
  mono:  "'IBM Plex Mono','Courier New',monospace",
  sans:  "'Syne',system-ui,sans-serif",
  serif: "'Instrument Serif',Georgia,serif",
}

const s = (x: object) => x as React.CSSProperties

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Node {
  id: string
  symbol: string
  composite: number
  bucket: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High'
  axis1: number
  axis2: number
  ev: number
  marketCap: number
  oal: 'FCF' | 'NI' | 'EBIT' | 'Revenue'
  evBand: number
  x: number
  y: number
}

type Band = 'all' | 1 | 2 | 3 | 4 | 5 | 6 | 7

// ─── Descent levels ────────────────────────────────────────────────────────────

const DESCENT_LEVELS = [
  { n: 1,  label: 'Universe',   sub: 'Full view',        paid: false },
  { n: 3,  label: 'Regimes',    sub: 'Exp · Neu · Str',  paid: false },
  { n: 4,  label: 'Rungs',      sub: 'FCF·NI·EBIT·Rev',  paid: false },
  { n: 7,  label: 'EV Bands',   sub: 'Seven quantiles',  paid: false },
  { n: 11, label: 'Sectors',    sub: 'GICS · 11',        paid: true  },
  { n: 18, label: 'Archetypes', sub: 'Structural',       paid: true  },
  { n: 29, label: 'Companies',  sub: 'Individual',       paid: true  },
]

const BUCKET_ORDER = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'] as const

// ─── Helpers ───────────────────────────────────────────────────────────────────

function bucketColor(b: string): string {
  return ({ 'Very Low': E.VL, 'Low': E.L, 'Moderate': E.M, 'High': E.H, 'Very High': E.VH } as Record<string, string>)[b] ?? E.M
}

function nodeRadius(mc: number): number {
  return Math.max(2, Math.min(12, Math.sqrt(mc) * 0.38 + 2))
}

function fmtEV(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`
  return `$${(v / 1e6).toFixed(0)}M`
}

// ─── Synthetic data (≈5,200 nodes) ────────────────────────────────────────────

function generateNodes(n = 5200): Node[] {
  const oals: Node['oal'][] = ['FCF', 'NI', 'EBIT', 'Revenue']
  const oalWeights = [0.40, 0.25, 0.20, 0.15]

  function randOal(): Node['oal'] {
    const r = Math.random()
    let cum = 0
    for (let i = 0; i < oals.length; i++) { cum += oalWeights[i]; if (r < cum) return oals[i] }
    return 'Revenue'
  }

  // log-normal EV: concentrated toward mid-cap
  function randEV(): number {
    const u1 = Math.random(), u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return Math.exp(z * 1.6 + 21.5)  // median ~≈$2.5B
  }

  const nodes: Node[] = Array.from({ length: n }, (_, i) => {
    const composite = Math.random() * 100
    const bucket = (composite < 20 ? 'Very Low' : composite < 40 ? 'Low' : composite < 60 ? 'Moderate' : composite < 80 ? 'High' : 'Very High') as Node['bucket']
    const noise = (Math.random() - 0.5) * 44
    const axis1 = Math.min(100, Math.max(0, composite + noise + (Math.random() - 0.5) * 20))
    const axis2 = Math.min(100, Math.max(0, composite + (noise * -0.4) + (Math.random() - 0.5) * 30))
    const ev = randEV()
    const marketCap = ev * (0.65 + Math.random() * 0.7)
    return {
      id: `N${i}`, symbol: `S${i}`,
      composite, bucket,
      axis1, axis2,
      ev, marketCap,
      oal: randOal(),
      evBand: 0,
      x: 0, y: 0,
    }
  })

  // Compute EV bands: 7 equal-population quantiles
  const sorted = [...nodes].sort((a, b) => a.ev - b.ev)
  const bs = Math.ceil(sorted.length / 7)
  sorted.forEach((nd, i) => { nd.evBand = Math.min(7, Math.floor(i / bs) + 1) })

  return nodes
}

// ─── Clerk appearance ───────────────────────────────────────────────────────────

const CLERK_APPEARANCE = {
  variables: {
    colorBackground: '#0E0C0A', colorPrimary: '#C5A24A',
    colorText: '#EDE9E0', colorTextSecondary: '#A89E8E',
    colorTextOnPrimaryBackground: '#0A0907',
    colorInputBackground: '#0A0907', colorInputText: '#EDE9E0',
    colorNeutral: '#EDE9E0', borderRadius: '0px',
    fontFamily: "'Syne',system-ui,sans-serif",
  },
  elements: {
    card: 'shadow-none bg-transparent',
    headerTitle: 'hidden', headerSubtitle: 'hidden',
    formButtonPrimary: 'font-semibold rounded-none',
    socialButtonsBlockButton: 'border-[#272420] rounded-none',
    footerActionLink: 'underline', footer: 'bg-transparent',
  },
}

// ─── Auth modal ────────────────────────────────────────────────────────────────

function AuthModal() {
  const [mode, setMode] = useState<'prompt' | 'signin' | 'signup'>('prompt')
  return (
    <div style={s({ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
      <div style={s({ position: 'absolute', inset: 0, background: 'rgba(8,7,6,0.82)', backdropFilter: 'blur(12px)' })} />
      <div style={s({ position: 'relative', width: '100%', maxWidth: 460, background: E.bg2, border: `1px solid ${E.bdr3}`, borderTop: `2px solid ${E.gold}` })}>
        <div style={s({ padding: '28px 32px 20px' })}>
          <div style={s({ display: 'flex', alignItems: 'baseline', marginBottom: 22 })}>
            <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: E.muted })}>The Capital</span>
            <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: 15, color: E.gold, marginLeft: 6 })}>Steward</span>
          </div>

          {mode === 'prompt' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: 29, fontWeight: 700, color: E.text, letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.1 })}>
              The structural map.
            </h2>
            <p style={s({ fontFamily: E.sans, fontSize: 18, lineHeight: 1.75, color: E.body, marginBottom: 24 })}>
              ~5,200 U.S. equities. Two independently validated dimensions of structural risk. Free to explore.
            </p>
            <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 20 })}>
              {[
                { tier: 'Free', cta: 'Create account', action: () => setMode('signup'), primary: false,
                  features: ['Full constellation map', 'EV band filter', 'Cross-panel hover'] },
                { tier: 'Full access · $159/mo', cta: 'Open full access', action: () => { window.location.href = '/platform/subscribe' }, primary: true,
                  features: ['Everything free', 'Company drilldowns', 'Cohort grids (290K+ obs)', 'Weekly updates'] },
              ].map(({ tier, cta, action, primary, features }) => (
                <div key={tier} style={s({ border: `1px solid ${primary ? E.bdr3 : E.bdr2}`, background: primary ? 'rgba(197,162,74,0.05)' : 'transparent', padding: '16px' })}>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: primary ? E.gold : E.muted, marginBottom: 11 })}>{tier}</div>
                  <div style={s({ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 })}>
                    {features.map(f => (
                      <div key={f} style={s({ fontFamily: E.sans, fontSize: 18, color: E.body, lineHeight: 1.4 })}>{f}</div>
                    ))}
                  </div>
                  <button onClick={action} style={s({ width: '100%', fontFamily: E.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '10px 0', background: primary ? E.gold : 'transparent', color: primary ? E.bg : E.muted, border: primary ? 'none' : `1px solid ${E.bdr2}`, cursor: 'pointer' })}>{cta}</button>
                </div>
              ))}
            </div>
            <div style={s({ textAlign: 'center' as const })}>
              <button onClick={() => setMode('signin')} style={s({ fontFamily: E.mono, fontSize: 11, color: E.muted, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' })}>Already have an account? Sign in</button>
            </div>
          </>}

          {mode === 'signin' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: 29, fontWeight: 700, color: E.text, letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1 })}>Sign in to open the map.</h2>
            <SignIn forceRedirectUrl="/platform" appearance={CLERK_APPEARANCE} />
            <div style={s({ textAlign: 'center' as const, marginTop: 16 })}><button onClick={() => setMode('prompt')} style={s({ fontFamily: E.mono, fontSize: 11, color: E.muted, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' })}>← Back</button></div>
          </>}

          {mode === 'signup' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: 29, fontWeight: 700, color: E.text, letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1 })}>Create free account</h2>
            <SignUp forceRedirectUrl="/platform" appearance={CLERK_APPEARANCE} />
            <div style={s({ textAlign: 'center' as const, marginTop: 16 })}><button onClick={() => setMode('prompt')} style={s({ fontFamily: E.mono, fontSize: 11, color: E.muted, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' })}>← Back</button></div>
          </>}
        </div>
        <div style={s({ padding: '12px 32px 20px', borderTop: `1px solid ${E.bdr}` })}>
          <p style={s({ fontFamily: E.mono, fontSize: 11, color: E.muted, textAlign: 'center' as const })}>
            <Link href="/methodology" style={s({ color: E.gold, textDecoration: 'none' })}>Examine the evidence</Link>
            {' · '}
            <Link href="/who-its-for" style={s({ color: E.muted, textDecoration: 'none' })}>Who it&apos;s for</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Platform preview (auth gate background) ────────────────────────────────────

function PlatformPreview() {
  return (
    <div style={s({ width: '100%', height: '100vh', overflow: 'hidden', pointerEvents: 'none', userSelect: 'none' })}>
      <div style={s({ height: 52, borderBottom: `1px solid ${E.bdr}`, display: 'flex', alignItems: 'center', padding: '0 18px', background: E.bg })}>
        <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: E.muted })}>The Capital</span>
        <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: 15, color: E.gold, marginLeft: 6 })}>Steward</span>
      </div>
      <div style={s({ height: 44, borderBottom: `1px solid ${E.bdr}`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 24, background: E.bg2 })}>
        {DESCENT_LEVELS.map(l => (
          <div key={l.n} style={s({ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: l.n === 1 ? 1 : 0.3 })}>
            <span style={s({ fontFamily: E.mono, fontSize: 13, color: l.n === 1 ? E.gold : E.dim })}>{l.n}</span>
            <span style={s({ fontFamily: E.mono, fontSize: 7, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: l.paid ? E.ghost : E.dim })}>{l.label}</span>
          </div>
        ))}
      </div>
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100vh - 96px)' })}>
        <div style={s({ borderRight: `1px solid ${E.bdr}`, background: E.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
          <svg width="80%" height="80%" viewBox="0 0 400 300">
            {Array.from({ length: 120 }, (_, i) => (
              <circle key={i} cx={Math.random() * 400} cy={Math.random() * 300} r={1 + Math.random() * 4}
                fill={[E.VL, E.L, E.M, E.H, E.VH][Math.floor(Math.random() * 5)]} opacity={0.5 + Math.random() * 0.4} />
            ))}
          </svg>
        </div>
        <div style={s({ background: E.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
          <svg width="80%" height="80%" viewBox="0 0 400 300">
            {Array.from({ length: 120 }, (_, i) => (
              <circle key={i} cx={Math.random() * 380 + 10} cy={Math.random() * 280 + 10} r={1 + Math.random() * 4}
                fill={[E.VL, E.L, E.M, E.H, E.VH][Math.floor(Math.random() * 5)]} opacity={0.5 + Math.random() * 0.4} />
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Main platform page ─────────────────────────────────────────────────────────

export default function PlatformPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const isPaid = !!(isSignedIn && user?.publicMetadata?.subscription === 'active')

  // Visualization state
  const [selectedBand, setSelectedBand] = useState<Band>('all')
  const [activeLevel, setActiveLevel] = useState(1)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: Node } | null>(null)

  // Refs for D3 (shared mutable state, read by D3 event handlers)
  const selectedBandRef = useRef<Band>('all')
  const hoveredIdRef = useRef<string | null>(null)
  const nodesRef = useRef<Node[]>([])
  const d3ReadyRef = useRef(false)
  const conSvgRef = useRef<SVGSVGElement | null>(null)
  const scatSvgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // ── effectiveOpacity — verbatim from brief ──────────────────────────────────

  function effectiveOpacity(d: Node): number {
    const bandOk = selectedBandRef.current === 'all' || d.evBand === selectedBandRef.current
    const hoverOk = hoveredIdRef.current === null || d.id === hoveredIdRef.current
    if (!bandOk && !hoverOk) return 0.04
    if (!bandOk) return hoveredIdRef.current !== null && d.id === hoveredIdRef.current ? 0.9 : 0.05
    if (!hoverOk) return 0.14
    return 0.86
  }

  // ── refreshNodes — applies effectiveOpacity to all .cn and .sn elements ────

  function refreshNodes() {
    if (typeof window === 'undefined' || !(window as any).d3) return
    const d3 = (window as any).d3
    d3.selectAll('.cn,.sn').style('opacity', (d: Node) => {
      const v = effectiveOpacity(d)
      // Return null when base opacity so CSS pulsation animation runs freely
      return v === 0.86 ? null : v
    })
  }

  // ── Band selection ──────────────────────────────────────────────────────────

  function selectBand(band: Band) {
    selectedBandRef.current = band
    setSelectedBand(band)
    setActiveLevel(band === 'all' ? 1 : 7)
    refreshNodes()
  }

  // ── D3 initialization ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    function initViz() {
      if (d3ReadyRef.current) return
      d3ReadyRef.current = true

      const d3 = (window as any).d3
      const nodes = generateNodes(5200)
      nodesRef.current = nodes

      // Panel dimensions
      const container = containerRef.current
      if (!container) return
      const panelW = container.clientWidth / 2
      const panelH = 440

      // ── Constellation (force-directed) ──────────────────────────────────────

      const clusterCenters: Record<string, { x: number; y: number }> = {
        'Very Low':  { x: panelW * 0.15, y: panelH * 0.80 },
        'Low':       { x: panelW * 0.32, y: panelH * 0.64 },
        'Moderate':  { x: panelW * 0.50, y: panelH * 0.48 },
        'High':      { x: panelW * 0.68, y: panelH * 0.32 },
        'Very High': { x: panelW * 0.85, y: panelH * 0.17 },
      }

      // Clone nodes for force simulation (keeps positions)
      const forceNodes = nodes.map(n => ({ ...n }))

      const simulation = d3.forceSimulation(forceNodes)
        .force('x', d3.forceX((d: Node) => clusterCenters[d.bucket].x).strength(0.36))
        .force('y', d3.forceY((d: Node) => clusterCenters[d.bucket].y).strength(0.36))
        .force('charge', d3.forceManyBody().strength(-10))
        .force('collide', d3.forceCollide((d: Node) => nodeRadius(d.marketCap) + 1.2))
        .stop()

      simulation.tick(400)

      // Write positions back to nodesRef
      forceNodes.forEach((fn: any, i: number) => {
        nodesRef.current[i].x = Math.max(4, Math.min(panelW - 4, fn.x))
        nodesRef.current[i].y = Math.max(4, Math.min(panelH - 4, fn.y))
      })

      const conSvg = d3.select(conSvgRef.current)
        .attr('width', panelW)
        .attr('height', panelH)

      // Star field background
      const stars = Array.from({ length: 180 }, () => ({
        x: Math.random() * panelW,
        y: Math.random() * panelH,
        r: 0.15 + Math.random() * 0.55,
        o: 0.02 + Math.random() * 0.07,
      }))
      conSvg.selectAll('.star').data(stars).join('circle')
        .attr('class', 'star').attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)
        .attr('r', (d: any) => d.r).attr('fill', '#EDE9E0').attr('opacity', (d: any) => d.o)

      // Cluster region ellipses
      BUCKET_ORDER.forEach(b => {
        const c = clusterCenters[b]
        const col = bucketColor(b)
        conSvg.append('ellipse')
          .attr('cx', c.x).attr('cy', c.y).attr('rx', 46).attr('ry', 34)
          .attr('fill', 'none').attr('stroke', col)
          .attr('stroke-width', 0.35).attr('opacity', 0.1)
          .attr('stroke-dasharray', '3,5')
        conSvg.append('text')
          .attr('x', c.x).attr('y', c.y - 38)
          .attr('text-anchor', 'middle')
          .attr('font-family', E.mono).attr('font-size', 7.5)
          .attr('letter-spacing', '0.14em')
          .attr('fill', col).attr('opacity', 0.22)
          .text(b.toUpperCase())
      })

      // Constellation nodes
      const cnGroups = conSvg.selectAll('.cn-wrap').data(nodesRef.current, (d: Node) => d.id)
        .join('g')
        .attr('class', (d: Node) => `cn-wrap node-${d.bucket === 'Very High' ? 'vh' : d.bucket === 'High' ? 'h' : 'base'}`)
        .attr('transform', (d: Node) => `translate(${d.x},${d.y})`)

      cnGroups.append('circle')
        .attr('class', 'cn')
        .datum((d: any) => d)
        .attr('r', (d: Node) => nodeRadius(d.marketCap))
        .attr('fill', (d: Node) => bucketColor(d.bucket))

      cnGroups
        .on('mouseenter', function(event: MouseEvent, d: Node) {
          hoveredIdRef.current = d.id
          refreshNodes()
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setTooltip({ x: event.clientX - rect.left + 16, y: event.clientY - rect.top - 14, node: d })
          }
        })
        .on('mousemove', function(event: MouseEvent) {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setTooltip(prev => prev ? { ...prev, x: event.clientX - rect.left + 16, y: event.clientY - rect.top - 14 } : null)
          }
        })
        .on('mouseleave', function() {
          hoveredIdRef.current = null
          refreshNodes()
          setTooltip(null)
        })

      // ── Structural Risk Map (scatter) ───────────────────────────────────────

      const PAD = { l: 42, r: 12, t: 12, b: 36 }
      const innerW = panelW - PAD.l - PAD.r
      const innerH = panelH - PAD.t - PAD.b

      const scatSvg = d3.select(scatSvgRef.current)
        .attr('width', panelW)
        .attr('height', panelH)

      const xScale = d3.scaleLinear().domain([0, 100]).range([0, innerW])
      const yScale = d3.scaleLinear().domain([0, 100]).range([innerH, 0])

      const chart = scatSvg.append('g').attr('transform', `translate(${PAD.l},${PAD.t})`)

      // Quadrant fills
      chart.append('rect').attr('x', 0).attr('y', innerH / 2).attr('width', innerW / 2).attr('height', innerH / 2)
        .attr('fill', E.VL).attr('opacity', 0.025)
      chart.append('rect').attr('x', innerW / 2).attr('y', innerH / 2).attr('width', innerW / 2).attr('height', innerH / 2)
        .attr('fill', '#9E8A70').attr('opacity', 0.02)
      chart.append('rect').attr('x', 0).attr('y', 0).attr('width', innerW / 2).attr('height', innerH / 2)
        .attr('fill', '#9E8A70').attr('opacity', 0.02)
      chart.append('rect').attr('x', innerW / 2).attr('y', 0).attr('width', innerW / 2).attr('height', innerH / 2)
        .attr('fill', E.VH).attr('opacity', 0.033)

      // Grid lines at 25, 50, 75
      ;[25, 50, 75].forEach(v => {
        chart.append('line').attr('x1', xScale(v)).attr('y1', 0).attr('x2', xScale(v)).attr('y2', innerH)
          .attr('stroke', '#1A1815').attr('stroke-width', 0.5)
        chart.append('line').attr('x1', 0).attr('y1', yScale(v)).attr('x2', innerW).attr('y2', yScale(v))
          .attr('stroke', '#1A1815').attr('stroke-width', 0.5)
      })

      // Diagonal reference line (composite parity)
      chart.append('line')
        .attr('x1', xScale(0)).attr('y1', yScale(0))
        .attr('x2', xScale(100)).attr('y2', yScale(100))
        .attr('stroke', '#2A2520').attr('stroke-width', 0.55)
        .attr('stroke-dasharray', '4,5').attr('opacity', 0.5)

      // Axes
      const xAxis = d3.axisBottom(xScale).tickValues([0, 25, 50, 75, 100]).tickSize(3)
      const yAxis = d3.axisLeft(yScale).tickValues([0, 25, 50, 75, 100]).tickSize(3)

      const axisStyle = { fontSize: 8, fontFamily: E.mono, color: '#2A2520' }

      chart.append('g').attr('transform', `translate(0,${innerH})`).call(xAxis)
        .select('.domain').attr('stroke', '#222018').attr('stroke-width', 0.4)
      chart.selectAll('.tick text').attr('fill', '#2A2520').attr('font-size', 8).attr('font-family', E.mono)
      chart.selectAll('.tick line').attr('stroke', '#222018').attr('stroke-width', 0.4)

      chart.append('g').call(yAxis)
        .select('.domain').attr('stroke', '#222018').attr('stroke-width', 0.4)

      // Axis labels
      chart.append('text').attr('x', innerW / 2).attr('y', innerH + 30)
        .attr('text-anchor', 'middle').attr('font-size', 8).attr('font-family', E.mono)
        .attr('letter-spacing', '0.12em').attr('fill', '#2A2520').text('ANCHOR DETACHMENT →')

      chart.append('text').attr('transform', `rotate(-90)`)
        .attr('x', -innerH / 2).attr('y', -30)
        .attr('text-anchor', 'middle').attr('font-size', 8).attr('font-family', E.mono)
        .attr('letter-spacing', '0.12em').attr('fill', '#2A2520').text('ANCHOR DEGRADATION →')

      // Quadrant labels
      const quadLabels = [
        { x: 6, y: innerH - 6, txt: 'Deep · Stable', col: E.VL },
        { x: innerW - 6, y: innerH - 6, txt: 'Stretched · Stable', col: '#9E8A70', anchor: 'end' },
        { x: 6, y: 12, txt: 'Deep · Degrading', col: '#9E8A70' },
        { x: innerW - 6, y: 12, txt: 'Stretched · Degrading', col: E.VH, anchor: 'end' },
      ]
      quadLabels.forEach(q => {
        chart.append('text').attr('x', q.x).attr('y', q.y)
          .attr('text-anchor', (q as any).anchor ?? 'start')
          .attr('font-size', 7.5).attr('font-family', E.mono)
          .attr('fill', q.col).attr('opacity', 0.20).text(q.txt)
      })

      // Scatter nodes
      const snGroups = chart.selectAll('.sn-wrap').data(nodesRef.current, (d: Node) => d.id)
        .join('g')
        .attr('class', (d: Node) => `sn-wrap node-${d.bucket === 'Very High' ? 'vh' : d.bucket === 'High' ? 'h' : 'base'}`)
        .attr('transform', (d: Node) => `translate(${xScale(d.axis1)},${yScale(d.axis2)})`)

      snGroups.append('circle')
        .attr('class', 'sn')
        .datum((d: any) => d)
        .attr('r', (d: Node) => nodeRadius(d.marketCap))
        .attr('fill', (d: Node) => bucketColor(d.bucket))

      snGroups
        .on('mouseenter', function(event: MouseEvent, d: Node) {
          hoveredIdRef.current = d.id
          refreshNodes()
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setTooltip({ x: event.clientX - rect.left + 16, y: event.clientY - rect.top - 14, node: d })
          }
        })
        .on('mousemove', function(event: MouseEvent) {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setTooltip(prev => prev ? { ...prev, x: event.clientX - rect.left + 16, y: event.clientY - rect.top - 14 } : null)
          }
        })
        .on('mouseleave', function() {
          hoveredIdRef.current = null
          refreshNodes()
          setTooltip(null)
        })
    }

    // Load D3 from CDN, then initialize
    if ((window as any).d3) {
      initViz()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js'
    script.onload = initViz
    document.head.appendChild(script)
  }, [isLoaded, isSignedIn])

  // ── EV band range labels (approximate, for display) ─────────────────────────

  const EV_BAND_LABELS = [
    { band: 'all' as Band, label: 'All' },
    { band: 1 as Band, label: 'Band I',   sub: '<$300M' },
    { band: 2 as Band, label: 'Band II',  sub: '$300M–$1B' },
    { band: 3 as Band, label: 'Band III', sub: '$1B–$3B' },
    { band: 4 as Band, label: 'Band IV',  sub: '$3B–$10B' },
    { band: 5 as Band, label: 'Band V',   sub: '$10B–$30B' },
    { band: 6 as Band, label: 'Band VI',  sub: '$30B–$100B' },
    { band: 7 as Band, label: 'Band VII', sub: '>$100B' },
  ]

  // ── Auth gate ───────────────────────────────────────────────────────────────

  if (!isLoaded) {
    return (
      <div style={s({ minHeight: '100vh', background: E.bg })}>
        <div style={s({ filter: 'blur(8px)', opacity: 0.35, height: '100vh', overflow: 'hidden' })}>
          <PlatformPreview />
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div style={s({ minHeight: '100vh', background: E.bg, overflow: 'hidden', position: 'relative' })}>
        <div style={s({ filter: 'blur(10px)', opacity: 0.45, height: '100vh', overflow: 'hidden', pointerEvents: 'none' })}>
          <PlatformPreview />
        </div>
        <AuthModal />
      </div>
    )
  }

  // ── Authenticated platform ──────────────────────────────────────────────────

  return (
    <div style={s({ minHeight: '100vh', background: E.bg, color: E.text, fontFamily: E.sans, position: 'relative' })} ref={containerRef}>

      <style>{`
        @keyframes pulse-vh { 0%,100% { opacity: .88 } 50% { opacity: .28 } }
        @keyframes pulse-h  { 0%,100% { opacity: .84 } 50% { opacity: .48 } }
        .node-vh { animation: pulse-vh 1.5s ease-in-out infinite; }
        .node-h  { animation: pulse-h  2.7s ease-in-out infinite; }
        .node-base { opacity: 0.86; }
        .cn-wrap, .sn-wrap { cursor: default; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={s({ height: 52, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 18px', borderBottom: `1px solid ${E.bdr}`, background: E.bg, position: 'sticky', top: 0, zIndex: 40 })}>
        <a href="/" style={s({ textDecoration: 'none', display: 'flex', alignItems: 'baseline' })}>
          <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: 15, color: E.gold, marginLeft: 6 })}>Steward</span>
        </a>
        <div style={s({ display: 'flex', alignItems: 'center', gap: 6 })}>
          <div style={s({ width: 5, height: 5, borderRadius: '50%', background: E.VL, opacity: 0.8 })} />
          <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.muted })}>Live · Apr 2026</span>
          {!isPaid && (
            <a href="/platform/subscribe" style={s({ fontFamily: E.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '5px 12px', background: E.gold, color: E.bg, textDecoration: 'none', marginLeft: 8 })}>Upgrade</a>
          )}
        </div>
      </nav>

      {/* ── Lucas descent breadcrumb ── */}
      <div style={s({ height: 44, borderBottom: `1px solid ${E.bdr}`, background: E.bg2, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 0, overflowX: 'auto' })}>
        {DESCENT_LEVELS.map((level, i) => {
          const isActive = level.n === 1 || (selectedBand !== 'all' && level.n === 7)
          const color = isActive ? E.gold : level.paid ? E.ghost : E.dim
          return (
            <div key={level.n} style={s({ display: 'flex', alignItems: 'center', flexShrink: 0 })}>
              {i > 0 && <div style={s({ width: 18, height: 1, background: E.bdr2, margin: '0 2px' })} />}
              <button
                onClick={() => { if (level.paid && !isPaid) window.location.href = '/platform/subscribe' }}
                style={s({ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 8px', background: 'transparent', border: 'none', cursor: level.paid && !isPaid ? 'pointer' : 'default' })}
              >
                <span style={s({ fontFamily: E.mono, fontSize: 14, color, lineHeight: 1, fontWeight: isActive ? 700 : 400 })}>{level.n}</span>
                <span style={s({ fontFamily: E.mono, fontSize: 7, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: level.paid && !isPaid ? E.ghost : isActive ? E.gold : E.dim, lineHeight: 1.4 })}>{level.label}</span>
                {level.paid && !isPaid && <span style={s({ fontFamily: E.mono, fontSize: 6.5, letterSpacing: '0.1em', color: '#2A2520' })}>PAID</span>}
              </button>
            </div>
          )
        })}
      </div>

      {/* ── EV Band filter strip (contextual — always visible for Level 7) ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr}`, background: E.bg, padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto' })}>
        {EV_BAND_LABELS.map(({ band, label, sub }) => {
          const active = selectedBand === band
          return (
            <button key={String(band)} onClick={() => selectBand(band)} style={s({
              fontFamily: E.mono, fontSize: 11, fontWeight: active ? 700 : 400,
              letterSpacing: '0.06em',
              padding: sub ? '4px 10px 3px' : '4px 10px',
              border: `1px solid ${active ? E.gold : E.bdr2}`,
              background: active ? 'rgba(197,162,74,0.08)' : 'transparent',
              color: active ? E.gold : E.muted,
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              flexShrink: 0,
            })}>
              <span>{label}</span>
              {sub && <span style={s({ fontSize: 7, color: active ? E.gold : E.dim, letterSpacing: '0.04em' })}>{sub}</span>}
            </button>
          )
        })}
      </div>

      {/* ── Panel header row ── */}
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${E.bdr}`, background: E.bg2 })}>
        <div style={s({ padding: '7px 18px', borderRight: `1px solid ${E.bdr}` })}>
          <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: E.muted })}>Constellation · Structural neighborhoods</div>
          <div style={s({ fontFamily: E.mono, fontSize: 7.5, color: E.dim, marginTop: 2 })}>Force-directed · No axes</div>
        </div>
        <div style={s({ padding: '7px 18px' })}>
          <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: E.muted })}>Structural Risk Map · Detachment × Degradation</div>
          <div style={s({ fontFamily: E.mono, fontSize: 7.5, color: E.dim, marginTop: 2 })}>Two-axis · Precise coordinates</div>
        </div>
      </div>

      {/* ── Dual visualization panels ── */}
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 440, borderBottom: `1px solid ${E.bdr}` })}>
        {/* Left — Constellation */}
        <div style={s({ borderRight: `1px solid ${E.bdr}`, background: E.bg, overflow: 'hidden' })}>
          <svg ref={conSvgRef} style={s({ display: 'block', width: '100%', height: '100%' })} />
        </div>
        {/* Right — Structural Risk Map */}
        <div style={s({ background: E.bg, overflow: 'hidden' })}>
          <svg ref={scatSvgRef} style={s({ display: 'block', width: '100%', height: '100%' })} />
        </div>
      </div>

      {/* ── Legend strip ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr}`, background: E.bg2, padding: '7px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 })}>
        <div style={s({ display: 'flex', alignItems: 'center', gap: 16 })}>
          {BUCKET_ORDER.map(b => (
            <div key={b} style={s({ display: 'flex', alignItems: 'center', gap: 5 })}>
              <div style={s({ width: 8, height: 8, borderRadius: '50%', background: bucketColor(b), flexShrink: 0 })} />
              <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.muted })}>{b}{b === 'Very High' ? ' ◈' : ''}</span>
            </div>
          ))}
        </div>
        <span style={s({ fontFamily: E.mono, fontSize: 7.5, color: E.dim })}>
          Node size = market cap · Pulsation = degradation risk · Hover to cross-highlight · Click band to filter both views
        </span>
      </div>

      {/* ── Tooltip ── */}
      {tooltip && (
        <div style={s({
          position: 'absolute',
          left: tooltip.x, top: tooltip.y,
          background: '#181410',
          border: `1px solid ${E.dim}`,
          borderTop: `2px solid ${E.gold}`,
          padding: '9px 13px',
          fontFamily: E.mono, fontSize: 11, color: E.text,
          lineHeight: 1.85, whiteSpace: 'nowrap' as const,
          zIndex: 30, pointerEvents: 'none',
        })}>
          <div style={s({ color: E.gold, fontSize: 12, marginBottom: 1 })}>{tooltip.node.symbol}</div>
          <div>Band {tooltip.node.evBand} · {fmtEV(tooltip.node.ev)}</div>
          <div>Composite: {tooltip.node.composite.toFixed(1)} · {tooltip.node.bucket}</div>
          <div>OAL: {tooltip.node.oal}</div>
          <div>Detachment: {tooltip.node.axis1.toFixed(1)} · Degradation: {tooltip.node.axis2.toFixed(1)}</div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={s({ padding: '18px', textAlign: 'center' as const })}>
        <p style={s({ fontFamily: E.mono, fontSize: 11, color: E.dim })}>
          © 2026 The Capital Steward, LLC · For informational purposes only · Not investment advice
        </p>
      </div>

    </div>
  )
}