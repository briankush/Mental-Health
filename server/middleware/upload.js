const multer = require("multer");
const cloudinary = require("cloudinary").v2;

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

// Helper function to stream upload to Cloudinary
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

module.exports = {
  upload,
  uploadPdfToCloudinary,
};
