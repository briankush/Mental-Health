import { mockNetworkDelay } from "./api.js";

const suggestedReplies = {
  "Help me understand stress": "Stress is a normal body response to pressure. If stress becomes persistent and begins affecting sleep, concentration, or relationships, structured support tools and professional guidance can help.",
  "Find resources about anxiety": "You can start with our Mental Health articles section, then explore the anxiety-focused podcast episodes and beginner training course on emotional regulation.",
  "What training courses are available?": "Current courses include Mental Health Awareness, Understanding Stress, Supporting Someone Who Is Struggling, Emotional Wellbeing, and Healthy Communication.",
  "Show me the latest podcasts": "Visit Podcasts to find new episodes and upcoming discussion sessions. You can also subscribe to weekly highlights in your profile settings."
};

export function initAiAssistant() {
  const form = document.querySelector("[data-ai-form]");
  const input = document.querySelector("[data-ai-input]");
  const log = document.querySelector("[data-ai-log]");
  if (!form || !input || !log) {
    return;
  }

  function addMessage(role, text) {
    const article = document.createElement("article");
    article.className = "ai-message";
    article.dataset.role = role;
    article.textContent = text;
    log.appendChild(article);
    log.scrollTop = log.scrollHeight;
  }

  document.querySelectorAll("[data-ai-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.textContent.trim();
      input.focus();
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      return;
    }

    addMessage("user", text);
    input.value = "";

    addMessage("assistant", "Searching relevant platform resources...");
    await mockNetworkDelay(800);
    log.lastElementChild.remove();

    // API integration point:
    // Replace this local response map with POST /api/assistant/query when backend is ready.
    const response = suggestedReplies[text] || "I can help you explore platform resources. Try asking about stress, anxiety, podcasts, or training.";
    addMessage("assistant", response);
  });
}
