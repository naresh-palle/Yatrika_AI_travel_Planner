"use client"

import { motion } from "framer-motion"
import {
  CalendarDays,
  DollarSign,
  PlaneTakeoff,
  Clock3,
  MapPin,
  Sparkles,
} from "lucide-react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function DashboardContent({ firstName, trips = [] }: { firstName?: string | null; trips?: any[] }) {
  const router = useRouter()
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<string>("")
  const [currency, setCurrency] = useState("USD")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("MISC")
  const [details, setDetails] = useState("")
  const [isSavingBudget, setIsSavingBudget] = useState(false)

  const totalBudget = trips.reduce((acc, trip) => {
    const tripBudget = trip.budgets?.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0) || 0
    return acc + tripBudget
  }, 0)

  const handleSaveBudget = async () => {
    if (!selectedTrip || !amount || isNaN(Number(amount))) {
      toast.error("Please select a trip and enter a valid amount")
      return
    }

    setIsSavingBudget(true)
    try {
      const res = await fetch(`/api/trips/${selectedTrip}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          amount: Number(amount),
          currency,
          details: details || undefined,
        }),
      })

      if (!res.ok) throw new Error("Failed to save budget")

      toast.success("Budget saved successfully")
      setBudgetOpen(false)
      setAmount("")
      setDetails("")
      router.refresh()
    } catch (error) {
      toast.error("Failed to save budget. Please try again.")
    } finally {
      setIsSavingBudget(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F4C81] to-[#1a6bb5] p-6 sm:p-8 text-white"
      >
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FF7A59]/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-white/60 text-sm font-medium mb-1">Welcome back</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {firstName ? firstName : "Traveler"} ✈️
            </h1>
            <p className="text-white/70 text-sm mt-1.5">
              Ready to plan your next adventure?
            </p>
          </div>
          <Button
            asChild
            className="shrink-0 bg-white text-[#0F4C81] hover:bg-white/90 font-bold shadow-lg px-6"
          >
            <Link href="/ai-itinerary" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Plan New Trip
            </Link>
          </Button>
        </div>
      </motion.section>

      {/* Stats Row */}
      <section className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Trips</CardTitle>
              <PlaneTakeoff className="h-4 w-4 text-[#38BDF8]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{trips.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Planned over all time</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Planned Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalBudget.toLocaleString()}</div>
              <button
                onClick={() => setBudgetOpen(true)}
                className="text-xs text-[#38BDF8] hover:underline font-medium mt-1 focus:outline-none"
              >
                Manage Budgets →
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Trips List */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.15 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Your Trips</CardTitle>
              <CardDescription>All your planned and active itineraries.</CardDescription>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/ai-itinerary" className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                New
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {trips.length > 0 ? (
              trips.map((trip, idx) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                >
                  <Link
                    href={`/trips/${trip.id}`}
                    className="group flex items-center justify-between rounded-xl border border-border/50 p-4 hover:bg-muted/40 hover:border-[#38BDF8]/40 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#38BDF8]/20 to-[#0F4C81]/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[#38BDF8]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-[#38BDF8] transition-colors">{trip.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{trip.primaryDestination?.name || "Planned trip"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:flex items-center text-xs text-muted-foreground gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {new Date(trip.updatedAt).toLocaleDateString()}
                      </div>
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {trip.status || "Planned"}
                      </Badge>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-[#38BDF8]/10 flex items-center justify-center mb-4">
                  <PlaneTakeoff className="w-6 h-6 text-[#38BDF8]" />
                </div>
                <p className="font-medium text-foreground mb-1">No trips yet</p>
                <p className="text-sm text-muted-foreground mb-4">Start planning your first AI-generated adventure</p>
                <Button asChild size="sm" className="bg-gradient-to-r from-[#FF7A59] to-[#FFB36B] text-white border-0">
                  <Link href="/ai-itinerary" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Plan My First Trip
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>

      {/* Budget Dialog */}
      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Trip Budget</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="trip">Select Trip</Label>
              <Select value={selectedTrip} onValueChange={setSelectedTrip}>
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
                <Select value={currency} onValueChange={setCurrency}>
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
                <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
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
              <Input id="details" placeholder="e.g. Flight to Paris, Hotel deposit..." value={details} onChange={(e) => setDetails(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveBudget} disabled={isSavingBudget} className="w-full">
              {isSavingBudget ? "Saving..." : "Save Budget Details"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
