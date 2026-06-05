const supabaseAdmin = require('../config/supabaseAdmin');

// Helper function untuk mengambil business_id dari user yang sedang login (Owner/Admin peminta request)
const getRequesterBusinessId = async (userId) => {
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('business_id')
        .eq('id', userId)
        .single();

    if (error || !profile?.business_id) {
        throw new Error("Akses ditolak: Akun Anda belum terikat dengan entitas bisnis manapun.");
    }
    return profile.business_id;
};

// Helper function untuk mengecek apakah target user berada di bisnis yang sama
const verifyUserBelongsToBusiness = async (targetUserId, businessId) => {
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('business_id')
        .eq('id', targetUserId)
        .single();

    if (error || profile?.business_id !== businessId) {
        throw new Error("Akses ditolak: Karyawan ini tidak terdaftar di entitas bisnis Anda.");
    }
    return true;
};

// 1. GET: Mengambil Daftar Semua Pengguna (KHUSUS DALAM 1 BISNIS)
exports.getUsers = async (req, res) => {
    try {
        const businessId = await getRequesterBusinessId(req.user.id);

        // Tahap 1: Ambil daftar ID user yang terdaftar di bisnis ini dari tabel 'profiles'
        const { data: businessProfiles, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('business_id', businessId);
            
        if (profileError) throw profileError;

        // Buat array berisi kumpulan ID karyawan di bisnis ini
        const validUserIds = businessProfiles.map(p => p.id);

        // Tahap 2: Ambil semua user dari auth.users
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) throw authError;

        // Tahap 3: Filter agar hanya mengembalikan user yang ID-nya ada di array validUserIds
        const formattedUsers = authData.users
            .filter(user => validUserIds.includes(user.id))
            .map(user => ({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || 'Tanpa Nama',
                role: user.user_metadata?.role || 'USER',
                status: 'Aktif',
                created_at: user.created_at
            }));

        res.status(200).json(formattedUsers);
    } catch (err) {
        const status = err.message.includes("Akses ditolak") ? 403 : 500;
        res.status(status).json({ message: err.message });
    }
};

// 2. POST: Membuat Akun Karyawan Baru & Profile (OTOMATIS MASUK KE BISNIS OWNER)
exports.createUser = async (req, res) => {
    try {
        // Ambil ID Bisnis dari Owner yang sedang login
        const businessId = await getRequesterBusinessId(req.user.id);
        
        // Abaikan business_id dari req.body untuk mencegah manipulasi dari frontend
        const { name, email, role, password } = req.body;

        // Tahap 1: Buat user di sistem autentikasi (auth.users)
        // Saat ini berhasil, trigger di Supabase Anda otomatis membuat row di tabel 'profiles'
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                name: name,
                role: role.toUpperCase()
            },
        });

        if (authError) throw authError;

        const newUserId = authData.user.id;

        // Tahap 2: PERBAIKAN - Gunakan .update() bukan .insert() untuk menghindari duplicate key error
        // Kita memperbarui data profil yang sudah otomatis di-generate oleh DB Trigger
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                nama_lengkap: name,
                onboarding_completed: false, 
                business_id: businessId // <-- OTOMATIS IKUT BISNIS PEMBUATNYA
            })
            .eq('id', newUserId); // Pastikan update hanya target user_id baru ini

        // Rollback System: Jika gagal memperbarui profil, hapus user dari auth demi konsistensi data
        if (profileError) {
            await supabaseAdmin.auth.admin.deleteUser(newUserId);
            throw profileError;
        }

        res.status(201).json({ 
            message: "Akun karyawan berhasil ditambahkan ke bisnis Anda", 
            user: authData.user 
        });
    } catch (err) {
        const status = err.message.includes("Akses ditolak") ? 403 : 400;
        res.status(status).json({ message: err.message });
    }
};

// 3. PUT: Mengedit Role / Nama Karyawan (DENGAN PROTEKSI BISNIS)
exports.updateUser = async (req, res) => {
    try {
        const businessId = await getRequesterBusinessId(req.user.id);
        const { id: targetUserId } = req.params;
        const { name, role } = req.body;

        // VERIFIKASI: Pastikan karyawan yang mau diedit ini adalah karyawan di bisnisnya sendiri
        await verifyUserBelongsToBusiness(targetUserId, businessId);

        // Tahap 1: Update metadata di auth.users
        const { data, error: authError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
            user_metadata: {
                name: name,
                role: role.toUpperCase()
            }
        });

        if (authError) throw authError;

        // Tahap 2: Sinkronisasi update nama ke tabel 'profiles'
        if (name) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({ nama_lengkap: name })
                .eq('id', targetUserId);
            
            if (profileError) throw profileError;
        }

        res.status(200).json({ 
            message: "Data karyawan berhasil diperbarui", 
            user: data.user 
        });
    } catch (err) {
        const status = err.message.includes("Akses ditolak") ? 403 : 400;
        res.status(status).json({ message: err.message });
    }
};

// 4. DELETE: Menghapus Akun Karyawan (DENGAN PROTEKSI BISNIS)
exports.deleteUser = async (req, res) => {
    try {
        const businessId = await getRequesterBusinessId(req.user.id);
        const { id: targetUserId } = req.params;

        // VERIFIKASI: Jangan sampai Owner A menghapus karyawan Owner B dengan menebak UUID
        await verifyUserBelongsToBusiness(targetUserId, businessId);

        // Hapus Karyawan
        const { data, error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

        if (error) throw error;

        res.status(200).json({ message: "Karyawan berhasil dihapus dari sistem." });
    } catch (err) {
        const status = err.message.includes("Akses ditolak") ? 403 : 400;
        res.status(status).json({ message: err.message });
    }
};