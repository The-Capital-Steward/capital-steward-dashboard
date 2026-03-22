import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
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
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <header className="sticky top-0 z-50 border-b border-[#DDE0DC] bg-[#F1F3F0]/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link
  href="/"
  className="flex items-center gap-4"
  onClick={(e) => {
    if (window.location.pathname === "/") {
      e.preventDefault();

      const el = document.getElementById("home-top");
      if (!el) return;

      const navOffset = 88;

      const y =
        el.getBoundingClientRect().top +
        window.scrollY -
        navOffset;

      window.scrollTo({
        top: Math.max(0, y),
        behavior: "smooth",
      });
    }
  }}
>
  <div className="relative h-12 w-12 overflow-hidden rounded-xl">
    <Image
      src="/tcs-logo.png"
      alt="The Capital Steward"
      fill
      className="object-contain"
      priority
    />
  </div>

  <div className="tcs-heading text-2xl font-semibold tracking-tight text-[#0A1F3D] md:text-3xl">
    The Capital Steward
  </div>
</Link>

            <nav className="hidden items-center gap-5 text-sm font-medium text-[#5C6472] md:flex">
              <Link href="/why-this-exists" className="transition hover:text-[#0A1F3D]">
                Why This Exists
              </Link>
              <Link href="/how-we-see-markets" className="transition hover:text-[#0A1F3D]">
                How We See Markets
              </Link>
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
  );
}