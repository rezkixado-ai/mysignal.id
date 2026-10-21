import Link from 'next/link';
import { db } from '../../../lib/db.js';
import { renderBlocks, getFaqJsonLd } from '../../../lib/render-blocks.jsx';
import { getSettings, waLink } from '../../../lib/xdata.js';
import SIcon from '../../../components/site/SIcon.jsx';

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
    title: page?.meta_title || page?.title || 'Hubungi Kami',
    description: page?.meta_description || 'Hubungi tim Xignal untuk konsultasi produk, penawaran, atau kolaborasi.',
    alternates: { canonical: '/contact' }
  };
}

export default async function Contact() {
  let page = null;
  try { page = await getPage('contact'); } catch { page = null; }
  const settings = await getSettings();
  const wa = waLink(settings, 'Halo Xignal, saya ingin konsultasi.');
  const faqJsonLd = page?.contentBlocks ? getFaqJsonLd(page.contentBlocks) : null;
  const hasBlocks = !!page?.contentBlocks?.blocks?.length;

  return (
    <>
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      <header className="x-phead">
        <div className="x-wrap">
          <nav className="x-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><SIcon name="chevronR" size={12} /><span>Kontak</span></nav>
          <h1>{page?.title && page.title !== 'Contact Us' ? page.title : <>Hubungi <span className="x-grad-text">Kami</span></>}</h1>
          <p>Konsultasi produk, permintaan penawaran, atau kolaborasi, tim Xignal siap membantu.</p>
        </div>
      </header>

      <section className="x-sec">
        <div className="x-wrap">
          <div className="x-contact">
            <a className="x-card x-cc" href={wa} target="_blank" rel="noreferrer">
              <span className="x-cc-ic"><SIcon name="whatsapp" size={22} /></span>
              <strong>WhatsApp Sales</strong>
              <span>Respon cepat untuk harga dan ketersediaan produk.</span>
              <em>Chat sekarang <SIcon name="arrow" size={13} /></em>
            </a>
            <a className="x-card x-cc" href={`mailto:${settings.contact_email}`}>
              <span className="x-cc-ic"><SIcon name="file" size={22} /></span>
              <strong>Email</strong>
              <span>{settings.contact_email}</span>
              <em>Kirim email <SIcon name="arrow" size={13} /></em>
            </a>
            {settings.social_instagram && settings.social_instagram !== '#' ? (
              <a className="x-card x-cc" href={settings.social_instagram} target="_blank" rel="noreferrer">
                <span className="x-cc-ic"><SIcon name="instagram" size={22} /></span>
                <strong>Instagram</strong>
                <span>Update produk dan konten lapangan.</span>
                <em>Kunjungi <SIcon name="arrow" size={13} /></em>
              </a>
            ) : null}
          </div>

          {hasBlocks && (
            <div className="article-prose x-prose x-art-narrow" style={{ marginTop: 34 }}>
              {renderBlocks(page.contentBlocks)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
