# 💼 Arta Client — Frontend

Antarmuka pengguna resmi platform **Arta**, aplikasi pengelolaan keuangan UMKM. Dibangun dengan **React 19 + Vite + Tailwind CSS**, mendukung multi-bahasa, export laporan, visualisasi data, dan AI forecasting langsung di browser.

---

## 🌐 Live App

> Hubungkan ke repository untuk mengisi URL produksi di sini.

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| State / Auth | Supabase Auth + Context API |
| Charting | Recharts |
| Animasi | Framer Motion |
| Internasionalisasi | i18next + react-i18next |
| AI di Browser | TensorFlow.js |
| Export Laporan | jsPDF, ExcelJS, xlsx |
| Validasi | Zod |
| HTTP Client | Axios |
| Deployment | Vercel / Netlify |

---

## 📂 Struktur Proyek

```
client/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── ...assets publik
├── src/
│   ├── assets/                  # Gambar, ikon, ilustrasi
│   │   ├── icons/
│   │   └── sidebar-icons/
│   ├── components/
│   │   ├── Layout.jsx           # Sidebar + layout utama
│   │   └── AuthLayout.jsx       # Layout halaman auth
│   ├── context/
│   │   └── AuthProvider.jsx     # Global auth state
│   ├── pages/
│   │   ├── Landing.jsx          # Halaman beranda
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── VerifyOtp.jsx
│   │   ├── Onboarding.jsx
│   │   ├── Dashboard.jsx        # Ringkasan keuangan
│   │   ├── Transactions.jsx     # Pencatatan transaksi
│   │   ├── Reports.jsx          # Laporan keuangan
│   │   ├── Forecasting.jsx      # AI forecasting arus kas
│   │   ├── Recommendations.jsx  # Rekomendasi bisnis AI
│   │   ├── Profile.jsx
│   │   └── Settings.jsx
│   ├── services/
│   │   ├── api.js               # Axios instance + interceptor
│   │   ├── supabaseClient.js    # Supabase init
│   │   ├── transactionService.js
│   │   └── businessService.js
│   ├── utils/
│   │   └── cashflowHelper.js
│   ├── i18n.js                  # Konfigurasi multi-bahasa
│   ├── App.jsx                  # Router utama
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── vite.config.js
├── eslint.config.js
└── package.json
```

---

## ⚡ Menjalankan Secara Lokal

### 1. Clone Repository

```bash
git clone https://github.com/username/arta-client.git
cd arta-client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Buat File `.env`

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://arta-backend-nine.vercel.app/api
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Aplikasi berjalan di: `http://localhost:5173`

### 5. Build untuk Produksi

```bash
npm run build
```

### 6. Preview Build

```bash
npm run preview
```

---

## 🗺️ Halaman & Fitur

| Halaman | Path | Deskripsi |
|---|---|---|
| Landing | `/` | Halaman beranda publik |
| Register | `/register` | Pendaftaran akun baru |
| Login | `/login` | Login email/password & Google OAuth |
| Verify OTP | `/verify-otp` | Verifikasi kode OTP email |
| Onboarding | `/onboarding` | Setup data bisnis pertama kali |
| Dashboard | `/dashboard` | Ringkasan keuangan & grafik |
| Transaksi | `/dashboard/transactions` | Catat, edit, hapus transaksi |
| Laporan | `/dashboard/reports` | Laporan keuangan, export PDF & Excel |
| Forecasting | `/dashboard/forecasting` | Prediksi arus kas 7 hari (AI) |
| Rekomendasi | `/dashboard/recommendations` | Saran bisnis & kelayakan AI |
| Profil | `/dashboard/profile` | Kelola data diri |
| Pengaturan | `/dashboard/settings` | Pengaturan bisnis & tim |

---

## 🌍 Dukungan Multi-Bahasa (i18n)

Aplikasi mendukung multi-bahasa menggunakan **i18next**. Konfigurasi tersedia di `src/i18n.js`. Bahasa saat ini dideteksi otomatis dari browser.

---

## 🔐 Autentikasi & Proteksi Rute

- Semua halaman dashboard diproteksi dengan `ProtectedRoute`.
- Jika belum login → diarahkan ke `/login`.
- Jika belum onboarding → diarahkan ke `/onboarding`.
- Karyawan (ADMIN, STAFF, USER) bypass proses onboarding.

---

## 📤 Export Laporan

Laporan keuangan dapat diekspor dalam format:
- **PDF** — menggunakan jsPDF + jspdf-autotable
- **Excel (.xlsx)** — menggunakan ExcelJS / xlsx

---

## 🚀 Deployment

Proyek ini dapat di-deploy ke **Vercel** atau **Netlify**. Pastikan semua environment variable `VITE_*` sudah dikonfigurasi di dashboard platform.

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

---

## 📄 Lisensi

MIT License © 2026 Arta
