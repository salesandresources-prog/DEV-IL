import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: {
      preset: 'vercel'
    }
  },
  nitro: false,
  server: {
    host: '0.0.0.0', // Esto es lo que permite la conexión externa
    port: 5173,
  },
  // ... resto de tu configuración
})