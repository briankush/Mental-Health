import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const kpiUsers = document.getElementById("dashKpiUsers");
  const kpiBooks = document.getElementById("dashKpiBooks");
  const kpiAudio = document.getElementById("dashKpiAudio");
  const kpiFree = document.getElementById("dashKpiFree");
  const activityBody = document.getElementById("dashActivityBody");
  const mobileMenu = document.getElementById("mobileMenu");
  const sidebar = document.getElementById("sidebar");

  if (mobileMenu && sidebar) {
    mobileMenu.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  try {
    const response = await api.get("/admin/stats");
    const stats = response.stats || {};

    if (kpiUsers) kpiUsers.textContent = stats.totalUsers ?? 0;
    if (kpiBooks) kpiBooks.textContent = stats.totalBooks ?? 0;
    if (kpiAudio) kpiAudio.textContent = stats.totalAudio ?? 0;
    if (kpiFree) kpiFree.textContent = stats.freeBooks ?? 0;

    if (activityBody) {
      activityBody.innerHTML = `
        <tr>
          <td><strong>Book Library Query</strong></td>
          <td>Books</td>
          <td>Real-time</td>
          <td><span class="status status-published"><span class="status-dot"></span>${stats.totalBooks} records active</span></td>
        </tr>
        <tr>
          <td><strong>Audio Episodes Stream</strong></td>
          <td>Podcasts</td>
          <td>Real-time</td>
          <td><span class="status status-published"><span class="status-dot"></span>${stats.totalAudio} records active</span></td>
        </tr>
        <tr>
          <td><strong>Registered Accounts</strong></td>
          <td>Users</td>
          <td>Real-time</td>
          <td><span class="status status-published"><span class="status-dot"></span>${stats.totalUsers} accounts registered</span></td>
        </tr>
      `;
    }
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
  }
});
