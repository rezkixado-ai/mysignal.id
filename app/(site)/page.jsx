import Link from 'next/link';
import {
  getSettings, getHeroSlides, getProducts, getVideos, getArticleList, getBrands, waLink
} from '../../lib/xdata.js';
import HeroArt from '../../components/site/HeroArt.jsx';
import HeroBanner from '../../components/site/HeroBanner.jsx';
import SIcon from '../../components/site/SIcon.jsx';
import SectionHead from '../../components/site/SectionHead.jsx';
import CountUp from '../../components/site/CountUp.jsx';
import HScroll from '../../components/site/HScroll.jsx';
import Reveal from '../../components/site/Reveal.jsx';
import ProductBrowser from '../../components/site/ProductBrowser.jsx';
import { VideoCard, ArticleCard } from '../../components/site/Cards.jsx';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Xignal — Kabel Fiber Optik & Perangkat Jaringan',
  description: 'Xignal menyediakan kabel fiber optik dan perangkat jaringan berkualitas untuk konektivitas tanpa batas di seluruh Indonesia.',
  alternates: { canonical: '/' }
};

const TICKER = ['XIGNAL', 'CONNECTIVITY', 'FIBER OPTIC', 'NETWORK', 'INFRASTRUCTURE'];

export default async function Home() {
  const settings = await getSettings();
  const [heroSlides, products, videos, articles, brands] = await Promise.all([
    getHeroSlides(settings),
    getProducts({ featured: true, limit: 4 }),
    getVideos(8),
    getArticleList({ limit: 6 }),
    getBrands()
  ]);
  const s = settings;
  const wa = waLink(s, 'Halo Xignal, saya ingin penawaran produk dan solusi jaringan.');

  const stats = [
    { icon: 'cube', v: s.stat_1_value, l: s.stat_1_label, sub: s.stat_1_sub },
    { icon: 'network', v: s.stat_2_value, l: s.stat_2_label, sub: s.stat_2_sub },
    { icon: 'headset', v: s.stat_3_value, l: s.stat_3_label, sub: s.stat_3_sub }
  ];

  return (
    <>
      {/* HERO */}
      <section className={`x-hero${heroSlides.length ? ' has-bg' : ''}`}>
        {heroSlides.length > 0 && <div className="x-hero-bg"><HeroBanner slides={heroSlides} bleed /></div>}
        <div className={`x-wrap x-hero-in`}>
          <div className="x-hero-copy">
            <p className="x-eyebrow">{s.hero_eyebrow.split('•').map((t, i, a) => (
              <span key={i}>{t.trim()}{i < a.length - 1 ? <i>•</i> : null}</span>
            ))}</p>
            <h1>
              <span>{s.hero_title_1}</span>
              <span className="x-grad-text">{s.hero_title_2}</span>
            </h1>
            <p className="x-lead">{s.hero_desc}</p>
            <div className="x-hero-cta">
              <Link href="/produk" className="x-btn x-btn-grad">JELAJAHI PRODUK <SIcon name="arrow" size={16} /></Link>
              <Link href="/video" className="x-btn x-btn-line"><SIcon name="play" size={14} /> LIHAT SOLUSI</Link>
            </div>
          </div>
          {!heroSlides.length && <div className="x-hero-art"><HeroArt slides={[]} /></div>}
          <div className="x-hero-side">{s.hero_side_text}</div>
        </div>
      </section>

      {/* STATS */}
      <div className="x-stats">
        <div className="x-wrap x-stats-in">
          {stats.map((t) => (
            <div className="x-stat" key={t.l}>
              <SIcon name={t.icon} sw={1.4} />
              <div><b><CountUp value={t.v} /></b><strong>{t.l}</strong><span>{t.sub}</span></div>
            </div>
          ))}
          <Link href="/video" className="x-stat x-stat-video">
            <span className="x-playring"><SIcon name="play" /></span>
            <div><b>VIDEO</b><strong>PERKENALAN</strong><span style={{ color: 'var(--x-cyan)' }}>LIHAT SEKARANG →</span></div>
          </Link>
        </div>
      </div>

      {/* VISI & MISI */}
      <section className="x-sec">
        <div className="x-wrap x-vm-grid">
          <Reveal className="x-card x-vm">
            <div className="x-vm-art"><SIcon name="globe" sw={1} size={90} /></div>
            <div><small>VISI</small><h3>{s.vision_title}</h3><p>{s.vision_body}</p></div>
            <Link href="/tentang" className="x-circle" aria-label="Selengkapnya tentang kami"><SIcon name="chevronR" size={16} /></Link>
          </Reveal>
          <Reveal className="x-card x-vm" delay={120}>
            <div className="x-vm-art"><SIcon name="target" sw={1} size={90} /></div>
            <div><small>MISI</small><h3>{s.mission_title}</h3><p>{s.mission_body}</p></div>
            <Link href="/tentang" className="x-circle" aria-label="Selengkapnya tentang kami"><SIcon name="chevronR" size={16} /></Link>
          </Reveal>
        </div>
      </section>

      {/* TICKER */}
      <div className="x-tick" aria-hidden="true">
        <div className="x-tick-track">
          {[0, 1, 2, 3].flatMap((k) => TICKER.map((t, i) => [
            <span key={`${k}-${i}`}>{t}</span>, <span className="dot" key={`${k}-${i}d`}>•</span>
          ]))}
        </div>
      </div>

      {/* VIDEO */}
      <section className="x-sec">
        <div className="x-wrap x-split">
          <div className="x-split-intro">
            <SectionHead title="Dari Lapangan" desc="Melihat langsung bagaimana produk Xignal digunakan di berbagai proyek jaringan di seluruh Indonesia." href="/video" cta="Lihat semua video" />
            <Link href="/video" className="x-btn x-btn-line">LIHAT SEMUA VIDEO <SIcon name="arrow" size={14} /></Link>
          </div>
          <div className="x-split-body">
            <HScroll>{videos.map((v) => <VideoCard v={v} key={v.id} />)}</HScroll>
          </div>
        </div>
      </section>

      {/* PRODUK */}
      <section className="x-sec" id="produk">
        <div className="x-wrap x-split">
          <div className="x-split-intro">
            <SectionHead title="Produk Pilihan" desc="Berbagai kabel fiber optik dan perangkat jaringan berkualitas untuk kebutuhan proyek Anda." href="/produk" cta="Lihat semua produk" />
            <Link href="/produk" className="x-btn x-btn-line">LIHAT SEMUA PRODUK <SIcon name="arrow" size={14} /></Link>
          </div>
          <div className="x-split-body">
            <ProductBrowser products={products} home />
            <Link href="/produk" className="x-btn x-btn-line x-btn-block x-more-m">LIHAT SEMUA PRODUK <SIcon name="arrow" size={14} /></Link>
          </div>
        </div>
      </section>

      {/* ARTIKEL */}
      <section className="x-sec">
        <div className="x-wrap x-split">
          <div className="x-split-intro">
            <SectionHead title="Artikel Terbaru" desc="Informasi, panduan dan insight seputar fiber optik dan teknologi jaringan." href="/artikel" cta="Lihat semua artikel" />
            <Link href="/artikel" className="x-btn x-btn-line">LIHAT SEMUA ARTIKEL <SIcon name="arrow" size={14} /></Link>
          </div>
          <div className="x-split-body">
            <div className="x-agrid x-agrid-5">
              {articles.items.map((a) => <ArticleCard a={a} key={a.id} />)}
            </div>
            <Link href="/artikel" className="x-btn x-btn-line x-btn-block x-ac-more">LIHAT SEMUA ARTIKEL <SIcon name="arrow" size={14} /></Link>
          </div>
        </div>
      </section>

      {/* BRAND */}
      <section className="x-sec">
        <div className="x-wrap x-brands-in">
          <SectionHead title="Brand Kami" desc="Didukung oleh brand terpercaya di industri jaringan." />
          <div className="x-ribbon" aria-label="Brand kami">
            <div className="x-ribbon-track">
              {[0, 1].map((g) => (
                <div className="x-ribbon-group" key={g} aria-hidden={g === 1 ? 'true' : undefined}>
                  {Array.from({ length: Math.max(1, Math.ceil(8 / Math.max(brands.length, 1))) }).flatMap((_, r) => brands.map((b) => {
                    const n = String(b.name || '').toLowerCase();
                    const tone = b.logo_url ? '' : n.includes('falcom') ? ' t-falcom' : n.includes('fastlink') ? ' t-fastlink' : n.includes('xignal') || n.includes('xi:gnal') ? ' t-xignal' : '';
                    return (
                      <div className={`x-bitem${tone}`} key={`${g}-${r}-${b.id}`}>
                        <span className="x-bi">{b.logo_url ? <img src={b.logo_url} alt={b.name} loading="lazy" /> : b.name}</span>
                      </div>
                    );
                  }))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="x-cta">
        <div className="x-wrap x-cta-in">
          <div className="x-cta-txt">
            <small>SIAP MEMBANGUN</small>
            <h2>KONEKTIVITAS ANDA?</h2>
          </div>
          <p>Hubungi tim sales kami untuk mendapatkan penawaran terbaik dan solusi yang sesuai dengan kebutuhan proyek Anda.</p>
          <a href={wa} target="_blank" rel="noreferrer" className="x-btn x-btn-grad"><SIcon name="whatsapp" size={18} /> HUBUNGI SALES <SIcon name="arrow" size={16} /></a>
        </div>
      </div>
    </>
  );
}
