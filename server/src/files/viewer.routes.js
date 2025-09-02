const express = require("express")

const router = express.Router()
const { handleViewer } = require("./viewer.controller");

router.get("/v/:id", handleViewer);
module.exports = router;