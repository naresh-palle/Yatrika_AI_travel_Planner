import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Destinations } from "@/components/landing/destinations"
import { Features } from "@/components/landing/features"
import { Pricing } from "@/components/landing/pricing"
import { FAQ } from "@/components/landing/faq"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen main-premium-bg relative overflow-hidden">
      <div className="floating-blob-1" aria-hidden="true" />
      <div className="floating-blob-2" aria-hidden="true" />

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <HowItWorks />
        <Destinations />
        <Features />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </main>
  )
}
