'use client';

import { useState, useEffect } from 'react';
import TopNavbar from '@/components/TopNavbar';
import SideLeftBar from './SideLeftBar';
import {
  Loader2, AlertCircle, CheckCircle, ChevronRight, Clock,
  ThumbsUp, MessageSquare, RefreshCw, Linkedin, Mail, Plus,
  ArrowLeft, Calendar, Globe,
} from 'lucide-react';
import {
  getMyContentProjects,
  createContentProject,
  submitIntake,
  getPreview,
  approveContent,
  rejectContent,
  getMyBusinessProfile,
} from '@/lib/contentProjectApi';

const BRAND_VOICES = [
  { value: 'professional',   label: 'Professional',   desc: 'Formal, authoritative, data-driven' },
  { value: 'casual',         label: 'Casual',         desc: 'Friendly, approachable, conversational' },
  { value: 'thought-leader', label: 'Thought Leader', desc: 'Visionary, bold, opinion-forward' },
  { value: 'storytelling',   label: 'Storytelling',   desc: 'Narrative-driven, emotional, human' },
  { value: 'educational',    label: 'Educational',    desc: 'Teaching, step-by-step, practical' },
];

const STATUS_META = {
  intake_pending:     { label: 'Fill Brief',         color: 'text-amber-600  bg-amber-50  border-amber-200' },
  in_review:          { label: 'Under Review',       color: 'text-blue-600   bg-blue-50   border-blue-200' },
  generating:         { label: 'Generating…',        color: 'text-purple-600 bg-purple-50 border-purple-200' },
  admin_review:       { label: 'Preview Ready',       color: 'text-teal-600   bg-teal-50   border-teal-200' },
  draft_ready:        { label: 'Draft Ready',        color: 'text-green-600  bg-green-50  border-green-200' },
  revision_requested: { label: 'Revision Requested', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  approved:           { label: 'Approved',           color: 'text-green-700  bg-green-100 border-green-300' },
  delivered:          { label: 'Delivered',          color: 'text-gray-600   bg-gray-100  border-gray-300' },
};

const EMPTY_FORM = {
  companyName: '', industry: '', targetAudience: '', brandVoice: '',
  keyTopics: '', competitors: '', goals: '', additionalNotes: '',
};

export default function ContentProjectApp({ projectMetadata }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'detail'

  // List state
  const [campaigns, setCampaigns] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [creating, setCreating] = useState(false);
  const [listError, setListError] = useState('');

  // Detail state
  const [activeTab, setActiveTab] = useState('brief');
  const [project, setProject] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [revisionNote, setRevisionNote] = useState('');
  const [revisionTarget, setRevisionTarget] = useState('');
  const [showRevision, setShowRevision] = useState(false);
  const [activePost, setActivePost] = useState(0);

  // Derive early so hooks below can reference it
  const status = project?.status || 'intake_pending';

  useEffect(() => { loadCampaigns(); }, []);

  // Auto-poll while AI is generating in background
  useEffect(() => {
    if (status !== 'generating' || view !== 'detail' || !project?._id) return;
    const t = setInterval(async () => {
      try {
        const list = await getMyContentProjects();
        const updated = list.find(p => p._id === project._id);
        if (updated && updated.status !== 'generating') {
          clearInterval(t);
          openCampaign(updated);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(t);
  }, [status, view, project?._id]);

  async function prefillFromProfile() {
    try {
      const profile = await getMyBusinessProfile();
      if (!profile) return;

      // Target audience — join all confirmed ICP names + descriptions
      const icpText = (profile.idealCustomerProfiles || [])
        .filter(icp => icp.name)
        .map(icp => icp.description ? `${icp.name} — ${icp.description}` : icp.name)
        .join('; ');

      // Key topics — quickWins + marketingGoals mapped to human-readable labels
      const GOAL_LABELS = {
        brand_awareness:       'Brand Awareness',
        lead_generation:       'Lead Generation',
        sales_increase:        'Sales Growth',
        customer_retention:    'Customer Retention',
        market_expansion:      'Market Expansion',
        product_launch:        'Product Launch',
        reputation_management: 'Reputation Management',
        social_media_growth:   'Social Media Growth',
        seo_improvement:       'SEO & Search',
        content_creation:      'Content Creation',
      };
      const goalTopics  = (profile.marketingGoals || []).map(g => GOAL_LABELS[g] || g);
      const allTopics   = [...new Set([...(profile.quickWins || []), ...goalTopics])];

      // Additional notes — company description + desired plan + current challenges
      const noteParts = [
        profile.company?.description,
        profile.marketingActivities?.desiredPlan
          ? `Desired plan: ${profile.marketingActivities.desiredPlan}`
          : null,
        profile.currentChallenges?.length
          ? `Current challenges: ${profile.currentChallenges.join(', ')}`
          : null,
      ].filter(Boolean);

      setForm(prev => ({
        companyName:     prev.companyName     || profile.company?.name                        || '',
        industry:        prev.industry        || profile.industry                             || '',
        targetAudience:  prev.targetAudience  || icpText                                      || '',
        brandVoice:      prev.brandVoice      || '',
        keyTopics:       prev.keyTopics       || allTopics.join(', ')                         || '',
        competitors:     prev.competitors     || '',
        goals:           prev.goals           || profile.marketingActivities?.goalsObjectives || '',
        additionalNotes: prev.additionalNotes || noteParts.join('\n\n')                       || '',
      }));
    } catch {}
  }

  async function loadCampaigns() {
    setLoadingList(true);
    setListError('');
    try {
      const list = await getMyContentProjects();
      setCampaigns(list);
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoadingList(false);
    }
  }

  async function openCampaign(campaign) {
    setError('');
    setPreview(null);
    setRevisionNote('');
    setRevisionTarget('');
    setShowRevision(false);
    setActivePost(0);
    setProject(campaign);

    if (campaign.intake?.companyName) {
      setForm({
        companyName:     campaign.intake.companyName     || '',
        industry:        campaign.intake.industry        || '',
        targetAudience:  campaign.intake.targetAudience  || '',
        brandVoice:      campaign.intake.brandVoice      || '',
        keyTopics:       (campaign.intake.keyTopics || []).join(', '),
        competitors:     campaign.intake.competitors     || '',
        goals:           campaign.intake.goals           || '',
        additionalNotes: campaign.intake.additionalNotes || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }

    const s = campaign.status;
    if (['admin_review', 'draft_ready', 'revision_requested', 'approved', 'delivered'].includes(s)) {
      setActiveTab('preview');
      setDetailLoading(true);
      try {
        const data = await getPreview(campaign._id);
        setPreview(data.latestVersion);
      } catch { /* not ready yet */ }
      setDetailLoading(false);
    } else {
      setActiveTab('brief');
      // Pre-fill from business profile when brief hasn't been filled
      if (!campaign.intake?.companyName) {
        prefillFromProfile();
      }
    }

    setView('detail');
  }

  async function handleNewCampaign() {
    // Don't create a DB record yet — only create when the brief is actually submitted
    setProject(null);
    setForm(EMPTY_FORM);
    setPreview(null);
    setError('');
    setRevisionNote('');
    setRevisionTarget('');
    setShowRevision(false);
    setActivePost(0);
    setActiveTab('brief');
    setView('detail');
    prefillFromProfile();
  }

  function goBackToList() {
    setView('list');
    loadCampaigns();
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  async function refreshProject() {
    if (!project?._id) return;
    setDetailLoading(true);
    try {
      const list = await getMyContentProjects();
      const updated = list.find(p => p._id === project._id);
      if (updated) {
        setProject(updated);
        if (['admin_review', 'draft_ready', 'revision_requested', 'approved', 'delivered'].includes(updated.status)) {
          setActiveTab('preview');
          try {
            const data = await getPreview(updated._id);
            setPreview(data.latestVersion);
          } catch { /* not ready */ }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
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
      // Create the project record only now — on actual submission
      let projectId = project?._id;
      if (!projectId) {
        const created = await createContentProject();
        projectId = created._id;
        setProject(created);
      }
      const updated = await submitIntake(projectId, {
        ...form,
        keyTopics: form.keyTopics.split(',').map(t => t.trim()).filter(Boolean),
      });
      setProject(updated);
      showToast('Brief submitted! Our team will generate your content shortly.');
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
    if (!revisionNote.trim()) { setError('Please describe what needs changing.'); return; }
    setSaving(true);
    const fullNote = revisionTarget
      ? `[Revising: ${revisionTarget}] ${revisionNote}`
      : revisionNote;
    try {
      const updated = await rejectContent(project._id, fullNote);
      setProject(updated);
      setShowRevision(false);
      setRevisionNote('');
      setRevisionTarget('');
      showToast('Revision request sent!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const statusMeta = STATUS_META[status] || STATUS_META.intake_pending;
  const showForm   = ['intake_pending', 'revision_requested'].includes(status);
  const hasPreview = !!preview && ['admin_review', 'draft_ready', 'revision_requested', 'approved', 'delivered'].includes(status);

  return (
    <div className="flex h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      <SideLeftBar
        view={view}
        onGoToList={goBackToList}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto">
          {/* ── LIST VIEW ── */}
          {view === 'list' && (
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Content Campaigns</h1>
                  <p className="text-sm text-gray-500 mt-1">Each campaign creates 4 LinkedIn posts + 1 monthly newsletter</p>
                </div>
                <button
                  onClick={handleNewCampaign}
                  disabled={creating}
                  className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm disabled:opacity-60 transition-colors"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  New Campaign
                </button>
              </div>

              {listError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {listError}
                </div>
              )}

              {loadingList ? (
                <div className="flex justify-center py-24">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
                  <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                    <Linkedin className="w-7 h-7 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                    Start your first content campaign to get a month of LinkedIn posts and a newsletter.
                  </p>
                  <button
                    onClick={handleNewCampaign}
                    disabled={creating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create First Campaign
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map(c => (
                    <CampaignCard key={c._id} campaign={c} onClick={() => openCampaign(c)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── DETAIL VIEW ── */}
          {view === 'detail' && (
            <>
              {/* Page header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={goBackToList} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      {project?.intake?.companyName || 'New Campaign'}
                    </h1>
                    <p className="text-xs text-gray-500">LinkedIn posts + newsletter — powered by AI</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusMeta.color}`}>
                  {statusMeta.label}
                </span>
              </div>

              <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {error}
                    <button onClick={() => setError('')} className="ml-auto text-xs text-red-400">✕</button>
                  </div>
                )}

                {detailLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                  </div>
                ) : (
                  <>
                    <StepTimeline status={status} />

                    {/* BRIEF TAB */}
                    {activeTab === 'brief' && (
                      <>
                        {showForm && (
                          <BriefForm
                            form={form}
                            setForm={setForm}
                            onSubmit={handleSubmitIntake}
                            saving={saving}
                            isRevision={status === 'revision_requested'}
                          />
                        )}
                        {!showForm && ['in_review', 'generating'].includes(status) && (
                          <UnderReviewCard
                            status={status}
                            intake={project?.intake}
                            onRefresh={refreshProject}
                            refreshing={detailLoading}
                          />
                        )}
                        {!showForm && !['in_review', 'generating'].includes(status) && (
                          <BriefSummaryCard project={project} />
                        )}
                      </>
                    )}

                    {/* PREVIEW TAB */}
                    {activeTab === 'preview' && (
                      hasPreview ? (
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
                          revisionTarget={revisionTarget}
                          setRevisionTarget={setRevisionTarget}
                          companyName={project?.intake?.companyName || ''}
                          onApprove={handleApprove}
                          onReject={handleReject}
                        />
                      ) : (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="font-semibold text-gray-600">Content not ready yet</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {!project?.intake?.submittedAt
                              ? 'Submit your brand brief first'
                              : 'Our team is generating your content — check back soon.'}
                          </p>
                          {!project?.intake?.submittedAt && (
                            <button onClick={() => setActiveTab('brief')} className="mt-4 text-sm text-violet-600 hover:underline">
                              Go to Brand Brief →
                            </button>
                          )}
                        </div>
                      )
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && <HistoryTab project={project} />}
                  </>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Campaign list components ───────────────────────────────────────────────────

function CampaignCard({ campaign, onClick }) {
  const status = campaign.status || 'intake_pending';
  const meta   = STATUS_META[status] || STATUS_META.intake_pending;
  const title  = campaign.intake?.companyName || 'New Campaign';
  const month  = formatMonth(campaign.month);

  const ctaLabel = {
    intake_pending:     'Fill Brief',
    in_review:          'View Status',
    generating:         'View Status',
    admin_review:       'See Preview',
    draft_ready:        'Review Draft',
    revision_requested: 'Revision Pending',
    approved:           'View Content',
    delivered:          'View Content',
  }[status] || 'Open';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 hover:border-violet-300 hover:shadow-sm rounded-2xl p-5 flex items-center justify-between group transition-all"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Linkedin className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors truncate">{title}</p>
          {month && (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {month}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
          {meta.label}
        </span>
        <span className="text-sm text-gray-500 group-hover:text-violet-600 transition-colors hidden sm:block font-medium whitespace-nowrap">
          {ctaLabel} →
        </span>
      </div>
    </button>
  );
}

function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

// ── Detail view sub-components ────────────────────────────────────────────────

function StepTimeline({ status }) {
  const ORDER = ['intake_pending', 'in_review', 'generating', 'admin_review', 'draft_ready', 'revision_requested', 'approved', 'delivered'];
  const currentIdx = ORDER.indexOf(status);
  const steps = [
    { key: 'intake_pending', label: 'Fill Brief'    },
    { key: 'in_review',      label: 'Under Review'  },
    { key: 'draft_ready',    label: 'Review Draft'  },
    { key: 'approved',       label: 'Delivered'     },
  ];
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const stepIdx  = ORDER.indexOf(step.key);
        const isDone   = currentIdx > stepIdx;
        const isActive = status === step.key ||
          (status === 'generating'         && step.key === 'in_review')  ||
          (status === 'admin_review'       && step.key === 'draft_ready') ||
          (status === 'revision_requested' && step.key === 'draft_ready');
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                isDone   ? 'bg-violet-600 border-violet-600 text-white' :
                isActive ? 'bg-violet-100 border-violet-500 text-violet-600' :
                           'bg-white border-gray-300 text-gray-400'
              }`}>
                {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap ${
                isActive ? 'text-violet-600 font-semibold' :
                isDone   ? 'text-gray-600' : 'text-gray-400'
              }`}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 ${isDone ? 'bg-violet-600' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function UnderReviewCard({ status, intake, onRefresh, refreshing }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="relative w-14 h-14 mx-auto mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            {status === 'generating'
              ? <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              : <Clock className="w-6 h-6 text-blue-600" />}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-100 border-2 border-white flex items-center justify-center">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          </div>
        </div>
        <h2 className="font-semibold text-gray-900 mb-2">
          {status === 'generating' ? 'AI is crafting your content…' : 'Brief submitted — under review'}
        </h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
          {status === 'generating'
            ? 'Generating 4 LinkedIn posts and 1 newsletter tailored to your brand. This takes a minute.'
            : "Your brief is with our team. We'll generate your content and you'll see it in the Content Preview tab once ready."}
        </p>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Check for updates
        </button>
      </div>

      {/* Collapsible brief summary */}
      {intake?.companyName && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setExpanded(p => !p)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              View submitted brief
            </span>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
          </button>
          {expanded && (
            <div className="px-5 pb-5 border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
              {[
                ['Company',     intake.companyName],
                ['Industry',    intake.industry],
                ['Audience',    intake.targetAudience],
                ['Brand Voice', intake.brandVoice],
                ['Goals',       intake.goals],
                ['Key Topics',  intake.keyTopics?.join(', ')],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-sm text-gray-700 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BriefSummaryCard({ project }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <h2 className="font-semibold text-gray-900">Brief Submitted</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          ['Company',     project?.intake?.companyName],
          ['Industry',    project?.intake?.industry],
          ['Audience',    project?.intake?.targetAudience],
          ['Brand Voice', project?.intake?.brandVoice],
          ['Goals',       project?.intake?.goals],
          ['Key Topics',  project?.intake?.keyTopics?.join(', ')],
        ].filter(([, v]) => v).map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-sm text-gray-700 mt-0.5">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTab({ project }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Approval History</h2>
      {project?.approvalHistory?.length > 0 ? (
        <div className="space-y-3">
          {[...project.approvalHistory].reverse().map((h, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                h.action === 'approved' ? 'bg-green-500' :
                h.action === 'rejected' ? 'bg-red-500' : 'bg-orange-500'
              }`} />
              <div>
                <p className="text-sm font-semibold text-gray-800 capitalize">
                  {h.action.replace('_', ' ')}
                  {h.versionNumber ? ` (v${h.versionNumber})` : ''}
                </p>
                {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                {h.performedAt && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(h.performedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-6">No history yet.</p>
      )}
    </div>
  );
}

function BriefForm({ form, setForm, onSubmit, saving, isRevision }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        {isRevision ? 'Update Your Brief' : 'Brand Brief'}
      </h2>
      <p className="text-sm text-gray-500 mb-6">Tell us about your brand so we create content that sounds like you.</p>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Company Name *">
            <input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
              placeholder="Acme Corp" className="inp" />
          </Field>
          <Field label="Industry *">
            <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
              placeholder="B2B SaaS, Healthcare…" className="inp" />
          </Field>
        </div>
        <Field label="Target Audience *">
          <input value={form.targetAudience} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
            placeholder="Founders at 50-200 person companies…" className="inp" />
        </Field>
        <Field label="Brand Voice *">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
            {BRAND_VOICES.map(v => (
              <button key={v.value} type="button"
                onClick={() => setForm(f => ({ ...f, brandVoice: v.value }))}
                className={`text-left p-3 rounded-xl border-2 transition-all ${
                  form.brandVoice === v.value ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-200'
                }`}>
                <p className="text-sm font-semibold text-gray-800">{v.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{v.desc}</p>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Key Topics" hint="Comma-separated">
          <input value={form.keyTopics} onChange={e => setForm(f => ({ ...f, keyTopics: e.target.value }))}
            placeholder="AI in sales, startup growth…" className="inp" />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Competitors" hint="Optional">
            <input value={form.competitors} onChange={e => setForm(f => ({ ...f, competitors: e.target.value }))}
              placeholder="Competitor A, B…" className="inp" />
          </Field>
          <Field label="Content Goals">
            <input value={form.goals} onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
              placeholder="Build authority, generate leads…" className="inp" />
          </Field>
        </div>
        <Field label="Additional Notes">
          <textarea rows={3} value={form.additionalNotes} onChange={e => setForm(f => ({ ...f, additionalNotes: e.target.value }))}
            placeholder="Anything else about your brand tone or preferences…" className="inp resize-none" />
        </Field>
        <button type="submit" disabled={saving}
          className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
          {saving ? 'Submitting…' : 'Submit Brief'}
        </button>
      </form>
      <style jsx global>{`.inp { width:100%; border:1px solid #e5e7eb; border-radius:0.75rem; padding:0.625rem 0.875rem; font-size:0.875rem; outline:none; } .inp:focus { border-color:#7c3aed; box-shadow:0 0 0 3px rgba(124,58,237,0.1); }`}</style>
    </div>
  );
}

function Field({ label, hint, children }) {
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

function ContentPreview({ preview, status, activePost, setActivePost, saving, showRevision, setShowRevision, revisionNote, setRevisionNote, revisionTarget, setRevisionTarget, companyName, onApprove, onReject }) {
  const posts      = preview?.linkedinPosts || [];
  const newsletter = preview?.newsletter;
  const canAct     = status === 'draft_ready';

  return (
    <div className="space-y-6">
      {/* LinkedIn Posts Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0a66c2] flex items-center justify-center">
              <Linkedin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">LinkedIn Posts</h2>
              <p className="text-xs text-gray-500">{posts.length} posts for this month</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 bg-blue-50 border border-blue-100 text-blue-600 px-2.5 py-1 rounded-full font-medium">LinkedIn preview</span>
        </div>

        {posts.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {posts.map((p, i) => (
              <button key={i} onClick={() => setActivePost(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                  activePost === i ? 'bg-[#0a66c2] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                Week {p.weekNumber || i + 1}
              </button>
            ))}
          </div>
        )}
        {posts[activePost]
          ? <LinkedInPostCard post={posts[activePost]} companyName={companyName} />
          : <p className="text-gray-400 text-sm text-center py-8">No posts generated yet.</p>}
      </div>

      {/* Newsletter Section */}
      {newsletter && newsletter.body && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Monthly Newsletter</h2>
                <p className="text-xs text-gray-500">How it looks on Beehiiv</p>
              </div>
            </div>
            <span className="text-xs bg-orange-50 border border-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-medium">Beehiiv preview</span>
          </div>
          <BeehiivNewsletterPreview newsletter={newsletter} companyName={companyName} />
        </div>
      )}

      {/* Admin-reviewing banner — content is generated but admin hasn't finalized yet */}
      {status === 'admin_review' && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-teal-800">Here's a preview of your content!</p>
            <p className="text-sm text-teal-700 mt-0.5">Our team is reviewing and may make small tweaks before you get the final version to approve or request changes.</p>
          </div>
        </div>
      )}

      {/* Approval actions */}
      {canAct && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Ready to decide?</h3>
          <p className="text-sm text-gray-500 mb-4">Approve to move forward, or tell us what needs changing.</p>
          {showRevision ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">What needs revision?</p>
                <div className="flex flex-wrap gap-2">
                  {['LinkedIn Posts', 'Newsletter', 'Both'].map(opt => (
                    <button key={opt} type="button"
                      onClick={() => setRevisionTarget(prev => prev === opt ? '' : opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        revisionTarget === opt
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <textarea rows={4} value={revisionNote} onChange={e => setRevisionNote(e.target.value)}
                placeholder={`Describe what needs changing…\n\nE.g. "Week 2 hook is too aggressive, make it more conversational. The newsletter subject line doesn't grab attention."`}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400 resize-none" />
              <div className="flex gap-3">
                <button onClick={onReject} disabled={saving}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  Send Revision Request
                </button>
                <button onClick={() => { setShowRevision(false); setRevisionNote(''); setRevisionTarget(''); }}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onApprove} disabled={saving}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                Approve & Proceed
              </button>
              <button onClick={() => setShowRevision(true)}
                className="flex-1 py-3 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                <MessageSquare className="w-4 h-4" /> Request Revisions
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status banners */}
      {status === 'approved' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800 font-medium">Content approved! Our team will deliver it shortly.</p>
        </div>
      )}
      {status === 'delivered' && (
        <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <p className="text-sm text-gray-700 font-medium">Content delivered. Check your email.</p>
        </div>
      )}
      {status === 'revision_requested' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-orange-500 flex-shrink-0" />
          <p className="text-sm text-orange-800">Revision requested. Our team will update the content and send a new draft.</p>
        </div>
      )}
    </div>
  );
}

// ── LinkedIn post card preview ────────────────────────────────────────────────

function LinkedInPostCard({ post, companyName }) {
  const [expanded, setExpanded] = useState(false);
  const initial = (companyName || 'C')[0].toUpperCase();

  const bodyText = post.body || '';
  const LIMIT = 300;
  const isLong = bodyText.length > LIMIT;
  const displayBody = isLong && !expanded ? bodyText.slice(0, LIMIT) : bodyText;

  return (
    <div className="border border-[#e0dfdd] rounded-xl overflow-hidden bg-white max-w-[560px] mx-auto shadow-sm">
      {/* Profile row */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 select-none">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-gray-900 leading-tight">{companyName || 'Your Company'}</p>
            <p className="text-xs text-gray-500 leading-snug mt-0.5">Followers · Company</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-gray-400">Just now ·</span>
              <Globe className="w-3 h-3 text-gray-400" />
            </div>
          </div>
          <button className="text-[#0a66c2] text-sm font-semibold px-3 py-1 rounded-full border border-[#0a66c2] hover:bg-blue-50 transition-colors flex-shrink-0">
            + Follow
          </button>
        </div>

        {/* Post content */}
        <div className="text-[14px] text-gray-800 leading-snug">
          {post.hookLine && (
            <p className="font-bold mb-2 text-[15px]">{post.hookLine}</p>
          )}
          <p className="whitespace-pre-wrap leading-relaxed">
            {displayBody}
            {isLong && !expanded && '...'}
          </p>
          {post.cta && (
            <p className="mt-2 text-gray-700">{post.cta}</p>
          )}
          {isLong && (
            <button
              onClick={() => setExpanded(p => !p)}
              className="text-gray-500 font-semibold hover:text-gray-700 ml-1 text-sm"
            >
              {expanded ? 'see less' : 'see more'}
            </button>
          )}
        </div>

        {/* Hashtags */}
        {post.hashtags?.length > 0 && (
          <p className="mt-2 text-[13px] text-[#0a66c2]">
            {post.hashtags.map(h => `#${h.replace(/^#/, '')}`).join(' ')}
          </p>
        )}

        {/* Post image */}
        {post.imageUrl && (
          <div className="mt-3 flex justify-center">
            <img src={post.imageUrl} alt=""
              className="rounded-xl object-cover max-h-56 w-4/5 border border-[#e0dfdd]" />
          </div>
        )}
        {post.characterCount > 0 && (
          <p className="mt-1 text-xs text-gray-400">{post.characterCount} characters</p>
        )}
      </div>

      {/* Engagement summary */}
      <div className="px-4 py-1.5 flex items-center justify-between text-xs text-gray-500 border-t border-[#e0dfdd]">
        <span className="flex items-center gap-1">
          <span className="inline-flex -space-x-0.5">
            <span className="w-4 h-4 rounded-full bg-[#0a66c2] text-[9px] flex items-center justify-center text-white">👍</span>
            <span className="w-4 h-4 rounded-full bg-red-500 text-[9px] flex items-center justify-center text-white">♥</span>
          </span>
          <span className="ml-1">124</span>
        </span>
        <span>23 comments · 8 reposts</span>
      </div>

      {/* Action bar */}
      <div className="flex border-t border-[#e0dfdd]">
        {[
          { emoji: '👍', label: 'Like' },
          { emoji: '💬', label: 'Comment' },
          { emoji: '🔄', label: 'Repost' },
          { emoji: '↗', label: 'Send' },
        ].map(({ emoji, label }) => (
          <button key={label} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Beehiiv newsletter preview ────────────────────────────────────────────────

function BeehiivNewsletterPreview({ newsletter, companyName }) {
  return (
    <div className="max-w-[600px] mx-auto rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Email client header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 space-y-1.5">
        <div className="flex items-start gap-2 text-sm">
          <span className="text-gray-400 w-16 flex-shrink-0 text-xs font-medium pt-0.5">From</span>
          <span className="text-gray-700 text-xs">{companyName || 'Your Newsletter'} &lt;newsletter@yourdomain.beehiiv.com&gt;</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-400 w-16 flex-shrink-0 text-xs font-medium pt-0.5">Subject</span>
          <span className="text-sm font-semibold text-gray-900">{newsletter.subjectLine || 'Newsletter'}</span>
        </div>
        {newsletter.previewText && (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 w-16 flex-shrink-0 text-xs font-medium pt-0.5">Preview</span>
            <span className="text-xs text-gray-500 italic">{newsletter.previewText}</span>
          </div>
        )}
      </div>

      {/* Email body */}
      <div className="bg-white px-8 py-6">
        {/* Beehiiv-style newsletter header */}
        <div className="text-center mb-6 pb-5 border-b border-gray-100">
          <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-full px-3 py-1 mb-3">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-xs font-semibold text-orange-700 tracking-wide">beehiiv</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{companyName || 'Your Newsletter'}</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Monthly Edition</p>
        </div>

        {/* Newsletter body — image injected at the midpoint if provided */}
        {(() => {
          const paras = newsletter.body?.split('\n') || [];
          const mid   = Math.ceil(paras.length / 2);
          const renderParas = (list, keyPrefix) => list.map((para, i) =>
            para.trim()
              ? <p key={`${keyPrefix}${i}`}>{para}</p>
              : <div key={`${keyPrefix}${i}`} className="h-2" />
          );
          return (
            <div className="text-sm text-gray-700 leading-7 max-h-80 overflow-y-auto space-y-3 pr-1">
              {renderParas(newsletter.imageUrl ? paras.slice(0, mid) : paras, 'a')}
              {newsletter.imageUrl && (
                <div className="flex justify-center my-4">
                  <img src={newsletter.imageUrl} alt=""
                    className="rounded-xl object-cover max-h-44 w-3/4 border border-gray-100" />
                </div>
              )}
              {newsletter.imageUrl && renderParas(paras.slice(mid), 'b')}
            </div>
          );
        })()}
        {newsletter.wordCount > 0 && (
          <p className="mt-3 text-xs text-gray-400">{newsletter.wordCount} words</p>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Sent via <span className="font-semibold text-gray-600">beehiiv</span>
            {' · '}
            <span className="underline cursor-default">Unsubscribe</span>
            {' · '}
            <span className="underline cursor-default">View in browser</span>
          </p>
        </div>
      </div>
    </div>
  );
}
