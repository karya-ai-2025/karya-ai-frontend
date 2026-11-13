'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { fetchSubmission } from '@/lib/submissionApi';
import { ArrowLeft, Loader2, CheckCircle2, Clock, Circle, FileEdit, PhoneCall, ExternalLink } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'submitted',     label: 'Brief Received',     desc: 'We have your project brief.'                         },
  { key: 'under-review',  label: 'Under Review',        desc: 'Our team is reviewing and enriching your brief.'     },
  { key: 'approved',      label: 'Approved',            desc: 'Your project has been approved for the marketplace.' },
  { key: 'published',     label: 'Live on Marketplace', desc: 'Experts can now discover and work on your project.'  },
];

const STATUS_ORDER = { submitted: 0, 'under-review': 1, approved: 2, published: 3, rejected: -1 };

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem]             = useState('my-submissions');
  const [submission, setSubmission]             = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [notFound, setNotFound]                 = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!id) return;
    fetchSubmission(id)
      .then(setSubmission)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const Layout = ({ children }) => (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );

  if (authLoading || loading) return <Layout><div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 text-blue-500 animate-spin" /></div></Layout>;
  if (notFound) return (
    <Layout>
      <div className="text-center py-16">
        <p className="text-sm font-semibold text-gray-700 mb-1">Submission not found</p>
        <button onClick={() => router.push('/business-dashboard/my-submissions')} className="text-sm text-blue-600 hover:underline">← Back</button>
      </div>
    </Layout>
  );

  const currentOrder = STATUS_ORDER[submission.status] ?? 0;
  const isRejected   = submission.status === 'rejected';
  const TypeIcon     = submission.submissionType === 'call' ? PhoneCall : FileEdit;

  return (
    <Layout>
      <button onClick={() => router.push('/business-dashboard/my-submissions')}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> My Submissions
      </button>

      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <TypeIcon className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">{submission.title}</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Submitted on {formatDate(submission.createdAt)} · {submission.submissionType === 'call' ? 'Call booking' : 'Form brief'}
              </p>
            </div>
          </div>

          {/* Rejected banner */}
          {isRejected && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
              <p className="text-xs font-semibold text-red-700 mb-0.5">Submission not approved</p>
              <p className="text-xs text-red-600">{submission.adminNotes || 'Please contact our team for details.'}</p>
            </div>
          )}

          {/* Published — link to marketplace */}
          {submission.status === 'published' && submission.catalogId && (
            <button onClick={() => router.push(`/project-marketplace/${submission.catalogId}`)}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:underline">
              <ExternalLink className="w-3.5 h-3.5" /> View on Marketplace
            </button>
          )}
        </div>

        {/* Status tracker */}
        {!isRejected && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-5">Status</p>
            <div className="space-y-0">
              {STATUS_STEPS.map((s, idx) => {
                const stepOrder = idx;
                const isDone    = currentOrder > stepOrder;
                const isCurrent = currentOrder === stepOrder;
                const isLast    = idx === STATUS_STEPS.length - 1;
                return (
                  <div key={s.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                        isDone    ? 'bg-green-500 border-green-500 text-white' :
                        isCurrent ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100' :
                                    'bg-white border-gray-200 text-gray-300'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : isCurrent ? <Clock className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                      </div>
                      {!isLast && <div className={`w-0.5 h-8 mt-1 ${isDone ? 'bg-green-200' : 'bg-gray-100'}`} />}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-semibold ${isDone ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-300'}`}>{s.label}</p>
                      <p className={`text-xs mt-0.5 ${isDone ? 'text-green-600' : isCurrent ? 'text-gray-500' : 'text-gray-300'}`}>{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Brief summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Your Brief</p>
          <div className="space-y-3">
            {[
              { label: 'Category',        value: submission.category },
              { label: 'Description',     value: submission.description },
              { label: 'Goals',           value: submission.goals },
              { label: 'Target Audience', value: submission.targetAudience },
              { label: 'Timeline',        value: submission.timeline },
              { label: 'Budget',          value: submission.budget?.min || submission.budget?.max ? `₹${submission.budget.min || '?'} – ₹${submission.budget.max || '?'} ${submission.budget.currency || 'INR'}` : null },
            ].filter(r => r.value).map(r => (
              <div key={r.label} className="flex gap-3">
                <span className="text-xs font-semibold text-gray-400 w-32 shrink-0 pt-0.5">{r.label}</span>
                <span className="text-sm text-gray-700">{r.value}</span>
              </div>
            ))}

            {submission.expertSkillsNeeded?.length > 0 && (
              <div className="flex gap-3">
                <span className="text-xs font-semibold text-gray-400 w-32 shrink-0 pt-0.5">Skills Needed</span>
                <div className="flex flex-wrap gap-1.5">
                  {submission.expertSkillsNeeded.map(t => <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">{t}</span>)}
                </div>
              </div>
            )}
            {submission.toolsUsed?.length > 0 && (
              <div className="flex gap-3">
                <span className="text-xs font-semibold text-gray-400 w-32 shrink-0 pt-0.5">Tools</span>
                <div className="flex flex-wrap gap-1.5">
                  {submission.toolsUsed.map(t => <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">{t}</span>)}
                </div>
              </div>
            )}
            {submission.deliverables?.length > 0 && (
              <div className="flex gap-3">
                <span className="text-xs font-semibold text-gray-400 w-32 shrink-0 pt-0.5">Deliverables</span>
                <div className="flex flex-wrap gap-1.5">
                  {submission.deliverables.map(t => <span key={t} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">{t}</span>)}
                </div>
              </div>
            )}

            {/* Call booking info */}
            {submission.submissionType === 'call' && submission.scheduledCall?.date && (
              <div className="flex gap-3">
                <span className="text-xs font-semibold text-gray-400 w-32 shrink-0 pt-0.5">Scheduled Call</span>
                <span className="text-sm text-gray-700">
                  {formatDate(submission.scheduledCall.date)} at {submission.scheduledCall.time} IST
                </span>
              </div>
            )}
            {submission.submissionType === 'call' && submission.scheduledCall?.notes && (
              <div className="flex gap-3">
                <span className="text-xs font-semibold text-gray-400 w-32 shrink-0 pt-0.5">Notes</span>
                <span className="text-sm text-gray-700">{submission.scheduledCall.notes}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
