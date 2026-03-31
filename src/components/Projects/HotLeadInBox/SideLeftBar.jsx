'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Users,
  Phone,
  FileSpreadsheet,
  Database,
  Settings,
  CreditCard,
  HelpCircle,
  Bot,
  Target,
  ArrowLeft,
  Mail,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function SideLeftBar({
  collapsed,
  onToggle,
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  projectMetadata
}) {
  const router = useRouter();
  const { user } = useAuth();

  // HotLead specific menu items
  const mainTabs = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'leads', icon: Users, label: 'Leads' },
    { id: 'campaigns', icon: Target, label: 'Campaigns' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const additionalItems = [
    { icon: Phone, label: 'Search Phone Numbers' },
    { icon: Mail, label: 'Email Templates' },
    { icon: FileSpreadsheet, label: 'CSV Enrichment' },
    { icon: Database, label: 'API Enrichment' },
    { icon: Database, label: 'CRM Integration' },
    { icon: Bot, label: 'AI Assistant' },
    { icon: CreditCard, label: 'Billing & Invoices' },
    { icon: HelpCircle, label: 'Help & Support' }
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 h-screen fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out bg-gradient-to-b from-indigo-600 to-purple-800 text-white flex flex-col overflow-hidden shadow-xl`}
      >
        {/* Header with Toggle */}
        <div className="p-4 border-b border-indigo-500/30 flex items-center justify-between">
          <button
            onClick={() => router.push('/business-dashboard')}
            className={`flex items-center space-x-2 text-indigo-200 hover:text-white transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <ArrowLeft size={16} />
            {!collapsed && <span className="text-sm">Back to Dashboard</span>}
          </button>

          {/* Desktop Toggle Button */}
          <button
            onClick={onToggle}
            className="hidden lg:block p-1 rounded text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User Section */}
        <div className="p-4 border-b border-indigo-500/30">
          <div className={`flex items-center mb-4 ${collapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold">
                {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-semibold truncate">{user?.fullName || 'User'}</p>
                <p className="text-indigo-200 text-sm truncate">{user?.email || 'user@example.com'}</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <>
              {projectMetadata && (
                <div className="text-sm text-indigo-200 truncate">
                  Project: {projectMetadata.name}
                </div>
              )}
              {/* <div className="text-sm text-indigo-200 mb-2">Credits left: 5</div> */}
              {/* <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Upgrade
              </button> */}
            </>
          )}

          {collapsed && (
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-2 rounded-lg text-xs font-medium transition-colors">
              ↑
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="p-2 flex-1 overflow-y-auto custom-scrollbar">
          <div className="mb-4">
            {mainTabs.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors mb-1 ${
                  activeTab === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                } ${collapsed ? 'justify-center' : 'space-x-3'}`}
                title={collapsed ? item.label : ''}
              >
                <item.icon size={18} />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </button>
            ))}
          </div>

          {/* Additional Menu Items */}
          {!collapsed && (
            <div className="border-t border-indigo-500/30 pt-4">
              <div className="text-xs text-indigo-300 mb-2 px-3">MORE TOOLS</div>
              {additionalItems.map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors mb-1 text-indigo-200 hover:bg-white/10 hover:text-white"
                >
                  <item.icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(79, 70, 229, 0.1);
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(79, 70, 229, 0.4);
            border-radius: 3px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(79, 70, 229, 0.6);
          }
        `}</style>
      </div>
    </>
  );
}