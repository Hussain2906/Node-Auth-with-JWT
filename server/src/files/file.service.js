const path = require("path");
const mongoose = require("mongoose");
const QRCode = require("qrcode");

const { FileModel } = require("./file.model");
const { QRS_DIR } = require("./upload.middleware");

// make sure no trailing slash in base URL
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:8000").replace(/\/$/, "");

// build the public view URL for file
function makeViewUrl(id) {
  return `${PUBLIC_BASE_URL}/v/${id}`;
}

// build the path where QR PNG will be stored
function makeQrPngPath(id) {
  return path.join(QRS_DIR, `${id}.png`);
}

// convert multer file info into DB schema shape
function mapMulterToMeta(file) {
  const absolutePath = path.join(file.destination, file.filename);
  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    storage: { kind: "disk", path: absolutePath },
  };
}

// create DB doc + generate QR PNG file
async function createDocAndQr(file, uploaderId = null) {
  const _id = new mongoose.Types.ObjectId();
  const base = mapMulterToMeta(file);
  const idStr = _id.toString();
  const viewUrl = makeViewUrl(idStr);
  const qrPngPath = makeQrPngPath(idStr);

  await QRCode.toFile(qrPngPath, viewUrl, {
    type: "png",
    errorCorrectionLevel: "M",
  });

  const doc = await FileModel.create({
    _id,
    ...base,
    qr: { pngPath: qrPngPath, publicUrl: viewUrl },
    uploaderId,
  });

  return doc;
}

// process multiple uploaded files
const processUploadedFiles = async (files, uploaderId = null) => {
  const results = [];
  for (const file of files) {
    const doc = await createDocAndQr(file, uploaderId);
    results.push(doc);
  }
  return results;
};

// convert DB doc into safe client object
const toClientDTO = (doc) => {
  const id = doc._id.toString();
  return {
    id,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    sizeBytes: doc.sizeBytes,
    createdAt: doc.createdAt,
    qrPngUrl: `${PUBLIC_BASE_URL}/qr/${id}.png`,
    viewUrl: `${PUBLIC_BASE_URL}/v/${id}`,
  };
};

// list converter
function toClientList(docs) {
  return docs.map(toClientDTO);
}

module.exports = { processUploadedFiles, toClientDTO, toClientList };
