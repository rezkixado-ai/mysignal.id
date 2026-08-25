import { useEffect, useState } from 'react';
import HeroSlider from '../components/HeroSlider.jsx';
import { getGallery, getArticles } from '../lib/api.js';

const SPAN_CLASS = { big: 'g1', wide: 'g2', normal: 'g3' };

const TOPICS = [
  { c: '#3d7bfb', title: 'Cybersecurity', desc: 'Protecting the digital world from threats', icon: 'M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6z' },
  { c: '#25e0d8', title: 'Cloud', desc: 'Building the future in the cloud', icon: 'M7 18a4 4 0 0 1-1-7.9A5 5 0 0 1 15.9 8 4.5 4.5 0 0 1 17 17H7z' },
  { c: '#6ea1ff', title: 'Network', desc: 'Connecting the world, one signal at a time', icon: 'M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18' },
  { c: '#34d399', title: 'Fiber Optic', desc: 'The fastest paths for our data', icon: 'M4 12h4l2-5 3 10 2-5h5' },
  { c: '#f5b942', title: 'AI', desc: 'Intelligence shaping the future', icon: 'M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0 0 10v1a3 3 0 0 0 6 0' },
  { c: '#ef4a4a', title: 'Big Tech', desc: 'Moves, strategies, and impacts', icon: 'M4 21V9l6-4 6 4v12M10 21v-6h4v6M4 9h16' },
  { c: '#3d7bfb', title: 'Tech Business', desc: 'Business, economy, and innovation', icon: 'M4 19V9l5-3 5 3v10M14 19V6l6 3v10' },
  { c: '#25e0d8', title: 'Hardware', desc: 'Devices, chips, and everything inside', icon: 'M4 9h2M4 15h2M18 9h2M18 15h2M9 4v2M15 4v2M9 18v2M15 18v2' }
];

const SOURCES = ['Reuters', 'WIRED', 'The Verge', 'Cisco', 'AWS', 'Google', 'Microsoft', 'IBM', 'Cloudflare'];

export default function Home() {
  const [gallery, setGallery] = useState(null);
  const [news, setNews] = useState(null);       // latest 'news' type articles
  const [deeper, setDeeper] = useState(null);    // analysis/explainer/insight/opinion articles

  useEffect(() => {
    getGallery().then(setGallery).catch(() => setGallery([]));
    getArticles({ limit: '20' }).then((all) => {
      setNews(all.filter((a) => a.article_type === 'news').slice(0, 4));
      setDeeper(all.filter((a) => a.article_type !== 'news').slice(0, 3));
    }).catch(() => { setNews([]); setDeeper([]); });
  }, []);

  const dateFmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <main>
      <HeroSlider />

      {/* ============ VISION / MISSION ============ */}
      <section>
        <div className="wrap">
          <div className="signal-block">
            <div className="lede">
              <span className="eyebrow">Our Signal</span>
              <h2>Technology is changing faster than most people can follow.</h2>
            </div>
            <div className="vm-grid">
              <div className="vm-item">
                <svg className="vm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>
                <h3>Vision</h3>
                <p>Menjadi media teknologi yang membantu masyarakat memahami perubahan dunia digital dengan perspektif yang kredibel, relevan, dan mudah dipahami.</p>
              </div>
              <div className="vm-item">
                <svg className="vm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 15l4-8 4 5 3-4 3 7" /><path d="M4 19h16" /></svg>
                <h3>Mission</h3>
                <p>Mengubah informasi teknologi yang kompleks menjadi insight yang jelas, kontekstual, dan relevan dengan kehidupan nyata.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap"><div className="divider-signal" /></div>

      {/* ============ GALLERY ============ */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div><span className="eyebrow">Visual Archive</span><h2>Signal Gallery</h2></div>
            <a href="/gallery" className="link-arrow">View Gallery
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
          <div className="gallery-grid">
            {gallery && gallery.length > 0 ? (
              gallery.slice(0, 6).map((it) => (
                <a href="/gallery" className={SPAN_CLASS[it.layout_span] || 'g3'} key={it.id}>
                  {it.media_type === 'video'
                    ? <video src={it.media_url} muted loop autoPlay playsInline />
                    : <img src={it.media_url} alt={it.title || it.tag || 'Gallery item'} loading="lazy" />}
                  {it.tag && <span className="g-tag">{it.tag}</span>}
                </a>
              ))
            ) : (
              <>
                <a href="/gallery" className="g1"><img src="https://picsum.photos/seed/mysignal-g1/700/700" alt="Server room corridor" loading="lazy" /><span className="g-tag">Infrastructure</span></a>
                <a href="/gallery" className="g2"><img src="https://picsum.photos/seed/mysignal-g2/700/350" alt="Fiber optic light streaks" loading="lazy" /><span className="g-tag">Fiber Optic</span></a>
                <a href="/gallery" className="g3"><img src="https://picsum.photos/seed/mysignal-g3/350/350" alt="Cloud computing illustration" loading="lazy" /><span className="g-tag">Cloud</span></a>
                <a href="/gallery" className="g4"><img src="https://picsum.photos/seed/mysignal-g4/350/350" alt="Satellite dishes at dusk" loading="lazy" /><span className="g-tag">Network</span></a>
                <a href="/gallery" className="g5"><img src="https://picsum.photos/seed/mysignal-g5/700/350" alt="AI chip illustration" loading="lazy" /><span className="g-tag">AI</span></a>
                <a href="/gallery" className="g3"><img src="https://picsum.photos/seed/mysignal-g6/350/350" alt="Analyst monitoring screens" loading="lazy" /><span className="g-tag">Cybersecurity</span></a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============ LATEST SIGNALS ============ */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div><span className="eyebrow">Breaking</span><h2>Latest Signals</h2></div>
            <a href="/news" className="link-arrow">All Signals
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
          <div className="news-grid">
            {news && news.length > 0 ? (
              <>
                <a href={`/article/${news[0].slug}`} className="news-feature">
                  {news[0].cover_media_type === 'video'
                    ? <video src={news[0].cover_media_url} muted loop autoPlay playsInline />
                    : <img src={news[0].cover_media_url} alt={news[0].title} loading="lazy" />}
                  <div className="nf-content">
                    <span className="eyebrow"><span className="live-dot" /> {news[0].category}</span>
                    <h3>{news[0].title}</h3>
                    {news[0].excerpt && <p>{news[0].excerpt}</p>}
                    <div className="meta-row"><span>{dateFmt(news[0].published_at)}</span><span>·</span><span>{news[0].read_minutes} min read</span></div>
                  </div>
                </a>
                <div className="news-side">
                  {news.slice(1, 4).map((a) => (
                    <a href={`/article/${a.slug}`} className="news-card" key={a.id}>
                      <div className="thumb">
                        {a.cover_media_type === 'video'
                          ? <video src={a.cover_media_url} muted />
                          : <img src={a.cover_media_url} alt={a.title} loading="lazy" />}
                      </div>
                      <div><span className="cat">{a.category}</span><h4>{a.title}</h4><div className="meta-row"><span>{dateFmt(a.published_at)}</span><span>·</span><span>{a.read_minutes} min read</span></div></div>
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <>
                <a href="/news" className="news-feature">
                  <img src="https://picsum.photos/seed/mysignal-news1/800/700" alt="Circuit board with a lock icon" loading="lazy" />
                  <div className="nf-content">
                    <span className="eyebrow"><span className="live-dot" /> Cybersecurity</span>
                    <h3>Critical Vulnerability Found in Popular Software</h3>
                    <p>Millions of users are at risk. Here's what you need to know to protect yourself right now.</p>
                    <div className="meta-row"><span>25 Aug 2026</span><span>·</span><span>5 min read</span></div>
                  </div>
                </a>
                <div className="news-side">
                  <a href="/news" className="news-card">
                    <div className="thumb"><img src="https://picsum.photos/seed/mysignal-news2/200/200" alt="Clouds in the sky" loading="lazy" /></div>
                    <div><span className="cat">Cloud</span><h4>AWS Outage: What Really Happened?</h4><div className="meta-row"><span>24 Aug 2026</span><span>·</span><span>4 min read</span></div></div>
                  </a>
                  <a href="/news" className="news-card">
                    <div className="thumb"><img src="https://picsum.photos/seed/mysignal-news3/200/200" alt="Undersea fiber optic cable" loading="lazy" /></div>
                    <div><span className="cat">Network</span><h4>Under the Sea: The World's Internet Backbone</h4><div className="meta-row"><span>23 Aug 2026</span><span>·</span><span>6 min read</span></div></div>
                  </a>
                  <a href="/news" className="news-card">
                    <div className="thumb"><img src="https://picsum.photos/seed/mysignal-news4/200/200" alt="Google office building" loading="lazy" /></div>
                    <div><span className="cat">Big Tech</span><h4>Google's New Move in the AI Race</h4><div className="meta-row"><span>22 Aug 2026</span><span>·</span><span>4 min read</span></div></div>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============ SOURCES MARQUEE ============ */}
      <section className="sources">
        <div className="wrap"><span className="eyebrow" style={{ justifyContent: 'center' }}>Where We Get Our Signals</span></div>
        <div className="marquee" style={{ marginTop: 26 }}>
          <div className="marquee-track">
            {[...SOURCES, ...SOURCES].map((s, i) => <span className="source-item" key={i}>{s}</span>)}
          </div>
        </div>
        <div className="wrap"><p className="sources-note">Cited &amp; referenced in our editorial research — not sponsors or partners.</p></div>
      </section>

      {/* ============ TOPICS ============ */}
      <section>
        <div className="wrap">
          <div className="section-head"><div><span className="eyebrow">Categories</span><h2>Explore the Signal</h2></div></div>
          <div className="topics-grid">
            {TOPICS.map((t) => (
              <a href="/news" className="topic-card" style={{ '--c': t.c }} key={t.title}>
                <div className="topic-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d={t.icon} /></svg></div>
                <div><h3>{t.title}</h3><p>{t.desc}</p></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DEEPER SIGNALS ============ */}
      <section>
        <div className="wrap">
          <div className="section-head">
            <div><span className="eyebrow">Analysis &amp; Explainers</span><h2>Deeper Signals</h2></div>
            <a href="/news" className="link-arrow">Explore All Articles
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
          <div className="articles-grid">
            {deeper && deeper.length > 0 ? (
              deeper.map((a, i) => (
                <a href={`/article/${a.slug}`} className={`article-card${i === 0 ? ' featured' : ''}`} key={a.id}>
                  <div className="article-thumb">
                    {a.cover_media_type === 'video'
                      ? <video src={a.cover_media_url} muted loop autoPlay playsInline />
                      : <img src={a.cover_media_url} alt={a.title} loading="lazy" />}
                  </div>
                  <div className="article-body">
                    <span className="eyebrow">{a.article_type}</span>
                    <h3>{a.title}</h3>
                    {i === 0 && a.excerpt && <p>{a.excerpt}</p>}
                    <div className="meta-row"><span>{dateFmt(a.published_at)}</span><span>·</span><span>{a.read_minutes} min read</span></div>
                  </div>
                </a>
              ))
            ) : (
              <>
                <a href="/news" className="article-card featured">
                  <div className="article-thumb"><img src="https://picsum.photos/seed/mysignal-art1/700/560" alt="Clouds representing cloud infrastructure" loading="lazy" /></div>
                  <div className="article-body">
                    <span className="eyebrow">Analysis</span>
                    <h3>Why Cloud Infrastructure Is Becoming a Strategic Asset</h3>
                    <p>Cloud is no longer just IT — it's the foundation of modern business and innovation.</p>
                    <div className="meta-row"><span>24 Aug 2026</span><span>·</span><span>8 min read</span></div>
                  </div>
                </a>
                <a href="/news" className="article-card">
                  <div className="article-thumb"><img src="https://picsum.photos/seed/mysignal-art2/500/320" alt="Circuit board with padlock" loading="lazy" /></div>
                  <div className="article-body"><span className="eyebrow">Explainer</span><h3>Zero-Day Attack: How It Works and How to Prevent It</h3><div className="meta-row"><span>23 Aug 2026</span><span>·</span><span>7 min read</span></div></div>
                </a>
                <a href="/news" className="article-card">
                  <div className="article-thumb"><img src="https://picsum.photos/seed/mysignal-art3/500/320" alt="City skyline" loading="lazy" /></div>
                  <div className="article-body"><span className="eyebrow">Insight</span><h3>5G, 6G, and Beyond: What's Next for Mobile Networks?</h3><div className="meta-row"><span>22 Aug 2026</span><span>·</span><span>6 min read</span></div></div>
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <section>
        <div className="wrap">
          <div className="cta-strip">
            <div>
              <h2>Stay on Signal.</h2>
              <p>One email a week — the clearest technology signals, decoded. No noise.</p>
            </div>
            <form className="cta-form" onSubmit={(e) => { e.preventDefault(); e.target.reset(); }}>
              <input type="email" required placeholder="you@email.com" aria-label="Email address" />
              <button className="btn" type="submit">
                Subscribe
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
