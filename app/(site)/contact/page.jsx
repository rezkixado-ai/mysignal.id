export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the MySignal team.',
  alternates: { canonical: '/contact' }
};

export default function Contact() {
  return (
    <main>
      <section>
        <div className="wrap">
          <span className="eyebrow">Coming Soon</span>
          <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', marginTop: 14 }}>Contact Us</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: 12, maxWidth: 480 }}>
            Full contact form coming soon — for now, reach us at{' '}
            <a href="mailto:hello@mysignal.id" style={{ color: 'var(--blue-2)' }}>hello@mysignal.id</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
