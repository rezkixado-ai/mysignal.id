import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../../../lib/db.js';
import { renderBlocks, getFaqJsonLd } from '../../../../lib/render-blocks.jsx';
import { getSettings, waLink, fmtDate } from '../../../../lib/xdata.js';
import { ArticleCard } from '../../../../components/site/Cards.jsx';
import Media from '../../../../components/site/Media.jsx';
import SIcon from '../../../../components/site/SIcon.jsx';

export const dynamic = 'force-dynamic';

async function getArticle(slug) {
  const r = await db().execute({ sql: 'SELECT * FROM articles WHERE slug=? AND is_published=1', args: [slug] });
  if (!r.rows.length) return null;
  const article = r.rows[0];
  const media = await db().execute({
    sql: 'SELECT * FROM article_media WHERE article_id=? ORDER BY sort_order ASC',
    args: [article.id]
  });
  // content_blocks disimpan sebagai string JSON; di-parse sekali di sini.
  let contentBlocks = null;
  if (article.content_blocks) {
    try {
      const parsed = JSON.parse(article.content_blocks);
      if (Array.isArray(parsed.blocks) && parsed.blocks.length > 0) contentBlocks = parsed;
    } catch { /* fall through ke body_html */ }
  }
  return { ...article, media: media.rows, contentBlocks };
}

async function getRelated(article) {
  try {
    const r = await db().execute({
      sql: 'SELECT id, slug, title, excerpt, category, cover_media_url, cover_media_type, published_at, read_minutes FROM articles WHERE is_published=1 AND slug != ? ORDER BY (category = ?) DESC, published_at DESC LIMIT 3',
      args: [article.slug, article.category || '']
    });
    return r.rows.map((x) => ({ ...x }));
  } catch { return []; }
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  let article;
  try { article = await getArticle(slug); } catch { article = null; }
  if (!article) return { title: 'Artikel tidak ditemukan', robots: { index: false, follow: false } };

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

export default async function ArticleDetail({ params }) {
  const { slug } = params;
  let article;
  try { article = await getArticle(slug); } catch { article = null; }
  if (!article) notFound();

  const [related, settings] = await Promise.all([getRelated(article), getSettings()]);
  const wa = waLink(settings, `Halo Xignal, saya baca artikel "${article.title}" dan ingin berdiskusi.`);
  const site = process.env.SITE_URL || process.env.URL || 'https://mysignal.id';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.meta_description || '',
    ...(article.cover_media_type === 'image' && article.cover_media_url ? { image: [article.cover_media_url] } : {}),
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: { '@type': 'Organization', name: 'Xignal' },
    publisher: { '@type': 'Organization', name: 'Xignal' },
    mainEntityOfPage: `${site}/article/${slug}`
  };
  const faqJsonLd = article.contentBlocks ? getFaqJsonLd(article.contentBlocks) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <header className="x-phead x-art-head">
        <div className="x-wrap x-art-narrow">
          <nav className="x-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><SIcon name="chevronR" size={12} />
            <Link href="/artikel">Artikel</Link><SIcon name="chevronR" size={12} />
            <span>{article.category || 'Detail'}</span>
          </nav>
          {article.category ? <span className="x-tag">{article.category}</span> : null}
          <h1 className="x-art-title">{article.title}</h1>
          {article.excerpt ? <p>{article.excerpt}</p> : null}
          <div className="x-by"><i /> <span>Admin Xignal</span><span>|</span><span>{fmtDate(article.published_at)}</span>{article.read_minutes ? <><span>|</span><span>{article.read_minutes} menit baca</span></> : null}</div>
        </div>
      </header>

      <section className="x-sec" style={{ paddingTop: 10 }}>
        <div className="x-wrap x-art-narrow">
          {article.cover_media_url ? (
            <div className="x-art-cover">
              <Media src={article.cover_media_url} video={article.cover_media_type === 'video'} alt={article.title} icon="file" {...(article.cover_media_type === 'video' ? { controls: true } : {})} />
            </div>
          ) : null}

          {article.contentBlocks ? (
            <div className="article-prose x-prose">{renderBlocks(article.contentBlocks)}</div>
          ) : (
            <>
              <div className="article-prose x-prose" dangerouslySetInnerHTML={{ __html: article.body_html || '<p>Artikel ini belum memiliki konten.</p>' }} />
              {article.media && article.media.length > 0 && (
                <div className="x-prose-media">
                  {article.media.map((m) => (
                    <figure key={m.id}>
                      {m.media_type === 'video'
                        ? <video src={m.media_url} controls />
                        : <img src={m.media_url} alt={m.caption || ''} loading="lazy" />}
                      {m.caption && <figcaption>{m.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
            </>
          )}

          <aside className="x-art-cta">
            <div>
              <strong>Butuh rekomendasi produk atau solusi jaringan?</strong>
              <span>Tim sales Xignal siap membantu konsultasi kebutuhan Anda.</span>
            </div>
            <a className="x-btn x-btn-grad" href={wa} target="_blank" rel="noreferrer"><SIcon name="whatsapp" size={16} /> TANYA SALES</a>
          </aside>

          <Link href="/artikel" className="x-back"><SIcon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} /> Kembali ke Artikel</Link>
        </div>
      </section>

      {related.length > 0 && (
        <section className="x-sec x-sec-alt">
          <div className="x-wrap">
            <h2 className="x-h2" style={{ marginBottom: 18 }}>Artikel <span className="x-grad-text">Terkait</span></h2>
            <div className="x-agrid x-agrid-3">
              {related.map((a) => <ArticleCard key={a.id} a={a} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
