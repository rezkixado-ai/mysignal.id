import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../../../lib/db.js';
import { renderBlocks, getFaqJsonLd } from '../../../../lib/render-blocks.jsx';

export const dynamic = 'force-dynamic';

async function getArticle(slug) {
  const r = await db().execute({ sql: 'SELECT * FROM articles WHERE slug=? AND is_published=1', args: [slug] });
  if (!r.rows.length) return null;
  const article = r.rows[0];
  const media = await db().execute({
    sql: 'SELECT * FROM article_media WHERE article_id=? ORDER BY sort_order ASC',
    args: [article.id]
  });

  // content_blocks is stored as a JSON string; parse it once here so the
  // rest of the page can just check `.blocks.length`.
  let contentBlocks = null;
  if (article.content_blocks) {
    try {
      const parsed = JSON.parse(article.content_blocks);
      if (Array.isArray(parsed.blocks) && parsed.blocks.length > 0) contentBlocks = parsed;
    } catch { /* fall through to legacy body_html rendering */ }
  }

  return { ...article, media: media.rows, contentBlocks };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let article;
  try { article = await getArticle(slug); } catch { article = null; }

  if (!article) {
    return { title: 'Article not found', robots: { index: false, follow: false } };
  }

  const title = article.meta_title || article.title;
  const description = article.meta_description || article.excerpt || undefined;
  const image = article.cover_media_type === 'image' && article.cover_media_url ? [article.cover_media_url] : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/article/${slug}` },
    openGraph: { title, description, images: image, type: 'article', publishedTime: article.published_at, modifiedTime: article.updated_at },
    twitter: { card: 'summary_large_image', title, description, images: image }
  };
}

const dateFmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function ArticleDetail({ params }) {
  const { slug } = await params;
  let article;
  try { article = await getArticle(slug); } catch { article = null; }

  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.meta_description || '',
    ...(article.cover_media_type === 'image' && article.cover_media_url ? { image: [article.cover_media_url] } : {}),
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: { '@type': 'Organization', name: 'MySignal' },
    publisher: { '@type': 'Organization', name: 'MySignal' },
    mainEntityOfPage: `https://mysignal.id/article/${slug}`
  };

  // FAQPage JSON-LD only exists when a FAQ block was actually used.
  const faqJsonLd = article.contentBlocks ? getFaqJsonLd(article.contentBlocks) : null;

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <section style={{ paddingBottom: 24 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="eyebrow">{article.category}</span>
          <h1 style={{ fontSize: 'clamp(28px,4.4vw,46px)', margin: '16px 0 14px' }}>{article.title}</h1>
          {article.excerpt && <p style={{ color: 'var(--text-dim)', fontSize: 16, marginBottom: 16 }}>{article.excerpt}</p>}
          <div className="meta-row">
            <span>{dateFmt(article.published_at)}</span>
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
          {article.contentBlocks ? (
            // New block-based articles: images/tables/FAQ can sit anywhere in the flow.
            <div className="article-prose" style={{ color: 'var(--text-dim)', fontSize: 16, lineHeight: 1.75 }}>
              {renderBlocks(article.contentBlocks)}
            </div>
          ) : (
            // Legacy articles: body_html blob + media appended at the end, as before.
            <>
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
            </>
          )}

          <div style={{ marginTop: 40 }}>
            <Link href="/news" className="link-arrow">← Back to News</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
