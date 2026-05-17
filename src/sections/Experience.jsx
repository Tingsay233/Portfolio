import TypewriterText from '../components/TypewriterText.jsx';

const ITEMS = [
  {
    icon: '🏆',
    title: 'Best Presenter Award — CITIC 2026',
    when: 'May 2026',
    desc: 'Awarded at the 6th International Conference on Computer, Information Technology & Intelligent Computing (with DIFCON 2026) at Multimedia University, for the paper "E-Commerce Customer Retention Management System Using RFM Behavioural Analytics and Gradient-Boosted Churn Prediction."',
  },
  {
    icon: '💼',
    title: 'Frontend Developer Intern — Boolland Digital',
    when: 'Jul 2025 — Nov 2025',
    desc: 'Customized Shopify storefronts for client brands using Liquid, JavaScript, and SCSS. Built custom theme sections and schema settings, integrated third-party apps, and shipped work to live production stores.',
  },
  {
    icon: '🎓',
    title: 'B.Sc. (Hons.) Computer Science — MMU Cyberjaya',
    when: 'Jul 2022 — Present',
    desc: 'Software Engineering specialization. CGPA 3.39/4.00. Coursework across software testing, software maintenance, machine learning, databases, and web development.',
  },
];

export default function Experience() {
  return (
    <section id="experience">
      <div className="container">
        <span className="section-label">Journal</span>
        <TypewriterText text="The path so far." style={{ marginBottom: '2.5rem' }} />

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {ITEMS.map((item) => (
            <div
              key={item.title}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr',
                gap: '1rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>{item.icon}</div>
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>{item.title}</h3>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--ink-muted)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {item.when}
                </p>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
