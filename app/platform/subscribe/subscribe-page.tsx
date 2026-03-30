'use client'

// File goes to: app/platform/subscribe/page.tsx
//
// SETUP REQUIRED:
// Add to .env.local:
//   NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_...
//   NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_...
//
// Get these from Stripe Dashboard → Products → Create product → Add pricing

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

const E = {
  bg: "#0E0D0B", bg2: "#131210",
  bdr: "#272420", bdr2: "#33302A",
  text: "#EDE9E0", body: "#A89E8E", muted: "#6B6458", dim: "#3A3530",
  gold: "#C5A24A", gatm: "rgba(197,162,74,0.04)",
  pos: "#5A9870",
  mono: "'IBM Plex Mono','Courier New',monospace",
  sans: "'Syne',system-ui,sans-serif",
  serif: "'Instrument Serif',Georgia,serif",
}

const s = (x: object) => x as React.CSSProperties

const FEATURES = [
  "Full structural market map — ~5,200 equities",
  "Company-level drilldowns and structural profiles",
  "Historical cohort grids — 290K+ observations",
  "Cohort return distribution by structural zone",
  "OAL rung classification and trajectory tracking",
  "Weekly score updates",
  "Monthly structural recalibration",
  "Downloadable monthly structural report",
]

export default function SubscribePage() {
  const { isSignedIn, user } = useUser()
  const isPaid = isSignedIn && user?.publicMetadata?.subscription === 'active'
  const [loading, setLoading] = useState<string | null>(null)
  const [annual, setAnnual] = useState(true)

  if (isPaid) {
    return (
      <div style={s({ minHeight: "100vh", background: E.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: E.sans })}>
        <div style={s({ textAlign: "center" as const })}>
          <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.gold, marginBottom: 14 })}>Active subscriber</p>
          <h1 style={s({ fontSize: 28, fontWeight: 800, color: E.text, letterSpacing: "-0.03em", marginBottom: 12 })}>You already have full access.</h1>
          <Link href="/platform-beta" style={s({ fontFamily: E.sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "12px 24px", background: E.gold, color: "#060504", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 })}>
            Open Platform <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  const handleCheckout = async (priceId: string, label: string) => {
    if (!isSignedIn) {
      window.location.href = '/platform'
      return
    }
    setLoading(label)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (err) {
      console.error(err)
      setLoading(null)
    }
  }

  return (
    <main style={s({ minHeight: "100vh", background: E.bg, color: E.text, fontFamily: E.sans })}>

      {/* Nav */}
      <nav style={s({ height: 52, borderBottom: `1px solid ${E.bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 44px" })}>
        <Link href="/" style={s({ textDecoration: "none", display: "flex", alignItems: "baseline" })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase" as const, color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15, color: E.gold, marginLeft: 6 })}>Steward</span>
        </Link>
        <Link href="/platform" style={s({ fontFamily: E.sans, fontSize: 10.5, fontWeight: 600, color: E.muted, textDecoration: "none" })}>← Back</Link>
      </nav>

      <div style={s({ maxWidth: 860, margin: "0 auto", padding: "64px 44px" })}>

        {/* Header */}
        <div style={s({ marginBottom: 48, maxWidth: 560 })}>
          <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.gold, marginBottom: 12 })}>Subscribe</p>
          <h1 style={s({ fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, color: E.text, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 })}>
            Full structural access.<br />
            <em style={s({ fontStyle: "italic", fontFamily: E.serif, fontWeight: 400, color: E.gold, fontSize: "clamp(30px,4.5vw,46px)" })}>No narrative inflation.</em>
          </h1>
          <p style={s({ fontFamily: E.sans, fontSize: 14, lineHeight: 1.78, color: E.body })}>
            Everything in the free tier, plus company drilldowns, cohort grids, and the full structural picture across ~5,200 U.S. equities.
          </p>
        </div>

        <div style={s({ display: "grid", gridTemplateColumns: "1fr 320px", gap: 4 })}>

          {/* Features */}
          <div style={s({ border: `1px solid ${E.bdr}`, background: E.bg2, padding: "28px" })}>
            <p style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 20 })}>What's included</p>
            <div style={s({ display: "flex", flexDirection: "column", gap: 0 })}>
              {FEATURES.map((f, i) => (
                <div key={f} style={s({ display: "flex", gap: 12, alignItems: "baseline", padding: "11px 0", borderBottom: i < FEATURES.length - 1 ? `1px solid rgba(255,255,255,0.025)` : "none" })}>
                  <Check size={13} style={{ color: E.pos, flexShrink: 0, marginTop: 2 }} />
                  <span style={s({ fontFamily: E.sans, fontSize: 13.5, color: E.body, lineHeight: 1.5 })}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div style={s({ display: "flex", flexDirection: "column", gap: 4 })}>

            {/* Toggle */}
            <div style={s({ border: `1px solid ${E.bdr}`, background: E.bg2, padding: "20px" })}>
              <div style={s({ display: "flex", gap: 2, marginBottom: 20 })}>
                {[{ label: "Monthly", value: false }, { label: "Annual", value: true }].map(({ label, value }) => (
                  <button key={label} onClick={() => setAnnual(value)} style={s({ flex: 1, fontFamily: E.mono, fontSize: 9.5, fontWeight: 500, padding: "8px", background: annual === value ? E.gold : "transparent", color: annual === value ? "#060504" : E.muted, border: `1px solid ${annual === value ? E.gold : E.bdr}`, cursor: "pointer", transition: "all 0.12s" })}>
                    {label}
                    {value && <span style={s({ marginLeft: 6, fontSize: 8 })}>Save $429</span>}
                  </button>
                ))}
              </div>

              <div style={s({ marginBottom: 20 })}>
                <div style={s({ fontFamily: E.mono, fontSize: 36, fontWeight: 500, color: E.text, letterSpacing: "-0.03em", lineHeight: 1 })}>
                  {annual ? "$1,479" : "$159"}
                </div>
                <div style={s({ fontFamily: E.mono, fontSize: 10, color: E.muted, marginTop: 4 })}>
                  {annual ? "per year · billed annually" : "per month · cancel anytime"}
                </div>
                {annual && (
                  <div style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.pos, marginTop: 6 })}>$123.25/month · save $429 vs monthly</div>
                )}
              </div>

              <button
                onClick={() => handleCheckout(
                  annual
                    ? process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID!
                    : process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
                  annual ? 'annual' : 'monthly'
                )}
                disabled={!!loading}
                style={s({ width: "100%", fontFamily: E.sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "14px", background: loading ? E.dim : E.gold, color: "#060504", border: "none", cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 })}>
                {loading ? "Redirecting to Stripe..." : `Subscribe ${annual ? "Annually" : "Monthly"}`}
                {!loading && <ArrowRight size={14} />}
              </button>
            </div>

            {/* Trust notes */}
            <div style={s({ border: `1px solid ${E.bdr}`, background: E.bg2, padding: "16px" })}>
              {[
                "Secure checkout via Stripe",
                "Cancel anytime from your account",
                "No trial required — subscribe when ready",
              ].map((note, i) => (
                <div key={note} style={s({ display: "flex", gap: 10, alignItems: "baseline", padding: "6px 0", borderBottom: i < 2 ? `1px solid rgba(255,255,255,0.025)` : "none" })}>
                  <div style={s({ width: 3, height: 3, borderRadius: "50%", background: E.muted, flexShrink: 0, marginTop: 7 })} />
                  <span style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, lineHeight: 1.5 })}>{note}</span>
                </div>
              ))}
            </div>

            {/* Free tier reminder */}
            <div style={s({ border: `1px solid ${E.bdr}`, background: E.gatm, padding: "16px" })}>
              <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 8 })}>Free tier available</p>
              <p style={s({ fontFamily: E.sans, fontSize: 12.5, color: E.body, lineHeight: 1.65, marginBottom: 10 })}>Access the structural market map and OAL structure at no cost. No credit card required.</p>
              <Link href="/platform" style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, textDecoration: "underline" })}>Continue with free access →</Link>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, marginTop: 28, lineHeight: 1.65 })}>
          For informational purposes only. Not investment advice. Past structural patterns do not guarantee future outcomes.
        </p>
      </div>
    </main>
  )
}
