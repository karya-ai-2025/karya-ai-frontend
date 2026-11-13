'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, RefreshCw, ArrowLeft, Server, Globe, Database, Activity,
  CreditCard, ShieldCheck, Cloud, AlertTriangle, Info, ChevronDown, ChevronRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import AdminGuard from '@/components/AdminGuard';
import {
  fetchOverview, fetchErrors, refreshNow, statusMeta, timeAgo, money,
} from '@/lib/infraApi';

const WINDOWS = [
  { key: '1h', label: 'Last hour' },
  { key: '6h', label: '6 hours' },
  { key: '24h', label: '24 hours' },
  { key: '7d', label: '7 days' },
];

/** One status card. Shows the value it has, never a value it doesn't (§33). */
function StatusCard({ icon: Icon, title, status, value, detail, footnote, onClick }) {
  const meta = statusMeta(status);
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`text-left bg-white border border-gray-200 rounded-xl p-4 ${
        onClick ? 'hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer w-full' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 truncate">
            {title}
          </span>
        </div>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${meta.chip}`}>
          {meta.dot} {meta.label}
        </span>
      </div>
      <div className="text-xl font-bold text-gray-900 tabular-nums truncate">{value ?? '—'}</div>
      {detail && <p className="mt-1 text-xs text-gray-600 line-clamp-2">{detail}</p>}
      {footnote && <p className="mt-1.5 text-[11px] text-gray-400">{footnote}</p>}
    </Tag>
  );
}

function Section({ title, subtitle, children, right }) {
  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

/** Shown when an integration isn't wired up — explains exactly what's missing (§27). */
function NotConfigured({ report, what }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900">{what} is not configured</h3>
          <p className="mt-1 text-sm text-gray-600">
            Azure monitoring credentials or permissions are not configured for this
            environment, so this section cannot report a status.
          </p>
          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            What is needed
          </button>

          {open && (
            <div className="mt-3 space-y-3">
              {report?.missing?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                    Missing configuration
                  </p>
                  <ul className="space-y-1">
                    {report.missing.map((m) => (
                      <li key={m} className="text-sm text-gray-700 font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report?.requiredRoles?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                    Azure roles required
                  </p>
                  <div className="space-y-1.5">
                    {report.requiredRoles.map((r, i) => (
                      <div key={i} className="text-sm border border-gray-200 rounded px-2.5 py-1.5">
                        <span className="font-semibold text-gray-900">{r.role}</span>
                        <span className="text-gray-500"> on {r.scope}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{r.why}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400">
                Set these as environment variables on the App Service. Values are read
                server-side only and are never sent to the browser.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfraDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [window_, setWindow] = useState('24h');

  const [errorRows, setErrorRows] = useState(null);
  const [errKind, setErrKind] = useState('all');
  const [errWindow, setErrWindow] = useState('24h');

  const load = useCallback(async (force = false) => {
    setError('');
    try {
      setData(await fetchOverview({ window: window_, force }));
    } catch (e) {
      setError(e.status === 403
        ? 'This page is restricted to administrators.'
        : e.message || 'Could not load infrastructure status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [window_]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetchErrors({ window: errWindow, kind: errKind })
      .then(setErrorRows)
      .catch(() => setErrorRows(null));
  }, [errWindow, errKind]);

  const doRefresh = async () => {
    setRefreshing(true);
    try { await refreshNow(); } catch { /* still re-read below */ }
    load(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const ai = data?.applicationInsights;
  const cost = data?.cost;
  const armConfigured = data?.integrations?.azureArm?.configured;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <button
          onClick={() => router.push('/business-dashboard')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Cloud className="w-6 h-6 text-blue-600" />
              Karya-AI Infrastructure
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Azure infrastructure, application health, costs and alerts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={window_}
              onChange={(e) => setWindow(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {WINDOWS.map((w) => <option key={w.key} value={w.key}>{w.label}</option>)}
            </select>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              Last updated {timeAgo(data?.lastUpdated)}
            </span>
            <button
              onClick={doRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh now
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ── Status summary (§4) ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatusCard
            icon={ShieldCheck} title="Azure Subscription"
            status={data?.subscription?.status}
            value={data?.subscription?.state || 'Unknown'}
            detail={data?.subscription?.message}
            footnote={data?.subscription?.subscriptionId ? `ID ${data.subscription.subscriptionId}` : undefined}
          />
          <StatusCard
            icon={CreditCard} title="Monthly Cost"
            status={cost?.status}
            value={cost?.configured && cost?.currentSpend != null
              ? money(cost.currentSpend, cost.currency) : 'Unknown'}
            detail={cost?.budget
              ? `${cost.percentUsed}% of ${money(cost.budget, cost.currency)} budget`
              : cost?.message || 'No budget configured'}
          />
          <StatusCard
            icon={Server} title="Backend Health"
            status={data?.backend?.status}
            value={data?.backend?.httpStatus ? `HTTP ${data.backend.httpStatus}` : 'Unreachable'}
            detail={data?.backend?.message}
            footnote={data?.backend?.responseTimeMs != null ? `${data.backend.responseTimeMs}ms` : undefined}
          />
          <StatusCard
            icon={Globe} title="Frontend Health"
            status={data?.frontend?.status}
            value={data?.frontend?.production?.httpStatus
              ? `HTTP ${data.frontend.production.httpStatus}` : 'Unreachable'}
            detail={data?.frontend?.production?.message}
          />
          <StatusCard
            icon={Database} title="Database Health"
            status={data?.database?.status}
            value={data?.database?.connected ? 'Connected' : 'Disconnected'}
            detail={data?.database?.message}
            footnote={data?.database?.responseTimeMs != null ? `ping ${data.database.responseTimeMs}ms` : undefined}
          />
          <StatusCard
            icon={Activity} title="Application Insights"
            status={ai?.status}
            value={ai?.configured ? `${(ai.requests?.total ?? 0).toLocaleString()} requests` : 'Not configured'}
            detail={ai?.configured
              ? `${ai.requests.failed} failed (${ai.requests.failureRate}%)`
              : ai?.message}
            footnote={ai?.degraded > 0 ? `${ai.degraded} query failed — data may be partial` : undefined}
          />
          <StatusCard
            icon={Globe} title="Domain / DNS"
            status={data?.domains?.status}
            value={`${data?.domains?.domains?.filter((d) => d.dns?.resolves).length ?? 0}/${data?.domains?.domains?.length ?? 0} resolving`}
            detail={data?.domains?.domains?.find((d) => d.status === 'critical')?.dns?.message
              || data?.domains?.message || 'All monitored domains resolve'}
          />
          <StatusCard
            icon={Cloud} title="Azure Resources"
            status={data?.resources?.status}
            value={data?.resources?.configured ? `${data.resources.count ?? 0} resources` : 'Unknown'}
            detail={data?.resources?.configured
              ? `${data.resources.unhealthy ?? 0} not in a healthy state`
              : data?.resources?.message}
          />
        </div>

        {/* ── Domain health (§14) ────────────────────────────────── */}
        <Section title="Domain health" subtitle="DNS resolution, certificate validity and HTTPS reachability">
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {(data?.domains?.domains || []).length === 0 && (
              <p className="p-5 text-sm text-gray-500">{data?.domains?.message || 'No domains configured.'}</p>
            )}
            {(data?.domains?.domains || []).map((d) => {
              const meta = statusMeta(d.status);
              return (
                <div key={d.hostname} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-sm font-semibold text-gray-900">{d.hostname}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${meta.chip}`}>
                      {meta.dot} {meta.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">DNS</p>
                      <p className="text-gray-700">{d.dns?.message}</p>
                      {d.dns?.resolvedAddress && (
                        <p className="text-xs text-gray-400 font-mono mt-0.5">→ {d.dns.resolvedAddress}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Certificate</p>
                      <p className="text-gray-700">{d.certificate?.message}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">HTTPS</p>
                      <p className="text-gray-700">{d.https?.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Cost (§6) ──────────────────────────────────────────── */}
        <Section title="Cost" subtitle="Azure Cost Management, in the currency Azure reports">
          {!armConfigured ? (
            <NotConfigured report={data?.integrations?.azureArm} what="Azure cost monitoring" />
          ) : cost?.daily?.length ? (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <div><p className="text-xs text-gray-500">Current spend</p><p className="text-xl font-bold tabular-nums">{money(cost.currentSpend, cost.currency)}</p></div>
                <div><p className="text-xs text-gray-500">Budget</p><p className="text-xl font-bold tabular-nums">{cost.budget ? money(cost.budget, cost.currency) : '—'}</p></div>
                <div><p className="text-xs text-gray-500">Used</p><p className="text-xl font-bold tabular-nums">{cost.percentUsed != null ? `${cost.percentUsed}%` : '—'}</p></div>
                <div><p className="text-xs text-gray-500">Forecast</p><p className="text-xl font-bold tabular-nums">{money(cost.forecast, cost.currency)}</p></div>
              </div>
              <div className="h-56 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cost.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <Tooltip formatter={(v) => money(v, cost.currency)} />
                    <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-gray-400">{cost.forecastMethod}</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-600">{cost?.message || 'Cost data temporarily unavailable'}</p>
            </div>
          )}
        </Section>

        {/* ── Application health (§10) ───────────────────────────── */}
        <Section title="Application health" subtitle={`Requests, errors and authentication over the last ${WINDOWS.find((w) => w.key === window_)?.label.toLowerCase()}`}>
          {!ai?.configured ? (
            <NotConfigured report={data?.integrations?.applicationInsights} what="Application Insights" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Requests</h3>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><dt className="text-gray-500">Total</dt><dd className="font-semibold tabular-nums">{ai.requests.total.toLocaleString()}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Successful</dt><dd className="font-semibold tabular-nums">{ai.requests.successful.toLocaleString()}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Failed</dt><dd className="font-semibold tabular-nums text-red-600">{ai.requests.failed.toLocaleString()}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Failure rate</dt><dd className="font-semibold tabular-nums">{ai.requests.failureRate}%</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Avg response</dt><dd className="font-semibold tabular-nums">{ai.requests.avgResponseTimeMs}ms</dd></div>
                </dl>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Errors</h3>
                <div className="flex gap-3 mb-3">
                  <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-center">
                    <p className="text-xl font-bold text-amber-700 tabular-nums">{ai.errors.count4xx}</p>
                    <p className="text-[11px] text-amber-700">4xx</p>
                  </div>
                  <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-2.5 text-center">
                    <p className="text-xl font-bold text-red-700 tabular-nums">{ai.errors.count5xx}</p>
                    <p className="text-[11px] text-red-700">5xx</p>
                  </div>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Top failing</p>
                <ul className="space-y-1">
                  {ai.errors.topFailingEndpoints.slice(0, 4).map((e, i) => (
                    <li key={i} className="flex justify-between gap-2 text-xs">
                      <span className="font-mono text-gray-700 truncate">{e.endpoint}</span>
                      <span className="text-gray-500 whitespace-nowrap">{e.resultCode} ×{e.failures}</span>
                    </li>
                  ))}
                  {ai.errors.topFailingEndpoints.length === 0 && <li className="text-xs text-gray-400">No failures</li>}
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Authentication</h3>
                <p className="text-xs text-gray-500 mb-3 font-mono">{ai.authentication.endpoint}</p>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><dt className="text-gray-500">Attempts</dt><dd className="font-semibold tabular-nums">{ai.authentication.total}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">401 unauthorized</dt><dd className="font-semibold tabular-nums">{ai.authentication.unauthorized401}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">403 forbidden</dt><dd className="font-semibold tabular-nums">{ai.authentication.forbidden403}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">429 rate limited</dt><dd className="font-semibold tabular-nums">{ai.authentication.rateLimited429}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">500 server error</dt><dd className={`font-semibold tabular-nums ${ai.authentication.serverError500 > 0 ? 'text-red-600' : ''}`}>{ai.authentication.serverError500}</dd></div>
                </dl>
              </div>
            </div>
          )}
        </Section>

        {/* ── Slowest endpoints ──────────────────────────────────── */}
        {ai?.configured && ai.performance.slowestEndpoints.length > 0 && (
          <Section title="Slowest endpoints" subtitle="Average duration across the selected window">
            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Endpoint</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Avg</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Calls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ai.performance.slowestEndpoints.map((e, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-800">{e.endpoint}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{e.avgMs}ms</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-500">{e.calls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* ── Recent errors (§11) ────────────────────────────────── */}
        <Section
          title="Recent errors"
          subtitle="Failed requests from Application Insights"
          right={
            <div className="flex flex-wrap gap-2">
              <select value={errWindow} onChange={(e) => setErrWindow(e.target.value)}
                className="px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg bg-white cursor-pointer">
                {WINDOWS.map((w) => <option key={w.key} value={w.key}>{w.label}</option>)}
              </select>
              <select value={errKind} onChange={(e) => setErrKind(e.target.value)}
                className="px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg bg-white cursor-pointer">
                <option value="all">All failures</option>
                <option value="4xx">4xx only</option>
                <option value="5xx">5xx only</option>
              </select>
            </div>
          }
        >
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            {!errorRows?.configured ? (
              <p className="p-5 text-sm text-gray-500">{errorRows?.message || 'Application Insights is not configured.'}</p>
            ) : errorRows.errors.length === 0 ? (
              <p className="p-5 text-sm text-gray-500">No errors in this window.</p>
            ) : (
              <table className="w-full text-sm min-w-[620px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Last seen</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Endpoint</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Type</th>
                    <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {errorRows.errors.map((e, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{timeAgo(e.timestamp)}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-800">{e.endpoint}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${
                          Number(e.httpStatus) >= 500
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>{e.httpStatus}</span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{e.type}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{e.occurrences}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Section>

        {/* ── Azure resources (§8) ───────────────────────────────── */}
        <Section title="Azure resources" subtitle="Resources in the configured resource group">
          {!armConfigured ? (
            <NotConfigured report={data?.integrations?.azureArm} what="Azure resource health" />
          ) : data?.resources?.resources?.length ? (
            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Name</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Type</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Region</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-600">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.resources.resources.map((r) => (
                    <tr key={r.name}>
                      <td className="px-4 py-2.5 font-semibold text-gray-900">{r.name}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{r.type}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.region}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${statusMeta(r.status).chip}`}>
                          {r.provisioningState}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-600">{data?.resources?.message || 'No resources returned.'}</p>
            </div>
          )}
        </Section>

        <p className="text-xs text-gray-400">
          All Azure and Application Insights calls are made server-side. No credential,
          token or connection string is sent to the browser.
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <InfraDashboard />
    </AdminGuard>
  );
}
