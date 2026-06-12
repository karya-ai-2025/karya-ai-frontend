'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function ChatLauncher() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on the agent page itself and on the dashboard home (the dashboard has
  // its own GTM Orchestrator launcher). Also hide inside a project workspace —
  // those pages render their own in-project assistant launcher.
  if (pathname?.startsWith('/agent')) return null;
  if (pathname === '/business-dashboard') return null;
  if (pathname?.startsWith('/business-dashboard/my-projects/')) return null;

  return (
    <button
      onClick={() => router.push('/agent')}
      aria-label="Open Karya AI assistant"
      title="Ask Karya AI"
      className="group fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-[0_8px_30px_-6px_rgba(37,99,235,0.55)] transition-all hover:scale-105 active:scale-95"
    >
      {/* AI assistant glyph — sparkle on a soft inner ring */}
      <span className="absolute inset-1.5 rounded-xl border border-white/20" />
      <Sparkles className="w-6 h-6 relative" strokeWidth={2} fill="currentColor" fillOpacity={0.15} />
    </button>
  );
}
