import Image from "next/image"
import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { CalendarDays, MapPin, Users } from "lucide-react"

import { CollaboratorsPanel } from "@/components/trips/collaborators-panel"
import { db } from "@/lib/db"
import { canManageCollaborators, canReadTrip, getTripRole } from "@/lib/auth/trip-access"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteTripButton } from "@/components/trips/delete-trip-button"
import { ExportPdfButton } from "@/components/trips/export-pdf-button"

type Activity = { time: string; name: string; description: string; type: string; };
type DayPlan = { day: number; title: string; estimated_budget: string; activities: Activity[]; };
type Itinerary = { destination: string; tagline: string; flights: { outbound: string; return: string; estimated_cost: string; }; hotel: { name: string; description: string; estimated_cost: string; }; days: DayPlan[]; tips: string[]; };

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

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>
}) {
  const { tripId } = await params
  const clerkUser = await currentUser()
  if (!clerkUser) redirect("/sign-in")

  const user = await db.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  })
  if (!user) notFound()
  const role = await getTripRole(tripId, user.id)
  if (!canReadTrip(role)) notFound()

  const trip = await db.trip.findFirst({
    where: { id: tripId },
    include: {
      destinations: { orderBy: { createdAt: "asc" } },
      primaryDestination: true,
      collaborators: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  })
  if (!trip) notFound()
  const canManage = canManageCollaborators(role)
  const canEdit = role === "OWNER" || role === "EDITOR"
  const canDelete = role === "OWNER"

  let itinerary: Itinerary | null = null;
  try {
    if (trip.description && trip.description.startsWith("{")) {
      itinerary = JSON.parse(trip.description);
    }
  } catch (e) {
    // Description is not JSON
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {trip.coverImageUrl ? (
        <div className="relative h-56 w-full overflow-hidden rounded-xl border">
          <Image src={trip.coverImageUrl} alt={trip.title} fill className="object-cover" />
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{trip.title}</h1>
          {!itinerary && (
            <p className="text-sm text-muted-foreground mt-2">{trip.description ?? "No description"}</p>
          )}
        </div>
        <div className="flex gap-2 print:hidden">
          <ExportPdfButton />
          {canEdit ? (
            <Button asChild variant="outline">
              <Link href={`/trips/${trip.id}/edit`}>Edit Settings</Link>
            </Button>
          ) : null}
          {canDelete ? <DeleteTripButton tripId={trip.id} /> : null}
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3 p-4">
          <div className="inline-flex items-center text-muted-foreground">
            <Users className="mr-2 h-4 w-4" />
            {trip.travelersCount} travelers
          </div>
          <div className="inline-flex items-center text-muted-foreground">
            <CalendarDays className="mr-2 h-4 w-4" />
            {trip.startDate ? trip.startDate.toISOString().slice(0, 10) : "TBD"} -{" "}
            {trip.endDate ? trip.endDate.toISOString().slice(0, 10) : "TBD"}
          </div>
          <div className="inline-flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            {trip.primaryDestination?.name ?? "No primary destination"}
          </div>
        </CardContent>
      </Card>

      {/* RENDER ITINERARY JSON */}
      {itinerary && (
        <div className="mt-10 space-y-8">
          <div className="text-center mb-8">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-3">{itinerary.destination}</h2>
            <p className="text-muted-foreground">{itinerary.tagline}</p>
          </div>

          {(itinerary.flights || itinerary.hotel) && (
            <div className={`grid ${itinerary.flights && itinerary.hotel ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
              {itinerary.flights && (
                <div className="bg-card text-card-foreground border rounded-3xl p-6 shadow-sm">
                  <h3 className="font-serif text-xl font-bold mb-4">✈️ Flight Route</h3>
                  <div className="space-y-3 text-sm">
                    <div><span className="text-muted-foreground font-medium">Outbound:</span> {itinerary.flights.outbound}</div>
                    <div><span className="text-muted-foreground font-medium">Return:</span> {itinerary.flights.return}</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-2">Est. Cost: {itinerary.flights.estimated_cost}</div>
                  </div>
                </div>
              )}
              
              {itinerary.hotel && (
                <div className="bg-card text-card-foreground border rounded-3xl p-6 shadow-sm">
                  <h3 className="font-serif text-xl font-bold mb-4">🏨 Recommended Stay</h3>
                  <div className="space-y-3 text-sm">
                    <div className="font-bold">{itinerary.hotel.name}</div>
                    <div className="text-muted-foreground leading-relaxed">{itinerary.hotel.description}</div>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-2">Est. Cost: {itinerary.hotel.estimated_cost}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-2xl font-bold font-serif mb-4">Daily Itinerary</h3>
            {itinerary.days.map((day, di) => (
              <div key={di} className="bg-card text-card-foreground rounded-3xl overflow-hidden border shadow-sm">
                <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-b border-border/50">
                  <div>
                    <div className="font-serif text-xs text-muted-foreground tracking-widest uppercase mb-1">Day {day.day}</div>
                    <div className="font-serif text-xl font-extrabold">{day.title}</div>
                  </div>
                  <div className="bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 rounded-lg px-3 py-1.5 text-xs font-bold">
                    {day.estimated_budget}
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {day.activities.map((act, ai) => (
                    <div key={ai} className="relative flex gap-6 pb-6 border-b border-border/50 last:border-0 last:pb-0">
                      <div className="w-20 shrink-0 text-right pt-1">
                        <span className="text-xs font-semibold text-muted-foreground">{act.time}</span>
                      </div>
                      <div className="absolute left-[88px] top-2.5 w-2 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_0_4px_rgba(56,189,248,0.1)]" />
                      <div className="flex-1 pl-4">
                        <h4 className="font-bold text-[16px] mb-1.5">{act.name}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2.5">{act.description}</p>
                        <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${getTagClass(act.type)}`}>
                          {(act.type || "experience").replace("attraction", "sight")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {itinerary.tips && itinerary.tips.length > 0 && (
            <div className="mt-8 bg-card text-card-foreground border rounded-3xl p-8 shadow-sm">
              <h3 className="font-serif text-xl text-[#FF7A59] font-bold italic mb-6">Insider Tips</h3>
              <ul className="space-y-3">
                {itinerary.tips.map((tip, ti) => (
                  <li key={ti} className="relative pl-6 text-sm text-muted-foreground leading-relaxed">
                    <span className="absolute left-0 top-1.5 text-[8px] text-[#38BDF8]">✦</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* RENDER DESTINATIONS LIST ONLY IF IT EXISTS AND NOT OVERRIDDEN BY ITINERARY */}
      {!itinerary && trip.destinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Destinations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {trip.destinations.map((d) => (
              <div key={d.id} className="rounded-md border p-3 text-sm">
                <div className="font-medium">{d.name}</div>
                <div className="text-muted-foreground">
                  {[d.city, d.country].filter(Boolean).join(", ") || "Location not set"}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="print:hidden">
        <CollaboratorsPanel
          tripId={trip.id}
          initialCollaborators={trip.collaborators}
          canManage={canManage}
        />
      </div>
    </div>
  )
}

