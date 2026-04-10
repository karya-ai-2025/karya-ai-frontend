'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Star, Clock, Users, CheckCircle, MapPin, Zap, Sparkles,
  Target, Send, Mail, Megaphone, TrendingUp, Globe, BarChart3,
  Radio, FileText, Headphones, Handshake, Bot, Rocket,
  Building2, Award, Shield, DollarSign, Trophy, UserCheck,
  ChevronRight, Check, X, Briefcase, Timer, Crown, BadgeCheck,
  MessageSquare, Eye, Quote, Flame, Navigation, Cpu, Layers,
  ThumbsUp, Tag, Code, Wrench, BookOpen, Network, Play,
  ChevronDown, ExternalLink, Banknote, Package, Loader2
} from 'lucide-react';
import NavbarAuth from '@/components/NavbarAuth';
import { fetchProjectBySlug, fetchAllProjects, fetchProjectPricing } from '@/lib/catalogApi';

// ── MOCK EXPERT POOL ──────────────────────────────────────────────────
const EXPERT_POOL = [
  { id: 'e1', name: 'Riya Sharma', title: 'B2B Lead Gen Specialist', initials: 'RS', color: 'from-blue-500 to-blue-700', rating: 4.9, reviews: 47, completed: 82, rate: '$45/hr', location: 'Bangalore', categories: ['outbound', 'outreach'], skills: ['Apollo.io', 'Clay', 'Cold Email', 'ZoomInfo'], exp: 5 },
  { id: 'e2', name: 'Arjun Mehta', title: 'Sales Outreach & CRM Expert', initials: 'AM', color: 'from-orange-500 to-orange-700', rating: 4.8, reviews: 63, completed: 118, rate: '$55/hr', location: 'Mumbai', categories: ['outreach', 'email', 'intelligence'], skills: ['Outreach.io', 'HubSpot', 'Lemlist', 'Copywriting'], exp: 7 },
  { id: 'e3', name: 'Priya Nair', title: 'Brand & Content Strategist', initials: 'PN', color: 'from-violet-500 to-purple-600', rating: 4.9, reviews: 38, completed: 67, rate: '$60/hr', location: 'Delhi', categories: ['brand', 'assistant'], skills: ['LinkedIn', 'Ghostwriting', 'Taplio', 'Content Strategy'], exp: 6 },
  { id: 'e4', name: 'Karan Gupta', title: 'Paid Media & ABM Specialist', initials: 'KG', color: 'from-cyan-500 to-teal-600', rating: 4.7, reviews: 29, completed: 44, rate: '$70/hr', location: 'Bangalore', categories: ['traffic'], skills: ['LinkedIn Ads', 'Google Ads', 'ABM', '6sense'], exp: 8 },
  { id: 'e5', name: 'Ananya Reddy', title: 'SEO & Inbound Growth Expert', initials: 'AR', color: 'from-teal-500 to-green-600', rating: 4.8, reviews: 52, completed: 91, rate: '$50/hr', location: 'Hyderabad', categories: ['traffic', 'brand'], skills: ['SEO', 'Ahrefs', 'CRO', 'Content Marketing'], exp: 5 },
  { id: 'e6', name: 'Rohan Joshi', title: 'Revenue Intelligence Expert', initials: 'RJ', color: 'from-slate-500 to-slate-700', rating: 4.9, reviews: 21, completed: 35, rate: '$80/hr', location: 'Mumbai', categories: ['intelligence', 'outreach'], skills: ['Gong', 'Salesforce', 'Intent Data', 'Bombora'], exp: 9 },
  { id: 'e7', name: 'Divya Singh', title: 'LinkedIn & Social Selling Expert', initials: 'DS', color: 'from-pink-500 to-rose-600', rating: 4.8, reviews: 44, completed: 73, rate: '$40/hr', location: 'Pune', categories: ['relationship', 'brand'], skills: ['LinkedIn', 'Social Selling', 'Dripify', 'Inbox Mgmt'], exp: 4 },
  { id: 'e8', name: 'Vikram Patel', title: 'AI Automation & VA Specialist', initials: 'VP', color: 'from-emerald-500 to-green-600', rating: 4.7, reviews: 58, completed: 102, rate: '$35/hr', location: 'Ahmedabad', categories: ['assistant', 'ai-matching'], skills: ['Zapier', 'Notion', 'Canva', 'Buffer'], exp: 3 },
  { id: 'e9', name: 'Sneha Kapoor', title: 'Email Deliverability & AI Sales Expert', initials: 'SK', color: 'from-green-500 to-emerald-600', rating: 4.8, reviews: 31, completed: 48, rate: '$65/hr', location: 'Chennai', categories: ['email', 'outreach'], skills: ['Instantly.ai', 'Smartlead', 'AI Prompting', 'Deliverability'], exp: 5 },
  { id: 'e10', name: 'Nikhil Bose', title: 'CRM & Sales Ops Specialist', initials: 'NB', color: 'from-amber-500 to-orange-500', rating: 4.9, reviews: 36, completed: 59, rate: '$60/hr', location: 'Kolkata', categories: ['intelligence', 'outreach', 'outbound'], skills: ['HubSpot', 'Salesforce', 'Clay', 'Data Research'], exp: 6 },
  { id: 'e11', name: 'Tanvi Malhotra', title: 'GTM Strategist & Sourcing Expert', initials: 'TM', color: 'from-violet-600 to-blue-600', rating: 4.9, reviews: 19, completed: 28, rate: '$90/hr', location: 'Delhi', categories: ['ai-matching', 'outbound', 'outreach'], skills: ['Talent Vetting', 'GTM Strategy', 'Negotiation', 'Project Mgmt'], exp: 10 },
  { id: 'e12', name: 'Rahul Verma', title: 'Social Listening & Intent Analyst', initials: 'RV', color: 'from-blue-600 to-blue-800', rating: 4.7, reviews: 17, completed: 24, rate: '$55/hr', location: 'Bangalore', categories: ['intelligence', 'brand'], skills: ['Bombora', 'G2 Intent', 'Reddit Monitoring', 'Signal Scoring'], exp: 4 },
];

function getRelevantExperts(project) {
  const matching = EXPERT_POOL.filter(e => e.categories.includes(project.category));
  const rest = EXPERT_POOL.filter(e => !e.categories.includes(project.category));
  return [...matching, ...rest].slice(0, 5);
}

// ── PRICING TIERS (computed) ──────────────────────────────────────────
function getPricingTiers(project) {
  return [
    {
      id: 'expert',
      name: 'Hire an Expert',
      source: 'Expert Marketplace',
      icon: UserCheck,
      tagline: 'Hand-pick one vetted expert from our marketplace',
      price: project.budgetRange,
      priceSuffix: '',
      highlight: false,
      popular: false,
      color: 'blue',
      features: [
        'Choose your own expert from marketplace',
        'Direct 1-on-1 communication',
        'Flexible scope adjustments',
        'Pay per project or hourly',
        'Expert-managed delivery',
        '14-day satisfaction guarantee',
      ],
      turnaround: project.duration,
      support: 'Expert-managed',
      cta: 'Browse Experts',
      ctaLink: '/expert-marketplace',
      ctaExternal: false,
    },
    {
      id: 'agency',
      name: 'Hire an Agency',
      source: 'Agency from Leads',
      icon: Building2,
      tagline: 'Work with a specialist agency from our vetted agency network',
      price: 'Premium pricing',
      priceSuffix: '(1.5–2× expert rate)',
      highlight: true,
      popular: true,
      color: 'orange',
      features: [
        'Dedicated agency team (2–4 specialists)',
        'Account manager included',
        'Faster parallel execution',
        'Proven agency processes & SOPs',
        'Weekly strategy calls',
        '30-day performance guarantee',
      ],
      turnaround: 'Starts within 3 business days',
      support: 'Dedicated account manager',
      cta: 'Find Agencies',
      ctaLink: '/leads',
      ctaExternal: false,
    },
    {
      id: 'platform',
      name: 'Platform Managed',
      source: 'Karya-AI End-to-End',
      icon: Sparkles,
      tagline: 'We handle everything — hiring, delivery, quality, and reporting',
      price: 'Custom quote',
      priceSuffix: '(all-inclusive)',
      highlight: false,
      popular: false,
      color: 'violet',
      features: [
        'Karya-AI assembles your custom team',
        'Full quality control & delivery ownership',
        'Dedicated success manager',
        'Weekly reporting & board-ready dashboards',
        'Replace any team member instantly',
        'SLA-backed delivery guarantee',
      ],
      turnaround: 'Kick-off within 24 hours',
      support: 'Dedicated success manager + AI oversight',
      cta: 'Request Quote',
      ctaLink: null,
      ctaExternal: false,
    },
  ];
}

// ── TEAM PACKAGES ─────────────────────────────────────────────────────
function getTeamPackages(project, experts) {
  const topExperts = [...experts].sort((a, b) => b.rating - a.rating);
  const cheapExperts = [...experts].sort((a, b) => parseInt(a.rate) - parseInt(b.rate));
  const expExperts = [...experts].sort((a, b) => b.exp - a.exp);
  const fastExperts = [...experts].sort((a, b) => b.completed - a.completed);

  return [
    {
      id: 'best',
      icon: Crown,
      label: 'Best Team',
      badge: '⭐ Top Rated',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      description: 'Our highest-rated specialists in this exact domain, hand-picked for quality.',
      experts: topExperts.slice(0, 3),
      avgRating: (topExperts.slice(0, 3).reduce((s, e) => s + e.rating, 0) / 3).toFixed(1),
      priceMultiplier: '1.3×',
      estimatedPrice: `${project.budgetRange} + 30%`,
      delivery: project.duration,
      highlight: true,
      successRate: '97%',
    },
    {
      id: 'fast',
      icon: Timer,
      label: 'Fastest Team',
      badge: '⚡ Quickest Delivery',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      description: 'Experts with the highest project velocity — ideal when you need results ASAP.',
      experts: fastExperts.slice(0, 3),
      avgRating: (fastExperts.slice(0, 3).reduce((s, e) => s + e.rating, 0) / 3).toFixed(1),
      priceMultiplier: '1.2×',
      estimatedPrice: `${project.budgetRange} + 20%`,
      delivery: 'Up to 40% faster',
      highlight: false,
      successRate: '94%',
    },
    {
      id: 'affordable',
      icon: Banknote,
      label: 'Most Affordable',
      badge: '💰 Best Value',
      badgeColor: 'bg-green-100 text-green-700 border-green-200',
      description: 'Same quality standards, optimised for budget. Ideal for startups and testing new channels.',
      experts: cheapExperts.slice(0, 3),
      avgRating: (cheapExperts.slice(0, 3).reduce((s, e) => s + e.rating, 0) / 3).toFixed(1),
      priceMultiplier: '0.7×',
      estimatedPrice: `${project.budgetRange} − 30%`,
      delivery: `${project.duration} + 20%`,
      highlight: false,
      successRate: '91%',
    },
    {
      id: 'experienced',
      icon: BadgeCheck,
      label: 'Most Experienced',
      badge: '🏆 Senior Specialists',
      badgeColor: 'bg-violet-100 text-violet-700 border-violet-200',
      description: 'Experts with 7+ years in this field. Best for complex, high-stakes projects.',
      experts: expExperts.slice(0, 3),
      avgRating: (expExperts.slice(0, 3).reduce((s, e) => s + e.rating, 0) / 3).toFixed(1),
      priceMultiplier: '1.5×',
      estimatedPrice: `${project.budgetRange} + 50%`,
      delivery: project.duration,
      highlight: false,
      successRate: '98%',
    },
    {
      id: 'nearby',
      icon: MapPin,
      label: 'Near You',
      badge: '📍 Local Experts',
      badgeColor: 'bg-teal-100 text-teal-700 border-teal-200',
      description: 'Experts in your city for in-person collaboration, local market knowledge, and same timezone work.',
      experts: project.expertCities.slice(0, 3).map((city, i) => ({
        id: `nearby-${i}`, name: `${city} Expert`, initials: city.slice(0, 2).toUpperCase(),
        color: ['from-teal-500 to-green-600', 'from-blue-500 to-blue-700', 'from-orange-500 to-orange-600'][i],
        rating: 4.7 + (i * 0.1), location: city, rate: '$40/hr',
      })),
      avgRating: '4.8',
      priceMultiplier: '1.0×',
      estimatedPrice: project.budgetRange,
      delivery: project.duration,
      highlight: false,
      successRate: '93%',
    },
  ];
}

const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-pink-100 text-pink-700 border-pink-200',
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'how', label: 'How It Works', icon: Play },
  { id: 'pricing', label: 'Pricing Plans', icon: Tag },
  { id: 'teams', label: 'Team Options', icon: Users },
  { id: 'experts', label: 'Expert Suggestions', icon: UserCheck },
  { id: 'faq', label: 'FAQ', icon: MessageSquare },
];

const DIFFICULTY_COLORS = {
  Beginner: 'bg-green-100 text-green-700',
  Intermediate: 'bg-blue-100 text-blue-700',
  Advanced: 'bg-orange-100 text-orange-700',
};

// ── TIER UI THEME MAP (display-only, keyed by tierId) ────────────────
const TIER_THEME = {
  credit: {
    badgeColor: 'bg-gray-100 text-gray-600 border-gray-200',
    textColor: 'text-gray-700',
    selectedBg: 'bg-gray-50',
    selectedBorder: 'border-gray-400',
    btnSelected: 'bg-gray-700 text-white border-transparent',
  },
  bronze: {
    badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
    textColor: 'text-orange-700',
    selectedBg: 'bg-orange-50',
    selectedBorder: 'border-orange-500',
    btnSelected: 'bg-orange-500 text-white border-transparent',
  },
  silver: {
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    textColor: 'text-blue-700',
    selectedBg: 'bg-blue-50',
    selectedBorder: 'border-blue-600',
    btnSelected: 'bg-blue-600 text-white border-transparent',
  },
  gold: {
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    textColor: 'text-amber-700',
    selectedBg: 'bg-amber-50',
    selectedBorder: 'border-amber-500',
    btnSelected: 'bg-amber-500 text-white border-transparent',
  },
};

// ── FEATURE → TABLE ROW MAPPING ──────────────────────────────────────
const FEATURE_ROWS = [
  { key: 'crmExport',             label: 'Verified contact list (CSV / CRM format)',          type: 'Quantitative', typeColor: 'bg-green-100 text-green-700' },
  { key: 'linkedinProfiles',      label: 'Decision-maker profiles with titles & LinkedIn',     type: 'Qualitative',  typeColor: 'bg-blue-100 text-blue-700' },
  { key: 'emailVerified',         label: 'Email verification & deliverability check',          type: 'Qualitative',  typeColor: 'bg-blue-100 text-blue-700' },
  { key: 'companyIntelligence',   label: 'Company intelligence (size, revenue, tech stack)',   type: 'Qualitative',  typeColor: 'bg-blue-100 text-blue-700' },
  { key: 'decisionMakerProfiles', label: 'Custom outreach sequence templates (3 variants)',   type: 'Qualitative',  typeColor: 'bg-blue-100 text-blue-700' },
  { key: 'icpScoring',            label: 'ICP score & fit rating for each contact',            type: 'AI',           typeColor: 'bg-violet-100 text-violet-700' },
  { key: 'intentData',            label: 'Revenue intelligence & buying intent signals',       type: 'AI',           typeColor: 'bg-violet-100 text-violet-700' },
  { key: 'dedicatedPM',           label: 'Dedicated account manager',                          type: 'Support',      typeColor: 'bg-orange-100 text-orange-700' },
  { key: 'abTesting',             label: 'A/B testing & weekly optimisation reports',          type: 'Support',      typeColor: 'bg-orange-100 text-orange-700' },
];

// ── MAIN PAGE ─────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTier = searchParams.get('tier');

  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedHireMode, setSelectedHireMode] = useState('agency');
  const [selectedPriceTier, setSelectedPriceTier] = useState(urlTier || 'silver');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [pricingTiersFromApi, setPricingTiersFromApi] = useState([]);
  const [userRole, setUserRole] = useState('owner');
  const [userCity, setUserCity] = useState('');
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [pitch, setPitch] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  // Fetch project + pricing tiers from backend
  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      fetchProjectBySlug(projectId),
      fetchProjectPricing(projectId),
    ])
      .then(([proj, tiers]) => {
        setProject(proj);
        setPricingTiersFromApi(tiers || []);
      })
      .catch(() => setProject(null))
      .finally(() => setLoadingProject(false));
  }, [projectId]);

  useEffect(() => {
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.activeRole === 'expert' ? 'expert' : 'owner');
      } catch { }
    }
  }, []);

  if (loadingProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-2">Project not found</p>
          <Link href="/project-marketplace" className="text-blue-600 hover:underline text-sm">← Back to marketplace</Link>
        </div>
      </div>
    );
  }

  const Icon = project.icon;
  const experts = getRelevantExperts(project);
  const pricingTiers = getPricingTiers(project);
  const teamPackages = getTeamPackages(project, experts);
  const selectedTier = pricingTiers.find(t => t.id === selectedHireMode);
  // DB-driven credit/bronze/silver/gold tiers — augmented with display theme
  const dbPriceTiers = pricingTiersFromApi.map(t => ({
    ...t,
    ...(TIER_THEME[t.tierId] || TIER_THEME.silver),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Karya<span className="text-blue-600">AI</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/project-marketplace" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors hidden sm:block">Project Marketplace</Link>
            <NavbarAuth theme="light" loginRole={userRole === 'expert' ? 'expert' : 'owner'} />
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/project-marketplace" className="hover:text-blue-600 transition-colors">Project Marketplace</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="capitalize">{project.category.replace('-', ' ')}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate">{project.title}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-6 py-8">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Title block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_COLORS[project.difficulty]}`}>{project.difficulty}</span>
                {project.badge && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-orange-500 text-white">{project.badge}</span>
                )}
                {project.trending && (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                    <Flame className="w-3 h-3" /> Trending
                  </span>
                )}
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${project.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${project.textColor} mb-0.5`}>{project.number}</p>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{project.title}</h1>
                  <p className="text-base text-gray-500 mt-1">{project.subtitle}</p>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed max-w-2xl text-sm mb-5">{project.description}</p>

              {/* Key metrics */}
              <div className="flex flex-wrap items-center gap-5 mb-5 pb-5 border-b border-gray-100">
                {[
                  { icon: Star, label: `${project.avgRating} Rating`, color: 'text-amber-500', fill: true },
                  { icon: Users, label: `${project.expertCount} Experts`, color: 'text-blue-500' },
                  { icon: CheckCircle, label: `${project.completedCount} Completed`, color: 'text-green-500' },
                  { icon: Clock, label: project.duration, color: 'text-gray-500' },
                  { icon: MapPin, label: `${project.expertCities.length} Cities`, color: 'text-orange-500' },
                ].map((m, i) => {
                  const MI = m.icon;
                  return (
                    <div key={i} className="flex items-center gap-1.5 text-sm">
                      <MI className={`w-4 h-4 ${m.color} ${m.fill ? 'fill-amber-400' : ''}`} />
                      <span className="font-semibold text-gray-900">{m.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Success story banner */}
              <div className={`flex items-start gap-3 ${project.bgLight} border ${project.borderColor} rounded-xl px-4 py-3`}>
                <Trophy className={`w-5 h-5 ${project.textColor} flex-shrink-0 mt-0.5`} />
                <div>
                  <p className={`text-xs font-bold ${project.textColor} uppercase tracking-wide mb-0.5`}>Proven Result</p>
                  <p className={`text-sm ${project.textColor} font-medium`}>
                    {project.successHighlight || '22 hours/week saved — content, emails & community managed end-to-end'}
                  </p>
                </div>
                {(project.successROI) && (
                  <span className={`ml-auto text-sm font-bold px-3 py-1 rounded-full ${project.bgLight} ${project.textColor} border ${project.borderColor} flex-shrink-0`}>
                    {project.successROI}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Project at a Glance panel */}
            <div className="lg:w-80 flex-shrink-0 hidden lg:block space-y-4">
              {/* Quick stats grid */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className={`${project.bgLight} border-b ${project.borderColor} px-5 py-3`}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Project at a Glance</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
                  {[
                    { label: 'Avg Rating', value: `⭐ ${project.avgRating}`, sub: `${project.completedCount} reviews` },
                    { label: 'Completed', value: `${project.completedCount}+`, sub: 'successful projects' },
                    { label: 'Experts', value: `${project.expertCount}`, sub: 'available now' },
                    { label: 'Timeline', value: project.duration.split('–')[0].trim(), sub: 'to complete' },
                  ].map((s) => (
                    <div key={s.label} className="px-4 py-3">
                      <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
                      <p className="text-base font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-400">{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cities with experts */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Experts Available In</p>
                <div className="space-y-2">
                  {project.expertCities.slice(0, 5).map((city) => {
                    const count = project.nearbyExpertCount?.[city] || 1;
                    const pct = Math.min(100, (count / (project.expertCount || 1)) * 100 + 30);
                    return (
                      <div key={city} className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 w-20 flex-shrink-0">{city}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                  {project.expertCities.length > 5 && (
                    <p className="text-xs text-gray-400 pl-5">+{project.expertCities.length - 5} more cities</p>
                  )}
                </div>
              </div>

              {/* Subject tags */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Covers These Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.subjects.map((s, i) => (
                    <span key={s} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-0 scrollbar-hide">
            {TABS.map((tab) => {
              const TI = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <TI className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        <div className="flex gap-8">

          {/* Left: Tab content */}
          <div className="flex-1 min-w-0">

            {/* ── OVERVIEW TAB ─────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Subjects */}
                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">What This Project Covers</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.subjects.map((subj, i) => (
                      <span key={subj} className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}>
                        <Code className="w-3.5 h-3.5" /> {subj}
                      </span>
                    ))}
                  </div>
                </section>

                {/* What's included */}
                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">What's Included</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {project.subProjects.map((sub, i) => (
                      <div key={sub} className={`flex items-center gap-3 p-4 ${project.bgLight} border ${project.borderColor} rounded-xl`}>
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${project.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{i + 1}</div>
                        <span className={`text-sm font-semibold ${project.textColor}`}>{sub}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Pricing Tier Selector */}
                <PricingTierSelector
                  selectedHireMode={selectedHireMode}
                  selectedPriceTier={selectedPriceTier}
                  setSelectedPriceTier={setSelectedPriceTier}
                  project={project}
                  dbPriceTiers={dbPriceTiers}
                />

                {/* Tools */}
                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Tools & Technologies Used</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <span key={tool} className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg shadow-sm hover:border-blue-200 transition-colors">
                        <Wrench className="w-3.5 h-3.5 text-gray-400" /> {tool}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Best For */}
                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Best For</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.targetFor.map((t) => (
                      <span key={t} className="text-sm font-semibold px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full">{t}</span>
                    ))}
                  </div>
                </section>

                {/* Available Cities */}
                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Expert Availability by City</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {project.expertCities.map((city) => {
                      const count = project.nearbyExpertCount?.[city] || 1;
                      return (
                        <div key={city} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:border-green-200 hover:bg-green-50 transition-all group">
                          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                            <MapPin className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{city}</p>
                            <p className="text-xs text-gray-500">{count} expert{count !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {/* ── HOW IT WORKS TAB ──────────────────────── */}
            {activeTab === 'how' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Step-by-Step Process</h2>
                  <p className="text-sm text-gray-500 mb-6">Here's exactly how this project runs from start to delivery.</p>
                </div>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-orange-200 hidden sm:block" />
                  <div className="space-y-4">
                    {project.howItWorks.map((step, i) => (
                      <div key={i} className="flex items-start gap-5">
                        <div className={`relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br ${project.gradient} flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-blue-100 hover:shadow-md transition-all">
                          <p className="text-base font-semibold text-gray-900 mb-1">Step {i + 1}</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                        </div>
                      </div>
                    ))}
                    {/* Final delivery step */}
                    <div className="flex items-start gap-5">
                      <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
                        <p className="text-base font-semibold text-green-800 mb-1">Project Complete</p>
                        <p className="text-sm text-green-700 leading-relaxed">All deliverables handed over, reviewed, and approved. Post-delivery support included for 7 days.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline estimate */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-800 mb-0.5">Estimated Timeline</p>
                    <p className="text-lg font-bold text-blue-900">{project.duration}</p>
                    <p className="text-xs text-blue-600 mt-0.5">Varies slightly by scope. Your expert confirms timeline before starting.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── PRICING PLANS TAB ────────────────────── */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Choose How You Want to Work</h2>
                  <p className="text-sm text-gray-500">Three ways to get this project done — from self-service to fully managed.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {pricingTiers.map((tier) => {
                    const TIcon = tier.icon;
                    const isSelected = selectedHireMode === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedHireMode(tier.id)}
                        className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                          tier.popular
                            ? isSelected
                              ? 'border-orange-500 bg-orange-50 shadow-lg'
                              : 'border-orange-300 bg-orange-50/50 shadow-md hover:shadow-lg'
                            : isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm'
                        }`}
                      >
                        {tier.popular && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                            <span className="bg-gradient-to-r from-blue-600 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                              Most Recommended
                            </span>
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${tier.popular ? 'bg-gradient-to-br from-blue-600 to-orange-500' : tier.color === 'violet' ? 'bg-gradient-to-br from-violet-600 to-blue-600' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                            <TIcon className="w-5 h-5 text-white" />
                          </div>
                          {isSelected && <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></div>}
                        </div>

                        <div className="mb-1">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{tier.source}</p>
                          <h3 className="text-lg font-bold text-gray-900 mt-0.5">{tier.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{tier.tagline}</p>

                        <div className="mb-4">
                          <p className="text-xl font-bold text-gray-900">{tier.price}</p>
                          {tier.priceSuffix && <p className="text-xs text-gray-400">{tier.priceSuffix}</p>}
                        </div>

                        <div className="space-y-2 mb-5">
                          {tier.features.map((f) => (
                            <div key={f} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">{f}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> <span>{tier.turnaround}</span></div>
                          <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> <span>{tier.support}</span></div>
                        </div>

                        <div className="mt-5">
                          <Link href={`/project-marketplace/${projectId}/overview?tier=${selectedPriceTier}&mode=${tier.id}`}
                            className={`w-full block py-2.5 text-center rounded-xl text-sm font-semibold transition-all ${
                              tier.popular ? 'bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white shadow-md' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}>
                            Accept & Proceed →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TEAM OPTIONS TAB ─────────────────────── */}
            {activeTab === 'teams' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Choose Your Team Package</h2>
                  <p className="text-sm text-gray-500">Different team configurations for different needs — quality, speed, budget, or location.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {teamPackages.map((pkg) => {
                    const PKGIcon = pkg.icon;
                    const isSelected = selectedTeam === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedTeam(pkg.id)}
                        className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'border-blue-500 shadow-md bg-blue-50/30' : pkg.highlight ? 'border-amber-300 shadow-sm' : 'border-gray-200'
                        }`}
                      >
                        {pkg.highlight && !isSelected && (
                          <div className="flex justify-end mb-2">
                            <span className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">Recommended</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            pkg.id === 'best' ? 'bg-amber-100' : pkg.id === 'fast' ? 'bg-blue-100' : pkg.id === 'affordable' ? 'bg-green-100' : pkg.id === 'experienced' ? 'bg-violet-100' : 'bg-teal-100'
                          }`}>
                            <PKGIcon className={`w-5 h-5 ${
                              pkg.id === 'best' ? 'text-amber-600' : pkg.id === 'fast' ? 'text-blue-600' : pkg.id === 'affordable' ? 'text-green-600' : pkg.id === 'experienced' ? 'text-violet-600' : 'text-teal-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-base">{pkg.label}</h3>
                            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${pkg.badgeColor}`}>{pkg.badge}</span>
                          </div>
                          {isSelected && <div className="ml-auto w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></div>}
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed mb-4">{pkg.description}</p>

                        {/* Expert avatars */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex -space-x-2">
                            {pkg.experts.slice(0, 3).map((exp, i) => (
                              <div key={exp.id || i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${exp.color || 'from-blue-500 to-blue-700'} border-2 border-white flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                {exp.initials || exp.name?.slice(0, 2).toUpperCase()}
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 ml-1">
                            <span className="font-semibold text-gray-700">⭐ {pkg.avgRating}</span> avg · {pkg.successRate} success
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-gray-50 rounded-lg p-2.5">
                            <p className="text-xs text-gray-400 mb-0.5">Estimated Price</p>
                            <p className="text-xs font-bold text-gray-800">{pkg.estimatedPrice}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2.5">
                            <p className="text-xs text-gray-400 mb-0.5">Delivery</p>
                            <p className="text-xs font-bold text-gray-800">{pkg.delivery}</p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedTeam(pkg.id); setActiveTab('pricing'); }}
                          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-md'
                              : 'border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-200'
                          }`}
                        >
                          {isSelected ? 'Selected ✓' : 'Select This Team'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── EXPERT SUGGESTIONS TAB ───────────────── */}
            {activeTab === 'experts' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Suggested Experts for This Project</h2>
                  <p className="text-sm text-gray-500">These experts have verified experience in {project.title.toLowerCase()} and related skills.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {experts.map((exp, idx) => {
                    const matchPct = 88 + (idx === 0 ? 8 : idx === 1 ? 5 : idx === 2 ? 3 : idx === 3 ? 1 : -3);
                    return (
                      <div key={exp.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exp.color} flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm`}>
                            {exp.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-bold text-gray-900">{exp.name}</h3>
                              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">{matchPct}% match</span>
                            </div>
                            <p className="text-sm text-gray-500">{exp.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{exp.rating} ({exp.reviews})</span>
                              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" />{exp.completed} done</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{exp.location}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-sm font-bold text-gray-900">{exp.rate}</p>
                            <p className="text-xs text-gray-400">{exp.exp}y exp</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {exp.skills.map(skill => (
                            <span key={skill} className="text-xs border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full font-medium">{skill}</span>
                          ))}
                        </div>

                        {/* Match bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Project Match</span>
                            <span className="font-semibold text-blue-700">{matchPct}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-orange-400 rounded-full transition-all" style={{ width: `${matchPct}%` }} />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/expert-marketplace`}
                            className="flex-1 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                            <Eye className="w-4 h-4" /> View Profile
                          </Link>
                          <button
                            onClick={() => userRole === 'expert' ? null : setShowApplyForm(true)}
                            className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5">
                            <Send className="w-4 h-4" /> {userRole === 'expert' ? 'Connect' : 'Invite'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center pt-4">
                  <Link href="/expert-marketplace" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 hover:border-blue-200 transition-all shadow-sm">
                    View All Experts in Marketplace <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* ── FAQ TAB ──────────────────────────────── */}
            {activeTab === 'faq' && (
              <div className="space-y-4 max-w-2xl">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
                  <p className="text-sm text-gray-500">Common questions about this project.</p>
                </div>
                {project.faq.map((item, i) => (
                  <details key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group shadow-sm">
                    <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                      <span className="text-sm font-semibold text-gray-900">{item.q}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-5 pb-5">
                      <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                    </div>
                  </details>
                ))}

                <div className="bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4 mt-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Still have questions?</p>
                    <p className="text-sm text-gray-600 mb-3">Our team is available to walk you through this project, help scope it for your needs, and connect you with the right expert.</p>
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                      Talk to a consultant <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky hire card */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-[120px]">
              <HireCard
                project={project}
                pricingTiers={pricingTiers}
                dbPriceTiers={dbPriceTiers}
                selectedHireMode={selectedHireMode}
                setSelectedHireMode={setSelectedHireMode}
                selectedPriceTier={selectedPriceTier}
                setSelectedPriceTier={setSelectedPriceTier}
                userRole={userRole}
                selectedTier={selectedTier}
                onApply={() => setShowApplyForm(true)}
                projectId={projectId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Related projects */}
      <RelatedProjects currentProject={project} />

      {/* Apply / Expert pitch modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setShowApplyForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {applySubmitted ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Application Sent!</h2>
                <p className="text-sm text-gray-500 mb-5">We'll match you with the right team and get back to you within 24 hours.</p>
                <button onClick={() => { setShowApplyForm(false); setApplySubmitted(false); }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-orange-600">Done</button>
              </div>
            ) : (
              <>
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{userRole === 'expert' ? 'Apply to This Project' : 'Get Started'}</h2>
                    <p className="text-sm text-gray-500">{project.title}</p>
                  </div>
                  <button onClick={() => setShowApplyForm(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{userRole === 'expert' ? 'Your pitch' : 'Tell us about your needs'} <span className="text-red-500">*</span></label>
                    <textarea value={pitch} onChange={e => setPitch(e.target.value)} required rows={4}
                      placeholder={userRole === 'expert' ? "Why are you the right fit? Highlight relevant experience..." : "What are your goals? Any specific requirements or timeline?"}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-400" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowApplyForm(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
                    <button onClick={() => { if (pitch.trim()) setApplySubmitted(true); }}
                      className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" /> Submit
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PRICING TIER SELECTOR ─────────────────────────────────────────────
function PricingTierSelector({ selectedHireMode, selectedPriceTier, setSelectedPriceTier, project, dbPriceTiers }) {
  if (selectedHireMode === 'platform') {
    return (
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">What's Included</h2>
        <div className="bg-gradient-to-br from-violet-50 to-blue-50 border-2 border-violet-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Platform Managed — All Inclusive</h3>
              <p className="text-sm text-gray-500">Everything handled by Karya-AI. No tiers, no limits.</p>
            </div>
            <div className="ml-auto text-right flex-shrink-0">
              <p className="text-lg font-bold text-violet-700">{project.budgetRange || 'Custom Quote'}</p>
              <p className="text-[10px] text-violet-500 font-semibold uppercase tracking-wide">all-inclusive</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {FEATURE_ROWS.map((row) => (
              <div key={row.key} className="flex items-start gap-3 bg-white rounded-xl p-3.5 border border-violet-100 shadow-sm">
                <div className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-violet-600" />
                </div>
                <span className="text-sm text-gray-700 font-medium">{row.label}</span>
              </div>
            ))}
            <div className="flex items-start gap-3 bg-white rounded-xl p-3.5 border border-violet-100 shadow-sm">
              <div className="w-5 h-5 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-violet-600" />
              </div>
              <span className="text-sm text-gray-700 font-medium">Unlimited output quantity</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-4 border-t border-violet-200">
            <Shield className="w-4 h-4 text-violet-600 flex-shrink-0" />
            <p className="text-sm text-violet-700 font-semibold">SLA-backed · Dedicated success manager · Weekly reporting</p>
          </div>
        </div>
      </section>
    );
  }

  if (!dbPriceTiers.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Select Your Package</h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">Click a tier to select</span>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full min-w-[620px] border-collapse">
          <thead>
            <tr>
              <th className="text-left px-5 py-4 bg-gray-50 border-b border-r border-gray-200 text-sm font-semibold text-gray-500 w-[38%]">
                Deliverables
              </th>
              {dbPriceTiers.map((tier) => {
                const isSelected = selectedPriceTier === tier.tierId;
                return (
                  <th
                    key={tier.tierId}
                    onClick={() => setSelectedPriceTier(tier.tierId)}
                    className={`px-4 py-0 border-b border-r last:border-r-0 border-gray-200 text-center cursor-pointer transition-all relative ${
                      isSelected ? `${tier.selectedBg} border-b-2 ${tier.selectedBorder}` : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="py-4">
                      {tier.popular && (
                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-1">Most Popular</div>
                      )}
                      <p className={`text-sm font-bold ${isSelected ? tier.textColor : 'text-gray-900'}`}>{tier.name}</p>
                      <p className={`text-sm font-bold mt-0.5 ${isSelected ? tier.textColor : 'text-gray-700'}`}>{tier.priceLabel}</p>
                      {tier.badge && (
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1.5 ${tier.badgeColor}`}>{tier.badge}</span>
                      )}
                      {isSelected && (
                        <div className="mt-2">
                          <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full">Selected ✓</span>
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {FEATURE_ROWS.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5 border-r border-gray-100">
                  <div className="flex items-start gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${row.typeColor}`}>{row.type}</span>
                    <span className="text-sm text-gray-700 font-medium">{row.label}</span>
                  </div>
                </td>
                {dbPriceTiers.map((tier) => {
                  const isSelected = selectedPriceTier === tier.tierId;
                  const included = !!tier.features?.[row.key];
                  return (
                    <td
                      key={tier.tierId}
                      onClick={() => setSelectedPriceTier(tier.tierId)}
                      className={`px-4 py-3.5 text-center border-r last:border-r-0 border-gray-100 cursor-pointer transition-all ${isSelected ? tier.selectedBg : ''}`}
                    >
                      {included ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full mx-auto">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full mx-auto">
                          <X className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Output quantity row */}
            <tr className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3.5 border-r border-gray-100">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 bg-teal-100 text-teal-700">Output</span>
                  <span className="text-sm text-gray-700 font-medium">Output quantity (contacts)</span>
                </div>
              </td>
              {dbPriceTiers.map((tier) => {
                const isSelected = selectedPriceTier === tier.tierId;
                const val = tier.contacts != null
                  ? tier.contacts === 0 ? 'Unlimited' : tier.contacts.toLocaleString('en-IN')
                  : '—';
                return (
                  <td
                    key={tier.tierId}
                    onClick={() => setSelectedPriceTier(tier.tierId)}
                    className={`px-4 py-3.5 text-center border-r last:border-r-0 border-gray-100 cursor-pointer transition-all ${isSelected ? tier.selectedBg : ''}`}
                  >
                    <span className={`text-sm font-bold ${val === 'Unlimited' ? 'text-amber-600' : isSelected ? tier.textColor : 'text-gray-800'}`}>
                      {val}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200">
              <td className="px-5 py-4 text-sm font-semibold text-gray-500 border-r border-gray-200">Choose this plan</td>
              {dbPriceTiers.map((tier) => {
                const isSelected = selectedPriceTier === tier.tierId;
                return (
                  <td key={tier.tierId} className="px-4 py-4 text-center border-r last:border-r-0 border-gray-200">
                    <button
                      onClick={() => setSelectedPriceTier(tier.tierId)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected ? tier.btnSelected + ' shadow-sm' : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white'
                      }`}
                    >
                      {isSelected ? 'Selected ✓' : 'Select'}
                    </button>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2 ml-1">* Prices are indicative. Final pricing confirmed on the overview page.</p>
    </section>
  );
}

// ── HIRE CARD ─────────────────────────────────────────────────────────
function HireCard({ project, pricingTiers, dbPriceTiers, selectedHireMode, setSelectedHireMode, selectedPriceTier, setSelectedPriceTier, userRole, selectedTier, onApply, projectId }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      {(() => {
        const activeTier = dbPriceTiers.find(t => t.tierId === selectedPriceTier);
        const displayPrice = selectedHireMode === 'platform' ? (project.budgetRange || 'Custom Quote') : (activeTier?.priceLabel || project.budgetRange);
        const displayLabel = selectedHireMode === 'platform' ? 'Platform Managed' : `${activeTier?.name || ''} Plan Selected`;
        return (
          <div className={`${project.bgLight} border-b ${project.borderColor} px-5 py-4`}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{displayLabel}</p>
            <p className="text-2xl font-bold text-gray-900">{displayPrice}</p>
            <p className="text-xs text-gray-500 mt-1">{project.duration} · {project.difficulty}</p>
          </div>
        );
      })()}

      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Choose How to Hire</p>
        <div className="space-y-2">
          {pricingTiers.map((tier) => {
            const TI = tier.icon;
            const isSelected = selectedHireMode === tier.id;
            return (
              <label key={tier.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="hireMode" value={tier.id} checked={isSelected} onChange={() => setSelectedHireMode(tier.id)} className="mt-1 accent-blue-600" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{tier.name}</p>
                    {tier.popular && <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-1.5 py-0.5 rounded">Recommended</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{tier.tagline.slice(0, 50)}...</p>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">{tier.price}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="px-5 pb-5 space-y-3">
        {userRole === 'expert' ? (
          <button onClick={onApply}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2">
            <Send className="w-4 h-4" /> Apply to This Project
          </button>
        ) : (
          <Link href={`/project-marketplace/${projectId}/overview?tier=${selectedPriceTier}&mode=${selectedHireMode}`}
            className="w-full block py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-md text-sm text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> Accept & Proceed
          </Link>
        )}
        <button className="w-full py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4" /> Talk to a Consultant
        </button>
      </div>

      {/* Stats */}
      <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
        {[
          { icon: Star, value: project.avgRating, label: 'Rating', color: 'text-amber-500' },
          { icon: CheckCircle, value: project.completedCount + '+', label: 'Done', color: 'text-green-500' },
          { icon: Users, value: project.expertCount, label: 'Experts', color: 'text-blue-500' },
        ].map((s, i) => {
          const SI = s.icon;
          return (
            <div key={i} className="flex flex-col items-center py-3">
              <SI className={`w-3.5 h-3.5 ${s.color} mb-0.5`} />
              <p className="text-sm font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── RELATED PROJECTS ──────────────────────────────────────────────────
function RelatedProjects({ currentProject }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!currentProject?.category) return;
    fetchAllProjects({ category: currentProject.category })
      .then(({ projects }) => {
        setRelated(
          projects
            .filter(p => p.slug !== currentProject.slug)
            .slice(0, 3)
        );
      })
      .catch(() => {});
  }, [currentProject?.slug]);

  if (!related.length) return null;

  return (
    <div className="border-t border-gray-200 bg-white mt-8">
      <div className="max-w-[1920px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Related Projects</h2>
            <p className="text-sm text-gray-500 mt-0.5">Other projects that pair well with {currentProject.title}</p>
          </div>
          <Link href="/project-marketplace" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {related.map((p) => {
            const PI = p.icon;
            return (
              <Link key={p.id} href={`/project-marketplace/${p.id}`}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all group">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <PI className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{p.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{p.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {p.avgRating}</span>
                  <span className="font-semibold text-gray-700">{p.budgetRange}</span>
                  <span className="flex items-center gap-1 text-blue-600 font-semibold">View <ChevronRight className="w-3 h-3" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
