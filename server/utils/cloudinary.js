const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'rentease/properties', allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] },
});

const docStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'rentease/documents', resource_type: 'raw', allowed_formats: ['pdf', 'jpg', 'png', 'jpeg'] },
});

const uploadImages = multer({ storage: imageStorage });
const uploadDoc = multer({ storage: docStorage });

module.exports = { cloudinary, uploadImages, uploadDoc };
