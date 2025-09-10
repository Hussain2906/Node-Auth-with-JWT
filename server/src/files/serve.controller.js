// server/src/files/serve.controller.js
const { FileModel } = require("./file.model");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const path = require("path");
const fs = require("fs");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

const handleFileServe = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await FileModel.findById(id);
    if (!doc) return res.status(404).send("Not found");

    // ✅ serve from S3
    if (doc.storage?.kind === "s3" && doc.storage?.key) {
      const type = doc.mimeType || "application/octet-stream";
      res.setHeader("Content-Type", type);

      // Only force download for non-renderables
      if (!type.startsWith("image/") && !type.startsWith("video/") && !type.includes("pdf")) {
        res.setHeader("Content-Disposition", `attachment; filename="${doc.originalName}"`);
      }

      // Get stream from S3
      const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: doc.storage.key });
      const data = await s3.send(command);

      if (!data.Body) {
        return res.status(404).send("File missing in S3");
      }

      return data.Body.pipe(res); // ✅ Body is a stream
    }

    // ✅ fallback for disk storage
    if (doc.storage?.path) {
      const filePath = path.resolve(doc.storage.path);
      if (!fs.existsSync(filePath)) {
        return res.status(404).send("File missing on disk");
      }
      const type = doc.mimeType || mime.lookup(filePath) || "application/octet-stream";
      res.setHeader("Content-Type", type);
      return res.sendFile(filePath);
    }

    return res.status(404).send("File storage info missing");
  } catch (err) {
    console.error("handleFileServe error:", err);
    return res.status(500).send("Server error");
  }
};

module.exports = { handleFileServe };
