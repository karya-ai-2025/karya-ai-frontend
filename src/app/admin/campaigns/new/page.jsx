'use client';

// Admin builds a campaign for a customer after a call.
//
// Four steps: who it's for → who it goes to → what it says → review.
// The campaign that comes out belongs to the customer: it appears in their
// dashboard, their plan pays for it, and they still have to approve the ICP
// before a single email leaves.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, Search, ArrowLeft, ArrowRight, Check, User, Users, Mail,
  Database, ClipboardPaste, Trash2, AlertTriangle, Coins, CheckCircle2,
  X, Plus, ListChecks, LibraryBig, PenLine,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import CustomerPicker, { CreditPill } from '@/components/admin/CustomerPicker';
import AdditionalFilters, { emptyAdditionalFilters } from '@/components/leads/AdditionalFilters';
import TemplateAttachments from '@/components/admin/TemplateAttachments';
import {
  fetchCustomerContext, fetchSavedList,
  searchLeadsFor, createCampaignFor, fetchCustomerTemplates, SEQUENCE_STEPS,
} from '@/lib/adminCampaignApi';
import { getSegments, getSeniority } from '@/services/leadFiltersApi';

const STEPS = [
  { n: 1, label: 'Customer' },
  { n: 2, label: 'Leads' },
  { n: 3, label: 'Emails' },
  { n: 4, label: 'Review' },
];

const emptySequence = () =>
  SEQUENCE_STEPS.reduce(
    (acc, s) => ({
      ...acc,
      [s.key]: { mode: 'write', templateId: '', subject: '', body: '', attachments: [] },
    }),
    {}
  );

/** A step counts as filled if it names a template or has both subject and body. */
const stepFilled = (v) =>
  v?.mode === 'template'
    ? !!String(v.templateId || '').trim()
    : !!(v?.subject?.trim() && v?.body?.trim());

const isEmailLike = (e = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).trim());

// ── Small shared pieces ──────────────────────────────────────────────────────

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <div key={s.n} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                active
                  ? 'bg-blue-600 text-white border-blue-600'
                  : done
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-white text-gray-400 border-gray-200'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-black/10">
                {done ? <Check className="w-3 h-3" /> : s.n}
              </span>
              {s.label}
            </div>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-gray-200" />}
          </div>
        );
      })}
    </div>
  );
}


// ── Step 2 — build the lead list ─────────────────────────────────────────────

function PickLeads({ customer, context, leads, setLeads }) {
  const [tab, setTab] = useState('search');

  // Shared lead adder: dedupes by email against what is already selected.
  const addLeads = useCallback((incoming) => {
    setLeads((prev) => {
      const seen = new Set(prev.map((l) => l.email));
      const added = incoming.filter((l) => isEmailLike(l.email) && !seen.has(l.email));
      return [...prev, ...added];
    });
  }, [setLeads]);

  const TABS = [
    { key: 'search', label: 'Search lead database', icon: Database },
    { key: 'saved',  label: 'Their saved lists',    icon: ListChecks },
    { key: 'paste',  label: 'Paste emails',         icon: ClipboardPaste },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Who should it go to?</h2>
        <p className="text-sm text-gray-500 mt-1">
          Mix any of the three — duplicates are removed automatically.
        </p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
              tab === t.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'search' && <LeadSearch customer={customer} onAdd={addLeads} />}
      {tab === 'saved' && <SavedLists customer={customer} context={context} onAdd={addLeads} />}
      {tab === 'paste' && <PasteLeads onAdd={addLeads} />}

      <SelectedLeads leads={leads} setLeads={setLeads} />
    </div>
  );
}

function LeadSearch({ customer, onAdd }) {
  const [filters, setFilters] = useState({
    industry: '', location: '', company: '', companySegment: '', segment: '', seniority: '',
    ...emptyAdditionalFilters(),
  });
  const [segments, setSegments] = useState([]);
  const [seniorities, setSeniorities] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSegments().then(setSegments).catch(() => {});
    getSeniority().then(setSeniorities).catch(() => {});
  }, []);

  const run = async () => {
    if (!filters.industry.trim()) {
      setError('Industry is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setResult(await searchLeadsFor({ ...filters, targetUserId: customer._id, limit: 100 }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Field label="Industry *" value={filters.industry} onChange={set('industry')} placeholder="Healthcare" />
        <Field label="Region" value={filters.location} onChange={set('location')} placeholder="US, APAC" />
        <Field label="Company" value={filters.company} onChange={set('company')} placeholder="Apollo Hospitals" />
        <Select label="Company size" value={filters.segment} onChange={set('segment')}
          options={segments.map((s) => ({ value: s.segment_name, label: s.display_name }))} />
        <Select label="Seniority" value={filters.seniority} onChange={set('seniority')}
          options={seniorities.map((s) => ({ value: s.level_name, label: s.display_name }))} />
        <Field label="Company segment" value={filters.companySegment} onChange={set('companySegment')}
          placeholder='Exact "Account Sub Segment"' />
      </div>

      <AdditionalFilters
        value={filters}
        onChange={setFilters}
        apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}
        authHeader={{ Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}` }}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
        <p className="text-xs text-gray-400">
          Searching is free. Credits are charged per email when the campaign starts.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{result.leads.length}</span> shown
              {' · '}{result.totalMatched} matched
              {result.excludedCount > 0 && (
                <span className="text-gray-400">
                  {' · '}{result.excludedCount} already delivered to this customer, excluded
                </span>
              )}
            </p>
            <button
              onClick={() => onAdd(result.leads)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add all {result.leads.length}
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-lg divide-y">
            {result.leads.map((l) => (
              <div key={l.leadId} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {[l.firstName, l.lastName].filter(Boolean).join(' ') || l.email}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {l.email}{l.company ? ` · ${l.company}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => onAdd([l])}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 shrink-0"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SavedLists({ customer, context, onAdd }) {
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState('');
  const lists = context?.savedLists || [];

  const load = async (listId) => {
    setLoadingId(listId);
    setError('');
    try {
      const data = await fetchSavedList(customer._id, listId);
      onAdd(data.leads);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {lists.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          {customer.fullName} has no saved lead lists yet.
        </p>
      )}
      {lists.map((l) => (
        <div key={l._id} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{l.name}</p>
            <p className="text-xs text-gray-500">
              {l.emailCount} with an email address · {l.totalLeads} total
            </p>
          </div>
          <button
            onClick={() => load(l._id)}
            disabled={loadingId === l._id || l.emailCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
          >
            {loadingId === l._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add
          </button>
        </div>
      ))}
    </div>
  );
}

function PasteLeads({ onAdd }) {
  const [text, setText] = useState('');

  // Accepts "email", "Name <email>" and "email, Name, Company" — one per line
  // or comma-separated, because that is how a customer actually sends a list.
  const parsed = useMemo(() => {
    const tokens = text.split(/[\n,;]+/).map((t) => t.trim()).filter(Boolean);
    const out = [];
    const seen = new Set();
    tokens.forEach((token, i) => {
      const match = token.match(/<([^>]+)>/);
      const email = (match ? match[1] : token).trim().toLowerCase();
      if (!isEmailLike(email) || seen.has(email)) return;
      seen.add(email);
      const name = match ? token.slice(0, match.index).trim().replace(/["']/g, '') : '';
      const [firstName = '', ...rest] = name.split(/\s+/);
      out.push({
        leadId: `manual_${Date.now()}_${i}`,
        email,
        firstName,
        lastName: rest.join(' '),
        company: '', jobTitle: '', industry: '', location: '', phoneNumber: '',
      });
    });
    return out;
  }, [text]);

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={'one@company.com\nJane Doe <jane@company.com>\nthree@company.com'}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {parsed.length} valid email{parsed.length === 1 ? '' : 's'} found
        </p>
        <button
          onClick={() => { onAdd(parsed); setText(''); }}
          disabled={parsed.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add {parsed.length}
        </button>
      </div>
    </div>
  );
}

function SelectedLeads({ leads, setLeads }) {
  if (leads.length === 0) return null;
  return (
    <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          {leads.length} recipient{leads.length === 1 ? '' : 's'} selected
        </p>
        <button
          onClick={() => setLeads([])}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear all
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto flex flex-wrap gap-1.5">
        {leads.map((l) => (
          <span
            key={l.email}
            className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-lg text-[11px] text-gray-700"
          >
            {l.email}
            <button
              onClick={() => setLeads((prev) => prev.filter((x) => x.email !== l.email))}
              className="text-gray-400 hover:text-red-600"
              aria-label={`Remove ${l.email}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Step 3 — the four emails ─────────────────────────────────────────────────
//
// Each step is filled one of two ways, the same choice the customer has in
// their own wizard: pick a template they already own, or write a new one.
// A step holds { mode, templateId, subject, body } — only the fields matching
// its mode are sent.

function WriteEmails({ sequence, setSequence, templates, templatesLoading, customer }) {
  const update = (key, patch) =>
    setSequence((s) => ({ ...s, [key]: { ...s[key], ...patch } }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">What should it say?</h2>
        <p className="text-sm text-gray-500 mt-1">
          A campaign is four emails, each to a different slice of the audience. Only the first is
          required — but all four are what the customer approves in the ICP, so filling them now
          means the ICP arrives ready.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Use <code className="px-1 bg-gray-100 rounded">{'{{firstName}}'}</code>,{' '}
          <code className="px-1 bg-gray-100 rounded">{'{{company}}'}</code> to personalise.
        </p>
      </div>

      {templatesLoading && (
        <p className="text-xs text-gray-400 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading {customer.fullName}&apos;s templates…
        </p>
      )}

      {SEQUENCE_STEPS.map((step, i) => (
        <SequenceStep
          key={step.key}
          index={i}
          step={step}
          value={sequence[step.key] || { mode: 'write', templateId: '', subject: '', body: '', attachments: [] }}
          onChange={(patch) => update(step.key, patch)}
          templates={templates}
          customerId={customer?._id}
        />
      ))}
    </div>
  );
}

function SequenceStep({ index, step, value, onChange, templates, customerId }) {
  const mode = value.mode || 'write';
  const chosen = templates.find((t) => t._id === value.templateId);

  const filled =
    mode === 'template' ? !!chosen : !!(value.subject?.trim() && value.body?.trim());

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {step.label}
              {step.required && <span className="text-red-500 ml-1">*</span>}
            </p>
            <p className="text-[11px] text-gray-500 truncate">{step.audience}</p>
          </div>
        </div>
        {filled ? (
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
        ) : (
          <span className="text-[11px] text-gray-400 shrink-0">
            {step.required ? 'Required' : 'Optional'}
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Pick a template, or write one. */}
        <div className="flex gap-2">
          <ModeButton
            active={mode === 'template'}
            onClick={() => onChange({ mode: 'template' })}
            icon={LibraryBig}
            label="Use a saved template"
          />
          <ModeButton
            active={mode === 'write'}
            onClick={() => onChange({ mode: 'write' })}
            icon={PenLine}
            label="Write a new one"
          />
        </div>

        {mode === 'template' ? (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {templates.length} template{templates.length === 1 ? '' : 's'} in their library
              </label>
              <select
                value={value.templateId || ''}
                onChange={(e) => onChange({ templateId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a template…</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.templateName} — {t.subject}
                  </option>
                ))}
              </select>
            </div>

            {templates.length === 0 && (
              <p className="text-xs text-gray-400">
                They have no templates yet. Write one here, or build their library at{' '}
                <span className="font-mono">/admin/templates</span>.
              </p>
            )}

            {chosen && (
              <div className="border border-gray-100 rounded-lg p-3 bg-gray-50 space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Preview</p>
                <p className="text-xs font-semibold text-gray-900">{chosen.subject}</p>
                <div
                  className="text-xs text-gray-600 max-h-36 overflow-y-auto prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: chosen.emailBody }}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <Field
              label="Subject"
              value={value.subject || ''}
              onChange={(e) => onChange({ subject: e.target.value })}
              placeholder="Quick question about {{company}}"
            />
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Body (HTML)</label>
              <textarea
                value={value.body || ''}
                onChange={(e) => onChange({ body: e.target.value })}
                rows={5}
                placeholder={'<p>Hi {{firstName}},</p>'}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Full HTML is supported. Saved into their template library so they can reuse it.
              </p>
            </div>

            {/* PDF, HTML and the rest — same as the customer's own builder */}
            <TemplateAttachments
              compact
              customerId={customerId}
              value={value.attachments || []}
              onChange={(next) => onChange({ attachments: next })}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

// ── Step 4 — review and create ───────────────────────────────────────────────

function Review({ customer, context, name, setName, description, setDescription, note, setNote, leads, sequence }) {
  const required = leads.length;
  const credits = context?.credits;
  const written = SEQUENCE_STEPS.filter((s) => stepFilled(sequence[s.key]));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Review and create</h2>
        <p className="text-sm text-gray-500 mt-1">
          Nothing sends yet. After this, create the ICP and {customer.fullName} approves it.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Campaign name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Q4 Healthcare outreach"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Field label="Description" value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="What the customer asked for" />
      </div>

      <Field label="Internal note" value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="Call on 12 Oct — wants hospital CTOs in APAC" />

      <div className="border border-gray-200 rounded-xl divide-y">
        <Row icon={User} label="Customer" value={`${customer.fullName} · ${customer.email}`} />
        <Row icon={Users} label="Recipients" value={`${leads.length} unique email addresses`} />
        <Row icon={Mail} label="Emails ready" value={`${written.length} of 4 — ${written.map((s) => s.label).join(', ')}`} />
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <Coins className="w-4 h-4 text-gray-400" /> Credits
          </span>
          <CreditPill credits={credits} required={required} />
        </div>
      </div>

      {credits?.hasPlan && credits.remaining < required && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">
            {customer.fullName} has {credits.remaining} credits but this send needs {required}.
            You can still create the campaign — it just cannot start until they are topped up.
          </p>
        </div>
      )}

      {credits && !credits.hasPlan && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">
            {customer.fullName} has no active plan. The campaign can be created, but it cannot start
            until they subscribe.
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-gray-500">
        <Icon className="w-4 h-4 text-gray-400" /> {label}
      </span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── The wizard ───────────────────────────────────────────────────────────────

function NewAdminCampaign() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState(null);
  const [context, setContext] = useState(null);
  const [leads, setLeads] = useState([]);
  const [sequence, setSequence] = useState(emptySequence);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  // Load the customer's plan, saved lists and template library once chosen.
  // Templates come with full bodies so step 3 can preview one before it is
  // attached. Re-picking a customer clears both, so one customer's templates
  // are never offered for another.
  useEffect(() => {
    if (!customer) {
      setContext(null);
      setTemplates([]);
      return;
    }
    let cancelled = false;

    fetchCustomerContext(customer._id)
      .then((d) => { if (!cancelled) setContext(d); })
      .catch((e) => { if (!cancelled) setError(e.message); });

    setTemplatesLoading(true);
    fetchCustomerTemplates(customer._id)
      .then((t) => { if (!cancelled) setTemplates(t); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setTemplatesLoading(false); });

    // A template chosen for the previous customer must not survive the switch.
    setSequence(emptySequence());

    return () => { cancelled = true; };
  }, [customer]);

  const canAdvance =
    (step === 1 && !!customer) ||
    (step === 2 && leads.length > 0) ||
    (step === 3 && stepFilled(sequence.initial)) ||
    step === 4;

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        targetUserId: customer._id,
        name: name.trim(),
        description: description.trim(),
        note: note.trim(),
        // Send only the fields matching each step's mode, so a half-typed
        // draft left behind after switching to a template is not also sent.
        sequence: SEQUENCE_STEPS
          .filter((s) => stepFilled(sequence[s.key]))
          .map((s) => {
            const v = sequence[s.key];
            return v.mode === 'template'
              ? { key: s.key, templateId: v.templateId }
              : { key: s.key, subject: v.subject, body: v.body, attachments: v.attachments || [] };
          }),
        selectedLeads: leads,
      };
      setCreated(await createCampaignFor(payload));
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Done ──────────────────────────────────────────────────────────────────
  if (created) {
    const c = created.data;
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Campaign created</h1>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{c.name}</span> now belongs to{' '}
            {customer.fullName}. It is a draft — nothing sends until they approve the ICP.
          </p>

          <div className="text-left border border-gray-200 rounded-xl divide-y">
            <Row icon={Users} label="Recipients" value={`${c.selectedLeads?.length ?? leads.length}`} />
            <Row icon={Mail} label="Templates created" value={`${c.sequenceTemplates?.length ?? 0} — in their account`} />
            <Row icon={Coins} label="Credits needed to send" value={`${created.billing?.creditsRequired ?? '—'}`} />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => router.push('/admin/icp')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Create the ICP <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/admin/campaigns')}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
            >
              All admin campaigns
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Wizard ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={() => router.push('/admin/campaigns')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> Admin campaigns
          </button>
          <StepBar current={step} />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Who is this campaign for?</h2>
                <p className="text-sm text-gray-500 mt-1">
                  The campaign will belong to them — it shows in their dashboard and their credits
                  pay for it.
                </p>
              </div>
              <CustomerPicker selected={customer} onSelect={setCustomer} />
            </div>
          )}
          {step === 2 && (
            <PickLeads customer={customer} context={context} leads={leads} setLeads={setLeads} />
          )}
          {step === 3 && (
            <WriteEmails
              sequence={sequence}
              setSequence={setSequence}
              templates={templates}
              templatesLoading={templatesLoading}
              customer={customer}
            />
          )}
          {step === 4 && (
            <Review
              customer={customer} context={context}
              name={name} setName={setName}
              description={description} setDescription={setDescription}
              note={note} setNote={setNote}
              leads={leads} sequence={sequence}
            />
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={saving || !name.trim() || leads.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <NewAdminCampaign />
    </AdminGuard>
  );
}
