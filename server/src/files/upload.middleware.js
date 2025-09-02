const fs = require('fs');

const path = require('path');
const multer = require('multer');
const UPLOAD_ROOT = process.env.UPLOAD_ROOT || path.resolve(__dirname, "../../..", "uploads");

const FILES_DIR = path.join(UPLOAD_ROOT, "files");
const QRS_DIR = path.join(UPLOAD_ROOT, "qrs");

for (const dir of [UPLOAD_ROOT, FILES_DIR, QRS_DIR]) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }


const MAX_MB = parseInt(process.env.UPLOAD_MAX_MB || "200", 10);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, FILES_DIR);
    },

    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase();
        const base = path.basename(file.originalname, extension).replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

        cb(null, base + '-' + uniqueSuffix + extension);
    }
})

const AllowedMimeTypes = new Set([
    "video/mp4", "video/quicktime",           
    "image/jpeg", "image/png",                
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
])

function fileFilter (req, file, cb) {
    if (AllowedMimeTypes.has(file.mimetype)) return cb(null, true);
    cb(new Error("File type not allowed: " + file.mimetype));
}


const fileLimits = {
    fileSize: MAX_MB * 1024 * 1024
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: fileLimits,
})
const uploadMultiple = upload.array('files',10)

module.exports = { uploadMultiple, FILES_DIR, QRS_DIR, UPLOAD_ROOT };