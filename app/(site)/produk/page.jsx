import Link from 'next/link';
import { getProducts, getSettings, waLink } from '../../../lib/xdata.js';
import ProductBrowser from '../../../components/site/ProductBrowser.jsx';
import SIcon from '../../../components/site/SIcon.jsx';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Produk — Kabel Fiber Optik & Perangkat Jaringan',
  description: 'Katalog kabel fiber optik, OLT, ONU/ONT dan tools instalasi jaringan dari Xignal.',
  alternates: { canonical: '/produk' }
};

export default async function ProdukPage() {
  const [products, s] = await Promise.all([getProducts({ limit: 100 }), getSettings()]);
  return (
    <>
      <header className="x-phead">
        <div className="x-wrap">
          <nav className="x-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><SIcon name="chevronR" size={12} /><span>Produk</span></nav>
          <h1>Produk <span className="x-grad-text">Pilihan</span></h1>
          <p>Berbagai kabel fiber optik dan perangkat jaringan berkualitas untuk kebutuhan proyek Anda.</p>
        </div>
      </header>
      <section className="x-sec">
        <div className="x-wrap">
          <ProductBrowser products={products} />
          <div className="x-card x-collab">
            <div><strong>Butuh penawaran untuk proyek besar?</strong><span>Tim sales kami siap membantu pemilihan produk dan estimasi kebutuhan.</span></div>
            <a className="x-btn x-btn-grad" href={waLink(s, 'Halo Xignal, saya ingin penawaran produk.')} target="_blank" rel="noreferrer"><SIcon name="whatsapp" size={18} /> HUBUNGI SALES</a>
          </div>
        </div>
      </section>
    </>
  );
}
