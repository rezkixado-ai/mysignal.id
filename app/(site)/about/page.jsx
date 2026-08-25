export const metadata = {
  title: 'About MySignal',
  description: 'MySignal exists to make complex technology easier to understand — cybersecurity, cloud, network, AI and big tech, decoded.',
  alternates: { canonical: '/about' }
};

export default function About() {
  return (
    <main>
      <section>
        <div className="wrap">
          <span className="eyebrow">Coming Soon</span>
          <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', marginTop: 14 }}>About MySignal</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: 12, maxWidth: 480 }}>
            Full About page coming soon.
          </p>
        </div>
      </section>
    </main>
  );
}
