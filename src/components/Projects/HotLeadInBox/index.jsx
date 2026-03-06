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
  Database
} from 'lucide-react';

export default function HotLeadInBox() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

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
    { id: 'campaigns', name: 'Campaigns', icon: Target },
    { id: 'leads', name: 'Leads', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {

    }
  };

  return (
    <div className="flex-1">

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}

// Export the sidebar component
export { SideLeftBar };