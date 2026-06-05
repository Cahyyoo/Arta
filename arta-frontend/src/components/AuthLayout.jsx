import React, { useState, useEffect } from 'react';
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
                    alt="Arta Logo"
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

              <div className="mt-5">
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-[#dadce0] rounded-xl hover:bg-[#f8f9fa] hover:border-[#c6c9cc] transition-all font-medium text-[#3c4043] text-sm shadow-sm active:scale-[0.98] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-[#dadce0] border-t-[#4285F4] rounded-full animate-spin"></div>
                  ) : (
                    <svg viewBox="0 0 48 48" className="w-5 h-5 flex-shrink-0">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.59l7.97-6z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  )}
                  <span className="tracking-normal">Sign in with Google</span>
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
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;

