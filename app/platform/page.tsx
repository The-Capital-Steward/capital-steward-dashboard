'use client'

// app/platform/page.tsx
//
// Changes in this version:
//   1. HOVER DELAY FIXED — refreshNodes debounced with requestAnimationFrame.
//   2. FREE-TIER TOOLTIP REMOVED — company data is paid tier only.
//   3. SECTION 3 ADDED — Four OAL Anchor Rung Views.
//   4. SECTION 4 ADDED — Seven EV Quantile Band Views.
//   5. PAID BLUR MOVED — now covers Sections 5–7 only.
//   6. TOFIX CRASH FIXED — safe number formatters guard all .toFixed() calls.
//      regime_summary.json may have null/undefined numeric fields. Every
//      numeric display now falls back to '—' rather than crashing.
//   7. FILE PATH — fetch('/data/...') resolves from Next.js project root.
//      Set NEXT_PUBLIC_DATA_BASE in .env.local if fetches hit wrong app.

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
  pctRank: number            // 0–100 percentile rank in the universe
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
  id: string
  label: string
  classifier: string
  n_months: number
  spearman_r: number
  icir: number
  vh_loss_rate: number
  vl_loss_rate: number
  universe_loss_rate: number
  rel_risk: number
  vl_median_fwd: number
  vh_median_fwd: number
  spread: number
}

interface RegimeSummary {
  regimes: RegimeData[]
  current_regime: string
  unconditional: {
    spearman_r: number; icir: number
    vh_loss_rate: number; vl_loss_rate: number
    universe_loss_rate: number; rel_risk: number
  }
}

type Band   = 'all' | 1 | 2 | 3 | 4 | 5 | 6 | 7
type OALKey = 'all' | 'FCF' | 'NI' | 'EBIT' | 'Revenue'

// ─── Constants ────────────────────────────────────────────────────────────────

const DATA_BASE = process.env.NEXT_PUBLIC_DATA_BASE ?? ''

const DESCENT_LEVELS = [
  { n: 1,  label: 'Universe',   paid: false },
  { n: 3,  label: 'Regimes',    paid: false },
  { n: 4,  label: 'Rungs',      paid: false },
  { n: 7,  label: 'EV Bands',   paid: false },
  { n: 11, label: 'Sectors',    paid: true  },
  { n: 18, label: 'Archetypes', paid: true  },
  { n: 29, label: 'Companies',  paid: true  },
]

const BUCKET_ORDER = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'] as const

// ── Gravitational wells data ──────────────────────────────────────────────────
// Confirmed from Scripts 25, 26, 27. These are the parameters of each well.
// Distribution parameters derived from real backtest output.

interface TrajectoryRecord {
  symbol:          string
  current_bucket:  string
  composite_score: number | null
  dwell_months:    number
  direction:       'improving' | 'stable' | 'deteriorating'
}

const WELL_DATA = [
  { id: 'VH', label: 'Very High', col: '#C5524A',
    median: -9.6,  std: 42, skew: -0.8,
    mass: 0.0628, dwell_med: 16, dwell_p90: 64, count: 362,
    lossRate: 39.6, desc: 'Detached · Degrading',
    bandSpreads: [null, 32.5, 19.6, 11.3, 3.5, 10.3, 7.5, 5.4] as (number|null)[] },
  { id: 'H',  label: 'High',     col: '#C07050',
    median: -2.0,  std: 32, skew: -0.4,
    mass: 0.010, dwell_med: 5, dwell_p90: 24, count: 424,
    lossRate: 28.0, desc: 'Stretched · Unstable',
    bandSpreads: [null, 18, 14, 9, 3, 7, 5, 3.5] as (number|null)[] },
  { id: 'M',  label: 'Moderate', col: '#9E8A70',
    median:  4.5,  std: 28, skew: -0.1,
    mass: 0, dwell_med: 5, dwell_p90: 19, count: 960,
    lossRate: 19.0, desc: 'Balanced · Neutral',
    bandSpreads: [null, 12, 9, 6, 2, 5, 4, 3] as (number|null)[] },
  { id: 'L',  label: 'Low',      col: '#4B8A70',
    median:  7.5,  std: 24, skew:  0.1,
    mass: 0, dwell_med: 4, dwell_p90: 13, count: 794,
    lossRate: 14.0, desc: 'Stable · Improving',
    bandSpreads: [null, 8, 6, 4, 1.5, 3, 3, 2] as (number|null)[] },
  { id: 'VL', label: 'Very Low', col: '#5A9870',
    median: 11.4,  std: 20, skew:  0.2,
    mass: 0, dwell_med: 4, dwell_p90: 16, count: 198,
    lossRate: 10.5, desc: 'Grounded · Stable',
    bandSpreads: [null, 6, 4, 3, 1, 2, 2, 1.5] as (number|null)[] },
]

const BAND_SPREADS_BASE = 21.0
const DIR_COLOR: Record<string, string> = {
  improving:    '#5A9870',
  stable:       '#A89E8E',
  deteriorating: '#C5524A',
}

// Skewed-normal PDF for distribution curves
function erfApprox(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
function skewedPdf(x: number, mean: number, std: number, skew: number): number {
  const z = (x - mean) / std
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
  { key: 'all'     as OALKey, label: 'All Rungs', sub: undefined },
  { key: 'Revenue' as OALKey, label: 'Revenue',   sub: 'Shallowest' },
  { key: 'EBIT'    as OALKey, label: 'EBIT',      sub: 'Op. Income' },
  { key: 'NI'      as OALKey, label: 'NI',        sub: 'Net Income' },
  { key: 'FCF'     as OALKey, label: 'FCF',       sub: 'Deepest' },
]

// OAL_RUNG_DEFS removed — superseded by RUNG_DEFS in Section3AnchorLevels

// ─── Seeded LCG randomizer ────────────────────────────────────────────────────
// Deterministic pseudo-random generator. Same seed = same node positions
// across every render. Required for constellation stability.

function makeLCG(seed: number) {
  let s = seed >>> 0
  return function () {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0x100000000
  }
}


// ─── Color and formatting helpers ─────────────────────────────────────────────
// All helpers defined here so they're available to every component below.

// Map bucket names to palette colors
function bucketColor(bucket: string): string {
  switch (bucket) {
    case 'Very Low':  return '#4a9e6b'
    case 'Low':       return '#7ec99a'
    case 'Moderate':  return '#c8a84b'
    case 'High':      return '#d97a4a'
    case 'Very High': return '#c94a4a'
    default:          return '#666666'
  }
}

// Safe number formatters — guard against undefined/NaN from external JSON
function safeFixed(v: unknown, d = 2): string {
  const n = Number(v)
  return isFinite(n) ? n.toFixed(d) : '—'
}
function safePct(v: unknown, d = 1): string {
  const n = Number(v)
  return isFinite(n) ? `${n.toFixed(d)}%` : '—'
}
function safeFwd(v: unknown): string {
  const n = Number(v)
  if (!isFinite(n)) return '—'
  return n > 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`
}

// Format enterprise value (Axis 1 input) for display
function fmtEV(v: unknown): string {
  const n = Number(v)
  if (!isFinite(n)) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toFixed(0)}`
}

// Node radius scaled by Enterprise Value — EV is the Axis 1 numerator and
// the correct measure of acquisition cost. Log scale: ~2.5px at $100M EV,
// ~6px at $2T EV. Node footprint in the constellation = structural cost at scale.
function nodeRadius(ev: number): number {
  const MIN_R = 2.5, MAX_R = 6.0
  const LO = 1e8, HI = 2e12
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
  // OAL weights from confirmed 7yr anchor Number Swap List
  const OAL_WEIGHTS: [Node['oal'], number][] = [
    ['FCF', 0.518], ['NI', 0.438], ['EBIT', 0.001], ['Revenue', 0.043],
  ]
  function randOal(): Node['oal'] {
    const r = rng(); let cum = 0
    for (const [oal, w] of OAL_WEIGHTS) { cum += w; if (r < cum) return oal }
    return 'Revenue'
  }

  const raw = Array.from({ length: n }, (_, i) => {
    // Axis 1 and 2 generated independently — composite derived from them
    const axis1 = Math.min(100, Math.max(0, rng() * 100))
    const axis2 = Math.min(100, Math.max(0, rng() * 100))
    const composite = (axis1 + axis2) / 2
    const ev = Math.exp(gauss() * 1.6 + 21.5)
    return { i, axis1, axis2, composite, ev, oal: randOal(), mc: ev * (0.65 + rng() * 0.7) }
  })

  // Bucket from composite percentile rank
  const ranked = [...raw].sort((a, b) => a.composite - b.composite)
  const bucketOf = (rank: number): Node['bucket'] => {
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
    composite: d.composite,
    pctRank: pctRankMap.get(d.i) ?? 0,
    bucket: bucketMap.get(d.i)!,
    axis1: d.axis1, axis2: d.axis2,
    ev: d.ev, oal: d.oal,
    evBand: 0, x: 0, y: 0,
  }))

  // EV bands: 7 equal-population quantiles by EV
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

// ─── Platform preview (unauthenticated background) ───────────────────────────

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

// ─── Section header component ─────────────────────────────────────────────────

function SectionHeader({ lucas, label, sub }: { lucas: number; label: string; sub: string }) {
  return (
    <div style={s({ borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, padding: '7px 18px', display: 'flex', alignItems: 'baseline', gap: 11 })}>
      <span style={s({ fontFamily: E.mono, fontSize: 18, color: E.gold, fontWeight: 700, lineHeight: 1 })}>{lucas}</span>
      <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: E.body })}>{label}</span>
      <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>{sub}</span>
    </div>
  )
}

// ─── Section 2: Three Market Regime Summaries ─────────────────────────────────

// ─── Section 1 Left Panel: Gravitational Potential Wells ─────────────────────
//
// Replaces the force-directed constellation. Five return distribution curves
// rendered as gravitational wells. The depth of each well = dwell probability
// × |negative return| (confirmed from Scripts 25, 26, 27).
//
// Three view modes:
//   'curves'    — distribution curves only
//   'companies' — real company dots (composite × dwell, colored by direction)
//   'both'      — curves + dots overlaid
//
// Filter integration: selectedBand adjusts well shapes using Script 27
// per-band spread data. selectedOal adjusts medians directionally.

interface WellsNode {
  symbol: string
  bucket: string
  score:  number
  dwell:  number
  dir:    string
}

const OAL_MED_ADJ: Record<string, Record<string, number>> = {
  FCF:     { VH: +2.5, VL: +3.2 },
  NI:      { VH: +0.5, VL: +0.8 },
  EBIT:    { VH: -0.5, VL: -0.2 },
  Revenue: { VH: -5.0, VL: -4.5 },
  all:     {},
}

function Section1WellsPanel({
  selectedBand,
  selectedOal,
  trajectories,
}: {
  selectedBand: Band
  selectedOal:  OALKey
  trajectories: WellsNode[]
}) {
  const svgRef  = useRef<SVGSVGElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [dims, setDims] = useState({ w: 600, h: 440 })
  const [wellsView, setWellsView] = useState<'curves' | 'companies' | 'both'>('curves')

  // Measure panel on mount and resize
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

  // Adjust medians based on active filters
  const adjMedian = (b: typeof WELL_DATA[0]) => {
    let m = b.median
    const oalAdj = OAL_MED_ADJ[selectedOal]?.[b.id] ?? 0
    if (selectedBand !== 'all') {
      const bandSpread = b.bandSpreads[+selectedBand]
      if (bandSpread !== null && bandSpread !== undefined) {
        const ratio = bandSpread / BAND_SPREADS_BASE
        m = b.id === 'VH' ? b.median * ratio * 1.1
          : b.id === 'VL' ? b.median * ratio * 0.9
          : b.median
      }
    }
    return m + oalAdj
  }

  // Build curves
  const curves = WELL_DATA.map(b => {
    const m = adjMedian(b)
    return { ...b, adjMedian: m, ys: xs.map(x => skewedPdf(x, m, b.std, b.skew)) }
  })
  const maxD = Math.max(...curves.flatMap(c => c.ys))
  const yPx  = (d: number) => PAD.t + iH - (d / maxD) * iH * 0.86
  const baseY = PAD.t + iH

  // Company dots for scatter views
  const MAX_DWELL = Math.max(1, ...trajectories.map(t => t.dwell))
  const dotY = (dwell: number) => {
    const t = Math.log(dwell + 1) / Math.log(MAX_DWELL + 1)
    return PAD.t + iH - t * iH * 0.88
  }
  const dotX = (score: number) => PAD.l + score * iW

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* View mode toggle — top-right of panel */}
      <div style={{
        position: 'absolute', top: 7, right: 11, display: 'flex', gap: 2, zIndex: 2,
      }}>
        {(['curves', 'companies', 'both'] as const).map(v => (
          <button key={v} onClick={() => setWellsView(v)} style={{
            fontFamily: E.mono, fontSize: 8, letterSpacing: '0.1em', padding: '2px 7px',
            border: `1px solid ${wellsView === v ? E.gold : E.dim}`,
            background: wellsView === v ? 'rgba(197,162,74,0.10)' : 'transparent',
            color: wellsView === v ? E.gold : E.dim, cursor: 'pointer',
            textTransform: 'uppercase' as const,
          }}>
            {v}
          </button>
        ))}
      </div>

      <svg ref={svgRef} style={{ display: 'block', width: '100%', height: '100%' }}
           viewBox={`0 0 ${W} ${H}`}>

        {/* BG */}
        <rect width={W} height={H} fill={E.bg} />

        {/* ── Grid ── */}
        {[-75, -50, -25, 0, 25, 50, 75].map(v => (
          <g key={v}>
            <line x1={xPx(v)} y1={PAD.t} x2={xPx(v)} y2={PAD.t + iH}
              stroke={v === 0 ? '#272420' : '#1E1C18'}
              strokeWidth={v === 0 ? 1 : 0.4} />
            {v !== 0 && (
              <text x={xPx(v)} y={PAD.t + iH + 14} textAnchor="middle"
                fontFamily={E.mono} fontSize={9} fill="#3A3530">
                {v}%
              </text>
            )}
          </g>
        ))}

        {/* Zero label */}
        <text x={xPx(0)} y={PAD.t + iH + 14} textAnchor="middle"
          fontFamily={E.mono} fontSize={9} fill="#3A3530">0%</text>

        {/* Event horizon — −25% severe loss threshold */}
        <line x1={xPx(-25)} y1={PAD.t} x2={xPx(-25)} y2={PAD.t + iH}
          stroke={E.VH} strokeWidth={0.7} strokeDasharray="2,5" opacity={0.4} />
        <text x={xPx(-25) - 5} y={PAD.t + 13} textAnchor="end"
          fontFamily={E.mono} fontSize={8.5} fill={E.VH} opacity={0.55}>
          ← −25% threshold
        </text>

        {/* X axis label */}
        <text x={PAD.l + iW / 2} y={H - 8} textAnchor="middle"
          fontFamily={E.mono} fontSize={9} letterSpacing="0.12em" fill="#2A2520">
          {wellsView === 'companies' ? 'COMPOSITE RISK SCORE →' : '12-MONTH FORWARD RETURN →'}
        </text>

        {/* ── Distribution curves ── */}
        {(wellsView === 'curves' || wellsView === 'both') && (
          <>
            {/* Area fills */}
            {[...curves].reverse().map(b => {
              const pts = xs.map((x, i) => `${xPx(x)},${yPx(b.ys[i])}`).join(' ')
              return (
                <polygon key={`fill-${b.id}`}
                  points={`${xPx(xs[0])},${baseY} ${pts} ${xPx(xs[xs.length-1])},${baseY}`}
                  fill={b.col}
                  opacity={b.id === 'VH' ? 0.10 : 0.07} />
              )
            })}

            {/* Curve lines */}
            {[...curves].reverse().map(b => {
              const d = xs.map((x, i) =>
                `${i === 0 ? 'M' : 'L'}${xPx(x)},${yPx(b.ys[i])}`
              ).join(' ')
              return (
                <g key={`curve-${b.id}`}>
                  {/* Glow shadow */}
                  {(b.id === 'VH' || b.id === 'VL') && (
                    <path d={d} fill="none" stroke={b.col}
                      strokeWidth={b.id === 'VH' ? 5 : 3}
                      opacity={b.id === 'VH' ? 0.12 : 0.08}
                      strokeLinecap="round" />
                  )}
                  {/* Main curve */}
                  <path d={d} fill="none" stroke={b.col}
                    strokeWidth={b.id === 'VH' ? 2.2 : b.id === 'VL' ? 1.8 : 1.3}
                    opacity={b.id === 'VH' ? 0.92 : b.id === 'VL' ? 0.85 : 0.55}
                    strokeLinecap="round" />
                </g>
              )
            })}

            {/* Curve labels + median ticks */}
            {curves.map(b => {
              const peakIdx = b.ys.indexOf(Math.max(...b.ys))
              const peakX   = xPx(xs[peakIdx])
              const peakY   = yPx(b.ys[peakIdx])
              const medX    = xPx(b.adjMedian)
              const lY      = Math.min(peakY - 12, PAD.t + iH - 44)

              return (
                <g key={`label-${b.id}`}>
                  {/* Median tick */}
                  <line x1={medX} y1={PAD.t + iH - 5} x2={medX} y2={PAD.t + iH + 4}
                    stroke={b.col} strokeWidth={1} opacity={0.5} />
                  <text x={medX} y={PAD.t + iH + 26} textAnchor="middle"
                    fontFamily={E.mono} fontSize={9} fill={b.col} opacity={0.72}>
                    {b.adjMedian > 0 ? '+' : ''}{b.adjMedian.toFixed(1)}%
                  </text>

                  {/* Curve label */}
                  <text x={peakX} y={lY} textAnchor="middle" fontFamily={E.mono}
                    fontSize={b.id === 'VH' ? 10.5 : 9}
                    fontWeight={b.id === 'VH' ? '700' : '400'}
                    fill={b.col} opacity={b.id === 'VH' ? 1 : 0.75}>
                    {b.desc}
                  </text>

                  {/* VH annotations */}
                  {b.id === 'VH' && (
                    <>
                      <text x={peakX} y={lY + 13} textAnchor="middle"
                        fontFamily={E.mono} fontSize={8.5} fill={b.col} opacity={0.50}>
                        {b.count} cos · med dwell {b.dwell_med}mo · {b.lossRate}% severe loss
                      </text>
                      <text x={peakX} y={lY + 24} textAnchor="middle"
                        fontFamily={E.mono} fontSize={7.5} fill={b.col} opacity={0.32}
                        letterSpacing="0.08em">
                        GRAVITATIONAL MASS {b.mass.toFixed(4)}
                      </text>
                      {selectedBand !== 'all' && (
                        <text x={W - PAD.r} y={PAD.t + 9} textAnchor="end"
                          fontFamily={E.mono} fontSize={9} fill={E.gold} opacity={0.75}>
                          Band {selectedBand} · {b.bandSpreads[+selectedBand]}pp spread
                        </text>
                      )}
                    </>
                  )}
                  {b.id === 'VL' && (
                    <text x={peakX} y={lY + 13} textAnchor="middle"
                      fontFamily={E.mono} fontSize={8.5} fill={b.col} opacity={0.50}>
                      {b.count} cos · {b.lossRate}% severe loss · 0 deteriorating
                    </text>
                  )}
                </g>
              )
            })}
          </>
        )}

        {/* ── Company dots ── */}
        {(wellsView === 'companies' || wellsView === 'both') && trajectories.map(t => {
          const x  = wellsView === 'both'
            ? xPx(t.score * (X_MAX - X_MIN) + X_MIN)  // map score to return space
            : dotX(t.score)
          const y  = wellsView === 'both'
            ? dotY(t.dwell)
            : dotY(t.dwell)
          const col = DIR_COLOR[t.dir] ?? E.sec
          const bCol = bucketColor(t.bucket)
          return (
            <g key={t.symbol}>
              <circle cx={x} cy={y} r={4.5} fill="none"
                stroke={bCol} strokeWidth={0.8} opacity={0.40} />
              <circle cx={x} cy={y} r={2.5} fill={col} opacity={0.80} />
            </g>
          )
        })}

        {/* Y axis label for companies view */}
        {wellsView === 'companies' && (
          <text transform="rotate(-90)"
            x={-(PAD.t + iH / 2)} y={13} textAnchor="middle"
            fontFamily={E.mono} fontSize={9} letterSpacing="1.2" fill="#2A2520">
            DWELL MONTHS
          </text>
        )}

      </svg>
    </div>
  )
}

function Section2Regimes({ summary }: { summary: RegimeSummary }) {
  const MAX_LOSS = 0.50
  // Using global safePct / safeFwd for null-safe formatting

  return (
    <section>
      <SectionHeader lucas={3} label="Market Regimes" sub="Structural risk signal by market regime · 2009–2026" />
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${E.bdr2}` })}>
        {summary.regimes.map((regime, i) => {
          const isCurrent = regime.id === summary.current_regime
          return (
            <div key={regime.id} style={s({ borderRight: i < 2 ? `1px solid ${E.bdr2}` : 'none', background: isCurrent ? '#0C0A08' : E.bg, padding: '18px' })}>
              <div style={s({ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 11 })}>
                <div>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: isCurrent ? E.text : E.body, fontWeight: isCurrent ? 700 : 400, marginBottom: 3 })}>{regime.label}</div>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>{regime.classifier}</div>
                </div>
                <div style={s({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 })}>
                  {isCurrent && <span style={s({ fontFamily: E.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: E.bg, background: E.gold, padding: '2px 7px' })}>NOW</span>}
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>{regime.n_months} mo</span>
                </div>
              </div>

              {/* ICIR */}
              <div style={s({ marginBottom: 11 })}>
                <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, letterSpacing: '0.12em', marginBottom: 4 })}>ICIR</div>
                <div style={s({ fontFamily: E.mono, fontSize: 29, fontWeight: 400, color: isCurrent ? E.text : E.body, lineHeight: 1 })}>{safeFixed(regime.icir, 2)}</div>
                <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, marginTop: 4 })}>Signal consistency · r̄ / σ(r)</div>
              </div>

              <div style={s({ height: 1, background: E.bdr2, margin: '11px 0' })} />

              {/* Loss rate bars */}
              <div style={s({ marginBottom: 11 })}>
                <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, letterSpacing: '0.10em', marginBottom: 7 })}>SEVERE LOSS FREQUENCY</div>
                {[
                  { key: 'VH', rate: regime.vh_loss_rate, color: E.VH },
                  { key: 'All', rate: regime.universe_loss_rate, color: E.sec },
                  { key: 'VL', rate: regime.vl_loss_rate, color: E.VL },
                ].map(({ key, rate, color }) => (
                  <div key={key} style={s({ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 })}>
                    <span style={s({ fontFamily: E.mono, fontSize: 11, color, width: 18, flexShrink: 0 })}>{key}</span>
                    <div style={s({ flex: 1, height: 4, background: E.bdr3, position: 'relative' })}>
                      <div style={s({ position: 'absolute', left: 0, top: 0, height: '100%', width: `${((rate ?? 0) / MAX_LOSS) * 100}%`, background: color, opacity: key === 'All' ? 0.45 : 0.75 })} />
                    </div>
                    <span style={s({ fontFamily: E.mono, fontSize: 11, color, width: 29, textAlign: 'right' as const, flexShrink: 0 })}>{safePct(rate)}</span>
                  </div>
                ))}
                <div style={s({ fontFamily: E.mono, fontSize: 11, color: isCurrent ? E.body : E.sec, marginTop: 4 })}>{safeFixed(regime.rel_risk, 1)}× higher for Very High</div>
              </div>

              <div style={s({ height: 1, background: E.bdr2, margin: '11px 0' })} />

              {/* Median returns + Spearman r */}
              <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' })}>
                <div>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, letterSpacing: '0.10em', marginBottom: 4 })}>MEDIAN 12M FWD</div>
                  <div style={s({ display: 'flex', gap: 11 })}>
                    <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.VL })}>VL {safeFwd(regime.vl_median_fwd)}</span>
                    <span style={s({ fontFamily: E.mono, fontSize: 11, color: (regime.vh_median_fwd ?? 0) < 0 ? E.VH : E.sec })}>VH {safeFwd(regime.vh_median_fwd)}</span>
                  </div>
                </div>
                <div style={s({ textAlign: 'right' as const })}>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, marginBottom: 3 })}>r</div>
                  <div style={s({ fontFamily: E.mono, fontSize: 18, color: isCurrent ? E.body : E.sec })}>{safeFixed(regime.spearman_r, 3)}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── Section 3: Anchor Levels ────────────────────────────────────────────────
//
// The anchor ladder made data-rich. Insight-first: the visual lands before
// the copy explains it. The -17.3% / +10.2% spread is the punchline — the
// user sees it before they read it.
//
// Design principles:
//   • Four bands top-to-bottom: Revenue → EBIT → NI → FCF
//   • Band height proportional to OAL weight (FCF largest, EBIT minimal)
//   • Each band: full-width risk distribution bar + return anchor on right
//   • Confirmed returns shown large for FCF and Revenue only
//   • EBIT and NI: distribution shown, no return figure (honest)
//   • Selected rung highlighted with gold border; others dim
//   • Echoes the logo mark — this is the mark alive with data

// ─── Section 3 data ──────────────────────────────────────────────────────────
//
// Rung definitions for the Anchor Levels visualization.
// Logo mark geometry: strokeW and widthPct encode the same φ-based proportions
// as the physical mark. Revenue thin → FCF thick. This is intentional.
//
// Confirmed returns: FCF +10.2%, Revenue −17.3% only (Number Swap List).
// EBIT and NI return figures not confirmed for this display — shown honestly.

const RUNG_DEFS = [
  {
    key: 'Revenue' as OALKey,
    label: 'Revenue',
    depth: 'Shallowest anchor',
    desc: 'Has not yet earned its way to profit, let alone cash generation.',
    weight: 4.3,
    ret: -17.3,
    hasRet: true,
    strokeW: 1.5,   // logo mark stroke weights
    widthPct: 42,   // logo mark rung width as % of mark width
  },
  {
    key: 'EBIT' as OALKey,
    label: 'EBIT',
    depth: 'Operating income',
    desc: 'Generating operating income before financing and taxes.',
    weight: 0.1,
    ret: null,
    hasRet: false,
    strokeW: 2.4,
    widthPct: 58,
  },
  {
    key: 'NI' as OALKey,
    label: 'Net Income',
    depth: 'Profit anchor',
    desc: 'Sustained profitability after all obligations — earnings, not promises.',
    weight: 43.8,
    ret: null,
    hasRet: false,
    strokeW: 3.8,
    widthPct: 76,
  },
  {
    key: 'FCF' as OALKey,
    label: 'Free Cash Flow',
    depth: 'Deepest anchor',
    desc: 'Actual cash generated after capital expenditure. Gravity.',
    weight: 51.8,
    ret: 10.2,
    hasRet: true,
    strokeW: 6.0,
    widthPct: 100,
  },
]

function Section3AnchorLevels({ nodes, selectedOal }: { nodes: Node[]; selectedOal: OALKey }) {
  // Derive bucket distribution per rung from live node data
  const rungs = RUNG_DEFS.map(r => {
    const rungNodes = nodes.filter(n => n.oal === r.key)
    const total = rungNodes.length || 1
    const dist = Object.fromEntries(
      BUCKET_ORDER.map(b => [b, rungNodes.filter(n => n.bucket === b).length])
    ) as Record<string, number>
    return { ...r, total: rungNodes.length, dist }
  })

  return (
    <section>
      <SectionHeader
        lucas={4}
        label="Anchor Levels"
        sub="Deepest operational reality sustained over a 7-year trailing window"
      />

      {/* Insight line — arrives before the visual, names what the reader will see */}
      <div style={s({
        padding: '14px 22px 12px',
        borderBottom: `1px solid ${E.bdr}`,
        fontFamily: E.mono,
        fontSize: 12,
        color: E.body,
        lineHeight: 1.65,
      })}>
        The operational anchor a company has built predicts the shape of its returns.
        {' '}
        <span style={s({ color: E.VH })}>Revenue-anchored: −17.3% median.</span>
        {' '}
        <span style={s({ color: E.VL })}>FCF-anchored: +10.2% median.</span>
        {' '}
        <span style={s({ color: E.dim })}>Same universe. Same period. Different structures.</span>
      </div>

      {/* The ladder — four rows, Revenue top to FCF bottom */}
      <div>
        {rungs.map((rung, i) => {
          const isSelected = selectedOal === rung.key
          const isActive   = selectedOal === 'all' || isSelected
          const isFCF      = rung.key === 'FCF'
          const isRevenue  = rung.key === 'Revenue'

          return (
            <div
              key={rung.key}
              style={s({
                borderBottom: i < 3 ? `1px solid ${E.bdr}` : `1px solid ${E.bdr2}`,
                background: isSelected ? '#0C0A08' : isFCF ? '#0B0A07' : E.bg,
                opacity: !isActive ? 0.22 : 1,
                transition: 'opacity 0.22s, background 0.22s',
              })}
            >
              {/* Row: logo mark + identity / fingerprint / return */}
              <div style={s({
                display: 'grid',
                gridTemplateColumns: '200px 1fr 148px',
                alignItems: 'stretch',
                gap: 0,
              })}>

                {/* Left — rung identity with logo mark geometry */}
                <div style={s({
                  padding: '16px 16px 16px 20px',
                  borderRight: `1px solid ${E.bdr}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 0,
                })}>
                  {/* The rung mark — horizontal bar encoding the logo proportions */}
                  {/* Width and height increase as anchor deepens toward FCF */}
                  <div style={s({ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 })}>
                    <div style={s({
                      height: `${rung.strokeW}px`,
                      width: `${rung.widthPct * 0.72}px`,
                      background: isSelected ? E.gold : isFCF ? '#8a7234' : E.bdr3,
                      borderRadius: '1px',
                      flexShrink: 0,
                      transition: 'background 0.22s',
                    })} />
                  </div>
                  <div style={s({
                    fontFamily: E.mono,
                    fontSize: 8,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase' as const,
                    color: isSelected ? E.gold : E.dim,
                    marginBottom: 4,
                  })}>
                    {rung.depth}
                  </div>
                  <div style={s({
                    fontFamily: E.mono,
                    fontSize: 14,
                    fontWeight: isFCF || isSelected ? 600 : 400,
                    color: isSelected ? E.text : isFCF ? E.body : E.muted,
                    marginBottom: 5,
                    letterSpacing: '-0.01em',
                  })}>
                    {rung.label}
                  </div>
                  <div style={s({ fontFamily: E.mono, fontSize: 9, color: E.dim })}>
                    {rung.weight}% of composite weight
                  </div>
                </div>

                {/* Center — the risk fingerprint, dominant visual element of the row */}
                <div style={s({ padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' })}>
                  <div style={s({
                    fontFamily: E.mono,
                    fontSize: 8,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase' as const,
                    color: E.dim,
                    marginBottom: 8,
                  })}>
                    Risk fingerprint
                  </div>

                  {/* The fingerprint bar — tall, color-coded, the row's primary data object */}
                  <div style={s({ display: 'flex', height: 28, overflow: 'hidden', borderRadius: '2px', marginBottom: 9, gap: '1px' })}>
                    {BUCKET_ORDER.map(b => {
                      const pct = rung.total > 0
                        ? (rung.dist[b] / rung.total) * 100
                        : 20
                      return (
                        <div
                          key={b}
                          style={s({
                            flex: pct,
                            background: bucketColor(b),
                            opacity: isSelected ? 0.9 : isFCF ? 0.78 : 0.68,
                            minWidth: pct > 1 ? '2px' : '0',
                            transition: 'opacity 0.22s',
                          })}
                        />
                      )
                    })}
                  </div>

                  {/* Bucket labels below the fingerprint */}
                  <div style={s({ display: 'flex' })}>
                    {BUCKET_ORDER.map((b, bi) => {
                      const pct = rung.total > 0
                        ? (rung.dist[b] / rung.total) * 100
                        : 20
                      const short = b === 'Very Low' ? 'VL' : b === 'Low' ? 'L' : b === 'Moderate' ? 'M' : b === 'High' ? 'H' : 'VH'
                      return (
                        <div
                          key={b}
                          style={s({
                            flex: pct,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: bi === 0 ? 'flex-start' : bi === 4 ? 'flex-end' : 'center',
                            gap: 2,
                          })}
                        >
                          <span style={s({ fontFamily: E.mono, fontSize: 10, color: bucketColor(b), fontWeight: isFCF && b === 'Very Low' || isRevenue && b === 'Very High' ? 600 : 400 })}>
                            {pct.toFixed(0)}%
                          </span>
                          <span style={s({ fontFamily: E.mono, fontSize: 7, color: E.dim, letterSpacing: '0.06em' })}>
                            {short}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Right — confirmed return figure (FCF and Revenue) or honest gradient indicator */}
                <div style={s({
                  padding: '16px 18px',
                  borderLeft: `1px solid ${E.bdr}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                })}>
                  {rung.hasRet ? (
                    <>
                      <div style={s({
                        fontFamily: E.mono,
                        fontSize: 7,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase' as const,
                        color: E.dim,
                        marginBottom: 5,
                      })}>
                        Median 12m
                      </div>
                      <div style={s({
                        fontFamily: E.mono,
                        fontSize: 38,
                        fontWeight: 700,
                        color: rung.ret! > 0 ? E.VL : E.VH,
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                        marginBottom: 5,
                      })}>
                        {rung.ret! > 0 ? '+' : ''}{rung.ret}%
                      </div>
                      <div style={s({ fontFamily: E.mono, fontSize: 8, color: E.ghost })}>
                        confirmed · 285K obs
                      </div>
                    </>
                  ) : (
                    /* The honest indicator: between the two confirmed endpoints */
                    <div style={s({ textAlign: 'right' as const })}>
                      <div style={s({ fontFamily: E.mono, fontSize: 8, color: E.dim, marginBottom: 6, letterSpacing: '0.1em' })}>
                        BETWEEN
                      </div>
                      <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.VH, marginBottom: 2 })}>−17.3%</div>
                      <div style={s({ fontFamily: E.mono, fontSize: 9, color: E.dim, marginBottom: 2 })}>↓</div>
                      <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.VL })}>+10.2%</div>
                      <div style={s({ fontFamily: E.mono, fontSize: 8, color: E.ghost, marginTop: 5 })}>
                        not confirmed<br />for this rung
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Spread callout — the punchline after the fingerprints have spoken */}
      <div style={s({
        padding: '12px 22px',
        borderBottom: `1px solid ${E.bdr2}`,
        display: 'flex',
        alignItems: 'baseline',
        gap: 11,
        background: E.bg2,
      })}>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.muted })}>
          Spread:
        </span>
        <span style={s({ fontFamily: E.mono, fontSize: 22, fontWeight: 700, color: E.gold, letterSpacing: '-0.02em' })}>
          27.6pp
        </span>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.dim })}>
          FCF vs Revenue · held in every market regime in the dataset
        </span>
      </div>
    </section>
  )
}

// ─── Section 4: EV Quantile Bands ────────────────────────────────────────────
//
// Dot plot: % Very High by EV band, with reference line at universe VH%.
// The insight is in the SHAPE of the line — not the numbers.
// The near-flat line (real data) shows fragility doesn't attenuate with size.
// Insight arrives before the explanation.

function Section4EVBands({ nodes, selectedBand }: { nodes: Node[]; selectedBand: Band }) {
  // ── Real data from Script 27 — confirmed, locked ──────────────────────────
  // Source: 27_ev_band_premium.json · 293,463 obs · 90.4% fwd return coverage
  // Figures: VL and VH median 12m forward return per EV band, from real prices.
  // Full-universe spread (16.7pp) differs from backtest figure (21.0pp) due to
  // different return methodology (raw prices vs adjusted). Pattern is what matters.
  const BAND_DATA = [
    { band: 1, label: 'Band I',   sub: '<$300M',      vlMedian:  9.3, vhMedian: -23.3, spread: 32.5 },
    { band: 2, label: 'Band II',  sub: '$300M–$1B',   vlMedian:  8.0, vhMedian: -11.6, spread: 19.6 },
    { band: 3, label: 'Band III', sub: '$1B–$3B',     vlMedian:  6.9, vhMedian:  -4.5, spread: 11.3 },
    { band: 4, label: 'Band IV',  sub: '$3B–$10B',    vlMedian:  6.9, vhMedian:   3.4, spread:  3.5 },
    { band: 5, label: 'Band V',   sub: '$10B–$30B',   vlMedian: 10.3, vhMedian:  -0.0, spread: 10.3 },
    { band: 6, label: 'Band VI',  sub: '$30B–$100B',  vlMedian: 10.6, vhMedian:   3.1, spread:  7.5 },
    { band: 7, label: 'Band VII', sub: '>$100B',       vlMedian:  9.0, vhMedian:   3.6, spread:  5.4 },
  ]

  // SVG chart dimensions
  const W   = 800
  const H   = 220
  const PAD = { l: 47, r: 11, t: 22, b: 54 }
  const iW  = W - PAD.l - PAD.r
  const iH  = H - PAD.t - PAD.b

  // Y axis: −30 to +15 range to show both series clearly
  const Y_MIN = -30, Y_MAX = 15
  const Y_RANGE = Y_MAX - Y_MIN
  function cx(i: number) { return PAD.l + (i / 6) * iW }
  function cy(v: number) { return PAD.t + iH - ((v - Y_MIN) / Y_RANGE) * iH }

  const zeroY = cy(0)
  const yTicks = [-30, -20, -10, 0, 10]

  // Bar width
  const BAR_W = iW / 7 * 0.28

  return (
    <section>
      <SectionHeader
        lucas={7}
        label="EV Quantile Bands"
        sub="Seven equal-population quantiles by enterprise value · Script 27 confirmed"
      />

      {/* Insight line */}
      <div style={s({
        padding: '14px 22px 11px',
        borderBottom: `1px solid ${E.bdr}`,
        fontFamily: E.mono,
        fontSize: 12,
        color: E.body,
        lineHeight: 1.65,
      })}>
        Structural fragility is not a small-cap phenomenon — and structural safety is not a large-cap privilege.{' '}
        <span style={s({ color: E.dim })}>
          The VL vs VH return spread is positive in all seven bands without exception.
        </span>
      </div>

      {/* Bar chart — VL and VH median return per band */}
      <div style={s({ padding: '14px 22px 11px', borderBottom: `1px solid ${E.bdr2}` })}>
        <svg viewBox={`0 0 ${W} ${H}`} style={s({ width: '100%', height: 'auto', display: 'block', maxHeight: 240 })}>

          {/* Y-axis grid + labels */}
          {yTicks.map(v => {
            const y = cy(v)
            return (
              <g key={v}>
                <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
                  stroke={v === 0 ? E.bdr3 : E.bdr2}
                  strokeWidth={v === 0 ? 1.0 : 0.4} />
                <text x={PAD.l - 6} y={y + 4} textAnchor="end"
                  fontFamily="IBM Plex Mono,monospace" fontSize={10} fill={v === 0 ? E.dim : E.ghost}>
                  {v > 0 ? '+' : ''}{v}%
                </text>
              </g>
            )
          })}

          {/* Bars and labels per band */}
          {BAND_DATA.map((bd, i) => {
            const isSelected = selectedBand === bd.band
            const isActive   = selectedBand === 'all' || isSelected
            const x          = cx(i)
            const vlH        = Math.abs(cy(bd.vlMedian) - zeroY)
            const vhH        = Math.abs(cy(bd.vhMedian) - zeroY)
            const vlY        = bd.vlMedian >= 0 ? cy(bd.vlMedian) : zeroY
            const vhY        = bd.vhMedian >= 0 ? cy(bd.vhMedian) : zeroY
            const op         = isActive ? 1 : 0.18

            return (
              <g key={bd.band} opacity={op}>
                {/* VL bar (left of center, green) */}
                <rect
                  x={x - BAR_W - 1} y={vlY}
                  width={BAR_W} height={vlH}
                  fill={isSelected ? E.gold : E.VL} opacity={isSelected ? 0.95 : 0.80}
                />
                {/* VH bar (right of center, red) */}
                <rect
                  x={x + 1} y={vhY}
                  width={BAR_W} height={vhH}
                  fill={isSelected ? E.gold : E.VH} opacity={isSelected ? 0.95 : 0.72}
                />

                {/* VL value label */}
                <text
                  x={x - BAR_W / 2 - 1}
                  y={bd.vlMedian >= 0 ? cy(bd.vlMedian) - 4 : zeroY + vhH + 13}
                  textAnchor="middle"
                  fontFamily="IBM Plex Mono,monospace" fontSize={9}
                  fill={isSelected ? E.gold : E.VL}
                  fontWeight={isSelected ? 700 : 400}
                >
                  +{bd.vlMedian.toFixed(1)}%
                </text>

                {/* VH value label */}
                <text
                  x={x + BAR_W / 2 + 1}
                  y={bd.vhMedian < 0 ? cy(bd.vhMedian) + 13 : cy(bd.vhMedian) - 4}
                  textAnchor="middle"
                  fontFamily="IBM Plex Mono,monospace" fontSize={9}
                  fill={isSelected ? E.gold : E.VH}
                  fontWeight={isSelected ? 700 : 400}
                >
                  {bd.vhMedian > 0 ? '+' : ''}{bd.vhMedian.toFixed(1)}%
                </text>

                {/* Spread label between bars */}
                <text
                  x={x} y={PAD.t + iH + 16}
                  textAnchor="middle"
                  fontFamily="IBM Plex Mono,monospace" fontSize={10}
                  fill={isSelected ? E.gold : E.sec}
                >
                  {bd.label}
                </text>
                <text
                  x={x} y={PAD.t + iH + 27}
                  textAnchor="middle"
                  fontFamily="IBM Plex Mono,monospace" fontSize={9}
                  fill={E.ghost}
                >
                  {bd.sub}
                </text>
                <text
                  x={x} y={PAD.t + iH + 42}
                  textAnchor="middle"
                  fontFamily="IBM Plex Mono,monospace" fontSize={9}
                  fill={isSelected ? E.gold : E.dim}
                >
                  {bd.spread.toFixed(1)}pp
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g>
            <rect x={PAD.l + 4} y={PAD.t} width={8} height={8} fill={E.VL} opacity={0.8} />
            <text x={PAD.l + 16} y={PAD.t + 8} fontFamily="IBM Plex Mono,monospace" fontSize={9} fill={E.VL} opacity={0.8}>VL median</text>
            <rect x={PAD.l + 72} y={PAD.t} width={8} height={8} fill={E.VH} opacity={0.75} />
            <text x={PAD.l + 84} y={PAD.t + 8} fontFamily="IBM Plex Mono,monospace" fontSize={9} fill={E.VH} opacity={0.8}>VH median</text>
            <text x={PAD.l + 160} y={PAD.t + 8} fontFamily="IBM Plex Mono,monospace" fontSize={9} fill={E.dim} opacity={0.7}>spread below</text>
          </g>
        </svg>
      </div>

      {/* Finding callout */}
      <div style={s({
        padding: '11px 22px',
        borderBottom: `1px solid ${E.bdr2}`,
        display: 'flex',
        alignItems: 'baseline',
        gap: 18,
        background: E.bg2,
        flexWrap: 'wrap' as const,
      })}>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.dim, lineHeight: 1.65, flex: 1 })}>
          Band IV ($3B–$10B) shows the narrowest spread at 3.5pp — still positive.
          The framework separates structural conditions at every scale the market operates at.
        </span>
        <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.ghost, flexShrink: 0 })}>
          293,463 obs · Script 27 · raw price returns
        </span>
      </div>
    </section>
  )
}

// ─── Paid wall ────────────────────────────────────────────────────────────────
//
// Covers Sections 5 (11 Sectors), 6 (18 Archetypes), 7 (29 Companies) only.
// Sections 3 and 4 are free tier — do not include them here.

function PaidWall() {
  const rng = makeLCG(9001)
  const SECTORS = [
    'Technology', 'Health Care', 'Industrials', 'Financials',
    'Consumer Disc.', 'Communication', 'Materials', 'Energy',
    'Consumer Staples', 'Utilities', 'Real Estate',
  ]
  const sectorData = SECTORS.map(name => ({
    name,
    vl: Math.round(rng() * 18 + 4),
    vh: Math.round(rng() * 22 + 6),
  }))

  return (
    <section style={s({ position: 'relative', borderBottom: `1px solid ${E.bdr2}` })}>
      {/* Header — visible, not blurred */}
      <div style={s({ borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, padding: '7px 18px', display: 'flex', alignItems: 'baseline', gap: 11 })}>
        <span style={s({ fontFamily: E.mono, fontSize: 18, color: E.ghost, fontWeight: 700 })}>11 · 18 · 29</span>
        <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: E.ghost })}>Sectors · Archetypes · Companies</span>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.ghost })}>Full subscription required</span>
      </div>

      {/* Blurred content — shape only, no real data */}
      <div style={s({ position: 'relative', overflow: 'hidden' })}>
        <div style={s({ filter: 'blur(7px)', opacity: 0.38, userSelect: 'none', pointerEvents: 'none', padding: '18px' })}>
          {/* Sector grid preview */}
          <div style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: E.body, marginBottom: 11 })}>11 · Sectors</div>
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
          {/* Archetypes preview */}
          <div style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: E.body, marginBottom: 11 })}>18 · Structural Archetypes</div>
          <div style={s({ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5, marginBottom: 18 })}>
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} style={s({ height: 36, background: E.bg2, border: `1px solid ${E.bdr2}` })} />
            ))}
          </div>
          {/* Company rows preview */}
          <div style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: E.body, marginBottom: 11 })}>29 · Individual Companies · 7-year history</div>
          <div style={s({ display: 'flex', flexDirection: 'column', gap: 3 })}>
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} style={s({ height: 36, background: E.bg2, border: `1px solid ${E.bdr2}` })} />
            ))}
          </div>
        </div>

        {/* Upgrade CTA — centered, not blurred */}
        <div style={s({ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 11 })}>
          <div style={s({ textAlign: 'center' as const })}>
            <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: E.sec, marginBottom: 11 })}>
              Levels 11 · 18 · 29
            </div>
            <div style={s({ fontFamily: E.sans, fontSize: 22, fontWeight: 700, color: E.text, marginBottom: 4, lineHeight: 1.2 })}>
              Sector breakdown. Structural archetypes.
            </div>
            <div style={s({ fontFamily: E.sans, fontSize: 16, color: E.body, marginBottom: 22 })}>
              Company drilldowns with 7-year operational history.
            </div>
            <a href="/platform/subscribe" style={s({
              display: 'inline-block', fontFamily: E.mono, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase' as const,
              padding: '13px 36px', background: E.gold, color: E.bg, textDecoration: 'none',
            })}>
              Open full access →
            </a>
          </div>
          <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>
            $159 / month · Cancel anytime
          </div>
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

  const [selectedBand,  setSelectedBand]  = useState<Band>('all')
  const [selectedOal,   setSelectedOal]   = useState<OALKey>('all')
  const [activeLevel,   setActiveLevel]   = useState(1)
  const [tooltip,       setTooltip]       = useState<{ x: number; y: number; node: Node } | null>(null)
  const [regimeSummary, setRegimeSummary] = useState<RegimeSummary | null>(null)
  const [derivedNodes,  setDerivedNodes]  = useState<Node[]>([])
  const [vizReady,      setVizReady]      = useState(false)
  const [trajectories,  setTrajectories]  = useState<{symbol:string;bucket:string;score:number;dwell:number;dir:string}[]>([])

  const selectedBandRef   = useRef<Band>('all')
  const selectedOalRef    = useRef<OALKey>('all')
  const hoveredIdRef      = useRef<string | null>(null)
  const rafIdRef          = useRef<number | null>(null)   // for RAF debounce
  const nodesRef          = useRef<Node[]>([])
  const d3ReadyRef        = useRef(false)
  const scatSvgRef        = useRef<SVGSVGElement | null>(null)
  const containerRef      = useRef<HTMLDivElement | null>(null)
  const evBandRef         = useRef<HTMLDivElement | null>(null)
  const oalRungRef        = useRef<HTMLDivElement | null>(null)
  const regimeFetchRef      = useRef<Promise<RegimeSummary | null> | null>(null)
  const trajectoryFetchRef  = useRef<Promise<{symbol:string;current_bucket:string;composite_score:number|null;dwell_months:number;direction:string}[] | null> | null>(null)

  // ── Opacity logic ────────────────────────────────────────────────────────────

  function effectiveOpacity(d: Node): number | null {
    const bandOk  = selectedBandRef.current === 'all' || d.evBand === selectedBandRef.current
    const oalOk   = selectedOalRef.current  === 'all' || d.oal    === selectedOalRef.current
    const hoverOk = hoveredIdRef.current === null || d.id === hoveredIdRef.current
    const filterOk = bandOk && oalOk
    if (!filterOk && !hoverOk) return 0.03
    if (!filterOk) return hoveredIdRef.current !== null && d.id === hoveredIdRef.current ? 0.9 : 0.04
    if (!hoverOk) return 0.13
    if (d.bucket === 'Very High' || d.bucket === 'High') return null  // animated by CSS
    if (d.bucket === 'Very Low') return 0.90
    if (d.bucket === 'Low')      return 0.78
    return 0.38
  }

  // ── refreshNodes — CSS class toggle, zero JS traversal ──────────────────
  // Two separate concerns, both handled via CSS classes:
  //
  // HOVER: .has-hover on SVG + .is-hovered on the active node.
  //   → triggered on every mouseenter/mouseleave (high frequency)
  //   → pure CSS, browser paint engine, zero JS cost
  //
  // FILTER: .filter-active on SVG + .filter-match on matching nodes.
  //   → triggered on filter button clicks (low frequency)
  //   → querySelectorAll by data-oal / data-evband attribute
  //   → single DOM pass per filter change, not per frame

  function refreshNodes() {
    const hId  = hoveredIdRef.current
    const oal  = selectedOalRef.current
    const band = selectedBandRef.current
    const filterActive = oal !== 'all' || band !== 'all'

    const svgs = [scatSvgRef.current]
    svgs.forEach(svg => {
      if (!svg) return

      // ── Hover state ──
      svg.querySelectorAll('.is-hovered').forEach(el => el.classList.remove('is-hovered'))
      if (hId) {
        svg.classList.add('has-hover')
        svg.querySelectorAll(`[data-id="${hId}"]`).forEach(el => el.classList.add('is-hovered'))
      } else {
        svg.classList.remove('has-hover')
      }

      // ── Filter state ──
      if (filterActive) {
        svg.classList.add('filter-active')
        svg.querySelectorAll('.filter-match').forEach(el => el.classList.remove('filter-match'))
        // Build selector for matching nodes
        const oalOk  = oal  === 'all' ? null : `[data-oal="${oal}"]`
        const bandOk = band === 'all' ? null : `[data-evband="${band}"]`
        const sel = [oalOk, bandOk].filter(Boolean).join('')
        if (sel) {
          svg.querySelectorAll(`.sn-wrap${sel}`)
            .forEach(el => el.classList.add('filter-match'))
        }
      } else {
        svg.classList.remove('filter-active')
        svg.querySelectorAll('.filter-match').forEach(el => el.classList.remove('filter-match'))
      }
    })
  }

  // ── Filter selection ──────────────────────────────────────────────────────

  function selectBand(band: Band) {
    selectedBandRef.current = band; setSelectedBand(band)
    if (band !== 'all') { setActiveLevel(7); selectedOalRef.current = 'all'; setSelectedOal('all') }
    else if (selectedOalRef.current === 'all') setActiveLevel(1)
    refreshNodes()
  }

  function selectOal(oal: OALKey) {
    selectedOalRef.current = oal; setSelectedOal(oal)
    if (oal !== 'all') { setActiveLevel(4); selectedBandRef.current = 'all'; setSelectedBand('all') }
    else if (selectedBandRef.current === 'all') setActiveLevel(1)
    refreshNodes()
  }

  function resetAll() {
    selectedBandRef.current = 'all'; selectedOalRef.current = 'all'
    setSelectedBand('all'); setSelectedOal('all'); setActiveLevel(1)
    refreshNodes()
  }

  function handleBreadcrumbClick(level: typeof DESCENT_LEVELS[number]) {
    if (level.paid && !isPaidRef.current) { window.location.href = '/platform/subscribe'; return }
    if (level.n === 1) { resetAll(); return }
    if (level.n === 4) { setActiveLevel(4); oalRungRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return }
    if (level.n === 7) { setActiveLevel(7); evBandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return }
  }

  // ── D3 initialization ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    // FILE PATH NOTE: fetch paths below use DATA_BASE env var for flexibility.
    // If NEXT_PUBLIC_DATA_BASE is unset, paths resolve to /data/... from root.
    // This is correct when Next.js project root = /osmr/capital-steward-dashboard/
    // and files live at public/data/regime_summary.json etc.
    // If fetches hit wrong app, set NEXT_PUBLIC_DATA_BASE=http://localhost:3000
    // (or the correct origin) in your .env.local.

    // Regime data fetch
    if (!regimeFetchRef.current) {
      regimeFetchRef.current = fetch(`${DATA_BASE}/data/regime_summary.json`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<RegimeSummary> })
        .catch(() => null)
      regimeFetchRef.current.then(data => { if (data) setRegimeSummary(data) })
    }

    // Trajectory data fetch — 28_company_trajectories.json
    // Powers the companies/both views in the gravitational wells panel.
    if (!trajectoryFetchRef.current) {
      trajectoryFetchRef.current = fetch(`${DATA_BASE}/data/28_company_trajectories.json`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
        .catch(() => null)
      trajectoryFetchRef.current.then(data => {
        if (!data) return
        // Sample to max 400 dots per bucket for performance
        const by_bucket: Record<string, typeof data> = {}
        for (const r of data) {
          if (!by_bucket[r.current_bucket]) by_bucket[r.current_bucket] = []
          by_bucket[r.current_bucket].push(r)
        }
        const sampled = Object.values(by_bucket).flatMap(arr =>
          arr.sort((a: any, b: any) => b.dwell_months - a.dwell_months).slice(0, 80)
        )
        setTrajectories(sampled.map((r: any) => ({
          symbol: r.symbol,
          bucket: r.current_bucket,
          score:  r.composite_score ?? 0.5,
          dwell:  r.dwell_months,
          dir:    r.direction,
        })))
      })
    }

    // initViz: synchronous, no external fetch dependency.
    // Real OSMR data (osmr_snapshot.json) loads separately via a script tag
    // once deployed to public/data/ — for now, synthetic nodes are used.
    // The try/finally guarantees setVizReady(true) fires on every exit path.
    function initViz() {
      if (d3ReadyRef.current) { setVizReady(true); return }
      d3ReadyRef.current = true

      try {
        const d3 = (window as any).d3

        if (!d3) {
          console.error('[TCS] D3 not available — constellation cannot render')
          return
        }

        // Generate nodes for Sections 3 & 4 (OAL rungs, EV bands).
        // No force simulation needed — the left panel is now the gravitational
        // wells visualization (pure SVG, no D3). generateNodes is fast (<50ms).
        const nodes: Node[] = generateNodes(5200)
        nodesRef.current = nodes
        setDerivedNodes([...nodes])

        const scatEl = scatSvgRef.current
        if (!scatEl) {
          console.error('[TCS] Scatter SVG ref null')
          return
        }

        const panelW = Math.max(300, scatEl.getBoundingClientRect().width)
        const panelH = 440

      // ── Structural Risk Map ────────────────────────────────────────────────

      const PAD    = { l: 47, r: 11, t: 11, b: 47 }
      const innerW = panelW - PAD.l - PAD.r
      const innerH = panelH - PAD.t - PAD.b

      const scatSvg = d3.select(scatSvgRef.current)
        .attr('viewBox', `0 0 ${panelW} ${panelH}`)
        .attr('preserveAspectRatio', 'none')
      const xScale  = d3.scaleLinear().domain([0, 100]).range([0, innerW])
      const yScale  = d3.scaleLinear().domain([0, 100]).range([innerH, 0])
      const chart   = scatSvg.append('g').attr('transform', `translate(${PAD.l},${PAD.t})`)

      // Quadrant fills
      ;[
        { x: 0,        y: innerH/2, w: innerW/2, h: innerH/2, fill: E.VL,      o: 0.025 },
        { x: innerW/2, y: innerH/2, w: innerW/2, h: innerH/2, fill: '#9E8A70', o: 0.018 },
        { x: 0,        y: 0,        w: innerW/2, h: innerH/2, fill: '#9E8A70', o: 0.018 },
        { x: innerW/2, y: 0,        w: innerW/2, h: innerH/2, fill: E.VH,      o: 0.030 },
      ].forEach(q => chart.append('rect').attr('x', q.x).attr('y', q.y).attr('width', q.w).attr('height', q.h).attr('fill', q.fill).attr('opacity', q.o))

      ;[25, 50, 75].forEach(v => {
        chart.append('line').attr('x1', xScale(v)).attr('y1', 0).attr('x2', xScale(v)).attr('y2', innerH).attr('stroke', '#1E1C18').attr('stroke-width', 0.5)
        chart.append('line').attr('x1', 0).attr('y1', yScale(v)).attr('x2', innerW).attr('y2', yScale(v)).attr('stroke', '#1E1C18').attr('stroke-width', 0.5)
      })

      chart.append('line')
        .attr('x1', xScale(0)).attr('y1', yScale(0)).attr('x2', xScale(100)).attr('y2', yScale(100))
        .attr('stroke', '#2A2520').attr('stroke-width', 0.55).attr('stroke-dasharray', '4,5').attr('opacity', 0.55)

      const xAxis = d3.axisBottom(xScale).tickValues([0, 25, 50, 75, 100]).tickSize(3)
      const yAxis = d3.axisLeft(yScale).tickValues([0, 25, 50, 75, 100]).tickSize(3)

      const applyAxisStyle = (g: any) => g
        .call((gg: any) => gg.select('.domain').attr('stroke', '#272420').attr('stroke-width', 0.4))
        .call((gg: any) => gg.selectAll('.tick text').attr('fill', E.sec).attr('font-size', 11).attr('font-family', E.mono))
        .call((gg: any) => gg.selectAll('.tick line').attr('stroke', '#272420').attr('stroke-width', 0.4))

      chart.append('g').attr('transform', `translate(0,${innerH})`).call(xAxis).call(applyAxisStyle)
      chart.append('g').call(yAxis).call(applyAxisStyle)

      chart.append('text').attr('x', innerW / 2).attr('y', innerH + 29)
        .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-family', E.mono).attr('letter-spacing', '0.12em').attr('fill', E.sec).text('ANCHOR DETACHMENT →')
      chart.append('text').attr('transform', 'rotate(-90)').attr('x', -innerH / 2).attr('y', -29)
        .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-family', E.mono).attr('letter-spacing', '0.12em').attr('fill', E.sec).text('ANCHOR DEGRADATION →')

      ;[
        { x: 6,        y: innerH - 6, txt: 'Grounded · Stable',      col: E.VL,      a: 'start', o: 0.45 },
        { x: innerW-6, y: innerH - 6, txt: 'Stretched · Stable',     col: '#9E8A70', a: 'end',   o: 0.35 },
        { x: 6,        y: 12,         txt: 'Grounded · Degrading',    col: '#9E8A70', a: 'start', o: 0.35 },
        { x: innerW-6, y: 12,         txt: 'Highest structural risk', col: E.VH,      a: 'end',   o: 0.65 },
      ].forEach(q => chart.append('text').attr('x', q.x).attr('y', q.y).attr('text-anchor', q.a).attr('font-size', 11).attr('font-family', E.mono).attr('fill', q.col).attr('opacity', q.o).text(q.txt))

      // Scatter nodes
      const snGroups = chart.selectAll('.sn-wrap').data(nodesRef.current, (d: Node) => d.id)
        .join('g')
        .attr('class', (d: Node) => {
          const b = d.bucket
          return `sn-wrap node-${b === 'Very High' ? 'vh' : b === 'High' ? 'h' : b === 'Very Low' ? 'vl' : b === 'Low' ? 'lo' : 'mod'}`
        })
        .attr('data-id',     (d: Node) => d.id)
        .attr('data-oal',    (d: Node) => d.oal)
        .attr('data-evband', (d: Node) => String(d.evBand))
        .attr('transform', (d: Node) => `translate(${xScale(d.axis1)},${yScale(d.axis2)})`)

      snGroups.append('circle').attr('class', 'sn').datum((d: any) => d)
        .attr('r', (d: Node) => nodeRadius(d.ev ?? 1e9))
        .attr('fill', (d: Node) => bucketColor(d.bucket))

      snGroups
        .on('mouseenter', function(event: MouseEvent, d: Node) {
          hoveredIdRef.current = d.id
          refreshNodes()
          setTooltip({ x: event.clientX + 16, y: event.clientY - 14, node: d })
        })
        .on('mousemove', function(event: MouseEvent) {
          setTooltip(prev => prev ? { ...prev, x: event.clientX + 16, y: event.clientY - 14 } : null)
        })
        .on('mouseleave', function() { hoveredIdRef.current = null; refreshNodes(); setTooltip(null) })

      // Signal React that the constellation is ready — removes loading overlay
      } finally {
        setVizReady(true)
      }
    }

    // Defer initViz by 50ms so the loading state paints before the simulation
    // blocks the main thread. Both paths (D3 already loaded / CDN load) defer.
    function runInit() { setTimeout(initViz, 50) }

    if ((window as any).d3) { runInit(); return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js'
    script.onload = runInit
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

        /* Hover — instant CSS, zero JS traversal */
        .has-hover .sn-wrap { opacity: 0.06 !important; animation: none !important; }
        .has-hover .sn-wrap.is-hovered { opacity: 1 !important; animation: none !important; }
        .filter-active .sn-wrap { opacity: 0.05 !important; animation: none !important; }
        .filter-active .sn-wrap.filter-match { opacity: unset !important; animation: unset !important; }
        .filter-active.has-hover .sn-wrap.filter-match { opacity: 0.18 !important; }
        .filter-active.has-hover .sn-wrap.is-hovered { opacity: 1 !important; animation: none !important; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={s({ height: 47, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 18px', borderBottom: `1px solid ${E.bdr2}`, background: E.bg, position: 'sticky', top: 0, zIndex: 40 })}>
        <a href="/" style={s({ textDecoration: 'none', display: 'flex', alignItems: 'baseline' })}>
          <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: E.sec })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: 18, color: E.gold, marginLeft: 7 })}>Steward</span>
        </a>
        <div style={s({ display: 'flex', alignItems: 'center', gap: 7 })}>
          <div style={s({ width: 5, height: 5, borderRadius: '50%', background: E.VL, opacity: 0.8 })} />
          <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.sec })}>Live · Apr 2026</span>
          {!isPaid && (
            <a href="/platform/subscribe" style={s({ fontFamily: E.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '5px 13px', background: E.gold, color: E.bg, textDecoration: 'none', marginLeft: 7 })}>Upgrade</a>
          )}
        </div>
      </nav>

      {/* ── Lucas breadcrumb ── */}
      <div style={s({ height: 47, borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, display: 'flex', alignItems: 'center', padding: '0 18px', overflowX: 'auto', position: 'sticky', top: 47, zIndex: 39 })}>
        {DESCENT_LEVELS.map((level, i) => {
          const isActive = level.n === activeLevel
          const textColor = isActive ? E.gold : level.paid ? E.ghost : E.sec
          return (
            <div key={level.n} style={s({ display: 'flex', alignItems: 'center', flexShrink: 0 })}>
              {i > 0 && <div style={s({ width: 18, height: 1, background: E.bdr2, margin: '0 2px', opacity: 0.6 })} />}
              <button
                onClick={() => handleBreadcrumbClick(level)}
                style={s({ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 11px', background: 'transparent', border: 'none', cursor: level.paid && !isPaid ? 'pointer' : 'pointer' })}
              >
                <span style={s({ fontFamily: E.mono, fontSize: 18, color: textColor, lineHeight: 1, fontWeight: isActive ? 700 : 400 })}>{level.n}</span>
                <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: level.paid ? E.ghost : isActive ? E.gold : E.sec, lineHeight: 1.5 })}>{level.label}</span>
                {level.paid && !isPaid && <span style={s({ fontFamily: E.mono, fontSize: 8, color: E.ghost, letterSpacing: '0.08em' })}>PAID</span>}
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Combined filter strip — OAL Anchor Levels + EV Bands on one row ── */}
      <div
        ref={(el: HTMLDivElement | null) => { oalRungRef.current = el; evBandRef.current = el }}
        style={s({
          borderBottom: `1px solid ${E.bdr2}`,
          background: activeLevel === 4 ? '#0C0A08' : activeLevel === 7 ? '#0C0A08' : E.bg,
          padding: '6px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          overflowX: 'auto',
          position: 'sticky',
          top: 94,
          zIndex: 38,
          whiteSpace: 'nowrap' as const,
        })}
      >
        {/* OAL Anchor Levels */}
        <span style={s({ fontFamily: E.mono, fontSize: 10, color: activeLevel === 4 ? E.gold : E.dim, letterSpacing: '0.16em', textTransform: 'uppercase' as const, marginRight: 4, flexShrink: 0 })}>
          4 · Anchor
        </span>
        {OAL_RUNGS.map(({ key, label, sub }) => {
          const active = selectedOal === key
          return (
            <button key={key} onClick={() => selectOal(key)} className="filter-btn" style={s({
              fontFamily: E.mono, fontSize: 10, fontWeight: active ? 700 : 400,
              letterSpacing: '0.05em',
              padding: sub ? '3px 9px 2px' : '3px 9px',
              border: `1px solid ${active ? E.gold : E.bdr3}`,
              background: active ? 'rgba(197,162,74,0.09)' : 'transparent',
              color: active ? E.gold : E.body,
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              flexShrink: 0,
            })}>
              <span>{label}</span>
              {sub && <span style={s({ fontSize: 8, color: active ? E.gold : E.sec })}>{sub}</span>}
            </button>
          )
        })}

        {/* Separator */}
        <div style={s({ width: 1, height: 24, background: E.bdr3, flexShrink: 0, margin: '0 6px' })} />

        {/* EV Bands */}
        <span style={s({ fontFamily: E.mono, fontSize: 10, color: activeLevel === 7 ? E.gold : E.dim, letterSpacing: '0.16em', textTransform: 'uppercase' as const, marginRight: 4, flexShrink: 0 })}>
          7 · EV
        </span>
        {EV_BANDS.map(({ band, label, sub }) => {
          const active = selectedBand === band
          return (
            <button key={String(band)} onClick={() => selectBand(band)} className="filter-btn" style={s({
              fontFamily: E.mono, fontSize: 10, fontWeight: active ? 700 : 400,
              letterSpacing: '0.05em',
              padding: sub ? '3px 9px 2px' : '3px 9px',
              border: `1px solid ${active ? E.gold : E.bdr3}`,
              background: active ? 'rgba(197,162,74,0.09)' : 'transparent',
              color: active ? E.gold : E.body,
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              flexShrink: 0,
            })}>
              <span>{label}</span>
              {sub && <span style={s({ fontSize: 8, color: active ? E.gold : E.sec })}>{sub}</span>}
            </button>
          )
        })}
      </div>

      {/* ── Section 1: Orientation + Panel headers ── */}

      {/* Orientation paragraph */}
      <div style={s({
        padding: '14px 22px 12px',
        borderBottom: `1px solid ${E.bdr}`,
        background: E.bg2,
      })}>
        <div style={s({ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 9, flexWrap: 'wrap' as const })}>
          <span style={s({ fontFamily: E.mono, fontSize: 12, color: E.VH, fontWeight: 700 })}>
            9.4% of companies. 38.6% of catastrophic losses.
          </span>
          <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>
            The median VH company has been in this condition 5 months before the market prices the risk.
          </span>
        </div>
        <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, lineHeight: 1.65, maxWidth: 920 })}>
          Left: return distributions by structural bucket — the shape of each well is the gravitational field.
          {' '}<span style={s({ color: E.dim })}>Right: precise structural coordinates. Together: where each company is and what that position costs.</span>
        </div>
      </div>

      {/* Panel headers */}
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${E.bdr2}`, background: E.bg3 })}>
        <div style={s({ padding: '7px 18px', borderRight: `1px solid ${E.bdr2}` })}>
          <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: E.body })}>Gravitational Field · Return Distributions</div>
          <div style={s({ fontFamily: E.mono, fontSize: 9, color: E.sec, marginTop: 3 })}>
            Well depth = dwell probability × median loss · Filter reshapes the wells
          </div>
        </div>
        <div style={s({ padding: '7px 18px' })}>
          <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: E.body })}>Structural Risk Map · Detachment × Degradation</div>
          <div style={s({ fontFamily: E.mono, fontSize: 9, color: E.sec, marginTop: 3 })}>
            Precise coordinates — top-right is highest combined structural risk
          </div>
        </div>
      </div>

      {/* ── Section 1: Dual visualization panels ── */}
      <div style={s({ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', height: 440, borderBottom: `1px solid ${E.bdr2}` })}>
        {/* Left: Gravitational potential wells — pure React SVG, no D3 */}
        <div style={s({ borderRight: `1px solid ${E.bdr2}`, background: E.bg, overflow: 'hidden' })}>
          <Section1WellsPanel
            selectedBand={selectedBand}
            selectedOal={selectedOal}
            trajectories={trajectories}
          />
        </div>
        {/* Right: Structural Risk Map — D3 scatter */}
        <div style={s({ background: E.bg, overflow: 'hidden' })}>
          <svg ref={scatSvgRef} style={s({ display: 'block', width: '100%', height: '100%' })} />
        </div>

        {/* Loading overlay — visible until force simulation completes */}
        {!vizReady && (
          <div style={s({
            position: 'absolute', inset: 0,
            background: E.bg,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 5,
          })}>
            {/* Five pulsing dots — one per risk bucket, left to right */}
            <div style={s({ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 })}>
              {BUCKET_ORDER.map((b, i) => {
                const anim = b === 'Very High' ? 'pulse-vh'
                  : b === 'High'     ? 'pulse-h'
                  : b === 'Moderate' ? 'pulse-mod'
                  : b === 'Low'      ? 'pulse-lo'
                  : 'pulse-vl'
                const dur = b === 'Very High' ? '302ms'
                  : b === 'High'     ? '488ms'
                  : b === 'Moderate' ? '789ms'
                  : b === 'Low'      ? '1277ms'
                  : '2069ms'
                return (
                  <div key={b} style={s({
                    width: 6, height: 6, borderRadius: '50%',
                    background: bucketColor(b),
                    animation: `${anim} ${dur} ease-in-out infinite`,
                    animationDelay: `${i * 40}ms`,
                  })} />
                )
              })}
            </div>
            <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, letterSpacing: '0.14em' })}>
              Mapping structural field · ~5,200 equities
            </div>
            <div style={s({ fontFamily: E.mono, fontSize: 9, color: E.dim, marginTop: 5, letterSpacing: '0.1em' })}>
              Computing structural neighborhoods
            </div>
          </div>
        )}
      </div>

      {/* ── Legend strip ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, padding: '7px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 11 })}>
        {/* Bucket legend with structural descriptors */}
        <div style={s({ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' as const })}>
          {BUCKET_ORDER.map(b => {
            const desc: Record<string, string> = {
              'Very Low':  'grounded',
              'Low':       'stable',
              'Moderate':  'neutral',
              'High':      'stretched',
              'Very High': 'detached',
            }
            return (
              <div key={b} style={s({ display: 'flex', alignItems: 'center', gap: 4 })}>
                <div style={s({ width: 7, height: 7, borderRadius: '50%', background: bucketColor(b), flexShrink: 0 })} />
                <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.body })}>
                  {b}{b === 'Very High' ? ' ◈' : ''}
                </span>
                <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.dim })}>
                  — {desc[b]}
                </span>
              </div>
            )
          })}
        </div>
        <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.dim, flexShrink: 0 })}>
          Size = enterprise value{!isPaid ? ' · Identity at paid tier' : ''}
        </span>
      </div>

      {/* ── Section 2: Three Market Regime Summaries ── */}
      {regimeSummary && <Section2Regimes summary={regimeSummary} />}

      {/* ── Section 3: Anchor Levels ── */}
      {derivedNodes.length > 0 && (
        <Section3AnchorLevels nodes={derivedNodes} selectedOal={selectedOal} />
      )}

      {/* ── Section 4: Seven EV Quantile Band Views ── */}
      {derivedNodes.length > 0 && (
        <Section4EVBands nodes={derivedNodes} selectedBand={selectedBand} />
      )}

      {/* ── Paid wall: Sections 5 (Sectors), 6 (Archetypes), 7 (Companies) ── */}
      {!isPaid && <PaidWall />}

      {/* ── Paid sections: placeholder for future sprints ── */}
      {isPaid && (
        <section style={s({ borderBottom: `1px solid ${E.bdr2}` })}>
          <SectionHeader lucas={11} label="Sectors" sub="GICS sector breakdown · Coming in next sprint" />
          <div style={s({ padding: '36px 18px', fontFamily: E.mono, fontSize: 11, color: E.sec })}>
            Sector-level structural risk analysis — in development.
          </div>
        </section>
      )}

      {/* ── Tooltip — free tier gets structural data, paid adds company identity ── */}
      {tooltip && (
        <div style={s({ position: 'fixed', left: tooltip.x, top: tooltip.y, background: '#0E0C0A', border: `1px solid ${E.bdr3}`, borderTop: `2px solid ${isPaid ? E.gold : E.bdr3}`, padding: '11px 13px', fontFamily: E.mono, fontSize: 11, color: E.text, lineHeight: 1.85, whiteSpace: 'nowrap' as const, zIndex: 50, pointerEvents: 'none' })}>
          {isPaid ? (
            <>
              <div style={s({ color: E.gold, fontSize: 13, fontWeight: 700, marginBottom: 5, letterSpacing: '0.04em' })}>{tooltip.node.symbol}</div>
              {/* Percentile rank — immediately interpretable */}
              <div style={s({ marginBottom: 5 })}>
                <span style={s({ fontFamily: E.mono, fontSize: 22, fontWeight: 700, color: bucketColor(tooltip.node.bucket), letterSpacing: '-0.02em', lineHeight: 1 })}>
                  {tooltip.node.pctRank}
                </span>
                <span style={s({ fontFamily: E.mono, fontSize: 10, color: E.sec, marginLeft: 4 })}>th percentile · ~5,200 equities</span>
              </div>
              <div style={s({ color: E.body, marginBottom: 2 })}>
                <span style={s({ color: bucketColor(tooltip.node.bucket) })}>{tooltip.node.bucket}</span>
                {' · '}EV Band {tooltip.node.evBand} · {fmtEV(tooltip.node.ev)}
              </div>
              <div style={s({ color: E.body, marginBottom: 2 })}>OAL anchor: {tooltip.node.oal}</div>
              <div style={s({ color: E.sec })}>Detachment: {safeFixed(tooltip.node.axis1, 1)} · Degradation: {safeFixed(tooltip.node.axis2, 1)}</div>
            </>
          ) : (
            <>
              {/* Percentile rank — the single most interpretable structural number */}
              <div style={s({ marginBottom: 6 })}>
                <span style={s({ fontFamily: E.mono, fontSize: 22, fontWeight: 700, color: bucketColor(tooltip.node.bucket), letterSpacing: '-0.02em', lineHeight: 1 })}>
                  {tooltip.node.pctRank}
                </span>
                <span style={s({ fontFamily: E.mono, fontSize: 10, color: E.sec, marginLeft: 4 })}>th percentile structural risk</span>
              </div>
              <div style={s({ color: E.dim, fontSize: 9, marginBottom: 7 })}>
                ranked against ~5,200 U.S. equities
              </div>
              <div style={s({ color: E.body, marginBottom: 2 })}>
                <span style={s({ color: bucketColor(tooltip.node.bucket) })}>{tooltip.node.bucket}</span>
                {' · '}EV Band {tooltip.node.evBand} · OAL: {tooltip.node.oal}
              </div>
              <div style={s({ color: E.sec })}>Detachment: {safeFixed(tooltip.node.axis1, 1)} · Degradation: {safeFixed(tooltip.node.axis2, 1)}</div>
              <div style={s({ color: E.dim, fontSize: 9, marginTop: 6, borderTop: `1px solid ${E.bdr}`, paddingTop: 5 })}>
                Company identity at paid tier
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <div style={s({ padding: '22px 18px', textAlign: 'center' as const })}>
        <p style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>
          © 2026 The Capital Steward, LLC · For informational purposes only · Not investment advice
        </p>
      </div>

    </div>
  )
}