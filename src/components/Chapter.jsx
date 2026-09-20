import { useEffect, useRef, useState } from 'react';

/*
 * A chapter panel: a labelled band, then the scene. The dialogue box types
 * itself out the first time the chapter comes into view.
 */

const CHAR_MS = 18;

function reducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function Dialogue({ text, speaker }) {
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;

    if (reducedMotion()) {
      started.current = true;
      setTyped(text);
      setDone(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return;
          started.current = true;
          observer.disconnect();
          let i = 0;
          const tick = setInterval(() => {
            i += 1;
            setTyped(text.slice(0, i));
            if (i >= text.length) {
              clearInterval(tick);
              setDone(true);
            }
          }, CHAR_MS);
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return (
    <div className="dialogue" ref={ref}>
      {speaker && <span className="dialogue-name">{speaker} </span>}
      <span aria-hidden="true">{typed}</span>
      {!done && <span className="dialogue-caret" />}
      <span className="sr-only">{text}</span>
      {done && <span className="dialogue-nub" aria-hidden="true">▼</span>}
    </div>
  );
}

export default function Chapter({ id, tag, title, sky = 'day', art, extra, children }) {
  return (
    <section id={id} className={`pnl chapter chapter-${sky}`}>
      <header className="chapter-band">
        <span className="chapter-tag">{tag}</span>
        <h2 className="chapter-h">{title}</h2>
      </header>

      <div className={`chapter-body${art ? '' : ' chapter-full'}`}>
        {art ? <div className="chapter-copy">{children}</div> : children}
        {art}
      </div>

      {extra && <div className="chapter-extra">{extra}</div>}
    </section>
  );
}
