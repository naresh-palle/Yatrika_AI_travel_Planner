"use client"

import { useMemo, useState, useCallback, useEffect } from "react"
import { MapPin, Route, Search, Trash2 } from "lucide-react"
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from "@vis.gl/react-google-maps"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Feature } from "geojson"

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

// Polyline component for Trip Route
const RoutePolyline = ({ routeFeature }: { routeFeature: Feature | null }) => {
  const map = useMap()
  
  useEffect(() => {
    if (!map || !routeFeature || routeFeature.geometry.type !== "LineString") return
    
    const coordinates = (routeFeature.geometry as any).coordinates as [number, number][]
    const path = coordinates.map(c => ({ lat: c[1], lng: c[0] }))
    
    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#22d3ee",
      strokeOpacity: 0.8,
      strokeWeight: 4,
    })
    
    polyline.setMap(map)
    return () => polyline.setMap(null)
  }, [map, routeFeature])
  
  return null
}

export function TravelMap() {
  const token = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
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
  
  // Google Maps specific state
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 })
  const [mapZoom, setMapZoom] = useState(3.8)

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

  async function runSearch() {
    if (!search.trim()) return
    setLoading(true)
    setMapError(null)
    try {
      const res = await fetch(`/api/map/search?q=${encodeURIComponent(search.trim())}`)
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
          source: "google",
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
    try {
      const res = await fetch(`/api/map/route?tripId=${selectedTripId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to load route")
      setRouteFeature(json.data?.route ?? null)
      const first = json.data?.destinations.find((d: any) => d.latitude != null && d.longitude != null)
      if (first) {
        setMapCenter({ lat: first.latitude, lng: first.longitude })
        setMapZoom(8)
      }
    } catch (e) {
      setMapError(e instanceof Error ? e.message : "Route failed")
    } finally {
      setLoading(false)
    }
  }

  const onMapClick = (e: any) => {
    if (!e.detail.placeId && !e.detail.name) return
    setSelected({
      name: e.detail.name || "Selected place",
      address: "",
      lng: e.detail.latLng.lng,
      lat: e.detail.latLng.lat,
      id: e.detail.placeId,
      canSave: false,
    })
  }

  useEffect(() => {
    void loadInitialData()
  }, [])

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Maps API key missing</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in your env.
        </CardContent>
      </Card>
    )
  }

  return (
    <APIProvider apiKey={token}>
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="order-2 lg:order-1">
          <CardHeader>
            <CardTitle>Travel Map Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination Search</label>
              <div className="flex gap-2">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search place..." />
                <Button onClick={runSearch} size="icon">
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
              <div className="flex gap-2">
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
                <Button onClick={loadTripRoute} variant="outline">
                  <Route className="mr-1 h-4 w-4" />
                  Show
                </Button>
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

        <Card className="order-1 min-h-[60vh] lg:order-2 overflow-hidden">
          <CardContent className="h-[60vh] p-0 sm:h-[75vh]">
            <Map
              mapId="DEMO_MAP_ID"
              center={mapCenter}
              zoom={mapZoom}
              onCenterChanged={(e) => setMapCenter(e.detail.center)}
              onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
              onClick={onMapClick}
              gestureHandling={"greedy"}
              disableDefaultUI={true}
            >
              {savedPlaces.map((p) => (
                <AdvancedMarker key={p.id} position={{ lat: p.latitude, lng: p.longitude }} onClick={() => {
                  setSelected({
                    name: p.name,
                    address: p.address ?? "",
                    lng: p.longitude,
                    lat: p.latitude,
                    id: p.id,
                    canSave: false,
                  })
                }}>
                  <Pin background={"#f97316"} borderColor={"#fff"} glyphColor={"#fff"} />
                </AdvancedMarker>
              ))}

              {selected && (
                <InfoWindow
                  position={{ lat: selected.lat, lng: selected.lng }}
                  onCloseClick={() => setSelected(null)}
                >
                  <div className="text-sm text-black">
                    <div className="font-medium">{selected.name}</div>
                    {selected.address ? (
                      <div className="max-w-52 text-xs text-gray-600">{selected.address}</div>
                    ) : null}
                  </div>
                </InfoWindow>
              )}

              <RoutePolyline routeFeature={routeFeature} />
            </Map>
          </CardContent>
        </Card>
      </div>
    </APIProvider>
  )
}
