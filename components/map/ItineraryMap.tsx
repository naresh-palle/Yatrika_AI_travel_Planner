"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fixLeafletIcon } from "@/lib/map-utils";
import { MapPin, Clock, Info } from "lucide-react";

// Fix for default Leaflet markers
if (typeof window !== "undefined") {
  fixLeafletIcon();
}

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
  activities: Activity[];
};

interface ItineraryMapProps {
  days: DayPlan[];
  destination: string;
}

function MapBoundsFitter({ activities }: { activities: { lat: number; lng: number }[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (activities.length > 0) {
      const bounds = L.latLngBounds(activities.map(a => [a.lat, a.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [activities, map]);
  
  return null;
}

export default function ItineraryMap({ days, destination }: ItineraryMapProps) {
  const allActivities = useMemo(() => {
    return days.flatMap(day => 
      day.activities
        .filter(act => act.coordinates && act.coordinates.lat && act.coordinates.lng)
        .map(act => ({
          ...act,
          day: day.day,
          coordinates: act.coordinates!
        }))
    );
  }, [days]);

  const center: [number, number] = allActivities.length > 0 
    ? [allActivities[0].coordinates.lat, allActivities[0].coordinates.lng]
    : [20.5937, 78.9629]; // India center fallback

  // Create custom icons for each day
  const getDayIcon = (day: number) => {
    if (typeof window === "undefined") return undefined;
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #FF7A59; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; items-center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${day}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="w-full h-full relative min-h-[400px] rounded-3xl overflow-hidden border shadow-sm">
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full z-0"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark"
        />
        
        <MapBoundsFitter activities={allActivities.map(a => a.coordinates)} />

        {allActivities.map((act, i) => (
          <Marker 
            key={`${act.day}-${i}`} 
            position={[act.coordinates.lat, act.coordinates.lng]}
            icon={getDayIcon(act.day)}
          >
            <Popup className="itinerary-map-popup">
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#FF7A59] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Day {act.day}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {act.time}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{act.name}</h3>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {act.description}
                </p>
                <div className="mt-2 pt-2 border-t flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase">
                  <MapPin className="w-3 h-3" /> {destination}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Optional: Connect activities with a line */}
        {allActivities.length > 1 && (
          <Polyline 
            positions={allActivities.map(a => [a.coordinates.lat, a.coordinates.lng])}
            color="#FF7A59"
            weight={2}
            opacity={0.5}
            dashArray="5, 10"
          />
        )}
      </MapContainer>

      <style jsx global>{`
        .map-tiles-dark {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .itinerary-map-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        .itinerary-map-popup .leaflet-popup-content {
          margin: 8px 12px;
        }
        .leaflet-container {
          background-color: #0B1F33;
        }
      `}</style>
    </div>
  );
}
