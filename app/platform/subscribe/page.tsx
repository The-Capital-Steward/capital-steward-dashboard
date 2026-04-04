'use client'

import { useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import Link from 'next/link'

// ─── Design tokens — P3 public light ─────────────────────────────────────────
const E = {
  bg:     "#E0E6DC",  // C — lighter sage · body 11.52:1 · muted 8.41:1
  bg2:    "#EAEFEA",  // section alt
  bg3:    "#E5EBE2",  // tertiary surface
  bdr:    "#7C8579",  // Lucas 3:1 — graphical elements
  bdr2:   "#687166",  // Lucas 4:1 — structural elements
  text:   "#1A1E1A",  // 13.28:1 on bg
  body:   "#2C2822",  // warm dark neutral — 11.52:1 on bg
  muted:  "#463C38",  // warm medium neutral — 8.41:1 on bg
  sage:   "#38483D",  // 7.64:1 on bg
  brick:  "#8B3A2A",  // decorative / large text only
  brickS: "#5A2519",  // small text AAA — 9.69:1 on bg
  gold:   "#4E3918",  // 8.59:1 on bg
  blue:   "#243B5E",  // 8.87:1 on bg
  mono:   "'IBM Plex Mono','Courier New',monospace",
  sans:   "'DM Sans',system-ui,sans-serif",
  serif:  "'Playfair Display',Georgia,serif",
}
const s = (x: object) => x as React.CSSProperties

// ─── Pricing constants ────────────────────────────────────────────────────────
const MONTHLY_PRICE = 79
const ANNUAL_PRICE  = 59   // per month, billed annually
const ANNUAL_SAVINGS = 429 // vs paying monthly × 12

// ─── Feature list ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    label: 'Company drilldowns',
    desc: 'Full OSMR decomposition for any equity — Anchor Detachment Risk, Anchor Degradation Risk, and the composite score.',
  },
  {
    label: 'Cohort grids',
    desc: 'Historical cohort data showing how structural risk profiles have resolved across 17 years of formation months.',
  },
  {
    label: 'Full snapshot table',
    desc: 'Filterable and sortable view of all ~5,200 scored equities with return data, risk bucket, and anchor rung.',
  },
  {
    label: 'Weekly cadence',
    desc: 'Scores update weekly. The market map, snapshot, and company drilldowns reflect the most recent formation window.',
  },
  {
    label: 'Anchor Structure view',
    desc: 'OAL distribution across the full universe — how companies are distributed across FCF, NI, EBIT, and Revenue anchors.',
  },
  {
    label: 'History panel',
    desc: 'Monthly formation history across the full 2009–2026 backtest period. Examine how the signal has evolved.',
  },
]

const TRUST = [
  'Secure checkout via Stripe',
  'Cancel anytime from your account',
  'No trial required — subscribe when ready.',
]

// ─── Subscribe page ────────────────────────────────────────────────────────────
export default function SubscribePage() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')

  const isPaid = !!(isSignedIn && user?.publicMetadata?.subscription === 'active')

  const price   = billing === 'monthly' ? MONTHLY_PRICE : ANNUAL_PRICE
  const period  = billing === 'monthly' ? '/month' : '/month, billed annually'

  // Already-subscribed state
  if (isPaid) {
    return (
      <div style={s({ minHeight: '100vh', background: E.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' })}>
        <div style={s({ maxWidth: 480, padding: '47px 29px', textAlign: 'center' })}>
          <div style={s({
            fontFamily: E.mono, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: E.sage, marginBottom: 18,
          })}>
            Subscription active
          </div>
          <h1 style={s({
            fontFamily: E.serif, fontSize: 'clamp(29px, 4vw, 47px)',
            fontWeight: 400, lineHeight: 1.2, color: E.text,
            letterSpacing: '-0.02em', marginBottom: 18,
          })}>
            Full access is active.
          </h1>
          <p style={s({ fontFamily: E.sans, fontSize: 18, fontWeight: 400, lineHeight: 1.8, color: E.body, marginBottom: 29 })}>
            Everything the framework produces is available on the platform.
          </p>
          {/* Route fixed: was /platform-beta — now /platform */}
          <Link href="/platform" style={s({
            fontFamily: E.mono, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            background: E.text, color: E.bg, padding: '11px 29px',
            display: 'inline-block', textDecoration: 'none',
          })}>
            Open Platform →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={s({ minHeight: '100vh', background: E.bg })}>

      {/* ── Nav ── */}
      <nav style={s({
        background: E.bg, borderBottom: `1px solid ${E.bdr}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        height: 48, padding: '0 29px',
      })}>
        <div style={s({ display: 'flex', alignItems: 'baseline', gap: 5 })}>
          <span style={s({ fontFamily: E.mono, fontSize: 11, fontWeight: 400, letterSpacing: '0.24em', textTransform: 'uppercase', color: E.muted })}>
            The Capital
          </span>
          <span style={s({ fontFamily: E.serif, fontStyle: 'italic', fontSize: 15, color: E.gold })}>
            Steward
          </span>
        </div>
        <Link href="/sign-in" style={s({
          fontFamily: E.mono, fontSize: 11, fontWeight: 400,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: E.body, textDecoration: 'none',
        })}>
          Sign in →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <div style={s({
        maxWidth: 640, margin: '0 auto',
        padding: '47px 29px 0', textAlign: 'center',
      })}>
        <h1 style={s({
          fontFamily: E.serif, fontWeight: 400,
          fontSize: 'clamp(29px, 4vw, 47px)',
          lineHeight: 1.15, color: E.text,
          letterSpacing: '-0.025em', marginBottom: 7,
        })}>
          The structural map, complete.
        </h1>
        <p style={s({
          fontFamily: E.serif, fontStyle: 'italic',
          fontSize: 'clamp(18px, 2.5vw, 29px)',
          fontWeight: 400, color: E.gold,
          lineHeight: 1.3, marginBottom: 29,
        })}>
          Everything the framework produces.
        </p>
        <p style={s({
          fontFamily: E.sans, fontSize: 18, fontWeight: 400,
          lineHeight: 1.8, color: E.body, marginBottom: 47,
          maxWidth: 560, margin: '0 auto 47px',
        })}>
          The free tier shows you where structural risk is concentrated.
          The full subscription tells you why — company by company,
          anchor rung by anchor rung, against 17 years of validated return data.
        </p>
      </div>

      {/* ── Pricing card ── */}
      <div style={s({ maxWidth: 520, margin: '0 auto', padding: '0 29px 47px' })}>

        {/* Billing toggle */}
        <div style={s({
          display: 'flex', justifyContent: 'center', gap: 4,
          marginBottom: 29,
        })}>
          {(['monthly', 'annual'] as const).map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={s({
                fontFamily: E.mono, fontSize: 11, fontWeight: billing === b ? 700 : 400,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '7px 18px',
                background: billing === b ? E.text : 'transparent',
                color: billing === b ? E.bg : E.body,
                border: `1px solid ${billing === b ? E.text : E.bdr}`,
                cursor: 'pointer',
              })}
            >
              {b === 'monthly' ? 'Monthly' : 'Annual'}
            </button>
          ))}
        </div>

        {/* Annual savings badge */}
        {billing === 'annual' && (
          <div style={s({ textAlign: 'center', marginBottom: 18 })}>
            <span style={s({
              fontFamily: E.mono, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em',
              background: E.sage, color: E.bg,
              padding: '3px 11px',
            })}>
              Save ${ANNUAL_SAVINGS}
            </span>
          </div>
        )}

        {/* Price display */}
        <div style={s({
          textAlign: 'center', marginBottom: 29,
          paddingBottom: 29, borderBottom: `1px solid ${E.bdr}`,
        })}>
          <div style={s({
            fontFamily: E.mono, fontWeight: 400,
            fontSize: 'clamp(29px, 5vw, 47px)',
            color: E.text, letterSpacing: '-0.03em',
            lineHeight: 1, marginBottom: 7,
          })}>
            ${price}
          </div>
          <div style={s({
            fontFamily: E.mono, fontSize: 11, fontWeight: 400,
            color: E.muted, letterSpacing: '0.06em',
          })}>
            {period}
          </div>
        </div>

        {/* Feature list header */}
        <div style={s({
          fontFamily: E.mono, fontSize: 11, fontWeight: 400,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: E.text, marginBottom: 18,
        })}>
          What the subscription adds
        </div>

        {/* Feature list */}
        <div style={s({ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 29 })}>
          {FEATURES.map(f => (
            <div key={f.label} style={s({
              borderLeft: `2px solid ${E.sage}`,
              paddingLeft: 11,
            })}>
              <div style={s({
                fontFamily: E.sans, fontSize: 18, fontWeight: 700,
                color: E.text, marginBottom: 4,
              })}>
                {f.label}
              </div>
              <div style={s({
                fontFamily: E.sans, fontSize: 18, fontWeight: 400,
                color: E.body, lineHeight: 1.65,
              })}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Subscribe CTA */}
        <button style={s({
          width: '100%', padding: '18px 29px',
          background: E.text, color: E.bg,
          fontFamily: E.mono, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          border: 'none', cursor: 'pointer',
          marginBottom: 11,
        })}>
          Subscribe — ${price}{billing === 'monthly' ? '/mo' : '/mo billed annually'} →
        </button>

        {/* Trust notes */}
        <div style={s({ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 29 })}>
          {TRUST.map(t => (
            <div key={t} style={s({
              fontFamily: E.mono, fontSize: 11, fontWeight: 400,
              color: E.muted, letterSpacing: '0.04em', textAlign: 'center',
            })}>
              {t}
            </div>
          ))}
        </div>

        {/* Free tier reminder */}
        <div style={s({
          background: E.bg2, border: `1px solid ${E.bdr}`,
          padding: '18px 18px', textAlign: 'center',
        })}>
          <p style={s({
            fontFamily: E.sans, fontSize: 18, fontWeight: 400,
            color: E.body, lineHeight: 1.75, marginBottom: 11,
          })}>
            The structural market map and OAL rung distribution are available at no cost.
            Subscribe when the full picture matters.
          </p>
          <Link href="/platform" style={s({
            fontFamily: E.mono, fontSize: 11, fontWeight: 400,
            letterSpacing: '0.08em', color: E.body,
            textDecoration: 'none', borderBottom: `1px solid ${E.bdr2}`,
          })}>
            Continue with free access →
          </Link>
        </div>

      </div>

      {/* ── Footer legal ── */}
      <div style={s({
        borderTop: `1px solid ${E.bdr}`,
        padding: '18px 29px',
        textAlign: 'center',
        background: E.bg2,
      })}>
        <span style={s({
          fontFamily: E.mono, fontSize: 11, fontWeight: 400,
          color: E.muted, letterSpacing: '0.04em',
        })}>
          Past results do not guarantee future outcomes.
        </span>
      </div>

    </div>
  )
}