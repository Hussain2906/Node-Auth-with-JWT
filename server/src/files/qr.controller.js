const fs = require("fs");
const path = require("path");
const { FileModel } = require("./file.model");

async function handleQrPng(req, res) {
  const { id } = req.params;
  const doc = await FileModel.findById(id);
  if (!doc) return res.status(404).send("Not found");

  const pngPath = doc.qr?.pngPath;
  if (!pngPath || !fs.existsSync(pngPath)) {
    return res.status(404).send("QR not found");
  }

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Disposition", `attachment; filename="${id}.png"`);
  return res.sendFile(path.resolve(pngPath));
}

function getQrUrl(id) {
  const PUBLIC = process.env.PUBLIC_BASE_URL || "http://localhost:8000/";
  return `${PUBLIC}api/qr/${id}.png`;
}

module.exports = { handleQrPng, getQrUrl };
