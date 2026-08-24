import { initNavbar } from "./components/navbar.js";
import { initFooter } from "./components/footer.js";
import { initAuthForms, initProfileTabs } from "./auth.js";
import { initQuiz } from "./quiz.js";
import { initAiAssistant } from "./ai.js";
import { initChat } from "./chat.js";
import { initPayments } from "./payments.js";
import { initConsultationBooking } from "./consultation.js";
import { initDynamicCollections } from "./page-loaders.js";

function initStaticCards() {
  const now = document.getElementById("year-now");
  if (now) {
    now.textContent = new Date().getFullYear();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const basePath = document.body.dataset.base || "./";
  const page = document.body.dataset.page || "home";

  initNavbar({ basePath, currentPage: page });
  initFooter({ basePath });

  initAuthForms();
  initProfileTabs();
  initQuiz();
  initAiAssistant();
  initChat();
  initPayments();
  initConsultationBooking();
  initDynamicCollections();
  initStaticCards();
});
