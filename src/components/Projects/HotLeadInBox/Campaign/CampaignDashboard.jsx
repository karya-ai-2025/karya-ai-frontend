'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Users,
  BarChart3,
  Play,
  Pause,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  Search,
  Eye,
  Copy
} from 'lucide-react';

// Enhanced scrollbar styles for the campaigns table
const scrollbarStyles = `
  .campaigns-table-scroll::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .campaigns-table-scroll::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }

  .campaigns-table-scroll::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 4px;
  }

  .campaigns-table-scroll::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }

  .campaigns-table-scroll::-webkit-scrollbar-corner {
    background: #f3f4f6;
  }
`;

export default function CampaignDashboard({
  campaignStats,
  loading,
  error,
  onCreateCampaign,
  onManageTemplates,
  onViewCampaignStats,
  onEditCampaign,
  onRefresh,
  onCollapseSidebar
}) {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Filter campaigns when search term or status filter changes
  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, statusFilter]);

  const fetchCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/campaigns?limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setCampaigns(data.data || []);
      } else {
        console.error('Failed to fetch campaigns:', data.message);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setCampaignsLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = campaigns;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    setFilteredCampaigns(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  // Campaign actions
  const [creditError, setCreditError] = useState(null);

  const handleStartCampaign = async (campaignId) => {
    try {
      setActionLoading({ ...actionLoading, [campaignId]: 'starting' });
      setCreditError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/campaigns/${campaignId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchCampaigns();
        onRefresh();
      } else if (response.status === 402) {
        setCreditError({
          message: data.message,
          creditsRequired: data.creditsRequired,
          remainingCredits: data.remainingCredits,
          leadsCount: data.leadsCount
        });
      } else {
        alert(`Failed to start campaign: ${data.message}`);
      }
    } catch (error) {
      console.error('Error starting campaign:', error);
      alert('Failed to start campaign. Please try again.');
    } finally {
      setActionLoading({ ...actionLoading, [campaignId]: null });
    }
  };

  const handlePauseCampaign = async (campaignId) => {
    try {
      setActionLoading({ ...actionLoading, [campaignId]: 'pausing' });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/campaigns/${campaignId}/pause`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchCampaigns();
        onRefresh();
      } else {
        alert(`Failed to pause campaign: ${data.message}`);
      }
    } catch (error) {
      console.error('Error pausing campaign:', error);
      alert('Failed to pause campaign. Please try again.');
    } finally {
      setActionLoading({ ...actionLoading, [campaignId]: null });
    }
  };

  const handleDeleteCampaign = async (campaignId, campaignName) => {
    if (!confirm(`Are you sure you want to delete "${campaignName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [campaignId]: 'deleting' });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchCampaigns();
        onRefresh();
      } else {
        alert(`Failed to delete campaign: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign. Please try again.');
    } finally {
      setActionLoading({ ...actionLoading, [campaignId]: null });
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Edit3 },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Calendar },
      sending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      paused: { bg: 'bg-orange-100', text: 'text-orange-800', icon: Pause },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Campaign row component
  const CampaignRow = ({ campaign }) => (
    <tr key={campaign._id} className="hover:bg-gray-50 border-b border-gray-200">
      <td className="px-4 py-4 min-w-48">
        <div>
          <div className="font-medium text-gray-900">{campaign.name}</div>
          {campaign.description && (
            <div className="text-sm text-gray-500 mt-1">
              {campaign.description.length > 60
                ? `${campaign.description.substring(0, 60)}...`
                : campaign.description
              }
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-4 min-w-24">
        <StatusBadge status={campaign.status} />
      </td>

      <td className="px-4 py-4 text-sm text-gray-900 min-w-20">
        {campaign.stats?.totalLeads || 0}
      </td>

      <td className="px-4 py-4 text-sm text-gray-900 min-w-32">
        <div className="flex flex-col space-y-1">
          <div>Sent: {campaign.stats?.sentCount || 0}</div>
          <div className="text-xs text-gray-500">
            Opened: {campaign.stats?.openedCount || 0} ({campaign.performance?.openRate || 0}%)
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-sm text-gray-500 min-w-24">
        {new Date(campaign.createdAt).toLocaleDateString()}
      </td>

      <td className="px-4 py-4 min-w-28">
        <div className="flex items-center space-x-2">
          {/* View Stats */}
          <button
            onClick={() => onViewCampaignStats(campaign)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="View Statistics"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Edit - only for draft/paused */}
          {['draft', 'paused'].includes(campaign.status) && (
            <button
              onClick={() => onEditCampaign && onEditCampaign(campaign)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit Campaign"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Start/Pause */}
          {campaign.status === 'draft' || campaign.status === 'paused' ? (
            <button
              onClick={() => handleStartCampaign(campaign._id)}
              disabled={actionLoading[campaign._id]}
              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
              title="Start Campaign"
            >
              {actionLoading[campaign._id] === 'starting' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          ) : campaign.status === 'sending' ? (
            <button
              onClick={() => handlePauseCampaign(campaign._id)}
              disabled={actionLoading[campaign._id]}
              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
              title="Pause Campaign"
            >
              {actionLoading[campaign._id] === 'pausing' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </button>
          ) : null}

          {/* Delete */}
          {campaign.status !== 'sending' && (
            <button
              onClick={() => handleDeleteCampaign(campaign._id, campaign.name)}
              disabled={actionLoading[campaign._id]}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              title="Delete Campaign"
            >
              {actionLoading[campaign._id] === 'deleting' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading campaigns...</span>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="h-full min-h-0 flex flex-col space-y-6 overflow-hidden">
      {/* Search and Filters */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <button
          onClick={() => { fetchCampaigns(); onRefresh(); }}
          className="flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors whitespace-nowrap"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Credit Error Banner */}
      {creditError && (
        <div className="flex-shrink-0 bg-amber-50 border border-amber-300 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-amber-900">Insufficient Credits</div>
                <div className="text-sm text-amber-800 mt-1">{creditError.message}</div>
                {creditError.creditsRequired && (
                  <div className="mt-2 flex items-center space-x-4 text-xs text-amber-700">
                    <span>Required: <strong>{creditError.creditsRequired}</strong></span>
                    <span>Available: <strong>{creditError.remainingCredits}</strong></span>
                    <span>Shortage: <strong>{creditError.creditsRequired - creditError.remainingCredits}</strong></span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setCreditError(null)}
              className="text-amber-500 hover:text-amber-700 p-1"
            >
              <span className="text-lg leading-none">&times;</span>
            </button>
          </div>
        </div>
      )}

      {/* Campaigns Table */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0">
        {campaignsLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading campaigns...</span>
          </div>
        ) : currentCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filteredCampaigns.length === 0 && campaigns.length > 0
                ? 'No campaigns match your filters'
                : 'No campaigns yet'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {filteredCampaigns.length === 0 && campaigns.length > 0
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first email campaign to start reaching out to your leads.'
              }
            </p>
            {filteredCampaigns.length === 0 && campaigns.length === 0 && (
              <button
                onClick={onCreateCampaign}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table - Scrollable with sticky header */}
            <div
              className="flex-1 overflow-auto min-h-0 max-h-96 campaigns-table-scroll"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#9CA3AF #F3F4F6'
              }}
            >
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48">
                      Campaign
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-24">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-20">
                      Leads
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                      Performance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-24">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-28">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCampaigns.map(campaign => (
                    <CampaignRow key={campaign._id} campaign={campaign} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - Fixed */}
            {totalPages > 1 && (
              <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <span className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 border border-indigo-200 rounded">
                      {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}
