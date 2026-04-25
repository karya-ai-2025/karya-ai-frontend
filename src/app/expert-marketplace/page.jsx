'use client';

// pages/ExpertMarketplace.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Filter, Grid, List, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Star, MapPin, Clock, Briefcase, Heart, MessageSquare, Shield, Zap, Award,
  TrendingUp, Users, Target, BarChart3, Mail, DollarSign, Calendar, Globe,
  Check, X, RefreshCw, ArrowUpDown, SlidersHorizontal, BookOpen, Loader2
} from 'lucide-react';
import NavbarAuth from '@/components/NavbarAuth';
import { getOnboardingStatus } from '@/services/onboardingApi';

// ============================================
// INLINE API FUNCTIONS
// ============================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiCall = async (endpoint) => {
  console.log(`[Marketplace API] GET ${API_URL}${endpoint}`);
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    const data = await response.json();
    console.log(`[Marketplace API] Response:`, data);
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error(`[Marketplace API] Error:`, error);
    throw error;
  }
};

const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) query.append(key, value.join(','));
      } else {
        query.append(key, value);
      }
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

const getExperts = async (options = {}) => {
  const queryString = buildQueryString(options);
  return apiCall(`/marketplace/experts${queryString}`);
};

const getFeaturedExpert = async () => {
  return apiCall('/marketplace/experts/featured');
};

const getFilterOptions = async () => {
  return apiCall('/marketplace/filters');
};

// ============================================
// TOOL ICONS
// ============================================
const toolIcons = {
  'Salesforce': '🔵', 'HubSpot': '🟠', 'Pipedrive': '🟢', 'Marketo': '🟣',
  'Pardot': '🔷', 'ActiveCampaign': '🔴', 'Google Analytics': '📊', 'Mixpanel': '📈',
  'Amplitude': '📉', 'Google Ads': '🎯', 'Facebook Ads': '📘', 'LinkedIn Ads': '💼',
  'Ahrefs': '🔍', 'SEMrush': '🔎', 'Moz': '📍', 'Mailchimp': '🐵', 'SendGrid': '✉️',
  'Outreach': '📤', 'Apollo': '🚀', 'Slack': '💬', 'Notion': '📝', 'Asana': '🎨',
  'Monday': '🗓️', 'Figma': '🎨', 'Webflow': '🌐', 'Zapier': '⚡', 'Segment': '📊',
  'Intercom': '💭', 'Drift': '🤖', 'Zendesk': '🎫'
};

// Default filter options (used when API fails or loading)
const defaultExpertiseCategories = [
  "Growth Marketing", "Sales Development", "Content Strategy",
  "SEO & Performance Marketing", "Paid Advertising", "Email Marketing & Automation",
  "Social Media & Community", "Product Marketing", "Partnership & BD",
  "Revenue Operations", "Customer Success & Retention"
];

const defaultIndustryOptions = [
  "B2B SaaS", "E-commerce / DTC", "Fintech", "Healthcare", "Edtech",
  "Marketplace", "Enterprise Software", "Mobile Apps", "Other"
];

const defaultToolOptions = [
  { category: "CRM", tools: ["Salesforce", "HubSpot", "Pipedrive"] },
  { category: "Marketing", tools: ["Marketo", "Pardot", "ActiveCampaign"] },
  { category: "Analytics", tools: ["Google Analytics", "Mixpanel", "Amplitude"] },
  { category: "Ads", tools: ["Google Ads", "Facebook Ads", "LinkedIn Ads"] },
  { category: "SEO", tools: ["Ahrefs", "SEMrush", "Moz"] },
  { category: "Email", tools: ["Mailchimp", "SendGrid", "Outreach", "Apollo"] }
];

const availabilityOptions = [
  "Available now", "Available within 1 week", "Available within 1 month"
];

const projectRanges = [
  { label: "1-5 projects", value: "1-5" },
  { label: "5-20 projects", value: "5-20" },
  { label: "20-50 projects", value: "20-50" },
  { label: "50+ projects", value: "50+" }
];

const defaultTimezones = [
  "PST (UTC-8)", "MST (UTC-7)", "CST (UTC-6)", "EST (UTC-5)",
  "GMT (UTC+0)", "CET (UTC+1)", "IST (UTC+5:30)", "JST (UTC+9)"
];

// ============================================
// MAIN COMPONENT
// ============================================
function ExpertMarketplace() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // View states
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('match');
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [savedExperts, setSavedExperts] = useState([]);
  const [toolSearch, setToolSearch] = useState('');

  // Data states
  const [experts, setExperts] = useState([]);
  const [featuredExpert, setFeaturedExpert] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState({
    expertise: true, industry: true, tools: false, availability: true,
    pricing: true, rating: true, projects: false, location: false
  });

  // Filter states
  const [filters, setFilters] = useState({
    expertise: [], industries: [], tools: [], availability: [],
    priceRange: [50, 250], minRating: 0, projectRange: null, timezones: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  const expertsPerPage = 12;

  // Business user's industry for personalized matching
  const [businessIndustry, setBusinessIndustry] = useState('');

  // Project context — set when navigating from a project page
  const [projectContext, setProjectContext] = useState(null); // { title, expertise[] }

  // Get filter options from API or defaults
  const expertiseCategories = filterOptions?.expertise || defaultExpertiseCategories;
  const industryOptionsList = filterOptions?.industries || defaultIndustryOptions;
  const timezones = filterOptions?.timezones || defaultTimezones;

  // ============================================
  // FETCH DATA
  // ============================================

  // Fetch experts from API
  const fetchExperts = useCallback(async (page = 1, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError('');

      const response = await getExperts({
        page,
        limit: expertsPerPage,
        sortBy,
        search: searchQuery || undefined,
        expertise: filters.expertise,
        industries: filters.industries,
        tools: filters.tools,
        availability: filters.availability,
        minPrice: filters.priceRange[0] !== 50 ? filters.priceRange[0] : undefined,
        maxPrice: filters.priceRange[1] !== 250 ? filters.priceRange[1] : undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        projectRange: filters.projectRange || undefined,
        timezones: filters.timezones
      });

      if (append) {
        setExperts(prev => [...prev, ...response.data]);
      } else {
        setExperts(response.data);
      }
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching experts:', err);
      setError(err.message || 'Failed to load experts');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [sortBy, searchQuery, filters, expertsPerPage]);

  // Fetch featured expert
  const fetchFeaturedExpert = useCallback(async () => {
    try {
      const response = await getFeaturedExpert();
      setFeaturedExpert(response.data);
    } catch (err) {
      console.error('Error fetching featured expert:', err);
    }
  }, []);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await getFilterOptions();
      setFilterOptions(response.data);
      // Update price range from API
      if (response.data?.priceRange) {
        setFilters(prev => ({
          ...prev,
          priceRange: [
            response.data.priceRange.minPrice || 50,
            response.data.priceRange.maxPrice || 250
          ]
        }));
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  }, []);

  // Fetch business user's company industry and pre-apply as filter
  const fetchBusinessIndustry = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userData ? JSON.parse(userData) : null;
      if (!user || user.activeRole !== 'owner') return;

      const status = await getOnboardingStatus();
      const industry = status?.data?.companyDetails?.industry || status?.companyDetails?.industry;
      if (industry) {
        setBusinessIndustry(industry);
        setFilters(prev => ({
          ...prev,
          industries: prev.industries.includes(industry) ? prev.industries : [industry]
        }));
      }
    } catch (err) {
      // Silently fail — user just sees unfiltered results
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFilterOptions();
    fetchFeaturedExpert();
    fetchBusinessIndustry();
  }, [fetchFilterOptions, fetchFeaturedExpert, fetchBusinessIndustry]);

  // Read project context from URL params (when navigated from a project page)
  useEffect(() => {
    const from = searchParams.get('from');
    if (from !== 'project') return;

    const expertiseParam = searchParams.get('expertise');
    const projectTitle   = searchParams.get('projectTitle');

    if (expertiseParam) {
      const expertiseList = expertiseParam.split(',').map(e => e.trim()).filter(Boolean);
      setFilters(prev => ({ ...prev, expertise: expertiseList }));
      setProjectContext({ title: projectTitle || 'your project', expertise: expertiseList });
    }
  }, [searchParams]);

  // Fetch experts when filters/sort/page changes
  useEffect(() => {
    fetchExperts(currentPage);
  }, [currentPage, sortBy, fetchExperts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchExperts(1);
      } else {
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  // ============================================
  // FILTER HANDLERS
  // ============================================

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleFilter = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
    // If user removes the business industry filter manually, hide the banner
    if (category === 'industries' && value === businessIndustry) {
      setBusinessIndustry('');
    }
    setCurrentPage(1);
  };

  const handlePriceChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: type === 'min'
        ? [parseInt(value), prev.priceRange[1]]
        : [prev.priceRange[0], parseInt(value)]
    }));
    setCurrentPage(1);
  };

  const setRatingFilter = (rating) => {
    setFilters(prev => ({ ...prev, minRating: rating }));
    setCurrentPage(1);
  };

  const setProjectFilter = (range) => {
    setFilters(prev => ({
      ...prev,
      projectRange: prev.projectRange === range ? null : range
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      expertise: [], industries: [], tools: [], availability: [],
      priceRange: [50, 250], minRating: 0, projectRange: null, timezones: []
    });
    setBusinessIndustry('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const toggleSaveExpert = (expertId) => {
    setSavedExperts(prev =>
      prev.includes(expertId)
        ? prev.filter(id => id !== expertId)
        : [...prev, expertId]
    );
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !isLoadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchExperts(nextPage, true);
    }
  };

  // Active filter count
  const activeFilterCount =
    filters.expertise.length + filters.industries.length + filters.tools.length +
    filters.availability.length + filters.timezones.length +
    (filters.minRating > 0 ? 1 : 0) + (filters.projectRange ? 1 : 0) +
    (filters.priceRange[0] !== 50 || filters.priceRange[1] !== 250 ? 1 : 0);

  return (
    <div className="min-h-screen bg-white page-enter">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/karya-ai-logo.png" alt="Karya AI" width={40} height={40} className="rounded-xl object-contain" />
              <span className="text-xl font-bold text-gray-900">Karya-AI</span>
            </Link>

            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
              <Link href="/experts" className="text-gray-900 font-medium">Experts</Link>
              <Link href="/business" className="text-gray-500 hover:text-gray-900 transition-colors">For Business</Link>
            </div>

            <div className="flex items-center gap-4">
              <NavbarAuth loginRole="owner" ctaText="Get Started" ctaPath="/register" />
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="relative bg-white border-b border-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="max-w-[1920px] mx-auto px-6 py-10 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full mb-4">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-blue-700 text-xs font-semibold">180+ Vetted Experts</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Expert Marketplace</h1>
              <p className="text-gray-500 text-lg">Find the perfect specialist for your marketing & growth needs</p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experts, skills, or industries..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
            </div>
          </div>

          {/* Trust Elements */}
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { icon: <Shield className="w-4 h-4 text-green-500" />, text: 'All experts vetted through 5-step process', bg: 'bg-green-50 border-green-200' },
              { icon: <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />, text: 'Average project satisfaction: 4.8/5', bg: 'bg-yellow-50 border-yellow-200' },
              { icon: <DollarSign className="w-4 h-4 text-blue-500" />, text: 'Money-back guarantee on first milestone', bg: 'bg-blue-50 border-blue-200' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-2 px-4 py-2 ${item.bg} border rounded-xl text-sm font-medium text-gray-700`}>
                {item.icon}{item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personalization Banner */}
      {businessIndustry && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-gray-700">
                Showing experts matched to your industry:
                <span className="font-semibold text-blue-700 ml-1">{businessIndustry}</span>
              </span>
            </div>
            <button
              onClick={() => {
                setBusinessIndustry('');
                setFilters(prev => ({ ...prev, industries: [] }));
              }}
              className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Show all
            </button>
          </div>
        </div>
      )}

      {/* Project context banner */}
      {projectContext && (
        <div className="bg-gray-950 border-b border-gray-800">
          <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full">
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-300 font-semibold text-xs">Smart Match</span>
              </div>
              <span className="text-gray-300">
                Showing experts matched to <span className="font-bold text-white">"{projectContext.title}"</span>
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {projectContext.expertise.map(e => (
                  <span key={e} className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-full text-xs text-gray-300">{e}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                setProjectContext(null);
                setFilters(prev => ({ ...prev, expertise: [] }));
              }}
              className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 text-xs"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'w-72' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden`}>
            <div className="bg-white border border-gray-200 rounded-3xl p-5 sticky top-24 shadow-sm">
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-600 rounded-full text-xs text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button onClick={clearAllFilters} className="text-sm text-blue-600 hover:text-blue-500 transition-colors">
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin">
                {/* Expertise Categories */}
                <div className="border-b border-gray-200 pb-4">
                  <button onClick={() => toggleSection('expertise')} className="flex items-center justify-between w-full mb-3">
                    <span className="font-medium text-gray-900">Expertise</span>
                    {expandedSections.expertise ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSections.expertise && (
                    <div className="space-y-2">
                      {expertiseCategories.map(category => (
                        <label key={category} onClick={() => toggleFilter('expertise', category)} className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            filters.expertise.includes(category) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                          }`}>
                            {filters.expertise.includes(category) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{category}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Industry Experience */}
                <div className="border-b border-gray-200 pb-4">
                  <button onClick={() => toggleSection('industry')} className="flex items-center justify-between w-full mb-3">
                    <span className="font-medium text-gray-900">Industry</span>
                    {expandedSections.industry ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSections.industry && (
                    <div className="space-y-2">
                      {industryOptionsList.map(industry => (
                        <label key={industry} onClick={() => toggleFilter('industries', industry)} className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            filters.industries.includes(industry) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                          }`}>
                            {filters.industries.includes(industry) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{industry}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tools & Platforms */}
                <div className="border-b border-gray-200 pb-4">
                  <button onClick={() => toggleSection('tools')} className="flex items-center justify-between w-full mb-3">
                    <span className="font-medium text-gray-900">Tools & Platforms</span>
                    {expandedSections.tools ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSections.tools && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={toolSearch}
                        onChange={(e) => setToolSearch(e.target.value)}
                        placeholder="Search tools..."
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                      {defaultToolOptions.map(group => (
                        <div key={group.category}>
                          <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{group.category}</div>
                          <div className="space-y-1">
                            {group.tools.filter(tool => tool.toLowerCase().includes(toolSearch.toLowerCase())).map(tool => (
                              <label key={tool} onClick={() => toggleFilter('tools', tool)} className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  filters.tools.includes(tool) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                                }`}>
                                  {filters.tools.includes(tool) && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-lg mr-1">{toolIcons[tool] || '🔧'}</span>
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{tool}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div className="border-b border-gray-200 pb-4">
                  <button onClick={() => toggleSection('availability')} className="flex items-center justify-between w-full mb-3">
                    <span className="font-medium text-gray-900">Availability</span>
                    {expandedSections.availability ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSections.availability && (
                    <div className="space-y-2">
                      {availabilityOptions.map(option => (
                        <label key={option} onClick={() => toggleFilter('availability', option)} className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            filters.availability.includes(option) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                          }`}>
                            {filters.availability.includes(option) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing Range */}
                <div className="border-b border-gray-200 pb-4">
                  <button onClick={() => toggleSection('pricing')} className="flex items-center justify-between w-full mb-3">
                    <span className="font-medium text-gray-900">Hourly Rate</span>
                    {expandedSections.pricing ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSections.pricing && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 mb-1 block">Min</label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input
                              type="number"
                              value={filters.priceRange[0]}
                              onChange={(e) => handlePriceChange('min', e.target.value)}
                              className="w-full pl-6 pr-2 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <span className="text-gray-400 mt-5">-</span>
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 mb-1 block">Max</label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input
                              type="number"
                              value={filters.priceRange[1]}
                              onChange={(e) => handlePriceChange('max', e.target.value)}
                              className="w-full pl-6 pr-2 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="250"
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceChange('max', e.target.value)}
                        className="w-full accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>$50/hr</span>
                        <span>$250+/hr</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="border-b border-gray-200 pb-4">
                  <button onClick={() => toggleSection('rating')} className="flex items-center justify-between w-full mb-3">
                    <span className="font-medium text-gray-900">Rating</span>
                    {expandedSections.rating ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSections.rating && (
                    <div className="space-y-2">
                      {[5, 4, 3].map(rating => (
                        <button
                          key={rating}
                          onClick={() => setRatingFilter(filters.minRating === rating ? 0 : rating)}
                          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all ${
                            filters.minRating === rating ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{rating === 5 ? 'only' : '& up'}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projects Completed */}
                <div className="border-b border-gray-200 pb-4">
                  <button onClick={() => toggleSection('projects')} className="flex items-center justify-between w-full mb-3">
                    <span className="font-medium text-gray-900">Projects Completed</span>
                    {expandedSections.projects ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSections.projects && (
                    <div className="space-y-2">
                      {projectRanges.map(range => (
                        <button
                          key={range.value}
                          onClick={() => setProjectFilter(range.value)}
                          className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all ${
                            filters.projectRange === range.value ? 'bg-blue-50 border border-blue-200 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="pb-4">
                  <button onClick={() => toggleSection('location')} className="flex items-center justify-between w-full mb-3">
                    <span className="font-medium text-gray-900">Time Zone</span>
                    {expandedSections.location ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedSections.location && (
                    <div className="space-y-2">
                      {timezones.map(tz => (
                        <label key={tz} onClick={() => toggleFilter('timezones', tz)} className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            filters.timezones.includes(tz) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                          }`}>
                            {filters.timezones.includes(tz) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{tz}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-600 rounded-full text-xs text-white">{activeFilterCount}</span>
                  )}
                </button>
                <p className="text-gray-500">
                  Showing <span className="text-gray-900 font-medium">{experts.length}</span> of{' '}
                  <span className="text-gray-900 font-medium">{pagination.total}</span> experts
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="match">Best Match</option>
                    <option value="rating">Highest Rated</option>
                    <option value="projects">Most Projects</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="availability">Availability</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.expertise.map(exp => (
                  <button key={exp} onClick={() => toggleFilter('expertise', exp)} className="flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700 hover:bg-blue-100 transition-all">
                    {exp} <X className="w-3 h-3" />
                  </button>
                ))}
                {filters.industries.map(ind => (
                  <button key={ind} onClick={() => toggleFilter('industries', ind)} className="flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700 hover:bg-blue-100 transition-all">
                    {ind} <X className="w-3 h-3" />
                  </button>
                ))}
                {filters.tools.map(tool => (
                  <button key={tool} onClick={() => toggleFilter('tools', tool)} className="flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-sm text-green-700 hover:bg-green-100 transition-all">
                    {tool} <X className="w-3 h-3" />
                  </button>
                ))}
                {filters.availability.map(avail => (
                  <button key={avail} onClick={() => toggleFilter('availability', avail)} className="flex items-center gap-1 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-sm text-yellow-700 hover:bg-yellow-100 transition-all">
                    {avail} <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Experts</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <button onClick={() => fetchExperts(1)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-all">
                  Try Again
                </button>
              </div>
            )}

            {/* Expert Cards Grid */}
            {!isLoading && !error && (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                {experts.map((expert) => (
                  <ExpertCard
                    key={expert.id}
                    expert={expert}
                    viewMode={viewMode}
                    isSaved={savedExperts.includes(expert.id)}
                    onToggleSave={() => toggleSaveExpert(expert.id)}
                    onViewProfile={() => router.push(`/expert-profile/${expert.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && experts.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No experts found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
                <button onClick={clearAllFilters} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-all">
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(pagination.totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (page === 1 || page === pagination.totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-gray-400">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Load More */}
            {!isLoading && pagination.hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-8 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {isLoadingMore ? 'Loading...' : 'Load More Experts'}
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar - Featured Expert */}
          <aside className="hidden 2xl:block w-72 flex-shrink-0">
            <div className="bg-gray-950 border border-gray-800 rounded-3xl p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white">Featured Expert</h3>
              </div>

              {featuredExpert ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 bg-gradient-to-br ${featuredExpert.avatarColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                      {featuredExpert.avatarImage ? (
                        <img src={featuredExpert.avatarImage} alt={featuredExpert.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-lg">{featuredExpert.avatar}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{featuredExpert.name}</h4>
                      <p className="text-sm text-blue-400">{featuredExpert.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-gray-900">{featuredExpert.rating}</span>
                    </div>
                    <span className="text-gray-500">{featuredExpert.projectsCompleted} projects</span>
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-3">{featuredExpert.bio}</p>

                  <div className="flex flex-wrap gap-1">
                    {featuredExpert.expertise?.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-gray-300">{skill}</span>
                    ))}
                  </div>

                  <button
                    onClick={() => router.push(`/expert-profile/${featuredExpert.id}`)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all"
                  >
                    View Profile
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Loading featured expert...</p>
                </div>
              )}

              {/* Special Offer */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-400">Limited Offer</span>
                </div>
                <p className="text-sm text-gray-400">
                  Get 20% off your first project with featured experts. Use code: <span className="text-blue-400 font-mono font-bold">EXPERT20</span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-10 px-6 mt-12">
        <div className="max-w-[1920px] mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image src="/karya-ai-logo.png" alt="Karya AI" width={36} height={36} className="rounded-xl object-contain" />
            <span className="text-xl font-black text-white">Karya-AI</span>
          </div>
          <p className="text-gray-600 text-sm">&copy; 2026 Karya-AI. All rights reserved.</p>
        </div>
      </footer>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.05); border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.5); }
      `}</style>
    </div>
  );
}

// ============================================
// EXPERT CARD COMPONENT
// ============================================
function ExpertCard({ expert, viewMode, isSaved, onToggleSave, onViewProfile }) {
  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'Top Rated': return <Star className="w-3 h-3 fill-current" />;
      case 'Expert Vetted': return <Shield className="w-3 h-3" />;
      case 'Fast Response': return <Clock className="w-3 h-3" />;
      case 'Repeat Hire Rate': return <RefreshCw className="w-3 h-3" />;
      default: return <Award className="w-3 h-3" />;
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Top Rated': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'Expert Vetted': return 'bg-green-50 border-green-200 text-green-700';
      case 'Fast Response': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'Repeat Hire Rate': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300 group">
        <div className="flex gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className={`w-20 h-20 bg-gradient-to-br ${expert.avatarColor} rounded-full flex items-center justify-center overflow-hidden`}>
                {expert.avatarImage ? (
                  <img src={expert.avatarImage} alt={expert.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-2xl">{expert.avatar}</span>
                )}
              </div>
              {expert.online && <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={onViewProfile}>
                    {expert.name}
                  </h3>
                  <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700">
                    {expert.matchScore}% Match
                  </span>
                </div>
                <p className="text-blue-600">{expert.title}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  {expert.location} • {expert.timezone}
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2">
                {expert.badges?.slice(0, 2).map(badge => (
                  <span key={badge} className={`flex items-center gap-1 px-2 py-1 ${getBadgeColor(badge)} border rounded-full text-xs font-medium`}>
                    {getBadgeIcon(badge)}
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-gray-900 font-medium">{expert.rating}</span>
                <span className="text-gray-500 text-sm">({expert.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Briefcase className="w-4 h-4" />
                <span>{expert.projectsCompleted} projects</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{expert.yearsExperience} years exp.</span>
              </div>
              <div className="flex items-center gap-1 text-green-600 font-medium">
                <DollarSign className="w-4 h-4" />
                <span>${expert.hourlyRate}/hr</span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{expert.bio}</p>

            {/* Skills and Tools */}
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap gap-1">
                {expert.expertise?.slice(0, 4).map(skill => (
                  <span key={skill} className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">{skill}</span>
                ))}
                {expert.expertise?.length > 4 && <span className="px-2 py-1 text-xs text-gray-500">+{expert.expertise.length - 4} more</span>}
              </div>
              <div className="flex items-center gap-1">
                {expert.tools?.slice(0, 6).map(tool => (
                  <span key={tool} className="text-lg" title={tool}>{toolIcons[tool] || '🔧'}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button onClick={onViewProfile} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all">
              View Profile
            </button>
            <button
              onClick={onToggleSave}
              className={`px-6 py-2 border rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isSaved ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Card
  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group">
      {/* Top Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          {expert.badges?.slice(0, 1).map(badge => (
            <span key={badge} className={`flex items-center gap-1 px-2 py-1 ${getBadgeColor(badge)} border rounded-full text-xs font-medium`}>
              {getBadgeIcon(badge)}
              {badge}
            </span>
          ))}
        </div>

        {/* Match Score */}
        <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700">
          {expert.matchScore}% Match
        </span>
      </div>

      {/* Avatar & Info */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <div className={`w-16 h-16 bg-gradient-to-br ${expert.avatarColor} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden`}>
            {expert.avatarImage ? (
              <img src={expert.avatarImage} alt={expert.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-xl">{expert.avatar}</span>
            )}
          </div>
          {expert.online && <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors cursor-pointer" onClick={onViewProfile}>
            {expert.name}
          </h3>
          <p className="text-blue-600 text-sm truncate">{expert.title}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="w-3 h-3" />
            {expert.location}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-gray-900 font-medium">{expert.rating}</span>
          <span className="text-gray-500">({expert.reviews})</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Briefcase className="w-4 h-4" />
          <span>{expert.projectsCompleted} projects</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{expert.yearsExperience}yr exp.</span>
        </div>
        <div className="flex items-center gap-1 text-green-600 font-medium">
          <DollarSign className="w-4 h-4" />
          <span>${expert.hourlyRate}/hr</span>
        </div>
      </div>

      {/* Expertise Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {expert.expertise?.slice(0, 3).map(skill => (
          <span key={skill} className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">{skill}</span>
        ))}
        {expert.expertise?.length > 3 && <span className="px-2 py-1 text-xs text-gray-500">+{expert.expertise.length - 3}</span>}
      </div>

      {/* Tools Row */}
      <div className="flex items-center gap-1 mb-4">
        {expert.tools?.slice(0, 6).map(tool => (
          <span key={tool} className="text-lg" title={tool}>{toolIcons[tool] || '🔧'}</span>
        ))}
        {expert.tools?.length > 6 && <span className="text-xs text-gray-500 ml-1">+{expert.tools.length - 6}</span>}
      </div>

      {/* Bio */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{expert.bio}</p>

      {/* Case Study Preview */}
      {expert.caseStudy && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{expert.caseStudy.thumbnail}</span>
            <span className="text-xs text-gray-500">Case Study</span>
          </div>
          <p className="text-sm text-green-600 font-medium">{expert.caseStudy.result}</p>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex gap-2">
        <button onClick={onViewProfile} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-all">
          View Profile
        </button>
        <button
          onClick={onToggleSave}
          className={`p-2.5 border rounded-lg transition-all ${
            isSaved ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-white border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-600'
          }`}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Additional Badges */}
      {expert.badges?.length > 1 && (
        <div className="flex gap-1 mt-3 pt-3 border-t border-gray-200">
          {expert.badges.slice(1).map(badge => (
            <span key={badge} className={`flex items-center gap-1 px-2 py-0.5 ${getBadgeColor(badge)} border rounded text-xs`}>
              {getBadgeIcon(badge)}
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

import { Suspense } from 'react';

function ExpertMarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>}>
      <ExpertMarketplace />
    </Suspense>
  );
}

export default ExpertMarketplacePage;