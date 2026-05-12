"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Wallet,
  Map,
  Plane,
  UtensilsCrossed,
  Calendar,
  Zap,
} from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Itinerary Generation",
    description:
      "Get personalized trip plans in seconds powered by advanced AI that understands your preferences.",
    gradient: "from-[#38BDF8] to-[#0F4C81]",
  },
  {
    icon: Calendar,
    title: "Smart Day Planning",
    description:
      "Optimal scheduling with travel times, opening hours, and pace built in automatically.",
    gradient: "from-[#FF7A59] to-[#FFB36B]",
  },
  {
    icon: UtensilsCrossed,
    title: "Local Food Discovery",
    description:
      "Authentic cuisines and street food gems curated by locals for every destination.",
    gradient: "from-[#FFB36B] to-amber-400",
  },
  {
    icon: Wallet,
    title: "Smart Budgeting",
    description:
      "Track expenses and get realistic cost estimates for every activity in your itinerary.",
    gradient: "from-[#2E8B57] to-teal-400",
  },
  {
    icon: Map,
    title: "Interactive Travel Map",
    description:
      "Visualize your entire trip on a map with routes, distances, and nearby discoveries.",
    gradient: "from-[#0F4C81] to-[#38BDF8]",
  },
  {
    icon: Zap,
    title: "Edit by Conversation",
    description:
      "Refine your trip in plain English — say 'make day 3 more relaxing' and it does.",
    gradient: "from-violet-500 to-purple-400",
  },
]

export function Features() {
  return (
    <section
      id="features"
      className="py-24 md:py-32 relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-[#38BDF8]/5 to-transparent rounded-full blur-3xl" />
      </div>

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
            className="mb-4 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-0"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Features
          </Badge>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Everything you need to plan the perfect trip
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Powerful AI tools that make trip planning effortless and enjoyable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group"
            >
              <div className="h-full rounded-2xl border bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3
                  className="text-lg font-semibold text-foreground mb-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
