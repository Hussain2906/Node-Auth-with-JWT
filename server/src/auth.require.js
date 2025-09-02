const { verifyToken } = require("./utils.jwt.js");
const COOKIE_NAME = "session";

function authRequired(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Login required" });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid session" });
  }
  req.user = { id: payload.id, email: payload.email };
  next();
}

module.exports = { authRequired };
