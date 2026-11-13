'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Linkedin, Mail, ChevronRight, RefreshCw } from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { adminGetAllProjects } from '@/lib/contentProjectApi';

const STATUS_META = {
  intake_pending:     { label: 'Awaiting Brief',  color: 'bg-amber-100  text-amber-700  border-amber-200' },
  in_review:          { label: 'Under Review',    color: 'bg-blue-100   text-blue-700   border-blue-200' },
  generating:         { label: 'Generating…',     color: 'bg-purple-100 text-purple-700 border-purple-200' },
  admin_review:       { label: 'Admin Review',    color: 'bg-violet-100 text-violet-700 border-violet-200' },
  draft_ready:        { label: 'Sent to Client',  color: 'bg-green-100  text-green-700  border-green-200' },
  revision_requested: { label: 'Needs Revision',  color: 'bg-orange-100 text-orange-700 border-orange-200' },
  approved:           { label: 'Approved',        color: 'bg-green-200  text-green-800  border-green-300' },
  delivered:          { label: 'Delivered',       color: 'bg-gray-100   text-gray-600   border-gray-200' },
};

const STATUSES = ['', 'intake_pending', 'in_review', 'generating', 'admin_review',
                  'draft_ready', 'revision_requested', 'approved', 'delivered'];

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function AdminContentProjectList() {
  const router   = useRouter();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [status,  setStatus]  = useState('');

  useEffect(() => { load(); }, [status]);

  // Silent background poll — picks up new briefs without disrupting the view
  useEffect(() => {
    const t = setInterval(silentRefresh, 10000);
    return () => clearInterval(t);
  }, [status]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await adminGetAllProjects(status ? { status } : {});
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function silentRefresh() {
    try {
      const result = await adminGetAllProjects(status ? { status } : {});
      setData(result);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Projects</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {data?.total ?? '—'} total projects
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUSES.map(s => (
            <button
              key={s || 'all'}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                status === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {s ? STATUS_META[s]?.label : 'All'}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : data?.projects?.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No content projects found.</div>
        ) : (
          <div className="space-y-3">
            {data?.projects?.map(p => {
              const meta = STATUS_META[p.status] || STATUS_META.intake_pending;
              return (
                <div
                  key={p._id}
                  onClick={() => router.push(`/admin/content-projects/${p._id}`)}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                    {(p.userId?.fullName || 'U').charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {p.intake?.companyName || p.userId?.fullName || 'Unnamed project'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.userId?.email} • {formatDate(p.createdAt)}
                    </p>
                  </div>

                  {/* Month */}
                  {p.month && (
                    <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">{p.month}</span>
                  )}

                  {/* Versions */}
                  <div className="flex items-center gap-2 flex-shrink-0 hidden sm:flex">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                      {p.contentVersions?.length > 0
                        ? `v${p.contentVersions[p.contentVersions.length - 1].versionNumber}`
                        : '—'}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${meta.color}`}>
                    {meta.label}
                  </span>

                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <AdminContentProjectList />
    </AdminGuard>
  );
}
