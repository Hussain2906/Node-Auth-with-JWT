const BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

async function apiFetch(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    credentials: "include", // 👈 fixed yahi pe rakha, always
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = isJson ? data?.error || JSON.stringify(data) : data;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data;
}

export function apiGet(path) {
  return apiFetch(path, { method: "GET" });
}

export function apiPostForm(path, formData) {
  return apiFetch(path, {
    method: "POST",
    body: formData,
    headers: {}, // formData ke liye browser khud boundary set karega
  });
}

export function apiPostJson(path, body) {
  return apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body || {}),
  });
}

export function apiDelete(path) {
    return apiFetch(path, { method: "DELETE" });
  }
