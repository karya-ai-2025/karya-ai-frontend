'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, RefreshCw, Crosshair, ArrowLeft, Search, Save, Send,
  MessageSquareWarning, Check, Clock, User, History, X, Hourglass,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import {
  adminFetchICPs, adminCreateICP, adminUpdateICP,
  ICP_STATUS_LABEL, ICP_STATUS_THEME,
} from '@/lib/icpApi';
import { getSegments, getSeniority } from '@/services/leadFiltersApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Size and seniority stay pick-lists: they only work as an EXACT value from the
// mapping tables, because the query turns them into an employee range and a set
// of title keywords. There is no sensible free-text equivalent.
const PICKLIST_FIELDS = [
  { key: 'segment',   label: 'Company size', hint: 'Maps to an employee range' },
  { key: 'seniority', label: 'Seniority',    hint: 'Maps to job-title keywords' },
];

// Industry and region are free text.
//
// Both fall back to a substring match on the leads table when they don't match a
// mapping row, so typing works — and for industry it reaches more than the list
// could: tbl_gtm_industry has only 2 rows, while the data holds "Life Sciences"
// and "PS - Healthcare" too.
//
// Region is the one to watch: it matches "Mailing Country", so country names and
// codes work while cities do not.
const FREETEXT_FIELDS = [
  { key: 'industry',       label: 'Industry',        placeholder: 'Healthcare, Life Sciences' },
  { key: 'location',       label: 'Region',          placeholder: 'Country or region — US, APAC' },
  { key: 'company',        label: 'Companies',       placeholder: 'Apollo Hospitals, Fortis' },
  { key: 'companySegment', label: 'Company segment', placeholder: 'Exact "Account Sub Segment" value' },
];

const ALL_FILTER_KEYS = [...PICKLIST_FIELDS, ...FREETEXT_FIELDS].map((f) => f.key);

// A campaign is four emails, not one. Each goes to a different slice of the
// audience depending on what happened to the previous send. Mirrors
// CampaignICP.defaultSequence() on the server — the server is authoritative and
// re-derives the structure on save, so only copy and timing travel from here.
const DEFAULT_SEQUENCE = [
  { step: 1, key: 'initial',   label: 'First email',                     audience: 'all',         delayHours: 0,  subject: '', body: '' },
  { step: 2, key: 'follow_up', label: 'Follow-up (they opened it)',      audience: 'opened',      delayHours: 48, subject: '', body: '' },
  { step: 3, key: 'recall',    label: 'Recall (they did not open it)',   audience: 'not_opened',  delayHours: 48, subject: '', body: '' },
  { step: 4, key: 'final',     label: 'Final call',                      audience: 'not_replied', delayHours: 96, subject: '', body: '' },
];

const AUDIENCE_LABELS = {
  all: 'Everyone on the list',
  opened: 'Only those who opened the previous email',
  not_opened: 'Only those who did not open the previous email',
  not_replied: 'Everyone who has not replied yet',
};

/** "in 5 hours" — the mirror of timeAgo, for the auto-approval deadline. */
function timeUntil(d) {
  if (!d) return '';
  const mins = Math.ceil((new Date(d).getTime() - Date.now()) / 60000);
  if (mins <= 0) return 'now';
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.ceil(mins / 60);
  if (hrs < 48) return `in ${hrs}h`;
  return `in ${Math.ceil(hrs / 24)}d`;
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

/** Comma-separated string <-> array, for the two free-text fields. */
const toText = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');
const toArr = (txt) => String(txt || '').split(',').map((s) => s.trim()).filter(Boolean);

/** Chip list — a picked value plus a button to drop it again. */
function Chips({ values, onRemove }) {
  if (!values || values.length === 0) {
    return <p className="mt-1.5 text-xs text-gray-400">Any — no filter applied</p>;
  }
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium">
          {v}
          <button
            type="button"
            onClick={() => onRemove(v)}
            className="hover:text-blue-900 cursor-pointer"
            aria-label={`Remove ${v}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

function ICPForm({ campaign, existing, options, onSaved, onCancel }) {
  // A new ICP is named after its campaign — that's almost always what you want,
  // and it keeps the two matched when a project has several campaigns.
  const [name, setName] = useState(
    existing?.name || campaign?.name || existing?.campaignId?.name || ''
  );
  const [summary, setSummary] = useState(existing?.summary || '');
  const [adminNote, setAdminNote] = useState('');

  // Pick-lists hold arrays; free-text fields hold a raw comma string.
  const [picked, setPicked] = useState(() => {
    const f = existing?.filters || {};
    return PICKLIST_FIELDS.reduce((acc, { key }) => ({ ...acc, [key]: f[key] || [] }), {});
  });
  const [freeText, setFreeText] = useState(() => {
    const f = existing?.filters || {};
    return FREETEXT_FIELDS.reduce((acc, { key }) => ({ ...acc, [key]: toText(f[key]) }), {});
  });

  // The four-email sequence. Structure comes from the server; only subject, body
  // and timing are editable here.
  //
  // A brand-new ICP is seeded from the templates the customer already chose in
  // the campaign wizard, so this opens with the real copy rather than four empty
  // boxes. An existing ICP keeps whatever was last saved.
  const [sequence, setSequence] = useState(() => {
    if (existing?.sequence?.length) return existing.sequence.map((s) => ({ ...s }));

    const chosen = campaign?.sequenceTemplates || [];
    const byKey = new Map(chosen.map((s) => [s.key, s.templateId]).filter(([, t]) => t));
    // Fall back to the campaign's primary template for step 1 on older campaigns
    // that were created before the wizard collected all four.
    if (!byKey.has('initial') && campaign?.emailTemplateId) {
      byKey.set('initial', campaign.emailTemplateId);
    }

    return DEFAULT_SEQUENCE.map((def) => {
      const tpl = byKey.get(def.key);
      return {
        ...def,
        subject: tpl?.subject || '',
        body: tpl?.emailBody || '',
      };
    });
  });
  const [openStep, setOpenStep] = useState(1);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const campaignId = campaign?._id || existing?.campaignId?._id || existing?.campaignId;

  const setStep = (key, field, value) => {
    setSequence((list) => list.map((s) => (s.key === key ? { ...s, [field]: value } : s)));
  };

  const addValue = (key, value) => {
    if (!value) return;
    setPicked((p) => (p[key].includes(value) ? p : { ...p, [key]: [...p[key], value] }));
  };
  const removeValue = (key, value) => {
    setPicked((p) => ({ ...p, [key]: p[key].filter((v) => v !== value) }));
  };

  const save = async (sendForReview) => {
    if (!name.trim()) { setError('ICP name is required'); return; }
    setBusy(true);
    setError('');
    try {
      const filters = ALL_FILTER_KEYS.reduce((acc, key) => {
        acc[key] = picked[key] !== undefined ? picked[key] : toArr(freeText[key]);
        return acc;
      }, {});
      const payload = {
        name: name.trim(),
        summary: summary.trim(),
        filters,
        sequence,
        sendForReview,
      };
      if (existing) {
        await adminUpdateICP(campaignId, { ...payload, adminNote: adminNote.trim() });
      } else {
        await adminCreateICP(campaignId, payload);
      }
      await onSaved();
    } catch (e) {
      setError(e.message || 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  const revisions = existing?.revisions || [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 className="font-bold text-gray-900">
            {existing ? 'Revise ICP' : 'Create ICP'}
          </h2>
          <p className="text-sm text-gray-500 truncate">
            {campaign?.name || existing?.campaignId?.name}
          </p>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* The customer's suggestion — the whole reason you're on this screen */}
      {existing?.status === 'revision_requested' && existing.customerNote && (
        <div className="mb-4 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
          <MessageSquareWarning className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-orange-900">
              Customer asked for changes
            </div>
            <p className="mt-0.5 text-sm text-orange-800 whitespace-pre-wrap">
              {existing.customerNote}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">ICP name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            placeholder="Fintech founders, Bangalore"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            What the customer asked for
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="In their own words — context for you and for them."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-600 mb-2">
            Targeting — this is what runs against the leads database
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PICKLIST_FIELDS.map(({ key, label, hint }) => {
              const opts = options[key] || [];
              const remaining = opts.filter((o) => !picked[key].includes(o.value));
              return (
                <div key={key}>
                  <label className="block text-xs text-gray-500 mb-1">
                    {label}
                    <span className="ml-1.5 text-gray-400 font-normal">· {hint}</span>
                  </label>
                  <select
                    value=""
                    onChange={(e) => { addValue(key, e.target.value); e.target.value = ''; }}
                    disabled={opts.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">
                      {opts.length === 0 ? 'Could not load options' : `Add ${label.toLowerCase()}...`}
                    </option>
                    {remaining.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <Chips values={picked[key]} onRemove={(v) => removeValue(key, v)} />
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FREETEXT_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">
                  {label}
                  <span className="ml-1.5 text-gray-400 font-normal">· free text, comma separated</span>
                </label>
                <input
                  value={freeText[key]}
                  onChange={(e) => setFreeText((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Leave a field empty to not filter on it. Size and seniority are expanded
            by the mapping tables when the search runs. Region matches the contact&apos;s
            country, so use a country or region name rather than a city.
          </p>
        </div>

        {/* ── The four-email sequence ──────────────────────────────────────── */}
        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">
            The email sequence
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Four emails go out in order, each to a different slice of the audience
            based on what happened to the one before. The customer approves all four
            together.
          </p>

          <div className="space-y-2">
            {sequence.map((s) => {
              const isOpen = openStep === s.step;
              const written = !!(s.subject?.trim() || s.body?.trim());
              return (
                <div key={s.key} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenStep(isOpen ? null : s.step)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        written ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {s.step}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{s.label}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {AUDIENCE_LABELS[s.audience]}
                          {s.delayHours > 0 ? ` · ${s.delayHours}h after the previous email` : ' · sent immediately'}
                        </div>
                      </div>
                    </div>
                    {!written && (
                      <span className="flex-shrink-0 text-[10px] font-semibold uppercase text-amber-600">Empty</span>
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 p-3 space-y-3 bg-gray-50/60">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Subject</label>
                        <input
                          value={s.subject || ''}
                          onChange={(e) => setStep(s.key, 'subject', e.target.value)}
                          maxLength={300}
                          placeholder="One line that earns the open"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Body</label>
                        <textarea
                          value={s.body || ''}
                          onChange={(e) => setStep(s.key, 'body', e.target.value)}
                          rows={6}
                          maxLength={20000}
                          placeholder="Write the email as the customer will send it."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {s.step > 1 && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Send this many hours after the previous email
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={2160}
                            value={s.delayHours}
                            onChange={(e) => setStep(s.key, 'delayHours', Number(e.target.value))}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {existing && (
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Note back to the customer (optional)
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="Updated the seniority as you asked — let me know if this looks right."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex flex-col sm:flex-row gap-2">
        <button
          disabled={busy}
          onClick={() => save(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Send to customer for approval</span>
        </button>
        <button
          disabled={busy}
          onClick={() => save(false)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save as draft</span>
        </button>
      </div>

      {revisions.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowHistory((h) => !h)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            {showHistory ? 'Hide' : 'Show'} history ({revisions.length})
          </button>
          {showHistory && (
            <div className="mt-3 space-y-3">
              {[...revisions].reverse().map((r, i) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="font-semibold text-gray-600">{r.name}</span>
                    <span>{timeAgo(r.at)}</span>
                  </div>
                  {r.customerNote && (
                    <p className="mt-1 text-orange-700">Customer: {r.customerNote}</p>
                  )}
                  {r.adminNote && <p className="mt-1 text-blue-700">You: {r.adminNote}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AdminICPPage() {
  const router = useRouter();
  const [icps, setICPs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // { campaign, existing }
  const [options, setOptions] = useState({ segment: [], seniority: [] });

  const load = useCallback(async () => {
    setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const [icpList, campRes] = await Promise.all([
        adminFetchICPs(),
        fetch(`${API_URL}/icp/admin/campaigns`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }).then((r) => r.json()),
      ]);
      setICPs(icpList);
      setCampaigns(campRes.data || []);
    } catch (e) {
      setError(e.message || 'Could not load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Option lists come from the same PostgreSQL mapping tables the lead search
  // reads, so anything picked here is guaranteed to resolve to a real filter.
  // Always store the lowercase key (segment_name / level_name) — display_name is
  // for the UI only.
  useEffect(() => {
    let active = true;
    Promise.allSettled([getSegments(), getSeniority()])
      .then(([seg, sen]) => {
        if (!active) return;
        const val = (r, fallback = []) => (r.status === 'fulfilled' ? r.value : fallback);
        // An option with no value is unusable — it would store nothing and React
        // has no key for it — so drop any the API didn't fill in.
        const clean = (list) => list.filter((o) => o.value && o.label);
        setOptions({
          segment: clean(val(seg).map((s) => ({
            value: s.segment_name,
            label: `${s.display_name || s.segment_name} (${s.min_employees ?? 0}${s.max_employees ? `–${s.max_employees}` : '+'})`,
          }))),
          seniority: clean(val(sen).map((s) => ({
            value: s.level_name, label: s.display_name || s.level_name,
          }))),
        });
      });
    return () => { active = false; };
  }, []);

  const onSaved = async () => {
    setEditing(null);
    setLoading(true);
    await load();
  };

  const needsAction = icps.filter((i) => i.status === 'revision_requested');
  const withoutICP = campaigns.filter(
    (c) => !c.icp && !c.isParent && c.name.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => router.push('/business-dashboard')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Crosshair className="w-6 h-6 text-blue-600" />
              Customer ICPs
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {needsAction.length > 0
                ? `${needsAction.length} waiting on you.`
                : 'Create and revise ideal customer profiles for any campaign.'}
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer w-fit"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {editing && (
          <div className="mb-6">
            <ICPForm
              campaign={editing.campaign}
              existing={editing.existing}
              options={options}
              onSaved={onSaved}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}

        {/* Existing ICPs — changes-requested first, courtesy of the API */}
        <h2 className="text-sm font-bold text-gray-700 mb-3">
          Existing ICPs ({icps.length})
        </h2>
        <div className="space-y-3 mb-8">
          {icps.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500 text-center">
              No ICPs yet. Pick a campaign below to create the first one.
            </div>
          )}
          {icps.map((icp) => (
            <div key={icp._id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${ICP_STATUS_THEME[icp.status]}`}>
                      {ICP_STATUS_LABEL[icp.status] || icp.status}
                    </span>
                    {icp.revisionCount > 0 && (
                      <span className="text-xs text-gray-400">{icp.revisionCount} revisions</span>
                    )}
                    {/* How long the customer has left before it approves itself. */}
                    {icp.status === 'awaiting_user' && icp.autoApproveAt && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                        <Hourglass className="w-3 h-3" />
                        {new Date(icp.autoApproveAt) > new Date()
                          ? `auto-approves ${timeUntil(icp.autoApproveAt)}`
                          : 'auto-approving now'}
                      </span>
                    )}
                    {icp.status === 'approved' && icp.approvalSource === 'auto' && (
                      <span className="text-xs text-amber-700">auto-approved</span>
                    )}
                    <span className="text-xs text-gray-400">{timeAgo(icp.updatedAt)}</span>
                  </div>
                  <h3 className="mt-1.5 font-semibold text-gray-900 truncate">{icp.name}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {icp.campaignId?.name || 'Campaign removed'}
                    {icp.userId?.email ? ` · ${icp.userId.email}` : ''}
                  </p>
                  {icp.status === 'revision_requested' && icp.customerNote && (
                    <p className="mt-2 text-sm text-orange-700 bg-orange-50 border border-orange-100 rounded p-2">
                      {icp.customerNote}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditing({ campaign: icp.campaignId, existing: icp })}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer flex-shrink-0 w-fit ${
                    icp.status === 'revision_requested'
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {icp.status === 'revision_requested' ? 'Address changes' : 'Revise'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Campaigns that still need one */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h2 className="text-sm font-bold text-gray-700">
            Campaigns without an ICP ({withoutICP.length})
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campaigns"
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {withoutICP.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500 text-center md:col-span-2">
              Every campaign has an ICP.
            </div>
          )}
          {withoutICP.map((c) => (
            <div key={c._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{c.name}</h3>
                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {c.userId?.email || 'Unknown owner'}
                </p>
              </div>
              <button
                onClick={() => setEditing({ campaign: c, existing: null })}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex-shrink-0"
              >
                Create ICP
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <AdminICPPage />
    </AdminGuard>
  );
}
