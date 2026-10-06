'use client';

import { useParams, useRouter } from 'next/navigation';
import CampaignDashboard from '@/components/Projects/HotLeadInBox/Campaign/CampaignDashboard';
import { useCampaigns } from '@/components/Projects/HotLeadInBox/Campaign/CampaignContext';
import { useWorkspace } from '@/components/Projects/HotLeadInBox/WorkspaceContext';
import { campaignPaths } from '@/components/Projects/workspaceRoutes';

export default function CampaignListPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { campaignStats, loading, error, fetchDashboardData } = useCampaigns();
  const { collapseSidebar, openAgent } = useWorkspace();
  const paths = campaignPaths(slug);

  return (
    <CampaignDashboard
      campaignStats={campaignStats}
      loading={loading}
      error={error}
      onCreateCampaign={() => { openAgent('email'); router.push(paths.create); }}
      onManageTemplates={() => router.push(paths.templates)}
      onViewCampaignStats={(c) => router.push(paths.stats(c._id || c.id))}
      onEditCampaign={(c) => router.push(paths.edit(c._id || c.id))}
      onRefresh={fetchDashboardData}
      onCollapseSidebar={collapseSidebar}
    />
  );
}
