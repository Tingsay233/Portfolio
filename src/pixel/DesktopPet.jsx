import { useEffect, useRef, useState } from 'react';

/* A desktop pet (桌宠): once you scroll past the hero, a cat drops onto the
   screen and roams its edges — the floor, up the walls and upside down along
   the underside of the top bar, turning smoothly round the corners. Scrolling
   makes it hurry; left alone on the floor it dozes off. Grab it to pick it up
   and fling it: it falls with gravity, clings to a wall or ceiling it hits hard
   enough, or bounces and lands. Click it to pet it. Movement runs in a single
   requestAnimationFrame loop that writes transforms directly. */

const sprite = (n) => `/sprites/sprite_${String(n).padStart(3, '0')}.png`;

// native sprite sizes, so every pose is drawn at the same pixel scale
const SIZE = { 80: [80, 83], 81: [61, 80], 82: [109, 68], 84: [77, 56], 85: [74, 71] };
const SIT = 80;
const DANGLE = 81;
const WALK = 82;
const SLEEP = 84;
const HAPPY = 85;

const CORNER = 26; // radius of the turn round each corner, px
const WALK_SPEED = 55; // px per second
const MAX_BOOST = 220; // extra speed from scrolling
const GRAVITY = 2200; // px/s²
const MAX_THROW = 2400; // px/s
const CLING_SPEED = 320; // hit a wall at least this fast and it grabs on
const LET_GO = 0.035; // chance per second of dropping off a wall/ceiling
const SLEEP_AFTER = 12000; // ms without attention before it naps (floor only)

const LINES = ['Meow!', 'Purr~', 'Keep scrolling!', 'Mrrp?', '♪ nya ♪'];
const THROWN = ['Nyaa!!', 'Wheee!', 'Hey!'];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scaleFor = () => (window.innerWidth < 640 ? 0.5 : 0.62);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rand = (a, b) => a + Math.random() * (b - a);

/* The walkable loop: a rounded rectangle traced anticlockwise on screen —
   floor (heading right), right wall (up), ceiling (left), left wall (down).
   Each point has an outward normal n pointing into the surface the feet are on. */
function buildPath(g) {
  const { X0, X1, Y0, Y1 } = g;
  const c = CORNER;
  const hl = Math.max(0, X1 - X0 - 2 * c);
  const vl = Math.max(0, Y1 - Y0 - 2 * c);
  const a = (c * Math.PI) / 2;
  const segs = [
    { len: hl, x: X0 + c, y: Y1, dx: 1, dy: 0, nx: 0, ny: 1 }, // floor
    { len: a, cx: X1 - c, cy: Y1 - c, phi: 90 },
    { len: vl, x: X1, y: Y1 - c, dx: 0, dy: -1, nx: 1, ny: 0 }, // right wall
    { len: a, cx: X1 - c, cy: Y0 + c, phi: 0 },
    { len: hl, x: X1 - c, y: Y0, dx: -1, dy: 0, nx: 0, ny: -1 }, // ceiling
    { len: a, cx: X0 + c, cy: Y0 + c, phi: -90 },
    { len: vl, x: X0, y: Y0 + c, dx: 0, dy: 1, nx: -1, ny: 0 }, // left wall
    { len: a, cx: X0 + c, cy: Y1 - c, phi: -180 },
  ];
  let o = 0;
  segs.forEach((sg) => { sg.start = o; o += sg.len; });
  return { segs, L: o, hl, vl, g };
}

function locate(path, p) {
  const { segs, L } = path;
  const q = ((p % L) + L) % L;
  let i = segs.findIndex((sg) => q < sg.start + sg.len);
  if (i < 0) i = segs.length - 1;
  const sg = segs[i];
  const t = q - sg.start;
  let x, y, nx, ny;
  if (sg.phi === undefined) {
    x = sg.x + sg.dx * t; y = sg.y + sg.dy * t; nx = sg.nx; ny = sg.ny;
  } else {
    const phi = ((sg.phi - (90 * t) / sg.len) * Math.PI) / 180;
    nx = Math.cos(phi); ny = Math.sin(phi);
    x = sg.cx + CORNER * nx; y = sg.cy + CORNER * ny;
  }
  // rotate so the cat's "down" points along n
  const rot = (Math.atan2(-nx, ny) * 180) / Math.PI;
  return { x, y, nx, ny, rot, seg: i };
}

// perimeter position for a point on a given side (0 floor, 2 right, 4 ceiling, 6 left)
function attach(path, side, v) {
  const { segs, hl, vl, g } = path;
  const c = CORNER;
  const off = {
    0: clamp(v - (g.X0 + c), 0, hl),
    2: clamp(g.Y1 - c - v, 0, vl),
    4: clamp(g.X1 - c - v, 0, hl),
    6: clamp(v - (g.Y0 + c), 0, vl),
  }[side];
  return segs[side].start + off;
}

export default function DesktopPet() {
  const boxRef = useRef(null);
  const imgRef = useRef(null);
  const sayRef = useRef(null);
  const [shown, setShown] = useState(false);
  const [asleep, setAsleep] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [bubble, setBubble] = useState(null);
  const [hearts, setHearts] = useState([]);
  const lineIdx = useRef(0);

  const st = useRef({
    mode: 'idle', // walk | idle | sleep | drag | fall
    p: 0, dir: 1, boost: 0, dist: 0,
    x: -200, y: -200, rot: 0, nx: 0, ny: 1, seg: 0,
    vx: 0, vy: 0, dragVx: 0,
    nextAt: 0, lastActive: 0, happyUntil: 0,
    scrollY: 0, lastDir: 0,
    down: null, samples: [], suppressClick: false,
    path: null, shown: false, raf: 0, last: 0,
  });

  /* ---------------------------------------------------------- helpers */

  function measure() {
    const s = st.current;
    const bar = document.querySelector('.topbar');
    s.path = buildPath({
      X0: 1,
      X1: document.documentElement.clientWidth - 1, // keep clear of the scrollbar
      Y0: bar ? bar.getBoundingClientRect().bottom + 1 : 1,
      Y1: window.innerHeight - 1,
    });
  }

  function setPose(n) {
    const img = imgRef.current;
    if (!img || img.dataset.n === String(n)) return;
    img.src = sprite(n);
    img.dataset.n = n;
    img.style.height = `${Math.round(SIZE[n][1] * scaleFor())}px`;
  }

  function poseSize() {
    const n = Number(imgRef.current?.dataset.n) || SIT;
    const k = scaleFor();
    return [SIZE[n][0] * k, SIZE[n][1] * k];
  }

  function draw() {
    const s = st.current;
    const hop = s.mode === 'walk' ? Math.abs(Math.sin(s.dist / 9)) * 3 : 0;
    // feet sit on (x, y); the hop lifts them away from the surface
    const x = s.x - s.nx * hop;
    const y = s.y - s.ny * hop;
    boxRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${s.rot}deg) translate(-50%, -100%)`;
    imgRef.current.style.transform = `scaleX(${s.dir})`;

    // speech bubble: always upright, on the open side of the cat
    const say = sayRef.current;
    if (say) {
      const [, h] = poseSize();
      const airborne = s.mode === 'drag' || s.mode === 'fall';
      const nx = airborne ? 0 : s.nx;
      const ny = airborne ? 1 : s.ny;
      const px = s.x - nx * (h + 10);
      const py = s.y - ny * (h + 10);
      let tf = 'translate(-50%, -100%)';
      if (ny < -0.5) tf = 'translate(-50%, 0)';
      else if (nx > 0.5) tf = 'translate(-100%, -50%)';
      else if (nx < -0.5) tf = 'translate(0, -50%)';
      say.style.transform = `translate(${px}px, ${py}px) ${tf}`;
    }
  }

  function setMode(mode) {
    const s = st.current;
    if (s.mode === mode) return;
    s.mode = mode;
    setAsleep(mode === 'sleep');
    setDragging(mode === 'drag');
  }

  function snapToPath() {
    const s = st.current;
    const at = locate(s.path, s.p);
    s.x = at.x; s.y = at.y; s.nx = at.nx; s.ny = at.ny; s.rot = at.rot; s.seg = at.seg;
  }

  function stickTo(side, v, dir) {
    const s = st.current;
    s.p = attach(s.path, side, v);
    s.dir = dir;
    setMode(side === 0 ? 'idle' : 'walk');
    s.nextAt = performance.now() + (side === 0 ? 700 : rand(2000, 4000));
    snapToPath();
  }

  function say(text, ms) {
    setBubble({ text, key: Date.now(), ms });
  }

  /* ---------------------------------------------------------- loop */

  function tick(now) {
    const s = st.current;
    const dt = Math.min((now - s.last) / 1000, 0.05);
    s.last = now;
    const reduced = reducedMotion();
    s.boost *= Math.max(0, 1 - dt * 1.5);

    if (s.mode === 'walk' || s.mode === 'idle') {
      if (now > s.nextAt) {
        const r = Math.random();
        if (s.mode === 'walk') {
          if (r < 0.35) { setMode('idle'); s.nextAt = now + rand(1500, 4000); }
          else { if (r < 0.55) s.dir = -s.dir; s.nextAt = now + rand(2000, 5000); }
        } else if (s.seg === 0 && now - s.lastActive > SLEEP_AFTER) {
          setMode('sleep');
        } else if (!reduced) {
          setMode('walk');
          if (r < 0.5) s.dir = -s.dir;
          s.nextAt = now + rand(3000, 7000);
        } else {
          s.nextAt = now + 4000;
        }
      }
      if (s.mode === 'walk') {
        const v = WALK_SPEED + s.boost;
        s.p += s.dir * v * dt;
        s.dist += v * dt;
      }
      snapToPath();

      // on a wall or the ceiling it sometimes loses its grip
      if (!reduced && (s.seg === 2 || s.seg === 4 || s.seg === 6) && Math.random() < dt * LET_GO) {
        s.vx = -s.nx * 120;
        s.vy = 0;
        s.rot = 0;
        setMode('fall');
      }
    } else if (s.mode === 'drag') {
      // swing a little with the hand's motion
      const target = clamp(-s.dragVx * 0.03, -35, 35);
      s.rot += (target - s.rot) * Math.min(1, dt * 10);
      s.dragVx *= Math.max(0, 1 - dt * 8);
    } else if (s.mode === 'fall') {
      const { X0, X1, Y0, Y1 } = s.path.g;
      const [w, h] = poseSize();
      if (reduced) { s.y = Y1; s.vx = 0; s.vy = 0; }
      s.vy += GRAVITY * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.rot = clamp(s.vx / 45, -25, 25);
      s.nx = 0; s.ny = 1;
      if (Math.abs(s.vx) > 20) s.dir = Math.sign(s.vx);

      if (s.x - w / 2 <= X0) {
        if (-s.vx > CLING_SPEED) stickTo(6, s.y - h / 2, s.vy > 0 ? 1 : -1);
        else { s.x = X0 + w / 2; s.vx = Math.abs(s.vx) * 0.4; }
      } else if (s.x + w / 2 >= X1) {
        if (s.vx > CLING_SPEED) stickTo(2, s.y - h / 2, s.vy < 0 ? 1 : -1);
        else { s.x = X1 - w / 2; s.vx = -Math.abs(s.vx) * 0.4; }
      }
      if (s.mode === 'fall' && s.y - h <= Y0) {
        if (-s.vy > CLING_SPEED) stickTo(4, s.x, s.vx < 0 ? 1 : -1);
        else { s.y = Y0 + h; s.vy = Math.abs(s.vy) * 0.3; }
      }
      if (s.mode === 'fall' && s.y >= Y1) {
        s.y = Y1;
        if (s.vy > 700) { s.vy *= -0.35; s.vx *= 0.6; }
        else stickTo(0, s.x, s.vx >= 0 ? 1 : -1);
      }
    }

    if (now < s.happyUntil) setPose(HAPPY);
    else if (s.mode === 'sleep') setPose(SLEEP);
    else if (s.mode === 'drag' || s.mode === 'fall') setPose(DANGLE);
    else if (s.mode === 'walk') setPose(WALK);
    else setPose(SIT);

    draw();
    // asleep, nothing moves: let the loop rest until something wakes it
    s.raf = s.shown && (s.mode !== 'sleep' || now < s.happyUntil) ? requestAnimationFrame(tick) : 0;
  }

  function wake() {
    const s = st.current;
    if (!s.raf && s.shown) {
      s.last = performance.now();
      s.raf = requestAnimationFrame(tick);
    }
  }

  function perk() {
    const s = st.current;
    s.lastActive = performance.now();
    if (s.mode === 'sleep') setMode('idle');
  }

  /* ---------------------------------------------------------- setup */

  useEffect(() => {
    const s = st.current;
    [SIT, DANGLE, WALK, SLEEP, HAPPY, 69].forEach((n) => { new Image().src = sprite(n); });
    s.scrollY = window.scrollY;
    measure();
    setPose(SIT);
    draw();

    function onScroll() {
      const y = window.scrollY;
      const dy = y - s.scrollY;
      s.scrollY = y;

      // appear once the hero (with its own cat) is mostly out of view
      const show = y > window.innerHeight * 0.6 || s.mode === 'drag';
      if (show !== s.shown) {
        s.shown = show;
        setShown(show);
        if (show) {
          // drop in from under the top bar
          measure();
          const { X0, X1, Y0 } = s.path.g;
          s.x = rand(X0 + (X1 - X0) * 0.25, X0 + (X1 - X0) * 0.75);
          s.y = Y0 + 60;
          s.vx = rand(-150, 150);
          s.vy = 0;
          s.lastActive = performance.now();
          setMode('fall');
        }
      }
      if (!show || !dy) return;

      perk();
      if (!reducedMotion() && (s.mode === 'idle' || s.mode === 'walk')) {
        const dir = Math.sign(dy);
        if (s.lastDir && dir !== s.lastDir) s.dir = -s.dir; // scrolling back turns it round
        s.lastDir = dir;
        s.boost = Math.min(MAX_BOOST, s.boost + Math.abs(dy) * 3);
        setMode('walk');
        s.nextAt = Math.max(s.nextAt, performance.now() + 1500);
      }
      wake();
    }

    function onResize() {
      measure();
      const n = imgRef.current?.dataset.n;
      if (n) { imgRef.current.dataset.n = ''; setPose(Number(n)); }
      if (s.mode === 'walk' || s.mode === 'idle' || s.mode === 'sleep') snapToPath();
      if (s.shown) { draw(); wake(); }
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, []);

  useEffect(() => {
    if (!bubble) return;
    draw();
    const t = setTimeout(() => setBubble(null), bubble.ms || 1800);
    return () => clearTimeout(t);
  }, [bubble]);

  /* ---------------------------------------------------------- grab & throw */

  function onPointerDown(e) {
    if (e.button !== 0) return;
    const s = st.current;
    e.currentTarget.setPointerCapture(e.pointerId);
    s.down = { x: e.clientX, y: e.clientY };
    s.samples = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    s.suppressClick = false;
  }

  function onPointerMove(e) {
    const s = st.current;
    if (!s.down) return;
    const now = performance.now();
    if (s.mode !== 'drag') {
      if (Math.hypot(e.clientX - s.down.x, e.clientY - s.down.y) < 5) return;
      perk();
      s.dragVx = 0;
      setMode('drag');
      setPose(DANGLE);
      wake();
    }
    const prev = s.samples[s.samples.length - 1];
    s.dragVx = (e.clientX - prev.x) / Math.max(0.001, (now - prev.t) / 1000);
    s.samples.push({ x: e.clientX, y: e.clientY, t: now });
    while (s.samples.length > 2 && now - s.samples[0].t > 100) s.samples.shift();
    // held by the scruff: hang below the pointer
    const [, h] = poseSize();
    s.x = e.clientX;
    s.y = e.clientY + h * 0.8;
    s.nx = 0; s.ny = 1;
    draw();
  }

  function onPointerUp(e) {
    const s = st.current;
    if (!s.down) return;
    s.down = null;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (s.mode !== 'drag') return; // a plain click: onClick pets it
    s.suppressClick = true;
    const now = performance.now();
    const first = s.samples[0];
    const last = s.samples[s.samples.length - 1];
    const secs = Math.max(0.016, (last.t - first.t) / 1000);
    let vx = (last.x - first.x) / secs;
    let vy = (last.y - first.y) / secs;
    if (now - last.t > 120) { vx = 0; vy = 0; } // held still before letting go: just drop
    const v = Math.hypot(vx, vy);
    if (v > MAX_THROW) { vx *= MAX_THROW / v; vy *= MAX_THROW / v; }
    s.vx = vx;
    s.vy = vy;
    if (v > 900) say(THROWN[Math.floor(Math.random() * THROWN.length)], 1200);
    setMode('fall');
    wake();
  }

  function pet() {
    const s = st.current;
    if (s.suppressClick) { s.suppressClick = false; return; }
    if (s.mode === 'fall' || s.mode === 'drag') return;
    perk();
    setMode('idle');
    s.nextAt = performance.now() + 1500;
    s.happyUntil = performance.now() + 1400;
    say(LINES[lineIdx.current % LINES.length]);
    lineIdx.current += 1;
    const id = Date.now();
    const [, h] = poseSize();
    setHearts((hs) => [...hs, { id, x: s.x - s.nx * h * 0.7, y: s.y - s.ny * h * 0.7 }]);
    setTimeout(() => setHearts((hs) => hs.filter((x) => x.id !== id)), 1000);
    wake();
  }

  return (
    <div className={`desk-pet${shown ? ' is-shown' : ''}`} aria-hidden={!shown}>
      <button
        type="button"
        ref={boxRef}
        className={`desk-pet__cat${dragging ? ' is-dragging' : ''}`}
        onClick={pet}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDragStart={(e) => e.preventDefault()}
        tabIndex={shown ? 0 : -1}
        aria-label="Pet the cat (drag to pick it up and throw it)"
      >
        {asleep && !bubble && (
          <span className="desk-pet__zzz" aria-hidden="true"><i>z</i><i>z</i><i>z</i></span>
        )}
        <img ref={imgRef} className="px" alt="" draggable="false" />
      </button>
      {bubble && (
        <span ref={sayRef} className="desk-pet__say" key={bubble.key}>
          <span className="speech desk-pet__speech">{bubble.text}</span>
        </span>
      )}
      {hearts.map((hh) => (
        <img key={hh.id} src={sprite(69)} className="heart-pop px" alt="" style={{ left: hh.x - 10, top: hh.y - 20 }} />
      ))}
    </div>
  );
}
