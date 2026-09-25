import { TILE, ROWS, buildLevel } from './level.js';

/* A small canvas platformer. Physics runs on a fixed 120 Hz step so jumps
   feel identical at any frame rate; drawing happens once per animation frame.
   The engine talks to React only through the callbacks passed in. */

const STEP = 1 / 120;

// feel — tuned to be close to classic platformers
const RUN = 250;
const ACCEL_GROUND = 2000;
const ACCEL_AIR = 1300;
const FRICTION = 2400;
const GRAVITY = 2200;
const FALL_MULT = 1.55; // fall faster than you rise
const JUMP_V = 760;
const JUMP_CUT = 340; // releasing jump early caps upward speed here
const MAX_FALL = 900;
const COYOTE = 0.1;
const BUFFER = 0.13;

const CHEER = 0.9; // seconds she celebrates after opening a block
const BIG_NEWS = ['work', 'award', 'education']; // these also get the 'Level Up!' banner
const SIT = { work: 72, education: 70 }; // she sits down to code / read first
const SIT_TIME = 1.0;
const GLYPHS = ['</>', '{ }', '✓', '01', '=>'];

const W = 26; // hitbox
const H = 62;

const sprite = (n) => (typeof n === 'string' ? `/sprites/${n}` : `/sprites/sprite_${String(n).padStart(3, '0')}.png`);
const HEIGHTS = { 2: 68, 29: 65, 30: 66, 31: 65, 44: 62, 70: 56, 72: 58 };
const WALK = [29, 30, 31, 30];

const SPRITES = [
  2, 29, 30, 31, 44, 80, 85, 114, 99, 104, 108, 14, 100, 120, 116, 97, 135, 113, 125, 130, 134,
  121, 122, 128, 133, 131, 'bg_mountains.png', 'castle.png',
  61, 12, 23, 52, 91, 70, 72, 33, // reactions: '!', stars, trophy, 'Level Up!', reading, coding, diploma
];

export function loadSprites() {
  const map = new Map();
  return Promise.all(
    SPRITES.map(
      (n) =>
        new Promise((res) => {
          const im = new Image();
          im.onload = im.onerror = () => { map.set(n, im); res(); };
          im.src = sprite(n);
        })
    )
  ).then(() => map);
}

/* ---- tiny sound kit: square-wave blips, no audio files ---- */
function makeSound() {
  let ctx = null;
  let muted = false;
  const tone = (freq, dur, { type = 'square', vol = 0.06, slide = 0, delay = 0 } = {}) => {
    if (muted) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const t = ctx.currentTime + delay;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.linearRampToValueAtTime(freq + slide, t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch { /* audio not available */ }
  };
  return {
    setMuted: (m) => { muted = m; },
    jump: () => tone(380, 0.13, { slide: 360, vol: 0.05 }),
    coin: () => { tone(988, 0.07); tone(1319, 0.16, { delay: 0.07 }); },
    bump: () => tone(140, 0.08, { type: 'triangle', vol: 0.12 }),
    reveal: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.1, { delay: i * 0.06, vol: 0.05 })),
    fall: () => tone(500, 0.4, { slide: -380, type: 'triangle', vol: 0.08 }),
    fanfare: () => [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.12, { delay: i * 0.08, vol: 0.05 })),
    win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.14, { delay: i * 0.11, vol: 0.05 })),
  };
}

export class Engine {
  constructor(canvas, images, cb) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.img = images;
    this.cb = cb; // { onInfo(info, found, total), onCoins(n), onWin(stats) }
    this.sound = makeSound();
    this.keys = { left: false, right: false, jump: false };
    this.running = false;
    this.bottomPad = 0;
    this.reset();
  }

  reset() {
    this.lv = buildLevel();
    const s = this.lv.start;
    this.p = {
      x: s.x, y: s.y - H, vx: 0, vy: 0, face: 1, ground: true,
      coyote: 0, buffer: 0, jumpHeld: false, dist: 0, squash: 0, cp: s.x,
      cheer: 0, pendingCheer: null, sit: 0, sitKind: null, glyphT: 0,
    };
    this.cam = 0;
    this.t = 0;
    this.coins = 0;
    this.found = 0;
    this.falls = 0;
    this.won = false;
    this.winT = 0;
    this.fx = [];
    this.fade = 0;
    this.cb.onCoins?.(0);
  }

  /* ---- input ---- */
  press(k, down) {
    if (k === 'jump' && down && !this.keys.jump) this.p.buffer = BUFFER;
    this.keys[k] = down;
  }

  setMuted(m) { this.sound.setMuted(m); }

  /* ---- sizing ---- */
  resize(w, h, bottomPad) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.dpr = dpr;
    this.vw = w;
    this.vh = h;
    this.bottomPad = bottomPad;
    const levelH = ROWS * TILE;
    // fit the level height, but keep enough columns visible to see what's coming
    // (fewer on portrait phones, so the character isn't tiny)
    const minCols = w < 500 ? 7.5 : 11;
    this.zoom = Math.max(0.55, Math.min((h - bottomPad) / levelH, w / (minCols * TILE), 2.2));
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.acc = 0;
    const loop = (now) => {
      if (!this.running) return;
      this.acc += Math.min((now - this.last) / 1000, 0.1);
      this.last = now;
      while (this.acc >= STEP) {
        this.update(STEP);
        this.acc -= STEP;
      }
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /* ---- map helpers ---- */
  tile(c, r) {
    if (c < 0 || c >= this.lv.COLS) return '#'; // walls at the level edges
    if (r < 0 || r >= ROWS) return '.';
    return this.lv.grid[r][c];
  }
  solid(ch) { return ch === '#' || ch === 'X' || ch === '?' || ch === 'U'; }

  /* ---- simulation ---- */
  update(dt) {
    this.t += dt;
    const p = this.p;
    const k = this.keys;

    this.fx = this.fx.filter((f) => (f.t += dt) < f.life);
    this.lv.blocks.forEach((b) => { if (b.bump > 0) b.bump = Math.max(0, b.bump - dt); });
    if (this.fade > 0) this.fade = Math.max(0, this.fade - dt * 2.5);
    if (p.squash > 0) p.squash = Math.max(0, p.squash - dt);
    if (p.cheer > 0) p.cheer = Math.max(0, p.cheer - dt);
    if (p.sit > 0) {
      p.sit -= dt;
      p.vx = 0;
      p.glyphT -= dt;
      if (p.glyphT <= 0) {
        const code = p.sitKind === 'work';
        this.fx.push({
          kind: 'glyph', text: code ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : '+EXP',
          color: code ? '#8ff0a4' : '#f2c14e', x: p.x + W / 2 + 10 + Math.random() * 14, y: p.y + 14, t: 0, life: 1.1,
        });
        p.glyphT = code ? 0.28 : 0.45;
      }
      if (p.sit <= 0) this.cheerUp(p.sitKind);
    }
    const cheering = p.cheer > 0 || p.sit > 0;

    // after reaching the castle she walks in on her own
    if (this.won) {
      this.winT += dt;
      p.vx = 120;
      k.left = k.right = false;
    }

    // horizontal
    const ax = this.won || cheering ? 0 : (k.right ? 1 : 0) - (k.left ? 1 : 0);
    if (ax) {
      const turning = Math.sign(p.vx) !== ax && p.vx !== 0;
      const a = (p.ground ? ACCEL_GROUND : ACCEL_AIR) * (turning ? 1.6 : 1);
      p.vx += ax * a * dt;
      p.vx = Math.max(-RUN, Math.min(RUN, p.vx));
      p.face = ax;
      if (turning && p.ground && Math.abs(p.vx) > 120 && Math.random() < 0.3) this.dust(p.x + W / 2, p.y + H);
    } else if (!this.won) {
      const f = (p.ground ? FRICTION : 350) * dt;
      p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f;
    }

    // jump: coyote time + input buffer + variable height
    p.coyote = p.ground ? COYOTE : p.coyote - dt;
    p.buffer -= dt;
    if (p.buffer > 0 && p.coyote > 0 && !this.won && !cheering) {
      p.vy = -(JUMP_V + Math.abs(p.vx) * 0.15);
      p.buffer = 0;
      p.coyote = 0;
      p.ground = false;
      p.jumpHeld = true;
      this.sound.jump();
    }
    if (p.jumpHeld && !k.jump) {
      if (p.vy < -JUMP_CUT) p.vy = -JUMP_CUT;
      p.jumpHeld = false;
    }
    p.vy += GRAVITY * (p.vy > 0 ? FALL_MULT : 1) * dt;
    p.vy = Math.min(p.vy, MAX_FALL);

    this.moveX(p.vx * dt);
    const wasGround = p.ground;
    const fallSpeed = p.vy;
    this.moveY(p.vy * dt);
    if (p.ground && !wasGround && fallSpeed > 380) {
      p.squash = 0.1;
      this.dust(p.x + W / 2 - 8, p.y + H);
      this.dust(p.x + W / 2 + 8, p.y + H);
    }
    if (p.ground) p.dist += Math.abs(p.vx * dt);

    // she celebrates as soon as she lands after opening a block
    if (p.ground && p.pendingCheer) this.celebrate(p.pendingCheer);

    // checkpoints
    this.lv.checkpoints.forEach((c) => { if (p.x >= c.x && c.x > p.cp) p.cp = c.x; });

    // coins
    for (const c of this.lv.coins) {
      if (c.taken) continue;
      if (Math.abs(c.x - (p.x + W / 2)) < 26 && Math.abs(c.y - (p.y + H / 2)) < 40) {
        c.taken = true;
        this.coins += 1;
        this.cb.onCoins?.(this.coins);
        this.sound.coin();
        this.fx.push({ kind: 'spark', x: c.x, y: c.y, t: 0, life: 0.35 });
      }
    }

    // fell into a pit
    if (p.y > ROWS * TILE + 120) {
      this.falls += 1;
      this.sound.fall();
      p.x = p.cp - W / 2;
      p.y = 4 * TILE;
      p.vx = p.vy = 0;
      this.fade = 1;
    }

    // goal
    if (!this.won && p.x > this.lv.goal.x) {
      this.won = true;
      this.sound.win();
      setTimeout(() => this.cb.onWin?.({ coins: this.coins, totalCoins: this.lv.coins.length, found: this.found, total: this.lv.blocks.length, falls: this.falls }), 1300);
    }

    // camera: lead a little in the facing direction, ease toward it
    const viewW = this.vw / this.zoom;
    const target = p.x + W / 2 - viewW * 0.42 + p.face * 40;
    this.cam += (target - this.cam) * Math.min(1, dt * 5);
    this.cam = Math.max(0, Math.min(this.lv.COLS * TILE - viewW, this.cam));
  }

  moveX(dx) {
    const p = this.p;
    p.x += dx;
    const r0 = Math.floor(p.y / TILE);
    const r1 = Math.floor((p.y + H - 1) / TILE);
    if (dx > 0) {
      const c = Math.floor((p.x + W) / TILE);
      for (let r = r0; r <= r1; r++) if (this.solid(this.tile(c, r))) { p.x = c * TILE - W; p.vx = 0; break; }
    } else if (dx < 0) {
      const c = Math.floor(p.x / TILE);
      for (let r = r0; r <= r1; r++) if (this.solid(this.tile(c, r))) { p.x = (c + 1) * TILE; p.vx = 0; break; }
    }
  }

  moveY(dy) {
    const p = this.p;
    const prevBottom = p.y + H;
    p.y += dy;
    p.ground = false;
    const c0 = Math.floor(p.x / TILE);
    const c1 = Math.floor((p.x + W - 1) / TILE);
    if (dy > 0) {
      const r = Math.floor((p.y + H) / TILE);
      for (let c = c0; c <= c1; c++) {
        const ch = this.tile(c, r);
        const oneWay = ch === '=' && prevBottom <= r * TILE + 0.5;
        if (this.solid(ch) || oneWay) {
          p.y = r * TILE - H;
          p.vy = 0;
          p.ground = true;
          return;
        }
      }
    } else if (dy < 0) {
      const r = Math.floor(p.y / TILE);
      // head bump: pick the block most under her head
      let hit = -1;
      let best = Infinity;
      for (let c = c0; c <= c1; c++) {
        if (this.solid(this.tile(c, r))) {
          const d = Math.abs((c + 0.5) * TILE - (p.x + W / 2));
          if (d < best) { best = d; hit = c; }
        }
      }
      if (hit >= 0) {
        p.y = (r + 1) * TILE;
        p.vy = 40;
        this.headBump(hit, r);
      }
    }
  }

  headBump(c, r) {
    const b = this.lv.blocks.find((bl) => bl.col === c && bl.row === r);
    if (!b || b.used) { this.sound.bump(); return; }
    b.used = true;
    b.bump = 0.2;
    this.lv.grid[r][c] = 'U';
    this.found += 1;
    this.coins += 1;
    this.cb.onCoins?.(this.coins);
    this.sound.reveal();
    this.fx.push({ kind: 'popcoin', x: (c + 0.5) * TILE, y: r * TILE, t: 0, life: 0.6 });
    this.p.pendingCheer = b.info.kind;
    this.cb.onInfo?.(b.info, this.found, this.lv.blocks.length);
  }

  /* a happy hop, a '!' over her head and a burst of stars; big news adds 'Level Up!' */
  celebrate(kind) {
    const p = this.p;
    p.pendingCheer = null;
    if (SIT[kind]) {
      // sit down to code / read for a moment, then cheer
      p.sit = SIT_TIME;
      p.sitKind = kind;
      p.glyphT = 0.15;
      p.vx = 0;
      this.fx.push({ kind: 'emote', n: 61, t: 0, life: 0.7 });
      return;
    }
    this.cheerUp(kind);
  }

  cheerUp(kind) {
    const p = this.p;
    p.sit = 0;
    p.cheer = CHEER;
    p.vx = 0;
    p.vy = -360;
    p.ground = false;
    const big = BIG_NEWS.includes(kind);
    if (big) this.sound.fanfare();
    const cx = p.x + W / 2;
    const top = p.y;
    this.fx.push({ kind: 'emote', n: kind === 'award' ? 52 : 61, t: 0, life: CHEER + 0.3 });
    if (big) this.fx.push({ kind: 'banner', x: cx, y: top - 40, t: 0, life: 1.6 });
    if (kind === 'education') this.fx.push({ kind: 'popitem', n: 33, x: cx + 22, y: top + 10, t: 0, life: 1.1 });
    for (let i = 0; i < (big ? 12 : 7); i++) {
      const a = -Math.PI / 2 + (i / (big ? 11 : 6) - 0.5) * Math.PI * 1.1;
      const sp = 170 + Math.random() * 120;
      this.fx.push({
        kind: 'star', n: i % 2 ? 12 : 23, x: cx, y: top + 16,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, spin: (Math.random() - 0.5) * 8, t: 0, life: 0.9,
      });
    }
  }

  dust(x, y) {
    this.fx.push({ kind: 'dust', x, y, t: 0, life: 0.35, vx: (Math.random() - 0.5) * 40 });
  }

  /* ---- drawing ---- */
  draw() {
    const { ctx, img, zoom } = this;
    const vw = this.vw;
    const vh = this.vh;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    // sky
    const g = ctx.createLinearGradient(0, 0, 0, vh);
    g.addColorStop(0, '#4f9be0');
    g.addColorStop(0.6, '#8cc8f2');
    g.addColorStop(1, '#c9e8f7');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, vw, vh);

    // world is anchored to the bottom of the play area
    const levelH = ROWS * TILE;
    const oy = vh - this.bottomPad - levelH * zoom;
    const cam = this.cam;

    const put = (im, x, y, h) => {
      if (!im || !im.naturalWidth) return;
      const w = (im.naturalWidth / im.naturalHeight) * h;
      ctx.drawImage(im, x, y, w, h);
      return w;
    };

    // sun + parallax clouds
    put(img.get(131), vw - 170, 64, 44);
    const clouds = [121, 133, 128, 122];
    for (let i = 0; i < 9; i++) {
      const span = vw + 300;
      const x = ((i * 380 - cam * zoom * 0.15 + this.t * 8) % span + span) % span - 150;
      put(img.get(clouds[i % 4]), x, 30 + (i % 3) * 38, 36 + (i % 2) * 18);
    }

    // mountains (parallax 0.3)
    const mt = img.get('bg_mountains.png');
    if (mt?.naturalWidth) {
      const mh = 200 * zoom;
      const mw = (mt.naturalWidth / mt.naturalHeight) * mh;
      const off = -((cam * zoom * 0.3) % mw);
      for (let x = off - mw; x < vw + mw; x += mw) ctx.drawImage(mt, x, oy + (GROUND_TOP() - 150) * zoom, mw, mh);
    }

    ctx.save();
    ctx.translate(-cam * zoom, oy);
    ctx.scale(zoom, zoom);

    const viewW = vw / zoom;
    const c0 = Math.max(0, Math.floor(cam / TILE) - 1);
    const c1 = Math.min(this.lv.COLS - 1, Math.ceil((cam + viewW) / TILE) + 1);
    const inView = (col) => col >= c0 - 4 && col <= c1 + 4;

    // back-layer trees, then scenery
    for (const d of this.lv.decor) {
      if (!inView(d.col) || d.layer !== 'back') continue;
      const im = img.get(d.n);
      const w = (im.naturalWidth / im.naturalHeight) * d.h;
      put(im, d.col * TILE + TILE / 2 - w / 2, GROUND_TOP() - d.h + 6, d.h);
    }
    // castle at the goal
    const castle = img.get('castle.png');
    if (castle?.naturalWidth) put(castle, this.lv.goal.col * TILE - 20, GROUND_TOP() - 250 + 8, 250);
    // cat waiting by the castle
    put(img.get(this.won ? 85 : 80), (this.lv.goal.col - 3) * TILE, GROUND_TOP() - 48, 48);

    for (const d of this.lv.decor) {
      if (!inView(d.col) || d.layer === 'back') continue;
      const im = img.get(d.n);
      const w = (im.naturalWidth / im.naturalHeight) * d.h;
      put(im, d.col * TILE + TILE / 2 - w / 2, GROUND_TOP() - d.h + 4, d.h);
      if (d.label) this.drawLabel(d.label, d.col * TILE + TILE / 2, GROUND_TOP() - d.h - 10);
    }

    // tiles
    for (let r = 0; r < ROWS; r++) {
      for (let c = c0; c <= c1; c++) {
        const ch = this.lv.grid[r][c];
        const x = c * TILE;
        const y = r * TILE;
        if (ch === '#') {
          const top = this.tile(c, r - 1) !== '#';
          ctx.drawImage(img.get(top ? 114 : 99), x, y, TILE + 0.5, TILE + 0.5);
        } else if (ch === '=') {
          ctx.drawImage(img.get(104), x, y, TILE + 0.5, TILE * 0.62);
        } else if (ch === 'X') {
          ctx.drawImage(img.get(108), x, y, TILE, TILE);
        } else if (ch === '?' || ch === 'U') {
          const b = this.lv.blocks.find((bl) => bl.col === c && bl.row === r);
          const lift = b && b.bump > 0 ? Math.sin((b.bump / 0.2) * Math.PI) * 10 : 0;
          this.drawBlock(x, y - lift, ch === 'U');
        }
      }
    }

    // coins spin by squashing horizontally
    const coin = img.get(14);
    for (const c of this.lv.coins) {
      if (c.taken || !inView(Math.floor(c.x / TILE))) continue;
      const s = Math.abs(Math.cos(this.t * 4 + c.x * 0.02));
      const w = 26 * Math.max(0.15, s);
      ctx.drawImage(coin, c.x - w / 2, c.y - 14 + Math.sin(this.t * 3 + c.x) * 2, w, 28);
    }

    // effects
    for (const f of this.fx) {
      const k = f.t / f.life;
      if (f.kind === 'dust') {
        ctx.fillStyle = `rgba(222, 200, 160, ${1 - k})`;
        const s = 6 + k * 6;
        ctx.fillRect(f.x + f.vx * f.t - s / 2, f.y - k * 14 - s / 2, s, s);
      } else if (f.kind === 'spark') {
        ctx.strokeStyle = `rgba(255, 230, 120, ${1 - k})`;
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2 + Math.PI / 4;
          const r0 = 6 + k * 14;
          ctx.beginPath();
          ctx.moveTo(f.x + Math.cos(a) * r0, f.y + Math.sin(a) * r0);
          ctx.lineTo(f.x + Math.cos(a) * (r0 + 6), f.y + Math.sin(a) * (r0 + 6));
          ctx.stroke();
        }
      } else if (f.kind === 'glyph') {
        ctx.globalAlpha = k < 0.15 ? k / 0.15 : 1 - Math.max(0, k - 0.5) / 0.5;
        ctx.font = "11px 'Press Start 2P', monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000';
        ctx.fillText(f.text, f.x + k * 12 + 1, f.y - k * 50 + 1);
        ctx.fillStyle = f.color;
        ctx.fillText(f.text, f.x + k * 12, f.y - k * 50);
        ctx.globalAlpha = 1;
      } else if (f.kind === 'popitem') {
        const im = img.get(f.n);
        const h = 26 * (k < 0.2 ? 0.6 + k * 3 : 1.2 - Math.min(0.2, (k - 0.2)));
        const w = (im.naturalWidth / im.naturalHeight) * h;
        ctx.globalAlpha = 1 - Math.max(0, k - 0.7) / 0.3;
        ctx.drawImage(im, f.x - w / 2, f.y - k * 46 - h, w, h);
        ctx.globalAlpha = 1;
      } else if (f.kind === 'star') {
        const im = img.get(f.n);
        const x = f.x + f.vx * f.t;
        const y = f.y + f.vy * f.t + 520 * f.t * f.t;
        const s = 18 * (1 - k * 0.4);
        ctx.save();
        ctx.globalAlpha = 1 - Math.max(0, k - 0.6) / 0.4;
        ctx.translate(x, y);
        ctx.rotate(f.spin * f.t);
        ctx.drawImage(im, -s / 2, -s / 2, s, s);
        ctx.restore();
      } else if (f.kind === 'banner') {
        const im = img.get(91);
        const h = 34;
        const w = (im.naturalWidth / im.naturalHeight) * h;
        const pop = Math.min(1, f.t / 0.18);
        ctx.save();
        ctx.globalAlpha = 1 - Math.max(0, k - 0.7) / 0.3;
        ctx.translate(f.x, f.y - k * 40);
        ctx.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop);
        ctx.drawImage(im, -w / 2, -h / 2, w, h);
        ctx.restore();
      } else if (f.kind === 'popcoin') {
        const y = f.y - 20 - Math.sin(k * Math.PI) * 50;
        ctx.globalAlpha = 1 - Math.max(0, k - 0.7) / 0.3;
        ctx.drawImage(coin, f.x - 13, y - 14, 26, 28);
        ctx.globalAlpha = 1;
      }
    }

    this.drawPlayer();
    for (const f of this.fx) {
      if (f.kind !== 'emote') continue;
      const im = img.get(f.n);
      const k = f.t / f.life;
      const pop = f.t < 0.15 ? 0.5 + (f.t / 0.15) * 0.7 : f.t < 0.25 ? 1.2 - ((f.t - 0.15) / 0.1) * 0.2 : 1;
      const h = 30 * pop;
      const w = (im.naturalWidth / im.naturalHeight) * h;
      ctx.globalAlpha = 1 - Math.max(0, k - 0.75) / 0.25;
      ctx.drawImage(im, this.p.x + W / 2 - w / 2, this.p.y - h - 8, w, h);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // below the level (touch-control area on phones)
    if (this.bottomPad > 0) {
      ctx.fillStyle = '#3a2618';
      ctx.fillRect(0, vh - this.bottomPad, vw, this.bottomPad);
    }
    if (this.fade > 0) {
      ctx.fillStyle = `rgba(10, 12, 30, ${this.fade})`;
      ctx.fillRect(0, 0, vw, vh);
    }
  }

  drawLabel(text, cx, y) {
    const ctx = this.ctx;
    ctx.font = "12px 'Press Start 2P', monospace";
    const w = ctx.measureText(text).width + 14;
    ctx.fillStyle = 'rgba(12, 14, 34, 0.85)';
    ctx.fillRect(cx - w / 2, y - 12, w, 22);
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - w / 2 + 1, y - 11, w - 2, 20);
    ctx.fillStyle = '#f2c14e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, y + 0.5);
  }

  drawBlock(x, y, used) {
    const ctx = this.ctx;
    const s = TILE;
    ctx.fillStyle = used ? '#7a5a3a' : '#f2c14e';
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = used ? '#5e4329' : '#c98a1c';
    ctx.fillRect(x, y + s - 6, s, 6);
    ctx.fillRect(x + s - 6, y, 6, s);
    ctx.fillStyle = used ? '#9a7652' : '#ffe39a';
    ctx.fillRect(x, y, s, 5);
    ctx.fillRect(x, y, 5, s);
    ctx.strokeStyle = '#3a2410';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 1.5, y + 1.5, s - 3, s - 3);
    // rivets
    ctx.fillStyle = used ? '#4a3420' : '#8a5a17';
    [[8, 8], [s - 12, 8], [8, s - 12], [s - 12, s - 12]].forEach(([dx, dy]) => ctx.fillRect(x + dx, y + dy, 4, 4));
    if (!used) {
      const bob = Math.sin(this.t * 4) > 0 ? 0 : 1;
      ctx.fillStyle = '#6b3d0a';
      ctx.font = "bold 26px 'Press Start 2P', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', x + s / 2 + 2, y + s / 2 + 3 + bob);
      ctx.fillStyle = '#fff6dc';
      ctx.fillText('?', x + s / 2, y + s / 2 + 1 + bob);
    }
  }

  drawPlayer() {
    const { ctx, p, img } = this;
    let n = 2;
    if (p.sit > 0) n = SIT[p.sitKind];
    else if (!p.ground) n = 44;
    else if (Math.abs(p.vx) > 15) n = WALK[Math.floor(p.dist / 15) % WALK.length];
    const im = img.get(n);
    if (!im?.naturalWidth) return;
    const h = HEIGHTS[n];
    const w = (im.naturalWidth / im.naturalHeight) * h;
    const sq = p.squash > 0 ? 1 - (p.squash / 0.1) * 0.12 : 1;
    const cx = p.x + W / 2;
    const by = p.y + H + 3;
    ctx.save();
    ctx.translate(cx, by);
    ctx.scale(p.face * (2 - sq), sq);
    // hide her as she walks into the castle
    if (this.won) ctx.globalAlpha = Math.max(0, 1 - Math.max(0, this.winT - 0.6) * 2);
    ctx.drawImage(im, -w / 2, -h, w, h);
    ctx.restore();
  }
}

function GROUND_TOP() {
  return 9 * TILE;
}
