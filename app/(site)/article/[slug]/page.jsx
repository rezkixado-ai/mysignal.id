import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../../../lib/db.js';
import { renderBlocks, getFaqJsonLd } from '../../../../lib/render-blocks.jsx';
import { getSettings, waLink, fmtDate } from '../../../../lib/xdata.js';
import { ensureSchema } from '../../../../lib/xschema.js';
import { SITE_URL, SITE_NAME, abs } from '../../../../lib/site.js';
import { ArticleCard } from '../../../../components/site/Cards.jsx';
import Media from '../../../../components/site/Media.jsx';
import SIcon from '../../../../components/site/SIcon.jsx';
import ArticleToc from '../../../../components/site/ArticleToc.jsx';
import ShareButtons from '../../../../components/site/ShareButtons.jsx';

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

// SEO lanjutan per artikel (noindex, canonical, OG). Aman kalau tabel belum ada.
async function getSeoExtra(id) {
  try {
    await ensureSchema();
    const r = await db().execute({ sql: 'SELECT noindex, canonical, og_title, og_description, og_image FROM article_seo WHERE article_id = ?', args: [String(id)] });
    return r.rows[0] ? { ...r.rows[0] } : {};
  } catch { return {}; }
}

// Slug lama → slug baru (dicatat otomatis saat slug diganti di admin).
async function findRedirect(slug) {
  try {
    await ensureSchema();
    const r = await db().execute({ sql: 'SELECT new_slug FROM article_redirects WHERE old_slug = ?', args: [slug] });
    return r.rows[0]?.new_slug || null;
  } catch { return null; }
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

  const x = await getSeoExtra(article.id);
  const title = article.meta_title || article.title;
  const description = article.meta_description || article.excerpt || undefined;
  const ogTitle = x.og_title || title;
  const ogDesc = x.og_description || description;
  const cover = article.cover_media_type === 'image' && article.cover_media_url ? article.cover_media_url : '';
  const img = x.og_image || cover || '/xignal-logo.png';
  const canonical = x.canonical ? x.canonical : `/article/${slug}`;
  const noindex = Number(x.noindex) === 1;
  return {
    title,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: ogTitle, description: ogDesc, type: 'article', siteName: SITE_NAME, locale: 'id_ID',
      url: canonical, images: [{ url: img, alt: article.title }],
      publishedTime: article.published_at, modifiedTime: article.updated_at || article.published_at,
      section: article.category || undefined
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description: ogDesc, images: [img] }
  };
}

export default async function ArticleDetail({ params }) {
  const { slug } = params;
  let article;
  try { article = await getArticle(slug); } catch { article = null; }
  if (!article) {
    const to = await findRedirect(slug);
    if (to && to !== slug) permanentRedirect(`/article/${to}`);
    notFound();
  }

  const [related, settings] = await Promise.all([getRelated(article), getSettings()]);
  const wa = waLink(settings, `Halo Xignal, saya baca artikel "${article.title}" dan ingin berdiskusi.`);
  const site = SITE_URL;

  const authorName = settings.article_author_name || 'Admin Xignal';
  const authorRole = settings.article_author_role || '';
  const authorPhoto = settings.article_author_photo || '';
  const m = String(article.title).match(/^(.+?[?:])\s+(\S.*)$/);
  const titleParts = m && m[1].length <= 40 ? { lead: m[1], rest: m[2] } : {};
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.meta_description || '',
    ...(article.cover_media_type === 'image' && article.cover_media_url ? { image: [article.cover_media_url] } : {}),
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: { '@type': authorPhoto || settings.article_author_name ? 'Person' : 'Organization', name: authorName },
    publisher: { '@type': 'Organization', name: 'Xignal' },
    mainEntityOfPage: `${site}/article/${slug}`,
    inLanguage: 'id-ID',
    ...(article.category ? { articleSection: article.category } : {})
  };
  const crumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
      { '@type': 'ListItem', position: 2, name: 'Artikel', item: abs('/artikel') },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${site}/article/${slug}` }
    ]
  };
  const faqJsonLd = article.contentBlocks ? getFaqJsonLd(article.contentBlocks) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <article className="x-art">
        <div className="x-wrap x-art-top">
          {article.cover_media_url ? (
            <div className="x-art-cover2">
              <Media src={article.cover_media_url} video={article.cover_media_type === 'video'} alt={article.title} icon="file" {...(article.cover_media_type === 'video' ? { controls: true } : {})} />
            </div>
          ) : null}

          <header className={`x-art-card${article.cover_media_url ? ' over' : ''}`}>
            <div className="x-art-toprow">
              <nav className="x-crumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link><SIcon name="chevronR" size={12} />
                <Link href="/artikel">Artikel</Link><SIcon name="chevronR" size={12} />
                <span>{article.category || 'Detail'}</span>
              </nav>
              <span className="x-art-when">{fmtDate(article.published_at)}{article.read_minutes ? ` | ${article.read_minutes} menit baca` : ''}</span>
            </div>
            {article.category ? <span className="x-tag">{article.category}</span> : null}
            <h1 className="x-art-title">{titleParts.lead ? <><span className="x-grad-text">{titleParts.lead}</span> {titleParts.rest}</> : article.title}</h1>
            {article.excerpt ? <p className="x-art-excerpt">{article.excerpt}</p> : null}
            <div className="x-art-by">
              <div className="x-art-author">
                {authorPhoto ? <img src={authorPhoto} alt="" /> : <i aria-hidden="true" />}
                <div><strong>Oleh {authorName}</strong>{authorRole ? <small>{authorRole}</small> : null}</div>
              </div>
              <ShareButtons title={article.title} path={`/article/${slug}`} />
            </div>
          </header>
        </div>

        <div className="x-wrap x-art-layout">
          <aside className="x-art-side"><ArticleToc target=".x-art-main .x-prose" /></aside>
          <div className="x-art-main">
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
        </div>
      </article>

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
