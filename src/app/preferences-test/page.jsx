'use client';
// pages/PreferencesTest.jsx
import React, { useState, useEffect } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useRouter } from 'next/navigation';
import { Eye, Palette, Type, Zap, RefreshCw } from 'lucide-react';

function PreferencesTest() {
  const router = useRouter();
  const { preferences, formatDate, formatTime, formatCurrency } = usePreferences();
  const [htmlClasses, setHtmlClasses] = useState('');
  const [bodyClasses, setBodyClasses] = useState('');
  const [colorScheme, setColorScheme] = useState('');

  const sampleDate = new Date();
  const sampleAmount = 1234.56;

  const updateDOMInfo = () => {
    setHtmlClasses(document.documentElement.className);
    setBodyClasses(document.body.className);
    setColorScheme(document.documentElement.getAttribute('data-color-scheme') || 'none');
  };

  useEffect(() => {
    updateDOMInfo();
    const interval = setInterval(updateDOMInfo, 500); // Update every 500ms
    return () => clearInterval(interval);
  }, [preferences]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/preferences')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Back to Preferences</span>
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-white/70 hover:text-white transition-colors"
          >
            Home
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <Eye className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Preferences Test Page</h1>
              <p className="text-gray-300">This page shows your preferences in action</p>
            </div>
          </div>

          {/* Visual Indicators */}
          <div className="space-y-6">
            {/* DOM Status - Shows what's actually applied */}
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-500/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Live DOM Status</h2>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium animate-pulse">
                  Auto-updating
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-black/20 rounded-lg p-4">
                  <p className="text-gray-400 text-xs mb-1">HTML Classes Applied:</p>
                  <code className="text-green-300 font-mono text-sm break-all">
                    {htmlClasses || 'none'}
                  </code>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <p className="text-gray-400 text-xs mb-1">Color Scheme Attribute:</p>
                  <code className="text-green-300 font-mono text-sm">
                    data-color-scheme="{colorScheme}"
                  </code>
                </div>
              </div>
              <p className="text-gray-300 text-sm mt-4">
                ✅ If you see "light-theme" or "dark-theme" above, the preferences ARE WORKING!
              </p>
            </div>

            {/* Theme Display */}
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Appearance Settings</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Theme</p>
                  <p className="text-white font-semibold text-lg capitalize">{preferences.theme}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    HTML class: {htmlClasses.includes('light-theme') ? 'light-theme' : 'dark-theme'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Color Scheme</p>
                  <p className="text-white font-semibold text-lg capitalize">{preferences.colorScheme}</p>
                  <div className={`mt-2 h-8 rounded bg-gradient-to-r ${
                    preferences.colorScheme === 'purple' ? 'from-purple-500 to-pink-500' :
                    preferences.colorScheme === 'blue' ? 'from-blue-500 to-cyan-500' :
                    preferences.colorScheme === 'green' ? 'from-green-500 to-teal-500' :
                    preferences.colorScheme === 'orange' ? 'from-orange-500 to-red-500' :
                    'from-pink-500 to-rose-500'
                  }`}></div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">View Density</p>
                  <p className="text-white font-semibold text-lg capitalize">{preferences.viewDensity}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Font Size</p>
                  <p className="text-white font-semibold text-lg capitalize">{preferences.fontSize.replace('-', ' ')}</p>
                  <p className="text-gray-500 text-xs mt-1">Base size: {typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--base-font-size') : ''}</p>
                </div>
              </div>
            </div>

            {/* Typography Test */}
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold text-white">Typography Test</h2>
              </div>
              <div className="space-y-3">
                <p className="text-white" style={{ fontSize: 'calc(var(--base-font-size) * 0.875)' }}>
                  Small text (0.875 × base)
                </p>
                <p className="text-white" style={{ fontSize: 'var(--base-font-size)' }}>
                  Normal text (base font size)
                </p>
                <p className="text-white" style={{ fontSize: 'calc(var(--base-font-size) * 1.125)' }}>
                  Large text (1.125 × base)
                </p>
                <p className="text-white" style={{ fontSize: 'calc(var(--base-font-size) * 1.5)' }}>
                  Heading text (1.5 × base)
                </p>
              </div>
            </div>

            {/* Formatting Test */}
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Formatting Functions</h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Date Format:</span>
                  <span className="text-white font-mono">{formatDate(sampleDate)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Time Format:</span>
                  <span className="text-white font-mono">{formatTime(sampleDate)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Currency:</span>
                  <span className="text-white font-mono">{formatCurrency(sampleAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-gray-400">Language:</span>
                  <span className="text-white font-mono">{preferences.language}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Timezone:</span>
                  <span className="text-white font-mono">{preferences.timezone}</span>
                </div>
              </div>
            </div>

            {/* Accessibility Status */}
            <div className="bg-white/5 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Accessibility Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">High Contrast</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    preferences.highContrast ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {preferences.highContrast ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Motion Reduction</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    preferences.motionReduction ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {preferences.motionReduction ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Screen Reader</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    preferences.screenReader ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {preferences.screenReader ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Email Frequency</span>
                  <span className="text-white font-medium capitalize">
                    {preferences.emailFrequency}
                  </span>
                </div>
              </div>
            </div>

            {/* Raw Preferences Data */}
            <div className="bg-white/5 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Raw Preferences Data</h2>
              <pre className="text-gray-300 text-xs overflow-auto bg-black/20 rounded p-4">
                {JSON.stringify(preferences, null, 2)}
              </pre>
            </div>

            {/* Test Button */}
            <button
              onClick={() => router.push('/preferences')}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-bold text-lg transition-all hover:scale-105"
            >
              Go to Preferences to Make Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreferencesTest;
