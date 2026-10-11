'use client';

// Accepting a team invitation.
//
// Reached from the link in the invitation email. The company, role and email
// address all come from the invitation — the person only chooses a name and a
// password. Submitting creates their account inside that organization, so
// there is no account-type question and no company onboarding — they go on
// to the short member orientation at /onboarding-member.

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, AlertTriangle, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { lookupInvite } from '@/lib/organizationApi';

const ROLE_LABEL = { admin: 'Admin', manager: 'Manager', employee: 'Employee' };

// Same rules the backend enforces in validators/authValidators.js.
const validate = ({ fullName, phone, password, confirmPassword }) => {
  if (fullName.trim().length < 2) return 'Please enter your full name';
  if (phone.trim() && !/^[+]?[0-9]{10,15}$/.test(phone.replace(/[\s().-]/g, ''))) return 'Enter a valid phone number';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must contain an uppercase letter, a lowercase letter and a number';
  }
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

const inputClass =
  'w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/50 transition-all disabled:opacity-50';

export default function AcceptInvitePage() {
  const router = useRouter();
  const { token } = useParams();
  const { isAuthenticated, loading: authLoading, register, logout } = useAuth();

  const [invite, setInvite] = useState(null);
  const [inviteError, setInviteError] = useState('');
  const [loadingInvite, setLoadingInvite] = useState(true);

  const [form, setForm] = useState({ fullName: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  // Set once this page has created the account, so the "already signed in"
  // notice below does not flash before the redirect.
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    let cancelled = false;
    lookupInvite(token)
      .then((data) => { if (!cancelled) setInvite(data); })
      .catch((err) => { if (!cancelled) setInviteError(err.message || 'This invitation is invalid or has expired'); })
      .finally(() => { if (!cancelled) setLoadingInvite(false); });
    return () => { cancelled = true; };
  }, [token]);

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate(form);
    if (problem) { setError(problem); return; }

    setSubmitting(true);
    setError('');
    const result = await register({
      fullName: form.fullName.trim(),
      email: invite.email,
      password: form.password,
      phone: form.phone.trim() || undefined,
      inviteToken: token,
    });

    if (!result.success) {
      setError(result.error || 'Could not accept the invitation. Please try again.');
      setSubmitting(false);
      return;
    }

    setJoined(true);
    // A short orientation — company, role, what it allows — before the workspace.
    router.replace('/onboarding-member');
  };

  let body;
  if (loadingInvite || authLoading) {
    body = (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
      </div>
    );
  } else if (inviteError) {
    body = (
      <div className="text-center py-6">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-800 mb-1">{inviteError}</p>
        <p className="text-xs text-gray-500 mb-5">Ask the person who invited you to send a new invitation.</p>
        <Link href="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Go to sign in</Link>
      </div>
    );
  } else if (isAuthenticated && !joined) {
    // An invitation creates a new account; it cannot be attached to the one
    // already signed in on this browser.
    body = (
      <div className="text-center py-6">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-800 mb-1">You&apos;re already signed in</p>
        <p className="text-xs text-gray-500 mb-5">
          This invitation is for <strong>{invite.email}</strong>. Sign out first to accept it.
        </p>
        <button
          onClick={() => logout()}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    );
  } else {
    body = (
      <>
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            {invite.invitedBy ? <><strong>{invite.invitedBy}</strong> invited you</> : <>You&apos;ve been invited</>} to join{' '}
            <strong>{invite.organizationName}</strong> as <strong>{ROLE_LABEL[invite.role] || invite.role}</strong>.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="email" value={invite.email} readOnly disabled className={`${inputClass} bg-gray-50`} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Full Name <span className="text-[#ef4444]">*</span></label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange} disabled={submitting}
                autoComplete="name" placeholder="Your name" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Phone <span className="text-gray-400 text-xs ml-1">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} disabled={submitting}
                autoComplete="tel" placeholder="+91 98765 43210" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Password <span className="text-[#ef4444]">*</span></label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                disabled={submitting} autoComplete="new-password" placeholder="At least 8 characters" className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Confirm Password <span className="text-[#ef4444]">*</span></label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange} disabled={submitting} autoComplete="new-password" placeholder="Repeat your password" className={inputClass} />
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer">
            {submitting ? 'Joining…' : <>Join {invite.organizationName} <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/karya-ai-logo.png" alt="Karya AI" width={44} height={44} className="rounded-xl object-contain" />
            <span className="text-xl font-black text-gray-900">Karya-AI</span>
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-black text-gray-900 mb-5">Accept your invitation</h1>
          {body}
        </div>
      </div>
    </div>
  );
}
