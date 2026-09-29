const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include", // envía la cookie httpOnly de sesión admin
    headers: options.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listProperties: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/properties${qs ? `?${qs}` : ""}`);
  },
  listAllPropertiesAdmin: () => request("/properties/admin/all"),
  getProperty: (id) => request(`/properties/${id}`),
  createProperty: (data) =>
    request("/properties", { method: "POST", body: JSON.stringify(data) }),
  updateProperty: (id, data) =>
    request(`/properties/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProperty: (id) => request(`/properties/${id}`, { method: "DELETE" }),

  uploadImages: (propertyId, files) => {
    const form = new FormData();
    [...files].forEach((file) => form.append("images", file));
    return request(`/properties/${propertyId}/images`, { method: "POST", body: form });
  },
  deleteImage: (propertyId, imageId) =>
    request(`/properties/${propertyId}/images/${imageId}`, { method: "DELETE" }),

  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
};
