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
  if (!res.ok || json.success === false) {
    const err = new Error(json.message || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return json;
}

/** All transcripts, newest first. Optional status filter. */
export async function fetchTranscripts({ status, page = 1, limit = 50 } = {}) {
  const qs = new URLSearchParams({ page, limit, ...(status ? { status } : {}) });
  const res = await fetch(`${API_URL}/transcripts?${qs}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  return handle(res);
}

/**
 * One transcript, looked up by its scheduled call id.
 * Returns { transcript, currentProfile } — currentProfile is what the user's
 * record already holds, so the form can show existing values.
 */
export async function fetchTranscriptByCall(callId) {
  const res = await fetch(`${API_URL}/transcripts/${callId}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  const json = await handle(res);
  return { transcript: json.data, currentProfile: json.currentProfile || null };
}

/** Re-run Claude extraction over the stored transcript text. */
export async function extractTranscript(transcriptId) {
  const res = await fetch(`${API_URL}/transcripts/${transcriptId}/extract`, {
    method: 'POST',
    headers: authHeaders(true),
  });
  return handle(res);
}

/** Approve the (edited) extraction and write it onto the user's profile. */
export async function applyTranscript(transcriptId, extractedData, overwrite = false) {
  const res = await fetch(`${API_URL}/transcripts/${transcriptId}/apply`, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: JSON.stringify({ extractedData, overwrite }),
  });
  return handle(res);
}

export const TRANSCRIPT_STATUS = {
  pending:   { label: 'Pending',      theme: 'bg-gray-100 text-gray-700 border-gray-200' },
  fetching:  { label: 'Fetching',     theme: 'bg-blue-50 text-blue-700 border-blue-200' },
  extracted: { label: 'Needs review', theme: 'bg-amber-50 text-amber-700 border-amber-200' },
  applied:   { label: 'Applied',      theme: 'bg-green-50 text-green-700 border-green-200' },
  failed:    { label: 'Failed',       theme: 'bg-red-50 text-red-700 border-red-200' },
};
