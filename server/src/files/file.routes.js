const express = require("express");
const router = express.Router();
const { uploadMultiple } = require("./upload.middleware");
const { handleUpload, handleList, handleGetOne } = require("./file.controller");
const { authRequired } = require("../auth.require");

router.post("/files", authRequired, uploadMultiple, handleUpload);
router.get("/files", authRequired, handleList);
router.get("/files/:id", authRequired, handleGetOne);

module.exports = router;
