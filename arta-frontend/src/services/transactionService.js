import api from "./api";

const transactionService = {
  // Ambil semua transaksi
  getTransactions: async (params = {}) => {
    return api.get("/api/transactions", { params });
  },

  // Ambil transaksi berdasarkan ID
  getTransactionById: async (id) => {
    return api.get(`/api/transactions/${id}`);
  },

  // Buat transaksi baru (pemasukan/pengeluaran)
  createTransaction: async (data) => {
    // Jika FormData (upload file), hapus Content-Type agar browser set boundary otomatis
    if (data instanceof FormData) {
      return api.post("/api/transactions", data, {
        headers: { "Content-Type": undefined }
      });
    }
    return api.post("/api/transactions", data);
  },

  // Update transaksi
  updateTransaction: async (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/api/transactions/${id}`, data, {
        headers: { "Content-Type": undefined }
      });
    }
    return api.put(`/api/transactions/${id}`, data);
  },

  // Hapus transaksi
  deleteTransaction: async (id) => {
    return api.delete(`/api/transactions/${id}`);
  },
  
  // Ambil laporan (reports)
  getReports: async (params = {}) => {
    return api.get("/api/reports/financial", { params });
  },

  // Ambil prediksi AI
  getForecast: async () => {
    return api.get("/api/forecast");
  }
};

export default transactionService;
