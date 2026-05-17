import TypewriterText from '../components/TypewriterText.jsx';

export default function About() {
  return (
    <section id="about" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        <span className="section-label">Character Profile</span>
        <TypewriterText text="Easy to get overwhelmed by my own curiosity." style={{ marginBottom: '2rem' }} />
        
        <div className="about-grid">
          {/* Left Column: Story */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p>
              I'm a final-year CS student at MMU Cyberjaya, focusing on software
              engineering. Most of what I build lives somewhere between web apps
              and machine learning — I like problems where the interface matters
              <em> and</em> the math underneath has to be right.
            </p>
            <p>
              My final year project is an{' '}
              <strong style={{ color: 'var(--navy-900)' }}>
                e-commerce customer retention system
              </strong>{' '}
              that uses RFM segmentation and gradient-boosted models (LightGBM,
              XGBoost) to help small businesses spot at-risk customers before
              they churn. I presented a paper on it at{' '}
              <strong style={{ color: 'var(--navy-900)' }}>CITIC 2026</strong>{' '}
              and somehow walked away with a Best Presenter Award.
            </p>
            <p>
              Outside the FYP I've built a Shopify storefront or two during my
              internship at <strong>Boolland Digital</strong>, a billing system
              for a family-run business, and an internal recruitment tool for a
              swimming institution. I work mostly in Python, JavaScript, Java, 
              and C++ — and I think carefully about what I'm shipping. Probably too
              carefully, sometimes.
            </p>
            <p>
              When I'm not coding I'm usually playing a single-player story game
              (Cyberpunk, RDR2, Detroit), avoiding anything PVP, or writing
              something weird. I'm bilingual in English and Mandarin, working in
              Bahasa Melayu.
            </p>
          </div>

          {/* Right Column: Stats */}
          <div className="stats-panel">
            <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--navy-900)' }}>
              Current Attributes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <StatBar label="Python / Django" percentage={85} />
              <StatBar label="React / JavaScript" percentage={80} />
              <StatBar label="C++" percentage={75} />
              <StatBar label="Java" percentage={70} />
              <StatBar label="ML (LightGBM / XGBoost)" percentage={65} />
              <StatBar label="SQL / Databases" percentage={75} />
            </div>
            
            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '1rem', marginBottom: '1rem', color: 'var(--navy-900)' }}>
                Equipped Items
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Git', 'Docker', 'PostgreSQL', 'Figma', 'VS Code'].map(item => (
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

        .stat-bar-container {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .stat-bar-header {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--ink);
        }

        .stat-bar-track {
          width: 100%;
          height: 12px;
          background: var(--cream-100);
          border: 1px solid var(--border);
          border-radius: 2px;
          overflow: hidden;
        }

        .stat-bar-fill {
          height: 100%;
          background: var(--accent);
          transition: width 1s ease-out;
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

function StatBar({ label, level, percentage }) {
  return (
    <div className="stat-bar-container">
      <div className="stat-bar-header">
        <span>{label}</span>
      </div>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
