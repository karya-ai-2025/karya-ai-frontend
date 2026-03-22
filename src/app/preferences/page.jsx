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
    updateEmailType(type, value);
  };

  const handleSave = () => {
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>

          {/* Save/Reset Buttons */}
          {hasChanges && (
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 font-medium transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-white font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Success Message */}
        {showSaveMessage && (
          <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Preferences saved successfully!</span>
          </div>
        )}

        {/* Page Title */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
            <Settings className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-medium">Customize Your Experience</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Preferences
          </h1>

          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Personalize your workspace to match your workflow and preferences
          </p>
        </div>

        {/* Current Settings Preview */}
        <div className="mb-12 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            Current Settings Preview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-gray-500 mb-1">Theme</p>
              <p className="text-gray-900 font-semibold capitalize">{preferences.theme}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-gray-500 mb-1">Color Scheme</p>
              <p className="text-gray-900 font-semibold capitalize">{preferences.colorScheme}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-gray-500 mb-1">Font Size</p>
              <p className="text-gray-900 font-semibold capitalize">{preferences.fontSize.replace('-', ' ')}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-gray-500 mb-1">High Contrast</p>
              <p className="text-gray-900 font-semibold">{preferences.highContrast ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between gap-4">
            <p className="text-gray-600 text-sm flex-1">
              <strong className="text-gray-900">✨ Live Preview:</strong> Changes are applied immediately!
              Open the test page to see all preferences in action.
            </p>
            <button
              onClick={() => router.push('/preferences-test')}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium transition-all shadow-md whitespace-nowrap"
            >
              View Test Page →
            </button>
          </div>
        </div>

        {/* Appearance Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Palette className="w-8 h-8 text-blue-500" />
            Appearance
          </h2>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 space-y-8">
            {/* Theme */}
            <div>
              <label className="block text-gray-900 font-semibold mb-4">Theme</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handlePreferenceChange('theme', 'light')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    localPreferences.theme === 'light'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Sun className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <span className="block text-gray-900 font-medium">Light</span>
                </button>

                <button
                  onClick={() => handlePreferenceChange('theme', 'dark')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    localPreferences.theme === 'dark'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Moon className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <span className="block text-gray-900 font-medium">Dark</span>
                </button>

                <button
                  onClick={() => handlePreferenceChange('theme', 'auto')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    localPreferences.theme === 'auto'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Monitor className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <span className="block text-gray-900 font-medium">Auto</span>
                  <span className="block text-gray-500 text-xs mt-1">System</span>
                </button>
              </div>
            </div>

            {/* Color Scheme */}
            <div>
              <label className="block text-gray-900 font-semibold mb-4">Color Scheme</label>
              <div className="flex gap-3">
                {['purple', 'blue', 'green', 'orange', 'pink'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handlePreferenceChange('colorScheme', color)}
                    className={`w-12 h-12 rounded-lg transition-all ${
                      localPreferences.colorScheme === color
                        ? 'ring-4 ring-blue-500 ring-offset-2 scale-110'
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
              <label className="block text-gray-900 font-semibold mb-4">View Density</label>
              <div className="flex gap-4">
                {['compact', 'comfortable', 'spacious'].map((density) => (
                  <label key={density} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="viewDensity"
                      value={density}
                      checked={localPreferences.viewDensity === density}
                      onChange={(e) => handlePreferenceChange('viewDensity', e.target.value)}
                      className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 capitalize">{density}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Language & Region Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-500" />
            Language & Region
          </h2>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 font-semibold mb-2">Language</label>
                <select
                  value={localPreferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Timezone</label>
                <select
                  value={localPreferences.timezone}
                  onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Date Format</label>
                <select
                  value={localPreferences.dateFormat}
                  onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Time Format</label>
                <select
                  value={localPreferences.timeFormat}
                  onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="12-hour">12-hour (3:00 PM)</option>
                  <option value="24-hour">24-hour (15:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Currency</label>
                <select
                  value={localPreferences.currency}
                  onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Mail className="w-8 h-8 text-emerald-500" />
            Email Preferences
          </h2>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 space-y-6">
            <div>
              <label className="block text-gray-900 font-semibold mb-4">Email Frequency</label>
              <div className="flex gap-4">
                {['realtime', 'daily', 'weekly'].map((freq) => (
                  <label key={freq} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="emailFrequency"
                      value={freq}
                      checked={localPreferences.emailFrequency === freq}
                      onChange={(e) => handlePreferenceChange('emailFrequency', e.target.value)}
                      className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 capitalize">{freq === 'realtime' ? 'Real-time' : freq === 'daily' ? 'Daily Digest' : 'Weekly Digest'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-900 font-semibold mb-4">Types of Emails to Receive</label>
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
                      className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button className="px-6 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 font-medium transition-all">
                Unsubscribe from All Emails
              </button>
              <p className="text-gray-400 text-sm mt-2">You'll still receive critical account and security notifications</p>
            </div>
          </div>
        </section>

        {/* Workspace Preferences Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Layout className="w-8 h-8 text-orange-500" />
            Workspace Preferences
          </h2>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 font-semibold mb-2">Default Project View</label>
                <select
                  value={localPreferences.defaultProjectView}
                  onChange={(e) => handlePreferenceChange('defaultProjectView', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="kanban">Kanban Board</option>
                  <option value="list">List View</option>
                  <option value="timeline">Timeline View</option>
                  <option value="calendar">Calendar View</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Default File View</label>
                <select
                  value={localPreferences.defaultFileView}
                  onChange={(e) => handlePreferenceChange('defaultFileView', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="grid">Grid View</option>
                  <option value="list">List View</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-900 font-semibold mb-2">Auto-save Frequency</label>
                <select
                  value={localPreferences.autoSaveFrequency}
                  onChange={(e) => handlePreferenceChange('autoSaveFrequency', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Keyboard className="w-6 h-6 text-blue-500" />
                  Keyboard Shortcuts
                </h3>
              </div>

              <div className="space-y-2">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                  >
                    <span className="text-gray-700">{shortcut.action}</span>
                    <div className="flex items-center gap-3">
                      <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono text-sm shadow-sm">
                        {shortcut.shortcut}
                      </kbd>
                      {shortcut.customizable && (
                        <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Eye className="w-8 h-8 text-pink-500" />
            Accessibility
          </h2>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Screen Reader Compatibility</h3>
                <p className="text-gray-500 text-sm">Optimize interface for screen readers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.screenReader}
                  onChange={(e) => handlePreferenceChange('screenReader', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">High Contrast Mode</h3>
                <p className="text-gray-500 text-sm">Increase contrast for better visibility</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.highContrast}
                  onChange={(e) => handlePreferenceChange('highContrast', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <label className="block text-gray-900 font-semibold mb-2">Font Size</label>
              <div className="flex gap-4">
                {['small', 'medium', 'large', 'extra-large'].map((size) => (
                  <label key={size} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="fontSize"
                      value={size}
                      checked={localPreferences.fontSize === size}
                      onChange={(e) => handlePreferenceChange('fontSize', e.target.value)}
                      className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 capitalize">{size.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Reduce Motion</h3>
                <p className="text-gray-500 text-sm">Minimize animations and transitions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localPreferences.motionReduction}
                  onChange={(e) => handlePreferenceChange('motionReduction', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Save Button at Bottom */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-xl text-white font-bold text-lg transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save All Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

export default Preferences;
