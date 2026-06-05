import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Tambahkan ini

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/api/profile/sync-business": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      "/api/users": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      "/api": {
        target: "https://arta-backend-nine.vercel.app",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
