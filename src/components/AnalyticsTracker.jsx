'use client';

// Fires a PAGE_VIEW on every route change. Mounted once in the root layout,
// so it covers the whole app automatically — no per-page code needed.

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPage } from '@/services/analyticsApi';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // small delay so document.title reflects the new page before we read it
    const t = setTimeout(() => trackPage(pathname, document.title), 60);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
