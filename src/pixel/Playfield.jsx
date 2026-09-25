import { useEffect, useRef, useState } from 'react';

/* A tiny click-to-walk playfield for a scene: the character walks to where you
   click, the cat trails behind her, and both react when clicked. Movement runs
   in one requestAnimationFrame loop that writes transforms directly, so React
   doesn't re-render on every frame. */

const sprite = (n) => `/sprites/sprite_${String(n).padStart(3, '0')}.png`;

// native sprite heights, so every frame is drawn at the same pixel scale
const HEIGHT = { 2: 148, 29: 141, 30: 143, 31: 141, 44: 130, 80: 83, 82: 68, 85: 71 };
const ME_SCALE = 0.8;
const CAT_SCALE = 0.62;

const WALK = [29, 30, 31, 30]; // 32 is a back view, so it is left out of the cycle
const IDLE = 2;
const JUMP = 44;
const CAT_IDLE = 80;
const CAT_WALK = 82;
const CAT_HAPPY = 85;

const ME_SPEED = 170; // px per second
const STRIDE = 16; // px travelled per walk frame
const GROUND = 32; // px from the bottom of the scene
const CAT_GAP = 58; // how far behind her the cat likes to sit

const LINES = [
  "Hi, I'm Si Ting!",
  'Click anywhere on the grass to walk.',
  'Projects are further down the page.',
  'Currently: Junior Programmer @ DSwim.',
  'Open to QA & dev roles!',
];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Playfield({ sceneRef, dialogRef }) {
  const meRef = useRef(null);
  const meImg = useRef(null);
  const catRef = useRef(null);
  const catImg = useRef(null);
  const markerRef = useRef(null);
  const heartsRef = useRef(null);

  const [bubble, setBubble] = useState(null);
  const [hinted, setHinted] = useState(false);

  const st = useRef({
    x: 0, target: 0, dir: -1, dist: 0,
    jumpT: -1,
    catX: 0, catDir: -1, catDist: 0, catHappyUntil: 0,
    bounds: [0, 0],
    raf: 0, last: 0, ready: false,
  });
  const lineIdx = useRef(0);

  /* ---------------------------------------------------------- helpers */

  function bounds() {
    const scene = sceneRef.current;
    const r = scene.getBoundingClientRect();
    let min = 50;
    const d = dialogRef.current?.getBoundingClientRect();
    // on wide screens the dialog sits over the grass, so keep her to its right
    if (d && d.bottom > r.bottom - 150) min = d.right - r.left + 60;
    const max = r.width - 50;
    return [Math.min(min, max), max];
  }

  function setFrame(img, n, scale) {
    const src = sprite(n);
    if (img.dataset.n !== String(n)) {
      img.src = src;
      img.dataset.n = n;
      img.style.height = `${Math.round(HEIGHT[n] * scale)}px`;
    }
  }

  function draw() {
    const s = st.current;
    const jumpY = s.jumpT >= 0 ? Math.sin(Math.PI * Math.min(s.jumpT / 0.55, 1)) * 46 : 0;
    meRef.current.style.transform = `translate3d(${s.x - 60}px, ${-jumpY}px, 0)`;
    meImg.current.style.transform = `scaleX(${s.dir})`;
    // a small hop while the cat trots
    const walking = Math.abs(s.catX - catTarget()) > 4;
    const hop = walking ? Math.abs(Math.sin(s.catDist / 9)) * 3 : 0;
    catRef.current.style.transform = `translate3d(${s.catX - 40}px, ${-hop}px, 0)`;
    catImg.current.style.transform = `scaleX(${s.catDir})`;
  }

  function catTarget() {
    const s = st.current;
    const [min, max] = s.bounds;
    let t = s.x - s.dir * CAT_GAP;
    // if there is no room behind her, sit in front instead
    if (t < min - 30 || t > max + 30) t = s.x + s.dir * CAT_GAP;
    return t;
  }

  function tick(now) {
    const s = st.current;
    const dt = Math.min((now - s.last) / 1000, 0.05);
    s.last = now;
    let busy = false;

    // character
    const dx = s.target - s.x;
    if (Math.abs(dx) > 1) {
      const step = Math.sign(dx) * Math.min(Math.abs(dx), ME_SPEED * dt);
      s.x += step;
      s.dist += Math.abs(step);
      s.dir = Math.sign(dx);
      busy = true;
    } else {
      s.x = s.target;
    }
    if (s.jumpT >= 0) {
      s.jumpT += dt;
      if (s.jumpT > 0.55) s.jumpT = -1;
      else busy = true;
    }
    if (s.jumpT >= 0) setFrame(meImg.current, JUMP, ME_SCALE);
    else if (Math.abs(dx) > 1) setFrame(meImg.current, WALK[Math.floor(s.dist / STRIDE) % WALK.length], ME_SCALE);
    else setFrame(meImg.current, IDLE, ME_SCALE);

    // cat: speeds up when it falls behind, eases in as it arrives
    const cdx = catTarget() - s.catX;
    if (Math.abs(cdx) > 4) {
      const speed = Math.min(260, 50 + Math.abs(cdx) * 2.2);
      const step = Math.sign(cdx) * Math.min(Math.abs(cdx), speed * dt);
      s.catX += step;
      s.catDist += Math.abs(step);
      s.catDir = Math.sign(cdx);
      busy = true;
      setFrame(catImg.current, CAT_WALK, CAT_SCALE);
    } else {
      // settle facing her
      s.catDir = Math.sign(s.x - s.catX) || s.catDir;
      setFrame(catImg.current, now < s.catHappyUntil ? CAT_HAPPY : CAT_IDLE, CAT_SCALE);
      if (now < s.catHappyUntil) busy = true;
    }

    draw();
    s.raf = busy ? requestAnimationFrame(tick) : 0;
  }

  function wake() {
    const s = st.current;
    if (!s.raf) {
      s.last = performance.now();
      s.raf = requestAnimationFrame(tick);
    }
  }

  function walkTo(x) {
    const s = st.current;
    s.bounds = bounds();
    s.target = Math.max(s.bounds[0], Math.min(s.bounds[1], x));
    if (reducedMotion()) {
      s.x = s.target;
      s.catX = catTarget();
    }
    setHinted(true);
    wake();
    return s.target;
  }

  function popHeart(x, y) {
    const el = document.createElement('img');
    el.src = sprite(69);
    el.className = 'heart-pop px';
    el.alt = '';
    el.style.left = `${x}px`;
    el.style.bottom = `${y}px`;
    heartsRef.current.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  /* ---------------------------------------------------------- setup */

  useEffect(() => {
    const scene = sceneRef.current;
    const s = st.current;
    [...WALK, IDLE, JUMP, CAT_IDLE, CAT_WALK, CAT_HAPPY, 69].forEach((n) => {
      new Image().src = sprite(n);
    });

    function place() {
      s.bounds = bounds();
      const w = scene.getBoundingClientRect().width;
      const [min, max] = s.bounds;
      const start = min > 60 ? min + (max - min) * 0.35 : w * 0.28;
      if (!s.ready) {
        s.x = s.target = start;
        s.catX = s.x + CAT_GAP;
        s.ready = true;
      } else {
        s.x = s.target = Math.max(min, Math.min(max, s.x));
      }
      s.catX = Math.max(min - 30, Math.min(max + 30, s.catX));
      setFrame(meImg.current, IDLE, ME_SCALE);
      setFrame(catImg.current, CAT_IDLE, CAT_SCALE);
      draw();
    }
    place();
    const ro = new ResizeObserver(place);
    ro.observe(scene);

    function onClick(e) {
      if (e.target.closest('.dialog, a, button')) return;
      const r = scene.getBoundingClientRect();
      const x = walkTo(e.clientX - r.left);
      const m = markerRef.current;
      m.style.left = `${x}px`;
      m.classList.remove('is-on');
      void m.offsetWidth; // restart the animation
      m.classList.add('is-on');
    }
    function onKey(e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (e.target.closest('input, textarea, select')) return;
      e.preventDefault();
      walkTo(st.current.target + (e.key === 'ArrowLeft' ? -120 : 120));
    }
    scene.addEventListener('click', onClick);
    scene.addEventListener('keydown', onKey);
    return () => {
      ro.disconnect();
      scene.removeEventListener('click', onClick);
      scene.removeEventListener('keydown', onKey);
      cancelAnimationFrame(s.raf);
    };
  }, []);

  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => setBubble(null), bubble.ms || 2600);
    return () => clearTimeout(t);
  }, [bubble]);

  /* ---------------------------------------------------------- hello */

  // greet the visitor, then nudge them to scroll if they haven't yet
  useEffect(() => {
    const hi = setTimeout(() => setBubble({ text: "Hi there! 👋 Welcome to my portfolio.", key: Date.now(), ms: 3400 }), 900);
    const nudge = setTimeout(() => {
      if (window.scrollY < 40) setBubble({ text: 'Scroll down to see my work!', key: Date.now(), ms: 3400 });
    }, 5200);
    return () => { clearTimeout(hi); clearTimeout(nudge); };
  }, []);

  /* ---------------------------------------------------------- reactions */

  function sayHi(e) {
    e.stopPropagation();
    const s = st.current;
    s.target = s.x; // stop where she is
    if (!reducedMotion()) s.jumpT = 0;
    setBubble({ text: LINES[lineIdx.current % LINES.length], key: Date.now() });
    lineIdx.current += 1;
    setHinted(true);
    wake();
  }

  function petCat(e) {
    e.stopPropagation();
    const s = st.current;
    s.catHappyUntil = performance.now() + 1400;
    popHeart(s.catX - 8, GROUND + 44);
    setHinted(true);
    wake();
  }

  return (
    <div className="playfield">
      <div className="click-marker" ref={markerRef} aria-hidden="true" />
      <div className="hearts" ref={heartsRef} aria-hidden="true" />

      <button type="button" className="actor actor--cat" ref={catRef} onClick={petCat} aria-label="Pet the cat">
        <img ref={catImg} className="px" alt="" draggable="false" />
      </button>

      <button type="button" className="actor actor--me" ref={meRef} onClick={sayHi} aria-label="Say hi to Si Ting">
        {bubble && (
          <span className="speech" key={bubble.key}>{bubble.text}</span>
        )}
        <img ref={meImg} className="px" alt="" draggable="false" />
      </button>

      <span className={`play-hint${hinted ? ' is-hidden' : ''}`} aria-hidden="true">
        ▸ Click the grass to walk · click her to say hi
      </span>
    </div>
  );
}

/* A cat that purrs (happy face + heart) when clicked. */
export function PetCat({ className = '', h = 52 }) {
  const [happy, setHappy] = useState(0);
  useEffect(() => {
    if (!happy) return;
    const t = setTimeout(() => setHappy(0), 1400);
    return () => clearTimeout(t);
  }, [happy]);
  return (
    <button type="button" className={`pet-cat ${className}`} onClick={() => setHappy(Date.now())} aria-label="Pet the cat">
      {happy > 0 && <img key={happy} src={sprite(69)} className="heart-pop px" alt="" style={{ left: '40%', bottom: h - 6 }} />}
      <img src={sprite(happy ? CAT_HAPPY : 81)} className="px" alt="" draggable="false" style={{ height: h }} />
    </button>
  );
}
