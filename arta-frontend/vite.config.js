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
      "/api/profile": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      "/api/users": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      "/api/auth": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      "/api/business": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      "/api/dashboard": {
        target: "https://arta-backend-nine.vercel.app",
        changeOrigin: true,
        secure: false,
      },
      "/api/transactions": {
        target: "https://arta-backend-nine.vercel.app",
        changeOrigin: true,
        secure: false,
      },
      "/api/reports": {
        target: "https://arta-backend-nine.vercel.app",
        changeOrigin: true,
        secure: false,
      },
      "/api/forecast": {
        target: "https://arta-backend-nine.vercel.app",
        changeOrigin: true,
        secure: false,
      },
      "/api/feasibility-tests": {
        target: "https://arta-backend-nine.vercel.app",
        changeOrigin: true,
        secure: false,
      },
      "/api/health": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});
