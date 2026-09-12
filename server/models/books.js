const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    bookName: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      trim: true,
      default: "MindfulPath Editorial",
    },
    category: {
      type: String,
      trim: true,
      default: "Mental Health",
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    pdfPublicId: {
      type: String,
    },
    coverUrl: {
      type: String,
    },
    coverPublicId: {
      type: String,
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

module.exports = mongoose.model("Book", bookSchema);