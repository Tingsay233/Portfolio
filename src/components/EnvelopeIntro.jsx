import { useEffect, useRef, useState } from 'react';
import { pixelBurst } from '../lib/confetti.js';

/*
 * Opening act: a sealed letter. Break the seal, the flap swings open and the
 * card slides out — then the page takes over. Shows once per tab session.
 */

const KEY = 'siting-letter-opened-v1';

const FLAP_DONE   = 1250;   // seal breaks, flap opens, card rises
const SCENE_GONE  = 1700;   // scene has faded, page is live

function alreadyOpened() {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

function reducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export default function EnvelopeIntro({ onDone }) {
  const [show, setShow] = useState(() => !alreadyOpened());
  const [phase, setPhase] = useState('sealed');   // sealed → opening → leaving
  const sealRef = useRef(null);
  const timers = useRef([]);

  // Scroll stays locked behind the letter.
  useEffect(() => {
    if (!show) {
      onDone?.();
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
      timers.current.forEach(clearTimeout);
    };
  }, [show, onDone]);

  // Any key opens it too, so it is never a mouse-only door.
  useEffect(() => {
    if (!show || phase !== 'sealed') return;
    const onKey = (e) => {
      if (e.key === 'Tab') return;
      open();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  function finish() {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* private mode — the letter simply arrives again next time */
    }
    setShow(false);
    onDone?.();
  }

  function open() {
    if (phase !== 'sealed') return;

    if (reducedMotion()) {
      finish();
      return;
    }

    setPhase('opening');

    // Wax cracks right where the seal sits.
    const rect = sealRef.current?.getBoundingClientRect();
    timers.current.push(
      setTimeout(
        () =>
          pixelBurst({
            x: rect ? rect.left + rect.width / 2 : undefined,
            y: rect ? rect.top + rect.height / 2 : undefined,
            count: 34,
            spread: 4.5,
          }),
        120
      ),
      setTimeout(() => setPhase('leaving'), FLAP_DONE),
      setTimeout(finish, SCENE_GONE)
    );
  }

  if (!show) return null;

  return (
    <div
      className={`env-scene${phase === 'leaving' ? ' is-leaving' : ''}`}
      onClick={open}
      role="dialog"
      aria-label="An unopened letter"
    >
      <div className={`env${phase !== 'sealed' ? ' is-opening' : ''}`}>
        {/* Back panel */}
        <div className="env-back" />

        {/* The card that slides out */}
        <div className="env-letter">
          <p className="env-letter-open">Dear visitor,</p>
          <p className="env-letter-body">
            thanks for stopping by. Let me show you what I&apos;ve been
            building.
          </p>
          <p className="env-letter-sign">— Si Ting</p>
        </div>

        {/* Front pocket, drawn over the card. SVG rather than a clipped div
            so the diagonal edges keep their outline. */}
        <svg
          className="env-front"
          viewBox="0 0 100 65"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon
            points="0,65 0,18 50,45 100,18 100,65"
            fill="var(--cream-100)"
            stroke="var(--navy-800)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Flap, hinged along the top edge */}
        <svg
          className="env-flap"
          viewBox="0 0 100 47"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon
            points="0,0 100,0 50,45"
            fill="var(--cream-200)"
            stroke="var(--navy-800)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Wax seal */}
        <button
          ref={sealRef}
          type="button"
          className="env-seal"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          aria-label="Break the seal and open the letter"
        >
          ST
        </button>
      </div>

      <p className="env-prompt">click the seal to open</p>
    </div>
  );
}
