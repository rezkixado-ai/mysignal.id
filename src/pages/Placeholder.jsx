export default function Placeholder({ title }) {
  return (
    <main>
      <section>
        <div className="wrap">
          <span className="eyebrow">Coming Soon</span>
          <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', marginTop: 14 }}>{title}</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: 12, maxWidth: 480 }}>
            This page will be built in the next phase, wired to the same CMS as the hero slider.
          </p>
        </div>
      </section>
    </main>
  );
}
