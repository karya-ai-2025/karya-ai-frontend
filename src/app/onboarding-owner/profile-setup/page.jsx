'use client';
// Profile photo is now handled in Settings → Profile Photo.
// Redirect anyone landing here directly to the first onboarding step.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSetupRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/onboarding-owner/platform-usage');
  }, [router]);
  return null;
}
