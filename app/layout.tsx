import type { Metadata } from "next"
import { DM_Sans, Playfair_Display } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  axes: ["opsz"],
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "The Capital Steward",
  description: "Structural Risk Research for U.S. Equities.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${dmSans.variable} ${playfairDisplay.variable}`}>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}