"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Plane, LayoutDashboard, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth, useClerk } from "@clerk/nextjs"

const navLinks = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#destinations", label: "Destinations" },
  { href: "#pricing", label: "Pricing" },
]

export function Navbar() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { signOut } = useClerk()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled
            ? "glass py-3 shadow-lg shadow-[#0F4C81]/10"
            : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F4C81] to-[#38BDF8] flex items-center justify-center shadow-lg shadow-[#0F4C81]/30">
                  <Plane className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              <span 
                className={cn(
                  "text-xl font-bold transition-colors duration-300",
                  "text-foreground"
                )}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Yatrika
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                    "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-6">
              {!isSignedIn ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-transparent font-medium text-sm"
                    onClick={() => router.push("/sign-in")}
                  >
                    Sign in
                  </Button>
                  <Button
                    size="sm"
                    className="h-10 px-6 rounded-full bg-white text-[#0B1F33] hover:bg-white/90 font-bold shadow-lg transition-all"
                    onClick={() => router.push("/sign-up")}
                  >
                    Create account
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-transparent font-medium text-sm"
                    onClick={() => signOut(() => router.push("/"))}
                  >
                    Log out
                  </Button>
                  <Button
                    size="sm"
                    className="h-10 px-6 rounded-full bg-white text-[#0B1F33] hover:bg-white/90 font-bold shadow-lg transition-all"
                    onClick={() => router.push("/dashboard")}
                  >
                    Dashboard
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "lg:hidden p-2 rounded-lg transition-colors",
                isScrolled ? "hover:bg-secondary" : "hover:bg-white/10"
              )}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className={cn("w-6 h-6", isScrolled ? "text-foreground" : "text-white")} />
              ) : (
                <Menu className={cn("w-6 h-6", isScrolled ? "text-foreground" : "text-white")} />
              )}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div 
              className="absolute inset-0 bg-[#0B1F33]/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-[280px] bg-card border-l border-border shadow-xl p-6 pt-20"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-base font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
                {!isSignedIn ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        router.push("/sign-in")
                      }}
                    >
                      Log in
                    </Button>
                    <Button
                      className="w-full justify-center btn-gradient text-white font-semibold border-0"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        router.push("/ai-itinerary")
                      }}
                    >
                      Get Started Free
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-center text-muted-foreground"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        signOut(() => router.push("/"))
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </Button>
                    <Button
                      className="w-full justify-center btn-gradient text-white font-semibold border-0 flex items-center gap-2"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        router.push("/dashboard")
                      }}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </>
                )}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
