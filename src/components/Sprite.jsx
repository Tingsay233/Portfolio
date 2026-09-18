import { useState } from 'react';

/*
 * A pixel-art image that fails quietly. Sprites live in public/sprites and are
 * referenced by name; if a file hasn't been added yet the slot renders nothing
 * (or its fallback) rather than a broken-image icon.
 */
export default function Sprite({
  name,
  alt = '',
  scale = 2,
  width,
  height,
  fallback = null,
  className = '',
  style,
}) {
  const [missing, setMissing] = useState(false);

  if (missing) return fallback;

  return (
    <img
      src={`/sprites/${name}.png`}
      alt={alt}
      aria-hidden={alt ? undefined : 'true'}
      className={`sprite ${className}`.trim()}
      onError={() => setMissing(true)}
      style={{
        imageRendering: 'pixelated',
        width: width ? width * scale : undefined,
        height: height ? height * scale : undefined,
        ...style,
      }}
    />
  );
}
