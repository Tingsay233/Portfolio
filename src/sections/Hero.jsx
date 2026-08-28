import { useState, useEffect } from 'react';
import { useAchievements } from '../lib/AchievementContext.jsx';

const FUN_FACTS = [
  "Once wrote a prose poem from the POV of a bread loaf 🍞",
  "Plays story-driven games (RDR2, Cyberpunk, Detroit) but avoids PVP at all costs",
  "Drinks more boba than is medically advisable",
  "Has a sister who is a Mayday fan",
  "Best Presenter at CITIC 2026 — and yes, it was online 😅",
];

const GREETING = 'Hello there 👋';
const LINE1    = "I'm Say Si Ting.";
const LINE2    = 'I build things for funnnn.';
const BIO      = 'Final-year Computer Science student at Multimedia University, specializing in Software Engineering. I work across full-stack web, machine learning, and the occasional Shopify storefront. Currently looking for graduate roles in software engineering, QA, or technical PM.';

function Cursor({ blink = false }) {
  return (
    <span style={{
      display: 'inline-block',
      width: '2px',
      height: '0.85em',
      background: 'var(--accent)',
      marginLeft: '3px',
      verticalAlign: 'middle',
      animation: blink ? 'cursorBlink 1s step-end infinite' : 'none',
    }} />
  );
}

// Renders "I'm Si Ting." with gradient applied to "Si Ting" once it's fully typed
function renderLine1(text) {
  const PREFIX  = "I'm ";
  const SAY_SI_TING = 'Say Si Ting';
  if (text.length <= PREFIX.length) return <>{text}</>;
  const nameTyped = text.slice(PREFIX.length, PREFIX.length + SAY_SI_TING.length);
  const afterName = text.slice(PREFIX.length + SAY_SI_TING.length);
  const gradientReady = nameTyped === SAY_SI_TING;
  return (
    <>
      {PREFIX}
      <span
        className={gradientReady ? 'gradient-name' : ''}
        style={!gradientReady ? { color: 'var(--accent)' } : {}}
      >
        {nameTyped}
      </span>
      {afterName}
    </>
  );
}

function typeString(text, setter, speed) {
  return new Promise(resolve => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setter(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); resolve(); }
    }, speed);
  });
}

const wait = ms => new Promise(r => setTimeout(r, ms));

export default function Hero() {
  const [factIdx,     setFactIdx]     = useState(0);
  const [mouse,       setMouse]       = useState({ x: 0, y: 0 });
  const [greeting,    setGreeting]    = useState('');
  const [line1,       setLine1]       = useState('');
  const [line2,       setLine2]       = useState('');
  const [bio,         setBio]         = useState('');
  const [activeField, setActiveField] = useState('');
  const [showButtons, setShowButtons] = useState(false);
  const [showArrow,   setShowArrow]   = useState(false);
  const [showFacts,   setShowFacts]   = useState(false);
  const { unlock } = useAchievements();

  // Fun facts rotation
  useEffect(() => {
    const id = setInterval(() => setFactIdx(i => (i + 1) % FUN_FACTS.length), 4500);
    return () => clearInterval(id);
  }, []);

  // Mouse parallax
  useEffect(() => {
    const onMove = e => setMouse({
      x: e.clientX / window.innerWidth  - 0.5,
      y: e.clientY / window.innerHeight - 0.5,
    });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Sequential typewriter
  useEffect(() => {
    async function run() {
      await wait(350);

      setActiveField('greeting');
      await typeString(GREETING, setGreeting, 48);

      await wait(130);
      setActiveField('line1');
      await typeString(LINE1, setLine1, 42);

      await wait(90);
      setActiveField('line2');
      await typeString(LINE2, setLine2, 28);

      await wait(130);
      setActiveField('bio');
      await typeString(BIO, setBio, 6);

      setActiveField('done');
      await wait(200);
      setShowButtons(true);
      await wait(300);
      setShowArrow(true);
      await wait(200);
      setShowFacts(true);
    }
    run();
  }, []);

  // Skip — instantly complete everything
  function skip() {
    setGreeting(GREETING);
    setLine1(LINE1);
    setLine2(LINE2);
    setBio(BIO);
    setActiveField('done');
    setShowButtons(true);
    setShowArrow(true);
    setShowFacts(true);
  }

  const typing = activeField !== '' && activeField !== 'done';

  return (
    <section
      id="top"
      style={{ position: 'relative', overflow: 'hidden', paddingTop: '4rem', paddingBottom: '6rem', borderBottom: 'none' }}
    >
      {/* ── Parallax background ── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[
          { top: '12%', right: '6%',  size: '3rem',   color: 'var(--gold)',       opacity: 0.13, mx: -22, my: -12, dur: 0.5,  char: '✦' },
          { top: '35%', right: '14%', size: '1.2rem',  color: 'var(--accent)',     opacity: 0.18, mx: -32, my: -16, dur: 0.4,  char: '✦' },
          { top: '8%',  right: '28%', size: '1.8rem',  color: 'var(--gold-light)', opacity: 0.11, mx: -18, my: -9,  dur: 0.55, char: '★' },
          { top: '55%', left:  '2%',  size: '1.4rem',  color: 'var(--accent)',     opacity: 0.13, mx:  24, my: -10, dur: 0.45, char: '❋' },
          { top: '22%', left:  '4%',  size: '0.9rem',  color: 'var(--gold)',       opacity: 0.16, mx:  28, my: -14, dur: 0.38, char: '✦' },
          { bottom:'18%',right:'10%', size: '1rem',    color: 'var(--gold-light)', opacity: 0.10, mx: -14, my:  10, dur: 0.6,  char: '✦' },
        ].map((d, i) => (
          <span key={i} style={{
            position: 'absolute',
            top: d.top, bottom: d.bottom, right: d.right, left: d.left,
            fontSize: d.size, color: d.color, opacity: d.opacity,
            transform: `translate(${mouse.x * d.mx}px, ${mouse.y * d.my}px)`,
            transition: `transform ${d.dur}s ease`,
            userSelect: 'none',
          }}>
            {d.char}
          </span>
        ))}
      </div>

      <div className="container" style={{ position: 'relative' }}>
        {/* ── Dialog box ── */}
        <div
          className="dialog-box"
          style={{ animation: 'heroEnter 0.5s ease both', position: 'relative' }}
        >
          {/* Skip button — visible while typing */}
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
              CLICK TO SKIP ▶
            </button>
          )}

          {/* Greeting */}
          <p style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            color: 'var(--accent)',
            fontSize: '1.1rem',
            marginBottom: '0.75rem',
            minHeight: '1.6rem',
          }}>
            {greeting}
            {activeField === 'greeting' && <Cursor />}
          </p>

          {/* H1 */}
          <h1 style={{ marginBottom: '1.25rem', minHeight: '5rem' }}>
            {renderLine1(line1)}
            {activeField === 'line1' && <Cursor />}
            {line2 && (
              <>
                <br />
                <span style={{ fontStyle: 'italic' }}>{line2}</span>
                {activeField === 'line2' && <Cursor />}
              </>
            )}
          </h1>

          {/* Bio */}
          <p style={{
            fontSize: '1.05rem',
            maxWidth: '600px',
            marginBottom: bio ? '2rem' : 0,
            lineHeight: 1.75,
            minHeight: '4rem',
          }}>
            {bio}
            {activeField === 'bio' && <Cursor />}
            {activeField === 'done' && bio && <Cursor blink />}
          </p>

          {/* Buttons */}
          {showButtons && (
            <div
              style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', animation: 'heroEnter 0.4s ease both' }}
            >
              <a href="#projects" className="btn btn-primary">See my work →</a>
              <a
                href="/resume.pdf"
                className="btn btn-secondary"
                download="SiTing_Resume.pdf"
                onClick={() => unlock('recruiter')}
              >
                ↓ Download resume
              </a>
            </div>
          )}

          {/* ▼ indicator */}
          {showArrow && <span className="dialog-arrow">▼</span>}
        </div>

        {/* ── Fun facts bar ── */}
        {showFacts && (
          <div style={{
            marginTop: '2rem',
            padding: '1rem 1.5rem',
            border: '2px dashed var(--border-strong)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            animation: 'heroEnter 0.4s ease both',
          }}>
            <span style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.45rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--ink-muted)',
              lineHeight: 2,
            }}>FYI:</span>
            <span
              key={factIdx}
              style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', fontStyle: 'italic', animation: 'factFadeIn 0.5s' }}
            >
              {FUN_FACTS[factIdx]}
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes factFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
