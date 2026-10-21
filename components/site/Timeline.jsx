'use client';

import { useEffect, useRef, useState } from 'react';
import SIcon from './SIcon.jsx';

// Timeline "Perjalanan Kami": garis tergambar, node muncul berurutan dengan ring berputar,
// teks naik satu-satu, dan titik cahaya berjalan di sepanjang garis. Hanya CSS setelah kelas `in`.
export default function Timeline({ items }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) { setOn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`x-tl${on ? ' in' : ''}`}>
      <span className="x-tl-line" aria-hidden="true" />
      <span className="x-tl-pulse" aria-hidden="true" />
      {items.map((t, i) => (
        <div className="x-tl-item" key={t.id || i} style={{ '--i': i }}>
          <div className="x-tl-node">
            <SIcon name={t.icon || 'bulb'} />
            <b>{String(i + 1).padStart(2, '0')}</b>
          </div>
          <div className="x-tl-txt">
            <h3>{t.year_label}</h3>
            {t.title ? <h4 className="x-cyan" style={{ fontSize: 13, margin: '0 0 6px' }}>{t.title}</h4> : null}
            <p>{t.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
