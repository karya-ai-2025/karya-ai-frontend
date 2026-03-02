'use client';

// pages/ProjectWorkspace.jsx
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TasksWorkflows from '@/components/owner/TasksWorkflows';
import FilesKnowledgeBase from '@/components/owner/FilesKnowledgeBase';
import {
  ArrowLeft, ChevronRight, ChevronDown, MoreHorizontal, Share2, Download,
  Archive, Settings, ClipboardList, CheckSquare, Users, FolderOpen,
  MessageSquare, BarChart3, DollarSign, Calendar, Clock, CheckCircle,
  Circle, AlertCircle, FileText, Upload, Edit3, Plus, Star, Zap,
  Video, Mail, Eye, ExternalLink, Sparkles, RefreshCw, Lock, Unlock,
  UserPlus, History, StickyNote, Lightbulb, Target, TrendingUp, Send
} from 'lucide-react';

// Mock project data
const mockProject = {
  id: 1,
  name: "Q1 Outbound Campaign",
  description: "Build and execute an outbound sales campaign targeting mid-market SaaS companies in the HR Tech space. Focus on generating qualified leads through cold email and LinkedIn outreach.",
  status: "in-progress",
  statusLabel: "In Progress",
  currentDay: 32,
  totalDays: 90,
  currentPhase: 2,
  totalPhases: 3,
  phaseName: "Execution Phase",
  budgetSpent: 3200,
  budgetTotal: 8000,
  healthScore: 85,
  tasksComplete: 12,
  tasksTotal: 27,
  filesUploaded: 23,
  messagesExchanged: 147,
  createdAt: "January 15, 2024",
  startDate: "February 1, 2024",
  endDate: "May 1, 2024"
};

// Mock roadmap phases
const mockPhases = [
  {
    id: 1,
    name: "Foundation",
    dayRange: "Days 1-30",
    status: "complete",
    tasks: [
      { id: 1, name: "ICP Definition", status: "complete" },
      { id: 2, name: "Messaging Framework", status: "complete" },
      { id: 3, name: "Competitive Analysis", status: "complete" },
      { id: 4, name: "Campaign Strategy", status: "complete" }
    ],
    milestone: {
      name: "Foundation Complete",
      payment: 2000,
      status: "paid"
    }
  },
  {
    id: 2,
    name: "Execution",
    dayRange: "Days 31-60",
    status: "current",
    tasks: [
      { id: 5, name: "Email Sequence Creation", status: "complete" },
      { id: 6, name: "List Building & Enrichment", status: "in-progress" },
      { id: 7, name: "Campaign Launch", status: "in-progress" },
      { id: 8, name: "Response Management", status: "upcoming" }
    ],
    milestone: {
      name: "Campaign Live",
      payment: 2000,
      status: "pending",
      dueDate: "March 15"
    }
  },
  {
    id: 3,
    name: "Optimization",
    dayRange: "Days 61-90",
    status: "upcoming",
    tasks: [
      { id: 9, name: "Performance Analysis", status: "upcoming" },
      { id: 10, name: "A/B Testing", status: "upcoming" },
      { id: 11, name: "Scaling Plan", status: "upcoming" },
      { id: 12, name: "Sales Enablement", status: "upcoming" }
    ],
    milestone: {
      name: "Handoff & Playbook",
      payment: 4000,
      status: "upcoming"
    }
  }
];

// Mock active workflows
const mockWorkflows = [
  {
    id: 1,
    name: "Email Campaign",
    tasksComplete: 4,
    tasksTotal: 7,
    currentTask: "Launch first sequence",
    currentTaskStatus: "in-review",
    assignedTo: { name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    dueDate: "Tomorrow",
    blockers: null
  },
  {
    id: 2,
    name: "List Building",
    tasksComplete: 2,
    tasksTotal: 4,
    currentTask: "Enrich contact data",
    currentTaskStatus: "in-progress",
    assignedTo: { name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    dueDate: "March 12",
    blockers: "Waiting on ICP refinement"
  }
];

// Mock team members
const mockTeamMembers = {
  experts: [
    {
      id: 1,
      name: "John Davis",
      avatar: "JD",
      color: "bg-emerald-500",
      role: "Senior Growth Marketer",
      status: "active",
      tasksAssigned: 12,
      tasksComplete: 8,
      lastActive: "2 hours ago",
      rating: 4.9,
      onTimeRate: 100
    }
  ],
  internal: [
    { id: 1, name: "Alex Thompson", avatar: "AT", role: "Project Owner", permission: "Admin" },
    { id: 2, name: "Sarah Chen", avatar: "SC", role: "Marketing Director", permission: "Editor" },
    { id: 3, name: "Mike Johnson", avatar: "MJ", role: "Sales Lead", permission: "Viewer" }
  ]
};

// Mock activity feed
const mockActivityFeed = [
  { id: 1, icon: "\u2705", user: "John", action: "completed", target: "Email Sequence Draft", timestamp: "2 hours ago" },
  { id: 2, icon: "\uD83D\uDCAC", user: "You", action: "commented on", target: "Landing Page Copy", timestamp: "5 hours ago" },
  { id: 3, icon: "\uD83D\uDCC4", user: "John", action: "uploaded", target: "Competitor Analysis.pdf", timestamp: "Yesterday" },
  { id: 4, icon: "\u2B50", user: "You", action: "approved milestone", target: "ICP Definition", timestamp: "2 days ago" },
  { id: 5, icon: "\uD83D\uDCCB", user: "John", action: "created task", target: "Response Templates", timestamp: "3 days ago" }
];

// Mock upcoming milestones
const mockMilestones = [
  { id: 1, date: "March 15", title: "Campaign Launch", daysAway: 7, payment: 2000 },
  { id: 2, date: "March 22", title: "Week 1 Results Report", daysAway: 14 },
  { id: 3, date: "March 29", title: "Optimization Recommendations", daysAway: 21 }
];

// Mock AI recommendations
const mockRecommendations = [
  { id: 1, text: "Review and approve email sequence to unblock campaign launch", priority: "high" },
  { id: 2, text: "Schedule weekly sync with John for Thursday 2pm", priority: "medium" },
  { id: 3, text: "ICP document has been viewed 12 times - consider it finalized", priority: "low" }
];

// Mock project notes
const mockNotes = [
  { id: 1, author: "Alex Thompson", content: "Initial meeting notes: Client wants to focus on HR Tech companies, 50-200 employees. Decision makers are VP Sales and VP Marketing.", timestamp: "Feb 1, 2024" },
  { id: 2, author: "John Davis", content: "ICP refined after discovery calls. Adding Fintech as secondary vertical based on successful outreach patterns.", timestamp: "Feb 15, 2024" }
];

// Sidebar navigation items
const sidebarNavItems = [
  { id: 'overview', label: 'Overview', icon: ClipboardList },
  { id: 'tasks', label: 'Tasks & Workflows', icon: CheckSquare },
  { id: 'team', label: 'Team (Experts)', icon: Users },
  { id: 'files', label: 'Files & Knowledge Base', icon: FolderOpen },
  { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 3 },
  { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
  { id: 'budget', label: 'Budget & Payments', icon: DollarSign },
  { id: 'settings', label: 'Project Settings', icon: Settings }
];

// Status options
const statusOptions = [
  { value: 'in-progress', label: 'In Progress', color: 'bg-emerald-500' },
  { value: 'paused', label: 'Paused', color: 'bg-amber-500' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-500' }
];

// Helper functions
function getTaskIcon(status) {
  switch (status) {
    case 'complete': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case 'in-progress': return <RefreshCw className="w-4 h-4 text-blue-400" />;
    case 'in-review': return <Eye className="w-4 h-4 text-amber-400" />;
    case 'upcoming': return <Circle className="w-4 h-4 text-slate-500" />;
    default: return <Circle className="w-4 h-4 text-slate-500" />;
  }
}

function getPhaseStatusIcon(status) {
  switch (status) {
    case 'complete': return <CheckCircle className="w-6 h-6 text-emerald-400" />;
    case 'current': return <RefreshCw className="w-6 h-6 text-blue-400" />;
    case 'upcoming': return <Circle className="w-6 h-6 text-slate-500" />;
    default: return <Circle className="w-6 h-6 text-slate-500" />;
  }
}

function getHealthColor(score) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function getHealthLabel(score) {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  return 'At Risk';
}

// Workflow Card Component
function WorkflowCard({ workflow }) {
  const progress = (workflow.tasksComplete / workflow.tasksTotal) * 100;

  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 hover:border-purple-500/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-white">{workflow.name}</h4>
          <p className="text-sm text-slate-400">{workflow.tasksComplete} of {workflow.tasksTotal} tasks complete</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Due</p>
          <p className="text-sm text-white font-medium">{workflow.dueDate}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>

      {/* Current Task */}
      <div className="flex items-center gap-2 mb-3">
        {getTaskIcon(workflow.currentTaskStatus)}
        <span className="text-sm text-slate-300">{workflow.currentTask}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          workflow.currentTaskStatus === 'in-review' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {workflow.currentTaskStatus === 'in-review' ? 'In Review' : 'In Progress'}
        </span>
      </div>

      {/* Assigned To */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 ${workflow.assignedTo.color} rounded-full flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">{workflow.assignedTo.avatar}</span>
          </div>
          <span className="text-sm text-slate-400">{workflow.assignedTo.name}</span>
        </div>
        <button className="text-sm text-purple-400 hover:text-purple-300 font-medium">
          View Details
        </button>
      </div>

      {/* Blockers */}
      {workflow.blockers && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Blocker: {workflow.blockers}
          </p>
        </div>
      )}
    </div>
  );
}

// Expert Card Component
function ExpertCard({ expert }) {
  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className={`w-14 h-14 ${expert.color} rounded-xl flex items-center justify-center`}>
            <span className="text-white text-lg font-bold">{expert.avatar}</span>
          </div>
          {expert.status === 'active' && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-800 rounded-full" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="font-semibold text-white">{expert.name}</h4>
          <p className="text-sm text-purple-400">{expert.role}</p>
          <p className="text-xs text-slate-500 mt-1">Last active: {expert.lastActive}</p>
        </div>

        {/* Stats */}
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span className="text-white font-medium">{expert.rating}</span>
          </div>
          <p className="text-xs text-emerald-400">On-time: {expert.onTimeRate}%</p>
        </div>
      </div>

      {/* Tasks Progress */}
      <div className="mt-4 mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Tasks</span>
          <span className="text-white">{expert.tasksComplete}/{expert.tasksAssigned}</span>
        </div>
        <div className="h-1.5 bg-slate-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${(expert.tasksComplete / expert.tasksAssigned) * 100}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-4 gap-2">
        <button className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-all flex items-center justify-center" title="Message">
          <MessageSquare className="w-4 h-4 text-slate-300" />
        </button>
        <button className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-all flex items-center justify-center" title="View Tasks">
          <CheckSquare className="w-4 h-4 text-slate-300" />
        </button>
        <button className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-all flex items-center justify-center" title="Schedule Meeting">
          <Video className="w-4 h-4 text-slate-300" />
        </button>
        <button className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-all flex items-center justify-center" title="View Profile">
          <ExternalLink className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </div>
  );
}

// Phase Card Component
function PhaseCard({ phase, isExpanded, onToggle }) {
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      phase.status === 'current' ? 'border-purple-500 bg-purple-500/5' :
      phase.status === 'complete' ? 'border-emerald-500/50 bg-emerald-500/5' :
      'border-slate-700 bg-slate-800'
    }`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-all"
      >
        {getPhaseStatusIcon(phase.status)}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white">Phase {phase.id}: {phase.name}</h4>
            {phase.status === 'current' && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">Current</span>
            )}
            {phase.status === 'complete' && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">Complete</span>
            )}
          </div>
          <p className="text-sm text-slate-400">{phase.dayRange}</p>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-700">
          {/* Tasks */}
          <div className="mt-4 space-y-2">
            {phase.tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                {getTaskIcon(task.status)}
                <span className={`text-sm ${task.status === 'complete' ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                  {task.name}
                </span>
              </div>
            ))}
          </div>

          {/* Milestone */}
          <div className={`mt-4 p-3 rounded-lg border ${
            phase.milestone.status === 'paid' ? 'bg-emerald-500/10 border-emerald-500/30' :
            phase.milestone.status === 'pending' ? 'bg-amber-500/10 border-amber-500/30' :
            'bg-slate-700/50 border-slate-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className={`w-4 h-4 ${
                  phase.milestone.status === 'paid' ? 'text-emerald-400' :
                  phase.milestone.status === 'pending' ? 'text-amber-400' :
                  'text-slate-500'
                }`} />
                <span className="text-sm font-medium text-white">{phase.milestone.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">${phase.milestone.payment.toLocaleString()}</p>
                {phase.milestone.status === 'paid' && (
                  <span className="text-xs text-emerald-400">Paid</span>
                )}
                {phase.milestone.status === 'pending' && (
                  <span className="text-xs text-amber-400">Due: {phase.milestone.dueDate}</span>
                )}
                {phase.milestone.status === 'upcoming' && (
                  <span className="text-xs text-slate-500">Upcoming</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Project Workspace Component
function ProjectWorkspace() {
  const router = useRouter();
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [projectStatus, setProjectStatus] = useState(mockProject.status);
  const [expandedPhases, setExpandedPhases] = useState([2]); // Phase 2 expanded by default
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(mockProject.name);

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId) ? prev.filter(id => id !== phaseId) : [...prev, phaseId]
    );
  };

  const currentStatus = statusOptions.find(s => s.value === projectStatus);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Navigation */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="px-4 lg:px-6 py-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-3">
            <button onClick={() => router.push('/business-dashboard')} className="text-slate-400 hover:text-white transition-colors">
              Dashboard
            </button>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <button onClick={() => router.push('/business-dashboard')} className="text-slate-400 hover:text-white transition-colors">
              Active Projects
            </button>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-white font-medium">{projectName}</span>
          </div>

          {/* Project Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/business-dashboard')} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>

              {/* Project Name */}
              {isEditingName ? (
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  className="text-xl font-bold text-white bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-xl font-bold text-white flex items-center gap-2 cursor-pointer hover:text-purple-300 transition-colors"
                  onClick={() => setIsEditingName(true)}
                >
                  {projectName}
                  <Edit3 className="w-4 h-4 text-slate-500" />
                </h1>
              )}

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg hover:border-slate-500 transition-all"
                >
                  <div className={`w-2 h-2 rounded-full ${currentStatus?.color}`} />
                  <span className="text-sm text-white">{currentStatus?.label}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showStatusDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                    {statusOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => { setProjectStatus(option.value); setShowStatusDropdown(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-left"
                      >
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        <span className="text-sm text-white">{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all text-sm text-white">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all text-sm text-white">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all">
                <Archive className="w-4 h-4 text-slate-400" />
              </button>
              <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all">
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-56 flex-shrink-0 bg-slate-800 border-r border-slate-700 h-[calc(100vh-120px)] sticky top-[120px]">
          <nav className="p-3 space-y-1">
            {sidebarNavItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 min-w-0">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Project Summary Card */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Project Summary</h2>
                <p className="text-slate-300 mb-6">{mockProject.description}</p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Timeline */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-slate-400">Timeline</span>
                    </div>
                    <p className="text-xl font-bold text-white">Day {mockProject.currentDay}</p>
                    <p className="text-sm text-slate-400">of {mockProject.totalDays} days</p>
                    <div className="mt-2 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(mockProject.currentDay / mockProject.totalDays) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Current Phase */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-slate-400">Current Phase</span>
                    </div>
                    <p className="text-xl font-bold text-white">{mockProject.phaseName}</p>
                    <p className="text-sm text-slate-400">Phase {mockProject.currentPhase} of {mockProject.totalPhases}</p>
                  </div>

                  {/* Budget */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-slate-400">Budget</span>
                    </div>
                    <p className="text-xl font-bold text-white">${mockProject.budgetSpent.toLocaleString()}</p>
                    <p className="text-sm text-slate-400">of ${mockProject.budgetTotal.toLocaleString()}</p>
                    <div className="mt-2 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(mockProject.budgetSpent / mockProject.budgetTotal) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Health Score */}
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-slate-400">Health Score</span>
                    </div>
                    <p className={`text-3xl font-bold ${getHealthColor(mockProject.healthScore)}`}>
                      {mockProject.healthScore}
                    </p>
                    <p className={`text-sm ${getHealthColor(mockProject.healthScore)}`}>
                      {getHealthLabel(mockProject.healthScore)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 30-60-90 Day Roadmap */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">30-60-90 Day Roadmap</h2>
                <div className="space-y-3">
                  {mockPhases.map(phase => (
                    <PhaseCard
                      key={phase.id}
                      phase={phase}
                      isExpanded={expandedPhases.includes(phase.id)}
                      onToggle={() => togglePhase(phase.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Active Workflows */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Active Workflows</h2>
                  <div className="space-y-4">
                    {mockWorkflows.map(workflow => (
                      <WorkflowCard key={workflow.id} workflow={workflow} />
                    ))}
                  </div>
                </div>

                {/* Team Members */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Team Members</h2>

                  {/* Experts */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Experts</p>
                    {mockTeamMembers.experts.map(expert => (
                      <ExpertCard key={expert.id} expert={expert} />
                    ))}
                  </div>

                  {/* Internal Team */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Your Team</p>
                      <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        <UserPlus className="w-3 h-3" /> Invite
                      </button>
                    </div>
                    <div className="space-y-2">
                      {mockTeamMembers.internal.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">{member.avatar}</span>
                            </div>
                            <div>
                              <p className="text-sm text-white">{member.name}</p>
                              <p className="text-xs text-slate-500">{member.role}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            member.permission === 'Admin' ? 'bg-purple-500/20 text-purple-400' :
                            member.permission === 'Editor' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-600 text-slate-400'
                          }`}>
                            {member.permission}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {mockActivityFeed.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <span className="text-lg">{activity.icon}</span>
                        <div>
                          <p className="text-sm text-slate-300">
                            <span className="text-white font-medium">{activity.user}</span> {activity.action} <span className="text-purple-400">{activity.target}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-purple-300 text-center font-medium">
                    View All Activity
                  </button>
                </div>

                {/* Next Milestones */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Upcoming Milestones</h2>
                  <div className="space-y-3">
                    {mockMilestones.map(milestone => (
                      <div key={milestone.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex flex-col items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{milestone.title}</p>
                          <p className="text-xs text-slate-500">{milestone.date} ({milestone.daysAway} days)</p>
                        </div>
                        {milestone.payment && (
                          <span className="text-sm text-emerald-400 font-medium">${milestone.payment.toLocaleString()}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Quick Stats</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tasks completed</span>
                      <span className="text-white font-semibold">{mockProject.tasksComplete}/{mockProject.tasksTotal} ({Math.round((mockProject.tasksComplete/mockProject.tasksTotal)*100)}%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Days elapsed</span>
                      <span className="text-white font-semibold">{mockProject.currentDay}/{mockProject.totalDays} ({Math.round((mockProject.currentDay/mockProject.totalDays)*100)}%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Budget used</span>
                      <span className="text-white font-semibold">${mockProject.budgetSpent.toLocaleString()}/${mockProject.budgetTotal.toLocaleString()} ({Math.round((mockProject.budgetSpent/mockProject.budgetTotal)*100)}%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Files uploaded</span>
                      <span className="text-white font-semibold">{mockProject.filesUploaded}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Messages exchanged</span>
                      <span className="text-white font-semibold">{mockProject.messagesExchanged}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Project Notes */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <StickyNote className="w-5 h-5 text-purple-400" />
                      Project Notes
                    </h2>
                    <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add Note
                    </button>
                  </div>
                  <div className="space-y-3">
                    {mockNotes.map(note => (
                      <div key={note.id} className="p-3 bg-slate-700/50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{note.author}</span>
                          <span className="text-xs text-slate-500">{note.timestamp}</span>
                        </div>
                        <p className="text-sm text-slate-300">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    Recommended Actions
                  </h2>
                  <div className="space-y-3">
                    {mockRecommendations.map(rec => (
                      <div key={rec.id} className="flex items-start gap-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                        <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          rec.priority === 'high' ? 'text-red-400' :
                          rec.priority === 'medium' ? 'text-amber-400' :
                          'text-emerald-400'
                        }`} />
                        <p className="text-sm text-slate-300">{rec.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tasks & Workflows Tab */}
          {activeTab === 'tasks' && (
            <TasksWorkflows />
          )}

          {/* Files & Knowledge Base Tab */}
          {activeTab === 'files' && (
            <FilesKnowledgeBase />
          )}

          {/* Other tabs - Coming Soon */}
          {activeTab !== 'overview' && activeTab !== 'tasks' && activeTab !== 'files' && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {sidebarNavItems.find(item => item.id === activeTab)?.icon &&
                    <div className="text-purple-400">
                      {(() => {
                        const Icon = sidebarNavItems.find(item => item.id === activeTab)?.icon;
                        return Icon ? <Icon className="w-8 h-8" /> : null;
                      })()}
                    </div>
                  }
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {sidebarNavItems.find(item => item.id === activeTab)?.label}
                </h3>
                <p className="text-slate-400">This section is coming soon.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Click outside handler for dropdown */}
      {showStatusDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)} />
      )}
    </div>
  );
}

export default ProjectWorkspace;
