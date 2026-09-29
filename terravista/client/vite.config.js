import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Todo el sitio queda en un solo proyecto: el build del cliente cae
    // directo dentro de server/public, que Express sirve como estático.
    outDir: "../server/public",
    emptyOutDir: true,
  },
  server: {
    // Solo para desarrollo local (npm run dev en /client): así puedes
    // trabajar con hot-reload mientras la API real corre en :4000, sin
    // pelear con CORS. En producción no aplica: todo va por el mismo puerto.
    proxy: {
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
});
