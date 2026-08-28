import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addEpisodeBtn");
  const modal = document.getElementById("addPodcastModal");
  const closeBtn = document.getElementById("closePodcastModalBtn");
  const cancelBtn = document.getElementById("cancelPodcastBtn");
  const form = document.getElementById("addPodcastForm");
  const formMessage = document.getElementById("podcastFormMessage");
  const submitBtn = document.getElementById("podcastSubmitBtn");
  const podcastsTableBody = document.getElementById("podcastsTableBody");

  // Load Audios from Database
  async function loadAudios() {
    if (!podcastsTableBody) return;
    try {
      podcastsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px;">Loading episodes...</td></tr>`;
      const response = await api.get("/audio");
      const audios = response.data || [];

      if (audios.length === 0) {
        podcastsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px;">No audio episodes found. Click "Add Episode" to upload one!</td></tr>`;
        return;
      }

      podcastsTableBody.innerHTML = audios
        .map((audio) => {
          const durationText = audio.duration
            ? `${Math.round(audio.duration)} sec`
            : "Audio file";
          return `
            <tr>
              <td><strong>${escapeHtml(audio.title)}</strong></td>
              <td>${escapeHtml(audio.host || "MindfulPath Team")}</td>
              <td>${durationText}</td>
              <td><span class="status status--ok">Published</span></td>
              <td>
                ${
                  audio.audioUrl
                    ? `<audio controls src="${audio.audioUrl}" style="height:36px; max-width:220px;"></audio>`
                    : `<span>No Audio URL</span>`
                }
              </td>
            </tr>
          `;
        })
        .join("");
    } catch (error) {
      console.error("Error loading audio files:", error);
      podcastsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red; padding:15px;">Failed to load audios: ${error.message}</td></tr>`;
    }
  }

  // Modal open/close controls
  function openModal() {
    if (modal) {
      modal.style.display = "flex";
      formMessage.textContent = "";
      if (form) form.reset();
    }
  }

  function closeModal() {
    if (modal) {
      modal.style.display = "none";
    }
  }

  if (addBtn) addBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Handle Form Submission for Audio Upload to Cloudinary & DB
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const podcastTitleInput = document.getElementById("podcastTitle");
      const podcastHostInput = document.getElementById("podcastHost");
      const audioFileInput = document.getElementById("audioFile");

      const title = podcastTitleInput.value.trim();
      const host = podcastHostInput.value.trim() || "MindfulPath Team";
      const audioFile = audioFileInput.files[0];

      if (!audioFile) {
        formMessage.style.color = "red";
        formMessage.textContent = "Please select an audio file to upload.";
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Uploading...";
        formMessage.style.color = "#007bff";
        formMessage.textContent = "Uploading...";

        // Call frontend API helper that hits POST /api/audio/upload with title and host
        const result = await api.uploadAudio(audioFile, title, host);

        formMessage.style.color = "green";
        formMessage.textContent = result.message || "Audio uploaded successfully!";

        setTimeout(() => {
          closeModal();
          form.reset();
          loadAudios(); // Reload list from MongoDB
        }, 1200);
      } catch (error) {
        console.error("Audio Upload error:", error);
        formMessage.style.color = "red";
        formMessage.textContent = error.message || "Failed to upload audio file.";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Upload Audio";
      }
    });
  }

  // Escape HTML helper
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Initial fetch of audios
  loadAudios();
});
