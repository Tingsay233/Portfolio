import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'top',        label: 'Home'       },
  { id: 'about',      label: 'About'      },
  { id: 'projects',   label: 'Quest Log'  },
  { id: 'experience', label: 'Journal'    },
  { id: 'play',       label: 'Mini Games' },
  { id: 'guestbook',  label: 'Guestbook'  },
  { id: 'contact',    label: 'Contact'    },
];

// Rocket pointing UP by default (nose at top, flames at bottom)
// scaleY(-1) = nose down = going down the page
function RocketSVG() {
  return (
    <svg width="30" height="56" viewBox="0 0 20 38" style={{ overflow: 'visible' }}>
      {/* Nose cone */}
      <path d="M10 1 L16 11 L4 11 Z" fill="#C8960C" stroke="#2A1A0E" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Body */}
      <rect x="4" y="11" width="12" height="14" fill="#4A7C3F" stroke="#2A1A0E" strokeWidth="1.2" rx="1" />
      {/* Porthole window */}
      <circle cx="10" cy="17" r="3.5" fill="#9DD8F8" stroke="#2A1A0E" strokeWidth="1.1" />
      <circle cx="9"  cy="16" r="1.2" fill="white" opacity="0.55" />
      {/* Fins */}
      <path d="M4 19 L0 27 L4 25 Z"  fill="#B87A10" stroke="#2A1A0E" strokeWidth="1" strokeLinejoin="round" />
      <path d="M16 19 L20 27 L16 25 Z" fill="#B87A10" stroke="#2A1A0E" strokeWidth="1" strokeLinejoin="round" />
      {/* Nozzle */}
      <rect x="7" y="25" width="6" height="3" rx="1" fill="#2A1A0E" />
      {/* Outer flame */}
      <path d="M6 28 Q5 34 10 38 Q15 34 14 28 Z"
        fill="#F0C040"
        style={{ animation: 'flamePulse 0.18s ease-in-out infinite alternate', transformOrigin: '10px 28px' }}
      />
      {/* Mid flame */}
      <path d="M7.5 28 Q7.5 33 10 36 Q12.5 33 12.5 28 Z"
        fill="#FF8800"
        style={{ animation: 'flamePulse 0.22s ease-in-out infinite alternate-reverse', transformOrigin: '10px 28px' }}
      />
      {/* Inner flame */}
      <path d="M9 28 Q9 32 10 34 Q11 32 11 28 Z" fill="#FFEE55" />
    </svg>
  );
}

const TRACK_PAD = 6; // % from top and bottom edges

export default function ScrollProgress() {
  const [progress,      setProgress]      = useState(0);
  const [activeSection, setActiveSection] = useState('top');
  const [goingDown,     setGoingDown]     = useState(true);

  useEffect(() => {
    let lastScroll = window.scrollY;

    function update() {
      const scrollTop = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? (scrollTop / docH) * 100 : 0);

      if (scrollTop !== lastScroll) {
        setGoingDown(scrollTop > lastScroll);
        lastScroll = scrollTop;
      }

      const trigger = scrollTop + window.innerHeight * 0.4;
      let current = SECTIONS[0].id;
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + scrollTop <= trigger) current = id;
      }
      setActiveSection(current);
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const pct    = Math.max(0, Math.min(100, progress));
  const trackH = 100 - 2 * TRACK_PAD;   // usable % of viewport height
  const rocketTop = `calc(${TRACK_PAD + pct * trackH / 100}% - 28px)`;  // 28 = half rocket height

  return (
    <>
      <div className="scroll-progress-bar" style={{
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        width: '56px',
        zIndex: 9998,
        pointerEvents: 'none',
        overflow: 'visible',
      }}>

        {/* Dashed track line */}
        <div style={{
          position: 'absolute',
          left: '26px',
          top:    `${TRACK_PAD}%`,
          bottom: `${TRACK_PAD}%`,
          width: '2px',
          backgroundImage: 'repeating-linear-gradient(180deg, rgba(61,43,31,0.18) 0px, rgba(61,43,31,0.18) 4px, transparent 4px, transparent 8px)',
        }} />

        {/* Filled track (progress) */}
        <div style={{
          position: 'absolute',
          left: '26px',
          top: `${TRACK_PAD}%`,
          height: `${pct * trackH / 100}%`,
          width: '2px',
          background: 'linear-gradient(180deg, var(--accent) 0%, var(--gold) 100%)',
          transition: 'height 0.1s linear',
          borderRadius: '1px',
        }} />

        {/* Section dots + labels */}
        {SECTIONS.map((sec, i) => {
          const dotPct   = TRACK_PAD + (i / (SECTIONS.length - 1)) * trackH;
          const isActive = activeSection === sec.id;
          const isPast   = pct >= (i / (SECTIONS.length - 1)) * 100 - 0.5;

          return (
            <button
              key={sec.id}
              onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                position: 'absolute',
                top: `${dotPct}%`,
                left: '20px',
                transform: 'translateY(-50%)',
                pointerEvents: 'auto',
                background: 'none', border: 'none',
                cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              {/* Dot */}
              <span style={{
                display: 'block',
                width:  isActive ? 10 : 6,
                height: isActive ? 10 : 6,
                borderRadius: '50%',
                background: isPast ? 'var(--accent)' : 'rgba(61,43,31,0.2)',
                border: `2px solid ${isPast ? 'var(--navy-800)' : 'rgba(61,43,31,0.15)'}`,
                boxShadow: isActive ? '0 0 0 3px rgba(74,124,63,0.28)' : 'none',
                transition: 'all 0.22s ease',
                flexShrink: 0,
              }} />

              {/* Active label (pops out to the right) */}
              <span style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'translateX(0)' : 'translateX(-4px)',
                transition: 'opacity 0.22s ease, transform 0.22s ease',
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.3rem',
                letterSpacing: '0.06em',
                lineHeight: 2,
                color: 'var(--navy-900)',
                background: 'rgba(242,228,196,0.95)',
                padding: '1px 5px',
                borderRadius: '3px',
                border: '1px solid rgba(61,43,31,0.15)',
                boxShadow: '2px 2px 0 rgba(61,43,31,0.15)',
                whiteSpace: 'nowrap',
                pointerEvents: isActive ? 'auto' : 'none',
              }}>
                {sec.label}
              </span>
            </button>
          );
        })}

        {/* Rocket */}
        <div style={{
          position: 'absolute',
          left: '12px',
          top: rocketTop,
          transform: goingDown ? 'scaleY(-1)' : 'scaleY(1)',
          transition: 'top 0.13s ease-out, transform 0.18s ease',
          pointerEvents: 'none',
          filter: 'drop-shadow(1px 2px 4px rgba(0,0,0,0.22))',
        }}>
          <RocketSVG />
        </div>

      </div>

      <style>{`
        @keyframes flamePulse {
          from { transform: scaleX(1)    scaleY(0.95); opacity: 1;    }
          to   { transform: scaleX(0.88) scaleY(1.12); opacity: 0.88; }
        }
        /* Hide rocket tracker on mobile/tablet — too cramped */
        @media (max-width: 1023px) {
          .scroll-progress-bar { display: none !important; }
        }
      `}</style>
    </>
  );
}
