'use client';
import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search, Bell, ChevronDown, Home, Briefcase, Target, Users, DollarSign,
  FolderOpen, Phone, Wrench, Settings, Layers, Menu, LogOut, User,
  CreditCard, HelpCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',           label: 'Dashboard',             icon: Home,       path: '/expert-dashboard' },
  { id: 'projects',            label: 'Active Projects',       icon: Briefcase,  path: '/expert/projects' },
  { id: 'project-marketplace', label: 'Project Catalog',       icon: Layers,     path: '/project-marketplace' },
  { id: 'opportunities',       label: 'Opportunities',         icon: Target,     path: '/expert/opportunities' },
  { id: 'clients',             label: 'Clients',               icon: Users,      path: '/expert/clients' },
  { id: 'earnings',            label: 'Earnings',              icon: DollarSign, path: '/expert/earnings' },
  { id: 'portfolio',           label: 'Portfolio',             icon: FolderOpen, path: '/expert/portfolio' },
  { id: 'crm',                 label: 'CRM & Outreach',        icon: Phone,      path: '/expert/crm' },
  { id: 'tools',               label: 'Tools & Integrations',  icon: Wrench,     path: '/expert/tools' },
  { id: 'settings',            label: 'Settings',              icon: Settings,   path: '/expert/settings' },
];

function getInitials(name) {
  return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'EX';
}

export default function ExpertPageWrapper({ activeNav = 'dashboard', children }) {
  const router = useRouter();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auth guard — all expert pages require login
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?role=expert');
    }
  }, [loading, isAuthenticated, router]);

  // bfcache guard
  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted && !localStorage.getItem('token')) {
        window.location.replace('/login?role=expert');
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated) return null;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    window.location.replace('/');
  };

  const displayName = user?.fullName || user?.name || 'Expert';

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm flex-shrink-0 z-50">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-500" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <NextImage src="/karya-ai-logo.png" alt="Karya AI" width={36} height={36} className="rounded-xl object-contain" />
              <span className="text-lg font-bold text-gray-900 hidden sm:block">Karya-AI</span>
            </Link>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search projects, clients, files..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-500" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button className="text-xs text-blue-500 hover:text-blue-600 font-medium">Mark all read</button>
                  </div>
                  <div className="p-6 text-center text-sm text-gray-400">No notifications yet</div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={displayName}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{getInitials(displayName)}</span>
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 w-56 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900 truncate">{displayName}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email || ''}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { setShowUserMenu(false); router.push('/expert/settings'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg text-left"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Profile Settings</span>
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); router.push('/expert/settings'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg text-left"
                    >
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Payment Settings</span>
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); router.push('/support-help'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg text-left"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Help & Support</span>
                    </button>
                  </div>
                  <div className="p-1 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 rounded-lg text-left text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0 lg:w-16'} flex-shrink-0 transition-all duration-300 overflow-hidden`}>
          <div className={`bg-white border-r border-gray-200 h-full overflow-y-auto ${sidebarOpen ? 'p-4' : 'p-2'}`}>
            <nav className="space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.path)}
                    title={!sidebarOpen ? item.label : ''}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${!sidebarOpen ? 'justify-center' : ''} ${
                      activeNav === item.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>

      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowUserMenu(false); setShowNotifications(false); }}
        />
      )}
    </div>
  );
}
