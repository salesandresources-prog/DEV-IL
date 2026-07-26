import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Mantenemos la configuración del servidor que ya funciona
    server: { entry: "server" },
    // Eliminamos la línea "router" por completo para que el sistema busque en la raíz de src
  },
});