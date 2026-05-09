import { createStore } from "zustand/vanilla";
import { Place, Coordinates } from "@/types/map";

export interface MapState {
  places: Place[];
  center: Coordinates;
  zoom: number;
}

export interface MapActions {
  addPlace: (place: Place) => void;
  removePlace: (id: string) => void;
  setCenter: (center: Coordinates) => void;
  setZoom: (zoom: number) => void;
}

export type MapStore = MapState & MapActions;

export const defaultInitState: MapState = {
  places: [],
  center: { lat: 20.5937, lng: 78.9629 },
  zoom: 5,
};

export const createMapStore = (initState: MapState = defaultInitState) => {
  return createStore<MapStore>()((set) => ({
    ...initState,
    addPlace: (place) =>
      set((state) => {
        if (state.places.some((p) => p.id === place.id)) return state;
        return { places: [...state.places, place] };
      }),
    removePlace: (id) =>
      set((state) => ({
        places: state.places.filter((p) => p.id !== id),
      })),
    setCenter: (center) => set({ center }),
    setZoom: (zoom) => set({ zoom }),
  }));
};
