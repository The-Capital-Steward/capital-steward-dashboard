'use client'

// app/platform/page.tsx
//
// Sprint changes:
//   1. Constellation initial positions: forceNodes now spread from cluster centers
//      (not origin). Eliminates right-edge clipping from simulation explosion.
//   2. Section 2: RegimePanels — redesigned from OAL-composition format to
//      signal-performance format. Shows ICIR, VH/VL loss rates, relative risk,
//      and Spearman r by regime. Data from real backtest (20_regime_signal.json).
//   3. Section 3+: PaidBlur — blurred teaser of deeper descent levels with upgrade CTA.
//   4. Tooltip position: fixed (not absolute) — prevents scroll offset bug.
//   5. current_regime corrected to "expansion" (was synthetic "neutral").

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

interface PositionRecord {
  id: string
  nx: number
  ny: number
}

interface RegimeData {
  id: string
  label: string
  classifier: string         // e.g. ">+10% trailing 12m"
  n_months: number
  spearman_r: number         // composite rank-IC mean
  icir: number               // IC / σ(IC) — signal consistency
  vh_loss_rate: number       // fraction of Very High obs with 12m return < −25%
  vl_loss_rate: number       // fraction of Very Low obs with 12m return < −25%
  universe_loss_rate: number
  rel_risk: number           // vh_loss_rate / vl_loss_rate
  vl_median_fwd: number      // median 12m forward return, Very Low bucket
  vh_median_fwd: number      // median 12m forward return, Very High bucket
  spread: number             // vl_median_fwd − vh_median_fwd
}

interface RegimeSummary {
  regimes: RegimeData[]
  current_regime: string
  unconditional: {
    spearman_r: number
    icir: number
    vh_loss_rate: number
    vl_loss_rate: number
    universe_loss_rate: number
    rel_risk: number
  }
}

type Band   = 'all' | 1 | 2 | 3 | 4 | 5 | 6 | 7
type OALKey = 'all' | 'FCF' | 'NI' | 'EBIT' | 'Revenue'

// ─── Constants ────────────────────────────────────────────────────────────────

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

// OAL rung order: Revenue (shallowest) → FCF (deepest). Locked design decision.
const OAL_RUNGS = [
  { key: 'all' as OALKey,     label: 'All Rungs', sub: undefined },
  { key: 'Revenue' as OALKey, label: 'Revenue',   sub: 'Shallowest' },
  { key: 'EBIT' as OALKey,    label: 'EBIT',      sub: 'Operating' },
  { key: 'NI' as OALKey,      label: 'NI',        sub: 'Net Income' },
  { key: 'FCF' as OALKey,     label: 'FCF',       sub: 'Deepest anchor' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function bucketColor(b: string): string {
  const map: Record<string, string> = {
    'Very Low': E.VL, 'Low': E.L, 'Moderate': E.M, 'High': E.H, 'Very High': E.VH,
  }
  return map[b] ?? E.M
}

function nodeRadius(mc: number): number {
  if (!mc || mc <= 0) return 1.5
  const log = Math.log10(mc)
  return Math.max(1.5, Math.min(6, (log - 8) * 1.4))
}

function fmtEV(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`
  return `$${(v / 1e6).toFixed(0)}M`
}

function makeLCG(seed: number) {
  let s = seed
  return () => { s = (1664525 * s + 1013904223) & 0x7fffffff; return s / 0x7fffffff }
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
    composite: d.composite, bucket: bucketMap.get(d.i)!,
    axis1: d.axis1, axis2: d.axis2,
    ev: d.ev, marketCap: d.mc, oal: d.oal,
    evBand: 0, x: 0, y: 0,
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
            <p style={s({ fontFamily: E.sans, fontSize: 18, lineHeight: 1.75, color: E.body, marginBottom: 18 })}>~5,200 U.S. equities. Two independently validated dimensions of structural risk. Free to explore.</p>
            <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 18 })}>
              {[
                { tier: 'Free', cta: 'Create account', action: () => setMode('signup'), primary: false,
                  features: ['Full constellation map', 'EV band filter', 'OAL rung filter', 'Three regime views'] },
                { tier: 'Full access · $159/mo', cta: 'Open full access', action: () => { window.location.href = '/platform/subscribe' }, primary: true,
                  features: ['Everything free', 'Company drilldowns', 'Cohort grids (285K+ obs)', 'Weekly updates'] },
              ].map(({ tier, cta, action, primary, features }) => (
                <div key={tier} style={s({ border: `1px solid ${primary ? E.bdr3 : E.bdr2}`, background: primary ? 'rgba(197,162,74,0.05)' : 'transparent', padding: '18px' })}>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: primary ? E.gold : E.sec, marginBottom: 11 })}>{tier}</div>
                  <div style={s({ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 11 })}>
                    {features.map(f => <div key={f} style={s({ fontFamily: E.sans, fontSize: 18, color: E.body, lineHeight: 1.4 })}>{f}</div>)}
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
              {PREVIEW_DOTS.map((d, i) => (
                <circle key={i} cx={panel === 0 ? d.cx : d.cx * 0.9 + 20} cy={d.cy} r={d.r} fill={d.fill} opacity={d.opacity} />
              ))}
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section 2: Regime panels ─────────────────────────────────────────────────
//
// Redesign (Option B, approved): shows signal-performance data instead of
// OAL composition. OAL composition is not available per-regime in backtest output.
// Signal-performance data is more actionable and directly from validated backtest.
//
// Key finding communicated: ICIR ≈ −0.76 across all three regimes — the signal
// is equally consistent regardless of macro environment. VH loss rate varies
// (44.8% Expansion, 34% Neutral, 37% Stress) but remains 2–2.5× universe rate.

function RegimePanels({ summary }: { summary: RegimeSummary }) {
  const MAX_LOSS = 0.50  // bar scale ceiling — VH max is 44.8%

  function fmtPct(v: number) { return `${(v * 100).toFixed(0)}%` }
  function fmtR(v: number)   { return v.toFixed(3) }
  function fmtFwd(v: number) {
    const sign = v >= 0 ? '+' : ''
    return `${sign}${(v * 100).toFixed(1)}%`
  }

  return (
    <section>
      {/* Section header */}
      <div style={s({ borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, padding: '7px 18px', display: 'flex', alignItems: 'baseline', gap: 11 })}>
        <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: E.gold })}>3 · Regimes</span>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>OSMR signal by market regime · 2010–2026 · ex ante classifier</span>
      </div>

      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${E.bdr2}` })}>
        {summary.regimes.map((regime, i) => {
          const isCurrent = regime.id === summary.current_regime

          return (
            <div key={regime.id} style={s({
              borderRight: i < 2 ? `1px solid ${E.bdr2}` : 'none',
              background: isCurrent ? '#0C0A08' : E.bg,
              padding: '18px',
            })}>

              {/* Header row: label + NOW badge + n_months */}
              <div style={s({ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 11 })}>
                <div>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: isCurrent ? E.text : E.body, fontWeight: isCurrent ? 700 : 400, marginBottom: 3 })}>
                    {regime.label}
                  </div>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>
                    {regime.classifier}
                  </div>
                </div>
                <div style={s({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 })}>
                  {isCurrent && (
                    <span style={s({ fontFamily: E.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: E.bg, background: E.gold, padding: '2px 7px' })}>
                      NOW
                    </span>
                  )}
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>
                    {regime.n_months} mo
                  </span>
                </div>
              </div>

              {/* ICIR — primary metric, 29px */}
              <div style={s({ marginBottom: 11 })}>
                <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, letterSpacing: '0.12em', marginBottom: 4 })}>
                  ICIR
                </div>
                <div style={s({ fontFamily: E.mono, fontSize: 29, fontWeight: 400, color: isCurrent ? E.text : E.body, lineHeight: 1 })}>
                  {regime.icir.toFixed(2)}
                </div>
                <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, marginTop: 4 })}>
                  Signal consistency · r̄ / σ(r)
                </div>
              </div>

              <div style={s({ height: 1, background: E.bdr2, margin: '11px 0' })} />

              {/* Loss rate comparison bars */}
              <div style={s({ marginBottom: 11 })}>
                <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, letterSpacing: '0.10em', marginBottom: 7 })}>
                  SEVERE LOSS FREQUENCY
                </div>

                {/* VH bar */}
                <div style={s({ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 })}>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.VH, width: 18, flexShrink: 0 })}>VH</span>
                  <div style={s({ flex: 1, height: 4, background: E.bdr3, position: 'relative' })}>
                    <div style={s({ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(regime.vh_loss_rate / MAX_LOSS) * 100}%`, background: E.VH, opacity: 0.75 })} />
                  </div>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.VH, width: 29, textAlign: 'right' as const, flexShrink: 0 })}>{fmtPct(regime.vh_loss_rate)}</span>
                </div>

                {/* Universe bar */}
                <div style={s({ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 })}>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, width: 18, flexShrink: 0 })}>All</span>
                  <div style={s({ flex: 1, height: 4, background: E.bdr3, position: 'relative' })}>
                    <div style={s({ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(regime.universe_loss_rate / MAX_LOSS) * 100}%`, background: E.sec, opacity: 0.45 })} />
                  </div>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, width: 29, textAlign: 'right' as const, flexShrink: 0 })}>{fmtPct(regime.universe_loss_rate)}</span>
                </div>

                {/* VL bar */}
                <div style={s({ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 })}>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.VL, width: 18, flexShrink: 0 })}>VL</span>
                  <div style={s({ flex: 1, height: 4, background: E.bdr3, position: 'relative' })}>
                    <div style={s({ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(regime.vl_loss_rate / MAX_LOSS) * 100}%`, background: E.VL, opacity: 0.75 })} />
                  </div>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.VL, width: 29, textAlign: 'right' as const, flexShrink: 0 })}>{fmtPct(regime.vl_loss_rate)}</span>
                </div>

                <div style={s({ fontFamily: E.mono, fontSize: 11, color: isCurrent ? E.body : E.sec })}>
                  {regime.rel_risk.toFixed(1)}× higher for Very High
                </div>
              </div>

              <div style={s({ height: 1, background: E.bdr2, margin: '11px 0' })} />

              {/* Median forward returns + Spearman r */}
              <div style={s({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' })}>
                <div>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, letterSpacing: '0.10em', marginBottom: 4 })}>
                    MEDIAN 12M FWD
                  </div>
                  <div style={s({ display: 'flex', gap: 11 })}>
                    <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.VL })}>VL {fmtFwd(regime.vl_median_fwd)}</span>
                    <span style={s({ fontFamily: E.mono, fontSize: 11, color: regime.vh_median_fwd < 0 ? E.VH : E.sec })}>VH {fmtFwd(regime.vh_median_fwd)}</span>
                  </div>
                </div>
                <div style={s({ textAlign: 'right' as const })}>
                  <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, marginBottom: 3 })}>r</div>
                  <div style={s({ fontFamily: E.mono, fontSize: 18, color: isCurrent ? E.body : E.sec })}>{fmtR(regime.spearman_r)}</div>
                </div>
              </div>

            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── Section 3+: Paid blur ────────────────────────────────────────────────────

function PaidBlur() {
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
    median: (rng() * 60 + 20).toFixed(1),
  }))

  return (
    <section style={s({ position: 'relative', borderBottom: `1px solid ${E.bdr2}` })}>
      {/* Header — not blurred */}
      <div style={s({ borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, padding: '7px 18px', display: 'flex', alignItems: 'baseline', gap: 11 })}>
        <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: E.bdr3 })}>11 · 18 · 29</span>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.bdr3 })}>Sectors · Archetypes · Companies — Full subscription</span>
      </div>

      {/* Blurred content — deliberately low detail, just shape */}
      <div style={s({ position: 'relative', overflow: 'hidden' })}>
        <div style={s({ filter: 'blur(7px)', opacity: 0.40, userSelect: 'none', pointerEvents: 'none', padding: '18px' })}>
          <div style={s({ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7, marginBottom: 7 })}>
            {sectorData.map(sec => (
              <div key={sec.name} style={s({ background: E.bg2, border: `1px solid ${E.bdr2}`, padding: '11px' })}>
                <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, letterSpacing: '0.08em', marginBottom: 7 })}>{sec.name}</div>
                <div style={s({ display: 'flex', justifyContent: 'space-between', marginBottom: 4 })}>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.VL })}>VL {sec.vl}%</span>
                  <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.VH })}>VH {sec.vh}%</span>
                </div>
                <div style={s({ height: 3, background: E.bdr3, position: 'relative', marginBottom: 4 })}>
                  <div style={s({ position: 'absolute', left: 0, width: `${sec.vl}%`, height: '100%', background: E.VL, opacity: 0.7 })} />
                </div>
                <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>med {sec.median}</div>
              </div>
            ))}
          </div>
          {/* Archetype row teaser */}
          <div style={s({ background: E.bg2, border: `1px solid ${E.bdr2}`, padding: '11px', display: 'flex', gap: 7, alignItems: 'center' })}>
            <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.bdr3, flexShrink: 0 })}>18 Archetypes</span>
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} style={s({ flex: 1, height: 29, background: E.bdr2, opacity: 0.6 })} />
            ))}
          </div>
          {/* Company rows teaser */}
          <div style={s({ marginTop: 7, display: 'flex', flexDirection: 'column', gap: 3 })}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} style={s({ height: 29, background: E.bg2, border: `1px solid ${E.bdr2}`, opacity: 0.5 })} />
            ))}
          </div>
        </div>

        {/* Upgrade CTA — not blurred, centered over the blurred zone */}
        <div style={s({
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 11,
        })}>
          <div style={s({ textAlign: 'center' as const })}>
            <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: E.sec, marginBottom: 7 })}>
              Levels 11 · 18 · 29
            </div>
            <div style={s({ fontFamily: E.sans, fontSize: 18, fontWeight: 700, color: E.text, marginBottom: 4, lineHeight: 1.2 })}>
              Sector breakdown. Structural archetypes.
            </div>
            <div style={s({ fontFamily: E.sans, fontSize: 18, color: E.body, marginBottom: 18 })}>
              Company drilldowns with 7-year operational history.
            </div>
            <a
              href="/platform/subscribe"
              style={s({
                display: 'inline-block',
                fontFamily: E.mono, fontSize: 11, fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                padding: '11px 29px',
                background: E.gold, color: E.bg,
                textDecoration: 'none',
              })}
            >
              Open full access
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PlatformPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const isPaid = !!(isSignedIn && user?.publicMetadata?.subscription === 'active')

  const [selectedBand,  setSelectedBand]  = useState<Band>('all')
  const [selectedOal,   setSelectedOal]   = useState<OALKey>('all')
  const [activeLevel,   setActiveLevel]   = useState(1)
  const [tooltip,       setTooltip]       = useState<{ x: number; y: number; node: Node } | null>(null)
  const [regimeSummary, setRegimeSummary] = useState<RegimeSummary | null>(null)

  const selectedBandRef   = useRef<Band>('all')
  const selectedOalRef    = useRef<OALKey>('all')
  const hoveredIdRef      = useRef<string | null>(null)
  const nodesRef          = useRef<Node[]>([])
  const d3ReadyRef        = useRef(false)
  const conSvgRef         = useRef<SVGSVGElement | null>(null)
  const scatSvgRef        = useRef<SVGSVGElement | null>(null)
  const containerRef      = useRef<HTMLDivElement | null>(null)
  const evBandRef         = useRef<HTMLDivElement | null>(null)
  const oalRungRef        = useRef<HTMLDivElement | null>(null)
  const positionsFetchRef = useRef<Promise<PositionRecord[] | null> | null>(null)
  const regimeFetchRef    = useRef<Promise<RegimeSummary | null> | null>(null)

  function effectiveOpacity(d: Node): number | null {
    const bandOk   = selectedBandRef.current === 'all' || d.evBand === selectedBandRef.current
    const oalOk    = selectedOalRef.current  === 'all' || d.oal    === selectedOalRef.current
    const hoverOk  = hoveredIdRef.current === null || d.id === hoveredIdRef.current
    const filterOk = bandOk && oalOk
    if (!filterOk && !hoverOk) return 0.03
    if (!filterOk) return hoveredIdRef.current !== null && d.id === hoveredIdRef.current ? 0.9 : 0.04
    if (!hoverOk) return 0.13
    if (d.bucket === 'Very High' || d.bucket === 'High') return null
    if (d.bucket === 'Very Low') return 0.90
    if (d.bucket === 'Low')      return 0.78
    return 0.38
  }

  function refreshNodes() {
    if (typeof window === 'undefined' || !(window as any).d3) return
    const d3 = (window as any).d3
    d3.selectAll('.cn,.sn').style('opacity', (d: Node) => effectiveOpacity(d))
  }

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
    if (level.paid && !isPaid) { window.location.href = '/platform/subscribe'; return }
    if (level.n === 1) { resetAll(); return }
    if (level.n === 4) { setActiveLevel(4); oalRungRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return }
    if (level.n === 7) { setActiveLevel(7); evBandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return }
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    // Both fetches fire immediately on auth — parallel, independent of D3
    if (!positionsFetchRef.current) {
      positionsFetchRef.current = fetch('/data/constellation_positions.json')
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<PositionRecord[]> })
        .catch(() => null)
    }
    if (!regimeFetchRef.current) {
      regimeFetchRef.current = fetch('/data/regime_summary.json')
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<RegimeSummary> })
        .catch(() => null)
      regimeFetchRef.current.then(data => { if (data) setRegimeSummary(data) })
    }

    async function initViz() {
      if (d3ReadyRef.current) return
      d3ReadyRef.current = true

      const d3 = (window as any).d3
      const nodes = generateNodes(5200)
      nodesRef.current = nodes

      const container = containerRef.current
      if (!container) return
      const panelW = container.clientWidth / 2
      const panelH = 440

      const centers: Record<string, { x: number; y: number }> = {
        'Very Low':  { x: panelW * 0.15, y: panelH * 0.80 },
        'Low':       { x: panelW * 0.32, y: panelH * 0.64 },
        'Moderate':  { x: panelW * 0.50, y: panelH * 0.48 },
        'High':      { x: panelW * 0.68, y: panelH * 0.32 },
        'Very High': { x: panelW * 0.85, y: panelH * 0.17 },
      }

      const positions = await positionsFetchRef.current

      if (positions && positions.length === nodesRef.current.length) {
        // Fast path: static JSON
        const posMap = new Map(positions.map(p => [p.id, p]))
        nodesRef.current.forEach(n => {
          const p = posMap.get(n.id)
          if (p) {
            n.x = Math.max(4, Math.min(panelW - 4, p.nx * panelW))
            n.y = Math.max(4, Math.min(panelH - 4, p.ny * panelH))
          }
        })
      } else {
        // Fallback: client simulation.
        // FIX: start forceNodes at cluster centers + small jitter, not at origin.
        // Starting at origin caused Very High nodes to explode past panelW right edge
        // before boundary clamping was applied, leaving them outside the SVG viewport.
        const jRng = makeLCG(42)
        const forceNodes = nodesRef.current.map(n => {
          const c = centers[n.bucket]
          return { ...n, x: c.x + (jRng() - 0.5) * 20, y: c.y + (jRng() - 0.5) * 20 }
        })
        const simulation = d3.forceSimulation(forceNodes)
          .force('x',       d3.forceX((d: Node) => centers[d.bucket].x).strength(0.42))
          .force('y',       d3.forceY((d: Node) => centers[d.bucket].y).strength(0.42))
          .force('charge',  d3.forceManyBody().strength(-6))
          .force('collide', d3.forceCollide((d: Node) => nodeRadius(d.marketCap) + 0.8))
          .stop()
        simulation.tick(500)
        forceNodes.forEach((fn: any, i: number) => {
          nodesRef.current[i].x = Math.max(4, Math.min(panelW - 4, fn.x))
          nodesRef.current[i].y = Math.max(4, Math.min(panelH - 4, fn.y))
        })
      }

      // ── Constellation ────────────────────────────────────────────────────────

      const conSvg = d3.select(conSvgRef.current).attr('width', panelW).attr('height', panelH)

      const stars = Array.from({ length: 180 }, (_, i) => ({
        x: (Math.sin(i * 3.7) * 0.5 + 0.5) * panelW,
        y: (Math.cos(i * 2.3) * 0.5 + 0.5) * panelH,
        r: 0.15 + (i % 4) * 0.12, o: 0.02 + (i % 5) * 0.012,
      }))
      conSvg.selectAll('.star').data(stars).join('circle')
        .attr('class', 'star')
        .attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y)
        .attr('r',  (d: any) => d.r).attr('fill', '#EDE9E0').attr('opacity', (d: any) => d.o)

      BUCKET_ORDER.forEach(b => {
        const c = centers[b]; const col = bucketColor(b)
        conSvg.append('ellipse').attr('cx', c.x).attr('cy', c.y).attr('rx', 46).attr('ry', 34)
          .attr('fill', 'none').attr('stroke', col).attr('stroke-width', 0.35)
          .attr('opacity', 0.12).attr('stroke-dasharray', '3,5')
        conSvg.append('text').attr('x', c.x).attr('y', c.y - 38)
          .attr('text-anchor', 'middle').attr('font-family', E.mono)
          .attr('font-size', 11).attr('letter-spacing', '0.14em')
          .attr('fill', col).attr('opacity', 0.40).text(b.toUpperCase())
      })

      const cnGroups = conSvg.selectAll('.cn-wrap').data(nodesRef.current, (d: Node) => d.id)
        .join('g')
        .attr('class', (d: Node) => {
          const b = d.bucket
          const cls = b === 'Very High' ? 'vh' : b === 'High' ? 'h' : b === 'Very Low' ? 'vl' : b === 'Low' ? 'lo' : 'mod'
          return `cn-wrap node-${cls}`
        })
        .attr('transform', (d: Node) => `translate(${d.x},${d.y})`)

      cnGroups.append('circle').attr('class', 'cn').datum((d: any) => d)
        .attr('r', (d: Node) => nodeRadius(d.marketCap))
        .attr('fill', (d: Node) => bucketColor(d.bucket))

      cnGroups
        .on('mouseenter', function(event: MouseEvent, d: Node) {
          hoveredIdRef.current = d.id; refreshNodes()
          setTooltip({ x: event.clientX + 16, y: event.clientY - 14, node: d })
        })
        .on('mousemove', function(event: MouseEvent) {
          setTooltip(prev => prev ? { ...prev, x: event.clientX + 16, y: event.clientY - 14 } : null)
        })
        .on('mouseleave', function() { hoveredIdRef.current = null; refreshNodes(); setTooltip(null) })

      // ── Structural Risk Map ──────────────────────────────────────────────────

      const PAD    = { l: 47, r: 11, t: 11, b: 47 }
      const innerW = panelW - PAD.l - PAD.r
      const innerH = panelH - PAD.t - PAD.b

      const scatSvg = d3.select(scatSvgRef.current).attr('width', panelW).attr('height', panelH)
      const xScale  = d3.scaleLinear().domain([0, 100]).range([0, innerW])
      const yScale  = d3.scaleLinear().domain([0, 100]).range([innerH, 0])
      const chart   = scatSvg.append('g').attr('transform', `translate(${PAD.l},${PAD.t})`)

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

      chart.append('g').attr('transform', `translate(0,${innerH})`).call(xAxis)
        .call((g: any) => {
          g.select('.domain').attr('stroke', '#272420').attr('stroke-width', 0.4)
          g.selectAll('.tick text').attr('fill', E.sec).attr('font-size', 11).attr('font-family', E.mono)
          g.selectAll('.tick line').attr('stroke', '#272420').attr('stroke-width', 0.4)
        })

      chart.append('g').call(yAxis)
        .call((g: any) => {
          g.select('.domain').attr('stroke', '#272420').attr('stroke-width', 0.4)
          g.selectAll('.tick text').attr('fill', E.sec).attr('font-size', 11).attr('font-family', E.mono)
          g.selectAll('.tick line').attr('stroke', '#272420').attr('stroke-width', 0.4)
        })

      chart.append('text').attr('x', innerW / 2).attr('y', innerH + 29)
        .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-family', E.mono)
        .attr('letter-spacing', '0.12em').attr('fill', E.sec).text('ANCHOR DETACHMENT →')

      chart.append('text').attr('transform', 'rotate(-90)').attr('x', -innerH / 2).attr('y', -29)
        .attr('text-anchor', 'middle').attr('font-size', 11).attr('font-family', E.mono)
        .attr('letter-spacing', '0.12em').attr('fill', E.sec).text('ANCHOR DEGRADATION →')

      ;[
        { x: 6,        y: innerH - 6, txt: 'Deep · Stable',        col: E.VL,      a: 'start' },
        { x: innerW-6, y: innerH - 6, txt: 'Stretched · Stable',   col: '#9E8A70', a: 'end' },
        { x: 6,        y: 12,         txt: 'Deep · Degrading',      col: '#9E8A70', a: 'start' },
        { x: innerW-6, y: 12,         txt: 'Stretched · Degrading', col: E.VH,      a: 'end' },
      ].forEach(q => chart.append('text').attr('x', q.x).attr('y', q.y).attr('text-anchor', q.a).attr('font-size', 11).attr('font-family', E.mono).attr('fill', q.col).attr('opacity', 0.35).text(q.txt))

      const snGroups = chart.selectAll('.sn-wrap').data(nodesRef.current, (d: Node) => d.id)
        .join('g')
        .attr('class', (d: Node) => {
          const b = d.bucket
          const cls = b === 'Very High' ? 'vh' : b === 'High' ? 'h' : b === 'Very Low' ? 'vl' : b === 'Low' ? 'lo' : 'mod'
          return `sn-wrap node-${cls}`
        })
        .attr('transform', (d: Node) => `translate(${xScale(d.axis1)},${yScale(d.axis2)})`)

      snGroups.append('circle').attr('class', 'sn').datum((d: any) => d)
        .attr('r', (d: Node) => nodeRadius(d.marketCap))
        .attr('fill', (d: Node) => bucketColor(d.bucket))

      snGroups
        .on('mouseenter', function(event: MouseEvent, d: Node) {
          hoveredIdRef.current = d.id; refreshNodes()
          setTooltip({ x: event.clientX + 16, y: event.clientY - 14, node: d })
        })
        .on('mousemove', function(event: MouseEvent) {
          setTooltip(prev => prev ? { ...prev, x: event.clientX + 16, y: event.clientY - 14 } : null)
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

  const hasFilter = selectedBand !== 'all' || selectedOal !== 'all'

  return (
    <div style={s({ minHeight: '100vh', background: E.bg, color: E.text, fontFamily: E.sans })} ref={containerRef}>

      <style>{`
        @keyframes pulse-vh { 0%,100% { opacity: .88 } 50% { opacity: .28 } }
        @keyframes pulse-h  { 0%,100% { opacity: .84 } 50% { opacity: .48 } }
        .node-vh  { animation: pulse-vh 1.5s ease-in-out infinite; }
        .node-h   { animation: pulse-h  2.7s ease-in-out infinite; }
        .node-vl  { opacity: 0.90; }
        .node-lo  { opacity: 0.78; }
        .node-mod { opacity: 0.38; }
        .cn-wrap, .sn-wrap { cursor: default; }
        .filter-strip-btn { transition: border-color 0.15s, color 0.15s, background 0.15s; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={s({ height: 47, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 18px', borderBottom: `1px solid ${E.bdr2}`, background: E.bg, position: 'sticky', top: 0, zIndex: 40 })}>
        <a href="/" style={s({ textDecoration: 'none', display: 'flex', alignItems: 'baseline' })}>
          <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase' as const, color: E.sec })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: 18, color: E.gold, marginLeft: 7 })}>Steward</span>
        </a>
        <div style={s({ display: 'flex', alignItems: 'center', gap: 7 })}>
          {hasFilter && (
            <button onClick={resetAll} style={s({ fontFamily: E.mono, fontSize: 11, color: E.body, background: 'transparent', border: `1px solid ${E.bdr3}`, padding: '4px 11px', cursor: 'pointer', letterSpacing: '0.06em' })}>Reset ×</button>
          )}
          <div style={s({ width: 7, height: 7, borderRadius: '50%', background: E.VL, opacity: 0.85 })} />
          <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: E.sec })}>Live · Apr 2026</span>
          {!isPaid && (
            <a href="/platform/subscribe" style={s({ fontFamily: E.mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '4px 11px', background: E.gold, color: E.bg, textDecoration: 'none', marginLeft: 4 })}>Upgrade</a>
          )}
        </div>
      </nav>

      {/* ── Breadcrumb ── */}
      <div style={s({ height: 47, borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, display: 'flex', alignItems: 'center', padding: '0 18px', overflowX: 'auto' })}>
        {DESCENT_LEVELS.map((level, i) => {
          const isActive = level.n === activeLevel
          const isFuture = level.n === 3
          const textColor = isActive ? E.gold : level.paid ? E.bdr3 : E.sec
          return (
            <div key={level.n} style={s({ display: 'flex', alignItems: 'center', flexShrink: 0 })}>
              {i > 0 && <div style={s({ width: 18, height: 1, background: E.bdr2, margin: '0 2px', opacity: 0.6 })} />}
              <button
                onClick={() => !isFuture && handleBreadcrumbClick(level)}
                title={isFuture ? 'Coming in next sprint' : level.paid && !isPaid ? 'Paid tier' : undefined}
                style={s({ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 11px', background: 'transparent', border: 'none', cursor: (level.paid && !isPaid) || isFuture ? 'default' : 'pointer', opacity: isFuture ? 0.4 : 1 })}
              >
                <span style={s({ fontFamily: E.mono, fontSize: 18, color: textColor, lineHeight: 1, fontWeight: isActive ? 700 : 400 })}>{level.n}</span>
                <span style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: level.paid ? E.bdr3 : isActive ? E.gold : E.sec, lineHeight: 1.5 })}>{level.label}</span>
                {level.paid && !isPaid && <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.bdr3, letterSpacing: '0.08em' })}>PAID</span>}
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
              fontFamily: E.mono, fontSize: 11, fontWeight: active ? 700 : 400, letterSpacing: '0.06em',
              padding: sub ? '4px 11px 3px' : '4px 11px',
              border: `1px solid ${active ? E.gold : E.bdr3}`,
              background: active ? 'rgba(197,162,74,0.09)' : 'transparent',
              color: active ? E.gold : E.body, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0,
            })}>
              <span>{label}</span>
              {sub && <span style={s({ fontSize: 11, color: active ? E.gold : E.sec })}>{sub}</span>}
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
              fontFamily: E.mono, fontSize: 11, fontWeight: active ? 700 : 400, letterSpacing: '0.06em',
              padding: sub ? '4px 11px 3px' : '4px 11px',
              border: `1px solid ${active ? E.gold : E.bdr3}`,
              background: active ? 'rgba(197,162,74,0.09)' : 'transparent',
              color: active ? E.gold : E.body, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flexShrink: 0,
            })}>
              <span>{label}</span>
              {sub && <span style={s({ fontSize: 11, color: active ? E.gold : E.sec })}>{sub}</span>}
            </button>
          )
        })}
      </div>

      {/* ── Panel headers ── */}
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${E.bdr2}`, background: E.bg2 })}>
        <div style={s({ padding: '7px 18px', borderRight: `1px solid ${E.bdr2}` })}>
          <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: E.body })}>Constellation · Structural neighborhoods</div>
          <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, marginTop: 4 })}>Force-directed · No axes</div>
        </div>
        <div style={s({ padding: '7px 18px' })}>
          <div style={s({ fontFamily: E.mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: E.body })}>Structural Risk Map · Detachment × Degradation</div>
          <div style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec, marginTop: 4 })}>Two-axis · Precise coordinates</div>
        </div>
      </div>

      {/* ── Dual panels ── */}
      <div style={s({ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 440, borderBottom: `1px solid ${E.bdr2}` })}>
        <div style={s({ borderRight: `1px solid ${E.bdr2}`, background: E.bg, overflow: 'hidden' })}>
          <svg ref={conSvgRef} style={s({ display: 'block', width: '100%', height: '100%' })} />
        </div>
        <div style={s({ background: E.bg, overflow: 'hidden' })}>
          <svg ref={scatSvgRef} style={s({ display: 'block', width: '100%', height: '100%' })} />
        </div>
      </div>

      {/* ── Legend strip ── */}
      <div style={s({ borderBottom: `1px solid ${E.bdr2}`, background: E.bg2, padding: '7px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 7 })}>
        <div style={s({ display: 'flex', alignItems: 'center', gap: 18 })}>
          {BUCKET_ORDER.map(b => (
            <div key={b} style={s({ display: 'flex', alignItems: 'center', gap: 4 })}>
              <div style={s({ width: 7, height: 7, borderRadius: '50%', background: bucketColor(b), flexShrink: 0 })} />
              <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.body })}>{b}{b === 'Very High' ? ' ◈' : ''}</span>
            </div>
          ))}
        </div>
        <span style={s({ fontFamily: E.mono, fontSize: 11, color: E.sec })}>
          Node size = market cap · Pulsation = degradation risk · Hover to cross-highlight
        </span>
      </div>

      {/* ── Section 2: Regime panels ── */}
      {regimeSummary && <RegimePanels summary={regimeSummary} />}

      {/* ── Section 3+: Paid blur ── */}
      {!isPaid && <PaidBlur />}

      {/* ── Tooltip — fixed to viewport, not page ── */}
      {tooltip && (
        <div style={s({
          position: 'fixed', left: tooltip.x, top: tooltip.y,
          background: '#0E0C0A', border: `1px solid ${E.bdr3}`, borderTop: `2px solid ${E.gold}`,
          padding: '11px', fontFamily: E.mono, fontSize: 11, color: E.text,
          lineHeight: 1.85, whiteSpace: 'nowrap' as const, zIndex: 50, pointerEvents: 'none',
        })}>
          <div style={s({ color: E.gold, fontSize: 11, marginBottom: 4 })}>{tooltip.node.symbol}</div>
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