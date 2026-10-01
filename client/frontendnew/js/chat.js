import { api } from "./api.js";
import { getStoredToken, getStoredUser } from "./auth.js";
import { showToast } from "./components/toast.js";
import { io } from "socket.io-client";

let socket = null;
let currentRoomId = null;
let typingTimer = null;

function storedRoomKey() {
  return `communityRoomId:${getStoredUser()?.id || "guest"}`;
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderMessages(list, messages) {
  list.replaceChildren();
  if (!messages.length) {
    const empty = document.createElement("p");
    empty.className = "meta";
    empty.dataset.emptyState = "true";
    empty.textContent = "No messages in this room yet.";
    list.appendChild(empty);
    return;
  }

  const currentUser = getStoredUser();
  messages.forEach((message) => {
    const item = document.createElement("article");
    item.className = "chat-msg";
    item.dataset.messageId = String(message.id);
    const username = document.createElement("strong");
    username.textContent = message.username;
    const text = document.createElement("p");
    text.textContent = message.text;
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = formatTime(message.createdAt);
    if (currentUser?.id && String(currentUser.id) === String(message.userId)) {
      item.dataset.ownMessage = "true";
    }
    item.append(username, text, meta);
    list.appendChild(item);
  });
  list.scrollTop = list.scrollHeight;
}

function appendMessage(list, message) {
  if (list.querySelector(`[data-message-id="${String(message.id)}"]`)) return;
  if (list.querySelector("[data-empty-state]")) list.replaceChildren();
  const item = document.createElement("article");
  item.className = "chat-msg";
  item.dataset.messageId = String(message.id);
  const username = document.createElement("strong");
  username.textContent = message.username;
  const text = document.createElement("p");
  text.textContent = message.text;
  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = formatTime(message.createdAt);
  item.append(username, text, meta);
  list.appendChild(item);
  list.scrollTop = list.scrollHeight;
}

async function loadMessages(list, status) {
  try {
    const result = await api.authGet(`/community/messages?roomId=${encodeURIComponent(currentRoomId)}`);
    renderMessages(list, result.messages || []);
    status.textContent = "Live updates are active.";
  } catch (error) {
    status.textContent = error.message || "Unable to load messages.";
    if (!getStoredToken()) window.location.replace("login.html");
  }
}

function disconnectRoom({ clearStoredRoom = true, gate, layout, entry, input, roomName, roomIdDisplay, onlineCount, typingStatus, status }) {
  if (typingTimer) window.clearTimeout(typingTimer);
  if (socket) {
    const activeSocket = socket;
    socket.emit("typing:stop");
    activeSocket.emit("room:leave", () => activeSocket.disconnect());
    socket = null;
  }
  currentRoomId = null;
  if (clearStoredRoom) localStorage.removeItem(storedRoomKey());
  layout.dataset.hidden = "true";
  gate.hidden = false;
  entry.hidden = false;
  input.value = clearStoredRoom ? "" : input.value;
  roomName.textContent = "Join a room to begin";
  roomIdDisplay.textContent = "";
  onlineCount.textContent = "";
  typingStatus.textContent = "";
  status.textContent = clearStoredRoom ? "You left the room." : "";
}

function connectSocket(elements) {
  const { roomName, roomIdDisplay, onlineCount, typingStatus, status, list } = elements;
  status.textContent = "Connecting to live chat...";
  socket = io("https://mental-health-pgtw.onrender.com", {
    transports: ["websocket", "polling"],
    auth: { token: getStoredToken() },
  });
  socket.on("connect", () => {
    socket.emit("room:join", currentRoomId, (result) => {
      if (!result.ok) {
        localStorage.removeItem(storedRoomKey());
        status.textContent = result.message;
        return;
      }
      roomName.textContent = result.room.name;
      roomIdDisplay.textContent = result.room.id;
      status.textContent = "Live updates are active.";
    });
  });
  socket.on("connect_error", (error) => {
    status.textContent = error.message || "Unable to connect to live chat.";
    onlineCount.textContent = "Offline";
  });
  socket.on("message:new", (message) => appendMessage(list, message));
  socket.on("room:presence", ({ count }) => { onlineCount.textContent = `${count} online`; });
  socket.on("typing:start", ({ userId, username }) => {
    if (String(userId) !== String(getStoredUser()?.id)) typingStatus.textContent = `${username} is typing...`;
  });
  socket.on("typing:stop", ({ userId }) => {
    if (String(userId) !== String(getStoredUser()?.id)) typingStatus.textContent = "";
  });
  socket.on("room:ended", () => {
    showToast("This room was ended by an administrator.", "error");
    disconnectRoom({ clearStoredRoom: true, ...elements });
    elements.entryStatus.textContent = "This room has ended.";
  });
}

function attachMessaging(elements) {
  const { form, input, list, status } = elements;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const submit = form.querySelector("button[type='submit']");
    submit.disabled = true;
    try {
      if (!socket?.connected) throw new Error("Live chat is not connected yet.");
      await new Promise((resolve, reject) => {
        socket.emit("message:send", { text }, (result) => result.ok ? resolve() : reject(new Error(result.message)));
      });
      input.value = "";
      socket.emit("typing:stop");
    } catch (error) {
      showToast(error.message || "Unable to send message.", "error");
      status.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });
  input.addEventListener("input", () => {
    if (!socket?.connected) return;
    socket.emit("typing:start");
    window.clearTimeout(typingTimer);
    typingTimer = window.setTimeout(() => socket.emit("typing:stop"), 1200);
  });
}

async function joinRoom(roomId, elements) {
  elements.entryStatus.textContent = "Checking room...";
  try {
    const result = await api.authGet(`/community/rooms/${encodeURIComponent(roomId)}`);
    currentRoomId = result.room.id;
    localStorage.setItem(storedRoomKey(), currentRoomId);
    await loadMessages(elements.list, elements.status);
    elements.layout.dataset.hidden = "false";
    elements.gate.hidden = true;
    elements.entry.hidden = true;
    elements.entryStatus.textContent = "";
    connectSocket(elements);
  } catch (error) {
    localStorage.removeItem(storedRoomKey());
    elements.entryStatus.textContent = error.message || "Room not found.";
  }
}

export function initChat() {
  const root = document.querySelector("[data-chat-root]");
  if (!root) return;
  if (!getStoredToken()) {
    const label = root.hasAttribute("data-direct-discussion") ? "Discussion" : "Chatroom";
    root.innerHTML = `<section class="container editorial-block"><span class="kicker">${label}</span><h1>Sign in to continue.</h1><p>Community discussions and chatrooms are available to logged-in members only.</p><a class="btn" href="login.html">Log in</a></section>`;
    return;
  }
  if (root.hasAttribute("data-direct-discussion")) return;

  const elements = {
    gate: root.querySelector("[data-room-gate]"),
    entry: root.querySelector("[data-room-entry]"),
    input: root.querySelector("[data-room-id-input]"),
    entryStatus: root.querySelector("[data-room-entry-status]"),
    layout: root.querySelector(".chat-layout"),
    list: root.querySelector("[data-chat-messages]"),
    status: root.querySelector("[data-chat-status]"),
    roomName: root.querySelector("[data-room-name]"),
    roomIdDisplay: root.querySelector("[data-room-id-display]"),
    onlineCount: root.querySelector("[data-online-count]"),
    typingStatus: root.querySelector("[data-typing-status]"),
    form: root.querySelector("[data-chat-form]"),
    leave: root.querySelector("[data-leave-room]"),
  };

  elements.entry.addEventListener("submit", (event) => {
    event.preventDefault();
    const roomId = elements.input.value.trim();
    if (roomId) joinRoom(roomId, elements);
  });
  elements.leave.addEventListener("click", () => disconnectRoom({ ...elements }));
  attachMessaging(elements);

  const storedRoomId = localStorage.getItem(storedRoomKey());
  if (storedRoomId) joinRoom(storedRoomId, elements);
}
