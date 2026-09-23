import { useEffect, useState } from 'react';
import { Sprite, Panel, SectionHead, Walker } from './ui.jsx';
import {
  PROFILE, HIGHLIGHTS, ABOUT, LANGUAGES, SKILLS, TOOLS, PROJECTS, EXPERIENCE, NAV,
} from './data.js';
import ChurnDemo from '../sections/ChurnDemo.jsx';
import ChessDemo from '../sections/ChessDemo.jsx';
import Guestbook from '../sections/Guestbook.jsx';

/* ---------------------------------------------------------------- top bar */

function useActiveSection() {
  const [active, setActive] = useState('');
  useEffect(() => {
    const els = ['top', ...NAV.map((n) => n.id)].map((id) => document.getElementById(id)).filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return active;
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return p;
}

function TopBar() {
  const active = useActiveSection();
  const progress = useScrollProgress();
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <a href="#top" className="brand" aria-label="Say Si Ting — back to top">
          <img src="/logo.png" alt="" width="36" height="36" />
          <span>{PROFILE.name}</span>
        </a>
        <nav className="topnav" aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={active === n.id ? 'is-active' : ''}>
              {n.label}
            </a>
          ))}
        </nav>
        <a className="pbtn pbtn--gold topbar__cta" href={PROFILE.resume} download="SiTing_Resume.pdf">
          Resume
        </a>
      </div>
      <div className="topbar__exp" aria-hidden="true">
        <i style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- sidebar */

function Sidebar() {
  return (
    <aside className="sidebar">
      <Panel className="profile">
        <div className="profile__head">
          <div className="profile__avatar">
            <Sprite n={65} h={72} alt="Pixel portrait of Si Ting" />
          </div>
          <div>
            <div className="profile__name">{PROFILE.name}</div>
            <div className="profile__role">CS Graduate · MMU</div>
          </div>
        </div>
        <div className="status-pill">
          <span className="dot" /> Open to QA &amp; dev roles
        </div>
        <ul className="facts">
          <li><Sprite n={46} h={16} /> {PROFILE.location}</li>
          <li><Sprite n={45} h={16} /> Remote / hybrid OK</li>
        </ul>
        <div className="profile__links">
          <a href={`mailto:${PROFILE.email}`}>Email</a>
          <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </Panel>

      <Panel title="Highlights" icon={54}>
        <ul className="ach">
          {HIGHLIGHTS.map((h) => (
            <li key={h.title}>
              <span className="slot"><Sprite n={h.icon} h={22} /></span>
              <span>
                <strong>{h.title}</strong>
                <small>{h.detail}</small>
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Languages" icon={60}>
        <ul className="langs">
          {LANGUAGES.map((l) => (
            <li key={l.name}>
              <span>{l.name}</span>
              <small>{l.level}</small>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Current quest" icon={61} className="quest">
        <p>{PROFILE.lookingFor}</p>
        <Sprite n={84} h={34} className="quest__cat" />
      </Panel>
    </aside>
  );
}

/* ---------------------------------------------------------------- hero */

function Hero() {
  return (
    <section className="scene scene--day hero" id="top" aria-label="Introduction">
      <div className="scene__art" aria-hidden="true">
        <Sprite n={121} h={52} className="cloud c1" />
        <Sprite n={133} h={38} className="cloud c2" />
        <Sprite n={128} h={26} className="cloud c3" />
        <Sprite n={131} h={38} className="sun" />
        <div className="mountains" />
        <Sprite n="castle.png" h={190} className="hero__castle" />
        <Sprite n={125} h={140} className="hero__tree" />
        <Sprite n={1} h={128} className="hero__me bob" />
        <Sprite n={80} h={50} className="hero__cat" />
        <Sprite n={101} h={110} className="hero__lamp" />
        <div className="ground" />
      </div>

      <div className="scene__content">
        <div className="dialog hero__dialog">
          <div className="status-pill"><span className="dot" /> Open to QA &amp; dev roles · {PROFILE.location}</div>
          <span className="chapter">Hello, I'm</span>
          <h1>{PROFILE.name}</h1>
          <p className="hero__role">
            {PROFILE.role} · {PROFILE.specialization}
          </p>
          <p className="hero__bio">{PROFILE.bio}</p>
          <div className="hero__cta">
            <a className="pbtn pbtn--gold" href="#projects">View projects</a>
            <a className="pbtn" href={PROFILE.resume} download="SiTing_Resume.pdf">Download resume</a>
            <a className="pbtn pbtn--ghost" href="#contact">Contact</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function HighlightStrip() {
  return (
    <div className="hl-strip">
      {HIGHLIGHTS.map((h) => (
        <div className="hl panel" key={h.title}>
          <span className="slot"><Sprite n={h.icon} h={26} /></span>
          <span>
            <strong>{h.title}</strong>
            <small>{h.detail}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- about + skills */

function About() {
  return (
    <section className="block" id="about">
      <SectionHead chapter="Chapter 1" title="About" sub={PROFILE.headline} />
      <Panel className="about">
        <div className="about__art" aria-hidden="true">
          <Sprite n={72} h={112} />
        </div>
        <div className="about__text">
          {ABOUT.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
        </div>
      </Panel>
    </section>
  );
}

function Skills() {
  return (
    <section className="block" id="skills">
      <SectionHead chapter="Chapter 2" title="Skills" sub="Main: used across several real projects · Projects: used in specific projects · Coursework: academic use." />
      <div className="skills">
        {SKILLS.map((s) => (
          <Panel className="skill" key={s.name}>
            <span className="slot"><Sprite n={s.icon} h={26} /></span>
            <div className="skill__body">
              <div className="skill__top">
                <strong>{s.name}</strong>
                <span className="lv">{s.tier}</span>
              </div>
              <small>{s.note}</small>
            </div>
          </Panel>
        ))}
      </div>
      <div className="tools">
        <span className="tools__label">Tools</span>
        {TOOLS.map((t) => <span className="ptag" key={t}>{t}</span>)}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- projects */

function Projects() {
  return (
    <section className="block" id="projects">
      <SectionHead chapter="Chapter 3" title="Projects" sub="Full-stack, client, academic and game projects." />
      <div className="scene scene--forest strip" aria-hidden="true">
        <div className="scene__art">
          <Sprite n={123} h={150} className="f-tree1" />
          <Sprite n={102} h={104} className="f-tent" />
          <Sprite n={38} h={44} className="f-chest" />
          <Sprite n={130} h={90} className="f-tree2" />
          <Sprite n={134} h={80} className="f-tree3" />
          <Sprite n={113} h={34} className="f-flowers" />
          <div className="ground" />
        </div>
      </div>

      <div className="projects">
        {PROJECTS.map((p, i) => (
          <article className={`panel project${p.featured ? ' project--featured' : ''}`} key={p.title}>
            <div className="project__head">
              <span className="slot"><Sprite n={p.icon} h={26} /></span>
              <div>
                <span className="project__num">Quest {String(i + 1).padStart(2, '0')}</span>
                <h3>{p.title}</h3>
                <span className="project__meta">{p.meta}</span>
              </div>
              {p.badge && <span className="badge">{p.badge}</span>}
            </div>
            <p>{p.blurb}</p>
            <p className="project__impact">
              <Sprite n={12} h={14} /> {p.impact}
            </p>
            <div className="project__foot">
              <div className="tags">
                {p.stack.map((t) => <span className="ptag" key={t}>{t}</span>)}
              </div>
              {p.links.map((l) => (
                <a key={l.url} className="pbtn pbtn--sm" href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- experience */

function Experience() {
  return (
    <section className="block" id="experience">
      <SectionHead chapter="Chapter 4" title="Experience & Education" />
      <div className="scene scene--dusk strip" aria-hidden="true">
        <div className="scene__art">
          <Sprite n={132} h={30} className="moon" />
          <div className="mountains" />
          <Sprite n={125} h={110} className="d-tree1" />
          <Sprite n={120} h={100} className="d-lamp" />
          <Sprite n={100} h={52} className="d-sign" />
          <Sprite n={116} h={40} className="d-bush" />
          <Walker h={66} />
          <div className="ground ground--path" />
        </div>
      </div>
      <ol className="timeline">
        {EXPERIENCE.map((e) => (
          <li key={e.title} className="panel">
            <span className="slot"><Sprite n={e.icon} h={26} /></span>
            <div>
              <div className="timeline__top">
                <h3>{e.title}</h3>
                <span className="when">{e.when}</span>
              </div>
              <div className="timeline__org">{e.org}</div>
              <p>{e.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------------------------------------------------------------- demos */

const DEMOS = [
  { id: 'churn', label: 'Churn classifier', icon: 59, Comp: ChurnDemo },
  { id: 'chess', label: 'Kwazam Chess', icon: 37, Comp: ChessDemo },
  { id: 'guestbook', label: 'Guestbook (local demo)', icon: 33, Comp: Guestbook },
];

function Demos() {
  const [tab, setTab] = useState('churn');
  const Active = DEMOS.find((d) => d.id === tab).Comp;
  return (
    <section className="block" id="demos">
      <SectionHead chapter="Side quests" title="Interactive demos" sub="Small playable versions of things I've built." />
      <div className="tabs" role="tablist">
        {DEMOS.map((d) => (
          <button
            key={d.id}
            role="tab"
            aria-selected={tab === d.id}
            className={`tab${tab === d.id ? ' is-active' : ''}`}
            onClick={() => setTab(d.id)}
          >
            <Sprite n={d.icon} h={18} /> {d.label}
          </button>
        ))}
      </div>
      <div className="parchment" key={tab}>
        <Active />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- contact */

function Contact() {
  const links = [
    { icon: 60, label: 'Email', value: PROFILE.email, href: `mailto:${PROFILE.email}` },
    { icon: 45, label: 'LinkedIn', value: 'in/say-si-ting', href: PROFILE.linkedin },
    { icon: 36, label: 'GitHub', value: 'github.com/Tingsay233', href: PROFILE.github },
    { icon: 33, label: 'Resume', value: 'Download PDF', href: PROFILE.resume, download: 'SiTing_Resume.pdf' },
  ];
  return (
    <section className="scene scene--night contact" id="contact" aria-label="Contact">
      <div className="scene__art" aria-hidden="true">
        <div className="stars" />
        <Sprite n={132} h={34} className="n-moon" />
        <Sprite n={127} h={200} className="n-portal" />
        <Sprite n={86} h={96} className="n-fire" />
        <Sprite n={85} h={52} className="n-cat" />
        <div className="ground" />
      </div>
      <div className="scene__content">
        <div className="dialog contact__dialog">
          <span className="chapter">Epilogue</span>
          <h2>Let's build something together.</h2>
          <p>{PROFILE.lookingFor}</p>
          <div className="contact__links">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                download={l.download}
              >
                <span className="slot"><Sprite n={l.icon} h={20} /></span>
                <span>
                  <strong>{l.label}</strong>
                  <small>{l.value}</small>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- app */

export default function PixelApp() {
  return (
    <>
      <a className="skip" href="#about">Skip to content</a>
      <TopBar />
      <div className="layout">
        <Sidebar />
        <main className="main">
          <Hero />
          <HighlightStrip />
          <About />
          <Skills />
          <Projects />
          <Experience />
          <Demos />
          <Contact />
          <footer className="footer">
            © {new Date().getFullYear()} {PROFILE.name} · Built with React · Pixel art sprites
          </footer>
        </main>
      </div>
    </>
  );
}
