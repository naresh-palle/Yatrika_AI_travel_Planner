"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Luggage,
  Settings,
  Sparkles,
  Plane,
  Home,
  MessageSquare,
  Compass,
  User,
  ChevronDown
} from "lucide-react"
import { motion } from "framer-motion"
import { UserButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/trips", label: "My Trips", icon: Luggage },
  { href: "/ai-itinerary", label: "Plan New Trip", icon: Sparkles },
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Memento-style Narrow Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 flex flex-col items-center bg-black/5 dark:bg-black/40 backdrop-blur-2xl border-r border-white/10 transition-all duration-300",
          "w-16 md:w-20"
        )}
      >
        {/* Logo */}
        <div className="py-8 mb-4">
          <Link href="/" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all group">
            <span className="text-white font-bold text-sm group-hover:scale-110 transition-transform">Y</span>
          </Link>
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 flex flex-col items-center gap-8">
          {nav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300 group relative",
                  isActive 
                    ? "bg-[#FF7A59] text-white shadow-lg shadow-[#FF7A59]/40 scale-110" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/80 text-white text-[10px] uppercase tracking-widest font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-xl whitespace-nowrap z-50">
                  {item.label}
                </div>
              </Link>
            )
          })}
          
          {/* Extra Memento Icons */}
          <div className="p-2.5 text-white/20 cursor-not-allowed">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="p-2.5 text-white/20 cursor-not-allowed">
            <Compass className="w-5 h-5" />
          </div>
        </nav>

        {/* Bottom Icons */}
        <div className="py-8 flex flex-col gap-8 items-center">
          <Link
            href="/settings"
            className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all group relative"
          >
            <Settings className="w-5 h-5" />
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/80 text-white text-[10px] uppercase tracking-widest font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-xl whitespace-nowrap z-50">
              Settings
            </div>
          </Link>
          <div className="relative group">
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 border border-white/20"
                }
              }}
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-16 md:pl-20 min-h-screen flex flex-col">
        <main className="flex-1 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
