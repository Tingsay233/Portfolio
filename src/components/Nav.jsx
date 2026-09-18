import { useEffect, useState } from 'react';
import ViewToggle from './ViewToggle.jsx';

/*
 * `match` lists every section id the link should light up for — the mini-games
 * area is two sections (churn demo + chess) behind a single nav entry.
 */
const LINKS = [
  { label: 'About',       target: 'about',      match: ['about'] },
  { label: 'Quest Log',   target: 'projects',   match: ['projects'] },
  { label: 'Journal',     target: 'experience', match: ['experience'] },
  { label: 'Mini Games',  target: 'play-churn', match: ['play-churn', 'play-chess'] },
  { label: 'Guestbook',   target: 'guestbook',  match: ['guestbook'] },
  { label: 'Send Letter', target: 'contact',    match: ['contact'] },
];

const TRACKED = ['top', ...LINKS.flatMap((l) => l.match)];

export default function Nav({ mode, onModeChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('top');

  useEffect(() => {
    function update() {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 40);

      // Whichever tracked section has crossed 40% of the viewport last.
      const trigger = scrollTop + window.innerHeight * 0.4;
      let current = TRACKED[0];
      for (const id of TRACKED) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + scrollTop <= trigger) current = id;
      }
      setActive(current);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(251, 247, 240, 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.25s',
      }}
    >
      <div
        className="container nav-container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.5rem',
        }}
      >
        <a
          href="#top"
          className="nav-logo"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--navy-900)',
            borderBottom: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexShrink: 0,
          }}
        >
          ST.
        </a>
        <div className="nav-links">
          {LINKS.map((link) => {
            const isActive = link.match.includes(active);
            return (
              <a
                key={link.target}
                href={`#${link.target}`}
                className={`nav-link${isActive ? ' nav-link-active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {onModeChange && (
          <ViewToggle mode={mode} onChange={onModeChange} inline />
        )}
      </div>
      <style>{`
        .nav-links {
          /* must be allowed to shrink, or it pushes the view toggle off-screen */
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          gap: 1.25rem;
          align-items: center;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .nav-links::-webkit-scrollbar { display: none; }

        @media (min-width: 861px) {
          .nav-links { justify-content: flex-end; }
        }

        .nav-link {
          position: relative;
          font-size: 0.9rem;
          color: var(--ink-soft);
          border-bottom: none;
          font-weight: 600;
          white-space: nowrap;
          padding-bottom: 3px;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 2px;
          background: var(--accent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.22s ease;
        }
        .nav-link:hover { color: var(--accent); }
        .nav-link:hover::after { transform: scaleX(1); }
        .nav-link-active { color: var(--accent); }
        .nav-link-active::after { transform: scaleX(1); }

        @media (prefers-reduced-motion: reduce) {
          .nav-link::after { transition: none; }
        }
        @media (max-width: 860px) {
          .nav-link { font-size: 0.82rem; }
          .nav-links { gap: 0.9rem; }
        }
        @media (max-width: 640px) {
          .nav-container { padding: 0.75rem 1rem !important; }
          .nav-logo { font-size: 1.1rem !important; }
          .nav-links { gap: 0.75rem; }
          .nav-link { font-size: 0.78rem; }
        }
        @media (max-width: 380px) {
          .nav-links { gap: 0.6rem; }
          .nav-link { font-size: 0.74rem; }
        }
      `}</style>
    </nav>
  );
}
