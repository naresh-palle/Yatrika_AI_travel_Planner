"use client";

import { useContext } from "react";
import { useStore } from "zustand";
import { MapStoreContext } from "./map.provider";
import { MapStore } from "./map.store";

export const useMapStore = <T,>(selector: (store: MapStore) => T): T => {
  const mapStoreContext = useContext(MapStoreContext);

  if (!mapStoreContext) {
    throw new Error(`useMapStore must be used within MapStoreProvider`);
  }

  return useStore(mapStoreContext, selector);
};
