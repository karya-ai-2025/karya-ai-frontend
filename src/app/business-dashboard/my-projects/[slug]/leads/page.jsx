'use client';

import LeadGeneration from '@/components/Projects/HotLeadInBox/LeadGeneration';
import TabGuard from '@/components/Projects/HotLeadInBox/TabGuard';
import { useWorkspace } from '@/components/Projects/HotLeadInBox/WorkspaceContext';

export default function LeadsPage() {
  const { projectSlug, agentResult, collapseSidebar, expandSidebar } = useWorkspace();

  return (
    <TabGuard tab="leads" tabName="Lead Generation" unlockedIn="Email Campaigns">
      <LeadGeneration
        onCollapseSidebar={collapseSidebar}
        onExpandSidebar={expandSidebar}
        injectedResult={agentResult}
        projectSlug={projectSlug}
      />
    </TabGuard>
  );
}
