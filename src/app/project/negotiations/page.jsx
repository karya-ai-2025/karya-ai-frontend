'use client';

import { useState, useEffect } from 'react';
import {
  Check, X, Clock, CheckCircle, XCircle,
  Package, Tag, Loader2, RefreshCw, Trash2,
} from 'lucide-react';
import { getAllNegotiations, updateNegotiationStatus, deleteNegotiation } from '@/lib/negotiationApi';
import AdminGuard from '@/components/AdminGuard';

const ALL_TIER_DELIVERABLES = [
  { key: 'crmExport',             label: 'Verified contact list (CSV / CRM format)' },
  { key: 'linkedinProfiles',      label: 'Decision-maker profiles with titles & LinkedIn' },
  { key: 'emailVerified',         label: 'Email verification & deliverability check' },
  { key: 'companyIntelligence',   label: 'Company intelligence (size, revenue, tech stack)' },
  { key: 'decisionMakerProfiles', label: 'Custom outreach sequence templates (3 variants)' },
  { key: 'icpScoring',            label: 'ICP score & fit rating for each contact' },
  { key: 'intentData',            label: 'Revenue intelligence & buying intent signals' },
  { key: 'dedicatedPM',           label: 'Dedicated account manager' },
  { key: 'abTesting',             label: 'A/B testing setup & weekly optimisation reports' },
];

function labelForKey(key) {
  return ALL_TIER_DELIVERABLES.find(d => d.key === key)?.label || key;
}

const STATUS_CONFIG = {
  pending:  { bg: 'bg-amber-100 text-amber-700 border-amber-200',  Icon: Clock,        label: 'Pending' },
  approved: { bg: 'bg-green-100 text-green-700 border-green-200',  Icon: CheckCircle,  label: 'Approved' },
  rejected: { bg: 'bg-red-100 text-red-600 border-red-200',        Icon: XCircle,      label: 'Rejected' },
};

export default function NegotiationsPage() {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    getAllNegotiations()
      .then(setNegotiations)
      .catch(() => setNegotiations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, status) => {
    setActionLoading(prev => ({ ...prev, [id]: status }));
    try {
      await updateNegotiationStatus(id, status);
      setNegotiations(prev =>
        prev.map(n => n._id === id ? { ...n, status } : n)
      );
    } catch {
      // keep current state on error
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleClear = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'clear' }));
    try {
      await deleteNegotiation(id);
      setNegotiations(prev => prev.filter(n => n._id !== id));
    } catch {
      // keep current state on error
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const counts = {
    all:      negotiations.length,
    pending:  negotiations.filter(n => n.status === 'pending').length,
    approved: negotiations.filter(n => n.status === 'approved').length,
    rejected: negotiations.filter(n => n.status === 'rejected').length,
  };

  const visible = filter === 'all' ? negotiations : negotiations.filter(n => n.status === filter);

  return (
    <AdminGuard>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Negotiations</h1>
            <p className="text-sm text-gray-500 mt-0.5">Review and act on deliverable customisation requests</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 rounded-xl px-3 py-2 hover:border-blue-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stat chips + filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all',      label: 'All',      count: counts.all },
            { key: 'pending',  label: 'Pending',  count: counts.pending },
            { key: 'approved', label: 'Approved', count: counts.approved },
            { key: 'rejected', label: 'Rejected', count: counts.rejected },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs font-bold ${filter === tab.key ? 'opacity-80' : 'text-gray-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-semibold text-gray-400">No negotiations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map(n => {
              const cfg = STATUS_CONFIG[n.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.Icon;
              const isActing = actionLoading[n._id];

              // Diff: what was removed vs added vs unchanged
              const removed   = (n.originalDeliverables || []).filter(k => !(n.modifiedDeliverables || []).includes(k));
              const added     = (n.modifiedDeliverables  || []).filter(k => !(n.originalDeliverables || []).includes(k));
              const unchanged = (n.originalDeliverables  || []).filter(k =>  (n.modifiedDeliverables || []).includes(k));

              return (
                <div key={n._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                  {/* Card header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {n.userId?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{n.userId?.fullName || 'Unknown User'}</p>
                        <p className="text-xs text-gray-400">{n.userId?.email || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${cfg.bg}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    {/* Project + Tier */}
                    <div className="flex items-center gap-4 mb-4 flex-wrap">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">{n.projectSlug}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Tag className="w-4 h-4 text-orange-500" />
                        <span className="capitalize font-medium">{n.tierId} tier</span>
                      </div>
                    </div>

                    {/* Deliverable diff — side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                          Original ({(n.originalDeliverables || []).length})
                        </p>
                        <div className="space-y-1">
                          {(n.originalDeliverables || []).map(k => (
                            <div
                              key={k}
                              className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${
                                removed.includes(k)
                                  ? 'bg-red-50 text-red-600 line-through'
                                  : 'bg-gray-50 text-gray-600'
                              }`}
                            >
                              {removed.includes(k)
                                ? <X className="w-3 h-3 flex-shrink-0" />
                                : <Check className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                              {labelForKey(k)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                          Requested ({(n.modifiedDeliverables || []).length})
                        </p>
                        <div className="space-y-1">
                          {(n.modifiedDeliverables || []).map(k => (
                            <div
                              key={k}
                              className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${
                                added.includes(k)
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-gray-50 text-gray-600'
                              }`}
                            >
                              <Check className={`w-3 h-3 flex-shrink-0 ${added.includes(k) ? 'text-green-600' : 'text-gray-400'}`} />
                              {labelForKey(k)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* User note */}
                    {n.userNote && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
                        <p className="text-xs font-semibold text-blue-700 mb-1">User Note</p>
                        <p className="text-sm text-blue-800 italic">"{n.userNote}"</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      {n.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(n._id, 'approved')}
                            disabled={!!isActing}
                            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                          >
                            {isActing === 'approved'
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Check className="w-4 h-4" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(n._id, 'rejected')}
                            disabled={!!isActing}
                            className="flex-1 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                          >
                            {isActing === 'rejected'
                              ? <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                              : <X className="w-4 h-4" />}
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleClear(n._id)}
                        disabled={!!isActing}
                        className="px-4 py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-red-500 hover:border-red-200 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                        title="Delete this negotiation so the user can re-submit"
                      >
                        {isActing === 'clear'
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </AdminGuard>
  );
}
