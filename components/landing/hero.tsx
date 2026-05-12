'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LocationAutocomplete } from '@/components/ui/location-autocomplete'
import { Sparkles, ChevronDown, Users, CalendarDays, MapPin } from 'lucide-react'

export function Hero() {
  const router = useRouter()

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      
      {/* Left Sidebar (Memento Style) */}
      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-16 flex-col items-center py-8 border-r border-white/10 z-40 bg-black/10 backdrop-blur-md">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-12">
          <span className="text-white font-bold text-xs">Y</span>
        </div>
        <div className="flex flex-col gap-8">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#FFB36B] to-[#FF7A59] text-white shadow-lg shadow-[#FF7A59]/30">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer">
            <Users className="w-5 h-5" />
          </div>
          <div className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-6">
          <div className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-24 relative z-10 flex flex-col items-start pt-20">
        
        {/* Top Tagline */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-[#FFB36B]">
            A Smart Travel Companion
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-3xl mb-8"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium text-white leading-[1.1] tracking-tight">
            Plan trips you&apos;ll <br />
            actually <span className="font-serif italic text-[#FFB36B]">remember.</span>
          </h1>
        </motion.div>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/80 text-lg md:text-xl mb-12 max-w-xl leading-relaxed font-light"
        >
          Tell Yatrika where you&apos;re dreaming of going. We&apos;ll handcraft a day-by-day itinerary that feels like it was written by a friend who lives there.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap items-center gap-4 mb-24"
        >
          <Button
            onClick={() => router.push("/ai-itinerary")}
            className="h-14 px-8 rounded-full bg-[#FF7A59] hover:bg-[#ff6b47] text-white font-semibold text-base shadow-xl shadow-[#FF7A59]/30 transition-all border-0 flex items-center gap-2"
          >
            Plan my trip — free
            <span className="text-xl">→</span>
          </Button>
          <Button
            variant="outline"
            className="h-14 px-8 rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 text-base font-medium transition-all"
            onClick={() => router.push("/#destinations")}
          >
            Browse destinations
          </Button>
        </motion.div>

        {/* Bottom Stats (Memento Style) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-full flex flex-wrap items-center gap-16 text-white/60 border-t border-white/10 pt-10"
        >
          <div>
            <div className="text-2xl font-bold text-white mb-1">184k</div>
            <div className="text-[10px] tracking-widest uppercase font-bold">Itineraries Crafted</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">78s</div>
            <div className="text-[10px] tracking-widest uppercase font-bold">Avg. Time to Plan</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">4.9★</div>
            <div className="text-[10px] tracking-widest uppercase font-bold">Travelers Love It</div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
