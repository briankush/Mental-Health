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
    const topbar = document.querySelector(".topbar-right");
    if (!topbar) return;
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
