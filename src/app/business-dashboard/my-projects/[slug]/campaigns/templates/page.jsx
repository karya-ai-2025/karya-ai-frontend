'use client';

import { useParams, useRouter } from 'next/navigation';
import EmailTemplateBuilder from '@/components/Projects/HotLeadInBox/Campaign/EmailTemplateBuilder';
import { useWorkspace } from '@/components/Projects/HotLeadInBox/WorkspaceContext';
import { campaignPaths } from '@/components/Projects/workspaceRoutes';

export default function TemplatesPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { collapseSidebar } = useWorkspace();

  return (
    <EmailTemplateBuilder
      onBack={() => router.push(campaignPaths(slug).list)}
      onCollapseSidebar={collapseSidebar}
    />
  );
}
