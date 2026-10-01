export const API_BASE_URL = "https://mental-health-pgtw.onrender.com/api";

/**
 * Returns Authorization header object if a token exists in localStorage.
 */
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}, withAuth = false) {
  const headers = {
    "Content-Type": "application/json",
    ...(withAuth ? getAuthHeaders() : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const json = await response.json();
      message = json.message || message;
    } catch {
      message = await response.text() || message;
    }
    if (withAuth && response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  // Public (no auth header)
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),

  // Authenticated (sends token header)
  authGet: (path) => request(path, {}, true),
  authPost: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }, true),
  authPatch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }, true),
  authDelete: (path) => request(path, { method: "DELETE" }, true),
  authLogout: () => request("/auth/logout", { method: "POST" }, true),

  // FormData upload (authenticated)
  postFormData: async (path, formData, withAuth = false, method = "POST") => {
    const headers = withAuth ? getAuthHeaders() : {};
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: formData,
    });
    if (!response.ok) {
      const resText = await response.text();
      let msg = "Upload failed";
      try {
        const json = JSON.parse(resText);
        msg = json.message || msg;
      } catch (e) {
        msg = resText || msg;
      }
      if (withAuth && response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      throw new Error(msg);
    }
    return response.json();
  },

  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }, true),
  delete: (path) => request(path, { method: "DELETE" }, true),

  uploadAudio: async (audioFile, title, host, coverFile) => {
    const formData = new FormData();
    formData.append("audio", audioFile);
    if (title) formData.append("title", title);
    if (host) formData.append("host", host);
    if (coverFile) formData.append("cover", coverFile);
    return api.postFormData("/audio/upload", formData, true);
  },
};

export async function mockNetworkDelay(ms = 650) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
