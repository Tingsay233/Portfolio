import { EXPERIENCE, PROJECTS, SKILLS, TOOLS } from '../data.js';

/* Level 1 is a walk through the career timeline: every experience entry and
   every project is a ? block, laid out in date order, with a year signpost
   whenever the year changes. The map is a grid of TILE cells, ROWS tall.
     #  ground      =  one-way platform      X  crate      ?  info block      */

export const TILE = 48;
export const ROWS = 11;
const GROUND_ROW = 9;

const clip = (text, max = 150) => {
  if (!text || text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(' ', max))}…`;
};

const fromExperience = (e) => ({
  kind: e.type, // work | award | education
  icon: e.icon,
  title: e.title,
  meta: e.org,
  when: e.when,
  text: clip(e.desc),
  start: e.start,
});

const fromProject = (p) => ({
  kind: 'project',
  icon: p.icon,
  title: p.title,
  meta: p.meta,
  when: p.badge || '',
  text: clip(p.impact),
  start: p.start,
});

const skillsBlock = {
  kind: 'skills',
  icon: 48,
  title: 'Skills unlocked',
  meta: SKILLS.filter((s) => s.tier === 'Main').map((s) => s.name).join(' · '),
  when: '',
  text: `Also: ${SKILLS.filter((s) => s.tier !== 'Main').map((s) => s.name).join(', ')}. Tools: ${TOOLS.slice(0, 6).join(', ')}.`,
};

/* Everything in date order; the skills block rides along right after the degree starts. */
const timeline = [...EXPERIENCE.map(fromExperience), ...PROJECTS.map(fromProject)]
  .filter((i) => i.start)
  .sort((a, b) => a.start.localeCompare(b.start));
timeline.splice(1, 0, { ...skillsBlock, start: timeline[0]?.start });

export const INFO = timeline;

export function buildLevel() {
  const COLS = 12 + timeline.length * 13 + 18;
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill('.'));
  const coins = [];
  const decor = [];
  const checkpoints = [];
  const blocks = [];

  const set = (c, r, ch) => { if (grid[r] && c >= 0 && c < COLS) grid[r][c] = ch; };
  const ground = (c0, c1) => { for (let c = c0; c <= c1; c++) for (let r = GROUND_ROW; r < ROWS; r++) set(c, r, '#'); };
  const platform = (c0, c1, r) => { for (let c = c0; c <= c1; c++) set(c, r, '='); };
  const crate = (c, r) => set(c, r, 'X');
  const coin = (c, r) => coins.push({ x: (c + 0.5) * TILE, y: (r + 0.5) * TILE, taken: false });
  const coinRow = (c0, c1, r) => { for (let c = c0; c <= c1; c++) coin(c, r); };
  const block = (c, r, info) => { set(c, r, '?'); blocks.push({ col: c, row: r, info, used: false, bump: 0 }); };
  const checkpoint = (c, label) => {
    checkpoints.push({ x: c * TILE + TILE / 2 });
    decor.push({ n: 100, col: c, h: 52, label });
  };

  /* four obstacle patterns, cycled so the walk never feels repetitive */
  const patterns = [
    // A: flat run, block overhead
    (c, info) => { ground(c, c + 12); coinRow(c + 2, c + 4, 7); block(c + 8, 6, info); },
    // B: climb onto a platform to reach a higher block
    (c, info) => { ground(c, c + 12); platform(c + 4, c + 7, 7); coinRow(c + 4, c + 7, 6); block(c + 6, 4, info); },
    // C: crate steps, then the block
    (c, info) => {
      ground(c, c + 12);
      crate(c + 3, 8); crate(c + 4, 8); crate(c + 4, 7);
      coinRow(c + 3, c + 5, 5);
      block(c + 9, 6, info);
    },
    // D: hop a small pit (coins arc over it), block on the far side
    (c, info) => {
      ground(c, c + 4); ground(c + 7, c + 12);
      coin(c + 4, 7); coin(c + 5, 6); coin(c + 6, 6); coin(c + 7, 7);
      block(c + 10, 6, info);
    },
  ];

  // start area
  let c = 0;
  ground(0, 11);
  let year = '';
  c = 12;

  timeline.forEach((info, i) => {
    const y = (info.start || '').slice(0, 4);
    if (y && y !== year) { checkpoint(c + 1, y); year = y; }
    patterns[i % patterns.length](c, info);
    c += 13;
  });

  // finish: the castle
  ground(c, COLS - 1);
  checkpoint(c + 1, 'Now');
  const goal = { col: c + 11, x: (c + 10) * TILE };

  // scenery — deterministic so it's the same every visit
  const busy = new Set(checkpoints.map((k) => Math.floor(k.x / TILE)));
  for (let col = 1; col < COLS - 14; col++) {
    if (grid[GROUND_ROW][col] !== '#' || busy.has(col)) continue;
    if (col % 9 === 4) decor.push({ n: [125, 130, 134][col % 3], col, h: 150, layer: 'back' });
    else if (col % 16 === 7) decor.push({ n: 120, col, h: 96 });
    else if (col % 5 === 2) decor.push({ n: [116, 97, 135, 113][col % 4], col, h: 34 });
  }

  return { grid, COLS, coins, decor, checkpoints, blocks, goal, start: { x: 3 * TILE, y: GROUND_ROW * TILE } };
}
