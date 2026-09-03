const express = require("express");
const {
  addBook,
  getBooks,
  getPublishedBooks,
  updateBookStatus,
  deleteBook,
} = require("../controllers/bookcontroller");
const { upload } = require("../middleware/upload");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

// PUBLIC — User-facing: only published books (no auth required)
router.get("/published", getPublishedBooks);

// ADMIN ONLY — Returns all books regardless of status
router.get("/", auth, adminOnly, getBooks);

// ADMIN ONLY — Upload a new book
router.post("/", auth, adminOnly, upload.single("pdf"), addBook);

// ADMIN ONLY — Update book status (draft / published)
router.patch("/:id/status", auth, adminOnly, updateBookStatus);

// ADMIN ONLY — Delete a book
router.delete("/:id", auth, adminOnly, deleteBook);

module.exports = router;