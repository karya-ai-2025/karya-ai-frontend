'use client';

// components/KnowledgeBase.jsx
// This component is used within ProjectWorkspace.jsx when activeTab === 'files'

import { useState, useRef } from 'react';
import {
  Search, LayoutGrid, List, GitBranch, Filter, SortAsc, ChevronDown, ChevronRight,
  Folder, FolderOpen, FileText, File, Image, Video, Table, FileSpreadsheet,
  Star, Share2, Download, Eye, Trash2, Move, Copy, MoreHorizontal, Plus,
  Upload, X, Edit3, Link2, Clock, User, Tag, MessageSquare, History,
  ZoomIn, ZoomOut, Maximize2, Printer, ExternalLink, Check, Users,
  Calendar, HardDrive, Settings, Cloud, Zap, ArrowUpRight, Send, Reply,
  CheckCircle, AlertCircle, Globe, Lock, Unlock, FolderPlus, FilePlus,
  FileType, Mail, Phone, BarChart3, Archive
} from 'lucide-react';

// Mock folder structure
const mockFolderTree = [
  {
    id: 1,
    name: "ICPs",
    type: "folder",
    count: 12,
    isOpen: true,
    children: [
      { id: 101, name: "Primary ICP - Enterprise SaaS", type: "file", fileType: "pdf" },
      { id: 102, name: "Secondary ICP - Mid-Market", type: "file", fileType: "pdf" },
      { id: 103, name: "ICP Scoring Model", type: "file", fileType: "xlsx" }
    ]
  },
  {
    id: 2,
    name: "Research",
    type: "folder",
    count: 5,
    isOpen: false,
    children: [
      { id: 201, name: "Market Analysis Q4", type: "file", fileType: "pdf" },
      { id: 202, name: "Customer Interviews Summary", type: "file", fileType: "docx" }
    ]
  },
  {
    id: 3,
    name: "Marketing Plans",
    type: "folder",
    count: 8,
    isOpen: true,
    children: [
      { id: 301, name: "2025 GTM Strategy", type: "file", fileType: "pdf" },
      { id: 302, name: "Q1 Campaign Plan", type: "file", fileType: "docx" },
      { id: 303, name: "Content Calendar", type: "file", fileType: "xlsx" }
    ]
  },
  {
    id: 4,
    name: "Product Information",
    type: "folder",
    count: 15,
    isOpen: false,
    children: [
      { id: 401, name: "Product Overview", type: "file", fileType: "pdf" },
      { id: 402, name: "Feature List", type: "file", fileType: "docx" },
      { id: 403, name: "Pricing & Packaging", type: "file", fileType: "xlsx" },
      { id: 404, name: "Roadmap", type: "file", fileType: "pdf" }
    ]
  },
  {
    id: 5,
    name: "Competitive Analysis",
    type: "folder",
    count: 4,
    isOpen: false,
    children: []
  },
  {
    id: 6,
    name: "Brand Guidelines",
    type: "folder",
    count: 6,
    isOpen: false,
    children: []
  },
  {
    id: 7,
    name: "Templates",
    type: "folder",
    count: 20,
    isOpen: false,
    children: [
      { id: 701, name: "Email Templates", type: "folder", count: 10, icon: "mail" },
      { id: 702, name: "Call Scripts", type: "folder", count: 5, icon: "phone" },
      { id: 703, name: "Reporting Templates", type: "folder", count: 5, icon: "chart" }
    ]
  },
  {
    id: 8,
    name: "Past Campaigns",
    type: "folder",
    count: 25,
    isOpen: false,
    children: [
      { id: 801, name: "2024", type: "folder", count: 15 },
      { id: 802, name: "2023", type: "folder", count: 10 }
    ]
  },
  {
    id: 9,
    name: "Saved Conversations",
    type: "folder",
    count: 8,
    isOpen: false,
    children: []
  }
];

// Mock documents
const mockDocuments = [
  {
    id: 101,
    name: "Primary ICP - Enterprise SaaS",
    type: "pdf",
    size: "2.4 MB",
    folder: "ICPs",
    folderId: 1,
    modified: "2 days ago",
    modifiedDate: "2024-03-06",
    modifiedBy: { name: "You", avatar: "AT" },
    created: "Feb 15, 2024",
    createdBy: { name: "You", avatar: "AT" },
    sharedWith: [
      { name: "John Davis", avatar: "JD", permission: "edit" }
    ],
    tags: ["B2B SaaS", "Enterprise", "ICP"],
    isFavorite: true,
    version: 2,
    description: "Detailed Ideal Customer Profile for Enterprise SaaS companies with 500+ employees.",
    thumbnail: null
  },
  {
    id: 102,
    name: "Secondary ICP - Mid-Market",
    type: "pdf",
    size: "1.8 MB",
    folder: "ICPs",
    folderId: 1,
    modified: "5 days ago",
    modifiedDate: "2024-03-03",
    modifiedBy: { name: "You", avatar: "AT" },
    created: "Feb 10, 2024",
    createdBy: { name: "You", avatar: "AT" },
    sharedWith: [
      { name: "John Davis", avatar: "JD", permission: "view" }
    ],
    tags: ["B2B SaaS", "Mid-Market", "ICP"],
    isFavorite: false,
    version: 1,
    description: "ICP documentation for mid-market companies (100-500 employees).",
    thumbnail: null
  },
  {
    id: 301,
    name: "2025 GTM Strategy",
    type: "pdf",
    size: "5.2 MB",
    folder: "Marketing Plans",
    folderId: 3,
    modified: "1 week ago",
    modifiedDate: "2024-03-01",
    modifiedBy: { name: "Sarah Chen", avatar: "SC" },
    created: "Jan 15, 2024",
    createdBy: { name: "Sarah Chen", avatar: "SC" },
    sharedWith: [
      { name: "John Davis", avatar: "JD", permission: "view" },
      { name: "Lisa M.", avatar: "LM", permission: "view" }
    ],
    tags: ["Strategy", "2025", "GTM"],
    isFavorite: true,
    version: 3,
    description: "Comprehensive go-to-market strategy for 2025 fiscal year.",
    thumbnail: null
  },
  {
    id: 302,
    name: "Q1 Campaign Plan",
    type: "docx",
    size: "890 KB",
    folder: "Marketing Plans",
    folderId: 3,
    modified: "3 days ago",
    modifiedDate: "2024-03-05",
    modifiedBy: { name: "You", avatar: "AT" },
    created: "Feb 1, 2024",
    createdBy: { name: "You", avatar: "AT" },
    sharedWith: [
      { name: "John Davis", avatar: "JD", permission: "edit" }
    ],
    tags: ["Campaign", "Q1", "Outbound"],
    isFavorite: false,
    version: 4,
    description: "Detailed campaign plan for Q1 outbound initiatives.",
    thumbnail: null
  },
  {
    id: 303,
    name: "Content Calendar",
    type: "xlsx",
    size: "245 KB",
    folder: "Marketing Plans",
    folderId: 3,
    modified: "Today",
    modifiedDate: "2024-03-08",
    modifiedBy: { name: "John Davis", avatar: "JD" },
    created: "Feb 20, 2024",
    createdBy: { name: "You", avatar: "AT" },
    sharedWith: [
      { name: "John Davis", avatar: "JD", permission: "edit" }
    ],
    tags: ["Content", "Calendar", "Planning"],
    isFavorite: false,
    version: 8,
    description: "Editorial calendar for all content initiatives.",
    thumbnail: null
  },
  {
    id: 401,
    name: "Product Overview",
    type: "pdf",
    size: "3.1 MB",
    folder: "Product Information",
    folderId: 4,
    modified: "2 weeks ago",
    modifiedDate: "2024-02-22",
    modifiedBy: { name: "You", avatar: "AT" },
    created: "Jan 5, 2024",
    createdBy: { name: "You", avatar: "AT" },
    sharedWith: [
      { name: "John Davis", avatar: "JD", permission: "view" }
    ],
    tags: ["Product", "Overview"],
    isFavorite: false,
    version: 2,
    description: "Complete product overview and value proposition.",
    thumbnail: null
  },
  {
    id: 501,
    name: "Competitor Matrix",
    type: "xlsx",
    size: "520 KB",
    folder: "Competitive Analysis",
    folderId: 5,
    modified: "4 days ago",
    modifiedDate: "2024-03-04",
    modifiedBy: { name: "You", avatar: "AT" },
    created: "Feb 25, 2024",
    createdBy: { name: "You", avatar: "AT" },
    sharedWith: [],
    tags: ["Competitive", "Analysis"],
    isFavorite: false,
    version: 1,
    description: "Feature comparison matrix with top 5 competitors.",
    thumbnail: null
  },
  {
    id: 701,
    name: "Cold Email Template v3",
    type: "docx",
    size: "125 KB",
    folder: "Templates",
    folderId: 7,
    modified: "Yesterday",
    modifiedDate: "2024-03-07",
    modifiedBy: { name: "John Davis", avatar: "JD" },
    created: "Mar 1, 2024",
    createdBy: { name: "John Davis", avatar: "JD" },
    sharedWith: [
      { name: "You", avatar: "AT", permission: "edit" }
    ],
    tags: ["Templates", "Email", "Outbound"],
    isFavorite: true,
    version: 3,
    description: "Latest version of cold email template with improved subject lines.",
    thumbnail: null
  },
  {
    id: 801,
    name: "Campaign Results Dashboard",
    type: "png",
    size: "1.2 MB",
    folder: "Past Campaigns",
    folderId: 8,
    modified: "1 week ago",
    modifiedDate: "2024-03-01",
    modifiedBy: { name: "You", avatar: "AT" },
    created: "Mar 1, 2024",
    createdBy: { name: "You", avatar: "AT" },
    sharedWith: [
      { name: "John Davis", avatar: "JD", permission: "view" }
    ],
    tags: ["Results", "Dashboard", "Analytics"],
    isFavorite: false,
    version: 1,
    description: "Screenshot of Q4 2024 campaign performance dashboard.",
    thumbnail: null
  }
];

// Mock tags
const mockTags = [
  { name: "B2B SaaS", count: 15, color: "bg-blue-500" },
  { name: "Enterprise", count: 8, color: "bg-blue-500" },
  { name: "Outbound", count: 12, color: "bg-emerald-500" },
  { name: "Content", count: 10, color: "bg-orange-500" },
  { name: "SEO", count: 5, color: "bg-amber-500" },
  { name: "Competitive", count: 4, color: "bg-red-500" },
  { name: "Templates", count: 20, color: "bg-cyan-500" },
  { name: "Case Studies", count: 6, color: "bg-blue-500" }
];

// Mock activity for document detail
const mockDocActivity = [
  { id: 1, user: "John D.", action: "viewed this file", timestamp: "2 hours ago" },
  { id: 2, user: "You", action: "uploaded version 2", timestamp: "Yesterday" },
  { id: 3, user: "Sarah K.", action: "commented", timestamp: "2 days ago" },
  { id: 4, user: "You", action: "shared with John D.", timestamp: "Feb 20" }
];

// Mock comments
const mockDocComments = [
  { id: 1, user: "Sarah Chen", avatar: "SC", content: "Great updates to the ICP criteria. Should we also include company growth rate as a factor?", timestamp: "2 days ago", replies: [
    { id: 11, user: "You", avatar: "AT", content: "Good point! I'll add that to version 3.", timestamp: "2 days ago" }
  ]},
  { id: 2, user: "John Davis", avatar: "JD", content: "I've used this for the latest outbound campaign. Results look promising!", timestamp: "3 days ago", replies: [] }
];

// Mock version history
const mockVersionHistory = [
  { id: 2, label: "Version 2 (Current)", date: "Yesterday", author: "You", notes: "Updated ICP criteria based on Q4 results", isCurrent: true },
  { id: 1, label: "Version 1", date: "Jan 15, 2024", author: "You", notes: "Initial ICP documentation", isCurrent: false }
];

// Mock related documents
const mockRelatedDocs = [
  { id: 102, name: "Secondary ICP - Mid-Market", type: "pdf" },
  { id: 302, name: "Q1 Campaign Plan", type: "docx" },
  { id: 501, name: "Competitor Matrix", type: "xlsx" }
];

// Quick filters
const quickFilters = [
  { id: 'my-uploads', label: 'My uploads', icon: Upload },
  { id: 'shared', label: 'Shared with experts', icon: Users },
  { id: 'recent', label: 'Recently viewed', icon: Clock },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'needs-review', label: 'Needs review', icon: AlertCircle }
];

// File type icons
function getFileIcon(type) {
  switch (type) {
    case 'pdf': return <FileText className="w-5 h-5 text-red-400" />;
    case 'docx': case 'doc': return <FileText className="w-5 h-5 text-blue-400" />;
    case 'xlsx': case 'xls': return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    case 'png': case 'jpg': case 'jpeg': case 'gif': return <Image className="w-5 h-5 text-blue-600" />;
    case 'mp4': case 'mov': return <Video className="w-5 h-5 text-orange-500" />;
    default: return <File className="w-5 h-5 text-gray-500" />;
  }
}

function getFileColor(type) {
  switch (type) {
    case 'pdf': return 'bg-red-500/20 border-red-500/40';
    case 'docx': case 'doc': return 'bg-blue-500/20 border-blue-500/40';
    case 'xlsx': case 'xls': return 'bg-emerald-500/20 border-emerald-500/40';
    case 'png': case 'jpg': case 'jpeg': case 'gif': return 'bg-blue-100 border-purple-500/40';
    case 'mp4': case 'mov': return 'bg-orange-100 border-orange-300';
    default: return 'bg-slate-500/20 border-slate-500/40';
  }
}

// Folder Tree Item Component
function FolderTreeItem({ item, level = 0, selectedFolder, onSelect, onToggle, expandedFolders }) {
  const isExpanded = expandedFolders.includes(item.id);
  const isSelected = selectedFolder === item.id;
  const hasChildren = item.children && item.children.length > 0;
  const isFolder = item.type === 'folder';

  return (
    <div>
      <button
        onClick={() => isFolder ? onToggle(item.id) : onSelect(item)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-all ${
          isSelected ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {isFolder && (
          <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        )}
        {isFolder ? (
          isExpanded ? <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" /> : <Folder className="w-4 h-4 text-amber-400 shrink-0" />
        ) : (
          getFileIcon(item.fileType)
        )}
        <span className="flex-1 truncate">{item.name}</span>
        {isFolder && item.count && (
          <span className="text-xs text-gray-400">{item.count}</span>
        )}
      </button>
      {isFolder && isExpanded && hasChildren && (
        <div>
          {item.children.map(child => (
            <FolderTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              selectedFolder={selectedFolder}
              onSelect={onSelect}
              onToggle={onToggle}
              expandedFolders={expandedFolders}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Document Card Component
function DocumentCard({ doc, onSelect, onToggleFavorite }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="bg-gray-100 border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group relative"
      onClick={() => onSelect(doc)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Thumbnail/Icon */}
      <div className={`h-24 rounded-lg mb-3 flex items-center justify-center border ${getFileColor(doc.type)}`}>
        <div className="transform scale-150">
          {getFileIcon(doc.type)}
        </div>
      </div>

      {/* File Info */}
      <div className="mb-2">
        <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
          {doc.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium uppercase ${getFileColor(doc.type)}`}
            style={{ color: doc.type === 'pdf' ? '#f87171' : doc.type.includes('doc') ? '#60a5fa' : doc.type.includes('xls') ? '#34d399' : '#a78bfa' }}>
            {doc.type}
          </span>
          <span className="text-xs text-gray-400">{doc.size}</span>
        </div>
      </div>

      {/* Modified Info */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-gray-900 text-xs">{doc.modifiedBy.avatar.charAt(0)}</span>
        </div>
        <span className="text-xs text-gray-500">{doc.modified}</span>
      </div>

      {/* Tags */}
      {doc.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {doc.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-gray-200 rounded text-xs text-gray-600">{tag}</span>
          ))}
          {doc.tags.length > 2 && (
            <span className="px-1.5 py-0.5 bg-gray-200 rounded text-xs text-gray-500">+{doc.tags.length - 2}</span>
          )}
        </div>
      )}

      {/* Shared indicator */}
      {doc.sharedWith.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Users className="w-3 h-3" />
          Shared with {doc.sharedWith.length}
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(doc.id); }}
        className={`absolute top-3 right-3 p-1 rounded transition-all ${
          doc.isFavorite ? 'text-amber-400' : 'text-gray-400 opacity-0 group-hover:opacity-100'
        }`}
      >
        <Star className={`w-4 h-4 ${doc.isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Quick Actions */}
      {showActions && (
        <div className="absolute bottom-3 right-3 flex gap-1">
          <button className="p-1.5 bg-gray-200 hover:bg-slate-500 rounded-lg transition-all" title="Preview">
            <Eye className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <button className="p-1.5 bg-gray-200 hover:bg-slate-500 rounded-lg transition-all" title="Download">
            <Download className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <button className="p-1.5 bg-gray-200 hover:bg-slate-500 rounded-lg transition-all" title="Share">
            <Share2 className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}

// Document List Row Component
function DocumentListRow({ doc, onSelect, onToggleFavorite }) {
  return (
    <tr
      onClick={() => onSelect(doc)}
      className="hover:bg-gray-50 cursor-pointer border-b border-gray-200/50 transition-all group"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(doc.id); }}
            className={doc.isFavorite ? 'text-amber-400' : 'text-slate-600 hover:text-gray-500'}
          >
            <Star className={`w-4 h-4 ${doc.isFavorite ? 'fill-current' : ''}`} />
          </button>
          {getFileIcon(doc.type)}
          <span className="text-gray-900 font-medium">{doc.name}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getFileColor(doc.type)}`}
          style={{ color: doc.type === 'pdf' ? '#f87171' : doc.type.includes('doc') ? '#60a5fa' : doc.type.includes('xls') ? '#34d399' : '#a78bfa' }}>
          {doc.type}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-gray-500">{doc.size}</td>
      <td className="py-3 px-4 text-sm text-gray-500">{doc.modified}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-900 text-xs">{doc.modifiedBy.avatar}</span>
          </div>
          <span className="text-sm text-gray-600">{doc.modifiedBy.name}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        {doc.sharedWith.length > 0 ? (
          <div className="flex items-center -space-x-1">
            {doc.sharedWith.slice(0, 3).map((user, idx) => (
              <div key={idx} className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center border border-gray-200">
                <span className="text-white text-xs">{user.avatar}</span>
              </div>
            ))}
            {doc.sharedWith.length > 3 && (
              <span className="text-xs text-gray-400 ml-2">+{doc.sharedWith.length - 3}</span>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        <button className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-all">
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
      </td>
    </tr>
  );
}

// Document Detail Modal Component
function DocumentDetailModal({ doc, onClose }) {
  const [activeTab, setActiveTab] = useState('info');
  const [newComment, setNewComment] = useState('');
  const [zoom, setZoom] = useState(100);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex">
      {/* Preview Pane - 70% */}
      <div className="flex-7 bg-white flex flex-col">
        {/* Preview Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getFileIcon(doc.type)}
            <h2 className="font-semibold text-gray-900">{doc.name}</h2>
            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getFileColor(doc.type)}`}
              style={{ color: doc.type === 'pdf' ? '#f87171' : doc.type.includes('doc') ? '#60a5fa' : doc.type.includes('xls') ? '#34d399' : '#a78bfa' }}>
              {doc.type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-2 hover:bg-gray-100 rounded-lg">
              <ZoomOut className="w-4 h-4 text-gray-500" />
            </button>
            <span className="text-sm text-gray-500 w-12 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-2 hover:bg-gray-100 rounded-lg">
              <ZoomIn className="w-4 h-4 text-gray-500" />
            </button>
            <div className="w-px h-6 bg-gray-100 mx-2" />
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Print">
              <Printer className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
              <Download className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Full Screen">
              <Maximize2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full" style={{ transform: `scale(${zoom / 100})` }}>
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                {getFileIcon(doc.type)}
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{doc.name}</h3>
              <p className="text-gray-400">Document preview would render here</p>
              <p className="text-sm text-gray-500 mt-2">{doc.type.toUpperCase()} • {doc.size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel - 30% */}
      <div className="flex-3 bg-white border-l border-gray-200 flex flex-col max-w-md">
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Document Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {['info', 'sharing', 'activity', 'comments', 'versions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium capitalize transition-all ${
                activeTab === tab ? 'text-blue-600 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">File Name</label>
                <input
                  type="text"
                  defaultValue={doc.name}
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Type</label>
                  <p className="text-gray-700 text-sm">{doc.type.toUpperCase()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Size</label>
                  <p className="text-gray-700 text-sm">{doc.size}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Created</label>
                <p className="text-gray-700 text-sm">{doc.created} by {doc.createdBy.name}</p>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Last Modified</label>
                <p className="text-gray-700 text-sm">{doc.modified} by {doc.modifiedBy.name}</p>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Version</label>
                <p className="text-gray-700 text-sm">Version {doc.version}</p>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Location</label>
                <p className="text-gray-700 text-sm flex items-center gap-1">
                  <Folder className="w-4 h-4 text-amber-400" /> {doc.folder}
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Description</label>
                <textarea
                  defaultValue={doc.description}
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {doc.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600 flex items-center gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer hover:text-red-400" />
                    </span>
                  ))}
                  <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-blue-600">
                    + Add tag
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2">Related Documents</label>
                <div className="space-y-2">
                  {mockRelatedDocs.map(related => (
                    <div key={related.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      {getFileIcon(related.type)}
                      <span className="text-sm text-gray-600">{related.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sharing Tab */}
          {activeTab === 'sharing' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-2">Shared With</label>
                <div className="space-y-2">
                  {doc.sharedWith.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{user.avatar}</span>
                        </div>
                        <span className="text-sm text-gray-700">{user.name}</span>
                      </div>
                      <select className="bg-gray-200 border border-gray-300 rounded px-2 py-1 text-xs text-gray-900">
                        <option value="view" selected={user.permission === 'view'}>View</option>
                        <option value="comment" selected={user.permission === 'comment'}>Comment</option>
                        <option value="edit" selected={user.permission === 'edit'}>Edit</option>
                      </select>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-blue-600 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add People
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-700">Link Sharing</label>
                  <button className="w-10 h-5 bg-gray-200 rounded-full relative">
                    <div className="w-4 h-4 bg-slate-400 rounded-full absolute left-0.5 top-0.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-400">Anyone with the link can view</p>
                <button className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 flex items-center justify-center gap-2">
                  <Link2 className="w-4 h-4" /> Copy Link
                </button>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              {mockDocActivity.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-xs">{activity.user.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-900 font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-400">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {mockDocComments.map(comment => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white text-xs">{comment.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{comment.user}</span>
                        <span className="text-xs text-gray-400">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                      <button className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <Reply className="w-3 h-3" /> Reply
                      </button>
                    </div>
                  </div>
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="flex items-start gap-2 ml-10">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white text-xs">{reply.avatar}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{reply.user}</span>
                          <span className="text-xs text-gray-400">{reply.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  rows={2}
                />
                <button className="mt-2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-gray-900 text-sm font-medium">
                  Comment
                </button>
              </div>
            </div>
          )}

          {/* Versions Tab */}
          {activeTab === 'versions' && (
            <div className="space-y-3">
              {mockVersionHistory.map(version => (
                <div key={version.id} className={`p-3 rounded-lg border ${version.isCurrent ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{version.label}</span>
                    {version.isCurrent && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">Current</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{version.date} by {version.author}</p>
                  <p className="text-sm text-gray-600 mt-2">{version.notes}</p>
                  {!version.isCurrent && (
                    <div className="flex gap-2 mt-2">
                      <button className="text-xs text-blue-600 hover:text-blue-600">Restore</button>
                      <button className="text-xs text-gray-500 hover:text-gray-600">Compare</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-900 text-sm font-medium flex items-center justify-center gap-2">
              <Edit3 className="w-4 h-4" /> Edit
            </button>
            <button className="py-2 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-gray-900 text-sm font-medium flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 text-xs flex items-center justify-center gap-1">
              <Move className="w-3 h-3" /> Move
            </button>
            <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 text-xs flex items-center justify-center gap-1">
              <Copy className="w-3 h-3" /> Copy
            </button>
            <button className="flex-1 py-2 bg-gray-100 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-gray-600 text-xs flex items-center justify-center gap-1">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Upload Modal Component
function UploadModal({ onClose }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Upload Files</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging ? 'border-purple-500 bg-blue-50' : 'border-gray-200 hover:border-slate-500'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-900 font-medium mb-1">Drag files here or click to browse</p>
            <p className="text-sm text-gray-400">PDF, DOCX, XLSX, PNG, JPG up to 50MB</p>
            <input ref={fileInputRef} type="file" multiple className="hidden" />
          </div>

          {/* Options */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-gray-500 block mb-2">Destination Folder</label>
              <select className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500">
                <option>ICPs</option>
                <option>Marketing Plans</option>
                <option>Templates</option>
                <option>Research</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-500 block mb-2">Tags</label>
              <input
                type="text"
                placeholder="Add tags (comma separated)"
                className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500 block mb-2">Description (optional)</label>
              <textarea
                placeholder="Add a description..."
                className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-900 text-sm font-medium">
            Cancel
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-gray-900 text-sm font-medium">
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Knowledge Base Component
function KnowledgeBase() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState([1, 3]);
  const [activeQuickFilter, setActiveQuickFilter] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [documents, setDocuments] = useState(mockDocuments);
  const [sortBy, setSortBy] = useState('modified');

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev =>
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  const toggleFavorite = (docId) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === docId ? { ...doc, isFavorite: !doc.isFavorite } : doc
    ));
  };

  const toggleTag = (tagName) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedFolder && doc.folderId !== selectedFolder) return false;
    if (selectedTags.length > 0 && !selectedTags.some(tag => doc.tags.includes(tag))) return false;
    if (activeQuickFilter === 'favorites' && !doc.isFavorite) return false;
    if (activeQuickFilter === 'shared' && doc.sharedWith.length === 0) return false;
    return true;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'modified') return new Date(b.modifiedDate) - new Date(a.modifiedDate);
    return 0;
  });

  return (
    <div className="flex h-full min-h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-64 shrink-0 border-r border-gray-200 flex flex-col">
        {/* Folder Tree */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Folders</h3>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="New Folder">
              <FolderPlus className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <button
            onClick={() => setSelectedFolder(null)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm mb-1 ${
              selectedFolder === null ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>All Files</span>
            <span className="ml-auto text-xs text-gray-400">{documents.length}</span>
          </button>

          {mockFolderTree.map(folder => (
            <FolderTreeItem
              key={folder.id}
              item={folder}
              selectedFolder={selectedFolder}
              onSelect={(item) => item.type === 'file' ? setSelectedDoc(documents.find(d => d.id === item.id)) : setSelectedFolder(item.id)}
              onToggle={toggleFolder}
              expandedFolders={expandedFolders}
            />
          ))}
        </div>

        {/* Quick Filters */}
        <div className="border-t border-gray-200 p-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick Filters</h3>
          <div className="space-y-1">
            {quickFilters.map(filter => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveQuickFilter(activeQuickFilter === filter.id ? null : filter.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-all ${
                    activeQuickFilter === filter.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags Cloud */}
        <div className="border-t border-gray-200 p-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1">
            {mockTags.map(tag => (
              <button
                key={tag.name}
                onClick={() => toggleTag(tag.name)}
                className={`px-2 py-0.5 rounded text-xs transition-all ${
                  selectedTags.includes(tag.name)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Storage Info */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Storage</span>
            <span className="text-xs text-gray-500">4.2 GB / 25 GB</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '17%' }} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-200">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all documents..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* View & Actions */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'tree' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                title="Tree View"
              >
                <GitBranch className="w-4 h-4" />
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500"
            >
              <option value="modified">Date Modified</option>
              <option value="name">Name</option>
              <option value="relevance">Relevance</option>
            </select>

            {/* Filter */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" /> Filter
            </button>

            {/* Create New Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-900 text-sm">
                <Plus className="w-4 h-4" /> New <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl hidden group-hover:block z-10">
                <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm text-gray-600">
                  <FileText className="w-4 h-4 text-blue-400" /> Google Doc
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm text-gray-600">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Google Sheet
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm text-gray-600">
                  <FolderPlus className="w-4 h-4 text-amber-400" /> New Folder
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm text-gray-600">
                  <Link2 className="w-4 h-4 text-blue-600" /> Link to External
                </button>
              </div>
            </div>

            {/* Upload */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-gray-900 text-sm font-medium"
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedTags.length > 0 || activeQuickFilter || selectedFolder) && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white/50">
            <span className="text-xs text-gray-400">Filters:</span>
            {selectedFolder && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                <Folder className="w-3 h-3" /> {mockFolderTree.find(f => f.id === selectedFolder)?.name}
                <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => setSelectedFolder(null)} />
              </span>
            )}
            {activeQuickFilter && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                {quickFilters.find(f => f.id === activeQuickFilter)?.label}
                <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => setActiveQuickFilter(null)} />
              </span>
            )}
            {selectedTags.map(tag => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-500 rounded text-xs">
                {tag}
                <X className="w-3 h-3 cursor-pointer hover:text-red-400" onClick={() => toggleTag(tag)} />
              </span>
            ))}
            <button
              onClick={() => { setSelectedTags([]); setActiveQuickFilter(null); setSelectedFolder(null); }}
              className="text-xs text-blue-600 hover:text-blue-600 ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Results Count */}
          <p className="text-sm text-gray-400 mb-4">{sortedDocuments.length} documents</p>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedDocuments.map(doc => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onSelect={setSelectedDoc}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Size</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Modified</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Modified By</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Shared</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDocuments.map(doc => (
                    <DocumentListRow
                      key={doc.id}
                      doc={doc}
                      onSelect={setSelectedDoc}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tree View Placeholder */}
          {viewMode === 'tree' && (
            <div className="flex items-center justify-center h-64 bg-white border border-gray-200 rounded-xl">
              <div className="text-center">
                <GitBranch className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-gray-500">Tree view coming soon</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {sortedDocuments.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-gray-500">No documents found</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-lg text-gray-900 text-sm font-medium"
                >
                  Upload Files
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <DocumentDetailModal
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
}

export default KnowledgeBase;
