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
      {/* Global Cinematic Background */}
      <div className="fixed inset-0 -z-20">
        <div 
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: "url('/tirumala-memento.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        {/* Memento-style vignette/overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0B1F33]" />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Floating Blobs (Subtle) */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#FF7A59]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#38BDF8]/10 rounded-full blur-[120px] pointer-events-none" />

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
