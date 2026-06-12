'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search, Target, Mail, Megaphone, Globe, TrendingUp, Zap, Users,
  BarChart3, Briefcase, ChevronRight, X, Star, Clock, CheckCircle,
  Layers, Sparkles, Award, Bot, Send,
  Network, Headphones, FileText, Handshake, Rocket, Building2,
  MapPin, Flame, Trophy, UserCheck, Navigation, ChevronDown,
  Radio, Loader2, ArrowRight, Check, Shield, Play, BadgeCheck,
  Home, LayoutGrid, MessageSquare, Settings, Phone
} from 'lucide-react';
import NavbarAuth from '@/components/NavbarAuth';
import { PROJECT_CATEGORIES } from './projects';
import { fetchAllProjects } from '@/lib/catalogApi';

// ============================================
// DISCOVERY MODES
// ============================================
const DISCOVERY_MODES = [
  { id: 'all', label: 'All Projects', icon: Layers, activeBg: 'bg-gray-900', activeText: 'text-white', inactiveText: 'text-gray-600', inactiveBorder: 'border-gray-200' },
  { id: 'trending', label: 'Trending Now', icon: Flame, activeBg: 'bg-orange-500', activeText: 'text-white', inactiveText: 'text-orange-600', inactiveBorder: 'border-orange-200' },
  { id: 'success', label: 'Success Stories', icon: Trophy, activeBg: 'bg-amber-500', activeText: 'text-white', inactiveText: 'text-amber-600', inactiveBorder: 'border-amber-200' },
  { id: 'nearby', label: 'Near You', icon: MapPin, activeBg: 'bg-green-600', activeText: 'text-white', inactiveText: 'text-green-600', inactiveBorder: 'border-green-200' },
  { id: 'foryou', label: 'For You', icon: UserCheck, activeBg: 'bg-blue-600', activeText: 'text-white', inactiveText: 'text-blue-600', inactiveBorder: 'border-blue-200' },
];

const DIFFICULTY_COLORS = {
  Beginner: 'bg-green-100 text-green-700 border-green-200',
  Intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
  Advanced: 'bg-orange-100 text-orange-700 border-orange-200',
};

// Short goal-style descriptions per category (left panel options)
const CATEGORY_META = {
  all:           'Browse every GTM project blueprint',
  outbound:      'Lead gen, outreach & pipeline building',
  outreach:      'Cold email, LinkedIn & multi-channel',
  email:         'Automated email campaigns at scale',
  brand:         'Identity, PR & thought leadership',
  traffic:       'SEO, ads & growth marketing',
  intelligence:  'Data, scoring & buying signals',
  relationship:  'CRM, referrals & community building',
  assistant:     'Delegated marketing execution',
  'ai-matching': 'AI-matched vetted experts',
};

// Relevant stock photo per category — gives cards the selector's image look
const CATEGORY_IMAGES = {
  outbound:      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=640&h=360&fit=crop&auto=format',
  outreach:      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=640&h=360&fit=crop&auto=format',
  email:         'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=640&h=360&fit=crop&auto=format',
  brand:         'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=640&h=360&fit=crop&auto=format',
  traffic:       'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&h=360&fit=crop&auto=format',
  intelligence:  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&h=360&fit=crop&auto=format',
  relationship:  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=640&h=360&fit=crop&auto=format',
  assistant:     'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=640&h=360&fit=crop&auto=format',
  'ai-matching': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=640&h=360&fit=crop&auto=format',
};

// ============================================
// APP-LAUNCHER DATA (mirrors the homepage project selector)
// ============================================
const LAUNCHER_TABS = [
  { id: 'starter-kit', label: 'Starter Kit' },
  { id: 'custom',      label: 'Custom' },
  { id: 'outreach',    label: 'Outreach' },
  { id: 'content',     label: 'Content' },
  { id: 'growth',      label: 'Growth' },
];

const LAUNCHER_OPTIONS = {
  'starter-kit': [
    { id: 'get-customers',   label: 'Get New Customers',      icon: '🎯', desc: 'Lead gen, outreach & pipeline building' },
    { id: 'connection-mgmt', label: 'Connection Management',  icon: '🤝', desc: 'Nurture & manage your outreach relationships' },
    { id: 'brand-presence',  label: 'Build Brand Presence',   icon: '🏆', desc: "Company / founder's online branding & reputation" },
    { id: 'brand-identity',  label: 'Build Brand Identity',   icon: '🎨', desc: 'Logo, voice & visual identity system' },
    { id: 'partnership',     label: 'Partnership',            icon: '🌐', desc: 'Affiliate & partner program design' },
    { id: 'community',       label: 'Community',              icon: '👥', desc: 'Build & grow an engaged community' },
  ],
  'custom': [
    { id: 'fill-manually',  label: 'Fill Manually',          icon: '✏️', desc: 'Step-by-step guided project builder' },
    { id: 'schedule-call',  label: 'Schedule a Call',        icon: '📞', desc: 'Our team scopes the project with you' },
    { id: 'by-agent',       label: 'By Agent',               icon: '🤖', desc: 'AI chats with you & builds the brief' },
  ],
  'outreach': [
    { id: 'email-outreach', label: 'Email Outreach',         icon: '📧', desc: 'Cold email sequences & automation' },
    { id: 'linkedin',       label: 'LinkedIn Outreach',      icon: '💼', desc: 'Profile optimisation & DM campaigns' },
    { id: 'cold-calls',     label: 'AI Cold Calls',          icon: '📱', desc: 'Automated voice outreach at scale' },
    { id: 'sms-campaigns',  label: 'SMS Campaigns',          icon: '💬', desc: 'Text message nurture & conversions' },
  ],
  'content': [
    { id: 'brand-identity', label: 'Build Brand Identity',   icon: '🎨', desc: 'Logo, voice & visual identity system' },
    { id: 'brand-presence', label: 'Build Brand Presence',   icon: '🏆', desc: "Company / founder's online branding & reputation" },
    { id: 'pr-media',       label: 'PR & Earned Media',      icon: '📰', desc: 'Press coverage & journalist outreach' },
  ],
  'growth': [
    { id: 'research-intel', label: 'Research & Intelligence',icon: '🔍', desc: 'Market, buyer & competitor intelligence' },
    { id: 'community',      label: 'Community',              icon: '👥', desc: 'Build & grow an engaged community' },
    { id: 'go-viral',       label: 'Go Viral on Social',     icon: '🔥', desc: 'Hooks, formats & platform distribution' },
    { id: 'launch-product', label: 'Launch a Product',       icon: '🚀', desc: 'GTM strategy, waitlist & launch day' },
    { id: 'advertise',      label: 'Advertise your Products',icon: '📣', desc: 'Google, Meta & LinkedIn ad campaigns' },
  ],
};

const MP = '/project-marketplace';
const LAUNCHER_PROJECTS = {
  'get-customers': [
    { title: 'B2B Contact Intelligence Engine', desc: 'Build & enrich a living list of verified decision-makers', emoji: '🎯', path: `${MP}/outbound-list-builder`,  sh: 'Rippling built a 2M-contact enriched universe — 3× reply rate', roi: '80% time saved' },
    { title: 'AI Email Outbound Engine',        desc: 'AI-personalised multi-step cold email at scale',          emoji: '📧', path: `${MP}/ai-email-sales-agency`,  sh: '47 qualified meetings booked in month 1 for an agency',       roi: '47 meetings / month 1' },
    { title: 'Call Intelligence CRM',           desc: 'AI voice agents that dial, qualify & book calls',         emoji: '📞', path: `${MP}/call-intelligence-crm`,  sh: 'AI voice agents booked 30+ qualified calls a month',          roi: '3× connect rate' },
    { title: 'HotLead in a Box',                desc: 'Full AI-orchestrated outbound — email + voice + LinkedIn', emoji: '🔥', path: `${MP}/hotlead-in-a-box`,      sh: "$2M pipeline in Q1 with 3 SDRs + AI agents",                  roi: '18× ROI (Silver, Q1 2025)' },
  ],
  'connection-mgmt': [
    { title: 'Sales Outreach Automation',       desc: 'Automated multi-touch sequences & reply management',      emoji: '🤝', path: `${MP}/sales-outreach-automation`, sh: 'Automated 3-touch sequences lifted reply rate 2.4×',         roi: '40% more meetings' },
  ],
  'advertise': [
    { title: 'Full Funnel Ads',     desc: 'Google + Meta + LinkedIn ads, fully managed', emoji: '📣', path: `${MP}/traffic-abm-agency`,            sh: 'ABM ads drove a 4.1× return on ad spend',          roi: '4.1× ROAS' },
    { title: 'Retargeting System',  desc: 'Pixel setup + high-intent retargeting',       emoji: '🎯', path: `${MP}/traffic-abm-agency`,            sh: 'Retargeting recovered 31% of lost visitors',       roi: '+31% recovered' },
  ],
  'brand-presence': [
    { title: 'Founder Branding Program', desc: "Founder's online branding, voice & authority", emoji: '🏆', path: `${MP}/brand-voice-thought-leadership`,   sh: 'Founder hit 50k LinkedIn followers in 6 months', roi: '5× inbound leads' },
    { title: 'Reputation & Authority',   desc: 'Consistent thought leadership & profile growth', emoji: '💼', path: `${MP}/connection-relationship-manager`, sh: 'Thought leadership tripled profile views',       roi: '3× profile reach' },
  ],
  'brand-identity': [
    { title: 'Brand Identity Kit',  desc: 'Logo, typography, colour system & brand voice', emoji: '🎨', path: `${MP}/brand-voice-thought-leadership`, sh: 'Rebrand lifted demo conversion by 28%', roi: '+28% conversion' },
  ],
  'partnership': [
    { title: 'Partnership & Affiliate Program', desc: 'Affiliate system design + partner recruitment', emoji: '🌐', path: `${MP}/connection-relationship-manager`, sh: 'Affiliate program drove 22% of new revenue', roi: '22% revenue from partners' },
  ],
  'community': [
    { title: 'Community Build',     desc: 'Discord / Slack community growth system', emoji: '👥', path: `${MP}/connection-relationship-manager`, sh: 'Built a 5k-member community driving 30% of signups', roi: '30% of signups' },
  ],
  'pr-media': [
    { title: 'PR & Earned Media',   desc: 'Press coverage & journalist outreach', emoji: '📰', path: `${MP}/brand-voice-thought-leadership`, sh: 'Secured 12 press features in 90 days', roi: '12 features / 90 days' },
  ],
  'research-intel': [
    { title: 'Demo Prep & CRM Research', desc: 'Buyer & account research before every call', emoji: '🔍', path: `${MP}/demo-prep-crm-research`, sh: 'Buyer research cut the sales cycle by 18 days', roi: '−18 day cycle' },
    { title: 'Inbound Intelligence',     desc: 'Intent signals & in-market account discovery', emoji: '📊', path: `${MP}/inbound-aggregation`,   sh: 'Intent data surfaced 3× more in-market accounts', roi: '3× intent accounts' },
  ],
  'go-viral': [
    { title: 'Viral Content Engine',desc: 'Hooks, formats & multi-platform distribution', emoji: '🔥', path: `${MP}/brand-voice-thought-leadership`, sh: 'A short-form series hit 4M views in 30 days', roi: '4M views / 30 days' },
    { title: 'Influencer Connect',  desc: 'Micro-influencer campaign management',        emoji: '⭐', path: `${MP}/brand-voice-thought-leadership`, sh: 'Micro-influencers drove 18k signups',         roi: '18k signups' },
  ],
  'launch-product': [
    { title: 'GTM in a Box',        desc: 'Complete go-to-market execution package',    emoji: '🚀', path: `${MP}/outbound-list-builder`,          sh: 'First 50 customers delivered in 90 days', roi: '50 customers / 90 days' },
    { title: 'Launch Waitlist',     desc: 'Pre-launch audience & waitlist building',    emoji: '📋', path: `${MP}/inbound-aggregation`,            sh: 'Waitlist of 8,000 before launch day',     roi: '8k waitlist' },
  ],
  'email-outreach': [
    { title: 'Cold Email Sequences',desc: 'Multi-step personalized outreach flows',     emoji: '📧', path: `${MP}/ai-email-sales-agency` },
    { title: 'Email Warm-up',       desc: 'Domain reputation & deliverability building',emoji: '🔥', path: `${MP}/ai-email-sales-agency` },
    { title: 'Newsletter Build',    desc: 'Audience-building newsletter system',        emoji: '📰', path: `${MP}/inbound-aggregation` },
  ],
  'linkedin': [
    { title: 'LinkedIn Lead Gen',   desc: 'Profile optimisation + outreach sequences',  emoji: '💼', path: `${MP}/connection-relationship-manager` },
    { title: 'Sales Navigator Pro', desc: 'Advanced targeting & lead list building',    emoji: '🎯', path: `${MP}/outbound-list-builder` },
    { title: 'DM Outreach System',  desc: 'Personalised connection + DM campaigns',     emoji: '✉️', path: `${MP}/sales-outreach-automation` },
  ],
  'cold-calls': [
    { title: 'AI Call Campaigns',   desc: 'Automated voice outreach at scale',          emoji: '📞', path: `${MP}/call-intelligence-crm` },
    { title: 'Sales Dialer Setup',  desc: 'Power dialer + script + training',           emoji: '🎙️', path: `${MP}/call-intelligence-crm` },
  ],
  'sms-campaigns': [
    { title: 'SMS Drip Sequences',  desc: 'Text message nurture & conversion flows',    emoji: '💬', path: `${MP}/ai-email-sales-agency` },
    { title: 'WhatsApp Outreach',   desc: 'WhatsApp broadcast & automation setup',      emoji: '📲', path: `${MP}/sales-outreach-automation` },
  ],
  'blog-seo': [
    { title: 'SEO Blog Engine',     desc: '4 posts/mo with keyword research & briefs',  emoji: '✍️', path: `${MP}/inbound-aggregation` },
    { title: 'Long-form Authority', desc: 'Deep-dive articles that rank & convert',     emoji: '📄', path: `${MP}/inbound-aggregation` },
    { title: 'Technical SEO Audit', desc: 'Full site audit + fix recommendations',      emoji: '🔍', path: `${MP}/inbound-aggregation` },
  ],
  'social-posts': [
    { title: 'Social Calendar',     desc: '30 posts/mo across LinkedIn, X & Instagram', emoji: '📲', path: `${MP}/brand-voice-thought-leadership` },
    { title: 'Short-form Videos',   desc: 'Reels, TikToks & YouTube Shorts',            emoji: '🎥', path: `${MP}/brand-voice-thought-leadership` },
  ],
  'video-scripts': [
    { title: 'Video Script Pack',   desc: 'Hooks, scripts & CTAs for any format',       emoji: '🎬', path: `${MP}/brand-voice-thought-leadership` },
    { title: 'YouTube Strategy',    desc: 'Channel plan, SEO & content calendar',       emoji: '▶️', path: `${MP}/inbound-aggregation` },
  ],
  'email-copy': [
    { title: 'Email Copy System',   desc: 'Welcome, nurture & sales email sequences',   emoji: '📝', path: `${MP}/ai-email-sales-agency` },
    { title: 'Newsletter Design',   desc: 'Template, copy & weekly send system',        emoji: '💌', path: `${MP}/ai-email-sales-agency` },
  ],
  'lead-gen': [
    { title: 'Lead in a Box',       desc: '1,000 ICP-matched verified leads delivered', emoji: '🎯', path: `${MP}/outbound-list-builder` },
    { title: 'Inbound Lead Funnel', desc: 'Landing page + lead magnet + nurture',       emoji: '⚡', path: `${MP}/inbound-aggregation` },
  ],
  'paid-ads': [
    { title: 'Full Funnel Ads',     desc: 'Google + Meta + LinkedIn ads management',    emoji: '📈', path: `${MP}/traffic-abm-agency` },
    { title: 'Retargeting System',  desc: 'Pixel setup + retargeting campaigns',        emoji: '🔄', path: `${MP}/traffic-abm-agency` },
  ],
  'referral': [
    { title: 'Referral Program',    desc: 'End-to-end referral system design & launch', emoji: '🤝', path: `${MP}/connection-relationship-manager` },
    { title: 'Affiliate Setup',     desc: 'Affiliate program + partner recruitment',    emoji: '🌐', path: `${MP}/connection-relationship-manager` },
  ],
  'retention': [
    { title: 'Churn Reduction',     desc: 'Exit surveys, win-back & loyalty flows',     emoji: '🔄', path: `${MP}/demo-prep-crm-research` },
    { title: 'Customer Success',    desc: 'Onboarding + NPS + upsell system',           emoji: '💎', path: `${MP}/demo-prep-crm-research` },
  ],
};

const CUSTOM_OPTION_PATHS = {
  'fill-manually': '/create-project',
  'schedule-call': '/business-dashboard/submit-project/schedule',
  'by-agent':      '/agent',
};

const FEATURED_LAUNCHER_PROJECTS = [
  {
    title: 'Lead in a Box', desc: '1,000 ICP-matched verified leads ready for outreach',
    thumb: 'from-blue-600 via-blue-500 to-cyan-400', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=640&h=360&fit=crop&auto=format',
    path: `${MP}/outbound-list-builder`, tag: 'Most Popular', rating: '4.8', experts: 14, completed: 62, price: '₹15K+', duration: '4–6 wks', pills: ['Lead Gen', 'Verified Data'],
    outcome: 'Fill your pipeline in 3 days — not 3 weeks',
    deliverables: ['1,000 verified, ICP-matched contacts', 'Decision-maker emails + LinkedIn', 'Company intel & tech-stack data', 'Clean CRM-ready export'],
    sh: 'Cut prospecting time 80% — 3 weeks to 3 days', roi: '80% time saved',
  },
  {
    title: 'GTM in a Box', desc: 'Two dedicated experts to win your first 50 customers',
    thumb: 'from-violet-600 via-purple-500 to-pink-400', img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=640&h=360&fit=crop&auto=format',
    path: `${MP}/outbound-list-builder`, tag: 'Featured', rating: '4.9', experts: 12, completed: 38, price: '₹75K+', duration: '90 days', pills: ['Full GTM', 'Done-for-you'],
    outcome: 'Your first 50 customers — fully managed',
    deliverables: ['2 dedicated GTM experts', 'Complete 90-day go-to-market plan', 'Outreach, content & ads executed for you', 'Weekly performance reviews'],
    sh: 'First 50 customers delivered in 90 days', roi: '50 customers / 90d',
  },
  {
    title: 'Cold Email Machine', desc: 'Multi-step automated outreach, personalised at scale',
    thumb: 'from-emerald-600 via-teal-500 to-cyan-400', img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=640&h=360&fit=crop&auto=format',
    path: `${MP}/ai-email-sales-agency`, tag: 'Outreach', rating: '4.7', experts: 9, completed: 31, price: '₹30K+', duration: 'Monthly', pills: ['Cold Email', 'AI Personalised'],
    outcome: 'Book 30+ meetings a month on autopilot',
    deliverables: ['Warmed sending domains (no spam)', 'AI-personalised multi-step sequences', 'Automated reply handling', 'Meetings booked to your calendar'],
    sh: '47 qualified meetings booked in month 1', roi: '47 meetings / mo',
  },
  {
    title: 'SEO Blog Engine', desc: 'Four fully optimised blog posts delivered every month',
    thumb: 'from-orange-500 via-amber-400 to-yellow-400', img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=640&h=360&fit=crop&auto=format',
    path: `${MP}/inbound-aggregation`, tag: 'Content', rating: '4.8', experts: 11, completed: 44, price: '₹25K+', duration: 'Monthly', pills: ['SEO', 'Content'],
    outcome: 'Rank on Google & drive inbound leads',
    deliverables: ['4 SEO-optimised posts / month', 'Keyword research & content briefs', 'On-page optimisation', 'Monthly ranking & traffic report'],
    sh: '20%+ month-over-month organic traffic growth', roi: '20%+ MoM traffic',
  },
  {
    title: 'Brand Identity Kit', desc: 'Logo, typography, colour palette & brand voice guide',
    thumb: 'from-rose-600 via-pink-500 to-fuchsia-400', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=640&h=360&fit=crop&auto=format',
    path: `${MP}/brand-voice-thought-leadership`, tag: 'Branding', rating: '4.9', experts: 8, completed: 27, price: '₹40K+', duration: '3–4 wks', pills: ['Branding', 'Design'],
    outcome: 'A brand customers trust on sight',
    deliverables: ['Logo & full visual identity', 'Typography + colour system', 'Brand voice & messaging guide', 'Ready-to-use templates'],
    sh: 'Rebrand lifted demo conversion by 28%', roi: '+28% conversion',
  },
  {
    title: 'Viral Content Engine', desc: 'Hooks, short-form formats & multi-platform reach',
    thumb: 'from-red-600 via-orange-500 to-amber-400', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&h=360&fit=crop&auto=format',
    path: `${MP}/brand-voice-thought-leadership`, tag: 'Social', rating: '4.7', experts: 10, completed: 33, price: '₹35K+', duration: 'Monthly', pills: ['Social', 'Short-form'],
    outcome: 'Turn your story into content that spreads',
    deliverables: ['Hook & format playbook', '30 short-form pieces / month', 'Multi-platform distribution', 'Performance tracking & iteration'],
    sh: 'A short-form series hit 4M views in 30 days', roi: '4M views / 30d',
  },
];

const LAUNCHER_OPTION_ICONS = {
  'get-customers': Users, 'connection-mgmt': Handshake, 'brand-presence': Star, 'brand-identity': Sparkles,
  'partnership': Network, 'community': Users, 'advertise': BarChart3, 'go-viral': Zap,
  'launch-product': Rocket, 'research-intel': Search, 'pr-media': Radio,
  'fill-manually': FileText, 'schedule-call': Phone, 'by-agent': Bot,
  'email-outreach': Mail, 'linkedin': Briefcase, 'cold-calls': Phone, 'sms-campaigns': MessageSquare,
};

const LAUNCHER_CARD_COLORS = [
  'from-blue-500 to-cyan-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500', 'from-rose-500 to-pink-500', 'from-indigo-500 to-blue-500',
];

const CITY_COORDS = {
  Mumbai: { lat: 19.07, lon: 72.87 }, Delhi: { lat: 28.61, lon: 77.20 },
  Bangalore: { lat: 12.97, lon: 77.59 }, Hyderabad: { lat: 17.38, lon: 78.48 },
  Pune: { lat: 18.52, lon: 73.85 }, Chennai: { lat: 13.08, lon: 80.27 },
  Kolkata: { lat: 22.57, lon: 88.36 }, Ahmedabad: { lat: 23.02, lon: 72.57 },
  Jaipur: { lat: 26.91, lon: 75.78 }, Noida: { lat: 28.54, lon: 77.39 },
};

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function getNearestCity(lat, lon) {
  let best = null, bestDist = Infinity;
  for (const [city, c] of Object.entries(CITY_COORDS)) { const d = getDistanceKm(lat, lon, c.lat, c.lon); if (d < bestDist) { bestDist = d; best = city; } }
  return best;
}

// ============================================
// APPLY MODAL
// ============================================
function ApplyModal({ project, onClose }) {
  const [pitch, setPitch] = useState('');
  const [rate, setRate] = useState('');
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-500" /></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-gray-500 text-sm mb-6">Your pitch for <span className="font-semibold text-gray-700">{project?.title}</span> has been sent.</p>
        <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-orange-600">Done</button>
      </div>
    </div>
  );
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div><h2 className="text-lg font-bold text-gray-900">Apply for Project</h2><p className="text-sm text-gray-500">{project?.title}</p></div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Pitch <span className="text-red-500">*</span></label>
            <textarea value={pitch} onChange={(e) => setPitch(e.target.value)} required rows={4} placeholder="Why are you the best person for this project?"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Rate</label>
            <input type="text" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. $500 fixed or $50/hr"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// FEATURED SPOTLIGHT (top trending project)
// ============================================
function FeaturedSpotlight({ project, userRole, onApply }) {
  const router = useRouter();
  const Icon = project.icon;
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${project.gradient} shadow-2xl mb-10`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative z-10 px-8 py-10 md:px-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left */}
          <div className="flex-1 text-white">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">
                <Flame className="w-3.5 h-3.5 text-orange-200" /> Featured Project of the Week
              </span>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/30">{project.number}</span>
              {project.badge && <span className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full">{project.badge}</span>}
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white leading-tight">{project.title}</h2>
                <p className="text-white/80 text-base mt-0.5">{project.subtitle}</p>
              </div>
            </div>

            <p className="text-white/90 text-base leading-relaxed mb-5 max-w-lg">{project.description.slice(0, 180)}...</p>

            {/* Key deliverables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {project.deliverables.slice(0, 4).map((d) => (
                <div key={d} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white/90 text-sm">{d}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2.5 w-fit border border-white/10">
              <Trophy className="w-4 h-4 text-yellow-300 flex-shrink-0" />
              <p className="text-white/90 text-sm italic">{project.successHighlight}</p>
              <span className="font-black text-yellow-300 text-sm ml-1 whitespace-nowrap">{project.successROI}</span>
            </div>
          </div>

          {/* Right: stats + CTA */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Starting from</p>
              <p className="text-3xl font-black text-gray-900 mb-1">{project.budgetRange}</p>
              <p className="text-xs text-gray-400 mb-5">{project.duration} · {project.difficulty}</p>

              <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-gray-100">
                {[
                  { icon: Star, val: project.avgRating, label: 'Rating', color: 'text-amber-500' },
                  { icon: CheckCircle, val: project.completedCount + '+', label: 'Done', color: 'text-green-500' },
                  { icon: Users, val: project.expertCount, label: 'Experts', color: 'text-blue-500' },
                ].map((s) => { const SI = s.icon; return (
                  <div key={s.label} className="text-center">
                    <SI className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
                    <p className="text-base font-black text-gray-900">{s.val}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ); })}
              </div>

              {/* Trending count */}
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mb-4">
                <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-orange-700">{project.trendingLabel}</span>
              </div>

              <button
                onClick={() => router.push(userRole === 'expert' ? `/project-marketplace/${project.id}` : `/project-marketplace/${project.id}`)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
              >
                <Rocket className="w-4 h-4" /> {userRole === 'expert' ? 'Apply Now' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PROMOTIONAL PROJECT ROW
// ============================================
function ProjectRow({ project, userRole, discoveryMode, userCity, userIndustry, onApply, index }) {
  const router = useRouter();
  const Icon = project.icon;

  const score = discoveryMode === 'foryou' && userIndustry ? (project.matchScore?.[userIndustry] || 70) : null;
  const nearbyCount = discoveryMode === 'nearby' && userCity ? (project.nearbyExpertCount?.[userCity] || 0) : null;

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300">
      <div className="flex flex-col lg:flex-row">

        {/* Left accent bar */}
        <div className={`w-full lg:w-1.5 h-1.5 lg:h-auto bg-gradient-to-r lg:bg-gradient-to-b ${project.gradient} flex-shrink-0`} />

        {/* Icon column */}
        <div className={`${project.bgLight} border-b lg:border-b-0 lg:border-r ${project.borderColor} px-6 py-5 lg:py-6 flex lg:flex-col items-center justify-start lg:justify-center gap-4 lg:gap-3 lg:w-36 flex-shrink-0`}>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${project.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="lg:text-center">
            <p className={`text-xs font-bold ${project.textColor} leading-tight`}>{project.number}</p>
            <span className={`hidden lg:inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[project.difficulty]}`}>{project.difficulty}</span>
          </div>
          {/* Badge (desktop) */}
          {project.badge && (
            <span className="hidden lg:block text-xs font-bold text-center px-2 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-sm leading-tight">
              {project.badge}
            </span>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 px-6 py-5 lg:py-6 min-w-0">
          {/* Title row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-700 transition-colors">{project.title}</h3>
            {project.badge && <span className="lg:hidden text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-orange-500 text-white">{project.badge}</span>}
            {project.trending && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                <Flame className="w-3 h-3" /> {project.trendingCount} this week
              </span>
            )}
            {score !== null && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                <Sparkles className="w-3 h-3" /> {score}% match
              </span>
            )}
            {nearbyCount !== null && nearbyCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                <MapPin className="w-3 h-3" /> {nearbyCount} in {userCity}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-gray-500 mb-3">{project.subtitle}</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-2xl">{project.tagline}</p>

          {/* Deliverables preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
            {project.deliverables.slice(0, 4).map((d) => (
              <div key={d} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{d}</span>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.expertSkills.slice(0, 6).map((skill) => (
              <span key={skill} className="text-xs border border-gray-200 bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full font-medium">{skill}</span>
            ))}
            {project.expertSkills.length > 6 && (
              <span className="text-xs border border-gray-200 text-gray-400 px-2.5 py-1 rounded-full">+{project.expertSkills.length - 6} more</span>
            )}
          </div>

          {/* Success story strip */}
          <div className={`flex items-center gap-3 ${project.bgLight} border ${project.borderColor} rounded-xl px-4 py-2.5`}>
            <Trophy className={`w-4 h-4 ${project.textColor} flex-shrink-0`} />
            <p className={`text-sm ${project.textColor} font-medium italic flex-1 min-w-0 truncate`}>{project.successHighlight}</p>
            <span className={`text-sm font-black ${project.textColor} flex-shrink-0`}>{project.successROI}</span>
          </div>

          {/* Sub-projects tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {project.subProjects.map((sub) => (
              <span key={sub} className={`text-xs font-semibold px-3 py-1 rounded-full ${project.bgLight} ${project.textColor} border ${project.borderColor}`}>{sub}</span>
            ))}
          </div>
        </div>

        {/* Right: Price + CTA */}
        <div className="border-t lg:border-t-0 lg:border-l border-gray-100 px-6 py-5 lg:py-6 flex flex-col justify-between gap-4 lg:w-56 flex-shrink-0">
          {/* Price block */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Starting from</p>
            <p className="text-2xl font-black text-gray-900 leading-tight">{project.budgetRange}</p>

            <div className="mt-3 space-y-2">
              {[
                { icon: Star, val: `${project.avgRating} rating`, color: 'text-amber-500', fill: true },
                { icon: CheckCircle, val: `${project.completedCount} completed`, color: 'text-green-500' },
                { icon: Users, val: `${project.expertCount} experts`, color: 'text-blue-500' },
                { icon: Clock, val: project.duration, color: 'text-gray-400' },
              ].map((s) => { const SI = s.icon; return (
                <div key={s.val} className="flex items-center gap-2">
                  <SI className={`w-3.5 h-3.5 flex-shrink-0 ${s.color} ${s.fill ? 'fill-amber-400' : ''}`} />
                  <span className="text-xs text-gray-600 font-medium">{s.val}</span>
                </div>
              ); })}
            </div>

            {/* City dots */}
            {project.expertCities.slice(0, 4).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1.5">Available in</p>
                <div className="flex flex-wrap gap-1">
                  {project.expertCities.slice(0, 4).map((city) => (
                    <span key={city} className="text-xs bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full font-medium">{city}</span>
                  ))}
                  {project.expertCities.length > 4 && (
                    <span className="text-xs text-gray-400 px-1 py-0.5">+{project.expertCities.length - 4}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            {userRole === 'expert' ? (
              <button onClick={() => onApply(project)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5">
                <Send className="w-4 h-4" /> Apply Now
              </button>
            ) : (
              <button onClick={() => router.push(`/project-marketplace/${project.id}`)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5">
                <Rocket className="w-4 h-4" /> Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MID-PAGE PROMO CALLOUT
// ============================================
function PromoCallout({ type }) {
  if (type === 'platform') return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-7 my-6">
      <div className="absolute inset-0 opacity-10"><div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl" /></div>
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-lg mb-1">Let Karya-AI Handle Everything</p>
            <p className="text-blue-200 text-sm leading-relaxed max-w-lg">Don't have time to manage projects yourself? Our Platform Managed service assembles your team, runs the project, and delivers results — you just approve the outputs.</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
            <BadgeCheck className="w-4 h-4 text-green-300" />
            <span className="text-white text-xs font-semibold">SLA-backed delivery</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5">
            <Shield className="w-4 h-4 text-blue-300" />
            <span className="text-white text-xs font-semibold">Dedicated success manager</span>
          </div>
          <button className="mt-1 px-5 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> Request Quote
          </button>
        </div>
      </div>
    </div>
  );

  if (type === 'agency') return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 px-8 py-6 my-6">
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-gray-900 font-black text-lg mb-1">Prefer Working with an Agency?</p>
            <p className="text-gray-600 text-sm leading-relaxed max-w-lg">Browse vetted specialist agencies in our Leads network — fully managed teams with account managers, proven SOPs, and 30-day performance guarantees.</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Link href="/leads" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2">
            <ArrowRight className="w-4 h-4" /> Browse Agencies
          </Link>
        </div>
      </div>
    </div>
  );

  return null;
}

// ============================================
// TRUST STRIP
// ============================================
function TrustStrip() {
  return (
    <div className="bg-gray-50 border-y border-gray-200 py-5 px-6 overflow-hidden">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          {[
            { icon: Shield, label: 'All experts vetted & background-checked', color: 'text-blue-500' },
            { icon: BadgeCheck, label: 'SLA-backed delivery on every project', color: 'text-green-500' },
            { icon: Trophy, label: '743+ projects completed successfully', color: 'text-amber-500' },
            { icon: Star, label: '4.8 average client satisfaction rating', color: 'text-orange-500' },
            { icon: Users, label: '180+ active fractional experts', color: 'text-violet-500' },
          ].map((item) => {
            const II = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2">
                <II className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                <span className="font-medium text-gray-700 whitespace-nowrap">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// BOTTOM CTA BANNER
// ============================================
function BottomCTA({ userRole }) {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 mt-12 px-6 py-14">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
          <Zap className="w-3.5 h-3.5 text-orange-400" />
          {userRole === 'expert' ? 'Join 180+ experts earning on Karya-AI' : 'Trusted by 400+ growing businesses'}
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
          {userRole === 'expert' ? 'Ready to work on projects\nyou actually love?' : "Ready to 10x your growth\nwith the right team?"}
        </h2>
        <p className="text-gray-400 text-base mb-8 leading-relaxed max-w-xl mx-auto">
          {userRole === 'expert'
            ? 'Browse live projects, submit your pitch, and get matched with businesses that need exactly what you offer.'
            : 'Pick a project, choose how you want to work, and get matched with vetted experts who have done it before.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={userRole === 'expert' ? '/expert-marketplace' : '/project-marketplace/virtual-assistant-marketing'}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-xl text-sm flex items-center justify-center gap-2">
            <Rocket className="w-4 h-4" /> {userRole === 'expert' ? 'Find Projects Now' : 'Start Your First Project'}
          </Link>
          <Link href="/expert-marketplace"
            className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
            <Users className="w-4 h-4" /> Browse Expert Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PROJECT CARD (platform-selector style)
// ============================================
function ProjectCard({ project, userRole, discoveryMode, userCity, userIndustry, onApply }) {
  const router = useRouter();
  const Icon = project.icon;
  const score = discoveryMode === 'foryou' && userIndustry ? (project.matchScore?.[userIndustry] || 70) : null;
  const nearbyCount = discoveryMode === 'nearby' && userCity ? (project.nearbyExpertCount?.[userCity] || 0) : null;

  return (
    <button
      onClick={() => router.push(`/project-marketplace/${project.slug || project.id}`)}
      className="group text-left flex flex-col rounded-xl overflow-hidden transition-colors"
    >
      {/* Image thumbnail — like the launcher project cards */}
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '16/9' }}>
        <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient}`} />
        {CATEGORY_IMAGES[project.category] && (
          <img
            src={CATEGORY_IMAGES[project.category]}
            alt={project.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Tag badges — top-left */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
          {project.badge && (
            <span className="text-[10px] font-semibold text-white bg-black/30 px-2.5 py-1 rounded-full">{project.badge}</span>
          )}
          {project.trending && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-white bg-orange-500/80 px-2 py-1 rounded-full">
              <Flame className="w-2.5 h-2.5" />{project.trendingCount}
            </span>
          )}
          {score !== null && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-white bg-blue-600/80 px-2 py-1 rounded-full">
              <Sparkles className="w-2.5 h-2.5" />{score}%
            </span>
          )}
          {nearbyCount !== null && nearbyCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-white bg-green-600/80 px-2 py-1 rounded-full">
              <MapPin className="w-2.5 h-2.5" />{nearbyCount}
            </span>
          )}
        </div>
      </div>

      {/* Title + description + slim meta */}
      <div className="pt-2.5 pb-1 px-0.5">
        <p className="text-gray-900 font-semibold text-[14px] leading-tight line-clamp-1 group-hover:text-blue-700 transition-colors">{project.title}</p>
        <p className="text-gray-500 text-[12px] mt-0.5 line-clamp-2 leading-relaxed">{project.tagline || project.subtitle}</p>

        {/* Slim meta row — rating · price · level */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2.5 text-[11px] text-gray-500">
            <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{project.avgRating}</span>
            <span className="flex items-center gap-0.5"><Users className="w-3 h-3 text-blue-400" />{project.expertCount}</span>
            <span className="text-gray-300">·</span>
            <span className="font-bold text-gray-900">{project.budgetRange}</span>
          </div>
          {userRole === 'expert' && (
            <button
              onClick={e => { e.stopPropagation(); onApply(project); }}
              className="text-[11px] font-bold px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </button>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function ProjectMarketplace() {
  const [projects, setProjects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [userRole, setUserRole] = useState('owner');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [applyProject, setApplyProject] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [discoveryMode, setDiscoveryMode] = useState('all');
  const [userIndustry, setUserIndustry] = useState('');
  const [userCity, setUserCity] = useState('');
  const [locationStatus, setLocationStatus] = useState('idle');
  const [manualCity, setManualCity] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const sentinelRef = useRef(null);
  const router = useRouter();

  // App-launcher (selector) state
  const [activeLauncherTab, setActiveLauncherTab] = useState('starter-kit');
  const [selectedLauncherOption, setSelectedLauncherOption] = useState(null);
  const [launcherSearch, setLauncherSearch] = useState('');

  // Refs so the stable loadMore callback always reads fresh values
  const pageRef       = useRef(1);
  const loadingRef    = useRef(false);
  const hasMoreRef    = useRef(true);

  const PAGE_SIZE = 10;

  // Initial load — first page
  useEffect(() => {
    fetchAllProjects({ limit: PAGE_SIZE, page: 1 })
      .then(({ projects: p, pagination }) => {
        setProjects(p);
        setTotalCount(pagination?.total ?? p.length);
        const total = pagination?.totalPages ?? pagination?.pages ?? 1;
        const more = total > 1;
        setHasMore(more);
        hasMoreRef.current = more;
      })
      .catch(console.error)
      .finally(() => setLoadingProjects(false));
  }, []);

  // Stable callback — reads from refs so the observer never needs to re-attach
  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    fetchAllProjects({ limit: PAGE_SIZE, page: nextPage })
      .then(({ projects: more, pagination }) => {
        setProjects(prev => [...prev, ...more]);
        pageRef.current = nextPage;
        const total = pagination?.totalPages ?? pagination?.pages ?? nextPage;
        const stillMore = nextPage < total;
        hasMoreRef.current = stillMore;
        setHasMore(stillMore);
      })
      .catch(console.error)
      .finally(() => {
        loadingRef.current = false;
        setLoadingMore(false);
      });
  }, []); // intentionally empty — uses refs, never stale

  // Set up observer AFTER initial load so the sentinel is actually in the DOM.
  // rootMargin '400px' fires ~2 projects before the user hits the bottom.
  useEffect(() => {
    if (loadingProjects) return; // sentinel not rendered yet
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '400px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadingProjects]); // runs once when loadingProjects flips to false

  useEffect(() => {
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userData) {
      try { const u = JSON.parse(userData); setUserRole(u.activeRole === 'expert' ? 'expert' : 'owner'); if (u.industry) setUserIndustry(u.industry); } catch { }
    }
    const od = typeof window !== 'undefined' ? localStorage.getItem('onboardingData') : null;
    if (od) { try { const d = JSON.parse(od); const ind = d?.companyDetails?.industry || d?.industry; if (ind) setUserIndustry(ind); } catch { } }
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) { setLocationStatus('denied'); return; }
    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserCity(getNearestCity(pos.coords.latitude, pos.coords.longitude) || ''); setLocationStatus('set'); },
      () => setLocationStatus('denied')
    );
  };

  useEffect(() => { if (discoveryMode === 'nearby' && locationStatus === 'idle') detectLocation(); }, [discoveryMode]);

  const activeCity = userCity || manualCity;

  const filteredProjects = useMemo(() => {
    let list = projects.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesDifficulty = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || (p.subtitle || '').toLowerCase().includes(q) || (p.expertSkills || []).some(s => s.toLowerCase().includes(q)) || (p.targetFor || []).some(t => t.toLowerCase().includes(q));
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
    if (discoveryMode === 'trending') { list = list.filter(p => p.trending).sort((a, b) => b.trendingCount - a.trendingCount); }
    else if (discoveryMode === 'success') { list = [...list].sort((a, b) => b.completedCount * b.avgRating - a.completedCount * a.avgRating); }
    else if (discoveryMode === 'nearby' && activeCity) { list = list.filter(p => (p.nearbyExpertCount?.[activeCity] || 0) > 0).sort((a, b) => (b.nearbyExpertCount?.[activeCity] || 0) - (a.nearbyExpertCount?.[activeCity] || 0)); }
    else if (discoveryMode === 'foryou' && userIndustry) { list = [...list].sort((a, b) => (b.matchScore?.[userIndustry] || 60) - (a.matchScore?.[userIndustry] || 60)); }
    return list;
  }, [projects, selectedCategory, searchQuery, difficultyFilter, discoveryMode, activeCity, userIndustry]);

  // Featured = top trending project
  const trendingProjects = projects.filter(p => p.trending);
  const featuredProject = trendingProjects.length > 0
    ? trendingProjects.reduce((best, p) => p.trendingCount > best.trendingCount ? p : best, trendingProjects[0])
    : null;
  const totalExperts = projects.reduce((s, p) => s + (p.expertCount || 0), 0);
  const totalCompleted = projects.reduce((s, p) => s + (p.completedCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/karya-ai-logo.png" alt="Karya AI" width={32} height={32} className="rounded-lg object-contain" />
            <span className="font-bold text-gray-900 text-lg">Karya<span className="text-blue-600">AI</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/expert-marketplace" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors hidden sm:block">Expert Marketplace</Link>
            <NavbarAuth theme="light" loginRole={userRole === 'expert' ? 'expert' : 'owner'} />
          </div>
        </div>
      </nav>

      {/* Hero / stats / trust strip / discovery tabs removed — opens directly into the selector */}
      {false && (
      <>
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
                  <Zap className="w-3 h-3 text-orange-500" />
                  {userRole === 'expert' ? 'Find Projects & Get Paid' : 'GTM Project Catalog — Powered by AI Experts'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
                {userRole === 'expert' ? 'Projects Built for\nExperts Like You' : 'Pre-Built Projects\nThat Drive Real Growth'}
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-xl">
                {userRole === 'expert'
                  ? 'Browse live project blueprints across sales, marketing, and growth. Submit your pitch and get matched with businesses that need your exact expertise.'
                  : 'Each project is a proven GTM blueprint — structured deliverables, vetted experts, and a success track record. Pick one, choose how to hire, and start in 24 hours.'}
              </p>
            </div>

            {/* Role toggle + stats */}
            <div className="flex flex-col items-start lg:items-end gap-4">
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                <button onClick={() => setUserRole('owner')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userRole === 'owner' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Building2 className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />Business View
                </button>
                <button onClick={() => setUserRole('expert')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userRole === 'expert' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Award className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />Expert View
                </button>
              </div>
              <div className="flex items-center gap-6">
                {[
                  { label: 'Project Types', value: projects.length || 12, color: 'text-blue-600' },
                  { label: 'Active Experts', value: totalExperts + '+', color: 'text-orange-500' },
                  { label: 'Completed', value: totalCompleted + '+', color: 'text-green-500' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <TrustStrip />

      {/* Discovery Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            {DISCOVERY_MODES.map((mode) => {
              const MIcon = mode.icon;
              const isActive = discoveryMode === mode.id;
              return (
                <button key={mode.id} onClick={() => { setDiscoveryMode(mode.id); if (mode.id === 'nearby' && locationStatus === 'idle') detectLocation(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all whitespace-nowrap flex-shrink-0 ${isActive ? `${mode.activeBg} ${mode.activeText} border-transparent shadow-md` : `bg-white ${mode.inactiveText} ${mode.inactiveBorder} hover:shadow-sm`}`}>
                  <MIcon className="w-4 h-4" />
                  {mode.label}
                  {mode.id === 'trending' && <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>{trendingProjects.length}</span>}
                  {mode.id === 'nearby' && activeCity && <span className={`text-xs ${isActive ? 'text-white/80' : 'text-green-600'}`}>{activeCity}</span>}
                  {mode.id === 'foryou' && userIndustry && <span className={`text-xs truncate max-w-[80px] ${isActive ? 'text-white/80' : 'text-blue-500'}`}>{userIndustry}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Context banners */}
      {discoveryMode === 'trending' && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
          <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center gap-3">
            <Flame className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-orange-800">Trending Now — {trendingProjects.length} projects with highest activity this week, sorted by momentum</p>
          </div>
        </div>
      )}
      {discoveryMode === 'success' && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
          <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm font-semibold text-amber-800">Success Stories — Sorted by track record. Every row below shows a real result from a past client.</p>
          </div>
        </div>
      )}
      {discoveryMode === 'nearby' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-green-800">
                {locationStatus === 'detecting' ? 'Detecting your location...' : activeCity ? `Showing projects with experts near ${activeCity}` : 'Select your city below'}
              </p>
              {locationStatus === 'detecting' && <Loader2 className="w-4 h-4 text-green-500 animate-spin" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {Object.keys(CITY_COORDS).map(city => (
                <button key={city} onClick={() => { setManualCity(city); setUserCity(city); setLocationStatus('manual'); }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${activeCity === city ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-700'}`}>
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {discoveryMode === 'foryou' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-blue-800">
                {userIndustry ? `Personalised for ${userIndustry} — sorted by match score` : 'Complete your onboarding to get personalised project recommendations'}
              </p>
            </div>
            {!userIndustry && <Link href="/onboarding-owner/company-details" className="text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-orange-500 px-3 py-1.5 rounded-lg">Complete Onboarding →</Link>}
          </div>
        </div>
      )}
      </>
      )}

      {/* Main content — platform-selector layout */}
      <div className="max-w-[1920px] mx-auto px-6 pt-5 pb-12">
        <div className="flex gap-8 items-start">

          {/* ── Left panel — "What do you want to build?" (selector style) ── */}
          <div className="w-[400px] flex-shrink-0 hidden lg:flex flex-col sticky top-20 self-start">
            <h2 className="text-gray-900 font-bold text-[22px] leading-snug tracking-tight mb-1.5">
              What do you want to build?
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Pick a goal — we'll find the right project and experts.
            </p>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={launcherSearch} onChange={e => setLauncherSearch(e.target.value)}
                placeholder="Search projects and tools…"
                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-gray-400" />
            </div>

            {/* Tabs — Starter Kit / Custom / Outreach / Content / Growth */}
            <div className="flex border-b border-gray-100 mb-3 overflow-x-auto scrollbar-hide">
              {LAUNCHER_TABS.map(tab => (
                <button key={tab.id}
                  onClick={() => { setActiveLauncherTab(tab.id); setSelectedLauncherOption(tab.id === 'custom' ? 'custom' : null); }}
                  className={`flex-shrink-0 px-3 py-2.5 text-[13px] font-semibold transition-colors border-b-2 -mb-[1px] ${
                    activeLauncherTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Goal options — icon + label + description rows */}
            <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 340px)' }}>
              {activeLauncherTab !== 'custom' &&
                (LAUNCHER_OPTIONS[activeLauncherTab] || [])
                  .filter(o => !launcherSearch || o.label.toLowerCase().includes(launcherSearch.toLowerCase()))
                  .map(option => {
                    const OptionIcon = LAUNCHER_OPTION_ICONS[option.id] || Sparkles;
                    const isSelected = selectedLauncherOption === option.id;
                    return (
                      <button key={option.id} onClick={() => setSelectedLauncherOption(option.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all border ${
                          isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                        }`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <OptionIcon className={`w-[17px] h-[17px] ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-[14px] leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{option.label}</p>
                          <p className="text-gray-400 text-[12px] mt-0.5 truncate">{option.desc}</p>
                        </div>
                      </button>
                    );
                  })}
              {activeLauncherTab === 'custom' &&
                LAUNCHER_OPTIONS['custom'].map(option => {
                  const OptionIcon = LAUNCHER_OPTION_ICONS[option.id] || Sparkles;
                  return (
                    <button key={option.id} onClick={() => router.push(CUSTOM_OPTION_PATHS[option.id] || '/agent')}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left bg-white border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <OptionIcon className="w-[17px] h-[17px] text-gray-500" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[14px] text-gray-800 leading-tight">{option.label}</p>
                        <p className="text-gray-400 text-[12px] mt-0.5 truncate">{option.desc}</p>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* ── Right: "Popular projects" grid ──────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Mobile heading + search */}
            <div className="lg:hidden mb-4">
              <h2 className="text-gray-900 font-bold text-xl mb-3">What do you want to build?</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search projects, skills, or industries…"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>

            {(() => {
              // Selected goal (not custom) → that goal's projects; else featured set
              const goalProjects = selectedLauncherOption && activeLauncherTab !== 'custom'
                ? (LAUNCHER_PROJECTS[selectedLauncherOption] || [])
                : null;
              const selectedOptionLabel = goalProjects
                ? (LAUNCHER_OPTIONS[activeLauncherTab] || []).find(o => o.id === selectedLauncherOption)?.label
                : null;

              return (
                <>
                  {/* Right panel header */}
                  <div className="flex items-end justify-between mb-5">
                    <div>
                      {goalProjects ? (
                        <>
                          <button onClick={() => setSelectedLauncherOption(null)}
                            className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-xs font-medium mb-1.5 transition-colors">
                            <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to popular
                          </button>
                          <h2 className="text-gray-900 font-bold text-xl tracking-tight">{selectedOptionLabel}</h2>
                          <p className="text-gray-400 text-sm mt-0.5">Recommended projects to get you started</p>
                        </>
                      ) : (
                        <>
                          <h2 className="text-gray-900 font-bold text-xl tracking-tight">Popular projects</h2>
                          <p className="text-gray-400 text-sm mt-0.5">Recommended projects to get you started</p>
                        </>
                      )}
                    </div>
                    <button onClick={() => router.push('/project-marketplace/all')}
                      className="hidden" aria-hidden />
                  </div>

                  {/* DEFAULT — featured launcher projects (full-width rich cards) */}
                  {!goalProjects && (
                    <div className="flex flex-col gap-4">
                      {FEATURED_LAUNCHER_PROJECTS.map((project, i) => (
                        <button key={i} onClick={() => router.push(project.path)}
                          className="group text-left flex flex-col sm:flex-row rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-blue-300 hover:shadow-[0_14px_40px_-14px_rgba(0,0,0,0.2)] transition-all duration-200">

                          {/* Image — left (tag + stats overlaid) */}
                          <div className="relative sm:w-60 lg:w-64 flex-shrink-0 overflow-hidden" style={{ minHeight: '190px' }}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${project.thumb}`} />
                            {project.img && (
                              <img src={project.img} alt={project.title} loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/10" />
                            {/* top-left: tag + stat chips adjacent */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                              {project.tag && (
                                <span className="text-[10px] font-bold text-white bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full">{project.tag}</span>
                              )}
                              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-white bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-300 fill-amber-300" />{project.rating}</span>
                                <span className="text-white/50">·</span>
                                <span>{project.completed} done</span>
                                <span className="text-white/50">·</span>
                                <span>{project.experts} experts</span>
                              </span>
                            </div>
                            {/* outcome banner over image */}
                            <p className="absolute bottom-3 left-3 right-3 text-white font-bold text-[13px] leading-snug drop-shadow">{project.outcome}</p>
                          </div>

                          {/* Info — right */}
                          <div className="flex-1 flex flex-col p-5 min-w-0">
                            <div className="min-w-0">
                              <h3 className="text-gray-900 font-bold text-[17px] leading-tight group-hover:text-blue-700 transition-colors">{project.title}</h3>
                              <p className="text-gray-500 text-[12.5px] mt-0.5 leading-relaxed">{project.desc}</p>
                            </div>

                            {/* What you get */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 mt-3.5">
                              {project.deliverables?.map(d => (
                                <div key={d} className="flex items-start gap-1.5">
                                  <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-[12px] text-gray-600 leading-snug">{d}</span>
                                </div>
                              ))}
                            </div>

                            {/* Success highlight + ROI */}
                            {project.sh && (
                              <div className="flex items-center gap-2 mt-3.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                <p className="text-[11px] text-amber-800 font-medium italic flex-1 min-w-0 truncate">{project.sh}</p>
                                {project.roi && <span className="text-[11px] font-black text-amber-700 flex-shrink-0">{project.roi}</span>}
                              </div>
                            )}

                            {/* Footer: price (left) + CTA (right) */}
                            <div className="flex items-end justify-between gap-3 mt-auto pt-4 border-t border-gray-100">
                              <div>
                                <p className="text-[10px] text-gray-400 font-medium">From</p>
                                <p className="text-[19px] font-black text-gray-900 leading-none">{project.price}
                                  <span className="text-[11px] font-medium text-gray-400 ml-1.5">· {project.duration}</span>
                                </p>
                              </div>
                              <span className="flex items-center gap-1 text-[12px] font-bold text-blue-600 group-hover:text-blue-700 flex-shrink-0">
                                View project <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* SELECTED GOAL — filtered launcher projects (with success proof) */}
                  {goalProjects && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {goalProjects.map((project, i) => (
                        <button key={i} onClick={() => router.push(project.path)}
                          className="group text-left flex flex-col rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-blue-300 hover:shadow-[0_12px_34px_-14px_rgba(0,0,0,0.2)] transition-all">
                          {/* emoji thumbnail */}
                          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${LAUNCHER_CARD_COLORS[i % LAUNCHER_CARD_COLORS.length]} flex items-center justify-center`}>
                              <span className="text-4xl relative z-10">{project.emoji}</span>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
                            </div>
                            {project.roi && (
                              <span className="absolute top-2.5 right-2.5 text-[10px] font-bold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">{project.roi}</span>
                            )}
                          </div>
                          {/* body */}
                          <div className="flex-1 flex flex-col p-4">
                            <p className="text-gray-900 font-bold text-[14px] leading-tight group-hover:text-blue-700 transition-colors">{project.title}</p>
                            <p className="text-gray-500 text-[12px] mt-0.5 line-clamp-2 leading-relaxed">{project.desc}</p>
                            {/* success highlight */}
                            {project.sh && (
                              <div className="flex items-start gap-1.5 mt-2.5 pt-2.5 border-t border-gray-100">
                                <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-[11px] text-gray-600 italic leading-snug line-clamp-2">{project.sh}</p>
                              </div>
                            )}
                            <span className="flex items-center gap-1 text-[12px] font-bold text-blue-600 group-hover:text-blue-700 mt-3">
                              View project <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sign-in nudge */}
                  <p className="mt-6 flex items-center gap-2 text-[12px] text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                    Free to start — access all 200+ projects instantly ·{' '}
                    <button onClick={() => router.push('/register')} className="text-blue-600 font-semibold hover:underline">Create account →</button>
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <BottomCTA userRole={userRole} />

      {/* Apply Modal */}
      {applyProject && <ApplyModal project={applyProject} onClose={() => setApplyProject(null)} />}
    </div>
  );
}
