'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CalBooking from '@/components/scheduling/CalBooking';
import { trackEvent } from '@/services/analyticsApi';
import {
  Play,
  ArrowRight,
  CheckCircle,
  Calendar,
  FileEdit,
  Video,
} from 'lucide-react';

function WelcomeExpert() {
  const router = useRouter();
  useAuth();
  const [showOptions, setShowOptions]     = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  const handleSkip             = () => router.replace('/expert-dashboard');
  const handleStartOnboarding  = () => setShowOptions(true);
  const handleManualOnboarding = () => {
    trackEvent('ONBOARDING_STARTED', { role: 'expert', method: 'manual' });
    router.replace('/onboarding-expert/profile-setup');
  };
  const handleScheduleCall = () => {
    trackEvent('ONBOARDING_STARTED', { role: 'expert', method: 'schedule' });
    setShowScheduler(true);
  };

  const priorityItems = [
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Showcase your skills, experience & portfolio' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Get matched with the right business clients' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Set your availability, rates & service offerings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full filter blur-xl animate-blob" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-violet-300 rounded-full filter blur-xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Image src="/karya-ai-logo.png" alt="Karya AI" width={48} height={48} className="rounded-xl object-contain" />
            <span className="text-2xl font-bold text-gray-900">Karya-AI</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Welcome, Expert!</h1>
          <p className="text-xl text-gray-600">Let's build your expert profile in minutes</p>
        </div>

        {/* ── Merged: what onboarding covers + how to set up ── */}
        {!showScheduler && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">This onboarding covers:</h2>
              <div className="space-y-4 mb-8">
                {priorityItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="text-blue-500 mt-1">{item.icon}</div>
                    <p className="text-gray-600 text-lg">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  How would you like to set up your profile?
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Manual */}
                  <div
                    onClick={handleManualOnboarding}
                    className="group bg-gray-50 border border-gray-200 rounded-xl p-8 hover:bg-gray-100 transition-all cursor-pointer hover:scale-105"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                      <FileEdit className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Fill Details Manually</h3>
                    <p className="text-gray-600 mb-4">
                      Complete your expert profile step-by-step. Add your skills, portfolio, and services.
                    </p>
                    <ul className="space-y-2 mb-6">
                      {['Quick and easy', 'Immediate access', 'Full control over your profile'].map(t => (
                        <li key={t} className="flex items-center gap-2 text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm">{t}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 group-hover:from-blue-700 group-hover:to-orange-600 transition-all">
                      Start Now <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Schedule */}
                  <div
                    onClick={handleScheduleCall}
                    className="group bg-gray-50 border border-gray-200 rounded-xl p-8 hover:bg-gray-100 transition-all cursor-pointer hover:scale-105"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Schedule a Call</h3>
                    <p className="text-gray-600 mb-4">
                      Talk to our team. We'll understand your expertise and set up your profile for you.
                    </p>
                    <ul className="space-y-2 mb-6">
                      {['30-minute session', 'We build your profile', 'Flexible timing'].map(t => (
                        <li key={t} className="flex items-center gap-2 text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm">{t}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 group-hover:from-blue-700 group-hover:to-orange-600 transition-all">
                      Schedule Now <Calendar className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Call booking (Cal.com) ── */}
        {showScheduler && (
          <CalBooking
            onClose={() => setShowScheduler(false)}
            onDone={() => router.replace('/expert-dashboard')}
            onBooked={() => trackEvent('ONBOARDING_CALL_BOOKED', { role: 'expert' })}
          />
        )}

        {/* Bottom skip */}
        {!showScheduler && (
          <div className="mt-8 text-center">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              I'll set this up later →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -50px) scale(1.1); }
          66%       { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

export default WelcomeExpert;
