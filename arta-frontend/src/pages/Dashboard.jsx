import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import transactionService from "../services/transactionService";
import { computeDailyCashflow, normalizeTransactions, filterTransactionsByRange } from "../utils/cashflowHelper";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiArrowUpRight,
  FiArrowDownRight,
  FiPieChart,
  FiActivity,
  FiArrowRight,
  FiCheckCircle,
  FiUserCheck,
  FiBarChart2,
  FiX,
  FiUser,
  FiMapPin,
  FiPhone,
  FiFileText,
  FiPlus,
  FiMinus,
  FiChevronDown,
  FiCalendar,
  FiClock,
  FiSearch,
  FiFilter,
  FiDownload,
  FiCircle,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

// Data fetch dari API Backend Arta

const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState("");
  const { t } = useTranslation();

  const [filterWaktu, setFilterWaktu] = useState("bulan_ini");

  const rangeLabels = {
    "7_hari": t("dashboard.filter_7_hari"),
    "bulan_ini": t("dashboard.filter_bulan_ini"),
    "bulan_lalu": t("dashboard.filter_bulan_lalu"),
    "tahun_ini": t("dashboard.filter_tahun_ini"),
    "tahun_lalu": t("dashboard.filter_tahun_lalu"),
  };

  // Data dari API
  const [dashboardData, setDashboardData] = useState(null);
  const [apiError, setApiError] = useState(null);

  const [cashFlowChartData, setCashFlowChartData] = useState([]);
  // Fitur Tabel Data Transaksi Dashboard
  const [searchTerm, setSearchTerm] = useState("");
  // Fitur Manajemen Akun (Owner only)
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [filterType, setFilterType] = useState("Semua");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    if (storedUser) setUser(parsedUser);

    const storedProfile = localStorage.getItem("profile");
    const prof = storedProfile ? JSON.parse(storedProfile) : null;
    if (prof) setProfile(prof);

    // Cek flag popup setelah klik "Mulai Rencana Bisnis"
    const shouldPrompt = localStorage.getItem("show_profile_prompt");
    const bizName = localStorage.getItem("new_business_name") || "bisnis Anda";
    if (shouldPrompt === "true") {
      setNewBusinessName(bizName);
      // Delay sedikit agar page sudah render dulu
      setTimeout(() => setShowProfilePrompt(true), 500);
      localStorage.removeItem("show_profile_prompt");
      localStorage.removeItem("new_business_name");
    }

    const roleFromUser = parsedUser?.user_metadata?.role || "";
    const isEmp = ["ADMIN", "STAFF", "USER"].includes(String(prof?.role || roleFromUser || "").toUpperCase());

    const rangeMap = {
      "7_hari": "last_7_days",
      "bulan_ini": "this_month",
      "bulan_lalu": "last_month",
      "tahun_ini": "this_year",
      "tahun_lalu": "last_year",
    };

    if (prof?.user_type === "umkm_aktif" || isEmp) {
      setLoading(true);

      api
        .get(`/api/dashboard/overview?range=${rangeMap[filterWaktu] || filterWaktu}`)
            .then((res) => {
              setDashboardData(res.data.data || res.data);
              setApiError(null);
            })
        .catch((err) => {
          console.error("Gagal mengambil data dashboard:", err);
          const errorMsg = err.response?.data?.message || "Gagal mengambil data. Server mungkin sedang offline.";
          setApiError(errorMsg);

          // Auto-sync business_id untuk yang belum memiliki entitas bisnis
          const isBusinessError = errorMsg.toLowerCase().includes("entitas bisnis") || errorMsg.toLowerCase().includes("business");
          if (isBusinessError) {
            api.post("/api/profile/sync-business")
              .then((syncRes) => {
                const syncData = syncRes.data;
                if (syncData.data?.profile) {
                  localStorage.setItem("profile", JSON.stringify(syncData.data.profile));
                }
                // Coba muat ulang data dashboard setelah sync berhasil
                return api.get(`/api/dashboard/overview?range=${rangeMap[filterWaktu] || filterWaktu}`);
              })
              .then((retryRes) => {
                setDashboardData(retryRes.data.data || retryRes.data);
                setApiError(null);
              })
              .catch((syncErr) => {
                console.warn("Auto-sync business_id gagal, manual sync tersedia:", syncErr);
              });
          }
        });

      transactionService.getTransactions()
        .then((res) => {
          const txList = normalizeTransactions(res.data);
          const filtered = filterTransactionsByRange(txList, filterWaktu);
          const daily = computeDailyCashflow(filtered);
          const chartData = daily.map((d) => ({
            date: d.date,
            Pemasukan: d.income,
            Pengeluaran: d.expense,
          }));
          setCashFlowChartData(chartData);
        })
        .catch(() => {
          // fallback: empty chart
        })
        .finally(() => {
          setLoading(false);
        });

    } else {
      setLoading(false);
    }
  }, [filterWaktu]);

  // Fetch daftar akun untuk Owner — reaktif terhadap perubahan profile
  const fetchUsers = () => {
    const role = String(profile?.role || user?.user_metadata?.role || "").toUpperCase();
    if (role !== "OWNER") {
      setUsersList([]);
      setUsersError("");
      return;
    }
    setLoadingUsers(true);
    setUsersError("");
    api.get("/api/users")
      .then((res) => {
        let raw = res.data?.data || res.data || [];
        if (!Array.isArray(raw)) {
          console.warn("[Manajemen Akun] Response bukan array:", raw);
          if (raw && typeof raw === "object") {
            for (const key of ["users", "accounts", "members", "list"]) {
              if (Array.isArray(raw[key])) { raw = raw[key]; break; }
            }
          }
        }
        const users = (Array.isArray(raw) ? raw : []).map((u) => ({
          ...u,
          display_name: u.name || u.user_metadata?.name || u.raw_user_meta_data?.name || u.full_name || "Unknown",
          display_role: (u.role || u.user_metadata?.role || u.raw_user_meta_data?.role || "USER").toUpperCase(),
        }));
        setUsersList(users);
      })
      .catch((err) => {
        console.error("[Manajemen Akun] Gagal fetch:", err);
        setUsersList([]);
        setUsersError(err.response?.data?.message || err.message || "Gagal memuat data.");
      })
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [profile, user]);

  const handleDismissPrompt = () => setShowProfilePrompt(false);
  const handleGoToProfile = () => {
    setShowProfilePrompt(false);
    navigate("/dashboard/settings?tab=profile");
  };

  const filteredTransactions = (dashboardData?.recent_transactions || []).filter(tx => {
    const matchSearch = (tx.description || tx.desc || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "Semua" || (tx.type || "").toLowerCase() === filterType.toLowerCase();
    return matchSearch && matchType;
  });

  const handleExportCSV = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }
    const headers = ["Tanggal", "Deskripsi", "Kategori", "Tipe", "Nominal"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(trx => [
        trx.date,
        `"${trx.description || trx.desc}"`,
        trx.category,
        trx.type,
        trx.amount
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Transaksi_Dashboard_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">
        Memuat...
      </div>
    );
  }

  const currentUserRole = profile?.role || user?.user_metadata?.role || "USER";
  const isEmployee = ["ADMIN", "STAFF", "USER"].includes(String(currentUserRole).toUpperCase());
  const userType = isEmployee ? "umkm_aktif" : profile?.user_type;

  const firstName = (
    profile?.nama_lengkap ||
    user?.user_metadata?.nama_lengkap ||
    "Pengguna"
  ).split(" ")[0];

  // ─────────────────────────────────────────────
  // TAMPILAN: PROFIL BELUM LENGKAP
  // ─────────────────────────────────────────────
  if (!userType && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
          <FiUser size={28} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Lengkapi Profil Anda
        </h2>
        <p className="text-slate-500 max-w-md">
          Silakan lengkapi profil bisnis Anda untuk mengakses dashboard.
        </p>
        <button
          onClick={() => navigate("/onboarding")}
          className="px-6 py-3 bg-[#111111] text-white rounded-xl font-bold text-sm tracking-widest hover:bg-black transition-all"
        >
          Mulai Onboarding
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // MODAL: LENGKAPI PROFIL USAHA (Premium & Minimal)
  // ─────────────────────────────────────────────
  const ProfilePromptModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={handleDismissPrompt}
      />
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-[90vw] sm:max-w-md w-full overflow-hidden"
        style={{
          animation: "modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        <div className="p-6 sm:p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50/50">
            <FiCheckCircle size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mb-3">
            {t("dashboard.first_step_success")}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
            Ide bisnis{" "}
            <span className="font-semibold text-slate-900">
              "{newBusinessName}"
            </span>{" "}
            berhasil disimpan. Lengkapi profil usaha Anda agar fitur AI dapat
            memberikan rekomendasi yang optimal.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoToProfile}
              className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-semibold py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md text-sm"
            >
              {t("dashboard.complete_profile_now")}
              <FiArrowRight size={18} />
            </button>
            <button
              onClick={handleDismissPrompt}
              className="w-full text-slate-500 hover:text-slate-800 font-semibold py-3 sm:py-3.5 text-sm transition-colors rounded-xl hover:bg-slate-50"
            >
              {t("dashboard.maybe_later")}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.95) translateY(15px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );

  // ─────────────────────────────────────────────
  // TAMPILAN: CALON PENGUSAHA (PERINTIS)
  // ─────────────────────────────────────────────
  if (userType === "calon_pengusaha") {
    return (
      <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-fade-in px-4">
        {/* HERO SECTION */}
        <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-8 md:p-16 shadow-sm border border-slate-100">
          {/* Subtle Decorative Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
                <Trans
                  i18nKey="dashboard.welcome_new"
                  values={{ name: firstName }}
                >
                  Halo, {{ name: firstName }}! <br />
                  Siap Memulai Bisnismu?
                </Trans>
              </h1>
              <p className="text-slate-500 text-lg font-medium max-w-xl leading-relaxed mb-10 mx-auto md:mx-0">
                {t("dashboard.welcome_new_desc")}
              </p>
              <button
                onClick={() => navigate("/dashboard/recommendations")}
                className="group inline-flex items-center gap-3 bg-slate-900 text-white hover:bg-black px-8 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                {t("dashboard.start_business_questionnaire")}
                <FiArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={18}
                />
              </button>
            </div>
            
            {/* Minimalist Visual Side */}
               <div className="hidden md:flex w-1/3 h-64 bg-slate-50 rounded-3xl border border-slate-100 items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-50"></div>
                  <FiUserCheck size={80} className="text-slate-200 relative z-10" />
               </div>
          </div>
        </div>
 
        {/* FEATURE CARDS */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex gap-6">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <FiUserCheck size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xl mb-2">
                {t("dashboard.accurate_ai_profiling")}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t("dashboard.accurate_ai_profiling_desc")}
              </p>
            </div>
          </div>
 
          <div className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex gap-6">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
              <FiBarChart2 size={28} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xl mb-2">
                {t("dashboard.budget_simulation")}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t("dashboard.budget_simulation_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // TAMPILAN: UMKM AKTIF (Diperbarui Sesuai Referensi Gambar)
  // ─────────────────────────────────────────────
  return (
    <>
      {showProfilePrompt && <ProfilePromptModal />}

      <div className="max-w-[1400px] mx-auto space-y-4 sm:space-y-6 pb-8 sm:pb-12 animate-fade-in font-sans">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8 z-20 relative">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Waktu Mirip Dropdown "Month" di Gambar */}
            <div className="relative flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:border-slate-300 transition-colors shadow-sm">
              <FiCalendar className="text-slate-400 mr-2" size={14} />
              <select
                value={filterWaktu}
                onChange={(e) => setFilterWaktu(e.target.value)}
                className="appearance-none bg-transparent text-slate-600 text-sm font-medium pr-6 focus:outline-none cursor-pointer"
              >
                <option value="7_hari">{t("dashboard.filter_7_hari")}</option>
                <option value="bulan_ini">{t("dashboard.filter_bulan_ini")}</option>
                <option value="bulan_lalu">{t("dashboard.filter_bulan_lalu")}</option>
                <option value="tahun_ini">{t("dashboard.filter_tahun_ini")}</option>
                <option value="tahun_lalu">{t("dashboard.filter_tahun_lalu")}</option>
              </select>
              <FiChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={14}
              />
            </div>

            {/* Quick Action Mirip Tombol "Customize" / "Run AI" */}
            <Link
              to="/dashboard/transactions"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap"
            >
              <FiPlus size={14} /> {t("dashboard.record_transaction")}
            </Link>
          </div>
        </div>

        {apiError && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3 relative z-10 mb-6 font-medium">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FiX className="text-rose-500 shrink-0" size={20} />
                <p className="text-sm font-semibold text-rose-700">{apiError}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors shrink-0"
              >
                <FiActivity size={14} className="animate-spin" /> Coba Lagi
              </button>
            </div>

            {/* Tombol perbaikan business_id — muncul hanya jika error terkait business_id */}
            {(apiError.toLowerCase().includes("entitas bisnis") || apiError.toLowerCase().includes("business")) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-left">
                  <p className="text-sm font-bold text-amber-800">Akun Anda belum memiliki entitas bisnis.</p>
                  <p className="text-xs text-amber-600 mt-1">
                    {isEmployee
                      ? "Klik tombol di samping untuk menyinkronkan data bisnis dari Owner."
                      : "Klik tombol di samping untuk mengaktifkan bisnis Anda."}
                  </p>
                </div>
                {isEmployee ? (
                  <button
                    onClick={async () => {
                      try {
                        const response = await api.post("/api/profile/sync-business");
                        const resData = response.data;
                        alert("✅ Data bisnis berhasil disinkronkan! Halaman akan dimuat ulang.");
                        if (resData.data?.profile) {
                          localStorage.setItem("profile", JSON.stringify(resData.data.profile));
                        }
                        window.location.reload();
                      } catch (err) {
                        console.error("Gagal sync business_id:", err);
                        alert("❌ Gagal menyinkronkan data bisnis: " + (err.response?.data?.message || err.message) + "\n\nPastikan server lokal berjalan (npm run server) dan Owner sudah memiliki business_id.");
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors shrink-0 shadow-sm active:scale-95"
                  >
                    <FiTrendingUp size={14} /> Sync Data Bisnis
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      try {
                        const response = await api.post("/api/profile/upgrade", {
                          nama_usaha: "Usaha Saya",
                          tipe_usaha: "Umum",
                          lama_usaha: "< 1 Tahun"
                        });

                        const resData = response.data;

                        alert("✅ Bisnis berhasil diaktifkan! Halaman akan dimuat ulang.");
                        if (resData.data?.profile) {
                          localStorage.setItem("profile", JSON.stringify(resData.data.profile));
                        }
                        window.location.reload();
                      } catch (err) {
                        console.error("Gagal aktivasi bisnis:", err);
                        alert("❌ Gagal mengaktifkan bisnis: " + (err.response?.data?.message || err.message) + "\n\nSilakan hubungi rekan backend Anda untuk membuatkan business_id di database.");
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors shrink-0 shadow-sm active:scale-95"
                  >
                    <FiTrendingUp size={14} /> Aktivasi Bisnis
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* METRICS CARDS (4 Kolom Layout seperti gambar) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
          {/* Card 1: Pemasukan */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="block text-xs sm:text-sm font-medium text-slate-500 mb-2 sm:mb-4 truncate">
                  {t("dashboard.income")}
                </span>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                    {formatRupiah(dashboardData?.summary?.income || 0)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1 mt-1 sm:mt-2">
                    <span className="text-[10px] sm:text-xs font-medium text-emerald-500">
                      +{dashboardData?.summary?.income_change || 0}%
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 truncate">vs lalu</span>
                  </div>
                </div>
              </div>
              <div className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl ${(dashboardData?.summary?.income_change || 0) >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                {(dashboardData?.summary?.income_change || 0) >= 0 ? <FiTrendingUp size={18} /> : <FiTrendingDown size={18} />}
              </div>
            </div>
          </div>

          {/* Card 2: Pengeluaran */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="block text-xs sm:text-sm font-medium text-slate-500 mb-2 sm:mb-4 truncate">
                  {t("dashboard.expense")}
                </span>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                    {formatRupiah(dashboardData?.summary?.expense || 0)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1 mt-1 sm:mt-2">
                    <span className="text-[10px] sm:text-xs font-medium text-rose-500">
                      +{dashboardData?.summary?.expense_change || 0}%
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 truncate">vs lalu</span>
                  </div>
                </div>
              </div>
              <div className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl ${(dashboardData?.summary?.expense_change || 0) >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                {(dashboardData?.summary?.expense_change || 0) >= 0 ? <FiTrendingUp size={18} /> : <FiTrendingDown size={18} />}
              </div>
            </div>
          </div>

          {/* Card 3: Laba Bersih */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="block text-xs sm:text-sm font-medium text-slate-500 mb-2 sm:mb-4 truncate">
                  {t("dashboard.net_profit")}
                </span>
                <div>
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                    {formatRupiah(dashboardData?.summary?.net_profit || 0)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1 mt-1 sm:mt-2">
                    <span className="text-[10px] sm:text-xs font-medium text-emerald-500">
                      +Aktif
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 truncate">margin</span>
                  </div>
                </div>
              </div>
              <div className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl ${(dashboardData?.summary?.net_profit || 0) >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                {(dashboardData?.summary?.net_profit || 0) >= 0 ? <FiTrendingUp size={18} /> : <FiTrendingDown size={18} />}
              </div>
            </div>
          </div>

          {/* Card 4: Status Kesehatan */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="block text-xs sm:text-sm font-medium text-slate-500 mb-2 sm:mb-4 truncate">
              Status Kesehatan
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                  (dashboardData?.summary?.health_status || "").toLowerCase().includes("very")
                    ? "bg-emerald-500"
                    : (dashboardData?.summary?.health_status || "").toLowerCase().includes("good") ||
                      (dashboardData?.summary?.health_status || "").toLowerCase().includes("baik")
                    ? "bg-emerald-400"
                    : (dashboardData?.summary?.health_status || "").toLowerCase().includes("fair") ||
                      (dashboardData?.summary?.health_status || "").toLowerCase().includes("cukup")
                    ? "bg-amber-400"
                    : "bg-slate-300"
                }`} />
                <h3 className="text-sm sm:text-lg font-bold text-slate-900 leading-tight truncate">
                  {dashboardData?.summary?.health_status || "Belum ada status"}
                </h3>
              </div>
              <div className="flex items-center gap-1 mt-1 sm:mt-2">
                <span className="text-[10px] sm:text-xs text-slate-400 truncate">
                  Evaluasi sistem AI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Charts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-slate-900">
                  {t("dashboard.cash_flow_trend")}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>{" "}
                    Pemasukan
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>{" "}
                    Pengeluaran
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider border border-slate-200 rounded-lg px-2.5 py-1.5">
                  {rangeLabels[filterWaktu] || filterWaktu.replace("_", " ")}
                </span>
              </div>
            </div>
            <div className="h-72 w-full">
              {cashFlowChartData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <FiActivity size={32} className="mb-2 text-slate-300" />
                  <span className="text-sm font-medium">Belum ada data tren arus kas.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={288}>
                  <AreaChart data={cashFlowChartData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                      dy={10}
                      interval={["bulan_ini", "bulan_lalu", "7_hari"].includes(filterWaktu) ? 4 : 0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                      tickFormatter={(v) => {
                        if (v >= 1000000) return `${(v / 1000000).toFixed(1)}jt`;
                        if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                        return v;
                      }}
                      width={50}
                    />
                    <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                    <RechartsTooltip
                      formatter={(value, name) => [formatRupiah(value), name]}
                      contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
                        padding: '12px 16px',
                      }}
                      itemStyle={{ fontWeight: '600', fontSize: '13px' }}
                      labelStyle={{ color: '#1e293b', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Pemasukan"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPemasukan)"
                      activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#10b981' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Pengeluaran"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPengeluaran)"
                      activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#f43f5e' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
        </div>

        {/* BOTTOM SECTION: Data Transaksi (Menggantikan posisi Sales Data Table) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-6">
          <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-slate-900">
              Data Transaksi
            </h3>

            {/* Visual Action Buttons ala gambar */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="relative hidden sm:block">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none flex items-center gap-2 pl-8 pr-8 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 focus:outline-none cursor-pointer"
                >
                  <option value="Semua">Tipe</option>
                  <option value="Pemasukan">Pemasukan</option>
                  <option value="Pengeluaran">Pengeluaran</option>
                </select>
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <FiDownload size={14} />{" "}
                <span className="hidden sm:inline">Export</span>
              </button>
              <Link 
                to="/dashboard/transactions"
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm"
              >
                <FiPlus size={14} />{" "}
                <span className="hidden sm:inline">Tambah</span>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto p-4 sm:p-6">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 px-4 text-xs font-medium text-slate-400">
                    {t('dashboard.table_desc_id')}
                  </th>
                  <th className="pb-3 px-4 text-xs font-medium text-slate-400">
                    {t('dashboard.table_category')}
                  </th>
                  <th className="pb-3 px-4 text-xs font-medium text-slate-400">
                    {t('dashboard.table_date')}
                  </th>
                  <th className="pb-3 px-4 text-xs font-medium text-slate-400 text-right">
                    {t('dashboard.table_amount')}
                  </th>
                  <th className="pb-3 px-4 text-xs font-medium text-slate-400 text-center">
                    {t('dashboard.table_status_check')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {!filteredTransactions ||
                filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-12 text-center text-slate-500 text-sm"
                    >
                      {t('dashboard.no_transactions_filter')}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, idx) => (
                    <tr
                      key={tx.id || idx}
                      onClick={() => navigate("/dashboard/transactions")}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-4 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <FiFileText size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {tx.description || tx.desc}
                            </p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              #
                              {tx.id
                                ? String(tx.id).substring(0, 6).toUpperCase()
                                : `TRX00${idx + 1}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 border-b border-slate-50">
                        <span className="text-xs font-medium text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-b border-slate-50 text-sm text-slate-500">
                        {tx.date}
                      </td>
                      <td className="py-4 px-4 border-b border-slate-50 text-right">
                        <span
                          className={`text-sm font-semibold ${(tx.type || "").toLowerCase() === "pemasukan" || tx.type === "income" ? "text-slate-900" : "text-slate-900"}`}
                        >
                          {(tx.type || "").toLowerCase() === "pemasukan" ||
                          tx.type === "income"
                            ? "+"
                            : "-"}
                          {formatRupiah(tx.amount)}
                        </span>
                      </td>
                      <td className="py-4 px-4 border-b border-slate-50 text-center">
                        {JSON.parse(localStorage.getItem(`checked_trx_${tx.id || tx._id}`) || "false") ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                            <FiCheckCircle size={12} /> {t('dashboard.status_checked')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                            <FiCircle size={12} /> {t('dashboard.status_unchecked')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── MANAJEMEN AKUN (Owner Only) ── */}
        {currentUserRole === "OWNER" && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-6">
            <div className="px-5 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <FiUser size={16} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Manajemen Akun</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {usersList.length} {usersList.length > 1 ? "anggota" : "anggota"} tim terdaftar
                  </p>
                </div>
              </div>
              {loadingUsers && (
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-3.5 px-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nama Akun</th>
                    <th className="py-3.5 px-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="py-3.5 px-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="py-3.5 px-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bergabung</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers && usersList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-16 text-center text-slate-400 text-sm">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                          Memuat data akun...
                        </div>
                      </td>
                    </tr>
                  ) : usersList.length === 0 && usersError ? (
                    <tr>
                      <td colSpan="4" className="py-16 text-center text-slate-400 text-sm">
                        <div className="flex flex-col items-center gap-3">
                          <FiUser size={28} className="text-slate-300" />
                          <span className="text-rose-500 font-semibold text-xs">{usersError}</span>
                          <button onClick={fetchUsers} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors">
                            Muat Ulang
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-16 text-center text-slate-400 text-sm">
                        <div className="flex flex-col items-center gap-3">
                          <FiUser size={28} className="text-slate-300" />
                          <span>Belum ada anggota tim.</span>
                          <span className="text-xs text-slate-300">Tambah anggota baru di halaman Pengaturan.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u, idx) => {
                      const role = u.display_role;
                      const isOwnerRole = role === "OWNER";
                      const joined = u.created_at
                        ? new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                        : "-";
                      const roleConfig = isOwnerRole
                        ? { dot: "bg-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" }
                        : role === "ADMIN"
                          ? { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" }
                          : { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
                      return (
                        <tr key={u.id}
                          onClick={() => navigate("/dashboard/settings?tab=roles")}
                          className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${idx < usersList.length - 1 ? "border-b border-slate-50" : ""}`}>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3.5">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isOwnerRole ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200" : "bg-slate-100 text-slate-500"}`}>
                                {u.display_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {u.display_name}
                                  {u.is_current_user && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md uppercase tracking-wide">Anda</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-sm text-slate-500 truncate max-w-[220px]">
                            {u.email || <span className="text-slate-300 italic">-</span>}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider border ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${roleConfig.dot}`} />
                              {role}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                              <FiCalendar size={13} className="text-slate-300 shrink-0" />
                              <span>{joined}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <style>{`
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </>
  );
};

export default Dashboard;
