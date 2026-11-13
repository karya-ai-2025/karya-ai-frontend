'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, RefreshCw, FileText, ArrowLeft, User, Calendar,
  ChevronRight, AlertCircle, FlaskConical,
} from 'lucide-react';
import AdminGuard from '@/components/AdminGuard';
import { fetchTranscripts, TRANSCRIPT_STATUS } from '@/lib/transcriptApi';

const FILTERS = [
  { value: '',          label: 'All' },
  { value: 'extracted', label: 'Needs review' },
  { value: 'applied',   label: 'Applied' },
  { value: 'failed',    label: 'Failed' },
];

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function TranscriptsPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const json = await fetchTranscripts({ status: filter || undefined });
      setRows(json.data || []);
    } catch (e) {
      setError(e.message || 'Could not load transcripts');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const needsReview = rows.filter((r) => r.status === 'extracted').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => router.push('/admin/scheduled-calls')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Scheduled calls
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Call Transcripts
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {needsReview > 0
                ? `${needsReview} extraction${needsReview === 1 ? '' : 's'} waiting for your review.`
                : 'Transcripts from completed onboarding calls.'}
            </p>
          </div>
          <button
            onClick={() => { setLoading(true); load(); }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer w-fit"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                filter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <div className="inline-flex p-3 bg-gray-100 rounded-lg">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">No transcripts</h2>
            <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
              Transcripts appear here after a call is marked complete and the
              pipeline has fetched it from Google Meet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((t) => {
              const meta = TRANSCRIPT_STATUS[t.status] || TRANSCRIPT_STATUS.pending;
              const call = t.scheduledCallId || {};
              const owner = t.userId || {};
              const callId = call._id || t.scheduledCallId;
              return (
                <button
                  key={t._id}
                  onClick={() => router.push(`/admin/transcripts/${callId}`)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.theme}`}>
                          {meta.label}
                        </span>
                        {t.isMock && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border bg-purple-50 text-purple-700 border-purple-200">
                            <FlaskConical className="w-3 h-3" /> Mock data
                          </span>
                        )}
                        {t.extractedData?.confidence && (
                          <span className="text-xs text-gray-400">
                            {t.extractedData.confidence} confidence
                          </span>
                        )}
                      </div>

                      <h3 className="mt-2 font-semibold text-gray-900 flex items-center gap-1.5 truncate">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {owner.fullName || call.name || 'Unknown user'}
                        {owner.email && (
                          <span className="font-normal text-sm text-gray-500 truncate">
                            · {owner.email}
                          </span>
                        )}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        {formatDateTime(call.dateTime || t.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <TranscriptsPage />
    </AdminGuard>
  );
}
