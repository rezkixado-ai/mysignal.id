// Client helper untuk endpoint CMS Xignal (/api/x/...). Memakai cookie login yang sama.
async function req(path, options = {}) {
  const res = await fetch(`/api/x/${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}
export const xList = (resource) => req(resource);
export const xCreate = (resource, data) => req(resource, { method: 'POST', body: JSON.stringify(data) });
export const xUpdate = (resource, data) => req(resource, { method: 'PUT', body: JSON.stringify(data) });
export const xDelete = (resource, id) => req(`${resource}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
export const xStats = (days = 28) => req(`stats?days=${days}`);
export const xGetSettings = () => req('settings');
export const xSaveSettings = (values) => req('settings', { method: 'PUT', body: JSON.stringify({ values }) });
export const xArticleSeoGet = (id) => req(`article-seo?id=${encodeURIComponent(id)}`);
export const xArticleSeoSave = (data) => req('article-seo', { method: 'PUT', body: JSON.stringify(data) });
export const xSeoIndex = (id, slug) => req(`seo?scope=index&id=${encodeURIComponent(id || '')}&slug=${encodeURIComponent(slug || '')}`);
export const xSeoPage = (slug) => req(`seo?scope=gsc&slug=${encodeURIComponent(slug || '')}`);
