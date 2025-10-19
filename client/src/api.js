export const API = process.env.REACT_APP_API_BASE || '';

export function apiFetch(path, options = {}) {
  return fetch(`${API}${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
}
