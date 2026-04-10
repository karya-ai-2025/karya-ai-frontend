'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMyProjects } from '@/lib/catalogApi';
import { fetchMySubmissions } from '@/lib/submissionApi';
import { checkUserPlanAccess } from '@/services/planService';
import {
  FolderKanban, ClipboardList, Store, PlusCircle,
  Crown, Zap, TrendingUp, Clock, ArrowRight,
  CheckCircle2, Loader2, ChevronRight, AlertCircle,
  FileEdit, PhoneCall,
} from 'lucide-react';

const TIER_THEME = {
  credit: 'bg-gray-100 text-gray-700 border-gray-200',
  bronze: 'bg-orange-100 text-orange-700 border-orange-200',
  silver: 'bg-blue-100 text-blue-700 border-blue-200',
  gold:   'bg-amber-100 text-amber-700 border-amber-200',
};

const SUBMISSION_STATUS = {
  submitted:      { label: 'Submitted',    class: 'bg-blue-50 text-blue-700'   },
  'under-review': { label: 'Under Review', class: 'bg-amber-50 text-amber-700' },
  approved:       { label: 'Approved',     class: 'bg-green-50 text-green-700' },
  rejected:       { label: 'Rejected',     class: 'bg-red-50 text-red-700'     },
  published:      { label: 'Published',    class: 'bg-violet-50 text-violet-700'},
};

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

export default function DashboardHome() {
  const router = useRouter();
  const { user, getAuthHeader } = useAuth();

  const [projects,    setProjects]    = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [planStatus,  setPlanStatus]  = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    Promise.allSettled([
      fetchMyProjects(),
      fetchMySubmissions(),
      token ? checkUserPlanAccess(token) : Promise.resolve(null),
    ]).then(([projRes, subRes, planRes]) => {
      if (projRes.status === 'fulfilled') setProjects(projRes.value || []);
      if (subRes.status  === 'fulfilled') setSubmissions(subRes.value || []);
      if (planRes.status === 'fulfilled') setPlanStatus(planRes.value);
    }).finally(() => setLoading(false));
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const activeProjects   = projects.filter(p => p.status === 'started' || p.status === 'in-progress');
  const pendingSubs      = submissions.filter(s => s.status === 'submitted' || s.status === 'under-review');
  const recentProjects   = [...projects].sort((a, b) => new Date(b.lastAccessedAt || b.purchasedAt) - new Date(a.lastAccessedAt || a.purchasedAt)).slice(0, 3);
  const recentSubs       = submissions.slice(0, 3);
  const credits          = planStatus?.data?.limits?.remainingCredits ?? null;
  const planName         = planStatus?.data?.userPlan?.planId?.displayName || null;
  const hasActivePlan    = planStatus?.hasActivePlan || false;

  const QUICK_ACTIONS = [
    {
      label: 'Browse Marketplace',
      desc:  'Discover & buy projects',
      icon:  Store,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      href:  '/project-marketplace',
    },
    {
      label: 'My Projects',
      desc:  'Open a running project',
      icon:  FolderKanban,
      color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
      href:  '/business-dashboard/my-projects',
    },
    {
      label: 'Submit a Project',
      desc:  'Get your idea on the marketplace',
      icon:  PlusCircle,
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      href:  '/business-dashboard/submit-project',
    },
    {
      label: 'My Submissions',
      desc:  'Track your submission status',
      icon:  ClipboardList,
      color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
      href:  '/business-dashboard/my-submissions',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* ── Welcome ──────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Here's what's happening across your account.</p>
      </div>

      {/* ── Summary cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Projects',
            value: projects.length,
            icon:  FolderKanban,
            color: 'bg-blue-50',
            iconColor: 'text-blue-600',
            sub: `${activeProjects.length} active`,
          },
          {
            label: 'Total Submissions',
            value: submissions.length,
            icon:  ClipboardList,
            color: 'bg-violet-50',
            iconColor: 'text-violet-600',
            sub: `${pendingSubs.length} under review`,
          },
          {
            label: 'Pending Review',
            value: pendingSubs.length,
            icon:  AlertCircle,
            color: 'bg-amber-50',
            iconColor: 'text-amber-600',
            sub: pendingSubs.length > 0 ? 'Awaiting approval' : 'All clear',
          },
          {
            label: credits !== null ? 'Credits Left' : 'Plan Status',
            value: credits !== null ? credits.toLocaleString() : (hasActivePlan ? 'Active' : 'Free'),
            icon:  Zap,
            color: 'bg-green-50',
            iconColor: 'text-green-600',
            sub: planName || (hasActivePlan ? 'Active plan' : 'No active plan'),
          },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Plan banner + Quick actions ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Plan status */}
        <div className={`rounded-2xl border p-5 flex flex-col justify-between ${
          hasActivePlan
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-600 text-white'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Crown className={`w-4 h-4 ${hasActivePlan ? 'text-amber-300' : 'text-amber-600'}`} />
            <span className={`text-xs font-bold uppercase tracking-wide ${hasActivePlan ? 'text-blue-200' : 'text-amber-700'}`}>
              Your Plan
            </span>
          </div>
          <div>
            <p className={`text-lg font-bold mb-0.5 ${hasActivePlan ? 'text-white' : 'text-amber-900'}`}>
              {planName || 'Free Plan'}
            </p>
            {credits !== null ? (
              <p className="text-sm text-blue-200">{credits.toLocaleString()} credits remaining</p>
            ) : (
              <p className={`text-sm ${hasActivePlan ? 'text-blue-200' : 'text-amber-700'}`}>
                {hasActivePlan ? 'Plan active' : 'Upgrade to access all features'}
              </p>
            )}
          </div>
          <button
            onClick={() => router.push('/settings?section=upgrade')}
            className={`mt-4 text-xs font-semibold px-3 py-2 rounded-xl transition-colors w-fit ${
              hasActivePlan
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {hasActivePlan ? 'Manage Plan' : 'Upgrade Now'}
          </button>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-colors ${action.color}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{action.label}</p>
                  <p className="text-xs opacity-70 truncate">{action.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Recent activity ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent projects */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Recent Projects</p>
            <button
              onClick={() => router.push('/business-dashboard/my-projects')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <FolderKanban className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-medium">No projects yet</p>
              <button
                onClick={() => router.push('/project-marketplace')}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Browse marketplace →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentProjects.map(p => {
                const tierClass = TIER_THEME[p.tierId] || TIER_THEME.silver;
                return (
                  <div
                    key={p.slug}
                    onClick={() => router.push(`/business-dashboard/my-projects/${p.slug}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FolderKanban className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                        {p.title}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(p.lastAccessedAt || p.purchasedAt)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${tierClass}`}>
                      {p.tierId}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent submissions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Recent Submissions</p>
            <button
              onClick={() => router.push('/business-dashboard/my-submissions')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {recentSubs.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-medium">No submissions yet</p>
              <button
                onClick={() => router.push('/business-dashboard/submit-project')}
                className="mt-2 text-xs text-blue-600 hover:underline"
              >
                Submit your first project →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSubs.map(s => {
                const status = SUBMISSION_STATUS[s.status] || SUBMISSION_STATUS.submitted;
                const TypeIcon = s.submissionType === 'call' ? PhoneCall : FileEdit;
                return (
                  <div
                    key={s._id}
                    onClick={() => router.push(`/business-dashboard/my-submissions/${s._id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                        {s.title}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(s.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${status.class}`}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
