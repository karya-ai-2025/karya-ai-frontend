'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { FileEdit, PhoneCall, Sparkles, ArrowRight, Lock } from 'lucide-react';

const OPTIONS = [
  {
    id: 'form',
    icon: FileEdit,
    title: 'Fill the Brief',
    description: 'Answer a few structured questions about your project. Takes about 5 minutes.',
    cta: 'Start Form',
    href: '/business-dashboard/submit-project/form',
    available: true,
    color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    ctaColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    id: 'call',
    icon: PhoneCall,
    title: 'Schedule a Call',
    description: "Prefer to talk it through? Book a 30-min call and our team will handle the rest.",
    cta: 'Book a Call',
    href: '/business-dashboard/submit-project/schedule',
    available: true,
    color: 'border-green-200 hover:border-green-400 hover:bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    ctaColor: 'bg-green-600 hover:bg-green-700',
  },
  {
    id: 'ai',
    icon: Sparkles,
    title: 'Tell Our AI Agent',
    description: 'Chat with our AI, explain your project in plain words, and it auto-fills everything for you.',
    cta: 'Coming Soon',
    href: null,
    available: false,
    color: 'border-gray-100 bg-gray-50 opacity-70 cursor-not-allowed',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-400',
    ctaColor: 'bg-gray-300 cursor-not-allowed',
  },
];

export default function SubmitProjectPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('submit-project');

  if (loading) return null;
  if (!loading && !isAuthenticated) { router.push('/login'); return null; }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Project</h1>
              <p className="text-sm text-gray-500">
                Share your project idea with us. Once reviewed, we'll publish it to the marketplace
                so the right experts can work on it.
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.id}
                    className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col transition-all ${opt.color}`}
                  >
                    {!opt.available && (
                      <div className="absolute top-3 right-3">
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    )}

                    <div className={`w-10 h-10 rounded-xl ${opt.iconBg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-5 h-5 ${opt.iconColor}`} />
                    </div>

                    <h2 className="text-sm font-bold text-gray-900 mb-1">{opt.title}</h2>
                    <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-5">{opt.description}</p>

                    <button
                      onClick={() => opt.available && opt.href && router.push(opt.href)}
                      disabled={!opt.available}
                      className={`w-full py-2 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${opt.ctaColor}`}
                    >
                      {opt.cta}
                      {opt.available && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* What happens after */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">What happens after you submit</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { step: '1', label: 'We review your brief', desc: 'Our team reviews within 24–48 hours' },
                  { step: '2', label: 'We enrich & structure it', desc: 'We add pricing tiers, phases and expert requirements' },
                  { step: '3', label: 'Goes live on marketplace', desc: 'Experts apply, other businesses can also join' },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {s.step}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{s.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
