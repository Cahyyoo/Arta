const supabase = require('../config/supabase'); 
const axios = require('axios'); // Pastikan axios sudah di-import di atas file

exports.getForecast = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Dapatkan Profil dan ID Bisnis
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('business_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile?.business_id) {
            return res.status(403).json({ message: "Akses ditolak: Entitas bisnis tidak ditemukan." });
        }
        const businessId = profile.business_id;

        // 2. Dapatkan Detail Bisnis
        // Catatan: Pastikan nama tabel Anda sesuai ('businesses' atau 'business')
        const { data: business, error: businessError } = await supabase
            .from('businesses') 
            .select('name, industry')
            .eq('id', businessId)
            .single();
            
        if (businessError) throw businessError;

        const sector = business.industry ? business.industry.toLowerCase().replace(/\s+/g, '_') : 'default';
        
        // PERBAIKAN: Format company_id agar spasi diganti dengan underscore sesuai kebutuhan model ML
        const companyId = business.name 
            ? business.name.trim().replace(/\s+/g, '_') 
            : `Business_${businessId}`;

        // 3. Kumpulkan Transaksi 30 Hari Terakhir
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];
        const endDateStr = today.toISOString().split('T')[0];

        const { data: transactions, error: txError } = await supabase
            .from('transactions')
            .select('amount, type, date')
            .eq('business_id', businessId)
            .gte('date', startDateStr)
            .lte('date', endDateStr);

        if (txError) throw txError;

        // 4. Agregasi Harian (30 hari berurutan)
        const historical_data = [];
        let totalNetTerakhir = 0; 

        // Gunakan baseDate agar terhindar dari bug zona waktu saat ganti bulan/hari
        const todays = new Date();
        const baseDate = new Date(todays.getFullYear(), todays.getMonth(), todays.getDate());

        for (let i = 29; i >= 0; i--) {
            const targetDate = new Date(baseDate);
            targetDate.setDate(baseDate.getDate() - i);
            
            // Format manual YYYY-MM-DD
            const year = targetDate.getFullYear();
            const month = String(targetDate.getMonth() + 1).padStart(2, '0');
            const day = String(targetDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const dailyTx = transactions.filter(t => t.date.startsWith(dateStr));
            
            const income = Math.round(dailyTx.filter(t => t.type === 'Pemasukan').reduce((sum, t) => sum + Number(t.amount), 0));
            const expense = Math.round(dailyTx.filter(t => t.type === 'Pengeluaran').reduce((sum, t) => sum + Number(t.amount), 0));
            const net = income - expense;

            // Memasukkan data ke dalam array dalam bentuk objek persis seperti contoh Anda
            historical_data.push({
                "date": dateStr,
                "income": income,
                "expense": expense,
                "net": net
            });
            
            if (i < 7) totalNetTerakhir += net; 
        }

        const rataRataAktual = totalNetTerakhir / 7;

        // 5. Kirim Payload ke ML API (FastAPI)
        const mlPayload = {
            "company_id": companyId,
            "historical_data": historical_data
            }

            console.log(JSON.stringify(mlPayload.historical_data, null, 2));

        
        let mlResponse;
        try {

            const response = await axios.post(`https://web-production-eaf78.up.railway.app/forecast/${sector}`, mlPayload);
            console.log("ini adalah isi mlPayload" + mlPayload);
            mlResponse = response.data;
        } catch (mlError) {
            console.error("ML API Error:", mlError.response?.data || mlError.message);
            return res.status(503).json({ 
                message: "Layanan AI sedang tidak tersedia.",
                historical_data: historical_data
            });
        }

        // 6. Generate AI Insight (Rekomendasi Strategis Berdasarkan Hasil)
        let aiInsight = "Tren arus kas diprediksi stabil. Pertahankan efisiensi operasional saat ini.";
        const predictions = mlResponse.data.forecast;
        
        if (predictions && predictions.length > 0) {
            const totalPrediksi = predictions.reduce((sum, item) => sum + item.predicted_net_cashflow, 0);
            const rataRataPrediksi = totalPrediksi / predictions.length;

            const batasLonjakan = rataRataAktual * 1.1; 
            const batasPenurunan = rataRataAktual * 0.9; 

            const tanggalAkhirPrediksi = new Date(predictions[predictions.length - 1].date);
            const formatTanggal = tanggalAkhirPrediksi.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

            if (rataRataPrediksi > batasLonjakan) {
                aiInsight = `Tren pendapatan diprediksi akan mengalami lonjakan hingga ${formatTanggal}. Disarankan untuk menambah stok Bahan Baku pada pertengahan bulan untuk mengantisipasi lonjakan permintaan.`;
            } else if (rataRataPrediksi < batasPenurunan) {
                aiInsight = `Arus kas diprediksi mengalami penurunan menjelang ${formatTanggal}. Disarankan untuk menekan biaya operasional harian atau menggencarkan promosi penjualan.`;
            }
        }

        // 7. Format Ulang Data Gabungan Untuk Frontend Chart
        res.status(200).json({
            status: "success",
            method_used: mlResponse.data.method_used, 
            actual_data: historical_data.map(item => ({
                date: item.date,
                net_cashflow: item.net
            })),
            ai_prediction: predictions, 
            insight: aiInsight
        });

    } catch (err) {
        res.status(500).json({ message: "Gagal memproses forecasting.", error: err.message });
    }
};