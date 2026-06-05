const supabase = require("../config/supabase");

/**
 * JWT Auth Middleware
 * Melindungi rute API dengan validasi token Supabase.
 * 
 * Urutan Validasi:
 * 1. Cek header Authorization: Bearer <token>
 * 2. Verifikasi JWT via Supabase getUser()
 * 3. Set req.user dengan data user terautentikasi
 * 4. Isolasi data: query selanjutnya bisa filter by user_id
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Token tidak ditemukan",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN:", token.substring(0, 30));

    const { data, error } = await supabase.auth.getUser(token);

    console.log("GET USER RESULT:", data);
    console.log("GET USER ERROR:", error);

    if (error || !data.user) {
      return res.status(401).json({
        status: "error",
        message: "Token invalid",
      });
    }

    req.user = data.user;

    next();

  } catch (err) {
    console.error(err);

    return res.status(401).json({
      status: "error",
      message: err.message,
    });
  }
};

module.exports = authMiddleware;
