const mongoose = require("mongoose");

const audioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    host: {
      type: String,
      trim: true,
      default: "MindfulPath Team",
    },
    audioUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
    },
    coverUrl: {
      type: String,
    },
    coverPublicId: {
      type: String,
    },
    duration: {
      type: Number,
    },
    format: {
      type: String,
    },
    bytes: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Audio", audioSchema);
