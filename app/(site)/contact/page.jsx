import { db } from '../../../lib/db.js';
import { renderBlocks, getFaqJsonLd } from '../../../lib/render-blocks.jsx';

export const dynamic = 'force-dynamic';

async function getPage(slug) {
  const r = await db().execute({ sql: 'SELECT * FROM site_pages WHERE slug=?', args: [slug] });
  if (!r.rows.length) return null;
  const row = r.rows[0];
  let contentBlocks = { blocks: [] };
  if (row.content_blocks) {
    try {
      const parsed = JSON.parse(row.content_blocks);
      if (Array.isArray(parsed.blocks)) contentBlocks = parsed;
    } catch { /* keep empty */ }
  }
  return { ...row, contentBlocks };
}

export async function generateMetadata() {
  let page;
  try { page = await getPage('contact'); } catch { page = null; }
  return {
    title: page?.meta_title || page?.title || 'Contact Us',
    description: page?.meta_description || 'Hubungi tim Xi:gnal untuk pertanyaan, kolaborasi, atau sekadar menyapa.',
    alternates: { canonical: '/contact' }
  };
}

export default async function Contact() {
  let page = null;
  try { page = await getPage('contact'); } catch { page = null; }
  const faqJsonLd = page?.contentBlocks ? getFaqJsonLd(page.contentBlocks) : null;

  return (
    <main>
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      <section style={{ paddingBottom: 40 }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <span className="eyebrow">Get in Touch</span>
          <h1 style={{ fontSize: 'clamp(28px,4.4vw,44px)', marginTop: 14, marginBottom: 28 }}>{page?.title || 'Contact Us'}</h1>

          {page?.contentBlocks?.blocks?.length ? (
            <div className="article-prose" style={{ color: 'var(--text-dim)', fontSize: 16, lineHeight: 1.75 }}>
              {renderBlocks(page.contentBlocks)}
            </div>
          ) : (
            <p style={{ color: 'var(--text-faint)' }}>
              Konten belum diisi — edit dari admin di /admin/pages, atau hubungi kami langsung di{' '}
              <a href="mailto:hello@mysignal.id" style={{ color: 'var(--blue-2)' }}>hello@mysignal.id</a>.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
