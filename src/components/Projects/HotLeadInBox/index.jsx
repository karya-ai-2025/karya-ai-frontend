'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TopNavbar from '@/components/TopNavbar';
import SideLeftBar from './SideLeftBar';
import { Menu, X, BarChart3, Settings, Target, Users } from 'lucide-react';
import AgentPanel, { LEAD_PLAYBOOK, EMAIL_PLAYBOOK } from '../AgentPanel';
import { Sparkles } from 'lucide-react';
import { getIndustries } from '../../../services/industriesApi';
import { getRegions, getSegments, getSeniority } from '../../../services/leadFiltersApi';
import { usePathname, useRouter } from 'next/navigation';
import { WorkspaceProvider } from './WorkspaceContext';
import { WORKSPACE_BASE, workspacePath, tabAccessFor } from '../workspaceRoutes';
import { fetchMyProjects } from '@/lib/catalogApi';

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

import {
  apiBaseUrl, initialDashboardState, formatNumber, formatShortDate,
  getCampaignStatusCounts, getColorStyles, getActivityLabel, LockedTab,
} from './shared';

export { LockedTab };

export default function HotLeadInBox({ projectMetadata, projectSlug, children }) {
  const { user, getAuthHeader } = useAuth();
  // The active tab IS the route now — derived from the URL, never stored.
  // setActiveTab navigates, so Back/refresh/sharing all behave normally.
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = useMemo(() => {
    const base = `${WORKSPACE_BASE}/${projectSlug}`;
    if (!pathname || !pathname.startsWith(base)) return 'dashboard';
    const rest = pathname.slice(base.length).replace(/^\//, '');
    return rest.split('/')[0] || 'dashboard';
  }, [pathname, projectSlug]);
  const setActiveTab = useCallback(
    (tab) => router.push(workspacePath(projectSlug, tab)),
    [router, projectSlug]
  );
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
  const [ownedSlugs, setOwnedSlugs] = useState([]); // every project the user has bought (for cross-project unlocks)

  const openAgent = (mode) => {
    setAgentMode(mode);
    setAgentOpen(true);
    setSidebarCollapsed(true);
  };

  // Load every project the user owns so a capability bought in one project (e.g. the
  // email agency) unlocks the matching tab inside a sibling project (e.g. the B2B
  // intelligence leads-only project), and vice-versa.
  useEffect(() => {
    let active = true;
    fetchMyProjects()
      .then((list) => { if (active && Array.isArray(list)) setOwnedSlugs(list.map((p) => p.slug).filter(Boolean)); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

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
    // Show ALL real industries as options (the chip area scrolls) so users can pick
    // theirs instead of being forced to "Other". Sorted A→Z for scanability.
    const chips = industries
      .map((i) => i.label)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
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
    } finally {
      // Close the assistant so the leads are shown clean, unobstructed. Small
      // delay lets the "here are your contacts" message land first.
      setTimeout(() => setAgentOpen(false), 700);
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

  // Which tabs are unlocked. Start from THIS project's own access, then grant any
  // tab another purchased project provides — owning the email agency unlocks
  // Campaigns here, owning the leads builder unlocks Lead Generation, and owning
  // the full bundle unlocks both. The rule lives in workspaceRoutes so the tab
  // pages' guard and this shell can never disagree.
  const access = useMemo(
    () => tabAccessFor(projectSlug, ownedSlugs),
    [projectSlug, ownedSlugs]
  );

  // Everything a tab page needs from the shell. Memoised so switching routes
  // doesn't re-render every consumer on an unrelated state change.
  const workspace = useMemo(() => ({
    projectSlug,
    projectMetadata,
    access,
    activeTab,
    setActiveTab,
    // Dashboard data
    dashboardState,
    fetchDashboardData,
    // Sidebar / layout controls the tabs reach for
    collapseSidebar: () => setSidebarCollapsed(true),
    expandSidebar: () => setSidebarCollapsed(false),
    // AI assistant hand-offs between tabs
    openAgent,
    agentResult,
    emailDraft,
    draftBusy,
    draftNotice,
    handleAcceptDraft,
    handleRequestExpert,
    clearDraft: () => { setDraftNotice(null); setEmailDraft(null); },
    prefillTemplate,
    prefillName,
    resetPrefill: () => { setPrefillTemplate(null); setPrefillName(''); },
  }), [
    projectSlug, projectMetadata, access, activeTab, setActiveTab,
    dashboardState, fetchDashboardData, agentResult, emailDraft, draftBusy,
    draftNotice, prefillTemplate, prefillName,
  ]);

  return (
    <WorkspaceProvider value={workspace}>
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
              {children}
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
    </WorkspaceProvider>
  );
}

// Export the sidebar component
export { SideLeftBar };
