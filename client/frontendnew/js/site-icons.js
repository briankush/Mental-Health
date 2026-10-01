import { createIcons, icons } from "lucide";

function addIcon(element, name) {
  if (element && !element.querySelector("[data-lucide]")) {
    element.insertAdjacentHTML("afterbegin", `<i data-lucide="${name}"></i>`);
  }
}

export function initSiteIcons() {
  addIcon(document.querySelector(".nav-toggle"), "menu");

  document.querySelectorAll("[data-logout]").forEach((element) => addIcon(element, "log-out"));
  document.querySelectorAll(".home-trust__icon").forEach((element, index) => {
    addIcon(element, ["shield-check", "lock-keyhole", "heart-handshake"][index] || "heart-handshake");
  });
  document.querySelectorAll(".home-path__icon").forEach((element, index) => {
    element.textContent = "";
    addIcon(element, ["message-circle", "book-open", "users-round"][index] || "users-round");
  });
  document.querySelectorAll(".home-care__check").forEach((element) => addIcon(element, "check"));

  createIcons({ icons, attrs: { "aria-hidden": "true" } });
}
