'use client';

// Choose which customer an admin is acting for.
//
// Shared by the campaign wizard, the template library and the lead-list
// builder, so "who am I working on behalf of?" looks and behaves the same
// everywhere. The credit balance travels with the row because in every one of
// those places it's the number that decides what the admin can do next.

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Search, Check, Coins, AlertTriangle, X } from 'lucide-react';
import { searchCustomers } from '@/lib/adminCampaignApi';

export function CreditPill({ credits, required }) {
  if (!credits) return null;

  if (!credits.hasPlan) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <AlertTriangle className="w-3.5 h-3.5" /> No active plan
      </span>
    );
  }

  const short = required != null && credits.remaining < required;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        short ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
      }`}
    >
      <Coins className="w-3.5 h-3.5" />
      {credits.remaining} credits
      {required != null && ` · needs ${required}`}
    </span>
  );
}

/** Full-width search + result list. Used as step 1 of the campaign wizard. */
export default function CustomerPicker({ selected, onSelect, autoFocus = false }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = useCallback(async (term) => {
    setLoading(true);
    setError('');
    try {
      setResults(await searchCustomers(term));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => run(q), 300);
    return () => clearTimeout(t);
  }, [q, run]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email"
          className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="border border-gray-200 rounded-xl divide-y max-h-96 overflow-y-auto">
        {results.length === 0 && !loading && (
          <p className="p-4 text-sm text-gray-400 text-center">No customers found.</p>
        )}
        {results.map((u) => (
          <button
            key={u._id}
            onClick={() => onSelect(u)}
            className={`w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${
              selected?._id === u._id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {u.fullName}
                {u.isAdmin && (
                  <span className="ml-2 text-[10px] uppercase tracking-wide text-gray-400">admin</span>
                )}
              </p>
              <p className="text-xs text-gray-500 truncate">{u.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <CreditPill credits={u.credits} />
              {selected?._id === u._id && <Check className="w-4 h-4 text-blue-600" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Compact header variant: shows who is selected with a Change button, and
 * expands back into the picker when there is no selection. For pages that are
 * *about* a customer rather than pages that start by choosing one.
 */
export function CustomerBar({ customer, onSelect, label = 'Working on behalf of' }) {
  const [open, setOpen] = useState(!customer);

  if (customer && !open) {
    return (
      <div className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
          <p className="text-sm font-semibold text-gray-900 truncate">
            {customer.fullName} <span className="font-normal text-gray-500">· {customer.email}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CreditPill credits={customer.credits} />
          <button
            onClick={() => setOpen(true)}
            className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {customer && (
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close customer search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <CustomerPicker
        selected={customer}
        onSelect={(u) => { onSelect(u); setOpen(false); }}
        autoFocus
      />
    </div>
  );
}
