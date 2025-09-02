const express = require("express");
const router = express.Router();
const { handleQrPng } = require("./qr.controller");

router.get("/qr/:id.png", handleQrPng);
router.get("/qrs/:id.png", handleQrPng);


module.exports = router;