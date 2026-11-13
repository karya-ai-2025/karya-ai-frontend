'use client';

import { FileEdit, Eye, CheckCircle, LayoutDashboard, ChevronLeft, ChevronRight, List } from 'lucide-react';

const TAB_ITEMS = [
  { id: 'brief',   label: 'Brand Brief',     icon: FileEdit    },
  { id: 'preview', label: 'Content Preview', icon: Eye         },
  { id: 'history', label: 'History',         icon: CheckCircle },
];

export default function SideLeftBar({ view, onGoToList, activeTab, setActiveTab, sidebarCollapsed, setSidebarCollapsed }) {
  return (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-56'} flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}>
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-gray-100">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900 truncate">Content Project</span>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(p => !p)}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {/* All Campaigns */}
        <button
          onClick={onGoToList}
          title={sidebarCollapsed ? 'All Campaigns' : ''}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'list'
              ? 'bg-violet-50 text-violet-700'
              : 'text-gray-600 hover:bg-gray-100'
          } ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <List className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span>All Campaigns</span>}
        </button>

        {/* Campaign tabs — only shown when viewing a campaign */}
        {view === 'detail' && (
          <>
            {!sidebarCollapsed && (
              <p className="px-2.5 pt-3 pb-1 text-xs text-gray-400 font-semibold uppercase tracking-wide">
                This Campaign
              </p>
            )}
            {TAB_ITEMS.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : ''}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </>
        )}
      </nav>
    </div>
  );
}
