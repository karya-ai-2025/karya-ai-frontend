'use client';
// pages/ExpertDashboard.jsx
import { useState } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search, Bell, ChevronDown, Home, Briefcase, Target, Users, DollarSign,
  FolderOpen, Phone, Wrench, Settings, Plus, Calendar, Clock, CheckCircle,
  Circle, AlertCircle, ChevronRight, Star, HelpCircle, ExternalLink,
  Sparkles, Menu, LogOut, User, CreditCard, TrendingUp, TrendingDown,
  MessageSquare, FileText, Send, Eye, ThumbsUp, ThumbsDown, Timer,
  Zap, Award, BarChart3, ArrowUpRight, PlayCircle, BookOpen, Megaphone,
  RefreshCw, Mail, Database, Activity, GraduationCap, Image, Quote, Layers
} from 'lucide-react';

// Mock expert user data
const mockExpert = {
  id: 1,
  name: "Sarah Mitchell",
  email: "sarah@mitchellmarketing.com",
  avatar: "SM",
  title: "B2B SaaS Growth Marketer",
  isAvailable: true,
  unreadNotifications: 4,
  earnings: {
    thisMonth: 4250,
    lastMonth: 3480,
    thisQuarter: 11800,
    quarterGoal: 15000,
    pendingPayouts: 2400,
    pendingReleaseDate: "March 10",
    lifetime: 87350
  }
};

// Mock active projects
const mockProjects = [
  {
    id: 1,
    clientName: "TechFlow Inc",
    clientAvatar: "TF",
    clientColor: "bg-blue-500",
    projectName: "Outbound Lead Generation",
    currentWeek: 4,
    totalWeeks: 8,
    progress: 50,
    tasks: [
      { id: 1, name: "Email sequences", status: "complete" },
      { id: 2, name: "Campaign launch", status: "in-progress" },
      { id: 3, name: "Results analysis", status: "upcoming" }
    ],
    nextDeliverable: { name: "Week 4 Report", dueDate: "Thu" },
    clientHealth: "satisfied",
    lastCheckIn: "2 days ago",
    budget: 8000,
    earned: 4000
  },
  {
    id: 2,
    clientName: "FinanceApp",
    clientAvatar: "FA",
    clientColor: "bg-emerald-500",
    projectName: "Content Marketing Strategy",
    currentWeek: 2,
    totalWeeks: 6,
    progress: 33,
    tasks: [
      { id: 1, name: "Content audit", status: "complete" },
      { id: 2, name: "Editorial calendar", status: "in-progress" },
      { id: 3, name: "First batch of articles", status: "upcoming" }
    ],
    nextDeliverable: { name: "Editorial Calendar", dueDate: "Fri" },
    clientHealth: "happy",
    lastCheckIn: "1 day ago",
    budget: 6000,
    earned: 2000
  },
  {
    id: 3,
    clientName: "GrowthStack",
    clientAvatar: "GS",
    clientColor: "bg-purple-500",
    projectName: "Sales Funnel Optimization",
    currentWeek: 6,
    totalWeeks: 8,
    progress: 75,
    tasks: [
      { id: 1, name: "Funnel analysis", status: "complete" },
      { id: 2, name: "Landing page redesign", status: "complete" },
      { id: 3, name: "A/B testing", status: "in-progress" },
      { id: 4, name: "Final report", status: "upcoming" }
    ],
    nextDeliverable: { name: "A/B Test Results", dueDate: "Mon" },
    clientHealth: "satisfied",
    lastCheckIn: "3 days ago",
    budget: 10000,
    earned: 7500
  }
];

// Mock opportunities
const mockOpportunities = [
  {
    id: 1,
    matchScore: 92,
    projectName: "SEO Strategy for SaaS",
    clientType: "Series A Fintech",
    budget: { min: 6000, max: 8000 },
    duration: 60,
    startDate: "ASAP",
    requirements: ["SaaS SEO experience", "Ahrefs proficiency", "Content strategy"],
    whyMatched: "Your SaaS experience + Ahrefs expertise",
    respondBy: "48 hours",
    isNew: true
  },
  {
    id: 2,
    matchScore: 87,
    projectName: "Email Marketing Automation",
    clientType: "Series B E-commerce",
    budget: { min: 5000, max: 7000 },
    duration: 45,
    startDate: "March 15",
    requirements: ["Email automation", "Klaviyo experience", "E-commerce background"],
    whyMatched: "Strong email marketing track record",
    respondBy: "72 hours",
    isNew: true
  }
];

// Mock schedule items
const mockSchedule = [
  { id: 1, type: "meeting", title: "TechFlow Check-in", time: "10:00 AM", day: "Today" },
  { id: 2, type: "deadline", title: "Week 4 Report Due", time: "5:00 PM", day: "Thu" },
  { id: 3, type: "meeting", title: "FinanceApp Kickoff", time: "2:00 PM", day: "Fri" },
  { id: 4, type: "focus", title: "Deep Work Block", time: "9:00 AM - 12:00 PM", day: "Wed" }
];

// Mock action items
const mockActionItems = [
  { id: 1, priority: "urgent", title: "Submit Week 4 Report for TechFlow", project: "TechFlow", dueDate: "Today" },
  { id: 2, priority: "urgent", title: "Respond to Opportunity: SEO Strategy", dueDate: "Today" },
  { id: 3, priority: "urgent", title: "Review client feedback on email draft", project: "FinanceApp", dueDate: "Today" },
  { id: 4, priority: "this-week", title: "Client check-in call", project: "TechFlow", dueDate: "Thu 2pm" },
  { id: 5, priority: "this-week", title: "Finalize Q1 analytics dashboard", project: "GrowthStack", dueDate: "Fri" },
  { id: 6, priority: "this-week", title: "Update portfolio with latest case study", dueDate: "Fri" },
  { id: 7, priority: "upcoming", title: "Proposal due for new opportunity", dueDate: "Next Mon" },
  { id: 8, priority: "upcoming", title: "Monthly earnings review", dueDate: "Mar 1" }
];

// Mock activity feed
const mockActivityFeed = [
  { id: 1, icon: "✅", title: "Client approved \"Email Sequence v2\"", timestamp: "3 hours ago", project: "TechFlow" },
  { id: 2, icon: "💬", title: "New message from TechFlow", timestamp: "5 hours ago" },
  { id: 3, icon: "💰", title: "Milestone payment received: $2,000", timestamp: "Yesterday" },
  { id: 4, icon: "⭐", title: "Client left 5-star review", timestamp: "2 days ago", project: "GrowthStack" },
  { id: 5, icon: "📄", title: "Uploaded deliverable to FinanceApp project", timestamp: "3 days ago" }
];

// Mock CRM stats
const mockCRMStats = {
  contacts: 1247,
  activeSequences: 3,
  emailsSent: 127,
  responses: 23,
  responseRate: 18
};

// Mock skill recommendations
const mockSkillRecommendations = [
  { id: 1, text: "Complete Google Ads certification to increase match rate by 15%", type: "certification" },
  { id: 2, text: "Add Webflow to your skills (trending in demand)", type: "skill" },
  { id: 3, text: "Your Apollo proficiency is in high demand - 12 opportunities this month", type: "insight" }
];

// Mock platform updates
const mockPlatformUpdates = [
  { id: 1, title: "New integration: Clay is now available", type: "feature" },
  { id: 2, title: "Upcoming webinar: Advanced outbound tactics - March 18", type: "event" },
  { id: 3, title: "Feature update: Enhanced time tracking", type: "update" }
];

// Sidebar navigation items
const sidebarNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/expert/dashboard' },
  { id: 'projects', label: 'Active Projects', icon: Briefcase, path: '/expert/projects' },
  { id: 'project-marketplace', label: 'Project Catalog', icon: Layers, path: '/project-marketplace' },
  { id: 'opportunities', label: 'Opportunities', icon: Target, path: '/expert/opportunities', badge: 2 },
  { id: 'clients', label: 'Clients', icon: Users, path: '/expert/clients' },
  { id: 'earnings', label: 'Earnings', icon: DollarSign, path: '/expert/earnings' },
  { id: 'portfolio', label: 'Portfolio', icon: FolderOpen, path: '/expert/portfolio' },
  { id: 'crm', label: 'CRM & Outreach', icon: Phone, path: '/expert/crm' },
  { id: 'tools', label: 'Tools & Integrations', icon: Wrench, path: '/expert/tools' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/expert/settings' }
];

// Earnings chart data (mock)
const earningsChartData = [
  { month: 'Oct', amount: 3200 },
  { month: 'Nov', amount: 4100 },
  { month: 'Dec', amount: 3800 },
  { month: 'Jan', amount: 4500 },
  { month: 'Feb', amount: 3480 },
  { month: 'Mar', amount: 4250 }
];

// Helper functions
function getTaskIcon(status) {
  switch (status) {
    case 'complete': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case 'in-progress': return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '3s' }} />;
    case 'upcoming': return <Circle className="w-4 h-4 text-gray-400" />;
    default: return <Circle className="w-4 h-4 text-gray-400" />;
  }
}

function getClientHealthEmoji(health) {
  switch (health) {
    case 'happy': return '😊';
    case 'satisfied': return '🙂';
    case 'neutral': return '😐';
    case 'concerned': return '😟';
    default: return '🙂';
  }
}

// Project Card Component
function ProjectCard({ project, onOpenWorkspace }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover:border-blue-300 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${project.clientColor} rounded-xl flex items-center justify-center`}>
            <span className="text-white text-sm font-bold">{project.clientAvatar}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{project.clientName}</h3>
            <p className="text-sm text-gray-500">{project.projectName}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Week {project.currentWeek} of {project.totalWeeks}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Progress</span>
          <span className="text-gray-900 font-semibold">{project.progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Your Tasks</p>
        <div className="space-y-2">
          {project.tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2">
              {getTaskIcon(task.status)}
              <span className={`text-sm ${task.status === 'complete' ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                {task.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Deliverable & Client Health */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
        <div>
          <p className="text-xs text-gray-500">Next Deliverable</p>
          <p className="text-sm text-gray-900 font-medium">{project.nextDeliverable.name}</p>
          <p className="text-xs text-amber-400">Due: {project.nextDeliverable.dueDate}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Client Health</p>
          <p className="text-2xl">{getClientHealthEmoji(project.clientHealth)}</p>
          <p className="text-xs text-gray-500">{project.lastCheckIn} ago</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onOpenWorkspace}
          className="py-2 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-white text-sm font-medium transition-all flex items-center justify-center gap-1"
        >
          <Eye className="w-4 h-4" /> Workspace
        </button>
        <button className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-900 text-sm font-medium transition-all flex items-center justify-center gap-1">
          <MessageSquare className="w-4 h-4" /> Message
        </button>
      </div>
    </div>
  );
}

// Opportunity Card Component
function OpportunityCard({ opportunity, onExpressInterest, onPass, onViewBrief }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 hover:border-emerald-500/50 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          {opportunity.isNew && (
            <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full mb-2">
              NEW
            </span>
          )}
          <h3 className="font-bold text-gray-900 text-lg">{opportunity.projectName}</h3>
          <p className="text-sm text-gray-500">{opportunity.clientType}</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="text-emerald-700 font-bold">{opportunity.matchScore}%</span>
            <span className="text-emerald-700 text-xs">Match</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Budget</p>
          <p className="text-gray-900 font-semibold">${(opportunity.budget.min/1000).toFixed(0)}k-${(opportunity.budget.max/1000).toFixed(0)}k</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Duration</p>
          <p className="text-gray-900 font-semibold">{opportunity.duration} days</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Start</p>
          <p className="text-gray-900 font-semibold">{opportunity.startDate}</p>
        </div>
      </div>

      {/* Requirements */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Key Requirements</p>
        <div className="flex flex-wrap gap-2">
          {opportunity.requirements.map((req, idx) => (
            <span key={idx} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
              {req}
            </span>
          ))}
        </div>
      </div>

      {/* Why Matched */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
        <p className="text-xs text-blue-500 mb-1">Why you matched</p>
        <p className="text-sm text-blue-600">{opportunity.whyMatched}</p>
      </div>

      {/* Respond Timer */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <Timer className="w-4 h-4 text-amber-400" />
        <span className="text-amber-400">Respond within {opportunity.respondBy}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onViewBrief}
          className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-900 text-sm font-medium transition-all"
        >
          View Brief
        </button>
        <button
          onClick={onExpressInterest}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white text-sm font-medium transition-all"
        >
          Express Interest
        </button>
        <button
          onClick={onPass}
          className="py-2.5 px-4 bg-gray-100 hover:bg-red-500/20 hover:text-red-400 rounded-xl text-gray-500 text-sm font-medium transition-all"
        >
          Pass
        </button>
      </div>
    </div>
  );
}

// Simple Earnings Chart Component
function EarningsChart({ data }) {
  const maxAmount = Math.max(...data.map(d => d.amount));

  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-400"
            style={{ height: `${(item.amount / maxAmount) * 100}%`, minHeight: '8px' }}
          />
          <span className="text-xs text-gray-500">{item.month}</span>
        </div>
      ))}
    </div>
  );
}

// Main Expert Dashboard Component
function ExpertDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAvailable, setIsAvailable] = useState(mockExpert.isAvailable);
  const [earningsView, setEarningsView] = useState('monthly');

  const percentChange = ((mockExpert.earnings.thisMonth - mockExpert.earnings.lastMonth) / mockExpert.earnings.lastMonth * 100).toFixed(0);
  const quarterProgress = (mockExpert.earnings.thisQuarter / mockExpert.earnings.quarterGoal * 100).toFixed(0);

  return (
    <div className="h-screen flex flex-col bg-white page-enter">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm flex-shrink-0 z-50">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-gray-500" />
            </button>
            <Link href="/expert/dashboard" className="flex items-center gap-2">
              <NextImage src="/karya-ai-logo.png" alt="Karya AI" width={36} height={36} className="rounded-xl object-contain" />
              <span className="text-lg font-bold text-gray-900 hidden sm:block">Karya-AI</span>
            </Link>
          </div>

          {/* Center: Search */}
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

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Earnings Widget */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs text-emerald-400">This month</p>
                <p className="text-sm font-bold text-gray-900">${mockExpert.earnings.thisMonth.toLocaleString()}</p>
              </div>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-500" />
                {mockExpert.unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                    {mockExpert.unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button className="text-xs text-blue-500 hover:text-blue-600 font-medium">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {mockActivityFeed.slice(0, 4).map(item => (
                      <div key={item.id} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <div>
                            <p className="text-sm text-gray-900">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-gray-200">
                    <button className="w-full py-2 text-sm text-blue-500 hover:text-blue-600 text-center font-medium">
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
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{getInitials(user?.name)}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 w-56 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{user?.name || 'Expert'}</p>
                    <p className="text-sm text-gray-500">{user?.email || ''}</p>
                  </div>
                  <div className="p-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg text-left">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Profile Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg text-left">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Payment Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg text-left">
                      <HelpCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Help & Support</span>
                    </button>
                  </div>
                  <div className="p-1 border-t border-gray-200">
                    <button
                      onClick={async () => { await logout(); router.push('/'); }}
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
            {/* Navigation */}
            <nav className="space-y-1">
              {sidebarNavItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveNav(item.id); router.push(item.path); }}
                    title={!sidebarOpen ? item.label : ''}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${!sidebarOpen ? 'justify-center' : ''} ${
                      activeNav === item.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-emerald-500 rounded-full text-xs text-white font-bold">
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 min-w-0">
          {/* Welcome Section */}
          <div className="mb-6 animate-fade-in-up">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {(user?.name || 'there').split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-500">
                  You have <span className="text-blue-500 font-semibold">{mockProjects.length} active projects</span> and{' '}
                  <span className="text-emerald-400 font-semibold">{mockOpportunities.length} new opportunities</span>
                </p>
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 shadow-sm rounded-xl">
                <span className="text-sm text-gray-600">Available for new work</span>
                <button
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`relative w-12 h-6 rounded-full transition-all ${isAvailable ? 'bg-emerald-500' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAvailable ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Earnings Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">This Month</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  percentChange >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange)}%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">${mockExpert.earnings.thisMonth.toLocaleString()}</p>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">This Quarter</span>
                <span className="text-xs text-gray-500">{quarterProgress}% of goal</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">${mockExpert.earnings.thisQuarter.toLocaleString()}</p>
              <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${quarterProgress}%` }} />
              </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Pending Payouts</span>
                <span className="text-xs text-amber-400">{mockExpert.earnings.pendingReleaseDate}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">${mockExpert.earnings.pendingPayouts.toLocaleString()}</p>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-sm">Lifetime Earnings</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900">${mockExpert.earnings.lifetime.toLocaleString()}</p>
            </div>
          </div>

          {/* Earnings Chart */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Earnings Trend</h2>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {['monthly', 'quarterly', 'yearly'].map(view => (
                  <button
                    key={view}
                    onClick={() => setEarningsView(view)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      earningsView === view ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <EarningsChart data={earningsChartData} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Projects */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Active Projects</h2>
                  <button className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockProjects.slice(0, 2).map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onOpenWorkspace={() => router.push(`/expert/projects/${project.id}`)}
                    />
                  ))}
                </div>
              </section>

              {/* New Opportunities */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    New Opportunities
                    <span className="px-2 py-0.5 bg-emerald-500 rounded-full text-xs text-white font-bold">
                      {mockOpportunities.length}
                    </span>
                  </h2>
                  <button className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
                    Browse All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {mockOpportunities.map(opp => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      onExpressInterest={() => {}}
                      onPass={() => {}}
                      onViewBrief={() => router.push(`/expert/opportunities/${opp.id}`)}
                    />
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
                  {mockActionItems.slice(0, 6).map(item => (
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
                        {item.project && <p className="text-xs text-gray-500 mt-0.5">{item.project}</p>}
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

              {/* Performance Metrics */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Performance Metrics
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">94%</p>
                    <p className="text-xs text-gray-500 mt-1">Success Rate</p>
                    <p className="text-xs text-emerald-400">Above avg (88%)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">96%</p>
                    <p className="text-xs text-gray-500 mt-1">On-Time Delivery</p>
                    <p className="text-xs text-emerald-400">Excellent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">4.9</p>
                    <p className="text-xs text-gray-500 mt-1">Client Rating</p>
                    <p className="text-xs text-amber-400">Top 10%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">2.3h</p>
                    <p className="text-xs text-gray-500 mt-1">Response Time</p>
                    <p className="text-xs text-emerald-400">Fast</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">67%</p>
                    <p className="text-xs text-gray-500 mt-1">Repeat Clients</p>
                    <p className="text-xs text-emerald-400">Strong</p>
                  </div>
                </div>
              </section>

              {/* CRM Quick Stats */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    CRM Quick Stats
                  </h2>
                  <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                    Open CRM →
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{mockCRMStats.contacts.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Contacts</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{mockCRMStats.activeSequences}</p>
                    <p className="text-xs text-gray-500">Active Sequences</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{mockCRMStats.emailsSent}</p>
                    <p className="text-xs text-gray-500">Emails This Week</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{mockCRMStats.responseRate}%</p>
                    <p className="text-xs text-gray-500">Response Rate</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* This Week's Schedule */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  This Week
                </h2>
                <div className="space-y-3">
                  {mockSchedule.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        item.type === 'meeting' ? 'bg-blue-50' :
                        item.type === 'deadline' ? 'bg-red-50' :
                        'bg-blue-50'
                      }`}>
                        {item.type === 'meeting' && <Users className="w-5 h-5 text-blue-400" />}
                        {item.type === 'deadline' && <AlertCircle className="w-5 h-5 text-red-400" />}
                        {item.type === 'focus' && <Zap className="w-5 h-5 text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.day} • {item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 py-2.5 text-sm text-blue-500 hover:text-blue-600 text-center font-medium hover:bg-gray-50 rounded-lg transition-colors">
                  View Full Calendar
                </button>
              </section>

              {/* Recent Activity */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {mockActivityFeed.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <span className="text-xl">{activity.icon}</span>
                      <div>
                        <p className="text-sm text-gray-600">{activity.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Skill Development */}
              <section className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-200 rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  Skill Development
                </h2>
                <div className="space-y-3">
                  {mockSkillRecommendations.map(rec => (
                    <div key={rec.id} className="flex items-start gap-2 p-3 bg-white/80 rounded-xl border border-gray-200">
                      <Zap className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{rec.text}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 py-2 text-sm text-blue-500 hover:text-blue-600 text-center font-medium">
                  View All Recommendations
                </button>
              </section>

              {/* Portfolio Highlight */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-blue-500" />
                  Portfolio Highlight
                </h2>
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center">
                    <span className="text-4xl">📈</span>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-gray-900 text-sm">B2B SaaS Lead Generation</p>
                    <p className="text-emerald-400 text-sm font-semibold mt-1">487 qualified leads generated</p>
                    <div className="flex items-start gap-2 mt-2 p-2 bg-white rounded-lg">
                      <Quote className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-500 italic">"Sarah transformed our outbound motion..."</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-3 py-2 text-sm text-blue-500 hover:text-blue-600 text-center font-medium">
                  Update Portfolio
                </button>
              </section>

              {/* Platform Updates */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-blue-500" />
                  Platform Updates
                </h2>
                <div className="space-y-2">
                  {mockPlatformUpdates.map(update => (
                    <div key={update.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg transition-all cursor-pointer">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        update.type === 'feature' ? 'bg-emerald-500' :
                        update.type === 'event' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />
                      <p className="text-sm text-gray-600">{update.title}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Quick Links */}
              <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h2>
                <div className="space-y-2">
                  {[
                    { icon: Target, label: "Browse Opportunities", color: "text-emerald-400" },
                    { icon: Clock, label: "Update Availability", color: "text-blue-400" },
                    { icon: FileText, label: "Submit Invoice", color: "text-amber-400" },
                    { icon: MessageSquare, label: "Message Support", color: "text-pink-400" },
                    { icon: BookOpen, label: "Training Resources", color: "text-blue-500" }
                  ].map((item, idx) => (
                    <button key={idx} className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowUserMenu(false); setShowNotifications(false); }} />
      )}
    </div>
  );
}

export default ExpertDashboard;
