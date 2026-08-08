import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: 'vercel',
  },
  server: {
    host: '0.0.0.0', // Esto es lo que permite la conexión externa
    port: 5173,
  },
  // ... resto de tu configuración
})