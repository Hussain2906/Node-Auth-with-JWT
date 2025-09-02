const express = require("express");

const router = express.Router();
const { handleFileServe } = require("./serve.controller");

router.get("/fileserve/:id", handleFileServe);
module.exports = router;