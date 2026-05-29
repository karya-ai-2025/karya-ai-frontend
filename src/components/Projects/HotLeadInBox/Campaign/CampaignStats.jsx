'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Users,
  Eye,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Clock,
  Zap,
  RefreshCw,
  Download,
  CheckCircle
} from 'lucide-react';

// Enhanced scrollbar styles for the campaign stats
const scrollbarStyles = `
  .campaign-stats-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .campaign-stats-scroll::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }

  .campaign-stats-scroll::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 4px;
  }

  .campaign-stats-scroll::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }

  .campaign-stats-scroll::-webkit-scrollbar-corner {
    background: #f3f4f6;
  }
`;

export default function CampaignStats({ campaign, onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'all', '7d', '30d'

  useEffect(() => {
    if (campaign) {
      fetchCampaignStats();
    }
  }, [campaign, timeRange]);

  const fetchCampaignStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/campaigns/${campaign._id}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || 'Failed to fetch campaign statistics');
      }
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      setError('Failed to load campaign statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Scheduled' },
      sending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Sending' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      paused: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Paused' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Metric card component
  const MetricCard = ({ title, value, icon: Icon, color = 'indigo', change, isComplete }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm text-gray-600">{title}</p>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
              {isComplete && <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />}
            </div>
          </div>
        </div>
        <div className={`flex-shrink-0 p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>

      {change && (
        <div className={`flex items-center mt-3 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`w-4 h-4 mr-1 ${change < 0 ? 'transform rotate-180' : ''}`} />
          <span>{Math.abs(change)}% vs last campaign</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading campaign statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Statistics</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Back to Campaigns
          </button>
          <button
            onClick={fetchCampaignStats}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { campaign: campaignData, emailStats, summary } = stats;
  const getEmailStatusCount = (status) => emailStats[status] || 0;
  const openedCount = getEmailStatusCount('opened') + getEmailStatusCount('clicked') + getEmailStatusCount('replied');
  const deliveredCount = getEmailStatusCount('delivered') + openedCount;
  const sentCount = getEmailStatusCount('sent') + deliveredCount + getEmailStatusCount('bounced') + getEmailStatusCount('spam');
  const totalEmails = campaignData.stats?.totalLeads || summary.totalLeads || emailStats.total || 0;
  const getRate = (value, total) => {
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.round((value / total) * 100));
  };
  const sentRate = getRate(sentCount, totalEmails);
  const deliveryRate = getRate(deliveredCount, totalEmails);
  const openRate = getRate(openedCount, totalEmails);
  const completionRate = totalEmails > 0
    ? Math.min(100, Math.round(((sentCount + deliveredCount) / (totalEmails * 2)) * 100))
    : 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="h-full min-h-0 flex flex-col space-y-4 sm:space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="min-w-0 max-w-full truncate text-xl lg:text-2xl font-bold text-gray-900">{campaignData.name}</h1>
              <StatusBadge status={campaignData.status} />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button
            onClick={fetchCampaignStats}
            className="flex w-full items-center justify-center p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button className="flex w-full items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors whitespace-nowrap sm:w-auto">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          className="h-full min-h-0 overflow-y-auto pb-8 pr-1 sm:pr-2 scroll-smooth space-y-4 sm:space-y-6 campaign-stats-scroll"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #F3F4F6'
          }}
        >
          {/* Campaign Overview */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-2 sm:p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-indigo-900">{totalEmails}</div>
            <div className="text-sm text-indigo-700">Total Emails</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-indigo-900">{completionRate}%</div>
            <div className="text-sm text-indigo-700">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <MetricCard
          title="Emails Sent"
          value={`${sentCount} / ${totalEmails}`}
          icon={Mail}
          color="blue"
          isComplete={totalEmails > 0 && sentCount >= totalEmails}
        />

        <MetricCard
          title="Delivered"
          value={`${deliveredCount} / ${totalEmails}`}
          icon={Users}
          color="green"
          isComplete={totalEmails > 0 && deliveredCount >= totalEmails}
        />

        <MetricCard
          title="Opened"
          value={`${openedCount} / ${totalEmails}`}
          icon={Eye}
          color="indigo"
          isComplete={totalEmails > 0 && openedCount >= totalEmails}
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Performance Metrics */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>

          <div className="space-y-4">
            {/* Sent Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Sent Rate</span>
                <span className="text-sm font-medium text-gray-900">{sentRate}%</span>
              </div>
              <div className="w-full overflow-hidden bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${sentRate}%` }}
                ></div>
              </div>
            </div>

            {/* Delivery Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Delivery Rate</span>
                <span className="text-sm font-medium text-gray-900">{deliveryRate}%</span>
              </div>
              <div className="w-full overflow-hidden bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${deliveryRate}%` }}
                ></div>
              </div>
            </div>

            {/* Open Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Open Rate</span>
                <span className="text-sm font-medium text-gray-900">{openRate}%</span>
              </div>
              <div className="w-full overflow-hidden bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${openRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="space-y-4 sm:space-y-6">
          {/* Campaign Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>

            <div className="space-y-3">
              <div className="flex min-w-0 items-center text-sm">
                <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400 mr-2" />
                <span className="flex-shrink-0 text-gray-600">Created:</span>
                <span className="ml-1 min-w-0 text-gray-900">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </span>
              </div>

              {campaign.startedAt && (
                <div className="flex min-w-0 items-center text-sm">
                  <Clock className="w-4 h-4 flex-shrink-0 text-gray-400 mr-2" />
                  <span className="flex-shrink-0 text-gray-600">Started:</span>
                  <span className="ml-1 min-w-0 text-gray-900">
                    {new Date(campaign.startedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {campaign.completedAt && (
                <div className="flex min-w-0 items-center text-sm">
                  <Clock className="w-4 h-4 flex-shrink-0 text-gray-400 mr-2" />
                  <span className="flex-shrink-0 text-gray-600">Completed:</span>
                  <span className="ml-1 min-w-0 text-gray-900">
                    {new Date(campaign.completedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex min-w-0 items-center text-sm">
                <Zap className="w-4 h-4 flex-shrink-0 text-gray-400 mr-2" />
                <span className="flex-shrink-0 text-gray-600">Credits Used:</span>
                <span className="ml-1 min-w-0 text-gray-900">
                  {campaign.totalCreditsConsumed || 0}⚡
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues & Alerts */}
      {(emailStats.bounced > 0 || emailStats.failed > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Issues Detected</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailStats.bounced > 0 && (
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Bounced Emails</div>
                <div className="text-2xl font-bold text-red-600">{emailStats.bounced}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Check for invalid email addresses
                </div>
              </div>
            )}

            {emailStats.failed > 0 && (
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Failed Sends</div>
                <div className="text-2xl font-bold text-red-600">{emailStats.failed}</div>
                <div className="text-xs text-gray-500 mt-1">
                  System or delivery errors
                </div>
              </div>
            )}
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
    </>
  );
}
