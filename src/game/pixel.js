/*
 * Tiny pixel-art toolkit. A sprite is a grid of palette keys ('.' is
 * transparent), drawn either by hand as strings or procedurally, then turned
 * into an SVG data URL once and reused everywhere.
 */

export function blank(w, h, fill = '.') {
  return Array.from({ length: h }, () => Array(w).fill(fill));
}

/** Hand-drawn rows, e.g. ['..oo..', '.o##o.']. */
export function fromRows(rows) {
  return rows.map((row) => row.split(''));
}

/** Fill every pixel where fn(x, y) returns a key (or leave it if it returns null). */
export function paint(grid, fn) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const key = fn(x, y, grid[y][x]);
      if (key) grid[y][x] = key;
    }
  }
  return grid;
}

export function rect(grid, x0, y0, w, h, key) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (grid[y] && x >= 0 && x < grid[y].length) grid[y][x] = key;
    }
  }
  return grid;
}

/** Draws a 1px outline in `key` around every opaque pixel. */
export function outline(grid, key = 'o') {
  const h = grid.length;
  const w = grid[0].length;
  const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && grid[y][x] !== '.' && grid[y][x] !== '*';
  const out = grid.map((row) => row.slice());
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (grid[y][x] !== '.') continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) out[y][x] = '*';
    }
  }
  return out.map((row) => row.map((k) => (k === '*' ? key : k)));
}

export function mirror(grid) {
  return grid.map((row) => row.slice().reverse());
}

/** Deterministic noise so procedural sprites look the same on every load. */
export function hash(x, y, seed = 1) {
  let n = x * 374761393 + y * 668265263 + seed * 2147483647;
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
}

/** Grid + palette → SVG data URL, merging horizontal runs to keep it small. */
export function toDataUrl(grid, palette) {
  const h = grid.length;
  const w = grid[0].length;
  let body = '';
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const key = grid[y][x];
      let run = 1;
      while (x + run < w && grid[y][x + run] === key) run++;
      const fill = palette[key];
      if (key !== '.' && fill) body += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${fill}"/>`;
      x += run;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges">${body}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
