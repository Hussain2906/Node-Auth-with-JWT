// server/src/files/qr.routes.js
const express = require("express");
const router = express.Router();
const { handleQrPng } = require("./qr.controller");

// route to serve QR images
router.get("/qr/:id.png", handleQrPng);

module.exports = router;
