'use client';

// components/FilesKnowledgeBase.jsx
// Updated version specifically for ProjectWorkspace with project-focused folder structure

import { useState, useRef } from 'react';
import {
  Search, LayoutGrid, List, ChevronDown, ChevronRight, Folder, FolderOpen,
  FileText, File, Image, Video, FileSpreadsheet, Star, Share2, Download,
  Eye, Trash2, Move, Copy, MoreHorizontal, Plus, Upload, X, Edit3, Link2,
  Clock, User, Tag, MessageSquare, History, ZoomIn, ZoomOut, Maximize2,
  Printer, ExternalLink, Check, Users, Calendar, Pin, Sparkles, Send,
  ArrowLeft, ArrowRight, RefreshCw, GitCompare, RotateCcw, Filter,
  FolderPlus, FileUp, StickyNote, Bot, Mic, Paperclip
} from 'lucide-react';

// Project-focused folder structure
const mockFolderTree = [
  {
    id: 'project',
    name: "Project Files",
    type: "folder",
    isOpen: true,
    children: [
      {
        id: 'deliverables',
        name: "Deliverables",
        type: "folder",
        count: 8,
        isOpen: true,
        children: [
          { id: 'd1', name: "Week 4 Report.pdf", type: "file", fileType: "pdf" },
          { id: 'd2', name: "Email Sequences v3.docx", type: "file", fileType: "docx" },
          { id: 'd3', name: "ICP Definition Final.pdf", type: "file", fileType: "pdf" }
        ]
      },
      {
        id: 'strategy',
        name: "Strategy Documents",
        type: "folder",
        count: 5,
        children: [
          { id: 's1', name: "Campaign Strategy.pdf", type: "file", fileType: "pdf" },
          { id: 's2', name: "Messaging Framework.docx", type: "file", fileType: "docx" }
        ]
      },
      {
        id: 'assets',
        name: "Campaign Assets",
        type: "folder",
        count: 12,
        children: [
          { id: 'a1', name: "Email Templates", type: "folder", count: 5 },
          { id: 'a2', name: "Landing Pages", type: "folder", count: 3 },
          { id: 'a3', name: "Graphics", type: "folder", count: 4 }
        ]
      },
      {
        id: 'reports',
        name: "Reports",
        type: "folder",
        count: 4,
        children: []
      }
    ]
  },
  {
    id: 'company',
    name: "Company Knowledge Base",
    type: "folder",
    isOpen: true,
    children: [
      { id: 'icps', name: "ICPs", type: "folder", count: 3 },
      { id: 'product', name: "Product Information", type: "folder", count: 6 },
      { id: 'brand', name: "Brand Guidelines", type: "folder", count: 4 },
      { id: 'past', name: "Past Campaigns", type: "folder", count: 15 },
      { id: 'competitor', name: "Competitor Intel", type: "folder", count: 5 },
      { id: 'templates', name: "Templates", type: "folder", count: 20 }
    ]
  },
  {
    id: 'shared',
    name: "Shared with Experts",
    type: "folder",
    count: 12,
    children: []
  },
  {
    id: 'archived',
    name: "Archived",
    type: "folder",
    count: 8,
    children: []
  }
];

// Mock files data
const mockFiles = [
  {
    id: 1,
    name: "Week 4 Report",
    type: "pdf",
    size: "2.4 MB",
    folder: "Deliverables",
    folderId: 'deliverables',
    uploadedBy: { name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    uploadDate: "Mar 8, 2024",
    modified: "Today",
    modifiedDate: "2024-03-08",
    sharedWith: [
      { name: "You", avatar: "AT" },
      { name: "Sarah Chen", avatar: "SC" }
    ],
    version: 2,
    tags: ["Report", "Week 4"],
    isPinned: true,
    hasComments: true,
    commentCount: 3,
    thumbnail: null
  },
  {
    id: 2,
    name: "Email Sequences v3",
    type: "docx",
    size: "456 KB",
    folder: "Deliverables",
    folderId: 'deliverables',
    uploadedBy: { name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    uploadDate: "Mar 7, 2024",
    modified: "Yesterday",
    modifiedDate: "2024-03-07",
    sharedWith: [
      { name: "You", avatar: "AT" }
    ],
    version: 3,
    tags: ["Email", "Sequences", "Outbound"],
    isPinned: true,
    hasComments: true,
    commentCount: 8,
    thumbnail: null
  },
  {
    id: 3,
    name: "ICP Definition Final",
    type: "pdf",
    size: "1.8 MB",
    folder: "Deliverables",
    folderId: 'deliverables',
    uploadedBy: { name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    uploadDate: "Feb 28, 2024",
    modified: "1 week ago",
    modifiedDate: "2024-03-01",
    sharedWith: [
      { name: "You", avatar: "AT" },
      { name: "Sarah Chen", avatar: "SC" },
      { name: "Mike J.", avatar: "MJ" }
    ],
    version: 4,
    tags: ["ICP", "Strategy"],
    isPinned: true,
    hasComments: false,
    commentCount: 0,
    thumbnail: null
  },
  {
    id: 4,
    name: "Campaign Strategy",
    type: "pdf",
    size: "3.2 MB",
    folder: "Strategy Documents",
    folderId: 'strategy',
    uploadedBy: { name: "You", avatar: "AT", color: "bg-blue-500" },
    uploadDate: "Feb 15, 2024",
    modified: "2 weeks ago",
    modifiedDate: "2024-02-22",
    sharedWith: [
      { name: "John Davis", avatar: "JD" }
    ],
    version: 2,
    tags: ["Strategy", "Campaign"],
    isPinned: false,
    hasComments: true,
    commentCount: 5,
    thumbnail: null
  },
  {
    id: 5,
    name: "Messaging Framework",
    type: "docx",
    size: "890 KB",
    folder: "Strategy Documents",
    folderId: 'strategy',
    uploadedBy: { name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    uploadDate: "Feb 20, 2024",
    modified: "2 weeks ago",
    modifiedDate: "2024-02-22",
    sharedWith: [
      { name: "You", avatar: "AT" }
    ],
    version: 1,
    tags: ["Messaging", "Framework"],
    isPinned: false,
    hasComments: false,
    commentCount: 0,
    thumbnail: null
  },
  {
    id: 6,
    name: "Competitor Analysis",
    type: "xlsx",
    size: "1.2 MB",
    folder: "Strategy Documents",
    folderId: 'strategy',
    uploadedBy: { name: "John Davis", avatar: "JD", color: "bg-emerald-500" },
    uploadDate: "Mar 5, 2024",
    modified: "3 days ago",
    modifiedDate: "2024-03-05",
    sharedWith: [
      { name: "You", avatar: "AT" }
    ],
    version: 1,
    tags: ["Competitor", "Analysis"],
    isPinned: false,
    hasComments: false,
    commentCount: 0,
    thumbnail: null
  },
  {
    id: 7,
    name: "Company ICP v2.3",
    type: "pdf",
    size: "2.1 MB",
    folder: "ICPs",
    folderId: 'icps',
    uploadedBy: { name: "You", avatar: "AT", color: "bg-blue-500" },
    uploadDate: "Jan 15, 2024",
    modified: "1 month ago",
    modifiedDate: "2024-02-08",
    sharedWith: [
      { name: "John Davis", avatar: "JD" }
    ],
    version: 3,
    tags: ["ICP", "Company"],
    isPinned: true,
    hasComments: false,
    commentCount: 0,
    thumbnail: null
  },
  {
    id: 8,
    name: "Brand Guidelines",
    type: "pdf",
    size: "8.5 MB",
    folder: "Brand Guidelines",
    folderId: 'brand',
    uploadedBy: { name: "You", avatar: "AT", color: "bg-blue-500" },
    uploadDate: "Jan 10, 2024",
    modified: "2 months ago",
    modifiedDate: "2024-01-10",
    sharedWith: [
      { name: "John Davis", avatar: "JD" }
    ],
    version: 1,
    tags: ["Brand", "Guidelines"],
    isPinned: false,
    hasComments: false,
    commentCount: 0,
    thumbnail: null
  },
  {
    id: 9,
    name: "Q4 Campaign Results",
    type: "pdf",
    size: "4.2 MB",
    folder: "Past Campaigns",
    folderId: 'past',
    uploadedBy: { name: "You", avatar: "AT", color: "bg-blue-500" },
    uploadDate: "Dec 15, 2023",
    modified: "3 months ago",
    modifiedDate: "2023-12-15",
    sharedWith: [
      { name: "John Davis", avatar: "JD" }
    ],
    version: 1,
    tags: ["Results", "Q4", "Campaign"],
    isPinned: false,
    hasComments: false,
    commentCount: 0,
    thumbnail: null
  },
  {
    id: 10,
    name: "Email Templates Library",
    type: "docx",
    size: "350 KB",
    folder: "Templates",
    folderId: 'templates',
    uploadedBy: { name: "You", avatar: "AT", color: "bg-blue-500" },
    uploadDate: "Feb 1, 2024",
    modified: "1 month ago",
    modifiedDate: "2024-02-01",
    sharedWith: [
      { name: "John Davis", avatar: "JD" }
    ],
    version: 5,
    tags: ["Templates", "Email"],
    isPinned: true,
    hasComments: false,
    commentCount: 0,
    thumbnail: null
  }
];

// Mock version history
const mockVersions = [
  { id: 3, version: 3, date: "Today", author: "John Davis", notes: "Updated subject lines based on A/B test results", isCurrent: true },
  { id: 2, version: 2, date: "Mar 5, 2024", author: "John Davis", notes: "Added follow-up sequence", isCurrent: false },
  { id: 1, version: 1, date: "Mar 1, 2024", author: "John Davis", notes: "Initial email sequences", isCurrent: false }
];

// Mock comments
const mockComments = [
  { id: 1, author: "You", avatar: "AT", content: "The subject lines look great! Can we test a shorter version?", timestamp: "2 hours ago", replies: [
    { id: 11, author: "John Davis", avatar: "JD", content: "Sure, I'll add a variant with shorter subject lines.", timestamp: "1 hour ago" }
  ]},
  { id: 2, author: "Sarah Chen", avatar: "SC", content: "Please ensure we mention the case study in email 3.", timestamp: "Yesterday", replies: [] }
];

// Quick access files (pinned)
const quickAccessFiles = mockFiles.filter(f => f.isPinned);

// Helper functions
function getFileIcon(type, size = 5) {
  const iconClass = `w-${size} h-${size}`;
  switch (type) {
    case 'pdf': return <FileText className={`${iconClass} text-red-400`} />;
    case 'docx': case 'doc': return <FileText className={`${iconClass} text-blue-400`} />;
    case 'xlsx': case 'xls': return <FileSpreadsheet className={`${iconClass} text-emerald-400`} />;
    case 'png': case 'jpg': case 'jpeg': case 'gif': return <Image className={`${iconClass} text-purple-400`} />;
    case 'mp4': case 'mov': return <Video className={`${iconClass} text-pink-400`} />;
    default: return <File className={`${iconClass} text-slate-400`} />;
  }
}

function getFileColor(type) {
  switch (type) {
    case 'pdf': return { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400' };
    case 'docx': case 'doc': return { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400' };
    case 'xlsx': case 'xls': return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400' };
    case 'png': case 'jpg': case 'jpeg': case 'gif': return { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400' };
    default: return { bg: 'bg-slate-500/20', border: 'border-slate-500/40', text: 'text-slate-400' };
  }
}

// Folder Tree Item Component
function FolderTreeItem({ item, level = 0, selectedFolder, onSelect, expandedFolders, onToggle }) {
  const isExpanded = expandedFolders.includes(item.id);
  const isSelected = selectedFolder === item.id;
  const hasChildren = item.children && item.children.length > 0;
  const isFolder = item.type === 'folder';

  return (
    <div>
      <button
        onClick={() => isFolder ? (hasChildren ? onToggle(item.id) : onSelect(item.id)) : onSelect(item.id)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm transition-all ${
          isSelected ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'
        }`}
        style={{ paddingLeft: `${8 + level * 12}px` }}
      >
        {isFolder && hasChildren && (
          <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        )}
        {isFolder && !hasChildren && <span className="w-3.5" />}
        {isFolder ? (
          isExpanded ? <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" /> : <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
        ) : (
          getFileIcon(item.fileType, 4)
        )}
        <span className="flex-1 truncate text-sm">{item.name}</span>
        {isFolder && item.count !== undefined && (
          <span className="text-xs text-slate-500">{item.count}</span>
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
              expandedFolders={expandedFolders}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// File Card Component (Grid View)
function FileCard({ file, onSelect, onPin }) {
  const [showMenu, setShowMenu] = useState(false);
  const colors = getFileColor(file.type);

  return (
    <div
      className="bg-slate-700 border border-slate-600 rounded-xl p-4 hover:border-purple-500/50 hover:shadow-lg transition-all cursor-pointer group relative"
      onClick={() => onSelect(file)}
    >
      {/* Thumbnail/Icon */}
      <div className={`h-20 rounded-lg mb-3 flex items-center justify-center border ${colors.bg} ${colors.border}`}>
        <div className="transform scale-150">
          {getFileIcon(file.type)}
        </div>
      </div>

      {/* File Info */}
      <h4 className="font-medium text-white text-sm truncate mb-1 group-hover:text-purple-300 transition-colors">
        {file.name}
      </h4>

      <div className="flex items-center gap-2 mb-2">
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium uppercase ${colors.bg} ${colors.border} ${colors.text}`}>
          {file.type}
        </span>
        <span className="text-xs text-slate-500">{file.size}</span>
        {file.version > 1 && (
          <span className="text-xs text-slate-500">v{file.version}</span>
        )}
      </div>

      {/* Uploaded By */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-5 h-5 ${file.uploadedBy.color || 'bg-slate-600'} rounded-full flex items-center justify-center`}>
          <span className="text-white text-xs">{file.uploadedBy.avatar}</span>
        </div>
        <span className="text-xs text-slate-400">{file.modified}</span>
      </div>

      {/* Shared With */}
      {file.sharedWith.length > 0 && (
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 text-slate-500" />
          <div className="flex -space-x-1">
            {file.sharedWith.slice(0, 3).map((user, idx) => (
              <div key={idx} className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center border border-slate-700">
                <span className="text-white text-xs">{user.avatar}</span>
              </div>
            ))}
          </div>
          {file.sharedWith.length > 3 && (
            <span className="text-xs text-slate-500">+{file.sharedWith.length - 3}</span>
          )}
        </div>
      )}

      {/* Tags */}
      {file.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {file.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-slate-600 rounded text-xs text-slate-300">{tag}</span>
          ))}
        </div>
      )}

      {/* Pin & Comments indicators */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {file.isPinned && <Pin className="w-3.5 h-3.5 text-amber-400 fill-current" />}
        {file.hasComments && (
          <span className="flex items-center gap-0.5 text-xs text-slate-400">
            <MessageSquare className="w-3 h-3" />{file.commentCount}
          </span>
        )}
      </div>

      {/* Quick Actions on Hover */}
      <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg" title="Preview">
          <Eye className="w-3.5 h-3.5 text-slate-300" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg" title="Download">
          <Download className="w-3.5 h-3.5 text-slate-300" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); }} className="p-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg" title="Share">
          <Share2 className="w-3.5 h-3.5 text-slate-300" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="p-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg">
          <MoreHorizontal className="w-3.5 h-3.5 text-slate-300" />
        </button>
      </div>
    </div>
  );
}

// File Row Component (List View)
function FileRow({ file, onSelect }) {
  const colors = getFileColor(file.type);

  return (
    <tr
      onClick={() => onSelect(file)}
      className="hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/50 transition-all group"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {file.isPinned && <Pin className="w-3.5 h-3.5 text-amber-400 fill-current" />}
          {getFileIcon(file.type, 5)}
          <div>
            <span className="text-white font-medium block">{file.name}</span>
            <div className="flex items-center gap-2 mt-0.5">
              {file.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs text-slate-500">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${colors.bg} ${colors.border} ${colors.text}`}>
          {file.type}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-slate-400">{file.size}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 ${file.uploadedBy.color || 'bg-slate-600'} rounded-full flex items-center justify-center`}>
            <span className="text-white text-xs">{file.uploadedBy.avatar}</span>
          </div>
          <span className="text-sm text-slate-300">{file.uploadedBy.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-slate-400">{file.uploadDate}</td>
      <td className="py-3 px-4 text-sm text-slate-400">{file.modified}</td>
      <td className="py-3 px-4">
        {file.sharedWith.length > 0 ? (
          <div className="flex items-center -space-x-1">
            {file.sharedWith.slice(0, 3).map((user, idx) => (
              <div key={idx} className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center border border-slate-800">
                <span className="text-white text-xs">{user.avatar}</span>
              </div>
            ))}
            {file.sharedWith.length > 3 && (
              <span className="text-xs text-slate-500 ml-1">+{file.sharedWith.length - 3}</span>
            )}
          </div>
        ) : (
          <span className="text-slate-500">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-slate-400">v{file.version}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button className="p-1.5 hover:bg-slate-600 rounded-lg" title="Preview">
            <Eye className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-1.5 hover:bg-slate-600 rounded-lg" title="Download">
            <Download className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-1.5 hover:bg-slate-600 rounded-lg" title="More">
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// File Preview Modal Component
function FilePreviewModal({ file, onClose }) {
  const [activeTab, setActiveTab] = useState('preview');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(5);
  const [zoom, setZoom] = useState(100);
  const [newComment, setNewComment] = useState('');
  const colors = getFileColor(file.type);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex">
      {/* Preview Pane */}
      <div className="flex-[7] bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            {getFileIcon(file.type, 5)}
            <div>
              <h2 className="font-semibold text-white">{file.name}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className={`px-1.5 py-0.5 rounded uppercase ${colors.bg} ${colors.text}`}>{file.type}</span>
                <span>{file.size}</span>
                <span>•</span>
                <span>Version {file.version}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
              <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="p-1 hover:bg-slate-700 rounded">
                <ZoomOut className="w-4 h-4 text-slate-400" />
              </button>
              <span className="text-sm text-slate-400 w-12 text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="p-1 hover:bg-slate-700 rounded">
                <ZoomIn className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <button className="p-2 hover:bg-slate-700 rounded-lg" title="Print">
              <Printer className="w-4 h-4 text-slate-400" />
            </button>
            <button className="p-2 hover:bg-slate-700 rounded-lg" title="Download">
              <Download className="w-4 h-4 text-slate-400" />
            </button>
            <button className="p-2 hover:bg-slate-700 rounded-lg" title="Full Screen">
              <Maximize2 className="w-4 h-4 text-slate-400" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-slate-800/50">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}>
            <div className="p-12 text-center">
              <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center ${colors.bg}`}>
                {getFileIcon(file.type, 12)}
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{file.name}</h3>
              <p className="text-slate-500">Document preview would render here</p>
              <p className="text-sm text-slate-400 mt-4">{file.type.toUpperCase()} • {file.size} • {totalPages} pages</p>
            </div>
          </div>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center justify-center gap-4 p-4 border-t border-slate-700">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="text-sm text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-[3] bg-slate-800 border-l border-slate-700 flex flex-col max-w-md">
        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {['preview', 'versions', 'comments', 'sharing'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-medium capitalize transition-all ${
                activeTab === tab ? 'text-purple-400 border-b-2 border-purple-400 bg-slate-700/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Preview/Info Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">File Name</label>
                <p className="text-white">{file.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Type</label>
                  <p className="text-white">{file.type.toUpperCase()}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Size</label>
                  <p className="text-white">{file.size}</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Uploaded By</label>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 ${file.uploadedBy.color || 'bg-slate-600'} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs">{file.uploadedBy.avatar}</span>
                  </div>
                  <span className="text-white">{file.uploadedBy.name}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Upload Date</label>
                <p className="text-white">{file.uploadDate}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Last Modified</label>
                <p className="text-white">{file.modified}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Location</label>
                <p className="text-white flex items-center gap-1">
                  <Folder className="w-4 h-4 text-amber-400" /> {file.folder}
                </p>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {file.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-700 rounded-lg text-xs text-slate-300">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Related Files */}
              <div>
                <label className="text-xs text-slate-500 block mb-2">Related Files</label>
                <div className="space-y-2">
                  {mockFiles.filter(f => f.id !== file.id).slice(0, 3).map(related => (
                    <div key={related.id} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 cursor-pointer">
                      {getFileIcon(related.type, 4)}
                      <span className="text-sm text-slate-300 truncate">{related.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Versions Tab */}
          {activeTab === 'versions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">Version History</h3>
                <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  <GitCompare className="w-3 h-3" /> Compare
                </button>
              </div>
              {mockVersions.map(version => (
                <div key={version.id} className={`p-3 rounded-xl border ${version.isCurrent ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-700/50 border-slate-600'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Version {version.version}</span>
                    {version.isCurrent && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">Current</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{version.date} by {version.author}</p>
                  <p className="text-sm text-slate-300">{version.notes}</p>
                  {!version.isCurrent && (
                    <div className="flex gap-2 mt-3">
                      <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Restore
                      </button>
                      <button className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {mockComments.map(comment => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{comment.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{comment.author}</span>
                        <span className="text-xs text-slate-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-300 bg-slate-700/50 rounded-xl p-3">{comment.content}</p>
                      <button className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Reply
                      </button>
                    </div>
                  </div>
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="flex items-start gap-2 ml-10">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs">{reply.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{reply.author}</span>
                          <span className="text-xs text-slate-500">{reply.timestamp}</span>
                        </div>
                        <p className="text-sm text-slate-300">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Add Comment */}
              <div className="pt-4 border-t border-slate-700">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium">
                    Comment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sharing Tab */}
          {activeTab === 'sharing' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 block mb-2">Shared With</label>
                <div className="space-y-2">
                  {file.sharedWith.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">{user.avatar}</span>
                        </div>
                        <span className="text-sm text-white">{user.name}</span>
                      </div>
                      <select className="bg-slate-600 border border-slate-500 rounded-lg px-2 py-1 text-xs text-white">
                        <option>View</option>
                        <option>Comment</option>
                        <option>Edit</option>
                      </select>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm text-purple-400 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add People
                </button>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white">Link Sharing</span>
                  <button className="w-10 h-5 bg-slate-600 rounded-full relative">
                    <div className="w-4 h-4 bg-slate-400 rounded-full absolute left-0.5 top-0.5" />
                  </button>
                </div>
                <button className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm text-slate-300 flex items-center justify-center gap-2">
                  <Link2 className="w-4 h-4" /> Copy Link
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2">
              <Edit3 className="w-4 h-4" /> Edit
            </button>
            <button className="py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-xs flex items-center justify-center gap-1">
              <Move className="w-3 h-3" /> Move
            </button>
            <button className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-xs flex items-center justify-center gap-1">
              <Copy className="w-3 h-3" /> Copy
            </button>
            <button className="flex-1 py-2 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-slate-300 text-xs flex items-center justify-center gap-1">
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
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-semibold text-white">Upload Files</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600 hover:border-slate-500'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">Drag files here or click to browse</p>
            <p className="text-sm text-slate-500">PDF, DOCX, XLSX, PNG, JPG up to 50MB</p>
            <input ref={fileInputRef} type="file" multiple className="hidden" />
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Destination Folder</label>
              <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
                <option>Deliverables</option>
                <option>Strategy Documents</option>
                <option>Campaign Assets</option>
                <option>Reports</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-2">Tags</label>
              <input
                type="text"
                placeholder="Add tags (comma separated)"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium">
            Cancel
          </button>
          <button className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium">
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

// AI Assistant Panel Component
function AIAssistantPanel() {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const suggestions = [
    "Summarize all campaign reports",
    "Find ICPs relevant to fintech",
    "What are the key findings from competitor analysis?",
    "Show files modified this week"
  ];

  return (
    <div className={`border-t border-slate-700 bg-slate-800/50 transition-all ${isExpanded ? 'h-64' : 'h-auto'}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <span className="text-sm font-medium text-white">AI Assistant</span>
            <p className="text-xs text-slate-500">Ask about these documents</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="p-3 pt-0">
          {/* Input */}
          <div className="relative mb-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your files..."
              className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-4 pr-10 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Suggestions */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(suggestion)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Files & Knowledge Base Component
function FilesKnowledgeBase() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(['project', 'deliverables', 'company']);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('modified');
  const [filterType, setFilterType] = useState('All');
  const [filterUploader, setFilterUploader] = useState('All');

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev =>
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  // Filter files
  let filteredFiles = mockFiles.filter(file => {
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedFolder && file.folderId !== selectedFolder) return false;
    if (filterType !== 'All' && file.type !== filterType.toLowerCase()) return false;
    return true;
  });

  // Sort files
  filteredFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'modified') return new Date(b.modifiedDate) - new Date(a.modifiedDate);
    if (sortBy === 'size') return parseFloat(b.size) - parseFloat(a.size);
    return 0;
  });

  return (
    <div className="flex h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
      {/* Left Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-slate-700 flex flex-col bg-slate-800">
        {/* Folder Tree */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Folders</h3>
            <button className="p-1 hover:bg-slate-700 rounded" title="New Folder">
              <FolderPlus className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* All Files */}
          <button
            onClick={() => setSelectedFolder(null)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-sm mb-2 ${
              selectedFolder === null ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>All Files</span>
            <span className="ml-auto text-xs text-slate-500">{mockFiles.length}</span>
          </button>

          {/* Folder Tree */}
          {mockFolderTree.map(folder => (
            <FolderTreeItem
              key={folder.id}
              item={folder}
              selectedFolder={selectedFolder}
              onSelect={setSelectedFolder}
              expandedFolders={expandedFolders}
              onToggle={toggleFolder}
            />
          ))}
        </div>

        {/* Quick Access */}
        <div className="border-t border-slate-700 p-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Pin className="w-3 h-3" /> Quick Access
          </h3>
          <div className="space-y-1">
            {quickAccessFiles.slice(0, 4).map(file => (
              <button
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-slate-700 transition-colors"
              >
                {getFileIcon(file.type, 4)}
                <span className="text-sm text-slate-300 truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Assistant */}
        <AIAssistantPanel />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-700 bg-slate-800/50">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all files..."
              className="w-full pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* View & Actions */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="modified">Date Modified</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>

            {/* Filter */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                showFilters ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Filter className="w-4 h-4" /> Filter
            </button>

            {/* Create New */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm">
                <Plus className="w-4 h-4" /> New <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl hidden group-hover:block z-10">
                <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-sm text-slate-300 rounded-t-xl">
                  <FileText className="w-4 h-4 text-blue-400" /> Google Doc
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-sm text-slate-300">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Google Sheet
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-sm text-slate-300">
                  <FolderPlus className="w-4 h-4 text-amber-400" /> New Folder
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-700 text-sm text-slate-300 rounded-b-xl">
                  <StickyNote className="w-4 h-4 text-pink-400" /> Note
                </button>
              </div>
            </div>

            {/* Upload */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium"
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 p-3 border-b border-slate-700 bg-slate-800/30">
            <div>
              <label className="text-xs text-slate-500 block mb-1">File Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option>All</option>
                <option>PDF</option>
                <option>DOCX</option>
                <option>XLSX</option>
                <option>PNG</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Uploaded By</label>
              <select
                value={filterUploader}
                onChange={(e) => setFilterUploader(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option>All</option>
                <option>Me</option>
                <option>John Davis</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="text-xs text-purple-400 hover:text-purple-300">Clear filters</button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-slate-500 mb-4">{filteredFiles.length} files</p>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map(file => (
                <FileCard
                  key={file.id}
                  file={file}
                  onSelect={setSelectedFile}
                  onPin={() => {}}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 text-left">
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Name</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Size</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Uploaded By</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Uploaded</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Modified</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Shared</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Version</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map(file => (
                    <FileRow
                      key={file.id}
                      file={file}
                      onSelect={setSelectedFile}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {filteredFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64">
              <FileText className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-400 mb-4">No files found</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-medium"
              >
                Upload Files
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
}

export default FilesKnowledgeBase;
