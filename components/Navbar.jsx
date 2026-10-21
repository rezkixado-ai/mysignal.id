'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './site/Logo.jsx';
import SIcon from './site/SIcon.jsx';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/produk', label: 'Produk' },
  { to: '/artikel', label: 'Artikel' },
  { to: '/event', label: 'Event' },
  { to: '/tentang', label: 'Tentang' }
];

export default function Navbar({ waHref = '#' }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef(null);
  const linksRef = useRef(null);
  const [hover, setHover] = useState(null);   // index menu yang sedang di-hover
  const [ind, setInd] = useState({ x: 0, w: 0, ready: false });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setSearching(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (!open && !searching) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); setSearching(false); } };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, searching]);

  useEffect(() => { if (searching && inputRef.current) inputRef.current.focus(); }, [searching]);

  const isOn = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));
  const activeIdx = LINKS.findIndex((l) => isOn(l.to));
  const target = hover != null ? hover : activeIdx;

  // Garis bawah geser mengikuti menu yang di-hover; saat kursor keluar kembali ke menu aktif.
  useEffect(() => {
    const place = () => {
      const box = linksRef.current;
      const el = box && target >= 0 ? box.querySelectorAll('a')[target] : null;
      if (!el) { setInd((v) => ({ ...v, ready: false })); return; }
      setInd({ x: el.offsetLeft, w: el.offsetWidth, ready: true });
    };
    place();
    window.addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    return () => window.removeEventListener('resize', place);
  }, [target, pathname]);

  return (
    <>
      <header className={`x-nav${scrolled ? ' x-nav-solid' : ''}`}>
        <div className="x-wrap x-nav-in">
          <Logo />
          <nav className="x-nav-links" aria-label="Utama" ref={linksRef} onMouseLeave={() => setHover(null)}>
            {LINKS.map((l, i) => (
              <Link key={l.to} href={l.to} className={`${isOn(l.to) ? 'on' : ''}${hover === i ? ' hov' : ''}`}
                onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>{l.label}</Link>
            ))}
            <span className={`x-nav-ind${ind.ready ? ' ready' : ''}`} aria-hidden="true"
              style={{ width: ind.w, transform: `translateX(${ind.x}px)` }} />
          </nav>
          <div className="x-nav-right">
            <a href={waHref} target="_blank" rel="noreferrer" className="x-btn x-btn-line x-nav-cta">
              <SIcon name="whatsapp" size={16} /> HUBUNGI SALES <SIcon name="arrow" size={14} />
            </a>
            <button type="button" className="x-iconbtn" aria-label="Cari" onClick={() => setSearching((s) => !s)}>
              <SIcon name={searching ? 'close' : 'search'} size={18} />
            </button>
            <button type="button" className="x-iconbtn x-burger" aria-label="Buka menu" aria-expanded={open} onClick={() => setOpen(true)}>
              <SIcon name="menu" size={22} />
            </button>
          </div>
        </div>
        {searching && (
          <form className="x-wrap x-searchbar" action="/artikel" method="get" role="search">
            <SIcon name="search" size={18} />
            <input ref={inputRef} type="search" name="q" placeholder="Cari artikel…" aria-label="Cari artikel" />
            <button type="submit" className="x-btn x-btn-sm">Cari</button>
          </form>
        )}
      </header>

      <div className={`x-scrim${open ? ' on' : ''}`} onClick={() => setOpen(false)} />
      <aside id="x-drawer" className={`x-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="x-drawer-head">
          <Logo />
          <button type="button" className="x-iconbtn" aria-label="Tutup menu" onClick={() => setOpen(false)}><SIcon name="close" size={20} /></button>
        </div>
        <nav aria-label="Mobile">
          {LINKS.map((l) => (
            <Link key={l.to} href={l.to} className={isOn(l.to) ? 'on' : ''} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
              {l.label} <SIcon name="chevronR" size={16} />
            </Link>
          ))}
        </nav>
        <a href={waHref} target="_blank" rel="noreferrer" className="x-btn x-btn-grad x-btn-block" tabIndex={open ? 0 : -1}>
          <SIcon name="whatsapp" size={18} /> HUBUNGI SALES
        </a>
      </aside>
    </>
  );
}
