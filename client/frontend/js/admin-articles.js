import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("articleModal");
  const form = document.getElementById("articleForm");
  const tableBody = document.getElementById("articlesTableBody");
  const search = document.getElementById("articleSearch");
  const resultCount = document.getElementById("articleResultCount");
  const publishedCount = document.getElementById("totalPublishedArticles");
  const draftCount = document.getElementById("totalDraftArticles");
  const message = document.getElementById("articleFormMessage");
  const modalTitle = document.getElementById("articleModalTitle");
  const saveButton = document.getElementById("saveArticleBtn");
  let articles = [];
  let editingId = null;

  const field = (id) => document.getElementById(id);
  const escapeHtml = (value) => String(value || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  function openModal(article = null) {
    editingId = article?._id || null;
    modalTitle.textContent = editingId ? "Edit Article" : "Create New Article";
    saveButton.textContent = editingId ? "Save Changes" : "Create Article";
    message.textContent = "";
    form.reset();
    if (article) {
      field("articleTitle").value = article.title || "";
      field("articleAuthor").value = article.author || "";
      field("articleCategory").value = article.category || "";
      field("articleReadingTime").value = article.readingTime || 5;
      field("articleImage").value = article.image || "";
      field("articleExcerpt").value = article.excerpt || "";
      field("articleContent").value = article.content || "";
      field("articleStatus").value = article.status || "draft";
    }
    modal.classList.add("open");
  }

  function closeModal() {
    modal.classList.remove("open");
    editingId = null;
  }

  function render(items) {
    tableBody.innerHTML = items.length ? items.map((article) => `
      <tr>
        <td><strong>${escapeHtml(article.title)}</strong></td>
        <td>${escapeHtml(article.author)}</td>
        <td>${escapeHtml(article.category)}</td>
        <td><span class="status status-${article.status}"><span class="status-dot"></span>${article.status}</span></td>
        <td>${article.readingTime || 5} min</td>
        <td><button type="button" class="secondary-button edit-article" data-id="${article._id}">Edit</button></td>
      </tr>
    `).join("") : `<tr><td colspan="6">No articles found.</td></tr>`;
    resultCount.textContent = `Showing ${items.length} article${items.length === 1 ? "" : "s"}`;
    tableBody.querySelectorAll(".edit-article").forEach((button) => {
      button.addEventListener("click", () => openModal(articles.find((article) => article._id === button.dataset.id)));
    });
    tableBody.querySelectorAll(".article-status").forEach((select) => {
      select.addEventListener("change", async () => {
        await api.authPatch(`/articles/${select.dataset.id}/status`, { status: select.value });
        loadArticles();
      });
    });
  }

  function filter() {
    const query = search.value.toLowerCase().trim();
    render(articles.filter((article) => `${article.title} ${article.author}`.toLowerCase().includes(query)));
  }

  async function loadArticles() {
    try {
      const response = await api.authGet("/articles");
      articles = response.data || [];
      publishedCount.textContent = articles.filter((article) => article.status === "published").length;
      draftCount.textContent = articles.filter((article) => article.status === "draft").length;
      filter();
    } catch (error) {
      tableBody.innerHTML = `<tr><td colspan="6">Unable to load articles: ${escapeHtml(error.message)}</td></tr>`;
    }
  }

  document.getElementById("createArticleBtn")?.addEventListener("click", () => openModal());
  document.getElementById("closeArticleModal")?.addEventListener("click", closeModal);
  document.getElementById("cancelArticleModal")?.addEventListener("click", closeModal);
  search?.addEventListener("input", filter);
  modal?.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = {
      title: field("articleTitle").value.trim(),
      author: field("articleAuthor").value.trim(),
      category: field("articleCategory").value.trim(),
      readingTime: field("articleReadingTime").value,
      image: field("articleImage").value.trim(),
      excerpt: field("articleExcerpt").value.trim(),
      content: field("articleContent").value.trim(),
      status: field("articleStatus").value,
    };
    try {
      saveButton.disabled = true;
      const response = editingId
        ? await api.authPatch(`/articles/${editingId}`, data)
        : await api.authPost("/articles", data);
      message.textContent = response.message || "Article saved";
      closeModal();
      await loadArticles();
    } catch (error) {
      message.textContent = error.message || "Unable to save article";
    } finally {
      saveButton.disabled = false;
    }
  });

  loadArticles();
});
