'use client';

// Helpers shared by the workspace shell and its tab pages.
// They used to be module-level consts inside HotLeadInBox/index.jsx; the tabs
// are separate route files now, so they live here to avoid a circular import
// (a page importing the shell that renders it).

import React from 'react';

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const initialDashboardState = {
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

export const formatNumber = (value) => Number(value || 0).toLocaleString();

export const formatShortDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export const getCampaignStatusCounts = (campaigns) => campaigns.reduce((acc, campaign) => {
  const status = campaign.status || 'draft';
  acc[status] = (acc[status] || 0) + 1;
  return acc;
}, {});

export const colorStyles = {
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

export const getColorStyles = (color) => colorStyles[color] || colorStyles.indigo;

export const getActivityLabel = (actionType) => ({
  DOWNLOAD_LEADS: 'Downloaded leads',
  SEND_CAMPAIGN_EMAIL: 'Campaign send',
  VIEW_EMAIL: 'Viewed email',
  VIEW_PHONE: 'Viewed phone'
}[actionType] || actionType?.replaceAll('_', ' ') || 'Credit activity');

// Locked tab placeholder
export function LockedTab({ tabName, unlockedIn }) {
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
