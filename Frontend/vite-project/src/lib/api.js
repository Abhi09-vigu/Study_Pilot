function stripTrailingSlashes(value) {
  return value.replace(/\/+$/, '');
}

function stripApiSuffix(value) {
  return value.endsWith('/api') ? value.slice(0, -4) : value;
}

function ensureLeadingSlash(value) {
  return value.startsWith('/') ? value : `/${value}`;
}

function isAbsoluteUrl(value) {
  return /^https?:\/\//i.test(value);
}

const RAW_BASE = (import.meta?.env?.VITE_API_BASE_URL || '').trim();
const NORMALIZED_BASE = RAW_BASE ? stripTrailingSlashes(RAW_BASE) : '';
const ORIGIN_BASE = NORMALIZED_BASE ? stripApiSuffix(NORMALIZED_BASE) : '';
const API_BASE = NORMALIZED_BASE
  ? (NORMALIZED_BASE.endsWith('/api') ? NORMALIZED_BASE : `${NORMALIZED_BASE}/api`)
  : '/api';

export function getApiBase() {
  return API_BASE;
}

// Build a URL for assets stored as relative paths (e.g. `/uploads/...`).
// This ensures uploads work in both:
// - local dev (Vite proxy via `/api`)
// - production (VITE_API_BASE_URL pointing to the backend)
export function apiAssetUrl(assetPath) {
  if (!assetPath) return '';
  if (isAbsoluteUrl(assetPath)) return assetPath;

  // Stored avatar URLs are typically `/uploads/...`.
  if (assetPath.startsWith('/uploads')) return `${API_BASE}${assetPath}`;

  // If backend already returned an `/api/...` path, keep it but attach origin when needed.
  if (assetPath.startsWith('/api/')) return ORIGIN_BASE ? `${ORIGIN_BASE}${assetPath}` : assetPath;

  return ORIGIN_BASE ? `${ORIGIN_BASE}${ensureLeadingSlash(assetPath)}` : ensureLeadingSlash(assetPath);
}

export async function api(path, { method = 'GET', headers = {}, body } = {}) {
  const token = localStorage.getItem('sp_token');
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const h = { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...headers };
  if (token) h['Authorization'] = `Bearer ${token}`;

  const url = `${API_BASE}${ensureLeadingSlash(path)}`;
  const res = await fetch(url, {
    method,
    headers: h,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

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
