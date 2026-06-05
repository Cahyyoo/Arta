import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthProvider";
import { FiChevronRight, FiArrowLeft, FiCheck, FiSearch, FiChevronDown } from "react-icons/fi";
import { supabase } from "../services/supabaseClient";

import logoFix from "../../logo/fix-logo-2.png";
import onboardingSvg1 from "../assets/onboarding/undraw_budgeting_klon.svg";
import onboardingSvg2 from "../assets/onboarding/laporan-cerdas.svg";
import onboardingSvg3 from "../assets/onboarding/undraw_business-decisions_7vkl.svg";
import iconPengusaha from "../assets/icons/pengusaha.png";
import iconPerintis from "../assets/icons/perintis.png";

/* ───────────────────────── data ───────────────────────── */

const SLIDES = [
  {
    image: onboardingSvg1,
    title: "Catat Keuangan\nUsaha Anda",
    desc: "Kelola pemasukan dan pengeluaran bisnis Anda dengan mudah dan terorganisir setiap hari.",
    bgFrom: "#eef2ff",
    bgTo: "#e0e7ff",
    glowColor: "rgba(99,102,241,0.12)",
    badge: "Pencatatan Keuangan",
  },
  {
    image: onboardingSvg2,
    title: "Laporan Cerdas\n& Otomatis",
    desc: "Dapatkan insight keuangan melalui laporan yang dibuat otomatis dari data transaksi Anda.",
    bgFrom: "#ecfdf5",
    bgTo: "#d1fae5",
    glowColor: "rgba(16,185,129,0.12)",
    badge: "Analisis & Laporan",
  },
  {
    image: onboardingSvg3,
    title: "Kembangkan\nBisnis Anda",
    desc: "Dapatkan rekomendasi strategi dan peluang pertumbuhan yang dipersonalisasi untuk UMKM Anda.",
    bgFrom: "#faf5ff",
    bgTo: "#ede9fe",
    glowColor: "rgba(139,92,246,0.12)",
    badge: "AI & Strategi",
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
      // 1. Simpan data onboarding ke database backend
      const res = await api.post("/api/profile/onboarding", { user_type, ...extra });
      const profileData = res.data.data.profile;

      // 1.5 Daftarkan bisnis ke backend Vercel (agar tabel business terisi dan AI jalan)
      if (extra && extra.nama_usaha) {
        try {
          await fetch("/api/business", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
              name: extra.nama_usaha,
              type: extra.tipe_usaha,
              industry: extra.tipe_usaha,
              founded_year: extra.lama_usaha
            })
          });
        } catch (bizErr) {
          console.error("Peringatan: Gagal register business_id ke AI service", bizErr);
        }
      }

      // 2. Set Auth Metadata Supabase secara diam-diam (Silent Auth Update)
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-3 md:p-6 lg:p-8 relative overflow-hidden">
      <div className="w-full max-w-[1100px] min-h-[640px] bg-white rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row shadow-[0_25px_80px_-20px_rgba(0,0,0,0.25)] border border-slate-200/60 relative z-10">

        {/* ────────── LEFT PANEL ────────── */}
        <div className="w-full lg:w-[45%] relative overflow-hidden flex items-center justify-center bg-white lg:border-r border-slate-200/60">
          {phase === "intro" && (
            <div
              className="absolute inset-0 transition-all duration-700 ease-in-out"
              style={{
                background: `linear-gradient(135deg, ${currentSlide.bgFrom}, ${currentSlide.bgTo})`,
              }}
            >
              <div
                className="absolute inset-0 transition-opacity duration-700"
                style={{
                  background: `radial-gradient(circle at 50% 80%, ${currentSlide.glowColor}, transparent 70%)`,
                }}
              />
            </div>
          )}

          {phase !== "detail" ? (
            <>
              <img
                key={`img-${slideIndex}`}
                src={currentSlide.image}
                alt="Onboarding"
                className="relative z-10 w-full h-full object-contain p-8 md:p-10 lg:p-12 slide-img [filter:drop-shadow(0_4px_6px_rgba(0,0,0,0.05))]"
                draggable={false}
              />
            </>
          ) : (
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-10 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBhMTAgMTAgMCAwIDEgMTAgMTAgMTAgMTAgMCAwIDEtMTAgMTAgMTAgMTAgMCAwIDEtMTAtMTAgMTAgMTAgMCAwIDEgMTAtMTB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')] opacity-50" />

              <div className="flex flex-col items-center text-center mt-4 relative z-10">
                <img
                  src={logoFix}
                  alt="Arta Logo"
                  className="w-20 h-20 object-contain mb-5 drop-shadow-xl animate-fade-in"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    e.target.insertAdjacentHTML(
                      "afterend",
                      '<div class="w-16 h-16 bg-indigo-500 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20"><span class="text-white font-bold text-2xl">A</span></div>'
                    );
                  }}
                />
                <h2 className="text-white text-2xl font-bold mb-2 tracking-tight">
                  Arta
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed max-w-[240px] mx-auto">
                  Platform keuangan cerdas untuk UMKM Indonesia
                </p>
              </div>

              <div className="w-full max-w-[240px] bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-xl mt-10 relative z-20">
                <p className="text-slate-500 text-[9px] font-bold tracking-widest uppercase mb-1">
                  Omzet Bulan Ini
                </p>
                <h3 className="text-white text-xl font-bold mb-1">
                  Rp 12,4Jt
                </h3>
                <p className="text-emerald-400 text-[11px] font-medium mb-4">
                  +18% bulan ini
                </p>
                <svg viewBox="0 0 100 36" className="w-full h-10 overflow-visible">
                  <defs>
                    <linearGradient id="chart-fade-detail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points="0,36 0,26 20,22 40,30 60,12 80,18 100,4 100,36" fill="url(#chart-fade-detail)" />
                  <polyline points="0,26 20,22 40,30 60,12 80,18 100,4" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                  <circle cx="100" cy="4" r="3" fill="#6366f1" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* ────────── RIGHT PANEL ────────── */}
        <div className="w-full lg:w-[55%] flex flex-col p-8 md:p-10 lg:p-14 overflow-y-auto custom-scrollbar relative z-10 bg-white">
          {/* Phase: INTRO */}
           {phase === "intro" && (
             <div className="animate-fade-in flex flex-col h-full justify-between py-8 md:py-12">
               <div className="flex-1 flex flex-col justify-center text-left">
                 <h2
                   className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-4 whitespace-pre-line slide-text"
                   key={`t-${slideIndex}`}
                 >
                   {currentSlide.title}
                 </h2>
                 <p
                   className="text-base lg:text-lg text-slate-500 leading-relaxed mb-10 slide-text"
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
                           ? `w-10 h-2.5 bg-indigo-600 shadow-sm shadow-indigo-200`
                           : "w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300"
                         }`}
                     />
                   ))}
                 </div>
               </div>
 
               <div className="flex items-center justify-between w-full pt-8 md:pt-12">
                 <button
                   onClick={handleSkip}
                   className={`text-sm font-bold tracking-widest text-slate-400 hover:text-slate-700 transition-colors py-3 pr-6 ${isLastSlide ? "opacity-0 pointer-events-none" : ""}`}
                 >
                   LEWATI
                 </button>
                 <button
                   onClick={isLastSlide ? handleStart : goNext}
                   className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm tracking-wide px-8 py-3.5 rounded-xl transition-all active:scale-[0.97] shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2"
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
              <div className="mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
                  Ceritakan Tentang Anda
                </h2>
                <p className="text-slate-500 leading-relaxed">
                  Pilih yang paling menggambarkan Anda saat ini.
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-3 mb-8">
                <button
                  onClick={() => handleSelectType("umkm_aktif")}
                  className={`w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl border transition-all text-left ${
                    selectedType === "umkm_aktif"
                      ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100"
                      : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${selectedType === "umkm_aktif" ? "bg-indigo-600" : "bg-slate-100"}`}
                  >
                    <img
                      src={iconPengusaha}
                      alt="Pengusaha"
                      className={`w-6 h-6 object-contain ${selectedType !== "umkm_aktif" && "opacity-60"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold mb-0.5 ${selectedType === "umkm_aktif" ? "text-indigo-900" : "text-slate-800"}`}>
                      Saya Sudah Punya Usaha
                    </h3>
                    <p className="text-xs text-slate-500">
                      Kelola keuangan usaha yang sudah berjalan
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedType === "umkm_aktif" ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}
                  >
                    {selectedType === "umkm_aktif" && (
                      <FiCheck size={12} className="text-white" strokeWidth={4} />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleSelectType("calon_pengusaha")}
                  className={`w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl border transition-all text-left ${
                    selectedType === "calon_pengusaha"
                      ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100"
                      : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${selectedType === "calon_pengusaha" ? "bg-indigo-600" : "bg-slate-100"}`}
                  >
                    <img
                      src={iconPerintis}
                      alt="Perintis"
                      className={`w-6 h-6 object-contain ${selectedType !== "calon_pengusaha" && "opacity-60"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold mb-0.5 ${selectedType === "calon_pengusaha" ? "text-indigo-900" : "text-slate-800"}`}>
                      Saya Baru Merintis
                    </h3>
                    <p className="text-xs text-slate-500">
                      Belajar keuangan & cari peluang bisnis baru
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedType === "calon_pengusaha" ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}
                  >
                    {selectedType === "calon_pengusaha" && (
                      <FiCheck size={12} className="text-white" strokeWidth={4} />
                    )}
                  </div>
                </button>
              </div>

              <button
                onClick={handleContinueType}
                disabled={loading || !selectedType}
                className={`w-full font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 text-sm mt-auto ${
                  selectedType
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
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
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors self-start mb-6"
              >
                <FiArrowLeft size={14} /> KEMBALI
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-1.5 bg-indigo-600 rounded-full"></div>
                <span className="text-[10px] font-bold tracking-[0.15em] text-indigo-600 uppercase">
                  Langkah 2 dari 2 — Profil Usaha
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Detail Usaha
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Lengkapi profil agar kami bisa menyiapkan dashboard terbaik untuk Anda.
                </p>
              </div>

              {error && (
                <div className="mb-5 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm animate-shake">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitDetail} className="space-y-5 flex-1">
                {/* Nama Usaha */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                    Nama Usaha / Toko
                  </label>
                  <input
                    type="text"
                    name="nama_usaha"
                    value={formData.nama_usaha}
                    onChange={handleInputChange}
                    placeholder="Contoh: Kedai Kopi Senja"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Kategori Usaha */}
                <div className="space-y-2 relative" ref={dropdownRef}>
                  <label className="block text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                    Kategori Usaha
                  </label>
                  <div
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
                    onClick={() => setIsDropdownOpen(true)}
                  >
                    {isDropdownOpen ? (
                      <div className="flex items-center gap-3 w-full">
                        <FiSearch className="text-slate-400 shrink-0" size={16} />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Cari kategori..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-transparent border-none outline-none w-full text-sm text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-sm ${formData.tipe_usaha ? "text-slate-900" : "text-slate-400"}`}
                        >
                          {formData.tipe_usaha || "Pilih Kategori Usaha"}
                        </span>
                        <FiChevronDown className="text-slate-400" size={16} />
                      </div>
                    )}
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 shadow-xl rounded-xl max-h-56 overflow-y-auto custom-scrollbar p-1.5">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className="w-full text-left px-4 py-3 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-between"
                          >
                            {cat}
                            {formData.tipe_usaha === cat && (
                              <FiCheck className="text-indigo-600" size={16} />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-sm text-slate-400 text-center">
                          Kategori tidak ditemukan
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Lama Usaha Berjalan */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                    Lama Usaha Berjalan
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {["< 1 Tahun", "1 - 3 Tahun", "> 3 Tahun"].map(
                      (duration) => (
                        <button
                          key={duration}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, lama_usaha: duration });
                            setError("");
                          }}
                          className={`px-5 py-2.5 rounded-xl border transition-all text-sm font-medium ${
                            formData.lama_usaha === duration
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                          }`}
                        >
                          {duration}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !isFormComplete}
                    className={`w-full py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 text-sm font-bold tracking-wide ${
                      isFormComplete
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                        : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        MEMPROSES...
                      </span>
                    ) : (
                      <>
                        SELESAI & MULAI →
                      </>
                    )}
                  </button>
                </div>
              </form>

              <p className="text-center text-slate-400 text-xs mt-5">
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
        .slide-img { animation: slideImgIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .slide-text { animation: slideTextIn 0.5s ease-out forwards; }
        
        @keyframes slideImgIn {
          from { opacity: 0.6; filter: blur(4px); transform: scale(1.08); }
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
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>
    </div>
  );
};

export default Onboarding;
