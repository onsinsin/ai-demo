# AI 地图大屏技术验证（POC）

基于 **AI 交互式聊天** 的地图大屏示例，打通「地名地址检索 → 结果卡片展示 → 点位上图 → 地图视野定位 → 读取地图状态」的完整闭环。

## 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前端 | CopilotKit (React) + mapbox-gl | 聊天交互 + 地图引擎 |
| Agent | LangChain.js (LangGraph) + Node.js + TypeScript | 工具调用 Agent |
| 大模型 | DeepSeek（OpenAI 兼容） | `deepseek-chat` |
| 地名检索 | 高德 Web 服务 API（自研 MCP） | `place/text`、`geocode/geo` |
| MCP | `@langchain/mcp-adapters` | 接入自研 + 第三方 MCP 服务 |

## 架构

```
浏览器 (apps/web)
  <CopilotKit runtimeUrl="http://localhost:4000/copilotkit">
    MapView (mapbox-gl)
    useCopilotAction: fly_to / get_map_state / add_markers / show_search_results(卡片)
    useCopilotReadable: 当前地图视野(center/zoom/pitch/bearing)
        │ CopilotKit AG-UI 协议
        ▼
apps/server (Express + @copilotkit/runtime)
  CopilotRuntime({ agents: { default: LangGraphAgent({ deploymentUrl: :8123, graphId: "map_agent" }) }})
        │ LangGraph 协议
        ▼
apps/agent (LangGraph.js，`langgraphjs dev` 启动)
  createAgent({ model: DeepSeek, tools: MCP 工具, middleware: [copilotkitMiddleware] })
    ├─ 自研 MCP：packages/geocode-mcp（高德地名检索，stdio 子进程）
    └─ 第三方 MCP：@modelcontextprotocol/server-everything（stdio，默认关闭，ENABLE_THIRD_PARTY_MCP=true 开启）
```

> 关键机制：前端 `useCopilotAction` 注册的动作由 CopilotKit 桥接层写入 `state.copilotkit.actions`，再由 `@copilotkit/sdk-js` 的 `copilotkitMiddleware` **动态合并进 LLM 工具列表**；`useCopilotReadable` 同理注入为上下文。因此「读取地图状态」「控制地图视野」由 Agent 调用前端工具完成。

## 前置要求

- **Node ≥ 20.16（建议 22/24 LTS）** —— 现代 LangChain 1.x 要求（`@langchain/openai` 最新版要求 ≥22）。
- 三个外部 key：
  - `DEEPSEEK_API_KEY`（DeepSeek 开放平台）
  - `AMAP_KEY`（高德开放平台，需开通「Web 服务」类型）
  - `VITE_MAPBOX_ACCESS_TOKEN`（Mapbox）

## 快速开始

```bash
# 1. 安装依赖（根目录，npm workspaces 一次性装全部）
npm install

# 2. 打包自研 MCP 服务
npm run build:mcp

# 3. 配置环境变量（已从 .env.example 生成了 .env，填入真实 key）
#    apps/agent/.env    -> DEEPSEEK_API_KEY, AMAP_KEY
#    apps/web/.env      -> VITE_MAPBOX_ACCESS_TOKEN
#    apps/server/.env   -> LANGGRAPH_URL（默认 http://localhost:8123，无需改）

# 4. 启动（推荐：拆成 3 个终端，按顺序启动，稳定可控）
#    注意顺序：agent → server → web，且要等前一个就绪再启下一个
```

**方式 A（推荐，稳定）—— 3 个终端按顺序启动：**

```bash
# 终端 1：Agent（LangGraph 服务 :8123）
npm run dev:agent
#   → 看到 "Server running at ::1:8123" 且出现 "Registering graph with id 'map_agent'" 即就绪

# 终端 2：CopilotKit 桥（:4000）—— 它会自动等 agent 就绪才监听
npm run dev:server
#   → 看到 "CopilotKit runtime listening on http://localhost:4000/copilotkit" 即就绪

# 终端 3：前端（Vite :3000）
npm run dev:web
#   → 看到 "Local: http://localhost:3000" 即就绪
```

**方式 B（便捷，略不稳定）—— 一键并发：**

```bash
npm run dev   # concurrently 同时起 3 个进程，存在启动竞态，偶发 404/连不上
```

打开 http://localhost:3000 ，右侧「地图助手」聊天面板即可交互。

> 说明：agent 启动最慢（编译 langchain + 拉起自研 MCP 子进程）；server 已在代码里加了就绪等待（轮询 :8123/ok 后再监听），所以「方式 A」按顺序来几乎不会再出现「连不上 agent / 404」。首次启动较慢属正常。

## 端到端验证用例

1. **地名检索 + 卡片**：「帮我找一下北京的故宫」
   → Agent 调用自研 MCP 的 `search_place`（高德）→ 调用 `show_search_results` → 聊天框出现**结果卡片**。
2. **卡片点击定位**：点击卡片「定位」→ 地图 `flyTo` 到该点位（GCJ-02 已纠偏为 WGS-84）。
3. **结果上图**：Agent 可选调用 `add_markers` → 点位标记上图。
4. **读取地图状态**：「当前地图中心点、层级和视角是多少」→ Agent 读 `get_map_state` / 可读上下文回答。
5. **前端控制**：「把地图飞到上海外滩，层级 12」→ Agent 调 `fly_to` → 视野变化。
6. **第三方 MCP**：「用 echo 工具复述一下“你好”」→ 验证第三方 MCP 接入链路。

## 目录结构

```
apps/
  agent/    LangGraph.js Agent（langgraph.json + DeepSeek + MCP 工具）
  server/   CopilotKit runtime 桥（Express，:4000）
  web/      Vite + React 前端（mapbox-gl + CopilotKit）
packages/
  geocode-mcp/  自研 MCP 服务（高德地名检索，stdio）
```

## 关键实现说明

- **坐标纠偏**：高德返回 GCJ-02（火星坐标），标准 Mapbox 底图是 WGS-84。`apps/web/src/map/mapUtils.ts` 的 `gcj02ToWgs84` 统一在 `flyTo` / `addMarker` 内纠偏，卡片定位也复用同一入口。
- **MCP 接入**：`apps/agent/src/mcp.ts` 用 `MultiServerMCPClient` 同时接入自研（geocode，stdio）与第三方（everything，stdio）。替换第三方 MCP 只需改这里的配置（支持 stdio / streamable-http）。
- **版本说明**：CopilotKit 当前 `1.70.0`；v1 前端 Hook（`useCopilotAction`/`useCopilotReadable`）与 `LangGraphAgent` 适配器已标记 deprecated 但功能稳定，且是连接自托管 LangGraph.js 服务的唯一方式（v2 尚未提供 LangGraph 服务适配器），故本 POC 使用 v1 API。
