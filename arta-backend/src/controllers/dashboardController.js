const supabase = require('../config/supabase');

exports.getOverview = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. IDENTIFIKASI BISNIS (ISOLASI DATA) ---
        // Mencari tahu bisnis mana yang dimiliki/dikelola oleh user yang sedang login
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('business_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile?.business_id) {
            return res.status(403).json({ 
                message: "Akses ditolak: Akun Anda belum terikat dengan entitas bisnis manapun." 
            });
        }

        const businessId = profile.business_id;

        // --- 2. SETTING WAKTU (Bulan Ini & Bulan Lalu) ---
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); // 0-11

        // Format tanggal YYYY-MM-DD
        const firstDayCurrent = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
        const lastDayCurrent = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
        
        const firstDayLast = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
        const lastDayLast = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

        // --- 3. AMBIL DATA TRANSAKSI (DIFILTER BERDASARKAN BUSINESS_ID) ---
        // Transaksi bulan ini
        const { data: currentMonthData, error: currentError } = await supabase
            .from('transactions')
            .select('amount, type, date')
            .eq('business_id', businessId) // <-- PENTING: Isolasi data bisnis berjalan di sini
            .gte('date', firstDayCurrent)
            .lte('date', lastDayCurrent);

        // Transaksi bulan lalu (untuk persentase naik/turun)
        const { data: lastMonthData, error: lastError } = await supabase
            .from('transactions')
            .select('amount, type, date')
            .eq('business_id', businessId) // <-- PENTING
            .gte('date', firstDayLast)
            .lte('date', lastDayLast);

        // 5 Transaksi terakhir
        const { data: recentTransactions, error: recentError } = await supabase
            .from('transactions')
            .select('id, date, description, category, type, amount')
            .eq('business_id', businessId) // <-- PENTING
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(5);

        if (currentError || lastError || recentError) throw currentError || lastError || recentError;

        // --- 4. KALKULASI SUMMARY CARDS ---
        const sumAmounts = (data, typeFilter) => 
            data.filter(t => t.type === typeFilter).reduce((sum, t) => sum + Number(t.amount), 0);

        const currentIncome = sumAmounts(currentMonthData || [], 'Pemasukan');
        const currentExpense = sumAmounts(currentMonthData || [], 'Pengeluaran');
        const currentNetProfit = currentIncome - currentExpense;

        const lastIncome = sumAmounts(lastMonthData || [], 'Pemasukan');
        const lastExpense = sumAmounts(lastMonthData || [], 'Pengeluaran');

        // Fungsi hitung persentase (MoM)
        const calculatePercentage = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const incomeChange = calculatePercentage(currentIncome, lastIncome);
        const expenseChange = calculatePercentage(currentExpense, lastExpense);

        // Status Kesehatan Finansial
        let healthStatus = "Needs Attention";
        if (currentNetProfit > 0) {
            healthStatus = currentIncome >= currentExpense * 1.5 ? "Very Healthy" : "Healthy";
        }

        // --- 5. KALKULASI GRAFIK HARIAN (CHART DATA) ---
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        const monthName = monthNames[currentMonth];

        const chartData = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayTransactions = (currentMonthData || []).filter(t => t.date.startsWith(dateString));

            const dailyIncome = sumAmounts(dayTransactions, 'Pemasukan');
            const dailyExpense = sumAmounts(dayTransactions, 'Pengeluaran');

            chartData.push({
                date: `${String(i).padStart(2, '0')} ${monthName}`,
                income: dailyIncome,
                expense: dailyExpense
            });
        }

        // --- 6. RESPONSE FINAL ---
        res.status(200).json({
            summary: {
                income: currentIncome,
                income_change: incomeChange,
                expense: currentExpense,
                expense_change: expenseChange,
                net_profit: currentNetProfit,
                health_status: healthStatus
            },
            chart_data: chartData,
            recent_transactions: recentTransactions || []
        });

    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil data dashboard", error: err.message });
    }
};