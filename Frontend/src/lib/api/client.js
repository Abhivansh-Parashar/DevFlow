const defaultApiBase = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:8081`
  : 'http://localhost:8081';
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || defaultApiBase).replace(/\/$/, '');
const ACCESS_KEY = 'devflow-access-token';
const REFRESH_KEY = 'devflow-refresh-token';
let refreshPromise = null;

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const tokenStore = {
  get access() { return localStorage.getItem(ACCESS_KEY); },
  get refresh() { return localStorage.getItem(REFRESH_KEY); },
  set(tokens) {
    if (tokens?.accessToken) localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    if (tokens?.refreshToken) localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

async function refreshAccessToken() {
  if (!tokenStore.refresh) return false;
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenStore.refresh }),
    })
      .then(async (response) => {
        const data = await parseResponse(response);
        if (!response.ok) throw new ApiError(data?.message || 'Session expired.', response.status, data);
        tokenStore.set(data);
        return true;
      })
      .catch(() => {
        tokenStore.clear();
        return false;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function api(path, options = {}, retry = false) {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (tokenStore.access) headers.set('Authorization', `Bearer ${tokenStore.access}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers, redirect: 'manual' });
  if (response.type === 'opaqueredirect') {
    tokenStore.clear();
    throw new ApiError('Your session has expired. Please sign in again.', 401);
  }
  if (response.status === 401 && !retry && await refreshAccessToken()) {
    return api(path, options, true);
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(data?.message || data?.error || `Request failed (${response.status})`, response.status, data);
  }
  return data;
}

export const apiClient = {
  get: (path) => api(path),
  post: (path, body) => api(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (path, body) => api(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => api(path, { method: 'DELETE' }),
  upload: (path, body) => api(path, { method: 'POST', body }),
};
