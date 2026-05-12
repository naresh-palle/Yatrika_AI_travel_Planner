"use client"

import Link from "next/link"
import { Plane } from "lucide-react"

const footerLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
]

export function Footer() {
  return (
    <footer className="bg-[#0B1F33] text-white footer-glow relative">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#38BDF8] flex items-center justify-center shadow-lg shadow-[#38BDF8]/20">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <span
                className="text-xl font-bold text-white block"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Yatrika
              </span>
              <span className="text-xs text-white/50">AI Travel Planner</span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-white/60 hover:text-[#38BDF8] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Yatrika. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
