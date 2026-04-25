'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Star, Clock, DollarSign, CheckCircle, Send, ChevronDown,
  Briefcase, Shield, Zap, MessageSquare, FileText, Calendar, User,
  Check, X, Loader2, ChevronRight, AlertCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const fetchExpertById = async (id) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/marketplace/experts/${id}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load expert');
  return data.data || data;
};

function normalizeExpert(data) {
  if (!data) return null;
  const initials = (data.fullName || data.name || 'EX')
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return {
    id: data._id || data.id,
    name: data.fullName || data.name || 'Expert',
    title: data.headline || data.title || '',
    avatar: data.avatar || initials,
    avatarColor: 'from-blue-600 to-orange-500',
    location: data.location || '',
    rating: data.rating || 0,
    reviews: data.totalReviews || data.reviews || 0,
    projectsCompleted: data.projectsCompleted || 0,
    hourlyRate: data.hourlyRate || (data.services?.[0]?.pricing ? parseInt(data.services[0].pricing) : 120),
    responseTime: data.responseTime || '2 hours',
    availability: data.availability || 'Full-time',
    primaryExpertise: data.primaryExpertise || data.expertise || [],
    servicesOffered: data.servicesOffered || data.services?.map(s => s.name) || [],
    workPreferences: data.workPreferences || {
      projectDuration: '3–6 months',
      communicationStyle: 'Weekly syncs + async Slack',
      teamSize: '2–5 person team',
      workingHours: 'Mon–Fri, 9AM–6PM'
    },
    badges: data.badges || [],
  };
}

const SAMPLE_PROJECTS = [
  { id: '1', title: 'GTM Strategy for Q2 Launch', slug: 'gtm-strategy-q2', budget: 15000 },
  { id: '2', title: 'Lead Generation Pipeline', slug: 'lead-gen-pipeline', budget: 8000 },
  { id: '3', title: 'Brand Awareness Campaign', slug: 'brand-awareness', budget: 20000 },
];

const EXPERT_TERMS = [
  { icon: <Calendar className="w-4 h-4" />, label: 'Minimum Engagement', value: '4 weeks' },
  { icon: <Clock className="w-4 h-4" />, label: 'Notice Period', value: '1 week' },
  { icon: <MessageSquare className="w-4 h-4" />, label: 'Communication', value: 'Weekly video call + Slack' },
  { icon: <FileText className="w-4 h-4" />, label: 'Deliverables', value: 'Reports every 2 weeks' },
  { icon: <Shield className="w-4 h-4" />, label: 'NDA', value: 'Available on request' },
  { icon: <DollarSign className="w-4 h-4" />, label: 'Payment', value: 'Bi-weekly milestones' },
];

export default function HireExpertPage() {
  const router = useRouter();
  const { expertId } = useParams();

  const [expert, setExpert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedProject, setSelectedProject] = useState(null);
  const [myProjects, setMyProjects] = useState(SAMPLE_PROJECTS);
  const [engagementType, setEngagementType] = useState('monthly');
  const [duration, setDuration] = useState(3);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);

  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'expert',
      text: "Hi! I've reviewed your project requirements and I'm excited to discuss how I can help. I have experience with similar GTM strategies that drove 40% pipeline growth. What's your ideal timeline?",
      time: '10:30 AM',
    },
    {
      id: 2,
      from: 'user',
      text: "Great! We're aiming for a Q2 launch in about 3 months. Budget is flexible for the right fit.",
      time: '10:45 AM',
    },
    {
      id: 3,
      from: 'expert',
      text: "That works perfectly. I can dedicate 20 hrs/week. I'd suggest a phased approach: discovery in week 1–2, strategy in 3–4, then execution. My rate for this scope would be $110/hr.",
      time: '11:00 AM',
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const [isHiring, setIsHiring] = useState(false);
  const [hired, setHired] = useState(false);

  useEffect(() => {
    if (!expertId) return;
    fetchExpertById(expertId)
      .then(data => setExpert(normalizeExpert(data)))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));

    // Load user's real projects from localStorage if available
    try {
      const stored = localStorage.getItem('karya_my_projects');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) setMyProjects(parsed);
      }
    } catch {}
  }, [expertId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const totalCost = expert
    ? engagementType === 'monthly'
      ? expert.hourlyRate * hoursPerWeek * 4 * duration
      : expert.hourlyRate * hoursPerWeek * duration
    : 0;

  const platformFee = Math.round(totalCost * 0.08);
  const grandTotal = totalCost + platformFee;

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      from: 'user',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setNewMessage('');
  };

  const handleHire = async () => {
    if (!selectedProject && myProjects.length) {
      alert('Please select a project to hire this expert for.');
      return;
    }
    setIsHiring(true);
    await new Promise(r => setTimeout(r, 1500));

    const hiredExpert = {
      id: expert.id,
      name: expert.name,
      title: expert.title,
      avatar: expert.avatar,
      hourlyRate: expert.hourlyRate,
      projectTitle: selectedProject?.title || myProjects[0]?.title || 'General Engagement',
      hiredAt: new Date().toISOString(),
      totalBudget: grandTotal,
      status: 'Active',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('karya_my_experts') || '[]');
      const updated = [...existing.filter(e => e.id !== hiredExpert.id), hiredExpert];
      localStorage.setItem('karya_my_experts', JSON.stringify(updated));
    } catch {}

    setIsHiring(false);
    setHired(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Expert not found'}</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (hired) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Expert Hired!</h2>
          <p className="text-gray-500 mb-2">
            <span className="font-semibold text-gray-900">{expert.name}</span> has been added to your team.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            They've been added to "My Experts" in your dashboard. You'll receive a confirmation email shortly.
          </p>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-8 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Expert</span>
              <span className="font-semibold text-gray-900">{expert.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Project</span>
              <span className="font-semibold text-gray-900">{selectedProject?.title || myProjects[0]?.title || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Budget</span>
              <span className="font-semibold text-gray-900">${grandTotal.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/business-dashboard')}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push('/expert-marketplace')}
              className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-sm transition-colors"
            >
              Find More Experts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/karya-ai-logo.png" alt="Karya AI" width={32} height={32} className="rounded-xl object-contain" />
              <span className="text-base font-bold text-gray-900 hidden sm:block">Karya-AI</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Expert Profile</span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-semibold text-gray-900">Hire Expert</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Hire Expert</h1>
          <p className="text-gray-500 text-sm mt-1">Review terms, set scope, and finalize your engagement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main */}
          <div className="lg:col-span-2 space-y-6">

            {/* Expert Summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${expert.avatarColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-lg">{expert.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-gray-900">{expert.name}</h2>
                    {expert.badges.includes('Expert Vetted') && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <Shield className="w-3 h-3" /> Vetted
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{expert.title}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                      {expert.rating} ({expert.reviews} reviews)
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {expert.projectsCompleted} projects
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Responds in {expert.responseTime}
                    </span>
                  </div>
                  {expert.primaryExpertise.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {expert.primaryExpertise.slice(0, 4).map(skill => (
                        <span key={skill} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Project Selection */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-base font-bold text-gray-900 mb-1">Select Project</h3>
              <p className="text-xs text-gray-500 mb-4">Which project is this expert being hired for?</p>
              <div className="space-y-2">
                {myProjects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedProject?.id === project.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedProject?.id === project.id ? 'bg-blue-600' : 'bg-gray-100'
                    }`}>
                      <Briefcase className={`w-4 h-4 ${selectedProject?.id === project.id ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{project.title}</p>
                      {project.budget && (
                        <p className="text-xs text-gray-400">Budget: ${project.budget?.toLocaleString()}</p>
                      )}
                    </div>
                    {selectedProject?.id === project.id && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Engagement Scope */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">Engagement Scope</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Type</label>
                  <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                    {['hourly', 'monthly'].map(type => (
                      <button
                        key={type}
                        onClick={() => setEngagementType(type)}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-all capitalize ${
                          engagementType === type
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    {engagementType === 'monthly' ? 'Duration (months)' : 'Duration (weeks)'}
                  </label>
                  <select
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {engagementType === 'monthly'
                      ? [1, 2, 3, 6, 12].map(n => <option key={n} value={n}>{n} month{n > 1 ? 's' : ''}</option>)
                      : [1, 2, 4, 8, 12].map(n => <option key={n} value={n}>{n} week{n > 1 ? 's' : ''}</option>)
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Hours / Week</label>
                  <select
                    value={hoursPerWeek}
                    onChange={e => setHoursPerWeek(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {[10, 20, 30, 40].map(h => <option key={h} value={h}>{h} hrs/week</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Expert Terms */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-base font-bold text-gray-900">Expert's Terms & Requirements</h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Review carefully</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPERT_TERMS.map(term => (
                  <div key={term.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-500">
                      {term.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{term.label}</p>
                      <p className="text-sm font-semibold text-gray-900">{term.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Rates and terms are negotiable. Use the chat below to discuss adjustments before confirming.
                </p>
              </div>
            </div>

            {/* Negotiation Chat */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Negotiation Chat</h3>
                  <p className="text-xs text-gray-400">Discuss terms, scope, and pricing directly with the expert</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Expert online</span>
                </div>
              </div>

              <div className="h-64 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.from === 'expert' && (
                      <div className={`w-8 h-8 bg-gradient-to-br ${expert.avatarColor} rounded-full flex items-center justify-center flex-shrink-0 mr-2`}>
                        <span className="text-white text-xs font-bold">{expert.avatar}</span>
                      </div>
                    )}
                    <div className={`max-w-[75%] ${msg.from === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.from === 'user'
                          ? 'bg-gray-900 text-white rounded-tr-sm'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                    {msg.from === 'user' && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message to negotiate terms..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Right / Sticky Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">

            {/* Pricing Breakdown */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4">Pricing Breakdown</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>${expert.hourlyRate}/hr × {hoursPerWeek} hrs/wk</span>
                  <span className="font-medium text-gray-900">${(expert.hourlyRate * hoursPerWeek).toLocaleString()}/wk</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>× {duration} {engagementType === 'monthly' ? `month${duration > 1 ? 's' : ''}` : `week${duration > 1 ? 's' : ''}`}</span>
                  {engagementType === 'monthly' && (
                    <span className="text-xs text-gray-400">(×4 wks/month)</span>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">${totalCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500 text-xs">
                  <span>Platform fee (8%)</span>
                  <span>${platformFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-black text-gray-900">${grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-xl flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-700">Payment is held in escrow and released on milestone approval.</p>
              </div>
            </div>

            {/* What's included */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">What's Included</h3>
              <ul className="space-y-2">
                {[
                  'Dedicated expert for your project',
                  'Weekly progress reports',
                  'Direct Slack/video access',
                  'Milestone-based payments',
                  'Satisfaction guarantee',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Hire CTA */}
            <button
              onClick={handleHire}
              disabled={isHiring}
              className="w-full py-4 bg-gray-900 hover:bg-gray-800 disabled:opacity-70 text-white font-black rounded-2xl transition-all hover:shadow-xl hover:shadow-gray-900/20 flex items-center justify-center gap-2 text-sm"
            >
              {isHiring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Hire {expert.name.split(' ')[0]} — ${grandTotal.toLocaleString()}
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              By hiring, you agree to Karya AI's <span className="underline cursor-pointer">terms of service</span>. No charges until expert accepts.
            </p>

            <Link
              href={`/expert-profile/${expertId}`}
              className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
