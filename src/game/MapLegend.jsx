import { PLACES } from './world.js';

/*
 * Every place in the village as a plain list. Walking there is the fun way;
 * this is the quick way, and the way in for keyboard and screen-reader users.
 */
export default function MapLegend({ visited, onTravel, onOpen }) {
  return (
    <section className="pnl legend" aria-label="Village map">
      <header className="pnl-head">
        <span aria-hidden="true">🗺️</span>
        <span className="pnl-title">
          VILLAGE MAP — {visited.length}/{PLACES.length} FOUND
        </span>
        <span className="legend-keys">
          <kbd>WASD</kbd> move · <kbd>E</kbd> open · click to walk
        </span>
      </header>
      <ul className="legend-list">
        {PLACES.map((p) => {
          const seen = visited.includes(p.id);
          return (
            <li key={p.id}>
              <button
                type="button"
                className={`legend-item${seen ? ' is-visited' : ''}`}
                onClick={() => onTravel(p.id)}
                title={`Walk to ${p.name}`}
              >
                <span className="legend-check" aria-hidden="true">{seen ? '✓' : '·'}</span>
                <span className="legend-text">
                  <span className="legend-name">{p.name}</span>
                  <span className="legend-hint">{p.hint}</span>
                </span>
              </button>
              <button
                type="button"
                className="legend-open"
                onClick={() => onOpen(p.id)}
                aria-label={`Open ${p.name} now`}
                title="Open without walking"
              >
                ↗
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
