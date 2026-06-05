const supabase = require("../config/supabase");

// Registrasi User Baru
const register = async (req, res) => {
  try {
    const { email, password, nama } = req.body;

    // Validasi dasar
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Email dan password wajib diisi" });
    }

    // Mendaftarkan user ke Supabase Auth
    // Supabase akan otomatis mengirim email OTP jika email confirmation diaktifkan
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nama_lengkap: nama,
          role: "OWNER"
        },
      },
    });

    if (error) throw error;

    // Cek apakah user sudah pernah mendaftar dengan email yang sama
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return res.status(409).json({
        status: "error",
        message: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
      });
    }

    res.status(201).json({
      status: "success",
      message: "Registrasi berhasil. Silakan cek email Anda untuk kode verifikasi OTP.",
      data: {
        user: data.user,
        requiresVerification: true,
        email: email,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(400).json({ status: "error", message: error.message });
  }
};

// Verifikasi OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        status: "error",
        message: "Email dan kode OTP wajib diisi",
      });
    }

    // Verifikasi OTP menggunakan Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });

    if (error) throw error;

    if (!data.session) {
      return res.status(400).json({
        status: "error",
        message: "Verifikasi gagal. Kode OTP tidak valid atau sudah expired.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Verifikasi email berhasil! Akun Anda sudah aktif.",
      data: {
        user: data.user,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);

    let message = "Kode OTP tidak valid atau sudah expired.";
    if (error.message?.includes("Token has expired")) {
      message = "Kode OTP sudah expired. Silakan minta kode baru.";
    }

    res.status(400).json({ status: "error", message });
  }
};

// Kirim Ulang OTP
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email wajib diisi",
      });
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) throw error;

    res.status(200).json({
      status: "success",
      message: "Kode OTP baru telah dikirim ke email Anda.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error.message);

    let message = "Gagal mengirim ulang kode OTP.";
    if (error.message?.includes("rate")) {
      message = "Terlalu banyak permintaan. Silakan tunggu beberapa saat.";
    }

    res.status(400).json({ status: "error", message });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Refresh token wajib disertakan",
      });
    }

    // Rotasi token: Supabase mengeluarkan access token baru + refresh token baru
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: token,
    });

    if (error) throw error;

    if (!data.session) {
      return res.status(401).json({
        status: "error",
        message: "Refresh token tidak valid. Silakan login ulang.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Token berhasil diperbarui",
      data: {
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    });
  } catch (error) {
    console.error("Refresh Token Error:", error.message);
    res.status(401).json({
      status: "error",
      message: "Refresh token tidak valid atau sudah expired. Silakan login ulang.",
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Email dan password wajib diisi" });
    }

    // Proses Login menggunakan Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (!data.session) {
      return res.status(401).json({
        status: "error",
        message: "Login gagal: Sesi tidak ditemukan. Pastikan email sudah terverifikasi.",
      });
    }

    // Ambil data profil
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Gagal mengambil profil:", profileError.message);
    }

    // Supabase secara otomatis mengembalikan JWT Token di data.session.access_token
    res.status(200).json({
      status: "success",
      message: "Login berhasil",
      data: {
        user: data.user,
        profile: profileData || null,
        token: data.session.access_token, // Ini JWT Token-nya
        refreshToken: data.session.refresh_token,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message || error);
    
    let message = "Email atau password salah";
    if (error.message === "Email not confirmed") {
      message = "Email belum dikonfirmasi. Silakan cek kotak masuk email Anda untuk kode verifikasi OTP.";
    } else if (error.message === "Invalid login credentials") {
      message = "Email atau password salah";
    }

    res
      .status(error.status || 401)
      .json({ status: "error", message: message });
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  refreshToken,
  login,
};
