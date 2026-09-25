import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/* The Experience banner as a little story: she walks the timeline from the
   oldest entry to the newest and acts each one out (reads for education, codes
   for work, lifts the trophy for awards), then rests by the campfire and the
   loop starts again. One rAF loop writes transforms directly; particles are
   short-lived DOM nodes with CSS animations. */

const sprite = (n) => `/sprites/sprite_${String(n).padStart(3, '0')}.png`;

// drawn heights, so every pose sits at the same pixel scale
const POSE_H = { 2: 68, 29: 65, 30: 66, 31: 65, 44: 60, 70: 56, 72: 58, 86: 62 };
const WALK = [29, 30, 31, 30];
const SPEED = 120; // px/s
const STRIDE = 15;
const GAP = 190; // px between stops
const EDGE = 90; // margin before the first stop

const ACT = { education: 2.8, work: 2.8, award: 2.2, rest: 4 };
const POSE = { education: 70, work: 72, award: 44, rest: 86 };
const CODE = ['</>', '{ }', '✓', '01', '=>', '( )'];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ExperienceStage = forwardRef(function ExperienceStage({ stops, onActive }, ref) {
  const boxRef = useRef(null);
  const worldRef = useRef(null);
  const actorRef = useRef(null);
  const imgRef = useRef(null);
  const trophyRef = useRef(null);
  const fxRef = useRef(null);
  const chipRefs = useRef([]);

  // stops + the campfire at the end
  const all = [...stops, { kind: 'rest', year: 'Next', title: 'Next chapter: your team?' }];
  const xs = all.map((_, i) => EDGE + i * GAP);
  const worldW = EDGE * 2 + (all.length - 1) * GAP;

  const st = useRef({
    x: -60, dir: 1, dist: 0, idx: 0, phase: 'walk', t: 0, spawn: 0, fade: 0,
    cam: 0, raf: 0, last: 0, visible: false, still: false,
  });

  /* ---------------------------------------------------------- helpers */

  function frame(n) {
    const img = imgRef.current;
    if (img.dataset.n === String(n)) return;
    img.src = sprite(n);
    img.dataset.n = n;
    img.style.height = `${POSE_H[n]}px`;
  }

  function fx(className, x, y, content, vars = {}) {
    const el = document.createElement(typeof content === 'number' ? 'img' : 'span');
    el.className = `sfx ${className}`;
    if (typeof content === 'number') { el.src = sprite(content); el.alt = ''; } else el.textContent = content;
    el.style.left = `${x}px`;
    el.style.bottom = `${y}px`;
    Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v));
    el.addEventListener('animationend', () => el.remove());
    setTimeout(() => el.remove(), 2500); // backup if the animation never ends (e.g. hidden tab)
    fxRef.current.appendChild(el);
  }

  function burst(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (i / (count - 1) - 0.5) * Math.PI * 1.1;
      const r = 50 + Math.random() * 30;
      fx('sfx-star', x, y, i % 2 ? 12 : 23, { '--dx': `${Math.cos(a) * r}px`, '--dy': `${-Math.sin(a) * r}px` });
    }
  }

  function setActive(i) {
    chipRefs.current.forEach((el, k) => el?.classList.toggle('is-on', k === i));
    if (i >= 0 && i < stops.length) onActive?.(i);
    else onActive?.(-1);
  }

  /* ---------------------------------------------------------- the loop */

  function arrive() {
    const s = st.current;
    const stop = all[s.idx];
    s.phase = 'act';
    s.t = 0;
    s.spawn = 0;
    s.dir = 1;
    setActive(s.idx);
    frame(POSE[stop.kind]);
    if (stop.kind !== 'rest') fx('sfx-pop', s.x, 78, 61);
    if (stop.kind === 'award') {
      trophyRef.current.classList.add('is-on');
      burst(s.x, 60, 10);
    }
  }

  function finishAct() {
    const s = st.current;
    const stop = all[s.idx];
    trophyRef.current.classList.remove('is-on');
    if (stop.kind === 'rest') {
      s.phase = 'fade';
      s.t = 0;
      return;
    }
    // the payoff: diploma for education, a heart for work, then 'Level Up!'
    if (stop.kind === 'education') fx('sfx-rise', s.x + 14, 60, 33);
    if (stop.kind === 'work') fx('sfx-rise', s.x + 14, 60, 69);
    fx('sfx-banner', s.x, 92, 91);
    burst(s.x, 50, 6);
    s.phase = 'cheer';
    s.t = 0;
  }

  function nextStop() {
    const s = st.current;
    s.idx += 1;
    s.phase = 'walk';
    setActive(-1);
  }

  function tick(now) {
    const s = st.current;
    const dt = Math.min((now - s.last) / 1000, 0.05);
    s.last = now;
    s.t += dt;
    let y = 0;

    if (s.phase === 'walk') {
      const target = xs[s.idx];
      const dx = target - s.x;
      if (Math.abs(dx) <= 2) {
        s.x = target;
        arrive();
      } else {
        const step = Math.sign(dx) * Math.min(Math.abs(dx), SPEED * dt);
        s.x += step;
        s.dist += Math.abs(step);
        s.dir = Math.sign(dx);
        frame(WALK[Math.floor(s.dist / STRIDE) % WALK.length]);
      }
    } else if (s.phase === 'act') {
      const stop = all[s.idx];
      s.spawn -= dt;
      if (stop.kind === 'work' && s.spawn <= 0) {
        fx('sfx-code', s.x + 12 + Math.random() * 16, 58, CODE[Math.floor(Math.random() * CODE.length)]);
        s.spawn = 0.4;
      } else if (stop.kind === 'education' && s.spawn <= 0) {
        fx('sfx-float', s.x + 18, 54, '+EXP');
        s.spawn = 0.8;
      } else if (stop.kind === 'award') {
        y = Math.abs(Math.sin(s.t * 6)) * 14; // happy bouncing with the trophy
      }
      if (s.t >= ACT[stop.kind]) finishAct();
    } else if (s.phase === 'cheer') {
      frame(44);
      y = Math.sin(Math.min(s.t / 0.5, 1) * Math.PI) * 26;
      if (s.t >= 0.7) nextStop();
    } else if (s.phase === 'fade') {
      // fade out, reset to the start, fade back in
      const o = s.t < 0.6 ? 1 - s.t / 0.6 : Math.min(1, (s.t - 0.6) / 0.6);
      worldRef.current.style.opacity = o;
      if (s.t >= 0.6 && s.idx !== 0) {
        s.idx = 0;
        s.x = -60;
        setActive(-1);
      }
      if (s.t >= 1.2) {
        worldRef.current.style.opacity = 1;
        s.phase = 'walk';
      }
    }

    draw(y);
    if (s.visible) s.raf = requestAnimationFrame(tick);
    else s.raf = 0;
  }

  function draw(y = 0) {
    const s = st.current;
    const boxW = boxRef.current.clientWidth;
    // follow her when the world is wider than the banner (phones)
    const target = Math.max(0, Math.min(worldW - boxW, s.x - boxW / 2));
    s.cam += (target - s.cam) * 0.08;
    if (worldW <= boxW) s.cam = -(boxW - worldW) / 2;
    worldRef.current.style.transform = `translate3d(${-s.cam}px, 0, 0)`;
    actorRef.current.style.transform = `translate3d(${s.x - 60}px, ${-y}px, 0)`;
    imgRef.current.style.transform = `scaleX(${s.dir})`;
  }

  function play() {
    const s = st.current;
    if (s.raf || s.still) return;
    s.last = performance.now();
    s.raf = requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------- setup */

  useEffect(() => {
    const s = st.current;
    s.still = reducedMotion();
    [...WALK, 2, 44, 70, 72, 86, 61, 12, 23, 33, 69, 91, 52].forEach((n) => { new Image().src = sprite(n); });

    if (s.still) {
      // no animation: show her acting out the first entry
      s.x = xs[0];
      frame(POSE[all[0].kind]);
      setActive(0);
      draw();
      return undefined;
    }
    frame(2);
    draw();
    if (import.meta.env.DEV) window.__pfStage = { st: s, tick }; // handy for debugging in dev
    const io = new IntersectionObserver(([e]) => {
      s.visible = e.isIntersecting;
      if (s.visible) play();
    }, { threshold: 0.15 });
    io.observe(boxRef.current);
    const ro = new ResizeObserver(() => draw());
    ro.observe(boxRef.current);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, []);

  // lets a timeline card send her straight to its stop
  useImperativeHandle(ref, () => ({
    goTo(i) {
      const s = st.current;
      if (i < 0 || i >= stops.length) return;
      trophyRef.current.classList.remove('is-on');
      worldRef.current.style.opacity = 1;
      if (s.still) {
        s.x = xs[i];
        s.idx = i;
        frame(POSE[all[i].kind]);
        setActive(i);
        draw();
        return;
      }
      s.idx = i;
      s.phase = 'walk';
      setActive(-1);
      play();
    },
  }));

  return (
    <div className="scene scene--dusk strip stage" ref={boxRef}>
      <div className="scene__art" aria-hidden="true">
        <img className="px moon" src={sprite(132)} alt="" style={{ height: 30 }} />
        <div className="mountains" />
      </div>
      <div className="stage__world" ref={worldRef} style={{ width: worldW }} aria-hidden="true">
        <div className="ground ground--path" />
        {all.map((stop, i) => (
          <div className={`stop stop--${stop.kind}`} key={stop.title} style={{ left: xs[i] }}>
            {stop.kind === 'work' && <img className="px stop__prop stop__prop--coffee" src={sprite(40)} alt="" />}
            {stop.kind === 'education' && <img className="px stop__prop stop__prop--books" src={sprite(34)} alt="" />}
            {stop.kind === 'award' && <img className="px stop__prop stop__prop--podium" src={sprite(108)} alt="" />}
            {stop.kind === 'rest' && <img className="px stop__prop stop__prop--tree" src={sprite(130)} alt="" />}
            <img className="px stop__sign" src={sprite(100)} alt="" />
            <span className="stop__year">{stop.year}</span>
            <span className="stop__chip" ref={(el) => { chipRefs.current[i] = el; }}>{stop.title}</span>
          </div>
        ))}
        <div className="actor-s" ref={actorRef}>
          <img className="px stage__trophy" ref={trophyRef} src={sprite(52)} alt="" />
          <img className="px" ref={imgRef} alt="" draggable="false" />
        </div>
        <div className="stage__fx" ref={fxRef} />
      </div>
    </div>
  );
});

export default ExperienceStage;
