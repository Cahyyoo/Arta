import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiShield, FiPlus, FiEdit2, FiKey, FiTrash2, FiUser, FiX,
  FiBriefcase, FiMapPin, FiTag, FiSave, FiCheck, FiLoader,
  FiPhone, FiMail, FiGlobe, FiUsers, FiCalendar, FiFileText,
  FiInstagram, FiCreditCard, FiHash, FiSearch
} from "react-icons/fi";
import api from "../services/api";
import { supabase } from "../services/supabaseClient";

const businessCategories = [
  "Kuliner & Makanan", "Fashion & Pakaian", "Perdagangan Umum",
  "Jasa & Layanan", "Teknologi & Digital", "Pertanian & Perkebunan",
  "Kesehatan & Kecantikan", "Pendidikan", "Otomotif", "Lainnya",
];

// Fungsi Helper untuk membaca Role dari LocalStorage
const getCurrentUserRole = () => {
  try {
    const profile = JSON.parse(localStorage.getItem("profile") || "{}");
    if (profile.role) return profile.role.toUpperCase();

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return (user.user_metadata?.role || "USER").toUpperCase();
  } catch (e) {
    return "USER";
  }
};

const Settings = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Deteksi Role
  const currentUserRole = getCurrentUserRole();
  const isOwner = currentUserRole === "OWNER";

  // Proteksi Akses: Jika bukan OWNER, paksa ke tab 'profile'
  let activeTab = searchParams.get("tab") || (isOwner ? "roles" : "profile");
  if (!isOwner && activeTab === "roles") {
    activeTab = "profile";
  }

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: "", email: "", role: "User", password: "" });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editUserData, setEditUserData] = useState({ id: "", name: "", role: "User", isOwner: false });

  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // === FUNGSI FETCH USER (Bersih, tanpa auto-set) ===
  const fetchUsers = async () => {
    if (!isOwner) return; // Keamanan tambahan, cegah non-owner fetch data

    setIsLoadingUsers(true);
    try {
      const res = await api.get('/api/users');
      let users = res.data?.data || res.data || [];

      users = users.map(user => {
        const metaName = user.user_metadata?.name || user.raw_user_meta_data?.name || user.user_metadata?.full_name || user.raw_user_meta_data?.full_name;
        const metaRole = user.user_metadata?.role || user.raw_user_meta_data?.role;

        return {
          ...user,
          display_name: user.name || metaName || "Unknown",
          display_role: (user.role || metaRole || "USER").toUpperCase()
        };
      });

      setUsersList(users);
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = usersList;
    if (roleSearchTerm.trim()) {
      const term = roleSearchTerm.toLowerCase();
      result = result.filter(u =>
        u.display_name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      );
    }
    if (roleFilter) {
      result = result.filter(u => u.display_role === roleFilter.toUpperCase());
    }
    return result;
  }, [usersList, roleSearchTerm, roleFilter]);

  useEffect(() => {
    if (activeTab === "roles" && isOwner) {
      fetchUsers();
    }
  }, [activeTab, isOwner]);

  useEffect(() => {
    if (!isEditModalOpen) {
      setEditUserData({ id: "", name: "", role: "User", isOwner: false });
    }
  }, [isEditModalOpen]);

  // State for Profil Usaha
  const [saveStatus, setSaveStatus] = useState("idle");
  const [businessProfile, setBusinessProfile] = useState({
    namaUsaha: "", kategoriUsaha: "", jenisUsaha: "", tahunBerdiri: "",
    jumlahKaryawan: "", teleponUsaha: "", emailUsaha: "", website: "",
    instagram: "", alamatUsaha: "", deskripsiUsaha: "", nib: "", npwp: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const m = user?.user_metadata || {};
        setBusinessProfile(prev => ({
          ...prev,
          namaUsaha: m.nama_usaha || "",
          kategoriUsaha: m.kategori_usaha || "",
          jenisUsaha: m.jenis_usaha || "",
          tahunBerdiri: m.tahun_berdiri || "",
          jumlahKaryawan: m.jumlah_karyawan || "",
          teleponUsaha: m.telepon_usaha || "",
          emailUsaha: m.email_usaha || "",
          website: m.website || "",
          instagram: m.instagram || "",
          alamatUsaha: m.alamat_usaha || "",
          deskripsiUsaha: m.deskripsi_usaha || "",
          nib: m.nib || "",
          npwp: m.npwp || "",
        }));
      } catch (e) { }
    }
  }, []);

  const handleBusinessChange = (field) => (e) =>
    setBusinessProfile((prev) => ({ ...prev, [field]: e.target.value }));

  const handleBusinessSave = async () => {
    if (saveStatus === "saving") return;
    setSaveStatus("saving");

    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const userMetadataUpdates = {
          nama_usaha: businessProfile.namaUsaha,
          kategori_usaha: businessProfile.kategoriUsaha,
          jenis_usaha: businessProfile.jenisUsaha,
          tahun_berdiri: businessProfile.tahunBerdiri,
          jumlah_karyawan: businessProfile.jumlahKaryawan,
          telepon_usaha: businessProfile.teleponUsaha,
          email_usaha: businessProfile.emailUsaha,
          website: businessProfile.website,
          instagram: businessProfile.instagram,
          alamat_usaha: businessProfile.alamatUsaha,
          deskripsi_usaha: businessProfile.deskripsiUsaha,
          nib: businessProfile.nib,
          npwp: businessProfile.npwp,
        };

        const { error } = await supabase.auth.updateUser({
          data: userMetadataUpdates
        });

        if (error) throw error;

        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            ...userMetadataUpdates
          },
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      console.error("Gagal menyimpan profil usaha:", err);
      alert("Gagal menyimpan profil usaha: " + err.message);
      setSaveStatus("idle");
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      // Ambil business_id dari profile Owner yang sedang login
      const ownerProfile = JSON.parse(localStorage.getItem("profile") || "{}");
      const payload = {
        name: newUserData.name,
        email: newUserData.email,
        role: newUserData.role.toUpperCase(),
        password: newUserData.password
      };
      if (ownerProfile.business_id) {
        payload.business_id = ownerProfile.business_id;
      }
      await api.post('/api/users', payload);
      alert("Akun berhasil dibuat! Karyawan dapat langsung login.");
      setIsAddModalOpen(false);
      setNewUserData({ name: "", email: "", role: "User", password: "" });
      fetchUsers();
    } catch (err) {
      alert("Gagal membuat akun: " + (err.response?.data?.message || err.message));
    } finally {
      setAddLoading(false);
    }
  };

  // === FUNGSI EDIT ===
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const payload = {
        name: editUserData.name,
        role: (editUserData.role || "User").toUpperCase()
      };

      await api.put(`/api/users/${editUserData.id}`, payload);

      // Update session user + profile di localStorage agar nama langsung berubah
      const localUser = (() => {
        try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
      })();
      const editedUser = usersList.find(u => u.id === editUserData.id);
      const isEditingSelf = editedUser && localUser?.email && editedUser.email === localUser.email;

      if (isEditingSelf) {
        // Update profile di backend agar tersimpan permanen (hanya saat edit diri sendiri)
        try {
          await api.put("/api/profile", { nama_lengkap: editUserData.name });
        } catch (_) {}

        try {
          const { data: authData } = await supabase.auth.updateUser({
            data: { nama_lengkap: editUserData.name, name: editUserData.name, full_name: editUserData.name }
          });
          if (authData?.user) {
            localStorage.setItem("user", JSON.stringify(authData.user));
          }
        } catch (_) { /* fallback: langsung patch localStorage */ }

        if (localUser?.user_metadata) {
          localUser.user_metadata.nama_lengkap = editUserData.name;
          localUser.user_metadata.name = editUserData.name;
          localUser.user_metadata.full_name = editUserData.name;
          localStorage.setItem("user", JSON.stringify(localUser));
        }

        // Update localStorage.profile dengan nama baru (hanya saat edit diri sendiri)
        const localProfile = (() => {
          try { return JSON.parse(localStorage.getItem("profile") || "{}"); } catch { return {}; }
        })();
        if (localProfile && typeof localProfile === "object") {
          localProfile.nama_lengkap = editUserData.name;
          localStorage.setItem("profile", JSON.stringify(localProfile));
        }
      }

      // fetchUsers dulu (data backend mungkin stale untuk OWNER), lalu timpa nama final
      await fetchUsers();
      setUsersList(prev => prev.map(u =>
        u.id === editUserData.id
          ? { ...u, name: editUserData.name, display_name: editUserData.name }
          : u
      ));

      alert("Akun berhasil diperbarui!");
      setIsEditModalOpen(false);
    } catch (err) {
      alert("Gagal update akun: " + (err.response?.data?.message || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus akun ini?")) {
      try {
        await api.delete(`/api/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert("Gagal menghapus akun: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{t('settings.title')}</h1>
        <p className="text-slate-500 font-medium mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {activeTab === "roles" && isOwner && (
            <div className="space-y-6">
              {/* Tabel User */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-800">{t('settings.users_list')}</h3>
                      <p className="text-xs text-slate-500 mt-1">{t('settings.users_list_desc')}</p>
                    </div>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-indigo-500/20"
                    >
                      <FiPlus size={18} /> {t('settings.add_new_access')}
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <div className="relative flex-1 max-w-xs">
                      <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={roleSearchTerm}
                        onChange={(e) => setRoleSearchTerm(e.target.value)}
                        placeholder={t('settings.role_search_placeholder')}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                    >
                      <option value="">{t('settings.role_filter_all')}</option>
                      <option value="OWNER">OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="USER">USER</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider font-bold">
                        <th className="px-6 py-4 border-b border-slate-100">{t('settings.th_username')}</th>
                        <th className="px-6 py-4 border-b border-slate-100">{t('settings.th_role')}</th>
                        <th className="px-6 py-4 border-b border-slate-100">{t('settings.th_status')}</th>
                        <th className="px-6 py-4 border-b border-slate-100 text-right">{t('settings.th_action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isLoadingUsers ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                            <FiLoader className="animate-spin inline-block mr-2" /> Memuat data...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                            {usersList.length === 0
                              ? 'Belum ada akun terdaftar.'
                              : 'Tidak ada akun yang cocok dengan pencarian.'}
                          </td>
                        </tr>
                      ) : filteredUsers.map(user => {
                        const userName = user.display_name;
                        const userRole = user.display_role;
                        const isThisOwner = userRole === "OWNER";

                        return (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${isThisOwner ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                  {userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 text-sm">
                                    {userName}
                                    {user.is_current_user && <span className="ml-2 text-xs text-indigo-500 font-medium">(Anda)</span>}
                                  </p>
                                  <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-black rounded-lg uppercase tracking-wider inline-flex items-center justify-center ${isThisOwner ? 'bg-indigo-100 text-indigo-700' :
                                userRole === 'ADMIN' ? 'bg-amber-100 text-amber-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }`}>
                                {userRole}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> {t('settings.status_active')}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {!isThisOwner && (
                                  <button
                                    onClick={() => {
                                      setEditUserData({
                                        id: user.id,
                                        name: userName,
                                        role: userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase(),
                                        isOwner: isThisOwner
                                      });
                                      setIsEditModalOpen(true);
                                    }}
                                    className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50"
                                    title={t('settings.edit_access')}
                                  >
                                    <FiEdit2 size={16} />
                                  </button>
                                )}
                                {!isThisOwner && !user.is_current_user && (
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                                    title={t('settings.delete_access')}
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* === IDENTITAS USAHA === */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <FiBriefcase size={15} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{t('settings.business_identity')}</h3>
                    <p className="text-xs text-slate-500">{t('settings.business_identity_desc')}</p>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FiBriefcase size={11} /> {t('settings.business_name')}
                    </label>
                    <input type="text" value={businessProfile.namaUsaha} onChange={handleBusinessChange("namaUsaha")}
                      placeholder="Contoh: Warung Makan Sederhana"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FiTag size={11} /> {t('settings.business_category')}
                      </label>
                      <select value={businessProfile.kategoriUsaha} onChange={handleBusinessChange("kategoriUsaha")}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm appearance-none cursor-pointer">
                        <option value="">Pilih Kategori...</option>
                        {businessCategories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FiFileText size={11} /> {t('settings.business_type')}
                      </label>
                      <select value={businessProfile.jenisUsaha} onChange={handleBusinessChange("jenisUsaha")}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm appearance-none cursor-pointer">
                        <option value="">Pilih Jenis...</option>
                        <option value="Perorangan">Usaha Perorangan</option>
                        <option value="CV">CV (Commanditaire Vennootschap)</option>
                        <option value="PT">PT (Perseroan Terbatas)</option>
                        <option value="UD">UD (Usaha Dagang)</option>
                        <option value="Koperasi">Koperasi</option>
                        <option value="UMKM">UMKM</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FiCalendar size={11} /> {t('settings.founded_year')}
                      </label>
                      <input type="number" min="1900" max="2099" value={businessProfile.tahunBerdiri} onChange={handleBusinessChange("tahunBerdiri")}
                        placeholder="Contoh: 2020"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FiUsers size={11} /> {t('settings.employee_count')}
                      </label>
                      <select value={businessProfile.jumlahKaryawan} onChange={handleBusinessChange("jumlahKaryawan")}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm appearance-none cursor-pointer">
                        <option value="">Pilih Rentang...</option>
                        <option value="1-5">1 - 5 orang</option>
                        <option value="6-10">6 - 10 orang</option>
                        <option value="11-25">11 - 25 orang</option>
                        <option value="26-50">26 - 50 orang</option>
                        <option value="51-100">51 - 100 orang</option>
                        <option value=">100">Lebih dari 100 orang</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FiFileText size={11} /> {t('settings.business_desc')}
                    </label>
                    <textarea value={businessProfile.deskripsiUsaha} onChange={handleBusinessChange("deskripsiUsaha")}
                      placeholder="Ceritakan tentang produk/jasa yang ditawarkan dan keunggulan usaha Anda..."
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm resize-none" />
                  </div>
                </div>
              </div>

              {/* === KONTAK & LOKASI === */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <FiMapPin size={15} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{t('settings.contact_location')}</h3>
                    <p className="text-xs text-slate-500">{t('settings.contact_location_desc')}</p>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FiPhone size={11} /> {t('settings.business_phone')}
                      </label>
                      <input type="tel" value={businessProfile.teleponUsaha} onChange={handleBusinessChange("teleponUsaha")}
                        placeholder="021-12345678"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FiMail size={11} /> {t('settings.business_email')}
                      </label>
                      <input type="email" value={businessProfile.emailUsaha} onChange={handleBusinessChange("emailUsaha")}
                        placeholder="info@usahasaya.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FiMapPin size={11} /> {t('settings.business_address')}
                    </label>
                    <textarea value={businessProfile.alamatUsaha} onChange={handleBusinessChange("alamatUsaha")}
                      placeholder="Masukkan alamat lengkap usaha Anda..."
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm resize-none" />
                  </div>
                </div>
              </div>

              {/* === DIGITAL & MEDIA SOSIAL === */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <FiGlobe size={15} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{t('settings.digital_social')}</h3>
                    <p className="text-xs text-slate-500">{t('settings.digital_social_desc')}</p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FiGlobe size={11} /> {t('settings.website')}
                    </label>
                    <input type="url" value={businessProfile.website} onChange={handleBusinessChange("website")}
                      placeholder="https://www.usahasaya.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FiInstagram size={11} /> {t('settings.instagram')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">@</span>
                      <input type="text" value={businessProfile.instagram} onChange={handleBusinessChange("instagram")}
                        placeholder="nama_akun"
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* === LEGALITAS === */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <FiShield size={15} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{t('settings.legal_info')}</h3>
                    <p className="text-xs text-slate-500">{t('settings.legal_info_desc')}</p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FiHash size={11} /> {t('settings.nib')}
                    </label>
                    <input type="text" value={businessProfile.nib} onChange={handleBusinessChange("nib")}
                      placeholder="Contoh: 1234567890123"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FiCreditCard size={11} /> {t('settings.npwp')}
                    </label>
                    <input type="text" value={businessProfile.npwp} onChange={handleBusinessChange("npwp")}
                      placeholder="Contoh: 00.000.000.0-000.000"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <p className="text-xs text-slate-400 font-medium">{t('settings.save_changes_hint')}</p>
                <button
                  onClick={handleBusinessSave}
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
                  {saveStatus === "saving" && t('settings.saving')}
                  {saveStatus === "saved" && t('settings.save_success')}
                  {saveStatus === "idle" && t('settings.save_changes')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah Akses */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <FiUsers className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg">{t('settings.create_new_access')}</h3>
                  <p className="text-indigo-100 text-xs font-medium mt-0.5">{t('settings.add_team_member')}</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <FiX size={16} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-7 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FiUser size={11} /> {t('settings.full_name_label')}
                </label>
                <input type="text" required value={newUserData.name} onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })} placeholder={t('settings.full_name_placeholder')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FiMail size={11} /> {t('settings.employee_email_label')}
                </label>
                <input type="email" required value={newUserData.email} onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })} placeholder={t('settings.employee_email_placeholder')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FiKey size={11} /> Password untuk Login
                </label>
                <input type="password" required value={newUserData.password} onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })} placeholder="Set password untuk akun ini" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FiShield size={11} /> {t('settings.choose_role_label')}
                </label>
                <select value={newUserData.role} onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm appearance-none cursor-pointer">
                  <option value="Admin">{t('settings.role_admin_option')}</option>
                  <option value="User">{t('settings.role_user_option')}</option>
                </select>
                <div className="flex items-start gap-1.5 mt-2 p-3 bg-indigo-50 rounded-xl">
                  <FiKey className="text-indigo-500 mt-0.5 shrink-0" size={14} />
                  <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                    {t('settings.owner_control_notice')}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors" disabled={addLoading}>
                  {t('settings.cancel')}
                </button>
                <button type="submit" disabled={addLoading} className="flex-1 py-3.5 px-4 rounded-xl font-black text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {addLoading && <FiLoader size={14} className="animate-spin" />}
                  {addLoading ? 'Membuat...' : t('settings.save_account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Akses */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <FiEdit2 className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg">{editUserData.isOwner ? 'Edit Nama Owner' : 'Edit Akses'}</h3>
                  <p className="text-indigo-100 text-xs font-medium mt-0.5">{editUserData.isOwner ? 'Ubah nama tampilan akun Owner' : 'Ubah detail dan hak akses tim'}</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <FiX size={16} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-7 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FiUser size={11} /> {t('settings.full_name_label')}
                </label>
                <input type="text" required value={editUserData.name} onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm" />
              </div>

              {editUserData.isOwner ? (
                <div className="flex items-start gap-1.5 p-3 bg-indigo-50 rounded-xl">
                  <FiShield className="text-indigo-500 mt-0.5 shrink-0" size={14} />
                  <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                    Role <strong>OWNER</strong> tidak dapat diubah. Anda hanya bisa mengedit nama tampilan.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FiShield size={11} /> {t('settings.choose_role_label')}
                  </label>
                  <select value={editUserData.role} onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 shadow-sm appearance-none cursor-pointer">
                    <option value="Admin">{t('settings.role_admin_option')}</option>
                    <option value="User">{t('settings.role_user_option')}</option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors" disabled={editLoading}>
                  {t('settings.cancel')}
                </button>
                <button type="submit" disabled={editLoading} className="flex-1 py-3.5 px-4 rounded-xl font-black text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {editLoading && <FiLoader size={14} className="animate-spin" />}
                  {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;