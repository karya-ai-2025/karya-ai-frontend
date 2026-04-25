'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Target, Zap, Users, Globe, TrendingUp, Award, Heart, Rocket,
  ArrowRight, CheckCircle, Star, MessageSquare, Package, FileText, Menu, X
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
            <Link key={i} href={l.path} className={`px-4 py-2 font-medium transition-all hover:bg-gray-50 rounded-lg text-sm ${l.path === '/about' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900'}`}>{l.label}</Link>
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

export default function AboutPage() {
  const router = useRouter();

  const stats = [
    { value: '743+', label: 'Projects Delivered', icon: <Rocket className="w-5 h-5" /> },
    { value: '180+', label: 'Vetted Experts', icon: <Users className="w-5 h-5" /> },
    { value: '4.8★', label: 'Average Rating', icon: <Star className="w-5 h-5" /> },
    { value: '90 Days', label: 'Avg. Time to Results', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const values = [
    { icon: <Target className="w-6 h-6" />, title: 'Results Over Slides', desc: 'We measure success in leads, revenue, and real outcomes — not pitch decks and strategy documents.', color: 'from-blue-500 to-cyan-500' },
    { icon: <Heart className="w-6 h-6" />, title: 'Expert-First Culture', desc: 'Our vetted experts are partners, not gig workers. We invest in their growth so they invest in yours.', color: 'from-pink-500 to-rose-500' },
    { icon: <Zap className="w-6 h-6" />, title: 'AI-Augmented Execution', desc: 'We combine AI speed with human judgment — AI plans, people execute, you grow.', color: 'from-orange-500 to-amber-500' },
    { icon: <Globe className="w-6 h-6" />, title: 'Transparency Always', desc: 'Real-time dashboards, milestone-based payments, and open communication at every step.', color: 'from-emerald-500 to-teal-500' },
  ];

  const team = [
    { name: 'Riya Sharma', role: 'CEO & Co-Founder', desc: 'Ex-Google, 10 years in GTM strategy. Built and scaled 3 startups to acquisition.', initials: 'RS', color: 'from-blue-600 to-cyan-500' },
    { name: 'Arjun Mehta', role: 'CTO & Co-Founder', desc: 'Ex-Flipkart engineering lead. Architected platforms serving 10M+ daily users.', initials: 'AM', color: 'from-purple-600 to-pink-500' },
    { name: 'Priya Nair', role: 'Head of Expert Network', desc: 'Sourced and vetted 3,000+ marketing professionals across APAC & North America.', initials: 'PN', color: 'from-orange-500 to-red-500' },
    { name: 'Dev Kapoor', role: 'Head of Product', desc: 'Former product lead at Razorpay. Obsessed with turning complexity into simplicity.', initials: 'DK', color: 'from-emerald-600 to-teal-500' },
  ];

  const howWeWork = [
    { step: '01', title: 'Tell AI your goal', desc: 'Describe your business, target audience, and growth objective. AI generates a full 90-day GTM plan in minutes.', icon: '🤖' },
    { step: '02', title: 'AI maps your plan', desc: 'Your goal is broken into clear execution areas — outreach, content, campaigns, sales — so you know exactly what needs to happen before anyone starts.', icon: '🗺️' },
    { step: '03', title: 'Find your expert', desc: 'We match you with pre-vetted specialists from our 180+ expert network who have delivered exactly this type of work before.', icon: '🎯' },
    { step: '04', title: 'Track real results', desc: 'Your expert team executes every task. You watch real metrics move — leads, revenue, conversions — through a live dashboard.', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-20 sm:py-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-50" />
        <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-orange-100/40 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-blue-700 text-sm font-semibold">Our Story</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
            We exist so great businesses<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">don't die in the go-to-market</span>
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Karya-AI was built because too many brilliant products fail — not because of the product, but because of poor execution. We fix that by combining AI planning with human expertise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/register')} className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
              Start Free <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => router.push('/expert-marketplace')} className="px-8 py-4 border border-gray-300 text-gray-900 font-bold rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all">
              Meet Our Experts
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 mb-3">{s.icon}</div>
                <div className="text-3xl font-black text-white mb-1">{s.value}</div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 sm:py-24 bg-white px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 text-sm font-semibold">What We Do</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">Turning your growth vision into real business outcomes</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Karya-AI is an AI-powered GTM execution platform that connects ambitious businesses with vetted marketing and sales experts. We don't just plan — we execute, track, and deliver real results.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                Whether you're a pre-launch startup or a scaling Series B company, our platform gives you access to the exact expertise you need, backed by AI that ensures every hour is spent on what matters most.
              </p>
              <div className="space-y-3">
                {['AI-generated 90-day GTM roadmaps', '180+ vetted marketing & sales experts', 'Real-time project tracking dashboard', 'Milestone-based, transparent pricing'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white">
                <Rocket className="w-8 h-8 mb-4 text-blue-200" />
                <h3 className="font-black text-lg mb-2">Our Mission</h3>
                <p className="text-blue-100 text-sm leading-relaxed">Make world-class GTM execution accessible to every business, not just those who can afford a $400K/yr CMO.</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 text-white mt-8">
                <Globe className="w-8 h-8 mb-4 text-orange-200" />
                <h3 className="font-black text-lg mb-2">Our Vision</h3>
                <p className="text-orange-100 text-sm leading-relaxed">A world where every great product finds its market, every expert finds meaningful work, and growth is measurable.</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-6 text-white -mt-4">
                <Award className="w-8 h-8 mb-4 text-emerald-200" />
                <h3 className="font-black text-lg mb-2">What We Stand For</h3>
                <p className="text-emerald-100 text-sm leading-relaxed">Results over reports. Expertise over promises. Transparency over complexity.</p>
              </div>
              <div className="bg-gray-900 rounded-3xl p-6 text-white">
                <TrendingUp className="w-8 h-8 mb-4 text-gray-400" />
                <h3 className="font-black text-lg mb-2">How We Measure</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Every engagement is tracked by real business metrics — leads, revenue, CAC, and conversion rates.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">How We Work</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Our process is designed to minimize friction and maximize results — from day one.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howWeWork.map((item, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-3xl p-7 hover:shadow-lg hover:border-blue-200 transition-all">
                <div className="text-3xl mb-4">{item.icon}</div>
                <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-black mb-4">{item.step.slice(-1)}</div>
                <h3 className="font-black text-gray-900 text-lg mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-5">
              <Heart className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 text-sm font-semibold">Our Values</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">What we believe in</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="group border border-gray-200 rounded-3xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 bg-gradient-to-br ${v.color} rounded-2xl flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-md`}>{v.icon}</div>
                <h3 className="font-black text-gray-900 mb-3">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-5">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 text-sm font-semibold">The Team</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">People behind Karya-AI</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Ex-Google, Flipkart, and Razorpay talent who've been in your shoes — and know how to help you win.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((t, i) => (
              <div key={i} className="group border border-gray-200 rounded-3xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className={`w-16 h-16 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center text-white font-black text-lg mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>{t.initials}</div>
                <h3 className="font-black text-gray-900 mb-1">{t.name}</h3>
                <p className="text-blue-600 text-sm font-semibold mb-3">{t.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Ready to grow with us?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">Join 743+ projects already running on Karya-AI. Start free, see results in 90 days.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/register')} className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center gap-2">
              Start Free <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => router.push('/expert-marketplace')} className="px-8 py-4 border border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
              Browse Experts
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
