import ViewToggle from './ViewToggle.jsx';
import Logo from './Logo.jsx';
import { useAchievements } from '../lib/AchievementContext.jsx';

/* Top bar links walk the character to that place in the village. */
const LINKS = [
  { label: 'HOME', place: 'welcome' },
  { label: 'ABOUT', place: 'about' },
  { label: 'QUESTS', place: 'quests' },
  { label: 'ARCADE', place: 'churn' },
  { label: 'JOURNEY', place: 'journey' },
  { label: 'CONTACT', place: 'contact' },
];

export default function GameNav({ mode, onModeChange, onTravel, visited = [] }) {
  const { xp } = useAchievements();

  return (
    <nav className="gnav">
      <a href="/" className="gnav-logo" aria-label="Say Si Ting — home">
        <Logo size={30} title="" />
        <span className="gnav-name">Say Si Ting</span>
      </a>

      <div className="gnav-links">
        {LINKS.map((link) => (
          <button
            key={link.place}
            type="button"
            className={`gnav-link${visited.includes(link.place) ? ' is-visited' : ''}`}
            onClick={() => onTravel?.(link.place)}
          >
            {link.label}
          </button>
        ))}
      </div>

      <span className="gnav-coins" title="Experience earned exploring this site">
        <span aria-hidden="true">🪙</span> {xp}
      </span>

      {onModeChange && <ViewToggle mode={mode} onChange={onModeChange} inline />}
    </nav>
  );
}
