import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fixLeafletIcon, getBounds } from "@/lib/map-utils";
import { Feature } from "geojson";
import { Save, Trash2, MapPin } from "lucide-react";

fixLeafletIcon();

type PlaceItem = {
  id: string;
  name: string;
  placeId?: string | null;
  address?: string | null;
  category?: string | null;
  latitude: number;
  longitude: number;
};

type SelectedPlace = {
  name: string;
  lng: number;
  lat: number;
  address?: string;
  id?: string;
  canSave?: boolean;
};

type SearchFeature = {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
};

interface LeafletRendererProps {
  savedPlaces: PlaceItem[];
  selected: SelectedPlace | null;
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  routeFeature: Feature | null;
  nearby?: SearchFeature[];
  onMapClick: (lat: number, lng: number) => void;
  onSelectedChange: (place: SelectedPlace | null) => void;
  onSave?: () => void;
  onRemove?: (id: string) => void;
}

function MapUpdater({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

function MapEventsHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function BoundsFitter({ 
  routePath, 
  places 
}: { 
  routePath: [number, number][] | null,
  places: PlaceItem[]
}) {
  const map = useMap();
  useEffect(() => {
    if (routePath && routePath.length > 0) {
      map.fitBounds(routePath, { padding: [50, 50], maxZoom: 16 });
    } else if (places.length > 1) {
      const coords = places.map(p => ({ lat: p.latitude, lng: p.longitude }));
      const bounds = getBounds(coords);
      if (bounds) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
  }, [routePath, places, map]);
  return null;
}

export default function LeafletRenderer({
  savedPlaces,
  selected,
  mapCenter,
  mapZoom,
  routeFeature,
  nearby = [],
  onMapClick,
  onSelectedChange,
  onSave,
  onRemove,
}: LeafletRendererProps) {
  
  const routePath = useMemo(() => {
    if (!routeFeature || routeFeature.geometry.type !== "LineString") return null;
    const coordinates = (routeFeature.geometry as any).coordinates as [number, number][];
    return coordinates.map((c) => [c[1], c[0]] as [number, number]);
  }, [routeFeature]);

  // Check if selected is already rendered by savedPlaces or nearby
  const isSelectedSaved = selected && savedPlaces.some(p => p.id === selected.id || (p.latitude === selected.lat && p.longitude === selected.lng));
  const isSelectedNearby = selected && nearby.some(n => n.id === selected.id);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapZoom}
        className="w-full h-full z-0"
        zoomControl={true}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark"
        />
        
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        <MapEventsHandler onClick={onMapClick} />
        <BoundsFitter routePath={routePath} places={savedPlaces} />

        {/* Saved Places */}
        {savedPlaces.map((p) => (
          <Marker 
            key={`saved-${p.id}`} 
            position={[p.latitude, p.longitude]}
            eventHandlers={{
              click: () => {
                onSelectedChange({
                  name: p.name,
                  address: p.address ?? "",
                  lng: p.longitude,
                  lat: p.latitude,
                  id: p.id,
                  canSave: false,
                });
              }
            }}
          >
            {selected && selected.lat === p.latitude && selected.lng === p.longitude && (
              <Popup className="travel-map-popup">
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{p.name}</h3>
                  {p.address && <p className="text-xs text-gray-600 mb-3">{p.address}</p>}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                    </span>
                    {onRemove && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onRemove(p.id); onSelectedChange(null); }}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors flex items-center gap-1"
                        title="Remove marker"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="text-xs font-medium">Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        ))}

        {/* Nearby Attractions */}
        {nearby.map((n) => (
          <Marker 
            key={`nearby-${n.id}`} 
            position={[n.center[1], n.center[0]]}
            opacity={0.8}
            eventHandlers={{
              click: () => {
                onSelectedChange({
                  name: n.text,
                  address: n.place_name,
                  lng: n.center[0],
                  lat: n.center[1],
                  id: n.id,
                  canSave: true,
                });
              }
            }}
          >
          </Marker>
        ))}

        {/* Standalone Selected Marker (e.g. from click or search) */}
        {selected && !isSelectedSaved && !isSelectedNearby && (
          <Marker position={[selected.lat, selected.lng]}>
            <Popup className="travel-map-popup">
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-gray-900 text-sm mb-1">{selected.name}</h3>
                {selected.address && <p className="text-xs text-gray-600 mb-3">{selected.address}</p>}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 font-mono">
                    {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
                  </span>
                  {selected.canSave && onSave && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSave(); }}
                      className="bg-[#38BDF8] text-white hover:bg-[#38BDF8]/90 px-2 py-1.5 rounded-md transition-colors flex items-center gap-1 shadow-sm"
                      title="Save Place"
                    >
                      <Save className="w-3 h-3" />
                      <span className="text-xs font-medium">Save</span>
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Popups for nearby places when selected */}
        {selected && isSelectedNearby && !isSelectedSaved && (
          <Popup position={[selected.lat, selected.lng]} className="travel-map-popup">
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-gray-900 text-sm mb-1">{selected.name}</h3>
              {selected.address && <p className="text-xs text-gray-600 mb-3">{selected.address}</p>}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <span className="text-[10px] text-gray-400 font-mono">
                  {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
                </span>
                {selected.canSave && onSave && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSave(); }}
                    className="bg-[#38BDF8] text-white hover:bg-[#38BDF8]/90 px-2 py-1.5 rounded-md transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Save className="w-3 h-3" />
                    <span className="text-xs font-medium">Save</span>
                  </button>
                )}
              </div>
            </div>
          </Popup>
        )}

        {routePath && (
          <Polyline 
            positions={routePath} 
            color="#38BDF8" 
            weight={4} 
            opacity={0.8}
            dashArray="10, 10"
            className="animate-pulse"
          />
        )}
      </MapContainer>
      
      <style jsx global>{`
        .map-tiles-dark {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .travel-map-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        .travel-map-popup .leaflet-popup-content {
          margin: 8px 12px;
        }
        .leaflet-container {
          background-color: #0B1F33;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
