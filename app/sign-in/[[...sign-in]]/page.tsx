import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

// P3 palette · DM Sans · AAA corrected · File → app/sign-in/[[...sign-in]]/page.tsx

const E = {
  bg:    "#D7DDD3",
  bg2:   "#CBD2C7",
  bdr:   "#B7C1B4",
  text:  "#313A34", // 8.50:1 AAA
  body:  "#3F4640", // 7.02:1 AAA
  muted: "#40463F", // 6.27:1 AA-large
  dim:   "#41453F", // 7.06:1 AAA
  gold:  "#715E37", // 4.52:1 AA-large display only
  mono:  "'IBM Plex Mono','Courier New',monospace",
  sans:  "'DM Sans',system-ui,sans-serif",
  serif: "'Playfair Display',Georgia,serif",
}

export default function SignInPage() {
  return (
    <main style={{ minHeight: "100vh", background: E.bg, display: "flex", flexDirection: "column", fontFamily: E.sans }}>

      {/* ── NAV ── */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 44px", height: 52, borderBottom: `1px solid ${E.bdr}`, background: E.bg2 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 }}>
          <span style={{ fontFamily: E.mono, fontSize: 9.5, fontWeight: 400, letterSpacing: "0.32em", textTransform: "uppercase" as const, color: E.muted }}>The Capital</span>
          <span style={{ fontFamily: E.serif, fontStyle: "italic", fontSize: 17, color: E.text, marginLeft: 8 }}>Steward</span>
        </Link>
        <Link href="/" style={{ fontFamily: E.sans, fontSize: 10.5, fontWeight: 600, color: E.muted, textDecoration: "none", letterSpacing: "0.02em" }}>
          ← Back
        </Link>
      </nav>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, display: "flex" }}>

        {/* Left — context */}
        <div style={{ flex: 1, padding: "80px 64px", borderRight: `1px solid ${E.bdr}`, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 520 }}>
          <p style={{ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 20 }}>Platform access</p>
          <h1 style={{ fontFamily: E.sans, fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 800, lineHeight: 1.05, color: E.text, letterSpacing: "-0.03em", marginBottom: 24 }}>
            The structural map<br />
            <em style={{ fontStyle: "italic", fontFamily: E.serif, fontWeight: 400, color: E.body, fontSize: "clamp(32px,4vw,46px)", letterSpacing: "-0.01em" }}>is live.</em>
          </h1>
          <p style={{ fontFamily: E.sans, fontSize: 14.5, lineHeight: 1.78, color: E.body, marginBottom: 40, maxWidth: 400 }}>
            ~5,200 U.S. equities scored across two independently validated dimensions of structural risk. Updated weekly.
          </p>

          {/* Key stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: `1px solid ${E.bdr}` }}>
            {[
              { val: "289,737", label: "Historical observations" },
              { val: "+21.0%",  label: "Factor-adj. L/S alpha" },
              { val: "~2×",     label: "Very High loss rate vs universe" },
            ].map(({ val, label }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0", borderBottom: `1px solid ${E.bdr}` }}>
                <span style={{ fontFamily: E.sans, fontSize: 12.5, color: E.body }}>{label}</span>
                <span style={{ fontFamily: E.mono, fontSize: 14, fontWeight: 500, color: E.text }}>{val}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28 }}>
            <p style={{ fontFamily: E.mono, fontSize: 10, color: E.muted, lineHeight: 1.65 }}>
              Not yet a subscriber?{" "}
              <Link href="/platform" style={{ color: E.text, textDecoration: "underline" }}>See what&apos;s included →</Link>
            </p>
          </div>
        </div>

        {/* Right — Clerk sign-in */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 44px", background: E.bg2 }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <p style={{ fontFamily: E.mono, fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: E.muted, marginBottom: 24, textAlign: "center" as const }}>
              Sign in to continue
            </p>
            <SignIn
              forceRedirectUrl="/platform"
              appearance={{
                variables: {
                  colorBackground:              E.bg2,
                  colorPrimary:                 E.text,
                  colorText:                    E.text,
                  colorTextSecondary:           E.body,
                  colorTextOnPrimaryBackground: E.bg,
                  colorInputBackground:         E.bg,
                  colorInputText:               E.text,
                  colorNeutral:                 E.text,
                  borderRadius:                 '0px',
                  fontFamily:                   E.sans,
                },
                elements: {
                  card:                   'shadow-none',
                  headerTitle:            'hidden',
                  headerSubtitle:         'hidden',
                  formButtonPrimary:      'font-semibold',
                  footerActionLink:       'underline',
                  socialButtonsBlockButton: `border-[${E.bdr}]`,
                },
              }}
            />
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding: "20px 44px", borderTop: `1px solid ${E.bdr}`, background: E.bg2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontFamily: E.mono, fontSize: 9.5, color: E.muted }}>
          © 2026 The Capital Steward, LLC · Not investment advice
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Who It's For", href: "/who-its-for" },
            { label: "Methodology",  href: "/methodology" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={{ fontFamily: E.sans, fontSize: 11, color: E.muted, textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      </div>

    </main>
  )
}