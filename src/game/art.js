import { blank, fromRows, hash, mirror, outline, paint, rect, toDataUrl } from './pixel.js';

/*
 * Every sprite in the village, drawn in code from the list in
 * public/sprites/README.md. Colours lean on the logo: teal #1F5E68 and
 * tan #D4A373 run through the character, the cottage and the signage.
 */

const P = {
  o: '#2A1A2E', // outline
  h: '#4A2C2A', H: '#6B3F35', // hair
  s: '#F2C29B', S: '#D99C7A', // skin
  e: '#2A1A2E', b: '#EE9A9A', // eyes, blush
  t: '#1F5E68', T: '#2E8A96', // logo teal
  a: '#D4A373', A: '#B8834F', // logo tan
  p: '#3B3355', k: '#20182E', // trousers, shoes
};

/* ── Character ─────────────────────────────────────────────────────── */

const CHAR_TOP = [
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhHHhhho...',
  '..ohhhhhhhhhho..',
];
const FACE = [
  '..ohhsssssshho..',
  '..ohssssssssho..',
  '..ohsessssesho..',
  '..ohbssssssbho..',
  '..ohhssSSsshho..',
  '..ohhhossohhho..',
  '.ohhottTTttohho.',
  '.ohottttttttoho.',
];
const BACK = [
  '..ohhhhhhhhhho..',
  '..ohhhhHHhhhho..',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '..ohhhhhhhhhho..',
  '.ohhhhhhhhhhhho.',
  '.ohottthhtttoho.',
];
const BODY = [
  '..ostttaatttso..',
  '..osttttttttso..',
  '...oaaaaaaaao...',
  '...oppppppppo...',
];
const LEGS_IDLE = [
  '...opppoopppo...',
  '...opppoopppo...',
  '...okkkookkko...',
  '...oooo..oooo...',
];
const LEGS_A = [
  '...opppoopppo...',
  '...okkkoopppo...',
  '...oooo.okkko...',
  '........oooo....',
];
const LEGS_B = [
  '...opppoopppo...',
  '...opppookkko...',
  '...okkko.oooo...',
  '...oooo.........',
];

const SIDE_TOP = [
  '.....ooooo......',
  '....ohhhhho.....',
  '...ohhhhHhho....',
  '..ohhhhhhhhho...',
  '..ohhhhhhssso...',
  '..ohhhhhsssso...',
  '..ohhhhhsseso...',
  '..ohhhhhssbsso..',
  '..ohhhhhhssso...',
  '..ohhhhhhoso....',
  '..ohhhhottto....',
  '..ohhhottttto...',
  '...ohottttto....',
  '....otttstto....',
  '....oaaaaaao....',
];
const SIDE_LEGS_IDLE = [
  '....opppppo.....',
  '....opppppo.....',
  '....opppppo.....',
  '....okkkkkko....',
  '....oooooooo....',
];
const SIDE_LEGS_WALK = [
  '....opppppo.....',
  '...oppoopppo....',
  '..oppo..oppo....',
  '.okkko..okkko...',
  '.oooo....oooo...',
];

const front = (legs) => fromRows([...CHAR_TOP, ...FACE, ...BODY, ...legs]);
const back = (legs) => fromRows([...CHAR_TOP, ...BACK, ...BODY, ...legs]);
const side = (legs) => fromRows([...SIDE_TOP, ...legs]);

const url = (grid, palette = P) => toDataUrl(grid, palette);

/* Frames per facing: [idle, step A, idle, step B] */
export const CHAR = {
  down: [front(LEGS_IDLE), front(LEGS_A), front(LEGS_IDLE), front(LEGS_B)].map((g) => url(g)),
  up: [back(LEGS_IDLE), back(LEGS_A), back(LEGS_IDLE), back(LEGS_B)].map((g) => url(g)),
  right: [side(SIDE_LEGS_IDLE), side(SIDE_LEGS_WALK), side(SIDE_LEGS_IDLE), side(SIDE_LEGS_WALK)].map((g) => url(g)),
  left: [side(SIDE_LEGS_IDLE), side(SIDE_LEGS_WALK), side(SIDE_LEGS_IDLE), side(SIDE_LEGS_WALK)].map((g) => url(mirror(g))),
};
export const CHAR_SIZE = { w: 16, h: 20 };

/* ── Companion: the cat ────────────────────────────────────────────── */

const CAT_P = { o: '#2A1A2E', c: '#E8A04C', C: '#C4782E', w: '#FFF3E0', e: '#2A1A2E', n: '#E88B8B' };
const CAT_ROWS = [
  '..o......o..',
  '.oco....oco.',
  '.occoooocco.',
  '.occcccccco.',
  '.ocecccceco.',
  '.occwnnwcco.',
  '..occwwcco..',
  '..occwwccoo.',
  '.occcwwccoco',
  '.occCccCcoco',
  '.ocwwccwwco.',
  '..oooooooo..',
];
const CAT_BLINK = CAT_ROWS.map((r, i) => (i === 4 ? '.occcccccco.' : r));
export const CAT = {
  sit: url(fromRows(CAT_ROWS), CAT_P),
  blink: url(fromRows(CAT_BLINK), CAT_P),
};
export const CAT_SIZE = { w: 12, h: 12 };

/* ── Interface props: chest and signpost ───────────────────────────── */

const WOOD_P = {
  o: '#3A2418', w: '#9B5E2E', W: '#C07A3E', g: '#F0C040', G: '#C8960C',
  k: '#1A0F14', y: '#FFF3B0', a: '#D4A373', t: '#1F5E68',
};
const CHEST_BODY = [
  '.oGGGGGooGGGGGo.',
  '.owwwwoggowwwwo.',
  '.oWWWWoGGoWWWWo.',
  '.owwwwwoowwwwwo.',
  '.owwwwwwwwwwwwo.',
  '.oggggggggggggo.',
  '.oWwwwwwwwwwwWo.',
  '.owwwwwwwwwwwwo.',
  '..oooooooooooo..',
];
export const CHEST = {
  closed: url(fromRows([
    '..oooooooooooo..',
    '.oWWWWWWWWWWWWo.',
    '.oWwwwwwwwwwwWo.',
    '.owwwwwwwwwwwwo.',
    '.oggggggggggggo.',
    ...CHEST_BODY,
  ]), WOOD_P),
  open: url(fromRows([
    '..oooooooooooo..',
    '.oWWWWWWWWWWWWo.',
    '.oggggggggggggo.',
    '.oooooooooooooo.',
    '.okkyyyyyyyykko.',
    ...CHEST_BODY,
  ]), WOOD_P),
};

export const SIGNPOST = url(fromRows([
  '................',
  '.oooooooooooooo.',
  '.oaaaaaaaaaaaao.',
  '.oattattatttaao.',
  '.oaaaaaaaaaaaao.',
  '.oAAAAAAAAAAAAo.',
  '.oooooooooooooo.',
  '......owwo......',
  '......owWo......',
  '......owwo......',
  '......owWo......',
  '......owwo......',
  '......owwo......',
  '.....oowwoo.....',
  '.....oooooo.....',
]), { ...WOOD_P, A: '#B8834F' });

/* ── Nature ────────────────────────────────────────────────────────── */

const LEAF_P = { o: '#1E3A24', g: '#4F9A4A', G: '#3B7A3E', l: '#7CC265', w: '#7A4A28', W: '#5C3317' };

function inCircle(x, y, cx, cy, r) {
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}

function makeTree(seed) {
  const g = blank(24, 30);
  rect(g, 10, 20, 4, 9, 'w');
  rect(g, 12, 20, 2, 9, 'W');
  paint(g, (x, y) => {
    const leaf =
      inCircle(x, y, 12, 10, 9) || inCircle(x, y, 6.5, 14, 5.5) || inCircle(x, y, 17.5, 14, 5.5);
    if (!leaf || y > 21) return null;
    const shade = x + y * 1.2 > 26 + hash(x, y, seed) * 6;
    if (!shade && hash(x, y, seed + 3) > 0.86) return 'l';
    return shade ? 'G' : 'g';
  });
  return url(outline(g), LEAF_P);
}
export const TREES = [makeTree(1), makeTree(7), makeTree(13)];

function makeBush() {
  const g = blank(16, 13);
  paint(g, (x, y) => {
    if (!(inCircle(x, y, 5, 7, 4.5) || inCircle(x, y, 10.5, 7, 4.5) || inCircle(x, y, 8, 5, 4.5))) return null;
    if (y > 11) return null;
    if (hash(x, y, 5) > 0.9) return 'f';
    return y > 7 ? 'G' : 'g';
  });
  return url(outline(g), { ...LEAF_P, f: '#F5A3C7' });
}
export const BUSH = makeBush();

export const FLOWERS = [
  { a: '#F5A3C7', b: '#FFE066' },
  { a: '#FFFFFF', b: '#FFE066' },
  { a: '#9EC9FF', b: '#FFFFFF' },
].map(({ a, b }) =>
  url(fromRows([
    '................',
    '..a.............',
    '.aba......a.....',
    '..a......aba....',
    '..g.......a.....',
    '..g.......g.....',
    '..........g.....',
    '................',
  ]), { a, b, g: '#3B7A3E' })
);

/* ── Buildings and landmarks ───────────────────────────────────────── */

const HOUSE_P = {
  o: '#2A1A2E', r: '#1F5E68', R: '#174750', l: '#2E8A96', // teal roof
  w: '#D4A373', W: '#B8834F', // tan walls
  d: '#6B4226', D: '#4A2C1A', k: '#F0C040', // door + knob
  g: '#A8D8F0', G: '#E8F6FF', f: '#5C3317', // window
  c: '#8A8FA3', C: '#6E7388', // chimney stone
  m: '#E0546A', n: '#7CD98A', // flower box
};

export const COTTAGE = (() => {
  const g = blank(64, 56);
  rect(g, 44, 0, 7, 12, 'c');
  paint(g, (x, y) => (x >= 44 && x < 51 && y < 12 && (y % 3 === 2 || (x + (y % 6 < 3 ? 0 : 2)) % 4 === 0) ? 'C' : null));
  for (let y = 6; y < 29; y++) {
    const inset = Math.round(12 - ((y - 6) * 12) / 22);
    for (let x = inset; x < 64 - inset; x++) {
      const row = y - 6;
      if (row % 4 === 3) g[y][x] = 'R';
      else if ((x + (Math.floor(row / 4) % 2) * 3) % 6 === 0) g[y][x] = 'R';
      else g[y][x] = row < 2 ? 'l' : 'r';
    }
  }
  rect(g, 4, 29, 56, 27, 'w');
  paint(g, (x, y) => (y >= 29 && x >= 4 && x < 60 && (y - 29) % 5 === 4 ? 'W' : null));
  // window with a flower box
  rect(g, 11, 35, 14, 11, 'f');
  rect(g, 12, 36, 12, 9, 'g');
  rect(g, 12, 36, 5, 4, 'G');
  rect(g, 17, 36, 1, 9, 'f');
  rect(g, 12, 40, 12, 1, 'f');
  rect(g, 10, 46, 16, 3, 'D');
  [11, 14, 18, 22].forEach((x) => { g[45][x] = 'n'; g[44][x + 1] = 'm'; });
  // door
  rect(g, 36, 36, 12, 20, 'd');
  rect(g, 37, 37, 10, 1, 'D');
  paint(g, (x, y) => (x >= 36 && x < 48 && y >= 36 && (x - 36) % 4 === 3 ? 'D' : null));
  g[46][45] = 'k';
  return url(outline(g), HOUSE_P);
})();

const BOARD_P = {
  o: '#2A1A2E', w: '#9B5E2E', W: '#7A4A28', r: '#1F5E68', R: '#174750',
  p: '#F2E4C4', P: '#D4B878', m: '#E0546A', t: '#5C3317',
};
export const QUEST_BOARD = (() => {
  const g = blank(32, 30);
  rect(g, 0, 0, 32, 4, 'r');
  rect(g, 0, 3, 32, 1, 'R');
  rect(g, 3, 4, 3, 26, 'W');
  rect(g, 26, 4, 3, 26, 'W');
  rect(g, 2, 6, 28, 15, 'w');
  paint(g, (x, y) => (y >= 6 && y < 21 && x >= 2 && x < 30 && (y - 6) % 4 === 3 ? 'W' : null));
  [[4, 8, 7, 8], [13, 7, 6, 6], [21, 9, 7, 8], [13, 14, 6, 5]].forEach(([x, y, w, h], i) => {
    rect(g, x, y, w, h, 'p');
    for (let ly = y + 2; ly < y + h - 1; ly += 2) rect(g, x + 1, ly, w - 2, 1, 'P');
    g[y][x + Math.floor(w / 2)] = i % 2 ? 'm' : 't';
  });
  return url(outline(g), BOARD_P);
})();

const ARCADE_P = {
  o: '#1A1028', b: '#35285F', B: '#241A45', k: '#0C0819', y: '#F0C040', r: '#E0546A',
  g: '#7CD98A', c: '#5FC8E8', w: '#EDE6FF', t: '#1F5E68', T: '#2E8A96',
};
function makeCabinet(body, bodyDark, screen) {
  const g = blank(16, 30);
  rect(g, 1, 0, 14, 30, body);
  rect(g, 11, 0, 4, 30, bodyDark);
  rect(g, 2, 1, 12, 5, 'y');
  paint(g, (x, y) => (y >= 2 && y <= 4 && x >= 3 && x <= 12 && (x + y) % 3 === 0 ? 'r' : null));
  rect(g, 2, 8, 12, 10, 'k');
  screen(g);
  rect(g, 1, 19, 14, 4, 'B');
  g[20][4] = 'r'; g[20][6] = 'g'; g[21][10] = 'c'; g[20][11] = 'y';
  rect(g, 4, 26, 8, 2, 'k');
  return url(outline(g), ARCADE_P);
}
export const CABINET_CHURN = makeCabinet('t', 'T', (g) => {
  // a little bar chart
  [[3, 4], [5, 6], [7, 3], [9, 7], [11, 5]].forEach(([x, h]) => rect(g, x, 17 - h, 1, h, x === 9 ? 'r' : 'g'));
});
export const CABINET_CHESS = makeCabinet('b', 'B', (g) => {
  paint(g, (x, y) => (x >= 3 && x <= 12 && y >= 9 && y <= 16 && (x + y) % 2 === 0 ? 'w' : null));
  g[12][6] = 'r'; g[13][6] = 'r'; g[11][9] = 'c'; g[12][9] = 'c';
});

const PORTAL_P = {
  o: '#1A1028', s: '#9A96AE', S: '#6E6A86', m: '#7CC265',
  v: '#8B6FE8', V: '#5B3FB8', l: '#C9B8FF', k: '#2C1F5A',
};
function makePortal(phase) {
  const g = blank(32, 40);
  const cx = 16;
  const cy = 16;
  paint(g, (x, y) => {
    const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
    const inArch = y < cy ? d <= 15 : x >= 1 && x <= 30;
    const inHole = y < cy ? d <= 9 : x >= 7 && x <= 24;
    if (!inArch || y > 39) return null;
    if (inHole) {
      const a = Math.atan2(y - cy, x - cx) + d * 0.35 + phase;
      const band = Math.sin(a * 3);
      if (band > 0.65) return 'l';
      if (band > 0) return 'v';
      return d < 4 ? 'k' : 'V';
    }
    const brick = (Math.floor(y / 4) + Math.floor((x + (Math.floor(y / 4) % 2) * 2) / 4)) % 2;
    if (y % 4 === 3) return 'S';
    if (hash(x, y, 9) > 0.93 && y > 24) return 'm';
    return brick ? 's' : 'S';
  });
  return url(outline(g), PORTAL_P);
}
export const PORTAL = [makePortal(0), makePortal(Math.PI / 3), makePortal((2 * Math.PI) / 3)];

const LECTERN_P = {
  o: '#2A1A2E', w: '#9B5E2E', W: '#7A4A28', p: '#FFF8E7', P: '#D4C8B0',
  r: '#E0546A', q: '#EDE6FF',
};
export const LECTERN = url(fromRows([
  '............q...',
  '...........qq...',
  '..........qq....',
  '.oooooooooqooo..',
  'oppppppopppppppo',
  'opPPpppoppPPpppo',
  'oppppppoppppPPpo',
  'opPPPppoppppppro',
  'oooooooooooooooo',
  '.oWWWWWWWWWWWWo.',
  '......owwo......',
  '......owWo......',
  '......owwo......',
  '......owWo......',
  '......owwo......',
  '....oowwwwoo....',
  '...owwwwwwwwo...',
  '...oooooooooo...',
]), LECTERN_P);

const FIRE_P = {
  o: '#2A1A2E', w: '#7A4A28', W: '#5C3317', s: '#8A8FA3', S: '#6E7388',
  r: '#E0546A', y: '#F0C040', Y: '#FFF3B0', f: '#FF8A3D',
};
function makeFire(sway) {
  const g = blank(16, 17);
  paint(g, (x, y) => {
    if (y > 11) return null;
    const cx = 7.5 + Math.sin(y * 0.9 + sway) * (1.2 - y / 12);
    const half = Math.max(0, (y - 1) * 0.42);
    const d = Math.abs(x - cx);
    if (d > half) return null;
    if (d < half * 0.35 && y > 6) return 'Y';
    if (d < half * 0.65) return 'y';
    return y < 5 ? 'r' : 'f';
  });
  rect(g, 2, 12, 12, 2, 'w');
  rect(g, 4, 14, 8, 1, 'W');
  paint(g, (x, y) => (y === 12 && (x === 4 || x === 11) ? 'W' : null));
  [1, 14].forEach((x) => { g[13][x] = 's'; g[14][x] = 'S'; });
  [3, 12].forEach((x) => { g[15][x] = 's'; });
  return url(outline(g), FIRE_P);
}
export const CAMPFIRE = [makeFire(0), makeFire(2.1), makeFire(4.2)];

/* ── Ground tiles, used as repeating backgrounds ───────────────────── */

function tile(specks, seed) {
  const g = blank(16, 16, 'a');
  paint(g, (x, y) => {
    const n = hash(x, y, seed);
    for (const [key, p] of specks) if (n > p) return key;
    return null;
  });
  return g;
}

export const TILES = {
  grass: url(tile([['c', 0.96], ['b', 0.86]], 2), { a: '#6DAA45', b: '#5E9A3C', c: '#8CC45E' }),
  path: url(tile([['c', 0.95], ['b', 0.84]], 4), { a: '#D9B47C', b: '#C79E63', c: '#EBCB97' }),
  water: [0, 1].map((f) =>
    url(paint(blank(16, 16, 'a'), (x, y) => ((y + f * 2) % 8 === 0 && (x + y * 3 + f * 5) % 7 < 3 ? 'b' : ((y + f * 2) % 8 === 4 && (x + 2) % 9 < 2 ? 'c' : null))), {
      a: '#3E86C6', b: '#7FB8E6', c: '#5B9ED6',
    })
  ),
};

/* ── Inventory icons, 12×12 ────────────────────────────────────────── */

const ICON_P = {
  o: '#2A1A2E', r: '#E0546A', R: '#B83A50', w: '#FFFFFF',
  c: '#5FC8E8', C: '#3A9AC0', l: '#C8F0FF',
  g: '#7CD98A', G: '#4F9A4A', b: '#9B5E2E',
  m: '#F2E4C4', M: '#D4B878', k: '#6B4226', s: '#EDE6FF',
  y: '#F0C040', Y: '#C8960C',
};
export const INVENTORY_ICONS = {
  'icon-curiosity': url(fromRows([
    '............',
    '.oo....oo...',
    'orro..orro..',
    'orwrrorrrro.',
    'orrrrrrrrro.',
    'orrrrrrrRro.',
    '.orrrrrrRo..',
    '..orrrrRo...',
    '...orrRo....',
    '....oRo.....',
    '.....o......',
    '............',
  ]), ICON_P),
  'icon-creativity': url(fromRows([
    '............',
    '...oooooo...',
    '..olccccCo..',
    '.olcccccCCo.',
    'oooooooooooo',
    '.oclcccccCo.',
    '..olcccCCo..',
    '...occcCo...',
    '....ocCo....',
    '.....oo.....',
    '............',
    '............',
  ]), ICON_P),
  'icon-persistence': url(fromRows([
    '............',
    '..oo...oo...',
    '.oggo.oGGo..',
    '.ogggoGGGo..',
    '..oggoGGo...',
    '...ooGoo....',
    '.....Go.....',
    '....oGo.....',
    '..oobbboo...',
    '.obbbbbbbo..',
    '..obbbbbo...',
    '...ooooo....',
  ]), ICON_P),
  'icon-coffee': url(fromRows([
    '...s..s.....',
    '....s..s....',
    '...s..s.....',
    '.oooooooo...',
    '.ommmmmmoo..',
    '.okkkkkkoMo.',
    '.ommmmmmo.o.',
    '.ommmmmmoMo.',
    '.oMmmmmmoo..',
    '..oMMMMo....',
    '.oooooooo...',
    '............',
  ]), ICON_P),
  'icon-problem-solving': url(fromRows([
    '............',
    '..oooo......',
    '.oyyyyo.....',
    'oyyooyyo....',
    'oyo..oyo....',
    'oyyooyyooooo',
    '.oyyyyyyyyyo',
    '..ooooooYoYo',
    '........oooo',
    '............',
    '............',
    '............',
  ]), ICON_P),
};
