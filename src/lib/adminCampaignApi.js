// Client for the admin "build a campaign for a customer" flow.
//
// Every call is admin-authenticated server-side. The campaign that comes back
// belongs to the CUSTOMER — the admin is only the author of record.

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
    err.payload = json;
    throw err;
  }
  return json;
}

const BASE = `${API_URL}/admin/campaigns`;

// ── Choosing the customer ───────────────────────────────────────────────────

/** Search customers by name or email. Includes their credit balance. */
export async function searchCustomers(q = '') {
  const qs = new URLSearchParams(q ? { q } : {});
  const json = await handle(
    await fetch(`${BASE}/users?${qs}`, { headers: authHeaders(), cache: 'no-store' })
  );
  return json.data || [];
}

/** Credits, saved lead lists and existing templates for one customer. */
export async function fetchCustomerContext(userId) {
  const json = await handle(
    await fetch(`${BASE}/users/${userId}/context`, { headers: authHeaders(), cache: 'no-store' })
  );
  return json.data;
}

/** Expand one of the customer's saved lists into campaign-ready leads. */
export async function fetchSavedList(userId, listId) {
  const json = await handle(
    await fetch(`${BASE}/users/${userId}/saved-list/${listId}`, {
      headers: authHeaders(),
      cache: 'no-store',
    })
  );
  return json.data;
}

// ── The customer's email template library ───────────────────────────────────

/** Every active template the customer has, bodies included. */
export async function fetchCustomerTemplates(userId) {
  const json = await handle(
    await fetch(`${BASE}/users/${userId}/templates`, { headers: authHeaders(), cache: 'no-store' })
  );
  return json.data || [];
}

/** Write a new template into the customer's library. */
export async function createCustomerTemplate(userId, payload) {
  const json = await handle(
    await fetch(`${BASE}/users/${userId}/templates`, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    })
  );
  return json.data;
}

/**
 * Upload a file for one of the customer's templates (PDF, DOCX, image, HTML…).
 * Stored under the CUSTOMER'S namespace, so the template owner owns the file.
 * Returns the attachment metadata to put in the template's `attachments`.
 */
export async function uploadCustomerTemplateAttachment(userId, file) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const body = new FormData();
  body.append('attachment', file);

  const json = await handle(
    await fetch(`${BASE}/users/${userId}/template-attachments`, {
      method: 'POST',
      // No Content-Type — the browser sets the multipart boundary itself.
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body,
    })
  );
  return json.data;
}

/** Edit one of the customer's templates. */
export async function updateCustomerTemplate(userId, templateId, payload) {
  const json = await handle(
    await fetch(`${BASE}/users/${userId}/templates/${templateId}`, {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    })
  );
  return json.data;
}

/** Remove a template from the library (deactivated, not destroyed). */
export async function deleteCustomerTemplate(userId, templateId) {
  return handle(
    await fetch(`${BASE}/users/${userId}/templates/${templateId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  );
}

// ── The customer's saved lead lists ─────────────────────────────────────────

/** Save a set of leads as a reusable list in the customer's account. */
export async function createCustomerLeadList(userId, payload) {
  const json = await handle(
    await fetch(`${BASE}/users/${userId}/lead-lists`, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    })
  );
  return json.data;
}

/** Delete one of the customer's saved lists. */
export async function deleteCustomerLeadList(userId, listId) {
  return handle(
    await fetch(`${BASE}/users/${userId}/lead-lists/${listId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  );
}

// ── Finding leads ───────────────────────────────────────────────────────────

/**
 * Search the lead database on the customer's behalf. Free — credits are only
 * charged per email at send time, against their plan.
 */
export async function searchLeadsFor(payload) {
  const json = await handle(
    await fetch(`${BASE}/leads/search`, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    })
  );
  return json.data;
}

// ── The campaign ────────────────────────────────────────────────────────────

/** Create the campaign, its four templates, and its lead list. */
export async function createCampaignFor(payload) {
  return handle(
    await fetch(BASE, {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    })
  );
}

/** Campaigns admins have built for customers. */
export async function fetchAdminCampaigns({ targetUserId, mine } = {}) {
  const qs = new URLSearchParams({
    ...(targetUserId ? { targetUserId } : {}),
    ...(mine ? { mine: 'true' } : {}),
  });
  const json = await handle(
    await fetch(`${BASE}?${qs}`, { headers: authHeaders(), cache: 'no-store' })
  );
  return json.data || [];
}

/** One campaign in full: recipients, all four emails, ICP state, billing. */
export async function fetchAdminCampaign(campaignId) {
  const json = await handle(
    await fetch(`${BASE}/${campaignId}`, { headers: authHeaders(), cache: 'no-store' })
  );
  return json.data;
}

/**
 * Revise a campaign. Send only the fields being changed — recipients and
 * emails are refused once sending has begun (409).
 */
export async function updateAdminCampaign(campaignId, payload) {
  return handle(
    await fetch(`${BASE}/${campaignId}`, {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    })
  );
}

/** Start a customer's campaign. Requires an approved ICP — 409 if not. */
export async function startCampaignFor(campaignId) {
  return handle(
    await fetch(`${BASE}/${campaignId}/start`, {
      method: 'POST',
      headers: authHeaders(true),
    })
  );
}

// ── Shared shapes ───────────────────────────────────────────────────────────

/**
 * The four emails a campaign is made of. Mirrors SEQUENCE_KEYS on the server
 * and the sequence the ICP asks the customer to approve, so what is written
 * here is what they see.
 */
export const SEQUENCE_STEPS = [
  { key: 'initial',   label: 'First email',                   audience: 'Everyone on the list',                 required: true },
  { key: 'follow_up', label: 'Follow-up (they opened it)',    audience: 'Only those who opened the first email', required: false },
  { key: 'recall',    label: 'Recall (they did not open it)', audience: 'Only those who did not open it',        required: false },
  { key: 'final',     label: 'Final call',                    audience: 'Everyone who has not replied',          required: false },
];

export const CAMPAIGN_STATUS_THEME = {
  draft:     'bg-gray-100 text-gray-700 border-gray-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  sending:   'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  paused:    'bg-orange-50 text-orange-700 border-orange-200',
  failed:    'bg-red-50 text-red-700 border-red-200',
};

export const ICP_STATE = {
  none:               { label: 'No ICP yet',         theme: 'bg-gray-100 text-gray-600 border-gray-200' },
  draft:              { label: 'ICP draft',          theme: 'bg-gray-100 text-gray-700 border-gray-200' },
  awaiting_user:      { label: 'Awaiting approval',  theme: 'bg-amber-50 text-amber-700 border-amber-200' },
  revision_requested: { label: 'Changes requested',  theme: 'bg-red-50 text-red-700 border-red-200' },
  approved:           { label: 'Approved',           theme: 'bg-green-50 text-green-700 border-green-200' },
};

export const icpState = (status) => ICP_STATE[status || 'none'] || ICP_STATE.none;
