# Say Si Ting — Personal Logo Assets

A circular tan mark with a serif **s** and a small floating **t** above it —
playing on square-root notation (√). Math-nerd, but quietly.

## Files

### Favicon set (browser tab)
| File | Use |
|---|---|
| `favicon.svg` | Modern browsers — scalable, sharp at every size |
| `favicon-16.png` / `-32.png` / `-48.png` / `-64.png` / `-192.png` | Fallbacks for older browsers, taskbar, home screen |
| `apple-touch-icon.png` | iOS "Add to Home Screen" |

### On-site assets
| File | Use |
|---|---|
| `mark.svg` / `mark-512.png` / `mark-1024.png` | The circle mark at large size — nav bar, hero, LinkedIn profile |
| `mark-letters-only.svg` | Just the letters, no circle — for use on tan or warm backgrounds where the circle would clash |
| `lockup.svg` / `lockup-1120.png` | Mark + "Say Si Ting" wordmark — for email signature, README header, slide title pages |

## Setup in your React portfolio

### 1. Drop the favicons into `public/`

```
public/
├── favicon.svg
├── favicon-16.png
├── favicon-32.png
├── favicon-192.png
└── apple-touch-icon.png
```

### 2. Add to `index.html`

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

### 3. Use the mark in your site

```jsx
// Nav bar
<img src="/mark.svg" alt="Say Si Ting" width="36" height="36" />

// Hero section
<img src="/mark.svg" alt="" width="120" height="120" />
```

## Brand colors

| Role | Hex |
|---|---|
| Tan (mark background) | `#D4A373` |
| Teal (letters & accents) | `#1F5E68` |

Warm + sophisticated. Reads as crafted and personal without being childish.
Distinctive against the violet-and-navy startup default.

## Why this design

- **Big serif "s" with floating "t"** — reads like √ (square root) notation. A
  small math-nerd in-joke that fits a CS portfolio without screaming "code."
- **Fraunces serif** — same family used on your site, so the mark belongs to
  the same world as your typography
- **Tan circle background** — keeps the mark visible on both light and dark
  browser themes (essential for favicon use)
- **Two-tone palette** — warm tan + grounded teal. Not the AI-violet trend,
  not the corporate navy default, not the cute blob pastel. Adult and
  distinct.
