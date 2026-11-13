'use client';

import React, { useState, useMemo } from 'react';
import {
  Users, ArrowLeft, Mail, Phone, MapPin, Building2, Briefcase, Download,
} from 'lucide-react';

// Backend returns Postgres column names verbatim (with spaces). Read them by exact key.
const fullName = (lead) =>
  [lead['First Name'], lead['Last Name']].filter(Boolean).join(' ') || '—';

const cell = (value) => (value === null || value === undefined || value === '' ? '—' : value);

/**
 * LeadsWorkspace — the leads table shown in the main area when the agent
 * returns a `leads_preview`. Display + selection only; refinement happens
 * conversationally in the chat rail on the right.
 */
export default function LeadsWorkspace({ leadsView, onBackToChat }) {
  const leads = Array.isArray(leadsView?.leads) ? leadsView.leads : [];
  const totalMatched = leadsView?.totalMatched ?? leads.length;
  const filterSummary = leadsView?.filterSummary || '';

  const [selected, setSelected] = useState(() => new Set());

  const allSelected = leads.length > 0 && selected.size === leads.length;

  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(() => (allSelected ? new Set() : new Set(leads.map((l) => l.id))));

  const filterChips = useMemo(
    () => filterSummary.split(',').map((s) => s.trim()).filter(Boolean),
    [filterSummary]
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBackToChat}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors shrink-0"
              title="Back to chat"
            >
              <ArrowLeft className="w-4 h-4" />
              Chat
            </button>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-2 min-w-0">
              <Users className="w-5 h-5 text-blue-600 shrink-0" />
              <h1 className="text-lg font-semibold text-gray-900 truncate">Leads</h1>
              <span className="text-sm text-gray-400 shrink-0">
                <span className="font-semibold text-blue-600">{Number(totalMatched).toLocaleString()}</span> found
              </span>
            </div>
          </div>

          <button
            disabled={selected.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400"
          >
            <Download className="w-4 h-4" />
            {selected.size > 0 ? `Export ${selected.size}` : 'Export'}
          </button>
        </div>

        {filterChips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filterChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
              >
                {chip}
              </span>
            ))}
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              Showing first {leads.length}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <Users className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No leads to display.</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Industry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(lead.id)}
                      onChange={() => toggleOne(lead.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{fullName(lead)}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      {cell(lead.title)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      {cell(lead['Account Name'])}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {cell(lead['Mailing Country'])}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col gap-0.5">
                      {lead.email ? (
                        <span className="inline-flex items-center gap-1.5 text-blue-600">
                          <Mail className="w-3.5 h-3.5" />
                          {lead.email}
                        </span>
                      ) : null}
                      {lead.phone ? (
                        <span className="inline-flex items-center gap-1.5 text-gray-500">
                          <Phone className="w-3.5 h-3.5" />
                          {lead.phone}
                        </span>
                      ) : null}
                      {!lead.email && !lead.phone ? <span className="text-gray-400">—</span> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{cell(lead['GTM Industry'])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
