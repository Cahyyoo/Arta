const supabaseAdmin = require('../config/supabaseAdmin');
const { createClient } = require('@supabase/supabase-js');

// Kita butuh client biasa untuk memverifikasi password lama
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- AMBIL PROFIL USER ---
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    // Jika profil belum ada, buat profil baru
    if (!data) {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          nama_lengkap: req.user.user_metadata?.nama_lengkap || "",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return res.status(200).json({
        status: "success",
        data: { profile: newProfile },
      });
    }

    res.status(200).json({
      status: "success",
      data: { profile: data },
    });
  } catch (error) {
    console.error("❌ Get Profile Error:", error.message);
    res.status(400).json({ status: "error", message: error.message });
  }
};

// --- SIMPAN HASIL ONBOARDING ---
const updateOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const { user_type, nama_usaha, tipe_usaha, lama_usaha } = req.body;

    if (!user_type || !["calon_pengusaha", "umkm_aktif"].includes(user_type)) {
      return res.status(400).json({
        status: "error",
        message: "Tipe akun tidak valid. Pilih 'calon_pengusaha' atau 'umkm_aktif'.",
      });
    }

    const updateData = {
      user_type,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    // Jika umkm_aktif, simpan data ke tabel business dan siapkan data profil
    if (user_type === "umkm_aktif") {
      // Validasi karena kolom 'name' di tabel business bertipe NON-NULLABLE
      if (!nama_usaha) {
        return res.status(400).json({
          status: "error",
          message: "Nama usaha wajib diisi untuk tipe akun UMKM Aktif.",
        });
      }

      // 1. Buat data baru di tabel 'business'
      const { data: newBusiness, error: businessError } = await supabase
        .from("businesses")
        .insert({
          name: nama_usaha,
          type: tipe_usaha || null,
          owner_id: userId,
        })
        .select("id")
        .single();

      if (businessError) throw businessError;

      // 2. Pertahankan kode asli update profil Anda & sisipkan business_id
      updateData.nama_usaha = nama_usaha;
      if (tipe_usaha) updateData.tipe_usaha = tipe_usaha;
      if (lama_usaha) updateData.lama_usaha = lama_usaha;
      updateData.business_id = newBusiness.id; // Menyisipkan relasi ID Business baru
    }

    // 3. Update tabel 'profiles'
    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: user_type === "umkm_aktif"
        ? "Profil bisnis berhasil disimpan! Selamat datang di Dashboard UMKM."
        : "Onboarding selesai! Selamat datang di Dashboard Calon Pengusaha.",
      data: { profile: data },
    });
  } catch (error) {
    console.error("❌ Update Onboarding Error:", error.message);
    res.status(400).json({ status: "error", message: error.message });
  }
};

// --- UPGRADE TIPE AKUN ---
const upgradeToUmkm = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama_usaha, tipe_usaha, lama_usaha } = req.body;

    if (!nama_usaha || !tipe_usaha) {
      return res.status(400).json({
        status: "error",
        message: "Nama usaha dan tipe usaha wajib diisi.",
      });
    }

    // 1. Buat data baru di tabel 'business'
      const { data: newBusiness, error: businessError } = await supabase
        .from("businesses")
        .insert({
          name: nama_usaha,
          type: tipe_usaha || null,
          owner_id: userId,
        })
        .select("id")
        .single();

      if (businessError) throw businessError;

    const { data, error } = await supabase
      .from("profiles")
      .update({
        user_type: "umkm_aktif",
        nama_usaha,
        tipe_usaha,
        lama_usaha,
        business_id: newBusiness.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Selamat! Akun Anda berhasil di-upgrade ke UMKM Aktif.",
      data: { profile: data },
    });
  } catch (error) {
    console.error("❌ Upgrade Error:", error.message);
    res.status(400).json({ status: "error", message: error.message });
  }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        
        // Ambil semua data dari body request
        const { 
            nama_lengkap, 
            email, 
            telepon, 
            bio, 
            password_lama, 
            password_baru 
        } = req.body;

        // ==========================================
        // FITUR 1: UPDATE KATA SANDI (KEAMANAN AKUN)
        // ==========================================
        if (password_lama && password_baru) {
            // Ambil email user saat ini dari database untuk proses verifikasi
            const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
            if (userError) throw userError;
            
            const currentEmail = userData.user.email;

            // Verifikasi apakah password lama benar dengan cara mencoba 'login' sementara
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: currentEmail,
                password: password_lama
            });

            if (signInError) {
                return res.status(400).json({ message: "Kata sandi lama yang Anda masukkan salah." });
            }

            // Jika password lama benar, update ke password baru menggunakan Admin API
            const { error: updatePwError } = await supabaseAdmin.auth.admin.updateUserById(userId, { 
                password: password_baru 
            });

            if (updatePwError) throw updatePwError;
        }

        // ==========================================
        // FITUR 2: UPDATE EMAIL (AUTH.USERS)
        // ==========================================
        let authUpdateData = {};
        if (email) authUpdateData.email = email;
        
        // Kita juga bisa sinkronkan nama ke metadata auth
        if (nama_lengkap) {
            authUpdateData.user_metadata = { nama: nama_lengkap };
        }

        // Eksekusi update ke auth.users jika ada perubahan email/nama
        if (Object.keys(authUpdateData).length > 0) {
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdateData);
            if (authError) throw authError;
        }

        // ==========================================
        // FITUR 3: UPDATE INFORMASI PRIBADI (PROFILES)
        // ==========================================
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                nama_lengkap: nama_lengkap,
                telepon: telepon,
                bio: bio,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (profileError) throw profileError;

        res.status(200).json({ 
            message: "Profil dan pengaturan akun berhasil diperbarui!" 
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
  getProfile,
  updateOnboarding,
  upgradeToUmkm,
  updateProfile
};