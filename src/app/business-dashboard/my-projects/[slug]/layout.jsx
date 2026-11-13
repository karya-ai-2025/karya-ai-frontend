'use client';

import { use } from 'react';
import HotLeadInBox from '@/components/Projects/HotLeadInBox';
import { getProjectMetadata } from '@/components/Projects';
import { isWorkspaceSlug } from '@/components/Projects/workspaceRoutes';

/**
 * Layout for a purchased project.
 *
 * For workspace projects (HotLead family) this renders the shell — sidebar,
 * top nav and AI assistant — once, and every tab route renders inside it. The
 * shell stays mounted across tab changes, so switching tabs doesn't refetch the
 * dashboard or lose the assistant conversation.
 *
 * Every other slug (ContentProject, the generic workspace, anything unowned)
 * passes straight through, because those pages bring their own chrome.
 */
export default function ProjectLayout({ children, params }) {
  const { slug } = use(params);

  if (!isWorkspaceSlug(slug)) return children;

  return (
    <HotLeadInBox projectMetadata={getProjectMetadata(slug)} projectSlug={slug}>
      {children}
    </HotLeadInBox>
  );
}
