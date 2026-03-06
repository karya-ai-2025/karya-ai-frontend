'use client';

import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <PreferencesProvider>
        {children}
      </PreferencesProvider>
    </AuthProvider>
  );
}
