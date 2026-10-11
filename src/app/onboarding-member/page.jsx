'use client';

// Onboarding for someone who joined a company through an invitation.
//
// The company itself is already set up by its admin, so there is nothing to
// configure here — this is a short orientation: which company they joined,
// what their role lets them do, and a way into the workspace. Business owners
// signing up themselves go through /onboarding-owner instead.

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, Check, X, UsersRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ROLE_LABEL = { admin: 'Admin', manager: 'Manager', employee: 'Employee' };

// What a new member most needs to know, in the order they will meet it.
// Each line is shown as allowed or not, straight from their capability list.
const CAPABILITY_LINES = [
  { capability: 'campaign.create', label: 'Build email campaigns and templates' },
  { capability: 'leads.search', label: 'Search for leads and save lead lists' },
  { capability: 'campaign.start', label: 'Start campaigns', without: 'Submit campaigns to a manager for approval before they go out' },
  { capability: 'campaign.approve', label: "Approve your team's campaigns" },
  { capability: 'leads.export', label: 'Export leads' },
  { capability: 'members.invite', label: 'Invite people to the team' },
  { capability: 'billing.manage', label: 'Buy plans, projects and credits' },
];

export default function MemberOnboardingPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, isEnterprise, organization, can } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    // Only invited members of a company belong here.
    if (!isEnterprise) router.replace('/business-dashboard');
  }, [loading, isAuthenticated, isEnterprise, router]);

  if (loading || !isEnterprise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
      </div>
    );
  }

  const firstName = (user?.fullName || '').trim().split(' ')[0];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Image src="/karya-ai-logo.png" alt="Karya AI" width={44} height={44} className="rounded-xl object-contain" />
          <span className="text-xl font-black text-gray-900">Karya-AI</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            Welcome{firstName ? `, ${firstName}` : ''}!
          </h1>
          <p className="text-gray-500 mb-6">Your account is ready. Here&apos;s how you fit into the team.</p>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-900">{organization.name}</p>
              <p className="text-xs text-blue-800">You joined as {ROLE_LABEL[organization.role] || organization.role}</p>
            </div>
          </div>

          <h2 className="text-sm font-bold text-gray-900 mb-3">What you can do</h2>
          <ul className="space-y-2 mb-6">
            {CAPABILITY_LINES.map((line) => {
              const allowed = can(line.capability);
              // Some limits come with a path forward; show that instead of a bare "no".
              if (!allowed && line.without) {
                return (
                  <li key={line.capability} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    {line.without}
                  </li>
                );
              }
              return (
                <li key={line.capability} className={`flex items-start gap-2 text-sm ${allowed ? 'text-gray-700' : 'text-gray-400'}`}>
                  {allowed
                    ? <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    : <X className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />}
                  {line.label}
                </li>
              );
            })}
          </ul>

          <p className="text-xs text-gray-500 mb-6">
            Your team shares one plan and one pool of credits, and everyone works from the same company profile.
            An admin can change your role at any time.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.replace('/business-dashboard')}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
            >
              Go to dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.replace('/business-dashboard/team')}
              className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <UsersRound className="w-4 h-4" /> Meet the team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
