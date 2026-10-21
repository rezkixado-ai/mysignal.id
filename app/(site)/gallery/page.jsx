import Link from 'next/link';
import { db } from '../../../lib/db.js';
import { getSettings } from '../../../lib/xdata.js';
import GalleryGrid from '../../../components/GalleryGrid.jsx';
import SIcon from '../../../components/site/SIcon.jsx';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Galeri',
  description: 'Dokumentasi lapangan, instalasi fiber optik dan momen kegiatan Xignal.',
  alternates: { canonical: '/gallery' }
};

async function getGalleryItems() {
  const r = await db().execute('SELECT * FROM gallery_items WHERE is_published = 1 ORDER BY sort_order ASC');
  return r.rows;
}

export default async function Gallery() {
  let items = [];
  try { items = await getGalleryItems(); } catch { /* DB belum siap, halaman tetap tampil */ }
  const settings = await getSettings();
  const yt = settings.social_youtube && settings.social_youtube !== '#' ? settings.social_youtube : null;

  return (
    <>
      <header className="x-phead">
        <div className="x-wrap">
          <nav className="x-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><SIcon name="chevronR" size={12} /><span>Galeri</span></nav>
          <h1>Galeri <span className="x-grad-text">Lapangan</span></h1>
          <p>Dokumentasi instalasi, perangkat jaringan dan momen kegiatan Xignal.</p>
        </div>
      </header>

      {yt && (
        <section className="x-sec" style={{ paddingBottom: 0 }}>
          <div className="x-wrap">
            <a className="x-card x-yt" href={yt} target="_blank" rel="noreferrer">
              <span className="x-yt-play"><SIcon name="play" size={22} /></span>
              <span><strong>Tonton di YouTube</strong><em>Video instalasi dan edukasi jaringan fiber optik</em></span>
              <SIcon name="arrow" size={16} />
            </a>
          </div>
        </section>
      )}

      <section className="x-sec">
        <div className="x-wrap">
          {items.length > 0 ? (
            <GalleryGrid items={items} />
          ) : (
            <p className="x-empty">Belum ada item galeri. Tambahkan dari admin di Gallery.</p>
          )}
        </div>
      </section>
    </>
  );
}
