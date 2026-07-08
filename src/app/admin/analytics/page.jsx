'use client';

import { useState, useEffect } from 'react';
import {
  Users, UserPlus, CalendarDays, TrendingUp,
  RefreshCw, Loader2, CheckCircle, XCircle,
  Briefcase, Wrench, ShieldCheck, Activity,
  Zap, AlertTriangle, Clock, Eye,
  ServerCrash, BarChart2, Info,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { getAdminUserAnalytics, getAzureAnalytics } from '@/lib/adminApi';
import ProductAnalytics from '@/components/analytics/ProductAnalytics';

// ── shared helpers ─────────────────────────────────────────────────────────────

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

function shortDate(isoStr) {
  return new Date(isoStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── stat card ──────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── simple inline bar chart ────────────────────────────────────────────────────

function MiniBarChart({ rows, valueKey, labelKey = 'timestamp', color = 'bg-blue-500', height = 72 }) {
  if (!rows?.length) return <p className="text-xs text-gray-400 py-4 text-center">No data</p>;
  const nums = rows.map(r => Number(r[valueKey]) || 0);
  const max  = Math.max(...nums, 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {rows.map((r, i) => {
        const val  = nums[i];
        // pixel height — percentage heights fail when the flex wrapper has no explicit height
        const barH = Math.max(Math.round((val / max) * height), 2);
        return (
          <div key={i} className="flex-1 relative group">
            <div
              className={`w-full rounded-sm ${color} opacity-80 group-hover:opacity-100 transition-opacity`}
              style={{ height: barH }}
            />
            {/* tooltip */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {shortDate(r[labelKey])}: {val.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── section divider ────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, desc, badge, iconBg }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {badge && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">{badge}</span>
          )}
        </div>
        {desc && <p className="text-sm text-gray-500">{desc}</p>}
      </div>
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [dbData,    setDbData]    = useState(null);
  const [azData,    setAzData]    = useState(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [azLoading, setAzLoading] = useState(true);
  const [dbError,   setDbError]   = useState(null);
  const [azError,   setAzError]   = useState(null);
  const [search,    setSearch]    = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  function loadDb() {
    setDbLoading(true); setDbError(null);
    getAdminUserAnalytics()
      .then(setDbData).catch(e => setDbError(e.message))
      .finally(() => setDbLoading(false));
  }

  function loadAz() {
    setAzLoading(true); setAzError(null);
    getAzureAnalytics()
      .then(setAzData).catch(e => setAzError(e.message))
      .finally(() => setAzLoading(false));
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot data fetch on mount
  useEffect(() => { loadDb(); loadAz(); }, []);

  const visibleUsers = dbData?.users?.filter(u => {
    const matchesRole   = roleFilter === 'all' || u.activeRole === roleFilter;
    const q             = search.toLowerCase();
    const matchesSearch = !q || u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  }) ?? [];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* ── Page header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-sm text-gray-500 mt-0.5">DB user stats + Azure Application Insights</p>
            </div>
            <button
              onClick={() => { loadDb(); loadAz(); }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 rounded-xl px-3 py-2 hover:border-blue-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh all
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 0 — PRODUCT ANALYTICS (MongoDB user behaviour)
          ══════════════════════════════════════════════════════════════════ */}
          <section>
            <SectionHeader
              icon={BarChart2}
              iconBg="bg-indigo-50 text-indigo-600"
              title="Product Analytics"
              desc="User behaviour, events, funnels & sessions — production traffic only"
              badge="Live"
            />
            <ProductAnalytics />
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 1 — DATABASE / USER ANALYTICS
          ══════════════════════════════════════════════════════════════════ */}
          <section>
            <SectionHeader
              icon={Users}
              iconBg="bg-blue-50 text-blue-600"
              title="User Analytics"
              desc="Registrations and role breakdown from your database"
            />

            {dbLoading && <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>}
            {dbError   && <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-600">{dbError}</div>}

            {!dbLoading && !dbError && dbData && (
              <>
                {/* Signup stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <StatCard icon={Users}       label="Total Users"        value={dbData.counts.total}        color="bg-blue-50 text-blue-600" />
                  <StatCard icon={CalendarDays} label="Joined Today"      value={dbData.counts.newToday}     color="bg-green-50 text-green-600" />
                  <StatCard icon={TrendingUp}  label="Joined This Week"   value={dbData.counts.newThisWeek}  color="bg-orange-50 text-orange-600" />
                  <StatCard icon={UserPlus}    label="Joined This Month"  value={dbData.counts.newThisMonth} color="bg-purple-50 text-purple-600" />
                </div>

                {/* Role breakdown */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <Briefcase className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div><p className="text-xl font-bold text-gray-900">{dbData.roleBreakdown.owner}</p><p className="text-xs text-gray-500">Business Owners</p></div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <Wrench className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <div><p className="text-xl font-bold text-gray-900">{dbData.roleBreakdown.expert}</p><p className="text-xs text-gray-500">Experts</p></div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div><p className="text-xl font-bold text-gray-900">{dbData.roleBreakdown.admin}</p><p className="text-xs text-gray-500">Admins</p></div>
                  </div>
                </div>

                {/* User table */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
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
                        <button key={r} onClick={() => setRoleFilter(r)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                            roleFilter === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                          }`}>
                          {r === 'all' ? 'All' : ROLE_BADGE[r]?.label}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{visibleUsers.length} users</span>
                  </div>
                  {visibleUsers.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-sm">No users found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            {['User', 'Role', 'Email Verified', 'Joined'].map(h => (
                              <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                            ))}
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
                                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.className}`}>{badge.label}</span>
                                </td>
                                <td className="px-5 py-3">
                                  {u.isEmailVerified ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
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
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 2 — AZURE APPLICATION INSIGHTS
          ══════════════════════════════════════════════════════════════════ */}
          <section>
            <SectionHeader
              icon={Activity}
              iconBg="bg-sky-50 text-sky-600"
              title="Azure Application Insights"
              desc="Live platform telemetry — last 7 days"
              badge="Azure"
            />

            {azLoading && <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-sky-500 animate-spin" /></div>}
            {azError   && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-600 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div><p className="font-semibold">Failed to load Azure analytics</p><p className="mt-0.5">{azError}</p></div>
              </div>
            )}

            {/* ── Not configured ── */}
            {!azLoading && !azError && azData && !azData.configured && (
              <div className="bg-white border border-dashed border-sky-300 rounded-2xl p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                    <Info className="w-6 h-6 text-sky-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Application Insights not connected yet</h3>
                    <p className="text-sm text-gray-500 mb-5">
                      Add two environment variables to your backend <code className="bg-gray-100 px-1 rounded text-xs">.env</code> to enable live Azure telemetry.
                    </p>

                    {/* Step-by-step guide */}
                    <div className="space-y-3">
                      {[
                        {
                          step: '1',
                          title: 'Open Azure Portal',
                          desc: 'Go to portal.azure.com → search "Application Insights" → open your resource (or create one and link it to your App Service).',
                        },
                        {
                          step: '2',
                          title: 'Get your Application ID',
                          desc: <>Navigate to <strong>Configure → API Access</strong>. Copy the <strong>Application ID</strong> at the top.</>,
                        },
                        {
                          step: '3',
                          title: 'Create an API Key',
                          desc: <>On the same page click <strong>+ Create API key</strong>, give it a name, tick <strong>Read telemetry</strong>, then copy the generated key (shown only once).</>,
                        },
                        {
                          step: '4',
                          title: 'Add to .env',
                          desc: (
                            <pre className="bg-gray-900 text-green-400 text-xs rounded-xl p-4 mt-2 overflow-x-auto">
{`AZURE_APP_INSIGHTS_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_APP_INSIGHTS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}
                            </pre>
                          ),
                        },
                        {
                          step: '5',
                          title: 'Restart the backend & refresh this page',
                          desc: 'The Azure section will populate automatically once the env vars are loaded.',
                        },
                      ].map(({ step, title, desc }) => (
                        <div key={step} className="flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step}</div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{title}</p>
                            <div className="text-sm text-gray-500">{desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Configured — show data ── */}
            {!azLoading && !azError && azData?.configured && (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                  <StatCard
                    icon={Zap}          label="Total Requests"  color="bg-sky-50 text-sky-600"
                    value={(azData.totals?.totalRequests ?? 0).toLocaleString()}
                    sub="last 7 days"
                  />
                  <StatCard
                    icon={Eye}          label="Page Views"      color="bg-indigo-50 text-indigo-600"
                    value={(azData.totals?.totalPageViews ?? 0).toLocaleString()}
                    sub="last 7 days"
                  />
                  <StatCard
                    icon={Clock}        label="Avg Response"    color="bg-green-50 text-green-600"
                    value={azData.totals?.avgResponseMs ? `${azData.totals.avgResponseMs} ms` : '—'}
                    sub="server-side"
                  />
                  <StatCard
                    icon={AlertTriangle} label="Failed Requests" color="bg-orange-50 text-orange-600"
                    value={(azData.totals?.failedRequests ?? 0).toLocaleString()}
                    sub={
                      azData.totals?.totalRequests
                        ? `${((azData.totals.failedRequests / azData.totals.totalRequests) * 100).toFixed(1)}% error rate`
                        : 'last 7 days'
                    }
                  />
                  <StatCard
                    icon={ServerCrash}  label="Exceptions"      color="bg-red-50 text-red-500"
                    value={(azData.totals?.totalExceptions ?? 0).toLocaleString()}
                    sub="last 7 days"
                  />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* Requests chart */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart2 className="w-4 h-4 text-sky-500" />
                      <p className="text-sm font-semibold text-gray-800">Requests / day</p>
                    </div>
                    <MiniBarChart rows={azData.requests} valueKey="count_" color="bg-sky-400" height={72} />
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      {azData.requests?.length > 0 && (
                        <>
                          <span>{shortDate(azData.requests[0].timestamp)}</span>
                          <span>{shortDate(azData.requests[azData.requests.length - 1].timestamp)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Page views chart */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="w-4 h-4 text-indigo-500" />
                      <p className="text-sm font-semibold text-gray-800">Page views / day</p>
                    </div>
                    <MiniBarChart rows={azData.pageViews} valueKey="count_" color="bg-indigo-400" height={72} />
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      {azData.pageViews?.length > 0 && (
                        <>
                          <span>{shortDate(azData.pageViews[0].timestamp)}</span>
                          <span>{shortDate(azData.pageViews[azData.pageViews.length - 1].timestamp)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Response time chart */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-green-500" />
                      <p className="text-sm font-semibold text-gray-800">Avg response time (ms)</p>
                    </div>
                    <MiniBarChart rows={azData.responseTime} valueKey="avgMs" color="bg-green-400" height={72} />
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      {azData.responseTime?.length > 0 && (
                        <>
                          <span>{shortDate(azData.responseTime[0].timestamp)}</span>
                          <span>{shortDate(azData.responseTime[azData.responseTime.length - 1].timestamp)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error rate + exceptions row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                  {/* Error rate per day */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <p className="text-sm font-semibold text-gray-800">Error rate % / day</p>
                    </div>
                    {azData.errors?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-400 border-b border-gray-100">
                              <th className="text-left pb-2 font-medium">Date</th>
                              <th className="text-right pb-2 font-medium">Total</th>
                              <th className="text-right pb-2 font-medium">Failed</th>
                              <th className="text-right pb-2 font-medium">Error %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {azData.errors.slice(-7).map((r, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="py-1.5 text-gray-600">{shortDate(r.timestamp)}</td>
                                <td className="py-1.5 text-right text-gray-700">{Number(r.total).toLocaleString()}</td>
                                <td className="py-1.5 text-right text-orange-600">{Number(r.failed).toLocaleString()}</td>
                                <td className="py-1.5 text-right">
                                  <span className={`font-semibold ${r.errorRate > 5 ? 'text-red-600' : r.errorRate > 1 ? 'text-orange-500' : 'text-green-600'}`}>
                                    {r.errorRate}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <p className="text-xs text-gray-400 py-4 text-center">No error data</p>}
                  </div>

                  {/* Exceptions chart */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <ServerCrash className="w-4 h-4 text-red-500" />
                      <p className="text-sm font-semibold text-gray-800">Exceptions / day</p>
                    </div>
                    <MiniBarChart rows={azData.exceptions} valueKey="count_" color="bg-red-400" height={72} />
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      {azData.exceptions?.length > 0 && (
                        <>
                          <span>{shortDate(azData.exceptions[0].timestamp)}</span>
                          <span>{shortDate(azData.exceptions[azData.exceptions.length - 1].timestamp)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

        </div>
      </div>
    </AdminGuard>
  );
}
