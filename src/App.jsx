import { useEffect } from 'react';
import Nav from './components/Nav.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import PixelParticles from './components/PixelParticles.jsx';
import Marquee from './components/Marquee.jsx';
import AchievementHUD from './components/AchievementHUD.jsx';
import AchievementToast from './components/AchievementToast.jsx';
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
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', `${idx * 75}ms`);
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Landing on the page is itself the first achievement.
  useEffect(() => {
    unlock('arrival');
  }, [unlock]);

  // Award section achievements once a section has actually been read.
  useEffect(() => {
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
  }, [unlock]);

  return (
    <>
      <ScrollProgress />

      {/* Floating pixel particles — fixed behind everything */}
      <PixelParticles />

      <Nav />

      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <Marquee />
        <About />
        <Projects />
        <Experience />
        <ChurnDemo />
        <ChessDemo />
        <Guestbook />
        <Contact />
      </main>

      <Footer />

      <AchievementToast />
      <AchievementHUD />
    </>
  );
}
