'use client';

import { useParams, useRouter } from 'next/navigation';
import ICPPanel from '@/components/Projects/HotLeadInBox/ICP';
import TabGuard from '@/components/Projects/HotLeadInBox/TabGuard';
import { icpPath } from '@/components/Projects/workspaceRoutes';

export default function IcpPage() {
  const { slug } = useParams();
  const router = useRouter();

  // ICPs belong to campaigns, so TAB_REQUIRES gates this on campaign access.
  return (
    <TabGuard tab="icp" tabName="Ideal Customer Profiles" unlockedIn="Lead Generation">
      <ICPPanel onToggle={(campaignId) => router.push(icpPath(slug, campaignId))} />
    </TabGuard>
  );
}
