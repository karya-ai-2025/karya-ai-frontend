// Client for the admin infrastructure dashboard.
// Every call is server-authenticated with the admin JWT; no Azure credential
// ever reaches the browser — the backend holds them.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function authHeaders(json = false) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const err = new Error(json.message || `Request failed (HTTP ${res.status})`);
    err.status = res.status;
    throw err;
  }
  return json.data;
}

const BASE = `${API_URL}/admin/infrastructure`;

/** Everything the dashboard needs, in one call. */
export async function fetchOverview({ window = '24h', force = false } = {}) {
  const qs = new URLSearchParams({ window, ...(force ? { force: 'true' } : {}) });
  return handle(await fetch(`${BASE}/overview?${qs}`, { headers: authHeaders(), cache: 'no-store' }));
}

/** Recent errors, filterable by time window and 4xx/5xx. */
export async function fetchErrors({ window = '24h', kind = 'all' } = {}) {
  const qs = new URLSearchParams({ window, kind });
  return handle(await fetch(`${BASE}/errors?${qs}`, { headers: authHeaders(), cache: 'no-store' }));
}

/** Azure cost over a selectable range. */
export async function fetchCost({ days = 30 } = {}) {
  const qs = new URLSearchParams({ days: String(days) });
  return handle(await fetch(`${BASE}/cost?${qs}`, { headers: authHeaders(), cache: 'no-store' }));
}

/** Which integrations are configured, and the Azure roles they need. */
export async function fetchConfig() {
  return handle(await fetch(`${BASE}/config`, { headers: authHeaders(), cache: 'no-store' }));
}

/** Drop the server-side cache so the next read is live. */
export async function refreshNow() {
  return handle(await fetch(`${BASE}/refresh`, { method: 'POST', headers: authHeaders(true) }));
}

// ── Presentation helpers ────────────────────────────────────────────────────
// §4's four states. No invented scores or rankings.

export const STATUS_META = {
  healthy:  { dot: '🟢', label: 'Healthy',  chip: 'bg-green-50 text-green-700 border-green-200' },
  warning:  { dot: '🟡', label: 'Warning',  chip: 'bg-amber-50 text-amber-700 border-amber-200' },
  critical: { dot: '🔴', label: 'Critical', chip: 'bg-red-50 text-red-700 border-red-200' },
  unknown:  { dot: '⚪', label: 'Unknown',  chip: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export const statusMeta = (s) => STATUS_META[s] || STATUS_META.unknown;

/** "2 minutes ago" for the Last updated line (§21). */
export function timeAgo(iso) {
  if (!iso) return 'never';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/** Format money in whatever currency Azure reported — never assume INR (§6). */
export function money(amount, currency) {
  if (amount == null) return '—';
  if (!currency || currency === 'Unknown') return Number(amount).toLocaleString();
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toLocaleString()}`;
  }
}
