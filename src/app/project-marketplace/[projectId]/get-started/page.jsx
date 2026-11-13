'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Building2, Target, Users, Calendar, DollarSign,
  FileText, Rocket, UserCheck, Briefcase, Cpu, Check, ChevronRight,
  Globe, Phone, Mail, Info, Loader2, MapPin, Clock, Zap
} from 'lucide-react';
import { fetchProjectBySlug } from '@/lib/catalogApi';

// ── STEP CONFIG ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Business Info', icon: Building2 },
  { id: 2, label: 'Project Goals', icon: Target },
  { id: 3, label: 'Target Audience', icon: Users },
  { id: 4, label: 'Timeline & Budget', icon: Calendar },
  { id: 5, label: 'Hire Preference', icon: Rocket },
];

const HIRE_MODES = [
  {
    id: 'expert',
    label: 'Hire an Expert',
    desc: 'Hand-pick one vetted expert from our marketplace. You manage the relationship.',
    icon: UserCheck,
    badge: 'Most Flexible',
    color: 'from-blue-500 to-blue-700',
    bgLight: 'bg-blue-50',
    border: 'border-blue-500',
  },
  {
    id: 'agency',
    label: 'Hire an Agency',
    desc: 'A full-service agency from our leads network handles the entire project.',
    icon: Briefcase,
    badge: 'Best for Scale',
    color: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-50',
    border: 'border-orange-500',
  },
  {
    id: 'platform',
    label: 'Platform Managed',
    desc: 'Karya-AI fully manages the project — sourcing, execution, and delivery.',
    icon: Cpu,
    badge: 'Recommended',
    color: 'from-violet-600 to-blue-600',
    bgLight: 'bg-violet-50',
    border: 'border-violet-500',
    popular: true,
  },
];

export default function GetStartedPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId;

  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!projectId) return;
    fetchProjectBySlug(projectId)
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoadingProject(false));
  }, [projectId]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    // Step 1 — Business Info
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    // Step 2 — Project Goals
    primaryGoal: '',
    kpis: '',
    successMetrics: '',
    currentChallenges: '',
    // Step 3 — Target Audience
    targetIndustry: '',
    targetCompanySize: '',
    targetGeography: '',
    targetJobTitles: '',
    monthlyLeadGoal: '',
    // Step 4 — Timeline & Budget
    startDate: '',
    deadline: '',
    budgetRange: '',
    flexibility: 'flexible',
    tools: '',
    additionalNotes: '',
    // Step 5 — Hire Preference
    hireMode: 'platform',
  });

  // Pre-fill from localStorage if exists
  useEffect(() => {
    if (!projectId) return;
    try {
      const saved = localStorage.getItem(`projectReq_${projectId}`);
      if (saved) setForm(JSON.parse(saved));
    } catch (_) {}
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

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleNext = () => {
    if (step < STEPS.length) setStep(s => s + 1);
  };
  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else router.push(`/project-marketplace/${projectId}`);
  };

  const handleSubmit = async () => {
    setSaving(true);
    // Save to localStorage
    localStorage.setItem(`projectReq_${projectId}`, JSON.stringify(form));
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    router.push(`/project-marketplace/${projectId}/overview`);
  };

  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";

  // ─── STEP CONTENT ──────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tell us about your business</h2>
              <p className="text-sm text-gray-500 mt-1">This helps us match you with the right experts and tailor the project plan.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Company Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="text" value={form.companyName} onChange={e => set('companyName', e.target.value)}
                    className={`${inputClass} pl-10`} placeholder="Your company name" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Industry</label>
                <select value={form.industry} onChange={e => set('industry', e.target.value)} className={inputClass}>
                  <option value="">Select your industry</option>
                  <option>SaaS / Technology</option>
                  <option>E-commerce / Retail</option>
                  <option>Healthcare / Pharma</option>
                  <option>Finance / Fintech</option>
                  <option>Manufacturing</option>
                  <option>Professional Services</option>
                  <option>Education</option>
                  <option>Real Estate</option>
                  <option>Media / Marketing</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Company Size</label>
                <select value={form.companySize} onChange={e => set('companySize', e.target.value)} className={inputClass}>
                  <option value="">Select size</option>
                  <option value="1-10">1–10 employees</option>
                  <option value="11-50">11–50 employees</option>
                  <option value="51-200">51–200 employees</option>
                  <option value="201-500">201–500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Company Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="url" value={form.website} onChange={e => set('website', e.target.value)}
                    className={`${inputClass} pl-10`} placeholder="https://yourcompany.com" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Contact Person <span className="text-red-500">*</span></label>
                <input type="text" value={form.contactName} onChange={e => set('contactName', e.target.value)}
                  className={inputClass} placeholder="Your full name" />
              </div>
              <div>
                <label className={labelClass}>Contact Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="email" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)}
                    className={`${inputClass} pl-10`} placeholder="you@company.com" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)}
                    className={`${inputClass} pl-10`} placeholder="+91 98765 43210" />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">What are your goals?</h2>
              <p className="text-sm text-gray-500 mt-1">Help us understand what success looks like for this project.</p>
            </div>
            <div>
              <label className={labelClass}>Primary Goal <span className="text-red-500">*</span></label>
              <textarea value={form.primaryGoal} onChange={e => set('primaryGoal', e.target.value)} rows={3}
                className={inputClass}
                placeholder={`e.g., "We want to generate 200 qualified B2B leads per month in the SaaS vertical..."`} />
            </div>
            <div>
              <label className={labelClass}>Key Performance Indicators (KPIs)</label>
              <textarea value={form.kpis} onChange={e => set('kpis', e.target.value)} rows={3}
                className={inputClass}
                placeholder="e.g., Email open rate >35%, 50+ booked demos per month, CAC under ₹5,000..." />
            </div>
            <div>
              <label className={labelClass}>How will you measure success?</label>
              <textarea value={form.successMetrics} onChange={e => set('successMetrics', e.target.value)} rows={2}
                className={inputClass}
                placeholder="e.g., Number of qualified leads, pipeline value generated, MQLs vs SQLs..." />
            </div>
            <div>
              <label className={labelClass}>Current Challenges</label>
              <textarea value={form.currentChallenges} onChange={e => set('currentChallenges', e.target.value)} rows={3}
                className={inputClass}
                placeholder="What's not working right now? What have you already tried?..." />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Who is your target audience?</h2>
              <p className="text-sm text-gray-500 mt-1">Define your ideal customer profile so we can target precisely.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Target Industry</label>
                <input type="text" value={form.targetIndustry} onChange={e => set('targetIndustry', e.target.value)}
                  className={inputClass} placeholder="e.g., SaaS, Manufacturing, Healthcare" />
              </div>
              <div>
                <label className={labelClass}>Target Company Size</label>
                <select value={form.targetCompanySize} onChange={e => set('targetCompanySize', e.target.value)} className={inputClass}>
                  <option value="">Select company size</option>
                  <option>SMB (1–50)</option>
                  <option>Mid-market (51–500)</option>
                  <option>Enterprise (500+)</option>
                  <option>All sizes</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Target Geography</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="text" value={form.targetGeography} onChange={e => set('targetGeography', e.target.value)}
                    className={`${inputClass} pl-10`} placeholder="e.g., India (Tier-1 cities), US East Coast, Global" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Target Job Titles / Decision Makers</label>
                <input type="text" value={form.targetJobTitles} onChange={e => set('targetJobTitles', e.target.value)}
                  className={inputClass} placeholder="e.g., VP Sales, CTO, Founder, Marketing Director" />
              </div>
              <div>
                <label className={labelClass}>Monthly Lead Goal</label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="number" value={form.monthlyLeadGoal} onChange={e => set('monthlyLeadGoal', e.target.value)}
                    className={`${inputClass} pl-10`} placeholder="e.g., 150" min="0" />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Timeline & Budget</h2>
              <p className="text-sm text-gray-500 mt-1">Let us know your time constraints and investment range.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Desired Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                    className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Target Completion</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
                    className={`${inputClass} pl-10`} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Budget Range <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Under ₹50K', '₹50K – ₹1L', '₹1L – ₹3L', '₹3L+'].map(b => (
                    <button key={b} type="button" onClick={() => set('budgetRange', b)}
                      className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                        form.budgetRange === b
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Budget Flexibility</label>
                <div className="flex gap-3">
                  {[
                    { value: 'strict', label: 'Strict — no flexibility' },
                    { value: 'flexible', label: 'Flexible ±20%' },
                    { value: 'open', label: 'Open if value justifies it' },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => set('flexibility', opt.value)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                        form.flexibility === opt.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Tools / Tech Stack You Currently Use</label>
                <input type="text" value={form.tools} onChange={e => set('tools', e.target.value)}
                  className={inputClass} placeholder="e.g., HubSpot, Salesforce, Apollo.io, Slack, Notion..." />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Any Other Requirements or Notes</label>
                <textarea value={form.additionalNotes} onChange={e => set('additionalNotes', e.target.value)} rows={3}
                  className={inputClass}
                  placeholder="Anything specific we should know — integrations, confidentiality, reporting cadence, past vendors..." />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">How do you want to hire?</h2>
              <p className="text-sm text-gray-500 mt-1">Choose the model that works best for your team and project.</p>
            </div>
            <div className="space-y-4">
              {HIRE_MODES.map(mode => {
                const ModeIcon = mode.icon;
                const isSelected = form.hireMode === mode.id;
                return (
                  <div key={mode.id} onClick={() => set('hireMode', mode.id)}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected ? `${mode.border} ${mode.bgLight}` : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}>
                    {mode.popular && (
                      <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full border border-violet-200">
                        {mode.badge}
                      </span>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center flex-shrink-0`}>
                        <ModeIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{mode.label}</h3>
                          {!mode.popular && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{mode.badge}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{mode.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-3 text-center">
                        {mode.id === 'expert' && [
                          ['Direct control', 'You manage the expert'],
                          ['Flexible scope', 'Change as needed'],
                          ['Transparent pricing', 'No hidden fees'],
                        ].map(([t, s]) => (
                          <div key={t} className="bg-white rounded-lg p-2.5 border border-gray-100">
                            <p className="text-xs font-semibold text-gray-800">{t}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{s}</p>
                          </div>
                        ))}
                        {mode.id === 'agency' && [
                          ['Full team', 'Agency handles everything'],
                          ['Proven track record', 'Vetted agencies only'],
                          ['SLA guaranteed', 'Committed deliverables'],
                        ].map(([t, s]) => (
                          <div key={t} className="bg-white rounded-lg p-2.5 border border-gray-100">
                            <p className="text-xs font-semibold text-gray-800">{t}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{s}</p>
                          </div>
                        ))}
                        {mode.id === 'platform' && [
                          ['Zero management', 'We handle everything'],
                          ['Dedicated PM', 'Project manager assigned'],
                          ['Weekly reports', 'Full transparency'],
                        ].map(([t, s]) => (
                          <div key={t} className="bg-white rounded-lg p-2.5 border border-gray-100">
                            <p className="text-xs font-semibold text-gray-800">{t}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{s}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    if (step === 1) return form.companyName && form.contactName && form.contactEmail;
    if (step === 2) return form.primaryGoal;
    if (step === 4) return form.budgetRange;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={`/project-marketplace/${projectId}`}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Project
          </Link>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${project.gradient} flex items-center justify-center`}>
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 leading-none">Get Started with</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">{project.title}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">Step {step} of {STEPS.length}</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          {/* Left: Step indicator */}
          <div className="w-56 shrink-0 hidden md:block">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-24">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Your Progress</p>
              <div className="space-y-1">
                {STEPS.map((s, idx) => {
                  const SIcon = s.icon;
                  const isActive = step === s.id;
                  const isDone = step > s.id;
                  return (
                    <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isActive ? 'bg-blue-50 text-blue-700 font-semibold' : isDone ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDone ? 'bg-green-500' : isActive ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        {isDone
                          ? <Check className="w-3.5 h-3.5 text-white" />
                          : <SIcon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        }
                      </div>
                      <span>{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Project mini card */}
              <div className={`mt-6 p-3 rounded-xl ${project.bgLight} border ${project.borderColor}`}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Selected Project</p>
                <p className="text-sm font-semibold text-gray-900">{project.title}</p>
                <div className="flex items-center gap-1 mt-2">
                  <DollarSign className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">{project.budgetRange}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">{project.duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form card */}
          <div className="flex-1">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{STEPS[step - 1].label}</span>
                <span>{Math.round((step / STEPS.length) * 100)}% complete</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${(step / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
              {renderStep()}

              {/* Nav buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                <button onClick={handleBack}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  {step === 1 ? 'Back to Project' : 'Previous'}
                </button>

                {step < STEPS.length ? (
                  <button onClick={handleNext} disabled={!isStepValid()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md text-sm">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={saving}
                    className="flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md text-sm">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {saving ? 'Preparing your plan...' : 'View My Project Overview →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
