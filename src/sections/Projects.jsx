import { useEffect, useRef, useState } from 'react';
import TypewriterText from '../components/TypewriterText.jsx';

const PROJECTS = [
  {
    num: '01',
    title: 'E-Commerce Customer Retention System',
    subtitle: 'Final Year Project | 2025-2026',
    blurb:
      'Built a full-stack analytics platform that helps small e-commerce teams identify at-risk customers using RFM segmentation and gradient-boosted churn prediction.',
    impact: 'Presented the research at CITIC 2026 and won Best Presenter.',
    stack: ['Django', 'React', 'PostgreSQL', 'LightGBM', 'XGBoost'],
    accent: 'flagship',
    links: [],
  },
  {
    num: '02',
    title: 'PSS Billing System',
    subtitle: 'Client Project | 2026',
    blurb:
      'Built a billing platform for invoice and quotation management, including role-based access, auto-generated invoice numbers, PDF export, and bilingual EN/CN support.',
    impact: 'Designed for a real business workflow with admin and staff usage.',
    stack: ['React 19', 'Django', 'Ant Design', 'ECharts', 'SQLite'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Tingsay233/PSS-Billing-System' },
    ],
  },
  {
    num: '03',
    title: 'Internal Recruitment Management System',
    subtitle: 'D Swim Academy | 2025',
    blurb:
      'Developed a LAN-based HR system for candidate registration, PIC review, offer letter generation, IC document handling, and onboarding flow.',
    impact: 'Built for tablet-kiosk usage without relying on internet access.',
    stack: ['React', 'Vite', 'Django', 'PostgreSQL', 'LAN Deployment'],
    links: [],
  },
  {
    num: '04',
    title: 'CommuMap',
    subtitle: 'Community Resource Mapping | 2026',
    blurb:
      'Created a Django platform that maps community resources such as clinics, shelters, libraries, and food banks with moderation and live capacity indicators.',
    impact: 'Focused on practical access to nearby support services.',
    stack: ['Django', 'Python', 'HTML/CSS', 'SQLite', 'Docker'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Tingsay233/Community-Map' },
    ],
  },
  {
    num: '05',
    title: 'Kwazam Chess',
    subtitle: 'Java Game Engine | 2024-2025',
    blurb:
      'Implemented a custom chess variant in Java with MVC structure, unique movement rules, board flipping, piece transformation, and save/load support.',
    impact: 'Demonstrates object-oriented design, game state management, and rule implementation.',
    stack: ['Java', 'MVC'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Tingsay233/Kwazam-Chess' },
    ],
  },
];

const BG_DECOR = [
  { top: '8%', left: '72%', char: '+', size: '2.2rem', color: 'var(--gold)', opacity: 0.13 },
  { top: '28%', left: '88%', char: '*', size: '1.4rem', color: 'var(--accent)', opacity: 0.1 },
  { top: '52%', left: '76%', char: '+', size: '2.8rem', color: 'var(--gold-light)', opacity: 0.09 },
  { top: '72%', left: '91%', char: '+', size: '1rem', color: 'var(--gold)', opacity: 0.13 },
  { top: '18%', left: '95%', char: '*', size: '0.95rem', color: 'var(--accent)', opacity: 0.08 },
  { top: '88%', left: '80%', char: '+', size: '1.6rem', color: 'var(--gold-light)', opacity: 0.1 },
  { top: '40%', left: '68%', char: '+', size: '0.95rem', color: 'var(--gold)', opacity: 0.07 },
];

export default function Projects() {
  const [visible, setVisible] = useState(new Set());
  const cardRefs = useRef([]);

  useEffect(() => {
    const observers = cardRefs.current.map((el, index) => {
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible((prev) => new Set([...prev, index]));
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );

      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  return (
    <section
      id="projects"
      style={{
        position: 'relative',
        backgroundImage: [
          'radial-gradient(circle, rgba(61,43,31,0.07) 1px, transparent 1px)',
          'linear-gradient(135deg, rgba(200,150,12,0.04) 0%, rgba(74,124,63,0.04) 50%, rgba(200,150,12,0.03) 100%)',
        ].join(', '),
        backgroundSize: '32px 32px, 100% 100%',
        backgroundAttachment: 'fixed, fixed',
      }}
    >
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
        <span className="section-label">Projects</span>
        <TypewriterText text="Selected work." style={{ marginBottom: '0.5rem' }} />
        <p style={{ marginBottom: '0.5rem', maxWidth: '620px' }}>
          A focused set of full-stack, client, academic, and interactive projects.
        </p>
        <p className="scroll-hint-label">Scroll to browse the stacked project cards.</p>

        <div className="project-stack">
          {PROJECTS.map((project, index) => (
            <div
              key={project.title}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="project-stack-sticky"
              style={{
                top: `${92 + index * 12}px`,
                zIndex: index + 1,
              }}
            >
              <ProjectCard
                project={project}
                visible={visible.has(index)}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .scroll-hint-label {
          font-family: var(--font-pixel);
          font-size: 0.55rem;
          letter-spacing: 0.06em;
          color: var(--ink-muted);
          margin-bottom: 2rem;
          opacity: 0.7;
        }

        .project-stack {
          max-width: 760px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 30vh;
          padding-bottom: 20vh;
        }

        .project-stack-sticky {
          position: sticky;
        }

        @media (max-width: 1023px) {
          #projects { background-attachment: scroll, scroll !important; }
        }

        @media (max-width: 640px) {
          .project-stack {
            gap: 38vh;
            padding-bottom: 15vh;
          }
        }
      `}</style>
    </section>
  );
}

function ProjectCard({ project, visible, index }) {
  const isFlagship = project.accent === 'flagship';

  return (
    <div
      className={`card quest-card${visible ? ' quest-popped' : ''}`}
      style={{
        borderLeft: isFlagship ? '4px solid var(--accent)' : undefined,
        borderRadius: isFlagship ? '0 4px 4px 0' : '4px',
        background: isFlagship ? 'var(--cream-100)' : 'var(--cream-50)',
        boxShadow: `${6 + index * 2}px ${6 + index * 2}px 0 var(--ink)`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
          {project.num}
        </span>
        {isFlagship && (
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              padding: '0.15rem 0.55rem',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: '4px',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Best Presenter | CITIC 2026
          </span>
        )}
      </div>

      <h3 style={{ marginBottom: '0.2rem' }}>{project.title}</h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>
        {project.subtitle}
      </p>
      <p style={{ marginBottom: '0.8rem', flexGrow: 1 }}>{project.blurb}</p>
      <p style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--navy-800)' }}>
        {project.impact}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          {project.stack.map((item) => (
            <span key={item} className="tag">{item}</span>
          ))}
        </div>
        {project.links.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {project.links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
              >
                {link.label} -&gt;
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
