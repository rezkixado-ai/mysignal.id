'use client';

import { useEffect, useRef, useState } from 'react';

const KEN_BURNS_STYLES = `
@keyframes kb-zoom-in { from { transform: scale(1); } to { transform: scale(1.14); } }
@keyframes kb-zoom-out { from { transform: scale(1.14); } to { transform: scale(1); } }
@keyframes kb-pan-left { from { transform: scale(1.1) translateX(2%); } to { transform: scale(1.1) translateX(-2%); } }
@keyframes kb-pan-right { from { transform: scale(1.1) translateX(-2%); } to { transform: scale(1.1) translateX(2%); } }

.hs-root{ position:relative; overflow:hidden; }
.hs-slider{ position:relative; min-height:640px; height:88vh; max-height:820px; display:grid; }
.hs-slide{
  grid-area:1/1; position:relative; width:100%; height:100%;
  opacity:0; visibility:hidden; transition:opacity .9s ease, visibility .9s;
}
.hs-slide.active{ opacity:1; visibility:visible; }
.hs-media{ position:absolute; inset:0; overflow:hidden; background:#000; }
.hs-media .hs-media-inner{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.hs-media .hs-media-inner.kb{ animation-duration:9s; animation-timing-function:ease-out; animation-fill-mode:forwards; }
.hs-media::after{
  content:""; position:absolute; inset:0;
  background:
    linear-gradient(90deg, rgba(5,7,13,.92) 0%, rgba(5,7,13,.55) 38%, rgba(5,7,13,.15) 60%, rgba(5,7,13,.05) 100%),
    linear-gradient(0deg, rgba(5,7,13,.85) 0%, rgba(5,7,13,0) 34%);
  pointer-events:none;
}
.hs-copy{
  position:relative; z-index:2; max-width:560px; height:100%;
  display:flex; flex-direction:column; justify-content:flex-end;
  padding:64px 0 100px;
}
.hs-copy .eyebrow{ margin-bottom:18px; }
.hs-copy h1{ font-size:clamp(32px,4.6vw,54px); margin-bottom:16px; text-shadow:0 2px 24px rgba(0,0,0,.4); }
.hs-copy p{ color:var(--text-dim); font-size:15.5px; margin-bottom:26px; max-width:440px; }
@media (max-width:860px){ .hs-slider{ height:78vh; min-height:520px; } .hs-copy{ padding:48px 0 64px; } }
.hs-tag{ position:absolute; top:28px; right:0; z-index:2; font-family:var(--font-mono); font-size:11px; letter-spacing:.08em; text-transform:uppercase; background:rgba(5,7,13,.55); backdrop-filter:blur(6px); border:1px solid var(--border); padding:6px 10px; border-radius:999px; display:flex; align-items:center; gap:8px; }
.hs-live{ width:7px; height:7px; border-radius:50%; background:var(--red); animation:hs-pulse 1.8s infinite; }
@keyframes hs-pulse{ 0%{box-shadow:0 0 0 0 rgba(239,74,74,.55);} 70%{box-shadow:0 0 0 9px rgba(239,74,74,0);} 100%{box-shadow:0 0 0 0 rgba(239,74,74,0);} }
.hs-controls{ position:absolute; left:0; right:0; bottom:28px; z-index:2; display:flex; align-items:center; gap:18px; }
.hs-arrow{ width:38px; height:38px; border-radius:50%; border:1px solid var(--border); background:rgba(13,20,32,.6); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; color:var(--text-dim); transition:.2s; }
.hs-arrow:hover{ color:var(--text); border-color:var(--blue-2); }
.hs-dots{ display:flex; gap:8px; }
.hs-dot{ width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,.35); border:none; transition:.25s; }
.hs-dot.active{ background:var(--blue-2); width:22px; border-radius:6px; }
`;

const KB_ANIM = { 'zoom-in': 'kb-zoom-in', 'zoom-out': 'kb-zoom-out', 'pan-left': 'kb-pan-left', 'pan-right': 'kb-pan-right', none: 'none' };

function SlideMedia({ slide, active, restartKey }) {
  const kbAnim = KB_ANIM[slide.ken_burns] || KB_ANIM['zoom-in'];
  const style = active && kbAnim !== 'none' ? { animationName: kbAnim } : {};
  const cls = `hs-media-inner${active && kbAnim !== 'none' ? ' kb' : ''}`;
  const key = `${slide.id}-${restartKey}`;

  if (slide.media_type === 'video') {
    return (
      <video
        key={key} className={cls} style={style} src={slide.media_url}
        autoPlay muted loop playsInline disablePictureInPicture
      />
    );
  }
  return <img key={key} className={cls} style={style} src={slide.media_url} alt={slide.title} loading={active ? 'eager' : 'lazy'} />;
}

export default function HeroSlider({ slides }) {
  const [current, setCurrent] = useState(0);
  const timer = useRef(null);
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

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
      <div className="hs-slider">
        {slides.map((s, i) => (
          <article className={`hs-slide${i === current ? ' active' : ''}`} key={s.id}>
            <div className="hs-media">
              <SlideMedia slide={s} active={i === current} restartKey={current} />
            </div>
            <div className="wrap" style={{ position: 'relative', height: '100%' }}>
              <span className="hs-tag"><span className="hs-live" /> Signal {String(i + 1).padStart(2, '0')}</span>
              <div className="hs-copy">
                <span className="eyebrow">{s.eyebrow}</span>
                <h1>{s.title}</h1>
                {s.description && <p>{s.description}</p>}
                <a href={s.cta_url || '#'} className="btn">
                  {s.cta_label || 'Read Article'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </a>
              </div>

              {slides.length > 1 && i === current && (
                <div className="hs-controls">
                  <button className="hs-arrow" onClick={() => goTo(current - 1)} aria-label="Previous slide">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
                  </button>
                  <div className="hs-dots">
                    {slides.map((s2, i2) => (
                      <button key={s2.id} className={`hs-dot${i2 === current ? ' active' : ''}`} onClick={() => goTo(i2)} aria-label={`Go to slide ${i2 + 1}`} />
                    ))}
                  </div>
                  <button className="hs-arrow" onClick={() => goTo(current + 1)} aria-label="Next slide">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
