const path = require("path");
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { uploadToS3 } = require("./s3.service");
const { FileModel } = require("./file.model");
const { QRS_DIR } = require("./upload.middleware");

// ✅ S3 config
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

// make sure no trailing slash in base URL
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:8000").replace(/\/$/, "");

// build the public view URL for file (still pointing to backend, not direct S3)
function makeViewUrl(id) {
  return `${PUBLIC_BASE_URL}/v/${id}`;
}

// convert multer file info into DB schema shape (S3 path instead of disk path)
function mapMulterToMeta(file, s3Key) {
  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    storage: { kind: "s3", key: s3Key },
  };
}

// create DB doc + generate QR PNG file
async function createDocAndQr(file, uploaderId = null) {
  const _id = new mongoose.Types.ObjectId();
  const idStr = _id.toString();
  const viewUrl = makeViewUrl(idStr);

  // file S3 key (unique per upload)
  const fileKey = `uploads/${idStr}_${file.originalname}`;
  await uploadToS3(fileKey, file.buffer, file.mimetype);
  // generate QR → upload QR PNG to S3 also
  const qrKey = `qrs/${idStr}.png`;
  const qrBuffer = await QRCode.toBuffer(viewUrl, {
    type: "png",
    errorCorrectionLevel: "M",
  });
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: qrKey,
      Body: qrBuffer,
      ContentType: "image/png",
    })
  );

  const base = mapMulterToMeta(file, fileKey);

  const doc = await FileModel.create({
    _id,
    ...base,
    qr: { key: qrKey, publicUrl: viewUrl },
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
const toClientDTO = async (doc) => {
  const id = doc._id.toString();

  // generate signed URLs (valid 1 hour)
  const qrUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: doc.qr.key }),
    { expiresIn: 3600 }
  );

  const fileUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: doc.storage.key }),
    { expiresIn: 3600 }
  );

  return {
    id,
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    sizeBytes: doc.sizeBytes,
    createdAt: doc.createdAt,
    qrPngUrl: qrUrl,
    fileUrl,
    viewUrl: `${PUBLIC_BASE_URL}/v/${id}`, // still route via backend
  };
};

// list converter
async function toClientList(docs) {
  return Promise.all(docs.map(toClientDTO));
}

module.exports = { processUploadedFiles, toClientDTO, toClientList };
