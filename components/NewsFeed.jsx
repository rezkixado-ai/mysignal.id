'use client';

import { useState } from 'react';

const CATS = ['All', 'Cybersecurity', 'Cloud', 'Network', 'Fiber Optic', 'AI', 'Big Tech', 'Tech Business', 'Hardware'];

const dateFmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function NewsFeed({ articles }) {
  const [cat, setCat] = useState('All');
  const filtered = cat === 'All' ? articles : articles.filter((a) => a.category === cat);

  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={c === cat ? 'btn' : 'btn btn-ghost'}
            style={{ padding: '9px 16px', fontSize: 13 }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="articles-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 32 }}>
        {filtered.length === 0 && <p style={{ color: 'var(--text-faint)' }}>No articles in this category yet.</p>}
        {filtered.map((a) => (
          <a href={`/article/${a.slug}`} className="article-card" key={a.id}>
            <div className="article-thumb">
              {a.cover_media_type === 'video'
                ? <video src={a.cover_media_url} muted loop autoPlay playsInline />
                : <img src={a.cover_media_url} alt={a.title} loading="lazy" />}
            </div>
            <div className="article-body">
              <span className="eyebrow">{a.category}</span>
              <h3>{a.title}</h3>
              {a.excerpt && <p>{a.excerpt}</p>}
              <div className="meta-row">
                <span>{dateFmt(a.published_at)}</span><span>·</span><span>{a.read_minutes} min read</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
