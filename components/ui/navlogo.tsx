'use client'

import Link from "next/link"
import Image from "next/image"

export default function NavLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-4"
      onClick={(e) => {
        if (window.location.pathname === "/") {
          e.preventDefault()
          const el = document.getElementById("home-top")
          if (!el) return
          const navOffset = 88
          const y = el.getBoundingClientRect().top + window.scrollY - navOffset
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" })
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
  )
}