import { useEffect, useRef } from 'react';
import Chapter, { Dialogue } from '../components/Chapter.jsx';
import {
  ChapterHome,
  ChapterAbout,
  ChapterJourney,
  ChapterQuests,
  ChapterEpilogue,
} from '../sections/Chapters.jsx';
import ChurnDemo from '../sections/ChurnDemo.jsx';
import ChessDemo from '../sections/ChessDemo.jsx';
import Guestbook from '../sections/Guestbook.jsx';
import { useAchievements } from '../lib/AchievementContext.jsx';
import { PLACES } from './world.js';

/*
 * What opens when the visitor steps up to a place. Each one reuses the
 * chapter content, so the plain view and the village never drift apart.
 */

const LOOT = [
  { icon: '🐍', name: 'Python / Django' },
  { icon: '⚛️', name: 'React / JavaScript' },
  { icon: '☕', name: 'Java / C++' },
  { icon: '🗄', name: 'SQL / PostgreSQL' },
  { icon: '🤖', name: 'LightGBM / XGBoost' },
  { icon: '🐳', name: 'Git / Docker' },
];

function ChestContents() {
  const { unlock } = useAchievements();
  return (
    <Chapter id="pl-chest" tag="SECRET" title="The Chest Creaks Open">
      <Dialogue text="Inside: a rolled-up scroll with everything on one page, and a handful of well-used tools." />
      <div className="loot">
        {LOOT.map((item) => (
          <div key={item.name} className="loot-slot">
            <span aria-hidden="true">{item.icon}</span>
            {item.name}
          </div>
        ))}
      </div>
      <div className="chapter-stage">
        <a
          href="/resume.pdf"
          download="SiTing_Resume.pdf"
          className="btn btn-primary"
          onClick={() => unlock('recruiter')}
        >
          ↓ Take the résumé scroll
        </a>
      </div>
    </Chapter>
  );
}

const CONTENT = {
  welcome: ({ onClose }) => <ChapterHome onExplore={onClose} />,
  about: () => <ChapterAbout />,
  quests: () => <ChapterQuests />,
  journey: () => <ChapterJourney />,
  churn: () => (
    <Chapter id="pl-churn" tag="ARCADE" title="Churn Predictor" sky="forest">
      <ChurnDemo />
    </Chapter>
  ),
  chess: () => (
    <Chapter id="pl-chess" tag="ARCADE" title="Kwazam Chess" sky="forest">
      <ChessDemo />
    </Chapter>
  ),
  guestbook: () => (
    <Chapter id="pl-guestbook" tag="SIDE QUEST" title="Sign the Guestbook" sky="night">
      <Guestbook />
    </Chapter>
  ),
  contact: () => <ChapterEpilogue />,
  chest: () => <ChestContents />,
};

export default function PlaceModal({ place, onClose }) {
  const closeRef = useRef(null);
  const lastFocus = useRef(null);
  const info = PLACES.find((p) => p.id === place);

  useEffect(() => {
    lastFocus.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      lastFocus.current?.focus?.();
    };
  }, [onClose]);

  if (!info) return null;
  const Body = CONTENT[place];

  return (
    <div className="place-backdrop" onClick={onClose}>
      <div
        className="place-box"
        role="dialog"
        aria-modal="true"
        aria-label={info.name}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="place-head">
          <span className="place-name">📍 {info.name}</span>
          <button ref={closeRef} type="button" className="place-close" onClick={onClose}>
            ✕ <span className="place-close-hint">ESC</span>
          </button>
        </header>
        <div className="place-body">
          <Body onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
