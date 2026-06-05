import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FiUser, FiMail, FiPhone, FiBriefcase,
  FiCamera, FiSave, FiCheck, FiLoader, FiEdit3,
  FiShield, FiCalendar, FiTrendingUp, FiKey, FiEye, FiEyeOff, FiX
} from "react-icons/fi";
import api from "../services/api";
import { supabase } from "../services/supabaseClient";



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

const FormInput = ({ label, icon: Icon, type = "text", value, onChange, placeholder, disabled }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
      <Icon size={11} />
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200 shadow-sm focus:shadow-md focus:shadow-indigo-500/10"
      />
    </div>
  </div>
);

const FormSelect = ({ label, icon: Icon, value, onChange, options }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
      <Icon size={11} />
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800
        focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white
        transition-all duration-200 shadow-sm focus:shadow-md focus:shadow-indigo-500/10
        cursor-pointer appearance-none"
    >
      <option value="">Pilih Kategori...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default function Profile() {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const currentUserRole = (() => {
    try {
      const profile = JSON.parse(localStorage.getItem("profile") || "{}");
      if (profile.role) return profile.role.toUpperCase();
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return (user.user_metadata?.role || "USER").toUpperCase();
    } catch (e) {
      return "USER";
    }
  })();
  const isOwner = currentUserRole === "OWNER";

  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [profile, setProfile] = useState({
    namaLengkap: "",
    email: "",
    telepon: "",
    bio: "",
    joinDate: "Mei 2026",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError("");
  };

  const pwdCriteria = {
    length: passwordData.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(passwordData.newPassword),
    number: /\d/.test(passwordData.newPassword),
  };
  const isPasswordMatch =
    passwordData.confirmNewPassword.length > 0 &&
    passwordData.newPassword === passwordData.confirmNewPassword;
  const isConfirmPasswordInvalid =
    passwordData.confirmNewPassword.length > 0 &&
    passwordData.newPassword !== passwordData.confirmNewPassword;

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedProfile = localStorage.getItem("profile");
    const profileData = (() => { try { return JSON.parse(storedProfile || "{}"); } catch { return {}; } })();
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setProfile((prev) => ({
          ...prev,
          namaLengkap: user?.user_metadata?.nama_lengkap || user?.user_metadata?.full_name || user?.user_metadata?.name || profileData?.nama_lengkap || "",
          email: user?.email || "",
          telepon: user?.user_metadata?.telepon || "",
          bio: user?.user_metadata?.bio || "",
        }));
        if (user?.user_metadata?.avatar) {
          setAvatarPreview(user.user_metadata.avatar);
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field) => (e) =>
    setProfile((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    // Cek apakah user sedang mencoba mengganti password
    const isChangingPassword = passwordData.oldPassword || passwordData.newPassword || passwordData.confirmNewPassword;

    if (isChangingPassword) {
      if (!passwordData.oldPassword) {
        setPasswordError("Kata sandi lama wajib diisi");
        return;
      }
      if (!pwdCriteria.length || !pwdCriteria.uppercase || !pwdCriteria.number) {
        setPasswordError("Password baru tidak memenuhi semua kriteria");
        return;
      }
      if (!isPasswordMatch) {
        setPasswordError("Password baru dan konfirmasi tidak cocok");
        return;
      }
    }

    if (saveStatus === "saving") return;
    setSaveStatus("saving");

    try {
      // 1. Jika ganti password, verifikasi password lama via SERVER
      // PENTING: Jangan gunakan signInWithPassword di client karena akan
      // menghancurkan sesi aktif dan menyebabkan error "akses ditolak" saat login ulang
      if (isChangingPassword) {
        try {
          await api.post("/api/auth/verify-password", {
            password: passwordData.oldPassword,
          });
        } catch (verifyErr) {
          const msg = verifyErr.response?.data?.message || "Password yang Anda masukkan salah";
          setPasswordError(msg);
          setSaveStatus("idle");
          return;
        }
      }

      // 2. Siapkan payload update untuk Supabase Auth
      // Hanya OWNER yang bisa mengubah nama lengkap
      const updatePayload = {
        data: {
          ...(isOwner ? { nama_lengkap: profile.namaLengkap } : {}),
          telepon: profile.telepon,
          bio: profile.bio,
          ...(avatarPreview ? { avatar: avatarPreview } : {}),
        }
      };

      if (isChangingPassword) {
        updatePayload.password = passwordData.newPassword;
      }

      // 3. Jalankan Update
      const { data: updateData, error: updateError } = await supabase.auth.updateUser(updatePayload);

      if (updateError) throw updateError;
      
      // Update juga ke backend database profiles agar tersinkron dan tidak balik ke awal saat refresh
      // Hapus avatar dari payload backend untuk menghindari error 413 (Payload Too Large) di Vercel
      const backendPayload = {
        ...(isOwner ? { nama_lengkap: profile.namaLengkap } : {}),
        telepon: profile.telepon,
        bio: profile.bio,
      };
      await api.put("/api/profile", backendPayload);

      // --- Setelah ganti password: sign out bersih dan redirect ---
      if (isChangingPassword) {
        alert("Password berhasil diubah. Silakan login kembali untuk keamanan.");
        await supabase.auth.signOut();
        // Bersihkan data sesi, tapi jangan localStorage.clear() agar tidak menghapus hal lain
        localStorage.removeItem("token");
        localStorage.removeItem("profile");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      // 4. Update LocalStorage (hanya jika hanya update profil, bukan password)
      if (updateData?.user) {
        localStorage.setItem("user", JSON.stringify(updateData.user));
        window.dispatchEvent(new Event("profileUpdated"));
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);

    } catch (error) {
      console.error("Gagal menyimpan profil:", error);
      alert("Gagal menyimpan perubahan: " + error.message);
      setSaveStatus("idle");
    }
  };

  const initials = profile.namaLengkap
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "A";

  const completionFields = [
    profile.namaLengkap,
    profile.email,
    profile.telepon,
  ];
  const completionPercent = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Title */}
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">{t('profile.title')}</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">{t('profile.subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== LEFT COLUMN ===== */}
        <div className="lg:col-span-1 space-y-6">

          {/* Profile Card */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Banner Gradient */}
            <div className="h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent_60%)]" />
            </div>

            {/* Avatar + Info */}
            <div className="px-6 pb-6 -mt-12">
              <div className="relative w-max mb-4">
                <div className="w-20 h-20 rounded-2xl ring-4 ring-white shadow-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-white">{initials}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md flex items-center justify-center transition-colors"
                  title="Ganti foto profil"
                >
                  <FiCamera size={13} strokeWidth={2.5} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              <h2 className="text-lg font-black text-slate-800 leading-tight">
                {profile.namaLengkap || "Nama Belum Diisi"}
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">{profile.email || "—"}</p>
              {profile.namaUsaha && (
                <div className="flex items-center gap-1.5 mt-2">
                  <FiBriefcase size={12} className="text-indigo-500" />
                  <span className="text-xs font-bold text-indigo-600">{profile.namaUsaha}</span>
                </div>
              )}

              {/* Inline Progress Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('profile.profile_completion')}</span>
                  <span className={`text-[11px] font-black ${completionPercent === 100 ? 'text-emerald-500' : 'text-indigo-500'
                    }`}>{completionPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className={`h-1.5 rounded-full ${completionPercent === 100
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                      }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercent}%` }}
                    transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  {[
                    { label: "Nama", filled: !!profile.namaLengkap },
                    { label: "Email", filled: !!profile.email },
                    { label: "Telepon", filled: !!profile.telepon },
                  ].map(({ label, filled }) => (
                    <span
                      key={label}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${filled
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${filled ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>



          {/* Stats Card */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('profile.account_summary')}</h3>
            <div className="space-y-3">
              {[
                { icon: FiCalendar, label: t('profile.joined_since'), value: profile.joinDate, color: "text-indigo-500 bg-indigo-50" },
                { icon: FiTrendingUp, label: t('profile.account_status'), value: t('profile.status_active'), color: "text-emerald-500 bg-emerald-50" },
                { icon: FiShield, label: t('profile.security'), value: t('profile.security_verified'), color: "text-purple-500 bg-purple-50" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon size={14} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide leading-none mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-slate-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Info Card */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
                <FiUser size={15} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">{t('profile.personal_info')}</h3>
                <p className="text-xs text-slate-500 font-medium">{t('profile.personal_info_desc')}</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormInput
                label={t('profile.full_name')}
                icon={FiUser}
                value={profile.namaLengkap}
                onChange={handleChange("namaLengkap")}
                placeholder="Masukkan nama lengkap Anda"
                disabled={!isOwner}
              />
              {!isOwner && (
                <div className="flex items-start gap-1.5 p-3 bg-slate-50 rounded-xl">
                  <FiShield size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Hanya pemilik akun (Owner) yang dapat mengubah nama lengkap.
                  </p>
                </div>
              )}
              <FormInput
                label={t('profile.email_address')}
                icon={FiMail}
                type="email"
                value={profile.email}
                onChange={handleChange("email")}
                placeholder="email@contoh.com"
                disabled
              />
              <div className="sm:col-span-2">
                <FormInput
                  label={t('profile.phone_number')}
                  icon={FiPhone}
                  type="tel"
                  value={profile.telepon}
                  onChange={handleChange("telepon")}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FiEdit3 size={11} />
                  {t('profile.short_bio')}
                </label>
                <textarea
                  value={profile.bio}
                  onChange={handleChange("bio")}
                  placeholder={t('profile.bio_placeholder')}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white
                    transition-all duration-200 shadow-sm focus:shadow-md focus:shadow-indigo-500/10 resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Change Password Card */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-sm shadow-orange-500/30">
                <FiKey size={15} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">{t('profile.account_security')}</h3>
                <p className="text-xs text-slate-500 font-medium">{t('profile.account_security_desc')}</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Old Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('profile.old_password')}
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    autoComplete="new-password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-10 bg-slate-50 border ${passwordError ? 'border-red-400 focus:ring-red-400 focus:bg-red-50/50' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 shadow-sm`}
                    placeholder={t('profile.old_password_placeholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showOldPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{passwordError}</p>
                )}

              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('profile.new_password')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    autoComplete="new-password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm"
                    placeholder={t('profile.new_password_placeholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {passwordData.newPassword.length > 0 && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      {pwdCriteria.length ? <FiCheck size={14} className="text-emerald-500" /> : <FiX size={14} className="text-slate-300" />}
                      <span className={pwdCriteria.length ? "text-emerald-600 font-medium" : "text-slate-500"}>Minimal 8 karakter</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {pwdCriteria.uppercase ? <FiCheck size={14} className="text-emerald-500" /> : <FiX size={14} className="text-slate-300" />}
                      <span className={pwdCriteria.uppercase ? "text-emerald-600 font-medium" : "text-slate-500"}>Mengandung huruf besar</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {pwdCriteria.number ? <FiCheck size={14} className="text-emerald-500" /> : <FiX size={14} className="text-slate-300" />}
                      <span className={pwdCriteria.number ? "text-emerald-600 font-medium" : "text-slate-500"}>Mengandung angka</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('profile.confirm_password')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    name="confirmNewPassword"
                    autoComplete="new-password"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-10 bg-slate-50 border ${isConfirmPasswordInvalid ? "border-red-400 focus:ring-red-400 focus:bg-red-50/50" : isPasswordMatch ? "border-emerald-400 focus:ring-emerald-400 focus:bg-emerald-50/50" : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"} rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 shadow-sm`}
                    placeholder={t('profile.confirm_password_placeholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showConfirmNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {isConfirmPasswordInvalid && (
                  <p className="text-xs text-red-500 mt-1 font-medium">Kata sandi tidak cocok</p>
                )}
                {isPasswordMatch && (
                  <p className="text-xs text-emerald-600 mt-1 font-medium">Kata sandi cocok</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div variants={cardVariants} className="flex items-center justify-end">
            <button
              onClick={handleSave}
              disabled={saveStatus === "saving" || saveStatus === "saved"}
              className={`flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-black text-sm transition-all duration-300 shadow-md active:scale-95
                ${saveStatus === "saved"
                  ? "bg-emerald-500 text-white shadow-emerald-500/30"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20"
                }
                disabled:opacity-80 disabled:cursor-not-allowed`}
            >
              {saveStatus === "saving" && <FiLoader size={16} className="animate-spin" />}
              {saveStatus === "saved" && <FiCheck size={16} strokeWidth={3} />}
              {saveStatus === "idle" && <FiSave size={16} strokeWidth={2.5} />}

              {saveStatus === "saving" && t('profile.saving')}
              {saveStatus === "saved" && t('profile.save_success')}
              {saveStatus === "idle" && t('profile.save_changes')}
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
