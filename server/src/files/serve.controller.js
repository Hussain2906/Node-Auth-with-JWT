// server/src/files/serve.controller.js
const { FileModel } = require("./file.model");
const { getS3FileStream } = require("./s3.service");
const mime = require("mime-types");

const handleFileServe = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await FileModel.findById(id);
    if (!doc) return res.status(404).send("Not found");

    if (doc.storage?.kind === "s3" && doc.storage?.key) {
      const type = doc.mimeType || "application/octet-stream";
      res.setHeader("Content-Type", type);

      const s3Stream = getS3FileStream(doc.storage.key);
      s3Stream.on("error", (err) => {
        console.error("S3 stream error:", err);
        res.status(500).send("Error reading from S3");
      });

      return s3Stream.pipe(res);
    }

    // fallback for disk files (if any old uploads exist)
    if (doc.storage?.path) {
      const path = require("path");
      const fs = require("fs");
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
