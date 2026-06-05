import axios from "axios";

const api = axios.create({
  // Gunakan variabel environment yang konsisten
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://arta-backend-nine.vercel.app",
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");

    // VALIDASI: Pastikan token ada dan bukan objek rusak
    if (token && typeof token === 'string' && token.length > 20) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Jika token tidak valid, bersihkan dan biarkan request tanpa auth (atau redirect)
      localStorage.removeItem("token");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Jika token expired atau invalid (401 Unauthorized)
    if (error.response?.status === 401) {
      // Jangan auto-logout untuk endpoint verify-password (expected 401 jika password salah)
      const requestUrl = error.config?.url || "";
      if (requestUrl.includes("verify-password")) {
        return Promise.reject(error);
      }

      console.error("[API] Sesi tidak valid (401). Logout otomatis.");

      // Bersihkan data auth saja, jangan localStorage.clear() 
      // karena bisa menghapus data penting dan menyebabkan redirect ke onboarding
      localStorage.removeItem("token");
      localStorage.removeItem("profile");
      localStorage.removeItem("user");

      // Hanya redirect jika belum berada di halaman login (mencegah loop)
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;