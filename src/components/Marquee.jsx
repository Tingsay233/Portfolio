const TEXT =
  '⚔ QUEST COMPLETE  •  🌱 SKILL UNLOCKED  •  ✦ NEW AREA DISCOVERED  •  🎮 KEEP PLAYING  •  🏆 ACHIEVEMENT EARNED  •  ';

// Triple so the -33% translateX loop is seamless
const CONTENT = TEXT.repeat(3);

export default function Marquee() {
  return (
    <div
      aria-hidden="true"
      style={{
        overflow: 'hidden',
        background: 'var(--navy-800)',
        padding: '0.55rem 0',
        borderTop: '2px solid var(--ink)',
        borderBottom: '2px solid var(--ink)',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          animation: 'marqueeScroll 22s linear infinite',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.45rem',
            color: 'var(--gold-light)',
            letterSpacing: '0.06em',
            lineHeight: 2,
          }}
        >
          {CONTENT}
        </span>
      </div>
      <style>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}
