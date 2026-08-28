import TypewriterText from '../components/TypewriterText.jsx';
import { useAchievements } from '../lib/AchievementContext.jsx';

const LINKS = [
  { label: 'Email', value: 'sitingsay@gmail.com', href: 'mailto:sitingsay@gmail.com' },
  { label: 'LinkedIn', value: '/in/say-si-ting', href: 'https://www.linkedin.com/in/say-si-ting-62051a339/' },
  { label: 'GitHub', value: 'github.com/Tingsay233', href: 'https://github.com/Tingsay233' },
];

export default function Contact() {
  const { unlock } = useAchievements();

  return (
    <section id="contact" style={{ background: 'var(--navy-900)', color: 'var(--cream-100)' }}>
      <div className="container">
        <span
          className="section-label"
          style={{ color: 'var(--accent-soft)' }}
        >
          Send Letter
        </span>
        <TypewriterText
          text="Let's build something. Or just chat."
          style={{ color: 'var(--cream-50)', marginBottom: '1rem' }}
        />
        <p style={{ color: 'var(--cream-200)', maxWidth: '560px', marginBottom: '2.5rem' }}>
          I'm currently open to graduate roles in software engineering, QA, and
          technical PM. Based in Kuala Lumpur, open to remote.
        </p>

        <div style={{ display: 'grid', gap: '0.75rem', maxWidth: '480px' }}>
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              onClick={() => unlock('pen-pal')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                background: 'var(--navy-800)',
                borderRadius: 'var(--radius)',
                color: 'var(--cream-50)',
                borderBottom: 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--navy-700)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--navy-800)')}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-soft)',
                  fontWeight: 600,
                }}
              >
                {link.label}
              </span>
              <span style={{ fontSize: '0.95rem' }}>{link.value} →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
