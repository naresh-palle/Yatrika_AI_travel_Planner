"use client"

import { motion } from "framer-motion"
import {
  Bell,
  CalendarDays,
  Clock3,
  DollarSign,
  MapPin,
  PlaneTakeoff,
  Star,
  Users,
} from "lucide-react"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

const savedDestinations = [
  { name: "Alleppey Backwaters", country: "India", score: "4.8", type: "Nature" },
  { name: "Blue City Jodhpur", country: "India", score: "4.7", type: "Culture" },
  { name: "Hampi Ruins", country: "India", score: "4.9", type: "History" },
  { name: "Valley of Flowers", country: "India", score: "4.8", type: "Adventure" },
] as const

export function DashboardContent({ firstName, trips = [] }: { firstName?: string | null; trips?: any[] }) {
  const [budgetOpen, setBudgetOpen] = useState(false)
  
  const dynamicOverview = [
    { label: "Total Trips", value: trips.length.toString(), icon: PlaneTakeoff, delta: "Lifetime" },
    { label: "Upcoming Activities", value: "0", icon: CalendarDays, delta: "Coming soon" },
    { label: "Collaborators", value: "0", icon: Users, delta: "Across all trips" },
    { 
      label: "Planned Budget", 
      value: "$0", 
      icon: DollarSign, 
      delta: (
        <button onClick={() => setBudgetOpen(true)} className="text-[#38BDF8] hover:underline font-medium focus:outline-none">
          Manage Budgets &rarr;
        </button>
      )
    },
  ]
  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here is what is happening across your travel plans today.
          </p>
        </div>
        <Button className="w-full sm:w-auto" asChild>
          <Link href="/ai-itinerary">Create New Trip</Link>
        </Button>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dynamicOverview.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            className="h-full"
          >
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.delta}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Your Trips</CardTitle>
              <CardDescription>All your planned and active trips.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trips.length > 0 ? (
                trips.map((trip) => (
                  <Link href={`/trips/${trip.id}`} key={trip.id} className="block hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{trip.title}</p>
                        <p className="text-xs text-muted-foreground">{trip.primaryDestination?.name || "Planned trip"}</p>
                      </div>
                      <div className="inline-flex items-center text-xs text-muted-foreground">
                        <Clock3 className="mr-1 h-3.5 w-3.5" />
                        {new Date(trip.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-6">You haven't planned any trips yet.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
              <CardDescription>Actionable travel alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground text-center py-6">No new notifications.</div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Saved Destinations</CardTitle>
            <CardDescription>Places you bookmarked for future trips.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {savedDestinations.map((dest) => (
              <div key={dest.name} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="outline">{dest.type}</Badge>
                  <div className="inline-flex items-center text-xs">
                    <Star className="mr-1 h-3.5 w-3.5 fill-current text-yellow-500" />
                    {dest.score}
                  </div>
                </div>
                <p className="text-sm font-medium">{dest.name}</p>
                <p className="mt-1 inline-flex items-center text-xs text-muted-foreground">
                  <MapPin className="mr-1 h-3.5 w-3.5" />
                  {dest.country}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.section>
      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Trip Budget</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="trip">Select Trip</Label>
              <Select>
                <SelectTrigger id="trip">
                  <SelectValue placeholder="Choose a trip..." />
                </SelectTrigger>
                <SelectContent>
                  {trips.length > 0 ? trips.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  )) : (
                    <SelectItem value="none" disabled>No trips available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select defaultValue="USD">
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue="MISC">
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRANSPORT">Transport</SelectItem>
                  <SelectItem value="STAY">Accommodation</SelectItem>
                  <SelectItem value="FOOD">Food & Dining</SelectItem>
                  <SelectItem value="ACTIVITIES">Activities</SelectItem>
                  <SelectItem value="SHOPPING">Shopping</SelectItem>
                  <SelectItem value="MISC">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Additional Details</Label>
              <Input id="details" placeholder="e.g. Flight to Paris, Hotel deposit..." />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setBudgetOpen(false)} className="w-full">Save Budget Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

