'use client';

import { useState, useEffect } from 'react';
import {
  Video, CheckCircle, Clock, RefreshCw,
  Loader2, Calendar, Mail, User, ExternalLink, PhoneCall,
} from 'lucide-react';
import { getAllScheduledCalls, markCallComplete } from '@/lib/scheduledCallsApi';

const SOURCE_LABEL = {
  'onboarding-owner':  { label: 'Business Owner', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  'onboarding-expert': { label: 'Expert',          color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function ScheduledCallsPage() {
  const [calls, setCalls]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter]             = useState('all');

  const load = () => {
    setLoading(true);
    getAllScheduledCalls()
      .then(setCalls)
      .catch(() => setCalls([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleComplete = async (id) => {
    if (!confirm('Mark this call as completed? This will trigger transcript processing in ~20 minutes.')) return;
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const updated = await markCallComplete(id);
      setCalls(prev => prev.map(c => c._id === id ? { ...c, ...updated } : c));
    } catch {
      // keep state on error
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const counts = {
    all:       calls.length,
    upcoming:  calls.filter(c => !c.completedAt).length,
    completed: calls.filter(c =>  c.completedAt).length,
  };

  const visible = filter === 'all'       ? calls
    : filter === 'upcoming'  ? calls.filter(c => !c.completedAt)
    : calls.filter(c => c.completedAt);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scheduled Calls</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Join onboarding calls and mark them complete to trigger transcript processing
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 rounded-xl px-3 py-2 hover:border-blue-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all',       label: 'All',       count: counts.all },
            { key: 'upcoming',  label: 'Upcoming',  count: counts.upcoming },
            { key: 'completed', label: 'Completed', count: counts.completed },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs font-bold ${filter === tab.key ? 'opacity-80' : 'text-gray-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <PhoneCall className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="font-semibold text-gray-400">No calls found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map(call => {
              const src     = SOURCE_LABEL[call.source] || SOURCE_LABEL['onboarding-owner'];
              const isActing = actionLoading[call._id];
              const isDone   = !!call.completedAt;

              return (
                <div key={call._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                  {/* Card header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(call.name || call.userId?.fullName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {call.name || call.userId?.fullName || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {call.email || call.userId?.email || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${src.color}`}>
                        {src.label}
                      </span>
                      {isDone ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Completed
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Upcoming
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    {/* Date + time */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="font-medium">{formatDateTime(call.dateTime)}</span>
                      <span className="text-gray-400 text-xs">({call.timezone || 'UTC'})</span>
                    </div>

                    {/* Meet link */}
                    {call.meetLink ? (
                      <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
                        <Video className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-blue-700 font-medium flex-1 truncate">{call.meetLink}</span>
                        <a
                          href={call.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Join Call
                        </a>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm text-gray-400">
                        No Meet link (booked in mock mode)
                      </div>
                    )}

                    {/* Completed state */}
                    {isDone ? (
                      <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700">
                        <p className="font-semibold mb-0.5">Call completed</p>
                        <p className="text-xs text-green-600">
                          Marked complete at {formatDateTime(call.completedAt)} —
                          transcript processing will begin shortly, profile update within 4–5 hours.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleComplete(call._id)}
                        disabled={isActing || !call.meetLink}
                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        {isActing
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <CheckCircle className="w-4 h-4" />}
                        Mark as Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
