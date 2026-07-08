// Product analytics client — silent, background, never throws.
// Posts page views + events to the backend analytics ingestion endpoints.
// Attribution: sends the auth token (if present) and a per-tab session id.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// One session id per browser tab (survives route changes, resets on tab close).
const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('analyticsSessionId');
  if (!sid) {
    sid = (window.crypto?.randomUUID?.() || `s_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    sessionStorage.setItem('analyticsSessionId', sid);
  }
  return sid;
};

const post = (path, body) => {
  if (typeof window === 'undefined') return;
  try {
    const token = localStorage.getItem('token');
    const sessionId = getSessionId();
    const headers = { 'Content-Type': 'application/json', 'x-session-id': sessionId };
    if (token) headers.Authorization = `Bearer ${token}`;

    // fire-and-forget; keepalive lets it complete even as the page navigates away
    fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      keepalive: true,
      body: JSON.stringify({ ...body, sessionId, referrer: document.referrer || '' })
    }).catch(() => {});
  } catch {
    /* analytics must never affect the app */
  }
};

export const trackPage = (page, pageTitle) =>
  post('/analytics/page', {
    page: page || window.location.pathname,
    pageTitle: pageTitle || document.title || ''
  });

export const trackEvent = (eventName, metadata = {}, status = 'success') => {
  if (!eventName) return;
  post('/analytics/event', { eventName, metadata, status });
};

const analytics = { trackPage, trackEvent };
export default analytics;
