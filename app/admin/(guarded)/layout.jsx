'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { checkAuth, logout } from '../../../lib/api.js';
import Icon from '../../../components/Icon.jsx';
import { MotionConfig } from 'motion/react';
import { NavProgress, NavPill, useRipple, useSuccessBurst } from '../../../components/admin/AdmFx.jsx';
import '../../../styles/xignal-admin.css';

const MAIN = [
  { to: '/admin', label: 'Dashboard', icon: 'home' },
  { to: '/admin/articles', label: 'Artikel', icon: 'file' },
  { to: '/admin/produk', label: 'Produk', icon: 'cube' },
  { to: '/admin/event', label: 'Event', icon: 'calendar' },
  { to: '/admin/video', label: 'Video / Reels', icon: 'reels' },
  { to: '/admin/brand', label: 'Brand', icon: 'tag' },
  { to: '/admin/promo', label: 'Promo Popup', icon: 'bell' },
  { to: '/admin/tentang', label: 'Halaman Tentang', icon: 'users' },
  { to: '/admin/pages', label: 'Halaman Lain', icon: 'page' },
  { to: '/admin/hero-slides', label: 'Banner & Slider', icon: 'layers' },
  { to: '/admin/gallery', label: 'Gallery', icon: 'image' },
  { to: '/admin/pengaturan', label: 'Pengaturan', icon: 'gear' }
];

const CREATE = [
  { to: '/admin/articles', label: 'Artikel baru', d: 'Tulis artikel dengan editor blok', icon: 'file', tone: '' },
  { to: '/admin/produk', label: 'Produk baru', d: 'Tambah kabel, OLT/ONU, atau tools', icon: 'cube', tone: 'cyan' },
  { to: '/admin/event', label: 'Event baru', d: 'Workshop, training, komunitas', icon: 'calendar', tone: 'green' },
  { to: '/admin/video', label: 'Video / Reels', d: 'Tambah video lapangan', icon: 'reels', tone: 'pink' }
];

export default function AdminLayout({ children }) {
  const [status, setStatus] = useState('checking');
  const [sheet, setSheet] = useState(null); // null | 'create' | 'more'
  const router = useRouter();
  const pathname = usePathname();
  useRipple();
  useSuccessBurst();
  const [closing, setClosing] = useState(false);
  const closeSheet = () => { if (closing) return; setClosing(true); setTimeout(() => { setSheet(null); setClosing(false); }, 200); };

  useEffect(() => {
    checkAuth().then((r) => setStatus(r.authorized ? 'ok' : 'denied')).catch(() => setStatus('denied'));
  }, []);
  useEffect(() => { if (status === 'denied') router.push('/admin/login'); }, [status, router]);
  useEffect(() => { setSheet(null); }, [pathname]);
  useEffect(() => {
    if (!sheet) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeSheet(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet]);

  if (status !== 'ok') {
    return <div className="lg"><p style={{ color: 'var(--text-dim)', textAlign: 'center' }}>Checking session…</p></div>;
  }

  const isOn = (to) => (to === '/admin' ? pathname === '/admin' : pathname.startsWith(to));
  const current = MAIN.find((n) => isOn(n.to));
  const moreActive = MAIN.slice(0).some((n) => !['/admin', '/admin/articles', '/admin/produk'].includes(n.to) && isOn(n.to));

  function createAt(to) {
    setSheet(null);
    if (pathname === to) window.dispatchEvent(new Event('adm:new'));
    else router.push(`${to}?new=1`);
  }
  async function doLogout() { await logout(); router.push('/admin/login'); }

  return (
    <MotionConfig reducedMotion="never">
    <div className="adm">
      <NavProgress />
      <aside className="adm-side">
        <div className="logo"><img className="x-logo-adm-img" src="/xignal-logo.png" alt="Xi:gnal" /></div>
        <div className="nl-label">Menu</div>
        {MAIN.map((n) => (
          <Link key={n.to} href={n.to} className={`nl${isOn(n.to) ? ' on' : ''}`}>{isOn(n.to) && <NavPill />}<Icon name={n.icon} size={18} /> <span>{n.label}</span></Link>
        ))}
        <div className="sp">
          <a href="/" target="_blank" rel="noreferrer" className="nl"><Icon name="external" size={18} /> Lihat situs</a>
          <button type="button" className="nl" onClick={doLogout}><Icon name="logout" size={18} /> Log out</button>
        </div>
      </aside>

      <div className="adm-col">
        <header className="adm-top">
          <img className="x-logo-adm-img" src="/xignal-logo.png" alt="Xi:gnal" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            {current ? current.label : 'Admin'}
          </span>
        </header>
        <main className="adm-main">{children}</main>
      </div>

      <nav className="bnav" aria-label="Admin">
        <Link href="/admin" className={isOn('/admin') ? 'on' : ''}>{isOn('/admin') && <NavPill id="bn-bar" className="bn-bar" />}<Icon name="home" size={22} />Dashboard</Link>
        <Link href="/admin/articles" className={isOn('/admin/articles') ? 'on' : ''}>{isOn('/admin/articles') && <NavPill id="bn-bar" className="bn-bar" />}<Icon name="file" size={22} />Artikel</Link>
        <button type="button" className="fab" aria-label="Tambah konten" onClick={() => setSheet('create')}><Icon name="plus" size={26} strokeWidth={2.4} /></button>
        <Link href="/admin/produk" className={isOn('/admin/produk') ? 'on' : ''}>{isOn('/admin/produk') && <NavPill id="bn-bar" className="bn-bar" />}<Icon name="cube" size={22} />Produk</Link>
        <button type="button" className={`bn${sheet === 'more' || moreActive ? ' on' : ''}`} onClick={() => setSheet('more')}>{moreActive && <NavPill id="bn-bar" className="bn-bar" />}<Icon name="menu" size={22} />Menu</button>
      </nav>

      {sheet && <div className={`scrim show${closing ? ' closing' : ''}`} style={{ zIndex: 200 }} onClick={closeSheet} />}
      {sheet === 'create' && (
        <div className={`sheet${closing ? ' closing' : ''}`} role="dialog" aria-label="Tambah konten">
          <h2>Tambah konten</h2>
          <p>Mau bikin apa?</p>
          <div className="sheet-list">
            {CREATE.map((c) => (
              <button key={c.to} type="button" className={`sheet-item ${c.tone}`} onClick={() => createAt(c.to)}>
                <span className="si-ic"><Icon name={c.icon} size={22} /></span>
                <span><strong>{c.label}</strong><span className="d">{c.d}</span></span>
              </button>
            ))}
          </div>
        </div>
      )}
      {sheet === 'more' && (
        <div className={`sheet${closing ? ' closing' : ''}`} role="dialog" aria-label="Menu">
          <h2>Menu</h2>
          <p>Semua bagian CMS.</p>
          <div className="sheet-list">
            {MAIN.filter((n) => !['/admin', '/admin/articles', '/admin/produk'].includes(n.to)).map((n) => (
              <Link key={n.to} href={n.to} className="sheet-item"><span className="si-ic"><Icon name={n.icon} size={22} /></span><span><strong>{n.label}</strong></span></Link>
            ))}
            <a href="/" target="_blank" rel="noreferrer" className="sheet-item green"><span className="si-ic"><Icon name="external" size={22} /></span><span><strong>Lihat situs</strong></span></a>
            <button type="button" className="sheet-item danger" onClick={doLogout}><span className="si-ic"><Icon name="logout" size={22} /></span><span><strong>Log out</strong></span></button>
          </div>
        </div>
      )}
    </div>
    </MotionConfig>
  );
}
