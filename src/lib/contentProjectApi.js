const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// User helpers
export async function getMyContentProjects() {
  const res = await fetch(`${API_URL}/content-projects/my`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to load projects');
  const { data } = await res.json();
  return data.projects;
}

export async function getMyContentProject(catalogId) {
  const projects = await getMyContentProjects();
  if (catalogId) {
    return projects.find(p => (p.catalog?._id || p.catalogId) === catalogId) ?? projects[0] ?? null;
  }
  return projects[0] ?? null;
}

export async function createContentProject(catalogId) {
  const res = await fetch(`${API_URL}/content-projects`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ catalogId: catalogId || null }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to create project');
  const { data } = await res.json();
  return data.project;
}

export async function submitIntake(id, intake) {
  const res = await fetch(`${API_URL}/content-projects/${id}/intake`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(intake),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to submit intake');
  const { data } = await res.json();
  return data.project;
}

export async function getPreview(id) {
  const res = await fetch(`${API_URL}/content-projects/${id}/preview`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).message || 'Not ready yet');
  const { data } = await res.json();
  return data;
}

export async function approveContent(id, note = '') {
  const res = await fetch(`${API_URL}/content-projects/${id}/approve`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ note }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to approve');
  return (await res.json()).data.project;
}

export async function rejectContent(id, note) {
  const res = await fetch(`${API_URL}/content-projects/${id}/reject`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ note }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to submit revision');
  return (await res.json()).data.project;
}

export async function getMyBusinessProfile() {
  try {
    const res = await fetch(`${API_URL}/profiles/business`, { headers: authHeaders() });
    if (!res.ok) return null;
    const body = await res.json();
    return body.profile || null;
  } catch {
    return null;
  }
}

// Admin helpers
export async function adminGetAllProjects(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/content-projects/admin${qs ? `?${qs}` : ''}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to load');
  return (await res.json()).data;
}

export async function adminGetProject(id) {
  const res = await fetch(`${API_URL}/content-projects/admin/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).message || 'Not found');
  return (await res.json()).data.project;
}

export async function adminUpdateVersion(id, versionNumber, body) {
  const res = await fetch(`${API_URL}/content-projects/admin/${id}/version/${versionNumber}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to update');
  return (await res.json()).data.version;
}

export async function adminSaveNotes(id, adminNotes) {
  const res = await fetch(`${API_URL}/content-projects/admin/${id}/admin-notes`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ adminNotes }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to save');
  return (await res.json()).data;
}

export async function adminSendToClient(id) {
  const res = await fetch(`${API_URL}/content-projects/admin/${id}/send-to-client`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to send to client');
  return (await res.json()).data.project;
}

export async function adminDeliverProject(id, note = '') {
  const res = await fetch(`${API_URL}/content-projects/admin/${id}/deliver`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ note }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to deliver');
  return (await res.json()).data.project;
}
