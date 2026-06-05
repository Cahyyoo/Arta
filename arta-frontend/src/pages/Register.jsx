import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { supabase } from "../services/supabaseClient";
import AuthLayout from "../components/AuthLayout";
import { FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";

const Register = () => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const isEmailValid =
    formData.email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const pwdCriteria = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
  };
  const isPasswordMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;
  const isConfirmPasswordInvalid =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEmailValid || formData.email === "") {
      return setError("Format email tidak valid");
    }

    if (!pwdCriteria.length || !pwdCriteria.uppercase || !pwdCriteria.number) {
      return setError("Password tidak memenuhi semua kriteria");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Password dan Ulangi Password tidak cocok");
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nama_lengkap: formData.nama,
          },
        },
      });

      if (signUpError) throw signUpError;
      
      // Catatan: Jika email confirmation diaktifkan di Supabase, data.session mungkin null.
      // Arahkan user ke halaman OTP / Verifikasi
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      setError(
        err.message || err.response?.data?.message || "Terjadi kesalahan saat mendaftar",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Grow Your UMKM!"
      subtitle="Start managing your business finances smartly and unlock new growth opportunities."
      showSocial={true}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 flex flex-col flex-grow"
      >
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100 font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-600 ml-1">
            Full Name
          </label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all text-sm placeholder:text-slate-400"
            placeholder="Input Full Name"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-600 ml-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 bg-slate-50 border ${!isEmailValid ? "border-red-400 focus:ring-red-400 focus:bg-red-50/50" : "border-slate-100 focus:ring-indigo-400"} rounded-xl focus:ring-2 focus:bg-white outline-none transition-all text-sm placeholder:text-slate-400`}
            placeholder="Input your email"
          />
          {!isEmailValid && (
            <p className="text-xs text-red-500 ml-1 mt-1 font-medium">
              Format email tidak valid
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-600 ml-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all text-sm placeholder:text-slate-400"
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

          {formData.password.length > 0 && (
            <div className="mt-3 ml-1 flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 text-xs">
                {pwdCriteria.length ? (
                  <FiCheck size={14} className="text-emerald-500" />
                ) : (
                  <FiX size={14} className="text-slate-300" />
                )}
                <span
                  className={
                    pwdCriteria.length
                      ? "text-emerald-600 font-medium"
                      : "text-slate-500"
                  }
                >
                  Minimal 8 karakter
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {pwdCriteria.uppercase ? (
                  <FiCheck size={14} className="text-emerald-500" />
                ) : (
                  <FiX size={14} className="text-slate-300" />
                )}
                <span
                  className={
                    pwdCriteria.uppercase
                      ? "text-emerald-600 font-medium"
                      : "text-slate-500"
                  }
                >
                  Mengandung huruf besar
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {pwdCriteria.number ? (
                  <FiCheck size={14} className="text-emerald-500" />
                ) : (
                  <FiX size={14} className="text-slate-300" />
                )}
                <span
                  className={
                    pwdCriteria.number
                      ? "text-emerald-600 font-medium"
                      : "text-slate-500"
                  }
                >
                  Mengandung angka
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-600 ml-1">
            Ulangi Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 pr-10 bg-slate-50 border ${isConfirmPasswordInvalid ? "border-red-400 focus:ring-red-400 focus:bg-red-50/50" : isPasswordMatch ? "border-emerald-400 focus:ring-emerald-400 focus:bg-emerald-50/50" : "border-slate-100 focus:ring-indigo-400"} rounded-xl focus:ring-2 focus:bg-white outline-none transition-all text-sm placeholder:text-slate-400`}
              placeholder="Ulangi password Anda"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            >
              {showConfirmPassword ? (
                <FiEyeOff size={18} />
              ) : (
                <FiEye size={18} />
              )}
            </button>
          </div>
          {isConfirmPasswordInvalid && (
            <p className="text-xs text-red-500 ml-1 mt-1 font-medium">
              Password tidak cocok
            </p>
          )}
          {isPasswordMatch && (
            <p className="text-xs text-emerald-600 ml-1 mt-1 font-medium">
              Password cocok
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-bold py-3.5 rounded-xl shadow-xl shadow-indigo-500/25 transition-all active:scale-[0.98] flex justify-center items-center"
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          By continuing with Google, Apple, or Email, you agree to UMKM Finance{" "}
          <a href="#" className="font-semibold underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-semibold underline">
            Privacy Policy
          </a>
          .
        </p>

        <p className="mt-auto pt-6 text-center text-sm font-medium text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-slate-900 hover:text-indigo-500 font-bold transition-colors"
          >
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
