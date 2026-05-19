'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';
import {
  Plus, Trash2, ExternalLink, BookOpen, FileText, Play,
  Zap, BarChart3, Globe, CheckCircle, AlertCircle, Loader2, Edit3
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TYPE_OPTIONS = [
  { value: 'guide',      label: 'Guide',       icon: BookOpen  },
  { value: 'case-study', label: 'Case Study',  icon: BarChart3 },
  { value: 'template',   label: 'Template',    icon: FileText  },
  { value: 'playbook',   label: 'Playbook',    icon: Zap       },
  { value: 'video',      label: 'Video',       icon: Play      },
];

const GRADIENT_OPTIONS = [
  { label: 'Blue → Cyan',     value: 'from-blue-500 to-cyan-600' },
  { label: 'Orange → Amber',  value: 'from-orange-500 to-amber-500' },
  { label: 'Green → Teal',    value: 'from-emerald-500 to-teal-600' },
  { label: 'Purple → Violet', value: 'from-purple-500 to-violet-600' },
  { label: 'Rose → Pink',     value: 'from-rose-500 to-pink-500' },
  { label: 'Indigo → Blue',   value: 'from-blue-600 to-indigo-600' },
  { label: 'Red → Rose',      value: 'from-red-500 to-rose-600' },
  { label: 'Teal → Emerald',  value: 'from-teal-500 to-emerald-600' },
];

const BADGE_COLOR_OPTIONS = [
  { label: 'Blue (Featured)',    value: 'bg-blue-600 text-white' },
  { label: 'Orange (Popular)',   value: 'bg-orange-500 text-white' },
  { label: 'Green (Free)',       value: 'bg-green-500 text-white' },
  { label: 'Purple (Pick)',      value: 'bg-purple-600 text-white' },
  { label: 'Emerald (High ROI)', value: 'bg-emerald-600 text-white' },
  { label: 'Red (Video)',        value: 'bg-red-500 text-white' },
  { label: 'Sky Blue (New)',     value: 'bg-blue-500 text-white' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  type: 'guide',
  image: '',
  link: '',
  emoji: '📖',
  readTime: '5 min read',
  badge: '',
  badgeColor: 'bg-blue-600 text-white',
  gradient: 'from-blue-500 to-cyan-600',
  topics: '',
  isPublished: true,
};

function ResourceCard({ r, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all">
      <div className={`h-1.5 bg-gradient-to-r ${r.gradient}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{r.emoji}</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{r.typeLabel || r.type}</span>
              {r.badge && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.badgeColor}`}>{r.badge}</span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 truncate">{r.title}</h3>
            <p className="text-gray-500 text-xs line-clamp-2 mb-2">{r.description}</p>
            <div className="flex flex-wrap gap-1">
              {(r.topics || []).slice(0, 3).map((t, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <a href={r.link} target="_blank" rel="noopener noreferrer"
              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Open link">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button onClick={() => onDelete(r._id)}
              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>{r.readTime}</span>
          <span className={r.isPublished ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {r.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>
    </div>
  );
}

function AdminResourcesContent() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchResources = async () => {
    try {
      const res = await fetch(`${API_URL}/resources`);
      const json = await res.json();
      setResources(json.data?.resources || []);
    } catch {
      showToast('Failed to load resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.link.trim() || !form.description.trim()) {
      showToast('Title, description and link are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        topics: form.topics
          ? form.topics.split(',').map(t => t.trim()).filter(Boolean)
          : [],
      };
      const res = await fetch(`${API_URL}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create');
      showToast('Resource created successfully!');
      setForm(EMPTY_FORM);
      fetchResources();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try {
      const res = await fetch(`${API_URL}/resources/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error('Delete failed');
      showToast('Resource deleted');
      setResources(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Admin</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Resource Hub</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resource Cards</h1>
              <p className="text-gray-500 text-sm mt-1">Create and manage cards shown on the public Resources page</p>
            </div>
            <a href="/resources" target="_blank"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              <ExternalLink className="w-4 h-4" /> View Live Page
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── CREATE FORM ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-bold text-gray-900">New Resource Card</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                  <input name="title" value={form.title} onChange={handleChange}
                    placeholder="e.g. The Complete B2B GTM Playbook"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange}
                    placeholder="Brief description of what this resource covers..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Resource Link * <span className="text-gray-400 font-normal">(opens in new tab)</span></label>
                  <input name="link" value={form.link} onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Type *</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {TYPE_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      return (
                        <button key={opt.value} type="button"
                          onClick={() => setForm(prev => ({ ...prev, type: opt.value }))}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all ${form.type === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cover Image URL <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input name="image" value={form.image} onChange={handleChange}
                    placeholder="https://... (leave blank to use emoji)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>

                {/* Emoji + Read Time — row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Emoji</label>
                    <input name="emoji" value={form.emoji} onChange={handleChange}
                      placeholder="📖"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Read Time</label>
                    <input name="readTime" value={form.readTime} onChange={handleChange}
                      placeholder="10 min read"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                </div>

                {/* Badge + Badge Color — row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Badge Text</label>
                    <input name="badge" value={form.badge} onChange={handleChange}
                      placeholder="Featured"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Badge Color</label>
                    <select name="badgeColor" value={form.badgeColor} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                      {BADGE_COLOR_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Gradient */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Card Gradient</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {GRADIENT_OPTIONS.map(g => (
                      <button key={g.value} type="button"
                        onClick={() => setForm(prev => ({ ...prev, gradient: g.value }))}
                        className={`h-8 rounded-lg bg-gradient-to-r ${g.value} border-2 transition-all ${form.gradient === g.value ? 'border-gray-900 scale-105' : 'border-transparent'}`}
                        title={g.label} />
                    ))}
                  </div>
                </div>

                {/* Topics */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Topics <span className="text-gray-400 font-normal">(comma separated)</span></label>
                  <input name="topics" value={form.topics} onChange={handleChange}
                    placeholder="GTM Strategy, SaaS, Lead Gen"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>

                {/* Published toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${form.isPublished ? 'bg-blue-600' : 'bg-gray-300'}`}
                    onClick={() => setForm(prev => ({ ...prev, isPublished: !prev.isPublished }))}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isPublished ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                </label>

                {/* Submit */}
                <button type="submit" disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Creating...' : 'Create Resource Card'}
                </button>
              </form>
            </div>
          </div>

          {/* ── EXISTING RESOURCES LIST ── */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">
                Existing Resources
                <span className="ml-2 text-gray-400 font-normal text-sm">({resources.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-2xl">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-500 text-sm">No resources yet. Create your first one!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {resources.map(r => (
                  <ResourceCard key={r._id} r={r} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminResourcesPage() {
  return (
    <AdminGuard>
      <AdminResourcesContent />
    </AdminGuard>
  );
}
