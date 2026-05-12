'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocationAutocomplete } from '@/components/ui/location-autocomplete'
import {
  Sparkles,
  Star,
  MapPin,
  Calendar,
  Users,
} from 'lucide-react'

const stats = [
  { value: '184k+', label: 'Itineraries Crafted' },
  { value: '78s', label: 'Avg. Time to Plan' },
  { value: '4.9', label: 'Traveler Rating', icon: Star },
]

export function Hero() {
  const router = useRouter()
  const [destination, setDestination] = useState("")

  const handleSearch = () => {
    if (destination) {
      router.push(`/ai-itinerary?destination=${encodeURIComponent(destination)}`);
    } else {
      router.push('/ai-itinerary');
    }
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 -z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-[#38BDF8]/15 to-transparent rounded-full blur-[120px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#FF7A59]/10 to-transparent rounded-full blur-[100px]"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Badge className="mb-8 px-4 py-2 text-sm font-medium bg-white/10 text-white border border-white/20 hover:bg-white/15 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2 text-[#FFB36B]" />
              AI-Powered Trip Planning
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Plan trips you&apos;ll{" "}
            <span className="bg-gradient-to-r from-[#38BDF8] to-[#FF7A59] bg-clip-text text-transparent italic font-serif">
              actually remember.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
          >
            Tell Yatrika where you&apos;re dreaming of going. Our AI crafts a
            day-by-day itinerary tailored to your pace, budget, and style.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 relative z-50 flex flex-col sm:flex-row items-center gap-3 justify-center max-w-xl mx-auto"
          >
            <div className="w-full sm:flex-1 relative z-50">
              <LocationAutocomplete
                placeholder="Where do you want to go?"
                value={destination}
                onChange={setDestination}
              />
            </div>
            <Button
              size="lg"
              onClick={handleSearch}
              className="w-full sm:w-auto text-base px-8 text-[#0B1F33] font-bold shadow-xl group border-0 hover:shadow-lg bg-gradient-to-r from-[#38BDF8] to-[#FF7A59] pulse-glow"
            >
              Plan my trip
              <Sparkles className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-4 text-sm text-white/40"
          >
            Free to use &middot; No sign-up required
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span
                  className="text-2xl md:text-3xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {stat.value}
                </span>
                {stat.icon && <stat.icon className="w-4 h-4 fill-current text-[#FFB36B]" />}
              </div>
              <p className="text-xs text-white/50 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
