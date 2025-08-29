const express = require("express");
const router = express.Router();
const { handleSignup, handleLogin, handleMe, handleLogout } = require("./auth.controller");

router.post("/signup", handleSignup);
router.post("/login", handleLogin);
router.get("/me", handleMe);
router.post("/logout", handleLogout);

module.exports = router;
