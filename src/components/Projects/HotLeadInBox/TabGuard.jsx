'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from './WorkspaceContext';
import { LockedTab } from './shared';
import { TAB_REQUIRES, workspacePath } from '../workspaceRoutes';

/**
 * Gate for a workspace tab page.
 *
 * Two different "no" answers, deliberately handled differently:
 *
 * - The slug has no such tab at all (someone typed /brand-voice-social/leads,
 *   or a project that isn't a workspace project). There is nothing to show, so
 *   redirect to the project root rather than leave them on a dead URL.
 *
 * - The tab exists for this project but the user's plan doesn't include it.
 *   That's the upgrade path, so render the existing LockedTab screen.
 */
export default function TabGuard({ tab, unlockedIn, tabName, children }) {
  const router = useRouter();
  const { projectSlug, access } = useWorkspace();

  const requires = TAB_REQUIRES[tab];
  // `undefined` means this tab isn't part of the workspace at all.
  const tabExists = Object.prototype.hasOwnProperty.call(TAB_REQUIRES, tab);
  const allowed = !requires || !!access?.[requires];

  useEffect(() => {
    if (!tabExists) router.replace(workspacePath(projectSlug, 'dashboard'));
  }, [tabExists, router, projectSlug]);

  if (!tabExists) return null;           // redirect in flight
  if (!allowed) {
    return <LockedTab tabName={tabName || tab} unlockedIn={unlockedIn} />;
  }
  return children;
}
