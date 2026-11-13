'use client';

import { useParams, useRouter } from 'next/navigation';
import { UserCheck } from 'lucide-react';
import CreateCampaign from '@/components/Projects/HotLeadInBox/Campaign/CreateCampaign';
import EmailDraftReview from '@/components/Projects/HotLeadInBox/Campaign/EmailDraftReview';
import { useCampaigns } from '@/components/Projects/HotLeadInBox/Campaign/CampaignContext';
import { useWorkspace } from '@/components/Projects/HotLeadInBox/WorkspaceContext';
import { campaignPaths } from '@/components/Projects/workspaceRoutes';

export default function CreateCampaignPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { fetchDashboardData } = useCampaigns();
  const {
    collapseSidebar, emailDraft, draftBusy, draftNotice, clearDraft,
    handleAcceptDraft, handleRequestExpert,
    prefillTemplate, prefillName, resetPrefill,
  } = useWorkspace();

  const paths = campaignPaths(slug);
  const backToList = () => router.push(paths.list);

  // After "get an expert", show the confirmation instead of the form.
  if (draftNotice) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
          <UserCheck className="h-6 w-6 text-indigo-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Sent to our expert</h2>
        <p className="mt-2 text-sm text-gray-600">{draftNotice}</p>
        <button
          onClick={() => { clearDraft(); backToList(); }}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Back to campaigns
        </button>
      </div>
    );
  }

  // While a fresh AI draft awaits a decision, review it instead of the form.
  if (emailDraft) {
    return (
      <EmailDraftReview
        draft={emailDraft}
        busy={draftBusy}
        onAccept={handleAcceptDraft}
        onRequestExpert={handleRequestExpert}
      />
    );
  }

  return (
    <CreateCampaign
      onCampaignCreated={() => { fetchDashboardData(); resetPrefill(); backToList(); }}
      onCancel={() => { resetPrefill(); backToList(); }}
      onCollapseSidebar={collapseSidebar}
      initialTemplate={prefillTemplate}
      initialName={prefillName}
    />
  );
}
