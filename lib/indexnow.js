// IndexNow: a real, officially-supported instant-notification protocol
// honored by Bing and Yandex (not Google — Google has no equivalent
// automatic push mechanism for ordinary articles as of 2026; see the
// key verification file this key must match: public/<key>.txt).
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '77bfee94fdda4d814a8d7a708ec606d2';
const SITE_URL = 'https://mysignal.id'; // update once the real domain is live

/**
 * Notify IndexNow-participating search engines that one or more URLs changed.
 * Fire-and-forget: never throws, never slows down the caller — a failed ping
 * just means slightly slower discovery, not a broken request.
 */
export function pingIndexNow(paths) {
  const urlList = paths.map((p) => `${SITE_URL}${p}`);
  if (urlList.length === 0) return;

  let host;
  try {
    host = new URL(SITE_URL).host;
  } catch {
    return;
  }

  fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList
    })
  }).catch(() => {
    // best-effort — swallow network errors, this must never break publishing
  });
}
