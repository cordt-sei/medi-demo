// vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": JSON.stringify(process.env),
  },
  server: {
    proxy: {
      "/license-proxy": {
        target: "https://raw.githubusercontent.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/license-proxy/, ""),
      },
    },
  },
});
