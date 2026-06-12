'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Check, CheckCircle, Star, Clock, Users, DollarSign,
  ChevronDown, ChevronUp, Shield, Zap,
  Loader2, Award, ChevronRight, Package, Flag, Scale,
  Phone, RefreshCw, Wrench, Lock, Sparkles, Pencil, X,
} from 'lucide-react';
import { fetchProjectBySlug, fetchProjectPricing, purchaseCatalogProject, fetchProjectExperts } from '@/lib/catalogApi';
import { submitNegotiation, getMyNegotiation } from '@/lib/negotiationApi';
import { checkUserPlanAccess } from '@/services/planService';

// UI-only theme per tierId — no prices here
const TIER_THEME = {
  credit:   { badge: 'bg-gray-100 text-gray-700 border-gray-200',      checkBg: 'bg-gray-600',    accent: 'text-gray-700',   upgradeBg: 'bg-gray-50 border-gray-200' },
  bronze:   { badge: 'bg-orange-100 text-orange-700 border-orange-200', checkBg: 'bg-orange-500',  accent: 'text-orange-700', upgradeBg: 'bg-orange-50 border-orange-200' },
  silver:   { badge: 'bg-blue-100 text-blue-700 border-blue-200',       checkBg: 'bg-blue-600',    accent: 'text-blue-700',   upgradeBg: 'bg-blue-50 border-blue-200' },
  gold:     { badge: 'bg-amber-100 text-amber-700 border-amber-200',    checkBg: 'bg-amber-500',   accent: 'text-amber-700',  upgradeBg: 'bg-amber-50 border-amber-200' },
  platform: { badge: 'bg-violet-100 text-violet-700 border-violet-200', checkBg: 'bg-violet-600',  accent: 'text-violet-700', upgradeBg: 'bg-violet-50 border-violet-200' },
};

const NEXT_TIER_MAP = { credit: 'Bronze', bronze: 'Silver', silver: 'Gold', gold: null, platform: null };

// Feature key → deliverable label+desc for the checklist
const ALL_TIER_DELIVERABLES = [
  { key: 'crmExport',             label: 'Verified contact list (CSV / CRM format)',           desc: 'Clean, export-ready data for any CRM or outreach tool' },
  { key: 'linkedinProfiles',      label: 'Decision-maker profiles with titles & LinkedIn',      desc: 'Reach the exact right person in every organisation' },
  { key: 'emailVerified',         label: 'Email verification & deliverability check',           desc: '98%+ inbox placement — zero bounce guarantee' },
  { key: 'companyIntelligence',   label: 'Company intelligence (size, revenue, tech stack)',    desc: 'Deep insights for hyper-targeted outreach' },
  { key: 'decisionMakerProfiles', label: 'Custom outreach sequence templates (3 variants)',    desc: 'Battle-tested email scripts personalised to your ICP' },
  { key: 'icpScoring',            label: 'ICP score & fit rating for each contact',             desc: 'AI-powered lead scoring so you focus on top prospects only' },
  { key: 'intentData',            label: 'Revenue intelligence & buying intent signals',        desc: 'Know exactly who is in active buying mode right now' },
  { key: 'dedicatedPM',           label: 'Dedicated account manager',                           desc: 'A single human point of contact who owns your results' },
  { key: 'abTesting',             label: 'A/B testing setup & weekly optimisation reports',     desc: 'Continuous improvement driven by real performance data' },
];

const PHASE_COLORS = [
  { color: 'from-blue-600 to-blue-700',    bgLight: 'bg-blue-50',   border: 'border-blue-200',   textColor: 'text-blue-700' },
  { color: 'from-violet-600 to-purple-700', bgLight: 'bg-violet-50', border: 'border-violet-200', textColor: 'text-violet-700' },
  { color: 'from-orange-500 to-orange-600', bgLight: 'bg-orange-50', border: 'border-orange-200', textColor: 'text-orange-700' },
  { color: 'from-green-600 to-emerald-600', bgLight: 'bg-green-50',  border: 'border-green-200',  textColor: 'text-green-700' },
  { color: 'from-rose-600 to-pink-600',     bgLight: 'bg-rose-50',   border: 'border-rose-200',   textColor: 'text-rose-700' },
];

export default function ProjectOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params?.projectId;
  const tierParam = searchParams.get('tier') || 'silver';
  const modeParam = searchParams.get('mode') || 'agency';

  const [project, setProject]           = useState(null);
  const [pricingTiers, setPricingTiers] = useState([]);
  const [loadingProject, setLoading]    = useState(true);
  const [selectedTier, setSelectedTier] = useState(null);
  const [projectExperts, setProjectExperts] = useState([]);
  const [myNegotiation, setMyNegotiation]         = useState(null);
  const [editMode, setEditMode]                   = useState(false);
  const [deliverableEdits, setDeliverableEdits]   = useState({}); // { originalKey: customText }
  const [activeEditKey, setActiveEditKey]         = useState(null);
  const [editInputText, setEditInputText]         = useState('');
  const [submittingNeg, setSubmittingNeg]         = useState(false);
  const [negError, setNegError]                   = useState('');
  const [accepting, setAccepting]                 = useState(false);
  const [accepted, setAccepted]                   = useState(false);
  const [showContactForm, setShowContactForm]     = useState(false);
  const [contactForm, setContactForm]             = useState({ name: '', phone: '', preferredTime: 'morning', note: '' });
  const [submittingContact, setSubmittingContact] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      fetchProjectBySlug(projectId),
      fetchProjectPricing(projectId),
      fetchProjectExperts(projectId).catch(() => []),
    ])
      .then(([p, tiers, experts]) => {
        setProject(p);
        setPricingTiers(tiers || []);
        setProjectExperts(experts || []);
        if (tiers?.length > 0) {
          const match = tiers.find(t => t.tierId === tierParam) || tiers.find(t => t.popular) || tiers[0];
          setSelectedTier(match);
        }
        // Fetch any existing negotiation for this user+project
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          getMyNegotiation(p.slug).then(setMyNegotiation).catch(() => {});
        }
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Project not found</p>
          <Link href="/project-marketplace" className="text-blue-600 hover:underline">← Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  const handleAccept = async () => {
    setAccepting(true);

    const tierId = selectedTier?.tierId || tierParam;

    //1. Check if user has an active plan before allowing purchase
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        router.push('/login');
        return;
      }
      const planCheck = await checkUserPlanAccess(token);
      if (!planCheck.hasActivePlan) {
        setAccepting(false);
        router.push('/settings?section=upgrade');
        return;
      }
    } catch {
      // If plan check fails (network error), still allow purchase attempt
    }

    // 2. Call backend to persist the purchase
    try {
      await purchaseCatalogProject(project.slug, tierId);
    } catch {
      // Backend unavailable — fall back to localStorage so the user still sees the project
      try {
        const existing = JSON.parse(localStorage.getItem('myProjects') || '[]');
        const alreadySaved = existing.some(p => p.slug === project.slug && p.tierId === tierId);
        if (!alreadySaved) {
          existing.push({
            slug:        project.slug,
            title:       project.title,
            tagline:     project.tagline || project.description || '',
            tierId,
            tierName:    selectedTier?.name || tierId,
            priceLabel:  selectedTier?.priceLabel || '',
            purchasedAt: new Date().toISOString(),
          });
          localStorage.setItem('myProjects', JSON.stringify(existing));
        }
      } catch { /* ignore */ }
    }

    setAccepting(false);
    setAccepted(true);
  };

  const editCount = Object.keys(deliverableEdits).length;

  const handleToggleEditMode = () => {
    setEditMode(prev => !prev);
    setActiveEditKey(null);
    setDeliverableEdits({});
    setEditInputText('');
    setNegError('');
  };

  const applyCustomText = (originalKey, text) => {
    if (!text.trim()) return;
    setDeliverableEdits(prev => ({ ...prev, [originalKey]: text.trim() }));
    setActiveEditKey(null);
    setEditInputText('');
  };

  const undoSwap = (originalKey) => {
    setDeliverableEdits(prev => {
      const next = { ...prev };
      delete next[originalKey];
      return next;
    });
  };

  const handleNegotiate = async () => {
    if (!selectedTier || editCount === 0) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    setSubmittingNeg(true);
    setNegError('');
    try {
      const tierKeys = ALL_TIER_DELIVERABLES
        .filter(d => selectedTier.features?.[d.key])
        .map(d => d.key);
      // Apply swaps: replace each edited key with its chosen replacement
      const modifiedDeliverables = tierKeys.map(k => deliverableEdits[k] || k);
      const result = await submitNegotiation({
        projectSlug: project.slug,
        tierId: selectedTier.tierId,
        originalDeliverables: tierKeys,
        modifiedDeliverables,
        userNote: '',
      });
      setMyNegotiation(result.data.negotiation);
      setEditMode(false);
      setDeliverableEdits({});
    } catch (err) {
      if (err.status === 409) {
        setMyNegotiation(err.data?.negotiation || { status: 'pending' });
        setEditMode(false);
      } else if (err.status === 401) {
        router.push('/login');
      } else {
        setNegError('Failed to submit. Please try again.');
      }
    } finally {
      setSubmittingNeg(false);
    }
  };

  // ── Contact form — shown when user clicks "Pay Now" ─────────────────────────
  if (showContactForm && !accepted) {
    const handleContactSubmit = async (e) => {
      e.preventDefault();
      if (!contactForm.name.trim() || !contactForm.phone.trim()) return;
      setSubmittingContact(true);
      await handleAccept();
      setSubmittingContact(false);
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-orange-500 px-8 py-6 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold">Get a Personalised Plan</h2>
            <p className="text-sm text-white/80 mt-1">
              We'll review your requirements and reach out within <strong className="text-white">2–3 hours</strong> with the best possible offer for you.
            </p>
          </div>

          {/* Selected plan pill */}
          {selectedTier && (
            <div className="px-8 pt-5">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 w-fit">
                <Package className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">{project?.title} — {selectedTier.name || selectedTier.tierId} plan selected</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleContactSubmit} className="px-8 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input
                value={contactForm.name}
                onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your full name"
                required
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
              <input
                value={contactForm.phone}
                onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                required
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Best time to call</label>
              <select
                value={contactForm.preferredTime}
                onChange={e => setContactForm(f => ({ ...f, preferredTime: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 bg-white"
              >
                <option value="morning">Morning (9 AM – 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM – 4 PM)</option>
                <option value="evening">Evening (4 PM – 7 PM)</option>
                <option value="anytime">Anytime works for me</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Anything specific you'd like? <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                rows={3}
                value={contactForm.note}
                onChange={e => setContactForm(f => ({ ...f, note: e.target.value }))}
                placeholder="E.g. budget range, timeline, special requirements…"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowContactForm(false)}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={submittingContact || accepting || !contactForm.name.trim() || !contactForm.phone.trim()}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
              >
                {(submittingContact || accepting) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {(submittingContact || accepting) ? 'Submitting…' : 'Get My Personalised Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── Success screen — shown after form is submitted ────────────────────────────
  if (accepted) {
    const isContentProject = projectId === 'brand-voice-social';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">We've Got Your Request!</h2>
          <p className="text-gray-600 mb-6">
            Our team is reviewing your requirements and will reach out within{' '}
            <strong className="text-gray-900">2–3 hours</strong> with a personalised plan crafted just for you.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left space-y-2">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">What happens next</p>
            {[
              'Personal call from our team within 2–3 hours',
              'Custom pricing & plan tailored to your needs',
              `Immediate kickoff on your go-ahead${isContentProject ? ' — start your brand brief right away' : ''}`,
            ].map(s => (
              <div key={s} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">{s}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {isContentProject && (
              <button
                onClick={() => router.push('/business-dashboard/my-projects/brand-voice-social')}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-orange-600 transition-all"
              >
                Start Your Brief in the Meantime →
              </button>
            )}
            <button
              onClick={() => router.push('/business-dashboard')}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                isContentProject
                  ? 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  : 'bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold hover:from-blue-700 hover:to-orange-600'
              }`}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // milestones has {label, description} — the structured phase data for this section
  const howItWorks = (project.milestones || []).map(m => ({
    title: m.label,
    description: m.description,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href={`/project-marketplace/${projectId}`}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Project
          </Link>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/project-marketplace" className="hover:text-blue-600">Marketplace</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/project-marketplace/${projectId}`} className="hover:text-blue-600 truncate max-w-[120px]">
              {project.title}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">Overview</span>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            {project.stats?.completedCount > 0 && (
              <span className="font-semibold text-blue-700">{project.stats.completedCount}+ projects completed</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero banner */}
        <div className={`bg-gradient-to-r ${project.gradient} rounded-2xl p-6 md:p-8 mb-8 text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Project Overview
                </span>
                {project.trending && (
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">Trending</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{project.title}</h1>
              <p className="text-white/80 mt-1 text-sm max-w-xl">{project.tagline}</p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {project.stats?.avgRating > 0 && (
                  <span className="flex items-center gap-1 text-sm text-white/90">
                    <Star className="w-4 h-4 fill-current text-amber-300" /> {project.stats.avgRating} rating
                  </span>
                )}
                {project.stats?.expertCount > 0 && (
                  <span className="flex items-center gap-1 text-sm text-white/90">
                    <Users className="w-4 h-4" /> {project.stats.expertCount} experts
                  </span>
                )}
                {project.duration && (
                  <span className="flex items-center gap-1 text-sm text-white/90">
                    <Clock className="w-4 h-4" /> {project.duration}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── LEFT: Main content ────────────────────────────────── */}
          <div className="flex-1 space-y-6">

            {/* Tier-aware Deliverables */}
            {(() => {
              const effectiveTier = modeParam === 'platform' ? 'platform' : tierParam;
              const theme = TIER_THEME[effectiveTier] || TIER_THEME.silver;
              const tierData = pricingTiers.find(t => t.tierId === effectiveTier);
              const nextTier = NEXT_TIER_MAP[effectiveTier];
              // Compute included deliverables from DB features (always tier-based)
              const hasApprovedNeg = myNegotiation?.status === 'approved';
              const includedCount = tierData
                ? ALL_TIER_DELIVERABLES.filter(d => tierData.features?.[d.key]).length
                : ALL_TIER_DELIVERABLES.length;
              const lockedCount = ALL_TIER_DELIVERABLES.length - includedCount;

              // Build a map of approved swaps: { originalKey: customText }
              // Positionally compare original vs modified arrays to find what changed
              const approvedSwaps = {};
              if (hasApprovedNeg) {
                (myNegotiation.originalDeliverables || []).forEach((origKey, idx) => {
                  const modVal = (myNegotiation.modifiedDeliverables || [])[idx];
                  if (modVal && modVal !== origKey) {
                    approvedSwaps[origKey] = modVal;
                  }
                });
              }
              // Output quantity from DB
              const contactsVal = tierData?.contacts;
              const outputLabel = contactsVal == null
                ? null
                : contactsVal === 0
                ? 'Unlimited contacts'
                : `${contactsVal.toLocaleString('en-IN')} contacts`;
              return (
                <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  editMode && !myNegotiation ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'
                }`}>
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" /> What You'll Get
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Deliverables in your{' '}
                        <span className={`font-semibold ${theme.accent}`}>
                          {effectiveTier === 'platform' ? 'Platform Managed' : `${effectiveTier.charAt(0).toUpperCase() + effectiveTier.slice(1)}`} plan
                        </span>
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex-shrink-0 ${theme.badge}`}>
                      {includedCount} of {ALL_TIER_DELIVERABLES.length} included
                    </span>
                  </div>

                  {/* Approved negotiation banner */}
                  {hasApprovedNeg && Object.keys(approvedSwaps).length > 0 && (
                    <div className="mx-6 mt-5 flex items-center gap-3 px-4 py-3 rounded-xl border bg-green-50 border-green-200">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <p className="text-sm font-semibold text-green-800">
                        {Object.keys(approvedSwaps).length} deliverable{Object.keys(approvedSwaps).length > 1 ? 's' : ''} customised for your account
                      </p>
                    </div>
                  )}

                  {/* Output quantity banner */}
                  {outputLabel && (
                    <div className={`mx-6 mt-5 flex items-center gap-3 px-4 py-3 rounded-xl border ${theme.upgradeBg}`}>
                      <Zap className={`w-4 h-4 flex-shrink-0 ${theme.accent}`} />
                      <p className={`text-sm font-semibold ${theme.accent}`}>
                        Output: <span className="font-bold">{outputLabel}</span>
                      </p>
                    </div>
                  )}

                  {/* Edit mode banner */}
                  {editMode && !myNegotiation && !hasApprovedNeg && (
                    <div className="mx-6 mt-5 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border bg-blue-50 border-blue-200">
                      <div className="flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <p className="text-sm font-semibold text-blue-800">Click pencil to swap — max 3 changes</p>
                      </div>
                      <span className="text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded-full">{editCount}/3</span>
                    </div>
                  )}

                  {/* Deliverable list */}
                  <div className="p-6 space-y-2">
                    {ALL_TIER_DELIVERABLES.map((item, i) => {
                      // Always based on tier — negotiation never changes who's included/locked
                      const isIncluded = tierData ? !!tierData.features?.[item.key] : i < includedCount;
                      // If this key was approved-swapped, show the custom label instead
                      const approvedCustomText = approvedSwaps[item.key] || null;

                      const customText    = deliverableEdits[item.key];
                      const hasSwap      = !!customText;
                      const isActiveEdit = activeEditKey === item.key;
                      const canEdit      = editMode && isIncluded && !myNegotiation && (editCount < 3 || hasSwap);

                      return (
                        <div key={item.key}>
                          <div className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                            hasSwap      ? 'bg-amber-50 border-amber-200' :
                            isActiveEdit ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100' :
                            isIncluded   ? (editMode ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-100 hover:border-green-200 hover:shadow-sm') :
                                           'bg-gray-50 border-gray-100 opacity-55'
                          }`}>
                            {/* Status dot */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              hasSwap    ? 'bg-amber-500' :
                              isIncluded ? theme.checkBg : 'bg-gray-200'
                            }`}>
                              {isIncluded || hasSwap
                                ? <Check className="w-3.5 h-3.5 text-white" />
                                : <Lock className="w-3 h-3 text-gray-400" />}
                            </div>

                            {/* Label */}
                            <div className="flex-1 min-w-0">
                              {hasSwap ? (
                                // Edit-mode pending swap (before submission)
                                <>
                                  <p className="text-xs text-gray-400 line-through leading-tight">{item.label}</p>
                                  <p className="text-sm font-semibold text-amber-800 mt-0.5 flex items-center gap-1">
                                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />{customText}
                                  </p>
                                  <p className="text-xs text-amber-600 mt-0.5">Custom deliverable requested</p>
                                </>
                              ) : approvedCustomText ? (
                                // Approved negotiation — show custom text, original crossed out
                                <>
                                  <p className="text-xs text-gray-400 line-through leading-tight">{item.label}</p>
                                  <p className="text-sm font-semibold text-green-800 mt-0.5">{approvedCustomText}</p>
                                  <span className="inline-block text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-1.5 py-0.5 rounded-full mt-1">
                                    Customised
                                  </span>
                                </>
                              ) : (
                                // Normal display
                                <>
                                  <p className={`text-sm font-semibold ${isIncluded ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</p>
                                  <p className={`text-xs mt-0.5 leading-relaxed ${isIncluded ? 'text-gray-500' : 'text-gray-400'}`}>{item.desc}</p>
                                </>
                              )}
                            </div>

                            {/* Edit / undo button */}
                            {canEdit && (
                              hasSwap ? (
                                <button
                                  onClick={() => undoSwap(item.key)}
                                  className="flex-shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200 transition-colors"
                                  title="Undo swap"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setActiveEditKey(isActiveEdit ? null : item.key)}
                                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                                    isActiveEdit ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                  }`}
                                  title="Swap this deliverable"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              )
                            )}

                            {!isIncluded && nextTier && !editMode && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex-shrink-0 whitespace-nowrap self-start mt-0.5">
                                Unlock in {nextTier}
                              </span>
                            )}
                          </div>

                          {/* Inline text input for custom deliverable */}
                          {isActiveEdit && (
                            <div className="ml-9 mt-1.5 bg-white border border-blue-200 rounded-xl shadow-md overflow-hidden">
                              <p className="text-xs font-semibold text-blue-700 px-3 py-2 bg-blue-50 border-b border-blue-100">
                                Describe your custom deliverable:
                              </p>
                              <div className="p-3 space-y-2">
                                <textarea
                                  autoFocus
                                  value={editInputText}
                                  onChange={e => setEditInputText(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      applyCustomText(item.key, editInputText);
                                    }
                                  }}
                                  rows={2}
                                  maxLength={200}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                  placeholder="e.g., Competitor analysis report with pricing benchmarks"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => applyCustomText(item.key, editInputText)}
                                    disabled={!editInputText.trim()}
                                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                  >
                                    Apply
                                  </button>
                                  <button
                                    onClick={() => { setActiveEditKey(null); setEditInputText(''); }}
                                    className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Upsell banner */}
                  {nextTier && (
                    <div className="mx-6 mb-6 p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl border border-blue-100 flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Unlock {lockedCount} more deliverables</p>
                        <p className="text-xs text-gray-500 mt-0.5">Upgrade to <strong>{nextTier}</strong> for deeper data & better results</p>
                      </div>
                      <Link
                        href={`/project-marketplace/${projectId}?tier=${nextTier.toLowerCase()}&mode=${modeParam}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap transition-colors"
                      >
                        Upgrade →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* What's Included — Sub-projects / service modules */}
            {project.subProjects?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" /> What's Included
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">Services & modules covered in this project</p>
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    {project.subProjects.length} modules
                  </span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.subProjects.map((sub, i) => (
                      <div
                        key={sub}
                        className={`group flex items-center gap-3 p-4 ${project.bgLight} border ${project.borderColor} rounded-xl hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-default`}
                      >
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${project.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow`}>
                          {i + 1}
                        </div>
                        <span className={`text-sm font-semibold ${project.textColor} leading-tight`}>{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Expert Skills */}
            {project.expertSkills?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" /> Your Dedicated Team
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">Expert skills deployed on your project</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {project.expertSkills.map((skill, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${project.bgLight} ${project.textColor} border ${project.borderColor}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">+ Dedicated Project Manager</p>
                      <p className="text-xs text-gray-400">Assigned after acceptance · Oversees entire delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* How It Works / Milestones */}
            {howItWorks.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <Flag className="w-5 h-5 text-blue-600" /> How It Works
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">Your project journey from kickoff to completion</p>
                    </div>
                    {project.duration && (
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Duration</p>
                        <p className="text-sm font-bold text-gray-900">{project.duration}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 mt-4">
                    {howItWorks.map((_, idx) => {
                      const c = PHASE_COLORS[idx % PHASE_COLORS.length];
                      return (
                        <div key={idx} className="flex-1">
                          <div className={`h-1.5 rounded-full bg-gradient-to-r ${c.color}`} />
                          <p className="text-xs text-gray-400 mt-1 text-center hidden sm:block">Step {idx + 1}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {howItWorks.map((step, idx) => {
                    const c = PHASE_COLORS[idx % PHASE_COLORS.length];
                    return (
                      <div key={idx}>
                        <div className={`flex items-center gap-4 px-6 py-4 ${c.bgLight} border-b ${c.border}`}>
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                            <span className="text-white font-black text-sm">{String(idx + 1).padStart(2, '0')}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-xs font-black uppercase tracking-widest ${c.textColor}`}>
                              Phase {String(idx + 1).padStart(2, '0')}
                            </span>
                            <h3 className="font-bold text-gray-900 text-base leading-tight mt-0.5">{step.title}</h3>
                          </div>
                        </div>
                        <div className="px-6 py-5">
                          <p className="text-sm text-gray-700 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-orange-500 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-white flex-shrink-0" />
                    <p className="text-sm font-semibold text-white">Every milestone is tracked & reported to you in real time</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white">30-day money-back guarantee</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tools & Tech Stack */}
            {project.tools?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-blue-600" /> Tools & Technology
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">Tech stack used to deliver this project</p>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Experts who've done this */}
            {projectExperts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" /> Experts Who've Done This
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Verified experts with hands-on experience in this type of work
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  {projectExperts.map((expert) => (
                    <div
                      key={expert.expertProfileId}
                      className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all"
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                        {expert.avatar
                          ? <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                          : expert.name?.charAt(0)?.toUpperCase() || 'E'
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm">{expert.name}</p>
                          {expert.isVerified && (
                            <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{expert.headline}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {expert.rating > 0 && (
                            <span className="flex items-center gap-1 text-xs text-amber-600">
                              <Star className="w-3 h-3 fill-current" />
                              {expert.rating.toFixed(1)}
                              {expert.totalReviews > 0 && (
                                <span className="text-gray-400">({expert.totalReviews})</span>
                              )}
                            </span>
                          )}
                          {expert.city && (
                            <span className="text-xs text-gray-400">{expert.city}</span>
                          )}
                          {expert.availability === 'available' && (
                            <span className="text-xs text-green-600 font-medium">Available</span>
                          )}
                        </div>
                        {expert.contribution && (
                          <p className="text-xs text-blue-600 mt-1 italic">"{expert.contribution}"</p>
                        )}
                      </div>

                      {/* Hire button */}
                      <Link
                        href={`/expert-profile/${expert.expertProfileId}/hire`}
                        className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white text-xs font-bold rounded-xl hover:from-blue-700 hover:to-orange-600 transition-all shadow-sm"
                      >
                        Hire
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT: Action panel ───────────────────────── */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="space-y-4">

              {/* Pricing Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${project.gradient} px-5 py-5 text-white`}>
                  <p className="text-xs text-white/70 mb-1 uppercase tracking-wide font-semibold">
                    {modeParam === 'platform' ? 'Platform Managed' : `${tierParam.charAt(0).toUpperCase() + tierParam.slice(1)} Plan`}
                  </p>
                  <p className="text-3xl font-bold">
                    {selectedTier
                      ? selectedTier.priceLabel
                      : modeParam === 'platform'
                      ? 'Custom Quote'
                      : project.budgetRange}
                  </p>
                  <p className="text-xs text-white/70 mt-1.5 flex items-center gap-1.5">
                    {modeParam === 'platform'
                      ? '✦ All-inclusive · Managed by Karya-AI'
                      : modeParam === 'agency'
                      ? '🏢 Via vetted agency'
                      : '👤 Direct expert hire'}
                  </p>
                  <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-white/80">
                    <span>{project.duration}</span>
                    <span>·</span>
                    <span>
                      {selectedTier?.contacts != null
                        ? selectedTier.contacts === 0 ? 'Unlimited' : `${selectedTier.contacts.toLocaleString('en-IN')} contacts`
                        : project.difficulty}
                    </span>
                    <span>·</span>
                    <span>{project.difficulty}</span>
                  </div>
                </div>

                {/* Selected tier features from DB */}
                {selectedTier?.features && (
                  <div className="px-5 py-3 border-t border-gray-100 mt-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Included in {selectedTier.name}
                    </p>
                    <div className="space-y-1.5">
                      {ALL_TIER_DELIVERABLES.filter(d => selectedTier.features[d.key]).slice(0, 6).map((d) => (
                        <div key={d.key} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600">{d.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project meta */}
                {!selectedTier && (
                  <div className="px-5 py-4 space-y-2 border-t border-gray-100">
                    {[
                      ['Project', project.title],
                      ['Duration', project.duration],
                      ['Difficulty', project.difficulty],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium text-gray-900">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-5 pb-5 pt-3 space-y-3">
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    <DollarSign className="w-4 h-4" /> Pay Now
                  </button>

                  {myNegotiation ? (
                    <div className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border ${
                      myNegotiation.status === 'approved'  ? 'bg-green-50 border-green-200 text-green-700' :
                      myNegotiation.status === 'rejected'  ? 'bg-red-50 border-red-200 text-red-600' :
                                                             'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      {myNegotiation.status === 'approved' && <><CheckCircle className="w-4 h-4" /> Custom Package Approved</>}
                      {myNegotiation.status === 'rejected' && <><Scale className="w-4 h-4" /> Negotiation Not Approved</>}
                      {myNegotiation.status === 'pending'  && <><Scale className="w-4 h-4" /> Negotiation Under Review</>}
                    </div>
                  ) : editMode ? (
                    <div className="space-y-2">
                      {negError && <p className="text-xs text-red-600 text-center font-medium">{negError}</p>}
                      <button
                        onClick={handleNegotiate}
                        disabled={submittingNeg || editCount === 0}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {submittingNeg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
                        {submittingNeg ? 'Submitting…' : editCount > 0 ? `Submit ${editCount} Change${editCount > 1 ? 's' : ''}` : 'No Changes Yet'}
                      </button>
                      <button
                        onClick={handleToggleEditMode}
                        className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Cancel editing
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleToggleEditMode}
                      className="w-full py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Scale className="w-4 h-4" /> Customise Deliverables
                    </button>
                  )}
                </div>
              </div>

              {/* Trust signals */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Why Karya-AI</p>
                {[
                  { icon: Shield,    text: '30-day money-back guarantee', color: 'text-green-600' },
                  { icon: Award,     text: 'All experts vetted & verified', color: 'text-blue-600' },
                  { icon: RefreshCw, text: 'Free revisions until satisfied', color: 'text-orange-600' },
                  { icon: Zap,       text: 'Dedicated support 7 days/week', color: 'text-violet-600' },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                    <span className="text-xs text-gray-700">{text}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
