import {
  Target, Send, Mail, Megaphone, TrendingUp, Globe,
  BarChart3, Radio, Headphones, Handshake, Bot, Sparkles, Network,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─────────────────────────────────────────────────────────────────────────────
// Icons + budget ranges cannot come from the database.
// These maps let us attach UI-only data after fetching from the API.
// ─────────────────────────────────────────────────────────────────────────────
const SLUG_TO_BUDGET = {
  'outbound-list-builder':            '₹15,000 – ₹75,000',
  'sales-outreach-automation':        '₹20,000 – ₹90,000',
  'ai-email-sales-agency':            '₹40,000 – ₹1,50,000/mo',
  'brand-voice-thought-leadership':   '₹15,000 – ₹60,000/mo',
  'traffic-abm-agency':               '₹50,000 – ₹2,00,000/mo',
  'inbound-aggregation':              '₹20,000 – ₹80,000/mo',
  'intent-social-listening':          '₹15,000 – ₹60,000/mo',
  'connection-relationship-manager':  '₹10,000 – ₹35,000/mo',
  'demo-prep-crm-research':           '₹8,000 – ₹35,000/mo',
  'call-intelligence-crm':            '₹20,000 – ₹75,000',
  'virtual-assistant-marketing':      '₹25,000 – ₹80,000/mo',
  'ai-expert-matching':               'Free + 10% on hire',
};

export const SLUG_TO_ICON = {
  'outbound-list-builder':        Target,
  'sales-outreach-automation':    Send,
  'ai-email-sales-agency':        Mail,
  'brand-voice-thought-leadership': Megaphone,
  'traffic-abm-agency':           TrendingUp,
  'inbound-aggregation':          Globe,
  'intent-social-listening':      Radio,
  'connection-relationship-manager': Network,
  'demo-prep-crm-research':       Headphones,
  'call-intelligence-crm':        BarChart3,
  'virtual-assistant-marketing':  Bot,
  'ai-expert-matching':           Sparkles,
};

// Attach icon + flatten theme/stats fields so existing components don't break
export function normalizeProject(p) {
  return {
    ...p,
    id:            p.slug,
    icon:          SLUG_TO_ICON[p.slug] || Target,
    // theme
    gradient:      p.theme?.gradient   || 'from-blue-500 to-blue-700',
    bgLight:       p.theme?.bgLight    || 'bg-blue-50',
    textColor:     p.theme?.textColor  || 'text-blue-700',
    borderColor:   p.theme?.borderColor || 'border-blue-200',
    // stats
    expertCount:   p.stats?.expertCount    || 0,
    completedCount: p.stats?.completedCount || 0,
    avgRating:     p.stats?.avgRating      || 0,
    trendingCount: p.stats?.trendingCount  || 0,
    trendingLabel: p.stats?.trendingLabel  || '',
    nearbyExpertCount: p.stats?.nearbyExpertCount || {},
    matchScore:    p.stats?.matchScore     || {},
    // flags
    trending:      p.isTrending || false,
    // budget range display string
    budgetRange:   p.budgetRange || SLUG_TO_BUDGET[p.slug] || 'Contact for pricing',
    // ensure arrays are never undefined
    expertSkills:  p.expertSkills  || [],
    targetFor:     p.targetFor     || [],
    deliverables:  p.deliverables  || [],
    tools:         p.tools         || [],
    howItWorks:    p.howItWorks    || [],
    subProjects:   p.subProjects   || [],
    faq:           p.faq           || [],
    // pricing tiers are already on p.pricingTiers if populated
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// API CALLS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAllProjects(params = {}) {
  const qs = new URLSearchParams();
  if (params.category && params.category !== 'all') qs.set('category', params.category);
  if (params.featured)  qs.set('featured', 'true');
  if (params.trending)  qs.set('trending', 'true');
  if (params.search)    qs.set('search', params.search);
  if (params.limit)     qs.set('limit', params.limit);
  if (params.page)      qs.set('page', params.page);

  const res = await fetch(`${API_URL}/catalog?${qs.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch projects');
  const json = await res.json();
  return {
    projects: json.data.projects.map(normalizeProject),
    pagination: json.data.pagination,
  };
}

export async function fetchProjectBySlug(slug) {
  const res = await fetch(`${API_URL}/catalog/${slug}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Project not found');
  const json = await res.json();
  return normalizeProject(json.data.project);
}

export async function fetchProjectPricing(slug) {
  const res = await fetch(`${API_URL}/catalog/${slug}/pricing`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch pricing');
  const json = await res.json();
  return json.data.tiers; // array of 4 tier objects
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/catalog/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  const json = await res.json();
  return json.data.categories;
}
