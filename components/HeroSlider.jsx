'use client';

import { useEffect, useRef, useState } from 'react';

const STYLES = `
@keyframes kb-zoom-in { from { transform: scale(1); } to { transform: scale(1.14); } }
@keyframes kb-zoom-out { from { transform: scale(1.14); } to { transform: scale(1); } }
@keyframes kb-pan-left { from { transform: scale(1.1) translateX(2%); } to { transform: scale(1.1) translateX(-2%); } }
@keyframes kb-pan-right { from { transform: scale(1.1) translateX(-2%); } to { transform: scale(1.1) translateX(2%); } }

.hs-root{ position:relative; overflow:hidden; background:var(--bg); }
.hs-slider{ position:relative; display:grid; min-height:600px; height:92vh; height:92svh; max-height:880px; touch-action:pan-y; }
.hs-slide{ grid-area:1/1; position:relative; width:100%; height:100%; opacity:0; visibility:hidden; transition:opacity .9s ease, visibility .9s; }
.hs-slide.active{ opacity:1; visibility:visible; }
.hs-media{ position:absolute; inset:0; overflow:hidden; background:#000; }
.hs-media .hs-media-inner{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.hs-media .hs-media-inner.kb{ animation-duration:9s; animation-timing-function:ease-out; animation-fill-mode:forwards; }
.hs-media::after{
  content:""; position:absolute; inset:0; pointer-events:none;
  background:
    linear-gradient(90deg, rgba(11,11,15,.9) 0%, rgba(11,11,15,.55) 46%, rgba(11,11,15,.12) 100%),
    linear-gradient(0deg, rgba(11,11,15,.96) 0%, rgba(11,11,15,0) 42%);
}
.hs-copy{ position:relative; z-index:2; height:100%; max-width:760px; display:flex; flex-direction:column; justify-content:center; padding:88px 0 190px; }
.hs-copy .eyebrow{ margin-bottom:18px; }
.hs-title{ font-size:clamp(58px,16vw,136px); line-height:.9; margin-bottom:18px; text-shadow:0 2px 28px rgba(0,0,0,.45); }
.hs-title span{ display:block; }
.hs-title .ol{ -webkit-text-stroke:1.6px #fff; }
.hs-copy p{ color:var(--text-dim); font-size:15.5px; line-height:1.6; margin-bottom:26px; max-width:440px; }
.hs-cta{ align-self:flex-start; }

.hs-ui{ position:absolute; left:0; right:0; top:0; bottom:0; margin:0 auto; pointer-events:none; z-index:3; }
.hs-ui > *{ pointer-events:auto; }
.hs-count{ position:absolute; left:20px; bottom:104px; font-family:var(--font-mono); font-size:12px; letter-spacing:.14em; color:var(--text-dim); }
.hs-count b{ color:#fff; font-weight:600; }
.hs-thumbs{ position:absolute; left:20px; right:20px; bottom:24px; display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; }
.hs-thumbs::-webkit-scrollbar{ display:none; }
.hs-thumb{ flex:0 0 74px; height:56px; border-radius:8px; overflow:hidden; border:1.5px solid transparent; background:var(--surface); opacity:.6; transition:.25s; padding:0; display:flex; align-items:center; justify-content:center; color:#fff; }
.hs-thumb img{ width:100%; height:100%; object-fit:cover; }
.hs-thumb.on{ opacity:1; border-color:var(--cyan); }
.hs-index, .hs-nav{ display:none; }

@media (min-width:900px){
  .hs-slider{ min-height:640px; }
  .hs-copy{ padding:96px 0 120px; }
  .hs-count, .hs-thumbs{ display:none; }
  .hs-index{ display:flex; flex-direction:column; gap:18px; position:absolute; right:28px; top:50%; transform:translateY(-50%); margin:0; padding:0; list-style:none; min-width:210px; }
  .hs-idx{ display:flex; align-items:baseline; gap:14px; background:transparent; border:none; color:var(--text-faint); text-align:left; padding:6px 0 6px 18px; position:relative; transition:.25s; font-family:var(--font-mono); }
  .hs-idx span{ font-size:13px; letter-spacing:.08em; }
  .hs-idx em{ font-style:normal; font-size:11.5px; letter-spacing:.14em; text-transform:uppercase; }
  .hs-idx:hover{ color:var(--text); }
  .hs-idx.on{ color:#fff; }
  .hs-idx.on::before{ content:""; position:absolute; left:0; top:50%; width:8px; height:8px; margin-top:-4px; border-radius:50%; background:var(--pink); box-shadow:0 0 0 0 rgba(236,72,153,.55); animation:hs-pulse 1.8s infinite; }
  .hs-nav{ display:flex; gap:10px; position:absolute; left:28px; bottom:36px; }
}
.hs-arrow{ width:44px; height:44px; border-radius:8px; border:1px solid rgba(255,255,255,.3); background:rgba(11,11,15,.5); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; color:#fff; transition:.2s; }
.hs-arrow:hover{ background:rgba(255,255,255,.12); }
@keyframes hs-pulse{ 0%{box-shadow:0 0 0 0 rgba(236,72,153,.55);} 70%{box-shadow:0 0 0 9px rgba(236,72,153,0);} 100%{box-shadow:0 0 0 0 rgba(236,72,153,0);} }
`;

const KB_ANIM = { 'zoom-in': 'kb-zoom-in', 'zoom-out': 'kb-zoom-out', 'pan-left': 'kb-pan-left', 'pan-right': 'kb-pan-right', none: 'none' };

// First half of the headline is solid, the second half is outlined (editorial look).
function splitTitle(title = '') {
  const t = title.trim();
  const m = t.match(/^(.+?[,:;])\s+(.+)$/) || t.match(/^(.+?)\s+[—–-]\s+(.+)$/);
  if (m) return [m[1], m[2]];
  const words = t.split(/\s+/);
  if (words.length < 3) return [t, ''];
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
}

const pad = (n) => String(n).padStart(2, '0');

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
        // React sets `muted` as a JS property, not an HTML attribute.
        // Firefox's autoplay policy checks the attribute specifically —
        // without it present, Firefox silently blocks autoplay and the
        // video just sits on a black/blank frame forever.
        ref={(el) => { if (el) { el.muted = true; el.setAttribute('muted', ''); } }}
      />
    );
  }
  return <img key={key} className={cls} style={style} src={slide.media_url} alt={slide.title} loading={active ? 'eager' : 'lazy'} />;
}

export default function HeroSlider({ slides }) {
  const [current, setCurrent] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false); // always false on server + first client render
  const timer = useRef(null);
  const touchX = useRef(null);

  useEffect(() => {
    // Safe to touch `window` here — this runs only after hydration completes,
    // so it can never cause a server/client render mismatch.
    setReduceMotion(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  }, []);

  useEffect(() => {
    if (reduceMotion || slides.length < 2) return undefined;
    clearInterval(timer.current);
    timer.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6500);
    return () => clearInterval(timer.current);
  }, [slides, current, reduceMotion]);

  if (!slides.length) return null;

  const goTo = (i) => setCurrent((i + slides.length) % slides.length);

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
  };

  return (
    <section className="hs-root" style={{ padding: 0 }}>
      <style>{STYLES}</style>
      <div className="hs-slider" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {slides.map((s, i) => {
          const [a, b] = splitTitle(s.title);
          return (
            <article className={`hs-slide${i === current ? ' active' : ''}`} key={s.id} aria-hidden={i !== current}>
              <div className="hs-media">
                <SlideMedia slide={s} active={i === current} restartKey={current} />
              </div>
              <div className="wrap" style={{ position: 'relative', height: '100%' }}>
                <div className="hs-copy">
                  {s.eyebrow && <span className="eyebrow">{s.eyebrow}</span>}
                  <h1 className="hs-title hl">
                    <span>{a}</span>
                    {b && <span className="ol">{b}</span>}
                  </h1>
                  {s.description && <p>{s.description}</p>}
                  <a href={s.cta_url || '#'} className="btn hs-cta" tabIndex={i === current ? 0 : -1}>
                    {s.cta_label || 'Read Article'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </a>
                </div>
              </div>
            </article>
          );
        })}

        {slides.length > 1 && (
          <div className="wrap hs-ui">
            <div className="hs-count"><b>{pad(current + 1)}</b> / {pad(slides.length)}</div>

            <div className="hs-thumbs">
              {slides.map((s, i) => (
                <button key={s.id} type="button" className={`hs-thumb${i === current ? ' on' : ''}`} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`}>
                  {s.media_type === 'video'
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    : <img src={s.media_url} alt="" loading="lazy" />}
                </button>
              ))}
            </div>

            <ol className="hs-index">
              {slides.map((s, i) => (
                <li key={s.id}>
                  <button type="button" className={`hs-idx${i === current ? ' on' : ''}`} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`}>
                    <span>{pad(i + 1)}</span>
                    <em>{s.eyebrow || s.title}</em>
                  </button>
                </li>
              ))}
            </ol>

            <div className="hs-nav">
              <button type="button" className="hs-arrow" onClick={() => goTo(current - 1)} aria-label="Previous slide">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
              </button>
              <button type="button" className="hs-arrow" onClick={() => goTo(current + 1)} aria-label="Next slide">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
