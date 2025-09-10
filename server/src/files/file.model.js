const mongoose = require("mongoose");

const { Schema } = mongoose;
const fileSchema = new Schema(
  {
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    storage: {
      kind: { type: String, enum: ["disk", "s3"], default: "s3" },
      key: { type: String },   // S3 object key or local path
      url: { type: String },   // public URL
    },
    qr: {
      key: { type: String, required: true },       //  matches service code
      publicUrl: { type: String, required: true },
    },
    uploaderId: { type: String, required: true },
  },
  { timestamps: true }
);

fileSchema.index({ createdAt: -1 });
fileSchema.index({ mimeType: 1 });

const FileModel = mongoose.model("UploadFile", fileSchema);
module.exports = { FileModel };
