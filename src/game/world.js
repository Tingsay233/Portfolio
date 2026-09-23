import { hash } from './pixel.js';

/*
 * The village map. Ground is a grid of tiles; everything that stands on it —
 * buildings, landmarks, trees — is an object with a footprint that blocks
 * movement. Objects with a `place` open part of the portfolio.
 */

export const COLS = 28;
export const ROWS = 18;
export const TILE = 16;

export const SPAWN = { x: 12, y: 9, facing: 'up' };

/* Places the visitor can open. Order is the order in the map legend. */
export const PLACES = [
  { id: 'welcome',   name: 'Welcome Sign',     hint: 'Start here' },
  { id: 'about',     name: "Si Ting's Cottage", hint: 'About me' },
  { id: 'quests',    name: 'Quest Board',      hint: 'Projects' },
  { id: 'churn',     name: 'Churn Arcade',     hint: 'ML demo' },
  { id: 'chess',     name: 'Chess Arcade',     hint: 'Game demo' },
  { id: 'journey',   name: 'Time Portal',      hint: 'Experience' },
  { id: 'guestbook', name: 'Guestbook',        hint: 'Leave a note' },
  { id: 'contact',   name: 'Campfire',         hint: 'Contact' },
  { id: 'chest',     name: 'Secret Chest',     hint: 'Résumé' },
];

export const OBJECTS = [
  { id: 'sign',     kind: 'signpost', x: 12, y: 8,  w: 1, h: 1, place: 'welcome' },
  { id: 'cottage',  kind: 'cottage',  x: 3,  y: 2,  w: 4, h: 3, place: 'about' },
  { id: 'board',    kind: 'board',    x: 12, y: 3,  w: 2, h: 1, place: 'quests' },
  { id: 'cab-churn', kind: 'cabinet-churn', x: 19, y: 3, w: 1, h: 1, place: 'churn' },
  { id: 'cab-chess', kind: 'cabinet-chess', x: 22, y: 3, w: 1, h: 1, place: 'chess' },
  { id: 'portal',   kind: 'portal',   x: 3,  y: 12, w: 2, h: 2, place: 'journey' },
  { id: 'lectern',  kind: 'lectern',  x: 17, y: 12, w: 1, h: 1, place: 'guestbook' },
  { id: 'fire',     kind: 'campfire', x: 23, y: 13, w: 1, h: 1, place: 'contact' },
  { id: 'chest',    kind: 'chest',    x: 25, y: 16, w: 1, h: 1, place: 'chest' },
];

/* Scenery: trees along the border and scattered inside, a few bushes. */
const INNER_TREES = [
  [2, 6], [9, 3], [16, 4], [25, 5], [8, 7], [19, 15], [14, 15], [6, 16], [1, 10],
  [21, 11], [26, 9], [11, 16], [16, 1], [24, 1],
];
const BUSHES = [[7, 5], [15, 7], [24, 3], [24, 7], [2, 15], [20, 16], [11, 11], [26, 13]];

function buildGround() {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill('grass'));
  const set = (x, y, t) => { if (g[y] && g[y][x] !== undefined) g[y][x] = t; };
  const h = (y, x0, x1) => { for (let x = x0; x <= x1; x++) set(x, y, 'path'); };
  const v = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y, 'path'); };

  h(9, 3, 24);        // main road
  v(5, 5, 13);        // cottage ↔ portal
  v(13, 4, 8);        // quest board
  v(21, 4, 8);        // arcade
  h(4, 18, 23);       // arcade plaza
  v(17, 10, 11);      // guestbook
  v(23, 10, 12);      // campfire
  h(14, 22, 24);

  for (let y = 12; y <= 15; y++) for (let x = 8; x <= 10; x++) set(x, y, 'water');
  set(11, 13, 'water');
  set(11, 14, 'water');
  return g;
}

export const GROUND = buildGround();

function buildScenery() {
  const trees = [];
  for (let x = 0; x < COLS; x++) {
    trees.push([x, 0]);
    trees.push([x, ROWS - 1]);
  }
  for (let y = 1; y < ROWS - 1; y++) {
    trees.push([0, y]);
    trees.push([COLS - 1, y]);
  }
  trees.push(...INNER_TREES);

  const scenery = [
    ...trees.map(([x, y], i) => ({ id: `tree-${i}`, kind: 'tree', variant: i % 3, x, y, w: 1, h: 1 })),
    ...BUSHES.map(([x, y], i) => ({ id: `bush-${i}`, kind: 'bush', x, y, w: 1, h: 1 })),
  ];

  // Flowers on open grass — decoration only, they don't block.
  const flowers = [];
  for (let y = 1; y < ROWS - 1; y++) {
    for (let x = 1; x < COLS - 1; x++) {
      if (GROUND[y][x] !== 'grass') continue;
      if (hash(x, y, 31) > 0.86) flowers.push({ id: `fl-${x}-${y}`, x, y, variant: Math.floor(hash(x, y, 8) * 3) });
    }
  }
  return { scenery, flowers };
}

const built = buildScenery();
export const SCENERY = built.scenery;

const blocked = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
for (const o of [...OBJECTS, ...SCENERY]) {
  for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) blocked[y][x] = true;
}
for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (GROUND[y][x] === 'water') blocked[y][x] = true;

// Flowers under a footprint would be hidden anyway.
export const FLOWER_TILES = built.flowers.filter((f) => !blocked[f.y][f.x]);

export function isBlocked(x, y) {
  return x < 0 || y < 0 || x >= COLS || y >= ROWS || blocked[y][x];
}

export const DIRS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

/** The object the visitor is standing next to — preferring the one they face. */
export function objectNear(x, y, facing, extra = []) {
  const all = [...extra, ...OBJECTS];
  const touching = (o) => {
    for (let oy = o.y; oy < o.y + o.h; oy++) {
      for (let ox = o.x; ox < o.x + o.w; ox++) {
        if (Math.abs(ox - x) + Math.abs(oy - y) === 1) return true;
      }
    }
    return false;
  };
  const [dx, dy] = DIRS[facing];
  const fx = x + dx;
  const fy = y + dy;
  const faced = all.find((o) => fx >= o.x && fx < o.x + o.w && fy >= o.y && fy < o.y + o.h);
  return faced ?? all.find(touching) ?? null;
}

/**
 * Shortest walk from (sx, sy) to any tile next to the target object, or to the
 * tile itself when it is open ground. Returns the list of steps, or null.
 */
export function findPath(sx, sy, target, avoid = null) {
  const goal = new Set();
  if (target.w) {
    for (let oy = target.y; oy < target.y + target.h; oy++) {
      for (let ox = target.x; ox < target.x + target.w; ox++) {
        for (const [dx, dy] of Object.values(DIRS)) goal.add(`${ox + dx},${oy + dy}`);
      }
    }
  } else {
    goal.add(`${target.x},${target.y}`);
  }

  const start = `${sx},${sy}`;
  if (goal.has(start)) return [];
  const prev = new Map([[start, null]]);
  const queue = [[sx, sy]];
  while (queue.length) {
    const [cx, cy] = queue.shift();
    for (const [dir, [dx, dy]] of Object.entries(DIRS)) {
      const nx = cx + dx;
      const ny = cy + dy;
      const key = `${nx},${ny}`;
      if (prev.has(key) || isBlocked(nx, ny) || (avoid && avoid.x === nx && avoid.y === ny)) continue;
      prev.set(key, { from: `${cx},${cy}`, dir, x: nx, y: ny });
      if (goal.has(key)) {
        const steps = [];
        let k = key;
        while (prev.get(k)) {
          const step = prev.get(k);
          steps.unshift(step);
          k = step.from;
        }
        return steps;
      }
      queue.push([nx, ny]);
    }
  }
  return null;
}

/** Which way to face to look at an object from (x, y). */
export function faceToward(x, y, o) {
  const cx = Math.max(o.x, Math.min(x, o.x + o.w - 1));
  const cy = Math.max(o.y, Math.min(y, o.y + o.h - 1));
  if (cy < y) return 'up';
  if (cy > y) return 'down';
  if (cx < x) return 'left';
  return 'right';
}
