'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProjectRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/create-project'); }, [router]);
  return null;
}
