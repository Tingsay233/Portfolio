const src = (n) => (typeof n === 'string' ? `/sprites/${n}` : `/sprites/sprite_${String(n).padStart(3, '0')}.png`);

/* A sprite image sized by height; decorative unless given alt text. */
export function Sprite({ n, h, alt = '', className = '', style }) {
  return (
    <img
      src={src(n)}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable="false"
      className={`px ${className}`}
      style={{ height: h, ...style }}
    />
  );
}

export function Panel({ title, icon, className = '', children, ...rest }) {
  return (
    <div className={`panel ${className}`} {...rest}>
      {title && (
        <div className="panel__title">
          {icon && <Sprite n={icon} h={18} />}
          <span>{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

export function SectionHead({ chapter, title, sub }) {
  return (
    <header className="section-head">
      <span className="chapter">{chapter}</span>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </header>
  );
}
