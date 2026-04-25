'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText, BookOpen, Play, Mic, TrendingUp, Target, Users, Zap,
  ArrowRight, Clock, ChevronRight, Search, Star, Download, ExternalLink,
  MessageSquare, Rocket, BarChart3, Globe, Menu
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'About', path: '/about' },
  { label: 'Products', path: '/products' },
  { label: 'Services', path: '/services' },
  { label: 'Resources', path: '/resources' },
  { label: 'Pricing', path: '/#pricing' },
];

function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/karya-ai-logo.png" alt="Karya AI" width={40} height={40} className="rounded-xl object-contain" />
          <span className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Karya-AI</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l, i) => (
            <Link key={i} href={l.path} className={`px-4 py-2 font-medium transition-all hover:bg-gray-50 rounded-lg text-sm ${l.path === '/resources' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900'}`}>{l.label}</Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => router.push('/login')} className="px-4 py-2 text-gray-900 font-medium border border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-sm">Sign In</button>
          <button onClick={() => router.push('/register')} className="px-5 py-2 bg-blue-600 rounded-xl text-white font-medium hover:bg-blue-700 transition-all text-sm">Get Started</button>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-lg"><Menu className="w-6 h-6" /></button>
      </div>
      {mobileOpen && (
        <div className="lg:hidden px-4 pb-4 border-t border-gray-100 mt-1">
          {NAV_LINKS.map((l, i) => (
            <Link key={i} href={l.path} onClick={() => setMobileOpen(false)} className="block py-3 text-gray-700 font-medium border-b border-gray-100 last:border-0">{l.label}</Link>
          ))}
          <div className="flex gap-2 mt-4">
            <button onClick={() => router.push('/login')} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium">Sign In</button>
            <button onClick={() => router.push('/register')} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Get Started</button>
          </div>
        </div>
      )}
    </div>
  );
}

const RESOURCE_CATEGORIES = [
  { label: 'All', value: 'all', icon: <Globe className="w-4 h-4" /> },
  { label: 'Guides', value: 'guide', icon: <BookOpen className="w-4 h-4" /> },
  { label: 'Case Studies', value: 'case-study', icon: <BarChart3 className="w-4 h-4" /> },
  { label: 'Templates', value: 'template', icon: <FileText className="w-4 h-4" /> },
  { label: 'Playbooks', value: 'playbook', icon: <Zap className="w-4 h-4" /> },
  { label: 'Videos', value: 'video', icon: <Play className="w-4 h-4" /> },
];

const RESOURCES = [
  {
    type: 'guide',
    typeLabel: 'Guide',
    emoji: '📖',
    title: 'The Complete B2B GTM Playbook for 2025',
    desc: 'Everything you need to build, launch, and scale your go-to-market strategy — from ICP definition to your first 100 customers.',
    readTime: '18 min read',
    badge: 'Featured',
    badgeColor: 'bg-blue-600 text-white',
    topics: ['ICP', 'GTM Strategy', 'Launch'],
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    type: 'case-study',
    typeLabel: 'Case Study',
    emoji: '📊',
    title: 'How a SaaS Startup Went from 0 to 500 Signups in 90 Days',
    desc: 'An HR-tech startup used Karya-AI\'s Lead in a Box + GTM in a Box to validate their ICP and acquire their first paying cohort — in under 90 days.',
    readTime: '8 min read',
    badge: 'Popular',
    badgeColor: 'bg-orange-500 text-white',
    topics: ['Lead Gen', 'SaaS', 'GTM'],
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    type: 'template',
    typeLabel: 'Template',
    emoji: '📋',
    title: 'ICP Definition Worksheet (Free Download)',
    desc: 'A structured worksheet to define your Ideal Customer Profile with firmographic, psychographic, and behavioral attributes — used by 500+ teams.',
    readTime: 'Download',
    badge: 'Free',
    badgeColor: 'bg-green-500 text-white',
    topics: ['ICP', 'Lead Gen', 'Strategy'],
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    type: 'playbook',
    typeLabel: 'Playbook',
    emoji: '⚡',
    title: 'Cold Email Playbook: 40%+ Open Rates Without Tricks',
    desc: 'The exact framework our expert network uses to write cold email sequences that get replies — including subject lines, openers, CTAs, and A/B testing protocols.',
    readTime: '12 min read',
    badge: 'Editor\'s Pick',
    badgeColor: 'bg-purple-600 text-white',
    topics: ['Email', 'Outreach', 'Copywriting'],
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    type: 'case-study',
    typeLabel: 'Case Study',
    emoji: '🚀',
    title: 'E-commerce Brand: $50K to $200K/mo in One Quarter',
    desc: 'How a DTC brand used social media campaigns + email automation from Karya-AI to 4x their monthly revenue without increasing ad spend.',
    readTime: '10 min read',
    badge: 'High ROI',
    badgeColor: 'bg-emerald-600 text-white',
    topics: ['E-commerce', 'Social', 'Email'],
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    type: 'guide',
    typeLabel: 'Guide',
    emoji: '🎯',
    title: 'Account-Based Marketing (ABM) for B2B: A Practical Guide',
    desc: 'Learn how to run targeted ABM campaigns that close enterprise deals — from target account selection and personalization to multi-channel activation.',
    readTime: '15 min read',
    badge: 'New',
    badgeColor: 'bg-blue-500 text-white',
    topics: ['ABM', 'Enterprise Sales', 'Marketing'],
    gradient: 'from-blue-600 to-indigo-600',
  },
  {
    type: 'template',
    typeLabel: 'Template',
    emoji: '📈',
    title: 'GTM Dashboard Template — Track What Matters',
    desc: 'A Notion + Google Sheets GTM dashboard template pre-wired with the KPIs your investors, board, and team actually care about.',
    readTime: 'Download',
    badge: 'Free',
    badgeColor: 'bg-green-500 text-white',
    topics: ['Analytics', 'KPIs', 'Dashboard'],
    gradient: 'from-teal-500 to-emerald-600',
  },
  {
    type: 'video',
    typeLabel: 'Video',
    emoji: '🎬',
    title: 'How to Use Karya-AI to Launch Your First GTM Campaign',
    desc: 'A 20-minute walkthrough of the full Karya-AI platform — from telling the AI your goal to watching your expert team execute.',
    readTime: '20 min watch',
    badge: 'Video',
    badgeColor: 'bg-red-500 text-white',
    topics: ['Platform', 'Getting Started', 'GTM'],
    gradient: 'from-red-500 to-rose-600',
  },
  {
    type: 'playbook',
    typeLabel: 'Playbook',
    emoji: '🤝',
    title: 'LinkedIn Outreach Playbook: Warm Leads at Scale',
    desc: 'The exact LinkedIn connection + DM strategy our experts use to generate 20–40 qualified conversations per month without paid tools.',
    readTime: '10 min read',
    badge: 'Proven',
    badgeColor: 'bg-blue-600 text-white',
    topics: ['LinkedIn', 'Outreach', 'Lead Gen'],
    gradient: 'from-blue-700 to-cyan-600',
  },
];

const FEATURED_GUIDES = [
  { icon: '📗', title: 'GTM Strategy', count: '12 resources' },
  { icon: '📘', title: 'Lead Generation', count: '9 resources' },
  { icon: '📙', title: 'Email Marketing', count: '7 resources' },
  { icon: '📕', title: 'Social Media', count: '6 resources' },
  { icon: '📓', title: 'Sales Outreach', count: '11 resources' },
  { icon: '📔', title: 'CRM & Automation', count: '5 resources' },
];

export default function ResourcesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = RESOURCES.filter(r => {
    const matchesCategory = activeCategory === 'all' || r.type === activeCategory;
    const matchesSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-20 sm:py-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-40" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-8">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-semibold">Resource Hub</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
            Everything you need to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">grow your business faster</span>
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Guides, playbooks, case studies, and templates built by our expert network — free for you to use.
          </p>
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search guides, playbooks, case studies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-4 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Topic Buckets */}
      <section className="py-12 bg-gray-50 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Browse by Topic</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {FEATURED_GUIDES.map((g, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 text-center hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
                <div className="text-3xl mb-2">{g.icon}</div>
                <div className="font-black text-gray-900 text-sm mb-0.5 group-hover:text-blue-600 transition-colors">{g.title}</div>
                <div className="text-gray-400 text-xs">{g.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter tabs + Resources Grid */}
      <section className="py-16 sm:py-20 bg-white px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {RESOURCE_CATEGORIES.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${activeCategory === cat.value ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">No resources match your search. Try a different term.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((resource, i) => (
                <div key={i} className="group bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  {/* Top gradient bar */}
                  <div className={`h-2 bg-gradient-to-r ${resource.gradient}`} />
                  <div className="p-6">
                    {/* Meta row */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${resource.badgeColor}`}>{resource.badge}</span>
                      <span className="text-gray-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {resource.readTime}</span>
                    </div>
                    {/* Content */}
                    <div className="text-3xl mb-3">{resource.emoji}</div>
                    <span className={`text-xs font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${resource.gradient}`}>{resource.typeLabel}</span>
                    <h3 className="font-black text-gray-900 text-lg mt-1 mb-3 leading-snug group-hover:text-blue-600 transition-colors">{resource.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-5">{resource.desc}</p>
                    {/* Topics */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {resource.topics.map((t, j) => (
                        <span key={j} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{t}</span>
                      ))}
                    </div>
                    <div className={`flex items-center gap-2 text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r ${resource.gradient}`}>
                      {resource.type === 'template' ? <><Download className="w-4 h-4 text-emerald-500" /> Download Free</> : resource.type === 'video' ? <><Play className="w-4 h-4 text-red-500" /> Watch Now</> : <><ArrowRight className="w-4 h-4 text-blue-500" /> Read More</>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-semibold">GTM Newsletter</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Weekly GTM insights from our expert network</h2>
          <p className="text-gray-500 text-lg mb-8">Actionable tactics, case studies, and templates — delivered every Tuesday. Join 8,000+ founders and marketers.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@company.com"
              className="flex-1 px-5 py-4 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 placeholder-gray-400"
            />
            <button onClick={() => router.push('/register')} className="px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all whitespace-nowrap">
              Subscribe Free
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-3">No spam. Unsubscribe anytime. 8,000+ readers.</p>
        </div>
      </section>

      {/* Stat bar */}
      <section className="py-12 bg-gray-950 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '50+', label: 'Free resources' },
            { value: '8,000+', label: 'Newsletter subscribers' },
            { value: '743+', label: 'Success stories' },
            { value: '4.8★', label: 'Resource rating' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-black text-white mb-1">{s.value}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Ready to put these insights into action?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">Connect with a vetted Karya-AI expert who has already done what you're trying to do.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/register')} className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
              Start Free <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => router.push('/expert-marketplace')} className="px-8 py-4 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
              Find an Expert
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/karya-ai-logo.png" alt="Karya AI" width={32} height={32} className="rounded-lg object-contain" />
            <span className="text-white font-bold">Karya-AI</span>
          </Link>
          <div className="flex gap-6">
            {NAV_LINKS.map((l, i) => (
              <Link key={i} href={l.path} className="text-gray-400 hover:text-white text-sm transition-colors">{l.label}</Link>
            ))}
          </div>
          <p className="text-gray-500 text-sm">© 2025 Karya-AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
