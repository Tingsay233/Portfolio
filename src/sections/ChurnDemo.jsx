import { useRef, useState } from 'react';
import TypewriterText from '../components/TypewriterText.jsx';
import { useAchievements } from '../lib/AchievementContext.jsx';

/*
 * RFM segmentation logic — simplified version of the FYP's scoring.
 * Each dimension is scored 1–5; the combined score maps to a segment.
 *
 * Recency:   days since last purchase  (lower = better)
 * Frequency: total orders              (higher = better)
 * Monetary:  total spend in MYR        (higher = better)
 */

function rScore(daysSince) {
  if (daysSince <= 14) return 5;
  if (daysSince <= 45) return 4;
  if (daysSince <= 90) return 3;
  if (daysSince <= 180) return 2;
  return 1;
}
function fScore(orders) {
  if (orders >= 20) return 5;
  if (orders >= 10) return 4;
  if (orders >= 5) return 3;
  if (orders >= 2) return 2;
  return 1;
}
function mScore(spend) {
  if (spend >= 2000) return 5;
  if (spend >= 800) return 4;
  if (spend >= 300) return 3;
  if (spend >= 100) return 2;
  return 1;
}

function segment(r, f, m) {
  const avg = (f + m) / 2;
  if (r >= 4 && avg >= 4) return { name: 'Champions', tone: '#3F7D58', desc: 'Your best customers. Recent, frequent, and high-spending. Reward and retain.' };
  if (r >= 3 && avg >= 3) return { name: 'Loyal', tone: '#5B8BB0', desc: 'Consistent, valuable customers. Engage with personalized offers.' };
  if (r >= 4 && avg <= 2) return { name: 'New / Promising', tone: '#A87E4E', desc: 'Bought recently but not often. Nurture into loyalty.' };
  if (r <= 2 && avg >= 4) return { name: 'At-Risk', tone: '#C2624B', desc: 'Used to be valuable. Haven\'t bought in a while. Win them back fast.' };
  if (r <= 2 && avg >= 2) return { name: 'High-Risk', tone: '#A04B3A', desc: 'Slipping away. Send a reactivation campaign.' };
  return { name: 'Churned', tone: '#6B6258', desc: 'Likely gone. Consider whether they\'re worth winning back, or focus elsewhere.' };
}

export default function ChurnDemo() {
  const [recency, setRecency] = useState(30);
  const [frequency, setFrequency] = useState(8);
  const [monetary, setMonetary] = useState(500);

  const { unlock } = useAchievements();
  const tuned = useRef(new Set());

  // Unlocks once the visitor has experimented with all three RFM dimensions.
  function tune(dimension, setter) {
    return (value) => {
      setter(value);
      tuned.current.add(dimension);
      if (tuned.current.size === 3) unlock('analyst');
    };
  }

  const r = rScore(recency);
  const f = fScore(frequency);
  const m = mScore(monetary);
  const seg = segment(r, f, m);

  return (
    <section id="play-churn" style={{ background: 'var(--cream-100)' }}>
      <div className="container">
        <span className="section-label">Play · Demo 1</span>
        <TypewriterText text="Try the churn classifier." style={{ marginBottom: '0.5rem' }} />
        <p style={{ marginBottom: '2rem', maxWidth: '560px' }}>
          Move the sliders to simulate a customer. The RFM logic from my FYP
          will tell you what segment they fall into. (Real model uses
          gradient-boosted trees on actual transaction data — this is the
          rule-based segmentation step that sits on top.)
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* Controls */}
          <div className="card" style={{ background: 'white' }}>
            <Slider
              label="Days since last purchase"
              suffix="days"
              value={recency}
              setValue={tune('recency', setRecency)}
              min={0}
              max={365}
              hint={r}
            />
            <Slider
              label="Total orders"
              suffix="orders"
              value={frequency}
              setValue={tune('frequency', setFrequency)}
              min={1}
              max={30}
              hint={f}
            />
            <Slider
              label="Total spend"
              suffix="MYR"
              value={monetary}
              setValue={tune('monetary', setMonetary)}
              min={10}
              max={3000}
              step={10}
              hint={m}
            />
          </div>

          {/* Result */}
          <div
            className="card"
            style={{
              background: 'white',
              borderTop: `4px solid ${seg.tone}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-muted)',
                  marginBottom: '0.5rem',
                }}
              >
                This customer is...
              </p>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  color: seg.tone,
                  marginBottom: '0.75rem',
                }}
              >
                {seg.name}
              </h3>
              <p style={{ marginBottom: '1.25rem' }}>{seg.desc}</p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border)',
              }}
            >
              <ScoreBox label="R" value={r} />
              <ScoreBox label="F" value={f} />
              <ScoreBox label="M" value={m} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({ label, suffix, value, setValue, min, max, step = 1, hint }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.4rem',
        }}
      >
        <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink)' }}>
          {label}
        </label>
        <span style={{ fontSize: '0.85rem', color: 'var(--navy-800)', fontWeight: 500 }}>
          {value.toLocaleString()} {suffix}
          <span
            style={{
              marginLeft: '0.5rem',
              fontSize: '0.7rem',
              color: 'var(--ink-muted)',
            }}
          >
            (score {hint}/5)
          </span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)' }}
      />
    </div>
  );
}

function ScoreBox({ label, value }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '0.5rem',
        background: 'var(--cream-50)',
        borderRadius: 'var(--radius)',
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          color: 'var(--ink-muted)',
          fontWeight: 600,
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-retro)',
          fontSize: '2rem',
          color: 'var(--navy-900)',
        }}
      >
        {value}
      </div>
    </div>
  );
}
