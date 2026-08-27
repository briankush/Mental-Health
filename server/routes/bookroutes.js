const express = require("express");
const { addBook, getBooks } = require("../controllers/bookcontroller");
const { upload } = require("../middleware/upload");

const router = express.Router();

// GET /api/books
router.get("/", getBooks);

// POST /api/books
router.post("/", upload.single("pdf"), addBook);

module.exports = router;