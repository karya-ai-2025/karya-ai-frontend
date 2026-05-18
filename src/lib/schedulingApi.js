const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

/**
 * Books a 30-minute onboarding call.
 * @param {{ dateTime: string, timezone: string, source: string }} params
 *   dateTime — ISO 8601 string, e.g. "2026-05-10T09:00:00"
 *   timezone — IANA timezone, e.g. "Asia/Kolkata"
 *   source   — "onboarding-owner" | "onboarding-expert"
 */
export async function bookCall({ dateTime, timezone, source }) {
  const token = getToken();
  const res = await fetch(`${API_URL}/scheduling/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ dateTime, timezone, source }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to book call');
  return json; // { success, data: { scheduledCall, meetLink, isMock } }
}

/**
 * Returns the current user's latest scheduled call, or null if none.
 */
export async function getMyCall() {
  const token = getToken();
  const res = await fetch(`${API_URL}/scheduling/my`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch call');
  return json; // { success, data: call | null }
}
