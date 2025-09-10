const mongoose = require("mongoose");

const { Schema } = mongoose;
const fileSchema = new Schema(
    {
        originalName: { type: String, required: true },          
        mimeType: { type: String, required: true },          
        sizeBytes: { type: Number, required: true },          
        storage: {
            kind: { type: String, enum: ["disk", "s3"], default: "disk" }, 
            path: { type: String},                   
            url: { type: String },                                   
        },
        qr: {
            pngPath: { type: String, required: true },           
            publicUrl: { type: String, required: true },          
        },
        uploaderId: { type: String, required: true },
    },
    { timestamps: true }
)
fileSchema.index({ createdAt: -1 });
fileSchema.index({ mimeType: 1 });

const FileModel = mongoose.model("UploadFile", fileSchema);
module.exports = { FileModel };
