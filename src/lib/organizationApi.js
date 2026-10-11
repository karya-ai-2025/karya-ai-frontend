// Enterprise organization API — the company, its members and its invitations.
// Only enterprise accounts can call these; individual accounts get a 403.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const BASE = `${API_URL}/organizations`;

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
    throw err;
  }
  return json;
}

const post = (path, body) =>
  fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(body || {}),
  }).then(handle);

// ── The organization ────────────────────────────────────────────────────────

/** The caller's organization, role, capabilities and which roles they may invite. */
export async function fetchMyOrganization() {
  const json = await fetch(`${BASE}/me`, { headers: authHeaders(), cache: 'no-store' }).then(handle);
  return json.data;
}

export async function renameOrganization(name) {
  const res = await fetch(`${BASE}/me`, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: JSON.stringify({ name }),
  });
  return handle(res);
}

// ── Members ─────────────────────────────────────────────────────────────────

/** Everyone in the organization, pending invitations included. */
export async function fetchMembers() {
  const json = await fetch(`${BASE}/members`, { headers: authHeaders(), cache: 'no-store' }).then(handle);
  return json.data || [];
}

export async function changeMemberRole(membershipId, role) {
  const res = await fetch(`${BASE}/members/${membershipId}`, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: JSON.stringify({ role }),
  });
  return handle(res);
}

export const suspendMember = (membershipId) => post(`/members/${membershipId}/suspend`);
export const reactivateMember = (membershipId) => post(`/members/${membershipId}/reactivate`);

// ── Invitations ─────────────────────────────────────────────────────────────

export const inviteMember = (email, role) => post('/invites', { email, role });
export const resendInvite = (membershipId) => post(`/invites/${membershipId}/resend`);

export async function revokeInvite(membershipId) {
  const res = await fetch(`${BASE}/invites/${membershipId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handle(res);
}

/** Public: what an invitation link is for. Used before the person has an account. */
export async function lookupInvite(token) {
  const json = await fetch(`${BASE}/invites/lookup/${token}`, { cache: 'no-store' }).then(handle);
  return json.data;
}
