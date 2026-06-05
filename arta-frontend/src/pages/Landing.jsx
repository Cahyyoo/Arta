import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import logoImg from "../assets/logo.png";
import logo2Img from "../assets/logo-2.png";
import iconDigitalCashbook from "../assets/icons/digital-cashbook.png";
import iconAiRekomendasi from "../assets/icons/ai-rekomendasi.png";
import iconGeneratedReport from "../assets/icons/generated-report.png";
import iconForecasting from "../assets/icons/forecasting.png";
import iconVisualData from "../assets/icons/visual-data.png";
import iconOnboarding from "../assets/icons/onboarding.png";
import iconKeamanan from "../assets/icons/keamanan.png";
import iconCloudBased from "../assets/icons/cloud-based.png";
import iconBukuKas from "../assets/icons/buku-kas.png";
import iconNotaTransaksi from "../assets/icons/nota-transaksi.png";
import iconWarning from "../assets/icons/warning.png";
import iconDowntrend from "../assets/icons/downtrend.png";
import iconLaporanNeraca from "../assets/icons/laporan-neraca.png";
import iconTrend from "../assets/icons/trend.png";
import iconRealTime from "../assets/icons/real-time.png";
import iconPerintis from "../assets/icons/perintis.png";
import iconPengusaha from "../assets/icons/pengusaha.png";
import {
  FiX,
  FiCheck,
  FiFileText,
  FiAlertTriangle,
  FiBook,
  FiTrendingDown,
  FiMonitor,
  FiPieChart,
  FiTrendingUp,
  FiZap,
  FiArrowRight,
  FiBriefcase,
  FiTarget,
  FiCompass,
  FiDownload,
  FiPackage,
  FiHelpCircle,
  FiGlobe,
  FiMail,
  FiPhone,
  FiSend,
} from "react-icons/fi";
import { FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";

import { useTranslation } from "react-i18next";

const Landing = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [activeSection, setActiveSection] = useState("layanan");

  const navItems = [
    { id: "layanan", name: t("landing.nav_fitur") },
    { id: "cara-kerja", name: t("landing.nav_cara_kerja") },
    { id: "testimoni", name: t("landing.nav_testimoni") },
    { id: "faq", name: t("landing.nav_faq") },
    { id: "kontak", name: t("landing.nav_kontak") },
  ];

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  useEffect(() => {
    const visibleSections = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibleSections.set(entry.target.id, entry.intersectionRatio);
        });

        let maxRatio = 0;
        let mostVisible = "";

        visibleSections.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisible = id;
          }
        });

        if (mostVisible && maxRatio > 0.1) {
          setActiveSection(mostVisible);
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        rootMargin: "-10% 0px -40% 0px",
      },
    );

    const sections = ["layanan", "cara-kerja", "testimoni", "faq", "kontak"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      name: "Maya Singh",
      role: "Product Manager",
      text: "Highly recommend to every dev. The consistency and quality are unmatched. Every project we launch with this kit gets instant praise for its UI.",
      avatar: "https://i.pravatar.cc/150?u=Maya",
    },
    {
      name: "Chris Anderson",
      role: "UX Designer",
      text: "A designer's dream toolkit. Beautiful defaults with enough flexibility to make them truly mine. It has saved me hundreds of hours.",
      avatar: "https://i.pravatar.cc/150?u=Chris",
    },
    {
      name: "Alex Turner",
      role: "Fullstack Dev",
      text: "The animations are buttery smooth. Worth every penny of the investment. My clients can't believe how professional the end product looks.",
      avatar: "https://i.pravatar.cc/150?u=Alex",
    },
    {
      name: "Olivia Martinez",
      role: "Startup Founder",
      text: "Best in class components. The quality and consistency are unmatched. We were able to ship our MVP in record time.",
      avatar: "https://i.pravatar.cc/150?u=Olivia",
    },
    {
      name: "Priya Patel",
      role: "Design Lead",
      text: "Saved us $50k in design costs. Achieved even better results faster. The modular approach is exactly what we needed for our scale.",
      avatar: "https://i.pravatar.cc/150?u=Priya",
    },
    {
      name: "David Park",
      role: "Frontend Lead",
      text: "The templates saved us months of development time. It's not just a UI kit, it's a productivity booster.",
      avatar: "https://i.pravatar.cc/150?u=David",
    },
    {
      name: "Lisa Thompson",
      role: "CEO",
      text: "Aceternity UI is the competitive edge we didn't know we needed. Our conversion rates have improved by 30% since the redesign.",
      avatar: "https://i.pravatar.cc/150?u=Lisa",
    },
    {
      name: "James Wilson",
      role: "Creative Director",
      text: "Incredible developer experience. Copy, paste, customize. It's that simple. The documentation is clear and the components just work.",
      avatar: "https://i.pravatar.cc/150?u=James",
    },
    {
      name: "Sarah Chen",
      role: "Web Developer",
      text: "Best investment for our startup. We shipped our landing page in two days instead of two weeks. The code quality is excellent.",
      avatar: "https://i.pravatar.cc/150?u=Sarah",
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden relative z-0">
      {/* 1. Background Base Layers */}
      <div className="absolute inset-0 z-[-3] h-full w-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-20"></div>
      <div className="absolute inset-0 z-[-3] h-full w-full bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10"></div>

      {/* 2. Hero Spotlight Effect — Cinematic */}
      <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
        {/* Ambient Glow Layer */}
        <div className="absolute top-[-20%] left-[5%] w-[90%] h-[1000px] bg-indigo-600/[0.07] blur-[180px] rounded-full animate-shimmer"></div>
        <div className="absolute top-[0%] right-[-10%] w-[55%] h-[700px] bg-purple-500/[0.04] blur-[150px] rounded-full animate-float"></div>
        <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[550px] bg-teal-500/[0.03] blur-[130px] rounded-full animate-pulse-slow"></div>

        {/* Main Spotlight Beam — Diagonal from top-left */}
        <div className="animate-spotlight absolute top-[-50%] left-[-25%] w-[70%] h-[200%] opacity-0 origin-top-left">
          <div
            className="w-full h-full"
            style={{
              background: `conic-gradient(from 218deg at 20% 30%, rgba(99,102,241,0.12) 0deg, rgba(139,92,246,0.08) 25deg, transparent 50deg, transparent 310deg, rgba(99,102,241,0.05) 340deg, rgba(99,102,241,0.12) 360deg)`,
            }}
          ></div>
        </div>

        {/* Core Glow — Bright center of beam hitting hero */}
        <div className="animate-spotlight-core absolute top-[5%] left-[15%] w-[600px] h-[600px] opacity-0">
          <div className="w-full h-full bg-[radial-gradient(circle,rgba(129,140,248,0.15)_0%,rgba(99,102,241,0.06)_35%,transparent_70%)] blur-[40px]"></div>
        </div>

        {/* Secondary Glow — Purple accent top-right */}
        <div className="animate-spotlight-secondary absolute top-[-10%] right-[5%] w-[500px] h-[500px] opacity-0">
          <div className="w-full h-full bg-[radial-gradient(circle,rgba(139,92,246,0.1)_0%,rgba(139,92,246,0.03)_40%,transparent_70%)]"></div>
        </div>

        {/* Light Streak Lines — Subtle diagonal accents */}
        <div className="animate-spotlight absolute top-0 left-[10%] w-[1px] h-[120%] opacity-0 rotate-[25deg] origin-top">
          <div className="w-full h-full bg-gradient-to-b from-indigo-400/20 via-indigo-400/5 to-transparent"></div>
        </div>
        <div
          className="animate-spotlight absolute top-0 left-[12%] w-[1px] h-[100%] opacity-0 rotate-[22deg] origin-top"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="w-full h-full bg-gradient-to-b from-purple-400/15 via-purple-400/3 to-transparent"></div>
        </div>
      </div>

      {/* 3. Floating Financial Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-2]">
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-[25%] left-[10%] text-2xl text-emerald-500/20 font-bold blur-[1px]"
        >
          $
        </motion.div>

        <motion.div
          animate={{
            y: [0, 30, 0],
            x: [0, 10, 0],
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[15%] right-[15%] text-indigo-500/20"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-16 h-16 fill-current blur-[2px]"
          >
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"></path>
          </svg>
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-[15%] left-[20%] text-blue-500/10 font-black text-7xl blur-[3px]"
        >
          Rp
        </motion.div>

        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent animate-beam"></div>
        <div className="absolute top-0 left-3/4 w-[1px] h-full bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent animate-beam-slow"></div>
      </div>

      {/* Navbar Container */}
      <div className="fixed top-4 md:top-6 left-0 w-full flex justify-center z-50 px-4 md:px-6 pointer-events-none">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto bg-[#0a0f1c]/70 backdrop-blur-2xl border border-white/10 px-3 md:px-4 py-2 rounded-2xl md:rounded-[1.25rem] flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.4)] w-full max-w-4xl"
        >
          {/* Logo */}
          <div className="flex items-center pl-2 md:pl-1 pr-4 md:pr-0 shrink-0">
            <img
              src={logo2Img}
              alt="Arta Logo"
              className="h-6 md:h-8 w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-1 lg:gap-2 px-4">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  onMouseEnter={() => setHoveredPath(item.id)}
                  onMouseLeave={() => setHoveredPath(null)}
                  className={`relative px-4 py-2 text-[12px] font-semibold transition-all duration-300 rounded-lg ${
                    isActive
                      ? "text-indigo-300"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="relative z-10 tracking-wide">
                    {item.name}
                  </span>

                  {/* Active State Background */}
                  {isActive && (
                    <motion.span
                      layoutId="active-nav-pill"
                      className="absolute inset-0 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)] z-0"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Hover State Background */}
                  <AnimatePresence>
                    {hoveredPath === item.id && !isActive && (
                      <motion.span
                        layoutId="hover-nav-pill"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 rounded-lg bg-white/[0.05] border border-white/[0.05] z-0"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

          {/* Auth Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {isLoggedIn ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white px-5 py-2 rounded-xl text-[12px] font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20 border border-indigo-400/20"
              >
                {t("landing.nav_dashboard")}
              </button>
            ) : (
              <div className="flex items-center gap-4 lg:gap-6">
                <Link
                  to="/login"
                  className="text-xs font-black text-slate-400 hover:text-white transition-colors"
                >
                  {t("landing.nav_masuk")}
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white px-5 lg:px-7 py-2.5 md:py-3 rounded-2xl text-xs font-black transition-all active:scale-95 shadow-xl shadow-indigo-500/25 border border-white/10"
                >
                  {t("landing.nav_daftar_gratis")}
                </Link>
              </div>
            )}
            
            {/* Language Switcher */}
            <button 
              onClick={() => i18n.changeLanguage(i18n.language === "ID" ? "EN" : "ID")}
              className="hidden md:flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition-colors border border-white/10"
            >
              <FiGlobe className="text-slate-300" size={14} />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{i18n.language || "ID"}</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          >
            <span
              className={`w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-white transition-all ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            ></span>
          </button>
        </motion.nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-4 right-4 bg-[#111827]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col gap-6 md:hidden shadow-2xl z-40"
            >
              <div className="flex flex-col gap-4">
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`text-lg font-bold text-left px-2 transition-colors ${
                        isActive
                          ? "text-indigo-400"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
              <div className="h-px bg-white/10 w-full my-2"></div>
              {isLoggedIn ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white py-4 rounded-2xl font-black text-center"
                >
                  {t("landing.nav_dashboard")}
                </button>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link
                    to="/login"
                    className="text-center font-bold text-slate-300 py-2"
                  >
                    {t("landing.nav_masuk")}
                  </Link>
                  <Link
                    to="/register"
                    className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white py-4 rounded-2xl font-black text-center"
                  >
                    {t("landing.nav_daftar_gratis")}
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hero Section */}
      <main
        id="beranda"
        className="container mx-auto px-6 lg:px-12 pt-32 md:pt-48 xl:pt-56 pb-20 flex flex-col lg:flex-row items-center justify-between relative z-10 min-h-screen lg:min-h-[calc(100vh-104px)] gap-12 lg:gap-8 xl:gap-16"
      >
        {/* Left Content */}
        <div className="w-full lg:w-[50%] xl:w-[45%] space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5.5rem] font-black leading-[1.15] tracking-tight relative text-white">
            {t("landing.hero_title_1")} <br className="hidden sm:block" />
            {/* Elegant Text Glow Effect */}
            <span className="relative inline-block py-1 md:py-2">
              {/* Soft animated background glow */}
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-emerald-500/30 blur-2xl opacity-70 rounded-full animate-pulse-slow"></span>

              {/* Text with dynamic gradient */}
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
                {t("landing.hero_title_2")}
              </span>
            </span>
            <br className="hidden sm:block" />
            {t("landing.hero_title_3")}
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-lg lg:max-w-md xl:max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
            {t("landing.hero_desc")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            {/* Magnetic Primary Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <button
                onClick={() => navigate("/register")}
                onMouseMove={(e) => {
                  const btn = e.currentTarget;
                  const rect = btn.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  btn.style.setProperty("--mouse-x", `${x}px`);
                  btn.style.setProperty("--mouse-y", `${y}px`);
                }}
                className="relative w-full sm:w-auto group overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl text-base font-bold transition-colors shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 border border-white/10"
              >
                {/* Cursor Glow Layer */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle 100px at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.15), transparent)`,
                  }}
                />

                <span className="relative z-10">{t("landing.hero_cta")}</span>
                <motion.span
                  className="relative z-10"
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  →
                </motion.span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Right Content - Screenshot Mockup */}
        <div
          className="w-full lg:w-[50%] xl:w-[55%] relative mt-12 lg:mt-0 flex justify-center lg:justify-end items-center"
          style={{ perspective: "1400px" }}
        >
          <motion.div
            className="relative w-full max-w-[500px] sm:max-w-[550px] lg:max-w-[600px] xl:max-w-[750px] 2xl:max-w-[900px] group cursor-pointer"
            initial={{ rotateY: -15, rotateX: 5, scale: 0.9, opacity: 0 }}
            animate={{ rotateY: -10, rotateX: 5, scale: 1, opacity: 1 }}
            whileHover={{ rotateY: 0, rotateX: 0, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Glow/Shadow behind the image */}
            <div
              className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/40 via-purple-500/20 to-transparent blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 rounded-[3rem]"
              style={{ transform: "translateZ(-20px)" }}
            ></div>

            {/* The Screenshot Image Wrapper */}
            <div className="relative rounded-[1.25rem] md:rounded-[1.75rem] overflow-hidden border border-white/10 bg-[#0a0f1c] shadow-[0_30px_60px_rgba(0,0,0,0.7)] group-hover:shadow-[0_40px_80px_rgba(99,102,241,0.3)] transition-all duration-500 ring-1 ring-white/5">
              {/* Fake Mac Window Bar */}
              <div className="absolute top-0 left-0 right-0 h-7 md:h-8 bg-[#0a0f1c]/90 backdrop-blur-md flex items-center px-3 md:px-4 gap-1.5 border-b border-white/5 z-20">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                <div className="ml-auto text-[8px] md:text-[9px] text-slate-500 font-medium tracking-wider">
                  {t("landing.hero_mockup_label")}
                </div>
                <img
                  src={iconGeneratedReport}
                  alt={t("landing.hero_mockup_label")}
                  className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-500"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              </div>

              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Problem Statement Section */}
      <section className="relative py-24 lg:py-32 px-6 overflow-hidden bg-[#0a0f1c]">
        {/* Ambient Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight"
            >
              {t("landing.problem_headline")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-slate-400 font-medium leading-relaxed"
            >
              {t("landing.problem_desc")}
            </motion.p>
          </div>

          {/* Before vs After Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 relative mb-20">
            {/* Sebelum Arta Card Wrapper */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-[1px] rounded-[2rem] bg-gradient-to-br from-rose-500/30 via-rose-500/5 to-transparent hover:from-rose-500/40 transition-colors duration-500"
            >
              {/* Card Content */}
              <div className="bg-[#0b101e] rounded-[2rem] h-full p-6 md:p-8 lg:p-10 relative overflow-hidden">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 font-bold text-sm mb-8 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                    <FiX strokeWidth={3} className="text-rose-500" />
                    {t("landing.before_badge")}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {t("landing.before_title")}
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        icon: iconBukuKas,
                        text: t("landing.before_item_1"),
                      },
                      {
                        icon: iconNotaTransaksi,
                        text: t("landing.before_item_2"),
                      },
                      {
                        icon: iconWarning,
                        text: t("landing.before_item_3"),
                      },
                      {
                        icon: iconDowntrend,
                        text: t("landing.before_item_4"),
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 hover:scale-[1.02] transition-all duration-300 group cursor-default shadow-sm"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner p-2.5">
                          <img
                            src={item.icon}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-slate-300 text-sm font-medium leading-relaxed pt-1.5">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Decorative arrow pointing right on desktop, down on mobile */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:flex w-14 h-14 bg-[#0b101e] rounded-full border border-slate-700/50 items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="w-10 h-10 bg-slate-800/80 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                <FiArrowRight className="text-slate-400" size={20} />
              </div>
            </div>

            {/* Dengan Arta Card Wrapper */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-[1px] rounded-[2rem] bg-gradient-to-br from-emerald-500/40 via-emerald-500/5 to-transparent hover:from-emerald-500/50 transition-colors duration-500 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
            >
              {/* Card Content */}
              <div className="bg-[#0b101e] rounded-[2rem] h-full p-6 md:p-8 lg:p-10 relative overflow-hidden">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-sm mb-8 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                    <FiCheck strokeWidth={3} className="text-emerald-500" />
                    {t("landing.after_badge")}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {t("landing.after_title")}
                  </h3>

                  <div className="space-y-4 mb-8">
                    {[
                      {
                        icon: iconLaporanNeraca,
                        text: t("landing.after_item_1"),
                      },
                      {
                        icon: iconTrend,
                        text: t("landing.after_item_2"),
                      },
                      {
                        icon: iconRealTime,
                        text: t("landing.after_item_3"),
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:scale-[1.02] transition-all duration-300 group cursor-default shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner mt-0.5 p-2">
                          <img
                            src={item.icon}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-emerald-50/90 text-sm font-medium leading-relaxed pt-1">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Image Preview - Enhanced */}
                  <div className="rounded-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden relative group bg-[#0b101e] mt-6 ring-1 ring-white/5 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_30px_60px_rgba(16,185,129,0.2)]">
                    {/* Fake Window Controls */}
                    <div className="bg-[#111827]/90 backdrop-blur-md px-4 py-2.5 border-b border-white/5 flex items-center gap-1.5 z-20 absolute top-0 left-0 right-0">
                      <div className="w-2 h-2 rounded-full bg-rose-500/80"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                      <div className="ml-auto text-[8px] text-slate-500 font-medium tracking-wider">
                        {t("landing.after_mockup_label")}
                      </div>
                    </div>

                    {/* The Image */}
                    <div className="pt-8 relative bg-[#0b101e]">
                      <img
                        src="/cashbook.jpg"
                        alt="Digital Cashbook Preview"
                        className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    </div>

                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-30"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Statistics / Urgency Premium Card */}
          <div className="relative p-8 md:p-12 lg:p-14 rounded-[2.5rem] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 mb-16 mt-16 overflow-hidden shadow-2xl">
            {/* Inner Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-rose-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {[
                {
                  value: t("landing.stat_failure_value"),
                  label: t("landing.stat_failure_title"),
                  desc: t("landing.stat_failure_desc"),
                },
                {
                  value: t("landing.stat_report_value"),
                  label: t("landing.stat_report_title"),
                  desc: t("landing.stat_report_desc"),
                },
                {
                  value: t("landing.stat_prediction_value"),
                  label: t("landing.stat_prediction_title"),
                  desc: t("landing.stat_prediction_desc"),
                },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * idx }}
                  className="text-center px-6 pt-8 md:pt-0 flex flex-col items-center justify-start group cursor-default"
                >
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 group-hover:text-rose-400/80 transition-colors duration-300">
                    {stat.label}
                  </p>
                  <h4 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-5 drop-shadow-sm group-hover:from-orange-400 group-hover:to-rose-400 transition-all duration-500 scale-95 group-hover:scale-100">
                    {stat.value}
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-[260px] mx-auto group-hover:text-slate-200 transition-colors duration-300">
                    {stat.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 border-t border-white/5"
          >
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              {t("landing.solution_cta")} <FiArrowRight />
            </Link>
            <a
              href="#layanan"
              className="px-8 py-4 text-slate-400 font-medium hover:text-white transition-colors flex items-center gap-2"
            >
              {t("landing.solution_cta_desc")}
            </a>
          </motion.div>
        </div>
      </section>
      {/* Key Features Section - Refined Tech Grid */}
      <section
        id="layanan"
        className="relative py-32 overflow-hidden bg-[#020617]"
      >
        {/* Section Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-white mb-5 tracking-tight"
            >
              {t("landing.features_title_1")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {t("landing.features_title_2")}
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto"
            >
              {t("landing.features_desc")}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-white/5 rounded-[3rem] overflow-hidden bg-white/[0.01] backdrop-blur-3xl shadow-2xl shadow-indigo-500/5">
            {[
              {
                title: t("landing.feature_digital_cashbook"),
                desc: t("landing.feature_digital_cashbook_desc"),
                icon: iconDigitalCashbook,
              },
              {
                title: t("landing.feature_ai_rekomendasi"),
                desc: t("landing.feature_ai_rekomendasi_desc"),
                icon: iconAiRekomendasi,
              },
              {
                title: t("landing.feature_generated_report"),
                desc: t("landing.feature_generated_report_desc"),
                icon: iconGeneratedReport,
              },
              {
                title: t("landing.feature_ai_forecasting"),
                desc: t("landing.feature_ai_forecasting_desc"),
                icon: iconForecasting,
              },
              {
                title: t("landing.feature_visualisasi"),
                desc: t("landing.feature_visualisasi_desc"),
                icon: iconVisualData,
              },
              {
                title: t("landing.feature_onboarding"),
                desc: t("landing.feature_onboarding_desc"),
                icon: iconOnboarding,
              },
              {
                title: t("landing.feature_keamanan"),
                desc: t("landing.feature_keamanan_desc"),
                icon: iconKeamanan,
              },
              {
                title: t("landing.feature_cloud"),
                desc: t("landing.feature_cloud_desc"),
                icon: iconCloudBased,
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative p-10 border-r border-b border-white/5 group cursor-default hover:bg-white/[0.03] transition-all duration-500"
              >
                {/* Dynamic Beam Indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-500 opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(99,102,241,1)] transition-all duration-500"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent border border-white/[0.05] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all duration-500 p-3.5 relative">
                    <img
                      src={feature.icon}
                      alt={feature.title}
                      className="w-full h-full object-contain relative z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-all duration-500"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium group-hover:text-slate-400 transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - User Flow Journey */}
      <section
        id="cara-kerja"
        className="relative py-24 md:py-32 overflow-hidden bg-[#030617]"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/[0.03] blur-[150px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10 max-w-5xl">
          {/* Header */}
          <div className="text-center mb-16 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-6"
            >
              {t("landing.how_badge")}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-black text-white mb-5 tracking-tight"
            >
              {t("landing.how_title_1")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {t("landing.how_title_2")}
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto"
            >
              {t("landing.how_desc")}
            </motion.p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/30 via-emerald-500/20 to-violet-500/20 hidden md:block"></div>

            {/* Step 1: Daftar Akun */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-16 md:mb-20"
            >
              {/* Left content */}
              <div className="flex-1 md:text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                  {t("landing.step_01")}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                  {t("landing.step_01_title")}
                </h3>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md md:ml-auto">
                  {t("landing.step_01_desc")}
                </p>
              </div>
              {/* Center dot */}
              <div className="hidden md:flex w-10 h-10 rounded-full bg-indigo-500 items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30 z-10">
                <span className="text-white text-xs font-black">1</span>
              </div>
              {/* Right visual - Login page mockup */}
              <div className="flex-1 flex justify-start">
                <div className="relative overflow-hidden bg-white rounded-2xl p-5 w-[280px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-slate-100/50">
                  {/* Top gradient */}
                  <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>

                  {/* Logo + Title */}
                  <div className="flex flex-col items-center mb-4 relative z-10">
                    <img
                      src={logoImg}
                      alt="Arta"
                      className="h-10 w-auto mb-2"
                    />
                    <h4 className="text-sm font-extrabold text-slate-800">
                      Welcome Back!
                    </h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      Sign in to manage your finances
                    </p>
                  </div>

                  {/* Form */}
                  <div className="space-y-2 mb-3 relative z-10">
                    <div>
                      <span className="text-[8px] font-semibold text-slate-500 ml-0.5 block mb-0.5">
                        Email
                      </span>
                      <div className="h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center px-3 text-[9px] text-slate-400">
                        Input your email
                      </div>
                    </div>
                    <div>
                      <span className="text-[8px] font-semibold text-slate-500 ml-0.5 block mb-0.5">
                        Password
                      </span>
                      <div className="h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center px-3 text-[9px] text-slate-400">
                        ••••••••
                      </div>
                    </div>
                  </div>

                  {/* Sign In */}
                  <div className="h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-orange-500/20 mb-3 relative z-10">
                    Sign In
                  </div>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center mb-2.5">
                    <div className="w-full h-px bg-slate-100"></div>
                    <span className="absolute bg-white px-2 text-[7px] text-slate-400">
                      or continue with
                    </span>
                  </div>

                  {/* Social */}
                  <div className="flex gap-2 mb-2.5">
                    <div className="flex-1 h-7 border border-slate-200 rounded-lg flex items-center justify-center gap-1 text-[9px] font-semibold text-slate-600">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </div>
                    <div className="flex-1 h-7 border border-slate-200 rounded-lg flex items-center justify-center gap-1 text-[9px] font-semibold text-slate-600">
                      <svg
                        className="w-2.5 h-2.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                      Apple
                    </div>
                  </div>

                  {/* Bottom */}
                  <p className="text-center text-[8px] text-slate-400">
                    Don't have an account?{" "}
                    <span className="font-bold text-slate-700">Sign Up</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 2: Onboarding Adaptif */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex flex-col md:flex-row-reverse items-start gap-8 md:gap-16 mb-16 md:mb-20"
            >
              {/* Right content */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></div>
                  {t("landing.step_02")}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                  {t("landing.step_02_title")}
                </h3>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md">
                  {t("landing.step_02_desc")}
                </p>
              </div>
              {/* Center dot */}
              <div className="hidden md:flex w-10 h-10 rounded-full bg-orange-500 items-center justify-center shrink-0 shadow-lg shadow-orange-500/30 z-10">
                <span className="text-white text-xs font-black">2</span>
              </div>
              {/* Left visual */}
              <div className="flex-1 md:flex md:justify-end">
                <div className="max-w-sm w-full space-y-3">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-emerald-500/30 transition-colors duration-300 group cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <FiBriefcase size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {t("landing.step_02_option_1")}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {t("landing.step_02_option_1_desc")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-violet-500/30 transition-colors duration-300 group cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <FiCompass size={18} className="text-violet-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {t("landing.step_02_option_2")}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {t("landing.step_02_option_2_desc")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 3: Main Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex flex-col md:flex-row items-start gap-8 md:gap-16 mb-16 md:mb-20"
            >
              {/* Left content */}
              <div className="flex-1 md:text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  {t("landing.step_03")}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                  {t("landing.step_03_title")}
                </h3>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md md:ml-auto">
                  {t("landing.step_03_desc")}
                </p>
              </div>
              {/* Center dot */}
              <div className="hidden md:flex w-10 h-10 rounded-full bg-emerald-500 items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 z-10">
                <span className="text-white text-xs font-black">3</span>
              </div>
              {/* Right visual - feature pills */}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  {[
                    {
                      name: t("landing.step_03_cashbook"),
                      desc: t("landing.step_03_cashbook_desc"),
                      color: "emerald",
                    },
                    {
                      name: t("landing.step_03_reports"),
                      desc: t("landing.step_03_reports_desc"),
                      color: "blue",
                    },
                    {
                      name: t("landing.step_03_forecast"),
                      desc: t("landing.step_03_forecast_desc"),
                      color: "violet",
                    },
                    {
                      name: t("landing.step_03_consult"),
                      desc: t("landing.step_03_consult_desc"),
                      color: "amber",
                    },
                  ].map((f, i) => {
                    const colors = {
                      emerald:
                        "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                      blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
                      violet:
                        "bg-violet-500/10 border-violet-500/20 text-violet-400",
                      amber:
                        "bg-amber-500/10 border-amber-500/20 text-amber-400",
                    };
                    return (
                      <div
                        key={i}
                        className={`${colors[f.color]} border rounded-xl p-4 hover:scale-[1.03] transition-transform duration-200 cursor-default`}
                      >
                        <h4 className="text-xs font-bold mb-1">{f.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {f.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Step 4: Pantau & Kembangkan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative flex flex-col md:flex-row-reverse items-start gap-8 md:gap-16"
            >
              {/* Right content */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></div>
                  {t("landing.step_04")}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                  {t("landing.step_04_title")}
                </h3>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md">
                  {t("landing.step_04_desc")}
                </p>
              </div>
              {/* Center dot */}
              <div className="hidden md:flex w-10 h-10 rounded-full bg-violet-500 items-center justify-center shrink-0 shadow-lg shadow-violet-500/30 z-10">
                <span className="text-white text-xs font-black">4</span>
              </div>
              {/* Left visual */}
              <div className="flex-1 md:flex md:justify-end">
                <div className="max-w-sm w-full space-y-3">
                  {[
                    { label: t("landing.step_04_profile_account"), desc: t("landing.step_04_profile_account_desc") },
                    { label: t("landing.step_04_profile_business"), desc: t("landing.step_04_profile_business_desc") },
                    { label: t("landing.step_04_notifications"), desc: t("landing.step_04_notifications_desc") },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-3.5 hover:border-violet-500/30 transition-colors duration-300"
                    >
                      <div className="w-2 h-2 rounded-full bg-violet-400 shrink-0"></div>
                      <div>
                        <span className="text-sm font-bold text-white">
                          {item.label}
                        </span>
                        <span className="text-xs text-slate-500 ml-2">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ADAPTIVE SOLUTIONS SECTION (Concept 2: Split-Screen Hover Expand) */}
      <section className="relative py-24 bg-[#0a0f1c] overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none"></div>

        <div className="container mx-auto max-w-7xl relative z-10 px-4 md:px-6">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight"
            >
              {t("landing.adaptive_title_1")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                {t("landing.adaptive_title_2")}
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed"
            >
              {t("landing.adaptive_desc")}
            </motion.p>
          </div>

          {/* ADAPTIVE SOLUTIONS - FLEXBOX LAYOUT */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 mt-16">
            {/* LEFT: SCROLLING TEXT BLOCKS */}
            <div className="w-full md:w-1/2 space-y-32 md:space-y-[35vh] pb-72">
              {/* TEXT BLOCK A (PERINTIS) */}
              <motion.div
                onViewportEnter={() => setHoveredPath("A")}
                viewport={{ margin: "-30% 0px -30% 0px", amount: "some" }}
                className={`transition-all duration-700 ease-out ${hoveredPath === "A" ? "opacity-100 translate-y-0" : "opacity-30 translate-y-4 blur-[1px]"}`}
              >
                <div className="inline-flex items-center gap-3 px-2.5 py-2.5 pr-6 rounded-full bg-[#0b101e] border border-indigo-500/30 text-indigo-400 font-bold text-xs uppercase tracking-widest mb-6 w-max shadow-[0_0_30px_rgba(99,102,241,0.2)] ring-1 ring-white/10 transition-all duration-300 hover:scale-105 hover:bg-indigo-900/30">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 p-2 shadow-inner">
                    <img
                      src={iconPerintis}
                      alt="Jalur Perintis"
                      className="w-full h-full object-contain drop-shadow-lg scale-110"
                    />
                  </div>
                  <span className="pt-0.5">{t("landing.path_perintis_badge")}</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-5 leading-[1.1] tracking-tight">
                  {t("landing.path_perintis_title_1")} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                    {t("landing.path_perintis_title_2")}
                  </span>
                </h3>
                <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed font-medium max-w-md">
                  {t("landing.path_perintis_desc")}
                </p>
                <div className="space-y-4">
                  {[
                    t("landing.path_perintis_item_1"),
                    t("landing.path_perintis_item_2"),
                    t("landing.path_perintis_item_3"),
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <FiCheck className="text-indigo-400" size={14} />
                      </div>
                      <p className="text-slate-300 font-medium">{feat}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* TEXT BLOCK B (PENGUSAHA) */}
              <motion.div
                onViewportEnter={() => setHoveredPath("B")}
                viewport={{ margin: "-30% 0px -30% 0px", amount: "some" }}
                className={`transition-all duration-700 ease-out ${hoveredPath === "B" ? "opacity-100 translate-y-0" : "opacity-30 translate-y-4 blur-[1px]"}`}
              >
                <div className="inline-flex items-center gap-3 px-2.5 py-2.5 pr-6 rounded-full bg-[#0b101e] border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-6 w-max shadow-[0_0_30px_rgba(16,185,129,0.2)] ring-1 ring-white/10 transition-all duration-300 hover:scale-105 hover:bg-emerald-900/30">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 p-2 shadow-inner">
                    <img
                      src={iconPengusaha}
                      alt="Jalur Pengusaha"
                      className="w-full h-full object-contain drop-shadow-lg scale-110"
                    />
                  </div>
                  <span className="pt-0.5">{t("landing.path_pengusaha_badge")}</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-5 leading-[1.1] tracking-tight">
                  {t("landing.path_pengusaha_title_1")} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    {t("landing.path_pengusaha_title_2")}
                  </span>
                </h3>
                <p className="text-slate-400 text-base md:text-lg mb-8 leading-relaxed font-medium max-w-md">
                  {t("landing.path_pengusaha_desc")}
                </p>
                <div className="space-y-4">
                  {[
                    t("landing.path_pengusaha_item_1"),
                    t("landing.path_pengusaha_item_2"),
                    t("landing.path_pengusaha_item_3"),
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <FiCheck className="text-emerald-400" size={14} />
                      </div>
                      <p className="text-slate-300 font-medium">{feat}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* RIGHT: STICKY DEVICE */}
            <div className="hidden md:flex w-full md:w-1/2 md:sticky md:top-24 md:self-start justify-center items-start">
              <div
                className={`relative w-full max-w-[280px] aspect-[9/18] rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] border-[7px] border-[#1a2333] ${hoveredPath === "A" ? "bg-[#0b1120] shadow-[0_0_60px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30 translate-y-0" : "bg-[#081218] shadow-[0_0_60px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30 translate-y-[780px]"}`}
              >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#1a2333] rounded-b-2xl z-50 flex justify-center items-end pb-1.5 gap-2">
                  <div className="w-8 h-1 rounded-full bg-black/50"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-900/50"></div>
                </div>

                {/* Glow */}
                <div
                  className={`absolute -top-16 -right-16 w-56 h-56 blur-[80px] rounded-full transition-colors duration-[1200ms] ${hoveredPath === "A" ? "bg-indigo-500/25" : "bg-emerald-500/25"}`}
                ></div>
                <div
                  className={`absolute -bottom-16 -left-16 w-56 h-56 blur-[80px] rounded-full transition-colors duration-[1200ms] ${hoveredPath === "A" ? "bg-blue-500/15" : "bg-teal-500/15"}`}
                ></div>

                {/* MOCKUP A: KUESIONER */}
                <div
                  className={`absolute inset-0 pt-14 px-5 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${hoveredPath === "A" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}`}
                >
                  <div className="flex items-center gap-2 mb-6 bg-white/5 w-max px-3 py-1.5 rounded-full border border-white/10">
                    <div className="p-1 bg-indigo-500/20 rounded-full">
                      <FiTarget className="text-indigo-400" size={12} />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-200">
                      Arta AI Profiling
                    </span>
                  </div>
                  <p className="text-white text-lg font-bold mb-6 leading-snug">
                    Berapa perkiraan
                    <br />
                    modal awal usahamu?
                  </p>
                  <div className="space-y-3 mb-auto">
                    <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600/20 to-indigo-500/5 border border-indigo-500/40 text-indigo-200 font-bold flex items-center justify-between relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400"></div>
                      <span className="text-sm">Rp 1 Jt - Rp 5 Jt</span>
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-400 flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      </div>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-slate-400 font-medium flex items-center justify-between">
                      <span className="text-sm">Rp 5 Jt - Rp 20 Jt</span>
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-slate-400 font-medium flex items-center justify-between">
                      <span className="text-sm">Di atas Rp 20 Jt</span>
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                    </div>
                  </div>
                  <button className="w-full py-3 mt-4 mb-6 bg-white text-indigo-950 font-black rounded-xl text-sm flex justify-center items-center gap-2">
                    Lanjutkan <FiArrowRight size={14} />
                  </button>
                </div>

                {/* MOCKUP B: DASHBOARD */}
                <div
                  className={`absolute inset-0 pt-14 px-5 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${hoveredPath === "B" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"}`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block"></span>{" "}
                      Digital Cashbook
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 p-[2px]">
                      <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">
                          Us
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                      <FiTrendingUp size={36} className="text-emerald-500" />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 mb-1 relative z-10">
                      Laba Bersih Mei
                    </p>
                    <p className="text-2xl font-black text-white mb-1 relative z-10">
                      Rp 4.250
                      <span className="text-slate-400 text-lg">.000</span>
                    </p>
                    <div className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold relative z-10">
                      <FiTrendingUp size={9} /> +24%
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-wider">
                    Transaksi Terbaru
                  </p>
                  <div className="space-y-2 mb-auto">
                    {[
                      {
                        label: "Invoice Client A",
                        val: "+Rp 2.400k",
                        isPos: true,
                        Icon: FiDownload,
                      },
                      {
                        label: "Bahan Baku",
                        val: "-Rp 650k",
                        isPos: false,
                        Icon: FiPackage,
                      },
                      {
                        label: "Langganan SaaS",
                        val: "-Rp 150k",
                        isPos: false,
                        Icon: FiMonitor,
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.isPos ? "bg-emerald-500/10" : "bg-rose-500/10"}`}
                        >
                          <item.Icon
                            size={13}
                            className={
                              item.isPos ? "text-emerald-400" : "text-rose-400"
                            }
                          />
                        </div>
                        <span className="text-slate-200 text-xs font-medium flex-1">
                          {item.label}
                        </span>
                        <span
                          className={`text-xs font-bold ${item.isPos ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        @keyframes shimmer {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.5; }
          50% { transform: scale(1.05) translate(-10px, 10px); opacity: 0.8; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        .animate-shimmer { animation: shimmer 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
        @keyframes spotlight {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-spotlight { animation: spotlight 2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s 1 forwards; }
        @keyframes spotlight-core {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-spotlight-core { animation: spotlight-core 2.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s 1 forwards; }
        @keyframes spotlight-secondary {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-spotlight-secondary { animation: spotlight-secondary 3s ease 1s 1 forwards; }
        @keyframes beam {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-beam { animation: beam 8s linear infinite; }
        .animate-beam-slow { animation: beam 12s linear infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 5s ease-in-out infinite; }
      `}</style>

      {/* Testimonials Section with Drifting Cards & Spotlight */}
      <section
        id="testimoni"
        onMouseMove={(e) => {
          const section = e.currentTarget;
          const rect = section.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          section.style.setProperty("--spotlight-x", `${x}px`);
          section.style.setProperty("--spotlight-y", `${y}px`);
        }}
        className="relative py-64 px-6 overflow-hidden group/testimonials"
      >
        {/* Sharpened Dot Grid Background */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:40px_40px] opacity-20"></div>

        {/* Dynamic Spotlight Layer */}
        <div
          className="absolute inset-0 z-0 opacity-0 group-hover/testimonials:opacity-100 transition-opacity duration-1000 pointer-events-none"
          style={{
            background: `radial-gradient(1000px circle at var(--spotlight-x) var(--spotlight-y), rgba(99, 102, 241, 0.08), transparent 80%)`,
          }}
        />

        {/* Noise Texture Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Drifting Draggable Cards Area (Background Layer) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          {[
            {
              name: "Maya Singh",
              role: "Product Manager",
              text: "Highly recommend to every dev. The consistency and quality are unmatched.",
              start: { top: "10%", left: "5%" },
              drift: { x: [0, 30, 0], y: [0, -20, 0] },
            },
            {
              name: "Chris Anderson",
              role: "UX Designer",
              text: "A designer's dream toolkit. Beautiful defaults with enough flexibility.",
              start: { top: "15%", left: "65%" },
              drift: { x: [0, -40, 0], y: [0, 30, 0] },
            },
            {
              name: "Alex Turner",
              role: "Fullstack Dev",
              text: "The animations are buttery smooth. Worth every penny.",
              start: { top: "55%", left: "75%" },
              drift: { x: [0, 20, 0], y: [0, -40, 0] },
            },
            {
              name: "Olivia Martinez",
              role: "Startup Founder",
              text: "Best in class components. The quality is unmatched.",
              start: { bottom: "10%", left: "12%" },
              drift: { x: [0, 40, 0], y: [0, 20, 0] },
            },
            {
              name: "Priya Patel",
              role: "Design Lead",
              text: "Saved us $50k in design costs. Achieved results faster.",
              start: { bottom: "15%", right: "30%" },
              drift: { x: [0, -30, 0], y: [0, -30, 0] },
            },
            {
              name: "David Park",
              role: "Frontend Lead",
              text: "The templates saved us months of development time.",
              start: { top: "45%", right: "8%" },
              drift: { x: [0, -20, 0], y: [0, 40, 0] },
            },
            {
              name: "Lisa Thompson",
              role: "CEO",
              text: "Aceternity UI is the competitive edge we needed.",
              start: { bottom: "35%", left: "5%" },
              drift: { x: [0, 30, 0], y: [0, -15, 0] },
            },
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              drag
              dragConstraints={{
                top: -400,
                left: -400,
                right: 400,
                bottom: 400,
              }}
              dragElastic={0.2}
              whileDrag={{ scale: 1.02, zIndex: 100 }}
              initial={{ opacity: 0, ...testimonial.start }}
              whileInView={{ opacity: 0.7 }}
              animate={{
                x: testimonial.drift.x,
                y: testimonial.drift.y,
              }}
              transition={{
                duration: 20 + i * 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-[300px] md:w-[380px] bg-[#0F172A]/40 backdrop-blur-sm border border-white/[0.05] p-6 md:p-8 rounded-[2rem] shadow-2xl cursor-grab active:cursor-grabbing hover:opacity-100 hover:border-white/10 hover:bg-[#0F172A]/60 transition-all duration-500 pointer-events-auto group/card"
            >
              <p className="text-base md:text-lg text-slate-400 leading-relaxed font-medium mb-6 group-hover/card:text-slate-200 transition-colors">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-white/10">
                  <img
                    src={`https://i.pravatar.cc/150?u=${testimonial.name}`}
                    alt={testimonial.name}
                    className="w-full h-full object-cover saturate-50 group-hover/card:saturate-100 transition-all"
                  />
                </div>
                <div>
                  <h4 className="text-sm md:text-base font-bold text-white/80 group-hover/card:text-white transition-colors">
                    {testimonial.name}
                  </h4>
                  <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="container mx-auto relative z-10 text-center pointer-events-none">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-[5rem] font-black mb-8 tracking-tighter text-white leading-[1.1]"
          >
            {t("landing.testi_title_1")} <br />
            {t("landing.testi_title_2")}
          </motion.h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg md:text-xl font-medium leading-relaxed mb-12">
            {t("landing.testi_desc")}
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => setShowReviewsModal(true)}
              className="px-10 py-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-full text-sm font-bold text-white backdrop-blur-xl transition-all pointer-events-auto"
            >
              {t("landing.testi_read_all")}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section - Shopify Style */}
      <section
        id="faq"
        className="relative py-24 md:py-32 overflow-hidden bg-[#050a18]"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/[0.03] blur-[150px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10 max-w-6xl">
          {/* Hero Header */}
          <div className="mb-16 md:mb-20 pb-12 border-b border-white/[0.06]">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
              <div className="max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5"
                >
                   <FiHelpCircle size={12} className="text-indigo-400" /> {t("landing.faq_badge")}
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight"
                >
                  {t("landing.faq_title")}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-slate-400 text-base md:text-lg leading-relaxed"
                >
                  {t("landing.faq_desc")}
                </motion.p>
              </div>
              {/* Category count */}
              <div className="hidden md:flex items-center gap-6 text-sm text-slate-500 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <span>{t("landing.faq_categories")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  <span>{t("landing.faq_questions")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Content: Sidebar + Grid */}
          {(() => {
            const faqData = [
              {
                category: t("landing.faq_cat_start"),
                questions: [
                  { q: t("landing.faq_start_q1"), a: t("landing.faq_start_a1") },
                  { q: t("landing.faq_start_q2"), a: t("landing.faq_start_a2") },
                  { q: t("landing.faq_start_q3"), a: t("landing.faq_start_a3") },
                  { q: t("landing.faq_start_q4"), a: t("landing.faq_start_a4") },
                ],
              },
              {
                category: t("landing.faq_cat_cashbook"),
                questions: [
                  { q: t("landing.faq_cashbook_q1"), a: t("landing.faq_cashbook_a1") },
                  { q: t("landing.faq_cashbook_q2"), a: t("landing.faq_cashbook_a2") },
                  { q: t("landing.faq_cashbook_q3"), a: t("landing.faq_cashbook_a3") },
                  { q: t("landing.faq_cashbook_q4"), a: t("landing.faq_cashbook_a4") },
                ],
              },
              {
                category: t("landing.faq_cat_report"),
                questions: [
                  { q: t("landing.faq_report_q1"), a: t("landing.faq_report_a1") },
                  { q: t("landing.faq_report_q2"), a: t("landing.faq_report_a2") },
                  { q: t("landing.faq_report_q3"), a: t("landing.faq_report_a3") },
                  { q: t("landing.faq_report_q4"), a: t("landing.faq_report_a4") },
                ],
              },
              {
                category: t("landing.faq_cat_ai"),
                questions: [
                  { q: t("landing.faq_ai_q1"), a: t("landing.faq_ai_a1") },
                  { q: t("landing.faq_ai_q2"), a: t("landing.faq_ai_a2") },
                  { q: t("landing.faq_ai_q3"), a: t("landing.faq_ai_a3") },
                  { q: t("landing.faq_ai_q4"), a: t("landing.faq_ai_a4") },
                ],
              },
            ];

            return (
              <div className="flex flex-col md:flex-row gap-10 md:gap-16">
                {/* Sidebar Categories */}
                <div className="md:w-56 shrink-0">
                  <div className="md:sticky md:top-28 space-y-1">
                    {faqData.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          document
                            .getElementById(`faq-cat-${idx}`)
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                        }}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
                      >
                        {cat.category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FAQ Content */}
                <div className="flex-1 space-y-16">
                  {faqData.map((cat, catIdx) => (
                    <motion.div
                      key={catIdx}
                      id={`faq-cat-${catIdx}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="scroll-mt-28"
                    >
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-8 pb-4 border-b border-white/[0.06]">
                        {cat.category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {cat.questions.map((item, qIdx) => (
                          <div key={qIdx}>
                            <h4 className="text-sm md:text-[15px] font-bold text-white mb-2 leading-snug">
                              {item.q}
                            </h4>
                            <p className="text-slate-500 text-sm leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Contact Form Grid with Details Section */}
      <section
        id="kontak"
        className="relative py-32 lg:py-40 overflow-hidden bg-[#020617]"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0B1120] to-transparent pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0B1120] to-transparent pointer-events-none z-0"></div>
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-7xl mx-auto">
            {/* Left Column - Contact Details */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              {/* Message Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-600/20"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 text-white fill-none stroke-current stroke-[1.5]"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <line x1="8" y1="9" x2="16" y2="9"></line>
                  <line x1="8" y1="13" x2="12" y2="13"></line>
                </svg>
              </motion.div>

              {/* Heading */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter leading-[1.1]">
                {t("landing.contact_title")}
              </h2>

              {/* Description */}
              <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-lg mb-10">
                {t("landing.contact_desc")}
              </p>

              {/* Contact Info Items */}
              <div className="flex flex-wrap items-center gap-x-10 gap-y-4 mb-14">
                <motion.a
                  href="mailto:contact@konsulkeu.id"
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 transition-all">
                    <FiMail size={16} className="text-indigo-400" />
                  </div>
                  <span className="text-sm font-semibold">
                    contact@konsulkeu.id
                  </span>
                </motion.a>
                <motion.a
                  href="tel:+6281234567890"
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition-all">
                    <FiPhone size={16} className="text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold">
                    +62 (812) 3456 7890
                  </span>
                </motion.a>
                <motion.a
                  href="mailto:support@konsulkeu.id"
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-500/40 transition-all">
                    <FiSend size={16} className="text-purple-400" />
                  </div>
                  <span className="text-sm font-semibold">
                    support@gmail.com
                  </span>
                </motion.a>
              </div>

              {/* Map Illustration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Deterministic Dot-Matrix World Map */}
                {(() => {
                  // 72x36 binary grid — 1=land, 0=water (Equirectangular projection)
                  const W = [
                    "000000000000000000000000000000000000000000000000000000000000000000000000",
                    "000000000000000000000000000000000000000000000000000000000000000000000000",
                    "000000000000000000000000000000000000000000000000001111100000000000000000",
                    "000001100000000000011110000000000000001100011111111111111000000000000000",
                    "000001110000011111111111000000000000011111111111111111111111000000000000",
                    "000000110000111111111111100000000000111111111111111111111111100000000000",
                    "000000010001111111111111110000000001111111111111111111111111110000000000",
                    "000000000011111111111111110000000011111111111111111111111111111000000000",
                    "000000000011111111111111100000000001111111111111011111111111111100000000",
                    "000000000001111111111111100000000000111111111100001111111111111000000000",
                    "000000000001111111111111000000000000111111111100000111111111110000000000",
                    "000000000000111111111110000000000000111111111100000111111111100000000000",
                    "000000000000011111111000000000000001111111111000000011111110000000000000",
                    "000000000000001111100000000000000001111111110000000001111100000000000000",
                    "000000000000000111000000000000000001111111100000000000111000000100000000",
                    "000000000000000111100000000000000001111111100000000000010000011100000000",
                    "000000000000001111110000000000000000111111000000000000000000111110000000",
                    "000000000000011111111000000000000000111110000000000000000000111111000000",
                    "000000000000011111111100000000000000011110000000000000000000011110000000",
                    "000000000000011111111110000000000000011100000000000000000000001000000000",
                    "000000000000001111111110000000000000001100000000000000000000000000000000",
                    "000000000000001111111100000000000000000100000000000000000000000000000000",
                    "000000000000000111111000000000000000000000000000000000000000000000000000",
                    "000000000000000111110000000000000000000000000000000000000000000000000000",
                    "000000000000000011100000000000000000000000000000000000000111100000000000",
                    "000000000000000011000000000000000000000000000000000000001111110000000000",
                    "000000000000000010000000000000000000000000000000000000011111111000000000",
                    "000000000000000010000000000000000000000000000000000000011111111000000000",
                    "000000000000000000000000000000000000000000000000000000001111110000000000",
                    "000000000000000000000000000000000000000000000000000000000111100000000000",
                    "000000000000000000000000000000000000000000000000000000000011000000000000",
                    "000000000000000000000000000000000000000000000000000000000000000000000000",
                    "000000000000000000000000000000000000000000000000000000000000000000000000",
                    "000000000000000000000000000000000000000000000000000000000000000000000000",
                    "000000000000000000000000000000000000000000000000000000000000000000000000",
                    "000000000000000000000000000000000000000000000000000000000000000000000000",
                  ];
                  const dots = [];
                  const cols = 72,
                    rows = 36;
                  const svgW = 720,
                    svgH = 360;
                  const dx = svgW / cols,
                    dy = svgH / rows;
                  for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                      if (W[r] && W[r][c] === "1") {
                        dots.push(
                          <circle
                            key={`m${r}-${c}`}
                            cx={c * dx + dx / 2}
                            cy={r * dy + dy / 2}
                            r="2"
                            fill="currentColor"
                            className="text-indigo-400/60"
                          />,
                        );
                      }
                    }
                  }
                  return (
                    <div className="relative">
                      {/* "We are here" badge — positioned over Indonesia/SE Asia */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        viewport={{ once: true }}
                        className="absolute top-[36%] left-[78%] z-20 -translate-x-1/2"
                      >
                        <div className="relative">
                          <div className="bg-white/90 text-[10px] font-black text-slate-900 px-3 py-1.5 rounded-lg shadow-xl border border-white/20 whitespace-nowrap">
                            We are here
                          </div>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/90 rotate-45"></div>
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center">
                          <div className="w-3 h-3 bg-emerald-400 rounded-full z-10 relative shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
                          <div className="absolute w-6 h-6 bg-emerald-400/30 rounded-full animate-ping"></div>
                        </div>
                      </motion.div>

                      {/* The Dot-Matrix Map */}
                      <svg
                        viewBox={`0 0 ${svgW} ${svgH}`}
                        className="w-full h-auto opacity-40"
                      >
                        {dots}
                      </svg>

                      {/* Connecting lines from location */}
                      <div className="absolute inset-0 pointer-events-none">
                        <svg
                          viewBox={`0 0 ${svgW} ${svgH}`}
                          className="w-full h-full"
                        >
                          <motion.line
                            x1="570"
                            y1="160"
                            x2="350"
                            y2="100"
                            stroke="rgba(99,102,241,0.15)"
                            strokeWidth="0.8"
                            strokeDasharray="4 4"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 1 }}
                          />
                          <motion.line
                            x1="570"
                            y1="160"
                            x2="160"
                            y2="120"
                            stroke="rgba(99,102,241,0.15)"
                            strokeWidth="0.8"
                            strokeDasharray="4 4"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 1.3 }}
                          />
                          <motion.line
                            x1="570"
                            y1="160"
                            x2="610"
                            y2="270"
                            stroke="rgba(16,185,129,0.15)"
                            strokeWidth="0.8"
                            strokeDasharray="4 4"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 1.5 }}
                          />
                          {/* Glowing dots at connection endpoints */}
                          <circle
                            cx="350"
                            cy="100"
                            r="3"
                            fill="rgba(99,102,241,0.3)"
                          />
                          <circle
                            cx="160"
                            cy="120"
                            r="3"
                            fill="rgba(99,102,241,0.3)"
                          />
                          <circle
                            cx="610"
                            cy="270"
                            r="3"
                            fill="rgba(16,185,129,0.3)"
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </motion.div>

            {/* Right Column - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Handle form submission
                  const formData = new FormData(e.target);
                  console.log(
                    "Contact form submitted:",
                    Object.fromEntries(formData),
                  );
                }}
                className="space-y-6"
              >
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="contact-fullname"
                    className="block text-sm font-bold text-white mb-2.5"
                  >
                    {t("landing.contact_form_name")}
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      id="contact-fullname"
                      name="fullname"
                      placeholder={t("landing.contact_form_name_placeholder")}
                      className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/[0.08] focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 backdrop-blur-sm shadow-inner focus:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-bold text-white mb-2.5"
                  >
                    {t("landing.contact_form_email")}
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      placeholder={t("landing.contact_form_email_placeholder")}
                      className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/[0.08] focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 backdrop-blur-sm shadow-inner focus:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label
                    htmlFor="contact-company"
                    className="block text-sm font-bold text-white mb-2.5"
                  >
                    {t("landing.contact_form_company")}
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      id="contact-company"
                      name="company"
                      placeholder={t("landing.contact_form_company_placeholder")}
                      className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/[0.08] focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 backdrop-blur-sm shadow-inner focus:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-bold text-white mb-2.5"
                  >
                    {t("landing.contact_form_message")}
                  </label>
                  <div className="relative group">
                    <textarea
                      id="contact-message"
                      name="message"
                      rows="5"
                      placeholder={t("landing.contact_form_message_placeholder")}
                      className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05] border border-white/[0.08] focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 backdrop-blur-sm shadow-inner resize-none focus:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                    ></textarea>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseMove={(e) => {
                    const btn = e.currentTarget;
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    btn.style.setProperty("--btn-x", `${x}px`);
                    btn.style.setProperty("--btn-y", `${y}px`);
                  }}
                  className="relative w-full overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-4 rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-600/20 border border-white/10 group"
                >
                  {/* Cursor Glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle 100px at var(--btn-x) var(--btn-y), rgba(255,255,255,0.15), transparent)`,
                    }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {t("landing.contact_form_submit")}
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 fill-none stroke-current stroke-2 group-hover:translate-x-1 transition-transform"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </span>
                </motion.button>

                {/* Bottom note */}
                <p className="text-center text-xs text-slate-600 font-medium pt-2">
                  {t("landing.contact_form_note")}
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full Testimonials Modal */}
      <AnimatePresence>
        {showReviewsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl max-h-[90vh] bg-[#0F172A] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-8 md:p-12 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
                <div>
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-2">
                    {t("landing.testi_modal_title")}
                  </h3>
                  <p className="text-slate-500 font-medium">
                    {t("landing.testi_modal_subtitle")}
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewsModal(false)}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all group"
                >
                  <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">
                    ✕
                  </span>
                </button>
              </div>

              {/* Modal Content - Scrollable Grid */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((t, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] hover:bg-white/[0.04] transition-colors"
                    >
                      <p className="text-slate-300 leading-relaxed mb-6 italic text-sm md:text-base">
                        "{t.text}"
                      </p>
                      <div className="flex items-center gap-4">
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-10 h-10 rounded-full border border-white/10"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {t.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            {t.role}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Modal Footer Overlay for Gradient Scroll */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0F172A] to-transparent pointer-events-none"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Big Text Footer Section */}
      <footer className="relative bg-[#020617] pt-32 pb-8 overflow-hidden border-t border-white/5">
        {/* Subtle background glow for footer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">
            {/* Column 1: Brand & Description (Takes up more space) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-5 pr-0 lg:pr-12">
              <div className="flex items-center mb-8 relative group w-max cursor-pointer">
                <div className="absolute inset-0 bg-indigo-500/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                <img
                  src={logo2Img}
                  alt="Artha Logo"
                  className="h-12 md:h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-300 relative z-10"
                />
              </div>
              <p className="text-slate-400 font-medium leading-relaxed mb-8 text-base md:text-lg max-w-md">
                {t("landing.footer_desc")}
              </p>

              {/* Social Media Links */}
              <div className="flex gap-4">
                {[
                  { name: "Twitter", icon: <FaTwitter size={18} /> },
                  { name: "LinkedIn", icon: <FaLinkedin size={18} /> },
                  { name: "Instagram", icon: <FaInstagram size={18} /> },
                  { name: "YouTube", icon: <FaYoutube size={18} /> }
                ].map(
                  (social) => (
                    <a
                      key={social.name}
                      href="#"
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      {social.icon}
                    </a>
                  ),
                )}
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div className="col-span-1 lg:col-span-2 lg:col-start-7">
              <h4 className="text-white font-bold mb-6 tracking-wide">
                {t("landing.footer_platform")}
              </h4>
              <ul className="space-y-4 flex flex-col items-start">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Perusahaan Links */}
            <div className="col-span-1 lg:col-span-2">
              <h4 className="text-white font-bold mb-6 tracking-wide">
                {t("landing.footer_company")}
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                  >
                    {t("landing.footer_tentang")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                  >
                    {t("landing.footer_karir")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                  >
                    {t("landing.footer_blog")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                  >
                    {t("landing.footer_hubungi")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal Links */}
            <div className="col-span-1 lg:col-span-2">
              <h4 className="text-white font-bold mb-6 tracking-wide">{t("landing.footer_legal")}</h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                  >
                    {t("landing.footer_syarat")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                  >
                    {t("landing.footer_privacy")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                  >
                    {t("landing.footer_keamanan")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Big Text "ARTHA" at the bottom */}
        <div className="w-full flex justify-center items-end overflow-hidden pointer-events-none mt-10 border-b border-white/[0.03] pb-4 px-4 relative">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-[18vw] md:text-[22vw] font-black leading-[0.75] tracking-tighter text-transparent bg-clip-text select-none text-center"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.01))",
              WebkitTextStroke: "1px rgba(255,255,255,0.05)",
            }}
          >
            ARTA
          </motion.h1>

          {/* Subtle gradient overlay at the bottom of the text to blend it with the background */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#020617] to-transparent"></div>
        </div>

        {/* Copyright */}
        <div className="container mx-auto px-6 lg:px-12 pt-8 text-center relative z-10">
          <p className="text-slate-500 text-sm font-medium">
            {new Date().getFullYear()} &copy; {t("landing.footer_copyright")}
          </p>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Landing;
