import Sprite from './Sprite.jsx';
import { CAT, CHAR } from '../game/art.js';

/*
 * The scene beside each chapter's dialogue. Drawn in CSS — sky, hills, ground
 * and a landmark — so it reads as a place before any pixel art exists. Sprite
 * slots sit on the ground line and fill in once the art lands.
 */

function Stars() {
  return <div className="sky-stars" aria-hidden="true" />;
}

function Hills({ count = 2 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`hill hill-${i + 1}`} aria-hidden="true" />
      ))}
    </>
  );
}

export default function SceneArt({ variant = 'day', actor, prop }) {
  return (
    <div className={`scene-art scene-${variant}`} aria-hidden="true">
      {(variant === 'dusk' || variant === 'night') && <Stars />}
      {variant === 'day' && <span className="sun" />}
      {variant === 'night' && <span className="moon" />}

      <Hills count={variant === 'forest' ? 3 : 2} />

      {prop === 'castle' && (
        <span className="castle">
          <span className="castle-tower castle-tower-l" />
          <span className="castle-keep" />
          <span className="castle-tower castle-tower-r" />
        </span>
      )}
      {prop === 'portal' && <span className="portal" />}
      {prop === 'campfire' && (
        <span className="campfire">
          <span className="campfire-glow" />
          <span className="campfire-flame" />
        </span>
      )}
      {prop === 'trees' && (
        <>
          <span className="tree tree-1" />
          <span className="tree tree-2" />
          <span className="tree tree-3" />
        </>
      )}

      <span className="ground" />

      {actor && (
        <span className="scene-actors">
          <Sprite name={actor} alt="" className="scene-char" fallbackSrc={CHAR.down[0]} />
          <Sprite name="cat-sit" alt="" className="scene-cat" fallbackSrc={CAT.sit} />
        </span>
      )}
    </div>
  );
}
