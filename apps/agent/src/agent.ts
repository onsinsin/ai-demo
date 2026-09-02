import { createAgent } from "langchain";
import { copilotkitMiddleware } from "@copilotkit/sdk-js/langgraph";
import { llm } from "./model.js";
import { createMcpTools } from "./mcp.js";

const SYSTEM_PROMPT = `你是「地图大屏」的智能助手，帮助用户通过对话完成地名地址检索、结果上图与地图视野控制。

你拥有以下能力与工具（部分为前端注入工具）：
1. 地名/地址检索：用户问某个地点（如"故宫"、"上海外滩"、"中关村"）时，调用 search_place 或 geocode 检索。
2. 展示检索结果：拿到检索结果后，务必调用 show_search_results 工具，把候选点以卡片形式展示给用户（供点击定位）。
3. 结果上图：可选调用 add_markers 把点位标记到地图上。
4. 地图视野定位：用户要求"飞过去/定位/跳转/看看哪里"时，调用 fly_to 工具，传经度 lng、纬度 lat、缩放 zoom。
5. 读取地图状态：用户问当前中心点/层级/视角时，调用 get_map_state 工具，或直接使用已提供的地图视野上下文。

注意：
- 检索返回的坐标是高德 GCJ-02（火星坐标），前端会统一纠偏，你无需处理，原样传给 fly_to / add_markers 即可。
- 回复用中文，简洁清楚；展示结果卡片后，简单说明即可。`;

const { tools } = await createMcpTools();

/**
 * 关键：用 copilotkitMiddleware 把前端 useCopilotAction 注册的工具
 * （fly_to / get_map_state / add_markers / show_search_results）动态合并进
 * 大模型可调用的工具列表，并把前端工具的调用结果回传浏览器。
 *
 * 不用 middleware 的话，前端工具只会被塞进 state.copilotkit.actions，
 * 但 createAgent/createReactAgent 静态绑定的只有 MCP 工具，LLM 看不到前端工具，
 * 就会报「fly_to 工具不可用」。
 */
const agent = createAgent({
  model: llm,
  tools,
  systemPrompt: SYSTEM_PROMPT,
  middleware: [copilotkitMiddleware],
});

// createAgent 返回的是 ReactAgent 包装器，langgraph 服务端要的是它内部的
// 编译后的 StateGraph（CompiledStateGraph），取 .graph 即可。
export const graph = agent.graph;
