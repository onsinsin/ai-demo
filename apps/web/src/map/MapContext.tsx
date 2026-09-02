import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import mapboxgl from "mapbox-gl";
import { gcj02ToWgs84 } from "./mapUtils";

export interface ViewState {
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
}

interface MapContextValue {
  mapRef: { current: mapboxgl.Map | null };
  viewState: ViewState;
  setMap: (m: mapboxgl.Map | null) => void;
  updateViewState: (v: ViewState) => void;
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  addMarker: (lng: number, lat: number, label: string) => void;
  minimapVisible: boolean;
  setMinimapVisible: (v: boolean) => void;
}

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [viewState, setViewState] = useState<ViewState>({
    center: [116.397, 39.909],
    zoom: 10,
    pitch: 0,
    bearing: 0,
  });
  const [minimapVisible, setMinimapVisible] = useState(true);

  const setMap = useCallback((m: mapboxgl.Map | null) => {
    mapRef.current = m;
  }, []);

  const updateViewState = useCallback((v: ViewState) => setViewState(v), []);

  const flyTo = useCallback((lng: number, lat: number, zoom = 13) => {
    const [wgsLng, wgsLat] = gcj02ToWgs84(lng, lat);
    mapRef.current?.flyTo({ center: [wgsLng, wgsLat], zoom, essential: true });
  }, []);

  const addMarker = useCallback((lng: number, lat: number, label: string) => {
    if (!mapRef.current) return;
    const [wgsLng, wgsLat] = gcj02ToWgs84(lng, lat);
    new mapboxgl.Marker({ color: "#e63e3e" })
      .setLngLat([wgsLng, wgsLat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(label))
      .addTo(mapRef.current);
  }, []);

  return (
    <MapContext.Provider
      value={{ mapRef, viewState, setMap, updateViewState, flyTo, addMarker, minimapVisible, setMinimapVisible }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMap(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMap must be used within MapProvider");
  return ctx;
}
