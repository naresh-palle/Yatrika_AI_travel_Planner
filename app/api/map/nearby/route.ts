import { NextResponse } from "next/server"
import { nearbyQuerySchema } from "@/modules/map/schema"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const parsed = nearbyQuerySchema.safeParse({
    lng: url.searchParams.get("lng"),
    lat: url.searchParams.get("lat"),
  })
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 })
  }

  const token = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!token) {
    return NextResponse.json({ error: "Google Maps API key is missing" }, { status: 500 })
  }

  const { lng, lat } = parsed.data

  // Use the Places API (New) endpoint
  const endpoint = "https://places.googleapis.com/v1/places:searchNearby"
  
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": token,
      "X-Goog-FieldMask": "places.id,places.formattedAddress,places.shortFormattedAddress,places.displayName,places.location"
    },
    body: JSON.stringify({
      includedTypes: ["tourist_attraction"],
      maxResultCount: 12,
      locationRestriction: {
        circle: {
          center: {
            latitude: Number(lat),
            longitude: Number(lng)
          },
          radius: 5000.0 // 5km radius
        }
      }
    }),
    cache: "no-store"
  })

  const json = await res.json()

  if (!res.ok) {
    console.error("Google Places Nearby Error:", json)
    return NextResponse.json({ error: json.error?.message || "Nearby attraction lookup failed" }, { status: 502 })
  }

  const features = (json.places || []).map((place: any) => ({
    id: place.id,
    place_name: place.shortFormattedAddress || place.formattedAddress,
    text: place.displayName?.text || "Unknown",
    center: [place.location?.longitude, place.location?.latitude],
  }))

  return NextResponse.json({ features })
}
