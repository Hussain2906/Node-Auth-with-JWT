const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { Readable } = require("stream");

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Upload file buffer to S3
async function uploadToS3(key, buffer, mimetype) {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  });
  await s3.send(cmd);
  return getS3PublicUrl(key);
}

// ✅ Stream file from S3
function getS3FileStream(key) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return s3.send(cmd).then(resp => resp.Body instanceof Readable ? resp.Body : Readable.from(resp.Body));
}

// ✅ Delete file from S3
async function deleteFromS3(key) {
  const cmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  await s3.send(cmd);
}

// ✅ Build a public URL
function getS3PublicUrl(key) {
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

module.exports = { uploadToS3, getS3FileStream, deleteFromS3, getS3PublicUrl };
