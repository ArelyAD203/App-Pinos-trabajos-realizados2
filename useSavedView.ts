import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { Filters } from './types';

export const emptyFilters = (): Filters => ({ year: [], month: [], person: [], category: [], search: '' });
interface SavedView { filters: Filters; page: number; pageSize: number; scrollY: number }
const defaults = (): SavedView => ({ filters: emptyFilters(), page: 1, pageSize: 25, scrollY: 0 });
export function readSavedView(key: string): SavedView {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    if (!value || !value.filters) return defaults();
    const filters = emptyFilters();
    for (const field of ['year', 'month', 'person', 'category'] as const) {
      filters[field] = Array.isArray(value.filters[field]) ? value.filters[field].filter((item: unknown) => typeof item === 'string') : [];
    }
    filters.search = typeof value.filters.search === 'string' ? value.filters.search : '';
    return { filters, page: Number.isInteger(value.page) && value.page > 0 ? value.page : 1,
      pageSize: [25, 50, 100].includes(value.pageSize) ? value.pageSize : 25,
      scrollY: Number.isFinite(value.scrollY) ? Math.max(0, value.scrollY) : 0 };
  } catch { return defaults(); }
}
export function useSavedView(key: string, loading: boolean) {
  const [view, setView] = useState(() => readSavedView(key));
  const latest = useRef(view);
  const restored = useRef(false);
  latest.current = view;
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(view)); } catch { /* Storage may be unavailable. */ }
  }, [key, view]);
  useEffect(() => {
    if (loading || restored.current) return;
    let timer: ReturnType<typeof setTimeout>;
    const frame = requestAnimationFrame(() => {
      window.scrollTo(0, latest.current.scrollY);
      restored.current = true;
    });
    const savePosition = () => {
      if (!restored.current) return;
      const next = { ...latest.current, scrollY: window.scrollY };
      latest.current = next;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Keep app usable without storage. */ }
    };
    const onScroll = () => { clearTimeout(timer); timer = setTimeout(savePosition, 150); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', savePosition);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); window.removeEventListener('scroll', onScroll); window.removeEventListener('pagehide', savePosition); };
  }, [key, loading]);
  const setFilters: Dispatch<SetStateAction<Filters>> = change => setView(prev => ({ ...prev, scrollY: window.scrollY, page: 1, filters: typeof change === 'function' ? change(prev.filters) : change }));
  return { view, setFilters,
    setPage: (page: number) => setView(prev => ({ ...prev, scrollY: window.scrollY, page })),
    setPageSize: (pageSize: number) => setView(prev => ({ ...prev, scrollY: window.scrollY, pageSize, page: 1 })),
    reset: () => { setView(defaults()); window.scrollTo(0, 0); }
  };
}
