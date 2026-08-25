export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-soft)', padding: '48px 0 26px' }}>
      <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <span className="brand">MY<span>SIGNAL</span></span>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 10, maxWidth: 280 }}>
            Signals from the digital world — technology, decoded for everyone.
          </p>
        </div>
        <p style={{ color: 'var(--text-faint)', fontSize: 12.5 }}>© 2026 MySignal. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
