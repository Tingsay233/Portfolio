import { useEffect, useState } from 'react';

/*
 * A pixel-art image that fails quietly. Sprites live in public/sprites and are
 * referenced by name. Until a PNG exists the slot shows `fallbackSrc` (the art
 * drawn in code) or `fallback`, and it swaps to the PNG only once that has
 * actually loaded — so there is never a broken-image flash.
 */

const status = new Map(); // name → 'ok' | 'missing' | Promise

function probe(name) {
  if (!status.has(name)) {
    status.set(
      name,
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => { status.set(name, 'ok'); resolve('ok'); };
        img.onerror = () => { status.set(name, 'missing'); resolve('missing'); };
        img.src = `/sprites/${name}.png`;
      })
    );
  }
  return status.get(name);
}

export function useSpriteSrc(name, fallbackSrc) {
  const [found, setFound] = useState(() => name && status.get(name) === 'ok');

  useEffect(() => {
    if (!name) return undefined;
    let live = true;
    Promise.resolve(probe(name)).then((s) => live && setFound(s === 'ok'));
    return () => { live = false; };
  }, [name]);

  return found ? `/sprites/${name}.png` : fallbackSrc;
}

export default function Sprite({
  name,
  alt = '',
  scale = 2,
  width,
  height,
  fallbackSrc,
  fallback = null,
  className = '',
  style,
}) {
  const src = useSpriteSrc(name, fallbackSrc);

  if (!src) return fallback;

  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : 'true'}
      className={`sprite ${className}`.trim()}
      draggable="false"
      style={{
        imageRendering: 'pixelated',
        width: width ? width * scale : undefined,
        height: height ? height * scale : undefined,
        ...style,
      }}
    />
  );
}
