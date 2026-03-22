'use client';

// pages/BusinessLanding.jsx
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Play, ChevronDown, ChevronRight, Check, Zap, Users, Target, TrendingUp,
  MessageSquare, BarChart3, Briefcase, Star, ArrowRight, X, Search, Globe, Rocket
} from 'lucide-react';
import NavbarAuth from '@/components/NavbarAuth';

function BusinessLanding() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pre-launch');
  const [openAccordion, setOpenAccordion] = useState('ai-planning');
  const [openFAQ, setOpenFAQ] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    goal: ''
  });

  const toggleAccordion = (section) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    router.push('/register');
  };

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
    'growth': { title: 'Growth Stage', challenges: ['Scaling customer acquisition', 'Optimizing conversion funnels', 'Building repeatable systems'], experts: ['Growth Marketer', 'CRO Specialist', 'Marketing Automation Expert'], plan: 'Month 1: Audit & optimize → Month 2: Scale winners → Month 3: Automate systems', outcomes: '3x customer acquisition, 40% better conversion rates, automated workflows', caseStudy: 'E-commerce brand scaled from $50K to $200K/mo' },
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

  const pricingTiers = [
    { name: 'Starter', price: '$499', period: '/project', description: 'Perfect for single campaigns', features: ['Single project', 'AI roadmap generation', 'Up to 2 expert matches', 'Basic analytics', 'Email support', '30-day project duration'], cta: 'Start Free Trial', popular: false },
    { name: 'Growth', price: '$1,499', period: '/month', description: 'For growing businesses', features: ['Up to 5 active projects', 'Advanced AI planning', 'Unlimited expert matches', 'Advanced analytics & reporting', 'Priority support', 'Custom integrations', 'Dedicated success manager'], cta: 'Start Growing', popular: true },
    { name: 'Scale', price: 'Custom', period: '', description: 'Enterprise-grade solutions', features: ['Unlimited projects', 'White-label options', 'API access', 'Custom AI training', '24/7 dedicated support', 'SLA guarantees', 'Custom contracts', 'Onboarding & training'], cta: 'Contact Sales', popular: false }
  ];

  const faqs = [
    { question: 'How does AI planning work?', answer: 'Our AI analyzes your goals, industry, and resources to create a customized 90-day roadmap. It breaks down complex strategies into actionable tasks, suggests timelines, and recommends the right experts for each phase.' },
    { question: 'How are experts vetted?', answer: 'Every expert goes through a rigorous 5-step vetting process: portfolio review, skill assessment, background check, client reference calls, and a trial project. Only the top 3% of applicants are approved.' },
    { question: 'What if I\'m not satisfied with an expert?', answer: 'We offer a 100% satisfaction guarantee. If you\'re not happy with an expert\'s work in the first week, we\'ll replace them for free and refund any unused hours.' },
    { question: 'Can I hire multiple experts?', answer: 'Absolutely! Most successful projects involve 2-4 specialists working together. Our platform makes it easy to coordinate multiple experts on a single project.' },
    { question: 'How do payments work?', answer: 'We use milestone-based payments. Funds are held in escrow and released only when you approve deliverables. No upfront payment to experts - you\'re always protected.' },
    { question: 'What integrations are supported?', answer: 'We integrate with 50+ tools including HubSpot, Salesforce, Google Analytics, Slack, Asana, and more. Plus, our Zapier integration lets you connect thousands of additional apps.' }
  ];

  const currentStage = useCases[activeTab];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/karya-ai-logo.png" alt="Karya AI" width={40} height={40} className="rounded-xl object-contain" />
              <span className="text-xl font-bold text-gray-900">Karya-AI</span>
            </div>
            <div className="flex items-center gap-4">
              <NavbarAuth loginRole="owner" ctaText="Get Started Free" ctaPath="/register" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
            From Idea to Customers<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600">in 90 Days</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">AI breaks down your GTM strategy. Experts execute it. You track results.</p>
          <button onClick={() => router.push('/register')} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 shadow-xl inline-flex items-center gap-2">
            Start Your Project Free
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="mt-12 relative max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl">
              <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop" alt="Platform Demo" className="w-full h-auto" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-white ml-1" fill="white" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-semibold text-lg">Watch our 90-second explainer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {painPoints.map((point, index) => (
              <div key={index} className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{point.problem}</h3>
                <div className="h-0.5 w-12 bg-blue-500 mb-3"></div>
                <p className="text-gray-600">{point.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">Platform Capabilities</h2>
          <p className="text-gray-500 text-center mb-12">Everything you need to execute your go-to-market strategy</p>

          <div className="space-y-4">
            {capabilities.map((cap) => (
              <div key={cap.id} className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <button onClick={() => toggleAccordion(cap.id)} className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      {cap.id === 'ai-planning' && <Zap className="w-6 h-6 text-white" />}
                      {cap.id === 'expert-marketplace' && <Users className="w-6 h-6 text-white" />}
                      {cap.id === 'workspace' && <Briefcase className="w-6 h-6 text-white" />}
                      {cap.id === 'integrations' && <Target className="w-6 h-6 text-white" />}
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900">{cap.title}</h3>
                      <p className="text-gray-500 text-sm">{cap.description}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-6 h-6 text-gray-900 transition-transform ${openAccordion === cap.id ? 'rotate-180' : ''}`} />
                </button>

                {openAccordion === cap.id && (
                  <div className="p-6 pt-0 border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-4">
                      {cap.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases by Business Stage */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Solutions for Every Stage</h2>

          <div className="flex justify-center gap-4 mb-8">
            {Object.entries(useCases).map(([key, stage]) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-900'}`}>
                {stage.title}
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Typical Challenges</h3>
                <ul className="space-y-2">
                  {currentStage.challenges.map((challenge, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Recommended Experts</h3>
                <div className="flex flex-wrap gap-2">
                  {currentStage.experts.map((expert, idx) => (
                    <span key={idx} className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-medium">{expert}</span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">90-Day Plan</h3>
                <p className="text-gray-600">{currentStage.plan}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Expected Outcomes</h3>
                <p className="text-green-500 font-medium">{currentStage.outcomes}</p>
              </div>

              <div>
                <button className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2">
                  Read Case Study: {currentStage.caseStudy}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Categories */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">Expert Categories</h2>
          <p className="text-gray-500 text-center mb-12">Find the right specialist for your needs</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertCategories.map((category, index) => (
              <div key={index} className="group bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">{category.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                    <p className="text-gray-500 text-sm">{category.count}</p>
                  </div>
                </div>
                <button className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                  See Experts
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Trusted by Growing Businesses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"This platform transformed how we execute our marketing. From zero to 500 customers in 90 days!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-400 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">CEO, TechStartup</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Transparent Pricing</h2>
            <p className="text-xl text-gray-500 mb-2">No hidden fees. Pay for results.</p>
            <p className="text-gray-400">Value-based model designed to align with your success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`relative bg-white border rounded-2xl p-8 shadow-sm ${tier.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200'}`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 rounded-full text-white text-sm font-semibold">Most Popular</div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{tier.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    <span className="text-gray-500">{tier.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button onClick={() => router.push('/register')} className={`w-full py-3 rounded-xl font-semibold transition-all ${tier.popular ? 'bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <button onClick={() => toggleFAQ(index)} className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-all text-left">
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-900 flex-shrink-0 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`} />
                </button>
                {openFAQ === index && (
                  <div className="p-6 pt-0 border-t border-gray-200">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-4">Start Your Free Project Plan</h2>
            <p className="text-gray-600 text-center mb-8">Get your AI-generated roadmap in 24 hours - no credit card required</p>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Your Name" required className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" />
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="Email Address" required className="px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" />
              </div>

              <input type="text" name="company" value={formData.company} onChange={handleFormChange} placeholder="Company Name" required className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" />

              <textarea name="goal" value={formData.goal} onChange={handleFormChange} placeholder="What's your main goal? (e.g., Launch new product, Scale customer acquisition)" rows={4} required className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 resize-none" />

              <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-2">
                Get AI Roadmap in 24 Hours
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-center text-sm text-gray-500">No credit card required • Free forever plan available</p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/karya-ai-logo.png" alt="Karya AI" width={40} height={40} className="rounded-xl object-contain" />
            <span className="text-xl font-bold text-gray-900">Karya-AI</span>
          </div>
          <p className="text-gray-500">© 2026 Karya-AI. All rights reserved.</p>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

export default BusinessLanding;
