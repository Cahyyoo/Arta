import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import api from "../services/api";
import { supabase } from "../services/supabaseClient";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthProvider";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setProfile } = useAuth();
  const successMessage = location.state?.message || "";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (isEmailNotConfirmed) setIsEmailNotConfirmed(false);
  };

  const handleGoToVerify = () => {
    navigate("/verify-otp", { state: { email: formData.email } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Sign In via Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Ambil role dari metadata user (jika ada)
      const userRole = data.user?.user_metadata?.role?.toUpperCase();

      // 2. Fetch Profile
      try {
        const profileResponse = await api.get("/api/profile");
        const profile = profileResponse?.data?.data?.profile;

        if (profile) {
          localStorage.setItem("profile", JSON.stringify(profile));
          setProfile(profile);

          // === LOGIKA REDIRECT CERDAS ===
          const role = userRole || profile.role?.toUpperCase() || "USER";
          const isCompleted = profile.onboarding_completed;
          const userType = data.user?.user_metadata?.user_type || profile.user_type;

          if (role === "ADMIN" || role === "USER") {
            // Karyawan (Admin/User) BYPASS langsung ke Dashboard
            navigate("/dashboard", { replace: true });
          } else if (role === "OWNER" && (isCompleted || userType)) {
            // Owner yang sudah punya profil usaha / calon pengusaha
            navigate("/dashboard", { replace: true });
          } else {
            // Pendaftar baru yang belum melakukan apa-apa
            navigate("/onboarding", { replace: true });
          }
          // ===============================

        } else {
          // Fallback jika API Profile gagal, tapi auth berhasil
          if (userRole === "ADMIN" || userRole === "USER") {
            navigate("/dashboard", { replace: true });
          } else {
            setProfile(null);
            navigate("/onboarding", { replace: true });
          }
        }
      } catch (profileErr) {
        console.error("Gagal mengambil profil:", profileErr);

        // Proteksi ekstra: Kalau API error, tapi dia Admin/User, tetap izinkan masuk
        if (userRole === "ADMIN" || userRole === "USER") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      }

    } catch (err) {
      console.error("Login Error:", err);
      const message = err.message || "Email atau password salah";
      setError(message);
      if (message.toLowerCase().includes("email not confirmed")) {
        setIsEmailNotConfirmed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to continue managing your UMKM finances efficiently."
      showSocial={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4 flex flex-col flex-grow">
        {successMessage && (
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm text-center border border-emerald-100 font-medium">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100 font-medium">
            <p>{error}</p>
            {isEmailNotConfirmed && (
              <button
                type="button"
                onClick={handleGoToVerify}
                className="mt-2 block w-full bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Verifikasi Sekarang →
              </button>
            )}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-600 ml-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all text-sm"
            placeholder="Input your email"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-600 ml-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all text-sm"
              placeholder="Input your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-bold py-3.5 rounded-xl shadow-xl shadow-indigo-500/25 transition-all active:scale-[0.98]"
          >
            {loading ? "Processing..." : "Sign In"}
          </button>
        </div>

        <p className="mt-auto pt-6 text-center text-sm font-medium text-slate-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-slate-900 hover:text-indigo-500 font-bold transition-colors">
            Sign Up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;