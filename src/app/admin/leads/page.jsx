'use client';

// Build a lead list for a customer and save it into their account.
//
// The saved list is the same object the customer sees in their own dashboard,
// and the same one the campaign wizard can pull from — so a list built here
// after a call is immediately usable in step 2 of a campaign.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, ArrowLeft, Search, Database, ClipboardPaste, Plus, X, Trash2,
  AlertTriangle, CheckCircle2, Save, Users, ListChecks, RefreshCw,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { CustomerBar } from '@/components/admin/CustomerPicker';
import AdditionalFilters, { emptyAdditionalFilters } from '@/components/leads/AdditionalFilters';
import {
  searchLeadsFor, fetchCustomerContext, createCustomerLeadList,
  deleteCustomerLeadList,
} from '@/lib/adminCampaignApi';
import { getSegments, getSeniority } from '@/services/leadFiltersApi';

const isEmailLike = (e = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).trim());

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

function AdminLeads() {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [context, setContext] = useState(null);
  const [tab, setTab] = useState('search');

  const [filters, setFilters] = useState({
    industry: '', location: '', company: '', companySegment: '', segment: '', seniority: '',
    ...emptyAdditionalFilters(),
  });
  const [segments, setSegments] = useState([]);
  const [seniorities, setSeniorities] = useState([]);
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);

  const [picked, setPicked] = useState([]);
  const [listName, setListName] = useState('');
  const [pasteText, setPasteText] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getSegments().then(setSegments).catch(() => {});
    getSeniority().then(setSeniorities).catch(() => {});
  }, []);

  const loadContext = useCallback(async (userId) => {
    try {
      setContext(await fetchCustomerContext(userId));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    if (customer) loadContext(customer._id);
    else { setContext(null); setPicked([]); setResult(null); }
  }, [customer, loadContext]);

  const addLeads = useCallback((incoming) => {
    setPicked((prev) => {
      const seen = new Set(prev.map((l) => l.email));
      return [...prev, ...incoming.filter((l) => isEmailLike(l.email) && !seen.has(l.email))];
    });
  }, []);

  const runSearch = async () => {
    if (!filters.industry.trim()) { setError('Industry is required.'); return; }
    setSearching(true);
    setError('');
    try {
      setResult(await searchLeadsFor({ ...filters, targetUserId: customer._id, limit: 100 }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSearching(false);
    }
  };

  const parsedPaste = useMemo(() => {
    const tokens = pasteText.split(/[\n,;]+/).map((t) => t.trim()).filter(Boolean);
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
        leadId: `manual_${Date.now()}_${i}`, email,
        firstName, lastName: rest.join(' '),
        company: '', jobTitle: '', industry: '', location: '', phoneNumber: '',
      });
    });
    return out;
  }, [pasteText]);

  const save = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = await createCustomerLeadList(customer._id, {
        name: listName.trim(),
        leads: picked,
        searchCriteria: filters,
      });
      setSuccess(`Saved "${data.name}" — ${data.totalLeads} leads in ${customer.fullName}'s account.`);
      setPicked([]);
      setListName('');
      await loadContext(customer._id);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const removeList = async (l) => {
    if (!window.confirm(`Delete "${l.name}" from ${customer.fullName}'s account?`)) return;
    setError('');
    try {
      await deleteCustomerLeadList(customer._id, l._id);
      await loadContext(customer._id);
    } catch (e) {
      setError(e.message);
    }
  };

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  const TABS = [
    { key: 'search', label: 'Search lead database', icon: Database },
    { key: 'paste',  label: 'Paste emails',         icon: ClipboardPaste },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Lead lists</h1>
          <p className="text-sm text-gray-500 mt-1">
            Build a list for a customer and save it into their account. Searching is free — credits
            are only charged per email when a campaign sends.
          </p>
        </div>

        <CustomerBar customer={customer} onSelect={setCustomer} label="Building a list for" />

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {customer && (
          <>
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
                  <t.icon className="w-4 h-4" /> {t.label}
                </button>
              ))}
            </div>

            {tab === 'search' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
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

                <button
                  onClick={runSearch}
                  disabled={searching}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </button>

                {result && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{result.leads.length}</span> shown
                        {' · '}{result.totalMatched} matched
                        {result.excludedCount > 0 && (
                          <span className="text-gray-400">
                            {' · '}{result.excludedCount} already delivered, excluded
                          </span>
                        )}
                      </p>
                      <button
                        onClick={() => addLeads(result.leads)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add all {result.leads.length}
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-lg divide-y">
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
                            onClick={() => addLeads([l])}
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
            )}

            {tab === 'paste' && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={7}
                  placeholder={'one@company.com\nJane Doe <jane@company.com>\nthree@company.com'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {parsedPaste.length} valid email{parsedPaste.length === 1 ? '' : 's'} found
                  </p>
                  <button
                    onClick={() => { addLeads(parsedPaste); setPasteText(''); }}
                    disabled={parsedPaste.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add {parsedPaste.length}
                  </button>
                </div>
              </div>
            )}

            {picked.length > 0 && (
              <div className="bg-blue-50/40 border border-blue-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    {picked.length} lead{picked.length === 1 ? '' : 's'} ready to save
                  </p>
                  <button
                    onClick={() => setPicked([])}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto flex flex-wrap gap-1.5">
                  {picked.map((l) => (
                    <span
                      key={l.email}
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-lg text-[11px] text-gray-700"
                    >
                      {l.email}
                      <button
                        onClick={() => setPicked((p) => p.filter((x) => x.email !== l.email))}
                        className="text-gray-400 hover:text-red-600"
                        aria-label={`Remove ${l.email}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-end gap-2 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <Field
                      label="List name"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      placeholder="Healthcare CTOs — APAC"
                    />
                  </div>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save to their account
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-gray-400" />
                  Their saved lists
                </h2>
                <button
                  onClick={() => loadContext(customer._id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {(context?.savedLists || []).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No saved lists yet.</p>
              )}

              {(context?.savedLists || []).map((l) => (
                <div key={l._id} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{l.name}</p>
                    <p className="text-xs text-gray-500">
                      {l.emailCount} with an email · {l.totalLeads} total
                    </p>
                  </div>
                  <button
                    onClick={() => removeList(l)}
                    title="Delete list"
                    aria-label={`Delete ${l.name}`}
                    className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <AdminLeads />
    </AdminGuard>
  );
}
