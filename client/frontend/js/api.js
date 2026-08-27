export const API_BASE_URL = "http://localhost:3000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  postFormData: async (path, formData) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
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
      throw new Error(msg);
    }
    return response.json();
  },
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" })
};

export async function mockNetworkDelay(ms = 650) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
