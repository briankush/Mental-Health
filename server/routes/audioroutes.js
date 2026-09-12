const express = require("express");
const {
  uploadAudioFile,
  getAudioFiles,
  getPublishedAudio,
  updateAudio,
  updateAudioStatus,
  deleteAudio,
} = require("../controllers/audiocontroller");
const { audioAssetUpload } = require("../middleware/upload");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

// PUBLIC — User-facing: only published audio (no auth required)
router.get("/published", getPublishedAudio);

// ADMIN ONLY — Returns all audio regardless of status
router.get("/", auth, adminOnly, getAudioFiles);

// ADMIN ONLY — Upload audio file to Cloudinary & save to DB
router.post("/upload", auth, adminOnly, audioAssetUpload.fields([{ name: "audio", maxCount: 1 }, { name: "cover", maxCount: 1 }]), uploadAudioFile);

// ADMIN ONLY — Edit audio metadata and optionally replace files
router.patch("/:id", auth, adminOnly, audioAssetUpload.fields([{ name: "audio", maxCount: 1 }, { name: "cover", maxCount: 1 }]), updateAudio);

// ADMIN ONLY — Update audio status (draft / published)
router.patch("/:id/status", auth, adminOnly, updateAudioStatus);

// ADMIN ONLY — Delete an audio record
router.delete("/:id", auth, adminOnly, deleteAudio);

module.exports = router;
