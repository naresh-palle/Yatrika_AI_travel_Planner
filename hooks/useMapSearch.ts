import { useState, useCallback, useRef } from "react";
import { Place } from "@/types/map";

export function useMapSearch() {
  const [results, setResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchLocation = useCallback(async (query: string) => {
    if (!query || query.trim() === "") {
      setResults([]);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsSearching(true);
    setError(null);

    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
            query
          )}&limit=5`,
          {
            headers: {
              "Accept-Language": "en-US,en;q=0.9",
              "User-Agent": "Yatrika_Travel_Planner/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();

        if (data.length === 0) {
          setResults([]);
          return;
        }

        const formattedResults: Place[] = data.map((item: any) => ({
          id: item.place_id.toString(),
          name: item.display_name,
          coordinates: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          },
          type: item.type,
          country: item.address?.country ?? undefined,
          state: item.address?.state ?? undefined,
        }));

        setResults(formattedResults);
      } catch (err) {
        console.error("Geocoding error:", err);
        setError("Failed to search location. Please try again.");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce
  }, []);

  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isSearching,
    error,
    searchLocation,
    clearSearch,
  };
}
