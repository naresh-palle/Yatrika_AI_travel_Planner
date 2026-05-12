"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Download, Check, MapPin, CalendarDays, DollarSign, Plane, Sparkles, Heart, Users, Utensils, Camera, Car, Star, Home, Share2, Mail, Pencil, MessageSquare, ExternalLink, ChevronRight, X } from "lucide-react";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { useAuth, useClerk } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const ItineraryMap = dynamic(() => import("@/components/map/ItineraryMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-muted animate-pulse rounded-3xl flex items-center justify-center text-muted-foreground">
      Loading map engine...
    </div>
  ),
});

type Activity = {
  time: string;
  name: string;
  description: string;
  type: string;
  coordinates?: { lat: number; lng: number };
};

type DayPlan = {
  day: number;
  title: string;
  estimated_budget: string;
  activities: Activity[];
};

type Itinerary = {
  destination: string;
  tripTitle: string;
  category: string;
  tagline: string;
  flights: {
    outbound: string;
    return: string;
    estimated_cost: string;
  };
  hotel: {
    name: string;
    description: string;
    estimated_cost: string;
  };
  days: DayPlan[];
  tips: string[];
};

const VIBES = [
  { label: "🏔 Adventure", value: "Adventure" },
  { label: "🏛 Culture", value: "Culture" },
  { label: "🍜 Food", value: "Food" },
  { label: "🌊 Relaxation", value: "Relaxation" },
  { label: "🎉 Nightlife", value: "Nightlife" },
  { label: "🌿 Nature", value: "Nature" },
  { label: "💫 Romance", value: "Romance" },
  { label: "📸 Photography", value: "Photography" },
];

const TRAVELER_TYPES = [
  { label: "👤 Solo", value: "solo" },
  { label: "👩‍❤️‍👨 Couple", value: "couple" },
  { label: "👨‍👩‍👧‍👦 Family with kids", value: "family" },
  { label: "👯 Friends", value: "friends" },
  { label: "🚌 Group / Batch", value: "group" },
];

const LOADING_PHRASES = [
  "Crafting your journey…",
  "Discovering hidden gems…",
  "Optimizing your route…",
  "Curating local experiences…"
];

export default function AiItineraryPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState("mid-range");
  const [hotelStyle, setHotelStyle] = useState("Boutique");
  const [selectedVibes, setSelectedVibes] = useState<string[]>(["Adventure"]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [requireFlights, setRequireFlights] = useState(true);
  const [flightLayover, setFlightLayover] = useState("Any flights");
  const [customKeywords, setCustomKeywords] = useState("");
  const [travelerType, setTravelerType] = useState("couple");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0);
  const [error, setError] = useState("");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);

  const itineraryRef = useRef<HTMLDivElement>(null);
  
  const { isSignedIn } = useAuth();
  const clerk = useClerk();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingPhraseIdx((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    // Check URL parameters on mount
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const destParam = params.get("destination");
      if (destParam) setDestination(destParam);
      
      const originParam = params.get("origin");
      if (originParam) setOrigin(originParam);

      const startParam = params.get("startDate");
      if (startParam) setStartDate(startParam);

      const endParam = params.get("endDate");
      if (endParam) setEndDate(endParam);

      if (startParam && endParam) {
        const start = new Date(startParam);
        const end = new Date(endParam);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDays(diffDays.toString());
      }
      
      const travellersParam = params.get("travellers");
    }
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) setDays(diffDays.toString());
    }
  }, [startDate, endDate]);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const generateItinerary = async () => {
    if (!destination.trim()) {
      setError("Please enter a destination to get started.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select both a start date and end date to generate your itinerary.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    setError("");
    setIsLoading(true);
    setItinerary(null);

    const vibeStr = selectedVibes.length ? selectedVibes.join(", ") : "Adventure";
    
    const flightInstructions = requireFlights
      ? `\nOrigin City: ${origin || "Anywhere"}\nFlight Preference: ${flightLayover}\nFlights: include suggested outbound and return flights matching the preference.`
      : `\nFlights: Do NOT include flights. Return null for the flights object.`;

    const dateInstructions = startDate ? `\nStart Date: ${startDate}` : "";
    const keywordInstructions = customKeywords.trim() ? `\nCustom Requirements/Keywords: ${customKeywords.trim()}` : "";

    const prompt = `You are an expert travel planner. Create a detailed ${days || 5}-day itinerary for: ${destination}.
${flightInstructions}${dateInstructions}${keywordInstructions}
Travelers: ${travelerType}
Travel style: ${vibeStr}
Hotel preference: ${hotelStyle}
Budget level: ${budget}
Duration: ${days || 5} days

Respond with ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "destination": "Full destination name",
  "tripTitle": "A catchy, creative title for the trip (e.g. Goa's Opulent Shores & Heritage Trails)",
  "category": "Trip category (e.g. CITY BREAK, ADVENTURE, RELAXATION)",
  "tagline": "One evocative sentence about this destination",
  "flights": {
    "outbound": "Suggested outbound flight details (e.g. Non-stop, 4h 30m)",
    "return": "Suggested return flight details",
    "estimated_cost": "₹X,XXX or $XXX"
  }, // If Flights is set to NOT include flights, make this entire flights object null
  "hotel": {
    "name": "Suggested hotel name",
    "description": "Short description of why it fits the vibe",
    "estimated_cost": "₹X,XXX or $XXX per night"
  },
  "days": [
    {
      "day": 1,
      "title": "Theme for the day",
      "estimated_budget": "₹X,XXX or $XXX",
      "activities": [
        {
          "time": "09:00 AM",
          "name": "Activity name",
          "description": "2 sentence engaging description with practical details",
          "type": "attraction|food|transport|experience|stay",
          "coordinates": { "lat": number, "lng": number }
        }
      ]
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4"]
}

Include 4-6 activities per day. Make descriptions vivid and genuinely useful. Include local food recommendations. Budget should be realistic for ${budget} traveler. For each activity, provide accurate latitude and longitude coordinates. CRITICAL: Do NOT return null for coordinates. If you don't know the exact ones, provide highly plausible coordinates for the location in ${destination}.`;

    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const raw = data.content.map((c: any) => c.text || "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      
      setItinerary(parsed);
      setTimeout(() => {
        itineraryRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("Could not generate itinerary. Please check your connection or API key and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!isSignedIn) {
      clerk.redirectToSignIn();
      return;
    }
    if (!itinerary) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${days || 5}-Day Trip to ${itinerary.destination}`.substring(0, 120),
          description: JSON.stringify(itinerary),
          destinationName: itinerary.destination.substring(0, 160),
          travelersCount: 1,
          startDate: startDate ? startDate : undefined,
          endDate: endDate ? endDate : undefined,
        }),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.data && json.data.id) {
          setSavedTripId(json.data.id);
        }
        setHasSaved(true);
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Could not save trip. Make sure you are logged in.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!isSignedIn) {
      clerk.redirectToSignIn();
      return;
    }
    window.print();
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `My Trip to ${itinerary?.destination}`,
          text: `Check out my travel plan for ${itinerary?.destination}!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      const text = encodeURIComponent(`Check out my travel plan for ${itinerary?.destination}! ${window.location.href}`);
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }
  };

  const handleMail = () => {
    const subject = encodeURIComponent(`My Trip to ${itinerary?.destination}`);
    const body = encodeURIComponent(`Check out my travel plan for ${itinerary?.destination}!\n\nDestination: ${itinerary?.destination}\nTagline: ${itinerary?.tagline}\n\nGenerated by Yatrika AI.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const getTagClass = (type: string) => {
    const map: Record<string, string> = {
      food: "bg-orange-100 text-orange-800 border-orange-200", 
      restaurant: "bg-orange-100 text-orange-800 border-orange-200", 
      meal: "bg-orange-100 text-orange-800 border-orange-200",
      attraction: "bg-green-100 text-green-800 border-green-200", 
      sightseeing: "bg-green-100 text-green-800 border-green-200",
      transport: "bg-blue-100 text-blue-800 border-blue-200", 
      travel: "bg-blue-100 text-blue-800 border-blue-200",
      hotel: "bg-purple-100 text-purple-800 border-purple-200", 
      accommodation: "bg-purple-100 text-purple-800 border-purple-200",
      experience: "bg-amber-100 text-amber-800 border-amber-200", 
      activity: "bg-amber-100 text-amber-800 border-amber-200"
    };
    const t = (type || "").toLowerCase();
    for (const k in map) {
      if (t.includes(k)) return map[k];
    }
    return "bg-secondary text-secondary-foreground border-border";
  };

  const getActivityIcon = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("food") || t.includes("restaurant") || t.includes("meal")) return <Utensils className="w-4 h-4 text-orange-500" />;
    if (t.includes("attraction") || t.includes("sightseeing")) return <Camera className="w-4 h-4 text-green-500" />;
    if (t.includes("transport") || t.includes("travel")) return <Car className="w-4 h-4 text-blue-500" />;
    if (t.includes("hotel") || t.includes("stay") || t.includes("accommodation")) return <Home className="w-4 h-4 text-purple-500" />;
    return <Star className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      <div className="relative z-10 container mx-auto px-4 pt-10">
        
        <AnimatePresence mode="wait">
          {!itinerary && !isLoading && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[80vh] py-12"
            >
              <div className="text-center max-w-3xl mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] text-sm font-semibold mb-6">
                  <Sparkles className="w-4 h-4" />
                  AI Travel Planner
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-5 tracking-tight">
                  Plan your dream trip<br />
                  <span className="text-[#38BDF8] italic font-serif">in seconds</span>
                </h1>
                <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  Enter your destination and preferences. Our AI generates a complete, personalized day-by-day itinerary — flights, hotels, activities, and budget included.
                </p>
              </div>

              <div className="w-full max-w-3xl bg-card text-card-foreground border rounded-3xl shadow-sm overflow-hidden">
                {/* Form header */}
                <div className="bg-gradient-to-r from-[#0F4C81]/5 to-[#38BDF8]/5 border-b border-border/50 px-6 md:px-10 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                    Create your itinerary
                  </div>
                  <label className="text-[12px] flex items-center gap-1.5 cursor-pointer text-muted-foreground font-medium hover:text-foreground transition-colors">
                    <input type="checkbox" checked={requireFlights} onChange={e => setRequireFlights(e.target.checked)} className="w-3.5 h-3.5 accent-[#38BDF8]" />
                    <Plane className="w-3 h-3" />
                    Include Flights
                  </label>
                </div>

                <div className="p-6 md:p-10">

                <div className="mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-[#38BDF8] mb-3">
                    <MapPin className="w-3.5 h-3.5" /> Trip Details
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                  {/* Traveler Type Selection */}
                  <div className="md:col-span-12 mb-2">
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3 block">Who&apos;s going?</label>
                    <div className="flex flex-wrap gap-2">
                      {TRAVELER_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setTravelerType(type.value)}
                          className={`px-4 py-2 text-sm rounded-xl transition-all border ${
                            travelerType === type.value
                              ? "bg-[#38BDF8] text-[#0B1F33] border-[#38BDF8] font-medium"
                              : "bg-background text-muted-foreground border-border hover:border-[#38BDF8] hover:text-[#38BDF8]"
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-12 hidden">{/* spacer */}</div>
                  
                  {requireFlights && (
                    <>
                      <div className="md:col-span-4 flex flex-col gap-1.5">
                        <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Origin City</label>
                        <LocationAutocomplete
                          value={origin}
                          onChange={setOrigin}
                          placeholder="Where from?"
                        />
                      </div>
                      <div className="md:col-span-4 flex flex-col gap-1.5">
                        <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Layovers</label>
                        <select
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          value={flightLayover}
                          onChange={(e) => setFlightLayover(e.target.value)}
                        >
                          <option value="Any flights">Any flights</option>
                          <option value="Non-stop only">Non-stop only</option>
                          <option value="Up to 1 stop">Up to 1 stop</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className={`flex flex-col gap-1.5 ${requireFlights ? 'md:col-span-4' : 'md:col-span-12'}`}>
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Destination</label>
                    <LocationAutocomplete
                      value={destination}
                      onChange={setDestination}
                      placeholder="e.g. Goa, Tokyo, Rajasthan..."
                    />
                  </div>

                  <div className="md:col-span-4 flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Start Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-muted-foreground"
                      value={startDate}
                      onClick={(e) => { if (e.currentTarget.showPicker) e.currentTarget.showPicker(); }}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-4 flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">End Date</label>
                    <input
                      type="date"
                      min={startDate || new Date().toISOString().split("T")[0]}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-muted-foreground"
                      value={endDate}
                      onClick={(e) => { if (e.currentTarget.showPicker) e.currentTarget.showPicker(); }}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-4 flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Days</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-center"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-6 flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Budget</label>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    >
                      <option value="budget">Budget</option>
                      <option value="mid-range">Mid-range</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                  <div className="md:col-span-6 flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Hotel Style</label>
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={hotelStyle}
                      onChange={(e) => setHotelStyle(e.target.value)}
                    >
                      <option value="Boutique">Boutique</option>
                      <option value="Resort">Resort</option>
                      <option value="Hostel">Hostel</option>
                      <option value="Chain">Chain / Standard</option>
                      <option value="Villa">Villa / Airbnb</option>
                    </select>
                  </div>
                  </div>

                {/* Section divider */}
                <div className="border-t border-border/40 my-6" />

                {/* Section: Special Requests */}
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-[#38BDF8] mb-3">
                  <Heart className="w-3.5 h-3.5" /> Special Requests (Optional)
                </div>

                <div className="mb-6 flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Keywords or custom requirements</label>
                  <textarea
                    className="flex w-full rounded-xl border border-input bg-background px-3 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none h-20"
                    placeholder="e.g. Include wheelchair accessible places, vegan restaurants only, prefer walking tours, need a layover in Dubai..."
                    value={customKeywords}
                    onChange={(e) => setCustomKeywords(e.target.value)}
                  />
                </div>

                {/* Section divider */}
                <div className="border-t border-border/40 my-6" />

                {/* Section: Travel Vibe */}
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-[#38BDF8] mb-3">
                  <Users className="w-3.5 h-3.5" /> Travel Vibe
                </div>

                <div className="mb-8">
                  <div className="text-xs text-muted-foreground mb-4">Select all that apply</div>
                  <div className="flex flex-wrap gap-2">
                    {VIBES.map((vibe) => (
                      <button
                        key={vibe.value}
                        onClick={() => toggleVibe(vibe.value)}
                        className={`px-4 py-2 text-sm rounded-full transition-all border ${
                          selectedVibes.includes(vibe.value)
                            ? "bg-[#38BDF8] text-[#0B1F33] border-[#38BDF8] font-medium"
                            : "bg-background text-muted-foreground border-border hover:border-[#38BDF8] hover:text-[#38BDF8]"
                        }`}
                      >
                        {vibe.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate CTA */}
                <div className="border-t border-border/40 mt-6 pt-6">
                  <button
                    onClick={generateItinerary}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#FF7A59] to-[#FFB36B] hover:from-[#ff6b47] hover:to-[#ffa855] hover:shadow-xl hover:shadow-[#FF7A59]/20 text-white font-bold rounded-xl py-4 text-base flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] border-0"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate My Itinerary
                  </button>

                  {error && (
                    <div className="mt-4 bg-destructive/10 border border-destructive text-destructive text-sm rounded-lg p-3 text-center">
                      {error}
                    </div>
                  )}
                </div>

                </div>{/* end inner padding */}
              </div>{/* end card */}
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-12 h-12 border-2 border-[#38BDF8]/20 border-t-[#38BDF8] rounded-full animate-spin mb-6" />
              <div className="font-serif text-2xl text-[#38BDF8] italic mb-2">
                {LOADING_PHRASES[loadingPhraseIdx]}
              </div>
              <div className="text-muted-foreground text-sm">
                Our AI is handpicking the best experiences for you
              </div>
            </motion.div>
          )}

          {itinerary && !isLoading && (
            <motion.div
              key="itinerary"
              ref={itineraryRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-6 lg:py-12 max-w-[1400px] mx-auto print:py-0 print:max-w-none print:bg-white print:text-black print:absolute print:inset-0 print:z-50"
            >
              <div className="flex flex-col lg:flex-row gap-10 items-start">
                
                {/* Left Column: Chat / Memento Style Panel */}
                <div className="w-full lg:w-[380px] lg:sticky lg:top-10 space-y-6 print:hidden">
                  <div className="bg-card border rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                    {/* Panel Header */}
                    <div className="p-5 border-b flex items-center justify-between bg-muted/20">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7A59] to-[#FFB36B] flex items-center justify-center text-white font-bold text-sm">
                          M
                        </div>
                        <div>
                          <div className="text-sm font-bold">Memento</div>
                          <div className="text-[10px] text-muted-foreground">Your travel companion</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setItinerary(null);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-[10px] uppercase tracking-wider font-bold text-[#FF7A59] hover:underline flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" /> Quick form
                      </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="p-6 flex-1 space-y-6 overflow-y-auto max-h-[400px]">
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-[10px] font-bold">M</div>
                        <div className="bg-muted/50 rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed">
                          Hi — I&apos;m Memento. Tell me about the trip you&apos;re dreaming of, and I&apos;ll handcraft something just for you.
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <div className="bg-[#FF7A59] text-white rounded-2xl rounded-tr-none p-3 text-sm shadow-md shadow-[#FF7A59]/20">
                          Yes, generate it.
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-[10px] font-bold">M</div>
                        <div className="bg-muted/50 rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed">
                          Done — your {itinerary.destination} itinerary is on the right. I&apos;ve layered in smart hacks. Tell me what to tweak — anything from &quot;make day 3 less touristy&quot; to &quot;add a romantic dinner&quot;.
                        </div>
                      </div>
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t bg-muted/10">
                      <div className="relative">
                        <input 
                          type="text"
                          placeholder="Make day 3 less touristy..."
                          className="w-full bg-background border rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A59]/30 transition-all"
                        />
                        <button className="absolute right-2 top-1.5 p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="bg-[#0B1F33]/80 backdrop-blur-md border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-5">
                    <div className="inline-block px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-md">Actions</div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleDownloadPdf}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold border border-white/10 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                      >
                        <Share2 className="w-4 h-4" /> Export
                      </button>
                      <button
                        onClick={() => {
                          setItinerary(null);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold border border-white/10 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold bg-[#25D366] text-white rounded-2xl hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/20 active:scale-95"
                      >
                        <MessageSquare className="w-5 h-5" /> WhatsApp
                      </button>
                      <button
                        onClick={handleMail}
                        className="w-16 h-16 flex items-center justify-center border border-white/10 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                      >
                        <Mail className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <button
                      onClick={handleSaveTrip}
                      disabled={isSaving || hasSaved}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold rounded-2xl transition-all shadow-lg active:scale-95 ${
                        hasSaved
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-gradient-to-r from-[#FF7A59] to-[#FFB36B] text-white hover:shadow-[#FF7A59]/40"
                      }`}
                    >
                      {isSaving ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : hasSaved ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {hasSaved ? "Saved to Profile!" : "Save Itinerary"}
                    </button>
                  </div>
                </div>

                {/* Right Column: Itinerary Details */}
                <div className="flex-1 w-full space-y-8">
                  {/* Cinematic Header from Screenshot */}
                  <div className="relative pt-20 pb-12 px-8 md:px-12 bg-gradient-to-br from-[#7c3a2a] via-[#5c2a1c] to-background rounded-[40px] overflow-hidden shadow-2xl border border-white/10 mb-2">
                    <div className="absolute top-8 right-8 flex items-center gap-3 print:hidden">
                      <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all active:scale-95 group">
                        <Heart className="w-4 h-4 group-hover:fill-red-500 group-hover:text-red-500 transition-all" />
                      </button>
                      <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all active:scale-95">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button onClick={handleMail} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all active:scale-95">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button onClick={handleDownloadPdf} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition-all active:scale-95">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="relative z-10">
                      <span className="text-[11px] tracking-[0.3em] uppercase text-white/60 font-bold mb-4 block">
                        {itinerary.category || "Trip Plan"} • {days || 5} days
                      </span>
                      <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mb-3 leading-[1.1] tracking-tight">
                        {itinerary.tripTitle || itinerary.destination}
                      </h2>
                      <div className="flex items-center gap-2 text-white/80 text-lg md:text-xl font-medium">
                        <MapPin className="w-5 h-5 text-[#FFB36B]" />
                        {itinerary.destination}
                      </div>
                    </div>
                  </div>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <CalendarDays className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">When</span>
                      </div>
                      <div className="font-bold text-sm">
                        {startDate && endDate ? `${startDate} — ${endDate}` : `${days} Days`}
                      </div>
                    </div>
                    <div className="bg-card border rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Users className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Travelers</span>
                      </div>
                      <div className="font-bold text-sm capitalize">
                        {travelerType.replace("-", " ")}
                      </div>
                    </div>
                    <div className="bg-card border rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Budget</span>
                      </div>
                      <div className="font-bold text-sm capitalize">
                        {budget}
                      </div>
                    </div>
                  </div>

                  {/* The Vibe Section */}
                  <div className="bg-card border rounded-3xl p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                      <Sparkles className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#FF7A59] mb-6 block">The Vibe</span>
                      <h3 className="font-serif text-2xl md:text-3xl font-medium italic mb-6 leading-relaxed text-foreground/90">
                        &quot;{itinerary.tagline}&quot;
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                        This exclusive {days}-day itinerary offers an immersive exploration of {itinerary.destination}. 
                        Designed for the {selectedVibes[0] || "adventure"} seeker, it combines authentic local experiences 
                        with curated comforts, ensuring a memorable journey.
                      </p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {selectedVibes.map(v => (
                          <span key={v} className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold uppercase tracking-wider">{v}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  <div className="print:hidden">
                    <ItineraryMap 
                      days={itinerary.days} 
                      destination={itinerary.destination} 
                    />
                  </div>

                  {/* Itinerary Days */}
                  <div className="space-y-8">
                    {itinerary.days.map((day, di) => (
                      <div key={di} className="bg-card border rounded-3xl overflow-hidden shadow-sm">
                        <div className="bg-muted/30 px-8 py-6 border-b flex items-center justify-between">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">Day {day.day}</div>
                            <h4 className="font-serif text-xl font-bold">{day.title}</h4>
                          </div>
                          <div className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                            Est. {day.estimated_budget}
                          </div>
                        </div>
                        <div className="p-8 space-y-8">
                          {day.activities.map((act, ai) => (
                            <div key={ai} className="flex gap-6 relative">
                              <div className="w-16 shrink-0 pt-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{act.time}</span>
                              </div>
                              <div className="w-px bg-border absolute left-[72px] top-6 bottom-0" />
                              <div className="w-8 h-8 rounded-full border bg-background flex items-center justify-center shrink-0 z-10 shadow-sm">
                                {getActivityIcon(act.type)}
                              </div>
                              <div className="pb-8 flex-1">
                                <h5 className="font-bold text-[15px] mb-2">{act.name}</h5>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{act.description}</p>
                                <span className={`inline-block text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${getTagClass(act.type)}`}>
                                  {act.type}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  {itinerary.tips && (
                    <div className="bg-[#FF7A59]/5 border border-[#FF7A59]/20 rounded-3xl p-8">
                      <h4 className="font-serif text-xl font-bold italic text-[#FF7A59] mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Insider Tips
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {itinerary.tips.map((tip, i) => (
                          <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                            <span className="text-[#FF7A59] mt-1">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
