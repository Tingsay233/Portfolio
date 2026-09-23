import { useState } from 'react';
import Chapter, { Dialogue } from '../components/Chapter.jsx';
import Sprite from '../components/Sprite.jsx';
import SceneArt from '../components/SceneArt.jsx';
import { useAchievements } from '../lib/AchievementContext.jsx';
import { ITEMS as EXPERIENCE } from './Experience.jsx';
import { LINKS } from './Contact.jsx';
import { PROJECTS } from './Projects.jsx';

export function ChapterHome({ onExplore }) {
  const { unlock } = useAchievements();

  return (
    <Chapter
      id="ch-home"
      tag="CHAPTER 1"
      title="The Story Begins"
      sky="day"
      art={<SceneArt variant="day" prop="castle" actor="char-wave" />}
    >
      <Dialogue
        speaker="Hi! I'm Say Si Ting —"
        text="a final-year Computer Science student at MMU, specialising in Software Engineering. I build full-stack web apps and machine learning, and I'm looking for a graduate role in software engineering, QA or technical PM."
      />

      <div className="chapter-stage">
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {onExplore ? (
            <button type="button" className="btn btn-primary" onClick={onExplore}>
              Let's explore →
            </button>
          ) : (
            <a href="#ch-quests" className="btn btn-primary">Let's explore →</a>
          )}
          <a
            href="/resume.pdf"
            download="SiTing_Resume.pdf"
            className="btn btn-secondary"
            onClick={() => unlock('recruiter')}
          >
            ↓ Résumé
          </a>
        </div>
      </div>
    </Chapter>
  );
}

export function ChapterAbout() {
  return (
    <Chapter
      id="ch-about"
      tag="CHAPTER 2"
      title="About the Player"
      sky="dusk"
      art={<SceneArt variant="dusk" prop="trees" actor="char-idle" />}
      extra={
        <div className="stones">
        <div className="stone">
          <span className="stone-when">STUDIES</span>
          <p className="stone-title">B.Sc. (Hons.) Computer Science</p>
          <p className="stone-desc">
            MMU Cyberjaya · Software Engineering · CGPA 3.39. Coursework in software
            testing, maintenance, machine learning and databases.
          </p>
        </div>
        <div className="stone">
          <span className="stone-when">LANGUAGES</span>
          <p className="stone-title">English · Mandarin · Bahasa Melayu</p>
          <p className="stone-desc">Bilingual in English and Mandarin, working Bahasa Melayu.</p>
        </div>
          <div className="stone">
            <span className="stone-when">OFF DUTY</span>
            <p className="stone-title">Story games, no PVP</p>
            <p className="stone-desc">Cyberpunk, RDR2, Detroit. Writing something weird. More boba than is advisable.</p>
          </div>
        </div>
      }
    >
      <Dialogue text="Most of what I build lives between web apps and machine learning. I like problems where the interface matters and the maths underneath has to be right — and I think carefully about what I ship. Probably too carefully, sometimes." />
    </Chapter>
  );
}

export function ChapterJourney() {
  return (
    <Chapter
      id="ch-journey"
      tag="CHAPTER 3"
      title="The Journey"
      sky="dusk"
      art={<SceneArt variant="dusk" prop="portal" actor="char-idle" />}
      extra={
        <div className="stones">
          {EXPERIENCE.map((item) => (
            <div key={item.title} className="stone">
              <span className="stone-when">{item.when}</span>
              <p className="stone-title">
                <span aria-hidden="true">{item.icon} </span>
                {item.title}
              </p>
              <p className="stone-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      }
    >
      <Dialogue text="From curiosity to code, every step was a quest. Each one made the next one easier." />
    </Chapter>
  );
}

export function ChapterQuests() {
  const { unlock } = useAchievements();
  const [open, setOpen] = useState(null);

  return (
    <Chapter
      id="ch-quests"
      tag="CHAPTER 4"
      title="My Quests"
      sky="forest"
      art={<SceneArt variant="forest" prop="trees" actor="char-idle" />}
      extra={
        <div className="quests">
        {PROJECTS.map((p) => {
          const isOpen = open === p.id;
          return (
            <article key={p.id} className="quest">
              {p.badge && <span className="quest-badge">{p.badge}</span>}
              <h3 className="quest-name">{p.title}</h3>
              <p className="quest-when">{p.subtitle}</p>
              <p className="quest-desc">
                {isOpen ? p.blurb : `${p.blurb.slice(0, 96)}…`}
              </p>
              {isOpen && <p className="quest-stack">{p.stack.join(' · ')}</p>}
              {isOpen && p.links.length > 0 && (
                <div className="quest-links">
                  {p.links.map((l) => (
                    <a
                      key={l.label}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => unlock('source-diver')}
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="quest-cta"
                style={{ marginTop: '0.6rem' }}
                onClick={() => setOpen(isOpen ? null : p.id)}
                aria-expanded={isOpen}
              >
                {isOpen ? 'CLOSE' : 'VIEW QUEST'}
              </button>
            </article>
          );
        })}
        </div>
      }
    >
      <Dialogue text="Here are the things I've built — academic, client work, and a few for the fun of it." />
    </Chapter>
  );
}

export function ChapterEpilogue() {
  const { unlock } = useAchievements();

  return (
    <Chapter
      id="ch-epilogue"
      tag="EPILOGUE"
      title="The Story Continues…"
      sky="night"
      art={<SceneArt variant="night" prop="campfire" actor="char-sit" />}
    >
      <Dialogue text="Every ending is a new beginning. If any of this sounds like someone your team needs, let's build something together." />

      <div className="connect">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            onClick={() => unlock('pen-pal')}
          >
            {link.label} <span style={{ color: 'var(--dim)' }}>{link.value}</span>
          </a>
        ))}
      </div>
    </Chapter>
  );
}
