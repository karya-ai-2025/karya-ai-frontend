'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Old workspace route — permanently redirected to the new my-projects workspace.
export default function ProjectWorkspaceRedirect() {
  const { projectId } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (projectId) {
      router.replace(`/business-dashboard/my-projects/${projectId}`);
    } else {
      router.replace('/business-dashboard/my-projects');
    }
  }, [projectId, router]);

  return null;
}
