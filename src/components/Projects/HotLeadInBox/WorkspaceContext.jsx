'use client';

import { createContext, useContext } from 'react';

/**
 * Shared state for the project workspace.
 *
 * Each tab is now its own route, and a Next.js layout cannot pass props down to
 * the page it wraps. So everything the tabs need from the shell — dashboard data,
 * tab access, the AI assistant's hand-offs (agentResult, emailDraft,
 * prefillTemplate) and the sidebar controls — travels through this context
 * instead of through props.
 */
const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ value, children }) {
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

/**
 * Read the workspace state. Throws when used outside the shell, which is almost
 * always a page rendered under the wrong layout.
 */
export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used inside the project workspace layout');
  }
  return ctx;
}

export default WorkspaceContext;
