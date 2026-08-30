import { useEffect, useRef, useState } from 'react';

/*
 * One storyboard panel. The narration line types itself out when the scene
 * comes into view, and only once it finishes does the framed shot fade up
 * beneath it — the story leads, the content follows.
 */

const CHAR_MS = 16;

function reducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export default function Scene({
  id,
  number,
  title,
  direction,
  narration,
  tone = 'light',
  frameless = false,
  children,
}) {
  // Scenes without narration have nothing to wait for.
  const [typed, setTyped] = useState('');
  const [told, setTold] = useState(!narration);
  const sceneRef = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!narration || started.current) return;

    const el = sceneRef.current;
    if (!el) return;

    if (reducedMotion()) {
      started.current = true;
      setTyped(narration);
      setTold(true);
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
            setTyped(narration.slice(0, i));
            if (i >= narration.length) {
              clearInterval(tick);
              setTold(true);
            }
          }, CHAR_MS);
        });
      },
      { threshold: 0, rootMargin: '-12% 0px -30% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [narration]);

  return (
    <section id={id} className={`scene scene-${tone}`} ref={sceneRef}>
      <div className="container">
        <div className="scene-slate">
          <span className="scene-perf" aria-hidden="true" />
          <div className="scene-slate-row">
            <span className="scene-num">{number}</span>
            <span className="scene-title">{title}</span>
            <span className="scene-direction">{direction}</span>
          </div>
        </div>

        {narration && (
          <p className={`scene-narration${told ? ' is-told' : ''}`}>
            <span aria-hidden="true">{typed}</span>
            {!told && <span className="scene-caret" aria-hidden="true" />}
            <span className="sr-only">{narration}</span>
          </p>
        )}

        <div
          className={`scene-frame${frameless ? ' is-frameless' : ''}${
            told ? ' is-told' : ''
          }`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
