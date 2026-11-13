'use client';

import { useEffect, useState } from 'react';
import {
  Crosshair, RefreshCw, Check, MessageSquarePlus, Clock,
  AlertCircle, ChevronDown, ChevronRight, Send, X, Hourglass,
} from 'lucide-react';
import {
  fetchMyICPs, approveICP, requestICPChanges,
  ICP_STATUS_LABEL, ICP_STATUS_THEME,
} from '../../../../lib/icpApi';

const FILTER_LABELS = {
  industry: 'Industry',
  location: 'Location',
  seniority: 'Seniority',
  segment: 'Company size',
  companySegment: 'Company segment',
  company: 'Companies',
};

function FilterRow({ label, values }) {
  if (!values || values.length === 0) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-2 border-b border-gray-100 last:border-b-0">
      <div className="text-xs font-semibold text-gray-500 sm:w-36 flex-shrink-0 pt-0.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-xs font-medium">
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

/** "2 days" / "5 hours" / "20 minutes" — whichever unit reads best. */
function formatLeft(ms) {
  const mins = Math.ceil(ms / 60000);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'}`;
  const hours = Math.ceil(mins / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? '' : 's'}`;
  const days = Math.ceil(hours / 24);
  return `${days} day${days === 1 ? '' : 's'}`;
}

const AUDIENCE_LABELS = {
  all: 'Everyone on your list',
  opened: 'Only people who opened the previous email',
  not_opened: 'Only people who did not open the previous email',
  not_replied: 'Everyone who has not replied yet',
};

/** One email in the sequence — collapsed to a summary, expandable to the full text. */
function SequenceStep({ step }) {
  const [open, setOpen] = useState(false);
  const empty = !step.subject?.trim() && !step.body?.trim();

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {step.step}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 break-words">
              {step.subject?.trim() || (empty ? 'Not written yet' : '(no subject)')}
            </div>
            <div className="mt-0.5 text-xs text-gray-500">
              {AUDIENCE_LABELS[step.audience] || step.audience}
              {step.delayHours > 0
                ? ` · ${step.delayHours}h after the previous email`
                : ' · sent first'}
            </div>
          </div>
        </div>
        {open
          ? <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-400 mt-1" />
          : <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-400 mt-1" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-3 py-2.5 max-h-56 overflow-y-auto">
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
            {step.body?.trim() || 'No content written for this email yet.'}
          </p>
        </div>
      )}
    </div>
  );
}

function ICPCard({ icp, onChanged, expandedId, onToggle }) {
  // When a specific ICP is addressed (/icp/<campaignId>) that one is open and the
  // URL is the source of truth. On the plain list, fall back to the old rule of
  // auto-opening whatever is waiting on the customer.
  const cardCampaignId = String(icp.campaignId?._id || icp.campaignId || '');
  const open = expandedId
    ? expandedId === cardCampaignId
    : icp.status === 'awaiting_user';
  const [showSuggest, setShowSuggest] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const campaign = icp.campaignId || {};
  const campaignId = campaign._id || icp.campaignId;
  const canReview = ['awaiting_user', 'revision_requested'].includes(icp.status);
  const filters = icp.filters || {};
  const hasFilters = Object.values(filters).some((v) => Array.isArray(v) && v.length > 0);
  // Populated by the API alongside the campaign — may be absent if the campaign
  // has no template yet, in which case the section simply doesn't render.
  const template = campaign.emailTemplateId || null;
  // The four-email sequence the customer is approving. The API backfills it for
  // ICPs created before sequences existed, so this is normally populated.
  const sequence = Array.isArray(icp.sequence) ? icp.sequence : [];
  // Computed from the stored date rather than a server-side virtual, so it stays
  // correct as the card sits open.
  const deadline = icp.autoApproveAt
    ? (() => {
        const at = new Date(icp.autoApproveAt);
        const msLeft = at.getTime() - Date.now();
        return { at, msLeft, passed: msLeft <= 0 };
      })()
    : null;

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      setShowSuggest(false);
      setNote('');
      await onChanged();
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => onToggle?.(cardCampaignId, open)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${ICP_STATUS_THEME[icp.status] || ICP_STATUS_THEME.draft}`}>
              {ICP_STATUS_LABEL[icp.status] || icp.status}
            </span>
            {/* PARKED: campaign code — see models/Campaign.js
            {campaign.campaignCode && (
              <span className="text-xs font-mono text-gray-400">{campaign.campaignCode}</span>
            )} */}
            {icp.revisionCount > 0 && (
              <span className="text-xs text-gray-400">
                {icp.revisionCount} revision{icp.revisionCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <h3 className="mt-2 font-semibold text-gray-900 truncate">{icp.name}</h3>
          <p className="mt-0.5 text-sm text-gray-500 truncate">
            Campaign: {campaign.name || 'Untitled campaign'}
          </p>
        </div>
        {open
          ? <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
          : <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {icp.summary && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-500 mb-1">What we understood</div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{icp.summary}</p>
            </div>
          )}

          {hasFilters && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-500 mb-1">Who we will target</div>
              <div className="mt-1">
                {Object.keys(FILTER_LABELS).map((k) => (
                  <FilterRow key={k} label={FILTER_LABELS[k]} values={filters[k]} />
                ))}
              </div>
            </div>
          )}

          {/* The whole conversation, not just the opening line. Four emails go
              out in order, each to a different slice depending on what happened
              to the one before — so the customer signs off on all of them. */}
          {sequence.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-500 mb-1">
                What we will send — {sequence.length} emails in sequence
              </div>
              <div className="space-y-2 mt-2">
                {sequence.map((s) => (
                  <SequenceStep key={s.key || s.step} step={s} />
                ))}
              </div>
            </div>
          )}

          {/* Fallback for an ICP written before the sequence existed. */}
          {sequence.length === 0 && template && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-500 mb-1">What we will send</div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <div className="text-xs text-gray-500">Subject</div>
                  <div className="text-sm font-medium text-gray-900 break-words">
                    {template.subject || '(no subject)'}
                  </div>
                </div>
                <div className="px-3 py-2 max-h-56 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {template.emailBody || 'No email content yet.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {icp.adminNote && (
            <div className="mt-4 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <MessageSquarePlus className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-blue-900">Note from the Karya team</div>
                <p className="mt-0.5 text-sm text-blue-800 whitespace-pre-wrap">{icp.adminNote}</p>
              </div>
            </div>
          )}

          {icp.status === 'revision_requested' && icp.customerNote && (
            <div className="mt-4 flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-lg p-3">
              <Clock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-orange-900">
                  Your suggestion — with the team now
                </div>
                <p className="mt-0.5 text-sm text-orange-800 whitespace-pre-wrap">{icp.customerNote}</p>
              </div>
            </div>
          )}

          {/* The response deadline. Shown before they act, so the campaign
              starting on its own is never a surprise. */}
          {icp.status === 'awaiting_user' && deadline && (
            <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <Hourglass className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-amber-900">
                  {deadline.passed
                    ? 'Response window closed'
                    : `Approving automatically in ${formatLeft(deadline.msLeft)}`}
                </div>
                <p className="mt-0.5 text-sm text-amber-800">
                  {deadline.passed
                    ? 'We are going ahead with this targeting. Ask for changes any time and we will pause and revise.'
                    : <>If we don&apos;t hear from you by <strong>{deadline.at.toLocaleString()}</strong>, we&apos;ll
                       treat this as approved and start the campaign, so your outreach isn&apos;t held up.
                       Approving now — or asking for changes — stops the clock.</>}
                </p>
              </div>
            </div>
          )}

          {icp.status === 'approved' && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-700">
              <Check className="w-4 h-4" />
              <span>
                {icp.approvalSource === 'auto'
                  ? 'Approved automatically — the response window closed'
                  : 'You approved this'}
                {icp.approvedAt ? ` on ${new Date(icp.approvedAt).toLocaleDateString()}` : ''}.
              </span>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Review actions */}
          {canReview && !showSuggest && (
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <button
                disabled={busy}
                onClick={() => run(() => approveICP(campaignId))}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button
                disabled={busy}
                onClick={() => setShowSuggest(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Make changes</span>
              </button>
            </div>
          )}

          {/* Suggestion box */}
          {canReview && showSuggest && (
            <div className="mt-5 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-800">
                  What would you like changed?
                </label>
                <button
                  onClick={() => { setShowSuggest(false); setNote(''); setError(''); }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                maxLength={2000}
                autoFocus
                placeholder="e.g. Target VPs of Engineering rather than CTOs, and focus on companies with 200+ employees."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">{note.length}/2000</span>
                <button
                  disabled={busy || !note.trim()}
                  onClick={() => run(() => requestICPChanges(campaignId, note.trim()))}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{busy ? 'Sending...' : 'Send to the team'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ICPPanel({ expandedId = null, onToggle }) {
  const [icps, setICPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      setICPs(await fetchMyICPs());
    } catch (e) {
      setError(e.message || 'Could not load your ICPs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading your ICPs...</span>
      </div>
    );
  }

  const awaiting = icps.filter((i) => i.status === 'awaiting_user').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ideal Customer Profiles</h1>
          <p className="mt-1 text-gray-600">
            {awaiting > 0
              ? `${awaiting} profile${awaiting === 1 ? '' : 's'} waiting for your approval.`
              : 'Who each of your campaigns will reach out to.'}
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer w-fit"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">{error}</div>
        </div>
      )}

      {icps.length === 0 && !error ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <div className="inline-flex p-3 bg-gray-100 rounded-lg">
            <Crosshair className="w-6 h-6 text-gray-400" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No ICPs yet</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
            Once the Karya team builds an ideal customer profile for one of your campaigns,
            it will appear here for you to review and approve.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {icps.map((icp) => (
            <ICPCard key={icp._id} icp={icp} onChanged={load} expandedId={expandedId} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
