'use client';

import { usePreferences } from '@/contexts/PreferencesContext';

export const useTheme = () => {
  const { preferences } = usePreferences();

  const getGradientClass = () => {
    const colorMap = {
      purple: 'from-purple-500 to-pink-500',
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-green-500 to-teal-500',
      orange: 'from-orange-500 to-red-500',
      pink: 'from-pink-500 to-rose-500'
    };

    return colorMap[preferences.colorScheme] || colorMap.purple;
  };

  const getButtonClass = () => {
    return `bg-gradient-to-r ${getGradientClass()} hover:brightness-110`;
  };

  const getBadgeClass = () => {
    return `bg-gradient-to-r ${getGradientClass()}`;
  };

  const getAccentColor = () => {
    const colorMap = {
      purple: '#a855f7',
      blue: '#3b82f6',
      green: '#10b981',
      orange: '#f97316',
      pink: '#ec4899'
    };

    return colorMap[preferences.colorScheme] || colorMap.purple;
  };

  return {
    gradientClass: getGradientClass(),
    buttonClass: getButtonClass(),
    badgeClass: getBadgeClass(),
    accentColor: getAccentColor(),
    preferences
  };
};
