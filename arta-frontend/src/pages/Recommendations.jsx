import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import api from "../services/api";
import {
  FiArrowLeft,
  FiRefreshCcw,
  FiArrowRight,
  FiAlertTriangle,
} from "react-icons/fi";
import { IconFileDownload, IconChartDots3 } from "@tabler/icons-react";

const EDUCATION_OPTIONS = [
  { value: "SD", labelKey: "recommendations.edu_sd" },
  { value: "SMP", labelKey: "recommendations.edu_smp" },
  { value: "SMA/SMK", labelKey: "recommendations.edu_sma" },
  { value: "Diploma", labelKey: "recommendations.edu_diploma" },
  { value: "Sarjana", labelKey: "recommendations.edu_sarjana" },
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

const RADIO_YA_TIDAK = (t) => [
  { value: "Ya", label: t("recommendations.q11_yes") },
  { value: "Tidak", label: t("recommendations.q11_no") },
];

const RADIO_PERNAH = (t) => [
  { value: "Pernah", label: t("recommendations.q4_yes") },
  { value: "Tidak Pernah", label: t("recommendations.q4_no") },
];

const RADIO_MEMADAI = (t) => [
  { value: "Memadai", label: t("recommendations.q5_yes") },
  { value: "Tidak Memadai", label: t("recommendations.q5_no") },
];

const RADIO_BAIK = (t) => [
  { value: "Baik", label: t("recommendations.q6_yes") },
  { value: "Buruk", label: t("recommendations.q6_no") },
];

const RADIO_ADA = (t) => [
  { value: "Ada", label: t("recommendations.q7_yes") },
  { value: "Tidak Ada", label: t("recommendations.q7_no") },
];

const RADIO_GENDER = (t) => [
  { value: "Laki-laki", label: t("recommendations.q3_male") },
  { value: "Perempuan", label: t("recommendations.q3_female") },
];

/* ─── Sub Components ─── */

const NumberField = ({ label, desc, value, onChange, min, max, unit }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
    <label className="block text-base font-medium text-slate-800 mb-2">
      {label} <span className="text-red-500">*</span>
    </label>
    {desc && <p className="text-sm text-slate-500 mb-4">{desc}</p>}
    <div className="flex items-center gap-3 sm:w-1/2">
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-2 border-b border-slate-300 focus:border-indigo-600 outline-none text-slate-800 transition-colors bg-transparent"
        placeholder="0"
      />
      {unit && <span className="text-slate-500 shrink-0">{unit}</span>}
    </div>
  </div>
);

const SelectField = ({ label, desc, value, onChange, options, placeholder }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
      <label className="block text-base font-medium text-slate-800 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      {desc && <p className="text-sm text-slate-500 mb-4">{desc}</p>}
      <div className="relative sm:w-1/2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full py-2.5 pr-8 border-b border-slate-300 focus:border-indigo-600 outline-none text-slate-800 transition-colors bg-transparent appearance-none cursor-pointer"
        >
          <option value="">{placeholder || "Pilih"}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey) || opt.value}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const RadioField = ({ label, desc, name, value, onChange, options }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
    <label className="block text-base font-medium text-slate-800 mb-2">
      {label} <span className="text-red-500">*</span>
    </label>
    {desc && <p className="text-sm text-slate-500 mb-4">{desc}</p>}
    <div className="flex flex-wrap gap-6 mt-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="appearance-none w-5 h-5 border-2 border-slate-400 rounded-full checked:border-indigo-600 transition-colors cursor-pointer group-hover:border-indigo-400"
            />
            {value === opt.value && (
              <div className="absolute w-2.5 h-2.5 bg-indigo-600 rounded-full pointer-events-none" />
            )}
          </div>
          <span className="text-slate-700 font-normal leading-none text-sm">
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  </div>
);

const SliderField = ({ label, desc, value, onChange, min, max, marks }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
    <label className="block text-base font-medium text-slate-800 mb-2">
      {label} <span className="text-red-500">*</span>
    </label>
    {desc && <p className="text-sm text-slate-500 mb-4">{desc}</p>}
    <div className="sm:w-2/3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{min}</span>
        <span className="text-lg font-bold text-indigo-600">{value}</span>
        <span className="text-xs text-slate-400">{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
      />
      {marks && (
        <div className="flex justify-between mt-1">
          {marks.map((m) => (
            <span key={m} className="text-[10px] text-slate-400">{m}</span>
          ))}
        </div>
      )}
    </div>
  </div>
);

/* ─── Custom Icons ─── */
const IconSpark = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L14.5 9.5L21 12L14.5 14.5L12 21L9.5 14.5L3 12L9.5 9.5Z" />
    <circle cx="19" cy="5" r="2" fill="currentColor" stroke="none" opacity="0.5" />
  </svg>
);

const IconShield = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L20 5V11C20 16.5 16.5 20.5 12 22C7.5 20.5 4 16.5 4 11V5L12 2Z" />
    <path d="M9 12L11 14L15 10" />
  </svg>
);

const IconOctagon = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.86 2H16.14L22 7.86V16.14L16.14 22H7.86L2 16.14V7.86L7.86 2Z" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconCrosshair = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const IconRise = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 6L16.5 12.5L12 8L6.5 13.5" />
    <path d="M17 6H23V12" />
    <path d="M6.5 13.5L1 19" />
  </svg>
);

const IconFall = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 18L16.5 11.5L12 16L6.5 10.5" />
    <path d="M17 18H23V12" />
    <path d="M6.5 10.5L1 5" />
  </svg>
);

const IconBars = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="14" width="4" height="7" rx="1.5" />
    <rect x="10" y="9" width="4" height="12" rx="1.5" />
    <rect x="17" y="4" width="4" height="17" rx="1.5" />
  </svg>
);

const IconBag = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="3" />
    <path d="M8 7V5C8 3.5 9 2 12 2C15 2 16 3.5 16 5V7" />
    <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" />
    <path d="M9 17C9 17 10 18 12 18C14 18 15 17 15 17" />
  </svg>
);

const SparklineMini = ({ direction = "up" }) => {
  const id = direction === "up" ? "spark-up" : "spark-down";
  const p1 = direction === "up" ? "M0 8 Q4 2, 8 6 T16 3" : "M0 3 Q4 8, 8 4 T16 8";
  const stroke = direction === "up" ? "#10b981" : "#ef4444";
  const fill = direction === "up" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)";
  return (
    <svg width="40" height="14" viewBox="0 0 20 10" className="shrink-0">
      <defs>
        <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${p1} L16 10 L0 10 Z`} fill={`url(#${id}-grad)`} />
      <path d={p1} fill="none" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── Main Component ─── */
const Recommendations = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language?.toLowerCase() || "id";
  const resultsRef = useRef(null);
  const profileData = JSON.parse(localStorage.getItem("profile") || "{}");
  const userName = profileData?.nama_lengkap || profileData?.name || "Pengguna";
  const reportId = `ARTA-FB-${Date.now().toString(36).toUpperCase()}`;

  const [phase, setPhase] = useState(2);
  const [formData, setFormData] = useState({
    usia: "",
    pendidikan: "",
    jenis_kelamin: "",
    pengalaman_orang_tua: "",
    modal_awal: "",
    pencatatan_keuangan: "",
    rencana_bisnis: "",
    kemitraan: "",
    pengalaman_industri: "",
    upaya_pemasaran: 5,
    penggunaan_internet: "",
    konsultasi_profesional: 4,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState({ nama_usaha: "", tipe_usaha: "" });
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [upgradeErr, setUpgradeErr] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleSavePdf = async () => {
    setPdfLoading(true);
    try {
      if (!result) return;
      const { default: jsPDF } = await import("jspdf");

      // ── Load logo ──
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      const logoData = await new Promise((resolve) => {
        logoImg.onload = () => {
          const c = document.createElement("canvas");
          c.width = logoImg.naturalWidth;
          c.height = logoImg.naturalHeight;
          c.getContext("2d").drawImage(logoImg, 0, 0);
          resolve(c.toDataURL("image/png"));
        };
        logoImg.onerror = () => resolve(null);
        logoImg.src = "/fix-logo-2.png";
      });

      // ── Data ──
      const dateObj = new Date();
      const dateStr = dateObj.toLocaleDateString("id-ID", {
        year: "numeric", month: "long", day: "numeric",
      });
      const timeStr = dateObj.toLocaleTimeString("id-ID", {
        hour: "2-digit", minute: "2-digit",
      });
      const reportId = "ARTA-FB-" + Date.now().toString(36).toUpperCase();
      const profileData = JSON.parse(localStorage.getItem("profile") || "{}");
      const userName = profileData?.nama_lengkap || profileData?.name || "";
      const userEmail = profileData?.email || "";

      const {
        label,
        probability_success = 0,
        confidence = "Rendah",
      } = result;

      const pct = Math.round(probability_success * 100);
      const isHigh = pct >= 70;
      const isMedium = pct >= 40;
      const isConfHigh = confidence === "Tinggi" || confidence === "High";
      const statusLabel = label
        ? label
        : isHigh
          ? (lang === "id" ? "LAYAK" : "FEASIBLE")
          : (lang === "id" ? "BUTUH PENYESUAIAN" : "NEEDS ADJUSTMENT");

      const analysis = (result.ai_analysis) || {};
      const summary = analysis.summary || "";
      const strengths = analysis.strengths || [];
      const weaknesses = analysis.weaknesses || [];
      const recommendations = analysis.recommendations || [];
      const topPositive = (result.shap?.top_positive_factors) || [];
      const topNegative = (result.shap?.top_negative_factors) || [];

      const disclaimerText = lang === "id"
        ? "Laporan AI Arta ini bersifat indikatif dan ditujukan sebagai referensi, bukan jaminan keberhasilan bisnis atau saran keuangan yang mengikat. Segala keputusan akhir berada di tangan Anda."
        : "This Arta AI report is indicative and intended as a reference, not a guarantee of business success or binding financial advice. All final decisions rest with you.";

      // ── Labels ──
      const L = (id, en) => lang === "id" ? id : en;
      const titleText = L("Laporan Hasil Uji Kelayakan Bisnis", "Business Feasibility Report");
      const idLabel = L("ID Laporan", "Report ID");
      const dateLabel = L("Tanggal", "Date");
      const nameLabel = L("Nama", "Name");
      const emailLabel = L("Email", "Email");
      const probLabel = L("Probabilitas Keberhasilan", "Success Probability");
      const confLabel = L("Keyakinan", "Confidence");
      const summaryTitle = L("Ringkasan Analisis AI", "AI Analysis Summary");
      const strengthsTitle = L("Kekuatan", "Strengths");
      const weaknessesTitle = L("Kelemahan", "Weaknesses");
      const recTitle = L("Rekomendasi Tindakan", "Action Recommendations");
      const factorsTitle = L("Faktor Penentu Kelayakan", "Key Feasibility Factors");
      const positiveLabel = L("Positif", "Positive");
      const negativeLabel = L("Negatif", "Negative");
      const discTitle = L("Penyangkalan (Disclaimer)", "Disclaimer");
      const contactLabel = L("Hubungi Kami", "Contact Us");
      const tagline = L("Solusi Analisis Kelayakan Bisnis Berbasis AI", "AI-Powered Business Feasibility Analysis");

      // ── Colors ──
      const rgb = (hex) => {
        const v = parseInt(hex.slice(1), 16);
        return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
      };
      const C_WHITE = [255, 255, 255];
      const C_INDIGO = rgb("#4f46e5");
      const C_INDIGO_LIGHT = rgb("#e0e7ff");
      const C_DARK = rgb("#1e293b");
      const C_BODY = rgb("#475569");
      const C_MUTED = rgb("#94a3b8");
      const C_BORDER = rgb("#e2e8f0");
      const C_GREEN = rgb("#10b981");
      const C_GREEN_BG = rgb("#d1fae5");
      const C_AMBER = rgb("#f59e0b");
      const C_AMBER_BG = rgb("#fef3c7");
      const C_RED = rgb("#ef4444");
      const C_RED_BG = rgb("#fee2e2");
      const statusColor = isHigh ? C_GREEN : isMedium ? C_AMBER : C_RED;
      const statusBg = isHigh ? C_GREEN_BG : isMedium ? C_AMBER_BG : C_RED_BG;

      // ── PDF Setup ──
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = 210;
      const pageH = 297;
      const ml = 20;
      const mr = 20;
      const cw = pageW - ml - mr;
      let y = 0;

      const checkPage = (need = 20) => {
        if (y + need > pageH - 30) {
          pdf.addPage();
          y = 25;
        }
      };

      const sectionTitle = (title, color = C_INDIGO, lineWidth = 30) => {
        checkPage(20);
        y += 6;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(...C_DARK);
        pdf.text(title, ml, y); y += 2.5;
        pdf.setDrawColor(...color);
        pdf.setLineWidth(0.5);
        pdf.line(ml, y, ml + lineWidth, y); y += 7;
      };

      const wrapText = (text, indent = 0, size = 9, color = C_BODY, maxW = cw) => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(...color);
        const lines = pdf.splitTextToSize(text, maxW - indent);
        for (const line of lines) {
          checkPage(5);
          pdf.text(line, ml + indent, y);
          y += 4.5;
        }
      };

      // ── HEADER BAR (0–55mm) ──
      const barH = 55;
      pdf.setFillColor(...C_INDIGO);
      pdf.rect(0, 0, pageW, barH, "F");
      // decorative accent stripe
      pdf.setFillColor(99, 102, 241); // indigo-500
      pdf.rect(0, barH - 3, pageW, 3, "F");

      if (logoData) pdf.addImage(logoData, "PNG", ml, 10, 16, 16);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(...C_WHITE);
      pdf.text("ARTA", ml + 20, 24);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(165, 180, 252); // indigo-300
      pdf.text(tagline, ml + 20, 33);

      // Right side: report title + subtitle
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(...C_WHITE);
      pdf.text(titleText, pageW - mr, 22, { align: "right" });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(199, 210, 254);
      const subtitle = L("Dibuat pada", "Generated on") + " " + dateStr;
      pdf.text(subtitle, pageW - mr, 32, { align: "right" });

      // Contact strip below header
      y = barH + 8;
      pdf.setFillColor(248, 250, 252);
      pdf.rect(ml, y - 4, cw, 8, "F");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(...C_MUTED);
      const contactInfo = "arta.ai  |  hello@arta.ai  |  +62 812-3456-7890";
      pdf.text(contactInfo, ml + 4, y + 1);
      pdf.text(L("Laporan ini digenerate secara otomatis oleh sistem ARTA", "This report was automatically generated by ARTA"), pageW - mr - 4, y + 1, { align: "right" });
      y += 12;

      // ── INFO ROW (two-column) ──
      pdf.setDrawColor(...C_BORDER);
      pdf.setLineWidth(0.3);
      pdf.line(ml, y, pageW - mr, y); y += 5;

      const colMid = ml + cw / 2;
      pdf.setFontSize(8);
      const leftInfo = [
        [idLabel, reportId],
        [dateLabel, `${dateStr} | ${timeStr}`],
      ];
      if (userName) leftInfo.push([nameLabel, userName]);
      if (userEmail) leftInfo.push([emailLabel, userEmail]);
      let leftY = y;
      for (const [l, v] of leftInfo) {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...C_BODY);
        pdf.text(l + ":", ml, leftY);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...C_DARK);
        pdf.text(v, ml + 28, leftY);
        leftY += 4.5;
      }

      y = leftY + 2;
      pdf.setDrawColor(...C_BORDER);
      pdf.setLineWidth(0.3);
      pdf.line(ml, y, pageW - mr, y); y += 8;

      // ── SCORE CARD ──
      checkPage(55);
      // Background card
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(...C_BORDER);
      pdf.roundedRect(ml, y - 3, cw, 42, 4, 4, "FD");

      // Left: status label (large)
      // Status badge background
      const badgeW = 40;
      const badgeH = 18;
      pdf.setFillColor(...statusColor);
      pdf.roundedRect(ml + 4, y + 2, badgeW, badgeH, 3, 3, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(...C_WHITE);
      pdf.text(statusLabel, ml + 4 + badgeW / 2, y + 14, { align: "center" });

      // Percentage
      const pctX = ml + 58;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(...C_DARK);
      pdf.text(`${pct}%`, pctX, y + 14);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(...C_BODY);
      pdf.text(probLabel, pctX, y + 23);

      // Progress bar
      const barX = ml + 4;
      const barY = y + 26;
      const barW = cw - 8;
      const barHght = 8;
      pdf.setFillColor(226, 232, 240);
      pdf.roundedRect(barX, barY, barW, barHght, 4, 4, "F");
      const fillW = Math.max(8, (pct / 100) * barW);
      pdf.setFillColor(...statusColor);
      pdf.roundedRect(barX, barY, fillW, barHght, 4, 4, "F");

      // Confidence badge (right side)
      const confBadgeX = pageW - mr - 38;
      pdf.setFillColor(...(isConfHigh ? C_GREEN_BG : C_AMBER_BG));
      pdf.setDrawColor(...(isConfHigh ? C_GREEN : C_AMBER));
      pdf.roundedRect(confBadgeX, y + 3, 34, 14, 3, 3, "FD");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.setTextColor(...(isConfHigh ? C_GREEN : C_AMBER));
      const confVal = isConfHigh ? L("Keyakinan Tinggi", "High Confidence") : L("Keyakinan Rendah", "Low Confidence");
      pdf.text(confVal, confBadgeX + 17, y + 12, { align: "center" });

      y += 47;

      // ── KEY FACTORS SECTION ──
      if (topPositive.length || topNegative.length) {
        sectionTitle(factorsTitle, C_DARK, 35);

        const colW = (cw - 4) / 2;
        const fy = y;

        const drawFactorItem = (x, isPos, items) => {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8);
          pdf.setTextColor(...C_DARK);
          pdf.text(isPos ? "[+] " + positiveLabel : "[-] " + negativeLabel, x, fy);
          let iy = fy;
          for (const f of items.slice(0, 3)) {
            iy += 5;
            checkPage(5);
            const name = f.display_name || f;
            const pct = f.impact_pct != null ? f.impact_pct.toFixed(1) + "%" : "";
            const line = isPos ? name + "  +" + pct : name + "  " + pct;
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(7.5);
            pdf.setTextColor(...C_BODY);
            pdf.text(line, x + 3, iy);
          }
          return iy;
        };

        let posEnd = fy;
        if (topPositive.length) posEnd = drawFactorItem(ml, true, topPositive);
        let negEnd = fy;
        if (topNegative.length) negEnd = drawFactorItem(ml + colW + 4, false, topNegative);

        y = Math.max(posEnd, negEnd) + 8;
      }

      // ── Summary ──
      if (summary) {
        sectionTitle(summaryTitle, C_INDIGO, 35);
        wrapText(summary, 2);
      }

      // ── Strengths ──
      if (strengths.length) {
        sectionTitle(strengthsTitle, C_GREEN, 30);
        for (const s of strengths) {
          checkPage(12);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
          pdf.setTextColor(...C_GREEN);
          const lines = pdf.splitTextToSize(s, cw - 10);
          // Bullet indicator
          pdf.text("\u2022", ml, y + 1);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...C_DARK);
          pdf.text(lines, ml + 5, y);
          y += lines.length * 4.5 + 3;
        }
      }

      // ── Weaknesses ──
      if (weaknesses.length) {
        sectionTitle(weaknessesTitle, C_RED, 30);
        for (const w of weaknesses) {
          checkPage(12);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
          pdf.setTextColor(...C_RED);
          const lines = pdf.splitTextToSize(w, cw - 10);
          pdf.text("\u2022", ml, y + 1);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(...C_DARK);
          pdf.text(lines, ml + 5, y);
          y += lines.length * 4.5 + 3;
        }
      }

      // ── Recommendations ──
      if (recommendations.length) {
        sectionTitle(recTitle, C_INDIGO, 35);
        for (let i = 0; i < recommendations.length; i++) {
          checkPage(12);
          const num = `${String(i + 1).padStart(2, "0")}.`;
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8);
          pdf.setTextColor(...C_INDIGO);
          pdf.text(num, ml, y + 1);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(...C_DARK);
          const lines = pdf.splitTextToSize(recommendations[i], cw - 12);
          pdf.text(lines, ml + 8, y);
          y += lines.length * 4.5 + 3;
        }
      }

      // ── DISCLAIMER (fixed bottom) ──
      const discTop = pageH - 52;
      if (y + 15 > discTop) {
        pdf.addPage();
        y = 25;
      }
      y = Math.max(y + 10, discTop);

      // Separator line
      pdf.setDrawColor(199, 210, 254);
      pdf.setLineWidth(0.6);
      pdf.line(ml, y, pageW - mr, y); y += 6;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.setTextColor(...C_INDIGO);
      pdf.text(discTitle, ml, y); y += 4;

      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(6.5);
      pdf.setTextColor(...C_MUTED);
      const dl = pdf.splitTextToSize(disclaimerText, cw);
      pdf.text(dl, ml, y);

      // Bottom contact bar
      const bottomBarY = pageH - 12;
      pdf.setFillColor(248, 250, 252);
      pdf.rect(ml, bottomBarY - 3, cw, 10, "F");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      pdf.setTextColor(148, 163, 184);
      pdf.text("ARTA  |  arta.ai  |  hello@arta.ai", ml + 3, bottomBarY + 2);

      // Page numbers
      for (let i = 0; i < pdf.internal.getNumberOfPages(); i++) {
        pdf.setPage(i + 1);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);
        pdf.setTextColor(148, 163, 184);
        const pg = `${i + 1} / ${pdf.internal.getNumberOfPages()}`;
        pdf.text(pg, pageW - mr - 3, bottomBarY + 2, { align: "right" });
      }

      pdf.save("laporan-kelayakan-bisnis-arta.pdf");
    } catch (err) {
      console.error("PDF error:", err);
      alert(lang === "id" ? "Gagal membuat PDF: " + err.message : "Failed to generate PDF: " + err.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const updateField = (key, val) => {
    setFormData((p) => ({ ...p, [key]: val }));
    if (error) setError("");
  };

  const isFormValid = () => {
    const { usia, pendidikan, jenis_kelamin, pengalaman_orang_tua, modal_awal,
      pencatatan_keuangan, rencana_bisnis, kemitraan, pengalaman_industri,
      upaya_pemasaran, penggunaan_internet, konsultasi_profesional } = formData;
    return (
      usia !== "" && Number(usia) > 0 &&
      pendidikan !== "" &&
      jenis_kelamin !== "" &&
      pengalaman_orang_tua !== "" &&
      modal_awal !== "" &&
      pencatatan_keuangan !== "" &&
      rencana_bisnis !== "" &&
      kemitraan !== "" &&
      pengalaman_industri !== "" &&
      upaya_pemasaran >= 1 &&
      penggunaan_internet !== "" &&
      konsultasi_profesional >= 1
    );
  };

  const encodePayload = () => {
    const educationMap = {
      "SD": 1, "SMP": 2, "SMA/SMK": 3, "Diploma": 4, "Sarjana": 5,
    };
    const b = (val) => (val === "Ya" || val === "Pernah" || val === "Memadai" || val === "Baik" || val === "Ada" ? 1 : 0);

    return {
      Age: Number(formData.usia),
      Education: educationMap[formData.pendidikan] || 3,
      Initial_Capital: b(formData.modal_awal),
      Financial_Record_Keeping: b(formData.pencatatan_keuangan),
      Internet_Usage: b(formData.penggunaan_internet),
      Business_Plan: b(formData.rencana_bisnis),
      Marketing_Effort: Number(formData.upaya_pemasaran),
      Partnership: b(formData.kemitraan),
      Parent_Business_Experience: b(formData.pengalaman_orang_tua),
      Industry_Experience: Number(formData.pengalaman_industri) || 0,
      Owner_Gender: formData.jenis_kelamin === "Laki-laki" ? 1 : 0,
      Professional_Advice: Number(formData.konsultasi_profesional) || 1,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError(t("recommendations.fill_all_warning"));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setPhase(3);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const payload = encodePayload();
      const res = await api.post("/api/feasibility-tests", payload);

      // Unwrap response at multiple possible nesting levels
      const raw = res.data;
      let data = raw?.data?.data || raw?.data || raw;
      // If still wrapped, try common container keys
      if (data && typeof data === "object" && !data.prediction) {
        for (const k of ["result", "response", "feasibility", "ai_prediction"]) {
          if (data[k] && typeof data[k] === "object") {
            data = data[k];
            break;
          }
        }
      }
      // If data has the expected fields inside a nested block, flatten it
      if (data && data.prediction !== undefined && data.probability_success !== undefined) {
        // Already correct shape
      } else if (data && data.prediction === undefined && data.data) {
        data = data.data;
      }

      setResult(data);
      console.log("[Feasibility] Raw response:", raw);
      console.log("[Feasibility] Saved data:", raw?.saved_data);
      console.log("[Feasibility] ML input used:", raw?.ai_input_used);
      console.log("[Feasibility] Data extracted:", data);
      setPhase(4);
    } catch (err) {
      console.error("[Feasibility Error]", err.response?.data || err.message);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || "";
      setError(
        serverMsg ||
          (lang === "id"
            ? "Gagal menghubungi server AI. Silakan coba lagi nanti."
            : "Failed to reach AI server. Please try again later.")
      );
      setPhase(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const resetForm = () => {
    setFormData({
      usia: "", pendidikan: "", jenis_kelamin: "", pengalaman_orang_tua: "",
      modal_awal: "", pencatatan_keuangan: "", rencana_bisnis: "", kemitraan: "",
      pengalaman_industri: "", upaya_pemasaran: 5, penggunaan_internet: "",
      konsultasi_profesional: 4,
    });
    setResult(null);
    setError("");
    setPhase(2);
  };

  const handleUpgrade = async (e) => {
    e.preventDefault();
    if (!upgradeForm.nama_usaha.trim() || !upgradeForm.tipe_usaha) {
      setUpgradeErr(lang === "id" ? "Harap isi nama dan kategori usaha." : "Please fill in business name and category.");
      return;
    }
    setUpgradeLoading(true);
    setUpgradeErr("");
    try {
      const res = await api.post("/api/profile/upgrade", {
        nama_usaha: upgradeForm.nama_usaha.trim(),
        tipe_usaha: upgradeForm.tipe_usaha,
      });
      const profileData = res?.data?.data?.profile;
      if (profileData) {
        localStorage.setItem("profile", JSON.stringify(profileData));
      }
      setUpgradeSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "";
      setUpgradeErr(msg || (lang === "id"
        ? "Gagal mengaktifkan usaha. Silakan coba lagi."
        : "Failed to activate business. Please try again."));
    } finally {
      setUpgradeLoading(false);
    }
  };

  const sectionHeader = (title, gradient) => (
    <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
      <div className={`w-1.5 h-7 rounded-full ${gradient}`}></div>
      <h3 className="font-bold text-slate-800 text-base">{title}</h3>
    </div>
  );

  /* ─── PHASE 2 (QUESTIONNAIRE) ─── */
  if (phase === 2) {
    return (
      <div className="max-w-3xl mx-auto pb-20 animate-fade-in mt-4 font-sans bg-slate-50/50 p-2 sm:p-0 min-h-screen">
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FiArrowLeft /> {t("recommendations.back")}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
          <div className="h-3 bg-gradient-to-r from-indigo-600 to-indigo-700 w-full" />
          <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              {t("recommendations.questionnaire_title")}
            </h1>
            <p className="text-slate-600">
              {t("recommendations.questionnaire_desc")}
            </p>
            <hr className="my-6 border-slate-200" />
            <p className="text-sm text-red-500">* {lang === "id" ? "Menunjukkan pertanyaan yang wajib diisi" : "Indicates required questions"}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-sm shadow-sm">
            <FiAlertTriangle className="shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section A */}
          {sectionHeader(t("recommendations.section_a"), "bg-gradient-to-r from-indigo-600 to-indigo-500")}

          <NumberField
            label={t("recommendations.q1_label")}
            desc={t("recommendations.q1_desc")}
            value={formData.usia}
            onChange={(v) => updateField("usia", v)}
            min={15} max={100} unit={lang === "id" ? "Tahun" : "Years"}
          />
          <SelectField
            label={t("recommendations.q2_label")}
            desc={t("recommendations.q2_desc")}
            value={formData.pendidikan}
            onChange={(v) => updateField("pendidikan", v)}
            options={EDUCATION_OPTIONS}
            placeholder={t("recommendations.q2_placeholder")}
          />
          <RadioField
            label={t("recommendations.q3_label")}
            desc={t("recommendations.q3_desc")}
            name="gender"
            value={formData.jenis_kelamin}
            onChange={(v) => updateField("jenis_kelamin", v)}
            options={RADIO_GENDER(t)}
          />
          <RadioField
            label={t("recommendations.q4_label")}
            desc={t("recommendations.q4_desc")}
            name="parent_exp"
            value={formData.pengalaman_orang_tua}
            onChange={(v) => updateField("pengalaman_orang_tua", v)}
            options={RADIO_PERNAH(t)}
          />

          {/* Section B */}
          {sectionHeader(t("recommendations.section_b"), "bg-gradient-to-r from-emerald-600 to-emerald-500")}

          <RadioField
            label={t("recommendations.q5_label")}
            desc={t("recommendations.q5_desc")}
            name="modal"
            value={formData.modal_awal}
            onChange={(v) => updateField("modal_awal", v)}
            options={RADIO_MEMADAI(t)}
          />
          <RadioField
            label={t("recommendations.q6_label")}
            desc={t("recommendations.q6_desc")}
            name="catatan"
            value={formData.pencatatan_keuangan}
            onChange={(v) => updateField("pencatatan_keuangan", v)}
            options={RADIO_BAIK(t)}
          />
          <RadioField
            label={t("recommendations.q7_label")}
            desc={t("recommendations.q7_desc")}
            name="rencana"
            value={formData.rencana_bisnis}
            onChange={(v) => updateField("rencana_bisnis", v)}
            options={RADIO_ADA(t)}
          />
          <RadioField
            label={t("recommendations.q8_label")}
            desc={t("recommendations.q8_desc")}
            name="kemitraan"
            value={formData.kemitraan}
            onChange={(v) => updateField("kemitraan", v)}
            options={RADIO_YA_TIDAK(t)}
          />

          {/* Section C */}
          {sectionHeader(t("recommendations.section_c"), "bg-gradient-to-r from-amber-500 to-orange-500")}

          <NumberField
            label={t("recommendations.q9_label")}
            desc={t("recommendations.q9_desc")}
            value={formData.pengalaman_industri}
            onChange={(v) => updateField("pengalaman_industri", v)}
            min={0} max={50} unit={lang === "id" ? "Tahun" : "Years"}
          />
          <SliderField
            label={t("recommendations.q10_label")}
            desc={t("recommendations.q10_desc")}
            value={formData.upaya_pemasaran}
            onChange={(v) => updateField("upaya_pemasaran", v)}
            min={1} max={10}
            marks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          />
          <RadioField
            label={t("recommendations.q11_label")}
            desc={t("recommendations.q11_desc")}
            name="internet"
            value={formData.penggunaan_internet}
            onChange={(v) => updateField("penggunaan_internet", v)}
            options={RADIO_YA_TIDAK(t)}
          />
          <SliderField
            label={t("recommendations.q12_label")}
            desc={t("recommendations.q12_desc")}
            value={formData.konsultasi_profesional}
            onChange={(v) => updateField("konsultasi_profesional", v)}
            min={1} max={7}
            marks={[1, 2, 3, 4, 5, 6, 7]}
          />

          {/* Submit */}
          <div className="flex items-center gap-4 pt-6 pb-10">
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              {t("recommendations.predict_btn")}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-500 text-sm hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {lang === "id" ? "Kosongkan" : "Clear"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ─── LOADING ─── */
  if (phase === 3) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in px-4">
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-indigo-100 animate-ping opacity-30" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200">
            <IconChartDots3 size={32} className="text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center tracking-tight">
          {t("recommendations.analyzing_title")}
        </h2>
        <p className="text-slate-500 text-center max-w-sm text-base leading-relaxed">
          {t("recommendations.analyzing_desc")}
        </p>
        <div className="flex items-center gap-1.5 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ─── RESULTS ─── */
  if (phase === 4 && result) {
    const {
      prediction,
      label,
      probability_success = 0,
      probability_fail = 0,
      confidence = "Rendah",
      shap,
      ai_analysis,
    } = result;

    const pct = probability_success * 100;
    const failPct = probability_fail * 100;
    const isHigh = pct >= 70;
    const isMedium = pct >= 40;
    const gaugeColor = isHigh ? "#10b981" : isMedium ? "#f59e0b" : "#ef4444";
    const gaugeBg = isHigh ? "bg-emerald-500" : isMedium ? "bg-amber-500" : "bg-red-500";
    const gaugeText = isHigh ? "text-emerald-600" : isMedium ? "text-amber-600" : "text-red-600";
    const gaugeRing = isHigh ? "ring-emerald-200" : isMedium ? "ring-amber-200" : "ring-red-200";
    const isConfHigh = confidence === "Tinggi" || confidence === "High";
    const confBadge = isConfHigh
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-amber-100 text-amber-700 border-amber-200";

    const topPositive = shap?.top_positive_factors || [];
    const topNegative = shap?.top_negative_factors || [];
    const allFactors = shap?.all_factors || [];
    const analysis = ai_analysis || {};
    const summary = analysis.summary || "";
    const strengths = analysis.strengths || [];
    const weaknesses = analysis.weaknesses || [];
    const recommendations = analysis.recommendations || [];
    const encouragement = analysis.encouragement || "";

    const statusLabel = label
      ? label
      : isHigh
        ? (lang === "id" ? "LAYAK" : "FEASIBLE")
        : (lang === "id" ? "BUTUH PENYESUAIAN" : "NEEDS ADJUSTMENT");

    return (
      <div ref={resultsRef} className="max-w-6xl mx-auto pb-24 animate-fade-in mt-6 font-sans px-4">
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold text-indigo-600 tracking-[0.2em] uppercase mb-1.5">
              {t("recommendations.ai_analysis_result")}
            </p>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t("recommendations.analysis_complete")}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              {t("recommendations.recommendation_desc")}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all bg-white shadow-sm"
            >
              <FiRefreshCcw size={15} /> {t("recommendations.recalculate")}
            </button>
            <button
              onClick={handleSavePdf}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pdfLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <IconFileDownload size={16} />
              )}
              {pdfLoading
                ? (lang === "id" ? "Menyiapkan..." : "Preparing...")
                : t("recommendations.save_pdf")}
            </button>
          </div>
        </div>

        {/* ── SCORE CARD ── */}
        <motion.div
          id="result-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.4)] mb-10 ring-1 ring-white/5"
        >
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Gauge */}
            <div className="relative shrink-0">
              <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-lg">
                <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle
                  cx="80" cy="80" r="68"
                  fill="none"
                  stroke={gaugeColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={2 * Math.PI * 68 * (1 - pct / 100)}
                  className="transition-all duration-1000 ease-out"
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-extrabold tracking-tight`} style={{ color: gaugeColor }}>
                  {pct.toFixed(1)}%
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                  {t("recommendations.eligibility")}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${confBadge}`}>
                  <IconSpark size={13} />
                  {isConfHigh
                    ? (lang === "id" ? "Keyakinan Tinggi" : "High Confidence")
                    : (lang === "id" ? "Keyakinan Rendah" : "Low Confidence")}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isHigh ? "bg-emerald-900/40 text-emerald-300 border-emerald-700" : "bg-amber-900/40 text-amber-300 border-amber-700"}`}>
                  {isHigh ? <IconShield size={13} /> : <IconOctagon size={13} />}
                  {statusLabel}
                </span>
              </div>

              <div>
                <p className="text-2xl font-bold text-white">
                  {lang === "id" ? "Probabilitas Keberhasilan" : "Success Probability"}
                </p>
                <div className="flex items-center gap-6 mt-3 justify-center lg:justify-start">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm text-slate-300">
                      {lang === "id" ? "Berhasil" : "Success"} <span className="font-semibold text-white">{pct.toFixed(1)}%</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-sm text-slate-300">
                      {lang === "id" ? "Gagal" : "Fail"} <span className="font-semibold text-white">{failPct.toFixed(1)}%</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini bar */}
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mt-2 max-w-md mx-auto lg:mx-0">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${gaugeColor}, ${gaugeColor}dd)` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── CONTENT GRID ── */}
        <div className="grid lg:grid-cols-7 gap-10">
          {/* LEFT: Main Analysis */}
          <div className="lg:col-span-4 space-y-10">

            {/* AI Summary */}
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                    <IconSpark size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-base">
                      {lang === "id" ? "Ringkasan Analisis AI" : "AI Analysis Summary"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === "id" ? "Berdasarkan model prediksi Arta" : "Based on Arta's prediction model"}
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/30 border border-indigo-100/60 p-6 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/20 rounded-full blur-3xl pointer-events-none" />
                  <p className="text-slate-700 text-sm leading-relaxed font-medium relative z-10">
                    {summary}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Strengths & Weaknesses Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {strengths.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 mb-5 pb-4 border-b border-emerald-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <IconShield size={16} className="text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {lang === "id" ? "Kekuatan" : "Strengths"}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-emerald-700">{i + 1}</span>
                        </span>
                        <span className="text-sm text-slate-600 leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {weaknesses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2 mb-5 pb-4 border-b border-red-100">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <IconOctagon size={16} className="text-red-500" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {lang === "id" ? "Kelemahan" : "Weaknesses"}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-red-600">{i + 1}</span>
                        </span>
                        <span className="text-sm text-slate-600 leading-relaxed">{w}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4 mb-5 pb-4 border-b border-indigo-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                    <IconCrosshair size={18} className="text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-base">
                      {lang === "id" ? "Rekomendasi Tindakan" : "Action Recommendations"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === "id" ? "Langkah prioritas untuk meningkatkan bisnis" : "Priority steps to improve your business"}
                    </p>
                  </div>
                </div>
                <div className="space-y-0">
                  {recommendations.map((r, i) => (
                    <div key={i} className={`flex items-start gap-5 py-5 ${i < recommendations.length - 1 ? "border-b border-slate-100" : ""}`}>
                      <div className="relative flex flex-col items-center">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md shrink-0">
                          {i + 1}
                        </span>
                        {i < recommendations.length - 1 && (
                          <div className="w-0.5 h-full mt-1 bg-gradient-to-b from-indigo-300 via-indigo-200 to-transparent" />
                        )}
                      </div>
                      <span className="text-sm text-slate-700 leading-relaxed pt-1.5">{r}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Encouragement */}
            {encouragement && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 shadow-lg border border-slate-700/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">&ldquo;</span>
                  <p className="text-white/90 text-base font-medium leading-relaxed italic">
                    {encouragement}
                  </p>
                  <span className="text-2xl self-end">&rdquo;</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT: SHAP Factors */}
          <div className="lg:col-span-3 space-y-10 lg:sticky lg:top-8 lg:self-start">

            {/* Top Positive */}
            {topPositive.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <IconRise size={16} className="text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {lang === "id" ? "Faktor Positif" : "Positive Factors"}
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                    {lang === "id" ? "Pendorong" : "Drivers"}
                  </span>
                </div>
                <div className="space-y-6">
                  {topPositive.map((f, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {f.display_name}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 shrink-0 ml-3 flex items-center gap-1.5">
                          <SparklineMini direction="up" />
                          +{f.impact_pct.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2.5 truncate">{f.decoded_value}</p>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                          style={{ width: `${Math.min(f.impact_pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Top Negative */}
            {topNegative.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-red-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <IconFall size={16} className="text-red-500" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {lang === "id" ? "Faktor Negatif" : "Negative Factors"}
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-red-100">
                    {lang === "id" ? "Penghambat" : "Barriers"}
                  </span>
                </div>
                <div className="space-y-6">
                  {topNegative.map((f, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {f.display_name}
                        </span>
                        <span className="text-xs font-bold text-red-500 shrink-0 ml-3 flex items-center gap-1.5">
                          <SparklineMini direction="down" />
                          {f.impact_pct.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2.5 truncate">{f.decoded_value}</p>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-300 to-red-400 transition-all duration-700"
                          style={{ width: `${Math.min(f.impact_pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* All Factors */}
            {allFactors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <IconBars size={16} className="text-slate-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {lang === "id" ? "Semua Faktor" : "All Factors"}
                  </h3>
                </div>
                <div className="space-y-0.5">
                  {allFactors
                    .slice()
                    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
                    .map((f, i) => {
                      const isPos = f.direction === "positive";
                      return (
                        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
                          <div className={`w-1 h-8 rounded-full shrink-0 ${isPos ? "bg-emerald-400" : "bg-red-400"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-slate-700 truncate">
                                {f.display_name}
                              </span>
                              <span className={`text-xs font-semibold shrink-0 ${isPos ? "text-emerald-600" : "text-red-500"}`}>
                                {isPos ? "+" : ""}{f.impact_pct.toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate">{f.decoded_value}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── DISCLAIMER ── */}
        <div className="mt-12 mb-4 pt-4 border-t border-slate-200">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {t("recommendations.disclaimer_title")}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("recommendations.disclaimer_text")}
              </p>
            </div>
          </div>
        </div>

        {/* ── UPGRADE CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 mb-8"
        >
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-10 shadow-xl text-white relative overflow-hidden border border-slate-700/50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            {upgradeSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto mb-6">
                  <IconShield size={34} className="text-emerald-300" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{t("recommendations.upgrade_success")}</h3>
                <p className="text-white/70">{lang === "id" ? "Mengarahkan ke dashboard..." : "Redirecting to dashboard..."}</p>
              </div>
            ) : showUpgrade ? (
              <form onSubmit={handleUpgrade}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                    <IconBag size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t("recommendations.upgrade_title")}</h3>
                    <p className="text-sm text-white/70">{t("recommendations.upgrade_desc")}</p>
                  </div>
                </div>

                {upgradeErr && (
                  <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl mb-5 text-sm">
                    {upgradeErr}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      {t("recommendations.upgrade_nama_usaha")} <span className="text-red-300">*</span>
                    </label>
                    <input
                      type="text"
                      value={upgradeForm.nama_usaha}
                      onChange={(e) => setUpgradeForm((p) => ({ ...p, nama_usaha: e.target.value }))}
                      placeholder={t("recommendations.upgrade_nama_usaha_placeholder")}
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-white/30 text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-white/20 transition-all text-sm shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      {t("recommendations.upgrade_tipe_usaha")} <span className="text-red-300">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={upgradeForm.tipe_usaha}
                        onChange={(e) => setUpgradeForm((p) => ({ ...p, tipe_usaha: e.target.value }))}
                        className="w-full px-4 py-3.5 rounded-xl bg-white border border-white/30 text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-white/20 transition-all text-sm appearance-none cursor-pointer shadow-sm"
                        required
                      >
                        <option value="" disabled className="text-slate-400">{t("recommendations.upgrade_tipe_usaha_placeholder")}</option>
                        {BUSINESS_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="text-slate-800 bg-white">{cat}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <button
                    type="submit"
                    disabled={upgradeLoading}
                    className="flex items-center gap-2.5 px-10 py-4 rounded-xl bg-white text-indigo-700 font-bold text-base hover:bg-white/90 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
                  >
                    {upgradeLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin" />
                        {t("recommendations.upgrade_loading")}
                      </>
                    ) : (
                      <>
                        {t("recommendations.upgrade_btn")} <FiArrowRight size={20} />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowUpgrade(false); setUpgradeErr(""); }}
                    disabled={upgradeLoading}
                    className="text-sm text-white/60 hover:text-white transition-colors disabled:opacity-40 font-medium"
                  >
                    {lang === "id" ? "Nanti Saja" : "Later"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <IconBag size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold">{t("recommendations.upgrade_title")}</h3>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed max-w-lg">
                    {t("recommendations.upgrade_desc")}
                  </p>
                </div>
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="shrink-0 flex items-center gap-2.5 px-10 py-4 rounded-xl bg-white text-indigo-700 font-bold text-base hover:bg-white/90 transition-all shadow-lg active:scale-95"
                >
                  {t("recommendations.upgrade_btn")} <FiArrowRight size={20} />
                </button>
              </div>
            )}


          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default Recommendations;