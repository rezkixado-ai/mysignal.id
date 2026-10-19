import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEvent, getSettings, waLink, fmtRange } from '../../../../lib/xdata.js';
import Media from '../../../../components/site/Media.jsx';
import SIcon from '../../../../components/site/SIcon.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const e = await getEvent(params.slug);
  if (!e) return { title: 'Event tidak ditemukan' };
  return { title: `${e.title} — Event Xignal`, description: e.summary || e.title, alternates: { canonical: `/event/${e.slug}` } };
}

export default async function EventDetail({ params }) {
  const [e, s] = await Promise.all([getEvent(params.slug), getSettings()]);
  if (!e) notFound();
  const reg = e.register_url && e.register_url !== '#' ? e.register_url : waLink(s, `Halo Xignal, saya ingin mendaftar ${e.title}.`);
  const paras = String(e.description || '').split('\n').map((x) => x.trim()).filter(Boolean);

  return (
    <div className="x-wrap x-detail">
      <div className="x-card x-detail-img" style={{ aspectRatio: '16/10', padding: 0 }}>
        <Media src={e.cover_url} alt={e.title} icon="calendar" style={{ objectFit: 'cover' }} />
      </div>
      <div>
        <nav className="x-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><SIcon name="chevronR" size={12} /><Link href="/event">Event</Link></nav>
        {e.category ? <span className="x-tag">{e.category}</span> : null}
        <h1>{e.title}</h1>
        <div className="x-facts">
          <div className="x-card x-fact"><SIcon name="calendar" size={18} /> {fmtRange(e.event_date, e.end_date)}</div>
          {(e.venue || e.city) ? <div className="x-card x-fact"><SIcon name="pin" size={18} /> {e.venue || e.city}</div> : null}
        </div>
        {e.summary ? <p className="x-detail-desc">{e.summary}</p> : null}
        {paras.map((t, i) => <p className="x-detail-desc" key={i}>{t}</p>)}
        <div className="x-detail-cta">
          <a href={reg} target="_blank" rel="noreferrer" className="x-btn x-btn-grad">DAFTAR SEKARANG</a>
          <Link href="/event" className="x-btn x-btn-line"><SIcon name="chevronL" size={14} /> SEMUA EVENT</Link>
        </div>
      </div>
    </div>
  );
}
