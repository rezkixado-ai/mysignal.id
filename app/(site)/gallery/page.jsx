export const metadata = {
  title: 'Gallery',
  description: 'The MySignal visual archive — technology photography, illustration, and data visualization.',
  alternates: { canonical: '/gallery' }
};

export default function Gallery() {
  return (
    <main>
      <section>
        <div className="wrap">
          <span className="eyebrow">Coming Soon</span>
          <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', marginTop: 14 }}>Gallery</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: 12, maxWidth: 480 }}>
            The full gallery page is next up — for now, browse the Signal Gallery preview on the homepage.
          </p>
        </div>
      </section>
    </main>
  );
}
