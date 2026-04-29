'use client'

// app/platform/page.tsx
//
// Migration: 2026-04-27 — Visual Doctrine v1.3 + Typography Doctrine v1.0 + April 26 Section 1.
// Free Tier Architecture Pass v1.0 — 2026-04-27:
//   1. Filter relocation: Anchor Levels → Section 3, EV Bands → Section 4. Top chrome
//      reduces to brand · live · breadcrumb · upgrade. Eliminates horizontal scroll artifact.
//   2. Pulse mechanics restored: animation shorthand split to longhand so inline animation-delay
//      from D3 layers cleanly. All animation declarations consolidated into one style block.
//   3. Section 3 rebuilt as horizontal strata — each anchor rung is a row, not a card.
//      Restrained endpoint emphasis: Revenue 2px notch in H hue, FCF 2px notch in VL hue.
//
// ARCHITECTURE PRINCIPLE: local control, global organismic response.
//   Filters are housed in their native semantic sections (Anchor Levels in Section 3,
//   EV Bands in Section 4) but the user's adjustment propagates globally — Section 1 field
//   dims by data-oal/data-evband, Return Field curves respond, all reactivity preserved.
//   The user is adjusting one explanatory lens; the whole organism responds.
//
// Pricing fix: $159 → $249 in AuthModal and PaidWall.
//
// Section 1: five hardcoded neighborhood centers, static layout, no force simulation,
// EV-driven 47% Lucas phase aperture, bucket-local descending. Field-pulsation timings:
// VL 7000ms, L 4000ms, M 3000ms, H 2000ms, VH 1000ms.
// Risk strip cards: BPM cardiac cadence 1277/971/789/488/302ms.
// Two pulsation systems intentionally distinct — verify they read as one organism.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useUser, SignIn, SignUp } from '@clerk/nextjs'
import Link from 'next/link'

// ─── Design tokens — v1.3 ocular dark substrate (LOCKED 2026-04-27) ──────────

const E = {
  // Tier 1 — chamber field. Page background, chrome instrumentation.
  bg0:   '#0E0D0C',
  // Tier 2 — membrane. Active instrumentation, panel head strips, Lucas headers.
  bg1:   '#151413',
  // Tier 3 — focused shelf. Risk cards, selected filter chips, current regime.
  bg2:   '#1E1B18',

  // Text tokens — AAA at small mono sizes
  text1: '#EAE6E1', // primary AAA
  text2: '#C8BFB6', // body AAA
  text3: '#B0A89F', // tertiary AAA — small readable labels

  // Utility marks only — NEVER required reading at M1 sizes per Typography Doctrine
  limbus: '#958C83',
  muted:  '#74665D',

  // Ceremonial accent — intentionally not for decorative UI trim
  doctrineGold: '#BFA66A',

  // v1.3 organic physiological risk hues (LOCKED — supersedes prior deployed values)
  VL: '#6F8A72', // oxygenated calm
  L:  '#8C9272', // steady equilibrium
  M:  '#A2876B', // circulatory warmth
  H:  '#9A5F49', // inflamed strain
  VH: '#7A2E2A', // hemorrhagic danger

  mono:  "'IBM Plex Mono','Courier New',monospace",
  sans:  "'DM Sans',system-ui,sans-serif",
  serif: "'Playfair Display',Georgia,serif",
}

// Typography Doctrine v1.0 — locked ladders
const T = {
  // Sans reading ladder (DM Sans, reference family)
  s1: 13, s2: 16, s3: 20, s4: 25, s5: 31,
  // Mono reading ladder (IBM Plex Mono, optically corrected −1 from sans)
  m1: 12, m2: 15, m3: 19, m4: 24, m5: 29,
  // Display ladder (Playfair, ceremonial physiological numerals only)
  d1: 49, d2: 61, d3: 76,
}

// Lucas spacing cadence — spatial rhythm only, distinct from type
const SP = { _3: 3, _4: 4, _7: 7, _11: 11, _18: 18, _29: 29, _47: 47 }

// Field phase aperture — Lucas-anchored at 47% (VL BPM = 47, calm/efficiency anchor)
const PHASE_APERTURE = 0.47

// Helper for rgba conversions
const alpha = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

const s = (x: object) => x as React.CSSProperties

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Node {
  id: string; symbol: string; composite: number; pctRank: number
  bucket: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High'
  axis1: number; axis2: number; axis1Pct: number; axis2Pct: number; ev: number
  oal: 'FCF' | 'NI' | 'EBIT' | 'Revenue'
  evBand: number; x: number; y: number
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

// Section 1 v2.0 persistence record — schema_version: section1_v2.0_persistence_v1
// Source: persistence_snapshot.json companion file, keyed by symbol.
// Methodology brief: Notion 350be5a0-6e23-81f7-bfa8-d7e5d1736e4f (LOCKED 2026-04-28)
interface PersistenceRecord {
  composite_bucket:     string
  persistence_months:   number
  persistence_pct:      number
  persistence_status:   string
  bucket_share_current: number
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

// April 26 brief: hardcoded neighborhood centers (% of SVG canvas).
// VL bottom-left → VH top-right. Static layout, computed once per render.
// Field-pulsation periods per April 26 brief.
//
// 2026-04-27 Architecture Pass v1.0 calibration: centers tightened inward to preserve
// the diagonal doctrine under the deployed panel aspect ratio (~700×440px). Original
// April 26 percentages (15/75, 32/55, 50/40, 68/28, 82/18) pressed the endpoints too
// close to the boundary at this aspect — VL piled against the lower-left edge.
// NEIGHBORHOODS — auto-fit endpoints + Alpha proportional spacing (LOCKED 2026-04-28).
// Endpoint positions chosen to maximize habitat area within deployed panel
// (700×440). The data is the priority; the diagonal is decorative.
//
// Optimal endpoints (grid-searched against deployed panel + bucket shares):
//   VL = (17, 55) — pulled inward from prior corner-anchored position
//   VH = (80, 40) — pulled inward from prior corner-anchored position
// Both endpoints maximize the smallest per-habitat edge-clearance, which
// determines auto-fit BASE. The diagonal flattens as a consequence — VH
// no longer sits in the upper-right corner. This is intentional.
//
// Cumulative t in median-return space (Alpha): VL=0, L=0.186, M=0.329,
// H=0.638, VH=1.000. Each intermediate sits at:
//   cx = 17 + (80-17)*t = 17 + 63*t
//   cy = 55 + (40-55)*t = 55 - 15*t
//
// Radius factors and animation periods unchanged.
// Radius factors and animation periods updated 2026-04-28: cadence unified
// to cardiac BPM (302/488/789/971/1277ms VH→VL). The earlier directional
// values (1000/2000/3000/4000/7000ms) ran the field slower than the Return
// Field curves and risk strip card top notches, which were already on the
// cardiac BPM cadence per Visual Doctrine v1.3. Field now matches both.
// 47% Lucas phase aperture math automatically rescales to the new periods.
const NEIGHBORHOODS = [
  { id: 'VL', cx: 17, cy: 55, radiusFactor: 9.0, period: 1277 },
  { id: 'L',  cx: 29, cy: 52, radiusFactor: 8.5, period: 971  },
  { id: 'M',  cx: 38, cy: 50, radiusFactor: 8.0, period: 789  },
  { id: 'H',  cx: 57, cy: 45, radiusFactor: 6.5, period: 488  },
  { id: 'VH', cx: 80, cy: 40, radiusFactor: 5.8, period: 302  },
] as const

// ─── Section 1 v2.0 persistence-radius habitat encoding ──────────────────────
// LOCKED 2026-04-28. Encoding Doctrine Brief: Notion 350be5a0-6e23-8196-a9cc-d5cef12a7727
//
// Governing principle (LOCKED): the platform's job is to tell the truth about
// structural conditions, not to produce visually balanced compositions.
//
// Locked encoding decisions:
//   - Radial coordinate: persistence_pct (within-bucket percentile rank).
//     Supersedes Option Three's months/24 mapping after render review surfaced
//     that absolute month count is not bucket-comparable — a 7-month VH tenure
//     means something different from a 7-month Moderate tenure given their
//     differing median tenures (17 vs 7). Within-bucket percentile rank
//     directly encodes within-cohort settledness, which is what the radius
//     should say. Side benefit: the integer-radius ring artifact dissolves.
//   - Radial direction: settled = center (1 = center, 0 = periphery)
//   - Angular position: seeded-stable ticker hash (no analytical meaning, visual continuity)
//   - Habitat sizing: sqrt(bucket_share_current) — radius scalar, gentler option
//   - Endpoints: AF-3 auto-fit (data over diagonal philosophy)

// Habitat centers — auto-fit endpoints + Alpha proportional spacing (LOCKED 2026-04-28).
// Decimal form mirrors NEIGHBORHOODS percentage values exactly.
const HABITAT_CENTERS: Record<string, { cx: number; cy: number }> = {
  'Very Low':  { cx: 0.17, cy: 0.55 },
  'Low':       { cx: 0.29, cy: 0.52 },
  'Moderate':  { cx: 0.38, cy: 0.50 },
  'High':      { cx: 0.57, cy: 0.45 },
  'Very High': { cx: 0.80, cy: 0.40 },
}

// Bucket-share lookup matching the Build-delivered persistence_snapshot.json
// (2026-03 live universe). Used by habitatRadius BASE auto-derivation when
// persistence data is unavailable. Numbers match bucket_share_current.
const HABITAT_SHARE: Record<string, number> = {
  'Very Low':  0.072,
  'Low':       0.290,
  'Moderate':  0.351,
  'High':      0.155,
  'Very High': 0.132,
}

// Decorative habitat labels — limbus opacity, M1 doctrine, pointer-events disabled.
// Orientation only; not interactive.
const HABITAT_LABELS: Record<string, string> = {
  'Very Low':  'GROUNDED',
  'Low':       'STABLE',
  'Moderate':  'MIXED',
  'High':      'STRETCHED',
  'Very High': 'DETACHED',
}

// FNV-1a 32-bit hash → [0, 1). Deterministic, stable across renders, no analytical meaning.
// AAPL sits at the same angular position in the Low habitat every render forever.
function tickerHash(symbol: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < symbol.length; i++) {
    h ^= symbol.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return (h >>> 0) / 0xffffffff
}

// Habitat radius — auto-fit BASE derived from panel dimensions and habitat
// centers (LOCKED 2026-04-28). No hardcoded magnitude tunable.
//
// Algorithm: for each habitat, compute its edge-clearance budget (distance
// from center to nearest panel edge minus padding). The maximum BASE that
// keeps every habitat inside the panel is the minimum of (edge_clear / sqrt(share/0.20))
// across all habitats. The smallest-clearance habitat is the binding constraint.
//
// Returns radius in pixels for the given share at the auto-derived BASE.
// All five habitats fit inside the panel by construction.
function habitatRadiusAutoFit(
  bucket: string,
  panelW: number,
  panelH: number,
  centers: Record<string, { cx: number; cy: number }>,
  shares: Record<string, number>,
  pad: number = 8,
): number {
  // Auto-derive BASE: smallest implied BASE across all habitats
  let base = Infinity
  for (const b of Object.keys(centers)) {
    const c = centers[b]
    const cxp = c.cx * panelW
    const cyp = c.cy * panelH
    const edgeClear = Math.min(cxp, panelW - cxp, cyp, panelH - cyp) - pad
    const sqrtShare = Math.sqrt((shares[b] ?? 0.20) / 0.20)
    if (sqrtShare > 0) {
      const implied = edgeClear / sqrtShare
      if (implied < base) base = implied
    }
  }
  if (!isFinite(base) || base <= 0) base = panelW * 0.10  // ultra-conservative fallback

  const sqrtShareThis = Math.sqrt((shares[bucket] ?? 0.20) / 0.20)
  return base * sqrtShareThis
}

// April 26 brief: static bucket opacities (replaces prior breathing-animation swings)
const BUCKET_OPACITY: Record<string, number> = {
  'Very High': 0.92,
  'High':      0.75,
  'Moderate':  0.58,
  'Low':       0.50,
  'Very Low':  0.42,
}

// BPM cardiac cadence for the legend strip — 60000/BPM = ms
const BPM_PERIOD: Record<string, number> = {
  'Very Low':  1277, // 47 BPM
  'Low':        971, // 61.8 BPM
  'Moderate':   789, // 76 BPM
  'High':       488, // 123 BPM
  'Very High':  302, // 199 BPM
}

const BPM_VALUE: Record<string, number> = {
  'Very Low':  47,
  'Low':       61.8,
  'Moderate':  76,
  'High':      123,
  'Very High': 199,
}

// WELL_DATA — confirmed from Scripts 25, 26, 27 (DO NOT MODIFY without explicit instruction)
const WELL_DATA = [
  { id: 'VH', label: 'Very High', col: E.VH,
    median: -9.6,  std: 42, skew: -0.8, count: 362,
    lossRate: 39.6, desc: 'Detached · Degrading',
    bandSpreads: [null, 32.5, 19.6, 11.3, 3.5, 10.3, 7.5, 5.4] as (number|null)[] },
  { id: 'H',  label: 'High',     col: E.H,
    median: -2.0,  std: 32, skew: -0.4, count: 424,
    lossRate: 28.0, desc: 'Stretched · Unstable',
    bandSpreads: [null, 18, 14, 9, 3, 7, 5, 3.5] as (number|null)[] },
  { id: 'M',  label: 'Moderate', col: E.M,
    median:  4.5,  std: 28, skew: -0.1, count: 960,
    lossRate: 19.0, desc: 'Moderate · Mixed',
    bandSpreads: [null, 12, 9, 6, 2, 5, 4, 3] as (number|null)[] },
  { id: 'L',  label: 'Low',      col: E.L,
    median:  7.5,  std: 24, skew:  0.1, count: 794,
    lossRate: 14.0, desc: 'Stable · Positive returns',
    bandSpreads: [null, 8, 6, 4, 1.5, 3, 3, 2] as (number|null)[] },
  { id: 'VL', label: 'Very Low', col: E.VL,
    median: 11.4,  std: 20, skew:  0.2, count: 198,
    lossRate: 10.5, desc: 'Grounded · Stable',
    bandSpreads: [null, 6, 4, 3, 1, 2, 2, 1.5] as (number|null)[] },
]

const BAND_SPREADS_BASE = 21.0

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
  { band: 'all' as Band, label: 'All',      sub: undefined },
  { band: 1 as Band,     label: 'Band I',   sub: '<$300M' },
  { band: 2 as Band,     label: 'Band II',  sub: '$300M–$1B' },
  { band: 3 as Band,     label: 'Band III', sub: '$1B–$3B' },
  { band: 4 as Band,     label: 'Band IV',  sub: '$3B–$10B' },
  { band: 5 as Band,     label: 'Band V',   sub: '$10B–$30B' },
  { band: 6 as Band,     label: 'Band VI',  sub: '$30B–$100B' },
  { band: 7 as Band,     label: 'Band VII', sub: '>$100B' },
]

const OAL_RUNGS = [
  { key: 'all'     as OALKey, label: 'All',     sub: undefined },
  { key: 'Revenue' as OALKey, label: 'Revenue', sub: 'Shallowest' },
  { key: 'EBIT'    as OALKey, label: 'EBIT',    sub: 'Op. Income' },
  { key: 'NI'      as OALKey, label: 'NI',      sub: 'Net Income' },
  { key: 'FCF'     as OALKey, label: 'FCF',     sub: 'Deepest' },
]

const OAL_MED_ADJ: Record<string, Record<string, number>> = {
  FCF:     { VH: +2.5, VL: +3.2 },
  NI:      { VH: +0.5, VL: +0.8 },
  EBIT:    { VH: -0.5, VL: -0.2 },
  Revenue: { VH: -5.0, VL: -4.5 },
  all:     {},
}

function makeLCG(seed: number) {
  let s = seed >>> 0
  return function () {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

function bucketColor(bucket: string): string {
  switch (bucket) {
    case 'Very Low':  return E.VL
    case 'Low':       return E.L
    case 'Moderate':  return E.M
    case 'High':      return E.H
    case 'Very High': return E.VH
    default:          return E.text3
  }
}

function bucketToId(bucket: string): string {
  switch (bucket) {
    case 'Very High': return 'VH'
    case 'High':      return 'H'
    case 'Moderate':  return 'M'
    case 'Low':       return 'L'
    case 'Very Low':  return 'VL'
    default:          return 'M'
  }
}

function bucketCSSClass(bucket: string): string {
  switch (bucket) {
    case 'Very High': return 'vh'
    case 'High':      return 'h'
    case 'Moderate':  return 'mod'
    case 'Low':       return 'lo'
    case 'Very Low':  return 'vl'
    default:          return 'mod'
  }
}

function safeFixed(v: unknown, d = 2): string {
  const n = Number(v); return isFinite(n) ? n.toFixed(d) : '—'
}
function nodeRadius(ev: number, lo = 1e8, hi = 2e12): number {
  // April 26 brief: preserve existing nodeRadius() encoding, range 1.8–5.0
  const MIN_R = 1.8, MAX_R = 5.0
  const t = Math.max(0, Math.min(1, (Math.log(Math.max(ev, lo)) - Math.log(lo)) / (Math.log(hi) - Math.log(lo))))
  return MIN_R + t * (MAX_R - MIN_R)
}

// ─── Clerk appearance — v1.3 tokens ──────────────────────────────────────────

const CLERK_APPEARANCE = {
  variables: {
    colorBackground: E.bg1, colorPrimary: E.text1,
    colorText: E.text1, colorTextSecondary: E.text2,
    colorTextOnPrimaryBackground: E.bg0,
    colorInputBackground: E.bg0, colorInputText: E.text1,
    colorNeutral: E.text1, borderRadius: '0px',
    fontFamily: "'DM Sans',system-ui,sans-serif",
  },
  elements: {
    card: 'shadow-none bg-transparent', headerTitle: 'hidden', headerSubtitle: 'hidden',
    formButtonPrimary: 'font-semibold rounded-none',
    socialButtonsBlockButton: 'border-[#1E1B18] rounded-none',
    footerActionLink: 'underline', footer: 'bg-transparent',
  },
}

// ─── Auth modal ───────────────────────────────────────────────────────────────

function AuthModal() {
  const [mode, setMode] = useState<'prompt' | 'signin' | 'signup'>('prompt')
  return (
    <div style={s({ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
      <div style={s({ position: 'absolute', inset: 0, background: 'rgba(8,7,6,0.82)', backdropFilter: 'blur(12px)' })} />
      <div style={s({ position: 'relative', width: '100%', maxWidth: 460, background: E.bg1, borderTop: `2px solid ${E.text1}` })}>
        <div style={s({ padding: `${SP._29}px ${SP._29}px ${SP._18}px` })}>
          <div style={s({ display: 'flex', alignItems: 'baseline', marginBottom: SP._18 })}>
            <span style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: E.text3 })}>The Capital</span>
            <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: T.s4, lineHeight: 1.0, color: E.text1, marginLeft: SP._7 })}>Steward</span>
          </div>
          {mode === 'prompt' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: T.s5, fontWeight: 700, color: E.text1, letterSpacing: '-0.01em', marginBottom: SP._7, lineHeight: 1.1 })}>The structural map.</h2>
            <p style={s({ fontFamily: E.sans, fontSize: T.s2, lineHeight: 1.62, color: E.text2, marginBottom: SP._18 })}>~5,200 U.S. equities. Two independently validated dimensions of structural risk. The full map is free.</p>
            <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SP._4, marginBottom: SP._18 })}>
              {[
                // PRICING FIX (LOCKED 2026-04-19, 2026-04-26): $159 → $249/mo
                { tier: 'Free', cta: 'Create account', action: () => setMode('signup'), primary: false,
                  features: ['Full structural field', 'Regime detail · Expansion, Neutral, Stress', 'Anchor level filter', 'EV band filter'] },
                { tier: 'Full access · $249/mo', cta: 'Open full access', action: () => { window.location.href = '/platform/subscribe' }, primary: true,
                  features: ['Everything free', 'Sector breakdown', 'Structural archetypes', 'Company-level structural history · 7 years'] },
              ].map(({ tier, cta, action, primary, features }) => (
                <div key={tier} style={s({ background: primary ? E.bg2 : 'transparent', padding: `${SP._18}px` })}>
                  <div style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: primary ? E.text1 : E.text3, marginBottom: SP._11 })}>{tier}</div>
                  <div style={s({ display: 'flex', flexDirection: 'column', gap: SP._4, marginBottom: SP._11 })}>
                    {features.map(f => <div key={f} style={s({ fontFamily: E.sans, fontSize: T.s1, color: E.text2, lineHeight: 1.55 })}>{f}</div>)}
                  </div>
                  <button onClick={action} style={s({ width: '100%', fontFamily: E.mono, fontSize: T.m1, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' as const, padding: `${SP._11}px 0`, background: primary ? E.text1 : 'transparent', color: primary ? E.bg0 : E.text2, border: 'none', cursor: 'pointer' })}>{cta}</button>
                </div>
              ))}
            </div>
            <div style={s({ textAlign: 'center' as const })}>
              <button onClick={() => setMode('signin')} style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, color: E.text3, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' })}>Already have an account? Sign in</button>
            </div>
          </>}
          {mode === 'signin' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: T.s5, fontWeight: 700, color: E.text1, letterSpacing: '-0.01em', marginBottom: SP._18, lineHeight: 1.1 })}>Sign in to open the map.</h2>
            <SignIn forceRedirectUrl="/platform" appearance={CLERK_APPEARANCE} />
            <div style={s({ textAlign: 'center' as const, marginTop: SP._18 })}><button onClick={() => setMode('prompt')} style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, color: E.text3, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' })}>← Back</button></div>
          </>}
          {mode === 'signup' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: T.s5, fontWeight: 700, color: E.text1, letterSpacing: '-0.01em', marginBottom: SP._18, lineHeight: 1.1 })}>Create free account</h2>
            <SignUp forceRedirectUrl="/platform" appearance={CLERK_APPEARANCE} />
            <div style={s({ textAlign: 'center' as const, marginTop: SP._18 })}><button onClick={() => setMode('prompt')} style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, color: E.text3, background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' })}>← Back</button></div>
          </>}
        </div>
        <div style={s({ padding: `${SP._11}px ${SP._29}px ${SP._18}px` })}>
          <p style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, color: E.text3, textAlign: 'center' as const })}>
            <Link href="/methodology" style={s({ color: E.text1, textDecoration: 'none' })}>Examine the evidence</Link>
            {' · '}
            <Link href="/who-its-for" style={s({ color: E.text3, textDecoration: 'none' })}>Who it&apos;s for</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Platform preview (unauthenticated state) ────────────────────────────────

const PREVIEW_DOTS = Array.from({ length: 120 }, (_, i) => {
  const rng = makeLCG(i * 7 + 13)
  const colors = [E.VL, E.L, E.M, E.H, E.VH]
  return { cx: rng() * 400, cy: rng() * 300, r: 1 + rng() * 4, fill: colors[Math.floor(rng() * 5)], opacity: 0.5 + rng() * 0.4 }
})

function PlatformPreview() {
  return (
    <div style={s({ width: '100%', height: '100vh', overflow: 'hidden', pointerEvents: 'none', userSelect: 'none' })}>
      <div style={s({ height: 56, display: 'flex', alignItems: 'center', padding: `0 ${SP._29}px`, background: E.bg0 })}>
        <span style={s({ fontFamily: E.mono, fontSize: T.m1, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.text3 })}>The Capital</span>
        <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: T.s4, color: E.text1, marginLeft: SP._7 })}>Steward</span>
      </div>
      <div style={s({ height: 54, display: 'flex', alignItems: 'center', padding: `0 ${SP._29}px`, gap: SP._29, background: E.bg0 })}>
        {DESCENT_LEVELS.map(l => (
          <div key={l.n} style={s({ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', opacity: l.n === 1 ? 1 : 0.3 })}>
            <span style={s({ fontFamily: E.mono, fontSize: T.m5, lineHeight: 1.3, color: l.n === 1 ? E.text1 : E.limbus })}>{l.n}</span>
            <span style={s({ fontFamily: E.mono, fontSize: T.m1, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: l.n === 1 ? E.text1 : E.text3 })}>{l.label}</span>
          </div>
        ))}
      </div>
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100vh - 110px)' })}>
        {[0, 1].map(panel => (
          <div key={panel} style={s({ borderRight: panel === 0 ? `1px solid ${alpha(E.limbus, 0.30)}` : 'none', background: E.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
            <svg width="90%" height="90%" viewBox="0 0 400 300">
              {PREVIEW_DOTS.map((d, i) => <circle key={i} cx={panel === 0 ? d.cx : d.cx * 0.9 + 20} cy={d.cy} r={d.r} fill={d.fill} opacity={d.opacity} />)}
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Lucas section header — v1.3 locked descent (M5/29 + M2/15 + S1/13) ──────

function SectionHeader({ lucas, label, sub }: { lucas: number; label: string; sub: string }) {
  return (
    <div style={s({ height: 50, background: E.bg1, display: 'flex', alignItems: 'baseline', gap: SP._11, padding: `0 ${SP._29}px` })}>
      <span style={s({ fontFamily: E.mono, fontSize: T.m5, lineHeight: 1.3, letterSpacing: '0.04em', color: E.text1, fontWeight: 700 })}>{lucas}</span>
      <b style={s({ fontFamily: E.mono, fontSize: T.m2, lineHeight: 1.3, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.text2, fontWeight: 400 })}>{label}</b>
      <em style={s({ fontFamily: E.sans, fontSize: T.s1, lineHeight: 1.55, color: E.text3, fontStyle: 'normal' })}>{sub}</em>
    </div>
  )
}

// ─── Return Field Panel (right panel — preserved with token migration) ───────

function ReturnFieldPanel({
  selectedBand, selectedOal, svgRef,
}: {
  selectedBand: Band[]
  selectedOal:  OALKey[]
  svgRef: React.RefObject<SVGSVGElement | null>
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [dims, setDims] = useState({ w: 600, h: 400 })

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

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' as const, background: E.bg0 }}>
      <svg
        ref={svgRef}
        style={{ display: 'block', width: '100%', flex: 1 }}
        viewBox={`0 0 ${W} ${H}`}
      >
        <rect width={W} height={H} fill={E.bg0} />

        {/* Plot internals — separate analytical grammar. Limbus at 12% gridlines, 26% axes. */}
        {[-75, -50, -25, 0, 25, 50, 75].map(v => (
          <g key={v}>
            <line x1={xPx(v)} y1={PAD.t} x2={xPx(v)} y2={PAD.t + iH} stroke={alpha(E.limbus, v === 0 ? 0.26 : 0.12)} strokeWidth={v === 0 ? 1 : 0.55} />
            <text x={xPx(v)} y={PAD.t + iH + 14} textAnchor="middle" fontFamily={E.mono} fontSize={T.m1} fill={E.text3}>{v === 0 ? '0%' : `${v}%`}</text>
          </g>
        ))}

        {/* Severe-loss threshold — semantic line, not chrome */}
        <line x1={xPx(-25)} y1={PAD.t} x2={xPx(-25)} y2={PAD.t + iH} stroke={E.VH} strokeWidth={1.1} strokeDasharray="3 7" opacity={0.5} />
        <text x={xPx(-25) - 5} y={PAD.t + 13} textAnchor="end" fontFamily={E.mono} fontSize={T.m1} fill={E.VH}>−25% severe loss threshold</text>

        <text x={PAD.l + iW / 2} y={H - 8} textAnchor="middle" fontFamily={E.mono} fontSize={T.m1} letterSpacing="0.14em" fill={E.text3}>
          12-MONTH FORWARD RETURN →
        </text>

        {bandKey !== 'all' && (
          <text x={W - PAD.r} y={PAD.t + 13} textAnchor="end" fontFamily={E.mono} fontSize={T.m1} fill={E.text1}>
            Band {bandKey} · {WELL_DATA[0].bandSpreads[+bandKey]}pp spread
          </text>
        )}

        {/* Area fills — reversed so VH renders over others */}
        {[...curves].reverse().map(b => {
          const pts = xs.map((x, i) => `${xPx(x)},${yPx(b.ys[i])}`).join(' ')
          return (
            <polygon
              key={`fill-${b.id}`}
              className="gf-curve"
              data-bucket={b.id}
              points={`${xPx(xs[0])},${baseY} ${pts} ${xPx(xs[xs.length-1])},${baseY}`}
              fill={b.col}
              opacity={b.id === 'VH' ? 0.10 : 0.07}
              style={{ pointerEvents: 'none' }}
            />
          )
        })}

        {/* Curve lines — animation class on the <path> directly, not the <g>.
            Same SVG opacity-on-group browser inconsistency as field nodes. */}
        {[...curves].reverse().map(b => {
          const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${xPx(x)},${yPx(b.ys[i])}`).join(' ')
          const baseWidth   = b.id === 'VH' ? 3.1  : b.id === 'VL' ? 2.3  : 1.8
          return (
            <g key={`curve-${b.id}`} className="gf-curve" data-bucket={b.id}>
              {(b.id === 'VH' || b.id === 'VL') && (
                <path d={d} fill="none" stroke={b.col} strokeWidth={b.id === 'VH' ? 9 : 5} opacity={b.id === 'VH' ? 0.12 : 0.10} strokeLinecap="round" />
              )}
              <path
                className={`gf-curve-line gf-curve-${b.id}`}
                d={d}
                fill="none"
                stroke={b.col}
                strokeWidth={baseWidth}
                strokeLinecap="round"
              />
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{ background: E.bg0, padding: `${SP._11}px ${SP._18}px`, display: 'flex', flexWrap: 'wrap' as const, gap: '0px 18px', alignItems: 'stretch' }}>
        {curves.map(b => (
          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: SP._7, padding: '2px 0' }}>
            <svg width={22} height={11} style={{ flexShrink: 0 }}>
              <line x1={0} y1={5.5} x2={22} y2={5.5} stroke={b.col} strokeWidth={b.id === 'VH' ? 2.2 : b.id === 'VL' ? 1.8 : 1.3} opacity={b.id === 'VH' ? 0.96 : b.id === 'VL' ? 0.85 : 0.78} />
            </svg>
            <span style={{ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, fontWeight: b.id === 'VH' ? 700 : 400, color: b.col }}>{b.desc}</span>
            <span style={{ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, color: E.text3 }}>{b.adjMedian > 0 ? '+' : ''}{b.adjMedian.toFixed(1)}% median</span>
            {b.id === 'VH' && <span style={{ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, color: E.text3 }}>· {b.lossRate}% severe loss · {b.count} companies</span>}
            {b.id === 'VL' && <span style={{ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, color: E.text3 }}>· None deteriorating</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section 2: Regime panels — current at S5/31 sans, sides at S3/20 sans ───

const REGIME_CONFIRMED = [
  { id: 'expansionary', label: 'Expansionary', icir: -0.760, vh_loss_rate: 0.448, universe_loss_rate: 0.176, vl_loss_rate: 0.105, rel_risk: 2.54 },
  { id: 'neutral',      label: 'Neutral',       icir: -0.762, vh_loss_rate: 0.340, universe_loss_rate: 0.170, vl_loss_rate: 0.105, rel_risk: 2.00 },
  { id: 'stress',       label: 'Stress',        icir: -0.759, vh_loss_rate: 0.370, universe_loss_rate: 0.150, vl_loss_rate: 0.105, rel_risk: 2.47 },
]

const CURRENT_REGIME_ID = 'expansionary'

function Section2Regimes({ summary }: { summary: RegimeSummary | null }) {
  // JUDGMENT CALL: regime metric percentages use S5/31 sans (declarative thesis) for current,
  // S3/20 sans for sides. Display ladder reserved for physiological numerals only.
  // Asymmetry locked: NOW = thesis state.
  const gridCols = REGIME_CONFIRMED.map(r =>
    r.id === CURRENT_REGIME_ID ? '1.55fr' : '1fr'
  ).join(' ')

  return (
    <section>
      <SectionHeader lucas={3} label="Market Regimes" sub="Structural risk signal by market regime · 2009–2026" />
      <div style={s({ padding: `${SP._18}px ${SP._29}px ${SP._11}px`, background: E.bg0, fontFamily: E.sans, fontSize: T.s2, lineHeight: 1.62, color: E.text2, maxWidth: 780 })}>
        ICIR −0.76 across Expansion, Neutral, and Stress.{' '}
        <span style={s({ color: E.text3 })}>The signal does not weaken in any regime.</span>
      </div>

      <div style={s({ display: 'grid', gridTemplateColumns: gridCols, background: E.bg0, padding: `${SP._11}px ${SP._29}px ${SP._29}px` })}>
        {REGIME_CONFIRMED.map((r) => {
          const isCurrent = r.id === CURRENT_REGIME_ID
          return (
            <div key={r.id} style={s({
              padding: `${SP._18}px ${SP._18}px ${SP._11}px`,
              background: isCurrent ? E.bg2 : E.bg0,
              borderRight: r.id !== 'stress' ? `1px solid ${alpha(E.limbus, 0.22)}` : 'none',
            })}>
              <div style={s({ display: 'flex', alignItems: 'baseline', gap: SP._7, marginBottom: SP._11 })}>
                {isCurrent && <span style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, fontWeight: 700, color: E.text1, letterSpacing: '0.14em', textTransform: 'uppercase' as const })}>NOW · APR 2026 ·</span>}
                <span style={s({ fontFamily: E.mono, fontSize: T.m2, lineHeight: 1.45, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: isCurrent ? E.text1 : E.limbus, fontWeight: 400 })}>
                  {r.label}
                </span>
              </div>
              <div style={s({ display: 'flex', alignItems: 'baseline', gap: SP._7, marginBottom: SP._7 })}>
                <strong style={s({
                  fontFamily: E.sans,
                  fontSize: isCurrent ? T.s5 : T.s3,
                  lineHeight: 1.0,
                  letterSpacing: '-0.01em',
                  color: E.VH,
                  fontWeight: 700,
                })}>
                  {(r.vh_loss_rate * 100).toFixed(1)}%
                </strong>
                <span style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.10em', color: E.text3 })}>Very High severe loss</span>
              </div>
              <div style={s({ height: 5, background: alpha(E.limbus, 0.14), margin: `${SP._7}px 0`, position: 'relative' })}>
                <div style={s({ height: '100%', background: E.VH, width: `${r.vh_loss_rate * 100 / 0.50 * 100}%` })} />
              </div>
              <p style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.10em', color: E.text3, margin: 0 })}>
                {r.rel_risk.toFixed(2)}× universe rate · ICIR {r.icir.toFixed(2)}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── Section 3: Anchor Levels — h3 at S4/25 sans, body at S2/16 sans ─────────

const RUNG_DEFS = [
  { key: 'Revenue' as OALKey, label: 'Revenue', depth: 'Shallowest anchor',
    desc: 'Valuation rests on top-line growth, not sustained cash generation.',
    weight: 4.3, ret: -17.3, hasRet: true },
  { key: 'EBIT' as OALKey, label: 'EBIT', depth: 'Second anchor',
    desc: 'Operating income before financing and taxes.',
    weight: 0.1, ret: null, hasRet: false },
  { key: 'NI' as OALKey, label: 'Net Income', depth: 'Third anchor',
    desc: 'Profitability after obligations.',
    weight: 43.8, ret: null, hasRet: false },
  { key: 'FCF' as OALKey, label: 'Free Cash Flow', depth: 'Deepest anchor',
    desc: 'Actual cash generated after capital expenditure. The anchor that holds.',
    weight: 51.8, ret: 10.2, hasRet: true },
]

function Section3AnchorLevels({
  nodes, selectedOal, onSelectOal, filterRowRef,
}: {
  nodes: Node[]
  selectedOal: OALKey[]
  onSelectOal: (key: OALKey) => void
  filterRowRef: (el: HTMLDivElement | null) => void
}) {
  const rungs = RUNG_DEFS.map(r => {
    const rungNodes = nodes.filter(n => n.oal === r.key)
    const total = rungNodes.length || 1
    const dist  = Object.fromEntries(BUCKET_ORDER.map(b => [b, rungNodes.filter(n => n.bucket === b).length])) as Record<string, number>
    return { ...r, total: rungNodes.length, dist }
  })

  // Restrained endpoint notches — Revenue at H/VH transitional, FCF at VL.
  // Quietly directional, not theatrical. EBIT and NI receive no notch.
  const notchHue = (key: OALKey): string | null => {
    if (key === 'Revenue') return E.H   // H hue — transitional fragility, not full VH bleed
    if (key === 'FCF')     return E.VL  // VL hue — anchor stability
    return null
  }

  const filterActive = !selectedOal.includes('all')
  const singleSelected: OALKey = selectedOal.length === 1 ? selectedOal[0] : 'all'

  return (
    <section>
      <SectionHeader lucas={4} label="Anchor Levels" sub="Seven years of operational history. One dominant anchor." />

      {/* Orientation copy — S2/16 sans body */}
      <div style={s({ padding: `${SP._18}px ${SP._29}px ${SP._11}px`, background: E.bg0, fontFamily: E.sans, fontSize: T.s2, lineHeight: 1.62, color: E.text2, maxWidth: 780 })}>
        The operational anchor a company has built predicts the shape of its returns.{' '}
        <span style={s({ color: E.VH, fontWeight: 700 })}>Revenue-anchored: −17.3% median.</span>{' '}
        <span style={s({ color: E.VL, fontWeight: 700 })}>FCF-anchored: +10.2% median.</span>{' '}
        <span style={s({ color: E.text3 })}>Same universe. Same period. Different structures.</span>
      </div>

      {/* Local filter row — Architecture Pass v1.0. Filter housed in native section,
          but reactivity remains global (Section 1 dims by data-oal, Return Field responds). */}
      <div ref={filterRowRef}
        style={s({ background: E.bg0, padding: `${SP._4}px ${SP._29}px ${SP._18}px`, display: 'flex', alignItems: 'center', gap: SP._7, flexWrap: 'wrap' as const })}>
        <span style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.text3, marginRight: SP._4, flexShrink: 0 })}>Filter by anchor</span>
        {OAL_RUNGS.map(({ key, label, sub }) => {
          const active = selectedOal.includes(key)
          const isAllSelected = selectedOal.includes('all') && key === 'all'
          return (
            <button key={key} onClick={() => onSelectOal(key)} style={s({
              fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, fontWeight: active ? 700 : 400,
              letterSpacing: '0.10em',
              padding: `${SP._7}px ${SP._11}px`,
              background: isAllSelected ? E.bg1 : (active ? E.bg2 : 'transparent'),
              color: active ? E.text1 : E.text3,
              border: 'none',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, flexShrink: 0,
            })}>
              <span>{label}</span>
              {sub && <span style={s({ fontSize: T.m1, color: active ? E.text2 : E.limbus, fontWeight: 400 })}>{sub}</span>}
            </button>
          )
        })}
      </div>

      {/* Horizontal strata — each rung is a row, not a card.
          Grid: anchor label | description | risk fingerprint | metric.
          Containment via fixed widths, no overflow leak. */}
      <div style={s({ background: E.bg0, padding: `0 ${SP._29}px ${SP._29}px` })}>
        {rungs.map((rung, i) => {
          const isSelected = singleSelected === rung.key
          const isActive   = !filterActive || isSelected
          const notch      = notchHue(rung.key)
          const isLast     = i === rungs.length - 1
          return (
            <div key={rung.key}
              data-rung={rung.key}
              style={s({
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '180px 1fr 280px 160px',
                gap: SP._29,
                alignItems: 'start',
                padding: `${SP._18}px ${SP._18}px ${SP._18}px ${SP._29}px`,
                borderBottom: !isLast ? `1px solid ${alpha(E.limbus, 0.18)}` : 'none', // Membrane hairline <25% — anatomical layer separator, not chrome border
                opacity: !isActive ? 0.40 : 1,
                transition: 'opacity 0.22s',
              })}>
              {/* Restrained endpoint notch — vascular marker, 2px left edge */}
              {notch && <div style={s({ position: 'absolute', left: 0, top: SP._18, bottom: SP._18, width: 2, background: notch })} />}

              {/* Anchor label column */}
              <div>
                <small style={s({ display: 'block', fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: E.limbus, marginBottom: SP._4 })}>{rung.depth}</small>
                <h3 style={s({ margin: 0, fontFamily: E.sans, fontSize: T.s4, lineHeight: 1.2, letterSpacing: '-0.01em', color: E.text1, fontWeight: 400 })}>{rung.label}</h3>
              </div>

              {/* Description column */}
              <div>
                <p style={s({ fontFamily: E.sans, fontSize: T.s2, lineHeight: 1.62, color: E.text2, margin: 0 })}>{rung.desc}</p>
              </div>

              {/* Risk fingerprint column — bounded, contained, cannot bleed */}
              <div style={s({ overflow: 'hidden' })}>
                <small style={s({ display: 'block', fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: E.limbus, marginBottom: SP._7 })}>Risk fingerprint</small>
                <div style={s({ height: 22, display: 'flex', gap: 1, width: '100%' })}>
                  {BUCKET_ORDER.map(b => {
                    const pct = rung.total > 0 ? (rung.dist[b] / rung.total) * 100 : 20
                    return <div key={b} style={s({ height: '100%', flex: pct, background: bucketColor(b), opacity: isSelected ? 0.96 : 0.55, minWidth: pct > 1 ? '2px' : '0', transition: 'opacity 0.22s' })} />
                  })}
                </div>
                <div style={s({ display: 'flex', justifyContent: 'space-between', marginTop: SP._4 })}>
                  {BUCKET_ORDER.map(b => {
                    const short = b === 'Very Low' ? 'VL' : b === 'Low' ? 'L' : b === 'Moderate' ? 'M' : b === 'High' ? 'H' : 'VH'
                    return <span key={b} style={s({ fontFamily: E.mono, fontSize: T.m1, color: E.limbus, letterSpacing: '0.06em' })}>{short}</span>
                  })}
                </div>
              </div>

              {/* Metric column — right-aligned */}
              <div style={s({ textAlign: 'right' as const })}>
                {rung.hasRet ? (
                  <>
                    <small style={s({ display: 'block', fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: E.limbus, marginBottom: SP._4 })}>Median 12m</small>
                    <div style={s({ fontFamily: E.sans, fontSize: T.s3, lineHeight: 1.0, fontWeight: 700, color: rung.ret! > 0 ? E.VL : E.VH, letterSpacing: '-0.01em', marginBottom: SP._4 })}>
                      {rung.ret! > 0 ? '+' : ''}{rung.ret}%
                    </div>
                    <div style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, color: E.text3 })}>285K obs</div>
                  </>
                ) : (
                  <>
                    <small style={s({ display: 'block', fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: E.limbus, marginBottom: SP._4 })}>Range</small>
                    <div style={s({ fontFamily: E.mono, fontSize: T.m2, lineHeight: 1.45, color: E.text3 })}>
                      <span style={s({ color: E.VL })}>+10.2%</span> → <span style={s({ color: E.VH })}>−17.3%</span>
                    </div>
                  </>
                )}
                <div style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, color: E.text3, marginTop: SP._7 })}>{rung.weight}% weight</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── Section 4: EV Quantile Bands ─────────────────────────────────────────────

function Section4EVBands({
  selectedBand, selectedBandList, onSelectBand, filterRowRef,
}: {
  selectedBand: Band
  selectedBandList: Band[]
  onSelectBand: (band: Band) => void
  filterRowRef: (el: HTMLDivElement | null) => void
}) {
  const BAND_DATA = [
    { band: 1, label: 'Band I',   sub: '<$300M',      vlMedian:  9.3, vhMedian: -23.3, spread: 32.5 },
    { band: 2, label: 'Band II',  sub: '$300M–$1B',   vlMedian:  8.0, vhMedian: -11.6, spread: 19.6 },
    { band: 3, label: 'Band III', sub: '$1B–$3B',     vlMedian:  6.9, vhMedian:  -4.5, spread: 11.3 },
    { band: 4, label: 'Band IV',  sub: '$3B–$10B',    vlMedian:  6.9, vhMedian:   3.4, spread:  3.5 },
    { band: 5, label: 'Band V',   sub: '$10B–$30B',   vlMedian: 10.3, vhMedian:   0.0, spread: 10.3 },
    { band: 6, label: 'Band VI',  sub: '$30B–$100B',  vlMedian: 10.6, vhMedian:   3.1, spread:  7.5 },
    { band: 7, label: 'Band VII', sub: '>$100B',      vlMedian:  9.0, vhMedian:   3.6, spread:  5.4 },
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

      {/* Orientation copy — S2/16 sans body */}
      <div style={s({ padding: `${SP._18}px ${SP._29}px ${SP._11}px`, background: E.bg0, fontFamily: E.sans, fontSize: T.s2, lineHeight: 1.62, color: E.text2, maxWidth: 780 })}>
        Structural fragility is not a small-cap phenomenon — and structural safety is not a large-cap privilege.{' '}
        <span style={s({ color: E.text3 })}>The VL vs VH return spread is positive in all seven bands without exception.</span>
      </div>

      {/* Local filter row — Architecture Pass v1.0. Filter housed in native section,
          but reactivity remains global (Section 1 dims by data-evband, Return Field responds). */}
      <div ref={filterRowRef}
        style={s({ background: E.bg0, padding: `${SP._4}px ${SP._29}px ${SP._18}px`, display: 'flex', alignItems: 'center', gap: SP._7, flexWrap: 'wrap' as const })}>
        <span style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.text3, marginRight: SP._4, flexShrink: 0 })}>Filter by EV band</span>
        {EV_BANDS.map(({ band, label, sub }) => {
          const active = selectedBandList.includes(band)
          const isAllSelected = selectedBandList.includes('all') && band === 'all'
          return (
            <button key={String(band)} onClick={() => onSelectBand(band)} style={s({
              fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, fontWeight: active ? 700 : 400,
              letterSpacing: '0.10em',
              padding: `${SP._7}px ${SP._11}px`,
              background: isAllSelected ? E.bg1 : (active ? E.bg2 : 'transparent'),
              color: active ? E.text1 : E.text3,
              border: 'none',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, flexShrink: 0,
            })}>
              <span>{label}</span>
              {sub && <span style={s({ fontSize: T.m1, color: active ? E.text2 : E.limbus, fontWeight: 400 })}>{sub}</span>}
            </button>
          )
        })}
      </div>

      <div style={s({ padding: `0 ${SP._29}px ${SP._29}px`, background: E.bg0 })}>
        <svg viewBox={`0 0 ${W} ${H}`} style={s({ width: '100%', height: 'auto', display: 'block', maxHeight: 240 })}>
          {yTicks.map(v => {
            const y = cy(v)
            return (
              <g key={v}>
                <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke={alpha(E.limbus, v === 0 ? 0.26 : 0.12)} strokeWidth={v === 0 ? 1.0 : 0.55} />
                <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontFamily={E.mono} fontSize={T.m1} fill={E.text3}>{v > 0 ? '+' : ''}{v}%</text>
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
              <g key={bd.band} opacity={isActive ? 1 : 0.40}>
                <rect x={x - BAR_W - 1} y={vlY} width={BAR_W} height={vlH} fill={isSelected ? E.text1 : E.VL} opacity={isSelected ? 0.95 : 0.80} />
                <rect x={x + 1} y={vhY} width={BAR_W} height={vhH} fill={isSelected ? E.text1 : E.VH} opacity={isSelected ? 0.95 : 0.78} />
                <text x={x - BAR_W / 2 - 1} y={bd.vlMedian >= 0 ? cy(bd.vlMedian) - 4 : zeroY + vhH + 13} textAnchor="middle" fontFamily={E.mono} fontSize={T.m1} fill={isSelected ? E.text1 : E.VL} fontWeight={isSelected ? 700 : 400}>+{bd.vlMedian.toFixed(1)}%</text>
                <text x={x + BAR_W / 2 + 1} y={bd.vhMedian < 0 ? cy(bd.vhMedian) + 13 : cy(bd.vhMedian) - 4} textAnchor="middle" fontFamily={E.mono} fontSize={T.m1} fill={isSelected ? E.text1 : E.VH} fontWeight={isSelected ? 700 : 400}>{bd.vhMedian > 0 ? '+' : ''}{bd.vhMedian.toFixed(1)}%</text>
                <text x={x} y={PAD.t + iH + 16} textAnchor="middle" fontFamily={E.mono} fontSize={T.m1} fill={isSelected ? E.text1 : E.text3}>{bd.label}</text>
                <text x={x} y={PAD.t + iH + 27} textAnchor="middle" fontFamily={E.mono} fontSize={T.m1} fill={E.text3}>{bd.sub}</text>
                <text x={x} y={PAD.t + iH + 42} textAnchor="middle" fontFamily={E.mono} fontSize={T.m1} fill={isSelected ? E.text1 : E.text3}>{bd.spread.toFixed(1)}pp</text>
              </g>
            )
          })}
          <g>
            <rect x={PAD.l + 4} y={PAD.t} width={8} height={8} fill={E.VL} opacity={0.8} />
            <text x={PAD.l + 16} y={PAD.t + 8} fontFamily={E.mono} fontSize={T.m1} fill={E.VL}>VL median</text>
            <rect x={PAD.l + 80} y={PAD.t} width={8} height={8} fill={E.VH} opacity={0.78} />
            <text x={PAD.l + 92} y={PAD.t + 8} fontFamily={E.mono} fontSize={T.m1} fill={E.VH}>VH median</text>
            <text x={PAD.l + 168} y={PAD.t + 8} fontFamily={E.mono} fontSize={T.m1} fill={E.text3}>Spread (VL − VH)</text>
          </g>
        </svg>
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
    <section style={s({ position: 'relative' })}>
      <div style={s({ height: 50, background: E.bg1, display: 'flex', alignItems: 'baseline', gap: SP._11, padding: `0 ${SP._29}px` })}>
        <span style={s({ fontFamily: E.mono, fontSize: T.m2, lineHeight: 1.45, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.text2, fontWeight: 400 })}>Sectors · Archetypes · Companies</span>
      </div>
      <div style={s({ position: 'relative', overflow: 'hidden', background: E.bg0 })}>
        <div style={s({ filter: 'blur(7px)', opacity: 0.38, userSelect: 'none', pointerEvents: 'none', padding: `${SP._18}px ${SP._29}px` })}>
          <div style={s({ fontFamily: E.mono, fontSize: T.m1, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.text3, marginBottom: SP._11 })}>11 · Sectors</div>
          <div style={s({ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: SP._7, marginBottom: SP._18 })}>
            {sectorData.map(sec => (
              <div key={sec.name} style={s({ background: E.bg1, padding: `${SP._11}px` })}>
                <div style={s({ fontFamily: E.mono, fontSize: T.m1, color: E.text3, marginBottom: SP._7 })}>{sec.name}</div>
                <div style={s({ display: 'flex', justifyContent: 'space-between', marginBottom: SP._4 })}>
                  <span style={s({ fontFamily: E.mono, fontSize: T.m1, color: E.VL })}>VL {sec.vl}%</span>
                  <span style={s({ fontFamily: E.mono, fontSize: T.m1, color: E.VH })}>VH {sec.vh}%</span>
                </div>
                <div style={s({ height: 3, background: alpha(E.limbus, 0.14) })} />
              </div>
            ))}
          </div>
          <div style={s({ fontFamily: E.mono, fontSize: T.m1, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.text3, marginBottom: SP._11 })}>18 · Structural Archetypes</div>
          <div style={s({ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: SP._4, marginBottom: SP._18 })}>
            {Array.from({ length: 18 }, (_, i) => <div key={i} style={s({ height: 36, background: E.bg1 })} />)}
          </div>
          <div style={s({ fontFamily: E.mono, fontSize: T.m1, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.text3, marginBottom: SP._11 })}>29 · Individual Companies · 7-year history</div>
          <div style={s({ display: 'flex', flexDirection: 'column', gap: SP._3 })}>
            {Array.from({ length: 7 }, (_, i) => <div key={i} style={s({ height: 36, background: E.bg1 })} />)}
          </div>
        </div>
        <div style={s({ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: SP._11 })}>
          <div style={s({ textAlign: 'center' as const })}>
            <div style={s({ fontFamily: E.sans, fontSize: T.s4, fontWeight: 700, color: E.text1, marginBottom: SP._4, lineHeight: 1.2, letterSpacing: '-0.01em' })}>Sectors. Archetypes. Companies.</div>
            <div style={s({ fontFamily: E.sans, fontSize: T.s2, lineHeight: 1.62, color: E.text2, marginBottom: SP._29 })}>Each company&apos;s seven-year operational history. Anchor by anchor, axis by axis.</div>
            <a href="/platform/subscribe" style={s({ display: 'inline-block', fontFamily: E.mono, fontSize: T.m1, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' as const, padding: `${SP._11}px ${SP._29}px`, background: E.text1, color: E.bg0, textDecoration: 'none' })}>
              Open full access →
            </a>
          </div>
          {/* PRICING FIX (LOCKED 2026-04-19, 2026-04-26): $159 → $249/month */}
          <div style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, color: E.text3 })}>$249 / month · Cancel anytime</div>
        </div>
      </div>
    </section>
  )
}

// ─── Main platform page ───────────────────────────────────────────────────────

export default function PlatformPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const isPaid = !!(isSignedIn && user?.publicMetadata?.subscription === 'active')
  const isPaidRef = useRef(isPaid)
  useEffect(() => { isPaidRef.current = isPaid }, [isPaid])

  const [selectedBand,  setSelectedBand]  = useState<Band[]>(['all'])
  const [selectedOal,   setSelectedOal]   = useState<OALKey[]>(['all'])
  const [activeLevel,   setActiveLevel]   = useState(1)
  const [regimeSummary, setRegimeSummary] = useState<RegimeSummary | null>(null)
  const [derivedNodes,  setDerivedNodes]  = useState<Node[]>([])
  const [vizReady,      setVizReady]      = useState(false)

  const selectedBandRef  = useRef<Band[]>(['all'])
  const selectedOalRef   = useRef<OALKey[]>(['all'])
  const nodesRef         = useRef<Node[]>([])
  const d3ReadyRef       = useRef(false)
  const fieldSvgRef      = useRef<SVGSVGElement | null>(null)
  const gfSvgRef         = useRef<SVGSVGElement | null>(null)
  const containerRef     = useRef<HTMLDivElement | null>(null)
  const evBandRef        = useRef<HTMLDivElement | null>(null)
  const oalRungRef       = useRef<HTMLDivElement | null>(null)
  const regimeFetchRef   = useRef<Promise<RegimeSummary | null> | null>(null)

  function refreshNodes() {
    const oal  = selectedOalRef.current
    const band = selectedBandRef.current
    const filterActive = !oal.includes('all') || !band.includes('all')
    const svg = fieldSvgRef.current
    if (!svg) return

    if (filterActive) {
      svg.classList.add('filter-active')
      svg.querySelectorAll('.filter-match').forEach(el => el.classList.remove('filter-match'))
      const oalOk  = oal.includes('all')  ? null : oal.map(o => `[data-oal="${o}"]`).join(',')
      const bandOk = band.includes('all') ? null : band.map(b => `[data-evband="${b}"]`).join(',')
      const sel = [oalOk, bandOk].filter(Boolean).join('')
      if (sel) {
        sel.split(',').flatMap(seg => [`.fn-wrap${seg.trim()}`]).forEach(seg => {
          try { svg.querySelectorAll(seg).forEach(el => el.classList.add('filter-match')) } catch (e) {}
        })
      }
    } else {
      svg.classList.remove('filter-active')
      svg.querySelectorAll('.filter-match').forEach(el => el.classList.remove('filter-match'))
    }
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

    async function initViz() {
      if (d3ReadyRef.current) { setVizReady(true); return }
      d3ReadyRef.current = true

      try {
        const d3 = (window as any).d3
        if (!d3) { console.error('[TCS] D3 not available'); return }

        // Section 1 v2.0 — fetch both snapshots in parallel.
        // osmr_snapshot.json    — node identity, bucket, axes, EV, OAL, evBand
        // persistence_snapshot.json — radial coordinate input + bucket_share_current
        // If persistence is unavailable, default persistenceT = 0.5 per node (mid-habitat).
        // Render does not block on persistence failure.
        const [snapRes, persRes] = await Promise.all([
          fetch(`${DATA_BASE}/data/osmr_snapshot.json`).catch(() => null),
          fetch(`${DATA_BASE}/data/persistence_snapshot.json`).catch(() => null),
        ])
        if (!snapRes?.ok) { console.error('[TCS] osmr_snapshot.json unavailable'); return }
        const snapData: any[] = await snapRes.json().catch(() => [])

        // Persistence map keyed by symbol. Tolerates two emit shapes:
        //   1. Flat array: [{ symbol, persistence_months, ... }, ...]
        //   2. Object form: { schema_version, ..., companies: { SYM: { ... } } }
        // Build delivered (2) on 2026-04-28; handoff doc described (1). Tolerating both.
        const persMap = new Map<string, PersistenceRecord>()
        if (persRes?.ok) {
          const persRaw: any = await persRes.json().catch(() => null)
          if (persRaw) {
            if (Array.isArray(persRaw)) {
              for (const p of persRaw) {
                if (p?.symbol) persMap.set(p.symbol, p as PersistenceRecord)
              }
            } else if (persRaw.companies && typeof persRaw.companies === 'object') {
              for (const [sym, rec] of Object.entries(persRaw.companies)) {
                persMap.set(sym, rec as PersistenceRecord)
              }
            }
          }
        }

        const nodes: Node[] = snapData
          .filter(d => d.axis1 != null && d.axis2 != null)
          .map(d => ({
            id:       d.id ?? d.symbol,
            symbol:   d.symbol,
            composite: typeof d.composite === 'number' && d.composite <= 1
                         ? d.composite * 100
                         : (d.composite ?? 0),
            pctRank:  d.pctRank ?? 0,
            bucket:   d.bucket as Node['bucket'],
            axis1:    d.axis1,
            axis2:    d.axis2,
            axis1Pct: d.axis1,
            axis2Pct: d.axis2,
            ev:       d.ev ?? 0,
            oal:      (d.oal ?? 'FCF') as Node['oal'],
            evBand:   d.evBand ?? 0,
            x:        0,
            y:        0,
          }))

        nodesRef.current = nodes
        setDerivedNodes([...nodes])

        const fieldEl = fieldSvgRef.current
        if (!fieldEl) { console.error('[TCS] Field SVG ref null'); return }

        // Section 1 v2.0 panel dimensions — read from rendered SVG element.
        const SW = fieldEl.clientWidth  || 700
        const SH = fieldEl.clientHeight || 440

        d3.select(fieldEl)
          .attr('width',  SW)
          .attr('height', SH)

        // Group nodes by bucket — used by per-habitat placement loop below.
        const byBucket: Record<string, Node[]> = { 'Very Low': [], 'Low': [], 'Moderate': [], 'High': [], 'Very High': [] }
        nodesRef.current.forEach(n => { byBucket[n.bucket]?.push(n) })

        // EV percentile bounds for size encoding
        const evSorted = [...nodesRef.current].map(n => n.ev).sort((a, b) => a - b)
        const evLo = evSorted[Math.floor(evSorted.length * 0.03)]
        const evHi = evSorted[Math.floor(evSorted.length * 0.97)]

        // Section 1 v2.0 — persistence-radius + ticker-hash-angle placement.
        // LOCKED 2026-04-28. Encoding Doctrine Brief 350be5a0-6e23-8196-a9cc-d5cef12a7727.
        //
        // Each company's coordinate means something:
        //   radial position = how settled in current bucket (settled = center)
        //   angular position = ticker hash, no analytical meaning (visual continuity)
        //   habitat region   = bucket assignment (aspect-calibrated centers)
        //   habitat radius   = sqrt(bucket_share_current) — habitats grow with population
        //
        // EV sort + 47% Lucas phase aperture preserved unchanged from earlier locks.
        const placed: Array<Node & { phaseDelay: number; cx: number; cy: number }> = []

        // Build live bucket-share map from persistence data (one share per bucket).
        // If persistence is unavailable, fall back to HABITAT_SHARE constants
        // (2026-03 snapshot). The auto-fit BASE is derived once from this map.
        const liveShares: Record<string, number> = { ...HABITAT_SHARE }
        for (const [bucketName] of Object.entries(HABITAT_CENTERS)) {
          const list = byBucket[bucketName] ?? []
          for (const n of list) {
            const p = persMap.get(n.symbol)
            if (p?.bucket_share_current != null) {
              liveShares[bucketName] = p.bucket_share_current
              break
            }
          }
        }

        NEIGHBORHOODS.forEach((nb) => {
          const bucketKey = nb.id === 'VL' ? 'Very Low' : nb.id === 'L' ? 'Low' : nb.id === 'M' ? 'Moderate' : nb.id === 'H' ? 'High' : 'Very High'
          const list = byBucket[bucketKey] ?? []
          const center = HABITAT_CENTERS[bucketKey]

          // Auto-fit habitat radius — BASE derived from panel dimensions and
          // habitat centers in the helper, no hardcoded magnitude tunable.
          const hR = habitatRadiusAutoFit(bucketKey, SW, SH, HABITAT_CENTERS, liveShares)

          const placedInBucket = list.map(n => {
            const pers = persMap.get(n.symbol)

            // Radial coordinate: within-bucket percentile rank of persistence.
            // LOCKED 2026-04-28 (supersedes Option Three months/24 encoding).
            //
            // Doctrine: "settled" means settled relative to this bucket's cohort,
            // not relative to an absolute 24-month scale. A 7-month tenure means
            // something different in VH (median 17mo) than in Moderate (median 7mo).
            // persistence_pct directly encodes within-cohort settledness; the eye
            // reads radial position as "where this company sits in its bucket's
            // distribution," which is what the encoding should say.
            //
            // Side effect: the visible ring artifact at integer-month radii
            // dissolves because percentile rank is essentially continuous (one
            // distinct value per ticker), no two companies share a radius.
            //
            // Inverted radial: settled (high pct) → center, recent (low pct) → edge.
            // No persistence data → 0.5 (mid-habitat) per fallback policy.
            const persistenceT   = pers ? pers.persistence_pct : 0.5
            const radialFraction = 1 - persistenceT
            const radius         = radialFraction * hR

            // Seeded-stable angle from ticker hash. Same value every render.
            const angle = tickerHash(n.symbol) * 2 * Math.PI

            const rawX = center.cx * SW + radius * Math.cos(angle)
            const rawY = center.cy * SH + radius * Math.sin(angle)

            // Hard clamp accounting for node radius — node circumference must not
            // breach 8px panel padding. Should rarely fire given habitat sizing.
            const nodeR = nodeRadius(n.ev ?? evLo, evLo, evHi)
            const x = Math.max(8 + nodeR, Math.min(SW - 8 - nodeR, rawX))
            const y = Math.max(8 + nodeR, Math.min(SH - 8 - nodeR, rawY))
            return { ...n, cx: x, cy: y, phaseDelay: 0 }
          })

          // EV sort + 47% Lucas phase aperture preserved from earlier architecture pass.
          // Heavier names lead the cycle; phase delay distributes pulse across bucket.
          placedInBucket.sort((a, b) => b.ev - a.ev)
          const denom = Math.max(1, placedInBucket.length - 1)
          placedInBucket.forEach((d, rank) => {
            d.phaseDelay = -((rank / denom) * (nb.period * PHASE_APERTURE))
          })

          placed.push(...placedInBucket)
        })

        // Decorative habitat labels — limbus-opacity, M1 doctrine, no pointer events.
        // Orientation only, not interactive.
        Object.entries(HABITAT_CENTERS).forEach(([bucket, center]) => {
          d3.select(fieldEl).append('text')
            .attr('x', center.cx * SW)
            .attr('y', center.cy * SH - 14)
            .attr('text-anchor', 'middle')
            .attr('font-family', "'IBM Plex Mono','Courier New',monospace")
            .attr('font-size', 11)
            .attr('fill', bucketColor(bucket))
            .attr('fill-opacity', 0.30)
            .attr('letter-spacing', '0.12em')
            .attr('pointer-events', 'none')
            .text(HABITAT_LABELS[bucket] ?? '')
        })

        // Render nodes — group per node, circle inside.
        // Animation class and animation-delay are applied to the <circle>, NOT the <g>.
        // Reason: SVG opacity animation on <g> elements is browser-inconsistent
        // (Safari particularly ignores it). Animating <circle> opacity is reliable.
        const fnGroups = d3.select(fieldEl).selectAll('.fn-wrap')
          .data(placed, (d: any) => d.id)
          .join('g')
          .attr('class', 'fn-wrap')
          .attr('data-id',     (d: any) => d.id)
          .attr('data-oal',    (d: any) => d.oal)
          .attr('data-evband', (d: any) => String(d.evBand))
          .attr('transform',   (d: any) => `translate(${d.cx},${d.cy})`)

        fnGroups.append('circle')
          .attr('class',  (d: any) => `field-node field-${bucketCSSClass(d.bucket)}`)
          .attr('r',      (d: any) => nodeRadius(d.ev ?? evLo, evLo, evHi))
          .attr('fill',   (d: any) => bucketColor(d.bucket))
          .style('animation-delay', (d: any) => `${d.phaseDelay}ms`)

        // Hover removed (Architecture Pass v1.0, 2026-04-27).
        // At ~700×440px panel resolution with 5,200 nodes packed into 5 neighborhoods,
        // individual node hover targets are sub-pixel. The platform reasons at the level
        // of structural condition, not individual ticker — the neighborhood is the unit
        // of analysis at this descent level. Direct node interaction will return at
        // paid-tier Sectors/Archetypes/Companies sections where resolution permits it.

      } finally {
        setVizReady(true)
      }
    }

    function runInit() { setTimeout(initViz, 50) }
    if ((window as any).d3) { runInit(); return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js'
    script.onload = runInit
    document.head.appendChild(script)
  }, [isLoaded, isSignedIn])

  if (!isLoaded) return (
    <div style={s({ minHeight: '100vh', background: E.bg0 })}>
      <div style={s({ filter: 'blur(8px)', opacity: 0.35, height: '100vh', overflow: 'hidden' })}><PlatformPreview /></div>
    </div>
  )
  if (!isSignedIn) return (
    <div style={s({ minHeight: '100vh', background: E.bg0, overflow: 'hidden', position: 'relative' })}>
      <div style={s({ filter: 'blur(10px)', opacity: 0.45, height: '100vh', overflow: 'hidden', pointerEvents: 'none' })}><PlatformPreview /></div>
      <AuthModal />
    </div>
  )

  return (
    <div style={s({ minHeight: '100vh', background: E.bg0, color: E.text1, fontFamily: E.sans })} ref={containerRef}>
      <style>{`
        /* Type clamp at root — typography degrades slower than layout */
        html { font-size: clamp(13px, 0.94rem, 16px); }

        /* ─── ANIMATION DECLARATIONS — CONSOLIDATED, LONGHAND ─────────────────
           All animation rules use longhand (animation-name, animation-duration,
           animation-timing-function, animation-iteration-count) so that inline
           animation-delay set by D3 layers cleanly without resetting the shorthand.
           ─────────────────────────────────────────────────────────────────────── */

        /* Field neighborhood pulsation — April 26 brief: 1000/2000/3000/4000/7000ms.
           Per-node animation-delay applied inline applies the 47% Lucas phase aperture.
           CRITICAL: Animation targets <circle class="field-node field-{x}"> directly,
           and uses fill-opacity (not opacity) — fill-opacity is an SVG presentation
           attribute that animates reliably across all browsers without conflicting
           with the parent <g> opacity or the XML opacity attribute. */
        @keyframes field-vh  { 0%,100% { fill-opacity: .92 } 50% { fill-opacity: .58 } }
        @keyframes field-h   { 0%,100% { fill-opacity: .75 } 50% { fill-opacity: .50 } }
        @keyframes field-mod { 0%,100% { fill-opacity: .58 } 50% { fill-opacity: .46 } }
        @keyframes field-lo  { 0%,100% { fill-opacity: .50 } 50% { fill-opacity: .42 } }
        @keyframes field-vl  { 0%,100% { fill-opacity: .42 } 50% { fill-opacity: .36 } }

        circle.field-node { /* base — animation applied via bucket class below */ }
        circle.field-vh  {
          animation-name: field-vh;
          animation-duration: 302ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        circle.field-h   {
          animation-name: field-h;
          animation-duration: 488ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        circle.field-mod {
          animation-name: field-mod;
          animation-duration: 789ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        circle.field-lo  {
          animation-name: field-lo;
          animation-duration: 971ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        circle.field-vl  {
          animation-name: field-vl;
          animation-duration: 1277ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        /* Field filter — only interaction model now (hover removed Architecture Pass v1.0).
           Filter dimming applies to the <g> wrapper; matched nodes inherit normal animation. */
        .filter-active .fn-wrap { opacity: 0.10 !important; }
        .filter-active .fn-wrap.filter-match { opacity: 1 !important; }

        /* Return Field curves — BPM cardiac cadence on the <path>, not the <g>.
           Uses stroke-opacity (SVG presentation attribute) for reliable cross-browser
           animation. Same principle as fill-opacity on field circles. */
        @keyframes gf-pulse-vh  { 0%,100% { stroke-opacity: .96 } 50% { stroke-opacity: .80 } }
        @keyframes gf-pulse-h   { 0%,100% { stroke-opacity: .90 } 50% { stroke-opacity: .70 } }
        @keyframes gf-pulse-mod { 0%,100% { stroke-opacity: .92 } 50% { stroke-opacity: .76 } }
        @keyframes gf-pulse-lo  { 0%,100% { stroke-opacity: .94 } 50% { stroke-opacity: .80 } }
        @keyframes gf-pulse-vl  { 0%,100% { stroke-opacity: .92 } 50% { stroke-opacity: .82 } }
        path.gf-curve-VH {
          animation-name: gf-pulse-vh;
          animation-duration: 302ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        path.gf-curve-H {
          animation-name: gf-pulse-h;
          animation-duration: 488ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        path.gf-curve-M {
          animation-name: gf-pulse-mod;
          animation-duration: 789ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        path.gf-curve-L {
          animation-name: gf-pulse-lo;
          animation-duration: 971ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        path.gf-curve-VL {
          animation-name: gf-pulse-vl;
          animation-duration: 1277ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .gf-curve { transition: opacity 80ms ease; }

        /* Bucket signal lines — 3px top notch on each risk strip card, animated as the
           singular physiological pulse carrier. BPM cardiac cadence (60000/BPM = ms).
           VH uses steps(2,end) for arrhythmic flicker; others ease-in-out.
           Architecture Pass v1.0 (2026-04-27): replaces prior BPM numeral + EKG stroke system.
           The pulse is felt, not narrated. */
        @keyframes bucket-signal-vh { 0%,100% { opacity: 1 } 10% { opacity: .30 } 14% { opacity: 1 } 45% { opacity: .42 } 51% { opacity: 1 } 72% { opacity: .28 } 79% { opacity: .96 } }
        @keyframes bucket-signal-h  { 0%,100% { opacity: 1 } 50% { opacity: .55 } }
        @keyframes bucket-signal-m  { 0%,100% { opacity: 1 } 50% { opacity: .70 } }
        @keyframes bucket-signal-l  { 0%,100% { opacity: 1 } 50% { opacity: .78 } }
        @keyframes bucket-signal-vl { 0%,100% { opacity: 1 } 50% { opacity: .85 } }

        .bucket-signal-vh {
          animation-name: bucket-signal-vh;
          animation-duration: 302ms;
          animation-timing-function: steps(2, end);
          animation-iteration-count: infinite;
        }
        .bucket-signal-h  {
          animation-name: bucket-signal-h;
          animation-duration: 488ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .bucket-signal-mod {
          animation-name: bucket-signal-m;
          animation-duration: 789ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .bucket-signal-lo  {
          animation-name: bucket-signal-l;
          animation-duration: 971ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .bucket-signal-vl  {
          animation-name: bucket-signal-vl;
          animation-duration: 1277ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        /* Reduced motion contract — severity preserved through luminance, hue, hierarchy.
           animation-delay also neutralized so phase-shifted nodes resolve to static state. */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            animation-delay: 0ms !important;
            transition-duration: 0.001ms !important;
          }
          circle.field-vl  { fill-opacity: .42 !important }
          circle.field-lo  { fill-opacity: .50 !important }
          circle.field-mod { fill-opacity: .58 !important }
          circle.field-h   { fill-opacity: .75 !important }
          circle.field-vh  { fill-opacity: .92 !important }
        }
      `}</style>

      {/* Chrome — bg0, spacing-first separation. Only active controls lift. */}
      <nav style={s({ height: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `0 ${SP._29}px`, background: E.bg0, position: 'sticky', top: 0, zIndex: 40 })}>
        <a href="/" style={s({ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: SP._7 })}>
          <span style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.text3 })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: T.s4, lineHeight: 1.0, color: E.text1 })}>Steward</span>
        </a>
        <div style={s({ display: 'flex', alignItems: 'center', gap: SP._11 })}>
          <div style={s({ width: 7, height: 7, borderRadius: '50%', background: E.VL })} />
          <span style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.text3 })}>Live · Apr 2026</span>
          {!isPaid && <a href="/platform/subscribe" style={s({ fontFamily: E.mono, fontSize: T.m1, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, padding: `${SP._7}px ${SP._11}px`, background: E.bg1, color: E.text1, textDecoration: 'none' })}>Upgrade</a>}
        </div>
      </nav>

      {/* Breadcrumbs — bg0, M5/29 numerals + M1/12 sub labels */}
      <div style={s({ display: 'flex', alignItems: 'center', gap: SP._29, background: E.bg0, padding: `${SP._11}px ${SP._29}px ${SP._18}px`, overflow: 'auto', position: 'sticky', top: 56, zIndex: 39 })}>
        {DESCENT_LEVELS.map((level) => {
          const isActive = level.n === activeLevel
          return (
            <button key={level.n} onClick={() => handleBreadcrumbClick(level)} style={s({ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, minWidth: 96, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 })}>
              <span style={s({ fontFamily: E.mono, fontSize: T.m5, lineHeight: 1.3, letterSpacing: '0.04em', color: isActive ? E.text1 : E.limbus, fontWeight: isActive ? 700 : 400 })}>{level.n}</span>
              <span style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: isActive ? E.text1 : E.text3 })}>{level.label}</span>
              {level.paid && !isPaid && <span style={s({ fontFamily: E.mono, fontSize: T.m1, color: E.limbus, letterSpacing: '0.10em' })}>PAID</span>}
            </button>
          )
        })}
      </div>

      {/*
        FILTER RELOCATION (Free Tier Architecture Pass v1.0, 2026-04-27):
        Anchor Levels filter now lives in Section 3, EV Bands filter now lives in Section 4.
        Top chrome reduces to: brand · live · breadcrumb · upgrade. No filter strip here.
        ARCHITECTURE PRINCIPLE: local control, global organismic response —
        filters housed in native semantic sections, reactivity propagates globally
        (Section 1 field dims by data-oal/data-evband, Return Field curves respond).
      */}

      {/* Section 1 orientation — S2/16 sans body, max-width 780px */}
      <div style={s({ padding: `0 ${SP._29}px ${SP._29}px`, background: E.bg0, fontFamily: E.sans, fontSize: T.s2, lineHeight: 1.62, color: E.text2, maxWidth: 780 })}>
        <b style={s({ color: E.VH, fontWeight: 700 })}>9.4% of companies. 38.6% of catastrophic losses.</b><br />
        Left: every U.S. equity organized into structural neighborhoods. Right: the return each neighborhood has produced.{' '}
        <span style={s({ color: E.text3 })}>Neighbors share a condition, not a sector — and the cost shows up in returns. Distance from center = how settled within this condition.</span>
      </div>

      {/* Panel headers — bg1 soft strip, no bottom border */}
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', background: E.bg1, padding: `${SP._4}px 0 ${SP._3}px` })}>
        <div style={s({ padding: `${SP._18}px ${SP._29}px ${SP._11}px` })}>
          <span style={s({ display: 'block', fontFamily: E.mono, fontSize: T.m2, lineHeight: 1.45, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.limbus, marginBottom: SP._4 })}>Structural Field</span>
          <span style={s({ fontFamily: E.sans, fontSize: T.s1, lineHeight: 1.55, color: E.text3 })}>The full equity universe, organized into structural neighborhoods.</span>
        </div>
        <div style={s({ padding: `${SP._18}px ${SP._29}px ${SP._11}px` })}>
          <span style={s({ display: 'block', fontFamily: E.mono, fontSize: T.m2, lineHeight: 1.45, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.limbus, marginBottom: SP._4 })}>Return Field</span>
          <span style={s({ fontFamily: E.sans, fontSize: T.s1, lineHeight: 1.55, color: E.text3 })}>Realized 12-month forward return by structural bucket.</span>
        </div>
      </div>

      {/* Section 1: Dual panels — Structural Field (neighborhoods) + Return Field */}
      <div style={s({ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', height: 440, background: E.bg0 })}>
        <div style={s({ borderRight: `1px solid ${alpha(E.limbus, 0.30)}`, background: E.bg0, overflow: 'hidden' })}>
          <svg ref={fieldSvgRef} style={s({ display: 'block', width: '100%', height: '100%' })} />
        </div>
        <div style={s({ background: E.bg0, overflow: 'hidden' })}>
          <ReturnFieldPanel
            selectedBand={selectedBand}
            selectedOal={selectedOal}
            svgRef={gfSvgRef}
          />
        </div>

        {!vizReady && (
          <div style={s({ position: 'absolute', inset: 0, background: E.bg0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5 })}>
            <div style={s({ display: 'flex', alignItems: 'center', gap: SP._4, marginBottom: SP._18 })}>
              {BUCKET_ORDER.map((b, i) => {
                const cls  = bucketCSSClass(b)
                return <div key={b} className={`field-${cls}`} style={s({ width: 7, height: 7, borderRadius: '50%', background: bucketColor(b), animationDelay: `${-i * 80}ms` })} />
              })}
            </div>
            <div style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, color: E.text3, letterSpacing: '0.14em' })}>Mapping structural habitats · ~5,200 equities</div>
          </div>
        )}
      </div>

      {/* Risk strip — Section 1 legend.
          Architecture Pass v1.0 (2026-04-27): BPM numerals and EKG strokes removed.
          Pulse is felt, not narrated — the 3px top signal line is the singular pulse carrier.
          Each card carries: bucket name + severe loss rate (top row),
          structural state at S3/20 sans (focal),
          framework explanation at S1/13 sans (calm).
          Card height retained at 198px — quiet diagnostic shelf, not compressed tile. */}
      <div style={s({ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: SP._11, padding: `${SP._18}px ${SP._29}px ${SP._29}px`, background: E.bg0 })}>
        {BUCKET_ORDER.map((b) => {
          const isVH = b === 'Very High'
          const col = bucketColor(b)
          const cls = bucketCSSClass(b)
          const desc: Record<string, string> = {
            'Very Low':  'Grounded',
            'Low':       'Stable',
            'Moderate':  'Mixed',
            'High':      'Stretched',
            'Very High': 'Detached',
          }
          const sub: Record<string, string> = {
            'Very Low':  'Anchor intact, valuation aligned',
            'Low':       'Mild detachment, no degradation',
            'Moderate':  'Either axis stretched',
            'High':      'Detachment without degradation',
            'Very High': 'Valuation distance and anchor erosion',
          }
          const loss: Record<string, string> = {
            'Very Low': '10.5%', 'Low': '14.0%', 'Moderate': '19.0%', 'High': '28.0%', 'Very High': '39.6%',
          }
          return (
            <div key={b} style={s({
              minHeight: 198,
              padding: `${SP._18}px`,
              background: `linear-gradient(180deg, ${alpha(col, 0.06)}, ${alpha(E.bg2, 0.94)} 38%, ${alpha(E.bg1, 0.92)})`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: isVH ? `0 0 34px ${alpha(col, 0.20)}` : 'none',
            })}>
              {/* 3px animated physiological signal line — singular pulse carrier */}
              <div className={`bucket-signal-${cls}`} style={s({ position: 'absolute', left: 0, top: 0, height: 3, width: '100%', background: col })} />

              {/* Top row: bucket label + severe loss rate */}
              <div style={s({ display: 'flex', justifyContent: 'space-between', gap: SP._7, fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginTop: SP._11 })}>
                <span style={s({ color: col })}>{b}</span>
                <span style={s({ color: E.text3, textAlign: 'right' as const })}>{loss[b]} severe loss</span>
              </div>

              {/* Structural state — S3/20 sans, new emotional focal line.
                  Generous vertical space above and below since BPM/EKG are gone. */}
              <div style={s({
                fontFamily: E.sans,
                fontSize: T.s3,
                lineHeight: 1.2,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: col,
                marginTop: SP._47,
                marginBottom: SP._11,
              })}>
                {desc[b]}
              </div>

              {/* Framework explanation — S1/13 sans, calm */}
              <div style={s({ fontFamily: E.sans, fontSize: T.s1, lineHeight: 1.55, color: E.text2 })}>{sub[b]}</div>
            </div>
          )
        })}
      </div>

      {/* One allowed hard transition: Section 1 (terrain + legend) → Section 2 (regime reasoning) */}
      <div style={s({ height: 1, background: alpha(E.limbus, 0.30) })} />

      <Section2Regimes summary={regimeSummary} />
      {derivedNodes.length > 0 && (
        <Section3AnchorLevels
          nodes={derivedNodes}
          selectedOal={selectedOal}
          onSelectOal={selectOal}
          filterRowRef={(el) => { oalRungRef.current = el }}
        />
      )}
      {derivedNodes.length > 0 && (
        <Section4EVBands
          selectedBand={selectedBand.length === 1 ? selectedBand[0] : 'all'}
          selectedBandList={selectedBand}
          onSelectBand={selectBand}
          filterRowRef={(el) => { evBandRef.current = el }}
        />
      )}
      {!isPaid && <PaidWall />}
      {isPaid && (
        <section>
          <SectionHeader lucas={11} label="Sectors" sub="GICS sector breakdown · Coming in next sprint" />
          <div style={s({ padding: `${SP._29}px ${SP._29}px`, fontFamily: E.sans, fontSize: T.s2, lineHeight: 1.62, color: E.text2 })}>Sector-level structural risk analysis — in development.</div>
        </section>
      )}

      {/* Footer — decorative orientation, limbus permitted */}
      <div style={s({ padding: `${SP._29}px ${SP._29}px`, textAlign: 'center' as const, background: E.bg0 })}>
        <p style={s({ fontFamily: E.mono, fontSize: T.m1, lineHeight: 1.45, letterSpacing: '0.13em', textTransform: 'uppercase' as const, color: E.limbus })}>© 2026 The Capital Steward, LLC · For informational purposes only · Not investment advice</p>
      </div>
    </div>
  )
}
