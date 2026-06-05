const supabase = require("../config/supabase");

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "Tidak ada file yang diunggah" });

    const file = req.file;
    const uniqueFileName = `${Date.now()}_${file.originalname.replace(/\s/g, "_")}`;

    // Upload ke bucket 'attachments'
    const { data, error } = await supabase.storage
      .from("attachments")
      .upload(uniqueFileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    // Ambil URL Publik
    const { data: urlData } = supabase.storage
      .from("attachments")
      .getPublicUrl(uniqueFileName);

    res.status(200).json({
      message: "Gambar berhasil diunggah",
      url: urlData.publicUrl,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
