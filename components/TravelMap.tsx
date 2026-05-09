"use client";

import React, { useEffect, useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Save, Trash2, Map as MapIcon, Route } from "lucide-react";
import { Place, Coordinates } from "@/types/map";
import { getBounds, fixLeafletIcon } from "@/lib/map-utils";
import { SearchBox } from "./SearchBox";
import { useMapStore } from "@/modules/map/src/stores/map.hook";

// Fix for default Leaflet markers in React
fixLeafletIcon();

// Custom UI controls wrapper for Leaflet Map
function MapControls({
  places,
  onLocateUser,
  onFitBounds,
}: {
  places: Place[];
  onLocateUser: () => void;
  onFitBounds: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (places.length > 0) {
      const coords = places.map((p) => p.coordinates);
      const bounds = getBounds(coords);
      if (bounds) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
  }, [places, map]);

  return (
    <div className="absolute right-4 bottom-8 z-[1000] flex flex-col gap-3">
      <button
        onClick={onLocateUser}
        className="w-12 h-12 bg-[#0B1F33]/80 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl flex items-center justify-center text-white/80 hover:text-white hover:bg-[#38BDF8]/20 hover:border-[#38BDF8]/50 transition-all active:scale-95 group"
        title="My Location"
      >
        <Navigation className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
      {places.length > 1 && (
        <button
          onClick={onFitBounds}
          className="w-12 h-12 bg-[#0B1F33]/80 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl flex items-center justify-center text-white/80 hover:text-white hover:bg-[#38BDF8]/20 hover:border-[#38BDF8]/50 transition-all active:scale-95 group"
          title="Fit All Places"
        >
          <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
}

// Click event handler for adding places
function MapClickHandler({ onMapClick }: { onMapClick: (coords: Coordinates) => void }) {
  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function TravelMap() {
  const { places, center, zoom, addPlace, removePlace, setCenter, setZoom } = useMapStore(
    useShallow((s) => ({
      places: s.places,
      center: s.center,
      zoom: s.zoom,
      addPlace: s.addPlace,
      removePlace: s.removePlace,
      setCenter: s.setCenter,
      setZoom: s.setZoom,
    }))
  );

  const routePath = useMemo(() => {
    return places.map((p) => [p.coordinates.lat, p.coordinates.lng] as [number, number]);
  }, [places]);



  const handleMapClick = useCallback((coords: Coordinates) => {
    const newPlace: Place = {
      id: `custom-${Date.now()}`,
      name: `Pinned Location`,
      coordinates: coords,
      type: "Custom Pin",
    };
    addPlace(newPlace);
  }, [addPlace]);

  const handleRemovePlace = (id: string) => {
    removePlace(id);
  };

  const handleLocateUser = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
          setZoom(14);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Could not get your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleFitBounds = () => {
    // This is handled automatically by MapControls effect when places change,
    // but can be triggered manually by modifying state to re-run the effect
    // Actually, MapControls handles it automatically.
  };

  return (
    <div className="relative w-full h-[calc(100vh-80px)] sm:h-screen bg-[#0B1F33] overflow-hidden">
      {/* Search Overlay */}
      <SearchBox />

      {/* Route Builder Panel */}
      <div className="absolute top-24 left-4 z-[1000] w-72 bg-[#0B1F33]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col max-h-[calc(100vh-140px)]">
        <div className="flex items-center gap-2 mb-3 text-[#38BDF8]">
          <Route className="w-5 h-5" />
          <h2 className="font-bold text-white">Route Builder</h2>
        </div>
        
        {places.length === 0 ? (
          <div className="text-sm text-white/50 text-center py-6 bg-white/5 rounded-xl border border-white/5">
            <MapIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Click anywhere on the map or use search to add stops to your route.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto pr-1">
            {places.map((place, i) => (
              <div key={place.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-2 group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="truncate text-sm text-white/90">
                    {place.name.split(',')[0]}
                  </div>
                </div>
                <button
                  onClick={() => handleRemovePlace(place.id)}
                  className="text-white/30 hover:text-red-400 p-1 transition-colors"
                  title="Remove stop"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {places.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => {
                places.forEach(p => handleRemovePlace(p.id));
              }}
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              Clear all stops
            </button>
            <button className="w-full bg-[#38BDF8] text-[#0B1F33] hover:bg-[#38BDF8]/90 font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Save className="w-4 h-4" /> Save Route
            </button>
          </div>
        )}
      </div>

      {/* Map Instance */}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark"
        />

        <MapClickHandler onMapClick={handleMapClick} />
        
        <MapControls 
          places={places} 
          onLocateUser={handleLocateUser} 
          onFitBounds={handleFitBounds} 
        />

        {routePath.length > 1 && (
          <Polyline 
            positions={routePath} 
            color="#38BDF8" 
            weight={3} 
            dashArray="10, 10" 
            opacity={0.8}
            className="animate-pulse"
          />
        )}

        {places.map((place) => (
          <Marker key={place.id} position={[place.coordinates.lat, place.coordinates.lng]}>
            <Popup className="travel-map-popup">
              <div className="p-1 min-w-[180px]">
                <h3 className="font-bold text-gray-900 text-base mb-1">{place.name.split(",")[0]}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {place.name.split(",").slice(1).join(",")}
                </p>
                
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
                  <div className="text-[10px] text-gray-400">
                    {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePlace(place.id);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove Place"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Dark Mode Styles Override */}
      <style jsx global>{`
        .map-tiles-dark {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .travel-map-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        }
        .travel-map-popup .leaflet-popup-tip {
          box-shadow: none;
        }
        .leaflet-container {
          background-color: #0B1F33;
          font-family: inherit;
        }
        .leaflet-control-attribution {
          background-color: rgba(11, 31, 51, 0.8) !important;
          color: rgba(255, 255, 255, 0.5) !important;
          backdrop-filter: blur(4px);
        }
        .leaflet-control-attribution a {
          color: rgba(255, 255, 255, 0.8) !important;
        }
      `}</style>
    </div>
  );
}
