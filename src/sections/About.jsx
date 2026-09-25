import TypewriterText from '../components/TypewriterText.jsx';

export default function About() {
  return (
    <section id="about" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        <span className="section-label">About</span>
        <TypewriterText text="Full-stack builder with a product mindset." style={{ marginBottom: '2rem' }} />

        <div className="about-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p>
              I am a final-year Computer Science student at Multimedia University
              Cyberjaya, specializing in Software Engineering. My work is mostly
              around full-stack web development, business systems, and practical
              machine learning features.
            </p>
            <p>
              My final year project is an{' '}
              <strong style={{ color: 'var(--navy-900)' }}>
                e-commerce customer retention system
              </strong>{' '}
              that uses RFM segmentation and gradient-boosted models to help
              small businesses identify at-risk customers before they churn. The
              project was presented at CITIC 2026 and received a Best Presenter
              Award.
            </p>
            <p>
              I have also worked on Shopify storefront customization during my
              internship at <strong>Boolland Digital</strong>, a client billing
              system, a LAN-based recruitment system, and community mapping
              software. I enjoy projects where clean implementation, readable UI,
              and real workflow needs all matter.
            </p>
            <p>
              I am fluent in Mandarin, with working knowledge of Bahasa Melayu and English.
              I am currently looking for graduate opportunities where I can keep
              improving as a developer while contributing to useful software.
            </p>
          </div>

          <div className="stats-panel">
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--navy-900)' }}>
              Core Skills
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <SkillLevel
                label="Python / Django"
                level={85}
                note="Built multiple full-stack systems and APIs"
              />
              <SkillLevel
                label="React / JavaScript"
                level={82}
                note="Built portfolio, dashboards, forms, and client UIs"
              />
              <SkillLevel
                label="SQL / Databases"
                level={76}
                note="Worked with PostgreSQL and SQLite project data"
              />
              <SkillLevel
                label="Java"
                level={72}
                note="Built object-oriented game logic with MVC structure"
              />
              <SkillLevel
                label="C++"
                level={68}
                note="Used in coursework and algorithm practice"
              />
              <SkillLevel
                label="ML Models / Analytics"
                level={66}
                note="Applied RFM, LightGBM, and XGBoost in FYP"
              />
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1rem', marginBottom: '1rem', color: 'var(--navy-900)' }}>
                Tools
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Git', 'Docker', 'PostgreSQL', 'Figma', 'VS Code'].map((item) => (
                  <span key={item} className="tag" style={{ background: 'var(--cream-100)', border: '1px solid var(--border)' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .about-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 4rem;
        }

        .stats-panel {
          background: var(--cream-50);
          border: 2px solid var(--border);
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 4px 4px 0 var(--ink);
          height: fit-content;
        }

        .skill-level-item {
          padding: 0.85rem;
          background: rgba(232, 210, 160, 0.55);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }

        .skill-level-top {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: center;
          margin-bottom: 0.45rem;
        }

        .skill-level-name {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--ink);
        }

        .skill-level-note {
          margin-top: 0.45rem;
          font-size: 0.76rem;
          line-height: 1.45;
          color: var(--ink-muted);
        }

        .skill-level-badge {
          flex-shrink: 0;
          font-family: var(--font-pixel);
          font-size: 0.46rem;
          font-weight: 700;
          color: var(--cream-50);
          background: var(--accent);
          border: 1px solid var(--navy-800);
          box-shadow: 2px 2px 0 var(--ink);
          border-radius: var(--radius);
          padding: 0.22rem 0.45rem;
          letter-spacing: 0.04em;
          line-height: 2;
        }

        .skill-level-track {
          width: 100%;
          height: 10px;
          background: var(--cream-100);
          border: 1px solid var(--border-strong);
          border-radius: 2px;
          overflow: hidden;
        }

        .skill-level-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent) 0%, var(--gold) 100%);
          transition: width 0.8s ease;
        }

        @media (max-width: 960px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }
      `}</style>
    </section>
  );
}

function SkillLevel({ label, level, note }) {
  return (
    <div className="skill-level-item">
      <div className="skill-level-top">
        <div className="skill-level-name">
          {label}
        </div>
        <span className="skill-level-badge">
          Lv. {level}
        </span>
      </div>
      <div className="skill-level-track">
        <div className="skill-level-fill" style={{ width: `${level}%` }} />
      </div>
      <p className="skill-level-note">
        {note}
      </p>
    </div>
  );
}
