import { useEffect, useRef, useState } from 'react';
import { ACHIEVEMENTS } from '../lib/achievements.js';
import { useAchievements } from '../lib/AchievementContext.jsx';

export default function AchievementHUD() {
  const { unlocked, hasUnlocked, count, xp, totalXp, rank, reset } =
    useAchievements();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const total = ACHIEVEMENTS.length;
  const pct = totalXp > 0 ? Math.round((xp / totalXp) * 100) : 0;

  // Close on Escape, or on a click outside the panel.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    function onPointerDown(e) {
      if (
        !panelRef.current?.contains(e.target) &&
        !buttonRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  return (
    <div className="achievement-hud">
      {open && (
        <div
          ref={panelRef}
          className="achievement-panel"
          role="dialog"
          aria-label="Achievements"
        >
          <div className="achievement-panel-head">
            <div>
              <p className="achievement-panel-kicker">Visitor progress</p>
              <p className="achievement-panel-rank">{rank}</p>
            </div>
            <span className="achievement-panel-score">
              {count}/{total}
            </span>
          </div>

          <div className="achievement-xp-track" aria-hidden="true">
            <div className="achievement-xp-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="achievement-xp-label">
            {xp} / {totalXp} XP
          </p>

          <ul className="achievement-list">
            {ACHIEVEMENTS.map((a) => {
              const got = hasUnlocked(a.id);
              return (
                <li
                  key={a.id}
                  className={`achievement-row${got ? ' is-unlocked' : ''}`}
                >
                  <span className="achievement-row-icon" aria-hidden="true">
                    {got ? a.icon : '🔒'}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p className="achievement-row-title">
                      {got ? a.title : '? ? ?'}
                    </p>
                    <p className="achievement-row-desc">
                      {got ? a.desc : a.hint}
                    </p>
                  </div>
                  <span className="achievement-row-xp">
                    {got ? `+${a.xp}` : `${a.xp}`}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="achievement-panel-foot">
            <span>Saved in this browser only.</span>
            {unlocked.length > 0 && (
              <button type="button" onClick={reset} className="achievement-reset">
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        className="achievement-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Achievements: ${count} of ${total} unlocked`}
      >
        <span aria-hidden="true">🏆</span>
        <span className="achievement-toggle-count">
          {count}/{total}
        </span>
      </button>
    </div>
  );
}
