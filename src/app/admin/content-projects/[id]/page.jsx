'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2, AlertCircle, ChevronLeft, Zap, Linkedin, Mail,
  CheckCircle, Edit3, Save, Send, RefreshCw, Calendar, Eye,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import {
  adminGetProject,
  adminUpdateVersion,
  adminSaveNotes,
  adminDeliverProject,
  adminSendToClient,
} from '@/lib/contentProjectApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const STATUS_META = {
  intake_pending:     { label: 'Awaiting Brief',   color: 'text-amber-600  bg-amber-50  border-amber-200' },
  in_review:          { label: 'Under Review',     color: 'text-blue-600   bg-blue-50   border-blue-200' },
  generating:         { label: 'Generating…',      color: 'text-purple-600 bg-purple-50 border-purple-200' },
  admin_review:       { label: 'Admin Review',     color: 'text-violet-600 bg-violet-50 border-violet-200' },
  draft_ready:        { label: 'Sent to Client',   color: 'text-green-600  bg-green-50  border-green-200' },
  revision_requested: { label: 'Needs Revision',   color: 'text-orange-600 bg-orange-50 border-orange-200' },
  approved:           { label: 'Client Approved',  color: 'text-green-700  bg-green-100 border-green-300' },
  delivered:          { label: 'Delivered',        color: 'text-gray-600   bg-gray-100  border-gray-300' },
};

function AdminContentProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const id     = params.id;

  const [project,   setProject]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [toast,     setToast]     = useState('');

  // SSE streaming
  const [streaming,    setStreaming]    = useState(false);
  const [streamTokens, setStreamTokens] = useState('');
  const streamRef = useRef(null);

  // Edit state
  const [editingPost,       setEditingPost]       = useState(null);
  const [editingNewsletter, setEditingNewsletter] = useState(null);
  const [adminNotes,        setAdminNotes]        = useState('');
  const [savingNotes,       setSavingNotes]       = useState(false);
  const [savingContent,     setSavingContent]     = useState(false);
  const [delivering,        setDelivering]        = useState(false);
  const [sending,           setSending]           = useState(false);
  const [activePost,        setActivePost]        = useState(0);
  const [activeMainTab,     setActiveMainTab]     = useState('intake');
  const [activeVersionIdx,  setActiveVersionIdx]  = useState(-1);

  useEffect(() => { loadProject(); }, [id]);

  // Auto-refresh when background generation is running
  useEffect(() => {
    if (project?.status !== 'generating') return;
    const t = setInterval(async () => {
      try {
        const p = await adminGetProject(id);
        if (p.status !== 'generating') {
          setProject(p);
          setAdminNotes(p.adminNotes || '');
          if (p.contentVersions?.length) {
            setActiveMainTab('content');
            setActiveVersionIdx(p.contentVersions.length - 1);
          }
          clearInterval(t);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(t);
  }, [project?.status, id]);

  async function loadProject() {
    setLoading(true);
    setError('');
    try {
      const p = await adminGetProject(id);
      setProject(p);
      setAdminNotes(p.adminNotes || '');
      if (p.contentVersions?.length) {
        setActiveMainTab('content');
        setActiveVersionIdx(p.contentVersions.length - 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function startGenerate(overwrite = false) {
    if (streaming) return;
    const token = localStorage.getItem('token');
    setStreaming(true);
    setStreamTokens('');

    const url = `${API_URL}/content-projects/admin/${id}/generate?_token=${token}${overwrite ? '&overwrite=true' : ''}`;
    const es = new EventSource(url);
    streamRef.current = es;

    es.addEventListener('token', e => {
      const { token: t } = JSON.parse(e.data);
      setStreamTokens(prev => prev + t);
    });

    es.addEventListener('status', e => {
      const { status } = JSON.parse(e.data);
      setProject(p => p ? { ...p, status } : p);
    });

    es.addEventListener('done', async e => {
      const { versionNumber } = JSON.parse(e.data);
      es.close();
      streamRef.current = null;
      setStreaming(false);
      setStreamTokens('');
      await loadProject();
      setActiveMainTab('content');
      showToast(overwrite
        ? `Content v${versionNumber} regenerated — review before sending`
        : `Content v${versionNumber} generated — review before sending`);
    });

    es.addEventListener('error', e => {
      let msg = 'Generation failed';
      try { msg = JSON.parse(e.data).message; } catch {}
      es.close();
      streamRef.current = null;
      setStreaming(false);
      setError(msg);
    });

    es.onerror = () => {
      if (!streamRef.current) return; // already closed via done/error handler — don't show a spurious error
      streamRef.current.close();
      streamRef.current = null;
      setStreaming(false);
      setError('Connection lost. Please try again.');
    };
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      await adminSaveNotes(id, adminNotes);
      showToast('Notes saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingNotes(false);
    }
  }

  async function savePostEdit() {
    if (!editingPost) return;
    const version = selectedVersion();
    if (!version) return;
    setSavingContent(true);
    try {
      const posts = [...(version.linkedinPosts || [])];
      posts[editingPost.idx] = { ...posts[editingPost.idx], ...editingPost.fields };
      await adminUpdateVersion(id, version.versionNumber, { linkedinPosts: posts });
      await loadProject();
      setEditingPost(null);
      showToast('Post updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingContent(false);
    }
  }

  async function saveNewsletterEdit() {
    if (!editingNewsletter) return;
    const version = selectedVersion();
    if (!version) return;
    setSavingContent(true);
    try {
      await adminUpdateVersion(id, version.versionNumber, { newsletter: editingNewsletter });
      await loadProject();
      setEditingNewsletter(null);
      showToast('Newsletter updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingContent(false);
    }
  }

  async function handleDeliver() {
    setDelivering(true);
    try {
      const updated = await adminDeliverProject(id);
      setProject(updated);
      showToast('Marked as delivered!');
    } catch (err) {
      setError(err.message);
    } finally {
      setDelivering(false);
    }
  }

  async function handleSendToClient() {
    setSending(true);
    try {
      const updated = await adminSendToClient(id);
      setProject(updated);
      showToast('Content sent to client for review!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  function selectedVersion() {
    if (!project?.contentVersions?.length) return null;
    const idx = activeVersionIdx >= 0 && activeVersionIdx < project.contentVersions.length
      ? activeVersionIdx
      : project.contentVersions.length - 1;
    return project.contentVersions[idx];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project && error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl p-8 shadow text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 mb-4">{error}</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Go Back</button>
        </div>
      </div>
    );
  }

  const status     = project?.status || 'intake_pending';
  const meta       = STATUS_META[status] || STATUS_META.intake_pending;
  const version    = selectedVersion();
  const posts      = version?.linkedinPosts || [];
  const newsletter = version?.newsletter;
  const hasVersions    = (project?.contentVersions?.length || 0) > 0;
  const isLatestVersion = activeVersionIdx === (project?.contentVersions?.length || 1) - 1;

  const canGenerateNew = ['in_review', 'revision_requested'].includes(status) && project?.intake?.submittedAt;
  const isAdminReview  = status === 'admin_review';
  const canDeliver     = status === 'approved';

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
          <button onClick={() => router.push('/admin/content-projects')} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 truncate">
              {project?.intake?.companyName || project?.userId?.fullName || 'Content Project'}
            </h1>
            <p className="text-xs text-gray-500">{project?.userId?.email} • {project?.month}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex-shrink-0 ${meta.color}`}>
            {meta.label}
          </span>

          {/* Generate new version (in_review / revision_requested) */}
          {canGenerateNew && !streaming && (
            <button onClick={() => startGenerate(false)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
              <Zap className="w-4 h-4" /> Generate with AI
            </button>
          )}

          {/* Admin review: Regenerate (overwrite) + Send to Client */}
          {isAdminReview && !streaming && (
            <>
              <button onClick={() => startGenerate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 rounded-xl text-sm font-semibold transition-colors">
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
              <button onClick={handleSendToClient} disabled={sending}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-60">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send to Client
              </button>
            </>
          )}

          {/* Streaming indicator */}
          {streaming && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" /> Generating…
            </div>
          )}

          {/* Mark Delivered (only when client has approved) */}
          {canDeliver && (
            <button onClick={handleDeliver} disabled={delivering}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-60">
              {delivering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Mark Delivered
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column */}
        <div className="lg:col-span-1 space-y-5">

          {/* User info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {(project?.userId?.fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{project?.userId?.fullName}</p>
                <p className="text-xs text-gray-500">{project?.userId?.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Created: {project?.createdAt ? new Date(project.createdAt).toLocaleDateString('en-IN') : '—'}
              </div>
              {project?.intake?.submittedAt && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Brief: {new Date(project.intake.submittedAt).toLocaleDateString('en-IN')}
                </div>
              )}
              {project?.deliveredAt && (
                <div className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-blue-500" />
                  Delivered: {new Date(project.deliveredAt).toLocaleDateString('en-IN')}
                </div>
              )}
            </div>
          </div>

          {/* Brand brief */}
          {project?.intake?.companyName ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Brand Brief</h3>
              <div className="space-y-3">
                {[
                  ['Company',         project.intake.companyName],
                  ['Industry',        project.intake.industry],
                  ['Target Audience', project.intake.targetAudience],
                  ['Brand Voice',     project.intake.brandVoice],
                  ['Goals',           project.intake.goals],
                  ['Competitors',     project.intake.competitors],
                  ['Key Topics',      project.intake.keyTopics?.join(', ')],
                  ['Notes',           project.intake.additionalNotes],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
              Client hasn't submitted their brand brief yet.
            </div>
          )}

          {/* Admin notes */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Admin Notes</h3>
            <textarea rows={4} value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
              placeholder="Internal notes…"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-blue-400 resize-none" />
            <button onClick={handleSaveNotes} disabled={savingNotes}
              className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-60">
              {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save notes
            </button>
          </div>

          {/* Approval history */}
          {project?.approvalHistory?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">History</h3>
              <div className="space-y-2">
                {[...project.approvalHistory].reverse().map((h, i) => (
                  <div key={i} className="text-xs text-gray-600">
                    <span className={`font-semibold capitalize ${
                      h.action === 'approved' || h.action === 'delivered' ? 'text-green-600' :
                      h.action === 'rejected' ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {h.action.replace(/_/g, ' ')}
                    </span>
                    {h.note && <span className="text-gray-500 ml-1 block mt-0.5 pl-0 line-clamp-3">{h.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
              <button onClick={() => setError('')} className="ml-auto text-red-400 text-xs">✕</button>
            </div>
          )}

          {/* Live SSE terminal */}
          {streaming && (
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-mono font-semibold">Claude is generating…</span>
              </div>
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap overflow-auto max-h-80 leading-relaxed">
                {streamTokens || '…'}
              </pre>
            </div>
          )}

          {/* Admin review banner */}
          {isAdminReview && !streaming && version && (
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3">
              <Eye className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-violet-800">Review before sending to client</p>
                <p className="text-xs text-violet-600 mt-0.5">
                  Check the content below. Happy with it? Click <strong>Send to Client</strong>.
                  Want to redo it? Click <strong>Regenerate</strong> — this will overwrite the current draft (no new version created).
                </p>
              </div>
            </div>
          )}

          {/* Version tabs + content editor */}
          {hasVersions && (
            <div>
              {/* Tab bar: Brief | Content (v1) | Content (v2) … */}
              <div className="flex border-b border-gray-200 bg-white rounded-t-2xl overflow-x-auto">
                <button onClick={() => setActiveMainTab('intake')}
                  className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex-shrink-0 transition-colors ${
                    activeMainTab === 'intake' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}>
                  Brief
                </button>
                {project.contentVersions.map((v, i) => {
                  const isLatest  = i === project.contentVersions.length - 1;
                  const isSelected = activeMainTab === 'content' && activeVersionIdx === i;
                  return (
                    <button key={v.versionNumber}
                      onClick={() => { setActiveMainTab('content'); setActiveVersionIdx(i); setEditingPost(null); setEditingNewsletter(null); setActivePost(0); }}
                      className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 transition-colors ${
                        isSelected ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}>
                      Content (v{v.versionNumber})
                      {isLatest && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">latest</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Brief tab */}
              {activeMainTab === 'intake' && (
                <div className="bg-white rounded-b-2xl border border-t-0 border-gray-200 p-5">
                  {project?.intake?.companyName ? (
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        ['Company',         project.intake.companyName],
                        ['Industry',        project.intake.industry],
                        ['Target Audience', project.intake.targetAudience],
                        ['Brand Voice',     project.intake.brandVoice],
                        ['Goals',           project.intake.goals],
                        ['Key Topics',      project.intake.keyTopics?.join(', ')],
                        ['Competitors',     project.intake.competitors],
                        ['Notes',           project.intake.additionalNotes],
                      ].filter(([, v]) => v).map(([label, value]) => (
                        <div key={label}>
                          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
                          <p className="text-sm text-gray-700 mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-6">Brief not submitted yet.</p>
                  )}
                </div>
              )}

              {/* Content tab */}
              {activeMainTab === 'content' && version && (
                <div className="bg-white rounded-b-2xl border border-t-0 border-gray-200">
                  {!isLatestVersion && (
                    <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      Viewing an older version. Switch to the latest tab for current content.
                    </div>
                  )}
                  <div className="p-5 space-y-6">

                    {/* LinkedIn Posts */}
                    <div>
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                        <div className="w-7 h-7 rounded-lg bg-[#0a66c2] flex items-center justify-center flex-shrink-0">
                          <Linkedin className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="font-semibold text-gray-900">LinkedIn Posts</h2>
                        <span className="text-xs text-gray-400">{posts.length} posts</span>
                      </div>
                      {posts.length > 0 && (
                        <div className="flex border-b border-gray-100 mb-4 -mx-5 px-5 overflow-x-auto">
                          {posts.map((p, i) => (
                            <button key={i} onClick={() => setActivePost(i)}
                              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap flex-shrink-0 transition-colors ${
                                activePost === i ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}>
                              Week {p.weekNumber || i + 1}
                            </button>
                          ))}
                        </div>
                      )}
                      {posts[activePost] && (
                        editingPost?.idx === activePost ? (
                          <div className="space-y-3">
                            <EditField label="Hook Line">
                              <input value={editingPost.fields.hookLine || ''}
                                onChange={e => setEditingPost(ep => ({ ...ep, fields: { ...ep.fields, hookLine: e.target.value } }))}
                                className="input-sm" />
                            </EditField>
                            <EditField label="Body">
                              <textarea rows={6} value={editingPost.fields.body || ''}
                                onChange={e => setEditingPost(ep => ({ ...ep, fields: { ...ep.fields, body: e.target.value } }))}
                                className="input-sm resize-none" />
                            </EditField>
                            <EditField label="CTA">
                              <input value={editingPost.fields.cta || ''}
                                onChange={e => setEditingPost(ep => ({ ...ep, fields: { ...ep.fields, cta: e.target.value } }))}
                                className="input-sm" />
                            </EditField>
                            <EditField label="Hashtags (comma-separated)">
                              <input
                                value={(editingPost.fields.hashtags || []).join(', ')}
                                onChange={e => setEditingPost(ep => ({
                                  ...ep,
                                  fields: { ...ep.fields, hashtags: e.target.value.split(',').map(h => h.trim()).filter(Boolean) }
                                }))}
                                className="input-sm" />
                            </EditField>
                            <EditField label="Image URL (optional)">
                              <input value={editingPost.fields.imageUrl || ''}
                                onChange={e => setEditingPost(ep => ({ ...ep, fields: { ...ep.fields, imageUrl: e.target.value } }))}
                                placeholder="https://example.com/image.jpg"
                                className="input-sm" />
                            </EditField>
                            <div className="flex gap-2">
                              <button onClick={savePostEdit} disabled={savingContent}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-60">
                                {savingContent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                              </button>
                              <button onClick={() => setEditingPost(null)} className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {posts[activePost].hookLine && <p className="font-bold text-gray-900">{posts[activePost].hookLine}</p>}
                            {posts[activePost].body && <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{posts[activePost].body}</p>}
                            {posts[activePost].cta && <p className="text-blue-600 text-sm">{posts[activePost].cta}</p>}
                            {posts[activePost].hashtags?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {posts[activePost].hashtags.map((h, i) => (
                                  <span key={i} className="text-xs text-blue-500">#{h.replace(/^#/, '')}</span>
                                ))}
                              </div>
                            )}
                            {posts[activePost].imageUrl && (
                              <img src={posts[activePost].imageUrl} alt="Post image"
                                className="rounded-xl w-full object-cover max-h-56 mt-1 border border-gray-100" />
                            )}
                            <button onClick={() => setEditingPost({ idx: activePost, fields: { ...posts[activePost] } })}
                              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 mt-2">
                              <Edit3 className="w-3.5 h-3.5" /> Edit post
                            </button>
                          </div>
                        )
                      )}
                    </div>

                    {/* Newsletter */}
                    <div>
                      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                        <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="font-semibold text-gray-900">Newsletter</h2>
                        {newsletter?.wordCount && <span className="text-xs text-gray-400">{newsletter.wordCount} words</span>}
                      </div>
                      {editingNewsletter ? (
                        <div className="space-y-3">
                          <EditField label="Subject Line">
                            <input value={editingNewsletter.subjectLine || ''}
                              onChange={e => setEditingNewsletter(n => ({ ...n, subjectLine: e.target.value }))}
                              className="input-sm" />
                          </EditField>
                          <EditField label="Preview Text">
                            <input value={editingNewsletter.previewText || ''}
                              onChange={e => setEditingNewsletter(n => ({ ...n, previewText: e.target.value }))}
                              className="input-sm" />
                          </EditField>
                          <EditField label="Body">
                            <textarea rows={10} value={editingNewsletter.body || ''}
                              onChange={e => setEditingNewsletter(n => ({ ...n, body: e.target.value }))}
                              className="input-sm resize-none" />
                          </EditField>
                          <EditField label="Image URL (optional)">
                            <input value={editingNewsletter.imageUrl || ''}
                              onChange={e => setEditingNewsletter(n => ({ ...n, imageUrl: e.target.value }))}
                              placeholder="https://example.com/image.jpg"
                              className="input-sm" />
                          </EditField>
                          <div className="flex gap-2">
                            <button onClick={saveNewsletterEdit} disabled={savingContent}
                              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-60">
                              {savingContent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                            </button>
                            <button onClick={() => setEditingNewsletter(null)} className="px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {newsletter?.subjectLine && (
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Subject</p>
                              <p className="text-gray-900 font-semibold">{newsletter.subjectLine}</p>
                            </div>
                          )}
                          {newsletter?.previewText && (
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Preview</p>
                              <p className="text-gray-600 text-sm italic">{newsletter.previewText}</p>
                            </div>
                          )}
                          {newsletter?.body && (
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Body</p>
                              <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100 max-h-64 overflow-auto">
                                {newsletter.body}
                              </div>
                            </div>
                          )}
                          {newsletter?.imageUrl && (
                            <div className="flex justify-center mt-1">
                              <img src={newsletter.imageUrl} alt="Newsletter image"
                                className="rounded-xl object-cover max-h-44 w-3/4 border border-gray-100" />
                            </div>
                          )}
                          {newsletter && (
                            <button onClick={() => setEditingNewsletter({ ...newsletter })}
                              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600">
                              <Edit3 className="w-3.5 h-3.5" /> Edit newsletter
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No content yet — auto-generating in background */}
          {!hasVersions && !streaming && status === 'generating' && (
            <div className="bg-white rounded-2xl border border-purple-200 p-10 text-center">
              <Loader2 className="w-10 h-10 text-purple-400 mx-auto mb-3 animate-spin" />
              <p className="font-semibold text-gray-700 mb-1">Auto-generating content…</p>
              <p className="text-sm text-gray-400">Claude is generating this client's content in the background. This page will refresh automatically.</p>
            </div>
          )}

          {/* No content yet — ready for manual generation */}
          {!hasVersions && !streaming && project?.intake?.submittedAt && status !== 'generating' && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
              <Zap className="w-10 h-10 text-purple-400 mx-auto mb-3" />
              <p className="font-semibold text-gray-700 mb-1">Ready to generate</p>
              <p className="text-sm text-gray-400 mb-5">Brief received. Click "Generate with AI" to create content.</p>
              <button onClick={() => startGenerate(false)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 mx-auto">
                <Zap className="w-4 h-4" /> Generate with AI
              </button>
            </div>
          )}

          {!hasVersions && !streaming && !project?.intake?.submittedAt && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-amber-700 text-sm">
              Waiting for client to submit their brand brief.
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .input-sm { width:100%; border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.8125rem; outline:none; }
        .input-sm:focus { border-color:#3b82f6; box-shadow:0 0 0 2px rgba(59,130,246,0.1); }
      `}</style>
    </div>
  );
}

function EditField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <AdminContentProjectDetail />
    </AdminGuard>
  );
}
