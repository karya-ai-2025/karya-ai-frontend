const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

// Submit a new negotiation for a project (one per project ever)
export async function submitNegotiation({ projectSlug, tierId, originalDeliverables, modifiedDeliverables, userNote }) {
  const token = getToken();
  const res = await fetch(`${API_URL}/negotiations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ projectSlug, tierId, originalDeliverables, modifiedDeliverables, userNote }),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || 'Failed to submit negotiation');
    err.status = res.status;
    err.data = json.data;
    throw err;
  }
  return json;
}

// Get the logged-in user's negotiation for a specific project (returns null if none)
export async function getMyNegotiation(projectSlug) {
  const token = getToken();
  const res = await fetch(`${API_URL}/negotiations/my/${projectSlug}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch negotiation');
  const json = await res.json();
  return json.data.negotiation;
}

// Get all negotiations — used by the admin review page
export async function getAllNegotiations() {
  const res = await fetch(`${API_URL}/negotiations`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch negotiations');
  const json = await res.json();
  return json.data.negotiations || [];
}

// Approve or reject a negotiation — used by the admin review page
export async function updateNegotiationStatus(id, status) {
  const res = await fetch(`${API_URL}/negotiations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update negotiation');
  return res.json();
}

// Permanently delete a negotiation — allows the user to re-submit
export async function deleteNegotiation(id) {
  const res = await fetch(`${API_URL}/negotiations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear negotiation');
  return res.json();
}
