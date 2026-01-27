export async function api(path, { method = 'GET', headers = {}, body } = {}) {
  const token = localStorage.getItem('sp_token');
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const h = { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...headers };
  if (token) h['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { method, headers: h, body: body ? (isForm ? body : JSON.stringify(body)) : undefined });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data;
}

export function requireAuth() {
  return !!localStorage.getItem('sp_token');
}

export function logout() {
  localStorage.removeItem('sp_token');
}
