'use client';
import { useState, useEffect } from 'react';
import { Target, User, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ExpertPageWrapper from '@/components/expert/ExpertPageWrapper';
import { getExpertOnboardingStatus } from '@/services/expertonboardingApi';

export default function ExpertOpportunitiesPage() {
  const router = useRouter();
  const [completion, setCompletion] = useState(null); // null = loading

  useEffect(() => {
    getExpertOnboardingStatus()
      .then((res) => {
        const ob = res?.onboarding || {};
        const TOTAL_STEPS = 4; // profile-setup, skills, services, portfolio
        setCompletion(ob.completed ? 100 : Math.round(((ob.currentStep || 0) / TOTAL_STEPS) * 100));
      })
      .catch(() => setCompletion(0));
  }, []);

  const profileDone = (completion ?? 0) >= 60;

  return (
    <ExpertPageWrapper activeNav="opportunities">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Opportunities</h1>
        <p className="text-gray-500 text-sm mb-8">Project matches based on your profile will appear here</p>

        {completion === null ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
          </div>
        ) : profileDone ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
            <p className="font-semibold text-gray-700 mb-2">You're all set</p>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Thank you for completing your profile — we'll contact you as soon as a project arrives that matches your skills.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
            <Target className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="font-semibold text-gray-400 mb-2">No opportunities yet</p>
            <p className="text-sm text-gray-400 mb-6">Complete your profile so we can match you with the right clients</p>
            <button
              onClick={() => router.push('/onboarding-expert/profile-setup')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:opacity-90 text-white font-semibold rounded-xl text-sm transition"
            >
              <User className="w-4 h-4" /> Complete Profile
            </button>
          </div>
        )}
      </div>
    </ExpertPageWrapper>
  );
}
