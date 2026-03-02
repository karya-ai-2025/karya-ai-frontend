'use client';
// pages/ExpertLanding.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play, ChevronDown, ChevronRight, Check, X, Zap, Users, Target, TrendingUp,
  MessageSquare, BarChart3, Briefcase, Star, ArrowRight, Trophy, DollarSign,
  Shield, Clock, Award, Calendar, FileText, Settings, Database
} from 'lucide-react';

function ExpertLanding() {
  const router = useRouter();
  const [activeFeatureTab, setActiveFeatureTab] = useState('project-management');
  const [openFAQ, setOpenFAQ] = useState(null);
  const [selectedTier, setSelectedTier] = useState('pro');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    expertise: '',
    experience: ''
  });

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Application submitted:', formData);
    router.push('/register?role=expert');
  };

  const benefits = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Pre-Qualified Leads',
      description: 'No more pitching. Projects come to you based on fit',
      stat: 'Avg. 4 project matches/month'
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: 'Premium Tools Included',
      description: 'Top 5% professional CRM + integrations worth $500/mo',
      logos: ['HubSpot', 'Salesforce', 'Zapier', 'Slack']
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Fair Economics',
      description: 'Keep 80% of project value. No hidden fees',
      example: '$10k project = $8k to you'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Professional Growth',
      description: 'Build verified portfolio. Get reviews. Level up',
      badges: ['Expert', 'Top Rated', 'Rising Talent']
    }
  ];

  const successStories = [
    {
      name: 'Marcus Chen',
      role: 'Growth Marketing Specialist',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      before: 'Freelancing, spending 50% of time on proposals',
      projects: '23 projects completed',
      revenue: '$187,000 earned in 12 months',
      quote: 'I went from chasing clients to choosing the best projects. My income doubled while working fewer hours.'
    },
    {
      name: 'Sarah Rodriguez',
      role: 'CRM Consultant',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      before: 'Working via traditional agencies (60% commission)',
      projects: '31 projects completed',
      revenue: '$243,500 earned in 12 months',
      quote: 'The platform fees are transparent and fair. I keep 80% vs. 40% with agencies. It\'s a no-brainer.'
    },
    {
      name: 'David Kim',
      role: 'SEO & Performance Expert',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      before: 'Cold outreach and referrals only',
      projects: '18 projects completed',
      revenue: '$156,000 earned in 12 months',
      quote: 'The AI matching is incredible. Every project I get is actually a good fit for my skills.'
    }
  ];

  const platformFeatures = {
    'project-management': {
      title: 'Project Management',
      items: [
        'Multi-project dashboard',
        'Task management & milestones',
        'Time tracking integration',
        'Client communication hub',
        'File sharing & collaboration',
        'Automated invoicing'
      ]
    },
    'crm-outreach': {
      title: 'CRM & Outreach',
      items: [
        'Advanced contact database',
        'Email sequence builder',
        'Call tracking & recording',
        'Response management',
        'Lead scoring',
        'Pipeline visualization'
      ]
    },
    'integrations': {
      title: 'Integrations',
      items: [
        'One-click app connections',
        'Real-time data sync',
        'Custom API access',
        'Zapier workflows',
        'Calendar integration',
        'Accounting software sync'
      ]
    },
    'analytics': {
      title: 'Analytics & Earnings',
      items: [
        'Revenue dashboard',
        'Project performance metrics',
        'Client satisfaction scores',
        'Payment history',
        'Tax document generation',
        'Earnings projections'
      ]
    }
  };

  const vettingSteps = [
    { step: 1, title: 'Application Review', description: 'Portfolio, experience, specializations reviewed' },
    { step: 2, title: 'Skills Assessment', description: 'Practical test in your area of expertise' },
    { step: 3, title: 'Portfolio Verification', description: 'We verify your past work and results' },
    { step: 4, title: 'Video Interview', description: '30-minute conversation about your approach' },
    { step: 5, title: 'Platform Training', description: 'Learn the tools and best practices' }
  ];

  const membershipTiers = [
    {
      name: 'Free Tier',
      price: '$0',
      period: '/month',
      features: [
        'Profile listing',
        'Up to 5 project applications/month',
        'Basic workspace access',
        'Standard CRM (500 contacts/mo)',
        '80% earnings'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Pro Tier',
      price: '$99',
      period: '/month',
      features: [
        'Unlimited applications',
        'Priority matching',
        'Enhanced CRM (5,000 contacts/mo)',
        'Advanced analytics',
        '82% earnings',
        'Profile badges',
        'Priority support'
      ],
      cta: 'Upgrade to Pro',
      popular: true
    },
    {
      name: 'Elite Tier',
      price: 'Invitation',
      period: 'Only',
      features: [
        'Concierge matching',
        'Unlimited CRM access',
        'White-glove support',
        '85% earnings',
        'Featured placement',
        'First access to premium projects',
        'Dedicated account manager'
      ],
      cta: 'Apply for Elite',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'How do I get paid?',
      answer: 'Payments are processed 5 business days after milestone completion. You can receive funds via direct deposit, PayPal, or wire transfer. We provide 1099 tax documentation for US-based experts.'
    },
    {
      question: 'Can I work with multiple clients?',
      answer: 'Absolutely! You can take on as many projects as you can handle. Our platform helps you manage multiple clients efficiently with built-in project management tools.'
    },
    {
      question: 'What if a client is difficult?',
      answer: 'We have a dispute resolution process and dedicated support team. All projects are milestone-based, so you\'re protected. We mediate conflicts and ensure fair outcomes.'
    },
    {
      question: 'How does the CRM access work?',
      answer: 'Included with your membership! You get access to professional-grade CRM tools (HubSpot, Salesforce integrations) worth $500/mo at no additional cost. Contact limits vary by tier.'
    },
    {
      question: 'Can I use my own tools?',
      answer: 'Yes! While we provide premium tools, you can integrate your existing stack. Our platform supports 50+ integrations and has open API access for custom workflows.'
    },
    {
      question: 'What\'s the commission structure?',
      answer: 'We keep it simple: 15% platform fee + 5% payment processing = you keep 80% of every dollar. Pro tier gets 82%, Elite gets 85%. No hidden fees, ever.'
    },
    {
      question: 'How do I increase my match rate?',
      answer: 'Complete your profile thoroughly, showcase results with metrics, gather client testimonials, respond quickly to matches, and maintain high project ratings. Our AI prioritizes active, high-performing experts.'
    },
    {
      question: 'What\'s the acceptance rate?',
      answer: 'We accept only 12% of applicants to maintain quality. Once accepted, maintain a 4.5+ star rating and complete onboarding training to stay active on the platform.'
    }
  ];

  const currentFeature = platformFeatures[activeFeatureTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Karya-AI</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/login?role=expert')} className="px-6 py-2 text-white hover:text-blue-300 font-medium transition-colors">Sign In</button>
              <button onClick={() => router.push('/register?role=expert')} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg text-white font-medium transition-all">Apply Now</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Turn Your Expertise Into<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Recurring Revenue</span>
          </h1>
          <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">Get matched to pre-qualified projects. Access premium tools. Keep 80% of earnings.</p>
          <button onClick={() => router.push('/register?role=expert')} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 shadow-xl inline-flex items-center gap-2">
            Apply Now
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Dashboard Preview */}
          <div className="mt-12 relative max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop" alt="Expert Dashboard" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="grid grid-cols-3 gap-4 text-white">
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-3xl font-bold">$8,750</div>
                    <div className="text-sm text-gray-300">This Month</div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-3xl font-bold">12</div>
                    <div className="text-sm text-gray-300">Active Projects</div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-3xl font-bold">4.9★</div>
                    <div className="text-sm text-gray-300">Avg Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join - 4 Benefits Grid */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Why Top Experts Choose Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-300 mb-3">{benefit.description}</p>
                {benefit.stat && (
                  <div className="text-blue-400 font-semibold">{benefit.stat}</div>
                )}
                {benefit.example && (
                  <div className="text-green-400 font-semibold">{benefit.example}</div>
                )}
                {benefit.logos && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {benefit.logos.map((logo, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">{logo}</span>
                    ))}
                  </div>
                )}
                {benefit.badges && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {benefit.badges.map((badge, idx) => (
                      <span key={idx} className="px-2 py-1 bg-yellow-500/20 rounded text-xs text-yellow-300">{badge}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Matching Works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">How Matching Works</h2>
          <p className="text-xl text-gray-400 text-center mb-12">We find projects for you, not the other way around</p>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <div className="space-y-6">
              {[
                { title: 'Your Profile', desc: 'Expertise, tools, results, availability' },
                { title: 'AI Matching', desc: 'Semantic analysis, success patterns, fit scoring' },
                { title: 'Project Fit Score', desc: 'Shown to clients with your profile' },
                { title: 'Your Decision', desc: 'Accept projects that excite you, pass on the rest' }
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                    <p className="text-gray-300">{step.desc}</p>
                  </div>
                  {index < 3 && (
                    <ChevronRight className="w-6 h-6 text-blue-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Expert Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img src={story.photo} alt={story.name} className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <h3 className="font-bold text-white">{story.name}</h3>
                    <p className="text-sm text-gray-400">{story.role}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Before:</div>
                  <div className="text-white">{story.before}</div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Projects:</span>
                    <span className="text-white font-semibold">{story.projects}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Revenue:</span>
                    <span className="text-green-400 font-bold">{story.revenue}</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mb-4">
                  <p className="text-gray-300 italic">"{story.quote}"</p>
                </div>

                <button className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2">
                  Read Full Story
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features - Tabs */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Platform Features for Experts</h2>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {Object.entries(platformFeatures).map(([key, feature]) => (
              <button
                key={key}
                onClick={() => setActiveFeatureTab(key)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeFeatureTab === key
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {feature.title}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">{currentFeature.title}</h3>
                <ul className="space-y-3">
                  {currentFeature.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/5 rounded-xl p-6 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
                  alt={currentFeature.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vetting Process */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <div className="inline-block px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-full text-red-300 font-semibold mb-4">
              Only 12% of applicants accepted
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Our Vetting Process</h2>
            <p className="text-xl text-gray-400">Maintain your elite status with excellence</p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 mt-12">
            {vettingSteps.map((step) => (
              <div key={step.step} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers / Earnings Structure */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-bold text-white mb-4">Membership Tiers</h2>
            <p className="text-xl text-gray-400">Choose the plan that fits your goals</p>
          </div>

          {/* Earnings Breakdown */}
          <div className="max-w-md mx-auto mb-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Earnings Structure</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">You Keep:</span>
                <span className="text-green-400 font-bold text-2xl">80%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Platform Fee:</span>
                <span className="text-white">15%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Payment Processing:</span>
                <span className="text-white">5%</span>
              </div>
              <div className="border-t border-white/20 pt-3 mt-3">
                <p className="text-center text-gray-300 text-sm">
                  Example: $10,000 project = <span className="text-green-400 font-bold">$8,000</span> to you
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {membershipTiers.map((tier, index) => (
              <div key={index} className={`relative bg-white/10 backdrop-blur-sm border rounded-2xl p-8 ${tier.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-white/20'}`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white text-sm font-semibold">Most Popular</div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    <span className="text-gray-400">{tier.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button onClick={() => router.push('/register?role=expert')} className={`w-full py-3 rounded-xl font-semibold transition-all ${tier.popular ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Payment Terms */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Payment Terms</h3>
            <div className="grid md:grid-cols-2 gap-4 text-gray-300">
              <div><strong className="text-white">Schedule:</strong> Upon milestone completion</div>
              <div><strong className="text-white">Processing:</strong> 5 business days</div>
              <div><strong className="text-white">Methods:</strong> Direct deposit, PayPal, Wire</div>
              <div><strong className="text-white">Currency:</strong> USD (international conversion available)</div>
              <div className="md:col-span-2"><strong className="text-white">Tax Docs:</strong> 1099 provided (US experts)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Why We're Different</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Traditional Freelance Platforms</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  20% commission or more
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  Unpaid time sourcing projects
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  Race to the bottom on pricing
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  No tools included
                </li>
              </ul>
              <div className="mt-4 p-3 bg-red-500/20 rounded-lg">
                <p className="text-white font-semibold">$10k project = $8k to you - unpaid sourcing time</p>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Our Platform</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  15% commission (+ 5% processing)
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  Projects come to you
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  Pre-qualified, fair pricing
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  $500/mo in tools included
                </li>
              </ul>
              <div className="mt-4 p-3 bg-green-500/20 rounded-lg">
                <p className="text-white font-semibold">$10k project = $8k to you + zero sourcing time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
                <button onClick={() => toggleFAQ(index)} className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all text-left">
                  <span className="font-semibold text-white">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-white flex-shrink-0 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`} />
                </button>
                {openFAQ === index && (
                  <div className="p-6 pt-0 border-t border-white/10">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white text-center mb-4">Join 500+ Elite Experts</h2>
            <p className="text-gray-300 text-center mb-8">Start getting matched to high-quality projects</p>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Your Name" required className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" />
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="Email Address" required className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" />
              </div>

              <input type="text" name="expertise" value={formData.expertise} onChange={handleFormChange} placeholder="Your Expertise (e.g., Growth Marketing, CRM Consultant)" required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50" />

              <textarea name="experience" value={formData.experience} onChange={handleFormChange} placeholder="Brief background (years of experience, notable achievements)" rows={4} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 resize-none" />

              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl text-white font-bold text-lg transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-2">
                  Start Application
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button type="button" onClick={() => router.push('/contact')} className="flex-1 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-2">
                  Schedule Call
                  <Calendar className="w-5 h-5" />
                </button>
              </div>

              <p className="text-center text-sm text-gray-400">
                ✓ Application reviewed in 48 hours
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Karya-AI</span>
          </div>
          <p className="text-gray-400">© 2026 Karya-AI. All rights reserved.</p>
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

export default ExpertLanding;
