import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

// File goes to: app/sign-in/[[...sign-in]]/page.tsx

export default function SignInPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0E0D0B", display: "flex", flexDirection: "column" }}>

      {/* ── NAV ── */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 44px", height: 52, borderBottom: "1px solid #272420" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 }}>
          <span style={{ fontFamily: "'IBM Plex Mono','Courier New',monospace", fontSize: 9.5, fontWeight: 400, letterSpacing: "0.32em", textTransform: "uppercase" as const, color: "#6B6458" }}>The Capital</span>
          <span style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontStyle: "italic", fontSize: 17, color: "#C5A24A", marginLeft: 8 }}>Steward</span>
        </Link>
        <Link href="/" style={{ fontFamily: "'Syne',system-ui,sans-serif", fontSize: 10.5, fontWeight: 600, color: "#6B6458", textDecoration: "none", letterSpacing: "0.02em" }}>
          ← Back
        </Link>
      </nav>

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, display: "flex" }}>

        {/* Left — context */}
        <div style={{ flex: 1, padding: "80px 64px", borderRight: "1px solid #272420", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 520 }}>
          <p style={{ fontFamily: "'IBM Plex Mono','Courier New',monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "#C5A24A", marginBottom: 20 }}>Platform access</p>
          <h1 style={{ fontFamily: "'Syne',system-ui,sans-serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 800, lineHeight: 1.05, color: "#EDE9E0", letterSpacing: "-0.04em", marginBottom: 24 }}>
            The structural map<br />
            <em style={{ fontStyle: "italic", fontFamily: "'Instrument Serif',Georgia,serif", fontWeight: 400, color: "#C5A24A", fontSize: "clamp(32px,4vw,46px)", letterSpacing: "-0.02em" }}>is live.</em>
          </h1>
          <p style={{ fontFamily: "'Syne',system-ui,sans-serif", fontSize: 14, lineHeight: 1.78, color: "#A89E8E", marginBottom: 40, maxWidth: 400 }}>
            ~5,200 U.S. equities scored across two independently validated dimensions of structural risk. Updated weekly.
          </p>

          {/* Key stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid #272420" }}>
            {[
              { val: "289,737", label: "Historical observations" },
              { val: "+21.0%", label: "Factor-adj. L/S alpha" },
              { val: "~2×", label: "Very High loss rate vs universe" },
            ].map(({ val, label }, i) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0", borderBottom: "1px solid #272420" }}>
                <span style={{ fontFamily: "'Syne',system-ui,sans-serif", fontSize: 12.5, color: "#A89E8E" }}>{label}</span>
                <span style={{ fontFamily: "'IBM Plex Mono','Courier New',monospace", fontSize: 14, fontWeight: 500, color: "#C5A24A" }}>{val}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28 }}>
            <p style={{ fontFamily: "'IBM Plex Mono','Courier New',monospace", fontSize: 9.5, color: "#6B6458", lineHeight: 1.65 }}>
              Not yet a subscriber?{" "}
              <Link href="/platform" style={{ color: "#C5A24A", textDecoration: "none" }}>See what's included →</Link>
            </p>
          </div>
        </div>

        {/* Right — Clerk sign-in */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 44px", background: "#131210" }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <p style={{ fontFamily: "'IBM Plex Mono','Courier New',monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "#6B6458", marginBottom: 24, textAlign: "center" as const }}>
              Sign in to continue
            </p>
            <SignIn
              forceRedirectUrl="/platform"
              appearance={{
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
                  card: 'shadow-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  formButtonPrimary: 'font-semibold',
                  footerActionLink: 'underline',
                  socialButtonsBlockButton: 'border-[#272420]',
                },
              }}
            />
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding: "20px 44px", borderTop: "1px solid #272420", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontFamily: "'IBM Plex Mono','Courier New',monospace", fontSize: 9.5, color: "#6B6458" }}>
          © 2026 The Capital Steward, LLC · Not investment advice
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Who It's For", href: "/who-its-for" },
            { label: "Methodology",  href: "/osmr-methodology" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} style={{ fontFamily: "'Syne',system-ui,sans-serif", fontSize: 11, color: "#6B6458", textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      </div>

    </main>
  )
}