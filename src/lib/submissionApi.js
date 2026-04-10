const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function createSubmission(data) {
  const res = await fetch(`${API_URL}/submissions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit project brief');
  return res.json();
}

export async function fetchMySubmissions() {
  const res = await fetch(`${API_URL}/submissions/my`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch submissions');
  const json = await res.json();
  return json.data.submissions;
}

export async function fetchSubmission(id) {
  const res = await fetch(`${API_URL}/submissions/${id}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Submission not found');
  const json = await res.json();
  return json.data.submission;
}
