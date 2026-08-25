const BASE = '/api';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

// ---- auth ----
export const login = (password) => req('/auth-login', { method: 'POST', body: JSON.stringify({ password }) });
export const logout = () => req('/auth-logout', { method: 'POST' });
export const checkAuth = () => req('/auth-check');

// ---- hero slides ----
export const getHeroSlides = (all = false) => req(`/hero-slides${all ? '?all=1' : ''}`);
export const createHeroSlide = (data) => req('/hero-slides', { method: 'POST', body: JSON.stringify(data) });
export const updateHeroSlide = (data) => req('/hero-slides', { method: 'PUT', body: JSON.stringify(data) });
export const deleteHeroSlide = (id) => req(`/hero-slides?id=${encodeURIComponent(id)}`, { method: 'DELETE' });

// ---- articles ----
export const getArticles = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req(`/articles${qs ? `?${qs}` : ''}`);
};
export const getArticleBySlug = (slug) => req(`/articles?slug=${encodeURIComponent(slug)}`);
export const createArticle = (data) => req('/articles', { method: 'POST', body: JSON.stringify(data) });
export const updateArticle = (data) => req('/articles', { method: 'PUT', body: JSON.stringify(data) });
export const deleteArticle = (id) => req(`/articles?id=${encodeURIComponent(id)}`, { method: 'DELETE' });

// ---- gallery ----
export const getGallery = (all = false) => req(`/gallery${all ? '?all=1' : ''}`);
export const createGalleryItem = (data) => req('/gallery', { method: 'POST', body: JSON.stringify(data) });
export const updateGalleryItem = (data) => req('/gallery', { method: 'PUT', body: JSON.stringify(data) });
export const deleteGalleryItem = (id) => req(`/gallery?id=${encodeURIComponent(id)}`, { method: 'DELETE' });

// ---- media upload (still a real Netlify Edge Function, not a Next.js route -
// see netlify/edge-functions/media-upload.js. Kept separate deliberately:
// Next.js "edge runtime" on Netlify runs through the regular Node function
// infra under the hood, not true streaming Edge Functions, so it would
// reintroduce the 6MB video-upload limit this was built to avoid.) ----
export async function uploadMedia(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  onProgress?.(0.15);
  const res = await fetch(`${BASE}/media-upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  onProgress?.(1);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Upload failed (${res.status})`);
  }
  return res.json();
}
