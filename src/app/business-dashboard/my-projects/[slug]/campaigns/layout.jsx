'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { Mail, Plus, Database, Settings, Users, BarChart3, Zap } from 'lucide-react';
import TabGuard from '@/components/Projects/HotLeadInBox/TabGuard';
import { CampaignProvider, useCampaigns } from '@/components/Projects/HotLeadInBox/Campaign/CampaignContext';
import { campaignPaths } from '@/components/Projects/workspaceRoutes';

const CRUMB = {
  new: 'Create Campaign',
  templates: 'Campaign Templates',
  lists: 'Email Lists',
  edit: 'Edit Campaign',
};

function QuickStatsBar({ stats }) {
  // Class names are written out in full, never interpolated — Tailwind scans the
  // source for literal strings, so `text-${color}-600` would be purged and the
  // colours would silently vanish.
  const tiles = [
    { label: 'Campaigns',    value: stats.totalCampaigns,   icon: Mail,      iconClass: 'text-indigo-600',  valueClass: 'text-indigo-900' },
    { label: 'Active',       value: stats.activeCampaigns,  icon: Users,     iconClass: 'text-emerald-600', valueClass: 'text-emerald-900' },
    { label: 'Emails Sent',  value: stats.totalEmailsSent,  icon: BarChart3, iconClass: 'text-blue-600',    valueClass: 'text-blue-900' },
    { label: 'Credits Used', value: stats.totalCreditsUsed, icon: Zap,       iconClass: 'text-amber-600',   valueClass: 'text-amber-900' },
  ];
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map(({ label, value, icon: Icon, iconClass, valueClass }) => (
          <div key={label} className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Icon className={`w-4 h-4 ${iconClass} mr-1`} />
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </div>
            <div className={`text-lg font-bold ${valueClass}`}>
              {Number(value || 0).toLocaleString()}
              {label === 'Credits Used' ? '⚡' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampaignChrome({ children }) {
  const { slug } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { campaignStats, loading, error, fetchDashboardData } = useCampaigns();
  const paths = campaignPaths(slug);

  // Which sub-view we're on, derived from the URL rather than stored.
  const rest = pathname.split('/campaigns')[1]?.replace(/^\//, '') || '';
  const isList = rest === '';
  const crumb = rest.endsWith('/edit') ? CRUMB.edit : CRUMB[rest] || (rest ? 'Campaign' : null);

  return (
    <div className="space-y-6">
      <div className="flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
          </div>

          {!isList && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <button
                onClick={() => router.push(paths.list)}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              <span>/</span>
              <span className="text-gray-900">{crumb}</span>
            </div>
          )}
        </div>

        {isList && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(paths.lists)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Email Lists</span>
            </button>
            <button
              onClick={() => router.push(paths.templates)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Campaign Templates</span>
            </button>
            <button
              onClick={() => router.push(paths.create)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all transform hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Campaign</span>
            </button>
          </div>
        )}
      </div>

      {isList && !loading && (
        <div className="flex-shrink-0"><QuickStatsBar stats={campaignStats} /></div>
      )}

      {error && (
        <div className="flex-shrink-0 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <span className="text-sm font-medium">Error: {error}</span>
            <button
              onClick={fetchDashboardData}
              className="text-xs text-red-600 hover:text-red-800 underline ml-2 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="pb-2">{children}</div>
    </div>
  );
}

export default function CampaignsLayout({ children }) {
  return (
    <TabGuard tab="campaigns" tabName="Email Campaigns" unlockedIn="Lead Generation">
      <CampaignProvider>
        <CampaignChrome>{children}</CampaignChrome>
      </CampaignProvider>
    </TabGuard>
  );
}
