import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArticleBySlug } from '../lib/api.js';
import { useSEO, SITE_URL } from '../lib/useSEO.js';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    setArticle(undefined);
    getArticleBySlug(slug).then(setArticle).catch(() => setArticle(null));
  }, [slug]);

  useSEO({
    title: article && article.meta_title ? article.meta_title : article?.title,
    description: article ? (article.meta_description || article.excerpt) : undefined,
    path: `/article/${slug}`,
    image: article?.cover_media_type === 'image' ? article.cover_media_url : undefined,
    type: 'article',
    noindex: !article || article === null,
    jsonLd: article ? {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt || article.meta_description || '',
      image: article.cover_media_type === 'image' && article.cover_media_url ? [article.cover_media_url] : undefined,
      datePublished: article.published_at,
      dateModified: article.updated_at || article.published_at,
      author: { '@type': 'Organization', name: 'MySignal' },
      publisher: { '@type': 'Organization', name: 'MySignal' },
      mainEntityOfPage: `${SITE_URL}/article/${slug}`
    } : undefined
  });

  if (article === undefined) {
    return <main><section><div className="wrap"><p style={{ color: 'var(--text-faint)' }}>Loading…</p></div></section></main>;
  }

  if (article === null) {
    return (
      <main>
        <section>
          <div className="wrap">
            <span className="eyebrow">404</span>
            <h1 style={{ fontSize: 32, marginTop: 14 }}>Article not found</h1>
            <p style={{ color: 'var(--text-dim)', marginTop: 10 }}>
              <Link to="/news" className="link-arrow">Back to News →</Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section style={{ paddingBottom: 24 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">{article.category}</span>
          <h1 style={{ fontSize: 'clamp(28px,4.4vw,46px)', margin: '16px 0 14px' }}>{article.title}</h1>
          {article.excerpt && <p style={{ color: 'var(--text-dim)', fontSize: 16, marginBottom: 16 }}>{article.excerpt}</p>}
          <div className="meta-row">
            <span>{new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>·</span>
            <span>{article.read_minutes} min read</span>
          </div>
        </div>
      </section>

      {article.cover_media_url && (
        <section style={{ paddingTop: 0, paddingBottom: 24 }}>
          <div className="wrap" style={{ maxWidth: 900 }}>
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {article.cover_media_type === 'video'
                ? <video src={article.cover_media_url} controls style={{ width: '100%', display: 'block' }} />
                : <img src={article.cover_media_url} alt={article.title} style={{ width: '100%', display: 'block' }} />}
            </div>
          </div>
        </section>
      )}

      <section style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div
            className="article-prose"
            style={{ color: 'var(--text-dim)', fontSize: 16, lineHeight: 1.75 }}
            dangerouslySetInnerHTML={{ __html: article.body_html || '<p>This article has no content yet.</p>' }}
          />

          {article.media && article.media.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 32 }}>
              {article.media.map((m) => (
                <figure key={m.id} style={{ margin: 0 }}>
                  <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {m.media_type === 'video'
                      ? <video src={m.media_url} controls style={{ width: '100%', display: 'block' }} />
                      : <img src={m.media_url} alt={m.caption || ''} style={{ width: '100%', display: 'block' }} />}
                  </div>
                  {m.caption && <figcaption style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 8 }}>{m.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}

          <div style={{ marginTop: 40 }}>
            <Link to="/news" className="link-arrow">← Back to News</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
