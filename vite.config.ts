import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "vercel",
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
});
