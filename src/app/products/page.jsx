'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Target, Send, Mail, Megaphone, TrendingUp, Globe, BarChart3,
  Bot, Layers, Network, ArrowRight, CheckCircle, Star, Zap,
  Package, Rocket, UserCheck, FileText, Users, Menu, ChevronRight
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
            <Link key={i} href={l.path} className={`px-4 py-2 font-medium transition-all hover:bg-gray-50 rounded-lg text-sm ${l.path === '/products' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900'}`}>{l.label}</Link>
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

const PRODUCTS = [
  {
    id: 'verified-lead-data',
    emoji: '🎯',
    title: 'Verified Lead Data',
    tagline: 'A ready-to-use list of your exact target customers',
    description: 'You tell us who your ideal customer is. We hand you a verified, enriched database of contacts that match — complete with emails, phone numbers, LinkedIn profiles, company size, and an ICP fit score. No prospecting. No research. Just open your CRM and start selling.',
    gradient: 'from-blue-500 to-cyan-500',
    badge: 'Most Popular',
    what: 'What you get',
    features: [
      'Up to 1,000 verified, ICP-matched contacts',
      'Confirmed email addresses (90%+ deliverability)',
      'Direct phone numbers & LinkedIn URLs',
      'Company data: size, revenue, industry, location',
      'ICP fit score for every contact',
      'Delivered as CSV or pushed directly to your CRM',
    ],
    metrics: ['62 projects completed', '4.8★ rating', '14 expert teams'],
    cta: 'Get Your Lead Data',
    path: '/project-marketplace',
  },
  {
    id: 'data-enrichment',
    emoji: '🗄️',
    title: 'Data Enrichment',
    tagline: 'Turn your existing contacts into complete, accurate records',
    description: 'Already have a contact list or CRM but the data is incomplete, outdated, or inaccurate? We take what you have and fill in the gaps — verified emails, phone numbers, job titles, LinkedIn profiles, company intel, and buying signals — so every record in your database is actionable.',
    gradient: 'from-purple-500 to-violet-500',
    badge: 'High ROI',
    what: 'What you get',
    features: [
      'Re-verified emails and phone numbers',
      'Missing fields filled: title, company, LinkedIn',
      'Duplicate detection and record cleanup',
      'Company firmographics: size, revenue, tech stack',
      'Buying intent signals appended',
      'Delivered back to your CRM, clean and updated',
    ],
    metrics: ['40+ projects completed', '4.9★ rating', '12 expert teams'],
    cta: 'Enrich My Data',
    path: '/project-marketplace',
  },
  {
    id: 'email-sending',
    emoji: '✉️',
    title: 'Email Sending Automation',
    tagline: 'Your emails, your brand — sent and managed on your behalf',
    description: 'You define your tone, target audience, and offer. We build your email templates, configure the sending infrastructure (domain warmup, inbox rotation, deliverability), and run the campaign on your behalf. You watch replies come in — without touching a single setting.',
    gradient: 'from-orange-500 to-amber-500',
    badge: 'Hands-Free',
    what: 'What you get',
    features: [
      'Custom email templates built in your brand voice',
      'Full sending infrastructure setup (domain, warmup)',
      'Automated sequences: welcome, follow-up, re-engagement',
      'Personalisation at scale — name, company, role',
      'Reply management and inbox monitoring',
      'Weekly delivery, open, and click reports',
    ],
    metrics: ['55+ projects completed', '4.7★ rating', '18 expert teams'],
    cta: 'Set Up Email Automation',
    path: '/project-marketplace',
  },
  {
    id: 'social-campaigns',
    emoji: '📣',
    title: 'Social Media Campaigns',
    tagline: 'Consistent presence across your social channels — without lifting a finger',
    description: 'You tell us your brand, audience, and goals. We build a monthly content calendar, create the posts, design the visuals, and publish across your chosen platforms. Campaigns for product launches, thought leadership, or audience growth — all tracked and reported monthly.',
    gradient: 'from-emerald-500 to-teal-500',
    badge: 'Brand Builder',
    what: 'What you get',
    features: [
      'Monthly content calendar (30 posts/month)',
      'Written captions crafted in your brand voice',
      'Designed graphics and short-form video scripts',
      'Scheduled publishing across LinkedIn, X, Instagram',
      'Paid ad campaign setup and management',
      'Monthly performance report: reach, engagement, growth',
    ],
    metrics: ['70+ projects completed', '4.8★ rating', '22 expert teams'],
    cta: 'Launch Social Campaigns',
    path: '/project-marketplace',
  },
  {
    id: 'outreach-sequences',
    emoji: '📞',
    title: 'Outreach Sequences',
    tagline: 'Personalised multi-channel outreach running on autopilot',
    description: 'We build and run a personalised outreach sequence across email, LinkedIn, and cold calls — targeting your exact ICP. Every touchpoint is written, configured, and optimised by an expert. You get booked meetings. No manual effort.',
    gradient: 'from-rose-500 to-pink-500',
    badge: 'Pipeline Driver',
    what: 'What you get',
    features: [
      'Email → LinkedIn → call sequences (5–7 touchpoints)',
      'Personalised copy for every channel and touchpoint',
      'LinkedIn connection requests and DM templates',
      'Cold call scripts with objection-handling guides',
      'CRM sync: every interaction logged automatically',
      'Weekly reply rate and meeting booked reports',
    ],
    metrics: ['50+ projects completed', '4.8★ rating', '15 expert teams'],
    cta: 'Start Outreach',
    path: '/project-marketplace',
  },
  {
    id: 'gtm-in-box',
    emoji: '🚀',
    title: 'GTM in a Box',
    tagline: 'Your entire go-to-market — owned and executed by dedicated experts',
    description: 'The complete product. Two dedicated GTM experts take ownership of your go-to-market for 90 days — lead data, email automation, outreach sequences, social campaigns, and performance tracking, all running together. You get weekly check-ins, a live dashboard, and a clear path to your first 50 customers.',
    gradient: 'from-blue-600 to-indigo-600',
    badge: 'Flagship',
    what: 'Everything included',
    features: [
      'Verified lead data (1,000 ICP-matched contacts)',
      'Email automation configured and running',
      'Multi-channel outreach sequences live',
      'Social media campaigns publishing monthly',
      '2 dedicated GTM experts for 90 days',
      'Live performance dashboard + weekly reviews',
    ],
    metrics: ['85+ projects completed', '4.9★ rating', '30+ expert teams'],
    cta: 'Get GTM in a Box',
    path: '/project-marketplace',
  },
];

const CATEGORIES = [
  { label: 'All Products', value: 'all' },
  { label: 'Lead Generation', value: 'leads' },
  { label: 'CRM & Sales', value: 'crm' },
  { label: 'Email Marketing', value: 'email' },
  { label: 'Social Media', value: 'social' },
  { label: 'Full GTM', value: 'gtm' },
];

export default function ProductsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-20 sm:py-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-50" />
        <div className="absolute top-0 left-0 w-[500px] h-[400px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-orange-100/40 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-8">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-semibold">Our Products</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
            Growth products built to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">deliver real, measurable results</span>
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Each product is a specific deliverable — verified data, automated emails, running campaigns, active outreach. You choose what you need. We build it, run it, and hand you the results.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 sm:py-20 bg-gray-50 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {PRODUCTS.map((product, i) => (
              <div key={product.id} className="group bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300">
                {/* Header */}
                <div className={`bg-gradient-to-br ${product.gradient} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="text-4xl mb-3">{product.emoji}</div>
                      <h2 className="text-2xl font-black mb-2">{product.title}</h2>
                      <p className="text-white/80 text-sm font-medium">{product.tagline}</p>
                    </div>
                    {product.badge && (
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-xs font-bold text-white flex-shrink-0">{product.badge}</span>
                    )}
                  </div>
                  <div className="relative flex gap-4 mt-5 pt-5 border-t border-white/20">
                    {product.metrics.map((m, j) => (
                      <span key={j} className="text-white/70 text-xs">{m}</span>
                    ))}
                  </div>
                </div>
                {/* Body */}
                <div className="p-8">
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.description}</p>
                  <h4 className="font-black text-gray-900 text-sm mb-4 uppercase tracking-wide">What's included</h4>
                  <div className="grid sm:grid-cols-2 gap-2 mb-8">
                    {product.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => router.push(product.path)}
                    className={`w-full py-3.5 bg-gradient-to-r ${product.gradient} text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]`}
                  >
                    {product.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How products work */}
      <section className="py-20 bg-white px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">How every product works</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Every Karya-AI product follows the same simple, transparent process.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', icon: '🎯', title: 'Choose your product', desc: 'Pick the product that matches your current growth challenge.' },
              { step: '2', icon: '🤖', title: 'Tell AI your goal', desc: 'Share your business details. AI customizes the plan for you.' },
              { step: '3', icon: '👥', title: 'Expert team assigned', desc: 'Vetted specialists with relevant experience are matched to your project.' },
              { step: '4', icon: '📈', title: 'Track real results', desc: 'Live dashboard shows your leads, metrics, and milestones in real time.' },
            ].map((s, i) => (
              <div key={i} className="text-center group">
                <div className="relative inline-flex mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform">{s.icon}</div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-black">{s.step}</div>
                </div>
                <h3 className="font-black text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Trusted by 743+ projects</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { metric: '80%', label: 'Average time saved on prospecting', icon: '⏱️', color: 'from-blue-500 to-cyan-500' },
              { metric: '3x', label: 'Average increase in qualified leads', icon: '📊', color: 'from-orange-500 to-amber-500' },
              { metric: '90 days', label: 'Time to first 50 customers with GTM in a Box', icon: '🚀', color: 'from-emerald-500 to-teal-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-3xl p-8 text-center hover:shadow-lg transition-all">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${s.color} mb-2`}>{s.metric}</div>
                <p className="text-gray-500 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Not sure which product to start with?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">Tell our AI your goal and it will recommend the best product and expert for your situation — in 60 seconds.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/register')} className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
              Get AI Recommendation <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => router.push('/project-marketplace')} className="px-8 py-4 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
              Browse All Projects
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
