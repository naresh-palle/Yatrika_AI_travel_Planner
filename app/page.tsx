import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Destinations } from "@/components/landing/destinations"
import { Testimonials } from "@/components/landing/testimonials"
import { Pricing } from "@/components/landing/pricing"
import { FAQ } from "@/components/landing/faq"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-[#0B1F33]">
      {/* Global Tirupati Background */}
      <div className="fixed inset-0 -z-20">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "url('/tirupati-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F33]/90 via-[#0B1F33]/80 to-[#0B1F33]" />
      </div>

      {/* Animated Floating Gradient Blobs */}
      <div className="floating-blob-1 opacity-20" aria-hidden="true" />
      <div className="floating-blob-2 opacity-20" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <HowItWorks />
        <Destinations />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </main>
  )
}
