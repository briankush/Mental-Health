import { api } from "../api.js";

function navLink(base, href, label, page, currentPage) {
  const active = page === currentPage ? "is-active" : "";
  return `<a class="nav-link ${active}" href="${base}${href}">${label}</a>`;
}

export function initNavbar({ mountId = "site-header", basePath = "./", currentPage = "home" } = {}) {
  const mount = document.getElementById(mountId);
  if (!mount) {
    return;
  }

  const profileLink = localStorage.getItem("token")
    ? navLink(basePath, "pages/profile.html", "Profile", "profile", currentPage)
    : "";
  const signupLink = localStorage.getItem("token")
    ? ""
    : `<a class="btn" href="${basePath}pages/register.html">Sign up</a>`;
  const logoutButton = localStorage.getItem("token")
    ? `<button class="btn btn--secondary" type="button" data-logout>Log out</button>`
    : "";

  mount.innerHTML = `
    <header class="navbar-wrap" id="top-nav">
      <div class="container navbar">
        <a class="logo" href="${basePath}index.html" aria-label="MindfulPath home">
          <span class="logo__mark" aria-hidden="true">MP</span>
          <span>MindfulPath</span>
        </a>

        <nav class="nav-links" aria-label="Main navigation">
          <div class="nav-item">${navLink(basePath, "index.html", "Home", "home", currentPage)}</div>
          <div class="nav-item">${navLink(basePath, "pages/about.html", "About", "about", currentPage)}</div>
          <div class="nav-item">
            <a class="nav-link">Resources</a>
            <div class="dropdown" role="menu">
              <a href="${basePath}pages/articles.html">Articles</a>
              <a href="${basePath}pages/articles.html#mental-health">Mental Health</a>
              <a href="${basePath}pages/articles.html#social-issues">Social Issues</a>
              <a href="${basePath}pages/quizzes.html">Quizzes</a>
            </div>
          </div>
          <div class="nav-item">
            <a class="nav-link">Library</a>
            <div class="dropdown" role="menu">
              <a href="${basePath}pages/ebooks.html">E-books</a>
              <a href="${basePath}pages/book-club.html">Book Club</a>
              <a href="${basePath}pages/book-club.html#weekly-chapter">Weekly Chapter</a>
            </div>
          </div>
          <div class="nav-item">${navLink(basePath, "pages/podcasts.html", "Podcasts", "podcasts", currentPage)}</div>
          <div class="nav-item">${navLink(basePath, "pages/training.html", "Training", "training", currentPage)}</div>
          <div class="nav-item">
            <a class="nav-link">Community</a>
            <div class="dropdown" role="menu">
              <a href="${basePath}pages/community.html">Discussion</a>
              <a href="${basePath}pages/community.html">Chatroom</a>
              <a href="${basePath}pages/quizzes.html#qa">Q&A</a>
            </div>
          </div>
          <div class="nav-item">${navLink(basePath, "pages/consultation.html", "Consultation", "consultation", currentPage)}</div>
          <div class="nav-item">${profileLink}</div>
        </nav>

        <div style="display:flex; gap: 0.5rem; align-items:center;">
          ${logoutButton || `<a class="btn btn--secondary" href="${basePath}pages/login.html">Login</a>`}
          ${signupLink}
          <button class="nav-toggle" aria-expanded="false" aria-controls="mobile-panel" aria-label="Open menu">
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      </div>
      <div class="mobile-panel" id="mobile-panel">
        <div class="container mobile-nav">
          <a href="${basePath}index.html">Home</a>
          <a href="${basePath}pages/about.html">About</a>
          <details>
            <summary>Resources</summary>
            <a href="${basePath}pages/articles.html">Articles</a>
            <a href="${basePath}pages/quizzes.html">Quizzes</a>
          </details>
          <details>
            <summary>Library</summary>
            <a href="${basePath}pages/ebooks.html">E-books</a>
            <a href="${basePath}pages/book-club.html">Book Club</a>
          </details>
          <a href="${basePath}pages/podcasts.html">Podcasts</a>
          <a href="${basePath}pages/training.html">Training</a>
          <a href="${basePath}pages/community.html">Community</a>
          <a href="${basePath}pages/consultation.html">Consultation</a>
          ${profileLink ? `<a href="${basePath}pages/profile.html">Profile</a>` : ""}
          ${logoutButton ? `<button type="button" data-logout>Log out</button>` : `<a href="${basePath}pages/login.html">Login</a>`}
          ${signupLink ? `<a href="${basePath}pages/register.html">Sign up</a>` : ""}
        </div>
      </div>
    </header>
  `;

  const navbarWrap = mount.querySelector(".navbar-wrap");
  const toggle = mount.querySelector(".nav-toggle");
  const panel = mount.querySelector("#mobile-panel");

  mount.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await api.authLogout();
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = `${basePath}index.html`;
      }
    });
  });

  toggle?.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  window.addEventListener("scroll", () => {
    navbarWrap.classList.toggle("is-scrolled", window.scrollY > 14);
  });
}
