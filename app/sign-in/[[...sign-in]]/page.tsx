'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

// ─── Design tokens — P3 public light ─────────────────────────────────────────
const E = {
  bg:     "#E0E6DC",
  bg2:    "#EAEFEA",
  bg3:    "#E5EBE2",
  bdr:    "#7C8579",  // Lucas 3:1
  bdr2:   "#687166",  // Lucas 4:1
  text:   "#1A1E1A",
  body:   "#2C2822",
  muted:  "#463C38",
  sage:   "#38483D",
  brick:  "#8B3A2A",
  brickS: "#5A2519",
  gold:   "#4E3918",
  blue:   "#243B5E",
  mono:   "'IBM Plex Mono','Courier New',monospace",
  sans:   "'DM Sans',system-ui,sans-serif",
  serif:  "'Playfair Display',Georgia,serif",
}
const s = (x: object) => x as React.CSSProperties

// ─── Stat strip — 7yr anchor figures ─────────────────────────────────────────
// Factor-adjusted alpha updated: +21.0% → +20% (label also renamed per brief)
// Historical observations: 289,737 (unchanged — sign-in page retains this figure)
// Very High loss rate: ~2× (unchanged)
const STATS = [
  { val: '+20%',    label: 'Factor-adjusted alpha',              sub: 't = +3.72'             },
  { val: '289,737', label: 'Historical observations',            sub: '2009–2026'              },
  { val: '~2×',     label: 'Severe loss frequency in flagged stocks', sub: 'vs. universe · all regimes' },
]

// ─── Clerk appearance — matches public palette ────────────────────────────────
const CLERK_APPEARANCE = {
  variables: {
    colorBackground:    '#EAEFEA',
    colorInputBackground: '#E0E6DC',
    colorInputText:     '#1A1E1A',
    colorText:          '#1A1E1A',
    colorTextSecondary: '#2C2822',
    colorPrimary:       '#1A1E1A',
    colorShimmer:       '#E5EBE2',
    fontFamily:         "'IBM Plex Mono','Courier New',monospace",
    borderRadius:       '0px',
    fontSize:           '11px',
  },
  elements: {
    card:             { boxShadow: 'none', border: `1px solid #7C8579`, background: '#EAEFEA' },
    headerTitle:      { display: 'none' },
    headerSubtitle:   { display: 'none' },
    formButtonPrimary: {
      background: '#1A1E1A', color: '#E0E6DC',
      fontFamily: "'IBM Plex Mono','Courier New',monospace",
      fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
      textTransform: 'uppercase', borderRadius: '0px',
      '&:hover': { background: '#38483D' },
    },
    footerActionText: { fontFamily: "'IBM Plex Mono','Courier New',monospace", fontSize: '11px', color: '#463C38' },
    footerActionLink: { fontFamily: "'IBM Plex Mono','Courier New',monospace", fontSize: '11px', color: '#1A1E1A' },
  },
}

// ─── Sign-in page ─────────────────────────────────────────────────────────────
export default function SignInPage() {
  return (
    <div style={s({ minHeight: '100vh', background: E.bg, display: 'flex', flexDirection: 'column' })}>

      {/* ── Nav ── */}
      <nav style={s({
        background: E.bg, borderBottom: `1px solid ${E.bdr}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        height: 48, padding: '0 29px', flexShrink: 0,
      })}>
        <Link href="/" style={s({ display: 'flex', alignItems: 'baseline', gap: 5, textDecoration: 'none' })}>
          <span style={s({ fontFamily: E.mono, fontSize: 11, fontWeight: 400, letterSpacing: '0.24em', textTransform: 'uppercase', color: E.muted })}>
            The Capital
          </span>
          <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: 15, color: E.gold })}>
            Steward
          </span>
        </Link>
        <Link href="/methodology" style={s({
          fontFamily: E.mono, fontSize: 11, fontWeight: 400,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: E.body, textDecoration: 'none',
        })}>
          Examine the Evidence
        </Link>
      </nav>

      {/* ── Two-column body ── */}
      <div style={s({
        flex: 1, display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: 960, width: '100%', margin: '0 auto',
        padding: '0 29px',
      })}>

        {/* ── Left column ── */}
        <div style={s({
          padding: '47px 29px 47px 0',
          borderRight: `1px solid ${E.bdr}`,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
        })}>

          {/* Stat strip */}
          <div style={s({
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 0, marginBottom: 47,
            borderBottom: `1px solid ${E.bdr}`,
            paddingBottom: 29,
          })}>
            {STATS.map((st, i) => (
              <div key={st.label} style={s({
                paddingRight: i < 2 ? 18 : 0,
                borderRight: i < 2 ? `1px solid ${E.bdr}` : 'none',
                paddingLeft: i > 0 ? 18 : 0,
              })}>
                <div style={s({
                  fontFamily: E.mono, fontWeight: 400,
                  fontSize: 29,
                  color: E.text, letterSpacing: '-0.03em',
                  lineHeight: 1, marginBottom: 7,
                })}>
                  {st.val}
                </div>
                <div style={s({
                  fontFamily: E.sans, fontSize: 18, fontWeight: 400,
                  color: E.body, marginBottom: 4, lineHeight: 1.3,
                })}>
                  {st.label}
                </div>
                <div style={s({
                  fontFamily: E.mono, fontSize: 11, fontWeight: 700,
                  color: E.muted, letterSpacing: '0.05em',
                })}>
                  {st.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Headline */}
          <h1 style={s({
            fontFamily: E.serif, fontWeight: 400,
            fontSize: 'clamp(29px, 3.5vw, 47px)',
            lineHeight: 1.15, color: E.text,
            letterSpacing: '-0.025em', marginBottom: 18,
          })}>
            The structural map is live.
          </h1>

          {/* Subhead — updated per brief */}
          <p style={s({
            fontFamily: E.sans, fontSize: 18, fontWeight: 400,
            lineHeight: 1.8, color: E.body, marginBottom: 29,
          })}>
            The map is updated weekly. Everything you were reading about is live.
          </p>

          {/* Free tier note — updated per brief */}
          <div style={s({
            fontFamily: E.mono, fontSize: 11, fontWeight: 400,
            letterSpacing: '0.06em', color: E.muted,
          })}>
            No subscription yet?{' '}
            <Link href="/platform/subscribe" style={s({
              color: E.body,
              borderBottom: `1px solid ${E.bdr2}`,
              textDecoration: 'none',
            })}>
              See what full access adds →
            </Link>
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={s({
          padding: '47px 0 47px 29px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
        })}>

          {/* Sign-in prompt label — updated per brief */}
          <div style={s({
            fontFamily: E.mono, fontSize: 11, fontWeight: 400,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: E.text, marginBottom: 18,
          })}>
            Sign in to open the map.
          </div>

          {/* Clerk component */}
          <SignIn
            appearance={CLERK_APPEARANCE}
            redirectUrl="/platform"
            signUpUrl="/platform/subscribe"
          />
        </div>

      </div>

    </div>
  )
}