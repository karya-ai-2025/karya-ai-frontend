'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail, Target, Users, TrendingUp, Database, RefreshCw, Zap, Eye,
  Phone, Send, ListChecks, ArrowRight, ChevronRight, AlertCircle,
  FileSpreadsheet, Search,
} from 'lucide-react';
import { useWorkspace } from '../WorkspaceContext';
import {
  initialDashboardState, formatNumber, formatShortDate,
  getCampaignStatusCounts, getColorStyles,
} from '../shared';
import { campaignPaths } from '../../workspaceRoutes';

/**
 * The workspace dashboard — now its own route (the project root).
 * Reads what it needs from the shell through context, because a Next.js layout
 * cannot pass props down to the page it wraps.
 */
export default function DashboardTab() {
  const {
    projectSlug, access, dashboardState, fetchDashboardData, setActiveTab,
  } = useWorkspace();
  const router = useRouter();
  // Each recent item links to the page that actually shows it. Campaigns have a
  // per-campaign route; email lists and credit activity only have list pages.
  const paths = campaignPaths(projectSlug);

  // The list manager lives under /campaigns, which is gated. In a leads-only
  // project the user still has email lists but cannot reach that route — send
  // them to Leads, where the lists are built, rather than to a locked screen.
  const openLists = () => {
    if (access.campaigns) router.push(paths.lists);
    else setActiveTab('leads');
  };
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
                { label: 'Search Leads', icon: Search, text: 'Find contacts from your ICP.', requires: 'leads' },
                { label: 'Export Email List', icon: FileSpreadsheet, text: 'Save selected leads as an email list.', requires: null },
                { label: 'Create Template', icon: Mail, text: 'Write a reusable email template.', requires: 'campaigns' },
                { label: 'Launch Campaign', icon: Send, text: 'Send and track outreach.', requires: 'campaigns' }
              ].map((step, index) => {
                const Icon = step.icon;
                // Not part of this project's plan -> show it greyed out / not accessible
                const locked = step.requires ? !access[step.requires] : false;
                return (
                  <div
                    key={step.label}
                    className={`border rounded-lg p-4 ${
                      locked ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`text-xs font-semibold ${locked ? 'text-gray-400' : 'text-gray-500'}`}>
                        Step {index + 1}
                      </div>
                      {locked ? (
                        <div className="p-1.5 bg-gray-200 rounded-lg">
                          <Icon className="w-4 h-4 text-gray-500" />
                        </div>
                      ) : (
                        <Icon className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                    <div className={`mt-3 font-semibold ${locked ? 'text-gray-500' : 'text-gray-900'}`}>
                      {step.label}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {locked ? 'Not included in your current plan.' : step.text}
                    </p>
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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Email Lists</h2>
                  <div className="flex items-center gap-2">
                    {recentCrmLists.length > 0 && (
                      <button
                        onClick={openLists}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        View all
                      </button>
                    )}
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                {recentCrmLists.length === 0 ? (
                  <p className="text-sm text-gray-500">No email lists saved yet.</p>
                ) : (
                  <div className="space-y-3">
                    {/* No per-list route exists, so each row opens the list manager
                        where that list can be viewed and edited. */}
                    {recentCrmLists.map((list) => (
                      <button
                        key={list.id}
                        onClick={openLists}
                        className="w-full text-left border border-gray-100 rounded-lg p-3 hover:border-blue-200 hover:bg-blue-50/40 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-gray-900 truncate">{list.crmObjectName}</div>
                          <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-300 group-hover:text-blue-500" />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                          <span>{formatNumber(list.emailLeadCount)} email ready</span>
                          <span>{formatShortDate(list.createdAt)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
                  <div className="flex items-center gap-2">
                    {recentCampaigns.length > 0 && (
                      <button
                        onClick={() => router.push(paths.list)}
                        className="text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
                      >
                        View all
                      </button>
                    )}
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                {recentCampaigns.length === 0 ? (
                  <p className="text-sm text-gray-500">No campaigns created yet.</p>
                ) : (
                  <div className="space-y-3">
                    {/* Straight to that campaign's results page. */}
                    {recentCampaigns.map((campaign) => (
                      <button
                        key={campaign._id}
                        onClick={() => router.push(paths.stats(campaign._id))}
                        className="w-full text-left border border-gray-100 rounded-lg p-3 hover:border-purple-200 hover:bg-purple-50/40 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium text-gray-900 truncate">{campaign.name}</div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-xs text-gray-500 capitalize">{campaign.status}</span>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500" />
                          </div>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                          <span>{formatNumber(campaign.stats?.totalLeads || 0)} leads</span>
                          <span>{formatShortDate(campaign.createdAt)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
}
