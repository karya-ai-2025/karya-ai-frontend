'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Check, AlertCircle, Loader2, Mail, ArrowRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token;

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Invalid verification link');
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/verify-email/${token}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Email verification failed');
        }

        setStatus('success');

        // Update stored user if available
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Redirect after 3 seconds
        setTimeout(() => {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            router.push('/business-dashboard');
          } else {
            router.push('/login?verified=1');
          }
        }, 3000);
      } catch (err) {
        setStatus('error');
        setError(err.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl mb-4 shadow-lg">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Email Verification</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          {status === 'verifying' && (
            <div className="py-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying your email...</h2>
              <p className="text-gray-500 text-sm">Please wait while we confirm your email address.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 text-sm mb-6">
                Your email has been verified successfully. You're all set!
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting to dashboard...
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="py-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 text-sm mb-6">{error}</p>
              <div className="space-y-3">
                <Link href="/settings?section=account"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-orange-600 transition-all">
                  Resend Verification Email <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login"
                  className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
