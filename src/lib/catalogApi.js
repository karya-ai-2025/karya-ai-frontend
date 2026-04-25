import {
  Target, Send, Mail, Megaphone, TrendingUp, Globe,
  BarChart3, Radio, Headphones, Bot, Sparkles, Network,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─────────────────────────────────────────────────────────────────────────────
// Icons cannot come from the database (React components).
// Budget ranges and pricing data come from the API.
// ─────────────────────────────────────────────────────────────────────────────

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
    budgetRange:   p.budgetRange || 'Contact for pricing',
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

// Records a marketplace project purchase for the logged-in user.
// Returns the saved purchase data from the backend.
export async function purchaseCatalogProject(slug, tierId) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_URL}/catalog/${slug}/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ tierId }),
  });
  if (!res.ok) throw new Error('Failed to record purchase');
  return res.json();
}

// Removes a catalog project purchase for the logged-in user.
export async function removeCatalogProject(slug) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_URL}/catalog/${slug}/purchase`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error('Failed to remove project');
  return res.json();
}

// Fetches all catalog projects purchased by the logged-in user.
// Merges backend results with any locally-cached purchases (saved when backend was offline).
export async function fetchMyProjects() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const getLocal = () => {
    try {
      return JSON.parse(localStorage.getItem('myProjects') || '[]');
    } catch {
      return [];
    }
  };

  try {
    const res = await fetch(`${API_URL}/catalog/user/my-projects`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch my projects');
    const json = await res.json();
    const backendProjects = json.data.projects || [];

    // Append any locally-cached purchases not yet saved in the backend
    const backendSlugs = new Set(backendProjects.map(p => p.slug));
    const pendingLocal = getLocal().filter(p => !backendSlugs.has(p.slug));

    return [...backendProjects, ...pendingLocal];
  } catch {
    // Backend unavailable — fall back entirely to localStorage
    return getLocal().slice().reverse();
  }
}
