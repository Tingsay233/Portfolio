/*
 * Switches between the story and the plain one-pager. Deliberately visible:
 * a visitor in a hurry should be able to find it without hunting.
 */
export default function ViewToggle({ mode, onChange, inline = false }) {
  const plain = mode === 'plain';
  return (
    <button
      type="button"
      className={`view-toggle${inline ? ' is-inline' : ''}`}
      onClick={() => onChange(plain ? 'story' : 'plain')}
      aria-pressed={plain}
    >
      {plain ? '▸ Story view' : '▤ Plain view'}
    </button>
  );
}
