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
      const isRegister = !!nameInput;
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

      if (isRegister && nameInput && nameInput.value.trim().length < 2) {
        nameInput.setAttribute("aria-invalid", "true");
        hasError = true;
      } else {
        nameInput?.setAttribute("aria-invalid", "false");
      }

      if (hasError) {
        errorEl.textContent = isRegister && nameInput?.value.trim().length < 2
          ? "Please enter your full name and check your email and password fields."
          : "Please check your email and password fields.";
        return;
      }

      submit.disabled = true;
      submit.textContent = "Please wait...";

      try {
        const path = isRegister ? "/auth/register" : "/auth/login";
        const body = {
          email: emailInput.value.trim(),
          password: passwordInput.value,
        };
        if (isRegister) {
          body.name = nameInput.value.trim();
        }

        const result = await api.post(path, body);

        if (isRegister) {
          if (result.token && result.user) {
            storeAuthData(result.token, result.user);
          }
          showToast(result.message || "Account created", "success");
          window.location.href = "../index.html";
          return;
        }

        showToast(result.message || "Login successful", "success");

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

export function initProfileForm() {
  if (!getStoredToken()) {
    window.location.replace("./login.html");
    return;
  }

    let form = document.querySelector("[data-profile-form]");
    const settingsPanel = document.querySelector("[data-profile-panel='settings']");
    if (!form && settingsPanel) {
      settingsPanel.insertAdjacentHTML("afterbegin", `<form class="form-panel" data-profile-form><div class="form-row"><label for="profileName">Full name</label><input id="profileName" name="name" type="text" required></div><div class="form-row"><label for="profileEmail">Email</label><input id="profileEmail" name="email" type="email" required></div><div class="form-row"><label for="profilePhone">Phone</label><input id="profilePhone" name="phone" type="tel" placeholder="07xx xxx xxx"></div><p class="form-help" data-profile-message aria-live="polite"></p><button class="btn" type="submit">Save profile</button></form>`);
      form = settingsPanel.querySelector("[data-profile-form]");
    }
    if (!form) return;

    const nameInput = form.querySelector("[name='name']");
    const emailInput = form.querySelector("[name='email']");
    const phoneInput = form.querySelector("[name='phone']");
    const message = form.querySelector("[data-profile-message]");
    const storedUser = getStoredUser();
    if (nameInput) nameInput.value = storedUser?.name || "";
    if (emailInput) emailInput.value = storedUser?.email || "";
    if (phoneInput) phoneInput.value = storedUser?.phone || "";

    api.authGet("/auth/profile").then((result) => {
      if (emailInput) emailInput.value = result.user.email || "";
      if (phoneInput) phoneInput.value = result.user.phone || "";
      storeAuthData(getStoredToken(), result.user);
    }).catch(() => {
      if (message) message.textContent = "Unable to load your profile.";
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const result = await api.authPatch("/auth/profile", {
          name: nameInput?.value || "",
          email: emailInput.value,
          phone: phoneInput?.value || "",
        });
        storeAuthData(getStoredToken(), result.user);
        if (message) message.textContent = result.message;
      } catch (error) {
        if (message) message.textContent = error.message || "Unable to update your profile.";
      }
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
