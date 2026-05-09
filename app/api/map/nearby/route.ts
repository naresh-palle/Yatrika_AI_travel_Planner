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

  const { lng, lat } = parsed.data

  // Use Overpass API for nearby tourist attractions
  const overpassQuery = `[out:json];
  (
    nwr["tourism"](around:5000,${lat},${lng});
    nwr["historic"](around:5000,${lat},${lng});
    nwr["leisure"="park"](around:5000,${lat},${lng});
    nwr["leisure"="nature_reserve"](around:5000,${lat},${lng});
  );
  out center 15;`;
  
  const endpoint = "https://overpass-api.de/api/interpreter"
  
  const urlParams = new URLSearchParams({ data: overpassQuery })
  const res = await fetch(`${endpoint}?${urlParams.toString()}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "User-Agent": "Yatrika Travel Planner/1.0"
    },
    cache: "no-store"
  })

  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch(e) {
    console.error("Overpass API returned invalid JSON:", text)
    return NextResponse.json({ error: "Nearby attraction lookup failed. OpenStreetMap API might be overloaded." }, { status: 502 })
  }

  if (!res.ok) {
    console.error("Overpass Nearby Error:", json)
    return NextResponse.json({ error: "Nearby attraction lookup failed" }, { status: 502 })
  }

  const features = (json.elements || [])
    .filter((el: any) => el.tags && el.tags.name) // Only include named places
    .slice(0, 15)
    .map((place: any) => {
      const pLat = place.lat ?? place.center?.lat;
      const pLon = place.lon ?? place.center?.lon;
      return {
        id: place.id.toString(),
        place_name: place.tags.name,
        text: place.tags.name,
        center: [pLon, pLat],
      }
    })

  return NextResponse.json({ features })
}
