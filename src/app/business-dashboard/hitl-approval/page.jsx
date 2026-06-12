'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import {
  Lock, Check, CheckCircle2, X, ChevronRight, Sparkles, Clock,
  BadgeCheck, ShieldCheck, MessageSquare, ArrowUpRight, Loader2,
  PencilLine, CheckCheck, Inbox,
} from 'lucide-react';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ── Demo fallback (shown when there are no live approval requests) ──────────────
const DEMO_SEQUENCES = [
  {
    id: 'demo-1',
    num: 1,
    title: 'Cold outreach — SaaS founders, Series A',
    meta: '5-step sequence · 340 contacts in segment · drafted 2h ago',
    note: 'Personalized using LinkedIn headline + recent funding data. Recommend review of Step 3 — tone may be too direct for warm segments.',
    step: 'Step 1 · Day 0 · Subject line',
    subject: '"{{First name}}, quick question about your GTM motion post-raise"',
    preview: "Saw your Series A announcement — congrats. Working with a few founders on the exact problem you're likely hitting right now…",
    body: `Hi {{First name}},

Congrats on the {{funding_round}} — that growth inflection point is exciting and brutal at the same time.

Most founders I talk to at your stage are stuck choosing between hiring a full sales team or burning budget on tools that don't talk to each other. We built {{product_name}} specifically for this window.

Would a 15-min call make sense this week? I'll come prepared with a few ideas specific to {{company_name}}.

— {{sender_name}}`,
    demo: true,
  },
];

const REVIEWER_STATS = [
  { value: '94%',     label: 'Approval accuracy' },
  { value: '~4h',     label: 'Avg review time' },
  { value: '23',      label: 'Projects reviewed' },
  { value: 'US/EMEA', label: 'Region expertise' },
];

const REVIEWER_CHECKS = [
  'Checks ICP fit & personalization',
  'Reviews compliance (CAN-SPAM, GDPR)',
  'Validates tone & brand voice',
  'Approves send timing & volume',
];

const MILESTONES = [
  { label: 'ICP segment defined',                  sub: 'Mon, Jun 1',            state: 'done' },
  { label: 'Contact list enriched (427 records)',  sub: 'Tue, Jun 2',            state: 'done' },
  { label: 'AI agent drafted sequences',           sub: 'Wed, Jun 3 · 9:14am',   state: 'done' },
  { label: 'Expert HITL review — in progress',     sub: 'Now · est. 4h remaining', state: 'active' },
  { label: 'Sequences sent & tracking begins',     sub: 'Pending approval',      state: 'pending' },
  { label: 'Reply routing & AI follow-up',         sub: 'Pending approval',      state: 'pending' },
];

function timeAgo(dateStr) {
  if (!dateStr) return 'just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Map a real HITL request → the shape SequenceCard renders.
function mapRequestToSeq(r, idx) {
  const body = r.payload?.body || '';
  return {
    id: r._id,
    num: idx + 1,
    title: r.payload?.subject || r.title || 'Outbound email',
    meta: `${r.projectSlug || 'project'} · drafted ${timeAgo(r.createdAt)}`,
    note: `Tone: ${r.payload?.tone || r.context?.tone || '—'} · Audience: ${r.payload?.audience || r.context?.audience || '—'}`,
    step: 'Email draft · pending approval',
    subject: r.payload?.subject ? `"${r.payload.subject}"` : '',
    preview: body ? `${body.slice(0, 120)}${body.length > 120 ? '…' : ''}` : '',
    body,
    real: true,
  };
}

function SequenceCard({ seq, onAction, busy }) {
  const disabled = busy || !seq.real;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{seq.num}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[15px] font-bold text-gray-900 leading-snug">{seq.title}</h3>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
                {seq.demo ? 'Sample' : 'Pending review'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{seq.meta}</p>
          </div>
        </div>

        {seq.note && (
          <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex gap-2.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-indigo-800 leading-relaxed"><span className="font-semibold">AI agent note:</span> {seq.note}</p>
          </div>
        )}

        <div className="mt-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{seq.step}</p>
          {seq.subject && <p className="text-[14px] font-bold text-gray-900 mt-1.5">{seq.subject}</p>}
          {seq.preview && (
            <>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-3">Preview text</p>
              <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">{seq.preview}</p>
            </>
          )}
          <div className="border-t border-gray-100 my-4" />
          <p className="text-[13px] text-gray-700 whitespace-pre-line leading-relaxed">{seq.body}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
        <button
          disabled={disabled}
          onClick={() => onAction?.(seq.id, 'approved')}
          className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
        </button>
        <button
          disabled={disabled}
          onClick={() => onAction?.(seq.id, 'with_expert')}
          className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <PencilLine className="w-4 h-4" /> Send back to expert
        </button>
        <button
          disabled={disabled}
          onClick={() => onAction?.(seq.id, 'rejected')}
          className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <X className="w-4 h-4" /> Reject
        </button>
      </div>
    </div>
  );
}

export default function HitlApprovalPage() {
  const router = useRouter();
  const { isAuthenticated, loading, getAuthHeader } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('my-projects');
  const [note, setNote] = useState('');

  const [requests, setRequests] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [approvedMsg, setApprovedMsg] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/login?role=owner');
  }, [loading, isAuthenticated, router]);

  const fetchRequests = useCallback(async () => {
    try {
      setLoadingReqs(true);
      // These are drafts the expert has refined and sent back for the user's approval.
      const res = await fetch(`${apiBaseUrl}/hitl?status=awaiting_user`, {
        headers: { ...getAuthHeader() },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) setRequests(data.data || []);
    } catch (e) {
      console.error('Failed to load approval requests:', e);
    } finally {
      setLoadingReqs(false);
    }
  }, [getAuthHeader]);

  // On approval, save the email as a reusable template so the user can launch a campaign with it.
  const saveEmailAsTemplate = async (payload) => {
    await fetch(`${apiBaseUrl}/email-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      credentials: 'include',
      body: JSON.stringify({
        templateName: (payload?.subject || 'AI email').slice(0, 80),
        subject: payload?.subject || 'Outbound email',
        emailBody: payload?.body || '',
      }),
    });
  };

  useEffect(() => {
    if (isAuthenticated) fetchRequests();
  }, [isAuthenticated, fetchRequests]);

  const actOnRequest = async (id, status) => {
    if (!id) return;
    try {
      setActioningId(id);
      // Approving saves the refined email so the user can launch a campaign with it.
      if (status === 'approved') {
        const reqObj = requests.find((r) => r._id === id);
        if (reqObj) { try { await saveEmailAsTemplate(reqObj.payload); } catch (e) { console.error('template save failed', e); } }
      }
      const res = await fetch(`${apiBaseUrl}/hitl/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        credentials: 'include',
        body: JSON.stringify({ status, note }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.filter((r) => r._id !== id));
        setNote('');
        if (status === 'approved') setApprovedMsg('Email approved & saved. Open the AI Email Outbound project to launch a campaign with it.');
        else if (status === 'with_expert') setApprovedMsg('Sent back to the expert for another revision — you will be notified when it returns.');
      }
    } catch (e) {
      console.error('Failed to update approval:', e);
    } finally {
      setActioningId(null);
    }
  };

  if (loading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  const hasReal = requests.length > 0;
  const sequences = hasReal ? requests.map(mapRequestToSeq) : DEMO_SEQUENCES;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          {approvedMsg && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 max-w-[1500px]">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800">{approvedMsg}</p>
              <button onClick={() => setApprovedMsg('')} className="ml-auto text-green-600 hover:text-green-800"><X className="w-4 h-4" /></button>
            </div>
          )}
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Outreach</span>
            <ChevronRight className="w-3 h-3" />
            <span>Get new customers</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 font-semibold">AI Outbound Email Engine</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start max-w-[1500px]">

            {/* ── QUEUE (2/3) ───────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">HITL approval queue</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {hasReal
                      ? `${requests.length} email${requests.length !== 1 ? 's' : ''} refined by our expert — awaiting your approval`
                      : 'No approvals waiting — showing a sample of what a request looks like'}
                  </p>
                </div>
                <button
                  onClick={fetchRequests}
                  disabled={loadingReqs}
                  className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingReqs ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                  Refresh
                </button>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3">
                <Lock className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-rose-800 leading-relaxed">
                  Our expert has refined your AI draft. Review it below — <span className="font-semibold">Approve</span> to save it and unlock your campaign, or <span className="font-semibold">Send back to expert</span> with a note for another revision.
                </p>
              </div>

              {loadingReqs ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : !hasReal ? (
                <>
                  <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center">
                    <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No approval requests yet</p>
                    <p className="text-xs text-gray-500 mt-1">Drafts sent for approval from the AI Email assistant will appear here.</p>
                  </div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Sample draft</p>
                  <SequenceCard seq={DEMO_SEQUENCES[0]} />
                </>
              ) : (
                <div className="space-y-5">
                  {sequences.map((seq) => (
                    <SequenceCard
                      key={seq.id}
                      seq={seq}
                      onAction={actOnRequest}
                      busy={actioningId === seq.id}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── SIDE RAIL (1/3) — reviewer + milestones + note ─────────── */}
            <div className="space-y-5">
              {/* Reviewer */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900">Assigned reviewer</h3>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">PR</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Priya Rao</p>
                    <p className="text-[12px] text-gray-500">Sales strategist · 7 yrs GTM</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full mb-4">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified · 4+ yrs B2B SaaS sales
                </span>
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {REVIEWER_STATS.map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                      <p className="text-[15px] font-black text-gray-900 leading-none">{s.value}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {REVIEWER_CHECKS.map(c => (
                    <div key={c} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      <span className="text-[12px] text-gray-600">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCheck className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900">Project milestone status</h3>
                </div>
                <div className="space-y-3.5">
                  {MILESTONES.map((m, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        {m.state === 'done'
                          ? <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1" />
                          : m.state === 'active'
                          ? <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 mt-1" />
                          : <span className="w-2.5 h-2.5 rounded-full bg-gray-200 mt-1" />}
                        {i < MILESTONES.length - 1 && <span className="w-px flex-1 bg-gray-100 my-1" style={{ minHeight: '14px' }} />}
                      </div>
                      <div className="pb-0.5">
                        <p className={`text-[13px] font-semibold leading-snug ${m.state === 'active' ? 'text-blue-700' : m.state === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>{m.label}</p>
                        <p className="text-[11px] text-gray-400">{m.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900">Leave a note for Priya</h3>
                </div>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                  placeholder="e.g. Please pay extra attention to tone in sequence 1, step 3…"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 placeholder-gray-400 outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none" />
                <p className="mt-2 text-[11px] text-gray-400">A note is attached to whichever request you approve or send back for revision.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
