import Link from 'next/link';
import Logo from './site/Logo.jsx';
import SIcon from './site/SIcon.jsx';

export default function Footer({ settings, waHref }) {
  const s = settings;
  const links = [
    { to: '/produk', label: 'Produk' },
    { to: '/artikel', label: 'Artikel' },
    { to: '/event', label: 'Event' },
    { to: '/tentang', label: 'Tentang' }
  ];
  return (
    <footer className="x-foot">
      <div className="x-wrap">
        <div className="x-foot-top">
          <div className="x-foot-brand">
            <Logo size="lg" />
            <p>{s.footer_tagline}</p>
          </div>
          <nav className="x-foot-links" aria-label="Footer">
            {links.map((l) => (
              <Link key={l.to} href={l.to}>{l.label} <SIcon name="chevronR" size={14} /></Link>
            ))}
            <a href={waHref} target="_blank" rel="noreferrer">Kontak <SIcon name="chevronR" size={14} /></a>
          </nav>
          <div className="x-foot-social">
            <span>Ikuti Kami</span>
            <div>
              <a href={s.social_instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><SIcon name="instagram" size={18} /></a>
              <a href={s.social_youtube} aria-label="YouTube" target="_blank" rel="noreferrer"><SIcon name="youtube" size={18} /></a>
              <a href={s.social_linkedin} aria-label="LinkedIn" target="_blank" rel="noreferrer"><SIcon name="linkedin" size={18} /></a>
            </div>
          </div>
        </div>
        <div className="x-foot-bottom">
          <span>© 2026 Xignal. All rights reserved.</span>
          <span><Link href="/tentang">Kebijakan Privasi</Link> <i>|</i> <Link href="/tentang">Syarat &amp; Ketentuan</Link></span>
        </div>
      </div>
    </footer>
  );
}
