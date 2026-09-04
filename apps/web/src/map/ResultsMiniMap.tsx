import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { gcj02ToWgs84 } from "./mapUtils";
import { useMap } from "./MapContext";

export interface MiniMapItem {
  lng: number;
  lat: number;
  name: string;
}

interface Props {
  items: MiniMapItem[];
}

/**
 * 检索结果缩略地图（300×200，只读静态）。
 * - 自建独立 map 实例（不复用主图 mapRef），视野自动定位到所有结果点。
 * - 每个点位：红点 + 常显名称标签（自定义 DOM marker）+ 点击弹 Popup。
 * - 由 MapContext 的 minimapVisible 控制显隐，隐藏时返回 null。
 */
export default function ResultsMiniMap({ items }: Props) {
  const { minimapVisible } = useMap();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!minimapVisible || !containerRef.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "";

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      interactive: false,
    });

    const points: [number, number][] = [];
    for (const item of items) {
      const [wgsLng, wgsLat] = gcj02ToWgs84(item.lng, item.lat);
      points.push([wgsLng, wgsLat]);

      // 自定义 DOM marker：红点 + 常显名称标签
      const el = document.createElement("div");
      el.className = "mini-marker";
      const dot = document.createElement("span");
      dot.className = "mini-marker__dot";
      const label = document.createElement("span");
      label.className = "mini-marker__label";
      label.textContent = item.name; // textContent 防 XSS
      el.append(dot, label);

      new mapboxgl.Marker({ element: el })
        .setLngLat([wgsLng, wgsLat])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setText(item.name))
        .addTo(map);
    }

    if (points.length === 1) {
      map.setCenter(points[0]);
      map.setZoom(14);
    } else if (points.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      points.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, { padding: 24, maxZoom: 15 });
    }

    return () => {
      map.remove();
    };
  }, [items, minimapVisible]);

  if (!minimapVisible) return null;
  return <div ref={containerRef} className="mini-map" />;
}
