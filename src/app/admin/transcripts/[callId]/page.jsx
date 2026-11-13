'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2, ArrowLeft, Sparkles, Check, AlertCircle, User, Calendar,
  FileText, FlaskConical, RefreshCw, X, Lock, Mail, Phone,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import {
  fetchTranscriptByCall, extractTranscript, applyTranscript, TRANSCRIPT_STATUS,
} from '@/lib/transcriptApi';

// Mirrors CallTranscript.extractedData. `kind` drives how the field is edited,
// and `applies` marks the values that actually write to the profile —
// everything else is captured for context only.
//
// `locked` marks what the user gave us at registration. Those show the stored
// value, are read-only, and are never touched by re-extraction.
const FIELDS = [
  { key: 'name',            label: 'Full name',        kind: 'text',  applies: 'User.fullName', locked: true },
  { key: 'companyName',     label: 'Company name',     kind: 'text',  applies: 'BusinessProfile.company.name', locked: true },
  { key: 'industry',        label: 'Industry',         kind: 'text',  applies: 'BusinessProfile.industry' },
  { key: 'businessType',    label: 'Business type',    kind: 'text',  applies: 'BusinessProfile.businessType' },
  { key: 'teamSize',        label: 'Team size',        kind: 'text',  applies: 'BusinessProfile.companySize' },
  { key: 'painPoints',      label: 'Pain points',      kind: 'list',  applies: 'BusinessProfile.currentChallenges' },
  { key: 'goals',           label: 'Goals',            kind: 'list' },
  { key: 'expertiseNeeded', label: 'Expertise needed', kind: 'list' },
  { key: 'currentTools',    label: 'Current tools',    kind: 'list' },
  { key: 'skills',          label: 'Skills (expert)',  kind: 'list' },
  { key: 'budget',          label: 'Budget',           kind: 'text' },
  { key: 'timeline',        label: 'Timeline',         kind: 'text' },
  { key: 'notes',           label: 'Notes',            kind: 'area' },
];

const toText = (v) => (Array.isArray(v) ? v.join('\n') : v == null ? '' : String(v));
const fromText = (v, kind) =>
  kind === 'list'
    ? String(v || '').split('\n').map((s) => s.trim()).filter(Boolean)
    : String(v || '').trim() || null;

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function TranscriptDetail() {
  const { callId } = useParams();
  const router = useRouter();

  const [transcript, setTranscript] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // A locked field always shows what the database holds. An unlocked one shows
  // the extraction, falling back to the stored value so the admin sees what is
  // already on record rather than an empty box.
  const hydrate = (t, current) => {
    setTranscript(t);
    if (current !== undefined) setProfile(current);
    const p = current !== undefined ? current : profile;
    const d = t?.extractedData || {};

    const existing = {
      name: p?.fullName,
      companyName: p?.companyIsPlaceholder ? null : p?.companyName,
      industry: p?.industry,
      businessType: p?.businessType,
      teamSize: p?.companySize,
      painPoints: p?.currentChallenges,
    };

    setForm(FIELDS.reduce((acc, f) => {
      const value = f.locked
        ? (existing[f.key] ?? d[f.key])
        : (d[f.key] ?? existing[f.key]);
      return { ...acc, [f.key]: toText(value) };
    }, {}));
  };

  const load = useCallback(async () => {
    setError('');
    try {
      const { transcript: t, currentProfile } = await fetchTranscriptByCall(callId);
      hydrate(t, currentProfile);
    } catch (e) {
      setError(e.status === 404
        ? 'No transcript exists for this call yet.'
        : e.message || 'Could not load transcript');
    } finally {
      setLoading(false);
    }
    // hydrate closes over `profile`, but `load` always passes it explicitly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callId]);

  useEffect(() => { load(); }, [load]);

  const runExtract = async () => {
    setExtracting(true);
    setError('');
    setResult(null);
    try {
      const json = await extractTranscript(transcript._id);
      // The extract response may return userId/scheduledCallId as bare ids. Keep
      // the already-populated refs so the header keeps the caller name and date.
      const merged = { ...transcript, ...json.data };
      if (json.data?.userId && typeof json.data.userId !== 'object') merged.userId = transcript.userId;
      if (json.data?.scheduledCallId && typeof json.data.scheduledCallId !== 'object') merged.scheduledCallId = transcript.scheduledCallId;
      hydrate(merged, json.currentProfile ?? profile);
    } catch (e) {
      setError(e.message || 'Extraction failed');
    } finally {
      setExtracting(false);
    }
  };

  const runApply = async () => {
    setApplying(true);
    setError('');
    try {
      const edited = FIELDS.reduce(
        (acc, f) => ({ ...acc, [f.key]: fromText(form[f.key], f.kind) }), {}
      );
      if (transcript.extractedData?.confidence) {
        edited.confidence = transcript.extractedData.confidence;
      }
      const json = await applyTranscript(transcript._id, edited, overwrite);
      setResult(json.applied || {});
      await load();
    } catch (e) {
      setError(e.message || 'Could not apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push('/admin/transcripts')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> All transcripts
          </button>
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="mt-3 text-gray-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const call = transcript.scheduledCallId || {};
  const owner = transcript.userId || {};
  const meta = TRANSCRIPT_STATUS[transcript.status] || TRANSCRIPT_STATUS.pending;
  const hasText = !!(transcript.rawTranscript || '').trim();
  const entries = transcript.entries || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => router.push('/admin/transcripts')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> All transcripts
        </button>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.theme}`}>
                  {meta.label}
                </span>
                {transcript.isMock && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border bg-purple-50 text-purple-700 border-purple-200">
                    <FlaskConical className="w-3 h-3" /> Mock data
                  </span>
                )}
              </div>
              <h1 className="mt-2 text-xl font-bold text-gray-900 flex items-center gap-1.5">
                <User className="w-5 h-5 text-gray-400" />
                {owner.fullName || call.name || 'Unknown user'}
              </h1>
              <p className="text-sm text-gray-500">
                {owner.email || call.email}
              </p>
              <p className="mt-1 text-sm text-gray-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Call: {formatDateTime(call.dateTime)}
              </p>
              {profile && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="font-semibold text-gray-600">On record:</span>
                  {profile.email && (
                    <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> {profile.email}</span>
                  )}
                  {profile.phone && (
                    <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {profile.phone}</span>
                  )}
                  {!profile.hasProfile && (
                    <span className="text-amber-600">No business profile yet</span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer w-fit"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="mb-5 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-green-900">Profile updated</p>
                {[...(result.user || []), ...(result.profile || [])].length > 0 && (
                  <p className="mt-1 text-green-800">
                    Wrote: {[...(result.user || []), ...(result.profile || [])].join(', ')}
                  </p>
                )}
                {result.skipped?.length > 0 && (
                  <p className="mt-1 text-green-700/80">
                    Skipped: {result.skipped.join('; ')}
                  </p>
                )}
              </div>
              <button onClick={() => setResult(null)} className="ml-auto text-green-600 hover:text-green-800 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Half transcript, half form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* ── Left: the transcript ── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <h2 className="font-bold text-gray-900 text-sm">Transcript</h2>
              {entries.length > 0 && (
                <span className="text-xs text-gray-400">{entries.length} turns</span>
              )}
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {!hasText && entries.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No transcript text yet. Google Meet may still be generating it, or the
                  call had no recording enabled.
                  {transcript.fetchError && (
                    <span className="block mt-2 text-red-600">Error: {transcript.fetchError}</span>
                  )}
                </p>
              ) : entries.length > 0 ? (
                <div className="space-y-3">
                  {entries.map((e, i) => (
                    <div key={i}>
                      <div className="text-xs font-semibold text-gray-500">
                        {e.speakerName || 'Speaker'}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-800 whitespace-pre-wrap">{e.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{transcript.rawTranscript}</p>
              )}
            </div>

            {/* The extract button, under the transcript */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={runExtract}
                disabled={extracting || !hasText}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                {extracting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</>
                  : <><Sparkles className="w-4 h-4" /> {transcript.extractedData ? 'Re-extract' : 'Extract'}</>}
              </button>
              {!hasText && (
                <p className="mt-2 text-xs text-gray-400 text-center">
                  Nothing to extract from yet.
                </p>
              )}
            </div>
          </div>

          {/* ── Right: the editable extraction ── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
              <h2 className="font-bold text-gray-900 text-sm">Extracted information</h2>
              {transcript.extractedData?.confidence && (
                <span className="text-xs text-gray-400">
                  {transcript.extractedData.confidence} confidence
                </span>
              )}
            </div>

            <div className="p-5">
              {!transcript.extractedData ? (
                <p className="text-sm text-gray-500">
                  Nothing extracted yet. Press <strong>Extract</strong> under the transcript
                  to pull structured details out of the conversation.
                </p>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-4">
                    Review and correct anything the model got wrong, then approve. Fields
                    marked with a target write to the user&apos;s profile; the rest are kept
                    on the transcript for context.
                  </p>

                  <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
                    {FIELDS.map((f) => {
                      // Locked once the user actually supplied it at signup. A
                      // company left blank gets an auto-generated placeholder,
                      // which does not count — the call may fill that one in.
                      const isLocked =
                        f.locked &&
                        (f.key === 'companyName'
                          ? !!profile?.companyName && !profile?.companyIsPlaceholder
                          : !!profile?.fullName);

                      return (
                        <div key={f.key}>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            {f.label}
                            {isLocked ? (
                              <span className="ml-1.5 inline-flex items-center gap-1 font-normal text-gray-500">
                                <Lock className="w-3 h-3" /> from registration
                              </span>
                            ) : f.applies ? (
                              <span className="ml-1.5 font-normal text-gray-400">→ {f.applies}</span>
                            ) : null}
                          </label>

                          {isLocked ? (
                            <input
                              value={form[f.key]}
                              readOnly
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600 cursor-not-allowed"
                            />
                          ) : f.kind === 'text' ? (
                            <input
                              value={form[f.key]}
                              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <textarea
                              value={form[f.key]}
                              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
                              rows={f.kind === 'area' ? 3 : 2}
                              placeholder={f.kind === 'list' ? 'One per line' : ''}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}

                          {f.key === 'companyName' && profile?.companyIsPlaceholder && (
                            <p className="mt-1 text-xs text-amber-600">
                              Signup auto-filled &ldquo;{profile.companyName}&rdquo; — the call can replace it.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <label className="flex items-start gap-2 mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={overwrite}
                        onChange={(e) => setOverwrite(e.target.checked)}
                        className="mt-0.5 accent-blue-600 cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">
                        Overwrite values the profile already has.
                        <span className="block text-gray-400">
                          Off by default — only empty fields get filled.
                        </span>
                      </span>
                    </label>

                    <button
                      onClick={runApply}
                      disabled={applying}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                    >
                      {applying
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Applying...</>
                        : <><Check className="w-4 h-4" /> Approve &amp; update profile</>}
                    </button>

                    {transcript.appliedToProfile && (
                      <p className="mt-2 text-xs text-green-700 text-center">
                        Already applied once — approving again re-writes with your current edits.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <TranscriptDetail />
    </AdminGuard>
  );
}
