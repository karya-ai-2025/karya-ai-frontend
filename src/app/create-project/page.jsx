'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, ChevronLeft, Plus, X, CheckCircle,
  Loader2, AlertCircle,
} from 'lucide-react';
import { createProject } from '@/lib/catalogApi';

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'outbound',       label: 'Outbound & Lead Gen' },
  { value: 'outreach',       label: 'Sales Outreach' },
  { value: 'email',          label: 'Email Marketing' },
  { value: 'brand',          label: 'Brand & Social' },
  { value: 'traffic',        label: 'Traffic & Growth' },
  { value: 'intelligence',   label: 'Sales Intelligence' },
  { value: 'relationship',   label: 'Relationship Mgmt' },
  { value: 'assistant',      label: 'Virtual Assistants' },
  { value: 'ai-matching',    label: 'AI Expert Matching' },
];

const DIFFICULTIES    = ['Beginner', 'Intermediate', 'Advanced'];
const TIER_IDS        = ['credit', 'bronze', 'silver', 'gold'];
const BILLING_CYCLES  = ['one-time', 'monthly', 'per-unit', 'free'];
const SUPPORT_TYPES   = ['email', 'chat', 'priority-chat', 'dedicated-pm'];

const STEPS = [
  'Core Info',
  'Content',
  'Business & Outcomes',
  'Milestones, FAQ & Social Proof',
  'Theme, Stats & Flags',
  'Pricing Tiers',
];

const BLANK_TIER = {
  tierId: 'credit',
  name: '',
  displayOrder: 1,
  popular: false,
  badge: '',
  price: { amount: 0, currency: 'INR', billingCycle: 'monthly', label: '', note: '' },
  quantities: {
    contacts: '', emailSequences: '', postsPerMonth: '',
    hoursPerWeek: '', reportsPerMonth: '', candidatesPresented: '', revisionRounds: 2,
  },
  features: {
    decisionMakerProfiles: false, companyIntelligence: false, icpScoring: false,
    linkedinProfiles: false, techStackData: false, crmExport: true,
    emailVerified: false, abTesting: false, intentData: false,
    dedicatedPM: false, weeklyReport: false, replacementGuarantee: false, prioritySupport: false,
  },
  support: { type: 'email', label: '', responseTime: '' },
  deliverableSummary: '',
  isActive: true,
};

const INITIAL_FORM = {
  slug: '', title: '', subtitle: '', tagline: '', description: '',
  number: '', badge: '', budgetRange: '', category: '', difficulty: '',
  duration: '', pricingModel: '', stageNumber: '', stageName: '',
  projectCode: '', quote: '',

  subProjects: [], howItWorks: [], deliverables: [], subjects: [],
  tools: [], expertSkills: [], targetFor: [], matchIndustries: [],
  dependencies: [], expertCities: [],

  businessChallenge: '', expertProfileDesc: '', roi: '',
  aiWorkflow: [], expertEnsures: [], humanApprovalTasks: [],
  outcomes: [], guarantees: [], kpis: [],

  milestones: [],
  faq: [],
  successHighlight: '', successROI: '',
  successStory: { company: '', result: '', industry: '' },

  theme: { gradient: '', bgLight: '', textColor: '', borderColor: '' },
  stats: { expertCount: 0, completedCount: 0, avgRating: 0, trendingCount: 0, trendingLabel: '' },
  isFeatured: false, isTrending: false, isActive: true, isPublished: true,

  pricingTiers: [],
};

// ─── Small reusable pieces ────────────────────────────────────────────────────

function Label({ children, required }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = 'text', className = '' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${className}`}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform border ${checked ? 'translate-x-5 border-blue-600' : 'translate-x-0 border-gray-300'}`} />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function TagInput({ label, values, onChange, placeholder }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput('');
  };
  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder || 'Type and press Enter'}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v, i) => (
            <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs rounded-full px-2.5 py-1">
              {v}
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{children}</h3>;
}

function Grid2({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, required, children }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

// ─── Step components ─────────────────────────────────────────────────────────

function Step1({ form, set }) {
  const autoSlug = (title) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    set('slug', slug);
    set('title', title);
  };

  return (
    <div className="space-y-5">
      <SectionTitle>Core Information</SectionTitle>
      <Grid2>
        <Field label="Title" required>
          <Input value={form.title} onChange={autoSlug} placeholder="e.g. HotLead in a Box" />
        </Field>
        <Field label="Slug" required>
          <Input value={form.slug} onChange={v => set('slug', v)} placeholder="e.g. hotlead-in-a-box" />
        </Field>
      </Grid2>
      <Field label="Tagline">
        <Input value={form.tagline} onChange={v => set('tagline', v)} placeholder="Short one-liner shown on cards" />
      </Field>
      <Field label="Subtitle">
        <Input value={form.subtitle} onChange={v => set('subtitle', v)} placeholder="Secondary line" />
      </Field>
      <Field label="Description" required>
        <Textarea value={form.description} onChange={v => set('description', v)} placeholder="Full description of the project" rows={4} />
      </Field>
      <Grid2>
        <Field label="Category" required>
          <Select value={form.category} onChange={v => set('category', v)} options={CATEGORIES} placeholder="Select category" />
        </Field>
        <Field label="Difficulty">
          <Select value={form.difficulty} onChange={v => set('difficulty', v)} options={DIFFICULTIES} placeholder="Select difficulty" />
        </Field>
      </Grid2>
      <Grid2>
        <Field label="Duration">
          <Input value={form.duration} onChange={v => set('duration', v)} placeholder="e.g. 4–8 weeks" />
        </Field>
        <Field label="Budget Range">
          <Input value={form.budgetRange} onChange={v => set('budgetRange', v)} placeholder="e.g. ₹15,000 – ₹75,000" />
        </Field>
      </Grid2>
      <Grid2>
        <Field label="Project Number">
          <Input value={form.number} onChange={v => set('number', v)} placeholder="e.g. Project 1.1" />
        </Field>
        <Field label="Badge">
          <Input value={form.badge} onChange={v => set('badge', v)} placeholder="e.g. Most Popular" />
        </Field>
      </Grid2>
      <Grid2>
        <Field label="Stage Number">
          <Input type="number" value={form.stageNumber} onChange={v => set('stageNumber', v)} placeholder="1, 2, 3…" />
        </Field>
        <Field label="Stage Name">
          <Input value={form.stageName} onChange={v => set('stageName', v)} placeholder="e.g. Awareness" />
        </Field>
      </Grid2>
      <Grid2>
        <Field label="Project Code">
          <Input value={form.projectCode} onChange={v => set('projectCode', v)} placeholder="e.g. A-01" />
        </Field>
        <Field label="Pricing Model">
          <Input value={form.pricingModel} onChange={v => set('pricingModel', v)} placeholder="e.g. Monthly retainer" />
        </Field>
      </Grid2>
      <Field label="Hero Quote">
        <Input value={form.quote} onChange={v => set('quote', v)} placeholder="Pull-quote shown on the project card" />
      </Field>
    </div>
  );
}

function Step2({ form, set }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Content Arrays</SectionTitle>
      <TagInput label="Sub-projects / Phases" values={form.subProjects} onChange={v => set('subProjects', v)} placeholder="Add a sub-project and press Enter" />
      <TagInput label="How It Works (steps)" values={form.howItWorks} onChange={v => set('howItWorks', v)} placeholder="Add a step and press Enter" />
      <TagInput label="Deliverables" values={form.deliverables} onChange={v => set('deliverables', v)} placeholder="Add a deliverable and press Enter" />
      <TagInput label="Subjects / Scope Areas" values={form.subjects} onChange={v => set('subjects', v)} placeholder="e.g. ICP Strategy" />
      <TagInput label="Tools Used" values={form.tools} onChange={v => set('tools', v)} placeholder="e.g. Apollo.io, HubSpot" />
      <TagInput label="Expert Skills Required" values={form.expertSkills} onChange={v => set('expertSkills', v)} placeholder="e.g. B2B Lead Generation" />
      <TagInput label="Target For (ideal clients)" values={form.targetFor} onChange={v => set('targetFor', v)} placeholder="e.g. B2B SaaS, Coaches" />
      <TagInput label="Match Industries" values={form.matchIndustries} onChange={v => set('matchIndustries', v)} placeholder="e.g. FinTech, Healthcare" />
      <TagInput label="Dependencies (prerequisites)" values={form.dependencies} onChange={v => set('dependencies', v)} placeholder="e.g. CRM must be set up" />
      <TagInput label="Expert Cities Available" values={form.expertCities} onChange={v => set('expertCities', v)} placeholder="e.g. Mumbai, Bangalore" />
    </div>
  );
}

function Step3({ form, set }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Business Challenge</SectionTitle>
      <Field label="Business Challenge">
        <Textarea value={form.businessChallenge} onChange={v => set('businessChallenge', v)} placeholder="The core pain this project solves" rows={3} />
      </Field>
      <Field label="Expert Profile Description">
        <Textarea value={form.expertProfileDesc} onChange={v => set('expertProfileDesc', v)} placeholder="Ideal expert background (prose)" rows={2} />
      </Field>

      <SectionTitle>AI / Human Split</SectionTitle>
      <TagInput label="What AI Does" values={form.aiWorkflow} onChange={v => set('aiWorkflow', v)} placeholder="e.g. Drafts outreach sequences" />
      <TagInput label="What the Expert Ensures" values={form.expertEnsures} onChange={v => set('expertEnsures', v)} placeholder="e.g. Brand voice integrity" />
      <TagInput label="Human Approval Tasks" values={form.humanApprovalTasks} onChange={v => set('humanApprovalTasks', v)} placeholder="e.g. Final sign-off on ICP" />

      <SectionTitle>Outcomes & ROI</SectionTitle>
      <TagInput label="Outcomes (quantified results)" values={form.outcomes} onChange={v => set('outcomes', v)} placeholder="e.g. 8–12 pieces/month" />
      <TagInput label="Guarantees" values={form.guarantees} onChange={v => set('guarantees', v)} placeholder="e.g. Consistent brand voice" />
      <TagInput label="KPIs Tracked" values={form.kpis} onChange={v => set('kpis', v)} placeholder="e.g. Organic traffic growth" />
      <Field label="ROI Framing">
        <Input value={form.roi} onChange={v => set('roi', v)} placeholder="e.g. 1 lead/mo = $3–8K vs $1,200/mo cost" />
      </Field>
    </div>
  );
}

function Step4({ form, set }) {
  const addMilestone = () => set('milestones', [...form.milestones, { label: '', description: '' }]);
  const updateMilestone = (i, key, val) => {
    const updated = form.milestones.map((m, j) => j === i ? { ...m, [key]: val } : m);
    set('milestones', updated);
  };
  const removeMilestone = (i) => set('milestones', form.milestones.filter((_, j) => j !== i));

  const addFaq = () => set('faq', [...form.faq, { q: '', a: '' }]);
  const updateFaq = (i, key, val) => {
    const updated = form.faq.map((f, j) => j === i ? { ...f, [key]: val } : f);
    set('faq', updated);
  };
  const removeFaq = (i) => set('faq', form.faq.filter((_, j) => j !== i));

  return (
    <div className="space-y-5">
      <SectionTitle>Milestones</SectionTitle>
      {form.milestones.map((m, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
          <button type="button" onClick={() => removeMilestone(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
            <X className="w-4 h-4" />
          </button>
          <Grid2>
            <Field label="Label">
              <Input value={m.label} onChange={v => updateMilestone(i, 'label', v)} placeholder="e.g. Week 1" />
            </Field>
            <Field label="Description">
              <Input value={m.description} onChange={v => updateMilestone(i, 'description', v)} placeholder="What gets delivered" />
            </Field>
          </Grid2>
        </div>
      ))}
      <button type="button" onClick={addMilestone} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
        <Plus className="w-4 h-4" /> Add Milestone
      </button>

      <SectionTitle>FAQ</SectionTitle>
      {form.faq.map((f, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
          <button type="button" onClick={() => removeFaq(i)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500">
            <X className="w-4 h-4" />
          </button>
          <Field label="Question">
            <Input value={f.q} onChange={v => updateFaq(i, 'q', v)} placeholder="Frequently asked question" />
          </Field>
          <Field label="Answer">
            <Textarea value={f.a} onChange={v => updateFaq(i, 'a', v)} placeholder="Answer" rows={2} />
          </Field>
        </div>
      ))}
      <button type="button" onClick={addFaq} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
        <Plus className="w-4 h-4" /> Add FAQ
      </button>

      <SectionTitle>Social Proof</SectionTitle>
      <Field label="Success Highlight">
        <Input value={form.successHighlight} onChange={v => set('successHighlight', v)} placeholder="e.g. Clients see 3× pipeline growth" />
      </Field>
      <Field label="Success ROI">
        <Input value={form.successROI} onChange={v => set('successROI', v)} placeholder="e.g. $50K in pipeline in 60 days" />
      </Field>
      <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
        <p className="text-sm font-medium text-gray-600">Success Story</p>
        <Grid2>
          <Field label="Company">
            <Input value={form.successStory.company} onChange={v => set('successStory', { ...form.successStory, company: v })} placeholder="Company name" />
          </Field>
          <Field label="Industry">
            <Input value={form.successStory.industry} onChange={v => set('successStory', { ...form.successStory, industry: v })} placeholder="e.g. B2B SaaS" />
          </Field>
        </Grid2>
        <Field label="Result">
          <Textarea value={form.successStory.result} onChange={v => set('successStory', { ...form.successStory, result: v })} placeholder="What result did they achieve?" rows={2} />
        </Field>
      </div>
    </div>
  );
}

function Step5({ form, set }) {
  return (
    <div className="space-y-5">
      <SectionTitle>UI Theme (Tailwind class names)</SectionTitle>
      <Grid2>
        <Field label="Gradient">
          <Input value={form.theme.gradient} onChange={v => set('theme', { ...form.theme, gradient: v })} placeholder="from-blue-500 to-blue-700" />
        </Field>
        <Field label="Background Light">
          <Input value={form.theme.bgLight} onChange={v => set('theme', { ...form.theme, bgLight: v })} placeholder="bg-blue-50" />
        </Field>
        <Field label="Text Color">
          <Input value={form.theme.textColor} onChange={v => set('theme', { ...form.theme, textColor: v })} placeholder="text-blue-700" />
        </Field>
        <Field label="Border Color">
          <Input value={form.theme.borderColor} onChange={v => set('theme', { ...form.theme, borderColor: v })} placeholder="border-blue-200" />
        </Field>
      </Grid2>

      <SectionTitle>Discovery Stats</SectionTitle>
      <Grid2>
        <Field label="Expert Count">
          <Input type="number" value={form.stats.expertCount} onChange={v => set('stats', { ...form.stats, expertCount: Number(v) })} />
        </Field>
        <Field label="Completed Count">
          <Input type="number" value={form.stats.completedCount} onChange={v => set('stats', { ...form.stats, completedCount: Number(v) })} />
        </Field>
        <Field label="Avg Rating (0–5)">
          <Input type="number" value={form.stats.avgRating} onChange={v => set('stats', { ...form.stats, avgRating: Number(v) })} placeholder="0.0" />
        </Field>
        <Field label="Trending Count">
          <Input type="number" value={form.stats.trendingCount} onChange={v => set('stats', { ...form.stats, trendingCount: Number(v) })} />
        </Field>
      </Grid2>
      <Field label="Trending Label">
        <Input value={form.stats.trendingLabel} onChange={v => set('stats', { ...form.stats, trendingLabel: v })} placeholder="e.g. 12 businesses started this month" />
      </Field>

      <SectionTitle>Visibility Flags</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <Toggle checked={form.isActive}    onChange={v => set('isActive', v)}    label="Active" />
        <Toggle checked={form.isPublished} onChange={v => set('isPublished', v)} label="Published" />
        <Toggle checked={form.isFeatured}  onChange={v => set('isFeatured', v)}  label="Featured" />
        <Toggle checked={form.isTrending}  onChange={v => set('isTrending', v)}  label="Trending" />
      </div>
    </div>
  );
}

function TierCard({ tier, index, onChange, onRemove }) {
  const set = (key, val) => onChange({ ...tier, [key]: val });
  const setPrice = (key, val) => onChange({ ...tier, price: { ...tier.price, [key]: val } });
  const setQty = (key, val) => onChange({ ...tier, quantities: { ...tier.quantities, [key]: val } });
  const setFeature = (key, val) => onChange({ ...tier, features: { ...tier.features, [key]: val } });
  const setSupport = (key, val) => onChange({ ...tier, support: { ...tier.support, [key]: val } });

  const FEATURES = [
    ['decisionMakerProfiles', 'Decision Maker Profiles'],
    ['companyIntelligence', 'Company Intelligence'],
    ['icpScoring', 'ICP Scoring'],
    ['linkedinProfiles', 'LinkedIn Profiles'],
    ['techStackData', 'Tech Stack Data'],
    ['crmExport', 'CRM Export'],
    ['emailVerified', 'Email Verified'],
    ['abTesting', 'A/B Testing'],
    ['intentData', 'Intent Data'],
    ['dedicatedPM', 'Dedicated PM'],
    ['weeklyReport', 'Weekly Report'],
    ['replacementGuarantee', 'Replacement Guarantee'],
    ['prioritySupport', 'Priority Support'],
  ];

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
        <span className="font-semibold text-gray-800 text-sm">Tier {index + 1}: {tier.name || '(unnamed)'}</span>
        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 space-y-5">
        <Grid2>
          <Field label="Tier ID" required>
            <Select value={tier.tierId} onChange={v => set('tierId', v)} options={TIER_IDS} />
          </Field>
          <Field label="Display Name" required>
            <Input value={tier.name} onChange={v => set('name', v)} placeholder="e.g. Silver" />
          </Field>
          <Field label="Display Order">
            <Input type="number" value={tier.displayOrder} onChange={v => set('displayOrder', Number(v))} />
          </Field>
          <Field label="Badge">
            <Input value={tier.badge} onChange={v => set('badge', v)} placeholder="e.g. Best Value" />
          </Field>
        </Grid2>
        <Toggle checked={tier.popular} onChange={v => set('popular', v)} label="Mark as Popular / Recommended" />

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">Pricing</p>
          <Grid2>
            <Field label="Amount (INR)">
              <Input type="number" value={tier.price.amount} onChange={v => setPrice('amount', Number(v))} placeholder="45000" />
            </Field>
            <Field label="Billing Cycle">
              <Select value={tier.price.billingCycle} onChange={v => setPrice('billingCycle', v)} options={BILLING_CYCLES} />
            </Field>
            <Field label="Price Label">
              <Input value={tier.price.label} onChange={v => setPrice('label', v)} placeholder="₹45,000/mo" />
            </Field>
            <Field label="Price Note">
              <Input value={tier.price.note} onChange={v => setPrice('note', v)} placeholder="+ ad spend" />
            </Field>
          </Grid2>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">Quantities</p>
          <Grid2>
            <Field label="Contacts / Leads"><Input type="number" value={tier.quantities.contacts} onChange={v => setQty('contacts', v)} /></Field>
            <Field label="Email Sequences"><Input type="number" value={tier.quantities.emailSequences} onChange={v => setQty('emailSequences', v)} /></Field>
            <Field label="Posts / Month"><Input type="number" value={tier.quantities.postsPerMonth} onChange={v => setQty('postsPerMonth', v)} /></Field>
            <Field label="Hours / Week"><Input type="number" value={tier.quantities.hoursPerWeek} onChange={v => setQty('hoursPerWeek', v)} /></Field>
            <Field label="Reports / Month"><Input type="number" value={tier.quantities.reportsPerMonth} onChange={v => setQty('reportsPerMonth', v)} /></Field>
            <Field label="Revision Rounds"><Input type="number" value={tier.quantities.revisionRounds} onChange={v => setQty('revisionRounds', v)} /></Field>
          </Grid2>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">Features Included</p>
          <div className="grid grid-cols-2 gap-2">
            {FEATURES.map(([key, label]) => (
              <Toggle key={key} checked={tier.features[key]} onChange={v => setFeature(key, v)} label={label} />
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">Support</p>
          <Grid2>
            <Field label="Support Type">
              <Select value={tier.support.type} onChange={v => setSupport('type', v)} options={SUPPORT_TYPES} />
            </Field>
            <Field label="Response Time">
              <Input value={tier.support.responseTime} onChange={v => setSupport('responseTime', v)} placeholder="e.g. 4 hours" />
            </Field>
          </Grid2>
          <div className="mt-3">
            <Field label="Support Label">
              <Input value={tier.support.label} onChange={v => setSupport('label', v)} placeholder="e.g. Priority Chat Support" />
            </Field>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <Field label="Deliverable Summary">
            <Textarea value={tier.deliverableSummary} onChange={v => set('deliverableSummary', v)} placeholder="e.g. 300 verified contacts + CRM export" rows={2} />
          </Field>
        </div>
      </div>
    </div>
  );
}

function Step6({ form, set }) {
  const addTier = () => {
    if (form.pricingTiers.length >= 4) return;
    set('pricingTiers', [...form.pricingTiers, { ...BLANK_TIER, displayOrder: form.pricingTiers.length + 1 }]);
  };
  const updateTier = (i, tier) => set('pricingTiers', form.pricingTiers.map((t, j) => j === i ? tier : t));
  const removeTier = (i) => set('pricingTiers', form.pricingTiers.filter((_, j) => j !== i));

  return (
    <div className="space-y-5">
      <SectionTitle>Pricing Tiers (up to 4)</SectionTitle>
      <p className="text-sm text-gray-500">
        Each tier corresponds to a <strong>ProjectPricing</strong> record linked to this project.
        Tiers are optional — you can add them later.
      </p>
      {form.pricingTiers.map((tier, i) => (
        <TierCard key={i} tier={tier} index={i} onChange={t => updateTier(i, t)} onRemove={() => removeTier(i)} />
      ))}
      {form.pricingTiers.length < 4 && (
        <button type="button" onClick={addTier} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold border border-blue-200 hover:border-blue-400 rounded-xl px-4 py-2.5 transition-colors">
          <Plus className="w-4 h-4" /> Add Pricing Tier
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreateProjectPage() {
  const router   = useRouter();
  const [step, setStep]             = useState(1);
  const [form, setForm]             = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [created, setCreated]       = useState(null);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const validateStep = () => {
    if (step === 1) {
      if (!form.slug.trim())        return 'Slug is required';
      if (!form.title.trim())       return 'Title is required';
      if (!form.description.trim()) return 'Description is required';
      if (!form.category)           return 'Category is required';
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep(s => Math.min(s + 1, STEPS.length));
  };

  const prev = () => {
    setError(null);
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const cleanedTiers = form.pricingTiers.map(t => ({
        ...t,
        quantities: Object.fromEntries(
          Object.entries(t.quantities).map(([k, v]) => [k, v === '' ? null : Number(v)])
        ),
      }));
      const data = await createProject({ ...form, pricingTiers: cleanedTiers });
      setCreated(data.project);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Project Created!</h2>
          <p className="text-sm text-gray-500 mb-1">
            <strong>{created.title}</strong> has been added to the catalog.
          </p>
          <p className="text-xs text-gray-400 mb-6">Slug: <code className="bg-gray-100 px-1 rounded">{created.slug}</code></p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setForm(INITIAL_FORM); setStep(1); setCreated(null); }}
              className="px-4 py-2 border border-gray-200 hover:border-gray-300 text-sm font-semibold rounded-xl transition-colors"
            >
              Create Another
            </button>
            <button
              onClick={() => router.push('/project-marketplace')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              View Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Project</h1>
          <p className="text-sm text-gray-500 mt-0.5">Add a new project to the marketplace catalog</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-1.5 mb-6 flex-wrap">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done   = n < step;
            const active = n === step;
            return (
              <div key={n} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { if (done) setStep(n); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    active  ? 'bg-blue-600 text-white border-blue-600' :
                    done    ? 'bg-green-50 text-green-700 border-green-200 cursor-pointer hover:bg-green-100' :
                              'bg-white text-gray-400 border-gray-200'
                  }`}
                >
                  {done ? <CheckCircle className="w-3 h-3" /> : <span>{n}</span>}
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-300 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-4">
          {step === 1 && <Step1 form={form} set={set} />}
          {step === 2 && <Step2 form={form} set={set} />}
          {step === 3 && <Step3 form={form} set={set} />}
          {step === 4 && <Step4 form={form} set={set} />}
          {step === 5 && <Step5 form={form} set={set} />}
          {step === 6 && <Step6 form={form} set={set} />}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={step === 1}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 hover:border-gray-300 text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {submitting ? 'Creating…' : 'Create Project'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
