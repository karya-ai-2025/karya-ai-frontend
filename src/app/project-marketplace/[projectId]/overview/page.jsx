'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Check, CheckCircle, Star, Clock, Users, DollarSign,
  ChevronDown, ChevronUp, Send, Rocket, Shield, Zap,
  Loader2, Award, ChevronRight, Package, Flag, Scale,
  Phone, RefreshCw, Wrench,
} from 'lucide-react';
import { fetchProjectBySlug } from '@/lib/catalogApi';

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
  const projectId = params?.projectId;

  const [project, setProject]           = useState(null);
  const [loadingProject, setLoading]    = useState(true);
  const [selectedTier, setSelectedTier] = useState(null);
  const [negotiateOpen, setNegotiateOpen]   = useState(false);
  const [negotiateMsg, setNegotiateMsg]     = useState('');
  const [negotiateSent, setNegotiateSent]   = useState(false);
  const [counterOffer, setCounterOffer]     = useState('');
  const [activeNegTab, setActiveNegTab]     = useState('message');
  const [accepting, setAccepting]       = useState(false);
  const [accepted, setAccepted]         = useState(false);

  useEffect(() => {
    if (!projectId) return;
    fetchProjectBySlug(projectId)
      .then(p => {
        setProject(p);
        if (p.pricingTiers?.length > 0) {
          setSelectedTier(p.pricingTiers.find(t => t.isPopular) || p.pricingTiers[0]);
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
    await new Promise(r => setTimeout(r, 1200));
    setAccepting(false);
    setAccepted(true);
  };

  const handleNegotiate = () => {
    if (!negotiateMsg && !counterOffer) return;
    setNegotiateSent(true);
    setTimeout(() => {
      setNegotiateOpen(false);
      setNegotiateSent(false);
      setNegotiateMsg('');
      setCounterOffer('');
    }, 2500);
  };

  if (accepted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Accepted!</h2>
          <p className="text-gray-600 mb-6">
            Your project has been confirmed. A dedicated manager will reach out within <strong>2 business hours</strong> to kick things off.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left space-y-2">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">What happens next</p>
            {[
              "You'll receive a confirmation email shortly",
              'Team onboarding call scheduled within 24 hrs',
              'Access to your project dashboard in 48 hrs',
            ].map(s => (
              <div key={s} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">{s}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push('/business-dashboard')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-orange-600 transition-all"
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  const howItWorks   = project.howItWorks   || [];
  const pricingTiers = project.pricingTiers  || [];

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
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 min-w-[180px] text-center border border-white/20">
              <p className="text-xs text-white/70 mb-1">Investment Range</p>
              <p className="text-2xl font-bold">{project.budgetRange}</p>
              {selectedTier && (
                <p className="text-xs text-white/60 mt-1">{selectedTier.name} plan selected</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── LEFT: Main content ────────────────────────────────── */}
          <div className="flex-1 space-y-6">

            {/* Deliverables */}
            {project.deliverables?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" /> What You'll Get
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">Deliverables included in this project package</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.deliverables.map((d, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-800">{d}</p>
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

          </div>

          {/* ── RIGHT: Sticky action panel ───────────────────────── */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-4">

              {/* Pricing Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${project.gradient} px-5 py-4 text-white`}>
                  <p className="text-xs text-white/70 mb-1 uppercase tracking-wide font-semibold">
                    {pricingTiers.length > 0 ? 'Choose Your Plan' : 'Investment Range'}
                  </p>
                  <p className="text-3xl font-bold">
                    {selectedTier
                      ? `₹${selectedTier.price.toLocaleString('en-IN')}`
                      : project.budgetRange}
                  </p>
                  {selectedTier && (
                    <p className="text-xs text-white/70 mt-1">
                      per {selectedTier.billing === 'monthly' ? 'month' : selectedTier.billing} · {selectedTier.name}
                    </p>
                  )}
                </div>

                {/* Tier selector */}
                {pricingTiers.length > 0 && (
                  <div className="px-4 pt-4 space-y-2">
                    {pricingTiers.map(tier => (
                      <button
                        key={tier._id || tier.name}
                        onClick={() => setSelectedTier(tier)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                          selectedTier?.name === tier.name
                            ? `${project.borderColor || 'border-blue-500'} ${project.bgLight || 'bg-blue-50'}`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold text-gray-900">{tier.name}</span>
                            {tier.isPopular && (
                              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                                Popular
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            ₹{tier.price.toLocaleString('en-IN')}
                            <span className="text-xs font-normal text-gray-500">
                              /{tier.billing === 'monthly' ? 'mo' : tier.billing}
                            </span>
                          </span>
                        </div>
                        {tier.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{tier.description}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected tier features */}
                {selectedTier?.features?.length > 0 && (
                  <div className="px-5 py-3 border-t border-gray-100 mt-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Included in {selectedTier.name}
                    </p>
                    <div className="space-y-1.5">
                      {selectedTier.features.slice(0, 6).map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600">{f}</span>
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
                    onClick={handleAccept}
                    disabled={accepting}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {accepting ? 'Confirming...' : 'Accept & Proceed'}
                  </button>

                  <button
                    onClick={() => setNegotiateOpen(!negotiateOpen)}
                    className="w-full py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Scale className="w-4 h-4" />
                    Negotiate Terms
                    {negotiateOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <button className="w-full py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" /> Schedule a Call
                  </button>
                </div>
              </div>

              {/* Negotiation Panel */}
              {negotiateOpen && (
                <div className="bg-white rounded-2xl border border-blue-200 shadow-lg overflow-hidden">
                  <div className="px-5 py-4 border-b border-blue-100 bg-blue-50">
                    <h3 className="font-bold text-blue-900 flex items-center gap-2">
                      <Scale className="w-4 h-4" /> Negotiate Terms
                    </h3>
                    <p className="text-xs text-blue-600 mt-0.5">We'll get back to you within 2 business hours</p>
                  </div>

                  {negotiateSent ? (
                    <div className="p-6 text-center">
                      <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                      <p className="font-semibold text-gray-900">Request Sent!</p>
                      <p className="text-sm text-gray-500 mt-1">Our team will review and respond shortly.</p>
                    </div>
                  ) : (
                    <div className="p-5 space-y-4">
                      <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                        {[
                          { id: 'message', label: 'Request Changes' },
                          { id: 'counter', label: 'Counter Offer' },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveNegTab(tab.id)}
                            className={`flex-1 py-2 text-sm font-medium transition-colors ${
                              activeNegTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {activeNegTab === 'message' ? (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">What would you like to change?</label>
                            <textarea
                              value={negotiateMsg}
                              onChange={e => setNegotiateMsg(e.target.value)}
                              rows={4}
                              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              placeholder="e.g., Can we reduce the scope? Or extend the timeline?"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium text-gray-500">Quick requests:</p>
                            {[
                              'Reduce scope to fit ₹50K budget',
                              'Extend timeline by 2 weeks',
                              'Include more deliverables for same price',
                              'Start in 2 weeks instead of immediately',
                            ].map(q => (
                              <button
                                key={q}
                                onClick={() => setNegotiateMsg(q)}
                                className="w-full text-left text-xs px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">Your counter offer (budget)</label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                value={counterOffer}
                                onChange={e => setCounterOffer(e.target.value)}
                                className="pl-9 w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., ₹60,000/month"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">Reason / justification</label>
                            <textarea
                              value={negotiateMsg}
                              onChange={e => setNegotiateMsg(e.target.value)}
                              rows={3}
                              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              placeholder="Why is this your budget? Any trade-offs?"
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleNegotiate}
                        disabled={!negotiateMsg && !counterOffer}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4" /> Send Request
                      </button>
                    </div>
                  )}
                </div>
              )}

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
