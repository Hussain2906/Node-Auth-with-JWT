const multer = require("multer");

const MAX_MB = parseInt(process.env.UPLOAD_MAX_MB || "200", 10);

// ✅ Memory storage (no disk writes, files go into buffer)
const storage = multer.memoryStorage();

const AllowedMimeTypes = new Set([
  "video/mp4", "video/quicktime",
  "image/jpeg", "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function fileFilter(req, file, cb) {
  if (AllowedMimeTypes.has(file.mimetype)) return cb(null, true);
  cb(new Error("File type not allowed: " + file.mimetype));
}

const fileLimits = {
  fileSize: MAX_MB * 1024 * 1024,
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: fileLimits,
});

const uploadMultiple = upload.array("files", 10);

module.exports = { uploadMultiple, MAX_MB };
