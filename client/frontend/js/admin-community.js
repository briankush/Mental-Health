document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-admin-room-form]");
  const status = document.querySelector("[data-admin-room-status]");
  const roomsBody = document.querySelector("[data-admin-rooms]");
  const refreshRooms = document.querySelector("[data-refresh-rooms]");
  const createdRoom = document.querySelector("[data-created-room]");
  const createdRoomName = document.querySelector("[data-created-room-name]");
  const createdRoomId = document.querySelector("[data-created-room-id]");
  const copyRoomId = document.querySelector("[data-copy-room-id]");
  const modal = document.querySelector("[data-end-room-modal]");
  const cancelEnd = document.querySelector("[data-cancel-end]");
  const confirmEnd = document.querySelector("[data-confirm-end]");
  const popup = document.querySelector("[data-admin-popup]");
  let roomToEnd = null;
  let popupTimer = null;
  if (!form || !status || !roomsBody) return;

  const showPopup = (message, isError = false) => {
    popup.textContent = message;
    popup.style.borderLeftColor = isError ? "#b42318" : "#2d6a4f";
    window.clearTimeout(popupTimer);
    popupTimer = window.setTimeout(() => {
      popup.textContent = "";
    }, 3600);
  };

  const closeModal = () => {
    modal.hidden = true;
    roomToEnd = null;
  };

  const request = async (path, options = {}) => {
    const response = await fetch(`http://localhost:3000/api${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}`, ...(options.headers || {}) },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Request failed");
    return result;
  };

  const loadRooms = async () => {
    try {
      const result = await request("/admin/community/rooms");
      roomsBody.replaceChildren();
      if (!result.rooms.length) {
        roomsBody.innerHTML = '<tr><td colspan="4" class="table-empty-state">No active rooms.</td></tr>';
        return;
      }
      result.rooms.forEach((room) => {
        const row = document.createElement("tr");
        const name = document.createElement("td");
        name.textContent = room.name;
        const id = document.createElement("td");
        id.textContent = room.id;
        const created = document.createElement("td");
        created.textContent = new Date(room.createdAt).toLocaleString();
        const action = document.createElement("td");
        const end = document.createElement("button");
        end.type = "button";
        end.className = "action";
        end.dataset.endRoom = room.id;
        end.textContent = "End room";
        action.appendChild(end);
        row.append(name, id, created, action);
        roomsBody.appendChild(row);
      });
    } catch (error) {
      roomsBody.innerHTML = `<tr><td colspan="4" class="table-empty-state">${error.message}</td></tr>`;
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector("button[type='submit']");
    submit.disabled = true;
    status.textContent = "Creating room...";
    try {
      const response = await fetch("http://localhost:3000/api/admin/community/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: form.elements.name.value.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to create room");
      status.textContent = `Room created. Share this room ID: ${result.room.id}`;
      createdRoomName.textContent = result.room.name;
      createdRoomId.textContent = result.room.id;
      createdRoom.hidden = false;
      showPopup("Room created. The room ID is ready to share.");
      form.reset();
      loadRooms();
    } catch (error) {
      status.textContent = error.message || "Unable to create room";
    } finally {
      submit.disabled = false;
    }
  });

  refreshRooms.addEventListener("click", loadRooms);
  roomsBody.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-end-room]");
    if (!button) return;
    roomToEnd = button.dataset.endRoom;
    modal.hidden = false;
    confirmEnd.focus();
  });

  cancelEnd.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  confirmEnd.addEventListener("click", async () => {
    if (!roomToEnd) return;
    confirmEnd.disabled = true;
    try {
      await request(`/admin/community/rooms/${roomToEnd}`, { method: "DELETE" });
      closeModal();
      showPopup("Room ended. Its ID and message history were deleted.");
      await loadRooms();
    } catch (error) {
      showPopup(error.message || "Unable to end room.", true);
    } finally {
      confirmEnd.disabled = false;
    }
  });

  copyRoomId.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(createdRoomId.textContent);
      showPopup("Room ID copied to the clipboard.");
    } catch {
      showPopup("Copy failed. Select the room ID manually.", true);
    }
  });

  loadRooms();
});