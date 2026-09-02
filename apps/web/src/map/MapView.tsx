import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMap } from "./MapContext";

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setMap, updateViewState } = useMap();

  useEffect(() => {
    if (!containerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "";

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [116.397, 39.909],
      zoom: 10,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-left");

    const sync = () => {
      const c = map.getCenter();
      updateViewState({
        center: [c.lng, c.lat],
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      });
    };
    map.on("moveend", sync);
    sync();
    setMap(map);

    return () => {
      map.off("moveend", sync);
      map.remove();
      setMap(null);
    };
  }, [setMap, updateViewState]);

  return <div ref={containerRef} className="map-container" />;
}
