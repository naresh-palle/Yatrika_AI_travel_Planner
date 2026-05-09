"use client"

import { useState, useEffect } from "react"
import { MapPin, Route, Search, Trash2, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Feature } from "geojson"

const LeafletMap = dynamic(() => import("./leaflet-renderer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0B1F33] text-white/50 min-h-[60vh]">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#38BDF8]" />
      <p className="font-medium animate-pulse">Initializing Map Engine...</p>
    </div>
  ),
})

// Types
type PlaceItem = {
  id: string
  name: string
  placeId?: string | null
  address?: string | null
  category?: string | null
  latitude: number
  longitude: number
}

type SearchFeature = {
  id: string
  place_name: string
  text: string
  center: [number, number] // [lng, lat]
}

type TripItem = {
  id: string
  title: string
}

export function TravelMap() {
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState<SearchFeature[]>([])
  const [savedPlaces, setSavedPlaces] = useState<PlaceItem[]>([])
  const [nearby, setNearby] = useState<SearchFeature[]>([])
  const [selected, setSelected] = useState<{
    name: string
    lng: number
    lat: number
    address?: string
    id?: string
    canSave?: boolean
  } | null>(null)
  const [trips, setTrips] = useState<TripItem[]>([])
  const [selectedTripId, setSelectedTripId] = useState("")
  const [routeFeature, setRouteFeature] = useState<Feature | null>(null)
  const [loading, setLoading] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  
  // Map specific state
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 })
  const [mapZoom, setMapZoom] = useState(4)

  async function loadInitialData() {
    setLoading(true)
    setMapError(null)
    try {
      const [savedRes, tripsRes] = await Promise.all([
        fetch("/api/saved-places"),
        fetch("/api/trips"),
      ])
      const savedJson = await savedRes.json()
      const tripsJson = await tripsRes.json()
      if (!savedRes.ok) throw new Error(savedJson.error ?? "Failed to load saved places")
      if (!tripsRes.ok) throw new Error(tripsJson.error ?? "Failed to load trips")
      setSavedPlaces(savedJson.data ?? [])
      setTrips(tripsJson.data ?? [])
    } catch (e) {
      setMapError(e instanceof Error ? e.message : "Unable to load map data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        void runSearch(search.trim())
      } else {
        setSearchResults([])
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [search])

  async function runSearch(queryToSearch = search) {
    const q = queryToSearch.trim()
    if (!q) return
    setLoading(true)
    setMapError(null)
    try {
      const res = await fetch(`/api/map/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Search failed")
      setSearchResults(json.features ?? [])
    } catch (e) {
      setMapError(e instanceof Error ? e.message : "Search failed")
    } finally {
      setLoading(false)
    }
  }

  async function loadNearby(lng: number, lat: number) {
    setLoading(true)
    setMapError(null)
    try {
      const res = await fetch(`/api/map/nearby?lng=${lng}&lat=${lat}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Nearby lookup failed")
      setNearby(json.features ?? [])
    } catch (e) {
      setMapError(e instanceof Error ? e.message : "Nearby lookup failed")
    } finally {
      setLoading(false)
    }
  }

  async function saveSelected() {
    if (!selected) return
    setLoading(true)
    try {
      const res = await fetch("/api/saved-places", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: selected.name,
          address: selected.address ?? null,
          category: "general",
          placeId: selected.id ?? null,
          source: "leaflet",
          latitude: selected.lat,
          longitude: selected.lng,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.data) throw new Error(json.error ?? "Save failed")
      setSavedPlaces((prev) => [json.data as PlaceItem, ...prev])
      setSelected((prev) => (prev ? { ...prev, canSave: false } : prev))
    } catch (e) {
      setMapError(e instanceof Error ? e.message : "Unable to save place")
    } finally {
      setLoading(false)
    }
  }

  async function deletePlace(placeId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/saved-places/${placeId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete place")
      setSavedPlaces((prev) => prev.filter((p) => p.id !== placeId))
    } catch (e) {
      setMapError(e instanceof Error ? e.message : "Delete failed")
    } finally {
      setLoading(false)
    }
  }

  async function loadTripRoute() {
    if (!selectedTripId) return
    setLoading(true)
    setMapError(null)
    setSelected(null)
    setNearby([])
    try {
      const res = await fetch(`/api/map/route?tripId=${selectedTripId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to load route")
      setRouteFeature(json.data?.route ?? null)
      const first = json.data?.destinations?.find((d: any) => d.latitude != null && d.longitude != null)
      if (first) {
        setMapCenter({ lat: first.latitude, lng: first.longitude })
        setMapZoom(8)
        void loadNearby(first.longitude, first.latitude)
      } else if (json.data?.destinationName) {
        // Fallback: search the destination name if there are no saved route coordinates
        const searchRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(json.data.destinationName)}&limit=1`)
        const searchJson = await searchRes.json()
        if (searchJson && searchJson.length > 0) {
          const lat = parseFloat(searchJson[0].lat)
          const lng = parseFloat(searchJson[0].lon)
          setMapCenter({ lat, lng })
          setMapZoom(10)
          void loadNearby(lng, lat)
        }
      }
    } catch (e) {
      setMapError(e instanceof Error ? e.message : "Route failed")
    } finally {
      setLoading(false)
    }
  }

  const onMapClick = (lat: number, lng: number) => {
    setSelected({
      name: "Pinned Location",
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lng: lng,
      lat: lat,
      id: `custom-${Date.now()}`,
      canSave: true,
    })
  }

  useEffect(() => {
    void loadInitialData()
  }, [])

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card className="order-2 lg:order-1">
        <CardHeader>
          <CardTitle>Travel Map Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination Search</label>
            <div className="flex gap-2">
              <Input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search place..." 
                onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              />
              <Button onClick={() => runSearch()} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-40 space-y-2 overflow-auto">
              {searchResults.map((r) => (
                <button
                  key={r.id}
                  className="w-full rounded-md border p-2 text-left text-sm hover:bg-accent"
                  onClick={() => {
                    const [lng, lat] = r.center
                    setSelected({
                      name: r.text,
                      address: r.place_name,
                      lng,
                      lat,
                      id: r.id,
                      canSave: true,
                    })
                    setMapCenter({ lat, lng })
                    setMapZoom(11)
                  }}
                >
                  {r.place_name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Trip Route Visualization</label>
            <div className="space-y-2">
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
              >
                <option value="">Select trip</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.title}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button onClick={loadTripRoute} variant="outline" disabled={loading} className="flex-1">
                  <Route className="mr-1 h-4 w-4" />
                  Show
                </Button>
                <Button onClick={() => loadNearby(mapCenter.lng, mapCenter.lat)} variant="outline" disabled={loading} className="flex-1">
                  <MapPin className="mr-1 h-4 w-4" />
                  Find Nearby
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Saved Places</label>
            <div className="max-h-44 space-y-2 overflow-auto">
              {savedPlaces.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <button
                    className="text-left"
                    onClick={() => {
                      setMapCenter({ lat: p.latitude, lng: p.longitude })
                      setMapZoom(12)
                      setSelected({
                        name: p.name,
                        address: p.address ?? "",
                        lng: p.longitude,
                        lat: p.latitude,
                        id: p.id,
                        canSave: false,
                      })
                    }}
                  >
                    {p.name}
                  </button>
                  <Button size="icon" variant="ghost" onClick={() => deletePlace(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {selected ? (
            <div className="rounded-md border p-3 text-sm">
              <div className="font-medium">{selected.name}</div>
              {selected.address ? <div className="text-muted-foreground">{selected.address}</div> : null}
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => loadNearby(selected.lng, selected.lat)}>
                  Nearby attractions
                </Button>
                {selected.canSave ? (
                  <Button size="sm" onClick={saveSelected}>
                    Save place
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          {nearby.length > 0 ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Nearby Attractions</label>
              <div className="max-h-36 space-y-2 overflow-auto">
                {nearby.map((n) => (
                  <button
                    key={n.id}
                    className="w-full rounded-md border p-2 text-left text-sm hover:bg-accent"
                    onClick={() => {
                      const [lng, lat] = n.center
                      setMapCenter({ lat, lng })
                      setMapZoom(13)
                      setSelected({
                        name: n.text,
                        address: n.place_name,
                        lng,
                        lat,
                        id: n.id,
                        canSave: true,
                      })
                    }}
                  >
                    {n.place_name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {loading ? (
            <div className="inline-flex items-center text-xs text-muted-foreground">
              <Spinner className="mr-2" />
              Loading map data...
            </div>
          ) : null}
          {mapError ? <div className="text-sm text-destructive">{mapError}</div> : null}
        </CardContent>
      </Card>

      <Card className="order-1 min-h-[60vh] lg:order-2 overflow-hidden border-0">
        <CardContent className="h-[60vh] p-0 sm:h-[75vh] w-full rounded-xl overflow-hidden relative">
          <LeafletMap
            savedPlaces={savedPlaces}
            selected={selected}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            routeFeature={routeFeature}
            nearby={nearby}
            onMapClick={onMapClick}
            onSelectedChange={setSelected}
            onSave={saveSelected}
            onRemove={deletePlace}
          />
        </CardContent>
      </Card>
    </div>
  )
}
