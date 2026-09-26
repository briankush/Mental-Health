import { api } from "./api.js";
import { articlesMock } from "./mock/articles.js";
import { articleCard } from "./components/articleCard.js";
import { bookCard } from "./components/bookCard.js";
import { podcastCard } from "./components/podcastCard.js";
import { loadingMarkup } from "./components/loading.js";

async function loadCollection({ rootSelector, path, items = [], renderer, emptyMessage, mapItem = (item) => item }) {
  const root = document.querySelector(rootSelector);
  if (!root) {
    return;
  }

  root.innerHTML = loadingMarkup("Loading content...");

  try {
    const loadedItems = path ? (await api.get(path)).data || [] : items;
    const mappedItems = loadedItems.map(mapItem);

    if (!mappedItems.length) {
      root.innerHTML = `<div class="state">${emptyMessage}</div>`;
      return;
    }

    root.innerHTML = mappedItems.map(renderer).join("");
  } catch {
    root.innerHTML = "<div class='state state--error'>We couldn't load this content. Please try again.</div>";
  }
}

export function initDynamicCollections() {
  loadCollection({
    rootSelector: "[data-articles-list]",
    path: "/articles/published",
    renderer: articleCard,
    emptyMessage: "Nothing here yet.",
    mapItem: (article) => ({
      id: article.id,
      title: article.title,
      category: article.category,
      excerpt: article.excerpt || article.content?.slice(0, 160) || "",
      readingTime: article.readingTime || 5,
      date: article.date ? new Date(article.date).toLocaleDateString() : "Recently",
      image: article.image || "../assets/images/article-1.svg",
      imageAlt: `${article.title} illustration`,
      href: `article.html?id=${article.id}`
    })
  });

  loadCollection({
    rootSelector: "[data-books-list]",
    path: "/books/published",
    renderer: bookCard,
    emptyMessage: "No books available yet.",
    mapItem: (book) => ({
      id: book._id,
      title: book.bookName,
      author: book.author,
      category: book.category,
      description: book.description || "",
      isFree: Number(book.price) === 0,
      price: book.price,
      cover: book.coverUrl || "../assets/images/book-1.svg",
      coverAlt: `${book.bookName} cover`,
      previewHref: book.pdfUrl || "../pages/ebook.html"
    })
  });

  loadCollection({
    rootSelector: "[data-podcasts-list]",
    path: "/audio/published",
    renderer: podcastCard,
    emptyMessage: "No podcast episodes available yet.",
    mapItem: (audio) => ({
      id: audio._id,
      title: audio.title,
      description: "Listen to the latest MindfulPath conversation.",
      host: audio.host,
      duration: audio.duration ? `${Math.round(audio.duration / 60)} min` : "Audio episode",
      image: audio.coverUrl || "../assets/images/podcast-1.svg",
      imageAlt: `${audio.title} podcast cover`,
      href: audio.audioUrl || "../pages/podcast.html"
    })
  });
}
