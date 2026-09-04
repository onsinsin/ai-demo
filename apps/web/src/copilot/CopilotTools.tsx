import { useMapTools } from "./tools/mapTools";
import { useMapReadables } from "./tools/readables";
import { useResultTools } from "../results";

/**
 * 组合所有 CopilotKit 前端工具与可读上下文的薄编排层。
 * 新增工具/上下文时在对应 tools 文件里追加，或在此引入新的 hook。
 */
export default function CopilotTools() {
  useMapTools();
  useMapReadables();
  useResultTools();
  return null;
}
