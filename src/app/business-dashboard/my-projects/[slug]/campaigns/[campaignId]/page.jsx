'use client';

import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import CampaignStats from '@/components/Projects/HotLeadInBox/Campaign/CampaignStats';
import { useCampaign } from '@/components/Projects/HotLeadInBox/Campaign/CampaignContext';
import { campaignPaths } from '@/components/Projects/workspaceRoutes';

export default function CampaignStatsPage() {
  const { slug, campaignId } = useParams();
  const router = useRouter();
  // The id comes from the URL now, so this page fetches the campaign itself —
  // that's what makes refreshing and sharing the link work.
  const { campaign, loading, error } = useCampaign(campaignId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <p className="mt-3 text-gray-700">{error || 'Campaign not found'}</p>
        <button
          onClick={() => router.push(campaignPaths(slug).list)}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium cursor-pointer"
        >
          Back to campaigns
        </button>
      </div>
    );
  }

  return (
    <CampaignStats
      campaign={campaign}
      onBack={() => router.push(campaignPaths(slug).list)}
    />
  );
}
