import { useEffect, useState } from 'react';
import { getArticles } from '../lib/api.js';
import { useSEO } from '../lib/useSEO.js';

const CATS = ['All', 'Cybersecurity', 'Cloud', 'Network', 'Fiber Optic', 'AI', 'Big Tech', 'Tech Business', 'Hardware'];

export default function News() {
  const [articles, setArticles] = useState(null);
  const [cat, setCat] = useState('All');

  useEffect(() => {
    getArticles(cat === 'All' ? {} : { category: cat }).then(setArticles).catch(() => setArticles([]));
  }, [cat]);

  useSEO({
    title: cat === 'All' ? 'News' : `${cat} News`,
    description: `The latest ${cat === 'All' ? 'technology' : cat.toLowerCase()} news and analysis from MySignal.`,
    path: '/news'
  });

  return (
    <main>
      <section style={{ paddingBottom: 24 }}>
        <div className="wrap">
          <span className="eyebrow">Signal Feed</span>
          <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', marginTop: 14, marginBottom: 24 }}>News</h1>
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
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          {articles === null && <p style={{ color: 'var(--text-faint)' }}>Loading…</p>}
          {articles && articles.length === 0 && <p style={{ color: 'var(--text-faint)' }}>No articles in this category yet.</p>}

          <div className="articles-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {articles && articles.map((a) => (
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
                    <span>{new Date(a.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>·</span>
                    <span>{a.read_minutes} min read</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
