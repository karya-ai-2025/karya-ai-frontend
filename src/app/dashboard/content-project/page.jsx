'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Loader2, CheckCircle, AlertCircle, ChevronRight,
  Linkedin, Mail, Clock, RefreshCw, ThumbsUp, MessageSquare,
} from 'lucide-react';
import {
  getMyContentProject,
  submitIntake,
  getPreview,
  approveContent,
  rejectContent,
} from '@/lib/contentProjectApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const BRAND_VOICES = [
  { value: 'professional',   label: 'Professional',    desc: 'Formal, authoritative, data-driven' },
  { value: 'casual',         label: 'Casual',          desc: 'Friendly, approachable, conversational' },
  { value: 'thought-leader', label: 'Thought Leader',  desc: 'Visionary, bold, opinion-forward' },
  { value: 'storytelling',   label: 'Storytelling',    desc: 'Narrative-driven, emotional, human' },
  { value: 'educational',    label: 'Educational',     desc: 'Teaching, step-by-step, practical' },
];

const STATUS_LABELS = {
  intake_pending:       { label: 'Fill Brief',     color: 'text-amber-600  bg-amber-50  border-amber-200' },
  in_review:            { label: 'Under Review',   color: 'text-blue-600   bg-blue-50   border-blue-200' },
  generating:           { label: 'Generating…',    color: 'text-purple-600 bg-purple-50 border-purple-200' },
  draft_ready:          { label: 'Draft Ready',    color: 'text-green-600  bg-green-50  border-green-200' },
  revision_requested:   { label: 'Revisions Requested', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  approved:             { label: 'Approved',       color: 'text-green-700  bg-green-100 border-green-300' },
  delivered:            { label: 'Delivered',      color: 'text-gray-600   bg-gray-100  border-gray-300' },
};

function ContentProjectPage() {
  const searchParams = useSearchParams();
  const catalogId    = searchParams.get('catalogId');

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState('');

  // Intake form state
  const [form, setForm] = useState({
    companyName:     '',
    industry:        '',
    targetAudience:  '',
    brandVoice:      '',
    keyTopics:       '',
    competitors:     '',
    goals:           '',
    additionalNotes: '',
  });

  // Preview state
  const [preview,        setPreview]        = useState(null);
  const [revisionNote,   setRevisionNote]   = useState('');
  const [showRevision,   setShowRevision]   = useState(false);
  const [activePost,     setActivePost]     = useState(0);

  useEffect(() => {
    loadProject();
  }, []);

  async function loadProject() {
    setLoading(true);
    setError('');
    try {
      const p = await getMyContentProject(catalogId);
      setProject(p);
      if (p.intake?.companyName) {
        setForm({
          companyName:     p.intake.companyName     || '',
          industry:        p.intake.industry        || '',
          targetAudience:  p.intake.targetAudience  || '',
          brandVoice:      p.intake.brandVoice      || '',
          keyTopics:       (p.intake.keyTopics || []).join(', '),
          competitors:     p.intake.competitors     || '',
          goals:           p.intake.goals           || '',
          additionalNotes: p.intake.additionalNotes || '',
        });
      }
      // Load preview if ready
      if (['draft_ready', 'revision_requested', 'approved', 'delivered'].includes(p.status)) {
        loadPreview(p._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPreview(id) {
    try {
      const data = await getPreview(id);
      setPreview(data.latestVersion);
    } catch { /* not ready */ }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleSubmitIntake(e) {
    e.preventDefault();
    if (!form.companyName || !form.industry || !form.targetAudience || !form.brandVoice) {
      setError('Company name, industry, target audience and brand voice are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await submitIntake(project._id, {
        ...form,
        keyTopics: form.keyTopics.split(',').map(t => t.trim()).filter(Boolean),
      });
      setProject(updated);
      showToast('Brief submitted! Our team will review and generate your content.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    setSaving(true);
    try {
      const updated = await approveContent(project._id);
      setProject(updated);
      showToast('Content approved!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleReject() {
    if (!revisionNote.trim()) { setError('Please describe what you need changed.'); return; }
    setSaving(true);
    try {
      const updated = await rejectContent(project._id, revisionNote);
      setProject(updated);
      setShowRevision(false);
      setRevisionNote('');
      showToast('Revision request sent!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Loading / error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl p-8 shadow text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 mb-4">{error}</p>
          <button onClick={loadProject} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const status     = project?.status || 'intake_pending';
  const statusMeta = STATUS_LABELS[status] || STATUS_LABELS.intake_pending;
  const showForm   = ['intake_pending', 'revision_requested'].includes(status);
  const showPreviewSection = ['draft_ready', 'revision_requested', 'approved', 'delivered'].includes(status) && preview;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Project</h1>
            <p className="text-sm text-gray-500 mt-0.5">LinkedIn posts + newsletter — powered by AI</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusMeta.color}`}>
            {statusMeta.label}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* ── STEP TIMELINE ── */}
        <StepTimeline status={status} />

        {/* ── INTAKE FORM ── */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {status === 'revision_requested' ? 'Update Your Brief' : 'Brand Brief'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Tell us about your brand so we can create content that sounds like you.
            </p>

            <form onSubmit={handleSubmitIntake} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Company Name *" required>
                  <input
                    value={form.companyName}
                    onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                    placeholder="Acme Corp"
                    className="input-base"
                  />
                </Field>
                <Field label="Industry *" required>
                  <input
                    value={form.industry}
                    onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                    placeholder="B2B SaaS, Healthcare, Finance…"
                    className="input-base"
                  />
                </Field>
              </div>

              <Field label="Target Audience *" required>
                <input
                  value={form.targetAudience}
                  onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
                  placeholder="Founders at 50-200 person companies, CTOs in fintech…"
                  className="input-base"
                />
              </Field>

              <Field label="Brand Voice *" required>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
                  {BRAND_VOICES.map(v => (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, brandVoice: v.value }))}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        form.brandVoice === v.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-800">{v.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-tight">{v.desc}</p>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Key Topics" hint="Comma-separated topics you want to be known for">
                <input
                  value={form.keyTopics}
                  onChange={e => setForm(f => ({ ...f, keyTopics: e.target.value }))}
                  placeholder="AI in sales, startup growth, team leadership…"
                  className="input-base"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Competitors" hint="Optional">
                  <input
                    value={form.competitors}
                    onChange={e => setForm(f => ({ ...f, competitors: e.target.value }))}
                    placeholder="Competitor A, Competitor B…"
                    className="input-base"
                  />
                </Field>
                <Field label="Content Goals" hint="What do you want to achieve?">
                  <input
                    value={form.goals}
                    onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
                    placeholder="Build authority, generate leads…"
                    className="input-base"
                  />
                </Field>
              </div>

              <Field label="Additional Notes">
                <textarea
                  rows={3}
                  value={form.additionalNotes}
                  onChange={e => setForm(f => ({ ...f, additionalNotes: e.target.value }))}
                  placeholder="Anything else we should know about your brand, tone, or content preferences…"
                  className="input-base resize-none"
                />
              </Field>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                {saving ? 'Submitting…' : 'Submit Brief'}
              </button>
            </form>
          </div>
        )}

        {/* ── IN REVIEW / GENERATING banner ── */}
        {['in_review', 'generating'].includes(status) && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              {status === 'generating'
                ? <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                : <Clock className="w-7 h-7 text-blue-600" />
              }
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {status === 'generating' ? 'AI is generating your content…' : 'Brief received — under review'}
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              {status === 'generating'
                ? 'Our AI is crafting 4 LinkedIn posts and 1 newsletter tailored to your brand. This takes about 30 seconds.'
                : 'Our team is reviewing your brief and will generate your content soon. You\'ll see a preview here once it\'s ready.'}
            </p>
            <button
              onClick={loadProject}
              className="mt-6 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mx-auto"
            >
              <RefreshCw className="w-4 h-4" /> Check for updates
            </button>
          </div>
        )}

        {/* ── CONTENT PREVIEW ── */}
        {showPreviewSection && (
          <ContentPreview
            preview={preview}
            status={status}
            activePost={activePost}
            setActivePost={setActivePost}
            saving={saving}
            showRevision={showRevision}
            setShowRevision={setShowRevision}
            revisionNote={revisionNote}
            setRevisionNote={setRevisionNote}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}

        {/* ── APPROVED / DELIVERED ── */}
        {status === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Content approved!</p>
              <p className="text-sm text-green-700">Our team is packaging your content for delivery.</p>
            </div>
          </div>
        )}
        {status === 'delivered' && (
          <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-gray-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-700">Content delivered</p>
              <p className="text-sm text-gray-500">Your content has been delivered. Check your email.</p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .input-base {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-base:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
      `}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Field({ label, hint, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {hint && <span className="ml-1.5 text-xs font-normal text-gray-400">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function StepTimeline({ status }) {
  const steps = [
    { key: 'intake_pending',     label: 'Fill Brief' },
    { key: 'in_review',          label: 'Under Review' },
    { key: 'draft_ready',        label: 'Review Draft' },
    { key: 'approved',           label: 'Approve' },
    { key: 'delivered',          label: 'Delivered' },
  ];

  const ORDER = ['intake_pending', 'in_review', 'generating', 'draft_ready',
                 'revision_requested', 'approved', 'delivered'];
  const currentIdx = ORDER.indexOf(status);

  const stepOrder = ['intake_pending', 'in_review', 'draft_ready', 'approved', 'delivered'];

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const stepIdx  = ORDER.indexOf(step.key);
        const isDone   = currentIdx > stepIdx;
        const isActive = status === step.key ||
          (status === 'generating'         && step.key === 'in_review') ||
          (status === 'revision_requested' && step.key === 'draft_ready');

        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className={`flex flex-col items-center flex-shrink-0 ${i > 0 ? 'ml-1' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                isDone   ? 'bg-blue-600 border-blue-600 text-white'     :
                isActive ? 'bg-blue-100 border-blue-500 text-blue-600'  :
                           'bg-white border-gray-300 text-gray-400'
              }`}>
                {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap ${
                isActive ? 'text-blue-600 font-semibold' :
                isDone   ? 'text-gray-600' : 'text-gray-400'
              }`}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 ${isDone ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ContentPreview({
  preview, status, activePost, setActivePost,
  saving, showRevision, setShowRevision, revisionNote, setRevisionNote,
  onApprove, onReject,
}) {
  const posts      = preview?.linkedinPosts || [];
  const newsletter = preview?.newsletter;
  const canAct     = status === 'draft_ready';

  return (
    <div className="space-y-6">
      {/* LinkedIn Posts */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Linkedin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">LinkedIn Posts</h2>
            <p className="text-xs text-gray-500">{posts.length} posts for this month</p>
          </div>
        </div>

        {/* Tab bar */}
        {posts.length > 0 && (
          <div className="flex border-b border-gray-100 px-6">
            {posts.map((p, i) => (
              <button
                key={i}
                onClick={() => setActivePost(i)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activePost === i
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Week {p.weekNumber || i + 1}
              </button>
            ))}
          </div>
        )}

        {posts.length > 0 ? (
          <div className="p-6">
            <PostCard post={posts[activePost]} />
          </div>
        ) : (
          <p className="p-6 text-gray-400 text-sm">No LinkedIn posts generated yet.</p>
        )}
      </div>

      {/* Newsletter */}
      {newsletter && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Newsletter</h2>
              <p className="text-xs text-gray-500">
                {newsletter.wordCount ? `${newsletter.wordCount} words` : 'Monthly newsletter'}
              </p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {newsletter.subjectLine && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Subject Line</p>
                <p className="text-gray-900 font-semibold">{newsletter.subjectLine}</p>
              </div>
            )}
            {newsletter.previewText && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Preview Text</p>
                <p className="text-gray-600 text-sm italic">{newsletter.previewText}</p>
              </div>
            )}
            {newsletter.body && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Body</p>
                <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                  {newsletter.body}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {canAct && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">What would you like to do?</h3>
          {showRevision ? (
            <div className="space-y-3">
              <textarea
                rows={3}
                value={revisionNote}
                onChange={e => setRevisionNote(e.target.value)}
                placeholder="Describe what needs to be changed (e.g. 'Make the LinkedIn posts more casual', 'Update the newsletter to mention our product launch')…"
                className="input-base resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={onReject}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  Send Revision Request
                </button>
                <button
                  onClick={() => { setShowRevision(false); setRevisionNote(''); }}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onApprove}
                disabled={saving}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                Approve Content
              </button>
              <button
                onClick={() => setShowRevision(true)}
                className="flex-1 py-3 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Request Revisions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PostCard({ post }) {
  if (!post) return null;
  return (
    <div className="space-y-3">
      {post.hookLine && (
        <p className="text-lg font-bold text-gray-900 leading-snug">{post.hookLine}</p>
      )}
      {post.body && (
        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{post.body}</p>
      )}
      {post.cta && (
        <p className="text-blue-600 text-sm font-medium">{post.cta}</p>
      )}
      {post.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {post.hashtags.map((h, i) => (
            <span key={i} className="text-xs text-blue-500 font-medium">
              #{h.replace(/^#/, '')}
            </span>
          ))}
        </div>
      )}
      {post.characterCount > 0 && (
        <p className="text-xs text-gray-400">{post.characterCount} characters</p>
      )}
    </div>
  );
}

export default function ContentProjectPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
      <ContentProjectPage />
    </Suspense>
  );
}
