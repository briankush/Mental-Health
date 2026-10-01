import { createIcons, icons } from "lucide";

const iconNames = {
  Dashboard: "layout-dashboard",
  "Analytics & Reports": "chart-no-axes-combined",
  "Books & PDFs": "book-open",
  "Podcasts & Audio": "headphones",
  "Articles & Guides": "file-text",
  "Self-Assessments": "clipboard-check",
  "Book Club": "book-marked",
  "Users & Roles": "users",
  Appointments: "calendar-days",
  "Payments & Revenue": "credit-card",
  Moderation: "shield-check",
  "Training & Courses": "graduation-cap",
  Advertisements: "megaphone",
  Settings: "settings",
};

export function initAdminIcons() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    const label = item.textContent.replace(/\s+/g, " ").trim();
    const iconName = iconNames[label];
    const icon = item.querySelector(".nav-icon");
    if (icon && iconName) icon.dataset.lucide = iconName;
  });

  document.querySelectorAll(".view-site").forEach((item) => {
    if (!item.querySelector("[data-lucide]")) item.insertAdjacentHTML("afterbegin", '<i data-lucide="external-link"></i>');
  });
  document.querySelectorAll(".notification").forEach((item) => {
    if (!item.querySelector("[data-lucide]")) item.insertAdjacentHTML("afterbegin", '<i data-lucide="bell"></i>');
  });
  document.querySelectorAll(".mobile-menu").forEach((item) => {
    if (!item.querySelector("[data-lucide]")) item.insertAdjacentHTML("afterbegin", '<i data-lucide="menu"></i>');
  });

  createIcons({ icons, attrs: { "aria-hidden": "true" } });
}
