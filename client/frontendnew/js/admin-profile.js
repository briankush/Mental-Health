import { api } from "./api.js";

const form = document.querySelector("[data-admin-profile-form]");
const message = document.querySelector("[data-admin-profile-message]");

function storeUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

if (form) {
  const nameInput = form.elements.namedItem("name");
  const emailInput = form.elements.namedItem("email");
  const phoneInput = form.elements.namedItem("phone");

  api.authGet("/auth/profile").then(({ user }) => {
    nameInput.value = user.name || "";
    emailInput.value = user.email || "";
    phoneInput.value = user.phone || "";
    storeUser(user);
  }).catch((error) => {
    message.textContent = error.message || "Unable to load your profile.";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector("button[type='submit']");
    submit.disabled = true;
    try {
      const result = await api.authPatch("/auth/profile", {
        name: nameInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
      });
      storeUser(result.user);
      message.textContent = result.message;
    } catch (error) {
      message.textContent = error.message || "Unable to update your profile.";
    } finally {
      submit.disabled = false;
    }
  });
}