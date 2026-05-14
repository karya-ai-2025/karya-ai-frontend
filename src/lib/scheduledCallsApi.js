const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getAllScheduledCalls() {
  const res  = await fetch(`${API_URL}/scheduling/all`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch calls');
  return json.data;
}

export async function getMyScheduledCall() {
  const res  = await fetch(`${API_URL}/scheduling/my`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch call');
  return json.data;
}

export async function markCallComplete(id) {
  const res  = await fetch(`${API_URL}/scheduling/${id}/complete`, {
    method:  'PATCH',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to mark complete');
  return json.data;
}
