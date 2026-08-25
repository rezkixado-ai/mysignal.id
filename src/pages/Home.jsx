import HeroSlider from '../components/HeroSlider.jsx';

export default function Home() {
  return (
    <main>
      <HeroSlider />

      <section>
        <div className="wrap">
          <span className="eyebrow">Our Signal</span>
          <h2 style={{ fontSize: 'clamp(24px,3vw,34px)', marginTop: 14, maxWidth: 640 }}>
            Technology is changing faster than most people can follow.
          </h2>
        </div>
      </section>

      {/* Gallery, Latest Signals, Sources, Topics and Deeper Signals sections
          will become CMS-driven in the next build phase, reading from
          /api/gallery and /api/articles the same way HeroSlider reads
          from /api/hero-slides. */}
    </main>
  );
}
