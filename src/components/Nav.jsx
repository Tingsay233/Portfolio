import { useState, useEffect } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
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
          }}
        >
          ST.
        </a>
        <div className="nav-links" style={{ display: 'flex', gap: '1.5rem' }}>
          {[
            ['Quest Log', 'projects'],
            ['Mini Games', 'play'],
            ['Send Letter', 'contact'],
          ].map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              className="nav-link"
              style={{
                fontSize: '0.9rem',
                color: 'var(--ink-soft)',
                borderBottom: 'none',
                fontWeight: 600,
                transition: 'color 0.2s',
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
      <style>{`
        .nav-link:hover {
          color: var(--accent) !important;
        }
        @media (max-width: 640px) {
          .nav-container {
            padding: 0.75rem 1rem !important;
          }
          .nav-logo {
            font-size: 1.1rem !important;
          }
          .nav-links {
            gap: 0.8rem !important;
          }
          .nav-link {
            font-size: 0.8rem !important;
          }
        }
        @media (max-width: 380px) {
          .nav-links {
            gap: 0.5rem !important;
          }
          .nav-link {
            font-size: 0.75rem !important;
          }
          .nav-logo span {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}
