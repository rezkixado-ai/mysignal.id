'use client';

import { useState } from 'react';
import Lightbox from './Lightbox.jsx';

const SPAN_CLASS = { big: 'g1', wide: 'g2', normal: 'g3' };

export default function GalleryGrid({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!items || items.length === 0) return null;

  return (
    <>
      <div className="gallery-grid">
        {items.map((it, i) => (
          <a
            key={it.id}
            href="/gallery"
            className={SPAN_CLASS[it.layout_span] || 'g3'}
            onClick={(e) => { e.preventDefault(); setOpenIndex(i); }}
          >
            {it.media_type === 'video'
              ? <video src={it.media_url} muted loop autoPlay playsInline />
              : <img src={it.media_url} alt={it.title || it.tag || 'Gallery item'} loading="lazy" />}
            {it.tag && <span className="g-tag">{it.tag}</span>}
          </a>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox items={items} index={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
      )}
    </>
  );
}
