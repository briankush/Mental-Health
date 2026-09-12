const Article = require("../models/article");

const publicArticle = (article) => ({
  id: article._id,
  title: article.title,
  author: article.author,
  category: article.category,
  excerpt: article.excerpt,
  content: article.content,
  image: article.image,
  readingTime: article.readingTime,
  status: article.status,
  date: article.updatedAt,
});

const getArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: articles });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching articles" });
  }
};

const getPublishedArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: "published" }).sort({ createdAt: -1 });
    return res.json({ success: true, data: articles.map(publicArticle) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching published articles" });
  }
};

const createArticle = async (req, res) => {
  try {
    const { title, author, category, excerpt, content, image, readingTime, status } = req.body || {};
    if (!title || !category || !content) {
      return res.status(400).json({ success: false, message: "Title, category, and content are required" });
    }
    const article = await Article.create({
      title,
      author: author || "MindfulPath Editorial",
      category,
      excerpt: excerpt || "",
      content,
      image: image || "",
      readingTime: Number(readingTime) || 5,
      status: status || "published",
    });
    return res.status(201).json({ success: true, message: "Article created successfully", data: article });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while creating article" });
  }
};

const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, category, excerpt, content, image, readingTime, status } = req.body || {};
    if (!title || !category || !content) {
      return res.status(400).json({ success: false, message: "Title, category, and content are required" });
    }
    if (status && !["draft", "published"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'draft' or 'published'" });
    }
    const article = await Article.findByIdAndUpdate(
      id,
      {
        title,
        author: author || "MindfulPath Editorial",
        category,
        excerpt: excerpt || "",
        content,
        image: image || "",
        readingTime: Number(readingTime) || 5,
        ...(status ? { status } : {}),
      },
      { new: true, runValidators: true }
    );
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    return res.json({ success: true, message: "Article updated successfully", data: article });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while updating article" });
  }
};

const updateArticleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'draft' or 'published'" });
    }
    const article = await Article.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    return res.json({ success: true, data: article });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while updating article status" });
  }
};

module.exports = { getArticles, getPublishedArticles, createArticle, updateArticle, updateArticleStatus };
