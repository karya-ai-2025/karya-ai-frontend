'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMyProjects, fetchAllProjects } from '@/lib/catalogApi';
import { fetchMySubmissions } from '@/lib/submissionApi';
import { checkUserPlanAccess } from '@/services/planService';
import { getOnboardingStatus } from '@/services/onboardingApi';
import {
  FolderKanban, ClipboardList, Loader2, ChevronRight, AlertCircle,
  Sparkles, Target, Megaphone, TrendingUp, Users, Rocket, Send, Bot,
  ShieldAlert, CalendarDays, CheckCircle2, Clock, X, ArrowUpRight, PenLine,
} from 'lucide-react';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// GTM workflow stages
const GTM_STAGES = [
  { id: 'icp', label: 'ICP Research' }, { id: 'messaging', label: 'Messaging' },
  { id: 'content', label: 'Content' }, { id: 'outreach', label: 'Outreach' },
  { id: 'leadgen', label: 'Lead Gen' }, { id: 'launch', label: 'Campaign Launch' },
  { id: 'review', label: 'Performance' },
];

// Poster image per project slug — gives recommendation cards the homepage "Top Projects" look.
const REC_IMAGES = {
  'outbound-list-builder':            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=480&h=300&fit=crop&auto=format',
  'sales-outreach-automation':        'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=480&h=300&fit=crop&auto=format',
  'ai-email-sales-agency':            'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=480&h=300&fit=crop&auto=format',
  'call-intelligence-crm':            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&h=300&fit=crop&auto=format',
  'hotlead-in-a-box':                 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=480&h=300&fit=crop&auto=format',
  'traffic-abm-agency':               'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=300&fit=crop&auto=format',
  'brand-voice-thought-leadership':   'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=480&h=300&fit=crop&auto=format',
  'connection-relationship-manager':  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=480&h=300&fit=crop&auto=format',
  'demo-prep-crm-research':           'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=480&h=300&fit=crop&auto=format',
  'inbound-aggregation':              'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=480&h=300&fit=crop&auto=format',
};

// Fallback photos so every recommendation card shows an image (never a bare icon).
const REC_FALLBACK = [
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=480&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=480&h=300&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=480&h=300&fit=crop&auto=format',
];

// Themes used for Active Projects tabs
const THEMES = [
  { id: 'Outreach',          icon: Send,       bar: 'bg-blue-500',    chip: 'bg-blue-50 text-blue-600' },
  { id: 'Social & Content',  icon: Megaphone,  bar: 'bg-rose-500',    chip: 'bg-rose-50 text-rose-600' },
  { id: 'Growth',            icon: TrendingUp, bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-600' },
];

function hashNum(seed = '', mod = 1000) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100000;
  return h % mod;
}
function stageFromPct(pct) {
  if (pct < 15) return 0; if (pct < 30) return 1; if (pct < 45) return 2;
  if (pct < 62) return 3; if (pct < 78) return 4; if (pct < 92) return 5; return 6;
}

export default function DashboardHome() {
  const router = useRouter();
  const { user } = useAuth();

  const [projects, setProjects]       = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [planStatus, setPlanStatus]   = useState(null);
  const [hitlPending, setHitlPending] = useState([]); // real HITL approval requests
  const [catalog, setCatalog]         = useState([]); // marketplace projects for recommendations
  const [profile, setProfile]         = useState(null); // onboarding profile (industry, goals, ICPs)
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState('All');
  const [orchestratorOpen, setOrchestratorOpen] = useState(false);
  const [orchestratorInput, setOrchestratorInput] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    Promise.allSettled([
      fetchMyProjects(),
      fetchMySubmissions(),
      token ? checkUserPlanAccess(token) : Promise.resolve(null),
      token
        ? fetch(`${apiBaseUrl}/hitl?status=awaiting_user`, { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' }).then(r => r.json()).catch(() => null)
        : Promise.resolve(null),
      fetchAllProjects({ limit: 24 }).then(r => r.projects).catch(() => []),
      token ? getOnboardingStatus().catch(() => null) : Promise.resolve(null),
    ]).then(([projRes, subRes, planRes, hitlRes, catRes, profRes]) => {
      if (projRes.status === 'fulfilled') setProjects(projRes.value || []);
      else { try { setProjects(JSON.parse(localStorage.getItem('myProjects') || '[]').slice().reverse()); } catch { setProjects([]); } }
      if (subRes.status === 'fulfilled') setSubmissions(subRes.value || []);
      if (planRes.status === 'fulfilled') setPlanStatus(planRes.value);
      if (hitlRes.status === 'fulfilled' && hitlRes.value?.success) setHitlPending(hitlRes.value.data || []);
      if (catRes.status === 'fulfilled') setCatalog(catRes.value || []);
      if (profRes.status === 'fulfilled') setProfile(profRes.value);
    }).finally(() => setLoading(false));
  }, []);

  // Enrich projects with GTM signals
  const ops = useMemo(() => projects.map((p, i) => {
    const pct   = p.progress?.percentage ?? (8 + hashNum((p.slug || p.title || String(i)), 88));
    const stage = stageFromPct(pct);
    const seed  = hashNum((p.slug || '') + 'x');
    const theme = THEMES[seed % THEMES.length];
    const pendingHITL = seed % 3 === 0;
    const stuck       = seed % 7 === 0 && pct < 70;
    const launchReady = pct >= 88 && !stuck;
    const statusLabel = pendingHITL ? 'HITL review' : stuck ? 'Stuck' : pct < 50 ? 'In progress' : launchReady ? 'Ready' : 'Active';
    return { ...p, pct, stage, theme, pendingHITL, stuck, launchReady, statusLabel,
      stageLabel: GTM_STAGES[stage].label, lastActivity: p.lastAccessedAt || p.purchasedAt };
  }), [projects]);

  const credits       = planStatus?.data?.limits?.remainingCredits ?? null;
  const active        = ops.filter(p => p.pct < 92);
  const pendingHITL   = ops.filter(p => p.pendingHITL);
  // Real email approval requests created by the AI Email assistant + mock project HITL.
  const hitlPendingCount = pendingHITL.length + hitlPending.length;
  const launchReady   = ops.filter(p => p.launchReady);
  const delivered     = ops.filter(p => p.pct >= 92).length;
  const themeCount    = new Set(ops.map(p => p.theme.id)).size;

  const filtered = ops.filter(p => tab === 'All' || p.theme.id === tab);

  // Milestones this week (from real projects)
  const milestones = useMemo(() => {
    const days = ['Mon', 'Today', 'Wed', 'Thu', 'Fri'];
    return active.slice(0, 5).map((p, i) => ({
      id: p.slug + i,
      title: p.pendingHITL ? `${p.stageLabel} review by expert (HITL pending)`
        : p.pct > 60 ? `${p.stageLabel} drafted by research agent`
        : `${p.stageLabel} scheduled for ${p.title}`,
      project: p.title,
      day: days[i % days.length],
      state: p.pendingHITL ? 'pending' : p.pct > 60 ? 'done' : 'scheduled',
    }));
  }, [active]);

  const focus = pendingHITL[0] || active[0] || ops[0];

  // ── Recommended projects — derived from the user's onboarding (industry, goals, ICPs) ──
  const recommendations = useMemo(() => {
    if (!catalog.length) return [];
    const owned = new Set(projects.map(p => p.slug));
    const d = profile?.data || profile || {};
    const company = d.companyDetails || d.company || {};
    const industry = company.industry || d.industry || user?.industry || '';
    const mkt = d.marketingActivities || d.marketing || {};
    // Free-text signals of what the business wants (goals, current/desired plan, ICPs).
    const interestText = [
      mkt.goalsObjectives, mkt.currentActivities, mkt.desiredPlan, company.description,
      ...(Array.isArray(d.icps) ? d.icps.map(i => `${i?.name || ''} ${i?.description || ''}`) : []),
    ].filter(Boolean).join(' ').toLowerCase();
    const words = Array.from(new Set(interestText.split(/[^a-z0-9]+/).filter(w => w.length > 4)));

    return catalog
      .filter(p => !owned.has(p.slug))
      .map(p => {
        // Base score from the catalog's per-industry match data; fall back to a neutral baseline.
        let score = industry && p.matchScore?.[industry] ? p.matchScore[industry] : 55;
        if (words.length) {
          const hay = [p.title, p.subtitle, p.tagline, p.category, ...(p.expertSkills || []), ...(p.targetFor || [])].join(' ').toLowerCase();
          score += words.filter(w => hay.includes(w)).length * 8;
        }
        if (p.trending) score += 4;
        return { ...p, recScore: Math.min(99, Math.round(score)), recIndustry: industry };
      })
      .sort((a, b) => b.recScore - a.recScore)
      .slice(0, 4);
  }, [catalog, projects, profile, user]);

  // Attention Center — prioritised work that needs the user
  const pendingSubs = submissions.filter(s => s.status === 'submitted' || s.status === 'under-review');
  const attention = useMemo(() => {
    const items = [];
    // Real AI-email approval requests come first.
    hitlPending.forEach(r => items.push({
      id: r._id,
      icon: ShieldAlert,
      color: 'amber',
      title: `Approve email — ${r.payload?.subject || r.title || 'Outbound email'}`,
      sub: 'AI draft • awaiting your sign-off',
      action: 'Review',
      href: '/business-dashboard/hitl-approval',
    }));
    ops.forEach(p => {
      if (p.pendingHITL) items.push({ id: p.slug + '-h', icon: ShieldAlert, color: 'amber', title: `Approve expert work — ${p.title}`, sub: `${p.stageLabel} • awaiting your sign-off`, action: 'Review', href: '/business-dashboard/hitl-approval' });
      if (p.stuck) items.push({ id: p.slug + '-s', icon: AlertCircle, color: 'red', title: `Project stalled — ${p.title}`, sub: `No movement at ${p.stageLabel}`, action: 'Review', href: `/business-dashboard/my-projects/${p.slug}` });
    });
    pendingSubs.forEach(s => items.push({ id: s._id, icon: ClipboardList, color: 'violet', title: `Submission under review — ${s.title}`, sub: 'Marketplace team is evaluating', action: 'Track', href: `/business-dashboard/my-submissions/${s._id}` }));
    return items.slice(0, 5);
  }, [ops, pendingSubs, hitlPending]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 text-blue-500 animate-spin" /></div>;

  // ── Overview cards (match reference) ────────────────────────────────────────
  const workflowCards = [
    { label: 'Total projects',      value: 20,                            color: 'text-gray-900' },
    { label: 'Active',              value: 2, sub2: '/ 20',               color: 'text-gray-900' },
    { label: 'HITL pending',        value: hitlPendingCount,              color: 'text-gray-900' },
    { label: 'Available to launch', value: launchReady.length,            color: 'text-gray-900' },
  ];

  // attention icon tiles (colored by kind)
  const attnColor = {
    amber:  'bg-amber-50 text-amber-700 border-amber-200',
    red:    'bg-red-50 text-red-700 border-red-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
  };

  return (
    <>
      <div className="p-5 lg:p-6 max-w-[1500px] mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-[26px] font-bold text-gray-900 tracking-[-0.02em] leading-tight">
              Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''} 👋
            </h2>
            <p className="text-sm text-gray-500 mt-1">Your GTM command center — here's what needs you today.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {active.length} agents running
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <ShieldAlert className="w-3.5 h-3.5" /> {hitlPendingCount} pending approvals
            </span>
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {workflowCards.map(c => (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-200/70 px-5 py-[18px] hover:border-gray-300 transition-colors">
              <p className={`text-[32px] font-black leading-none tracking-[-0.02em] ${c.color}`}>
                {c.value}
                {c.sub2 && <span className="text-lg font-bold text-gray-300"> {c.sub2}</span>}
              </p>
              <p className="text-[12.5px] font-semibold text-gray-400 mt-2 tracking-tight uppercase">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Attention Center — middle */}
        <section className="bg-white rounded-2xl border border-gray-200/70 overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Attention Center</h3>
              {attention.length > 0 && <span className="text-[11px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">{attention.length}</span>}
            </div>
            <span className="text-xs text-gray-400">Prioritised by impact</span>
          </div>
          {attention.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">All clear — nothing needs you right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {attention.map(a => {
                const Icon = a.icon;
                return (
                  <div key={a.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${attnColor[a.color]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{a.title}</p>
                      <p className="text-xs text-gray-400 truncate">{a.sub}</p>
                    </div>
                    <button onClick={() => router.push(a.href)}
                      className="text-xs font-bold px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors flex-shrink-0">
                      {a.action}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recommended projects — poster shelf, from your profile, goals & what's trending */}
        {recommendations.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Recommended projects</h3>
                <span className="text-[11px] text-gray-400 hidden sm:inline truncate">Based on your profile, goals &amp; what's trending</span>
              </div>
              <button onClick={() => router.push('/project-marketplace')} className="text-xs text-blue-600 hover:underline flex items-center gap-1 flex-shrink-0">Browse all <ChevronRight className="w-3 h-3" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {recommendations.map((p, i) => {
                const img = REC_IMAGES[p.slug] || REC_FALLBACK[i % REC_FALLBACK.length];
                const chip = p.recScore >= 80 ? 'Top match' : p.trending ? 'Trending' : `${p.recScore}% match`;
                const dels = (p.deliverables || []).slice(0, 2);
                return (
                  <button key={p.slug} onClick={() => router.push(`/project-marketplace/${p.slug}`)}
                    className="group text-left flex flex-col rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-blue-200 hover:shadow-[0_8px_24px_-10px_rgba(0,0,0,0.18)] transition-all">

                    {/* Small image header */}
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} />
                      <img src={img} alt={p.title} loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                      <span className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[10px] font-semibold text-white bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <Sparkles className="w-2.5 h-2.5" /> {chip}
                      </span>
                    </div>

                    {/* Result-oriented body */}
                    <div className="flex-1 flex flex-col p-4">
                      <p className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">{p.title}</p>
                      <p className="text-[11.5px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{p.tagline || p.subtitle}</p>

                      {/* What you get */}
                      {dels.length > 0 && (
                        <div className="mt-2.5 space-y-1">
                          {dels.map(d => (
                            <div key={d} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-[11px] text-gray-600 leading-snug line-clamp-1">{d}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Footer: CTA */}
                      <div className="flex items-center justify-end mt-auto pt-3 border-t border-gray-100">
                        <span className="flex items-center gap-1 text-[11.5px] font-bold text-blue-600 group-hover:text-blue-700">
                          View project <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Active Projects (2×2 scrollable, narrower) + Milestones (tall) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-stretch">

          {/* Active Projects — span 2 */}
          <section className="xl:col-span-2 bg-white rounded-2xl border border-gray-200/70 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-gray-700" />
                <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">Active projects</h3>
              </div>
              <button onClick={() => router.push('/business-dashboard/my-projects')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
              {['All', 'Outreach', 'Social & Content'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    tab === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-200 hover:text-blue-600'
                  }`}>
                  {t}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-10 flex-1 flex flex-col items-center justify-center">
                <FolderKanban className="w-9 h-9 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium mb-1">No active projects {tab !== 'All' ? `in ${tab}` : 'yet'}</p>
                <button onClick={() => router.push('/project-marketplace')} className="text-xs text-blue-600 font-semibold hover:underline">Start a GTM project →</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1" style={{ maxHeight: '420px', scrollbarWidth: 'thin' }}>
                {filtered.map(p => {
                  const ThemeIcon = p.theme.icon;
                  const badge = p.statusLabel === 'HITL review' ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : p.statusLabel === 'Stuck' ? 'bg-red-50 text-red-600 border-red-200'
                    : p.statusLabel === 'In progress' ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-green-50 text-green-700 border-green-200';
                  return (
                    <button key={p.slug} onClick={() => router.push(`/business-dashboard/my-projects/${p.slug}`)}
                      className="relative text-left rounded-2xl border border-gray-200 p-4 bg-white hover:border-blue-200 hover:shadow-[0_8px_24px_-10px_rgba(0,0,0,0.18)] transition-all group overflow-hidden h-fit">
                      <span className={`absolute top-0 left-0 right-0 h-1 ${p.theme.bar}`} />
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.theme.chip}`}>
                          <ThemeIcon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge}`}>{p.statusLabel}</span>
                      </div>
                      <p className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">{p.title}</p>
                      <p className="text-[11px] text-gray-400 mt-1 truncate">{p.theme.id} · {p.tagline || p.stageLabel}</p>
                      <div className="flex items-center justify-between mt-4 mb-1.5">
                        <span className="text-[11px] font-semibold text-gray-500">{p.stageLabel}</span>
                        <span className="text-[12px] font-black text-gray-900">{p.pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${p.theme.bar}`} style={{ width: `${p.pct}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Milestones this week — tall */}
          <section className="bg-white rounded-2xl border border-gray-200/70 p-5 flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
              <CalendarDays className="w-4 h-4 text-blue-500" /> Milestones this week
            </h3>
            {milestones.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 flex-1">No milestones scheduled.</p>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {milestones.map(m => {
                  const Icon = m.state === 'done' ? CheckCircle2 : m.state === 'pending' ? Clock : CalendarDays;
                  const color = m.state === 'done' ? 'text-green-500' : m.state === 'pending' ? 'text-amber-500' : 'text-blue-400';
                  return (
                    <div key={m.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-800 leading-snug">{m.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{m.project}</p>
                      </div>
                      <span className={`text-[10px] font-bold flex-shrink-0 mt-0.5 ${m.day === 'Today' ? 'text-blue-600' : 'text-gray-400'}`}>{m.day}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── Floating Orchestrator launcher (bottom-right) ──────────────────── */}
      {!orchestratorOpen && (
        <button
          onClick={() => setOrchestratorOpen(true)}
          aria-label="Open GTM Orchestrator"
          title="GTM Orchestrator"
          className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-[0_8px_30px_-6px_rgba(37,99,235,0.55)] transition-all hover:scale-105 active:scale-95"
        >
          <span className="absolute inset-1.5 rounded-xl border border-white/20" />
          <Bot className="w-6 h-6 relative" strokeWidth={2} />
        </button>
      )}

      {/* ── Orchestrator drawer — full height, hidden until opened ─────────── */}
      {orchestratorOpen && (
        <div className="fixed inset-0 z-[70]" onClick={() => setOrchestratorOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <aside
            onClick={e => e.stopPropagation()}
            className="absolute top-0 right-0 h-full w-full sm:w-[400px] bg-[#faf9f6] text-gray-900 flex flex-col shadow-2xl border-l border-gray-200 animate-orch-in"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
                <div>
                  <p className="text-[15px] font-bold text-gray-900 tracking-tight">GTM Orchestrator</p>
                  <p className="text-[11px] text-gray-400">Agentic AI · always on</p>
                </div>
              </div>
              <button onClick={() => setOrchestratorOpen(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-[13px] leading-relaxed text-gray-600">
                  {focus
                    ? <>Your project <span className="font-bold text-gray-900">"{focus.title}"</span> is {focus.pct}% done at <span className="font-bold text-gray-900">{focus.stageLabel}</span>. {focus.pendingHITL ? 'An expert deliverable needs your approval to continue.' : focus.launchReady ? "It's ready to launch — want me to kick off the campaign?" : 'Want me to push it to the next stage?'}</>
                    : "Tell me your GTM goal and I'll set up the project, match experts, and run the workflow."}
                </p>
              </div>

              {/* Suggested next actions */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">Suggested next actions</p>
                <div className="space-y-2">
                  {[
                    focus?.pendingHITL && { label: `Review & approve — ${focus.title}`, href: '/business-dashboard/hitl-approval', icon: ShieldAlert },
                    focus?.launchReady && { label: `Launch campaign — ${focus.title}`, href: `/business-dashboard/my-projects/${focus.slug}`, icon: Rocket },
                    { label: 'Generate an ICP', href: '/agent', icon: Target },
                    { label: 'Draft outreach sequence', href: '/agent', icon: Send },
                    { label: 'Hire a vetted expert', href: '/expert-marketplace', icon: Users },
                  ].filter(Boolean).map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <button key={i} onClick={() => router.push(a.href)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-left transition-colors">
                        <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-[13px] font-medium text-gray-700 flex-1">{a.label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attention quick-glance */}
              {pendingHITL.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">Needs your approval</p>
                  <div className="space-y-2">
                    {pendingHITL.slice(0, 3).map(p => (
                      <button key={p.slug} onClick={() => router.push(`/business-dashboard/my-projects/${p.slug}`)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-left hover:bg-amber-100 transition-colors">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span className="text-[12px] text-amber-800 truncate flex-1">{p.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <input value={orchestratorInput} onChange={e => setOrchestratorInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && orchestratorInput.trim()) { sessionStorage.setItem('pendingAgentMessage', orchestratorInput.trim()); router.push('/agent'); } }}
                  placeholder="Message the orchestrator…"
                  className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder-gray-400 outline-none" />
                <button onClick={() => { if (orchestratorInput.trim()) sessionStorage.setItem('pendingAgentMessage', orchestratorInput.trim()); router.push('/agent'); }}
                  className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors text-white"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
