import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useMap } from "../map/MapContext";
import SearchResultCard, { type SearchResult } from "../components/SearchResultCard";
import SearchMiniMap from "../map/SearchMiniMap";

/**
 * 注册「前端工具」与「可读上下文」，供 Agent 通过 CopilotKit 调用：
 * - 可读上下文：当前地图视野（中心点/层级/俯仰/旋转），随 moveend 实时更新。
 * - 前端工具：fly_to / get_map_state / add_markers / show_search_results。
 */
export default function MapAgent() {
  const { viewState, flyTo, addMarker, setMinimapVisible } = useMap();

  useCopilotReadable({
    description:
      "当前地图视野信息：center 为 [经度,纬度] 中心点，zoom 缩放层级，pitch 俯仰角，bearing 旋转角",
    value: viewState,
  });

  useCopilotAction({
    name: "fly_to",
    description:
      "将地图视野飞行定位到指定经纬度（可指定缩放层级）。用于用户要求定位/跳转/飞到某个地点。",
    parameters: [
      { name: "lng", type: "number", description: "经度", required: true },
      { name: "lat", type: "number", description: "纬度", required: true },
      { name: "zoom", type: "number", description: "缩放层级，默认 13", required: false },
    ],
    handler: ({ lng, lat, zoom }) => {
      flyTo(lng, lat, zoom ?? 13);
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
    name: "show_search_results",
    description: "在聊天中展示地名检索结果卡片列表，供用户点击「定位」把地图视野定位到该点",
    parameters: [
      {
        name: "results",
        type: "object[]",
        description: "检索结果数组",
        required: true,
        attributes: [
          { name: "id", type: "string", description: "POI id" },
          { name: "name", type: "string", description: "名称" },
          { name: "address", type: "string", description: "地址" },
          { name: "lng", type: "number", description: "经度" },
          { name: "lat", type: "number", description: "纬度" },
          { name: "adname", type: "string", description: "区县" },
        ],
      },
    ],
    handler: ({ results }) => `已在聊天中展示 ${results.length} 条检索结果`,
    render: ({ args }) => (
      <div className="search-results">
        {(args.results ?? []).map((r: SearchResult, i: number) => (
          <SearchResultCard key={r.id ?? i} result={r} onLocate={() => flyTo(r.lng, r.lat)} />
        ))}
        <SearchMiniMap results={(args.results ?? []) as SearchResult[]} />
      </div>
    ),
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

  return null;
}
