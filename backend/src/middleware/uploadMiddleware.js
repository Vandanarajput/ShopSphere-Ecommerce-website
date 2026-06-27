const multer = require('multer');
const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

// Upload a buffer to Cloudinary (works on Vercel serverless — no disk writes)
async function uploadToCloudinary(buffer, folder = 'shopsphere') {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary is not configured. Add CLOUDINARY_* env vars.');
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

module.exports = { upload, uploadToCloudinary };
