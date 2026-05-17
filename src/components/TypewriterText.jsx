import { useState, useEffect, useRef } from 'react';

export default function TypewriterText({
  as: Tag = 'h2',
  text,
  speed = 30,
  className = '',
  style = {},
}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(el);
          let i = 0;
          const iv = setInterval(() => {
            i++;
            setDisplayed(text.slice(0, i));
            if (i >= text.length) { clearInterval(iv); setDone(true); }
          }, speed);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [text, speed]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {displayed}
      <span style={{
        display: 'inline-block',
        width: '2px',
        height: '0.8em',
        background: 'currentColor',
        opacity: done ? 0.7 : 1,
        marginLeft: '3px',
        verticalAlign: 'middle',
        animation: done ? 'cursorBlink 1s step-end infinite' : 'none',
      }} />
    </Tag>
  );
}
