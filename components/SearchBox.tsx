import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { useMapSearch } from "@/hooks/useMapSearch";
import { Place } from "@/types/map";

import { useMapStore } from "@/modules/map/src/stores/map.hook";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { results, isSearching, error, searchLocation, clearSearch } = useMapSearch();
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const addPlace = useMapStore((s) => s.addPlace);
  const setCenter = useMapStore((s) => s.setCenter);
  const setZoom = useMapStore((s) => s.setZoom);

  useEffect(() => {
    searchLocation(query);
    if (query.trim() !== "") {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query, searchLocation]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (place: Place) => {
    addPlace(place);
    setCenter(place.coordinates);
    setZoom(14);
    setQuery("");
    setIsOpen(false);
    clearSearch();
  };

  const handleClear = () => {
    setQuery("");
    clearSearch();
    setIsOpen(false);
  };

  return (
    <div 
      ref={wrapperRef}
      className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4 sm:px-0"
    >
      <div className="relative flex items-center bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-xl rounded-2xl overflow-hidden transition-all duration-300 focus-within:bg-white/20 dark:focus-within:bg-black/60 focus-within:shadow-2xl">
        <div className="pl-4 pr-2 text-muted-foreground/80">
          <Search className="w-5 h-5 text-white/70" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search destinations, hotels, attractions..."
          className="flex-1 h-12 bg-transparent text-white placeholder-white/50 focus:outline-none px-2 text-sm sm:text-base font-medium"
        />
        {query && (
          <button
            onClick={handleClear}
            className="px-4 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && (query.trim() !== "") && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 dark:bg-[#0B1F33]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden px-4 sm:px-0">
          {isSearching ? (
            <div className="flex items-center justify-center p-6 text-white/70">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-sm font-medium">Searching...</span>
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-400 bg-red-400/10 font-medium text-center">
              {error}
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-[60vh] overflow-y-auto py-2">
              {results.map((place) => (
                <li key={place.id}>
                  <button
                    onClick={() => handleSelect(place)}
                    className="w-full text-left flex items-start p-3 sm:px-4 hover:bg-white/10 transition-colors group"
                  >
                    <div className="mt-0.5 bg-white/10 rounded-full p-1.5 mr-3 group-hover:bg-[#38BDF8]/20 group-hover:text-[#38BDF8] text-white/50 transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white line-clamp-1">
                        {place.name.split(',')[0]}
                      </div>
                      <div className="text-xs text-white/50 line-clamp-1 mt-0.5">
                        {place.name.split(',').slice(1).join(',')}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-sm text-white/50 font-medium text-center">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
