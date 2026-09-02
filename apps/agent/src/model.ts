import { ChatOpenAI } from "@langchain/openai";

/**
 * DeepSeek 大模型（OpenAI 兼容协议）。
 * baseURL 指向 DeepSeek 的 OpenAI 兼容端点。
 */
export const llm = new ChatOpenAI({
  model: "deepseek-chat",
  apiKey: process.env.DEEPSEEK_API_KEY,
  temperature: 0.3,
  configuration: {
    baseURL: "https://api.deepseek.com/v1",
  },
});
