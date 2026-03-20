'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SideLeftBar from './SideLeftBar';
import {
  Mail,
  Phone,
  LinkedinIcon,
  Target,
  BarChart3,
  Settings,
  Users,
  CheckCircle,
  Play,
  Pause,
  TrendingUp,
  Database,
  Menu,
  X
} from 'lucide-react';
import LeadGeneration from './LeadGeneration';

export default function HotLeadInBox({ projectMetadata }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock data for the demo
  const stats = {
    totalLeads: 1247,
    qualifiedLeads: 342,
    emailsSent: 5643,
    responseRate: 12.4,
    conversionRate: 8.7,
    activeCampaigns: 3
  };

  const campaigns = [
    {
      id: 1,
      name: 'Tech Startup Founders',
      status: 'active',
      leads: 156,
      responses: 23,
      responseRate: 14.7
    },
    {
      id: 2,
      name: 'Marketing Directors',
      status: 'paused',
      leads: 89,
      responses: 8,
      responseRate: 9.0
    },
    {
      id: 3,
      name: 'SaaS Sales Leaders',
      status: 'active',
      leads: 97,
      responses: 15,
      responseRate: 15.5
    }
  ];

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'leads', name: 'Leads', icon: Users },
    { id: 'campaigns', name: 'Campaigns', icon: Target },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">Welcome to HotLead InBox</h1>
              <p className="text-indigo-100">Your AI-powered lead generation and management platform</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-3xl font-bold text-gray-900">{}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
                    <p className="text-3xl font-bold text-gray-900">{}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>              
            </div>

            {/* Main Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Get Leads Card - Active */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-indigo-50 rounded-lg mr-4">
                      <TrendingUp className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Get Leads</h3>
                      <p className="text-gray-600">AI-powered lead generation</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6">
                    Let our AI find and qualify leads for you. Define your target audience and we'll generate
                    high-quality prospects automatically.
                  </p>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="w-full bg-indigo-600 text-white px-4 sm:px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 hover:shadow-lg cursor-pointer duration-200 active:scale-95 text-sm sm:text-base"
                  >
                    Get Leads
                  </button>
                </div>
              </div>

              {/* Upload Leads Card - Disabled */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden opacity-60">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg mr-4">
                      <Database className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-500">Upload Leads</h3>
                      <p className="text-gray-400">Import your existing leads</p>
                    </div>
                  </div>

                  <p className="text-gray-500 mb-6">
                    Upload your existing lead database in CSV format. Our AI will enrich and qualify
                    your leads automatically.
                  </p>
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed">
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'leads':
        return <LeadGeneration
          onCollapseSidebar={() => setSidebarCollapsed(true)}
          onExpandSidebar={() => setSidebarCollapsed(false)}
        />;
    }
  };

  return (
    <div className="relative h-screen bg-gray-50">
      {/* Sidebar - Fixed position to cover TopNavbar */}
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
      <div className={`flex flex-col h-full transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">HotLead InBox</h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Content Area with Tabs */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4 lg:space-x-8 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
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
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

// Export the sidebar component
export { SideLeftBar };