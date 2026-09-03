const Book = require("../models/books");
const { uploadPdfToCloudinary, cloudinary } = require("../middleware/upload");

// ADD BOOK (Admin only)
const addBook = async (req, res) => {
  let cloudinaryResult = null;
  try {
    const { bookName, price, author, category, description, status } = req.body || {};

    if (!bookName || price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "Book title and price are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Book PDF file is required",
      });
    }

    // Upload PDF buffer to Cloudinary
    cloudinaryResult = await uploadPdfToCloudinary(req.file.buffer);

    const pdfUrl = cloudinaryResult.secure_url || cloudinaryResult.url;

    if (!pdfUrl) {
      if (cloudinaryResult.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id, { resource_type: "raw" });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to obtain secure PDF URL from Cloudinary",
      });
    }

    // Create book record in MongoDB
    let book;
    try {
      book = await Book.create({
        bookName,
        price: Number(price),
        author: author || "MindfulPath Editorial",
        category: category || "Mental Health",
        description: description || "",
        pdfUrl,
        pdfPublicId: cloudinaryResult.public_id,
        status: status || "draft",
      });
    } catch (dbError) {
      console.error("Database error saving book. Cleaning up Cloudinary upload...", dbError);
      if (cloudinaryResult.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id, { resource_type: "raw" });
      }
      throw dbError;
    }

    return res.status(201).json({
      success: true,
      message: "Book uploaded successfully!",
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

// GET ALL BOOKS (Admin only — returns all statuses)
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

// GET PUBLISHED BOOKS (Public — user-facing, only published)
const getPublishedBooks = async (req, res) => {
  try {
    const books = await Book.find({ status: "published" }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error("Error fetching published books:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching books",
      error: error.message,
    });
  }
};

// UPDATE BOOK STATUS (Admin only)
const updateBookStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'draft' or 'published'",
      });
    }

    const book = await Book.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Book status updated to '${status}'`,
      data: book,
    });
  } catch (error) {
    console.error("Error updating book status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating book status",
      error: error.message,
    });
  }
};

// DELETE BOOK (Admin only)
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    // Remove from Cloudinary if public ID exists
    if (book.pdfPublicId) {
      try {
        await cloudinary.uploader.destroy(book.pdfPublicId, { resource_type: "raw" });
      } catch (cloudErr) {
        console.warn("Cloudinary cleanup warning:", cloudErr.message);
      }
    }

    await Book.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting book",
      error: error.message,
    });
  }
};

module.exports = {
  addBook,
  getBooks,
  getPublishedBooks,
  updateBookStatus,
  deleteBook,
};