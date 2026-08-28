/*
 * Achievement definitions + persistence.
 *
 * Visitors unlock these by actually doing things on the page — reading a
 * section, playing a demo, signing the guestbook. Progress is per-visitor and
 * lives in localStorage, same as the guestbook.
 */

export const ACHIEVEMENTS = [
  {
    id: 'arrival',
    icon: '🌱',
    title: 'New Villager',
    desc: 'Arrived at the portfolio.',
    hint: 'Just show up.',
    xp: 5,
  },
  {
    id: 'backstory',
    icon: '📖',
    title: 'Backstory Unlocked',
    desc: 'Read the about section.',
    hint: 'Find out who built this place.',
    xp: 10,
  },
  {
    id: 'quest-log',
    icon: '📜',
    title: 'Quest Log Opened',
    desc: 'Browsed the project list.',
    hint: 'Every adventurer checks their quests.',
    xp: 10,
  },
  {
    id: 'journal',
    icon: '🗓️',
    title: 'Time Traveller',
    desc: 'Scrolled through the experience timeline.',
    hint: 'Look back at where I have been.',
    xp: 10,
  },
  {
    id: 'source-diver',
    icon: '🐙',
    title: 'Source Diver',
    desc: 'Opened one of the project repos on GitHub.',
    hint: 'Some quests link to their source.',
    xp: 20,
  },
  {
    id: 'analyst',
    icon: '📊',
    title: 'Data Analyst',
    desc: 'Moved all three RFM sliders in the churn demo.',
    hint: 'A demo somewhere wants you to experiment.',
    xp: 20,
  },
  {
    id: 'opening-move',
    icon: '♟️',
    title: 'Opening Move',
    desc: 'Made your first move in Kwazam Chess.',
    hint: 'There is a board waiting for you.',
    xp: 15,
  },
  {
    id: 'sau-slayer',
    icon: '⚔️',
    title: 'Sau Slayer',
    desc: 'Captured a Sau and won a game of Kwazam Chess.',
    hint: 'Win the game the hard way.',
    xp: 30,
  },
  {
    id: 'scribe',
    icon: '✒️',
    title: 'Scribe',
    desc: 'Signed the guestbook.',
    hint: 'Leave something behind for the next visitor.',
    xp: 20,
  },
  {
    id: 'recruiter',
    icon: '📄',
    title: 'Recruiter Mode',
    desc: 'Downloaded the resume.',
    hint: 'Take a copy with you.',
    xp: 15,
  },
  {
    id: 'pen-pal',
    icon: '💌',
    title: 'Pen Pal',
    desc: 'Opened one of the contact links.',
    hint: 'Say hello somewhere off-site.',
    xp: 15,
  },
  {
    id: 'completionist',
    icon: '👑',
    title: '100% Completion',
    desc: 'Unlocked every other achievement. Genuinely impressive.',
    hint: 'Collect all the rest.',
    xp: 50,
    // Granted automatically once everything else is done.
    auto: true,
  },
];

export const ACHIEVEMENTS_BY_ID = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a])
);

/** Every achievement except the auto-granted completionist. */
export const EARNABLE = ACHIEVEMENTS.filter((a) => !a.auto);

export const TOTAL_XP = ACHIEVEMENTS.reduce((sum, a) => sum + a.xp, 0);

const RANKS = [
  { at: 0,   name: 'Wanderer'  },
  { at: 20,  name: 'Villager'  },
  { at: 55,  name: 'Explorer'  },
  { at: 100, name: 'Adventurer'},
  { at: 160, name: 'Champion'  },
  { at: TOTAL_XP, name: 'Legend' },
];

export function rankFor(xp) {
  let rank = RANKS[0].name;
  for (const r of RANKS) if (xp >= r.at) rank = r.name;
  return rank;
}

const KEY = 'siting-achievements-v1';

export function loadUnlocked() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // Drop ids from older versions of the list.
    return parsed.filter((id) => ACHIEVEMENTS_BY_ID[id]);
  } catch {
    return [];
  }
}

export function saveUnlocked(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* private mode / storage full — progress just won't persist */
  }
}

export function clearUnlocked() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}
