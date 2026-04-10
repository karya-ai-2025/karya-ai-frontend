'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { createSubmission } from '@/lib/submissionApi';
import { ArrowLeft, ArrowRight, Check, X, CheckCircle2, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'outbound',        label: 'Outbound Sales' },
  { value: 'outreach',        label: 'Sales Outreach Automation' },
  { value: 'email',           label: 'Email Marketing' },
  { value: 'brand',           label: 'Brand & Thought Leadership' },
  { value: 'traffic',         label: 'Traffic & ABM' },
  { value: 'intelligence',    label: 'Market Intelligence' },
  { value: 'relationship',    label: 'Relationship Management' },
  { value: 'assistant',       label: 'Virtual Assistant' },
  { value: 'ai-matching',     label: 'AI Expert Matching' },
];

const TIMELINES = ['1–2 weeks', '2–4 weeks', '1–2 months', '2–3 months', '3–6 months', 'Ongoing'];

const STEPS = ['Basics', 'Goals & Audience', 'Requirements', 'Review & Submit'];

// Simple tag input used for array fields
function TagInput({ placeholder, tags, onChange }) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput('');
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
              {tag}
              <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

export default function SubmitFormPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('submit-project');
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '', tagline: '', category: '', description: '',
    goals: '', targetAudience: '', budgetMin: '', budgetMax: '', timeline: '',
    expertSkillsNeeded: [], toolsUsed: [], deliverables: [],
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  if (!authLoading && !isAuthenticated) { router.push('/login'); return null; }

  const canNext = () => {
    if (step === 0) return form.title.trim() && form.description.trim() && form.category;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await createSubmission({
        submissionType: 'form',
        title:       form.title,
        tagline:     form.tagline,
        category:    form.category,
        description: form.description,
        goals:           form.goals,
        targetAudience:  form.targetAudience,
        budget: {
          min:      form.budgetMin ? Number(form.budgetMin) : undefined,
          max:      form.budgetMax ? Number(form.budgetMax) : undefined,
          currency: 'INR',
        },
        timeline:            form.timeline,
        expertSkillsNeeded:  form.expertSkillsNeeded,
        toolsUsed:           form.toolsUsed,
        deliverables:        form.deliverables,
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 text-center max-w-md w-full">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Brief Submitted!</h2>
              <p className="text-sm text-gray-500 mb-6">
                Our team will review your project brief within 24–48 hours and get back to you.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push('/business-dashboard/my-submissions')}
                  className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  View My Submissions
                </button>
                <button
                  onClick={() => router.push('/business-dashboard')}
                  className="w-full py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">

            {/* Back */}
            <button onClick={() => step === 0 ? router.push('/business-dashboard/submit-project') : setStep(s => s - 1)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {step === 0 ? 'Back' : STEPS[step - 1]}
            </button>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    i < step  ? 'bg-blue-600 border-blue-600 text-white' :
                    i === step ? 'border-blue-600 text-blue-600 bg-white' :
                                 'border-gray-200 text-gray-300 bg-white'
                  }`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  {!sidebarCollapsed && <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>}
                  {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <h2 className="text-base font-bold text-gray-900">{STEPS[step]}</h2>

              {/* ── Step 0: Basics ── */}
              {step === 0 && (
                <>
                  <Field label="Project Title" required>
                    <input value={form.title} onChange={e => set('title', e.target.value)}
                      placeholder="e.g. B2B Lead Generation for SaaS"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" />
                  </Field>
                  <Field label="One-line Tagline" hint="A short sentence that describes the outcome">
                    <input value={form.tagline} onChange={e => set('tagline', e.target.value)}
                      placeholder="e.g. 500 verified decision-maker contacts per month"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" />
                  </Field>
                  <Field label="Category" required>
                    <select value={form.category} onChange={e => set('category', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white">
                      <option value="">Select a category</option>
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Project Description" required hint="What is this project about? What problem does it solve?">
                    <textarea value={form.description} onChange={e => set('description', e.target.value)}
                      rows={4} placeholder="Describe your project in detail..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none" />
                  </Field>
                </>
              )}

              {/* ── Step 1: Goals & Audience ── */}
              {step === 1 && (
                <>
                  <Field label="What do you want to achieve?" hint="Your main goals and success metrics">
                    <textarea value={form.goals} onChange={e => set('goals', e.target.value)}
                      rows={3} placeholder="e.g. Generate 200 qualified leads per month, expand into the enterprise segment..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none" />
                  </Field>
                  <Field label="Who is your target audience?" hint="Describe your ideal customer or end user">
                    <textarea value={form.targetAudience} onChange={e => set('targetAudience', e.target.value)}
                      rows={3} placeholder="e.g. Founders and marketing heads at B2B SaaS companies in India, 50–500 employees..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none" />
                  </Field>
                  <Field label="Budget Range (INR)" hint="Approximate monthly or per-project budget">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1 block">Min</label>
                        <input type="number" value={form.budgetMin} onChange={e => set('budgetMin', e.target.value)}
                          placeholder="e.g. 15000"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-400 mb-1 block">Max</label>
                        <input type="number" value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)}
                          placeholder="e.g. 75000"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" />
                      </div>
                    </div>
                  </Field>
                  <Field label="Expected Timeline">
                    <div className="flex flex-wrap gap-2">
                      {TIMELINES.map(t => (
                        <button key={t} type="button" onClick={() => set('timeline', t)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                            form.timeline === t
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {/* ── Step 2: Requirements ── */}
              {step === 2 && (
                <>
                  <Field label="Expert Skills Needed" hint="What skills should the expert have? Press Enter or click Add">
                    <TagInput placeholder="e.g. LinkedIn Outreach, Apollo.io, Copywriting"
                      tags={form.expertSkillsNeeded} onChange={v => set('expertSkillsNeeded', v)} />
                  </Field>
                  <Field label="Tools You Use or Prefer" hint="CRMs, outreach tools, analytics platforms etc.">
                    <TagInput placeholder="e.g. HubSpot, Apollo, Notion, Slack"
                      tags={form.toolsUsed} onChange={v => set('toolsUsed', v)} />
                  </Field>
                  <Field label="Expected Deliverables" hint="What outputs do you want at the end?">
                    <TagInput placeholder="e.g. 500 verified contacts, Weekly report, CRM export"
                      tags={form.deliverables} onChange={v => set('deliverables', v)} />
                  </Field>
                </>
              )}

              {/* ── Step 3: Review ── */}
              {step === 3 && (
                <div className="space-y-4">
                  {[
                    { label: 'Title', value: form.title },
                    { label: 'Tagline', value: form.tagline || '—' },
                    { label: 'Category', value: CATEGORIES.find(c => c.value === form.category)?.label || '—' },
                    { label: 'Description', value: form.description },
                    { label: 'Goals', value: form.goals || '—' },
                    { label: 'Target Audience', value: form.targetAudience || '—' },
                    { label: 'Budget', value: form.budgetMin || form.budgetMax ? `₹${form.budgetMin || '?'} – ₹${form.budgetMax || '?'}` : '—' },
                    { label: 'Timeline', value: form.timeline || '—' },
                  ].map(r => (
                    <div key={r.label} className="flex gap-3">
                      <span className="text-xs font-semibold text-gray-400 w-32 shrink-0 pt-0.5">{r.label}</span>
                      <span className="text-sm text-gray-800">{r.value}</span>
                    </div>
                  ))}
                  {form.expertSkillsNeeded.length > 0 && (
                    <div className="flex gap-3">
                      <span className="text-xs font-semibold text-gray-400 w-32 shrink-0 pt-0.5">Skills Needed</span>
                      <div className="flex flex-wrap gap-1.5">
                        {form.expertSkillsNeeded.map(t => <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">{t}</span>)}
                      </div>
                    </div>
                  )}
                  {form.toolsUsed.length > 0 && (
                    <div className="flex gap-3">
                      <span className="text-xs font-semibold text-gray-400 w-32 shrink-0 pt-0.5">Tools</span>
                      <div className="flex flex-wrap gap-1.5">
                        {form.toolsUsed.map(t => <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">{t}</span>)}
                      </div>
                    </div>
                  )}
                  {form.deliverables.length > 0 && (
                    <div className="flex gap-3">
                      <span className="text-xs font-semibold text-gray-400 w-32 shrink-0 pt-0.5">Deliverables</span>
                      <div className="flex flex-wrap gap-1.5">
                        {form.deliverables.map(t => <span key={t} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">{t}</span>)}
                      </div>
                    </div>
                  )}
                  {error && <p className="text-xs text-red-500 pt-2">{error}</p>}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => step === 0 ? router.push('/business-dashboard/submit-project') : setStep(s => s - 1)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                {step === 0 ? 'Cancel' : 'Back'}
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext()}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : 'Submit Brief'}
                </button>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
