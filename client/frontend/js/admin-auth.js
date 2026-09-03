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
    const destination = hasToken ? "../index.html" : "../pages/login.html";
    window.location.replace(destination);
    return;
  }

  document.documentElement.style.visibility = "visible";
})();
