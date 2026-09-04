import { useCopilotAction } from "@copilotkit/react-core";
import { useMap } from "../../map/MapContext";
import ResultsMiniMap from "../../map/ResultsMiniMap";
import PoiCard, { type PoiResult } from "./PoiCard";

/** 注册地名检索结果展示工具：show_search_results（卡片列表 + 缩略地图） */
export function usePoiResultTools() {
  const { flyTo } = useMap();

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
    render: ({ args }) => {
      const results = (args.results ?? []) as PoiResult[];
      return (
        <div className="search-results">
          {results.map((r: PoiResult, i: number) => (
            <PoiCard key={r.id ?? i} result={r} onLocate={() => flyTo(r.lng, r.lat)} />
          ))}
          <ResultsMiniMap items={results.map((r) => ({ lng: r.lng, lat: r.lat, name: r.name }))} />
        </div>
      );
    },
  });
}
