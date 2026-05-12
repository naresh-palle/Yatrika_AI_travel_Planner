"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"

const destinations = [
  {
    name: "Tokyo",
    tagline: "Future Meets Tradition",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    name: "Bali",
    tagline: "Island Paradise",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "Paris",
    tagline: "City of Lights",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "Rajasthan",
    tagline: "Royal Heritage",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    name: "Santorini",
    tagline: "Aegean Dream",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    name: "Kyoto",
    tagline: "Ancient Beauty",
    gradient: "from-red-500 to-rose-600",
  },
  {
    name: "Goa",
    tagline: "Beach & Culture",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    name: "Marrakech",
    tagline: "Vibrant Medina",
    gradient: "from-orange-500 to-red-600",
  },
]

export function Destinations() {
  return (
    <section
      id="destinations"
      className="py-24 md:py-32 relative overflow-hidden bg-secondary/30"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-2 text-sm font-medium bg-[#0F4C81]/10 text-[#0F4C81] border-0"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Where travelers are heading
          </Badge>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Loved by Yatrika travelers this season
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start planning for one of these popular destinations.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link href={`/ai-itinerary?destination=${encodeURIComponent(dest.name)}`}>
                <div
                  className={`relative h-36 rounded-2xl bg-gradient-to-br ${dest.gradient} p-5 flex flex-col justify-end cursor-pointer group transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                  <div className="relative z-10">
                    <h3
                      className="text-lg font-bold text-white"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {dest.name}
                    </h3>
                    <p className="text-xs text-white/80">{dest.tagline}</p>
                  </div>
                  <ArrowRight className="absolute top-4 right-4 w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all z-10" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
