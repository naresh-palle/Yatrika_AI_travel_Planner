"use client";

import { createContext, useRef, ReactNode, useContext } from "react";
import { createMapStore, MapStore } from "./map.store";
import { StoreApi } from "zustand/vanilla";

export const MapStoreContext = createContext<StoreApi<MapStore> | null>(null);

export interface MapStoreProviderProps {
  children: ReactNode;
}

export const MapStoreProvider = ({ children }: MapStoreProviderProps) => {
  const storeRef = useRef<StoreApi<MapStore>>(null);
  if (!storeRef.current) {
    storeRef.current = createMapStore();
  }

  return (
    <MapStoreContext.Provider value={storeRef.current}>
      {children}
    </MapStoreContext.Provider>
  );
};
