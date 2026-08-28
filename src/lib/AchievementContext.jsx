import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ACHIEVEMENTS_BY_ID,
  EARNABLE,
  TOTAL_XP,
  clearUnlocked,
  loadUnlocked,
  rankFor,
  saveUnlocked,
} from './achievements.js';

const AchievementContext = createContext(null);

export function AchievementProvider({ children }) {
  const [unlocked, setUnlocked] = useState(loadUnlocked);
  const [toasts, setToasts] = useState([]);

  // Mirrors `unlocked` synchronously so two unlock() calls in the same tick
  // (or React's double-invoked effects in StrictMode) can't double-fire a toast.
  const unlockedRef = useRef(unlocked);

  const unlock = useCallback((id) => {
    if (!ACHIEVEMENTS_BY_ID[id]) return;
    if (unlockedRef.current.includes(id)) return;

    const next = [...unlockedRef.current, id];
    unlockedRef.current = next;
    setUnlocked(next);
    saveUnlocked(next);
    // Cap the stack — a fast scroll can unlock several at once.
    setToasts((prev) => [...prev, { key: `${id}-${Date.now()}`, id }].slice(-3));
  }, []);

  const dismissToast = useCallback((key) => {
    setToasts((prev) => prev.filter((t) => t.key !== key));
  }, []);

  const reset = useCallback(() => {
    unlockedRef.current = [];
    setUnlocked([]);
    setToasts([]);
    clearUnlocked();
    // The visitor is still standing here, so arrival is immediately true again.
    unlock('arrival');
  }, [unlock]);

  // Auto-grant the completionist crown once everything else is done.
  useEffect(() => {
    const done = EARNABLE.every((a) => unlocked.includes(a.id));
    if (done) unlock('completionist');
  }, [unlocked, unlock]);

  const value = useMemo(() => {
    const xp = unlocked.reduce(
      (sum, id) => sum + (ACHIEVEMENTS_BY_ID[id]?.xp ?? 0),
      0
    );
    return {
      unlocked,
      unlock,
      reset,
      toasts,
      dismissToast,
      hasUnlocked: (id) => unlocked.includes(id),
      count: unlocked.length,
      earnableCount: EARNABLE.length,
      xp,
      totalXp: TOTAL_XP,
      rank: rankFor(xp),
    };
  }, [unlocked, unlock, reset, toasts, dismissToast]);

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
}

/*
 * Safe to call from any component. Returns a no-op shim when rendered outside
 * the provider so a section can never crash the page over an achievement.
 */
const NOOP = {
  unlocked: [],
  unlock: () => {},
  reset: () => {},
  toasts: [],
  dismissToast: () => {},
  hasUnlocked: () => false,
  count: 0,
  earnableCount: EARNABLE.length,
  xp: 0,
  totalXp: TOTAL_XP,
  rank: rankFor(0),
};

export function useAchievements() {
  return useContext(AchievementContext) ?? NOOP;
}
