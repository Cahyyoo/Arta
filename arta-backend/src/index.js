require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./routes/apiRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// CORS agar bisa diakses dari luar host
app.use(
  cors({
    origin: "*", // izinkan semua domain
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middlewares
app.use(express.json());

// Daftarkan semua routes API ke prefix /api
app.use("/api", apiRoutes);
app.use("/api", authRoutes);

// Jika ada yang mengakses root URL (/), arahkan ke file index.html
app.get("/", (req, res) => {
  res.send(`
    <!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dokumentasi API Arta</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      .method-get {
        @apply bg-blue-100 text-blue-700 border-blue-300;
      }
      .method-post {
        @apply bg-emerald-100 text-emerald-700 border-emerald-300;
      }
      .method-put {
        @apply bg-amber-100 text-amber-700 border-amber-300;
      }
      .method-delete {
        @apply bg-rose-100 text-rose-700 border-rose-300;
      }
      .method-oauth { 
        @apply bg-purple-100 text-purple-700 border-purple-300; 
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 10px;
      }
    </style>
  </head>
  <body
    class="bg-slate-50 text-slate-800 font-sans antialiased pb-20 custom-scrollbar"
  >
    <div class="max-w-5xl mx-auto px-4 mt-12">
      <header class="mb-12 border-b border-slate-200 pb-8 relative">
        <div
          class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"
        ></div>
        <h1 class="text-4xl font-black text-slate-900 mb-3 tracking-tight">
          Arta API Reference
        </h1>
        <p class="text-slate-500 text-lg font-medium max-w-2xl">
          Dokumentasi resmi backend sistem pengelolaan keuangan UMKM.
          Terintegrasi penuh dengan Supabase Auth & Storage.
        </p>

        <div
          class="mt-6 inline-flex items-center bg-white rounded-xl px-4 py-2 text-sm text-slate-600 border border-slate-200 shadow-sm"
        >
          <span class="font-bold mr-2 text-slate-800">Base URL:</span>
          <code class="text-indigo-600 font-mono"
            >https://arta-backend-nine.vercel.app/api</code
          >
        </div>
      </header>

      <section
        class="mb-12 bg-indigo-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden"
      >
        <div
          class="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none"
        ></div>
        <h2
          class="text-2xl font-black mb-4 flex items-center gap-2 relative z-10"
        >
          Otorisasi
        </h2>
        <p class="text-indigo-200 mb-4 leading-relaxed relative z-10 max-w-3xl">
          Kamu <strong>wajib</strong> menyertakan Token JWT di dalam header
          request. Token ini didapatkan dari response saat melakukan Login.
        </p>
        <div
          class="bg-indigo-950/50 border border-indigo-500/30 p-4 rounded-xl relative z-10"
        >
          <p class="text-sm font-mono text-indigo-300">Headers:</p>
          <code class="text-emerald-400 font-mono block mt-1"
            >Authorization: Bearer &lt;token_dari_login&gt;</code
          >
        </div>
      </section>

      <section class="mb-10">
        <h2
          class="text-2xl font-black text-slate-800 mb-5 flex items-center gap-2"
        >
          1. Autentikasi & Verifikasi (Public)
        </h2>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-post">POST</span>
            <code class="text-base font-mono text-slate-700 font-bold">/auth/register</code>
          </div>
          <div class="p-5">
            <p class="text-slate-600 text-sm">Mendaftarkan akun baru. Sistem akan otomatis mengirimkan <strong>Kode OTP 6 Digit</strong> ke email pengguna.</p>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4 relative">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-post">POST</span>
            <code class="text-base font-mono text-slate-700 font-bold">/auth/verify-otp</code>
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold uppercase tracking-wider">New</span>
          </div>
          <div class="p-5">
            <p class="mb-4 text-slate-600 text-sm">Memvalidasi kode OTP yang dikirim ke email saat pendaftaran.</p>
            <ul class="list-disc ml-5 text-slate-600 text-sm space-y-1 font-mono text-xs">
                <li>email: "user@email.com"</li>
                <li>otp: "123456"</li>
            </ul>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-post">POST</span>
            <code class="text-base font-mono text-slate-700 font-bold">/auth/resend-otp</code>
          </div>
          <div class="p-5">
            <p class="text-slate-600 text-sm">Mengirim ulang kode OTP jika pengguna tidak menerimanya (Kirim <code class="bg-slate-100 px-1 rounded">email</code> di Body JSON).</p>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-post">POST</span>
            <code class="text-base font-mono text-slate-700 font-bold">/auth/login</code>
          </div>
          <div class="p-5">
            <p class="text-slate-600 text-sm">Login menggunakan Email & Password standar untuk mendapatkan token.</p>
          </div>
        </div>
      </section>

      <section class="mb-10">
        <h2
          class="text-2xl font-black text-slate-800 mb-5 flex items-center gap-2"
        >
          2. Login via Google (OAuth)
        </h2>
        <div class="bg-white border border-purple-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-purple-50 flex items-center gap-4 relative">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-oauth">CLIENT SDK</span>
            <code class="text-base font-mono text-slate-700 font-bold">Supabase Auth SDK</code>
          </div>
          <div class="p-5">
            <p class="mb-3 text-slate-600 text-sm">
                Login menggunakan Google <strong>tidak diproses melalui Backend Node.js</strong>. Aplikasi React langsung memanggil <code>signInWithOAuth()</code>.
            </p>
            <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 items-start mt-2">
                <span class="text-amber-500 text-lg"></span>
                <p class="text-xs text-amber-800 font-medium">
                    Setelah login Google berhasil, frontend harus mengekstrak token dari Supabase Session dan menyimpannya di <code>localStorage</code> agar bisa digunakan untuk mengakses endpoint Transaksi dan Profil.
                </p>
                </div>
                <br/>
                <p class="mb-3 text-slate-600 text-sm">Buka file konfigurasi Supabase client kamu (biasanya di src/services/api.js atau kamu bisa membuat file baru misalnya src/config/supabaseClient.js jika belum ada instance Supabase di React).
                
                Jika kamu memanggilnya langsung di dalam halaman Login, tambahkan fungsi ini ke tombol "Continue with Google" di file Login.jsx-mu:</p>
                <br/>
                <pre  class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-sm overflow-x-auto font-mono">
// Pastikan kamu sudah meng-import supabase client di bagian atas file
// import supabase from '../config/supabaseClient'; 

const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Arahkan kembali ke halaman dashboard setelah sukses login dari Google
        redirectTo: 'http://localhost:5173/dashboard' 
      }
    });

    if (error) {
      console.error("Gagal login dengan Google:", error.message);
      alert("Terjadi kesalahan saat login dengan Google");
    }
};
                </pre>
          </div>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-black text-slate-800 mb-5 flex items-center gap-2">
          3. Transaksi (Protected - Multi-Tenant)
        </h2>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-get">GET</span>
            <code class="text-base font-mono text-slate-700 font-bold">/transactions</code>
          </div>
          <div class="p-5">
            <p class="text-slate-600 text-sm">
              Mengambil daftar transaksi milik <strong>Entitas Bisnis</strong> dari user yang sedang login. Admin dan Owner dalam satu bisnis akan melihat data transaksi yang sama.
            </p>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4 relative">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-post">POST</span>
            <code class="text-base font-mono text-slate-700 font-bold">/transactions</code>
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-bold">Multipart/Form-Data</span>
          </div>
          <div class="p-5">
            <p class="mb-4 text-slate-600 text-sm">
              Menambah transaksi baru. Backend akan <strong>otomatis menyematkan ID Bisnis</strong> berdasarkan profil user. Wajib menggunakan format <strong>form-data</strong> jika ada file invoice.
            </p>
            <ul class="list-disc ml-5 mb-4 text-slate-600 text-sm space-y-1">
              <li><code>type</code> : "Pemasukan" atau "Pengeluaran"</li>
              <li><code>amount</code> : Angka nominal (contoh: 150000)</li>
              <li><code>date</code> : Format YYYY-MM-DD</li>
              <li><code>category</code> : Kateorin</li>
              <li><code>description</code> : Keterangan detail</li>
            </ul>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4 transition-all">
          <div class="p-4 border-b border-slate-100 bg-amber-50/50 flex items-center gap-4 relative">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-put">PUT</span>
            <code class="text-base font-mono text-slate-700 font-bold">/transactions/:id</code>
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">multipart/form-data</span>
          </div>
          <div class="p-5">
            <p class="mb-4 text-slate-600 text-sm">
              Memperbarui data transaksi yang sudah ada. Backend memvalidasi agar user hanya bisa mengedit transaksi yang <strong>berada di dalam entitas bisnisnya</strong>.
            </p>
            <h4 class="font-bold text-[10px] text-slate-400 uppercase mb-2">Endpoint URL:</h4>
            <code class="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">/api/transactions/uuid-transaksi</code>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-delete">DELETE</span>
            <code class="text-base font-mono text-slate-700 font-bold">/transactions/:id</code>
          </div>
          <div class="p-5">
            <p class="text-slate-600 text-sm">
              Menghapus transaksi berdasarkan ID. Sistem memproteksi agar transaksi dari bisnis lain tidak dapat dihapus.
            </p>
          </div>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-black text-slate-800 mb-5 flex items-center gap-2">
          4. Profil & Onboarding (Protected)
        </h2>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-get">GET</span>
            <code class="text-base font-mono text-slate-700 font-bold">/profile</code>
          </div>
          <div class="p-5">
            <p class="text-slate-600 text-sm">
              Mengambil data profil pengguna yang sedang login. Jika profil belum ada di database, sistem akan otomatis membuatnya berdasarkan metadata saat registrasi.
            </p>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-post">POST</span>
            <code class="text-base font-mono text-slate-700 font-bold">/profile/onboarding</code>
          </div>
          <div class="p-5">
            <p class="mb-4 text-slate-600 text-sm">
              Menyimpan hasil proses <i>onboarding</i> pengguna baru, untuk pengguna yang sudah memiliki usaha.
            </p>
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Request Body (JSON):</h4>
            <ul class="list-disc ml-5 text-slate-600 text-sm space-y-1 font-mono text-xs">
              <li>user_type: "calon_pengusaha" | "umkm_aktif" (Wajib)</li>
              <li>nama_usaha: "Nama Toko" (Wajib jika umkm_aktif)</li>
              <li>tipe_usaha: "Kuliner" (Wajib jika umkm_aktif)</li>
              <li>lama_usaha: "< 1 Tahun / 1-3 Tahun / > 3 Tahun" (Wajib jika umkm_aktif)</li>
            </ul>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-post">POST</span>
            <code class="text-base font-mono text-slate-700 font-bold">/profile/upgrade</code>
          </div>
          <div class="p-5">
            <p class="mb-4 text-slate-600 text-sm">
              Mengubah tipe akun pengguna dari 'calon_pengusaha' menjadi 'umkm_aktif'.
            </p>
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Request Body (JSON):</h4>
            <ul class="list-disc ml-5 text-slate-600 text-sm space-y-1 font-mono text-xs">
              <li>nama_usaha: "Nama Bisnis Baru" (Wajib)</li>
              <li>tipe_usaha: "Jasa" (Wajib)</li>
              <li>lama_usaha: "< 1 Tahun / 1-3 Tahun / > 3 Tahun"</li>
            </ul>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-put">PUT</span>
            <code class="text-base font-mono text-slate-700 font-bold">/profile</code>
          </div>
          <div class="p-5">
            <p class="mb-4 text-slate-600 text-sm">
              Memperbarui Informasi Pribadi (tabel <code class="bg-slate-100 px-1 rounded text-xs">profiles</code>) sekaligus Keamanan Akun/Password (tabel <code class="bg-slate-100 px-1 rounded text-xs">auth.users</code>). Semua <i>field</i> bersifat opsional.
            </p>
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Request Body (JSON):</h4>
            <pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-sm overflow-x-auto font-mono">
              {
              "nama_lengkap": "Juanda",
              "email": "user@email.com",
              "telepon": "08123456789",
              "bio": "Pemilik usaha...",
              "password_lama": "admin123", // Opsional, hanya jika ganti password
              "password_baru": "passBaru!" // Opsional, hanya jika ganti password
            }</pre>
          </div>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-black text-slate-800 mb-5 flex items-center gap-2">
          5. Manajemen Karyawan
        </h2>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-get">GET</span>
            <code class="text-base font-mono text-slate-700 font-bold">/users</code>
          </div>
          <div class="p-5">
            <p class="text-slate-600 text-sm">Mengambil daftar seluruh pengguna/karyawan yang terdaftar menggunakan Supabase Admin API.</p>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4 relative">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-post">POST</span>
            <code class="text-base font-mono text-slate-700 font-bold">/users</code>
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold uppercase tracking-wider">Sync Profile</span>
          </div>
          <div class="p-5">
            <p class="mb-4 text-slate-600 text-sm">Membuat akun karyawan baru di <code class="bg-slate-100 px-1 rounded text-xs">auth.users</code> dan <strong>otomatis membuat data profilnya</strong> di tabel <code class="bg-slate-100 px-1 rounded text-xs">profiles</code>.</p>
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Request Body (JSON):</h4>
            <ul class="list-disc ml-5 text-slate-600 text-sm space-y-1 font-mono text-xs">
              <li>nama: "Nama Lengkap"</li>
              <li>email: "karyawan@email.com"</li>
              <li>role: "ADMIN" | "USER" | "OWNER"</li>
              <li class="text-emerald-600 font-bold">business_id: "uuid-bisnis-opsional" (Opsional)</li>
            </ul>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-amber-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-put">PUT</span>
            <code class="text-base font-mono text-slate-700 font-bold">/users/:id</code>
          </div>
          <div class="p-5">
            <p class="mb-4 text-slate-600 text-sm">Memperbarui metadata role dan <strong>otomatis menyinkronkan pembaruan nama</strong> ke tabel <code class="bg-slate-100 px-1 rounded text-xs">profiles</code>.</p>
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Request Body (JSON):</h4>
            <ul class="list-disc ml-5 text-slate-600 text-sm space-y-1 font-mono text-xs">
              <li>nama: "Nama Lengkap Update"</li>
              <li>role: "ADMIN"</li>
            </ul>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-delete">DELETE</span>
            <code class="text-base font-mono text-slate-700 font-bold">/users/:id</code>
          </div>
          <div class="p-5">
            <p class="text-slate-600 text-sm">Menghapus akun karyawan secara permanen dari Supabase Auth.</p>
          </div>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-black text-slate-800 mb-5 flex items-center gap-2">
          6. Pengaturan Bisnis / Identitas Usaha (Protected)
        </h2>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-put">PUT</span>
            <code class="text-base font-mono text-slate-700 font-bold">/business</code>
          </div>
          <div class="p-5">
            <p class="mb-4 text-slate-600 text-sm">
              Memperbarui identitas, kontak, media sosial, dan legalitas usaha. API otomatis mendeteksi <code class="bg-slate-100 px-1 rounded text-xs">business_id</code> yang terikat pada profil user yang sedang login.
            </p>
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Request Body (JSON):</h4>
            <pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-sm overflow-x-auto font-mono">{
            "name": "Warung Makan Sederhana",
            "type": "F&B",
            "industry": "Kuliner",
            "founded_year": "2020",
            "employee_count": "1-10 Karyawan",
            "description": "Menyediakan masakan padang lezat higienis.",
            "phone": "021-12345678",
            "email": "info@usahasaya.com",
            "address": "Jl. Merdeka No 123",
            "website": "https://www.usahasaya.com",
            "instagram": "@warung_sederhana",
            "nib": "1234567890123",
            "npwp": "00.000.000.0-000.000"
          }</pre>
          </div>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-black text-slate-800 mb-5 flex items-center gap-2">
          7. Kuesioner Kelayakan & Prediksi AI (Protected)
        </h2>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-get">GET</span>
            <code class="text-base font-mono text-slate-700 font-bold">/feasibility-tests/latest</code>
          </div>
          <div class="p-5">
            <p class="text-slate-600 text-sm">Mengambil data riwayat pengisian kuesioner kelayakan bisnis terakhir milik pengguna yang sedang login.</p>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4 relative">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-post">POST</span>
            <code class="text-base font-mono text-slate-700 font-bold">/feasibility-tests</code>
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold uppercase tracking-wider">ML Integrated</span>
          </div>
          <div class="p-5">
            <p class="mb-4 text-slate-600 text-sm">
              Menyimpan formulir kelayakan bisnis. Backend akan otomatis melakukan <strong>Data Transformation & Mapping</strong> (mengonversi format teks pendidikan ke skala angka, mengonversi persentase marketing ke rasio, dll) lalu menyuntikkan nilai default sebelum mengirimkannya ke API Machine Learning Artha.
            </p>
            
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Request Body (JSON dari Frontend):</h4>
            <pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono mb-4">{
  "initial_capital": 10000000,
  "tools_materials_percentage": 75,
  "marketing_percentage": 25,
  "roi_target_months": 18,
  "business_sector": "Jasa & Layanan Umum",
  "strategic_location": "Pinggir Jalan Raya Utama",
  "target_market": "Anak-anak",
  "last_education": "Sarjana (S1+)",
  "technical_expertise": "Pemrograman / IT",
  "has_business_experience": false
}</pre>

            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Response Output (JSON):</h4>
            <pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono">{
              "message": "Kuesioner kelayakan berhasil disimpan!",
              "saved_data": {
                "id": "uuid-tergenerate",
                "user_id": "uuid-user",
                "initial_capital": 10000000,
                "target_market": "Anak-anak"
                // ... (data asli tersimpan)
              },
              "ai_input_used": {
                "Age": 30,
                "Education": 4,
                "Initial_Capital": 1,
                "Marketing_Effort": 3,
                "Industry_Experience": 0,
                "Owner_Gender": 1
                // ... (12 variabel hasil mapping untuk AI)
              },
              "ai_prediction": {
                "feasibility_score": 85.5,
                "status": "Layak",
                "recommendation": "Berdasarkan analisis model, rencana bisnis ini memiliki probabilitas sukses yang tinggi."
              }
            }</pre>
          </div>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-black text-slate-800 mb-5 flex items-center gap-2">
          8. Dashboard Overview (Protected)
        </h2>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-get">GET</span>
            <code class="text-base font-mono text-slate-700 font-bold">/dashboard/overview</code>
          </div>
          <div class="p-5">
            <p class="mb-4 text-slate-600 text-sm">Mengambil seluruh ringkasan data finansial bulan ini (Summary, Persentase MoM, Grafik Arus Kas Harian, dan 5 Transaksi Terakhir) dalam satu kali *request*.</p>
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Response Output (JSON):</h4>
            <pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono">{
              "summary": {
                "income": 13100000,
                "income_change": 12,
                "expense": 5500000,
                "expense_change": -3,
                "net_profit": 7600000,
                "health_status": "Very Healthy"
              },
              "chart_data": [
                { "date": "01 Mei", "income": 500000, "expense": 100000 },
                { "date": "02 Mei", "income": 0, "expense": 50000 },
                // ... (sampai akhir bulan)
              ],
              "recent_transactions": [
                { "id": "...", "date": "2026-05-20", "description": "Penjualan Toko", "category": "Pendapatan", "type": "Pemasukan", "amount": 1500000 }
              ]
            }</pre>
          </div>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-black text-slate-800 mb-5 flex items-center gap-2">
          9. AI & Forecasting (Protected)
        </h2>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4 relative">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-get">GET</span>
            <code class="text-base font-mono text-slate-700 font-bold">/forecast</code>
            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold uppercase tracking-wider">Microservice</span>
          </div>
          <div class="p-5">
            <p class="mb-4 text-slate-600 text-sm">
              Menghasilkan proyeksi arus kas bersih (Net Cashflow) untuk 7 hari ke depan. API Express.js bertindak sebagai jembatan yang menarik data historis 30 hari terakhir berdasarkan <code class="bg-slate-100 px-1 rounded text-xs">business_id</code> user, lalu mengirimkannya ke model <strong>Deep Learning LSTM / Fallback Statistical</strong> milik Artha AI.
            </p>
            
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-3 items-start mb-4">
                <span class="text-blue-500 text-lg"></span>
                <div class="text-xs text-blue-800 font-medium">
                    <strong>Catatan untuk Frontend:</strong><br/>
                    Gunakan <code class="bg-blue-100 px-1 rounded">actual_data</code> untuk menggambar garis grafik solid (data masa lalu hingga hari ini), dan <code class="bg-blue-100 px-1 rounded">ai_prediction</code> untuk menggambar garis grafik putus-putus (masa depan). Parameter <code class="bg-blue-100 px-1 rounded">insight</code> bisa langsung dicetak ke dalam UI teks "Rekomendasi Strategis AI".
                </div>
            </div>

            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Response Output (JSON):</h4>
            <pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono">{
              "status": "success",
              "method_used": "Statistical Fallback (Moving Average)",
              "actual_data": [
                { "date": "2026-04-02", "net_cashflow": 1200000 },
                { "date": "2026-04-03", "net_cashflow": 950000 }
                // ... total 30 hari ke belakang ...
              ],
              "ai_prediction": [
                { "date": "2026-05-02", "predicted_net_cashflow": 1300000 },
                { "date": "2026-05-03", "predicted_net_cashflow": 1300000 }
                // ... total 7 hari ke depan ...
              ],
              "insight": "Tren pendapatan diprediksi akan mengalami lonjakan hingga 8 Mei. Disarankan untuk menambah stok Bahan Baku pada pertengahan minggu untuk mengantisipasi lonjakan permintaan."
            }</pre>
          </div>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="text-2xl font-black text-slate-800 mb-5 flex items-center gap-2">
          10. Laporan Keuangan (Protected)
        </h2>

        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-4">
          <div class="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <span class="px-3 py-1 rounded-lg font-bold text-xs border method-get">GET</span>
            <code class="text-base font-mono text-slate-700 font-bold">/reports/financial</code>
          </div>
          <div class="p-5">
            <p class="mb-4 text-slate-600 text-sm">
              Menarik semua metrik untuk halaman Laporan Keuangan, termasuk kalkulasi margin laba, distribusi pengeluaran untuk <i>Pie Chart</i>, dan pembuatan kalimat <i>AI Insights</i> secara dinamis berdasarkan data historis bisnis.
            </p>
            <h4 class="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Response Output (JSON):</h4>
            <pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto font-mono">{
              "summary": {
                "total_income": 37086723,
                "income_change_percent": 12.5,
                "total_expense": 10855632,
                "expense_change_percent": 3.2,
                "net_profit": 26231091,
                "profit_margin_percent": 70.7,
                "health_status": "Sehat & Stabil"
              },
              "insights": {
                "expense_insight": "Pengeluaran terbesar periode ini berada pada kategori Sewa Tempat (Rp 3.500.000) dan Pemasaran (Rp 3.011.639).",
                "income_insight": "Arus kas berjalan positif. Sumber pendapatan terbesar: Penjualan Jasa (Rp 14.965.823)."
              },
              "expense_distribution": [
                { "category": "Sewa Tempat", "amount": 3500000 },
                { "category": "Pemasaran", "amount": 3011639 },
                { "category": "Gaji Karyawan", "amount": 2500000 }
              ],
              "daily_cashflow": [
                { "date": "01/05", "income": 1200000, "expense": 100000 },
                { "date": "02/05", "income": 1500000, "expense": 200000 }
              ]
            }</pre>
          </div>
        </div>
      </section>

      <footer class="mt-16 mb-8 text-center text-slate-400 text-sm font-medium">
        &copy; 2026 Artha API Services. Built for scaling.
      </footer>
    </div>
  </body>
</html>
  `);
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  // Jalankan server hanya jika file ini di-run langsung (bukan di-import)
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Dokumentasi API: http://localhost:${PORT}/`);
    console.log(`Base API: http://localhost:${PORT}/api`);
  });
}

// Menjalankan Server
module.exports = app;