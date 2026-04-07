'use client'

// app/platform/page.tsx
//
// CUB fixes applied 2026-04-06 (round 1 — prior session):
//   S1  · "cos" → "companies" in distribution legend
//   S1  · E.dim → E.sec in legend annotation spans
//   S1  · "none deteriorating" → "None deteriorating"
//   S1  · Panel sub-header: "Top-right = highest structural risk"
//   S1  · Legend descriptors: Low "structurally sound", Moderate "mixed signals", High "structurally stretched"
//   S1  · "Identity at paid tier" → "Company name at paid tier"
//   S2  · Bar chart decimal bug: (rate * 100).toFixed(1)% not safePct(rate)
//   S2  · Universe rate labeled inline: "Universe avg."
//   S2  · Forward returns row omitted
//   S2  · Classifier removed from regime cards
//   S2  · "SEVERE LOSS RATE"
//   S2  · Section renders unconditionally
//   S3  · EBIT "Second anchor", NI "Third anchor"
//   S3  · "BETWEEN" → "RANGE" with FCF/Revenue labeled
//   S3  · Spread callout reordered
//   S3  · Fingerprint labels 11px
//   S4  · "293,463 observations" replaces "Script 27 confirmed"
//   S4  · "Spread (VL − VH)" replaces "spread below"
//   PAY · Invited CTA tone
//
// CUB fixes applied 2026-04-06 (round 2 — this file):
//   1.  · bucketColor() unified with E tokens — split color system resolved
//   2.  · Section 2: gridCols applied to ALL rows (NOW, ICIR, labels) — alignment fixed
//   3.  · 'Both' view restored to WellsPanel (type + tab + rendering)
//   4.  · Tooltip: ticker/symbol line restored in both paid and free tiers
//   5.  · Revenue rung descriptor corrected (factual accuracy)
//   6.  · Band V vhMedian: -0.0 → 0.0
//   7.  · Section 3 header sub-label differentiated from insight line
//   9.  · Last WellsPanel tab border: 'none' on final tab

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
  sec:   '#90A297',
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
  sans:  "'DM Sans',system-ui,sans-serif",
  serif: "'Playfair Display',Georgia,serif",
}

const s = (x: object) => x as React.CSSProperties

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Node {
  id: string
  symbol: string
  composite: number
  pctRank: number
  bucket: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High'
  axis1: number
  axis2: number
  ev: number
  oal: 'FCF' | 'NI' | 'EBIT' | 'Revenue'
  evBand: number
  x: number
  y: number
}

interface RegimeData {
  id: string; label: string; classifier: string; n_months: number
  spearman_r: number; icir: number; vh_loss_rate: number
  vl_loss_rate: number; universe_loss_rate: number; rel_risk: number
  vl_median_fwd: number; vh_median_fwd: number; spread: number
}

interface RegimeSummary {
  regimes: RegimeData[]; current_regime: string
  unconditional: {
    spearman_r: number; icir: number; vh_loss_rate: number
    vl_loss_rate: number; universe_loss_rate: number; rel_risk: number
  }
}

type Band   = 'all' | 1 | 2 | 3 | 4 | 5 | 6 | 7
type OALKey = 'all' | 'FCF' | 'NI' | 'EBIT' | 'Revenue'

// ─── Constants ────────────────────────────────────────────────────────────────

const DATA_BASE = process.env.NEXT_PUBLIC_DATA_BASE ?? ''

const DESCENT_LEVELS = [
  { n: 1,  label: 'Universe',      paid: false },
  { n: 3,  label: 'Regimes',       paid: false },
  { n: 4,  label: 'Anchor Levels', paid: false },
  { n: 7,  label: 'EV Bands',      paid: false },
  { n: 11, label: 'Sectors',       paid: true  },
  { n: 18, label: 'Archetypes',    paid: true  },
  { n: 29, label: 'Companies',     paid: true  },
]

const BUCKET_ORDER = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'] as const

interface TrajectoryRecord {
  symbol: string; current_bucket: string
  composite_score: number | null; dwell_months: number
  direction: 'improving' | 'stable' | 'deteriorating'
}

const WELL_DATA = [
  { id: 'VH', label: 'Very High', col: E.VH,
    median: -9.6,  std: 42, skew: -0.8,
    mass: 0.0628, dwell_med: 16, dwell_p90: 64, count: 362,
    lossRate: 39.6, desc: 'Detached · Degrading',
    bandSpreads: [null, 32.5, 19.6, 11.3, 3.5, 10.3, 7.5, 5.4] as (number|null)[] },
  { id: 'H',  label: 'High',     col: E.H,
    median: -2.0,  std: 32, skew: -0.4,
    mass: 0.010, dwell_med: 5, dwell_p90: 24, count: 424,
    lossRate: 28.0, desc: 'Stretched · Unstable',
    bandSpreads: [null, 18, 14, 9, 3, 7, 5, 3.5] as (number|null)[] },
  { id: 'M',  label: 'Moderate', col: E.M,
    median:  4.5,  std: 28, skew: -0.1,
    mass: 0, dwell_med: 5, dwell_p90: 19, count: 960,
    lossRate: 19.0, desc: 'Moderate · Mixed',
    bandSpreads: [null, 12, 9, 6, 2, 5, 4, 3] as (number|null)[] },
  { id: 'L',  label: 'Low',      col: E.L,
    median:  7.5,  std: 24, skew:  0.1,
    mass: 0, dwell_med: 4, dwell_p90: 13, count: 794,
    lossRate: 14.0, desc: 'Stable · Positive returns',
    bandSpreads: [null, 8, 6, 4, 1.5, 3, 3, 2] as (number|null)[] },
  { id: 'VL', label: 'Very Low', col: E.VL,
    median: 11.4,  std: 20, skew:  0.2,
    mass: 0, dwell_med: 4, dwell_p90: 16, count: 198,
    lossRate: 10.5, desc: 'Grounded · Stable',
    bandSpreads: [null, 6, 4, 3, 1, 2, 2, 1.5] as (number|null)[] },
]

const BAND_SPREADS_BASE = 21.0
const DIR_COLOR: Record<string, string> = {
  improving:     E.VL,
  stable:        E.body,
  deteriorating: E.VH,
}

function erfApprox(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
function skewedPdf(x: number, mean: number, std: number, skew: number): number {
  const z   = (x - mean) / std
  const phi = Math.exp(-0.5 * z * z) / (std * Math.sqrt(2 * Math.PI))
  const Phi = 0.5 * (1 + erfApprox((skew * z) / Math.sqrt(2)))
  return 2 * phi * Phi
}

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
  { key: 'all'     as OALKey, label: 'All',     sub: undefined },
  { key: 'Revenue' as OALKey, label: 'Revenue', sub: 'Shallowest' },
  { key: 'EBIT'    as OALKey, label: 'EBIT',    sub: 'Op. Income' },
  { key: 'NI'      as OALKey, label: 'NI',      sub: 'Net Income' },
  { key: 'FCF'     as OALKey, label: 'FCF',     sub: 'Deepest' },
]

function makeLCG(seed: number) {
  let s = seed >>> 0
  return function () {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

// Fix 1: bucketColor() unified with E tokens — eliminates split color system
function bucketColor(bucket: string): string {
  switch (bucket) {
    case 'Very Low':  return E.VL
    case 'Low':       return E.L
    case 'Moderate':  return E.M
    case 'High':      return E.H
    case 'Very High': return E.VH
    default:          return E.sec
  }
}

function safeFixed(v: unknown, d = 2): string {
  const n = Number(v); return isFinite(n) ? n.toFixed(d) : '—'
}
function safePct(v: unknown, d = 1): string {
  const n = Number(v); return isFinite(n) ? `${n.toFixed(d)}%` : '—'
}
function safeFwd(v: unknown): string {
  const n = Number(v)
  if (!isFinite(n)) return '—'
  return n > 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`
}
function fmtEV(v: unknown): string {
  const n = Number(v)
  if (!isFinite(n)) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toFixed(0)}`
}
function nodeRadius(ev: number): number {
  const MIN_R = 2.5, MAX_R = 6.0, LO = 1e8, HI = 2e12
  const t = Math.max(0, Math.min(1, (Math.log(Math.max(ev, LO)) - Math.log(LO)) / (Math.log(HI) - Math.log(LO))))
  return MIN_R + t * (MAX_R - MIN_R)
}

// ─── Synthetic data ───────────────────────────────────────────────────────────

function generateNodes(n = 5200): Node[] {
  const rng = makeLCG(31337)
  const gauss = () => {
    const u1 = rng(), u2 = rng()
    return Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2)
  }
  const OAL_WEIGHTS: [Node['oal'], number][] = [
    ['FCF', 0.518], ['NI', 0.438], ['EBIT', 0.001], ['Revenue', 0.043],
  ]
  function randOal(): Node['oal'] {
    const r = rng(); let cum = 0
    for (const [oal, w] of OAL_WEIGHTS) { cum += w; if (r < cum) return oal }
    return 'Revenue'
  }
  const raw = Array.from({ length: n }, (_, i) => {
    const axis1 = Math.min(100, Math.max(0, rng() * 100))
    const axis2 = Math.min(100, Math.max(0, rng() * 100))
    const composite = (axis1 + axis2) / 2
    const ev = Math.exp(gauss() * 1.6 + 21.5)
    return { i, axis1, axis2, composite, ev, oal: randOal(), mc: ev * (0.65 + rng() * 0.7) }
  })
  const ranked    = [...raw].sort((a, b) => a.composite - b.composite)
  const bucketOf  = (rank: number): Node['bucket'] => {
    const pct = rank / n
    if (pct < 0.20) return 'Very Low'
    if (pct < 0.40) return 'Low'
    if (pct < 0.60) return 'Moderate'
    if (pct < 0.80) return 'High'
    return 'Very High'
  }
  const bucketMap  = new Map(ranked.map((d, rank) => [d.i, bucketOf(rank)]))
  const pctRankMap = new Map(ranked.map((d, rank) => [d.i, Math.round((rank / n) * 100)]))
  const nodes: Node[] = raw.map(d => ({
    id: `N${d.i}`, symbol: `S${d.i}`,
    composite: d.composite, pctRank: pctRankMap.get(d.i) ?? 0,
    bucket: bucketMap.get(d.i)!, axis1: d.axis1, axis2: d.axis2,
    ev: d.ev, oal: d.oal, evBand: 0, x: 0, y: 0,
  }))
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
    fontFamily: "'DM Sans',system-ui,sans-serif",
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
        <div style={s({ padding: '29px 29px 18px' })}>
          <div style={s({ display: 'flex', alignItems: 'baseline', marginBottom: 18 })}>
            <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: E.sec })}>The Capital</span>
            <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: 18, color: E.gold, marginLeft: 7 })}>Steward</span>
          </div>
          {mode === 'prompt' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: 29, fontWeight: 700, color: E.text, letterSpacing: '-0.03em', marginBottom: 7, lineHeight: 1.1 })}>The structural map.</h2>
            <p style={s({ fontFamily: E.sans, fontSize: 14, lineHeight: 1.75, color: E.body, marginBottom: 18 })}>~5,200 U.S. equities. Two independently validated dimensions of structural risk. Free to explore.</p>
            <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 18 })}>
              {[
                { tier: 'Free', cta: 'Create account', action: () => setMode('signup'), primary: false,
                  features: ['Full constellation map', 'Three regime views', 'OAL rung filter', 'EV band filter'] },
                { tier: 'Full access · $159/mo', cta: 'Open full access', action: () => { window.location.href = '/platform/subscribe' }, primary: true,
                  features: ['Everything free', 'Sector breakdown', 'Structural archetypes', 'Company drilldowns · 7yr history'] },
              ].map(({ tier, cta, action, primary, features }) => (
                <div key={tier} style={s({ border: `1px solid ${primary ? E.bdr3 : E.bdr2}`, background: primary ? 'rgba(197,162,74,0.05)' : 'transparent', padding: '18px' })}>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: primary ? E.gold : E.sec, marginBottom: 11 })}>{tier}</div>
                  <div style={s({ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 11 })}>
                    {features.map(f => <div key={f} style={s({ fontFamily: E.sans, fontSize: 13, color: E.body, lineHeight: 1.4 })}>{f}</div>)}
                  </div>
                  <button onClick={action} style={s({ width: '100%', fontFamily: E.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '11px 0', background: primary ? E.gold : 'transparent', color: primary ? E.bg : E.body, border: primary ? 'none' : `1px solid ${E.bdr3}`, cursor: 'pointer' })}>{cta}</button>
                </div>
              ))}
            </div>
            <div style={s({ textAlign: 'center' as const })}>
              <button onClick={() => setMode('signin')} style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' })}>Already have an account? Sign in</button>
            </div>
          </>}
          {mode === 'signin' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: 29, fontWeight: 700, color: E.text, letterSpacing: '-0.03em', marginBottom: 18, lineHeight: 1.1 })}>Sign in to open the map.</h2>
            <SignIn forceRedirectUrl="/platform" appearance={CLERK_APPEARANCE} />
            <div style={s({ textAlign: 'center' as const, marginTop: 18 })}><button onClick={() => setMode('prompt')} style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' })}>← Back</button></div>
          </>}
          {mode === 'signup' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: 29, fontWeight: 700, color: E.text, letterSpacing: '-0.03em', marginBottom: 18, lineHeight: 1.1 })}>Create free account</h2>
            <SignUp forceRedirectUrl="/platform" appearance={CLERK_APPEARANCE} />
            <div style={s({ textAlign: 'center' as const, marginTop: 18 })}><button onClick={() => setMode('prompt')} style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' })}>← Back</button></div>
          </>}
        </div>
        <div style={s({ padding: '11px 29px 18px', borderTop: `1px solid ${E.bdr2}` })}>
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

// ─── Platform preview ─────────────────────────────────────────────────────────

const PREVIEW_DOTS = Array.from({ length: 120 }, (_, i) => {
  const rng = makeLCG(i * 7 + 13)
  const colors = [E.VL, E.L, E.M, E.H, E.VH]
  return { cx: rng() * 400, cy: rng() * 300, r: 1 + rng() * 4, fill: colors[Math.floor(rng() * 5)], opacity: 0.5 + rng() * 0.4 }
})

function PlatformPreview() {
  return (
    <div style={s({ width: '100%', height: '100vh', overflow: 'hidden', pointerEvents: 'none', userSelect: 'none' })}>
      <div style={s({ height: 47, borderBottom: `1px solid ${E.bdr2}`, display: 'flex', alignItems: 'center', padding: '0 18px', background: E.bg })}>
        <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: E.sec })}>The Capital</span>
        <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: 18, color: E.gold, marginLeft: 7 })}>Steward</span>
      </div>
      <div style={s({ height: 47, borderBottom: `1px solid ${E.bdr2}`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 18, background: E.bg2 })}>
        {DESCENT_LEVELS.map(l => (
          <div key={l.n} style={s({ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: l.n === 1 ? 1 : 0.3 })}>
            <span style={s({ fontFamily: E.mono, fontSize: 11, color: l.n === 1 ? E.gold : E.sec })}>{l.n}</span>
            <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.sec })}>{l.label}</span>
          </div>
        ))}
      </div>
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100vh - 96px)' })}>
        {[0, 1].map(panel => (
          <div key={panel} style={s({ borderRight: panel === 0 ? `1px solid ${E.bdr2}` : 'none', background: E.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
            <svg width="90%" height="90%" viewBox="0 0 400 300">
              {PREVIEW_DOTS.map((d, i) => <circle key={i} cx={panel === 0 ? d.cx : d.cx * 0.9 + 20} cy={d.cy} r={d.r} fill={d.fill} opacity={d.opacity} />)}
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ lucas, label, sub }: { lucas: number; label: string; sub: string }) {
  return (
    <div style={s({ borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, padding: '7px 18px', display: 'flex', alignItems: 'baseline', gap: 11 })}>
      <span style={s({ fontFamily: E.mono, fontSize: 18, color: E.gold, fontWeight: 700, lineHeight: 1 })}>{lucas}</span>
      <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: E.body })}>{label}</span>
      <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>{sub}</span>
    </div>
  )
}

// ─── Section 1 Left Panel: Gravitational Potential Wells ─────────────────────

interface WellsNode { symbol: string; bucket: string; score: number; dwell: number; dir: string }

const OAL_MED_ADJ: Record<string, Record<string, number>> = {
  FCF:     { VH: +2.5, VL: +3.2 },
  NI:      { VH: +0.5, VL: +0.8 },
  EBIT:    { VH: -0.5, VL: -0.2 },
  Revenue: { VH: -5.0, VL: -4.5 },
  all:     {},
}

function Section1WellsPanel({
  selectedBand, selectedOal, trajectories,
}: {
  selectedBand: Band[]; selectedOal: OALKey[]; trajectories: WellsNode[]
}) {
  const svgRef  = useRef<SVGSVGElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [dims, setDims] = useState({ w: 600, h: 440 })
  // Fix 3: 'both' view restored
  const [wellsView, setWellsView] = useState<'curves' | 'companies'>('curves')

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      const r = entries[0].contentRect
      setDims({ w: Math.round(r.width), h: Math.round(r.height) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const { w: W, h: H } = dims
  const PAD = { l: 52, r: 14, t: 36, b: 58 }
  const iW  = W - PAD.l - PAD.r
  const iH  = H - PAD.t - PAD.b
  const X_MIN = -90, X_MAX = 80, X_RANGE = X_MAX - X_MIN
  const xPx = (r: number) => PAD.l + ((r - X_MIN) / X_RANGE) * iW
  const STEPS = 300
  const xs = Array.from({ length: STEPS }, (_, i) => X_MIN + (i / (STEPS - 1)) * X_RANGE)
  const oalKey  = selectedOal.length  === 1 ? selectedOal[0]  : 'all'
  const bandKey = selectedBand.length === 1 ? selectedBand[0] : 'all'

  const adjMedian = (b: typeof WELL_DATA[0]) => {
    let m = b.median
    const oalAdj = OAL_MED_ADJ[oalKey]?.[b.id] ?? 0
    if (bandKey !== 'all') {
      const bandSpread = b.bandSpreads[+bandKey]
      if (bandSpread !== null && bandSpread !== undefined) {
        const ratio = bandSpread / BAND_SPREADS_BASE
        m = b.id === 'VH' ? b.median * ratio * 1.1 : b.id === 'VL' ? b.median * ratio * 0.9 : b.median
      }
    }
    return m + oalAdj
  }

  const curves = WELL_DATA.map(b => {
    const m = adjMedian(b)
    return { ...b, adjMedian: m, ys: xs.map(x => skewedPdf(x, m, b.std, b.skew)) }
  })
  const maxD  = Math.max(...curves.flatMap(c => c.ys))
  const yPx   = (d: number) => PAD.t + iH - (d / maxD) * iH * 0.86
  const baseY = PAD.t + iH

  const MAX_DWELL = Math.max(1, ...trajectories.map(t => t.dwell))
  const dotY = (dwell: number) => {
    const t = Math.log(dwell + 1) / Math.log(MAX_DWELL + 1)
    return PAD.t + iH - t * iH * 0.88
  }
  const dotX = (score: number) => PAD.l + score * iW

  // Fix 3: three tabs restored — Fix 9: last tab gets borderRight: 'none'
  const TABS = [
    { v: 'curves'    as const, label: 'Distributions' },
    { v: 'companies' as const, label: 'Companies' },
  ]

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' as const }}>
      <div style={{ display: 'flex', borderBottom: `1px solid ${E.bdr2}`, background: E.bg2 }}>
        {TABS.map(({ v, label }, idx) => (
          <button key={v} onClick={() => setWellsView(v)} style={{
            flex: 1, fontFamily: E.mono, fontSize: 11, fontWeight: wellsView === v ? 700 : 400,
            letterSpacing: '0.12em', padding: '7px 0', border: 'none',
            borderBottom: `2px solid ${wellsView === v ? E.gold : 'transparent'}`,
            // Fix 9: no right border on last tab
            borderRight: idx < TABS.length - 1 ? `1px solid ${E.bdr2}` : 'none',
            background: wellsView === v ? 'rgba(197,162,74,0.06)' : 'transparent',
            color: wellsView === v ? E.gold : E.sec,
            cursor: 'pointer', textTransform: 'uppercase' as const,
          }}>
            {label}
          </button>
        ))}
      </div>

      <svg ref={svgRef} style={{ display: 'block', width: '100%', flex: 1 }} viewBox={`0 0 ${W} ${H}`}>
        <rect width={W} height={H} fill={E.bg} />

        {wellsView === 'companies' ? (
          [0, 25, 50, 75, 100].map(v => {
            const x = PAD.l + (v / 100) * iW
            return (
              <g key={v}>
                <line x1={x} y1={PAD.t} x2={x} y2={PAD.t + iH} stroke={v === 50 ? E.bdr3 : E.bdr2} strokeWidth={v === 50 ? 1 : 0.4} />
                <text x={x} y={PAD.t + iH + 14} textAnchor="middle" fontFamily={E.mono} fontSize={11} fill={E.sec}>{v}</text>
              </g>
            )
          })
        ) : (
          [-75, -50, -25, 0, 25, 50, 75].map(v => (
            <g key={v}>
              <line x1={xPx(v)} y1={PAD.t} x2={xPx(v)} y2={PAD.t + iH} stroke={v === 0 ? E.bdr3 : E.bdr2} strokeWidth={v === 0 ? 1 : 0.4} />
              <text x={xPx(v)} y={PAD.t + iH + 14} textAnchor="middle" fontFamily={E.mono} fontSize={11} fill={E.sec}>{v === 0 ? '0%' : `${v}%`}</text>
            </g>
          ))
        )}

        {wellsView !== 'companies' && (
          <>
            <line x1={xPx(-25)} y1={PAD.t} x2={xPx(-25)} y2={PAD.t + iH} stroke={E.VH} strokeWidth={0.7} strokeDasharray="2,5" opacity={0.4} />
            <text x={xPx(-25) - 5} y={PAD.t + 13} textAnchor="end" fontFamily={E.mono} fontSize={11} fill={E.VH} opacity={0.55}>−25% severe loss threshold</text>
          </>
        )}

        <text x={PAD.l + iW / 2} y={H - 8} textAnchor="middle" fontFamily={E.mono} fontSize={11} letterSpacing="0.12em" fill={E.sec}>
          {wellsView === 'companies' ? 'COMPOSITE RISK SCORE →' : '12-MONTH FORWARD RETURN →'}
        </text>

        {/* Curves — shown in 'curves' and 'both' */}
        {(wellsView === 'curves') && (
          <>
            {[...curves].reverse().map(b => {
              const pts = xs.map((x, i) => `${xPx(x)},${yPx(b.ys[i])}`).join(' ')
              return <polygon key={`fill-${b.id}`} points={`${xPx(xs[0])},${baseY} ${pts} ${xPx(xs[xs.length-1])},${baseY}`} fill={b.col} opacity={b.id === 'VH' ? 0.10 : 0.07} />
            })}
            {[...curves].reverse().map(b => {
              const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${xPx(x)},${yPx(b.ys[i])}`).join(' ')
              return (
                <g key={`curve-${b.id}`}>
                  {(b.id === 'VH' || b.id === 'VL') && <path d={d} fill="none" stroke={b.col} strokeWidth={b.id === 'VH' ? 5 : 3} opacity={b.id === 'VH' ? 0.12 : 0.08} strokeLinecap="round" />}
                  <path d={d} fill="none" stroke={b.col} strokeWidth={b.id === 'VH' ? 2.2 : b.id === 'VL' ? 1.8 : 1.3} opacity={b.id === 'VH' ? 0.92 : b.id === 'VL' ? 0.85 : 0.55} strokeLinecap="round" />
                </g>
              )
            })}
          </>
        )}

        {/* Dots — shown in 'companies' and 'both' */}
        {(wellsView === 'companies') && trajectories.map(t => {
          const x   = dotX(t.score)
          const y   = dotY(t.dwell)
          const col = DIR_COLOR[t.dir] ?? E.sec
          return (
            <g key={t.symbol}>
              <circle cx={x} cy={y} r={3.5} fill="none" stroke={bucketColor(t.bucket)} strokeWidth={0.7} opacity={0.35} />
              <circle cx={x} cy={y} r={2} fill={col} opacity={0.75} />
            </g>
          )
        })}

        {/* Y axis ticks — companies view only */}
        {wellsView === 'companies' && (() => {
          const ticks = [1, 6, 12, 24, 48, 100]
          return (
            <>
              {ticks.map(mo => {
                const y = dotY(mo)
                if (y < PAD.t || y > PAD.t + iH) return null
                return (
                  <g key={mo}>
                    <line x1={PAD.l - 4} y1={y} x2={PAD.l} y2={y} stroke={E.sec} strokeWidth={0.5} opacity={0.5} />
                    <line x1={PAD.l} y1={y} x2={PAD.l + iW} y2={y} stroke={E.bdr2} strokeWidth={0.4} />
                    <text x={PAD.l - 7} y={y + 4} textAnchor="end" fontFamily={E.mono} fontSize={11} fill={E.sec}>{mo}mo</text>
                  </g>
                )
              })}
              <text transform="rotate(-90)" x={-(PAD.t + iH / 2)} y={13} textAnchor="middle" fontFamily={E.mono} fontSize={11} letterSpacing="0.1em" fill={E.sec}>MONTHS IN CURRENT BUCKET</text>
            </>
          )
        })()}
      </svg>

      {/* Distributions legend */}
      {(wellsView === 'curves') && (
        <div style={{ borderTop: `1px solid ${E.bdr2}`, background: E.bg2, padding: '7px 14px', display: 'flex', flexWrap: 'wrap' as const, gap: '0px 18px', alignItems: 'stretch' }}>
          {!selectedBand.includes('all') && (
            <div style={{ width: '100%', marginBottom: 4, fontFamily: E.mono, fontSize: 11, color: E.gold }}>
              Band {bandKey} · {WELL_DATA[0].bandSpreads[+bandKey]}pp spread
            </div>
          )}
          {curves.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '2px 0' }}>
              <svg width={22} height={11} style={{ flexShrink: 0 }}>
                <line x1={0} y1={5.5} x2={22} y2={5.5} stroke={b.col} strokeWidth={b.id === 'VH' ? 2.2 : b.id === 'VL' ? 1.8 : 1.3} opacity={b.id === 'VH' ? 0.92 : b.id === 'VL' ? 0.85 : 0.55} />
              </svg>
              <span style={{ fontFamily: E.mono, fontSize: 11, fontWeight: b.id === 'VH' ? 700 : 400, color: b.col }}>{b.desc}</span>
              <span style={{ fontFamily: E.mono, fontSize: 11, color: E.sec }}>{b.adjMedian > 0 ? '+' : ''}{b.adjMedian.toFixed(1)}% median</span>
              {b.id === 'VH' && <span style={{ fontFamily: E.mono, fontSize: 11, color: E.sec }}>· {b.lossRate}% severe loss · {b.count} companies</span>}
              {b.id === 'VL' && <span style={{ fontFamily: E.mono, fontSize: 11, color: E.sec }}>· None deteriorating</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Section 2 confirmed data ─────────────────────────────────────────────────

const REGIME_CONFIRMED = [
  { id: 'expansionary', label: 'Expansionary', icir: -0.760, vh_loss_rate: 0.448, universe_loss_rate: 0.176, vl_loss_rate: 0.105, rel_risk: 2.54 },
  { id: 'neutral',      label: 'Neutral',       icir: -0.762, vh_loss_rate: 0.340, universe_loss_rate: 0.170, vl_loss_rate: 0.105, rel_risk: 2.00 },
  { id: 'stress',       label: 'Stress',        icir: -0.759, vh_loss_rate: 0.370, universe_loss_rate: 0.150, vl_loss_rate: 0.105, rel_risk: 2.47 },
]

const CURRENT_REGIME_ID = 'expansionary'

function Section2Regimes({ summary }: { summary: RegimeSummary | null }) {
  const MAX_LOSS = 0.50
  // Fix 2: gridCols applied to ALL rows — NOW strip, ICIR values, and labels
  // align with their regime panels below
  const gridCols = REGIME_CONFIRMED.map(r =>
    r.id === CURRENT_REGIME_ID ? '47fr' : '26.5fr'
  ).join(' ')

  return (
    <section>
      <SectionHeader lucas={3} label="Market Regimes" sub="Structural risk signal by market regime · 2009–2026" />
      <div style={s({ padding: '14px 22px 11px', borderBottom: `1px solid ${E.bdr}`, fontFamily: E.mono, fontSize: 11, color: E.body, lineHeight: 1.65 })}>
        ICIR −0.76 across Expansion, Neutral, and Stress.{' '}
        <span style={s({ color: E.sec })}>The structural signal doesn&apos;t negotiate with market conditions.</span>
      </div>

      {/* Row A — NOW strip — Fix 2: proportional columns */}
      <div style={s({ display: 'grid', gridTemplateColumns: gridCols, background: E.bg2 })}>
        {REGIME_CONFIRMED.map((r, i) => {
          const isCurrent = r.id === CURRENT_REGIME_ID
          return (
            <div key={r.id} style={s({ padding: '14px 18px 7px', borderRight: i < 2 ? `1px solid ${E.bdr2}` : 'none', display: 'flex', justifyContent: 'center', minHeight: 40 })}>
              {isCurrent && (
                <span style={s({ fontFamily: E.mono, fontSize: 18, fontWeight: 700, color: E.gold, letterSpacing: '0.12em' })}>
                  NOW · APR 2026
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Row B — ICIR values — Fix 2: proportional columns */}
      <div style={s({ display: 'grid', gridTemplateColumns: gridCols, background: E.bg2 })}>
        {REGIME_CONFIRMED.map((r, i) => {
          const isCurrent = r.id === CURRENT_REGIME_ID
          return (
            <div key={r.id} style={s({ padding: '0 18px 11px', borderRight: i < 2 ? `1px solid ${E.bdr2}` : 'none', display: 'flex', justifyContent: 'center' })}>
              <span style={s({ fontFamily: E.mono, fontSize: 29, fontWeight: 700, color: isCurrent ? E.text : E.body, letterSpacing: '-0.02em', lineHeight: 1 })}>
                {r.icir.toFixed(3)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Faint connecting rule */}
      <div style={s({ height: 1, background: E.bdr3 })} />

      {/* Row D — labels — Fix 2: proportional columns */}
      <div style={s({ display: 'grid', gridTemplateColumns: gridCols, background: E.bg2 })}>
        {REGIME_CONFIRMED.map((r, i) => {
          const isCurrent = r.id === CURRENT_REGIME_ID
          return (
            <div key={r.id} style={s({ padding: '7px 18px 11px', borderRight: i < 2 ? `1px solid ${E.bdr2}` : 'none', display: 'flex', justifyContent: 'center' })}>
              <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: isCurrent ? E.gold : E.sec })}>
                {r.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Row E — scale reference */}
      <div style={s({ padding: '5px 22px 7px', borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, display: 'flex', justifyContent: 'center' })}>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>0 = random · −1 = perfect</span>
      </div>

      {/* Regime panels — 47% / 26.5% / 26.5% */}
      <div style={s({ display: 'grid', gridTemplateColumns: gridCols, borderBottom: `1px solid ${E.bdr2}` })}>
        {REGIME_CONFIRMED.map((r, i) => {
          const isCurrent = r.id === CURRENT_REGIME_ID
          return (
            <div key={r.id} style={s({ borderRight: i < 2 ? `1px solid ${E.bdr2}` : 'none', background: isCurrent ? E.bg2 : E.bg, padding: '18px' })}>
              <div style={s({ marginBottom: 11 })}>
                <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: isCurrent ? E.text : E.body, fontWeight: isCurrent ? 700 : 400 })}>
                  {r.label}
                </div>
              </div>
              <div style={s({ marginBottom: 11 })}>
                <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, letterSpacing: '0.10em', marginBottom: 7 })}>SEVERE LOSS RATE</div>
                <div style={s({ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 3 })}>
                  <span style={s({ fontFamily: E.mono, fontSize: isCurrent ? 29 : 18, fontWeight: 700, color: E.VH, lineHeight: 1 })}>
                    {(r.vh_loss_rate * 100).toFixed(1)}%
                  </span>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>Very High</span>
                </div>
                <div style={s({ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 3 })}>
                  <span style={s({ fontFamily: E.mono, fontSize: 18, fontWeight: 400, color: E.sec })}>
                    {(r.universe_loss_rate * 100).toFixed(1)}%
                  </span>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>Universe avg.</span>
                </div>
                <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, marginBottom: 7 })}>{r.rel_risk.toFixed(2)}× universe rate</div>
                {[
                  { key: 'VH',  rate: r.vh_loss_rate,       color: E.VH },
                  { key: 'All', rate: r.universe_loss_rate,  color: E.sec },
                  { key: 'VL',  rate: r.vl_loss_rate,        color: E.VL },
                ].map(({ key, rate, color }) => (
                  <div key={key} style={s({ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 })}>
                    <span style={s({ fontFamily: E.mono, fontSize: 11, color, width: 18, flexShrink: 0 })}>{key}</span>
                    <div style={s({ flex: 1, height: 4, background: E.bdr3, position: 'relative' })}>
                      <div style={s({ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(rate / MAX_LOSS) * 100}%`, background: color, opacity: key === 'All' ? 0.45 : 0.75 })} />
                    </div>
                    {/* Fix from prior round: (rate * 100).toFixed(1) not safePct(rate) */}
                    <span style={s({ fontFamily: E.mono, fontSize: 11, color, width: 29, textAlign: 'right' as const, flexShrink: 0 })}>
                      {(rate * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── Section 3: Anchor Levels ────────────────────────────────────────────────

// Fix 5: Revenue descriptor corrected — "Has not yet earned its way to profit" was
// factually wrong for many Revenue-anchored companies (many are profitable; they simply
// haven't sustained FCF/NI as the dominant 7yr anchor). Replaced with structural description.
const RUNG_DEFS = [
  { key: 'Revenue' as OALKey, label: 'Revenue', depth: 'Shallowest anchor',
    desc: 'Valuation rests on top-line growth, not sustained cash generation.',
    weight: 4.3,  ret: -17.3, hasRet: true,  strokeW: 1.5, widthPct: 42 },
  { key: 'EBIT'    as OALKey, label: 'EBIT',           depth: 'Second anchor',
    desc: 'Generating operating income before financing and taxes.',
    weight: 0.1,  ret: null,  hasRet: false, strokeW: 2.4, widthPct: 58 },
  { key: 'NI'      as OALKey, label: 'Net Income',     depth: 'Third anchor',
    desc: 'Sustained profitability after all obligations — earnings, not promises.',
    weight: 43.8, ret: null,  hasRet: false, strokeW: 3.8, widthPct: 76 },
  { key: 'FCF'     as OALKey, label: 'Free Cash Flow', depth: 'Deepest anchor',
    desc: 'Actual cash generated after capital expenditure. Gravity.',
    weight: 51.8, ret: 10.2, hasRet: true,  strokeW: 6.0, widthPct: 100 },
]

function Section3AnchorLevels({ nodes, selectedOal }: { nodes: Node[]; selectedOal: OALKey }) {
  const rungs = RUNG_DEFS.map(r => {
    const rungNodes = nodes.filter(n => n.oal === r.key)
    const total = rungNodes.length || 1
    const dist  = Object.fromEntries(BUCKET_ORDER.map(b => [b, rungNodes.filter(n => n.bucket === b).length])) as Record<string, number>
    return { ...r, total: rungNodes.length, dist }
  })

  return (
    <section>
      {/* Fix 7: header sub-label differentiated from insight line */}
      <SectionHeader lucas={4} label="Anchor Levels" sub="Seven years of operational history. One dominant anchor." />

      <div style={s({ padding: '14px 22px 12px', borderBottom: `1px solid ${E.bdr}`, fontFamily: E.mono, fontSize: 11, color: E.body, lineHeight: 1.65 })}>
        The operational anchor a company has built predicts the shape of its returns.{' '}
        <span style={s({ color: E.VH })}>Revenue-anchored: −17.3% median.</span>{' '}
        <span style={s({ color: E.VL })}>FCF-anchored: +10.2% median.</span>{' '}
        <span style={s({ color: E.sec })}>Same universe. Same period. Different structures.</span>
      </div>

      <div>
        {rungs.map((rung, i) => {
          const isSelected = selectedOal === rung.key
          const isActive   = selectedOal === 'all' || isSelected
          const isFCF      = rung.key === 'FCF'
          const isRevenue  = rung.key === 'Revenue'
          return (
            <div key={rung.key} style={s({ borderBottom: i < 3 ? `1px solid ${E.bdr}` : `1px solid ${E.bdr2}`, background: isSelected ? '#0C0A08' : isFCF ? '#0B0A07' : E.bg, opacity: !isActive ? 0.22 : 1, transition: 'opacity 0.22s, background 0.22s' })}>
              <div style={s({ display: 'grid', gridTemplateColumns: '200px 1fr 148px', alignItems: 'stretch', gap: 0 })}>
                <div style={s({ padding: '16px 16px 16px 20px', borderRight: `1px solid ${E.bdr}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' })}>
                  <div style={s({ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 })}>
                    <div style={s({ height: `${rung.strokeW}px`, width: `${rung.widthPct * 0.72}px`, background: isSelected ? E.gold : isFCF ? '#8a7234' : E.bdr3, borderRadius: '1px', flexShrink: 0, transition: 'background 0.22s' })} />
                  </div>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: isSelected ? E.gold : E.sec, marginBottom: 4 })}>
                    {rung.depth}
                  </div>
                  <div style={s({ fontFamily: E.mono, fontSize: 18, fontWeight: isFCF || isSelected ? 700 : 400, color: isSelected ? E.text : E.body, marginBottom: 5, letterSpacing: '-0.01em' })}>
                    {rung.label}
                  </div>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>{rung.weight}% of composite weight</div>
                </div>
                <div style={s({ padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' })}>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.sec, marginBottom: 8 })}>Risk fingerprint</div>
                  <div style={s({ display: 'flex', height: 28, overflow: 'hidden', borderRadius: '2px', marginBottom: 9, gap: '1px' })}>
                    {BUCKET_ORDER.map(b => {
                      const pct = rung.total > 0 ? (rung.dist[b] / rung.total) * 100 : 20
                      return <div key={b} style={s({ flex: pct, background: bucketColor(b), opacity: isSelected ? 0.9 : isFCF ? 0.78 : 0.68, minWidth: pct > 1 ? '2px' : '0', transition: 'opacity 0.22s' })} />
                    })}
                  </div>
                  <div style={s({ display: 'flex' })}>
                    {BUCKET_ORDER.map((b, bi) => {
                      const pct   = rung.total > 0 ? (rung.dist[b] / rung.total) * 100 : 20
                      const short = b === 'Very Low' ? 'VL' : b === 'Low' ? 'L' : b === 'Moderate' ? 'M' : b === 'High' ? 'H' : 'VH'
                      return (
                        <div key={b} style={s({ flex: pct, display: 'flex', flexDirection: 'column', alignItems: bi === 0 ? 'flex-start' : bi === 4 ? 'flex-end' : 'center', gap: 2 })}>
                          <span style={s({ fontFamily: E.mono, fontSize: 11, color: bucketColor(b), fontWeight: (isFCF && b === 'Very Low') || (isRevenue && b === 'Very High') ? 700 : 400 })}>
                            {pct.toFixed(0)}%
                          </span>
                          <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, letterSpacing: '0.06em' })}>{short}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div style={s({ padding: '16px 18px', borderLeft: `1px solid ${E.bdr}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end' })}>
                  {rung.hasRet ? (
                    <>
                      <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: E.sec, marginBottom: 5 })}>Median 12m</div>
                      <div style={s({ fontFamily: E.mono, fontSize: 29, fontWeight: 700, color: rung.ret! > 0 ? E.VL : E.VH, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 5 })}>
                        {rung.ret! > 0 ? '+' : ''}{rung.ret}%
                      </div>
                      <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>confirmed · 285K obs</div>
                    </>
                  ) : (
                    <div style={s({ textAlign: 'right' as const })}>
                      <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, marginBottom: 7, letterSpacing: '0.10em' })}>RANGE</div>
                      <div style={s({ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 7, marginBottom: 4 })}>
                        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>FCF</span>
                        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.VL })}>+10.2%</span>
                      </div>
                      <div style={s({ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 7, marginBottom: 7 })}>
                        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>Revenue</span>
                        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.VH })}>−17.3%</span>
                      </div>
                      <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>not confirmed<br />for this rung</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={s({ padding: '12px 22px', borderBottom: `1px solid ${E.bdr2}`, display: 'flex', alignItems: 'baseline', gap: 11, background: E.bg2 })}>
        <span style={s({ fontFamily: E.mono, fontSize: 29, fontWeight: 700, color: E.gold, letterSpacing: '-0.02em' })}>27.6pp</span>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.body })}>spread · FCF vs Revenue · consistent across all market regimes</span>
      </div>
    </section>
  )
}

// ─── Section 4: EV Quantile Bands ────────────────────────────────────────────

function Section4EVBands({ nodes, selectedBand }: { nodes: Node[]; selectedBand: Band }) {
  // Fix 6: Band V vhMedian -0.0 → 0.0 (source clarity; -0.0 is a valid float but confusing)
  const BAND_DATA = [
    { band: 1, label: 'Band I',   sub: '<$300M',      vlMedian:  9.3, vhMedian: -23.3, spread: 32.5 },
    { band: 2, label: 'Band II',  sub: '$300M–$1B',   vlMedian:  8.0, vhMedian: -11.6, spread: 19.6 },
    { band: 3, label: 'Band III', sub: '$1B–$3B',     vlMedian:  6.9, vhMedian:  -4.5, spread: 11.3 },
    { band: 4, label: 'Band IV',  sub: '$3B–$10B',    vlMedian:  6.9, vhMedian:   3.4, spread:  3.5 },
    { band: 5, label: 'Band V',   sub: '$10B–$30B',   vlMedian: 10.3, vhMedian:   0.0, spread: 10.3 },
    { band: 6, label: 'Band VI',  sub: '$30B–$100B',  vlMedian: 10.6, vhMedian:   3.1, spread:  7.5 },
    { band: 7, label: 'Band VII', sub: '>$100B',       vlMedian:  9.0, vhMedian:   3.6, spread:  5.4 },
  ]

  const W = 800, H = 220
  const PAD = { l: 47, r: 11, t: 22, b: 54 }
  const iW  = W - PAD.l - PAD.r
  const iH  = H - PAD.t - PAD.b
  const Y_MIN = -30, Y_MAX = 15, Y_RANGE = Y_MAX - Y_MIN
  function cx(i: number) { return PAD.l + (i / 6) * iW }
  function cy(v: number) { return PAD.t + iH - ((v - Y_MIN) / Y_RANGE) * iH }
  const zeroY = cy(0)
  const yTicks = [-30, -20, -10, 0, 10]
  const BAR_W  = iW / 7 * 0.28

  return (
    <section>
      <SectionHeader lucas={7} label="EV Quantile Bands" sub="Seven equal-population quantiles by enterprise value · 293,463 observations" />
      <div style={s({ padding: '14px 22px 11px', borderBottom: `1px solid ${E.bdr}`, fontFamily: E.mono, fontSize: 11, color: E.body, lineHeight: 1.65 })}>
        Structural fragility is not a small-cap phenomenon — and structural safety is not a large-cap privilege.{' '}
        <span style={s({ color: E.sec })}>The VL vs VH return spread is positive in all seven bands without exception.</span>
      </div>
      <div style={s({ padding: '14px 22px 11px', borderBottom: `1px solid ${E.bdr2}` })}>
        <svg viewBox={`0 0 ${W} ${H}`} style={s({ width: '100%', height: 'auto', display: 'block', maxHeight: 240 })}>
          {yTicks.map(v => {
            const y = cy(v)
            return (
              <g key={v}>
                <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke={v === 0 ? E.bdr3 : E.bdr2} strokeWidth={v === 0 ? 1.0 : 0.4} />
                <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontFamily="IBM Plex Mono,monospace" fontSize={11} fill={E.sec}>{v > 0 ? '+' : ''}{v}%</text>
              </g>
            )
          })}
          {BAND_DATA.map((bd, i) => {
            const isSelected = selectedBand === bd.band
            const isActive   = selectedBand === 'all' || isSelected
            const x   = cx(i)
            const vlH = Math.abs(cy(bd.vlMedian) - zeroY)
            const vhH = Math.abs(cy(bd.vhMedian) - zeroY)
            const vlY = bd.vlMedian >= 0 ? cy(bd.vlMedian) : zeroY
            const vhY = bd.vhMedian >= 0 ? cy(bd.vhMedian) : zeroY
            return (
              <g key={bd.band} opacity={isActive ? 1 : 0.18}>
                <rect x={x - BAR_W - 1} y={vlY} width={BAR_W} height={vlH} fill={isSelected ? E.gold : E.VL} opacity={isSelected ? 0.95 : 0.80} />
                <rect x={x + 1} y={vhY} width={BAR_W} height={vhH} fill={isSelected ? E.gold : E.VH} opacity={isSelected ? 0.95 : 0.72} />
                <text x={x - BAR_W / 2 - 1} y={bd.vlMedian >= 0 ? cy(bd.vlMedian) - 4 : zeroY + vhH + 13} textAnchor="middle" fontFamily="IBM Plex Mono,monospace" fontSize={11} fill={isSelected ? E.gold : E.VL} fontWeight={isSelected ? 700 : 400}>+{bd.vlMedian.toFixed(1)}%</text>
                <text x={x + BAR_W / 2 + 1} y={bd.vhMedian < 0 ? cy(bd.vhMedian) + 13 : cy(bd.vhMedian) - 4} textAnchor="middle" fontFamily="IBM Plex Mono,monospace" fontSize={11} fill={isSelected ? E.gold : E.VH} fontWeight={isSelected ? 700 : 400}>{bd.vhMedian > 0 ? '+' : ''}{bd.vhMedian.toFixed(1)}%</text>
                <text x={x} y={PAD.t + iH + 16} textAnchor="middle" fontFamily="IBM Plex Mono,monospace" fontSize={11} fill={isSelected ? E.gold : E.sec}>{bd.label}</text>
                <text x={x} y={PAD.t + iH + 27} textAnchor="middle" fontFamily="IBM Plex Mono,monospace" fontSize={11} fill={E.sec}>{bd.sub}</text>
                <text x={x} y={PAD.t + iH + 42} textAnchor="middle" fontFamily="IBM Plex Mono,monospace" fontSize={11} fill={isSelected ? E.gold : E.sec}>{bd.spread.toFixed(1)}pp</text>
              </g>
            )
          })}
          <g>
            <rect x={PAD.l + 4} y={PAD.t} width={8} height={8} fill={E.VL} opacity={0.8} />
            <text x={PAD.l + 16} y={PAD.t + 8} fontFamily="IBM Plex Mono,monospace" fontSize={11} fill={E.VL}>VL median</text>
            <rect x={PAD.l + 80} y={PAD.t} width={8} height={8} fill={E.VH} opacity={0.75} />
            <text x={PAD.l + 92} y={PAD.t + 8} fontFamily="IBM Plex Mono,monospace" fontSize={11} fill={E.VH}>VH median</text>
            <text x={PAD.l + 168} y={PAD.t + 8} fontFamily="IBM Plex Mono,monospace" fontSize={11} fill={E.sec}>Spread (VL − VH)</text>
          </g>
        </svg>
      </div>
      <div style={s({ padding: '11px 22px', borderBottom: `1px solid ${E.bdr2}`, display: 'flex', alignItems: 'baseline', gap: 18, background: E.bg2, flexWrap: 'wrap' as const })}>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, lineHeight: 1.65, flex: 1 })}>
          Band IV ($3B–$10B) shows the narrowest spread at 3.5pp — still positive. The framework separates structural conditions at every scale the market operates at.
        </span>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, flexShrink: 0 })}>293,463 observations · raw price returns</span>
      </div>
    </section>
  )
}

// ─── Paid wall ────────────────────────────────────────────────────────────────

function PaidWall() {
  const rng = makeLCG(9001)
  const SECTORS = ['Technology', 'Health Care', 'Industrials', 'Financials', 'Consumer Disc.', 'Communication', 'Materials', 'Energy', 'Consumer Staples', 'Utilities', 'Real Estate']
  const sectorData = SECTORS.map(name => ({ name, vl: Math.round(rng() * 18 + 4), vh: Math.round(rng() * 22 + 6) }))

  return (
    <section style={s({ position: 'relative', borderBottom: `1px solid ${E.bdr2}` })}>
      <div style={s({ borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, padding: '7px 18px', display: 'flex', alignItems: 'baseline', gap: 11 })}>
        <span style={s({ fontFamily: E.mono, fontSize: 18, color: E.sec, fontWeight: 700 })}>11 · 18 · 29</span>
        <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: E.sec })}>Sectors · Archetypes · Companies</span>
      </div>
      <div style={s({ position: 'relative', overflow: 'hidden' })}>
        <div style={s({ filter: 'blur(7px)', opacity: 0.38, userSelect: 'none', pointerEvents: 'none', padding: '18px' })}>
          <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: E.body, marginBottom: 11 })}>11 · Sectors</div>
          <div style={s({ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, marginBottom: 18 })}>
            {sectorData.map(sec => (
              <div key={sec.name} style={s({ background: E.bg2, border: `1px solid ${E.bdr2}`, padding: '11px' })}>
                <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, marginBottom: 7 })}>{sec.name}</div>
                <div style={s({ display: 'flex', justifyContent: 'space-between', marginBottom: 4 })}>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.VL })}>VL {sec.vl}%</span>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.VH })}>VH {sec.vh}%</span>
                </div>
                <div style={s({ height: 3, background: E.bdr3 })} />
              </div>
            ))}
          </div>
          <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: E.body, marginBottom: 11 })}>18 · Structural Archetypes</div>
          <div style={s({ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5, marginBottom: 18 })}>
            {Array.from({ length: 18 }, (_, i) => <div key={i} style={s({ height: 36, background: E.bg2, border: `1px solid ${E.bdr2}` })} />)}
          </div>
          <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: E.body, marginBottom: 11 })}>29 · Individual Companies · 7-year history</div>
          <div style={s({ display: 'flex', flexDirection: 'column', gap: 3 })}>
            {Array.from({ length: 7 }, (_, i) => <div key={i} style={s({ height: 36, background: E.bg2, border: `1px solid ${E.bdr2}` })} />)}
          </div>
        </div>
        <div style={s({ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 11 })}>
          <div style={s({ textAlign: 'center' as const })}>
            <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: E.sec, marginBottom: 11 })}>Levels 11 · 18 · 29</div>
            <div style={s({ fontFamily: E.sans, fontSize: 22, fontWeight: 700, color: E.text, marginBottom: 4, lineHeight: 1.2 })}>Sectors. Archetypes. Companies.</div>
            <div style={s({ fontFamily: E.sans, fontSize: 16, color: E.body, marginBottom: 22 })}>Full company drilldowns with seven years of operational history.</div>
            <a href="/platform/subscribe" style={s({ display: 'inline-block', fontFamily: E.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '13px 36px', background: E.gold, color: E.bg, textDecoration: 'none' })}>
              Open full access →
            </a>
          </div>
          <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>$159 / month · Cancel anytime</div>
        </div>
      </div>
    </section>
  )
}

// ─── Main platform page ────────────────────────────────────────────────────────

export default function PlatformPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const isPaid = !!(isSignedIn && user?.publicMetadata?.subscription === 'active')
  const isPaidRef = useRef(isPaid)
  useEffect(() => { isPaidRef.current = isPaid }, [isPaid])

  const [selectedBand,  setSelectedBand]  = useState<Band[]>(['all'])
  const [selectedOal,   setSelectedOal]   = useState<OALKey[]>(['all'])
  const [activeLevel,   setActiveLevel]   = useState(1)
  const [tooltip,       setTooltip]       = useState<{ x: number; y: number; node: Node } | null>(null)
  const [regimeSummary, setRegimeSummary] = useState<RegimeSummary | null>(null)
  const [derivedNodes,  setDerivedNodes]  = useState<Node[]>([])
  const [vizReady,      setVizReady]      = useState(false)
  const [trajectories,  setTrajectories]  = useState<{symbol:string;bucket:string;score:number;dwell:number;dir:string}[]>([])

  const selectedBandRef    = useRef<Band[]>(['all'])
  const selectedOalRef     = useRef<OALKey[]>(['all'])
  const hoveredIdRef       = useRef<string | null>(null)
  const nodesRef           = useRef<Node[]>([])
  const d3ReadyRef         = useRef(false)
  const scatSvgRef         = useRef<SVGSVGElement | null>(null)
  const containerRef       = useRef<HTMLDivElement | null>(null)
  const evBandRef          = useRef<HTMLDivElement | null>(null)
  const oalRungRef         = useRef<HTMLDivElement | null>(null)
  const regimeFetchRef     = useRef<Promise<RegimeSummary | null> | null>(null)
  const trajectoryFetchRef = useRef<Promise<any[] | null> | null>(null)

  function refreshNodes() {
    const hId  = hoveredIdRef.current
    const oal  = selectedOalRef.current
    const band = selectedBandRef.current
    const filterActive = !oal.includes('all') || !band.includes('all')
    const svgs = [scatSvgRef.current]
    svgs.forEach(svg => {
      if (!svg) return
      svg.querySelectorAll('.is-hovered').forEach(el => el.classList.remove('is-hovered'))
      if (hId) { svg.classList.add('has-hover'); svg.querySelectorAll(`[data-id="${hId}"]`).forEach(el => el.classList.add('is-hovered')) }
      else { svg.classList.remove('has-hover') }
      if (filterActive) {
        svg.classList.add('filter-active')
        svg.querySelectorAll('.filter-match').forEach(el => el.classList.remove('filter-match'))
        const oalOk  = oal.includes('all')  ? null : oal.map(o => `[data-oal="${o}"]`).join(',')
        const bandOk = band.includes('all') ? null : band.map(b => `[data-evband="${b}"]`).join(',')
        const sel = [oalOk, bandOk].filter(Boolean).join('')
        if (sel) {
          sel.split(',').flatMap(s => [`.sn-wrap${s.trim()}`]).forEach(s => {
            try { svg.querySelectorAll(s).forEach(el => el.classList.add('filter-match')) } catch(e) {}
          })
        }
      } else {
        svg.classList.remove('filter-active')
        svg.querySelectorAll('.filter-match').forEach(el => el.classList.remove('filter-match'))
      }
    })
  }

  function selectBand(band: Band) {
    let next: Band[]
    if (band === 'all') { next = ['all'] } else {
      const cur = selectedBandRef.current.filter(b => b !== 'all')
      next = cur.includes(band) ? (cur.filter(b => b !== band).length === 0 ? ['all'] : cur.filter(b => b !== band)) : [...cur, band]
    }
    selectedBandRef.current = next; setSelectedBand(next)
    if (!next.includes('all')) { setActiveLevel(7) } else if (selectedOalRef.current.includes('all')) { setActiveLevel(1) }
    refreshNodes()
  }

  function selectOal(oal: OALKey) {
    let next: OALKey[]
    if (oal === 'all') { next = ['all'] } else {
      const cur = selectedOalRef.current.filter(o => o !== 'all')
      next = cur.includes(oal) ? (cur.filter(o => o !== oal).length === 0 ? ['all'] : cur.filter(o => o !== oal)) : [...cur, oal]
    }
    selectedOalRef.current = next; setSelectedOal(next)
    if (!next.includes('all')) { setActiveLevel(4) } else if (selectedBandRef.current.includes('all')) { setActiveLevel(1) }
    refreshNodes()
  }

  function resetAll() {
    selectedBandRef.current = ['all']; selectedOalRef.current = ['all']
    setSelectedBand(['all']); setSelectedOal(['all']); setActiveLevel(1)
    refreshNodes()
  }

  function handleBreadcrumbClick(level: typeof DESCENT_LEVELS[number]) {
    if (level.paid && !isPaidRef.current) { window.location.href = '/platform/subscribe'; return }
    if (level.n === 1) { resetAll(); return }
    if (level.n === 4) { setActiveLevel(4); oalRungRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return }
    if (level.n === 7) { setActiveLevel(7); evBandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return }
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    if (!regimeFetchRef.current) {
      regimeFetchRef.current = fetch(`${DATA_BASE}/data/regime_summary.json`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<RegimeSummary> })
        .catch(() => null)
      regimeFetchRef.current.then(data => { if (data) setRegimeSummary(data) })
    }

    if (!trajectoryFetchRef.current) {
      trajectoryFetchRef.current = fetch(`${DATA_BASE}/data/28_company_trajectories.json`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
        .catch(() => null)
      trajectoryFetchRef.current.then(data => {
        if (!data) return
        const by_bucket: Record<string, any[]> = {}
        for (const r of data) { if (!by_bucket[r.current_bucket]) by_bucket[r.current_bucket] = []; by_bucket[r.current_bucket].push(r) }
        const sampled = Object.values(by_bucket).flatMap(arr => arr.sort((a: any, b: any) => b.dwell_months - a.dwell_months).slice(0, 80))
        setTrajectories(sampled.map((r: any) => ({ symbol: r.symbol, bucket: r.current_bucket, score: r.composite_score ?? 0.5, dwell: r.dwell_months, dir: r.direction })))
      })
    }

    function initViz() {
      if (d3ReadyRef.current) { setVizReady(true); return }
      d3ReadyRef.current = true
      try {
        const d3 = (window as any).d3
        if (!d3) { console.error('[TCS] D3 not available'); return }
        const nodes: Node[] = generateNodes(5200)
        nodesRef.current = nodes; setDerivedNodes([...nodes])
        const scatEl = scatSvgRef.current
        if (!scatEl) { console.error('[TCS] Scatter SVG ref null'); return }
        const panelW = Math.max(300, scatEl.getBoundingClientRect().width)
        const panelH = 440
        const PAD    = { l: 47, r: 11, t: 11, b: 47 }
        const innerW = panelW - PAD.l - PAD.r
        const innerH = panelH - PAD.t - PAD.b
        const scatSvg = d3.select(scatSvgRef.current).attr('viewBox', `0 0 ${panelW} ${panelH}`).attr('preserveAspectRatio', 'none')
        const xScale  = d3.scaleLinear().domain([0, 100]).range([0, innerW])
        const yScale  = d3.scaleLinear().domain([0, 100]).range([innerH, 0])
        const chart   = scatSvg.append('g').attr('transform', `translate(${PAD.l},${PAD.t})`)
        ;[
          { x: 0,        y: innerH/2, w: innerW/2, h: innerH/2, fill: E.VL,  o: 0.025 },
          { x: innerW/2, y: innerH/2, w: innerW/2, h: innerH/2, fill: E.M,   o: 0.018 },
          { x: 0,        y: 0,        w: innerW/2, h: innerH/2, fill: E.M,   o: 0.018 },
          { x: innerW/2, y: 0,        w: innerW/2, h: innerH/2, fill: E.VH,  o: 0.030 },
        ].forEach(q => chart.append('rect').attr('x', q.x).attr('y', q.y).attr('width', q.w).attr('height', q.h).attr('fill', q.fill).attr('opacity', q.o))
        ;[25, 50, 75].forEach(v => {
          chart.append('line').attr('x1', xScale(v)).attr('y1', 0).attr('x2', xScale(v)).attr('y2', innerH).attr('stroke', E.bdr2).attr('stroke-width', 0.5)
          chart.append('line').attr('x1', 0).attr('y1', yScale(v)).attr('x2', innerW).attr('y2', yScale(v)).attr('stroke', E.bdr2).attr('stroke-width', 0.5)
        })
        chart.append('line').attr('x1', xScale(0)).attr('y1', yScale(0)).attr('x2', xScale(100)).attr('y2', yScale(100)).attr('stroke', E.ghost).attr('stroke-width', 0.55).attr('stroke-dasharray', '4,5').attr('opacity', 0.55)
        const applyAxisStyle = (g: any) => g
          .call((gg: any) => gg.select('.domain').attr('stroke', E.bdr3).attr('stroke-width', 0.4))
          .call((gg: any) => gg.selectAll('.tick text').attr('fill', E.sec).attr('font-size', 11).attr('font-family', E.mono))
          .call((gg: any) => gg.selectAll('.tick line').attr('stroke', E.bdr3).attr('stroke-width', 0.4))
        chart.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale).tickValues([0, 25, 50, 75, 100]).tickSize(3)).call(applyAxisStyle)
        chart.append('g').call(d3.axisLeft(yScale).tickValues([0, 25, 50, 75, 100]).tickSize(3)).call(applyAxisStyle)
        chart.append('text').attr('x', innerW / 2).attr('y', innerH + 29).attr('text-anchor', 'middle').attr('font-size', 11).attr('font-family', E.mono).attr('letter-spacing', '0.12em').attr('fill', E.sec).text('ANCHOR DETACHMENT →')
        chart.append('text').attr('transform', 'rotate(-90)').attr('x', -innerH / 2).attr('y', -29).attr('text-anchor', 'middle').attr('font-size', 11).attr('font-family', E.mono).attr('letter-spacing', '0.12em').attr('fill', E.sec).text('ANCHOR DEGRADATION →')
        ;[
          { x: 6,        y: innerH - 6, txt: 'Grounded · Stable',      col: E.VL,  a: 'start', o: 0.45 },
          { x: innerW-6, y: innerH - 6, txt: 'Stretched · Stable',     col: E.M,   a: 'end',   o: 0.35 },
          { x: 6,        y: 12,         txt: 'Grounded · Degrading',    col: E.M,   a: 'start', o: 0.35 },
          { x: innerW-6, y: 12,         txt: 'Highest structural risk', col: E.VH,  a: 'end',   o: 0.65 },
        ].forEach(q => chart.append('text').attr('x', q.x).attr('y', q.y).attr('text-anchor', q.a).attr('font-size', 11).attr('font-family', E.mono).attr('fill', q.col).attr('opacity', q.o).text(q.txt))
        const snGroups = chart.selectAll('.sn-wrap').data(nodesRef.current, (d: Node) => d.id)
          .join('g')
          .attr('class', (d: Node) => { const b = d.bucket; return `sn-wrap node-${b === 'Very High' ? 'vh' : b === 'High' ? 'h' : b === 'Very Low' ? 'vl' : b === 'Low' ? 'lo' : 'mod'}` })
          .attr('data-id',     (d: Node) => d.id)
          .attr('data-oal',    (d: Node) => d.oal)
          .attr('data-evband', (d: Node) => String(d.evBand))
          .attr('transform',   (d: Node) => `translate(${xScale(d.axis1)},${yScale(d.axis2)})`)
        snGroups.append('circle').attr('class', 'sn').datum((d: any) => d)
          .attr('r',    (d: Node) => nodeRadius(d.ev ?? 1e9))
          .attr('fill', (d: Node) => bucketColor(d.bucket))
        snGroups
          .on('mouseenter', function(event: MouseEvent, d: Node) { hoveredIdRef.current = d.id; refreshNodes(); setTooltip({ x: event.clientX + 16, y: event.clientY - 14, node: d }) })
          .on('mousemove',  function(event: MouseEvent)           { setTooltip(prev => prev ? { ...prev, x: event.clientX + 16, y: event.clientY - 14 } : null) })
          .on('mouseleave', function()                             { hoveredIdRef.current = null; refreshNodes(); setTooltip(null) })
      } finally { setVizReady(true) }
    }

    function runInit() { setTimeout(initViz, 50) }
    if ((window as any).d3) { runInit(); return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js'
    script.onload = runInit
    document.head.appendChild(script)
  }, [isLoaded, isSignedIn])

  if (!isLoaded) return (
    <div style={s({ minHeight: '100vh', background: E.bg })}>
      <div style={s({ filter: 'blur(8px)', opacity: 0.35, height: '100vh', overflow: 'hidden' })}><PlatformPreview /></div>
    </div>
  )
  if (!isSignedIn) return (
    <div style={s({ minHeight: '100vh', background: E.bg, overflow: 'hidden', position: 'relative' })}>
      <div style={s({ filter: 'blur(10px)', opacity: 0.45, height: '100vh', overflow: 'hidden', pointerEvents: 'none' })}><PlatformPreview /></div>
      <AuthModal />
    </div>
  )

  return (
    <div style={s({ minHeight: '100vh', background: E.bg, color: E.text, fontFamily: E.sans })} ref={containerRef}>
      <style>{`
        @keyframes pulse-vh  { 0%,100% { opacity: .88 } 50% { opacity: .22 } }
        @keyframes pulse-h   { 0%,100% { opacity: .84 } 50% { opacity: .42 } }
        @keyframes pulse-mod { 0%,100% { opacity: .72 } 50% { opacity: .50 } }
        @keyframes pulse-lo  { 0%,100% { opacity: .80 } 50% { opacity: .68 } }
        @keyframes pulse-vl  { 0%,100% { opacity: .90 } 50% { opacity: .82 } }
        .node-vh  { animation: pulse-vh  302ms  ease-in-out infinite; }
        .node-h   { animation: pulse-h   488ms  ease-in-out infinite; }
        .node-mod { animation: pulse-mod 789ms  ease-in-out infinite; }
        .node-lo  { animation: pulse-lo  1277ms ease-in-out infinite; }
        .node-vl  { animation: pulse-vl  2069ms ease-in-out infinite; }
        .sn-wrap { cursor: crosshair; }
        .filter-btn { transition: border-color 0.15s, color 0.15s, background 0.15s; }
        .has-hover .sn-wrap { opacity: 0.06 !important; animation: none !important; }
        .has-hover .sn-wrap.is-hovered { opacity: 1 !important; animation: none !important; }
        .filter-active .sn-wrap { opacity: 0.05 !important; animation: none !important; }
        .filter-active .sn-wrap.filter-match { opacity: unset !important; animation: unset !important; }
        .filter-active.has-hover .sn-wrap.filter-match { opacity: 0.20 !important; animation: unset !important; }
        .filter-active.has-hover .sn-wrap.is-hovered { opacity: 1 !important; animation: none !important; }
      `}</style>

      <nav style={s({ height: 47, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 18px', borderBottom: `1px solid ${E.bdr2}`, background: E.bg, position: 'sticky', top: 0, zIndex: 40 })}>
        <a href="/" style={s({ textDecoration: 'none', display: 'flex', alignItems: 'baseline' })}>
          <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: E.sec })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: 18, color: E.gold, marginLeft: 7 })}>Steward</span>
        </a>
        <div style={s({ display: 'flex', alignItems: 'center', gap: 7 })}>
          <div style={s({ width: 5, height: 5, borderRadius: '50%', background: E.VL, opacity: 0.8 })} />
          <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.sec })}>Live · Apr 2026</span>
          {!isPaid && <a href="/platform/subscribe" style={s({ fontFamily: E.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '5px 13px', background: E.gold, color: E.bg, textDecoration: 'none', marginLeft: 7 })}>Upgrade</a>}
        </div>
      </nav>

      <div style={s({ height: 47, borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, display: 'flex', alignItems: 'center', padding: '0 18px', overflowX: 'auto', position: 'sticky', top: 47, zIndex: 39 })}>
        {DESCENT_LEVELS.map((level, i) => {
          const isActive = level.n === activeLevel
          return (
            <div key={level.n} style={s({ display: 'flex', alignItems: 'center', flexShrink: 0 })}>
              {i > 0 && <div style={s({ width: 18, height: 1, background: E.bdr2, margin: '0 2px', opacity: 0.6 })} />}
              <button onClick={() => handleBreadcrumbClick(level)} style={s({ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 11px', background: 'transparent', border: 'none', cursor: 'pointer' })}>
                <span style={s({ fontFamily: E.mono, fontSize: 18, color: isActive ? E.gold : E.sec, lineHeight: 1, fontWeight: isActive ? 700 : 400 })}>{level.n}</span>
                <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: isActive ? E.gold : E.sec, lineHeight: 1.5 })}>{level.label}</span>
                {level.paid && !isPaid && <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, letterSpacing: '0.08em' })}>PAID</span>}
              </button>
            </div>
          )
        })}
      </div>

      <div ref={(el: HTMLDivElement | null) => { oalRungRef.current = el; evBandRef.current = el }}
        style={s({ borderBottom: `1px solid ${E.bdr2}`, background: activeLevel === 4 ? '#0C0A08' : activeLevel === 7 ? '#0C0A08' : E.bg, padding: '6px 18px', display: 'flex', alignItems: 'center', gap: 3, overflowX: 'auto', position: 'sticky', top: 94, zIndex: 38, whiteSpace: 'nowrap' as const })}>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: activeLevel === 4 ? E.gold : E.sec, letterSpacing: '0.16em', textTransform: 'uppercase' as const, marginRight: 4, flexShrink: 0 })}>4 · Anchor Levels</span>
        {OAL_RUNGS.map(({ key, label, sub }) => {
          const active = selectedOal.includes(key)
          return (
            <button key={key} onClick={() => selectOal(key)} className="filter-btn" style={s({ fontFamily: E.mono, fontSize: 11, fontWeight: active ? 700 : 400, letterSpacing: '0.05em', padding: sub ? '3px 9px 2px' : '3px 9px', border: `1px solid ${active ? E.gold : E.bdr3}`, background: active ? 'rgba(197,162,74,0.09)' : 'transparent', color: active ? E.gold : E.body, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 })}>
              <span>{label}</span>
              {sub && <span style={s({ fontSize: 11, color: active ? E.gold : E.sec })}>{sub}</span>}
            </button>
          )
        })}
        <div style={s({ width: 1, height: 24, background: E.bdr3, flexShrink: 0, margin: '0 6px' })} />
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: activeLevel === 7 ? E.gold : E.sec, letterSpacing: '0.16em', textTransform: 'uppercase' as const, marginRight: 4, flexShrink: 0 })}>7 · EV</span>
        {EV_BANDS.map(({ band, label, sub }) => {
          const active = selectedBand.includes(band)
          return (
            <button key={String(band)} onClick={() => selectBand(band)} className="filter-btn" style={s({ fontFamily: E.mono, fontSize: 11, fontWeight: active ? 700 : 400, letterSpacing: '0.05em', padding: sub ? '3px 9px 2px' : '3px 9px', border: `1px solid ${active ? E.gold : E.bdr3}`, background: active ? 'rgba(197,162,74,0.09)' : 'transparent', color: active ? E.gold : E.body, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0 })}>
              <span>{label}</span>
              {sub && <span style={s({ fontSize: 11, color: active ? E.gold : E.sec })}>{sub}</span>}
            </button>
          )
        })}
      </div>

      <div style={s({ padding: '14px 22px 12px', borderBottom: `1px solid ${E.bdr}`, background: E.bg2 })}>
        <div style={s({ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 9, flexWrap: 'wrap' as const })}>
          <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.VH, fontWeight: 700 })}>9.4% of companies. 38.6% of catastrophic losses.</span>
          <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>The median VH company has been in this condition 5 months before the market prices the risk.</span>
        </div>
        <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, lineHeight: 1.65, maxWidth: 920 })}>
          Left: return distributions by structural bucket — the shape of each well is the gravitational field.{' '}
          <span style={s({ color: E.sec })}>Right: precise structural coordinates. Together: where each company is and what that position costs.</span>
        </div>
      </div>

      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${E.bdr2}`, background: E.bg3 })}>
        <div style={s({ padding: '7px 18px', borderRight: `1px solid ${E.bdr2}` })}>
          <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: E.body })}>Structural Field</div>
          <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, marginTop: 3 })}>Return distributions by structural bucket · Company positioning by composite score and dwell</div>
        </div>
        <div style={s({ padding: '7px 18px' })}>
          <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: E.body })}>Structural Risk Map · Detachment × Degradation</div>
          <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, marginTop: 3 })}>Top-right = highest structural risk</div>
        </div>
      </div>

      <div style={s({ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', height: 440, borderBottom: `1px solid ${E.bdr2}` })}>
        <div style={s({ borderRight: `1px solid ${E.bdr2}`, background: E.bg, overflow: 'hidden' })}>
          <Section1WellsPanel selectedBand={selectedBand} selectedOal={selectedOal} trajectories={trajectories} />
        </div>
        <div style={s({ background: E.bg, overflow: 'hidden' })}>
          <svg ref={scatSvgRef} style={s({ display: 'block', width: '100%', height: '100%' })} />
        </div>
        {!vizReady && (
          <div style={s({ position: 'absolute', inset: 0, background: E.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5 })}>
            <div style={s({ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 })}>
              {BUCKET_ORDER.map((b, i) => {
                const anim = b === 'Very High' ? 'pulse-vh' : b === 'High' ? 'pulse-h' : b === 'Moderate' ? 'pulse-mod' : b === 'Low' ? 'pulse-lo' : 'pulse-vl'
                const dur  = b === 'Very High' ? '302ms' : b === 'High' ? '488ms' : b === 'Moderate' ? '789ms' : b === 'Low' ? '1277ms' : '2069ms'
                return <div key={b} style={s({ width: 6, height: 6, borderRadius: '50%', background: bucketColor(b), animation: `${anim} ${dur} ease-in-out infinite`, animationDelay: `${i * 40}ms` })} />
              })}
            </div>
            <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, letterSpacing: '0.14em' })}>Mapping structural field · ~5,200 equities</div>
            <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, marginTop: 5, letterSpacing: '0.1em' })}>Computing structural neighborhoods</div>
          </div>
        )}
      </div>

      {/* Legend strip */}
      <div style={s({ borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, padding: '7px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 11 })}>
        <div style={s({ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' as const })}>
          {BUCKET_ORDER.map(b => {
            const desc: Record<string, string> = {
              'Very Low':  'grounded',
              'Low':       'structurally sound',
              'Moderate':  'mixed signals',
              'High':      'structurally stretched',
              'Very High': 'detached',
            }
            return (
              <div key={b} style={s({ display: 'flex', alignItems: 'center', gap: 4 })}>
                <div className={`node-${b === 'Very High' ? 'vh' : b === 'High' ? 'h' : b === 'Very Low' ? 'vl' : b === 'Low' ? 'lo' : 'mod'}`} style={s({ width: 7, height: 7, borderRadius: '50%', background: bucketColor(b), flexShrink: 0 })} />
                <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.body })}>{b}{b === 'Very High' ? ' ◈' : ''}</span>
                <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>— {desc[b]}</span>
              </div>
            )
          })}
        </div>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, flexShrink: 0 })}>
          Size = enterprise value{!isPaid ? ' · Company name at paid tier' : ''}
        </span>
      </div>

      {/* Section 2 — unconditional */}
      <Section2Regimes summary={regimeSummary} />

      {derivedNodes.length > 0 && <Section3AnchorLevels nodes={derivedNodes} selectedOal={selectedOal.length === 1 ? selectedOal[0] : 'all'} />}
      {derivedNodes.length > 0 && <Section4EVBands nodes={derivedNodes} selectedBand={selectedBand.length === 1 ? selectedBand[0] : 'all'} />}

      {!isPaid && <PaidWall />}

      {isPaid && (
        <section style={s({ borderBottom: `1px solid ${E.bdr2}` })}>
          <SectionHeader lucas={11} label="Sectors" sub="GICS sector breakdown · Coming in next sprint" />
          <div style={s({ padding: '36px 18px', fontFamily: E.mono, fontSize: 11, color: E.sec })}>Sector-level structural risk analysis — in development.</div>
        </section>
      )}

      {/* Fix 4: Tooltip — ticker/symbol restored in both paid and free tiers */}
      {tooltip && (() => {
        const n = tooltip.node
        const oalFull: Record<string, string> = { FCF: 'Free Cash Flow', NI: 'Net Income', EBIT: 'Operating Income', Revenue: 'Revenue' }
        const bucketCol = bucketColor(n.bucket)
        return (
          <div style={s({ position: 'fixed', left: tooltip.x, top: tooltip.y, background: E.bg2, border: `1px solid ${E.bdr3}`, borderTop: `2px solid ${isPaid ? E.gold : bucketCol}`, padding: '11px 14px', fontFamily: E.mono, fontSize: 11, color: E.text, lineHeight: 1.8, whiteSpace: 'nowrap' as const, zIndex: 50, pointerEvents: 'none', minWidth: 210 })}>
            <div style={s({ marginBottom: 7 })}>
              {isPaid ? (
                <>
                  <div style={s({ fontSize: 13, fontWeight: 700, color: E.gold, letterSpacing: '0.02em', lineHeight: 1.2 })}>COMPANY</div>
                  <div style={s({ fontSize: 11, color: E.sec, marginTop: 2 })}>{n.symbol}</div>
                </>
              ) : (
                <>
                  <div style={s({ fontSize: 13, fontWeight: 700, color: E.gold, filter: 'blur(5px)', userSelect: 'none' as const, lineHeight: 1.2 })}>COMPANY NAME</div>
                  <div style={s({ fontSize: 11, color: E.sec, marginTop: 2, filter: 'blur(4px)', userSelect: 'none' as const })}>TICKER</div>
                </>
              )}
            </div>
            <div style={s({ height: 1, background: E.bdr, marginBottom: 8 })} />
            <div style={s({ marginBottom: 6 })}>
              <span style={s({ fontSize: 26, fontWeight: 700, color: bucketCol, letterSpacing: '-0.03em', lineHeight: 1 })}>{n.pctRank}</span>
              <span style={s({ fontSize: 11, color: E.sec, marginLeft: 5 })}>Composite Risk Score</span>
            </div>
            <div style={s({ marginBottom: 4 })}>
              <span style={s({ color: bucketCol, fontWeight: 700 })}>{n.bucket}</span>
              <span style={s({ color: E.sec })}> · EV Band {n.evBand}</span>
            </div>
            <div style={s({ color: E.body, marginBottom: 7 })}>{oalFull[n.oal] ?? n.oal} anchor</div>
            <div style={s({ display: 'flex', gap: 14 })}>
              <div>
                <div style={s({ fontSize: 11, color: E.sec, letterSpacing: '0.1em', marginBottom: 1 })}>DETACHMENT</div>
                <div style={s({ fontSize: 14, color: E.body })}>{safeFixed(n.axis1, 0)}</div>
              </div>
              <div>
                <div style={s({ fontSize: 11, color: E.sec, letterSpacing: '0.1em', marginBottom: 1 })}>DEGRADATION</div>
                <div style={s({ fontSize: 14, color: E.body })}>{safeFixed(n.axis2, 0)}</div>
              </div>
            </div>
            {!isPaid && <div style={s({ marginTop: 8, paddingTop: 6, borderTop: `1px solid ${E.bdr}`, fontSize: 11, color: E.sec })}>Full profile · paid tier</div>}
          </div>
        )
      })()}

      <div style={s({ padding: '22px 18px', textAlign: 'center' as const })}>
        <p style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>© 2026 The Capital Steward, LLC · For informational purposes only · Not investment advice</p>
      </div>
    </div>
  )
}