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
      {/* Global Cinematic Sunrise Background */}
      <div className="fixed inset-0 -z-20">
        <div 
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: "url('/tirumala-memento.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        {/* Sunrise-style vignette/overlay: Amber to Deep Purple/Blue */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFB36B]/20 via-transparent to-[#0B1F33]/90" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Sunrise Glowing Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-[#FFB36B]/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-[#FF7A59]/15 rounded-full blur-[150px] pointer-events-none" />

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
