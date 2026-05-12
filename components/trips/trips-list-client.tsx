"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTripsSnapshot, saveTripsSnapshot } from "@/lib/offline/cache"

type TripListItem = {
  id: string
  title: string
  description: string | null
  status: string
  travelersCount: number
  startDate: string | null
  primaryDestination?: { name: string } | null
}

export function TripsListClient({ initialTrips }: { initialTrips: TripListItem[] }) {
  const [trips, setTrips] = useState(initialTrips)

  useEffect(() => {
    if (initialTrips.length > 0) saveTripsSnapshot(initialTrips)
    if (initialTrips.length === 0 && !navigator.onLine) {
      const cached = getTripsSnapshot<TripListItem[]>()
      if (cached) setTrips(cached)
    }
  }, [initialTrips])

  if (trips.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No trips yet. Create your first trip.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {trips.map((trip) => (
        <Link key={trip.id} href={`/trips/${trip.id}`} className="group relative block aspect-[16/9] overflow-hidden rounded-[32px] border border-white/10 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
          {/* Destination Image */}
          <img 
            src={`https://images.unsplash.com/photo-1512100356956-c12872638f5f?q=80&w=800&auto=format&fit=crop`} // Fallback image
            alt={trip.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] brightness-75"
          />
          {/* Custom destination-specific image logic could be added here */}
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33] via-[#0B1F33]/40 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-[#FF7A59] text-white text-[9px] font-bold uppercase tracking-widest rounded-md shadow-lg shadow-[#FF7A59]/40">
                {trip.status}
              </span>
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                {trip.travelersCount} Travelers
              </span>
            </div>
            
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
              {trip.title}
            </h3>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                <CalendarDays className="w-4 h-4 text-[#FFB36B]" />
                {trip.startDate ? trip.startDate.slice(0, 10) : "TBD"}
              </div>
              <div className="text-[#FFB36B] font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore <span className="text-lg">→</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

