'use client';

import { PreferencesProvider } from '@/contexts/PreferencesContext';

export default function Providers({ children }) {
  return (
    <PreferencesProvider>
      {children}
    </PreferencesProvider>
  );
}
