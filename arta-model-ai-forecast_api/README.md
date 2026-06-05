# Arta Cashflow Forecasting API

API prediksi arus kas bersih (net cashflow) UMKM berbasis **LSTM Deep Learning** per sektor, dibangun dengan FastAPI dan TensorFlow.

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Sektor yang Didukung](#sektor-yang-didukung)
- [Arsitektur & Cara Kerja](#arsitektur--cara-kerja)
- [Struktur Repositori](#struktur-repositori)
- [Instalasi & Menjalankan Lokal](#instalasi--menjalankan-lokal)
- [Endpoint API](#endpoint-api)
- [Contoh Request & Response](#contoh-request--response)
- [Melatih Model (Notebook)](#melatih-model-notebook)
- [Deployment](#deployment)

---

## Tentang Proyek

Arta Forecasting API menerima data historis arus kas harian sebuah UMKM dan mengembalikan **prediksi 7 hari ke depan**. Sistem memiliki dua jalur prediksi:

- **LSTM Zero-Shot** — digunakan ketika data historis ≥ 30 hari. Model memuat file `.keras` sesuai sektor, lalu melakukan inferensi langsung (non-autoregressive) untuk menghasilkan 7 prediksi sekaligus.
- **Statistical Fallback (Moving Average)** — digunakan ketika data historis < 30 hari (cold start). Prediksi dihitung dari rata-rata historis ditambah faktor tren linear ringan.

---

## Sektor yang Didukung

| Sektor | Kode |
|---|---|
| Otomotif | `otomotif` |
| Kuliner | `kuliner` |
| Jasa | `jasa` |
| Retail | `retail` |

---

## Arsitektur & Cara Kerja

```
Input (30 hari terakhir: income, expense, net)
        ↓
  MinMaxScaler (on-the-fly, per request)
        ↓
  Tensor (1, 30, 3)
        ↓
  LSTM Layer 1 (128 units) → FinancialNormalizationLayer → Dropout
        ↓
  LSTM Layer 2 (64 units) → Dropout
        ↓
  Dense(7)  ← output 7 hari langsung
        ↓
  Inverse Transform → Hasil dalam Rupiah
```

Model menggunakan custom layer `FinancialNormalizationLayer` (instance normalization per timestep) dan custom loss `asymmetric_loss` yang memberikan penalti 3× lebih besar untuk prediksi yang terlalu tinggi, sehingga model cenderung konservatif.

---

## Struktur Repositori

```
arta_forecast_api/
├── main.py                   # Entry point FastAPI
├── Procfile                  # Konfigurasi deployment (Heroku / Railway)
├── requirements.txt          # Dependensi Python
├── models/
│   ├── lstm_otomotif.keras
│   ├── lstm_kuliner.keras
│   ├── lstm_jasa.keras
│   └── lstm_retail.keras
└── notebook/
    └── lstm_forecasting_jasa.ipynb   # Contoh notebook pelatihan (sektor jasa)
```

> **Catatan:** Direktori `models/` tidak disertakan di repositori. File `.keras` harus ditempatkan secara manual setelah dilatih via notebook.

---

## Instalasi & Menjalankan Lokal

### Prasyarat

- Python 3.10+
- pip

### Langkah

```bash
# 1. Clone repositori
git clone https://github.com/IlhamIskandar/arta_forecast_api.git
cd arta_forecast_api

# 2. Buat virtual environment (opsional tapi disarankan)
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate           # Windows

# 3. Install dependensi
pip install -r requirements.txt

# 4. Taruh file model ke direktori models/
mkdir models
# Salin file lstm_<sektor>.keras ke dalam folder models/

# 5. Jalankan server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Server akan berjalan di `http://localhost:8000`. Dokumentasi Swagger tersedia di `http://localhost:8000/docs`.

---

## Endpoint API

### `GET /`
Health check. Mengembalikan status service dan daftar sektor aktif.

### `GET /sectors`
Mengembalikan daftar sektor beserta jumlahnya.

### `POST /forecast/{sector}`
Melakukan prediksi arus kas 7 hari ke depan untuk UMKM tertentu.

**Path Parameter:**

| Parameter | Tipe | Keterangan |
|---|---|---|
| `sector` | `string` | Salah satu dari: `otomotif`, `kuliner`, `jasa`, `retail` |

**Request Body:**

```json
{
  "company_id": "Arta_Motor_Bandung",
  "historical_data": [
    {
      "date": "2026-05-01",
      "income": 2500000.0,
      "expense": 1200000.0,
      "net": 1300000.0
    }
    // ... minimal 30 record untuk jalur LSTM
  ]
}
```

| Field | Tipe | Keterangan |
|---|---|---|
| `company_id` | `string` | ID atau nama UMKM |
| `historical_data` | `array` | Data arus kas harian berurutan (minimal 1, optimal ≥ 30) |
| `date` | `string` | Format `YYYY-MM-DD` |
| `income` | `float` | Total pemasukan hari tersebut |
| `expense` | `float` | Total pengeluaran hari tersebut |
| `net` | `float` | Arus kas bersih (`income - expense`) |

---

## Contoh Request & Response

### Request (cURL)

```bash
curl -X POST "http://localhost:8000/forecast/otomotif" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "Arta_Motor_Bandung",
    "historical_data": [
      {"date": "2026-04-01", "income": 3000000, "expense": 1500000, "net": 1500000},
      ...
    ]
  }'
```

### Response (LSTM — data ≥ 30 hari)

```json
{
  "status": "success",
  "data": {
    "sector": "otomotif",
    "company_id": "Arta_Motor_Bandung",
    "method_used": "LSTM Zero-Shot Global Model",
    "window_size_used": 30,
    "forecast_steps": 7,
    "last_historical_date": "2026-04-30",
    "forecast": [
      {"date": "2026-05-01", "predicted_net_cashflow": 1450000.0},
      {"date": "2026-05-02", "predicted_net_cashflow": 1380000.0},
      ...
    ]
  }
}
```

### Response (Fallback — data < 30 hari)

```json
{
  "status": "success",
  "data": {
    "sector": "otomotif",
    "company_id": "Arta_Motor_Bandung",
    "method_used": "Statistical Fallback (Moving Average)",
    "window_size_used": 10,
    "forecast_steps": 7,
    "last_historical_date": "2026-04-10",
    "forecast": [...]
  }
}
```

---

## Melatih Model (Notebook)

Notebook pelatihan tersedia di `notebook/lstm_forecasting_jasa.ipynb` dan dirancang untuk berjalan di **Google Colab dengan GPU T4**.

**Konfigurasi utama notebook:**

| Parameter | Nilai Default |
|---|---|
| Window size (lookback) | 30 hari |
| Forecast steps | 7 hari |
| LSTM units (layer 1) | 128 |
| LSTM units (layer 2) | 64 |
| Dropout rate | 0.15 |
| Learning rate | 1e-4 |
| Batch size | 32 |
| Epochs | 25 |
| Split test | 15% |
| Split validasi | 15% |

**Langkah singkat:**

1. Upload dataset CSV ke Google Drive dengan format kolom: `date`, `company_id`, `income`, `expense`, `net`.
2. Sesuaikan `CSV_PATH` dan `SECTOR` di sel konfigurasi.
3. Jalankan semua sel — model terbaik otomatis disimpan ke Drive sebagai `best_model.keras`.
4. Salin file `.keras` hasil training ke direktori `models/` dengan nama `lstm_<sektor>.keras`.

**Format dataset CSV:**

```
date,company_id,income,expense,net
2025-01-01,UMKM_0001,2500000,1200000,1300000
2025-01-02,UMKM_0001,2800000,1100000,1700000
...
```

---

## Deployment

Repositori ini sudah dilengkapi `Procfile` untuk deployment ke platform berbasis Heroku/Railway:

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Pastikan variabel environment `PORT` tersedia di platform deployment. File model `.keras` perlu disertakan sebagai bagian dari slug atau dimuat dari object storage (S3, GCS, dll.) sesuai kebutuhan infrastruktur.

---

## Dependensi

```
fastapi
uvicorn[standard]
tensorflow-cpu
numpy
pandas
scikit-learn
joblib
pydantic
google-generativeai
```

---

## Lisensi

Proyek ini dikembangkan untuk ekosistem **Arta** — platform keuangan UMKM. Hubungi pemilik repositori untuk informasi lisensi lebih lanjut.
