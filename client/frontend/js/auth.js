import { api } from "./api.js";
import { showToast } from "./components/toast.js";

function validateEmail(value) {
  return /\S+@\S+\.\S+/.test(value);
}

/**
 * Stores authentication data in localStorage after a successful login/register.
 */
function storeAuthData(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Returns the currently logged-in user object from localStorage, or null.
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Returns the stored JWT token, or null.
 */
export function getStoredToken() {
  return localStorage.getItem("token");
}

/**
 * Clears auth data from localStorage (used for logout).
 */
export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function initAuthForms() {
  const forms = document.querySelectorAll("[data-auth-form]");
  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector("button[type='submit']");
      const nameInput = form.querySelector("input[name='name'], #name");
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

      try {
        const isRegister = !!nameInput;
        const path = isRegister ? "/auth/register" : "/auth/login";
        const body = {
          email: emailInput.value.trim(),
          password: passwordInput.value,
        };
        if (isRegister) {
          body.name = nameInput.value.trim();
        }

        const result = await api.post(path, body);

        showToast(result.message || (isRegister ? "Account created" : "Login successful"), "success");

        if (isRegister) {
          // After registration, redirect to login page
          window.location.href = "./login.html";
          return;
        }

        // Store token and user from login response
        if (result.token && result.user) {
          storeAuthData(result.token, result.user);
        }

        // Role-based redirect after login
        const role = result.user?.role;
        if (role === "admin") {
          // Redirect to admin dashboard
          window.location.href = "../admin/index.html";
        } else {
          // Redirect to normal user homepage
          window.location.href = "../index.html";
        }
      } catch (error) {
        errorEl.textContent = error.message || "Login failed. Please try again.";
      } finally {
        submit.disabled = false;
        submit.textContent = submit.dataset.defaultLabel || "Submit";
      }
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
