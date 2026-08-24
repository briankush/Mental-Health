import { mockNetworkDelay } from "./api.js";
import { showToast } from "./components/toast.js";

function validateEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}

export function initAuthForms() {
  const forms = document.querySelectorAll("[data-auth-form]");
  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector("button[type='submit']");
      const emailInput = form.querySelector("input[type='email']");
      const passwordInput = form.querySelector("input[type='password']");
      const errorEl = form.querySelector("[data-form-error]");
      errorEl.textContent = "";

      let hasError = false;
      if (emailInput && !validateEmail(emailInput.value.trim())) {
        emailInput.setAttribute("aria-invalid", "true");
        hasError = true;
      } else {
        emailInput?.setAttribute("aria-invalid", "false");
      }

      if (passwordInput && passwordInput.value.trim().length < 8) {
        passwordInput.setAttribute("aria-invalid", "true");
        hasError = true;
      } else {
        passwordInput?.setAttribute("aria-invalid", "false");
      }

      if (hasError) {
        errorEl.textContent = "Please check your email and password fields.";
        return;
      }

      submit.disabled = true;
      submit.textContent = "Please wait...";
      await mockNetworkDelay();
      submit.disabled = false;
      submit.textContent = submit.dataset.defaultLabel || "Submit";
      showToast("Backend integration required: connect this form to /api/auth endpoints.", "success");
    });
  });
}

export function initProfileTabs() {
  const navButtons = document.querySelectorAll("[data-profile-nav]");
  const panels = document.querySelectorAll("[data-profile-panel]");
  if (!navButtons.length || !panels.length) {
    return;
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.profileNav;
      navButtons.forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");
      panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.profilePanel === target);
      });
    });
  });
}
