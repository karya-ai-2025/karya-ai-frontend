'use client';

// components/TasksWorkflows.jsx
// This component is used within ProjectWorkspace.jsx when activeTab === 'tasks'

import { useState, useRef } from 'react';
import {
  LayoutGrid, List, Calendar, GanttChart, Filter, Search, Plus, ChevronDown,
  CheckCircle, Circle, Clock, AlertCircle, Flag, MessageSquare, Paperclip,
  MoreHorizontal, User, X, Edit3, Trash2, Copy, Target, Link2, Upload,
  ChevronRight, Send, Smile, AtSign, GripVertical, CheckSquare, Square,
  CalendarDays, Timer, Workflow, ArrowRight, ExternalLink, FileText, Image
} from 'lucide-react';

// Mock tasks data
const mockTasks = [
  {
    id: 1,
    name: "Launch email sequence 1",
    description: "Deploy the first cold email sequence targeting VP of Sales at mid-market SaaS companies. Ensure all personalization tokens are properly configured and tracking is enabled.",
    workflow: "Email Campaign",
    workflowColor: "bg-blue-500",
    status: "in-review",
    priority: "high",
    assignedTo: { id: 1, name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    dueDate: "2024-03-10",
    dueDateLabel: "March 10",
    isOverdue: false,
    estimatedHours: 4,
    actualHours: 3.5,
    subtasks: [
      { id: 1, name: "Configure personalization tokens", complete: true },
      { id: 2, name: "Set up tracking links", complete: true },
      { id: 3, name: "QA test sequence", complete: true },
      { id: 4, name: "Get approval from client", complete: false },
      { id: 5, name: "Schedule launch", complete: false }
    ],
    comments: 4,
    attachments: 2,
    blockers: null,
    dependencies: [],
    createdAt: "2024-02-28"
  },
  {
    id: 2,
    name: "Build prospect list - Segment A",
    description: "Create a targeted prospect list for Segment A (HR Tech companies, 50-200 employees). Use Apollo for sourcing and enrichment.",
    workflow: "List Building",
    workflowColor: "bg-purple-500",
    status: "in-progress",
    priority: "high",
    assignedTo: { id: 1, name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    dueDate: "2024-03-12",
    dueDateLabel: "March 12",
    isOverdue: false,
    estimatedHours: 6,
    actualHours: 2,
    subtasks: [
      { id: 1, name: "Define search criteria", complete: true },
      { id: 2, name: "Export from Apollo", complete: true },
      { id: 3, name: "Clean and dedupe", complete: false },
      { id: 4, name: "Enrich with additional data", complete: false }
    ],
    comments: 2,
    attachments: 1,
    blockers: "Waiting on ICP refinement",
    dependencies: [3],
    createdAt: "2024-03-01"
  },
  {
    id: 3,
    name: "Finalize ICP document",
    description: "Complete the Ideal Customer Profile documentation based on discovery calls and data analysis.",
    workflow: "Email Campaign",
    workflowColor: "bg-blue-500",
    status: "approved",
    priority: "medium",
    assignedTo: { id: 1, name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    dueDate: "2024-03-05",
    dueDateLabel: "March 5",
    isOverdue: false,
    estimatedHours: 3,
    actualHours: 4,
    subtasks: [
      { id: 1, name: "Analyze customer data", complete: true },
      { id: 2, name: "Draft ICP criteria", complete: true },
      { id: 3, name: "Review with client", complete: true }
    ],
    comments: 8,
    attachments: 3,
    blockers: null,
    dependencies: [],
    createdAt: "2024-02-20"
  },
  {
    id: 4,
    name: "Create email templates",
    description: "Write 5 email templates for the cold outreach sequence including subject lines and CTAs.",
    workflow: "Email Campaign",
    workflowColor: "bg-blue-500",
    status: "approved",
    priority: "medium",
    assignedTo: { id: 1, name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    dueDate: "2024-03-08",
    dueDateLabel: "March 8",
    isOverdue: false,
    estimatedHours: 8,
    actualHours: 10,
    subtasks: [],
    comments: 12,
    attachments: 5,
    blockers: null,
    dependencies: [3],
    createdAt: "2024-02-25"
  },
  {
    id: 5,
    name: "Set up Apollo workspace",
    description: "Configure Apollo workspace with proper filters, saved searches, and team access.",
    workflow: "List Building",
    workflowColor: "bg-purple-500",
    status: "approved",
    priority: "low",
    assignedTo: { id: 1, name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    dueDate: "2024-03-03",
    dueDateLabel: "March 3",
    isOverdue: false,
    estimatedHours: 2,
    actualHours: 2,
    subtasks: [],
    comments: 1,
    attachments: 0,
    blockers: null,
    dependencies: [],
    createdAt: "2024-02-22"
  },
  {
    id: 6,
    name: "Launch email sequence 2",
    description: "Deploy the second email sequence targeting VP of Marketing.",
    workflow: "Email Campaign",
    workflowColor: "bg-blue-500",
    status: "todo",
    priority: "medium",
    assignedTo: { id: 1, name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    dueDate: "2024-03-18",
    dueDateLabel: "March 18",
    isOverdue: false,
    estimatedHours: 4,
    actualHours: 0,
    subtasks: [
      { id: 1, name: "Draft email copy", complete: false },
      { id: 2, name: "Set up sequence", complete: false },
      { id: 3, name: "Get approval", complete: false }
    ],
    comments: 0,
    attachments: 0,
    blockers: null,
    dependencies: [1],
    createdAt: "2024-03-05"
  },
  {
    id: 7,
    name: "Build prospect list - Segment B",
    description: "Create prospect list for Segment B (Fintech companies).",
    workflow: "List Building",
    workflowColor: "bg-purple-500",
    status: "todo",
    priority: "medium",
    assignedTo: { id: 1, name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    dueDate: "2024-03-20",
    dueDateLabel: "March 20",
    isOverdue: false,
    estimatedHours: 5,
    actualHours: 0,
    subtasks: [],
    comments: 0,
    attachments: 0,
    blockers: null,
    dependencies: [2],
    createdAt: "2024-03-05"
  },
  {
    id: 8,
    name: "Response management setup",
    description: "Configure response tracking and create playbook for handling different response types.",
    workflow: "Email Campaign",
    workflowColor: "bg-blue-500",
    status: "todo",
    priority: "low",
    assignedTo: { id: 1, name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    dueDate: "2024-03-22",
    dueDateLabel: "March 22",
    isOverdue: false,
    estimatedHours: 3,
    actualHours: 0,
    subtasks: [],
    comments: 0,
    attachments: 0,
    blockers: null,
    dependencies: [1],
    createdAt: "2024-03-05"
  },
  {
    id: 9,
    name: "Weekly performance report",
    description: "Create first weekly performance report with key metrics.",
    workflow: "Email Campaign",
    workflowColor: "bg-blue-500",
    status: "todo",
    priority: "medium",
    assignedTo: { id: 1, name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    dueDate: "2024-03-15",
    dueDateLabel: "March 15",
    isOverdue: false,
    estimatedHours: 2,
    actualHours: 0,
    subtasks: [],
    comments: 0,
    attachments: 0,
    blockers: null,
    dependencies: [1],
    createdAt: "2024-03-06"
  },
  {
    id: 10,
    name: "A/B test subject lines",
    description: "Set up and run A/B tests on email subject lines.",
    workflow: "Email Campaign",
    workflowColor: "bg-blue-500",
    status: "in-progress",
    priority: "medium",
    assignedTo: { id: 1, name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    dueDate: "2024-03-14",
    dueDateLabel: "March 14",
    isOverdue: false,
    estimatedHours: 2,
    actualHours: 1,
    subtasks: [
      { id: 1, name: "Define test variants", complete: true },
      { id: 2, name: "Set up test", complete: false },
      { id: 3, name: "Analyze results", complete: false }
    ],
    comments: 2,
    attachments: 0,
    blockers: null,
    dependencies: [1],
    createdAt: "2024-03-07"
  },
  {
    id: 11,
    name: "Enrich contact data",
    description: "Add additional data points to prospect list using Clay.",
    workflow: "List Building",
    workflowColor: "bg-purple-500",
    status: "in-progress",
    priority: "high",
    assignedTo: { id: 1, name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    dueDate: "2024-03-11",
    dueDateLabel: "March 11",
    isOverdue: false,
    estimatedHours: 4,
    actualHours: 2,
    subtasks: [
      { id: 1, name: "Connect Clay integration", complete: true },
      { id: 2, name: "Run enrichment", complete: false },
      { id: 3, name: "Validate data quality", complete: false }
    ],
    comments: 3,
    attachments: 1,
    blockers: null,
    dependencies: [2],
    createdAt: "2024-03-08"
  }
];

// Mock activity for task detail
const mockTaskActivity = [
  { id: 1, type: 'comment', user: 'John Davis', avatar: 'JD', content: 'Updated the subject line based on A/B test insights.', timestamp: '2 hours ago' },
  { id: 2, type: 'status', user: 'John Davis', avatar: 'JD', content: 'moved task to In Review', timestamp: '3 hours ago' },
  { id: 3, type: 'comment', user: 'Alex Thompson', avatar: 'AT', content: 'Looks great! Can we add a P.S. line with a case study link?', timestamp: '5 hours ago' },
  { id: 4, type: 'file', user: 'John Davis', avatar: 'JD', content: 'uploaded Email_Sequence_v2.pdf', timestamp: '1 day ago' },
  { id: 5, type: 'subtask', user: 'John Davis', avatar: 'JD', content: 'completed subtask "QA test sequence"', timestamp: '1 day ago' }
];

// Mock attachments
const mockAttachments = [
  { id: 1, name: 'Email_Sequence_v2.pdf', type: 'pdf', size: '245 KB', uploadedBy: 'John Davis', uploadedAt: '1 day ago' },
  { id: 2, name: 'Subject_Lines.xlsx', type: 'xlsx', size: '18 KB', uploadedBy: 'John Davis', uploadedAt: '2 days ago' }
];

// Kanban columns configuration
const kanbanColumns = [
  { id: 'todo', label: 'To Do', color: 'border-slate-500' },
  { id: 'in-progress', label: 'In Progress', color: 'border-blue-500' },
  { id: 'in-review', label: 'In Review', color: 'border-amber-500' },
  { id: 'approved', label: 'Approved', color: 'border-emerald-500' }
];

// Filter options
const workflows = ['All', 'Email Campaign', 'List Building'];
const priorities = ['All', 'High', 'Medium', 'Low'];
const dueDates = ['All', 'Overdue', 'Today', 'This Week', 'This Month'];
const statuses = ['All', 'To Do', 'In Progress', 'In Review', 'Approved', 'Blocked'];
const assignees = ['All', 'Me', 'John Davis'];

// Helper functions
function getPriorityColor(priority) {
  switch (priority) {
    case 'high': return 'text-red-400';
    case 'medium': return 'text-amber-400';
    case 'low': return 'text-emerald-400';
    default: return 'text-slate-400';
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'todo': return 'bg-slate-500';
    case 'in-progress': return 'bg-blue-500';
    case 'in-review': return 'bg-amber-500';
    case 'approved': return 'bg-emerald-500';
    case 'blocked': return 'bg-red-500';
    default: return 'bg-slate-500';
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'todo': return 'To Do';
    case 'in-progress': return 'In Progress';
    case 'in-review': return 'In Review';
    case 'approved': return 'Approved';
    case 'blocked': return 'Blocked';
    default: return status;
  }
}

// Task Card Component
function TaskCard({ task, onClick, isDragging }) {
  const subtaskProgress = task.subtasks.length > 0
    ? (task.subtasks.filter(s => s.complete).length / task.subtasks.length) * 100
    : null;

  return (
    <div
      onClick={onClick}
      className={`bg-slate-700 border border-slate-600 rounded-xl p-4 cursor-pointer hover:border-purple-500/50 hover:shadow-lg transition-all group ${isDragging ? 'opacity-50 rotate-2' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-white text-sm group-hover:text-purple-300 transition-colors pr-2">
          {task.name}
        </h4>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded transition-all">
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Workflow Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 ${task.workflowColor}/20 border ${task.workflowColor.replace('bg-', 'border-')}/40 rounded text-xs font-medium`}
          style={{ color: task.workflowColor.includes('blue') ? '#60a5fa' : '#a78bfa' }}>
          {task.workflow}
        </span>
        {task.priority === 'high' && (
          <Flag className="w-3.5 h-3.5 text-red-400 fill-current" />
        )}
      </div>

      {/* Subtasks Progress */}
      {subtaskProgress !== null && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Subtasks</span>
            <span className="text-slate-300">{task.subtasks.filter(s => s.complete).length}/{task.subtasks.length}</span>
          </div>
          <div className="h-1 bg-slate-600 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${subtaskProgress}%` }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Assignee */}
          <div className={`w-6 h-6 ${task.assignedTo.color} rounded-full flex items-center justify-center`} title={task.assignedTo.name}>
            <span className="text-white text-xs font-bold">{task.assignedTo.avatar}</span>
          </div>

          {/* Due Date */}
          <span className={`text-xs ${task.isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
            {task.dueDateLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          {task.comments > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              {task.comments}
            </span>
          )}
          {task.attachments > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Paperclip className="w-3.5 h-3.5" />
              {task.attachments}
            </span>
          )}
        </div>
      </div>

      {/* Blocker Indicator */}
      {task.blockers && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Blocked
          </p>
        </div>
      )}
    </div>
  );
}

// Task List Row Component
function TaskListRow({ task, onClick }) {
  const subtaskProgress = task.subtasks.length > 0
    ? task.subtasks.filter(s => s.complete).length
    : null;

  return (
    <tr
      onClick={onClick}
      className="hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/50 transition-all"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
          <span className="text-white font-medium">{task.name}</span>
          {task.priority === 'high' && (
            <Flag className="w-3.5 h-3.5 text-red-400 fill-current" />
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-0.5 ${task.workflowColor}/20 border ${task.workflowColor.replace('bg-', 'border-')}/40 rounded text-xs font-medium`}
          style={{ color: task.workflowColor.includes('blue') ? '#60a5fa' : '#a78bfa' }}>
          {task.workflow}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 ${task.assignedTo.color} rounded-full flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">{task.assignedTo.avatar}</span>
          </div>
          <span className="text-sm text-slate-300">{task.assignedTo.name}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`text-sm ${task.isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
          {task.dueDateLabel}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          task.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
          task.status === 'in-review' ? 'bg-amber-500/20 text-amber-400' :
          task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
          'bg-slate-600 text-slate-300'
        }`}>
          {getStatusLabel(task.status)}
        </span>
      </td>
      <td className="py-3 px-4">
        {subtaskProgress !== null ? (
          <span className="text-sm text-slate-400">{subtaskProgress}/{task.subtasks.length}</span>
        ) : (
          <span className="text-sm text-slate-500">—</span>
        )}
      </td>
    </tr>
  );
}

// Task Detail Modal Component
function TaskDetailModal({ task, onClose, onUpdate }) {
  const [activeDetailTab, setActiveDetailTab] = useState('details');
  const [editingDescription, setEditingDescription] = useState(false);
  const [description, setDescription] = useState(task.description);
  const [newComment, setNewComment] = useState('');
  const [subtasks, setSubtasks] = useState(task.subtasks);
  const [newSubtask, setNewSubtask] = useState('');

  const toggleSubtask = (subtaskId) => {
    setSubtasks(prev => prev.map(s =>
      s.id === subtaskId ? { ...s, complete: !s.complete } : s
    ));
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks(prev => [...prev, { id: Date.now(), name: newSubtask, complete: false }]);
      setNewSubtask('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-700">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 ${task.workflowColor}/20 border ${task.workflowColor.replace('bg-', 'border-')}/40 rounded text-xs font-medium`}
                style={{ color: task.workflowColor.includes('blue') ? '#60a5fa' : '#a78bfa' }}>
                {task.workflow}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                task.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                task.status === 'in-review' ? 'bg-amber-500/20 text-amber-400' :
                task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                'bg-slate-600 text-slate-300'
              }`}>
                {getStatusLabel(task.status)}
              </span>
              {task.priority === 'high' && (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                  <Flag className="w-3 h-3 fill-current" /> High Priority
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{task.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700">
          {['details', 'subtasks', 'activity', 'attachments'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveDetailTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                activeDetailTab === tab
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'subtasks' && subtasks.length > 0 && (
                <span className="ml-1 text-xs text-slate-500">({subtasks.filter(s => s.complete).length}/{subtasks.length})</span>
              )}
              {tab === 'activity' && <span className="ml-1 text-xs text-slate-500">({mockTaskActivity.length})</span>}
              {tab === 'attachments' && <span className="ml-1 text-xs text-slate-500">({mockAttachments.length})</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Details Tab */}
          {activeDetailTab === 'details' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left: Description */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-400">Description</label>
                    <button
                      onClick={() => setEditingDescription(!editingDescription)}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      {editingDescription ? 'Save' : 'Edit'}
                    </button>
                  </div>
                  {editingDescription ? (
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full h-32 bg-slate-700 border border-slate-600 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                    />
                  ) : (
                    <p className="text-slate-300 text-sm bg-slate-700/50 rounded-xl p-4">{description}</p>
                  )}
                </div>

                {/* Dependencies */}
                {task.dependencies.length > 0 && (
                  <div className="mb-6">
                    <label className="text-sm font-medium text-slate-400 block mb-2">Dependencies</label>
                    <div className="space-y-2">
                      {task.dependencies.map(depId => {
                        const depTask = mockTasks.find(t => t.id === depId);
                        return depTask ? (
                          <div key={depId} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg">
                            <Link2 className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-300">{depTask.name}</span>
                            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                              depTask.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600 text-slate-400'
                            }`}>
                              {getStatusLabel(depTask.status)}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Blockers */}
                {task.blockers && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-red-400">Blocker</span>
                    </div>
                    <p className="text-sm text-red-300">{task.blockers}</p>
                  </div>
                )}
              </div>

              {/* Right: Metadata */}
              <div className="space-y-4">
                {/* Assigned To */}
                <div>
                  <label className="text-sm font-medium text-slate-400 block mb-2">Assigned To</label>
                  <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-xl">
                    <div className={`w-8 h-8 ${task.assignedTo.color} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">{task.assignedTo.avatar}</span>
                    </div>
                    <span className="text-white">{task.assignedTo.name}</span>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-sm font-medium text-slate-400 block mb-2">Due Date</label>
                  <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-xl">
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    <span className={task.isOverdue ? 'text-red-400' : 'text-white'}>{task.dueDateLabel}</span>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm font-medium text-slate-400 block mb-2">Priority</label>
                  <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-xl">
                    <Flag className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
                    <span className="text-white capitalize">{task.priority}</span>
                  </div>
                </div>

                {/* Time Tracking */}
                <div>
                  <label className="text-sm font-medium text-slate-400 block mb-2">Time Tracking</label>
                  <div className="p-3 bg-slate-700/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Estimated</span>
                      <span className="text-white">{task.estimatedHours}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Actual</span>
                      <span className="text-white">{task.actualHours}h</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${task.actualHours > task.estimatedHours ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min((task.actualHours / task.estimatedHours) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Created */}
                <div>
                  <label className="text-sm font-medium text-slate-400 block mb-2">Created</label>
                  <p className="text-slate-300 text-sm">{task.createdAt}</p>
                </div>
              </div>
            </div>
          )}

          {/* Subtasks Tab */}
          {activeDetailTab === 'subtasks' && (
            <div>
              <div className="space-y-2 mb-4">
                {subtasks.map(subtask => (
                  <div
                    key={subtask.id}
                    onClick={() => toggleSubtask(subtask.id)}
                    className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 cursor-pointer transition-all"
                  >
                    {subtask.complete ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
                    <span className={`text-sm ${subtask.complete ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {subtask.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Subtask */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                  placeholder="Add a subtask..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={addSubtask}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-medium transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeDetailTab === 'activity' && (
            <div>
              {/* Comment Input */}
              <div className="flex gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">AT</span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                    rows={2}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
                        <AtSign className="w-4 h-4 text-slate-400" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
                        <Smile className="w-4 h-4 text-slate-400" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors">
                        <Paperclip className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <button className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-1">
                      <Send className="w-4 h-4" /> Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="space-y-4">
                {mockTaskActivity.map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{activity.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{activity.user}</span>
                        <span className="text-xs text-slate-500">{activity.timestamp}</span>
                      </div>
                      {activity.type === 'comment' ? (
                        <p className="text-sm text-slate-300 bg-slate-700/50 rounded-xl p-3">{activity.content}</p>
                      ) : (
                        <p className="text-sm text-slate-400">{activity.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments Tab */}
          {activeDetailTab === 'attachments' && (
            <div>
              {/* Upload Area */}
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center mb-6 hover:border-purple-500/50 transition-all cursor-pointer">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Drag & drop files here, or click to browse</p>
              </div>

              {/* File List */}
              <div className="space-y-2">
                {mockAttachments.map(file => (
                  <div key={file.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-all">
                    <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                      {file.type === 'pdf' ? (
                        <FileText className="w-5 h-5 text-red-400" />
                      ) : file.type === 'xlsx' ? (
                        <FileText className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Image className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-slate-500">{file.size} • Uploaded by {file.uploadedBy} • {file.uploadedAt}</p>
                    </div>
                    <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/50">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-sm transition-all">
              <Copy className="w-4 h-4" /> Duplicate
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-sm transition-all">
              <Target className="w-4 h-4" /> Convert to Milestone
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-300 text-sm transition-all">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition-all">
              Cancel
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Tasks & Workflows Component
function TasksWorkflows() {
  const [viewMode, setViewMode] = useState('kanban');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters state
  const [filters, setFilters] = useState({
    workflow: 'All',
    status: 'All',
    assignee: 'All',
    priority: 'All',
    dueDate: 'All'
  });

  // Filter tasks
  const filteredTasks = mockTasks.filter(task => {
    if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.workflow !== 'All' && task.workflow !== filters.workflow) return false;
    if (filters.priority !== 'All' && task.priority !== filters.priority.toLowerCase()) return false;
    if (filters.status !== 'All' && getStatusLabel(task.status) !== filters.status) return false;
    return true;
  });

  // Group tasks by status for Kanban
  const tasksByStatus = {
    'todo': filteredTasks.filter(t => t.status === 'todo'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    'in-review': filteredTasks.filter(t => t.status === 'in-review'),
    'approved': filteredTasks.filter(t => t.status === 'approved')
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* View Options */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'kanban' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" /> List
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'timeline' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GanttChart className="w-4 h-4" /> Timeline
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'calendar' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" /> Calendar
            </button>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 w-64"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showFilters ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium transition-all">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-slate-800 border border-slate-700 rounded-xl">
          {/* Workflow Filter */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Workflow</label>
            <select
              value={filters.workflow}
              onChange={(e) => setFilters(f => ({ ...f, workflow: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              {workflows.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Assigned To</label>
            <select
              value={filters.assignee}
              onChange={(e) => setFilters(f => ({ ...f, assignee: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              {assignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Due Date Filter */}
          <div>
            <label className="text-xs text-slate-500 block mb-1">Due Date</label>
            <select
              value={filters.dueDate}
              onChange={(e) => setFilters(f => ({ ...f, dueDate: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              {dueDates.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ workflow: 'All', status: 'All', assignee: 'All', priority: 'All', dueDate: 'All' })}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-4 gap-4">
          {kanbanColumns.map(column => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className={`flex items-center justify-between p-3 bg-slate-800 border-t-2 ${column.color} rounded-t-xl`}>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{column.label}</span>
                  <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-400">
                    {tasksByStatus[column.id]?.length || 0}
                  </span>
                </div>
                <button className="p-1 hover:bg-slate-700 rounded transition-colors">
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Column Content */}
              <div className="flex-1 bg-slate-800/50 border border-slate-700 border-t-0 rounded-b-xl p-3 space-y-3 min-h-[400px]">
                {tasksByStatus[column.id]?.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}

                {tasksByStatus[column.id]?.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Task</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Workflow</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Due</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtasks</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(task => (
                <TaskListRow
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline/Calendar Placeholder */}
      {(viewMode === 'timeline' || viewMode === 'calendar') && (
        <div className="flex items-center justify-center h-96 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {viewMode === 'timeline' ? (
                <GanttChart className="w-8 h-8 text-purple-400" />
              ) : (
                <Calendar className="w-8 h-8 text-purple-400" />
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {viewMode === 'timeline' ? 'Timeline View' : 'Calendar View'}
            </h3>
            <p className="text-slate-400">This view is coming soon.</p>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updatedTask) => {
            // Handle task update
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}

export default TasksWorkflows;
