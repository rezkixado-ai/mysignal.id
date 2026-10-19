import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProducts, getSettings, waLink, rupiah, splitSpecs } from '../../../../lib/xdata.js';
import Media from '../../../../components/site/Media.jsx';
import SIcon from '../../../../components/site/SIcon.jsx';
import { ProductCard } from '../../../../components/site/Cards.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const p = await getProducts({ slug: params.slug });
  if (!p) return { title: 'Produk tidak ditemukan' };
  return {
    title: `${p.name} — Xignal`,
    description: p.description || `${p.name} dari Xignal.`,
    alternates: { canonical: `/produk/${p.slug}` }
  };
}

export default async function ProductDetail({ params }) {
  const [p, s, all] = await Promise.all([getProducts({ slug: params.slug }), getSettings(), getProducts({ limit: 8 })]);
  if (!p) notFound();
  const price = rupiah(p.price);
  const features = String(p.features || '').split('\n').map((x) => x.trim()).filter(Boolean);
  const related = all.filter((x) => x.slug !== p.slug).slice(0, 4);
  const wa = waLink(s, `Halo Xignal, saya tertarik dengan produk "${p.name}". Mohon info harga dan ketersediaan.`);

  return (
    <>
      <div className="x-wrap x-detail">
        <div className="x-card x-detail-img">
          <Media src={p.image_url} alt={p.name} icon="cube" />
          {p.badge ? <span className="x-badge" style={{ position: 'absolute', top: 14, right: 14 }}>{p.badge}</span> : null}
        </div>
        <div>
          <nav className="x-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><SIcon name="chevronR" size={12} /><Link href="/produk">Produk</Link><SIcon name="chevronR" size={12} /><span>{p.category}</span></nav>
          <span className="x-tag">{p.category}</span>
          <h1>{p.name}</h1>
          <div className="x-specs">{splitSpecs(p.specs).map((x) => <span key={x}>{x}</span>)}</div>
          <div className="x-price">{price || 'Hubungi Sales'}{price && p.price_unit ? <small>{p.price_unit}</small> : null}</div>
          {p.description ? <p className="x-detail-desc">{p.description}</p> : null}
          {features.length ? (
            <ul className="x-feats">{features.map((f) => <li key={f}><SIcon name="check" size={18} />{f}</li>)}</ul>
          ) : null}
          <div className="x-detail-cta">
            <a href={wa} target="_blank" rel="noreferrer" className="x-btn x-btn-grad"><SIcon name="whatsapp" size={18} /> TANYA SALES</a>
            <Link href="/produk" className="x-btn x-btn-line"><SIcon name="chevronL" size={14} /> SEMUA PRODUK</Link>
          </div>
        </div>
      </div>
      {related.length ? (
        <section className="x-sec">
          <div className="x-wrap">
            <h2 className="x-h2">Produk Lainnya</h2><span className="x-bar" />
            <div className="x-pgrid">{related.map((r) => <ProductCard p={r} key={r.id || r.slug} />)}</div>
          </div>
        </section>
      ) : null}
    </>
  );
}
