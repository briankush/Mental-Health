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
  const searchInput = document.getElementById("audioSearch");
  const statusFilter = document.getElementById("audioStatusFilter");
  const totalAudioKpi = document.getElementById("totalAudioKpi");
  const audioResultCount = document.getElementById("audioResultCount");
  const mobileMenu = document.getElementById("mobileMenu");
  const sidebar = document.getElementById("sidebar");

  let loadedAudios = [];

  // Mobile sidebar toggle
  if (mobileMenu && sidebar) {
    mobileMenu.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // Helper to format audio duration nicely
  function formatDuration(seconds) {
    if (!seconds || isNaN(seconds) || seconds <= 0) return "Audio file";
    const secNum = parseInt(seconds, 10);
    const mins = Math.floor(secNum / 60);
    const secs = secNum % 60;
    if (mins > 0) {
      return `${mins} min${mins > 1 ? "s" : ""} ${secs} sec`;
    }
    return `${secs} sec`;
  }

  // Render audio files into table
  function renderAudios(audios) {
    if (!podcastsTableBody) return;

    if (audios.length === 0) {
      podcastsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">No audio episodes found. Click "Upload Audio Episode" to add one!</td></tr>`;
      if (audioResultCount) audioResultCount.textContent = "Showing 0 episodes";
      return;
    }

    podcastsTableBody.innerHTML = audios
      .map((audio) => {
        const durationText = formatDuration(audio.duration);
        return `
          <tr>
            <td>
              <div style="font-weight:600; color:#18221e;">${escapeHtml(audio.title)}</div>
              <div style="font-size:10px; color:#8b958f; margin-top:2px;">Format: ${(audio.format || "audio").toUpperCase()}</div>
            </td>
            <td>${escapeHtml(audio.host || "MindfulPath Team")}</td>
            <td>${durationText}</td>
            <td>
              <span class="status status-published">
                <span class="status-dot"></span>
                Published
              </span>
            </td>
            <td>
              ${
                audio.audioUrl
                  ? `<audio controls src="${audio.audioUrl}" style="height:36px; max-width:240px; vertical-align:middle;"></audio>`
                  : `<span style="color:#888;">No Audio Link</span>`
              }
            </td>
          </tr>
        `;
      })
      .join("");

    if (audioResultCount) {
      audioResultCount.textContent = `Showing ${audios.length} episode${audios.length === 1 ? "" : "s"}`;
    }
  }

  // Filter audios by search query & status dropdown
  function filterAudios() {
    const search = searchInput?.value.toLowerCase().trim() || "";
    const status = statusFilter?.value || "";

    const filtered = loadedAudios.filter((audio) => {
      const titleMatch = (audio.title || "").toLowerCase().includes(search);
      const hostMatch = (audio.host || "").toLowerCase().includes(search);
      const searchMatch = !search || titleMatch || hostMatch;
      const statusMatch = !status || status === "published";

      return searchMatch && statusMatch;
    });

    renderAudios(filtered);
  }

  // Load Audios from Database (GET /api/audio)
  async function loadAudios() {
    if (!podcastsTableBody) return;
    try {
      podcastsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:15px;">Loading episodes...</td></tr>`;
      const response = await api.get("/audio");
      loadedAudios = response.data || [];

      if (totalAudioKpi) {
        totalAudioKpi.textContent = loadedAudios.length;
      }

      renderAudios(loadedAudios);
    } catch (error) {
      console.error("Error loading audio files:", error);
      podcastsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red; padding:15px;">Failed to load audios: ${error.message}</td></tr>`;
    }
  }

  // Modal open/close controls
  function openModal() {
    if (modal) {
      modal.classList.add("open");
      if (formMessage) formMessage.textContent = "";
      if (form) form.reset();
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove("open");
    }
  }

  if (addBtn) addBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Attach search & filter listeners
  if (searchInput) searchInput.addEventListener("input", filterAudios);
  if (statusFilter) statusFilter.addEventListener("change", filterAudios);

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

      if (!title) {
        formMessage.style.color = "red";
        formMessage.textContent = "Please enter an episode title.";
        return;
      }

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

        // Call frontend API helper POST /api/audio/upload
        const result = await api.uploadAudio(audioFile, title, host);

        formMessage.style.color = "green";
        formMessage.textContent = result.message || "Audio uploaded successfully!";

        setTimeout(() => {
          closeModal();
          form.reset();
          loadAudios(); // Reload dynamic list from MongoDB
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
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Initial fetch of audios
  loadAudios();
});
