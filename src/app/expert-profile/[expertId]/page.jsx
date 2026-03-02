'use client';
// pages/ExpertProfile.jsx
import { useState } from 'react';
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

// Mock expert data - this would come from API based on expertId
const mockExpertData = {
  id: 1,
  name: "Sarah Mitchell",
  title: "B2B SaaS Growth Marketer",
  tagline: "Helping B2B SaaS companies scale from $1M to $10M ARR",
  avatar: "SM",
  avatarColor: "from-blue-500 to-purple-600",
  coverImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=400&fit=crop",
  location: "San Francisco, CA",
  timezone: "EST (UTC-5)",
  availability: "9am-6pm EST",
  online: true,
  rating: 4.9,
  reviews: 48,
  projectsCompleted: 32,
  yearsExperience: 5,
  hourlyRate: 120,
  matchScore: 92,
  responseTime: "< 2 hours",
  repeatClientRate: 78,
  languages: ["English (Native)", "Spanish (Conversational)"],
  badges: ["Top Rated", "Expert Vetted", "Fast Response"],

  // Professional Summary
  bio: `With over 5 years of experience in B2B SaaS growth marketing, I've helped 30+ companies build predictable revenue engines that scale. My approach combines data-driven experimentation with proven outbound methodologies.

I started my career at a Series A startup where I built the entire demand generation function from scratch, taking the company from $500K to $5M ARR in 18 months. Since then, I've worked with companies ranging from pre-seed to Series C, always focusing on sustainable, scalable growth.

My specialty is creating outbound sales systems that actually work. This means going beyond just "sending cold emails" to building comprehensive ICP definitions, multi-channel sequences, and attribution systems that prove ROI. I believe in treating sales and marketing as one unified function.

When I'm not helping clients grow, I'm writing about growth marketing on my blog, speaking at SaaS conferences, and mentoring early-stage founders through various accelerator programs.`,

  // Video intro
  videoIntro: {
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop",
    duration: "2:45",
    title: "Meet Sarah - Growth Marketing Expert"
  },

  // Specializations
  primaryExpertise: [
    "Growth Marketing for B2B SaaS",
    "Outbound Sales Systems",
    "Demand Generation",
    "Account-Based Marketing"
  ],

  industriesServed: [
    { name: "B2B SaaS", projects: 15 },
    { name: "Fintech", projects: 8 },
    { name: "Marketplace", projects: 5 },
    { name: "Enterprise Software", projects: 4 }
  ],

  servicesOffered: [
    "ICP & Messaging Development",
    "Cold Email Campaigns",
    "LinkedIn Outbound Strategy",
    "Sales Funnel Optimization",
    "Marketing Attribution Setup",
    "Growth Experimentation",
    "Demand Generation Strategy",
    "Revenue Operations Consulting"
  ],

  // Tools & Platforms
  toolsByCategory: [
    {
      category: "CRM & Sales Tools",
      tools: [
        { name: "Salesforce", level: "Expert", years: 5 },
        { name: "HubSpot", level: "Expert", years: 6 },
        { name: "Pipedrive", level: "Advanced", years: 3 }
      ]
    },
    {
      category: "Marketing Automation",
      tools: [
        { name: "Marketo", level: "Expert", years: 4 },
        { name: "ActiveCampaign", level: "Advanced", years: 2 }
      ]
    },
    {
      category: "Outbound & Enrichment",
      tools: [
        { name: "Apollo", level: "Expert", years: 3 },
        { name: "Outreach", level: "Advanced", years: 2 },
        { name: "Clay", level: "Intermediate", years: 1 }
      ]
    },
    {
      category: "Analytics",
      tools: [
        { name: "Google Analytics", level: "Expert", years: 5 },
        { name: "Mixpanel", level: "Advanced", years: 3 },
        { name: "Amplitude", level: "Intermediate", years: 2 }
      ]
    }
  ],

  // Certifications
  certifications: [
    { name: "HubSpot Inbound Marketing Certification", year: 2023 },
    { name: "Google Ads Certification", year: 2022 },
    { name: "Reforge Growth Series", year: 2021 },
    { name: "Salesforce Administrator", year: 2020 }
  ],

  education: [
    { degree: "B.S. Marketing", institution: "UC Berkeley", year: 2018 }
  ],

  // Work Preferences
  workPreferences: {
    projectDuration: "30-90 days preferred",
    communicationStyle: "Async-first, weekly syncs",
    teamSize: "Solo or small team collaboration",
    workingHours: "9am-6pm EST"
  },

  // Stats for charts
  stats: {
    projectsByType: [
      { type: "Lead Generation", count: 12, percentage: 37 },
      { type: "Sales Systems", count: 8, percentage: 25 },
      { type: "Demand Gen", count: 7, percentage: 22 },
      { type: "ABM", count: 5, percentage: 16 }
    ],
    averageProjectValue: 12500,
    successRate: 94,
    repeatClientRate: 78
  },

  // Social links
  socialLinks: {
    linkedin: "https://linkedin.com/in/sarahmitchell",
    twitter: "https://twitter.com/sarahmitchell",
    website: "https://sarahmitchell.com"
  }
};

// Mock case studies data
const mockCaseStudies = [
  {
    id: 1,
    title: "B2B SaaS Lead Generation Machine",
    clientIndustry: "HR Tech SaaS",
    clientSize: "Series A, 25 employees",
    projectDuration: "90 days",
    budgetRange: "$10,000 - $15,000",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
    featured: true,
    challenge: "The client was struggling to generate qualified leads for their enterprise HR software. Their sales team was spending 80% of time on unqualified prospects, and their CAC was 3x industry average. They needed a systematic approach to outbound that could scale.",
    approach: [
      "Conducted deep ICP analysis using customer interviews and CRM data",
      "Built multi-touch email sequences targeting 3 distinct buyer personas",
      "Implemented Apollo for prospecting and enrichment",
      "Created sales playbook with qualification criteria",
      "Set up attribution tracking in HubSpot"
    ],
    results: [
      { icon: "🎯", metric: "487", label: "Qualified leads generated" },
      { icon: "📈", metric: "23%", label: "Conversion to opportunity" },
      { icon: "💰", metric: "$340K", label: "Pipeline created" },
      { icon: "⏱️", metric: "14%", label: "Reduction in sales cycle" },
      { icon: "📊", metric: "3.2x", label: "ROI in first 90 days" }
    ],
    deliverables: [
      "Comprehensive ICP documentation",
      "7 email sequences (42 emails total)",
      "Apollo prospect list (2,500 contacts)",
      "Sales qualification playbook",
      "HubSpot analytics dashboard"
    ],
    testimonial: {
      quote: "Sarah transformed our entire outbound motion. We went from scattered cold outreach to a predictable lead generation machine. The ROI was evident within the first month.",
      author: "Michael Chen",
      title: "VP of Sales",
      company: "TalentFlow",
      rating: 5
    },
    skills: ["Lead Generation", "Email Sequences", "Apollo", "HubSpot", "Sales Enablement"]
  },
  {
    id: 2,
    title: "Fintech Demand Generation Overhaul",
    clientIndustry: "Fintech",
    clientSize: "Series B, 80 employees",
    projectDuration: "60 days",
    budgetRange: "$15,000 - $20,000",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop",
    featured: true,
    challenge: "A payment processing startup was scaling rapidly but their marketing couldn't keep up. They had strong product-market fit but lacked the systems to generate consistent pipeline for their sales team.",
    approach: [
      "Audited existing demand gen channels and identified gaps",
      "Built content-led ABM program for target accounts",
      "Implemented marketing automation with Marketo",
      "Created multi-channel attribution model",
      "Trained internal team on new processes"
    ],
    results: [
      { icon: "🚀", metric: "156%", label: "Increase in MQLs" },
      { icon: "💵", metric: "$890K", label: "Attributed pipeline" },
      { icon: "📉", metric: "42%", label: "Reduction in CAC" },
      { icon: "⭐", metric: "4.8x", label: "Return on ad spend" },
      { icon: "🎯", metric: "67%", label: "Account engagement rate" }
    ],
    deliverables: [
      "ABM playbook and account list",
      "Marketo automation workflows",
      "Content calendar (3 months)",
      "Attribution dashboard in Looker",
      "Team training documentation"
    ],
    testimonial: {
      quote: "The demand gen system Sarah built is now the backbone of our growth. We've continued to see results months after the engagement ended.",
      author: "Jennifer Park",
      title: "CMO",
      company: "PayStream",
      rating: 5
    },
    skills: ["Demand Generation", "ABM", "Marketo", "Content Strategy", "Attribution"]
  },
  {
    id: 3,
    title: "Marketplace Cold Outreach System",
    clientIndustry: "B2B Marketplace",
    clientSize: "Seed, 12 employees",
    projectDuration: "45 days",
    budgetRange: "$7,000 - $10,000",
    thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop",
    featured: false,
    challenge: "An early-stage B2B marketplace needed to quickly acquire suppliers for their platform. With limited budget and no dedicated sales team, they needed a scrappy but effective outbound approach.",
    approach: [
      "Defined supplier ICP based on marketplace success criteria",
      "Built cold email sequences optimized for response rate",
      "Implemented low-cost tech stack (Apollo + Gmail)",
      "Created self-service onboarding funnel",
      "Set up tracking and optimization workflows"
    ],
    results: [
      { icon: "🏪", metric: "89", label: "New suppliers onboarded" },
      { icon: "📧", metric: "34%", label: "Email response rate" },
      { icon: "💰", metric: "$45", label: "Cost per supplier acquired" },
      { icon: "⚡", metric: "3 weeks", label: "Time to first results" },
      { icon: "📈", metric: "2.1x", label: "GMV increase" }
    ],
    deliverables: [
      "Supplier ICP document",
      "4 email sequences",
      "Automated follow-up system",
      "Supplier onboarding guide",
      "Performance tracking sheet"
    ],
    testimonial: {
      quote: "Sarah understood our constraints as an early-stage startup and delivered a solution that worked within our budget while driving real results.",
      author: "Alex Rivera",
      title: "Co-founder",
      company: "SupplyHub",
      rating: 5
    },
    skills: ["Cold Outreach", "Email Sequences", "Marketplace", "Supplier Acquisition"]
  }
];

// Mock portfolio items
const mockPortfolioItems = [
  {
    id: 1,
    title: "SaaS Email Sequence Redesign",
    industry: "B2B SaaS",
    keyResult: "+47% reply rate",
    thumbnail: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    title: "ABM Campaign for Enterprise",
    industry: "Enterprise Software",
    keyResult: "$1.2M pipeline",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    title: "Content-Led Growth Strategy",
    industry: "Fintech",
    keyResult: "10x organic traffic",
    thumbnail: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    title: "Sales Enablement Overhaul",
    industry: "HR Tech",
    keyResult: "28% faster close",
    thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop"
  }
];

// Mock downloadable resources
const mockResources = [
  { title: "Cold Email Sequence Template", description: "5 high-converting email templates", downloads: 234, type: "PDF" },
  { title: "ICP Workshop Framework", description: "Step-by-step ICP definition guide", downloads: 189, type: "PDF" },
  { title: "GTM Strategy One-Pager", description: "Template for go-to-market planning", downloads: 156, type: "DOCX" }
];

// Mock thought leadership
const mockThoughtLeadership = [
  { type: "article", title: "The Death of Cold Email (And What's Replacing It)", publication: "Medium", date: "Dec 2024" },
  { type: "podcast", title: "Scaling Outbound at Series A", publication: "SaaS Growth Show", date: "Nov 2024" },
  { type: "webinar", title: "Building ABM Programs That Actually Work", publication: "HubSpot", date: "Oct 2024" },
  { type: "speaking", title: "Keynote: The Future of B2B Sales", publication: "SaaStr Annual", date: "Sep 2024" }
];

// Badge styles helper
function getBadgeStyle(badge) {
  const styles = {
    'Top Rated': 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300',
    'Expert Vetted': 'bg-green-400/20 border-green-400/50 text-green-300',
    'Fast Response': 'bg-blue-400/20 border-blue-400/50 text-blue-300',
    'Repeat Hire Rate': 'bg-purple-400/20 border-purple-400/50 text-purple-300'
  };
  return styles[badge] || 'bg-gray-400/20 border-gray-400/50 text-gray-300';
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
    default: return 'bg-gray-500';
  }
}

// Case Study Card Component
function CaseStudyCard({ caseStudy, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 hover:border-purple-500/50 transition-all group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={caseStudy.thumbnail}
          alt={caseStudy.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {caseStudy.featured && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-medium text-white flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="text-lg font-bold text-white">{caseStudy.title}</h3>
          <p className="text-sm text-gray-300">{caseStudy.clientIndustry}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Meta info */}
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          <span className="px-2 py-1 bg-white/10 rounded-full text-gray-300">
            {caseStudy.projectDuration}
          </span>
          <span className="px-2 py-1 bg-white/10 rounded-full text-gray-300">
            {caseStudy.budgetRange}
          </span>
        </div>

        {/* Key results preview */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {caseStudy.results.slice(0, 2).map((result, idx) => (
            <div key={idx} className="bg-white/5 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{result.metric}</div>
              <div className="text-xs text-gray-400">{result.label}</div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {caseStudy.skills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300">
              {skill}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2 text-sm group-hover:border-purple-500/50">
          View Case Study
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// Portfolio Item Card Component
function PortfolioItemCard({ item, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 hover:border-purple-500/50 transition-all group cursor-pointer"
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-3">
        <h4 className="font-medium text-white text-sm mb-1 truncate">{item.title}</h4>
        <p className="text-xs text-gray-400 mb-2">{item.industry}</p>
        <div className="text-sm font-bold text-green-400">{item.keyResult}</div>
      </div>
    </div>
  );
}

// Base data for all experts (identity + stats that differ per card)
const mockExpertsBase = [
  { id: 1, name: "Sarah Mitchell", title: "B2B SaaS Growth Marketer", tagline: "Helping B2B SaaS companies scale from $1M to $10M ARR", avatar: "SM", avatarColor: "from-blue-500 to-purple-600", location: "San Francisco, CA", timezone: "PST (UTC-8)", online: true, rating: 4.9, reviews: 48, projectsCompleted: 32, yearsExperience: 5, hourlyRate: 120, matchScore: 92, badges: ["Top Rated", "Expert Vetted", "Fast Response"] },
  { id: 2, name: "Marcus Chen", title: "Performance Marketing Specialist", tagline: "Driving 3-5x ROAS through data-driven paid media strategies", avatar: "MC", avatarColor: "from-green-500 to-teal-600", location: "New York, NY", timezone: "EST (UTC-5)", online: true, rating: 5.0, reviews: 89, projectsCompleted: 67, yearsExperience: 8, hourlyRate: 150, matchScore: 88, badges: ["Top Rated", "Expert Vetted", "Repeat Hire Rate"] },
  { id: 3, name: "Emma Rodriguez", title: "Content Strategy & SEO Expert", tagline: "Building organic traffic machines through SEO-driven content", avatar: "ER", avatarColor: "from-pink-500 to-rose-600", location: "Austin, TX", timezone: "CST (UTC-6)", online: false, rating: 4.8, reviews: 156, projectsCompleted: 89, yearsExperience: 6, hourlyRate: 95, matchScore: 85, badges: ["Expert Vetted", "Fast Response"] },
  { id: 4, name: "David Park", title: "Revenue Operations Leader", tagline: "Building and optimizing sales & marketing tech stacks", avatar: "DP", avatarColor: "from-orange-500 to-red-600", location: "Seattle, WA", timezone: "PST (UTC-8)", online: true, rating: 4.9, reviews: 94, projectsCompleted: 45, yearsExperience: 10, hourlyRate: 175, matchScore: 79, badges: ["Top Rated", "Expert Vetted"] },
  { id: 5, name: "Lisa Thompson", title: "Social Media & Community Builder", tagline: "Building engaged audiences that become brand advocates", avatar: "LT", avatarColor: "from-indigo-500 to-blue-600", location: "Los Angeles, CA", timezone: "PST (UTC-8)", online: false, rating: 4.7, reviews: 203, projectsCompleted: 112, yearsExperience: 7, hourlyRate: 85, matchScore: 76, badges: ["Fast Response", "Repeat Hire Rate"] },
  { id: 6, name: "James Wilson", title: "Go-to-Market Strategist", tagline: "Helping founders build and execute GTM strategies that work", avatar: "JW", avatarColor: "from-purple-500 to-pink-600", location: "Boston, MA", timezone: "EST (UTC-5)", online: true, rating: 5.0, reviews: 78, projectsCompleted: 38, yearsExperience: 12, hourlyRate: 200, matchScore: 94, badges: ["Top Rated", "Expert Vetted", "Fast Response"] },
  { id: 7, name: "Aisha Patel", title: "Email Marketing & Automation Expert", tagline: "Generating email-attributed revenue for e-commerce and SaaS", avatar: "AP", avatarColor: "from-cyan-500 to-blue-600", location: "Chicago, IL", timezone: "CST (UTC-6)", online: true, rating: 4.8, reviews: 67, projectsCompleted: 54, yearsExperience: 5, hourlyRate: 110, matchScore: 81, badges: ["Expert Vetted", "Repeat Hire Rate"] },
  { id: 8, name: "Ryan Foster", title: "Partnership & BD Specialist", tagline: "Scaling partner programs and closing strategic deals", avatar: "RF", avatarColor: "from-amber-500 to-orange-600", location: "Denver, CO", timezone: "MST (UTC-7)", online: false, rating: 4.6, reviews: 42, projectsCompleted: 28, yearsExperience: 6, hourlyRate: 130, matchScore: 72, badges: ["Expert Vetted"] },
  { id: 9, name: "Michelle Lee", title: "Customer Success & Retention Expert", tagline: "Reducing churn and maximizing LTV through proactive engagement", avatar: "ML", avatarColor: "from-emerald-500 to-green-600", location: "Miami, FL", timezone: "EST (UTC-5)", online: true, rating: 4.9, reviews: 91, projectsCompleted: 56, yearsExperience: 8, hourlyRate: 125, matchScore: 83, badges: ["Top Rated", "Expert Vetted", "Fast Response"] },
  { id: 10, name: "Alex Turner", title: "Growth Marketing Manager", tagline: "Rapid experimentation and finding scalable acquisition channels", avatar: "AT", avatarColor: "from-violet-500 to-purple-600", location: "Portland, OR", timezone: "PST (UTC-8)", online: false, rating: 4.7, reviews: 134, projectsCompleted: 78, yearsExperience: 4, hourlyRate: 100, matchScore: 87, badges: ["Fast Response", "Repeat Hire Rate"] },
  { id: 11, name: "Natalie Brooks", title: "Brand Strategist & Designer", tagline: "Crafting compelling narratives and visual identities for startups", avatar: "NB", avatarColor: "from-rose-500 to-pink-600", location: "Nashville, TN", timezone: "CST (UTC-6)", online: true, rating: 4.9, reviews: 62, projectsCompleted: 41, yearsExperience: 9, hourlyRate: 140, matchScore: 75, badges: ["Top Rated", "Expert Vetted"] },
  { id: 12, name: "Kevin Zhang", title: "Paid Media Director", tagline: "Specialist in B2B lead gen and e-commerce scaling at scale", avatar: "KZ", avatarColor: "from-sky-500 to-cyan-600", location: "San Diego, CA", timezone: "PST (UTC-8)", online: true, rating: 4.8, reviews: 87, projectsCompleted: 63, yearsExperience: 7, hourlyRate: 160, matchScore: 90, badges: ["Top Rated", "Expert Vetted", "Repeat Hire Rate"] }
];

// Main Expert Profile Component
function ExpertProfile() {
  const router = useRouter();
  const { expertId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Look up base data by ID, merge with detailed mock defaults
  const baseExpert = mockExpertsBase.find(e => e.id === Number(expertId)) || mockExpertsBase[0];
  const expert = { ...mockExpertData, ...baseExpert };
  const caseStudies = mockCaseStudies;
  const portfolioItems = mockPortfolioItems;

  const handleCaseStudyClick = (caseStudyId) => {
    router.push(`/expert-profile/${expertId}/case-study/${caseStudyId}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Show toast notification
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white hidden sm:block">Karya-AI</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Share Profile"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2 rounded-lg transition-colors ${isSaved ? 'bg-pink-500/20 text-pink-400' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => setShowContactModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-all text-sm"
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
              <span className="text-white font-bold text-4xl md:text-5xl">{expert.avatar}</span>
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

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{expert.name}</h1>
            <p className="text-xl text-purple-300 mb-2">{expert.title}</p>
            <p className="text-gray-400 mb-4">{expert.tagline}</p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-300">
                <MapPin className="w-4 h-4 text-gray-500" />
                {expert.location}
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <Clock className="w-4 h-4 text-gray-500" />
                {expert.timezone}
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white font-medium">{expert.rating}</span>
                <span className="text-gray-400">({expert.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-green-400 font-medium">
                <DollarSign className="w-4 h-4" />
                ${expert.hourlyRate}/hr
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="hidden lg:block bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 w-64">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-white">${expert.hourlyRate}</div>
              <div className="text-gray-400 text-sm">per hour</div>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Response time</span>
                <span className="text-white">{expert.responseTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Projects done</span>
                <span className="text-white">{expert.projectsCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Repeat clients</span>
                <span className="text-white">{expert.repeatClientRate}%</span>
              </div>
            </div>

            <button
              onClick={() => setShowContactModal(true)}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all"
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
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'overview'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('case-studies')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'case-studies'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Case Studies ({caseStudies.length})
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'portfolio'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'reviews'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
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
              <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Professional Summary
                </h2>
                <div className="text-gray-300 space-y-4 whitespace-pre-line leading-relaxed">
                  {expert.bio}
                </div>
              </section>

              {/* Video Introduction */}
              {expert.videoIntro && (
                <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-400" />
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
                      <p className="text-white font-medium">{expert.videoIntro.title}</p>
                      <p className="text-gray-300 text-sm">{expert.videoIntro.duration}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Specializations */}
              <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Specializations
                </h2>

                <div className="space-y-6">
                  {/* Primary Expertise */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Primary Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {expert.primaryExpertise.map((item, idx) => (
                        <span key={idx} className="px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Industries Served */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Industries Served</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {expert.industriesServed.map((ind, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-3 text-center">
                          <div className="text-white font-medium">{ind.name}</div>
                          <div className="text-xs text-gray-400">{ind.projects} projects</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services Offered */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Services Offered</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {expert.servicesOffered.map((service, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {service}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Tools & Platforms */}
              <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Tools & Platforms Mastery
                </h2>

                <div className="space-y-4">
                  {expert.toolsByCategory.map((category, idx) => (
                    <div key={idx}>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">{category.category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {category.tools.map((tool, toolIdx) => (
                          <div key={toolIdx} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
                            <span className="text-lg">{toolIcons[tool.name] || '🔧'}</span>
                            <span className="text-white">{tool.name}</span>
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
              <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Featured Case Studies
                  </h2>
                  <button
                    onClick={() => setActiveTab('case-studies')}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
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
              <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  Certifications
                </h3>
                <div className="space-y-3">
                  {expert.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{cert.name}</div>
                        <div className="text-xs text-gray-500">{cert.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Education */}
              <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Education
                </h3>
                <div className="space-y-3">
                  {expert.education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="text-white font-medium">{edu.degree}</div>
                      <div className="text-sm text-gray-400">{edu.institution}, {edu.year}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Work Preferences */}
              <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  Work Preferences
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-gray-400">Project Duration</div>
                      <div className="text-white">{expert.workPreferences.projectDuration}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-gray-400">Communication</div>
                      <div className="text-white">{expert.workPreferences.communicationStyle}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-gray-400">Team Size</div>
                      <div className="text-white">{expert.workPreferences.teamSize}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-gray-400">Languages</div>
                      <div className="text-white">{expert.languages.join(", ")}</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Dashboard */}
              <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-400" />
                  Stats
                </h3>

                {/* Projects by Type */}
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Projects by Type</div>
                  <div className="space-y-2">
                    {expert.stats.projectsByType.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300">{item.type}</span>
                          <span className="text-white">{item.count}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">{expert.stats.successRate}%</div>
                    <div className="text-xs text-gray-400">Success Rate</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-white">{expert.stats.repeatClientRate}%</div>
                    <div className="text-xs text-gray-400">Repeat Clients</div>
                  </div>
                </div>
              </section>

              {/* Social Links */}
              <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-white mb-3">Connect</h3>
                <div className="flex gap-2">
                  {expert.socialLinks.linkedin && (
                    <a href={expert.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                       className="p-2 bg-white/10 hover:bg-blue-500/20 rounded-lg transition-colors">
                      <Linkedin className="w-5 h-5 text-blue-400" />
                    </a>
                  )}
                  {expert.socialLinks.twitter && (
                    <a href={expert.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                       className="p-2 bg-white/10 hover:bg-sky-500/20 rounded-lg transition-colors">
                      <Twitter className="w-5 h-5 text-sky-400" />
                    </a>
                  )}
                  {expert.socialLinks.website && (
                    <a href={expert.socialLinks.website} target="_blank" rel="noopener noreferrer"
                       className="p-2 bg-white/10 hover:bg-purple-500/20 rounded-lg transition-colors">
                      <Globe className="w-5 h-5 text-purple-400" />
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
                <h2 className="text-2xl font-bold text-white">Case Studies</h2>
                <p className="text-gray-400">Detailed breakdowns of successful projects</p>
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
              <h2 className="text-2xl font-bold text-white mb-4">Portfolio</h2>
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
            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-purple-400" />
                Sample Work & Templates
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {mockResources.map((resource, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium text-sm group-hover:text-purple-300 transition-colors">{resource.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{resource.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-white/10 rounded">{resource.type}</span>
                          <span>{resource.downloads} downloads</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Thought Leadership */}
            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-400" />
                Thought Leadership
              </h3>
              <div className="space-y-3">
                {mockThoughtLeadership.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.type === 'article' && <FileText className="w-5 h-5 text-purple-400" />}
                      {item.type === 'podcast' && <Mic className="w-5 h-5 text-purple-400" />}
                      {item.type === 'webinar' && <Video className="w-5 h-5 text-purple-400" />}
                      {item.type === 'speaking' && <Users className="w-5 h-5 text-purple-400" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm group-hover:text-purple-300 transition-colors">{item.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span>{item.publication}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                ))}
              </div>
            </section>

            {/* Skills Tag Cloud */}
            <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Skills Demonstrated</h3>
              <div className="flex flex-wrap gap-2">
                {["Lead Generation", "Email Sequences", "Cold Outreach", "ABM", "Demand Generation",
                  "Sales Enablement", "CRM Setup", "Marketing Automation", "Content Strategy",
                  "Analytics", "A/B Testing", "Copywriting"].map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm hover:bg-purple-500/30 cursor-pointer transition-colors"
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
                <h2 className="text-2xl font-bold text-white">Client Reviews</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-5 h-5 ${i <= Math.floor(expert.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="text-white font-bold">{expert.rating}</span>
                  <span className="text-gray-400">({expert.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Reviews from case studies */}
            <div className="space-y-4">
              {caseStudies.filter(cs => cs.testimonial).map((cs, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 text-lg italic mb-4">"{cs.testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {cs.testimonial.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{cs.testimonial.author}</div>
                      <div className="text-sm text-gray-400">{cs.testimonial.title}, {cs.testimonial.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Contact CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4 z-40">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-2xl font-bold text-white">${expert.hourlyRate}/hr</div>
            <div className="text-sm text-gray-400">Usually responds in {expert.responseTime}</div>
          </div>
          <button
            onClick={() => setShowContactModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all"
          >
            Contact
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Contact {expert.name}</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="What do you need help with?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Describe your project..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Budget Range</label>
                <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500">
                  <option value="">Select budget</option>
                  <option value="5k-10k">$5,000 - $10,000</option>
                  <option value="10k-20k">$10,000 - $20,000</option>
                  <option value="20k-50k">$20,000 - $50,000</option>
                  <option value="50k+">$50,000+</option>
                </select>
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all">
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