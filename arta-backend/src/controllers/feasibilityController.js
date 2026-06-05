const supabase = require('../config/supabase'); 
const axios = require('axios');

// 1. POST: Menyimpan Data Kuesioner & Mengirim ke Model AI
exports.submitQuestionnaire = async (req, res) => {
    try {
        const userId = req.user.id;

        // Ambil payload yang dikirim dari frontend (format persis sesuai AI)
        const {
            Age,
            Education,
            Initial_Capital,
            Financial_Record_Keeping,
            Internet_Usage,
            Business_Plan,
            Marketing_Effort,
            Partnership,
            Parent_Business_Experience,
            Industry_Experience,
            Owner_Gender,
            Professional_Advice
        } = req.body;

        // Validasi sederhana
        if (Age === undefined || Education === undefined) {
            return res.status(400).json({ message: "Data form belum lengkap!" });
        }

        // --- TAHAP 1: SIMPAN DATA ORIGINAL KE SUPABASE ---
        // Mapping dari CamelCase (API AI) ke snake_case (Kolom Database)
        const { data: dbData, error: dbError } = await supabase
            .from('business_feasibility_questionnaires')
            .insert([{
                user_id: userId,
                age: Age,
                education: Education,
                initial_capital: Initial_Capital,
                financial_record_keeping: Financial_Record_Keeping,
                internet_usage: Internet_Usage,
                business_plan: Business_Plan,
                marketing_effort: Marketing_Effort,
                partnership: Partnership,
                parent_business_experience: Parent_Business_Experience,
                industry_experience: Industry_Experience,
                owner_gender: Owner_Gender,
                professional_advice: Professional_Advice,
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (dbError) throw dbError;

        // --- TAHAP 2: PAYLOAD UNTUK MODEL AI ---
        const mlPayload = {
            Age,
            Education,
            Initial_Capital,
            Financial_Record_Keeping,
            Internet_Usage,
            Business_Plan,
            Marketing_Effort,
            Partnership,
            Parent_Business_Experience,
            Industry_Experience,
            Owner_Gender,
            Professional_Advice
        };

        // --- TAHAP 3: HIT API MACHINE LEARNING ---
        let aiPrediction = null;
        try {
            const mlApiUrl = "https://api-prediksi-sukses-bisnis-production.up.railway.app";
            const aiResponse = await axios.post(`${mlApiUrl}/predict`, mlPayload);
            aiPrediction = aiResponse.data;
        } catch (mlError) {
            console.error("Gagal menghubungi Model AI Kelayakan:", mlError.message);
        }

        // Kembalikan response gabungan
        res.status(201).json({
            message: "Kuesioner kelayakan berhasil dianalisis!",
            saved_data: dbData,
            ai_prediction: aiPrediction || { message: "AI saat ini tidak tersedia", default_score: 50 }
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 2. GET: Mengambil Riwayat/Data Kuesioner Terbaru Milik User
exports.getLatestResponse = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('business_feasibility_questionnaires')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "Kamu belum pernah mengisi kuesioner kelayakan." });
        }

        res.status(200).json(data[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};