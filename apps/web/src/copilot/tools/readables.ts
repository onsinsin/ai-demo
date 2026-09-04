import { useCopilotReadable } from "@copilotkit/react-core";
import { useMap } from "../../map/MapContext";

/** 注册可读上下文：当前地图视野（中心点/层级/俯仰/旋转），随 moveend 实时更新 */
export function useMapReadables() {
  const { viewState } = useMap();

  useCopilotReadable({
    description:
      "当前地图视野信息：center 为 [经度,纬度] 中心点，zoom 缩放层级，pitch 俯仰角，bearing 旋转角",
    value: viewState,
  });
}
