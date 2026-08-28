import { useState, useCallback } from 'react';
import TypewriterText from '../components/TypewriterText.jsx';
import { useAchievements } from '../lib/AchievementContext.jsx';

const COLS = 5;
const ROWS = 8;

// ── SVG piece icons ──────────────────────────────────────────────────────────
function PieceIcon({ type, isRed, flipped = false }) {
  const fill = isRed ? '#D93B2E' : '#2B57BE';
  const dark = isRed ? '#7A1008' : '#0E2363';
  const S = { fill, stroke: dark, strokeWidth: 1.5, strokeLinejoin: 'round', strokeLinecap: 'round' };

  let shape;
  switch (type) {
    case 'Ram': {
      // Arrow points toward opponent:
      // - Red normally at bottom → UP; when board flipped Red is at top → DOWN
      // - Blue normally at top → DOWN; when board flipped Blue is at bottom → UP
      // So: pointsUp = (isRed XOR flipped)
      const pointsUp = isRed !== flipped;
      shape = pointsUp
        ? <polygon points="12,2 22,17 17,17 17,22 7,22 7,17 2,17" {...S} />
        : <polygon points="12,22 2,7 7,7 7,2 17,2 17,7 22,7" {...S} />;
      break;
    }
    case 'RamTurn':
      shape = <polygon points="12,22 2,7 7,7 7,2 17,2 17,7 22,7" {...S} />;
      break;
    case 'Sau':
      shape = <polygon points="12,2 14.9,8.3 22,9.3 17,14.2 18.2,21.2 12,17.8 5.8,21.2 7,14.2 2,9.3 9.1,8.3" {...S} />;
      break;
    case 'Biz':
      shape = (
        <>
          <polygon points="12,2 22,12 12,22 2,12" {...S} />
          <circle cx="12" cy="12" r="3" fill={dark} stroke="none" />
        </>
      );
      break;
    case 'Tor':
      shape = (
        <>
          <rect x="10" y="2" width="4" height="20" rx="1.5" {...S} />
          <rect x="2" y="10" width="20" height="4" rx="1.5" {...S} />
        </>
      );
      break;
    case 'Xor':
      shape = (
        <>
          <line x1="3"  y1="3"  x2="21" y2="21" stroke={dark} strokeWidth="5" strokeLinecap="round" />
          <line x1="21" y1="3"  x2="3"  y2="21" stroke={dark} strokeWidth="5" strokeLinecap="round" />
          <line x1="3"  y1="3"  x2="21" y2="21" stroke={fill} strokeWidth="3" strokeLinecap="round" />
          <line x1="21" y1="3"  x2="3"  y2="21" stroke={fill} strokeWidth="3" strokeLinecap="round" />
        </>
      );
      break;
    default:
      shape = null;
  }

  return (
    <svg
      viewBox="0 0 24 24"
      style={{ width: '52%', height: '52%', display: 'block', overflow: 'visible', pointerEvents: 'none' }}
    >
      {shape}
    </svg>
  );
}

// ── Game helpers ─────────────────────────────────────────────────────────────
function makePiece(type, col, row, isRed) { return { type, col, row, isRed }; }

function initPieces() {
  return [
    // Top rows — Blue (opponent)
    makePiece('Tor', 0, 0, false), makePiece('Biz', 1, 0, false), makePiece('Sau', 2, 0, false),
    makePiece('Biz', 3, 0, false), makePiece('Xor', 4, 0, false),
    makePiece('Ram', 0, 1, false), makePiece('Ram', 1, 1, false), makePiece('Ram', 2, 1, false),
    makePiece('Ram', 3, 1, false), makePiece('Ram', 4, 1, false),
    // Bottom rows — Red (player)
    makePiece('Ram', 0, 6, true),  makePiece('Ram', 1, 6, true),  makePiece('Ram', 2, 6, true),
    makePiece('Ram', 3, 6, true),  makePiece('Ram', 4, 6, true),
    makePiece('Xor', 0, 7, true),  makePiece('Biz', 1, 7, true),  makePiece('Sau', 2, 7, true),
    makePiece('Biz', 3, 7, true),  makePiece('Tor', 4, 7, true),
  ];
}

function getPieceAt(col, row, pieces) {
  return pieces.find(p => p.col === col && p.row === row) || null;
}

function isBlocked(piece, toCol, toRow, pieces) {
  const dc = Math.sign(toCol - piece.col);
  const dr = Math.sign(toRow - piece.row);
  let c = piece.col + dc, r = piece.row + dr;
  while (c !== toCol || r !== toRow) {
    if (getPieceAt(c, r, pieces)) return true;
    c += dc; r += dr;
  }
  return false;
}

function isValidMove(piece, toCol, toRow, pieces) {
  if (toCol < 0 || toCol >= COLS || toRow < 0 || toRow >= ROWS) return false;
  const dc = Math.abs(toCol - piece.col);
  const dr = Math.abs(toRow - piece.row);
  let valid = false;
  switch (piece.type) {
    case 'Ram':     valid = toCol === piece.col && toRow === piece.row - 1; break;
    case 'RamTurn': valid = toCol === piece.col && toRow === piece.row + 1; break;
    case 'Sau':     valid = dc <= 1 && dr <= 1 && (dc + dr) > 0; break;
    case 'Biz':     valid = dc * dr === 2; break;
    case 'Tor':     if (piece.col !== toCol && piece.row !== toRow) { valid = false; break; } valid = !isBlocked(piece, toCol, toRow, pieces); break;
    case 'Xor':     if (dc !== dr) { valid = false; break; } valid = !isBlocked(piece, toCol, toRow, pieces); break;
    default:        valid = false;
  }
  if (!valid) return false;
  const target = getPieceAt(toCol, toRow, pieces);
  if (target && target.isRed === piece.isRed) return false;
  return true;
}

function getLegalMoves(piece, pieces) {
  const moves = [];
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS; r++)
      if (isValidMove(piece, c, r, pieces)) moves.push([c, r]);
  return moves;
}

function flipPieces(pieces) {
  return pieces.map(p => ({ ...p, col: COLS - 1 - p.col, row: ROWS - 1 - p.row }));
}

function transformTorXor(pieces) {
  return pieces.map(p => {
    if (p.type === 'Tor') return { ...p, type: 'Xor' };
    if (p.type === 'Xor') return { ...p, type: 'Tor' };
    return p;
  });
}

function applyMove(pieces, piece, toCol, toRow, fullTurns) {
  let next = pieces.filter(p => p !== piece);
  const target = getPieceAt(toCol, toRow, pieces);
  let winner = null;
  if (target) {
    next = next.filter(p => p !== target);
    if (target.type === 'Sau') winner = piece.isRed ? 'Red' : 'Blue';
  }
  let newType = piece.type;
  if (piece.type === 'Ram'     && toRow === 0)        newType = 'RamTurn';
  if (piece.type === 'RamTurn' && toRow === ROWS - 1) newType = 'Ram';
  next.push({ ...piece, type: newType, col: toCol, row: toRow });
  next = flipPieces(next);
  const newFullTurns = fullTurns + 1;
  if (newFullTurns % 4 === 0) next = transformTorXor(next);
  return { pieces: next, winner, fullTurns: newFullTurns };
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ChessDemo() {
  const [pieces,    setPieces]    = useState(initPieces);
  const [selected,  setSelected]  = useState(null);
  const [legalMvs,  setLegalMvs]  = useState([]);
  const [blueTurn,  setBlueTurn]  = useState(false); // Red (player, bottom) moves first
  const [fullTurns, setFullTurns] = useState(0);
  const [winner,    setWinner]    = useState(null);
  const [lastMove,  setLastMove]  = useState(null);
  const [flipped,   setFlipped]   = useState(false);
  const { unlock } = useAchievements();

  const handleClick = useCallback((col, row) => {
    if (winner) return;
    const clickedPiece = getPieceAt(col, row, pieces);
    if (!selected) {
      if (clickedPiece && clickedPiece.isRed !== blueTurn) {
        setSelected(clickedPiece);
        setLegalMvs(getLegalMoves(clickedPiece, pieces));
      }
      return;
    }
    if (selected.col === col && selected.row === row) { setSelected(null); setLegalMvs([]); return; }
    if (clickedPiece && clickedPiece.isRed !== blueTurn) {
      setSelected(clickedPiece); setLegalMvs(getLegalMoves(clickedPiece, pieces)); return;
    }
    const isLegal = legalMvs.some(([c, r]) => c === col && r === row);
    if (!isLegal) return;
    const result = applyMove(pieces, selected, col, row, fullTurns);
    setPieces(result.pieces);
    setLastMove({ from: [selected.col, selected.row], to: [col, row] });
    setFullTurns(result.fullTurns);
    setFlipped(f => !f);
    setBlueTurn(t => !t);
    setSelected(null); setLegalMvs([]);
    unlock('opening-move');
    if (result.winner) {
      setWinner(result.winner);
      unlock('sau-slayer');
    }
  }, [pieces, selected, legalMvs, blueTurn, fullTurns, winner, unlock]);

  function reset() {
    setPieces(initPieces()); setSelected(null); setLegalMvs([]);
    setBlueTurn(true); setFullTurns(0); setWinner(null); setLastMove(null); setFlipped(false);
  }

  const currentColor = blueTurn ? 'Blue' : 'Red';
  const torXorIn = 4 - (fullTurns % 4);

  return (
    <section id="play-chess" style={{ background: 'var(--cream-50)' }}>
      <div className="container">
        <span className="section-label">Mini Games</span>
        <TypewriterText text="Kwazam Chess" style={{ marginBottom: '1.5rem' }} />

        <div style={{ display: 'flex', flexDirection: 'row', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }} className="chess-wrap">

          {/* ── Left: description box ── */}
          <div style={{ flex: '1 1 240px', maxWidth: '320px' }}>
            <p style={{ marginBottom: '1rem' }}>
              The actual rules from{' '}
              <strong style={{ color: 'var(--navy-900)' }}>My Java project (Group Assignment)</strong>.
              5×8 board. The board flips after every move so you always face your pieces.
              Capture the opponent's <strong style={{ color: 'var(--accent)' }}>★ SAU</strong> to win.
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', lineHeight: 2 }}>
              <div>▲ <strong>RAM</strong> — 1 step forward, flips at far end</div>
              <div>◆ <strong>BIZ</strong> — L-shape jump</div>
              <div>★ <strong>SAU</strong> — 1 step any direction</div>
              <div>+ <strong>TOR</strong> — orthogonal slide</div>
              <div>× <strong>XOR</strong> — diagonal slide</div>
              <div style={{ marginTop: '0.5rem', color: 'var(--accent)', fontWeight: 600 }}>TOR↔XOR swap every 2 full turns</div>
            </div>
          </div>

          {/* ── Right: board + side panel ── */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', flex: '0 0 auto' }}>

          {/* Board column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: 'fit-content' }}>

          {/* Top label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 'min(400px, 100%)' }}>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.42rem', color: flipped ? '#8B1A0A' : '#0A2A6B', lineHeight: 2, letterSpacing: '0.06em' }}>
              ▲ {flipped ? 'RED' : 'BLUE'} (far end)
            </span>
          </div>

          {/* ── Board ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            width: '400px',
            border: '4px solid var(--navy-800)',
            boxShadow: '6px 6px 0 var(--ink)',
          }}>
            {Array.from({ length: ROWS * COLS }).map((_, i) => {
              const row = Math.floor(i / COLS);
              const col = i % COLS;
              const piece = getPieceAt(col, row, pieces);
              const isLight    = (row + col) % 2 === 0;
              const isSel      = selected?.col === col && selected?.row === row;
              const isLegal    = legalMvs.some(([c, r]) => c === col && r === row);
              const isLastFrom = lastMove?.from[0] === col && lastMove?.from[1] === row;
              const isLastTo   = lastMove?.to[0]   === col && lastMove?.to[1]   === row;

              let bg = isLight ? '#F2E4C4' : '#9B7040';
              if (isLastFrom || isLastTo) bg = isLight ? '#E8D45A' : '#B89A30';
              if (isSel)  bg = '#72B05A';
              if (isLegal && !piece) bg = isLight ? '#C8E8B8' : '#6AAA5A';
              if (isLegal &&  piece) bg = '#E88080';

              return (
                <button
                  key={`${col}-${row}`}
                  onClick={() => handleClick(col, row)}
                  style={{
                    aspectRatio: '1',
                    background: bg,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    position: 'relative',
                    gap: '1px',
                    transition: 'background 0.1s',
                  }}
                >
                  {piece && <PieceIcon type={piece.type} isRed={piece.isRed} flipped={flipped} />}
                  {piece && (
                    <span style={{
                      fontSize: 'clamp(0.3rem, 0.85vw, 0.44rem)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-sans)',
                      color: piece.isRed ? '#7A1008' : '#0E2060',
                      lineHeight: 1,
                      letterSpacing: '0.01em',
                      pointerEvents: 'none',
                    }}>
                      {piece.type === 'RamTurn' ? 'RAM' : piece.type.toUpperCase()}
                    </span>
                  )}
                  {isLegal && !piece && (
                    <span style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ width: '28%', height: '28%', borderRadius: '50%', background: 'rgba(74,124,63,0.55)' }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom label */}
          <div style={{ width: 'min(400px, 100%)' }}>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.42rem', color: flipped ? '#0A2A6B' : '#8B1A0A', lineHeight: 2, letterSpacing: '0.06em' }}>
              ▼ {flipped ? 'BLUE' : 'RED'} (near end)
            </span>
          </div>

          </div>{/* end board column */}

          {/* ── Right: side panel ── */}
          <div className="card" style={{ minWidth: '200px', maxWidth: '240px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Turn indicator */}
            <div>
              <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.45rem', letterSpacing: '0.08em', color: 'var(--ink-muted)', marginBottom: '0.6rem', lineHeight: 2 }}>
                CURRENT TURN
              </p>
              {winner ? (
                <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--cream-50)', border: '2px solid var(--gold)', borderRadius: '4px' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🏆</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.5rem', color: 'var(--navy-900)', lineHeight: 2, letterSpacing: '0.06em' }}>
                    {winner.toUpperCase()} WINS
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Blue', 'Red'].map(side => (
                    <div key={side} style={{
                      flex: 1, padding: '0.5rem 0.25rem',
                      background: currentColor === side ? 'var(--accent)' : 'var(--cream-100)',
                      border: '2px solid var(--navy-800)',
                      boxShadow: currentColor === side ? '3px 3px 0 var(--ink)' : 'none',
                      textAlign: 'center', borderRadius: '4px',
                      color: currentColor === side ? 'white' : 'var(--ink-muted)',
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ fontSize: '1rem', marginBottom: '2px' }}>{side === 'Blue' ? '🔵' : '🔴'}</div>
                      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.4rem', lineHeight: 2 }}>{side}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected piece hint */}
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', fontStyle: 'italic', minHeight: '2.4rem' }}>
              {selected
                ? `${selected.type === 'RamTurn' ? 'RAM' : selected.type} selected — click a highlighted square`
                : `Click a ${currentColor.toLowerCase()} piece`}
            </p>

            {/* Stats */}
            <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', lineHeight: 1.8 }}>
              <div>Turn <strong style={{ color: 'var(--navy-900)' }}>{Math.floor(fullTurns / 2) + 1}</strong></div>
              <div>TOR↔XOR in <strong style={{ color: 'var(--accent)' }}>{torXorIn} half-move{torXorIn !== 1 ? 's' : ''}</strong></div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.4rem', color: 'var(--ink-muted)', marginBottom: '0.1rem', lineHeight: 2 }}>LEGEND</div>
              {[
                { bg: '#C8E8B8', label: 'Move' },
                { bg: '#72B05A', label: 'Selected' },
                { bg: '#E88080', label: 'Capture' },
                { bg: '#E8D45A', label: 'Last move' },
              ].map(({ bg, label }) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--ink-soft)' }}>
                  <span style={{ display: 'inline-block', width: 12, height: 12, background: bg, border: '1px solid #aaa', borderRadius: 2, flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>

            <button onClick={reset} className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }}>
              ↺ New Game
            </button>
          </div>

          </div>{/* end board+panel row */}

        </div>{/* end chess-wrap */}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .chess-wrap { flex-direction: column !important; }
        }
      `}</style>
    </section>
  );
}
