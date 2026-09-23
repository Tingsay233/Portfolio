/*
 * The personal mark: a tan circle with a serif "s" and a small floating "t",
 * like square-root notation. Inline rather than an <img> so it picks up the
 * page's Fraunces font instead of falling back to Georgia.
 */
export default function Logo({ size = 36, title = 'Say Si Ting', className = '' }) {
  return (
    <svg
      className={`logo ${className}`.trim()}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : 'true'}
    >
      <circle cx="100" cy="100" r="100" fill="#D4A373" />
      <text
        x="94" y="158" textAnchor="middle"
        fontFamily="'Fraunces', Georgia, serif" fontSize="188" fontWeight="900"
        fill="#1F5E68" letterSpacing="-5"
      >
        s
      </text>
      <text
        x="151" y="80" textAnchor="middle"
        fontFamily="'Fraunces', Georgia, serif" fontSize="68" fontWeight="800"
        fill="#1F5E68"
      >
        t
      </text>
    </svg>
  );
}
