'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, Check, AlertCircle, ShieldCheck } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token;

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ password: false, confirmPassword: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      // Store token and redirect
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }

      setSuccess(true);
      setTimeout(() => router.push('/login?reset=success'), 2500);
    } catch (err) {
      setError(err.message || 'Something went wrong. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (pw) => {
    if (!pw) return null;
    if (pw.length < 6) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
    if (pw.length < 8) return { label: 'Fair', color: 'bg-orange-500', width: 'w-2/4' };
    if (pw.length < 12 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Good', color: 'bg-yellow-500', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
  };

  const strength = passwordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl mb-4 shadow-lg">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-gray-600 mt-2 text-sm">
            Choose a strong password for your account.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Password Reset!</h2>
              <p className="text-gray-600 text-sm mb-6">
                Your password has been updated successfully. Redirecting you to login...
              </p>
              <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 text-sm">{error}</p>
                    {error.toLowerCase().includes('expired') && (
                      <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline mt-1 block">
                        Request a new reset link →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type={showPw.password ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                      className="pl-10 pr-10 w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Minimum 8 characters"
                      required />
                    <button type="button" onClick={() => setShowPw(p => ({ ...p, password: !p.password }))}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                      {showPw.password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${strength?.color} ${strength?.width} transition-all duration-300 rounded-full`} />
                      </div>
                      <p className={`text-xs mt-1 ${strength?.color === 'bg-green-500' ? 'text-green-600' : strength?.color === 'bg-red-500' ? 'text-red-600' : 'text-orange-600'}`}>
                        {strength?.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type={showPw.confirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
                      className={`pl-10 pr-10 w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 text-sm ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Repeat new password"
                      required />
                    <button type="button" onClick={() => setShowPw(p => ({ ...p, confirmPassword: !p.confirmPassword }))}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                      {showPw.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg font-medium hover:from-blue-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
