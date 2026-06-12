'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, RefreshCw, Mail, Sparkles, Wand2, Send, Save, Inbox, User, ArrowLeft,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function timeAgo(d) {
  if (!d) return '';
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function RequestCard({ req, onRegenerate, onSend, busy }) {
  const [subject, setSubject] = useState(req.payload?.subject || '');
  const [body, setBody] = useState(req.payload?.body || '');
  const [expertNote, setExpertNote] = useState('');
  const ctx = req.context || {};
  const owner = req.userId;

  // Keep local fields in sync when a regenerate updates the request.
  useEffect(() => {
    setSubject(req.payload?.subject || '');
    setBody(req.payload?.body || '');
  }, [req.payload?.subject, req.payload?.body]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 flex-shrink-0">
            <User className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {owner?.fullName || owner?.email || 'User'}
            </p>
            <p className="text-[11px] text-gray-400">
              {req.projectSlug || 'project'} · requested {timeAgo(req.createdAt)}
              {req.revisionCount > 0 ? ` · revision #${req.revisionCount}` : ''}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full flex-shrink-0">
          With expert
        </span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Context the user gave */}
        <div className="flex flex-wrap gap-2">
          {['tone', 'company', 'audience', 'product', 'cta'].map((k) =>
            ctx[k] ? (
              <span key={k} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                <span className="text-gray-400">{k}:</span> {ctx[k]}
              </span>
            ) : null
          )}
        </div>

        {req.reviewerNote && (
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-[12px] text-amber-800">
            <span className="font-semibold">User note:</span> {req.reviewerNote}
          </div>
        )}

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={9}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Note to the user (optional)</label>
          <input
            value={expertNote}
            onChange={(e) => setExpertNote(e.target.value)}
            placeholder="e.g. Tightened the opener and softened the CTA."
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
        <button
          disabled={busy}
          onClick={() => onRegenerate(req._id, { guidance: req.reviewerNote })}
          className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors disabled:opacity-40"
        >
          {busy === `regen-${req._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          Regenerate (Claude)
        </button>
        <button
          disabled={busy}
          onClick={() => onSend(req._id, { subject, body, expertNote, status: null })}
          className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          {busy === `save-${req._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save changes
        </button>
        <button
          disabled={busy}
          onClick={() => onSend(req._id, { subject, body, expertNote, status: 'awaiting_user' })}
          className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-40"
        >
          {busy === `send-${req._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send to user
        </button>
      </div>
    </div>
  );
}

function AdminEmailApprovals() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/hitl/admin/list?status=with_expert`, {
        headers: authHeaders(),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch (e) {
      console.error('Failed to load requests:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRegenerate = async (id, payload) => {
    try {
      setBusy(`regen-${id}`);
      const res = await fetch(`${apiBaseUrl}/hitl/admin/${id}/regenerate`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload || {}),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.map((r) => (r._id === id ? data.data : r)));
      }
    } catch (e) {
      console.error('Regenerate failed:', e);
    } finally {
      setBusy(null);
    }
  };

  const handleSend = async (id, { subject, body, expertNote, status }) => {
    try {
      setBusy(`${status === 'awaiting_user' ? 'send' : 'save'}-${id}`);
      const res = await fetch(`${apiBaseUrl}/hitl/admin/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ subject, body, expertNote, ...(status ? { status } : {}) }),
      });
      const data = await res.json();
      if (data.success) {
        if (status === 'awaiting_user') setItems((prev) => prev.filter((r) => r._id !== id));
        else setItems((prev) => prev.map((r) => (r._id === id ? data.data : r)));
      }
    } catch (e) {
      console.error('Send failed:', e);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => router.push('/admin')} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin
        </button>

        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> Email expert review
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Outbound emails users sent for refinement. Edit or regenerate, then send back for their approval.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
            <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700">No emails waiting for review</p>
            <p className="text-xs text-gray-500 mt-1">When a user asks for expert help on a draft, it shows up here.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((req) => (
              <RequestCard key={req._id} req={req} onRegenerate={handleRegenerate} onSend={handleSend} busy={busy} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <AdminEmailApprovals />
    </AdminGuard>
  );
}
