# 🚀 Arta API — Backend

Backend resmi platform **Arta**, sistem pengelolaan keuangan UMKM berbasis **Node.js + Express + Supabase**. Menyediakan REST API lengkap untuk autentikasi, pencatatan transaksi multi-tenant, AI forecasting arus kas, laporan keuangan, hingga analisis kelayakan bisnis berbasis AI.

---

## 🌐 Base URL (Production)

```
https://arta-backend-nine.vercel.app/api
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database & Auth | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Authentication | JWT + Supabase Auth |
| File Upload | Multer |
| AI / ML | Machine Learning API (Forecast & Feasibility) |
| Deployment | Vercel |

---

## 📂 Struktur Proyek

```
backend/
├── src/
│   ├── config/
│   │   ├── supabase.js          # Konfigurasi Supabase client
│   │   └── supabaseAdmin.js     # Supabase Admin client
│   ├── controllers/
│   │   ├── authController.js    # Register, login, OTP
│   │   ├── businessController.js
│   │   ├── dashboardController.js
│   │   ├── feasibilityController.js
│   │   ├── forecastController.js
│   │   ├── profileController.js
│   │   ├── reportController.js
│   │   ├── transactionController.js
│   │   ├── uploadController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Verifikasi JWT
│   │   └── uploadMiddleware.js  # Multer config
│   ├── routes/
│   │   ├── apiRoutes.js         # Semua protected routes
│   │   └── authRoutes.js        # Public auth routes
│   └── index.js                 # Entry point
├── package.json
└── .env                         # (tidak di-commit)
```

---

## ⚡ Menjalankan Secara Lokal

### 1. Clone Repository

```bash
git clone https://github.com/username/arta-backend.git
cd arta-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Buat File `.env`

```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Server berjalan di: `http://localhost:5000`

### 5. Jalankan Production

```bash
npm start
```

---

## 🔐 Autentikasi

Semua endpoint yang terproteksi membutuhkan JWT Token pada header:

```http
Authorization: Bearer <token_dari_login>
```

---

## 📖 API Endpoints

### 1. 🔑 Auth & Verifikasi (Public)

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/auth/register` | Daftar akun baru + kirim OTP ke email |
| POST | `/auth/verify-otp` | Verifikasi kode OTP |
| POST | `/auth/resend-otp` | Kirim ulang OTP |
| POST | `/auth/login` | Login, mendapatkan JWT Token |

<details>
<summary>Contoh Request — Register</summary>

```json
POST /api/auth/register
{
  "nama": "Juanda",
  "email": "user@email.com",
  "password": "password123"
}
```
</details>

<details>
<summary>Contoh Request — Login</summary>

```json
POST /api/auth/login
{
  "email": "user@email.com",
  "password": "password123"
}
```
</details>

---

### 2. 🌐 Google OAuth (Frontend)

Login Google dilakukan langsung dari frontend menggunakan Supabase SDK:

```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: "http://localhost:5173/dashboard" },
});
```

---

### 3. 💰 Transaksi *(Protected — Multi-Tenant)*

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/transactions` | Ambil semua transaksi bisnis |
| POST | `/transactions` | Tambah transaksi baru |
| PUT | `/transactions/:id` | Update transaksi |
| DELETE | `/transactions/:id` | Hapus transaksi |

> Upload invoice menggunakan `multipart/form-data`.

---

### 4. 👤 Profil & Onboarding *(Protected)*

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/profile` | Ambil data profil user |
| POST | `/profile/onboarding` | Simpan data onboarding |
| POST | `/profile/upgrade` | Upgrade dari calon ke UMKM aktif |
| PUT | `/profile` | Update profil & password |

---

### 5. 👥 Manajemen User *(Protected)*

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/users` | Daftar seluruh user/karyawan |
| POST | `/users` | Buat akun karyawan baru |
| PUT | `/users/:id` | Update nama & role user |
| DELETE | `/users/:id` | Hapus akun user |

---

### 6. 🏢 Business Settings *(Protected)*

| Method | Endpoint | Deskripsi |
|---|---|---|
| PUT | `/business` | Update identitas bisnis |

---

### 7. 🤖 Feasibility Test & Prediksi AI *(Protected)*

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/feasibility-tests/latest` | Ambil kuesioner terakhir |
| POST | `/feasibility-tests` | Submit data & dapatkan prediksi AI |

<details>
<summary>Contoh Response — Prediksi AI</summary>

```json
{
  "message": "Kuesioner berhasil disimpan",
  "ai_prediction": {
    "feasibility_score": 85.5,
    "status": "Layak",
    "recommendation": "Bisnis memiliki probabilitas sukses tinggi"
  }
}
```
</details>

---

### 8. 📊 Dashboard Overview *(Protected)*

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/dashboard/overview` | Semua data dashboard dalam 1 request |

---

### 9. 📈 AI Forecasting *(Protected)*

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/forecast` | Prediksi arus kas 7 hari ke depan (LSTM) |

<details>
<summary>Contoh Response — Forecast</summary>

```json
{
  "status": "success",
  "method_used": "LSTM",
  "actual_data": [],
  "ai_prediction": [],
  "insight": "Disarankan menambah stok minggu depan"
}
```
</details>

---

### 10. 📑 Laporan Keuangan *(Protected)*

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/reports/financial` | Laporan keuangan lengkap |

---

## 🚀 Deployment

Proyek ini di-deploy ke **Vercel**. Pastikan environment variables sudah dikonfigurasi di dashboard Vercel sebelum deploy.

```bash
vercel --prod
```

---

## 📄 Lisensi

MIT License © 2026 Arta API Services
