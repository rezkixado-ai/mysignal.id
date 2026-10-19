import Link from 'next/link';
import { getSettings, getTimeline, getFounders, waLink } from '../../../lib/xdata.js';
import Timeline from '../../../components/site/Timeline.jsx';
import FounderCarousel from '../../../components/site/FounderCarousel.jsx';
import SIcon from '../../../components/site/SIcon.jsx';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Tentang — Kenapa The Xi:gnal?',
  description: 'Perjalanan, visi dan tim di balik Xignal — konektivitas yang lebih baik untuk Indonesia.',
  alternates: { canonical: '/tentang' }
};

export default async function TentangPage() {
  const [s, timeline, founders] = await Promise.all([getSettings(), getTimeline(), getFounders()]);
  return (
    <>
      <header className="x-phead">
        <div className="x-wrap">
          <nav className="x-crumb" aria-label="Breadcrumb"><Link href="/">Home</Link><SIcon name="chevronR" size={12} /><span>Tentang</span></nav>
          <h1>{s.about_hero_title}</h1>
          <p>{s.about_hero_desc}</p>
        </div>
      </header>

      <section className="x-sec">
        <div className="x-wrap">
          <div className="x-sh" style={{ alignItems: 'center' }}>
            <div className="x-sh-main"><h2 className="x-h2">Perjalanan Kami</h2><span className="x-bar" style={{ marginBottom: 0 }} /></div>
            <p className="x-sh-desc" style={{ maxWidth: 260, textAlign: 'right', fontSize: 12.5 }}>Dari rasa ingin tahu, menuju konektivitas yang lebih baik.</p>
          </div>
          <Timeline items={timeline} />
        </div>
      </section>

      <section className="x-sec">
        <div className="x-wrap">
          <div className="x-sh" style={{ alignItems: 'center' }}>
            <div className="x-sh-main"><h2 className="x-h2">Founder</h2><span className="x-bar" style={{ marginBottom: 0 }} /></div>
            <p className="x-sh-desc" style={{ maxWidth: 260, textAlign: 'right', fontSize: 12.5 }}>Digerakkan oleh rasa ingin tahu dan semangat berbagi.</p>
          </div>
          <FounderCarousel founders={founders} />
        </div>
      </section>

      <section className="x-sec">
        <div className="x-wrap">
          <div className="x-card x-about-cta">
            <div>
              <small>BERSAMA XI:GNAL</small>
              <h2>{s.about_cta_title}</h2>
              <p>{s.about_cta_body}</p>
            </div>
            <a href={waLink(s, 'Halo Xignal, saya ingin berdiskusi.')} target="_blank" rel="noreferrer" className="x-btn x-btn-grad"><SIcon name="whatsapp" size={18} /> HUBUNGI KAMI <SIcon name="arrow" size={14} /></a>
          </div>
        </div>
      </section>
    </>
  );
}
