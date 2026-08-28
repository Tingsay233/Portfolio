import { useEffect, useRef, useState } from 'react';
import TypewriterText from '../components/TypewriterText.jsx';
import { useAchievements } from '../lib/AchievementContext.jsx';

/* ── Line-art sigils, one per quest — squared caps to keep the pixel feel ── */
const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
};

function Sigil({ kind }) {
  const marks = {
    // Nested rings — customers held closer to the centre
    retention: (
      <>
        <rect x="4" y="4" width="40" height="40" {...S} />
        <rect x="13" y="13" width="22" height="22" {...S} />
        <rect x="21" y="21" width="6" height="6" {...S} fill="currentColor" />
      </>
    ),
    // Stacked ledger lines
    billing: (
      <>
        <rect x="6" y="5" width="36" height="38" {...S} />
        <line x1="13" y1="16" x2="35" y2="16" {...S} />
        <line x1="13" y1="24" x2="35" y2="24" {...S} />
        <line x1="13" y1="32" x2="27" y2="32" {...S} />
      </>
    ),
    // Selection grid — one candidate picked
    hiring: (
      <>
        <rect x="5" y="5" width="17" height="17" {...S} />
        <rect x="26" y="5" width="17" height="17" {...S} fill="currentColor" />
        <rect x="5" y="26" width="17" height="17" {...S} />
        <rect x="26" y="26" width="17" height="17" {...S} />
      </>
    ),
    // Node graph — services linked across a community
    map: (
      <>
        <line x1="11" y1="12" x2="37" y2="24" {...S} />
        <line x1="37" y1="24" x2="14" y2="38" {...S} />
        <line x1="11" y1="12" x2="14" y2="38" {...S} />
        <rect x="7" y="8" width="8" height="8" {...S} fill="currentColor" />
        <rect x="33" y="20" width="8" height="8" {...S} />
        <rect x="10" y="34" width="8" height="8" {...S} />
      </>
    ),
    // Board squares
    board: (
      <>
        <rect x="5" y="5" width="38" height="38" {...S} />
        <rect x="5" y="5" width="12.6" height="12.6" fill="currentColor" stroke="none" />
        <rect x="30.4" y="5" width="12.6" height="12.6" fill="currentColor" stroke="none" />
        <rect x="17.6" y="17.6" width="12.6" height="12.6" fill="currentColor" stroke="none" />
        <rect x="5" y="30.4" width="12.6" height="12.6" fill="currentColor" stroke="none" />
        <rect x="30.4" y="30.4" width="12.6" height="12.6" fill="currentColor" stroke="none" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 48 48" className="quest-sigil" aria-hidden="true">
      {marks[kind]}
    </svg>
  );
}

const PROJECTS = [
  {
    id: 'retention',
    num: '01',
    title: 'E-Commerce Customer Retention System',
    subtitle: 'Final Year Project · 2025-2026',
    blurb:
      'A full-stack platform that helps small e-commerce businesses identify at-risk customers using RFM segmentation and gradient-boosted churn models. Won Best Presenter at CITIC 2026.',
    stack: ['Django', 'React', 'PostgreSQL', 'LightGBM', 'XGBoost'],
    categories: ['ml', 'fullstack'],
    flagship: true,
    badge: 'Best Presenter · CITIC 2026',
    links: [],
  },
  {
    id: 'billing',
    num: '02',
    title: 'PSS Billing System',
    subtitle: 'Client Project · 2026',
    blurb:
      'Full-stack billing platform for a business owner: invoices, quotations, and status tracking. Auto-generated invoice numbers, PDF export, JWT auth with admin/staff roles, sales dashboard with ECharts, and bilingual (EN/CN) support.',
    stack: ['React 19', 'Django', 'Ant Design', 'ECharts', 'SQLite'],
    categories: ['client', 'fullstack'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Tingsay233/PSS-Billing-System' },
    ],
  },
  {
    id: 'hiring',
    num: '03',
    title: 'Internal Recruitment Management System',
    subtitle: 'D Swim Academy · 2025',
    blurb:
      'A tablet-kiosk HR system deployed on the company LAN (no internet required). Candidate portal, PIC dashboard, offer letter generation, IC document scanning, and onboarding flow.',
    stack: ['React', 'Vite', 'Django', 'PostgreSQL', 'LAN Deployment'],
    categories: ['client', 'fullstack'],
    links: [],
  },
  {
    id: 'commumap',
    num: '04',
    title: 'CommuMap',
    subtitle: 'Community Resource Mapping · 2026',
    blurb:
      'A Django web platform that maps community services: clinics, shelters, libraries, and food banks onto a single interactive interface. Features a "Help Me Now" emergency button, live capacity indicators, and a three-tier moderation system.',
    stack: ['Django', 'Python', 'HTML/CSS', 'SQLite', 'Docker'],
    categories: ['fullstack'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Tingsay233/Community-Map' },
    ],
  },
  {
    id: 'kwazam',
    num: '05',
    title: 'Kwazam Chess',
    subtitle: 'Java Game Engine · 2024-2025',
    blurb:
      'A chess variant built in pure Java without GUI libraries. MVC architecture, custom rule set, and a text-file-based save/load system. Try the playable version below.',
    stack: ['Java', 'MVC'],
    categories: ['games'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Tingsay233/Kwazam-Chess' },
    ],
  },
];

const SIGILS = {
  retention: 'retention',
  billing: 'billing',
  hiring: 'hiring',
  commumap: 'map',
  kwazam: 'board',
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'fullstack', label: 'Full-stack' },
  { id: 'ml', label: 'Machine Learning' },
  { id: 'client', label: 'Client Work' },
  { id: 'games', label: 'Games' },
];

const BG_DECOR = [
  { top: '8%',  left: '72%', char: '✦', size: '2.2rem',  color: 'var(--gold)',       opacity: 0.13 },
  { top: '28%', left: '88%', char: '★', size: '1.4rem',  color: 'var(--accent)',     opacity: 0.1  },
  { top: '52%', left: '76%', char: '✦', size: '2.8rem',  color: 'var(--gold-light)', opacity: 0.09 },
  { top: '72%', left: '91%', char: '✦', size: '1rem',    color: 'var(--gold)',       opacity: 0.13 },
  { top: '18%', left: '95%', char: '★', size: '0.95rem', color: 'var(--accent)',     opacity: 0.08 },
];

export default function Projects() {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [visible, setVisible] = useState(new Set());
  const tileRefs = useRef({});

  const shown =
    filter === 'all'
      ? PROJECTS
      : PROJECTS.filter((p) => p.categories.includes(filter));

  // Pop each tile in as it scrolls into view. Re-runs on filter changes so
  // tiles that swap in are observed too.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.dataset.quest;
          setVisible((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    shown.forEach((p) => {
      const el = tileRefs.current[p.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  function changeFilter(next) {
    setFilter(next);
    setExpanded(null);
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {BG_DECOR.map((decor, index) => (
          <span
            key={index}
            style={{
              position: 'absolute',
              top: decor.top,
              left: decor.left,
              fontSize: decor.size,
              color: decor.color,
              opacity: decor.opacity,
              userSelect: 'none',
            }}
          >
            {decor.char}
          </span>
        ))}
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        <div className="quest-head">
          <div>
            <TypewriterText text="Things I've built." style={{ marginBottom: '0.5rem' }} />
            <p style={{ maxWidth: '460px' }}>
              A mix of academic, client, and side projects. Open a card for the
              full brief.
            </p>
          </div>

          <div className="quest-filters" role="tablist" aria-label="Filter projects">
            {FILTERS.map((f) => {
              const count =
                f.id === 'all'
                  ? PROJECTS.length
                  : PROJECTS.filter((p) => p.categories.includes(f.id)).length;
              if (count === 0) return null;
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`quest-filter${active ? ' is-active' : ''}`}
                  onClick={() => changeFilter(f.id)}
                >
                  {f.label}
                  <span className="quest-filter-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="quest-grid">
          {shown.map((project) => (
            <QuestTile
              key={project.id}
              project={project}
              popped={visible.has(project.id)}
              open={expanded === project.id}
              onToggle={() =>
                setExpanded((cur) => (cur === project.id ? null : project.id))
              }
              tileRef={(el) => {
                tileRefs.current[project.id] = el;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestTile({ project, popped, open, onToggle, tileRef }) {
  const { unlock } = useAchievements();
  const flagship = project.flagship;

  return (
    <article
      ref={tileRef}
      data-quest={project.id}
      className={`card quest-card quest-tile${popped ? ' quest-popped' : ''}${
        flagship ? ' is-flagship' : ''
      }${open ? ' is-open' : ''}`}
    >
      <header className="quest-tile-top">
        <span className="quest-num">{project.num}</span>
        {project.badge && <span className="quest-badge">{project.badge}</span>}
      </header>

      <Sigil kind={SIGILS[project.id]} />

      <h3 className="quest-title">{project.title}</h3>
      <p className="quest-subtitle">{project.subtitle}</p>

      {/* Flagships carry their brief up front — the rest reveal it on demand */}
      {(flagship || open) && <p className="quest-blurb">{project.blurb}</p>}

      {open && (
        <div className="quest-detail">
          <div className="quest-stack">
            {project.stack.map((item) => (
              <span key={item} className="tag">{item}</span>
            ))}
          </div>
          {project.links.length > 0 && (
            <div className="quest-links">
              {project.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => unlock('source-diver')}
                  className="btn btn-secondary quest-link"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      <footer className="quest-tile-foot">
        <span className="quest-stack-peek">
          {project.stack.slice(0, 2).join(' · ')}
          {project.stack.length > 2 && ` +${project.stack.length - 2}`}
        </span>
        <button
          type="button"
          className="quest-expand"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${open ? 'Hide' : 'Show'} details for ${project.title}`}
        >
          {open ? '×' : '+'}
        </button>
      </footer>
    </article>
  );
}
