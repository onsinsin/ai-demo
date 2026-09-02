import express from "express";
import cors from "cors";
import { CopilotRuntime, ExperimentalEmptyAdapter, copilotRuntimeNodeExpressEndpoint } from "@copilotkit/runtime";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

const LANGGRAPH_URL = process.env.LANGGRAPH_URL ?? "http://localhost:8123";

const runtime = new CopilotRuntime({
  agents: {
    // CopilotKit 聊天 UI 默认查找名为 "default" 的 agent，所以这里的 key 必须是 "default"。
    // graphId 才是 LangGraph 服务里注册的图 id（见 apps/agent/langgraph.json -> "map_agent"）。
    default: new LangGraphAgent({
      deploymentUrl: LANGGRAPH_URL,
      graphId: "map_agent",
    }),
  },
});

const app = express();
app.use(cors());

// 注意：必须挂载在根路径（不带 "/copilotkit" 前缀）。
// Express 的 app.use("/copilotkit", ...) 会剥离 req.url 前缀，导致
// handler 内部 getFullUrl 拼出错的 URL、Hono 的 basePath 永远匹配不上 → 全部 404。
// 由 handler 内部的 basePath("/copilotkit") 自己处理路由。
app.use(
  copilotRuntimeNodeExpressEndpoint({
    endpoint: "/copilotkit",
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
  }),
);

/**
 * 等 LangGraph server（agent，:8123）就绪后再开始监听。
 *
 * `npm run dev` 里 agent 启动最慢（编译 langchain + 拉起 MCP 子进程），
 * 而 server 启动快。若 server 先 listen，前端一连上、server 去连 agent 时
 * agent 还没起来，就会报 "Unable to connect to LangGraph server"。
 * 这里轮询 /ok，就绪后才 listen，避免启动竞态；超时也照常启动，不阻塞。
 */
async function waitForLangGraph(timeoutMs = 30000, intervalMs = 1000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${LANGGRAPH_URL}/ok`);
      if (res.ok) return;
    } catch {
      // agent 还没起来，继续等
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  console.warn(`[server] LangGraph server not ready at ${LANGGRAPH_URL} after ${timeoutMs}ms, starting anyway`);
}

const port = Number(process.env.PORT ?? 4000);
await waitForLangGraph();
app.listen(port, () => {
  console.log(`CopilotKit runtime listening on http://localhost:${port}/copilotkit`);
  console.log(`  -> bridging to LangGraph server: ${LANGGRAPH_URL}`);
});
