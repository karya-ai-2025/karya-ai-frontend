'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TopNavbar from '@/components/TopNavbar';
import SideLeftBar from './SideLeftBar';
import {
  Mail,
  Target,
  BarChart3,
  Settings,
  Users,
  TrendingUp,
  Database,
  Menu,
  X,
  RefreshCw,
  Zap,
  Eye,
  Phone,
  Send,
  ListChecks,
  Clock,
  ArrowRight,
  AlertCircle,
  FileSpreadsheet,
  Search
} from 'lucide-react';
import LeadGeneration from './LeadGeneration';
import Campaign from './Campaign';
import { PROJECT_TAB_ACCESS } from '../index';
import AgentPanel, { LEAD_PLAYBOOK, EMAIL_PLAYBOOK } from '../AgentPanel';
import { Sparkles } from 'lucide-react';
import { getIndustries } from '../../../services/industriesApi';
import { getRegions, getSegments, getSeniority } from '../../../services/leadFiltersApi';

const hotLeadScrollbarStyles = `
  .hotlead-page-scroll::-webkit-scrollbar {
    width: 8px;
  }

  .hotlead-page-scroll::-webkit-scrollbar-track {
    background: #f3f4f6;
  }

  .hotlead-page-scroll::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 9999px;
  }

  .hotlead-page-scroll::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const initialDashboardState = {
  loading: true,
  error: null,
  crmLists: [],
  campaigns: [],
  campaignSummary: {
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalEmailsSent: 0,
    totalCreditsUsed: 0
  },
  creditStats: null,
  creditHistory: []
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatShortDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getCampaignStatusCounts = (campaigns) => campaigns.reduce((acc, campaign) => {
  const status = campaign.status || 'draft';
  acc[status] = (acc[status] || 0) + 1;
  return acc;
}, {});

const colorStyles = {
  amber: {
    iconWrap: 'bg-amber-50',
    icon: 'text-amber-600',
    button: 'bg-amber-600 hover:bg-amber-700'
  },
  blue: {
    iconWrap: 'bg-blue-50',
    icon: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  emerald: {
    iconWrap: 'bg-emerald-50',
    icon: 'text-emerald-600',
    button: 'bg-emerald-600 hover:bg-emerald-700'
  },
  green: {
    iconWrap: 'bg-green-50',
    icon: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700'
  },
  indigo: {
    iconWrap: 'bg-indigo-50',
    icon: 'text-indigo-600',
    button: 'bg-indigo-600 hover:bg-indigo-700'
  },
  purple: {
    iconWrap: 'bg-purple-50',
    icon: 'text-purple-600',
    button: 'bg-purple-600 hover:bg-purple-700'
  }
};

const getColorStyles = (color) => colorStyles[color] || colorStyles.indigo;

const getActivityLabel = (actionType) => ({
  DOWNLOAD_LEADS: 'Downloaded leads',
  SEND_CAMPAIGN_EMAIL: 'Campaign send',
  VIEW_EMAIL: 'Viewed email',
  VIEW_PHONE: 'Viewed phone'
}[actionType] || actionType?.replaceAll('_', ' ') || 'Credit activity');

// Locked tab placeholder
function LockedTab({ tabName, unlockedIn }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] py-20 text-center px-6">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{tabName} not included</h3>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-6">
        {tabName} is part of <span className="font-semibold text-gray-700">HotLead in a Box</span> — the full outbound package that includes both Lead Generation and Email Campaigns.
        {unlockedIn && <><br /><span className="mt-1 inline-block">Your current plan includes: <span className="font-semibold text-gray-700">{unlockedIn}</span>.</span></>}
      </p>
      <a href="/project-marketplace/hotlead-in-a-box"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
        Upgrade to HotLead in a Box
      </a>
    </div>
  );
}

export default function HotLeadInBox({ projectMetadata, projectSlug }) {
  const { user, getAuthHeader } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardState, setDashboardState] = useState(initialDashboardState);

  // Conversational assistant (right-side panel)
  const [agentOpen, setAgentOpen]   = useState(false);
  const [agentMode, setAgentMode]   = useState('lead'); // 'lead' | 'email'
  const [agentResult, setAgentResult] = useState(null); // { criteria, leads } — drives the Leads page
  const [emailDraft, setEmailDraft] = useState(null);   // AI email awaiting the user's decision
  const [draftBusy, setDraftBusy]   = useState(false);
  const [draftNotice, setDraftNotice] = useState(null); // confirmation after "request expert"
  const [prefillTemplate, setPrefillTemplate] = useState(null); // saved email → campaign builder
  const [prefillName, setPrefillName] = useState(''); // campaign name collected in the AI flow

  const [industries, setIndustries] = useState([]); // real industries from Postgres for the lead playbook
  const [regions, setRegions]     = useState([]);   // refinement lookups (region/segment/seniority)
  const [segments, setSegments]   = useState([]);
  const [seniority, setSeniority] = useState([]);
  const [leadCriteria, setLeadCriteria] = useState({}); // accumulated filters, for progressive refinement

  const openAgent = (mode) => {
    setAgentMode(mode);
    setAgentOpen(true);
    setSidebarCollapsed(true);
  };

  // Load the real industry list so the lead assistant's options map to actual DB rows.
  useEffect(() => {
    let active = true;
    getIndustries()
      .then((res) => { if (active && res?.data) setIndustries(res.data); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Load the refinement lookups (regions / segments / seniority) for the agent's suggestions.
  useEffect(() => {
    let active = true;
    Promise.allSettled([getRegions(), getSegments(), getSeniority()]).then(([r, s, se]) => {
      if (!active) return;
      if (r.status === 'fulfilled')  setRegions(r.value || []);
      if (s.status === 'fulfilled')  setSegments(s.value || []);
      if (se.status === 'fulfilled') setSeniority(se.value || []);
    });
    return () => { active = false; };
  }, []);

  // Lead playbook with real industry chips (so the search returns real contacts).
  const leadPlaybook = useMemo(() => {
    if (!industries.length) return LEAD_PLAYBOOK;
    const chips = industries.slice(0, 8).map((i) => i.label).filter(Boolean);
    return {
      ...LEAD_PLAYBOOK,
      steps: LEAD_PLAYBOOK.steps.map((s) =>
        s.id === 'industry' ? { ...s, question: 'Which industry are you targeting?', chips } : s
      ),
    };
  }, [industries]);

  // Run the REAL Postgres lead search for a given criteria object (fresh keyset: cursor 0)
  // and surface results in the native Leads box. Shared by the first search and refinements.
  const runLeadSearch = async (criteria) => {
    const res = await fetch(`${apiBaseUrl}/leads/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      credentials: 'include',
      // Only send the keys the backend knows; all are lowercase values, never display names.
      body: JSON.stringify({ ...criteria, cursor: 0, limit: 100 }),
    });
    const data = await res.json();
    setAgentResult({
      criteria,
      leads: data.success ? (data.data || []) : [],
      matched: data.totalMatched ?? data.pagination?.totalMatched,
      available: data.totalMatched ?? data.pagination?.totalAvailable,
      nextCursor: data.nextCursor ?? null,
      hasMore: !!data.hasMore,
    });
    return data;
  };

  // When the assistant finishes its Q&A: build the initial criteria, run the search,
  // and KEEP the panel open so the user can refine ("only decision makers", "in apac", …).
  const handleAgentComplete = async (answers) => {
    const a = answers || {};
    // Map the chosen industry label back to its API value (slug); fall back to raw text.
    const match = industries.find((i) => (i.label || '').toLowerCase() === (a.industry || '').toLowerCase());
    const industry = match?.value || a.industry || '';

    // Map the assistant's location/segment answers into the filter (lowercase
    // values; "Global"/"Skip" mean no filter). These were previously dropped —
    // that's why every search returned the same industry-only leads.
    const clean = (v) => {
      const s = String(v || '').trim().toLowerCase();
      return (!s || s === 'global' || s === 'any' || s.startsWith('skip')) ? '' : s;
    };

    setActiveTab('leads');
    const criteria = {
      industry,
      company: '',
      companySegment: '',
      location: clean(a.location),
      segment: clean(a.segment),
      seniority: '',
    };
    setLeadCriteria(criteria);

    try {
      await runLeadSearch(criteria);
    } catch (e) {
      console.error('Lead search failed:', e);
      setAgentResult({ criteria, leads: [] });
    }
  };

  // Apply a refinement from the agent (e.g. { seniority: 'decision maker' } or { location: 'apac' }).
  // Merge it into the running criteria and re-query from the top (cursor 0).
  const handleRefine = async (patch) => {
    const merged = { ...leadCriteria, ...patch };
    setLeadCriteria(merged);
    try {
      await runLeadSearch(merged);
    } catch (e) {
      console.error('Refine failed:', e);
    }
  };

  // Email project: generate an AI draft from the assistant's answers.
  const handleGenerateDraft = async (answers) => {
    const res = await fetch(`${apiBaseUrl}/agent/draft-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      credentials: 'include',
      body: JSON.stringify({
        tone: answers.tone || '',
        company: answers.company || '',
        audience: answers.audience || '',
        product: answers.product || '',
        cta: answers.cta || '',
        extra: answers.extra || ''
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to draft email');
    return data.data; // { subject, body }
  };

  // Email assistant finished drafting → hand the draft to the middle and close the panel.
  const handleEmailDraftReady = (draft, answers) => {
    setEmailDraft({ ...draft, _answers: answers || {} });
    setTimeout(() => setAgentOpen(false), 700);
  };

  // Save the approved email as a reusable Email Template in the DB.
  const saveEmailAsTemplate = async (draft) => {
    const res = await fetch(`${apiBaseUrl}/email-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      credentials: 'include',
      body: JSON.stringify({
        templateName: draft.subject ? draft.subject.slice(0, 80) : 'AI outbound email',
        subject: draft.subject || 'Outbound email',
        emailBody: draft.body || ''
      })
    });
    const data = await res.json();
    if (!data.success && !data.data) throw new Error(data.message || 'Failed to save template');
    return data.data;
  };

  // "Looks good — start campaign": save the email, then open the builder pre-filled.
  const handleAcceptDraft = async () => {
    if (!emailDraft) return;
    try {
      setDraftBusy(true);
      const tmpl = await saveEmailAsTemplate(emailDraft);
      setPrefillTemplate(tmpl);
      setPrefillName(emailDraft._answers?.campaignName || ''); // carry the name into the builder
      setEmailDraft(null); // → CreateCampaign renders, pre-filled with this template (jumps to Select Leads)
    } catch (e) {
      console.error('save template failed', e);
      alert('Could not save the email. Please try again.');
    } finally {
      setDraftBusy(false);
    }
  };

  // "Get an expert to refine it": create a HITL request for the expert review queue.
  const handleRequestExpert = async () => {
    if (!emailDraft) return;
    const answers = emailDraft._answers || {};
    try {
      setDraftBusy(true);
      const res = await fetch(`${apiBaseUrl}/hitl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        credentials: 'include',
        body: JSON.stringify({
          projectSlug,
          type: 'email_approval',
          status: 'with_expert',
          title: emailDraft.subject ? `Email refine: ${emailDraft.subject}` : 'Outbound email — expert refine',
          payload: { subject: emailDraft.subject || '', body: emailDraft.body || '', audience: answers.audience || '', tone: answers.tone || '' },
          context: answers
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to send to expert');
      setEmailDraft(null);
      setDraftNotice('Your draft is with our expert. They will refine it and send it back for your approval — watch the HITL Approvals page and your dashboard Attention Center.');
    } catch (e) {
      console.error('request expert failed', e);
      alert('Could not send to the expert. Please try again.');
    } finally {
      setDraftBusy(false);
    }
  };

  // Open the lead assistant whenever the user enters the Leads page.
  useEffect(() => {
    if (activeTab === 'leads') openAgent('lead');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const userId = user?.id || user?._id;

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'leads', name: 'Leads', icon: Users },
    { id: 'campaigns', name: 'Campaigns', icon: Target },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const fetchDashboardData = useCallback(async () => {
    await Promise.resolve();

    if (!userId) {
      setDashboardState({
        ...initialDashboardState,
        loading: false
      });
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };

    const fetchJson = async (path) => {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        headers,
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || `Failed to fetch ${path}`);
      }
      return data;
    };

    try {
      setDashboardState((prev) => ({ ...prev, loading: true, error: null }));

      const [
        crmResult,
        campaignsResult,
        campaignDashboardResult,
        creditStatsResult,
        creditHistoryResult
      ] = await Promise.allSettled([
        fetchJson('/user-crm'),
        fetchJson('/campaigns?limit=100'),
        fetchJson('/campaigns/dashboard'),
        fetchJson('/credits/stats'),
        fetchJson('/credits/history?limit=100')
      ]);

      const firstError = [
        crmResult,
        campaignsResult,
        campaignDashboardResult,
        creditStatsResult,
        creditHistoryResult
      ].find((result) => result.status === 'rejected');

      const creditStats = creditStatsResult.status === 'fulfilled'
        ? creditStatsResult.value.data || creditStatsResult.value
        : null;
      const creditHistory = creditHistoryResult.status === 'fulfilled'
        ? creditHistoryResult.value.data?.history || creditHistoryResult.value.history || []
        : [];

      setDashboardState({
        loading: false,
        error: firstError ? firstError.reason.message : null,
        crmLists: crmResult.status === 'fulfilled' ? crmResult.value.data || [] : [],
        campaigns: campaignsResult.status === 'fulfilled' ? campaignsResult.value.data || [] : [],
        campaignSummary: campaignDashboardResult.status === 'fulfilled'
          ? campaignDashboardResult.value.data?.summary || initialDashboardState.campaignSummary
          : initialDashboardState.campaignSummary,
        creditStats,
        creditHistory
      });
    } catch (error) {
      console.error('Error loading HotLead dashboard:', error);
      setDashboardState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data.'
      }));
    }
  }, [getAuthHeader, userId]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      const timeoutId = setTimeout(() => {
        fetchDashboardData();
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    return undefined;
  }, [activeTab, fetchDashboardData]);

  const dashboardMetrics = useMemo(() => {
    const crmLists = dashboardState.crmLists || [];
    const campaigns = dashboardState.campaigns || [];
    const campaignSummary = dashboardState.campaignSummary || initialDashboardState.campaignSummary;
    const creditBreakdown = dashboardState.creditStats?.breakdown || {};
    const statusCounts = getCampaignStatusCounts(campaigns);

    const totalCrmLeads = crmLists.reduce((sum, list) => sum + Number(list.totalLeads || 0), 0);
    const emailReadyLeads = crmLists.reduce((sum, list) => sum + Number(list.emailLeadCount || 0), 0);
    const downloadedLeadCount = dashboardState.creditHistory.reduce((sum, record) => {
      if (record.actionType !== 'DOWNLOAD_LEADS') return sum;
      return sum + Number(record.metadata?.downloadCount || 1);
    }, 0);
    const totalCampaignAudience = campaigns.reduce((sum, campaign) => (
      sum + Number(campaign.stats?.totalLeads || campaign.selectedLeads?.length || 0)
    ), 0);
    const emailsSent = campaignSummary.totalEmailsSent ||
      campaigns.reduce((sum, campaign) => sum + Number(campaign.stats?.sentCount || 0), 0);

    const totalLeadActions =
      Number(creditBreakdown.VIEW_EMAIL?.count || 0) +
      Number(creditBreakdown.VIEW_PHONE?.count || 0) +
      Number(creditBreakdown.DOWNLOAD_LEADS?.count || 0);

    return {
      totalCrmLeads,
      emailReadyLeads,
      downloadedLeadCount,
      totalLeadActions,
      crmListCount: crmLists.length,
      totalCampaigns: campaignSummary.totalCampaigns || campaigns.length,
      activeCampaigns: campaignSummary.activeCampaigns || (statusCounts.sending || 0) + (statusCounts.scheduled || 0),
      draftCampaigns: statusCounts.draft || 0,
      completedCampaigns: statusCounts.completed || 0,
      emailsSent,
      totalCampaignAudience,
      remainingCredits: dashboardState.creditStats?.remainingCredits || 0,
      totalCreditsUsed: dashboardState.creditStats?.totalCreditsUsed || campaignSummary.totalCreditsUsed || 0,
      emailReveals: creditBreakdown.VIEW_EMAIL?.count || 0,
      phoneReveals: creditBreakdown.VIEW_PHONE?.count || 0,
      downloads: creditBreakdown.DOWNLOAD_LEADS?.count || 0,
      statusCounts
    };
  }, [dashboardState]);

  const hasDashboardActivity = dashboardMetrics.crmListCount > 0 ||
    dashboardMetrics.totalCampaigns > 0 ||
    dashboardMetrics.totalLeadActions > 0 ||
    dashboardMetrics.totalCreditsUsed > 0;

  const StatTile = ({ label, value, helper, icon: Icon, color = 'indigo' }) => {
    const classes = getColorStyles(color);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
            {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
          </div>
          <div className={`p-3 ${classes.iconWrap} rounded-lg flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${classes.icon}`} />
          </div>
        </div>
      </div>
    );
  };

  const ActionCard = ({ icon: Icon, title, description, buttonLabel, onClick, color = 'indigo' }) => {
    const classes = getColorStyles(color);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-start gap-4">
          <div className={`p-3 ${classes.iconWrap} rounded-lg flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${classes.icon}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
            <button
              onClick={onClick}
              className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white ${classes.button} transition-colors cursor-pointer`}
            >
              <span>{buttonLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    // Project-specific labels
    const PROJECT_LABELS = {
      'hotlead-in-a-box':      { title: 'HotLead in a Box Dashboard',          sub: 'Your lead lists, campaigns, and credit activity in one place.' },
      'outbound-list-builder': { title: 'B2B Contact Intelligence Dashboard',   sub: 'Your enriched lead lists and contact pipeline in one place.' },
      'ai-email-sales-agency': { title: 'AI Email Outbound Dashboard',          sub: 'Your email campaigns, sequences, and outreach stats in one place.' },
    };
    const label = PROJECT_LABELS[projectSlug] || PROJECT_LABELS['hotlead-in-a-box'];
    const UPGRADE_URL = '/project-marketplace/hotlead-in-a-box/overview';

    if (dashboardState.loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      );
    }

    const recentCrmLists = [...dashboardState.crmLists]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3);
    const recentCampaigns = [...dashboardState.campaigns]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3);
    const recentActivity = dashboardState.creditHistory.slice(0, 3);

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{label.title}</h1>
            <p className="mt-1 text-gray-600">
              {hasDashboardActivity ? label.sub : 'Get started by exploring the features available in your plan.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            {access.leads ? (
              <button
                onClick={() => setActiveTab('leads')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Get Leads</span>
              </button>
            ) : (
              <a href={UPGRADE_URL}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors">
                <TrendingUp className="w-4 h-4" />
                <span>Upgrade to get leads</span>
              </a>
            )}
            {access.campaigns ? (
              <button
                onClick={() => setActiveTab('campaigns')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>Create Campaign</span>
              </button>
            ) : (
              <a href={UPGRADE_URL}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-lg transition-colors">
                <Target className="w-4 h-4" />
                <span>Upgrade to run campaigns</span>
              </a>
            )}
          </div>
        </div>

        {dashboardState.error && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-amber-900">Some dashboard data could not be loaded</div>
              <div className="mt-1 text-sm text-amber-800">{dashboardState.error}</div>
            </div>
          </div>
        )}

        {!hasDashboardActivity ? (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    New workspace
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-gray-900">Build your first outreach pipeline</h2>
                  <p className="mt-2 text-gray-600">
                    Search for matching contacts, save the selected leads as an email list, then use that list as the audience for an email campaign.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Get Leads</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    <Target className="w-4 h-4" />
                    <span>Create Campaign</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {access.leads ? (
                <ActionCard
                  icon={TrendingUp}
                  title="Find Leads"
                  description="Search by industry, company, segment, and location, then unlock or export the contacts you need."
                  buttonLabel="Open Lead Search"
                  onClick={() => setActiveTab('leads')}
                  color="indigo"
                />
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900">Lead Generation</h3>
                      <p className="mt-1 text-sm text-gray-500">Not included in your current plan. Upgrade to access lead search, enrichment, and CRM export.</p>
                      <a href={UPGRADE_URL} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 transition-colors">
                        Upgrade to get leads <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
              {access.campaigns ? (
                <ActionCard
                  icon={Target}
                  title="Create Campaign"
                  description="Create templates, manage email lists, and start campaigns from saved lead inventory."
                  buttonLabel="Open Campaigns"
                  onClick={() => setActiveTab('campaigns')}
                  color="purple"
                />
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg flex-shrink-0">
                      <Target className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900">Email Campaigns</h3>
                      <p className="mt-1 text-sm text-gray-500">Not included in your current plan. Upgrade to build sequences, manage templates, and launch campaigns.</p>
                      <a href={UPGRADE_URL} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 transition-colors">
                        Upgrade to run campaigns <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                { label: 'Search Leads', icon: Search, text: 'Find contacts from your ICP.' },
                { label: 'Export Email List', icon: FileSpreadsheet, text: 'Save selected leads as an email list.' },
                { label: 'Create Template', icon: Mail, text: 'Write a reusable email template.' },
                { label: 'Launch Campaign', icon: Send, text: 'Send and track outreach.' }
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-gray-500">Step {index + 1}</div>
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="mt-3 font-semibold text-gray-900">{step.label}</div>
                    <p className="mt-1 text-sm text-gray-600">{step.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {access.leads ? (
                <StatTile label="Saved Leads" value={formatNumber(dashboardMetrics.totalCrmLeads)} helper={`${formatNumber(dashboardMetrics.emailReadyLeads)} email ready`} icon={Database} color="blue" />
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-4 relative overflow-hidden">
                  <p className="text-sm font-medium text-gray-400">Saved Leads</p>
                  <div className="mt-2 text-2xl font-bold text-gray-200">—</div>
                  <a href={UPGRADE_URL} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Upgrade to get leads
                  </a>
                </div>
              )}
              {access.leads ? (
                <StatTile label="Email Lists" value={formatNumber(dashboardMetrics.crmListCount)} helper={`${formatNumber(dashboardMetrics.downloadedLeadCount)} leads downloaded`} icon={ListChecks} color="emerald" />
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-400">Email Lists</p>
                  <div className="mt-2 text-2xl font-bold text-gray-200">—</div>
                  <a href={UPGRADE_URL} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Upgrade to get leads
                  </a>
                </div>
              )}
              {access.campaigns ? (
                <StatTile label="Campaigns" value={formatNumber(dashboardMetrics.totalCampaigns)} helper={`${formatNumber(dashboardMetrics.activeCampaigns)} active, ${formatNumber(dashboardMetrics.draftCampaigns)} draft`} icon={Target} color="purple" />
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-400">Campaigns</p>
                  <div className="mt-2 text-2xl font-bold text-gray-200">—</div>
                  <a href={UPGRADE_URL} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:underline">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Upgrade to run campaigns
                  </a>
                </div>
              )}
              <StatTile label="Credits" value={formatNumber(dashboardMetrics.remainingCredits)} helper={`${formatNumber(dashboardMetrics.totalCreditsUsed)} used`} icon={Zap} color="amber" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatTile
                label="Email Reveals"
                value={formatNumber(dashboardMetrics.emailReveals)}
                helper="Individual emails unlocked"
                icon={Eye}
                color="indigo"
              />
              <StatTile
                label="Phone Reveals"
                value={formatNumber(dashboardMetrics.phoneReveals)}
                helper="Phone numbers unlocked"
                icon={Phone}
                color="green"
              />
              <StatTile
                label="Emails Sent"
                value={formatNumber(dashboardMetrics.emailsSent)}
                helper={`${formatNumber(dashboardMetrics.totalCampaignAudience)} total campaign audience`}
                icon={Send}
                color="blue"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="bg-white border border-gray-200 rounded-lg p-5 xl:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Campaign Overview</h2>
                    <p className="text-sm text-gray-600">Status mix across created campaigns.</p>
                  </div>
                  {access.campaigns ? (
                    <button
                      onClick={() => setActiveTab('campaigns')}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                    >
                      Manage Campaigns
                    </button>
                  ) : (
                    <a href={UPGRADE_URL} className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Upgrade to run campaigns
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    ['Draft', dashboardMetrics.statusCounts.draft || 0, 'bg-gray-100 text-gray-700'],
                    ['Sending', dashboardMetrics.statusCounts.sending || 0, 'bg-yellow-100 text-yellow-800'],
                    ['Paused', dashboardMetrics.statusCounts.paused || 0, 'bg-orange-100 text-orange-800'],
                    ['Completed', dashboardMetrics.completedCampaigns, 'bg-green-100 text-green-800']
                  ].map(([label, value, className]) => (
                    <div key={label} className="border border-gray-200 rounded-lg p-4">
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${className}`}>{label}</div>
                      <div className="mt-3 text-2xl font-bold text-gray-900">{formatNumber(value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h2 className="text-lg font-semibold text-gray-900">Lead Pipeline</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Saved lead inventory</span>
                    <span className="font-semibold text-gray-900">{formatNumber(dashboardMetrics.totalCrmLeads)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email-ready leads</span>
                    <span className="font-semibold text-gray-900">{formatNumber(dashboardMetrics.emailReadyLeads)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Campaign audience</span>
                    <span className="font-semibold text-gray-900">{formatNumber(dashboardMetrics.totalCampaignAudience)}</span>
                  </div>
                  {access.leads ? (
                    <button
                      onClick={() => setActiveTab('leads')}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Find More Leads</span>
                    </button>
                  ) : (
                    <a href={UPGRADE_URL}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <span>Upgrade to get leads</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Email Lists</h2>
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                {recentCrmLists.length === 0 ? (
                  <p className="text-sm text-gray-500">No email lists saved yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentCrmLists.map((list) => (
                      <div key={list.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="font-medium text-gray-900 truncate">{list.crmObjectName}</div>
                        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                          <span>{formatNumber(list.emailLeadCount)} email ready</span>
                          <span>{formatShortDate(list.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                {recentCampaigns.length === 0 ? (
                  <p className="text-sm text-gray-500">No campaigns created yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentCampaigns.map((campaign) => (
                      <div key={campaign._id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium text-gray-900 truncate">{campaign.name}</div>
                          <span className="text-xs text-gray-500 capitalize">{campaign.status}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                          <span>{formatNumber(campaign.stats?.totalLeads || 0)} leads</span>
                          <span>{formatShortDate(campaign.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500">No credit activity yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity._id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {getActivityLabel(activity.actionType).toLowerCase()}
                          </div>
                          <span className="text-xs font-semibold text-amber-700">{formatNumber(activity.creditsConsumed)} credits</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">{formatShortDate(activity.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Determine which tabs this slug can access (default: full access)
  const access = PROJECT_TAB_ACCESS[projectSlug] || { leads: true, campaigns: true };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'leads':
        if (!access.leads) {
          return <LockedTab tabName="Lead Generation" unlockedIn="Email Campaigns" />;
        }
        return (
          <LeadGeneration
            onCollapseSidebar={() => setSidebarCollapsed(true)}
            onExpandSidebar={() => setSidebarCollapsed(false)}
            injectedResult={agentResult}
          />
        );
      case 'campaigns':
        if (!access.campaigns) {
          return <LockedTab tabName="Email Campaigns" unlockedIn="Lead Generation" />;
        }
        return <Campaign
          onCollapseSidebar={() => setSidebarCollapsed(true)}
          onExpandSidebar={() => setSidebarCollapsed(false)}
          onEnterCreate={() => openAgent('email')}
          emailDraft={emailDraft}
          draftBusy={draftBusy}
          onAcceptDraft={handleAcceptDraft}
          onRequestExpert={handleRequestExpert}
          draftNotice={draftNotice}
          onClearDraft={() => { setDraftNotice(null); setEmailDraft(null); }}
          initialTemplate={prefillTemplate}
          initialName={prefillName}
          onResetPrefill={() => { setPrefillTemplate(null); setPrefillName(''); }}
        />;
      default:
        return <div className="text-center py-12 text-gray-500">Feature coming soon...</div>;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: hotLeadScrollbarStyles }} />
      <div className="w-full h-screen min-h-0 bg-gray-50 overflow-hidden">
      {/* Sidebar - Fixed position (unchanged) */}
      <div className="fixed top-0 left-0 h-full z-50">
        <SideLeftBar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          projectMetadata={projectMetadata}
          tabAccess={access}
        />
      </div>

      {/* Main Content Area with left margin for sidebar (and right margin for the assistant panel) */}
      <div className={`flex flex-col h-full min-h-0 overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      } ${agentOpen ? 'lg:mr-[400px]' : ''}`}>
        {/* TopNavbar - spans the remaining width after sidebar */}
        <TopNavbar />

        {/* Content Area - pushed down below TopNavbar */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">HotLead InBox</h1>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Content Area with Tabs */}
          <div
            className="flex-1 min-h-0 overflow-y-auto hotlead-page-scroll"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#9CA3AF #F3F4F6'
            }}
          >
            {/* Navigation Tabs */}
            <div className="mb-6 px-4 lg:px-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 lg:space-x-8 overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
                          activeTab === tab.id
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="hidden sm:inline">{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 lg:px-6 pb-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Right-side conversational assistant */}
      <AgentPanel
        open={agentOpen}
        onClose={() => setAgentOpen(false)}
        onComplete={handleAgentComplete}
        onGenerateDraft={handleGenerateDraft}
        onEmailDraftReady={handleEmailDraftReady}
        playbook={agentMode === 'email' ? EMAIL_PLAYBOOK : leadPlaybook}
        projectName={projectMetadata?.name}
        refineOptions={{ regions, segments, seniority }}
        onRefine={handleRefine}
      />

      {/* Floating launcher — toggles the assistant; shifts left when the panel is open */}
      <button
        onClick={() => setAgentOpen((v) => !v)}
        aria-label={agentOpen ? 'Close assistant' : 'Open assistant'}
        title="Ask Karya AI"
        className={`group fixed bottom-6 z-[60] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-[0_8px_30px_-6px_rgba(79,70,229,0.55)] transition-all hover:scale-105 active:scale-95 ${
          agentOpen ? 'lg:right-[416px] right-6' : 'right-6'
        }`}
      >
        <span className="absolute inset-1.5 rounded-xl border border-white/20" />
        <Sparkles className="relative h-6 w-6" strokeWidth={2} fill="currentColor" fillOpacity={0.15} />
      </button>
    </div>
    </>
  );
}

// Export the sidebar component
export { SideLeftBar };
