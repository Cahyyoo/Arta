const multer = require("multer");
// Menyimpan file di RAM sementara sebelum dilempar ke Supabase
const upload = multer({ storage: multer.memoryStorage() });

module.exports = upload;
