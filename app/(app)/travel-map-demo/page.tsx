"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { MapStoreProvider } from "@/modules/map/src/stores/map.provider";

// Dynamically import TravelMap with SSR disabled since leaflet requires window
const TravelMap = dynamic(() => import("@/components/TravelMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[calc(100vh-80px)] sm:h-screen flex flex-col items-center justify-center bg-[#0B1F33] text-white/50">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#38BDF8]" />
      <p className="font-medium animate-pulse">Initializing Map Engine...</p>
    </div>
  ),
});

export default function TravelMapDemoPage() {
  return (
    <div className="w-full h-full min-h-screen bg-[#0B1F33]">
      <MapStoreProvider>
        <TravelMap />
      </MapStoreProvider>
    </div>
  );
}
