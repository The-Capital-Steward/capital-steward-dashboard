'use client'

// app/platform/page.tsx
// Fixes applied:
//   1. nodeRadius() — log10 scale (was sqrt, gave r=12 for all nodes → solid blob)
//   2. Contrast — E.muted (#554E44) is 2.43:1 on #0A0907, fails Lucas 3:1 minimum.
//      Added E.sec (#90A297, 7.39:1) for secondary text. E.muted/dim used for
//      borders/backgrounds only, never text.
//   3. Descent — Level 4 adds OAL rung filter. Level 7 visually connects to
//      EV band strip. Breadcrumb is fully interactive for free tiers.

import { useEffect, useRef, useState, useMemo } from 'react'
import { useUser, SignIn, SignUp } from '@clerk/nextjs'
import Link from 'next/link'

// ─── Design tokens ─────────────────────────────────────────────────────────────
// Dark inverse palette. Contrast values on bg #0A0907 (L≈0.004):
//   text  #EDE9E0 → 16.43:1   body #A89E8E → 7.53:1
//   sec   #90A297 →  7.39:1   gold #C5A24A → 8.19:1
//   muted #554E44 →  2.43:1  (borders/backgrounds ONLY — never text)
//   dim   #3A3530 →  1.64:1  (structural backgrounds ONLY)

const E = {
  bg:    '#0A0907',
  bg2:   '#0E0C0A',
  bg3:   '#131210',
  bdr:   '#161410',
  bdr2:  '#1E1C18',
  bdr3:  '#272420',
  text:  '#EDE9E0',   // 16.43:1 — primary
  body:  '#A89E8E',   //  7.53:1 — body / important secondary
  sec:   '#90A297',   //  7.39:1 — labels, breadcrumb, de-emphasis (NEW)
  muted: '#554E44',   //  2.43:1 — borders/fills ONLY, never text
  dim:   '#3A3530',   //  1.64:1 — structural backgrounds ONLY
  ghost: '#2A2520',   //          — near-invisible dividers
  gold:  '#C5A24A',   //  8.19:1 — active/selected accent
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

type Band   = 'all' | 1 | 2 | 3 | 4 | 5 | 6 | 7
type OALKey = 'all' | 'FCF' | 'NI' | 'EBIT' | 'Revenue'

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
  const map: Record<string, string> = {
    'Very Low': E.VL, 'Low': E.L, 'Moderate': E.M, 'High': E.H, 'Very High': E.VH,
  }
  return map[b] ?? E.M
}

// FIX: log10 scale — was Math.sqrt(mc)*0.38+2 which gives r=12 for all real market caps
function nodeRadius(mc: number): number {
  if (!mc || mc <= 0) return 1.5
  const log = Math.log10(mc)
  return Math.max(1.5, Math.min(6, (log - 8) * 1.4))
  // $1B → 1.5px · $10B → 2.8px · $100B → 4.2px · $1T → 5.6px
}

function fmtEV(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`
  return `$${(v / 1e6).toFixed(0)}M`
}

// ─── Seeded LCG — consistent synthetic data across renders ────────────────────

function makeLCG(seed: number) {
  let s = seed
  return () => { s = (1664525 * s + 1013904223) & 0x7fffffff; return s / 0x7fffffff }
}

// ─── Synthetic data — framework-accurate distributions ────────────────────────
//
// OAL weights reflect confirmed 7yr anchor composition:
//   FCF=51.8%, NI=43.8%, EBIT≈0.1%, Revenue=4.3%
//
// Axis/composite relationship matches OSMR:
//   axis1 (Anchor Detachment) and axis2 (Anchor Degradation) are independent.
//   composite = (axis1 + axis2) / 2, then percentile-ranked across universe.
//   Bucket thresholds applied to composite percentile (0–20 VL, etc.)
//
// EV: log-normal, median ≈ $2.5B, seeded for consistency.

function generateNodes(n = 5200): Node[] {
  const rng = makeLCG(31337)
  const gauss = () => {
    const u1 = rng(), u2 = rng()
    return Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2)
  }

  // OAL: confirmed 7yr anchor composition
  const OAL_WEIGHTS: [Node['oal'], number][] = [
    ['FCF',     0.518],
    ['NI',      0.438],
    ['EBIT',    0.001],
    ['Revenue', 0.043],
  ]
  function randOal(): Node['oal'] {
    const r = rng()
    let cum = 0
    for (const [oal, w] of OAL_WEIGHTS) { cum += w; if (r < cum) return oal }
    return 'Revenue'
  }

  function randEV(): number {
    return Math.exp(gauss() * 1.6 + 21.5)  // median ≈ $2.5B
  }

  // Generate axis1 and axis2 independently (OSMR signal architecture).
  // Composite is their mean. Bucket is composite percentile rank.
  const raw = Array.from({ length: n }, (_, i) => {
    const axis1 = Math.min(100, Math.max(0, rng() * 100))
    const axis2 = Math.min(100, Math.max(0, rng() * 100))
    const composite = (axis1 + axis2) / 2
    const ev = randEV()
    return { i, axis1, axis2, composite, ev, oal: randOal(), mc: ev * (0.65 + rng() * 0.7) }
  })

  // Percentile-rank composite across the universe for bucket assignment.
  const ranked = [...raw].sort((a, b) => a.composite - b.composite)
  const bucketOf = (rank: number): Node['bucket'] => {
    const pct = rank / n
    if (pct < 0.20) return 'Very Low'
    if (pct < 0.40) return 'Low'
    if (pct < 0.60) return 'Moderate'
    if (pct < 0.80) return 'High'
    return 'Very High'
  }
  const bucketMap = new Map(ranked.map((d, rank) => [d.i, bucketOf(rank)]))

  const nodes: Node[] = raw.map(d => ({
    id: `N${d.i}`, symbol: `S${d.i}`,
    composite: d.composite,
    bucket: bucketMap.get(d.i)!,
    axis1: d.axis1, axis2: d.axis2,
    ev: d.ev, marketCap: d.mc,
    oal: d.oal,
    evBand: 0, x: 0, y: 0,
  }))

  // EV bands: 7 equal-population quantiles by EV rank
  const byEV = [...nodes].sort((a, b) => a.ev - b.ev)
  const bandSize = Math.ceil(byEV.length / 7)
  byEV.forEach((nd, i) => { nd.evBand = Math.min(7, Math.floor(i / bandSize) + 1) })

  return nodes
}

// ─── Clerk appearance ─────────────────────────────────────────────────────────

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
    card: 'shadow-none bg-transparent', headerTitle: 'hidden', headerSubtitle: 'hidden',
    formButtonPrimary: 'font-semibold rounded-none',
    socialButtonsBlockButton: 'border-[#272420] rounded-none',
    footerActionLink: 'underline', footer: 'bg-transparent',
  },
}

// ─── Auth modal ───────────────────────────────────────────────────────────────

function AuthModal() {
  const [mode, setMode] = useState<'prompt' | 'signin' | 'signup'>('prompt')
  return (
    <div style={s({ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
      <div style={s({ position: 'absolute', inset: 0, background: 'rgba(8,7,6,0.82)', backdropFilter: 'blur(12px)' })} />
      <div style={s({ position: 'relative', width: '100%', maxWidth: 460, background: E.bg2, border: `1px solid ${E.bdr3}`, borderTop: `2px solid ${E.gold}` })}>
        <div style={s({ padding: '28px 32px 20px' })}>
          <div style={s({ display: 'flex', alignItems: 'baseline', marginBottom: 22 })}>
            <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: E.sec })}>The Capital</span>
            <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: 15, color: E.gold, marginLeft: 6 })}>Steward</span>
          </div>
          {mode === 'prompt' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: 29, fontWeight: 700, color: E.text, letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.1 })}>The structural map.</h2>
            <p style={s({ fontFamily: E.sans, fontSize: 18, lineHeight: 1.75, color: E.body, marginBottom: 24 })}>~5,200 U.S. equities. Two independently validated dimensions of structural risk. Free to explore.</p>
            <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 20 })}>
              {[
                { tier: 'Free', cta: 'Create account', action: () => setMode('signup'), primary: false,
                  features: ['Full constellation map', 'EV band filter', 'OAL rung filter'] },
                { tier: 'Full access · $159/mo', cta: 'Open full access', action: () => { window.location.href = '/platform/subscribe' }, primary: true,
                  features: ['Everything free', 'Company drilldowns', 'Cohort grids (290K+ obs)', 'Weekly updates'] },
              ].map(({ tier, cta, action, primary, features }) => (
                <div key={tier} style={s({ border: `1px solid ${primary ? E.bdr3 : E.bdr2}`, background: primary ? 'rgba(197,162,74,0.05)' : 'transparent', padding: '16px' })}>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: primary ? E.gold : E.sec, marginBottom: 11 })}>{tier}</div>
                  <div style={s({ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 })}>
                    {features.map(f => <div key={f} style={s({ fontFamily: E.sans, fontSize: 18, color: E.body, lineHeight: 1.4 })}>{f}</div>)}
                  </div>
                  <button onClick={action} style={s({ width: '100%', fontFamily: E.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '10px 0', background: primary ? E.gold : 'transparent', color: primary ? E.bg : E.body, border: primary ? 'none' : `1px solid ${E.bdr3}`, cursor: 'pointer' })}>{cta}</button>
                </div>
              ))}
            </div>
            <div style={s({ textAlign: 'center' as const })}>
              <button onClick={() => setMode('signin')} style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' })}>Already have an account? Sign in</button>
            </div>
          </>}
          {mode === 'signin' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: 29, fontWeight: 700, color: E.text, letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1 })}>Sign in to open the map.</h2>
            <SignIn forceRedirectUrl="/platform" appearance={CLERK_APPEARANCE} />
            <div style={s({ textAlign: 'center' as const, marginTop: 16 })}><button onClick={() => setMode('prompt')} style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' })}>← Back</button></div>
          </>}
          {mode === 'signup' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: 29, fontWeight: 700, color: E.text, letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1 })}>Create free account</h2>
            <SignUp forceRedirectUrl="/platform" appearance={CLERK_APPEARANCE} />
            <div style={s({ textAlign: 'center' as const, marginTop: 16 })}><button onClick={() => setMode('prompt')} style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' })}>← Back</button></div>
          </>}
        </div>
        <div style={s({ padding: '12px 32px 20px', borderTop: `1px solid ${E.bdr2}` })}>
          <p style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, textAlign: 'center' as const })}>
            <Link href="/methodology" style={s({ color: E.gold, textDecoration: 'none' })}>Examine the evidence</Link>
            {' · '}
            <Link href="/who-its-for" style={s({ color: E.sec, textDecoration: 'none' })}>Who it&apos;s for</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Platform preview (auth gate background) ──────────────────────────────────

// Seeded — does not re-randomize on render
const PREVIEW_DOTS = Array.from({ length: 120 }, (_, i) => {
  const rng = makeLCG(i * 7 + 13)
  const colors = [E.VL, E.L, E.M, E.H, E.VH]
  return {
    cx: rng() * 400, cy: rng() * 300,
    r:  1 + rng() * 4,
    fill: colors[Math.floor(rng() * 5)],
    opacity: 0.5 + rng() * 0.4,
  }
})

function PlatformPreview() {
  return (
    <div style={s({ width: '100%', height: '100vh', overflow: 'hidden', pointerEvents: 'none', userSelect: 'none' })}>
      <div style={s({ height: 52, borderBottom: `1px solid ${E.bdr2}`, display: 'flex', alignItems: 'center', padding: '0 18px', background: E.bg })}>
        <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: E.sec })}>The Capital</span>
        <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: 15, color: E.gold, marginLeft: 6 })}>Steward</span>
      </div>
      <div style={s({ height: 44, borderBottom: `1px solid ${E.bdr2}`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 24, background: E.bg2 })}>
        {DESCENT_LEVELS.map(l => (
          <div key={l.n} style={s({ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: l.n === 1 ? 1 : 0.3 })}>
            <span style={s({ fontFamily: E.mono, fontSize: 13, color: l.n === 1 ? E.gold : E.sec })}>{l.n}</span>
            <span style={s({ fontFamily: E.mono, fontSize: 7, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.sec })}>{l.label}</span>
          </div>
        ))}
      </div>
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100vh - 96px)' })}>
        {[0, 1].map(panel => (
          <div key={panel} style={s({ borderRight: panel === 0 ? `1px solid ${E.bdr2}` : 'none', background: E.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
            <svg width="90%" height="90%" viewBox="0 0 400 300">
              {PREVIEW_DOTS.map((d, i) => (
                <circle key={i}
                  cx={panel === 0 ? d.cx : (d.cx * 0.9 + 20)}
                  cy={panel === 0 ? d.cy : d.cy}
                  r={d.r} fill={d.fill} opacity={d.opacity} />
              ))}
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── EV band labels ───────────────────────────────────────────────────────────

const EV_BANDS = [
  { band: 'all' as Band, label: 'All',       sub: undefined },
  { band: 1 as Band,     label: 'Band I',    sub: '<$300M' },
  { band: 2 as Band,     label: 'Band II',   sub: '$300M–$1B' },
  { band: 3 as Band,     label: 'Band III',  sub: '$1B–$3B' },
  { band: 4 as Band,     label: 'Band IV',   sub: '$3B–$10B' },
  { band: 5 as Band,     label: 'Band V',    sub: '$10B–$30B' },
  { band: 6 as Band,     label: 'Band VI',   sub: '$30B–$100B' },
  { band: 7 as Band,     label: 'Band VII',  sub: '>$100B' },
]

const OAL_RUNGS = [
  { key: 'all' as OALKey,     label: 'All Rungs' },
  { key: 'FCF' as OALKey,     label: 'FCF',       sub: 'Deepest anchor' },
  { key: 'NI' as OALKey,      label: 'NI',         sub: 'Net Income' },
  { key: 'EBIT' as OALKey,    label: 'EBIT',       sub: 'Operating' },
  { key: 'Revenue' as OALKey, label: 'Revenue',   sub: 'Shallowest' },
]

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PlatformPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const isPaid = !!(isSignedIn && user?.publicMetadata?.subscription === 'active')

  const [selectedBand, setSelectedBand] = useState<Band>('all')
  const [selectedOal,  setSelectedOal]  = useState<OALKey>('all')
  const [activeLevel,  setActiveLevel]  = useState(1)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: Node } | null>(null)

  const selectedBandRef = useRef<Band>('all')
  const selectedOalRef  = useRef<OALKey>('all')
  const hoveredIdRef    = useRef<string | null>(null)
  const nodesRef        = useRef<Node[]>([])
  const d3ReadyRef      = useRef(false)
  const conSvgRef       = useRef<SVGSVGElement | null>(null)
  const scatSvgRef      = useRef<SVGSVGElement | null>(null)
  const containerRef    = useRef<HTMLDivElement | null>(null)
  const evBandRef       = useRef<HTMLDivElement | null>(null)
  const oalRungRef      = useRef<HTMLDivElement | null>(null)

  // ── effectiveOpacity — verbatim from brief + OAL rung filter added ──────────

  function effectiveOpacity(d: Node): number {
    const bandOk = selectedBandRef.current === 'all' || d.evBand === selectedBandRef.current
    const oalOk  = selectedOalRef.current  === 'all' || d.oal    === selectedOalRef.current
    const hoverOk = hoveredIdRef.current === null || d.id === hoveredIdRef.current
    const filterOk = bandOk && oalOk
    if (!filterOk && !hoverOk) return 0.03
    if (!filterOk) return hoveredIdRef.current !== null && d.id === hoveredIdRef.current ? 0.9 : 0.04
    if (!hoverOk) return 0.13
    return 0.86
  }

  function refreshNodes() {
    if (typeof window === 'undefined' || !(window as any).d3) return
    const d3 = (window as any).d3
    d3.selectAll('.cn,.sn').style('opacity', (d: Node) => {
      const v = effectiveOpacity(d)
      return v === 0.86 ? null : v
    })
  }

  // ── Filter actions ─────────────────────────────────────────────────────────

  function selectBand(band: Band) {
    selectedBandRef.current = band
    setSelectedBand(band)
    if (band !== 'all') {
      setActiveLevel(7)
      selectedOalRef.current = 'all'
      setSelectedOal('all')
    } else if (selectedOalRef.current === 'all') {
      setActiveLevel(1)
    }
    refreshNodes()
  }

  function selectOal(oal: OALKey) {
    selectedOalRef.current = oal
    setSelectedOal(oal)
    if (oal !== 'all') {
      setActiveLevel(4)
      selectedBandRef.current = 'all'
      setSelectedBand('all')
    } else if (selectedBandRef.current === 'all') {
      setActiveLevel(1)
    }
    refreshNodes()
  }

  function resetAll() {
    selectedBandRef.current = 'all'
    selectedOalRef.current  = 'all'
    setSelectedBand('all')
    setSelectedOal('all')
    setActiveLevel(1)
    refreshNodes()
  }

  function handleBreadcrumbClick(level: typeof DESCENT_LEVELS[number]) {
    if (level.paid && !isPaid) { window.location.href = '/platform/subscribe'; return }
    if (level.n === 1) { resetAll(); return }
    if (level.n === 4) {
      setActiveLevel(4)
      oalRungRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      return
    }
    if (level.n === 7) {
      setActiveLevel(7)
      evBandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      return
    }
    // levels 3, 11, 18, 29 — future sprints (3) or paid
  }

  // ── D3 initialization ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    function initViz() {
      if (d3ReadyRef.current) return
      d3ReadyRef.current = true

      const d3 = (window as any).d3
      const nodes = generateNodes(5200)
      nodesRef.current = nodes

      const container = containerRef.current
      if (!container) return
      const panelW = container.clientWidth / 2
      const panelH = 440

      // ── Constellation ────────────────────────────────────────────────────────

      const centers: Record<string, { x: number; y: number }> = {
        'Very Low':  { x: panelW * 0.15, y: panelH * 0.80 },
        'Low':       { x: panelW * 0.32, y: panelH * 0.64 },
        'Moderate':  { x: panelW * 0.50, y: panelH * 0.48 },
        'High':      { x: panelW * 0.68, y: panelH * 0.32 },
        'Very High': { x: panelW * 0.85, y: panelH * 0.17 },
      }

      const forceNodes = nodes.map(n => ({ ...n }))

      const simulation = d3.forceSimulation(forceNodes)
        .force('x', d3.forceX((d: Node) => centers[d.bucket].x).strength(0.42))
        .force('y', d3.forceY((d: Node) => centers[d.bucket].y).strength(0.42))
        .force('charge', d3.forceManyBody().strength(-6))
        .force('collide', d3.forceCollide((d: Node) => nodeRadius(d.marketCap) + 0.8))
        .stop()

      simulation.tick(500)

      forceNodes.forEach((fn: any, i: number) => {
        nodesRef.current[i].x = Math.max(4, Math.min(panelW - 4, fn.x))
        nodesRef.current[i].y = Math.max(4, Math.min(panelH - 4, fn.y))
      })

      const conSvg = d3.select(conSvgRef.current).attr('width', panelW).attr('height', panelH)

      // Background — subtle star field
      const stars = Array.from({ length: 180 }, (_, i) => ({
        x: (Math.sin(i * 3.7) * 0.5 + 0.5) * panelW,
        y: (Math.cos(i * 2.3) * 0.5 + 0.5) * panelH,
        r: 0.15 + (i % 4) * 0.12,
        o: 0.02 + (i % 5) * 0.012,
      }))
      conSvg.selectAll('.star').data(stars).join('circle')
        .attr('class', 'star')
        .attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)
        .attr('r',  (d: any) => d.r).attr('fill', '#EDE9E0').attr('opacity', (d: any) => d.o)

      // Cluster ellipses + labels
      BUCKET_ORDER.forEach(b => {
        const c = centers[b]; const col = bucketColor(b)
        conSvg.append('ellipse').attr('cx', c.x).attr('cy', c.y).attr('rx', 46).attr('ry', 34)
          .attr('fill', 'none').attr('stroke', col).attr('stroke-width', 0.35)
          .attr('opacity', 0.12).attr('stroke-dasharray', '3,5')
        conSvg.append('text').attr('x', c.x).attr('y', c.y - 38)
          .attr('text-anchor', 'middle').attr('font-family', E.mono)
          .attr('font-size', 7.5).attr('letter-spacing', '0.14em')
          .attr('fill', col).attr('opacity', 0.25).text(b.toUpperCase())
      })

      // Nodes
      const cnGroups = conSvg.selectAll('.cn-wrap').data(nodesRef.current, (d: Node) => d.id)
        .join('g')
        .attr('class', (d: Node) => `cn-wrap node-${d.bucket === 'Very High' ? 'vh' : d.bucket === 'High' ? 'h' : 'base'}`)
        .attr('transform', (d: Node) => `translate(${d.x},${d.y})`)

      cnGroups.append('circle').attr('class', 'cn').datum((d: any) => d)
        .attr('r', (d: Node) => nodeRadius(d.marketCap))
        .attr('fill', (d: Node) => bucketColor(d.bucket))

      cnGroups
        .on('mouseenter', function(event: MouseEvent, d: Node) {
          hoveredIdRef.current = d.id; refreshNodes()
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
        .on('mouseleave', function() { hoveredIdRef.current = null; refreshNodes(); setTooltip(null) })

      // ── Structural Risk Map ──────────────────────────────────────────────────

      const PAD = { l: 44, r: 14, t: 14, b: 38 }
      const innerW = panelW - PAD.l - PAD.r
      const innerH = panelH - PAD.t - PAD.b

      const scatSvg = d3.select(scatSvgRef.current).attr('width', panelW).attr('height', panelH)
      const xScale  = d3.scaleLinear().domain([0, 100]).range([0, innerW])
      const yScale  = d3.scaleLinear().domain([0, 100]).range([innerH, 0])
      const chart   = scatSvg.append('g').attr('transform', `translate(${PAD.l},${PAD.t})`)

      // Quadrant fills
      ;[
        { x: 0,        y: innerH/2, w: innerW/2,  h: innerH/2, fill: E.VL,    o: 0.025 },
        { x: innerW/2, y: innerH/2, w: innerW/2,  h: innerH/2, fill: '#9E8A70', o: 0.018 },
        { x: 0,        y: 0,        w: innerW/2,  h: innerH/2, fill: '#9E8A70', o: 0.018 },
        { x: innerW/2, y: 0,        w: innerW/2,  h: innerH/2, fill: E.VH,     o: 0.030 },
      ].forEach(q => chart.append('rect').attr('x', q.x).attr('y', q.y).attr('width', q.w).attr('height', q.h).attr('fill', q.fill).attr('opacity', q.o))

      // Grid lines
      ;[25, 50, 75].forEach(v => {
        chart.append('line').attr('x1', xScale(v)).attr('y1', 0).attr('x2', xScale(v)).attr('y2', innerH).attr('stroke', '#1E1C18').attr('stroke-width', 0.5)
        chart.append('line').attr('x1', 0).attr('y1', yScale(v)).attr('x2', innerW).attr('y2', yScale(v)).attr('stroke', '#1E1C18').attr('stroke-width', 0.5)
      })

      // Diagonal parity line
      chart.append('line')
        .attr('x1', xScale(0)).attr('y1', yScale(0)).attr('x2', xScale(100)).attr('y2', yScale(100))
        .attr('stroke', '#2A2520').attr('stroke-width', 0.55).attr('stroke-dasharray', '4,5').attr('opacity', 0.55)

      // Axes
      const tickStyle = { fill: '#3A3530', fontSize: 8, fontFamily: E.mono }
      const xAxis = d3.axisBottom(xScale).tickValues([0, 25, 50, 75, 100]).tickSize(3)
      const yAxis = d3.axisLeft(yScale).tickValues([0, 25, 50, 75, 100]).tickSize(3)

      chart.append('g').attr('transform', `translate(0,${innerH})`).call(xAxis)
        .call((g: any) => {
          g.select('.domain').attr('stroke', '#272420').attr('stroke-width', 0.4)
          g.selectAll('.tick text').attr('fill', '#3A3530').attr('font-size', 8).attr('font-family', E.mono)
          g.selectAll('.tick line').attr('stroke', '#272420').attr('stroke-width', 0.4)
        })

      chart.append('g').call(yAxis)
        .call((g: any) => {
          g.select('.domain').attr('stroke', '#272420').attr('stroke-width', 0.4)
          g.selectAll('.tick text').attr('fill', '#3A3530').attr('font-size', 8).attr('font-family', E.mono)
          g.selectAll('.tick line').attr('stroke', '#272420').attr('stroke-width', 0.4)
        })

      // Axis labels
      chart.append('text').attr('x', innerW / 2).attr('y', innerH + 32)
        .attr('text-anchor', 'middle').attr('font-size', 8).attr('font-family', E.mono)
        .attr('letter-spacing', '0.12em').attr('fill', '#3A3530').text('ANCHOR DETACHMENT →')
      chart.append('text').attr('transform', 'rotate(-90)').attr('x', -innerH / 2).attr('y', -34)
        .attr('text-anchor', 'middle').attr('font-size', 8).attr('font-family', E.mono)
        .attr('letter-spacing', '0.12em').attr('fill', '#3A3530').text('ANCHOR DEGRADATION →')

      // Quadrant labels
      ;[
        { x: 6,        y: innerH - 6, txt: 'Deep · Stable',           col: E.VL,    a: 'start' },
        { x: innerW-6, y: innerH - 6, txt: 'Stretched · Stable',      col: '#9E8A70', a: 'end' },
        { x: 6,        y: 12,         txt: 'Deep · Degrading',         col: '#9E8A70', a: 'start' },
        { x: innerW-6, y: 12,         txt: 'Stretched · Degrading',    col: E.VH,    a: 'end' },
      ].forEach(q => chart.append('text').attr('x', q.x).attr('y', q.y).attr('text-anchor', q.a).attr('font-size', 7.5).attr('font-family', E.mono).attr('fill', q.col).attr('opacity', 0.22).text(q.txt))

      // Scatter nodes
      const snGroups = chart.selectAll('.sn-wrap').data(nodesRef.current, (d: Node) => d.id)
        .join('g')
        .attr('class', (d: Node) => `sn-wrap node-${d.bucket === 'Very High' ? 'vh' : d.bucket === 'High' ? 'h' : 'base'}`)
        .attr('transform', (d: Node) => `translate(${xScale(d.axis1)},${yScale(d.axis2)})`)

      snGroups.append('circle').attr('class', 'sn').datum((d: any) => d)
        .attr('r', (d: Node) => nodeRadius(d.marketCap))
        .attr('fill', (d: Node) => bucketColor(d.bucket))

      snGroups
        .on('mouseenter', function(event: MouseEvent, d: Node) {
          hoveredIdRef.current = d.id; refreshNodes()
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
        .on('mouseleave', function() { hoveredIdRef.current = null; refreshNodes(); setTooltip(null) })
    }

    if ((window as any).d3) { initViz(); return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js'
    script.onload = initViz
    document.head.appendChild(script)
  }, [isLoaded, isSignedIn])

  // ── Auth gate ──────────────────────────────────────────────────────────────

  if (!isLoaded) return (
    <div style={s({ minHeight: '100vh', background: E.bg })}>
      <div style={s({ filter: 'blur(8px)', opacity: 0.35, height: '100vh', overflow: 'hidden' })}>
        <PlatformPreview />
      </div>
    </div>
  )

  if (!isSignedIn) return (
    <div style={s({ minHeight: '100vh', background: E.bg, overflow: 'hidden', position: 'relative' })}>
      <div style={s({ filter: 'blur(10px)', opacity: 0.45, height: '100vh', overflow: 'hidden', pointerEvents: 'none' })}>
        <PlatformPreview />
      </div>
      <AuthModal />
    </div>
  )

  // ── Authenticated platform ─────────────────────────────────────────────────

  const hasFilter = selectedBand !== 'all' || selectedOal !== 'all'

  return (
    <div style={s({ minHeight: '100vh', background: E.bg, color: E.text, fontFamily: E.sans, position: 'relative' })} ref={containerRef}>

      <style>{`
        @keyframes pulse-vh { 0%,100% { opacity: .88 } 50% { opacity: .28 } }
        @keyframes pulse-h  { 0%,100% { opacity: .84 } 50% { opacity: .48 } }
        .node-vh { animation: pulse-vh 1.5s ease-in-out infinite; }
        .node-h  { animation: pulse-h  2.7s ease-in-out infinite; }
        .node-base { opacity: 0.86; }
        .cn-wrap, .sn-wrap { cursor: default; }
        .filter-strip-btn { transition: border-color 0.15s, color 0.15s, background 0.15s; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={s({ height: 52, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 18px', borderBottom: `1px solid ${E.bdr2}`, background: E.bg, position: 'sticky', top: 0, zIndex: 40 })}>
        <a href="/" style={s({ textDecoration: 'none', display: 'flex', alignItems: 'baseline' })}>
          <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: E.sec })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: 15, color: E.gold, marginLeft: 6 })}>Steward</span>
        </a>
        <div style={s({ display: 'flex', alignItems: 'center', gap: 8 })}>
          {hasFilter && (
            <button onClick={resetAll} style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, background: 'transparent', border: `1px solid ${E.bdr3}`, padding: '4px 11px', cursor: 'pointer', letterSpacing: '0.06em' })}>
              Reset ×
            </button>
          )}
          <div style={s({ width: 5, height: 5, borderRadius: '50%', background: E.VL, opacity: 0.85 })} />
          <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.sec })}>Live · Apr 2026</span>
          {!isPaid && (
            <a href="/platform/subscribe" style={s({ fontFamily: E.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '5px 12px', background: E.gold, color: E.bg, textDecoration: 'none', marginLeft: 4 })}>Upgrade</a>
          )}
        </div>
      </nav>

      {/* ── Lucas descent breadcrumb ── */}
      <div style={s({ height: 48, borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 0, overflowX: 'auto' })}>
        {DESCENT_LEVELS.map((level, i) => {
          const isActive = level.n === activeLevel || (activeLevel === 1 && level.n === 1)
          const isFuture = level.n === 3
          const textColor = isActive ? E.gold : level.paid ? E.bdr3 : E.sec
          return (
            <div key={level.n} style={s({ display: 'flex', alignItems: 'center', flexShrink: 0 })}>
              {i > 0 && <div style={s({ width: 18, height: 1, background: E.bdr2, margin: '0 2px', opacity: 0.6 })} />}
              <button
                onClick={() => !isFuture && handleBreadcrumbClick(level)}
                title={isFuture ? 'Coming in next sprint' : level.paid && !isPaid ? 'Paid tier' : undefined}
                style={s({ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 10px', background: 'transparent', border: 'none', cursor: (level.paid && !isPaid) || isFuture ? 'default' : 'pointer', opacity: isFuture ? 0.4 : 1 })}
              >
                <span style={s({ fontFamily: E.mono, fontSize: 14, color: textColor, lineHeight: 1, fontWeight: isActive ? 700 : 400, letterSpacing: '-0.01em' })}>{level.n}</span>
                <span style={s({ fontFamily: E.mono, fontSize: 7, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: level.paid ? E.bdr3 : isActive ? E.gold : E.sec, lineHeight: 1.5 })}>{level.label}</span>
                {level.paid && !isPaid && <span style={s({ fontFamily: E.mono, fontSize: 6.5, color: E.bdr3, letterSpacing: '0.08em' })}>PAID</span>}
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Level 4 — OAL Rung filter ── */}
      <div ref={oalRungRef} style={s({ borderBottom: `1px solid ${E.bdr2}`, background: activeLevel === 4 ? '#0C0A08' : E.bg, padding: '7px 18px', display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', transition: 'background 0.2s' })}>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: activeLevel === 4 ? E.gold : E.sec, letterSpacing: '0.18em', textTransform: 'uppercase' as const, marginRight: 7, flexShrink: 0 })}>4 · Rungs</span>
        {OAL_RUNGS.map(({ key, label, sub }) => {
          const active = selectedOal === key
          return (
            <button key={key} onClick={() => selectOal(key)} className="filter-strip-btn" style={s({
              fontFamily: E.mono, fontSize: 11, fontWeight: active ? 700 : 400,
              letterSpacing: '0.06em',
              padding: sub ? '4px 11px 3px' : '4px 11px',
              border: `1px solid ${active ? E.gold : E.bdr3}`,
              background: active ? 'rgba(197,162,74,0.09)' : 'transparent',
              color: active ? E.gold : E.body,
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0,
            })}>
              <span>{label}</span>
              {sub && <span style={s({ fontSize: 7, color: active ? E.gold : E.sec, letterSpacing: '0.04em' })}>{sub}</span>}
            </button>
          )
        })}
      </div>

      {/* ── Level 7 — EV Band filter ── */}
      <div ref={evBandRef} style={s({ borderBottom: `1px solid ${E.bdr2}`, background: activeLevel === 7 ? '#0C0A08' : E.bg, padding: '7px 18px', display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', transition: 'background 0.2s' })}>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: activeLevel === 7 ? E.gold : E.sec, letterSpacing: '0.18em', textTransform: 'uppercase' as const, marginRight: 7, flexShrink: 0 })}>7 · EV Bands</span>
        {EV_BANDS.map(({ band, label, sub }) => {
          const active = selectedBand === band
          return (
            <button key={String(band)} onClick={() => selectBand(band)} className="filter-strip-btn" style={s({
              fontFamily: E.mono, fontSize: 11, fontWeight: active ? 700 : 400,
              letterSpacing: '0.06em',
              padding: sub ? '4px 11px 3px' : '4px 11px',
              border: `1px solid ${active ? E.gold : E.bdr3}`,
              background: active ? 'rgba(197,162,74,0.09)' : 'transparent',
              color: active ? E.gold : E.body,
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0,
            })}>
              <span>{label}</span>
              {sub && <span style={s({ fontSize: 7, color: active ? E.gold : E.sec, letterSpacing: '0.04em' })}>{sub}</span>}
            </button>
          )
        })}
      </div>

      {/* ── Panel header row ── */}
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${E.bdr2}`, background: E.bg2 })}>
        <div style={s({ padding: '7px 18px', borderRight: `1px solid ${E.bdr2}` })}>
          <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: E.body })}>Constellation · Structural neighborhoods</div>
          <div style={s({ fontFamily: E.mono, fontSize: 7.5, color: E.sec, marginTop: 2 })}>Force-directed · No axes</div>
        </div>
        <div style={s({ padding: '7px 18px' })}>
          <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: E.body })}>Structural Risk Map · Detachment × Degradation</div>
          <div style={s({ fontFamily: E.mono, fontSize: 7.5, color: E.sec, marginTop: 2 })}>Two-axis · Precise coordinates</div>
        </div>
      </div>

      {/* ── Dual visualization panels ── */}
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 440, borderBottom: `1px solid ${E.bdr2}` })}>
        <div style={s({ borderRight: `1px solid ${E.bdr2}`, background: E.bg, overflow: 'hidden' })}>
          <svg ref={conSvgRef} style={s({ display: 'block', width: '100%', height: '100%' })} />
        </div>
        <div style={s({ background: E.bg, overflow: 'hidden' })}>
          <svg ref={scatSvgRef} style={s({ display: 'block', width: '100%', height: '100%' })} />
        </div>
      </div>

      {/* ── Legend strip ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, padding: '7px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 })}>
        <div style={s({ display: 'flex', alignItems: 'center', gap: 16 })}>
          {BUCKET_ORDER.map(b => (
            <div key={b} style={s({ display: 'flex', alignItems: 'center', gap: 5 })}>
              <div style={s({ width: 8, height: 8, borderRadius: '50%', background: bucketColor(b), flexShrink: 0 })} />
              <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.body })}>{b}{b === 'Very High' ? ' ◈' : ''}</span>
            </div>
          ))}
        </div>
        <span style={s({ fontFamily: E.mono, fontSize: 7.5, color: E.sec })}>
          Node size = market cap · Pulsation = degradation risk · Hover to cross-highlight
        </span>
      </div>

      {/* ── Tooltip ── */}
      {tooltip && (
        <div style={s({
          position: 'absolute', left: tooltip.x, top: tooltip.y,
          background: '#0E0C0A', border: `1px solid ${E.bdr3}`, borderTop: `2px solid ${E.gold}`,
          padding: '9px 13px', fontFamily: E.mono, fontSize: 11, color: E.text,
          lineHeight: 1.85, whiteSpace: 'nowrap' as const, zIndex: 30, pointerEvents: 'none',
        })}>
          <div style={s({ color: E.gold, fontSize: 12, marginBottom: 2 })}>{tooltip.node.symbol}</div>
          <div style={s({ color: E.body })}>Band {tooltip.node.evBand} · {fmtEV(tooltip.node.ev)}</div>
          <div style={s({ color: E.body })}>Composite: {tooltip.node.composite.toFixed(1)} · {tooltip.node.bucket}</div>
          <div style={s({ color: E.body })}>OAL: {tooltip.node.oal}</div>
          <div style={s({ color: E.sec })}>Detachment: {tooltip.node.axis1.toFixed(1)} · Degradation: {tooltip.node.axis2.toFixed(1)}</div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={s({ padding: '18px', textAlign: 'center' as const })}>
        <p style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>
          © 2026 The Capital Steward, LLC · For informational purposes only · Not investment advice
        </p>
      </div>

    </div>
  )
}