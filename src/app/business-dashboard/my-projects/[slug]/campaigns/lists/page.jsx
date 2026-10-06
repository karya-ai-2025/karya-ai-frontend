'use client';

import { useParams, useRouter } from 'next/navigation';
import CRMListManager from '@/components/Projects/HotLeadInBox/Campaign/CRMListManager';
import { useWorkspace } from '@/components/Projects/HotLeadInBox/WorkspaceContext';
import { campaignPaths } from '@/components/Projects/workspaceRoutes';

export default function EmailListsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { collapseSidebar } = useWorkspace();

  return (
    <CRMListManager
      onBack={() => router.push(campaignPaths(slug).list)}
      onCollapseSidebar={collapseSidebar}
    />
  );
}
