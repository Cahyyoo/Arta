const supabase = require('../config/supabase');

// Helper untuk format Rupiah di dalam teks Insight
const formatIDR = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

exports.getFinancialReport = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Dapatkan ID Bisnis (Multi-Tenancy)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('business_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile?.business_id) {
            return res.status(403).json({ message: "Akses ditolak: Entitas bisnis tidak ditemukan." });
        }
        const businessId = profile.business_id;

        // 2. Tentukan Rentang Waktu (Bulan Ini & Bulan Lalu)
        // Catatan: Ini bisa dibuat dinamis menerima query param ?month=05&year=2026 jika frontend butuh filter dropdown
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        const firstDayCurrent = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
        const lastDayCurrent = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
        
        const firstDayLast = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
        const lastDayLast = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

        // 3. Tarik Data Transaksi
        const { data: currentMonthData, error: currentError } = await supabase
            .from('transactions')
            .select('amount, type, category, date')
            .eq('business_id', businessId)
            .gte('date', firstDayCurrent)
            .lte('date', lastDayCurrent);

        const { data: lastMonthData, error: lastError } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('business_id', businessId)
            .gte('date', firstDayLast)
            .lte('date', lastDayLast);

        if (currentError || lastError) throw currentError || lastError;

        const currentTx = currentMonthData || [];
        const lastTx = lastMonthData || [];

        // 4. Kalkulasi Ringkasan (Summary)
        const sumType = (data, type) => data.filter(t => t.type === type).reduce((sum, t) => sum + Number(t.amount), 0);
        
        const totalIncome = sumType(currentTx, 'Pemasukan');
        const totalExpense = sumType(currentTx, 'Pengeluaran');
        const netProfit = totalIncome - totalExpense;
        const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

        const lastIncome = sumType(lastTx, 'Pemasukan');
        const lastExpense = sumType(lastTx, 'Pengeluaran');

        const calcChange = (curr, prev) => prev === 0 ? (curr > 0 ? 100 : 0) : (((curr - prev) / prev) * 100).toFixed(1);
        const incomeChange = calcChange(totalIncome, lastIncome);
        const expenseChange = calcChange(totalExpense, lastExpense);

        let healthStatus = netProfit > 0 ? (profitMargin > 20 ? "Sehat & Stabil" : "Cukup Baik") : "Perlu Perhatian";

        // 5. Distribusi Pengeluaran (Pie Chart) & Agregasi Pemasukan
        const groupByCategory = (type) => {
            const grouped = currentTx.filter(t => t.type === type).reduce((acc, curr) => {
                acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
                return acc;
            }, {});
            
            // Ubah objek ke array dan urutkan dari terbesar ke terkecil
            return Object.keys(grouped).map(key => ({
                category: key,
                amount: grouped[key]
            })).sort((a, b) => b.amount - a.amount);
        };

        const expenseDistribution = groupByCategory('Pengeluaran');
        const incomeDistribution = groupByCategory('Pemasukan');

        // 6. Manual "AI" Insights Generator
        let expenseInsight = "Belum ada data pengeluaran yang signifikan bulan ini.";
        if (expenseDistribution.length >= 2) {
            expenseInsight = `Pengeluaran terbesar periode ini berada pada kategori ${expenseDistribution[0].category} (${formatIDR(expenseDistribution[0].amount)}) dan ${expenseDistribution[1].category} (${formatIDR(expenseDistribution[1].amount)}).`;
        } else if (expenseDistribution.length === 1) {
            expenseInsight = `Pengeluaran tunggal terbesar periode ini adalah ${expenseDistribution[0].category} sebesar ${formatIDR(expenseDistribution[0].amount)}.`;
        }

        let incomeInsight = "Belum ada pemasukan yang tercatat bulan ini.";
        if (incomeDistribution.length > 0) {
            const statusArus = netProfit > 0 ? "positif" : "negatif";
            incomeInsight = `Arus kas berjalan ${statusArus}. Sumber pendapatan terbesar: ${incomeDistribution[0].category} (${formatIDR(incomeDistribution[0].amount)}).`;
        }

        // 7. Grafik Arus Kas Harian
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dailyCashflow = [];
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayTx = currentTx.filter(t => t.date.startsWith(dateStr));
            
            dailyCashflow.push({
                date: `${String(i).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}`,
                income: sumType(dayTx, 'Pemasukan'),
                expense: sumType(dayTx, 'Pengeluaran')
            });
        }

        // 8. Kirim Response
        res.status(200).json({
            summary: {
                total_income: totalIncome,
                income_change_percent: Number(incomeChange),
                total_expense: totalExpense,
                expense_change_percent: Number(expenseChange),
                net_profit: netProfit,
                profit_margin_percent: Number(profitMargin),
                health_status: healthStatus
            },
            insights: {
                expense_insight: expenseInsight,
                income_insight: incomeInsight
            },
            expense_distribution: expenseDistribution,
            daily_cashflow: dailyCashflow
        });

    } catch (err) {
        res.status(500).json({ message: "Gagal memuat laporan keuangan", error: err.message });
    }
};