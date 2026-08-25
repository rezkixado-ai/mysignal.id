'use client';

export default function NewsletterForm() {
  return (
    <form className="cta-form" onSubmit={(e) => { e.preventDefault(); e.target.reset(); }}>
      <input type="email" required placeholder="you@email.com" aria-label="Email address" />
      <button className="btn" type="submit">
        Subscribe
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
    </form>
  );
}
