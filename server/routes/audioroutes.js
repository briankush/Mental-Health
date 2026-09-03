const express = require("express");
const {
  uploadAudioFile,
  getAudioFiles,
  getPublishedAudio,
  updateAudioStatus,
  deleteAudio,
} = require("../controllers/audiocontroller");
const { uploadAudio } = require("../middleware/upload");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

// PUBLIC — User-facing: only published audio (no auth required)
router.get("/published", getPublishedAudio);

// ADMIN ONLY — Returns all audio regardless of status
router.get("/", auth, adminOnly, getAudioFiles);

// ADMIN ONLY — Upload audio file to Cloudinary & save to DB
router.post("/upload", auth, adminOnly, uploadAudio.any(), uploadAudioFile);

// ADMIN ONLY — Update audio status (draft / published)
router.patch("/:id/status", auth, adminOnly, updateAudioStatus);

// ADMIN ONLY — Delete an audio record
router.delete("/:id", auth, adminOnly, deleteAudio);

module.exports = router;
