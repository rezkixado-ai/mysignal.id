import { useEffect } from 'react';

const SITE_NAME = 'MySignal';
const SITE_URL = 'https://mysignal.id'; // update once the real domain is live

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(data) {
  let el = document.getElementById('page-jsonld');
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'page-jsonld';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Sets document title + meta description/canonical/OG/Twitter tags + an
 * optional JSON-LD block for the current page. Runs on mount and whenever
 * inputs change; each field only touches its own tag so pages that don't
 * pass e.g. jsonLd don't clear one set by another page's leftover state.
 */
export function useSEO({ title, description, path = '', image, type = 'website', jsonLd, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Signals from the Digital World`;
    document.title = fullTitle;

    const canonical = `${SITE_URL}${path}`;
    const ogImage = image || `${SITE_URL}/og-default.jpg`;

    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setLink('canonical', canonical);

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:site_name', SITE_NAME);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', ogImage);

    setJsonLd(jsonLd || null);
  }, [title, description, path, image, type, jsonLd, noindex]);
}

export { SITE_URL, SITE_NAME };
