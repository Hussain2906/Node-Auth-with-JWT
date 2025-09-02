// 1
const mongoose = require("mongoose");
// 2
const dotenv = require("dotenv"); dotenv.config();
// 3
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME   = (process.env.MONGO_DB || "qrapp").trim();
// 4
async function connectToMongo() {
  console.log(`🔌 Mongo connecting → uri=${MONGO_URI?.split("@")[1] || MONGO_URI}, db=${DB_NAME}`);
  // 5
  const conn = await mongoose.connect(MONGO_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 8000 });
  // 6
  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log(`✅ Mongo OK | db="${conn.connection.name}" | state=${mongoose.connection.readyState}`); // 1=connected
  return conn;
}
// 7
module.exports = { connectToMongo };
