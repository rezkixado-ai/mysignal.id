'use client';

import { useEffect, useRef, useState } from 'react';

const slug = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'bagian';

// Daftar isi otomatis: membaca heading (h2/h3) di dalam artikel, memberi id,
// lalu klik poin = scroll halus ke bagian itu. Poin aktif ikut berubah saat scroll.
export default function ArticleToc({ target = '.x-prose' }) {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const lock = useRef(0);

  useEffect(() => {
    const root = document.querySelector(target);
    if (!root) return undefined;
    const used = new Set();
    const list = [...root.querySelectorAll('h2, h3')].map((el) => {
      let id = el.id || slug(el.textContent);
      let n = 2; const base = id;
      while (used.has(id)) { id = `${base}-${n}`; n += 1; }
      used.add(id); el.id = id;
      return { id, text: el.textContent.trim(), level: el.tagName === 'H3' ? 3 : 2, el };
    }).filter((i) => i.text);
    setItems(list.map(({ el, ...i }) => i));
    if (!list.length) return undefined;
    setActive(list[0].id);

    const onScroll = () => {
      if (Date.now() < lock.current) return;
      const line = window.innerHeight * 0.28;
      let cur = list[0].id;
      for (const i of list) { if (i.el.getBoundingClientRect().top - line <= 0) cur = i.id; else break; }
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // buka langsung ke bagian bila URL punya #hash
    if (window.location.hash) {
      const el = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (el) setTimeout(() => el.scrollIntoView({ block: 'start' }), 60);
    }
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [target]);

  if (items.length < 2) return null;

  const go = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    lock.current = Date.now() + 1500;
    setActive(id);
    try { window.history.replaceState(null, '', `#${id}`); } catch { /* abaikan */ }
    // tutup daftar dulu (di HP), baru scroll — kalau tidak, tinggi halaman berubah di tengah scroll dan posisinya meleset
    setOpen(false);
    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), open ? 80 : 0);
  };

  return (
    <nav className={`x-toc${open ? ' open' : ''}`} aria-label="Daftar isi">
      <button type="button" className="x-toc-h" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <strong>Daftar Isi</strong>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      <ol className="x-toc-list">
        {items.map((i) => (
          <li key={i.id} className={`${i.level === 3 ? 'sub ' : ''}${active === i.id ? 'on' : ''}`}>
            <a href={`#${i.id}`} onClick={(e) => go(e, i.id)}>{i.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
