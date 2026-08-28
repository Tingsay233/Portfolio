import { useEffect, useRef, useState } from 'react';

/*
 * RPG-style area announcement. Slides in when the visitor crosses into a new
 * part of the page, the way a game names a zone you just walked into.
 */

const ZONES = [
  { id: 'about',      label: 'The Backstory',  icon: '📖' },
  { id: 'projects',   label: 'Quest Log',      icon: '📜' },
  { id: 'experience', label: 'The Journal',    icon: '🗓️' },
  { id: 'play-churn', label: 'Mini Games',     icon: '🎮' },
  { id: 'play-chess', label: 'Kwazam Chess',   icon: '♟️' },
  { id: 'guestbook',  label: 'The Guestbook',  icon: '✒️' },
  { id: 'contact',    label: 'Send a Letter',  icon: '💌' },
];

const HOLD_MS = 1900;

export default function ZoneBanner({ enabled = true }) {
  const [zone, setZone] = useState(null);
  const currentId = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    function update() {
      const trigger = window.scrollY + window.innerHeight * 0.35;
      let found = null;
      for (const z of ZONES) {
        const el = document.getElementById(z.id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= trigger) found = z;
      }

      const id = found?.id ?? null;
      if (id === currentId.current) return;
      currentId.current = id;

      clearTimeout(timer.current);
      if (!found) {
        setZone(null);
        return;
      }
      setZone(found);
      timer.current = setTimeout(() => setZone(null), HOLD_MS);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      clearTimeout(timer.current);
    };
  }, [enabled]);

  if (!zone) return null;

  return (
    <div className="zone-banner" key={zone.id} aria-hidden="true">
      <span className="zone-banner-icon">{zone.icon}</span>
      <span className="zone-banner-label">{zone.label}</span>
    </div>
  );
}
