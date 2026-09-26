let toastRoot;

function ensureRoot() {
  if (!toastRoot) {
    toastRoot = document.createElement("div");
    toastRoot.className = "toast-root";
    document.body.appendChild(toastRoot);
  }
}

export function showToast(message, type = "info") {
  ensureRoot();
  const toast = document.createElement("div");
  toast.className = "toast";
  if (type === "error") {
    toast.style.borderLeftColor = "#9a3f3f";
  }
  if (type === "success") {
    toast.style.borderLeftColor = "#2d6a4f";
  }
  toast.textContent = message;
  toastRoot.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}
