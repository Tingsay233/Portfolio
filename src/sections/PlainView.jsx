import { ITEMS as EXPERIENCE } from './Experience.jsx';
import { LINKS } from './Contact.jsx';
import { PROJECTS } from './Projects.jsx';
import Logo from '../components/Logo.jsx';

/*
 * The recruiter view: the same content as the story, with none of the game.
 * Scannable in about twenty seconds, which is roughly what a first pass gets.
 */

const SKILLS = [
  { group: 'Languages',  items: ['Python', 'JavaScript', 'Java', 'C++', 'SQL'] },
  { group: 'Frameworks', items: ['Django', 'React', 'Vite', 'Ant Design'] },
  { group: 'Machine learning', items: ['LightGBM', 'XGBoost', 'RFM segmentation'] },
  { group: 'Tools', items: ['Git', 'Docker', 'PostgreSQL', 'Figma'] },
];

export default function PlainView() {
  return (
    <main className="plain">
      <header className="plain-head">
        <h1 className="plain-name">
          <Logo size={44} title="" className="plain-logo" />
          Say Si Ting
        </h1>
        <p className="plain-role">
          Final-year Computer Science student at Multimedia University,
          specialising in Software Engineering. Full-stack web and machine
          learning. Seeking graduate roles in software engineering, QA, or
          technical PM.
        </p>
        <p className="plain-meta">Kuala Lumpur, Malaysia · Open to remote</p>

        <div className="plain-actions">
          <a className="btn btn-primary" href="/resume.pdf" download="SiTing_Resume.pdf">
            Download résumé (PDF)
          </a>
          {LINKS.map((link) => (
            <a
              key={link.label}
              className="btn btn-secondary"
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </header>

      <section className="plain-section">
        <h2 className="plain-h2">Selected projects</h2>
        <ul className="plain-list">
          {PROJECTS.map((p) => (
            <li key={p.id} className="plain-item">
              <div className="plain-item-head">
                <h3 className="plain-item-title">{p.title}</h3>
                <span className="plain-item-when">{p.subtitle}</span>
              </div>
              <p className="plain-item-desc">{p.blurb}</p>
              <p className="plain-stack">{p.stack.join(' · ')}</p>
              {p.links.length > 0 && (
                <p className="plain-links">
                  {p.links.map((l) => (
                    <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.label} ↗
                    </a>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="plain-section">
        <h2 className="plain-h2">Experience &amp; education</h2>
        <ul className="plain-list">
          {EXPERIENCE.map((item) => (
            <li key={item.title} className="plain-item">
              <div className="plain-item-head">
                <h3 className="plain-item-title">{item.title}</h3>
                <span className="plain-item-when">{item.when}</span>
              </div>
              <p className="plain-item-desc">{item.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="plain-section">
        <h2 className="plain-h2">Skills</h2>
        <dl className="plain-skills">
          {SKILLS.map((s) => (
            <div key={s.group} className="plain-skill-row">
              <dt>{s.group}</dt>
              <dd>{s.items.join(', ')}</dd>
            </div>
          ))}
        </dl>
        <p className="plain-note">
          Also: English and Mandarin (bilingual), working Bahasa Melayu.
        </p>
      </section>

      <section className="plain-section">
        <h2 className="plain-h2">Contact</h2>
        <ul className="plain-contact">
          {LINKS.map((link) => (
            <li key={link.label}>
              <span>{link.label}</span>
              <a
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
              >
                {link.value}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
