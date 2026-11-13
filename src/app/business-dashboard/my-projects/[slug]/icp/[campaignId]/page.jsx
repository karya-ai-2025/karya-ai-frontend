'use client';

import { useParams, useRouter } from 'next/navigation';
import ICPPanel from '@/components/Projects/HotLeadInBox/ICP';
import TabGuard from '@/components/Projects/HotLeadInBox/TabGuard';
import { icpPath, workspacePath } from '@/components/Projects/workspaceRoutes';

/**
 * One ICP, addressed by its campaign id. Renders the same list with that card
 * expanded, so the page looks identical but can be refreshed, shared and linked
 * to — including from the admin ICP screen.
 */
export default function IcpDetailPage() {
  const { slug, campaignId } = useParams();
  const router = useRouter();

  return (
    <TabGuard tab="icp" tabName="Ideal Customer Profiles" unlockedIn="Lead Generation">
      <ICPPanel
        expandedId={String(campaignId)}
        onToggle={(id, isOpen) =>
          // Collapsing the open card goes back to the plain list.
          router.push(isOpen ? workspacePath(slug, 'icp') : icpPath(slug, id))
        }
      />
    </TabGuard>
  );
}
