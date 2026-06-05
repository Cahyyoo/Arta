import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { supabase } from "../services/supabaseClient";
import AuthLayout from "../components/AuthLayout";
import { FiMail, FiRefreshCw } from "react-icons/fi";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil email dari state navigasi (dikirim dari Register.jsx)
  const email = location.state?.email || "";

  // Redirect jika tidak ada email
  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer untuk resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Mask email untuk privasi (a***n@gmail.com)
  const maskEmail = (email) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    if (name.length <= 2) return `${name[0]}***@${domain}`;
    return `${name[0]}${name[1]}***${name[name.length - 1]}@${domain}`;
  };

  // Handle input per digit
  const handleChange = (index, value) => {
    // Hanya izinkan angka
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus ke input berikutnya
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste (tempel kode 6 digit sekaligus)
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Enter untuk submit
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Submit verifikasi OTP
  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Masukkan 6 digit kode verifikasi");
      // Shake animation
      const container = document.getElementById("otp-container");
      container?.classList.add("animate-shake");
      setTimeout(() => container?.classList.remove("animate-shake"), 500);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "signup",
      });

      if (verifyError) throw verifyError;

      setSuccess("Verifikasi berhasil! Mengalihkan ke halaman login...");

      // Coba kirim data profil ke backend (onboarding dummy jika diperlukan)
      // Supabase otomatis menyimpan session jika berhasil login via OTP


      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Email berhasil diverifikasi! Silakan login." },
        });
      }, 2000);
    } catch (err) {
      const message = err.message || "Kode OTP tidak valid";
      setError(message);

      // Shake animation saat error
      const container = document.getElementById("otp-container");
      container?.classList.add("animate-shake");
      setTimeout(() => container?.classList.remove("animate-shake"), 500);

      // Reset input
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Kirim ulang OTP
  const handleResend = async () => {
    if (!canResend) return;

    setResendLoading(true);
    setError("");

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (resendError) throw resendError;
      setSuccess("Kode OTP baru telah dikirim ke email Anda!");
      setCanResend(false);
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      // Hilangkan pesan sukses setelah 3 detik
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Gagal mengirim ulang kode OTP");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <AuthLayout
      title="Verifikasi Email"
      subtitle="Masukkan kode 6 digit yang telah dikirim ke email Anda."
      showSocial={false}
    >
      <div className="flex flex-col items-center flex-grow">
        {/* Email destination badge */}
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full mb-6 text-sm font-medium border border-indigo-100">
          <FiMail size={16} />
          <span>{maskEmail(email)}</span>
        </div>


        {/* Error message */}
        {error && (
          <div className="w-full bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100 font-medium mb-4">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="w-full bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm text-center border border-emerald-100 font-medium mb-4">
            {success}
          </div>
        )}

        {/* 6-digit OTP input */}
        <div
          id="otp-container"
          className="flex gap-3 mb-6"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200
                ${
                  digit
                    ? "border-orange-400 bg-orange-50 text-orange-700 shadow-sm shadow-orange-500/10"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }
                focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 focus:bg-white
              `}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          onClick={handleSubmit}
          disabled={loading || otp.join("").length !== 6}
          className={`w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98] flex justify-center items-center mb-4
            ${(loading || otp.join("").length !== 6) ? "opacity-60 cursor-not-allowed" : ""}
          `}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memverifikasi...
            </span>
          ) : (
            "Verifikasi"
          )}
        </button>

        {/* Resend OTP */}
        <div className="text-center mt-2">
          <p className="text-sm text-slate-500 mb-2">
            Tidak menerima kode?
          </p>
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1.5 mx-auto"
            >
              <FiRefreshCw size={14} className={resendLoading ? "animate-spin" : ""} />
              {resendLoading ? "Mengirim..." : "Kirim Ulang Kode"}
            </button>
          ) : (
            <p className="text-sm font-semibold text-slate-400">
              Kirim ulang dalam <span className="text-orange-500">{countdown}s</span>
            </p>
          )}
        </div>

        {/* Back to register */}
        <p className="mt-auto pt-6 text-center text-sm font-medium text-slate-600">
          Salah email?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-slate-900 hover:text-orange-500 font-bold transition-colors"
          >
            Kembali ke Daftar
          </button>
        </p>
      </div>

      {/* Shake animation CSS */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </AuthLayout>
  );
};

export default VerifyOtp;
