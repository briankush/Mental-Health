import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const usersTableBody = document.getElementById("usersTableBody");
  const userSearch = document.getElementById("userSearch");
  const roleFilter = document.getElementById("userRoleFilter");
  const totalUsersKpi = document.getElementById("totalUsersKpi");
  const therapistsKpi = document.getElementById("therapistsKpi");
  const clientsKpi = document.getElementById("clientsKpi");
  const adminsKpi = document.getElementById("adminsKpi");
  const userResultCount = document.getElementById("userResultCount");
  const mobileMenu = document.getElementById("mobileMenu");
  const sidebar = document.getElementById("sidebar");

  let loadedUsers = [];

  if (mobileMenu && sidebar) {
    mobileMenu.addEventListener("click", () => sidebar.classList.toggle("open"));
  }

  function renderUsers(users) {
    if (!usersTableBody) return;

    if (users.length === 0) {
      usersTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">No registered accounts found in database.</td></tr>`;
      if (userResultCount) userResultCount.textContent = "Showing 0 users";
      return;
    }

    usersTableBody.innerHTML = users
      .map((user) => {
        const role = user.role || "user";
        let roleBadgeClass = "role-client";
        if (role === "admin") roleBadgeClass = "role-admin";
        if (role === "therapist") roleBadgeClass = "role-therapist";

        const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A";

        return `
          <tr>
            <td><strong>${escapeHtml(user.name || "User")}</strong></td>
            <td>${escapeHtml(user.email || "")}</td>
            <td>${escapeHtml(user.phone || "")}</td>
            <td><span class="role-badge ${roleBadgeClass}">${role.toUpperCase()}</span></td>
            <td><span class="status status-published"><span class="status-dot"></span>Active</span></td>
            <td>${joinedDate}</td>
            <td><button type="button" class="action delete-user" data-user-id="${user._id}" title="Delete user">Delete</button></td>
          </tr>
        `;
      })
      .join("");

    if (userResultCount) {
      userResultCount.textContent = `Showing ${users.length} user${users.length === 1 ? "" : "s"}`;
    }
  }

  function filterUsers() {
    const search = userSearch?.value.toLowerCase().trim() || "";
    const selectedRole = roleFilter?.value || "";

    const filtered = loadedUsers.filter((u) => {
      const nameMatch = (u.name || "").toLowerCase().includes(search);
      const emailMatch = (u.email || "").toLowerCase().includes(search);
      const matchesSearch = !search || nameMatch || emailMatch;
      const matchesRole = !selectedRole || (u.role || "user") === selectedRole;
      return matchesSearch && matchesRole;
    });

    renderUsers(filtered);
  }

  async function loadUsers() {
    if (!usersTableBody) return;
    try {
      usersTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:15px;">Loading users from database...</td></tr>`;
      const response = await api.authGet("/admin/users");
      loadedUsers = response.data || [];

      if (totalUsersKpi) totalUsersKpi.textContent = loadedUsers.length;
      if (therapistsKpi) therapistsKpi.textContent = loadedUsers.filter((u) => u.role === "therapist").length;
      if (clientsKpi) clientsKpi.textContent = loadedUsers.filter((u) => !u.role || u.role === "user").length;
      if (adminsKpi) adminsKpi.textContent = loadedUsers.filter((u) => u.role === "admin").length;

      renderUsers(loadedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      usersTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red; padding:15px;">Failed to load users: ${error.message}</td></tr>`;
    }
  }

  if (userSearch) userSearch.addEventListener("input", filterUsers);
  if (roleFilter) roleFilter.addEventListener("change", filterUsers);

  usersTableBody?.addEventListener("click", async (event) => {
    const button = event.target.closest(".delete-user");
    if (!button || !window.confirm("Delete this user account?")) return;

    button.disabled = true;
    try {
      await api.authDelete(`/admin/users/${button.dataset.userId}`);
      await loadUsers();
    } catch (error) {
      button.disabled = false;
      window.alert(error.message || "Unable to delete user.");
    }
  });

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  loadUsers();
});
