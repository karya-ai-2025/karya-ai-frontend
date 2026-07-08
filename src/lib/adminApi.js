const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getAdminUserAnalytics() {
  const res  = await fetch(`${API_URL}/admin/analytics/users`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch analytics');
  return json.data;
}

export async function getAzureAnalytics() {
  const res  = await fetch(`${API_URL}/admin/analytics/azure`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch Azure analytics');
  return json.data;
}

// Product analytics (MongoDB) — one helper per dashboard section.
export async function getProductAnalytics(section, query = '') {
  const res  = await fetch(`${API_URL}/admin/analytics/${section}${query}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `Failed to fetch analytics: ${section}`);
  return json.data;
}

export async function createCatalogProject(payload) {
  const res  = await fetch(`${API_URL}/admin/catalog`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create project');
  return json.data;
}
