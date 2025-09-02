const { FileModel } = require('./file.model');
const { processUploadedFiles, toClientDTO, toClientList } = require('./file.service');

function parseIntOr(value, fallback) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}


//POST /api/files
const handleUpload = async (req, res) => {
    try {
        const files = req.files || []
        if (!files.length) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        const uploaderId = req.user?.id || null;
        const docs = await processUploadedFiles(files, uploaderId);

        return res.status(201).json({ items: toClientList(docs) });
    } catch (err) {
        console.error('Error in handleUpload:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

//GET /api/files — list with pagination + optional filter
const handleList = async (req,res)=>{
    try{
        const page = parseIntOr(req.query.page,1);
        const limit =parseIntOr(req.query.limit,20);

        const filter = { uploaderId: req.user.id };
        if(req.query.mimeType){
            filter.mimeType = req.query.mimeType;
        }
        const cursor = FileModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        const [items, total] = await Promise.all([cursor, FileModel.countDocuments(filter)]);
        return res.status(200).json({ page, limit, total, items: toClientList(items) });
    }catch(err){
        return res.status(500).json({ error: err.message || "list failed" });
    }
}

// GET /api/files/:id — single meta

const handleGetOne = async (req,res)=>{
    try {
        const {id} = req.params;
        const doc = await FileModel.findById(id);
        if (!doc){
            return res.status(404).json({ error: "not found" });
        }
        return res.status(200).json({ items: toClientDTO(doc) });
    } catch (err) {
        return res.status(500).json({ error: err.message || "fetch failed" });
    }
}

module.exports = { handleUpload, handleList, handleGetOne };