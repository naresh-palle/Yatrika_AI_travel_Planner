import { NextResponse } from "next/server"
import { mapSearchQuerySchema } from "@/modules/map/schema"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const parsed = mapSearchQuerySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
  })
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 })
  }

  // Use OpenStreetMap Nominatim API
  const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(parsed.data.q)}&limit=5`
  
  const res = await fetch(endpoint, {
    headers: {
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "Yatrika_Travel_Planner/1.0",
    },
    cache: "no-store"
  })

  const json = await res.json()

  if (!res.ok) {
    console.error("Nominatim Search Error:", json)
    return NextResponse.json({ error: "Map search failed" }, { status: 502 })
  }

  const features = json.map((place: any) => ({
    id: place.place_id.toString(),
    place_name: place.display_name,
    text: place.name || place.display_name.split(',')[0],
    center: [parseFloat(place.lon), parseFloat(place.lat)],
  }))

  return NextResponse.json({ features })
}
