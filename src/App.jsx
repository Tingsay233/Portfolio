import { useCallback, useEffect, useState } from 'react';
import Nav from './components/Nav.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import PixelParticles from './components/PixelParticles.jsx';
import Marquee from './components/Marquee.jsx';
import Scene from './components/Scene.jsx';
import AchievementHUD from './components/AchievementHUD.jsx';
import AchievementToast from './components/AchievementToast.jsx';
import EnvelopeIntro from './components/EnvelopeIntro.jsx';
import ZoneBanner from './components/ZoneBanner.jsx';
import LevelUpModal from './components/LevelUpModal.jsx';
import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Projects from './sections/Projects.jsx';
import Experience from './sections/Experience.jsx';
import ChurnDemo from './sections/ChurnDemo.jsx';
import ChessDemo from './sections/ChessDemo.jsx';
import Guestbook from './sections/Guestbook.jsx';
import Contact from './sections/Contact.jsx';
import Footer from './components/Footer.jsx';
import { useAchievements } from './lib/AchievementContext.jsx';

// Sections that award an achievement once the visitor actually reads them.
const SECTION_ACHIEVEMENTS = [
  ['about', 'backstory'],
  ['projects', 'quest-log'],
  ['experience', 'journal'],
];

export default function App() {
  const { unlock } = useAchievements();
  const [booted, setBooted] = useState(false);
  const handleBooted = useCallback(() => setBooted(true), []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    // section-label only — h2s are handled by TypewriterText
    document.querySelectorAll('.section-label').forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });

    // Skip quest-cards — Projects.jsx handles those
    document.querySelectorAll('.card:not(.quest-card)').forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) =>
        c.classList.contains('card')
      );
      const idx = siblings.indexOf(el);
      el.classList.add('popout');
      el.style.setProperty('--reveal-delay', `${idx * 75}ms`);
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Landing on the page is itself the first achievement — but only once the
  // title screen is out of the way, or its toast plays behind the overlay.
  useEffect(() => {
    if (booted) unlock('arrival');
  }, [booted, unlock]);

  // Award section achievements once a section has actually been read.
  useEffect(() => {
    if (!booted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.dataset.achievement;
          if (id) unlock(id);
          observer.unobserve(entry.target);
        });
      },
      // Only the 10%-30% band of the viewport counts, so a section has to be
      // scrolled up near the top of the screen before it unlocks. A plain
      // threshold would fire on load for anything peeking above the fold.
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    );

    SECTION_ACHIEVEMENTS.forEach(([sectionId, achievementId]) => {
      const el = document.getElementById(sectionId);
      if (!el) return;
      el.dataset.achievement = achievementId;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [booted, unlock]);

  return (
    <>
      <ScrollProgress />

      {/* Floating pixel particles — fixed behind everything */}
      <PixelParticles />

      <Nav />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <Scene
          id="top"
          number="01"
          title="Cold Open"
          direction="EXT. KUALA LUMPUR — DAY"
          caption="Our subject introduces herself. She builds things for fun, and occasionally for clients."
          frameless
        >
          <Hero start={booted} />
        </Scene>

        <Marquee />

        <Scene
          id="about"
          number="02"
          title="Backstory"
          direction="INT. CAMPUS — NIGHT"
          caption="How she got here, and what she reaches for when the brief is open-ended."
        >
          <About />
        </Scene>

        <Scene
          id="projects"
          number="03"
          title="The Work"
          direction="MONTAGE — FIVE BUILDS"
          caption="Five projects, one award, and a great many late nights."
          frameless
        >
          <Projects />
        </Scene>

        <Scene
          id="experience"
          number="04"
          title="The Journal"
          direction="FLASHBACK"
          caption="Where she has been, in order."
        >
          <Experience />
        </Scene>

        <Scene
          id="play-churn"
          number="05"
          title="Audience Participation"
          direction="INSERT — SCREEN"
          caption="Move the sliders. The segmentation logic from her final year project answers back."
          tone="tint"
          frameless
        >
          <ChurnDemo />
        </Scene>

        <Scene
          id="play-chess"
          number="06"
          title="Boss Fight"
          direction="PLAYABLE"
          caption="Her Java engine, rebuilt for the browser. Capture the opposing Sau to win."
          frameless
        >
          <ChessDemo />
        </Scene>

        <Scene
          id="guestbook"
          number="07"
          title="Leave a Mark"
          direction="CUTAWAY"
          caption="Sign the book on your way through. She reads all of them."
          tone="tint"
          frameless
        >
          <Guestbook />
        </Scene>

        <Scene
          id="contact"
          number="08"
          title="Fade Out"
          direction="EXT. — DUSK"
          caption="Roll credits. Or better — say hello."
          tone="dark"
        >
          <Contact />
        </Scene>
      </main>

      <Footer />

      <ZoneBanner enabled={booted} />
      <AchievementToast />
      <AchievementHUD />
      <LevelUpModal />
      <EnvelopeIntro onDone={handleBooted} />
    </>
  );
}
