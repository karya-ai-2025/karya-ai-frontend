'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, UserCheck, Loader2, Sparkles } from 'lucide-react';

/**
 * EmailDraftReview — shown in the MIDDLE of the campaigns page after the email
 * assistant drafts a message. Two decisions:
 *   1. Looks good → start campaign  (saves the email + opens the builder)
 *   2. Get an expert to refine it   (sends the draft to the expert review queue)
 */
export default function EmailDraftReview({ draft, onAccept, onRequestExpert, busy }) {
  const [action, setAction] = useState(null); // 'accept' | 'expert'

  const handleAccept = async () => {
    setAction('accept');
    try { await onAccept?.(); } finally { setAction(null); }
  };
  const handleExpert = async () => {
    setAction('expert');
    try { await onRequestExpert?.(); } finally { setAction(null); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
          <Sparkles className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">Your draft email is ready</h2>
          <p className="text-xs text-gray-500">Review it, then choose how to proceed.</p>
        </div>
      </div>

      {/* Draft card */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 text-xs font-semibold text-gray-500">
          <Mail className="h-4 w-4 text-indigo-600" /> Draft email
        </div>
        <div className="px-5 py-4">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Subject</p>
          <p className="mb-3 text-[15px] font-semibold text-gray-900">{draft?.subject || '—'}</p>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Body</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{draft?.body}</p>
        </div>
      </div>

      {/* Decisions */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleAccept}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {action === 'accept' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Looks good — start campaign
        </button>
        <button
          onClick={handleExpert}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {action === 'expert' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
          Get an expert to refine it
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-gray-400">
        “Start campaign” saves this email and opens the campaign builder. “Get an expert” sends it to a
        specialist who refines it and sends it back for your approval.
      </p>
    </div>
  );
}
