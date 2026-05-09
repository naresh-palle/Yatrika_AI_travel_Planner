export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  coordinates: Coordinates;
  type?: string;
  description?: string;
  country?: string;
  state?: string;
}

export interface MarkerData {
  id: string;
  place: Place;
}

export interface RoutePath {
  id: string;
  waypoints: Coordinates[];
}
