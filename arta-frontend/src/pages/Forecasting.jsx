import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { FiTrendingUp, FiAlertTriangle, FiCpu, FiCalendar } from "react-icons/fi";
import transactionService from "../services/transactionService";

const formatRp = (num) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num || 0);

export default function Forecasting() {
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState([]);
  const [recommendation, setRecommendation] = useState("");
  const [modelUsed, setModelUsed] = useState("");
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const fetchAIForecast = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const res = await transactionService.getForecast();
        // API response format: { status, method_used, actual_data, ai_prediction, insight }
        const data = res.data;
        
        if (data.status === "success") {
          let combinedData = [];
          
          // Map data aktual
          const actualMapped = (data.actual_data || []).map(item => ({
            date: item.date,
            Aktual: item.net_cashflow,
            Prediksi: null
          }));

          // Map data prediksi
          const predictionMapped = (data.ai_prediction || []).map(item => ({
            date: item.date,
            Aktual: null,
            Prediksi: item.predicted_net_cashflow
          }));

          // Sambungkan titik terakhir aktual ke prediksi agar grafik tidak putus
          if (actualMapped.length > 0 && predictionMapped.length > 0) {
            actualMapped[actualMapped.length - 1].Prediksi = actualMapped[actualMapped.length - 1].Aktual;
          }
          
          combinedData = [...actualMapped, ...predictionMapped];
          
          setForecastData(combinedData);
          setRecommendation(data.insight || "");
          setModelUsed(data.method_used || "");
        } else {
          setApiError("Gagal memuat data dari API.");
        }
      } catch (err) {
        console.error("Error API:", err);
        const backendMsg = err.response?.data?.message || err.message;
        setApiError(`Gagal mengambil prediksi AI: ${backendMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAIForecast();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Error Banner */}
      {apiError && !loading && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-start gap-3">
          <FiAlertTriangle className="mt-1 shrink-0" />
          <div>
            <h3 className="font-bold">Layanan AI sedang tidak tersedia.</h3>
            <p className="text-sm mt-1">{apiError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-white text-rose-600 rounded-lg text-sm font-bold border border-rose-200 hover:bg-rose-100"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Prediksi AI (Forecasting)</h1>
          <p className="text-slate-500 font-medium mt-1">Analisis Time-Series cerdas untuk memproyeksikan arus kas masa depan.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold text-sm border border-indigo-100 shadow-sm">
          <FiCpu className="animate-pulse" /> Model AI Aktif: {modelUsed || "Memuat..."}
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center h-[500px]">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <h3 className="font-bold text-slate-800 text-lg">Menjalankan Inference Model...</h3>
          <p className="text-slate-500 text-sm mt-2">Terhubung ke Microservice FastAPI AI</p>
        </div>
      ) : forecastData.length > 0 ? (
        <>
          {/* AI Insight Alert */}
          {recommendation && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg text-white flex gap-4 items-start relative overflow-hidden">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                <FiTrendingUp size={24} />
              </div>
              <div className="relative z-10">
                <h3 className="font-black text-lg mb-1">Rekomendasi Strategis AI</h3>
                <p className="text-indigo-100 font-medium leading-relaxed">{recommendation}</p>
              </div>
            </div>
          )}

          {/* Chart Section */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-slate-500">
                    <FiCalendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">Proyeksi Pemasukan</h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                    <span className="text-slate-600">Data Aktual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-slate-600">Prediksi AI</span>
                  </div>
                </div>
             </div>

             <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrediksi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAktual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={15} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} 
                      tickFormatter={(value) => `Rp ${value/1000}k`}
                      dx={-10}
                    />
                    <RechartsTooltip 
                      formatter={(value) => formatRp(value)}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="Aktual" stroke="#94a3b8" strokeWidth={4} fill="url(#colorAktual)" activeDot={{ r: 6 }} />
                    <Area type="monotone" dataKey="Prediksi" stroke="#6366f1" strokeWidth={4} strokeDasharray="8 6" fill="url(#colorPrediksi)" activeDot={{ r: 8 }} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
