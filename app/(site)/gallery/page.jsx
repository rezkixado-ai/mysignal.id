import { db } from '../../../lib/db.js';
import GalleryGrid from '../../../components/GalleryGrid.jsx';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Gallery',
  description: 'The Xi:gnal visual archive — technology photography, field documentation, and visual stories.',
  alternates: { canonical: '/gallery' }
};

async function getGalleryItems() {
  const r = await db().execute('SELECT * FROM gallery_items WHERE is_published = 1 ORDER BY sort_order ASC');
  return r.rows;
}

export default async function Gallery() {
  let items = [];
  try { items = await getGalleryItems(); } catch { /* DB unavailable — page still renders */ }

  return (
    <main>
      <section style={{ paddingBottom: 24 }}>
        <div className="wrap">
          <span className="eyebrow">Visual Archive</span>
          <h1 style={{ fontSize: 'clamp(28px,4.4vw,44px)', marginTop: 14, marginBottom: 8 }}>Signal Gallery</h1>
          <p style={{ color: 'var(--text-dim)', maxWidth: 560 }}>
            Technology photography, field documentation, and visual stories from the Xi:gnal archive.
          </p>
        </div>
      </section>

      {/* Placeholder — replace href (and the thumbnail) with the real YouTube video/channel link once available. */}
      <section style={{ paddingBottom: 36 }}>
        <div className="wrap">
          <a
            href="https://youtube.com/@xignal"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'relative', display: 'block', borderRadius: 'var(--radius)', overflow: 'hidden',
              border: '1px solid var(--border)', aspectRatio: '16/6', maxHeight: 340
            }}
          >
            <img
              src="https://picsum.photos/seed/xignal-youtube/1600/600"
              alt="Watch Xi:gnal on YouTube"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12
              }}
            >
              <div
                style={{
                  width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
                  border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
              </div>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Watch on YouTube</span>
            </div>
          </a>
        </div>
      </section>

      <section>
        <div className="wrap">
          {items.length > 0 ? (
            <GalleryGrid items={items} />
          ) : (
            <p style={{ color: 'var(--text-faint)' }}>Belum ada item galeri — tambahkan dari /admin/gallery.</p>
          )}
        </div>
      </section>
    </main>
  );
}
