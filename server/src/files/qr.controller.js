const { FileModel } = require("./file.model");
const { getS3FileStream, getS3PublicUrl } = require("./s3.service"); // ✅ new helpers

// GET /api/qr/:id.png
async function handleQrPng(req, res) {
  try {
    const { id } = req.params;
    const doc = await FileModel.findById(id);
    if (!doc) return res.status(404).send("Not found");

    // ✅ Ensure QR exists in DB
    if (!doc.qr?.key) {
      return res.status(404).send("QR not found");
    }

    // ✅ Stream from S3 instead of fs
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="${id}.png"`);

    const s3Stream = getS3FileStream(doc.qr.key);
    s3Stream.on("error", () => res.status(500).send("Error streaming QR from S3"));
    s3Stream.pipe(res);
  } catch (err) {
    console.error("handleQrPng error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// ✅ Now returns S3 public URL (not server route)
function getQrUrl(id, key) {
  if (key) {
    return getS3PublicUrl(key);
  }
  const PUBLIC = process.env.PUBLIC_BASE_URL || "http://localhost:8000/";
  return `${PUBLIC}api/qr/${id}.png`; // fallback
}

module.exports = { handleQrPng, getQrUrl };
