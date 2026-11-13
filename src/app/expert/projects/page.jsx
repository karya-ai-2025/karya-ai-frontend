'use client';
import { Briefcase, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ExpertPageWrapper from '@/components/expert/ExpertPageWrapper';

export default function ExpertProjectsPage() {
  const router = useRouter();
  return (
    <ExpertPageWrapper activeNav="projects">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Active Projects</h1>
        <p className="text-gray-500 text-sm mb-8">Projects you are currently working on will appear here</p>

        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
          <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-400 mb-2">No active projects yet</p>
          <p className="text-sm text-gray-400 mb-6">Browse the marketplace to find projects that match your skills</p>
          <button
            onClick={() => router.push('/project-marketplace')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-orange-500 hover:opacity-90 text-white font-semibold rounded-xl text-sm transition"
          >
            <Layers className="w-4 h-4" /> Explore Marketplace
          </button>
        </div>
      </div>
    </ExpertPageWrapper>
  );
}
