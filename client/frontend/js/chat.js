import { showToast } from "./components/toast.js";

let socket = null;

function attachRoomSwitching() {
  const rooms = document.querySelectorAll("[data-room]");
  const roomName = document.querySelector("[data-room-name]");
  rooms.forEach((room) => {
    room.addEventListener("click", () => {
      rooms.forEach((r) => r.classList.remove("is-active"));
      room.classList.add("is-active");
      roomName.textContent = room.dataset.room;
      // WebSocket integration point:
      // if (socket) socket.emit("room:join", room.dataset.roomId);
    });
  });
}

function attachMessaging() {
  const form = document.querySelector("[data-chat-form]");
  const input = document.querySelector("[data-chat-input]");
  const list = document.querySelector("[data-chat-messages]");
  if (!form || !input || !list) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      return;
    }

    const item = document.createElement("article");
    item.className = "chat-msg";
    item.innerHTML = `<strong>You</strong><p>${text}</p><p class="meta">just now · <button type="button" data-report>Report</button></p>`;
    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
    input.value = "";

    // WebSocket integration point:
    // socket.emit("message:send", { text, roomId: currentRoomId });
  });

  list.addEventListener("click", (event) => {
    const reportButton = event.target.closest("[data-report]");
    if (reportButton) {
      showToast("Message report queued. Backend moderation API integration required.", "success");
    }
  });
}

export function initChat() {
  if (!document.querySelector("[data-chat-root]")) {
    return;
  }

  // Socket.IO client integration placeholder:
  // socket = io("http://localhost:3000", { transports: ["websocket"] });
  // socket.on("connect", () => console.log("connected"));
  attachRoomSwitching();
  attachMessaging();
}
