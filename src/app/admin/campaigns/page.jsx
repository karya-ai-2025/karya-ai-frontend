'use client';

// Campaigns admins have built for customers.
//
// The Start button here reserves the CUSTOMER'S credits and sends on their
// behalf — so it refuses unless their ICP is approved, and says why when it
// refuses.

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, RefreshCw, Plus, ArrowLeft, Play, Users, Clock, AlertTriangle,
  Crosshair, Mail, CheckCircle2, User, Eye,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import {
  fetchAdminCampaigns, startCampaignFor,
  CAMPAIGN_STATUS_THEME, icpState,
} from '@/lib/adminCampaignApi';

function timeAgo(iso) {
  if (!iso) return '';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function AdminCampaigns() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingId, setStartingId] = useState(null);
  // Keyed by campaign id, so a refusal shows against the row it belongs to.
  const [rowMessage, setRowMessage] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCampaigns(await fetchAdminCampaigns());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const start = async (c) => {
    setStartingId(c._id);
    setRowMessage((m) => ({ ...m, [c._id]: null }));
    try {
      const res = await startCampaignFor(c._id);
      setRowMessage((m) => ({ ...m, [c._id]: { tone: 'ok', text: res.message } }));
      await load();
    } catch (e) {
      setRowMessage((m) => ({ ...m, [c._id]: { tone: 'error', text: e.message } }));
    } finally {
      setStartingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <button
              onClick={() => router.push('/admin/icp')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> ICP management
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Campaigns built for customers</h1>
            <p className="text-sm text-gray-500 mt-1">
              Each belongs to the customer named on it. Starting one spends their credits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={() => router.push('/admin/campaigns/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> New campaign
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading && campaigns.length === 0 && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}

        {!loading && campaigns.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-900">Nothing here yet</p>
            <p className="text-sm text-gray-500 mt-1">
              After a call with a customer, build their campaign here.
            </p>
            <button
              onClick={() => router.push('/admin/campaigns/new')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> New campaign
            </button>
          </div>
        )}

        <div className="space-y-3">
          {campaigns.map((c) => {
            const icp = icpState(c.icp?.status);
            const canStart = ['draft', 'scheduled', 'paused'].includes(c.status);
            const msg = rowMessage[c._id];
            return (
              <div key={c._id} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => router.push(`/admin/campaigns/${c._id}`)}
                        className="text-base font-bold text-gray-900 truncate hover:text-blue-600 transition-colors text-left"
                      >
                        {c.name}
                      </button>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${CAMPAIGN_STATUS_THEME[c.status] || CAMPAIGN_STATUS_THEME.draft}`}>
                        {c.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${icp.theme}`}>
                        {icp.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {c.userId?.fullName || 'Unknown'} · {c.userId?.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> {c.leadCount} recipients
                      </span>
                      {c.stats?.sentCount > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> {c.stats.sentCount} sent
                          {c.stats.openedCount > 0 && ` · ${c.stats.openedCount} opened`}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> built {timeAgo(c.createdAt)}
                        {c.createdByAdmin?.email ? ` by ${c.createdByAdmin.email}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => router.push(`/admin/campaigns/${c._id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Open
                    </button>
                    {!c.icp && (
                      <button
                        onClick={() => router.push('/admin/icp')}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                      >
                        <Crosshair className="w-3.5 h-3.5" /> Create ICP
                      </button>
                    )}
                    {canStart && (
                      <button
                        onClick={() => start(c)}
                        disabled={startingId === c._id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors"
                      >
                        {startingId === c._id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Play className="w-3.5 h-3.5" />}
                        Start for them
                      </button>
                    )}
                  </div>
                </div>

                {msg && (
                  <div
                    className={`flex items-start gap-2 p-3 rounded-xl border ${
                      msg.tone === 'ok'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    {msg.tone === 'ok'
                      ? <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      : <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />}
                    <p className={`text-sm ${msg.tone === 'ok' ? 'text-green-700' : 'text-red-700'}`}>
                      {msg.text}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <AdminCampaigns />
    </AdminGuard>
  );
}
