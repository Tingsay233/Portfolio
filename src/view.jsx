import { createContext, useContext, useEffect, useState } from 'react';

/* Two ways to see the same portfolio:
     classic  — clean, résumé-style page for traditional employers
     creative — the pixel-art site with the playable level
   Share a specific one with ?view=classic or ?view=creative. */

export const VIEWS = ['classic', 'creative'];
const DEFAULT_VIEW = 'creative';
const KEY = 'pf-view';

function initialView() {
  const fromUrl = new URLSearchParams(window.location.search).get('view');
  if (VIEWS.includes(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(KEY);
    if (VIEWS.includes(saved)) return saved;
  } catch { /* storage blocked */ }
  return DEFAULT_VIEW;
}

const ViewContext = createContext({ view: DEFAULT_VIEW, setView: () => {} });
export const useView = () => useContext(ViewContext);

export function ViewProvider({ children }) {
  const [view, setViewState] = useState(() => {
    const v = initialView();
    document.documentElement.dataset.view = v; // before first paint, so no theme flash
    return v;
  });

  useEffect(() => {
    document.documentElement.dataset.view = view;
  }, [view]);

  function setView(next) {
    if (!VIEWS.includes(next) || next === view) return;
    setViewState(next);
    try { localStorage.setItem(KEY, next); } catch { /* storage blocked */ }
    const url = new URL(window.location.href);
    url.searchParams.set('view', next);
    url.hash = '';
    window.history.replaceState(null, '', url);
    window.scrollTo(0, 0);
  }

  return <ViewContext.Provider value={{ view, setView }}>{children}</ViewContext.Provider>;
}

export function ViewSwitch({ className = '' }) {
  const { view, setView } = useView();
  return (
    <div className={`view-switch ${className}`} role="group" aria-label="Choose portfolio style">
      <button type="button" aria-pressed={view === 'classic'} onClick={() => setView('classic')}>Classic</button>
      <button type="button" aria-pressed={view === 'creative'} onClick={() => setView('creative')}>Creative</button>
    </div>
  );
}
