import { useEffect, useRef, useState } from 'react';
import { Engine, loadSprites } from './engine.js';
import { INFO } from './level.js';
import { PROFILE } from '../data.js';

const icon = (n) => `/sprites/sprite_${String(n).padStart(3, '0')}.png`;

// what the card says, per kind of block
const KIND = {
  work: { label: 'Experience unlocked', face: 68 },
  award: { label: 'Achievement unlocked', face: 68 },
  education: { label: 'Chapter unlocked', face: 67 },
  project: { label: 'Project unlocked', face: 67 },
  skills: { label: 'Skills unlocked', face: 66 },
};

const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', KeyZ: 'jump',
};

const readMuted = () => {
  try { return localStorage.getItem('pf-muted') === '1'; } catch { return false; }
};

export default function Game({ onClose }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  const [phase, setPhase] = useState('loading'); // loading | title | play | win
  const [coins, setCoins] = useState(0);
  const [found, setFound] = useState([]);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState(null);
  const [muted, setMuted] = useState(readMuted);
  const [touch] = useState(() => window.matchMedia('(pointer: coarse)').matches);

  // boot: load sprites, build the engine, size the canvas
  useEffect(() => {
    let engine;
    let ro;
    let alive = true;
    loadSprites().then((images) => {
      if (!alive) return;
      engine = new Engine(canvasRef.current, images, {
        onCoins: setCoins,
        onInfo: (info, n) => {
          setFound((f) => [...f, info]);
          setToast({ ...info, n, key: Date.now() });
        },
        onWin: (s) => { setStats(s); setPhase('win'); },
      });
      engine.setMuted(readMuted());
      engineRef.current = engine;
      if (import.meta.env.DEV) window.__pfGame = engine; // handy for debugging in dev
      const size = () => {
        const r = wrapRef.current.getBoundingClientRect();
        engine.resize(r.width, r.height, touch ? 128 : 0);
        engine.draw();
      };
      size();
      ro = new ResizeObserver(size);
      ro.observe(wrapRef.current);
      setPhase('title');
    });
    return () => {
      alive = false;
      ro?.disconnect();
      engine?.stop();
    };
  }, [touch]);

  // lock page scroll while the game is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // keyboard
  useEffect(() => {
    const down = (e) => {
      if (e.code === 'Escape') { onClose(); return; }
      if (e.code === 'KeyM') { toggleMute(); return; }
      const k = KEYMAP[e.code];
      if (!k) {
        if ((e.code === 'Enter') && phase === 'title') begin();
        return;
      }
      e.preventDefault();
      if (phase === 'title') { begin(); return; }
      engineRef.current?.press(k, true);
    };
    const up = (e) => {
      const k = KEYMAP[e.code];
      if (!k) return;
      e.preventDefault(); // stops Space from also "clicking" a focused HUD button
      engineRef.current?.press(k, false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  });

  // pause when the tab is hidden
  useEffect(() => {
    const vis = () => {
      const e = engineRef.current;
      if (!e) return;
      if (document.hidden) e.stop();
      else if (phase === 'play') e.start();
    };
    document.addEventListener('visibilitychange', vis);
    return () => document.removeEventListener('visibilitychange', vis);
  }, [phase]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  function begin() {
    setPhase('play');
    engineRef.current?.start();
  }

  function restart() {
    const e = engineRef.current;
    e.reset();
    setFound([]);
    setToast(null);
    setStats(null);
    setPhase('play');
    e.start();
  }

  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      engineRef.current?.setMuted(next);
      try { localStorage.setItem('pf-muted', next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  }

  // touch buttons hold a key while pressed
  const hold = (k) => ({
    onPointerDown: (e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); engineRef.current?.press(k, true); },
    onPointerUp: () => engineRef.current?.press(k, false),
    onPointerCancel: () => engineRef.current?.press(k, false),
    onContextMenu: (e) => e.preventDefault(),
  });

  return (
    <div className="game" role="dialog" aria-modal="true" aria-label="Portfolio platformer game">
      <div className="game__stage" ref={wrapRef}>
        <canvas ref={canvasRef} className="game__canvas" />
      </div>

      {/* HUD */}
      <div className="game__hud">
        <div className="hud-chip">
          <img src={icon(14)} alt="" /> <span>{String(coins).padStart(2, '0')}</span>
        </div>
        <div className="hud-chip" title="Info blocks found">
          <span className="hud-q">?</span> <span>{found.length}/{INFO.length}</span>
        </div>
        <div className="hud-log" aria-label="Collected info">
          {found.map((f, i) => (
            <img key={`${f.title}-${i}`} src={icon(f.icon)} alt={f.title} title={`${f.title} · ${f.meta}`} />
          ))}
        </div>
        <button type="button" className="hud-btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? '🔇' : '🔊'}
        </button>
        <button type="button" className="hud-btn" onClick={onClose} aria-label="Close game">✕</button>
      </div>

      {toast && (
        <div className={`game__toast game__toast--${toast.kind}`} key={toast.key} role="status">
          {/* her reaction: bounces between two excited portraits */}
          <span className="toast-face" aria-hidden="true">
            <img src={icon(KIND[toast.kind]?.face ?? 67)} alt="" />
            <img src={icon(toast.kind === 'project' || toast.kind === 'skills' ? 66 : 67)} alt="" />
          </span>
          <span className="toast-body">
            <small>
              <img src={icon(toast.icon)} alt="" /> {KIND[toast.kind]?.label ?? 'Unlocked'} · {toast.n}/{INFO.length}
            </small>
            <strong>{toast.title}</strong>
            <span className="toast-meta">{[toast.meta, toast.when].filter(Boolean).join(' · ')}</span>
            {toast.text && <em>{toast.text}</em>}
          </span>
          <button type="button" className="toast-close" onClick={() => setToast(null)} aria-label="Dismiss">✕</button>
        </div>
      )}

      {touch && phase === 'play' && (
        <div className="game__pad">
          <div className="pad-dir">
            <button type="button" aria-label="Left" {...hold('left')}>◀</button>
            <button type="button" aria-label="Right" {...hold('right')}>▶</button>
          </div>
          <button type="button" className="pad-jump" aria-label="Jump" {...hold('jump')}>JUMP</button>
        </div>
      )}

      {phase === 'loading' && <div className="game__screen"><p className="game__title">Loading level…</p></div>}

      {phase === 'title' && (
        <div className="game__screen">
          <div className="game__card">
            <span className="chapter">World 1-1</span>
            <h2 className="game__title">Si Ting's Portfolio Run</h2>
            <p>Walk through my career from {INFO[0]?.start?.slice(0, 4)} to today. Hit each <b className="hud-q">?</b> block from below to unlock an experience or project, then reach the castle.</p>
            <ul className="game__keys">
              {touch ? (
                <li>Use ◀ ▶ to run and JUMP to jump</li>
              ) : (
                <>
                  <li><kbd>←</kbd><kbd>→</kbd> or <kbd>A</kbd><kbd>D</kbd> run</li>
                  <li><kbd>Space</kbd> / <kbd>↑</kbd> jump (hold for higher)</li>
                  <li><kbd>M</kbd> sound · <kbd>Esc</kbd> exit</li>
                </>
              )}
            </ul>
            <button type="button" className="pbtn pbtn--gold" onClick={begin} autoFocus>▶ Start</button>
          </div>
        </div>
      )}

      {phase === 'win' && stats && (
        <div className="game__screen">
          <div className="game__card game__card--win">
            <span className="chapter">Course clear!</span>
            <h2 className="game__title">Thanks for playing!</h2>
            <p className="game__stats">
              Coins {stats.coins}/{stats.totalCoins + stats.total} · Info {stats.found}/{stats.total}
              {stats.falls > 0 && ` · Falls ${stats.falls}`}
            </p>
            {found.length > 0 && (
              <ul className="game__found">
                {[...found]
                  .sort((a, b) => (a.start || '').localeCompare(b.start || ''))
                  .map((f, i) => (
                    <li key={`${f.title}-${i}`}>
                      <img src={icon(f.icon)} alt="" />
                      <span><strong>{f.title}</strong> <span className="found-meta">{f.when || f.meta}</span></span>
                    </li>
                  ))}
              </ul>
            )}
            <p>Next stage: a conversation. {PROFILE.lookingFor}</p>
            <div className="game__actions">
              <a className="pbtn pbtn--gold" href={`mailto:${PROFILE.email}`}>Email me</a>
              <a className="pbtn" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a className="pbtn" href={PROFILE.resume} download="SiTing_Resume.pdf">Resume</a>
            </div>
            <div className="game__actions">
              <button type="button" className="pbtn pbtn--ghost" onClick={restart}>Play again</button>
              <button type="button" className="pbtn pbtn--ghost" onClick={onClose}>Back to portfolio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
