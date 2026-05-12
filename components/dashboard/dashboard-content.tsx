"use client"

import { motion } from "framer-motion"
import {
  Clock3,
  MapPin,
  PlaneTakeoff,
  Sparkles,
  Plus,
  ArrowRight,
} from "lucide-react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardContent({ firstName, trips = [] }: { firstName?: string | null; trips?: any[] }) {
  return (
    <div className="space-y-8">
      {/* Welcome + CTA */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[#0F4C81] to-[#38BDF8] p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-sm text-white/70 mt-1">
              Ready to plan your next adventure?
            </p>
          </div>
          <Button
            size="lg"
            className="w-full sm:w-auto bg-white text-[#0F4C81] hover:bg-white/90 font-semibold shadow-lg group"
            asChild
          >
            <Link href="/ai-itinerary">
              <Sparkles className="mr-2 h-4 w-4" />
              Plan a New Trip
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </motion.section>

      {/* Quick Stats */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="grid gap-4 grid-cols-2"
      >
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 flex items-center justify-center shrink-0">
              <PlaneTakeoff className="h-5 w-5 text-[#0F4C81]" />
            </div>
            <div>
              <p className="text-2xl font-bold">{trips.length}</p>
              <p className="text-xs text-muted-foreground">Total Trips</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF7A59]/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-[#FF7A59]" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {new Set(trips.map((t: any) => t.primaryDestination?.name).filter(Boolean)).size}
              </p>
              <p className="text-xs text-muted-foreground">Destinations</p>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Trips List */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Your Trips</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/trips">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {trips.length > 0 ? (
              trips.slice(0, 5).map((trip: any) => (
                <Link
                  href={`/trips/${trip.id}`}
                  key={trip.id}
                  className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#38BDF8]/20 to-[#0F4C81]/20 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-[#0F4C81]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium group-hover:text-[#0F4C81] transition-colors">{trip.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {trip.primaryDestination?.name || "Trip plan"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    {new Date(trip.updatedAt).toLocaleDateString()}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                  <PlaneTakeoff className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">No trips yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Create your first AI-powered itinerary
                  </p>
                </div>
                <Button size="sm" asChild>
                  <Link href="/ai-itinerary">
                    <Plus className="mr-2 h-4 w-4" />
                    Plan a Trip
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  )
}
