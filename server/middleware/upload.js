const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// Configure Multer memory storage
const storage = multer.memoryStorage();

// File filter to accept only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit 10MB
});

const bookAssetUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "pdf" && file.mimetype === "application/pdf") {
      return cb(null, true);
    }
    if (file.fieldname === "cover" && ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Books require a PDF and covers must be PNG, JPG, or WEBP files."), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// File filter to accept audio files
const audioFileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("audio/") ||
    /\.(mp3|wav|m4a|aac|ogg|webm)$/i.test(file.originalname)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Only audio files (mp3, wav, m4a, aac, ogg, webm) are allowed!"),
      false
    );
  }
};

const uploadAudio = multer({
  storage,
  fileFilter: audioFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit 50MB for audio
});

const audioAssetUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "audio" && (
      file.mimetype.startsWith("audio/") ||
      /\.(mp3|wav|m4a|aac|ogg|webm)$/i.test(file.originalname)
    )) {
      return cb(null, true);
    }
    if (file.fieldname === "cover" && ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Audio covers must be PNG, JPG, or WEBP files."), false);
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Helper function to stream upload PDF to Cloudinary
const uploadPdfToCloudinary = (fileBuffer) => {
  // Ensure Cloudinary is configured with environment variables on each upload
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "books_pdfs",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

const uploadImageToCloudinary = (fileBuffer, folder = "book_covers") => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// Helper function to stream upload Audio to Cloudinary
const uploadAudioToCloudinary = (fileBuffer) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",  // Audio files use resource_type "video" in Cloudinary
        folder: "audio_files",
        timeout: 120000,         // 2-minute upload timeout
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

module.exports = {
  cloudinary,
  upload,
  bookAssetUpload,
  uploadAudio,
  audioAssetUpload,
  uploadPdfToCloudinary,
  uploadImageToCloudinary,
  uploadAudioToCloudinary,
};
