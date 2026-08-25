import { useEffect, useRef, useState } from 'react';
import { getHeroSlides } from '../lib/api.js';

const KEN_BURNS_STYLES = `
@keyframes kb-zoom-in { from { transform: scale(1); } to { transform: scale(1.14); } }
@keyframes kb-zoom-out { from { transform: scale(1.14); } to { transform: scale(1); } }
@keyframes kb-pan-left { from { transform: scale(1.1) translateX(2%); } to { transform: scale(1.1) translateX(-2%); } }
@keyframes kb-pan-right { from { transform: scale(1.1) translateX(-2%); } to { transform: scale(1.1) translateX(2%); } }

.hs-root{ position:relative; overflow:hidden; border-bottom:1px solid var(--border-soft); }
.hs-slider{ position:relative; min-height:560px; display:grid; }
.hs-slide{
  grid-area:1/1; display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center;
  opacity:0; visibility:hidden; transform:translateY(14px);
  transition:opacity .6s ease, transform .6s ease, visibility .6s; padding:64px 0 52px;
}
.hs-slide.active{ opacity:1; visibility:visible; transform:translateY(0); }
.hs-copy{ max-width:480px; }
.hs-copy .eyebrow{ margin-bottom:18px; }
.hs-copy h1{ font-size:clamp(30px,4.2vw,48px); margin-bottom:16px; }
.hs-copy p{ color:var(--text-dim); font-size:15.5px; margin-bottom:26px; max-width:420px; }
.hs-media{ position:relative; border-radius:var(--radius); overflow:hidden; aspect-ratio:4/3; border:1px solid var(--border); background:#000; }
.hs-media .hs-media-inner{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.hs-slide.active .hs-media .hs-media-inner.kb{ animation-duration:7s; animation-timing-function:ease-out; animation-fill-mode:forwards; }
.hs-media::after{ content:""; position:absolute; inset:0; background:linear-gradient(180deg, rgba(5,7,13,0) 40%, rgba(5,7,13,.75) 100%); pointer-events:none; }
.hs-tag{ position:absolute; left:16px; bottom:16px; z-index:2; font-family:var(--font-mono); font-size:11px; letter-spacing:.08em; text-transform:uppercase; background:rgba(5,7,13,.7); border:1px solid var(--border); padding:6px 10px; border-radius:999px; display:flex; align-items:center; gap:8px; }
.hs-live{ width:7px; height:7px; border-radius:50%; background:var(--red); animation:hs-pulse 1.8s infinite; }
@keyframes hs-pulse{ 0%{box-shadow:0 0 0 0 rgba(239,74,74,.55);} 70%{box-shadow:0 0 0 9px rgba(239,74,74,0);} 100%{box-shadow:0 0 0 0 rgba(239,74,74,0);} }
.hs-controls{ display:flex; align-items:center; justify-content:center; gap:18px; padding:0 0 40px; }
.hs-arrow{ width:38px; height:38px; border-radius:50%; border:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:center; color:var(--text-dim); transition:.2s; }
.hs-arrow:hover{ color:var(--text); border-color:var(--blue-2); }
.hs-dots{ display:flex; gap:8px; }
.hs-dot{ width:8px; height:8px; border-radius:50%; background:var(--text-faint); border:none; transition:.25s; }
.hs-dot.active{ background:var(--blue-2); width:22px; border-radius:6px; }
@media (max-width:860px){ .hs-slide{ grid-template-columns:1fr; padding-bottom:20px; } .hs-media{ order:-1; aspect-ratio:16/10; } .hs-slider{ min-height:auto; } }
`;

const KB_ANIM = { 'zoom-in': 'kb-zoom-in', 'zoom-out': 'kb-zoom-out', 'pan-left': 'kb-pan-left', 'pan-right': 'kb-pan-right', none: 'none' };

function SlideMedia({ slide, active }) {
  const kbAnim = KB_ANIM[slide.ken_burns] || KB_ANIM['zoom-in'];
  const style = kbAnim !== 'none' ? { animationName: kbAnim } : {};
  const cls = `hs-media-inner${kbAnim !== 'none' ? ' kb' : ''}`;

  if (slide.media_type === 'video') {
    return (
      <video
        className={cls}
        style={style}
        src={slide.media_url}
        autoPlay muted loop playsInline
        // eslint-disable-next-line react/no-unknown-property
        disablePictureInPicture
      />
    );
  }
  return <img className={cls} style={style} src={slide.media_url} alt={slide.title} loading={active ? 'eager' : 'lazy'} />;
}

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const timer = useRef(null);
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    getHeroSlides().then(setSlides).catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (reduceMotion || slides.length < 2) return;
    clearInterval(timer.current);
    timer.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6500);
    return () => clearInterval(timer.current);
  }, [slides, current, reduceMotion]);

  if (!slides.length) return null;

  const goTo = (i) => setCurrent((i + slides.length) % slides.length);

  return (
    <section className="hs-root" style={{ padding: 0 }}>
      <style>{KEN_BURNS_STYLES}</style>
      <div className="wrap">
        <div className="hs-slider">
          {slides.map((s, i) => (
            <article className={`hs-slide${i === current ? ' active' : ''}`} key={s.id}>
              <div className="hs-copy">
                <span className="eyebrow">{s.eyebrow}</span>
                <h1>{s.title}</h1>
                {s.description && <p>{s.description}</p>}
                <a href={s.cta_url || '#'} className="btn">
                  {s.cta_label || 'Read Article'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </a>
              </div>
              <div className="hs-media">
                <SlideMedia slide={s} active={i === current} />
                <span className="hs-tag"><span className="hs-live" /> Signal {String(i + 1).padStart(2, '0')}</span>
              </div>
            </article>
          ))}
        </div>

        {slides.length > 1 && (
          <div className="hs-controls">
            <button className="hs-arrow" onClick={() => goTo(current - 1)} aria-label="Previous slide">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <div className="hs-dots">
              {slides.map((s, i) => (
                <button key={s.id} className={`hs-dot${i === current ? ' active' : ''}`} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`} />
              ))}
            </div>
            <button className="hs-arrow" onClick={() => goTo(current + 1)} aria-label="Next slide">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
