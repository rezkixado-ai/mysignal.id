'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Xi:gnal' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Contact Us' }
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isActive = (to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

  return (
    <>
      <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap nav-inner">
          <Link href="/" className="brand" onClick={() => setOpen(false)}>
            <img src="/logo.png" alt="MySignal" style={{ height: 28, width: 'auto', display: 'block' }} />
          </Link>

          <nav className="nav-links">
            {LINKS.map((l) => (
              <Link key={l.to} href={l.to} className={isActive(l.to) ? 'active' : ''}>{l.label}</Link>
            ))}
          </nav>

          <div className="nav-cta">
            <Link href="/contact" className="btn btn-ghost">Contact Us</Link>
            <button
              className="burger"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobileMenu"
              onClick={() => setOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </button>
          </div>
        </div>
      </header>

      <div className={`scrim${open ? ' show' : ''}`} onClick={() => setOpen(false)} />

      <aside id="mobileMenu" className={`mobile-menu${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="mobile-menu-head">
          <span className="brand">
            <img src="/logo.png" alt="MySignal" style={{ height: 26, width: 'auto', display: 'block' }} />
          </span>
          <button className="mobile-menu-close" aria-label="Close menu" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <nav>
          <ul>
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className={isActive(l.to) ? 'active' : ''} onClick={() => setOpen(false)}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mm-meta">
          Email
          <a href="mailto:hello@mysignal.id">hello@mysignal.id</a>
        </div>
      </aside>
    </>
  );
}
