import { useCallback, useEffect, useState } from 'react';
import GameNav from './components/GameNav.jsx';
import { HudLeft, HudRight } from './components/Hud.jsx';
import Chapter from './components/Chapter.jsx';
import AchievementHUD from './components/AchievementHUD.jsx';
import AchievementToast from './components/AchievementToast.jsx';
import LevelUpModal from './components/LevelUpModal.jsx';
import ViewToggle from './components/ViewToggle.jsx';
import Footer from './components/Footer.jsx';
import {
  ChapterHome,
  ChapterAbout,
  ChapterJourney,
  ChapterQuests,
  ChapterEpilogue,
} from './sections/Chapters.jsx';
import ChurnDemo from './sections/ChurnDemo.jsx';
import ChessDemo from './sections/ChessDemo.jsx';
import Guestbook from './sections/Guestbook.jsx';
import PlainView from './sections/PlainView.jsx';
import { useAchievements } from './lib/AchievementContext.jsx';

// Chapters that award an achievement once they have been read.
const CHAPTER_ACHIEVEMENTS = [
  ['ch-about', 'backstory'],
  ['ch-quests', 'quest-log'],
  ['ch-journey', 'journal'],
];

export default function App() {
  const { unlock } = useAchievements();

  const [mode, setMode] = useState(function () {
    try {
      return localStorage.getItem('siting-view-v1') === 'plain' ? 'plain' : 'story';
    } catch {
      return 'story';
    }
  });

  const changeMode = useCallback(function (next) {
    setMode(next);
    try {
      localStorage.setItem('siting-view-v1', next);
    } catch {
      /* private mode — the choice just won't persist */
    }
    window.scrollTo(0, 0);
  }, []);

  // Arriving is the first achievement.
  useEffect(() => {
    unlock('arrival');
  }, [unlock]);

  // Reading a chapter awards its achievement once it is properly on screen.
  useEffect(() => {
    if (mode !== 'story') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.dataset.achievement;
          if (id) unlock(id);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '-10% 0px -55% 0px', threshold: 0 }
    );

    CHAPTER_ACHIEVEMENTS.forEach(([chapterId, achievementId]) => {
      const el = document.getElementById(chapterId);
      if (!el) return;
      el.dataset.achievement = achievementId;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [mode, unlock]);

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
      <GameNav mode={mode} onModeChange={changeMode} />

      <div className="game">
        <HudLeft />

        <main className="chapters">
          <ChapterHome />
          <ChapterAbout />
          <ChapterJourney />
          <ChapterQuests />

          <Chapter id="ch-arcade" tag="CHAPTER 5" title="The Arcade" sky="forest">
            <ChurnDemo />
            <ChessDemo />
          </Chapter>

          <Chapter id="ch-guestbook" tag="SIDE QUEST" title="Sign the Guestbook" sky="night">
            <Guestbook />
          </Chapter>

          <ChapterEpilogue />
        </main>

        <HudRight />
      </div>

      <Footer />

      <AchievementToast />
      <AchievementHUD />
      <LevelUpModal />
    </>
  );
}
