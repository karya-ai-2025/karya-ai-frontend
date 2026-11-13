'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * useState, but the value lives in the URL query string.
 *
 * Swapping `useState` for this makes a view addressable: refreshing keeps you
 * where you were, Back steps through views instead of leaving the project, and
 * the link can be shared or deep-linked into.
 *
 *   const [tab, setTab] = useUrlState('tab', 'dashboard');
 *
 * Notes:
 * - Writes use router.replace by default so a burst of tab clicks doesn't bury
 *   the Back button under dozens of entries. Pass { push: true } for a step you
 *   genuinely want Back to walk through (a wizard, say).
 * - Setting a value equal to `fallback` removes the param, keeping URLs clean.
 * - Accepts an updater function, exactly like useState.
 * - `scroll: false` keeps the page from jumping to the top on every change.
 */
export function useUrlState(key, fallback = '', { push = false, parse, serialize } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get(key);

  const value = useMemo(() => {
    if (raw === null) return fallback;
    return parse ? parse(raw) : raw;
  }, [raw, fallback, parse]);

  const setValue = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(value) : next;
      const params = new URLSearchParams(Array.from(searchParams.entries()));

      const asString = resolved == null
        ? null
        : serialize ? serialize(resolved) : String(resolved);

      // Default value or empty -> drop the param rather than writing ?tab=dashboard
      if (asString == null || asString === '' || asString === String(fallback)) {
        params.delete(key);
      } else {
        params.set(key, asString);
      }

      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;

      if (push) router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [key, fallback, value, searchParams, pathname, router, push, serialize]
  );

  return [value, setValue];
}

/** Same thing for a numeric param (wizard steps, page numbers). */
export function useUrlNumberState(key, fallback = 1, options = {}) {
  return useUrlState(key, fallback, {
    ...options,
    parse: (v) => {
      const n = parseInt(v, 10);
      return Number.isNaN(n) ? fallback : n;
    },
  });
}

export default useUrlState;
