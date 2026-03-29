'use client'

// File goes to: app/platform/page.tsx
//
// CLERK SETUP REQUIRED:
// 1. In Clerk Dashboard → Social Connections → enable Google
// 2. For LinkedIn: Clerk Dashboard → Social Connections → LinkedIn (custom OAuth)
//    Requires LinkedIn OAuth App: https://www.linkedin.com/developers/apps
//    Set redirect URI to: https://thecapitalsteward.com/api/auth/callback/linkedin
//
// TIER LOGIC:
// Free users:  Clerk publicMetadata = {} (default)
// Paid users:  Clerk publicMetadata = { subscription: 'active' }
// Set via Clerk Dashboard or your Stripe webhook handler
//
// MIDDLEWARE:
// Add to middleware.ts:
//   export default clerkMiddleware((auth, req) => {
//     if (req.nextUrl.pathname.startsWith('/platform-beta')) auth().protect()
//   })

import { useState, useEffect } from "react"
import { useUser, SignIn, SignUp } from "@clerk/nextjs"
import Link from "next/link"
import { ArrowRight, Lock } from "lucide-react"

const E = {
  bg: "#0E0D0B", bg2: "#131210", bg3: "#181614",
  bdr: "#272420", bdr2: "#33302A",
  text: "#EDE9E0", body: "#A89E8E", muted: "#554E44", dim: "#3A3530",
  gold: "#C5A24A", gatm: "rgba(197,162,74,0.04)",
  pos: "#5A9870", neg: "#B85C4A",
  mono: "'IBM Plex Mono','Courier New',monospace",
  sans: "'Syne',system-ui,sans-serif",
  serif: "'Instrument Serif',Georgia,serif",
}

const s = (x: object) => x as React.CSSProperties

const CLERK_APPEARANCE = {
  variables: {
    colorBackground: '#131210',
    colorPrimary: '#C5A24A',
    colorText: '#EDE9E0',
    colorTextSecondary: '#A89E8E',
    colorTextOnPrimaryBackground: '#060504',
    colorInputBackground: '#0E0D0B',
    colorInputText: '#EDE9E0',
    colorNeutral: '#EDE9E0',
    borderRadius: '0px',
    fontFamily: "'Syne',system-ui,sans-serif",
  },
  elements: {
    card: 'shadow-none bg-transparent',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    formButtonPrimary: 'font-semibold rounded-none',
    socialButtonsBlockButton: 'border-[#272420] rounded-none',
    footerActionLink: 'underline',
    footer: 'bg-transparent',
  },
}

// ─── Simulated platform content (blurred background) ─────────────────────────
function PlatformBackground({ isPaid }: { isPaid: boolean }) {
  return (
    <div style={s({ width: "100%", height: "100%", overflow: "hidden", userSelect: "none", pointerEvents: "none" })}>

      {/* Fake nav */}
      <div style={s({ height: 52, borderBottom: `1px solid ${E.bdr}`, display: "flex", alignItems: "center", padding: "0 32px", background: E.bg, justifyContent: "space-between" })}>
        <div style={s({ display: "flex", alignItems: "baseline", gap: 8 })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase" as const, color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15, color: E.gold })}>Steward</span>
        </div>
        <div style={s({ display: "flex", gap: 20 })}>
          {["Market Map", "Snapshot", "OAL Structure", "Financing Context"].map(t => (
            <span key={t} style={s({ fontFamily: E.mono, fontSize: 9, color: E.muted, letterSpacing: "0.04em" })}>{t}</span>
          ))}
        </div>
      </div>

      {/* Fake KPI strip */}
      <div style={s({ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: `1px solid ${E.bdr}`, background: E.bg2 })}>
        {[
          { label: "Universe", val: "5,168" },
          { label: "Very High Risk", val: "832" },
          { label: "FCF Anchored", val: "2,900" },
          { label: "Signal", val: "Elevated" },
        ].map(({ label, val }, i) => (
          <div key={label} style={s({ padding: "16px 24px", borderRight: i < 3 ? `1px solid ${E.bdr}` : "none" })}>
            <div style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 4 })}>{label}</div>
            <div style={s({ fontFamily: E.mono, fontSize: 22, fontWeight: 500, color: E.text })}>{val}</div>
          </div>
        ))}
      </div>

      {/* Fake scatter + sidebar */}
      <div style={s({ display: "grid", gridTemplateColumns: "1fr 300px", height: "calc(100vh - 140px)" })}>
        <div style={s({ padding: "24px", background: E.bg })}>
          <div style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 16 })}>Three-Axis Structural Map · 5,168 companies</div>
          {/* Fake scatter dots */}
          <div style={s({ position: "relative", height: 360, border: `1px solid ${E.bdr}`, background: E.bg2 })}>
            {[
              { x: 12, y: 14, c: E.pos, s: 4 }, { x: 24, y: 22, c: E.pos, s: 5 }, { x: 8, y: 8, c: E.pos, s: 3 },
              { x: 36, y: 40, c: E.gold, s: 4 }, { x: 52, y: 38, c: E.gold, s: 5 }, { x: 44, y: 52, c: E.gold, s: 3 },
              { x: 60, y: 60, c: E.muted, s: 4 }, { x: 72, y: 68, c: E.muted, s: 5 }, { x: 65, y: 75, c: E.muted, s: 3 },
              { x: 80, y: 78, c: "#A05050", s: 4 }, { x: 88, y: 82, c: "#A05050", s: 5 },
              { x: 92, y: 88, c: E.neg, s: 5 }, { x: 86, y: 92, c: E.neg, s: 4 }, { x: 94, y: 94, c: E.neg, s: 6 },
              { x: 20, y: 60, c: E.pos, s: 3 }, { x: 30, y: 72, c: E.gold, s: 4 }, { x: 70, y: 30, c: E.muted, s: 3 },
              { x: 50, y: 20, c: E.pos, s: 4 }, { x: 78, y: 45, c: "#A05050", s: 3 }, { x: 15, y: 85, c: E.gold, s: 4 },
            ].map(({ x, y, c, s: sz }, i) => (
              <div key={i} style={s({ position: "absolute", left: `${x}%`, top: `${y}%`, width: sz * 2, height: sz * 2, borderRadius: "50%", background: c, opacity: 0.7 })} />
            ))}
          </div>
        </div>

        {/* Fake sidebar */}
        <div style={s({ borderLeft: `1px solid ${E.bdr}`, background: E.bg2, padding: "20px" })}>
          <div style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 16 })}>Active Risk Cluster</div>
          {["NVDA", "TSLA", "AMZN", "META", "SNOW"].map((ticker, i) => (
            <div key={ticker} style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid rgba(255,255,255,0.03)` })}>
              <span style={s({ fontFamily: E.mono, fontSize: 12, color: E.text })}>{ticker}</span>
              <span style={s({ fontFamily: E.mono, fontSize: 10, color: i < 2 ? E.neg : i < 4 ? "#A05050" : E.muted })}>
                {["Very High", "Very High", "High", "High", "Moderate"][i]}
              </span>
            </div>
          ))}
          <div style={s({ marginTop: 20, padding: "12px", background: E.bg3, border: `1px solid ${E.bdr}` })}>
            <div style={s({ fontFamily: E.mono, fontSize: 8.5, color: E.muted, marginBottom: 8 })}>COMPANY DRILLDOWN</div>
            <div style={s({ fontFamily: E.sans, fontSize: 13, fontWeight: 700, color: E.text, marginBottom: 4 })}>Snowflake Inc.</div>
            <div style={s({ display: "flex", flexDirection: "column", gap: 4 })}>
              {["Anchor Risk", "Trajectory Risk", "Composite"].map(l => (
                <div key={l} style={s({ display: "flex", justifyContent: "space-between" })}>
                  <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.muted })}>{l}</span>
                  <span style={s({ fontFamily: E.mono, fontSize: 9, color: E.neg })}>Very High</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Auth modal ───────────────────────────────────────────────────────────────
function AuthModal({ onClose }: { onClose?: () => void }) {
  const [mode, setMode] = useState<'prompt' | 'signin' | 'signup'>('prompt')

  return (
    <div style={s({ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" })}>

      {/* Overlay */}
      <div style={s({ position: "absolute", inset: 0, background: "rgba(8,7,6,0.75)", backdropFilter: "blur(10px)" })} />

      {/* Modal */}
      <div style={s({ position: "relative", width: "100%", maxWidth: 480, background: E.bg2, border: `1px solid ${E.bdr2}`, borderTop: `2px solid ${E.gold}` })}>

        {/* Modal header */}
        <div style={s({ padding: "28px 32px 20px" })}>
          <div style={s({ display: "flex", alignItems: "baseline", gap: 0, marginBottom: 20 })}>
            <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase" as const, color: E.muted })}>The Capital</span>
            <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15, color: E.gold, marginLeft: 6 })}>Steward</span>
          </div>

          {mode === 'prompt' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: 22, fontWeight: 800, color: E.text, letterSpacing: "-0.03em", marginBottom: 8, lineHeight: 1.1 })}>
              Access the structural map.
            </h2>
            <p style={s({ fontFamily: E.sans, fontSize: 13, lineHeight: 1.75, color: E.body, marginBottom: 24 })}>
              Create a free account to explore the market map and OAL structure across ~5,200 U.S. equities. Paid subscribers unlock company drilldowns and cohort grids.
            </p>

            {/* Tier comparison */}
            <div style={s({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 24 })}>
              {[
                {
                  tier: "Free",
                  features: ["Structural market map", "OAL rung distribution", "Composite bucket overview"],
                  locked: ["Company drilldowns", "Cohort grids"],
                  cta: "Create free account",
                  action: () => setMode('signup'),
                  primary: false,
                },
                {
                  tier: "Paid · $159/mo",
                  features: ["Everything in free", "Company drilldowns", "Cohort grids (290K+ obs)", "Weekly score updates"],
                  locked: [],
                  cta: "Subscribe to access",
                  action: () => window.location.href = '/platform/subscribe',
                  primary: true,
                },
              ].map(({ tier, features, locked, cta, action, primary }) => (
                <div key={tier} style={s({ border: `1px solid ${primary ? E.bdr2 : E.bdr}`, background: primary ? E.gatm : "transparent", padding: "16px" })}>
                  <div style={s({ fontFamily: E.mono, fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: primary ? E.gold : E.muted, marginBottom: 12 })}>{tier}</div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 })}>
                    {features.map(f => (
                      <div key={f} style={s({ display: "flex", gap: 8, alignItems: "baseline" })}>
                        <div style={s({ width: 4, height: 4, borderRadius: "50%", background: E.pos, flexShrink: 0, marginTop: 5 })} />
                        <span style={s({ fontFamily: E.sans, fontSize: 11.5, color: E.body, lineHeight: 1.4 })}>{f}</span>
                      </div>
                    ))}
                    {locked.map(f => (
                      <div key={f} style={s({ display: "flex", gap: 8, alignItems: "baseline", opacity: 0.4 })}>
                        <Lock size={10} style={{ color: E.muted, flexShrink: 0, marginTop: 3 }} />
                        <span style={s({ fontFamily: E.sans, fontSize: 11.5, color: E.muted, lineHeight: 1.4 })}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={action} style={s({ width: "100%", fontFamily: E.sans, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "10px 0", background: primary ? E.gold : "transparent", color: primary ? "#060504" : E.muted, border: primary ? "none" : `1px solid ${E.bdr}`, cursor: "pointer" })}>
                    {cta}
                  </button>
                </div>
              ))}
            </div>

            <div style={s({ textAlign: "center" as const })}>
              <button onClick={() => setMode('signin')} style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" })}>
                Already have an account? Sign in
              </button>
            </div>
          </>}

          {mode === 'signin' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: 20, fontWeight: 800, color: E.text, letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1 })}>Sign in</h2>
            <SignIn
              forceRedirectUrl="/platform"
              appearance={CLERK_APPEARANCE}
            />
            <div style={s({ textAlign: "center" as const, marginTop: 16 })}>
              <button onClick={() => setMode('prompt')} style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" })}>← Back</button>
            </div>
          </>}

          {mode === 'signup' && <>
            <h2 style={s({ fontFamily: E.sans, fontSize: 20, fontWeight: 800, color: E.text, letterSpacing: "-0.03em", marginBottom: 20, lineHeight: 1.1 })}>Create free account</h2>
            <SignUp
              forceRedirectUrl="/platform"
              appearance={CLERK_APPEARANCE}
            />
            <div style={s({ textAlign: "center" as const, marginTop: 16 })}>
              <button onClick={() => setMode('prompt')} style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted, background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" })}>← Back</button>
            </div>
          </>}
        </div>

        {/* Footer */}
        <div style={s({ padding: "12px 32px 20px", borderTop: `1px solid ${E.bdr}` })}>
          <p style={s({ fontFamily: E.mono, fontSize: 9, color: E.muted, textAlign: "center" as const })}>
            <Link href="/osmr-methodology" style={s({ color: E.gold, textDecoration: "none" })}>Read the methodology</Link>
            {" · "}
            <Link href="/who-its-for" style={s({ color: E.muted, textDecoration: "none" })}>Who it's for</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Free tier locked overlay ─────────────────────────────────────────────────
function LockedFeature({ children }: { children: React.ReactNode }) {
  return (
    <div style={s({ position: "relative" })}>
      <div style={s({ filter: "blur(4px)", pointerEvents: "none", userSelect: "none" })}>{children}</div>
      <div style={s({ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" })}>
        <div style={s({ display: "flex", alignItems: "center", gap: 8, background: E.bg2, border: `1px solid ${E.bdr2}`, padding: "8px 14px" })}>
          <Lock size={12} style={{ color: E.gold }} />
          <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: E.gold })}>Paid subscribers</span>
        </div>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function PlatformPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const isPaid = isSignedIn && user?.publicMetadata?.subscription === 'active'

  // While Clerk loads, show blurred background + modal
  if (!isLoaded) {
    return (
      <div style={s({ minHeight: "100vh", background: E.bg })}>
        <div style={s({ filter: "blur(8px)", opacity: 0.4, height: "100vh", overflow: "hidden" })}>
          <PlatformBackground isPaid={false} />
        </div>
      </div>
    )
  }

  // Unauthenticated — show blurred platform + auth modal
  if (!isSignedIn) {
    return (
      <div style={s({ minHeight: "100vh", background: E.bg, overflow: "hidden", position: "relative" })}>
        <div style={s({ filter: "blur(8px)", opacity: 0.5, height: "100vh", overflow: "hidden", pointerEvents: "none" })}>
          <PlatformBackground isPaid={false} />
        </div>
        <AuthModal />
      </div>
    )
  }

  // Authenticated — redirect to actual platform
  // For now, show a bridge page while /platform-beta is being finalized
  return (
    <div style={s({ minHeight: "100vh", background: E.bg, color: E.text, fontFamily: E.sans })}>

      {/* Nav */}
      <nav style={s({ height: 52, borderBottom: `1px solid ${E.bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: E.bg })}>
        <Link href="/" style={s({ textDecoration: "none", display: "flex", alignItems: "baseline" })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase" as const, color: E.muted })}>The Capital</span>
          <span style={s({ fontFamily: E.serif, fontStyle: "italic", fontSize: 15, color: E.gold, marginLeft: 6 })}>Steward</span>
        </Link>
        <div style={s({ display: "flex", alignItems: "center", gap: 16 })}>
          <span style={s({ fontFamily: E.mono, fontSize: 9.5, color: E.muted })}>
            {user?.primaryEmailAddress?.emailAddress}
          </span>
          {!isPaid && (
            <Link href="/platform/subscribe" style={s({ fontFamily: E.sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "6px 14px", background: E.gold, color: "#060504", textDecoration: "none" })}>
              Upgrade
            </Link>
          )}
        </div>
      </nav>

      {/* Bridge — authenticated, redirecting to platform-beta */}
      <div style={s({ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 52px)", padding: "40px" })}>
        <p style={s({ fontFamily: E.mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.gold, marginBottom: 16 })}>
          {isPaid ? "Full access" : "Free access"}
        </p>
        <h1 style={s({ fontFamily: E.sans, fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, color: E.text, letterSpacing: "-0.04em", marginBottom: 16, textAlign: "center" as const, lineHeight: 1.1 })}>
          The platform is ready.
        </h1>
        <p style={s({ fontFamily: E.sans, fontSize: 14, color: E.body, lineHeight: 1.75, maxWidth: 440, textAlign: "center" as const, marginBottom: 32 })}>
          {isPaid
            ? "You have full subscriber access. The platform dashboard is available now."
            : "You have free access to the structural market map and OAL structure. Upgrade for company drilldowns and cohort grids."}
        </p>
        <div style={s({ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" })}>
          <Link href="/platform-beta" style={s({ fontFamily: E.sans, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "13px 28px", background: E.gold, color: "#060504", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 })}>
            Open Platform <ArrowRight size={14} />
          </Link>
          {!isPaid && (
            <Link href="/platform/subscribe" style={s({ fontFamily: E.sans, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const, padding: "13px 22px", background: "transparent", color: E.muted, border: `1px solid ${E.bdr2}`, textDecoration: "none" })}>
              Upgrade to Full Access
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}