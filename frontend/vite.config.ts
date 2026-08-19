import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // This allows access from other PCs
    port: 5173,
    proxy: {
      // Anything starting with /api is forwarded to the backend, so the
      // browser only ever talks to one origin — the same as production.
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
