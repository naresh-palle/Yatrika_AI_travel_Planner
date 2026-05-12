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

  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [travellers, setTravellers] = useState("1")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (origin) params.append('origin', origin)
    if (destination) params.append('destination', destination)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (travellers) params.append('travellers', travellers)
    router.push(`/ai-itinerary?${params.toString()}`)
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Tirupati AI-generated background photo */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/tirupati-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F33]/75 via-[#0B1F33]/55 to-[#0B1F33]/80" />
        {/* Subtle colour accent blobs on top of image */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-[#38BDF8]/15 to-transparent blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Badge className="px-4 py-2 text-sm font-medium bg-white/10 text-white border border-white/20 hover:bg-white/15 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-2 text-[#FFB36B]" />
            AI-Powered Travel Planning
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center mb-4"
        >
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white text-balance"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Your dream trip,{" "}
            <span className="bg-gradient-to-r from-[#38BDF8] via-[#7DD3FC] to-[#FF7A59] bg-clip-text text-transparent">
              planned by AI
            </span>
          </h1>
        </motion.div>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/70 text-lg md:text-xl mb-12 text-center max-w-xl leading-relaxed"
        >
          Enter your destination and get a complete, personalized day-by-day itinerary in seconds.
        </motion.p>

        {/* Planner Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-[#0F4C81]/20 overflow-hidden">
            {/* Card header strip */}
            <div className="bg-gradient-to-r from-[#0F4C81] to-[#1a6bb5] px-6 py-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-white/90 text-sm font-semibold tracking-wide">Yatrika AI Planner</span>
            </div>

            {/* Form fields */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

                {/* Origin */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" /> From
                  </label>
                  <div className="relative">
                    <LocationAutocomplete
                      value={origin}
                      onChange={setOrigin}
                      placeholder="Origin city (optional)"
                      className="h-12 rounded-xl border-gray-200 text-[#0B1F33] bg-gray-50 focus:bg-white focus:border-[#38BDF8] transition-colors"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-[#FF7A59]" /> To
                  </label>
                  <LocationAutocomplete
                    value={destination}
                    onChange={setDestination}
                    placeholder="Where do you want to go?"
                    className="h-12 rounded-xl border-gray-200 text-[#0B1F33] bg-gray-50 focus:bg-white focus:border-[#38BDF8] transition-colors font-medium"
                  />
                </div>

                {/* Departure */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <CalendarDays className="w-3.5 h-3.5" /> Departure
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    onClick={(e) => { if ((e.currentTarget as any).showPicker) (e.currentTarget as any).showPicker() }}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-colors"
                  />
                </div>

                {/* Return */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <CalendarDays className="w-3.5 h-3.5" /> Return
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onClick={(e) => { if ((e.currentTarget as any).showPicker) (e.currentTarget as any).showPicker() }}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-colors"
                  />
                </div>

              </div>

              {/* Travellers + CTA row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                {/* Travellers */}
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" /> Travellers
                  </label>
                  <div className="flex items-center h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setTravellers(prev => Math.max(1, Number(prev) - 1).toString())}
                      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-[#38BDF8]/20 text-gray-600 flex items-center justify-center font-bold text-lg leading-none transition-colors"
                    >−</button>
                    <span className="flex-1 text-center font-bold text-[#0B1F33] text-base">{travellers}</span>
                    <button
                      type="button"
                      onClick={() => setTravellers(prev => Math.min(20, Number(prev) + 1).toString())}
                      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-[#38BDF8]/20 text-gray-600 flex items-center justify-center font-bold text-lg leading-none transition-colors"
                    >+</button>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleSearch}
                  className="flex-[2] h-12 bg-gradient-to-r from-[#FF7A59] to-[#FFB36B] hover:from-[#ff6b47] hover:to-[#ffa855] text-white font-bold text-base rounded-xl shadow-lg shadow-[#FF7A59]/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Plan My Trip with AI
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm"
        >
          <span className="flex items-center gap-1.5"><span className="text-[#FFB36B]">★★★★★</span> 4.9/5 rating</span>
          <span className="w-px h-4 bg-white/20" />
          <span>10,000+ trips planned</span>
          <span className="w-px h-4 bg-white/20" />
          <span>No account required</span>
        </motion.div>

      </div>
    </section>
  )
}
