const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

// Calls are booked on Cal.com (see components/scheduling/CalBooking.jsx), which
// reports each booking to the backend through a webhook. Nothing is booked
// from here — this only reads the result.

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
