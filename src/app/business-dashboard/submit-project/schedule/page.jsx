'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { createSubmission } from '@/lib/submissionApi';
import { ArrowLeft, CheckCircle2, Loader2, Clock } from 'lucide-react';

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '2:00 PM',  '3:00 PM',
  '4:00 PM',  '5:00 PM',
];

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function formatDisplayDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ScheduleCallPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('submit-project');

  const [date, setDate]         = useState('');
  const [time, setTime]         = useState('');
  const [title, setTitle]       = useState('');
  const [notes, setNotes]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  if (!authLoading && !isAuthenticated) { router.push('/login'); return null; }

  const canSubmit = date && time && title.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      await createSubmission({
        submissionType: 'call',
        title: title.trim(),
        scheduledCall: { date, time, notes: notes.trim(), timezone: 'Asia/Kolkata' },
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 text-center max-w-md w-full">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Call Scheduled!</h2>
              <div className="bg-gray-50 rounded-xl p-4 mb-5 text-left">
                <p className="text-xs text-gray-400 mb-1">Booked for</p>
                <p className="text-sm font-semibold text-gray-800">{formatDisplayDate(date)}</p>
                <p className="text-sm text-gray-600">{time} IST</p>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                You'll receive a confirmation email with the meeting link shortly.
              </p>
              <div className="flex flex-col gap-2">
                <button onClick={() => router.push('/business-dashboard/my-submissions')}
                  className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                  View My Submissions
                </button>
                <button onClick={() => router.push('/business-dashboard')}
                  className="w-full py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                  Back to Dashboard
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} activeItem={activeItem} setActiveItem={setActiveItem} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl mx-auto">

            <button onClick={() => router.push('/business-dashboard/submit-project')}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Schedule a Call</h1>
              <p className="text-sm text-gray-500">
                Pick a time and we'll call you to discuss your project. The call is 30 minutes.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">

              {/* Project title */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Lead Generation for my SaaS product"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" />
              </div>

              {/* Date picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Preferred Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={getMinDate()}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white"
                />
                {date && (
                  <p className="text-xs text-blue-600 mt-1">{formatDisplayDate(date)}</p>
                )}
              </div>

              {/* Time slots */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Preferred Time (IST) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl text-xs font-medium border transition-colors ${
                        time === slot
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Tell us a bit about your project</label>
                <p className="text-xs text-gray-400 mb-1.5">So we come prepared to the call</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. I run a B2B SaaS for HR teams, looking to generate leads in the IT sector..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking…</> : 'Confirm Booking'}
              </button>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
