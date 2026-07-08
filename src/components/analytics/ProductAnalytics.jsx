'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  Users, Eye, Clock, RefreshCw, Loader2, Download,
  TrendingUp, Zap, MousePointerClick, Filter, Globe, Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getProductAnalytics } from '@/lib/adminApi';

// ── helpers ──────────────────────────────────────────────────────────────────
const nfmt = (n) => Number(n || 0).toLocaleString();
const secToDur = (s) => {
  s = Number(s || 0);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
};

const exportRows = (rows, name, type) => {
  if (!rows?.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  if (type === 'xlsx') {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analytics');
    XLSX.writeFile(wb, `${name}.xlsx`);
  } else {
    const csv = XLSX.utils.sheet_to_csv(ws);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `${name}.csv`; a.click();
    URL.revokeObjectURL(url);
  }
};

function Card({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {sub != null && <p className="text-[11px] text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, right, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          <p className="text-sm font-semibold text-gray-800">{title}</p>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

const ExportBtns = ({ rows, name }) => (
  <div className="flex gap-1">
    <button onClick={() => exportRows(rows, name, 'csv')} className="text-[11px] font-semibold text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg px-2 py-1 flex items-center gap-1">
      <Download className="w-3 h-3" /> CSV
    </button>
    <button onClick={() => exportRows(rows, name, 'xlsx')} className="text-[11px] font-semibold text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg px-2 py-1">
      Excel
    </button>
  </div>
);

// ── main ─────────────────────────────────────────────────────────────────────
export default function ProductAnalytics() {
  const [preset, setPreset] = useState(30); // days: 7 / 30 / 90
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageSearch, setPageSearch] = useState('');
  const [pageNum, setPageNum] = useState(1);

  // Fixed rolling window. Filters the trends & breakdowns below.
  const qs = useCallback(() => {
    const to = new Date();
    const from = new Date(Date.now() - preset * 864e5);
    return `?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;
  }, [preset]);

  const loadAll = useCallback(async () => {
    setLoading(true); setError(null);
    const sections = ['overview', 'pages', 'events', 'active-users', 'funnels', 'features', 'geography'];
    const rangeBased = ['pages', 'events', 'features', 'geography', 'active-users'];
    try {
      const results = await Promise.allSettled(
        sections.map((s) => getProductAnalytics(s, rangeBased.includes(s) ? qs() : ''))
      );
      const next = {};
      sections.forEach((s, i) => { next[s] = results[i].status === 'fulfilled' ? results[i].value : null; });
      setData(next);
      if (results.every((r) => r.status === 'rejected')) setError('Failed to load analytics.');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [qs]);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  if (error) return <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-600">{error}</div>;

  const o = data.overview || {};
  const funnel = data.funnels || [];
  const features = data.features || [];
  const events = data.events || {};
  const geo = data.geography || {};
  const activeUsers = data['active-users'] || {};
  const pagesData = data.pages || {};

  // paginated + searched pages table
  const allPages = (pagesData.mostVisited || []).filter((p) => !pageSearch || (p.page || '').toLowerCase().includes(pageSearch.toLowerCase()));
  const PER = 8;
  const totalPages = Math.max(1, Math.ceil(allPages.length / PER));
  const pageRows = allPages.slice((pageNum - 1) * PER, pageNum * PER);
  const maxFunnel = funnel[0]?.count || 1;

  return (
    <div className="space-y-6">
      {/* Date range presets */}
      <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setPreset(d)}
              className={`text-xs font-semibold rounded-lg px-3 py-1.5 border transition-colors ${
                preset === d ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}>
              Last {d}d
            </button>
          ))}
          <button onClick={loadAll} title="Refresh"
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Applies to the trends & breakdowns below (pages, events, features, geography, active users). The snapshot cards show current totals.
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card icon={Users} label="Today" value={nfmt(o.todayUsers)} color="bg-blue-50 text-blue-600" />
        <Card icon={Users} label="This week" value={nfmt(o.weeklyUsers)} color="bg-indigo-50 text-indigo-600" />
        <Card icon={Users} label="This month" value={nfmt(o.monthlyUsers)} color="bg-violet-50 text-violet-600" />
        <Card icon={TrendingUp} label="Total users" value={nfmt(o.totalUsers)} color="bg-emerald-50 text-emerald-600" />
        <Card icon={Eye} label="Page views" value={nfmt(o.totalPageViews)} color="bg-sky-50 text-sky-600" />
        <Card icon={Clock} label="Avg session" value={secToDur(o.avgSessionDurationSec)} color="bg-rose-50 text-rose-600" />
      </div>

      {/* Traffic + user growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Page views / day" icon={Eye}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={pagesData.trend || []}>
              <defs><linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#pv)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Active users / day" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={activeUsers.activeTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span>DAU <b className="text-gray-900">{nfmt(activeUsers.dailyActiveUsers)}</b></span>
            <span>WAU <b className="text-gray-900">{nfmt(activeUsers.weeklyActiveUsers)}</b></span>
            <span>MAU <b className="text-gray-900">{nfmt(activeUsers.monthlyActiveUsers)}</b></span>
          </div>
        </Panel>
      </div>

      {/* Feature usage + funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Feature usage" icon={Layers} right={<ExportBtns rows={features} name="feature-usage" />}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={features} layout="vertical" margin={{ left: 30 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
              <YAxis type="category" dataKey="feature" tick={{ fontSize: 11 }} width={110} stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="usage" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Conversion funnel" icon={MousePointerClick}>
          <div className="space-y-2.5">
            {funnel.map((step, i) => {
              const pct = Math.round((step.count / maxFunnel) * 100);
              return (
                <div key={step.step}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium">{step.step}</span>
                    <span className="text-gray-500">{nfmt(step.count)}{i > 0 && step.dropOffPct > 0 && <span className="text-red-500 ml-2">-{step.dropOffPct}%</span>}</span>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {funnel.length === 0 && <p className="text-xs text-gray-400 text-center py-6">No funnel data yet</p>}
          </div>
        </Panel>
      </div>

      {/* Top pages (searchable + paginated) */}
      <Panel title="Top pages" icon={Eye} right={
        <div className="flex items-center gap-2">
          <input value={pageSearch} onChange={(e) => { setPageSearch(e.target.value); setPageNum(1); }} placeholder="Search page..."
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300" />
          <ExportBtns rows={pagesData.mostVisited} name="top-pages" />
        </div>
      }>
        <table className="w-full text-sm">
          <thead><tr className="text-gray-400 border-b border-gray-100 text-xs">
            <th className="text-left pb-2 font-medium">Page</th>
            <th className="text-right pb-2 font-medium">Visits</th>
            <th className="text-right pb-2 font-medium">Unique</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {pageRows.map((p) => (
              <tr key={p.page} className="hover:bg-gray-50">
                <td className="py-2 text-gray-700 truncate max-w-xs">{p.page || '—'}</td>
                <td className="py-2 text-right text-gray-900 font-medium">{nfmt(p.visits)}</td>
                <td className="py-2 text-right text-gray-500">{nfmt(p.uniqueVisitors)}</td>
              </tr>
            ))}
            {pageRows.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-gray-400 text-xs">No pages</td></tr>}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>Page {pageNum} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={pageNum === 1} onClick={() => setPageNum((n) => n - 1)} className="px-2 py-1 border border-gray-200 rounded-lg disabled:opacity-40">Prev</button>
              <button disabled={pageNum === totalPages} onClick={() => setPageNum((n) => n + 1)} className="px-2 py-1 border border-gray-200 rounded-lg disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </Panel>

      {/* Top events */}
      <Panel title="Top events" icon={Zap} right={<ExportBtns rows={events.events} name="top-events" />}>
        <div className="flex gap-3 mb-3 text-xs">
          <span className="text-emerald-600">Success {events.successRate ?? 0}%</span>
          <span className="text-red-500">Failure {events.failureRate ?? 0}%</span>
          <span className="text-gray-400 ml-auto">{nfmt(events.totalEvents)} total</span>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-gray-400 border-b border-gray-100 text-xs">
            <th className="text-left pb-2 font-medium">Event</th><th className="text-right pb-2 font-medium">Count</th><th className="text-right pb-2 font-medium">Fail</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {(events.events || []).slice(0, 12).map((e) => (
              <tr key={e.eventType} className="hover:bg-gray-50">
                <td className="py-1.5 text-gray-700">{e.eventType}</td>
                <td className="py-1.5 text-right font-medium text-gray-900">{nfmt(e.count)}</td>
                <td className="py-1.5 text-right text-red-500">{nfmt(e.failure)}</td>
              </tr>
            ))}
            {(!events.events || events.events.length === 0) && <tr><td colSpan={3} className="py-6 text-center text-gray-400 text-xs">No events</td></tr>}
          </tbody>
        </table>
      </Panel>

      {/* Geography + active users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Users by country" icon={Globe} right={<ExportBtns rows={geo.byCountry} name="geography" />}>
          {(geo.byCountry || []).length === 0 ? <p className="text-xs text-gray-400 text-center py-6">No geography data</p> : (
            <div className="space-y-2">
              {(geo.byCountry || []).slice(0, 8).map((c) => {
                const max = geo.byCountry[0]?.users || 1;
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-16 truncate">{c.name}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-md overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-md" style={{ width: `${Math.round((c.users / max) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">{nfmt(c.users)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title="Most active users" icon={Users}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase mb-2">Experts</p>
              {(activeUsers.mostActiveExperts || []).slice(0, 5).map((u) => (
                <div key={u.userId} className="flex justify-between text-xs py-1"><span className="text-gray-700 truncate">{u.name}</span><span className="text-gray-400">{u.events}</span></div>
              ))}
              {(!activeUsers.mostActiveExperts || activeUsers.mostActiveExperts.length === 0) && <p className="text-xs text-gray-400">—</p>}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase mb-2">Businesses</p>
              {(activeUsers.mostActiveBusinesses || []).slice(0, 5).map((u) => (
                <div key={u.userId} className="flex justify-between text-xs py-1"><span className="text-gray-700 truncate">{u.name}</span><span className="text-gray-400">{u.events}</span></div>
              ))}
              {(!activeUsers.mostActiveBusinesses || activeUsers.mostActiveBusinesses.length === 0) && <p className="text-xs text-gray-400">—</p>}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
