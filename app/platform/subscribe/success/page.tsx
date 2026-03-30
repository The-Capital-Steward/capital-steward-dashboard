'use client'

// File goes to: app/platform/subscribe/success/page.tsx
//
// Stripe redirects here after successful checkout.
// We wait briefly for the webhook to fire and update Clerk metadata,
// then redirect to /platform-beta.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const E = {
  bg: "#0E0D0B", bg2: "#131210", bdr: "#272420",
  text: "#EDE9E0", body: "#A89E8E", muted: "#6B6458",
  gold: "#C5A24A",
  mono: "'IBM Plex Mono','Courier New',monospace",
  sans: "'Syne',system-ui,sans-serif",
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
          router.push('/platform-beta')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <main style={s({ minHeight: "100vh", background: E.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: E.sans })}>
      <div style={s({ textAlign: "center" as const, maxWidth: 420, padding: "0 24px" })}>

        {/* Gold top border card */}
        <div style={s({ border: `1px solid ${E.bdr}`, borderTop: `2px solid ${E.gold}`, background: E.bg2, padding: "40px 36px" })}>
          <div style={s({ width: 40, height: 40, borderRadius: "50%", background: "rgba(90,152,112,0.15)", border: "1px solid rgba(90,152,112,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" })}>
            <div style={s({ width: 14, height: 14, borderRadius: "50%", background: "#5A9870" })} />
          </div>

          <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.gold, marginBottom: 12 })}>Subscription active</p>
          <h1 style={s({ fontSize: 24, fontWeight: 800, color: E.text, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 })}>
            You're in.
          </h1>
          <p style={s({ fontFamily: E.sans, fontSize: 13.5, lineHeight: 1.75, color: E.body, marginBottom: 24 })}>
            Full platform access is now active. Opening the platform in {countdown}...
          </p>

          <div style={s({ height: 2, background: E.bdr, borderRadius: 1, overflow: "hidden" })}>
            <div style={s({ height: 2, background: E.gold, transition: "width 1s linear", width: `${((4 - countdown) / 4) * 100}%` })} />
          </div>
        </div>

      </div>
    </main>
  )
}
