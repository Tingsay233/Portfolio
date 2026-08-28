import { useEffect, useState } from 'react';
import { ACHIEVEMENTS_BY_ID } from '../lib/achievements.js';
import { useAchievements } from '../lib/AchievementContext.jsx';

const VISIBLE_MS = 4600;

function Toast({ toast, onDone }) {
  const [leaving, setLeaving] = useState(false);
  const achievement = ACHIEVEMENTS_BY_ID[toast.id];

  useEffect(() => {
    const hide = setTimeout(() => setLeaving(true), VISIBLE_MS);
    const remove = setTimeout(() => onDone(toast.key), VISIBLE_MS + 320);
    return () => {
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, [toast.key, onDone]);

  if (!achievement) return null;

  return (
    <div
      className={`achievement-toast${leaving ? ' achievement-toast-out' : ''}`}
      role="status"
      onClick={() => onDone(toast.key)}
    >
      <span className="achievement-toast-icon" aria-hidden="true">
        {achievement.icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <p className="achievement-toast-kicker">Achievement unlocked</p>
        <p className="achievement-toast-title">{achievement.title}</p>
        <p className="achievement-toast-desc">{achievement.desc}</p>
      </div>
      <span className="achievement-toast-xp">+{achievement.xp} XP</span>
    </div>
  );
}

export default function AchievementToast() {
  const { toasts, dismissToast } = useAchievements();

  return (
    <div className="achievement-toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <Toast key={toast.key} toast={toast} onDone={dismissToast} />
      ))}
    </div>
  );
}
