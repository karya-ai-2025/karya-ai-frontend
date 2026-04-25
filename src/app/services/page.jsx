'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Target, TrendingUp, Users, Globe, Zap, BarChart3, Network,
  Phone, Building2, Radio, ArrowRight, CheckCircle, Brain,
  Shield, Eye, Activity, MessageSquare, Search, Menu, ChevronDown
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
            <Link key={i} href={l.path} className={`px-4 py-2 font-medium transition-all hover:bg-gray-50 rounded-lg text-sm ${l.path === '/services' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900'}`}>{l.label}</Link>
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

const SERVICES = [
  {
    id: 'lead-intelligence',
    icon: <Target className="w-8 h-8" />,
    emoji: '🎯',
    title: 'Lead Intelligence',
    tagline: 'Know your best prospects before you contact them',
    description: 'Go beyond basic contact lists. Our Lead Intelligence service combines AI-powered ICP modeling with deep data enrichment to give you a complete profile of every prospect — their buying signals, tech stack, org structure, recent triggers, and contact hierarchy. You reach the right person at the right time, every time.',
    gradient: 'from-blue-500 to-cyan-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    capabilities: [
      { title: 'ICP Modeling', desc: 'AI builds your Ideal Customer Profile from your best customers — then finds 1,000 more just like them.' },
      { title: 'Intent Signal Tracking', desc: 'Identify prospects actively researching your category using 3rd-party intent data and behavioral signals.' },
      { title: 'Contact Enrichment', desc: 'Get verified emails, direct phone numbers, LinkedIn profiles, and reporting hierarchy for every prospect.' },
      { title: 'Buying Trigger Alerts', desc: 'Get notified when target accounts raise funding, hire new leaders, launch products, or expand to new markets.' },
    ],
    useCases: ['B2B SaaS companies targeting enterprise', 'Consulting firms expanding to new verticals', 'Agencies building outbound pipelines'],
    outcome: 'Cut prospecting time by 80%. Increase qualified pipeline by 3x.',
    badge: 'Most Used Service',
  },
  {
    id: 'company-intelligence',
    icon: <Building2 className="w-8 h-8" />,
    emoji: '🏢',
    title: 'Company Intelligence',
    tagline: 'Deep insights into every target account',
    description: 'Before you reach out, you need to truly understand your target account. Our Company Intelligence service delivers detailed firmographic, technographic, and competitive intelligence on every account — so your team walks into every conversation fully prepared and hyper-relevant.',
    gradient: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-700',
    capabilities: [
      { title: 'Firmographic Profiling', desc: 'Revenue range, employee count, funding stage, HQ location, and growth trajectory for each target account.' },
      { title: 'Tech Stack Analysis', desc: 'Identify what CRM, marketing tools, infrastructure, and software your prospects currently use.' },
      { title: 'Competitive Landscape Mapping', desc: 'Understand who your prospects currently buy from and what gaps exist in their current solutions.' },
      { title: 'Account Health Scoring', desc: 'AI scores each account on fit, timing, and likelihood to buy — so your team prioritizes the right deals.' },
    ],
    useCases: ['Account-based marketing (ABM) programs', 'Enterprise sales teams', 'Strategic partnership development'],
    outcome: 'Increase win rate by 40% with context-driven conversations.',
    badge: 'ABM Essential',
  },
  {
    id: 'call-intelligence',
    icon: <Phone className="w-8 h-8" />,
    emoji: '📞',
    title: 'Call Intelligence',
    tagline: 'Turn every sales call into a coaching opportunity',
    description: 'Our Call Intelligence service records, transcribes, and analyzes every sales call to extract key insights — objections raised, topics discussed, sentiment, competitor mentions, and next steps. Your team gets better with every conversation, and your managers coach with data, not gut feeling.',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    capabilities: [
      { title: 'AI Call Recording & Transcription', desc: 'Every call automatically recorded, transcribed, and indexed with speaker identification and timestamps.' },
      { title: 'Sentiment & Talk-Ratio Analysis', desc: 'See who\'s talking, when prospects disengage, and which moments create the most buyer interest.' },
      { title: 'Objection Pattern Detection', desc: 'AI flags recurring objections across your entire team so you can build better playbooks and scripts.' },
      { title: 'Coaching Scorecards', desc: 'Auto-generated scorecards for every rep based on your defined criteria — no manual listening required.' },
    ],
    useCases: ['SDR/BDR teams making 50+ calls/week', 'Sales managers coaching distributed teams', 'Startups building their first sales playbook'],
    outcome: 'Reduce ramp time by 50%. Improve call conversion rates by 30%.',
    badge: 'Sales Team Favorite',
  },
  {
    id: 'network-intelligence',
    icon: <Network className="w-8 h-8" />,
    emoji: '🕸️',
    title: 'Network Intelligence',
    tagline: 'Leverage your warm network to open cold doors',
    description: 'The best introduction is a warm one. Our Network Intelligence service maps your team\'s collective LinkedIn connections, identifies mutual relationships with target accounts, and surfaces the fastest path to a qualified conversation — turning cold outreach into warm referrals.',
    gradient: 'from-orange-500 to-red-500',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-700',
    capabilities: [
      { title: 'Network Graph Mapping', desc: 'Visualize your team\'s combined LinkedIn network and identify who knows whom across your target account list.' },
      { title: 'Warm Path Discovery', desc: 'AI finds the shortest connection path between your team and any target decision-maker — 1st, 2nd, or 3rd degree.' },
      { title: 'Referral Automation', desc: 'Auto-draft introduction request messages tailored to the relationship context for quick, human approval.' },
      { title: 'Relationship Health Tracking', desc: 'Monitor engagement levels with key accounts and get alerts when relationships go cold.' },
    ],
    useCases: ['B2B companies with high average deal values', 'Founders using personal brand for sales', 'VC-backed startups leveraging investor networks'],
    outcome: '5x higher response rates vs cold outreach. 2x faster deal cycles.',
    badge: 'Relationship Driven',
  },
];

export default function ServicesPage() {
  const router = useRouter();
  const [expandedService, setExpandedService] = useState(null);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-20 sm:py-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-50" />
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-purple-100/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-blue-100/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-8">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-semibold">Intelligence Services</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
            The intelligence layer<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">your GTM was missing</span>
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Our intelligence services give your sales and marketing teams the data, signals, and insights they need to reach the right person, at the right time, with the right message.
          </p>
        </div>
      </section>

      {/* Intelligence pillars overview */}
      <section className="py-12 bg-gray-950 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SERVICES.map((s, i) => (
              <a key={i} href={`#${s.id}`} className="group text-center p-5 rounded-2xl bg-gray-800 hover:bg-gray-700 transition-all border border-gray-700 hover:border-blue-500">
                <div className="text-3xl mb-3">{s.emoji}</div>
                <div className="text-white font-black text-sm mb-1">{s.title}</div>
                <div className="text-gray-400 text-xs leading-snug">{s.tagline}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-16 sm:py-20 bg-white px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          {SERVICES.map((service, i) => (
            <div key={service.id} id={service.id} className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
              {/* Info side */}
              <div className={i % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className={`inline-flex items-center gap-2 px-4 py-2 ${service.bgLight} border border-current rounded-full mb-6`}>
                  <span className={`${service.textColor} text-sm font-semibold flex items-center gap-2`}>
                    <span className="text-lg">{service.emoji}</span> {service.badge}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">{service.title}</h2>
                <p className={`${service.textColor} font-semibold mb-5`}>{service.tagline}</p>
                <p className="text-gray-500 leading-relaxed mb-8">{service.description}</p>

                <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-200">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-wide mb-3">Typical Outcome</div>
                  <p className="text-gray-900 font-bold">{service.outcome}</p>
                </div>

                <div className="mb-8">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-wide mb-3">Works best for</div>
                  <div className="flex flex-col gap-2">
                    {service.useCases.map((u, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{u}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => router.push('/register')}
                  className={`px-7 py-3.5 bg-gradient-to-r ${service.gradient} text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center gap-2`}
                >
                  Get Started with {service.title} <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Capabilities side */}
              <div className={i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                <div className={`bg-gradient-to-br ${service.gradient} rounded-3xl p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="text-4xl mb-2">{service.emoji}</div>
                    <h3 className="text-xl font-black mb-6">What we do for you</h3>
                    <div className="space-y-5">
                      {service.capabilities.map((cap, j) => (
                        <div key={j} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 mt-0.5">{j + 1}</div>
                            <div>
                              <div className="font-black text-white text-sm mb-1">{cap.title}</div>
                              <div className="text-white/70 text-xs leading-relaxed">{cap.desc}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How intelligence services integrate */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Intelligence that works together</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Our four intelligence services form a complete GTM data layer — each powerful alone, unstoppable together.</p>
          </div>
          <div className="relative">
            {/* Center */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SERVICES.map((s, i) => (
                <div key={i} className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-5 text-white text-center`}>
                  <div className="text-3xl mb-2">{s.emoji}</div>
                  <div className="font-black text-sm mb-1">{s.title}</div>
                  <div className="text-white/70 text-xs">{s.tagline}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 mt-8 text-sm max-w-xl mx-auto">All four services share a unified data layer, meaning insights from one service automatically enrich and improve the others.</p>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 bg-white px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">Integrates with your existing stack</h2>
          <p className="text-gray-500 mb-10">Our intelligence services plug directly into the tools your team already uses.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['HubSpot', 'Salesforce', 'Apollo.io', 'LinkedIn Sales Nav', 'ZoomInfo', 'Outreach.io', 'Lemlist', 'Clay', 'Slack', 'Google Workspace', 'Zapier', 'Notion'].map((tool, i) => (
              <span key={i} className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-sm font-medium border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">{tool}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Ready to sell smarter?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">Get started with one intelligence service or all four. Our experts will set everything up for you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/register')} className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => router.push('/expert-marketplace')} className="px-8 py-4 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
              Talk to an Expert
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
