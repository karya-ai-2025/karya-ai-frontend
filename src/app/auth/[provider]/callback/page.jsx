'use client';

// Landing page for "Continue with Google / LinkedIn".
//
// The backend finishes the OAuth exchange and redirects here with either
//   #token=<jwt>&role=owner|expert[&new=1]   — signed in
//   ?error=<code>                            — something went wrong
// The token arrives in the URL fragment so it never reaches a server log; it
// is taken out of the address bar as soon as it has been read.

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { POST_LOGIN_REDIRECT_KEY } from '@/components/auth/SocialAuthButtons';

const PROVIDER_NAME = { google: 'Google', linkedin: 'LinkedIn' };

// Codes sent by controllers/socialAuthController.js on the backend.
const ERROR_MESSAGE = {
  cancelled: 'Sign-in was cancelled. You can try again whenever you like.',
  denied: 'Access was denied. Please try again and allow access to your name and email.',
  invalid_state: 'This sign-in link expired or was opened in a different browser. Please try again.',
  email_required: 'We could not read an email address from your account, so we cannot sign you in this way.',
  email_not_verified: 'An account with this email already exists, but your provider has not verified the address. Sign in with your password instead.',
  account_deactivated: 'This account has been deactivated. Please contact support.',
  not_configured: 'This sign-in method is not available right now. Please use your email and password.',
  failed: 'Something went wrong while signing you in. Please try again.',
};

const ONBOARDING_ROUTE = {
  owner: '/onboarding-owner/welcome',
  expert: '/onboarding-expert/welcome',
};

// Only ever follow a redirect back into this site.
const safeInternalPath = (value) =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : null;

export default function SocialAuthCallbackPage() {
  const router = useRouter();
  const { provider } = useParams();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');
  // React Strict Mode runs effects twice in dev; the fragment is gone the second time.
  const handled = useRef(false);

  const providerName = PROVIDER_NAME[provider] || 'your account';

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const query = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = fragment.get('token');
    const role = fragment.get('role') === 'expert' ? 'expert' : 'owner';
    const isNewUser = fragment.get('new') === '1';

    // Take the token out of the address bar and browser history.
    window.history.replaceState(null, '', window.location.pathname);

    const errorCode = query.get('error');
    if (errorCode || !token) {
      setError(ERROR_MESSAGE[errorCode] || ERROR_MESSAGE.failed);
      return;
    }

    (async () => {
      const result = await loginWithToken(token);
      if (!result.success) {
        setError(result.error || ERROR_MESSAGE.failed);
        return;
      }

      let redirectTo = null;
      try {
        redirectTo = safeInternalPath(sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY));
        sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      } catch {
        // sessionStorage unavailable — fall through to the default destination
      }

      if (isNewUser) router.replace(ONBOARDING_ROUTE[role]);
      else router.replace(redirectTo || (role === 'expert' ? '/expert-dashboard' : '/business-dashboard'));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Image src="/karya-ai-logo.png" alt="Karya AI" width={44} height={44} className="rounded-xl object-contain" />
          <span className="text-xl font-black text-gray-900">Karya-AI</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm text-center">
          {error ? (
            <>
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h1 className="text-lg font-bold text-gray-900 mb-2">We couldn&apos;t sign you in with {providerName}</h1>
              <p className="text-sm text-gray-500 mb-6">{error}</p>
              <Link
                href="/login"
                className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
              <h1 className="text-lg font-bold text-gray-900 mb-1">Signing you in…</h1>
              <p className="text-sm text-gray-500">Finishing up with {providerName}.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
