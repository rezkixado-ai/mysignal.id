import Link from 'next/link';
import SIcon from './SIcon.jsx';
import Media from './Media.jsx';
import { fmtDate, fmtRange, rupiah, splitSpecs } from '../../lib/xdata.js';

export function ProductCard({ p }) {
  const price = rupiah(p.price);
  return (
    <article className="x-card x-pc">
      <Link href={`/produk/${p.slug}`} className="x-pc-img" aria-label={p.name}>
        <Media src={p.image_url} alt={p.name} icon="cube" />
      </Link>
      {p.badge ? <span className="x-badge">{p.badge}</span> : null}
      <div className="x-pc-body">
        <h3><Link href={`/produk/${p.slug}`}>{p.name}</Link></h3>
        <div className="x-specs">{splitSpecs(p.specs).map((s) => <span key={s}>{s}</span>)}</div>
        <div className="x-price">{price || 'Hubungi Sales'}{price && p.price_unit ? <small>{p.price_unit}</small> : null}</div>
        <Link href={`/produk/${p.slug}`} className="x-btn">DETAIL PRODUK <SIcon name="arrow" size={14} /></Link>
      </div>
    </article>
  );
}

export function VideoCard({ v }) {
  const Tag = v.link_url && v.link_url !== '#' ? 'a' : 'div';
  const extra = Tag === 'a' ? { href: v.link_url, target: '_blank', rel: 'noreferrer' } : {};
  return (
    <Tag className="x-vcard" {...extra}>
      <Media src={v.thumb_url} alt={v.title} icon="reels" />
      <span className="x-vplay"><SIcon name="play" size={18} /></span>
      <span className="x-vmeta">
        <span className="x-vplat"><SIcon name="reels" size={13} /> {v.platform || 'Reels'}</span>
        <h4>{v.title}</h4>
        {v.views_label ? <span className="x-vviews"><SIcon name="play" size={10} /> {v.views_label}</span> : null}
      </span>
    </Tag>
  );
}

export function ArticleCard({ a, full = false }) {
  const href = a.slug ? `/article/${a.slug}` : '/artikel';
  return (
    <Link href={href} className={`x-card x-ac${full ? ' x-ac-full' : ''}`}>
      <div className="x-ac-img">
        <Media src={a.cover_media_url} video={a.cover_media_type === 'video'} alt={a.title} icon="file" />
        {full && a.category ? <span className="x-tag">{a.category}</span> : null}
      </div>
      <div className="x-ac-body">
        <div className="x-ac-meta">
          <span>{fmtDate(a.published_at)}</span>
          {!full && a.category ? <><span>|</span><span className="c">{a.category}</span></> : null}
          {full && a.read_minutes ? <span>• {a.read_minutes} menit baca</span> : null}
        </div>
        <h3>{a.title}</h3>
        {a.excerpt ? <p>{a.excerpt}</p> : null}
        <span className="x-ac-link">Baca Artikel <SIcon name="arrow" size={14} /></span>
      </div>
      <SIcon name="arrow" size={16} className="x-ac-go" />
    </Link>
  );
}

export function EventCard({ e }) {
  return (
    <Link href={`/event/${e.slug}`} className="x-card x-ec">
      <div className="x-ec-img">
        <Media src={e.cover_url} alt={e.title} icon="calendar" />
        {e.category ? <span className="x-tag">{e.category}</span> : null}
        {e.event_date ? <span className="x-date"><SIcon name="calendar" size={12} /> {fmtDate(e.event_date)}</span> : null}
      </div>
      <div className="x-ec-body">
        <h3>{e.title}</h3>
        {e.venue || e.city ? <div className="x-ec-loc"><SIcon name="pin" size={13} /> {e.city || e.venue}</div> : null}
        {e.summary ? <p>{e.summary}</p> : null}
        <span className="x-circle"><SIcon name="arrow" size={14} /></span>
      </div>
    </Link>
  );
}

export { fmtRange };
