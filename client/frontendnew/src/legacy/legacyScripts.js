const publicScripts = import("../../js/app.js");
const adminModules = import.meta.glob("../../js/admin-*.js");
const adminIcons = import("../../js/admin-icons.js");

const adminScripts = {
  "index.html": ["../../js/admin-auth.js", "../../js/admin-dashboard.js"],
  "articles.html": ["../../js/admin-auth.js", "../../js/admin-articles.js"],
  "books.html": ["../../js/admin-auth.js", "../../js/admin-books.js"],
  "podcasts.html": ["../../js/admin-auth.js", "../../js/admin-podcasts.js"],
  "users.html": ["../../js/admin-auth.js", "../../js/admin-users.js"],
  "moderation.html": ["../../js/admin-auth.js", "../../js/admin-community.js"],
  "settings.html": ["../../js/admin-auth.js", "../../js/admin-profile.js"],
};

export async function runLegacyScripts(filename, admin = false) {
  if (!admin) {
    await publicScripts;
  } else {
    await Promise.all((adminScripts[filename] || ["../../js/admin-auth.js"]).map((path) => adminModules[path]?.()));
    (await adminIcons).initAdminIcons();
  }

  document.dispatchEvent(new Event("DOMContentLoaded"));
}
