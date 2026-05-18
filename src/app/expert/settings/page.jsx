'use client';
import { useState, useEffect } from 'react';
import { User, Lock, Bell, CreditCard, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ExpertPageWrapper from '@/components/expert/ExpertPageWrapper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TABS = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'password',      label: 'Password',        icon: Lock },
  { id: 'payment',       label: 'Payment',         icon: CreditCard },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
];

function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
    }`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

function ProfileTab({ user, getAuthHeader }) {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    fullName:          '',
    phone:             '',
    headline:          '',
    bio:               '',
    location:          '',
    yearsOfExperience: '',
  });

  // Load current profile data on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/profiles/expert`, {
          headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        const p = data.profile || {};
        setForm({
          fullName:          user?.fullName || user?.name || '',
          phone:             user?.phone || '',
          headline:          p.headline || '',
          bio:               p.bio || '',
          location:          p.location || '',
          yearsOfExperience: p.yearsOfExperience?.toString() || '',
        });
      } catch {
        // pre-fill from user object only
        setForm(f => ({ ...f, fullName: user?.fullName || user?.name || '' }));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update User model fields (fullName, phone)
      const userRes = await updateProfile({ fullName: form.fullName, phone: form.phone });
      if (!userRes.success) throw new Error(userRes.error || 'Failed to update name');

      // 2. Update ExpertProfile fields
      const profileRes = await fetch(`${API_URL}/profiles/expert`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline:          form.headline,
          bio:               form.bio,
          location:          form.location,
          yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
        }),
      });
      if (!profileRes.ok) {
        const err = await profileRes.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to update profile');
      }

      setToast({ type: 'success', message: 'Profile saved successfully' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 py-8 text-gray-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading profile…</div>;

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <form onSubmit={handleSave} className="space-y-5 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-400 text-sm bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
          <input
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Professional Headline</label>
          <input
            value={form.headline}
            onChange={e => setForm({ ...form, headline: e.target.value })}
            placeholder="e.g. B2B Lead Generation Specialist"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
          <textarea
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell clients about your expertise and what you can do for them…"
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <input
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="Mumbai, India"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience</label>
            <input
              type="number"
              min="0"
              max="50"
              value={form.yearsOfExperience}
              onChange={e => setForm({ ...form, yearsOfExperience: e.target.value })}
              placeholder="e.g. 5"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </>
  );
}

function PasswordTab({ user, getAuthHeader }) {
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      setToast({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (form.next.length < 8) {
      setToast({ type: 'error', message: 'Password must be at least 8 characters' });
      return;
    }
    setSaving(true);
    try {
      const res = await changePassword(form.current, form.next);
      if (!res.success) throw new Error(res.error || 'Failed to change password');
      setToast({ type: 'success', message: 'Password updated successfully' });
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <form onSubmit={handleSave} className="max-w-xl space-y-5">
        {[
          { key: 'current', label: 'Current Password' },
          { key: 'next',    label: 'New Password' },
          { key: 'confirm', label: 'Confirm New Password' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
            <input
              type="password"
              value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </>
  );
}

function PaymentTab() {
  return (
    <div className="max-w-xl">
      <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
        <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="font-semibold text-gray-400 mb-1">No payment method added</p>
        <p className="text-sm text-gray-400">Add your bank account or UPI to receive payouts</p>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newOpportunity: true,
    projectUpdate:  true,
    payment:        true,
    marketing:      false,
  });

  const items = [
    { key: 'newOpportunity', label: 'New opportunity matched',  desc: 'Get notified when a project matches your profile' },
    { key: 'projectUpdate',  label: 'Project updates',          desc: 'Updates on milestones and client messages' },
    { key: 'payment',        label: 'Payment alerts',           desc: 'Payout confirmations and reminders' },
    { key: 'marketing',      label: 'Platform news',            desc: 'Product updates, webinars, and tips' },
  ];

  return (
    <div className="max-w-xl space-y-3">
      {items.map(item => (
        <div key={item.key} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-900">{item.label}</p>
            <p className="text-xs text-gray-400">{item.desc}</p>
          </div>
          <button
            onClick={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
            className={`relative w-11 h-6 rounded-full transition-all ${prefs[item.key] ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${prefs[item.key] ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function ExpertSettingsPage() {
  const { user, getAuthHeader, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <ExpertPageWrapper activeNav="settings">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 text-sm mb-6">Manage your account, notifications, and payment preferences</p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'profile'       && <ProfileTab       user={user} getAuthHeader={getAuthHeader} />}
        {activeTab === 'password'      && <PasswordTab      user={user} getAuthHeader={getAuthHeader} />}
        {activeTab === 'payment'       && <PaymentTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </div>
    </ExpertPageWrapper>
  );
}
