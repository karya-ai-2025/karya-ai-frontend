'use client';

// Email templates, written for a customer.
//
// Templates created here land in the customer's own library — they can see and
// edit them, and the campaign wizard can attach them to any of the four
// sequence steps.

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, Plus, ArrowLeft, Mail, Trash2, Pencil, X, Check,
  AlertTriangle, Eye, RefreshCw, ShieldCheck, Code2, Paperclip,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { CustomerBar } from '@/components/admin/CustomerPicker';
import TemplateAttachments from '@/components/admin/TemplateAttachments';
import {
  fetchCustomerTemplates, createCustomerTemplate,
  updateCustomerTemplate, deleteCustomerTemplate,
} from '@/lib/adminCampaignApi';

const TEMPLATE_TYPES = [
  { value: 'campaign',  label: 'Campaign (first email)' },
  { value: 'follow-up', label: 'Follow-up' },
];

const CATEGORIES = ['sales', 'marketing', 'support', 'onboarding', 'follow-up', 'general'];

const blank = () => ({
  templateName: '', subject: '', emailBody: '',
  description: '', templateType: 'campaign', category: 'sales',
  attachments: [],
});

function TemplateEditor({ value, onChange, onSave, onCancel, saving, isEdit, customerId }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const valid = value.templateName.trim() && value.subject.trim() && value.emailBody.trim();

  // The body is HTML. Write mode is the raw source; Preview renders it, so
  // what you see is what the recipient gets.
  const [bodyView, setBodyView] = useState('write');

  const attachments = value.attachments || [];

  return (
    <div className="bg-white border-2 border-blue-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">
          {isEdit ? 'Edit template' : 'New template'}
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-700" aria-label="Cancel">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Template name *" value={value.templateName} onChange={set('templateName')}
          placeholder="Healthcare CTO — first touch" />
        <Field label="Description" value={value.description} onChange={set('description')}
          placeholder="What this is for" />
        <Select label="Type" value={value.templateType} onChange={set('templateType')}
          options={TEMPLATE_TYPES} />
        <Select label="Category" value={value.category} onChange={set('category')}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
      </div>

      <Field label="Subject *" value={value.subject} onChange={set('subject')}
        placeholder="Quick question about {{company}}" />

      {/* Body — HTML source, with a preview so the markup can be checked
          before it reaches a recipient. */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-600">Body * (HTML)</label>
          <div className="flex gap-1">
            {[
              { key: 'write', label: 'Write', Icon: Code2 },
              { key: 'preview', label: 'Preview', Icon: Eye },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setBodyView(m.key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                  bodyView === m.key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <m.Icon className="w-3 h-3" /> {m.label}
              </button>
            ))}
          </div>
        </div>

        {bodyView === 'write' ? (
          <textarea
            value={value.emailBody}
            onChange={set('emailBody')}
            rows={12}
            placeholder={'<p>Hi {{firstName}},</p>\n<p>…</p>'}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <div className="border border-gray-200 rounded-xl p-4 bg-white min-h-[260px] max-h-[420px] overflow-y-auto">
            {value.emailBody.trim() ? (
              <div
                className="prose prose-sm max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: value.emailBody }}
              />
            ) : (
              <p className="text-sm text-gray-400">Nothing to preview yet.</p>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-1">
          Full HTML is supported — paste a designed email straight in. Use{' '}
          <code className="px-1 bg-gray-100 rounded">{'{{firstName}}'}</code>,{' '}
          <code className="px-1 bg-gray-100 rounded">{'{{company}}'}</code> to personalise.
        </p>
      </div>

      {/* Attachments — PDF, HTML and the rest, stored under the customer
          account, shared with the wizard and the campaign editor. */}
      <TemplateAttachments
        customerId={customerId}
        value={attachments}
        onChange={(next) => onChange({ ...value, attachments: next })}
      />

      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={!valid || saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {isEdit ? 'Save changes' : 'Save to their library'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
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
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function AdminTemplates() {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [draft, setDraft] = useState(null);      // new or edited template
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  const load = useCallback(async (userId) => {
    setLoading(true);
    setError('');
    try {
      setTemplates(await fetchCustomerTemplates(userId));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (customer) load(customer._id);
    else setTemplates([]);
  }, [customer, load]);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      if (editingId) await updateCustomerTemplate(customer._id, editingId, draft);
      else await createCustomerTemplate(customer._id, draft);
      setDraft(null);
      setEditingId(null);
      await load(customer._id);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Remove "${t.templateName}" from ${customer.fullName}'s library?`)) return;
    setError('');
    try {
      await deleteCustomerTemplate(customer._id, t._id);
      await load(customer._id);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
        <div>
          <button
            onClick={() => router.push('/admin/campaigns')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Admin campaigns
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Email templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Written for a customer, saved into their library. They can see and edit them, and you can
            attach them to any step of a campaign.
          </p>
        </div>

        <CustomerBar customer={customer} onSelect={setCustomer} label="Writing templates for" />

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {customer && (
          <>
            {!draft && (
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-gray-500">
                  {loading ? 'Loading…' : `${templates.length} template${templates.length === 1 ? '' : 's'} in their library`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => load(customer._id)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                  <button
                    onClick={() => { setDraft(blank()); setEditingId(null); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" /> New template
                  </button>
                </div>
              </div>
            )}

            {draft && (
              <TemplateEditor
                value={draft}
                onChange={setDraft}
                onSave={save}
                onCancel={() => { setDraft(null); setEditingId(null); }}
                saving={saving}
                isEdit={!!editingId}
                customerId={customer._id}
              />
            )}

            {loading && templates.length === 0 && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            )}

            {!loading && templates.length === 0 && !draft && (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <Mail className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-900">No templates yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Write one for {customer.fullName} to reuse across campaigns.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t._id} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{t.templateName}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          {t.templateType}
                        </span>
                        {t.createdByAdmin && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <ShieldCheck className="w-3 h-3" /> written by admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">{t.subject}</p>
                      {t.description && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{t.description}</p>
                      )}
                      {(t.attachments || []).length > 0 && (
                        <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          {t.attachments.length} attachment{t.attachments.length === 1 ? '' : 's'}
                          <span className="text-gray-400">
                            — {t.attachments.map((a) => a.originalName || a.fileName).join(', ')}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <IconButton icon={Eye} label="Preview"
                        onClick={() => setPreviewId(previewId === t._id ? null : t._id)} />
                      <IconButton icon={Pencil} label="Edit" onClick={() => {
                        setEditingId(t._id);
                        setDraft({
                          templateName: t.templateName || '', subject: t.subject || '',
                          emailBody: t.emailBody || '', description: t.description || '',
                          templateType: t.templateType || 'campaign', category: t.category || 'sales',
                          attachments: t.attachments || [],
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} />
                      <IconButton icon={Trash2} label="Remove" danger onClick={() => remove(t)} />
                    </div>
                  </div>

                  {previewId === t._id && (
                    <div className="border border-gray-100 rounded-xl p-3 bg-gray-50 max-h-72 overflow-y-auto">
                      <div
                        className="text-sm text-gray-700 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: t.emailBody }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function IconButton({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`p-2 rounded-lg border transition-colors ${
        danger
          ? 'border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
          : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <AdminTemplates />
    </AdminGuard>
  );
}
