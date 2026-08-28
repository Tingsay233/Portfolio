import { useEffect, useState } from 'react';

/*
 * Title screen. Shows once per browser tab session — a returning visitor
 * scrolling back doesn't sit through it twice. Any input dismisses it.
 */

const KEY = 'siting-booted-v1';

function alreadyBooted() {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export default function BootScreen({ onDone }) {
  const [show, setShow] = useState(() => !alreadyBooted());
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!show) {
      onDone?.();
      return;
    }

    // Nothing behind the title screen should scroll while it is up.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function start() {
      setLeaving(true);
      try {
        sessionStorage.setItem(KEY, '1');
      } catch {
        /* private mode — the intro just shows again next time */
      }
      setTimeout(() => {
        setShow(false);
        onDone?.();
      }, 480);
    }

    const onKey = (e) => {
      if (e.key === 'Tab') return;   // let keyboard users reach the button
      start();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', start, { passive: true, once: true });
    window.addEventListener('touchstart', start, { passive: true, once: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', start);
      window.removeEventListener('touchstart', start);
    };
  }, [show, onDone]);

  if (!show) return null;

  function start() {
    setLeaving(true);
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* no-op */
    }
    setTimeout(() => {
      setShow(false);
      onDone?.();
    }, 480);
  }

  return (
    <div
      className={`boot-screen${leaving ? ' boot-screen-out' : ''}`}
      onClick={start}
      role="dialog"
      aria-label="Title screen"
    >
      <div className="boot-stars" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 5.7 + 3) % 100}%`,
              top: `${(i * 13.3 + 7) % 100}%`,
              animationDelay: `${(i % 6) * 0.35}s`,
              fontSize: `${0.6 + (i % 4) * 0.35}rem`,
            }}
          >
            {i % 3 === 0 ? '★' : '✦'}
          </span>
        ))}
      </div>

      <div className="boot-inner">
        <p className="boot-kicker">A portfolio in five acts</p>
        <h1 className="boot-title">SAY SI TING</h1>
        <p className="boot-sub">Software engineer · Kuala Lumpur</p>

        <button type="button" className="boot-start" onClick={start} autoFocus>
          ▶ PRESS START
        </button>

        <p className="boot-hint">click anywhere, or press any key</p>
      </div>
    </div>
  );
}
