'use client';

import { useState } from 'react';
import HScroll from './HScroll.jsx';
import SIcon from './SIcon.jsx';
import Media from './Media.jsx';

function FounderCard({ f }) {
  const [flip, setFlip] = useState(false);
  return (
    <div
      role="button" tabIndex={0} className={`x-fcard${flip ? ' flip' : ''}`} aria-pressed={flip}
      aria-label={`${f.name}, ${f.role}. Ketuk untuk membalik kartu`}
      onClick={() => setFlip((v) => !v)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlip((v) => !v); } }}
    >
      <div className="x-fcard-in">
        <div className="x-fface front">
          <Media src={f.photo_url} alt={f.name} icon="user" />
          <span className="x-fhint"><SIcon name="flip" size={12} /> Flip</span>
          <span className="x-fcap">
            <strong>{f.name}</strong>
            <span>{f.role}</span>
            {f.tags ? <em>{f.tags}</em> : null}
          </span>
        </div>
        <div className="x-fface back">
          <h4>Tentang Saya</h4>
          <p>{f.bio}</p>
          <span className="x-fhint" style={{ position: 'static', alignSelf: 'flex-start', marginTop: 'auto' }}><SIcon name="flip" size={12} /> Balik lagi</span>
        </div>
      </div>
    </div>
  );
}

export default function FounderCarousel({ founders }) {
  return (
    <HScroll>
      {founders.map((f) => <FounderCard f={f} key={f.id || f.role} />)}
    </HScroll>
  );
}
