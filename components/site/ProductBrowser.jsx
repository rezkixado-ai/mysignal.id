'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import SIcon from './SIcon.jsx';
import Media from './Media.jsx';

const rupiah = (n) => (n == null || n === '' ? null : `Rp ${Number(n).toLocaleString('id-ID')}`);
const specs = (s) => String(s || '').split('|').map((x) => x.trim()).filter(Boolean);

// Pill kategori + grid produk. `home` = pill hanya tampil di HP (di desktop mockup tidak ada pill).
export default function ProductBrowser({ products, home = false, limit = 0 }) {
  const cats = useMemo(() => ['Semua', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))], [products]);
  const [cat, setCat] = useState('Semua');
  let list = cat === 'Semua' ? products : products.filter((p) => p.category === cat);
  if (limit) list = list.slice(0, limit);

  return (
    <>
      {cats.length > 2 || (cats.length === 2 && !home) ? (
        <div className={`x-pills ${home ? 'x-pills-home' : ''}`} role="tablist" aria-label="Kategori produk">
          {cats.map((c) => (
            <button key={c} type="button" role="tab" aria-selected={c === cat} className={`x-pill${c === cat ? ' on' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      ) : null}
      <div className={`x-pgrid${home ? ' x-pgrid-home' : ' x-pgrid-3'}`}>
        {list.map((p) => {
          const price = rupiah(p.price);
          return (
            <article className="x-card x-pc" key={p.id || p.slug}>
              <Link href={`/produk/${p.slug}`} className="x-pc-img" aria-label={p.name}>
                <Media src={p.image_url} alt={p.name} icon="cube" />
              </Link>
              {p.badge ? <span className="x-badge">{p.badge}</span> : null}
              <div className="x-pc-body">
                <h3><Link href={`/produk/${p.slug}`}>{p.name}</Link></h3>
                <div className="x-specs">{specs(p.specs).map((s) => <span key={s}>{s}</span>)}</div>
                <div className="x-price">{price || 'Hubungi Sales'}{price && p.price_unit ? <small>{p.price_unit}</small> : null}</div>
                <Link href={`/produk/${p.slug}`} className="x-btn">DETAIL PRODUK <SIcon name="arrow" size={14} /></Link>
              </div>
            </article>
          );
        })}
        {list.length === 0 && <p className="x-empty">Belum ada produk di kategori ini.</p>}
      </div>
    </>
  );
}
