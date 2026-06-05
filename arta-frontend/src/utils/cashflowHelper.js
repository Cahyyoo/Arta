export function computeDailyCashflow(transactions) {
  const dailyMap = {};

  (transactions || []).forEach((tx) => {
    const date = tx.date || tx.transaction_date || "";
    if (!date) return;

    if (!dailyMap[date]) {
      dailyMap[date] = { date, income: 0, expense: 0 };
    }

    const type = (tx.type || "").toLowerCase();
    const amount = Math.abs(Number(tx.amount || tx.nominal || 0));

    if (type === "pemasukan" || type === "income") {
      dailyMap[date].income += amount;
    } else if (type === "pengeluaran" || type === "expense") {
      dailyMap[date].expense += amount;
    }
  });

  return Object.values(dailyMap).sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return 0;
  });
}

export function filterTransactionsByRange(transactions, range) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

  let startDate = "";
  let endDate = today;

  switch (range) {
    case "hari_ini":
      startDate = today;
      break;
    case "minggu_ini":
    case "last_7_days": {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      startDate = d.toISOString().split("T")[0];
      break;
    }
    case "bulan_ini":
    case "this_month":
      startDate = `${currentYear}-${currentMonth}-01`;
      break;
    case "last_month": {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      startDate = `${y}-${m}-01`;
      // last day of previous month
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      endDate = `${y}-${m}-${String(lastDay).padStart(2, "0")}`;
      break;
    }
    case "tahun_ini":
    case "this_year":
      startDate = `${currentYear}-01-01`;
      break;
    case "tahun_lalu":
    case "last_year": {
      startDate = `${currentYear - 1}-01-01`;
      endDate = `${currentYear - 1}-12-31`;
      break;
    }
    case "7_hari": {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      startDate = d.toISOString().split("T")[0];
      break;
    }
    case "bulan_lalu":
      return filterTransactionsByRange(transactions, "last_month");
    default:
      return transactions;
  }

  return (transactions || []).filter((tx) => {
    const txDate = tx.date || tx.transaction_date || "";
    return txDate >= startDate && txDate <= endDate;
  });
}

export function normalizeTransactions(rawData) {
  const data = rawData?.data || rawData || [];
  return (Array.isArray(data) ? data : []).map((trx) => ({
    id: trx.id || trx._id,
    date: trx.date || trx.transaction_date || trx.created_at?.split("T")[0] || "",
    description: trx.description || trx.keterangan || "-",
    category: trx.category || trx.kategori || "Lainnya",
    type: trx.type || trx.tipe || (trx.amount >= 0 ? "Pemasukan" : "Pengeluaran"),
    amount: Math.abs(Number(trx.amount || trx.nominal || 0)),
    invoice: trx.invoice || trx.bukti || null,
    invoiceUrl: trx.invoice_url || trx.bukti_url || null,
  }));
}
