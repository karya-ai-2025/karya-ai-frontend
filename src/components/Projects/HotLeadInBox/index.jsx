'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

export default function HotLeadInBox({ projectMetadata }) {
  const { user, getAuthHeader } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardState, setDashboardState] = useState(initialDashboardState);

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
    if (dashboardState.loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading HotLead dashboard...</span>
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
            <h1 className="text-2xl font-bold text-gray-900">HotLead InBox Dashboard</h1>
            <p className="mt-1 text-gray-600">
              {hasDashboardActivity
                ? 'Your lead lists, campaigns, and credit activity in one place.'
                : 'Start by finding leads, saving an email list, and launching your first campaign.'}
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
            <button
              onClick={() => setActiveTab('leads')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Get Leads</span>
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer"
            >
              <Target className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
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
              <ActionCard
                icon={TrendingUp}
                title="Find Leads"
                description="Search by industry, company, segment, and location, then unlock or export the contacts you need."
                buttonLabel="Open Lead Search"
                onClick={() => setActiveTab('leads')}
                color="indigo"
              />
              <ActionCard
                icon={Target}
                title="Create Campaign"
                description="Create templates, manage email lists, and start campaigns from saved lead inventory."
                buttonLabel="Open Campaigns"
                onClick={() => setActiveTab('campaigns')}
                color="purple"
              />
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
              <StatTile
                label="Saved Leads"
                value={formatNumber(dashboardMetrics.totalCrmLeads)}
                helper={`${formatNumber(dashboardMetrics.emailReadyLeads)} email ready`}
                icon={Database}
                color="blue"
              />
              <StatTile
                label="Email Lists"
                value={formatNumber(dashboardMetrics.crmListCount)}
                helper={`${formatNumber(dashboardMetrics.downloadedLeadCount)} leads downloaded`}
                icon={ListChecks}
                color="emerald"
              />
              <StatTile
                label="Campaigns"
                value={formatNumber(dashboardMetrics.totalCampaigns)}
                helper={`${formatNumber(dashboardMetrics.activeCampaigns)} active, ${formatNumber(dashboardMetrics.draftCampaigns)} draft`}
                icon={Target}
                color="purple"
              />
              <StatTile
                label="Credits"
                value={formatNumber(dashboardMetrics.remainingCredits)}
                helper={`${formatNumber(dashboardMetrics.totalCreditsUsed)} used`}
                icon={Zap}
                color="amber"
              />
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
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                  >
                    Manage Campaigns
                  </button>
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
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Find More Leads</span>
                  </button>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'leads':
        return <LeadGeneration
          onCollapseSidebar={() => setSidebarCollapsed(true)}
          onExpandSidebar={() => setSidebarCollapsed(false)}
        />;
      case 'campaigns':
        return <Campaign
          onCollapseSidebar={() => setSidebarCollapsed(true)}
          onExpandSidebar={() => setSidebarCollapsed(false)}
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
        />
      </div>

      {/* Main Content Area with left margin for sidebar */}
      <div className={`flex flex-col h-full min-h-0 overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
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
    </div>
    </>
  );
}

// Export the sidebar component
export { SideLeftBar };
