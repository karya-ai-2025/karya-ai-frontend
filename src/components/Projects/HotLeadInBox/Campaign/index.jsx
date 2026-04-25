'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Users,
  BarChart3,
  Plus,
  Settings,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CampaignDashboard from './CampaignDashboard';
import CreateCampaign from './CreateCampaign';
import EmailTemplateBuilder from './EmailTemplateBuilder';
import CampaignStats from './CampaignStats';
import EditCampaign from './EditCampaign';

export default function Campaign({ onCollapseSidebar, onExpandSidebar }) {
  const { user } = useAuth();

  // Active component state
  const [activeComponent, setActiveComponent] = useState('dashboard'); // dashboard, create, templates, stats
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Dashboard data state
  const [campaignStats, setCampaignStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalEmailsSent: 0,
    totalCreditsUsed: 0,
    averageOpenRate: 0,
    averageClickRate: 0
  });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/campaigns/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setCampaignStats(data.data.summary || campaignStats);
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load campaign data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Component navigation
  const navigateToComponent = (component, campaignData = null) => {
    setActiveComponent(component);
    if (campaignData) {
      setSelectedCampaign(campaignData);
    }
  };

  // Handle campaign creation success
  const handleCampaignCreated = (newCampaign) => {
    fetchDashboardData();
    setActiveComponent('dashboard');
    console.log('Campaign created successfully:', newCampaign);
  };

  // Handle campaign update success
  const handleCampaignUpdated = (updatedCampaign) => {
    fetchDashboardData();
    setActiveComponent('dashboard');
    setSelectedCampaign(null);
  };

  // Render active component
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'create':
        return (
          <CreateCampaign
            onCampaignCreated={handleCampaignCreated}
            onCancel={() => setActiveComponent('dashboard')}
            onCollapseSidebar={onCollapseSidebar}
          />
        );

      case 'templates':
        return (
          <EmailTemplateBuilder
            onBack={() => setActiveComponent('dashboard')}
            onCollapseSidebar={onCollapseSidebar}
          />
        );

      case 'edit':
        return (
          <EditCampaign
            campaign={selectedCampaign}
            onCampaignUpdated={handleCampaignUpdated}
            onCancel={() => setActiveComponent('dashboard')}
            onCollapseSidebar={onCollapseSidebar}
          />
        );

      case 'stats':
        return (
          <CampaignStats
            campaign={selectedCampaign}
            onBack={() => setActiveComponent('dashboard')}
          />
        );

      case 'dashboard':
      default:
        return (
          <CampaignDashboard
            campaignStats={campaignStats}
            loading={loading}
            error={error}
            onCreateCampaign={() => navigateToComponent('create')}
            onManageTemplates={() => navigateToComponent('templates')}
            onViewCampaignStats={(campaign) => navigateToComponent('stats', campaign)}
            onEditCampaign={(campaign) => navigateToComponent('edit', campaign)}
            onRefresh={fetchDashboardData}
            onCollapseSidebar={onCollapseSidebar}
          />
        );
    }
  };

  // Quick stats bar component
  const QuickStatsBar = () => (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Mail className="w-4 h-4 text-indigo-600 mr-1" />
            <span className="text-xs font-medium text-gray-700">Campaigns</span>
          </div>
          <div className="text-lg font-bold text-indigo-900">{campaignStats.totalCampaigns}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="w-4 h-4 text-emerald-600 mr-1" />
            <span className="text-xs font-medium text-gray-700">Active</span>
          </div>
          <div className="text-lg font-bold text-emerald-900">{campaignStats.activeCampaigns}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <BarChart3 className="w-4 h-4 text-blue-600 mr-1" />
            <span className="text-xs font-medium text-gray-700">Emails Sent</span>
          </div>
          <div className="text-lg font-bold text-blue-900">{campaignStats.totalEmailsSent.toLocaleString()}</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Zap className="w-4 h-4 text-amber-600 mr-1" />
            <span className="text-xs font-medium text-gray-700">Credits Used</span>
          </div>
          <div className="text-lg font-bold text-amber-900">{campaignStats.totalCreditsUsed.toLocaleString()}⚡</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Mail className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
          </div>

          {activeComponent !== 'dashboard' && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <button
                onClick={() => setActiveComponent('dashboard')}
                className="hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </button>
              <span>/</span>
              <span className="text-gray-900 capitalize">{activeComponent}</span>
            </div>
          )}
        </div>

        {activeComponent === 'dashboard' && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigateToComponent('templates')}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Templates</span>
            </button>

            <button
              onClick={() => navigateToComponent('create')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>New Campaign</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats - Only show on dashboard */}
      {activeComponent === 'dashboard' && !loading && (
        <div className="flex-shrink-0">
          <QuickStatsBar />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex-shrink-0 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <span className="text-sm font-medium">Error: {error}</span>
            <button
              onClick={fetchDashboardData}
              className="text-xs text-red-600 hover:text-red-800 underline ml-2"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="pb-2">
        {renderActiveComponent()}
      </div>
    </div>
  );
}
