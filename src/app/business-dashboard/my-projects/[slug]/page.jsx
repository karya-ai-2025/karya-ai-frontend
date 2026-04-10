'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { fetchMyProjects, fetchProjectBySlug, fetchProjectPricing } from '@/lib/catalogApi';
import { getProjectComponent, getProjectMetadata } from '@/components/Projects';
import {
  ArrowLeft, Loader2, CheckCircle2, Circle,
  Users, FileText, MessageSquare, Zap, BarChart3,
  PhoneCall, Package, AlertCircle, CalendarClock,
} from 'lucide-react';

const TIER_THEME = {
  credit: { badge: 'bg-gray-100 text-gray-700 border-gray-200',      dot: 'bg-gray-500'   },
  bronze: { badge: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  silver: { badge: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-600'   },
  gold:   { badge: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500'  },
};

const STATUS_THEME = {
  started:      'bg-blue-50 text-blue-700 border-blue-200',
  'in-progress':'bg-violet-50 text-violet-700 border-violet-200',
  completed:    'bg-green-50 text-green-700 border-green-200',
  paused:       'bg-gray-100 text-gray-600 border-gray-200',
};

const PHASES = [
  {
    id: 1,
    label: 'Onboarding & Setup',
    icon: PhoneCall,
    current: 'Your account manager is setting up your workspace and scheduling the kick-off call.',
    done: 'Onboarding completed. ICP and goals confirmed.',
  },
  {
    id: 2,
    label: 'Research & List Building',
    icon: BarChart3,
    current: 'The team is sourcing, verifying and scoring contacts based on your ICP.',
    done: 'Research complete. Contacts verified and scored.',
  },
  {
    id: 3,
    label: 'Delivery',
    icon: Package,
    current: 'Preparing your CRM export, outreach sequences and reports for handoff.',
    done: 'Deliverables sent. Check the Files section below.',
  },
  {
    id: 4,
    label: 'Review & Optimise',
    icon: Zap,
    current: 'Reviewing results with your team. A/B data and final report incoming.',
    done: 'Project completed. All deliverables handed off.',
  },
];

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return '—'; }
}

function daysSince(iso) {
  if (!iso) return 0;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function ProjectWorkspacePage() {
  const { slug } = useParams();
  const router   = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem]             = useState('my-projects');

  const [purchase, setPurchase] = useState(null);
  const [project,  setProject]  = useState(null);
  const [tierData, setTierData] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetchMyProjects(),
      fetchProjectBySlug(slug),
      fetchProjectPricing(slug),
    ])
      .then(([myProjects, proj, tiers]) => {
        const userPurchase = myProjects.find(p => p.slug === slug);
        if (!userPurchase) { setNotFound(true); return; }
        const matchedTier = tiers.find(t => t.tierId === userPurchase.tierId) || tiers[0];
        setPurchase(userPurchase);
        setProject(proj);
        setTierData(matchedTier);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800 mb-1">Project not found</p>
          <p className="text-sm text-gray-400 mb-5">This project isn't linked to your account.</p>
          <button onClick={() => router.push('/business-dashboard/my-projects')} className="text-sm text-blue-600 hover:underline">
            ← Back to My Projects
          </button>
        </div>
      </div>
    );
  }

  // ── Registered component (e.g. HotLeadInBox) ─────────────────────────────
  // If this slug has a dedicated React app in the registry, render it directly.
  // It manages its own full layout (sidebar + content), so we skip the outer shell.
  const RegisteredComponent = getProjectComponent(slug);
  if (RegisteredComponent) {
    const metadata = getProjectMetadata(slug);
    return <RegisteredComponent projectMetadata={metadata} />;
  }

  // ── Generic workspace ─────────────────────────────────────────────────────
  const tierTheme   = TIER_THEME[purchase?.tierId]  || TIER_THEME.silver;
  const statusClass = STATUS_THEME[purchase?.status] || STATUS_THEME.started;
  const currentStep = purchase?.progress?.currentStep || 1;
  const currentPhase = PHASES.find(p => p.id === currentStep) || PHASES[0];
  const PhaseIcon   = currentPhase.icon;
  const days        = daysSince(purchase?.purchasedAt);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">

          {/* Back */}
          <button
            onClick={() => router.push('/business-dashboard/my-projects')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            My Projects
          </button>

          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tierTheme.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${tierTheme.dot}`} />
                    {tierData?.name || purchase?.tierId} Plan
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${statusClass}`}>
                    {purchase?.status?.replace('-', ' ')}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{project?.title}</h1>
                {project?.tagline && <p className="text-sm text-gray-500 mt-0.5">{project.tagline}</p>}
              </div>

              <div className="flex gap-5 sm:text-right shrink-0">
                <div>
                  <p className="text-xs text-gray-400">Started</p>
                  <p className="text-sm font-semibold text-gray-700">{formatDate(purchase?.purchasedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Days Active</p>
                  <p className="text-sm font-semibold text-gray-700">{days}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── Left (2/3) ─────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* What's Happening Now */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">What's Happening Now</p>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <PhaseIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Phase {currentStep}: {currentPhase.label}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{currentPhase.current}</p>
                  </div>
                </div>
              </div>

              {/* Phase progress */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-5">Project Phases</p>
                <div className="space-y-0">
                  {PHASES.map((phase, idx) => {
                    const isDone     = phase.id < currentStep;
                    const isCurrent  = phase.id === currentStep;
                    const isUpcoming = phase.id > currentStep;
                    const Icon       = phase.icon;
                    const isLast     = idx === PHASES.length - 1;

                    return (
                      <div key={phase.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                            isDone    ? 'bg-green-500 border-green-500 text-white' :
                            isCurrent ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100' :
                                        'bg-white border-gray-200 text-gray-300'
                          }`}>
                            {isDone
                              ? <CheckCircle2 className="w-4 h-4" />
                              : isCurrent
                              ? <Icon className="w-4 h-4" />
                              : <Circle className="w-4 h-4" />}
                          </div>
                          {!isLast && <div className={`w-0.5 h-10 mt-1 ${isDone ? 'bg-green-200' : 'bg-gray-100'}`} />}
                        </div>

                        <div className="pb-8 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-semibold ${isDone ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-300'}`}>
                              {phase.label}
                            </p>
                            {isCurrent && (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Active
                              </span>
                            )}
                            {isDone && (
                              <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Done
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 leading-relaxed ${isUpcoming ? 'text-gray-300' : isDone ? 'text-green-600' : 'text-gray-500'}`}>
                            {isDone ? phase.done : isUpcoming ? 'Upcoming' : phase.current}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity feed */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Recent Activity</p>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarClock className="w-8 h-8 text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No activity yet</p>
                  <p className="text-xs text-gray-300 mt-1">Your team will log updates here as work progresses</p>
                </div>
              </div>

              {/* Delivered files */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Delivered Files</p>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="w-8 h-8 text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400 font-medium">No files yet</p>
                  <p className="text-xs text-gray-300 mt-1">Reports, contact lists and exports will appear here once delivered</p>
                </div>
              </div>

            </div>

            {/* ── Right (1/3) ─────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Overall progress */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Overall Progress</p>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {purchase?.progress?.percentage ?? Math.round(((currentStep - 1) / PHASES.length) * 100)}%
                  </span>
                  <span className="text-xs text-gray-400">Phase {currentStep} of {PHASES.length}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${purchase?.progress?.percentage ?? Math.round(((currentStep - 1) / PHASES.length) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Team */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Your Team</p>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-semibold text-blue-800">Manager being assigned</p>
                  <p className="text-xs text-blue-500 mt-1">Within 2 business hours</p>
                </div>
              </div>

              {/* Messages */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Messages</p>
                <div className="text-center py-4">
                  <MessageSquare className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No messages yet</p>
                </div>
              </div>

              {/* Next milestone */}
              {currentStep < PHASES.length && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Up Next</p>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{PHASES[currentStep].label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{PHASES[currentStep].current}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
