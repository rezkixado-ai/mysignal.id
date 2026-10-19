import Link from 'next/link';
import { getVideos } from '../../../lib/xdata.js';
import { VideoCard } from '../../../components/site/Cards.jsx';
import SIcon from '../../../components/site/SIcon.jsx';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Video — Dari Lapangan',
  description: 'Lihat langsung bagaimana produk Xignal digunakan di berbagai proyek jaringan di seluruh Indonesia.',
  alternates: { canonical: '/video' }
};

export default async function VideoPage() {
  const videos = await getVideos(60);
  return (
    <>
      <header className="x-phead">
        <div className="x-wrap">
          <nav className="x-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><SIcon name="chevronR" size={12} /><span>Video</span></nav>
          <h1>Dari <span className="x-grad-text">Lapangan</span></h1>
          <p>Melihat langsung bagaimana produk Xignal digunakan di berbagai proyek jaringan di seluruh Indonesia.</p>
        </div>
      </header>
      <section className="x-sec">
        <div className="x-wrap"><div className="x-vgrid">{videos.map((v) => <VideoCard v={v} key={v.id} />)}</div></div>
      </section>
    </>
  );
}
