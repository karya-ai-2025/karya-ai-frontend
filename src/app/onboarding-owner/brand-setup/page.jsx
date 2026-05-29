'use client';
// Logo upload is now part of the Company Details step (Step 2).
// Redirect anyone landing here directly to the ICP definition step.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BrandSetupRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/onboarding-owner/icp-definition');
  }, [router]);
  return null;
}
