import { mockNetworkDelay } from "./api.js";
import { articlesMock } from "./mock/articles.js";
import { booksMock } from "./mock/books.js";
import { podcastsMock } from "./mock/podcasts.js";
import { articleCard } from "./components/articleCard.js";
import { bookCard } from "./components/bookCard.js";
import { podcastCard } from "./components/podcastCard.js";
import { loadingMarkup } from "./components/loading.js";

async function loadCollection({ rootSelector, items, renderer, emptyMessage }) {
  const root = document.querySelector(rootSelector);
  if (!root) {
    return;
  }

  root.innerHTML = loadingMarkup("Loading content...");

  try {
    // Mock API call:
    // Replace with backend requests, e.g. GET /api/articles, GET /api/books, GET /api/podcasts.
    await mockNetworkDelay(700);

    if (!items.length) {
      root.innerHTML = `<div class="state">${emptyMessage}</div>`;
      return;
    }

    root.innerHTML = items.map(renderer).join("");
  } catch {
    root.innerHTML = "<div class='state state--error'>We couldn't load this content. Please try again.</div>";
  }
}

export function initDynamicCollections() {
  loadCollection({
    rootSelector: "[data-articles-list]",
    items: articlesMock,
    renderer: articleCard,
    emptyMessage: "Nothing here yet."
  });

  loadCollection({
    rootSelector: "[data-books-list]",
    items: booksMock,
    renderer: bookCard,
    emptyMessage: "No books available yet."
  });

  loadCollection({
    rootSelector: "[data-podcasts-list]",
    items: podcastsMock,
    renderer: podcastCard,
    emptyMessage: "No podcast episodes available yet."
  });
}
