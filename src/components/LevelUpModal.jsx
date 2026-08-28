import { useEffect, useRef, useState } from 'react';
import { useAchievements } from '../lib/AchievementContext.jsx';
import { pixelBurst } from '../lib/confetti.js';

/*
 * Fires when the visitor's rank changes — the payoff moment the achievement
 * toasts build toward. Deliberately a modal: it stops the page for a beat.
 */
export default function LevelUpModal() {
  const { rank, xp, totalXp } = useAchievements();
  const [levelUp, setLevelUp] = useState(null);
  const previousRank = useRef(rank);
  const closeRef = useRef(null);

  useEffect(() => {
    if (rank === previousRank.current) return;
    const from = previousRank.current;
    previousRank.current = rank;
    setLevelUp({ from, to: rank });
  }, [rank]);

  useEffect(() => {
    if (!levelUp) return;

    pixelBurst({ y: window.innerHeight * 0.42, count: 60 });
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') setLevelUp(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [levelUp]);

  if (!levelUp) return null;

  return (
    <div className="levelup-backdrop" onClick={() => setLevelUp(null)}>
      <div
        className="levelup-box"
        role="dialog"
        aria-label="Level up"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="levelup-kicker">★ ★ ★</p>
        <h2 className="levelup-title">LEVEL UP!</h2>

        <p className="levelup-ranks">
          <span className="levelup-from">{levelUp.from}</span>
          <span className="levelup-arrow"> → </span>
          <span className="levelup-to">{levelUp.to}</span>
        </p>

        <p className="levelup-xp">{xp} / {totalXp} XP</p>

        <button
          ref={closeRef}
          type="button"
          className="btn btn-primary levelup-btn"
          onClick={() => setLevelUp(null)}
        >
          Continue ▶
        </button>
      </div>
    </div>
  );
}
