const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

function toBackendUrl(url) {
  // If it's already absolute, keep it
  if (/^https?:\/\//i.test(url)) return url;
  // Otherwise prefix backend
  return `${BACKEND}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function makeFetcher(token) {
  return async (url) => {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      console.error("FETCH ERROR", res.status, url, msg);
      throw new Error(msg || `Request failed: ${res.status}`);
    }
    return res.json();
  };
}


export async function apiRequest({ url, method, token, body }) {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem("pp_token");
    localStorage.removeItem("pp_profile");
    window.location.href = "/login";
    return;
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Request failed: ${res.status}`);
  }

  return res.json();
}
