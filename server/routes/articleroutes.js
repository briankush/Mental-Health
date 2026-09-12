const express = require("express");
const {
  getArticles,
  getPublishedArticles,
  createArticle,
  updateArticle,
  updateArticleStatus,
} = require("../controllers/articlecontroller");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const router = express.Router();

router.get("/published", getPublishedArticles);
router.get("/", auth, adminOnly, getArticles);
router.post("/", auth, adminOnly, createArticle);
router.patch("/:id", auth, adminOnly, updateArticle);
router.patch("/:id/status", auth, adminOnly, updateArticleStatus);

module.exports = router;
