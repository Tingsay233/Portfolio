import { useState, useEffect } from 'react';

const HIGHLIGHTS = [
  'Best Presenter at CITIC 2026 for an ML-backed customer retention system',
  'Frontend Developer Intern experience building Shopify storefronts',
  'Built client-facing billing, recruitment, and community mapping systems',
];

const GREETING = 'Hello, I am';
const LINE1 = 'Say Si Ting';
const LINE2 = 'Final-year Computer Science student';
const BIO =
  'I build full-stack web applications with React, Django, Python, and SQL. I am currently looking for graduate roles in software engineering, QA, or product-focused technical roles.';

function Cursor({ blink = false }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '2px',
        height: '0.85em',
        background: 'var(--accent)',
        marginLeft: '3px',
        verticalAlign: 'middle',
        animation: blink ? 'cursorBlink 1s step-end infinite' : 'none',
      }}
    />
  );
}

function typeString(text, setter, speed) {
  return new Promise((resolve) => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setter(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Hero() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [greeting, setGreeting] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [bio, setBio] = useState('');
  const [activeField, setActiveField] = useState('');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const onMove = (event) => {
      setMouse({
        x: event.clientX / window.innerWidth - 0.5,
        y: event.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    async function run() {
      await wait(250);

      setActiveField('greeting');
      await typeString(GREETING, setGreeting, 36);

      await wait(90);
      setActiveField('line1');
      await typeString(LINE1, setLine1, 38);

      await wait(90);
      setActiveField('line2');
      await typeString(LINE2, setLine2, 24);

      await wait(110);
      setActiveField('bio');
      await typeString(BIO, setBio, 5);

      setActiveField('done');
      setShowContent(true);
    }

    run();
  }, []);

  function skip() {
    setGreeting(GREETING);
    setLine1(LINE1);
    setLine2(LINE2);
    setBio(BIO);
    setActiveField('done');
    setShowContent(true);
  }

  const typing = activeField !== '' && activeField !== 'done';

  return (
    <section
      id="top"
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '4rem',
        paddingBottom: '6rem',
        borderBottom: 'none',
      }}
    >
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[
          { top: '12%', right: '6%', size: '3rem', color: 'var(--gold)', opacity: 0.13, mx: -22, my: -12, dur: 0.5, char: '*' },
          { top: '35%', right: '14%', size: '1.2rem', color: 'var(--accent)', opacity: 0.18, mx: -32, my: -16, dur: 0.4, char: '+' },
          { top: '8%', right: '28%', size: '1.8rem', color: 'var(--gold-light)', opacity: 0.11, mx: -18, my: -9, dur: 0.55, char: '*' },
          { top: '55%', left: '2%', size: '1.4rem', color: 'var(--accent)', opacity: 0.13, mx: 24, my: -10, dur: 0.45, char: '+' },
          { top: '22%', left: '4%', size: '0.9rem', color: 'var(--gold)', opacity: 0.16, mx: 28, my: -14, dur: 0.38, char: '*' },
          { bottom: '18%', right: '10%', size: '1rem', color: 'var(--gold-light)', opacity: 0.1, mx: -14, my: 10, dur: 0.6, char: '+' },
        ].map((decor, index) => (
          <span
            key={index}
            style={{
              position: 'absolute',
              top: decor.top,
              bottom: decor.bottom,
              right: decor.right,
              left: decor.left,
              fontSize: decor.size,
              color: decor.color,
              opacity: decor.opacity,
              transform: `translate(${mouse.x * decor.mx}px, ${mouse.y * decor.my}px)`,
              transition: `transform ${decor.dur}s ease`,
              userSelect: 'none',
            }}
          >
            {decor.char}
          </span>
        ))}
      </div>

      <div className="container" style={{ position: 'relative' }}>
        <div className="dialog-box" style={{ animation: 'heroEnter 0.5s ease both', position: 'relative' }}>
          {typing && (
            <button
              onClick={skip}
              style={{
                position: 'absolute',
                bottom: '0.75rem',
                right: '1rem',
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.42rem',
                color: 'var(--ink-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.06em',
                lineHeight: 2,
                opacity: 0.7,
              }}
            >
              SKIP
            </button>
          )}

          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              color: 'var(--accent)',
              fontSize: '1.1rem',
              marginBottom: '0.75rem',
              minHeight: '1.6rem',
            }}
          >
            {greeting}
            {activeField === 'greeting' && <Cursor />}
          </p>

          <h1 style={{ marginBottom: '1.25rem', minHeight: '5rem' }}>
            <span className={line1 === LINE1 ? 'gradient-name' : ''}>{line1}</span>
            {activeField === 'line1' && <Cursor />}
            {line2 && (
              <>
                <br />
                <span style={{ fontStyle: 'italic' }}>{line2}</span>
                {activeField === 'line2' && <Cursor />}
              </>
            )}
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              maxWidth: '700px',
              marginBottom: bio ? '2rem' : 0,
              lineHeight: 1.75,
              minHeight: '4rem',
            }}
          >
            {bio}
            {activeField === 'bio' && <Cursor />}
            {activeField === 'done' && bio && <Cursor blink />}
          </p>

          {showContent && (
            <>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', animation: 'heroEnter 0.4s ease both' }}>
                <a href="#projects" className="btn btn-primary">View projects</a>
                <a href="/resume.pdf" className="btn btn-secondary" download="SiTing_Resume.pdf">
                  Download resume
                </a>
              </div>

              <div className="hero-highlights">
                {HIGHLIGHTS.map((item) => (
                  <div key={item} className="hero-highlight-item">
                    {item}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .hero-highlights {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-top: 1.75rem;
        }

        .hero-highlight-item {
          border: 1px solid var(--border-strong);
          background: rgba(242, 228, 196, 0.75);
          border-radius: var(--radius);
          padding: 0.8rem;
          color: var(--ink-soft);
          font-size: 0.86rem;
          font-weight: 600;
          line-height: 1.5;
        }

        @media (max-width: 760px) {
          .hero-highlights {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
