import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "../services/supabaseClient";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(() => {
    // Inisialisasi dari localStorage agar tidak flash ke onboarding saat page load
    try {
      const stored = localStorage.getItem("profile");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  /**
   * Fetch profil user dari backend API dan simpan ke context + localStorage.
   * Dipanggil setiap kali ada session baru (login, page refresh, OAuth callback).
   */
  const fetchProfile = useCallback(async (accessToken) => {
    try {
      // Pastikan token tersimpan di localStorage agar api interceptor bisa gunakan
      if (accessToken) {
        localStorage.setItem("token", accessToken);
      }

      const response = await api.get("/api/profile");
      const profileData = response?.data?.data?.profile;

      if (profileData) {
        setProfile(profileData);
        localStorage.setItem("profile", JSON.stringify(profileData));
      } else {
        // Profil belum ada (user baru / belum onboarding)
        setProfile(null);
        localStorage.removeItem("profile");
      }

      return profileData;
    } catch (err) {
      console.error("[AuthProvider] Gagal fetch profil:", err);
      // Jangan hapus profile yang sudah ada di state jika network error
      // Ini mencegah redirect ke onboarding karena network glitch
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Cek sesi saat aplikasi pertama dibuka
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        localStorage.setItem("token", session.access_token);
        localStorage.setItem("user", JSON.stringify(session.user));

        // Fetch profil terbaru dari server
        await fetchProfile(session.access_token);
      } else {
        setUser(null);
      }

      if (isMounted) setLoading(false);
    });

    // 2. Listener untuk perubahan status (Login/Logout/Token Refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      setUser(session?.user ?? null);

      if (session) {
        localStorage.setItem("token", session.access_token);
        localStorage.setItem("user", JSON.stringify(session.user));

        // Fetch profil saat SIGNED_IN (login manual, Google OAuth callback, dll)
        if (event === "SIGNED_IN") {
          await fetchProfile(session.access_token);
        }
      } else {
        // Logout — bersihkan semua data
        localStorage.removeItem("token");
        localStorage.removeItem("profile");
        localStorage.removeItem("user");
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{ user, profile, setProfile, loading, fetchProfile }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
