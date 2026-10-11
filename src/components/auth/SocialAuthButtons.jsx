'use client';

// "Continue with Google / LinkedIn" buttons for the login and register pages.
//
// Social sign-in is a full-page redirect, not a fetch: the browser goes to the
// backend at /api/auth/<provider>?role=owner|expert, on to the provider's
// consent screen, and comes back to /auth/<provider>/callback with a token.
// The backend works out which frontend to return to from the Referer header,
// so these must be real navigations from this site.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Where to send someone after a social sign-in that started on a page with
// ?redirect=… — read back by the callback page. sessionStorage so it lasts
// across the round trip to the provider but not beyond this tab.
export const POST_LOGIN_REDIRECT_KEY = 'postLoginRedirect';

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
  </svg>
);

const LinkedInLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path fill="#0A66C2" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const PROVIDERS = [
  { id: 'google', name: 'Google', Logo: GoogleLogo },
  { id: 'linkedin', name: 'LinkedIn', Logo: LinkedInLogo },
];

/**
 * @param {'owner'|'expert'} role     which side of the platform they are signing in to
 * @param {boolean} [disabled]        e.g. while the email form is submitting
 */
export default function SocialAuthButtons({ role, disabled = false }) {
  const start = (provider) => {
    try {
      const redirectTo = new URLSearchParams(window.location.search).get('redirect');
      if (redirectTo) sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, redirectTo);
      else sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    } catch {
      // sessionStorage unavailable (private mode) — they land on the dashboard instead
    }
    window.location.assign(`${API_URL}/auth/${provider}?role=${encodeURIComponent(role)}`);
  };

  return (
    <div>
      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROVIDERS.map(({ id, name, Logo }) => (
          <button
            key={id}
            type="button"
            onClick={() => start(id)}
            disabled={disabled}
            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Logo />
            Continue with {name}
          </button>
        ))}
      </div>
    </div>
  );
}
