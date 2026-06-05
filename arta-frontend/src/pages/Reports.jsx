import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FiDownload, FiPieChart,
  FiTrendingUp, FiTrendingDown, FiLayers, FiFileText, FiChevronDown, FiAlertCircle
} from "react-icons/fi";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import transactionService from "../services/transactionService";
import { computeDailyCashflow, filterTransactionsByRange } from "../utils/cashflowHelper";

const categoryColors = {
  "Penjualan Produk": "#10b981",
  "Penjualan Jasa": "#14b8a6",
  "Pendapatan Lainnya": "#06b6d4",
  "Penjualan": "#10b981",
  "Bahan Baku": "#f59e0b",
  "Operasional": "#3b82f6",
  "Pemasaran": "#a855f7",
  "Gaji": "#f43f5e",
  "Gaji Karyawan": "#f43f5e",
  "Peralatan": "#64748b",
  "Sewa Tempat": "#6366f1",
  "Lainnya": "#9ca3af",
};

export default function Reports() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState("bulan_ini");

  const rangeMap = {
    "7_hari": "last_7_days",
    "bulan_ini": "this_month",
    "bulan_lalu": "last_month",
    "tahun_ini": "this_year",
    "tahun_lalu": "last_year",
  };
  
  const [reportData, setReportData] = useState(null);
  const [activeTransactions, setActiveTransactions] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number || 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const apiRange = rangeMap[dateRange] || dateRange;
        const [reportsRes, txRes, forecastRes] = await Promise.all([
          transactionService.getReports({ range: apiRange }),
          transactionService.getTransactions().catch(() => ({ data: [] })),
          transactionService.getForecast().catch(() => ({ data: {} }))
        ]);
        
        const rData = reportsRes.data?.data || reportsRes.data || {};
        setReportData(rData);
        
        const tData = txRes.data?.data || txRes.data || [];
        setActiveTransactions(Array.isArray(tData) ? tData : (tData.transactions || []));

        // Process forecast data
        const fcData = forecastRes.data?.data || forecastRes.data || {};
        if (fcData.ai_prediction) {
          setForecastData(fcData.ai_prediction.map((item) => ({
            date: item.date,
            Prediksi: item.predicted_net_cashflow
          })));
        } else if (fcData.forecast_data) {
          setForecastData(
            fcData.forecast_data
              .filter((item) => item.predicted != null)
              .map((item) => ({
                date: item.date,
                Prediksi: item.predicted
              }))
          );
        } else {
          setForecastData([]);
        }
      } catch (err) {
        console.error("Gagal fetch laporan:", err);
        setApiError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  // Trends from API
  const trends = useMemo(() => {
    const incChange = reportData?.summary?.income_change_percent || 0;
    const expChange = reportData?.summary?.expense_change_percent || 0;
    return {
      income: (incChange > 0 ? "+" : "") + incChange + "%",
      expense: (expChange > 0 ? "+" : "") + expChange + "%",
      incomeUp: incChange >= 0,
      expenseUp: expChange >= 0
    };
  }, [reportData]);

  const profitMargin = reportData?.summary?.profit_margin_percent || 0;
  const healthStatus = reportData?.summary?.health_status || "Belum Ada Data";

  // Transactions filtered by selected date range
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByRange(activeTransactions, dateRange);
  }, [activeTransactions, dateRange]);

  // Metrics computed from actual filtered transactions
  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((trx) => {
      const type = (trx.type || "").toLowerCase();
      const amount = Math.abs(Number(trx.amount || 0));
      if (type === "pemasukan" || type === "income") {
        income += amount;
      } else if (type === "pengeluaran" || type === "expense") {
        expense += amount;
      }
    });
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  // Chart data computed from actual transactions (filtered by date range)
  const cashFlowData = useMemo(() => {
    const daily = computeDailyCashflow(filteredTransactions);
    return daily.map((d) => ({
      date: d.date,
      Pemasukan: d.income,
      Pengeluaran: d.expense,
    }));
  }, [filteredTransactions]);

  // Merged chart data: historical cash flow + future predictions
  const mergedChartData = useMemo(() => {
    const historicalWithNull = cashFlowData.map((d) => ({
      ...d,
      Prediksi: null,
    }));

    const predictionWithNull = forecastData.map((d) => ({
      date: d.date,
      Pemasukan: null,
      Pengeluaran: null,
      Prediksi: d.Prediksi,
    }));

    // Merge: keep historical order, append future predictions (avoid duplicate dates)
    const all = [...historicalWithNull];
    predictionWithNull.forEach((p) => {
      if (!all.some((a) => a.date === p.date)) {
        all.push(p);
      }
    });
    return all;
  }, [cashFlowData, forecastData]);

  // Dynamic chart title
  const chartTitle = useMemo(() => {
    const titles = {
      "7_hari": t('reports.daily_cashflow_7d'),
      "bulan_ini": t('reports.daily_cashflow'),
      "bulan_lalu": t('reports.daily_cashflow_last'),
      "tahun_ini": t('reports.monthly_cashflow'),
      "tahun_lalu": t('reports.monthly_cashflow_last'),
    };
    return titles[dateRange] || t('reports.daily_cashflow');
  }, [dateRange, t]);

  // Expense Pie data from filtered transactions
  const expenseData = useMemo(() => {
    const expenseMap = {};
    filteredTransactions.forEach((trx) => {
      const type = (trx.type || "").toLowerCase();
      if (type === "pengeluaran" || type === "expense") {
        const cat = trx.category || "Lainnya";
        expenseMap[cat] = (expenseMap[cat] || 0) + Math.abs(Number(trx.amount || 0));
      }
    });
    return Object.entries(expenseMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // AI Insights from API
  const expenseInsight = reportData?.insights?.expense_insight || t('reports.insight_no_data');
  const incomeInsight = reportData?.insights?.income_insight || t('reports.insight_no_data');

  // --- EXPORT FUNCTIONS ---
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Keuangan');

    worksheet.columns = [
      { header: '', key: 'akun', width: 40 },
      { header: '', key: 'catatan', width: 15 },
      { header: '', key: 'nominal1', width: 25 },
      { header: '', key: 'nominal2', width: 25 }
    ];

    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = 'UMKM ARTHA';
    worksheet.getCell('A1').font = { bold: true, size: 14 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:D2');
    worksheet.getCell('A2').value = 'Laporan Keuangan';
    worksheet.getCell('A2').font = { bold: true, size: 12 };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A3:D3');
    worksheet.getCell('A3').value = `Periode: ${dateRange}`;
    worksheet.getCell('A3').font = { bold: true, size: 11 };
    worksheet.getCell('A3').alignment = { horizontal: 'center' };

    worksheet.addRow([]);

    const headerRow = worksheet.addRow(['Keterangan', 'Catatan', 'Sub Total', 'Total']);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.border = { top: { style: 'thin' }, bottom: { style: 'double' } };
      cell.alignment = { horizontal: 'center' };
    });

    const addRowWithBorder = (data, isBold = false) => {
      const row = worksheet.addRow(data);
      if (isBold) row.font = { bold: true };
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1 || colNumber === 3 || colNumber === 4) {
          cell.border = {
            bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
          };
        }
      });
      return row;
    };

    addRowWithBorder(['PEMASUKAN', '', '', ''], true);
    const pemasukanKategori = {};
    filteredTransactions.filter(tr => tr.type === 'Pemasukan').forEach(tr => {
      if (!pemasukanKategori[tr.category]) pemasukanKategori[tr.category] = 0;
      pemasukanKategori[tr.category] += tr.amount;
    });
    Object.entries(pemasukanKategori).forEach(([kategori, total]) => {
      addRowWithBorder([kategori, '', total, '']);
    });

    const totalPemasukanRow = worksheet.addRow(['Jumlah Pemasukan', '', '', metrics.income]);
    totalPemasukanRow.font = { bold: true };
    totalPemasukanRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA9D08E' } };
    totalPemasukanRow.eachCell(cell => {
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' } };
    });

    worksheet.addRow([]);

    addRowWithBorder(['PENGELUARAN', '', '', ''], true);
    const pengeluaranKategori = {};
    filteredTransactions.filter(tr => tr.type === 'Pengeluaran').forEach(tr => {
      if (!pengeluaranKategori[tr.category]) pengeluaranKategori[tr.category] = 0;
      pengeluaranKategori[tr.category] += tr.amount;
    });
    Object.entries(pengeluaranKategori).forEach(([kategori, total]) => {
      addRowWithBorder([kategori, '', total, '']);
    });

    const totalPengeluaranRow = worksheet.addRow(['Jumlah Pengeluaran', '', '', metrics.expense]);
    totalPengeluaranRow.font = { bold: true };
    totalPengeluaranRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA9D08E' } };
    totalPengeluaranRow.eachCell(cell => {
      cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' } };
    });

    worksheet.addRow([]);

    const labaBersihRow = worksheet.addRow(['LABA BERSIH', '', '', metrics.balance]);
    labaBersihRow.font = { bold: true, size: 12 };
    labaBersihRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA9D08E' } };
    labaBersihRow.eachCell(cell => {
      cell.border = { top: { style: 'thin' }, bottom: { style: 'double' } };
    });

    worksheet.getColumn(3).numFmt = '"Rp "* #,##0;"Rp "* -#,##0;"Rp "* "-"';
    worksheet.getColumn(4).numFmt = '"Rp "* #,##0;"Rp "* -#,##0;"Rp "* "-"';

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Laporan_Keuangan_${dateRange}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Laporan Keuangan UMKM", 14, 22);
    doc.setFontSize(11);
    doc.text(`Periode: ${dateRange}`, 14, 30);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 36);

    doc.setFontSize(12);
    doc.text(`Total Pemasukan: ${formatRupiah(metrics.income)}`, 14, 48);
    doc.text(`Total Pengeluaran: ${formatRupiah(metrics.expense)}`, 14, 55);
    doc.text(`Laba Bersih: ${formatRupiah(metrics.balance)}`, 14, 62);

    const tableColumn = ["Tanggal", "Keterangan", "Kategori", "Tipe", "Nominal"];
    const tableRows = filteredTransactions.map(trx => [
      trx.date, trx.description, trx.category, trx.type, formatRupiah(trx.amount)
    ]);

    doc.autoTable({
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`Laporan_Keuangan_${dateRange}.pdf`);
  };

  // Range label map for display
  const rangeLabels = {
    "7_hari": t("reports.last_7_days"),
    "bulan_ini": t("reports.this_month"),
    "bulan_lalu": t("reports.last_month"),
    "tahun_ini": t("reports.this_year"),
    "tahun_lalu": t("reports.last_year"),
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
    
      {/* Error Banner */}
      {apiError && !isLoading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
          <FiAlertCircle className="text-rose-500 shrink-0" size={20} />
          <p className="text-sm font-semibold text-rose-700">{apiError}</p>
        </div>
      )}

      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">{t('reports.title')}</h1>
          <p className="text-slate-500 font-medium mt-1">{t('reports.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer shadow-sm appearance-none"
            >
              <option value="7_hari">{t('reports.last_7_days')}</option>
              <option value="bulan_ini">{t('reports.this_month')}</option>
              <option value="bulan_lalu">{t('reports.last_month')}</option>
              <option value="tahun_ini">{t('reports.this_year')}</option>
              <option value="tahun_lalu">{t('reports.last_year')}</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <FiFileText />
            <span className="hidden sm:inline">{t('reports.export_excel')}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
          >
            <FiDownload size={16} />
            <span className="hidden sm:inline">{t('reports.download_pdf')}</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 relative z-10">
        {/* Income */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="block text-xs sm:text-sm font-medium text-slate-500 mb-2 sm:mb-4 truncate">
                {t('reports.total_income')}
              </span>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                  {formatRupiah(metrics.income)}
                </h3>
                <div className="flex flex-wrap items-center gap-1 mt-1 sm:mt-2">
                  <span className={`text-[10px] sm:text-xs font-medium ${trends.incomeUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {trends.income}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 truncate">{t('reports.vs_last_month')}</span>
                </div>
              </div>
            </div>
            <div className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl ${trends.incomeUp ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
              {trends.incomeUp ? <FiTrendingUp size={18} /> : <FiTrendingDown size={18} />}
            </div>
          </div>
        </div>

        {/* Expense */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="block text-xs sm:text-sm font-medium text-slate-500 mb-2 sm:mb-4 truncate">
                {t('reports.total_expense')}
              </span>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                  {formatRupiah(metrics.expense)}
                </h3>
                <div className="flex flex-wrap items-center gap-1 mt-1 sm:mt-2">
                  <span className={`text-[10px] sm:text-xs font-medium ${!trends.expenseUp ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {trends.expense}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 truncate">{t('reports.vs_last_month')}</span>
                </div>
              </div>
            </div>
            <div className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl ${trends.expenseUp ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
              {trends.expenseUp ? <FiTrendingUp size={18} /> : <FiTrendingDown size={18} />}
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="block text-xs sm:text-sm font-medium text-slate-500 mb-2 sm:mb-4 truncate">
                {t('reports.net_profit')}
              </span>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                  {formatRupiah(metrics.balance)}
                </h3>
                <div className="flex flex-wrap items-center gap-1 mt-1 sm:mt-2">
                  <span className="text-[10px] sm:text-xs font-medium text-emerald-500">
                    {t('reports.profit_margin')}: {profitMargin}%
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 truncate">{healthStatus}</span>
                </div>
              </div>
            </div>
            <div className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl ${metrics.balance >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
              {metrics.balance >= 0 ? <FiTrendingUp size={18} /> : <FiTrendingDown size={18} />}
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <FiLayers size={16} />
          </div>
          <h3 className="text-lg font-black text-slate-800">{t('reports.ai_insights')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/60 p-4 rounded-xl border border-white shadow-sm">
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              {expenseInsight}
            </p>
          </div>
          <div className="bg-white/60 p-4 rounded-xl border border-white shadow-sm">
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              {incomeInsight}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Cash Flow Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black text-slate-800">{chartTitle}</h3>
            </div>
            <div className="flex items-center gap-4">
              {/* Inline legend */}
              <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Pemasukan</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Pengeluaran</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span> {t('reports.prediction')}</span>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider border border-slate-200 rounded-lg px-2.5 py-1.5">{rangeLabels[dateRange]}</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height={288}>
              <AreaChart data={mergedChartData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                  dy={10}
                  interval={["bulan_ini", "bulan_lalu", "7_hari"].includes(dateRange) ? 4 : 0}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                  tickFormatter={(v) => {
                    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}jt`;
                    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                    return v;
                  }}
                  width={50}
                />
                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
                <RechartsTooltip
                  formatter={(value, name) => [formatRupiah(value), name]}
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
                    padding: '12px 16px',
                  }}
                  itemStyle={{ fontWeight: '600', fontSize: '13px' }}
                  labelStyle={{ color: '#1e293b', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}
                />
                <Area
                  type="monotone"
                  dataKey="Pemasukan"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPemasukan)"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#10b981' }}
                />
                <Area
                  type="monotone"
                  dataKey="Pengeluaran"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPengeluaran)"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#f43f5e' }}
                />
                <Area
                  type="monotone"
                  dataKey="Prediksi"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fill="none"
                  dot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-black text-slate-800">{t('reports.expense_distribution')}</h3>
            <FiPieChart className="text-slate-400" />
          </div>
          <div className="flex-1 flex flex-col justify-center relative min-h-[250px]">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.name] || categoryColors["Lainnya"]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value) => formatRupiah(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom inner text for donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-slate-400">{t('reports.total')}</span>
              <span className="text-sm font-black text-slate-800">{formatRupiah(metrics.expense)}</span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="mt-4 space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {expenseData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[item.name] || categoryColors["Lainnya"] }}></div>
                  <span className="font-semibold text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{formatRupiah(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
