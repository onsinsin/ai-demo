import { useCopilotAction } from "@copilotkit/react-core";
import { useMap } from "../../map/MapContext";

/** 注册地图控制类前端工具：fly_to / get_map_state / add_markers / clear_markers / set_minimap_visible */
export function useMapTools() {
  const { viewState, flyTo, addMarker, clearMarkers, setMinimapVisible } = useMap();

  useCopilotAction({
    name: "fly_to",
    description:
      "将地图视野飞行定位到指定经纬度（可指定缩放层级、俯仰角、朝向角）。用于用户要求定位/跳转/飞到某个地点。",
    parameters: [
      { name: "lng", type: "number", description: "经度", required: true },
      { name: "lat", type: "number", description: "纬度", required: true },
      { name: "zoom", type: "number", description: "缩放层级，默认 13", required: false },
      { name: "pitch", type: "number", description: "俯仰角（0-60 度），不传则保持当前视角", required: false },
      { name: "bearing", type: "number", description: "朝向角/旋转角（0-360 度），不传则保持当前视角", required: false },
    ],
    handler: ({ lng, lat, zoom, pitch, bearing }) => {
      flyTo(lng, lat, { zoom: zoom ?? 13, pitch, bearing });
      return `已将地图视野定位到 (${lng}, ${lat})，缩放 ${zoom ?? 13}`;
    },
  });

  useCopilotAction({
    name: "get_map_state",
    description: "读取当前地图视野信息：中心点坐标、缩放层级、俯仰角、旋转角",
    parameters: [],
    handler: () => ({
      center: viewState.center,
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing,
    }),
  });

  useCopilotAction({
    name: "add_markers",
    description: "在地图上添加点位标记（多个），坐标用高德 GCJ-02，前端会自动纠偏",
    parameters: [
      {
        name: "markers",
        type: "object[]",
        description: "要上图标记的点位数组",
        required: true,
        attributes: [
          { name: "lng", type: "number", description: "经度", required: true },
          { name: "lat", type: "number", description: "纬度", required: true },
          { name: "label", type: "string", description: "标记名称", required: true },
        ],
      },
    ],
    handler: ({ markers }) => {
      markers.forEach((m: { lng: number; lat: number; label: string }) =>
        addMarker(m.lng, m.lat, m.label),
      );
      return `已在图上添加 ${markers.length} 个标记`;
    },
  });

  useCopilotAction({
    name: "clear_markers",
    description: "清除地图上所有点位标记。当用户要求清除、清空、移除地图上的标记/点位时调用。",
    parameters: [],
    handler: () => {
      clearMarkers();
      return "已清除地图上所有标记";
    },
  });

  useCopilotAction({
    name: "set_minimap_visible",
    description:
      "设置检索结果下方缩略地图的显示/隐藏。当用户要求显示、隐藏、打开或关闭缩略图/小地图时调用。",
    parameters: [
      { name: "visible", type: "boolean", description: "true 显示，false 隐藏", required: true },
    ],
    handler: ({ visible }) => {
      setMinimapVisible(visible);
      return visible ? "已显示检索结果缩略地图" : "已隐藏检索结果缩略地图";
    },
  });
}
