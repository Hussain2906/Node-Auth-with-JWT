const express = require("express");
const router = express.Router();
const { uploadMultiple } = require("./upload.middleware");
const { handleUpload, handleList, handleGetOne, handleDelete } = require("./file.controller");
const { authRequired } = require("../auth.require");

router.post("/files", authRequired, uploadMultiple, handleUpload);
router.get("/files", authRequired, handleList);
router.get("/files/:id", authRequired, handleGetOne);
router.delete("/files/:id", authRequired, handleDelete);

module.exports = router;
