/*
 * Storage adapter for the guestbook.
 *
 * Currently uses localStorage (per-visitor, doesn't sync).
 * Swap to Vercel KV later by replacing the body of getEntries/addEntry
 * with fetch() calls to your /api/guestbook route.
 */

const KEY = 'siting-guestbook-v1';

export async function getEntries() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addEntry({ name, message }) {
  const entry = {
    id: crypto.randomUUID(),
    name: name.slice(0, 40),
    message: message.slice(0, 200),
    when: new Date().toISOString(),
  };
  const existing = await getEntries();
  const updated = [entry, ...existing].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return entry;
}
