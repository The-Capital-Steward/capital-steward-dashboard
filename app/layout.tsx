import type { Metadata } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "The Capital Steward",
  description: "Structural Risk Intelligence for Investors.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    apple: '/tcs-favicon-180.png',
  },
}