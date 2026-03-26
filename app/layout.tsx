import { UserButton } from '@clerk/nextjs'
import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import NavLogo from "@/components/NavLogo";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Capital Steward",
  description: "Structural Intelligence for Serious Investors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
        <body>
          <header className="sticky top-0 z-50 border-b border-[#DDE0DC] bg-[#F1F3F0]/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

              <NavLogo />

              <nav className="hidden items-center gap-5 text-sm font-medium text-[#5C6472] md:flex">
                <Link href="/why-this-exists" className="transition hover:text-[#0A1F3D]">
                  Why This Exists
                </Link>
                <Link href="/osmr-methodology" className="transition hover:text-[#0A1F3D]">
                  Methodology
                </Link>
                <UserButton afterSignOutUrl="/platform" />
                <Link
                  href="/platform"
                  className="inline-flex items-center gap-2 rounded-[1.75rem] bg-[#0A1F3D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#153761]"
                >
                  Open Platform
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </nav>

            </div>
          </header>

          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
