import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // 不自动打开浏览器：CopilotKit server（:4000）启动比 Vite 慢，
    // 自动打开会导致前端抢先连接、报 CONNECTION_REFUSED。
    // 等三个进程都起来后再手动访问 http://localhost:3000
    open: false,
  },
});
