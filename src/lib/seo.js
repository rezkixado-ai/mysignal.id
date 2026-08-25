// Yoast-style SEO analysis: pure functions, no external dependencies.
// Each check returns { id, status: 'good'|'ok'|'bad', label } — traffic-light
// style, same mental model as Yoast's green/orange/red bullets.

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function wordCount(text) {
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (!n) return 0;
  let count = 0, pos = 0;
  while ((pos = h.indexOf(n, pos)) !== -1) { count++; pos += n.length; }
  return count;
}

export function analyzeArticleSEO(article) {
  const {
    title = '', slug = '', excerpt = '', body_html = '',
    meta_title = '', meta_description = '', focus_keyword = '',
    cover_media_url = ''
  } = article;

  const seoTitle = meta_title || title;
  const seoDesc = meta_description || excerpt;
  const bodyText = stripHtml(body_html);
  const words = wordCount(bodyText);
  const kw = focus_keyword.trim();

  const checks = [];

  // --- Focus keyword presence ---
  if (!kw) {
    checks.push({ id: 'kw-set', status: 'bad', label: 'No focus keyword set — pick one phrase this article should rank for.' });
  } else {
    checks.push({ id: 'kw-set', status: 'good', label: `Focus keyword set: "${kw}"` });

    // in title
    checks.push(countOccurrences(seoTitle, kw) > 0
      ? { id: 'kw-title', status: 'good', label: 'Focus keyword appears in the SEO title.' }
      : { id: 'kw-title', status: 'bad', label: 'Focus keyword is missing from the SEO title.' });

    // in slug
    checks.push(slug.toLowerCase().includes(kw.toLowerCase().replace(/\s+/g, '-'))
      ? { id: 'kw-slug', status: 'good', label: 'Focus keyword appears in the URL slug.' }
      : { id: 'kw-slug', status: 'ok', label: 'Focus keyword is not in the URL slug.' });

    // in meta description
    checks.push(countOccurrences(seoDesc, kw) > 0
      ? { id: 'kw-desc', status: 'good', label: 'Focus keyword appears in the meta description.' }
      : { id: 'kw-desc', status: 'bad', label: 'Focus keyword is missing from the meta description.' });

    // in first 100 words
    const first100 = bodyText.split(/\s+/).slice(0, 100).join(' ');
    checks.push(countOccurrences(first100, kw) > 0
      ? { id: 'kw-first', status: 'good', label: 'Focus keyword appears early in the body text.' }
      : { id: 'kw-first', status: 'bad', label: "Focus keyword doesn't appear in the first 100 words." });

    // keyword density
    const kwWordCount = kw.split(/\s+/).length;
    const occurrences = countOccurrences(bodyText, kw);
    const density = words > 0 ? (occurrences * kwWordCount / words) * 100 : 0;
    if (density === 0) {
      checks.push({ id: 'kw-density', status: 'bad', label: "Focus keyword doesn't appear in the body text at all." });
    } else if (density < 0.5) {
      checks.push({ id: 'kw-density', status: 'ok', label: `Keyword density is low (${density.toFixed(1)}%) — consider using it a bit more.` });
    } else if (density <= 2.5) {
      checks.push({ id: 'kw-density', status: 'good', label: `Keyword density is ${density.toFixed(1)}% — good range.` });
    } else {
      checks.push({ id: 'kw-density', status: 'ok', label: `Keyword density is ${density.toFixed(1)}% — may read as keyword-stuffed.` });
    }
  }

  // --- SEO title length ---
  const titleLen = seoTitle.length;
  if (!seoTitle) checks.push({ id: 'title-len', status: 'bad', label: 'No SEO title set.' });
  else if (titleLen < 40) checks.push({ id: 'title-len', status: 'ok', label: `SEO title is short (${titleLen} chars) — 50–60 is ideal.` });
  else if (titleLen <= 60) checks.push({ id: 'title-len', status: 'good', label: `SEO title length is good (${titleLen} chars).` });
  else checks.push({ id: 'title-len', status: 'ok', label: `SEO title may get cut off in Google (${titleLen} chars, 60 max recommended).` });

  // --- Meta description length ---
  const descLen = seoDesc.length;
  if (!seoDesc) checks.push({ id: 'desc-len', status: 'bad', label: 'No meta description set.' });
  else if (descLen < 120) checks.push({ id: 'desc-len', status: 'ok', label: `Meta description is short (${descLen} chars) — 120–160 is ideal.` });
  else if (descLen <= 160) checks.push({ id: 'desc-len', status: 'good', label: `Meta description length is good (${descLen} chars).` });
  else checks.push({ id: 'desc-len', status: 'ok', label: `Meta description may get cut off (${descLen} chars, 160 max recommended).` });

  // --- Content length ---
  if (words < 300) checks.push({ id: 'content-len', status: 'bad', label: `Body is short (${words} words) — aim for 300+ for a real chance to rank.` });
  else if (words < 600) checks.push({ id: 'content-len', status: 'ok', label: `Body is ${words} words — solid, 600+ tends to do better for competitive terms.` });
  else checks.push({ id: 'content-len', status: 'good', label: `Body length is good (${words} words).` });

  // --- Subheadings ---
  const hasSubheading = /<h[23][ >]/i.test(body_html || '');
  checks.push(hasSubheading
    ? { id: 'subhead', status: 'good', label: 'Body uses subheadings (H2/H3) to break up content.' }
    : { id: 'subhead', status: 'ok', label: 'No subheadings found — long articles read better with H2/H3 breaks.' });

  // --- Cover image / alt text ---
  checks.push(cover_media_url
    ? { id: 'cover', status: 'good', label: 'Cover image is set (used as the alt text and OG/social preview image).' }
    : { id: 'cover', status: 'bad', label: 'No cover image set — needed for social share previews and og:image.' });

  // --- Slug readability ---
  if (!slug) checks.push({ id: 'slug', status: 'bad', label: 'No slug set.' });
  else if (slug.length > 75) checks.push({ id: 'slug', status: 'ok', label: 'Slug is quite long — shorter slugs are easier to read and share.' });
  else checks.push({ id: 'slug', status: 'good', label: 'Slug length is good.' });

  // --- Excerpt presence (used as fallback description + card copy) ---
  checks.push(excerpt
    ? { id: 'excerpt', status: 'good', label: 'Excerpt is set (shown on cards and as a description fallback).' }
    : { id: 'excerpt', status: 'ok', label: 'No excerpt set — cards will show no summary text.' });

  const score = Math.round(
    (checks.filter((c) => c.status === 'good').length * 2 + checks.filter((c) => c.status === 'ok').length) /
    (checks.length * 2) * 100
  );

  return { checks, score, seoTitle, seoDesc, words };
}

export function scoreLabel(score) {
  if (score >= 80) return { text: 'Good', color: '#34d399' };
  if (score >= 55) return { text: 'OK', color: '#f5b942' };
  return { text: 'Needs work', color: '#ef4a4a' };
}
