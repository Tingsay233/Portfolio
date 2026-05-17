// Deterministic so particles don't shift on re-render
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: ((i * 4.7 + 2.3) % 100).toFixed(1),
  size: [3, 4, 3, 5, 3][i % 5],
  duration: (9 + (i % 8) * 1.6).toFixed(1),
  delay: (-(i * 0.85) % 12).toFixed(1),
  color: ['#C8960C', '#4A7C3F', '#F0C040', '#8DC870', '#C8960C', '#D4B878'][i % 6],
}));

export default function PixelParticles() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            imageRendering: 'pixelated',
            animationName: 'pixelFloat',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes pixelFloat {
          0%   { transform: translateY(0) rotate(0deg);    opacity: 0;    }
          8%   { opacity: 0.55; }
          92%  { opacity: 0.3; }
          100% { transform: translateY(-102vh) rotate(180deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
