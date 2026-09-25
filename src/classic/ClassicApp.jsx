import { useEffect, useState } from 'react';
import { ViewSwitch, useView } from '../view.jsx';
import { PROFILE, ABOUT, LANGUAGES, SKILLS, TOOLS, PROJECTS, EXPERIENCE } from '../pixel/data.js';

/* The classic view: a clean, résumé-style page built from the same data as
   the creative view. No sprites, no animation — easy to scan and to print. */

const SECTIONS = [
  { id: 'summary', label: 'Summary' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
];

const work = EXPERIENCE.filter((e) => e.type === 'work');
const education = EXPERIENCE.filter((e) => e.type === 'education');
const awards = EXPERIENCE.filter((e) => e.type === 'award');

function Section({ id, title, children }) {
  return (
    <section className="c-section" id={id} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`}>{title}</h2>
      <div className="c-section__body">{children}</div>
    </section>
  );
}

function Entry({ title, org, when, children }) {
  return (
    <article className="c-entry">
      <header className="c-entry__head">
        <div>
          <h3>{title}</h3>
          {org && <div className="c-entry__org">{org}</div>}
        </div>
        {when && <span className="c-entry__when">{when}</span>}
      </header>
      {children}
    </article>
  );
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return scrolled;
}

export default function ClassicApp() {
  const scrolled = useScrolled();
  const { setView } = useView();
  const current = work[0];

  return (
    <div className="classic">
      <a className="c-skip" href="#summary">Skip to content</a>

      <header className={`c-nav${scrolled ? ' is-scrolled' : ''}`}>
        <div className="c-wrap c-nav__inner">
          <a href="#top" className="c-nav__name">{PROFILE.name}</a>
          <nav className="c-nav__links" aria-label="Sections">
            {SECTIONS.map((s) => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}
          </nav>
          <ViewSwitch className="view-switch--light" />
        </div>
      </header>

      <main className="c-wrap" id="top">
        {/* ---- header ---- */}
        <div className="c-hero">
          <div className="c-hero__text">
            <h1>{PROFILE.name}</h1>
            <p className="c-hero__role">
              {current ? `${current.title}, ${current.org}` : PROFILE.role} · {PROFILE.role}
            </p>
            <p className="c-hero__meta">
              {PROFILE.location} · <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
            </p>
            <div className="c-hero__actions">
              <a className="c-btn c-btn--primary" href={PROFILE.resume} download="SiTing_Resume.pdf">Download CV (PDF)</a>
              <a className="c-btn" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a className="c-btn" href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
          <dl className="c-facts">
            <div><dt>Current role</dt><dd>{current ? `${current.title} · ${current.org}` : '—'}</dd></div>
            <div><dt>Education</dt><dd>B.Sc. (Hons.) Computer Science, MMU · CGPA 3.39</dd></div>
            <div><dt>Recognition</dt><dd>Best Presenter, CITIC 2026</dd></div>
            <div><dt>Looking for</dt><dd>{PROFILE.lookingFor}</dd></div>
          </dl>
        </div>

        {/* ---- summary ---- */}
        <Section id="summary" title="Summary">
          {ABOUT.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
        </Section>

        {/* ---- experience ---- */}
        <Section id="experience" title="Experience">
          {work.map((e) => (
            <Entry key={e.title} title={e.title} org={e.org} when={e.when}>
              <p>{e.desc}</p>
            </Entry>
          ))}
        </Section>

        {/* ---- projects ---- */}
        <Section id="projects" title="Projects">
          {PROJECTS.map((p) => (
            <Entry key={p.title} title={p.title} org={p.meta} when={p.badge}>
              <p>{p.blurb}</p>
              <p className="c-outcome"><span>Outcome:</span> {p.impact}</p>
              <p className="c-stack"><span>Stack:</span> {p.stack.join(', ')}</p>
              {p.links.length > 0 && (
                <p className="c-links">
                  {p.links.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                  ))}
                </p>
              )}
            </Entry>
          ))}
        </Section>

        {/* ---- skills ---- */}
        <Section id="skills" title="Skills">
          <table className="c-skills">
            <tbody>
              {SKILLS.map((s) => (
                <tr key={s.name}>
                  <th scope="row">{s.name}</th>
                  <td>{s.note}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">Tools</th>
                <td>{TOOLS.join(', ')}</td>
              </tr>
              <tr>
                <th scope="row">Languages</th>
                <td>{LANGUAGES.map((l) => `${l.name} (${l.level.toLowerCase()})`).join(', ')}</td>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* ---- education & awards ---- */}
        <Section id="education" title="Education & Awards">
          {education.map((e) => (
            <Entry key={e.title} title={e.title} org={e.org} when={e.when}>
              <p>{e.desc}</p>
            </Entry>
          ))}
          {awards.map((e) => (
            <Entry key={e.title} title={e.title} org={e.org} when={e.when}>
              <p>{e.desc}</p>
            </Entry>
          ))}
        </Section>

        {/* ---- contact ---- */}
        <Section id="contact" title="Contact">
          <p>{PROFILE.lookingFor}</p>
          <ul className="c-contact">
            <li><span>Email</span><a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a></li>
            <li><span>LinkedIn</span><a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">linkedin.com/in/say-si-ting</a></li>
            <li><span>GitHub</span><a href={PROFILE.github} target="_blank" rel="noopener noreferrer">github.com/Tingsay233</a></li>
            <li><span>CV</span><a href={PROFILE.resume} download="SiTing_Resume.pdf">Download PDF</a></li>
          </ul>
        </Section>

        <footer className="c-footer">
          © {new Date().getFullYear()} {PROFILE.name}
          <span className="c-footer__hint">
            Prefer something more playful? <a
              href="?view=creative"
              onClick={(e) => { e.preventDefault(); setView('creative'); }}
            >See the creative version</a> with interactive demos.
          </span>
        </footer>
      </main>
    </div>
  );
}
