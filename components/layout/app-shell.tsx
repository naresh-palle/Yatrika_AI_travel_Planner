"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Luggage,
  Map,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Plane,
} from "lucide-react"
import { motion } from "framer-motion"

import { UserMenu } from "@/components/auth/user-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "My Trips", icon: Luggage },
  { href: "/ai-itinerary", label: "AI Planner", icon: Sparkles },
  { href: "/travel-map", label: "Travel Map", icon: Map },
] as const

function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname()
  return (
    <nav className="grid gap-1">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground",
            collapsed && "justify-center px-2",
            pathname === item.href
              ? "bg-[#0F4C81]/10 text-[#0F4C81]"
              : "text-muted-foreground"
          )}
          title={collapsed ? item.label : undefined}
        >
          <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed ? item.label : null}
        </Link>
      ))}
    </nav>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F4C81] to-[#38BDF8] flex items-center justify-center">
                      <Plane className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Yatrika</span>
                  </div>
                  <SidebarNav />
                </SheetContent>
              </Sheet>
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-lg transition-colors hover:text-[#38BDF8]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F4C81] to-[#38BDF8] flex items-center justify-center">
                  <Plane className="h-4 w-4 text-white" />
                </div>
                <span className="text-[#0F4C81]">Yatrika</span>
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex gap-6 py-6">
          <motion.aside
            animate={{ width: sidebarCollapsed ? 72 : 220 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="hidden md:block shrink-0 print:hidden"
          >
            <div className="sticky top-20 rounded-xl border bg-card p-3">
              <SidebarNav collapsed={sidebarCollapsed} />
            </div>
          </motion.aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
