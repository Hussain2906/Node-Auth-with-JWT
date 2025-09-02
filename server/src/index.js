// server/src/index.js (top)
const express = require("express")
const cookieParser = require("cookie-parser")
const { connectToMongo } = require("./db/mongo")
const cors = require("cors")
const multer = require("multer");
const { MAX_MB } = require("./files/upload.middleware");

const authRoutes = require("./routes.auth")
const fileRoutes = require("./files/file.routes")
const viewerRoutes = require("./files/viewer.routes")
const serveRoutes = require("./files/serve.routes")
const qrRoutes = require("./files/qr.routes")

const VITE = process.env.VITE_ORIGIN || "http://localhost:5173"
const app = express()
const PORT = process.env.PORT || 8000

app.use(cors({ origin: VITE, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get("/health", (req, res) => res.status(200).send("ok"))

app.use("/api", authRoutes)
app.use("/api", fileRoutes)
app.use("/", viewerRoutes)
app.use("/", serveRoutes)
app.use("/", qrRoutes)

connectToMongo()
  .then(() => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => {
      console.log(`Server running on ${process.env.PUBLIC_BASE_URL} port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err.message)
    process.exit(1)
  })

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // size error
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: `File too large. Max ${MAX_MB} MB allowed.` });
    }
    // any other multer error
    return res.status(400).json({ error: err.message || "Upload error" });
  }
  if (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
  next();
});
