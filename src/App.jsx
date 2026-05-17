import { useEffect } from 'react';
import Nav from './components/Nav.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';
import PixelParticles from './components/PixelParticles.jsx';
import Marquee from './components/Marquee.jsx';
import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Projects from './sections/Projects.jsx';
import Experience from './sections/Experience.jsx';
import ChurnDemo from './sections/ChurnDemo.jsx';
import ChessDemo from './sections/ChessDemo.jsx';
import Guestbook from './sections/Guestbook.jsx';
import Contact from './sections/Contact.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
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
    </>
  );
}
