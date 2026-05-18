'use client';
import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Trash2, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ExpertPageWrapper from '@/components/expert/ExpertPageWrapper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const EMPTY_FORM = { title: '', description: '', results: '', clientName: '', projectUrl: '' };

function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
    }`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

function AddItemModal({ onClose, onSave, saving }) {
  const [form, setForm] = useState(EMPTY_FORM);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Add Portfolio Item</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Title <span className="text-red-500">*</span></label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. B2B Lead Generation Campaign"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
              rows={3}
              placeholder="What did you do and how did you do it?"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Results / Outcomes</label>
            <input
              value={form.results}
              onChange={e => setForm({ ...form, results: e.target.value })}
              placeholder="e.g. Generated 200 qualified leads in 4 weeks"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Client / Company</label>
              <input
                value={form.clientName}
                onChange={e => setForm({ ...form, clientName: e.target.value })}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Project URL</label>
              <input
                type="url"
                value={form.projectUrl}
                onChange={e => setForm({ ...form, projectUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExpertPortfolioPage() {
  const { getAuthHeader } = useAuth();
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState({});
  const [toast, setToast]         = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/profiles/expert`, {
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setItems(data.profile?.portfolio || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profiles/expert/portfolio`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to add item');
      }
      setToast({ type: 'success', message: 'Portfolio item added' });
      setShowModal(false);
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Remove this portfolio item?')) return;
    setDeleting(d => ({ ...d, [itemId]: true }));
    try {
      const res = await fetch(`${API_URL}/profiles/expert/portfolio/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error('Failed to delete');
      setToast({ type: 'success', message: 'Item removed' });
      setItems(prev => prev.filter(i => (i._id || i.id) !== itemId));
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setDeleting(d => ({ ...d, [itemId]: false }));
    }
  };

  return (
    <ExpertPageWrapper activeNav="portfolio">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      {showModal && <AddItemModal onClose={() => setShowModal(false)} onSave={handleAdd} saving={saving} />}

      <div className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
        <p className="text-gray-500 text-sm mb-8">Showcase your past work to attract the right clients</p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
            <FolderOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="font-semibold text-gray-400 mb-2">No portfolio items yet</p>
            <p className="text-sm text-gray-400 mb-6">Add your past projects to help clients understand your expertise</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:opacity-90 text-white font-semibold rounded-xl text-sm transition"
            >
              <Plus className="w-4 h-4" /> Add Your First Portfolio Item
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => {
              const id = item._id || item.id;
              return (
                <div key={id} className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
                  <div className="h-24 bg-gradient-to-br from-blue-50 to-violet-50 flex items-center justify-center text-4xl">
                    📁
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    {item.clientName && (
                      <p className="text-xs text-gray-400">{item.clientName}</p>
                    )}
                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                    )}
                    {item.results && (
                      <p className="text-xs text-emerald-600 font-medium">{item.results}</p>
                    )}
                    <div className="flex items-center gap-2 mt-auto pt-2">
                      {item.projectUrl && (
                        <a
                          href={item.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 text-xs text-center border border-gray-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          View Project
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(id)}
                        disabled={deleting[id]}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {deleting[id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ExpertPageWrapper>
  );
}
