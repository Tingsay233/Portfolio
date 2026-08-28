/*
 * One storyboard panel: a slate strip naming the scene, the framed shot
 * itself, and a caption underneath — the way a director's board reads.
 */
export default function Scene({
  id,
  number,
  title,
  direction,
  caption,
  tone = 'light',
  frameless = false,
  children,
}) {
  return (
    <section id={id} className={`scene scene-${tone}`}>
      <div className="container">
        <div className="scene-slate">
          <span className="scene-perf" aria-hidden="true" />
          <div className="scene-slate-row">
            <span className="scene-num">{number}</span>
            <span className="scene-title">{title}</span>
            <span className="scene-direction">{direction}</span>
          </div>
        </div>

        <div className={`scene-frame${frameless ? ' is-frameless' : ''}`}>
          <span className="scene-mark scene-mark-tl" aria-hidden="true" />
          <span className="scene-mark scene-mark-tr" aria-hidden="true" />
          <span className="scene-mark scene-mark-bl" aria-hidden="true" />
          <span className="scene-mark scene-mark-br" aria-hidden="true" />
          {children}
        </div>

        {caption && (
          <p className="scene-caption">
            <span className="scene-caption-num" aria-hidden="true">{number}</span>
            {caption}
          </p>
        )}
      </div>
    </section>
  );
}
