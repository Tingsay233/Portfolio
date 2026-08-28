/*
 * Pixel confetti — a short canvas burst of square "pixels" in the site palette.
 * Imperative on purpose: any component can fire one without holding state.
 */

const COLORS = ['#C8960C', '#F0C040', '#4A7C3F', '#8DC870', '#D4B878', '#7A4A28'];

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function pixelBurst({ x, y, count = 46, spread = 5.5 } = {}) {
  if (typeof window === 'undefined' || prefersReducedMotion()) return;

  const canvas = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '10050',
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = false;

  const originX = x ?? w / 2;
  const originY = y ?? h / 2;

  const bits = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * spread;
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 3 + Math.floor(Math.random() * 4),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
      spin: (Math.random() - 0.5) * 0.3,
      rot: 0,
    };
  });

  let raf;
  function frame() {
    ctx.clearRect(0, 0, w, h);
    let alive = false;

    for (const b of bits) {
      if (b.life <= 0) continue;
      alive = true;

      b.vy += 0.16;          // gravity
      b.vx *= 0.99;          // drag
      b.x += b.vx;
      b.y += b.vy;
      b.rot += b.spin;
      b.life -= b.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, b.life);
      ctx.translate(Math.round(b.x), Math.round(b.y));
      ctx.rotate(b.rot);
      ctx.fillStyle = b.color;
      ctx.fillRect(-b.size / 2, -b.size / 2, b.size, b.size);
      ctx.restore();
    }

    if (alive) {
      raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  }
  raf = requestAnimationFrame(frame);

  // Hard stop so a backgrounded tab can never leave the canvas behind.
  setTimeout(() => {
    cancelAnimationFrame(raf);
    canvas.remove();
  }, 4000);
}
