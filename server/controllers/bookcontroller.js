const Book = require("../models/books");
const { uploadPdfToCloudinary, uploadImageToCloudinary, cloudinary } = require("../middleware/upload");

// ADD BOOK (Admin only)
const addBook = async (req, res) => {
  let cloudinaryResult = null;
  let coverResult = null;
  try {
    const { bookName, price, author, category, description, status } = req.body || {};

    if (!bookName || price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "Book title and price are required",
      });
    }

    const pdfFile = req.files?.pdf?.[0];
    const coverFile = req.files?.cover?.[0];

    if (!pdfFile) {
      return res.status(400).json({
        success: false,
        message: "Book PDF file is required",
      });
    }

    // Upload PDF buffer to Cloudinary
    cloudinaryResult = await uploadPdfToCloudinary(pdfFile.buffer);

    if (coverFile) {
      coverResult = await uploadImageToCloudinary(coverFile.buffer);
    }

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
        coverUrl: coverResult?.secure_url || coverResult?.url,
        coverPublicId: coverResult?.public_id,
        status: status || "published",
      });
    } catch (dbError) {
      console.error("Database error saving book. Cleaning up Cloudinary upload...", dbError);
      if (cloudinaryResult.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id, { resource_type: "raw" });
      }
      if (coverResult?.public_id) {
        await cloudinary.uploader.destroy(coverResult.public_id, { resource_type: "image" });
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

// UPDATE BOOK (Admin only)
const updateBook = async (req, res) => {
  let cloudinaryResult = null;
  let coverResult = null;
  try {
    const { id } = req.params;
    const { bookName, price, author, category, description, status } = req.body || {};
    const pdfFile = req.files?.pdf?.[0];
    const coverFile = req.files?.cover?.[0];
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    if (!bookName || price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "Book title and price are required",
      });
    }

    if (status && !["draft", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'draft' or 'published'",
      });
    }

    const update = {
      bookName: String(bookName).trim(),
      price: Number(price),
      author: author || "MindfulPath Editorial",
      category: category || "Mental Health",
      description: description || "",
    };

    if (status) update.status = status;

    if (pdfFile) {
      cloudinaryResult = await uploadPdfToCloudinary(pdfFile.buffer);
      const pdfUrl = cloudinaryResult.secure_url || cloudinaryResult.url;
      if (!pdfUrl) {
        return res.status(500).json({ success: false, message: "Failed to obtain secure PDF URL from Cloudinary" });
      }
      update.pdfUrl = pdfUrl;
      update.pdfPublicId = cloudinaryResult.public_id;
    }

    if (coverFile) {
      coverResult = await uploadImageToCloudinary(coverFile.buffer);
      update.coverUrl = coverResult.secure_url || coverResult.url;
      update.coverPublicId = coverResult.public_id;
    }

    const updatedBook = await Book.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (pdfFile && book.pdfPublicId && book.pdfPublicId !== updatedBook.pdfPublicId) {
      try {
        await cloudinary.uploader.destroy(book.pdfPublicId, { resource_type: "raw" });
      } catch (cloudErr) {
        console.warn("Cloudinary cleanup warning:", cloudErr.message);
      }
    }

    if (coverFile && book.coverPublicId && book.coverPublicId !== updatedBook.coverPublicId) {
      try {
        await cloudinary.uploader.destroy(book.coverPublicId, { resource_type: "image" });
      } catch (cloudErr) {
        console.warn("Cloudinary cover cleanup warning:", cloudErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    if (cloudinaryResult?.public_id) {
      await cloudinary.uploader.destroy(cloudinaryResult.public_id, { resource_type: "raw" }).catch(() => {});
    }
    if (coverResult?.public_id) {
      await cloudinary.uploader.destroy(coverResult.public_id, { resource_type: "image" }).catch(() => {});
    }
    console.error("Error updating book:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating book",
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
  updateBook,
  updateBookStatus,
  deleteBook,
};