'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { fetchMySubmissions } from '@/lib/submissionApi';
import { ClipboardList, ArrowRight, FileEdit, PhoneCall, Clock, PlusCircle } from 'lucide-react';

const STATUS_STYLE = {
  submitted:    { label: 'Submitted',    class: 'bg-blue-50 text-blue-700 border-blue-200' },
  'under-review': { label: 'Under Review', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved:     { label: 'Approved',     class: 'bg-green-50 text-green-700 border-green-200' },
  rejected:     { label: 'Rejected',     class: 'bg-red-50 text-red-700 border-red-200' },
  published:    { label: 'Published',    class: 'bg-violet-50 text-violet-700 border-violet-200' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MySubmissionsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('my-submissions');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    fetchMySubmissions()
      .then(setSubmissions)
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">My Submissions</h1>
            </div>
            <button
              onClick={() => router.push('/business-dashboard/submit-project')}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> New Submission
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700 mb-1">No submissions yet</p>
              <p className="text-xs text-gray-400 mb-5">Submit your first project brief and we'll get it on the marketplace.</p>
              <button onClick={() => router.push('/business-dashboard/submit-project')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Submit a Project <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map(s => {
                const status = STATUS_STYLE[s.status] || STATUS_STYLE.submitted;
                const TypeIcon = s.submissionType === 'call' ? PhoneCall : FileEdit;
                return (
                  <div
                    key={s._id}
                    onClick={() => router.push(`/business-dashboard/my-submissions/${s._id}`)}
                    className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-sm cursor-pointer transition-shadow group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="w-4 h-4 text-gray-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {s.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-300" />
                        <span className="text-xs text-gray-400">{formatDate(s.createdAt)}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400 capitalize">{s.submissionType === 'call' ? 'Call booking' : 'Form brief'}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${status.class}`}>
                      {status.label}
                    </span>

                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
