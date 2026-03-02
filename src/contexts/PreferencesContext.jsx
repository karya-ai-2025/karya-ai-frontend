'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

const defaultPreferences = {
  // Appearance
  theme: 'light',
  colorScheme: 'purple',
  viewDensity: 'comfortable',

  // Language & Region
  language: 'en-US',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12-hour',
  currency: 'USD',

  // Email Preferences
  emailFrequency: 'daily',
  emailTypes: {
    marketing: true,
    productUpdates: true,
    weeklyDigest: true,
    expertMessages: true,
    projectUpdates: true,
    securityAlerts: true
  },

  // Workspace Preferences
  defaultProjectView: 'kanban',
  defaultFileView: 'grid',
  autoSaveFrequency: '2',

  // Accessibility
  screenReader: false,
  highContrast: false,
  fontSize: 'medium',
  motionReduction: false
};

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPreferences = localStorage.getItem('userPreferences');
      return savedPreferences ? JSON.parse(savedPreferences) : defaultPreferences;
    }
    return defaultPreferences;
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    applyPreferences(preferences);
  }, [preferences]);

  // Apply preferences on initial mount
  useEffect(() => {
    applyPreferences(preferences);
  }, []);

  // Apply preferences to the DOM and document
  const applyPreferences = (prefs) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    // Apply theme
    if (prefs.theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    } else if (prefs.theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
      } else {
        root.classList.add('light-theme');
        root.classList.remove('dark-theme');
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
      }
    }

    // Apply color scheme
    root.setAttribute('data-color-scheme', prefs.colorScheme);
    body.setAttribute('data-color-scheme', prefs.colorScheme);

    // Apply view density
    root.setAttribute('data-view-density', prefs.viewDensity);

    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[prefs.fontSize]);

    // Apply high contrast
    if (prefs.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply motion reduction
    if (prefs.motionReduction) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply screen reader optimizations
    if (prefs.screenReader) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateEmailType = (type, value) => {
    setPreferences(prev => ({
      ...prev,
      emailTypes: {
        ...prev.emailTypes,
        [type]: value
      }
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const formatDate = (date) => {
    const dateObj = new Date(date);
    const { dateFormat } = preferences;

    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();

    switch (dateFormat) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD/YYYY':
      default:
        return `${month}/${day}/${year}`;
    }
  };

  const formatTime = (date) => {
    const dateObj = new Date(date);
    const { timeFormat } = preferences;

    if (timeFormat === '24-hour') {
      return dateObj.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    } else {
      return dateObj.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit' });
    }
  };

  const formatCurrency = (amount) => {
    const { currency } = preferences;
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$'
    };

    return `${currencySymbols[currency] || '$'}${amount.toFixed(2)}`;
  };

  const value = {
    preferences,
    updatePreference,
    updateEmailType,
    resetPreferences,
    formatDate,
    formatTime,
    formatCurrency
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
