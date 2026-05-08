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

  const token = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!token) {
    return NextResponse.json({ error: "Google Maps API key is missing" }, { status: 500 })
  }

  // Use the Places API (New) endpoint
  const endpoint = "https://places.googleapis.com/v1/places:searchText"
  
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": token,
      "X-Goog-FieldMask": "places.id,places.formattedAddress,places.displayName,places.location"
    },
    body: JSON.stringify({
      textQuery: parsed.data.q,
      languageCode: "en"
    }),
    cache: "no-store"
  })

  const json = await res.json()

  if (!res.ok) {
    console.error("Google Places Search Error:", json)
    return NextResponse.json({ error: json.error?.message || "Map search failed" }, { status: 502 })
  }

  const features = (json.places || []).map((place: any) => ({
    id: place.id,
    place_name: place.formattedAddress,
    text: place.displayName?.text || "Unknown",
    center: [place.location?.longitude, place.location?.latitude],
  }))

  return NextResponse.json({ features })
}
