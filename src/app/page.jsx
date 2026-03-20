'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, TrendingUp, Target, Zap, Users, MessageSquare, Search, Star, Award,
  Play, ChevronDown, ChevronRight, Check, Briefcase, ArrowRight, X, Globe, Rocket,
  ChevronLeft, Package, UserCheck, MapPin, Menu, FileText, User, LogOut, LayoutDashboard, Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPlansWithPackages } from '@/services/planService';
<<<<<<< Updated upstream
import { useAuth } from '@/contexts/AuthContext';
=======
>>>>>>> Stashed changes

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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

  // Dynamic words for Slide 2
  const dynamicWords = [
    "Growth Ops",
    "Content",
    "Strategy",
    "Marketing",
    "Execution",
    "GTM",
    "Advertising"
  ];

  // Rotate dynamic word every 2 seconds
  // Fetch pricing data from API
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setPricingLoading(true);
        const response = await getPlansWithPackages();
        if (response.success && response.data) {
          // Transform API data to match the UI structure
          const transformedPricing = [];

          response.data.forEach(plan => {
            if (plan.packages && plan.packages.length > 0) {
              plan.packages.forEach((pkg, index) => {
                let tierName = pkg.name;
                let description = `For ${plan.displayName.toLowerCase()}`;
                let popular = index === 1; // Make second package popular
                let cta = 'Get Started';

                if (pkg.name.toLowerCase().includes('enterprise') || plan.type === 'enterprise') {
                  cta = 'Contact Sales';
                }

                transformedPricing.push({
                  name: tierName,
                  price: `$${pkg.price}`,
                  period: '/month',
                  description: description,
                  features: [
                    `${pkg.credits.toLocaleString()} Credits/month`,
                    `${pkg.projectsAvailable} Project${pkg.projectsAvailable > 1 ? 's' : ''}`,
                    'AI-powered lead generation',
                    'Data enrichment & validation',
                    pkg.support || 'Email support',
                    'Advanced analytics'
                  ],
                  cta: cta,
                  popular: popular,
                  planId: plan._id,
                  packageId: pkg._id
                });
              });
            }
          });

          setPricingData(transformedPricing);
        }
      } catch (error) {
        console.error('Error fetching pricing data:', error);
        // Fallback to hardcoded data if API fails
        setPricingData([
          { name: 'Starter', price: '$29', period: '/month', description: 'Perfect for startups', features: ['1,000 Credits/month', '1 Project', 'AI planning', 'Basic analytics'], cta: 'Get Started', popular: false },
          { name: 'Growth', price: '$79', period: '/month', description: 'For growing businesses', features: ['3,000 Credits/month', '3 Projects', 'Advanced AI planning', 'Priority support'], cta: 'Get Started', popular: true },
          { name: 'Scale', price: '$149', period: '/month', description: 'Enterprise solutions', features: ['7,000 Credits/month', '5 Projects', 'Custom solutions', 'Dedicated support'], cta: 'Contact Sales', popular: false }
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
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (signInRef.current && !signInRef.current.contains(event.target)) {
        setShowSignInDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Continuous carousel - smoother rotation
  useEffect(() => {
    const heroTimer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % 2);
    }, 4000); // Consistent 4 second interval
    return () => clearInterval(heroTimer);
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
    { icon: <MessageSquare className="w-5 h-5" />, label: "Content creation" },
    { icon: <Target className="w-5 h-5" />, label: "Strategy" },
    { icon: <TrendingUp className="w-5 h-5" />, label: "Growth Ops" },
    { icon: <Zap className="w-5 h-5" />, label: "Execution" },
    { icon: <Search className="w-5 h-5" />, label: "Go-To Market" },
    { icon: <Award className="w-5 h-5" />, label: "Expertise" },
    { icon: <Target className="w-5 h-5" />, label: "Advertising" }
  ];

  const topProjects = [
    {
      id: 1,
      title: "Lead in a Box",
      description: "Get 1,000 Leads suited as per your ICP",
      icon: <Package className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      features: ["ICP-matched leads", "Verified contacts", "CRM ready"]
    },
    {
      id: 2,
      title: "GTM in a Box",
      description: "Get 2 experts owning your project. Delivers 1st 50 customers",
      icon: <Rocket className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      features: ["2 dedicated experts", "90-day roadmap", "First 50 customers"]
    },
    {
      id: 3,
      title: "Talent in a Box",
      description: "Get top Go-To-Market (GTM) professional who understand your needs",
      icon: <UserCheck className="w-8 h-8" />,
      color: "from-emerald-500 to-teal-500",
      features: ["Pre-vetted talent", "Domain expertise", "Flexible engagement"]
    }
  ];

  const experts = [
    { name: "Sarah Mitchell", role: "Content Strategist", expertise: "SEO, Blog Strategy, Content Marketing", rating: 4.9, reviews: 127, hourlyRate: "$95/hr", avatar: "SM", badge: "Top Rated", color: "from-blue-500 to-purple-500" },
    { name: "Marcus Chen", role: "Growth Marketer", expertise: "Performance Marketing, Analytics, A/B Testing", rating: 5.0, reviews: 89, hourlyRate: "$120/hr", avatar: "MC", badge: "Expert", color: "from-green-500 to-teal-500" },
    { name: "Emma Rodriguez", role: "Brand Designer", expertise: "Visual Identity, UI/UX, Brand Guidelines", rating: 4.8, reviews: 156, hourlyRate: "$85/hr", avatar: "ER", badge: "Rising Star", color: "from-pink-500 to-rose-500" },
    { name: "David Park", role: "PR Specialist", expertise: "Media Relations, Crisis Management, Press Releases", rating: 4.9, reviews: 94, hourlyRate: "$110/hr", avatar: "DP", badge: "Top Rated", color: "from-orange-500 to-red-500" },
    { name: "Lisa Thompson", role: "Social Media Manager", expertise: "Community Building, Influencer Marketing", rating: 4.7, reviews: 203, hourlyRate: "$75/hr", avatar: "LT", badge: "Verified", color: "from-indigo-500 to-blue-500" },
    { name: "James Wilson", role: "Marketing Strategist", expertise: "Go-to-Market, Product Launch, Market Research", rating: 5.0, reviews: 78, hourlyRate: "$130/hr", avatar: "JW", badge: "Expert", color: "from-purple-500 to-pink-500" }
  ];

  const painPoints = [
    { problem: "Overwhelmed by GTM complexity?", solution: "AI breaks down your entire go-to-market into simple, actionable steps" },
    { problem: "Can't afford full-time CMO/CRO?", solution: "Access top marketing & sales experts on-demand, only when you need them" },
    { problem: "Wasting budget on wrong channels?", solution: "Data-driven recommendations ensure you focus on what actually drives results" },
    { problem: "Need results, not just strategy?", solution: "Experts execute while you track real metrics in real-time" }
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
    { name: 'Growth Marketing', icon: <TrendingUp className="w-6 h-6" />, count: '127 experts' },
    { name: 'Sales Development', icon: <Users className="w-6 h-6" />, count: '89 experts' },
    { name: 'Content Strategy', icon: <MessageSquare className="w-6 h-6" />, count: '156 experts' },
    { name: 'SEO & Performance', icon: <Search className="w-6 h-6" />, count: '94 experts' },
    { name: 'Social Media & Community', icon: <Globe className="w-6 h-6" />, count: '203 experts' },
    { name: 'Product Marketing', icon: <Rocket className="w-6 h-6" />, count: '78 experts' }
  ];


  const faqs = [
    { question: 'How does AI planning work?', answer: 'Our AI analyzes your goals, industry, and resources to create a customized 90-day roadmap.' },
    { question: 'How are experts vetted?', answer: 'Every expert goes through a rigorous 5-step vetting process. Only the top 3% of applicants are approved.' },
    { question: 'What if I\'m not satisfied with an expert?', answer: 'We offer a 100% satisfaction guarantee. We\'ll replace them for free and refund any unused hours.' },
    { question: 'Can I hire multiple experts?', answer: 'Absolutely! Most successful projects involve 2-4 specialists working together.' },
    { question: 'How do payments work?', answer: 'We use milestone-based payments. Funds are held in escrow and released only when you approve deliverables.' }
  ];

  // UPDATED: Removed Home, For Business, and Marketplace from navbar
  const navLinks = [
    { label: 'Features', path: '/features', icon: <Zap className="w-4 h-4" /> },
    { label: 'Pricing', path: '/#pricing', icon: <FileText className="w-4 h-4" /> },
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
  const goToSlide = (index) => setHeroSlide(index);
  const nextSlide = () => setHeroSlide((prev) => (prev + 1) % 2);
  const prevSlide = () => setHeroSlide((prev) => (prev - 1 + 2) % 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-violet-50"></div>
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-3xl transition-all duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
            left: mousePosition.x / 10,
            top: mousePosition.y / 10,
          }}
        ></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-300/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Content wrapper — sits above the fixed background in CSS stacking order */}
      <div className="relative">

      {/* ==================== NAVIGATION HEADER ==================== */}
      <div className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">Karya-AI</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.path}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-all hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all group"
                  >
                    <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:shadow-indigo-500/30 transition-shadow">
                      {getInitials(user?.name)}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-3 w-52 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden animate-slideDown z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => { router.push(getDashboardPath()); setShowProfileDropdown(false); }}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 flex items-center gap-3 transition-all text-sm"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-500" /> Dashboard
                      </button>
                      <button
                        onClick={() => { router.push('/preferences'); setShowProfileDropdown(false); }}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-indigo-50 flex items-center gap-3 transition-all text-sm"
                      >
                        <Settings className="w-4 h-4 text-indigo-500" /> Settings
                      </button>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-all text-sm"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="relative" ref={signInRef}>
                    <button
                      onClick={() => setShowSignInDropdown(!showSignInDropdown)}
                      className="px-4 py-2 text-gray-900 font-medium transition-all border border-gray-300 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 flex items-center gap-2 group"
                    >
                      Sign In
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showSignInDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showSignInDropdown && (
                      <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden animate-slideDown">
                        <button
                          onClick={() => { router.push('/login?role=owner'); setShowSignInDropdown(false); }}
                          className="w-full px-4 py-4 text-left text-gray-900 hover:bg-indigo-50 flex items-center gap-3 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Briefcase className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div>
                            <div className="font-medium">As Business</div>
                            <div className="text-xs text-gray-500">Hire experts & manage projects</div>
                          </div>
                        </button>
                        <button
                          onClick={() => { router.push('/login?role=expert'); setShowSignInDropdown(false); }}
                          className="w-full px-4 py-4 text-left text-gray-900 hover:bg-emerald-50 flex items-center gap-3 transition-all border-t border-gray-200 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <UserCheck className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <div className="font-medium">As Expert</div>
                            <div className="text-xs text-gray-500">Find work & grow your career</div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => router.push('/register')}
                    className="relative px-5 py-2 bg-indigo-600 rounded-xl text-white font-medium transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 group overflow-hidden"
                  >
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 py-4 border-t border-gray-200 animate-slideDown">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link, i) => (
                  <Link
                    key={i}
                    href={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-gray-600 hover:text-gray-900 font-medium transition-all hover:bg-gray-50 rounded-lg flex items-center gap-3"
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => { router.push(getDashboardPath()); setMobileMenuOpen(false); }}
                        className="flex-1 px-4 py-2 bg-indigo-600 rounded-lg text-white font-medium flex items-center justify-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </button>
                      <button
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="flex-1 px-4 py-2 text-red-600 font-medium border border-red-200 rounded-lg flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { router.push('/login'); setMobileMenuOpen(false); }}
                        className="flex-1 px-4 py-2 text-gray-900 font-medium border border-gray-300 rounded-lg"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => { router.push('/register'); setMobileMenuOpen(false); }}
                        className="flex-1 px-4 py-2 bg-indigo-600 rounded-lg text-white font-medium"
                      >
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* ==================== HERO CAROUSEL ==================== */}
      <div className="relative overflow-hidden w-full">
        <div
          className="flex w-full"
          style={{
            transform: `translateX(-${heroSlide * 100}%)`,
            transition: 'transform 800ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* SLIDE 1 */}
          <div className="min-w-full flex-shrink-0 w-full">
            <div className="relative py-8 sm:py-12 md:py-16 lg:py-20">
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full mb-4 sm:mb-6 animate-fadeInUp">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-indigo-700 text-[10px] sm:text-xs md:text-sm font-medium">Now with AI-Powered Matching</span>
                  </div>

                  {/* Main Heading - Mobile optimized */}
                  <h1 className="font-bold text-gray-900 mb-4 sm:mb-6 leading-[1.15] animate-fadeInUp animation-delay-200">
                    <span className="block text-[1.5rem] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                      From Idea to Customers
                    </span>
                    <span className="block text-[1.5rem] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-size-200 animate-gradient mt-1 sm:mt-2">
                      in 90 Days
                    </span>
                  </h1>

                  {/* Subheading */}
                  <p className="text-[13px] sm:text-base md:text-lg lg:text-xl text-gray-500 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto mb-6 sm:mb-8 animate-fadeInUp animation-delay-400 px-2">
                    AI breaks down your GTM strategy. Experts execute it. You track results.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fadeInUp animation-delay-600 px-2">
                    <button
                      onClick={() => router.push('/register')}
                      className="group relative px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-indigo-600 rounded-xl text-white font-bold text-sm sm:text-base md:text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Start Your Project Free
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                    <button className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 border border-gray-300 rounded-xl text-gray-900 font-bold text-sm sm:text-base md:text-lg hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5" /> Watch Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 2 - With Dynamic Word */}
          <div className="min-w-full flex-shrink-0 w-full">
            <div className="relative py-8 sm:py-12 md:py-16 lg:py-20">
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Badge */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full animate-fadeInUp">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 animate-spin-slow" />
                    <span className="text-indigo-700 text-[10px] sm:text-xs md:text-sm font-medium">Powered by AI + Human Expertise</span>
                  </div>
                </div>

                <div className="text-center">
                  {/* Main Heading with Dynamic Word */}
                  <h1 className="font-bold text-gray-900 mb-4 sm:mb-6 leading-[1.15] animate-fadeInUp animation-delay-200">
                    <span className="block text-[1.5rem] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                      The AI{' '}
                      <span
                        key={dynamicWordIndex}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 animate-wordSlide inline-block"
                      >
                        {dynamicWords[dynamicWordIndex]}
                      </span>
                    </span>
                    <span className="block text-[1.5rem] sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mt-1 sm:mt-2">
                      Workspace
                    </span>
                  </h1>

                  {/* Subheading */}
                  <p className="text-[13px] sm:text-base md:text-lg lg:text-xl text-gray-500 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto mb-6 sm:mb-8 animate-fadeInUp animation-delay-400 px-2">
                    Transform your marketing with AI-powered insights and connect with expert humans when you need them
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={() => router.push('/register')}
                    className="group relative px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-indigo-600 rounded-xl text-white font-bold text-sm sm:text-base md:text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 overflow-hidden animate-fadeInUp animation-delay-600"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started Free
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows - Hidden on mobile */}
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 lg:w-12 lg:h-12 bg-white border border-gray-200 shadow-sm hover:bg-gray-100 rounded-full items-center justify-center transition-all hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900" />
        </button>
        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 lg:w-12 lg:h-12 bg-white border border-gray-200 shadow-sm hover:bg-gray-100 rounded-full items-center justify-center transition-all hover:scale-110"
        >
          <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900" />
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
          {[0, 1].map((index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-500 ${
                heroSlide === index
                  ? 'w-6 sm:w-8 md:w-10 bg-indigo-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ==================== CHATBOT & VIDEO ==================== */}
      <div className="relative py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Chatbot Widget */}
          <div className="mb-10 sm:mb-12">
            <div className="max-w-3xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-indigo-500/10 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity"></div>
                <div className="relative bg-white border border-gray-200 shadow-sm rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 sm:w-14 h-10 sm:h-14 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20 animate-float">
                      <Sparkles className="w-5 sm:w-7 h-5 sm:h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs sm:text-sm text-indigo-500 mb-1 sm:mb-2 font-medium">Ask me anything...</div>
                      <div className="text-base sm:text-xl text-gray-900 min-h-[40px] sm:min-h-[60px] flex items-center">
                        <span className="break-words">{currentQuestion}</span>
                        <span className="inline-block w-0.5 h-5 sm:h-7 bg-indigo-500 ml-1 animate-blink flex-shrink-0"></span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Content Strategy', action: () => {} },
                        { label: 'Find Expert', action: () => router.push('/expert-marketplace') },
                        { label: 'Launch Plan', action: () => {} },
                        { label: 'Growth Ops', action: () => {} }
                      ].map((btn, i) => (
                        <button
                          key={i}
                          onClick={btn.action}
                          className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs text-indigo-700 transition-all hover:scale-105 whitespace-nowrap"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Demo */}
          <div className="mb-6 sm:mb-8">
            <div className="relative max-w-4xl mx-auto group">
              <div className="absolute -inset-2 sm:-inset-4 bg-indigo-500/10 rounded-2xl sm:rounded-3xl opacity-20 group-hover:opacity-30 blur-2xl transition-opacity"></div>
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-2xl border border-gray-200">
                <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop" alt="Platform Demo" className="w-full h-auto group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <div className="w-16 sm:w-24 h-16 sm:h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-white/30">
                    <Play className="w-8 sm:w-12 h-8 sm:h-12 text-white ml-1" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-semibold text-sm sm:text-lg">Watch our 90-second explainer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MARKETPLACE SECTION ==================== */}
      <div className="relative py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header - Centered */}
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 px-2">
              YOUR AI + Human Expert <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Marketplace</span>
            </h2>
            <p className="text-gray-500 text-sm sm:text-lg max-w-2xl mx-auto px-4">
              Connect with top Go-To-Market professionals who understand your needs & have done it before.
            </p>
          </div>

          {/* Section 1: Top Projects */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Top Projects</h3>
              <button className="text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-2 transition-all hover:gap-3 group text-sm sm:text-base">
                View All <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Value Pills - Moved here below Top Projects heading */}
            <div className="mb-8">
              <div className="flex flex-wrap justify-start gap-2 sm:gap-3">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="group px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 shadow-sm rounded-full hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 cursor-pointer hover:scale-105 animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-900 whitespace-nowrap">
                      <span className="text-indigo-500 group-hover:text-indigo-600 transition-all">{React.cloneElement(value.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}</span>
                      <span className="font-medium text-xs sm:text-sm">{value.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {topProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="group relative animate-fadeInUp"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="absolute -inset-1 bg-indigo-500/10 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
                  <div className="relative bg-white border border-gray-200 shadow-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:border-indigo-300 transition-all duration-300 h-full group-hover:translate-y-[-8px]">
                    <div className={`w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br ${project.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      {React.cloneElement(project.icon, { className: 'w-6 sm:w-8 h-6 sm:h-8' })}
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{project.title}</h4>
                    <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {project.features.map((feature, idx) => (
                        <span key={idx} className="px-2 py-0.5 sm:py-1 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded-full">{feature}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        if (project.id === 1) {
                          router.push('/leads');
                        }
                      }}
                      className="w-full py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg sm:rounded-xl text-white font-semibold text-sm sm:text-base transition-all hover:shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                      <Rocket className="w-4 h-4" />
                      Launch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Top Regional Talent */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-indigo-50 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-500" />
                </div>
                Top Regional Talent
              </h3>
              {/* UPDATED: Navigate to expert-marketplace */}
              <button onClick={() => router.push('/expert-marketplace')} className="text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-2 transition-all hover:gap-3 group text-sm sm:text-base">
                View All Experts <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {experts.map((expert, index) => (
                <div
                  key={index}
                  className="group relative animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute -inset-0.5 bg-indigo-500/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <div className="relative bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 group-hover:border-transparent shadow-sm">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="px-2 py-0.5 sm:py-1 bg-yellow-50 border border-yellow-200 rounded-full">
                        <span className="text-yellow-600 text-xs font-medium flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />{expert.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 fill-current" />
                        <span className="text-gray-900 font-semibold text-xs sm:text-sm">{expert.rating}</span>
                        <span className="text-gray-400 text-xs">({expert.reviews})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className={`w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br ${expert.color} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <span className="text-white font-bold text-sm sm:text-base">{expert.avatar}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">{expert.name}</h3>
                        <p className="text-indigo-500 text-xs sm:text-sm">{expert.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mb-2 sm:mb-3 line-clamp-2">{expert.expertise}</p>
                    <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-200">
                      <div>
                        <div className="text-xs text-gray-400">Starting at</div>
                        <div className="text-base sm:text-lg font-bold text-gray-900">{expert.hourlyRate}</div>
                      </div>
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-xs sm:text-sm font-medium transition-all hover:scale-105">
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* UPDATED: Navigate to expert-marketplace */}
            <div className="text-center mt-6 sm:mt-8">
              <button onClick={() => router.push('/expert-marketplace')} className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-900 font-semibold text-sm sm:text-base hover:bg-gray-100 hover:border-gray-400 transition-all inline-flex items-center gap-2 sm:gap-3 hover:scale-105">
                <Users className="w-4 sm:w-5 h-4 sm:h-5" /> View All Experts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pain Points */}
      <section className="pt-10 sm:pt-12 pb-4 sm:pb-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {painPoints.map((point, index) => (
              <div
                key={index}
                className="group relative animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-indigo-500/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                <div className="relative bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-indigo-200 transition-all h-full">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{point.problem}</h3>
                  <div className="h-1 w-10 sm:w-12 bg-indigo-500 rounded-full mb-2 sm:mb-3"></div>
                  <p className="text-gray-500 text-xs sm:text-sm">{point.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="pt-10 sm:pt-12 pb-4 sm:pb-6 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2 sm:mb-3">Platform Capabilities</h2>
          <p className="text-gray-500 text-sm sm:text-base text-center mb-6 sm:mb-8">Everything you need to execute your go-to-market strategy</p>
          <div className="space-y-2 sm:space-y-3">
            {capabilities.map((cap, index) => (
              <div
                key={cap.id}
                className="group bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl overflow-hidden hover:border-indigo-200 transition-all animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <button onClick={() => toggleAccordion(cap.id)} className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/20 flex-shrink-0">
                      {cap.id === 'ai-planning' && <Zap className="w-5 sm:w-6 h-5 sm:h-6 text-white" />}
                      {cap.id === 'expert-marketplace' && <Users className="w-5 sm:w-6 h-5 sm:h-6 text-white" />}
                      {cap.id === 'workspace' && <Briefcase className="w-5 sm:w-6 h-5 sm:h-6 text-white" />}
                      {cap.id === 'integrations' && <Target className="w-5 sm:w-6 h-5 sm:h-6 text-white" />}
                    </div>
                    <div className="text-left min-w-0">
                      <h3 className="text-sm sm:text-lg font-bold text-gray-900">{cap.title}</h3>
                      <p className="text-gray-500 text-xs sm:text-sm truncate">{cap.description}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 sm:w-6 h-5 sm:h-6 text-indigo-500 transition-transform duration-300 flex-shrink-0 ${openAccordion === cap.id ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openAccordion === cap.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 sm:p-5 pt-0 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {cap.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 sm:gap-3 text-gray-600 text-xs sm:text-sm">
                          <Check className="w-3 sm:w-4 h-3 sm:h-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
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

      {/* Use Cases */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">Solutions for Every Stage</h2>
          <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 flex-wrap">
            {Object.entries(useCases).map(([key, stage]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all ${activeTab === key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-100 text-gray-700 hover:text-gray-900 hover:bg-gray-200 border border-gray-300'}`}
              >
                {stage.title}
              </button>
            ))}
          </div>
          <div className="bg-gray-50 border border-gray-300 shadow-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Typical Challenges</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {currentStage.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3 text-gray-700 text-xs sm:text-sm">
                      <X className="w-3 sm:w-4 h-3 sm:h-4 text-red-500 flex-shrink-0 mt-0.5" />{c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Recommended Experts</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {currentStage.experts.map((e, i) => (
                    <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-100 border border-indigo-300 rounded-lg text-indigo-800 text-xs sm:text-sm font-medium">{e}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">90-Day Plan</h3>
                <p className="text-gray-700 text-xs sm:text-base">{currentStage.plan}</p>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Expected Outcomes</h3>
                <p className="text-green-700 font-semibold text-sm sm:text-base">{currentStage.outcomes}</p>
              </div>
              <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2 group text-xs sm:text-sm">
                Read Case Study: {currentStage.caseStudy} <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Categories */}
      <section className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">Expert Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {expertCategories.map((cat, i) => (
              <div
                key={i}
                className="group relative cursor-pointer animate-fadeInUp"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute -inset-0.5 bg-indigo-500/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm"></div>
                <div className="relative bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 group-hover:border-transparent transition-all shadow-sm">
                  <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                      {React.cloneElement(cat.icon, { className: 'w-5 sm:w-6 h-5 sm:h-6' })}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate">{cat.name}</h3>
                      <p className="text-gray-500 text-xs sm:text-sm">{cat.count}</p>
                    </div>
                  </div>
                  <button className="text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all text-xs sm:text-sm">
                    See Experts <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">Trusted by Growing Businesses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group relative animate-fadeInUp" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="absolute -inset-1 bg-indigo-500/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                <div className="relative bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-1 mb-2 sm:mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (<Star key={s} className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 fill-current" />))}
                  </div>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">"This platform transformed how we execute our marketing. From zero to 500 customers in 90 days!"</p>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg sm:rounded-xl"></div>
                    <div>
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm">Sarah Johnson</p>
                      <p className="text-xs text-gray-500">CEO, TechStartup</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
<<<<<<< Updated upstream
      <section className="pt-10 sm:pt-12 pb-4 sm:pb-6 px-4 sm:px-6">
=======
      <section id="pricing" className="py-10 sm:py-12 px-4 sm:px-6">
>>>>>>> Stashed changes
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2 sm:mb-3">Transparent Pricing</h2>
          <p className="text-gray-500 text-sm sm:text-base text-center mb-6 sm:mb-8">No hidden fees. Pay for results.</p>

          {pricingLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 h-full animate-pulse">
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-3 mb-6">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-4">
              {pricingData.map((tier, i) => (
                <div key={i} className={`group relative animate-fadeInUp ${tier.popular ? 'z-10' : ''}`} style={{ animationDelay: `${i * 150}ms` }}>
                  {tier.popular && <div className="absolute -inset-1 bg-indigo-500/20 rounded-2xl sm:rounded-3xl blur-lg opacity-50"></div>}
                  <div className={`relative bg-white border rounded-2xl sm:rounded-3xl p-5 sm:p-6 h-full ${tier.popular ? 'border-indigo-500 shadow-lg' : 'border-gray-200 hover:border-indigo-200'} transition-all`}>
                    {tier.popular && <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 sm:py-1.5 bg-indigo-600 rounded-full text-white text-xs font-semibold">Most Popular</div>}
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{tier.name}</h3>
                      <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">{tier.description}</p>
                      <div>
                        <span className="text-3xl sm:text-4xl font-bold text-gray-900">{tier.price}</span>
                        <span className="text-gray-500 text-xs sm:text-sm">{tier.period}</span>
                      </div>
                    </div>
                    <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {tier.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-600 text-xs sm:text-sm">
                          <Check className="w-3 sm:w-4 h-3 sm:h-4 text-green-500 flex-shrink-0 mt-0.5" />{f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => router.push('/register')}
                      className={`w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all ${tier.popular ? 'bg-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/20' : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-300'}`}
                    >
                      {tier.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">Frequently Asked Questions</h2>
          <div className="space-y-2 sm:space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 border border-gray-300 shadow-sm rounded-xl sm:rounded-2xl overflow-hidden hover:border-indigo-400 transition-all">
                <button onClick={() => toggleFAQ(i)} className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-100 text-left transition-all">
                  <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">{faq.question}</span>
                  <ChevronDown className={`w-4 sm:w-5 h-4 sm:h-5 text-indigo-600 transition-transform duration-300 flex-shrink-0 ${openFAQ === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFAQ === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 sm:p-5 pt-0 border-t border-gray-300">
                    <p className="text-gray-700 text-xs sm:text-sm">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="relative group">
          <div className="absolute -inset-1 bg-indigo-500/10 rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-50 blur-xl transition-opacity"></div>
          <div className="relative bg-white border border-gray-200 shadow-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Ready to transform your marketing?</h2>
            <p className="text-gray-500 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">Start with AI-powered insights and scale with human expertise when you need it</p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
              <button onClick={() => router.push('/onboarding-owner/welcome')} className="group px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20">
                <span className="flex items-center justify-center gap-2">Get Started Free <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" /></span>
              </button>
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl sm:rounded-2xl text-gray-900 font-bold text-sm sm:text-lg transition-all hover:scale-105">
                Book a Demo
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
            {footerLinks.map((link, i) => (
              <Link key={i} href={link.path} className="text-gray-500 hover:text-gray-900 transition-colors">{link.label}</Link>
            ))}
          </div>
          <p className="text-center text-gray-400 text-xs sm:text-sm mt-4 sm:mt-6">&copy; 2024 Karya-AI. All rights reserved.</p>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.05); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes wordSlide {
          0% { opacity: 0; transform: translateY(20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }

        .animate-blob { animation: blob 7s infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out both; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-gradient { animation: gradient 3s ease infinite; background-size: 200% 200%; }
        .animate-blink { animation: blink 1s step-end infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-wordSlide { animation: wordSlide 2s ease-in-out; }

        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        .bg-size-200 { background-size: 200% 200%; }
      `}</style>

      </div>{/* end content wrapper */}
    </div>
  );
}

export default HomePage;
