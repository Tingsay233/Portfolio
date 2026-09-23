import { useEffect, useState } from 'react';

const src = (n) => (typeof n === 'string' ? `/sprites/${n}` : `/sprites/sprite_${String(n).padStart(3, '0')}.png`);

/* A sprite image sized by height; decorative unless given alt text. */
export function Sprite({ n, h, alt = '', className = '', style }) {
  return (
    <img
      src={src(n)}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable="false"
      className={`px ${className}`}
      style={{ height: h, ...style }}
    />
  );
}

export function Panel({ title, icon, className = '', children, ...rest }) {
  return (
    <div className={`panel ${className}`} {...rest}>
      {title && (
        <div className="panel__title">
          {icon && <Sprite n={icon} h={18} />}
          <span>{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

export function SectionHead({ chapter, title, sub }) {
  return (
    <header className="section-head">
      <span className="chapter">{chapter}</span>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </header>
  );
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* The character walking across a scene, cycling the four walk frames. */
export function Walker({ h = 64 }) {
  const frames = [29, 30, 31, 32];
  const [i, setI] = useState(0);
  const [still] = useState(reducedMotion);

  useEffect(() => {
    if (still) return;
    const t = setInterval(() => setI((v) => (v + 1) % frames.length), 150);
    return () => clearInterval(t);
  }, [still]);

  return (
    <div className={`walker${still ? ' walker--still' : ''}`}>
      {/* preload every frame so the cycle never flickers */}
      {frames.map((f, k) => (
        <Sprite key={f} n={still ? 2 : f} h={h} style={{ display: k === i ? 'block' : 'none' }} />
      ))}
    </div>
  );
}
