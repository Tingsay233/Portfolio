import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useSpriteSrc } from '../components/Sprite.jsx';
import {
  BUSH, CABINET_CHESS, CABINET_CHURN, CAMPFIRE, CAT, CHAR, CHEST, COTTAGE,
  FLOWERS, LECTERN, PORTAL, QUEST_BOARD, SIGNPOST, TILES, TREES,
} from './art.js';
import {
  COLS, DIRS, FLOWER_TILES, GROUND, OBJECTS, PLACES, ROWS, SCENERY, SPAWN, TILE,
  faceToward, findPath, isBlocked, objectNear,
} from './world.js';

/*
 * The explorable village. Walk with WASD / arrows (or the on-screen pad),
 * press E / Enter / Space beside something to open it, or click anywhere to
 * walk there. Everything is drawn from the sprites in art.js.
 */

const STEP_MS = 150;
const AUTO_STEP_MS = 95;

const KEY_DIRS = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
};
const ACTION_KEYS = new Set(['e', 'E', 'Enter', ' ']);

/* Sprite art per object kind, with the size it is drawn at (art pixels). */
const ART = {
  signpost: { src: SIGNPOST, w: 16, h: 15, sprite: 'signpost' },
  cottage: { src: COTTAGE, w: 64, h: 56 },
  board: { src: QUEST_BOARD, w: 32, h: 30 },
  'cabinet-churn': { src: CABINET_CHURN, w: 16, h: 30 },
  'cabinet-chess': { src: CABINET_CHESS, w: 16, h: 30 },
  portal: { frames: PORTAL, w: 32, h: 40, fps: 5 },
  lectern: { src: LECTERN, w: 16, h: 18 },
  campfire: { frames: CAMPFIRE, w: 16, h: 17, fps: 7 },
  chest: { src: CHEST.closed, w: 16, h: 14, sprite: 'chest' },
  bush: { src: BUSH, w: 16, h: 13 },
};

const PLACE_NAME = Object.fromEntries(PLACES.map((p) => [p.id, p.name]));

const CAT_HOME = [
  { x: 14, y: 10 }, { x: 15, y: 10 }, { x: 15, y: 11 }, { x: 14, y: 11 }, { x: 13, y: 10 },
];

const INTRO = [
  "Hi, I'm Say Si Ting! Welcome to my village.",
  'I study Computer Science at MMU and build web apps and machine learning.',
  'Walk around and step up to anything with a name tag to look inside. The sign in front of you is a good start.',
];

function reducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function useFrame(count, fps) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (count < 2 || reducedMotion()) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % count), 1000 / fps);
    return () => clearInterval(t);
  }, [count, fps]);
  return i;
}

function Thing({ obj, scale, near, visited, opened, onClick }) {
  const art = ART[obj.kind];
  const frame = useFrame(art.frames?.length ?? 1, art.fps ?? 1);
  let src = art.frames ? art.frames[frame] : art.src;
  if (obj.kind === 'chest' && opened) src = CHEST.open;
  const png = useSpriteSrc(obj.kind === 'chest' && opened ? null : art.sprite, src);

  const unit = TILE * scale;
  const w = art.w * scale;
  const h = art.h * scale;
  const left = obj.x * unit + (obj.w * unit - w) / 2;
  const top = (obj.y + obj.h) * unit - h;

  return (
    <div
      className={`thing thing-${obj.kind}${near ? ' is-near' : ''}`}
      style={{ left, top, width: w, height: h, zIndex: (obj.y + obj.h) * 10 }}
      onClick={onClick}
    >
      <img src={png} alt="" draggable="false" width={w} height={h} />
      {obj.place && (
        <span className={`thing-tag${visited ? ' is-visited' : ''}`}>
          {visited && <span aria-hidden="true">✓ </span>}
          {PLACE_NAME[obj.place]}
        </span>
      )}
    </div>
  );
}

function Scenery({ obj, scale }) {
  const unit = TILE * scale;
  if (obj.kind === 'tree') {
    const w = 24 * scale;
    const h = 30 * scale;
    return (
      <img
        className="scenery"
        src={TREES[obj.variant]}
        alt=""
        draggable="false"
        style={{ left: obj.x * unit + (unit - w) / 2, top: (obj.y + 1) * unit - h, width: w, height: h, zIndex: (obj.y + 1) * 10 }}
      />
    );
  }
  const w = 16 * scale;
  const h = 13 * scale;
  return (
    <img
      className="scenery"
      src={BUSH}
      alt=""
      draggable="false"
      style={{ left: obj.x * unit, top: (obj.y + 1) * unit - h, width: w, height: h, zIndex: (obj.y + 1) * 10 }}
    />
  );
}

function Ground({ scale }) {
  const unit = TILE * scale;
  const cells = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const t = GROUND[y][x];
      if (t === 'grass') continue;
      const style = { left: x * unit, top: y * unit, width: unit, height: unit, backgroundSize: `${unit}px ${unit}px` };
      if (t === 'water') {
        // A sandy lip where the pond meets the grass.
        const edge = scale * 2;
        const shadows = [];
        if (GROUND[y - 1]?.[x] !== 'water') shadows.push(`inset 0 ${edge}px 0 #E6CF9A`);
        if (GROUND[y + 1]?.[x] !== 'water') shadows.push(`inset 0 -${edge}px 0 #E6CF9A`);
        if (GROUND[y][x - 1] !== 'water') shadows.push(`inset ${edge}px 0 0 #E6CF9A`);
        if (GROUND[y][x + 1] !== 'water') shadows.push(`inset -${edge}px 0 0 #E6CF9A`);
        style.boxShadow = shadows.join(', ');
      }
      cells.push(<span key={`${x},${y}`} className={`tile tile-${t}`} style={style} />);
    }
  }
  return (
    <>
      {cells}
      {FLOWER_TILES.map((f) => (
        <img
          key={f.id}
          className="flower"
          src={FLOWERS[f.variant]}
          alt=""
          draggable="false"
          style={{ left: f.x * unit, top: f.y * unit + unit / 2, width: unit, height: unit / 2 }}
        />
      ))}
    </>
  );
}

const Explore = forwardRef(function Explore(
  { paused, visited, chestOpened, onOpen, onPetCat, onFirstVisit, firstVisit },
  ref
) {
  const viewRef = useRef(null);
  const [view, setView] = useState({ w: 800, h: 520 });
  const scale = view.w < 640 ? 2 : 3;
  const unit = TILE * scale;

  const [pos, setPos] = useState({ x: SPAWN.x, y: SPAWN.y });
  const [facing, setFacing] = useState(SPAWN.facing);
  const [walkFrame, setWalkFrame] = useState(0);
  const [moving, setMoving] = useState(false);
  const [stepMs, setStepMs] = useState(STEP_MS);
  const [cat, setCat] = useState(CAT_HOME[0]);
  const [hearts, setHearts] = useState(0);
  const [dialog, setDialog] = useState(null); // { speaker, lines, i }

  const posRef = useRef(pos);
  const facingRef = useRef(facing);
  const catRef = useRef(cat);
  const heldRef = useRef([]);
  const pathRef = useRef([]);
  const targetRef = useRef(null);
  const lastStepRef = useRef(0);
  const movingRef = useRef(false);
  const blockedInput = paused || dialog !== null;
  const blockedRef = useRef(blockedInput);
  blockedRef.current = blockedInput;
  catRef.current = cat;

  const catObj = { id: 'cat', kind: 'cat', x: cat.x, y: cat.y, w: 1, h: 1 };
  const near = objectNear(pos.x, pos.y, facing, [catObj]);

  // Measure the viewport so the camera can centre on the player.
  useLayoutEffect(() => {
    const el = viewRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setView({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // First visit: the character says hello.
  useEffect(() => {
    if (firstVisit) setDialog({ speaker: 'Si Ting', lines: INTRO, i: 0 });
  }, [firstVisit]);

  const interact = useCallback(
    (obj) => {
      if (!obj) return;
      if (obj.kind === 'cat') {
        setHearts((n) => n + 1);
        setDialog({ speaker: 'Mochi', lines: ['Mrrp! Mochi leans into your hand and purrs like a small engine.'], i: 0 });
        onPetCat?.();
        return;
      }
      if (obj.place) onOpen(obj.place);
    },
    [onOpen, onPetCat]
  );

  const step = useCallback((dir) => {
    facingRef.current = dir;
    setFacing(dir);
    const [dx, dy] = DIRS[dir];
    const nx = posRef.current.x + dx;
    const ny = posRef.current.y + dy;
    const c = catRef.current;
    if (isBlocked(nx, ny) || (c.x === nx && c.y === ny)) return false;
    posRef.current = { x: nx, y: ny };
    setPos(posRef.current);
    setWalkFrame((f) => (f % 3) + 1);
    return true;
  }, []);

  // The movement loop: auto-walk paths first, then held keys.
  useEffect(() => {
    let raf;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (blockedRef.current) {
        pathRef.current = [];
        return;
      }
      const auto = pathRef.current.length > 0;
      const wait = auto ? AUTO_STEP_MS : STEP_MS;
      if (now - lastStepRef.current < wait) return;

      if (auto) {
        const next = pathRef.current.shift();
        setStepMs(AUTO_STEP_MS);
        if (!step(next.dir)) {
          pathRef.current = [];
          targetRef.current = null;
        }
        lastStepRef.current = now;
        movingRef.current = true;
        setMoving(true);
        if (pathRef.current.length === 0 && targetRef.current) {
          const t = targetRef.current;
          targetRef.current = null;
          if (t.w) {
            const dir = faceToward(posRef.current.x, posRef.current.y, t);
            facingRef.current = dir;
            setFacing(dir);
            setTimeout(() => interact(t), AUTO_STEP_MS);
          }
        }
        return;
      }

      const held = heldRef.current[heldRef.current.length - 1];
      if (held) {
        setStepMs(STEP_MS);
        step(held);
        lastStepRef.current = now;
        movingRef.current = true;
        setMoving(true);
      } else if (movingRef.current && now - lastStepRef.current > wait + 40) {
        movingRef.current = false;
        setMoving(false);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [step, interact]);

  const walkTo = useCallback((target) => {
    const c = catRef.current;
    const path = findPath(posRef.current.x, posRef.current.y, target, c);
    if (path === null) return;
    targetRef.current = target;
    pathRef.current = path;
    if (path.length === 0 && target.w) {
      const dir = faceToward(posRef.current.x, posRef.current.y, target);
      facingRef.current = dir;
      setFacing(dir);
      targetRef.current = null;
      interact(target);
    }
  }, [interact]);

  useImperativeHandle(ref, () => ({
    travelTo(placeId) {
      const obj = OBJECTS.find((o) => o.place === placeId);
      if (obj) walkTo(obj);
    },
  }), [walkTo]);

  const advanceDialog = useCallback(() => {
    setDialog((d) => {
      if (!d) return null;
      if (d.i + 1 < d.lines.length) return { ...d, i: d.i + 1 };
      if (d.speaker === 'Si Ting') onFirstVisit?.();
      return null;
    });
  }, [onFirstVisit]);

  // Keyboard.
  useEffect(() => {
    const typing = (e) => {
      const t = e.target;
      return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    };
    const onDown = (e) => {
      if (paused || typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (dialog && (ACTION_KEYS.has(e.key) || e.key === 'Escape')) {
        e.preventDefault();
        advanceDialog();
        return;
      }
      const dir = KEY_DIRS[e.key];
      if (dir) {
        if (e.key.startsWith('Arrow')) e.preventDefault();
        pathRef.current = [];
        targetRef.current = null;
        if (!heldRef.current.includes(dir)) heldRef.current.push(dir);
        return;
      }
      // Buttons keep their own Enter/Space.
      if (ACTION_KEYS.has(e.key) && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A' && near) {
        e.preventDefault();
        interact(near);
      }
    };
    const onUp = (e) => {
      const dir = KEY_DIRS[e.key];
      if (dir) heldRef.current = heldRef.current.filter((d) => d !== dir);
    };
    const clear = () => { heldRef.current = []; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', clear);
    };
  }, [paused, dialog, near, interact, advanceDialog]);

  // Held keys shouldn't keep walking once a panel opens.
  useEffect(() => {
    if (paused) heldRef.current = [];
  }, [paused]);

  // Mochi pads between a few favourite tiles now and then.
  useEffect(() => {
    if (reducedMotion()) return undefined;
    const t = setInterval(() => {
      if (blockedRef.current) return;
      const options = CAT_HOME.filter((c) => {
        const p = posRef.current;
        return !(c.x === p.x && c.y === p.y) && Math.abs(c.x - catRef.current.x) + Math.abs(c.y - catRef.current.y) === 1;
      });
      if (options.length && Math.random() < 0.5) setCat(options[Math.floor(Math.random() * options.length)]);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  const catBlink = useFrame(2, 0.6) === 1;

  // Camera: keep the player centred, clamped to the map edges.
  const worldW = COLS * unit;
  const worldH = ROWS * unit;
  const cam = (p, size, world) =>
    world <= size ? (world - size) / 2 : Math.max(0, Math.min(world - size, p * unit + unit / 2 - size / 2));
  const camX = cam(pos.x, view.w, worldW);
  const camY = cam(pos.y, view.h, worldH);

  const onWorldClick = (e) => {
    if (blockedInput) return;
    const rect = viewRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left + camX) / unit);
    const y = Math.floor((e.clientY - rect.top + camY) / unit);
    if (x === cat.x && y === cat.y) return walkTo(catObj);
    const obj = OBJECTS.find((o) => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h);
    if (obj) return walkTo(obj);
    if (!isBlocked(x, y)) walkTo({ x, y });
  };

  const clickThing = (obj) => (e) => {
    e.stopPropagation();
    if (!blockedInput) walkTo(obj);
  };

  const hold = (dir) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      pathRef.current = [];
      heldRef.current = [dir];
    },
    onPointerUp: () => { heldRef.current = []; },
    onPointerLeave: () => { heldRef.current = []; },
    onPointerCancel: () => { heldRef.current = []; },
  });

  const charSize = { w: 16 * scale, h: 20 * scale };
  const charFrame = moving ? walkFrame : 0;
  const charSrc = CHAR[facing][charFrame];
  const nearName = near ? (near.kind === 'cat' ? 'Mochi the cat' : PLACE_NAME[near.place]) : null;

  return (
    <div className="explore">
      <div
        ref={viewRef}
        className="explore-view"
        onClick={onWorldClick}
        style={{ '--step': `${stepMs}ms` }}
      >
        <div
          className="world"
          style={{
            width: worldW,
            height: worldH,
            transform: `translate3d(${-camX}px, ${-camY}px, 0)`,
            backgroundImage: `url("${TILES.grass}")`,
            backgroundSize: `${unit}px ${unit}px`,
            '--water-a': `url("${TILES.water[0]}")`,
            '--water-b': `url("${TILES.water[1]}")`,
            '--path': `url("${TILES.path}")`,
          }}
          aria-hidden="true"
        >
          <Ground scale={scale} />

          {SCENERY.map((o) => <Scenery key={o.id} obj={o} scale={scale} />)}

          {OBJECTS.map((o) => (
            <Thing
              key={o.id}
              obj={o}
              scale={scale}
              near={near?.id === o.id}
              visited={visited.includes(o.place)}
              opened={chestOpened}
              onClick={clickThing(o)}
            />
          ))}

          <div
            className={`actor cat${near?.id === 'cat' ? ' is-near' : ''}`}
            onClick={clickThing(catObj)}
            style={{
              width: 12 * scale,
              height: 12 * scale,
              transform: `translate3d(${cat.x * unit + 2 * scale}px, ${(cat.y + 1) * unit - 13 * scale}px, 0)`,
              zIndex: (cat.y + 1) * 10 + 1,
            }}
          >
            <img src={catBlink ? CAT.blink : CAT.sit} alt="" draggable="false" />
            {hearts > 0 && <span key={hearts} className="hearts">♥</span>}
          </div>

          <div
            className="actor player"
            style={{
              width: charSize.w,
              height: charSize.h,
              transform: `translate3d(${pos.x * unit}px, ${(pos.y + 1) * unit - charSize.h - scale}px, 0)`,
              zIndex: (pos.y + 1) * 10 + 5,
            }}
          >
            <span className="player-shadow" />
            <img src={charSrc} alt="" draggable="false" />
          </div>
        </div>

        {near && !blockedInput && (
          <button
            type="button"
            className="prompt"
            onClick={(e) => { e.stopPropagation(); interact(near); }}
          >
            <kbd>E</kbd> {near.kind === 'cat' ? 'Pet' : 'Open'} {nearName}
          </button>
        )}

        {dialog && (
          <div
            className="rpg-dialog"
            role="dialog"
            aria-live="polite"
            onClick={(e) => { e.stopPropagation(); advanceDialog(); }}
          >
            <span className="rpg-dialog-name">{dialog.speaker}</span>
            <p>{dialog.lines[dialog.i]}</p>
            <span className="rpg-dialog-more">
              {dialog.i + 1 < dialog.lines.length ? '▼ E / click' : '✕ E / click'}
            </span>
          </div>
        )}
      </div>

      <div className="pad" aria-label="Movement controls">
        <div className="pad-cross">
          <button type="button" className="pad-up" aria-label="Walk up" {...hold('up')}>▲</button>
          <button type="button" className="pad-left" aria-label="Walk left" {...hold('left')}>◀</button>
          <button type="button" className="pad-right" aria-label="Walk right" {...hold('right')}>▶</button>
          <button type="button" className="pad-down" aria-label="Walk down" {...hold('down')}>▼</button>
        </div>
        <button
          type="button"
          className="pad-a"
          aria-label={nearName ? `Interact with ${nearName}` : 'Interact'}
          onClick={() => (dialog ? advanceDialog() : interact(near))}
        >
          A
        </button>
      </div>
    </div>
  );
});

export default Explore;
