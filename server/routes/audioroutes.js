const express = require("express");
const { uploadAudioFile, getAudioFiles } = require("../controllers/audiocontroller");
const { uploadAudio } = require("../middleware/upload");

const router = express.Router();

// GET /api/audio (Fetch all saved audio files)
router.get("/", getAudioFiles);

// POST /api/audio/upload (Upload audio file to Cloudinary & save to DB)
router.post("/upload", uploadAudio.any(), uploadAudioFile);

module.exports = router;
