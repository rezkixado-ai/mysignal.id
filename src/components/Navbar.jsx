import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About MySignal' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Contact Us' }
];

export default function Navbar() {
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

  return (
    <>
      <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap nav-inner">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>MY<span>SIGNAL</span></Link>

          <nav className="nav-links">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}>{l.label}</NavLink>
            ))}
          </nav>

          <div className="nav-cta">
            <Link to="/contact" className="btn btn-ghost">Contact Us</Link>
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
          <span className="brand">MY<span>SIGNAL</span></span>
          <button className="mobile-menu-close" aria-label="Close menu" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <nav>
          <ul>
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.end} onClick={() => setOpen(false)}>{l.label}</NavLink>
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
