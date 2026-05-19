'use client';

import { useState, useEffect } from 'react';
import {
  Users, UserPlus, CalendarDays, TrendingUp,
  RefreshCw, Loader2, CheckCircle, XCircle,
  Briefcase, Wrench, ShieldCheck,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { getAdminUserAnalytics } from '@/lib/adminApi';

const ROLE_BADGE = {
  owner:  { label: 'Owner',  className: 'bg-blue-100 text-blue-700 border-blue-200' },
  expert: { label: 'Expert', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  admin:  { label: 'Admin',  className: 'bg-red-100 text-red-700 border-red-200' },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const load = () => {
    setLoading(true);
    setError(null);
    getAdminUserAnalytics()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const visibleUsers = data?.users?.filter(u => {
    const matchesRole   = roleFilter === 'all' || u.activeRole === roleFilter;
    const q             = search.toLowerCase();
    const matchesSearch = !q ||
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  }) ?? [];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Analytics</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Overview of all registered users and signup trends
              </p>
            </div>
            <button
              onClick={load}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 rounded-xl px-3 py-2 hover:border-blue-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Users}      label="Total Users"      value={data.counts.total}        color="bg-blue-50 text-blue-600" />
                <StatCard icon={CalendarDays} label="Joined Today"   value={data.counts.newToday}     color="bg-green-50 text-green-600" />
                <StatCard icon={TrendingUp} label="Joined This Week" value={data.counts.newThisWeek}  color="bg-orange-50 text-orange-600" />
                <StatCard icon={UserPlus}   label="Joined This Month" value={data.counts.newThisMonth} color="bg-purple-50 text-purple-600" />
              </div>

              {/* Role breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                  <Briefcase className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-bold text-gray-900">{data.roleBreakdown.owner}</p>
                    <p className="text-xs text-gray-500">Business Owners</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                  <Wrench className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-bold text-gray-900">{data.roleBreakdown.expert}</p>
                    <p className="text-xs text-gray-500">Experts</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-bold text-gray-900">{data.roleBreakdown.admin}</p>
                    <p className="text-xs text-gray-500">Admins</p>
                  </div>
                </div>
              </div>

              {/* User table */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                {/* Table toolbar */}
                <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 min-w-48 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <div className="flex gap-2">
                    {['all', 'owner', 'expert', 'admin'].map(r => (
                      <button
                        key={r}
                        onClick={() => setRoleFilter(r)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                          roleFilter === r
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {r === 'all' ? 'All' : ROLE_BADGE[r]?.label}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{visibleUsers.length} users</span>
                </div>

                {/* Table */}
                {visibleUsers.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 text-sm">No users found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Verified</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {visibleUsers.map(u => {
                          const badge = ROLE_BADGE[u.activeRole] ?? ROLE_BADGE.owner;
                          return (
                            <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                    {(u.fullName || u.email || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{u.fullName || '—'}</p>
                                    <p className="text-xs text-gray-400">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.className}`}>
                                  {badge.label}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                {u.isEmailVerified
                                  ? <CheckCircle className="w-4 h-4 text-green-500" />
                                  : <XCircle    className="w-4 h-4 text-gray-300" />}
                              </td>
                              <td className="px-5 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
