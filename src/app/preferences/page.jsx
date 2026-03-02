'use client';
// pages/Preferences.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Palette, Globe, Mail, Layout, Eye, Monitor, Sun, Moon, Save, RotateCcw, Keyboard, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePreferences } from '@/contexts/PreferencesContext';

function Preferences() {
  const router = useRouter();
  const { preferences, updatePreference, updateEmailType, resetPreferences } = usePreferences();
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [localPreferences, setLocalPreferences] = useState(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handlePreferenceChange = (key, value) => {
    const newPrefs = {
      ...localPreferences,
      [key]: value
    };
    setLocalPreferences(newPrefs);
    setHasChanges(true);

    // Apply immediately for live preview
    updatePreference(key, value);
  };

  const handleEmailTypeChange = (type, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      emailTypes: {
        ...prev.emailTypes,
        [type]: value
      }
    }));
    setHasChanges(true);

    // Apply immediately for live preview
    updateEmailType(type, value);
  };

  const handleSave = () => {
    // Changes are already applied immediately, just show confirmation
    console.log('Preferences saved:', preferences);
    setHasChanges(false);
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const handleReset = () => {
    resetPreferences();
    setLocalPreferences(preferences);
    setHasChanges(false);
  };

  const keyboardShortcuts = [
    { action: 'Search', shortcut: 'Ctrl + K', customizable: true },
    { action: 'New Project', shortcut: 'Ctrl + N', customizable: true },
    { action: 'Save', shortcut: 'Ctrl + S', customizable: false },
    { action: 'Quick Actions', shortcut: 'Ctrl + Shift + P', customizable: true },
    { action: 'Toggle Sidebar', shortcut: 'Ctrl + B', customizable: true },
    { action: 'Open Settings', shortcut: 'Ctrl + ,', customizable: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>

          {/* Save/Reset Buttons */}
          {hasChanges && (
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-bold transition-all hover:scale-105 shadow-xl flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Success Message */}
        {showSaveMessage && (
          <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slideIn">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Preferences saved successfully!</span>
          </div>
        )}

        {/* Page Title */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-6">
            <Settings className="w-4 h-4 text-purple-300" />
            <span className="text-purple-200 text-sm font-medium">Customize Your Experience</span>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">
            Preferences
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Personalize your workspace to match your workflow and preferences
          </p>
        </div>

        {/* Current Settings Preview */}
        <div className="mb-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-400" />
            Current Settings Preview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 mb-1">Theme</p>
              <p className="text-white font-semibold capitalize">{preferences.theme}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 mb-1">Color Scheme</p>
              <p className="text-white font-semibold capitalize">{preferences.colorScheme}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 mb-1">Font Size</p>
              <p className="text-white font-semibold capitalize">{preferences.fontSize.replace('-', ' ')}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 mb-1">High Contrast</p>
              <p className="text-white font-semibold">{preferences.highContrast ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-white/5 rounded-lg flex items-center justify-between gap-4">
            <p className="text-gray-300 text-sm flex-1">
              <strong className="text-white">✨ Live Preview:</strong> Changes are applied immediately!
              Open the test page to see all preferences in action.
            </p>
            <button
              onClick={() => router.push('/preferences-test')}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-lg text-white font-medium transition-all hover:scale-105 shadow-lg whitespace-nowrap"
            >
              View Test Page →
            </button>
          </div>
        </div>

        {/* Appearance Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Palette className="w-8 h-8 text-purple-400" />
            Appearance
          </h2>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 space-y-8">
            {/* Theme */}
            <div>
              <label className="block text-white font-semibold mb-4">Theme</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handlePreferenceChange('theme', 'light')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    localPreferences.theme === 'light'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Sun className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <span className="block text-white font-medium">Light</span>
                </button>

                <button
                  onClick={() => handlePreferenceChange('theme', 'dark')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    localPreferences.theme === 'dark'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Moon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <span className="block text-white font-medium">Dark</span>
                </button>

                <button
                  onClick={() => handlePreferenceChange('theme', 'auto')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    localPreferences.theme === 'auto'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Monitor className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <span className="block text-white font-medium">Auto</span>
                  <span className="block text-gray-400 text-xs mt-1">System</span>
                </button>
              </div>
            </div>

            {/* Color Scheme */}
            <div>
              <label className="block text-white font-semibold mb-4">Color Scheme</label>
              <div className="flex gap-3">
                {['purple', 'blue', 'green', 'orange', 'pink'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handlePreferenceChange('colorScheme', color)}
                    className={`w-12 h-12 rounded-lg transition-all ${
                      localPreferences.colorScheme === color
                        ? 'ring-4 ring-white scale-110'
                        : 'hover:scale-105'
                    } ${
                      color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                      color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                      color === 'green' ? 'bg-gradient-to-br from-green-500 to-teal-500' :
                      color === 'orange' ? 'bg-gradient-to-br from-orange-500 to-red-500' :
                      'bg-gradient-to-br from-pink-500 to-rose-500'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* View Density */}
            <div>
              <label className="block text-white font-semibold mb-4">View Density</label>
              <div className="flex gap-4">
                {['compact', 'comfortable', 'spacious'].map((density) => (
                  <label key={density} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="viewDensity"
                      value={density}
                      checked={localPreferences.viewDensity === density}
                      onChange={(e) => handlePreferenceChange('viewDensity', e.target.value)}
                      className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-white capitalize">{density}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Language & Region Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-400" />
            Language & Region
          </h2>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language */}
              <div>
                <label className="block text-white font-semibold mb-2">Language</label>
                <select
                  value={localPreferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-white font-semibold mb-2">Timezone</label>
                <select
                  value={localPreferences.timezone}
                  onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Australia/Sydney">Sydney (AEST)</option>
                </select>
              </div>

              {/* Date Format */}
              <div>
                <label className="block text-white font-semibold mb-2">Date Format</label>
                <select
                  value={localPreferences.dateFormat}
                  onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              {/* Time Format */}
              <div>
                <label className="block text-white font-semibold mb-2">Time Format</label>
                <select
                  value={localPreferences.timeFormat}
                  onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="12-hour">12-hour (3:00 PM)</option>
                  <option value="24-hour">24-hour (15:00)</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-white font-semibold mb-2">Currency</label>
                <select
                  value={localPreferences.currency}
                  onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="JPY">JPY - Japanese Yen (¥)</option>
                  <option value="CAD">CAD - Canadian Dollar (C$)</option>
                  <option value="AUD">AUD - Australian Dollar (A$)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Email Preferences Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Mail className="w-8 h-8 text-green-400" />
            Email Preferences
          </h2>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 space-y-6">
            {/* Email Frequency */}
            <div>
              <label className="block text-white font-semibold mb-4">Email Frequency</label>
              <div className="flex gap-4">
                {['realtime', 'daily', 'weekly'].map((freq) => (
                  <label key={freq} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="emailFrequency"
                      value={freq}
                      checked={localPreferences.emailFrequency === freq}
                      onChange={(e) => handlePreferenceChange('emailFrequency', e.target.value)}
                      className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-white capitalize">{freq === 'realtime' ? 'Real-time' : freq === 'daily' ? 'Daily Digest' : 'Weekly Digest'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Email Types */}
            <div>
              <label className="block text-white font-semibold mb-4">Types of Emails to Receive</label>
              <div className="space-y-3">
                {Object.entries({
                  marketing: 'Marketing & promotional emails',
                  productUpdates: 'Product updates & new features',
                  weeklyDigest: 'Weekly activity digest',
                  expertMessages: 'Messages from experts',
                  projectUpdates: 'Project updates & milestones',
                  securityAlerts: 'Security alerts (recommended)'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={localPreferences.emailTypes[key]}
                      onChange={(e) => handleEmailTypeChange(key, e.target.checked)}
                      className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-300 group-hover:text-white transition-colors">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Unsubscribe All */}
            <div className="pt-6 border-t border-white/10">
              <button className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 font-medium transition-all">
                Unsubscribe from All Emails
              </button>
              <p className="text-gray-400 text-sm mt-2">You'll still receive critical account and security notifications</p>
            </div>
          </div>
        </section>

        {/* Workspace Preferences Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Layout className="w-8 h-8 text-orange-400" />
            Workspace Preferences
          </h2>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default Project View */}
              <div>
                <label className="block text-white font-semibold mb-2">Default Project View</label>
                <select
                  value={localPreferences.defaultProjectView}
                  onChange={(e) => handlePreferenceChange('defaultProjectView', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="kanban">Kanban Board</option>
                  <option value="list">List View</option>
                  <option value="timeline">Timeline View</option>
                  <option value="calendar">Calendar View</option>
                </select>
              </div>

              {/* Default File View */}
              <div>
                <label className="block text-white font-semibold mb-2">Default File View</label>
                <select
                  value={localPreferences.defaultFileView}
                  onChange={(e) => handlePreferenceChange('defaultFileView', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="grid">Grid View</option>
                  <option value="list">List View</option>
                </select>
              </div>

              {/* Auto-save Frequency */}
              <div>
                <label className="block text-white font-semibold mb-2">Auto-save Frequency</label>
                <select
                  value={localPreferences.autoSaveFrequency}
                  onChange={(e) => handlePreferenceChange('autoSaveFrequency', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="1">Every 1 minute</option>
                  <option value="2">Every 2 minutes</option>
                  <option value="5">Every 5 minutes</option>
                  <option value="10">Every 10 minutes</option>
                  <option value="off">Disabled</option>
                </select>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Keyboard className="w-6 h-6 text-purple-400" />
                  Keyboard Shortcuts
                </h3>
              </div>

              <div className="space-y-2">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span className="text-gray-300">{shortcut.action}</span>
                    <div className="flex items-center gap-3">
                      <kbd className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white font-mono text-sm">
                        {shortcut.shortcut}
                      </kbd>
                      {shortcut.customizable && (
                        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                          Customize
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Accessibility Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Eye className="w-8 h-8 text-pink-400" />
            Accessibility
          </h2>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 space-y-6">
            {/* Screen Reader */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Screen Reader Compatibility</h3>
                <p className="text-gray-400 text-sm">Optimize interface for screen readers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.screenReader}
                  onChange={(e) => handlePreferenceChange('screenReader', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
              </label>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">High Contrast Mode</h3>
                <p className="text-gray-400 text-sm">Increase contrast for better visibility</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.highContrast}
                  onChange={(e) => handlePreferenceChange('highContrast', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
              </label>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-white font-semibold mb-2">Font Size</label>
              <div className="flex gap-4">
                {['small', 'medium', 'large', 'extra-large'].map((size) => (
                  <label key={size} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="fontSize"
                      value={size}
                      checked={localPreferences.fontSize === size}
                      onChange={(e) => handlePreferenceChange('fontSize', e.target.value)}
                      className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-white capitalize">{size.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Motion Reduction */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Reduce Motion</h3>
                <p className="text-gray-400 text-sm">Minimize animations and transitions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.motionReduction}
                  onChange={(e) => handlePreferenceChange('motionReduction', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Save Button at Bottom */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 shadow-xl flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save All Preferences
          </button>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Preferences;
