const Audio = require("../models/audio");
const { uploadAudioToCloudinary, cloudinary } = require("../middleware/upload");

// UPLOAD AUDIO & SAVE TO MONGO DB
const uploadAudioFile = async (req, res) => {
  let cloudinaryResult = null;
  try {
    const file = req.file || (req.files && req.files[0]);
    const { title, host } = req.body || {};

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an audio file",
      });
    }

    // Stream upload to Cloudinary
    cloudinaryResult = await uploadAudioToCloudinary(file.buffer);

    const audioUrl = cloudinaryResult.secure_url || cloudinaryResult.url;

    if (!audioUrl) {
      // Clean up Cloudinary asset if URL missing
      if (cloudinaryResult.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id, { resource_type: "video" });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to obtain secure URL from Cloudinary",
      });
    }

    // Create and save audio record in MongoDB
    let audioRecord;
    try {
      audioRecord = await Audio.create({
        title: title || file.originalname || "Untitled Episode",
        host: host || "MindfulPath Team",
        audioUrl: audioUrl,
        publicId: cloudinaryResult.public_id,
        duration: cloudinaryResult.duration || 0,
        format: cloudinaryResult.format,
        bytes: cloudinaryResult.bytes,
      });
    } catch (dbError) {
      // Rollback Cloudinary upload if DB creation fails
      console.error("Database save failed. Deleting uploaded file from Cloudinary...", dbError);
      if (cloudinaryResult.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id, { resource_type: "video" });
      }
      throw dbError;
    }

    return res.status(201).json({
      success: true,
      message: "Audio file uploaded and saved to database successfully",
      data: audioRecord,
    });
  } catch (error) {
    console.error("Error uploading audio file:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading audio file",
      error: error.message,
    });
  }
};

// GET ALL AUDIOS FROM MONGO DB
const getAudioFiles = async (req, res) => {
  try {
    const audios = await Audio.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: audios,
    });
  } catch (error) {
    console.error("Error fetching audios:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching audios",
      error: error.message,
    });
  }
};

module.exports = {
  uploadAudioFile,
  getAudioFiles,
};
