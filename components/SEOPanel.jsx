'use client';
// SEO analyzer untuk editor artikel.
// Props: article (form state) + onApply(patch) opsional untuk tombol "perbaiki otomatis".
import { useEffect, useMemo, useState } from 'react';
import Icon from './Icon.jsx';
import { xSeoIndex, xSeoPage } from '../lib/xapi.js';

const SITE_NAME = 'Xignal';

/* ───────────── util teks ───────────── */
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const strip = (h) => String(h || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ').trim();
const wc = (s) => { const t = norm(s); return t ? t.split(' ').length : 0; };
const slugify = (s) => norm(s).replace(/ /g, '-').slice(0, 80).replace(/-+$/, '');
const countKw = (textN, kwN) => (kwN ? (textN.match(new RegExp(`(?:^| )${kwN}(?= |$)`, 'g')) || []).length : 0);
const hasAll = (textN, kwN) => !!kwN && kwN.split(' ').every((w) => ` ${textN} `.includes(` ${w} `));
const trimTo = (s, n) => {
  s = String(s || '').trim();
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), n * 0.6)).replace(/[\s,;:.\-–—]+$/, '') + '…';
};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const STOP = new Set(('yang dan di ke dari untuk dengan pada ini itu atau adalah akan juga dalam oleh sebagai tidak ada agar bisa dapat para saat jika karena telah sudah lebih saja kita kami anda mereka dia ia nya pun lagi masih sangat harus bagi antara serta hingga sampai ketika bahwa seperti namun tetapi tapi bila apa siapa mana kapan bagaimana mengapa the of a an to in on for and or is are was were be been it this that with as by at from not no your you we our can will have has had').split(' '));
const GENERIC = new Set('cara panduan tips apa lengkap terbaik jenis perbedaan mengapa kenapa memilih pilih memahami mengenal pengertian mana cocok untuk'.split(' '));
const SLUG_STOP = new Set('yang dan di ke dari untuk dengan pada ini itu atau adalah akan the of a an to in on for and or is are'.split(' '));
const TRANSITIONS = ['selain itu', 'namun', 'tetapi', 'tapi', 'oleh karena itu', 'oleh sebab itu', 'karena itu', 'sebab', 'karena', 'sehingga', 'dengan demikian', 'misalnya', 'contohnya', 'sebagai contoh', 'akibatnya', 'selanjutnya', 'kemudian', 'pertama', 'kedua', 'ketiga', 'akhirnya', 'terakhir', 'singkatnya', 'intinya', 'padahal', 'meskipun', 'walaupun', 'sementara itu', 'di sisi lain', 'sedangkan', 'sebaliknya', 'bahkan', 'apalagi', 'lalu', 'setelah itu', 'jadi', 'maka', 'yaitu', 'yakni', 'ketika', 'jika', 'apabila', 'agar', 'supaya', 'serta', 'selama', 'hingga', 'secara umum', 'dengan kata lain', 'pada akhirnya', 'however', 'therefore', 'for example', 'moreover', 'finally'].map(norm);
const POWER = ['panduan', 'lengkap', 'terbaik', 'cara', 'tips', 'rahasia', 'mudah', 'cepat', 'terbukti', 'gratis', 'terbaru', 'wajib', 'checklist', 'vs', 'review', 'perbedaan', 'kenapa', 'mengapa', 'apa itu', 'solusi', 'ultimate', 'langkah'];

/* ───────────── ekstraksi konten ───────────── */
function walkText(v, out) {
  if (v == null) return;
  if (typeof v === 'string') { out.push(v); return; }
  if (Array.isArray(v)) { v.forEach((x) => walkText(x, out)); return; }
  if (typeof v === 'object') { walkText(v.content ?? v.text, out); walkText(v.items, out); }
}

function extract(article) {
  let raw = article.content_blocks;
  if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { raw = null; } }
  const list = raw && Array.isArray(raw.blocks) ? raw.blocks : [];
  const o = { ordered: [], heads: [], images: [], links: [], lists: 0, tables: 0 };
  const links = (html) => { const re = /<a\s[^>]*href=["']([^"']+)["'][^>]*>/gi; let m; while ((m = re.exec(html || ''))) o.links.push(m[1]); };

  for (const b of list) {
    const d = b.data || {};
    switch (b.type) {
      case 'header': { const t = strip(d.text); o.heads.push({ level: Number(d.level) || 2, text: t }); o.ordered.push({ k: 'h', t }); break; }
      case 'paragraph': { links(d.text); const t = strip(d.text); if (t) o.ordered.push({ k: 'p', t }); break; }
      case 'list': case 'checklist': {
        o.lists++; const items = []; walkText(d.items, items);
        items.forEach((i) => { links(i); const t = strip(i); if (t) o.ordered.push({ k: 'li', t }); }); break;
      }
      case 'quote': { const t = strip(`${d.text || ''} ${d.caption || ''}`); if (t) o.ordered.push({ k: 'q', t }); break; }
      case 'table': { o.tables++; const t = []; walkText(d.content, t); const s = strip(t.join(' ')); if (s) o.ordered.push({ k: 'li', t: s }); break; }
      case 'image': o.images.push({ url: d.file?.url || d.url || '', cap: strip(d.caption) }); break;
      case 'code': case 'raw': case 'delimiter': break;
      default: { const t = []; ['text', 'title', 'message', 'caption'].forEach((k) => d[k] && t.push(d[k])); const s = strip(t.join(' ')); if (s) o.ordered.push({ k: 'p', t: s }); }
    }
  }

  // artikel lama (body_html) kalau block kosong
  if (!list.length && article.body_html && typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(`<div>${article.body_html}</div>`, 'text/html');
    doc.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,blockquote,img,a').forEach((el) => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'a') { o.links.push(el.getAttribute('href') || ''); return; }
      if (tag === 'img') { o.images.push({ url: el.getAttribute('src') || '', cap: el.getAttribute('alt') || '' }); return; }
      const t = strip(el.textContent);
      if (!t) return;
      if (/^h\d$/.test(tag)) { o.heads.push({ level: Number(tag[1]), text: t }); o.ordered.push({ k: 'h', t }); }
      else o.ordered.push({ k: tag === 'li' ? 'li' : tag === 'blockquote' ? 'q' : 'p', t });
    });
  }
  return o;
}

function ngrams(text) {
  const toks = norm(text).split(' ').filter(Boolean);
  const maps = [new Map(), new Map(), new Map()];
  for (let n = 1; n <= 3; n++) {
    for (let i = 0; i <= toks.length - n; i++) {
      const g = toks.slice(i, i + n);
      if (STOP.has(g[0]) || STOP.has(g[n - 1])) continue;
      if (n === 1 && (g[0].length < 3 || /^\d+$/.test(g[0]))) continue;
      const k = g.join(' ');
      maps[n - 1].set(k, (maps[n - 1].get(k) || 0) + 1);
    }
  }
  return maps.map((m) => [...m].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 8));
}

/* ───────────── analyzer ───────────── */
function analyze(a, ctx = {}) {
  const ex = extract(a);
  const title = (a.title || '').trim();
  const excerpt = (a.excerpt || '').trim();
  const seoTitle = (a.meta_title || '').trim() || title;
  const metaOwn = (a.meta_description || '').trim();
  const metaDesc = metaOwn || excerpt;
  const slug = (a.slug || '').trim() || slugify(title);
  const slugAuto = !(a.slug || '').trim();
  const kws = String(a.focus_keyword || '').split(',').map((s) => s.trim()).filter(Boolean);
  const kwRaw = kws[0] || '';
  const kw = norm(kwRaw);
  const second = kws.slice(1).map((s) => ({ raw: s, n: norm(s) })).filter((s) => s.n);
  const isNews = (a.article_type || 'news') === 'news';

  const bodyText = ex.ordered.map((x) => x.t).join('. ');
  const bodyN = norm(bodyText);
  const words = wc(bodyText);
  const paras = ex.ordered.filter((x) => x.k === 'p').map((x) => x.t);
  const firstPara = paras[0] || '';
  const lastPara = paras[paras.length - 1] || '';
  const sentences = paras.flatMap((p) => p.replace(/([.!?…]+)\s+/g, '$1\u0001').split('\u0001')).map((s) => s.trim()).filter((s) => wc(s) > 0);
  const sLens = sentences.map(wc);
  const avgSent = sLens.length ? sLens.reduce((x, y) => x + y, 0) / sLens.length : 0;
  const longSent = sLens.filter((n) => n > 25).length;
  const longSentPct = sLens.length ? (longSent / sLens.length) * 100 : 0;
  const trans = sentences.filter((s) => { const n = ` ${norm(s)} `; return TRANSITIONS.some((t) => n.includes(` ${t} `)); }).length;
  const transPct = sentences.length ? (trans / sentences.length) * 100 : 0;
  let sameStart = 0;
  for (let i = 2; i < sentences.length; i++) {
    const f = (s) => norm(s).split(' ')[0];
    if (f(sentences[i]) && f(sentences[i]) === f(sentences[i - 1]) && f(sentences[i]) === f(sentences[i - 2])) sameStart++;
  }
  const longParas = paras.filter((p) => wc(p) > 120).length;
  const maxPara = paras.reduce((m, p) => Math.max(m, wc(p)), 0);

  // jarak antar subjudul
  let run = 0, maxRun = 0;
  ex.ordered.forEach((x) => { if (x.k === 'h') run = 0; else { run += wc(x.t); maxRun = Math.max(maxRun, run); } });

  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isInternal = (h) => /^(\/|#)/.test(h) || (host && h.includes(host));
  const intLinks = ex.links.filter((h) => h && isInternal(h)).length;
  const extLinks = ex.links.filter((h) => h && /^https?:/i.test(h) && !isInternal(h)).length;
  const imgNoCap = ex.images.filter((i) => !i.cap).length;

  const titleN = norm(seoTitle);
  const h1N = norm(title);
  const kwCount = countKw(bodyN, kw);
  const density = words && kw ? ((kwCount * kw.split(' ').length) / words) * 100 : 0;
  const first100 = norm(bodyText.split(/\s+/).slice(0, 100).join(' '));
  const headTexts = ex.heads.filter((h) => h.level >= 2).map((h) => norm(h.text));
  const kwInHead = headTexts.some((h) => countKw(h, kw));
  const kwInHeadAll = headTexts.some((h) => hasAll(h, kw));
  const slugKw = kw.replace(/ /g, '-');
  const slugHasKw = !!kw && (` ${slug.replace(/-/g, ' ')} `).includes(` ${kw} `);
  const slugWordsKw = hasAll(slug.replace(/-/g, ' '), kw);
  const capHasKw = ex.images.some((i) => countKw(norm(i.cap), kw));

  const readMin = Math.max(1, Math.round(words / 200));
  const minWords = isNews ? 300 : 600;

  const checks = [];
  const add = (group, id, weight, status, msg, tip, fix) => checks.push({ group, id, weight, status, msg, tip, fix });
  const KW = (st, id, w, msgOk, msgBad, tip, fix) => add('seo', id, w, kw ? st : 'na', st === 'good' ? msgOk : msgBad, tip, fix);

  /* — SEO dasar — */
  add('seo', 'kw-set', 6, kw ? 'good' : 'bad',
    kw ? `Focus keyword: “${kwRaw}”${second.length ? ` + ${second.length} tambahan` : ''}` : 'Focus keyword belum diisi',
    'Pilih satu frasa utama yang ingin dirangking artikel ini. Tambah keyword pendukung dengan koma, mis. “olt gpon, olt epon”.');
  KW(countKw(titleN, kw) ? 'good' : hasAll(titleN, kw) ? 'warn' : 'bad', 'kw-title', 5,
    'Keyword ada di judul SEO', countKw(titleN, kw) ? '' : hasAll(titleN, kw) ? 'Kata-kata keyword ada di judul SEO tapi tidak berurutan sebagai satu frasa' : 'Keyword tidak ada di judul SEO',
    'Judul SEO adalah sinyal on-page terkuat. Masukkan frasa keyword persis seperti yang diketik orang di Google.');
  if (kw && countKw(titleN, kw)) {
    const pos = titleN.indexOf(kw);
    add('seo', 'kw-title-pos', 1, pos <= Math.max(10, titleN.length * 0.35) ? 'good' : 'warn',
      pos <= Math.max(10, titleN.length * 0.35) ? 'Keyword muncul di awal judul' : 'Keyword muncul jauh di belakang judul',
      'Keyword di paruh awal judul biasanya lebih kuat dan tidak terpotong di hasil pencarian.');
  }
  KW(countKw(h1N, kw) ? 'good' : hasAll(h1N, kw) ? 'warn' : 'bad', 'kw-h1', 2,
    'Keyword ada di judul artikel (H1)', 'Keyword belum ada di judul artikel (H1) yang tampil di halaman', 'Judul yang tampil di halaman juga sebaiknya memuat keyword, selaras dengan judul SEO.');
  KW(countKw(first100, kw) ? 'good' : hasAll(first100, kw) ? 'warn' : 'bad', 'kw-intro', 4,
    'Keyword ada di 100 kata pertama', hasAll(first100, kw) ? 'Kata keyword ada di intro tapi tidak sebagai satu frasa' : 'Keyword belum muncul di paragraf pembuka',
    'Sebut keyword di kalimat-kalimat awal. Ini membantu Google dan pembaca langsung paham topiknya.');
  KW(countKw(norm(metaDesc), kw) ? 'good' : hasAll(norm(metaDesc), kw) ? 'warn' : 'bad', 'kw-meta', 4,
    'Keyword ada di meta description', metaDesc ? 'Keyword tidak ada di meta description' : 'Meta description kosong, keyword belum bisa dicek',
    'Google menebalkan keyword di snippet. Itu menaikkan CTR.',
    !metaOwn && (excerpt || firstPara).length >= 50 ? { label: 'Buat dari intro', patch: { meta_description: trimTo(`${kwRaw} — ${excerpt || firstPara}`, 155) } } : null);
  KW(slugHasKw ? 'good' : slugWordsKw ? 'warn' : 'bad', 'kw-slug', 3,
    'Keyword ada di slug', slugWordsKw ? 'Kata keyword ada di slug tapi tidak berurutan' : 'Keyword tidak ada di slug',
    'Slug pendek yang memuat keyword lebih mudah dibaca dan dibagikan.',
    kw && slugKw.length <= 60 ? { label: 'Pakai keyword jadi slug', patch: { slug: slugKw } } : null);
  KW(kwInHead ? 'good' : kwInHeadAll ? 'warn' : 'bad', 'kw-head', 3,
    'Keyword ada di subjudul (H2/H3)', headTexts.length ? 'Belum ada subjudul yang memuat keyword' : 'Belum ada subjudul sama sekali',
    'Pakai keyword atau variasinya di minimal satu H2/H3.');
  add('seo', 'kw-density', 3, !kw ? 'na' : !kwCount ? 'bad' : density > 3.5 ? 'bad' : density > 2.5 || density < 0.5 ? 'warn' : 'good',
    !kw ? '' : !kwCount ? 'Keyword tidak muncul di isi artikel' : `Kepadatan keyword ${density.toFixed(2)}% (${kwCount}×)${density > 2.5 ? ' — terlalu tinggi' : density < 0.5 ? ' — agak rendah' : ''}`,
    'Target 0,5–2,5%. Di atas 3,5% terbaca sebagai keyword stuffing; pakai sinonim dan variasi.');
  add('seo', 'kw-cap', 1, !kw || !ex.images.length ? 'na' : capHasKw ? 'good' : 'warn',
    capHasKw ? 'Keyword ada di caption/alt gambar' : 'Belum ada caption gambar yang memuat keyword',
    'Caption/alt yang deskriptif membantu Google Images dan aksesibilitas.');
  if (second.length) {
    const found = second.filter((s) => countKw(bodyN, s.n) || hasAll(bodyN, s.n)).length;
    add('seo', 'kw-second', 1, found === second.length ? 'good' : found ? 'warn' : 'bad',
      `Keyword tambahan muncul: ${found}/${second.length}`, 'Sebut tiap keyword pendukung minimal sekali secara natural.');
  }

  const kwOf = (o) => String(o.focus_keyword || '').split(',').map(norm).filter(Boolean);
  const others = ctx.others || [];
  const clash = kw ? others.filter((o) => kwOf(o)[0] === kw) : [];
  const loose = kw ? others.filter((o) => !clash.includes(o) && kwOf(o).includes(kw)) : [];
  if (ctx.loaded) {
    add('seo', 'kw-unique', 3, !kw ? 'na' : clash.length ? 'bad' : loose.length ? 'warn' : 'good',
      clash.length ? `Keyword utama sama dengan artikel lain: “${clash[0].title}”${clash.length > 1 ? ` +${clash.length - 1}` : ''}`
        : loose.length ? `Keyword ini juga jadi keyword tambahan di “${loose[0].title}”` : 'Keyword unik, belum dipakai artikel lain',
      'Dua artikel yang mengincar keyword sama saling bersaing di Google (kanibalisasi). Gabungkan jadi satu artikel yang lebih kuat, atau bedakan keyword utamanya.');
  }

  /* — Judul & meta — */
  const tl = seoTitle.length;
  add('meta', 'title-len', 4, !tl ? 'bad' : tl < 30 ? 'warn' : tl <= 60 ? 'good' : tl <= 70 ? 'warn' : 'bad',
    !tl ? 'Judul SEO kosong' : `Judul SEO ${tl} karakter${tl < 30 ? ' — terlalu pendek' : tl > 60 ? ' — akan terpotong di Google' : ''}`,
    'Target 30–60 karakter (±600 px). Lebih dari itu dipotong dengan “…”.',
    tl > 60 ? { label: 'Persingkat', patch: { meta_title: trimTo(seoTitle, 60) } } : null);
  const ml = metaDesc.length;
  add('meta', 'meta-len', 4, !ml ? 'bad' : ml < 80 ? 'bad' : ml < 120 ? 'warn' : ml <= 160 ? 'good' : ml <= 200 ? 'warn' : 'bad',
    !ml ? 'Meta description kosong' : `Meta description ${ml} karakter${metaOwn ? '' : ' (otomatis dari excerpt)'}${ml < 120 ? ' — terlalu pendek' : ml > 160 ? ' — akan terpotong' : ''}`,
    'Target 120–160 karakter. Tulis ajakan yang jelas: apa yang pembaca dapat dari artikel ini.',
    (!ml || ml > 160) && (excerpt || firstPara).length >= 50 ? { label: 'Buat otomatis', patch: { meta_description: trimTo(excerpt || firstPara, 155) } } : null);
  const hasPower = POWER.some((p) => ` ${titleN} `.includes(` ${p} `)) || /\d/.test(seoTitle);
  add('meta', 'title-power', 1, tl ? (hasPower ? 'good' : 'warn') : 'na',
    hasPower ? 'Judul memuat angka / kata penarik klik' : 'Judul belum memuat angka atau kata penarik klik',
    'Angka, “panduan”, “cara”, “terbaik”, “vs” dan sejenisnya cenderung menaikkan CTR.');

  /* — Konten — */
  add('content', 'words', 5, words >= minWords ? 'good' : words >= minWords / 2 ? 'warn' : 'bad',
    `${words} kata${words >= minWords ? '' : ` — target minimal ${minWords}`}`,
    isNews ? 'Berita pendek boleh ±300 kata. Artikel panduan/teknis sebaiknya 800+.' : 'Artikel evergreen yang bersaing biasanya 800–1.500 kata.');
  add('content', 'heads', 3, words < 200 ? 'na' : !ex.heads.length ? 'bad' : maxRun > 350 ? 'warn' : 'good',
    !ex.heads.length ? 'Belum ada subjudul (H2/H3)' : maxRun > 350 ? `Ada bagian ${maxRun} kata tanpa subjudul` : `${ex.heads.length} subjudul, tersebar baik`,
    'Pecah artikel dengan subjudul tiap ±250–300 kata agar mudah di-scan.');
  add('content', 'images', 2, ex.images.length || a.cover_media_url ? 'good' : 'warn',
    ex.images.length ? `${ex.images.length} gambar di isi artikel` : a.cover_media_url ? 'Hanya cover, belum ada gambar di isi' : 'Belum ada gambar',
    'Sisipkan gambar/diagram pendukung. Artikel bergambar lebih lama dibaca.');
  if (ex.images.length) add('content', 'img-cap', 1, imgNoCap ? 'warn' : 'good',
    imgNoCap ? `${imgNoCap} gambar belum ada caption/alt` : 'Semua gambar punya caption/alt', 'Isi caption di tiap gambar. Caption dipakai juga sebagai teks alternatif.');
  add('content', 'int', 2, words < 200 ? 'na' : intLinks ? 'good' : 'warn',
    intLinks ? `${intLinks} link internal` : 'Belum ada link internal', 'Tautkan ke artikel/produk lain di situs ini, minimal 1–3 link.');
  add('content', 'ext', 1, words < 200 ? 'na' : extLinks ? 'good' : 'warn',
    extLinks ? `${extLinks} link eksternal` : 'Belum ada link eksternal', 'Rujuk 1 sumber tepercaya (standar ITU, vendor, dokumentasi) untuk menambah kredibilitas.');

  if (ctx.loaded && a.id && Number(a.is_published) === 1) {
    const n = (ctx.incoming || []).length;
    add('content', 'incoming', 2, n ? 'good' : 'warn', n ? `${n} artikel lain menautkan ke sini` : 'Belum ada artikel lain yang menautkan ke sini (artikel yatim)',
      'Google lebih mudah menemukan dan menilai penting artikel yang ditautkan dari artikel lain. Buka tab Link untuk saran artikel yang cocok menautkan ke sini.');
  }

  /* — Keterbacaan — */
  add('read', 'sent', 3, !sentences.length ? 'na' : avgSent <= 20 ? 'good' : avgSent <= 25 ? 'warn' : 'bad',
    `Rata-rata ${avgSent.toFixed(1)} kata per kalimat`, 'Target ≤ 20 kata. Pecah kalimat panjang jadi dua.');
  add('read', 'longsent', 2, !sentences.length ? 'na' : longSentPct <= 20 ? 'good' : longSentPct <= 30 ? 'warn' : 'bad',
    `${longSent} kalimat > 25 kata (${longSentPct.toFixed(0)}%)`, 'Usahakan kalimat panjang di bawah 20% dari total.');
  add('read', 'para', 2, !paras.length ? 'na' : maxPara > 200 ? 'bad' : longParas ? 'warn' : 'good',
    !longParas ? `Paragraf terpanjang ${maxPara} kata` : `${longParas} paragraf lebih dari 120 kata (terpanjang ${maxPara})`,
    'Paragraf 40–100 kata paling nyaman dibaca, terutama di HP.');
  add('read', 'trans', 2, sentences.length < 5 ? 'na' : transPct >= 25 ? 'good' : transPct >= 15 ? 'warn' : 'bad',
    `${transPct.toFixed(0)}% kalimat memakai kata transisi`, 'Pakai penghubung seperti “selain itu”, “namun”, “sehingga”, “misalnya” agar alurnya mengalir (target ≥ 25%).');
  add('read', 'same', 1, sentences.length < 5 ? 'na' : sameStart ? 'warn' : 'good',
    sameStart ? `${sameStart}× tiga kalimat berurutan dibuka kata yang sama` : 'Awal kalimat bervariasi', 'Variasikan kata pembuka kalimat.');

  /* — Teknis & struktur — */
  const sl = slug.length;
  const slugWords = slug.split('-').filter(Boolean);
  const slugStop = slugWords.filter((w) => SLUG_STOP.has(w)).length;
  const slugBad = /[A-Z_]/.test(a.slug || '') || slugStop > 1;
  add('tech', 'slug', 2, !sl ? 'bad' : sl > 75 || slugBad ? 'warn' : sl > 60 ? 'warn' : 'good',
    !sl ? 'Slug kosong' : `Slug ${sl} karakter${slugAuto ? ' (otomatis dari judul)' : ''}${sl > 60 ? ' — terlalu panjang' : ''}${slugBad ? ' — mengandung kata sambung/huruf besar' : ''}`,
    'Slug pendek, huruf kecil, pakai tanda hubung, tanpa kata sambung (yang, dan, di…).',
    sl > 60 || slugBad ? { label: 'Rapikan slug', patch: { slug: slugWords.filter((w) => !SLUG_STOP.has(w)).slice(0, 7).join('-') } } : null);
  add('tech', 'cover', 2, a.cover_media_url ? (a.cover_media_type === 'video' ? 'warn' : 'good') : 'bad',
    a.cover_media_url ? (a.cover_media_type === 'video' ? 'Cover berupa video — og:image untuk share sosial butuh gambar' : 'Cover tersedia untuk kartu share (og:image)') : 'Belum ada cover',
    'Cover dipakai di kartu artikel dan pratinjau WhatsApp/Facebook/LinkedIn. Rasio 16:9, min. 1200×630.');
  add('tech', 'excerpt', 1, !excerpt ? 'warn' : excerpt.length < 50 ? 'warn' : 'good',
    !excerpt ? 'Excerpt kosong — kartu artikel tanpa ringkasan' : `Excerpt ${excerpt.length} karakter`, 'Ringkasan 80–200 karakter untuk kartu artikel.',
    !excerpt && firstPara.length >= 50 ? { label: 'Isi dari intro', patch: { excerpt: trimTo(firstPara, 160) } } : null);
  add('tech', 'cat', 1, a.category ? 'good' : 'warn', a.category ? `Kategori: ${a.category}` : 'Belum pilih kategori', 'Kategori dipakai di filter dan breadcrumb.');
  const rm = Number(a.read_minutes) || 0;
  add('tech', 'readmin', 1, words < 50 ? 'na' : Math.abs(rm - readMin) <= 1 ? 'good' : 'warn',
    Math.abs(rm - readMin) <= 1 ? `Waktu baca ${rm} menit sesuai isi` : `Waktu baca diisi ${rm} menit, isi artikel ±${readMin} menit`,
    'Dihitung ±200 kata/menit.', Math.abs(rm - readMin) > 1 ? { label: `Set ${readMin} menit`, patch: { read_minutes: readMin } } : null);

  /* — struktur heading — */
  const outline = [];
  let prev = 1;
  ex.heads.forEach((h) => {
    let warn = '';
    if (!h.text) warn = 'Heading kosong';
    else if (h.level === 1) warn = 'H1 sudah dipakai judul halaman — pakai H2';
    else if (h.level > prev + 1) warn = `Melompat dari H${prev} ke H${h.level}`;
    outline.push({ ...h, warn });
    prev = h.level;
  });
  const outlineWarn = outline.filter((o) => o.warn).length;
  if (ex.heads.length) add('tech', 'outline', 2, outlineWarn ? 'warn' : 'good',
    outlineWarn ? `${outlineWarn} masalah urutan heading` : 'Urutan heading rapi (H2 → H3)', 'Jangan melompat level (H2 langsung ke H4) dan jangan pakai H1 di isi.');

  // saran internal link keluar: artikel lain yang topiknya beririsan dengan isi artikel ini
  const ng = ngrams(bodyText);
  const sig = (x) => norm(x).split(' ').filter((w) => w.length > 3 && !STOP.has(w) && !GENERIC.has(w));
  const mine = new Set([...sig(`${title} ${a.focus_keyword || ''} ${excerpt}`), ...ng[0].map(([w]) => w)]);
  const linkSug = others.filter((o) => o.slug && Number(o.is_published) === 1 && o.slug !== slug).map((o) => {
    const best = (list) => list.reduce((m, ph) => (ph.length >= 4 && ph.length > m.length && countKw(bodyN, ph) ? ph : m), '');
    let anchor = best(String(o.focus_keyword || '').split(',').map(norm).filter(Boolean));
    if (!anchor) {
      const tt = norm(o.title).split(' ');
      const grams = [];
      for (const n of [4, 3, 2]) for (let i = 0; i <= tt.length - n; i++) { const g = tt.slice(i, i + n); if (!STOP.has(g[0]) && !STOP.has(g[n - 1]) && !GENERIC.has(g[0]) && !GENERIC.has(g[n - 1])) grams.push(g.join(' ')); }
      anchor = best(grams);
    }
    const shared = [...new Set(sig(`${o.title} ${o.focus_keyword} ${o.excerpt}`))].filter((w) => mine.has(w));
    const score = shared.length + (anchor ? 3 + anchor.split(' ').length : 0) + (o.category && o.category === a.category ? 1 : 0);
    return { id: o.id, slug: o.slug, title: o.title, anchor, shared: shared.slice(0, 4), score, linked: ex.links.some((h) => h.includes(`/article/${o.slug}`)) };
  }).filter((o) => o.score >= 3 && (o.anchor || o.shared.length >= 2)).sort((x, y) => y.score - x.score).slice(0, 6);

  const live = checks.filter((c) => c.status !== 'na');
  const val = { good: 1, warn: 0.5, bad: 0 };
  const sum = (arr) => { const w = arr.reduce((s, c) => s + c.weight, 0); return w ? Math.round((arr.reduce((s, c) => s + c.weight * val[c.status], 0) / w) * 100) : 0; };
  const groups = ['seo', 'meta', 'content', 'read', 'tech'].map((g) => ({ id: g, score: sum(live.filter((c) => c.group === g)), n: live.filter((c) => c.group === g).length }));

  return {
    checks, live, score: sum(live), groups,
    counts: { bad: live.filter((c) => c.status === 'bad').length, warn: live.filter((c) => c.status === 'warn').length, good: live.filter((c) => c.status === 'good').length },
    stats: { words, sentences: sentences.length, paras: paras.length, heads: ex.heads.length, images: ex.images.length, intLinks, extLinks, readMin, avgSent, longSentPct, transPct, lists: ex.lists },
    kw: { raw: kwRaw, n: kw, count: kwCount, density, second: second.map((s) => ({ ...s, count: countKw(bodyN, s.n), all: hasAll(bodyN, s.n) })),
      place: [
        ['Judul SEO', !!countKw(titleN, kw)], ['Judul H1', !!countKw(h1N, kw)], ['Slug', slugHasKw], ['Meta desc', !!countKw(norm(metaDesc), kw)],
        ['Intro', !!countKw(first100, kw)], ['Subjudul', kwInHead], ['Penutup', !!countKw(norm(lastPara), kw)], ['Caption gambar', capHasKw],
      ] },
    phrases: ng, outline, bodyN, linkSug, incoming: ctx.incoming || [],
    kwClash: [...clash, ...loose].map((o) => ({ title: o.title, same: clash.includes(o) })), serp: { seoTitle, metaDesc, slug, title, excerpt },
  };
}

/* ───────────── UI ───────────── */
const GROUP_LABEL = { seo: 'SEO Dasar', meta: 'Judul & Meta', content: 'Konten', read: 'Keterbacaan', tech: 'Teknis & Struktur' };
const tone = (s) => (s >= 85 ? 'good' : s >= 65 ? 'ok' : s >= 40 ? 'warn' : 'bad');
const grade = (s) => (s >= 85 ? 'Mantap' : s >= 65 ? 'Bagus' : s >= 40 ? 'Lumayan' : 'Perlu dikerjakan');

function Ring({ score }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 80 80" className={`sx-ring t-${tone(score)}`} role="img" aria-label={`Skor SEO ${score} dari 100`}>
      <circle cx="40" cy="40" r={r} className="bg" />
      <circle cx="40" cy="40" r={r} className="fg" strokeDasharray={`${(c * score) / 100} ${c}`} transform="rotate(-90 40 40)" />
      <text x="40" y="45" textAnchor="middle">{score}</text>
    </svg>
  );
}

function Hl({ text, kw }) {
  if (!kw || !text) return text || null;
  const parts = String(text).split(new RegExp(`(${esc(kw)})`, 'gi'));
  return parts.map((p, i) => (p.toLowerCase() === kw.toLowerCase() ? <b key={i}>{p}</b> : <span key={i}>{p}</span>));
}

function Meter({ value, min, max, over, label }) {
  const pct = Math.min(100, (value / over) * 100);
  const st = !value ? 'bad' : value < min ? 'warn' : value <= max ? 'good' : value <= over ? 'warn' : 'bad';
  return (
    <div className="sx-meter">
      <div className="sx-meter-top"><span>{label}</span><b className={`s-${st}`}>{value} / {max}</b></div>
      <div className="sx-bar"><i style={{ width: `${pct}%` }} className={`s-${st}`} /><u style={{ left: `${(min / over) * 100}%`, width: `${((max - min) / over) * 100}%` }} /></div>
    </div>
  );
}

function CheckRow({ c, onApply }) {
  const [open, setOpen] = useState(false);
  const expandable = !!(c.tip || c.fix);
  return (
    <li className={`sx-check s-${c.status}${open ? ' open' : ''}`}>
      <button type="button" className="sx-check-h" onClick={() => expandable && setOpen((o) => !o)} aria-expanded={open}>
        <span className="sx-dot" aria-hidden />
        <span className="sx-msg">{c.msg}</span>
        {expandable && <span className="sx-chev" aria-hidden><Icon name="chevron" size={16} /></span>}
      </button>
      {open && (
        <div className="sx-check-b">
          {c.tip && <p>{c.tip}</p>}
          {c.fix && onApply && <button type="button" className="sx-fix" onClick={() => onApply(c.fix.patch)}>✦ {c.fix.label}</button>}
        </div>
      )}
    </li>
  );
}

const fmt = (n) => (n >= 10000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n)));
const pct = (n) => `${(n * 100).toFixed(1)}%`;
function Delta({ now, prev, invert }) {
  if (!prev) return <small className="sx-dl">baru</small>;
  const d = ((now - prev) / prev) * 100;
  if (!isFinite(d) || Math.abs(d) < 0.5) return <small className="sx-dl">±0%</small>;
  const good = invert ? d < 0 : d > 0;
  return <small className={`sx-dl ${good ? 's-good' : 's-bad'}`}>{d > 0 ? '▲' : '▼'} {Math.abs(d).toFixed(0)}%</small>;
}
function Spark({ series }) {
  const k = series.some((r) => r.clicks) ? 'clicks' : 'impressions';
  if (series.length < 2) return null;
  const max = Math.max(1, ...series.map((r) => r[k]));
  const pts = series.map((r, i) => [(i / (series.length - 1)) * 300, 52 - (r[k] / max) * 46]);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return (
    <svg className="sx-spark" viewBox="0 0 300 58" preserveAspectRatio="none" role="img" aria-label={`Tren ${k === 'clicks' ? 'klik' : 'impresi'} harian`}>
      <polygon points={`0,58 ${line} 300,58`} className="a" /><polyline points={line} className="l" />
    </svg>
  );
}

function Perf({ slug, saved, bodyN, focus, onApply }) {
  const [st, setSt] = useState({ loading: true });
  useEffect(() => {
    if (!saved || !slug) { setSt({ none: true }); return undefined; }
    let off = false;
    setSt({ loading: true });
    xSeoPage(slug).then((d) => !off && setSt({ d })).catch((e) => !off && setSt({ err: e.message }));
    return () => { off = true; };
  }, [slug, saved]);

  if (st.loading) return <p className="sx-empty">Memuat data Search Console…</p>;
  if (st.none) return <p className="sx-empty">Simpan dan publikasikan artikel dulu. Data Google baru ada setelah artikel terindeks dan mendapat tayangan.</p>;
  if (st.err) return <p className="sx-empty">Gagal memuat data: {st.err}</p>;
  const d = st.d;
  if (!d.connected) return <p className="sx-empty">Search Console belum terhubung{d.error ? <> ({d.error})</> : ''}. Isi <b>GOOGLE_CLIENT_EMAIL</b>, <b>GOOGLE_PRIVATE_KEY</b>, dan <b>GSC_SITE_URL</b> di env, lalu tambahkan email service account sebagai pengguna di Search Console.</p>;
  if (d.empty) return <p className="sx-empty">Belum ada data untuk <b>/article/{slug}</b> dalam 28 hari terakhir. Data Search Console tertunda ±2 hari, dan artikel baru butuh waktu untuk terindeks.</p>;

  const have = String(focus || '').split(',').map(norm).filter(Boolean);
  const opp = d.queries.filter((q) => q.position >= 4 && q.position <= 20 && q.impressions >= 5);
  return (
    <>
      <div className="sx-stats">
        <div><b>{fmt(d.totals.clicks)}</b><small>Klik</small><Delta now={d.totals.clicks} prev={d.prev.clicks} /></div>
        <div><b>{fmt(d.totals.impressions)}</b><small>Impresi</small><Delta now={d.totals.impressions} prev={d.prev.impressions} /></div>
        <div><b>{pct(d.totals.ctr)}</b><small>CTR</small><Delta now={d.totals.ctr} prev={d.prev.ctr} /></div>
        <div><b>{d.totals.position.toFixed(1)}</b><small>Posisi rata-rata</small><Delta now={d.totals.position} prev={d.prev.position} invert /></div>
      </div>
      <Spark series={d.series} />
      <p className="sx-hint">28 hari sampai {d.range.endDate}, dibanding 28 hari sebelumnya.</p>
      <h5 className="sx-sub">Query pembawa trafik{opp.length ? ` · ${opp.length} peluang` : ''}</h5>
      {opp.length > 0 && <p className="sx-hint" style={{ marginTop: 0 }}>“Peluang” = posisi 4–20. Dengan sedikit optimasi, query ini bisa naik ke halaman 1.</p>}
      {!d.queries.length ? <p className="sx-empty">Belum ada query yang tercatat.</p> : (
        <ul className="sx-qs">
          {d.queries.map((q) => {
            const inBody = hasAll(bodyN, norm(q.q));
            const used = have.includes(norm(q.q));
            const isOpp = q.position >= 4 && q.position <= 20 && q.impressions >= 5;
            return (
              <li key={q.q} className="sx-q">
                <div className="sx-q-t"><b>{q.q}</b><span>#{q.position.toFixed(1)}</span></div>
                <small>{fmt(q.impressions)} impresi · {fmt(q.clicks)} klik · CTR {pct(q.ctr)}</small>
                <div className="sx-chips">
                  <span className={`sx-chip ${inBody ? 'ok' : 'mid'}`}>{inBody ? '✓ ada di konten' : '≈ belum utuh di konten'}</span>
                  {isOpp && <span className="sx-chip ok">Peluang</span>}
                  {onApply && !used && <button type="button" className="sx-chip add" onClick={() => onApply({ focus_keyword: focus ? `${focus}, ${q.q}` : q.q })}>+ Keyword</button>}
                  {used && <span className="sx-chip no">sudah jadi keyword</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default function SEOPanel({ article = {}, onApply }) {
  const [tab, setTab] = useState('check');
  const [filter, setFilter] = useState('all');
  const [mode, setMode] = useState('mobile');
  const [idx, setIdx] = useState(null);
  const [copied, setCopied] = useState(null);
  useEffect(() => {
    let off = false;
    setIdx(null);
    xSeoIndex(article.id, article.slug).then((d) => !off && setIdx(d)).catch(() => !off && setIdx({ error: true }));
    return () => { off = true; };
  }, [article.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const ctx = useMemo(() => (idx && !idx.error ? { loaded: true, others: idx.others || [], incoming: idx.incoming || [] } : {}), [idx]);
  const copy = async (id, text) => {
    try { await navigator.clipboard.writeText(text); } catch {
      const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch { /* abaikan */ } t.remove();
    }
    setCopied(id); setTimeout(() => setCopied(null), 1600);
  };
  const r = useMemo(() => analyze(article, ctx), [ctx,
    article.title, article.excerpt, article.slug, article.meta_title, article.meta_description, article.focus_keyword,
    article.content_blocks, article.body_html, article.cover_media_url, article.cover_media_type, article.category, article.read_minutes, article.article_type,
  ]);
  const t = tone(r.score);
  const { seoTitle, metaDesc, slug } = r.serp;
  const order = { bad: 0, warn: 1, good: 2 };
  const SITE = typeof window !== 'undefined' ? window.location.hostname : 'situs-anda';
  const url = `https://${SITE} › article › ${slug || 'slug-artikel'}`;

  return (
    <div className="sx" role="region" aria-label="Analisis SEO">
      <header className="sx-head">
        <Ring score={r.score} />
        <div className="sx-head-t">
          <h4>Analisis SEO</h4>
          <p className={`sx-grade t-${t}`}>{grade(r.score)}</p>
          <p className="sx-sum"><span className="s-bad">{r.counts.bad} masalah</span><span className="s-warn">{r.counts.warn} perbaikan</span><span className="s-good">{r.counts.good} lolos</span></p>
        </div>
        <div className="sx-groups">
          {r.groups.filter((g) => g.n).map((g) => (
            <div key={g.id} className="sx-g"><span>{GROUP_LABEL[g.id]}</span><div className="sx-bar sm"><i className={`t-${tone(g.score)}`} style={{ width: `${g.score}%` }} /></div><b>{g.score}</b></div>
          ))}
        </div>
      </header>

      <nav className="sx-tabs" role="tablist">
        {[['check', 'Analisis'], ['preview', 'Pratinjau'], ['kw', 'Kata Kunci'], ['link', 'Link'], ['perf', 'Performa'], ['struct', 'Struktur']].map(([id, l]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{l}</button>
        ))}
      </nav>

      {tab === 'check' && (
        <div className="sx-body">
          <div className="sx-filter">
            {[['all', 'Semua'], ['bad', `Masalah ${r.counts.bad}`], ['warn', `Perbaikan ${r.counts.warn}`], ['good', `Lolos ${r.counts.good}`]].map(([id, l]) => (
              <button key={id} type="button" className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>{l}</button>
            ))}
          </div>
          {['seo', 'meta', 'content', 'read', 'tech'].map((g) => {
            const rows = r.checks.filter((c) => c.group === g && c.status !== 'na' && (filter === 'all' || c.status === filter)).sort((a, b) => order[a.status] - order[b.status]);
            if (!rows.length) return null;
            return (
              <div key={g} className="sx-grp">
                <h5>{GROUP_LABEL[g]}<span>{r.groups.find((x) => x.id === g)?.score}</span></h5>
                <ul>{rows.map((c) => <CheckRow key={c.id} c={c} onApply={onApply} />)}</ul>
              </div>
            );
          })}
          {r.live.length > 0 && !r.checks.some((c) => c.status !== 'na' && (filter === 'all' || c.status === filter)) && <p className="sx-empty">Tidak ada item di kategori ini.</p>}
        </div>
      )}

      {tab === 'preview' && (
        <div className="sx-body">
          <div className="sx-seg"><button type="button" className={mode === 'mobile' ? 'on' : ''} onClick={() => setMode('mobile')}>Mobile</button><button type="button" className={mode === 'desktop' ? 'on' : ''} onClick={() => setMode('desktop')}>Desktop</button></div>
          <div className={`sx-serp ${mode}`}>
            <div className="sx-serp-top"><span className="sx-fav">X</span><div><b>{SITE_NAME}</b><span>{url}</span></div></div>
            <div className="sx-serp-title">{seoTitle ? <Hl text={seoTitle} kw={r.kw.raw} /> : 'Judul SEO akan tampil di sini'}</div>
            <div className="sx-serp-desc">{metaDesc ? <Hl text={metaDesc} kw={r.kw.raw} /> : 'Meta description akan tampil di sini. Tulis satu supaya Google menampilkan ringkasan yang berguna, bukan potongan acak.'}</div>
          </div>
          <Meter label="Judul SEO (karakter)" value={seoTitle.length} min={30} max={60} over={80} />
          <Meter label="Meta description (karakter)" value={metaDesc.length} min={120} max={160} over={200} />
          <h5 className="sx-sub">Kartu share sosial</h5>
          <div className="sx-og">
            <div className="sx-og-img">
              {article.cover_media_url && article.cover_media_type !== 'video' ? <img src={article.cover_media_url} alt="" /> : <span>{article.cover_media_type === 'video' ? 'Cover video — pakai gambar untuk og:image' : 'Belum ada cover'}</span>}
            </div>
            <div className="sx-og-t"><small>{SITE.toUpperCase()}</small><b>{article.title || seoTitle || 'Judul artikel'}</b><span>{metaDesc || 'Deskripsi artikel'}</span></div>
          </div>
        </div>
      )}

      {tab === 'kw' && (
        <div className="sx-body">
          {!r.kw.n ? <p className="sx-empty">Isi <b>Focus keyword</b> di atas untuk melihat penempatan dan kepadatan keyword. Pisahkan dengan koma untuk keyword tambahan. Artikel yang sudah terbit bisa ambil ide keyword dari data Google di tab Performa.</p> : (
            <>
              <div className="sx-tiles">
                <div><small>Keyword utama</small><b>{r.kw.raw}</b></div>
                <div><small>Muncul</small><b>{r.kw.count}×</b></div>
                <div><small>Kepadatan</small><b className={`s-${!r.kw.count ? 'bad' : r.kw.density > 3.5 ? 'bad' : r.kw.density > 2.5 || r.kw.density < 0.5 ? 'warn' : 'good'}`}>{r.kw.density.toFixed(2)}%</b></div>
              </div>
              <div className="sx-bar dens"><i style={{ left: `${Math.min(100, (r.kw.density / 4) * 100)}%` }} /><u style={{ left: '12.5%', width: '50%' }} /></div>
              <p className="sx-hint">Zona hijau 0,5–2,5%.</p>
              <h5 className="sx-sub">Penempatan</h5>
              <div className="sx-chips">{r.kw.place.map(([l, ok]) => <span key={l} className={`sx-chip ${ok ? 'ok' : 'no'}`}>{ok ? '✓' : '✕'} {l}</span>)}</div>
              {r.kw.second.length > 0 && (<>
                <h5 className="sx-sub">Keyword tambahan</h5>
                <div className="sx-chips">{r.kw.second.map((s) => <span key={s.n} className={`sx-chip ${s.count ? 'ok' : s.all ? 'mid' : 'no'}`}>{s.count ? '✓' : s.all ? '≈' : '✕'} {s.raw}{s.count ? ` · ${s.count}×` : ''}</span>)}</div>
              </>)}
            </>
          )}
          <h5 className="sx-sub">Frasa yang paling sering muncul</h5>
          {r.phrases.every((p) => !p.length) ? <p className="sx-empty">Belum cukup teks. Frasa muncul setelah ada kata yang berulang.</p> : (
            <div className="sx-ph">
              {['1 kata', '2 kata', '3 kata'].map((l, i) => r.phrases[i].length > 0 && (
                <div key={l}><small>{l}</small>
                  {r.phrases[i].map(([p, c]) => <div key={p} className="sx-ph-r"><span>{p}</span><i style={{ width: `${(c / r.phrases[i][0][1]) * 100}%` }} /><b>{c}</b></div>)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'link' && (
        <div className="sx-body">
          {!idx ? <p className="sx-empty">Memuat daftar artikel…</p> : idx.error ? <p className="sx-empty">Gagal memuat daftar artikel lain.</p> : (
            <>
              <h5 className="sx-sub first">Link masuk ke artikel ini</h5>
              {!article.id ? <p className="sx-empty">Simpan artikel dulu untuk melihat artikel mana yang menautkan ke sini.</p>
                : r.incoming.length ? <ul className="sx-plain">{r.incoming.map((i) => <li key={i.slug}><b>{i.title}</b><small>/article/{i.slug}</small></li>)}</ul>
                  : <p className="sx-warnbox">Artikel yatim: belum ada artikel lain yang menautkan ke sini. Tambahkan link ke artikel ini dari artikel yang relevan.</p>}
              {r.kwClash.length > 0 && (<>
                <h5 className="sx-sub">Keyword kembar</h5>
                <ul className="sx-plain">{r.kwClash.map((c) => <li key={c.title}><b>{c.title}</b><small>{c.same ? 'Keyword utama sama, saling bersaing di Google' : 'Memakai keyword ini sebagai keyword tambahan'}</small></li>)}</ul>
              </>)}
              <h5 className="sx-sub">Saran link keluar</h5>
              {!r.linkSug.length ? <p className="sx-empty">Belum ada saran. Saran muncul setelah isi artikel punya kata/frasa yang cocok dengan artikel lain yang sudah terbit.</p> : (
                <ul className="sx-links">
                  {r.linkSug.map((x) => (
                    <li key={x.id} className="sx-lk">
                      <div className="sx-lk-t"><b>{x.title}</b><small>/article/{x.slug}</small></div>
                      <div className="sx-chips">
                        {x.anchor && <span className="sx-chip ok">anchor: {x.anchor}</span>}
                        {x.shared.map((w) => <span key={w} className="sx-chip no">{w}</span>)}
                      </div>
                      {x.linked ? <span className="sx-linked">✓ Sudah ditautkan</span>
                        : <button type="button" className="sx-fix" onClick={() => copy(x.id, `/article/${x.slug}`)}>{copied === x.id ? 'Tersalin ✓' : 'Salin link'}</button>}
                    </li>
                  ))}
                </ul>
              )}
              <p className="sx-hint">Cara pakai: di editor, blok teks → pilih kata anchor → Ctrl/⌘ + K → tempel link.</p>
            </>
          )}
        </div>
      )}

      {tab === 'perf' && (
        <div className="sx-body">
          <Perf slug={idx?.self?.slug || article.slug} saved={!!article.id && Number(article.is_published) === 1} bodyN={r.bodyN} focus={article.focus_keyword} onApply={onApply} />
        </div>
      )}

      {tab === 'struct' && (
        <div className="sx-body">
          <div className="sx-stats">
            {[['Kata', r.stats.words], ['Kalimat', r.stats.sentences], ['Paragraf', r.stats.paras], ['Subjudul', r.stats.heads], ['Gambar', r.stats.images], ['Link internal', r.stats.intLinks], ['Link eksternal', r.stats.extLinks], ['Menit baca', r.stats.readMin]].map(([l, v]) => <div key={l}><b>{v}</b><small>{l}</small></div>)}
          </div>
          <h5 className="sx-sub">Keterbacaan</h5>
          <div className="sx-stats three">
            <div><b>{r.stats.avgSent.toFixed(1)}</b><small>kata / kalimat</small></div>
            <div><b>{r.stats.longSentPct.toFixed(0)}%</b><small>kalimat &gt; 25 kata</small></div>
            <div><b>{r.stats.transPct.toFixed(0)}%</b><small>pakai transisi</small></div>
          </div>
          <h5 className="sx-sub">Struktur heading</h5>
          <ol className="sx-outline">
            <li className="l1"><em>H1</em><span>{article.title || 'Judul artikel'}</span></li>
            {r.outline.map((h, i) => (
              <li key={i} className={`l${Math.min(h.level, 4)}${h.warn ? ' warn' : ''}`}><em>H{h.level}</em><span>{h.text || '(kosong)'}</span>{h.warn && <small>{h.warn}</small>}</li>
            ))}
            {!r.outline.length && <li className="none">Belum ada subjudul di isi artikel.</li>}
          </ol>
        </div>
      )}
    </div>
  );
}
