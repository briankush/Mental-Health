import { api } from "./api.js";
import { getStoredToken, getStoredUser } from "./auth.js";
import { showToast } from "./components/toast.js";

const POLL_INTERVAL_MS = 3000;
let currentRoomId = "general";

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderMessages(list, messages) {
  list.replaceChildren();
  if (!messages.length) {
    const empty = document.createElement("p");
    empty.className = "meta";
    empty.textContent = "No messages in this room yet.";
    list.appendChild(empty);
    return;
  }

  const currentUser = getStoredUser();
  messages.forEach((message) => {
    const item = document.createElement("article");
    item.className = "chat-msg";
    const username = document.createElement("strong");
    username.textContent = message.username;
    const text = document.createElement("p");
    text.textContent = message.text;
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `${formatTime(message.createdAt)} · `;
    const report = document.createElement("button");
    report.type = "button";
    report.dataset.report = "true";
    report.textContent = "Report";
    meta.appendChild(report);
    if (currentUser?.id && String(currentUser.id) === String(message.userId)) {
      item.dataset.ownMessage = "true";
    }
    item.append(username, text, meta);
    list.appendChild(item);
  });
  list.scrollTop = list.scrollHeight;
}

async function loadMessages(list, status) {
  try {
    const result = await api.authGet(`/community/messages?roomId=${encodeURIComponent(currentRoomId)}`);
    renderMessages(list, result.messages || []);
    status.textContent = "Messages update automatically.";
  } catch (error) {
    status.textContent = error.message || "Unable to load messages.";
    if (!getStoredToken()) {
      window.location.replace("login.html");
    }
  }
}

function attachRoomSwitching(list, status) {
  const rooms = document.querySelectorAll("[data-room]");
  const roomName = document.querySelector("[data-room-name]");
  rooms.forEach((room) => {
    room.addEventListener("click", () => {
      rooms.forEach((item) => item.classList.remove("is-active"));
      room.classList.add("is-active");
      currentRoomId = room.dataset.roomId;
      roomName.textContent = room.dataset.room;
      loadMessages(list, status);
    });
  });
}

function attachMessaging(list, status) {
  const form = document.querySelector("[data-chat-form]");
  const input = document.querySelector("[data-chat-input]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const submit = form.querySelector("button[type='submit']");
    submit.disabled = true;
    try {
      await api.authPost("/community/messages", { roomId: currentRoomId, text });
      input.value = "";
      await loadMessages(list, status);
    } catch (error) {
      showToast(error.message || "Unable to send message.", "error");
    } finally {
      submit.disabled = false;
    }
  });

  list.addEventListener("click", (event) => {
    if (event.target.closest("[data-report]")) {
      showToast("Message report queued for moderation.", "success");
    }
  });
}

export function initChat() {
  const root = document.querySelector("[data-chat-root]");
  if (!root) return;
  if (!getStoredToken()) {
    root.innerHTML = `<section class="container editorial-block"><span class="kicker">Community</span><h1>Sign in to join the conversation.</h1><p>Community rooms and messages are available to logged-in members only.</p><a class="btn" href="login.html">Log in</a></section>`;
    return;
  }

  const list = root.querySelector("[data-chat-messages]");
  const status = root.querySelector("[data-chat-status]");
  attachRoomSwitching(list, status);
  attachMessaging(list, status);
  loadMessages(list, status);
  window.setInterval(() => loadMessages(list, status), POLL_INTERVAL_MS);
}
