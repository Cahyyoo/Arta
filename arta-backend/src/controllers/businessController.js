const supabase = require('../config/supabase'); // Sesuaikan dengan lokasi instance Supabase client-mu

exports.updateBusiness = async (req, res) => {
    try {
        // 1. Ambil ID user yang sedang login dari middleware
        const userId = req.user.id; 

        // 2. Cari business_id dari tabel profiles
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('business_id')
            .eq('id', userId)
            .single();

        if (profileError) {
            return res.status(500).json({ message: "Gagal mengambil data profil", error: profileError.message });
        }

        if (!profile || !profile.business_id) {
            return res.status(404).json({ message: "Data bisnis tidak ditemukan untuk akun ini" });
        }

        const businessId = profile.business_id;

        // 3. Ambil data dari form frontend (req.body)
        const { 
            name, 
            type, 
            industry, 
            address, 
            phone, 
            email, 
            website, 
            npwp,
            founded_year,   
            employee_count, 
            description,    
            instagram,      
            nib
        } = req.body;

        // 4. Update tabel businesses
        const { data: updatedBusiness, error: updateError } = await supabase
            .from('businesses')
            .update({
                name,
                type,
                industry,
                address,
                phone,
                email,
                website,
                npwp,
                founded_year,    
                employee_count,  
                description,     
                instagram,       
                nib,
                updated_at: new Date().toISOString() // Otomatis catat waktu update
            })
            .eq('id', businessId)
            .select()
            .single();

        if (updateError) throw updateError;

        res.status(200).json({
            message: "Pengaturan sistem (Identitas Usaha) berhasil disimpan",
            data: updatedBusiness
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};