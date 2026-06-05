import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthProvider";
import {
  FiChevronRight,
  FiArrowLeft,
  FiCheck,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";
import { supabase } from "../services/supabaseClient";

// Pastikan path image ini sesuai dengan struktur foldermu
import logoFix from "../../logo/fix-logo-2.png";
import onboarding1 from "../assets/onboarding-1.png";
import onboarding2 from "../assets/onboarding-2.png";
import onboarding3 from "../assets/onboarding-3.png";
import iconPengusaha from "../assets/icons/pengusaha.png";
import iconPerintis from "../assets/icons/perintis.png";

/* ───────────────────────── data ───────────────────────── */

const SLIDES = [
  {
    image: onboarding1,
    title: "Catat Keuangan\nUsaha Anda",
    desc: "Kelola pemasukan dan pengeluaran bisnis Anda dengan mudah dan terorganisir setiap hari.",
  },
  {
    image: onboarding2,
    title: "Laporan Cerdas\n& Otomatis",
    desc: "Dapatkan insight keuangan melalui laporan yang dibuat otomatis dari data transaksi Anda.",
  },
  {
    image: onboarding3,
    title: "Kembangkan\nBisnis Anda",
    desc: "Dapatkan rekomendasi strategi dan peluang pertumbuhan yang dipersonalisasi untuk UMKM Anda.",
  },
];

const BUSINESS_CATEGORIES = [
  "Makanan & Minuman (F&B)",
  "Ritel & Kelontong",
  "Jasa & Servis Profesional",
  "Pakaian & Fashion",
  "Elektronik & Gadget",
  "Kesehatan & Kecantikan",
  "Otomotif",
  "Kesenian & Hiburan",
  "Pertanian & Agribisnis",
  "Pendidikan & Pelatihan",
  "Teknologi & IT",
  "Properti & Real Estate",
  "Lainnya",
];

/* ───────────────────────── component ───────────────────────── */

const Onboarding = () => {
  const navigate = useNavigate();
  const { setProfile } = useAuth();

  // phase: "intro" | "choose" | "detail"
  const [phase, setPhase] = useState("intro");
  const [slideIndex, setSlideIndex] = useState(0);

  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    nama_usaha: "",
    tipe_usaha: "",
    lama_usaha: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Searchable Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = BUSINESS_CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /* ── slide navigation ── */
  const goNext = useCallback(() => {
    if (slideIndex < SLIDES.length - 1) {
      setSlideIndex((i) => i + 1);
    }
  }, [slideIndex]);

  const goPrev = useCallback(() => {
    if (slideIndex > 0) {
      setSlideIndex((i) => i - 1);
    }
  }, [slideIndex]);

  const handleSkip = () => setPhase("choose");
  const handleStart = () => setPhase("choose");

  /* ── keyboard support ── */
  useEffect(() => {
    if (phase !== "intro") return;
    const handler = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, goNext, goPrev]);

  /* ── business logic ── */
  const handleSelectType = (type) => {
    setSelectedType(type);
    setError("");
  };

  const handleContinueType = () => {
    if (!selectedType) {
      setError("Pilih salah satu untuk melanjutkan.");
      return;
    }
    if (selectedType === "calon_pengusaha") {
      submitOnboarding("calon_pengusaha", {});
    } else {
      setPhase("detail");
      setError("");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const setCategory = (cat) => {
    setFormData({ ...formData, tipe_usaha: cat });
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const isFormComplete =
    formData.nama_usaha.trim() !== "" &&
    formData.tipe_usaha !== "" &&
    formData.lama_usaha !== "";

  const handleSubmitDetail = (e) => {
    e.preventDefault();
    if (!isFormComplete) return;
    submitOnboarding("umkm_aktif", formData);
  };

  const submitOnboarding = async (user_type, extra) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/profile/onboarding", {
        user_type,
        ...extra,
      });
      const profileData = res.data.data.profile;

      const { error: supabaseError } = await supabase.auth.updateUser({
        data: {
          role: "OWNER",
          user_type: user_type,
        },
      });

      if (supabaseError) {
        console.error(
          "Peringatan: Gagal set role Supabase:",
          supabaseError.message,
        );
      }

      const storedUserStr = localStorage.getItem("user");
      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          storedUser.user_metadata = {
            ...storedUser.user_metadata,
            role: "OWNER",
            user_type: user_type,
          };
          localStorage.setItem("user", JSON.stringify(storedUser));
        } catch (e) {
          console.error("Gagal parsing local storage user", e);
        }
      }

      localStorage.setItem("profile", JSON.stringify(profileData));
      setProfile(profileData);

      navigate(
        user_type === "calon_pengusaha"
          ? "/dashboard/recommendations"
          : "/dashboard",
        { replace: true },
      );
    } catch (err) {
      setError(err.response?.data?.message || "Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  const isLastSlide = slideIndex === SLIDES.length - 1;
  const currentSlide = SLIDES[slideIndex];

  /* ═══════════════════════ RENDER ═══════════════════════ */

  return (
    // 1. Background luar diubah menjadi terang (#F5F7FA) dengan posisi relative untuk ornamen
    <div className="min-h-screen w-full bg-[#F5F7FA] flex items-center justify-center p-4 lg:p-8 font-sans text-white relative overflow-hidden">
      {/* 2. Ornamen Background Terang (Glow pastel tipis di belakang card) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] bg-indigo-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[50%] bg-orange-200/30 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Container Card - Shadow disesuaikan untuk background terang */}
      <div className="w-full max-w-[1050px] min-h-[650px] bg-[#1a1a1a] rounded-[2rem] overflow-hidden flex flex-col lg:flex-row shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-800 relative z-10">
        {/* ────────── LEFT PANEL: FULL COVER IMAGE ────────── */}
        <div className="w-full lg:w-[45%] relative bg-[#111111] overflow-hidden">
          {phase !== "detail" ? (
            /* Intro / Choose Phase: Menampilkan gambar slide secara Full Cover */
            <>
              <img
                key={`img-${slideIndex}`}
                src={currentSlide.image}
                alt="Onboarding"
                className="absolute inset-0 w-full h-full object-cover slide-img z-10"
                draggable={false}
              />
            </>
          ) : (
            /* Detail Phase: Menampilkan Branding Statis (Seperti Screenshot) */
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-10 bg-[#111111]">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#D99A29]/20 rounded-full blur-[90px] pointer-events-none"></div>

              <div className="flex flex-col items-center text-center mt-4">
                <img
                  src={logoFix}
                  alt="Arta Logo"
                  className="w-24 h-24 object-contain mb-6 drop-shadow-xl animate-fade-in"
                  onError={(e) => {
                    // Fallback jika logoFix tidak ditemukan
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    e.target.insertAdjacentHTML(
                      "afterend",
                      '<div class="w-20 h-20 bg-[#D99A29] rounded-[1.25rem] flex items-center justify-center mb-6 shadow-lg shadow-[#D99A29]/20"><span class="text-white font-serif text-3xl font-bold tracking-tight">AB</span></div>',
                    );
                  }}
                />
                <h2 className="text-white text-[28px] font-bold mb-3 tracking-tight">
                  Arta
                </h2>
                <p className="text-[#888888] text-sm leading-relaxed max-w-[260px] mx-auto">
                  Arta hadir untuk membantu pelaku UMKM. Dari pencatatan
                  transaksi hingga prediksi arus kas, semua dalam satu platform
                  cerdas yang dirancang khusus untuk wirausaha muda Indonesia.
                </p>
              </div>

              {/* Mockup Card Widget */}
              <div className="w-full max-w-[260px] bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 shadow-2xl mt-12 relative z-20">
                <p className="text-[#666666] text-[10px] font-bold tracking-widest uppercase mb-1">
                  Omzet Bulan Ini
                </p>
                <h3 className="text-white text-2xl font-bold mb-1">
                  Rp 12,4Jt
                </h3>
                <p className="text-emerald-400 text-xs font-medium mb-5">
                  +18% bulan ini
                </p>
                <svg
                  viewBox="0 0 100 40"
                  className="w-full h-12 overflow-visible"
                >
                  <defs>
                    <linearGradient id="chart-fade" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#D99A29"
                        stopOpacity="0.25"
                      />
                      <stop offset="100%" stopColor="#D99A29" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="0,40 0,30 20,25 40,35 60,15 80,20 100,5 100,40"
                    fill="url(#chart-fade)"
                  />
                  <polyline
                    points="0,30 20,25 40,35 60,15 80,20 100,5"
                    fill="none"
                    stroke="#D99A29"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="5" r="3.5" fill="#D99A29" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* ────────── RIGHT PANEL: CONTENT & FORM ────────── */}
        <div className="w-full lg:w-[55%] flex flex-col p-8 lg:p-14 overflow-y-auto custom-scrollbar relative z-10 bg-[#1a1a1a]">
          {/* Phase: INTRO */}
           {phase === "intro" && (
             <div className="animate-fade-in flex flex-col h-full justify-between py-12">
               <div className="flex-1 flex flex-col justify-center text-left">
                 <h2
                   className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4 whitespace-pre-line slide-text"
                   key={`t-${slideIndex}`}
                 >
                   {currentSlide.title}
                 </h2>
                 <p
                   className="text-base lg:text-lg text-[#888888] leading-relaxed mb-10 slide-text"
                   key={`d-${slideIndex}`}
                 >
                   {currentSlide.desc}
                 </p>
 
                 <div className="flex items-center gap-3 mb-12">
                   {SLIDES.map((_, i) => (
                     <button
                       key={i}
                       onClick={() => setSlideIndex(i)}
                       className={`rounded-full transition-all duration-300 ease-in-out ${
                         i === slideIndex
                           ? `w-10 h-2.5 bg-[#D99A29]`
                           : "w-2.5 h-2.5 bg-[#333333] hover:bg-[#555555]"
                         }`}
                     />
                   ))}
                 </div>
               </div>
 
               <div className="flex items-center justify-between w-full pt-12">
                 <button
                   onClick={handleSkip}
                   className={`text-sm font-bold tracking-widest text-[#666666] hover:text-white transition-colors py-3 pr-6 ${isLastSlide ? "opacity-0 pointer-events-none" : ""}`}
                 >
                   LEWATI
                 </button>
                 <button
                   onClick={isLastSlide ? handleStart : goNext}
                   className="bg-[#D99A29] hover:bg-[#c48924] text-[#111] font-bold text-sm tracking-wider px-8 py-3.5 rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                 >
                   {isLastSlide ? "MULAI SEKARANG" : "LANJUT"}
                   {!isLastSlide && <FiChevronRight size={18} />}
                 </button>
               </div>
             </div>
           )}

          {/* Phase: CHOOSE TYPE */}
          {phase === "choose" && (
            <div className="animate-fade-in flex flex-col h-full justify-center">
              <div className="mb-10">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                  Ceritakan Tentang Anda
                </h2>
                <p className="text-[#888888] leading-relaxed">
                  Pilih yang paling menggambarkan Anda saat ini.
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-500/10 text-red-400 px-4 py-3 rounded-xl border border-red-500/20 text-sm animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-10">
                <button
                  onClick={() => handleSelectType("umkm_aktif")}
                  className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-all text-left ${
                    selectedType === "umkm_aktif"
                      ? "border-[#D99A29] bg-[#D99A29]/10"
                      : "border-[#333333] hover:border-[#555555] bg-[#111111]"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedType === "umkm_aktif" ? "bg-[#D99A29]" : "bg-[#222222]"}`}
                  >
                    <img
                      src={iconPengusaha}
                      alt="Pengusaha"
                      className={`w-7 h-7 object-contain ${selectedType !== "umkm_aktif" && "opacity-50 grayscale"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold mb-1">
                      Saya Sudah Punya Usaha
                    </h3>
                    <p className="text-xs text-[#888888]">
                      Kelola keuangan usaha yang sudah berjalan
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedType === "umkm_aktif" ? "border-[#D99A29] bg-[#D99A29]" : "border-[#444444]"}`}
                  >
                    {selectedType === "umkm_aktif" && (
                      <FiCheck
                        size={14}
                        className="text-[#111]"
                        strokeWidth={4}
                      />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleSelectType("calon_pengusaha")}
                  className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-all text-left ${
                    selectedType === "calon_pengusaha"
                      ? "border-[#D99A29] bg-[#D99A29]/10"
                      : "border-[#333333] hover:border-[#555555] bg-[#111111]"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedType === "calon_pengusaha" ? "bg-[#D99A29]" : "bg-[#222222]"}`}
                  >
                    <img
                      src={iconPerintis}
                      alt="Perintis"
                      className={`w-7 h-7 object-contain ${selectedType !== "calon_pengusaha" && "opacity-50 grayscale"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold mb-1">
                      Saya Baru Merintis
                    </h3>
                    <p className="text-xs text-[#888888]">
                      Belajar keuangan & cari peluang bisnis baru
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedType === "calon_pengusaha" ? "border-[#D99A29] bg-[#D99A29]" : "border-[#444444]"}`}
                  >
                    {selectedType === "calon_pengusaha" && (
                      <FiCheck
                        size={14}
                        className="text-[#111]"
                        strokeWidth={4}
                      />
                    )}
                  </div>
                </button>
              </div>

              <button
                onClick={handleContinueType}
                disabled={loading || !selectedType}
                className={`w-full font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 text-sm mt-auto ${
                  selectedType
                    ? "bg-[#D99A29] hover:bg-[#c48924] text-[#111]"
                    : "bg-[#222222] text-[#555555] cursor-not-allowed border border-[#333333]"
                }`}
              >
                {loading ? "MEMPROSES..." : "LANJUTKAN"}
              </button>
            </div>
          )}

          {/* Phase: BUSINESS DETAIL */}
          {phase === "detail" && (
            <div className="animate-fade-in flex flex-col h-full">
              <button
                onClick={() => {
                  setPhase("choose");
                  setError("");
                }}
                className="px-4 py-2 rounded-xl border border-[#333333] text-xs font-bold text-[#888888] hover:text-white hover:bg-[#222222] flex items-center gap-2 transition-colors self-start mb-8"
              >
                <FiArrowLeft size={14} /> KEMBALI
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-1.5 bg-[#D99A29] rounded-full"></div>
                <span className="text-[10px] font-bold tracking-[0.15em] text-[#D99A29] uppercase">
                  Langkah 2 dari 2 - Profil Usaha
                </span>
              </div>

              <div className="mb-8">
                <h2 className="text-[32px] font-bold text-white mb-3">
                  Detail Usaha
                </h2>
                <p className="text-sm text-[#888888] leading-relaxed">
                  Lengkapi profil agar kami bisa menyiapkan dashboard
                  <br />
                  terbaik untuk Anda.
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-500/10 text-red-400 px-4 py-3 rounded-xl border border-red-500/20 text-sm animate-shake">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitDetail} className="space-y-6 flex-1">
                {/* Nama Usaha */}
                <div className="space-y-2.5">
                  <label className="block text-[11px] font-bold tracking-widest text-[#888888] uppercase">
                    Nama Usaha / Toko
                  </label>
                  <input
                    type="text"
                    name="nama_usaha"
                    value={formData.nama_usaha}
                    onChange={handleInputChange}
                    placeholder="Contoh: Kedai Kopi Senja"
                    className="w-full px-5 py-3.5 bg-[#111111] border border-[#333333] rounded-xl focus:border-[#D99A29] focus:ring-1 focus:ring-[#D99A29] outline-none transition-all text-sm text-white placeholder:text-[#555555]"
                    required
                  />
                </div>

                {/* Kategori Usaha */}
                <div className="space-y-2.5 relative" ref={dropdownRef}>
                  <label className="block text-[11px] font-bold tracking-widest text-[#888888] uppercase">
                    Kategori Usaha
                  </label>
                  <div
                    className="w-full px-5 py-3.5 bg-[#111111] border border-[#333333] rounded-xl flex items-center justify-between cursor-pointer focus-within:border-[#D99A29] focus-within:ring-1 focus-within:ring-[#D99A29] transition-all"
                    onClick={() => setIsDropdownOpen(true)}
                  >
                    {isDropdownOpen ? (
                      <div className="flex items-center gap-3 w-full">
                        <FiSearch className="text-[#555555] flex-shrink-0" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Cari kategori..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-transparent border-none outline-none w-full text-sm text-white placeholder:text-[#555555]"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-sm ${formData.tipe_usaha ? "text-white" : "text-[#555555]"}`}
                        >
                          {formData.tipe_usaha || "Pilih Kategori Usaha"}
                        </span>
                        <FiChevronDown className="text-[#888888]" />
                      </div>
                    )}
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-[#333333] shadow-2xl rounded-xl max-h-56 overflow-y-auto custom-scrollbar p-1.5">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className="w-full text-left px-4 py-3 rounded-lg text-sm text-[#CCCCCC] hover:bg-[#222222] hover:text-white transition-colors flex items-center justify-between"
                          >
                            {cat}
                            {formData.tipe_usaha === cat && (
                              <FiCheck className="text-[#D99A29]" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-sm text-[#555555] text-center">
                          Kategori tidak ditemukan
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Lama Usaha Berjalan */}
                <div className="space-y-2.5">
                  <label className="block text-[11px] font-bold tracking-widest text-[#888888] uppercase">
                    Lama Usaha Berjalan
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["< 1 Tahun", "1 - 3 Tahun", "> 3 Tahun"].map(
                      (duration) => (
                        <button
                          key={duration}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, lama_usaha: duration });
                            setError("");
                          }}
                          className={`px-6 py-3 rounded-xl border transition-all text-sm font-medium ${
                            formData.lama_usaha === duration
                              ? "border-[#D99A29] bg-[#D99A29]/10 text-[#D99A29]"
                              : "border-[#333333] bg-[#111111] text-[#888888] hover:border-[#555555] hover:text-white"
                          }`}
                        >
                          {duration}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading || !isFormComplete}
                    className={`w-full py-4 rounded-xl border transition-all flex justify-center items-center gap-2 text-sm font-bold tracking-wider ${
                      isFormComplete
                        ? "bg-[#222222] border-[#444444] text-white hover:bg-[#333333]"
                        : "bg-[#111111] border-[#222222] text-[#444444] cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        MEMPROSES...
                      </span>
                    ) : (
                      <>
                        SELESAI & MULAI <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <p className="text-center text-[#555555] text-xs mt-6">
                Informasi ini bisa diubah kapan saja di pengaturan akun.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ────────── Animations & Custom CSS ────────── */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-img { animation: slideImgIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .slide-text { animation: slideTextIn 0.5s ease-out forwards; }
        
        @keyframes slideImgIn {
          from { opacity: 0.5; filter: blur(5px); transform: scale(1.05); }
          to   { opacity: 1; filter: blur(0); transform: scale(1); }
        }
        @keyframes slideTextIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        
        /* Dark Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>
    </div>
  );
};

export default Onboarding;
