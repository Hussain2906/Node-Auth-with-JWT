const fs = require('fs');
const path = require('path');

const mime = require('mime-types');

const { FileModel } = require('./file.model');

const handleFileServe = async (req, res) => {
    const { id } = req.params;
    const doc = await FileModel.findById(id);
    if (!doc) {
        return res.status(404).send("Not found");
    }

    const filePath = doc.storage?.path;
    if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).send("File missing on server");
    }
    const type = doc.mimeType || mime.lookup(filePath) || "application/octet-stream";
    res.setHeader("Content-Type", type);

    return res.sendFile(path.resolve(filePath));

}

module.exports = { handleFileServe };