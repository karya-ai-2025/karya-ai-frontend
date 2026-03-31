'use client';
// pages/ExpertProfile.jsx
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Share2, Heart, Star, MapPin, Clock, Briefcase, Calendar,
  MessageSquare, Video, Play, Download, ExternalLink, ChevronRight,
  Award, Shield, Zap, Users, TrendingUp, Target, BarChart3, PieChart,
  Globe, Mail, Linkedin, Twitter, CheckCircle, BookOpen, Mic, FileText,
  Sparkles, DollarSign, RefreshCw, Check, X
} from 'lucide-react';

// Tool icons mapping
const toolIcons = {
  'Salesforce': '🔵', 'HubSpot': '🟠', 'Pipedrive': '🟢', 'Marketo': '🟣',
  'ActiveCampaign': '🔴', 'Google Analytics': '📊', 'Mixpanel': '📈',
  'Amplitude': '📉', 'Apollo': '🚀', 'Outreach': '📤', 'Clay': '🧱',
  'LinkedIn Ads': '💼', 'Google Ads': '🎯', 'Facebook Ads': '📘',
  'Ahrefs': '🔍', 'SEMrush': '🔎', 'Notion': '📝', 'Slack': '💬',
  'Figma': '🎨', 'Webflow': '🌐', 'Zapier': '⚡', 'Segment': '📊'
};

// ============================================
// API
// ============================================
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const fetchExpertById = async (id) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/marketplace/experts/${id}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load expert');
  return data.data || data;
};

// ============================================
// NORMALIZE — map any backend shape to what the JSX needs
// ============================================
function groupToolsByCategory(tools = []) {
  if (!tools.length) return [];
  if (typeof tools[0] === 'string') {
    return [{ category: 'Skills & Tools', tools: tools.map(t => ({ name: t, level: 'Skilled', years: 0 })) }];
  }
  const grouped = {};
  tools.forEach(tool => {
    const cat = tool.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ name: tool.name || tool, level: tool.level || 'Skilled', years: tool.years || 0 });
  });
  return Object.entries(grouped).map(([category, tools]) => ({ category, tools }));
}

function normalizeExpert(data) {
  if (!data) return null;
  const initials = (data.fullName || data.name || 'EX')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return {
    id: data._id || data.id,
    name: data.fullName || data.name || 'Expert',
    title: data.headline || data.title || '',
    tagline: data.tagline || '',
    avatar: data.avatar || initials,
    avatarColor: 'from-blue-600 to-orange-500',
    coverImage: data.coverImage || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=400&fit=crop',
    location: data.location || '',
    timezone: data.timezone || '',
    availability: data.availability || data.workPreferences?.workingHours || '',
    online: data.online ?? false,
    rating: data.rating || 0,
    reviews: data.totalReviews || data.reviews || 0,
    projectsCompleted: data.projectsCompleted || 0,
    yearsExperience: parseInt(data.yearsOfExperience) || data.yearsExperience || 0,
    hourlyRate: data.hourlyRate || (data.services?.[0]?.pricing ? parseInt(data.services[0].pricing) : 0),
    matchScore: data.matchScore || 0,
    responseTime: data.responseTime || '',
    repeatClientRate: data.repeatClientRate || data.stats?.repeatClientRate || 0,
    languages: data.languages || [],
    badges: data.badges || [],
    bio: data.bio || '',
    videoIntro: data.videoIntro || null,
    primaryExpertise: data.primaryExpertise || data.expertise || [],
    industriesServed: data.industriesServed || (data.industry ? [{ name: data.industry, projects: 0 }] : []),
    servicesOffered: data.servicesOffered || data.services?.map(s => s.name) || data.skills || [],
    toolsByCategory: data.toolsByCategory || groupToolsByCategory(data.tools || data.skills || []),
    certifications: data.certifications || [],
    education: data.education || [],
    workPreferences: data.workPreferences || {
      projectDuration: '',
      communicationStyle: data.communicationStyle || '',
      teamSize: '',
      workingHours: data.availability || ''
    },
    stats: data.stats || { projectsByType: [], averageProjectValue: 0, successRate: 0, repeatClientRate: 0 },
    socialLinks: data.socialLinks || data.links || {}
  };
}

function getBadgeStyle(badge) {
  const styles = {
    'Top Rated': 'bg-yellow-100 border-yellow-300 text-yellow-700',
    'Expert Vetted': 'bg-green-100 border-green-300 text-green-700',
    'Fast Response': 'bg-blue-100 border-blue-300 text-blue-700',
    'Repeat Hire Rate': 'bg-orange-100 border-orange-300 text-orange-700'
  };
  return styles[badge] || 'bg-gray-100 border-gray-300 text-gray-600';
}

function getBadgeIcon(badge) {
  switch (badge) {
    case 'Top Rated': return <Star className="w-3 h-3 fill-current" />;
    case 'Expert Vetted': return <Shield className="w-3 h-3" />;
    case 'Fast Response': return <Clock className="w-3 h-3" />;
    case 'Repeat Hire Rate': return <RefreshCw className="w-3 h-3" />;
    default: return <Award className="w-3 h-3" />;
  }
}

function getToolLevelColor(level) {
  switch (level) {
    case 'Expert': return 'bg-green-500';
    case 'Advanced': return 'bg-blue-500';
    case 'Intermediate': return 'bg-yellow-500';
    default: return 'bg-gray-400';
  }
}

// Main Expert Profile Component
function ExpertProfile() {
  const router = useRouter();
  const { expertId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Real API data
  const [expert, setExpert] = useState(null);
  const [caseStudies, setCaseStudies] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!expertId) return;
    setIsLoading(true);
    setError('');
    fetchExpertById(expertId)
      .then(data => {
        setExpert(normalizeExpert(data));
        setCaseStudies(data.portfolio?.caseStudies || data.caseStudies || []);
        setPortfolioItems(data.portfolio?.items || data.portfolioItems || []);
      })
      .catch(err => setError(err.message || 'Failed to load expert profile'))
      .finally(() => setIsLoading(false));
  }, [expertId]);

  const handleCaseStudyClick = (caseStudyId) => {
    router.push(`/expert-profile/${expertId}/case-study/${caseStudyId}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Show toast notification
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading expert profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !expert) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-500 mb-6">{error || 'This expert profile could not be loaded.'}</p>
          <button onClick={() => router.back()} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl text-white font-semibold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 hidden sm:block">Karya-AI</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                title="Share Profile"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2 rounded-lg transition-colors ${isSaved ? 'bg-pink-500/20 text-pink-400' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setShowContactModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-all text-sm"
              >
                Contact Expert
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Cover Image */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src={expert.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br ${expert.avatarColor} rounded-2xl flex items-center justify-center shadow-2xl border-4 border-slate-900`}>
              <span className="text-blue-600 font-bold text-4xl md:text-5xl">{expert.avatar}</span>
            </div>
            {expert.online && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-slate-900 rounded-full"></div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {expert.badges.map(badge => (
                <span key={badge} className={`flex items-center gap-1 px-2 py-1 ${getBadgeStyle(badge)} border rounded-full text-xs font-medium`}>
                  {getBadgeIcon(badge)}
                  {badge}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{expert.name}</h1>
            <p className="text-xl text-purple-300 mb-2">{expert.title}</p>
            <p className="text-gray-500 mb-4">{expert.tagline}</p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-500" />
                {expert.location}
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="w-4 h-4 text-gray-500" />
                {expert.timezone}
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-gray-900 font-medium">{expert.rating}</span>
                <span className="text-gray-500">({expert.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-green-400 font-medium">
                <DollarSign className="w-4 h-4" />
                ${expert.hourlyRate}/hr
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="hidden lg:block bg-white border border-gray-200 border border-gray-200 rounded-2xl p-4 w-64">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-900">${expert.hourlyRate}</div>
              <div className="text-gray-500 text-sm">per hour</div>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Response time</span>
                <span className="text-gray-900">{expert.responseTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Projects done</span>
                <span className="text-gray-900">{expert.projectsCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Repeat clients</span>
                <span className="text-gray-900">{expert.repeatClientRate}%</span>
              </div>
            </div>

            <button
              onClick={() => setShowContactModal(true)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all"
            >
              Contact Expert
            </button>

            <p className="text-center text-xs text-gray-500 mt-2">
              Usually responds within 2 hours
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6 mt-8">
        <div className="flex gap-1 bg-gray-50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('case-studies')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'case-studies'
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Case Studies ({caseStudies.length})
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'portfolio'
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'reviews'
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Reviews ({expert.reviews})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Professional Summary */}
              <section className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Professional Summary
                </h2>
                <div className="text-gray-600 space-y-4 whitespace-pre-line leading-relaxed">
                  {expert.bio}
                </div>
              </section>

              {/* Video Introduction */}
              {expert.videoIntro && (
                <section className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    Video Introduction
                  </h2>
                  <div className="relative rounded-xl overflow-hidden group cursor-pointer">
                    <img
                      src={expert.videoIntro.thumbnail}
                      alt="Video thumbnail"
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <p className="text-gray-900 font-medium">{expert.videoIntro.title}</p>
                      <p className="text-gray-600 text-sm">{expert.videoIntro.duration}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Specializations */}
              <section className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Specializations
                </h2>

                <div className="space-y-6">
                  {/* Primary Expertise */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Primary Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {expert.primaryExpertise.map((item, idx) => (
                        <span key={idx} className="px-3 py-2 bg-blue-100 border border-purple-500/30 rounded-lg text-purple-300 font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Industries Served */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Industries Served</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {expert.industriesServed.map((ind, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-gray-900 font-medium">{ind.name}</div>
                          <div className="text-xs text-gray-500">{ind.projects} projects</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services Offered */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Services Offered</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {expert.servicesOffered.map((service, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {service}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Tools & Platforms */}
              <section className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Tools & Platforms Mastery
                </h2>

                <div className="space-y-4">
                  {expert.toolsByCategory.map((category, idx) => (
                    <div key={idx}>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">{category.category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {category.tools.map((tool, toolIdx) => (
                          <div key={toolIdx} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                            <span className="text-lg">{toolIcons[tool.name] || '🔧'}</span>
                            <span className="text-gray-900">{tool.name}</span>
                            <span className={`px-2 py-0.5 ${getToolLevelColor(tool.level)} rounded text-xs text-white`}>
                              {tool.level}
                            </span>
                            <span className="text-xs text-gray-500">{tool.years}yr</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Featured Case Studies Preview */}
              <section className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Featured Case Studies
                  </h2>
                  <button
                    onClick={() => setActiveTab('case-studies')}
                    className="text-blue-600 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {caseStudies.filter(cs => cs.featured).slice(0, 2).map(caseStudy => (
                    <CaseStudyCard
                      key={caseStudy.id}
                      caseStudy={caseStudy}
                      onClick={() => handleCaseStudyClick(caseStudy.id)}
                    />
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Certifications */}
              <section className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Certifications
                </h3>
                <div className="space-y-3">
                  {expert.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-gray-900 text-sm font-medium">{cert.name}</div>
                        <div className="text-xs text-gray-500">{cert.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Education */}
              <section className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Education
                </h3>
                <div className="space-y-3">
                  {expert.education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="text-gray-900 font-medium">{edu.degree}</div>
                      <div className="text-sm text-gray-500">{edu.institution}, {edu.year}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Work Preferences */}
              <section className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Work Preferences
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-gray-500">Project Duration</div>
                      <div className="text-gray-900">{expert.workPreferences.projectDuration}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-gray-500">Communication</div>
                      <div className="text-gray-900">{expert.workPreferences.communicationStyle}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-gray-500">Team Size</div>
                      <div className="text-gray-900">{expert.workPreferences.teamSize}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-gray-500">Languages</div>
                      <div className="text-gray-900">{expert.languages.join(", ")}</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Dashboard */}
              <section className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  Stats
                </h3>

                {/* Projects by Type */}
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">Projects by Type</div>
                  <div className="space-y-2">
                    {expert.stats.projectsByType.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{item.type}</span>
                          <span className="text-gray-900">{item.count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-orange-500 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{expert.stats.successRate}%</div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{expert.stats.repeatClientRate}%</div>
                    <div className="text-xs text-gray-500">Repeat Clients</div>
                  </div>
                </div>
              </section>

              {/* Social Links */}
              <section className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Connect</h3>
                <div className="flex gap-2">
                  {expert.socialLinks.linkedin && (
                    <a href={expert.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                       className="p-2 bg-gray-100 hover:bg-blue-500/20 rounded-lg transition-colors">
                      <Linkedin className="w-5 h-5 text-blue-400" />
                    </a>
                  )}
                  {expert.socialLinks.twitter && (
                    <a href={expert.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                       className="p-2 bg-gray-100 hover:bg-sky-500/20 rounded-lg transition-colors">
                      <Twitter className="w-5 h-5 text-sky-400" />
                    </a>
                  )}
                  {expert.socialLinks.website && (
                    <a href={expert.socialLinks.website} target="_blank" rel="noopener noreferrer"
                       className="p-2 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </a>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Case Studies Tab */}
        {activeTab === 'case-studies' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Case Studies</h2>
                <p className="text-gray-500">Detailed breakdowns of successful projects</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {caseStudies.map(caseStudy => (
                <CaseStudyCard
                  key={caseStudy.id}
                  caseStudy={caseStudy}
                  onClick={() => handleCaseStudyClick(caseStudy.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-8">
            {/* Portfolio Items Grid */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {portfolioItems.map(item => (
                  <PortfolioItemCard
                    key={item.id}
                    item={item}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </section>

            {/* Downloadable Resources */}
            {(expert.resources || []).length > 0 && <section className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Sample Work & Templates
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {(expert.resources || []).map((resource, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-gray-900 font-medium text-sm group-hover:text-blue-600 transition-colors">{resource.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 rounded">{resource.type}</span>
                          <span>{resource.downloads} downloads</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>}

            {/* Thought Leadership */}
            {(expert.thoughtLeadership || []).length > 0 && <section className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-blue-600" />
                Thought Leadership
              </h3>
              <div className="space-y-3">
                {(expert.thoughtLeadership || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer group">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.type === 'article' && <FileText className="w-5 h-5 text-blue-600" />}
                      {item.type === 'podcast' && <Mic className="w-5 h-5 text-blue-600" />}
                      {item.type === 'webinar' && <Video className="w-5 h-5 text-blue-600" />}
                      {item.type === 'speaking' && <Users className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 font-medium text-sm group-hover:text-blue-600 transition-colors">{item.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{item.publication}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            </section>}

            {/* Skills Tag Cloud */}
            <section className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Skills Demonstrated</h3>
              <div className="flex flex-wrap gap-2">
                {(expert.servicesOffered || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-blue-100 border border-purple-500/30 rounded-full text-purple-300 text-sm hover:bg-purple-500/30 cursor-pointer transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Client Reviews</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-5 h-5 ${i <= Math.floor(expert.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="text-gray-900 font-bold">{expert.rating}</span>
                  <span className="text-gray-500">({expert.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Reviews from case studies */}
            <div className="space-y-4">
              {caseStudies.filter(cs => cs.testimonial).map((cs, idx) => (
                <div key={idx} className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-lg italic mb-4">"{cs.testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-gray-900 font-bold text-sm">
                        {cs.testimonial.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-gray-900 font-medium">{cs.testimonial.author}</div>
                      <div className="text-sm text-gray-500">{cs.testimonial.title}, {cs.testimonial.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Contact CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm p-4 z-40">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900">${expert.hourlyRate}/hr</div>
            <div className="text-sm text-gray-500">Usually responds in {expert.responseTime}</div>
          </div>
          <button
            onClick={() => setShowContactModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all"
          >
            Contact
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Contact {expert.name}</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="What do you need help with?"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Describe your project..."
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Budget Range</label>
                <select className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500">
                  <option value="">Select budget</option>
                  <option value="5k-10k">$5,000 - $10,000</option>
                  <option value="10k-20k">$10,000 - $20,000</option>
                  <option value="20k-50k">$20,000 - $50,000</option>
                  <option value="50k+">$50,000+</option>
                </select>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all">
                Send Message
              </button>
              <p className="text-center text-xs text-gray-500">
                {expert.name} typically responds within {expert.responseTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer spacer for mobile */}
      <div className="lg:hidden h-24"></div>
    </div>
  );
}

export default ExpertProfile;