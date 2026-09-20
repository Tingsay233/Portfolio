import Sprite from './Sprite.jsx';
import { useAchievements } from '../lib/AchievementContext.jsx';

/*
 * The flanking HUD columns. Sprite slots fall back to text until the art
 * lands, so nothing here renders broken.
 */

function Panel({ icon, title, children }) {
  return (
    <section className="pnl">
      <header className="pnl-head">
        <span aria-hidden="true">{icon}</span>
        <span className="pnl-title">{title}</span>
      </header>
      <div className="pnl-body">{children}</div>
    </section>
  );
}

const INVENTORY = [
  { icon: '❤️',  name: 'Curiosity',       qty: '∞',  sprite: 'icon-curiosity' },
  { icon: '💎',  name: 'Creativity',      qty: '∞',  sprite: 'icon-creativity' },
  { icon: '🌱',  name: 'Persistence',     qty: '∞',  sprite: 'icon-persistence' },
  { icon: '☕',  name: 'Coffee',          qty: '99', sprite: 'icon-coffee' },
  { icon: '🔑',  name: 'Problem Solving', qty: '∞',  sprite: 'icon-problem-solving' },
];

const HER_ACHIEVEMENTS = [
  { icon: '⭐', name: 'Best Presenter, CITIC 2026' },
  { icon: '🎓', name: 'B.Sc. CS — MMU, CGPA 3.39' },
  { icon: '🚢', name: 'Shipped 3 client systems' },
  { icon: '🤖', name: 'Built a churn model that works' },
  { icon: '📚', name: 'Bilingual: English, Mandarin' },
];

/* Facts that carry their own proof, rather than self-rated bars */
const STATUS = [
  { label: 'Final year project', value: 'RFM + gradient boosting' },
  { label: 'Conference paper',   value: 'CITIC 2026' },
  { label: 'Internship',         value: 'Boolland Digital' },
  { label: 'Client systems',     value: 'Billing · HR kiosk' },
  { label: 'Specialisation',     value: 'Software Engineering' },
];

const EQUIPMENT = [
  { icon: '</>', name: 'Code',        hint: 'Python · JS · Java' },
  { icon: '☕',  name: 'Coffee',      hint: 'Structurally load-bearing' },
  { icon: '🎵',  name: 'Music',       hint: 'Required for focus' },
  { icon: '🌙',  name: 'Late Nights', hint: 'Used sparingly' },
];

const SKILLS = [
  { icon: '🐍', name: 'Python / Django' },
  { icon: '⚛️', name: 'React / JavaScript' },
  { icon: '☕', name: 'Java / C++' },
  { icon: '🗄', name: 'SQL / PostgreSQL' },
  { icon: '🤖', name: 'LightGBM / XGBoost' },
  { icon: '🐳', name: 'Git / Docker' },
];

export function HudLeft() {
  const { xp, totalXp, rank, count, earnableCount } = useAchievements();
  const pct = totalXp > 0 ? Math.round((xp / totalXp) * 100) : 0;

  return (
    <aside className="hud hud-left">
      <section className="pnl">
        <div className="pnl-body">
          <div className="who">
            <div className="face">
              <Sprite
                name="char-idle"
                alt=""
                fallback={<span className="face-fallback">ST</span>}
              />
            </div>
            <div>
              <div className="who-name">Say Si Ting</div>
              <div className="who-lv">Final-year CS · MMU</div>
            </div>
          </div>

          <div className="meter">
            <span className="meter-lbl">HP</span>
            <span className="track"><i style={{ width: '100%', background: 'var(--hp)' }} /></span>
            <span className="meter-n">100/100</span>
          </div>
          <div className="meter" title="Earned by exploring this site">
            <span className="meter-lbl">EXP</span>
            <span className="track"><i style={{ width: `${pct}%`, background: 'var(--exp)' }} /></span>
            <span className="meter-n">{xp}/{totalXp}</span>
          </div>

          <div className="who-loc">
            <span aria-hidden="true">📍</span> Kuala Lumpur, MY
          </div>
        </div>
      </section>

      <Panel icon="🎒" title="INVENTORY">
        {INVENTORY.map((item) => (
          <div key={item.name} className="hud-row">
            <span className="ic">
              <Sprite name={item.sprite} width={16} height={16} fallback={<span>{item.icon}</span>} />
            </span>
            {item.name}
            <span className="qty">{item.qty}</span>
          </div>
        ))}
      </Panel>

      <Panel icon="🏆" title="ACHIEVEMENTS">
        {HER_ACHIEVEMENTS.map((a) => (
          <div key={a.name} className="hud-row">
            <span className="ic" aria-hidden="true">{a.icon}</span>
            {a.name}
          </div>
        ))}
      </Panel>

      <Panel icon="📜" title="CURRENT QUEST">
        <p style={{ fontSize: '0.8rem', lineHeight: 1.55, color: 'var(--text)' }}>
          Looking for a <b style={{ color: 'var(--exp)' }}>graduate role</b> in
          software engineering, QA or technical PM.
        </p>
        <p className="hud-note">
          Visitor progress: <b>{count}/{earnableCount + 1}</b> — {rank}
        </p>
      </Panel>
    </aside>
  );
}

export function HudRight() {
  return (
    <aside className="hud hud-right">
      <Panel icon="📊" title="STATUS">
        {STATUS.map((s) => (
          <div key={s.label} className="hud-row" style={{ alignItems: 'baseline' }}>
            <span style={{ color: 'var(--dim)', fontSize: '0.72rem', minWidth: '84px' }}>
              {s.label}
            </span>
            <span style={{ marginLeft: 'auto', textAlign: 'right', fontSize: '0.76rem' }}>
              {s.value}
            </span>
          </div>
        ))}
      </Panel>

      <Panel icon="⚔️" title="EQUIPMENT">
        {EQUIPMENT.map((e) => (
          <div key={e.name} className="hud-row" title={e.hint}>
            <span className="ic" aria-hidden="true">{e.icon}</span>
            {e.name}
          </div>
        ))}
      </Panel>

      <Panel icon="✨" title="SKILLS UNLOCKED">
        {SKILLS.map((s) => (
          <div key={s.name} className="hud-row">
            <span className="ic" aria-hidden="true">{s.icon}</span>
            {s.name}
          </div>
        ))}
      </Panel>

      <Panel icon="🧰" title="SECRET CHEST">
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Sprite name="chest" width={32} height={32} fallback={<span style={{ fontSize: '1.4rem' }}>🧰</span>} />
          <p style={{ fontSize: '0.78rem', lineHeight: 1.5, color: 'var(--muted)' }}>
            Still writing itself. <b style={{ color: 'var(--exp)' }}>The best is yet to come.</b>
          </p>
        </div>
      </Panel>
    </aside>
  );
}
