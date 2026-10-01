const API_BASE_URL = import.meta.env.VITE_API_URL || "https://mental-health-pgtw.onrender.com/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}, authenticated = false) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authenticated ? authHeaders() : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (authenticated && response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    throw new Error(body.message || "Request failed");
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  authGet: (path) => request(path, {}, true),
  authPost: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }, true),
  authPatch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }, true),
};
