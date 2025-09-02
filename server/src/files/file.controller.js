const { FileModel } = require('./file.model');
const { processUploadedFiles, toClientDTO, toClientList } = require('./file.service');
const { getQrUrl } = require('./qr.controller'); // helper for generating qr url

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

    // build response objects with qrUrl injected
    const items = docs.map(doc => {
      const dto = toClientDTO(doc);
      dto.qrUrl = getQrUrl(doc._id);
      return dto;
    });

    return res.status(201).json({ items });
  } catch (err) {
    console.error('Error in handleUpload:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET /api/files — list with pagination + optional filter
const handleList = async (req, res) => {
  try {
    const page = parseIntOr(req.query.page, 1);
    const limit = parseIntOr(req.query.limit, 20);

    const filter = { uploaderId: req.user.id };
    if (req.query.mimeType) {
      filter.mimeType = req.query.mimeType;
    }

    const cursor = FileModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const [items, total] = await Promise.all([cursor, FileModel.countDocuments(filter)]);

    // map each doc to client dto + attach qrUrl
    const dtoItems = items.map(doc => {
      const dto = toClientDTO(doc);
      dto.qrUrl = getQrUrl(doc._id);
      return dto;
    });

    return res.status(200).json({ page, limit, total, items: dtoItems });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'list failed' });
  }
};

// GET /api/files/:id — single meta
const handleGetOne = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await FileModel.findById(id);
    if (!doc) {
      return res.status(404).json({ error: 'not found' });
    }
    const dto = toClientDTO(doc);
    dto.qrUrl = getQrUrl(doc._id); // add qr url for direct use in UI
    return res.status(200).json({ items: dto });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'fetch failed' });
  }
};

module.exports = { handleUpload, handleList, handleGetOne };
