const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

function authHeaders(json = false) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || 'Request failed');
    err.status = res.status;
    err.code = json.code;
    throw err;
  }
  return json;
}

// ── Customer ────────────────────────────────────────────────────────────────

/** Every ICP for the signed-in customer's own campaigns. */
export async function fetchMyICPs() {
  const res = await fetch(`${API_URL}/icp`, { headers: authHeaders(), cache: 'no-store' });
  const json = await handle(res);
  return json.data || [];
}

/** The ICP for one campaign the customer owns. Returns null when none exists. */
export async function fetchICPForCampaign(campaignId) {
  const res = await fetch(`${API_URL}/icp/${campaignId}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  const json = await handle(res);
  return json.data || null;
}

/** Approve the ICP. */
export async function approveICP(campaignId) {
  const res = await fetch(`${API_URL}/icp/${campaignId}/review`, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: JSON.stringify({ action: 'approve' }),
  });
  return (await handle(res)).data;
}

/** Send a suggestion back to the admin. */
export async function requestICPChanges(campaignId, note) {
  const res = await fetch(`${API_URL}/icp/${campaignId}/review`, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: JSON.stringify({ action: 'request_changes', note }),
  });
  return (await handle(res)).data;
}

// ── Admin ───────────────────────────────────────────────────────────────────

/** Every ICP across all customers; ones needing action sort first. */
export async function adminFetchICPs(status) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`${API_URL}/icp/admin/list${qs}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  const json = await handle(res);
  return json.data || [];
}

export async function adminCreateICP(campaignId, payload) {
  const res = await fetch(`${API_URL}/icp/admin/${campaignId}`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });
  return (await handle(res)).data;
}

export async function adminUpdateICP(campaignId, payload) {
  const res = await fetch(`${API_URL}/icp/admin/${campaignId}`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });
  return (await handle(res)).data;
}

export const ICP_STATUS_LABEL = {
  draft: 'Draft',
  awaiting_user: 'Awaiting your approval',
  approved: 'Approved',
  revision_requested: 'Changes requested',
  archived: 'Archived',
};

export const ICP_STATUS_THEME = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  awaiting_user: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  revision_requested: 'bg-orange-50 text-orange-700 border-orange-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
};
