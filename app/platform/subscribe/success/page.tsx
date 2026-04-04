'use client'

// File: app/platform/subscribe/success/page.tsx
// Lucas aesthetic philosophy applied:
//   bdr: #272420 (1.26:1) → #666058 (Lucas 3:1 = 3.13:1 on bg)
//   fontWeight: 800 → 700
//   fontSize: 9 → 11 · 13.5 → 18 · 24 → 29
// Copy: locked per Build Brief — Subscribe, Sign-In & Success Pages
//   - "The map is yours." inserted between headline and body
//   - Body copy updated to "Full access is active. The platform opens in {countdown}."
// Route fix: router.push('/platform-beta') → router.push('/platform')

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const E = {
  bg:    "#0E0D0B",
  bg2:   "#131210",
  bdr:   "#666058",  // Lucas 3:1 tier · 3.13:1 on bg (was #272420 at 1.26:1)
  text:  "#EDE9E0",  // 16.03:1 on bg
  body:  "#A89E8E",  //  7.35:1 on bg · Lucas 7
  muted: "#6B6458",  //  3.32:1 on bg · all-caps label use only
  gold:  "#C5A24A",  //  7.99:1 on bg · Lucas 7+
  mono:  "'IBM Plex Mono','Courier New',monospace",
  sans:  "'Syne',system-ui,sans-serif",
  serif: "'Instrument Serif',Georgia,serif",
}

const s = (x: object) => x as React.CSSProperties

export default function SubscribeSuccess() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(4)

  useEffect(() => {
    // Give webhook 3 seconds to fire and update Clerk metadata
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          router.push('/platform')  // route fix: was /platform-beta (deprecated)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <main style={s({
      minHeight: "100vh", background: E.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: E.sans,
    })}>
      <div style={s({ textAlign: "center" as const, maxWidth: 420, padding: "0 24px" })}>

        {/* Gold top border card */}
        <div style={s({
          border: `1px solid ${E.bdr}`,
          borderTop: `2px solid ${E.gold}`,
          background: E.bg2,
          padding: "40px 36px",
        })}>

          {/* Confirmation dot */}
          <div style={s({
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(90,152,112,0.15)",
            border: "1px solid rgba(90,152,112,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
          })}>
            <div style={s({ width: 14, height: 14, borderRadius: "50%", background: "#5A9870" })} />
          </div>

          {/* Status label */}
          <p style={s({
            fontFamily: E.mono, fontSize: 11,
            letterSpacing: "0.22em", textTransform: "uppercase" as const,
            color: E.gold, marginBottom: 18,
          })}>
            Subscription active
          </p>

          {/* Headline — locked: "You're in." stays exactly as written */}
          <h1 style={s({
            fontFamily: E.sans, fontSize: 29, fontWeight: 700,
            color: E.text, letterSpacing: "-0.03em",
            lineHeight: 1.1, marginBottom: 11,
          })}>
            You&apos;re in.
          </h1>

          {/* Second beat — locked copy: "The map is yours." */}
          {/* Serif italic gold — reads as resonance, not subtitle */}
          <p style={s({
            fontFamily: E.serif, fontStyle: "italic",
            fontSize: 18, fontWeight: 400,
            color: E.gold, lineHeight: 1.4,
            marginBottom: 18,
          })}>
            The map is yours.
          </p>

          {/* Body — locked copy */}
          <p style={s({
            fontFamily: E.sans, fontSize: 18, fontWeight: 400,
            lineHeight: 1.75, color: E.body, marginBottom: 29,
          })}>
            Full access is active. The platform opens in {countdown}.
          </p>

          {/* Progress bar */}
          <div style={s({ height: 2, background: E.bdr, borderRadius: 1, overflow: "hidden" })}>
            <div style={s({
              height: 2, background: E.gold,
              transition: "width 1s linear",
              width: `${((4 - countdown) / 4) * 100}%`,
            })} />
          </div>

        </div>
      </div>
    </main>
  )
}