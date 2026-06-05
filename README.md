# Arta Platform Keuangan UMKM Berbasis AI

**Arta** adalah platform manajemen keuangan digital untuk UMKM Indonesia yang mengintegrasikan pencatatan transaksi, laporan keuangan otomatis, forecasting arus kas berbasis AI (LSTM), dan analisis kelayakan bisnis semuanya dalam satu aplikasi yang mudah digunakan.

---

## Fitur Unggulan

- **Buku Kas Digital** — Catat pemasukan & pengeluaran dengan bukti invoice
- **Dashboard Real-Time** — Pantau kesehatan keuangan bisnis seketika
- **AI Forecasting** — Prediksi arus kas 7 hari ke depan menggunakan LSTM per sektor usaha
- **Analisis Kelayakan Bisnis** — Skor kelayakan & rekomendasi dari XGBoost + Gemini AI
- **Laporan Keuangan** — Generate laporan & export ke PDF / Excel
- **Multi-Tenant & Tim** — Kelola tim dengan role Owner, Admin, Staff
- **Multi-Bahasa** — Tersedia dalam Bahasa Indonesia dan Inggris
- **Autentikasi Aman** — OTP email + Google OAuth via Supabase

---

## Struktur Ekosistem

Proyek Arta terdiri dari **4 repository** yang saling terhubung:

```
arta/
 arta-backend/ # REST API Node.js + Express + Supabase
 arta-client/ # Web App React 19 + Vite + Tailwind CSS
 arta-model-ai-forecast_api/ # AI Forecasting Service FastAPI + LSTM
 arta-model-ai-classification/ # AI Kelayakan Bisnis FastAPI + XGBoost + Gemini
```

| Repository | Deskripsi | README |
|---|---|---|
| `arta-backend` | REST API server (Node.js) | [Lihat README](./arta-backend/README.md) |
| `arta-client` | Aplikasi web frontend | [Lihat README](./arta-client/README.md) |
| `arta-model-ai-forecast_api` | AI Forecasting arus kas (LSTM per sektor) | [Lihat README](./arta-model-ai-forecast_api/README.md) |
| `arta-model-ai-classification` | AI Kelayakan bisnis (XGBoost + SHAP + Gemini) | [Lihat README](./arta-model-ai-classification/README.md) |

---

## Tech Stack

### Backend API
- **Node.js** + **Express.js v5**
- **Supabase** (PostgreSQL + Auth + Storage)
- **JWT Authentication** + **Multer** (file upload)
- Deploy: **Vercel**

### Frontend
- **React 19** + **Vite 8** + **Tailwind CSS v4**
- **React Router DOM v7**, **Recharts**, **Framer Motion**
- **TensorFlow.js** (inferensi AI di browser)
- **jsPDF + ExcelJS** (export laporan), **i18next** (multi-bahasa)
- Deploy: **Vercel / Netlify**

### AI Forecasting Service (`arta-model-ai-forecast_api`)
- **FastAPI** + **TensorFlow (CPU)**
- Model **LSTM** terpisah per sektor: `kuliner`, `jasa`, `retail`, `otomotif`
- **Fallback Statistical** (Moving Average) untuk data < 30 hari
- Deploy: **Railway / Heroku** (via `Procfile`)

### AI Klasifikasi Kelayakan (`arta-model-ai-classification`)
- **FastAPI** + **XGBoost** + **SHAP** (explainability)
- **Gemini AI** untuk narasi analisis bisnis
- Multiple model: XGBoost, LightGBM, Random Forest, Deep Learning Keras
- Deploy: **Railway / Heroku**

---

## Arsitektur Sistem

```

 User / Browser 

 
 
 Frontend (React/Vite) 
 localhost:5173 / Vercel 
 
 REST API (Axios)
 
 Backend (Express API) 
 localhost:5000 / Vercel 
 
 
 
 Supabase DB AI Microservices 
 (PostgreSQL 
 + Auth Forecast API Classification
 + Storage) LSTM/sektor XGBoost+Gemini
 
```

---

## AI & Machine Learning

### Forecasting Arus Kas (`arta-model-ai-forecast_api`)

Memprediksi **net cashflow 7 hari ke depan** berdasarkan 30 hari data historis.

**Model per Sektor:**

| Sektor | Model File |
|---|---|
| Kuliner | `lstm_kuliner.keras` |
| Jasa | `lstm_jasa.keras` |
| Retail | `lstm_retail.keras` |
| Otomotif | `lstm_otomotif.keras` |

**Arsitektur LSTM:**
```
Input (30 hari: income, expense, net)
 MinMaxScaler Tensor (1, 30, 3)
 LSTM(128) FinancialNormalizationLayer Dropout
 LSTM(64) Dropout
 Dense(7) output 7 hari langsung
 Inverse Transform Hasil (Rupiah)
```

> Loss function menggunakan **asymmetric loss** dengan penalti 3 untuk prediksi yang terlalu optimistis model cenderung konservatif.

**Endpoint utama:** `POST /forecast/{sector}`

---

### Kelayakan Bisnis (`arta-model-ai-classification`)

Memprediksi **peluang keberhasilan UMKM** berdasarkan 12 fitur profil pemilik & bisnis.

**Input Features (12 variabel):**

| # | Fitur | Keterangan |
|---|---|---|
| 1 | `Age` | Usia pemilik usaha |
| 2 | `Education` | 1=SD 4=Sarjana |
| 3 | `Initial_Capital` | 1=Memadai, 0=Tidak |
| 4 | `Financial_Record_Keeping` | 1=Baik, 0=Buruk |
| 5 | `Internet_Usage` | 1=Ya, 0=Tidak |
| 6 | `Business_Plan` | 1=Ada, 0=Tidak Ada |
| 7 | `Marketing_Effort` | Skala 17 |
| 8 | `Partnership` | 1=Ya, 0=Tidak |
| 9 | `Parent_Business_Experience` | 1=Ya, 0=Tidak |
| 10 | `Industry_Experience` | Tahun pengalaman |
| 11 | `Owner_Gender` | 0=Perempuan, 1=Laki-laki |
| 12 | `Professional_Advice` | Skala 17 |

**Output:** Skor probabilitas, label Berhasil/Gagal, confidence, SHAP breakdown, dan narasi rekomendasi dari **Gemini AI**.

**Endpoint utama:** `POST /predict`

---

## Quick Start

### Prasyarat

- Node.js >= 18
- Python >= 3.10
- Akun [Supabase](https://supabase.com)
- API Key [Google Gemini](https://aistudio.google.com)

---

### 1. Clone Semua Repository

```bash
git clone https://github.com/username/arta-backend.git
git clone https://github.com/username/arta-client.git
git clone https://github.com/username/arta-model-ai-forecast_api.git
git clone https://github.com/username/arta-model-ai-classification.git
```

---

### 2. Setup Backend (Node.js)

```bash
cd arta-backend
npm install
```

Buat file `.env`:

```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

```bash
npm run dev # http://localhost:5000
 # Dokumentasi API: http://localhost:5000/
```

---

### 3. Setup Frontend (React)

```bash
cd arta-client
npm install
```

Buat file `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
npm run dev # http://localhost:5173
```

---

### 4. Setup AI Forecasting Service (FastAPI)

```bash
cd arta-model-ai-forecast_api
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Taruh file model ke folder models/
# lstm_kuliner.keras, lstm_jasa.keras, lstm_retail.keras, lstm_otomotif.keras

uvicorn main:app --host 0.0.0.0 --port 8001 --reload
# http://localhost:8001
# Swagger UI: http://localhost:8001/docs
```

---

### 5. Setup AI Klasifikasi Kelayakan (FastAPI)

```bash
cd arta-model-ai-classification

# Set environment variables
export XGBOOST_MODEL_PATH=xgboost.json
export GEMINI_API_KEY=your_gemini_api_key
export GEMINI_MODEL=gemini-3.5-flash

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
# http://localhost:8002
# Swagger UI: http://localhost:8002/docs
```

---

## URL Produksi

| Service | URL |
|---|---|
| API Backend | https://arta-backend-nine.vercel.app/api |
| AI Forecast API | https://web-production-eaf78.up.railway.app/docs |
| AI Classification API | https://api-prediksi-sukses-bisnis-production.up.railway.app/docs |
| Web App | https://arta-frontend-eight.vercel.app/ |

---

## Alur Autentikasi

```
Register Verifikasi OTP Email Login JWT Token
 
 Google OAuth (via Supabase)
 
 Onboarding (setup bisnis) Dashboard
```

---

## Role & Akses

| Role | Akses |
|---|---|
| **Owner** | Full akses, kelola bisnis & tim |
| **Admin** | Kelola transaksi & laporan |
| **Staff** | Catat transaksi |
| **User** | Lihat data saja |

---

## Dokumentasi Per Repository

| Repo | Deskripsi |
|---|---|
| [arta-backend](./arta-backend/README.md) | Semua endpoint API, request/response, dan cara setup |
| [arta-client](./arta-client/README.md) | Struktur halaman, fitur, dan cara deploy |
| [arta-model-ai-forecast_api](./arta-model-ai-forecast_api/README.md) | LSTM forecasting, cara melatih model, endpoint |
| [arta-model-ai-classification](./arta-model-ai-classification/README.md) | Klasifikasi kelayakan bisnis, SHAP, Gemini AI |

---

## Kontribusi

1. Fork repository yang ingin diubah
2. Buat branch fitur: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m "feat: tambah fitur X"`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

## Lisensi

MIT License 2026 Arta Platform Keuangan UMKM
