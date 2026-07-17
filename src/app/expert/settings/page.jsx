'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Bell, CreditCard, Save, Loader2, CheckCircle, AlertCircle, Pencil } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ExpertPageWrapper from '@/components/expert/ExpertPageWrapper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TABS = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'password',      label: 'Password',        icon: Lock },
  // Payment tab hidden until payments go live.
  // { id: 'payment',       label: 'Payment',         icon: CreditCard },
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
  const router = useRouter();
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
          location:          typeof p.location === 'string'
            ? p.location
            : [p.location?.city, p.location?.state].filter(Boolean).join(', '),
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
          // location is an object { city, state } in the schema — split the "City, State" input.
          location:          form.location.trim()
            ? { city: (form.location.split(',')[0] || '').trim(), state: (form.location.split(',')[1] || '').trim() }
            : undefined,
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

      {/* Edit full profile (skills, services, portfolio) */}
      <div className="mb-5 max-w-xl flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Edit your full profile</p>
          <p className="text-xs text-gray-500">Update your skills, services, portfolio and rates.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/onboarding-expert/profile-setup')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
        >
          <Pencil className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      {/* Read-only display — use "Edit Profile" above to make changes */}
      <div className="space-y-4 max-w-xl">
        <ReadRow label="Full Name" value={form.fullName} />
        <ReadRow label="Email" value={user?.email} />
        <ReadRow label="Phone" value={form.phone} />
        <ReadRow label="Professional Title" value={form.headline} />
        <ReadRow label="Bio" value={form.bio} />
        <div className="grid grid-cols-2 gap-4">
          <ReadRow label="Location" value={form.location} />
          <ReadRow label="Years of Experience" value={form.yearsOfExperience} />
        </div>
      </div>
    </>
  );
}

// Read-only labelled value row
function ReadRow({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      <div className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 text-sm min-h-[42px] whitespace-pre-wrap">
        {value && String(value).trim() ? value : <span className="text-gray-400">—</span>}
      </div>
    </div>
  );
}

function PasswordTab({ user, getAuthHeader }) {
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [banner, setBanner] = useState(null); // persistent inline result message

  // Same rules as registration
  const pwChecks = {
    length:    form.next.length >= 8,
    uppercase: /[A-Z]/.test(form.next),
    lowercase: /[a-z]/.test(form.next),
    number:    /\d/.test(form.next),
    special:   /[@$!%*?&]/.test(form.next),
  };
  const pwValid = Object.values(pwChecks).every(Boolean);

  const validateNewPassword = () => {
    if (!pwChecks.length)    return 'Password must be at least 8 characters';
    if (!pwChecks.uppercase) return 'Password must contain an uppercase letter';
    if (!pwChecks.lowercase) return 'Password must contain a lowercase letter';
    if (!pwChecks.number)    return 'Password must contain a number';
    if (!pwChecks.special)   return 'Password must contain a special character (@$!%*?&)';
    if (form.next !== form.confirm) return 'New passwords do not match';
    if (form.next === form.current) return 'New password must be different from the current one';
    return '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setBanner(null);
    const validationError = validateNewPassword();
    if (validationError) {
      setBanner({ type: 'error', message: validationError });
      setToast({ type: 'error', message: validationError });
      return;
    }
    setSaving(true);
    try {
      const res = await changePassword(form.current, form.next);
      if (!res.success) throw new Error(res.error || 'Failed to change password');
      setBanner({ type: 'success', message: 'Password updated successfully ✓' });
      setToast({ type: 'success', message: 'Password updated successfully' });
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      // Backend errors like "Current password is incorrect" surface here.
      const msg = err.message || 'Failed to change password';
      setBanner({ type: 'error', message: msg });
      setToast({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const CHECK_ITEMS = [
    ['length',    'At least 8 characters'],
    ['uppercase', 'One uppercase letter'],
    ['lowercase', 'One lowercase letter'],
    ['number',    'One number'],
    ['special',   'One special character (@$!%*?&)'],
  ];

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <form onSubmit={handleSave} className="max-w-xl space-y-5">
        {/* Persistent result banner — stays until the next attempt */}
        {banner && (
          <div className={`flex items-start gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${
            banner.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-[#fef2f2] border-[#fca5a5] text-[#b91c1c]'
          }`}>
            {banner.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {banner.message}
          </div>
        )}

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
            {/* Live requirement checklist under the new password */}
            {f.key === 'next' && form.next && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                {CHECK_ITEMS.map(([key, label]) => (
                  <div key={key} className={`flex items-center gap-1.5 text-xs ${pwChecks[key] ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="w-3 h-3 shrink-0" /> {label}
                  </div>
                ))}
              </div>
            )}
            {f.key === 'confirm' && form.confirm && form.next !== form.confirm && (
              <p className="mt-1 text-xs text-[#ef4444]">Passwords do not match</p>
            )}
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
