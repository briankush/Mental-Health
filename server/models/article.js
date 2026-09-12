const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: "MindfulPath Editorial" },
    category: { type: String, required: true, trim: true },
    excerpt: { type: String, trim: true, default: "" },
    content: { type: String, trim: true, default: "" },
    image: { type: String, default: "" },
    readingTime: { type: Number, min: 1, default: 5 },
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
