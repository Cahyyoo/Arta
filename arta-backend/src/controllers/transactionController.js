const supabase = require("../config/supabase");

// Helper function untuk mengambil business_id
const getBusinessId = async (userId) => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", userId)
    .single();

  if (error || !profile?.business_id) {
    throw new Error("Akses ditolak: Akun Anda belum terikat dengan entitas bisnis manapun.");
  }
  return profile.business_id;
};

exports.getTransactions = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user.id);

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("business_id", businessId) // Hanya ambil transaksi milik bisnis ini
      .order("date", { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    // Menggunakan status 403 untuk error akses (tidak punya bisnis), 500 untuk error database
    const status = err.message.includes("Akses ditolak") ? 403 : 500;
    res.status(status).json({ message: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user.id);
    const { type, amount, date, category, description } = req.body;
    let invoice_name = null;
    let invoice_url = null;

    // Jika ada file gambar diupload
    if (req.file) {
      const file = req.file;
      const uniqueFileName = `${Date.now()}_${file.originalname.replace(/\s/g, "_")}`;

      const { error: uploadError } = await supabase.storage
        .from("attachments") // Pastikan kamu sudah buat public bucket bernama 'attachments'
        .upload(uniqueFileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("attachments")
        .getPublicUrl(uniqueFileName);
      invoice_name = file.originalname;
      invoice_url = urlData.publicUrl;
    }

    // Insert ke database
    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: req.user.id, // Tetap mencatat siapa karyawan/owner yang membuat data
          business_id: businessId, // Mengikat transaksi ini ke entitas bisnis
          type,
          amount: Number(amount),
          date,
          category,
          description,
          invoice_name,
          invoice_url,
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    const status = err.message.includes("Akses ditolak") ? 403 : 500;
    res.status(status).json({ message: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user.id);
    const { id } = req.params;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("business_id", businessId); // Memastikan transaksi yang dihapus milik bisnis ini

    if (error) throw error;
    res.status(200).json({ message: "Transaksi berhasil dihapus" });
  } catch (err) {
    const status = err.message.includes("Akses ditolak") ? 403 : 500;
    res.status(status).json({ message: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const businessId = await getBusinessId(req.user.id);
    const { id } = req.params;
    const { type, amount, date, category, description } = req.body;

    // Siapkan objek data yang akan diupdate
    let updateData = {
      type,
      amount: Number(amount),
      date,
      category,
      description,
    };

    // Jika user mengunggah gambar invoice baru, kita proses upload-nya
    if (req.file) {
      const file = req.file;
      const uniqueFileName = `${Date.now()}_${file.originalname.replace(/\s/g, "_")}`;

      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(uniqueFileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("attachments")
        .getPublicUrl(uniqueFileName);
      updateData.invoice_name = file.originalname;
      updateData.invoice_url = urlData.publicUrl;
    }

    // Lakukan update ke database Supabase
    const { data, error } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", id)
      .eq("business_id", businessId) // Hanya izinkan update jika transaksi milik bisnis ini
      .select();

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan atau Anda tidak memiliki akses",
      });
    }

    res.status(200).json(data[0]);
  } catch (err) {
    const status = err.message.includes("Akses ditolak") ? 403 : 500;
    res.status(status).json({ message: err.message });
  }
};