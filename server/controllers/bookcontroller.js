const Book = require("../models/books");
const { uploadPdfToCloudinary } = require("../middleware/upload");

// ADD BOOK
const addBook = async (req, res) => {
  try {
    const { bookName, price } = req.body;

    if (!bookName || !price) {
      return res.status(400).json({
        success: false,
        message: "bookName and price are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Book PDF file is required",
      });
    }

    // Upload PDF buffer to Cloudinary
    const cloudinaryResult = await uploadPdfToCloudinary(req.file.buffer);

    // Create book
    const book = await Book.create({
      bookName,
      price,
      pdfUrl: cloudinaryResult.secure_url,
      pdfPublicId: cloudinaryResult.public_id,
    });

    return res.status(201).json({
      success: true,
      message: "Book and PDF uploaded successfully",
      data: book,
    });
  } catch (error) {
    console.error("Error adding book:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding book",
      error: error.message,
    });
  }
};

// GET ALL BOOKS
const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching books",
      error: error.message,
    });
  }
};

module.exports = {
  addBook,
  getBooks,
};