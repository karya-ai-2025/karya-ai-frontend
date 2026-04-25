'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Sparkles, TrendingUp, Target, Zap, Users, MessageSquare, Search, Star, Award,
  Play, ChevronDown, ChevronRight, Check, Briefcase, ArrowRight, X, Globe, Rocket,
  ChevronLeft, Package, UserCheck, MapPin, Menu, FileText, User, LogOut, LayoutDashboard, Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPlansWithPackages } from '@/services/planService';
import { useAuth } from '@/contexts/AuthContext';

function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);
  const [openAccordion, setOpenAccordion] = useState('ai-planning');
  const [activeTab, setActiveTab] = useState('pre-launch');
  const [openFAQ, setOpenFAQ] = useState(null);
  const [showSignInDropdown, setShowSignInDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [dynamicWordIndex, setDynamicWordIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pricingData, setPricingData] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(true);
  const signInRef = useRef(null);
  const profileRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    setShowProfileDropdown(false);
    router.push('/');
  };

  const getDashboardPath = () => {
    if (user?.activeRole === 'expert') return '/expert-dashboard';
    return '/business-dashboard';
  };

  const dynamicWords = ["Growth Ops", "Content", "Strategy", "Marketing", "Execution", "GTM", "Advertising"];

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
    const wordTimer = setInterval(() => {
      setDynamicWordIndex((prev) => (prev + 1) % dynamicWords.length);
    }, 2000);
    return () => clearInterval(wordTimer);
  }, []);

  const questions = [
    "Let's create a blog about recent trend around my product",
    "What did we work on last week",
    "Make an ad that will work with our audience",
    "research my biggest competitor's content strategy",
    "Introduce me to a designer that fits our style",
    "How should we launch our new product"
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (signInRef.current && !signInRef.current.contains(event.target)) setShowSignInDropdown(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isTyping) {
      const pauseTimer = setTimeout(() => {
        setQuestionIndex((prev) => (prev + 1) % questions.length);
        setCharIndex(0);
        setCurrentQuestion('');
        setIsTyping(true);
      }, 2000);
      return () => clearTimeout(pauseTimer);
    }
    if (charIndex < questions[questionIndex].length) {
      const typingTimer = setTimeout(() => {
        setCurrentQuestion(questions[questionIndex].substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 50);
      return () => clearTimeout(typingTimer);
    } else {
      setIsTyping(false);
    }
  }, [charIndex, questionIndex, isTyping]);

  const values = [
    { icon: <MessageSquare className="w-4 h-4" />, label: "Content creation" },
    { icon: <Target className="w-4 h-4" />, label: "Strategy" },
    { icon: <TrendingUp className="w-4 h-4" />, label: "Growth Ops" },
    { icon: <Zap className="w-4 h-4" />, label: "Execution" },
    { icon: <Search className="w-4 h-4" />, label: "Go-To Market" },
    { icon: <Award className="w-4 h-4" />, label: "Expertise" },
    { icon: <Target className="w-4 h-4" />, label: "Advertising" }
  ];

  const topProjects = [
    { id: 1, title: "Lead in a Box", description: "Get 1,000 Leads suited as per your ICP", icon: <Package className="w-7 h-7" />, color: "from-blue-500 to-cyan-500", features: ["ICP-matched leads", "Verified contacts", "CRM ready"], emoji: "🎯" },
    { id: 2, title: "GTM in a Box", description: "Get 2 experts owning your project. Delivers 1st 50 customers", icon: <Rocket className="w-7 h-7" />, color: "from-purple-500 to-pink-500", features: ["2 dedicated experts", "90-day roadmap", "First 50 customers"], emoji: "🚀" },
    { id: 3, title: "Talent in a Box", description: "Get top Go-To-Market professional who understands your needs", icon: <UserCheck className="w-7 h-7" />, color: "from-emerald-500 to-teal-500", features: ["Pre-vetted talent", "Domain expertise", "Flexible engagement"], emoji: "⭐" }
  ];

  const experts = [
    { name: "Sarah Mitchell", role: "Content Strategist", expertise: "SEO, Blog Strategy, Content Marketing", rating: 4.9, reviews: 127, hourlyRate: "$95/hr", avatar: "SM", badge: "Top Rated", color: "from-blue-600 to-orange-400" },
    { name: "Marcus Chen", role: "Growth Marketer", expertise: "Performance Marketing, Analytics, A/B Testing", rating: 5.0, reviews: 89, hourlyRate: "$120/hr", avatar: "MC", badge: "Expert", color: "from-green-500 to-teal-500" },
    { name: "Emma Rodriguez", role: "Brand Designer", expertise: "Visual Identity, UI/UX, Brand Guidelines", rating: 4.8, reviews: 156, hourlyRate: "$85/hr", avatar: "ER", badge: "Rising Star", color: "from-pink-500 to-rose-500" },
    { name: "David Park", role: "PR Specialist", expertise: "Media Relations, Crisis Management, Press Releases", rating: 4.9, reviews: 94, hourlyRate: "$110/hr", avatar: "DP", badge: "Top Rated", color: "from-orange-500 to-red-500" },
    { name: "Lisa Thompson", role: "Social Media Manager", expertise: "Community Building, Influencer Marketing", rating: 4.7, reviews: 203, hourlyRate: "$75/hr", avatar: "LT", badge: "Verified", color: "from-blue-500 to-indigo-500" },
    { name: "James Wilson", role: "Marketing Strategist", expertise: "Go-to-Market, Product Launch, Market Research", rating: 5.0, reviews: 78, hourlyRate: "$130/hr", avatar: "JW", badge: "Expert", color: "from-purple-500 to-pink-500" }
  ];

  const painPoints = [
    { problem: "Overwhelmed by GTM complexity?", solution: "AI breaks down your entire go-to-market into simple, actionable steps", icon: "🧩" },
    { problem: "Can't afford full-time CMO/CRO?", solution: "Access top marketing & sales experts on-demand, only when you need them", icon: "💼" },
    { problem: "Wasting budget on wrong channels?", solution: "Data-driven recommendations ensure you focus on what actually drives results", icon: "🎯" },
    { problem: "Need results, not just strategy?", solution: "Experts execute while you track real metrics in real-time", icon: "📈" }
  ];

  const capabilities = [
    { id: 'ai-planning', title: 'AI Project Planning Engine', description: 'Transform your ideas into executable roadmaps in minutes', deliverables: ['90-day roadmap', 'Task breakdown', 'Workflow automation', 'Resource allocation'] },
    { id: 'expert-marketplace', title: 'Expert Marketplace', description: 'Find pre-vetted specialists matched to your exact needs', deliverables: ['Smart matching algorithm', '97% satisfaction rate', 'Background verification', 'Portfolio reviews'] },
    { id: 'workspace', title: 'Unified Workspace', description: 'Everything you need in one place - no more tool juggling', deliverables: ['Knowledge base', 'Project management', 'Communication hub', 'File sharing'] },
    { id: 'integrations', title: 'Built-in Tools & Integrations', description: 'Connect your existing tools or use ours', deliverables: ['HubSpot', 'Salesforce', 'Google Analytics', 'Slack', 'Zapier', '50+ integrations'] }
  ];

  const useCases = {
    'pre-launch': { title: 'Pre-Launch', challenges: ['No existing customers', 'Unvalidated product-market fit', 'Limited budget'], experts: ['Product Marketing Strategist', 'Content Creator', 'SEO Specialist'], plan: 'Month 1: Brand foundation → Month 2: Content & SEO → Month 3: Launch campaign', outcomes: 'First 100 customers, established brand presence, content pipeline', caseStudy: 'SaaS startup went 0 to 500 signups in 90 days' },
    'growth': { title: 'Growth Stage', challenges: ['Scaling customer acquisition', 'Optimizing conversion funnels', 'Building repeatable systems'], experts: ['Growth Marketer', 'CRO Specialist', 'Marketing Automation Expert'], plan: 'Month 1: Audit & optimize → Month 2: Scale winners → Month 3: Automate systems', outcomes: '3x customer acquisition, 40% better conversion rates', caseStudy: 'E-commerce brand scaled from $50K to $200K/mo' },
    'scaling': { title: 'Scaling', challenges: ['Managing complex campaigns', 'Coordinating multiple channels', 'ROI accountability'], experts: ['CMO Consultant', 'Data Analyst', 'Performance Marketing Lead'], plan: 'Month 1: Strategic alignment → Month 2: Multi-channel execution → Month 3: Optimization', outcomes: 'Unified strategy, cross-channel attribution, 50%+ efficiency gains', caseStudy: 'Series B company reduced CAC by 60%' }
  };

  const expertCategories = [
    { name: 'Growth Marketing', icon: <TrendingUp className="w-5 h-5" />, count: '127 experts', color: 'from-blue-500 to-cyan-500' },
    { name: 'Sales Development', icon: <Users className="w-5 h-5" />, count: '89 experts', color: 'from-purple-500 to-pink-500' },
    { name: 'Content Strategy', icon: <MessageSquare className="w-5 h-5" />, count: '156 experts', color: 'from-emerald-500 to-teal-500' },
    { name: 'SEO & Performance', icon: <Search className="w-5 h-5" />, count: '94 experts', color: 'from-orange-500 to-red-500' },
    { name: 'Social Media', icon: <Globe className="w-5 h-5" />, count: '203 experts', color: 'from-pink-500 to-rose-500' },
    { name: 'Product Marketing', icon: <Rocket className="w-5 h-5" />, count: '78 experts', color: 'from-blue-600 to-indigo-600' }
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

  const toggleAccordion = (section) => setOpenAccordion(openAccordion === section ? null : section);
  const toggleFAQ = (index) => setOpenFAQ(openFAQ === index ? null : index);
  const currentStage = useCases[activeTab];

  const marqueeItems = ['AI Planning', '743+ Projects Delivered', '4.8★ Rating', '180+ Vetted Experts', '90-Day Results', 'GTM Execution', 'ICP Matching', 'Live Analytics', 'Expert Marketplace'];

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">

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

      {/* ==================== HERO — SPLIT LAYOUT ==================== */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-white">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
        {/* Blobs */}
        <div className="absolute top-10 left-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[80px] pointer-events-none animate-blob" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-[80px] pointer-events-none animate-blob animation-delay-2000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          {/* LEFT: Text */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-8 animate-fadeInUp">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-blue-700 text-sm font-semibold tracking-wide">AI-Powered GTM Platform — Live Now</span>
            </div>

            <h1 className="font-black text-gray-900 leading-[1.05] mb-6 animate-fadeInUp animation-delay-100">
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">From Idea to</span>
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500 mt-1">
                Customers
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mt-1">in 90 Days.</span>
            </h1>

            <p className="text-gray-500 text-base sm:text-lg lg:text-xl max-w-xl mb-10 leading-relaxed animate-fadeInUp animation-delay-200">
              AI plans your go-to-market. Vetted experts execute it. You track real results — not just slides.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fadeInUp animation-delay-300">
              <button onClick={() => router.push('/register')} className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-bold text-lg transition-all hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                Start Free — No Card Needed
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 border-2 border-gray-200 hover:border-blue-300 rounded-2xl text-gray-700 font-bold text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5 text-blue-500 fill-blue-500" /> Watch Demo
              </button>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 sm:gap-10 animate-fadeInUp animation-delay-400">
              {[
                { value: '743+', label: 'Projects Delivered' },
                { value: '4.8★', label: 'Avg. Client Rating' },
                { value: '180+', label: 'Vetted Experts' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-2xl sm:text-3xl font-black text-gray-900">{s.value}</p>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Desktop Browser Mockup */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end relative">
            {/* Floating sticker 1 */}
            <div className="absolute -top-4 left-0 lg:-left-6 z-20 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-2xl shadow-blue-500/10 animate-floatSlow flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">✅</div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Campaign live!</p>
                <p className="font-bold text-gray-900 text-sm">+340% ROAS</p>
              </div>
            </div>

            {/* Floating sticker 2 */}
            <div className="absolute -bottom-4 right-0 lg:-right-2 z-20 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-2xl shadow-orange-500/10 animate-floatSlow animation-delay-2000 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🎯</div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Leads matched</p>
                <p className="font-bold text-gray-900 text-sm">1,000 ICPs found</p>
              </div>
            </div>

            {/* Floating sticker 3 */}
            <div className="absolute top-1/3 -right-2 lg:-right-8 z-20 bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-2xl shadow-purple-500/10 animate-floatSlow animation-delay-4000 flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-base">⚡</div>
              <div>
                <p className="text-xs font-bold text-gray-900">AI Active</p>
                <div className="flex gap-0.5 mt-0.5">{[1,2,3,4,5].map(i=><div key={i} className="w-1 h-3 bg-blue-500 rounded-full animate-equalizer" style={{animationDelay:`${i*100}ms`}}></div>)}</div>
              </div>
            </div>

            {/* Desktop Browser Frame */}
            <div className="relative w-full max-w-[480px] sm:max-w-[520px]">
              <div className="bg-gray-950 rounded-2xl shadow-[0_40px_80px_-20px_rgba(59,130,246,0.35)] ring-1 ring-white/5 overflow-hidden">

                {/* Browser chrome */}
                <div className="bg-gray-900 px-4 py-3 flex items-center gap-3 border-b border-gray-800">
                  {/* Traffic lights */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  {/* URL bar */}
                  <div className="flex-1 bg-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-gray-600 flex-shrink-0" />
                    <span className="text-gray-400 text-xs truncate">app.karya-ai.com/dashboard</span>
                  </div>
                </div>

                {/* Browser content */}
                <div className="bg-gray-50" style={{height:'420px'}}>
                  {/* Top nav inside app */}
                  <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                        <Image src="/karya-ai-logo.png" alt="AI" width={14} height={14} className="object-contain" />
                      </div>
                      <span className="font-bold text-gray-900 text-xs">Karya AI</span>
                      <div className="flex items-center gap-1 ml-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div><span className="text-xs text-green-600 font-medium">Active</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 rounded-full"></div>
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">JD</div>
                    </div>
                  </div>

                  {/* Main content area */}
                  <div className="flex h-[calc(100%-44px)]">
                    {/* Sidebar */}
                    <div className="w-28 bg-white border-r border-gray-100 py-3 px-2 flex flex-col gap-0.5 flex-shrink-0">
                      {[['📊','Dashboard'],['🎯','Projects'],['👥','Experts'],['📈','Analytics'],['⚙️','Settings']].map(([icon, label], i) => (
                        <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer ${i===0 ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                          <span className="text-sm">{icon}</span>{label}
                        </div>
                      ))}
                    </div>

                    {/* Dashboard content */}
                    <div className="flex-1 p-3 space-y-3 overflow-hidden">
                      {/* Stat row */}
                      <div className="grid grid-cols-3 gap-2">
                        {[['1,240','Leads Found','text-blue-600'],['68%','Open Rate','text-orange-500'],['23','Replies','text-emerald-600']].map(([val, lbl, cls], i) => (
                          <div key={i} className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm text-center">
                            <p className={`font-black text-sm ${cls}`}>{val}</p>
                            <p className="text-gray-400 text-[10px] mt-0.5">{lbl}</p>
                          </div>
                        ))}
                      </div>

                      {/* AI chat */}
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 space-y-2">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide">AI Planner</p>
                        <div className="flex gap-2 items-end">
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center"><Sparkles className="w-2.5 h-2.5 text-white" /></div>
                          <div className="bg-blue-50 rounded-xl rounded-bl-none px-3 py-2 text-[11px] text-gray-700 border border-blue-100 max-w-[80%]">
                            Your ICP is ready — 1,240 verified contacts matched. Want to launch outreach?
                          </div>
                        </div>
                        <div className="flex gap-2 items-end justify-end">
                          <div className="bg-blue-600 rounded-xl rounded-br-none px-3 py-2 text-[11px] text-white max-w-[65%]">Yes, launch the sequence 🚀</div>
                          <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0"></div>
                        </div>
                      </div>

                      {/* Expert match card */}
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide mb-2">Matched Experts</p>
                        {[['SM','Sarah M.','Content Strategy','from-blue-400 to-cyan-400'],['MC','Marcus C.','Growth Marketing','from-purple-400 to-pink-400']].map(([initials, name, role, grad], i) => (
                          <div key={i} className="flex items-center gap-2 py-1">
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>{initials}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-gray-900 truncate">{name}</p>
                              <p className="text-[10px] text-gray-400 truncate">{role}</p>
                            </div>
                            <span className="text-yellow-500 text-[10px] font-bold">★5.0</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DARK MARQUEE TICKER ==================== */}
      <div className="bg-gray-950 border-y border-gray-800 py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(3)].map((_, dupIdx) => (
            <div key={dupIdx} className="flex items-center gap-0 flex-shrink-0">
              {marqueeItems.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-3 mx-8 text-gray-400 font-medium text-sm">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-5">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 text-sm font-semibold">Simple 4-step process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4">How Karya-AI Works</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">From your first prompt to paying customers — in 90 days.</p>
          </div>

          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Connecting line */}
            <div className="hidden lg:block absolute h-0.5 bg-gradient-to-r from-blue-200 via-purple-400 via-orange-300 to-emerald-400 rounded-full" style={{top:'2rem', left:'12.5%', right:'12.5%'}} />

            {[
              { step: '01', title: 'Tell AI Your Goal', desc: 'Describe your business and growth objective. AI builds a 90-day GTM plan in minutes.', icon: '🤖', color: 'from-blue-500 to-cyan-500' },
              { step: '02', title: 'AI Maps Your Plan', desc: 'AI breaks your goal into execution areas — outreach, content, campaigns, or sales.', icon: '🗺️', color: 'from-orange-500 to-amber-500', showProjects: true },
              { step: '03', title: 'Find Your Expert', desc: 'We match you with pre-vetted specialists who have done exactly this before.', icon: '🎯', color: 'from-purple-500 to-pink-500' },
              { step: '04', title: 'Track Real Results', desc: 'Experts execute while you watch leads, revenue, and growth move in real time.', icon: '📈', color: 'from-emerald-500 to-teal-500' },
            ].map((step, i) => (
              <div key={i} className="relative group animate-fadeInUp" style={{animationDelay:`${i*150}ms`}}>
                <div className="relative bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 text-center h-full flex flex-col">
                  <div className="relative inline-flex mb-4 mx-auto">
                    <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform`}>{step.icon}</div>
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center text-white text-[10px] font-black">{step.step.slice(-1)}</div>
                  </div>
                  <h3 className="text-sm font-black text-gray-900 mb-1.5">{step.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed flex-1">{step.desc}</p>
                  {step.showProjects && (
                    <Link href="/project-marketplace" className="mt-3 inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 border border-orange-200 bg-orange-50 hover:bg-orange-100 rounded-full px-2.5 py-0.5 transition-all">
                      Browse our projects <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Explainer Video */}
          <div className="mt-10">
            <div className="text-center mb-5">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">See it in action</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">Watch how it all comes together</h3>
            </div>
            <div className="relative rounded-3xl overflow-hidden bg-gray-900 shadow-2xl shadow-blue-500/10 border border-gray-200 aspect-video max-w-4xl mx-auto group cursor-pointer">
              {/* Thumbnail bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-gray-900 to-orange-900/50" />
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem]" />
              {/* Decorative blobs */}
              <div className="absolute top-4 left-8 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-4 right-8 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
              {/* Center play button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 fill-blue-600 ml-1" />
                  </div>
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" style={{animationDuration:'2s'}} />
                </div>
                <p className="text-white/80 text-sm font-medium">Watch the 2-min explainer</p>
              </div>
              {/* Bottom label */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-semibold">Karya-AI Demo</span>
                </div>
                <span className="text-white/50 text-xs">2:04</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ==================== BENTO GRID — PLATFORM FEATURES ==================== */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4">Everything in One Platform</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">No more juggling tools. Karya-AI handles strategy, hiring, and execution — together.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Large card */}
            <div className="sm:col-span-2 group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white min-h-[220px] hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/20 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5"><Zap className="w-6 h-6 text-white" /></div>
                <h3 className="text-xl font-black mb-2">AI Project Planning Engine</h3>
                <p className="text-blue-100 text-sm mb-4 max-w-sm">Transform your idea into a full 90-day roadmap with task breakdowns, expert recommendations, and timeline — in minutes.</p>
                <div className="flex flex-wrap gap-2">
                  {['90-day roadmap','Task breakdown','Resource allocation','Workflow automation'].map(f=>(
                    <span key={f} className="px-3 py-1 bg-white/15 rounded-full text-xs font-medium">{f}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tall card */}
            <div className="group bg-white border border-gray-200 rounded-3xl p-7 hover:border-purple-300 hover:shadow-xl transition-all duration-300 flex flex-col">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-5"><Users className="w-6 h-6 text-purple-600" /></div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Smart Expert Matching</h3>
              <p className="text-gray-500 text-sm mb-5 flex-1">Our AI reads your project requirements and surfaces the best-fit expert from 180+ vetted professionals.</p>
              <div className="space-y-2">
                {['97% satisfaction rate','Background verified','Portfolio reviewed'].map((f,i)=>(
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-500 flex-shrink-0" />{f}</div>
                ))}
              </div>
            </div>

            {/* Small card */}
            <div className="group bg-white border border-gray-200 rounded-3xl p-7 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-5"><TrendingUp className="w-6 h-6 text-emerald-600" /></div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Live Analytics Dashboard</h3>
              <p className="text-gray-500 text-sm">Track leads, revenue, and campaign performance in real-time. No more waiting for reports.</p>
            </div>

            {/* Small card */}
            <div className="group bg-white border border-gray-200 rounded-3xl p-7 hover:border-orange-300 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-5"><Globe className="w-6 h-6 text-orange-600" /></div>
              <h3 className="text-lg font-black text-gray-900 mb-2">50+ Integrations</h3>
              <p className="text-gray-500 text-sm mb-4">HubSpot, Salesforce, Slack, Google Analytics, Zapier and more — connect your existing stack.</p>
              <div className="flex gap-2 flex-wrap">
                {['HubSpot','Slack','GA4','Zapier'].map(t=>(
                  <span key={t} className="px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700 font-medium">{t}</span>
                ))}
              </div>
            </div>

            {/* Dark card */}
            <div className="group bg-gray-950 rounded-3xl p-7 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent" />
              <div className="relative">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-5"><Briefcase className="w-6 h-6 text-blue-400" /></div>
                <h3 className="text-lg font-black text-white mb-2">Unified Workspace</h3>
                <p className="text-gray-400 text-sm mb-4">Chat, files, project management, knowledge base — all in one place. Zero tool switching.</p>
                <div className="flex items-center gap-2 text-blue-400 text-sm font-medium group-hover:gap-3 transition-all cursor-pointer">
                  Explore workspace <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== AI CHATBOT DEMO ==================== */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Ask Karya-AI Anything</h2>
            <p className="text-gray-500 text-lg">From content strategy to finding your next hire — just ask.</p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />
            <div className="relative bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 animate-floatSlow">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Image src="/karya-ai-logo.png" alt="Karya AI" width={32} height={32} className="object-contain" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blue-500 font-semibold mb-2">Ask me anything...</p>
                  <div className="text-lg sm:text-2xl text-gray-900 min-h-[36px] sm:min-h-[48px] flex items-center">
                    <span className="break-words">{currentQuestion}</span>
                    <span className="inline-block w-0.5 h-6 sm:h-8 bg-blue-500 ml-1 animate-blink flex-shrink-0 rounded-full"></span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wider">Quick prompts</p>
                <div className="flex flex-wrap gap-2">
                  {['📝 Content Strategy', '🔍 Find Expert', '🚀 Launch Plan', '📊 Growth Ops', '💡 GTM Roadmap'].map((btn, i) => (
                    <button key={i} onClick={btn.includes('Find') ? () => router.push('/expert-marketplace') : undefined} className="px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl text-sm text-gray-700 hover:text-blue-700 transition-all hover:scale-105">
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TOP PROJECTS ==================== */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full mb-4 text-xs text-gray-600 font-medium shadow-sm">
                <Package className="w-3.5 h-3.5 text-blue-500" /> Ready-to-launch packages
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Top Projects</h2>
            </div>
            <button onClick={() => router.push('/project-marketplace')} className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 group text-sm sm:text-base shrink-0">
              View All <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Value pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {values.map((v, i) => (
              <div key={i} className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all hover:scale-105 shadow-sm">
                <span className="text-blue-500">{v.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{v.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProjects.map((project, i) => (
              <div key={project.id} className="group relative animate-fadeInUp" style={{animationDelay:`${i*150}ms`}}>
                {/* Gradient border effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${project.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm`} />
                <div className="relative bg-white rounded-3xl p-7 border border-gray-200 h-full flex flex-col group-hover:border-transparent transition-all duration-300 shadow-sm group-hover:shadow-2xl">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-14 h-14 bg-gradient-to-br ${project.color} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
                      {project.icon}
                    </div>
                    <span className="text-3xl">{project.emoji}</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-500 text-sm mb-5 flex-1">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.features.map((f, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-full font-medium">{f}</span>
                    ))}
                  </div>
                  <button onClick={() => { if (project.id === 1) router.push('/leads'); }} className={`w-full py-3.5 bg-gradient-to-r ${project.color} text-white font-bold rounded-2xl transition-all hover:shadow-lg hover:opacity-90 flex items-center justify-center gap-2 text-sm`}>
                    <Rocket className="w-4 h-4" /> Launch {project.title.split(' ')[0]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== LAPTOP MOCKUP SECTION ==================== */}
      <section className="py-20 px-4 sm:px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Feature list */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-full mb-6">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-purple-700 text-sm font-semibold">Platform Preview</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-[1.1]">
                Your entire GTM,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">in one dashboard.</span>
              </h2>
              <p className="text-gray-500 text-lg mb-10 leading-relaxed">Stop switching between 12 tools. Karya-AI gives you everything — planning, talent, execution, and reporting — in a single place.</p>

              <div className="space-y-5">
                {[
                  { icon: <Zap className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600', title: 'AI-generated roadmaps', desc: 'Full 90-day plan created in under 5 minutes.' },
                  { icon: <Users className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600', title: 'Expert collaboration', desc: 'Chat, share files, and track work with your expert team.' },
                  { icon: <TrendingUp className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600', title: 'Real-time metrics', desc: 'Leads, conversions, ROAS — updated live, not in reports.' },
                  { icon: <Target className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600', title: 'Milestone payments', desc: 'Pay only when you approve results. Funds held in escrow.' },
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-4 group cursor-default">
                    <div className={`w-10 h-10 ${feat.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>{feat.icon}</div>
                    <div>
                      <p className="font-bold text-gray-900 mb-0.5">{feat.title}</p>
                      <p className="text-gray-500 text-sm">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => router.push('/register')} className="mt-10 group px-8 py-4 bg-gray-900 hover:bg-gray-800 rounded-2xl text-white font-bold text-base transition-all hover:shadow-2xl hover:shadow-gray-900/20 flex items-center gap-2">
                See it in action
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right: Laptop mockup */}
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full blur-3xl opacity-40" />
              <div className="relative w-full max-w-lg">
                {/* Laptop lid */}
                <div className="bg-gray-800 rounded-t-2xl px-3 pt-3 pb-0 shadow-2xl">
                  {/* Browser chrome */}
                  <div className="bg-gray-700 rounded-xl mb-2 px-3 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div></div>
                    <div className="flex-1 bg-gray-600 rounded-md px-3 py-1 text-xs text-gray-300 text-center">app.karya-ai.com/dashboard</div>
                  </div>
                  {/* Screen */}
                  <div className="bg-white rounded-t-xl overflow-hidden" style={{minHeight:'280px'}}>
                    {/* Dashboard mock UI */}
                    <div className="flex h-full">
                      {/* Sidebar */}
                      <div className="w-14 bg-gray-900 flex flex-col items-center py-4 gap-4 flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Image src="/karya-ai-logo.png" alt="" width={20} height={20} className="object-contain" /></div>
                        {[LayoutDashboard, Users, Briefcase, TrendingUp, Settings].map((Icon, i) => (
                          <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i===0?'bg-blue-500/20':'hover:bg-gray-700'} transition-colors cursor-pointer`}>
                            <Icon className={`w-4 h-4 ${i===0?'text-blue-400':'text-gray-500'}`} />
                          </div>
                        ))}
                      </div>
                      {/* Main */}
                      <div className="flex-1 p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <p className="font-bold text-gray-900 text-sm">Dashboard</p>
                          <div className="px-3 py-1 bg-blue-600 rounded-lg text-white text-xs font-medium">90-day plan active</div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          {[{l:'Leads',v:'1,247',c:'text-blue-600'},{l:'Revenue',v:'$42K',c:'text-emerald-600'},{l:'ROAS',v:'3.4x',c:'text-orange-600'}].map(s=>(
                            <div key={s.l} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                              <p className="text-xs text-gray-500 mb-1">{s.l}</p>
                              <p className={`text-lg font-black ${s.c}`}>{s.v}</p>
                            </div>
                          ))}
                        </div>
                        {/* Mini chart */}
                        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                          <p className="text-xs text-gray-500 mb-2 font-medium">Growth this month</p>
                          <div className="flex items-end gap-1 h-14">
                            {[40,60,45,75,55,80,70,90,65,95,80,100].map((h,i)=>(
                              <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{height:`${h}%`}}></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Laptop bottom */}
                <div className="bg-gray-700 h-3 rounded-b-2xl mx-2 shadow-xl"></div>
                <div className="bg-gray-600 h-2 rounded-b-xl mx-6 shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== EXPERT TALENT ==================== */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
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

      {/* ==================== PAIN POINTS ==================== */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Sound Familiar?</h2>
            <p className="text-gray-500 text-lg">These are the problems Karya-AI was built to solve.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {painPoints.map((pt, i) => (
              <div key={i} className="group relative animate-fadeInUp" style={{animationDelay:`${i*100}ms`}}>
                <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                <div className="relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-200 transition-all h-full shadow-sm group-hover:shadow-xl">
                  <span className="text-4xl mb-4 block">{pt.icon}</span>
                  <h3 className="text-base font-black text-gray-900 mb-3">{pt.problem}</h3>
                  <div className="h-1 w-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full mb-4"></div>
                  <p className="text-gray-500 text-sm leading-relaxed">{pt.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PLATFORM CAPABILITIES ==================== */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-3">Platform Capabilities</h2>
          <p className="text-gray-500 text-lg text-center mb-12">Everything you need to execute your go-to-market strategy</p>
          <div className="space-y-3">
            {capabilities.map((cap, i) => (
              <div key={cap.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-200 transition-all shadow-sm animate-fadeInUp" style={{animationDelay:`${i*100}ms`}}>
                <button onClick={() => toggleAccordion(cap.id)} className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                      {cap.id === 'ai-planning' && <Zap className="w-6 h-6 text-white" />}
                      {cap.id === 'expert-marketplace' && <Users className="w-6 h-6 text-white" />}
                      {cap.id === 'workspace' && <Briefcase className="w-6 h-6 text-white" />}
                      {cap.id === 'integrations' && <Globe className="w-6 h-6 text-white" />}
                    </div>
                    <div className="text-left">
                      <h3 className="text-base sm:text-lg font-black text-gray-900">{cap.title}</h3>
                      <p className="text-gray-500 text-xs sm:text-sm">{cap.description}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-blue-500 transition-transform duration-300 flex-shrink-0 ${openAccordion === cap.id ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openAccordion === cap.id ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                      {cap.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-gray-600 text-sm">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0"><Check className="w-3 h-3 text-green-600" /></div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== USE CASES ==================== */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-10">Solutions for Every Stage</h2>
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            {Object.entries(useCases).map(([key, stage]) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}`}>
                {stage.title}
              </button>
            ))}
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2"><span className="text-red-500">✗</span> Typical Challenges</h3>
                <ul className="space-y-2">
                  {currentStage.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-2.5"><X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2"><span className="text-blue-500">→</span> Recommended Experts</h3>
                <div className="flex flex-wrap gap-2 mb-5">
                  {currentStage.experts.map((e, i) => (
                    <span key={i} className="px-3 py-2 bg-blue-100 border border-blue-200 rounded-xl text-blue-800 text-xs font-bold">{e}</span>
                  ))}
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">90-Day Plan</p>
                  <p className="text-gray-700 text-sm">{currentStage.plan}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Expected Outcomes</p>
                  <p className="text-emerald-800 text-sm font-semibold">{currentStage.outcomes}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 group text-sm">
                <Star className="w-4 h-4" /> Read Case Study: {currentStage.caseStudy} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== EXPERT CATEGORIES ==================== */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-12">Expert Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {expertCategories.map((cat, i) => (
              <div key={i} className="group relative cursor-pointer animate-fadeInUp" style={{animationDelay:`${i*100}ms`}}>
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${cat.color} rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity`} />
                <div className="relative bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 group-hover:border-transparent transition-all shadow-sm group-hover:shadow-xl">
                  <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    {cat.icon}
                  </div>
                  <h3 className="font-black text-gray-900 mb-1 text-sm sm:text-base">{cat.name}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm mb-3">{cat.count}</p>
                  <div className="flex items-center gap-1 text-blue-600 text-xs sm:text-sm font-bold group-hover:gap-2 transition-all">
                    Explore <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="py-20 px-4 sm:px-6 bg-white">
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
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-gray-50">
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
      <section className="py-20 px-4 sm:px-6 bg-white">
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
            <button onClick={() => router.push('/onboarding-owner/welcome')} className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-500 hover:to-orange-400 rounded-2xl text-white font-black text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 flex items-center justify-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white font-black text-lg transition-all hover:scale-105 backdrop-blur-sm">
              Book a Demo
            </button>
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

        .animate-blob { animation: blob 8s infinite; }
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
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

    </div>
  );
}

export default HomePage;