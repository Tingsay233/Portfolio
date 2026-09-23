import { useCallback, useEffect, useRef, useState } from 'react';
import GameNav from './components/GameNav.jsx';
import { HudLeft, HudRight } from './components/Hud.jsx';
import AchievementHUD from './components/AchievementHUD.jsx';
import AchievementToast from './components/AchievementToast.jsx';
import LevelUpModal from './components/LevelUpModal.jsx';
import ViewToggle from './components/ViewToggle.jsx';
import Footer from './components/Footer.jsx';
import PlainView from './sections/PlainView.jsx';
import Explore from './game/Explore.jsx';
import PlaceModal from './game/Places.jsx';
import MapLegend from './game/MapLegend.jsx';
import { PLACES } from './game/world.js';
import { useAchievements } from './lib/AchievementContext.jsx';

// Places that award an achievement the first time they are opened.
const PLACE_ACHIEVEMENTS = {
  about: 'backstory',
  quests: 'quest-log',
  journey: 'journal',
};

const VIEW_KEY = 'siting-view-v1';
const VISITED_KEY = 'siting-visited-v1';

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode — progress just won't persist */
  }
}

export default function App() {
  const { unlock } = useAchievements();
  const exploreRef = useRef(null);

  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem(VIEW_KEY) === 'plain' ? 'plain' : 'explore';
    } catch {
      return 'explore';
    }
  });
  const [visited, setVisited] = useState(() => {
    const v = load(VISITED_KEY, []);
    return Array.isArray(v) ? v.filter((id) => PLACES.some((p) => p.id === id)) : [];
  });
  const [openPlace, setOpenPlace] = useState(null);
  const [firstVisit, setFirstVisit] = useState(() => visited.length === 0);

  const changeMode = useCallback((next) => {
    setMode(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* private mode — the choice just won't persist */
    }
    window.scrollTo(0, 0);
  }, []);

  // Arriving is the first achievement.
  useEffect(() => {
    unlock('arrival');
  }, [unlock]);

  const openAt = useCallback(
    (place) => {
      setOpenPlace(place);
      setVisited((prev) => {
        if (prev.includes(place)) return prev;
        const next = [...prev, place];
        save(VISITED_KEY, next);
        return next;
      });
      if (PLACE_ACHIEVEMENTS[place]) unlock(PLACE_ACHIEVEMENTS[place]);
    },
    [unlock]
  );

  useEffect(() => {
    if (PLACES.every((p) => visited.includes(p.id))) unlock('cartographer');
  }, [visited, unlock]);

  const closePlace = useCallback(() => setOpenPlace(null), []);
  const petCat = useCallback(() => unlock('cat-friend'), [unlock]);
  const introDone = useCallback(() => setFirstVisit(false), []);
  const travelTo = useCallback((place) => exploreRef.current?.travelTo(place), []);

  if (mode === 'plain') {
    return (
      <>
        <ViewToggle mode={mode} onChange={changeMode} />
        <PlainView />
        <Footer />
      </>
    );
  }

  return (
    <>
      <GameNav mode={mode} onModeChange={changeMode} onTravel={travelTo} visited={visited} />

      <div className="game">
        <HudLeft />

        <main className="world-col">
          <h1 className="sr-only">Say Si Ting — portfolio village</h1>
          <Explore
            ref={exploreRef}
            paused={openPlace !== null}
            visited={visited}
            chestOpened={visited.includes('chest')}
            onOpen={openAt}
            onPetCat={petCat}
            firstVisit={firstVisit}
            onFirstVisit={introDone}
          />
          <MapLegend visited={visited} onTravel={travelTo} onOpen={openAt} />
        </main>

        <HudRight />
      </div>

      <Footer />

      {openPlace && <PlaceModal place={openPlace} onClose={closePlace} />}

      <AchievementToast />
      <AchievementHUD />
      <LevelUpModal />
    </>
  );
}
