'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FolderOpen, Plus, Trash2, Loader2, CheckCircle, AlertCircle, X, Pencil } from 'lucide-react';
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

function AddItemModal({ onClose, onSave, saving, initial, isEdit }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{isEdit ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h2>
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
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEdit ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
              {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExpertPortfolioInner() {
  const { getAuthHeader } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState(null); // portfolio item being edited (null = add)
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

  // If arriving with ?edit=<id> (from a card click), open that item's editor.
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && items.length) {
      const it = items.find((i) => (i._id || i.id) === editId);
      if (it) { setEditItem(it); setShowModal(true); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, searchParams]);

  // Map a stored portfolio item → the modal's form shape.
  const itemToForm = (it) => ({
    title:       it.title || '',
    description: it.description || '',
    results:     it.results || '',
    clientName:  it.client || it.clientName || '',
    projectUrl:  it.link || it.projectUrl || '',
  });
  // Map the modal's form → the API body (schema uses client/link).
  const formToBody = (form) => ({
    title:       form.title,
    description: form.description,
    results:     form.results,
    client:      form.clientName,
    link:        form.projectUrl,
  });

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    if (searchParams.get('edit')) router.replace('/expert/portfolio');
  };

  const handleSaveItem = async (form) => {
    setSaving(true);
    try {
      const editing = !!editItem;
      const id = editItem && (editItem._id || editItem.id);
      const res = await fetch(
        editing ? `${API_URL}/profiles/expert/portfolio/${id}` : `${API_URL}/profiles/expert/portfolio`,
        {
          method: editing ? 'PUT' : 'POST',
          headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify(formToBody(form)),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save item');
      }
      setToast({ type: 'success', message: editing ? 'Portfolio item updated' : 'Portfolio item added' });
      closeModal();
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
      {showModal && (
        <AddItemModal
          key={editItem ? (editItem._id || editItem.id) : 'new'}
          onClose={closeModal}
          onSave={handleSaveItem}
          saving={saving}
          initial={editItem ? itemToForm(editItem) : EMPTY_FORM}
          isEdit={!!editItem}
        />
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
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
              onClick={() => { setEditItem(null); setShowModal(true); }}
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
                    {(item.client || item.clientName) && (
                      <p className="text-xs text-gray-400">{item.client || item.clientName}</p>
                    )}
                    {item.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                    )}
                    {item.results && (
                      <p className="text-xs text-emerald-600 font-medium">{item.results}</p>
                    )}
                    <div className="flex items-center gap-2 mt-auto pt-2">
                      <button
                        onClick={() => { setEditItem(item); setShowModal(true); }}
                        className="flex-1 py-1.5 text-xs text-center border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-1"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      {(item.link || item.projectUrl) && (
                        <a
                          href={item.link || item.projectUrl}
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

export default function ExpertPortfolioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ExpertPortfolioInner />
    </Suspense>
  );
}
