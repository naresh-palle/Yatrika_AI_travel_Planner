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
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Trips List - Minimalist */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">Your Trips</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage and view your planned itineraries.</p>
          </div>
          <Button size="sm" className="bg-[#FF7A59] hover:bg-[#ff6b47] rounded-full px-6" asChild>
            <Link href="/ai-itinerary" className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              New Trip
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {trips.length > 0 ? (
            trips.map((trip, idx) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                <Link
                  href={`/trips/${trip.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-border/50 p-5 bg-card hover:bg-muted/30 hover:border-[#FF7A59]/40 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FF7A59]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 text-[#FF7A59]" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground group-hover:text-[#FF7A59] transition-colors">{trip.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{trip.primaryDestination?.name || "Planned trip"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs font-bold text-foreground uppercase tracking-wider">{new Date(trip.updatedAt).toLocaleDateString()}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Updated</span>
                    </div>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-widest font-bold">
                      {trip.status || "Planned"}
                    </Badge>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-dashed">
              <div className="w-16 h-16 rounded-full bg-[#FF7A59]/10 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-[#FF7A59]" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No itineraries yet</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                Start your journey by creating your first AI-powered travel plan.
              </p>
              <Button asChild className="bg-[#FF7A59] hover:bg-[#ff6b47] rounded-full px-8 h-12">
                <Link href="/ai-itinerary" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Plan My First Trip
                </Link>
              </Button>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  )

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
