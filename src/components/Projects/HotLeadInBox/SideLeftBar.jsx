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
  BarChart3
} from 'lucide-react';

export default function SideLeftBar({ projectMetadata }) {
  const router = useRouter();
  const { user } = useAuth();

  // HotLead specific menu items
  const menuItems = [
    { icon: BarChart3, label: 'Dashboard'},
    { icon: Target, label: 'Campaigns' },
    { icon: Users, label: 'My Contacts' },
    { icon: Phone, label: 'Search Phone Numbers' },
    { icon: Mail, label: 'Email Templates' },
    { icon: FileSpreadsheet, label: 'CSV Enrichment' },
    { icon: Database, label: 'API Enrichment' },
    { icon: Database, label: 'CRM Integration' },
    { icon: Bot, label: 'AI Assistant' },
    { icon: CreditCard, label: 'Billing & Invoices' },
    { icon: Settings, label: 'Settings' },
    { icon: HelpCircle, label: 'Help & Support' }
  ];

  return (
    <div className="w-[260px] h-screen bg-gradient-to-b from-indigo-600 to-purple-800 text-white flex-shrink-0 overflow-y-auto custom-scrollbar">
      {/* Back to Dashboard */}
      <div className="p-4 border-b border-indigo-500/30">
        <button
          onClick={() => router.push('/business-dashboard')}
          className="w-full flex items-center space-x-2 text-indigo-200 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Dashboard</span>
        </button>
      </div>

      {/* User Section */}
      <div className="p-6 border-b border-indigo-500/30">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">
              {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
            </span>
          </div>
          <div>
            <p className="font-semibold">{user?.fullName || 'User'}</p>
            <p className="text-indigo-200 text-sm">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        {projectMetadata && (
          <div className="text-sm text-indigo-200 mb-2">
            Project: {projectMetadata.name}
          </div>
        )}
        <div className="text-sm text-indigo-200 mb-2">Credits left: 5</div>
        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
          Upgrade
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors mb-1 ${
              item.active
                ? 'bg-white/20 text-white'
                : 'text-indigo-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
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
  );
}
