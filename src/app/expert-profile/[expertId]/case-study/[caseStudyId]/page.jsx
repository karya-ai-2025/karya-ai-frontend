'use client';
// pages/CaseStudyDetail.jsx
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Share2, Download, ChevronRight, ChevronLeft,
  Star, Clock, DollarSign, Calendar, Target, CheckCircle, TrendingUp,
  FileText, Image, Sparkles, Briefcase, Zap
} from 'lucide-react';

// Tool icons mapping
const toolIcons = {
  'Salesforce': '🔵', 'HubSpot': '🟠', 'Apollo': '🚀', 'Outreach': '📤',
  'Marketo': '🟣', 'ActiveCampaign': '🔴', 'Google Analytics': '📊',
  'LinkedIn': '💼', 'Clay': '🧱', 'Looker': '📈', 'Notion': '📝',
  'Gmail': '📧', '6sense': '🔮'
};

// Mock case study data
const mockCaseStudies = {
  1: {
    id: 1,
    title: "B2B SaaS Lead Generation Machine",
    subtitle: "Building a predictable outbound sales system from scratch",
    clientIndustry: "HR Tech SaaS",
    clientSize: "Series A, 25 employees",
    clientName: "TalentFlow",
    projectDuration: "90 days",
    budgetRange: "$10,000 - $15,000",
    completedDate: "November 2024",
    heroImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&h=600&fit=crop",
    featured: true,
    challenge: {
      summary: "TalentFlow was struggling to generate qualified leads for their enterprise HR software. Their sales team was spending 80% of their time on unqualified prospects, and their CAC was 3x the industry average.",
      painPoints: [
        "Sales team wasting time on unqualified leads",
        "No systematic approach to outbound prospecting",
        "CAC 3x higher than industry benchmark",
        "Inconsistent pipeline making revenue unpredictable"
      ],
      goals: [
        "Build a repeatable lead generation system",
        "Reduce time spent on unqualified prospects by 50%",
        "Lower CAC to industry average within 6 months",
        "Create predictable pipeline for sales team"
      ]
    },
    approach: {
      summary: "I took a systematic, data-driven approach to rebuilding their entire outbound motion from the ground up in three phases.",
      phases: [
        {
          title: "Phase 1: Discovery & ICP Definition",
          duration: "Weeks 1-3",
          activities: [
            "Conducted 12 customer interviews to understand buying patterns",
            "Analyzed CRM data to identify highest-value customer segments",
            "Built detailed ICP documentation with firmographic criteria",
            "Mapped buyer personas and decision-making processes"
          ]
        },
        {
          title: "Phase 2: System Setup & Content Creation",
          duration: "Weeks 4-6",
          activities: [
            "Implemented Apollo for prospecting and data enrichment",
            "Configured HubSpot sequences with A/B testing",
            "Wrote 7 email sequences (42 emails total) for personas",
            "Created sales playbook with qualification criteria"
          ]
        },
        {
          title: "Phase 3: Launch & Optimization",
          duration: "Weeks 7-12",
          activities: [
            "Launched campaigns to initial prospect list of 2,500",
            "Weekly optimization based on engagement data",
            "Trained sales team on new processes",
            "Set up attribution tracking and reporting dashboards"
          ]
        }
      ],
      methodologies: ["Jobs-to-be-Done Framework", "Predictable Revenue", "A/B Testing"],
      toolsUsed: ["Apollo", "HubSpot", "Google Analytics", "Notion", "Looker"]
    },
    results: {
      summary: "The new outbound system transformed TalentFlow's sales motion, delivering immediate and sustained results.",
      metrics: [
        { icon: "🎯", metric: "487", label: "Qualified leads", description: "Up from 45 leads", change: "+982%" },
        { icon: "📈", metric: "23%", label: "Conversion rate", description: "Industry avg is 15%", change: "+53%" },
        { icon: "💰", metric: "$340K", label: "Pipeline created", description: "In first 90 days", change: "New" },
        { icon: "⏱️", metric: "14%", label: "Faster sales cycle", description: "From 45 to 39 days", change: "-14%" },
        { icon: "📊", metric: "3.2x", label: "ROI achieved", description: "In first 90 days", change: "+220%" },
        { icon: "💵", metric: "42%", label: "Lower CAC", description: "Now at industry avg", change: "-42%" }
      ],
      timeline: [
        { week: "Week 4", event: "First qualified leads from new sequences" },
        { week: "Week 6", event: "Reply rate hits 18% (vs. 3% previously)" },
        { week: "Week 8", event: "First deal closed from new pipeline" },
        { week: "Week 12", event: "System fully operational, team trained" }
      ]
    },
    deliverables: [
      { title: "ICP Documentation", description: "15-page document defining ideal customer profile", type: "Document" },
      { title: "Email Sequences", description: "7 multi-touch sequences (42 emails total)", type: "Content" },
      { title: "Apollo Prospect List", description: "2,500 prospects matching ICP criteria", type: "Data" },
      { title: "Sales Playbook", description: "Qualification guide using BANT+ framework", type: "Document" },
      { title: "Analytics Dashboard", description: "Real-time HubSpot reporting dashboard", type: "Dashboard" },
      { title: "Training Materials", description: "Videos and docs for team onboarding", type: "Training" }
    ],
    testimonial: {
      quote: "Sarah transformed our entire outbound motion. We went from scattered cold outreach to a predictable lead generation machine. The ROI was evident within the first month.",
      author: "Michael Chen",
      title: "VP of Sales",
      company: "TalentFlow",
      avatar: "MC",
      rating: 5
    },
    gallery: [
      { title: "Campaign Dashboard", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop" },
      { title: "Email Performance", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop" },
      { title: "ICP Framework", url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop" }
    ],
    skills: ["Lead Generation", "Email Sequences", "Apollo", "HubSpot", "Sales Enablement", "ICP Development"],
    relatedIds: [2, 3],
    expert: {
      id: 1, name: "Sarah Mitchell", title: "B2B SaaS Growth Marketer",
      avatar: "SM", avatarColor: "from-blue-600 to-orange-500",
      rating: 4.9, reviews: 48
    }
  },
  2: {
    id: 2,
    title: "Fintech Demand Generation Overhaul",
    subtitle: "Scaling marketing to match product-market fit",
    clientIndustry: "Fintech",
    clientSize: "Series B, 80 employees",
    clientName: "PayStream",
    projectDuration: "60 days",
    budgetRange: "$15,000 - $20,000",
    completedDate: "October 2024",
    heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=600&fit=crop",
    featured: true,
    challenge: {
      summary: "PayStream was scaling rapidly but their marketing couldn't keep up. They had strong product-market fit but lacked systems to generate consistent pipeline.",
      painPoints: [
        "Marketing not scaling with company growth",
        "No cohesive demand generation strategy",
        "Disconnected tools and manual processes",
        "Poor visibility into marketing attribution"
      ],
      goals: [
        "Build scalable demand generation engine",
        "Implement ABM for enterprise accounts",
        "Create unified marketing attribution",
        "Align sales and marketing teams"
      ]
    },
    approach: {
      summary: "Focused on building a content-led ABM program while implementing marketing automation to scale efforts.",
      phases: [
        { title: "Phase 1: Audit & Strategy", duration: "Weeks 1-2",
          activities: ["Audited existing channels", "Identified gaps", "Developed ABM criteria", "Created content framework"] },
        { title: "Phase 2: Implementation", duration: "Weeks 3-5",
          activities: ["Implemented Marketo", "Built ABM playbook", "Created 3-month content calendar", "Set up attribution"] },
        { title: "Phase 3: Execution", duration: "Weeks 6-8",
          activities: ["Launched ABM campaigns", "Trained team", "Built dashboards", "Documented processes"] }
      ],
      methodologies: ["ITSMA ABM Framework", "Sirius Decisions Demand Waterfall"],
      toolsUsed: ["Marketo", "Salesforce", "Looker", "LinkedIn", "6sense"]
    },
    results: {
      summary: "The demand generation overhaul delivered transformative results.",
      metrics: [
        { icon: "🚀", metric: "156%", label: "MQL increase", description: "Month over month", change: "+156%" },
        { icon: "💵", metric: "$890K", label: "Pipeline", description: "In 60 days", change: "New" },
        { icon: "📉", metric: "42%", label: "Lower CAC", description: "Better targeting", change: "-42%" },
        { icon: "⭐", metric: "4.8x", label: "ROAS", description: "Across channels", change: "+180%" }
      ],
      timeline: [
        { week: "Week 2", event: "Strategy approved" },
        { week: "Week 4", event: "First ABM campaigns live" },
        { week: "Week 8", event: "Team fully ramped" }
      ]
    },
    deliverables: [
      { title: "ABM Playbook", description: "Account-based marketing guide", type: "Document" },
      { title: "Marketo Automation", description: "Full automation setup", type: "System" },
      { title: "Content Calendar", description: "3-month planning doc", type: "Planning" },
      { title: "Attribution Dashboard", description: "Looker dashboard", type: "Dashboard" }
    ],
    testimonial: {
      quote: "The demand gen system Sarah built is now the backbone of our growth.",
      author: "Jennifer Park", title: "CMO", company: "PayStream", avatar: "JP", rating: 5
    },
    gallery: [
      { title: "ABM Dashboard", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop" }
    ],
    skills: ["Demand Generation", "ABM", "Marketo", "Content Strategy", "Attribution"],
    relatedIds: [1, 3],
    expert: {
      id: 1, name: "Sarah Mitchell", title: "B2B SaaS Growth Marketer",
      avatar: "SM", avatarColor: "from-blue-600 to-orange-500", rating: 4.9, reviews: 48
    }
  },
  3: {
    id: 3,
    title: "Marketplace Cold Outreach System",
    subtitle: "Rapid supplier acquisition on a startup budget",
    clientIndustry: "B2B Marketplace",
    clientSize: "Seed, 12 employees",
    clientName: "SupplyHub",
    projectDuration: "45 days",
    budgetRange: "$7,000 - $10,000",
    completedDate: "September 2024",
    heroImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1400&h=600&fit=crop",
    featured: false,
    challenge: {
      summary: "SupplyHub needed to quickly acquire suppliers with limited budget and no dedicated sales team.",
      painPoints: ["Limited budget", "No sales team", "Chicken-and-egg problem", "Need rapid results"],
      goals: ["Onboard 100 suppliers in 45 days", "Keep CPA under $100", "Build self-sustaining system"]
    },
    approach: {
      summary: "Built a lean, automated cold outreach system designed for startup constraints.",
      phases: [
        { title: "Phase 1: Setup", duration: "Week 1",
          activities: ["Defined supplier ICP", "Set up Apollo + Gmail", "Built prospect list", "Created templates"] },
        { title: "Phase 2: Launch", duration: "Weeks 2-4",
          activities: ["Launched email sequences", "Built onboarding funnel", "Implemented tracking", "Optimized campaigns"] },
        { title: "Phase 3: Scale", duration: "Weeks 5-6",
          activities: ["Scaled winners", "Documented processes", "Trained team", "Set up metrics"] }
      ],
      methodologies: ["Lean Startup", "Rapid Experimentation"],
      toolsUsed: ["Apollo", "Gmail", "Notion", "Google Analytics"]
    },
    results: {
      summary: "Exceeded targets while staying under budget.",
      metrics: [
        { icon: "🏪", metric: "89", label: "Suppliers", description: "89% of target", change: "+89" },
        { icon: "📧", metric: "34%", label: "Reply rate", description: "vs. 3% average", change: "+1033%" },
        { icon: "💰", metric: "$45", label: "Cost/supplier", description: "55% under budget", change: "-55%" },
        { icon: "📈", metric: "2.1x", label: "GMV increase", description: "From suppliers", change: "+110%" }
      ],
      timeline: [
        { week: "Week 1", event: "System setup complete" },
        { week: "Week 3", event: "First 10 suppliers" },
        { week: "Week 6", event: "89 suppliers total" }
      ]
    },
    deliverables: [
      { title: "Supplier ICP", description: "Criteria document", type: "Document" },
      { title: "Email Sequences", description: "4 sequences with templates", type: "Content" },
      { title: "Automation System", description: "Gmail-based automation", type: "System" },
      { title: "Tracking Sheet", description: "Performance metrics", type: "Dashboard" }
    ],
    testimonial: {
      quote: "Sarah understood our constraints and delivered a solution that worked within our budget.",
      author: "Alex Rivera", title: "Co-founder", company: "SupplyHub", avatar: "AR", rating: 5
    },
    gallery: [
      { title: "Email Performance", url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop" }
    ],
    skills: ["Cold Outreach", "Email Sequences", "Marketplace", "Supplier Acquisition"],
    relatedIds: [1, 2],
    expert: {
      id: 1, name: "Sarah Mitchell", title: "B2B SaaS Growth Marketer",
      avatar: "SM", avatarColor: "from-blue-600 to-orange-500", rating: 4.9, reviews: 48
    }
  }
};

function CaseStudyDetail() {
  const router = useRouter();
  const { expertId, caseStudyId } = useParams();
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const caseStudy = mockCaseStudies[caseStudyId] || mockCaseStudies[1];
  const expert = caseStudy.expert;

  const handleShare = () => navigator.clipboard.writeText(window.location.href);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => router.push(`/expert-profile/${expertId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900 flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Profile</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={caseStudy.heroImage} alt={caseStudy.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-5xl mx-auto">
            {caseStudy.featured && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full text-sm font-medium text-white mb-4">
                <Star className="w-4 h-4 fill-current" /> Featured
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{caseStudy.title}</h1>
            <p className="text-xl text-gray-600">{caseStudy.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-4 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span className="text-gray-900 font-medium">{caseStudy.clientName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="text-gray-900">{caseStudy.clientIndustry}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-900">{caseStudy.projectDuration}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-gray-900">{caseStudy.budgetRange}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-900">{caseStudy.completedDate}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Challenge */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-red-400" />
                </div>
                The Challenge
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">{caseStudy.challenge.summary}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Pain Points</h3>
                  <ul className="space-y-2">
                    {caseStudy.challenge.painPoints.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <span className="text-red-400 mt-1">✕</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Goals</h3>
                  <ul className="space-y-2">
                    {caseStudy.challenge.goals.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600">
                        <span className="text-green-400 mt-1">◎</span>{g}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Approach */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                The Approach
              </h2>
              <p className="text-gray-600 mb-6">{caseStudy.approach.summary}</p>
              <div className="space-y-4 mb-6">
                {caseStudy.approach.phases.map((phase, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">{phase.title}</h3>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">{phase.duration}</span>
                    </div>
                    <ul className="space-y-2">
                      {phase.activities.map((act, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                          <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />{act}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Methodologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {caseStudy.approach.methodologies.map((m, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 border border-purple-500/30 rounded-lg text-purple-300 text-sm">{m}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    {caseStudy.approach.toolsUsed.map((t, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg text-gray-600 text-sm">
                        <span>{toolIcons[t] || '🔧'}</span>{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Results */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                The Results
              </h2>
              <p className="text-gray-600 mb-6">{caseStudy.results.summary}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {caseStudy.results.metrics.map((r, i) => (
                  <div key={i} className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">{r.icon}</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{r.metric}</div>
                    <div className="text-sm text-gray-600">{r.label}</div>
                    <div className="text-xs text-gray-500">{r.description}</div>
                    {r.change && (
                      <div className={`text-xs mt-2 px-2 py-0.5 rounded-full inline-block ${
                        r.change.startsWith('+') ? 'bg-green-500/20 text-green-400' :
                        r.change.startsWith('-') ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                      }`}>{r.change}</div>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Timeline</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-purple-500"></div>
                  <div className="space-y-4">
                    {caseStudy.results.timeline.map((t, i) => (
                      <div key={i} className="flex items-start gap-4 pl-8 relative">
                        <div className="absolute left-2.5 w-3 h-3 bg-white rounded-full border-2 border-green-500"></div>
                        <div className="text-sm font-medium text-green-400 w-16">{t.week}</div>
                        <div className="text-gray-600">{t.event}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Deliverables */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                Deliverables
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {caseStudy.deliverables.map((d, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">{d.title}</h4>
                        <p className="text-sm text-gray-500">{d.description}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500">{d.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Gallery */}
            {caseStudy.gallery?.length > 0 && (
              <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center">
                    <Image className="w-5 h-5 text-pink-400" />
                  </div>
                  Supporting Materials
                </h2>
                <div className="relative rounded-xl overflow-hidden mb-4">
                  <img src={caseStudy.gallery[activeGalleryIndex].url} alt={caseStudy.gallery[activeGalleryIndex].title}
                    className="w-full h-64 object-cover" />
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-sm">
                    {caseStudy.gallery[activeGalleryIndex].title}
                  </div>
                </div>
                {caseStudy.gallery.length > 1 && (
                  <div className="flex gap-2">
                    {caseStudy.gallery.map((g, i) => (
                      <button key={i} onClick={() => setActiveGalleryIndex(i)}
                        className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                          activeGalleryIndex === i ? 'border-purple-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                        <img src={g.url} alt={g.title} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Testimonial */}
            <section className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl text-blue-600 opacity-50">"</div>
                <div className="flex-1">
                  <p className="text-xl text-gray-700 italic mb-6 leading-relaxed">{caseStudy.testimonial.quote}</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{caseStudy.testimonial.avatar}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{caseStudy.testimonial.author}</div>
                      <div className="text-sm text-gray-500">{caseStudy.testimonial.title}, {caseStudy.testimonial.company}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < caseStudy.testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Skills */}
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Skills Demonstrated</h2>
              <div className="flex flex-wrap gap-2">
                {caseStudy.skills.map((s, i) => (
                  <span key={i} className="px-4 py-2 bg-blue-100 border border-purple-500/30 rounded-full text-purple-300">{s}</span>
                ))}
              </div>
            </section>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {caseStudy.relatedIds[1] && (
                <button onClick={() => router.push(`/expert-profile/${expertId}/case-study/${caseStudy.relatedIds[1]}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-white/20 border border-gray-200 rounded-lg text-white">
                  <ChevronLeft className="w-5 h-5" />Previous
                </button>
              )}
              <div className="flex-1" />
              {caseStudy.relatedIds[0] && (
                <button onClick={() => router.push(`/expert-profile/${expertId}/case-study/${caseStudy.relatedIds[0]}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-white/20 border border-gray-200 rounded-lg text-white">
                  Next<ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Expert Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sticky top-20">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Project By</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${expert.avatarColor} rounded-xl flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{expert.avatar}</span>
                </div>
                <div>
                  <h4 className="font-bold text-white">{expert.name}</h4>
                  <p className="text-sm text-purple-300">{expert.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white font-medium">{expert.rating}</span>
                <span className="text-gray-500 text-sm">({expert.reviews} reviews)</span>
              </div>
              <button onClick={() => router.push(`/expert-profile/${expertId}`)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium mb-2">
                View Full Profile
              </button>
              <button className="w-full py-3 bg-gray-100 hover:bg-white/20 border border-gray-200 rounded-xl text-white font-medium">
                Contact Expert
              </button>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Client</span><span className="text-white">{caseStudy.clientName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Industry</span><span className="text-gray-900">{caseStudy.clientIndustry}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="text-gray-900">{caseStudy.projectDuration}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Budget</span><span className="text-gray-900">{caseStudy.budgetRange}</span></div>
              </div>
            </div>

            {/* Download */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-gray-200 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-2">Download Case Study</h3>
              <p className="text-sm text-gray-500 mb-4">Get the full PDF to share with your team.</p>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />Download PDF
              </button>
            </div>

            {/* Related */}
            {caseStudy.relatedIds.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Related Work</h3>
                <div className="space-y-3">
                  {caseStudy.relatedIds.map(id => {
                    const r = mockCaseStudies[id];
                    if (!r) return null;
                    return (
                      <button key={id} onClick={() => router.push(`/expert-profile/${expertId}/case-study/${id}`)}
                        className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-xl p-3 group">
                        <h4 className="font-medium text-white text-sm group-hover:text-purple-300">{r.title}</h4>
                        <p className="text-xs text-gray-500">{r.clientIndustry}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 px-4 mt-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Karya-AI</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Karya-AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default CaseStudyDetail;