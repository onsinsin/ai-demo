import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchPlace, geocode } from "./amap.js";

const server = new McpServer({ name: "geocode-mcp", version: "0.1.0" });

server.registerTool(
  "search_place",
  {
    title: "地名地址检索",
    description:
      "根据地名关键词检索 POI 位置，返回候选点（含名称、地址、经纬度 lng/lat、区县 adname、类型 type）。" +
      "用于『XX 在哪里』『帮我找一下 XX』等地名/地址检索需求。",
    inputSchema: {
      keywords: z.string().describe("检索关键词，如 故宫、上海外滩、中关村"),
      city: z.string().optional().describe("限定城市，如 北京；不填则全国范围"),
      types: z.string().optional().describe("高德 POI 类型编码，如 120000（商务住宅），可留空"),
    },
  },
  async ({ keywords, city, types }) => {
    const results = await searchPlace(keywords, city, types);
    return {
      content: [
        { type: "text", text: JSON.stringify({ count: results.length, results }) },
      ],
    };
  },
);

server.registerTool(
  "geocode",
  {
    title: "结构化地址转经纬度",
    description:
      "将结构化地址（省市区街道门牌）转换为经纬度坐标。用于用户给出完整地址时解析坐标。",
    inputSchema: {
      address: z.string().describe("结构化地址，如 北京市东城区景山前街4号"),
      city: z.string().optional().describe("城市，可留空"),
    },
  },
  async ({ address, city }) => {
    const results = await geocode(address, city);
    return {
      content: [
        { type: "text", text: JSON.stringify({ count: results.length, results }) },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
