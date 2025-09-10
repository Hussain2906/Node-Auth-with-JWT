const { FileModel } = require('./file.model');
const { processUploadedFiles, toClientDTO, toClientList } = require('./file.service');
const { getQrUrl } = require('./qr.controller'); 
const { deleteFromS3 } = require('./s3.service'); //  new import

function parseIntOr(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// POST /api/files
const handleUpload = async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploaderId = req.user?.id || null;
    const docs = await processUploadedFiles(files, uploaderId);

    // await each async dto
    const items = await Promise.all(
      docs.map(async (doc) => {
        const dto = await toClientDTO(doc);
        dto.qrUrl = getQrUrl(doc._id);
        return dto;
      })
    );
    console.log("DEBUG uploaded files:", files.map(f => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      size: f.size
    })));
    

    return res.status(201).json({ items });
  } catch (err) {
    console.error('Error in handleUpload:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET /api/files — list
const handleList = async (req, res) => {
  try {
    const page = parseIntOr(req.query.page, 1);
    const limit = parseIntOr(req.query.limit, 20);

    const filter = { uploaderId: req.user.id };
    if (req.query.mimeType) filter.mimeType = req.query.mimeType;

    const cursor = FileModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const [items, total] = await Promise.all([
      cursor,
      FileModel.countDocuments(filter),
    ]);

    const dtoItems = await Promise.all(
      items.map(async (doc) => {
        const dto = await toClientDTO(doc);
        dto.qrUrl = getQrUrl(doc._id);
        return dto;
      })
    );

    return res.status(200).json({ page, limit, total, items: dtoItems });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'list failed' });
  }
};

// GET /api/files/:id
const handleGetOne = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await FileModel.findById(id);
    if (!doc) {
      return res.status(404).json({ error: 'not found' });
    }
    const dto = await toClientDTO(doc);
    dto.qrUrl = getQrUrl(doc._id);
    return res.status(200).json({ items: dto });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'fetch failed' });
  }
};

// DELETE /api/files/:id
const handleDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await FileModel.findById(id);
    if (!doc) return res.status(404).json({ error: "File not found" });

    //  Delete original file from S3
    if (doc.storage?.key) {
      await deleteFromS3(doc.storage.key);
    }

    //  Delete QR PNG from S3 (if stored separately)
    if (doc.qr?.key) {
      await deleteFromS3(doc.qr.key);
    }

    await FileModel.deleteOne({ _id: id });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Delete failed" });
  }
};

module.exports = { handleUpload, handleList, handleGetOne, handleDelete };
