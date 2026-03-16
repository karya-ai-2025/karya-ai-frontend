'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Bell, ChevronDown, Home, BarChart3, FileText, Users, BookOpen,
  MessageSquare, TrendingUp, Settings, Plus, Calendar, Clock, CheckCircle,
  AlertCircle, ChevronRight, MoreHorizontal, Star, Upload,
  HelpCircle, ExternalLink, Sparkles, Menu, LogOut, User, CreditCard, Lightbulb,
  FileUp, UserPlus, CalendarClock, Download, PlayCircle, Headphones, DollarSign
} from 'lucide-react';

// Mock user data
const mockUser = {
  id: 1,
  name: "Alex Thompson",
  email: "alex@techstartup.com",
  company: "TechStartup Inc.",
  avatar: "AT",
  plan: "Growth",
  unreadNotifications: 5
};

// Mock projects data
const mockProjects = [
  {
    id: 1,
    name: "Q1 Outbound Campaign",
    status: "in-progress",
    statusLabel: "In Progress",
    progress: 45,
    currentDay: 32,
    totalDays: 90,
    budgetSpent: 3200,
    budgetTotal: 8000,
    tasksComplete: 12,
    tasksTotal: 27,
    nextMilestone: { name: "Campaign Launch", dueDate: "March 15" },
    experts: [
      { id: 1, name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
      { id: 2, name: "Sarah Kim", avatar: "SK", color: "bg-pink-500" }
    ],
    lastActivity: "2 hours ago"
  },
  {
    id: 2,
    name: "Content Strategy Revamp",
    status: "at-risk",
    statusLabel: "At Risk",
    progress: 68,
    currentDay: 45,
    totalDays: 60,
    budgetSpent: 4800,
    budgetTotal: 6000,
    tasksComplete: 15,
    tasksTotal: 22,
    nextMilestone: { name: "Content Calendar", dueDate: "March 8" },
    experts: [
      { id: 2, name: "Sarah Kim", avatar: "SK", color: "bg-pink-500" }
    ],
    lastActivity: "5 hours ago"
  },
  {
    id: 3,
    name: "SEO Optimization Phase 2",
    status: "in-progress",
    statusLabel: "In Progress",
    progress: 25,
    currentDay: 15,
    totalDays: 60,
    budgetSpent: 1500,
    budgetTotal: 5000,
    tasksComplete: 8,
    tasksTotal: 32,
    nextMilestone: { name: "Technical Audit", dueDate: "March 20" },
    experts: [
      { id: 3, name: "Lisa Martinez", avatar: "LM", color: "bg-orange-500" }
    ],
    lastActivity: "1 day ago"
  }
];

// Mock action items
const mockActionItems = [
  { id: 1, priority: "urgent", title: "Review and approve email sequence draft", project: "Q1 Outbound Campaign", expert: "John Davis", dueDate: "Today" },
  { id: 2, priority: "urgent", title: "Payment milestone reached - Review deliverables", project: "Content Strategy Revamp", expert: "Sarah Kim", dueDate: "Today" },
  { id: 3, priority: "this-week", title: "Weekly sync with Sarah scheduled", project: "Content Strategy Revamp", dueDate: "Thu 2pm" },
  { id: 4, priority: "this-week", title: "ICP workshop deliverable expected", project: "Q1 Outbound Campaign", dueDate: "Friday" },
  { id: 5, priority: "fyi", title: "New expert match available for SEO project", project: "SEO Optimization" },
  { id: 6, priority: "fyi", title: "Q4 campaign results report ready", project: "Q4 Campaign" }
];

// Mock activity feed
const mockActivityFeed = [
  { id: 1, icon: "\u2705", title: "John completed \"Email Sequence Draft\"", timestamp: "2 hours ago", project: "Q1 Outbound" },
  { id: 2, icon: "\uD83D\uDCAC", title: "Sarah commented on \"Landing Page Copy\"", timestamp: "5 hours ago", project: "Content Strategy" },
  { id: 3, icon: "\uD83D\uDCC4", title: "New file uploaded: \"Competitor Analysis.pdf\"", timestamp: "Yesterday", project: "SEO Optimization" },
  { id: 4, icon: "\u2B50", title: "You approved milestone \"ICP Definition\"", timestamp: "2 days ago", project: "Q1 Outbound" },
  { id: 5, icon: "\uD83D\uDC65", title: "Lisa joined the project", timestamp: "3 days ago", project: "SEO Optimization" }
];

// Mock expert performance
const mockExpertPerformance = [
  { id: 1, name: "John Davis", avatar: "JD", color: "bg-emerald-500", project: "Q1 Outbound", tasksComplete: "12/18", onTimeRate: 100, responseTime: "2 hrs" },
  { id: 2, name: "Sarah Kim", avatar: "SK", color: "bg-pink-500", project: "Content Strategy", tasksComplete: "15/22", onTimeRate: 80, responseTime: "4 hrs" },
  { id: 3, name: "Lisa Martinez", avatar: "LM", color: "bg-orange-500", project: "SEO Optimization", tasksComplete: "8/15", onTimeRate: 100, responseTime: "1 hr" }
];

// Mock knowledge base files
const mockKnowledgeBaseFiles = [
  { id: 1, name: "Company ICP v2.3", type: "doc", meta: "Updated 2 days ago", icon: "\uD83D\uDCCB" },
  { id: 2, name: "Q4 Campaign Results", type: "report", meta: "Viewed 5 times", icon: "\uD83D\uDCCA" },
  { id: 3, name: "2025 GTM Strategy", type: "strategy", meta: "Shared with 3 experts", icon: "\uD83C\uDFAF" },
  { id: 4, name: "Email Templates Library", type: "templates", meta: "14 templates", icon: "\u2709\uFE0F" }
];

// Mock upcoming milestones
const mockUpcomingMilestones = [
  { id: 1, date: "Mar 8", title: "Content Calendar", project: "Content Strategy" },
  { id: 2, date: "Mar 15", title: "Campaign Launch", project: "Q1 Outbound" },
  { id: 3, date: "Mar 20", title: "Technical Audit", project: "SEO Optimization" },
  { id: 4, date: "Mar 28", title: "Email A/B Results", project: "Q1 Outbound" }
];

// Mock AI recommendations
const mockRecommendations = [
  { id: 1, text: "Your outbound campaign has high open rates but low replies - consider messaging refresh" },
  { id: 2, text: "Expert Sarah has capacity for additional work - expand content project scope?" },
  { id: 3, text: "Q1 ends in 28 days - schedule strategy review meeting" }
];

// Sidebar navigation items
const sidebarNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'projects', label: 'Active Projects', icon: BarChart3, path: '/business-dashboard/project-workspace/1' },
  { id: 'drafts', label: 'Project Drafts', icon: FileText, path: '/drafts' },
  { id: 'experts', label: 'My Experts', icon: Users, path: '/my-experts' },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, path: '/knowledge-base' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages', badge: 3 },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
];

// Status badge component
function StatusBadge({ status, label }) {
  const styles = {
    'in-progress': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'at-risk': 'bg-amber-50 text-amber-700 border-amber-200',
    'blocked': 'bg-red-50 text-red-700 border-red-200',
    'completed': 'bg-blue-50 text-blue-700 border-blue-200'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {label}
    </span>
  );
}

// Project Card Component
function ProjectCard({ project, onClick }) {
  return (
    <div
      className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">{project.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">Day {project.currentDay} of {project.totalDays}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={project.status} label={project.statusLabel} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Progress</span>
          <span className="text-gray-900 font-semibold">{project.progress}%</span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              project.status === 'at-risk' ? 'bg-amber-500' :
              project.status === 'blocked' ? 'bg-red-500' :
              'bg-indigo-500'
            }`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-gray-500 text-xs mb-1">Tasks</div>
          <div className="text-gray-900 font-bold">{project.tasksComplete}/{project.tasksTotal}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-gray-500 text-xs mb-1">Milestone</div>
          <div className="text-gray-900 font-bold">{project.nextMilestone.dueDate}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-gray-500 text-xs mb-1">Budget</div>
          <div className="text-gray-900 font-bold">${(project.budgetSpent / 1000).toFixed(1)}k</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center -space-x-2">
          {project.experts.map(expert => (
            <div
              key={expert.id}
              className={`w-8 h-8 ${expert.color} rounded-full flex items-center justify-center border-2 border-white`}
              title={expert.name}
            >
              <span className="text-white text-xs font-bold">{expert.avatar}</span>
            </div>
          ))}
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-1">
          View <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function BusinessDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const activeProjectCount = mockProjects.filter(p => p.status !== 'completed').length;
  const pendingDeliverables = mockActionItems.filter(a => a.priority === 'urgent').length;
  const totalSpendMTD = mockProjects.reduce((sum, p) => sum + p.budgetSpent, 0);
  const totalBudget = mockProjects.reduce((sum, p) => sum + p.budgetTotal, 0);

  return (
    <div className="min-h-screen bg-gray-50 page-enter">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden">
              <Menu className="w-5 h-5 text-gray-500" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">Karya-AI</span>
            </Link>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, experts, files..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-500" />
                {mockUser.unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                    {mockUser.unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {mockActionItems.slice(0, 4).map(item => (
                      <div key={item.id} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            item.priority === 'urgent' ? 'bg-red-500' :
                            item.priority === 'this-week' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <div>
                            <p className="text-sm text-gray-900 font-medium">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.project}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <button className="w-full py-2 text-sm text-indigo-500 hover:text-indigo-600 text-center font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{mockUser.avatar}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 w-56 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{mockUser.name}</p>
                    <p className="text-sm text-gray-500">{mockUser.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                      {mockUser.plan} Plan
                    </span>
                  </div>
                  <div className="p-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg text-left">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Profile Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg text-left">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Billing</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg text-left">
                      <HelpCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Help & Support</span>
                    </button>
                  </div>
                  <div className="p-1 border-t border-gray-200">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 rounded-lg text-left text-red-400">
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

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'} flex-shrink-0 transition-all duration-300 overflow-hidden`}>
          <div className="bg-white border-r border-gray-200 h-[calc(100vh-64px)] sticky top-16 p-4">
            {/* New Project Button */}
            <button
              onClick={() => router.push('/new-project')}
              className="w-full mb-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-5 h-5" />
              {sidebarOpen && <span>New Project</span>}
            </button>

            {/* Navigation */}
            <nav className="space-y-1">
              {sidebarNavItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveNav(item.id); router.push(item.path); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      activeNav === item.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs text-white font-bold">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {getGreeting()}, {mockUser.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-500">
                  You have <span className="text-indigo-500 font-semibold">{activeProjectCount} active projects</span> and{' '}
                  <span className="text-amber-400 font-semibold">{pendingDeliverables} pending actions</span>
                </p>
              </div>
              <button
                onClick={() => router.push('/new-project')}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-5 h-5" />
                Start New Project
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover-lift stagger-item delay-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-indigo-500" />
                </div>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full font-semibold">+1</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{activeProjectCount}</div>
              <div className="text-sm text-gray-500 mt-1">Active Projects</div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover-lift stagger-item delay-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-700" />
                </div>
                <span className="text-xs text-gray-500 font-medium">{Math.round((totalSpendMTD / totalBudget) * 100)}%</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">${(totalSpendMTD / 1000).toFixed(1)}k</div>
              <div className="text-sm text-gray-500 mt-1">Spend (MTD)</div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover-lift stagger-item delay-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-700" />
                </div>
                <button className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">View →</button>
              </div>
              <div className="text-3xl font-bold text-gray-900">{mockExpertPerformance.length}</div>
              <div className="text-sm text-gray-500 mt-1">Experts Engaged</div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover-lift stagger-item delay-400">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-700" />
                </div>
                <span className="text-xs text-emerald-700 font-medium">Healthy</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">85%</div>
              <div className="text-sm text-gray-500 mt-1">Project Health</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Projects */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Active Projects</h2>
                  <button className="text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockProjects.slice(0, 2).map(project => (
                    <ProjectCard key={project.id} project={project} onClick={() => router.push(`/business-dashboard/project-workspace/${project.id}`)} />
                  ))}
                </div>
              </section>

              {/* Action Items */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  Action Items
                </h2>
                <div className="space-y-2">
                  {mockActionItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                        item.priority === 'urgent' ? 'bg-red-500' :
                        item.priority === 'this-week' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.project} {item.expert && `• ${item.expert}`}
                        </p>
                      </div>
                      {item.dueDate && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                          item.priority === 'urgent' ? 'bg-red-50 text-red-700' :
                          item.priority === 'this-week' ? 'bg-amber-50 text-amber-700' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {item.dueDate}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Activity */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {mockActivityFeed.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="text-xl flex-shrink-0">{activity.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600">{activity.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.timestamp} • {activity.project}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2.5 text-sm text-indigo-500 hover:text-indigo-600 text-center font-medium hover:bg-gray-50 rounded-lg transition-colors">
                  View all activity →
                </button>
              </section>

              {/* Expert Performance */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Expert Performance</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                        <th className="pb-3 font-semibold">Expert</th>
                        <th className="pb-3 font-semibold">Project</th>
                        <th className="pb-3 font-semibold">Tasks</th>
                        <th className="pb-3 font-semibold">On-Time</th>
                        <th className="pb-3 font-semibold">Response</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockExpertPerformance.map(expert => (
                        <tr key={expert.id} className="hover:bg-gray-50">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 ${expert.color} rounded-lg flex items-center justify-center`}>
                                <span className="text-white text-xs font-bold">{expert.avatar}</span>
                              </div>
                              <span className="text-gray-900 text-sm font-medium">{expert.name}</span>
                            </div>
                          </td>
                          <td className="py-3 text-sm text-gray-500">{expert.project}</td>
                          <td className="py-3 text-sm text-gray-900 font-medium">{expert.tasksComplete}</td>
                          <td className="py-3">
                            <span className={`text-sm font-semibold ${expert.onTimeRate >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {expert.onTimeRate}%
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-500">{expert.responseTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Upcoming Milestones */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  Upcoming Milestones
                </h2>
                <div className="space-y-3">
                  {mockUpcomingMilestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
                      <div className="w-14 h-14 bg-indigo-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs text-indigo-500 font-medium">{milestone.date.split(' ')[0]}</span>
                        <span className="text-lg font-bold text-gray-900">{milestone.date.split(' ')[1]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                        <p className="text-xs text-gray-500">{milestone.project}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 py-2.5 text-sm text-indigo-500 hover:text-indigo-600 text-center font-medium hover:bg-gray-50 rounded-lg transition-colors">
                  View Full Calendar
                </button>
              </section>

              {/* Knowledge Base */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  Knowledge Base
                </h2>
                <div className="space-y-2">
                  {mockKnowledgeBaseFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
                      <span className="text-2xl">{file.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 py-2.5 text-sm text-indigo-500 hover:text-indigo-600 text-center font-medium hover:bg-gray-50 rounded-lg transition-colors">
                  View All Files
                </button>
              </section>

              {/* AI Recommendations */}
              <section className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  AI Recommendations
                </h2>
                <div className="space-y-3">
                  {mockRecommendations.map(rec => (
                    <div key={rec.id} className="flex items-start gap-2 p-3 bg-white/80 rounded-xl border border-gray-200">
                      <span className="text-amber-400 text-lg">💡</span>
                      <p className="text-sm text-gray-600">{rec.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Quick Links */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Plus, label: "New Project", color: "text-indigo-500" },
                    { icon: UserPlus, label: "Find Expert", color: "text-blue-400" },
                    { icon: FileUp, label: "Upload File", color: "text-emerald-400" },
                    { icon: CalendarClock, label: "Schedule", color: "text-amber-400" },
                    { icon: MessageSquare, label: "Messages", color: "text-pink-400" },
                    { icon: Download, label: "Reports", color: "text-cyan-400" }
                  ].map((item, idx) => (
                    <button key={idx} className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Help & Resources */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-500" />
                  Help & Resources
                </h2>
                <div className="space-y-2">
                  {[
                    { icon: BookOpen, label: "Getting Started Guide" },
                    { icon: PlayCircle, label: "Tutorial Videos" },
                    { icon: Calendar, label: "Schedule Demo" }
                  ].map((item, idx) => (
                    <button key={idx} className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left">
                      <item.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 flex-1">{item.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  ))}
                  <button className="w-full flex items-center gap-3 p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all text-left mt-2">
                    <Headphones className="w-4 h-4 text-white" />
                    <span className="text-sm text-white font-medium">Contact Support</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
