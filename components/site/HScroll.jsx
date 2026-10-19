'use client';

import { useRef } from 'react';
import SIcon from './SIcon.jsx';

// Baris horizontal yang bisa digeser (swipe di HP, tombol panah di desktop).
export default function HScroll({ children, className = '' }) {
  const ref = useRef(null);
  const by = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.8), behavior: 'smooth' });
  };
  return (
    <div className="x-hs">
      <button type="button" className="x-iconbtn x-hs-btn x-hs-prev" aria-label="Sebelumnya" onClick={() => by(-1)}><SIcon name="chevronL" size={18} /></button>
      <div className={`x-hs-track ${className}`} ref={ref}>{children}</div>
      <button type="button" className="x-iconbtn x-hs-btn x-hs-next" aria-label="Berikutnya" onClick={() => by(1)}><SIcon name="chevronR" size={18} /></button>
    </div>
  );
}
