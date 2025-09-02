const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"

async function apiFetch(path, options = {}) {
  const url = `${BASE}${path}`
  const res = await fetch(url, { credentials: "include", ...options })
  const ct = res.headers.get("content-type") || ""
  const isJson = ct.includes("application/json")
  const data = isJson ? await res.json() : await res.text()
  if (!res.ok) {
    const msg = isJson ? (data?.error || JSON.stringify(data)) : data
    throw new Error(msg || `HTTP ${res.status}`)
  }
  return data
}

export function apiGet(path) {
  return apiFetch(path, { method: "GET" })
}

export function apiPostForm(path, formData) {
  return apiFetch(path, { method: "POST", body: formData })
}
export function apiPostJson(path, body) {
    return apiFetch(path, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
  }