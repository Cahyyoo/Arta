# 🏦 Arta — Platform Keuangan UMKM Berbasis AI

**Arta** adalah platform manajemen keuangan digital untuk UMKM Indonesia yang mengintegrasikan pencatatan transaksi, laporan keuangan otomatis, forecasting arus kas berbasis AI (LSTM), dan analisis kelayakan bisnis — semuanya dalam satu aplikasi yang mudah digunakan.

---

## ✨ Fitur Unggulan

- 📒 **Buku Kas Digital** — Catat pemasukan & pengeluaran dengan bukti invoice
- 📊 **Dashboard Real-Time** — Pantau kesehatan keuangan bisnis seketika
- 📈 **AI Forecasting** — Prediksi arus kas 7 hari ke depan menggunakan model LSTM
- 🤖 **Rekomendasi Bisnis** — Analisis kelayakan & saran pengembangan dari AI
- 📑 **Laporan Keuangan** — Generate laporan & export ke PDF / Excel
- 👥 **Multi-Tenant & Tim** — Kelola tim dengan role Owner, Admin, Staff
- 🌐 **Multi-Bahasa** — Tersedia dalam Bahasa Indonesia dan Inggris
- 🔐 **Autentikasi Aman** — OTP email + Google OAuth via Supabase

---

## 🗂️ Struktur Monorepo

```
arta/
├── arta-backend/      # REST API — Node.js + Express + Supabase
└── arta-frontend/       # Web App — React 19 + Vite + Tailwind CSS
```

| Repository | Deskripsi | Link |
|---|---|---|
| `arta-backend` | REST API server | [→ Lihat README](./arta-backend/README.md) |
| `arta-frontend` | Aplikasi web frontend | [→ Lihat README](./arta-frontend/README.md) |

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js v5**
- **Supabase** (PostgreSQL + Auth + Storage)
- **JWT Authentication**
- **Multer** (file upload)
- **Machine Learning API** (forecasting & feasibility)
- Deploy: **Vercel**

### Frontend
- **React 19** + **Vite 8**
- **Tailwind CSS v4**
- **React Router DOM v7**
- **Recharts** (visualisasi data)
- **Framer Motion** (animasi)
- **TensorFlow.js** (AI di browser)
- **jsPDF + ExcelJS** (export laporan)
- **i18next** (multi-bahasa)
- Deploy: **Vercel / Netlify**

---

## ⚡ Quick Start

### Prasyarat

- Node.js >= 18
- Akun [Supabase](https://supabase.com)
- npm atau yarn

---

### 1. Clone Semua Repository

```bash
# Clone master
git clone https://github.com/username/arta.git
cd arta

# Clone backend
git clone https://github.com/username/arta-backend.git backend

# Clone frontend
git clone https://github.com/username/arta-frontend.git frontend
```

---

### 2. Setup & Jalankan Backend

```bash
cd arta-backend
npm install
```

Buat file `arta-backend/.env`:

```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

```bash
npm run dev
# → http://localhost:5000
```

---

### 3. Setup & Jalankan Frontend

```bash
cd arta-frontend
npm install
```

Buat file `arta-frontend/.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
npm run dev
# → http://localhost:5173
```

---

## 🌐 URL Produksi

| Service | URL |
|---|---|
| API Backend | `https://arta-backend-nine.vercel.app/api` |
| Web App | "" |

---

## 🗺️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                    User / Browser                    │
└────────────────────────┬────────────────────────────┘
                         │
          ┌──────────────▼──────────────┐
          │     Frontend (React/Vite)    │
          │   localhost:5173 / Vercel    │
          └──────────────┬──────────────┘
                         │ Axios / REST API
          ┌──────────────▼──────────────┐
          │    Backend (Express API)     │
          │   localhost:5000 / Vercel    │
          └──────┬───────────────┬──────┘
                 │               │
   ┌─────────────▼───┐   ┌───────▼───────────┐
   │  Supabase DB    │   │   ML / AI Service  │
   │  (PostgreSQL)   │   │ (Forecast+Feasib.) │
   └─────────────────┘   └───────────────────┘
```

---

## 🔐 Alur Autentikasi

```
Register → Verifikasi OTP Email → Login → JWT Token
                    ↕
         Google OAuth (via Supabase)
                    ↓
         Onboarding (setup bisnis) → Dashboard
```

---

## 👥 Role & Akses

| Role | Akses |
|---|---|
| **Owner** | Full akses, kelola bisnis & tim |
| **Admin** | Kelola transaksi & laporan |
| **Staff** | Catat transaksi |
| **User** | Lihat data saja |

---

## 📁 Dokumentasi Lanjutan

- [📖 Backend API Reference](./arta-backend/README.md) — Semua endpoint, request/response, dan cara setup
- [🖥️ Frontend Guide](./arta-frontend/README.md) — Struktur halaman, fitur, dan cara deploy

---

## 🤝 Kontribusi

1. Fork repository
2. Buat branch fitur: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m "feat: tambah fitur X"`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

## 📄 Lisensi

MIT License © 2026 Arta — Platform Keuangan UMKM
