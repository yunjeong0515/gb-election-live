const API_BASE_URL = window.__API_BASE_URL ?? "";

class ApiError extends Error {
  constructor(status, body) {
    super(`API Error ${status}: ${body}`);
    this.status = status;
    this.body = body;
  }
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE_URL}/api/game/stats`);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}
