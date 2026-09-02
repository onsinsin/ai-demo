import { MultiServerMCPClient, type Connection } from "@langchain/mcp-adapters";
import path from "node:path";

/**
 * 自研 MCP 服务入口（打包产物）。默认按 monorepo 布局从 apps/agent 向上推算，
 * 可通过环境变量 GEOCODE_MCP_ENTRY 覆盖为绝对路径。
 */
const GEOCODE_ENTRY =
  process.env.GEOCODE_MCP_ENTRY ??
  path.resolve(process.cwd(), "../../packages/geocode-mcp/dist/index.js");

/**
 * 第三方 MCP 开关。默认关闭，因为第三方 stdio 服务需要 `npx` 联网下载、
 * 拖慢启动且易失败。需要验证第三方接入时，在 apps/agent/.env 里设置
 * `ENABLE_THIRD_PARTY_MCP=true` 再启动即可。
 */
const ENABLE_THIRD_PARTY_MCP = process.env.ENABLE_THIRD_PARTY_MCP === "true";

/**
 * 连接自研 +（可选）第三方 MCP 服务，加载为 LangChain 工具。
 *
 * - geocode：自研 MCP（高德地名检索），stdio 子进程，始终加载。
 * - everything：第三方公共 MCP（演示第三方接入，可替换为任意 stdio/streamable-http
 *   服务），仅在 ENABLE_THIRD_PARTY_MCP=true 时加载。
 */
export async function createMcpTools() {
  const mcpServers: Record<string, Connection> = {
    geocode: {
      transport: "stdio",
      command: "node",
      args: [GEOCODE_ENTRY],
      // 关键：MCP SDK 的 stdio 子进程默认只继承一个「安全白名单」环境变量
      // （PATH/APPDATA/TEMP 等），不会自动带上 AMAP_KEY。必须显式注入，
      // 否则 geocode-mcp 子进程读不到 AMAP_KEY，检索会报「缺少地图服务密钥」。
      env: { AMAP_KEY: process.env.AMAP_KEY ?? "" },
    },
  };

  if (ENABLE_THIRD_PARTY_MCP) {
    mcpServers.everything = {
      transport: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-everything"],
    };
  }

  const client = new MultiServerMCPClient({ mcpServers });

  const tools = await client.getTools();
  return { tools, client };
}
