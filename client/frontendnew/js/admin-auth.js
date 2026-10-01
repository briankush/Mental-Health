(function protectAdminPage() {
  document.documentElement.style.visibility = "hidden";

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const hasToken = Boolean(localStorage.getItem("token"));
  if (!hasToken || user?.role !== "admin") {
    const destination = hasToken ? "/" : "/login";
    window.location.replace(destination);
    return;
  }

  document.documentElement.style.visibility = "visible";

  document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    const mobileMenu = document.querySelector(".mobile-menu");
    const topbar = document.querySelector(".topbar-right");
    if (!sidebar || !topbar) return;

    const closeMenu = () => sidebar.classList.remove("open");
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "sidebar-close";
    closeButton.setAttribute("aria-label", "Close admin menu");
    closeButton.textContent = "×";
    sidebar.prepend(closeButton);
    closeButton.addEventListener("click", closeMenu);
    sidebar.querySelectorAll(".nav-item").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", (event) => {
      if (window.innerWidth <= 768 && sidebar.classList.contains("open") && !sidebar.contains(event.target) && event.target !== mobileMenu) {
        closeMenu();
      }
    });

    const logout = document.createElement("button");
    logout.type = "button";
    logout.className = "view-site admin-logout";
    logout.textContent = "Log out";
    topbar.appendChild(logout);
    logout.addEventListener("click", async () => {
      logout.disabled = true;
      try {
        await fetch("https://mental-health-pgtw.onrender.com/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.replace("/login");
      }
    });
  });
})();
