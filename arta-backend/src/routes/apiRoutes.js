const express = require("express");
const router = express.Router();

const uploadMiddleware = require("../middlewares/uploadMiddleware");
const transactionController = require("../controllers/transactionController");
const profileController = require("../controllers/profileController");
const userController = require('../controllers/userController');
const businessController = require('../controllers/businessController');
const feasibilityController = require('../controllers/feasibilityController');
const dashboardController = require('../controllers/dashboardController');
const forecastController = require('../controllers/forecastController');
const reportController = require('../controllers/reportController');
const authMiddleware = require("../middlewares/authMiddleware");

// --- HEALTH (Dibutuhkan oleh Dashboard.jsx) ---
router.get("/health", (req, res) => {
  res.status(200).json({ message: "Berhasil terhubung ke server Back-End!" });
});

// --- TRANSACTIONS (Dilindungi authMiddleware) ---
router.get("/transactions", authMiddleware, transactionController.getTransactions);
router.post(
  "/transactions",authMiddleware,
  uploadMiddleware.single("invoiceFile"),
  transactionController.createTransaction,
);
router.put(
  "/transactions/:id", authMiddleware,
  uploadMiddleware.single("invoiceFile"),
  transactionController.updateTransaction,
);
router.delete("/transactions/:id", authMiddleware, transactionController.deleteTransaction);

// PROFILE USER 
// GET /api/profile — Ambil profil user
router.get("/profile", authMiddleware, profileController.getProfile);
// POST /api/profile/onboarding — Simpan hasil onboarding
router.post("/profile/onboarding", authMiddleware, profileController.updateOnboarding);
// POST /api/profile/upgrade — Upgrade ke UMKM Aktif
router.post("/profile/upgrade", authMiddleware, profileController.upgradeToUmkm);
// PUT /api/profile — Update Informasi Pribadi & Keamanan (Password)
router.put("/profile", authMiddleware, profileController.updateProfile);

// Rute Manajemen Pengguna (Karyawan)
router.get('/users', authMiddleware, userController.getUsers);
router.post('/users', authMiddleware, userController.createUser);
router.put('/users/:id', authMiddleware, userController.updateUser);
router.delete('/users/:id', authMiddleware, userController.deleteUser);

// Edit Profile Company
router.put('/business', authMiddleware, businessController.updateBusiness);

// Rute Kuesioner Kelayakan Bisnis (Protected)
router.post('/feasibility-tests', authMiddleware, feasibilityController.submitQuestionnaire);
router.get('/feasibility-tests/latest', authMiddleware, feasibilityController.getLatestResponse);

// Route Dashboard Overview (Protected)
router.get('/dashboard/overview', authMiddleware, dashboardController.getOverview);

// Route Prediksi AI (Protected)
router.get('/forecast', authMiddleware, forecastController.getForecast);

// Route Laporan Keuangan
router.get('/reports/financial', authMiddleware, reportController.getFinancialReport);

module.exports = router;
