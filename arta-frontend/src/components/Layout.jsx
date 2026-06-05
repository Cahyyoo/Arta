import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiUser,
  FiLogOut,
  FiUserCheck,
  FiMoon,
  FiSun,
  FiGlobe
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import logoImg from "../assets/logo-2.png";
import dashboardIcon from "../assets/sidebar-icons/dashboard.png";
import transactionIcon from "../assets/sidebar-icons/transaction.png";
import reportIcon from "../assets/sidebar-icons/report.png";
import forecastingIcon from "../assets/sidebar-icons/forecasting.png";
import settingIcon from "../assets/sidebar-icons/setting.png";
import clockIcon from "../assets/sidebar-icons/clock.png";
import rekomendasiIcon from "../assets/sidebar-icons/rekomendasi-bussiness.png";
import { supabase } from "../services/supabaseClient";

const Layout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // UI States
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") {
      document.documentElement.classList.add("dark-mode");
      return true;
    }
    return document.documentElement.classList.contains("dark-mode");
  });
  const [language, setLanguage] = useState("ID");

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
      setIsDarkMode(true);
    }
  };

  const { t, i18n } = useTranslation();
  const localeStr = i18n.language === "ID" ? "id-ID" : "en-US";
  const tzLabel = i18n.language === "ID" ? "WIB" : "GMT+7";

  const handleLanguageChange = () => {
    const newLang = i18n.language === "ID" ? "EN" : "ID";
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }

      const storedProfile = localStorage.getItem("profile");
      if (storedProfile) {
        try {
          setProfile(JSON.parse(storedProfile));
        } catch (e) {
          console.error("Failed to parse profile data", e);
        }
      }
    };

    loadUserData();

    window.addEventListener("profileUpdated", loadUserData);
    return () => window.removeEventListener("profileUpdated", loadUserData);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fullName = profile?.nama_lengkap || user?.user_metadata?.nama_lengkap || user?.user_metadata?.full_name || "Admin Usaha";
  const email = user?.email || "admin@artha.id";
  const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const currentUserRole = profile?.role || user?.user_metadata?.role || "USER";
  const isOwner = String(currentUserRole).toUpperCase() === "OWNER";
  const isEmployee = ["ADMIN", "STAFF", "USER"].includes(String(currentUserRole).toUpperCase());

  // Karyawan (ADMIN, STAFF, USER) selalu dianggap sebagai UMKM AKTIF
  const userType = isEmployee ? "umkm_aktif" : (profile?.user_type || "calon_pengusaha");

  // Susun submenu settings secara dinamis
  const settingsSubItems = [
    { name: t("menu.profile_account"), path: "/dashboard/profile" },
    { name: t("menu.business_profile"), path: "/dashboard/settings?tab=profile" }
  ];

  // Tambahkan Manajemen Role HANYA jika isOwner
  if (isOwner) {
    settingsSubItems.push({ name: t("menu.role_management"), path: "/dashboard/settings?tab=roles" });
  }
  // --------------------------

  const menuItems = userType === "umkm_aktif"
    ? [
      { name: t("menu.dashboard"), path: "/dashboard", icon: <img src={dashboardIcon} className="w-6 h-6 object-contain" /> },
      { name: t("menu.transactions"), path: "/dashboard/transactions", icon: <img src={transactionIcon} className="w-6 h-6 object-contain" /> },
      { name: t("menu.reports"), path: "/dashboard/reports", icon: <img src={reportIcon} className="w-6 h-6 object-contain" /> },
      { name: t("menu.ai_prediction"), path: "/dashboard/forecasting", icon: <img src={forecastingIcon} className="w-6 h-6 object-contain" /> },
      {
        name: t("menu.settings"),
        icon: <img src={settingIcon} className="w-6 h-6 object-contain" />,
        subItems: settingsSubItems
      },
    ]
    : [
      { name: t("menu.dashboard"), path: "/dashboard", icon: <img src={dashboardIcon} className="w-6 h-6 object-contain" /> },
      { name: "Rekomendasi Bisnis", path: "/dashboard/recommendations", icon: <img src={rekomendasiIcon} className="w-6 h-6 object-contain" /> },
      {
        name: t("menu.settings"),
        icon: <img src={settingIcon} className="w-6 h-6 object-contain" />,
        subItems: [
          { name: t("menu.profile_account"), path: "/dashboard/profile" }
        ]
      },
    ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out from Supabase:", err);
    }
    // Hapus data dari penyimpanan lokal
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");

    setIsProfileOpen(false);
    // Arahkan kembali ke halaman login
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar untuk Desktop */}
      <motion.aside
        onMouseEnter={() => setIsDesktopSidebarCollapsed(false)}
        onMouseLeave={() => setIsDesktopSidebarCollapsed(true)}
        animate={{ width: isDesktopSidebarCollapsed ? 96 : 288 }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
        className="bg-white border-r border-slate-200 hidden lg:flex flex-col shadow-sm z-20 overflow-hidden absolute inset-y-0 left-0 hover:shadow-xl"
        style={{ position: 'relative' }}
      >
        <div className="py-5 flex flex-col items-center justify-center border-b border-slate-100 px-4">
          <div className="flex flex-col items-center justify-center min-w-max gap-1.5">
            {/* Logo image */}
            <img
              src={logoImg}
              alt="Artha Logo"
              className={`w-auto object-contain transition-all duration-300 drop-shadow-sm ${isDesktopSidebarCollapsed ? 'h-8' : 'h-11 sm:h-12'}`}
            />
            {/* Brand text */}
            <span
              className={`font-black tracking-[0.2em] pl-[0.1em] text-slate-800 whitespace-nowrap transition-all duration-300 ${isDesktopSidebarCollapsed ? 'text-[10px] mt-0.5' : 'text-[15px] mt-1'}`}
              style={{ fontFamily: "'Plus Jakarta Sans', 'Outfit', 'Inter', sans-serif" }}
            >
              ARTA
            </span>
          </div>
        </div>
        <nav className={`flex-1 space-y-2 overflow-y-auto overflow-x-hidden transition-all duration-400 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isDesktopSidebarCollapsed ? 'p-4' : 'p-6'}`}>
          {menuItems.map((item) => (
            <div key={item.name}>
              {item.subItems ? (
                <>
                  <button
                    title={isDesktopSidebarCollapsed ? item.name : ""}
                    onClick={() => {
                      if (isDesktopSidebarCollapsed) {
                        setIsDesktopSidebarCollapsed(false);
                      }
                      setIsSettingsOpen(!isSettingsOpen);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl transition-colors duration-200 ${isDesktopSidebarCollapsed ? 'px-0 py-3.5 justify-center' : 'px-5 py-3.5'
                      } ${item.subItems.some(sub => location.pathname === sub.path.split('?')[0])
                        ? "bg-slate-100 text-slate-900 font-bold"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                  >
                    <div className="flex items-center">
                      <span className={`text-xl min-w-[24px] flex justify-center ${isDesktopSidebarCollapsed ? 'mx-auto' : ''}`}>{item.icon}</span>
                      <AnimatePresence>
                        {!isDesktopSidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                            animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                            transition={{ type: "spring", stiffness: 250, damping: 25 }}
                            className="text-[15px] whitespace-nowrap overflow-hidden origin-left"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    {!isDesktopSidebarCollapsed && (
                      <FiChevronDown className={`transition-transform duration-300 ${isSettingsOpen ? "rotate-180" : ""}`} />
                    )}
                  </button>
                  <AnimatePresence>
                    {isSettingsOpen && !isDesktopSidebarCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pl-12 mt-1 space-y-1"
                      >
                        {item.subItems.map((subItem) => {
                          const isActive = subItem.path.includes('?')
                            ? location.search.includes(subItem.path.split('?')[1]) || (location.pathname === "/dashboard/settings" && !location.search && subItem.path.includes("tab=roles"))
                            : location.pathname === subItem.path;

                          return (
                            <Link
                              key={subItem.name}
                              to={subItem.path}
                              className={`block py-2.5 px-4 text-sm font-medium transition-all ${isActive
                                ? "border-l-[3px] border-slate-800 text-slate-900 bg-slate-50/80 font-bold"
                                : "border-l-[3px] border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                                }`}
                            >
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  to={item.path}
                  title={isDesktopSidebarCollapsed ? item.name : ""}
                  className={`flex items-center rounded-xl transition-colors duration-200 ${isDesktopSidebarCollapsed ? 'justify-center px-0 py-3.5' : 'px-5 py-3.5'
                    } ${location.pathname === item.path
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                >
                  <span className="text-xl min-w-[24px] flex justify-center">{item.icon}</span>
                  <AnimatePresence>
                    {!isDesktopSidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                        animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                        exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                        transition={{ type: "spring", stiffness: 250, damping: 25 }}
                        className="text-[15px] whitespace-nowrap overflow-hidden origin-left"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Desktop Sidebar Clock */}
        <div className={`border-t border-slate-100 transition-all duration-300 ${isDesktopSidebarCollapsed ? 'p-4' : 'p-6'}`}>
          <div
            className={`flex items-start rounded-xl transition-colors duration-200 cursor-default ${isDesktopSidebarCollapsed ? 'justify-center px-0 py-3.5' : 'px-5 py-3.5'
              } text-slate-500 hover:bg-slate-50`}
          >
            <span className="text-xl min-w-[24px] flex justify-center pt-0.5 shrink-0">
              <img src={clockIcon} className="w-6 h-6 object-contain" />
            </span>
            <AnimatePresence>
              {!isDesktopSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                  animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
                  exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                  transition={{ type: "spring", stiffness: 250, damping: 25 }}
                  className="overflow-hidden origin-left"
                >
                  <p className="text-[15px] font-semibold text-slate-800 tabular-nums leading-tight whitespace-nowrap">
                    {currentTime.toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit' })}
                    <span className="text-[13px] text-slate-400 font-medium ml-1">{tzLabel}</span>
                  </p>
                  <p className="text-[12px] text-slate-500 font-medium mt-0.5 leading-tight whitespace-nowrap">
                    {currentTime.toLocaleDateString(localeStr, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[70] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="py-6 flex flex-col items-center justify-center relative border-b border-slate-100">
                <div className="flex flex-col items-center gap-2">
                  <img src={logoImg} alt="Artha Logo" className="h-11 sm:h-12 w-auto object-contain drop-shadow-sm" />
                  <span
                    className="text-[15px] font-black tracking-[0.2em] pl-[0.1em] text-slate-800 mt-1"
                    style={{ fontFamily: "'Plus Jakarta Sans', 'Outfit', 'Inter', sans-serif" }}
                  >
                    ARTA
                  </span>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="text-slate-400 hover:text-slate-600 absolute right-4 top-4 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
              <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <div key={item.name}>
                    {item.subItems ? (
                      <>
                        <button
                          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                          className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-colors ${item.subItems.some(sub => location.pathname === sub.path.split('?')[0])
                            ? "bg-slate-100 text-slate-900 font-bold"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-base">{item.name}</span>
                          </div>
                          <FiChevronDown className={`transition-transform duration-300 ${isSettingsOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {isSettingsOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden pl-12 mt-1 space-y-1"
                            >
                              {item.subItems.map((subItem) => {
                                const isActive = subItem.path.includes('?')
                                  ? location.search.includes(subItem.path.split('?')[1]) || (location.pathname === "/dashboard/settings" && !location.search && subItem.path.includes("tab=roles"))
                                  : location.pathname === subItem.path;

                                return (
                                  <Link
                                    key={subItem.name}
                                    to={subItem.path}
                                    onClick={toggleSidebar}
                                    className={`block py-3 px-4 text-sm font-medium transition-all ${isActive
                                      ? "border-l-[3px] border-slate-800 text-slate-900 bg-slate-50/80 font-bold"
                                      : "border-l-[3px] border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                                      }`}
                                  >
                                    {subItem.name}
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={toggleSidebar}
                        className={`flex items-center gap-3 px-5 py-4 rounded-xl transition-colors ${location.pathname === item.path
                          ? "bg-slate-100 text-slate-900 font-bold"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-base">{item.name}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* Mobile Sidebar Clock */}
              <div className="border-t border-slate-100 p-6">
                <div className="flex items-start gap-3 px-5 py-4 rounded-xl transition-colors duration-200 cursor-default text-slate-500 hover:bg-slate-50">
                  <span className="text-xl min-w-[24px] flex justify-center pt-0.5 shrink-0">
                    <img src={clockIcon} className="w-6 h-6 object-contain" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-slate-800 tabular-nums leading-tight">
                      {currentTime.toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit' })}
                      <span className="text-sm text-slate-400 font-medium ml-1">{tzLabel}</span>
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-tight">
                      {currentTime.toLocaleDateString(localeStr, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Konten Utama */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center px-6 md:px-8 justify-between relative z-50">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <FiMenu size={24} />
            </button>
            <div className="hidden lg:flex flex-col justify-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t("header.welcome_back")}</p>
              <h2 className="text-base font-black text-slate-800 tracking-tight leading-none">
                {t("header.hello")}, <span className="text-indigo-600">{fullName}</span>
              </h2>
            </div>
            <h2 className="text-lg font-bold text-slate-800 lg:hidden">
              {t("menu.dashboard")}
            </h2>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 md:gap-4 hover:bg-slate-50 p-1.5 md:pr-4 rounded-full md:rounded-2xl transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm shrink-0 overflow-hidden">
                {user?.user_metadata?.avatar ? (
                  <img src={user.user_metadata.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="flex flex-col items-start hidden sm:flex text-left">
                <span className="text-sm font-bold text-slate-700 leading-tight">
                  {fullName}
                </span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {t("header.online")}
                </span>
              </div>
              <FiChevronDown className={`hidden sm:block text-slate-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  ></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-2 z-50 origin-top-right overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-50 sm:hidden">
                      <p className="text-sm font-bold text-slate-800">{fullName}</p>
                      <p className="text-xs text-slate-500">{email}</p>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isDarkMode ? <FiMoon size={16} /> : <FiSun size={16} />}
                          <span>{isDarkMode ? t("header.dark_mode") : t("header.light_mode")}</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isDarkMode ? 'left-4.5' : 'left-0.5'}`} style={{ left: isDarkMode ? '14px' : '2px' }}></div>
                        </div>
                      </button>

                      <button
                        onClick={handleLanguageChange}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FiGlobe size={16} />
                          <span>{t("header.language")}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${i18n.language === "ID" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}>ID</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${i18n.language === "EN" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}>EN</span>
                        </div>
                      </button>
                    </div>
                    <div className="p-2 border-t border-slate-50 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <FiLogOut size={16} />
                        <span>{t("header.logout")}</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Area Render Halaman */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;