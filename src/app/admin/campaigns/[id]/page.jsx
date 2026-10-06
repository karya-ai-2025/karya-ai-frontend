'use client';

// One campaign, in full — what it says, who it goes to, what it cost, and
// every admin action taken on it.
//
// Editing is deliberately narrow: name and description are always safe, but
// recipients and email copy freeze the moment the first email goes out, since
// changing them afterwards would make the campaign's own history describe
// something that never happened. The server enforces this; the UI explains it.

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, ArrowLeft, Users, Mail, Coins, Clock, User, Play, Pencil, Check,
  AlertTriangle, CheckCircle2, Lock, Crosshair, History, Search, RefreshCw,
  LibraryBig, PenLine, Trash2, Plus, Paperclip,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import TemplateAttachments from '@/components/admin/TemplateAttachments';
import {
  fetchAdminCampaign, updateAdminCampaign, startCampaignFor,
  fetchCustomerTemplates,
  CAMPAIGN_STATUS_THEME, icpState, SEQUENCE_STEPS,
} from '@/lib/adminCampaignApi';

const isEmailLike = (e = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).trim());

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

// ── Small pieces ─────────────────────────────────────────────────────────────

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-400 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" /> {label}
      </p>
      <p className={`text-lg font-bold mt-1 ${tone || 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function Section({ title, icon: Icon, action, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-400" /> {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Banner({ tone, children }) {
  const map = {
    error: { cls: 'bg-red-50 border-red-200 text-red-700', Icon: AlertTriangle },
    warn: { cls: 'bg-amber-50 border-amber-200 text-amber-800', Icon: AlertTriangle },
    ok: { cls: 'bg-green-50 border-green-200 text-green-700', Icon: CheckCircle2 },
    info: { cls: 'bg-gray-50 border-gray-200 text-gray-600', Icon: Lock },
  };
  const { cls, Icon } = map[tone] || map.info;
  return (
    <div className={`flex items-start gap-2 p-3 border rounded-xl ${cls}`}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-sm">{children}</p>
    </div>
  );
}

// ── Emails ───────────────────────────────────────────────────────────────────

function EmailsSection({ campaign, templates, onSave, saving, locked, lockReason, ownerId }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});

  const begin = () => {
    const next = {};
    SEQUENCE_STEPS.forEach((s) => {
      const found = (campaign.sequenceTemplates || []).find((t) => t.key === s.key);
      const tpl = found?.templateId;
      next[s.key] = tpl
        ? { mode: 'template', templateId: tpl._id || tpl, subject: '', body: '', attachments: [] }
        : { mode: 'write', templateId: '', subject: '', body: '', attachments: [] };
    });
    setDraft(next);
    setEditing(true);
  };

  const filled = (v) =>
    v?.mode === 'template' ? !!v.templateId : !!(v?.subject?.trim() && v?.body?.trim());

  const save = () => {
    const sequence = SEQUENCE_STEPS.filter((s) => filled(draft[s.key])).map((s) => {
      const v = draft[s.key];
      return v.mode === 'template'
        ? { key: s.key, templateId: v.templateId }
        : { key: s.key, subject: v.subject, body: v.body, attachments: v.attachments || [] };
    });
    onSave({ sequence }, () => setEditing(false));
  };

  if (!editing) {
    return (
      <Section
        title="The four emails"
        icon={Mail}
        action={
          locked ? (
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <Lock className="w-3.5 h-3.5" /> Locked
            </span>
          ) : (
            <button
              onClick={begin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )
        }
      >
        {locked && <Banner tone="info">{lockReason}</Banner>}

        {SEQUENCE_STEPS.map((s, i) => {
          const found = (campaign.sequenceTemplates || []).find((t) => t.key === s.key);
          const tpl = found?.templateId;
          return (
            <div key={s.key} className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{s.label}</p>
                    <p className="text-[11px] text-gray-500 truncate">{s.audience}</p>
                  </div>
                </div>
                {!tpl && <span className="text-[11px] text-gray-400 shrink-0">Not set</span>}
              </div>
              {tpl && (
                <div className="p-3 space-y-1">
                  <p className="text-xs font-semibold text-gray-900">{tpl.subject}</p>
                  <div
                    className="text-xs text-gray-600 max-h-40 overflow-y-auto prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: tpl.emailBody || '' }}
                  />
                  <p className="text-[11px] text-gray-400 pt-1">Template: {tpl.templateName}</p>
                  {(tpl.attachments || []).length > 0 && (
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 pt-0.5">
                      <Paperclip className="w-3 h-3" />
                      {tpl.attachments.map((a) => a.originalName || a.fileName).join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </Section>
    );
  }

  return (
    <Section title="Editing the four emails" icon={Mail}>
      {SEQUENCE_STEPS.map((s, i) => {
        const v = draft[s.key] || {};
        const chosen = templates.find((t) => t._id === v.templateId);
        return (
          <div key={s.key} className="border border-gray-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-xs font-semibold text-gray-900">
                {s.label}
                {s.required && <span className="text-red-500 ml-1">*</span>}
              </p>
            </div>

            <div className="flex gap-2">
              {[
                { mode: 'template', Icon: LibraryBig, label: 'Saved template' },
                { mode: 'write', Icon: PenLine, label: 'Write new' },
              ].map((m) => (
                <button
                  key={m.mode}
                  onClick={() => setDraft((d) => ({ ...d, [s.key]: { ...d[s.key], mode: m.mode } }))}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                    v.mode === m.mode
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <m.Icon className="w-3 h-3" /> {m.label}
                </button>
              ))}
            </div>

            {v.mode === 'template' ? (
              <>
                <select
                  value={v.templateId || ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [s.key]: { ...d[s.key], templateId: e.target.value } }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a template…</option>
                  {templates.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.templateName} — {t.subject}
                    </option>
                  ))}
                </select>
                {chosen && (
                  <div className="border border-gray-100 rounded-lg p-2 bg-gray-50">
                    <p className="text-[11px] font-semibold text-gray-900">{chosen.subject}</p>
                    <div
                      className="text-[11px] text-gray-600 max-h-28 overflow-y-auto prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: chosen.emailBody }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <input
                  value={v.subject || ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [s.key]: { ...d[s.key], subject: e.target.value } }))
                  }
                  placeholder="Subject"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={v.body || ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [s.key]: { ...d[s.key], body: e.target.value } }))
                  }
                  rows={4}
                  placeholder={'<p>Hi {{firstName}},</p>'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* PDF, HTML and the rest — stored under the customer's account */}
                <TemplateAttachments
                  compact
                  customerId={ownerId}
                  value={v.attachments || []}
                  onChange={(next) =>
                    setDraft((d) => ({ ...d, [s.key]: { ...d[s.key], attachments: next } }))
                  }
                />
              </>
            )}
          </div>
        );
      })}

      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving || !filled(draft.initial)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save emails
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </Section>
  );
}

// ── Recipients ───────────────────────────────────────────────────────────────

function RecipientsSection({ campaign, onSave, saving, locked, lockReason }) {
  const [editing, setEditing] = useState(false);
  const [leads, setLeads] = useState([]);
  const [paste, setPaste] = useState('');
  const [query, setQuery] = useState('');

  const begin = () => {
    setLeads(campaign.selectedLeads || []);
    setEditing(true);
  };

  const addPasted = () => {
    const found = [];
    const seen = new Set(leads.map((l) => l.email));
    paste.split(/[\n,;]+/).map((t) => t.trim()).filter(Boolean).forEach((token, i) => {
      const m = token.match(/<([^>]+)>/);
      const email = (m ? m[1] : token).trim().toLowerCase();
      if (!isEmailLike(email) || seen.has(email)) return;
      seen.add(email);
      found.push({ leadId: `manual_${Date.now()}_${i}`, email, firstName: '', lastName: '' });
    });
    setLeads((p) => [...p, ...found]);
    setPaste('');
  };

  const shown = editing
    ? leads.filter((l) => !query || l.email.includes(query.toLowerCase()))
    : (campaign.selectedLeads || []).filter((l) => !query || l.email.includes(query.toLowerCase()));

  return (
    <Section
      title={`Recipients (${(editing ? leads : campaign.selectedLeads || []).length})`}
      icon={Users}
      action={
        locked ? (
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Lock className="w-3.5 h-3.5" /> Locked
          </span>
        ) : editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave({ selectedLeads: leads }, () => setEditing(false))}
              disabled={saving || leads.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={begin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        )
      }
    >
      {locked && <Banner tone="info">{lockReason}</Banner>}

      <div className="relative">
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by email"
          className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {editing && (
        <div className="space-y-2">
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={3}
            placeholder={'Add more — one email per line'}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addPasted}
            disabled={!paste.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      )}

      <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-xl divide-y">
        {shown.length === 0 && (
          <p className="p-4 text-sm text-gray-400 text-center">No recipients match.</p>
        )}
        {shown.map((l) => (
          <div key={l.email} className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {[l.firstName, l.lastName].filter(Boolean).join(' ') || l.email}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {l.email}{l.company ? ` · ${l.company}` : ''}
              </p>
            </div>
            {editing && (
              <button
                onClick={() => setLeads((p) => p.filter((x) => x.email !== l.email))}
                className="text-gray-400 hover:text-red-600 shrink-0"
                aria-label={`Remove ${l.email}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── The page ─────────────────────────────────────────────────────────────────

function CampaignDetail({ id }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);

  const [editingDetails, setEditingDetails] = useState(false);
  const [details, setDetails] = useState({ name: '', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminCampaign(id);
      setCampaign(data);
      setDetails({ name: data.name || '', description: data.description || '' });
      const ownerId = data.userId?._id || data.userId;
      if (ownerId) fetchCustomerTemplates(ownerId).then(setTemplates).catch(() => {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const save = async (payload, onDone) => {
    setSaving(true);
    setError('');
    setNotice(null);
    try {
      const res = await updateAdminCampaign(id, payload);
      setNotice({ tone: res.staleApproval ? 'warn' : 'ok', text: res.message });
      onDone?.();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const start = async () => {
    setStarting(true);
    setError('');
    setNotice(null);
    try {
      const res = await startCampaignFor(id);
      setNotice({ tone: 'ok', text: res.message });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  };

  if (loading && !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-gray-500">{error || 'Campaign not found.'}</p>
        <button
          onClick={() => router.push('/admin/campaigns')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
        >
          Back to campaigns
        </button>
      </div>
    );
  }

  const icp = icpState(campaign.icp?.status);
  const ed = campaign.editable || {};
  const canStart = ['draft', 'scheduled', 'paused'].includes(campaign.status);
  const owner = campaign.userId || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <button
              onClick={() => router.push('/admin/campaigns')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> All admin campaigns
            </button>

            {editingDetails ? (
              <div className="space-y-2">
                <input
                  value={details.name}
                  onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={details.description}
                  onChange={(e) => setDetails((d) => ({ ...d, description: e.target.value }))}
                  placeholder="Description"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => save(details, () => setEditingDetails(false))}
                    disabled={saving || !details.name.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingDetails(false); setDetails({ name: campaign.name, description: campaign.description || '' }); }}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
                  <button
                    onClick={() => setEditingDetails(true)}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    aria-label="Edit name and description"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                {campaign.description && (
                  <p className="text-sm text-gray-500 mt-1">{campaign.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${CAMPAIGN_STATUS_THEME[campaign.status] || CAMPAIGN_STATUS_THEME.draft}`}>
                    {campaign.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${icp.theme}`}>
                    {icp.label}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {owner.fullName} · {owner.email}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            {!campaign.icp && (
              <button
                onClick={() => router.push('/admin/icp')}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
              >
                <Crosshair className="w-4 h-4" /> Create ICP
              </button>
            )}
            {canStart && (
              <button
                onClick={start}
                disabled={starting}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Start for them
              </button>
            )}
          </div>
        </div>

        {error && <Banner tone="error">{error}</Banner>}
        {notice && <Banner tone={notice.tone}>{notice.text}</Banner>}

        {ed.approvalWouldBeStale && (
          <Banner tone="warn">
            {owner.email} has already approved this campaign. If you change the emails or the
            recipients, send the ICP again so they approve what will actually go out.
          </Banner>
        )}

        {/* Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat icon={Users} label="Recipients" value={(campaign.selectedLeads || []).length} />
          <Stat icon={Mail} label="Sent" value={campaign.stats?.sentCount ?? 0} />
          <Stat icon={CheckCircle2} label="Opened" value={campaign.stats?.openedCount ?? 0} />
          <Stat
            icon={Coins}
            label="Credits needed"
            value={campaign.billing?.creditsRequired ?? '—'}
            tone={campaign.billing?.sufficient ? 'text-gray-900' : 'text-red-600'}
          />
        </div>

        {!campaign.billing?.sufficient && (
          <Banner tone="warn">
            {campaign.billing?.hasPlan
              ? `${owner.email} has ${campaign.billing.remaining} credits but this send needs ${campaign.billing.creditsRequired}.`
              : `${owner.email} has no active plan, so this campaign cannot start yet.`}
          </Banner>
        )}

        <EmailsSection
          campaign={campaign}
          templates={templates}
          onSave={save}
          saving={saving}
          locked={!ed.canEditSequence}
          lockReason={ed.reason}
          ownerId={owner._id || campaign.userId}
        />

        <RecipientsSection
          campaign={campaign}
          onSave={save}
          saving={saving}
          locked={!ed.canEditLeads}
          lockReason={ed.reason}
        />

        {/* ICP */}
        <Section title="ICP" icon={Crosshair}>
          {campaign.icp ? (
            <div className="space-y-1 text-sm">
              <p className="text-gray-900 font-medium">{campaign.icp.name}</p>
              <p className="text-gray-500">
                Status: <span className="font-medium">{icp.label}</span>
                {campaign.icp.sentForReviewAt && ` · sent ${fmtDate(campaign.icp.sentForReviewAt)}`}
                {campaign.icp.approvedAt && ` · approved ${fmtDate(campaign.icp.approvedAt)}`}
                {campaign.icp.approvalSource === 'auto' && ' (automatically)'}
              </p>
              {campaign.icp.userNote && (
                <p className="text-gray-600 border-l-2 border-gray-200 pl-3 mt-2">
                  “{campaign.icp.userNote}”
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No ICP yet. The campaign cannot start until {owner.fullName} approves one.
            </p>
          )}
        </Section>

        {/* Audit */}
        <Section title="Admin activity" icon={History}>
          {(campaign.adminActions || []).length === 0 ? (
            <p className="text-sm text-gray-400">Nothing recorded.</p>
          ) : (
            <div className="space-y-2">
              {[...campaign.adminActions].reverse().map((a, i) => (
                <div key={i} className="flex items-start gap-3 text-sm border-b last:border-0 pb-2 last:pb-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 shrink-0 mt-0.5">
                    {a.action}
                  </span>
                  <div className="min-w-0">
                    <p className="text-gray-700">{a.note}</p>
                    <p className="text-[11px] text-gray-400">
                      {a.adminEmail || a.adminId?.email} · {fmtDate(a.at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
          <Clock className="w-3 h-3" /> Created {fmtDate(campaign.createdAt)}
          {campaign.startedAt && ` · started ${fmtDate(campaign.startedAt)}`}
        </p>
      </div>
    </div>
  );
}

export default function Page({ params }) {
  // Next 16 delivers params as a promise; use() unwraps it.
  const { id } = use(params);
  return (
    <AdminGuard>
      <CampaignDetail id={id} />
    </AdminGuard>
  );
}
