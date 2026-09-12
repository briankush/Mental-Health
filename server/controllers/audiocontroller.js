const Audio = require("../models/audio");
const { uploadAudioToCloudinary, uploadImageToCloudinary, cloudinary } = require("../middleware/upload");

// UPLOAD AUDIO & SAVE TO MONGODB (Admin only)
const uploadAudioFile = async (req, res) => {
  let cloudinaryResult = null;
  let coverResult = null;
  try {
    const file = req.files?.audio?.[0] || req.file || (Array.isArray(req.files) && req.files[0]);
    const coverFile = req.files?.cover?.[0];
    const { title, host, status } = req.body || {};

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an audio file",
      });
    }

    // Stream upload to Cloudinary
    cloudinaryResult = await uploadAudioToCloudinary(file.buffer);

    if (coverFile) {
      coverResult = await uploadImageToCloudinary(coverFile.buffer, "audio_covers");
    }

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
        coverUrl: coverResult?.secure_url || coverResult?.url,
        coverPublicId: coverResult?.public_id,
        duration: cloudinaryResult.duration || 0,
        format: cloudinaryResult.format,
        bytes: cloudinaryResult.bytes,
        status: status || "draft",
      });
    } catch (dbError) {
      // Rollback Cloudinary upload if DB creation fails
      console.error("Database save failed. Deleting uploaded file from Cloudinary...", dbError);
      if (cloudinaryResult.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id, { resource_type: "video" });
      }
      if (coverResult?.public_id) {
        await cloudinary.uploader.destroy(coverResult.public_id, { resource_type: "image" });
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

// GET ALL AUDIO (Admin only — returns all statuses)
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

// GET PUBLISHED AUDIO (Public — user-facing, only published)
const getPublishedAudio = async (req, res) => {
  try {
    const audios = await Audio.find({ status: "published" }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: audios,
    });
  } catch (error) {
    console.error("Error fetching published audio:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching audio",
      error: error.message,
    });
  }
};

// UPDATE AUDIO (Admin only)
const updateAudio = async (req, res) => {
  let audioResult = null;
  let coverResult = null;
  try {
    const audio = await Audio.findById(req.params.id);
    const audioFile = req.files?.audio?.[0];
    const coverFile = req.files?.cover?.[0];
    const { title, host, status } = req.body || {};

    if (!audio) return res.status(404).json({ success: false, message: "Audio not found" });
    if (!title) return res.status(400).json({ success: false, message: "Episode title is required" });
    if (status && !["draft", "published"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'draft' or 'published'" });
    }

    const update = { title, host: host || "MindfulPath Team", ...(status ? { status } : {}) };

    if (audioFile) {
      audioResult = await uploadAudioToCloudinary(audioFile.buffer);
      update.audioUrl = audioResult.secure_url || audioResult.url;
      update.publicId = audioResult.public_id;
      update.duration = audioResult.duration || 0;
      update.format = audioResult.format;
      update.bytes = audioResult.bytes;
    }

    if (coverFile) {
      coverResult = await uploadImageToCloudinary(coverFile.buffer, "audio_covers");
      update.coverUrl = coverResult.secure_url || coverResult.url;
      update.coverPublicId = coverResult.public_id;
    }

    const updatedAudio = await Audio.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });

    if (audioFile && audio.publicId && audio.publicId !== updatedAudio.publicId) {
      await cloudinary.uploader.destroy(audio.publicId, { resource_type: "video" }).catch(() => {});
    }
    if (coverFile && audio.coverPublicId && audio.coverPublicId !== updatedAudio.coverPublicId) {
      await cloudinary.uploader.destroy(audio.coverPublicId, { resource_type: "image" }).catch(() => {});
    }

    return res.json({ success: true, message: "Audio updated successfully", data: updatedAudio });
  } catch (error) {
    if (audioResult?.public_id) await cloudinary.uploader.destroy(audioResult.public_id, { resource_type: "video" }).catch(() => {});
    if (coverResult?.public_id) await cloudinary.uploader.destroy(coverResult.public_id, { resource_type: "image" }).catch(() => {});
    return res.status(500).json({ success: false, message: "Server error while updating audio" });
  }
};

// UPDATE AUDIO STATUS (Admin only)
const updateAudioStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'draft' or 'published'",
      });
    }

    const audio = await Audio.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!audio) {
      return res.status(404).json({ success: false, message: "Audio not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Audio status updated to '${status}'`,
      data: audio,
    });
  } catch (error) {
    console.error("Error updating audio status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating audio status",
      error: error.message,
    });
  }
};

// DELETE AUDIO (Admin only)
const deleteAudio = async (req, res) => {
  try {
    const { id } = req.params;
    const audio = await Audio.findById(id);

    if (!audio) {
      return res.status(404).json({ success: false, message: "Audio not found" });
    }

    // Remove from Cloudinary if public ID exists
    if (audio.publicId) {
      try {
        await cloudinary.uploader.destroy(audio.publicId, { resource_type: "video" });
      } catch (cloudErr) {
        console.warn("Cloudinary cleanup warning:", cloudErr.message);
      }
    }

    await Audio.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Audio deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting audio:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting audio",
      error: error.message,
    });
  }
};

module.exports = {
  uploadAudioFile,
  getAudioFiles,
  getPublishedAudio,
  updateAudio,
  updateAudioStatus,
  deleteAudio,
};
