"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Download, Check } from "lucide-react";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";

type Activity = {
  time: string;
  name: string;
  description: string;
  type: string;
};

type DayPlan = {
  day: number;
  title: string;
  estimated_budget: string;
  activities: Activity[];
};

type Itinerary = {
  destination: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhraseIdx, setLoadingPhraseIdx] = useState(0);
  const [error, setError] = useState("");
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);

  const itineraryRef = useRef<HTMLDivElement>(null);

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
      setTimeout(() => setError(""), 3000);
      return;
    }

    setError("");
    setIsLoading(true);
    setItinerary(null);

    const vibeStr = selectedVibes.length ? selectedVibes.join(", ") : "Adventure";
    
    const flightInstructions = requireFlights
      ? `\nOrigin City: ${origin || "Anywhere"}\nFlights: include suggested outbound and return flights.`
      : `\nFlights: Do NOT include flights. Return null for the flights object.`;

    const dateInstructions = startDate ? `\nStart Date: ${startDate}` : "";

    const prompt = `You are an expert travel planner. Create a detailed ${days || 5}-day itinerary for: ${destination}.
${flightInstructions}${dateInstructions}
Travel style: ${vibeStr}
Hotel preference: ${hotelStyle}
Budget level: ${budget}
Duration: ${days || 5} days

Respond with ONLY valid JSON in this exact format, no markdown, no explanation:
{
  "destination": "Full destination name",
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
          "type": "attraction|food|transport|experience|stay"
        }
      ]
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4"]
}

Include 4-6 activities per day. Make descriptions vivid and genuinely useful. Include local food recommendations. Budget should be realistic for ${budget} traveler.`;

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
    window.print();
  };

  const getTagClass = (type: string) => {
    const map: Record<string, string> = {
      food: "bg-orange-100 text-orange-800", restaurant: "bg-orange-100 text-orange-800", meal: "bg-orange-100 text-orange-800",
      attraction: "bg-green-100 text-green-800", sightseeing: "bg-green-100 text-green-800",
      transport: "bg-blue-100 text-blue-800", travel: "bg-blue-100 text-blue-800",
      hotel: "bg-purple-100 text-purple-800", accommodation: "bg-purple-100 text-purple-800",
      experience: "bg-amber-100 text-amber-800", activity: "bg-amber-100 text-amber-800"
    };
    const t = (type || "").toLowerCase();
    for (const k in map) {
      if (t.includes(k)) return map[k];
    }
    return "bg-secondary text-secondary-foreground";
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
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                  Plan your dream trip<br />
                  <span className="text-[#38BDF8] italic font-serif">in seconds</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  Describe where you want to go. Our AI crafts a complete, day-by-day itinerary — tailored to your vibe, duration, and budget.
                </p>
              </div>

              <div className="w-full max-w-2xl bg-card text-card-foreground border rounded-3xl p-6 md:p-10 shadow-sm">
                <div className="text-xs font-semibold tracking-[0.1em] uppercase text-[#38BDF8] mb-6">
                  ✦ Create your itinerary
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
                  <div className="md:col-span-12 flex items-center justify-end mb-1">
                    <label className="text-[12px] flex items-center gap-1.5 cursor-pointer text-muted-foreground font-medium hover:text-foreground transition-colors">
                      <input type="checkbox" checked={requireFlights} onChange={e => setRequireFlights(e.target.checked)} className="w-3.5 h-3.5 accent-[#38BDF8]" />
                      Include Flights
                    </label>
                  </div>
                  
                  {requireFlights && (
                    <div className="md:col-span-6 flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Origin City</label>
                      <LocationAutocomplete
                        value={origin}
                        onChange={setOrigin}
                        placeholder="Where are you flying from?"
                      />
                    </div>
                  )}

                  <div className={`flex flex-col gap-1.5 ${requireFlights ? 'md:col-span-6' : 'md:col-span-12'}`}>
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

                <div className="mb-8">
                  <div className="text-xs font-medium tracking-[0.1em] uppercase text-[#38BDF8] mb-4">Travel vibe</div>
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

                <button
                  onClick={generateItinerary}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#FF7A59] to-[#FFB36B] hover:shadow-lg hover:shadow-[#FF7A59]/20 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98] border-0"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  Generate My Itinerary
                </button>

                {error && (
                  <div className="mt-4 bg-destructive/10 border border-destructive text-destructive text-sm rounded-lg p-3 text-center">
                    {error}
                  </div>
                )}
              </div>
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
              className="py-12 max-w-4xl mx-auto print:py-0 print:max-w-none print:bg-white print:text-black print:absolute print:inset-0 print:z-50"
            >
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mb-8 print:hidden">
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors border border-border"
                >
                  <Download className="w-4 h-4" />
                  Save PDF
                </button>
                <button
                  onClick={handleSaveTrip}
                  disabled={isSaving || hasSaved}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                    hasSaved 
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                      : "bg-[#38BDF8] text-[#0B1F33] hover:bg-[#38BDF8]/90"
                  }`}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : hasSaved ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {hasSaved ? "Saved!" : "Save Trip"}
                </button>
                {hasSaved && savedTripId && (
                  <a
                    href={`/trips/${savedTripId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#FF7A59] text-white hover:bg-[#FF7A59]/90 rounded-lg transition-colors shadow-sm"
                  >
                    View Saved Trip ↗
                  </a>
                )}
              </div>

              <div className="text-center mb-16">
                <span className="text-[11px] tracking-[0.15em] uppercase text-[#38BDF8] font-bold mb-4 block">
                  ✦ {selectedVibes.join(", ") || "Adventure"} · {budget.charAt(0).toUpperCase() + budget.slice(1)} · {days || 5} days {startDate && `· ${startDate}`}{endDate && ` to ${endDate}`}
                </span>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight outline-none focus:text-[#38BDF8] transition-colors" contentEditable suppressContentEditableWarning>
                  {itinerary.destination}
                </h2>
                <div className="flex items-center justify-center text-muted-foreground text-sm outline-none focus:text-foreground transition-colors" contentEditable suppressContentEditableWarning>
                  <span>{itinerary.tagline}</span>
                </div>
              </div>

              {(itinerary.flights || itinerary.hotel) && (
                <div className={`grid ${itinerary.flights && itinerary.hotel ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6 mb-12`}>
                  {itinerary.flights && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-card text-card-foreground border rounded-3xl p-6 shadow-sm"
                    >
                      <h3 className="font-serif text-xl font-bold text-foreground mb-4">✈️ Flight Route</h3>
                      <div className="space-y-3" contentEditable suppressContentEditableWarning>
                        <div className="text-sm outline-none"><span className="text-muted-foreground font-medium">Outbound:</span> <span className="text-foreground">{itinerary.flights.outbound}</span></div>
                        <div className="text-sm outline-none"><span className="text-muted-foreground font-medium">Return:</span> <span className="text-foreground">{itinerary.flights.return}</span></div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2 outline-none">Est. Cost: {itinerary.flights.estimated_cost}</div>
                      </div>
                    </motion.div>
                  )}
                  
                  {itinerary.hotel && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-card text-card-foreground border rounded-3xl p-6 shadow-sm"
                    >
                      <h3 className="font-serif text-xl font-bold text-foreground mb-4">🏨 Recommended Stay</h3>
                      <div className="space-y-3" contentEditable suppressContentEditableWarning>
                        <div className="text-sm font-bold text-foreground outline-none">{itinerary.hotel.name}</div>
                        <div className="text-sm text-muted-foreground leading-relaxed outline-none">{itinerary.hotel.description}</div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2 outline-none">Est. Cost: {itinerary.hotel.estimated_cost}</div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              <div className="space-y-8">
                {itinerary.days.map((day, di) => (
                  <motion.div
                    key={di}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: di * 0.1 }}
                    className="bg-card text-card-foreground rounded-3xl overflow-hidden border shadow-sm"
                  >
                    <div className="bg-muted/50 px-6 py-5 flex items-center justify-between border-b border-border/50">
                      <div>
                        <div className="font-serif text-sm text-muted-foreground tracking-widest uppercase mb-1">Day {day.day}</div>
                        <div className="font-serif text-xl font-extrabold text-foreground outline-none transition-colors" contentEditable suppressContentEditableWarning>{day.title}</div>
                      </div>
                      <div className="bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 rounded-lg px-3 py-1.5 text-xs font-bold outline-none" contentEditable suppressContentEditableWarning>
                        {day.estimated_budget}
                      </div>
                    </div>
                    
                    <div className="p-6 md:p-8 space-y-6">
                      {day.activities.map((act, ai) => (
                        <div key={ai} className="relative flex gap-6 pb-6 border-b last:border-0 last:pb-0 print:break-inside-avoid">
                          <div className="w-20 shrink-0 text-right pt-1" contentEditable suppressContentEditableWarning>
                            <span className="text-xs font-semibold text-muted-foreground outline-none">{act.time}</span>
                          </div>
                          
                          <div className="absolute left-[88px] top-2.5 w-2 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_0_4px_rgba(56,189,248,0.1)]" />
                          
                          <div className="flex-1 pl-4">
                            <h4 className="font-bold text-foreground text-[16px] mb-1.5 outline-none transition-colors" contentEditable suppressContentEditableWarning>{act.name}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-2.5 outline-none transition-colors" contentEditable suppressContentEditableWarning>{act.description}</p>
                            <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${getTagClass(act.type)}`}>
                              {(act.type || "experience").replace("attraction", "sight")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {itinerary.tips && itinerary.tips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-12 bg-card text-card-foreground border rounded-3xl p-8 shadow-sm"
                >
                  <h3 className="font-serif text-xl text-[#FF7A59] font-bold italic mb-6">Insider Tips</h3>
                  <ul className="space-y-3">
                    {itinerary.tips.map((tip, ti) => (
                      <li key={ti} className="relative pl-6 text-sm text-muted-foreground leading-relaxed outline-none focus:text-foreground transition-colors" contentEditable suppressContentEditableWarning>
                        <span className="absolute left-0 top-1.5 text-[8px] text-[#38BDF8]" contentEditable={false}>✦</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              <div className="mt-16 text-center print:hidden">
                <button
                  onClick={() => {
                    setItinerary(null);
                    setDestination("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-6 py-3 text-sm text-muted-foreground hover:text-foreground border rounded-xl hover:bg-muted transition-all"
                >
                  ← Plan another trip
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
