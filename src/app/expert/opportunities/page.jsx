'use client';
import { Target, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ExpertPageWrapper from '@/components/expert/ExpertPageWrapper';

export default function ExpertOpportunitiesPage() {
  const router = useRouter();
  return (
    <ExpertPageWrapper activeNav="opportunities">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Opportunities</h1>
        <p className="text-gray-500 text-sm mb-8">Project matches based on your profile will appear here</p>

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
      </div>
    </ExpertPageWrapper>
  );
}
