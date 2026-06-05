import React, { useState, useEffect } from 'react';
import { FaGoogle, FaApple } from 'react-icons/fa';
import { supabase } from '../services/supabaseClient';
import financeBg from '../assets/finance_bg.png';
import financeHero from '../assets/finance_hero.png';
import logoImg from '../assets/logo-2.png';

const AuthLayout = ({ children, title, subtitle, showSocial }) => {
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark-mode");
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Setelah Google auth selesai, redirect kembali ke app
          // AuthProvider.onAuthStateChange akan mendeteksi SIGNED_IN
          // dan fetch profile otomatis (termasuk email lookup untuk akun existing)
          redirectTo: window.location.origin + '/dashboard',
        },
      });

      if (error) {
        console.error("Google OAuth Error:", error);
        alert("Gagal login dengan Google: " + error.message);
      }
    } catch (err) {
      console.error("Google OAuth Error:", err);
      alert("Gagal login dengan Google. Silakan coba lagi.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${financeBg})` }}
    >
      {/* Semi-transparent overlay to make the modal pop out more if the background is too bright */}
      <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm"></div>

      <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-2xl shadow-blue-900/40 overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/50">

        {/* Left Side: Form */}
        <div className="w-full md:w-[45%] lg:w-[40%] p-8 md:p-10 flex flex-col relative bg-white">

          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-50 to-transparent opacity-60 pointer-events-none rounded-tl-[2rem]"></div>

          <div className="flex flex-col items-center mb-6 relative z-10">
            {/* Brand Block */}
            <div className="flex flex-col items-center mb-5">
              {/* Logo + Brand Name container */}
              <div className="flex flex-col items-center gap-2 group cursor-default">
                {/* Logo with subtle glow ring on hover */}
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-2xl scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full" />
                  <img
                    src={logoImg}
                    alt="Artha Logo"
                    className="h-20 sm:h-24 w-auto object-contain relative z-10 drop-shadow-[0_4px_12px_rgba(79,70,229,0.2)] transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Brand Name */}
                <span
                  className="text-[22px] leading-none font-black tracking-[0.25em] pl-[0.25em] text-slate-800 mt-1"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', 'Outfit', 'Inter', sans-serif",
                  }}
                >
                  ARTA
                </span>
              </div>

              {/* Thin accent divider */}
              <div className="mt-4 flex items-center gap-2">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-200" />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-200" />
              </div>
            </div>

            <h1 className="text-xl font-extrabold text-slate-800 text-center mb-2 tracking-tight">
              {title || "Empower Your UMKM"}
            </h1>
            <p className="text-slate-400 text-center text-sm max-w-xs font-medium leading-relaxed">
              {subtitle || "Manage your business finances smartly and reach your goals."}
            </p>
          </div>

          <div className="flex-grow flex flex-col relative z-10">
            {children}
          </div>

          {showSocial && (
            <div className="mt-8 relative z-10">
              <div className="relative flex items-center justify-center text-sm">
                <span className="bg-white px-3 text-slate-400 z-10 text-xs font-medium">or continue with</span>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold text-slate-700 text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-red-500 rounded-full animate-spin"></div>
                  ) : (
                    <FaGoogle className="text-red-500 text-base" />
                  )}
                  {googleLoading ? "Menghubungkan..." : "Google"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Image and Overlay */}
        <div className="hidden md:block w-full md:w-[55%] lg:w-[60%] relative bg-slate-100">
          <img
            src={financeHero}
            alt="UMKM Finance Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient Overlay for Text */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/40 to-transparent"></div>

          {/* Text Content */}
          <div className="absolute bottom-0 left-0 w-full p-10 lg:p-14 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">Scale Your Business Faster</h2>
            <p className="text-white/80 text-sm lg:text-base mb-8 max-w-md leading-relaxed font-medium">
              Join thousands of successful UMKM owners. Take full control of your finances, track your growth, and unlock new opportunities for your business today!
            </p>

            {/* Avatars */}
            <div className="flex items-center -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-[3px] border-blue-950 overflow-hidden bg-slate-300 shadow-lg">
                  <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt={`User ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;

