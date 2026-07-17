'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Sparkles, TrendingUp, Target, Zap, Users, MessageSquare, Search, Star, Award,
  Play, ChevronDown, ChevronRight, Check, Briefcase, ArrowRight, Globe, Rocket,
  ChevronLeft, Package, UserCheck, MapPin, Menu, FileText, LogOut, LayoutDashboard, Settings,
  LayoutGrid, Bot, Phone, Mail, Layers, BarChart2, Paperclip
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPlansWithPackages } from '@/services/planService';
import { useAuth } from '@/contexts/AuthContext';

// Only these 4 projects are LIVE — every other card routes to "Coming soon".
const LIVE_PROJECT_SLUGS = new Set([
  'outbound-list-builder',   // Lead in a Box
  'hotlead-in-a-box',        // HotLead in a Box
  'ai-email-sales-agency',   // Cold Email Machine
  'brand-voice-social',      // Brand Identity Kit
]);

function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth();

  // Gate project cards: only live slugs open details; the rest show Coming soon.
  const openProject = (path) => {
    const slug = (path || '').split('/').pop();
    router.push(LIVE_PROJECT_SLUGS.has(slug) ? path : '/project-marketplace/coming-soon');
  };
  const [openFAQ, setOpenFAQ] = useState(null);
  const [heroInput, setHeroInput] = useState('');
  const [agentComingSoon, setAgentComingSoon] = useState(false); // temporary gate — agent not public yet
  const [showSignInDropdown, setShowSignInDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pricingData, setPricingData] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(true);
  const signInRef = useRef(null);
  const profileRef = useRef(null);
  const [activeLauncherTab, setActiveLauncherTab] = useState('starter-kit');
  const [selectedLauncherOption, setSelectedLauncherOption] = useState(null);
  const [launcherSearch, setLauncherSearch] = useState('');
  const [showcaseSlide, setShowcaseSlide] = useState(0);
  const [showcasePaused, setShowcasePaused] = useState(false);
  const [showcaseUrl, setShowcaseUrl] = useState('');
  const topProjectsScrollRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    setShowProfileDropdown(false);
    window.location.replace('/');
  };

  const getDashboardPath = () => {
    if (user?.activeRole === 'expert') return '/expert-dashboard';
    return '/business-dashboard';
  };

  const handleProtectedRoute = (path) => {
    if (isAuthenticated) {
      router.push(path);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
    }
  };

  // Logged-in users should never see the landing page — their dashboard IS their home
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(user?.activeRole === 'expert' ? '/expert-dashboard' : '/business-dashboard');
    }
  }, [isAuthenticated, authLoading, user, router]);

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setPricingLoading(true);
        const response = await getPlansWithPackages();
        if (response.success && response.data) {
          const transformedPricing = [];
          response.data.forEach(plan => {
            if (plan.packages && plan.packages.length > 0) {
              plan.packages.forEach((pkg, index) => {
                let cta = 'Get Started';
                if (pkg.name.toLowerCase().includes('enterprise') || plan.type === 'enterprise') cta = 'Contact Sales';
                transformedPricing.push({
                  name: pkg.name,
                  price: `$${pkg.price}`,
                  period: '/month',
                  description: `For ${plan.displayName.toLowerCase()}`,
                  features: [`${pkg.credits.toLocaleString()} Credits/month`, `${pkg.projectsAvailable} Project${pkg.projectsAvailable > 1 ? 's' : ''}`, pkg.support],
                  cta,
                  popular: index === 1,
                  planId: plan._id,
                  packageId: pkg._id
                });
              });
            }
          });
          setPricingData(transformedPricing);
        }
      } catch (error) {
        setPricingData([
          { name: 'Starter', price: '$29', period: '/month', description: 'Perfect for startups', features: ['1,000 Credits/month', '1 Project', 'Basic analytics'], cta: 'Get Started', popular: false },
          { name: 'Growth', price: '$79', period: '/month', description: 'For growing businesses', features: ['3,000 Credits/month', '3 Projects', 'Priority support'], cta: 'Get Started', popular: true },
          { name: 'Scale', price: '$149', period: '/month', description: 'Enterprise solutions', features: ['7,000 Credits/month', '5 Projects', 'Dedicated support'], cta: 'Contact Sales', popular: false }
        ]);
      } finally {
        setPricingLoading(false);
      }
    };
    fetchPricingData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (signInRef.current && !signInRef.current.contains(event.target)) setShowSignInDropdown(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const experts = [
    { name: "Sarah Mitchell", role: "Content Strategist", expertise: "SEO, Blog Strategy, Content Marketing", rating: 4.9, reviews: 127, hourlyRate: "$95/hr", avatar: "SM", badge: "Top Rated", color: "from-blue-600 to-orange-400" },
    { name: "Marcus Chen", role: "Growth Marketer", expertise: "Performance Marketing, Analytics, A/B Testing", rating: 5.0, reviews: 89, hourlyRate: "$120/hr", avatar: "MC", badge: "Expert", color: "from-green-500 to-teal-500" },
    { name: "Emma Rodriguez", role: "Brand Designer", expertise: "Visual Identity, UI/UX, Brand Guidelines", rating: 4.8, reviews: 156, hourlyRate: "$85/hr", avatar: "ER", badge: "Rising Star", color: "from-pink-500 to-rose-500" },
    { name: "David Park", role: "PR Specialist", expertise: "Media Relations, Crisis Management, Press Releases", rating: 4.9, reviews: 94, hourlyRate: "$110/hr", avatar: "DP", badge: "Top Rated", color: "from-orange-500 to-red-500" },
    { name: "Lisa Thompson", role: "Social Media Manager", expertise: "Community Building, Influencer Marketing", rating: 4.7, reviews: 203, hourlyRate: "$75/hr", avatar: "LT", badge: "Verified", color: "from-blue-500 to-indigo-500" },
    { name: "James Wilson", role: "Marketing Strategist", expertise: "Go-to-Market, Product Launch, Market Research", rating: 5.0, reviews: 78, hourlyRate: "$130/hr", avatar: "JW", badge: "Expert", color: "from-purple-500 to-pink-500" }
  ];

  const faqs = [
    { question: 'How does AI planning work?', answer: 'Our AI analyzes your goals, industry, and resources to create a customized 90-day roadmap.' },
    { question: 'How are experts vetted?', answer: 'Every expert goes through a rigorous 5-step vetting process. Only the top 3% of applicants are approved.' },
    { question: 'What if I\'m not satisfied with an expert?', answer: 'We offer a 100% satisfaction guarantee. We\'ll replace them for free and refund any unused hours.' },
    { question: 'Can I hire multiple experts?', answer: 'Absolutely! Most successful projects involve 2-4 specialists working together.' },
    { question: 'How do payments work?', answer: 'We use milestone-based payments. Funds are held in escrow and released only when you approve deliverables.' }
  ];

  const navLinks = [
    { label: 'About', path: '/about', icon: <Globe className="w-4 h-4" /> },
    { label: 'Products', path: '/products', icon: <Package className="w-4 h-4" /> },
    { label: 'Services', path: '/services', icon: <Zap className="w-4 h-4" /> },
    { label: 'Resources', path: '/resources', icon: <FileText className="w-4 h-4" /> },
    { label: 'Pricing', path: '/#pricing', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const footerLinks = [
    { label: 'Features', path: '/features' },
    { label: 'Pricing', path: '/#pricing' },
    { label: 'Preferences', path: '/preferences' },
    { label: 'Support & Help', path: '/support-help' },
    { label: 'Legal & Compliance', path: '/legal-compliance' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Privacy Policy', path: '/privacy' },
  ];

  // Showcase carousel auto-rotation — DISABLED for now: only the Project
  // Selector slide is shown (GTM Analyzer temporarily hidden). Uncomment to restore.
  // useEffect(() => {
  //   if (showcasePaused) return;
  //   const timer = setInterval(() => {
  //     setShowcaseSlide(prev => (prev + 1) % 2);
  //   }, 5000);
  //   return () => clearInterval(timer);
  // }, [showcasePaused]);

  const toggleFAQ = (index) => setOpenFAQ(openFAQ === index ? null : index);

  // ── App Launcher data ──────────────────────────────────────────────────────
  const launcherTabs = [
    { id: 'starter-kit', label: 'Starter Kit' },
    { id: 'custom',      label: 'Custom' },
    { id: 'outreach',    label: 'Outreach' },
    { id: 'content',     label: 'Content' },
    { id: 'growth',      label: 'Growth' },
  ];

  const launcherOptions = {
    'starter-kit': [
      { id: 'get-customers',  label: 'Get New Customers',      icon: '🎯', desc: 'Lead gen, outreach & pipeline building' },
      { id: 'advertise',      label: 'Advertise Your Product', icon: '📣', desc: 'Google, Meta & LinkedIn ad campaigns' },
      { id: 'brand-presence', label: 'Build Brand Presence',   icon: '🏆', desc: 'Identity, PR & thought leadership' },
      { id: 'go-viral',       label: 'Go Viral on Social',     icon: '🔥', desc: 'Hooks, formats & platform distribution' },
      { id: 'launch-product', label: 'Launch a Product',       icon: '🚀', desc: 'GTM strategy, waitlist & launch day' },
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
      { id: 'blog-seo',       label: 'Blog & SEO Content',     icon: '✍️', desc: 'Keyword research & optimised posts' },
      { id: 'social-posts',   label: 'Social Media Posts',     icon: '📲', desc: 'Content calendar across all platforms' },
      { id: 'video-scripts',  label: 'Video Scripts',          icon: '🎥', desc: 'Hooks, scripts & CTAs for any format' },
      { id: 'email-copy',     label: 'Email Copy',             icon: '📝', desc: 'Welcome, nurture & conversion sequences' },
    ],
    'growth': [
      { id: 'lead-gen',       label: 'Lead Generation',        icon: '⚡', desc: 'ICP-matched verified lead lists' },
      { id: 'paid-ads',       label: 'Paid Advertising',       icon: '📈', desc: 'Performance campaigns & ad creatives' },
      { id: 'referral',       label: 'Referral Programs',      icon: '🤝', desc: 'Referral system design & launch' },
      { id: 'retention',      label: 'Customer Retention',     icon: '🔄', desc: 'Churn reduction & loyalty programs' },
    ],
  };

  const MP = '/project-marketplace'; // shorthand
  const launcherProjects = {
    'get-customers': [
      { title: 'Lead in a Box',       desc: '1,000 ICP-matched verified leads delivered',    emoji: '🎯', path: `${MP}/outbound-list-builder` },
      { title: 'Cold Email Machine',  desc: 'Automated multi-step outreach sequences',       emoji: '📧', path: `${MP}/ai-email-sales-agency` },
      { title: 'AI Cold Calls',       desc: 'AI-powered voice outreach campaigns',           emoji: '📞', path: `${MP}/sales-outreach-automation` },
    ],
    'advertise': [
      { title: 'Google Ads Setup',    desc: 'End-to-end performance campaign launch',        emoji: '📈', path: `${MP}/traffic-abm-agency` },
      { title: 'Meta Ads',            desc: 'Facebook & Instagram advertising',              emoji: '🎯', path: `${MP}/traffic-abm-agency` },
      { title: 'Ad Creatives Pack',   desc: 'High-converting copy, visuals & videos',        emoji: '🎨', path: `${MP}/brand-voice-thought-leadership` },
    ],
    'brand-presence': [
      { title: 'Brand Identity Kit',  desc: 'Logo, colors, voice & brand guidelines',        emoji: '🏆', path: `${MP}/brand-voice-social` },
      { title: 'LinkedIn Authority',  desc: 'Thought leadership & profile program',          emoji: '💼', path: `${MP}/connection-relationship-manager` },
      { title: 'PR & Media',          desc: 'Press coverage & journalist outreach',          emoji: '📰', path: `${MP}/brand-voice-thought-leadership` },
    ],
    'go-viral': [
      { title: 'Viral Content Engine',desc: 'Hooks, formats & multi-platform distribution',  emoji: '🔥', path: `${MP}/brand-voice-thought-leadership` },
      { title: 'Influencer Connect',  desc: 'Micro-influencer campaign management',          emoji: '⭐', path: `${MP}/brand-voice-thought-leadership` },
      { title: 'Community Build',     desc: 'Discord, Slack & community growth system',      emoji: '👥', path: `${MP}/connection-relationship-manager` },
    ],
    'launch-product': [
      { title: 'Product Hunt Launch', desc: 'Hunt day strategy, assets & execution',         emoji: '🏅', path: `${MP}/brand-voice-thought-leadership` },
      { title: 'Launch Waitlist',     desc: 'Pre-launch audience & waitlist building',       emoji: '📋', path: `${MP}/inbound-aggregation` },
    ],
    'email-outreach': [
      { title: 'Cold Email Machine',  desc: 'Multi-step personalized outreach flows',        emoji: '📧', path: `${MP}/ai-email-sales-agency` },
      { title: 'Email Warm-up',       desc: 'Domain reputation & deliverability building',  emoji: '🔥', path: `${MP}/email-warmup` },
      { title: 'Newsletter Build',    desc: 'Audience-building newsletter system',           emoji: '📰', path: `${MP}/inbound-aggregation` },
    ],
    'linkedin': [
      { title: 'LinkedIn Lead Gen',   desc: 'Profile optimisation + outreach sequences',    emoji: '💼', path: `${MP}/connection-relationship-manager` },
      { title: 'Sales Navigator Pro', desc: 'Advanced targeting & lead list building',       emoji: '🎯', path: `${MP}/sales-navigator-pro` },
      { title: 'DM Outreach System',  desc: 'Personalised connection + DM campaigns',       emoji: '✉️', path: `${MP}/sales-outreach-automation` },
    ],
    'cold-calls': [
      { title: 'AI Call Campaigns',   desc: 'Automated voice outreach at scale',            emoji: '📞', path: `${MP}/call-intelligence-crm` },
      { title: 'Sales Dialer Setup',  desc: 'Power dialer + script + training',             emoji: '🎙️', path: `${MP}/call-intelligence-crm` },
    ],
    'sms-campaigns': [
      { title: 'SMS Drip Sequences',  desc: 'Text message nurture & conversion flows',      emoji: '💬', path: `${MP}/sms-drip-sequences` },
      { title: 'WhatsApp Outreach',   desc: 'WhatsApp broadcast & automation setup',        emoji: '📲', path: `${MP}/sales-outreach-automation` },
    ],
    'blog-seo': [
      { title: 'SEO Blog Engine',     desc: '4 posts/mo with keyword research & briefs',    emoji: '✍️', path: `${MP}/inbound-aggregation` },
      { title: 'Long-form Authority', desc: 'Deep-dive articles that rank & convert',        emoji: '📄', path: `${MP}/inbound-aggregation` },
      { title: 'Technical SEO Audit', desc: 'Full site audit + fix recommendations',        emoji: '🔍', path: `${MP}/inbound-aggregation` },
    ],
    'social-posts': [
      { title: 'Social Calendar',     desc: '30 posts/mo across LinkedIn, X & Instagram',  emoji: '📲', path: `${MP}/brand-voice-thought-leadership` },
      { title: 'Short-form Videos',   desc: 'Reels, TikToks & YouTube Shorts',             emoji: '🎥', path: `${MP}/brand-voice-thought-leadership` },
    ],
    'video-scripts': [
      { title: 'Video Script Pack',   desc: 'Hooks, scripts & CTAs for any format',         emoji: '🎬', path: `${MP}/brand-voice-thought-leadership` },
      { title: 'YouTube Strategy',    desc: 'Channel plan, SEO & content calendar',          emoji: '▶️', path: `${MP}/inbound-aggregation` },
    ],
    'email-copy': [
      { title: 'Email Copy System',   desc: 'Welcome, nurture & sales email sequences',     emoji: '📝', path: `${MP}/email-copy-system` },
      { title: 'Newsletter Design',   desc: 'Template, copy & weekly send system',          emoji: '💌', path: `${MP}/newsletter-design` },
    ],
    'lead-gen': [
      { title: 'Lead in a Box',       desc: '1,000 ICP-matched verified leads delivered',    emoji: '🎯', path: `${MP}/outbound-list-builder` },
      { title: 'Inbound Lead Funnel', desc: 'Landing page + lead magnet + nurture',         emoji: '⚡', path: `${MP}/inbound-aggregation` },
    ],
    'paid-ads': [
      { title: 'Full Funnel Ads',     desc: 'Google + Meta + LinkedIn ads management',      emoji: '📈', path: `${MP}/traffic-abm-agency` },
      { title: 'Retargeting System',  desc: 'Pixel setup + retargeting campaigns',          emoji: '🔄', path: `${MP}/traffic-abm-agency` },
    ],
    'referral': [
      { title: 'Referral Program',    desc: 'End-to-end referral system design & launch',   emoji: '🤝', path: `${MP}/connection-relationship-manager` },
      { title: 'Affiliate Setup',     desc: 'Affiliate program + partner recruitment',       emoji: '🌐', path: `${MP}/connection-relationship-manager` },
    ],
    'retention': [
      { title: 'Churn Reduction',     desc: 'Exit surveys, win-back & loyalty flows',       emoji: '🔄', path: `${MP}/demo-prep-crm-research` },
      { title: 'Customer Success',    desc: 'Onboarding + NPS + upsell system',             emoji: '💎', path: `${MP}/demo-prep-crm-research` },
    ],
  };
  const featuredLauncherProjects = [
    { title: 'Lead in a Box',        punchLine: 'Get 1,000 qualified leads for your startup — in 3 days.',       desc: '1,000 ICP-matched verified leads ready for outreach', emoji: '🎯', thumb: 'from-blue-600 via-blue-500 to-cyan-400',      img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=640&h=360&fit=crop&auto=format',  path: '/project-marketplace/outbound-list-builder',          tag: 'Most Popular' },
    { title: 'HotLead in a Box',     punchLine: 'A full outbound engine — email, voice & LinkedIn, run for you.', desc: 'Full AI-orchestrated outbound — email + voice + LinkedIn', emoji: '🔥', thumb: 'from-violet-600 via-purple-500 to-pink-400',  img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=640&h=360&fit=crop&auto=format',  path: '/project-marketplace/hotlead-in-a-box',               tag: 'Featured' },
    { title: 'Cold Email Machine',   punchLine: 'Book 30+ meetings a month — fully on autopilot.',               desc: 'Multi-step automated outreach with personalisation',  emoji: '📧', thumb: 'from-emerald-600 via-teal-500 to-cyan-400',   img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=640&h=360&fit=crop&auto=format', path: '/project-marketplace/ai-email-sales-agency',         tag: 'Outreach' },
    { title: 'Brand Identity Kit',   punchLine: 'A brand so sharp, customers trust you on sight.',               desc: 'Logo, typography, color palette & brand voice guide', emoji: '🏆', thumb: 'from-rose-600 via-pink-500 to-fuchsia-400',   img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=640&h=360&fit=crop&auto=format',  path: '/project-marketplace/brand-voice-social',             tag: 'Branding' },
  ];

  const projectCardColors = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-rose-500 to-pink-500',
    'from-indigo-500 to-blue-500',
  ];
  // ── End App Launcher data ─────────────────────────────────────────────────

  // Don't render landing page for authenticated users (redirect fires in useEffect above)
  if (authLoading || isAuthenticated) return null;

  return (
    <div className="min-h-screen font-sans overflow-x-hidden bg-white">

      {/* ==================== NAVIGATION ==================== */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <Image src="/karya-ai-logo.png" alt="Karya AI" width={40} height={40} className="rounded-xl object-contain" />
              <span className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Karya-AI</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link, i) => (
                <Link key={i} href={link.path} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-all hover:bg-gray-50 rounded-lg flex items-center gap-2">
                  {link.icon}{link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all group">
                    <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">{getInitials(user?.name)}</div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-3 w-52 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden animate-slideDown z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <button onClick={() => { router.push(getDashboardPath()); setShowProfileDropdown(false); }} className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-all text-sm"><LayoutDashboard className="w-4 h-4 text-blue-500" /> Dashboard</button>
                      <button onClick={() => { router.push('/preferences'); setShowProfileDropdown(false); }} className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-all text-sm"><Settings className="w-4 h-4 text-blue-500" /> Settings</button>
                      <div className="border-t border-gray-100">
                        <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-all text-sm"><LogOut className="w-4 h-4" /> Logout</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="relative" ref={signInRef}>
                    <button onClick={() => setShowSignInDropdown(!showSignInDropdown)} className="px-4 py-2 text-gray-900 font-medium border border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 flex items-center gap-2 transition-all">
                      Sign In <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showSignInDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showSignInDropdown && (
                      <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden animate-slideDown">
                        <button onClick={() => { router.push('/login?role=owner'); setShowSignInDropdown(false); }} className="w-full px-4 py-4 text-left text-gray-900 hover:bg-blue-50 flex items-center gap-3 transition-all group">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform"><Briefcase className="w-5 h-5 text-blue-500" /></div>
                          <div><div className="font-medium">As Business</div><div className="text-xs text-gray-500">Hire experts & manage projects</div></div>
                        </button>
                        <button onClick={() => { router.push('/login?role=expert'); setShowSignInDropdown(false); }} className="w-full px-4 py-4 text-left text-gray-900 hover:bg-emerald-50 flex items-center gap-3 transition-all border-t border-gray-200 group">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform"><UserCheck className="w-5 h-5 text-emerald-500" /></div>
                          <div><div className="font-medium">As Expert</div><div className="text-xs text-gray-500">Find work & grow your career</div></div>
                        </button>
                      </div>
                    )}
                  </div>
                  <button onClick={() => router.push('/register')} className="relative px-5 py-2 bg-blue-600 rounded-xl text-white font-medium transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 overflow-hidden group">
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 py-4 border-t border-gray-200 animate-slideDown">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <Link key={i} href={link.path} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-50 rounded-lg flex items-center gap-3">{link.icon}{link.label}</Link>
                ))}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  {isAuthenticated ? (
                    <>
                      <button onClick={() => { router.push(getDashboardPath()); setMobileMenuOpen(false); }} className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium flex items-center justify-center gap-2"><LayoutDashboard className="w-4 h-4" /> Dashboard</button>
                      <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex-1 px-4 py-2 text-red-600 font-medium border border-red-200 rounded-lg flex items-center justify-center gap-2"><LogOut className="w-4 h-4" /> Logout</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { router.push('/login'); setMobileMenuOpen(false); }} className="flex-1 px-4 py-2 text-gray-900 font-medium border border-gray-300 rounded-lg">Sign In</button>
                      <button onClick={() => { router.push('/register'); setMobileMenuOpen(false); }} className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium">Get Started</button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* ==================== SECTION 1: HERO (50vh — horizontal split) ==================== */}
      {!isAuthenticated && (
        <section className="relative flex items-center border-b border-gray-100 bg-white overflow-hidden"
          style={{ height: '50vh', minHeight: '300px' }}>
          {/* Soft glow */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-50/70 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-orange-50/50 rounded-full blur-[70px] pointer-events-none" />

          <div className="relative w-full max-w-6xl mx-auto px-8 xl:px-14 flex items-center gap-10 lg:gap-16">

            {/* Left — headline */}
            <div className="flex-1 min-w-0 animate-fadeInUp">
              <h1 className="font-black text-gray-900 leading-[1.08] mb-3">
                <span className="block text-3xl sm:text-4xl xl:text-5xl">From Idea to</span>
                <span className="block text-3xl sm:text-4xl xl:text-5xl">Customers in 90 Days.</span>
              </h1>
              <p className="text-gray-500 text-sm xl:text-[15px] leading-relaxed max-w-sm">
                AI builds the strategy, matches vetted experts, and tracks real results for you.
              </p>
            </div>

            {/* Right — chatbox */}
            <div className="flex-shrink-0 w-[380px] xl:w-[440px] animate-fadeInUp animation-delay-200">
              <div className="bg-white border border-gray-200 rounded-xl"
                style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.07)' }}>
                <textarea
                  value={heroInput}
                  onChange={e => setHeroInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      // Agent is temporarily gated — show coming soon (agent code untouched)
                      setAgentComingSoon(true);
                    }
                  }}
                  placeholder="Describe your GTM goal… e.g. I need 1,000 leads for my B2B SaaS targeting HR teams in India"
                  rows={3}
                  className="w-full px-4 pt-4 pb-2 text-gray-700 placeholder-gray-400 text-[13px] leading-relaxed bg-transparent border-none outline-none resize-none"
                />
                <div className="flex items-center justify-between px-3 pb-3">
                  <button className="p-1 text-gray-300 hover:text-gray-500 transition-colors" type="button">
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setAgentComingSoon(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-[12px] font-semibold transition-colors" type="button">
                    Start for free <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {agentComingSoon ? (
                <div className="mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-[12px] font-semibold text-blue-700">The AI agent is coming soon — stay tuned!</p>
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 mt-2 text-center">Press Enter to submit · Shift+Enter for new line</p>
              )}
            </div>

          </div>
        </section>
      )}

      {/* ==================== SECTION 2: PLATFORM SHOWCASE ==================== */}
      {!isAuthenticated && (
        <section className="relative overflow-hidden bg-white">
          <div className="relative max-w-[1560px] mx-auto px-3 sm:px-5">

                {/* ── Platform showcase ── */}
                <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] flex flex-col"
                  style={{ height: 'calc(100vh - 80px)', minHeight: '680px', maxHeight: '1080px' }}
                  onMouseEnter={() => setShowcasePaused(true)}
                  onMouseLeave={() => setShowcasePaused(false)}>


              {/* Browser chrome */}
              <div className="h-10 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0" style={{ display: 'none' }}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-[290px] bg-gray-100 rounded-md px-3 py-1 text-[11px] text-gray-400 flex items-center justify-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border border-gray-300 flex-shrink-0" />
                    {showcaseSlide === 0 ? 'app.karya-ai.com' : 'app.karya-ai.com/analyze'}
                  </div>
                </div>
                <div className="w-28 flex justify-end items-center gap-1.5">
                  <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                    <Image src="/karya-ai-logo.png" alt="K" width={12} height={12} className="object-contain brightness-0 invert" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600">Karya AI</span>
                </div>
              </div>

              {/* ── Slides area ── */}
              <div className="flex-1 relative overflow-hidden">

                {/* SLIDE 1: Launch Pad (project selector) */}
                <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${showcaseSlide === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                  <div className="flex h-full overflow-hidden">

            {/* ── Icon Rail ── */}
            <div className="hidden md:flex w-[72px] flex-col items-center pt-6 pb-5 gap-1 bg-white border-r border-gray-100 flex-shrink-0 h-full">
              {[
                { Icon: LayoutGrid,    label: 'Home',     path: '/business-dashboard' },
                { Icon: Layers,        label: 'Projects', path: '/project-marketplace' },
                { Icon: Bot,           label: 'Agent',    path: '/agent' },
                { Icon: Users,         label: 'Experts',  path: '/expert-marketplace' },
                { Icon: MessageSquare, label: 'Messages', path: '/business-dashboard/messages' },
              ].map(({ Icon, label, path }) => (
                <button key={label} onClick={() => handleProtectedRoute(path)} title={label}
                  className="w-12 h-12 flex flex-col items-center justify-center gap-1 rounded-xl transition-colors text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                  <Icon className="w-[22px] h-[22px]" strokeWidth={1.5} />
                  <span className="text-[8px] font-medium tracking-wide leading-none opacity-60">{label}</span>
                </button>
              ))}
              <div className="flex-1" />
              <button onClick={() => handleProtectedRoute('/settings')} title="Settings"
                className="w-12 h-12 flex flex-col items-center justify-center gap-1 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                <Settings className="w-[22px] h-[22px]" strokeWidth={1.5} />
                <span className="text-[8px] font-medium opacity-60">Settings</span>
              </button>
            </div>

            {/* ── Left Panel ── */}
            <div className="hidden md:flex w-[420px] lg:w-[500px] flex-col bg-white border-r border-gray-100 flex-shrink-0 h-full overflow-hidden">

              {/* Header */}
              <div className="flex-shrink-0 px-7 pt-7 pb-4">
                <h2 className="text-gray-900 font-bold text-[20px] leading-snug tracking-tight mb-1.5">
                  What do you want to build?
                </h2>
                <p className="text-gray-500 text-[13px] leading-relaxed">Pick a goal — we'll find the right project and experts.</p>
              </div>

              {/* Search */}
              <div className="flex-shrink-0 px-7 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-gray-400" strokeWidth={1.5} />
                  <input type="text" value={launcherSearch} onChange={(e) => setLauncherSearch(e.target.value)}
                    placeholder="Search projects and tools…"
                    className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-[13px] focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex-shrink-0 flex border-b border-gray-100 overflow-x-auto scrollbar-none px-7">
                {launcherTabs.map(tab => (
                  <button key={tab.id}
                    onClick={() => { setActiveLauncherTab(tab.id); setSelectedLauncherOption(tab.id === 'custom' ? 'custom' : null); }}
                    className={`flex-shrink-0 px-3 py-2.5 text-[12px] font-semibold transition-colors border-b-2 -mb-[1px] ${
                      activeLauncherTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Option list */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
                {activeLauncherTab !== 'custom' &&
                  (launcherOptions[activeLauncherTab] || [])
                    .filter(o => !launcherSearch || o.label.toLowerCase().includes(launcherSearch.toLowerCase()))
                    .map(option => {
                      const ICON_MAP = {
                        'get-customers':  Users,       'advertise':      BarChart2,
                        'brand-presence': Star,        'go-viral':       Zap,
                        'launch-product': Rocket,      'email-outreach': Mail,
                        'linkedin':       Briefcase,   'cold-calls':     Phone,
                        'sms-campaigns':  MessageSquare, 'blog-seo':     FileText,
                        'social-posts':   Globe,       'video-scripts':  Play,
                        'email-copy':     Mail,        'lead-gen':       Target,
                        'paid-ads':       TrendingUp,  'referral':       Users,
                        'retention':      Award,
                      };
                      const OptionIcon = ICON_MAP[option.id] || Sparkles;
                      const isSelected = selectedLauncherOption === option.id;
                      return (
                        <button key={option.id} onClick={() => setSelectedLauncherOption(option.id)}
                          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all border ${
                            isSelected
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                          }`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <OptionIcon className={`w-[15px] h-[15px] ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-[13px] leading-tight transition-colors ${
                              isSelected ? 'text-blue-700' : 'text-gray-800'
                            }`}>{option.label}</p>
                            <p className="text-gray-400 text-[11px] mt-0.5 truncate">{option.desc}</p>
                          </div>
                        </button>
                      );
                    })
                }
                {activeLauncherTab === 'custom' && [
                  { label: 'Fill Manually',   Icon: FileText, desc: 'Step-by-step guided project builder', path: '/create-project' },
                  { label: 'Schedule a Call', Icon: Phone,    desc: 'Our team scopes the project with you', path: '/business-dashboard/submit-project/schedule' },
                  { label: 'By Agent',        Icon: Bot,      desc: 'AI chats with you & builds the brief', path: '/agent' },
                ].map(opt => (
                  <button key={opt.label} onClick={() => handleProtectedRoute(opt.path)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left bg-white border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <opt.Icon className="w-[15px] h-[15px] text-gray-500" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[13px] text-gray-800">{opt.label}</p>
                      <p className="text-gray-400 text-[11px] mt-0.5 truncate">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

            </div>

            {/* ── Right Panel ── */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">

              {/* Desktop: full-height layout */}
              <div className="hidden md:flex flex-col h-full">

                {/* TOP — heading only, compact */}
                <div className="flex-shrink-0 border-b border-gray-100 px-8 pt-5 pb-4">
                  {selectedLauncherOption && activeLauncherTab !== 'custom' ? (
                    <>
                      <button onClick={() => setSelectedLauncherOption(null)}
                        className="flex items-center gap-1 text-gray-400 hover:text-gray-700 text-[12px] font-medium mb-1.5 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 rotate-180" strokeWidth={2} /> Back
                      </button>
                      <h2 className="text-gray-900 font-bold text-[20px] tracking-tight leading-tight">
                        {launcherOptions[activeLauncherTab]?.find(o => o.id === selectedLauncherOption)?.label}
                      </h2>
                      <p className="text-gray-400 text-[12px] mt-0.5">Recommended projects to get you started</p>
                    </>
                  ) : activeLauncherTab === 'custom' ? (
                    <>
                      <h2 className="text-gray-900 font-bold text-[20px] tracking-tight leading-tight">How would you like to build?</h2>
                      <p className="text-gray-400 text-[12px] mt-0.5">Choose the method that works best for you</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-gray-900 font-bold text-[20px] tracking-tight leading-tight">Popular projects</h2>
                      <p className="text-gray-400 text-[12px] mt-0.5">Recommended projects to get you started</p>
                    </>
                  )}
                </div>

                {/* MAIN — full remaining height for project cards */}
                <div className="flex-1 min-h-0 overflow-y-auto px-8 py-5">

                  {/* DEFAULT: 2×2 project cards (first 4 only) */}
                  {!selectedLauncherOption && activeLauncherTab !== 'custom' && (
                    <div className="grid grid-cols-2 gap-4 h-full" style={{ gridTemplateRows: '1fr 1fr' }}>
                      {featuredLauncherProjects.slice(0, 4).map((project, i) => (
                        <button key={i} onClick={() => openProject(project.path)}
                          className="group text-left flex flex-col rounded-xl overflow-hidden transition-colors animate-fadeInUp min-h-0"
                          style={{ animationDelay: `${i * 55}ms`, animationFillMode: 'both' }}>
                          <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${project.thumb}`} />
                            {project.img && (
                              <img src={project.img} alt={project.title}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                                loading="lazy" />
                            )}
                            {project.tag && (
                              <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold text-white bg-black/30 px-2.5 py-1 rounded-full">
                                {project.tag}
                              </span>
                            )}
                          </div>
                          <div className="flex-shrink-0 pt-2 pb-1">
                            <p className="text-gray-900 font-semibold text-[13px] leading-tight">{project.title}</p>
                            <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-1 leading-relaxed">{project.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* SELECTED: 2×2 filtered cards */}
                  {selectedLauncherOption && activeLauncherTab !== 'custom' && launcherProjects[selectedLauncherOption] && (
                    <div className="grid grid-cols-2 gap-5">
                      {launcherProjects[selectedLauncherOption].map((project, i) => (
                        <button key={i} onClick={() => openProject(project.path)}
                          className="group text-left rounded-xl overflow-hidden transition-colors animate-fadeInUp"
                          style={{ animationDelay: `${i * 65}ms`, animationFillMode: 'both' }}>
                          <div className="relative w-full overflow-hidden rounded-xl mb-2.5" style={{ aspectRatio: '16/9' }}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${projectCardColors[i % projectCardColors.length]} flex items-center justify-center`}>
                              <span className="text-4xl relative z-10">{project.emoji}</span>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
                            </div>
                          </div>
                          <div className="px-0.5">
                            <p className="text-gray-900 font-semibold text-[14px] leading-tight">{project.title}</p>
                            <p className="text-gray-500 text-[12px] mt-0.5 line-clamp-2 leading-relaxed">{project.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* CUSTOM tab */}
                  {activeLauncherTab === 'custom' && (
                    <div className="grid grid-cols-3 gap-5">
                      {[
                        { icon: '✏️', title: 'Fill Manually',   desc: 'Step-by-step guided project builder with full control.', path: '/create-project', badge: 'Most Control' },
                        { icon: '📞', title: 'Schedule a Call', desc: "Talk to our team — we'll scope the project for you.", path: '/business-dashboard/submit-project/schedule', badge: 'Guided' },
                        { icon: '🤖', title: 'By Agent',        desc: 'AI chats with you and builds your full project brief.', path: '/agent', badge: 'AI-Powered' },
                      ].map((option, i) => (
                        <button key={i} onClick={() => handleProtectedRoute(option.path)}
                          className="group text-left bg-gray-50 hover:bg-gray-100 rounded-xl p-5 transition-colors animate-fadeInUp"
                          style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl border border-gray-100">{option.icon}</div>
                            <span className="text-[10px] font-semibold text-blue-600 bg-white border border-blue-100 px-2 py-0.5 rounded-full">{option.badge}</span>
                          </div>
                          <p className="text-gray-900 font-semibold text-[14px] mb-1 group-hover:text-blue-700 transition-colors">{option.title}</p>
                          <p className="text-gray-500 text-[12px] leading-relaxed">{option.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sign-in nudge */}
                  <p className="mt-6 flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                    Free to start — access all 200+ projects instantly ·{' '}
                    <button onClick={() => router.push('/register')} className="text-blue-600 font-semibold hover:underline">Create account →</button>
                  </p>

                </div>
              </div>

              {/* Mobile fallback */}
              <div className="md:hidden flex-1 overflow-y-auto">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-gray-900 font-bold text-base mb-3">Popular projects</h2>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
                    <input type="text" value={launcherSearch} onChange={(e) => setLauncherSearch(e.target.value)}
                      placeholder="Search..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none" />
                  </div>
                  <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none">
                    {launcherTabs.map(tab => (
                      <button key={tab.id} onClick={() => { setActiveLauncherTab(tab.id); setSelectedLauncherOption(null); }}
                        className={`flex-shrink-0 px-3.5 py-2.5 text-xs font-semibold border-b-2 -mb-[1px] transition-colors ${activeLauncherTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {featuredLauncherProjects.slice(0, 4).map((project, i) => (
                    <button key={i} onClick={() => openProject(project.path)} className="group text-left rounded-xl overflow-hidden">
                      <div className="relative w-full rounded-xl overflow-hidden mb-2" style={{ aspectRatio: '16/9' }}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${project.thumb}`} />
                        {project.img && <img src={project.img} alt={project.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />}
                      </div>
                      <p className="text-gray-900 font-semibold text-[13px]">{project.title}</p>
                      <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-2">{project.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>

                  </div>{/* end Slide 1 inner flex */}
                </div>{/* end Slide 1 */}

                {/* ── SLIDE 2: GTM URL Analyzer — temporarily hidden (change false→true to restore) ── */}
                {false && (
                <div className={`absolute inset-0 flex transition-all duration-700 ease-in-out ${showcaseSlide === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>

                  {/* Left: description + URL input */}
                  <div className="w-[38%] flex-shrink-0 flex flex-col justify-center px-8 py-8 border-r border-gray-100 bg-white">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full mb-5 w-fit">
                      <Sparkles className="w-3 h-3 text-orange-500" />
                      <span className="text-orange-700 text-[11px] font-bold uppercase tracking-wide">AI GTM Intelligence</span>
                    </div>
                    <h3 className="text-gray-900 font-black text-[20px] leading-tight mb-3">
                      Analyze your platform.<br />Get a 30/60/90 day<br />GTM roadmap.
                    </h3>
                    <p className="text-gray-500 text-[13px] leading-relaxed mb-6">
                      Paste your website URL. Our AI scans your positioning, finds content gaps, benchmarks competitors, and delivers a personalized action plan with clear 30, 60, and 90 day milestones.
                    </p>
                    <div className="relative mb-3">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
                      <input
                        type="text"
                        value={showcaseUrl}
                        onChange={(e) => setShowcaseUrl(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                      />
                    </div>
                    <button onClick={() => {
                      const msg = showcaseUrl.trim() ? `Analyze my platform: ${showcaseUrl.trim()}` : 'Analyze my platform';
                      sessionStorage.setItem('pendingAgentMessage', msg);
                      handleProtectedRoute('/agent');
                    }}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold text-[13px] transition-colors flex items-center justify-center gap-2">
                      Analyze My Platform Free
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>

                  {/* Right: light panel + ping-pong scan */}
                  <div className="flex-1 bg-[#F4F4F6] flex flex-col p-4 gap-3 overflow-hidden">

                    {/* Scanning browser window */}
                    <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.08)' }}>
                      {/* Browser chrome */}
                      <div className="h-8 bg-gray-200 flex items-center px-3 gap-2">
                        <div className="flex gap-1 flex-shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                        </div>
                        <div className="flex-1 mx-2 bg-white border border-gray-200 rounded px-2 py-0.5 text-[10px] text-gray-500 truncate text-center flex items-center justify-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
                          {showcaseUrl.replace(/^https?:\/\//, '') || 'yourwebsite.com'}
                        </div>
                      </div>
                      {/* Page being scanned */}
                      <div className="relative overflow-hidden bg-white" style={{ height: '155px' }}>
                        <div className="p-3 space-y-2">
                          <div className="flex gap-2 items-center">
                            <div className="w-5 h-5 rounded bg-blue-100 flex-shrink-0" />
                            <div className="h-2.5 bg-gray-100 rounded w-28" />
                            <div className="flex gap-1.5 ml-auto">
                              {[1,2,3,4].map(j => <div key={j} className="h-2 bg-gray-100 rounded w-10" />)}
                            </div>
                          </div>
                          <div className="h-5 bg-gray-200 rounded w-2/3" />
                          <div className="h-3 bg-gray-100 rounded w-5/6" />
                          <div className="h-3 bg-gray-50 rounded w-3/4" />
                          <div className="grid grid-cols-4 gap-1.5 mt-1">
                            <div className="h-9 bg-blue-50 rounded col-span-2" />
                            <div className="h-9 bg-orange-50 rounded" />
                            <div className="h-9 bg-green-50 rounded" />
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            <div className="h-12 bg-gray-50 border border-gray-100 rounded" />
                            <div className="h-12 bg-gray-50 border border-gray-100 rounded" />
                            <div className="h-12 bg-gray-50 border border-gray-100 rounded" />
                          </div>
                        </div>
                        {/* Ping-pong scan line */}
                        <div className="absolute left-0 right-0 h-[2px] pointer-events-none z-10"
                          style={{
                            background: 'linear-gradient(to right, transparent 0%, rgba(59,130,246,0.9) 15%, rgba(139,92,246,1) 50%, rgba(59,130,246,0.9) 85%, transparent 100%)',
                            boxShadow: '0 0 10px 3px rgba(99,102,241,0.7)',
                            animation: 'scanPingPong 1.6s cubic-bezier(0.45, 0, 0.55, 1) infinite',
                          }} />
                        {/* Trailing glow follows scan line */}
                        <div className="absolute left-0 right-0 h-20 pointer-events-none z-10"
                          style={{
                            background: 'linear-gradient(to bottom, rgba(99,102,241,0.1), transparent)',
                            animation: 'scanGlowPingPong 1.6s cubic-bezier(0.45, 0, 0.55, 1) infinite',
                          }} />
                      </div>
                    </div>

                    {/* Analysis output panel */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3.5 flex-1 font-mono overflow-hidden">
                      <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-gray-100">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                          <div className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
                          <div className="w-2 h-2 rounded-full bg-[#28C840]" />
                        </div>
                        <span className="text-[10px] text-gray-400">karya-ai — analysis</span>
                      </div>
                      <div className="space-y-1.5 mb-3">
                        {[
                          { text: '→ Crawling ' + (showcaseUrl.replace(/^https?:\/\//, '') || 'yourwebsite.com') + '…', color: 'text-gray-400', delay: '0s' },
                          { text: '✓ Positioning & messaging parsed', color: 'text-green-600', delay: '0.7s' },
                          { text: '✓ Competitor landscape mapped', color: 'text-green-600', delay: '1.3s' },
                          { text: '⚡ 3 critical GTM gaps found', color: 'text-orange-600', delay: '1.9s' },
                          { text: '◆ Building your 30/60/90 roadmap…', color: 'text-blue-600', delay: '2.5s' },
                        ].map((line, i) => (
                          <p key={i} className={`text-[11px] leading-relaxed ${line.color} animate-fadeInUp`}
                            style={{ animationDelay: line.delay, animationFillMode: 'both', opacity: 0 }}>
                            {line.text}
                          </p>
                        ))}
                      </div>

                      {/* Score chips */}
                      <div className="grid grid-cols-3 gap-1.5 animate-fadeInUp"
                        style={{ animationDelay: '3s', animationFillMode: 'both', opacity: 0 }}>
                        {[
                          { label: 'GTM Score',   value: 'B+',     vColor: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200' },
                          { label: 'Content Gap', value: 'HIGH',   vColor: 'text-orange-600',  bg: 'bg-orange-50',  border: 'border-orange-200' },
                          { label: 'SEO Health',  value: '68/100', vColor: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                        ].map(m => (
                          <div key={m.label} className={`${m.bg} border ${m.border} rounded-lg p-2 text-center`}>
                            <p className={`font-black text-[13px] ${m.vColor}`}>{m.value}</p>
                            <p className="text-gray-500 text-[9px] mt-0.5">{m.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* 30/60/90 roadmap rows */}
                      <div className="mt-2.5 space-y-1 animate-fadeInUp"
                        style={{ animationDelay: '3.5s', animationFillMode: 'both', opacity: 0 }}>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-1.5 font-bold">Generated Roadmap</p>
                        {[
                          { days: '30d', goal: 'Fix positioning & ICP definition',  color: 'text-blue-600',    num: '01' },
                          { days: '60d', goal: 'Launch content engine + outreach',  color: 'text-orange-600',  num: '02' },
                          { days: '90d', goal: 'Scale paid acquisition + referrals',color: 'text-emerald-600', num: '03' },
                        ].map((p, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className={`text-[10px] font-black font-mono ${p.color} w-5 flex-shrink-0`}>{p.num}</span>
                            <span className={`text-[10px] font-bold ${p.color} flex-shrink-0`}>{p.days}</span>
                            <span className="text-[10px] text-gray-500 truncate">{p.goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
                )}{/* end Slide 2 (hidden) */}

              </div>{/* end slides area */}

              {/* ── Bottom navigation strip — hidden while only one slide is live ── */}
              {false && (
              <div className="h-11 bg-white border-t border-gray-100 flex items-center px-5 gap-4 flex-shrink-0">
                {/* Auto progress bar */}
                <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                  <div key={`showcase-${showcaseSlide}`}
                    className="h-full bg-blue-600 rounded-full animate-carouselBar"
                    style={{ animationDuration: '5s', animationPlayState: showcasePaused ? 'paused' : 'running' }} />
                </div>
                {/* Slide tab labels */}
                <div className="flex items-center gap-4">
                  {['Project Selector', 'GTM Analyzer'].map((label, i) => (
                    <button key={i} onClick={() => setShowcaseSlide(i)}
                      className={`text-[11px] font-semibold transition-colors ${showcaseSlide === i ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                {/* Controls */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button onClick={() => setShowcaseSlide(p => (p - 1 + 2) % 2)}
                    className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors">
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button onClick={() => setShowcasePaused(p => !p)}
                    className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-[9px] text-gray-400 hover:border-gray-400 transition-colors leading-none">
                    {showcasePaused ? '▶' : '⏸'}
                  </button>
                  <button onClick={() => setShowcaseSlide(p => (p + 1) % 2)}
                    className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-400 transition-colors">
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              )}{/* end bottom navigation strip (hidden) */}

                </div>{/* end showcase frame */}
          </div>{/* end max-w container */}
        </section>
      )}

      {/* ==================== TOP PROJECTS ==================== */}
      <section className="pt-8 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl overflow-hidden border border-gray-200 flex flex-col lg:flex-row min-h-[400px]">

            {/* Dark left panel */}
            <div className="lg:w-[320px] xl:w-[360px] flex-shrink-0 bg-gray-950 relative overflow-hidden flex flex-col justify-between p-8 lg:p-10">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" />
              <div className="absolute -top-20 -left-20 w-56 h-56 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full mb-6 w-fit">
                  <Package className="w-3 h-3 text-orange-400" />
                  <span className="text-white/70 text-[11px] font-semibold uppercase tracking-wide">Top Projects</span>
                </div>
                <h2 className="text-2xl lg:text-[28px] font-black text-white leading-tight mb-4">
                  What will you<br />launch today?
                </h2>
                <p className="text-white/50 text-sm leading-relaxed mb-8">
                  200+ ready-to-launch GTM packages. Pick a goal, get matched with vetted experts, and see results in days.
                </p>
                <button onClick={() => router.push('/project-marketplace')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm rounded-xl transition-colors">
                  Explore all projects
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="relative flex gap-8 mt-8 lg:mt-0">
                {[{ value: '200+', label: 'Projects' }, { value: '743+', label: 'Delivered' }].map(s => (
                  <div key={s.label}>
                    <p className="text-white font-black text-xl">{s.value}</p>
                    <p className="text-white/40 text-[11px]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: horizontally scrollable project cards with images — 2.5 visible */}
            <div className="flex-1 bg-white relative overflow-hidden">
              <div ref={topProjectsScrollRef} className="flex gap-5 overflow-x-auto px-6 lg:px-8 py-7 h-full items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {featuredLauncherProjects.map((project, i) => (
                  <button key={i}
                    onClick={() => openProject(project.path)}
                    className="flex-shrink-0 w-[260px] sm:w-[285px] group text-left">
                    <div className="relative w-full rounded-2xl overflow-hidden mb-3" style={{ aspectRatio: '3/4' }}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${project.thumb}`} />
                      {project.img && (
                        <img src={project.img} alt={project.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          loading="lazy" />
                      )}
                      {/* Dark overlay for punch line legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      {project.tag && (
                        <span className="absolute top-3 left-3 text-[10px] font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                          {project.tag}
                        </span>
                      )}
                      {/* Punch line overlaid at bottom of image */}
                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                        <p className="text-white font-bold text-[13px] leading-snug">{project.punchLine}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-0.5">
                      <p className="text-gray-900 font-bold text-[14px] leading-tight flex-1 mr-2">{project.title}</p>
                      <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-200">
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Right fade */}
              <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none" />
              {/* Functional scroll-right arrow */}
              <button
                onClick={() => topProjectsScrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md z-10 hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>

          </div>
        </div>
      </section>


      {/* ==================== EXPERT TALENT ==================== */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full mb-4 text-xs text-gray-600 font-medium shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> Top Regional Talent
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Meet Your Expert Team</h2>
            </div>
            <button onClick={() => router.push('/expert-marketplace')} className="text-blue-600 font-semibold flex items-center gap-1 group shrink-0">
              View All <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {experts.map((expert, i) => (
              <div key={i} className="group relative animate-fadeInUp" style={{animationDelay:`${i*100}ms`}}>
                <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 to-orange-500/30 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity" />
                <div className="relative bg-white border border-gray-200 rounded-2xl p-5 transition-all group-hover:border-transparent shadow-sm group-hover:shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${expert.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <span className="text-white font-black text-base">{expert.avatar}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-yellow-700 text-xs font-bold">{expert.rating}</span>
                      <span className="text-yellow-600 text-xs">({expert.reviews})</span>
                    </div>
                  </div>
                  <h3 className="font-black text-gray-900 mb-0.5">{expert.name}</h3>
                  <p className="text-blue-600 text-sm font-semibold mb-2">{expert.role}</p>
                  <p className="text-gray-500 text-xs mb-4 line-clamp-2">{expert.expertise}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">From</p>
                      <p className="font-black text-gray-900">{expert.hourlyRate}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button onClick={() => router.push('/expert-marketplace')} className="px-8 py-4 bg-white border-2 border-gray-200 hover:border-blue-300 rounded-2xl text-gray-900 font-bold text-base hover:bg-blue-50 transition-all inline-flex items-center gap-3 hover:scale-105">
              <Users className="w-5 h-5 text-blue-500" /> Browse All 180+ Experts
            </button>
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Trusted by Growing Businesses</h2>
            <p className="text-gray-500 text-lg">Real results from real teams.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { text: "Karya-AI got us from zero to 500 signups in 90 days. The AI roadmap + expert team combo is unbeatable.", name: "Riya Sharma", role: "CEO, FinStart", color: "from-blue-500 to-cyan-500" },
              { text: "We scaled from ₹30L to ₹1.2Cr/month in under 3 months. Worth every rupee.", name: "Amit Patel", role: "Founder, E-Grow", color: "from-purple-500 to-pink-500" },
              { text: "The expert matching saved us 6 weeks of hiring. Day 1 we had a senior growth marketer on our project.", name: "Neha Gupta", role: "VP Marketing, SaasCo", color: "from-emerald-500 to-teal-500" },
            ].map((t, i) => (
              <div key={i} className="group relative animate-fadeInUp" style={{animationDelay:`${i*150}ms`}}>
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${t.color} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity`} />
                <div className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-200 transition-all shadow-sm group-hover:shadow-xl h-full flex flex-col">
                  <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(s=><Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div>
                  <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className={`w-10 h-10 bg-gradient-to-br ${t.color} rounded-xl flex-shrink-0`}></div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <section id="pricing" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Transparent Pricing</h2>
            <p className="text-gray-500 text-lg">No hidden fees. Pay for results.</p>
          </div>

          {pricingLoading ? (
            <div className="grid sm:grid-cols-3 gap-5">
              {[1,2,3].map(i=>(
                <div key={i} className="bg-white border border-gray-200 rounded-3xl p-7 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded mb-3 w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded mb-6"></div>
                  {[1,2,3].map(j=><div key={j} className="h-4 bg-gray-200 rounded mb-3"></div>)}
                  <div className="h-12 bg-gray-200 rounded-2xl mt-6"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pricingData.map((tier, i) => (
                <div key={i} className={`group relative animate-fadeInUp ${tier.popular ? 'z-10' : ''}`} style={{animationDelay:`${i*150}ms`}}>
                  {tier.popular && <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-orange-500 rounded-3xl blur-sm opacity-50" />}
                  <div className={`relative bg-white rounded-3xl p-7 h-full flex flex-col ${tier.popular ? 'border-0 shadow-2xl shadow-blue-500/20' : 'border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-xl'} transition-all`}>
                    {tier.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full text-white text-xs font-black tracking-wide shadow-lg">Most Popular</div>}
                    <div className="mb-6">
                      <h3 className="text-xl font-black text-gray-900 mb-1">{tier.name}</h3>
                      <p className="text-gray-500 text-sm">{tier.description}</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-black text-gray-900">{tier.price}</span>
                      <span className="text-gray-500 text-sm">{tier.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-gray-600 text-sm">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-green-600" /></div>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => router.push('/register')} className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${tier.popular ? 'bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:shadow-xl hover:shadow-blue-500/20 hover:scale-105' : 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-105'}`}>
                      {tier.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-sm ${openFAQ === i ? 'border-blue-300 shadow-md shadow-blue-500/5' : 'border-gray-200 hover:border-blue-200'}`}>
                <button onClick={() => toggleFAQ(i)} className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-all">
                  <span className="font-bold text-gray-900 text-sm sm:text-base pr-4">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${openFAQ === i ? 'bg-blue-600 rotate-180' : 'bg-gray-100'}`}>
                    <ChevronDown className={`w-4 h-4 ${openFAQ === i ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFAQ === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BOLD CTA ==================== */}
      <section className="py-20 px-4 sm:px-6 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1d4ed820_1px,transparent_1px),linear-gradient(to_bottom,#1d4ed820_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-gray-300 text-sm font-medium">743+ companies growing with Karya-AI</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1]">
            Ready to grow<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">10x faster?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of startups who turned their GTM strategy into real customers — with AI and vetted experts working together.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <button onClick={() => router.push('/register')} className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-500 hover:to-orange-400 rounded-2xl text-white font-black text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 flex items-center justify-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {/* Book a Demo — removed for now.
            <button className="px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white font-black text-lg transition-all hover:scale-105 backdrop-blur-sm">
              Book a Demo
            </button> */}
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-center">
            {[{v:'No credit card',icon:'🆓'},{v:'Setup in 5 minutes',icon:'⚡'},{v:'100% satisfaction guarantee',icon:'✅'}].map(s=>(
              <div key={s.v} className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                <span className="text-base">{s.icon}</span>{s.v}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-gray-950 border-t border-gray-800 px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <Image src="/karya-ai-logo.png" alt="Karya AI" width={36} height={36} className="rounded-xl object-contain" />
              <span className="text-lg font-black text-white">Karya-AI</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              {footerLinks.map((link, i) => (
                <Link key={i} href={link.path} className="text-gray-500 hover:text-white transition-colors">{link.label}</Link>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-xs sm:text-sm">&copy; 2026 Karya-AI. All rights reserved.</p>
            <p className="text-gray-700 text-xs">Built with ❤️ for ambitious founders</p>
          </div>
        </div>
      </footer>

      {/* ==================== ANIMATION STYLES ==================== */}
      <style>{`
        @keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-50px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(0.9)} }
        @keyframes floatSlow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-33.333%)} }
        @keyframes equalizer {
          0%,100%{transform:scaleY(0.4)} 25%{transform:scaleY(1)} 50%{transform:scaleY(0.6)} 75%{transform:scaleY(0.9)}
        }
        @keyframes carouselBar { from { width: 0% } to { width: 100% } }
        @keyframes scanPingPong {
          0%   { top: 0px; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0px; }
        }
        @keyframes scanGlowPingPong {
          0%   { top: -80px; }
          50%  { top: calc(100% - 80px); }
          100% { top: -80px; }
        }
        @keyframes macbookCinematic {
          0%   { opacity: 0; transform: perspective(2000px) rotateX(14deg) rotateY(-6deg) scale(0.88); }
          60%  { opacity: 1; }
          100% { opacity: 1; transform: perspective(2000px) rotateX(0deg) rotateY(0deg) scale(1); }
        }

        .animate-blob { animation: blob 8s infinite; }
        .animate-carouselBar { animation: carouselBar 4s linear forwards; }
        .animate-floatSlow { animation: floatSlow 5s ease-in-out infinite; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out both; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-blink { animation: blink 1s step-end infinite; }
        .animate-marquee { animation: marquee 30s linear infinite; display:flex; }
        .animate-equalizer { animation: equalizer 1s ease-in-out infinite; transform-origin: bottom; }

        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

    </div>
  );
}

export default HomePage;