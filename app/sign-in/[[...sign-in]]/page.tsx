import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A1F3D] text-white">

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full border border-[#1E3A5F]" style={{ animation: "spin 40s linear infinite" }} />
        <div className="absolute -right-16 -top-16 h-[380px] w-[380px] rounded-full border border-[#162E4A]" style={{ animation: "spin 28s linear infinite reverse" }} />
        <div className="absolute -bottom-24 -left-24 h-[340px] w-[340px] rounded-full border border-[#1A3352]" style={{ animation: "spin 52s linear infinite" }} />
        <div className="absolute -left-20 top-1/3 h-[260px] w-[260px] rounded-full border border-dashed border-[#1E3A5F]" style={{ animation: "spin 34s linear infinite reverse" }} />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0D2847] opacity-40 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2" style={{ animation: "spin 18s linear infinite" }}>
          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-[#244636]" />
          <div className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#1E3A5F]" />
        </div>
        <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2" style={{ animation: "spin 26s linear infinite reverse" }}>
          <div className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#C9D8CD]" />
        </div>
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
        <div className="mb-8 text-center" style={{ animation: "fadeUp 0.6s ease both" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6DAE8B]">
            The Capital Steward
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Sign in to continue
          </h1>
        </div>

        <div style={{ animation: "fadeUp 0.6s ease 0.1s both" }}>
          <SignIn
            afterSignInUrl="/platform-beta"
            appearance={{
              variables: {
                colorBackground: '#0D2847',
                colorPrimary: '#6DAE8B',
                colorText: '#EAF0F2',
                colorTextSecondary: '#8DAFC8',
                colorTextOnPrimaryBackground: '#0A1F3D',
                colorInputBackground: '#102642',
                colorInputText: '#EAF0F2',
                colorNeutral: '#EAF0F2',
                borderRadius: '0.5rem',
                fontFamily: 'var(--font-sans)',
              },
              elements: {
                card: 'border border-[#203754] shadow-[0_12px_32px_rgba(0,0,0,0.3)] bg-[#0D2847]',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                formButtonPrimary: 'bg-[#6DAE8B] hover:bg-[#5a9a78] text-[#0A1F3D] font-semibold rounded-lg',
                footerActionLink: 'text-[#6DAE8B] hover:text-[#5a9a78]',
                footerActionText: 'text-[#8DAFC8]',
                formFieldLabel: 'text-[#8DAFC8]',
                formFieldInput: 'border-[#203754] rounded-lg',
                dividerLine: 'bg-[#203754]',
                dividerText: 'text-[#8DAFC8]',
                socialButtonsBlockButton: 'border-[#203754] text-[#EAF0F2] hover:bg-[#102642]',
                socialButtonsBlockButtonText: 'text-[#EAF0F2]',
                identityPreviewText: 'text-[#EAF0F2]',
                formFieldInputPlaceholder: 'text-[#8DAFC8]',
                footer: 'bg-[#0D2847]',
              },
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
