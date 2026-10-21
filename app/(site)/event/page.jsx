import Link from 'next/link';
import { getEvents, getSettings, waLink, fmtRange } from '../../../lib/xdata.js';
import { EventCard } from '../../../components/site/Cards.jsx';
import Media from '../../../components/site/Media.jsx';
import SIcon from '../../../components/site/SIcon.jsx';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Event & Aktivitas',
  description: 'Berita, workshop, komunitas dan event teknologi untuk konektivitas yang lebih baik.',
  alternates: { canonical: '/event' }
};

export default async function EventPage() {
  const [events, s] = await Promise.all([getEvents(), getSettings()]);
  const featured = events.find((e) => e.is_featured) || events[0];
  const rest = events.filter((e) => e !== featured);

  return (
    <>
      <header className="x-phead">
        <div className="x-wrap">
          <nav className="x-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><SIcon name="chevronR" size={12} /><span>Event</span></nav>
          <h1>Event &amp; <span className="x-grad-text">Aktivitas</span></h1>
          <p>Berita, workshop, komunitas dan event teknologi untuk konektivitas yang lebih baik.</p>
        </div>
      </header>

      <section className="x-sec">
        <div className="x-wrap">
          {featured && (
            <div className="x-card x-feat x-feat-ev">
              <div className="x-feat-img"><Media src={featured.cover_url} alt={featured.title} icon="calendar" /></div>
              <div className="x-feat-body">
                <span className="x-kicker"><SIcon name="calendar" size={13} /> EVENT UTAMA</span>
                <h2>{featured.title}</h2>
                <div className="x-by" style={{ gap: '8px 18px' }}>
                  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><SIcon name="calendar" size={14} /> {fmtRange(featured.event_date, featured.end_date)}</span>
                  {featured.venue || featured.city ? <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><SIcon name="pin" size={14} /> {featured.venue || featured.city}</span> : null}
                </div>
                {featured.summary ? <p>{featured.summary}</p> : null}
                <div className="x-feat-actions">
                  <Link href={`/event/${featured.slug}`} className="x-btn x-btn-line">LIHAT DETAIL EVENT <SIcon name="arrow" size={14} /></Link>
                  {featured.register_url && featured.register_url !== '#' ? (
                    <a href={featured.register_url} target="_blank" rel="noreferrer" className="x-btn x-btn-grad">DAFTAR SEKARANG</a>
                  ) : (
                    <a href={waLink(s, `Halo Xignal, saya ingin mendaftar ${featured.title}.`)} target="_blank" rel="noreferrer" className="x-btn x-btn-grad">DAFTAR SEKARANG</a>
                  )}
                </div>
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <>
              <div className="x-sub">Event &amp; Berita Lainnya</div>
              <div className="x-egrid">{rest.map((e) => <EventCard e={e} key={e.id || e.slug} />)}</div>
            </>
          )}

          <div className="x-card x-collab">
            <div><strong>Punya event atau kolaborasi?</strong><span>Mari wujudkan bersama. Hubungi tim kami untuk informasi lebih lanjut.</span></div>
            <a className="x-btn x-btn-grad" href={waLink(s, 'Halo Xignal, saya ingin membahas kolaborasi event.')} target="_blank" rel="noreferrer">HUBUNGI KAMI <SIcon name="arrow" size={14} /></a>
          </div>
        </div>
      </section>
    </>
  );
}
