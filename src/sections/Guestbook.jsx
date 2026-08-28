import { useEffect, useState } from 'react';
import TypewriterText from '../components/TypewriterText.jsx';
import { getEntries, addEntry } from '../lib/guestbookStorage.js';
import { useAchievements } from '../lib/AchievementContext.jsx';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-MY', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const SEED_ENTRIES = [
  {
    id: 'seed-1',
    name: 'Si Ting',
    message: 'Welcome to my corner of the internet. Leave a note if you visit — I read all of them. ✨',
    when: '2026-05-14T00:00:00Z',
    pinned: true,
  },
];

export default function Guestbook() {
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { unlock } = useAchievements();

  useEffect(() => {
    getEntries().then((stored) => {
      setEntries([...SEED_ENTRIES, ...stored]);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !message.trim() || submitting) return;

    setSubmitting(true);
    const entry = await addEntry({ name: name.trim(), message: message.trim() });
    setEntries((prev) => {
      const pinned = prev.filter((e) => e.pinned);
      const rest = prev.filter((e) => !e.pinned);
      return [...pinned, entry, ...rest];
    });
    setName('');
    setMessage('');
    setSubmitting(false);
    unlock('scribe');
  }

  return (
    <div>
      <div className="container">
        <TypewriterText text="Sign the guestbook." style={{ marginBottom: '0.5rem' }} />
        <p style={{ marginBottom: '2rem', maxWidth: '560px' }}>
          Leave a note — about your work, a question, or just to say hi.
          (Currently stored locally in your browser; I'm wiring this up to a
          real backend soon so notes persist for everyone.)
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="card"
            style={{ background: 'white' }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-muted)',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex from KL"
                maxLength={40}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-muted)',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Anything you'd like to say..."
                maxLength={200}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
              />
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--ink-muted)',
                  textAlign: 'right',
                  marginTop: '0.25rem',
                }}
              >
                {message.length}/200
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={submitting || !name.trim() || !message.trim()}
            >
              {submitting ? 'Sending...' : 'Leave a note →'}
            </button>
          </form>

          {/* Entries */}
          <div>
            {entries.length === 0 ? (
              <div className="card" style={{ background: 'white', textAlign: 'center' }}>
                <p style={{ color: 'var(--ink-muted)' }}>
                  No notes yet. Be the first ✨
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="card"
                    style={{
                      background: entry.pinned ? 'var(--cream-50)' : 'white',
                      padding: '1rem 1.25rem',
                      borderLeft: entry.pinned ? '3px solid var(--accent)' : undefined,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.35rem',
                      }}
                    >
                      <strong
                        style={{
                          color: 'var(--navy-900)',
                          fontSize: '0.9rem',
                        }}
                      >
                        {entry.pinned ? '📌 ' : ''}
                        {entry.name}
                      </strong>
                      <span
                        style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}
                      >
                        {formatDate(entry.when)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{entry.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  border: '1px solid var(--border-strong)',
  borderRadius: 'var(--radius)',
  fontSize: '0.9rem',
  fontFamily: 'var(--font-sans)',
  background: 'var(--cream-50)',
  color: 'var(--ink)',
  outline: 'none',
};
