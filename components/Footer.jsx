import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-soft)', padding: '56px 0 26px' }}>
      <div className="wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 30, paddingBottom: 36 }}>
          <div>
            <span className="brand">MY<span>SIGNAL</span></span>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 10, maxWidth: 280 }}>
              Signals from the digital world — technology, decoded for everyone.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 14 }}>Explore</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <li><Link href="/" style={{ fontSize: 14, color: 'var(--text-dim)' }}>Home</Link></li>
                <li><Link href="/about" style={{ fontSize: 14, color: 'var(--text-dim)' }}>About MySignal</Link></li>
                <li><Link href="/gallery" style={{ fontSize: 14, color: 'var(--text-dim)' }}>Gallery</Link></li>
                <li><Link href="/news" style={{ fontSize: 14, color: 'var(--text-dim)' }}>News</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 14 }}>Contact</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <li><a href="mailto:hello@mysignal.id" style={{ fontSize: 14, color: 'var(--text-dim)' }}>hello@mysignal.id</a></li>
                <li><Link href="/contact" style={{ fontSize: 14, color: 'var(--text-dim)' }}>Get in touch</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, paddingTop: 26, borderTop: '1px solid var(--border-soft)' }}>
          <p style={{ color: 'var(--text-faint)', fontSize: 12.5 }}>© 2026 MySignal. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="#" aria-label="Instagram" style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg>
            </a>
            <a href="#" aria-label="TikTok" style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3v10.5a3.5 3.5 0 1 1-3-3.46" /><path d="M15 3a5 5 0 0 0 5 5" /></svg>
            </a>
            <a href="#" aria-label="YouTube" style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M11 10l4 2-4 2z" fill="currentColor" stroke="none" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
