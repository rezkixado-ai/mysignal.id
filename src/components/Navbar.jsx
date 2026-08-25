import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap nav-inner">
        <Link to="/" className="brand">MY<span>SIGNAL</span></Link>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About MySignal</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
          <NavLink to="/news">News</NavLink>
          <NavLink to="/contact">Contact Us</NavLink>
        </nav>
        <Link to="/contact" className="btn btn-ghost">Contact Us</Link>
      </div>
    </header>
  );
}
