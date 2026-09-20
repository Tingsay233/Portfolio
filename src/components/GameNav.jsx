import { useEffect, useState } from 'react';
import ViewToggle from './ViewToggle.jsx';
import { useAchievements } from '../lib/AchievementContext.jsx';

const LINKS = [
  { label: 'HOME', target: 'ch-home' },
  { label: 'ABOUT', target: 'ch-about' },
  { label: 'JOURNEY', target: 'ch-journey' },
  { label: 'QUESTS', target: 'ch-quests' },
  { label: 'ARCADE', target: 'ch-arcade' },
  { label: 'CONTACT', target: 'ch-epilogue' },
];

export default function GameNav({ mode, onModeChange }) {
  const { xp } = useAchievements();
  const [active, setActive] = useState('ch-home');

  useEffect(() => {
    function update() {
      const trigger = window.scrollY + window.innerHeight * 0.35;
      let current = LINKS[0].target;
      for (const { target } of LINKS) {
        const el = document.getElementById(target);
        if (el && el.getBoundingClientRect().top + window.scrollY <= trigger) current = target;
      }
      setActive(current);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <nav className="gnav">
      <span className="gnav-heart" aria-hidden="true">♥</span>

      <div className="gnav-links">
        {LINKS.map((link) => (
          <a
            key={link.target}
            href={`#${link.target}`}
            className={`gnav-link${active === link.target ? ' is-active' : ''}`}
            aria-current={active === link.target ? 'true' : undefined}
          >
            {link.label}
          </a>
        ))}
      </div>

      <span className="gnav-coins" title="Experience earned exploring this site">
        <span aria-hidden="true">🪙</span> {xp}
      </span>

      {onModeChange && <ViewToggle mode={mode} onChange={onModeChange} inline />}
    </nav>
  );
}
